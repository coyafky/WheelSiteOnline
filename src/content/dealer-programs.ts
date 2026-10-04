import type {
  AnswerBlock,
  DealerProgram,
  FlowStep,
  ResourceLink,
} from "./types";

/**
 * Dealer-facing programme offers.
 *
 * PLACEHOLDER: commercial terms (MOQs, lead times, exclusivity) must be
 * confirmed by Fenghuai before these go live.
 */
export const dealerPrograms: DealerProgram[] = [
  {
    slug: "dealer-supply",
    name: "Dealer Supply",
    tagline: "Sell forged wheels without holding stock first.",
    body: "Build your offer around custom fitment and let production start once the order is confirmed. You quote, we engineer and manufacture to that spec.",
    points: [
      "No mandatory stock commitment",
      "Fitment engineering support on every order",
      "Production visibility from forging through to dispatch",
      "Consolidated freight and export documentation",
    ],
    href: "/dealers",
  },
  {
    slug: "private-label",
    name: "Private Label",
    tagline: "Your brand, our production line.",
    body: "We manufacture to your specification and your branding — centre caps, engraving, packaging and documentation all carry your identity, never ours.",
    points: [
      "Custom centre cap tooling with your mark",
      "Signed confidentiality and design exclusivity on request",
      "Branded packaging and retail inserts",
      "No Fenghuai branding on product or paperwork",
    ],
    href: "/dealers/private-label",
  },
  {
    slug: "program-support",
    name: "Program Support",
    tagline: "Data, samples and launch material.",
    body: "Everything a distributor needs to open a forged wheel line: fitment data, finish samples, photography and technical documentation.",
    points: [
      "Fitment data packages for your target vehicles",
      "Finish sample sets before committing to an order",
      "Product photography and specification sheets",
      "Technical documentation for your sales team",
    ],
    href: "/dealers",
  },
];

/* ---------------------------------------------------------------------------
   Dealer hub copy (`/dealers`)
   ---------------------------------------------------------------------------
   PLACEHOLDER: MOQ, lead time, incoterms, warranty length and exclusivity
   terms referenced below are commitments. Each is flagged inline.
--------------------------------------------------------------------------- */

export const dealerHero = {
  eyebrow: "Dealer programs",
  heading: "Sell Custom Forged Wheels Without Stocking Them First",
  lede: "You take the order against a confirmed specification. We engineer, forge, machine, finish and ship it. No inventory sitting in your unit, no capital tied up in sizes that may not sell.",
  supporting:
    "Three programmes cover the different ways dealers and distributors go to market — supply, private label and launch support. Most partners start with one and layer on the others.",
} as const;

export const dealerModel: AnswerBlock = {
  eyebrow: "The dealer model",
  heading: "Quote first, manufacture second",
  body: "A stockist has to guess which fitments will sell and buy them ahead of demand. Under this model you quote a custom set to a real customer, confirm the specification with us, and production starts on the order rather than on a forecast.",
  points: [
    "No mandatory stock commitment to hold the account",
    "Fitment engineering support included on every order",
    "Production visibility from forging through to despatch",
    "Consolidated freight and export documentation handled",
  ],
};

export const dealerOnboarding: FlowStep[] = [
  {
    step: "01",
    title: "Enquiry",
    body: "Send the vehicles you sell into, the volumes you expect and the markets you ship to. A first enquiry does not need to be a forecast — a realistic range is enough.",
  },
  {
    step: "02",
    title: "Programme selection",
    body: "We agree which programme fits: dealer supply, private label, or programme support alongside an existing supply relationship.",
  },
  {
    step: "03",
    title: "Specification and samples",
    body: "Fitment data, construction, finish and branding are specified. Finish samples ship before a large run is committed.",
  },
  {
    step: "04",
    title: "Trial order",
    body: "A first order confirms the specification in production. Commercial terms are proven on a small volume before the programme scales.",
  },
  {
    step: "05",
    title: "Production and inspection",
    body: "The order runs through the six production stages, with inspection records and milestone reporting attached to it.",
  },
  {
    step: "06",
    title: "Freight and repeat",
    body: "Packing, documentation and freight booking are handled for the destination. Repeat orders follow the approved specification.",
  },
];

export const dealerShipping = {
  eyebrow: "Shipping and logistics",
  heading: "Packed for freight, documented for the border",
  body: "Wheels are heavy, awkward and expensive to replace. Packing is specified around international freight rather than domestic courier handling, and the paperwork is prepared for the destination market.",
  points: [
    "Foam-lined cartons built to survive stacked pallet freight",
    "Palletised consignments with reinforced corner protection",
    "Branded or unbranded packing inserts per programme",
    "Export documentation prepared against the destination market",
    "PLACEHOLDER: shipping incoterms (FOB / CIF / DDP) must be confirmed before publishing",
  ],
} as const;

export const dealerTraceability = {
  eyebrow: "Proof and traceability",
  heading: "Documentation you can hand to a customer",
  body: "A dealer's credibility is built on being able to answer a customer's question without phoning the factory. Every order carries the records that make that possible.",
  points: [
    "Written specification signed off before material is cut",
    "Inspection record — dimensional check, runout and balance",
    "Production milestone reporting against the order number",
    "PLACEHOLDER: name the specific test reports and certifications offered per market",
  ],
} as const;

export const dealerPathways: ResourceLink[] = [
  {
    eyebrow: "Programme",
    title: "Private label",
    body: "Manufacture under your own brand — centre caps, engraving, packaging and documentation.",
    href: "/dealers/private-label",
    linkLabel: "Explore private label",
  },
  {
    eyebrow: "Process",
    title: "Manufacturing stages",
    body: "What happens to an order between the approved drawing and the loading dock.",
    href: "/capabilities",
    linkLabel: "Walk the process",
  },
  {
    eyebrow: "Company",
    title: "About Fenghuai",
    body: "Who you are buying from, where the factory sits in the supply chain and what we are not.",
    href: "/about",
    linkLabel: "Read about us",
  },
];
