import type {
  AnswerBlock,
  DetailChapter,
  FamilySpec,
  ProductFamily,
  ResourceLink,
  RouteStep,
} from "./types";

/**
 * Product families.
 *
 * PLACEHOLDER: `image` / `hoverImage` point at files that must be supplied.
 * Drop real renders into `public/images/products/` using these filenames, or
 * update the paths here. Set `hasRender: true` once a render exists — until
 * then the card shows a clean branded placeholder with no broken-image flash.
 */
export const productFamilies: ProductFamily[] = [
  {
    slug: "monoblock",
    hasRender: false,
    name: "Monoblock",
    summary:
      "Single-piece forged construction — the lightest and stiffest option in the range.",
    highlights: [
      "One-piece 6061-T6 forged blank",
      "Weight-optimised spoke machining",
      "Best strength-to-weight for track and performance builds",
      "Tightest tolerances on runout and balance",
    ],
    image: "/images/products/monoblock-base.jpg",
    hoverImage: "/images/products/monoblock-hover.jpg",
    href: "/products/monoblock",
  },
  {
    slug: "two-piece",
    hasRender: false,
    name: "Two-Piece Forged",
    summary:
      "Forged centre with a separate rim barrel — deep lips and wide fitments without compromise.",
    highlights: [
      "Forged centre, spun or flow-formed barrel",
      "Deep lip and step-lip options",
      "Serviceable — barrels can be replaced",
      "Widest range of widths and offsets",
    ],
    image: "/images/products/two-piece-base.jpg",
    hoverImage: "/images/products/two-piece-hover.jpg",
    href: "/products/two-piece",
  },
  {
    slug: "off-road",
    hasRender: false,
    name: "Off-Road & Truck",
    summary:
      "Heavy-duty forged wheels engineered for trucks, SUVs and lifted applications.",
    highlights: [
      "Reinforced load ratings for truck and SUV",
      "Beadlock-ready and simulated-beadlock faces",
      "Corrosion-resistant finishes for harsh climates",
      "Fitments for lifted and wide-body builds",
    ],
    image: "/images/products/off-road-base.jpg",
    hoverImage: "/images/products/off-road-hover.jpg",
    href: "/products/off-road",
  },
];

export function getProductFamily(slug: string): ProductFamily | undefined {
  return productFamilies.find((family) => family.slug === slug);
}

/* ---------------------------------------------------------------------------
   Catalogue hub copy (`/products`)
--------------------------------------------------------------------------- */

/**
 * `/products` viewport-01 header copy (rewritten 2026-10-02).
 *
 * The previous values described a wheel shop — heading "Custom Forged Wheels",
 * lede "Three construction types…". The grid immediately below this header is
 * now the company's four product lines, so the old copy made viewport 01
 * contradict itself: a wheel-only H1 sitting above four non-wheel cards.
 *
 * ⚠️ The `heading` is what `<h1 id="products-title">` renders. Keep it
 * company-level — if it ever names a single line again, the four-line grid
 * below it stops making sense.
 */
export const catalogueIntro = {
  eyebrow: "Product lines",
  heading: "Four product lines",
  lede: "Wheels, EV aluminum housings, custom aluminum components and self-sealing tires, presented across four parallel product lines.",
  supporting:
    "Each line follows its own engineering and process route. The responsible supplier, facility and supporting records are confirmed for each project.",
} as const;

export const catalogueGuidance = {
  eyebrow: "Getting started",
  heading: "Choose the right route for your project",
  lede: "Start with the product line and the information you have. Each project route explains what can be reviewed and which details still need confirmation.",
} as const;

export const catalogueRoutes: RouteStep[] = [
  {
    step: "01",
    title: "Choose a product line",
    body: "Select wheels, EV aluminum housings, custom aluminum components or self-sealing tires to reach the relevant project information.",
    href: "/products",
    linkLabel: "Review product lines",
  },
  {
    step: "02",
    title: "Share the available inputs",
    body: "Provide the drawing, model, sample or vehicle details that apply to the project. Missing information remains open for review.",
    href: "/request-a-quote",
    linkLabel: "Start a project inquiry",
  },
  {
    step: "03",
    title: "Confirm the project requirements",
    body: "Product-specific requirements, validation evidence and supply scope are reviewed against the information provided; a page listing is not a fitment or feasibility approval.",
    href: "/contact",
    linkLabel: "Contact the project team",
  },
  {
    step: "04",
    title: "Agree any finish or process details",
    body: "Finish, process, inspection and delivery details depend on the selected product line and project. Confirm availability and acceptance criteria with the project team.",
    href: "/gallery/finishes",
    linkLabel: "See finishes",
  },
];

export const catalogueFitmentSupport = {
  eyebrow: "Fitment support",
  heading: "Wheel fitment requires project review",
  lede: "Recorded wheel dimensions help define a review, but they do not confirm vehicle fitment. Brake clearance, interfaces and load requirements must be checked for the selected variant and application.",
  points: [
    "Vehicle, trim and modification details to review",
    "Brake and caliper clearance requirements",
    "Selected diameter, width, offset, PCD and center bore",
    "Application load requirements and supporting evidence",
  ],
} as const;

/* ---------------------------------------------------------------------------
   Product family detail copy (`/products/[slug]`)
--------------------------------------------------------------------------- */

/** Default answer block, used when a family has no dedicated copy. */
const defaultAnswer: AnswerBlock = {
  eyebrow: "What it is",
  heading: "Built to your specification, not a catalogue number",
  body: "This family is manufactured in our own facility to the fitment data you supply. Nothing ships from stock — each set is cut, finished and inspected against the order.",
  points: [
    "Manufactured to your vehicle data and target fitment",
    "Finished to your specification from a validated finish range",
    "Branded centre caps and packaging available",
    "Inspection record attached to every order",
  ],
};

const answersByFamily: Record<string, AnswerBlock> = {
  monoblock: {
    eyebrow: "What it is",
    heading: "A single forged piece, machined for minimum weight",
    body: "Monoblock wheels are cut from one forged blank — there is no join, no bolted centre and no separate barrel. That makes them the lightest and stiffest construction we build, and the first choice where unsprung weight and steering response matter.",
    points: [
      "Built for track, performance and aggressive-fitment builds",
      "Best strength-to-weight ratio in the range",
      "Tightest tolerances on runout and balance",
      "Ideal where the buyer notices how the car feels, not just how it looks",
    ],
  },
  "two-piece": {
    eyebrow: "What it is",
    heading: "A forged centre on a separate barrel",
    body: "Two-piece forged wheels pair a forged centre with a separately formed rim barrel, joined so the lip can be shaped independently of the spoke design. The result is the deep-lip look and the extreme widths that a single piece cannot produce.",
    points: [
      "Built for wide-body, stance and deep-lip builds",
      "Widest range of widths and offsets we offer",
      "Lip depth and step styling set separately from the face",
      "Serviceable — barrels can be replaced without scrapping the centre",
    ],
  },
  "off-road": {
    eyebrow: "What it is",
    heading: "Heavy-duty forged wheels for trucks and SUVs",
    body: "Off-road and truck wheels are engineered around load, not lap time. The forging process gives the strength to take a hit, while the finish system is specified to survive salt, grit and constant washing.",
    points: [
      "Reinforced load ratings for truck, SUV and lifted applications",
      "Beadlock-ready and simulated-beadlock faces",
      "Corrosion-resistant finishes for harsh climates",
      "Fitments for lifted, wide-body and overland builds",
    ],
  },
};

export function getFamilyAnswer(slug: string): AnswerBlock {
  return answersByFamily[slug] ?? defaultAnswer;
}

/** Construction chapters shown on every family page. */
export const familyDetailChapters: DetailChapter[] = [
  {
    step: "01",
    title: "Forge",
    body: "A solid billet is forged under high pressure so the grain structure follows the shape of the wheel. The blank that comes out is stronger and lighter than an equivalent casting.",
  },
  {
    step: "02",
    title: "Machine",
    body: "Multi-axis CNC machining cuts the spoke profile, bolt pattern and centre bore to your approved drawing, holding runout inside tolerance.",
  },
  {
    step: "03",
    title: "Finish",
    body: "Brushing, polishing, anodising or powder coating is applied in controlled stages so colour and gloss repeat across every order — not just the first one.",
  },
  {
    step: "04",
    title: "Inspect",
    body: "Dimensional check, radial and lateral runout measurement and balance before dispatch, with a documented inspection record attached to the order.",
  },
];

/** Spec table rows, per family. */
const specsByFamily: Record<string, FamilySpec[]> = {
  monoblock: [
    { label: "Construction", value: "One-piece forged" },
    { label: "Material", value: "6061-T6 forged aluminium" },
    { label: "Diameter range", value: "17\" – 22\"" },
    { label: "Width range", value: "8.0\" – 12.0\"" },
    { label: "Face profiles", value: "Flat to deep concave" },
    { label: "Finishes", value: "Brushed, satin, gloss, matte, polished" },
  ],
  "two-piece": [
    { label: "Construction", value: "Forged centre, separate barrel" },
    { label: "Material", value: "6061-T6 forged centre" },
    { label: "Diameter range", value: "18\" – 24\"" },
    { label: "Width range", value: "8.5\" – 13.0\"" },
    { label: "Lip options", value: "Step lip and deep lip" },
    { label: "Serviceability", value: "Barrels replaceable" },
  ],
  "off-road": [
    { label: "Construction", value: "One-piece or two-piece forged" },
    { label: "Material", value: "Reinforced forged aluminium" },
    { label: "Diameter range", value: "17\" – 22\"" },
    { label: "Width range", value: "8.0\" – 12.0\"" },
    { label: "Load rating", value: "Reinforced for truck and SUV" },
    { label: "Finishes", value: "Corrosion-resistant satin and matte" },
  ],
};

export function getFamilySpecs(slug: string): FamilySpec[] {
  return specsByFamily[slug] ?? specsByFamily.monoblock;
}

/** Related-resource links shown at the foot of each family page. */
export const familyResourceLinks: ResourceLink[] = [
  // The "Vehicle gallery → /gallery" card was removed 2026-10-06 (DEC-059):
  // /gallery is archived, and "real platforms … on each build" was a false
  // claim — those builds never existed.
  {
    eyebrow: "Reference",
    title: "Finish gallery",
    body: "Compare brushed, satin, gloss and matte options before you commit a finish to the order.",
    href: "/gallery/finishes",
    linkLabel: "View finishes",
  },
  {
    eyebrow: "Manufacturing",
    title: "How we build them",
    body: "Follow a set from engineering review through forging, machining, finishing and inspection.",
    href: "/capabilities",
    linkLabel: "See the process",
  },
];

/** SKU index callout shown on the catalogue hub. */
export const catalogueSkuCallout = {
  eyebrow: "Individual wheels",
  heading: "Shop the range by SKU",
  body: "Each construction covers several shapes. If you already know the spoke count and face you want, the SKU catalogue lists every orderable wheel with its construction, finishes and applications.",
  cta: { label: "Browse all wheel SKUs", href: "/products/wheels" },
} as const;

/** Related-resource links shown on the catalogue hub. */
export const catalogueResourceLinks: ResourceLink[] = [
  // The "Vehicle gallery → /gallery" card was removed 2026-10-06 (DEC-059):
  // /gallery is archived and its fitment references were invented.
  {
    eyebrow: "Finishes",
    title: "Finish reference",
    body: "Eight finish directions with a note on how to request physical samples.",
    href: "/gallery/finishes",
    linkLabel: "Compare finishes",
  },
  {
    eyebrow: "Manufacturing",
    title: "Manufacturing process",
    body: "Six stages from engineering review to protective packaging.",
    href: "/capabilities",
    linkLabel: "See the process",
  },
];
