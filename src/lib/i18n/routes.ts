/**
 * Every route the App Router actually serves.
 *
 * Publication qualification must be able to tell "this path exists but its
 * translation is not approved" apart from "this path does not exist at all".
 * Without that distinction an unregistered path falls through to the fallback
 * in `getPublicLocalesForPath` and gets treated as an approved English page —
 * which is how withheld translations ended up reachable with a 200.
 *
 * Keep this list in sync with `src/app/**\/page.tsx`. A static route added
 * without registering it here becomes unreachable for non-English locales
 * (fail-closed), never the other way round.
 */

/** Static, fully spelled-out paths. */
const STATIC_PATHS = [
  "/",
  "/about",
  "/capabilities",
  "/contact",
  "/custom-development",
  "/dealers",
  "/dealers/private-label",
  "/fitment",
  "/gallery",
  "/gallery/finishes",
  "/gallery/wheels",
  "/insights",
  "/insights/bolt-patterns",
  "/manufacturing",
  "/products",
  "/products/custom-aluminum",
  "/products/ev-components",
  "/products/safety-tires",
  "/products/wheels",
  "/products/wheels/flow-formed",
  "/products/wheels/forged",
  "/request-a-quote",
  "/resources",
  "/resources/bolt-patterns",
  "/support/privacy",
  "/support/returns",
  "/support/shipping",
  "/support/terms",
  "/support/warranty",
  "/thank-you",
  "/tools",
  "/tools/offset-calculator",
] as const;

/** Dynamic route families: a single trailing segment under these prefixes. */
const DYNAMIC_PREFIXES = [
  "/fitment/",
  "/insights/",
  "/insights/bolt-patterns/",
  "/products/wheels/",
  "/resources/",
  "/resources/bolt-patterns/",
] as const;

function isSingleSegment(rest: string): boolean {
  return rest.length > 0 && !rest.includes("/");
}

/** True when the App Router has a page for this (locale-stripped) path. */
export function isKnownRoute(pathname: string): boolean {
  const path = pathname || "/";
  if (path === "/") return true;
  if ((STATIC_PATHS as readonly string[]).includes(path)) return true;

  for (const prefix of DYNAMIC_PREFIXES) {
    if (!path.startsWith(prefix)) continue;
    const rest = path.slice(prefix.length);
    // A prefix that is itself a static page was already matched above; here we
    // only accept exactly one extra segment.
    if (isSingleSegment(rest)) return true;
  }
  return false;
}
