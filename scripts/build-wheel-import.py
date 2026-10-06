#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建「首期轮毂导入包」—— 从事实层 + 首期候选集，生成可直接灌进 WordPress 的数据包。

输入（只读）：
  assets/wheel-data/WHEEL-CATALOG-ALL.json          事实层（1349 型号 / 3485 变体）
  outputs/exports/wheel-first-batch-by-size.json    首期候选集（每尺寸 30，去重后 175 型号）

输出：
  outputs/exports/wheel-import-package.json         导入包（可审计、可重跑）

设计纪律：
  1. **规格不进 WordPress。** 本包只带「发布决定」与「事实快照」，
     `fact_variants_json` 是只读回显，用于后台人工核对，不是第二真相源。
  2. **幂等键 = slug（model 小写归一化）**，导入器按 slug 先查后写，可反复跑。
  3. 事实上不来的字段一律留空字符串，不填占位词、不推测。
  4. `public_slug` 必须 URL 安全；本批实测 175/175 安全、0 碰撞，
     但仍在校验失败时**拒绝构建**而不是静默替换。
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FACTS = os.path.join(ROOT, "assets", "wheel-data", "WHEEL-CATALOG-ALL.json")
SELECTION = os.path.join(ROOT, "outputs", "exports", "wheel-first-batch-by-size.json")
OUT = os.path.join(ROOT, "outputs", "exports", "wheel-import-package.json")

# 发布决定默认值（首期口径，见 STATUS 记录）
DECISION_DEFAULTS = {
    "publication_status": "approved",
    "image_rights_status": "approved",
    "supply_status": "confirmed",
    "specification_status": "verified",
}

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def slugify(model: str) -> str:
    """model → 公开 slug。只做安全的字符级归一，不做语义改写。"""
    s = str(model).strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def main() -> None:
    if not os.path.exists(FACTS):
        sys.exit(f"找不到事实层：{FACTS}")
    if not os.path.exists(SELECTION):
        sys.exit(f"找不到首期候选集：{SELECTION}")

    facts_doc = json.load(open(FACTS, encoding="utf-8"))
    facts_by_model = {
        str(m.get("model", "")).strip().lower(): m for m in facts_doc.get("models", [])
    }

    sel = json.load(open(SELECTION, encoding="utf-8"))["selection"]
    picked: dict[str, dict] = {}
    for _size, items in sel.items():
        for item in items:
            key = str(item["model"]).strip().lower()
            # 跨尺寸型号只保留一份（信息更全的那份）
            prev = picked.get(key)
            if prev is None or item["score"] > prev["score"]:
                picked[key] = item

    records = []
    errors = []
    slug_seen: dict[str, str] = {}

    for key, item in sorted(picked.items()):
        model = str(item["model"]).strip()
        slug = slugify(model)

        # ① slug 必须 URL 安全（本批实测全过，但仍拒绝静默降级）
        if not SLUG_RE.match(slug):
            errors.append(f"{model}: slug 非法 → {slug!r}")
            continue
        # ② slug 碰撞必须显式报错，不能靠 WP 自动加 -2（那会破坏幂等）
        if slug in slug_seen:
            errors.append(f"slug 碰撞：{model} 与 {slug_seen[slug]} 都归一为 {slug!r}")
            continue
        slug_seen[slug] = model

        facts = facts_by_model.get(key)
        if facts is None:
            errors.append(f"{model}: 事实层找不到该 model，跳过")
            continue

        variants = item.get("variants", [])
        production_codes = [str(v.get("productionCode", "")).strip() for v in variants]
        production_codes = [c for c in production_codes if c]

        process = item.get("process") or ""
        diameters = sorted(item.get("diameters", []), key=int)

        record = {
            "key": slug,
            "model": model,
            "slug": slug,
            "title": model,
            # 文章状态：用户口径「175 条全部批准」→ publish。
            # 注意 fh_wheel_is_approved() 同时要求 post_status=publish，
            # 所以「批准」在这里是两处同时成立，缺一不可。
            "postStatus": "publish",
            "taxonomies": {
                "wheel_diameter": diameters,
                # 工艺未标注时不挂术语 —— 缺数据就是缺数据，不猜（spec §14）
                "wheel_process": [process] if process else [],
            },
            "decision": {
                **DECISION_DEFAULTS,
                "approved_process": process,
                "public_slug": slug,
                "display_model": model,
                # 首发不写 SEO 文案：留空由模板派生，避免一次性制造 175 段无根据的营销字
                "seo_title": "",
                "seo_description": "",
                "editor_note": f"首期导入 {item.get('score', '')} 分；来源目录 {item.get('sizeCategory', '')}",
                # 已批准规格 = 该型号全部变体（首期口径）
                "approved_variant_keys": ",".join(production_codes),
            },
            "facts": {
                "fact_diameters": ",".join(diameters),
                "fact_size_category": item.get("sizeCategory", ""),
                "fact_process_raw": process,
                "fact_style_name": item.get("styleName") or "",
                "fact_variant_count": str(len(variants)),
                "fact_image_count": str(item.get("nImages", 0)),
                "fact_images": ",".join(item.get("images", [])),
                "fact_score": str(item.get("score", "")),
                # 本批经商标闸过滤，故恒为空；保留字段以便未来回填
                "fact_trademark_hits": "",
                "fact_complete_ratio": str(item.get("completeRatio", "")),
                # sourceKey 口径：来源目录 + 规范化型号（见架构稿 §4.1）
                "fact_source_keys": f"{item.get('sizeCategory', '')}:{key}",
                "fact_variants_json": json.dumps(variants, ensure_ascii=False),
            },
        }
        records.append(record)

    if errors:
        print("构建失败，存在必须人工处理的问题：")
        for e in errors:
            print("  ✗", e)
        sys.exit(1)

    payload = {
        "meta": {
            "source": [
                "assets/wheel-data/WHEEL-CATALOG-ALL.json",
                "outputs/exports/wheel-first-batch-by-size.json",
            ],
            "count": len(records),
            "keyField": "slug",
            "decisionDefaults": DECISION_DEFAULTS,
            "note": (
                "规格的唯一真相源仍是事实层；本包只带发布决定与只读事实快照。"
                "导入器按 slug 幂等。"
            ),
        },
        "records": records,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    # --- 报告 ---
    n_variants = sum(len(r["decision"]["approved_variant_keys"].split(",")) for r in records)
    n_images = sum(int(r["facts"]["fact_image_count"]) for r in records)
    print(f"✅ 导入包已写出：{OUT}")
    print(f"   记录数        {len(records)}")
    print(f"   批准规格数    {n_variants}")
    print(f"   图片引用数    {n_images}")
    print(f"   尺寸分布      {dict(sorted(Counter(d for r in records for d in r['taxonomies']['wheel_diameter']).items(), key=lambda kv: int(kv[0])))}")
    print(f"   工艺分布      {Counter(r['facts']['fact_process_raw'] or '未标注（不挂术语）' for r in records).most_common()}")
    print(f"   slug 唯一      {len({r['slug'] for r in records})} / {len(records)}")


if __name__ == "__main__":
    main()
