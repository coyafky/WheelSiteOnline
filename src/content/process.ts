import type { ProcessStage, ResourceLink } from "./types";

/**
 * Manufacturing stages, in production order.
 *
 * PLACEHOLDER: images must be supplied in `public/images/process/`.
 */
export const processStages: ProcessStage[] = [
  {
    step: "01",
    title: "Engineering Review",
    body: "Your vehicle data and target fitment are checked against brake clearance, suspension travel and load rating before anything is cut.",
    image: "/images/process/01-engineering.jpg",
  },
  {
    step: "02",
    title: "Forging",
    body: "A solid billet is forged under high pressure to align the grain structure, producing a blank that is both stronger and lighter than cast alternatives.",
    image: "/images/process/02-forging.jpg",
  },
  {
    step: "03",
    title: "CNC Machining",
    body: "Multi-axis machining cuts the spoke profile, bolt pattern and centre bore to the approved drawing, holding runout inside tolerance.",
    image: "/images/process/03-machining.jpg",
  },
  {
    step: "04",
    title: "Finishing",
    body: "Brushing, polishing, anodising or powder coating — applied in controlled stages so colour and gloss repeat across every order.",
    image: "/images/process/04-finishing.jpg",
  },
  {
    step: "05",
    title: "Quality Control",
    body: "Dimensional check, radial and lateral runout measurement, balance, and a documented inspection record attached to the order.",
    image: "/images/process/05-quality.jpg",
  },
  {
    step: "06",
    title: "Protective Packaging",
    body: "Foam-lined cartons with branded inserts, built to survive international freight intact — including private-label packaging on request.",
    image: "/images/process/06-packaging.jpg",
  },
];

/* ---------------------------------------------------------------------------
   Process page copy (`/capabilities`)
   ---------------------------------------------------------------------------
   PLACEHOLDER: the stage list in `processStages` carries an `image` path per
   stage, but no photography exists in `public/images/process/` yet. The
   explorer therefore renders a numbered CSS panel and never requests the
   file. Render the `<img>` layer once the assets land.
--------------------------------------------------------------------------- */

/**
 * `/capabilities` opening copy.
 *
 * This page is not "the wheel manufacturing story" any more — it is the
 * full-plant capability and quality overview that a procurement reader uses
 * to judge whether the factory can do the job and how consistency is
 * guaranteed. So the copy speaks to capability, tolerance and inspection
 * rather than walking one product through six stages.
 *
 * ⚠️ `supporting` states that the process is not subcontracted. That is a
 * commercial commitment and must be confirmed by Fenghuai before launch.
 */
export const processHero = {
  eyebrow: "Capabilities",
  heading: "What the Plant Can Make, and How It Proves It",
  lede: "This is the factory seen as a tool: the processes on the floor, the materials the lines are set up for, and the inspection that every order has to clear. Work through the six production stages below — each one is a gate the order must pass before the next begins.",
  supporting:
    "⏳ Pending confirmation — the claim that nothing is subcontracted work we cannot supervise (forging, machining, finishing and inspection in the same facility) is a commercial commitment that must be verified before launch.",
} as const;

export const processExplorerCopy = {
  eyebrow: "Stage explorer",
  heading: "Walk the line",
  lede: "Select a stage to see what happens in it and what it protects against. The order moves forward only when the stage before it has been signed off.",
  /** Accessible label for the tab list itself. */
  tabListLabel: "Manufacturing stages",
  /** Accessible label for the panel region. */
  panelLabel: "Stage detail",
} as const;

/** The two facts shown for every stage: where it happens and what it gates. */
export const processStageNotes: Record<
  string,
  { location: string; guards: string }
> = {
  "01": {
    location: "Engineering office",
    guards: "Prevents a wheel that clears the caliper on paper but not on the car.",
  },
  "02": {
    location: "Forge shop",
    guards: "Prevents a blank whose grain structure is wrong for the load path.",
  },
  "03": {
    location: "CNC floor",
    guards: "Prevents a fitment that is dimensionally close instead of correct.",
  },
  "04": {
    location: "Finishing line",
    guards: "Prevents a finish that reads differently on the second order.",
  },
  "05": {
    location: "Inspection bay",
    guards: "Prevents a set leaving without a record of what was measured.",
  },
  "06": {
    location: "Packing and despatch",
    guards: "Prevents a finished wheel arriving damaged and un-replaceable.",
  },
};

export const processQuality = {
  eyebrow: "Quality and testing",
  heading: "Inspection is a stage, not an afterthought",
  body: "Quality control is listed as stage five, but it is not a final gate that everything else ignores. Each earlier stage has its own check that has to pass before the order moves on — this is simply where the measurements are recorded.",
  points: [
    "Dimensional verification against the approved drawing",
    "Radial and lateral runout measured and recorded per set",
    "Balance checked before the wheel is packed",
    "Inspection record attached to the order number",
    "⏳ Pending confirmation — the laboratory and homologation testing we can name, and the tolerances we can publish, must be confirmed by production before launch.",
  ],
} as const;

/**
 * Hard-evidence figures for §④ that are NOT yet confirmed.
 *
 * No tolerance or runout figure is rendered as fact on `/capabilities` until
 * Fenghuai signs it off — an unconfirmed number is worse than a missing one on
 * a page whose whole job is to be believable to a procurement reader.
 */
export const processHardEvidence = {
  eyebrow: "Measured, not claimed",
  heading: "The measurements an order is held to",
  body: "Consistency is not a tone of voice; it is a set of numbers held on every unit. The dimensions below are the ones we intend to publish, each pending confirmation by production.",
  items: [
    {
      label: "Radial runout",
      value: "⏳ Pending confirmation",
      note: "The runout figure held per set before a wheel is released.",
    },
    {
      label: "Lateral runout",
      value: "⏳ Pending confirmation",
      note: "The runout figure held per set before a wheel is released.",
    },
    {
      label: "Critical dimensions",
      value: "⏳ Pending confirmation",
      note: "The tolerance held on critical dimensions against the approved drawing.",
    },
    {
      label: "Certification",
      value: "⏳ Pending confirmation",
      note: "Name a management-system or product standard only once the plant is actually certified to it.",
    },
  ],
} as const;

/**
 * A note stating which standards we are deliberately NOT claiming.
 *
 * The EV-components page owns the IATF 16949 question; this page must not
 * borrow that claim. Naming what we do not hold is the honest half of a
 * quality section.
 */
export const processQualityBoundary =
  "Standards we do not currently claim are not listed here as if we did. Where a market requires a specific certification or homologation, we disclose whether we hold it before you commit to an order.";

export const processCapability = {
  eyebrow: "What this buys you",
  heading: "Why the stage order matters to a dealer",
  body: "A dealer does not buy a process; they buy a wheel that fits and a story they can tell a customer. Each stage exists to remove a specific way that goes wrong.",
  points: [
    { title: "Fewer fitment failures", body: "Clearance and load rating are checked before cutting, not discovered after delivery." },
    { title: "Repeatable finishes", body: "Finish stages are controlled so the second order matches the first." },
    { title: "Evidence on request", body: "Measurement records are kept against the order and can be supplied to you." },
    { title: "Freight-proof packing", body: "Packing is specified for international freight, not for a courier drop." },
  ],
} as const;

export const processPathways: ResourceLink[] = [
  {
    eyebrow: "Range",
    title: "Wheel families",
    body: "Monoblock, two-piece forged and off-road — which construction suits which build.",
    href: "/products",
    linkLabel: "Compare families",
  },
  {
    eyebrow: "Programme",
    title: "Dealer supply",
    body: "How to sell these wheels without holding stock, and what onboarding looks like.",
    href: "/dealers",
    linkLabel: "See the dealer program",
  },

];
