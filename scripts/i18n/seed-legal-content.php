<?php
/**
 * Seed the five legal documents onto native WordPress pages (run via wp-cli
 * `wp eval-file`).
 *
 * Purpose-built for the legal migration, NOT a reuse of
 * `seed-locale-content.php`. That script was written for the zh translation
 * flow: it merges ONE non-English locale into `content_by_locale` and never
 * touches the English master. Legal needs the opposite — the English master
 * (`fh_content_json`) is the record that `normalizeWordpressPage` serves for
 * locale `en`, and it has to be written explicitly or `en` stays stale.
 *
 * Writes, for one page:
 *   fh_page_key               = legal-<slug>
 *   fh_publication_status     = approved
 *   fh_content_json           = <LegalDocument JSON>          (English master)
 *   fh_content_by_locale_json = {"en": <same LegalDocument>}  (per-locale map)
 *   fh_locale_status_json     = {"en": "approved"}
 *
 * Deliberately does NOT call wp_update_post / save_post. That hook only
 * persists form-submitted fields and would wipe the sibling meta.
 *
 * Usage:
 *   wp eval-file seed-legal-content.php
 *
 * Environment:
 *   SEED_SLUG  one of warranty|returns|shipping|terms|privacy
 *   SEED_FILE  path to a JSON file shaped {"warranty": {...}, "returns": {...}}
 *              as dumped from `legalDocuments`
 */

$slug = (string) getenv('SEED_SLUG');
$file = (string) getenv('SEED_FILE');

if ($slug === '' || $file === '') {
    fwrite(STDERR, "SEED_SLUG / SEED_FILE are required\n");
    exit(1);
}

$raw = file_get_contents($file);
if ($raw === false) {
    fwrite(STDERR, "cannot read SEED_FILE: {$file}\n");
    exit(1);
}

$all = json_decode($raw, true);
if (!is_array($all) || !isset($all[$slug]) || !is_array($all[$slug])) {
    fwrite(STDERR, "SEED_FILE has no document for slug '{$slug}': " . json_last_error_msg() . "\n");
    exit(1);
}

$document = $all[$slug];
$pageKey = 'legal-' . $slug;

// ── Guard the shape before persisting anything ─────────────────────────────
foreach (['slug', 'title', 'eyebrow', 'summary', 'intro', 'governingNote'] as $field) {
    if (!isset($document[$field]) || !is_string($document[$field]) || trim($document[$field]) === '') {
        fwrite(STDERR, "document '{$slug}' is missing non-empty string field: {$field}\n");
        exit(1);
    }
}
if (!isset($document['sections']) || !is_array($document['sections']) || $document['sections'] === []) {
    fwrite(STDERR, "document '{$slug}' has no sections\n");
    exit(1);
}
if ($document['slug'] !== $slug) {
    fwrite(STDERR, "document slug mismatch: file says '{$document['slug']}', asked for '{$slug}'\n");
    exit(1);
}

// ── Find or create the page ────────────────────────────────────────────────
$existing = get_posts([
    'post_type' => 'page',
    'post_status' => 'any',
    'posts_per_page' => 1,
    'meta_key' => 'fh_page_key',
    'meta_value' => $pageKey,
]);

if ($existing) {
    $postId = (int) $existing[0]->ID;
} else {
    $postId = (int) wp_insert_post([
        'post_type' => 'page',
        'post_status' => 'publish',
        'post_title' => $document['title'],
        'post_name' => $pageKey,
        'post_content' => '',
    ], true);
    if (is_wp_error($postId) || $postId <= 0) {
        fwrite(STDERR, "wp_insert_post failed for {$pageKey}\n");
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

$json = wp_json_encode($document, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// ── English master: read by normalizeWordpressPage for locale `en` ─────────
update_post_meta($postId, 'fh_page_key', $pageKey);
update_post_meta($postId, 'fh_publication_status', 'approved');
update_post_meta($postId, 'fh_content_json', $json);

// ── Per-locale map: read for every other locale. Preserve siblings. ────────
$storedMap = get_post_meta($postId, 'fh_content_by_locale_json', true);
$contentMap = json_decode((string) $storedMap, true);
if (!is_array($contentMap)) {
    $contentMap = [];
}
$contentMap['en'] = $document;
update_post_meta($postId, 'fh_content_by_locale_json', wp_json_encode($contentMap, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

$storedStatus = get_post_meta($postId, 'fh_locale_status_json', true);
$statusMap = json_decode((string) $storedStatus, true);
if (!is_array($statusMap)) {
    $statusMap = [];
}
$statusMap['en'] = 'approved';
update_post_meta($postId, 'fh_locale_status_json', wp_json_encode($statusMap, JSON_UNESCAPED_UNICODE));

// ── Read back and prove all five landed ────────────────────────────────────
$readKey     = (string) get_post_meta($postId, 'fh_page_key', true);
$readStatus  = (string) get_post_meta($postId, 'fh_publication_status', true);
$readMaster  = json_decode((string) get_post_meta($postId, 'fh_content_json', true), true);
$readMap     = json_decode((string) get_post_meta($postId, 'fh_content_by_locale_json', true), true);
$readLocale  = json_decode((string) get_post_meta($postId, 'fh_locale_status_json', true), true);

WP_CLI::log(sprintf(
    'post=%d key=%s publication=%s | by_locale keys=[%s] | locale_status=%s | master sections=%d',
    $postId,
    $readKey,
    $readStatus,
    implode(',', array_keys((array) $readMap)),
    wp_json_encode($readLocale, JSON_UNESCAPED_UNICODE),
    is_array($readMaster['sections'] ?? null) ? count($readMaster['sections']) : -1
));

$ok = $readKey === $pageKey
    && $readStatus === 'approved'
    && is_array($readMaster)
    && ($readMaster['slug'] ?? null) === $slug
    && ($readMaster['title'] ?? null) === $document['title']
    && ($readMaster['sections'] ?? null) === $document['sections']
    && ($readMap['en'] ?? null) === $document
    && ($readLocale['en'] ?? null) === 'approved';

WP_CLI::log($ok ? 'VERIFY OK' : 'VERIFY FAILED');
exit($ok ? 0 : 1);
