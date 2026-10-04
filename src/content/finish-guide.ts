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
  {
    eyebrow: "Gallery",
    title: "Vehicle gallery",
    body: "See how these finishes sit on real platforms, with the sizes we built to.",
    href: "/gallery",
    linkLabel: "Browse builds",
  },
  {
    eyebrow: "Range",
    title: "Wheel families",
    body: "Which construction suits which vehicle, and what we need to quote it.",
    href: "/products",
    linkLabel: "Compare families",
  },
];
