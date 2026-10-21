#!/usr/bin/env php
<?php
/**
 * 在本地 WordPress 对中文草稿短暂执行受控表单保存，验证文案与调序；
 * finally 恢复原始 meta。不发布页面、不提交询盘。
 * 用法：wp eval-file scripts/verify-home-editor-flow.php
 */

if (!defined('ABSPATH')) require '/var/www/html/wp-load.php';
if (!in_array(wp_parse_url(home_url(), PHP_URL_HOST), ['localhost', '127.0.0.1'], true)) {
    throw new RuntimeException('只允许在本地 WordPress 副本执行可逆编辑验收。');
}

$posts = get_posts([
    'post_type' => 'page', 'post_status' => 'any', 'posts_per_page' => 1,
    'meta_query' => [
        ['key' => FH_PAGE_META_KEY, 'value' => 'home'],
        ['key' => FH_PAGE_META_LOCALE, 'value' => 'zh'],
    ],
]);
$post = $posts[0] ?? null;
if (!$post instanceof WP_Post || get_post_meta($post->ID, FH_PAGE_META_STATUS, true) !== 'draft') {
    throw new RuntimeException('找不到待审中文首页草稿；停止可逆编辑验收。');
}

$keys = [FH_PAGE_META_KEY, FH_PAGE_META_STATUS, FH_PAGE_META_CONTENT, FH_PAGE_META_SEO_TITLE,
    FH_PAGE_META_SEO_DESCRIPTION, FH_PAGE_META_MEDIA, FH_PAGE_META_LOCALE,
    FH_PAGE_META_TRANSLATION_GROUP, FH_PAGE_META_SCHEMA_VERSION];
$original = [];
foreach ($keys as $key) $original[$key] = get_post_meta($post->ID, $key, true);
$content = json_decode((string) $original[FH_PAGE_META_CONTENT], true);
if (!is_array($content['modules'] ?? null)) throw new RuntimeException('中文首页模块树缺失。');

$admin = get_users(['role' => 'administrator', 'number' => 1])[0] ?? null;
if (!$admin instanceof WP_User) throw new RuntimeException('找不到本地管理员，无法模拟受控字段保存。');
wp_set_current_user($admin->ID);
$_POST = [
    'fh_pages_nonce' => wp_create_nonce('fh_pages_save'),
    'fh_page_key' => 'home',
    'fh_page_locale' => 'zh',
    'fh_translation_group' => 'home',
    'fh_page_schema_version' => '1',
    'fh_publication_status' => 'draft',
    'fh_seo_title' => (string) $original[FH_PAGE_META_SEO_TITLE],
    'fh_seo_description' => (string) $original[FH_PAGE_META_SEO_DESCRIPTION],
    'fh_featured_media_id' => (string) $original[FH_PAGE_META_MEDIA],
];
foreach (FH_HOME_MODULES as $id => $_definition) {
    $module = array_values(array_filter($content['modules'], static fn($item): bool => ($item['id'] ?? '') === $id))[0] ?? null;
    if (!is_array($module)) throw new RuntimeException("缺少 {$id}。");
    $_POST['fh_home_' . strtolower($id) . '_order'] = (string) ($id === 'H02' ? 30 : ($id === 'H03' ? 20 : $module['order']));
    foreach (fh_pages_home_field_specs()[$id] as $field) {
        $name = 'fh_home_' . strtolower($id) . '_' . str_replace('.', '_', $field['path']);
        $_POST[$name] = (string) fh_pages_home_path_get($module['data'], $field['path']);
    }
}
$marker = '中文首页试点验收标记';
$_POST['fh_home_h03_heading'] = $marker;

try {
    fh_pages_save_meta($post->ID);
    $edited = json_decode((string) get_post_meta($post->ID, FH_PAGE_META_CONTENT, true), true);
    if (!fh_pages_home_content_ready($edited, (string) $original[FH_PAGE_META_SEO_TITLE], (string) $original[FH_PAGE_META_SEO_DESCRIPTION])) {
        throw new RuntimeException('保存后模块树未通过公开内容校验。');
    }
    $byId = [];
    foreach ($edited['modules'] as $module) $byId[$module['id']] = $module;
    if (($byId['H03']['data']['heading'] ?? '') !== $marker
        || ($byId['H03']['order'] ?? null) !== 20
        || ($byId['H02']['order'] ?? null) !== 30
        || get_post_meta($post->ID, FH_PAGE_META_STATUS, true) !== 'draft') {
        throw new RuntimeException('受控字段保存、H02/H03 调序或草稿状态验收失败。');
    }
    $request = new WP_REST_Request('GET', '/fh/v2/pages');
    $request->set_param('key', 'home');
    $request->set_param('locale', 'zh');
    $public = fh_pages_rest_v2($request);
    if (!$public instanceof WP_REST_Response || ($public->get_data()['status'] ?? '') !== 'unpublished') {
        throw new RuntimeException('编辑草稿后意外进入公开接口。');
    }
    echo "✅ 中文首页字段修改、H02/H03 调序与草稿发布门槛通过；即将恢复原始数据。\n";
} finally {
    foreach ($original as $key => $value) update_post_meta($post->ID, $key, $value);
    $_POST = [];
}
