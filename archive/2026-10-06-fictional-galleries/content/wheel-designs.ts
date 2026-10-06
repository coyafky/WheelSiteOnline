import type {
  SpokePattern,
  WheelApplication,
  WheelConstruction,
  WheelDesign,
  WheelFinish,
} from "./types";

/**
 * Wheel design catalogue (`/gallery/wheels`).
 *
 * This is the *design* gallery — the wheel shapes themselves, keyed by design.
 * The vehicle gallery (`/gallery`) is the other half of the pair: real builds
 * on real cars. Here the unit of interest is the spoke pattern, construction,
 * finish and application, which is how a dealer narrows the range for a
 * customer.
 *
 * NO PHOTOGRAPHY EXISTS YET. Every design is `hasRender: false`, and the card
 * draws a data-driven SVG technical drawing from the design's own attributes
 * (spoke count + finish colour) rather than requesting a missing file. Flip
 * `hasRender` once real renders land in `public/images/wheels/`.
 *
 * PLACEHOLDER: design names are descriptive working titles, not confirmed
 * Fenghuai product names. Rename against the real catalogue before launch.
 */

/**
 * Representative colour per finish.
 *
 * Same discipline as `src/content/finishes.ts`: `swatch` is an illustrative
 * CSS colour standing in for the physical finish — a design token value, not a
 * colour-matched sample. The SVG wheel drawing tints from it.
 */
export const wheelFinishSwatches: Record<
  WheelFinish,
  { swatch: string; accent: string; note: string }
> = {
  Gunmetal: {
    swatch: "#5b6270",
    accent: "#3d434e",
    note: "Deep grey with a satin sheen — neutral on almost any body colour.",
  },
  Silver: {
    swatch: "#c9d0da",
    accent: "#8e949e",
    note: "Bright neutral silver. Classic, easy to keep clean.",
  },
  Gold: {
    swatch: "#b3823a",
    accent: "#8a4406",
    note: "Saturated gold under gloss — deliberate and high-impact.",
  },
  Black: {
    swatch: "#2a2f38",
    accent: "#0b0f16",
    note: "Full gloss black. Maximum contrast against bright paint.",
  },
  "Matte Black": {
    swatch: "#33383f",
    accent: "#1a1e25",
    note: "Flat black with a low-sheen surface. The stealth default.",
  },
  "Brushed Silver": {
    swatch: "#b9bec7",
    accent: "#8e949e",
    note: "Directional brushing under clear. Catches light as the wheel turns.",
  },
  "Two-Tone": {
    swatch: "#3d434e",
    accent: "#c9d0da",
    note: "Contrasting face and lip — one finish on the spoke, another on the rim.",
  },
  "Gloss White": {
    swatch: "#eef1f5",
    accent: "#b9bec7",
    note: "Lacquered white. A motorsport cue that reads as purposeful, not decorative.",
  },
  "Diamond-Cut": {
    swatch: "#d7dce4",
    accent: "#8e949e",
    note: "Machined highlight on a darkened base — a hard, faceted edge line.",
  },
  "Red Accent": {
    swatch: "#8a1f1f",
    accent: "#c2650a",
    note: "Dark base with a red rim accent on the lip or spoke edge.",
  },
};

/** Facet axes and their allowed values, derived from the catalogue. */
export const spokePatterns: SpokePattern[] = [
  "Five-Spoke",
  "Split-Spoke",
  "Multi-Spoke",
  "Turbine",
  "Full-Face",
  "Retro Five-Spoke",
  "Mesh",
];

export const wheelConstructions: WheelConstruction[] = [
  "Monoblock",
  "Deep-Lip Two-Piece",
  "Beadlock Off-Road",
  "Beadlock-Style",
];

export const wheelFinishes: WheelFinish[] = [
  "Gunmetal",
  "Silver",
  "Gold",
  "Black",
  "Matte Black",
  "Brushed Silver",
  "Two-Tone",
  "Gloss White",
  "Diamond-Cut",
  "Red Accent",
];

export const wheelApplications: WheelApplication[] = [
  "Motorsport",
  "Luxury SUV",
  "Off-Road",
  "Luxury",
];

export const wheelDesigns: WheelDesign[] = [
  {
    id: "wd-01",
    name: "Gunmetal Retro Five-Spoke",
    spokes: "Retro Five-Spoke",
    construction: "Monoblock",
    finish: "Gunmetal",
    application: "Luxury",
    tags: ["retro", "five-spoke", "monoblock", "classic"],
    hasRender: false,
  },
  {
    id: "wd-02",
    name: "Diamond-Cut Five-Spoke",
    spokes: "Five-Spoke",
    construction: "Monoblock",
    finish: "Diamond-Cut",
    application: "Luxury SUV",
    tags: ["five-spoke", "diamond-cut", "suv", "concave"],
    hasRender: false,
  },
  {
    id: "wd-03",
    name: "Gloss Black Split-Spoke",
    spokes: "Split-Spoke",
    construction: "Monoblock",
    finish: "Black",
    application: "Motorsport",
    tags: ["split-spoke", "gloss-black", "performance", "concave"],
    hasRender: false,
  },
  {
    id: "wd-04",
    name: "Matte Black Multi-Spoke",
    spokes: "Multi-Spoke",
    construction: "Monoblock",
    finish: "Matte Black",
    application: "Motorsport",
    tags: ["multi-spoke", "matte-black", "track", "lightweight"],
    hasRender: false,
  },
  {
    id: "wd-05",
    name: "Brushed Silver Turbine",
    spokes: "Turbine",
    construction: "Monoblock",
    finish: "Brushed Silver",
    application: "Motorsport",
    tags: ["turbine", "brushed", "aero", "directional"],
    hasRender: false,
  },
  {
    id: "wd-06",
    name: "Silver Mesh",
    spokes: "Mesh",
    construction: "Monoblock",
    finish: "Silver",
    application: "Luxury",
    tags: ["mesh", "silver", "euro", "classic"],
    hasRender: false,
  },
  {
    id: "wd-07",
    name: "Gunmetal Full-Face",
    spokes: "Full-Face",
    construction: "Monoblock",
    finish: "Gunmetal",
    application: "Luxury SUV",
    tags: ["full-face", "gunmetal", "suv", "aero"],
    hasRender: false,
  },
  {
    id: "wd-08",
    name: "Gold Five-Spoke",
    spokes: "Five-Spoke",
    construction: "Monoblock",
    finish: "Gold",
    application: "Motorsport",
    tags: ["five-spoke", "gold", "rally", "jdm"],
    hasRender: false,
  },
  {
    id: "wd-09",
    name: "Gloss White Retro Five-Spoke",
    spokes: "Retro Five-Spoke",
    construction: "Monoblock",
    finish: "Gloss White",
    application: "Motorsport",
    tags: ["retro", "gloss-white", "motorsport", "rally"],
    hasRender: false,
  },
  {
    id: "wd-10",
    name: "Silver Deep-Lip Split-Spoke",
    spokes: "Split-Spoke",
    construction: "Deep-Lip Two-Piece",
    finish: "Silver",
    application: "Luxury",
    tags: ["two-piece", "deep-lip", "split-spoke", "polished"],
    hasRender: false,
  },
  {
    id: "wd-11",
    name: "Two-Tone Deep-Lip Mesh",
    spokes: "Mesh",
    construction: "Deep-Lip Two-Piece",
    finish: "Two-Tone",
    application: "Luxury",
    tags: ["two-piece", "mesh", "two-tone", "euro"],
    hasRender: false,
  },
  {
    id: "wd-12",
    name: "Gold Deep-Lip Multi-Spoke",
    spokes: "Multi-Spoke",
    construction: "Deep-Lip Two-Piece",
    finish: "Gold",
    application: "Luxury",
    tags: ["two-piece", "deep-lip", "gold", "stance"],
    hasRender: false,
  },
  {
    id: "wd-13",
    name: "Brushed Silver Turbine Two-Piece",
    spokes: "Turbine",
    construction: "Deep-Lip Two-Piece",
    finish: "Brushed Silver",
    application: "Motorsport",
    tags: ["two-piece", "turbine", "brushed", "aero"],
    hasRender: false,
  },
  {
    id: "wd-14",
    name: "Diamond-Cut Two-Tone Five-Spoke",
    spokes: "Five-Spoke",
    construction: "Deep-Lip Two-Piece",
    finish: "Diamond-Cut",
    application: "Luxury SUV",
    tags: ["two-piece", "diamond-cut", "suv", "deep-lip"],
    hasRender: false,
  },
  {
    id: "wd-15",
    name: "Matte Black Beadlock Off-Road",
    spokes: "Five-Spoke",
    construction: "Beadlock Off-Road",
    finish: "Matte Black",
    application: "Off-Road",
    tags: ["beadlock", "off-road", "matte-black", "truck"],
    hasRender: false,
  },
  {
    id: "wd-16",
    name: "Gunmetal Beadlock Off-Road Multi-Spoke",
    spokes: "Multi-Spoke",
    construction: "Beadlock Off-Road",
    finish: "Gunmetal",
    application: "Off-Road",
    tags: ["beadlock", "off-road", "gunmetal", "overland"],
    hasRender: false,
  },
  {
    id: "wd-17",
    name: "Black Beadlock-Style Split-Spoke",
    spokes: "Split-Spoke",
    construction: "Beadlock-Style",
    finish: "Black",
    application: "Off-Road",
    tags: ["beadlock-style", "off-road", "split-spoke", "suv"],
    hasRender: false,
  },
  {
    id: "wd-18",
    name: "Red Accent Beadlock-Style",
    spokes: "Five-Spoke",
    construction: "Beadlock-Style",
    finish: "Red Accent",
    application: "Off-Road",
    tags: ["beadlock-style", "red-accent", "off-road", "truck"],
    hasRender: false,
  },
  {
    id: "wd-19",
    name: "Gloss Black Full-Face Luxury",
    spokes: "Full-Face",
    construction: "Monoblock",
    finish: "Black",
    application: "Luxury SUV",
    tags: ["full-face", "gloss-black", "luxury", "suv"],
    hasRender: false,
  },
  {
    id: "wd-20",
    name: "Silver Split-Spoke Motorsport",
    spokes: "Split-Spoke",
    construction: "Monoblock",
    finish: "Silver",
    application: "Motorsport",
    tags: ["split-spoke", "silver", "track", "concave"],
    hasRender: false,
  },
  {
    id: "wd-21",
    name: "Diamond-Cut Mesh Luxury",
    spokes: "Mesh",
    construction: "Monoblock",
    finish: "Diamond-Cut",
    application: "Luxury",
    tags: ["mesh", "diamond-cut", "luxury", "concave"],
    hasRender: false,
  },
  {
    id: "wd-22",
    name: "Red Accent Multi-Spoke",
    spokes: "Multi-Spoke",
    construction: "Monoblock",
    finish: "Red Accent",
    application: "Motorsport",
    tags: ["multi-spoke", "red-accent", "motorsport", "track"],
    hasRender: false,
  },
];

export function getWheelDesign(id: string): WheelDesign | undefined {
  return wheelDesigns.find((design) => design.id === id);
}

/* ---------------------------------------------------------------------------
   Copy (`/gallery/wheels`)
--------------------------------------------------------------------------- */

export const wheelGalleryHero = {
  eyebrow: "Design catalogue",
  heading: "Wheel Gallery",
  lede: "The wheel designs themselves, organised by spoke pattern, construction, finish and application. Every one is manufactured to your fitment — this is the shape you start from, not a stock number.",
} as const;

export const wheelGalleryIntro = {
  eyebrow: "How to read this",
  heading: "Filter to the shape, then specify it",
  body: "A forged wheel order starts with a design direction and ends with a fitment drawing. Use the filters to narrow to a spoke pattern and construction, then tell us the vehicle — we engineer the widths, offsets and load rating from there.",
} as const;

/** Standing note under the filter panel about the SVG representations. */
export const wheelRenderNote =
  "Cards show a generated technical drawing of each design, tinted to its finish — not a photograph. The drawing represents spoke count and finish direction so you can compare shapes at a glance.";

export const wheelGalleryEmptyState = {
  title: "No designs match those filters",
  body: "Try removing a facet, or clear the search. If you need a spoke pattern that is not here, send us a reference and we will tell you whether it is buildable.",
  action: { label: "Request a design", href: "/contact" },
} as const;

export const wheelGalleryPathways = [
  {
    eyebrow: "Reference",
    title: "Vehicle gallery",
    body: "The other half of the pair — real builds on real cars, with the sizes and finishes we manufactured to.",
    href: "/gallery",
    linkLabel: "Browse builds",
  },
  {
    eyebrow: "Range",
    title: "Wheel families",
    body: "Monoblock, two-piece forged and off-road — what each construction is for and how it is made.",
    href: "/products",
    linkLabel: "Compare families",
  },
] as const;
