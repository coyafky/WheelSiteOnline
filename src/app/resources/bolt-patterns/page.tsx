import { redirect } from "next/navigation";

/**
 * Legacy route: `/resources/bolt-patterns` → `/insights/bolt-patterns`.
 *
 * Follows the hub rename to `/insights` (`ARCHITECTURE.md` §6.2). The nested
 * reference set moved with its parent, so the old index path is kept as a
 * permanent redirect rather than being deleted.
 *
 * `redirect()` throws a 307 from a Server Component request; the route is
 * listed in `next.config`-free static redirects rather than here only if the
 * whole route is removed. Keeping a page that redirects preserves any
 * analytics landing on the old path.
 */
export default function LegacyBoltPatternsIndexPage() {
  redirect("/insights/bolt-patterns");
}
