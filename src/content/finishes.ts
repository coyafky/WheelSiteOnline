import type { FinishOption } from "./types";

/**
 * Finish reference.
 *
 * PLACEHOLDER: `swatch` values are illustrative CSS colours chosen to *stand
 * for* each finish — they are not photographs or colour-matched samples.
 * Replace with real finish photography in `public/images/finishes/` when
 * Fenghuai supplies it, and confirm the finish names actually offered.
 */
export const finishes: FinishOption[] = [
  {
    slug: "brushed-clear",
    name: "Brushed Clear",
    family: "Brushed",
    description:
      "Directional brushing under a clear coat. Fine linear grain that catches light as the wheel turns.",
    swatch: "linear-gradient(135deg, #b9bec7 0%, #8e949e 46%, #c3c8d1 100%)",
  },
  {
    slug: "satin-gunmetal",
    name: "Satin Gunmetal",
    family: "Satin",
    description:
      "Deep grey with a soft matte sheen. Neutral enough to sit on almost any body colour without shouting.",
    swatch: "linear-gradient(135deg, #5b6270 0%, #3d434e 55%, #6b7380 100%)",
  },
  {
    slug: "gloss-black",
    name: "Gloss Black",
    family: "Gloss",
    description:
      "Full-gloss black face and spoke. Reads as maximally deep contrast against bright paint and body kits.",
    swatch: "linear-gradient(135deg, #2a2f38 0%, #0b0f16 58%, #383e49 100%)",
  },
  {
    slug: "matte-bronze",
    name: "Matte Bronze",
    family: "Matte",
    description:
      "Warm bronze with no sheen. A staple on Japanese and off-road platforms where gloss would look out of place.",
    swatch: "linear-gradient(135deg, #9c6a2f 0%, #6f4718 56%, #a97a38 100%)",
  },
  {
    slug: "polished-lip",
    name: "Polished Lip",
    family: "Polished",
    description:
      "Mirror-polished outer rim, usually paired with a contrasting face. Classic two-piece look with a hard highlight.",
    swatch: "linear-gradient(135deg, #ffffff 0%, #c9d0da 42%, #eef1f5 100%)",
  },
  {
    slug: "satin-anthracite",
    name: "Satin Anthracite",
    family: "Satin",
    description:
      "Charcoal anthracite under a satin clear. Darker and cooler than gunmetal, softer than black.",
    swatch: "linear-gradient(135deg, #454b57 0%, #2d3239 56%, #565d6a 100%)",
  },
  {
    slug: "gloss-bronze",
    name: "Gloss Bronze",
    family: "Gloss",
    description:
      "Lacquered bronze with a wet gloss. Deliberate, high-impact choice for a performance build.",
    swatch: "linear-gradient(135deg, #b3823a 0%, #8a4406 54%, #c99a4c 100%)",
  },
  {
    slug: "matte-black",
    name: "Matte Black",
    family: "Matte",
    description:
      "Flat black with a low-sheen surface. Understated, easy to touch up, and the default for stealth builds.",
    swatch: "linear-gradient(135deg, #33383f 0%, #1a1e25 58%, #42474f 100%)",
  },
];

/** Honesty note surfaced alongside the swatch grid. */
export const finishNote =
  "Swatches are illustrative colour representations, not photographs. They show the direction of each finish so you can narrow the range — ask us for physical samples or photo references before you commit an order.";

export function getFinish(slug: string): FinishOption | undefined {
  return finishes.find((finish) => finish.slug === slug);
}
