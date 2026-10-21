<?php
/**
 * Seed a page's localized content into WordPress (run through wp-cli eval-file).
 *
 * Reads the derived locale JSON for one page, merges it into the existing
 * `content_by_locale` map (never clobbering other locales), and flips
 * `locale_status[<locale>]` to approved so the public REST contract will
 * serve it.
 *
 * Usage:
 *   docker compose -f local-wp/docker-compose.yml run --rm \
 *     -v /tmp/home.zh.json:/seed.json:ro cli \
 *     wp eval-file /var/www/html/.../seed-locale-content.php
 *
 * Environment (set via --env when invoking docker compose run):
 *   SEED_POST_ID   target page post ID
 *   SEED_LOCALE    locale code, e.g. zh
 *   SEED_FILE      path to the derived content JSON inside the container
 *   SEED_SEO_TITLE optional seo title for this locale
 *   SEED_SEO_DESC  optional seo description for this locale
 */

$postId = (int) getenv('SEED_POST_ID');
$locale = (string) getenv('SEED_LOCALE');
$file   = (string) getenv('SEED_FILE');

if ($postId <= 0 || $locale === '' || $file === '') {
    fwrite(STDERR, "SEED_POST_ID / SEED_LOCALE / SEED_FILE are required\n");
    exit(1);
}

$raw = file_get_contents($file);
if ($raw === false) {
    fwrite(STDERR, "cannot read SEED_FILE: {$file}\n");
    exit(1);
}

$content = json_decode($raw, true);
if (!is_array($content)) {
    fwrite(STDERR, "SEED_FILE is not valid JSON: " . json_last_error_msg() . "\n");
    exit(1);
}

$post = get_post($postId);
if (!$post || $post->post_type !== 'page') {
    fwrite(STDERR, "post {$postId} is not a page\n");
    exit(1);
}

// ── Merge into content_by_locale (preserve every other locale) ──────────────
$storedContent = get_post_meta($postId, 'fh_content_by_locale_json', true);
$contentMap = json_decode((string) $storedContent, true);
if (!is_array($contentMap)) {
    $contentMap = [];
}
$contentMap[$locale] = $content;
update_post_meta($postId, 'fh_content_by_locale_json', wp_json_encode($contentMap, JSON_UNESCAPED_UNICODE));

// ── Merge locale_status and approve this locale ─────────────────────────────
$storedStatus = get_post_meta($postId, 'fh_locale_status_json', true);
$statusMap = json_decode((string) $storedStatus, true);
if (!is_array($statusMap)) {
    $statusMap = [];
}
$statusMap[$locale] = 'approved';
update_post_meta($postId, 'fh_locale_status_json', wp_json_encode($statusMap, JSON_UNESCAPED_UNICODE));

// ── Optional per-locale SEO ────────────────────────────────────────────────
$seoTitle = (string) getenv('SEED_SEO_TITLE');
$seoDesc  = (string) getenv('SEED_SEO_DESC');
if ($seoTitle !== '' || $seoDesc !== '') {
    $storedSeo = get_post_meta($postId, 'fh_seo_by_locale_json', true);
    $seoMap = json_decode((string) $storedSeo, true);
    if (!is_array($seoMap)) {
        $seoMap = [];
    }
    $entry = is_array($seoMap[$locale] ?? null) ? $seoMap[$locale] : [];
    if ($seoTitle !== '') {
        $entry['title'] = $seoTitle;
    }
    if ($seoDesc !== '') {
        $entry['description'] = $seoDesc;
    }
    $seoMap[$locale] = $entry;
    update_post_meta($postId, 'fh_seo_by_locale_json', wp_json_encode($seoMap, JSON_UNESCAPED_UNICODE));
}

// ── Read back and prove it landed ──────────────────────────────────────────
$readBackContent = json_decode((string) get_post_meta($postId, 'fh_content_by_locale_json', true), true);
$readBackStatus  = json_decode((string) get_post_meta($postId, 'fh_locale_status_json', true), true);

WP_CLI::log(sprintf(
    'post=%d locale=%s | content_by_locale keys=[%s] | locale_status=%s',
    $postId,
    $locale,
    implode(',', array_keys((array) $readBackContent)),
    wp_json_encode($readBackStatus, JSON_UNESCAPED_UNICODE)
));

/**
 * Pick any human-readable string out of the seeded content, so this check works
 * for pages shaped as an object (`hero.heading`) AND as a list (product lines).
 * Returns '' when nothing prose-like is found.
 */
$sample = '';
$findSample = static function ($value) use (&$findSample): string {
    if (is_string($value) && $value !== '' && !is_numeric($value)
        && strpos($value, '/') !== 0 && strpos($value, 'http') !== 0
        && strpos($value, 'WP ') !== 0) {
        return $value;
    }
    if (is_array($value)) {
        foreach ($value as $child) {
            $found = $findSample($child);
            if ($found !== '') {
                return $found;
            }
        }
    }
    return '';
};
$sample = $findSample($readBackContent[$locale] ?? null);

$ok = $sample !== '' && ($readBackStatus[$locale] ?? null) === 'approved';

WP_CLI::log($ok
    ? 'VERIFY OK: sample string = ' . $sample
    : 'VERIFY FAILED');

exit($ok ? 0 : 1);
