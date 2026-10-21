<?php
/**
 * Plugin Name:       Fenghuai Operations — 告警接线
 * Description:       把询盘投递与缓存失效队列的积压转成真实可送达的通知，而不是只写 error_log。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Fenghuai Tech
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Why this plugin exists
 * ----------------------
 * `fh_inquiry_delivery_alert` (and, later, the revalidation queue) already knew
 * when something was wrong — it built a summary, de-duplicated it and fired a
 * hook. Nothing listened. An alert that reaches `error_log` on a machine nobody
 * tails is indistinguishable from no alert at all.
 *
 * This plugin is the missing receiver. It sends over the same mail path the
 * enquiry pipeline uses (`wp_mail` → configured SMTP), so no new dependency or
 * credential is introduced.
 *
 * Discipline:
 *  - Recipients come from server-side config only, never from a request.
 *  - A failing notifier must not cascade: `wp_mail` errors are swallowed and
 *    logged once, never thrown into the caller's request.
 *  - Sending is throttled by the sources themselves (fingerprint + 15 min), so
 *    this file does not add its own rate limiting.
 */

const FH_OPS_ALERT_TO_OPTION = 'fh_ops_alert_to';
const FH_OPS_ALERT_ENABLED_OPTION = 'fh_ops_alert_enabled';

/** Recipients for operational alerts. Falls back to the sales inbox. */
function fh_ops_alert_recipients(): array
{
    $configured = (string) get_option(FH_OPS_ALERT_TO_OPTION, '');
    $raw = $configured !== '' ? $configured : (function_exists('fh_inquiry_mail_to') ? fh_inquiry_mail_to() : '');
    $list = array_filter(array_map('trim', explode(',', $raw)), static fn ($v) => $v !== '' && is_email($v));
    return array_values(array_unique($list));
}

function fh_ops_alerts_enabled(): bool
{
    // Default on: an alert system that defaults to silence reproduces the bug
    // it was built to fix.
    return get_option(FH_OPS_ALERT_ENABLED_OPTION, '1') === '1';
}

/**
 * Send one operational alert.
 *
 * @param string               $subject Human-readable subject line.
 * @param array<string,mixed>  $details Structured payload, rendered as lines.
 */
function fh_ops_send_alert(string $subject, array $details): bool
{
    if (!fh_ops_alerts_enabled()) return false;

    $recipients = fh_ops_alert_recipients();
    if (!$recipients) {
        error_log('[fh-ops-alert] no recipient configured; alert dropped: ' . $subject);
        return false;
    }

    $lines = ['Fenghuai operations alert', '', $subject, ''];
    foreach ($details as $key => $value) {
        if (is_array($value)) $value = wp_json_encode($value, JSON_UNESCAPED_UNICODE);
        $lines[] = sprintf('%s: %s', $key, (string) $value);
    }
    $lines[] = '';
    $lines[] = 'site: ' . home_url('/');
    $lines[] = 'time: ' . gmdate('c');

    $sent = wp_mail(
        $recipients,
        '[Fenghuai] ' . $subject,
        implode("\n", $lines),
        ['content-type: text/plain; charset=UTF-8']
    );

    if (!$sent) {
        // Log once; never surface into the caller's request path.
        error_log('[fh-ops-alert] delivery failed: ' . $subject);
        return false;
    }

    update_option('fh_ops_last_alert_at', time(), false);
    return true;
}

/**
 * Receiver for the enquiry delivery alert.
 *
 * The summary shape comes from `fh_inquiry_delivery_alert_summary()`:
 * due / abandoned / expiredLeases / checkedAt.
 */
function fh_ops_on_inquiry_delivery_alert(array $summary): void
{
    $due = (int) ($summary['due'] ?? 0);
    $abandoned = (int) ($summary['abandoned'] ?? 0);
    $expired = (int) ($summary['expiredLeases'] ?? 0);

    $severity = $abandoned > 0 ? 'ABANDONED' : 'BACKLOG';
    fh_ops_send_alert(
        sprintf('询盘邮件投递异常（%s）', $severity),
        [
            '待重试 (due)' => $due,
            '已放弃 (abandoned)' => $abandoned,
            '租约过期 (expiredLeases)' => $expired,
            '统计时间' => (string) ($summary['checkedAt'] ?? ''),
            '处理建议' => $abandoned > 0
                ? '已超过重试上限，客户询盘仍在库中但销售未收到邮件，需人工补发。'
                : '邮件通道可能不可用，系统会自动重试；持续积压请检查 SMTP 配置。',
        ]
    );
}
add_action('fh_inquiry_delivery_alert', 'fh_ops_on_inquiry_delivery_alert', 10, 1);

/**
 * Revalidation queue watch.
 *
 * The queue added with the retry work grows when invalidations cannot reach
 * Next.js. A backlog means editors publish or withdraw and the public site keeps
 * serving the previous state, so it deserves the same treatment as a stuck mail
 * queue.
 */
const FH_OPS_REVALIDATE_ALERT_THRESHOLD = 10;
const FH_OPS_REVALIDATE_CRON_HOOK = 'fh_ops_revalidate_watch_tick';

function fh_ops_revalidate_watch(): array
{
    if (!function_exists('fh_content_revalidate_self_check')) {
        return ['available' => false];
    }
    $status = fh_content_revalidate_self_check();
    $pending = (int) ($status['queue_pending'] ?? 0);
    $retrying = (int) ($status['queue_retrying'] ?? 0);
    $status['triggered'] = $pending >= FH_OPS_REVALIDATE_ALERT_THRESHOLD;
    $status['alerted'] = false;

    update_option('fh_ops_revalidate_status', wp_json_encode($status), false);
    if (!$status['triggered']) return $status;

    // One alert per distinct backlog size per 15 minutes, same discipline as
    // the enquiry alert so a sustained backlog cannot spam the inbox.
    $fingerprint = hash('sha256', (string) $pending);
    $previous = (string) get_option('fh_ops_revalidate_fingerprint', '');
    $lastAt = (int) get_option('fh_ops_revalidate_alert_at', 0);
    if ($fingerprint === $previous && time() - $lastAt < 15 * MINUTE_IN_SECONDS) {
        return $status;
    }

    $status['alerted'] = fh_ops_send_alert('缓存失效积压', [
        '待投递 (pending)' => $pending,
        '已重试过 (retrying)' => $retrying,
        '阈值' => FH_OPS_REVALIDATE_ALERT_THRESHOLD,
        '调度正常 (cron_scheduled)' => ($status['cron_scheduled'] ?? false) ? '是' : '否',
        '影响' => '编辑器发布或撤回的内容可能未在前台生效。',
    ]);

    if ($status['alerted']) {
        update_option('fh_ops_revalidate_fingerprint', $fingerprint, false);
        update_option('fh_ops_revalidate_alert_at', time(), false);
    }
    return $status;
}

function fh_ops_revalidate_schedule(): void
{
    if (!wp_next_scheduled(FH_OPS_REVALIDATE_CRON_HOOK)) {
        wp_schedule_event(time() + 120, 'fh_ops_every_five_minutes', FH_OPS_REVALIDATE_CRON_HOOK);
    }
}
add_action('init', 'fh_ops_revalidate_schedule');

function fh_ops_cron_intervals(array $schedules): array
{
    $schedules['fh_ops_every_five_minutes'] = [
        'interval' => 300,
        'display' => 'Fenghuai operations watch (5 minutes)',
    ];
    return $schedules;
}
add_filter('cron_schedules', 'fh_ops_cron_intervals');

add_action(FH_OPS_REVALIDATE_CRON_HOOK, 'fh_ops_revalidate_watch');

/* ── Settings ────────────────────────────────────────────────────────────── */

add_action('admin_init', 'fh_ops_register_settings');
function fh_ops_register_settings(): void
{
    register_setting('writing', FH_OPS_ALERT_TO_OPTION, [
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => static function ($value): string {
            $list = array_filter(array_map('trim', explode(',', (string) $value)), 'is_email');
            return implode(',', $list);
        },
    ]);
    register_setting('writing', FH_OPS_ALERT_ENABLED_OPTION, [
        'type' => 'string',
        'default' => '1',
        'sanitize_callback' => static fn ($value): string => $value === '1' ? '1' : '0',
    ]);

    add_settings_section('fh_ops_alerts', '运维告警', static function (): void {
        echo '<p>询盘邮件积压与缓存失效积压会发到下面的地址。留空则复用询盘收件人。</p>';
    }, 'writing');

    add_settings_field(
        FH_OPS_ALERT_TO_OPTION,
        '告警收件人',
        static function (): void {
            printf(
                '<input class="regular-text" type="text" name="%1$s" value="%2$s" placeholder="ops@example.com（多个用逗号分隔）">',
                esc_attr(FH_OPS_ALERT_TO_OPTION),
                esc_attr((string) get_option(FH_OPS_ALERT_TO_OPTION, ''))
            );
        },
        'writing',
        'fh_ops_alerts'
    );

    add_settings_field(
        FH_OPS_ALERT_ENABLED_OPTION,
        '启用告警',
        static function (): void {
            printf(
                '<label><input type="checkbox" name="%1$s" value="1" %2$s> 发送运维告警邮件</label>',
                esc_attr(FH_OPS_ALERT_ENABLED_OPTION),
                checked(fh_ops_alerts_enabled(), true, false)
            );
        },
        'writing',
        'fh_ops_alerts'
    );
}

/* ── Observability ───────────────────────────────────────────────────────── */

/** A test send, so "is the alert path wired?" is answerable without waiting for a failure. */
function fh_ops_send_test_alert(): bool
{
    return fh_ops_send_alert('告警通道自检', [
        '触发方式' => 'manual test',
        '收件人数' => count(fh_ops_alert_recipients()),
        '缓存失效阈值' => FH_OPS_REVALIDATE_ALERT_THRESHOLD,
    ]);
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('fh ops-alert-test', static function (): void {
        $ok = fh_ops_send_test_alert();
        $ok ? WP_CLI::success('alert delivered') : WP_CLI::error('alert NOT delivered');
    });
    WP_CLI::add_command('fh ops-status', static function (): void {
        WP_CLI::line((string) wp_json_encode([
            'enabled' => fh_ops_alerts_enabled(),
            'recipients' => fh_ops_alert_recipients(),
            'last_alert_at' => get_option('fh_ops_last_alert_at', 0),
            'revalidate_watch' => fh_ops_revalidate_watch(),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    });
}
