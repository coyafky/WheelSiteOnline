#!/usr/bin/env python3
"""本地询盘投递事件、积压告警与恢复接缝的最小验收。"""

from __future__ import annotations

import json
import subprocess
import sys


CONTAINER = "fh-wp"


def docker_php(code: str) -> str:
    result = subprocess.run(
        ["docker", "exec", CONTAINER, "php", "-d", "display_errors=1", "-r", code],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    return result.stdout.strip()


def main() -> int:
    source = r'''
require "/var/www/html/wp-load.php";
$checks = [];
$oldPaused = get_option('fh_inquiry_delivery_paused', null);
$postIds = [];
$outboxIds = [];
$eventIds = ['evt-local-delivered', 'evt-local-bounced', 'evt-local-unmatched'];
$secret = 'local-delivery-secret';
$diagnostics = [];
add_filter('fh_inquiry_webhook_secret', static fn() => $secret);
$routes = rest_get_server()->get_routes();
$checks['邮件事件 REST 路由已注册'] = isset($routes['/fh/v1/email-events']);
$checks['邮件事件处理器已存在'] = function_exists('fh_inquiry_rest_email_event');
$checks['积压摘要函数已存在'] = function_exists('fh_inquiry_delivery_alert_summary');
$checks['积压监控函数已存在'] = function_exists('fh_inquiry_run_alert_monitor');
$checks['积压告警 hook 已定义'] = defined('FH_INQUIRY_ALERT_HOOK');
$checks['积压告警已加入 WP-Cron'] = defined('FH_INQUIRY_ALERT_HOOK') && wp_next_scheduled(FH_INQUIRY_ALERT_HOOK) !== false;

global $wpdb;
$outboxTable = fh_inquiry_outbox_table();
$eventTable = fh_inquiry_event_table();
$now = gmdate('Y-m-d H:i:s');
try {
  $postId = wp_insert_post([
    'post_type' => FH_INQUIRY_POST_TYPE,
    'post_status' => 'publish',
    'post_title' => 'INQ-VERIFY-DELIVERY',
    'post_content' => '',
  ], true);
  if (is_wp_error($postId)) { throw new RuntimeException($postId->get_error_message()); }
  $postIds[] = (int) $postId;
  update_post_meta($postId, 'email_status', 'accepted');
  $messageId = 'msg-local-delivery-' . wp_generate_uuid4();
  $wpdb->insert($outboxTable, [
    'inquiry_id' => $postId, 'event_type' => 'sales_notification', 'status' => 'accepted',
    'attempts' => 1, 'provider_message_id' => $messageId, 'created_at' => $now, 'updated_at' => $now,
  ]);
  $outboxId = (int) $wpdb->insert_id;
  $outboxIds[] = $outboxId;

  $requestFor = static function (array $payload, ?int $timestamp = null, ?string $signature = null) use ($secret): WP_REST_Request {
    $body = wp_json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $ts = (string) ($timestamp ?? time());
    $request = new WP_REST_Request('POST', '/fh/v1/email-events');
    $request->set_header('Content-Type', 'application/json');
    $request->set_header('X-FH-Webhook-Timestamp', $ts);
    $request->set_header('X-FH-Webhook-Signature', $signature ?? ('sha256=' . hash_hmac('sha256', $ts . '.' . $body, $secret)));
    $request->set_body($body);
    return $request;
  };
  $delivered = [
    'id' => 'evt-local-delivered', 'type' => 'email.delivered',
    'created_at' => gmdate('c'), 'data' => ['email_id' => $messageId],
  ];
  $response = rest_get_server()->dispatch($requestFor($delivered));
  $diagnostics['delivered'] = [
    'status' => $response->get_status(),
    'data' => $response->get_data(),
  ];
  $checks['delivered 事件返回 200'] = $response->get_status() === 200;
  $checks['delivered 回写询盘状态'] = get_post_meta($postId, 'email_status', true) === 'delivered';
  $checks['delivered 回写 outbox 状态'] = (string) $wpdb->get_var($wpdb->prepare("SELECT status FROM {$outboxTable} WHERE id = %d", $outboxId)) === 'delivered';

  $replay = rest_get_server()->dispatch($requestFor($delivered));
  $checks['重复 delivered 幂等返回'] = $replay->get_status() === 200 && (($replay->get_data()['replayed'] ?? false) === true);
  $checks['重复事件只落一条'] = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$eventTable} WHERE provider_event_id = %s", 'evt-local-delivered')) === 1;

  $bounced = [
    'id' => 'evt-local-bounced', 'type' => 'email.bounced',
    'created_at' => gmdate('c'), 'data' => ['email_id' => $messageId, 'reason' => 'synthetic test'],
  ];
  $bounceResponse = rest_get_server()->dispatch($requestFor($bounced));
  $checks['bounced 事件回写状态'] = $bounceResponse->get_status() === 200 && get_post_meta($postId, 'email_status', true) === 'bounced';
  $lateDelivered = rest_get_server()->dispatch($requestFor([
    'id' => 'evt-local-delivered-late', 'type' => 'email.delivered', 'data' => ['email_id' => $messageId],
  ]));
  $checks['乱序 delivered 不覆盖 bounced'] = $lateDelivered->get_status() === 200 && get_post_meta($postId, 'email_status', true) === 'bounced';

  $unmatched = rest_get_server()->dispatch($requestFor([
    'id' => 'evt-local-unmatched', 'type' => 'email.delivered', 'data' => ['email_id' => 'msg-not-found'],
  ]));
  $checks['未匹配事件返回 202 并留审计'] = $unmatched->get_status() === 202 && (($unmatched->get_data()['matched'] ?? true) === false);
  $tampered = rest_get_server()->dispatch($requestFor($delivered, time(), 'sha256=invalid'));
  $checks['错误签名返回 401'] = $tampered->get_status() === 401;

  $wpdb->insert($outboxTable, [
    'inquiry_id' => $postId, 'event_type' => 'sales_notification', 'status' => 'pending', 'attempts' => 0,
    'next_attempt_at' => gmdate('Y-m-d H:i:s', time() - 60), 'created_at' => $now, 'updated_at' => $now,
  ]);
  $dueId = (int) $wpdb->insert_id; $outboxIds[] = $dueId;
  $wpdb->insert($outboxTable, [
    'inquiry_id' => $postId, 'event_type' => 'sales_notification', 'status' => 'failed', 'attempts' => FH_INQUIRY_DISPATCH_MAX_ATTEMPTS,
    'next_attempt_at' => null, 'created_at' => $now, 'updated_at' => $now,
  ]);
  $abandonedId = (int) $wpdb->insert_id; $outboxIds[] = $abandonedId;
  $summary = fh_inquiry_run_alert_monitor();
  $checks['积压摘要包含待处理与放弃'] = $summary['due'] >= 1 && $summary['abandoned'] >= 1 && $summary['triggered'] === true;
  $checks['积压告警摘要已持久化'] = (string) get_option('fh_inquiry_last_alert_summary', '') !== '';

  $wpdb->update($outboxTable, [
    'lease_owner' => 'verify-stale-lease', 'lease_expires_at' => gmdate('Y-m-d H:i:s', time() - 60),
    'next_attempt_at' => gmdate('Y-m-d H:i:s', time() - 60),
  ], ['id' => $dueId]);
  $claimed = fh_inquiry_claim_outbox(50);
  $claimedIds = array_map(static fn(array $row): int => (int) $row['id'], $claimed);
  $checks['过期租约可被恢复领取'] = in_array($dueId, $claimedIds, true);
} catch (Throwable $error) {
  $checks['合成投递演练未抛出异常'] = false;
  $checks['演练异常'] = false;
  error_log('[fh-inquiry-verify] ' . get_class($error) . ': ' . $error->getMessage());
} finally {
  if (!empty($eventIds)) {
    $quoted = implode(',', array_map(static fn(string $id): string => "'" . esc_sql($id) . "'", $eventIds));
    $wpdb->query("DELETE FROM {$eventTable} WHERE provider_event_id IN ({$quoted})");
    $wpdb->query("DELETE FROM {$eventTable} WHERE provider_event_id = 'evt-local-delivered-late'");
  }
  foreach ($outboxIds as $id) { $wpdb->delete($outboxTable, ['id' => (int) $id], ['%d']); }
  foreach ($postIds as $id) { wp_delete_post((int) $id, true); }
  delete_option('fh_inquiry_last_alert_summary');
  delete_option('fh_inquiry_last_alert_fingerprint');
  delete_option('fh_inquiry_last_alert_at');
  if ($oldPaused === null) { delete_option('fh_inquiry_delivery_paused'); }
  else { update_option('fh_inquiry_delivery_paused', $oldPaused, false); }
}
echo wp_json_encode(['checks' => $checks, 'diagnostics' => $diagnostics], JSON_UNESCAPED_UNICODE);
'''
    try:
        result = json.loads(docker_php(source))
    except (RuntimeError, json.JSONDecodeError) as error:
        print(f"❌ 投递接缝验收无法完成：{error}", file=sys.stderr)
        return 1

    checks = result.get("checks", {})
    if result.get("diagnostics"):
        print(f"ℹ️ 诊断：{json.dumps(result['diagnostics'], ensure_ascii=False)}")
    for label, passed in checks.items():
        print(f"{'✅' if passed else '❌'} {label}")
    return 0 if all(checks.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())
