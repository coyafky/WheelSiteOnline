import { redirect } from "next/navigation";

type LegacyGuidePageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Legacy route: `/resources/[slug]` → `/insights/[slug]`.
 *
 * Follows the hub rename to `/insights` (`ARCHITECTURE.md` §6.2). The slug is
 * passed through unchanged, so every guide article keeps working at its new
 * path while old inbound links resolve.
 *
 * `redirect()` throws a 307 from a Server Component request; the route is
 * listed in `next.config`-free static redirects rather than here only if the
 * whole route is removed. Keeping a page that redirects preserves any
 * analytics landing on the old path.
 */
export default async function LegacyGuideArticlePage({
  params,
}: LegacyGuidePageProps) {
  const { slug } = await params;
  redirect(`/insights/${slug}`);
}
