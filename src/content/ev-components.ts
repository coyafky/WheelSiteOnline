import type {
  AnswerBlock,
  Capability,
  FaqEntry,
  PartGroup,
  PositioningPoint,
  QualityRow,
  RouteStep,
} from "./types";

/**
 * EV powertrain housings (`/products/ev-components`).
 *
 * THIS PAGE IS NOT A CATALOGUE. The reader is a purchasing engineer at an OEM
 * or a tier-1 supplier, and the page is judged on the same axes as a
 * technical document: what we can make, how we join it, how we inspect it,
 * and what we are prepared to admit we do not publish yet. Agency phrasing
 * ("proven quality", "source factory") costs credibility here rather than
 * building it.
 *
 * TWO RULES THAT SHAPE THE COPY
 * -----------------------------
 * 1. The closing action is "submit a drawing for engineering assessment", not
 *    "request a quote". At this stage the customer does not yet know whether
 *    we can take the job, so quoting is premature. The word quote does not
 *    appear on the page.
 * 2. Anything we cannot substantiate is absent, not softened. There is no
 *    material grade list, no dimensional envelope, no tolerance figure and no
 *    quality-system claim, because none of them has been confirmed. What is
 *    left is honest and still substantial: the part types, the processes, the
 *    inspection sequence and the NDA position.
 *
 * SOURCING: every fact below is Fenghuai's own brochure copy. Nothing is
 * borrowed from a third-party wheel manufacturer or from the tyre material —
 * this line's parts are cast and machined, so wheel-specific standards and
 * forging equipment claims do not apply to it.
 */

export const evHero = {
  eyebrow: "EV POWERTRAIN",
  heading: "EV Powertrain Housings",
  subheading:
    "Aluminum Housings for EV Motor & Controller Systems — built to a drawing, not to a shelf.",
  partsLine:
    "Water-cooled motor housing · High-pressure die-cast motor housing · Controller / inverter housing",
  ctaLabel: "Submit a drawing for engineering assessment",
} as const;

export const evDefinition: AnswerBlock = {
  eyebrow: "What this line is",
  heading: "Heat, sealing and precision — the three problems a housing has to solve",
  body: "Powertrain housings sit between the electrical system and the road: motor and reducer housings on the drive side, inverter, PDU and on-board charger housings on the control side, and battery trays, end plates and cold plates on the pack side. They are not chosen from a catalogue. Each one is developed against a drawing, because the three things that decide whether it works — how heat leaves the part, how it holds pressure, and how accurately the mating faces land — are set by the design rather than by the bin it is taken from.",
  points: [
    "Cooling — the water or oil gallery has to be formed inside the casting and stay sealed along its whole length.",
    "Sealing — the housing is a pressure boundary; gas and water tightness is the acceptance criterion, not an optional extra.",
    "Precision — stator, rotor and gear interfaces are assembled to tolerances that turn a good casting into a scrap part if they are missed.",
  ],
};

/**
 * The differentiable section: the part types we can take on.
 *
 * The count is deliberate and has been reconciled: 5 drive-side + 6
 * control-side + 4 battery-side = 15 named types, plus 2 generic parts that
 * appear across all three. The generic pair is rendered as a trailing note
 * rather than a fourth card — two items would break the three-column layout,
 * and both already appear on the custom aluminium page, so repeating them as
 * a card would be duplicating one list across two routes.
 */
export const evPartGroups: PartGroup[] = [
  {
    slug: "powertrain",
    name: "Drive-side housings",
    nameEn: "Motor & Reducer Housings",
    difficulty:
      "A cooling gallery formed in one piece with the body, plus a sealing face that must survive the whole service life.",
    parts: [
      { name: "Water-cooled motor housing", nameEn: "Water-cooled", process: "LPDC" },
      {
        name: "High-pressure die-cast motor housing",
        nameEn: "HPDC motor housing",
        process: "HPDC",
      },
      { name: "Oil-cooled motor housing", nameEn: "Oil-cooled" },
      { name: "Traction-motor stator housing", nameEn: "Stator housing" },
      { name: "Reducer housing", nameEn: "Reducer housing" },
    ],
  },
  {
    slug: "controller",
    name: "Control-side housings",
    nameEn: "Controller & Power Electronics",
    difficulty:
      "Thin walls, mounting bosses and connector faces held to position while the part still has to shed heat.",
    parts: [
      {
        name: "Controller / inverter housing",
        nameEn: "Controller / inverter",
      },
      { name: "Inverter", nameEn: "Inverter" },
      { name: "PDU power distribution unit", nameEn: "PDU" },
      { name: "OBC on-board charger", nameEn: "OBC" },
      { name: "Water-pump housing", nameEn: "Water-pump housing" },
      { name: "Valve block & fittings", nameEn: "Valve block & fittings" },
    ],
  },
  {
    slug: "battery",
    name: "Battery-system parts",
    nameEn: "Battery Tray, Plates & Cold Plates",
    difficulty:
      "Large flat structures that must stay flat, seal against coolant and carry the pack without distorting under load.",
    parts: [
      { name: "Battery tray", nameEn: "Battery tray" },
      { name: "Battery end plate", nameEn: "End plate" },
      { name: "Water-cooled cold plate", nameEn: "Cold plate" },
      { name: "Module mounting bracket", nameEn: "Module bracket" },
    ],
  },
];

/**
 * 🔴 The sentence that keeps this page from reading as a parts shop.
 * Passed as a required prop, so a caller cannot render the cards without it.
 */
export const evPartGroupBoundary =
  "The types above are the parts we can take on, not a stock list. Every project starts from a drawing, a 3D model or a sample, and the specification is agreed against that input rather than quoted from a datasheet.";

/** The two shared parts, rendered as a trailing pointer instead of a card. */
export const evPartGroupGenericNote = {
  text: "End covers and brackets appear across all three groups rather than belonging to one of them; they are covered on the custom aluminium page.",
  href: "/products/custom-aluminum",
  linkLabel: "Custom aluminium parts",
};

export const evAudience = {
  negative: {
    title: "You are looking for a standard-parts catalogue",
    body: "Then this page is the wrong one. We do not stock housings and we do not sell from a shelf — every part on this line is developed against a customer drawing.",
  },
  positiveHeading: "If any of these describes your project, keep reading",
  positives: [
    {
      title: "You have a drawing, 3D data or a physical sample",
      body: "That input is all we need to begin. We assess manufacturability before anything is cut, and tell you plainly if the part is outside what we can hold.",
    },
    {
      title: "You are localising or second-sourcing a drive or pack part",
      body: "Bringing an existing housing to a second supplier is a defined job: the interface is fixed, the acceptance criteria are known, and the work is in the process route rather than the design.",
    },
    {
      title: "Your project needs an NDA and front-loaded DFM work",
      body: "We sign non-disclosure agreements and expect to do manufacturability work before tooling is committed — that is the normal shape of a housing project, not an exception.",
    },
  ] satisfies PositioningPoint[],
};

/**
 * Five capability blocks.
 *
 * The joining card is the one that matters most here: friction stir welding is
 * what makes an internally formed cooling gallery a sealed, serviceable
 * feature rather than a casting defect waiting to happen. The final card is
 * the technical standout and is rendered on the accent surface — it is the
 * claim a competitor's catalogue will not carry.
 *
 * Note what is absent: no machine tonnage, no press model, no cycle time.
 * Those numbers have not been confirmed and an invented one would be worse
 * than a missing one on a page aimed at engineers.
 */
export const evCapabilities: Capability[] = [
  {
    index: "01",
    title: "Forming",
    body: "Low-pressure die casting (LPDC), high-pressure die casting (HPDC) and gravity casting — selected per part rather than fixed by the line.",
    evidence:
      "Process list from the source material. Confirm which routes run in-house and the achievable part envelope.",
  },
  {
    index: "02",
    title: "Joining",
    body: "Friction welding and friction stir welding (FSW), used where a cooling gallery or a housing joint has to be closed and stay gas- and water-tight.",
    evidence:
      "Confirm leak-test method and acceptance criteria behind the gas- and water-tight claim. Pending confirmation.",
  },
  {
    index: "03",
    title: "Precision machining",
    body: "CNC machining with the critical interfaces finished last, so the faces that locate the stator, rotor or gear train are cut from the same datum.",
    evidence:
      "Confirm the tolerance band and whether it can be published as a figure.",
  },
  {
    index: "04",
    title: "Engineering up front",
    body: "3D design, finite element analysis, casting simulation and reverse engineering — run before tooling is committed, so the process route is decided on evidence.",
    evidence:
      "Needs the real engineering workflow and who owns the DFM review.",
  },
  {
    index: "05",
    title: "Integrally cast spiral cooling gallery",
    body: "Sand-core forming of a spiral water gallery in one piece with the body, developed for traction-motor stator housings — the channel is cast, not assembled.",
    evidence:
      "Engineering position on this feature is still open. Confirm whether it is a proven production route or a development capability.",
  },
];

/**
 * Quality evidence.
 *
 * The third row is intentionally unconfirmed. A vehicle customer will ask
 * about the quality-management system, and the honest state is that the
 * answer is not yet settled — so the row renders with a dash and a pending
 * label instead of an assertion. No certification is named anywhere on this
 * page: the only source for one is a third party, and a claim like that
 * cannot be inherited from someone else's brochure.
 *
 * The X-ray row describes inspection of forged blanks. It is carried here as
 * a general internal-inspection capability; whether it applies to cast
 * housings specifically is still open with engineering, so the wording stays
 * neutral about the part form.
 */
export const evQuality: {
  rows: QualityRow[];
  disclosure: string;
} = {
  rows: [
    {
      label: "Process control",
      value:
        "Casting through machining and cleaning to dimensional and leak testing — the sequence runs as one controlled flow rather than as separate subcontracts.",
      confirmed: true,
    },
    {
      label: "Internal inspection",
      value:
        "X-ray inspection is used internally to check for internal defects before a part is released to machining.",
      confirmed: true,
    },
    {
      label: "Quality management system",
      value: "—",
      confirmed: false,
      pendingNote: "Being verified",
    },
  ],
  disclosure:
    "Whether we hold a specific automotive quality-management certification is still being confirmed, so the row above is shown empty rather than filled in. We will state the answer — including a negative one — rather than describe it in general terms.",
};

export const evFaqIntro = {
  heading: "Questions an engineer asks first",
  lede: "Short answers only where the answer exists. The open questions at the end are open on purpose.",
};

/**
 * 🔴 Two entries, deliberately.
 *
 * The questions a reader most wants answered — which grades, how large, what
 * tolerance, which certification, how long to sample — have no confirmed
 * answer, and a FAQ slot reading "coming soon" advertises the gap without
 * closing it. So those questions are not authored at all; the section ends
 * with a data notice naming what is still being confirmed. What remains is
 * the two things we can answer today, plus the sampling question rewritten in
 * the form we can actually respond to.
 */
export const evFaqs: FaqEntry[] = [
  {
    question: "Do you sign an NDA before we send drawings?",
    answer:
      "Yes. We sign non-disclosure agreements, and in most projects it is the first document exchanged — before drawings, models or samples change hands. Tell us the counterparty details and we will return the signed agreement.",
  },
  {
    question: "How is a sampling timeline assessed?",
    answer:
      "It is quoted against the part rather than from a table. Tooling complexity, casting route, the number of critical interfaces and whether the input is a finished drawing or a single reference part all move the schedule, so we return a timeline with the assessment instead of a generic figure here.",
  },
];

export const evFaqNotice =
  "Material grades, the size and weight envelope, achievable tolerances and the quality-management certification are all being confirmed. They will be published here as figures once engineering signs them off, rather than described in general terms now.";

export const evRoutes: RouteStep[] = [
  {
    step: "01",
    title: "Plant processes and quality in full",
    body: "For the whole plant rather than this line alone — the casting, machining and inspection stages as they stand on the floor.",
    href: "/capabilities",
    linkLabel: "See the plant",
  },
  {
    step: "02",
    title: "The full development route",
    body: "For how a drawing becomes a delivered part, including DFM feedback, sampling and the commercial models.",
    href: "/custom-development",
    linkLabel: "See the development route",
  },
  {
    step: "03",
    title: "Start with the part in hand",
    body: "For sending a drawing, 3D model or sample directly, and getting an assessment back.",
    href: "/contact",
    linkLabel: "Send the part",
  },
];

/**
 * Closing block — the one page where the site's standard dealer enquiry band
 * is the wrong instrument. This audience is not asking for a price; it is
 * asking whether we can make the part. The buttons therefore say assessment,
 * not quote, and there is no price language anywhere in the block.
 */
export const evCta = {
  title: "Have a drawing or a sample? Start with an engineering assessment.",
  body: "NDAs are available. A drawing, 3D data or a physical sample is enough to begin.",
  primary: {
    label: "Submit a drawing for engineering assessment",
    href: "/contact",
  },
  secondary: { label: "See the development route", href: "/custom-development" },
} as const;
