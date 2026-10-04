import type {
  AnswerBlock,
  BoundaryRow,
  Capability,
  FaqEntry,
  FlowStep,
  PartGroup,
  ResourceLink,
  RouteStep,
} from "./types";
import type { InputType } from "@/components/input-type-cards";

/**
 * Custom aluminium components (`/products/custom-aluminum`).
 *
 * The product here is the act of turning an input into a part, so the page is
 * built from three things: what input we accept, where the boundary sits, and
 * how the work actually runs. It is not a parts list — the source material for
 * this line names only four examples, which is nowhere near enough to pretend
 * to be a catalogue.
 *
 * 🔴 THE PUBLISHING CONDITION
 * The boundary section is the reason this page exists, and it ships in a
 * deliberately incomplete state: the "not made" column is empty because the
 * business has not confirmed which categories it declines. `boundaryTerms.
 * excludedConfirmed` is therefore false, the column renders as a reserved
 * slot with a disclosure sentence, and the page must not be indexed until
 * real rows exist. Shipping it empty and silent would tell a reader we make
 * anything — the precise impression this page was built to avoid.
 *
 * A second condition: the material and forming cards include aluminium and
 * magnesium because our own brochure covers them, but that copy was written
 * about wheel programs. The wording here is deliberately about capability
 * ("we can form these materials") rather than about any specific product, so
 * nothing migrates across contexts. Whether the two are used on non-wheel
 * parts is one of the open questions listed in the boundary section.
 */

export const caHero = {
  eyebrow: "CUSTOM ALUMINUM",
  heading: "Custom Aluminum Components",
  subheading:
    "Start with a Drawing, 3D Data or Physical Sample — we develop the part from there.",
  lede: "Built to a drawing or a sample, in aluminium and magnesium, across casting, forging and precision machining routes.",
  ctaLabel: "Send the drawing, start with DFM",
} as const;

export const caHeroActions = {
  primary: { label: "Send the drawing, start with DFM", href: "/contact" },
  secondary: { label: "See the development flow", href: "#development-flow" },
} as const;

export const caDefinition: AnswerBlock = {
  eyebrow: "What this line is",
  heading: "Custom aluminium is a process, not a product range",
  body: "There is no shelf to order from here. The work is turning an input — a drawing, a 3D model, a sample or a competitor's part — into a finished aluminium component that matches it. That is a different business from selling standard parts, and it changes what this page has to tell you: the useful information is what we can accept as input, where our limits are, and how the route from drawing to delivery runs. The detail below is organised around exactly those three things.",
  points: [
    "The input decides the job — a finished drawing, a neutral 3D format and a physical sample each start the work differently.",
    "Process choice follows the part — casting, forging and machining are matched to size, load, weight and volume rather than fixed in advance.",
    "The boundary is stated up front — including, where we can, what we do not take on, so neither side spends an evaluation finding out.",
  ],
};

/**
 * The split between this page and the powertrain-housing page.
 *
 * Both routes start from the same instruction (send a drawing), so without an
 * explicit fork a reader will land on the wrong one. The test is whether the
 * part has a name: a motor housing, an end plate and a cold plate are on the
 * other page with their own processes and inspection regime; a drawing with no
 * standard name belongs here.
 *
 * Rendered as a bordered aside rather than a line of small print, and worded
 * as a genuine either/or — a fork that says "both are fine" is not a fork.
 */
export const caSplit: ResourceLink = {
  eyebrow: "Are you on the right page?",
  title: "Looking for an EV powertrain housing?",
  body: "Motor housings, inverter housings, battery trays, end plates and cold plates have their own page, with the casting, welding and leak-testing detail that belongs to them. This page is for aluminium parts that have a drawing but no standard name — the ones you cannot look up in anyone's catalogue.",
  href: "/products/ev-components",
  linkLabel: "Go to EV powertrain housings",
};

/**
 * The four inputs.
 *
 * The reverse-engineering card is the one that earns its place. A buyer who
 * holds a competitor's component and no drawing will usually assume they are
 * not eligible to enquire; saying explicitly that a sample is enough, and
 * naming what we need alongside it, converts a group of visitors who would
 * otherwise have left.
 *
 * Each card's requirement list is the substance — "we accept drawings" without
 * saying which drawings is not an instruction anyone can act on.
 */
export const caInputs: InputType[] = [
  {
    index: "01",
    name: "2D drawing",
    nameEn: "2D Drawing",
    requirements: [
      "Orthographic views (three-view or fully dimensioned)",
      "Critical dimensions identified",
      "Tolerance requirements, and any datum callouts",
    ],
  },
  {
    index: "02",
    name: "3D data",
    nameEn: "3D Data",
    requirements: [
      "A neutral format — STEP or IGES",
      "Critical-to-function faces flagged",
      "Material and finish intent, if already decided",
    ],
  },
  {
    index: "03",
    name: "Physical sample",
    nameEn: "Physical Sample",
    requirements: [
      "The sample itself, shipped to us",
      "The service conditions it has to survive",
      "Any known fitment constraints on the mating assembly",
    ],
  },
  {
    index: "04",
    name: "Reference part only",
    nameEn: "Reverse Engineering",
    requirements: [
      "The part you want matched",
      "Which features are critical and which are free",
      "Tolerances required on the functional interfaces",
    ],
    highlight: true,
  },
];

export const caInputNote =
  "The fourth route exists because most projects do not start with a finished drawing. If you have a part in hand and no model of it, that is a normal starting point — we reverse-engineer it, and the DFM conversation happens against the measured geometry rather than against nothing.";

/**
 * 🔴 The boundary section, and the reason for the page's publishing gate.
 *
 * The "included" rows are the capability as our own material states it. The
 * "assess" rows describe the shape of the limit without quoting a number,
 * because no envelope figure has been confirmed. The "excluded" column is
 * empty — see the module header. Nothing here is inferred or invented: an
 * invented exclusion is a commercial commitment, and an invented inclusion is
 * worse.
 */
export const boundaryTerms: {
  excludedConfirmed: boolean;
  rows: BoundaryRow[];
} = {
  excludedConfirmed: false,
  rows: [
    {
      state: "included",
      label: "Aluminium and magnesium components",
      confirmed: true,
      note: "Formed and machined in both materials; the route is chosen per part.",
    },
    {
      state: "included",
      label: "Cast and forged routes",
      confirmed: true,
      note: "Low-pressure casting, high-pressure die casting, gravity casting and forging.",
    },
    {
      state: "included",
      label: "CNC finishing on critical interfaces",
      confirmed: true,
      note: "Machined after forming, so location faces are cut from a common datum.",
    },
    {
      state: "included",
      label: "Heat treatment and surface finishing",
      confirmed: true,
      note: "Applied in house, including coating and painting.",
    },
    {
      state: "included",
      label: "Process routes combined per project",
      confirmed: true,
      note: "More than one route on a single part where the geometry calls for it.",
    },
    {
      state: "assess",
      label: "Parts beyond the confirmed size and weight envelope",
      confirmed: false,
      note: "The envelope is being confirmed. Until it is published we assess each part individually rather than screen it against a number.",
    },
    {
      state: "assess",
      label: "Geometrically complex or thin-walled parts",
      confirmed: false,
      note: "Assessed against the drawing. Casting simulation is run before tooling is committed, which is where complexity limits get tested.",
    },
    {
      state: "assess",
      label: "Volume beyond current line capacity",
      confirmed: false,
      note: "Annual capacity is being confirmed. Volume is discussed as part of the project assessment.",
    },
  ],
};

/**
 * Required while the excluded column is empty. Not a generic disclaimer — it
 * says which column is missing and why, so the gap is legible as a gap.
 */
export const boundaryExcludedNote =
  "The categories we decline are still being confirmed and are shown here as an empty slot rather than filled in. We will publish them — an explicit list of what we do not take on is more useful to both sides than a claim to make anything.";

/** The resulting sentence, in the engineering register rather than sales. */
export const boundaryClosingLine =
  "Process selection follows size, load, weight, cost and program volume. These routes are not a process overview — they are manufacturing capability that can be combined project by project.";

/**
 * Six capability cards.
 *
 * The material card is worded as capability rather than as a product claim:
 * our source copy names aluminium and magnesium in the context of wheel
 * programs, so nothing here asserts a specific grade on a specific part.
 * Whether those materials are used on non-wheel work is one of the open
 * questions the boundary section flags.
 */
export const caCapabilities: Capability[] = [
  {
    index: "01",
    title: "Materials",
    body: "Aluminium and magnesium forming capability, with the grade fixed at project level once the part, the load case and the volume are known.",
    evidence:
      "Source copy names these materials in wheel programmes only. Whether they are used on non-wheel work is an open question — stated as capability, not as a grade claim.",
  },
  {
    index: "02",
    title: "Forming routes",
    body: "Low-pressure casting, high-pressure die casting, gravity casting and forging — matched to the part rather than fixed by the line.",
    evidence:
      "Process list is from the source material. Confirm which routes run in-house vs subcontracted.",
  },
  {
    index: "03",
    title: "Precision machining",
    body: "CNC machining, with critical interfaces finished after forming so the faces that locate the assembly share a datum with the drawing.",
    evidence:
      "Standard practice statement. Confirm the achievable tolerance band before quoting one.",
  },
  {
    index: "04",
    title: "Heat treatment",
    body: "Heat treatment within the process flow, so mechanical properties are set before the part reaches finishing or inspection.",
    evidence:
      "Confirm which heat-treatment routes are in-house. Pending confirmation.",
  },
  {
    index: "05",
    title: "Surface finishing",
    body: "Surface treatment and coating, applied in controlled stages so appearance and corrosion performance repeat across a batch.",
    evidence:
      "Confirm the finishing processes offered and any salt-spray hours behind the corrosion claim. Pending confirmation.",
  },
  {
    index: "06",
    title: "Engineering up front",
    body: "3D design, finite element analysis, casting simulation, reverse engineering and tooling development — all completed before the tool is cut.",
    evidence:
      "Needs the real engineering workflow, same open question as the homepage cell 01.",
  },
];

/**
 * Two groups of typical parts, not a product catalogue.
 *
 * The source material names four examples, three of them in a single line of
 * copy. That is enough to illustrate where this capability lands, and not
 * enough to build a product grid from — so the page shows two groups with a
 * scenario description each. The third group one might expect (general
 * machined parts) is absent because there is nothing behind it; an empty group
 * would advertise the thinness rather than hide it.
 *
 * The closing boundary line is on the component, not here, so the grid cannot
 * render without it.
 */
export const caTypicalParts: PartGroup[] = [
  {
    slug: "drivetrain",
    name: "Drivetrain and power",
    nameEn: "Drivetrain & Power",
    difficulty:
      "Machined aluminium components that sit alongside a powertrain — covers, brackets and housings developed to a drawing rather than picked from a range.",
    parts: [
      { name: "End cover", nameEn: "End cover" },
      { name: "Bracket", nameEn: "Bracket" },
    ],
  },
  {
    slug: "chassis",
    name: "Chassis and body",
    nameEn: "Chassis & Body",
    difficulty:
      "Lightweight structural aluminium for chassis and body applications, where the part has to carry load and stay light at the same time.",
    parts: [
      { name: "Control arm", nameEn: "Control arm" },
      { name: "Steering knuckle", nameEn: "Steering knuckle" },
      { name: "Connecting component", nameEn: "Connecting component" },
      { name: "Lightweight structural part", nameEn: "Structural part" },
    ],
  },
];

export const caTypicalPartsBoundary =
  "These are examples of the work rather than a catalogue — the part you need is assessed from your drawing. Nothing here is a standard part we hold in stock.";

/**
 * The development flow — eight stages, in order.
 *
 * This is the page's main content and the one section that is complete: every
 * stage is documented in our own material. It stays at engineering level
 * (manufacturability, tooling, first article, pilot validation). The
 * commercial framing of the same journey — OEM / ODM / private label, who
 * carries tooling cost, minimum quantities — belongs to the custom
 * development page, and the closing cross-link points there rather than
 * restating it.
 *
 * The anchor `development-flow` is a fixed contract: the custom development
 * page links to it by name.
 */
export const caDevelopmentFlow: FlowStep[] = [
  {
    step: "01",
    title: "Input",
    body: "A drawing, 3D data or a physical sample. Reverse engineering is available when no drawing exists.",
  },
  {
    step: "02",
    title: "DFM assessment",
    body: "Manufacturability review, casting simulation and the process route — returned as an assessment before any tooling decision.",
  },
  {
    step: "03",
    title: "Tooling development",
    body: "Tool design and manufacture, cut to the geometry agreed at the DFM stage rather than to the first version of the drawing.",
  },
  {
    step: "04",
    title: "First article",
    body: "Trial parts produced, machined and measured — dimensions and performance checked against the drawing before anything is shipped.",
  },
  {
    step: "05",
    title: "Customer approval",
    body: "First article and test results are presented for sign-off. Nothing moves to batch production without that approval.",
  },
  {
    step: "06",
    title: "Pilot validation",
    body: "A small batch confirms the line repeats the approved part, with engineering changes closed out rather than carried forward.",
  },
  {
    step: "07",
    title: "Volume production",
    body: "Serial production against the approved specification, with the process held to the route validated at pilot.",
  },
  {
    step: "08",
    title: "Export delivery",
    body: "Documentation, freight and after-sales support, handled as part of the same order rather than handed off.",
  },
];

export const caDevelopmentNda =
  "We sign non-disclosure agreements. It is normally the first document exchanged, before drawings or samples change hands — send us the counterparty details and we will return it signed.";

export const caDevelopmentCopy = {
  eyebrow: "Process",
  heading: "From a drawing to a delivered part, in eight stages",
  lede: "Two of these stages exist to stop the project going wrong rather than to move it forward: the DFM assessment, where a part that cannot be held to tolerance is caught before a tool is cut, and the first-article approval, where the line proves it can repeat the approved part.",
};

/**
 * Cross-link to the commercial half of the same story.
 *
 * The destination anchor is fixed on that page. The engineering sequence stays
 * here in full and the commercial sequence stays there, precisely so the two
 * pages are not two versions of one narrative.
 */
export const caFlowCrossLink = {
  eyebrow: "Commercial view",
  title: "How the same project is contracted",
  body: "OEM, ODM and private label, who carries the tooling cost, minimum quantities and lead times — the commercial terms behind the same eight stages.",
  href: "/custom-development#cooperation-models",
  linkLabel: "See how we cooperate",
};

/**
 * Two FAQ entries, for the same reason as the EV page: the questions with no
 * confirmed answer are not authored at all. Material grades, size envelope
 * and tolerance all fall into that group, and the section closes with a notice
 * naming them. What remains is what we can answer today.
 */
export const caFaqs: FaqEntry[] = [
  {
    question: "I have a sample but no drawing. Can you still make it?",
    answer:
      "Yes. Reverse engineering is part of our engineering capability, and it is a common starting point — a sample on the bench, no model of it. We work from the measured geometry, and the DFM conversation happens against that rather than against an assumption about the original design.",
  },
  {
    question: "Do you sign an NDA?",
    answer:
      "Yes, and in most projects it is the first document exchanged. Drawings and samples normally only change hands after the agreement is signed, so tell us the counterparty details and we will return it.",
  },
  {
    question: "How is a sampling schedule assessed?",
    answer:
      "It is quoted per part rather than from a table. Tooling complexity, the forming route and whether the input is a finished drawing or a single reference part all move the schedule, so the timeline comes back with the assessment.",
  },
];

export const caFaqNotice =
  "Aluminium grades, the size and weight envelope and achievable tolerances are still being confirmed. They will be published as figures once engineering signs them off, rather than described in general terms in the meantime.";

export const caRoutes: RouteStep[] = [
  {
    step: "01",
    title: "Cooperation models in full",
    body: "For OEM, ODM and private-label routes, and the commercial terms behind a custom project.",
    href: "/custom-development",
    linkLabel: "See cooperation models",
  },
  {
    step: "02",
    title: "Plant processes and quality in full",
    body: "For the casting, machining, finishing and inspection stages as they stand on the floor.",
    href: "/capabilities",
    linkLabel: "See the plant",
  },
  {
    step: "03",
    title: "Send a drawing and start",
    body: "For putting the drawing, model or sample in front of engineering and getting an assessment back.",
    href: "/contact",
    linkLabel: "Send the drawing",
  },
];

/**
 * Closing block.
 *
 * Unlike the EV page, the site's standard dealer enquiry band fits here: the
 * visitor has a part to make, so sending it is an enquiry rather than a
 * premature request for price. The copy stays under the length ceiling and
 * carries the NDA position, which is the first thing a customer wants settled.
 */
export const caCta = {
  title: "One drawing is enough to start.",
  body: "NDAs available. A drawing, 3D data or a physical sample all begin the same development flow.",
} as const;
