<?php
/**
 * Plugin Name:       Fenghuai 页面内容 — 原生 Page 接管
 * Description:       用 WordPress 原生 Page 管理首页、公司与产品线页面的结构化文案、SEO 和媒体。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 */

if (!defined('ABSPATH')) exit;

const FH_PAGE_OPTION_AUTHORITATIVE = 'fh_pages_authoritative';
const FH_PAGE_META_KEY = 'fh_page_key';
const FH_PAGE_META_STATUS = 'fh_publication_status';
const FH_PAGE_META_CONTENT = 'fh_content_json';
const FH_PAGE_META_CONTENT_BY_LOCALE = 'fh_content_by_locale_json';
const FH_PAGE_META_SEO_TITLE = 'fh_seo_title';
const FH_PAGE_META_SEO_DESCRIPTION = 'fh_seo_description';
const FH_PAGE_META_SEO_BY_LOCALE = 'fh_seo_by_locale_json';
const FH_PAGE_META_LOCALE_STATUS = 'fh_locale_status_json';
const FH_PAGE_META_MEDIA = 'fh_featured_media_id';

/** @return string[] */
function fh_site_page_keys(): array
{
    return ['home', 'about', 'capabilities', 'product-lines', 'ev-components', 'custom-aluminum', 'safety-tires', 'request-a-quote', 'contact', 'privacy', 'thank-you'];
}

add_action('init', 'fh_pages_register_meta', 12);
function fh_pages_register_meta(): void
{
    foreach ([
        FH_PAGE_META_KEY => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_STATUS => ['type' => 'string', 'default' => 'draft'],
        FH_PAGE_META_CONTENT => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_CONTENT_BY_LOCALE => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_SEO_TITLE => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_SEO_DESCRIPTION => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_SEO_BY_LOCALE => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_LOCALE_STATUS => ['type' => 'string', 'default' => ''],
        FH_PAGE_META_MEDIA => ['type' => 'integer', 'default' => 0],
    ] as $key => $definition) {
        register_post_meta('page', $key, [
            'type' => $definition['type'],
            'single' => true,
            'default' => $definition['default'],
            'show_in_rest' => false,
            'auth_callback' => static fn(): bool => current_user_can('edit_pages'),
            'sanitize_callback' => $definition['type'] === 'integer'
                ? static fn($value): int => absint($value)
                : (in_array($key, [FH_PAGE_META_CONTENT, FH_PAGE_META_CONTENT_BY_LOCALE, FH_PAGE_META_SEO_BY_LOCALE, FH_PAGE_META_LOCALE_STATUS], true)
                    ? static function ($value): string {
                        $decoded = json_decode((string) $value, true);
                        return is_array($decoded) ? (string) wp_json_encode($decoded, JSON_UNESCAPED_UNICODE) : '';
                    }
                    : static fn($value): string => sanitize_textarea_field((string) $value)),
        ]);
    }
}

add_action('rest_api_init', 'fh_pages_register_rest');
function fh_pages_register_rest(): void
{
    register_rest_route('fh/v1', '/pages', [[
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'fh_pages_rest_collection',
        'permission_callback' => '__return_true',
        'args' => [
            'key' => ['type' => 'string', 'sanitize_callback' => 'sanitize_title'],
            'preview' => ['type' => 'boolean', 'default' => false, 'sanitize_callback' => 'rest_sanitize_boolean'],
        ],
    ]]);
}

function fh_pages_rest_collection(WP_REST_Request $request): WP_REST_Response|WP_Error
{
    $preview = (bool) $request->get_param('preview');
    if ($preview && !current_user_can('edit_pages')) {
        return new WP_Error('fh_pages_forbidden', '页面预览需要页面编辑权限。', ['status' => 401]);
    }
    $key = sanitize_title((string) $request->get_param('key'));
    $query = [
        'post_type' => 'page',
        'post_status' => $preview ? ['publish', 'draft', 'pending', 'future', 'private'] : 'publish',
        'posts_per_page' => $key !== '' ? 1 : 100,
        'orderby' => ['menu_order' => 'ASC', 'date' => 'ASC'],
        'no_found_rows' => true,
    ];
    if ($key !== '') $query['meta_key'] = FH_PAGE_META_KEY;
    if ($key !== '') $query['meta_value'] = $key;

    $items = [];
    foreach (get_posts($query) as $post) {
        $pageKey = (string) get_post_meta($post->ID, FH_PAGE_META_KEY, true);
        $publication = (string) get_post_meta($post->ID, FH_PAGE_META_STATUS, true);
        $json = json_decode((string) get_post_meta($post->ID, FH_PAGE_META_CONTENT, true), true);
        if ($pageKey === '' || !is_array($json)) continue;
        if (!$preview && $publication !== 'approved') continue;
        $contentByLocale = fh_pages_decode_json_meta($post->ID, FH_PAGE_META_CONTENT_BY_LOCALE);
        $seoByLocale = fh_pages_decode_json_meta($post->ID, FH_PAGE_META_SEO_BY_LOCALE);
        $localeStatus = fh_pages_decode_json_meta($post->ID, FH_PAGE_META_LOCALE_STATUS);
        if (!$preview) {
            foreach ($contentByLocale as $locale => $_content) {
                if (($localeStatus[$locale] ?? '') !== 'approved') unset($contentByLocale[$locale], $seoByLocale[$locale]);
            }
        }
        $items[] = [
            'id' => $post->ID,
            'slug' => $post->post_name,
            'status' => $post->post_status,
            'title' => ['rendered' => get_the_title($post)],
            'content' => ['rendered' => apply_filters('the_content', $post->post_content)],
            'page' => [
                'page_key' => $pageKey,
                'publication_status' => $publication ?: 'draft',
                'content' => $json,
                'content_by_locale' => $contentByLocale,
                'seo_title' => (string) get_post_meta($post->ID, FH_PAGE_META_SEO_TITLE, true),
                'seo_description' => (string) get_post_meta($post->ID, FH_PAGE_META_SEO_DESCRIPTION, true),
                'seo_by_locale' => $seoByLocale,
                'locale_status' => $localeStatus,
                'image' => fh_pages_public_image($post->ID),
            ],
        ];
    }
    return new WP_REST_Response([
        'authoritative' => get_option(FH_PAGE_OPTION_AUTHORITATIVE, '0') === '1',
        'items' => $items,
    ], 200);
}

/** @return array<string,mixed> */
function fh_pages_decode_json_meta(int $postId, string $metaKey): array
{
    $raw = get_post_meta($postId, $metaKey, true);
    $decoded = json_decode((string) $raw, true);
    return is_array($decoded) ? $decoded : [];
}

/** @return array<string,mixed>|null */
function fh_pages_public_image(int $postId): ?array
{
    $mediaId = absint(get_post_meta($postId, FH_PAGE_META_MEDIA, true));
    if ($mediaId <= 0 || !wp_attachment_is_image($mediaId)) return null;
    $src = wp_get_attachment_url($mediaId);
    if (!$src) return null;
    return [
        'id' => $mediaId,
        'src' => $src,
        'alt' => trim((string) get_post_meta($mediaId, '_wp_attachment_image_alt', true)),
        'caption' => trim((string) wp_get_attachment_caption($mediaId)),
    ];
}

add_action('add_meta_boxes_page', 'fh_pages_add_meta_box');
function fh_pages_add_meta_box(): void
{
    add_meta_box('fh-site-page-fields', '峰徊站点页面内容', 'fh_pages_render_meta_box', 'page', 'normal', 'high');
}

function fh_pages_render_meta_box(WP_Post $post): void
{
    wp_enqueue_media();
    wp_nonce_field('fh_pages_save', 'fh_pages_nonce');
    $status = (string) get_post_meta($post->ID, FH_PAGE_META_STATUS, true) ?: 'draft';
    $mediaId = absint(get_post_meta($post->ID, FH_PAGE_META_MEDIA, true));
    ?>
    <p><strong>双重发布门槛：</strong>WordPress 页面状态为“已发布”，并且下方状态为“已批准”时才会进入前台。</p>
    <p><label for="fh_page_key"><strong>页面键</strong></label><br><input class="regular-text" id="fh_page_key" name="fh_page_key" value="<?php echo esc_attr((string) get_post_meta($post->ID, FH_PAGE_META_KEY, true)); ?>" placeholder="home / about / capabilities"></p>
    <p><label for="fh_publication_status"><strong>编辑发布状态</strong></label><br><select id="fh_publication_status" name="fh_publication_status"><?php foreach (['draft' => '草稿 / 待审', 'approved' => '已批准', 'withdrawn' => '已撤回'] as $value => $label) : ?><option value="<?php echo esc_attr($value); ?>" <?php selected($status, $value); ?>><?php echo esc_html($label); ?></option><?php endforeach; ?></select></p>
    <p><label for="fh_seo_title"><strong>SEO 标题</strong></label><br><input class="widefat" id="fh_seo_title" name="fh_seo_title" value="<?php echo esc_attr((string) get_post_meta($post->ID, FH_PAGE_META_SEO_TITLE, true)); ?>"></p>
    <p><label for="fh_seo_description"><strong>SEO 描述</strong></label><br><textarea class="widefat" rows="3" id="fh_seo_description" name="fh_seo_description"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_SEO_DESCRIPTION, true)); ?></textarea></p>
    <p><label for="fh_content_json"><strong>结构化页面内容（英文正本 / 迁移期快照）</strong></label><br><textarea class="widefat code" rows="12" id="fh_content_json" name="fh_content_json"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_CONTENT, true)); ?></textarea></p>
    <p><label for="fh_content_by_locale_json"><strong>多语言结构化内容 JSON</strong></label><br><textarea class="widefat code" rows="8" id="fh_content_by_locale_json" name="fh_content_by_locale_json"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_CONTENT_BY_LOCALE, true)); ?></textarea><br><span class="description">格式：{"zh":{...},"es":{...},"th":{...}}。字段不完整时不会公开或替代英文正本。</span></p>
    <p><label for="fh_seo_by_locale_json"><strong>多语言 SEO JSON</strong></label><br><textarea class="widefat code" rows="4" id="fh_seo_by_locale_json" name="fh_seo_by_locale_json"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_SEO_BY_LOCALE, true)); ?></textarea><br><span class="description">格式：{"zh":{"title":"...","description":"..."},"es":{...},"th":{...}}。</span></p>
    <p><label for="fh_locale_status_json"><strong>多语言发布状态 JSON</strong></label><br><textarea class="widefat code" rows="3" id="fh_locale_status_json" name="fh_locale_status_json"><?php echo esc_textarea((string) get_post_meta($post->ID, FH_PAGE_META_LOCALE_STATUS, true)); ?></textarea><br><span class="description">格式：{"zh":"draft","es":"approved","th":"withdrawn"}。只有 approved 的语言版本进入公开接口。</span></p>
    <p><label for="fh_featured_media_id"><strong>特色媒体 ID</strong></label><br><input class="small-text" id="fh_featured_media_id" name="fh_featured_media_id" value="<?php echo esc_attr((string) $mediaId); ?>"> <span class="description">媒体库图片必须填写英文 alt。</span></p>
    <?php
}

add_action('save_post_page', 'fh_pages_save_meta', 20);
function fh_pages_save_meta(int $postId): void
{
    if (!isset($_POST['fh_pages_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['fh_pages_nonce'])), 'fh_pages_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $postId)) return;
    $key = sanitize_title((string) wp_unslash($_POST['fh_page_key'] ?? ''));
    if (!in_array($key, fh_site_page_keys(), true)) $key = '';
    $status = sanitize_key((string) wp_unslash($_POST['fh_publication_status'] ?? 'draft'));
    if (!in_array($status, ['draft', 'approved', 'withdrawn'], true)) $status = 'draft';
    $json = json_decode((string) wp_unslash($_POST['fh_content_json'] ?? ''), true);
    update_post_meta($postId, FH_PAGE_META_KEY, $key);
    update_post_meta($postId, FH_PAGE_META_STATUS, $status);
    update_post_meta($postId, FH_PAGE_META_CONTENT, is_array($json) ? wp_json_encode($json, JSON_UNESCAPED_UNICODE) : '');
    $contentByLocale = json_decode((string) wp_unslash($_POST['fh_content_by_locale_json'] ?? ''), true);
    update_post_meta($postId, FH_PAGE_META_CONTENT_BY_LOCALE, is_array($contentByLocale) ? wp_json_encode($contentByLocale, JSON_UNESCAPED_UNICODE) : '');
    update_post_meta($postId, FH_PAGE_META_SEO_TITLE, sanitize_text_field((string) wp_unslash($_POST['fh_seo_title'] ?? '')));
    update_post_meta($postId, FH_PAGE_META_SEO_DESCRIPTION, sanitize_textarea_field((string) wp_unslash($_POST['fh_seo_description'] ?? '')));
    $seoByLocale = json_decode((string) wp_unslash($_POST['fh_seo_by_locale_json'] ?? ''), true);
    update_post_meta($postId, FH_PAGE_META_SEO_BY_LOCALE, is_array($seoByLocale) ? wp_json_encode($seoByLocale, JSON_UNESCAPED_UNICODE) : '');
    $localeStatus = json_decode((string) wp_unslash($_POST['fh_locale_status_json'] ?? ''), true);
    update_post_meta($postId, FH_PAGE_META_LOCALE_STATUS, is_array($localeStatus) ? wp_json_encode($localeStatus, JSON_UNESCAPED_UNICODE) : '');
    update_post_meta($postId, FH_PAGE_META_MEDIA, absint($_POST['fh_featured_media_id'] ?? 0));
}

add_action('admin_init', 'fh_pages_register_setting');
function fh_pages_register_setting(): void
{
    register_setting('writing', FH_PAGE_OPTION_AUTHORITATIVE, [
        'type' => 'boolean',
        'default' => false,
        'sanitize_callback' => static fn($value): string => $value ? '1' : '0',
    ]);
    add_settings_field(FH_PAGE_OPTION_AUTHORITATIVE, '原生 Page 内容接管', static function (): void {
        $enabled = get_option(FH_PAGE_OPTION_AUTHORITATIVE, '0') === '1';
        echo '<label><input type="checkbox" name="' . esc_attr(FH_PAGE_OPTION_AUTHORITATIVE) . '" value="1" ' . checked($enabled, true, false) . '> 首页、公司和产品线 Page 已完成迁移并核验，可作为前台权威内容源</label>';
    }, 'writing');
}

function fh_pages_self_check(): array
{
    return [
        'native_page_registered' => post_type_exists('page'),
        'authoritative' => get_option(FH_PAGE_OPTION_AUTHORITATIVE, '0') === '1',
        'keys' => fh_site_page_keys(),
    ];
}
