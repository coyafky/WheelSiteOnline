<?php
/**
 * One-off migration: reshape the `product-lines` page content into a wrapper.
 *
 * The page used to store a bare 4-element array of product lines, while the
 * catalogue body (~86% of `/products`) was read from local TypeScript constants
 * — so `/zh/products` rendered a half-translated page. The content is now
 * `{ lines, catalogue }` and BOTH locales carry the wrapper.
 *
 * ⚠️ Writes the meta directly. `wp_update_post` / `save_post` would run the
 * `fenghuai-pages` save hook, which persists only form-submitted fields and
 * would wipe the rest of the page meta. `update_post_meta` on an already-loaded
 * post does not trigger `save_post`.
 *
 * Usage (both locales seeded in one run):
 *   wp eval-file seed-product-lines-content.php
 *
 * Environment:
 *   SEED_POST_ID   target page post ID (default 1314)
 *   SEED_EN_FILE   path to the English wrapper JSON
 */

$postId = (int) (getenv('SEED_POST_ID') ?: 1314);
$enFile = (string) getenv('SEED_EN_FILE');

if ($enFile === '') {
    fwrite(STDERR, "SEED_EN_FILE is required\n");
    exit(1);
}

$en = json_decode((string) file_get_contents($enFile), true);
if (!is_array($en) || !isset($en['lines'], $en['catalogue'])) {
    fwrite(STDERR, "SEED_EN_FILE is not a { lines, catalogue } wrapper\n");
    exit(1);
}

$post = get_post($postId);
if (!$post || $post->post_type !== 'page') {
    fwrite(STDERR, "post {$postId} is not a page\n");
    exit(1);
}

// ── Pull the already-generated zh wrapper out of the live meta ──────────────
// The zh side is produced by `make-locale-content.py` from the en wrapper, so
// this script only has to place it. Reading it back here keeps a single source
// of truth for the translated copy.
$zhFile = (string) (getenv('SEED_ZH_FILE') ?: '');
$zh = null;
if ($zhFile !== '') {
    $zh = json_decode((string) file_get_contents($zhFile), true);
    if (!is_array($zh) || !isset($zh['lines'], $zh['catalogue'])) {
        fwrite(STDERR, "SEED_ZH_FILE is not a { lines, catalogue } wrapper\n");
        exit(1);
    }
}

$storedContent = get_post_meta($postId, 'fh_content_by_locale_json', true);
$contentMap = json_decode((string) $storedContent, true);
if (!is_array($contentMap)) {
    $contentMap = [];
}

$contentMap['en'] = $en;
if ($zh !== null) {
    $contentMap['zh'] = $zh;
}

update_post_meta($postId, 'fh_content_by_locale_json', wp_json_encode($contentMap, JSON_UNESCAPED_UNICODE));

// ⚠️ `fh_content_json` is the English MASTER ('英文正本'), stored apart from
// `content_by_locale`. `normalizeWordpressPage` reads THAT field for locale
// `en` (not `content_by_locale.en`), so a wrapper written only to the map
// leaves `/products` serving the old bare array and falling back to the local
// snapshot. Both must move together.
update_post_meta($postId, 'fh_content_json', wp_json_encode($en, JSON_UNESCAPED_UNICODE));

$storedStatus = get_post_meta($postId, 'fh_locale_status_json', true);
$statusMap = json_decode((string) $storedStatus, true);
if (!is_array($statusMap)) {
    $statusMap = [];
}
foreach (array_keys($contentMap) as $locale) {
    $statusMap[$locale] = 'approved';
}
update_post_meta($postId, 'fh_locale_status_json', wp_json_encode($statusMap, JSON_UNESCAPED_UNICODE));

// ── Read back from a fresh get_post so no in-process object cache masks it ──
wp_cache_delete($postId, 'post_meta');
$readContent = json_decode((string) get_post_meta($postId, 'fh_content_by_locale_json', true), true);
$readStatus  = json_decode((string) get_post_meta($postId, 'fh_locale_status_json', true), true);
$readMaster  = json_decode((string) get_post_meta($postId, 'fh_content_json', true), true);

WP_CLI::log(sprintf(
    'post=%d | content_by_locale keys=[%s] | locale_status=%s | master(en) wrapper=%s',
    $postId,
    implode(',', array_keys((array) $readContent)),
    wp_json_encode($readStatus, JSON_UNESCAPED_UNICODE),
    (is_array($readMaster) && isset($readMaster['lines'], $readMaster['catalogue'])) ? 'yes' : 'NO'
));

$ok = is_array($readMaster) && isset($readMaster['lines'], $readMaster['catalogue']);
foreach (array_keys((array) $readContent) as $locale) {
    $entry = $readContent[$locale] ?? null;
    $hasWrapper = is_array($entry)
        && isset($entry['lines'], $entry['catalogue'])
        && is_array($entry['lines']) && count($entry['lines']) === 4
        && is_array($entry['catalogue']);
    WP_CLI::log(sprintf(
        '  %s: wrapper=%s lines=%d catalogue_keys=[%s]',
        $locale,
        $hasWrapper ? 'yes' : 'NO',
        is_array($entry['lines'] ?? null) ? count($entry['lines']) : 0,
        is_array($entry['catalogue'] ?? null) ? implode(',', array_keys($entry['catalogue'])) : ''
    ));
    if (!$hasWrapper) {
        $ok = false;
    }
}

WP_CLI::log($ok ? 'VERIFY OK: both locales carry the { lines, catalogue } wrapper' : 'VERIFY FAILED');
exit($ok ? 0 : 1);
