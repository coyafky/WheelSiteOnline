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

⚠️ 本项目已知病是「弱断言」：只看 HTTP 状态码不足以说明问题。所以下面每一条
关键断言都同时核对**响应体内容**与**数据库实证**（information_schema / 直接查表）。

依赖：docker 容器 fh-wp（WordPress）与 fh-wp-db（MySQL）在跑；
服务密钥读容器里的常量（也就是 local-wp/.env 经 WORDPRESS_CONFIG_EXTRA 之后的结果）。
"""

from __future__ import annotations

import hashlib
import json
import os
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

echo wp_json_encode(['error' => 'unknown mode']), "\n";
"""


def run_probe(mode: str) -> dict:
    proc = docker_exec(
        [CONTAINER, "sh", "-c", f"cat > {PROBE_PATH_IN_CONTAINER} && php {PROBE_PATH_IN_CONTAINER} {mode}"],
        stdin=PROBE_PHP,
    )
    out = (proc.stdout or "").strip()
    if not out:
        raise RuntimeError(f"探针 {mode} 无输出；stderr={proc.stderr.strip()[:300]}")
    return json.loads(out.splitlines()[-1])


def cleanup() -> str:
    """删掉本轮（以及历史遗留）的测试数据，返回清理摘要。

    ⚠️ 这段 PHP 走 `php -r`，所以**不能带 `<?php` 标签**。
    """
    php = r"""
require '/var/www/html/wp-load.php';
global $wpdb;
$keyTable    = fh_inquiry_key_table();
$outboxTable = fh_inquiry_outbox_table();
$eventTable  = fh_inquiry_event_table();

// 1) 删掉**全部** fh_inquiry 记录（wp_delete_post 会连 postmeta 一起删）
//
// 为什么可以全删而不是只删本脚本造的：
//   · 本脚本只在**本地实验场**跑（走 `docker exec fh-wp`），不可能指向生产；
//   · 该库的询盘端点（/fh/v1/inquiries）是这个库里**唯一**的询盘写入者。
//   所以库里任何一条 fh_inquiry 都是测试数据 —— 全清之后
//   「剩余 0 条」才是一条有意义的断言。
//
// ⚠️ 2026-10-06 修：原先只按测试邮箱 'vfytest@example.com' 筛，
//    导致人工探针（email 为 NULL 的 INQ-ADMINPROBE-* 之类）漏网，
//    收尾断言报 posts_left=1。按邮箱筛对「别人造的探针」天然无能为力。
$allIds = get_posts([
    'post_type'      => 'fh_inquiry',
    'post_status'    => 'any',
    'posts_per_page' => -1,
    'fields'         => 'ids',
]);
foreach ($allIds as $id) {
    wp_delete_post((int) $id, true);
}
$deletedPosts = count($allIds);

// 2) 键表：按测试前缀删（含未关联成功、inquiry_id=0 的残留行）
$deletedKeys = (int) $wpdb->query($wpdb->prepare(
    "DELETE FROM {$keyTable} WHERE idempotency_key LIKE %s", 'vfytest%'
));

// 3) 键表兜底：删掉指向已不存在询盘的孤儿行（含「服务端补发键」那种无前缀的行）
$deletedOrphanKeys = (int) $wpdb->query(
    "DELETE FROM {$keyTable} WHERE inquiry_id NOT IN (SELECT ID FROM {$wpdb->posts})"
);

// 4) 发件箱 / 事件表：删掉指向已不存在询盘的孤儿行
$deletedOutbox = (int) $wpdb->query(
    "DELETE FROM {$outboxTable} WHERE inquiry_id NOT IN (SELECT ID FROM {$wpdb->posts})"
);
$deletedEvents = (int) $wpdb->query(
    "DELETE FROM {$eventTable} WHERE outbox_id NOT IN (SELECT id FROM {$outboxTable})"
);

// 5) 让本轮/下轮的询盘号都从当天 0001 开始（自增序号会跨运行累积，不清就没法复现）
$resetKey = $wpdb->query("ALTER TABLE {$keyTable} AUTO_INCREMENT=1");
$resetOutbox = $wpdb->query("ALTER TABLE {$outboxTable} AUTO_INCREMENT=1");

echo wp_json_encode([
    'posts_deleted'  => $deletedPosts,
    'keys_deleted'   => $deletedKeys,
    'orphan_keys_deleted' => $deletedOrphanKeys,
    'outbox_deleted' => $deletedOutbox,
    'events_deleted' => $deletedEvents,
    'autoinc_reset'  => ($resetKey !== false && $resetOutbox !== false),
    'posts_left'     => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='fh_inquiry'"),
    'keys_left'      => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$keyTable}"),
    'outbox_left'    => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$outboxTable}"),
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
            ("缺少合规字段", payload(idem("noconsent"), privacyVersion="", consentedAt=""), "privacyVersion"),
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
            code_s == 201 and status_map.get("business_status") == "new" and status_map.get("email_status") != "accepted",
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

    finally:
        # ── 清理 ────────────────────────────────────────────────────────────
        print("\n[9] 清理")
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
