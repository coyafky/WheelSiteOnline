<?php
/** 将 export-native-pages.mjs 生成的页面包幂等导入 WordPress 原生 Page。 */

require '/var/www/html/wp-load.php';
$jsonPath = $argv[1] ?? '/tmp/fenghuai-native-pages.json';
$payload = json_decode((string) file_get_contents($jsonPath), true);
if (!is_array($payload['records'] ?? null)) {
    fwrite(STDERR, "页面迁移包无效\n");
    exit(1);
}

$original = get_option(FH_PAGE_OPTION_AUTHORITATIVE, '0');
$created = 0;
$updated = 0;
$failures = [];

foreach ($payload['records'] as $record) {
    $key = sanitize_title((string) ($record['key'] ?? ''));
    if (!in_array($key, fh_site_page_keys(), true)) {
        $failures[] = $key . '：页面键不在白名单';
        continue;
    }
    $existing = get_posts([
        'post_type' => 'page',
        'post_status' => ['publish', 'draft', 'pending', 'private'],
        'posts_per_page' => 1,
        'meta_key' => FH_PAGE_META_KEY,
        'meta_value' => $key,
    ]);
    $publication = in_array((string) ($record['publicationStatus'] ?? 'approved'), ['draft', 'approved', 'withdrawn'], true)
        ? (string) $record['publicationStatus']
        : 'draft';
    $postId = wp_insert_post([
        'ID' => $existing ? (int) $existing[0]->ID : 0,
        'post_type' => 'page',
        'post_title' => sanitize_text_field((string) ($record['title'] ?? $key)),
        'post_name' => sanitize_title((string) ($record['slug'] ?? $key)),
        'post_status' => $publication === 'approved' ? 'publish' : 'draft',
        'post_content' => '',
        'menu_order' => array_search($key, fh_site_page_keys(), true),
    ], true);
    if (is_wp_error($postId)) {
        $failures[] = $key . '：' . $postId->get_error_message();
        continue;
    }
    $existing ? $updated++ : $created++;
    update_post_meta($postId, FH_PAGE_META_KEY, $key);
    update_post_meta($postId, FH_PAGE_META_STATUS, $publication);
    $content = $record['content'] ?? null;
    if (!is_array($content)) {
        $failures[] = $key . '：结构化内容不是对象';
        continue;
    }
    update_post_meta($postId, FH_PAGE_META_CONTENT, wp_json_encode($content, JSON_UNESCAPED_UNICODE));
    $contentByLocale = is_array($record['contentByLocale'] ?? null)
        ? $record['contentByLocale']
        : ['en' => $content];
    update_post_meta($postId, FH_PAGE_META_CONTENT_BY_LOCALE, wp_json_encode($contentByLocale, JSON_UNESCAPED_UNICODE));
    update_post_meta($postId, FH_PAGE_META_SEO_TITLE, sanitize_text_field((string) ($record['seoTitle'] ?? '')));
    update_post_meta($postId, FH_PAGE_META_SEO_DESCRIPTION, sanitize_textarea_field((string) ($record['seoDescription'] ?? '')));
    $seoByLocale = is_array($record['seoByLocale'] ?? null)
        ? $record['seoByLocale']
        : ['en' => ['title' => (string) ($record['seoTitle'] ?? ''), 'description' => (string) ($record['seoDescription'] ?? '')]];
    update_post_meta($postId, FH_PAGE_META_SEO_BY_LOCALE, wp_json_encode($seoByLocale, JSON_UNESCAPED_UNICODE));
    $localeStatus = is_array($record['localeStatus'] ?? null)
        ? $record['localeStatus']
        : ['en' => 'approved'];
    update_post_meta($postId, FH_PAGE_META_LOCALE_STATUS, wp_json_encode($localeStatus, JSON_UNESCAPED_UNICODE));
    $mediaId = absint($record['mediaId'] ?? 0);
    if ($mediaId > 0 && wp_attachment_is_image($mediaId)) update_post_meta($postId, FH_PAGE_META_MEDIA, $mediaId);
}

if ($failures) update_option(FH_PAGE_OPTION_AUTHORITATIVE, $original);
else update_option(FH_PAGE_OPTION_AUTHORITATIVE, '1');

echo wp_json_encode([
    'ok' => !$failures,
    'created' => $created,
    'updated' => $updated,
    'authoritative' => get_option(FH_PAGE_OPTION_AUTHORITATIVE, '0') === '1',
    'failures' => $failures,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n";
exit($failures ? 1 : 0);
