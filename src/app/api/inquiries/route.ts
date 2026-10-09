import { NextResponse } from "next/server";
import {
  assignOwner,
  InquiryPersistenceError,
  isMockMode,
  markDelivered,
  save,
  send,
  validate,
} from "@/lib/inquiry";
import { bindWheelEnquiry } from "@/lib/wheels/inquiry-binding";
import { automationTrap, originAllowed, rateLimit } from "@/lib/inquiry/guard";
import { issueInquiryReceipt } from "@/lib/inquiry/receipt";

/**
 * POST /api/inquiries — the public boundary; the only write path into the
 * business record.
 *
 * Order is deliberate and matches docs/plans/inquiry-system-architecture.md §6
 * and DEC-055 §5:
 *   1. validate
 *   2. re-resolve the wheel context (bindWheelEnquiry)
 *   3. persist            ← the record is durable here, via WordPress
 *   4. send mail          ← failure here never loses the lead
 *   5. report honestly
 *
 * Since DEC-055 the write goes to WordPress (`POST /fh/v1/inquiries`), which
 * owns the CPT, the idempotency-key table and the outbox. The **mail step also
 * moves there** — it runs after WordPress commits its transaction — so a mail
 * outage can no longer be confused with a lost inquiry, and `emailStatus` is
 * reported separately from whether the record was stored.
 *
 * Requires a Node runtime. `output: "standalone"` in next.config.ts provides
 * it; a static export would disable this route entirely.
 */

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16 * 1024;

/** The endpoint's idempotency-key contract: 32–64 chars of [A-Za-z0-9_-]. */
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{32,64}$/;

/**
 * The client generates the idempotency key (so a retry after a timeout reuses
 * it). When an older caller does not send one, the server makes one up: the
 * request still succeeds, it just loses the dedupe guarantee for that caller.
 * Never reject the request over a missing key — that would turn a transport
 * concern into a lost lead.
 */
function readIdempotencyKey(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const raw = (body as Record<string, unknown>).idempotencyKey;
  return typeof raw === "string" && IDEMPOTENCY_KEY.test(raw.trim()) ? raw.trim() : undefined;
}

export async function POST(request: Request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ ok: false, error: "Origin not allowed." }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Request body is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "Request body is too large." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request body." },
      { status: 400 },
    );
  }

  const trapError = automationTrap(body);
  if (trapError) {
    return NextResponse.json({ ok: false, error: trapError }, { status: 422 });
  }

  const privacyVersion = process.env.NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION?.trim();
  if (!privacyVersion) {
    return NextResponse.json(
      { ok: false, error: "The enquiry form is not enabled." },
      { status: 503 },
    );
  }

  const parsed = validate(body, privacyVersion);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: "Validation failed.", fieldErrors: parsed.fieldErrors },
      { status: 422 },
    );
  }

  const retryAfter = rateLimit(request, parsed.input.email);
  if (retryAfter !== null) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  // 1b · Wheel enquiries: re-resolve `model + productionCode` against the
  //      public collection before anything is persisted.
  //
  //      PAGE-SPECS/wheel-detail.md §7: "服务端必须按公开目录重新查询
  //      model + productionCode。客户端隐藏字段只能作为提示，不能成为
  //      订单事实源。" A client can edit the URL and submit a specification
  //      that exists on no real wheel; this is the only place that closes it.
  //
  //      A code that does not resolve is NOT rejected — an unresolved variant
  //      is still a real lead, and §7 explicitly allows a model-only enquiry
  //      (`variant_pending`). What it never does is carry the client's
  //      specification into the record: the snapshot is cleared instead.
  const binding = await bindWheelEnquiry(parsed.context);
  const context = binding.applied
    ? { ...parsed.context, ...binding.context }
    : parsed.context;

  // 2 · Persist first — this is the non-negotiable ordering.
  let saved;
  try {
    saved = await save(parsed.input, context, {
      idempotencyKey: readIdempotencyKey(body),
    });
  } catch (error) {
    return persistenceFailureResponse(error);
  }

  saved.assignedTo = assignOwner(parsed.input, context);

  // 3a · The CMS wrote it. It also queued (and attempted) the sales mail inside
  //      the same commit, so there is nothing to send here and `emailStatus` is
  //      WordPress's answer — not our own guess.
  if (saved.persisted) {
    const delivered = saved.emailStatus === "accepted" || saved.emailStatus === "delivered";
    return NextResponse.json(
      {
        ok: true,
        id: saved.id,
        receiptToken: issueInquiryReceipt(saved.id),
        persisted: true,
        emailStatus: saved.emailStatus,
        delivered,
        mock: false,
      },
      { status: saved.replayed ? 200 : 201 },
    );
  }

  // 3b · Development fallback: no CMS configured, so the record is only in this
  //      process's memory. Deliver locally (console mock or Resend) and label
  //      `persisted: false` so the caller cannot mistake it for durability.
  const outcome = await send(saved);
  await markDelivered(saved.id, outcome.delivered, outcome.error);

  return NextResponse.json(
    {
      ok: true,
      id: saved.id,
      receiptToken: null,
      persisted: false,
      emailStatus: outcome.delivered ? "accepted" : isMockMode() ? "pending" : "failed",
      delivered: outcome.delivered,
      mock: isMockMode(),
    },
    { status: 201 },
  );
}

/**
 * Turn a persistence failure into an honest response.
 *
 * Two rules, both non-negotiable:
 *   · never 201 — a failed inquiry must not look submitted;
 *   · never collapse the reasons — a missing CMS is 503 ("try later"), a
 *     payload WordPress refused is 500 (a bug on this side), and a 422 that
 *     WordPress produced itself is forwarded as 422 so the visitor sees which
 *     field is wrong instead of a generic error.
 */
function persistenceFailureResponse(error: unknown): NextResponse {
  if (error instanceof InquiryPersistenceError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      },
      { status: error.status },
    );
  }

  console.error(
    `[inquiry] unexpected persistence failure: ${
      error instanceof Error ? error.name : "unknown"
    }`,
  );
  return NextResponse.json(
    { ok: false, error: "The inquiry could not be saved. Please try again." },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  void request;
  // 权威列表只存在于具备独立能力的 wp-admin。Next 进程内投影不是权威数据，
  // 即使配置 token 也不再开放，避免把调试缓存误当成管理接口。
  return NextResponse.json(
    { ok: false, error: "Inquiry listing is not available on this endpoint." },
    { status: 404 },
  );
}
