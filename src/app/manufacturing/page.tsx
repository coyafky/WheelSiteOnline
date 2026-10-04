import { redirect } from "next/navigation";

/**
 * Legacy route: `/manufacturing` → `/capabilities`.
 *
 * The route was renamed because the page is no longer only about
 * manufacturing — it also carries the quality, material and capacity story,
 * so `/capabilities` describes it more accurately. The old path is kept as a
 * permanent redirect so existing links and search results do not break.
 *
 * `redirect()` throws a 307 from a Server Component request; the route is
 * listed in `next.config`-free static redirects rather than here only if the
 * whole route is removed. Keeping a page that redirects preserves any
 * analytics landing on the old path.
 */
export default function ManufacturingPage() {
  redirect("/capabilities");
}
