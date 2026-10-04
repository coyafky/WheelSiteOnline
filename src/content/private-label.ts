import type { AnswerBlock, FlowStep, PositioningPoint, ResourceLink } from "./types";

/**
 * Private label programme copy (`/dealers/private-label`).
 *
 * PLACEHOLDER: exclusivity scope, minimum volumes for custom centre-cap
 * tooling, tooling ownership and confidentiality terms are commercial and
 * legal commitments. Each is flagged in the copy below and must be replaced
 * with Fenghuai's actual terms before launch.
 */

export const privateLabelHero = {
  eyebrow: "Private label programme",
  heading: "Your Brand on the Wheel, Never Ours",
  lede: "We manufacture to your specification and apply your identity to every surface the customer sees — the centre cap, the engraving, the packaging and the paperwork. Nothing identifies Fenghuai.",
  supporting:
    "Private label is for wheel brands, distributors and dealer groups who want their own line rather than a resold one. Design, tooling and branding are managed so the product is yours.",
} as const;

export const privateLabelOffer: AnswerBlock = {
  eyebrow: "The offer",
  heading: "You own the brand and the design; we own the production",
  body: "A private-label line is not a rebadged catalogue wheel. The fitment, construction, face profile and finish are specified to your range, and the identity applied to the product is yours from the first unit.",
  points: [
    "Your brand applied to centre caps, engraving and packaging",
    "No Fenghuai marking on the product or the documentation",
    "Design and finish specified to your range, not taken from ours",
    "Confidentiality agreement available before design discussion",
    "PLACEHOLDER: minimum volume for custom-cap tooling must be confirmed",
  ],
};

export const privateLabelBranding: FlowStep[] = [
  {
    step: "01",
    title: "Centre caps",
    body: "Custom cap tooling carrying your mark. The cap is the part a customer reads every time they walk up to the car, so it is tooled rather than stickered.",
  },
  {
    step: "02",
    title: "Engraving",
    body: "Your mark engraved into the face or the reverse of the spoke during machining, and finished with the rest of the wheel rather than applied afterwards.",
  },
  {
    step: "03",
    title: "Packaging",
    body: "Branded retail inserts, boxes and protective packaging. Unbranded neutral packing is equally available if the brand only lives on the wheel.",
  },
  {
    step: "04",
    title: "Documentation",
    body: "Specification sheets, inspection records and marketing collateral issued under your brand — the paperwork a customer files with the car.",
  },
];

export const privateLabelConfidentiality = {
  eyebrow: "Confidentiality and exclusivity",
  heading: "What stays yours",
  body: "Private label only works if the dealer trusts that their design is not going to appear on someone else's website. We put the boundaries in writing rather than leaving them implied.",
  points: [
    "Mutual confidentiality agreement signed before drawings are shared",
    "Your designs and fitment data are not used or shown for other customers",
    "PLACEHOLDER: design exclusivity must be defined in writing — scope, duration and territory",
    "PLACEHOLDER: tooling ownership and its transfer terms must be specified",
  ],
} as const;

export const privateLabelExclusivity: PositioningPoint[] = [
  {
    title: "Design exclusivity",
    body: "PLACEHOLDER — exclusivity can be offered on specified designs for an agreed territory and period. The exact scope, duration and any minimum volume attached to it must be confirmed with Fenghuai and put in the contract.",
  },
  {
    title: "Territory",
    body: "PLACEHOLDER — territory definitions (exclusive country, region, or channel-only) are commercially negotiated and are not default terms. Confirm before publishing.",
  },
  {
    title: "Tooling",
    body: "PLACEHOLDER — state who owns custom centre-cap tooling, whether it is charged separately, and whether it transfers if the relationship ends. This is a real commercial question and must not be left ambiguous.",
  },
];

export const privateLabelFlow: FlowStep[] = [
  {
    step: "01",
    title: "Brief and NDA",
    body: "You describe the line — target vehicles, price positioning, finish direction. A confidentiality agreement is signed before any design detail changes hands.",
  },
  {
    step: "02",
    title: "Design and specification",
    body: "Face profile, construction and finish are specified to your range. Centre-cap artwork and engraving placement are confirmed.",
  },
  {
    step: "03",
    title: "Tooling and samples",
    body: "Cap tooling is cut and a sample set is produced in the specified finish. You approve the sample, not a render.",
  },
  {
    step: "04",
    title: "Trial production",
    body: "A first run proves the brand application, the packing and the documentation at production volume before it scales.",
  },
  {
    step: "05",
    title: "Ongoing production",
    body: "Repeat orders run against the approved specification, with finish and branding held to the sample that was signed off.",
  },
];

export const privateLabelAudience = {
  eyebrow: "Who it is for",
  heading: "Businesses that need the product to be theirs",
  body: "Private label is not the right programme for everyone. It suits businesses whose value sits in their brand, their channel or their fitment knowledge rather than in owning a factory.",
} as const;

export const privateLabelAudiencePoints: PositioningPoint[] = [
  {
    title: "Wheel brands",
    body: "You own a name and a look and want it manufactured properly rather than resold from someone else's range.",
  },
  {
    title: "Distributors",
    body: "You serve a market and want a line whose pricing and specification you control end to end, without a competing brand on the same shelf.",
  },
  {
    title: "Dealer groups",
    body: "You have the customers and the fitment knowledge, and want a house line instead of a catalogue you cannot influence.",
  },
  {
    title: "Not a fit for one-off orders",
    body: "Private label carries tooling and branding setup. It is built for a line you intend to run, not a single set of wheels.",
  },
];

export const privateLabelPathways: ResourceLink[] = [
  {
    eyebrow: "Programme",
    title: "Dealer supply",
    body: "If you would rather sell our specification under a supply relationship, start here.",
    href: "/dealers",
    linkLabel: "Dealer supply programme",
  },
  {
    eyebrow: "Process",
    title: "Manufacturing stages",
    body: "The six stages your order will run through, from engineering review to packaging.",
    href: "/capabilities",
    linkLabel: "Walk the process",
  },
  {
    eyebrow: "Company",
    title: "About Fenghuai",
    body: "Who is behind the brand you are putting your name on.",
    href: "/about",
    linkLabel: "Read about us",
  },
];
