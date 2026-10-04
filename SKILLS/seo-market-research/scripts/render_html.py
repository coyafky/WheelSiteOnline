#!/usr/bin/env python3
"""Render the skill's Markdown subset to safe standalone HTML."""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path
from urllib.parse import urlsplit

INLINE = re.compile(r"(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))")


def safe_href(value: str) -> str | None:
    split = urlsplit(value.strip())
    if split.scheme.lower() not in {"", "http", "https", "mailto"}:
        return None
    if split.scheme == "" and value.strip().startswith("//"):
        return None
    return value.strip()


def inline(value: str) -> str:
    parts: list[str] = []
    cursor = 0
    for match in INLINE.finditer(value):
        parts.append(html.escape(value[cursor : match.start()]))
        token = match.group(0)
        if token.startswith("`"):
            parts.append(f"<code>{html.escape(token[1:-1])}</code>")
        elif token.startswith("**"):
            parts.append(f"<strong>{html.escape(token[2:-2])}</strong>")
        else:
            label, href = re.fullmatch(r"\[([^\]]+)\]\(([^)]+)\)", token).groups()  # type: ignore[union-attr]
            valid = safe_href(href)
            if valid is None:
                parts.append(html.escape(label))
            else:
                parts.append(f'<a href="{html.escape(valid, quote=True)}">{html.escape(label)}</a>')
        cursor = match.end()
    parts.append(html.escape(value[cursor:]))
    return "".join(parts)


def table_cells(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def is_separator(line: str) -> bool:
    cells = table_cells(line)
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells)


def render(markdown: str) -> tuple[str, str]:
    lines = markdown.splitlines()
    output: list[str] = []
    title = "SEO Market Research Report"
    in_code = False
    code_lines: list[str] = []
    list_tag: str | None = None
    index = 0

    def close_list() -> None:
        nonlocal list_tag
        if list_tag:
            output.append(f"</{list_tag}>")
            list_tag = None

    while index < len(lines):
        line = lines[index]
        if line.startswith("```"):
            close_list()
            if in_code:
                output.append("<pre><code>" + html.escape("\n".join(code_lines)) + "</code></pre>")
                code_lines = []
                in_code = False
            else:
                in_code = True
            index += 1
            continue
        if in_code:
            code_lines.append(line)
            index += 1
            continue
        if index + 1 < len(lines) and "|" in line and is_separator(lines[index + 1]):
            close_list()
            headers = table_cells(line)
            output.append("<div class=\"table-wrap\"><table><thead><tr>" + "".join(f"<th>{inline(cell)}</th>" for cell in headers) + "</tr></thead><tbody>")
            index += 2
            while index < len(lines) and "|" in lines[index] and lines[index].strip():
                cells = table_cells(lines[index])
                output.append("<tr>" + "".join(f"<td>{inline(cell)}</td>" for cell in cells) + "</tr>")
                index += 1
            output.append("</tbody></table></div>")
            continue
        heading = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading:
            close_list()
            level = len(heading.group(1))
            text = heading.group(2).strip()
            if level == 1:
                title = re.sub(r"[`*_]", "", text)
            output.append(f"<h{level}>{inline(text)}</h{level}>")
        elif re.match(r"^[-*]\s+", line):
            if list_tag != "ul":
                close_list()
                list_tag = "ul"
                output.append("<ul>")
            output.append(f"<li>{inline(re.sub(r'^[-*]\\s+', '', line))}</li>")
        elif re.match(r"^\d+\.\s+", line):
            if list_tag != "ol":
                close_list()
                list_tag = "ol"
                output.append("<ol>")
            output.append(f"<li>{inline(re.sub(r'^\\d+\\.\\s+', '', line))}</li>")
        elif line.startswith("> "):
            close_list()
            output.append(f"<blockquote>{inline(line[2:])}</blockquote>")
        elif not line.strip():
            close_list()
        else:
            close_list()
            output.append(f"<p>{inline(line)}</p>")
        index += 1
    close_list()
    if in_code:
        output.append("<pre><code>" + html.escape("\n".join(code_lines)) + "</code></pre>")
    return title, "\n".join(output)


def document(title: str, body: str) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>
:root {{ color-scheme: light dark; font-family: system-ui, sans-serif; line-height: 1.55; }}
body {{ max-width: 1120px; margin: 0 auto; padding: 32px 24px 64px; }}
.generated {{ padding: 12px 16px; border-left: 4px solid #3e6ae1; background: color-mix(in srgb, Canvas 94%, #3e6ae1); }}
h1, h2, h3 {{ line-height: 1.2; margin-top: 1.7em; }}
code, pre {{ font-family: ui-monospace, monospace; }}
pre {{ overflow: auto; padding: 16px; background: color-mix(in srgb, Canvas 92%, CanvasText); }}
.table-wrap {{ overflow-x: auto; }}
table {{ width: 100%; border-collapse: collapse; }}
th, td {{ text-align: left; vertical-align: top; padding: 8px; border-bottom: 1px solid color-mix(in srgb, CanvasText 24%, transparent); }}
a {{ color: #3e6ae1; }}
</style>
</head>
<body>
<p class="generated"><strong>Generated view:</strong> regenerate this file from the reviewed Markdown source; do not edit it independently.</p>
<main>
{body}
</main>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Render reviewed Markdown to safe standalone HTML")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    title, body = render(args.input.read_text(encoding="utf-8"))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(document(title, body), encoding="utf-8")
    print(f"rendered {args.input} -> {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
