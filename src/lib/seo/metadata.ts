import type { Metadata } from "next";
import { getPublicLocalesForPath, localizedRouteMetadata } from "@/lib/i18n/publication";
import type { Locale } from "@/lib/i18n/types";

/**
 * The single place that decides whether a route is indexable and what its
 * canonical URL is.
 *
 * Before this existed, every page assembled `alternates` and `robots` itself
 * from the same publication lookup. That worked, but nothing forced the two to
 * agree: a page could publish a canonical while forgetting `robots`, or default
 * `index: true` while its canonical pointed somewhere else. Both are silent
 * SEO bugs — the page still renders, so nothing fails.
 *
 * Returning them together makes "indexable but no canonical" unreachable: there
 * is no code path that produces one without the other.
 *
 * `index` is derived from the SAME locale set as `canonical`/`languages`, so the
 * three always describe one route at one locale.
 */
export type RouteMetadata = Pick<Metadata, "alternates" | "robots">;

export async function buildRouteMetadata(
  pathname: string,
  locale: Locale,
  options?: {
    /**
     * Locales whose content has been approved through a mechanism the shared
     * publication table does not know about yet (for example a page family that
     * carries its own approval record). Merged with, never replacing, the
     * shared decision.
     */
    extraPublicLocales?: readonly Locale[];
    /**
     * Force the route out of the index regardless of approval — used by pages
     * that are reachable but must never be indexed (e.g. the enquiry
     * confirmation page).
     */
    noindex?: boolean;
    /**
     * Stop crawlers following links out of the page. Only for surfaces with
     * nothing worth passing on, such as a post-submission confirmation.
     */
    nofollow?: boolean;
    /**
     * Draft mode. A preview session must never be indexed, but the canonical
     * and hreflang set should still describe the route so the editor sees the
     * same metadata the published page will carry.
     */
    preview?: boolean;
  },
): Promise<RouteMetadata> {
  const approved = await getPublicLocalesForPath(pathname);
  const publicLocales = options?.extraPublicLocales?.length
    ? [...new Set([...approved, ...options.extraPublicLocales])]
    : approved;

  // `noindex` wins over everything; draft mode also forces it off.
  const indexable = !options?.noindex && !options?.preview && publicLocales.includes(locale);

  return {
    alternates: indexable
      ? await localizedRouteMetadata(pathname, locale, { extraPublicLocales: publicLocales })
      : { languages: {} },
    robots: {
      index: indexable,
      // A non-indexable page may still pass link equity onward; only surfaces
      // explicitly marked nofollow stop it.
      follow: !options?.nofollow,
    },
  };
}
