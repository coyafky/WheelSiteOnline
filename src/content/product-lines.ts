import type { ProductLine } from "./types";

/**
 * The four parallel product lines.
 *
 * ── Why this is a separate module from `products.ts` (2026-10-02) ───────────
 * `products.ts` exports `productFamilies` — three *wheel categories*
 * (`monoblock` / `two-piece` / `off-road`). Those slugs are load-bearing:
 * `wheel-skus.ts` tags every SKU with one of them and `/products/wheels` groups
 * its sections by matching `getSkusByFamily(family.slug)`. Replacing that array
 * in place would silently break the wheel catalogue's grouping.
 *
 * So the two axes live side by side instead of overwriting each other:
 *
 *   `productLines`          — the company's four product lines (this file)
 *   `productFamilies`       — the wheel sub-categories (products.ts)
 *
 * They answer different questions. `/products` answers "what does this company
 * make?" (four lines) and `/products/wheels` answers "how is the wheel range
 * organised?" (three categories). Collapsing them was the v1 plan and it would
 * have cost the catalogue its grouping.
 *
 * ── Where the copy came from ────────────────────────────────────────────────
 * Migrated verbatim from `heroProducts` in `homepage-hero.ts`, which had
 * already been reconciled against the four-line positioning (DEC-022) and had
 * its card artwork commissioned. Moving it here makes both call sites read one
 * source instead of two; the hero now imports from this file.
 *
 * ⚠️ `hasRender: true` on all four — a real 1024×1024 card image exists in
 * `public/images/cards/` for each line, verified on disk. This is the opposite
 * of the old `productFamilies` array, where all three entries pointed at
 * `public/images/products/*` files that were never created and carried
 * `hasRender: false`.
 *
 * ── Parallelism is the whole point (§0 core discipline) ─────────────────────
 * Four entries, same shape, same image aspect, same fields. Nothing here
 * privileges wheels: it has no more fields than the others, and its summary is
 * not quantified more aggressively than theirs (the "1018 catalogue models"
 * figure appears because it is the one line with a real published count, and
 * the other three would have to invent one to match).
 */
export const productLines: ProductLine[] = [
  {
    slug: "wheels",
    name: "Forged Wheels",
    subtitle: "Monoblock · Two-piece",
    summary:
      "1018 catalogue models across 15–20 inch plus off-road and HP fitments, finished to your specification.",
    highlights: [],
    hasRender: true,
    image: "/images/cards/card-wheels.webp",
    href: "/products/wheels",
  },
  {
    slug: "ev-components",
    name: "EV Components",
    subtitle: "EV drive & battery",
    summary:
      "Motor, controller and battery housings — including integrated spiral cooling channels for stator assemblies.",
    highlights: [],
    hasRender: true,
    image: "/images/cards/card-ev.webp",
    href: "/products/ev-components",
  },
  {
    slug: "custom-aluminum",
    name: "Custom Aluminum",
    subtitle: "Drawing or sample",
    summary:
      "Brackets, end covers, control arms and structural parts — built from your drawing, 3D data or sample.",
    highlights: [],
    hasRender: true,
    image: "/images/cards/card-aluminum.webp",
    href: "/products/custom-aluminum",
  },
  {
    slug: "safety-tires",
    name: "Self-Healing Tires",
    subtitle: "Self-sealing coating",
    summary:
      "A polymer self-sealing layer in the inner liner closes the puncture channel in as little as 0.05 s.",
    highlights: [],
    hasRender: true,
    image: "/images/cards/card-tires.webp",
    href: "/products/safety-tires",
  },
];
