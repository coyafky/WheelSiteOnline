/**
 * 公开轮毂目录模块 —— 类型
 *
 * 这一层是**页面唯一可依赖的轮毂数据契约**。页面不得直接 import：
 *   · 供应商原始 JSON（assets/wheel-data/*）
 *   · WordPress 原始响应（src/lib/wordpress/*）
 *   · 生成物 src/content/wheel-catalogue.ts
 *
 * 见 PAGE-SPECS/wheel-catalog.md §8 与 wheel-detail.md §3.2。
 */

import type { WheelProcess } from "@/content/types";

/* ============================================================================
 * 发布决定（镜像自 WordPress，见 src/content/wheel-publication.json）
 * ========================================================================== */

export type PublicationStatus = "draft" | "approved" | "withdrawn";
export type ImageRightsStatus = "pending" | "approved" | "rejected";
export type SupplyStatus = "pending" | "confirmed" | "unavailable";
export type SpecificationStatus = "pending" | "verified" | "rejected";

/** 快照里的一条发布记录。字段名与 CPT meta 对齐（snake_case 是 WP 侧的事实）。 */
export type WheelPublicationRecord = {
  model: string;
  wpId?: number;
  wpStatus?: string;
  publication_status?: string;
  image_rights_status?: string;
  supply_status?: string;
  specification_status?: string;
  /** 人工核准的工艺。空 = 源数据未记录，**不推断**。 */
  approved_process?: string;
  /** 公开 slug。缺失即不合格（fail-closed）。 */
  public_slug?: string;
  display_model?: string;
  seo_title?: string;
  seo_description?: string;
  /** 已批准的 productionCode 列表。空数组 = 没有可询价配置 → 不合格。 */
  approvedVariantKeys?: string[];
};

/* ============================================================================
 * 工艺：内部中文值 → 公开英文标签
 * ========================================================================== */

export type ProcessKey =
  | "flow-formed"
  | "low-pressure-cast"
  | "low-pressure-flow-formed"
  | "forged"
  | "not-specified";

/**
 * 内部工艺值 → 公开标识与英文标签。
 *
 * ⚠️ 只有落在映射表里的值才能对外显示（spec §3.2「工艺：只在 process 有核准公开翻译时显示」）。
 * 表外的值一律按 `not-specified` 处理，**不猜、不兜底成某个具体工艺**。
 */
export const PROCESS_META: Record<Exclude<ProcessKey, "not-specified">, { labelEn: string }> = {
  "flow-formed": { labelEn: "Flow Formed" },
  "low-pressure-cast": { labelEn: "Low Pressure Cast" },
  "low-pressure-flow-formed": { labelEn: "Low Pressure Cast + Flow Formed" },
  forged: { labelEn: "Forged" },
};

/** 源数据里的中文工艺值 → ProcessKey。 */
const SOURCE_PROCESS_TO_KEY: Record<WheelProcess, Exclude<ProcessKey, "not-specified">> = {
  旋压: "flow-formed",
  低压: "low-pressure-cast",
  "低压+旋压": "low-pressure-flow-formed",
  锻造: "forged",
};

export function processKeyOf(approvedProcess?: string | null): ProcessKey {
  if (!approvedProcess) return "not-specified";
  const key = SOURCE_PROCESS_TO_KEY[approvedProcess as WheelProcess];
  return key ?? "not-specified";
}

/** 公开英文标签；未记录工艺时返回 undefined（页面应显示「未记录」而不是「未知」以外的推测）。 */
export function processLabelEn(key: ProcessKey): string | undefined {
  if (key === "not-specified") return undefined;
  return PROCESS_META[key]?.labelEn;
}

/* ============================================================================
 * 公开视图（页面唯一可消费的形状）
 * ========================================================================== */

/** 一条**已批准**的真实生产配置。规格表的唯一数据源。 */
export type PublicWheelVariant = {
  productionCode: string;
  /** 原始尺寸文本，如 `"18*8.5"`。 */
  size: string;
  /** 解析出的直径（英寸）。解析不出时为 null —— 不猜。 */
  diameter: number | null;
  /** 解析出的宽度（英寸）。解析不出时为 null。 */
  width: number | null;
  /** 原始孔距文本，如 `"6-139.7"`。 */
  pcd: string;
  /** 孔距的规范化参数形态（`5x112`），用于筛选与 URL。 */
  pcdKey: string;
  offset: number | null;
  centerBore: number | null;
  /** 原始表面处理文本（中文）。公开层暂不直接输出，等英文映射批准。 */
  finish: string;
};

export type PublicWheelModel = {
  /** URL 片段，稳定不变。 */
  slug: string;
  /** 原始型号代码，保持生产代码大小写。 */
  model: string;
  /** 对外型号名（WP 批准）。 */
  displayModel: string;
  processKey: ProcessKey;
  /** 已核准工艺的英文标签；未记录时为 undefined。 */
  processLabel?: string;
  /** 批准的第一张图片路径（`/images/wheels/xxx.webp`）。 */
  primaryImage: string;
  /** 该型号全部批准图片。 */
  images: string[];
  /** **只含已批准**的生产配置。 */
  variants: PublicWheelVariant[];
  /** 以下集合全部**从已批准 variants 派生**，不取型号级集合（spec §3.3）。 */
  diameters: number[];
  widths: number[];
  pcds: string[];
  approvedVariantCount: number;
  /** 去重后的 finish 数量。首发只显示数量，不画色板（spec §3.2）。 */
  approvedFinishCount: number;
  seoTitle?: string;
  seoDescription?: string;
};

/** 目录卡。与 `PublicWheelModel` 同源，只是裁掉详情才需要的字段。 */
export type WheelCatalogueCard = {
  slug: string;
  model: string;
  displayModel: string;
  primaryImage: string;
  processKey: ProcessKey;
  processLabel?: string;
  /** 最多 3 个，超出由卡片显示 `+N`。 */
  diameters: number[];
  /** 该型号的直径总数 —— 卡片据此渲染 `+N`（spec §4 W02）。 */
  diametersTotal: number;
  /** 最多 2 个，超出由卡片显示 `+N`。 */
  pcds: string[];
  /** 该型号的孔距总数 —— 卡片据此渲染 `+N`。 */
  pcdsTotal: number;
  approvedVariantCount: number;
  approvedFinishCount: number;
};

/* ============================================================================
 * 查询与结果
 * ========================================================================== */

export type CatalogueSort =
  | "model-asc"
  | "diameter-asc"
  | "diameter-desc"
  | "variants-desc";

export type WheelCatalogueInput = {
  q?: string;
  diameters?: number[];
  widths?: number[];
  pcds?: string[];
  processes?: ProcessKey[];
  sort?: CatalogueSort;
  page?: number;
};

/** 单个筛选轴的可选值与计数（计数在「其他轴已应用」的前提下计算）。 */
export type FacetOption = {
  value: string;
  label: string;
  count: number;
  disabled: boolean;
};

export type CatalogueFacets = {
  diameters: FacetOption[];
  widths: FacetOption[];
  pcds: FacetOption[];
  processes: Array<FacetOption & { key: ProcessKey }>;
};

export type WheelCataloguePageView = {
  cards: WheelCatalogueCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** 请求是否带任何筛选（决定结果文案与 canonical 策略）。 */
  isFiltered: boolean;
  /** 规范化后的查询（页面据此生成 URL）。 */
  normalizedQuery: WheelCatalogueInput;
  facets: CatalogueFacets;
};

export type WheelDetailView = {
  slug: string;
  model: string;
  displayModel: string;
  processKey: ProcessKey;
  processLabel?: string;
  primaryImage: string;
  approvedVariants: PublicWheelVariant[];
  approvedFinishCount: number;
  relatedModels: WheelCatalogueCard[];
  seoTitle?: string;
  seoDescription?: string;
};

/** 询盘服务端复核的结果 —— 只信服务端重新查出来的，不信客户端提交的。 */
export type ResolvedWheelSelection = {
  slug: string;
  model: string;
  displayModel: string;
  processKey: ProcessKey;
  variant: PublicWheelVariant;
};
