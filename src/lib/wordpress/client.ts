import "server-only";

import type { WpClientConfig, WpMedia, WpPost } from "./types";

/**
 * Headless WordPress read client.
 *
 * V1 runs `mode: "mock"` — every call resolves from the local fixture set so
 * the site is fully explorable without a CMS. Switching to `mode: "live"` only
 * changes this file; no page or component imports a concrete data source.
 *
 * ⚠️ This module must never be imported from a client component — the auth
 * token and the CMS hostname stay server-side.
 */

export function getWpConfig(): WpClientConfig {
  const baseUrl = process.env.WP_API_URL ?? "";
  const authToken = process.env.WP_API_TOKEN;
  return {
    baseUrl,
    authToken,
    // Live only when a CMS URL is configured AND explicitly opted in.
    mode: baseUrl && process.env.WP_MODE === "live" ? "live" : "mock",
  };
}

/**
 * Cache tag for the wheel publication layer.
 *
 * PAGE-SPECS/wheel-catalog.md §8 asks the catalogue, detail, flow-formed and
 * sitemap surfaces to share one tag so that "WordPress 发布、撤回或改图后触发
 * 按 tag 重验证".
 *
 * ⚠️ Current state: the wheel pages do **not** read WordPress at request time —
 * they read the build-time snapshot `src/content/wheel-publication.json`
 * (DEC-052). So there is nothing to invalidate at runtime yet, and the
 * publish → live path is `sync-wheel-publication.py` + a rebuild instead of a
 * `revalidateTag` call.
 *
 * The tag is declared here so the plumbing is in place the moment a surface
 * starts reading live: pass it to `wpFetch` and a publish event can invalidate
 * exactly the wheel entries.
 */
/**
 * Low-level fetch against the WP REST API.
 *
 * @param tags Next.js cache tags for on-demand revalidation. Optional and
 *   empty by default, so every existing caller keeps its current behaviour.
 */
async function wpFetch<T>(
  path: string,
  revalidate = 3600,
  tags: string[] = [],
): Promise<T | null> {
  const cfg = getWpConfig();
  if (cfg.mode !== "live") return null;

  try {
    const res = await fetch(`${cfg.baseUrl}${path}`, {
      headers: cfg.authToken
        ? { Authorization: `Basic ${cfg.authToken}` }
        : undefined,
      next: { revalidate, ...(tags.length ? { tags } : {}) },
      // The local editorial stack performs image-metadata work on first read
      // and can take longer than three seconds. Requests remain parallel and
      // cached, while eight seconds still bounds a CMS outage before the
      // approved local fallback is used.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[wp] ${path} failed: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`[wp] ${path} unavailable: ${message}`);
    return null;
  }
}

/**
 * 带缓存标签的只读接口。预览态用 noStore，公开态按标签缓存；调用方必须自己决定
 * `null`（CMS 不可用）与空数组（CMS 明确没有已发布内容）的不同语义。
 */
export async function wpRead<T>(
  path: string,
  options: {
    revalidate?: number;
    tags?: string[];
    noStore?: boolean;
    restRoot?: boolean;
  } = {},
): Promise<T | null> {
  const cfg = getWpConfig();
  if (cfg.mode !== "live") return null;

  const baseUrl = options.restRoot ? getWpRestRoot() : cfg.baseUrl;
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: cfg.authToken
        ? { Authorization: `Basic ${cfg.authToken}` }
        : undefined,
      ...(options.noStore
        ? { cache: "no-store" as const }
        : {
            next: {
              revalidate: options.revalidate ?? 3600,
              ...(options.tags?.length ? { tags: options.tags } : {}),
            },
          }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`[wp] ${path} failed: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(
      `[wp] ${path} unavailable: ${error instanceof Error ? error.name : "unknown"}`,
    );
    return null;
  }
}

/**
 * REST root for the whole CMS (`…/wp-json`), not just the core `wp/v2` namespace.
 *
 * `WP_API_URL` points at `…/wp-json/wp/v2` because every existing caller reads
 * core collections. The inquiry endpoint lives in the **project** namespace
 * `fh/v1`, so a write cannot be built by appending to `baseUrl` — it needs the
 * root. `WP_REST_ROOT` overrides; otherwise the `wp/v2` suffix is stripped.
 */
export function getWpRestRoot(): string {
  const explicit = process.env.WP_REST_ROOT?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const baseUrl = process.env.WP_API_URL?.trim() ?? "";
  if (!baseUrl) return "";

  const trimmed = baseUrl.replace(/\/+$/, "");

  // Documented form (see `.env.example`): `http://host/wp-json/wp/v2`.
  if (/\/wp-json\/wp\/v2$/.test(trimmed)) {
    return trimmed.replace(/\/wp\/v2$/, "");
  }
  // Already the REST root.
  if (/\/wp-json$/.test(trimmed)) return trimmed;

  // ⚠️ Anything else (typically a bare origin like `http://localhost:8081`) used
  // to be returned unchanged, so the write went to `/fh/v1/inquiries` and came
  // back as a bare `HTTP 404` — indistinguishable from a missing route, with no
  // hint that the *configuration* was the problem. That cost a real debugging
  // detour on 2026-10-06. The REST API never lives at the origin, so append the
  // segment rather than silently building a wrong URL.
  return `${trimmed}/wp-json`;
}

/**
 * Why a write failed. Kept apart on purpose: callers must be able to tell a
 * misconfiguration from a CMS rejection from an outage — an inquiry failure has
 * to be reported honestly, and "we could not reach WordPress" is not the same
 * message as "WordPress said your email address is malformed".
 *
 *  · `not_configured` — WP_MODE isn't `live`, or no service key / REST root.
 *  · `network`        — the request never produced a response (DNS, timeout…).
 *  · `client`         — HTTP 4xx: the CMS understood us and refused.
 *  · `server`         — HTTP 5xx: the CMS broke.
 */
export type WpWriteFailureReason = "not_configured" | "network" | "client" | "server";

export type WpWriteResult<T> =
  | { ok: true; status: number; data: T }
  | {
      ok: false;
      reason: WpWriteFailureReason;
      error: string;
      status?: number;
      /** Parsed error body when there was one — never swallowed into `null`. */
      body?: unknown;
    };

/** Pull a human message out of either our `{error}` shape or a WP_Error payload. */
function readErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.error === "string" && record.error) return record.error;
    if (typeof record.message === "string" && record.message) return record.message;
  }
  return fallback;
}

/**
 * Authenticated write against the project REST namespace (`fh/v1`).
 *
 * ⚠️ Deliberately NOT built on `wpFetch`:
 *   · writes must never be cached — `wpFetch` passes `next.revalidate`, which
 *     would make a POST result serveable from the data cache;
 *   · a write must not fall back to `null` on failure, because a dropped inquiry
 *     is not the same as an unavailable fixture.
 *
 * Auth is a **service key**, not a WP user: the value travels in the
 * `X-FH-Service-Key` header. Never in the URL (query strings end up in access
 * logs) and never from a cookie jar.
 */
export async function wpWrite<T>(
  path: string,
  body: unknown,
  opts: { timeoutMs?: number } = {},
): Promise<WpWriteResult<T>> {
  const cfg = getWpConfig();
  const serviceKey = process.env.WP_INQUIRY_SERVICE_KEY?.trim();

  if (cfg.mode !== "live") {
    return {
      ok: false,
      reason: "not_configured",
      error: "WordPress writes require WP_MODE=live.",
    };
  }
  if (!serviceKey) {
    return {
      ok: false,
      reason: "not_configured",
      error: "WP_INQUIRY_SERVICE_KEY is not configured.",
    };
  }
  const root = getWpRestRoot();
  if (!root) {
    return {
      ok: false,
      reason: "not_configured",
      error: "WP_REST_ROOT (or WP_API_URL) is not configured.",
    };
  }

  let res: Response;
  try {
    res = await fetch(`${root}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-FH-Service-Key": serviceKey,
      },
      body: JSON.stringify(body ?? {}),
      // Never cached: a write has no revalidatable representation.
      cache: "no-store",
      signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`[wp:write] ${root}${path} unreachable: ${message}`);
    return { ok: false, reason: "network", error: message };
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const reason: WpWriteFailureReason = res.status >= 500 ? "server" : "client";
    const message = readErrorMessage(parsed, `HTTP ${res.status}`);
    console.error(`[wp:write] ${root}${path} failed: HTTP ${res.status} (${reason})`);
    return { ok: false, reason, status: res.status, error: message, body: parsed };
  }

  return { ok: true, status: res.status, data: parsed as T };
}

/** Fetch one media-library record. Callers retain their local fallback. */
export async function wpMedia(id: number): Promise<WpMedia | null> {
  return wpFetch<WpMedia>(`/media/${id}`);
}

/** Fetch multiple media records in one request to avoid exhausting WP workers. */
export async function wpMediaCollection(ids: number[]): Promise<WpMedia[]> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [];

  const query = new URLSearchParams({
    include: uniqueIds.join(","),
    per_page: String(uniqueIds.length),
    _fields: "id,source_url,alt_text,caption,media_details",
  });

  return (await wpFetch<WpMedia[]>(`/media?${query.toString()}`)) ?? [];
}

/**
 * Fetch a collection, falling back to the supplied fixture in mock mode.
 * Every caller passes its own fallback so pages stay renderable offline.
 */
export async function wpCollection<T extends WpPost<unknown>>(
  path: string,
  fallback: T[],
): Promise<T[]> {
  const live = await wpFetch<T[]>(path);
  return live ?? fallback;
}

/** Fetch a single item by slug, with a fixture fallback. */
export async function wpItem<T extends WpPost<unknown>>(
  path: string,
  fallback: T | null,
): Promise<T | null> {
  const live = await wpFetch<T>(path);
  return live ?? fallback;
}
