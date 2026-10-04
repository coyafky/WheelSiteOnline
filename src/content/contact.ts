import type { AnswerBlock, FlowStep } from "./types";

/**
 * Contact / quote request page copy (`/contact`).
 *
 * NOTE: contact details themselves live in `@/content/site` (`site.contact`)
 * and are still PLACEHOLDER — the email and phone number there must be
 * replaced with Fenghuai's real sales inbox and line before launch.
 */

export const contactHero = {
  eyebrow: "Request a quote",
  heading: "Tell Us What You Need to Quote",
  lede: "Send the requirement, the volumes and any drawings or samples. We come back with a buildable specification, a delivery position and pricing — not a brochure.",
  supporting:
    "The more of the fitment you can give us up front, the fewer rounds it takes. If you do not have all of it yet, send what you have.",
} as const;

export const contactFormCopy = {
  requiredNote: "Required field",
  optional: "optional",
  submit: "Send enquiry",
  submitting: "Sending…",
  successTitle: "Enquiry received",
  successBody:
    "Your enquiry has been logged and a confirmation is on its way to the email address you supplied. Keep the reference number below — quoting it gets you a faster answer.",
  resetLabel: "Start another enquiry",
  errorSummaryTitle: "Check these fields",
  errorSummaryBody: "Your enquiry has not been sent. Fix the items below:",
  networkErrorTitle: "Your enquiry was not sent",
  networkErrorBody:
    "We could not reach our server — this is usually a connection problem on your side, not a problem with your details. Nothing was submitted, and everything you typed is still in the form. Please try again, or email us directly at the address on this page.",
  pendingDeliveryNote:
    "Your enquiry is safely recorded. Our confirmation email could not be sent just now, so a member of the sales team will follow up manually instead — no action needed from you.",
} as const;

export const contactWhatHappens: AnswerBlock = {
  eyebrow: "What happens next",
  heading: "From your message to a written quotation",
  body: "An enquiry goes to the sales team, not a queue. The first reply is a conversation about fitment and volume, because that is what determines whether we can quote accurately.",
  points: [
    "A reply within one business day, from a person who can answer technical questions",
    "Fitment reviewed against brake, suspension and load-rating constraints",
    "A written specification and price returned for your approval",
    "Nothing is cut until you approve that specification",
  ],
};

export const contactSteps: FlowStep[] = [
  {
    step: "01",
    title: "You send the details",
    body: "Vehicles, approximate volume, finish direction and the market you are selling into. A rough brief is fine to start.",
  },
  {
    step: "02",
    title: "We ask the questions that matter",
    body: "Brake clearance, suspension changes, load rating and target price point — the variables that decide what is buildable.",
  },
  {
    step: "03",
    title: "You get a specification",
    body: "Construction, sizes, offset, finish and lead time in writing, with pricing against your volume.",
  },
  {
    step: "04",
    title: "Production starts on approval",
    body: "The drawing is signed off, the order is scheduled, and milestone reporting begins against your order number.",
  },
];

export const contactDetailsCopy = {
  eyebrow: "Contact details",
  heading: "Or reach us directly",
  body: "If your enquiry is urgent or you would rather talk it through, use the details below. Office hours are quoted in China Standard Time.",
} as const;

export const contactAside = {
  eyebrow: "Before you send",
  heading: "What makes a quote fast",
  points: [
    "Name the exact model and trim, not just the badge",
    "Mention any brake or suspension modification",
    "Say roughly how many sets you expect in the first year",
    "Tell us which market the wheels are going to",
    "Say whether the wheels carry your brand or ours",
  ],
} as const;

export const contactPathways = {
  eyebrow: "Not ready to quote?",
  heading: "Read first, then talk",
  links: [
    {
      eyebrow: "Insights",
      title: "Fitment guides",
      body: "How to measure fitment, understand offset, and the other groundwork that makes a quote accurate.",
      href: "/insights",
      linkLabel: "Open the guides",
    },
    {
      eyebrow: "Programme",
      title: "Dealer supply",
      body: "How the dealer model works if you are still deciding whether to open a forged wheel line.",
      href: "/dealers",
      linkLabel: "See the programme",
    },
  ],
} as const;
