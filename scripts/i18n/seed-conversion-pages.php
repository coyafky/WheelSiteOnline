<?php
/** 仅供本地 WordPress 使用：新增两条四语业务页面，不触及隐私/法律记录。 */

if (wp_get_environment_type() !== 'local') {
    WP_CLI::error('仅允许在 local 环境运行');
}
$path = (string) getenv('FH_CONVERSION_SEED_FILE');
$raw = $path !== '' ? file_get_contents($path) : false;
$all = $raw !== false ? json_decode($raw, true) : null;
if (!is_array($all) || array_keys($all) !== ['request-a-quote', 'contact']) {
    WP_CLI::error('种子文件无效或页面键不匹配');
}
$locales = ['en', 'zh', 'es', 'th'];
foreach ($all as $key => $translations) {
    if (!is_array($translations) || array_keys($translations) !== $locales) {
        WP_CLI::error("{$key} 的语言集合不完整");
    }
    foreach ($translations as $locale => $body) {
        if (!is_array($body) || empty($body['hero']['heading']) || empty($body['seo']['title']) || empty($body['seo']['description'])) {
            WP_CLI::error("{$key}/{$locale} 正文或 SEO 缺失");
        }
    }
    $existing = get_posts([
        'post_type' => 'page', 'post_status' => 'any', 'posts_per_page' => 2,
        'meta_key' => 'fh_page_key', 'meta_value' => $key,
    ]);
    if ($existing) {
        $post = $existing[0];
        $oldContent = (string) get_post_meta($post->ID, 'fh_content_json', true);
        $oldDecoded = json_decode($oldContent, true);
        $localeStatus = json_decode((string) get_post_meta($post->ID, 'fh_locale_status_json', true), true);
        $safeLegacyQuote = $key === 'request-a-quote'
            && count($existing) === 1
            && $post->post_status === 'draft'
            && get_post_meta($post->ID, 'fh_publication_status', true) === 'draft'
            && is_array($oldDecoded)
            && ($oldDecoded['privacyVersion'] ?? null) === ''
            && ($localeStatus === ['en' => 'approved'] || $localeStatus === ['en' => 'draft'])
            && !get_post_meta($post->ID, 'fh_conversion_legacy_backup_json', true);
        if (!$safeLegacyQuote) {
            WP_CLI::error("{$key} 已存在且不符合受控迁移条件，拒绝覆盖");
        }
    }
}

foreach ($all as $key => $translations) {
    $existing = get_posts([
        'post_type' => 'page', 'post_status' => 'any', 'posts_per_page' => 1,
        'meta_key' => 'fh_page_key', 'meta_value' => $key,
    ]);
    if ($existing) {
        $id = (int) $existing[0]->ID;
        $backup = [
            'content' => get_post_meta($id, 'fh_content_json', true),
            'content_by_locale' => get_post_meta($id, 'fh_content_by_locale_json', true),
            'seo_by_locale' => get_post_meta($id, 'fh_seo_by_locale_json', true),
            'locale_status' => get_post_meta($id, 'fh_locale_status_json', true),
        ];
        update_post_meta($id, 'fh_conversion_legacy_backup_json', wp_json_encode($backup, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        $result = wp_update_post(['ID' => $id, 'post_status' => 'publish'], true);
        if (is_wp_error($result)) WP_CLI::error("更新 {$key} 状态失败");
    } else {
        $id = wp_insert_post([
            'post_type' => 'page', 'post_status' => 'publish',
            'post_title' => $translations['en']['seo']['title'],
            'post_name' => $key, 'post_content' => '',
        ], true);
    }
    if (is_wp_error($id) || $id <= 0) {
        WP_CLI::error("创建 {$key} 失败：" . (is_wp_error($id) ? $id->get_error_message() : '无返回 ID'));
    }
    $seo = [];
    foreach ($translations as $locale => $body) {
        $seo[$locale] = ['title' => $body['seo']['title'], 'description' => $body['seo']['description']];
    }
    $encode = static fn($value) => wp_json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    update_post_meta($id, 'fh_page_key', $key);
    update_post_meta($id, 'fh_publication_status', 'approved');
    update_post_meta($id, 'fh_content_json', $encode($translations['en']));
    update_post_meta($id, 'fh_content_by_locale_json', $encode($translations));
    update_post_meta($id, 'fh_seo_title', $seo['en']['title']);
    update_post_meta($id, 'fh_seo_description', $seo['en']['description']);
    update_post_meta($id, 'fh_seo_by_locale_json', $encode($seo));
    update_post_meta($id, 'fh_locale_status_json', $encode(array_fill_keys($locales, 'approved')));
    WP_CLI::log("已新增 {$key}，页面 ID={$id}，四语业务文案 approved");
}
