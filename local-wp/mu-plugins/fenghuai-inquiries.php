<?php
/**
 * Plugin Name:       Fenghuai Inquiries — 询盘持久化与投递
 * Description:       注册 fh_inquiry 文章类型、幂等键 / 发件箱 / 邮件事件三张专用表，提供 WordPress 唯一写入端点 POST /fh/v1/inquiries，并在后台提供询盘管理界面。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Fenghuai Tech
 *
 * ── 设计纪律（见 DECISIONS.md 的 DEC-055 与 outputs/site-launch-plan/02-data-and-inquiry-design.md）──
 *
 * 1. WordPress 是询盘的**唯一写入点**。Next 侧不持有任何数据库凭据，也永不直接读写 wp_* 表，
 *    只能经本插件暴露的 REST 端点转发（浏览器不直连 WP REST）。
 *
 * 2. 询盘的落库**不是**「wp_insert_post + update_post_meta」那么简单：wp_postmeta 没有唯一约束，
 *    给不了「同一幂等键返回同一询盘号」的硬保证，也给不了事务 outbox 需要的唯一性。
 *    所以幂等键、发件箱、邮件事件各自落在**带唯一约束的专用表**里，与 CPT 记录同事务写入。
 *
 * 3. **业务状态与邮件状态分开**，不得折成一个 success=true（设计文档 §L119）。
 *    business_status 后台可改；email_status 只由投递流程写，后台只读。
 *
 * 4. 询盘**不做公开 REST**（设计文档 §L107）。本 CPT show_in_rest=false；
 *    写端点另建命名空间 fh/v1，用**服务密钥**鉴权，未配置密钥时 fail-closed（503）。
 *
 * 5. 事务边界在 WordPress 侧显式 START TRANSACTION / COMMIT / ROLLBACK。
 *    wp_insert_post() 本身不是可回滚的事务单元 —— 它的可回滚性由
 *    scripts/verify-inquiry-backend.py 的「事务探针」实测，不靠读代码断言。
 *
 * 6. ⚠️ 本文件的**源**在 local-wp/mu-plugins/（进 git），wp-data/ 里那份是派生产物。
 *    改完必须跑 `python3 scripts/sync-mu-plugins.py` 同步进容器。
 *    改了 DDL 还要提升 FH_INQUIRY_DB_VERSION，否则 dbDelta 不会重跑。
 */

if (!defined('ABSPATH')) {
    exit;
}

/** 文章类型标识。 */
const FH_INQUIRY_POST_TYPE = 'fh_inquiry';

/** REST 命名空间（与轮毂的 wp/v2 分开，避免误挂到公开内容路由上）。 */
const FH_INQUIRY_REST_NAMESPACE = 'fh/v1';

/** 专用表 schema 版本。**改 DDL 必须提升它**，否则 dbDelta 不重跑。 */
const FH_INQUIRY_DB_VERSION = '1';

/** schema 版本 option 名（幂等闸门）。 */
const FH_INQUIRY_DB_VERSION_OPTION = 'fh_inquiry_db_version';

/** 服务密钥的请求头（WP 会把请求头名归一为小写）。 */
const FH_INQUIRY_SERVICE_KEY_HEADER = 'X-FH-Service-Key';

/** 后台最小权限：查看/处理询盘与管理邮件派发分离。 */
const FH_INQUIRY_CAP_MANAGE = 'edit_fh_inquiries';
const FH_INQUIRY_CAP_DELIVERY = 'manage_fh_inquiry_delivery';
const FH_INQUIRY_CAP_VERSION = '1';
const FH_INQUIRY_CAP_VERSION_OPTION = 'fh_inquiry_cap_version';

/** 邮件提供商事件回调与积压告警。 */
const FH_INQUIRY_ALERT_HOOK = 'fh_inquiry_delivery_alert_tick';
const FH_INQUIRY_ALERT_INTERVAL = 'fh_inquiry_every_5_minutes';
const FH_INQUIRY_WEBHOOK_MAX_AGE = 300;

/** 数据保留清理：默认关闭；只有明确配置天数后才允许执行。 */
const FH_INQUIRY_RETENTION_HOOK = 'fh_inquiry_retention_tick';
const FH_INQUIRY_RETENTION_BATCH = 100;

/* ============================================================================
 * 表名
 * ========================================================================== */

function fh_inquiry_key_table(): string
{
    global $wpdb;
    return $wpdb->prefix . 'fh_inquiry_key';
}

function fh_inquiry_outbox_table(): string
{
    global $wpdb;
    return $wpdb->prefix . 'fh_inquiry_outbox';
}

function fh_inquiry_event_table(): string
{
    global $wpdb;
    return $wpdb->prefix . 'fh_inquiry_event';
}

/* ============================================================================
 * 字段定义
 * ========================================================================== */

/** 客户类型枚举。 */
function fh_inquiry_customer_type_options(): array
{
    return ['business' => '企业 / 贸易商', 'individual' => '个人 / 零售'];
}

/** 产品线枚举（与四产品线页面一致）。 */
function fh_inquiry_product_line_options(): array
{
    return [
        'wheels'          => '轮毂',
        'ev-components'   => '三电铝件',
        'custom-aluminum' => '定制铝件',
        'safety-tires'    => '自密封轮胎',
    ];
}

/** 业务状态（后台可改）。 */
function fh_inquiry_business_status_options(): array
{
    return [
        'new'       => '新询盘',
        'assigned'  => '已分配',
        'contacted' => '已联系',
        'closed'    => '已关闭',
        'spam'      => '垃圾',
    ];
}

/** 邮件状态（只读，由投递流程写）。 */
function fh_inquiry_email_status_options(): array
{
    return [
        'pending'   => '待发送',
        'sending'   => '发送中',
        'accepted'  => '提供商已接受',
        'delivered' => '已投递',
        'bounced'   => '退信',
        'failed'    => '失败',
        'unknown'   => '未知',
    ];
}

/**
 * 客户提交的输入字段（长度上限与 validate.ts 对齐）。
 *
 * @return array<string, array{label:string, max:int}>
 */
function fh_inquiry_input_fields(): array
{
    return [
        'customer_type'    => ['label' => '客户类型',   'max' => 16],
        'product_line'     => ['label' => '产品线',     'max' => 32],
        'message'          => ['label' => '需求描述',   'max' => 5000],
        'quantity'         => ['label' => '数量',       'max' => 40],
        'inputs_available' => ['label' => '现有输入',   'max' => 500],
        'name'             => ['label' => '联系人',     'max' => 120],
        'email'            => ['label' => '邮箱',       'max' => 200],
        'country_code'     => ['label' => '国家/地区',  'max' => 8],
        'company'          => ['label' => '公司',       'max' => 160],
        'whatsapp'         => ['label' => 'WhatsApp',   'max' => 40],
    ];
}

/**
 * 上下文快照字段（服务端从来源页与目录复核得来，客户不可直接改）。
 *
 * @return array<string, string> 字段名 => 标签
 */
function fh_inquiry_context_fields(): array
{
    return [
        'context_model'            => '来源型号',
        'context_production_code'  => '来源生产代码',
        'context_spec_json'        => '规格快照（JSON）',
        'context_source_page'      => '来源页',
        'context_product_line_raw' => '产品线（原始值）',
        'context_intent'           => '意图',
        'variant_pending'          => '配置待确认',
    ];
}

/** 不可变多产品清单快照（由 Next 服务端复核后写入）。 */
function fh_inquiry_item_snapshot_fields(): array
{
    return ['inquiry_items_json' => '轮毂询价清单（JSON 快照）'];
}

/**
 * 业务状态字段（后台可改）。
 *
 * @return array<string, array{label:string, options:array<string,string>|null}>
 */
function fh_inquiry_business_fields(): array
{
    return [
        'business_status' => ['label' => '业务状态', 'options' => fh_inquiry_business_status_options()],
        'assigned_to'     => ['label' => '负责人',   'options' => null],
        'internal_note'   => ['label' => '内部备注', 'options' => null],
    ];
}

/**
 * 邮件状态字段（后台只读，只有投递流程能写）。
 *
 * @return array<string, string> 字段名 => 标签
 */
function fh_inquiry_email_fields(): array
{
    return [
        'email_status'        => '邮件状态',
        'email_error'         => '邮件错误',
        'provider_message_id' => '提供商消息 ID',
    ];
}

/** 合规字段。 */
function fh_inquiry_compliance_fields(): array
{
    return ['privacy_version' => '隐私文本版本', 'consented_at' => '同意时间'];
}

/** 全部 meta 键（供自检断言）。 */
function fh_inquiry_all_meta_keys(): array
{
    return array_merge(
        array_keys(fh_inquiry_input_fields()),
        array_keys(fh_inquiry_context_fields()),
        array_keys(fh_inquiry_item_snapshot_fields()),
        array_keys(fh_inquiry_business_fields()),
        array_keys(fh_inquiry_email_fields()),
        array_keys(fh_inquiry_compliance_fields()),
    );
}

/* ============================================================================
 * 服务密钥（fail-closed）
 * ========================================================================== */

/**
 * 读询盘服务密钥。
 *
 * 优先 PHP 常量（由 docker-compose 的 WORDPRESS_CONFIG_EXTRA 从环境变量提升而来），
 * 其次 getenv。**没有默认值** —— 缺失时返回空串，调用方必须 fail-closed。
 *
 * filter 的用途：让验收脚本能在一个进程内模拟「未配置」而不必重启容器。
 */
function fh_inquiry_service_key(): string
{
    $key = '';
    if (defined('FH_INQUIRY_SERVICE_KEY')) {
        $key = (string) constant('FH_INQUIRY_SERVICE_KEY');
    }
    if ($key === '') {
        $env = getenv('FH_INQUIRY_SERVICE_KEY');
        if (is_string($env)) {
            $key = $env;
        }
    }
    return (string) apply_filters('fh_inquiry_service_key', $key);
}

/* ============================================================================
 * 专用表（dbDelta，版本闸门做幂等）
 * ========================================================================== */

add_action('init', 'fh_inquiry_install_tables', 5);
function fh_inquiry_install_tables(): void
{
    if (get_option(FH_INQUIRY_DB_VERSION_OPTION) === FH_INQUIRY_DB_VERSION) {
        return;
    }

    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    $collate = $wpdb->get_charset_collate(); // utf8mb4 / utf8mb4_unicode_520_ci，与现有 12 张表一致
    $key     = fh_inquiry_key_table();
    $outbox  = fh_inquiry_outbox_table();
    $event   = fh_inquiry_event_table();

    // 幂等保证表。idempotency_key 是主键 —— 唯一约束才是「同一幂等键只产生一个询盘号」的硬保证。
    //
    // seq 自增列只服务于询盘号生成：wp_postmeta 没有序列，而 wp_posts.ID 会泄露全站文章总数
    // （任务明确禁止）。所以这里加一个仅带唯一索引的自增列，主键仍是 idempotency_key ——
    // InnoDB 允许 AUTO_INCREMENT 落在非主键但被索引的列上。
    $sql = [];
    $sql[] = "CREATE TABLE {$key} (
		idempotency_key char(64) NOT NULL,
		seq bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		inquiry_id bigint(20) unsigned NOT NULL DEFAULT 0,
		created_at datetime NOT NULL DEFAULT '1970-01-01 00:00:00',
		PRIMARY KEY  (idempotency_key),
		UNIQUE KEY seq (seq),
		KEY inquiry_id (inquiry_id)
	) {$collate};";

    // 发件箱 —— 事务 outbox。与询盘同事务写入，提交后由投递流程领取。
    $sql[] = "CREATE TABLE {$outbox} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		inquiry_id bigint(20) unsigned NOT NULL,
		event_type varchar(32) NOT NULL DEFAULT 'sales_notification',
		status varchar(16) NOT NULL DEFAULT 'pending',
		attempts smallint(5) unsigned NOT NULL DEFAULT 0,
		next_attempt_at datetime NULL DEFAULT NULL,
		lease_owner varchar(64) NULL DEFAULT NULL,
		lease_expires_at datetime NULL DEFAULT NULL,
		provider_message_id varchar(191) NULL DEFAULT NULL,
		last_error text NULL,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		KEY claim (status,next_attempt_at),
		KEY inquiry_id (inquiry_id)
	) {$collate};";

    // 邮件事件 —— 「先存去重事件，再更新投影」。UNIQUE(provider_event_id, event_type)
    // 保证重复/乱序回调只被记录一次（设计文档 §5.6）。
    $sql[] = "CREATE TABLE {$event} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		outbox_id bigint(20) unsigned NOT NULL DEFAULT 0,
		provider_event_id varchar(191) NULL DEFAULT NULL,
		event_type varchar(32) NOT NULL,
		payload text NULL,
		occurred_at datetime NULL DEFAULT NULL,
		created_at datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY provider_event (provider_event_id,event_type),
		KEY outbox_id (outbox_id)
	) {$collate};";

    foreach ($sql as $statement) {
        dbDelta($statement);
    }

    update_option(FH_INQUIRY_DB_VERSION_OPTION, FH_INQUIRY_DB_VERSION);
}

/* ============================================================================
 * 注册文章类型
 * ========================================================================== */

add_action('init', 'fh_inquiry_register_post_type');
function fh_inquiry_register_post_type(): void
{
    register_post_type(FH_INQUIRY_POST_TYPE, [
        'labels' => [
            'name'               => '询盘',
            'singular_name'      => '询盘',
            'menu_name'          => '询盘',
            'edit_item'          => '查看询盘',
            'view_item'          => '查看询盘',
            'search_items'       => '搜索询盘',
            'not_found'          => '还没有询盘',
            'not_found_in_trash' => '回收站里没有询盘',
        ],
        // 只要标题 + 自定义字段。标题存询盘号；去掉编辑器后经典 meta box 才正常显示
        // （与 wheel_model 同理）。
        'supports'            => ['title', 'custom-fields'],
        // ⚠️ 询盘**不进公开 REST**（设计文档 §L107：不做公开列表、不按序号公开查询）。
        // 写入走独立的 fh/v1 命名空间，用服务密钥鉴权。
        'show_in_rest'        => false,
        'public'              => false,
        'publicly_queryable'  => false,
        'exclude_from_search' => true,
        'show_ui'             => true,
        // 后台菜单由下面的 add_menu_page 单独建（dashicons-email / 位置 26），
        // 避免出现两个「询盘」菜单。
        'show_in_menu'        => false,
        'show_in_nav_menus'   => false,
        'hierarchical'        => false,
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'capability_type'     => ['fh_inquiry', 'fh_inquiries'],
        'map_meta_cap'        => true,
        // 询盘只能由服务端创建，后台用户不应出现“新建询盘”。
        'capabilities'        => ['create_posts' => 'do_not_allow'],
    ]);
}

/**
 * 建立独立销售角色与能力矩阵。普通 Contributor/Author 不再因 `edit_posts`
 * 获得客户 PII。管理员拥有派发能力；销售只读询盘并修改业务处理字段。
 */
add_action('init', 'fh_inquiry_install_capabilities', 6);
function fh_inquiry_install_capabilities(): void
{
    if (get_option(FH_INQUIRY_CAP_VERSION_OPTION) === FH_INQUIRY_CAP_VERSION) {
        return;
    }

    $salesCaps = [
        'read',
        'edit_fh_inquiries',
        'edit_others_fh_inquiries',
        'edit_published_fh_inquiries',
        'read_private_fh_inquiries',
    ];
    $adminCaps = array_merge($salesCaps, [
        'publish_fh_inquiries',
        'delete_fh_inquiries',
        'delete_others_fh_inquiries',
        'delete_published_fh_inquiries',
        'delete_private_fh_inquiries',
        'edit_private_fh_inquiries',
        FH_INQUIRY_CAP_DELIVERY,
    ]);

    $sales = get_role('fh_inquiry_sales');
    if (!$sales) {
        $sales = add_role('fh_inquiry_sales', '询盘销售', ['read' => true]);
    }
    if ($sales) {
        foreach ($salesCaps as $cap) {
            $sales->add_cap($cap);
        }
    }

    $administrator = get_role('administrator');
    if ($administrator) {
        foreach ($adminCaps as $cap) {
            $administrator->add_cap($cap);
        }
    }

    update_option(FH_INQUIRY_CAP_VERSION_OPTION, FH_INQUIRY_CAP_VERSION);
}

/* ============================================================================
 * 注册 meta
 * ========================================================================== */

add_action('init', 'fh_inquiry_register_meta', 11);
function fh_inquiry_register_meta(): void
{
    $auth = static function (): bool {
        return current_user_can(FH_INQUIRY_CAP_MANAGE);
    };

    $register = static function (string $key, string $default, ?callable $sanitize = null) use ($auth): void {
        register_post_meta(FH_INQUIRY_POST_TYPE, $key, [
            'type'              => 'string',
            'single'            => true,
            'default'           => $default,
            // 询盘含 PII，且本 CPT 不在公开 REST 里 —— meta 一律不暴露。
            'show_in_rest'      => false,
            'auth_callback'     => $auth,
            'sanitize_callback' => $sanitize ?? static fn($v) => is_string($v) ? $v : (string) $v,
        ]);
    };

    foreach (array_keys(fh_inquiry_input_fields()) as $key) {
        $register($key, '');
    }

    foreach (array_keys(fh_inquiry_context_fields()) as $key) {
        $register($key, $key === 'variant_pending' ? '0' : '');
    }
    foreach (array_keys(fh_inquiry_item_snapshot_fields()) as $key) {
        $register($key, '');
    }

    // 业务状态：后台可改，取值必须落在白名单内。非法值一律回落到 new。
    $register('business_status', 'new', static function ($value): string {
        $value = is_string($value) ? $value : '';
        return array_key_exists($value, fh_inquiry_business_status_options()) ? $value : 'new';
    });
    $register('assigned_to', '');
    $register('internal_note', '');

    // 邮件状态：只有投递流程能写；非法值回落 pending。
    $register('email_status', 'pending', static function ($value): string {
        $value = is_string($value) ? $value : '';
        return array_key_exists($value, fh_inquiry_email_status_options()) ? $value : 'pending';
    });
    $register('email_error', '');
    $register('provider_message_id', '');

    foreach (array_keys(fh_inquiry_compliance_fields()) as $key) {
        $register($key, '');
    }
}

/* ============================================================================
 * REST 写端点：POST /fh/v1/inquiries
 * ========================================================================== */

add_action('rest_api_init', 'fh_inquiry_register_rest');
function fh_inquiry_register_rest(): void
{
    register_rest_route(FH_INQUIRY_REST_NAMESPACE, '/inquiries', [
        'methods'             => 'POST',
        'callback'            => 'fh_inquiry_rest_create',
        'permission_callback' => 'fh_inquiry_rest_permission',
        // 字段级校验在回调里做（要产出与 Next 侧一致的 fieldErrors 形状）。
        'args'                => [],
    ]);

    register_rest_route(FH_INQUIRY_REST_NAMESPACE, '/email-events', [
        'methods'             => 'POST',
        'callback'            => 'fh_inquiry_rest_email_event',
        'permission_callback' => 'fh_inquiry_email_event_permission',
        'args'                => [],
    ]);
}

/**
 * 鉴权：专用服务密钥，**不是** WP 用户账号。
 *
 * 为什么这么写：
 *   · 只读请求头 —— 不接受 `?key=`（查询参数会进访问日志，也会跟着 Referer 外泄）。
 *   · 只做 hash_equals —— 不接受 cookie / 匿名 / 应用密码；这里根本不看「当前用户」。
 *   · 密钥未配置 → 503 fail-closed，而不是放行（与项目其它门槛一致）。
 */
function fh_inquiry_rest_permission(WP_REST_Request $request)
{
    $expected = fh_inquiry_service_key();

    if ($expected === '') {
        return new WP_Error(
            'fh_inquiry_not_configured',
            '询盘服务密钥未配置，端点已停用。',
            ['status' => 503]
        );
    }

    $provided = (string) $request->get_header(FH_INQUIRY_SERVICE_KEY_HEADER);

    if ($provided === '' || !hash_equals($expected, $provided)) {
        return new WP_Error(
            'fh_inquiry_forbidden',
            '服务密钥无效。',
            ['status' => 401]
        );
    }

    /*
     * Rate limit — the second gate, after the key.
     *
     * The Next.js frontend already rate-limits per email/IP, but that guard lives
     * in the frontend. Anyone holding the service key (or reaching this endpoint
     * directly, bypassing Next entirely) faced no limit at all, so the database
     * could be filled with enquiries by a script.
     *
     * Keyed on client IP. `REMOTE_ADDR` is used as-is and NOT `X-Forwarded-For`:
     * that header is caller-controlled, so trusting it would let an attacker pick
     * a fresh bucket per request and defeat the limit. When WordPress sits behind
     * a proxy this means every request shares the proxy's bucket — a coarser but
     * honest limit, which is the right trade for a write endpoint.
     */
    $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : 'unknown';
    if (fh_inquiry_rate_limit_exceeded($ip)) {
        return new WP_Error(
            'fh_inquiry_rate_limited',
            '请求过于频繁，请稍后再试。',
            ['status' => 429]
        );
    }

    return true;
}

/**
 * Fixed-window rate limit: N accepted enquiries per IP per window.
 *
 * Uses a counter in a transient rather than a row scan: the write path must not
 * pay for a COUNT across the enquiry table on every submission.
 *
 * @return bool true when this IP has already used up its allowance.
 */
function fh_inquiry_rate_limit_exceeded(string $ip): bool
{
    $limit  = (int) apply_filters('fh_inquiry_rate_limit', 5);
    $window = (int) apply_filters('fh_inquiry_rate_window', 10 * MINUTE_IN_SECONDS);
    if ($limit <= 0 || $window <= 0) return false;

    // Hash the IP so a raw address is not written into the options table, which
    // is far more widely readable than the enquiry records themselves.
    $key = 'fh_rl_' . substr(hash('sha256', $ip), 0, 24);
    $hits = (int) get_transient($key);

    if ($hits >= $limit) return true;

    // First hit in this window starts the clock; later hits keep the original
    // expiry so the window stays fixed rather than sliding on every request.
    set_transient($key, $hits + 1, $window);
    return false;
}

/**
 * 邮件事件回调鉴权。
 *
 * 提供商适配层把原始请求体和 Unix 时间戳签名为
 * sha256=HMAC_SHA256(timestamp + "." + body, FH_INQUIRY_WEBHOOK_SECRET)。
 * 不接受查询参数密钥；过期请求直接拒绝，避免回放旧事件。
 */
function fh_inquiry_email_event_permission(WP_REST_Request $request)
{
    $secret = fh_inquiry_webhook_secret();
    if ($secret === '') {
        return new WP_Error(
            'fh_inquiry_webhook_not_configured',
            '邮件事件密钥未配置，回调端点已停用。',
            ['status' => 503]
        );
    }

    $timestamp = trim((string) $request->get_header('X-FH-Webhook-Timestamp'));
    $signature = trim((string) $request->get_header('X-FH-Webhook-Signature'));
    if ($timestamp === '' || !ctype_digit($timestamp) || $signature === '') {
        return new WP_Error('fh_inquiry_webhook_forbidden', '邮件事件签名无效。', ['status' => 401]);
    }

    if (abs(time() - (int) $timestamp) > FH_INQUIRY_WEBHOOK_MAX_AGE) {
        return new WP_Error('fh_inquiry_webhook_expired', '邮件事件签名已过期。', ['status' => 401]);
    }

    $expected = 'sha256=' . hash_hmac(
        'sha256',
        $timestamp . '.' . $request->get_body(),
        $secret
    );
    $provided = preg_split('/[\s,]+/', $signature, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    foreach ($provided as $candidate) {
        if (hash_equals($expected, $candidate)) {
            return true;
        }
    }

    return new WP_Error('fh_inquiry_webhook_forbidden', '邮件事件签名无效。', ['status' => 401]);
}

/**
 * 将提供商邮件事件类型映射为内部投影状态。
 *
 * 只处理终态事件；accepted 仍由发送器/worker 写入，不能由外部回调伪造。
 */
function fh_inquiry_email_event_status(string $eventType): ?string
{
    return [
        'email.delivered' => 'delivered',
        'email.bounced'   => 'bounced',
        'email.failed'    => 'failed',
    ][$eventType] ?? null;
}

/**
 * 从提供商事件中提取最小化字段，避免把收件人和客户正文落入事件表。
 *
 * @return array{eventId:string,eventType:string,messageId:string,reason:string,occurredAt:string}
 */
function fh_inquiry_normalize_email_event(array $body): array
{
    $data = isset($body['data']) && is_array($body['data']) ? $body['data'] : [];
    $eventId = isset($body['id']) ? sanitize_text_field((string) $body['id']) : '';
    // 事件类型包含点号（如 email.delivered），不能使用 sanitize_key（会剥掉点号）。
    $eventType = isset($body['type']) ? sanitize_text_field((string) $body['type']) : '';
    $messageId = '';
    foreach (['email_id', 'provider_message_id', 'message_id'] as $key) {
        if (isset($body[$key]) && is_scalar($body[$key])) {
            $messageId = sanitize_text_field((string) $body[$key]);
            break;
        }
        if (isset($data[$key]) && is_scalar($data[$key])) {
            $messageId = sanitize_text_field((string) $data[$key]);
            break;
        }
    }
    $reason = '';
    foreach (['reason', 'error', 'message'] as $key) {
        if (isset($body[$key]) && is_scalar($body[$key])) {
            $reason = sanitize_text_field((string) $body[$key]);
            break;
        }
        if (isset($data[$key]) && is_scalar($data[$key])) {
            $reason = sanitize_text_field((string) $data[$key]);
            break;
        }
    }
    $occurredRaw = '';
    foreach (['created_at', 'occurred_at', 'timestamp'] as $key) {
        if (isset($body[$key]) && is_scalar($body[$key])) {
            $occurredRaw = (string) $body[$key];
            break;
        }
        if (isset($data[$key]) && is_scalar($data[$key])) {
            $occurredRaw = (string) $data[$key];
            break;
        }
    }
    $occurredAt = strtotime($occurredRaw);

    return [
        'eventId'    => substr($eventId, 0, 191),
        'eventType'  => substr($eventType, 0, 32),
        'messageId'  => substr($messageId, 0, 191),
        'reason'     => substr($reason, 0, 500),
        'occurredAt' => $occurredAt ? gmdate('Y-m-d H:i:s', $occurredAt) : gmdate('Y-m-d H:i:s'),
    ];
}

/**
 * 接收邮件提供商的 delivered/bounced/failed 回调。
 *
 * 事件先以 provider_event_id + event_type 去重落库，再更新询盘邮件状态投影。
 * 未匹配到本地 outbox 的事件仍返回 202，便于提供商停止重试，同时保留审计线索。
 */
function fh_inquiry_rest_email_event(WP_REST_Request $request)
{
    global $wpdb;

    $body = $request->get_json_params();
    if (!is_array($body)) {
        return new WP_REST_Response(['ok' => false, 'error' => '事件 JSON 无效。'], 422);
    }

    $event = fh_inquiry_normalize_email_event($body);
    $status = fh_inquiry_email_event_status($event['eventType']);
    if ($event['eventId'] === '' || $event['messageId'] === '' || $status === null) {
        return new WP_REST_Response(['ok' => false, 'error' => '事件 id、类型或消息 id 无效。'], 422);
    }

    $outboxTable = fh_inquiry_outbox_table();
    $eventTable = fh_inquiry_event_table();
    $outbox = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$outboxTable} WHERE provider_message_id = %s ORDER BY id DESC LIMIT 1",
        $event['messageId']
    ), ARRAY_A);
    $outboxId = $outbox ? (int) $outbox['id'] : 0;
    $minimalPayload = wp_json_encode([
        'id'        => $event['eventId'],
        'type'      => $event['eventType'],
        'emailId'   => $event['messageId'],
        'occurredAt'=> $event['occurredAt'],
        'reason'    => $event['reason'],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $inserted = $wpdb->query($wpdb->prepare(
        "INSERT IGNORE INTO {$eventTable}
            (outbox_id, provider_event_id, event_type, payload, occurred_at, created_at)
         VALUES (%d, %s, %s, %s, %s, %s)",
        $outboxId,
        $event['eventId'],
        $event['eventType'],
        $minimalPayload ?: '{}',
        $event['occurredAt'],
        gmdate('Y-m-d H:i:s')
    ));
    if ($inserted === false) {
        return new WP_REST_Response(['ok' => false, 'error' => '邮件事件写入失败。'], 500);
    }

    $replayed = $inserted === 0;
    if (!$outbox) {
        return new WP_REST_Response([
            'ok'       => true,
            'eventId'  => $event['eventId'],
            'eventType'=> $event['eventType'],
            'status'   => $status,
            'matched'  => false,
            'replayed' => $replayed,
        ], 202);
    }

    $postId = (int) $outbox['inquiry_id'];
    $current = (string) get_post_meta($postId, 'email_status', true);
    // delivered 不能覆盖已确认的 bounced/failed；退信/失败可以覆盖 delivered。
    $shouldProject = !($status === 'delivered' && in_array($current, ['bounced', 'failed'], true));
    if (!$replayed && $shouldProject) {
        update_post_meta($postId, 'email_status', $status);
        update_post_meta(
            $postId,
            'email_error',
            in_array($status, ['bounced', 'failed'], true)
                ? ('provider event ' . $event['eventType'])
                : ''
        );
        $wpdb->update(
            $outboxTable,
            [
                'status'          => $status,
                'last_error'      => in_array($status, ['bounced', 'failed'], true) ? ('provider event ' . $event['eventType']) : null,
                'next_attempt_at' => null,
                'lease_owner'     => null,
                'lease_expires_at' => null,
                'updated_at'      => gmdate('Y-m-d H:i:s'),
            ],
            ['id' => $outboxId]
        );
    }

    return new WP_REST_Response([
        'ok'       => true,
        'eventId'  => $event['eventId'],
        'eventType'=> $event['eventType'],
        'status'   => $status,
        'matched'  => true,
        'replayed' => $replayed,
    ], 200);
}

/**
 * 校验请求体。
 *
 * 与 Next 侧 src/lib/inquiry/validate.ts 同一套规则 —— 那边是第一道，这里是**权威**那道
 * （Next 可被动过，WP 不能信它）。返回结构对齐 validate.ts：失败时 {ok:false, fieldErrors}。
 *
 * @param array<string, mixed> $body
 * @return array{ok:bool, fieldErrors:array<string,string>, data:array<string,string>}
 */
function fh_inquiry_validate_payload(array $body): array
{
    $errors = [];

    // ── idempotencyKey ─────────────────────────────────────────────────────
    $key = isset($body['idempotencyKey']) && is_string($body['idempotencyKey'])
        ? trim($body['idempotencyKey'])
        : '';
    if ($key === '') {
        $errors['idempotencyKey'] = '缺少幂等键。';
    } elseif (!preg_match('/^[A-Za-z0-9_-]{32,64}$/', $key)) {
        $errors['idempotencyKey'] = '幂等键必须是 32–64 个 [A-Za-z0-9_-] 字符。';
    }

    // ── 枚举 ───────────────────────────────────────────────────────────────
    $customerType = isset($body['customerType']) && is_string($body['customerType']) ? $body['customerType'] : '';
    if (!array_key_exists($customerType, fh_inquiry_customer_type_options())) {
        $errors['customerType'] = '客户类型只能是 business 或 individual。';
    }

    $productLine = isset($body['productLine']) && is_string($body['productLine']) ? $body['productLine'] : '';
    if (!array_key_exists($productLine, fh_inquiry_product_line_options())) {
        $errors['productLine'] = '产品线不在允许的四个取值内。';
    }

    // ── 文本长度（超限报错，不静默截断） ────────────────────────────────────
    $text = static function (string $field, int $max, bool $required) use ($body, &$errors): string {
        $raw = isset($body[$field]) && is_string($body[$field]) ? trim($body[$field]) : '';
        if ($raw === '') {
            if ($required) {
                $errors[$field] = '此项必填。';
            }
            return '';
        }
        if (mb_strlen($raw) > $max) {
            $errors[$field] = "长度不得超过 {$max} 个字符。";
            return '';
        }
        return $raw;
    };

    $message     = $text('message', 5000, true);
    $name        = $text('name', 120, true);
    $email       = $text('email', 200, true);
    $company     = $text('company', 160, false);
    $whatsapp    = $text('whatsapp', 40, false);
    $countryCode = $text('countryCode', 8, false);
    $quantity    = $text('quantity', 40, false);

    if ($email !== '' && !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/', $email)) {
        $errors['email'] = '邮箱格式不正确。';
    }

    // ── 合规 ───────────────────────────────────────────────────────────────
    // The enquiry path does not require a consent checkbox or version. Keep
    // both fields optional for older callers and preserve empty audit values.
    $privacyVersion = $text('privacyVersion', 40, false);
    $consentedAt    = $text('consentedAt', 40, false);
    if ($consentedAt !== '' && strtotime($consentedAt) === false) {
        $errors['consentedAt'] = '同意时间必须是可解析的时间戳。';
    }

    // ── 现有输入（数组 → 逗号分隔） ─────────────────────────────────────────
    $inputs = [];
    if (array_key_exists('inputsAvailable', $body)) {
        if (!is_array($body['inputsAvailable'])) {
            $errors['inputsAvailable'] = '现有输入必须是字符串数组。';
        } else {
            foreach (array_slice($body['inputsAvailable'], 0, 20) as $item) {
                if (!is_string($item)) {
                    continue;
                }
                $item = trim($item);
                if ($item !== '') {
                    $inputs[] = mb_substr($item, 0, 60);
                }
            }
        }
    }

    // ── 多款轮毂清单（Next 已按公开目录复核；WP 仍做形状、数量和重复保护） ──
    $items = [];
    if (array_key_exists('items', $body)) {
        if (!is_array($body['items'])) {
            $errors['items'] = '轮毂清单必须是数组。';
        } elseif (count($body['items']) > 20) {
            $errors['items'] = '一次最多询价 20 款轮毂。';
        } else {
            $seenItems = [];
            foreach ($body['items'] as $index => $item) {
                if (!is_array($item)) {
                    $errors['items.' . $index] = '轮毂清单项格式不正确。';
                    continue;
                }
                $model = isset($item['model']) && is_string($item['model']) ? trim($item['model']) : '';
                $code = isset($item['productionCode']) && is_string($item['productionCode']) ? trim($item['productionCode']) : '';
                $quantity = isset($item['quantity']) && is_int($item['quantity']) ? $item['quantity'] : 0;
                if ($model === '' || mb_strlen($model) > 60 || $code === '' || mb_strlen($code) > 120) {
                    $errors['items.' . $index] = '轮毂型号或生产代码无效。';
                    continue;
                }
                if ($quantity < 1) {
                    $errors['items.' . $index . '.quantity'] = '每款轮毂数量必须是正整数。';
                    continue;
                }
                $itemKey = strtolower($model . '::' . $code);
                if (isset($seenItems[$itemKey])) {
                    $errors['items.' . $index] = '轮毂清单中不能重复同一生产代码。';
                    continue;
                }
                $seenItems[$itemKey] = true;
                $items[] = [
                    'model' => $model,
                    'productionCode' => $code,
                    'quantity' => $quantity,
                    'spec' => isset($item['spec']) && is_array($item['spec']) ? $item['spec'] : [],
                ];
            }
        }
    }

    // ── 上下文快照 ─────────────────────────────────────────────────────────
    $ctx = isset($body['context']) && is_array($body['context']) ? $body['context'] : [];
    $ctxStr = static function (string $field, int $max) use ($ctx): string {
        return isset($ctx[$field]) && is_string($ctx[$field]) ? mb_substr(trim($ctx[$field]), 0, $max) : '';
    };

    $spec = [];
    if (isset($ctx['spec']) && is_array($ctx['spec'])) {
        foreach (array_slice($ctx['spec'], 0, 12, true) as $specKey => $specValue) {
            if (!is_scalar($specValue)) {
                continue;
            }
            $specValue = mb_substr((string) $specValue, 0, 120);
            if ($specValue !== '') {
                $spec[(string) $specKey] = $specValue;
            }
        }
    }

    $rawLine = $ctxStr('productLine', 60);

    return [
        'ok'          => !$errors,
        'fieldErrors' => $errors,
        'data'        => [
            'customer_type'            => $customerType,
            'product_line'             => $productLine,
            'message'                  => $message,
            'quantity'                 => $quantity,
            'inputs_available'         => implode(',', $inputs),
            'name'                     => $name,
            'email'                    => $email,
            'country_code'             => $countryCode === '' ? '' : mb_strtoupper($countryCode),
            'company'                  => $company,
            'whatsapp'                 => $whatsapp,
            'privacy_version'          => $privacyVersion,
            'consented_at'             => $consentedAt,
            'context_model'            => $ctxStr('model', 120),
            'context_production_code'  => $ctxStr('productionCode', 120),
            'context_spec_json'        => $spec ? (string) wp_json_encode($spec, JSON_UNESCAPED_UNICODE) : '',
            'context_source_page'      => $ctxStr('sourcePage', 500),
            'context_product_line_raw' => $rawLine !== '' ? $rawLine : $productLine,
            'context_intent'           => $ctxStr('intent', 60),
            'variant_pending'          => !empty($ctx['variantPending']) ? '1' : '0',
            'inquiry_items_json'       => (string) wp_json_encode($items, JSON_UNESCAPED_UNICODE),
        ],
        'idempotencyKey' => $key,
    ];
}

/**
 * 建询盘号：INQ-YYYYMMDD-NNNN。
 *
 * NNNN 就是 `fh_inquiry_key` 那张表的**自增序号**（任务允许的两种来源之一）。
 * 为什么不用「当日计数」：唯一安全的当日计数需要一个串行化点（行锁或第四张计数表），
 * 而任务把表结构钉死在三张；用 COUNT(*)+1 的做法在并发下会撞号（两个事务的读视图
 * 互相看不见对方的未提交行，会各自算出同一个「第 N 号」）。
 * 自增序号则是**单调且并发安全**的，代价只是 NNNN 不回落到每日 0001 —— 编号里出现
 * 跳号，但永不重复。**故意不用 wp_posts.ID**（那会泄露全站文章总数）。
 *
 * ⚠️ 自增值会被「失败/回滚的 INSERT」和「幂等重放的重复键」消耗掉，所以号码有跳号，
 * 这是 InnoDB 的既有行为，不是缺陷。
 */
function fh_inquiry_format_number(int $seq): string
{
    return sprintf('INQ-%s-%04d', gmdate('Ymd'), max(1, $seq));
}

/**
 * 从键表取一条已存在的幂等记录（重放分支用）。
 *
 * @return array{id:string, emailStatus:string, createdAt:string}|null
 */
function fh_inquiry_find_existing(string $key): ?array
{
    global $wpdb;

    $table = fh_inquiry_key_table();
    $row   = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT k.inquiry_id, p.post_title, p.post_date_gmt
               FROM {$table} k
               LEFT JOIN {$wpdb->posts} p ON p.ID = k.inquiry_id
              WHERE k.idempotency_key = %s",
            $key
        ),
        ARRAY_A
    );

    if (!$row || (int) $row['inquiry_id'] <= 0 || (string) $row['post_title'] === '') {
        return null;
    }

    $inquiryId   = (int) $row['inquiry_id'];
    $emailStatus = (string) get_post_meta($inquiryId, 'email_status', true);

    return [
        'id'          => (string) $row['post_title'],
        'emailStatus' => array_key_exists($emailStatus, fh_inquiry_email_status_options())
            ? $emailStatus
            : 'pending',
        'createdAt'   => fh_inquiry_iso_gmt((string) $row['post_date_gmt']),
    ];
}

/** MySQL 的 GMT datetime → ISO 8601（UTC）。 */
function fh_inquiry_iso_gmt(string $datetimeGmt): string
{
    if ($datetimeGmt === '') {
        return gmdate('c');
    }
    $timestamp = strtotime($datetimeGmt . ' UTC');
    return $timestamp === false ? gmdate('c') : gmdate('c', $timestamp);
}

/**
 * 幂等重放响应：**不新建记录、不新增 outbox**，HTTP 200。
 */
function fh_inquiry_replay_response(string $key): WP_REST_Response
{
    $existing = fh_inquiry_find_existing($key);

    if ($existing === null) {
        // 唯一键冲突了却读不到行 —— 不该发生。宁可诚实报错，也不返回假成功。
        return new WP_REST_Response(
            ['ok' => false, 'error' => '幂等键冲突但找不到原询盘，请人工核查。'],
            500
        );
    }

    return new WP_REST_Response(
        [
            'ok'          => true,
            'id'          => $existing['id'],
            'emailStatus' => $existing['emailStatus'],
            'createdAt'   => $existing['createdAt'],
            'replayed'    => true,
        ],
        200
    );
}

/**
 * POST /fh/v1/inquiries
 *
 * 顺序不可变（设计文档 §5）：校验 → 幂等 → 事务落库 → 提交后派发邮件 → 响应。
 */
function fh_inquiry_rest_create(WP_REST_Request $request)
{
    global $wpdb;

    $body = $request->get_json_params();
    if (!is_array($body)) {
        return new WP_REST_Response(['ok' => false, 'error' => '请求体必须是 JSON 对象。'], 400);
    }

    // ── 1 服务端重新校验（权威那道） ───────────────────────────────────────
    $validated = fh_inquiry_validate_payload($body);
    if (!$validated['ok']) {
        return new WP_REST_Response(
            ['ok' => false, 'error' => 'Validation failed.', 'fieldErrors' => $validated['fieldErrors']],
            422
        );
    }

    $data = $validated['data'];
    $key  = $validated['idempotencyKey'];

    $keyTable    = fh_inquiry_key_table();
    $outboxTable = fh_inquiry_outbox_table();
    $now         = gmdate('Y-m-d H:i:s');

    // ── 2/3 幂等 + 事务 ────────────────────────────────────────────────────
    //
    // ⚠️ 不做「先查再插」—— 那正是并发竞态窗口。唯一键冲突才是权威判据：
    // 重复键的 INSERT 会等待先到的事务结束再返回冲突，此时原询盘必然已可见。
    //
    // suppress_errors 是为了「预期内的冲突」不往响应里吐 wpdb 的 HTML 错误块 ——
    // 那会把 JSON 响应体撑坏（WORDPRESS_DEBUG=1 时 show_errors 默认开）。
    $prevSuppress = $wpdb->suppress_errors(true);

    $wpdb->query('START TRANSACTION');

    $inserted = $wpdb->insert(
        $keyTable,
        ['idempotency_key' => $key, 'inquiry_id' => 0, 'created_at' => $now]
    );

    if ($inserted === false) {
        // 唯一键冲突（或其它写失败）—— 抛掉本事务，走重放分支。
        $wpdb->query('ROLLBACK');
        $wpdb->suppress_errors($prevSuppress);

        $existing = fh_inquiry_find_existing($key);
        if ($existing !== null) {
            return fh_inquiry_replay_response($key);
        }

        return new WP_REST_Response(
            ['ok' => false, 'error' => '幂等键写入失败，且找不到原询盘。'],
            500
        );
    }

    $seq       = (int) $wpdb->insert_id;
    $inquiryNo = fh_inquiry_format_number($seq);

    // ── CPT 记录 ───────────────────────────────────────────────────────────
    //
    // ⚠️ wp_insert_post() 本身不构成事务单元 —— 所以它被显式包在 START TRANSACTION 里。
    // 可回滚性由 scripts/verify-inquiry-backend.py 的事务探针实测（不靠读代码断言）。
    $postId = wp_insert_post(
        [
            'post_type'   => FH_INQUIRY_POST_TYPE,
            'post_title'  => $inquiryNo,
            'post_status' => 'publish',
            'post_author' => 0,
        ],
        true
    );

    if (is_wp_error($postId) || !$postId) {
        $wpdb->query('ROLLBACK');
        $wpdb->suppress_errors($prevSuppress);
        return new WP_REST_Response(['ok' => false, 'error' => '询盘记录创建失败。'], 500);
    }
    $postId = (int) $postId;

    // ── meta ───────────────────────────────────────────────────────────────
    $metaWritten = true;
    foreach ($data as $metaKey => $metaValue) {
        update_post_meta($postId, $metaKey, $metaValue);
        if ((string) get_post_meta($postId, $metaKey, true) !== (string) $metaValue) {
            $metaWritten = false;
            break;
        }
    }

    // 邮件状态与业务状态的初值由服务端决定，不接受客户端传。
    foreach (['email_status' => 'pending', 'business_status' => 'new'] as $metaKey => $metaValue) {
        update_post_meta($postId, $metaKey, $metaValue);
        if ((string) get_post_meta($postId, $metaKey, true) !== $metaValue) {
            $metaWritten = false;
            break;
        }
    }

    if (!$metaWritten) {
        $wpdb->query('ROLLBACK');
        $wpdb->suppress_errors($prevSuppress);
        clean_post_cache($postId);
        return new WP_REST_Response(['ok' => false, 'error' => '询盘字段写入失败。'], 500);
    }

    // ── 键 → CPT 关联 ──────────────────────────────────────────────────────
    $linked = $wpdb->update($keyTable, ['inquiry_id' => $postId], ['idempotency_key' => $key]);
    if ($linked === false) {
        $wpdb->query('ROLLBACK');
        $wpdb->suppress_errors($prevSuppress);
        clean_post_cache($postId);
        return new WP_REST_Response(['ok' => false, 'error' => '幂等键关联失败。'], 500);
    }

    // ── outbox（事务内，与询盘同生共死） ───────────────────────────────────
    $queued = $wpdb->insert($outboxTable, [
        'inquiry_id'      => $postId,
        'event_type'      => 'sales_notification',
        'status'          => 'pending',
        'attempts'        => 0,
        'next_attempt_at' => $now,
        'created_at'      => $now,
        'updated_at'      => $now,
    ]);
    if ($queued === false) {
        $wpdb->query('ROLLBACK');
        $wpdb->suppress_errors($prevSuppress);
        clean_post_cache($postId);
        return new WP_REST_Response(['ok' => false, 'error' => '发件箱写入失败。'], 500);
    }
    $outboxId = (int) $wpdb->insert_id;

    $wpdb->query('COMMIT');
    $wpdb->suppress_errors($prevSuppress);

    // ── 4 提交后派发邮件（尽力而为，失败不影响响应；绝不在长事务里发信） ────
    $emailStatus = fh_inquiry_dispatch_email($postId, $outboxId);

    // ── 5 响应 ─────────────────────────────────────────────────────────────
    return new WP_REST_Response(
        [
            'ok'          => true,
            'id'          => $inquiryNo,
            'emailStatus' => $emailStatus,
            'createdAt'   => fh_inquiry_iso_gmt((string) get_post_field('post_date_gmt', $postId)),
            'replayed'    => false,
        ],
        201
    );
}

/* ============================================================================
 * 邮件投递（Resend HTTP；from/to/reply_to 只从服务端配置读）
 * ========================================================================== */

/** 常量 → option → 默认值。 */
function fh_inquiry_config(string $constant, string $option, string $default = ''): string
{
    if (defined($constant)) {
        $value = (string) constant($constant);
        if ($value !== '') {
            return $value;
        }
    }
    $value = get_option($option, '');
    if (is_string($value) && $value !== '') {
        return $value;
    }
    return $default;
}

/**
 * 邮件事件回调密钥。
 *
 * 密钥只允许来自服务器环境/常量或受控的 WordPress option；不接受请求参数。
 * filter 仅用于本地合成事件测试，不改变生产默认值。
 */
function fh_inquiry_webhook_secret(): string
{
    $env = getenv('FH_INQUIRY_WEBHOOK_SECRET');
    $value = fh_inquiry_config(
        'FH_INQUIRY_WEBHOOK_SECRET',
        'fh_inquiry_webhook_secret',
        is_string($env) ? $env : ''
    );
    return (string) apply_filters('fh_inquiry_webhook_secret', $value);
}

function fh_inquiry_mail_from(): string
{
    return fh_inquiry_config('FH_INQUIRY_MAIL_FROM', 'fh_inquiry_mail_from', 'inquiry@fenghuai.com');
}

function fh_inquiry_mail_to(): string
{
    return fh_inquiry_config('FH_INQUIRY_MAIL_TO', 'fh_inquiry_mail_to', 'sales@fenghuai.com');
}

function fh_inquiry_resend_key(): string
{
    $env = getenv('RESEND_API_KEY');
    return fh_inquiry_config('FH_RESEND_API_KEY', 'fh_inquiry_resend_api_key', is_string($env) ? $env : '');
}

/**
 * 渲染销售通知正文。
 *
 * ⚠️ 收件人只从服务端配置读；reply_to 用**已落库的**客户邮箱。客户端指定的收件人一律忽略。
 *
 * @return array{subject:string, text:string, html:string}
 */
function fh_inquiry_render_email(int $postId): array
{
    $title       = (string) get_post_field('post_title', $postId);
    $receivedAt  = (string) get_post_field('post_date_gmt', $postId) . ' UTC';
    $meta        = static fn(string $key): string => (string) get_post_meta($postId, $key, true);
    $dash        = static fn(string $value): string => $value !== '' ? $value : '—';
    $customerType = fh_inquiry_customer_type_options()[$meta('customer_type')] ?? $meta('customer_type');
    $productLine  = fh_inquiry_product_line_options()[$meta('product_line')] ?? $meta('product_line');
    // 不依赖当前 REST 请求是否有登录用户；点击后仍由 WordPress 登录与 capability 拦截。
    $adminUrl = admin_url('post.php?post=' . $postId . '&action=edit');

    $specRows = [];
    $specRaw  = $meta('context_spec_json');
    if ($specRaw !== '') {
        $decoded = json_decode($specRaw, true);
        if (is_array($decoded)) {
            foreach ($decoded as $key => $value) {
                $specRows[(string) $key] = is_scalar($value) || $value === null
                    ? (string) $value
                    : (string) wp_json_encode($value);
            }
        }
    }

    $specLines = [];
    foreach ($specRows as $key => $value) {
        $specLines[] = $key . ': ' . $value;
    }

    $items = [];
    $itemsRaw = $meta('inquiry_items_json');
    if ($itemsRaw !== '') {
        $decodedItems = json_decode($itemsRaw, true);
        if (is_array($decodedItems)) {
            $items = array_values(array_filter($decodedItems, static fn($item): bool => is_array($item)));
        }
    }
    $itemLines = [];
    foreach ($items as $index => $item) {
        $itemSpec = [];
        if (isset($item['spec']) && is_array($item['spec'])) {
            foreach ($item['spec'] as $key => $value) {
                if (is_scalar($value)) $itemSpec[] = $key . ': ' . $value;
            }
        }
        $itemLines[] = sprintf(
            '%d. %s / %s / quantity: %s%s',
            $index + 1,
            $dash((string) ($item['model'] ?? '')),
            $dash((string) ($item['productionCode'] ?? '')),
            $dash((string) ($item['quantity'] ?? '')),
            $itemSpec ? ' / ' . implode(', ', $itemSpec) : ''
        );
    }

    $lines = [
        'INQUIRY ' . $title,
        'Received: ' . $receivedAt,
        '',
        'CONTACT',
        '-------',
        'Name:     ' . $dash($meta('name')),
        'Email:    ' . $dash($meta('email')),
        'WhatsApp: ' . $dash($meta('whatsapp')),
        'Company:  ' . $dash($meta('company')),
        'Country:  ' . $dash($meta('country_code')),
        'Type:     ' . $dash($customerType),
        '',
        'INQUIRY DETAILS',
        '---------------',
        'Product:  ' . $dash($productLine),
        'Model:    ' . $dash($meta('context_model')),
        'Code:     ' . $dash($meta('context_production_code')),
        'Quantity: ' . $dash($meta('quantity')),
        'Inputs:   ' . $dash($meta('inputs_available')),
        '',
        'REQUESTED WHEEL LIST',
        '---------------------',
        $itemLines ? implode("\n", $itemLines) : '—',
        '',
        'MESSAGE',
        '-------',
        $dash($meta('message')),
        '',
        'SUBMITTED CONFIGURATION',
        '-----------------------',
        !empty($specLines) ? implode("\n", $specLines) : '—',
        'Configuration pending: ' . ($meta('variant_pending') === '1' ? 'yes' : 'no'),
        '',
        'SOURCE & CONSENT',
        '----------------',
        'Source page: ' . $dash($meta('context_source_page')),
        'Intent:      ' . $dash($meta('context_intent')),
        'Consent:     ' . $dash($meta('consented_at')) . ' (privacy ' . $dash($meta('privacy_version')) . ')',
        '',
        'WORDPRESS RECORD',
        '----------------',
        $adminUrl,
    ];

    $renderRows = static function (array $rows): string {
        $html = '';
        foreach ($rows as $label => $value) {
            $html .= '<tr>'
                . '<td style="width:120px;padding:9px 12px;border-bottom:1px solid #e5e7eb;color:#667085;font-size:13px;vertical-align:top">'
                . esc_html((string) $label)
                . '</td>'
                . '<td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;color:#101828;font-size:14px;vertical-align:top;word-break:break-word">'
                . esc_html($value !== '' ? (string) $value : '—')
                . '</td></tr>';
        }
        return $html;
    };

    $section = static function (string $titleText, string $content): string {
        return '<tr><td style="padding:0 24px 22px">'
            . '<h2 style="margin:0 0 10px;color:#101828;font-size:16px;line-height:1.4">'
            . esc_html($titleText)
            . '</h2>'
            . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;overflow:hidden">'
            . $content
            . '</table></td></tr>';
    };

    $contactRows = $renderRows([
        'Name'       => $dash($meta('name')),
        'Email'      => $dash($meta('email')),
        'WhatsApp'   => $dash($meta('whatsapp')),
        'Company'    => $dash($meta('company')),
        'Country'    => $dash($meta('country_code')),
        'Client type'=> $dash($customerType),
    ]);
    $detailRows = $renderRows([
        'Product line' => $dash($productLine),
        'Model'        => $dash($meta('context_model')),
        'Production code' => $dash($meta('context_production_code')),
        'Quantity'     => $dash($meta('quantity')),
        'Inputs available' => $dash($meta('inputs_available')),
    ]);
    $configurationRows = !empty($specRows)
        ? $renderRows($specRows)
        : $renderRows(['Configuration' => '—']);
    $configurationRows .= $renderRows([
        'Configuration pending' => $meta('variant_pending') === '1' ? 'Yes' : 'No',
    ]);
    if ($items) {
        $itemRows = [];
        foreach ($items as $index => $item) {
            $label = sprintf('%d. %s / %s', $index + 1, (string) ($item['model'] ?? '—'), (string) ($item['productionCode'] ?? '—'));
            $itemRows[$label] = 'Quantity: ' . (string) ($item['quantity'] ?? '—');
            if (isset($item['spec']) && is_array($item['spec'])) {
                foreach ($item['spec'] as $key => $value) {
                    if (is_scalar($value)) $itemRows['  ' . $key] = (string) $value;
                }
            }
        }
        $configurationRows = $renderRows(['Requested wheel list' => '']) . $renderRows($itemRows) . $configurationRows;
    }
    $originRows = $renderRows([
        'Source page' => $dash($meta('context_source_page')),
        'Intent'      => $dash($meta('context_intent')),
        'Consent'     => $dash($meta('consented_at')) . ' (privacy ' . $dash($meta('privacy_version')) . ')',
    ]);

    $html = '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
        . '<body style="margin:0;padding:0;background:#f2f4f7;font-family:Arial,Helvetica,sans-serif">'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f4f7"><tr><td align="center" style="padding:28px 12px">'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;border-collapse:separate;overflow:hidden">'
        . '<tr><td style="padding:24px;background:#111827;color:#ffffff">'
        . '<div style="font-size:12px;line-height:1.4;letter-spacing:.08em;text-transform:uppercase;color:#cbd5e1">New inquiry</div>'
        . '<h1 style="margin:5px 0 4px;font-size:24px;line-height:1.3">' . esc_html($title) . '</h1>'
        . '<div style="font-size:13px;line-height:1.5;color:#d1d5db">Received ' . esc_html($receivedAt) . '</div>'
        . '</td></tr>'
        . '<tr><td style="padding:20px 24px 22px">'
        . '<a href="' . esc_url($adminUrl) . '" style="display:inline-block;padding:11px 16px;border-radius:6px;background:#c2410c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700">View in WordPress</a>'
        . '<div style="margin-top:8px;color:#667085;font-size:12px">Login and inquiry permissions are required.</div>'
        . '</td></tr>'
        . $section('Contact', $contactRows)
        . $section('Inquiry details', $detailRows)
        . '<tr><td style="padding:0 24px 22px"><h2 style="margin:0 0 10px;color:#101828;font-size:16px;line-height:1.4">Message</h2>'
        . '<div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;color:#101828;font-size:14px;line-height:1.65;word-break:break-word">'
        . nl2br(esc_html($dash($meta('message'))), false)
        . '</div></td></tr>'
        . $section('Submitted configuration', $configurationRows)
        . $section('Source', $originRows)
        . '<tr><td style="padding:0 24px 24px;color:#667085;font-size:12px;line-height:1.5">'
        . 'This notification is a copy. WordPress is the system of record for this inquiry.'
        . '</td></tr></table></td></tr></table></body></html>';

    return [
        'subject' => sprintf(
            'Inquiry %s — %s',
            $title,
            $meta('company') !== '' ? $meta('company') : $meta('name')
        ),
        'text' => implode("\n", $lines),
        'html' => $html,
    ];
}

/**
 * 为一条发件箱记录做一次投递尝试，并把结果写回 outbox 行与 email_status。
 *
 * ⚠️ 绝不能改变「询盘已保存」这一事实：邮件失败只改邮件状态，不碰业务状态，
 * 也不回滚询盘（设计文档 §5.8「不能把邮件故障改成丢弃询盘」）。
 *
 * @return string 归一后的 email_status
 */
function fh_inquiry_dispatch_email(int $postId, int $outboxId): string
{
    global $wpdb;

    $outboxTable = fh_inquiry_outbox_table();
    $now         = gmdate('Y-m-d H:i:s');
    $apiKey      = fh_inquiry_resend_key();
    $to          = fh_inquiry_mail_to();
    $from        = fh_inquiry_mail_from();

    // $wpdb->update 对 null 值会写成 NULL 字面量，正好匹配可空列的语义。
    $writeOutbox = static function (array $fields) use ($outboxId, $outboxTable, $wpdb, $now): void {
        $fields['updated_at'] = $now;
        $wpdb->update($outboxTable, $fields, ['id' => $outboxId]);
    };

    // 本地完整验收会创建多条询盘；暂停开关只阻止外发，落库与 outbox 仍照常验证。
    // 默认不存在/关闭，不提供公开接口；清除后现有 pending 记录仍可由 worker 领取。
    if (get_option('fh_inquiry_delivery_paused', '0') === '1') {
        update_post_meta($postId, 'email_status', 'pending');
        update_post_meta($postId, 'email_error', '');
        $writeOutbox([
            'status'          => 'pending',
            'last_error'      => null,
            'next_attempt_at' => $now,
        ]);
        return 'pending';
    }

    // ── 通道选择：SMTP 优先，Resend 兜底 ────────────────────────────────────
    // 两条都没配才 pending（fail-closed，不假装成功也不假装失败）。
    $useSmtp = fh_inquiry_smtp_configured();

    if (!$useSmtp && ($apiKey === '' || $to === '' || $from === '')) {
        update_post_meta($postId, 'email_status', 'pending');
        update_post_meta($postId, 'email_error', '未配置发信通道（缺 SMTP 或 Resend / from / to）');
        $writeOutbox([
            'status'          => 'pending',
            'last_error'      => '未配置发信通道',
            'next_attempt_at' => $now,
        ]);
        return 'pending';
    }

    if ($to === '' || $from === '') {
        update_post_meta($postId, 'email_status', 'pending');
        update_post_meta($postId, 'email_error', '缺收件人或发件人地址');
        $writeOutbox([
            'status'          => 'pending',
            'last_error'      => '缺收件人或发件人地址',
            'next_attempt_at' => $now,
        ]);
        return 'pending';
    }

    $attempts = (int) $wpdb->get_var($wpdb->prepare("SELECT attempts FROM {$outboxTable} WHERE id = %d", $outboxId));
    $attempts++;

    $writeOutbox(['status' => 'sending', 'attempts' => $attempts]);
    update_post_meta($postId, 'email_status', 'sending');

    $rendered = fh_inquiry_render_email($postId);
    $replyTo  = (string) get_post_meta($postId, 'email', true);

    // ── 通道 A：SMTP（主）───────────────────────────────────────────────────
    if ($useSmtp) {
        $debug = '';
        $sent  = fh_inquiry_send_via_smtp(
            $to,
            $rendered['subject'],
            $rendered['html'],
            $rendered['text'],
            $replyTo,
            $debug
        );

        if ($sent['ok']) {
            update_post_meta($postId, 'email_status', 'accepted');
            update_post_meta($postId, 'email_error', '');
            $writeOutbox([
                'status'          => 'accepted',
                'last_error'      => null,
                'next_attempt_at' => null,
            ]);
            return 'accepted';
        }

        // 只记错误消息本身，绝不含授权码或客户联系方式
        $error = fh_inquiry_sanitize_delivery_error($sent['error']);
        update_post_meta($postId, 'email_status', 'failed');
        update_post_meta($postId, 'email_error', $error);
        $writeOutbox([
            'status'          => 'failed',
            'last_error'      => $error,
            'next_attempt_at' => fh_inquiry_backoff_at($attempts),
        ]);
        return 'failed';
    }

    // ── 通道 B：Resend（兜底）───────────────────────────────────────────────
    $response = wp_remote_post('https://api.resend.com/emails', [
        'timeout' => 8,
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type'  => 'application/json',
        ],
        'body' => wp_json_encode([
            'from'     => $from,
            'to'       => [$to],
            'reply_to' => $replyTo,
            'subject'  => $rendered['subject'],
            'html'     => $rendered['html'],
            'text'     => $rendered['text'],
        ]),
    ]);

    if (is_wp_error($response)) {
        $error = fh_inquiry_sanitize_delivery_error($response->get_error_message());
        update_post_meta($postId, 'email_status', 'failed');
        update_post_meta($postId, 'email_error', $error);
        $writeOutbox([
            'status'          => 'failed',
            'last_error'      => $error,
            'next_attempt_at' => fh_inquiry_backoff_at($attempts),
        ]);
        return 'failed';
    }

    $code = (int) wp_remote_retrieve_response_code($response);
    if ($code >= 200 && $code < 300) {
        $payload   = json_decode((string) wp_remote_retrieve_body($response), true);
        $messageId = is_array($payload) && isset($payload['id']) ? (string) $payload['id'] : '';
        update_post_meta($postId, 'provider_message_id', $messageId);
        update_post_meta($postId, 'email_status', 'accepted');
        update_post_meta($postId, 'email_error', '');
        $writeOutbox([
            'status'              => 'accepted',
            'last_error'          => null,
            'provider_message_id' => $messageId !== '' ? $messageId : null,
            'next_attempt_at'     => null,
        ]);
        return 'accepted';
    }

    $error = 'resend HTTP ' . $code;
    update_post_meta($postId, 'email_status', 'failed');
    update_post_meta($postId, 'email_error', $error);
    $writeOutbox([
        'status'          => 'failed',
        'last_error'      => $error,
        'next_attempt_at' => fh_inquiry_backoff_at($attempts),
    ]);
    return 'failed';

}

/**
 * 投递故障只能记录诊断类别，不能把邮箱、电话、密钥或长响应体写进 meta/outbox。
 */
function fh_inquiry_sanitize_delivery_error(string $error): string
{
    $safe = preg_replace('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', '[email]', $error);
    $safe = preg_replace('/(?<!\w)\+?\d[\d\s().-]{7,}\d(?!\w)/', '[phone]', (string) $safe);

    foreach ([fh_inquiry_resend_key(), fh_inquiry_smtp_pass(), fh_inquiry_service_key()] as $secret) {
        if ($secret !== '') {
            $safe = str_replace($secret, '[secret]', (string) $safe);
        }
    }

    return mb_substr(trim((string) $safe), 0, 500);
}

/** 暂定退避：1、5、15、60 分钟，之后 60 分钟封顶（设计文档 §5.8）。 */
function fh_inquiry_backoff_at(int $attempts): string
{
    $minutes = [1, 5, 15, 60];
    $idx     = max(0, min(count($minutes) - 1, $attempts - 1));
    return gmdate('Y-m-d H:i:s', time() + $minutes[$idx] * 60);
}

/* ============================================================================
 * 后台：菜单、列表页、详情
 * ========================================================================== */

add_action('admin_menu', 'fh_inquiry_register_admin_menu');
function fh_inquiry_register_admin_menu(): void
{
    add_menu_page(
        '询盘',
        '询盘' . fh_inquiry_menu_badge(),
        FH_INQUIRY_CAP_MANAGE,
        'fh-inquiries',
        'fh_inquiry_render_list',
        'dashicons-email',
        26
    );
}

function fh_inquiry_admin_badge(string $value, array $map, string $defaultColor = '#646970'): string
{
    [$label, $color] = $map[$value] ?? [$value, $defaultColor];
    return sprintf(
        '<span style="display:inline-block;padding:1px 7px;border-radius:10px;background:%s;color:#fff;font-size:11px">%s</span>',
        esc_attr($color),
        esc_html($label === '' ? '—' : $label)
    );
}

/** 邮件状态的展示映射（只读列用）。 */
function fh_inquiry_email_badge_map(): array
{
    $colors = [
        'accepted'  => '#00a32a',
        'delivered' => '#00a32a',
        'pending'   => '#dba617',
        'sending'   => '#2271b1',
        'failed'    => '#d63638',
        'bounced'   => '#d63638',
        'unknown'   => '#646970',
    ];

    $map = [];
    foreach (fh_inquiry_email_status_options() as $value => $label) {
        $map[$value] = [$label, $colors[$value] ?? '#646970'];
    }
    return $map;
}

function fh_inquiry_render_list(): void
{
    if (!current_user_can(FH_INQUIRY_CAP_MANAGE)) {
        wp_die('无权访问询盘。', '', ['response' => 403]);
    }

    // ── 工作台：tab / 状态筛选 / 搜索 ───────────────────────────────────────
    $tab    = isset($_GET['tab']) ? sanitize_key((string) $_GET['tab']) : 'list';
    if ($tab === 'outbox') {
        fh_inquiry_render_outbox_panel();
        return;
    }

    $status = isset($_GET['status']) ? sanitize_key((string) $_GET['status']) : 'all';
    if ($status !== 'all' && !array_key_exists($status, fh_inquiry_business_status_options())) {
        $status = 'all';
    }
    $search = isset($_GET['s']) ? sanitize_text_field((string) $_GET['s']) : '';
    $paged  = isset($_GET['paged']) ? max(1, absint($_GET['paged'])) : 1;

    $args = [
        'post_type'           => FH_INQUIRY_POST_TYPE,
        'post_status'         => 'any',
        'posts_per_page'      => 20,
        'paged'               => $paged,
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ];

    if ($status !== 'all') {
        $args['meta_query'] = [
            [
                'key'     => 'business_status',
                'value'   => $status,
                'compare' => '=',
            ],
        ];
    }

    // 搜索：标题（询盘号）走 s，其余字段走 meta 命中的 id 集合
    $searchIds = null;
    if ($search !== '') {
        $metaIds = fh_inquiry_search_ids($search);
        $titleQuery = new WP_Query([
            'post_type'      => FH_INQUIRY_POST_TYPE,
            'post_status'    => 'any',
            'posts_per_page' => 200,
            'fields'         => 'ids',
            's'              => $search,
        ]);
        $searchIds = array_values(array_unique(array_merge(
            $metaIds,
            array_map('intval', (array) $titleQuery->posts)
        )));
        if (empty($searchIds)) {
            $searchIds = [0]; // 空集：明确返回「无结果」而不是退化成全量
        }
        $args['post__in'] = $searchIds;
    }

    $query = new WP_Query($args);

    $businessOptions = fh_inquiry_business_status_options();
    $customerOptions = fh_inquiry_customer_type_options();
    $lineOptions     = fh_inquiry_product_line_options();
    $emailBadgeMap   = fh_inquiry_email_badge_map();

    echo '<div class="wrap"><h1>询盘</h1>';

    $counts = fh_inquiry_status_counts();
    fh_inquiry_render_search_box($search, $status);
    fh_inquiry_render_status_tabs($status, $counts, $search);

    if (isset($_GET['fh_updated'])) {
        echo '<div class="notice notice-success is-dismissible"><p>业务状态已更新。</p></div>';
    }

    echo '<p class="description">业务状态可在本页直接修改；<strong>邮件状态只读</strong> —— 它由投递流程写入，不代表业务进展。</p>';
    echo '<table class="wp-list-table widefat fixed striped"><thead><tr>'
        . '<th style="width:180px">询盘号</th>'
        . '<th style="width:180px">客户</th>'
        . '<th style="width:110px">客户类型</th>'
        . '<th style="width:110px">产品线</th>'
        . '<th>型号 / 生产代码</th>'
        . '<th style="width:200px">业务状态</th>'
        . '<th style="width:130px">邮件状态</th>'
        . '<th style="width:150px">时间</th>'
        . '</tr></thead><tbody>';

    if (!$query->have_posts()) {
        echo '<tr><td colspan="8">还没有询盘。</td></tr>';
    }

    while ($query->have_posts()) {
        $query->the_post();
        $id = (int) get_the_ID();

        $customerEmail = (string) get_post_meta($id, 'email', true);
        $customerName  = (string) get_post_meta($id, 'name', true);
        $customerCompany = (string) get_post_meta($id, 'company', true);
        $customerType = (string) get_post_meta($id, 'customer_type', true);
        $productLine  = (string) get_post_meta($id, 'product_line', true);
        $model        = (string) get_post_meta($id, 'context_model', true);
        $code         = (string) get_post_meta($id, 'context_production_code', true);
        $status       = (string) get_post_meta($id, 'business_status', true);
        $emailStatus  = (string) get_post_meta($id, 'email_status', true);

        if (!array_key_exists($status, $businessOptions)) {
            $status = 'new';
        }
        if (!array_key_exists($emailStatus, fh_inquiry_email_status_options())) {
            $emailStatus = 'pending';
        }

        echo '<tr>';

        // 询盘号 → 详情（详情页只读展示完整消息与规格快照）
        printf(
            '<td><strong><a href="%s">%s</a></strong>%s</td>',
            esc_url((string) get_edit_post_link($id)),
            esc_html(get_the_title()),
            (string) get_post_meta($id, 'variant_pending', true) === '1'
                ? '<br><span style="color:#d63638;font-size:11px">⚠ 配置待确认</span>'
                : ''
        );

        // 客户列：姓名 / 公司 / 邮箱（业务员不必点进详情才知道是谁）
        echo '<td>';
        $who = trim($customerName . ($customerCompany !== '' ? ' · ' . $customerCompany : ''));
        if ($who !== '') {
            echo '<div>' . esc_html($who) . '</div>';
        }
        if ($customerEmail !== '') {
            // 邮箱已经过服务端校验；后台历史脏数据仍只展示文本，不生成危险链接。
            $safeEmail = sanitize_email($customerEmail);
            if ($safeEmail !== '' && is_email($safeEmail)) {
                echo '<div><a href="' . esc_url('mailto:' . $safeEmail) . '">' . esc_html($customerEmail) . '</a></div>';
            } else {
                echo '<div>' . esc_html($customerEmail) . '</div>';
            }
        }
        if ($who === '' && $customerEmail === '') {
            echo '—';
        }
        echo '</td>';

        printf('<td>%s</td>', esc_html($customerOptions[$customerType] ?? '—'));
        printf('<td>%s</td>', esc_html($lineOptions[$productLine] ?? '—'));
        printf(
            '<td>%s</td>',
            $model === '' && $code === ''
                ? '—'
                : esc_html(trim($model . ($code !== '' ? ' / ' . $code : '')))
        );

        // 业务状态：可改。表单提交到 admin-post，最终由 save_post_fh_inquiry 落库。
        echo '<td>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:flex;gap:6px;align-items:center;margin:0">';
        echo '<input type="hidden" name="action" value="fh_inquiry_update_status" />';
        echo '<input type="hidden" name="inquiry_id" value="' . esc_attr((string) $id) . '" />';
        // 字段保存用的 nonce（save_post_fh_inquiry 校验它）
        echo '<input type="hidden" name="fh_inquiry_nonce" value="' . esc_attr(wp_create_nonce('fh_inquiry_save_fields')) . '" />';
        // 本动作自身的 CSRF nonce
        wp_nonce_field('fh_inquiry_update_status_' . $id, '_fh_status_nonce', false);
        echo '<select name="business_status">';
        foreach ($businessOptions as $value => $label) {
            printf(
                '<option value="%s"%s>%s</option>',
                esc_attr($value),
                selected($status, $value, false),
                esc_html($label)
            );
        }
        echo '</select>';
        echo '<button type="submit" class="button button-small">保存</button>';
        echo '</form>';
        echo '</td>';

        // 邮件状态：只读
        printf('<td>%s</td>', fh_inquiry_admin_badge($emailStatus, $emailBadgeMap));

        printf('<td>%s</td>', esc_html(get_the_date('Y-m-d H:i')));

        echo '</tr>';
    }

    echo '</tbody></table>';

    // 发件箱派发面板（worker 的可观测面）
    if (current_user_can(FH_INQUIRY_CAP_DELIVERY)
        && (!isset($_GET['tab']) || $_GET['tab'] !== 'outbox')
    ) {
        echo '<p><a href="' . esc_url(add_query_arg(['page' => 'fh-inquiries', 'tab' => 'outbox'], admin_url('admin.php'))) . '">查看发件箱派发状态</a></p>';
    }

    if ($query->max_num_pages > 1) {
        $links = paginate_links([
            'base'      => add_query_arg('paged', '%#%'),
            'format'    => '',
            'current'   => $paged,
            'total'     => $query->max_num_pages,
            'prev_text' => '‹',
            'next_text' => '›',
        ]);
        if ($links) {
            echo '<div class="tablenav"><div class="tablenav-pages">' . wp_kses_post($links) . '</div></div>';
        }
    }

    echo '</div>';
    wp_reset_postdata();
}

/* ============================================================================
 * 后台：详情页的 meta box（业务字段可改 / 邮件状态只读 / 完整快照只读）
 * ========================================================================== */

add_action('add_meta_boxes', 'fh_inquiry_add_meta_boxes');
function fh_inquiry_add_meta_boxes(): void
{
    // 原生「自定义字段」面板是任意 meta 的入口，会让「邮件状态只读」形同虚设。
    // 它由 core 在 do_action('add_meta_boxes') 之前注册，所以这里能删掉它。
    remove_meta_box('postcustom', FH_INQUIRY_POST_TYPE, 'normal');

    add_meta_box('fh_inquiry_business', '业务处理', 'fh_inquiry_render_business_box', FH_INQUIRY_POST_TYPE, 'normal', 'high');
    add_meta_box('fh_inquiry_message', '客户填写的需求', 'fh_inquiry_render_message_box', FH_INQUIRY_POST_TYPE, 'normal', 'default');
    add_meta_box('fh_inquiry_context', '规格与来源快照（只读）', 'fh_inquiry_render_context_box', FH_INQUIRY_POST_TYPE, 'normal', 'default');
    add_meta_box('fh_inquiry_email', '邮件状态（只读）', 'fh_inquiry_render_email_box', FH_INQUIRY_POST_TYPE, 'side', 'default');
}

function fh_inquiry_render_business_box(WP_Post $post): void
{
    wp_nonce_field('fh_inquiry_save_fields', 'fh_inquiry_nonce');

    $status = (string) get_post_meta($post->ID, 'business_status', true);
    if (!array_key_exists($status, fh_inquiry_business_status_options())) {
        $status = 'new';
    }

    echo '<style>.fh-inq-grid{display:grid;grid-template-columns:120px 1fr;gap:10px 16px;align-items:center;max-width:720px}'
        . '.fh-inq-grid label{font-weight:600}.fh-inq-grid input,.fh-inq-grid select{width:100%;max-width:520px}</style>';

    echo '<div class="fh-inq-grid">';

    echo '<label for="business_status">业务状态</label><select id="business_status" name="business_status">';
    foreach (fh_inquiry_business_status_options() as $value => $label) {
        printf('<option value="%s"%s>%s</option>', esc_attr($value), selected($status, $value, false), esc_html($label));
    }
    echo '</select>';

    foreach (['assigned_to' => '负责人', 'internal_note' => '内部备注'] as $key => $label) {
        printf(
            '<label for="%1$s">%2$s</label><input type="text" id="%1$s" name="%1$s" value="%3$s" />',
            esc_attr($key),
            esc_html($label),
            esc_attr((string) get_post_meta($post->ID, $key, true))
        );
    }

    echo '</div>';
    echo '<p class="description" style="margin-top:12px">业务状态是销售流程的真相源；它和右侧的邮件状态是两件事，不要互相推断。</p>';
}

function fh_inquiry_render_message_box(WP_Post $post): void
{
    $customerType = (string) get_post_meta($post->ID, 'customer_type', true);
    $productLine  = (string) get_post_meta($post->ID, 'product_line', true);

    $rows = [
        '客户类型'   => fh_inquiry_customer_type_options()[$customerType] ?? '—',
        '产品线'     => fh_inquiry_product_line_options()[$productLine] ?? '—',
        '联系人'     => (string) get_post_meta($post->ID, 'name', true),
        '邮箱'       => (string) get_post_meta($post->ID, 'email', true),
        '公司'       => (string) get_post_meta($post->ID, 'company', true),
        '国家/地区'  => (string) get_post_meta($post->ID, 'country_code', true),
        'WhatsApp'   => (string) get_post_meta($post->ID, 'whatsapp', true),
        '数量'       => (string) get_post_meta($post->ID, 'quantity', true),
        '现有输入'   => (string) get_post_meta($post->ID, 'inputs_available', true),
        '同意版本'   => (string) get_post_meta($post->ID, 'privacy_version', true),
        '同意时间'   => (string) get_post_meta($post->ID, 'consented_at', true),
    ];

    echo '<table class="widefat striped"><tbody>';
    foreach ($rows as $label => $value) {
        printf(
            '<tr><th style="width:130px">%s</th><td>%s</td></tr>',
            esc_html($label),
            esc_html($value !== '' ? $value : '—')
        );
    }
    echo '</tbody></table>';

    // ⚠️ 客户消息是不可信输入 —— 这里用 <pre> + esc_html，绝不原样输出 HTML。
    echo '<h4 style="margin:16px 0 6px">需求描述</h4>';
    printf(
        '<pre style="margin:0;padding:10px;background:#f6f7f7;border:1px solid #dcdcde;white-space:pre-wrap;word-break:break-word;font-size:12px">%s</pre>',
        esc_html((string) get_post_meta($post->ID, 'message', true))
    );
}

function fh_inquiry_render_context_box(WP_Post $post): void
{
    echo '<table class="widefat striped"><tbody>';
    foreach (fh_inquiry_context_fields() as $key => $label) {
        $value = (string) get_post_meta($post->ID, $key, true);

        if ($key === 'variant_pending') {
            $value = $value === '1' ? '是（客户给了型号线索但服务端未解析到有效配置）' : '否';
        } elseif ($key === 'context_spec_json' && $value !== '') {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                $parts = [];
                foreach ($decoded as $k => $v) {
                    $parts[] = $k . ': ' . $v;
                }
                $value = implode(' · ', $parts);
            }
        }

        printf(
            '<tr><th style="width:170px">%s</th><td><pre style="margin:0;white-space:pre-wrap;font-size:12px">%s</pre></td></tr>',
            esc_html($label),
            esc_html($value !== '' ? $value : '—')
        );
    }
    $itemsRaw = (string) get_post_meta($post->ID, 'inquiry_items_json', true);
    $items = $itemsRaw !== '' ? json_decode($itemsRaw, true) : [];
    if (!is_array($items) || count($items) === 0) {
        $items = [];
    }
    echo '<tr><th style="width:170px">轮毂询价清单</th><td>';
    if (!$items) {
        echo '—';
    } else {
        echo '<ol style="margin:0;padding-left:20px">';
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $label = trim((string) ($item['model'] ?? '') . ' / ' . (string) ($item['productionCode'] ?? ''));
            $quantity = (string) ($item['quantity'] ?? '—');
            $spec = isset($item['spec']) && is_array($item['spec'])
                ? implode(' · ', array_map(static fn($key, $value): string => $key . ': ' . (string) $value, array_keys($item['spec']), $item['spec']))
                : '';
            printf('<li><strong>%s</strong> × %s%s</li>', esc_html($label), esc_html($quantity), $spec !== '' ? ' <span style="color:#646970">(' . esc_html($spec) . ')</span>' : '');
        }
        echo '</ol>';
    }
    echo '</td></tr>';
    echo '</tbody></table>';
}

function fh_inquiry_render_email_box(WP_Post $post): void
{
    $status = (string) get_post_meta($post->ID, 'email_status', true);
    if (!array_key_exists($status, fh_inquiry_email_status_options())) {
        $status = 'pending';
    }

    echo '<p style="margin-top:0"><strong>邮件状态</strong>（只读）</p>';
    printf('<p>%s</p>', fh_inquiry_admin_badge($status, fh_inquiry_email_badge_map()));

    $error = (string) get_post_meta($post->ID, 'email_error', true);
    if ($error !== '') {
        printf('<p style="color:#d63638;word-break:break-word">%s</p>', esc_html($error));
    }

    $messageId = (string) get_post_meta($post->ID, 'provider_message_id', true);
    if ($messageId !== '') {
        printf('<p style="word-break:break-all"><code>%s</code></p>', esc_html($messageId));
    }

    echo '<p class="description">「提供商已接受」不等于「已送达」，更不等于客户已读。本字段不参与业务判断。</p>';
}

/* ============================================================================
 * 保存业务字段（后台唯一的写入口）
 * ========================================================================== */

add_action('save_post_' . FH_INQUIRY_POST_TYPE, 'fh_inquiry_save_fields', 10, 2);
function fh_inquiry_save_fields(int $postId, WP_Post $post): void
{
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (wp_is_post_revision($postId) || wp_is_post_autosave($postId)) {
        return;
    }
    // 非 POST 直接返回（GET 浏览详情页不该触发写）。
    if (!isset($_SERVER['REQUEST_METHOD']) || strtoupper((string) $_SERVER['REQUEST_METHOD']) !== 'POST') {
        return;
    }
    if (!isset($_POST['fh_inquiry_nonce'])
        || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['fh_inquiry_nonce'])), 'fh_inquiry_save_fields')
    ) {
        return;
    }
    if (!current_user_can('edit_post', $postId)) {
        return;
    }

    foreach (fh_inquiry_business_fields() as $key => $spec) {
        if (!isset($_POST[$key])) {
            continue;
        }
        $value = sanitize_text_field(wp_unslash($_POST[$key]));
        if ($spec['options'] !== null && !array_key_exists($value, $spec['options'])) {
            continue; // 非法取值 → 不改（fail-closed）
        }
        update_post_meta($postId, $key, $value);
    }

    // ⚠️ 邮件状态字段**故意不在这里处理**：它只由投递流程写，后台只读。
}

/**
 * 列表页的内联「保存」。
 *
 * 这里只做 CSRF 与能力校验，然后调用 wp_update_post() 触发 `save_post_fh_inquiry` ——
 * 让业务字段的落库逻辑始终只有一处（避免两条路径各自实现一套校验）。
 */
add_action('admin_post_fh_inquiry_update_status', 'fh_inquiry_handle_update_status');
function fh_inquiry_handle_update_status(): void
{
    if (!current_user_can(FH_INQUIRY_CAP_MANAGE)) {
        wp_die('无权修改询盘。', '', ['response' => 403]);
    }

    $id = isset($_POST['inquiry_id']) ? absint($_POST['inquiry_id']) : 0;
    if (!$id || get_post_type($id) !== FH_INQUIRY_POST_TYPE) {
        wp_die('未知询盘。', '', ['response' => 400]);
    }

    check_admin_referer('fh_inquiry_update_status_' . $id, '_fh_status_nonce');

    if (!current_user_can('edit_post', $id)) {
        wp_die('无权修改这条询盘。', '', ['response' => 403]);
    }

    $value = isset($_POST['business_status']) ? sanitize_text_field(wp_unslash($_POST['business_status'])) : '';
    if (!array_key_exists($value, fh_inquiry_business_status_options())) {
        wp_die('业务状态取值不合法。', '', ['response' => 400]);
    }

    // 空更新 —— 真正的落库在 save_post_fh_inquiry 里（它读 $_POST 里的 business_status）。
    wp_update_post(['ID' => $id]);

    wp_safe_redirect(add_query_arg(['page' => 'fh-inquiries', 'fh_updated' => 1], admin_url('admin.php')));
    exit;
}

/* ============================================================================
 * 自检（供验收脚本与运维调用）
 * ========================================================================== */

/**
 * 返回本插件注册内容的现状，供脚本侧断言。
 *
 * @return array<string, mixed>
 */
function fh_inquiry_self_check(): array
{
    global $wpdb;

    $tables = [
        'key'    => fh_inquiry_key_table(),
        'outbox' => fh_inquiry_outbox_table(),
        'event'  => fh_inquiry_event_table(),
    ];

    $exists  = [];
    $indexes = [];
    foreach ($tables as $name => $table) {
        // 用 information_schema 精确匹配（SHOW TABLES LIKE 会把表名里的 _ 当通配符）。
        $exists[$name] = ((int) $wpdb->get_var(
            $wpdb->prepare(
                'SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s',
                DB_NAME,
                $table
            )
        )) === 1;

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                'SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE FROM information_schema.STATISTICS
                  WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s ORDER BY INDEX_NAME, SEQ_IN_INDEX',
                DB_NAME,
                $table
            ),
            ARRAY_A
        );
        $indexes[$name] = array_map(
            static fn(array $r): array => [
                'name'   => $r['INDEX_NAME'],
                'column' => $r['COLUMN_NAME'],
                'unique' => (int) $r['NON_UNIQUE'] === 0,
            ],
            $rows ?: []
        );
    }

    $object = get_post_type_object(FH_INQUIRY_POST_TYPE);

    return [
        'post_type'       => FH_INQUIRY_POST_TYPE,
        'registered'      => post_type_exists(FH_INQUIRY_POST_TYPE),
        'show_in_rest'    => $object ? (bool) $object->show_in_rest : null,
        'supports'        => array_keys(get_all_post_type_supports(FH_INQUIRY_POST_TYPE)),
        'meta_keys'       => array_keys((array) get_registered_meta_keys('post', FH_INQUIRY_POST_TYPE)),
        'expected_meta'   => fh_inquiry_all_meta_keys(),
        'tables'          => $tables,
        'tables_exist'    => $exists,
        'indexes'         => $indexes,
        'schema_version'  => (string) get_option(FH_INQUIRY_DB_VERSION_OPTION, ''),
        'service_key_set' => fh_inquiry_service_key() !== '',
        'rest_route'      => '/' . FH_INQUIRY_REST_NAMESPACE . '/inquiries',
        'mail_configured' => fh_inquiry_resend_key() !== '' && fh_inquiry_mail_to() !== '',
    ];
}

/* ============================================================================
 * 发件箱派发 worker
 *
 * ── 为什么必须有这一段 ──────────────────────────────────────────────────────
 * 提交瞬间 fh_inquiry_rest_create() 会同步调用一次 fh_inquiry_dispatch_email()。
 * 那一次失败（例如未配置发信通道）后，outbox 行留在 pending：attempts 不增、
 * next_attempt_at 已经写了，但**没有任何东西会再来领它** —— 邮件就永久卡住。
 *
 * 本段补上缺失的另一半：一个 WP-Cron 循环 + 租赁制领单，让 pending/failed
 * 的记录能被反复领取直到成功或达到上限。
 *
 * 租赁制是防重复发信的核心：多条并发请求（cron 与手动触发撞在一起）必须靠
 * 一条原子 UPDATE 抢租约，抢到才发。判据是 UPDATE 的影响行数 == 1。
 * ========================================================================== */

/** 派发循环的 hook 名。 */
const FH_INQUIRY_DISPATCH_HOOK = 'fh_inquiry_dispatch_tick';

/** 循环间隔（WP-Cron 的具名间隔键，见 fh_inquiry_cron_intervals）。 */
const FH_INQUIRY_DISPATCH_INTERVAL = 'fh_inquiry_every_5_minutes';

/** 单次循环最多处理几条（防爆，也防一条坏记录拖死整个循环）。 */
const FH_INQUIRY_DISPATCH_BATCH = 10;

/** 一条发件箱记录最多尝试几次，达到即放弃并转 failed。 */
const FH_INQUIRY_DISPATCH_MAX_ATTEMPTS = 5;

/** 租约时长（分钟）。超过后视为僵死，可被别人捡起。 */
const FH_INQUIRY_DISPATCH_LEASE_MINUTES = 5;

/** 每次循环最多领几批 —— 未使用，保留以说明批次上限的含义。 */

/**
 * 注册 5 分钟间隔。
 *
 * WP-Cron 默认只有 hourly / twicedaily / daily，所以自己加一个具名间隔。
 */
function fh_inquiry_cron_intervals(array $schedules): array
{
    if (!isset($schedules[FH_INQUIRY_DISPATCH_INTERVAL])) {
        $schedules[FH_INQUIRY_DISPATCH_INTERVAL] = [
            'interval' => 5 * 60,
            'display'  => '每 5 分钟（询盘发件箱派发）',
        ];
    }
    return $schedules;
}
add_filter('cron_schedules', 'fh_inquiry_cron_intervals');

/**
 * 确保调度已注册（幂等）。
 *
 * 必须在 wp_next_scheduled() 判重后再排，否则每次访问都会新排一个。
 */
function fh_inquiry_schedule_dispatch(): void
{
    if (!wp_next_scheduled(FH_INQUIRY_DISPATCH_HOOK)) {
        wp_schedule_event(time(), FH_INQUIRY_DISPATCH_INTERVAL, FH_INQUIRY_DISPATCH_HOOK);
    }
    if (!wp_next_scheduled(FH_INQUIRY_ALERT_HOOK)) {
        wp_schedule_event(time() + 60, FH_INQUIRY_ALERT_INTERVAL, FH_INQUIRY_ALERT_HOOK);
    }
}
add_action('init', 'fh_inquiry_schedule_dispatch');

/**
 * 返回发件箱积压的最小化摘要。
 *
 * 只返回计数和时间，不读取或记录客户邮箱、电话和正文。due 只统计仍可重试的
 * pending/failed；达到上限且无下次时间的记录单独计入 abandoned。
 *
 * @return array{due:int,abandoned:int,expiredLeases:int,oldestDueAt:?string,checkedAt:string}
 */
function fh_inquiry_delivery_alert_summary(): array
{
    global $wpdb;

    $table = fh_inquiry_outbox_table();
    $now = gmdate('Y-m-d H:i:s');
    $max = FH_INQUIRY_DISPATCH_MAX_ATTEMPTS;
    $due = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$table}
         WHERE status IN ('pending','failed')
           AND attempts < %d
           AND (next_attempt_at IS NULL OR next_attempt_at <= %s)",
        $max,
        $now
    ));
    $abandoned = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$table}
         WHERE status = 'failed' AND attempts >= %d AND next_attempt_at IS NULL",
        $max
    ));
    $expiredLeases = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$table}
         WHERE lease_owner IS NOT NULL AND lease_expires_at IS NOT NULL AND lease_expires_at <= %s",
        $now
    ));
    $oldest = $wpdb->get_var($wpdb->prepare(
        "SELECT MIN(created_at) FROM {$table}
         WHERE status IN ('pending','failed')
           AND attempts < %d
           AND (next_attempt_at IS NULL OR next_attempt_at <= %s)",
        $max,
        $now
    ));

    return [
        'due'           => $due,
        'abandoned'     => $abandoned,
        'expiredLeases' => $expiredLeases,
        'oldestDueAt'   => $oldest ? (string) $oldest : null,
        'checkedAt'     => $now,
    ];
}

/** 读取积压告警阈值；默认 1，避免失败记录静默堆积。 */
function fh_inquiry_delivery_alert_threshold(): int
{
    $raw = defined('FH_INQUIRY_ALERT_BACKLOG_THRESHOLD')
        ? constant('FH_INQUIRY_ALERT_BACKLOG_THRESHOLD')
        : getenv('FH_INQUIRY_ALERT_BACKLOG_THRESHOLD');
    $threshold = is_numeric($raw) ? (int) $raw : 1;
    return max(1, (int) apply_filters('fh_inquiry_delivery_alert_threshold', $threshold));
}

/**
 * 运行积压监控并触发告警动作。
 *
 * 日志只含计数与时间；相同指纹 15 分钟内不重复写日志，外部系统可监听
 * `fh_inquiry_delivery_alert` 发送通知（企业微信、监控平台等）。
 *
 * @return array<string,int|string|bool|null>
 */
function fh_inquiry_run_alert_monitor(): array
{
    $summary = fh_inquiry_delivery_alert_summary();
    $triggered = $summary['due'] >= fh_inquiry_delivery_alert_threshold() || $summary['abandoned'] > 0;
    $summary['triggered'] = $triggered;
    update_option('fh_inquiry_last_alert_summary', wp_json_encode($summary, JSON_UNESCAPED_UNICODE), false);

    if (!$triggered) {
        return $summary;
    }

    $fingerprint = hash('sha256', wp_json_encode([
        $summary['due'],
        $summary['abandoned'],
        $summary['expiredLeases'],
    ]));
    $previous = (string) get_option('fh_inquiry_last_alert_fingerprint', '');
    $lastAt = (int) get_option('fh_inquiry_last_alert_at', 0);
    if ($fingerprint !== $previous || time() - $lastAt >= 15 * MINUTE_IN_SECONDS) {
        error_log(sprintf(
            '[fh-inquiry-alert] due=%d abandoned=%d expired_leases=%d checked_at=%s',
            $summary['due'],
            $summary['abandoned'],
            $summary['expiredLeases'],
            $summary['checkedAt']
        ));
        update_option('fh_inquiry_last_alert_fingerprint', $fingerprint, false);
        update_option('fh_inquiry_last_alert_at', time(), false);
        do_action('fh_inquiry_delivery_alert', $summary);
    }

    return $summary;
}
add_action(FH_INQUIRY_ALERT_HOOK, 'fh_inquiry_run_alert_monitor');

/**
 * 领一批待派发的 outbox 行。
 *
 * 条件：状态是 pending 或 failed ｜ 未到重试时间的不领 ｜ 未达上限 ｜ 无有效租约。
 * 僵死租约（lease_expires_at 已过）可被重新领取 —— 否则进程被杀会让记录永久卡住。
 *
 * @return array<int,array<string,mixed>>
 */
function fh_inquiry_claim_outbox(int $limit = FH_INQUIRY_DISPATCH_BATCH): array
{
    global $wpdb;

    $table  = fh_inquiry_outbox_table();
    $now    = gmdate('Y-m-d H:i:s');
    $owner  = fh_inquiry_lease_owner();
    $expiry = gmdate('Y-m-d H:i:s', time() + FH_INQUIRY_DISPATCH_LEASE_MINUTES * 60);
    $max    = FH_INQUIRY_DISPATCH_MAX_ATTEMPTS;

    // 先挑候选 id（只读，不锁）
    $ids = $wpdb->get_col($wpdb->prepare(
        "SELECT id FROM {$table}
         WHERE status IN ('pending','failed')
           AND attempts < %d
           AND (next_attempt_at IS NULL OR next_attempt_at <= %s)
           AND (lease_owner IS NULL OR lease_expires_at IS NULL OR lease_expires_at <= %s)
         ORDER BY id ASC
         LIMIT %d",
        $max,
        $now,
        $now,
        $limit
    ));

    if (empty($ids)) {
        return [];
    }

    $claimed = [];
    foreach ($ids as $id) {
        $id = (int) $id;
        // 原子抢租约：只有影响行数 == 1 才算抢到
        $affected = $wpdb->query($wpdb->prepare(
            "UPDATE {$table}
             SET lease_owner = %s, lease_expires_at = %s, updated_at = %s
             WHERE id = %d
               AND status IN ('pending','failed')
               AND attempts < %d
               AND (lease_owner IS NULL OR lease_expires_at IS NULL OR lease_expires_at <= %s)",
            $owner,
            $expiry,
            $now,
            $id,
            $max,
            $now
        ));

        if ($affected === 1) {
            $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $id), ARRAY_A);
            if ($row) {
                $claimed[] = $row;
            }
        }
    }

    return $claimed;
}

/**
 * 本次进程的租约标识。够独特即可，无需全局唯一。
 */
function fh_inquiry_lease_owner(): string
{
    return substr(wp_generate_uuid4(), 0, 32);
}

/**
 * 派发循环本体。
 *
 * 返回统计数组，供手动触发与自检使用。注意：任何失败都不得让循环抛异常，
 * 否则 WP-Cron 会把这个事件标记为失败并不再续排。
 *
 * @return array{claimed:int, dispatched:int, accepted:int, failed:int, abandoned:int}
 */
function fh_inquiry_run_dispatch(): array
{
    global $wpdb;

    $stats = [
        'claimed'   => 0,
        'dispatched' => 0,
        'accepted'  => 0,
        'failed'    => 0,
        'abandoned' => 0,
    ];

    $rows = fh_inquiry_claim_outbox();
    $stats['claimed'] = count($rows);

    $table = fh_inquiry_outbox_table();
    $now   = gmdate('Y-m-d H:i:s');

    foreach ($rows as $row) {
        $outboxId = (int) $row['id'];
        $inquiryId = (int) $row['inquiry_id'];
        // attempts 以领单快照为准；派发后由 worker 统一 +1
        $attempts        = (int) $row['attempts'];
        $claimedAttempts = $attempts;

        try {
            $status = fh_inquiry_dispatch_email($inquiryId, $outboxId);
        } catch (\Throwable $e) {
            // 不得把客户信息写进 last_error，只记异常类名
            $status = 'failed';
            $wpdb->update(
                $table,
                [
                    'status'          => 'failed',
                    'attempts'        => $attempts + 1,
                    'last_error'      => 'dispatch exception: ' . get_class($e),
                    'next_attempt_at' => fh_inquiry_backoff_at($attempts + 1),
                    'lease_owner'     => null,
                    'lease_expires_at' => null,
                    'updated_at'      => gmdate('Y-m-d H:i:s'),
                ],
                ['id' => $outboxId]
            );
            $stats['failed']++;
            continue;
        }

        $stats['dispatched']++;

        // 以库里的实际值为准：dispatch_email 在未配置发信通道时会提前 return，
        // 不写 attempts（既有行为）。worker 侧必须兜住，否则 attempts 恒为 0，
        // 退避永远停在第一档、上限判定永不生效 → 坏记录会被无限重试。
        $fresh     = $wpdb->get_row($wpdb->prepare("SELECT attempts, status FROM {$table} WHERE id = %d", $outboxId), ARRAY_A);
        $attempts  = $fresh ? (int) $fresh['attempts'] : $attempts;
        $curStatus = $fresh ? (string) $fresh['status'] : '';

        // worker 统一负责计数：不论 dispatch_email 有没有自增（它在未配置通道时
        // 会提前 return 不写 attempts），这里都以「领单前的值 + 1」为准写回。
        // 这样上限判定才有意义 —— 否则坏记录会被无限重试。
        $counted = $claimedAttempts + 1;
        $wpdb->update(
            $table,
            ['attempts' => $counted, 'updated_at' => gmdate('Y-m-d H:i:s')],
            ['id' => $outboxId]
        );
        $attempts = $counted;

        if ($status === 'accepted') {
            $stats['accepted']++;
            // 成功即释放租约（dispatch_email 已写过 status/next_attempt_at）
            $wpdb->update(
                $table,
                ['lease_owner' => null, 'lease_expires_at' => null, 'updated_at' => gmdate('Y-m-d H:i:s')],
                ['id' => $outboxId]
            );
            continue;
        }

        $newAttempts = $attempts;
        if ($newAttempts >= FH_INQUIRY_DISPATCH_MAX_ATTEMPTS) {
            // 达到上限：转 failed 且不再被领取（next_attempt_at 置空 + attempts 顶到上限）
            $wpdb->update(
                $table,
                [
                    'status'          => 'failed',
                    'attempts'        => $attempts,
                    'last_error'      => '已放弃：达到最大尝试次数 ' . FH_INQUIRY_DISPATCH_MAX_ATTEMPTS,
                    'next_attempt_at' => null,
                    'lease_owner'     => null,
                    'lease_expires_at' => null,
                    'updated_at'      => gmdate('Y-m-d H:i:s'),
                ],
                ['id' => $outboxId]
            );
            $stats['abandoned']++;
            continue;
        }

        // 未达上限：释放租约并按 backoff 排下次重试。
        // ⚠️ 只写租约与 next_attempt_at —— status 与 attempts 由 dispatch_email
        //    在事务内写过，这里再覆写会把 attempts 打回旧值（实测踩到：attempts 恒为 0）。
        $wpdb->update(
            $table,
            [
                'lease_owner'      => null,
                'lease_expires_at' => null,
                'next_attempt_at'  => fh_inquiry_backoff_at(max(1, $attempts)),
                'updated_at'       => gmdate('Y-m-d H:i:s'),
            ],
            ['id' => $outboxId]
        );
        $stats['failed']++;
    }

    unset($now);

    return $stats;
}
add_action(FH_INQUIRY_DISPATCH_HOOK, 'fh_inquiry_run_dispatch');

/* ============================================================================
 * 数据保留与删除接口（默认关闭）
 *
 * 这里只实现“如何安全删干净”，不替业务或法务决定“保留多少天”。未配置
 * FH_INQUIRY_RETENTION_DAYS（或配置为 0）时不排 cron、不删任何数据。
 * ========================================================================== */

/** 读取已批准的保留天数；0 代表禁用。 */
function fh_inquiry_retention_days(): int
{
    $raw = defined('FH_INQUIRY_RETENTION_DAYS')
        ? constant('FH_INQUIRY_RETENTION_DAYS')
        : getenv('FH_INQUIRY_RETENTION_DAYS');
    $days = is_numeric($raw) ? (int) $raw : 0;
    $days = (int) apply_filters('fh_inquiry_retention_days', $days);
    return $days > 0 ? min($days, 36500) : 0;
}

/**
 * 只读预览将被清理的记录 ID，供上线前审阅与 WP-CLI 探针使用。
 *
 * @return array<int,int>
 */
function fh_inquiry_retention_candidates(int $days, int $limit = FH_INQUIRY_RETENTION_BATCH): array
{
    if ($days <= 0 || $limit <= 0) {
        return [];
    }

    global $wpdb;
    $cutoff = gmdate('Y-m-d H:i:s', time() - $days * DAY_IN_SECONDS);
    $ids = $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts}
         WHERE post_type = %s AND post_date_gmt < %s
         ORDER BY post_date_gmt ASC, ID ASC
         LIMIT %d",
        FH_INQUIRY_POST_TYPE,
        $cutoff,
        min($limit, FH_INQUIRY_RETENTION_BATCH)
    ));

    return array_map('intval', (array) $ids);
}

/**
 * 在一个事务内删除 CPT、meta、幂等键、outbox 与 provider event。
 * 序列号不会回收，避免旧询盘号被后来的记录复用。
 */
function fh_inquiry_delete_cascade(int $postId): bool
{
    if ($postId <= 0 || get_post_type($postId) !== FH_INQUIRY_POST_TYPE) {
        return false;
    }

    global $wpdb;
    $keyTable = fh_inquiry_key_table();
    $outboxTable = fh_inquiry_outbox_table();
    $eventTable = fh_inquiry_event_table();
    $outboxIds = array_map('intval', (array) $wpdb->get_col($wpdb->prepare(
        "SELECT id FROM {$outboxTable} WHERE inquiry_id = %d",
        $postId
    )));

    $wpdb->query('START TRANSACTION');
    try {
        if ($outboxIds !== []) {
            $idList = implode(',', $outboxIds);
            if ($wpdb->query("DELETE FROM {$eventTable} WHERE outbox_id IN ({$idList})") === false) {
                throw new RuntimeException('event delete failed');
            }
        }
        if ($wpdb->delete($outboxTable, ['inquiry_id' => $postId], ['%d']) === false) {
            throw new RuntimeException('outbox delete failed');
        }
        if ($wpdb->delete($keyTable, ['inquiry_id' => $postId], ['%d']) === false) {
            throw new RuntimeException('key delete failed');
        }
        if (wp_delete_post($postId, true) === false) {
            throw new RuntimeException('post delete failed');
        }
        $wpdb->query('COMMIT');
        clean_post_cache($postId);
        return true;
    } catch (Throwable $error) {
        $wpdb->query('ROLLBACK');
        clean_post_cache($postId);
        return false;
    }
}

/** 执行一批到期清理；默认配置下永远返回 enabled=false。 */
function fh_inquiry_run_retention(): array
{
    $days = fh_inquiry_retention_days();
    if ($days === 0) {
        return ['enabled' => false, 'days' => 0, 'candidates' => 0, 'deleted' => 0, 'failed' => 0];
    }

    $ids = fh_inquiry_retention_candidates($days);
    $deleted = 0;
    $failed = 0;
    foreach ($ids as $postId) {
        if (fh_inquiry_delete_cascade($postId)) {
            $deleted++;
        } else {
            $failed++;
        }
    }

    return [
        'enabled' => true,
        'days' => $days,
        'candidates' => count($ids),
        'deleted' => $deleted,
        'failed' => $failed,
    ];
}
add_action(FH_INQUIRY_RETENTION_HOOK, 'fh_inquiry_run_retention');

/** 仅在保留期已明确配置时排每日清理；关闭时移除旧调度。 */
function fh_inquiry_schedule_retention(): void
{
    if (fh_inquiry_retention_days() === 0) {
        if (wp_next_scheduled(FH_INQUIRY_RETENTION_HOOK)) {
            wp_clear_scheduled_hook(FH_INQUIRY_RETENTION_HOOK);
        }
        return;
    }
    if (!wp_next_scheduled(FH_INQUIRY_RETENTION_HOOK)) {
        wp_schedule_event(time() + HOUR_IN_SECONDS, 'daily', FH_INQUIRY_RETENTION_HOOK);
    }
}
add_action('init', 'fh_inquiry_schedule_retention', 20);

/**
 * 手动派发（后台按钮）。
 *
 * 走 admin_post，带 nonce 与能力校验。结果通过 redirect 上的 query 回显。
 */
function fh_inquiry_handle_manual_dispatch(): void
{
    if (!current_user_can(FH_INQUIRY_CAP_DELIVERY)) {
        wp_die('无权执行派发。', '', ['response' => 403]);
    }
    check_admin_referer('fh_inquiry_dispatch', 'fh_inquiry_dispatch_nonce');

    $stats = fh_inquiry_run_dispatch();

    wp_safe_redirect(add_query_arg(
        [
            'page'             => 'fh-inquiries',
            'fh_dispatched'    => (int) $stats['dispatched'],
            'fh_accepted'      => (int) $stats['accepted'],
            'fh_failed'        => (int) $stats['failed'],
        ],
        admin_url('admin.php')
    ));
    exit;
}
add_action('admin_post_fh_inquiry_manual_dispatch', 'fh_inquiry_handle_manual_dispatch');

/**
 * 后台「发件箱」区块：渲染最近若干条 outbox 记录 + 手动派发按钮。
 *
 * 只显示技术字段，不显示客户邮箱/电话/消息内容（见 ARCHITECTURE.md §10）。
 */
function fh_inquiry_render_outbox_panel(): void
{
    global $wpdb;

    if (!current_user_can(FH_INQUIRY_CAP_DELIVERY)) {
        return;
    }

    $table = fh_inquiry_outbox_table();
    $rows  = $wpdb->get_results(
        "SELECT id, inquiry_id, event_type, status, attempts, next_attempt_at, last_error, updated_at
         FROM {$table} ORDER BY id DESC LIMIT 20",
        ARRAY_A
    );

    $next = wp_next_scheduled(FH_INQUIRY_DISPATCH_HOOK);

    echo '<div class="wrap"><h2>发件箱派发</h2>';

    echo '<p>';
    if ($next) {
        printf(
            '下次自动派发：%s（约 %d 分钟后）',
            esc_html(get_date_from_gmt(gmdate('Y-m-d H:i:s', $next), 'Y-m-d H:i')),
            max(0, (int) round(($next - time()) / 60))
        );
    } else {
        echo '<strong>自动派发未注册</strong>';
    }
    echo '</p>';

    $alert = fh_inquiry_delivery_alert_summary();
    echo '<p>积压监控：待处理 ' . esc_html((string) $alert['due'])
        . '，已放弃 ' . esc_html((string) $alert['abandoned'])
        . '，过期租约 ' . esc_html((string) $alert['expiredLeases'])
        . '（检查于 ' . esc_html((string) $alert['checkedAt']) . ' UTC）</p>';

    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
    echo '<input type="hidden" name="action" value="fh_inquiry_manual_dispatch" />';
    wp_nonce_field('fh_inquiry_dispatch', 'fh_inquiry_dispatch_nonce');
    submit_button('立即派发一次', 'secondary', 'submit', false);
    echo '</form>';

    echo '<table class="widefat striped" style="margin-top:12px;max-width:900px"><thead><tr>';
    echo '<th>ID</th><th>询盘 ID</th><th>类型</th><th>状态</th><th>已尝试</th><th>下次时间</th><th>最后错误</th><th>更新</th>';
    echo '</tr></thead><tbody>';

    if (empty($rows)) {
        echo '<tr><td colspan="8">发件箱为空。</td></tr>';
    } else {
        foreach ($rows as $r) {
            echo '<tr>';
            echo '<td>' . esc_html((string) $r['id']) . '</td>';
            echo '<td>' . esc_html((string) $r['inquiry_id']) . '</td>';
            echo '<td>' . esc_html((string) $r['event_type']) . '</td>';
            echo '<td>' . esc_html((string) $r['status']) . '</td>';
            echo '<td>' . esc_html((string) $r['attempts']) . '</td>';
            echo '<td>' . esc_html($r['next_attempt_at'] ? (string) $r['next_attempt_at'] : '—') . '</td>';
            echo '<td>' . esc_html($r['last_error'] !== null ? (string) $r['last_error'] : '—') . '</td>';
            echo '<td>' . esc_html((string) $r['updated_at']) . '</td>';
            echo '</tr>';
        }
    }

    echo '</tbody></table></div>';
}

/* ============================================================================
 * 后台工作台：未读角标 · 状态筛选 · 搜索 · 发件箱 tab
 *
 * 与上面的派发 worker 同属一个文件，但职责分开：这里只做「人怎么看、怎么筛」，
 * 不碰发信与租赁逻辑。
 * ========================================================================== */

/**
 * 菜单角标：未处理（new）询盘条数。
 *
 * 只在有未处理时返回带 HTML 的徽标，否则返回空串 —— 菜单标题不带多余空白。
 */
function fh_inquiry_menu_badge(): string
{
    $count = fh_inquiry_count_by_status('new');
    if ($count <= 0) {
        return '';
    }
    return sprintf(
        ' <span class="update-plugins count-%1$d"><span class="update-count">%1$d</span></span>',
        (int) $count
    );
}

/**
 * 按业务状态计数。
 *
 * meta_query 而非 WP_Query 的 post_status —— business_status 存在 postmeta 里。
 */
function fh_inquiry_count_by_status(string $status): int
{
    $query = new WP_Query([
        'post_type'           => FH_INQUIRY_POST_TYPE,
        'post_status'         => 'any',
        'posts_per_page'      => 1,
        'fields'              => 'ids',
        'ignore_sticky_posts' => true,
        'meta_query'          => [
            [
                'key'     => 'business_status',
                'value'   => $status,
                'compare' => '=',
            ],
        ],
    ]);

    return (int) $query->found_posts;
}

/**
 * 各状态条数（供筛选 tab 显示）。
 *
 * @return array<string,int>
 */
function fh_inquiry_status_counts(): array
{
    $counts = ['all' => 0];
    foreach (array_keys(fh_inquiry_business_status_options()) as $value) {
        $counts[$value] = fh_inquiry_count_by_status($value);
    }
    $counts['all'] = array_sum($counts);
    return $counts;
}

/**
 * 渲染状态筛选 tab（含条数、当前项高亮）。
 */
function fh_inquiry_render_status_tabs(string $current, array $counts, string $search): void
{
    $base = admin_url('admin.php');
    $tabs = ['all' => '全部'] + fh_inquiry_business_status_options();

    echo '<ul class="subsubsub" style="margin-bottom:12px">';
    $items = [];
    foreach ($tabs as $value => $label) {
        $url = add_query_arg(
            array_filter([
                'page'           => 'fh-inquiries',
                'status'         => $value === 'all' ? null : $value,
                's'              => $search !== '' ? $search : null,
            ]),
            $base
        );
        $isCurrent = $value === $current;
        $items[] = sprintf(
            '<li><a href="%s"%s>%s <span class="count">(%d)</span></a></li>',
            esc_url($url),
            $isCurrent ? ' class="current" aria-current="page"' : '',
            esc_html($label),
            (int) ($counts[$value] ?? 0)
        );
    }
    echo implode(' | ', $items);
    echo '</ul>';
}

/**
 * 渲染搜索框。
 */
function fh_inquiry_render_search_box(string $search, string $status): void
{
    echo '<form method="get" action="' . esc_url(admin_url('admin.php')) . '" style="margin:0 0 12px">';
    echo '<input type="hidden" name="page" value="fh-inquiries" />';
    if ($status !== 'all') {
        echo '<input type="hidden" name="status" value="' . esc_attr($status) . '" />';
    }
    echo '<input type="search" name="s" value="' . esc_attr($search) . '" placeholder="搜索询盘号 / 公司 / 邮箱 / 内容" style="min-width:280px" /> ';
    submit_button('搜索', 'secondary', '', false);
    echo '</form>';
}

/**
 * 搜索询盘：按询盘号（post_title）、公司、客户邮箱、消息内容匹配。
 *
 * 邮箱与消息存在 postmeta，所以要 meta_query；标题走 s 参数。
 * 返回匹配到的 post id 列表（保持 WP_Query 的排序语义）。
 *
 * @return array<int,int>
 */
function fh_inquiry_search_ids(string $term): array
{
    $term = trim($term);
    if ($term === '') {
        return [];
    }

    $query = new WP_Query([
        'post_type'           => FH_INQUIRY_POST_TYPE,
        'post_status'         => 'any',
        'posts_per_page'      => 200,
        'fields'              => 'ids',
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
        'meta_query'          => [
            'relation' => 'OR',
            ['key' => 'company', 'value' => $term, 'compare' => 'LIKE'],
            ['key' => 'email', 'value' => $term, 'compare' => 'LIKE'],
            ['key' => 'message', 'value' => $term, 'compare' => 'LIKE'],
        ],
    ]);

    return array_map('intval', (array) $query->posts);
}

/* ============================================================================
 * 发信通道：SMTP（主） / Resend（备）
 *
 * 原来只有 Resend 一条路，没配 key 时 fh_inquiry_dispatch_email() 直接 return
 * 'pending' —— 邮件永远发不出去。现在改成：配了 SMTP 就走 SMTP，没配才回落
 * Resend，两者都没配仍是 pending（保持 fail-closed，不假装成功）。
 *
 * 用 PHPMailer：WordPress 自带（wp-includes/PHPMailer/），不引入新依赖。
 * ========================================================================== */

/** SMTP 是否完整配置（缺任一项都视为未配置）。 */
function fh_inquiry_smtp_configured(): bool
{
    return fh_inquiry_config('FH_INQUIRY_SMTP_HOST', 'fh_inquiry_smtp_host', 'smtp.qq.com') !== ''
        && fh_inquiry_config('FH_INQUIRY_SMTP_USER', 'fh_inquiry_smtp_user', '') !== ''
        && fh_inquiry_smtp_pass() !== '';
}

/** SMTP 授权码。注意：不得写进任何日志或 last_error（ARCHITECTURE.md §10）。 */
function fh_inquiry_smtp_pass(): string
{
    return fh_inquiry_config('FH_INQUIRY_SMTP_PASS', 'fh_inquiry_smtp_pass', '');
}

/**
 * 经 SMTP 投递一封 multipart/alternative 邮件。
 *
 * 465 = 隐式 SSL（QQ 推荐）；587 = STARTTLS。用 PHPMailer 自带的 SMTP 类，
 * 不自己拼协议 —— 自拼容易在 AUTH LOGIN / 中文编码上出错。
 *
 * ⚠️ $debug 内容含 SMTP 对话，可能夹带地址；只在显式开启时输出，且不得落库。
 *
 * @return array{ok:bool,error:string}
 */
function fh_inquiry_send_via_smtp(
    string $to,
    string $subject,
    string $html,
    string $text,
    string $replyTo,
    string &$debug = ''
): array {
    if (!class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
        require_once ABSPATH . WPINC . '/PHPMailer/PHPMailer.php';
        require_once ABSPATH . WPINC . '/PHPMailer/SMTP.php';
        require_once ABSPATH . WPINC . '/PHPMailer/Exception.php';
    }

    $host   = fh_inquiry_config('FH_INQUIRY_SMTP_HOST', 'fh_inquiry_smtp_host', 'smtp.qq.com');
    $port   = (int) fh_inquiry_config('FH_INQUIRY_SMTP_PORT', 'fh_inquiry_smtp_port', '465');
    $secure = strtolower(fh_inquiry_config('FH_INQUIRY_SMTP_SECURE', 'fh_inquiry_smtp_secure', 'ssl'));
    $user   = fh_inquiry_config('FH_INQUIRY_SMTP_USER', 'fh_inquiry_smtp_user', '');
    $pass   = fh_inquiry_smtp_pass();
    $from   = fh_inquiry_mail_from();

    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $host;
        $mail->Port       = $port;
        $mail->SMTPAuth   = true;
        $mail->Username   = $user;
        $mail->Password   = $pass;
        $mail->SMTPSecure = $secure === 'tls' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS
                                              : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        $mail->Timeout    = 15;
        $mail->CharSet    = 'UTF-8';
        $mail->Encoding   = 'base64'; // 中文正文安全

        $mail->setFrom($from, '');
        $mail->addAddress($to);
        if ($replyTo !== '' && is_email($replyTo)) {
            $mail->addReplyTo($replyTo);
        }

        $mail->Subject = $subject;
        $mail->isHTML(true);
        $mail->Body    = $html;
        $mail->AltBody = $text;

        $mail->send();
        return ['ok' => true, 'error' => ''];
    } catch (\Throwable $e) {
        // 只取异常消息，不落授权码
        $msg = $e->getMessage();
        return ['ok' => false, 'error' => 'smtp: ' . $msg];
    }
}
