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
        // 本地不够细，别过度设计（与 wheel_model 一致）。
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
    ]);
}

/* ============================================================================
 * 注册 meta
 * ========================================================================== */

add_action('init', 'fh_inquiry_register_meta', 11);
function fh_inquiry_register_meta(): void
{
    $auth = static function (): bool {
        return current_user_can('edit_posts');
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

    return true;
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
    $privacyVersion = $text('privacyVersion', 40, true);
    $consentedAt    = $text('consentedAt', 40, true);
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
 * 渲染销售通知正文 —— 与 src/lib/inquiry/mailer.ts 的 renderBody 对齐。
 *
 * ⚠️ 收件人只从服务端配置读；reply_to 用**已落库的**客户邮箱。客户端指定的收件人一律忽略。
 *
 * @return array{subject:string, text:string}
 */
function fh_inquiry_render_email(int $postId): array
{
    $title = (string) get_post_field('post_title', $postId);
    $meta  = static fn(string $k): string => (string) get_post_meta($postId, $k, true);
    $dash  = static fn(string $v): string => $v !== '' ? $v : '—';

    $specLines = '';
    $specRaw   = $meta('context_spec_json');
    if ($specRaw !== '') {
        $decoded = json_decode($specRaw, true);
        if (is_array($decoded)) {
            $parts = [];
            foreach ($decoded as $k => $v) {
                $parts[] = $k . ': ' . $v;
            }
            $specLines = implode("\n", $parts);
        }
    }

    $lines = [
        'Inquiry ' . $title,
        'Received: ' . (string) get_post_field('post_date_gmt', $postId) . ' UTC',
        '',
        '── Contact ──',
        'Name:     ' . $dash($meta('name')),
        'Email:    ' . $dash($meta('email')),
        'WhatsApp: ' . $dash($meta('whatsapp')),
        'Company:  ' . $dash($meta('company')),
        'Country:  ' . $dash($meta('country_code')),
        'Type:     ' . $dash($meta('customer_type')),
        '',
        '── Interest ──',
        'Line:     ' . $dash($meta('product_line')),
        'Model:    ' . $dash($meta('context_model')),
        'Code:     ' . $dash($meta('context_production_code')),
        'Quantity: ' . $dash($meta('quantity')),
        'Inputs:   ' . $dash($meta('inputs_available')),
        '',
        '── Message ──',
        $meta('message'),
        '',
        '── Snapshot (frozen at submit) ──',
        $specLines,
        'Variant pending: ' . ($meta('variant_pending') === '1' ? 'yes' : 'no'),
        '',
        '── Origin ──',
        'Source page: ' . $dash($meta('context_source_page')),
        'Intent:      ' . $dash($meta('context_intent')),
        'Consent:     ' . $dash($meta('consented_at')) . ' (privacy ' . $dash($meta('privacy_version')) . ')',
    ];

    return [
        'subject' => sprintf(
            'Inquiry %s — %s',
            $title,
            $meta('company') !== '' ? $meta('company') : $meta('name')
        ),
        'text' => implode("\n", $lines),
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

    // 未配置发件能力：保持 pending，让后续定时发送器接手（不假装失败，也不假装成功）。
    if ($apiKey === '' || $to === '' || $from === '') {
        update_post_meta($postId, 'email_status', 'pending');
        update_post_meta($postId, 'email_error', 'resend 未配置（缺 API key / from / to）');
        $writeOutbox([
            'status'          => 'pending',
            'last_error'      => 'resend 未配置',
            'next_attempt_at' => $now,
        ]);
        return 'pending';
    }

    $attempts = (int) $wpdb->get_var($wpdb->prepare("SELECT attempts FROM {$outboxTable} WHERE id = %d", $outboxId));
    $attempts++;

    $writeOutbox(['status' => 'sending', 'attempts' => $attempts]);
    update_post_meta($postId, 'email_status', 'sending');

    $rendered = fh_inquiry_render_email($postId);

    $response = wp_remote_post('https://api.resend.com/emails', [
        'timeout' => 8,
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type'  => 'application/json',
        ],
        'body' => wp_json_encode([
            'from'     => $from,
            'to'       => [$to],
            'reply_to' => (string) get_post_meta($postId, 'email', true),
            'subject'  => $rendered['subject'],
            'text'     => $rendered['text'],
        ]),
    ]);

    if (is_wp_error($response)) {
        $error = $response->get_error_message();
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
        '询盘',
        'edit_posts',
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
    if (!current_user_can('edit_posts')) {
        wp_die('无权访问询盘。', '', ['response' => 403]);
    }

    $paged = isset($_GET['paged']) ? max(1, absint($_GET['paged'])) : 1;
    $query = new WP_Query([
        'post_type'           => FH_INQUIRY_POST_TYPE,
        'post_status'         => 'any',
        'posts_per_page'      => 20,
        'paged'               => $paged,
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ]);

    $businessOptions = fh_inquiry_business_status_options();
    $customerOptions = fh_inquiry_customer_type_options();
    $lineOptions     = fh_inquiry_product_line_options();
    $emailBadgeMap   = fh_inquiry_email_badge_map();

    echo '<div class="wrap"><h1>询盘</h1>';

    if (isset($_GET['fh_updated'])) {
        echo '<div class="notice notice-success is-dismissible"><p>业务状态已更新。</p></div>';
    }

    echo '<p class="description">业务状态可在本页直接修改；<strong>邮件状态只读</strong> —— 它由投递流程写入，不代表业务进展。</p>';
    echo '<table class="wp-list-table widefat fixed striped"><thead><tr>'
        . '<th style="width:180px">询盘号</th>'
        . '<th style="width:110px">客户类型</th>'
        . '<th style="width:110px">产品线</th>'
        . '<th>型号 / 生产代码</th>'
        . '<th style="width:200px">业务状态</th>'
        . '<th style="width:130px">邮件状态</th>'
        . '<th style="width:150px">时间</th>'
        . '</tr></thead><tbody>';

    if (!$query->have_posts()) {
        echo '<tr><td colspan="7">还没有询盘。</td></tr>';
    }

    while ($query->have_posts()) {
        $query->the_post();
        $id = (int) get_the_ID();

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
    if (!current_user_can('edit_posts')) {
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
