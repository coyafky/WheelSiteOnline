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
 * Copy follows the approved homepage Page SPEC. This is the only company-level
 * product-line collection; homepage and `/products` consume the same records.
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
   * not quantified more aggressively than theirs.
 */
export const productLines: ProductLine[] = [
  {
    slug: "wheels",
    name: "Wheels",
    subtitle: "Recorded models · Flow formed · Custom forged",
    summary:
      "Browse approved wheel specifications, review recorded flow-formed routes, or start a custom forged wheel program.",
    highlights: [],
    hasRender: true,
    image: "/images/cards/card-wheels.webp",
    href: "/products/wheels",
  },
  {
    slug: "ev-components",
    name: "EV Aluminum Housings",
    subtitle: "Motor · Controller · Inverter",
    summary:
      "Engineering assessment for water-cooled motor, die-cast motor and controller or inverter housing projects.",
    highlights: [],
    hasRender: true,
    image: "/images/cards/card-ev.webp",
    href: "/products/ev-components",
  },
  {
    slug: "custom-aluminum",
    name: "Custom Aluminum Development",
    subtitle: "2D drawing · 3D data · Physical sample",
    summary:
      "Start a drawing- or sample-led assessment for an aluminum component outside the defined wheel and EV housing categories.",
    highlights: [],
    hasRender: true,
    image: "/images/cards/card-aluminum.webp",
    href: "/products/custom-aluminum",
  },
  {
    slug: "safety-tires",
    name: "Self-Sealing Tires",
    subtitle: "Technology · Testing · Supply review",
    summary:
      "Review the self-sealing concept, documented test conditions and the information needed to discuss an applicable tire program.",
    highlights: [],
    hasRender: true,
    image: "/images/cards/card-tires.webp",
    href: "/products/safety-tires",
  },
];
