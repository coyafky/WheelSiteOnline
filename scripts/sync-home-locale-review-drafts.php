<?php
/**
 * 把三种语言的首页审校稿写入各自的本地 WordPress 草稿 Page。
 * 默认只预演；写入要求新鲜 SQL 备份和预演返回的状态指纹。
 *
 * wp eval-file /scripts/sync-home-locale-review-drafts.php
 * wp eval-file /scripts/sync-home-locale-review-drafts.php write backup=/backup/xxx.sql expected=xxx
 */

if (!defined('ABSPATH') || !class_exists('WP_CLI')) {
    fwrite(STDERR, "请通过 wp eval-file 在 WordPress CLI 中运行。\n");
    exit(1);
}

$input = isset($args) && is_array($args) ? $args : [];
$write = in_array('write', $input, true);
$options = [];
foreach ($input as $arg) {
    if (str_contains((string) $arg, '=')) {
        [$name, $value] = explode('=', (string) $arg, 2);
        $options[$name] = $value;
    }
}

$draftDirectory = (string) (getenv('FH_HOME_DRAFT_DIR') ?: '/drafts');
$ids = ['zh' => 1462, 'es' => 1463, 'th' => 1464];
$keys = ['H01' => ['hero', 'hero'], 'H02' => ['product-line-grid', 'productLines'], 'H03' => ['capabilities', 'capabilities'], 'H04' => ['process', 'delivery'], 'H05' => ['call-to-action', 'closing']];
$english = json_decode((string) get_post_meta(1461, FH_PAGE_META_CONTENT, true), true);
if (!is_array($english['modules'] ?? null)) {
    WP_CLI::error('缺少英文已批准首页，停止同步。');
}
$englishData = [];
foreach ($english['modules'] as $module) $englishData[$module['id']] = $module['data'];

function fh_home_draft_same_locked_fields(array $candidate, array $english): bool
{
    foreach (['primaryAction', 'secondaryAction'] as $key) {
        if (($candidate['hero'][$key]['href'] ?? null) !== ($english['H01'][$key]['href'] ?? null)) return false;
        if (($candidate['closing'][$key]['href'] ?? null) !== ($english['H05'][$key]['href'] ?? null)) return false;
    }
    foreach (['hero' => 'H01'] as $key => $id) {
        foreach (['wordpressId', 'src', 'hasRender', 'approvalStatus', 'sourceRef'] as $field) {
            if (($candidate[$key]['media'][$field] ?? null) !== ($english[$id]['media'][$field] ?? null)) return false;
        }
    }
    foreach (['H03' => 'capabilities', 'H04' => 'delivery'] as $id => $key) {
        $list = $id === 'H03' ? 'items' : 'stages';
        foreach ($english[$id][$list] as $index => $item) {
            if (($candidate[$key][$list][$index]['id'] ?? null) !== $item['id']) return false;
            if ($id === 'H03' && ($candidate[$key][$list][$index]['evidenceStatus'] ?? null) !== $item['evidenceStatus']) return false;
        }
    }
    foreach ($english['H02']['items'] as $index => $item) {
        foreach (['slug', 'href', 'image', 'hasRender'] as $field) {
            if (($candidate['productLines']['items'][$index][$field] ?? null) !== $item[$field]) return false;
        }
    }
    foreach ($english['H04']['evidence'] as $index => $item) {
        if (($candidate['delivery']['evidence'][$index]['id'] ?? null) !== $item['id']) return false;
        foreach (['wordpressId', 'src', 'hasRender', 'approvalStatus', 'sourceRef'] as $field) {
            if (($candidate['delivery']['evidence'][$index]['media'][$field] ?? null) !== $item['media'][$field]) return false;
        }
    }
    foreach (['capabilities' => 'H03', 'delivery' => 'H04'] as $key => $id) {
        if (($candidate[$key]['action']['href'] ?? null) !== ($english[$id]['action']['href'] ?? null)) return false;
    }
    return true;
}

$changes = [];
$fingerprintParts = [];
foreach ($ids as $locale => $id) {
    $post = get_post($id);
    if (!$post instanceof WP_Post || $post->post_status !== 'draft'
        || get_post_meta($id, FH_PAGE_META_KEY, true) !== 'home'
        || get_post_meta($id, FH_PAGE_META_LOCALE, true) !== $locale
        || get_post_meta($id, FH_PAGE_META_STATUS, true) !== 'draft') {
        WP_CLI::error("{$locale} Page 身份或草稿状态不符，停止同步。");
    }
    $source = json_decode((string) file_get_contents($draftDirectory . '/' . $locale . '.json'), true);
    if (!is_array($source)
        || ($source['draftMeta']['locale'] ?? '') !== $locale
        || ($source['draftMeta']['publicationStatus'] ?? '') !== 'unapproved'
        || ($source['draftMeta']['indexing'] ?? '') !== 'noindex'
        || !is_array($source['content'] ?? null)
        || !fh_home_draft_same_locked_fields($source['content'], $englishData)) {
        WP_CLI::error("{$locale} 审校稿状态、结构或锁定事实与英文正本不符。");
    }
    $modules = [];
    foreach ($keys as $moduleId => [$type, $key]) {
        if (!is_array($source['content'][$key] ?? null)) WP_CLI::error("{$locale} 缺少 {$moduleId}。");
        $modules[] = ['id' => $moduleId, 'type' => $type, 'order' => count($modules) * 10 + 10, 'enabled' => true, 'data' => $source['content'][$key]];
    }
    $content = ['schemaVersion' => 1, 'pageKey' => 'home', 'locale' => $locale, 'modules' => $modules];
    $title = trim((string) ($source['seo']['title'] ?? ''));
    $description = trim((string) ($source['seo']['description'] ?? ''));
    if (!fh_pages_home_content_ready($content, $title, $description)) WP_CLI::error("{$locale} 内容或 SEO 未通过首页契约校验。");
    $oldJson = (string) get_post_meta($id, FH_PAGE_META_CONTENT, true);
    $oldTitle = (string) get_post_meta($id, FH_PAGE_META_SEO_TITLE, true);
    $oldDescription = (string) get_post_meta($id, FH_PAGE_META_SEO_DESCRIPTION, true);
    $fingerprintParts[] = [$id, $post->post_modified_gmt, $oldJson, $oldTitle, $oldDescription, 'draft'];
    $changes[$locale] = ['id' => $id, 'content' => $content, 'title' => $title, 'description' => $description,
        'changed' => json_decode($oldJson, true) !== $content || $oldTitle !== $title || $oldDescription !== $description];
}
$fingerprint = hash('sha256', wp_json_encode($fingerprintParts, JSON_UNESCAPED_UNICODE));
if (!$write) {
    echo wp_json_encode(['dry_run' => true, 'state_sha256' => $fingerprint, 'pages' => array_map(static fn($x) => ['id' => $x['id'], 'changed' => $x['changed'], 'status' => 'draft'], $changes)], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n";
    return;
}
$backup = (string) ($options['backup'] ?? '');
if (!str_starts_with($backup, '/backup/') || !is_file($backup) || filesize($backup) <= 0 || filemtime($backup) < time() - 3600) {
    WP_CLI::error('写入前必须提供一小时内生成的 /backup/ 持久 SQL 备份。');
}
if (($options['expected'] ?? '') !== $fingerprint) WP_CLI::error('Page 状态指纹变化，请重新预演。');
foreach ($changes as $locale => $change) {
    if (!$change['changed']) continue;
    $id = $change['id'];
    update_post_meta($id, FH_PAGE_META_CONTENT, wp_json_encode($change['content'], JSON_UNESCAPED_UNICODE));
    update_post_meta($id, FH_PAGE_META_SEO_TITLE, sanitize_text_field($change['title']));
    update_post_meta($id, FH_PAGE_META_SEO_DESCRIPTION, sanitize_textarea_field($change['description']));
    wp_update_post(['ID' => $id, 'post_status' => 'draft']);
    wp_save_post_revision($id);
    echo "已更新 {$locale} 草稿 Page {$id}；仍为 draft/noindex。\n";
}
echo "备份：{$backup}\n";
