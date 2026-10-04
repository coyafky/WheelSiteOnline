import type { InquiryRecord } from "./types";

/**
 * Outbound mail.
 *
 * V1 logs to the server console instead of calling Resend so the flow is
 * fully exercisable with zero credentials. The `send()` contract is the seam:
 * dropping in Resend later replaces this file only.
 *
 * ⚠️ This function is called AFTER persistence. If it throws, the inquiry is
 * already safe — callers must record the failure, never roll back the record.
 */

const FROM = process.env.INQUIRY_FROM ?? "inquiry@fenghuai.com";
const TO = process.env.INQUIRY_TO ?? "sales@fenghuai.com";

export type MailOutcome = { delivered: boolean; error?: string };

function renderBody(rec: InquiryRecord): string {
  const { input, context, snapshot } = rec;
  return [
    `Inquiry ${rec.id}`,
    `Received: ${rec.createdAt}`,
    "",
    "── Contact ──",
    `Name:     ${input.name}`,
    `Email:    ${input.email}`,
    `WhatsApp: ${input.whatsapp ?? "—"}`,
    `Company:  ${input.company ?? "—"}`,
    `Country:  ${input.country ?? "—"}`,
    "",
    "── Interest ──",
    `Line:     ${input.line ?? "—"}`,
    `Model:    ${input.model ?? "—"}`,
    `Finish:   ${input.finish ?? "—"}`,
    `Quantity: ${input.quantity ?? "—"}`,
    "",
    "── Message ──",
    input.message,
    "",
    "── Snapshot (frozen at submit) ──",
    `Captured: ${snapshot.capturedAt}`,
    `Code:     ${snapshot.productionCode ?? "—"}`,
    `Source:   ${snapshot.sourcePage ?? "—"}`,
    snapshot.spec
      ? Object.entries(snapshot.spec)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      : "",
    "",
    "── Origin ──",
    `From page: ${context.pageUrl ?? "—"}`,
    `Page type: ${context.pageType ?? "—"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function send(rec: InquiryRecord): Promise<MailOutcome> {
  const apiKey = process.env.RESEND_API_KEY;

  // No key configured → mock mode. T03 (2026-10-04): the log must NOT print
  // the rendered body — it contains customer name, email and message. Keep it
  // to the inquiry id and the reason so the flow stays observable without
  // leaking personal data into server logs.
  if (!apiKey) {
    console.info(
      `[inquiry:mock-mail] mock mode (no RESEND_API_KEY): inquiry ${rec.id} not sent`,
    );
    return { delivered: false, error: "mock-mode" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        // Reply-To lets a salesperson hit Reply instead of opening a panel.
        reply_to: rec.input.email,
        subject: `Inquiry ${rec.id} — ${rec.input.company ?? rec.input.name}`,
        text: renderBody(rec),
      }),
    });

    if (!res.ok) {
      return { delivered: false, error: `resend ${res.status}` };
    }
    return { delivered: true };
  } catch (err) {
    return { delivered: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

/** True when no mail provider is configured — surfaced in the API response. */
export function isMockMode(): boolean {
  return !process.env.RESEND_API_KEY;
}
