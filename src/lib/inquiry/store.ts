import type {
  InquiryContext,
  InquiryInput,
  InquiryRecord,
  InquirySnapshot,
} from "./types";

/**
 * Inquiry persistence.
 *
 * V1 uses an in-process Map so the whole flow is exercisable end-to-end
 * without provisioning a database. The interface below is the seam: swapping
 * in Postgres/Neon later means writing a second implementation, not touching
 * the route handler or the form.
 *
 * ⚠️ The in-memory store does NOT survive a server restart. That is acceptable
 * for the mock phase and is the reason `delivered` is tracked separately —
 * when a real DB lands, only `save()` changes.
 */

const memory = new Map<string, InquiryRecord>();

/** Monotonic counter — the in-memory stand-in for a DB sequence. */
let seq = 0;

function nextId(): string {
  seq += 1;
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
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

export async function save(
  input: InquiryInput,
  context: InquiryContext,
): Promise<InquiryRecord> {
  const record: InquiryRecord = {
    id: nextId(),
    createdAt: new Date().toISOString(),
    status: "new",
    input,
    context,
    snapshot: buildSnapshot(input, context),
    emailDelivered: false,
  };

  // Persist FIRST. Email is attempted only after this resolves.
  memory.set(record.id, record);
  return record;
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

export async function get(id: string): Promise<InquiryRecord | undefined> {
  return memory.get(id);
}

export async function list(): Promise<InquiryRecord[]> {
  return [...memory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Sales routing.
 *
 * ⚠️ V1 always returns the shared queue. Per-region owners are deliberately
 * NOT invented here — docs/plans/inquiry-system-architecture.md §13 lists
 * ownership rules as an open question for the client.
 *
 * The `_`-prefixed params keep the seam signature so the real routing
 * implementation can drop straight in (underscore = intentionally unused,
 * see eslint.config.mjs).
 */
export function assignOwner(_input: InquiryInput, _context: InquiryContext): string {
  return "unassigned";
}
