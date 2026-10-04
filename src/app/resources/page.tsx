import { redirect } from "next/navigation";

/**
 * Legacy route: `/resources` → `/insights`.
 *
 * The content hub was renamed because `/insights` matches the target
 * information architecture in `PAGE-SPECS/index.md` and `ARCHITECTURE.md`
 * §6.2, and describes editorial guide content better than "resources", which
 * reads as a download library. The old path is kept as a permanent redirect so
 * existing links, sitemaps and search results do not break.
 *
 * `redirect()` throws a 307 from a Server Component request; the route is
 * listed in `next.config`-free static redirects rather than here only if the
 * whole route is removed. Keeping a page that redirects preserves any
 * analytics landing on the old path.
 */
export default function ResourcesPage() {
  redirect("/insights");
}
