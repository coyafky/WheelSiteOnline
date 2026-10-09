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

const FH_GUIDE_POST_TYPE = 'fh_guide';
const FH_GUIDE_OPTION_AUTHORITATIVE = 'fh_guides_authoritative';

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
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_nav_menus' => false,
        'menu_icon' => 'dashicons-welcome-write-blog',
        'menu_position' => 22,
        'has_archive' => false,
        'rewrite' => false,
        'query_var' => false,
        'capability_type' => 'post',
        'map_meta_cap' => true,
    ]);

    foreach (fh_guide_fields() as $key => $definition) {
        register_post_meta(FH_GUIDE_POST_TYPE, 'fh_' . $key, [
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

/** @return array<string,mixed> */
function fh_guide_rest_fields(int $post_id): array
{
    return [
        'publication_status' => (string) get_post_meta($post_id, 'fh_publication_status', true),
        'summary' => (string) get_post_meta($post_id, 'fh_summary', true),
        'category' => (string) get_post_meta($post_id, 'fh_category', true),
        'reading_time' => (string) get_post_meta($post_id, 'fh_reading_time', true),
        'answer' => (string) get_post_meta($post_id, 'fh_answer', true),
        'needs_verification' => (bool) get_post_meta($post_id, 'fh_needs_verification', true),
        'detail' => fh_guide_decode_json($post_id, 'fh_detail_json'),
        'sections' => fh_guide_decode_json($post_id, 'fh_sections_json'),
        'seo_title' => (string) get_post_meta($post_id, 'fh_seo_title', true),
        'seo_description' => (string) get_post_meta($post_id, 'fh_seo_description', true),
        'image' => function_exists('fh_guide_authoring_public_image')
            ? fh_guide_authoring_public_image($post_id)
            : null,
    ];
}

/** WordPress publish 与编辑批准必须同时成立。 */
function fh_guide_is_public(int $post_id): bool
{
    return get_post_type($post_id) === FH_GUIDE_POST_TYPE
        && get_post_status($post_id) === 'publish'
        && get_post_meta($post_id, 'fh_publication_status', true) === 'approved';
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

    $query = [
        'post_type' => FH_GUIDE_POST_TYPE,
        'post_status' => $preview ? ['publish', 'draft', 'pending', 'future', 'private'] : 'publish',
        'posts_per_page' => 100,
        'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        'no_found_rows' => true,
    ];
    $slug = (string) $request->get_param('slug');
    if ($slug !== '') {
        $query['name'] = $slug;
    }

    $items = [];
    foreach (get_posts($query) as $post) {
        if (!$preview && !fh_guide_is_public($post->ID)) {
            continue;
        }
        $items[] = [
            'id' => $post->ID,
            'slug' => $post->post_name,
            'status' => $post->post_status,
            'title' => ['rendered' => get_the_title($post)],
            'excerpt' => ['rendered' => get_the_excerpt($post)],
            'guide' => fh_guide_rest_fields($post->ID),
        ];
    }

    return new WP_REST_Response([
        // false 表示 CMS 迁移尚未接管；Next 必须继续使用已审核的本地内容。
        // 只有内容全部导入并人工核验后，管理员才可把它切为 true。
        'authoritative' => get_option(FH_GUIDE_OPTION_AUTHORITATIVE, '0') === '1',
        'items' => $items,
    ], 200);
}

add_action('add_meta_boxes_' . FH_GUIDE_POST_TYPE, 'fh_guide_add_meta_box');
function fh_guide_add_meta_box(): void
{
    add_meta_box('fh-guide-fields', 'Insights 文章字段', 'fh_guide_render_meta_box', FH_GUIDE_POST_TYPE, 'normal', 'high');
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

add_action('admin_init', 'fh_guide_register_setting');
function fh_guide_register_setting(): void
{
    register_setting('writing', FH_GUIDE_OPTION_AUTHORITATIVE, [
        'type' => 'boolean',
        'default' => false,
        'sanitize_callback' => static fn($value): string => $value ? '1' : '0',
    ]);
    add_settings_field(
        FH_GUIDE_OPTION_AUTHORITATIVE,
        'Insights 内容接管',
        static function (): void {
            $enabled = get_option(FH_GUIDE_OPTION_AUTHORITATIVE, '0') === '1';
            echo '<label><input type="checkbox" name="' . esc_attr(FH_GUIDE_OPTION_AUTHORITATIVE) . '" value="1" ' . checked($enabled, true, false) . '> WordPress 已完整导入并核验文章，可作为权威内容源</label>';
        },
        'writing'
    );
}

/** 供容器验收脚本读取，不暴露内容。 */
function fh_guide_self_check(): array
{
    $type = get_post_type_object(FH_GUIDE_POST_TYPE);
    return [
        'registered' => $type !== null,
        'rest_base' => $type?->rest_base ?? '',
        'authoritative' => get_option(FH_GUIDE_OPTION_AUTHORITATIVE, '0') === '1',
        'field_keys' => array_keys(fh_guide_fields()),
    ];
}
