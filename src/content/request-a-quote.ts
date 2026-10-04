/**
 * `/request-a-quote` copy — the "focused mode" of `/contact`.
 *
 * The two routes share one `<InquiryForm>` and one backend. This page exists
 * to give paid traffic and external links a clean, stable conversion URL that
 * carries the model context across from the page the visitor came from.
 *
 * Deliberately short: no contact block, no "what to send" checklist, no second
 * CTA. The form is the only exit.
 */

export const requestQuoteHero = {
  eyebrow: "Quote",
  heading: "Request a Quote",
  lede: "Fill in three fields, one minute. The specification you were looking at is carried into the form below — no need to retype it.",
} as const;

export const quoteContextBarCopy = {
  eyebrow: "You came from",
  carryOver: "These specifications are already carried into the form below.",
  notThis: "Not this model?",
  changeModel: "Change model",
  changeHref: "/products",
} as const;

export const quoteFormHeading = {
  title: "Wheel enquiry",
  body: "Everything we need to come back with a specification and a price rather than a follow-up question.",
} as const;

/**
 * Form copy for this page. Response-window language is deliberately absent —
 * the reply commitment is unresolved, so nothing is promised here.
 */
export const requestQuoteFormCopy = {
  requiredNote: "Required field",
  optional: "optional",
  submit: "Send quote request",
  submitting: "Sending…",
  successTitle: "Quote request received",
  successBody:
    "Your requirement is logged and a member of the sales team will pick it up. Keep the reference number below — quoting it gets you a faster answer.",
  resetLabel: "Send another request",
  errorSummaryTitle: "Check these fields",
  errorSummaryBody: "Your request has not been sent. Fix the items below:",
  networkErrorTitle: "Your request was not sent",
  networkErrorBody:
    "We could not reach our server — this is usually a connection problem on your side, not a problem with your details. Nothing was submitted, and everything you typed is still in the form. Please try again.",
  pendingDeliveryNote:
    "Your request is safely recorded. Our confirmation email could not be sent just now, so a member of the sales team will follow up manually instead — no action needed from you.",
} as const;

export const quoteDataNotice = {
  eyebrow: "How we handle your details",
  body: "We use the information you send here to prepare and discuss your quotation. It is stored on our own systems and shared only with the people who need it to answer you. We do not add you to a mailing list.",
  footLabel: "Have another question? Go to the contact page",
  footHref: "/contact",
} as const;
