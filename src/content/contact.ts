import type { AnswerBlock, FlowStep } from "./types";

/**
 * Contact / quote request page copy (`/contact`).
 *
 * NOTE: contact details themselves live in `@/content/site` (`site.contact`)
 * and are still PLACEHOLDER — the email and phone number there must be
 * replaced with Fenghuai's real sales inbox and line before launch.
 */

export const contactHero = {
  eyebrow: "Project enquiry",
  heading: "Tell Us What You Need to Source or Develop",
  lede: "Choose a product line and send the requirement, expected quantity and any drawings or samples you already have.",
  supporting:
    "You do not need every specification ready. Missing technical details can be confirmed before quotation or production approval.",
} as const;

export const contactFormCopy = {
  requiredNote: "Required field",
  optional: "optional",
  submit: "Submit project enquiry",
  submitting: "Sending…",
  successTitle: "Your enquiry has been recorded",
  successBody:
    "Keep the reference number below for follow-up. It confirms that the enquiry record was created.",
  resetLabel: "Start another enquiry",
  errorSummaryTitle: "Check these fields",
  errorSummaryBody: "Your enquiry has not been sent. Fix the items below:",
  networkErrorTitle: "Your enquiry was not sent",
  networkErrorBody:
    "We could not reach the enquiry service. Nothing was submitted, and everything you typed is still in the form. Please try again later.",
  pendingDeliveryNote:
    "The enquiry record was saved, but the notification email is still pending. Do not submit the same project again.",
} as const;

export const contactFormHeading = {
  title: "Project enquiry",
  body: "Choose a product line and send what you already know. Missing technical details can be confirmed before quotation or production approval.",
} as const;

export const contactWhatHappens: AnswerBlock = {
  eyebrow: "What happens next",
  heading: "From your message to a written quotation",
  body: "The enquiry record keeps the project details and reference together. Technical scope, quantity and the destination market can then be clarified before a quotation is approved.",
  points: [
    "The submitted details remain attached to one enquiry reference",
    "Missing fitment, interface or performance inputs can be identified",
    "Specifications and commercial terms require separate project confirmation",
    "Production approval is distinct from the initial enquiry",
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
    body: "The relevant fitment, interface, performance and commercial inputs depend on the selected product line.",
  },
  {
    step: "03",
    title: "The scope is confirmed",
    body: "Any specification, price or lead-time position is confirmed for the actual project rather than inferred from the first message.",
  },
  {
    step: "04",
    title: "Approval remains explicit",
    body: "An enquiry does not itself approve a drawing, order or production schedule.",
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
