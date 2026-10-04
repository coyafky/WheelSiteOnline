/**
 * Inquiry domain contracts.
 *
 * Three hard rules from docs/plans/inquiry-system-architecture.md §6:
 *   1. Persist BEFORE sending email — a mail failure must never lose a lead.
 *   2. Store a SNAPSHOT, not a reference — product data changes over time and
 *      historical inquiries must not silently change with it.
 *   3. Context travels with the inquiry — the model page a visitor came from
 *      is part of the record.
 */

/** The visitor-facing form payload. */
export type InquiryInput = {
  name: string;
  email: string;
  /** Optional — but B2B export buyers expect it. */
  whatsapp?: string;
  company?: string;
  country?: string;
  /** Which of the four product lines the visitor is asking about. */
  line?: string;
  model?: string;
  finish?: string;
  quantity?: string;
  message: string;
};

/**
 * Context captured automatically from the originating page.
 * Never typed by the visitor.
 */
export type InquiryContext = {
  pageUrl?: string;
  pageType?: string;
  model?: string;
  /** The exact variant code the visitor selected, if any. */
  productionCode?: string;
  /** Selected spec values, frozen as text. */
  selectedSpec?: Record<string, string>;
  series?: string;
  from?: string;
};

/** A frozen copy of whatever product data the inquiry referenced. */
export type InquirySnapshot = {
  capturedAt: string;
  model?: string;
  productionCode?: string;
  spec?: Record<string, string>;
  sourcePage?: string;
};

export type InquiryStatus = "new" | "assigned" | "replied" | "closed";

export type InquiryRecord = {
  id: string;
  createdAt: string;
  status: InquiryStatus;
  input: InquiryInput;
  context: InquiryContext;
  snapshot: InquirySnapshot;
  /** Sales owner, assigned after persistence. */
  assignedTo?: string;
  /** Delivery outcome — recorded separately from persistence. */
  emailDelivered: boolean;
  emailError?: string;
};

export type InquiryResult =
  | { ok: true; id: string; delivered: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
