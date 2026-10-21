/**
 * Every Next.js cache tag this app can invalidate.
 *
 * These used to be declared next to their own content domain — one in
 * `pages-contract.ts`, one in `wheels-contract.ts`, one in
 * `insights-contract.ts`. Nothing listed them together, so adding a content
 * domain meant remembering to also wire its tag into the revalidation route,
 * and a typo or an omission failed silently: the page simply served stale
 * content until the TTL expired.
 *
 * This file is the register. Add the tag here first, then reference it from the
 * reader and the revalidation route. `CACHE_TAGS` lets the route validate the
 * tag it is asked to invalidate instead of falling back to a default.
 */

export const SITE_PAGES_CACHE_TAG = "site-pages";
export const WHEEL_PUBLICATION_TAG = "wheel-publication";
export const INSIGHTS_CACHE_TAG = "insights-guides";

/** The content domains a WordPress webhook can ask us to invalidate. */
export const REVALIDATION_TYPES = ["pages", "wheels", "insights"] as const;

export type RevalidationType = (typeof REVALIDATION_TYPES)[number];

/**
 * Domain → tag. The revalidation route derives the tag from the webhook's
 * `type` through this map, so a payload can only ever hit a registered tag.
 */
export const CACHE_TAGS: Record<RevalidationType, string> = {
  pages: SITE_PAGES_CACHE_TAG,
  wheels: WHEEL_PUBLICATION_TAG,
  insights: INSIGHTS_CACHE_TAG,
};

export function isRevalidationType(value: unknown): value is RevalidationType {
  return typeof value === "string" && (REVALIDATION_TYPES as readonly string[]).includes(value);
}

export function cacheTagFor(type: RevalidationType): string {
  return CACHE_TAGS[type];
}

/** All tags, for tests and diagnostics. */
export const ALL_CACHE_TAGS: readonly string[] = Object.freeze(Object.values(CACHE_TAGS));
