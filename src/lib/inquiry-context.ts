import type { InquiryContext } from "./inquiry/types";

/**
 * URL → `InquiryContext`. The single conversion point shared by
 * `/request-a-quote` (page shell + context bar) and the model pages, so the
 * parsing rules cannot drift between callers.
 *
 * Every value is frozen as text — this is a snapshot, not a reference. Nothing
 * here is re-resolved against the catalogue.
 */

/** Next.js hands `searchParams` in as a plain object of string | string[]. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** The spec query params, mapped onto `selectedSpec` snapshot keys. */
const SPEC_PARAMS: Record<string, string> = {
  size: "size",
  pcd: "pcd",
  et: "offset",
  cb: "centerBore",
  finish: "finish",
};

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

export function buildInquiryContext(
  params: RawSearchParams,
  pageUrl: string,
): InquiryContext {
  const selectedSpec: Record<string, string> = {};
  for (const [param, key] of Object.entries(SPEC_PARAMS)) {
    const value = first(params[param]);
    if (value) selectedSpec[key] = value;
  }

  return {
    pageUrl,
    pageType: first(params.pageType),
    model: first(params.model),
    productionCode: first(params.code) ?? first(params.productionCode),
    series: first(params.series),
    from: first(params.from),
    // Project-assessment context. `product_line` classifies the line, while
    // `application` and `input_type` record which group and which input route
    // the visitor started from — see the custom-aluminum Page SPEC §8.
    productLine: first(params.product_line),
    application: first(params.application),
    inputType: first(params.input_type),
    intent: first(params.intent),
    selectedSpec: Object.keys(selectedSpec).length > 0 ? selectedSpec : undefined,
  };
}

/** True when the context carries anything worth showing back to the visitor. */
export function hasContext(context: InquiryContext): boolean {
  return Boolean(
    context.model ||
      (context.selectedSpec && Object.keys(context.selectedSpec).length > 0) ||
      context.productLine ||
      context.application ||
      context.inputType ||
      context.intent,
  );
}
