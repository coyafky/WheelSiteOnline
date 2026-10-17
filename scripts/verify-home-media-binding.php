#!/usr/bin/env php
<?php
/**
 * 在 WordPress 容器内只读验证首页媒体绑定规则；不保存 Page、媒体或任何选项。
 * 用法：php scripts/verify-home-media-binding.php [/var/www/html/wp-load.php]
 */

declare(strict_types=1);

$wpLoad = $argv[1] ?? '/var/www/html/wp-load.php';
if (!is_file($wpLoad)) throw new RuntimeException("找不到 wp-load.php：{$wpLoad}");
require $wpLoad;

$old = ['media' => [
    'wordpressId' => 1,
    'src' => '/images/reviewed.webp',
    'alt' => '旧图',
    'approvalStatus' => 'approved',
    'hasRender' => true,
]];
$changed = $old;
$changed['media']['wordpressId'] = 99999999;
$changed['media']['approvalStatus'] = 'approved';
fh_pages_refresh_home_media($changed, $old);
if (($changed['media']['approvalStatus'] ?? '') !== 'candidate'
    || ($changed['media']['hasRender'] ?? true) !== false
    || ($changed['media']['mediaBindingStatus'] ?? '') !== 'attachment') {
    throw new RuntimeException('更换媒体 ID 后未降为候选状态。');
}

$same = $old;
fh_pages_refresh_home_media($same, $old);
if (($same['media']['src'] ?? '') !== '/images/reviewed.webp'
    || ($same['media']['approvalStatus'] ?? '') !== 'approved'
    || ($same['media']['hasRender'] ?? false) !== true) {
    throw new RuntimeException('既有已批准本地媒体映射被意外改写。');
}

$oldModules = ['modules' => [
    ['id' => 'H01', 'data' => $old],
    ['id' => 'H03', 'data' => []],
    ['id' => 'H04', 'data' => $old],
]];
$reorderedModules = ['modules' => [
    ['id' => 'H01', 'data' => $old],
    ['id' => 'H04', 'data' => $old],
    ['id' => 'H03', 'data' => []],
]];
fh_pages_refresh_home_media($reorderedModules, $oldModules);
if (($reorderedModules['modules'][1]['data']['media']['approvalStatus'] ?? '') !== 'approved') {
    throw new RuntimeException('模块调序误使 H04 原有媒体失去批准状态。');
}

$ids = get_posts([
    'post_type' => 'attachment',
    'post_status' => 'inherit',
    'post_mime_type' => 'image',
    'posts_per_page' => 20,
    'fields' => 'ids',
]);
$testedAttachment = false;
foreach ($ids as $id) {
    $url = (string) wp_get_attachment_url((int) $id);
    $alt = trim((string) get_post_meta((int) $id, '_wp_attachment_image_alt', true));
    if (!wp_attachment_is_image((int) $id) || $url === '' || $alt === '') continue;
    $new = $old;
    $new['media']['wordpressId'] = (int) $id;
    fh_pages_refresh_home_media($new, $old);
    if (($new['media']['approvalStatus'] ?? '') !== 'candidate' || ($new['media']['hasRender'] ?? true) !== false || ($new['media']['src'] ?? '') !== $url || ($new['media']['alt'] ?? '') !== $alt) {
        throw new RuntimeException('新附件绑定未刷新 URL/alt 或未降为候选状态。');
    }
    $reviewed = $new;
    $reviewed['media']['alt'] = '当前语言图片替代文字';
    $reviewed['media']['caption'] = '当前语言图片说明';
    $reviewed['media']['approvalStatus'] = 'approved';
    fh_pages_refresh_home_media($reviewed, $new);
    if (($reviewed['media']['approvalStatus'] ?? '') !== 'approved' || ($reviewed['media']['hasRender'] ?? false) !== true
        || ($reviewed['media']['alt'] ?? '') !== '当前语言图片替代文字' || !fh_pages_valid_home_media_bindings($reviewed)) {
        throw new RuntimeException('当前语言的媒体说明或显式审核未通过公开校验。');
    }
    $editedAlt = $reviewed;
    $editedAlt['media']['alt'] = '新待审替代文字';
    fh_pages_refresh_home_media($editedAlt, $reviewed);
    if (($editedAlt['media']['approvalStatus'] ?? '') !== 'candidate' || ($editedAlt['media']['hasRender'] ?? true) !== false) {
        throw new RuntimeException('已批准媒体的替代文字修改未重新进入候选状态。');
    }
    $testedAttachment = true;
    break;
}

echo "✅ 媒体 ID 变更降级、旧本地映射保持、附件复核流程通过" . ($testedAttachment ? "（含有效附件）" : "（当前无带 alt 的有效附件，已完成只读降级/保持校验）") . "\n";
