import { permanentRedirect } from "next/navigation";

/**
 * Legacy route: `/resources/bolt-patterns` → `/insights/bolt-patterns`.
 *
 * Follows the hub rename to `/insights` (`ARCHITECTURE.md` §6.2). The nested
 * reference set moved with its parent, so the old index path is kept as a
 * permanent redirect rather than being deleted.
 *
 * 这是已确认的永久改名，因此使用 308，让搜索引擎迁移旧地址信号。
 */
export default function LegacyBoltPatternsIndexPage() {
  permanentRedirect("/insights/bolt-patterns");
}
