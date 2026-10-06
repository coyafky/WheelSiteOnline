/**
 * Wheel detail page copy (`/products/wheels/[model]`) — WD01–WD06.
 *
 * Verbatim from `PAGE-SPECS/wheel-detail.md` §4 (screen copy) and §11 (SEO).
 * The page and its components read from here; no component hard-codes marketing
 * text (spec §13.9). Interpolated values are `{model}`-style placeholders in the
 * spec, so they are exposed as small builders rather than template strings with
 * an ad-hoc replace step.
 *
 * ── What is deliberately absent ──────────────────────────────────────────────
 * No vehicle-fitment claims, no `universal fitment` / `guaranteed fit` /
 * `direct replacement` wording, no size ranges, no stock, price, lead time,
 * load rating or certification language (spec §9, §14).
 */

/** Section id prefix — keeps heading/control ids unique and greppable. */
export const WHEEL_DETAIL_ID = "wheel-detail";

/** Anchor target of the WD01 "Select a configuration" button. */
export const WHEEL_DETAIL_CONFIGURATION_ANCHOR = "recorded-configurations";

export const wheelDetailBreadcrumb = {
  rootLabel: "Products",
  rootHref: "/products",
  sectionLabel: "Wheels",
  sectionHref: "/products/wheels",
} as const;

/* ============================================================================
 * WD01 — product identity
 * ========================================================================== */

export const wheelDetailIdentity = {
  eyebrow: "PUBLISHED WHEEL MODEL",
  /** Confirmed process. */
  processRecorded: (processLabel: string) => `Recorded process: ${processLabel}`,
  /** No approved process in the record — an honest state, never a guess (§14). */
  processMissing: "Manufacturing process is not specified in the source record.",
  intro: (model: string) =>
    `Model ${model} is shown with the approved production configurations currently available for enquiry. Select one recorded configuration below so the team can review supply, application and destination-market requirements.`,
  boundary:
    "The image identifies the wheel design. Final finish appearance, vehicle fitment, brake clearance and load requirements are confirmed for the selected project.",
  selectAnchor: "Select a configuration",
} as const;

/* ============================================================================
 * WD02 — recorded production configurations
 * ========================================================================== */

export const wheelDetailConfigurations = {
  heading: "Recorded production configurations",
  lead: "Each row is one recorded combination. Size, PCD, offset, centre bore and finish must stay together under the same production code.",
  disclosure:
    "A recorded configuration is available for enquiry; it is not a vehicle-fitment or stock guarantee.",
  columnSelect: "Select",
  columnProductionCode: "Production code",
  columnSize: "Size",
  columnPcd: "PCD",
  columnOffset: "Offset",
  columnCentreBore: "Centre bore",
  columnFinish: "Finish",
  /** Accessible name of the per-row radio — the visible label is the code cell. */
  selectRow: (productionCode: string) => `Select recorded configuration ${productionCode}`,
  /** Shown on the desktop table only. */
  tableCaption: (model: string) => `Recorded production configurations for wheel model ${model}`,
  /** >12 approved variants get a filter entry (spec §6); never a network search. */
  filterLabel: "Filter these recorded configurations",
  filterPlaceholder: "Size, PCD, offset, bore or production code",
  filterCount: (shown: number, total: number) =>
    `Showing ${shown} of ${total} recorded configurations.`,
  filterEmpty: "No recorded configuration matches that filter.",
  filterClear: "Clear filter",
} as const;

/* ============================================================================
 * WD03 — enquiry
 * ========================================================================== */

export const wheelDetailEnquiry = {
  heading: "Request this wheel configuration",
  /**
   * Also the pre-CTA reminder required by §7: an enquiry without a selection is
   * still accepted (`variant_pending`), but choosing one is faster.
   */
  noSelection:
    "Select one recorded configuration to attach its production specifications to the enquiry.",
  /** Small label above the echo, so the customer can confirm what is attached. */
  selectedLabel: "Selected configuration",
  cta: "Request this configuration",
  /**
   * No-JS fallback (§12). The embedded form submits through JavaScript, so the
   * same enquiry page — carrying this model, and this configuration when one is
   * selected — stays reachable as a plain link. It is a fallback, not a second
   * call to action, and it never asks the customer to re-explain the model (§2.1).
   */
  fallbackNote: "Form not working, or JavaScript turned off?",
  fallbackLabel: "Open the full enquiry page with this model",
  /** `{model} / {productionCode} / {size} / {pcd} / ET{offset} / CB {centerBore} mm / {finish}` */
  selectedSummary: (parts: {
    model: string;
    productionCode: string;
    size: string;
    pcd: string;
    offset: string;
    centreBore: string;
    finish: string;
  }) =>
    `${parts.model} / ${parts.productionCode} / ${parts.size} / ${parts.pcd} / ET${parts.offset} / CB ${parts.centreBore} mm / ${parts.finish}`,
} as const;

/**
 * Enquiry context keys the `/api/inquiries` contract recognises (spec §7).
 *
 * Held beside the copy so the query the embedded form is submitted on, the no-JS
 * fallback link and the page cannot drift apart. Both are *classifiers* carried
 * from the page — never a fact the visitor chooses.
 */
export const wheelDetailEnquiryContext = {
  productLine: "wheels",
  intent: "wheel_model_quote",
} as const;

/**
 * WD03/WD04 finish placeholder.
 *
 * A finish is recorded on every approved variant, but `PublicWheelVariant.finish`
 * is the **raw source value (Chinese)** and `src/lib/wheels/types.ts` says the
 * public layer does not print it: the human-approved English public name does not
 * exist yet (spec §3.3 fact 4, §8; DEC-035). Printing the original would publish
 * an unapproved label, and inventing an English one would publish a guess — so
 * the cell states the real situation instead of either.
 *
 * ⚠️ Named so the gate is obvious: once a mapping is approved this constant is
 * deleted, not translated here.
 */
export const finishNamePending = "Recorded (name pending approval)";

/* ============================================================================
 * WD04 — finishes
 * ========================================================================== */

export const wheelDetailFinishes = {
  heading: (model: string) => `Recorded finish options for ${model}`,
  body: "The finishes below come from approved production records for this model. Colour, gloss level and machining appearance should be confirmed against an approved sample before production.",
} as const;

/* ============================================================================
 * WD05 — application boundary
 * ========================================================================== */

export const wheelDetailFitment = {
  heading: "Confirm the application before production",
  body: "Matching diameter and PCD does not confirm vehicle fitment. Share the vehicle or application, model year or generation, brake package, suspension changes, tyre plan, load requirement and target market for review.",
  checklist: [
    "Vehicle or application and model year",
    "Brake package and suspension changes",
    "Tyre size and intended use",
    "Required quantity and destination market",
  ],
} as const;

/* ============================================================================
 * WD06 — related models
 * ========================================================================== */

export const wheelDetailRelated = {
  heading: "Compare other published wheel models",
} as const;

/* ============================================================================
 * §11 — SEO
 * ========================================================================== */

export const wheelDetailSeo = {
  title: (model: string) => `${model} Wheel Specifications & Configurations | Fenghuai`,
  description: (model: string) =>
    `View approved production configurations for Fenghuai wheel model ${model}, including size, PCD, offset, centre bore and finish, then send the selected configuration for enquiry.`,
  /** §11: the approved primary image, front view, real model — nothing else. */
  imageAlt: (model: string) => `Fenghuai wheel model ${model}, front view`,
} as const;

/* ============================================================================
 * WD03 — embedded unified enquiry form (`<InquiryForm>` copy prop, §7)
 * ========================================================================== */

/**
 * Copy for the shared `<InquiryForm>`. Only `submit` and the success message are
 * specified by §4; the remaining strings mirror the wording already used by
 * `/contact` and `/request-a-quote` so one form never speaks in two voices.
 *
 * ⚠️ §4's success line carries `{inquiryId}`. The shared component renders the
 * server-assigned reference in its own reference block rather than inside the
 * body text, so the body points at that block instead of duplicating the id.
 */
export const wheelDetailFormCopy = {
  requiredNote: "Required field",
  optional: "optional",
  submit: "Request this configuration",
  submitting: "Sending…",
  successTitle: "Your enquiry has been received.",
  successBody: "Please keep the reference below for follow-up.",
  resetLabel: "Send another request",
  errorSummaryTitle: "Check these fields",
  errorSummaryBody: "Your request has not been sent. Fix the items below:",
  networkErrorTitle: "Your request was not sent",
  networkErrorBody:
    "We could not reach our server — this is usually a connection problem on your side, not a problem with your details. Nothing was submitted, and everything you typed is still in the form. Please try again.",
  pendingDeliveryNote:
    "Your request is safely recorded. Our confirmation email could not be sent just now, so a member of the sales team will follow up manually instead — no action needed from you.",
} as const;
