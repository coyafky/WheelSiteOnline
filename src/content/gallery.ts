import type { AnswerBlock, CtaLink, ResourceLink } from "./types";

/**
 * Gallery hub copy (`/gallery`).
 *
 * PLACEHOLDER: builds in `builds.ts` are structural samples. The filter facets
 * and card metadata are real; the vehicles are not confirmed orders.
 */
export const galleryHero = {
  eyebrow: "Completed builds",
  heading: "Vehicle Gallery",
  lede: "Fitment references across performance, luxury and off-road platforms. Each card lists the sizes and finish we built to, so you can compare against the vehicle you are quoting.",
} as const;

export const galleryEmptyState = {
  title: "No builds match that filter",
  body: "Try a different family, or clear the search. If the vehicle you are after is not listed, send us the details and we will build a reference for it.",
  action: { label: "Request a fitment", href: "/contact" } satisfies CtaLink,
} as const;

export const galleryAnswer: AnswerBlock = {
  eyebrow: "How to read this",
  heading: "A fitment reference, not a catalogue",
  body: "Every build here was manufactured to a specific vehicle's data. The sizes shown are the ones we cut for that car — they are a starting point, not a promise that the same numbers suit yours.",
  points: [
    "Sizes are quoted front / rear and reflect that vehicle's clearance",
    "Finish names link back to the finish reference",
    "Platform and body changes can move the correct fitment",
    "Send us your vehicle and we will confirm the numbers",
  ],
};

export const galleryPathways: ResourceLink[] = [
  {
    eyebrow: "Reference",
    title: "Finish gallery",
    body: "The finish directions we offer, with an honest note on what a swatch can and cannot tell you.",
    href: "/gallery/finishes",
    linkLabel: "View finishes",
  },
  {
    eyebrow: "Range",
    title: "Wheel families",
    body: "Monoblock, two-piece forged and off-road — what each construction is for.",
    href: "/products",
    linkLabel: "Compare families",
  },
];
