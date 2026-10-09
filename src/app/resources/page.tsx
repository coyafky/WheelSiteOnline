import { permanentRedirect } from "next/navigation";

/**
 * Legacy route: `/resources` → `/insights`.
 *
 * The content hub was renamed because `/insights` matches the target
 * information architecture in `PAGE-SPECS/index.md` and `ARCHITECTURE.md`
 * §6.2, and describes editorial guide content better than "resources", which
 * reads as a download library. The old path is kept as a permanent redirect so
 * existing links, sitemaps and search results do not break.
 *
 * 这是已确认的永久改名，因此使用 308，让搜索引擎迁移旧地址信号。
 */
export default function ResourcesPage() {
  permanentRedirect("/insights");
}
