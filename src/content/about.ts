import type {
  AnswerBlock,
  CompanyStat,
  CtaLink,
  FlowStep,
  PositioningPoint,
} from "./types";

/**
 * Company page copy (`/about`).
 *
 * PLACEHOLDER DISCIPLINE
 * ----------------------
 * Nothing on this page may state a figure as fact. Years in operation, floor
 * area, monthly capacity, headcount and export markets are all commercial
 * claims that must be supplied by Fenghuai before launch — every one of them
 * is flagged with `isPlaceholder: true` and rendered with a visible marker in
 * the UI. Replace the `value` strings (and flip the flag off) once the real
 * numbers are confirmed.
 */

export const aboutHero = {
  eyebrow: "Who we are",
  heading: "An Aluminum Component Manufacturer, Not a Trading Desk",
  lede: "Fenghuai manufactures across four product lines, with wheel components as the core line: forged wheels, EV powertrain housings, custom aluminum parts and self-healing safety tires.",
  supporting:
    "Our raw material is produced in-house and our integrated forging capability keeps the key decisions close to the line. We build to the specification agreed with you in writing.",
} as const;

/**
 * Capability / number strip.
 *
 * PLACEHOLDER: confirm every figure with production before launch.
 */
export const aboutStats: CompanyStat[] = [
  {
    index: "01",
    label: "Years in operation",
    value: "PLACEHOLDER — years",
    body: "Years in operation will be published once Fenghuai confirms the founding year.",
    isPlaceholder: true,
  },
  {
    index: "02",
    label: "Max forging force",
    value: "12,000 t",
    body: "Confirmed maximum forging force for the integrated forging line.",
    isPlaceholder: false,
  },
  {
    index: "03",
    label: "Monthly capacity",
    value: "PLACEHOLDER — tonnes / month",
    body: "Monthly output is reserved until Fenghuai confirms the production basis and current line load.",
    isPlaceholder: true,
  },
  {
    index: "04",
    label: "Export markets",
    value: "Global",
    body: "Our products serve customers across global markets; the exact market mix varies by programme.",
    isPlaceholder: false,
  },
];

export const aboutChain = {
  eyebrow: "Factory and supply chain",
  heading: "From self-produced raw material to your loading dock",
  body: "The advantage starts before the press closes: Fenghuai produces its own raw material and carries integrated forging capability in-house. That keeps the key material and forming decisions close to the production line, with machining, finishing and inspection following inside the same manufacturing system.",
  points: [
    "Raw material produced in-house, to the confirmed project specification",
    "Integrated forging capability for the core wheel-component line",
    "Machining, finishing and inspection kept close to the production line",
    "Production records kept against the order number",
  ],
} as const;

export const aboutChainStages: FlowStep[] = [
  {
    step: "01",
    title: "Material",
    body: "Raw material is produced in-house, so the starting material is part of the manufacturing conversation rather than an unknown upstream hand-off.",
  },
  {
    step: "02",
    title: "In-house production",
    body: "Integrated forging, CNC machining, finishing and inspection run inside the same manufacturing system, under the same production team.",
  },
  {
    step: "03",
    title: "Inspection",
    body: "Dimensional checks, runout measurement and balancing are recorded against the order, not logged informally.",
  },
  {
    step: "04",
    title: "Despatch",
    body: "Packing, documentation and freight booking are handled for you — including private-label packing where the brand must never appear.",
  },
];

export const aboutQuality: AnswerBlock = {
  eyebrow: "Quality and testing",
  heading: "The order is not finished until the paperwork is",
  body: "Every set leaves with an inspection record. What can be measured is measured; what cannot be measured here is disclosed honestly rather than claimed.",
  points: [
    "Dimensional verification against the approved drawing",
    "Radial and lateral runout measurement on every set",
    "Balance check before the wheel is packed",
    "PLACEHOLDER: laboratory and homologation test reports must be named before publishing",
    "Inspection record attached to the order and available on request",
  ],
};

export const aboutPositioning = {
  eyebrow: "Positioning",
  heading: "What we are — and what we are not",
  body: "Knowing which side of the line a supplier sits on matters more than any claim on a website. Here is where we stand, stated plainly.",
} as const;

export const aboutAreNot: PositioningPoint[] = [
  {
    title: "A trading company with a factory photo",
    body: "We are not an intermediary relaying your order to a third party. Production happens on our lines, and our engineers answer the questions you ask.",
  },
  {
    title: "A stockist selling from a shelf",
    body: "We are not a warehouse operation. There is no inventory to pick from — your set is manufactured to your specification after the order is confirmed.",
  },
  {
    title: "A consumer-facing brand",
    body: "We are not competing with you for the end customer. We manufacture; you sell. Private label exists precisely so our name never appears on your customer's car.",
  },
] as const;

export const aboutAre: PositioningPoint[] = [
  {
    title: "A factory-direct supplier",
    body: "One layer between you and the production line. Pricing, lead time and technical answers all come from the people making the wheel.",
  },
  {
    title: "A fitment partner",
    body: "We review offset, PCD, centre bore and brake clearance against your vehicle data before material is cut, and flag what will not fit.",
  },
  {
    title: "A private-label manufacturer",
    body: "Centre caps, engraving, packaging and documentation can all carry your mark — with confidentiality and design exclusivity available on request.",
  },
];

export const aboutDealerModel = {
  eyebrow: "Working with dealers",
  heading: "How a dealer relationship actually runs",
  body: "The daily reality of the programme is unglamorous: you quote, we specify, we confirm in writing, we build, we ship. These are the four points that decide whether it works.",
} as const;

export const aboutDealerSteps: FlowStep[] = [
  {
    step: "01",
    title: "You quote against a real specification",
    body: "Tell us the vehicle, the look and the finish. We return a buildable specification and pricing you can put in front of your customer.",
  },
  {
    step: "02",
    title: "Nothing is cut until the drawing is approved",
    body: "You get the specification in writing and sign it off. Changes after approval are quoted separately rather than absorbed silently.",
  },
  {
    step: "03",
    title: "You see the order move",
    body: "Forging, machining, finishing and inspection milestones are reported against your order — not left for you to chase.",
  },
  {
    step: "04",
    title: "Delivery and documentation together",
    body: "Wheels ship in freight-rated packing with the export documentation you need for the destination market.",
  },
];

/** Primary hero action pair. */
export const aboutHeroActions: { primary: CtaLink; secondary: CtaLink } = {
  primary: { label: "Request a quote", href: "/contact" },
  secondary: { label: "Meet the process", href: "/capabilities" },
};
