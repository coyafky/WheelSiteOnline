import { NextResponse } from "next/server";
import {
  assignOwner,
  isMockMode,
  markDelivered,
  save,
  send,
  validate,
} from "@/lib/inquiry";

/**
 * POST /api/inquiries — the only write path into the business record.
 *
 * Order is deliberate and matches docs/plans/inquiry-system-architecture.md §6:
 *   1. validate
 *   2. persist            ← the record is safe at this point
 *   3. send mail          ← failure here never loses the lead
 *   4. record outcome
 *
 * Requires a Node runtime. `output: "standalone"` in next.config.ts provides
 * it; a static export would disable this route entirely.
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request body." },
      { status: 400 },
    );
  }

  const parsed = validate(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: "Validation failed.", fieldErrors: parsed.fieldErrors },
      { status: 422 },
    );
  }

  // T03 (2026-10-04): in production, a missing delivery configuration must
  // not fake success. Mock mode (no RESEND_API_KEY) is a development
  // convenience only; refuse with 503 instead of pretending sales was notified.
  if (isMockMode() && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, error: "Inquiry delivery is not configured for production." },
      { status: 503 },
    );
  }

  // 2 · Persist first — this is the non-negotiable ordering.
  const record = await save(parsed.input, parsed.context);
  record.assignedTo = assignOwner(parsed.input, parsed.context);

  // 3 · Best-effort delivery.
  const outcome = await send(record);
  await markDelivered(record.id, outcome.delivered, outcome.error);

  // 4 · Report honestly. A mock/mail failure is not a submit failure.
  return NextResponse.json(
    {
      ok: true,
      id: record.id,
      delivered: outcome.delivered,
      mock: isMockMode(),
    },
    { status: 201 },
  );
}

export async function GET(request: Request) {
  // T03 (2026-10-04): anonymous inquiry listing is a launch blocker —
  // see outputs/site-launch-plan/02-data-and-inquiry-design.md §6.
  // Listing is only reachable with an explicit admin token; when no token is
  // configured the capability is disabled entirely (404), and a wrong token
  // is rejected with 401. Never open this to anonymous readers.
  const adminToken = process.env.INQUIRY_ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { ok: false, error: "Inquiry listing is not enabled." },
      { status: 404 },
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${adminToken}`) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }
  const { list } = await import("@/lib/inquiry");
  const records = await list();
  return NextResponse.json({ ok: true, count: records.length, records });
}
