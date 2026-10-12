<?php
/** 将旧 fh_guide 审核文章复制为 WordPress 原生 post；失败时不打开原生权威开关。 */

require '/var/www/html/wp-load.php';
$originalNative = get_option(FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE, '0');
$created = 0;
$updated = 0;
$failures = [];
$legacy = get_posts([
    'post_type' => FH_GUIDE_POST_TYPE,
    'post_status' => ['publish', 'draft', 'pending', 'private'],
    'posts_per_page' => 100,
]);

foreach ($legacy as $source) {
    $slug = sanitize_title($source->post_name);
    $existing = get_page_by_path($slug, OBJECT, FH_GUIDE_NATIVE_POST_TYPE);
    $postId = wp_insert_post([
        'ID' => $existing?->ID ?? 0,
        'post_type' => FH_GUIDE_NATIVE_POST_TYPE,
        'post_title' => $source->post_title,
        'post_name' => $slug,
        'post_status' => $source->post_status,
        'post_excerpt' => $source->post_excerpt,
        'post_content' => $source->post_content,
        'post_date' => $source->post_date,
    ], true);
    if (is_wp_error($postId)) {
        $failures[] = $slug . '：' . $postId->get_error_message();
        continue;
    }
    $existing ? $updated++ : $created++;
    foreach (array_keys(fh_guide_fields()) as $key) {
        $value = get_post_meta($source->ID, 'fh_' . $key, true);
        update_post_meta($postId, 'fh_' . $key, is_string($value) ? $value : (string) $value);
    }
    update_post_meta($postId, 'fh_featured_media_id', absint(get_post_meta($source->ID, 'fh_featured_media_id', true)));
}

if ($failures) update_option(FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE, $originalNative);
else update_option(FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE, '1');

echo wp_json_encode([
    'ok' => !$failures,
    'source_count' => count($legacy),
    'created' => $created,
    'updated' => $updated,
    'native_authoritative' => get_option(FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE, '0') === '1',
    'failures' => $failures,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n";
exit($failures ? 1 : 0);
