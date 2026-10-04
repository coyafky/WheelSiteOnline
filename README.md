# Fenghuai Forged Wheels — Independent Site

B2B forged-wheel manufacturer website for Fenghuai. Targets dealers and
distributors, structured as a static Next.js frontend with a headless WordPress
content backend as the intended data source.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind v4, shadcn/ui primitives, lucide-react |
| Fonts | Barlow Condensed (display) + Inter (text) via `next/font` |
| Content | Typed modules in `src/content/` — the seam for headless WordPress |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
npm run typecheck
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Homepage — hero, capability strip, product showcase, gallery band, CTA |
| `/products` | Catalogue hub |
| `/products/[slug]` | Family detail — `monoblock`, `two-piece`, `off-road` (statically generated) |
| `/products/wheels` | **SKU index** — all 16 wheel products |
| `/products/wheels/[sku]` | **Per-SKU product page** — spec table, finishes, related SKUs (16, statically generated) |
| `/gallery` | **Vehicle** gallery — real builds on cars, client-side family filter + search |
| `/gallery/wheels` | **Wheel-design** gallery — 22 designs, 4-axis faceted filter, data-driven SVG drawings |
| `/gallery/finishes` | Finish reference swatch grid |
| `/manufacturing` | Process page with a click-driven stage explorer |
| `/tools` | Tools hub |
| `/tools/offset-calculator` | **Working offset calculator** — compares two wheels, shows its formula |
| `/fitment` | Fitment hub |
| `/fitment/[platform]` | Vehicle-specific landing — `bmw-m`, `mercedes-amg`, `audi-rs` (statically generated) |
| `/dealers` | Dealer supply programme |
| `/dealers/private-label` | Private label programme |
| `/about` | Company |
| `/resources` | Guides hub |
| `/resources/[slug]` | Long-form guide articles (6, statically generated) |
| `/resources/bolt-patterns` | Bolt-pattern guide index |
| `/resources/bolt-patterns/[pattern]` | `5x112`, `5x114.3`, `5x120` — teaches self-measurement |
| `/contact` | Quote enquiry form |
| `/support/{warranty,returns,shipping,terms,privacy}` | Policy documents |

56 pages total, all statically prerendered.

### Two things worth understanding

**The two galleries are deliberately different.** `/gallery` is keyed by *vehicle* (an actual build on a car); `/gallery/wheels` is keyed by *design* (the wheel itself, organised by spoke pattern, construction, finish, application). Buyers ask both questions — "what does that look like on my car" and "what shapes do you make" — and conflating them serves neither.

**Fitment data is treated as safety-critical.** `src/content/fitment.ts` publishes width/diameter *starting ranges* only — never offsets, PCDs, centre bores or load ratings stated as fact. Every model carries `verified: false` and renders a visible pending-verification marker; a standing notice sits above the fold on every fitment surface. The template is built so it **cannot** publish an unverified measurement as specification. Engineering must sign off and flip the flags.

## Architecture

### Content layer

All copy lives in `src/content/*.ts` as typed data — components never hard-code
marketing text. Contracts are defined in `src/content/types.ts`.

This is deliberate: it is the seam where a headless WordPress fetcher will slot
in. Swapping a module for an API call should require no component changes.

### Design tokens

Defined once in `src/app/globals.css`. Palette is a graphite/steel base with a
forge-amber accent (`--fh-forge: #c2650a`), exposed to Tailwind as `text-ink`,
`text-steel`, `bg-soft`, `text-forge`, `bg-ink`, etc. **Never use raw hex values
in components.**

### Motion system

Two effects, defined in `globals.css` and driven by `src/components/site-motion.tsx`:

- **Scroll reveal** — `data-reveal` on a section, `data-reveal-group` on a
  container to stagger its direct children. 760ms ease-out, 80ms stagger step.
- **Parallax** — `data-parallax-media`, ±8px clamped, rAF-throttled.

Both are gated behind a `motion-ready` class added by JS (so content stays
visible without JS) and disabled entirely under `prefers-reduced-motion`.
Do not hand-roll IntersectionObservers in page components.

### Assets

There are currently **no real photographs** in `public/images/`. Components use
a `hasRender` flag pattern (see `src/components/product-card.tsx`) to render a
branded placeholder instead of requesting a missing file — resulting in no
broken images and no wasted 404 requests. Flip the flag once an asset lands.

## Before launch — required work

This is a **structurally complete prototype with placeholder content.** Search
for `PLACEHOLDER` (83 occurrences across `src/content/`) and resolve every one.

**Commercial facts that must be confirmed by Fenghuai** — these are currently
plausible industry values, not sourced claims:

- Contact email, phone, address, office hours (`src/content/site.ts`)
- Lead time ("20–30 days") — quoted throughout
- Capability claims: profile range, finish options, MOQ, load ratings
- About-page figures (years operating, facility size, monthly capacity, markets)
- Family specification tables (diameter/width ranges, materials)

**Legal documents** — `src/content/legal.ts` contains honest templates with a
draft banner and ~131 inline placeholders. **These need a lawyer.** Warranty
duration, return window, incoterms and governing jurisdiction are not invented
values and must not be published as-is.

**Offset calculator:** `src/content/tools.ts` holds the presets, which are
deliberately named by *what they demonstrate* ("Wider, same offset") rather than
by vehicle — labelling them "BMW G20 stock" would publish a fabricated spec.
The math is verified against an independent ground truth; re-verify if you
change `computeOffset` in `src/components/offset-calculator.tsx`.

**Fitment sign-off (safety-critical):**

- `src/content/fitment.ts` — model width/diameter ranges need engineering confirmation,
  then set `verified: true` per model. Do not publish offsets, PCDs, centre bores or
  load ratings until they are actually verified per chassis.

**Content replacements:**

- `src/content/wheel-designs.ts` — 22 design names are descriptive working titles,
  not confirmed Fenghuai product names
- `src/content/builds.ts` — sample vehicles; replace with real builds
- `src/content/finishes.ts` — finish names and swatch colours are illustrative;
  the page states this explicitly. Confirm the finish range is real.
- `src/content/products.ts` — drop real renders into `public/images/products/`
  and set `hasRender: true` per family
- `src/content/process.ts` — stage photography for `public/images/process/`

**Engineering:**

- `/contact` form has client-side validation but **no backend** — submission is
  not wired anywhere. Connect it (and keep it honest about spam handling).
- Headless WordPress integration has not been built. The content layer is
  structured for it but no fetcher exists yet.

## Reference

`docs/research/2nforged-reference.md` is a structural recon of a comparable
competitor site — page archetypes, section inventory, and interaction model.
It informed layout and motion decisions. **No content, copy, imagery or branding
was taken from it**, and none should be.
