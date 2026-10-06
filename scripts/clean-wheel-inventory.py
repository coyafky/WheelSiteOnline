#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
轮毂原始库存数据清洗器 —— 以 Excel 为上游正本。

输入（只读，绝不修改）：
  inbox/蓝辉轻改轮毂库存表20260825-1.xlsx        汇总库存表（15 sheet，供应商体系）
  inbox/蓝辉轮毂/<尺寸目录>/*.xlsx               蓝辉轻改自有品牌（9 目录，含实拍图）

输出：
  outputs/exports/wheel-data-normalized.json     行级规范化结果（含原样单元格）
  outputs/exports/wheel-data-by-size.md          按尺寸分类的 Markdown 底稿

纪律：
  1. 原样保留每个单元格的值与原始行列号，不做静默丢弃。
  2. 字段识别「表头定位 + 值形态校验」双轨，索引允许 ±3 漂移后取最近合法位；
     表头与值不符时回落语义推断并记录来源。
  3. 尺寸码（如 1785）只有在「两位直径 == 所在 sheet/分节直径」时才认作尺寸，
     否则会把品号（1134 / 1663 / 2241）误判成尺寸。
  4. 无法确定尺寸的行单独列出，不猜测、不合并。
  5. 重复编号只标记，不自动合并。
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter, defaultdict

try:
    import openpyxl
except ImportError:  # pragma: no cover
    sys.exit("需要 openpyxl：pip3 install openpyxl")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = os.path.join(ROOT, "inbox", "蓝辉轻改轮毂库存表20260825-1.xlsx")
OWN_BRAND_DIR = os.path.join(ROOT, "inbox", "蓝辉轮毂")
OUT_DIR = os.path.join(ROOT, "outputs", "exports")

CJK = re.compile(r"[\u4e00-\u9fff]")

# ================================================================ 值形态识别

RE_SIZE_DOTTED = re.compile(
    r"^(\d{2})\s*[*×xX,，\-]\s*(\d{1,2}(?:[.,，]\d{1,2})?)\s*[JjBbLlＪ]{0,3}$"
)
RE_SIZE_CODE = re.compile(r"^(\d{2})(\d{2})$")
RE_PCD = re.compile(
    r"^\d{1,2}\s*[*×xX\-]\s*\d{2,3}(?:\.\d+)?"
    r"(?:\s*[/,、*×xX\-]\s*\d{1,3}(?:\.\d+)?)*$"
)
RE_BOLT = re.compile(r"^\d{1,2}\s*[*×xX]\s*\d{1,2}\s*[*×xX]\s*R?\d{1,3}$")
RE_LOAD = re.compile(r"^(\d{3,5})\s*(?:KG|kg|Kg|公斤)$")
RE_WEIGHT = re.compile(r"^(\d{1,2}(?:\.\d+)?)\s*(?:KG|kg|Kg)$")
RE_NUM = re.compile(r"^[+-]?\d+(?:\.\d+)?$")
RE_SECTION = re.compile(r"^(\d{2})\s*寸")
RE_SHEET_SIZE = re.compile(r"(\d{2})\s*寸")
RE_HEADER_HINT = re.compile(r"编号|规格|孔距|ITEM|SIZE|PCD|品号|品名|尺寸")

COLOR_WORDS = (
    "黑", "白", "银", "灰", "枪", "铜", "金", "蓝", "红", "绿", "哑", "亮",
    "原铝", "拉丝", "车边", "车面", "窗口", "全涂", "涂装", "铣", "古铜",
)
VEHICLE_HINTS = (
    "坦克", "途乐", "猛禽", "炮", "普拉多", "汉兰达", "霸道", "陆巡", "途达",
    "牧马人", "撼路者", "揽胜", "奔驰", "宝马", "奥迪", "保时捷", "卡宴",
    "宏光", "五菱", "哈弗", "北京", "奇骏", "欧蓝德", "途昂", "五十铃",
)

HEADER_MAP = [
    ("图片", "image"), ("picture", "image"), ("附图", "refImage"),
    ("厂家/品牌", "factory"), ("品牌/厂家", "factory"), ("厂家/工艺", "factory"),
    ("厂名", "factory"), ("厂家", "factory"), ("品牌", "factory"),
    ("车型", "vehicle"), ("车系", "series"),
    ("产品编号", "itemNo"), ("编号", "itemNo"), ("item", "itemNo"),
    ("品号", "itemNo"), ("型号", "itemNo"),
    ("品名", "itemName"),
    ("规格", "size"), ("size", "size"), ("尺寸", "size"),
    ("孔距", "pcd"), ("pcd", "pcd"),
    ("偏距", "offset"), ("offset", "offset"), ("et", "offset"),
    ("中心孔", "cb"), ("c.b.", "cb"), ("cb", "cb"),
    ("颜色", "finish"), ("color", "finish"),
    ("款式名称", "styleName"),
    ("重量", "weight"), ("载荷", "load"),
    ("螺栓孔", "boltHole"),
    ("备注", "remark"),
    ("实际库存", "stock"), ("库存", "stock"), ("数量", "stock"),
    ("盖子", "cap"), ("内外", "position"),
    ("工艺", "process"), ("名称", "name"), ("价格", "price"),
]

FIELD_PRIORITY = [
    "size", "pcd", "boltHole", "cb", "offset",
    "itemNo", "load", "weight", "finish",
]


def clean(value) -> str:
    if value is None:
        return ""
    text = str(value).replace("\u3000", " ").strip()
    return re.sub(r"\s+", " ", text)


def norm_header(label: str) -> str | None:
    key = re.sub(r"[\s\n\r]+", "", label).lower()
    if not key:
        return None
    for frag, field in HEADER_MAP:
        if frag in key:
            return field
    return None


# ---------------------------------------------------------------- 字段校验器


def parse_size(cell: str, ctx: str | None):
    """返回 (直径, 宽度英寸文本)；无法判定返回 None。"""
    if not cell:
        return None
    m = RE_SIZE_DOTTED.match(cell)
    if m and 11 <= int(m.group(1)) <= 26:
        width = m.group(2).replace("，", ".").replace(",", ".")
        return m.group(1), width
    m = RE_SIZE_CODE.match(cell)
    if m:
        d, w = m.group(1), int(m.group(2))
        if not (11 <= int(d) <= 26):
            return None
        if 40 <= w <= 99:
            if ctx is None or d == ctx:
                return d, f"{w / 10:g}"
    return None


def canon(cell: str) -> str:
    """剥离中文注记后的规范值（如 5/139.7锥孔 -> 5/139.7）。"""
    return re.sub(r"[\u4e00-\u9fff：:；;]+", "", cell).strip()


def norm_tokens(cell: str) -> list[str]:
    """把 PCD / 螺栓孔这类分隔符混排的单元格切成 token。"""
    c = (cell.replace("，", ",").replace("、", ",").replace("／", "/")
             .replace("×", "*").replace("x", "*").replace("X", "*"))
    c = re.sub(r"(?<=\d),(?=\d)", ".", c)          # 114,3 -> 114.3
    c = re.sub(r"[\u4e00-\u9fff：:；;]+", " ", c)     # 去掉中文注记（如「锥孔」）
    c = (c.replace("+", " ").replace("H", " ").replace("h", " ")
          .replace("-", " ").replace("/", " ").replace(",", " ")
          .replace("*", " "))
    return [t for t in re.split(r"\s+", c.strip()) if t]


RE_BORE = re.compile(r"^\d{2,3}(?:\.\d+)?$")
RE_BOLT_TOK = re.compile(r"^(\d{1,2})[Hh]?$")
RE_ANY_NUM_TOK = re.compile(r"^R?\d{1,3}$")


def as_pcd(cell: str) -> str | None:
    """孔距：6*139.7 / 8*100/114.3 / 8H/100/114.3 / 5*112 5*114.3 / 100-114.3。"""
    if not cell:
        return None
    toks = norm_tokens(cell)
    if not toks:
        return None
    # 主解析：若干组「螺栓数 + 一个以上孔径」
    i, groups, ok = 0, 0, True
    while i < len(toks):
        m = RE_BOLT_TOK.match(toks[i])
        if not m:
            ok = False
            break
        bolts = int(m.group(1))
        if not 3 <= bolts <= 10:
            ok = False
            break
        i += 1
        bores = 0
        while i < len(toks) and RE_BORE.match(toks[i]):
            if float(toks[i]) < 50:
                # 小于 50 的不可能是孔径，交回外层当作下一组的螺栓数
                break
            bores += 1
            i += 1
        if not ok or bores == 0:
            ok = False
            break
        groups += 1
    if ok and groups and i == len(toks):
        return canon(cell)
    # 兜底：纯孔径范围，如 112-114.3（必须是两个孔径 token，
    # 否则「10*100」这类 2 位数螺栓数会被误吞）
    if len(toks) == 2 and all(RE_BORE.match(t) for t in toks):
        if all(float(t) >= 50 for t in toks):
            return canon(cell)
    return None


def as_bolt(cell: str) -> str | None:
    """螺栓孔三联：15*32*60 / 32*15*60 / 15*32*R14。"""
    if not cell:
        return None
    toks = norm_tokens(cell)
    if len(toks) != 3 or not all(RE_ANY_NUM_TOK.match(t) for t in toks):
        return None
    nums = [float(t.lstrip("R")) for t in toks]
    if nums[0] <= 45 and nums[1] <= 45 and nums[2] <= 85:
        return cell
    return None


def as_offset(cell: str) -> str | None:
    """偏距 ET：实测区间集中在 0~45，放宽到 -30~65。"""
    if cell and RE_NUM.match(cell):
        num = float(cell)
        if -30 <= num <= 65:
            return cell
    return None


def as_cb(cell: str) -> str | None:
    """中心孔 CB：实测区间 54~134.6。"""
    if cell and RE_NUM.match(cell):
        num = float(cell)
        if 50 <= num <= 160:
            return cell
    return None


def as_item(cell: str, ctx: str | None = None) -> str | None:
    if not cell or CJK.search(cell) or len(cell) < 2 or len(cell) > 32:
        return None
    if cell.startswith("="):
        return None
    if as_pcd(cell) or as_bolt(cell) or parse_size(cell, ctx):
        return None
    if RE_LOAD.match(cell) or RE_WEIGHT.match(cell):
        return None
    if any(w in cell for w in COLOR_WORDS):
        return None
    if not re.search(r"[A-Za-z0-9]", cell):
        return None
    return cell


def as_finish(cell: str) -> str | None:
    if cell and any(w in cell for w in COLOR_WORDS):
        return cell
    return None


def _const(match_fn):
    return lambda cell, ctx=None: cell if match_fn(cell) else None


def _canon_pcd(cell, ctx=None):
    return as_pcd(cell)


VALIDATORS = {
    "size": lambda cell, ctx=None: cell if parse_size(cell, ctx) else None,
    "pcd": _canon_pcd,
    "boltHole": _const(as_bolt),
    "cb": _const(as_cb),
    "offset": _const(as_offset),
    "itemNo": as_item,
    "load": _const(lambda c: RE_LOAD.match(c)),
    "weight": _const(lambda c: RE_WEIGHT.match(c)),
    "finish": _const(as_finish),
}


SHAPE_ORDER = [
    ("size", lambda c, ctx: bool(parse_size(c, ctx))),
    ("boltHole", lambda c, ctx: bool(as_bolt(c))),
    ("pcd", lambda c, ctx: bool(as_pcd(c))),
    ("load", lambda c, ctx: bool(RE_LOAD.match(c))),
    ("weight", lambda c, ctx: bool(RE_WEIGHT.match(c))),
    ("cb", lambda c, ctx: bool(as_cb(c))),
    ("offset", lambda c, ctx: bool(as_offset(c))),
    ("finish", lambda c, ctx: bool(as_finish(c))),
]


CRITICAL_FIELDS = {"size", "pcd", "offset", "cb", "boltHole", "load", "weight", "finish"}


def shapes_of(cell: str, ctx: str | None = None) -> set[str]:
    """不看表头，只看值的形态，返回它可能是的字段集合。
    返回集合而非单值，是因为 ET 与 CB 在 50~65 区间天然重叠。"""
    if not cell or CJK.search(cell):
        return set()
    return {field for field, test in SHAPE_ORDER if test(cell, ctx)}


def resolve_fields(cells: list[str], header_fields: list[str | None], ctx: str | None):
    """表头定位（索引允许 ±3 漂移，取最近合法位）+ 语义回落。"""
    out: dict[str, str] = {}
    src: dict[str, str] = {}
    used: set[int] = set()

    hpos: dict[str, int] = {}
    if header_fields:
        for i, f in enumerate(header_fields):
            if f and f not in hpos:
                hpos[f] = i

    def try_at(field: str, idx: int) -> bool:
        if idx in used or not (0 <= idx < len(cells)):
            return False
        cell = cells[idx]
        if not cell:
            return False
        ok = VALIDATORS[field](cell, ctx)
        if ok is None:
            return False
        out[field] = cell
        src[field] = "header" if idx == hpos.get(field) else f"header{idx - hpos[field]:+d}"
        used.add(idx)
        return True

    # 1) 表头定位，允许索引漂移
    for field in FIELD_PRIORITY:
        if field not in hpos:
            continue
        base = hpos[field]
        for delta in (0, -1, 1, -2, 2, -3, 3):
            if try_at(field, base + delta):
                break

    # 2) 语义补齐
    for field in FIELD_PRIORITY:
        if field in out:
            continue
        for idx, cell in enumerate(cells):
            if idx in used or not cell:
                continue
            ok = VALIDATORS[field](cell, ctx)
            if ok is not None:
                out[field] = cell
                src[field] = "value"
                used.add(idx)
                break

    # 3) 尺寸兜底：全行扫描（先点号式，再尺寸码）
    if "size" not in out:
        for idx, cell in enumerate(cells):
            if idx in used or not cell:
                continue
            pair = parse_size(cell, ctx)
            if pair:
                out["size"] = cell
                src["size"] = "value-scan"
                used.add(idx)
                break

    out["_source"] = src
    out["_unassigned"] = [
        c for i, c in enumerate(cells)
        if i not in used and c and not c.startswith("=")
    ]
    return out


# ================================================================ 行解析


def build_rows(rows, origin: str, sheet_diameter: str | None, image_index=None):
    header_fields = None
    header_row = None
    header_cells = None
    first_data = None
    section_diameter = None
    records, skipped = [], []

    for rno, cells, verbatim in rows:
        joined = " ".join(cells)

        # 分节行（越野款 / XR 轮毂用）
        if RE_SECTION.match(cells[0] if cells else "") and all(c == "" for c in cells[1:]):
            m = RE_SECTION.match(cells[0])
            section_diameter = m.group(1)
            continue
        if len(cells) == 1 and RE_SECTION.match(cells[0]):
            section_diameter = RE_SECTION.match(cells[0]).group(1)
            continue

        # 表头行
        if RE_HEADER_HINT.search(joined) and len(cells) >= 3:
            mapped = [norm_header(c) for c in cells]
            if sum(1 for m in mapped if m) >= 3:
                if header_fields is None:
                    header_row, header_cells = rno, list(cells)
                header_fields = mapped
                continue

        ctx = section_diameter or sheet_diameter

        # 无任何可识别内容的行
        if not any(VALIDATORS["size"](c, ctx) or as_pcd(c) or as_item(c, ctx) or as_finish(c)
                   for c in cells if c):
            skipped.append({"row": rno, "cells": cells})
            continue

        if first_data is None and header_fields is not None:
            first_data = list(cells)
        f = resolve_fields(cells, header_fields, ctx)
        pair = parse_size(f.get("size", ""), ctx) if f.get("size") else None
        diameter, width, size_source = None, "", ""
        if pair:
            diameter, width, size_source = pair[0], pair[1], "row"
        if diameter is None and ctx:
            diameter, size_source = ctx, ("section" if section_diameter else "sheet")

        rec = {
            "origin": origin,
            "row": rno,
            "diameter": diameter,
            "widthInch": width,
            "sizeSource": size_source,
            "sizeRaw": f.get("size", ""),
            "itemNo": f.get("itemNo", ""),
            "pcd": f.get("pcd", ""),
            "offset": f.get("offset", ""),
            "cb": f.get("cb", ""),
            "boltHole": f.get("boltHole", ""),
            "finish": f.get("finish", ""),
            "load": f.get("load", ""),
            "weight": f.get("weight", ""),
            "vehicle": f.get("vehicle", ""),
            "stock": f.get("stock", ""),
            "remark": f.get("remark", ""),
            "factory": f.get("factory", ""),
            "styleName": f.get("styleName", ""),
            "position": f.get("position", ""),
            "fieldSource": f.get("_source", {}),
            "unassigned": f.get("_unassigned", []),
            "raw": cells,
            "rawVerbatim": verbatim,
        }
        rec["semanticFields"] = sorted(
            k for k, v in rec["fieldSource"].items() if v.startswith("value") or v.startswith("header")
        )
        if image_index is not None:
            rec["images"] = match_images(rec, image_index)
        records.append(rec)

    drift = []
    if header_cells and first_data:
        for i, label in enumerate(header_fields or []):
            if not label or label not in CRITICAL_FIELDS:
                continue
            if i >= len(first_data) or not first_data[i]:
                continue
            cands = shapes_of(first_data[i], sheet_diameter or section_diameter)
            if cands and label not in cands:
                drift.append({
                    "col": i + 1,
                    "headerLabel": header_cells[i] if i < len(header_cells) else "",
                    "declared": label,
                    "actualCandidates": sorted(cands),
                    "value": first_data[i],
                })
    header_info = None
    if header_cells:
        header_info = {
            "origin": origin, "headerRow": header_row,
            "headerCells": header_cells,
            "mapped": header_fields,
            "firstDataRow": None,
            "firstDataCells": first_data,
            "drift": drift,
        }
    return records, skipped, header_info


def match_images(rec, image_index):
    """自有品牌：实拍图文件名形如 <尺寸码>_<品号>[_n].ext"""
    if not rec["itemNo"]:
        return []
    keys = [f"{rec['sizeRaw'].replace('*', '')}_{rec['itemNo']}" if rec["sizeRaw"] else None]
    if rec.get("diameter") and rec.get("widthInch"):
        code = f"{rec['diameter']}{int(float(rec['widthInch']) * 10):02d}"
        keys.append(f"{code}_{rec['itemNo']}")
    out = []
    for k in keys:
        if k and k in image_index:
            out = image_index[k]
            break
    return out


# ================================================================ 数据源


def read_sheet_rows(ws):
    """返回 [(行号, 归一化单元格, 字节级原值单元格)]。"""
    out = []
    for rno, row in enumerate(ws.iter_rows(values_only=True), start=1):
        verb = ["" if c is None else str(c) for c in row]
        cells = [clean(c) for c in row]
        while cells and cells[-1] == "":
            cells.pop()
        while verb and verb[-1].strip() == "":
            verb.pop()
        if any(cells):
            out.append((rno, cells, verb))
    return out


def load_master():
    wb = openpyxl.load_workbook(MASTER, read_only=True, data_only=True)
    sheets = {ws.title: read_sheet_rows(ws) for ws in wb.worksheets}
    wb.close()
    return sheets


def load_own_brand():
    out = {}
    for folder in sorted(os.listdir(OWN_BRAND_DIR)):
        fpath = os.path.join(OWN_BRAND_DIR, folder)
        if not os.path.isdir(fpath):
            continue
        for book in sorted(os.listdir(fpath)):
            if not book.lower().endswith(".xlsx"):
                continue
            wb = openpyxl.load_workbook(os.path.join(fpath, book), read_only=True, data_only=True)
            rows = []
            for ws in wb.worksheets:
                rows.extend(read_sheet_rows(ws))
            wb.close()
            out[f"{folder}/{book}"] = rows
    return out


def build_image_index():
    idx = defaultdict(list)
    for folder in sorted(os.listdir(OWN_BRAND_DIR)):
        fpath = os.path.join(OWN_BRAND_DIR, folder)
        if not os.path.isdir(fpath):
            continue
        for root, _dirs, files in os.walk(fpath):
            for name in sorted(files):
                if not name.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                    continue
                stem = os.path.splitext(name)[0]
                stem = re.sub(r"_\d+$", "", stem)
                idx[stem].append(os.path.relpath(os.path.join(root, name), ROOT))
    return idx


# ================================================================ 主流程

NON_WHEEL = {"目录", "1-JJ-轮胎", "1-JJ-配件", "1-JJ-车型中心孔"}


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    print("读取总表（138MB，只读）…", flush=True)
    master = load_master()
    print("读取自有品牌目录…", flush=True)
    own = load_own_brand()
    image_index = build_image_index()

    all_records, all_skipped, sheet_index, all_headers = [], [], [], []

    for title, rows in master.items():
        if title in NON_WHEEL:
            continue
        m = RE_SHEET_SIZE.search(title)
        sd = m.group(1) if m else None
        recs, skip, hdr = build_rows(rows, f"汇总表/{title}", sd)
        if hdr: all_headers.append(hdr)
        all_records.extend(recs)
        all_skipped.extend({"origin": f"汇总表/{title}", **s} for s in skip)
        sheet_index.append({"origin": f"汇总表/{title}", "kind": "master",
                            "rows": len(rows), "parsed": len(recs), "skipped": len(skip)})

    for title, rows in own.items():
        if "电动踏板" in title:
            sheet_index.append({"origin": f"自有品牌/{title}", "kind": "non-wheel",
                                "rows": len(rows), "parsed": 0, "skipped": len(rows)})
            continue
        m = RE_SHEET_SIZE.search(title)
        sd = m.group(1) if m else None
        recs, skip, hdr = build_rows(rows, f"自有品牌/{title}", sd, image_index)
        if hdr: all_headers.append(hdr)
        all_records.extend(recs)
        all_skipped.extend({"origin": f"自有品牌/{title}", **s} for s in skip)
        sheet_index.append({"origin": f"自有品牌/{title}", "kind": "own-brand",
                            "rows": len(rows), "parsed": len(recs), "skipped": len(skip)})

    by_diameter = defaultdict(list)
    unclassified = []
    for rec in all_records:
        (by_diameter[rec["diameter"]] if rec["diameter"] else unclassified).append(rec)

    item_counter = Counter(r["itemNo"] for r in all_records if r["itemNo"])
    dup_items = {k: v for k, v in item_counter.items() if v > 1}

    illegal_url = sorted({r["itemNo"] for r in all_records
                          if r["itemNo"] and re.search(r"[^A-Za-z0-9\-_]", r["itemNo"])})
    missing = Counter()
    for rec in all_records:
        for f in ("sizeRaw", "pcd", "cb", "offset", "finish", "itemNo"):
            if not rec.get(f):
                missing[f] += 1

    result = {
        "sourceFiles": [
            "inbox/蓝辉轻改轮毂库存表20260825-1.xlsx",
            "inbox/蓝辉轮毂/*/*.xlsx",
        ],
        "sheets": sheet_index,
        "totals": {
            "records": len(all_records),
            "classified": len(all_records) - len(unclassified),
            "unclassified": len(unclassified),
            "skippedRows": len(all_skipped),
            "distinctItemNo": len(item_counter),
            "duplicateItemNo": len(dup_items),
        },
        "byDiameter": {k: len(v) for k, v in sorted(by_diameter.items(), key=lambda kv: int(kv[0]))},
        "missingFieldCounts": dict(missing),
        "illegalUrlChars": illegal_url,
        "duplicateItemNo": dict(sorted(dup_items.items(), key=lambda kv: -kv[1])),
        "headers": all_headers,
        "unclassifiedRows": [{"origin": r["origin"], "row": r["row"], "raw": r["raw"]} for r in unclassified],
        "records": all_records,
        "skipped": all_skipped,
    }
    with open(os.path.join(OUT_DIR, "wheel-data-normalized.json"), "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=1)

    print(json.dumps({
        "totals": result["totals"],
        "byDiameter": result["byDiameter"],
        "missing": result["missingFieldCounts"],
        "illegalUrlChars": len(illegal_url),
        "duplicateItemNo": len(dup_items),
    }, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
