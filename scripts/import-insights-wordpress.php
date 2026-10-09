<?php
/** 在 WordPress 容器中幂等导入 Insights JSON；全部成功后才打开权威接管。 */

require '/var/www/html/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$jsonPath = $argv[1] ?? '/tmp/insights-wordpress-import.json';
$mediaDir = rtrim($argv[2] ?? '/tmp/fh-insights-media', '/');
$payload = json_decode((string) file_get_contents($jsonPath), true);
if (!is_array($payload['records'] ?? null)) {
    fwrite(STDERR, "导入包无效\n");
    exit(1);
}

$originalAuthoritative = get_option(FH_GUIDE_OPTION_AUTHORITATIVE, '0');
$created = 0;
$updated = 0;
$failures = [];

/** @return int|WP_Error */
function fh_import_insight_media(array $media, string $mediaDir)
{
    $source = (string) ($media['src'] ?? '');
    $suggestedId = absint($media['wordpressId'] ?? 0);
    if ($suggestedId > 0 && wp_attachment_is_image($suggestedId)) return $suggestedId;
    if ($source === '' || !str_starts_with($source, '/')) return new WP_Error('media_source', '文章图片不是本地可导入路径');
    $sourceKey = ltrim($source, '/');
    $existing = get_posts([
        'post_type' => 'attachment', 'post_status' => 'inherit', 'posts_per_page' => 1, 'fields' => 'ids',
        'meta_key' => '_fh_insight_source', 'meta_value' => $sourceKey,
    ]);
    if ($existing) return (int) $existing[0];
    $path = $mediaDir . '/' . basename($source);
    if (!is_file($path)) return new WP_Error('missing_media', '找不到文章图片 ' . $source);
    $bits = wp_upload_bits(basename($source), null, file_get_contents($path));
    if (!empty($bits['error'])) return new WP_Error('upload_failed', (string) $bits['error']);
    $filetype = wp_check_filetype($bits['file']);
    $id = wp_insert_attachment([
        'post_mime_type' => $filetype['type'] ?: 'image/webp',
        'post_title' => (string) ($media['alt'] ?? 'Insights article image'),
        'post_excerpt' => (string) ($media['caption'] ?? ''),
        'post_status' => 'inherit',
    ], $bits['file']);
    if (is_wp_error($id)) return $id;
    wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $bits['file']));
    update_post_meta($id, '_wp_attachment_image_alt', (string) ($media['alt'] ?? ''));
    update_post_meta($id, '_fh_insight_source', $sourceKey);
    return (int) $id;
}

foreach ($payload['records'] as $record) {
    $slug = sanitize_title((string) ($record['slug'] ?? ''));
    $existing = get_page_by_path($slug, OBJECT, FH_GUIDE_POST_TYPE);
    $postId = wp_insert_post([
        'ID' => $existing?->ID ?? 0,
        'post_type' => FH_GUIDE_POST_TYPE,
        'post_title' => sanitize_text_field((string) ($record['title'] ?? '')),
        'post_name' => $slug,
        'post_status' => 'publish',
        'post_excerpt' => sanitize_textarea_field((string) ($record['summary'] ?? '')),
    ], true);
    if (is_wp_error($postId)) {
        $failures[] = $slug . '：' . $postId->get_error_message();
        continue;
    }
    $existing ? $updated++ : $created++;
    foreach (['publication_status', 'summary', 'category', 'reading_time', 'answer', 'seo_title', 'seo_description'] as $key) {
        update_post_meta($postId, 'fh_' . $key, sanitize_textarea_field((string) ($record[$key] ?? '')));
    }
    update_post_meta($postId, 'fh_needs_verification', !empty($record['needs_verification']) ? '1' : '0');
    update_post_meta($postId, 'fh_detail_json', wp_json_encode($record['detail'] ?? [], JSON_UNESCAPED_UNICODE));
    update_post_meta($postId, 'fh_sections_json', wp_json_encode($record['sections'] ?? [], JSON_UNESCAPED_UNICODE));
    $mediaId = fh_import_insight_media((array) ($record['media'] ?? []), $mediaDir);
    if (is_wp_error($mediaId)) {
        $failures[] = $slug . '：' . $mediaId->get_error_message();
        continue;
    }
    update_post_meta($postId, 'fh_featured_media_id', $mediaId);
}

if ($failures) update_option(FH_GUIDE_OPTION_AUTHORITATIVE, $originalAuthoritative);
else update_option(FH_GUIDE_OPTION_AUTHORITATIVE, '1');

echo wp_json_encode([
    'ok' => !$failures,
    'created' => $created,
    'updated' => $updated,
    'authoritative' => get_option(FH_GUIDE_OPTION_AUTHORITATIVE, '0') === '1',
    'failures' => $failures,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n";
exit($failures ? 1 : 0);
