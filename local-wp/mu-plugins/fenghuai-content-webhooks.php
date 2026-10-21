<?php
/**
 * Plugin Name:       Fenghuai Content — Next.js 缓存刷新
 * Description:       轮毂、原生博客与原生页面保存、撤回或删除后，以共享密钥通知 Next.js 失效对应缓存。
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Fenghuai Tech
 */

if (!defined('ABSPATH')) {
    exit;
}

const FH_CONTENT_REVALIDATE_URL_OPTION = 'fh_next_revalidate_url';
const FH_CONTENT_REVALIDATE_SECRET_OPTION = 'fh_next_revalidate_secret';

/** Pending revalidation queue (option-backed; small and short-lived). */
const FH_CONTENT_REVALIDATE_QUEUE_OPTION = 'fh_next_revalidate_queue';

/** Attempts before an entry is dropped, so a stuck queue cannot grow forever. */
const FH_CONTENT_REVALIDATE_MAX_ATTEMPTS = 5;

/** Backoff between attempts, in seconds, indexed by attempt count. */
const FH_CONTENT_REVALIDATE_BACKOFF = [60, 300, 900, 3600];

/** Cron hook that drains the queue. */
const FH_CONTENT_REVALIDATE_CRON_HOOK = 'fh_content_revalidate_retry_tick';

function fh_content_revalidate_config(): array
{
    $constantUrl = defined('FH_NEXT_REVALIDATE_URL') ? trim((string) FH_NEXT_REVALIDATE_URL) : '';
    $constantSecret = defined('FH_NEXT_REVALIDATE_SECRET') ? trim((string) FH_NEXT_REVALIDATE_SECRET) : '';
    $url = $constantUrl !== '' ? $constantUrl : (string) get_option(FH_CONTENT_REVALIDATE_URL_OPTION, '');
    $secret = $constantSecret !== '' ? $constantSecret : (string) get_option(FH_CONTENT_REVALIDATE_SECRET_OPTION, '');
    return ['url' => trim($url), 'secret' => trim($secret)];
}

/**
 * Read the pending queue.
 *
 * @return array<string,array{payload:array<string,mixed>,attempts:int,next_at:int}>
 */
function fh_content_revalidate_queue(): array
{
    $queue = get_option(FH_CONTENT_REVALIDATE_QUEUE_OPTION, []);
    return is_array($queue) ? $queue : [];
}

function fh_content_revalidate_queue_save(array $queue): void
{
    update_option(FH_CONTENT_REVALIDATE_QUEUE_OPTION, $queue, false);
}

/** Stable identity for one payload, so repeat saves collapse into one entry. */
function fh_content_revalidate_queue_key(array $payload): string
{
    return hash('sha256', wp_json_encode($payload));
}

function fh_content_revalidate_enqueue(array $payload): void
{
    $queue = fh_content_revalidate_queue();
    $key = fh_content_revalidate_queue_key($payload);
    $queue[$key] = [
        'payload' => $payload,
        'attempts' => 0,
        'next_at' => time(),
    ];
    fh_content_revalidate_queue_save($queue);
}

function fh_content_revalidate_dequeue(string $key): void
{
    $queue = fh_content_revalidate_queue();
    if (!isset($queue[$key])) return;
    unset($queue[$key]);
    fh_content_revalidate_queue_save($queue);
}

/**
 * Deliver one payload. Blocking on purpose: without reading the response we
 * cannot tell "accepted" from "connection refused", and the whole point of the
 * queue is to know the difference.
 *
 * @return array{ok:bool,status:int,body:string}
 */
function fh_content_revalidate_deliver(array $payload, string $url, string $secret): array
{
    $body = wp_json_encode($payload);
    $result = wp_remote_post($url, [
        'timeout' => 5,
        'blocking' => true,
        'headers' => [
            'content-type' => 'application/json',
            'x-fh-signature' => 'sha256=' . hash_hmac('sha256', $body, $secret),
        ],
        'body' => $body,
    ]);

    if (is_wp_error($result)) {
        return ['ok' => false, 'status' => 0, 'body' => $result->get_error_message()];
    }
    $status = (int) wp_remote_retrieve_response_code($result);
    return [
        'ok' => $status >= 200 && $status < 300,
        'status' => $status,
        'body' => (string) wp_remote_retrieve_body($result),
    ];
}

/**
 * Queue a cache invalidation and attempt delivery once.
 *
 * Previously this was fire-and-forget (`blocking => false`, 0.5s timeout): the
 * request either reached Next.js or vanished, and WordPress had no way to know
 * which. A dropped invalidation meant a withdrawn page kept serving until the
 * 1-hour revalidate window expired — the opposite of the publish contract.
 *
 * Now the payload lands in an option-backed queue first, and is only removed
 * once Next.js answers 2xx. Failures stay queued for the cron retry.
 */
function fh_content_send_revalidation(string $type, string $slug, array $context = []): bool
{
    $config = fh_content_revalidate_config();
    if (!in_array($type, ['wheels', 'insights', 'pages'], true)) return false;
    if ($config['url'] === '' || $config['secret'] === '') return false;
    $slug = sanitize_title($slug);

    $payload = ['type' => $type, 'slug' => $slug];
    if ($type === 'pages') {
        if (isset($context['locale'])) $payload['locale'] = $context['locale'];
        if (isset($context['revision'])) $payload['revision'] = $context['revision'];
    }

    fh_content_revalidate_enqueue($payload);
    $result = fh_content_revalidate_deliver($payload, $config['url'], $config['secret']);
    if ($result['ok']) {
        fh_content_revalidate_dequeue(fh_content_revalidate_queue_key($payload));
        return true;
    }

    error_log(sprintf(
        '[fh-content-revalidate] queued for retry (status=%d) type=%s slug=%s',
        $result['status'],
        $type,
        $slug
    ));
    return false;
}

/**
 * Retry every due entry. Runs on WP-Cron.
 *
 * Entries that keep failing back off (60s → 5m → 15m → 1h) and are dropped after
 * FH_CONTENT_REVALIDATE_MAX_ATTEMPTS so one dead endpoint cannot grow the queue
 * without bound.
 */
function fh_content_revalidate_retry(): void
{
    $config = fh_content_revalidate_config();
    if ($config['url'] === '' || $config['secret'] === '') return;

    $queue = fh_content_revalidate_queue();
    if (!$queue) return;

    $now = time();
    $changed = false;

    foreach ($queue as $key => $entry) {
        if (!is_array($entry) || ($entry['next_at'] ?? PHP_INT_MAX) > $now) continue;

        $result = fh_content_revalidate_deliver(
            is_array($entry['payload'] ?? null) ? $entry['payload'] : [],
            $config['url'],
            $config['secret']
        );

        $changed = true;
        if ($result['ok']) {
            unset($queue[$key]);
            continue;
        }

        $attempts = (int) ($entry['attempts'] ?? 0) + 1;
        if ($attempts >= FH_CONTENT_REVALIDATE_MAX_ATTEMPTS) {
            error_log(sprintf(
                '[fh-content-revalidate] giving up after %d attempts (status=%d): %s',
                $attempts,
                $result['status'],
                wp_json_encode($entry['payload'] ?? [])
            ));
            unset($queue[$key]);
            continue;
        }

        $backoff = FH_CONTENT_REVALIDATE_BACKOFF[
            min($attempts - 1, count(FH_CONTENT_REVALIDATE_BACKOFF) - 1)
        ];
        $queue[$key]['attempts'] = $attempts;
        $queue[$key]['next_at'] = $now + $backoff;
    }

    if ($changed) fh_content_revalidate_queue_save($queue);
}

function fh_content_post_type_payload(int $postId): ?array
{
    $post = get_post($postId);
    if (!$post instanceof WP_Post || wp_is_post_revision($postId)) return null;
    if ($post->post_type === 'wheel_model') {
        $slug = (string) get_post_meta($postId, 'public_slug', true);
        return ['type' => 'wheels', 'slug' => $slug ?: $post->post_name];
    }
    if ($post->post_type === 'fh_guide') {
        return ['type' => 'insights', 'slug' => $post->post_name];
    }
    if ($post->post_type === 'post' && get_post_meta($postId, 'fh_publication_status', true) !== '') {
        return ['type' => 'insights', 'slug' => $post->post_name];
    }
    if ($post->post_type === 'page' && get_post_meta($postId, 'fh_page_key', true) !== '') {
        return [
            'type' => 'pages',
            'slug' => (string) get_post_meta($postId, 'fh_page_key', true),
            'locale' => (string) get_post_meta($postId, 'fh_page_locale', true),
            'revision' => (string) get_post_modified_time('c', true, $post),
        ];
    }
    return null;
}

function fh_content_revalidate_post(int $postId): void
{
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    $payload = fh_content_post_type_payload($postId);
    if ($payload) fh_content_send_revalidation($payload['type'], $payload['slug'], $payload);
}

add_action('save_post_wheel_model', 'fh_content_revalidate_post', 100);
add_action('save_post_fh_guide', 'fh_content_revalidate_post', 100);
add_action('save_post_post', 'fh_content_revalidate_post', 100);
add_action('save_post_page', 'fh_content_revalidate_post', 100);
add_action('trashed_post', 'fh_content_revalidate_post', 100);
add_action('before_delete_post', 'fh_content_revalidate_post', 100);

/* ── Retry queue ─────────────────────────────────────────────────────────── */

/** Schedule the retry tick once, and keep it scheduled. */
function fh_content_revalidate_schedule(): void
{
    if (!wp_next_scheduled(FH_CONTENT_REVALIDATE_CRON_HOOK)) {
        wp_schedule_event(time() + 60, 'fh_content_revalidate_every_minute', FH_CONTENT_REVALIDATE_CRON_HOOK);
    }
}
add_action('init', 'fh_content_revalidate_schedule');

function fh_content_revalidate_cron_intervals(array $schedules): array
{
    $schedules['fh_content_revalidate_every_minute'] = [
        'interval' => 60,
        'display' => 'Fenghuai revalidation retry (1 minute)',
    ];
    return $schedules;
}
add_filter('cron_schedules', 'fh_content_revalidate_cron_intervals');

add_action(FH_CONTENT_REVALIDATE_CRON_HOOK, 'fh_content_revalidate_retry');

/**
 * Drop the schedule when the plugin is deactivated. The queue itself is left
 * alone so a redeploy can drain it.
 */
function fh_content_revalidate_unschedule(): void
{
    $timestamp = wp_next_scheduled(FH_CONTENT_REVALIDATE_CRON_HOOK);
    if ($timestamp) wp_unschedule_event($timestamp, FH_CONTENT_REVALIDATE_CRON_HOOK);
}
register_deactivation_hook(__FILE__, 'fh_content_revalidate_unschedule');

add_action('admin_init', 'fh_content_revalidate_register_settings');
function fh_content_revalidate_register_settings(): void
{
    register_setting('writing', FH_CONTENT_REVALIDATE_URL_OPTION, [
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => 'esc_url_raw',
    ]);
    register_setting('writing', FH_CONTENT_REVALIDATE_SECRET_OPTION, [
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    add_settings_field(
        FH_CONTENT_REVALIDATE_URL_OPTION,
        'Next.js 缓存刷新地址',
        static function (): void {
            printf('<input class="regular-text" type="url" name="%1$s" value="%2$s" placeholder="https://example.com/api/revalidate/wordpress">', esc_attr(FH_CONTENT_REVALIDATE_URL_OPTION), esc_attr((string) get_option(FH_CONTENT_REVALIDATE_URL_OPTION, '')));
        },
        'writing'
    );
    add_settings_field(
        FH_CONTENT_REVALIDATE_SECRET_OPTION,
        'Next.js 缓存刷新密钥',
        static function (): void {
            $configured = fh_content_revalidate_config()['secret'] !== '';
            printf('<input class="regular-text" type="password" autocomplete="new-password" name="%1$s" value="%2$s"><p class="description">%3$s；必须与 Next.js 的 WP_REVALIDATE_SECRET 一致。</p>', esc_attr(FH_CONTENT_REVALIDATE_SECRET_OPTION), esc_attr((string) get_option(FH_CONTENT_REVALIDATE_SECRET_OPTION, '')), $configured ? '已配置' : '未配置');
        },
        'writing'
    );
}

function fh_content_revalidate_self_check(): array
{
    $config = fh_content_revalidate_config();
    $queue = fh_content_revalidate_queue();
    $now = time();
    $due = 0;
    $stuck = 0;
    foreach ($queue as $entry) {
        if (!is_array($entry)) continue;
        if (($entry['next_at'] ?? PHP_INT_MAX) <= $now) $due++;
        if ((int) ($entry['attempts'] ?? 0) > 0) $stuck++;
    }

    return [
        'configured' => $config['url'] !== '' && $config['secret'] !== '',
        'url' => $config['url'],
        'secret_present' => $config['secret'] !== '',
        // Queue visibility: a growing `pending` means invalidations are not
        // reaching Next.js, which is exactly what used to go unnoticed.
        'queue_pending' => count($queue),
        'queue_due' => $due,
        'queue_retrying' => $stuck,
        'cron_scheduled' => (bool) wp_next_scheduled(FH_CONTENT_REVALIDATE_CRON_HOOK),
    ];
}

/** Expose the self-check through WP-CLI: `wp fh revalidate-status`. */
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('fh revalidate-status', static function (): void {
        WP_CLI::line((string) wp_json_encode(fh_content_revalidate_self_check(), JSON_PRETTY_PRINT));
    });
    WP_CLI::add_command('fh revalidate-retry', static function (): void {
        fh_content_revalidate_retry();
        WP_CLI::success('retry pass complete: ' . wp_json_encode(fh_content_revalidate_self_check()));
    });
}
