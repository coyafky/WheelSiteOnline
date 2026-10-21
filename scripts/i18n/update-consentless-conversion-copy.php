<?php
/**
 * 只更新 request-a-quote 的四语 dataNotice.body。
 *
 * 询盘现在不再以隐私勾选作为业务提交门槛，因此页面不能继续显示“表单关闭”的
 * 矛盾文案。本脚本只改这一组叶子字段，保留其他正文、SEO、翻译状态和页面属性。
 * 非 local 环境必须显式设置 FH_ALLOW_CONSENTLESS_COPY=1。
 */

declare(strict_types=1);

$loadPath = (string) (getenv('FH_WORDPRESS_LOAD') ?: '/var/www/html/wp-load.php');
if (!is_file($loadPath)) {
    fwrite(STDERR, "找不到 WordPress 加载文件：{$loadPath}\n");
    exit(1);
}

require_once $loadPath;

$environment = function_exists('wp_get_environment_type') ? wp_get_environment_type() : 'unknown';
if ($environment !== 'local' && getenv('FH_ALLOW_CONSENTLESS_COPY') !== '1') {
    fwrite(STDERR, "非 local 环境必须显式设置 FH_ALLOW_CONSENTLESS_COPY=1\n");
    exit(1);
}

$bodies = [
    'en' => 'Share the information you already have. Missing technical details can be confirmed before quotation or production approval.',
    'zh' => '告诉我们您已经掌握的信息即可；缺失的技术细节可在报价或生产批准前确认。',
    'es' => 'Comparta la información que ya tenga; los detalles técnicos pendientes se pueden confirmar antes de aprobar la oferta o la producción.',
    'th' => 'ส่งข้อมูลที่คุณมีอยู่แล้วได้เลย รายละเอียดทางเทคนิคที่ขาดสามารถยืนยันก่อนอนุมัติใบเสนอราคาหรือการผลิต',
];

$pages = get_posts([
    'post_type' => 'page',
    'post_status' => 'any',
    'posts_per_page' => 2,
    'meta_key' => 'fh_page_key',
    'meta_value' => 'request-a-quote',
]);
if (count($pages) !== 1) {
    fwrite(STDERR, 'request-a-quote 页面数量不是 1，拒绝更新\n');
    exit(1);
}

$id = (int) $pages[0]->ID;
$decode = static function (string $raw, string $label): array {
    $value = json_decode($raw, true);
    if (!is_array($value)) {
        throw new RuntimeException("{$label} 不是有效 JSON");
    }
    return $value;
};
$encode = static fn (array $value): string => wp_json_encode(
    $value,
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
);

try {
    $master = $decode((string) get_post_meta($id, 'fh_content_json', true), 'fh_content_json');
    $byLocale = $decode((string) get_post_meta($id, 'fh_content_by_locale_json', true), 'fh_content_by_locale_json');
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
}

if (!isset($master['dataNotice']) || !is_array($master['dataNotice'])) {
    fwrite(STDERR, "英文正本缺少 dataNotice，拒绝更新\n");
    exit(1);
}

$backupKey = 'fh_consentless_copy_backup_20261012';
if (get_post_meta($id, $backupKey, true) === '') {
    update_post_meta($id, $backupKey, wp_json_encode([
        'content' => $master,
        'content_by_locale' => $byLocale,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

$master['dataNotice']['body'] = $bodies['en'];
foreach ($bodies as $locale => $body) {
    if (!isset($byLocale[$locale]) || !is_array($byLocale[$locale])) {
        fwrite(STDERR, "缺少 {$locale} content_by_locale，拒绝部分更新\n");
        exit(1);
    }
    if (!isset($byLocale[$locale]['dataNotice']) || !is_array($byLocale[$locale]['dataNotice'])) {
        fwrite(STDERR, "{$locale} 缺少 dataNotice，拒绝部分更新\n");
        exit(1);
    }
    $byLocale[$locale]['dataNotice']['body'] = $body;
}

update_post_meta($id, 'fh_content_json', $encode($master));
update_post_meta($id, 'fh_content_by_locale_json', $encode($byLocale));

$readMaster = json_decode((string) get_post_meta($id, 'fh_content_json', true), true);
$readLocales = json_decode((string) get_post_meta($id, 'fh_content_by_locale_json', true), true);
if (($readMaster['dataNotice']['body'] ?? null) !== $bodies['en']) {
    fwrite(STDERR, "英文正本回读校验失败\n");
    exit(1);
}
foreach ($bodies as $locale => $body) {
    if (($readLocales[$locale]['dataNotice']['body'] ?? null) !== $body) {
        fwrite(STDERR, "{$locale} 回读校验失败\n");
        exit(1);
    }
}

fwrite(STDOUT, "已更新 request-a-quote 页面 ID={$id} 的四语 dataNotice.body；其余字段未改动。\n");
