import { inquirySubmissionSchema, zodFieldErrors } from "./schema.ts";
import type { InquiryContext, InquiryInput } from "./types";

/**
 * Server-side validation.
 *
 * The form validates too, but a route handler must never trust the client.
 * 客户端与服务端共用同一份 Zod 字段契约；路由仍须独立执行，不能信任浏览器。
 */

export type ValidationResult =
  | { ok: true; input: InquiryInput; context: InquiryContext }
  | { ok: false; fieldErrors: Record<string, string> };

function contextString(value: unknown, max: number): string {
  return typeof value === "string" && value.trim().length <= max ? value.trim() : "";
}

export function validate(body: unknown, _expectedPrivacyVersion = ""): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, fieldErrors: { _form: "Invalid payload." } };
  }
  const raw = body as Record<string, unknown>;
  const parsed = inquirySubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error);
    return { ok: false, fieldErrors };
  }

  const data = parsed.data;
  const input: InquiryInput = {
    customerType: data.customerType,
    productLine: data.productLine,
    name: data.name,
    email: data.email,
    message: data.message,
    privacyVersion: data.privacyVersion,
    whatsapp: data.whatsapp || undefined,
    company: data.company || undefined,
    country: data.country,
    line: data.productLine,
    model: data.model || undefined,
    finish: data.finish || undefined,
    quantity: data.quantity || undefined,
    inputsAvailable: data.inputsAvailable.length > 0 ? data.inputsAvailable : undefined,
    items: data.items.length > 0 ? data.items : undefined,
  };

  // ── Auto-captured context (never trusted from the user, only echoed) ─────
  const ctxRaw = (typeof raw.context === "object" && raw.context !== null
    ? raw.context
    : {}) as Record<string, unknown>;

  const context: InquiryContext = {
    pageUrl: contextString(ctxRaw.pageUrl, 500) || undefined,
    pageType: contextString(ctxRaw.pageType, 60) || undefined,
    model: contextString(ctxRaw.model, 60) || undefined,
    productionCode: contextString(ctxRaw.productionCode, 60) || undefined,
    series: contextString(ctxRaw.series, 120) || undefined,
    from: contextString(ctxRaw.from, 60) || undefined,
    productLine: contextString(ctxRaw.productLine, 60) || undefined,
    application: contextString(ctxRaw.application, 80) || undefined,
    inputType: contextString(ctxRaw.inputType, 60) || undefined,
    intent: contextString(ctxRaw.intent, 60) || undefined,
    // Server-computed flag; the client can set it but it is overwritten by
    // `bindWheelEnquiry` before persistence. Only a real boolean passes.
    variantPending: ctxRaw.variantPending === true ? true : undefined,
    selectedSpec:
      typeof ctxRaw.selectedSpec === "object" && ctxRaw.selectedSpec !== null
        ? Object.fromEntries(
            Object.entries(ctxRaw.selectedSpec as Record<string, unknown>)
              .slice(0, 12)
              .map(([k, v]) => [contextString(k, 40), contextString(v, 120)])
              .filter(([k, v]) => k && v),
          )
        : undefined,
  };

  return { ok: true, input, context };
}
