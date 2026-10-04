import { redirect } from "next/navigation";

type LegacyPatternPageProps = {
  params: Promise<{ pattern: string }>;
};

/**
 * Legacy route: `/resources/bolt-patterns/[pattern]` →
 * `/insights/bolt-patterns/[pattern]`.
 *
 * Follows the hub rename to `/insights` (`ARCHITECTURE.md` §6.2). The pattern
 * slug is passed through unchanged, so each pattern guide keeps working at its
 * new path while old inbound links resolve.
 *
 * `redirect()` throws a 307 from a Server Component request; the route is
 * listed in `next.config`-free static redirects rather than here only if the
 * whole route is removed. Keeping a page that redirects preserves any
 * analytics landing on the old path.
 */
export default async function LegacyBoltPatternPage({
  params,
}: LegacyPatternPageProps) {
  const { pattern: slug } = await params;
  redirect(`/insights/bolt-patterns/${slug}`);
}
