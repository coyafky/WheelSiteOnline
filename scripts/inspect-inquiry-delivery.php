<?php
/** 只读查看一条询盘的落库与 Outbox 状态，不输出客户联系方式或邮件正文。 */

declare(strict_types=1);

$key = trim((string) ($argv[1] ?? ''));
if ($key === '' || !preg_match('/^INQ-[A-Z0-9-]+$/', $key)) {
    fwrite(STDERR, "用法：php inspect-inquiry-delivery.php INQ-...\n");
    exit(1);
}

require_once (string) (getenv('FH_WORDPRESS_LOAD') ?: '/var/www/html/wp-load.php');

global $wpdb;
$outboxTable = fh_inquiry_outbox_table();
$postId = (int) $wpdb->get_var($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} WHERE post_type = %s AND post_title = %s LIMIT 1",
    FH_INQUIRY_POST_TYPE,
    $key,
));
$outbox = $postId > 0
    ? $wpdb->get_row($wpdb->prepare(
        "SELECT status, attempts, last_error FROM {$outboxTable} WHERE inquiry_id = %d ORDER BY id DESC LIMIT 1",
        $postId,
    ), ARRAY_A)
    : null;

echo wp_json_encode([
    'inquiry_key' => $key,
    'inquiry_id' => $postId,
    'business_status' => $postId > 0 ? (string) get_post_meta($postId, 'inquiry_status', true) : null,
    'email_status' => $postId > 0 ? (string) get_post_meta($postId, 'email_status', true) : null,
    'outbox' => $outbox,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
