import type { WpClientConfig, WpPost } from "./types";

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

/** Low-level fetch against the WP REST API. */
async function wpFetch<T>(path: string, revalidate = 3600): Promise<T | null> {
  const cfg = getWpConfig();
  if (cfg.mode !== "live") return null;

  const res = await fetch(`${cfg.baseUrl}${path}`, {
    headers: cfg.authToken ? { Authorization: `Basic ${cfg.authToken}` } : undefined,
    next: { revalidate },
  });

  if (!res.ok) {
    // Never throw into a page render — a CMS outage must not blank the site.
    console.error(`[wp] ${path} failed: ${res.status}`);
    return null;
  }
  return (await res.json()) as T;
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
