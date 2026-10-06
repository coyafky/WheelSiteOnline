import "server-only";

import { wpWrite } from "../wordpress/client";
import type {
  InquiryContext,
  InquiryInput,
  InquiryRecord,
  InquirySnapshot,
} from "./types";

/**
 * Inquiry persistence.
 *
 * DEC-055: **WordPress is the only writer.** This module no longer owns the
 * business record — it forwards to `POST /fh/v1/inquiries` on the CMS, which
 * writes the `fh_inquiry` CPT plus the idempotency-key and outbox tables inside
 * one transaction. Next never touches a `wp_*` table and holds no DB credential.
 *
 * What stays here:
 *   · the mapping from the site's `InquiryInput`/`InquiryContext` to the
 *     endpoint's camelCase payload;
 *   · a process-local projection of what was written, so `get()`/`list()` keep
 *     working for the existing (auth-gated) admin listing;
 *   · the **development fallback**: without a configured CMS there is nothing to
 *     write to, and the record is kept in memory — labelled `persisted: false`
 *     so no caller can mistake it for durability. In production that same
 *     situation is a hard failure, never a silent success.
 */

/** Email delivery state. Deliberately separate from business state. */
export type EmailStatus =
  | "pending"
  | "sending"
  | "accepted"
  | "delivered"
  | "bounced"
  | "failed"
  | "unknown";

/** The four product lines the endpoint accepts. */
const PRODUCT_LINES = [
  "wheels",
  "ev-components",
  "custom-aluminum",
  "safety-tires",
] as const;
type ProductLine = (typeof PRODUCT_LINES)[number];

const CUSTOMER_TYPES = ["business", "individual"] as const;
type CustomerType = (typeof CUSTOMER_TYPES)[number];

/**
 * Thrown when a configured CMS refused or could not be reached.
 *
 * Deliberately an exception rather than a `null`-ish return: ADR-level rule is
 * that a failed inquiry must never look like a successful one, and the route
 * handler needs a discriminating signal to pick 4xx/5xx.
 */
export class InquiryPersistenceError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(message: string, status = 500, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "InquiryPersistenceError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * An `InquiryRecord` plus the two facts the route must report honestly.
 *
 * Structurally compatible with `InquiryRecord` so existing callers (the admin
 * listing, `GET /api/inquiries`) keep working unchanged.
 */
export type SavedInquiry = InquiryRecord & {
  /** `true` only when WordPress confirmed the write. */
  persisted: boolean;
  /** Email state as reported by the CMS — never folded into a success boolean. */
  emailStatus: EmailStatus;
  /** `true` when WordPress recognised the idempotency key instead of creating. */
  replayed: boolean;
};

export type SaveOptions = {
  /**
   * Client-generated idempotency key. Optional so the previous two-argument
   * call still compiles; when absent a server-side key is generated, so an old
   * caller degrades to at-least-once instead of erroring.
   */
  idempotencyKey?: string;
};

/** Shape of the endpoint's success body. */
type WpInquiryResponse = {
  ok: true;
  id: string;
  emailStatus?: string;
  createdAt?: string;
  replayed?: boolean;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Local projection (dev fallback + admin listing cache)
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * The projection is keyed by inquiry number and holds the **same object**
 * `save()` returns, so later mutations (the owner assignment in the route) stay
 * visible to `get()`/`list()` exactly as they did with the old Map store.
 */
const memory = new Map<string, SavedInquiry>();

/** Monotonic counter for the in-memory fallback ids. */
let seq = 0;

function nextMockId(): string {
  seq += 1;
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  // ⚠️ Only ever used when there is no CMS to number the inquiry. The real
  // `INQ-YYYYMMDD-NNNN` comes from WordPress (see the mu-plugin) and is never
  // derived from `wp_posts.ID`, which would leak the site's total post count.
  return `INQ-${stamp}-${String(seq).padStart(4, "0")}`;
}

/** Freeze the product context so later catalog edits cannot rewrite history. */
export function buildSnapshot(
  input: InquiryInput,
  context: InquiryContext,
): InquirySnapshot {
  return {
    capturedAt: new Date().toISOString(),
    model: input.model ?? context.model,
    productionCode: context.productionCode,
    spec: context.selectedSpec,
    sourcePage: context.pageUrl,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Payload mapping
 * ────────────────────────────────────────────────────────────────────────── */

function pickEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

/**
 * Which product line this inquiry belongs to.
 *
 * Precedence: an explicit value on the request → the visitor's form selection →
 * the `product_line` the originating page put in the URL (every product page
 * does: `/request-a-quote?product_line=ev-components…`) → the source page path →
 * `INQUIRY_DEFAULT_PRODUCT_LINE`.
 *
 * ⚠️ The last resort is a guess. It only fires for a direct visit to
 * `/request-a-quote` with no line context, and the QF01–QF03 two-step form is
 * specified to collect the line explicitly — at which point the default should
 * be removed. It is configurable so the guess is at least visible.
 */
function resolveProductLine(
  explicit: unknown,
  input: InquiryInput,
  context: InquiryContext,
): ProductLine {
  const fromBody = pickEnum(explicit, PRODUCT_LINES);
  if (fromBody) return fromBody;

  const fromInput = pickEnum(input.line, PRODUCT_LINES);
  if (fromInput) return fromInput;

  const fromContext = pickEnum(context.productLine, PRODUCT_LINES);
  if (fromContext) return fromContext;

  const path = context.pageUrl ?? "";
  const fromPath = PRODUCT_LINES.find((line) => path.includes(`/products/${line}`));
  if (fromPath) return fromPath;

  const fallback = pickEnum(process.env.INQUIRY_DEFAULT_PRODUCT_LINE, PRODUCT_LINES);
  return fallback ?? "wheels";
}

/**
 * Business vs individual.
 *
 * The current single-step form never asks, so it is inferred: a company name is
 * the strongest available signal. The two-step form asks outright and its answer
 * takes precedence.
 */
function resolveCustomerType(explicit: unknown, input: InquiryInput): CustomerType {
  const fromBody = pickEnum(explicit, CUSTOMER_TYPES);
  if (fromBody) return fromBody;
  return input.company && input.company.trim() !== "" ? "business" : "individual";
}

/** The endpoint's camelCase payload. */
function buildWpPayload(
  input: InquiryInput,
  context: InquiryContext,
  idempotencyKey: string,
  explicit: { customerType?: unknown; productLine?: unknown },
) {
  return {
    idempotencyKey,
    customerType: resolveCustomerType(explicit.customerType, input),
    productLine: resolveProductLine(explicit.productLine, input, context),
    message: input.message,
    quantity: input.quantity,
    // The current form has no "what inputs do you have" control yet.
    inputsAvailable: [] as string[],
    name: input.name,
    email: input.email,
    countryCode: input.country,
    company: input.company,
    whatsapp: input.whatsapp,
    // The consent record is required by the endpoint. Until the two-step form
    // captures it, the server stamps it — the value is honest about being
    // unversioned rather than inventing a policy version.
    privacyVersion: process.env.INQUIRY_PRIVACY_VERSION?.trim() || "unversioned",
    consentedAt: new Date().toISOString(),
    context: {
      model: context.model ?? input.model,
      productionCode: context.productionCode,
      spec: context.selectedSpec,
      sourcePage: context.pageUrl,
      productLine: context.productLine ?? input.line,
      intent: context.intent ?? context.inputType,
      variantPending: context.variantPending === true,
    },
  };
}

function normalizeEmailStatus(value: unknown): EmailStatus {
  const allowed: EmailStatus[] = [
    "pending",
    "sending",
    "accepted",
    "delivered",
    "bounced",
    "failed",
    "unknown",
  ];
  return typeof value === "string" && (allowed as string[]).includes(value)
    ? (value as EmailStatus)
    : "pending";
}

/* ────────────────────────────────────────────────────────────────────────────
 * Public store API
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Persist an inquiry.
 *
 * Ordering (identical to the previous implementation, and non-negotiable):
 * the record is durable **before** any mail is sent. Since DEC-055 the mail step
 * also happens inside WordPress, after the transaction commits — so a mail
 * outage can no longer be mistaken for a lost lead, nor rolled back into one.
 */
export async function save(
  input: InquiryInput,
  context: InquiryContext,
  options: SaveOptions = {},
): Promise<SavedInquiry> {
  const idempotencyKey = options.idempotencyKey?.trim() || generateIdempotencyKey();

  const result = await wpWrite<WpInquiryResponse>(
    "/fh/v1/inquiries",
    buildWpPayload(
      input,
      context,
      idempotencyKey,
      // `InquiryInput` has no customerType field yet; when the form starts
      // sending one it arrives through `context`-adjacent plumbing and will be
      // threaded in here.
      { customerType: undefined, productLine: input.line },
    ),
  );

  if (result.ok) {
    const emailStatus = normalizeEmailStatus(result.data.emailStatus);
    const saved: SavedInquiry = {
      id: result.data.id,
      createdAt: result.data.createdAt ?? new Date().toISOString(),
      status: "new",
      input,
      context,
      snapshot: buildSnapshot(input, context),
      emailDelivered: emailStatus === "accepted" || emailStatus === "delivered",
      persisted: true,
      emailStatus,
      replayed: result.data.replayed === true,
    };
    memory.set(saved.id, saved);
    return saved;
  }

  // ── No CMS configured ────────────────────────────────────────────────────
  if (result.reason === "not_configured") {
    if (process.env.NODE_ENV === "production") {
      // Fail loudly. "persisted: false" on a 201 would let a lead evaporate.
      throw new InquiryPersistenceError(
        "Inquiry persistence is not configured for production.",
        503,
      );
    }

    // Development: keep the flow exercisable, and say exactly what happened.
    const saved: SavedInquiry = {
      id: nextMockId(),
      createdAt: new Date().toISOString(),
      status: "new",
      input,
      context,
      snapshot: buildSnapshot(input, context),
      emailDelivered: false,
      persisted: false,
      emailStatus: "pending",
      replayed: false,
    };
    memory.set(saved.id, saved);
    console.warn(
      `[inquiry] WordPress is not configured — inquiry ${saved.id} kept in memory only (persisted: false)`,
    );
    return saved;
  }

  // ── The CMS rejected it with 422: a validation split-brain ────────────────
  if (result.reason === "client" && result.status === 422) {
    const body = result.body as { fieldErrors?: unknown } | undefined | null;
    const fieldErrors =
      body && typeof body.fieldErrors === "object" && body.fieldErrors !== null
        ? (body.fieldErrors as Record<string, string>)
        : undefined;
    throw new InquiryPersistenceError(
      result.error || "The inquiry was rejected by WordPress.",
      422,
      fieldErrors,
    );
  }

  // ── Anything else: honest failure ────────────────────────────────────────
  throw new InquiryPersistenceError(
    result.error || "The inquiry could not be persisted.",
    // A 4xx means our payload was wrong (a bug on this side) — report it as a
    // server error. 5xx and network failures are "try again later".
    result.reason === "client" ? 500 : 503,
  );
}

/** A 32–64 char `[A-Za-z0-9_-]` key — the endpoint's contract. */
function generateIdempotencyKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function markDelivered(
  id: string,
  delivered: boolean,
  error?: string,
): Promise<void> {
  const rec = memory.get(id);
  if (!rec) return;
  rec.emailDelivered = delivered;
  rec.emailError = error;
}

/**
 * Read one record back.
 *
 * ⚠️ Process-local: the authoritative record lives in WordPress. There is no
 * protected read endpoint yet (by design — the design doc requires identity,
 * roles and an audit trail before inquiry reading is exposed). This only ever
 * sees records this process wrote.
 */
export async function get(id: string): Promise<InquiryRecord | undefined> {
  return memory.get(id);
}

/**
 * List records for the admin endpoint.
 *
 * ⚠️ Same caveat as `get()`: this is this process's projection, not the
 * database. Real listing lives in wp-admin ("询盘"菜单), which is what the
 * design specifies for sales. A protected list REST route is deliberately NOT
 * added here — it would need role checks and an audit trail first.
 */
export async function list(): Promise<InquiryRecord[]> {
  return [...memory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Sales routing.
 *
 * ⚠️ V1 always returns the shared queue. Per-region owners are deliberately
 * NOT invented here — docs/plans/inquiry-system-architecture.md §13 lists
 * ownership rules as an open question for the client. The endpoint stores
 * `business_status`/`assigned_to` for sales to set in wp-admin.
 *
 * The `_`-prefixed params keep the seam signature so the real routing
 * implementation can drop straight in (underscore = intentionally unused,
 * see eslint.config.mjs).
 */
export function assignOwner(_input: InquiryInput, _context: InquiryContext): string {
  return "unassigned";
}
