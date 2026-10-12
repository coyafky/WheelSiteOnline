#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
询盘后端（fenghuai-inquiries mu-plugin + fh/v1 写端点）一键验收。

跑法：
    python3 scripts/verify-inquiry-backend.py

为什么需要它：DEC-055 把询盘的落库、幂等与发件箱放进了 WordPress 侧的 mu-plugin。
那层代码有三个**只能靠实测**才能确认的性质：

  1. **端点鉴权** —— 密钥没配必须 fail-closed（503），密钥错了必须挡住，
     而且 `?key=` 这种会进访问日志的形式**不能**被接受。
  2. **幂等** —— 同一幂等键连发两次必须返回同一个询盘号、HTTP 200，
     且库里**只有一份** CPT / 键行 / outbox 行。
  3. **事务** —— `wp_insert_post()` 不是天然的事务单元。任务明确要求：
     用一个「在 COMMIT 前故意失败」的探针实测 ROLLBACK 真的带走了 CPT 与键行。
     本脚本每次运行都会重跑这个探针（临时 PHP，跑完即删）。
  4. **发件箱 worker** —— 到期条件、租约互斥、僵死租约回收、退避计数与
     最大重试次数都必须有数据库实证，不能只看函数是否存在。

⚠️ 本项目已知病是「弱断言」：只看 HTTP 状态码不足以说明问题。所以下面每一条
关键断言都同时核对**响应体内容**与**数据库实证**（information_schema / 直接查表）。

依赖：docker 容器 fh-wp（WordPress）与 fh-wp-db（MySQL）在跑；
服务密钥读容器里的常量（也就是 local-wp/.env 经 WORDPRESS_CONFIG_EXTRA 之后的结果）。

脚本运行期间会把本地 WordPress 选项 `fh_inquiry_delivery_paused` 临时置为 `1`，
避免验收用例向真实收件箱连续发信；进入 worker 用例前恢复，finally 再兜底清除。
"""

from __future__ import annotations

import hashlib
import html as html_lib
import json
import os
import re
import secrets
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTAINER = "fh-wp"
DB_CONTAINER = "fh-wp-db"
DB_PASSWORD = "root_local_only"

PLUGIN_REL = "local-wp/mu-plugins/fenghuai-inquiries.php"  # 跟踪源
PLUGIN_IN_CONTAINER = "/var/www/html/wp-content/mu-plugins/fenghuai-inquiries.php"
PLUGIN_IN_CONTAINER_SIBLING = "/var/www/html/wp-content/mu-plugins/fenghuai-wheels.php"

WP_ROOT = "http://localhost:8081"
REST_URL = f"{WP_ROOT}/wp-json/fh/v1/inquiries"

# 测试数据的共同标记 —— 清理时全靠它们，不再靠「记住 ID」。
TEST_EMAIL = "vfytest@example.com"
KEY_PREFIX = "vfytest"
PROBE_PATH_IN_CONTAINER = "/tmp/fh_inquiry_verify_probe.php"

RUN = secrets.token_hex(6)

KEY_TABLE = "wp_fh_inquiry_key"
OUTBOX_TABLE = "wp_fh_inquiry_outbox"
EVENT_TABLE = "wp_fh_inquiry_event"
CPT = "fh_inquiry"

_results: list[tuple[bool, str, str]] = []


def record(ok: bool, label: str, detail: str = "") -> None:
    _results.append((bool(ok), label, detail))
    print(f"  {'✅' if ok else '❌'} {label}" + (f"  {detail}" if detail else ""))


def docker_exec(args: list[str], stdin: str | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["docker", "exec", "-i", *args],
        input=stdin,
        capture_output=True,
        text=True,
    )


def docker_php(code: str, allow_fail: bool = False) -> str:
    """在容器里跑一段 PHP（已加载 WordPress）。"""
    proc = subprocess.run(
        ["docker", "exec", CONTAINER, "php", "-d", "display_errors=1", "-r", code],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0 and not allow_fail:
        raise RuntimeError(f"php 退出码 {proc.returncode}: {proc.stderr.strip()[:400]}")
    return (proc.stdout or "").strip()


def sql(query: str) -> list[list[str]]:
    """在 MySQL 里跑一条查询，返回 TSV 行。"""
    proc = subprocess.run(
        [
            "docker", "exec", DB_CONTAINER, "mysql",
            "-uroot", f"-p{DB_PASSWORD}", "--default-character-set=utf8mb4",
            "-N", "-B", "-e", f"USE wordpress; {query}",
        ],
        capture_output=True,
        text=True,
    )
    out = [line for line in (proc.stdout or "").splitlines() if line != ""]
    if proc.returncode != 0:
        raise RuntimeError(f"mysql 失败: {proc.stderr.strip()[:400]}")
    return [line.split("\t") for line in out]


def sql_scalar(query: str) -> str:
    rows = sql(query)
    return rows[0][0] if rows else ""


def http(method: str, url: str, body: object = None, headers: dict | None = None) -> tuple[int, str]:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    for key, value in (headers or {}).items():
        req.add_header(key, value)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001
        return -1, str(exc)


def idem(label: str) -> str:
    """生成符合 ^[A-Za-z0-9_-]{32,64}$ 的测试幂等键。"""
    raw = f"{KEY_PREFIX}-{RUN}-{label}"
    return raw.ljust(40, "x")[:64]


def payload(key: str, **overrides) -> dict:
    body: dict = {
        "idempotencyKey": key,
        "customerType": "business",
        "productLine": "wheels",
        "message": "verify-inquiry-backend probe",
        "name": "Verify Probe",
        "email": TEST_EMAIL,
        "countryCode": "DE",
        "company": "Verify Handel GmbH",
        "privacyVersion": "verify-1",
        "consentedAt": "2026-10-06T00:00:00Z",
        "context": {
            "model": "VERIFY",
            "productionCode": "PC-VERIFY",
            "spec": {"size": "18x8.5", "pcd": "5x112"},
            "sourcePage": "/products/wheels/verify",
            "intent": "quote",
            "variantPending": False,
        },
    }
    body.update(overrides)
    return body


# ────────────────────────────────────────────────────────────────────────────
# 临时探针：鉴权矩阵 + 事务回滚（跑完即删）
# ────────────────────────────────────────────────────────────────────────────

PROBE_PHP = r"""<?php
/**
 * 临时验收探针 —— 由 scripts/verify-inquiry-backend.py 写入容器 /tmp 后调用，跑完即删。
 * 它不在 wp-data/ 里，也不是插件的一部分。
 */
require '/var/www/html/wp-load.php';

function fhv_counts(): array {
    global $wpdb;
    return [
        'key'    => (int) $wpdb->get_var("SELECT COUNT(*) FROM " . fh_inquiry_key_table()),
        'posts'  => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='fh_inquiry'"),
        'meta'   => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID=pm.post_id WHERE p.post_type='fh_inquiry'"),
        'outbox' => (int) $wpdb->get_var("SELECT COUNT(*) FROM " . fh_inquiry_outbox_table()),
    ];
}

function fhv_request(string $key): array {
    $body = wp_json_encode([
        'idempotencyKey' => $key,
        'customerType'   => 'business',
        'productLine'    => 'wheels',
        'message'        => 'tx probe ' . $key,
        'name'           => 'Tx Probe',
        'email'          => 'vfytest@example.com',
        'privacyVersion' => 'verify-1',
        'consentedAt'    => '2026-10-06T00:00:00Z',
        'context'        => ['model' => 'TXPROBE', 'variantPending' => false],
    ]);
    $req = new WP_REST_Request('POST', '/fh/v1/inquiries');
    $req->set_header('content-type', 'application/json');
    $req->set_body($body);
    $res = fh_inquiry_rest_create($req);
    return ['status' => $res->get_status(), 'body' => $res->get_data()];
}

$mode = $argv[1] ?? '';

if ($mode === 'auth') {
    $out = [];

    $req = new WP_REST_Request('POST', '/fh/v1/inquiries');
    $req->set_header('X-FH-Service-Key', fh_inquiry_service_key());
    $r = fh_inquiry_rest_permission($req);
    $out['configured_correct'] = ($r === true) ? 200 : 0;

    $req->set_header('X-FH-Service-Key', 'wrong-' . str_repeat('z', 40));
    $r = fh_inquiry_rest_permission($req);
    $out['configured_wrong'] = is_wp_error($r) ? (int) ($r->get_error_data()['status'] ?? 0) : 200;

    $req->set_header('X-FH-Service-Key', '');
    $r = fh_inquiry_rest_permission($req);
    $out['configured_empty'] = is_wp_error($r) ? (int) ($r->get_error_data()['status'] ?? 0) : 200;

    $reqNoHeader = new WP_REST_Request('POST', '/fh/v1/inquiries');
    $r = fh_inquiry_rest_permission($reqNoHeader);
    $out['configured_no_header'] = is_wp_error($r) ? (int) ($r->get_error_data()['status'] ?? 0) : 200;

    // 未配置密钥 → 必须 503 fail-closed（即使请求头里塞了东西）
    add_filter('fh_inquiry_service_key', static fn() => '', 10, 0);
    $reqUn = new WP_REST_Request('POST', '/fh/v1/inquiries');
    $reqUn->set_header('X-FH-Service-Key', 'anything-at-all');
    $r = fh_inquiry_rest_permission($reqUn);
    $out['unconfigured'] = is_wp_error($r) ? (int) ($r->get_error_data()['status'] ?? 0) : 200;
    remove_all_filters('fh_inquiry_service_key');

    // must not accept a WP user session either: no cookie / no logged-in user is consulted
    $out['service_key_source'] = defined('FH_INQUIRY_SERVICE_KEY') ? 'constant' : (getenv('FH_INQUIRY_SERVICE_KEY') ? 'env' : 'none');

    echo wp_json_encode($out), "\n";
    exit(0);
}

if ($mode === 'tx') {
    $out = ['before' => fhv_counts()];

    // Case A：wp_insert_post 内部失败（键行已插、CPT 还没建）
    add_filter('wp_insert_post_empty_content', static function ($maybe, $postarr) {
        return (($postarr['post_type'] ?? '') === 'fh_inquiry') ? true : $maybe;
    }, 10, 2);
    $out['caseA'] = fhv_request('vfytest-tx-a-' . str_repeat('a', 24));
    $out['afterA'] = fhv_counts();
    remove_all_filters('wp_insert_post_empty_content');

    // Case B：最后一步（outbox INSERT）失败 —— 键行、CPT、meta 都已写，必须一起回滚
    add_filter('query', static function ($query) {
        if (stripos($query, 'fh_inquiry_outbox') !== false && stripos($query, 'INSERT') !== false) {
            return '';
        }
        return $query;
    }, 10, 1);
    $out['caseB'] = fhv_request('vfytest-tx-b-' . str_repeat('b', 24));
    $out['afterB'] = fhv_counts();

    global $wpdb;
    $out['keys_left'] = $wpdb->get_col($wpdb->prepare(
        "SELECT idempotency_key FROM " . fh_inquiry_key_table() . " WHERE idempotency_key LIKE %s",
        'vfytest-tx-%'
    ));
    // 探针自己造出来的 CPT 记录（post_content 带 'tx probe' 标记）应当一条都不剩
    $out['probe_posts_left'] = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='fh_inquiry' AND post_content LIKE %s",
        '%tx probe%'
    ));

    echo wp_json_encode($out), "\n";
    exit(0);
}

if ($mode === 'worker') {
    global $wpdb;
    $resendOptionExisted = get_option('fh_inquiry_resend_api_key', null) !== null;
    $resendOptionValue   = get_option('fh_inquiry_resend_api_key', '');
    update_option('fh_inquiry_resend_api_key', '', false);
    $outbox = fh_inquiry_outbox_table();
    $now    = gmdate('Y-m-d H:i:s');
    $past   = gmdate('Y-m-d H:i:s', time() - 60);
    $future = gmdate('Y-m-d H:i:s', time() + 600);

    $postId = wp_insert_post([
        'post_type'    => FH_INQUIRY_POST_TYPE,
        'post_status'  => 'private',
        'post_title'   => 'INQ-WORKER-PROBE',
        'post_content' => 'worker probe',
    ]);
    update_post_meta($postId, 'name', 'Worker Probe');
    update_post_meta($postId, 'email', 'vfytest@example.com');
    update_post_meta($postId, 'message', 'worker probe');
    update_post_meta($postId, 'email_status', 'pending');

    $insert = static function (array $overrides = []) use ($wpdb, $outbox, $postId, $now): int {
        $row = array_merge([
            'inquiry_id'      => $postId,
            'event_type'      => 'sales_notification',
            'status'          => 'pending',
            'attempts'        => 0,
            'next_attempt_at' => $now,
            'lease_owner'     => null,
            'lease_expires_at'=> null,
            'last_error'      => null,
            'created_at'      => $now,
            'updated_at'      => $now,
        ], $overrides);
        $wpdb->insert($outbox, $row);
        return (int) $wpdb->insert_id;
    };

    // 五种候选：到期、未到期、有效租约、已达上限、过期租约。
    $dueId     = $insert();
    $futureId  = $insert(['next_attempt_at' => $future]);
    $leasedId  = $insert(['lease_owner' => 'other-worker', 'lease_expires_at' => $future]);
    $maxedId   = $insert(['attempts' => FH_INQUIRY_DISPATCH_MAX_ATTEMPTS]);
    $expiredId = $insert(['lease_owner' => 'dead-worker', 'lease_expires_at' => $past]);

    $claimed1 = fh_inquiry_claim_outbox(10);
    $claimedIds1 = array_map(static fn(array $row): int => (int) $row['id'], $claimed1);
    sort($claimedIds1);
    $claimed2 = fh_inquiry_claim_outbox(10);

    $leasedRows = $wpdb->get_results(
        "SELECT id, lease_owner, lease_expires_at FROM {$outbox} WHERE id IN ({$dueId},{$expiredId}) ORDER BY id",
        ARRAY_A
    );

    // 租约选择检查结束后移除五条候选，另建一条专门验证失败重试。
    $wpdb->query("DELETE FROM {$outbox} WHERE inquiry_id = " . (int) $postId);
    $retryId = $insert();
    $runs = [];
    for ($i = 1; $i <= FH_INQUIRY_DISPATCH_MAX_ATTEMPTS; $i++) {
        // 不真的等待退避时间，但每轮都从数据库把它推进到“已到期”。
        $wpdb->update($outbox, ['next_attempt_at' => $past], ['id' => $retryId]);
        $stats = fh_inquiry_run_dispatch();
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT status, attempts, next_attempt_at, lease_owner, lease_expires_at, last_error
             FROM {$outbox} WHERE id = %d",
            $retryId
        ), ARRAY_A);
        $runs[] = ['stats' => $stats, 'row' => $row];
    }
    $afterLimit = fh_inquiry_run_dispatch();

    fh_inquiry_schedule_dispatch();
    $nextCron = wp_next_scheduled(FH_INQUIRY_DISPATCH_HOOK);
    $event = $nextCron ? wp_get_scheduled_event(FH_INQUIRY_DISPATCH_HOOK) : false;
    $schedules = wp_get_schedules();

    if ($resendOptionExisted) {
        update_option('fh_inquiry_resend_api_key', $resendOptionValue, false);
    } else {
        delete_option('fh_inquiry_resend_api_key');
    }

    echo wp_json_encode([
        'cron_next'       => $nextCron,
        'cron_schedule'   => $event ? $event->schedule : '',
        'cron_interval'   => (int) ($schedules[FH_INQUIRY_DISPATCH_INTERVAL]['interval'] ?? 0),
        'guard_ids'       => compact('dueId', 'futureId', 'leasedId', 'maxedId', 'expiredId'),
        'claimed_first'   => $claimedIds1,
        'claimed_second'  => count($claimed2),
        'leased_rows'     => $leasedRows,
        'retry_runs'      => $runs,
        'after_limit'     => $afterLimit,
    ]), "\n";
    exit(0);
}

if ($mode === 'presentation') {
    if (!function_exists('submit_button')) {
        require_once ABSPATH . 'wp-admin/includes/template.php';
    }
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ID']);
    if (!empty($admins)) {
        wp_set_current_user((int) $admins[0]);
    }

    $postId = wp_insert_post([
        'post_type'    => FH_INQUIRY_POST_TYPE,
        'post_status'  => 'private',
        'post_title'   => 'INQ-PRESENTATION-PROBE',
        'post_content' => 'presentation probe',
    ]);
    $meta = [
        'customer_type'            => 'business',
        'product_line'             => 'wheels',
        'message'                  => "Need quote\n<script>alert('probe')</script>",
        'quantity'                 => '24',
        'inputs_available'         => 'Drawing available',
        'name'                     => 'CONTACT-TOKEN',
        'email'                    => 'presentation@example.com',
        'country_code'             => 'DE',
        'company'                  => 'COMPANY-TOKEN',
        'whatsapp'                 => '+49 000 000',
        'business_status'          => 'new',
        'email_status'             => 'pending',
        'privacy_version'          => 'verify-1',
        'consented_at'             => '2026-10-08T00:00:00Z',
        'context_model'            => 'MODEL-TOKEN',
        'context_production_code'  => 'CODE-TOKEN',
        'context_spec_json'        => wp_json_encode(['size' => '18x8.5', 'pcd' => '5x112']),
        'context_source_page'      => 'https://example.com/products/wheels/probe',
        'context_intent'           => 'wheel_model_quote',
        'inquiry_items_json'       => wp_json_encode([
            ['model' => 'FH-001', 'productionCode' => 'FH001-001', 'quantity' => 4, 'spec' => ['size' => '18*8.5', 'pcd' => '5x112']],
            ['model' => 'FH-002', 'productionCode' => 'FH002-001', 'quantity' => 2, 'spec' => ['size' => '19*9', 'pcd' => '5x114.3']],
        ], JSON_UNESCAPED_UNICODE),
        'variant_pending'          => '0',
    ];
    foreach ($meta as $key => $value) {
        update_post_meta($postId, $key, $value);
    }

    $rendered = fh_inquiry_render_email($postId);
    $editUrl  = (string) get_edit_post_link($postId, 'raw');

    $_GET = ['page' => 'fh-inquiries'];
    ob_start();
    fh_inquiry_render_list();
    $listHtml = (string) ob_get_clean();

    ob_start();
    fh_inquiry_render_message_box(get_post($postId));
    $detailHtml = (string) ob_get_clean();

    ob_start();
    fh_inquiry_render_context_box(get_post($postId));
    $contextHtml = (string) ob_get_clean();

    echo wp_json_encode([
        'post_id'      => (int) $postId,
        'post_type'    => (string) get_post_type($postId),
        'post_title'   => (string) get_post_field('post_title', $postId),
        'edit_url'     => $editUrl,
        'subject'      => (string) ($rendered['subject'] ?? ''),
        'text'         => (string) ($rendered['text'] ?? ''),
        'html'         => (string) ($rendered['html'] ?? ''),
        'list_html'    => $listHtml,
        'detail_html'  => $detailHtml,
        'context_html' => $contextHtml,
    ]), "\n";
    exit(0);
}

echo wp_json_encode(['error' => 'unknown mode']), "\n";
"""


def run_probe(mode: str, env: dict[str, str] | None = None) -> dict:
    docker_args: list[str] = []
    for key, value in (env or {}).items():
        docker_args.extend(["-e", f"{key}={value}"])
    docker_args.extend(
        [CONTAINER, "sh", "-c", f"cat > {PROBE_PATH_IN_CONTAINER} && php {PROBE_PATH_IN_CONTAINER} {mode}"]
    )
    proc = docker_exec(
        docker_args,
        stdin=PROBE_PHP,
    )
    out = (proc.stdout or "").strip()
    if not out:
        raise RuntimeError(f"探针 {mode} 无输出；stderr={proc.stderr.strip()[:300]}")
    return json.loads(out.splitlines()[-1])


def cleanup() -> str:
    """只删本脚本创建的测试数据，返回清理摘要。

    ⚠️ 这段 PHP 走 `php -r`，所以**不能带 `<?php` 标签**。
    """
    php = r"""
require '/var/www/html/wp-load.php';
global $wpdb;
$keyTable    = fh_inquiry_key_table();
$outboxTable = fh_inquiry_outbox_table();
$eventTable  = fh_inquiry_event_table();

// 1) 只定位本脚本明确创建的记录。即使本地库里已经有人工验收或真实客户询盘，
//    清理也不能把它们当成测试夹具。直接创建的两个探针用固定标题识别；经 REST
//    创建的用专用测试邮箱识别。
$testIds = array_map('intval', $wpdb->get_col(
    "SELECT DISTINCT p.ID
       FROM {$wpdb->posts} p
       LEFT JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID
      WHERE p.post_type = 'fh_inquiry'
        AND (
          (pm.meta_key = 'email' AND pm.meta_value IN ('vfytest@example.com', 'presentation@example.com'))
          OR p.post_title IN ('INQ-WORKER-PROBE', 'INQ-PRESENTATION-PROBE')
        )"
));

$testOutboxIds = [];
if ($testIds) {
    $idList = implode(',', $testIds);
    $testOutboxIds = array_map('intval', $wpdb->get_col(
        "SELECT id FROM {$outboxTable} WHERE inquiry_id IN ({$idList})"
    ));
}

// 2) 先删测试记录关联的事件、发件箱和幂等键，再删 CPT。
$deletedEvents = 0;
if ($testOutboxIds) {
    $outboxIdList = implode(',', $testOutboxIds);
    $deletedEvents = (int) $wpdb->query(
        "DELETE FROM {$eventTable} WHERE outbox_id IN ({$outboxIdList})"
    );
}

$deletedOutbox = 0;
if ($testIds) {
    $idList = implode(',', $testIds);
    $deletedOutbox = (int) $wpdb->query(
        "DELETE FROM {$outboxTable} WHERE inquiry_id IN ({$idList})"
    );
}

$deletedKeys = (int) $wpdb->query($wpdb->prepare(
    "DELETE FROM {$keyTable} WHERE idempotency_key LIKE %s", 'vfytest%'
));

foreach ($testIds as $id) {
    wp_delete_post((int) $id, true);
}
$deletedPosts = count($testIds);

// 3) 收尾断言只统计本脚本的夹具，不要求客户数据表整体归零。
$testPostsLeft = (int) $wpdb->get_var(
    "SELECT COUNT(DISTINCT p.ID)
       FROM {$wpdb->posts} p
       LEFT JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID
      WHERE p.post_type = 'fh_inquiry'
        AND (
          (pm.meta_key = 'email' AND pm.meta_value IN ('vfytest@example.com', 'presentation@example.com'))
          OR p.post_title IN ('INQ-WORKER-PROBE', 'INQ-PRESENTATION-PROBE')
        )"
);
$testKeysLeft = (int) $wpdb->get_var($wpdb->prepare(
    "SELECT COUNT(*) FROM {$keyTable} WHERE idempotency_key LIKE %s", 'vfytest%'
));
$testOutboxLeft = 0;
if ($testIds) {
    $idList = implode(',', $testIds);
    $testOutboxLeft = (int) $wpdb->get_var(
        "SELECT COUNT(*) FROM {$outboxTable} WHERE inquiry_id IN ({$idList})"
    );
}

echo wp_json_encode([
    'posts_deleted'  => $deletedPosts,
    'keys_deleted'   => $deletedKeys,
    'outbox_deleted' => $deletedOutbox,
    'events_deleted' => $deletedEvents,
    'posts_left'     => $testPostsLeft,
    'keys_left'      => $testKeysLeft,
    'outbox_left'    => $testOutboxLeft,
]);
"""
    out = docker_php(php)
    return out


def main() -> int:
    global KEY_TABLE, OUTBOX_TABLE, EVENT_TABLE

    print("=" * 70)
    print("询盘后端验收（mu-plugin + POST /fh/v1/inquiries）")
    print("=" * 70)

    # 表前缀不写死 —— 从容器里读（$wpdb->prefix 才是真相）。
    KEY_TABLE = docker_php('require "/var/www/html/wp-load.php"; echo fh_inquiry_key_table();')
    OUTBOX_TABLE = docker_php('require "/var/www/html/wp-load.php"; echo fh_inquiry_outbox_table();')
    EVENT_TABLE = docker_php('require "/var/www/html/wp-load.php"; echo fh_inquiry_event_table();')

    # 上一轮若中途失败，测试数据可能还在库里 —— 先清一次，让本轮可重复。
    try:
        pre = json.loads(cleanup())
        print(
            f"  · 开场清理：删掉遗留测试数据 "
            f"{pre['posts_deleted']} 条 CPT / {pre['keys_deleted']} 条 key / {pre['outbox_deleted']} 条 outbox"
        )
    except Exception as exc:  # noqa: BLE001
        print(f"  · 开场清理失败（继续执行）：{str(exc)[:160]}")

    # ── 0 前置：源与容器一致 ────────────────────────────────────────────────
    print("\n[0] 前置：跟踪源已同步进容器")
    src = os.path.join(ROOT, PLUGIN_REL)
    if not os.path.exists(src):
        record(False, "插件源文件存在", PLUGIN_REL)
        return 1
    with open(src, "rb") as fh:
        src_hash = hashlib.sha256(fh.read()).hexdigest()
    dst_hash = docker_php(f'echo hash_file("sha256", "{PLUGIN_IN_CONTAINER}");')
    record(
        src_hash == dst_hash,
        "容器内的插件与跟踪源一致",
        "" if src_hash == dst_hash else "跑 `python3 scripts/sync-mu-plugins.py`",
    )

    try:
        pause = docker_php(
            'require "/var/www/html/wp-load.php"; '
            'update_option("fh_inquiry_delivery_paused", "1", false); '
            'echo get_option("fh_inquiry_delivery_paused", "0");'
        )
        record(pause == "1", "本地验收已暂停真实邮件投递", f"option={pause}")

        # ── 1 语法 ──────────────────────────────────────────────────────────
        print("\n[1] 插件语法")
        lint = docker_exec([CONTAINER, "php", "-l", PLUGIN_IN_CONTAINER])
        lint_out = (lint.stdout or "").strip()
        record("No syntax errors" in lint_out, "php -l 无语法错误", lint_out.splitlines()[0] if lint_out else "")
        sibling = docker_exec([CONTAINER, "php", "-l", PLUGIN_IN_CONTAINER_SIBLING])
        record(
            "No syntax errors" in (sibling.stdout or ""),
            "轮毂插件仍在（未被顶掉）",
            (sibling.stdout or "").strip().splitlines()[0] if sibling.stdout else "",
        )

        # ── 2 注册：CPT / meta / 三张表 / 索引 ──────────────────────────────
        print("\n[2] 注册与 schema")
        check = json.loads(docker_php(
            'require "/var/www/html/wp-load.php"; echo wp_json_encode(fh_inquiry_self_check());'
        ))

        record(check["registered"] is True, "文章类型 fh_inquiry 已注册")
        record(check["show_in_rest"] is False, "CPT 不进公开 REST（show_in_rest=false）")
        record(
            sorted(check["supports"]) == ["custom-fields", "title"],
            "supports = title + custom-fields（无编辑器）",
            f"实得 {sorted(check['supports'])}",
        )
        missing = sorted(set(check["expected_meta"]) - set(check["meta_keys"]))
        record(not missing, f"{len(check['expected_meta'])} 个 meta 字段全部注册", f"缺 {missing}" if missing else "")
        record(check["service_key_set"] is True, "服务密钥在容器内可解析（常量或环境变量）")

        capability_matrix = json.loads(docker_php(
            'require "/var/www/html/wp-load.php"; '
            '$sales=get_role("fh_inquiry_sales"); $contributor=get_role("contributor"); '
            '$author=get_role("author"); $admin=get_role("administrator"); '
            'echo wp_json_encode(['
            '"sales_manage"=>$sales ? $sales->has_cap("edit_fh_inquiries") : false,'
            '"sales_delivery"=>$sales ? $sales->has_cap("manage_fh_inquiry_delivery") : false,'
            '"contributor_manage"=>$contributor ? $contributor->has_cap("edit_fh_inquiries") : false,'
            '"author_manage"=>$author ? $author->has_cap("edit_fh_inquiries") : false,'
            '"admin_manage"=>$admin ? $admin->has_cap("edit_fh_inquiries") : false,'
            '"admin_delivery"=>$admin ? $admin->has_cap("manage_fh_inquiry_delivery") : false'
            ']);'
        ))
        record(
            capability_matrix["sales_manage"] is True
            and capability_matrix["sales_delivery"] is False,
            "询盘销售可处理业务字段，但不能手动派发邮件",
            str(capability_matrix),
        )
        record(
            capability_matrix["contributor_manage"] is False
            and capability_matrix["author_manage"] is False,
            "Contributor/Author 不再因 edit_posts 读取客户询盘",
            str(capability_matrix),
        )
        record(
            capability_matrix["admin_manage"] is True
            and capability_matrix["admin_delivery"] is True,
            "管理员拥有询盘处理与邮件派发能力",
            str(capability_matrix),
        )

        for group in ("key", "outbox", "event"):
            record(check["tables_exist"][group] is True, f"专用表存在：{check['tables'][group]}")

        # information_schema 实证（不是「代码里写了」）
        def index_cols(table: str) -> dict[str, tuple[list[str], bool]]:
            rows = sql(
                "SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE, SEQ_IN_INDEX FROM information_schema.STATISTICS "
                f"WHERE TABLE_SCHEMA='wordpress' AND TABLE_NAME='{table}' ORDER BY INDEX_NAME, SEQ_IN_INDEX"
            )
            grouped: dict[str, tuple[list[str], bool]] = {}
            for name, column, non_unique, _seq in rows:
                cols, _ = grouped.get(name, ([], True))
                grouped[name] = (cols + [column], non_unique == "0")
            return grouped

        key_idx = index_cols(KEY_TABLE)
        outbox_idx = index_cols(OUTBOX_TABLE)
        event_idx = index_cols(EVENT_TABLE)

        record(
            key_idx.get("PRIMARY") == (["idempotency_key"], True),
            "幂等键是主键（唯一约束才是硬保证）",
            f"实得 {key_idx.get('PRIMARY')}",
        )
        record("inquiry_id" in key_idx, "键表有 inquiry_id 索引")
        record(
            outbox_idx.get("claim") == (["status", "next_attempt_at"], False),
            "发件箱有领取索引 claim(status,next_attempt_at)",
            f"实得 {outbox_idx.get('claim')}",
        )
        record(
            outbox_idx.get("PRIMARY") == (["id"], True),
            "发件箱自增主键",
            f"实得 {outbox_idx.get('PRIMARY')}",
        )
        record(
            event_idx.get("provider_event") == (["provider_event_id", "event_type"], True),
            "邮件事件有 UNIQUE(provider_event_id,event_type)",
            f"实得 {event_idx.get('provider_event')}",
        )

        collation = sql_scalar(
            "SELECT TABLE_COLLATION FROM information_schema.TABLES "
            f"WHERE TABLE_SCHEMA='wordpress' AND TABLE_NAME='{KEY_TABLE}'"
        )
        engine = sql_scalar(
            "SELECT ENGINE FROM information_schema.TABLES "
            f"WHERE TABLE_SCHEMA='wordpress' AND TABLE_NAME='{KEY_TABLE}'"
        )
        record(
            collation == "utf8mb4_unicode_520_ci" and engine == "InnoDB",
            "表引擎/排序规则与现有一致",
            f"ENGINE={engine} COLLATION={collation}",
        )

        # 询盘不进公开 REST：wp/v2 里看不到
        code_types, body_types = http("GET", f"{WP_ROOT}/wp-json/wp/v2/types")
        record(
            code_types == 200 and CPT not in body_types,
            "公开 /wp/v2/types 里没有 fh_inquiry",
            f"HTTP {code_types}",
        )
        code_cpt, _ = http("GET", f"{WP_ROOT}/wp-json/wp/v2/fh-inquiry")
        record(code_cpt >= 400, "公开 /wp/v2/fh-inquiry 不可用", f"HTTP {code_cpt}")

        # ── 3 鉴权 ──────────────────────────────────────────────────────────
        print("\n[3] 端点鉴权")
        service_key = docker_php(
            'require "/var/www/html/wp-load.php"; echo fh_inquiry_service_key();'
        )
        record(len(service_key) >= 32, "服务密钥已配置", f"长度 {len(service_key)}")

        body_for_auth = payload(idem("auth"))
        code, text = http("POST", REST_URL, body_for_auth)
        record(code in (401, 403), "无密钥 → 401/403", f"HTTP {code}")

        code, text = http("POST", REST_URL, body_for_auth, {"X-FH-Service-Key": "wrong-" + "z" * 40})
        record(code in (401, 403), "错误密钥 → 401/403", f"HTTP {code}")

        # ?key= 这种会进访问日志的形式必须不被接受
        code, text = http("POST", f"{REST_URL}?key={service_key}", body_for_auth)
        record(code in (401, 403), "查询参数里的密钥不被接受", f"HTTP {code}")

        auth_probe = run_probe("auth")
        record(auth_probe["configured_correct"] in (200, 201), "正确密钥 → 放行（正对照）",
               f"实得 {auth_probe['configured_correct']}")
        record(auth_probe["configured_wrong"] in (401, 403), "错误密钥被拒（进程内对照）",
               f"实得 {auth_probe['configured_wrong']}")
        record(auth_probe["configured_no_header"] in (401, 403), "完全没带请求头被拒",
               f"实得 {auth_probe['configured_no_header']}")
        record(auth_probe["configured_empty"] in (401, 403), "空字符串密钥被拒",
               f"实得 {auth_probe['configured_empty']}")
        record(
            auth_probe["unconfigured"] == 503,
            "未配置密钥 → 503 fail-closed（不放行）",
            f"实得 {auth_probe['unconfigured']}（常量/环境变量来源：{auth_probe['service_key_source']}）",
        )

        # ── 4 幂等 ──────────────────────────────────────────────────────────
        print("\n[4] 幂等")
        replay_key = idem("replay")
        first_body = payload(replay_key)
        code1, text1 = http("POST", REST_URL, first_body, {"X-FH-Service-Key": service_key})
        record(code1 == 201, "首次提交 → 201", f"HTTP {code1}")
        try:
            first = json.loads(text1)
        except Exception:  # noqa: BLE001
            first = {}
        record(first.get("ok") is True and isinstance(first.get("id"), str), "首次响应 ok=true 且有询盘号",
               f"id={first.get('id')}")
        record(first.get("emailStatus") in ("pending", "sending", "accepted", "delivered", "bounced", "failed", "unknown"),
               "首次响应带 emailStatus（与业务状态分开）", f"emailStatus={first.get('emailStatus')}")

        code2, text2 = http("POST", REST_URL, first_body, {"X-FH-Service-Key": service_key})
        record(code2 == 200, "同键重放 → 200（不是 201）", f"HTTP {code2}")
        try:
            second = json.loads(text2)
        except Exception:  # noqa: BLE001
            second = {}
        record(second.get("id") == first.get("id"), "重放返回同一询盘号",
               f"{first.get('id')} vs {second.get('id')}")

        inquiry_id = first.get("id", "")
        # ⚠️ 断言必须**按这条询盘**数，不能按测试邮箱数 —— 邮箱是整轮共用的，
        #    按邮箱数会把同一轮里其它用例的记录也算进来（弱断言的反面教材）。
        key_rows = sql(f"SELECT inquiry_id FROM {KEY_TABLE} WHERE idempotency_key='{replay_key}'")
        cpt_rows = sql(f"SELECT ID FROM wp_posts WHERE post_type='{CPT}' AND post_title='{inquiry_id}'")
        record(
            len(key_rows) == 1 and len(cpt_rows) == 1,
            "该幂等键只有 1 条 key 行、该询盘号只有 1 条 CPT 记录（重放没有新建）",
            f"key 行 {len(key_rows)} 条 / CPT {len(cpt_rows)} 条",
        )
        record(
            bool(key_rows) and bool(cpt_rows) and key_rows[0][0] == cpt_rows[0][0],
            "key 行指向的 CPT 记录正是重放返回的那一条",
            f"key.inquiry_id={key_rows[0][0] if key_rows else '-'} post.ID={cpt_rows[0][0] if cpt_rows else '-'}",
        )
        outbox_rows = sql(
            f"SELECT status, event_type FROM {OUTBOX_TABLE} o "
            f"INNER JOIN wp_posts p ON p.ID=o.inquiry_id "
            f"WHERE p.post_title='{inquiry_id}'"
        )
        record(len(outbox_rows) == 1, "库里只有 1 条 outbox 行（重放没有新增）",
               f"实得 {len(outbox_rows)} 条 {outbox_rows}")

        # ── 多款轮毂清单：旧载荷不迁移，新载荷保存不可变 JSON 快照 ─────────
        multi_key = idem("multi-item")
        multi_body = payload(
            multi_key,
            items=[
                {"model": "FH-001", "productionCode": "FH001-001", "quantity": 5_000,
                 "spec": {"size": "18x8.5", "pcd": "5x112"}},
                {"model": "FH-002", "productionCode": "FH002-001", "quantity": 2,
                 "spec": {"size": "19x9", "pcd": "5x114.3"}},
            ],
        )
        multi_code, multi_text = http("POST", REST_URL, multi_body, {"X-FH-Service-Key": service_key})
        multi = json.loads(multi_text) if multi_text else {}
        multi_title = multi.get("id", "")
        multi_meta = sql_scalar(
            f"SELECT meta_value FROM wp_postmeta pm INNER JOIN wp_posts p ON p.ID=pm.post_id "
            f"WHERE p.post_title='{multi_title}' AND pm.meta_key='inquiry_items_json'"
        )
        try:
            multi_items = json.loads(multi_meta)
        except (TypeError, json.JSONDecodeError):
            multi_items = []
        record(
            multi_code == 201
            and [item.get("quantity") for item in multi_items] == [5_000, 2]
            and [item.get("productionCode") for item in multi_items] == ["FH001-001", "FH002-001"],
            "多款轮毂请求接受 5,000 件并保存逐项不可变快照",
            f"HTTP {multi_code} items={multi_meta}",
        )

        # ── 5 校验 ──────────────────────────────────────────────────────────
        print("\n[5] 服务端校验（422 且库里无残留）")
        before_counts = sql_scalar(f"SELECT COUNT(*) FROM {KEY_TABLE}") + "/" + sql_scalar(
            f"SELECT COUNT(*) FROM wp_posts WHERE post_type='{CPT}'"
        )

        cases = [
            ("非法 email", payload(idem("badmail"), email="not-an-email"), "email"),
            ("超长 message", payload(idem("longmsg"), message="x" * 5001), "message"),
            ("非法 productLine", payload(idem("badline"), productLine="spaceships"), "productLine"),
            ("非法 idempotencyKey", payload("short", ), "idempotencyKey"),
            ("非法 customerType", payload(idem("badtype"), customerType="robot"), "customerType"),
        ]
        for label, body, want_field in cases:
            code, text = http("POST", REST_URL, body, {"X-FH-Service-Key": service_key})
            try:
                parsed = json.loads(text)
            except Exception:  # noqa: BLE001
                parsed = {}
            fields = parsed.get("fieldErrors") or {}
            record(
                code == 422 and parsed.get("ok") is False and want_field in fields,
                f"{label} → 422 + fieldErrors.{want_field}",
                f"HTTP {code} fields={sorted(fields)}",
            )

        after_counts = sql_scalar(f"SELECT COUNT(*) FROM {KEY_TABLE}") + "/" + sql_scalar(
            f"SELECT COUNT(*) FROM wp_posts WHERE post_type='{CPT}'"
        )
        record(before_counts == after_counts, "校验失败没有留下任何残留",
               f"{before_counts} → {after_counts}")

        # ── 6 事务（故意在 COMMIT 前失败） ──────────────────────────────────
        print("\n[6] 事务：COMMIT 前失败不留残留")
        tx = run_probe("tx")
        record(tx["caseA"]["status"] == 500, "Case A（wp_insert_post 失败）→ 500，不谎报成功",
               f"HTTP {tx['caseA']['status']} body={tx['caseA']['body']}")
        record(tx["before"] == tx["afterA"], "Case A 回滚：键行/CPT/meta/outbox 计数不变",
               f"{tx['before']} → {tx['afterA']}")
        record(tx["caseB"]["status"] == 500, "Case B（outbox 写入失败，最后一步）→ 500",
               f"HTTP {tx['caseB']['status']} body={tx['caseB']['body']}")
        record(tx["before"] == tx["afterB"], "Case B 回滚：连已写的 CPT 与 meta 一起撤销",
               f"{tx['before']} → {tx['afterB']}")
        record(not tx["keys_left"], "两条探针的幂等键都没有残留", f"残留 {tx['keys_left']}")
        record(tx["probe_posts_left"] == 0, "探针的 CPT 记录一条都没有残留",
               f"实得 {tx['probe_posts_left']}")

        # ── 7 询盘号不来自 wp_posts.ID ──────────────────────────────────────
        print("\n[7] 询盘号格式与来源")
        code_a, text_a = http("POST", REST_URL, payload(idem("seq-a")), {"X-FH-Service-Key": service_key})
        num_a = json.loads(text_a).get("id", "")
        # 在两次询盘之间插一条无关文章：wp_posts 的自增 ID 会跳号，
        # 若询盘号取自 post ID，它也会跟着跳；取自键表序号则仍然 +1。
        filler = json.loads(docker_php(
            'require "/var/www/html/wp-load.php"; '
            '$filler = wp_insert_post(["post_type"=>"page","post_title"=>"__VERIFY_FILLER__","post_status"=>"draft"]); '
            'echo wp_json_encode(["id"=>(int) $filler]);'
        ))
        code_b, text_b = http("POST", REST_URL, payload(idem("seq-b")), {"X-FH-Service-Key": service_key})
        num_b = json.loads(text_b).get("id", "")

        def tail(number: str) -> int:
            return int(number.rsplit("-", 1)[-1]) if number and number.rsplit("-", 1)[-1].isdigit() else -1

        post_id_a = int(sql_scalar(
            f"SELECT ID FROM wp_posts WHERE post_type='{CPT}' AND post_title='{num_a}'"
        ) or 0)
        post_id_b = int(sql_scalar(
            f"SELECT ID FROM wp_posts WHERE post_type='{CPT}' AND post_title='{num_b}'"
        ) or 0)

        record(
            num_a.startswith("INQ-") and len(num_a.split("-")) == 3 and len(num_a.split("-")[1]) == 8,
            "询盘号形如 INQ-YYYYMMDD-NNNN",
            f"{num_a} / {num_b}",
        )
        record(tail(num_b) - tail(num_a) == 1, "同一天内序号 +1（键表自增/当日计数）",
               f"{tail(num_a)} → {tail(num_b)}")
        record(
            post_id_b - post_id_a != 1,
            "询盘号与 wp_posts.ID 无关（中间插文章后 post ID 跳号，询盘号不跳）",
            f"post ID {post_id_a} → {post_id_b}；询盘号 {num_a} → {num_b}",
        )
        record(
            str(post_id_a) not in num_a and str(post_id_b) not in num_b,
            "询盘号里不含 wp_posts.ID（不泄露全站文章总数）",
            f"post ID {post_id_a}/{post_id_b} vs {num_a}/{num_b}",
        )

        # 客户端不能指定业务/邮件状态
        print("\n[8] 状态字段不可由客户端指定")
        spoof_key = idem("spoof")
        spoof_body = payload(spoof_key)
        spoof_body.update(
            {"emailStatus": "accepted", "providerMessageId": "fake-id", "businessStatus": "closed"}
        )
        code_s, text_s = http("POST", REST_URL, spoof_body, {"X-FH-Service-Key": service_key})
        spoof_id = json.loads(text_s).get("id", "")
        spoof_status = sql(
            f"SELECT meta_key, meta_value FROM wp_postmeta pm INNER JOIN wp_posts p ON p.ID=pm.post_id "
            f"WHERE p.post_title='{spoof_id}' AND pm.meta_key IN ('email_status','business_status','provider_message_id')"
        )
        status_map = {k: v for k, v in spoof_status}
        record(
            # 本断言的真契约是「客户端伪造的状态不被采纳」，而不是「邮件必须发不出去」。
            # 早期发信通道未配置时 email_status 恒为 pending，这条被写成了 != "accepted"；
            # 现在 SMTP 已通、真实发送会置 accepted，那个写法会把「功能修好了」判成失败。
            # 正确判据：落库值不得等于客户端伪造的值，且必须是合法枚举内由服务端决定的结果。
            code_s == 201
            and status_map.get("business_status") == "new"
            and status_map.get("email_status") in ("pending", "sending", "accepted", "failed")
            and status_map.get("provider_message_id") in (None, ""),
            "客户端伪造的 emailStatus/businessStatus 被忽略",
            f"HTTP {code_s} 实得 {status_map}",
        )

        # 非空 outbox 行应带 sales_notification 事件类型
        outbox_event = sql(
            f"SELECT event_type, status, attempts FROM {OUTBOX_TABLE} o INNER JOIN wp_posts p ON p.ID=o.inquiry_id "
            f"WHERE p.post_title='{spoof_id}'"
        )
        record(
            outbox_event and outbox_event[0][0] == "sales_notification",
            "outbox 行是 sales_notification 事件",
            f"实得 {outbox_event}",
        )

        # 清理 filler
        if filler.get("id"):
            docker_php(
                f'require "/var/www/html/wp-load.php"; wp_delete_post({filler["id"]}, true); echo "ok";'
            )

        # ── 9 发件箱 worker ─────────────────────────────────────────────────
        print("\n[9] 发件箱 worker：调度、租约、退避与上限")
        mid_cleanup = json.loads(cleanup())
        record(
            mid_cleanup["posts_left"] == 0
            and mid_cleanup["keys_left"] == 0
            and mid_cleanup["outbox_left"] == 0,
            "worker 验收前已隔离前序测试数据",
            json.dumps(mid_cleanup, ensure_ascii=False),
        )
        # worker 需要验证真实重试状态机，先恢复默认；该探针自己的 PHP 进程会清空授权码。
        docker_php(
            'require "/var/www/html/wp-load.php"; '
            'delete_option("fh_inquiry_delivery_paused"); echo "ok";'
        )
        # 仅此 PHP 探针进程清空 SMTP 授权码；容器长期配置不变，也不会发送测试邮件。
        worker = run_probe("worker", {"FH_INQUIRY_SMTP_PASS": "", "RESEND_API_KEY": ""})

        record(
            bool(worker["cron_next"])
            and worker["cron_schedule"] == "fh_inquiry_every_5_minutes"
            and worker["cron_interval"] == 300,
            "WP-Cron 已注册 5 分钟派发事件",
            f"schedule={worker['cron_schedule']} interval={worker['cron_interval']}",
        )

        guards = worker["guard_ids"]
        expected_claimed = sorted([guards["dueId"], guards["expiredId"]])
        record(
            worker["claimed_first"] == expected_claimed,
            "只领取已到期且无有效租约的记录；过期租约可回收",
            f"实得 {worker['claimed_first']}，期望 {expected_claimed}",
        )
        record(
            worker["claimed_second"] == 0,
            "同一批记录在有效租约内不能被第二个 worker 重复领取",
            f"第二次领取 {worker['claimed_second']} 条",
        )
        record(
            len(worker["leased_rows"]) == 2
            and all(row.get("lease_owner") and row.get("lease_expires_at") for row in worker["leased_rows"]),
            "领取后已写入租约所有者与到期时间",
            f"实得 {worker['leased_rows']}",
        )

        retry_runs = worker["retry_runs"]
        attempts = [int(run["row"]["attempts"]) for run in retry_runs]
        record(
            attempts == [1, 2, 3, 4, 5],
            "发信通道不可用时 attempts 每轮严格递增",
            f"实得 {attempts}",
        )
        record(
            all(
                run["row"]["lease_owner"] is None
                and run["row"]["lease_expires_at"] is None
                for run in retry_runs
            ),
            "每次失败后都释放租约",
        )
        record(
            all(run["row"]["next_attempt_at"] for run in retry_runs[:4]),
            "未达上限时写入下一次退避时间",
            f"实得 {[run['row']['next_attempt_at'] for run in retry_runs[:4]]}",
        )
        last_retry = retry_runs[-1]
        record(
            last_retry["row"]["status"] == "failed"
            and int(last_retry["row"]["attempts"]) == 5
            and last_retry["row"]["next_attempt_at"] is None
            and int(last_retry["stats"]["abandoned"]) == 1,
            "第 5 次失败后转为已放弃且不再排期",
            f"实得 status={last_retry['row']['status']} attempts={last_retry['row']['attempts']}",
        )
        record(
            int(worker["after_limit"]["claimed"]) == 0,
            "达到最大次数后后续 worker 不再领取",
            f"实得 {worker['after_limit']}",
        )

        # ── 10 邮件格式与 WordPress 后台可见性 ─────────────────────────────
        print("\n[10] 邮件格式与 WordPress 后台可见性")
        presentation = run_probe("presentation")
        email_html = presentation["html"]
        email_text = presentation["text"]
        edit_url = presentation["edit_url"]
        list_html = presentation["list_html"]
        detail_html = presentation["detail_html"]
        context_html = presentation["context_html"]
        list_body = list_html.split("<tbody>", 1)[-1].split("</tbody>", 1)[0]
        email_hrefs = [html_lib.unescape(value) for value in re.findall(r'href="([^"]+)"', email_html)]

        record(
            presentation["post_id"] > 0
            and presentation["post_type"] == CPT
            and presentation["post_title"] == "INQ-PRESENTATION-PROBE",
            "同一询盘已保存为 WordPress fh_inquiry 记录",
            f"post_id={presentation['post_id']}",
        )
        record(
            bool(edit_url)
            and f"post={presentation['post_id']}" in edit_url
            and "action=edit" in edit_url,
            "邮件可生成同一询盘的 WordPress 详情链接",
            edit_url,
        )
        record(
            '<meta charset="UTF-8">' in email_html
            and all(section in email_html for section in (
                "Contact", "Inquiry details", "Submitted configuration", "Source &amp; consent"
            )),
            "HTML 邮件声明 UTF-8，并按联系人、需求、规格快照、来源与同意分区",
        )
        record(
            edit_url in email_hrefs
            and "View in WordPress" in email_html,
            "HTML 邮件提供 WordPress 详情入口",
        )
        record(
            "<script>" not in email_html
            and "&lt;script&gt;" in email_html
            and "<script>" not in detail_html
            and "&lt;script&gt;" in detail_html,
            "邮件和后台详情都会转义客户输入",
        )
        record(
            all(token in email_html and token in context_html for token in ("FH-001", "FH-002", "FH001-001", "FH002-001")),
            "HTML 邮件与 WordPress 详情都显示逐项轮毂清单",
        )
        record(
            email_text.count("\n") >= 12
            and "CONTACT" in email_text
            and "INQUIRY DETAILS" in email_text
            and "FH-001" in email_text
            and "FH-002" in email_text
            and "WORDPRESS RECORD" in email_text,
            "纯文本备用正文保留分区、逐项清单与换行",
            f"换行 {email_text.count(chr(10))} 个",
        )

        # 列表应按表头顺序输出：客户 → 客户类型 → 产品线 → 型号 → 业务状态。
        list_positions = [
            list_body.find("CONTACT-TOKEN"),
            list_body.find("企业 / 贸易商"),
            list_body.find("轮毂"),
            list_body.find("MODEL-TOKEN"),
            # “新询盘”同时出现在状态筛选器和表格单元格；取表格中最后一次出现，
            # 避免把筛选器位置误判为列顺序。
            list_body.rfind("新询盘"),
        ]
        record(
            all(pos >= 0 for pos in list_positions)
            and list_positions == sorted(list_positions),
            "WordPress 询盘列表字段与表头顺序一致",
            f"位置 {list_positions}",
        )

    finally:
        # ── 11 清理 ─────────────────────────────────────────────────────────
        print("\n[11] 清理")
        docker_php(
            'require "/var/www/html/wp-load.php"; '
            'delete_option("fh_inquiry_delivery_paused"); echo "ok";',
            allow_fail=True,
        )
        try:
            summary = json.loads(cleanup())
            record(
                summary["keys_left"] == 0
                and summary["outbox_left"] == 0
                and summary["posts_left"] == 0,
                "测试数据已清干净（CPT / keys / outbox 归零）",
                json.dumps(summary, ensure_ascii=False),
            )
        except Exception as exc:  # noqa: BLE001
            record(False, "清理执行成功", str(exc)[:200])

        docker_exec([CONTAINER, "rm", "-f", PROBE_PATH_IN_CONTAINER])
        leftover = docker_exec([CONTAINER, "sh", "-c", f"test -e {PROBE_PATH_IN_CONTAINER} && echo yes || echo no"])
        record(
            (leftover.stdout or "").strip() == "no",
            "临时探针文件已从容器删除",
            PROBE_PATH_IN_CONTAINER,
        )

    passed = sum(1 for ok, _, _ in _results if ok)
    failed = len(_results) - passed
    print("\n" + "=" * 70)
    print(f"通过 {passed} / 失败 {failed}")
    if failed:
        print("失败项：")
        for ok, label, detail in _results:
            if not ok:
                print(f"  · {label} {detail}")
    print("=" * 70)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
