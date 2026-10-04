#!/usr/bin/env python3
"""
Inject a §0.5 (viewport-driven) section into PAGE-SPECS route specs.

Why this script exists
----------------------
The viewport principle (`DESIGN.md` §0.5) has to be restated in every route
spec, because the spec is the document a builder actually opens. Doing that by
hand across 12 files guarantees drift: the eleventh file gets a slightly
different table shape, and the audit findings get paraphrased into something the
audit did not say.

So the section is generated from the two authoritative sources instead:
  * the viewport split table   <- `_viewport-audit.md` §N §A (already audited)
  * the violation verdicts     <- `_viewport-audit.md` §N §B (already judged)
and the only hand-written part is the per-page mapping (below), which records
which audit section belongs to which spec file.

⚠️ This does NOT invent findings. If a page has no audit row, the script says so
rather than guessing. A spec whose page was never audited gets a §0.5 that
states the split is unverified — which is the honest state.

Usage:
    python3 scripts/inject-viewport-specs.py [--dry-run] [--only <name>]
"""

import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIT = ROOT / "PAGE-SPECS" / "_viewport-audit.md"

# spec path (relative to PAGE-SPECS/) -> (audit section number, page route, live source file)
# `audit=None` means the page was never audited; §0.5 says so explicitly.
MAPPING = {
    "about.md":                       (12,   "/about",                          "src/app/about/page.tsx"),
    "capabilities.md":                (5,    "/capabilities",                   "src/app/capabilities/page.tsx"),
    "contact.md":                     (8,    "/contact",                        "src/app/contact/page.tsx"),
    "custom-development.md":          (6,    "/custom-development",             "src/app/custom-development/page.tsx"),
    "products/custom-aluminum.md":    (14,   "/products/custom-aluminum",       "src/app/products/custom-aluminum/page.tsx"),
    "products/ev-components.md":      (13,   "/products/ev-components",         "src/app/products/ev-components/page.tsx"),
    "products/safety-tires.md":       (15,   "/products/safety-tires",          "src/app/products/safety-tires/page.tsx"),
    "products/wheels.md":             (3,    "/products/wheels",                "src/app/products/wheels/page.tsx"),
    "products/wheels/[model].md":     (4,    "/products/wheels/[sku]",          "src/app/products/wheels/[sku]/page.tsx"),
    "products/wheels/series/[series].md": (None, "/products/wheels/series/[series]", None),
    "request-a-quote.md":             (7,    "/request-a-quote",                "src/app/request-a-quote/page.tsx"),
    "thank-you.md":                   (9,    "/thank-you",                      "src/app/thank-you/page.tsx"),
}

MARKER = "<!-- VIEWPORT-SPEC-INJECTED -->"


def load_audit():
    """Split the audit into {section_number: body}."""
    text = AUDIT.read_text()
    parts = re.split(r"\n## (\d+)\. ", text)
    return {int(parts[i]): parts[i + 1] for i in range(1, len(parts), 2)}


def extract_facts(body, spec_rel, route, source):
    """Pull the audited viewport table + verdicts out of one audit section."""
    facts = {}

    # Page title + code-fact line (how many sections, what the spec demands).
    m = re.search(r"^\*\*代码事实\*\*：(.*?)(?=\n\n)", body, re.S | re.M)
    facts["code_fact"] = m.group(1).strip().replace("\n", " ") if m else None

    # The viewport split table.
    m = re.search(r"### A\. 视口划分表\n(.*?)(?=\n### |\n---|\Z)", body, re.S)
    facts["table"] = m.group(1).strip() if m else None

    # Verdict rows: count ✅ / ⚠️ / 🔴 / 🗑️ directly out of that table.
    counts = {"ok": 0, "crowd": 0, "violate": 0, "merge": 0}
    if facts["table"]:
        for row in facts["table"].splitlines():
            if not row.startswith("|"):
                continue
            if "✅" in row:
                counts["ok"] += 1
            if "⚠️" in row:
                counts["crowd"] += 1
            if "🔴" in row:
                counts["violate"] += 1
            if "🗑️" in row:
                counts["merge"] += 1
    facts["counts"] = counts

    # The B-section verdict headings — these name the actual findings.
    headings = re.findall(
        r"^#### ([^\s｜]*)\s*(B-\d+)｜(.*?)$", body, re.M
    )
    facts["verdicts"] = [
        {"badge": h[0], "id": h[1], "title": h[2].strip()} for h in headings
    ]

    # The section's one-line overall verdict, if the audit wrote one.
    m = re.search(r"### [CD]\. .*?总评\*\*\n+(.*?)(?=\n\n|\n###|\n---|\Z)", body, re.S)
    if not m:
        m = re.search(r"\*\*需[^*]*\*\*", body)
        facts["summary"] = m.group(0).strip() if m else None
    else:
        facts["summary"] = m.group(1).strip()

    return facts


def count_sections(source_rel):
    """Count <section> elements in the live page file."""
    if not source_rel:
        return None
    p = ROOT / source_rel
    if not p.exists():
        return None
    return len(re.findall(r"<section", p.read_text()))


def build_block(spec_rel, audit_no, route, source):
    facts = extract_facts(audit_body[audit_no], spec_rel, route, source) if audit_no else None
    live = count_sections(source)

    lines = []
    lines.append("## 0.5 ★ 视口切分（全页第一原则）")
    lines.append("")
    lines.append("> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。")
    if audit_no:
        lines.append(
            f"> 本节由 `scripts/inject-viewport-specs.py` 从 "
            f"`_viewport-audit.md` §{audit_no} 生成 —— **不复制结论，只搬事实**。"
        )
    else:
        lines.append(
            "> ⚠️ **本页尚未进入 `_viewport-audit.md` 的审计范围** —— "
            "下面的视口切分是**待验证**的，不要当已审结论用。"
        )
    lines.append("")

    # --- 0.5.1 measured vs stated
    lines.append("### 0.5.1 实测现状 vs 规格要求")
    lines.append("")
    if live is not None:
        lines.append(
            f"**代码事实**：`{source}` 实测 **{live} 个 `<section>`**（2026-10-02）。"
        )
    elif source:
        lines.append(f"**代码事实**：`{source}` **实测不存在** —— 该路由未实现。")
    else:
        lines.append(
            f"**代码事实**：`{route}` **在 `src/app/` 下没有对应实现** —— "
            "本规格描述的是一页尚未建的页面。"
        )
    if facts and facts["code_fact"]:
        lines.append("")
        lines.append(f"> 审计原文：{facts['code_fact']}")
    lines.append("")
    lines.append(
        "**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** "
        "施工时先按 §0.5.2 定视口，再往视口里放段。"
    )
    lines.append("")

    # --- 0.5.2 the audited split
    lines.append("### 0.5.2 视口切分（来自审计）")
    lines.append("")
    if facts and facts["table"]:
        lines.append(facts["table"])
        c = facts["counts"]
        lines.append("")
        lines.append(
            f"**判定统计**：✅ {c['ok']} ｜ ⚠️ 拥挤 {c['crowd']} ｜ "
            f"🔴 违规 {c['violate']} ｜ 🗑️ 建议合并/删除 {c['merge']}"
        )
    else:
        lines.append(
            "⚠️ 审计未为本页产出视口划分表 —— "
            "**切分待定**，需先补审计再施工。"
        )
    lines.append("")

    # --- 0.5.3 verdicts
    lines.append("### 0.5.3 审计给出的处置")
    lines.append("")
    if facts and facts["verdicts"]:
        lines.append("| # | 判定 | 审计发现（原文标题） |")
        lines.append("|---|---|---|")
        for v in facts["verdicts"]:
            lines.append(f"| {v['id']} | {v['badge']} | {v['title']} |")
        lines.append("")
        lines.append(
            f"> 逐条理由与建议见 `_viewport-audit.md` §{audit_no} 的 B 小节 —— "
            "**本文件不复制理由，只登记落点**。"
        )
    else:
        lines.append("✅ 审计未对本页提出处置项。")
    lines.append("")

    # --- 0.5.4 height budget
    lines.append("### 0.5.4 高度预算与询盘整屏")
    lines.append("")
    lines.append(
        "| 项 | 要求 |\n|---|---|\n"
        "| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |\n"
        "| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** "
        "（`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |\n"
        "| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |"
    )
    lines.append("")
    lines.append("---")
    lines.append("")

    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--only", default=None)
    args = ap.parse_args()

    global audit_body
    audit_body = load_audit()

    done, skipped, missing = [], [], []

    for spec_rel, (audit_no, route, source) in MAPPING.items():
        if args.only and args.only not in spec_rel:
            continue
        p = ROOT / "PAGE-SPECS" / spec_rel
        if not p.exists():
            missing.append(spec_rel)
            continue

        text = p.read_text()
        if MARKER in text:
            skipped.append(spec_rel)
            continue

        block = MARKER + "\n" + build_block(spec_rel, audit_no, route, source)

        # Insert immediately before "## 1." — never disturb §0 or the rest.
        m = re.search(r"^## 1\.", text, re.M)
        if not m:
            missing.append(f"{spec_rel} (no '## 1.' anchor)")
            continue
        new = text[: m.start()] + block + text[m.start() :]

        if args.dry_run:
            print(f"[dry-run] {spec_rel}: +{len(block)} chars, audit §{audit_no}")
        else:
            p.write_text(new)
        done.append(spec_rel)

    print(f"\n注入 {len(done)} 份 ｜ 已存在跳过 {len(skipped)} ｜ 未找到 {len(missing)}")
    for x in missing:
        print(f"  ⚠️ {x}")


if __name__ == "__main__":
    main()
