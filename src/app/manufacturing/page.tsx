import { permanentRedirect } from "next/navigation";

/**
 * Legacy route: `/manufacturing` → `/capabilities`.
 *
 * The route was renamed because the page is no longer only about
 * manufacturing — it also carries the quality, material and capacity story,
 * so `/capabilities` describes it more accurately. The old path is kept as a
 * permanent redirect so existing links and search results do not break.
 *
 * 这是已确认的永久改名，因此使用 308，让搜索引擎迁移旧地址信号。
 */
export default function ManufacturingPage() {
  permanentRedirect("/capabilities");
}
