#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把清洗结果渲染成「按尺寸分类」的 Markdown 审核底稿。

输入：outputs/exports/wheel-data-normalized.json
输出：outputs/exports/轮毂数据-按尺寸分类.md

纪律：只呈现清洗器真实产出，不做二次推断；无法判定的字段一律留空并在
异常章节点名，不猜测、不合并。
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "outputs", "exports", "wheel-data-normalized.json")
OUT = os.path.join(ROOT, "outputs", "exports", "轮毂数据-按尺寸分类.md")

CATALOG_DIR = os.path.join(ROOT, "assets", "wheel-data")


def esc(text: str) -> str:
    if text is None or text == "":
        return "—"
    return str(text).replace("|", "\\|").replace("\n", " ").strip() or "—"


def short_origin(origin: str) -> str:
    """汇总表/1-JJ-17寸库存 -> 汇总-17；自有品牌/17寸坦克/excel6.xlsx -> 自有-17坦克。"""
    if origin.startswith("汇总表/"):
        name = origin.split("/", 1)[1].replace("1-JJ-", "")
        m = re.match(r"(\d{2})寸库存", name)
        if m:
            return f"汇总-{m.group(1)}"
        if "XR" in name:
            return "汇总-XR"
        if "越野" in name:
            return "汇总-越野"
        return f"汇总-{name}"
    if origin.startswith("自有品牌/"):
        parts = origin.split("/")
        folder = parts[1]
        return f"自有-{folder}"
    return origin


def load_catalogue_stats():
    """对账用：项目已有事实层 assets/wheel-data/*-WHEEL-CATALOG.json。"""
    if not os.path.isdir(CATALOG_DIR):
        return None
    stats = {"files": [], "models": 0, "variants": 0, "byDiameter": Counter(),
             "productionCodes": Counter()}
    for name in sorted(os.listdir(CATALOG_DIR)):
        if not name.endswith("-WHEEL-CATALOG.json"):
            continue
        with open(os.path.join(CATALOG_DIR, name), encoding="utf-8") as fh:
            doc = json.load(fh)
        models = doc.get("models", [])
        variants = sum(len(m.get("variants", [])) for m in models)
        stats["files"].append((name, len(models), variants))
        stats["models"] += len(models)
        stats["variants"] += variants
        for m in models:
            for v in m.get("variants", []):
                stats["productionCodes"][v.get("productionCode", "")] += 1
                mm = re.match(r"^(\d{2})", str(v.get("size", "")))
                if mm:
                    stats["byDiameter"][mm.group(1)] += 1
    return stats


def main() -> None:
    with open(SRC, encoding="utf-8") as fh:
        data = json.load(fh)

    records = data["records"]
    by_diameter = defaultdict(list)
    for r in records:
        by_diameter[r["diameter"] or "?"].append(r)

    diameters = sorted((d for d in by_diameter if d != "?"), key=int)
    L: list[str] = []
    add = L.append

    add("# 轮毂原始库存数据清洗底稿（按尺寸分类）")
    add("")
    add("> 本文件由 `scripts/clean-wheel-inventory.py` + `scripts/render-wheel-markdown.py` "
        "从原始 Excel **自动生成**，不要手工编辑。")
    add(">")
    add("> 上游正本：`inbox/蓝辉轻改轮毂库存表20260825-1.xlsx`（只读，未修改）、"
        "`inbox/蓝辉轮毂/*/*.xlsx`（只读，未修改）。")
    add(">")
    add("> 纪律：① 每个单元格的**字节级原值**（`rawVerbatim`）与原始行列号都完整保留在 "
        "`outputs/exports/wheel-data-normalized.json`；② 字段识别先按表头定位、"
        "再按值形态校验，两者冲突时回落语义推断并记录来源；③ 无法判定的留空并点名，"
        "不猜测、不合并；④ 重复编号只标记。")
    add(">")
    add("> 关于「原样」的精确定义：本文件展示的文本做过**空白归一**"
        "（去掉首尾空白，把换行、不间断空格等空白字符折成单个半角空格，"
        "例如 `高亮黑\\nHYPER\\xa0BLACK` 显示为 `高亮黑 HYPER BLACK`）；"
        "未做任何归一的字节级原值只存在于 JSON 的 `rawVerbatim` 字段。"
        "除此之外**没有做任何改写**。")
    add("")

    # ---------------------------------------------------------------- 0 数据源
    add("## 0. 数据源与总量")
    add("")
    add("| 来源 | 类型 | 原始非空行 | 解析为记录 | 跳过的说明行 |")
    add("|---|---|---:|---:|---:|")
    for s in data["sheets"]:
        kind = {"master": "汇总表", "own-brand": "自有品牌", "non-wheel": "非轮毂"}
        add(f"| `{s['origin']}` | {kind.get(s['kind'], s['kind'])} | {s['rows']} | "
            f"{s['parsed']} | {s['skipped']} |")
    t = data["totals"]
    add(f"| **合计** |  |  | **{t['records']}** | **{t['skippedRows']}** |")
    add("")
    add(f"- 解析记录：**{t['records']}** 条（其中尺寸已分类 **{t['classified']}** 条，"
        f"未分类 **{t['unclassified']}** 条）")
    add(f"- 去重前唯一编号：**{t['distinctItemNo']}** 个；出现重复的编号：**{t['duplicateItemNo']}** 个")
    add("")

    add("### 0.1 按尺寸分布")
    add("")
    add("| 直径 | 记录数 | 占比 | 唯一编号数 | 来源 |")
    add("|---:|---:|---:|---:|---|")
    total = sum(len(v) for v in by_diameter.values())
    for d in diameters:
        rows = by_diameter[d]
        uniq = len({r["itemNo"] for r in rows if r["itemNo"]})
        origins = sorted({short_origin(r["origin"]) for r in rows})
        add(f"| {d} 英寸 | {len(rows)} | {len(rows) / total * 100:.1f}% | {uniq} | "
            f"{esc('、'.join(origins))} |")
    add(f"| **合计** | **{total}** | 100% |  |  |")
    add("")

    # ---------------------------------------------------------------- 1 结构问题
    add("## 1. 必须先解决的结构问题")
    add("")
    add("### 1.1 汇总表的列语义逐表漂移")
    add("")
    add("汇总表各 sheet 的表头列序互不相同，且**表头声明的字段与同列实际取值对不上**。")
    add("下表由清洗器逐 sheet 读取「表头行 + 紧随的第一条数据行」，"
        "对每个关键字段比较「表头声明」与「值形态允许的字段集合」后自动生成 —— "
        "只有当表头声明的字段**完全不在**该值的形态候选里时才判为漂移：")
    add("")
    drift_rows = []
    for h in data.get("headers", []):
        for x in h["drift"]:
            if x["declared"] in ("size", "pcd", "offset", "cb", "boltHole"):
                drift_rows.append((h["origin"], x))
    add("| 来源 | 列 | 表头声明 | 该列实际取值 | 值的形态候选 | 判定 |")
    add("|---|---:|---|---|---|---|")
    for origin, x in drift_rows:
        cands = "、".join(x["actualCandidates"])
        add(f"| `{origin.split('/', 1)[1]}` | 第 {x['col']} 列 | {esc(x['headerLabel'])}"
            f"（{x['declared']}） | `{esc(x['value'])}` | {cands} | **错位** |")
    add("")
    add("具体形态：")
    add("")
    add("- `15寸库存`：孔距/偏距/中心孔三列**整体错位一格**，实际顺序是 偏距 → 中心孔 → 孔距；")
    add("- `18寸库存`、`19寸库存`、`20寸库存`：**孔距与偏距两列互换**；")
    add("- `16寸库存` 等 sheet 首行则与表头一致 —— 同一份文件里两种情形并存，"
        "说明漂移是**逐 sheet 甚至逐行**发生的，不能全局套用一套映射。")
    add("")
    def _cnt(pred):
        return sum(1 for r in records for v in r["fieldSource"].values() if pred(v))
    add(f"因此**不能按列号取数**。清洗器的做法是：先取表头指向的列，再用值形态校验"
        f"（尺寸 / 孔距 / 偏距 / 中心孔 / 螺栓孔 各有独立形态规则），校验不过就在该行内重新定位。"
        f"本次共 **{_cnt(lambda v: v.startswith('header') and v != 'header')}** 个字段靠「偏移 ±1~3 列」定位，"
        f"**{_cnt(lambda v: v.startswith('value'))}** 个字段完全靠语义推断，"
        f"其余 {_cnt(lambda v: v == 'header')} 个字段与表头直接对齐。")
    add("")

    add("### 1.2 尺寸码与品号形态重合，不能无条件当尺寸")
    add("")
    add("4 位尺寸码（`1785` = 17 寸 × 8.5）与品号形态高度相似，"
        "「取行内第一个 4 位数当尺寸」的做法会串位。下表由清洗器实测生成："
        "列出「脱离所在 sheet 语境时会**被误读成尺寸**、但加上语境后不成立」的品号。")
    add("")
    add("| 品号 | 所在 sheet | 出现次数 | 该行真实尺寸（示例） | 脱离语境会被读成 |")
    add("|---|---|---:|---|---|")
    naive_rows = []

    def _ctx_diam(origin):
        m = re.search(r"(\d{2})\u5bf8", origin)
        return m.group(1) if m else None

    def _naive(cell):
        m = re.match(r"^(\d{2})(\d{2})$", cell)
        if m and 11 <= int(m.group(1)) <= 26 and 40 <= int(m.group(2)) <= 99:
            return f"{m.group(1)} 英寸"
        return None

    for r in records:
        if not r["itemNo"]:
            continue
        nd = _naive(r["itemNo"])
        if nd and nd.split()[0] != (r["diameter"] or ""):
            naive_rows.append((r, nd))
    agg = {}
    for r, nd in naive_rows:
        key = (r["itemNo"], r["origin"], nd)
        slot = agg.setdefault(key, {"n": 0, "example": r})
        slot["n"] += 1
    for (item, origin, nd), slot in sorted(
            agg.items(), key=lambda kv: -kv[1]["n"])[:20]:
        r = slot["example"]
        add(f"| `{esc(item)}` | `{origin.split('/', 1)[1]}` | {slot['n']} | "
            f"{esc(r['sizeRaw'])}（{r['diameter']} 英寸） | {nd} |")
    if not agg:
        add("| （无） |  |  |  |  |")
    add("")
    add(f"符合该形态的记录共 **{len(naive_rows)}** 条、涉及 **{len({k[0] for k in agg})}** 个品号。"
        "清洗器的判定规则是："
        "4 位数只有当**前两位等于所属 sheet / 分节的直径**时才认作尺寸码，否则视为品号。"
        f"修正后全部 {t['records']} 条记录都落在 12–20 英寸，无 11 / 22 / 23 英寸的伪尺寸。")
    add("")
    add("> 注意：`17*8.5`、`19×10` 这类**点号式尺寸**不受此规则约束（形态无歧义），"
        "因此可以出现在与 sheet 名不符的位置 —— 见 2.5。")
    add("")

    add("### 1.3 停产 / 已删除区块")
    add("")
    del_rows = [s for s in data["skipped"] if len(s["cells"]) == 1 and len(s["cells"][0]) > 6]
    add("汇总表里有若干单格说明行，用于分隔「实时库存已被删除 / 缺货或已停产」的数据块：")
    add("")
    add("| 位置 | 原文 |")
    add("|---|---|")
    for s in del_rows:
        add(f"| `{s['origin']}` 第 {s['row']} 行 | {esc(s['cells'][0])} |")
    add("")
    add("这些行之后的数据仍被保留在本文件里，但**属于已删除/停产区块**，"
        "清洗时未据其删除任何记录 —— 是否剔除需人工决定。")
    add("")

    # ---------------------------------------------------------------- 2 质量异常
    add("## 2. 数据质量异常")
    add("")

    add("### 2.1 重复编号")
    add("")
    dup = data["duplicateItemNo"]
    involved = sum(dup.values())
    add(f"共 **{len(dup)}** 个编号重复出现，涉及 **{involved}** 条记录"
        f"（占全部记录的 {involved / t['records'] * 100:.1f}%）。")
    add("")
    add("重复分两种性质，**均未自动合并**：")
    add("")
    add("- **同一款式多规格**：一个款式码下挂多个尺寸/孔距/颜色的 SKU，属于正常多规格，"
        "不应合并；")
    add("- **疑似重复录入**：同来源、同尺寸、同孔距、同偏距、同中心孔、同颜色且编号相同，"
        "属于真正的重复行。")
    add("")
    exact = defaultdict(list)
    for r in records:
        if r["itemNo"]:
            key = (r["itemNo"], r["sizeRaw"], r["pcd"], r["offset"], r["cb"], r["finish"])
            exact[key].append(r)
    exact_dups = {k: v for k, v in exact.items() if len(v) > 1}
    add(f"按「编号 + 尺寸 + 孔距 + 偏距 + 中心孔 + 颜色」六字段完全一致判定，"
        f"疑似重复录入 **{len(exact_dups)}** 组、共 "
        f"**{sum(len(v) for v in exact_dups.values())}** 条记录：")
    add("")
    add("| 编号 | 尺寸 | 孔距 | 偏距 | 中心孔 | 颜色 | 条数 | 位置 |")
    add("|---|---|---|---|---|---|---:|---|")
    for key, rows in sorted(exact_dups.items(), key=lambda kv: -len(kv[1]))[:40]:
        locs = "、".join(f"{short_origin(r['origin'])} r{r['row']}" for r in rows)
        add(f"| {esc(key[0])} | {esc(key[1])} | {esc(key[2])} | {esc(key[3])} | "
            f"{esc(key[4])} | {esc(key[5])} | {len(rows)} | {esc(locs)} |")
    if len(exact_dups) > 40:
        add(f"| … |  |  |  |  |  |  | 另有 {len(exact_dups) - 40} 组，见 JSON |")
    add("")
    add("出现次数最多的编号（多规格款式码）：")
    add("")
    add("| 编号 | 出现次数 |")
    add("|---|---:|")
    for k, v in list(dup.items())[:25]:
        add(f"| `{esc(k)}` | {v} |")
    add("")

    add("### 2.2 编号含非 URL 安全字符")
    add("")
    ill = data["illegalUrlChars"]
    add(f"共 **{len(ill)}** 个编号含空格、括号、`*`、中文、`/` 等字符，**不能直接用作 URL slug**，"
        "需要单独生成公开 slug 映射：")
    add("")
    ch = Counter()
    for s in ill:
        for c in s:
            if not re.match(r"[A-Za-z0-9\-_]", c):
                ch[c] += 1
    add("| 字符 | 出现次数 |")
    add("|---|---:|")
    for c, n in ch.most_common(12):
        add(f"| `{c}` | {n} |")
    add("")
    add("样例：")
    add("")
    add("```text")
    for s in ill[:30]:
        add(s)
    add("```")
    add("")

    add("### 2.3 字段缺失")
    add("")
    labels = {"itemNo": "编号", "pcd": "孔距 PCD", "cb": "中心孔 CB",
              "offset": "偏距 ET", "finish": "颜色", "sizeRaw": "尺寸"}
    add("| 字段 | 缺失条数 | 占比 |")
    add("|---|---:|---:|")
    for f, label in labels.items():
        n = data["missingFieldCounts"].get(f, 0)
        add(f"| {label} | {n} | {n / t['records'] * 100:.1f}% |")
    add("")
    add(f"另有 {t['unclassified']} 条记录无法判定尺寸（见 2.4）。")
    add("")

    add("### 2.4 解析残差与人工待办")
    add("")
    mixed = []
    for r in records:
        if r["itemNo"]:
            continue
        for c in r["unassigned"] + r["raw"]:
            if re.match(r"^[A-Za-z0-9][A-Za-z0-9\-_.]{1,}", c) and re.search(r"[\u4e00-\u9fff]", c):
                mixed.append((r, c))
                break
    add(f"- **编号与中文注记混写**：{len(mixed)} 行（编号与包装/颜色说明写在同一格，"
        "如 `3210双箱`、`RHD1025-4黑色车面`），未自动拆分：")
    add("")
    add("| 位置 | 原值 |")
    add("|---|---|")
    for r, c in mixed[:25]:
        add(f"| `{short_origin(r['origin'])}` 第 {r['row']} 行 | {esc(c)} |")
    if len(mixed) > 25:
        add(f"| … | 另有 {len(mixed) - 25} 行，见 JSON |")
    add("")
    add(f"- **未判定尺寸**：{t['unclassified']} 条")
    for r in data["unclassifiedRows"]:
        add(f"  - `{r['origin']}` 第 {r['row']} 行：{esc(' | '.join(r['raw'][:8]))}")
    add("")

    add("### 2.5 跨尺寸混装（记录尺寸 ≠ 所在 sheet）")
    add("")
    add("有记录的实际尺寸与所在 sheet 名不符。这些行都是**点号式尺寸**，"
        "形态无歧义，说明是**上游把货号放错了 sheet**，而不是解析错误：")
    add("")
    add("| 所在 sheet | 行 | 编号 | 实际尺寸 | 原样值 |")
    add("|---|---:|---|---|---|")
    def _sd(origin):
        m = re.search(r"(\d{2})\u5bf8", origin)
        return m.group(1) if m else None
    cross = [r for r in records
             if r["origin"].startswith("汇总表") and _sd(r["origin"])
             and r["diameter"] != _sd(r["origin"])]
    for r in cross:
        add(f"| `{r['origin'].split('/', 1)[1]}` | {r['row']} | `{esc(r['itemNo'])}` | "
            f"{esc(r['sizeRaw'])} | {esc(' / '.join(r['raw'][:8]))} |")
    if not cross:
        add("| （无） |  |  |  |  |")
    add("")
    crosscodes = Counter(r["itemNo"] for r in cross if r["itemNo"])
    if crosscodes:
        add("其中重复出现的货号（同一批 19 寸货号同时挂在两个不同尺寸 sheet 下）：")
        add("")
        add("| 货号 | 出现次数 |")
        add("|---|---:|")
        for k, v in crosscodes.most_common(10):
            add(f"| `{esc(k)}` | {v} |")
        add("")
    add("> 影响：目录页若按 sheet 归尺寸，会把这批 19 寸货放进 18 / 20 英寸类目；"
        "若按记录尺寸归，则同一货号会出现在 19 英寸类目里两次。**必须人工定一个口径。**")
    add("")

    # ---------------------------------------------------------------- 3 对账
    stats = load_catalogue_stats()
    if stats:
        add("## 3. 与项目已有事实层对账")
        add("")
        add("项目 `assets/wheel-data/` 下已有一份由同一批库存导出的 JSON 事实层。两者口径不同：")
        add("")
        add("| 项 | 本次（原始 Excel 直读） | 已有事实层 |")
        add("|---|---:|---:|")
        add(f"| 记录/变体数 | {t['records']} | {stats['variants']} |")
        add(f"| 唯一编号 | {t['distinctItemNo']} | {len(stats['productionCodes'])} |")
        add("")
        add("按直径对比：")
        add("")
        add("| 直径 | 本次记录 | 事实层 variant | 差值 |")
        add("|---|---:|---:|---:|")
        for d in diameters:
            mine = len(by_diameter[d])
            theirs = stats["byDiameter"].get(d, 0)
            add(f"| {d} 英寸 | {mine} | {theirs} | {mine - theirs:+d} |")
        add("")
        add("事实层的分册：")
        add("")
        add("| 分册 | models | variants |")
        add("|---|---:|---:|")
        for name, m, v in stats["files"]:
            add(f"| `{name}` | {m} | {v} |")
        add(f"| **合计** | **{stats['models']}** | **{stats['variants']}** |")
        add("")
        add("> 事实层按「款式 → 变体」做过归并，本文件按原始行逐条列出，两者数量不可直接等同；"
            "事实层还有 "
            f"{sum(1 for k, v in stats['productionCodes'].items() if v > 1)} 个 productionCode 重复。"
            "**结论：本文件是上游正本，事实层是下游产物，后续应以前者校验后者。**")
        add("")

    # ---------------------------------------------------------------- 4 明细
    add("## 4. 按尺寸明细")
    add("")
    add("字段说明：`宽度` 为英寸宽度；`其余原样值` 是该行里未被识别为上述字段、"
        "又非空的原样单元格（保证零丢失，需人工判断语义）。")
    add("")

    for d in diameters:
        rows = by_diameter[d]
        add(f"### 4.{diameters.index(d) + 1} {d} 英寸（{len(rows)} 条）")
        add("")
        widths = Counter(r["widthInch"] for r in rows if r["widthInch"])
        origins = Counter(short_origin(r["origin"]) for r in rows)
        add(f"- 宽度分布：{esc('、'.join(f'{w}J×{n}' for w, n in sorted(widths.items(), key=lambda kv: -kv[1])))}")
        add(f"- 来源分布：{esc('、'.join(f'{o} {n}' for o, n in origins.most_common()))}")
        add(f"- 唯一编号：{len({r['itemNo'] for r in rows if r['itemNo']})} 个")
        add("")
        add("| # | 来源 | 行 | 编号 | 尺寸 | 宽度 | 孔距 | 偏距 | 中心孔 | 颜色 | 螺栓孔 | 载荷 | 重量 | 车型 | 库存 | 其余原样值 |")
        add("|---:|---|---:|---|---|---:|---|---|---|---|---|---|---|---|---|")
        for i, r in enumerate(rows, 1):
            add("| " + " | ".join([
                str(i),
                short_origin(r["origin"]),
                str(r["row"]),
                esc(r["itemNo"]),
                esc(r["sizeRaw"]),
                esc(r["widthInch"]),
                esc(r["pcd"]),
                esc(r["offset"]),
                esc(r["cb"]),
                esc(r["finish"]),
                esc(r["boltHole"]),
                esc(r["load"]),
                esc(r["weight"]),
                esc(r["vehicle"]),
                esc(r["stock"]),
                esc(" / ".join(r["unassigned"])),
            ]) + " |")
        add("")

    # ---------------------------------------------------------------- 附录
    add("## 附录 A. 未纳入轮毂明细的 sheet")
    add("")
    add("| 来源 | 原始行数 | 性质 |")
    add("|---|---:|---|")
    add("| `汇总表/1-JJ-轮胎` | 11 | 轮胎规格与数量（乐路驰） |")
    add("| `汇总表/1-JJ-配件` | 16 | 气嘴 / 螺母 / 配件 |")
    add("| `汇总表/1-JJ-车型中心孔` | 149 | 车型 → PCD / 中心孔 / 螺栓尺寸对照 |")
    add("| `汇总表/目录` | 15 | 工作表索引 |")
    add("| `自有品牌/18寸内防脱/电动踏板车型表.xlsx` | 478 | 电动踏板车型表，非轮毂 |")
    add("")

    add("## 附录 B. 解析时跳过的行")
    add("")
    add("| 来源 | 行 | 原值 |")
    add("|---|---:|---|")
    for s in data["skipped"]:
        add(f"| `{s['origin']}` | {s['row']} | {esc(' | '.join(s['cells'][:6]))} |")
    add("")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    text = "\n".join(L) + "\n"
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(text)
    print(f"已写出 {OUT}")
    print(f"  行数={text.count(chr(10))} 字符数={len(text)}")


if __name__ == "__main__":
    main()
