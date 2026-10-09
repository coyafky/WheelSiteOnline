<?php
/**
 * 一次性把现有 wheel_model 的事实快照迁入运营可编辑字段，并把批准图片导入媒体库。
 *
 * 容器内运行：
 *   php /tmp/migrate-wheel-authoring.php /tmp/fh-wheel-media
 *
 * 幂等：图片用 `_fh_wheel_source_file` 去重，型号用既有 post ID 更新。只有全部成功才
 * 打开 `fh_wheels_authoritative`；任何失败都保持原开关不变。
 */

require '/var/www/html/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$sourceDir = rtrim($argv[1] ?? '/tmp/fh-wheel-media', '/');
$originalAuthoritative = get_option(FH_WHEEL_OPTION_AUTHORITATIVE, '0');
$failures = [];
$uploaded = 0;
$reused = 0;
$updated = 0;

/** @return int|WP_Error */
function fh_migration_import_wheel_image(string $sourceDir, string $filename, string $model)
{
    global $uploaded, $reused;
    $existing = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_key' => '_fh_wheel_source_file',
        'meta_value' => $filename,
    ]);
    if ($existing) {
        $reused++;
        return (int) $existing[0];
    }

    $path = $sourceDir . '/' . basename($filename);
    if (!is_file($path)) return new WP_Error('missing_source', '找不到图片 ' . $filename);
    $bits = wp_upload_bits(basename($filename), null, file_get_contents($path));
    if (!empty($bits['error'])) return new WP_Error('upload_failed', (string) $bits['error']);
    $filetype = wp_check_filetype($bits['file']);
    $attachmentId = wp_insert_attachment([
        'post_mime_type' => $filetype['type'] ?: 'image/webp',
        'post_title' => $model . ' wheel product image',
        'post_excerpt' => 'Approved product image for model ' . $model . '.',
        'post_status' => 'inherit',
    ], $bits['file']);
    if (is_wp_error($attachmentId)) return $attachmentId;
    wp_update_attachment_metadata($attachmentId, wp_generate_attachment_metadata($attachmentId, $bits['file']));
    update_post_meta($attachmentId, '_wp_attachment_image_alt', $model . ' wheel product view');
    update_post_meta($attachmentId, '_fh_wheel_source_file', $filename);
    $uploaded++;
    return (int) $attachmentId;
}

$posts = get_posts([
    'post_type' => FH_WHEEL_POST_TYPE,
    'post_status' => ['publish', 'draft', 'pending', 'private'],
    'posts_per_page' => -1,
    'orderby' => 'ID',
    'order' => 'ASC',
]);

foreach ($posts as $post) {
    $model = trim(get_the_title($post));
    $sourceVariants = json_decode((string) get_post_meta($post->ID, 'fact_variants_json', true), true);
    $approvedKeys = array_flip(array_filter(array_map('trim', explode(',', (string) get_post_meta($post->ID, 'approved_variant_keys', true)))));
    if (!is_array($sourceVariants) || !$sourceVariants) {
        $failures[] = $model . '：没有事实规格';
        continue;
    }
    $variants = [];
    foreach ($sourceVariants as $source) {
        $size = (string) ($source['size'] ?? '');
        if (!preg_match('/^(\d+(?:\.\d+)?)\s*[x*×]\s*(\d+(?:\.\d+)?)$/i', $size, $match)) {
            $failures[] = $model . '：无法解析尺寸 ' . $size;
            continue 2;
        }
        $code = trim((string) ($source['productionCode'] ?? ''));
        $variants[] = [
            'production_code' => $code,
            'diameter' => (float) $match[1],
            'width' => (float) $match[2],
            'pcd' => (string) ($source['pcd'] ?? ''),
            'offset' => is_numeric($source['offset'] ?? null) ? (float) $source['offset'] : null,
            'center_bore' => is_numeric($source['centerBore'] ?? null) ? (float) $source['centerBore'] : null,
            'finish' => (string) ($source['finish'] ?? ''),
            'approved' => isset($approvedKeys[$code]),
        ];
    }

    $filenames = array_values(array_filter(array_map('trim', explode(',', (string) get_post_meta($post->ID, 'fact_images', true)))));
    if (!$filenames) {
        $failures[] = $model . '：没有事实图片';
        continue;
    }
    $mediaIds = [];
    foreach ($filenames as $filename) {
        $attachment = fh_migration_import_wheel_image($sourceDir, $filename, $model);
        if (is_wp_error($attachment)) {
            $failures[] = $model . '：' . $attachment->get_error_message();
            continue 2;
        }
        $mediaIds[] = $attachment;
    }
    update_post_meta($post->ID, 'variants_json', wp_json_encode($variants, JSON_UNESCAPED_UNICODE));
    update_post_meta($post->ID, 'gallery_media_ids', implode(',', array_values(array_unique($mediaIds))));
    update_post_meta($post->ID, 'hero_media_id', $mediaIds[0]);
    $updated++;
}

if ($failures) {
    update_option(FH_WHEEL_OPTION_AUTHORITATIVE, $originalAuthoritative);
} else {
    update_option(FH_WHEEL_OPTION_AUTHORITATIVE, '1');
}

$publicCount = 0;
foreach ($posts as $post) {
    if (fh_wheel_authoring_is_public($post->ID)) $publicCount++;
}

echo wp_json_encode([
    'ok' => !$failures,
    'posts' => count($posts),
    'updated' => $updated,
    'uploaded' => $uploaded,
    'reused' => $reused,
    'public' => $publicCount,
    'authoritative' => get_option(FH_WHEEL_OPTION_AUTHORITATIVE, '0') === '1',
    'failures' => array_slice($failures, 0, 20),
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n";

exit($failures ? 1 : 0);
