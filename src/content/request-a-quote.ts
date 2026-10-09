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
  eyebrow: "Project enquiry",
  heading: "Tell us what you need to source or develop",
  lede: "Choose a product line and send what you already know. A model number, drawing status or application description is enough to start the review. You do not need every specification ready; missing technical details are confirmed before quotation or production approval.",
} as const;

export const quoteContextBarCopy = {
  eyebrow: "You came from",
  carryOver: "These specifications are already carried into the form below.",
  notThis: "Not this model?",
  changeModel: "Change model",
  changeHref: "/products",
} as const;

export const quoteFormHeading = {
  title: "Project enquiry",
  body: "Choose a product line and send what you already know. Missing technical details can be confirmed before quotation or production approval.",
} as const;

/**
 * Form copy for this page. Response-window language is deliberately absent —
 * the reply commitment is unresolved, so nothing is promised here.
 */
export const requestQuoteFormCopy = {
  requiredNote: "Required field",
  optional: "optional",
  submit: "Submit project enquiry",
  submitting: "Sending…",
  successTitle: "Your enquiry has been recorded",
  successBody:
    "Keep the reference number below for follow-up. It confirms that the enquiry record was created.",
  resetLabel: "Send another request",
  errorSummaryTitle: "Check these fields",
  errorSummaryBody: "Your request has not been sent. Fix the items below:",
  networkErrorTitle: "Your request was not sent",
  networkErrorBody:
    "We could not reach our server — this is usually a connection problem on your side, not a problem with your details. Nothing was submitted, and everything you typed is still in the form. Please try again.",
  pendingDeliveryNote:
    "The enquiry record was saved, but the notification email is still pending. Do not submit the same project again.",
} as const;

export const quoteDataNotice = {
  eyebrow: "How we handle your details",
  body: "We use the information you send here to prepare and discuss your quotation. It is stored on our own systems and shared only with the people who need it to answer you. We do not add you to a mailing list.",
  footLabel: "Have another question? Go to the contact page",
  footHref: "/contact",
} as const;
