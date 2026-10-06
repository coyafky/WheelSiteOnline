/**
 * 公开轮毂目录模块 —— 桶导出
 *
 * ⚠️ 这个桶是 **server-only** 的（`public-catalogue.ts` 带 `import "server-only"`）。
 * 客户端组件不得从 `@/lib/wheels` 导入任何东西 —— 一旦导入，`next build` 会直接失败。
 *
 * 页面通常只需要这一处：
 *   import { getWheelCataloguePage } from "@/lib/wheels";
 *
 * 纯函数（`query` / `related` / `normalize`）如果要在测试或客户端复用，
 * 请从各自文件直接导入，不要走这个桶。
 */

export {
  FLOW_FORMED_PROCESSES,
  PAGE_SIZE,
  PROCESS_KEYS,
  SORT_KEYS,
  buildCatalogueHref,
  getWheelCataloguePage,
  getWheelDetailPage,
  isPageOutOfRange,
  listPublishedWheelSlugs,
  parseCatalogueSearchParams,
  resolvePublishedWheelSelection,
} from "./public-catalogue";

export { describePublicationFunnel, publicationSnapshotMeta } from "./publication";

/**
 * 工艺中文源值 → 公开英文标签。
 *
 * 页面与筛选栏用它渲染锁定工艺的标签 —— 单一映射点，避免各处自己拼字符串
 * （工艺标签一旦不一致，同一工艺会在目录与旋压页显示成两个名字）。
 */
export { processLabelEn } from "./types";

export type {
  CatalogueFacets,
  CatalogueSort,
  FacetOption,
  ProcessKey,
  PublicWheelModel,
  PublicWheelVariant,
  ResolvedWheelSelection,
  WheelCatalogueCard,
  WheelCatalogueInput,
  WheelCataloguePageView,
  WheelDetailView,
} from "./types";
