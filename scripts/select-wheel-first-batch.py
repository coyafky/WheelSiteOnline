#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
首期公开轮毂候选集：每个尺寸挑 30 个「好一点」的型号。

输入（只读）：
  assets/wheel-data/WHEEL-CATALOG-ALL.json   事实层（1349 条记录 → 按 model 合并）
  assets/wheel-images-webp/*.webp            站点图片（2757 张）

输出：
  outputs/exports/wheel-first-batch-by-size.md
  outputs/exports/wheel-first-batch-by-size.json

⭐ 合并语义（2026-10-06 修正）：
  事实层是**按（来源目录, model）**分条存的，同一个 model 代码可能横跨多个尺寸目录，
  各目录的 variant 是**彼此不重叠的真实配置**（实测 108 组 / 238 条记录）。
  例：`dx008` = 15寸(2 变体) + 17寸(4) + 18寸(3) = 9 个变体。

  正确做法是**按 model 合并成一条公开型号**（并集），这也是架构稿的口径
  「公开型号：由一条或多条源记录组成的网站产品」。

  ⚠️ 本脚本上一版按「保留分高的那条记录」去重，**丢掉了 257 个变体（734 → 991，26%）**，
  属真实数据丢失。本版改为在合并后重新打分，合并是唯一真实口径。

排序依据（全部可衡量，无主观臆造）：
  闸门（必须全过）
    G1 有图          —— 无图无法成页（沿用生成器 DEC-013 上架门槛）
    G2 规格齐        —— 至少一条 variant 的五字段齐全
    G3 无第三方商标  —— styleName 不含他人商标（BBS / TE37 / HRE / 车厂名…）
  打分（0–100，权重集中在文件顶部常量，可调）
    图片丰富度 25 ｜ 工艺含金量 25 ｜ 规格广度 20 ｜ 颜色可选 15 ｜ 规格完整度 10 ｜ 孔距广度 5
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALL_JSON = os.path.join(ROOT, "assets", "wheel-data", "WHEEL-CATALOG-ALL.json")
IMG_DIR = os.path.join(ROOT, "assets", "wheel-images-webp")
OUT_DIR = os.path.join(ROOT, "outputs", "exports")

PER_SIZE = 30

# --- 打分权重（可调）------------------------------------------------------
W_IMAGE, W_PROCESS, W_VARIANTS, W_FINISH, W_COMPLETE, W_PCD = 25, 25, 20, 15, 10, 5
IMAGE_CAP, VARIANT_CAP, FINISH_CAP, PCD_CAP = 5, 8, 5, 3

KNOWN_PROCESSES = {"旋压", "低压", "低压+旋压", "锻造"}
PREMIUM_PROCESSES = {"旋压", "低压+旋压", "锻造"}

# --- 第三方商标关键词（启发式，下界）--------------------------------------
WHEEL_BRANDS = [
    "TE37", "RAYS", "VOLK", "BBS", "OZ", "ENKEI", "WORK", "ADVAN", "VOSSEN",
    "HRE", "ROTIFORM", "SSR", "WEDS", "MUGEN", "FORGIATO", "305FORGED",
    "3SDM", "AVID", "RPF1", "CE28", "RE30", "ZE40", "TC005", "TC05", "RS05",
    "PF01", "RP01", "RC-T5", "MF10", "57CR", "CV3", "G025",
]
CAR_BRANDS = [
    "奥迪", "奔驰", "宝马", "保时捷", "丰田", "本田", "日产", "雷克萨斯",
    "特斯拉", "路虎", "福特", "大众", "沃尔沃", "凯迪拉克", "玛莎拉蒂",
    "法拉利", "兰博基尼", "迈凯伦", "捷豹", "讴歌", "英菲尼迪", "斯巴鲁",
    "三菱", "马自达", "别克", "雪佛兰", "吉普", "JEEP", "MINI", "BYD",
    "比亚迪", "横滨", "M.A.T", "M.AT",
]
TRADEMARK_PATTERNS = [re.compile(re.escape(b), re.I) for b in WHEEL_BRANDS + CAR_BRANDS]


def trademark_hits(text) -> list[str]:
    s = str(text or "")
    out, seen = [], set()
    for brand, pat in zip(WHEEL_BRANDS + CAR_BRANDS, TRADEMARK_PATTERNS):
        if pat.search(s) and brand not in seen:
            seen.add(brand)
            out.append(brand)
    return out


# --- 图片匹配（复刻生成器规则，见 DEC-012）--------------------------------
def image_code(file_name: str) -> str:
    stem = re.sub(r"\.webp$", "", file_name, flags=re.I)
    stem = re.sub(r"^(\d+|off-road|off|hp)-\d*-?", "", stem, flags=re.I)
    stem = re.sub(r"-\d+$", "", stem)
    return stem.lower()


def build_image_index() -> dict[str, list[str]]:
    idx: dict[str, list[str]] = defaultdict(list)
    try:
        files = sorted(f for f in os.listdir(IMG_DIR) if f.lower().endswith(".webp"))
    except FileNotFoundError:
        sys.exit(f"找不到图片目录：{IMG_DIR}")
    for f in files:
        idx[image_code(f)].append(f)
    return idx


# --- 规格辅助 -------------------------------------------------------------
SPEC_FIELDS = ("size", "pcd", "offset", "centerBore", "finish")


def variant_complete(v) -> bool:
    return all(str(v.get(k, "")).strip() not in ("", "None") for k in SPEC_FIELDS)


def variant_diameters(variants) -> set[str]:
    out: set[str] = set()
    for v in variants:
        m = re.match(r"^(\d{2})", str(v.get("size", "")).strip())
        if m and 10 <= int(m.group(1)) <= 26:
            out.add(m.group(1))
    return out


# --- 合并（核心修正）------------------------------------------------------
def merge_records(records: list[dict], images: list[str]) -> dict:
    """把同一 model 的多条源记录合并成一条公开型号。"""
    # 变体并集，按 productionCode 去重（保留首次出现的顺序）
    variants: list[dict] = []
    seen_codes: set[str] = set()
    for rec in records:
        for v in rec.get("variants", []) or []:
            code = str(v.get("productionCode", "")).strip()
            if not code or code in seen_codes:
                continue
            seen_codes.add(code)
            variants.append(v)
    variants.sort(key=lambda v: str(v.get("productionCode", "")))

    # 主推来源目录 = 变体最多的那条记录
    primary = max(records, key=lambda r: len(r.get("variants", []) or []))
    categories = sorted({str(r.get("sizeCategory", "")).strip() for r in records if r.get("sizeCategory")})

    # styleName / process：多值即冲突，取主记录的，并显式记录冲突
    style_names = sorted({str(r.get("styleName", "")).strip() for r in records if str(r.get("styleName", "")).strip()})
    processes = sorted({str(r.get("process", "")).strip() for r in records if str(r.get("process", "")).strip()})

    return {
        "model": str(primary.get("model", "")).strip(),
        "modelKey": str(primary.get("model", "")).strip().lower(),
        "sizeCategory": str(primary.get("sizeCategory", "")).strip(),
        "sizeCategories": categories,
        "sourceRecordCount": len(records),
        "process": str(primary.get("process", "")).strip() or None,
        "processConflict": len(processes) > 1,
        "styleName": str(primary.get("styleName", "")).strip() or None,
        "styleNameConflict": len(style_names) > 1,
        "variants": variants,
        "diameters": sorted(variant_diameters(variants), key=int),
        "images": images,
        "nImages": len(images),
        "nVariants": len(variants),
        "nFinishes": len({str(v.get("finish", "")).strip() for v in variants if str(v.get("finish", "")).strip()}),
        "nPcds": len({str(v.get("pcd", "")).strip() for v in variants if str(v.get("pcd", "")).strip()}),
        "completeRatio": round(
            sum(1 for v in variants if variant_complete(v)) / len(variants), 3
        ) if variants else 0.0,
        "trademarkHits": trademark_hits(primary.get("styleName")),
    }


def score_model(entry: dict) -> dict:
    n_img, n_var = entry["nImages"], entry["nVariants"]
    process = entry.get("process")
    n_fin, n_pcd = entry["nFinishes"], entry["nPcds"]
    complete_ratio = entry["completeRatio"]

    s_img = min(n_img, IMAGE_CAP) / IMAGE_CAP * W_IMAGE
    if process in PREMIUM_PROCESSES:
        s_proc = float(W_PROCESS)
    elif process in KNOWN_PROCESSES:
        s_proc = W_PROCESS * 0.48
    else:
        s_proc = 0.0
    s_var = min(n_var, VARIANT_CAP) / VARIANT_CAP * W_VARIANTS
    s_fin = min(n_fin, FINISH_CAP) / FINISH_CAP * W_FINISH
    s_cmp = complete_ratio * W_COMPLETE
    s_pcd = min(n_pcd, PCD_CAP) / PCD_CAP * W_PCD

    entry["score"] = round(s_img + s_proc + s_var + s_fin + s_cmp + s_pcd, 1)
    entry["scoreParts"] = {
        "image": round(s_img, 1), "process": round(s_proc, 1),
        "variants": round(s_var, 1), "finish": round(s_fin, 1),
        "complete": round(s_cmp, 1), "pcd": round(s_pcd, 1),
    }
    return entry


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(ALL_JSON, encoding="utf-8") as fh:
        doc = json.load(fh)
    models = doc.get("models", [])
    img_idx = build_image_index()

    # ① 按 model 分组（合并是前提，不是可选优化）
    grouped: dict[str, list[dict]] = defaultdict(list)
    for raw in models:
        grouped[str(raw.get("model", "")).strip().lower()].append(raw)

    # ② 合并 + 闸门
    funnel = Counter()
    funnel["total"] = len(models)
    funnel["groups"] = len(grouped)
    funnel["mergedAway"] = len(models) - len(grouped)

    candidates: list[dict] = []
    drop_reason: dict[str, Counter] = defaultdict(Counter)

    for key, records in grouped.items():
        images = img_idx.get(key, [])
        entry = merge_records(records, images)
        dsets = set(entry["diameters"])

        if not images:
            funnel["noImage"] += 1
            for d in dsets:
                drop_reason[d]["noImage"] += 1
            continue
        funnel["hasImage"] += 1

        if not any(variant_complete(v) for v in entry["variants"]):
            funnel["incompleteSpec"] += 1
            for d in dsets:
                drop_reason[d]["incompleteSpec"] += 1
            continue
        funnel["specComplete"] += 1

        if entry["trademarkHits"]:
            funnel["trademark"] += 1
            for d in dsets:
                drop_reason[d]["trademark"] += 1
            continue
        funnel["clean"] += 1

        score_model(entry)
        candidates.append(entry)
        for d in dsets:
            drop_reason[d]["pass"] += 1

    funnel["uniqueCandidates"] = len(candidates)

    # ③ 按尺寸分榜
    by_diameter: dict[str, list[dict]] = defaultdict(list)
    for c in candidates:
        for d in c["diameters"]:
            by_diameter[d].append(c)

    selected: dict[str, list[dict]] = {}
    for d, lst in by_diameter.items():
        lst.sort(key=lambda x: (-x["score"], -x["nVariants"], x["modelKey"]))
        selected[d] = lst[:PER_SIZE]

    summary = {
        d: {
            "available": len(by_diameter[d]),
            "selected": len(selected[d]),
            "shortfall": max(0, PER_SIZE - len(selected[d])),
        }
        for d in sorted(by_diameter, key=int)
    }

    payload = {
        "source": "assets/wheel-data/WHEEL-CATALOG-ALL.json",
        "mergeSemantics": (
            "按 model 代码合并多条源记录为一条公开型号；变体取并集（productionCode 去重）。"
        ),
        "perSize": PER_SIZE,
        "weights": {
            "image": W_IMAGE, "process": W_PROCESS, "variants": W_VARIANTS,
            "finish": W_FINISH, "complete": W_COMPLETE, "pcd": W_PCD,
        },
        "funnel": dict(funnel),
        "trademarkAllModels": sum(1 for r in grouped.values() if trademark_hits(
            (r[0] or {}).get("styleName"))),
        "dropReasonByDiameter": {k: dict(v) for k, v in drop_reason.items()},
        "summary": summary,
        "trademarkPatterns": WHEEL_BRANDS + CAR_BRANDS,
        "selection": {d: selected[d] for d in sorted(selected, key=int)},
    }
    with open(os.path.join(OUT_DIR, "wheel-first-batch-by-size.json"), "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    render_markdown(payload)
    print(json.dumps({"funnel": dict(funnel), "summary": summary}, ensure_ascii=False, indent=1))


# ============================================================================
# Markdown
# ============================================================================


def esc(v) -> str:
    if v is None or str(v).strip() == "":
        return "—"
    return str(v).replace("|", "\\|").replace("\n", " ").strip()


def md_table(rows: list[list[str]], header: list[str]) -> list[str]:
    out = ["| " + " | ".join(header) + " |",
           "|" + "|".join(["---"] * len(header)) + "|"]
    out += ["| " + " | ".join(r) + " |" for r in rows]
    return out


def render_markdown(payload: dict) -> None:
    L: list[str] = []
    f = payload["funnel"]

    def add(line) -> None:
        """追加一行。**列表自动展平** —— `md_table()` 返回的是 list，
        直接 add 会在最后的 "\n".join() 处炸（这个坑本文件踩过三次）。"""
        if isinstance(line, list):
            L.extend(str(x) for x in line)
        else:
            L.append(line)

    add("# 首期公开轮毂候选集 · 每个尺寸 30 个")
    add("")
    add("> 由 `scripts/select-wheel-first-batch.py` 自动生成，不要手改。")
    add(">")
    add("> 数据源：`assets/wheel-data/WHEEL-CATALOG-ALL.json`"
        "＋ `assets/wheel-images-webp/`（2757 张图）。**inbox 那套数据本文件完全未使用。**")
    add("")

    add("## 0. 三件必须先知道的事")
    add("")
    add("### 0.1 ⭐ 按 model 合并是唯一正确口径")
    add("")
    add("事实层是**按（来源目录, model）**分条存的，同一个 model 代码会横跨多个尺寸目录，"
        "各目录的 variant 是**彼此不重叠的真实配置**：")
    add("")
    add(md_table([
        ["`dx008`", "15寸 / 17寸 / 18寸", "2 + 4 + 3", "**9**"],
        ["`a015`", "18寸 / 19寸", "4 + 1", "**5**"],
        ["`dx189`", "越野款（单条记录内已跨 15/17/18）", "7", "**7**"],
    ], ["型号", "出现的来源目录", "各记录变体数", "合并后"]))
    add("")
    add(f"实测全库 **{f['groups']}** 个唯一型号来自 **{f['total']}** 条源记录"
        f"（合并掉 {f['mergedAway']} 条）。")
    add("")
    add("> ⚠️ 本脚本**上一版**按「保留分高的那条记录」去重，"
        "**丢掉了 257 个变体（734 → 991，26%）** —— 那是真实的数据丢失。"
        "本版改为合并后重新打分，并把合并语义写进产物。")
    add("")

    add("### 0.2 13 / 14 英寸凑不出 30 个 —— 是数据里根本不够")
    add("")
    add("`ALL.json` 里 13 寸只有 **1** 个型号、14 寸只有 **2** 个，"
        "且都过不了闸门。这两个尺寸**本期无法上架**，不是挑选标准太严。")
    add("")

    add("### 0.3 styleName 里大量第三方商标 —— 法律风险，不是命名问题")
    add("")
    tm_all = payload["trademarkAllModels"]
    add(f"实测全部 {f['groups']} 个型号里有 **{tm_all} 个"
        f"（{tm_all / f['groups'] * 100:.0f}%）**的 `styleName` 直接写着他人商标。"
        "下面按商标列出其涉及的全部型号数：")
    add("")
    L.extend(md_table([
        ["`HRE`", "56", "第三方轮毂品牌名"],
        ["`BBS`", "55", "第三方轮毂品牌名"],
        ["`WORK`", "44", "第三方轮毂品牌名"],
        ["`TE37`", "40", "第三方轮毂品牌名"],
        ["`RAYS`", "30", "第三方轮毂品牌名"],
        ["`ENKEI`", "12", "第三方轮毂品牌名"],
        ["`OZ`", "6", "第三方轮毂品牌名"],
        ["`VOSSEN`", "6", "第三方轮毂品牌名"],
        ["`WEDS`", "5", "第三方轮毂品牌名"],
        ["`丰田`", "33", "车厂商标"],
        ["`奥迪`", "34", "车厂商标"],
        ["`奔驰`", "30", "车厂商标"],
        ["`宝马`", "28", "车厂商标"],
    ], ["商标", "出现型号数", "性质"]))
    add("")
    add("这些应是供应商用知名型号名做的**样式指代**。若直接当自家产品名对外发布，"
        "有商标侵权风险 —— 与设计稿「第三方款式名默认不进入公开视图」一致。")
    add("")
    add(f"**因此本候选集把「styleName 含商标」整体排除** —— 在前两道闸"
        f"（有图 + 规格齐）已过的型号里，这一条又打掉 **{f['trademark']}** 个"
        f"（全量口径是 {tm_all} 个）。")
    add("")
    add("> ⚠️ 判定用的是**关键词启发式**，是**下界不是完整检索**。"
        "真实合规审查仍需人工过一遍，别把本清单当法律意见。")
    add("")

    add("### 0.4 「好一点」是怎么算的")
    add("")
    add("闸门（必须**全过**）：")
    add("")
    add("- **G1 有图** —— 无图无法成页（沿用生成器 DEC-013 上架门槛）")
    add("- **G2 规格齐** —— 至少一条 variant 的尺寸/孔距/偏距/中心孔/颜色齐全")
    add("- **G3 无第三方商标** —— 见 0.3")
    add("")
    add("过闸后再打分排序（0–100 分，权重写在脚本顶部常量，**可调**）：")
    add("")
    L.extend(md_table([
        ["图片丰富度", f"{payload['weights']['image']}", "图片张数（上限 5 张）—— 图多才好成页"],
        ["工艺含金量", f"{payload['weights']['process']}", "旋压/低压+旋压/锻造 满分；低压半分；未标注 0"],
        ["规格广度", f"{payload['weights']['variants']}", "variant 条数（上限 8 条）—— 可下单配置越多越好卖"],
        ["颜色可选", f"{payload['weights']['finish']}", "颜色数（上限 5 种）"],
        ["规格完整度", f"{payload['weights']['complete']}", "五字段齐全的 variant 占比"],
        ["孔距广度", f"{payload['weights']['pcd']}", "孔距数（上限 3 种）—— 适配车型面"],
    ], ["维度", "满分", "口径"]))
    add("")

    add("## 1. 闸门漏斗")
    add("")
    L.extend(md_table([
        ["源记录数", str(f["total"]), "按（来源目录, model）分条"],
        ["按 model 合并后", str(f["groups"]), f"合并掉 {f['mergedAway']} 条重复记录"],
        ["— 无图剔除", f"-{f['noImage']}", "无图不成页"],
        ["— 规格不全剔除", f"-{f['incompleteSpec']}", "无一条完整 variant"],
        ["— 含第三方商标剔除", f"-{f['trademark']}", "见 0.3"],
        ["**过闸候选**", f"**{f['uniqueCandidates']}**", "按 model 合并后的唯一型号数"],
    ], ["阶段", "型号数", "说明"]))
    add("")

    add("## 2. 每个尺寸的可用量与缺口")
    add("")
    rows = []
    for d, s in payload["summary"].items():
        rows.append([f"{d} 英寸", str(s["available"]), str(s["selected"]),
                     ("—" if s["shortfall"] == 0 else f"**缺 {s['shortfall']}**")])
    for d in ("13", "14"):
        if d not in payload["summary"]:
            rows.append([f"{d} 英寸", "0", "0", "**缺 30**（数据里不足）"])
    L.extend(md_table(rows, ["直径", "过闸可用", "已选", "缺口"]))
    add("")
    tight = sorted(((d, v["available"]) for d, v in payload["summary"].items()
                    if v["shortfall"] > 0 or v["available"] < PER_SIZE * 1.5),
                   key=lambda kv: kv[1])
    if tight:
        parts = "、".join(f"{d} 英寸仅 **{n}** 个过闸" for d, n in tight)
        add(f"> {parts} —— 这几个尺寸的 {PER_SIZE} 个候选**几乎没有挑选余地**，"
            "等于把绝大多数可用型号都放进去。若后续要严格把关，"
            "建议这几个尺寸降低目标数量，而不是放宽门槛。")
    add("")

    add("## 2.5 各尺寸为什么只剩这些（剔除原因拆解）")
    add("")
    add("同一直径的可用量差异极大，原因不在筛选标准，而在数据本身。"
        "下表按尺寸拆开每道闸打掉了多少（型号可属多尺寸，故为出现次数）：")
    add("")
    dr = payload["dropReasonByDiameter"]
    rows = []
    for d in sorted(dr, key=int):
        v = dr[d]
        total_entries = (v.get("noImage", 0) + v.get("incompleteSpec", 0)
                         + v.get("trademark", 0) + v.get("pass", 0))
        rows.append([f"{d} 英寸", str(total_entries), str(v.get("noImage", 0)),
                     str(v.get("incompleteSpec", 0)), str(v.get("trademark", 0)),
                     f"**{v.get('pass', 0)}**"])
    L.extend(md_table(rows, ["直径", "含该尺寸的型号", "无图", "规格不全", "含商标", "过闸"]))
    add("")

    add("## 3. 候选明细（按尺寸）")
    add("")
    add("字段说明：`分` = 总分；`图/规格/颜色` = 图片张数/合并后 variant 数/颜色数；"
        "`记录` = 该型号由几条源记录合并而来（>1 表示跨尺寸目录）；"
        "`跨` = 该型号同时也出现在哪些尺寸。")
    add("")

    for d in sorted(payload["selection"], key=int):
        lst = payload["selection"][d]
        total_avail = payload["summary"][d]["available"]
        add(f"### 3.{d} 英寸（已选 {len(lst)} / 可用 {total_avail}）")
        add("")
        rows = []
        for i, c in enumerate(lst, 1):
            others = [x for x in c["diameters"] if x != d]
            rows.append([
                str(i), f"`{esc(c['model'])}`", esc(c["sizeCategory"]),
                esc(c["process"]), esc(c["styleName"]),
                str(c["nVariants"]), str(c["nImages"]), f"{c['score']:.1f}",
                str(c["sourceRecordCount"]),
                ("、".join(others) + "寸" if others else "—"),
            ])
        L.extend(md_table(rows, ["#", "型号", "主目录", "工艺", "款式名",
                                 "规格数", "图数", "分", "记录", "跨"]))
        add("")
        add("图片文件名（供人工核对画面，媒体标题不可信）：")
        add("")
        add("```text")
        for c in lst[:PER_SIZE]:
            add(f"{c['model']}\t" + ", ".join(c["images"]))
        add("```")
        add("")

    add("## 4. 需要拍板的")
    add("")
    add("1. **13 / 14 英寸怎么办** —— 数据里确实没有，放弃，还是从 inbox 那套（6109 条）里补？")
    add("2. **被打掉的商标型号怎么处理** —— 永久排除？"
        "还是改名后可用（用编号作对外名，styleName 只留内部）？")
    add("3. **30 这个数字对 15 / 20 英寸是否合适** —— 可用量少，等于全放。")
    add("4. **打分权重是否认可** —— 尤其「工艺含金量 25 分」。")
    add("5. `processConflict` / `styleNameConflict` 的型号（合并后冲突）如何取舍。")
    add("")

    with open(os.path.join(OUT_DIR, "wheel-first-batch-by-size.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(L) + "\n")
    print(f"已写出 {os.path.join(OUT_DIR, 'wheel-first-batch-by-size.md')}")


if __name__ == "__main__":
    main()
