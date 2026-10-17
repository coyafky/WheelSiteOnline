import type { ZodType } from "zod";
import { getWpConfig, wpRead } from "./client";

/**
 * Why a CMS read produced no usable data.
 *
 * `wpRead` collapses every failure to `null`, so a caller cannot tell "the CMS
 * has nothing published" from "the CMS is down" from "the payload violates the
 * contract". Those need different handling — the first is a legitimate empty
 * state, the second should fall back, the third must be loud.
 */
export type WpReadFailureReason = "mock" | "network" | "client" | "server" | "contract";

export type WpReadResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: WpReadFailureReason; status: number | null };

/**
 * Read from the CMS and validate the payload against a schema.
 *
 * Reading still goes through `wpRead`, so caching, tags, timeouts and the
 * `WP_MODE` switch behave exactly as before; this only adds a typed outcome and
 * a structural check at the boundary. A payload that does not match the schema
 * is reported as `contract`, never passed through as `T`.
 */
export async function wpReadValidated<T>(
  path: string,
  schema: ZodType<T>,
  options: {
    revalidate?: number;
    tags?: string[];
    noStore?: boolean;
    restRoot?: boolean;
  } = {},
): Promise<WpReadResult<T>> {
  // Mock mode is a deliberate configuration, not a failure: report it as such
  // instead of letting it masquerade as a CMS error.
  if (getWpConfig().mode !== "live") {
    return { ok: false, reason: "mock", status: null };
  }

  const raw = await wpRead<unknown>(path, options);
  if (raw === null) {
    // `wpRead` has already logged the concrete status; all it can tell us here
    // is that no usable body came back.
    return { ok: false, reason: "network", status: null };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      `[wp] ${path} contract mismatch: ${parsed.error.issues
        .slice(0, 3)
        .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
        .join("; ")}`,
    );
    return { ok: false, reason: "contract", status: null };
  }
  return { ok: true, data: parsed.data };
}
