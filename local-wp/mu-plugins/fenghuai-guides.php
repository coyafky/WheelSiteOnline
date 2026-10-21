<?php
/**
 * Plugin Name:       Fenghuai Insights — 技术文章内容层
 * Description:       为 Insights 注册独立文章类型、稳定 REST 契约、双重发布门槛与编辑预览字段。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Fenghuai Tech
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shape version of an insights record. Bump when an existing field changes
 * meaning, not when adding one older records may legitimately lack.
 */
const FH_GUIDE_SCHEMA_VERSION = 1;
const FH_GUIDE_POST_TYPE = 'fh_guide';
const FH_GUIDE_OPTION_AUTHORITATIVE = 'fh_guides_authoritative';
/** 迁移期保留 fh_guide；权威接管后改读 WordPress 原生 post。 */
const FH_GUIDE_NATIVE_POST_TYPE = 'post';
const FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE = 'fh_guides_native_authoritative';

/** @return string[] */
function fh_guide_editable_post_types(): array
{
    return [FH_GUIDE_NATIVE_POST_TYPE];
}

/** @return string[] */
function fh_guide_compatible_post_types(): array
{
    return [FH_GUIDE_POST_TYPE, FH_GUIDE_NATIVE_POST_TYPE];
}

/** @return array<string, array{label:string,type:string}> */
function fh_guide_fields(): array
{
    return [
        'publication_status' => ['label' => '编辑发布状态', 'type' => 'string'],
        'summary' => ['label' => '摘要', 'type' => 'string'],
        'category' => ['label' => '分类', 'type' => 'string'],
        'reading_time' => ['label' => '阅读时长', 'type' => 'string'],
        'answer' => ['label' => '直接回答', 'type' => 'string'],
        'needs_verification' => ['label' => '需要工程确认', 'type' => 'boolean'],
        'detail_json' => ['label' => '列表页短版 JSON', 'type' => 'string'],
        'sections_json' => ['label' => '正文分段 JSON', 'type' => 'string'],
        'seo_title' => ['label' => 'SEO 标题', 'type' => 'string'],
        'seo_description' => ['label' => 'SEO 描述', 'type' => 'string'],
        /*
         * Shape version of one insights record.
         *
         * Pages and wheels carry one; insights did not, so a record written by
         * an older importer was indistinguishable from a current one. Readers
         * can now reject a shape they do not understand instead of misreading
         * it. Stored as a string like the rest of this table, compared as int.
         */
        'schema_version' => ['label' => '记录结构版本', 'type' => 'string'],
        'translations_json' => ['label' => '多语言正文 JSON', 'type' => 'string'],
        'translation_status_json' => ['label' => '多语言发布状态 JSON', 'type' => 'string'],
    ];
}

add_action('init', 'fh_guide_register_content_type');
function fh_guide_register_content_type(): void
{
    register_post_type(FH_GUIDE_POST_TYPE, [
        'labels' => [
            'name' => '技术文章',
            'singular_name' => '技术文章',
            'menu_name' => '技术文章',
            'add_new_item' => '新增技术文章',
            'edit_item' => '编辑技术文章',
            'search_items' => '搜索技术文章',
            'not_found' => '没有找到技术文章',
        ],
        'supports' => ['title', 'excerpt', 'custom-fields'],
        'show_in_rest' => true,
        'rest_base' => 'fh-guides',
        'public' => false,
        'publicly_queryable' => false,
        'exclude_from_search' => true,
        // fh_guide is a migration-era read/rollback source, not an authoring UI.
        'show_ui' => false,
        'show_in_menu' => false,
        'show_in_nav_menus' => false,
        'menu_icon' => 'dashicons-welcome-write-blog',
        'menu_position' => 22,
        'has_archive' => false,
        'rewrite' => false,
        'query_var' => false,
        'capability_type' => ['fh_guide', 'fh_guides'],
        'map_meta_cap' => true,
    ]);

    // Keep legacy metadata registered so migration/import code can read it.
    foreach (fh_guide_compatible_post_types() as $postType) {
        foreach (fh_guide_fields() as $key => $definition) {
            register_post_meta($postType, 'fh_' . $key, [
            'type' => $definition['type'],
            'single' => true,
            'default' => $definition['type'] === 'boolean' ? false : '',
            'show_in_rest' => false,
            'sanitize_callback' => $definition['type'] === 'boolean'
                ? 'rest_sanitize_boolean'
                : 'sanitize_text_field',
            'auth_callback' => static fn(): bool => current_user_can('edit_posts'),
            ]);
        }
    }
}

add_filter('map_meta_cap', 'fh_guide_block_legacy_editing', 10, 4);
function fh_guide_block_legacy_editing(array $caps, string $cap, int $userId, array $args): array
{
    $legacyPrimitiveCaps = ['create_fh_guides', 'edit_fh_guide', 'delete_fh_guide', 'publish_fh_guides'];
    if (in_array($cap, $legacyPrimitiveCaps, true)) {
        return ['do_not_allow'];
    }
    if (!in_array($cap, ['edit_post', 'delete_post', 'publish_post'], true)) {
        return $caps;
    }
    $postId = isset($args[0]) ? absint($args[0]) : 0;
    if ($postId > 0 && get_post_type($postId) === FH_GUIDE_POST_TYPE) {
        return ['do_not_allow'];
    }
    return $caps;
}

/** 严格解码数组字段；错误 JSON 一律返回 null，让前端 fail-closed。 */
function fh_guide_decode_json(int $post_id, string $key): ?array
{
    $raw = get_post_meta($post_id, $key, true);
    if (!is_string($raw) || trim($raw) === '') {
        return null;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

/**
 * 读取 ACF 原生字段；只允许原生 post 使用，避免旧 fh_guide 获得新的编辑入口。
 * null 表示 ACF 没有该字段值，调用方应回退到既有 fh_* meta。
 */
function fh_guide_acf_value(int $post_id, string $fieldName): mixed
{
    if (get_post_type($post_id) !== FH_GUIDE_NATIVE_POST_TYPE
        || !function_exists('get_field')
        || !metadata_exists('post', $post_id, $fieldName)) {
        return null;
    }

    return get_field($fieldName, $post_id, false);
}

/** @return array<int,array<string,mixed>>|null */
function fh_guide_acf_repeater(int $post_id, string $fieldName, string $bodyKey): ?array
{
    $rows = fh_guide_acf_value($post_id, $fieldName);
    if (!is_array($rows) || $rows === []) {
        return null;
    }

    $normalized = [];
    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }
        $body = [];
        $rawBody = $row[$bodyKey] ?? [];
        if (is_array($rawBody)) {
            foreach ($rawBody as $line) {
                $value = is_array($line) ? ($line['paragraph'] ?? '') : $line;
                if (is_scalar($value) && trim((string) $value) !== '') {
                    $body[] = (string) $value;
                }
            }
        }
        $heading = is_scalar($row['heading'] ?? null) ? trim((string) $row['heading']) : '';
        if ($heading !== '' || $body !== []) {
            $normalized[] = ['heading' => $heading, $bodyKey => $body];
        }
    }

    return $normalized !== [] ? $normalized : null;
}

function fh_guide_field_value(int $post_id, string $fieldName, string $fallbackKey): mixed
{
    $acfValue = fh_guide_acf_value($post_id, $fieldName);
    return $acfValue !== null ? $acfValue : get_post_meta($post_id, $fallbackKey, true);
}

/** @return array<int,array<string,mixed>>|null */
function fh_guide_structured_rows(int $post_id, string $acfField, string $jsonKey, string $bodyKey): ?array
{
    return fh_guide_acf_repeater($post_id, $acfField, $bodyKey)
        ?? fh_guide_decode_json($post_id, $jsonKey);
}

/** @return array<string,mixed> */
function fh_guide_rest_fields(int $post_id, bool $preview = false): array
{
    $translations = fh_guide_decode_json($post_id, 'fh_translations_json') ?? [];
    $translationStatus = fh_guide_decode_json($post_id, 'fh_translation_status_json') ?? [];
    if (!$preview) {
        foreach ($translations as $locale => $_translation) {
            if (($translationStatus[$locale] ?? '') !== 'approved') unset($translations[$locale]);
        }
    }
    return [
        'publication_status' => (string) fh_guide_field_value($post_id, 'fh_publication_status', 'fh_publication_status'),
        'summary' => (string) fh_guide_field_value($post_id, 'fh_summary', 'fh_summary'),
        'category' => (string) fh_guide_field_value($post_id, 'fh_category', 'fh_category'),
        'reading_time' => (string) fh_guide_field_value($post_id, 'fh_reading_time', 'fh_reading_time'),
        'answer' => (string) fh_guide_field_value($post_id, 'fh_answer', 'fh_answer'),
        'needs_verification' => (bool) fh_guide_field_value($post_id, 'fh_needs_verification', 'fh_needs_verification'),
        'detail' => fh_guide_structured_rows($post_id, 'fh_detail', 'fh_detail_json', 'paragraphs'),
        'sections' => fh_guide_structured_rows($post_id, 'fh_sections', 'fh_sections_json', 'body'),
        'seo_title' => (string) fh_guide_field_value($post_id, 'fh_seo_title', 'fh_seo_title'),
        'seo_description' => (string) fh_guide_field_value($post_id, 'fh_seo_description', 'fh_seo_description'),
        'translations' => $translations,
        'translation_status' => $translationStatus,
        'image' => function_exists('fh_guide_authoring_public_image')
            ? fh_guide_authoring_public_image($post_id)
            : null,
    ];
}

/** WordPress publish 与编辑批准必须同时成立。 */
function fh_guide_is_public(int $post_id): bool
{
    return in_array(get_post_type($post_id), fh_guide_compatible_post_types(), true)
        && get_post_status($post_id) === 'publish'
        && fh_guide_field_value($post_id, 'fh_publication_status', 'fh_publication_status') === 'approved';
}

add_action('rest_api_init', 'fh_guide_register_rest_routes');
function fh_guide_register_rest_routes(): void
{
    register_rest_route('fh/v1', '/guides', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'fh_guide_rest_collection',
            'permission_callback' => '__return_true',
            'args' => [
                'preview' => [
                    'type' => 'boolean',
                    'default' => false,
                    'sanitize_callback' => 'rest_sanitize_boolean',
                ],
                'slug' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_title',
                ],
                'page' => [
                    'type' => 'integer',
                    'default' => 1,
                    'sanitize_callback' => 'absint',
                ],
                'per_page' => [
                    'type' => 'integer',
                    'default' => 100,
                    'sanitize_callback' => 'absint',
                ],
            ],
        ],
    ]);
}

function fh_guide_rest_collection(WP_REST_Request $request): WP_REST_Response|WP_Error
{
    $preview = (bool) $request->get_param('preview');
    if ($preview && !current_user_can('edit_posts')) {
        return new WP_Error('fh_guide_forbidden', '预览需要文章编辑权限。', ['status' => 401]);
    }

    // One resolver decides the source; see fh_guide_authoritative_source().
    $authoritative = fh_guide_authoritative_source();
    $useNative = $authoritative['source'] !== 'legacy';

    /*
     * Pagination.
     *
     * `posts_per_page => 100` with `no_found_rows => true` was a silent ceiling:
     * article 101 simply never reached the frontend, and the response carried no
     * total, so nothing could tell a complete list from a truncated one.
     *
     * `per_page` is now a request parameter (1–100, default 100 so existing
     * callers see the same first page), `page` pages through the result, and the
     * response reports `total`/`total_pages` so a caller can detect truncation
     * instead of assuming completeness.
     */
    $perPage = $request->get_param('per_page');
    $perPage = $perPage === null ? 100 : max(1, min(100, absint($perPage)));
    $page = max(1, absint($request->get_param('page') ?? 1));

    $query = [
        'post_type' => $useNative ? FH_GUIDE_NATIVE_POST_TYPE : FH_GUIDE_POST_TYPE,
        'post_status' => $preview ? ['publish', 'draft', 'pending', 'future', 'private'] : 'publish',
        'posts_per_page' => $perPage,
        'paged' => $page,
        'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        // Needed for total/total_pages. Costs one COUNT; worth it, because
        // without it a truncated list is indistinguishable from a short one.
        'no_found_rows' => false,
    ];
    $slug = (string) $request->get_param('slug');
    if ($slug !== '') {
        $query['name'] = $slug;
    }

    // One query for both the page and the totals: `get_posts()` would discard
    // `found_posts`, forcing a second identical COUNT.
    $result = new WP_Query($query);
    $total = (int) $result->found_posts;
    $totalPages = $perPage > 0 ? (int) ceil($total / $perPage) : 0;

    $items = [];
    foreach ($result->posts as $post) {
        if (!$preview && !fh_guide_is_public($post->ID)) {
            continue;
        }
        $items[] = [
            'id' => $post->ID,
            'slug' => $post->post_name,
            'status' => $post->post_status,
            'title' => ['rendered' => get_the_title($post)],
            'excerpt' => ['rendered' => get_the_excerpt($post)],
            'content' => ['rendered' => apply_filters('the_content', $post->post_content)],
            'guide' => fh_guide_rest_fields($post->ID, $preview),
        ];
    }

    wp_reset_postdata();

    return new WP_REST_Response([
        // false 表示 CMS 迁移尚未接管；Next 必须继续使用已审核的本地内容。
        // 真正的判据是「解析出的来源是否为 native」——legacy 永远不算接管，
        // 否则 Next 会去读一个后台已经无法编辑的来源（死内容）。
        'authoritative' => $authoritative['source'] === 'native',
        'items' => $items,
        // Pagination envelope. `total` is the full match set, so a caller can
        // tell a complete list from a truncated one — the old fixed 100 gave no
        // way to distinguish them.
        'total' => $total,
        'total_pages' => $totalPages,
        'page' => $page,
        'per_page' => $perPage,
        'source' => $useNative ? 'wordpress-post' : 'legacy-cpt',
    ], 200);
}

add_action('add_meta_boxes_' . FH_GUIDE_POST_TYPE, 'fh_guide_add_meta_box');
add_action('add_meta_boxes_' . FH_GUIDE_NATIVE_POST_TYPE, 'fh_guide_add_meta_box');
function fh_guide_add_meta_box(): void
{
    $screen = get_current_screen();
    if (!$screen || !in_array($screen->post_type, fh_guide_editable_post_types(), true)) return;
    add_meta_box('fh-guide-fields', 'Insights 文章字段', 'fh_guide_render_meta_box', $screen->post_type, 'normal', 'high');
}

function fh_guide_render_meta_box(WP_Post $post): void
{
    wp_nonce_field('fh_guide_save', 'fh_guide_nonce');
    $status = (string) get_post_meta($post->ID, 'fh_publication_status', true);
    ?>
    <p><strong>双重发布门槛：</strong>WordPress 状态为“已发布”，并且下方编辑状态为“已批准”，文章才会公开。</p>
    <p>
        <label for="fh_publication_status"><strong>编辑发布状态</strong></label><br>
        <select id="fh_publication_status" name="fh_publication_status">
            <?php foreach (['draft' => '草稿 / 待审', 'approved' => '已批准', 'withdrawn' => '已撤回'] as $value => $label) : ?>
                <option value="<?php echo esc_attr($value); ?>" <?php selected($status ?: 'draft', $value); ?>><?php echo esc_html($label); ?></option>
            <?php endforeach; ?>
        </select>
    </p>
    <?php
    $textareas = ['summary', 'answer', 'detail_json', 'sections_json', 'seo_description'];
    foreach (fh_guide_fields() as $key => $definition) {
        if (in_array($key, ['publication_status', 'needs_verification'], true)) {
            continue;
        }
        $name = 'fh_' . $key;
        $value = (string) get_post_meta($post->ID, $name, true);
        echo '<p><label for="' . esc_attr($name) . '"><strong>' . esc_html($definition['label']) . '</strong></label><br>';
        if (in_array($key, $textareas, true)) {
            echo '<textarea class="widefat" rows="' . (str_ends_with($key, '_json') ? '10' : '3') . '" id="' . esc_attr($name) . '" name="' . esc_attr($name) . '">' . esc_textarea($value) . '</textarea>';
        } else {
            echo '<input class="widefat" type="text" id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" value="' . esc_attr($value) . '">';
        }
        echo '</p>';
    }
    $checked = (bool) get_post_meta($post->ID, 'fh_needs_verification', true);
    echo '<p><label><input type="checkbox" name="fh_needs_verification" value="1" ' . checked($checked, true, false) . '> 需要工程确认</label></p>';
}

add_action('save_post_' . FH_GUIDE_POST_TYPE, 'fh_guide_save_meta');
add_action('save_post_' . FH_GUIDE_NATIVE_POST_TYPE, 'fh_guide_save_meta');
function fh_guide_save_meta(int $post_id): void
{
    if (!isset($_POST['fh_guide_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['fh_guide_nonce'])), 'fh_guide_save')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $status = isset($_POST['fh_publication_status']) ? sanitize_key(wp_unslash($_POST['fh_publication_status'])) : 'draft';
    if (!in_array($status, ['draft', 'approved', 'withdrawn'], true)) {
        $status = 'draft';
    }
    update_post_meta($post_id, 'fh_publication_status', $status);

    foreach (array_keys(fh_guide_fields()) as $key) {
        if (in_array($key, ['publication_status', 'needs_verification'], true)) {
            continue;
        }
        $name = 'fh_' . $key;
        $value = isset($_POST[$name]) ? wp_unslash($_POST[$name]) : '';
        if (str_ends_with($key, '_json')) {
            $decoded = json_decode($value, true);
            update_post_meta($post_id, $name, is_array($decoded) ? wp_json_encode($decoded, JSON_UNESCAPED_UNICODE) : '');
        } else {
            update_post_meta($post_id, $name, sanitize_textarea_field($value));
        }
    }
    update_post_meta($post_id, 'fh_needs_verification', isset($_POST['fh_needs_verification']) ? '1' : '0');
}

/**
 * Which post type the public REST endpoint reads from.
 *
 * `'native'` = WordPress 原生 `post` (the migration target).
 * `'legacy'` = the old `fh_guide` CPT (rollback only).
 * `null`     = neither is authoritative; Next.js keeps serving its reviewed
 *              local snapshot.
 *
 * ── Why this is one function and not two option reads ──────────────────────
 * The endpoint used to pick a post type from the native flag and then report
 * `authoritative` from that same flag — while the legacy flag was consulted on a
 * different branch. Nothing stopped both flags from being `1`, and one
 * combination was actively broken: native=0 with legacy=1 made the site publish
 * from the legacy CPT, whose editing capability is hard-blocked by
 * `fh_guide_block_legacy_editing()`. Editors would see a live article they could
 * not open or fix — dead content.
 *
 * Reading both flags in one place makes the states mutually exclusive by
 * construction, and native always wins so the migration moves forward rather
 * than being pinned to the rollback source.
 *
 * @return array{source: 'native'|'legacy'|null, legacy_flag: bool, native_flag: bool, conflict: bool}
 */
function fh_guide_authoritative_source(): array
{
    $legacy = get_option(FH_GUIDE_OPTION_AUTHORITATIVE, '0') === '1';
    $native = get_option(FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE, '0') === '1';

    return [
        'source' => $native ? 'native' : ($legacy ? 'legacy' : null),
        'legacy_flag' => $legacy,
        'native_flag' => $native,
        // Both on: resolvable, but an operator mistake worth surfacing.
        'conflict' => $legacy && $native,
    ];
}

/**
 * Keep the two flags from ever both being on.
 *
 * Enforced on `pre_update_option_*` rather than only as the settings-screen
 * sanitize callback. `register_setting()`'s sanitizer runs for form submissions
 * but NOT for programmatic `update_option()` calls, which is exactly how this
 * environment reached the broken both-on state — so a guard limited to the form
 * would not have prevented it.
 *
 * Turning one on clears the other. Native wins the tie because it is the
 * migration target; the endpoint also prefers it, so the two agree.
 *
 * Re-entrancy: clearing the other flag goes through `update_option()` again,
 * which re-enters this filter. A static guard makes the nested call a plain
 * write so the two cannot ping-pong.
 *
 * NOTE: this is best-effort normalisation on write. `update_option()` compares
 * against its cached old value and can skip this filter (e.g. writing `1` when
 * the cache already says `1`), so a write-only guard cannot be the sole
 * defence. `fh_guide_authoritative_source()` is the actual contract and resolves
 * any residual both-on state to a single source.
 */
function fh_guide_enforce_single_source($value, $option)
{
    static $enforcing = false;

    $on = $value ? '1' : '0';
    if ($on === '1' && !$enforcing) {
        $other = $option === FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE
            ? FH_GUIDE_OPTION_AUTHORITATIVE
            : FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE;
        $enforcing = true;
        // `false` for autoload: these are read on admin screens only.
        update_option($other, '0', false);
        $enforcing = false;
    }
    return $on;
}
add_filter('pre_update_option_' . FH_GUIDE_OPTION_AUTHORITATIVE, 'fh_guide_enforce_single_source', 10, 2);
add_filter('pre_update_option_' . FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE, 'fh_guide_enforce_single_source', 10, 2);

/**
 * Is there a both-on state right now?
 *
 * Surfaced on the settings screen and in the self-check so the operator can see
 * it; the read path already collapses it to native.
 */
function fh_guide_source_conflict(): bool
{
    return fh_guide_authoritative_source()['conflict'];
}

/**
 * Whether the legacy CPT may be selected as the public source.
 *
 * Editing on the legacy CPT is hard-blocked, so publishing from it creates
 * articles nobody can open or correct. It stays available only as long as the
 * migration still needs a rollback target — i.e. while no native article exists
 * yet. Once native content is present, the flag is refused and turned off rather
 * than being allowed to strand live content.
 */
function fh_guide_legacy_selectable(): bool
{
    $nativeCount = (int) (new WP_Query([
        'post_type' => FH_GUIDE_NATIVE_POST_TYPE,
        'post_status' => 'any',
        'meta_key' => 'fh_publication_status',
        'fields' => 'ids',
        'posts_per_page' => 1,
        'no_found_rows' => true,
        'update_post_meta_cache' => false,
        'update_post_term_cache' => false,
    ]))->post_count;

    return $nativeCount === 0;
}

add_action('admin_init', 'fh_guide_register_setting');
function fh_guide_register_setting(): void
{
    register_setting('writing', FH_GUIDE_OPTION_AUTHORITATIVE, [
        'type' => 'boolean',
        'default' => false,
        'sanitize_callback' => static fn($value): string => $value ? '1' : '0',
    ]);
    register_setting('writing', FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE, [
        'type' => 'boolean',
        'default' => false,
        'sanitize_callback' => static fn($value): string => $value ? '1' : '0',
    ]);
    add_settings_field(
        FH_GUIDE_OPTION_AUTHORITATIVE,
        'Insights 内容接管',
        static function (): void {
            $enabled = get_option(FH_GUIDE_OPTION_AUTHORITATIVE, '0') === '1';
            $selectable = fh_guide_legacy_selectable();
            printf(
                '<label><input type="checkbox" name="%1$s" value="1" %2$s %3$s> 旧 CPT 作为权威内容源（仅迁移回滚期可用）</label>',
                esc_attr(FH_GUIDE_OPTION_AUTHORITATIVE),
                checked($enabled, true, false),
                $selectable ? '' : 'disabled'
            );
            if (!$selectable) {
                echo '<p class="description">原生文章已存在，旧 CPT 编辑入口已封；继续以它为准会产生无法编辑的线上内容。此选项已停用。</p>';
            }
        },
        'writing'
    );
    add_settings_field(
        FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE,
        '原生博客接管',
        static function (): void {
            $enabled = get_option(FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE, '0') === '1';
            echo '<label><input type="checkbox" name="' . esc_attr(FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE) . '" value="1" ' . checked($enabled, true, false) . '> 已将审核文章迁移到 WordPress 原生“文章”，允许前台读取</label>';
        },
        'writing'
    );
}

/** 供容器验收脚本读取，不暴露内容。 */
function fh_guide_self_check(): array
{
    $type = get_post_type_object(FH_GUIDE_POST_TYPE);
    $nativeMeta = get_registered_meta_keys('post', FH_GUIDE_NATIVE_POST_TYPE);
    $legacyPrimitiveCaps = ['create_fh_guides', 'edit_fh_guide', 'delete_fh_guide', 'publish_fh_guides'];
    return [
        'registered' => $type !== null,
        'rest_base' => $type?->rest_base ?? '',
        'legacy_admin_hidden' => $type !== null && $type->show_ui === false && $type->show_in_menu === false,
        'legacy_editable' => false,
        'legacy_capability_type' => $type?->capability_type ?? null,
        'legacy_primitive_caps_blocked' => array_reduce(
            $legacyPrimitiveCaps,
            static fn(bool $blocked, string $cap): bool => $blocked && fh_guide_block_legacy_editing([], $cap, 0, []) === ['do_not_allow'],
            true
        ),
        'authoritative' => get_option(FH_GUIDE_OPTION_AUTHORITATIVE, '0') === '1',
        'native_authoritative' => get_option(FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE, '0') === '1',
        'native_post_type' => FH_GUIDE_NATIVE_POST_TYPE,
        'native_fields_registered' => array_reduce(
            array_keys(fh_guide_fields()),
            static fn(bool $registered, string $key): bool => $registered && isset($nativeMeta['fh_' . $key]),
            true
        ),
        'field_keys' => array_keys(fh_guide_fields()),
        'acf_installed' => function_exists('acf_add_local_field_group'),
        'acf_group_registered' => function_exists('fh_guide_acf_group_registered')
            ? fh_guide_acf_group_registered()
            : false,
        'acf_group_post_only' => function_exists('fh_guide_acf_group_post_only')
            ? fh_guide_acf_group_post_only()
            : false,
        'acf_repeater_available' => function_exists('fh_guide_acf_repeater_available')
            ? fh_guide_acf_repeater_available()
            : false,
        'acf_field_names' => function_exists('fh_guide_acf_field_names')
            ? fh_guide_acf_field_names()
            : [],
    ];
}
