import type { DealerProgram, FlowStep } from "./types";

/**
 * Custom development page copy (`/custom-development`).
 *
 * SCOPE DISCIPLINE — read this before editing
 * -------------------------------------------
 * This page owns the COMMERCIAL half of custom work: how we cooperate (OEM /
 * ODM / private label), what the commercial milestones are, and what the
 * order thresholds are. The ENGINEERING half — DFM feedback, tooling
 * development, first-article inspection (FAIR), tight-tolerance and material
 * detail — belongs to `/products/custom-aluminum` §development-flow.
 *
 * Concretely, that means:
 *   - section ③ below stays at commercial-node level and links out for the
 *     engineering flow; it must not grow into a second engineering narrative
 *   - commercial terms (MOQ, tooling, lead time) live here and must not be
 *     duplicated on the aluminium page
 *
 * Every commercial figure is a PLACEHOLDER and must be confirmed by Fenghuai.
 */

export const customDevHero = {
  eyebrow: "Custom Development",
  heading: "Built to Your Brand, Your Drawing, Your Specification",
  lede: "We develop and manufacture wheels for brand owners and OEM project teams — from an existing design adapted to your mark, through to a new tool cut to your drawing.",
  supporting:
    "This page covers how we cooperate and what the commercial milestones are. If you are here for the engineering detail, the technical flow is linked from the process section below.",
  audience: "For private-label brand owners and OEM project customers.",
} as const;

export const customDevHeroActions = {
  primary: { label: "Submit your requirement", href: "/contact" },
  secondary: { label: "See the cooperation models", href: "#cooperation-models" },
} as const;

/**
 * The three cooperation models.
 *
 * Written as three definitions, not a product line-up: the point of the
 * section is that customers use these three acronyms with three different
 * meanings, so we define ours. They are deliberately unordered and
 * un-recommended — we do not know which one fits the reader.
 *
 * 🔴 PLACEHOLDER: the real commercial boundaries of each model (does the plant
 * actually run ODM today? who owns the tool?) must be confirmed by Fenghuai
 * before launch. Written here as definitions plus open questions.
 *
 * Reuses `DealerProgram` so the card shape matches `/dealers` — `body` carries
 * "who it suits", `points` carries "what you provide".
 */
export const cooperationModels: DealerProgram[] = [
  {
    slug: "oem",
    name: "OEM",
    tagline: "We build to your drawing and your specification, and the product wears your brand.",
    body: "Suits brand owners who already have a design capability — their own drawings, their own tooling intent, their own specification.",
    points: [
      "Drawings, specifications or a physical sample",
      "Target volumes so tooling amortisation can be assessed",
      "Approved branding assets for caps, engraving and packaging",
    ],
    href: "/contact",
  },
  {
    slug: "odm",
    name: "ODM",
    tagline: "You select from our existing designs, we adapt the appearance or parameters, and it ships under your brand.",
    body: "Suits brand owners who want to reach market quickly without funding a new tool from zero.",
    points: [
      "The design direction you want to start from",
      "The customisation points — finish, face profile, sizing, branding",
      "Indicative volumes per design",
    ],
    href: "/contact",
  },
  {
    slug: "private-label",
    name: "Private Label",
    tagline: "You select from existing models and we apply your mark to the wheel, the packaging and the paperwork.",
    body: "Suits established resellers with a stable customer base who want their own name on a proven catalogue.",
    points: [
      "The model list you intend to carry",
      "Volumes per model so a production slot can be planned",
      "Brand assets for caps, packaging and documentation",
    ],
    href: "/contact",
  },
];

export const cooperationModelsCopy = {
  eyebrow: "Cooperation models",
  heading: "Three ways to work with us — and which one is yours",
  // Section ② carries the anchor the aluminium page links back to.
  lede: "OEM, ODM and private label are used loosely across the industry, which is why two suppliers can quote the same three letters and mean different things. Here is precisely what each means on our side of the table. We do not rank them; the right one depends on how much of the design you own.",
  /** Rendered as an explicit "to be confirmed" note under the cards. */
  confirmationNote:
    "⚠️ Pending confirmation — the exact commercial boundaries of each model (tooling ownership, who funds the tool, exclusivity) are being confirmed by production before launch.",
} as const;

/**
 * The commercial view of the development process.
 *
 * Deliberately five one-line commercial milestones — not the engineering
 * sequence. Anything about tolerances, DFM feedback or first-article reports
 * belongs to `/products/custom-aluminum#development-flow`, which the section
 * links to. Keep this list short.
 */
export const developmentFlow: FlowStep[] = [
  {
    step: "01",
    title: "Requirement",
    body: "You send a drawing or a reference sample, and we confirm whether it is buildable and how we would work together.",
  },
  {
    step: "02",
    title: "Design review",
    body: "We come back on manufacturability and the tooling route, and you confirm the specification and the quantities.",
  },
  {
    step: "03",
    title: "Sampling",
    body: "Tooling is cut and a sample is produced, which you approve on appearance and fitment.",
  },
  {
    step: "04",
    title: "Validation",
    body: "Once the sample is signed off, a small batch is run to confirm the line repeats the approved part.",
  },
  {
    step: "05",
    title: "Volume production",
    body: "The order moves into serial production against the approved specification, with delivery scheduled.",
  },
];

export const developmentFlowCopy = {
  eyebrow: "Process (commercial view)",
  heading: "Five commercial milestones, not five engineering steps",
  lede: "The same five steps look very different depending on who is reading. This is the commercial sequence — who decides what, at which point the tooling is committed, and when your sign-off is needed. The engineering sequence is a different page.",
} as const;

/**
 * Cross-link from section ③ → the engineering flow on the aluminium page.
 *
 * 🔴 The destination route `/products/custom-aluminum` does not exist yet.
 * The link is written now because the two pages are a matched pair and the
 * anchor is a stable contract; it will resolve when that page lands. Do not
 * repoint it at a page that is not the engineering half.
 */
export const developmentFlowCrossLink = {
  eyebrow: "Technical detail",
  title: "The engineering view of the same flow",
  body: "DFM feedback, tooling development, first-article inspection (FAIR) and small-batch validation — the engineering detail behind the same five milestones — live on the custom aluminium page.",
  href: "/products/custom-aluminum#development-flow",
  linkLabel: "See the technical flow",
} as const;

/**
 * Commercial thresholds — MOQ, tooling and lead time.
 *
 * 🔴 `confirmed: false` is the switch. While false, the page renders a single
 * fallback sentence instead of a table, and the rows are not simply hidden —
 * they are never authored, so an invented MOQ cannot leak into the DOM later.
 * Set `confirmed: true` and populate `rows` once Fenghuai confirms the terms.
 */
export const mooTerms: {
  confirmed: boolean;
  eyebrow: string;
  heading: string;
  lede: string;
  /** Shown while `confirmed` is false. */
  fallback: string;
  columns: { key: string; label: string }[];
  rows: {
    model: string;
    moq: string;
    toolingDays: string;
    productionDays: string;
    toolingCost: string;
  }[];
} = {
  confirmed: false,
  eyebrow: "Thresholds",
  heading: "Minimum quantities, tooling and lead time",
  lede: "Every custom project is quoted against its own tooling and volume, so the thresholds below are the ones a written quotation will carry.",
  fallback:
    "⚠️ Pending confirmation — minimum order quantities, sampling lead times, production lead times and who carries the tooling cost are all project-specific. Send us the requirement and we will return a written quotation with those terms stated for your project rather than a generic figure here.",
  columns: [
    { key: "model", label: "Model" },
    { key: "moq", label: "Minimum order" },
    { key: "toolingDays", label: "Sampling time" },
    { key: "productionDays", label: "Production time" },
    { key: "toolingCost", label: "Tooling cost" },
  ],
  rows: [],
};

export const customDevCta = {
  title: "Bring us the drawing and the volume",
  body: "Tell us the brand, the drawing or reference, and the quantities you are planning. We will come back on which cooperation model fits and what the tooling route looks like.",
} as const;
