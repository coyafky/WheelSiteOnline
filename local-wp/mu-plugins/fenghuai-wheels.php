<?php
/**
 * Plugin Name:       Fenghuai Wheels — 轮毂发布覆盖层
 * Description:       注册 wheel_model 文章类型、尺寸/工艺分类法，以及「发布决定」与「事实快照」两组字段。本层只保存编辑决定，不复制事实层规格。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Fenghuai Tech
 *
 * ── 设计纪律（见 outputs/designs/wheel-publication-architecture-2026-10-06.md）──
 *
 * 1. 本层只记录「发布决定」：发布状态 / 图权 / 供货 / 规格核验 / 对外名 / 公开 Slug / SEO。
 *    它不负责决定「实际有哪些规格」。
 *
 * 2. 实际 variant 规格仍来自事实层 assets/wheel-data/WHEEL-CATALOG-ALL.json，
 *    本层只存关联键（source_keys / approved_variant_keys），不复制规格 ——
 *    否则同一款轮毂会有两个真相源，改一个漏一个。
 *
 * 3. 新入库默认 publication_status = draft。**入库 ≠ 发布。**
 *
 * 4. 公开集合 = 人工批准 AND 机器门槛（有图 + 规格齐），两者是 AND，缺一不可。
 *    本插件只承载「人工那半」；机器那半由导入时的事实快照带进来（只读）。
 */

if (!defined('ABSPATH')) {
    exit;
}

/** 文章类型与分类法标识。 */
const FH_WHEEL_POST_TYPE    = 'wheel_model';
const FH_WHEEL_TAX_DIAMETER = 'wheel_diameter';
const FH_WHEEL_TAX_PROCESS  = 'wheel_process';
/**
 * PCD / 宽度的**候选值字典**（分类法）。
 *
 * 这两个分类法不是事实层 —— 事实仍然是 `variants_json` 里的 `pcd` / `width`。
 * 它们只做两件事：① 给编辑页提供可维护的下拉候选 ② 承接「JSON 里出现过、
 * 但字典里没有」的脏值对照，让运营在后台看得见并逐步收敛。
 *
 * 增删候选值走后台「轮毂型号 → PCD / 宽度」页面，不要改 `variants_json`。
 */
const FH_WHEEL_TAX_PCD   = 'wheel_pcd';
const FH_WHEEL_TAX_WIDTH = 'wheel_width';

/** 字典播种标记；两个分类法各一个，互不牵连。 */
const FH_WHEEL_PCD_SEEDED_OPTION   = 'fh_wheel_pcd_terms_seeded';
const FH_WHEEL_WIDTH_SEEDED_OPTION = 'fh_wheel_width_terms_seeded';

/** 事实快照字段的前缀：由导入脚本写入，后台只读。 */
const FH_WHEEL_FACT_PREFIX = 'fact_';

/**
 * Shape version of a `wheel_model` record.
 *
 * Bump when the meaning of an existing field changes (not when adding one that
 * older records can legitimately lack). Readers compare against this to decide
 * whether they understand the record; see the meta registration for why.
 */
const FH_WHEEL_SCHEMA_VERSION = 1;
const FH_WHEEL_META_SCHEMA_VERSION = 'fh_schema_version';

/* ============================================================================
 * 字段定义
 * ========================================================================== */

/**
 * 发布决定字段（人工可编辑）。
 *
 * @return array<string, array{label:string, options:array<string,string>, default:string}>
 */
function fh_wheel_decision_fields(): array
{
    return [
        'publication_status'   => [
            'label'   => '发布状态',
            'options' => [
                'draft'     => '草稿 / 待审',
                'approved'  => '已批准',
                'withdrawn' => '已撤回',
            ],
            'default' => 'draft',
        ],
        'image_rights_status'  => [
            'label'   => '图权',
            'options' => [
                'pending'  => '待核',
                'approved' => '已核准',
                'rejected' => '不通过',
            ],
            'default' => 'pending',
        ],
        'supply_status'        => [
            'label'   => '供货',
            'options' => [
                'pending'     => '待确认',
                'confirmed'   => '已确认',
                'unavailable' => '不可供',
            ],
            'default' => 'pending',
        ],
        'specification_status' => [
            'label'   => '规格核验',
            'options' => [
                'pending'  => '待核验',
                'verified' => '已核验',
                'rejected' => '不通过',
            ],
            'default' => 'pending',
        ],
    ];
}

/**
 * 工艺取值 —— 全站唯一正本。
 *
 * 此前这四个值在本文件里写了两遍（此处做下拉项、`fh_wheel_register_taxonomy()`
 * 里做 term 播种），另有一份中文→英文键的映射在
 * `src/lib/wheels/types.ts` 的 `SOURCE_PROCESS_TO_KEY`。改动只改一处就会脱节，
 * 而脱节的后果是静默的：新工艺值在后台可选，却在前台被 `processKeyOf()`
 * 归为 `not-specified`，页面照常 200，筛选结果悄悄变少。
 *
 * 现在 PHP 侧只从这里取；增删工艺请同步
 * `src/lib/wheels/types.ts` 的 `PROCESS_META` 与 `SOURCE_PROCESS_TO_KEY`
 * （`npm run contract:check` 会比对两侧）。
 *
 * @return array<string,string> 值 => 显示标签（'' 表示未标注）
 */
function fh_wheel_process_options(): array
{
    $labelled = [
        '旋压' => '旋压',
        '低压' => '低压',
        '低压+旋压' => '低压+旋压',
        '锻造' => '锻造',
    ];

    return ['' => '— 未标注 —'] + $labelled;
}

/**
 * 可播种为 taxonomy term 的工艺值（不含「未标注」—— 那是缺省而非一个工艺）。
 *
 * @return string[]
 */
function fh_wheel_process_terms(): array
{
    return array_keys(fh_wheel_process_options());
}

/**
 * 事实快照字段（导入写入，后台只读）。
 *
 * @return array<string, string> 字段名 => 中文标签
 */
function fh_wheel_fact_fields(): array
{
    return [
        'fact_diameters'      => '尺寸（英寸）',
        'fact_size_category'  => '来源目录',
        'fact_process_raw'    => '工艺（源值）',
        'fact_style_name'     => '款式名（源值·内部）',
        'fact_variant_count'  => '规格数',
        'fact_image_count'    => '图片数',
        'fact_images'         => '图片文件名',
        'fact_score'          => '候选分',
        'fact_trademark_hits' => '⚠ 商标关键词',
        'fact_complete_ratio' => '规格完整度',
        'fact_source_keys'    => '事实层关联键',
        'fact_variants_json'  => '规格明细（JSON）',
    ];
}

/* ============================================================================
 * 注册文章类型与分类法
 * ========================================================================== */

add_action('init', 'fh_wheel_register_post_type');
function fh_wheel_register_post_type(): void
{
    register_post_type(FH_WHEEL_POST_TYPE, [
        'labels' => [
            'name'               => '轮毂型号',
            'singular_name'      => '轮毂型号',
            'menu_name'          => '轮毂型号',
            'add_new'            => '新增型号',
            'add_new_item'       => '新增轮毂型号',
            'edit_item'          => '编辑轮毂型号',
            'new_item'           => '新轮毂型号',
            'view_item'          => '查看轮毂型号',
            'search_items'       => '搜索轮毂型号',
            'not_found'          => '没有找到轮毂型号',
            'not_found_in_trash' => '回收站里没有轮毂型号',
        ],
        // 编辑界面：只要标题 + 自定义字段。不要编辑器 —— 这是一个数据录入表单，
        // 不是写文章的界面；去掉编辑器后经典 meta box 才会正常显示。
        'supports'            => ['title', 'custom-fields'],
        // REST 必须开：Next.js 侧要靠它读发布决定。
        'show_in_rest'        => true,
        'rest_base'           => 'wheel-models',
        // 公开侧由 Next.js 承载，WP 不生成任何前台 URL。
        'public'              => false,
        'publicly_queryable'  => false,
        'exclude_from_search' => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_nav_menus'   => false,
        'menu_icon'           => 'dashicons-car',
        'menu_position'       => 21,
        'hierarchical'        => false,
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
    ]);
}

add_action('init', 'fh_wheel_register_taxonomies', 9);
function fh_wheel_register_taxonomies(): void
{
    register_taxonomy(FH_WHEEL_TAX_DIAMETER, [FH_WHEEL_POST_TYPE], [
        'labels' => [
            'name'          => '轮毂尺寸',
            'singular_name' => '尺寸',
            'menu_name'     => '尺寸',
            'all_items'     => '全部尺寸',
            'edit_item'     => '编辑尺寸',
            'add_new_item'  => '新增尺寸',
            'search_items'  => '搜索尺寸',
        ],
        'public'            => false,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rest_base'         => 'wheel-diameters',
        'hierarchical'      => false,
    ]);

    register_taxonomy(FH_WHEEL_TAX_PROCESS, [FH_WHEEL_POST_TYPE], [
        'labels' => [
            'name'          => '轮毂工艺',
            'singular_name' => '工艺',
            'menu_name'     => '工艺',
            'all_items'     => '全部工艺',
            'edit_item'     => '编辑工艺',
            'add_new_item'  => '新增工艺',
            'search_items'  => '搜索工艺',
        ],
        'public'            => false,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rest_base'         => 'wheel-processes',
        'hierarchical'      => false,
    ]);

    fh_wheel_register_dictionary_taxonomies();

    // 尺寸术语固定为 12–20 寸 + 越野款；只建一次。
    if (!get_option('fh_wheel_terms_seeded')) {
        foreach (['12', '13', '14', '15', '16', '17', '18', '19', '20'] as $d) {
            if (!term_exists($d, FH_WHEEL_TAX_DIAMETER)) {
                wp_insert_term($d, FH_WHEEL_TAX_DIAMETER, ['slug' => $d . 'inch']);
            }
        }
        // 从唯一正本取，避免与 fh_wheel_process_options() 各自维护一份。
        foreach (fh_wheel_process_terms() as $p) {
            if (!term_exists($p, FH_WHEEL_TAX_PROCESS)) {
                wp_insert_term($p, FH_WHEEL_TAX_PROCESS);
            }
        }
        update_option('fh_wheel_terms_seeded', 1);
    }
}

/* ============================================================================
 * PCD / 宽度字典（候选值分类法）
 * ========================================================================== */

/**
 * 注册 PCD / 宽度两个**候选值字典**。
 *
 * 两者都不是事实层：事实仍是 `variants_json` 里的 `pcd` / `width`。字典只提供
 * 编辑页的下拉候选，并让「JSON 里出现过但字典里没有」的脏值在后台可见。
 */
function fh_wheel_register_dictionary_taxonomies(): void
{
    register_taxonomy(FH_WHEEL_TAX_PCD, [FH_WHEEL_POST_TYPE], [
        'labels' => [
            'name'          => 'PCD',
            'singular_name' => 'PCD',
            'menu_name'     => 'PCD',
            'all_items'     => '全部 PCD',
            'edit_item'     => '编辑 PCD',
            'add_new_item'  => '新增 PCD',
            'search_items'  => '搜索 PCD',
        ],
        'public'            => false,
        'show_ui'           => true,
        'show_admin_column' => false,
        'show_in_rest'      => true,
        'rest_base'         => 'wheel-pcds',
        'hierarchical'      => false,
    ]);

    register_taxonomy(FH_WHEEL_TAX_WIDTH, [FH_WHEEL_POST_TYPE], [
        'labels' => [
            'name'          => '宽度',
            'singular_name' => '宽度',
            'menu_name'     => '宽度',
            'all_items'     => '全部宽度',
            'edit_item'     => '编辑宽度',
            'add_new_item'  => '新增宽度',
            'search_items'  => '搜索宽度',
        ],
        'public'            => false,
        'show_ui'           => true,
        'show_admin_column' => false,
        'show_in_rest'      => true,
        'rest_base'         => 'wheel-widths',
        'hierarchical'      => false,
    ]);

    fh_wheel_seed_dictionary_terms();
}

/**
 * 取某个型号的规格行（`variants_json`）。
 *
 * @return array<int,array<string,mixed>>
 */
function fh_wheel_variants_of(int $postId): array
{
    $raw = (string) get_post_meta($postId, 'variants_json', true);
    if ($raw === '') return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? array_values($decoded) : [];
}

/**
 * 把一条 PCD 记录展开成它实际提供的全部规范孔距。
 *
 * 与 `src/lib/wheels/normalize.ts` 的 `normalizePcds()` **同语义**：
 *
 *   `"5*114.3"`        → ["5x114.3"]
 *   `"5*112, 5*114.3"` → ["5x112","5x114.3"]
 *   `"4/5*100"`        → ["4x100","5x100"]
 *   `"5*112（）"`       → ["5x112"]     空括号是脏字符
 *   `"5*112??"`        → []            无法识别，**不返回原文**（避免脏值污染候选）
 *
 * @return string[]
 */
function fh_wheel_pcd_normalize(string $raw): array
{
    if ($raw === '') return [];

    $s = strtolower(trim($raw));
    if ($s === '') return [];

    // 脏字符：中文/英文空括号
    $s = str_replace(['（', '）', '(', ')'], '', $s);
    // 全角与异形分隔统一
    $s = str_replace(['×', '*'], 'x', $s);
    $s = str_replace(['，', '、'], ',', $s);
    $s = preg_replace('/\s+/u', '', $s);

    // 拆并列组：逗号分隔，以及 `-` 后紧跟新组（`5*112-5*114.3`）
    $parts = [];
    foreach (explode(',', (string) $s) as $part) {
        foreach (preg_split('/-(?=\d{1,2}x)/', $part) as $sub) {
            $parts[] = $sub;
        }
    }

    $out = [];
    foreach ($parts as $part) {
        if ($part === '') continue;
        if (!preg_match('~^(\d{1,2}(?:/\d{1,2})?)x(\d{2,3}(?:\.\d+)?(?:/\d{2,3}(?:\.\d+)?)*)$~', $part, $m)) {
            continue;
        }
        foreach (explode('/', $m[1]) as $lug) {
            foreach (explode('/', $m[2]) as $bore) {
                $lugNum = (int) $lug;
                if ($lugNum < 3 || $lugNum > 10) continue;
                $key = $lugNum . 'x' . $bore;
                if (!in_array($key, $out, true)) $out[] = $key;
            }
        }
    }

    return $out;
}

/** 宽度是否落在 0.5 英寸的常规网格上（4–14 之间）。 */
function fh_wheel_width_is_canonical(float $width): bool
{
    if ($width < 4 || $width > 14) return false;
    return abs($width * 2 - round($width * 2)) < 0.001;
}

/** 宽度的字典键：`6.5` 而不是 `6.50`。 */
function fh_wheel_width_key(float $width): string
{
    $s = rtrim(rtrim(number_format($width, 2, '.', ''), '0'), '.');
    return $s === '' ? '0' : $s;
}

/**
 * 遍历已存在的规格行，汇总「字典候选」与「字典外脏值」。
 *
 * @return array{pcds:array<string,bool>, widths:array<string,bool>, strays:array<string,array<string,int>>}
 */
function fh_wheel_collect_dictionary_values(): array
{
    $ids = get_posts([
        'post_type'      => FH_WHEEL_POST_TYPE,
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
    ]);

    $pcds = [];
    $widths = [];
    $strays = ['pcd' => [], 'width' => []];

    foreach ($ids as $id) {
        foreach (fh_wheel_variants_of((int) $id) as $row) {
            $rawPcd = trim((string) ($row['pcd'] ?? ''));
            if ($rawPcd !== '') {
                $keys = fh_wheel_pcd_normalize($rawPcd);
                if ($keys) {
                    foreach ($keys as $k) $pcds[$k] = true;
                } else {
                    // 规范化后一个都认不出 → 记成字典外脏值
                    $strays['pcd'][$rawPcd] = ($strays['pcd'][$rawPcd] ?? 0) + 1;
                }
            }

            $w = $row['width'] ?? null;
            if (is_numeric($w)) {
                $f = (float) $w;
                if (fh_wheel_width_is_canonical($f)) {
                    $widths[fh_wheel_width_key($f)] = true;
                } else {
                    $strays['width'][fh_wheel_width_key($f)] =
                        ($strays['width'][fh_wheel_width_key($f)] ?? 0) + 1;
                }
            }
        }
    }

    return ['pcds' => $pcds, 'widths' => $widths, 'strays' => $strays];
}

/**
 * 首次播种两个字典。
 *
 * ⚠️ 刻意**只播种能规范化的值**：无法解析的 PCD（如 `5*112??`）与脱离 0.5 网格的
 * 宽度（如 `6.6` / `8.25`）不进字典，而是留在 `strays` 里由后台提示、人工裁决。
 * 这样脏值不会被「合法化」并扩散 —— 正是把它们做成下拉的目的。
 */
function fh_wheel_seed_dictionary_terms(): void
{
    $pcdDone   = get_option(FH_WHEEL_PCD_SEEDED_OPTION) === '1';
    $widthDone = get_option(FH_WHEEL_WIDTH_SEEDED_OPTION) === '1';
    if ($pcdDone && $widthDone) return;

    $collected = fh_wheel_collect_dictionary_values();

    if (!$pcdDone) {
        foreach (array_keys($collected['pcds']) as $key) {
            if (!term_exists($key, FH_WHEEL_TAX_PCD)) {
                wp_insert_term($key, FH_WHEEL_TAX_PCD);
            }
        }
        update_option(FH_WHEEL_PCD_SEEDED_OPTION, '1', false);
    }

    if (!$widthDone) {
        foreach (array_keys($collected['widths']) as $key) {
            if (!term_exists($key, FH_WHEEL_TAX_WIDTH)) {
                wp_insert_term($key, FH_WHEEL_TAX_WIDTH);
            }
        }
        update_option(FH_WHEEL_WIDTH_SEEDED_OPTION, '1', false);
    }
}

/** 某个型号用到的、字典里没有的 PCD / 宽度（用于列表页提示）。 */
function fh_wheel_model_strays(int $postId): array
{
    $knownPcd = [];
    foreach (get_terms(['taxonomy' => FH_WHEEL_TAX_PCD, 'hide_empty' => false, 'fields' => 'names']) as $n) {
        $knownPcd[$n] = true;
    }
    $knownWidth = [];
    foreach (get_terms(['taxonomy' => FH_WHEEL_TAX_WIDTH, 'hide_empty' => false, 'fields' => 'names']) as $n) {
        $knownWidth[$n] = true;
    }

    $strayPcd = [];
    $strayWidth = [];
    foreach (fh_wheel_variants_of($postId) as $row) {
        $raw = trim((string) ($row['pcd'] ?? ''));
        if ($raw !== '') {
            $keys = fh_wheel_pcd_normalize($raw);
            if (!$keys) {
                $strayPcd[$raw] = true;
            }
        }
        $w = $row['width'] ?? null;
        if (is_numeric($w)) {
            $key = fh_wheel_width_key((float) $w);
            if (!isset($knownWidth[$key])) $strayWidth[$key] = true;
        }
    }

    return ['pcd' => array_keys($strayPcd), 'width' => array_keys($strayWidth)];
}

/**
 * 取某个字典分类法的候选值，排好序给编辑页做下拉。
 *
 * PCD 按「孔数 → 孔径」排（`4x100` 在 `5x112` 前）；宽度按数值排。
 * 只返回 term 名 —— 字典是候选集，实际取值仍写进 `variants_json`。
 *
 * @return string[]
 */
function fh_wheel_dictionary_options(string $taxonomy): array
{
    $terms = get_terms([
        'taxonomy'   => $taxonomy,
        'hide_empty' => false,
        'fields'     => 'names',
    ]);
    if (is_wp_error($terms) || !$terms) return [];

    $values = array_values(array_unique(array_map('strval', $terms)));

    usort($values, static function (string $a, string $b) use ($taxonomy): int {
        if ($taxonomy === FH_WHEEL_TAX_PCD) {
            $pa = sscanf($a, '%dx%f');
            $pb = sscanf($b, '%dx%f');
            if (is_array($pa) && is_array($pb) && count($pa) === 2 && count($pb) === 2) {
                return [$pa[0], $pa[1]] <=> [$pb[0], $pb[1]];
            }
        }
        return (float) $a <=> (float) $b;
    });

    return $values;
}

/* ============================================================================
 * 注册 meta（供 REST 读写）
 * ========================================================================== */

add_action('init', 'fh_wheel_register_meta', 11);
function fh_wheel_register_meta(): void
{
    $auth = static function (): bool {
        return current_user_can('edit_posts');
    };

    // 发布决定 —— 人工可写。
    foreach (fh_wheel_decision_fields() as $key => $spec) {
        $allowed = array_keys($spec['options']);
        register_post_meta(FH_WHEEL_POST_TYPE, $key, [
            'type'              => 'string',
            'single'            => true,
            'default'           => $spec['default'],
            'show_in_rest'      => true,
            'auth_callback'     => $auth,
            'sanitize_callback' => static function ($value) use ($allowed, $spec) {
                $value = is_string($value) ? $value : '';
                return in_array($value, $allowed, true) ? $value : $spec['default'];
            },
        ]);
    }

    // 对外呈现字段 —— 人工可写。
    $text_fields = [
        'public_slug'      => '',
        'display_model'    => '',
        'approved_process' => '',
        'seo_title'        => '',
        'seo_description'  => '',
        'editor_note'      => '',
    ];
    foreach ($text_fields as $key => $default) {
        register_post_meta(FH_WHEEL_POST_TYPE, $key, [
            'type'          => 'string',
            'single'        => true,
            'default'       => $default,
            'show_in_rest'  => true,
            'auth_callback' => $auth,
        ]);
    }

    // 关联键 —— 导入写入，人工一般不动。
    foreach (['source_keys', 'approved_variant_keys'] as $key) {
        register_post_meta(FH_WHEEL_POST_TYPE, $key, [
            'type'          => 'string',
            'single'        => true,
            'default'       => '',
            'show_in_rest'  => true,
            'auth_callback' => $auth,
        ]);
    }

    // 事实快照 —— 导入写入，后台只读展示。
    foreach (array_keys(fh_wheel_fact_fields()) as $key) {
        register_post_meta(FH_WHEEL_POST_TYPE, $key, [
            'type'          => 'string',
            'single'        => true,
            'default'       => '',
            'show_in_rest'  => true,
            'auth_callback' => $auth,
        ]);
    }

    register_post_meta(FH_WHEEL_POST_TYPE, 'hero_media_id', [
        'type'              => 'integer',
        'single'            => true,
        'default'           => 0,
        'show_in_rest'      => true,
        'auth_callback'     => $auth,
        'sanitize_callback' => static fn($v) => absint($v),
    ]);

    /*
     * Record shape version.
     *
     * The pages domain has carried `fh_page_schema_version` from the start; the
     * wheels and insights domains did not, so a reader could not tell a record
     * written by an older importer from a current one. That matters when a field
     * changes meaning: without a version the only way to know is to inspect the
     * values and guess.
     *
     * Written by the importer alongside the facts it describes, surfaced in REST
     * so the frontend can reject a shape it does not understand instead of
     * silently misreading it.
     */
    register_post_meta(FH_WHEEL_POST_TYPE, FH_WHEEL_META_SCHEMA_VERSION, [
        'type'              => 'integer',
        'single'            => true,
        'default'           => FH_WHEEL_SCHEMA_VERSION,
        'show_in_rest'      => true,
        'auth_callback'     => $auth,
        'sanitize_callback' => static fn($v) => absint($v),
    ]);
}

/* ============================================================================
 * 编辑界面：决定字段 + 事实快照
 * ========================================================================== */

add_action('add_meta_boxes', 'fh_wheel_add_meta_boxes');
function fh_wheel_add_meta_boxes(): void
{
    add_meta_box(
        'fh_wheel_decisions',
        '发布决定（人工填写）',
        'fh_wheel_render_decisions_box',
        FH_WHEEL_POST_TYPE,
        'normal',
        'high'
    );

    add_meta_box(
        'fh_wheel_facts',
        '事实快照（导入写入 · 只读）',
        'fh_wheel_render_facts_box',
        FH_WHEEL_POST_TYPE,
        'normal',
        'default'
    );
}

function fh_wheel_render_decisions_box(WP_Post $post): void
{
    wp_nonce_field('fh_wheel_save_decisions', 'fh_wheel_nonce');

    echo '<style>.fh-grid{display:grid;grid-template-columns:190px 1fr;gap:10px 16px;align-items:center;max-width:760px}'
        . '.fh-grid label{font-weight:600}.fh-grid select,.fh-grid input[type=text],.fh-grid textarea{width:100%;max-width:460px}'
        . '.fh-hint{color:#646970;font-size:12px;margin:2px 0 14px}</style>';

    echo '<div class="fh-grid">';

    foreach (fh_wheel_decision_fields() as $key => $spec) {
        $current = (string) get_post_meta($post->ID, $key, true);
        if ($current === '') {
            $current = $spec['default'];
        }
        printf('<label for="%1$s">%2$s</label><select id="%1$s" name="%1$s">', esc_attr($key), esc_html($spec['label']));
        foreach ($spec['options'] as $value => $label) {
            printf(
                '<option value="%s"%s>%s</option>',
                esc_attr($value),
                selected($current, $value, false),
                esc_html($label)
            );
        }
        echo '</select>';
    }

    // 工艺（已批准口径）
    $process  = (string) get_post_meta($post->ID, 'approved_process', true);
    echo '<label for="approved_process">已批准工艺</label><select id="approved_process" name="approved_process">';
    foreach (fh_wheel_process_options() as $value => $label) {
        printf('<option value="%s"%s>%s</option>', esc_attr($value), selected($process, $value, false), esc_html($label));
    }
    echo '</select>';

    $texts = [
        'public_slug'     => ['公开 Slug', 'text', '上线后保持稳定；改名请用 redirect，不要直接改旧 URL。留空则由型号编号派生。'],
        'display_model'   => ['对外型号名', 'text', '第三方商标不得出现在这里（源 styleName 只作内部参考）。'],
        'seo_title'       => ['SEO 标题', 'text', ''],
        'seo_description' => ['SEO 描述', 'textarea', ''],
        'editor_note'     => ['编辑备注', 'textarea', '仅内部可见，不进入公开视图。'],
    ];
    foreach ($texts as $key => [$label, $type, $hint]) {
        $value = (string) get_post_meta($post->ID, $key, true);
        printf('<label for="%1$s">%2$s</label>', esc_attr($key), esc_html($label));
        if ($type === 'textarea') {
            printf('<textarea id="%1$s" name="%1$s" rows="3">%2$s</textarea>', esc_attr($key), esc_textarea($value));
        } else {
            printf('<input type="text" id="%1$s" name="%1$s" value="%2$s" />', esc_attr($key), esc_attr($value));
        }
        if ($hint !== '') {
            printf('<p class="fh-hint" style="grid-column:2">%s</p>', esc_html($hint));
        }
    }

    // 批准变体（逗号分隔）
    $approved = (string) get_post_meta($post->ID, 'approved_variant_keys', true);
    echo '<label for="approved_variant_keys">已批准规格</label>';
    printf('<input type="text" id="approved_variant_keys" name="approved_variant_keys" value="%s" />', esc_attr($approved));
    echo '<p class="fh-hint" style="grid-column:2">逗号分隔的 productionCode。留空 = 一条都没批准，该型号不会进公开集合。</p>';

    echo '</div>';
}

function fh_wheel_render_facts_box(WP_Post $post): void
{
    $facts = fh_wheel_fact_fields();
    $hasAny = false;
    foreach (array_keys($facts) as $key) {
        if ((string) get_post_meta($post->ID, $key, true) !== '') {
            $hasAny = true;
            break;
        }
    }

    if (!$hasAny) {
        echo '<p>尚未导入事实快照。运行导入脚本后此处会显示来源、尺寸、规格数、图片数等信息。</p>';
        return;
    }

    echo '<table class="widefat striped"><tbody>';
    foreach ($facts as $key => $label) {
        $value = (string) get_post_meta($post->ID, $key, true);
        if ($value === '') {
            continue;
        }
        $display = $value;
        if ($key === 'fact_images') {
            $parts = array_filter(array_map('trim', explode(',', $value)));
            $display = implode("\n", $parts);
        } elseif ($key === 'fact_variants_json') {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                $lines = [];
                foreach ($decoded as $v) {
                    $lines[] = sprintf(
                        '%s · %s · %s · ET %s · CB %s · %s',
                        $v['productionCode'] ?? '',
                        $v['size'] ?? '',
                        $v['pcd'] ?? '',
                        $v['offset'] ?? '',
                        $v['centerBore'] ?? '',
                        $v['finish'] ?? ''
                    );
                }
                $display = implode("\n", $lines);
            }
        } elseif ($key === 'fact_trademark_hits' && $value !== '') {
            $display = '⚠ ' . $value;
        }
        printf(
            '<tr><th style="width:150px">%s</th><td><pre style="margin:0;white-space:pre-wrap;font-size:12px">%s</pre></td></tr>',
            esc_html($label),
            esc_html($display)
        );
    }
    echo '</tbody></table>';
}

/* ============================================================================
 * 保存决定字段
 * ========================================================================== */

add_action('save_post_' . FH_WHEEL_POST_TYPE, 'fh_wheel_save_decisions', 10, 2);
function fh_wheel_save_decisions(int $postId, WP_Post $post): void
{
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!isset($_POST['fh_wheel_nonce']) || !wp_verify_nonce(
        sanitize_text_field(wp_unslash($_POST['fh_wheel_nonce'])),
        'fh_wheel_save_decisions'
    )) {
        return;
    }
    if (!current_user_can('edit_post', $postId)) {
        return;
    }

    foreach (fh_wheel_decision_fields() as $key => $spec) {
        if (!isset($_POST[$key])) {
            continue;
        }
        $value = sanitize_text_field(wp_unslash($_POST[$key]));
        if (!array_key_exists($value, $spec['options'])) {
            $value = $spec['default'];
        }
        update_post_meta($postId, $key, $value);
    }

    if (isset($_POST['approved_process'])) {
        $value = sanitize_text_field(wp_unslash($_POST['approved_process']));
        if (!array_key_exists($value, fh_wheel_process_options())) {
            $value = '';
        }
        update_post_meta($postId, 'approved_process', $value);
    }

    foreach (['public_slug', 'display_model', 'seo_title', 'seo_description', 'editor_note', 'approved_variant_keys'] as $key) {
        if (!isset($_POST[$key])) {
            continue;
        }
        update_post_meta($postId, $key, sanitize_textarea_field(wp_unslash($_POST[$key])));
    }
}

/* ============================================================================
 * 列表页：列、筛选、排序
 * ========================================================================== */

add_filter('manage_' . FH_WHEEL_POST_TYPE . '_posts_columns', 'fh_wheel_admin_columns');
function fh_wheel_admin_columns(array $columns): array
{
    $new = [];
    $new['cb']    = $columns['cb'] ?? '<input type="checkbox" />';
    $new['title'] = '型号';
    $new['fh_thumb']    = '图片';
    $new['fh_status']   = '发布状态';
    $new['fh_image']    = '图权';
    $new['fh_supply']   = '供货';
    $new['fh_spec']     = '规格核验';
    $new['fh_score']    = '候选分';
    $new['fh_counts']   = '规格/图片';
    $new['fh_pcd']      = 'PCD';
    $new['fh_width']    = '宽度';
    $new['fh_risk']     = '商标';
    $new['date']        = $columns['date'] ?? '日期';
    return $new;
}

/**
 * 该型号的主图附件 ID（`hero_media_id`，回退 `gallery_media_ids` 首项）。
 */
function fh_wheel_admin_hero_media_id(int $postId): int
{
    $hero = absint(get_post_meta($postId, 'hero_media_id', true));
    if ($hero > 0) return $hero;

    $raw = (string) get_post_meta($postId, 'gallery_media_ids', true);
    if ($raw === '') return 0;
    $ids = array_filter(array_map('absint', explode(',', $raw)));
    return $ids ? (int) reset($ids) : 0;
}

/**
 * 汇总该型号规格行里的 PCD / 宽度，供列表页展示。
 *
 * @return array{pcd:array<int,string>, width:array<int,string>, total:int}
 */
function fh_wheel_admin_spec_summary(int $postId): array
{
    $pcd = [];
    $width = [];
    $rows = 0;

    foreach (fh_wheel_variants_of($postId) as $row) {
        $rows++;
        $raw = trim((string) ($row['pcd'] ?? ''));
        if ($raw !== '') {
            $keys = fh_wheel_pcd_normalize($raw);
            foreach ($keys ? $keys : [$raw] as $k) {   // 无法规范化时原样展示，便于人工发现
                if (!in_array($k, $pcd, true)) $pcd[] = $k;
            }
        }
        $w = $row['width'] ?? null;
        if (is_numeric($w)) {
            $key = fh_wheel_width_key((float) $w);
            if (!in_array($key, $width, true)) $width[] = $key;
        }
    }

    usort($width, static fn($a, $b) => (float) $a <=> (float) $b);

    return ['pcd' => $pcd, 'width' => $width, 'total' => $rows];
}

/** 把一组值渲染成列表页单元格：最多 3 个，其余折叠成 `+N`。 */
function fh_wheel_admin_datalist(array $values, string $suffix = ''): string
{
    if (!$values) return '<span style="color:#8c8f94">—</span>';

    $shown = array_slice($values, 0, 3);
    $rest  = count($values) - count($shown);
    $html  = implode(', ', array_map(
        static fn($v) => esc_html($v . $suffix),
        $shown
    ));
    if ($rest > 0) {
        $html .= sprintf(
            ' <span style="color:#8c8f94" title="%s">+%d</span>',
            esc_attr(implode(', ', array_slice($values, 3))),
            $rest
        );
    }
    return '<span style="font-size:12px">' . $html . '</span>';
}

add_action('manage_' . FH_WHEEL_POST_TYPE . '_posts_custom_column', 'fh_wheel_admin_column_content', 10, 2);
function fh_wheel_admin_column_content(string $column, int $postId): void
{
    $badge = static function (string $value, array $map): string {
        [$label, $color] = $map[$value] ?? [$value, '#646970'];
        return sprintf(
            '<span style="display:inline-block;padding:1px 7px;border-radius:10px;background:%s;color:#fff;font-size:11px">%s</span>',
            esc_attr($color),
            esc_html($label)
        );
    };

    switch ($column) {
        case 'fh_thumb':
            $mediaId = fh_wheel_admin_hero_media_id($postId);
            if ($mediaId <= 0 || !wp_attachment_is_image($mediaId)) {
                echo '<span style="color:#8c8f94">—</span>';
                break;
            }
            $img = wp_get_attachment_image($mediaId, 'thumbnail', false, [
                'style' => 'width:56px;height:56px;object-fit:contain;background:#f6f7f7;border:1px solid #dcdcde;border-radius:3px;display:block',
                'alt'   => '',
            ]);
            if ($img === '') {
                echo '<span style="color:#8c8f94">—</span>';
                break;
            }
            // 图库里有多张时给个角标，提示「不止一张」
            $gallery = array_filter(array_map('absint', explode(',', (string) get_post_meta($postId, 'gallery_media_ids', true))));
            $extra = count($gallery) > 1
                ? sprintf('<span style="color:#646970;font-size:11px">+%d</span>', count($gallery) - 1)
                : '';
            printf('<div style="display:flex;align-items:center;gap:6px">%s%s</div>', $img, $extra);
            break;

        case 'fh_status':
            echo $badge((string) get_post_meta($postId, 'publication_status', true), [
                'approved'  => ['已批准', '#00a32a'],
                'draft'     => ['草稿', '#8c8f94'],
                'withdrawn' => ['已撤回', '#d63638'],
            ]);
            break;

        case 'fh_image':
            echo $badge((string) get_post_meta($postId, 'image_rights_status', true), [
                'approved' => ['已核准', '#00a32a'],
                'pending'  => ['待核', '#dba617'],
                'rejected' => ['不通过', '#d63638'],
            ]);
            break;

        case 'fh_supply':
            echo $badge((string) get_post_meta($postId, 'supply_status', true), [
                'confirmed'   => ['已确认', '#00a32a'],
                'pending'     => ['待确认', '#dba617'],
                'unavailable' => ['不可供', '#d63638'],
            ]);
            break;

        case 'fh_spec':
            echo $badge((string) get_post_meta($postId, 'specification_status', true), [
                'verified' => ['已核验', '#00a32a'],
                'pending'  => ['待核验', '#dba617'],
                'rejected' => ['不通过', '#d63638'],
            ]);
            break;

        case 'fh_score':
            $score = (string) get_post_meta($postId, 'fact_score', true);
            echo $score !== '' ? esc_html($score) : '—';
            break;

        case 'fh_counts':
            printf(
                '%s / %s',
                esc_html((string) get_post_meta($postId, 'fact_variant_count', true) ?: '—'),
                esc_html((string) get_post_meta($postId, 'fact_image_count', true) ?: '—')
            );
            break;

        case 'fh_pcd':
        case 'fh_width':
            $summary = fh_wheel_admin_spec_summary($postId);
            $strays  = fh_wheel_model_strays($postId);

            if ($column === 'fh_pcd') {
                echo fh_wheel_admin_datalist($summary['pcd']);
                if ($strays['pcd']) {
                    printf(
                        ' <span style="color:#d63638" title="%s">⚠ 待裁决</span>',
                        esc_attr('这些 PCD 无法规范化，未进入字典：' . implode(' / ', $strays['pcd']))
                    );
                }
            } else {
                echo fh_wheel_admin_datalist($summary['width'], '"');
                if ($strays['width']) {
                    printf(
                        ' <span style="color:#d63638" title="%s">⚠ 待裁决</span>',
                        esc_attr('这些宽度脱离 0.5 网格，未进入字典：' . implode(' / ', $strays['width']))
                    );
                }
            }
            break;

        case 'fh_risk':
            $hits = (string) get_post_meta($postId, 'fact_trademark_hits', true);
            if ($hits === '') {
                echo '<span style="color:#00a32a">干净</span>';
            } else {
                printf('<span style="color:#d63638" title="%s">⚠ 有</span>', esc_attr($hits));
            }
            break;
    }
}

/**
 * 收掉编辑页上 PCD / 宽度 的分类法 metabox。
 *
 * 这两个分类法是**候选值字典**，不是型号的分类：实际取值写在 `variants_json` 里，
 * 在 metabox 里勾选既不会保存也不会生效（只会让人误以为「我标了却没生效」）。
 * 维护入口统一留在左侧菜单的「PCD」「宽度」两个字典页。
 */
add_action('add_meta_boxes_' . FH_WHEEL_POST_TYPE, 'fh_wheel_remove_dictionary_meta_boxes', 99);
function fh_wheel_remove_dictionary_meta_boxes(): void
{
    remove_meta_box('tagsdiv-' . FH_WHEEL_TAX_PCD, FH_WHEEL_POST_TYPE, 'side');
    remove_meta_box('tagsdiv-' . FH_WHEEL_TAX_WIDTH, FH_WHEEL_POST_TYPE, 'side');
}

/* ----------------------------------------------------------------------------
 * 字典页的脏值提示（只报告，不改数据）
 * -------------------------------------------------------------------------- */

/**
 * 在 PCD / 宽度字典页顶部列出「规格里出现过、但无法进入字典」的值。
 *
 * 刻意**只提示不自动写入**：这些值会直接影响前台筛选结果，需要人工裁决
 * （清洗成规范值，还是确认它确实是一个合法取值）。
 */
add_action('admin_notices', 'fh_wheel_dictionary_stray_notice');
function fh_wheel_dictionary_stray_notice(): void
{
    if (!function_exists('get_current_screen')) return;
    $screen = get_current_screen();
    if (!$screen || $screen->base !== 'edit-tags') return;

    $tax = (string) $screen->taxonomy;
    if ($tax !== FH_WHEEL_TAX_PCD && $tax !== FH_WHEEL_TAX_WIDTH) return;
    if (!current_user_can('manage_categories')) return;

    $collected = fh_wheel_collect_dictionary_values();
    $kind = $tax === FH_WHEEL_TAX_PCD ? 'pcd' : 'width';
    $strays = $collected['strays'][$kind];
    if (!$strays) return;

    $items = [];
    foreach ($strays as $value => $count) {
        $items[] = sprintf('%s（%d 条规格）', $value, $count);
    }

    printf(
        '<div class="notice notice-warning"><p><strong>%s</strong></p><p>%s</p><p style="margin-bottom:0">%s</p></div>',
        esc_html($tax === FH_WHEEL_TAX_PCD
            ? '有 PCD 值无法规范化，未进入字典'
            : '有宽度的值脱离 0.5 英寸网格，未进入字典'),
        esc_html('这些值仍存在各型号的规格里，前台会按自己的规则解析它们；这里只做提示，不会自动改写数据。'),
        esc_html(implode('；', $items))
    );
}

add_action('restrict_manage_posts', 'fh_wheel_admin_filters');
function fh_wheel_admin_filters(): void
{
    global $typenow;
    if ($typenow !== FH_WHEEL_POST_TYPE) {
        return;
    }

    $current = isset($_GET['fh_status_filter']) ? sanitize_text_field(wp_unslash($_GET['fh_status_filter'])) : '';
    echo '<select name="fh_status_filter"><option value="">全部发布状态</option>';
    foreach (fh_wheel_decision_fields()['publication_status']['options'] as $value => $label) {
        printf('<option value="%s"%s>%s</option>', esc_attr($value), selected($current, $value, false), esc_html($label));
    }
    echo '</select>';

    $risk = isset($_GET['fh_risk_filter']) ? sanitize_text_field(wp_unslash($_GET['fh_risk_filter'])) : '';
    echo '<select name="fh_risk_filter">'
        . '<option value="">全部商标状态</option>'
        . sprintf('<option value="clean"%s>仅无商标</option>', selected($risk, 'clean', false))
        . sprintf('<option value="risk"%s>仅含商标</option>', selected($risk, 'risk', false))
        . '</select>';
}

add_action('pre_get_posts', 'fh_wheel_admin_filter_query');
function fh_wheel_admin_filter_query(WP_Query $query): void
{
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    if ($query->get('post_type') !== FH_WHEEL_POST_TYPE) {
        return;
    }

    $meta = [];
    if (!empty($_GET['fh_status_filter'])) {
        $meta[] = [
            'key'   => 'publication_status',
            'value' => sanitize_text_field(wp_unslash($_GET['fh_status_filter'])),
        ];
    }
    if (!empty($_GET['fh_risk_filter'])) {
        $wantRisk = sanitize_text_field(wp_unslash($_GET['fh_risk_filter']));
        if ($wantRisk === 'risk') {
            $meta[] = ['key' => 'fact_trademark_hits', 'value' => '', 'compare' => '!='];
        } elseif ($wantRisk === 'clean') {
            $meta[] = ['key' => 'fact_trademark_hits', 'value' => '', 'compare' => '='];
        }
    }
    if ($meta) {
        $query->set('meta_query', $meta);
    }
}

/* ============================================================================
 * REST 访问守卫（必须认证）
 * ========================================================================== */

/**
 * 本 CPT 是**编辑后台**，不是公开接口 —— 公开侧由 Next.js 承载。
 *
 * ⚠️ 为什么必须显式加这道守卫：WP 的 WP_REST_Posts_Controller::check_read_permission()
 * 对 show_in_rest = true 的类型，**只要文章是 published 就放行匿名读** ——
 * `public => false` 完全管不到 REST。实测（scripts/verify-wheel-cpt.py 的 canary 断言）
 * 未认证 GET /wp-json/wp/v2/wheel-models 能读到已发布记录的标题与全部 meta，
 * 而这里的 meta 含 styleName（第三方商标）、候选分、来源键等内部数据。
 *
 * 因此这里把本 CPT 及其分类法的 REST 路由整体收到「必须登录」之后。
 * 后台编辑界面走的是 post.php / admin-ajax，不经过这条路径，不受影响。
 */
add_filter('rest_pre_dispatch', 'fh_wheel_rest_require_auth', 10, 3);
function fh_wheel_rest_require_auth($result, $server, $request)
{
    if ($result !== null) {
        return $result;
    }
    $route = $request->get_route();
    $bases = ['wheel-models', 'wheel-diameters', 'wheel-processes'];

    $hit = false;
    foreach ($bases as $base) {
        if (preg_match('#^/wp/v2/' . preg_quote($base, '#') . '(/|$)#', $route)) {
            $hit = true;
            break;
        }
    }
    if (!$hit) {
        return $result;
    }

    // 允许已认证用户（含应用密码）通过。
    if (is_user_logged_in()) {
        return $result;
    }

    return new WP_Error(
        'rest_forbidden',
        '轮毂型号属于编辑后台数据，需要认证访问。',
        ['status' => 401]
    );
}

/* ============================================================================
 * 公开资格（单一判定点）
 * ========================================================================== */

/**
 * 一个型号是否满足「人工批准」那一半。
 *
 * 机器那一半（有图 + 规格齐）在导入时已过滤，事实快照里带着证据；
 * 这里只判人工决定，且**全程 fail-closed**：任何一项不是明确的 approved 就不放行。
 */
function fh_wheel_is_approved(int $postId): bool
{
    if (get_post_status($postId) !== 'publish') {
        return false;
    }
    $required = [
        'publication_status'   => 'approved',
        'image_rights_status'  => 'approved',
        'supply_status'        => 'confirmed',
        'specification_status' => 'verified',
    ];
    foreach ($required as $key => $want) {
        if ((string) get_post_meta($postId, $key, true) !== $want) {
            return false;
        }
    }
    $approvedVariants = array_filter(array_map('trim', explode(',', (string) get_post_meta($postId, 'approved_variant_keys', true))));
    if (!$approvedVariants) {
        return false;
    }
    if ((string) get_post_meta($postId, 'public_slug', true) === '') {
        return false;
    }
    return true;
}

/* ============================================================================
 * 自检（供导入脚本与运维调用）
 * ========================================================================== */

/**
 * 返回本插件注册内容的现状，用于脚本侧断言。
 *
 * @return array<string, mixed>
 */
function fh_wheel_self_check(): array
{
    $diameters = get_terms(['taxonomy' => FH_WHEEL_TAX_DIAMETER, 'hide_empty' => false]);
    $processes = get_terms(['taxonomy' => FH_WHEEL_TAX_PROCESS, 'hide_empty' => false]);

    $counts = [];
    foreach (fh_wheel_decision_fields()['publication_status']['options'] as $value => $label) {
        $q = new WP_Query([
            'post_type'      => FH_WHEEL_POST_TYPE,
            'post_status'    => 'any',
            'posts_per_page' => 1,
            'fields'         => 'ids',
            'meta_query'     => [['key' => 'publication_status', 'value' => $value]],
        ]);
        $counts[$value] = $q->found_posts;
    }

    $total = new WP_Query([
        'post_type'      => FH_WHEEL_POST_TYPE,
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
    ]);

    return [
        'post_type'       => FH_WHEEL_POST_TYPE,
        'registered'      => post_type_exists(FH_WHEEL_POST_TYPE),
        'taxonomies'      => [
            FH_WHEEL_TAX_DIAMETER => is_wp_error($diameters) ? [] : wp_list_pluck($diameters, 'name'),
            FH_WHEEL_TAX_PROCESS  => is_wp_error($processes) ? [] : wp_list_pluck($processes, 'name'),
        ],
        'meta_keys'       => array_keys((array) get_registered_meta_keys('post', FH_WHEEL_POST_TYPE)),
        'total_records'   => $total->found_posts,
        'status_counts'   => $counts,
        'rest_base'       => 'wheel-models',
    ];
}
// drift-test
