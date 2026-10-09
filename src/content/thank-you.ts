/**
 * `/thank-you` copy — a short, quiet confirmation page.
 *
 * This page is NOT a marketing page. The visitor has just pressed submit and
 * is asking "did that work?" — product recommendations, promos or a second CTA
 * turn that question into doubt. It answers exactly two things: did it land,
 * and what happens next.
 *
 * It is the only page on the site with no CTA at all.
 */

export const thankYouConfirm = {
  eyebrow: "Inquiry received",
  title: "Your enquiry has been recorded",
  body: "Keep the reference number shown below for follow-up. It confirms that the enquiry record was created; email delivery is tracked separately.",
  /** Quiet text link back home — deliberately not a button. */
  backLabel: "Back to home",
  backHref: "/",
} as const;

export const thankYouUnverified = {
  eyebrow: "Submission status",
  title: "We cannot confirm an enquiry from this link",
  body: "This page does not contain a valid recent submission receipt. Return to the enquiry form if you still need to submit a project, or keep the reference shown immediately after a successful submission.",
  backLabel: "Go to the enquiry form",
  backHref: "/request-a-quote",
} as const;

/**
 * ⏳ Response window is NOT yet confirmed by Fenghuai.
 *
 * The reply commitment — how many working hours, and through which channel —
 * is an open item. Rather than invent "within 24 hours", the page renders an
 * explicit pending placeholder. Confirm the real figure before launch and
 * replace these strings; keep them in sync with the same promise on `/contact`.
 */
export const thankYouResponsePromise = {
  eyebrow: "What happens next",
  heading: "When you will hear from us",
  /** ⏳ Placeholder — the real response window is pending confirmation. */
  window: "⏳ Pending confirmation",
  windowNote:
    "The reply window for this site has not been finalised, so we are not quoting a number here. A real response time will replace this line before launch.",
  /** ✅ Independent of the placeholder — always true. */
  nextStepNote:
    "Any missing technical or commercial detail can be clarified against the same enquiry reference.",
} as const;

export const thankYouUrgentContact = {
  eyebrow: "If it is urgent",
  heading: "Reaching us directly",
  /** ⏳ Contact channels are still PLACEHOLDER in src/content/site.ts. */
  pendingNote:
    "Direct contact details for this site are still being confirmed, so we are not publishing a number or inbox here yet. Once they are live they will appear on the contact page.",
  contactHref: "/contact",
  contactLabel: "Contact page",
} as const;
