import type { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { getLocale } from "@/lib/i18n";

/**
 * Scope the Astryx provider subtree to the routes that actually render
 * Astryx components.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `<Providers>` used to sit in the root layout, wrapping every route — the
 * header, the footer and all page content. That made every visitor download
 * the Astryx runtime (Theme, InternationalizationProvider, the zh-CN and es-ES
 * message catalogues, ToastViewport, LinkProvider) whether or not the page
 * rendered a single Astryx component.
 *
 * Measured on a production build: the homepage and `/about` ship four Astryx
 * chunks they never use — roughly 39 KB gzip of the homepage's JS payload,
 * verified by building with the provider removed and diffing the chunks the
 * page actually requests (241 KB → 202 KB).
 *
 * ── Why a scope component instead of editing pages ──────────────────────────
 *
 * Thirteen routes need Astryx (form controls, breadcrumbs, catalogue filters,
 * legal-page outline). Wrapping each one by hand is thirteen chances to get it
 * wrong, and it moves the dependency somewhere a future reader will not look.
 * A segment `layout.tsx` per subtree keeps the decision declarative and visible
 * in the route tree.
 *
 * Sub-trees are uniform enough that seven layouts cover all thirteen routes.
 * A few routes that do not strictly need Astryx (the `/insights`, `/tools` and
 * `/dealers` indexes) sit inside those sub-trees and keep loading it — that is
 * the status quo, not a regression, and it is preferable to a layout scheme
 * that is harder to read.
 *
 * ── Do not put this back in the root layout ─────────────────────────────────
 *
 * Reverting to a root-level provider silently re-adds the download to every
 * route, including the ones that measure well today. If a new page needs
 * Astryx, add a segment layout for its sub-tree instead.
 */
export async function AstryxScope({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return <Providers locale={locale}>{children}</Providers>;
}
