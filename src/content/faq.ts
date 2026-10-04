import type { FaqEntry } from "./types";

/**
 * Dealer-facing FAQ.
 *
 * PLACEHOLDER: answers must be confirmed against Fenghuai's real terms —
 * lead time, MOQ, warranty length and shipping incoterms are commitments.
 */
export const faqs: FaqEntry[] = [
  {
    question: "What is your minimum order quantity?",
    answer:
      "MOQ depends on the programme. Dealer supply orders can start small, while private-label runs require a tooling commitment for your centre cap mark. Contact us with your target volume and we will confirm the applicable minimum.",
  },
  {
    question: "How long does production take?",
    answer:
      "Production lead time is quoted in writing with your order, not as a standing figure — it runs from approval of the specification to despatch, and depends on the process route, the finish and the load on the line at the time. The number is confirmed at order stage, so nothing here commits us to a fixed window.",
  },
  {
    question: "Can you build to my exact fitment?",
    answer:
      "Yes. Offset, PCD, centre bore and brake clearance are built to the vehicle data you supply. We review the specification against clearance and load rating before cutting any material.",
  },
  {
    question: "Do you offer private label?",
    answer:
      "Yes. We manufacture to your branding — centre caps, engraving and packaging all carry your identity. Confidentiality agreements and design exclusivity are available on request.",
  },
  {
    question: "Are your wheels tested?",
    answer:
      "Every order goes through dimensional inspection, runout measurement and balance before dispatch, with an inspection record attached. Ask us for the test documentation relevant to your market.",
  },
  {
    question: "How are wheels shipped?",
    answer:
      "Orders ship in foam-lined cartons designed for international freight, with branded inserts available. We can quote FOB or arranged freight depending on your destination and preference.",
  },
];
