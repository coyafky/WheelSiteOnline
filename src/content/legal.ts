import type { LegalDocument } from "./types";

/**
 * Support and legal documents.
 *
 * ===========================================================================
 * STATUS: industry-standard defaults, pending Fenghuai confirmation
 * ===========================================================================
 * These documents are written as complete, publishable policies rather than
 * skeletons. Every commercial figure used is a **regular B2B manufacturing
 * default** — chosen so the pages read consistently and no visitor is shown a
 * bare "PLACEHOLDER" string.
 *
 * ⚠️ The defaults are ASSUMPTIONS, not Fenghuai's confirmed policy. Each one
 * is marked inline with `[Assumed — confirm]` so it can be swept up before
 * launch. The items that carry real legal or financial exposure are:
 *
 *   - warranty duration (assumed 24 months from despatch)
 *   - defect reporting window (assumed 30 days from delivery)
 *   - return window for non-defect goods (assumed 30 days, restocking fee)
 *   - Incoterm (assumed FOB, with EXW / CIF / DAP available)
 *   - governing law and jurisdiction (assumed PRC law, Guangdong courts)
 *   - payment terms (assumed 30% deposit, balance before despatch)
 *
 * The UI renders a "pending legal review" note above every document, driven
 * by `draftNotice` below. It stays until Fenghuai's counsel signs off — flip
 * `draftNotice.show` to false only when that has happened.
 */

/** Banner shown at the top of every document page. */
export const draftNotice = {
  show: true,
  label: "Pending legal review",
  heading: "These terms are provisional",
  body: "The policies below are drafted to industry-standard defaults so the site is complete and consistent. Specific commercial figures — warranty period, return window, Incoterms and governing law — are marked as assumed and are awaiting confirmation by Fenghuai and review by legal counsel. Contact us for the terms that apply to your order.",
} as const;

export const legalPathways = {
  eyebrow: "Support",
  heading: "Other policies",
} as const;

/** Human-readable revision stamp shown on every document. */
const REVISION = "Draft — 2026-10-04";

export const legalDocuments: LegalDocument[] = [
  /* ---------------------------------------------------------------------- */
  {
    slug: "warranty",
    eyebrow: "Support",
    title: "Warranty Policy",
    lastUpdated: REVISION,
    summary:
      "What our manufacturing warranty covers, what it does not, and how a claim is raised by a dealer or distributor.",
    intro:
      "Fenghuai manufactures aluminum components to a specification agreed with the customer before production begins. This policy sets out the scope of the manufacturing warranty that applies to those components, the exclusions, and the process for making a claim. It applies to goods supplied to dealers, distributors and OEM programmes.",
    sections: [
      {
        heading: "1. What this warranty covers",
        body: [
          "Fenghuai warrants that goods supplied are free from defects in materials and workmanship, and that they conform to the specification approved in writing before production, for the warranty period stated below.",
          "Covered defects are those present at the point of despatch that arise from our manufacturing process — including material defects, machining defects, finishing defects that deviate from the approved specification, and dimensional non-conformance with the approved drawing.",
          "[Assumed — confirm] Warranty duration: 24 months from the date of despatch. Confirm the period, the point at which it begins (despatch date or invoice date), and whether it differs by market or by product line.",
        ],
      },
      {
        heading: "2. Warranty period",
        body: [
          "[Assumed — confirm] The warranty runs for 24 months from the despatch date shown on the commercial invoice.",
          "If the period differs between markets, the applicable period is the one stated on the order confirmation for that market.",
          "The warranty on a repaired or replaced item continues for the remainder of the original warranty period; it does not restart.",
        ],
      },
      {
        heading: "3. What is not covered",
        body: [
          "Damage caused by incorrect fitment, incorrect torque, use of incorrect hardware, or installation on a vehicle outside the approved application.",
          "Damage from impact, kerbing, potholes, accident, off-road use beyond the rating of the product, motorsport use, or any form of abuse.",
          "Corrosion, staining or finish degradation caused by road salt, harsh chemicals, abrasive cleaning, or prolonged exposure without maintenance.",
          "Any modification after despatch, including refinishing, re-drilling, machining, or the removal or alteration of markings.",
          "Normal wear and tear, and consumable items such as valves, centre caps, bolts and decorative trim.",
          "Goods that have been resold outside the territory, or distributed by a party not authorised by Fenghuai.",
        ],
      },
      {
        heading: "4. Cosmetic and dimensional variation",
        body: [
          "Manufacturing tolerances are stated on the approved drawing. Variation within those tolerances is not a defect.",
          "Colour, texture and gloss vary between production batches and between finishing processes. Slight variation against a sample or a previous batch is inherent to the process and is not a defect.",
          "Photographic and screen representations of finishes are indicative, not a colour reference.",
        ],
      },
      {
        heading: "5. How to make a claim",
        body: [
          "[Assumed — confirm] Notify Fenghuai in writing within 30 days of the defect becoming apparent, and in any event before the end of the warranty period.",
          "Provide the order or invoice reference, the production code or part number, the quantity affected, a description of the defect, and photographs showing the defect and the surrounding area.",
          "Do not return goods before receiving a return authorisation. Goods returned without one cannot be traced to a claim and may be refused.",
          "Where requested, retain the affected goods for inspection. Disposing of them before inspection may prevent the claim from being assessed.",
        ],
      },
      {
        heading: "6. What we will do",
        body: [
          "Once a claim is confirmed as a covered defect, Fenghuai will repair the goods, replace them, or credit the value of the affected goods — our choice, having regard to what is reasonable in the circumstances.",
          "Replacement goods are supplied to the original specification. Where a specification has been superseded, the nearest current equivalent is supplied.",
          "This warranty covers the goods themselves. It does not extend to removal, refitting, freight, downtime, loss of use, or any indirect or consequential loss, except where the law does not permit that exclusion.",
        ],
      },
      {
        heading: "7. Statutory rights",
        body: [
          "This warranty is in addition to, and does not replace, any rights the customer has under applicable law that cannot be excluded by contract.",
          "Where a mandatory consumer-protection or product-liability regime applies in the destination market, that regime takes precedence over any conflicting term in this policy.",
        ],
      },
    ],
    governingNote:
      "[Assumed — confirm] These terms are governed by the law of the People's Republic of China, with the courts of the manufacturing location having jurisdiction. Confirm the governing law, the jurisdiction, and whether arbitration is preferred over litigation for cross-border disputes.",
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: "returns",
    eyebrow: "Support",
    title: "Return & Refund Policy",
    lastUpdated: REVISION,
    summary:
      "How returns work for custom-manufactured goods, what can be returned, and who bears the freight.",
    intro:
      "Most Fenghuai goods are manufactured to order against a customer-approved specification. That shapes what can be returned: goods made to a specification cannot be resold to another customer, so returns outside defect or error are handled differently from stock goods. This policy sets out both routes.",
    sections: [
      {
        heading: "1. Custom-manufactured goods",
        body: [
          "Goods manufactured to a customer specification — including a specific size, bolt pattern, offset, centre bore, finish or branding — are made for that customer and cannot be returned for reasons other than defect or our error.",
          "This does not affect the manufacturing warranty. A defective custom-made item is repaired, replaced or credited under the Warranty Policy.",
        ],
      },
      {
        heading: "2. Cancellation before production",
        body: [
          "An order may be cancelled without charge until the specification is approved and released to production.",
          "Once production has begun, cancellation is accepted only against reimbursement of the costs incurred to that point — material allocated, tooling committed, and work in progress.",
        ],
      },
      {
        heading: "3. Returning goods that are defective or incorrect",
        body: [
          "If goods are defective on arrival, or do not match the approved specification, notify us in writing and we will arrange repair, replacement or credit.",
          "[Assumed — confirm] Notify us within 30 days of delivery so the issue can be verified against the production record.",
          "Where the defect or error is ours, we bear the freight for the return and for the replacement.",
        ],
      },
      {
        heading: "4. Returns for non-defect reasons",
        body: [
          "[Assumed — confirm] Stock, non-customised items may be returned within 30 days of delivery, subject to a restocking fee. Confirm the window and the fee percentage.",
          "Returns outside that window, or of goods not in resalable condition, are accepted only at our discretion.",
          "Goods must be returned in their original packaging, unused, uninstalled, and with all markings intact.",
        ],
      },
      {
        heading: "5. Condition requirements",
        body: [
          "Returned goods must be uninstalled and unused. Any item that shows evidence of fitting — mounting marks, torque marks on hardware, tyre contact, or damage from installation — cannot be accepted.",
          "Goods must be complete: wheels returned without their original centre caps, valves or hardware are not complete.",
          "Goods must be packed so they cannot be damaged in transit. Damage caused by inadequate return packaging is the sender's responsibility.",
        ],
      },
      {
        heading: "6. Refunds and credits",
        body: [
          "Approved returns are settled as a credit against the original order or, where the order has closed, as a credit on account for use against future orders.",
          "[Assumed — confirm] A refund to the original payment method is available where no further orders are expected. Confirm the settlement route and the processing period.",
          "Any restocking fee, freight charge or inspection cost is deducted from the credit or refund, and is itemised on the credit note.",
        ],
      },
      {
        heading: "7. Who bears the freight",
        body: [
          "For defect or our error: Fenghuai bears the freight both ways.",
          "For a non-defect return of stock goods: the customer bears the return freight.",
          "Return goods to the address given on the return authorisation. Goods sent elsewhere cannot be matched to a claim.",
        ],
      },
    ],
    governingNote:
      "[Assumed — confirm] Governing law and jurisdiction must be specified, together with any mandatory consumer-protection provisions in the destination market that override a business-to-business returns policy.",
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: "shipping",
    eyebrow: "Support",
    title: "Shipping & Packaging",
    lastUpdated: REVISION,
    summary:
      "How orders are packed and shipped, which Incoterms apply, where risk transfers, and what to do about damage in transit.",
    intro:
      "Fenghuai ships consolidated orders to dealers, distributors and OEM programmes. This page sets out how goods are packed, the trade terms available, when risk passes to the buyer, and the procedure if a shipment arrives damaged.",
    sections: [
      {
        heading: "1. Packaging",
        body: [
          "Goods are packed for export: individual protective sleeves or bags, separation between faces to prevent contact damage, corner and edge protection, boxed in double-wall cartons and, where the order warrants it, palletised and shrink-wrapped.",
          "Finished surfaces are protected against abrasion in transit. Cartons are labelled with the part number, finish code and quantity so the contents can be checked without unpacking.",
          "Packaging specification can be agreed per programme where a customer has a specific requirement, including branded cartons for private-label orders.",
        ],
      },
      {
        heading: "2. Incoterms",
        body: [
          "[Assumed — confirm] The default trade term is FOB. EXW, CIF and DAP are available on request; the Incoterm for an order is stated on its quotation and order confirmation.",
          "Incoterms are applied according to the edition in force at the date of the order.",
          "The term agreed governs who arranges and pays for carriage, insurance and clearance — confirm the split before the order is placed.",
        ],
      },
      {
        heading: "3. Where risk transfers",
        body: [
          "Risk transfers at the point defined by the Incoterm on the order confirmation — for FOB, when the goods are loaded on board the vessel at the named port of shipment.",
          "Once risk has transferred, loss of or damage to the goods in transit is the buyer's concern, and any claim is made against the carrier or the cargo insurer.",
          "Title passes on the payment terms agreed for the order, which may be later than the transfer of risk.",
        ],
      },
      {
        heading: "4. Freight and lead time",
        body: [
          "Lead time runs from approval of the specification and receipt of any deposit, not from the date the enquiry was sent.",
          "[Assumed — confirm] Transit time is quoted per destination at the time of order. Confirm the standard production window and whether it varies by product line or order size.",
          "Lead times are estimates given in good faith. Where a delay is caused by us we will say so and give a revised date; we are not liable for delays outside our reasonable control, including carrier, port, customs or force majeure events.",
        ],
      },
      {
        heading: "5. Documentation",
        body: [
          "Each shipment is accompanied by a commercial invoice, a packing list, and any certificate of conformity, material certificate or inspection report agreed for the order.",
          "Export documentation — including certificate of origin and any marking or labelling required by the destination market — is prepared to the requirement stated on the order.",
          "Document requirements must be confirmed before production. Adding them afterwards may not be possible for a shipment already packed.",
        ],
      },
      {
        heading: "6. Damage in transit",
        body: [
          "Check cartons on arrival before signing for them. If cartons are crushed, torn, opened or wet, note the damage on the carrier's delivery document and photograph the packaging before unpacking.",
          "[Assumed — confirm] Notify the carrier in writing within the carrier's claim window and notify Fenghuai at the same time. Confirm the notification period for freight claims.",
          "Keep the goods and the packaging until the claim is settled — the carrier will usually want to inspect them.",
          "Where the loss occurred before risk transferred, we will pursue the claim and arrange replacement; after transfer, the claim belongs to the buyer or their insurer, and we will supply the documentation needed to support it.",
        ],
      },
      {
        heading: "7. Split shipments and part orders",
        body: [
          "Orders may be shipped in more than one consignment where production completes in stages, or where a carrier or container constraint requires it. Each consignment is documented separately.",
          "Part shipment does not relieve the buyer of the obligation to accept and pay for each consignment on its terms.",
          "Where a customer requests held stock or scheduled release against a frame order, the release schedule and storage terms are agreed in writing in advance.",
        ],
      },
    ],
    governingNote:
      "[Assumed — confirm] The governing law and jurisdiction for freight and delivery disputes must be specified, and the risk-transfer wording must be aligned with the Incoterm selected. This clause should be reviewed by legal counsel.",
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: "terms",
    eyebrow: "Legal",
    title: "Terms of Service",
    lastUpdated: REVISION,
    summary:
      "The terms on which Fenghuai quotes, manufactures and supplies — orders, specification, price, delivery, IP and liability.",
    intro:
      "These terms govern the supply of goods by Fenghuai to trade customers — dealers, distributors and OEM programmes. They apply to every quotation and order unless a separate written agreement says otherwise. Placing an order confirms acceptance of these terms.",
    sections: [
      {
        heading: "1. Scope and who these terms apply to",
        body: [
          "These terms apply to business-to-business supply. They are not a consumer contract, and consumer-protection rules that cannot be excluded will override them where they apply.",
          "A signed supply agreement, frame agreement or private-label agreement takes precedence over these terms to the extent that it conflicts with them.",
          "These terms also govern use of this website. Website content is provided for information and does not form part of any contract unless it is expressly incorporated into an order.",
        ],
      },
      {
        heading: "2. Quotations and orders",
        body: [
          "A quotation is an invitation to order, not an offer. It is held open for the period stated on it, and is subject to the specification on which it was based.",
          "An order becomes binding when Fenghuai issues an order confirmation. Until then, an order may be declined, including where capacity, material or a specification issue prevents acceptance.",
          "Once confirmed, an order can be changed only by written agreement, and any change to specification, quantity or delivery may alter price and lead time.",
        ],
      },
      {
        heading: "3. Specifications and fitment",
        body: [
          "Goods are manufactured to the specification approved in writing before production. That approved drawing or specification sheet is the reference against which conformity is assessed.",
          "The customer is responsible for confirming that the specification suits the intended application. Where Fenghuai provides fitment guidance, it is given in good faith and should be verified before fitting.",
          "Goods installed outside the approved application, or with incorrect hardware or torque, are outside both the warranty and these terms.",
        ],
      },
      {
        heading: "4. Price and payment",
        body: [
          "Prices are as stated on the order confirmation, in the currency stated, and exclude tax, duty, freight and insurance unless the order says they are included.",
          "[Assumed — confirm] Standard payment terms: 30% deposit with the order, balance before despatch. Confirm the deposit percentage, the balance trigger, and any terms agreed for established accounts.",
          "Where the customer is overdue, Fenghuai may hold production or despatch, and may charge interest on the overdue amount, without losing any other remedy.",
        ],
      },
      {
        heading: "5. Lead time and delay",
        body: [
          "Lead time runs from approval of the specification and receipt of any deposit.",
          "Lead times are estimates. Where a delay is within Fenghuai's control we will notify a revised date; where it arises from a carrier, port, customs, material shortage or force majeure event, we will advise and keep the order open.",
          "Fenghuai is not liable for indirect or consequential loss arising from delay. Liability for delay, where it is accepted, is limited to the value of the delayed goods.",
        ],
      },
      {
        heading: "6. Delivery and risk",
        body: [
          "Delivery is on the Incoterm stated on the order confirmation, and risk transfers at the point that term defines.",
          "The customer must take delivery at the agreed point. Where delivery is delayed by the customer, storage and any re-delivery cost is chargeable, and risk transfers as if delivery had taken place.",
          "Shortages and visible damage must be noted on the delivery document at the time of receipt.",
        ],
      },
      {
        heading: "7. Intellectual property and private label",
        body: [
          "Fenghuai retains all intellectual property in its designs, tooling, processes, drawings and marks. Supplying goods does not transfer any of it.",
          "Where goods are made to a customer's design or under a customer's brand, the customer warrants that it owns or is licensed to use that design or mark, and indemnifies Fenghuai against any claim that it does not.",
          "Tooling paid for by a customer remains dedicated to that customer's programme. Ownership and any exclusive-use period are as agreed in writing for that programme.",
        ],
      },
      {
        heading: "8. Confidentiality",
        body: [
          "Each party keeps the other's commercial and technical information confidential, and uses it only to perform the order.",
          "This covers drawings, specifications, pricing, volumes and programme details, and continues after the order completes.",
          "Information that is public, already known, or required to be disclosed by law is outside this obligation.",
        ],
      },
      {
        heading: "9. Warranty and liability",
        body: [
          "The manufacturing warranty in the Warranty Policy applies to goods supplied. Nothing in these terms extends it.",
          "Except for death or personal injury caused by negligence, fraud, and any liability that cannot lawfully be excluded, Fenghuai's total liability is limited to the value of the goods concerned.",
          "Fenghuai is not liable for indirect or consequential loss, including loss of profit, loss of use, downtime, or third-party claims.",
        ],
      },
      {
        heading: "10. Termination",
        body: [
          "Either party may terminate an order if the other commits a material breach and does not remedy it after written notice.",
          "Either party may terminate immediately if the other becomes insolvent, enters administration or liquidation, or has a receiver appointed.",
          "On termination the customer pays for work completed and material allocated to that order.",
        ],
      },
      {
        heading: "11. Changes to these terms",
        body: [
          "Fenghuai may update these terms. The version that applies to an order is the one in force when the order confirmation was issued.",
          "The current version is always the one published here, and the revision date is shown at the top of the page.",
        ],
      },
    ],
    governingNote:
      "[Assumed — confirm] Governing law, jurisdiction and dispute resolution must be specified, including whether arbitration is preferred over litigation. This is a core contractual term and should be drafted by legal counsel.",
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: "privacy",
    eyebrow: "Legal",
    title: "Privacy Policy",
    lastUpdated: REVISION,
    summary:
      "What personal data Fenghuai collects from enquiries and orders, why, who it is shared with, and how to exercise your rights.",
    intro:
      "Fenghuai collects personal data to answer enquiries, quote, manufacture and deliver orders, and to meet legal and record-keeping obligations. This policy explains what is collected, why, who it is shared with, how long it is kept, and what rights you have. It covers this website and the business correspondence around an enquiry or order.",
    sections: [
      {
        heading: "1. Who is responsible for your data",
        body: [
          "[Assumed — confirm] Fenghuai is the data controller for the personal data described here. Confirm the registered entity name, its registered address, and the contact point for data-protection queries.",
          "Where Fenghuai acts as a processor on behalf of a customer — for example where a customer supplies its own end-customer data for a private-label programme — that is governed by the agreement with that customer.",
        ],
      },
      {
        heading: "2. What we collect",
        body: [
          "Enquiry information: the name, company, email address, phone number, country and message you send through our enquiry or quote forms, together with any product interest, vehicle or specification detail you include.",
          "Order information: contact and delivery details, billing details, and the correspondence and documents needed to process and ship an order.",
          "Technical information: IP address, browser and device type, and pages visited, collected through server logs and cookies.",
          "We do not ask for, and do not want, special-category data through this website.",
        ],
      },
      {
        heading: "3. Why we process it",
        body: [
          "To answer your enquiry and prepare a quotation — performed because you asked us to, or to take steps towards a contract at your request.",
          "To perform a contract: to manufacture, document and deliver an order, and to handle warranty and returns.",
          "To meet legal obligations: tax, accounting, customs and export records.",
          "For our legitimate interests: keeping a record of correspondence, preventing fraud, maintaining security, and improving the site.",
          "For marketing only where you have asked for it, or where the law allows it for existing business contacts, and always with a way to opt out.",
        ],
      },
      {
        heading: "4. Who we share it with",
        body: [
          "Service providers who act on our instructions: hosting, email, IT support, freight forwarders and carriers, and payment processors.",
          "Professional advisers and authorities where required: accountants, auditors, insurers, and customs, tax or regulatory bodies.",
          "A prospective buyer or successor in the event of a corporate transaction, under the same confidentiality obligations.",
          "We do not sell personal data, and we do not share it for a third party's own marketing.",
        ],
      },
      {
        heading: "5. International transfers",
        body: [
          "Fenghuai is based in China and processes data there. Enquiries and orders from other countries involve transferring data to China.",
          "[Assumed — confirm] Where a transfer out of the EEA, UK or another regulated jurisdiction is required, confirm the transfer mechanism relied on — standard contractual clauses or another lawful basis — and the safeguards applied.",
        ],
      },
      {
        heading: "6. How long we keep it",
        body: [
          "Enquiries that do not lead to an order: kept for as long as needed to answer and follow up, then deleted.",
          "Order and invoicing records: kept for the period required by tax, accounting and customs rules in the relevant jurisdiction. [Assumed — confirm] Confirm the retention period.",
          "Warranty records: kept for the warranty period plus the period needed to handle a claim made at the end of it.",
          "Marketing contact data: kept until you unsubscribe, or until it is stale.",
        ],
      },
      {
        heading: "7. Your rights",
        body: [
          "Subject to the law that applies to you, you may ask for a copy of your data, ask us to correct it, ask us to delete it, ask us to restrict or object to processing, and ask for data you provided in a portable form.",
          "Where processing is based on consent, you may withdraw it at any time; withdrawal does not affect processing already carried out.",
          "To exercise any of these, contact us using the details on our contact page. We may need to verify your identity before acting.",
          "You may also complain to the data-protection authority in your jurisdiction.",
        ],
      },
      {
        heading: "8. Cookies",
        body: [
          "This site uses cookies that are needed for it to work — including the one that remembers your language choice — and, where used, analytics cookies to understand how the site is used.",
          "Analytics cookies are set only where permitted. You can block or delete cookies in your browser; blocking essential cookies may affect how the site works for you.",
        ],
      },
      {
        heading: "9. Security",
        body: [
          "Access to personal data is restricted to the people who need it to do their job, and is protected by access controls and encryption in transit.",
          "We review our safeguards periodically. No system is completely secure, so we also keep procedures to detect and respond to a suspected breach.",
          "Where a breach is likely to risk your rights, we notify you and the relevant authority as the law requires.",
        ],
      },
      {
        heading: "10. Changes to this policy",
        body: [
          "We may update this policy. The current version is the one published here, with the revision date at the top of the page.",
          "Where a change is material, we will take reasonable steps to tell you before it takes effect.",
        ],
      },
    ],
    governingNote:
      "[Assumed — confirm] State the data-protection regime or regimes Fenghuai operates under and the supervisory authority for complaints. For a China-based manufacturer serving EU, UK and other regulated markets, more than one regime may apply and this clause should be confirmed by legal counsel.",
  },
];

/** Canonical href for a legal document slug. */
export function legalHref(slug: string): string {
  return `/support/${slug}`;
}

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments.find((doc) => doc.slug === slug);
}
