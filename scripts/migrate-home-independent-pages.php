<?php
/**
 * 将旧 home 聚合 Page 拆成逐语言独立 Page。
 *
 * 默认 dry-run；只有传入 write 才写入。en 从旧记录迁移为 approved；zh 使用
 * 审核参考卡片时保持 draft；es / th 读取审核资料草稿并保持 draft，缺文件时跳过，
 * 不会伪造翻译。写入前必须在数据库容器生成 SQL 备份；脚本验证备份在
 * 持久挂载目录中、非空且不超过一小时。回滚：`wp db import <backup.sql>`，然后将 fh_pages_authoritative
 * 恢复为写入前值（本脚本不修改该开关）。
 *
 * 用法（容器内）：
 *   wp eval-file scripts/migrate-home-independent-pages.php
 *   wp eval-file scripts/migrate-home-independent-pages.php write backup=/backup/fh-home-independent-before.sql
 *
 * write 必须显式提供持久挂载路径，例如 backup=/backup/fh-home-independent-before.sql；
 * 不接受容器临时目录，避免 CLI 容器退出后备份丢失。
 */

if (!defined('ABSPATH')) {
    require '/var/www/html/wp-load.php';
}

$scriptArgs = isset($args) && is_array($args) ? $args : [];
$write = in_array('write', $scriptArgs, true);
$backupPath = null;
foreach ($scriptArgs as $arg) {
    if (str_starts_with((string) $arg, 'backup=')) $backupPath = substr((string) $arg, 7);
}

if ($write && !class_exists('WP_CLI')) {
    fwrite(STDERR, "write 必须通过 wp eval-file 执行，以便先做数据库备份。\n");
    exit(1);
}
if ($write && ($backupPath === null || !str_starts_with($backupPath, '/backup/'))) {
    fwrite(STDERR, "write 必须提供 /backup/ 下的持久备份路径，例如 backup=/backup/fh-home-independent-before.sql。\n");
    exit(1);
}

$source = get_posts([
    'post_type' => 'page', 'post_status' => ['publish', 'draft', 'pending', 'private'],
    'posts_per_page' => 1, 'meta_query' => [
        ['key' => FH_PAGE_META_KEY, 'value' => 'home'],
        ['relation' => 'OR', ['key' => FH_PAGE_META_LOCALE, 'compare' => 'NOT EXISTS'], ['key' => FH_PAGE_META_LOCALE, 'value' => '', 'compare' => '=']],
    ],
]);
$sourcePost = $source[0] ?? null;
if (!$sourcePost instanceof WP_Post) {
    fwrite(STDERR, "找不到 page_key=home 的旧聚合 Page。\n");
    exit(1);
}

$baseContent = json_decode((string) get_post_meta($sourcePost->ID, FH_PAGE_META_CONTENT, true), true);
$localeContent = json_decode((string) get_post_meta($sourcePost->ID, FH_PAGE_META_CONTENT_BY_LOCALE, true), true);
$localeContent = is_array($localeContent) ? $localeContent : [];
$localeStatus = json_decode((string) get_post_meta($sourcePost->ID, FH_PAGE_META_LOCALE_STATUS, true), true);
$localeStatus = is_array($localeStatus) ? $localeStatus : [];
$seoByLocale = json_decode((string) get_post_meta($sourcePost->ID, FH_PAGE_META_SEO_BY_LOCALE, true), true);
$seoByLocale = is_array($seoByLocale) ? $seoByLocale : [];
$draftDir = (string) (getenv('FH_HOME_DRAFT_DIR') ?: '/tmp/fh-homepage-locale-drafts');

function fh_migrate_home_modules(mixed $content, string $locale): ?array
{
    if (!is_array($content)) return null;
    $mapping = ['H01' => ['hero', 'hero'], 'H02' => ['product-line-grid', 'productLines'], 'H03' => ['capabilities', 'capabilities'], 'H04' => ['process', 'delivery'], 'H05' => ['call-to-action', 'closing']];
    $modules = [];
    foreach ($mapping as $id => [$type, $key]) {
        if (!isset($content[$key]) || !is_array($content[$key])) return null;
        $data = $content[$key];
        if ($id === 'H02' && $locale === 'en') {
            // 来源：src/content/product-lines.ts。image/href 是批准产品线事实，运营字段不覆盖。
            $data['items'] = [
                ['slug' => 'wheels', 'name' => 'Wheels', 'subtitle' => 'Recorded models · Flow formed · Custom forged', 'summary' => 'Browse approved wheel specifications, review recorded flow-formed routes, or start a custom forged wheel program.', 'highlights' => [], 'hasRender' => true, 'image' => '/images/cards/card-wheels.webp', 'href' => '/products/wheels'],
                ['slug' => 'ev-components', 'name' => 'EV Aluminum Housings', 'subtitle' => 'Motor · Controller · Inverter', 'summary' => 'Engineering assessment for water-cooled motor, die-cast motor and controller or inverter housing projects.', 'highlights' => [], 'hasRender' => true, 'image' => '/images/cards/card-ev.webp', 'href' => '/products/ev-components'],
                ['slug' => 'custom-aluminum', 'name' => 'Custom Aluminum Development', 'subtitle' => '2D drawing · 3D data · Physical sample', 'summary' => 'Start a drawing- or sample-led assessment for an aluminum component outside the defined wheel and EV housing categories.', 'highlights' => [], 'hasRender' => true, 'image' => '/images/cards/card-aluminum.webp', 'href' => '/products/custom-aluminum'],
                ['slug' => 'safety-tires', 'name' => 'Self-Sealing Tires', 'subtitle' => 'Technology · Testing · Supply review', 'summary' => 'Review the self-sealing concept, documented test conditions and the information needed to discuss an applicable tire program.', 'highlights' => [], 'hasRender' => true, 'image' => '/images/cards/card-tires.webp', 'href' => '/products/safety-tires'],
            ];
        }
        $modules[] = ['id' => $id, 'type' => $type, 'order' => count($modules) * 10 + 10, 'enabled' => true, 'data' => $data];
    }
    return ['schemaVersion' => 1, 'pageKey' => 'home', 'locale' => '', 'modules' => $modules];
}

$sourceApproved = get_post_meta($sourcePost->ID, FH_PAGE_META_STATUS, true) === 'approved' && $sourcePost->post_status === 'publish';
$candidates = [];
if ($sourceApproved) $candidates['en'] = ['content' => $baseContent, 'seo' => ['title' => get_post_meta($sourcePost->ID, FH_PAGE_META_SEO_TITLE, true), 'description' => get_post_meta($sourcePost->ID, FH_PAGE_META_SEO_DESCRIPTION, true)], 'publication' => 'approved', 'source' => 'legacy-home-en'];
foreach (['zh'] as $locale) {
    if ($sourceApproved && ($localeStatus[$locale] ?? '') === 'approved' && isset($localeContent[$locale])) $candidates[$locale] = ['content' => $localeContent[$locale], 'seo' => $seoByLocale[$locale] ?? [], 'publication' => 'approved', 'source' => 'legacy-home-zh'];
}

// 语言草稿由审核资料显式提供；缺文件时不创建记录。
foreach (['es', 'th'] as $locale) {
    $path = $draftDir . '/' . $locale . '.json';
    if (!is_file($path)) continue;
    $draft = json_decode((string) file_get_contents($path), true);
    if (is_array($draft['content'] ?? null)) $candidates[$locale] = ['content' => $draft['content'], 'seo' => $draft['seo'] ?? [], 'publication' => 'draft', 'source' => 'review-draft-' . $locale];
}
$zhCardsPath = $draftDir . '/zh-h02-card-mapping.json';
if (is_file($zhCardsPath) && is_array($localeContent['zh'] ?? null)) {
    $zhCards = json_decode((string) file_get_contents($zhCardsPath), true);
    if (is_array($zhCards['items'] ?? null) && count($zhCards['items']) === 4) {
        $zhContent = $localeContent['zh'];
        $zhContent['productLines']['items'] = $zhCards['items'];
        $candidates['zh'] = ['content' => $zhContent, 'seo' => $seoByLocale['zh'] ?? [], 'publication' => 'draft', 'source' => 'review-reference-zh-h02'];
    }
}

if ($write) {
    if (!is_file($backupPath) || filesize($backupPath) <= 0 || filemtime($backupPath) < time() - 3600) {
        fwrite(STDERR, "缺少一小时内生成的持久 SQL 备份，停止写入：{$backupPath}\n");
        exit(1);
    }
    echo "✅ 已核对持久数据库备份：{$backupPath}\n";
}

$created = 0;
$eligible = [];
$wouldCreate = 0;
$skipped = [];
foreach ($candidates as $locale => $candidate) {
    $content = fh_migrate_home_modules($candidate['content'], $locale);
    if ($content === null) {
        $skipped[] = $locale . ': 内容不是完整的 H01-H05 结构';
        continue;
    }
    $content['locale'] = $locale;
    if (!fh_pages_home_content_ready($content, (string) ($candidate['seo']['title'] ?? ''), (string) ($candidate['seo']['description'] ?? ''))) {
        $skipped[] = $locale . ': 内容、SEO 或媒体未通过公开门槛';
        continue;
    }
    $eligible[] = ['locale' => $locale, 'source' => $candidate['source'] ?? 'unknown', 'publication' => $candidate['publication'] ?? 'draft'];
    $existing = get_posts([
        'post_type' => 'page', 'post_status' => 'any', 'posts_per_page' => 1, 'fields' => 'ids',
        'meta_query' => [['key' => FH_PAGE_META_KEY, 'value' => 'home'], ['key' => FH_PAGE_META_LOCALE, 'value' => $locale]],
    ]);
    if ($existing) {
        $skipped[] = $locale . ': 已存在 Page ' . (int) $existing[0] . '，保持现有编辑内容';
        continue;
    }
    if (!$write) {
        echo "DRY-RUN 将创建 {$locale} 独立 Page（不写入）\n";
        $wouldCreate++;
        continue;
    }
    $publication = ($candidate['publication'] ?? 'draft') === 'approved' ? 'approved' : 'draft';
    $postId = wp_insert_post(['post_type' => 'page', 'post_title' => 'Fenghuai Home [' . strtoupper($locale) . ']', 'post_name' => 'home-' . $locale, 'post_status' => $publication === 'approved' ? 'publish' : 'draft', 'post_content' => ''], true);
    if (is_wp_error($postId)) {
        $skipped[] = $locale . ': ' . $postId->get_error_message();
        continue;
    }
    update_post_meta($postId, FH_PAGE_META_KEY, 'home');
    update_post_meta($postId, FH_PAGE_META_LOCALE, $locale);
    update_post_meta($postId, FH_PAGE_META_TRANSLATION_GROUP, 'home');
    update_post_meta($postId, FH_PAGE_META_SCHEMA_VERSION, 1);
    update_post_meta($postId, FH_PAGE_META_STATUS, $publication);
    update_post_meta($postId, FH_PAGE_META_CONTENT, wp_json_encode($content, JSON_UNESCAPED_UNICODE));
    update_post_meta($postId, FH_PAGE_META_SEO_TITLE, sanitize_text_field((string) ($candidate['seo']['title'] ?? '')));
    update_post_meta($postId, FH_PAGE_META_SEO_DESCRIPTION, sanitize_textarea_field((string) ($candidate['seo']['description'] ?? '')));
    $created++;
    echo "✅ 已创建 {$locale} 独立 Page：{$postId}\n";
}

echo wp_json_encode(['dry_run' => !$write, 'source_page' => $sourcePost->ID, 'eligible' => $eligible, 'would_create' => $write ? null : $wouldCreate, 'created' => $created, 'skipped' => $skipped, 'rollback' => $write ? 'wp db import ' . $backupPath : '仅预演，无需回滚'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n";
