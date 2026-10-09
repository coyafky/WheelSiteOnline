import { permanentRedirect } from "next/navigation";

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
 * 这是已确认的永久改名，因此使用 308，让搜索引擎迁移旧地址信号。
 */
export default async function LegacyGuideArticlePage({
  params,
}: LegacyGuidePageProps) {
  const { slug } = await params;
  permanentRedirect(`/insights/${encodeURIComponent(slug)}`);
}
