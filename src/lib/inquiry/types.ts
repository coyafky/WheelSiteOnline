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

export type InquiryCustomerType = "business" | "individual";

export type InquiryProductLine =
  | "wheels"
  | "ev-components"
  | "custom-aluminum"
  | "safety-tires";

/** 一次询价中的一条轮毂清单明细。spec 只由服务端补全，客户端字段只是查询线索。 */
export type InquiryItem = {
  model: string;
  productionCode: string;
  quantity: number;
  spec?: Record<string, string>;
};

/** The visitor-facing form payload. */
export type InquiryInput = {
  customerType: InquiryCustomerType;
  productLine: InquiryProductLine;
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
  inputsAvailable?: string[];
  /** Optional legacy policy version retained for backwards-compatible payloads. */
  privacyVersion: string;
  message: string;
  /** 新版轮毂清单；缺省/空数组保持旧单产品载荷兼容。 */
  items?: InquiryItem[];
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
  /**
   * `product_line` from the originating URL, e.g. `custom-aluminum`.
   *
   * Distinct from `InquiryInput.line`, which the visitor picks in the form and
   * may leave empty. This one is captured from the link the page generated, so
   * a project assessment arrives already classified even if the visitor never
   * touches the line selector.
   *
   * Added 2026-10-06 for the custom-aluminum assessment page, whose Page SPEC
   * (§8) requires the enquiry to carry the application group and the input
   * type alongside the product line. All four fields are optional, so every
   * existing caller and stored record remains valid.
   */
  productLine?: string;
  /** Application group the visitor started from, e.g. `motor-reducer`. */
  application?: string;
  /** Input route the visitor started from, e.g. `2d-drawing`. */
  inputType?: string;
  /** What the enquiry is for, e.g. `project_assessment`. */
  intent?: string;
  /**
   * Wheel enquiries only: the visitor named a model (or a configuration) but the
   * server could not resolve it against the public collection, so no
   * specification was recorded.
   *
   * Set **by the server** after re-resolving `model + productionCode` — never
   * trusted from the client. PAGE-SPECS/wheel-detail.md §7 requires this to be
   * explicit rather than silently dropping the selection, because the lead is
   * real and someone has to follow up on which configuration was meant.
   *
   * Optional, so every existing caller and stored record stays valid.
   */
  variantPending?: boolean;
};

/** A frozen copy of whatever product data the inquiry referenced. */
export type InquirySnapshot = {
  capturedAt: string;
  model?: string;
  productionCode?: string;
  spec?: Record<string, string>;
  sourcePage?: string;
  items?: InquiryItem[];
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
