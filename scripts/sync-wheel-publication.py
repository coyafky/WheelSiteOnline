#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 WordPress 的「发布决定」同步成构建期快照。

  WordPress CPT (可写正本)
        ↓  本脚本（显式同步）
  src/content/wheel-publication.json  (进 git 的批准快照)
        ↓  src/lib/wheels/publication.ts
  公开集合 = 事实层(机器门槛) AND 快照(人工批准)

用法：
    python3 scripts/sync-wheel-publication.py
    python3 scripts/sync-wheel-publication.py --base-url http://localhost:8081 \
        --user fh_admin --password '<应用密码>'
    python3 scripts/sync-wheel-publication.py --check     # 只比对，不覆盖（CI 用）

为什么要有这层快照（而不是页面直连 WP）：
  1. mock 模式可用 —— 不配 WP 也能 lint/typecheck/build；
  2. git 可审计 —— 谁在何时批准了哪几个，diff 看得见；
  3. WP 挂了仍服务最后一次批准集（架构稿 §8：绝不回退成「所有有图型号」）；
  4. 构建确定性 —— 同一 commit 两次构建结果一致。

纪律：
  · 快照是 WordPress 状态的**忠实镜像**，不做资格判定 ——
    门槛逻辑只在 src/lib/wheels/publication.ts 一处实现，避免两处漂移。
  · WP 不可达时**报错退出**，绝不写出空快照覆盖已有批准（那等于静默下线）。
  · 按 slug 排序输出，保证 git diff 稳定。
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "content", "wheel-publication.json")
CRED_FILE = os.path.join(ROOT, "local-wp", "local-credentials.txt")

PER_PAGE = 100

# 决定字段（人工可写）—— 只同步这些，事实快照不进公开层
DECISION_KEYS = [
    "publication_status",
    "image_rights_status",
    "supply_status",
    "specification_status",
    "approved_process",
    "public_slug",
    "display_model",
    "seo_title",
    "seo_description",
]


def read_credentials() -> tuple[str, str] | None:
    """从 gitignored 的本地凭证文件里取应用密码。"""
    if not os.path.exists(CRED_FILE):
        return None
    text = open(CRED_FILE, encoding="utf-8").read()
    owner = re.search(r"使用者：(\S+)", text)
    secret = re.search(r"应用密码值：(\S+)", text)
    if owner and secret:
        return owner.group(1), secret.group(1)
    return None


def fetch_page(base_url: str, page: int, auth: tuple[str, str] | None) -> tuple[list, int]:
    url = (
        f"{base_url}/wp-json/wp/v2/wheel-models"
        f"?per_page={PER_PAGE}&page={page}&status=publish,draft,pending,private"
        f"&orderby=slug&order=asc"
    )
    req = urllib.request.Request(url)
    if auth:
        token = base64.b64encode(f"{auth[0]}:{auth[1]}".encode()).decode()
        req.add_header("Authorization", f"Basic {token}")
    req.add_header("User-Agent", "fenghuai-wheel-sync/1.0")

    with urllib.request.urlopen(req, timeout=30) as resp:
        total = int(resp.headers.get("X-WP-Total", "0"))
        return json.loads(resp.read().decode("utf-8")), total


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default=os.environ.get("WP_API_URL") or "http://localhost:8081")
    ap.add_argument("--user")
    ap.add_argument("--password")
    ap.add_argument("--out", default=OUT)
    ap.add_argument("--check", action="store_true", help="只比对不写；有差异则退出码 1")
    args = ap.parse_args()

    auth = None
    if args.user and args.password:
        auth = (args.user, args.password)
    else:
        auth = read_credentials()
    if auth is None:
        print("✗ 没有凭据。用 --user/--password，或在 local-wp/local-credentials.txt 里提供。", file=sys.stderr)
        return 1

    base = args.base_url.rstrip("/")
    print(f"读取 {base}/wp-json/wp/v2/wheel-models …")

    records: list[dict] = []
    try:
        page, total = 1, None
        while True:
            batch, total = fetch_page(base, page, auth)
            records.extend(batch)
            if not batch or len(records) >= (total or 0):
                break
            page += 1
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")[:300]
        print(f"✗ WordPress 返回 HTTP {exc.code}：{body}", file=sys.stderr)
        return 1
    except Exception as exc:  # noqa: BLE001
        print(f"✗ 无法连接 WordPress：{exc}", file=sys.stderr)
        print("  （快照未被修改 —— 拒绝用空快照覆盖已有批准）", file=sys.stderr)
        return 1

    if not records:
        print("✗ WordPress 返回 0 条记录。拒绝写出空快照（那等于静默下线全站）。", file=sys.stderr)
        return 1

    publications: dict[str, dict] = {}
    for item in records:
        meta = item.get("meta") or {}
        slug = (meta.get("public_slug") or item.get("slug") or "").strip().lower()
        if not slug:
            continue
        entry = {
            "model": (item.get("title") or {}).get("rendered", ""),
            "wpId": item.get("id"),
            "wpStatus": item.get("status", ""),
        }
        for key in DECISION_KEYS:
            entry[key] = (meta.get(key) or "") if isinstance(meta.get(key), str) else meta.get(key)
        # 已批准规格：WP 里存的是逗号分隔字符串 → 快照里存数组
        raw_keys = meta.get("approved_variant_keys") or ""
        entry["approvedVariantKeys"] = [k.strip() for k in str(raw_keys).split(",") if k.strip()]
        publications[slug] = entry

    snapshot = {
        "meta": {
            "syncedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "source": f"{base}/wp-json/wp/v2/wheel-models",
            "count": len(publications),
            "note": (
                "WordPress 发布决定的忠实镜像。资格判定不在这里 —— "
                "见 src/lib/wheels/publication.ts（单一判定点）。"
            ),
        },
        # 按 key 排序 → git diff 稳定
        "publications": dict(sorted(publications.items())),
    }

    text = json.dumps(snapshot, ensure_ascii=False, indent=1) + "\n"

    if args.check:
        existing = open(args.out, encoding="utf-8").read() if os.path.exists(args.out) else ""
        old = json.loads(existing) if existing else {}
        same = json.dumps(old.get("publications", {}), sort_keys=True) == json.dumps(
            publications, sort_keys=True
        )
        print(("✅ 快照与 WordPress 一致" if same else "✗ 快照与 WordPress 不一致"))
        return 0 if same else 1

    prev = {}
    if os.path.exists(args.out):
        try:
            prev = json.loads(open(args.out, encoding="utf-8").read()).get("publications", {})
        except Exception:  # noqa: BLE001
            prev = {}

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write(text)

    added = [k for k in publications if k not in prev]
    removed = [k for k in prev if k not in publications]
    changed = [
        k for k in publications
        if k in prev and json.dumps(prev[k], sort_keys=True) != json.dumps(publications[k], sort_keys=True)
    ]

    print(f"✅ 快照已写出：{os.path.relpath(args.out, ROOT)}")
    print(f"   记录数        {len(publications)}")
    print(f"   新增 {len(added)} ｜ 变更 {len(changed)} ｜ 移除 {len(removed)}")
    from collections import Counter

    print("   发布状态      " + str(Counter(v.get("publication_status", "") for v in publications.values()).most_common()))
    print("   图权          " + str(Counter(v.get("image_rights_status", "") for v in publications.values()).most_common()))
    print("   供货          " + str(Counter(v.get("supply_status", "") for v in publications.values()).most_common()))
    print("   规格核验      " + str(Counter(v.get("specification_status", "") for v in publications.values()).most_common()))
    n_var = sum(len(v["approvedVariantKeys"]) for v in publications.values())
    print(f"   已批准规格    {n_var}")
    if added:
        print(f"   （新增示例：{', '.join(added[:5])}）")
    if removed:
        print(f"   ⚠️ 移除示例：{', '.join(removed[:5])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
