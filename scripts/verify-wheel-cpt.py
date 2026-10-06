#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
轮毂 CPT（fenghuai-wheels mu-plugin）一键验收。

跑法：
    python3 scripts/verify-wheel-cpt.py

为什么需要它：mu-plugin 落在 `local-wp/wp-data/` 里，而该目录在 .gitignore 中（第 63 行）
→ **插件本身不进 git**，改了它没有任何版本记录兜底。所以每次改动都必须跑一次本脚本，
把「注册是否完整 / 判定是否 fail-closed / REST 是否可达」三件事重新确认一遍。

依赖：docker 容器 fh-wp 在跑；凭证读 local-wp/local-credentials.txt（同样 gitignored）。
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTAINER = "fh-wp"
PLUGIN_PATH = "local-wp/mu-plugins/fenghuai-wheels.php"  # 跟踪源；容器副作用由 sync-mu-plugins.py 同步
CONTAINER_PLUGIN = "/var/www/html/wp-content/mu-plugins/fenghuai-wheels.php"
CRED_FILE = os.path.join(ROOT, "local-wp", "local-credentials.txt")
REST_BASE = "http://localhost:8081/wp-json/wp/v2/wheel-models"

# CPT 应有的 meta 字段（与插件里的定义保持一致）
EXPECTED_DECISION_META = {
    "publication_status", "image_rights_status", "supply_status", "specification_status",
}
EXPECTED_FACT_META = {
    "fact_diameters", "fact_size_category", "fact_process_raw", "fact_style_name",
    "fact_variant_count", "fact_image_count", "fact_images", "fact_score",
    "fact_trademark_hits", "fact_complete_ratio", "fact_source_keys", "fact_variants_json",
}
EXPECTED_DIAMETER_TERMS = {"12", "13", "14", "15", "16", "17", "18", "19", "20"}
EXPECTED_PROCESS_TERMS = {"旋压", "低压", "低压+旋压", "锻造"}

# 批准判定的 fail-closed 断言：每项都是「就位→放行 / 拆掉→拦住」
GATE_CASES = [
    ("publication_status", "approved"),
    ("image_rights_status", "approved"),
    ("supply_status", "confirmed"),
    ("specification_status", "verified"),
    ("approved_variant_keys", "PC-001"),
    ("public_slug", "gate-test"),
]

_results: list[tuple[bool, str, str]] = []


def record(ok: bool, label: str, detail: str = "") -> None:
    _results.append((ok, label, detail))
    print(f"  {'✅' if ok else '❌'} {label}" + (f"  {detail}" if detail else ""))


def docker_php(code: str, allow_fail: bool = False) -> str:
    """在容器里跑一段 PHP（已加载 WordPress）。"""
    proc = subprocess.run(
        ["docker", "exec", CONTAINER, "php", "-d", "display_errors=1", "-r", code],
        capture_output=True, text=True,
    )
    if proc.returncode != 0 and not allow_fail:
        raise RuntimeError(f"php 退出码 {proc.returncode}: {proc.stderr.strip()[:400]}")
    return (proc.stdout or "").strip()


def read_app_password() -> tuple[str, str] | None:
    if not os.path.exists(CRED_FILE):
        return None
    text = open(CRED_FILE, encoding="utf-8").read()
    user = re.search(r"应用密码值：\S+", text)
    owner = re.search(r"使用者：(\S+)", text)
    pw = re.search(r"应用密码值：(\S+)", text)
    if not (owner and pw and user):
        return None
    return owner.group(1), pw.group(1)


def main() -> int:
    print("=" * 66)
    print("轮毂 CPT 验收")
    print("=" * 66)

    # ---------------------------------------------------------------- 1 语法
    print("\n[1] 插件语法")
    if not os.path.exists(os.path.join(ROOT, PLUGIN_PATH)):
        record(False, "插件文件存在", PLUGIN_PATH)
        return 1
    out = subprocess.run(
        ["docker", "exec", CONTAINER, "php", "-l", CONTAINER_PLUGIN],
        capture_output=True, text=True,
    ).stdout.strip()
    record("No syntax errors" in out, "php -l 无语法错误", out.splitlines()[0] if out else "")

    # ---------------------------------------------------------------- 2 注册
    print("\n[2] 内容注册")
    raw = docker_php(
        'require "/var/www/html/wp-load.php"; echo json_encode(fh_wheel_self_check(), JSON_UNESCAPED_UNICODE);'
    )
    data = json.loads(raw)
    record(data["registered"], "文章类型 wheel_model 已注册", f"REST base = {data['rest_base']}")
    record(data["rest_base"] == "wheel-models", "REST base 为 wheel-models")

    meta = set(data["meta_keys"])
    missing_dec = EXPECTED_DECISION_META - meta
    missing_fact = EXPECTED_FACT_META - meta
    record(not missing_dec, "4 个发布决定字段齐全", f"缺 {sorted(missing_dec)}" if missing_dec else "")
    record(not missing_fact, "12 个事实快照字段齐全", f"缺 {sorted(missing_fact)}" if missing_fact else "")
    record("public_slug" in meta and "approved_variant_keys" in meta,
           "对外 slug 与已批准规格字段存在")

    dia = set(data["taxonomies"]["wheel_diameter"])
    proc = set(data["taxonomies"]["wheel_process"])
    record(dia == EXPECTED_DIAMETER_TERMS, "尺寸术语 12–20 齐全",
           f"实得 {sorted(dia, key=int) if dia else '空'}")
    record(proc == EXPECTED_PROCESS_TERMS, "工艺术语齐全", f"实得 {sorted(proc) if proc else '空'}")

    # ---------------------------------------------------------------- 3 REST
    print("\n[3] REST 可达性")
    import urllib.error
    import urllib.request

    def http(url: str, auth: tuple[str, str] | None = None) -> tuple[int, str]:
        req = urllib.request.Request(url)
        if auth:
            import base64
            token = base64.b64encode(f"{auth[0]}:{auth[1]}".encode()).decode()
            req.add_header("Authorization", f"Basic {token}")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.status, resp.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as exc:
            return exc.code, exc.read().decode("utf-8", "replace")
        except Exception:  # noqa: BLE001
            return -1, ""

    cred = read_app_password()
    if cred is None:
        record(False, "读到应用密码", f"{CRED_FILE} 里没找到「使用者 / 应用密码值」")
    else:
        owner, password = cred
        code, _body = http(REST_BASE, (owner, password))
        record(code == 200, "认证读取 REST 成功", f"HTTP {code}")

        # 非公开 CPT：未认证必须看不到真实记录。
        # 光看状态码不够 —— 建一条带显著标记的记录，再确认标记不出现在未认证响应里。
        marker = "__LEAK_CANARY__"
        canary = json.loads(docker_php(f'''
require "/var/www/html/wp-load.php";
$id = wp_insert_post(["post_type"=>"wheel_model","post_title"=>"{marker}","post_status"=>"publish"]);
update_post_meta($id, "public_slug", "leak-canary");
echo json_encode(["id" => $id]);
'''))
        try:
            code_unauth, body_unauth = http(REST_BASE)
            leaked = marker in body_unauth or f"leak-canary" in body_unauth
            record(not leaked, "未认证访问看不到真实记录",
                   f"HTTP {code_unauth}" + ("，但正文里出现了标记！" if leaked else "，正文无标记"))
            code_one, _ = http(f"{REST_BASE}/{canary['id']}")
            record(code_one >= 400, "未认证访问单条被拒", f"HTTP {code_one}")
            code_auth, body_auth = http(REST_BASE, (owner, password))
            record(code_auth == 200 and marker in body_auth,
                   "认证访问能看到该记录（正对照）",
                   f"HTTP {code_auth}")
        finally:
            docker_php(f'require "/var/www/html/wp-load.php"; wp_delete_post({canary["id"]}, true); echo "ok";')

    # ---------------------------------------------------------------- 4 判定
    print("\n[4] 批准判定 fail-closed")
    php_cases = json.dumps([{"key": k, "val": v} for k, v in GATE_CASES], ensure_ascii=False)
    script = f'''
require "/var/www/html/wp-load.php";
$cases = json_decode('{php_cases}', true);
$out = [];
$id = wp_insert_post(["post_type"=>"wheel_model","post_title"=>"__VERIFY__","post_status"=>"publish"]);
foreach ($cases as $c) {{ update_post_meta($id, $c["key"], $c["val"]); }}
$out["all_set"] = fh_wheel_is_approved($id);
foreach ($cases as $c) {{
  $orig = get_post_meta($id, $c["key"], true);
  update_post_meta($id, $c["key"], "");
  $out["drop_" . $c["key"]] = fh_wheel_is_approved($id);
  update_post_meta($id, $c["key"], $orig);
}}
update_post_meta($id, "supply_status", "pending");
$out["bad_supply"] = fh_wheel_is_approved($id);
update_post_meta($id, "supply_status", "confirmed");
wp_update_post(["ID"=>$id, "post_status"=>"draft"]);
$out["draft_post"] = fh_wheel_is_approved($id);
wp_delete_post($id, true);
echo json_encode($out);
'''
    gate = json.loads(docker_php(script))
    record(gate["all_set"] is True, "六项齐全 → 放行")
    for key, _ in GATE_CASES:
        record(gate[f"drop_{key}"] is False, f"清空 {key} → 拦住")
    record(gate["bad_supply"] is False, "取值不合规 → 拦住")
    record(gate["draft_post"] is False, "文章为草稿 → 拦住")

    # ---------------------------------------------------------------- 汇总
    passed = sum(1 for ok, _, _ in _results if ok)
    failed = len(_results) - passed
    print("\n" + "=" * 66)
    print(f"通过 {passed} / 失败 {failed}")
    if failed:
        print("失败项：")
        for ok, label, detail in _results:
            if not ok:
                print(f"  · {label} {detail}")
    print("=" * 66)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
