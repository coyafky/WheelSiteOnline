import type { WheelConstruction, WheelSku } from "./types";
import { productFamilies } from "./products";

/**
 * Per-SKU wheel product catalogue (`/products/wheels/[sku]`).
 *
 * A family page answers "what is a monoblock". A SKU page answers "what is
 * this specific wheel" — its spoke count, construction, the finishes it is
 * offered in, and where it suits. This is the level a dealer quotes from and
 * a buyer links to.
 *
 * NAMING SCHEME (working convention, not a confirmed Fenghuai scheme):
 *   N-   monoblock
 *   H-   two-piece forged
 *   S-   two-piece speciality / step-lip
 *   OR-  off-road & truck
 * The numeric suffix is a nominal diameter code followed by a face variant
 * letter. These codes are PLACEHOLDER working titles; rename against the real
 * catalogue before launch, and keep `family` pointed at a real `wheelFamilies`
 * slug so grouping never breaks.
 *
 * NO PHOTOGRAPHY EXISTS. Every SKU is `hasRender: false` and its hero draws a
 * technical SVG from `spokes` + finish (see `WheelSketch`). Nothing here
 * requests a file.
 */

export const wheelSkus: WheelSku[] = [
  /* --- Monoblock (N-) --------------------------------------------------- */
  {
    sku: "N-100RS",
    name: "N-100RS Five-Spoke Monoblock",
    family: "monoblock",
    spokes: 5,
    construction: "Monoblock",
    finishes: ["Gunmetal", "Silver", "Black", "Diamond-Cut"],
    summary:
      "A five-spoke monoblock with a broad tapered blade — the working default for performance and luxury fitments.",
    description:
      "The N-100RS is the starting shape for most monoblock orders. Five tapered blades run from a compact hub to the rim, keeping the face open enough to show a large brake package and simple enough to machine light. It is the safest choice when the buyer has not yet committed to a look.",
    applications: ["Performance saloons", "Sports SUVs", "Track use", "Daily-driven luxury"],
    hasRender: false,
  },
  {
    sku: "N-110RS",
    name: "N-110RS Split-Spoke Monoblock",
    family: "monoblock",
    spokes: 10,
    construction: "Monoblock",
    finishes: ["Black", "Matte Black", "Gunmetal", "Silver"],
    summary:
      "Ten slender blades read as a five-spoke split down the centre — visual depth without added mass.",
    description:
      "The N-110RS takes the five-spoke layout and splits each blade down the centre, which gives the face more visual complexity at a distance without adding a second ring of material. Machined from a single forged blank, it keeps monoblock stiffness while the thinner blades lighten the face.",
    applications: ["Performance saloons", "Coupes", "Track use", "Stance builds"],
    hasRender: false,
  },
  {
    sku: "N-112M",
    name: "N-112M Multi-Spoke Monoblock",
    family: "monoblock",
    spokes: 15,
    construction: "Monoblock",
    finishes: ["Silver", "Brushed Silver", "Gunmetal", "Black"],
    summary:
      "Fifteen fine blades for a dense, technical face — the pattern dealers reach for on large-diameter fitments.",
    description:
      "Fifteen blades fill the face at large diameters, where a five-spoke can start to look sparse. The density also makes the wheel read smaller than it is, which suits cars that wear a large factory diameter without wanting to shout about it.",
    applications: ["Luxury saloons", "Large-diameter OE replacements", "Coupes", "Daily-driven luxury"],
    hasRender: false,
  },
  {
    sku: "N-118T",
    name: "N-118T Turbine Monoblock",
    family: "monoblock",
    spokes: 11,
    construction: "Monoblock",
    finishes: ["Brushed Silver", "Gunmetal", "Two-Tone", "Black"],
    summary:
      "Directional turbine blades that read as motion even when the car is standing still.",
    description:
      "The N-118T sets its blades at an angle so they appear to sweep as the wheel turns. Beyond the look, a directional face changes how light moves across a brushed or two-tone finish, which is why it is frequently specified alongside those options.",
    applications: ["Performance saloons", "Electric vehicles", "Aero-conscious builds", "Coupes"],
    hasRender: false,
  },
  {
    sku: "N-120FF",
    name: "N-120FF Full-Face Monoblock",
    family: "monoblock",
    spokes: 7,
    construction: "Monoblock",
    finishes: ["Gunmetal", "Black", "Matte Black", "Diamond-Cut"],
    summary:
      "A closed full-face design that keeps the brake package discreet and the surface easy to keep clean.",
    description:
      "The N-120FF closes the face down to narrow slots between broad blades. It hides the brake assembly behind the wheel, which some buyers want on a luxury SUV, and the near-continuous surface is straightforward to clean. The trade-off is airflow and a heavier visual mass.",
    applications: ["Luxury SUVs", "Winter sets", "Executive saloons", "Concierge fleets"],
    hasRender: false,
  },
  {
    sku: "N-105R5",
    name: "N-105R5 Retro Five Monoblock",
    family: "monoblock",
    spokes: 5,
    construction: "Monoblock",
    finishes: ["Gunmetal", "Silver", "Gold", "Gloss White"],
    summary:
      "Five wide, flat blades on a shallow face — a period-correct look that suits older chassis.",
    description:
      "The N-105R5 is deliberately flat where most of the range is concave. Wide, straight blades and a shallow face read as period-correct on older performance chassis and on modern cars chasing a retro cue. It is often ordered in a single bold colour rather than a neutral.",
    applications: ["Classic-inspired builds", "Older performance chassis", "Rally-inspired cars", "Show cars"],
    hasRender: false,
  },
  {
    sku: "N-122M",
    name: "N-122M Mesh Monoblock",
    family: "monoblock",
    spokes: 20,
    construction: "Monoblock",
    finishes: ["Silver", "Diamond-Cut", "Two-Tone", "Brushed Silver"],
    summary:
      "A twenty-strut mesh face — the densest pattern in the range, and the most forgiving of large diameters.",
    description:
      "Twenty fine struts form a mesh across the face, supported by a secondary ring of struts. It is the pattern that best disguises a large diameter, and it takes a diamond-cut or two-tone treatment unusually well because the many edges break the surface into facets that catch light differently.",
    applications: ["Luxury saloons", "Large-diameter fitments", "Executive SUVs", "Wide-body builds"],
    hasRender: false,
  },
  {
    sku: "N-108RD",
    name: "N-108RD Red Accent Monoblock",
    family: "monoblock",
    spokes: 15,
    construction: "Monoblock",
    finishes: ["Red Accent", "Black", "Matte Black", "Gunmetal"],
    summary:
      "A fine multi-spoke face with a red rim accent — a deliberate motorsport cue rather than a subtle one.",
    description:
      "The N-108RD pairs a fifteen-blade face with a red accent on the rim lip or spoke edge. The accent is applied at the finishing stage, so the base colour and the accent are specified together. It reads as an explicit motorsport reference and suits a car that already carries matching brake calipers.",
    applications: ["Motorsport-inspired builds", "Track cars", "Performance coupes", "Show cars"],
    hasRender: false,
  },

  /* --- Two-piece forged (H- / S-) --------------------------------------- */
  {
    sku: "H-102P",
    name: "H-102P Deep-Lip Split Two-Piece",
    family: "two-piece",
    spokes: 10,
    construction: "Deep-Lip Two-Piece",
    finishes: ["Silver", "Brushed Silver", "Black", "Two-Tone"],
    summary:
      "A forged split-spoke centre on a deep polished barrel — the classic wide-body pairing.",
    description:
      "The H-102P sets a split-spoke forged centre inside a deep polished barrel, so the lip reads as a deliberate ring around the face. The centre and barrel are manufactured separately, which is what allows the lip depth to be set to the build rather than to the face design.",
    applications: ["Wide-body builds", "Stance builds", "Luxury coupes", "Show cars"],
    hasRender: false,
  },
  {
    sku: "H-106M",
    name: "H-106M Deep-Lip Mesh Two-Piece",
    family: "two-piece",
    spokes: 20,
    construction: "Deep-Lip Two-Piece",
    finishes: ["Two-Tone", "Brushed Silver", "Silver", "Gold"],
    summary:
      "A dense mesh centre with a contrasting lip — maximal surface detail across the face and rim.",
    description:
      "Twenty fine struts against a deep, separately formed lip give the H-106M more visual texture than anything else in the range. Two-tone is the usual specification, with the lip finished in a contrasting colour so the barrel and the face read as two deliberate layers.",
    applications: ["Luxury saloons", "European tuning builds", "Wide-body builds", "Show cars"],
    hasRender: false,
  },
  {
    sku: "H-104G",
    name: "H-104G Deep-Lip Multi-Spoke Two-Piece",
    family: "two-piece",
    spokes: 12,
    construction: "Deep-Lip Two-Piece",
    finishes: ["Gold", "Black", "Brushed Silver", "Two-Tone"],
    summary:
      "Twelve blades over a deep barrel, frequently specified in a single bold finish for stance builds.",
    description:
      "The H-104G sits between the split-spoke and mesh centres: twelve blades broad enough to carry a solid colour, over a barrel deep enough to read from across a car park. It is the shape most often ordered in a single saturated finish for a stance build.",
    applications: ["Stance builds", "Wide-body builds", "Luxury coupes", "Show cars"],
    hasRender: false,
  },
  {
    sku: "S-102T",
    name: "S-102T Step-Lip Turbine Two-Piece",
    family: "two-piece",
    spokes: 11,
    construction: "Deep-Lip Two-Piece",
    finishes: ["Brushed Silver", "Gunmetal", "Diamond-Cut", "Black"],
    summary:
      "Turbine blades on a step-lip barrel — the rim steps in two stages rather than one continuous taper.",
    description:
      "The S-102T uses a step-lip barrel, where the rim steps down in discrete stages rather than tapering smoothly. Combined with directional turbine blades, it gives a hard, faceted edge line where the lip meets the face — a detail that reads especially well in a brushed or diamond-cut finish.",
    applications: ["Track-focused builds", "Performance coupes", "Aero-conscious builds", "Show cars"],
    hasRender: false,
  },
  {
    sku: "S-104D",
    name: "S-104D Diamond-Cut Two-Tone Two-Piece",
    family: "two-piece",
    spokes: 5,
    construction: "Deep-Lip Two-Piece",
    finishes: ["Diamond-Cut", "Two-Tone", "Silver", "Brushed Silver"],
    summary:
      "A five-spoke face machined to a bright highlight over a darkened base — maximum edge line.",
    description:
      "The S-104D is machined so that the face of each blade catches a bright highlight while the recesses stay dark. Over a deep lip, the result is the sharpest edge line the range can produce. It is a finishing-intensive specification and is usually reserved for display or show use.",
    applications: ["Show cars", "Luxury SUVs", "Wide-body builds", "Display sets"],
    hasRender: false,
  },
  {
    sku: "S-101P",
    name: "S-101P Deep-Lip Retro Five Two-Piece",
    family: "two-piece",
    spokes: 5,
    construction: "Deep-Lip Two-Piece",
    finishes: ["Gold", "Silver", "Brushed Silver", "Gloss White"],
    summary:
      "Wide retro blades on a deep polished lip — period styling with modern barrel construction.",
    description:
      "The S-101P takes the retro five-blade face and mounts it on a deep polished barrel. It is the shape buyers ask for when they want a classic look at a modern width, and it is often specified in gold or gloss white rather than a neutral.",
    applications: ["Classic-inspired builds", "Stance builds", "Show cars", "Rally-inspired cars"],
    hasRender: false,
  },

  /* --- Off-road & truck (OR-) ------------------------------------------- */
  {
    sku: "OR-701B",
    name: "OR-701B Beadlock Off-Road Five-Spoke",
    family: "off-road",
    spokes: 5,
    construction: "Beadlock Off-Road",
    finishes: ["Matte Black", "Gunmetal", "Black"],
    summary:
      "Five heavy blades on a beadlock face, load-rated for truck and raised-SUV duty.",
    description:
      "The OR-701B is built around load rather than lap time. Five broad blades carry the face, and the beadlock ring is fastened for genuine off-road use. The finish system is specified to survive salt, grit and regular washing, which is why satin and matte options dominate the palette.",
    applications: ["Pickup trucks", "Overland builds", "Lifted SUVs", "Fleet vehicles"],
    hasRender: false,
  },
  {
    sku: "OR-712M",
    name: "OR-712M Beadlock Multi-Spoke Off-Road",
    family: "off-road",
    spokes: 12,
    construction: "Beadlock Off-Road",
    finishes: ["Gunmetal", "Matte Black", "Brushed Silver"],
    summary:
      "A twelve-blade off-road face on a beadlock ring — more visual texture at large truck diameters.",
    description:
      "At the diameters a modern truck runs, a five-spoke can look under-filled. The OR-712M uses twelve blades to keep the face busy without losing the strength the ring and hub need. Like the rest of the off-road range, it is load-rated for its application.",
    applications: ["Pickup trucks", "Overland builds", "Heavy-duty SUVs", "Lifted builds"],
    hasRender: false,
  },
];

/** Resolve a SKU by its code, case-insensitively. */
export function getWheelSku(sku: string): WheelSku | undefined {
  const needle = sku.trim().toLowerCase();
  return wheelSkus.find((item) => item.sku.toLowerCase() === needle);
}

/** All SKUs belonging to a family slug, excluding an optional SKU. */
export function getSkusByFamily(family: string, exclude?: string): WheelSku[] {
  return wheelSkus.filter(
    (item) => item.family === family && item.sku !== exclude,
  );
}

/* ---------------------------------------------------------------------------
   Copy
--------------------------------------------------------------------------- */

export const wheelSkuCopy = {
  breadcrumbRoot: { label: "Products", href: "/products" },
  breadcrumbWheels: { label: "Wheels", href: "/products/wheels" },
  heroEyebrow: "Wheel product",
  /** Standing note about the generated drawing, reused from the gallery tone. */
  renderNote:
    "The drawing above is generated from this SKU's spoke count and finish — not a photograph. It represents the face geometry and finish direction so you can compare shapes; it is not a dimensional drawing.",
  specEyebrow: "Specification",
  specHeading: "What this SKU is",
  finishEyebrow: "Finishes",
  finishHeading: "Finishes this SKU is offered in",
  finishNote:
    "Swatches are illustrative design colours, not colour-matched samples. Ask for a physical sample before committing a finish to an order.",
  applicationEyebrow: "Where it suits",
  applicationHeading: "Common applications",
  relatedEyebrow: "Same family",
  relatedHeading: "Related SKUs",
  fitmentEyebrow: "Fitment",
  fitmentHeading: "Every SKU is cut to your fitment",
  fitmentBody:
    "Diameter, width, offset, PCD and centre bore are specified per order — the SKU defines the shape, not the size. Send us the vehicle and we will return a buildable specification in writing before material is cut.",
  /** Rendered as a small note beneath the spec table. */
  specDisclosure:
    "Spoke count and construction are fixed per SKU. Diameter, width, offset, PCD, centre bore and load rating are confirmed per order against your vehicle.",
} as const;

/* ---------------------------------------------------------------------------
   SKU index copy (`/products/wheels`)
--------------------------------------------------------------------------- */

export const wheelIndexCopy = {
  eyebrow: "SKU catalogue",
  heading: "Wheel Products",
  lede: "Every SKU in the range, grouped by construction. A SKU fixes the shape — the spoke count, the face and the construction — while diameter, width, offset and finish are specified to your order.",
  supporting:
    "Working SKU codes, not a confirmed Fenghuai numbering scheme. Confirm the real catalogue codes before launch.",
  groupEyebrow: "By construction",
  groupHeading: "Browse the SKUs",
  cardCta: "View SKU",
} as const;

/** Map a family slug to its display name; fall back to the slug itself. */
function getWheelFamilyName(familySlug: string): string {
  return (
    productFamilies.find((family) => family.slug === familySlug)?.name ??
    familySlug
  );
}

/** Specification rows are derived, not stored, so they can never contradict the SKU. */
export function skuSpecRows(sku: WheelSku): { label: string; value: string }[] {
  const constructionLabel: Record<WheelConstruction, string> = {
    Monoblock: "One-piece forged monoblock",
    "Deep-Lip Two-Piece": "Two-piece forged, deep lip",
    "Beadlock Off-Road": "One-piece forged, beadlock ring",
    "Beadlock-Style": "One-piece forged, simulated beadlock",
  };

  return [
    { label: "SKU", value: sku.sku },
    { label: "Family", value: getWheelFamilyName(sku.family) },
    { label: "Construction", value: constructionLabel[sku.construction] },
    { label: "Spokes", value: String(sku.spokes) },
    { label: "Finishes offered", value: String(sku.finishes.length) },
    {
      label: "Size",
      value: "Specified per order",
    },
  ];
}
