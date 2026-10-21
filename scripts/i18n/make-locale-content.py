#!/usr/bin/env python3
"""
Derive a structurally-identical localized version of a WordPress page's content.

Why a script: `normalizeWordpressPage` accepts any object as the localized
content, but the resolvers' shape guards (`isHomepageContent`,
`isSelfSealingTirePage`, ...) reject objects whose keys don't match. Hand-writing
the JSON risks silently dropping a key and falling back to English with no
signal. Generating it from the en source makes parity mechanical.

Usage:
    python3 scripts/i18n/make-locale-content.py <page-key> <locale> > out.json

Word list lives in `translations_zh.py` (one key per page). Values that must
NOT be translated (ids, hrefs, media handles, enum tokens) are copied verbatim.
Every string with no translation entry is reported on stderr so gaps stay
visible instead of silently shipping English.
"""

import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from translations_zh import TRANSLATIONS_ZH  # noqa: E402

WP_BASE = os.environ.get("FH_WP_BASE", "http://127.0.0.1:8081")

# ── Fields copied verbatim (never translated) ────────────────────────────────
COPY_VERBATIM = {
    "id", "href", "anchor", "slug", "key", "wordpressId", "src",
    "hasRender", "approvalStatus", "sourceRef", "evidenceStatus",
    "status", "appliesTo", "processes",
}

# ── Value prefixes that mark machine tokens rather than prose ────────────────
UNTRANSLATABLE_PREFIXES = ("/", "http", "supplier-", "approved", "WP ", "#")

# ── Exact machine values that look like prose but must stay as-is ────────────
UNTRANSLATABLE_EXACT = {
    "aluminum-production", "tire-production", "wheel-manufacturing",
    "tire-manufacturing", "verified", "approved", "draft", "withdrawn",
    "application", "casting", "coating", "finished", "inspection",
    "line", "machinery", "machining", "material", "tooling",
    "wheel-manufacturing", "en", "zh", "es", "th",
}


def fetch(key: str) -> dict:
    url = f"{WP_BASE}/wp-json/fh/v1/pages?key={key}"
    with urllib.request.urlopen(url, timeout=10) as response:
        payload = json.load(response)
    items = payload.get("items") or []
    if not items:
        raise SystemExit(f"no WordPress page record for key={key!r}")
    return items[0]["page"]


def make_derive(table: dict, report: list):
    def derive(value, path: str):
        if isinstance(value, dict):
            return {k: derive(v, f"{path}.{k}") for k, v in value.items()}
        if isinstance(value, list):
            return [derive(v, f"{path}[{i}]") for i, v in enumerate(value)]
        if not isinstance(value, str):
            return value

        leaf = path.rsplit(".", 1)[-1].split("[")[0]

        # Never translate ids, hrefs, media handles, enum tokens.
        if leaf in COPY_VERBATIM:
            return value
        if value.startswith(UNTRANSLATABLE_PREFIXES):
            return value
        if value in UNTRANSLATABLE_EXACT:
            return value

        # Structural ids like "01" / "02" stay as-is.
        if value.isdigit():
            return value

        if value in table:
            return table[value]

        report.append(path)
        return value

    return derive


def shape(o, pre=""):
    out = []
    if isinstance(o, dict):
        for k, v in sorted(o.items()):
            out += shape(v, f"{pre}.{k}")
    elif isinstance(o, list):
        out.append(f"{pre}:list[{len(o)}]")
        if o:
            out += shape(o[0], f"{pre}[]")
    else:
        out.append(f"{pre}:{type(o).__name__}")
    return out


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    key, locale = sys.argv[1], sys.argv[2]

    if locale != "zh":
        raise SystemExit(f"no translation table for locale {locale!r} yet")
    table = TRANSLATIONS_ZH.get(key)
    if table is None:
        raise SystemExit(f"no translation table for page {key!r}")

    page = fetch(key)
    source = (page.get("content_by_locale") or {}).get("en") or page.get("content")
    if not source:
        raise SystemExit(f"page {key!r} has no base content to derive from")

    untranslated: list = []
    derived = make_derive(table, untranslated)(source, key)

    # Guard: structure must be identical, or the resolver's shape check fails.
    if shape(source) != shape(derived):
        raise SystemExit("FATAL: derived content is not structurally identical to source")

    json.dump(derived, sys.stdout, ensure_ascii=False, indent=2)

    # Report gaps to stderr so stdout stays pure JSON.
    if untranslated:
        print(
            f"\n# {len(untranslated)} string(s) had no translation entry "
            f"(left in English) for {key}/{locale}:",
            file=sys.stderr,
        )
        for item in untranslated:
            print(f"#   {item}", file=sys.stderr)
    else:
        print(f"\n# {key}/{locale}: full coverage, 0 untranslated strings", file=sys.stderr)


if __name__ == "__main__":
    main()
