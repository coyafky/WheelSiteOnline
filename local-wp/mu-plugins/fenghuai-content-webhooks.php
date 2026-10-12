<?php
/**
 * Plugin Name:       Fenghuai Content — Next.js 缓存刷新
 * Description:       轮毂、原生博客与原生页面保存、撤回或删除后，以共享密钥通知 Next.js 失效对应缓存。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Fenghuai Tech
 */

if (!defined('ABSPATH')) {
    exit;
}

const FH_CONTENT_REVALIDATE_URL_OPTION = 'fh_next_revalidate_url';
const FH_CONTENT_REVALIDATE_SECRET_OPTION = 'fh_next_revalidate_secret';

function fh_content_revalidate_config(): array
{
    $constantUrl = defined('FH_NEXT_REVALIDATE_URL') ? trim((string) FH_NEXT_REVALIDATE_URL) : '';
    $constantSecret = defined('FH_NEXT_REVALIDATE_SECRET') ? trim((string) FH_NEXT_REVALIDATE_SECRET) : '';
    $url = $constantUrl !== '' ? $constantUrl : (string) get_option(FH_CONTENT_REVALIDATE_URL_OPTION, '');
    $secret = $constantSecret !== '' ? $constantSecret : (string) get_option(FH_CONTENT_REVALIDATE_SECRET_OPTION, '');
    return ['url' => trim($url), 'secret' => trim($secret)];
}

function fh_content_send_revalidation(string $type, string $slug): bool
{
    $config = fh_content_revalidate_config();
    if ($config['url'] === '' || $config['secret'] === '') return false;
    if (!in_array($type, ['wheels', 'insights', 'pages'], true)) return false;
    $slug = sanitize_title($slug);

    $body = wp_json_encode(['type' => $type, 'slug' => $slug]);
    $result = wp_remote_post($config['url'], [
        'timeout' => 0.5,
        'blocking' => false,
        'headers' => [
            'content-type' => 'application/json',
            'x-fh-signature' => 'sha256=' . hash_hmac('sha256', $body, $config['secret']),
        ],
        'body' => $body,
    ]);
    if (is_wp_error($result)) {
        error_log('[fh-content-revalidate] request could not be queued');
        return false;
    }
    return true;
}

function fh_content_post_type_payload(int $postId): ?array
{
    $post = get_post($postId);
    if (!$post instanceof WP_Post || wp_is_post_revision($postId)) return null;
    if ($post->post_type === 'wheel_model') {
        $slug = (string) get_post_meta($postId, 'public_slug', true);
        return ['type' => 'wheels', 'slug' => $slug ?: $post->post_name];
    }
    if ($post->post_type === 'fh_guide') {
        return ['type' => 'insights', 'slug' => $post->post_name];
    }
    if ($post->post_type === 'post' && get_post_meta($postId, 'fh_publication_status', true) !== '') {
        return ['type' => 'insights', 'slug' => $post->post_name];
    }
    if ($post->post_type === 'page' && get_post_meta($postId, 'fh_page_key', true) !== '') {
        return ['type' => 'pages', 'slug' => (string) get_post_meta($postId, 'fh_page_key', true)];
    }
    return null;
}

function fh_content_revalidate_post(int $postId): void
{
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    $payload = fh_content_post_type_payload($postId);
    if ($payload) fh_content_send_revalidation($payload['type'], $payload['slug']);
}

add_action('save_post_wheel_model', 'fh_content_revalidate_post', 100);
add_action('save_post_fh_guide', 'fh_content_revalidate_post', 100);
add_action('save_post_post', 'fh_content_revalidate_post', 100);
add_action('save_post_page', 'fh_content_revalidate_post', 100);
add_action('trashed_post', 'fh_content_revalidate_post', 100);
add_action('before_delete_post', 'fh_content_revalidate_post', 100);

add_action('admin_init', 'fh_content_revalidate_register_settings');
function fh_content_revalidate_register_settings(): void
{
    register_setting('writing', FH_CONTENT_REVALIDATE_URL_OPTION, [
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => 'esc_url_raw',
    ]);
    register_setting('writing', FH_CONTENT_REVALIDATE_SECRET_OPTION, [
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    add_settings_field(
        FH_CONTENT_REVALIDATE_URL_OPTION,
        'Next.js 缓存刷新地址',
        static function (): void {
            printf('<input class="regular-text" type="url" name="%1$s" value="%2$s" placeholder="https://example.com/api/revalidate/wordpress">', esc_attr(FH_CONTENT_REVALIDATE_URL_OPTION), esc_attr((string) get_option(FH_CONTENT_REVALIDATE_URL_OPTION, '')));
        },
        'writing'
    );
    add_settings_field(
        FH_CONTENT_REVALIDATE_SECRET_OPTION,
        'Next.js 缓存刷新密钥',
        static function (): void {
            $configured = fh_content_revalidate_config()['secret'] !== '';
            printf('<input class="regular-text" type="password" autocomplete="new-password" name="%1$s" value="%2$s"><p class="description">%3$s；必须与 Next.js 的 WP_REVALIDATE_SECRET 一致。</p>', esc_attr(FH_CONTENT_REVALIDATE_SECRET_OPTION), esc_attr((string) get_option(FH_CONTENT_REVALIDATE_SECRET_OPTION, '')), $configured ? '已配置' : '未配置');
        },
        'writing'
    );
}

function fh_content_revalidate_self_check(): array
{
    $config = fh_content_revalidate_config();
    return [
        'configured' => $config['url'] !== '' && $config['secret'] !== '',
        'url' => $config['url'],
        'secret_present' => $config['secret'] !== '',
    ];
}
