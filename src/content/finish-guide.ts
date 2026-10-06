import type { CtaLink, ResourceLink } from "./types";

/**
 * Finishes page copy (`/gallery/finishes`).
 *
 * The swatch grid itself is driven by `finishes.ts`; this module holds the
 * surrounding editorial copy so nothing is hard-coded in the component.
 */
export const finishesHero = {
  eyebrow: "Finish reference",
  heading: "Finishes",
  lede: "Eight finish directions covering brushed, satin, gloss, matte and polished looks. Use them to narrow the range before you commit a finish to an order.",
} as const;

export const finishesHonesty = {
  eyebrow: "Read this first",
  heading: "These are representations, not photographs",
  body: "A swatch shows the direction of a finish — its warmth, darkness and sheen level. It cannot show how grain catches light as a wheel turns, how a gloss behaves in sunlight, or how any of it will look against your customer's paint.",
  points: [
    "Swatches are flat colour, not colour-matched samples",
    "Screen calibration changes how they read on your monitor",
    "Brushed and polished finishes vary with the direction of light",
    "Ask for physical samples or photo references before ordering",
  ],
};

export const finishesSampleCta = {
  label: "Request finish samples",
  href: "/contact",
} satisfies CtaLink;

export const finishesPathways: ResourceLink[] = [
  // The "Vehicle gallery → /gallery" card was removed 2026-10-06: /gallery is
  // archived (DEC-059) and its claim ("see how these finishes sit on real
  // platforms, with the sizes we built to") referenced builds that never
  // existed. Only genuinely-real destinations remain.
  {
    eyebrow: "Range",
    title: "Wheel families",
    body: "Which construction suits which vehicle, and what we need to quote it.",
    href: "/products",
    linkLabel: "Compare families",
  },
];

/**
 * Publishing gate for `/gallery/finishes`.
 *
 * The page is honest about its own limits — its swatches are deliberately
 * labelled illustrative, not photographs, and the honesty note says so. That is
 * not the same as being *confirmed*. The eight finish **names** in
 * `@/content/finishes` are still placeholders (its header says `PLACEHOLDER`),
 * and no real colour-swatch photograph exists behind any of them. PAGE-SPECS
 * §6.2 requires that no swatch is generated before the finish English mapping
 * is complete, so until a human has confirmed the names actually offered, the
 * route must not be indexed.
 *
 * Checked in `page.tsx` metadata and `sitemap.ts`, and nowhere else. While the
 * flag is false the route renders in full but declares
 * `robots: { index: false, follow: true }` and publishes **no canonical** — the
 * same fail-closed pattern as `/products/custom-aluminum` (DEC-050) and
 * `/products/wheels/flow-formed` (DEC-054). Clearing the flag is the *only* edit
 * needed to make the page indexable and to re-add it to the sitemap; there is no
 * second switch to remember.
 */
export const finishesPage = {
  publicationGate: {
    // 8 个表面处理名仍是占位（PLACEHOLDER），且无真实色板实拍。
    // 规格 §6.2 要求"finish 未完成英文映射前不生成色板"—— 页面本身诚实，
    // 但色名未确认前不应进索引。
    finishNamesConfirmed: false,
  },
};

/** True only when every flag is positively cleared — fail-closed by default. */
export function isFinishesPublishingOpen(
  gate: typeof finishesPage.publicationGate,
): boolean {
  return gate.finishNamesConfirmed === true;
}
