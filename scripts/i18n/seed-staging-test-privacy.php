<?php
/**
 * 仅用于 9080 预发布功能测试：批准一个明确标注为测试的隐私版本，
 * 让询盘表单可以验证 UI、WordPress/MySQL 落库和 Outbox 链路。
 *
 * 要求：FH_ALLOW_STAGING_SEED=1，且版本号必须以 staging-test- 开头。
 * 该记录不是正式法律隐私政策；正式发布前必须替换为业务/法务批准版本。
 */

if (!defined('ABSPATH')) {
    require_once '/var/www/html/wp-load.php';
}

if (getenv('FH_ALLOW_STAGING_SEED') !== '1') {
    fwrite(STDERR, "需要 FH_ALLOW_STAGING_SEED=1\n");
    exit(1);
}

$version = trim((string) getenv('FH_STAGING_PRIVACY_VERSION'));
if (!str_starts_with($version, 'staging-test-')) {
    fwrite(STDERR, "FH_STAGING_PRIVACY_VERSION 必须以 staging-test- 开头\n");
    exit(1);
}

$locales = [
    'en' => [
        'version' => $version,
        'consentText' => 'I agree to this staging privacy notice for functional testing only. Do not submit real personal or commercial information.',
        'linkLabel' => 'View the staging privacy notice',
        'linkHref' => '/support/privacy',
    ],
    'zh' => [
        'version' => $version,
        'consentText' => '我同意本预发布测试隐私声明，仅用于功能验证。请勿提交真实个人或商业信息。',
        'linkLabel' => '查看预发布测试隐私声明',
        'linkHref' => '/support/privacy',
    ],
    'es' => [
        'version' => $version,
        'consentText' => 'Acepto este aviso de privacidad de preproducción solo para pruebas funcionales. No envíe información personal o comercial real.',
        'linkLabel' => 'Ver el aviso de privacidad de prueba',
        'linkHref' => '/support/privacy',
    ],
    'th' => [
        'version' => $version,
        'consentText' => 'ฉันยอมรับประกาศความเป็นส่วนตัวสำหรับการทดสอบระบบนี้เท่านั้น โปรดอย่าส่งข้อมูลส่วนบุคคลหรือข้อมูลทางธุรกิจจริง',
        'linkLabel' => 'ดูประกาศความเป็นส่วนตัวสำหรับการทดสอบ',
        'linkHref' => '/support/privacy',
    ],
];

$pageKey = 'privacy';
$existing = get_posts([
    'post_type' => 'page',
    'post_status' => 'any',
    'posts_per_page' => 1,
    'meta_key' => 'fh_page_key',
    'meta_value' => $pageKey,
]);

if ($existing) {
    $postId = (int) $existing[0]->ID;
    $existingStatus = (string) get_post_meta($postId, 'fh_publication_status', true);
    $existingContent = json_decode((string) get_post_meta($postId, 'fh_content_json', true), true);
    $existingVersion = is_array($existingContent) ? trim((string) ($existingContent['version'] ?? '')) : '';
    if ($existingStatus === 'approved' && !str_starts_with($existingVersion, 'staging-test-')) {
        fwrite(STDERR, "拒绝覆盖非测试版已批准 privacy 页面 {$postId}\n");
        exit(1);
    }
    if (get_post_status($postId) !== 'publish') {
        wp_update_post(['ID' => $postId, 'post_status' => 'publish']);
    }
} else {
    $postId = (int) wp_insert_post([
        'post_type' => 'page',
        'post_status' => 'publish',
        'post_title' => 'Staging Test Privacy Notice',
        'post_name' => 'privacy',
        'post_content' => '',
    ], true);
    if (is_wp_error($postId) || $postId <= 0) {
        fwrite(STDERR, "创建 privacy 页面失败\n");
        exit(1);
    }
}

$json = static fn(mixed $value): string => wp_json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$master = $locales['en'];

update_post_meta($postId, 'fh_page_key', $pageKey);
update_post_meta($postId, 'fh_publication_status', 'approved');
update_post_meta($postId, 'fh_content_json', $json($master));
update_post_meta($postId, 'fh_content_by_locale_json', $json($locales));
update_post_meta($postId, 'fh_seo_title', 'Staging Test Privacy Notice | Fenghuai');
update_post_meta($postId, 'fh_seo_description', 'Functional test privacy notice for the noindex staging environment.');
update_post_meta($postId, 'fh_locale_status_json', $json(array_fill_keys(array_keys($locales), 'approved')));
update_post_meta($postId, 'fh_staging_test_seed', '1');

printf("privacy page=%d version=%s locales=%s publication=approved staging_only=1\n", $postId, $version, implode(',', array_keys($locales)));
