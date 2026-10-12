<?php
/**
 * Seed the two wheel-process page bodies onto native WordPress pages (run via
 * wp-cli `wp eval-file`).
 *
 * Covers `/products/wheels/flow-formed` and `/products/wheels/forged`. Both
 * routes already had a media-only adapter; this seeds the *content* half so the
 * body copy can later be localized. No translation is written here — only the
 * English master and its `en` entry in the per-locale map, exactly like
 * `seed-legal-content.php`.
 *
 * Writes, for one page:
 *   fh_page_key               = flow-formed | forged-wheel
 *   fh_publication_status     = approved
 *   fh_content_json           = <page body JSON>          (English master)
 *   fh_content_by_locale_json = {"en": <same page body>}  (per-locale map)
 *   fh_locale_status_json     = {"en": "approved"}
 *
 * `fh_content_json` and `fh_content_by_locale_json` are SEPARATE metas:
 * `normalizeWordpressPage` reads the former for locale `en` and the latter for
 * every other locale, so writing only one leaves `en` stale.
 *
 * Deliberately does NOT call wp_update_post / save_post. That hook only
 * persists form-submitted fields and would wipe the sibling meta. The page is
 * created once with `publish` and thereafter only meta is touched.
 *
 * Usage:
 *   SEED_KEY=flow-formed SEED_FILE=/tmp/wheel-process-content.json \
 *     wp eval-file seed-wheel-process-content.php
 *
 * Environment:
 *   SEED_KEY   one of flow-formed | forged-wheel
 *   SEED_FILE  path to a JSON file shaped {"flow-formed": {...}, "forged-wheel": {...}}
 *              as dumped by `scripts/i18n/dump-wheel-process-content.mts`
 */

$key = (string) getenv('SEED_KEY');
$file = (string) getenv('SEED_FILE');

if ($key === '' || $file === '') {
    fwrite(STDERR, "SEED_KEY / SEED_FILE are required\n");
    exit(1);
}

$raw = file_get_contents($file);
if ($raw === false) {
    fwrite(STDERR, "cannot read SEED_FILE: {$file}\n");
    exit(1);
}

$all = json_decode($raw, true);
if (!is_array($all) || !isset($all[$key]) || !is_array($all[$key])) {
    fwrite(STDERR, "SEED_FILE has no page for key '{$key}': " . json_last_error_msg() . "\n");
    exit(1);
}

$body = $all[$key];

// ── Guard the shape before persisting anything ─────────────────────────────
//
// Only the fields the page actually renders are required. The two control
// fields (`seo`, `publicationGate`) and the forged route identity (`slug`,
// `publicationStatus`) must NOT be here: they are read from the local module by
// `src/app/sitemap.ts` / `generateMetadata` / the section renderer, and a
// second copy inside the body blob is how they would silently diverge.
// ⚠️ `flow-formed`'s body keeps `slug` (a plain route-identity string).
// `forged-wheel`'s does not: its `slug` sits next to the section-level
// `publicationStatus` the components read, and both stay owned by the local
// module.
$requiredObjects = [
    'flow-formed' => ['hero', 'processDefinition', 'manufacturingRoute', 'catalogue', 'inquiry'],
    'forged-wheel' => ['hero', 'materialReview', 'forgingRoute', 'completion', 'inquiryInputs'],
];

if (!isset($requiredObjects[$key])) {
    fwrite(STDERR, "unknown page key '{$key}'\n");
    exit(1);
}
foreach ($requiredObjects[$key] as $field) {
    if (!isset($body[$field]) || !is_array($body[$field])) {
        fwrite(STDERR, "page '{$key}' is missing object field: {$field}\n");
        exit(1);
    }
}
if ($key === 'flow-formed' && ($body['slug'] ?? null) !== 'flow-formed') {
    fwrite(STDERR, "page 'flow-formed' slug mismatch: '" . ($body['slug'] ?? 'null') . "'\n");
    exit(1);
}
foreach (['seo', 'publicationGate'] as $forbidden) {
    if (array_key_exists($forbidden, $body)) {
        fwrite(STDERR, "page '{$key}' must not carry '{$forbidden}' in the WP body\n");
        exit(1);
    }
}

// ── Find or create the page ────────────────────────────────────────────────
$existing = get_posts([
    'post_type' => 'page',
    'post_status' => 'any',
    'posts_per_page' => 1,
    'meta_key' => 'fh_page_key',
    'meta_value' => $key,
]);

if ($existing) {
    $postId = (int) $existing[0]->ID;
} else {
    $postId = (int) wp_insert_post([
        'post_type' => 'page',
        'post_status' => 'publish',
        'post_title' => $key,
        'post_name' => $key,
        'post_content' => '',
    ], true);
    if (is_wp_error($postId) || $postId <= 0) {
        fwrite(STDERR, "wp_insert_post failed for {$key}\n");
        exit(1);
    }
}

$post = get_post($postId);
if (!$post || $post->post_type !== 'page') {
    fwrite(STDERR, "post {$postId} is not a page\n");
    exit(1);
}
// `publish` is set through a direct field update, not wp_update_post.
if ($post->post_status !== 'publish') {
    wp_update_post(['ID' => $postId, 'post_status' => 'publish']);
}

$json = wp_json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// ── English master: read by normalizeWordpressPage for locale `en` ─────────
update_post_meta($postId, 'fh_page_key', $key);
update_post_meta($postId, 'fh_publication_status', 'approved');
update_post_meta($postId, 'fh_content_json', $json);

// ── Per-locale map: read for every other locale. Preserve siblings. ────────
$storedMap = get_post_meta($postId, 'fh_content_by_locale_json', true);
$contentMap = json_decode((string) $storedMap, true);
if (!is_array($contentMap)) {
    $contentMap = [];
}
$contentMap['en'] = $body;
update_post_meta($postId, 'fh_content_by_locale_json', wp_json_encode($contentMap, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

$storedStatus = get_post_meta($postId, 'fh_locale_status_json', true);
$statusMap = json_decode((string) $storedStatus, true);
if (!is_array($statusMap)) {
    $statusMap = [];
}
$statusMap['en'] = 'approved';
update_post_meta($postId, 'fh_locale_status_json', wp_json_encode($statusMap, JSON_UNESCAPED_UNICODE));

// ── Read back and prove every meta landed ─────────────────────────────────
$readKey    = (string) get_post_meta($postId, 'fh_page_key', true);
$readStatus = (string) get_post_meta($postId, 'fh_publication_status', true);
$readMaster = json_decode((string) get_post_meta($postId, 'fh_content_json', true), true);
$readMap    = json_decode((string) get_post_meta($postId, 'fh_content_by_locale_json', true), true);
$readLocale = json_decode((string) get_post_meta($postId, 'fh_locale_status_json', true), true);
$masterRaw  = (string) get_post_meta($postId, 'fh_content_json', true);

WP_CLI::log(sprintf(
    'post=%d key=%s publication=%s | master bytes=%d keys=[%s] | by_locale keys=[%s] | locale_status=%s',
    $postId,
    $readKey,
    $readStatus,
    strlen($masterRaw),
    implode(',', array_keys((array) $readMaster)),
    implode(',', array_keys((array) $readMap)),
    wp_json_encode($readLocale, JSON_UNESCAPED_UNICODE)
));

$ok = $readKey === $key
    && $readStatus === 'approved'
    && is_array($readMaster)
    && is_array($readMap)
    && ($readMap['en'] ?? null) === $body
    && ($readLocale['en'] ?? null) === 'approved'
    && $readMaster === $body
    && !array_key_exists('seo', (array) $readMaster)
    && !array_key_exists('publicationGate', (array) $readMaster);

WP_CLI::log($ok ? 'VERIFY OK' : 'VERIFY FAILED');
exit($ok ? 0 : 1);
