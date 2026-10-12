<?php
/**
 * 将四语询盘/联系页写入当前 WordPress 实例。
 *
 * 本文件不依赖 WP-CLI；生产或测试服务器必须显式设置
 * FH_ALLOW_STAGING_SEED=1，避免把内容迁移误当成普通启动动作。
 * 隐私与法律页面不在种子文件中，因此不会被本脚本修改。
 */

declare(strict_types=1);

$loadPath = (string) (getenv('FH_WORDPRESS_LOAD') ?: '/var/www/html/wp-load.php');
$seedPath = (string) getenv('FH_CONVERSION_SEED_FILE');

if ($seedPath === '' || !is_file($seedPath)) {
    fwrite(STDERR, "FH_CONVERSION_SEED_FILE 不存在\n");
    exit(1);
}

require_once $loadPath;

$environment = function_exists('wp_get_environment_type') ? wp_get_environment_type() : 'unknown';
if ($environment !== 'local' && getenv('FH_ALLOW_STAGING_SEED') !== '1') {
    fwrite(STDERR, "非 local 环境必须显式设置 FH_ALLOW_STAGING_SEED=1\n");
    exit(1);
}

$decoded = json_decode((string) file_get_contents($seedPath), true);
if (!is_array($decoded) || array_keys($decoded) !== ['request-a-quote', 'contact']) {
    fwrite(STDERR, "种子文件必须只包含 request-a-quote 与 contact\n");
    exit(1);
}

$locales = ['en', 'zh', 'es', 'th'];
$encode = static fn (mixed $value): string => wp_json_encode(
    $value,
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
);

foreach ($decoded as $key => $translations) {
    if (!is_array($translations) || array_keys($translations) !== $locales) {
        fail("{$key} 的语言集合不完整");
    }
    foreach ($translations as $locale => $body) {
        if (
            !is_array($body)
            || empty($body['hero']['heading'])
            || empty($body['seo']['title'])
            || empty($body['seo']['description'])
        ) {
            fail("{$key}/{$locale} 缺少正文或 SEO");
        }
    }

    $existing = get_posts([
        'post_type' => 'page',
        'post_status' => 'any',
        'posts_per_page' => 2,
        'meta_key' => 'fh_page_key',
        'meta_value' => $key,
    ]);
    if (count($existing) > 1) {
        fail("{$key} 存在多个同键页面，拒绝继续");
    }
    if ($existing) {
        $post = $existing[0];
        $owned = get_post_meta($post->ID, 'fh_conversion_runtime_seed', true) === '1';
        $approved = get_post_meta($post->ID, 'fh_publication_status', true) === 'approved';
        $legacyBackup = get_post_meta($post->ID, 'fh_conversion_legacy_backup_json', true) !== '';
        if (!$owned && !$approved && !$legacyBackup) {
            fail("{$key} 已存在但不是受控业务页面，拒绝覆盖");
        }
    }
}

foreach ($decoded as $key => $translations) {
    $existing = get_posts([
        'post_type' => 'page',
        'post_status' => 'any',
        'posts_per_page' => 1,
        'meta_key' => 'fh_page_key',
        'meta_value' => $key,
    ]);

    if ($existing) {
        $id = (int) $existing[0]->ID;
        $backup = [
            'content' => get_post_meta($id, 'fh_content_json', true),
            'content_by_locale' => get_post_meta($id, 'fh_content_by_locale_json', true),
            'seo_by_locale' => get_post_meta($id, 'fh_seo_by_locale_json', true),
            'locale_status' => get_post_meta($id, 'fh_locale_status_json', true),
        ];
        update_post_meta($id, 'fh_conversion_runtime_backup_json', $encode($backup));
        $result = wp_update_post(['ID' => $id, 'post_status' => 'publish'], true);
        if (is_wp_error($result)) {
            fail("更新 {$key} 状态失败：{$result->get_error_message()}");
        }
    } else {
        $id = wp_insert_post([
            'post_type' => 'page',
            'post_status' => 'publish',
            'post_title' => $translations['en']['seo']['title'],
            'post_name' => $key,
            'post_content' => '',
        ], true);
        if (is_wp_error($id)) {
            fail("创建 {$key} 失败：{$id->get_error_message()}");
        }
    }

    if (!is_int($id) || $id <= 0) {
        fail("{$key} 未得到有效页面 ID");
    }

    $seo = [];
    foreach ($translations as $locale => $body) {
        $seo[$locale] = [
            'title' => $body['seo']['title'],
            'description' => $body['seo']['description'],
        ];
    }
    update_post_meta($id, 'fh_page_key', $key);
    update_post_meta($id, 'fh_publication_status', 'approved');
    update_post_meta($id, 'fh_conversion_runtime_seed', '1');
    update_post_meta($id, 'fh_content_json', $encode($translations['en']));
    update_post_meta($id, 'fh_content_by_locale_json', $encode($translations));
    update_post_meta($id, 'fh_seo_title', $seo['en']['title']);
    update_post_meta($id, 'fh_seo_description', $seo['en']['description']);
    update_post_meta($id, 'fh_seo_by_locale_json', $encode($seo));
    update_post_meta($id, 'fh_locale_status_json', $encode(array_fill_keys($locales, 'approved')));
    fwrite(STDOUT, "已写入 {$key}，页面 ID={$id}，四语业务文案 approved\n");
}

function fail(string $message): never
{
    fwrite(STDERR, $message . "\n");
    exit(1);
}
