import type { InquiryContext, InquiryInput } from "./types";

/**
 * Server-side validation.
 *
 * The form validates too, but a route handler must never trust the client.
 * Kept dependency-free (no zod) to match the project's current setup.
 */

// Deliberately permissive — catches typos, does not police RFC 5322.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: 120,
  email: 200,
  whatsapp: 40,
  company: 160,
  country: 80,
  line: 60,
  model: 60,
  finish: 120,
  quantity: 40,
  message: 5000,
} as const;

export type ValidationResult =
  | { ok: true; input: InquiryInput; context: InquiryContext }
  | { ok: false; fieldErrors: Record<string, string> };

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function validate(body: unknown): ValidationResult {
  const fieldErrors: Record<string, string> = {};

  if (typeof body !== "object" || body === null) {
    return { ok: false, fieldErrors: { _form: "Invalid payload." } };
  }
  const raw = body as Record<string, unknown>;

  // ── Required ────────────────────────────────────────────────────────────
  const name = str(raw.name, LIMITS.name);
  if (!name) fieldErrors.name = "Please tell us your name.";

  const email = str(raw.email, LIMITS.email);
  if (!email) fieldErrors.email = "Please provide an email address.";
  else if (!EMAIL.test(email)) fieldErrors.email = "That email address looks incomplete.";

  const message = str(raw.message, LIMITS.message);
  if (!message) fieldErrors.message = "Please describe what you need.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  // ── Optional ────────────────────────────────────────────────────────────
  const input: InquiryInput = {
    name,
    email,
    message,
    whatsapp: str(raw.whatsapp, LIMITS.whatsapp) || undefined,
    company: str(raw.company, LIMITS.company) || undefined,
    country: str(raw.country, LIMITS.country) || undefined,
    line: str(raw.line, LIMITS.line) || undefined,
    model: str(raw.model, LIMITS.model) || undefined,
    finish: str(raw.finish, LIMITS.finish) || undefined,
    quantity: str(raw.quantity, LIMITS.quantity) || undefined,
  };

  // ── Auto-captured context (never trusted from the user, only echoed) ─────
  const ctxRaw = (typeof raw.context === "object" && raw.context !== null
    ? raw.context
    : {}) as Record<string, unknown>;

  const context: InquiryContext = {
    pageUrl: str(ctxRaw.pageUrl, 500) || undefined,
    pageType: str(ctxRaw.pageType, 60) || undefined,
    model: str(ctxRaw.model, 60) || undefined,
    productionCode: str(ctxRaw.productionCode, 60) || undefined,
    series: str(ctxRaw.series, 120) || undefined,
    from: str(ctxRaw.from, 60) || undefined,
    selectedSpec:
      typeof ctxRaw.selectedSpec === "object" && ctxRaw.selectedSpec !== null
        ? Object.fromEntries(
            Object.entries(ctxRaw.selectedSpec as Record<string, unknown>)
              .slice(0, 12)
              .map(([k, v]) => [str(k, 40), str(v, 120)]),
          )
        : undefined,
  };

  return { ok: true, input, context };
}
