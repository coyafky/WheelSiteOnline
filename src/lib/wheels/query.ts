/**
 * 公开轮毂目录模块 —— 查询（筛选 / 排序 / 分页 / faceting）
 *
 * ⚠️ 本模块是**纯函数层**，不 import `server-only`，可以被单测直接跑。
 *
 * 核心纪律（PAGE-SPECS/wheel-catalog.md §3.3）：
 *   **规格筛选必须在同一条真实 variant 上求交集。**
 *   用户选 `18×8.5 + 5×112 + ET35`，只有真的存在这一整组组合的型号才命中。
 *   禁止分别从 `sizes[]`、`pcds[]`、`offsets[]` 取集合后拼出源数据里不存在的配置。
 *
 *   注意「同类多选是 OR、不同轴之间是 AND」的**求值位置**：
 *   OR 发生在**单条 variant 内部**（该 variant 的直径 ∈ 选中直径集合），
 *   而不是先在型号级集合上 OR 再跨轴 AND —— 后者正是会产生假命中的写法。
 *
 * 工艺是**型号级**条件（`approved_process`），不参与 variant 交集。
 */

import { normalizePcds } from "./normalize";
import {
  PROCESS_META,
  processLabelEn,
  type CatalogueFacets,
  type CatalogueSort,
  type FacetOption,
  type PublicWheelModel,
  type ProcessKey,
} from "./types";

export const PAGE_SIZE = 24;

/** 归一化后的查询（所有轴都是数组；空数组 = 该轴不筛选）。 */
export type NormalizedQuery = {
  q: string;
  diameters: number[];
  widths: number[];
  pcds: string[];
  processes: ProcessKey[];
  sort: CatalogueSort;
  page: number;
};

export const SORT_KEYS: CatalogueSort[] = [
  "model-asc",
  "diameter-asc",
  "diameter-desc",
  "variants-desc",
];

export const PROCESS_KEYS: ProcessKey[] = [
  "flow-formed",
  "low-pressure-cast",
  "low-pressure-flow-formed",
  "forged",
  "not-specified",
];

export function emptyQuery(): NormalizedQuery {
  return {
    q: "",
    diameters: [],
    widths: [],
    pcds: [],
    processes: [],
    sort: "model-asc",
    page: 1,
  };
}

/* ============================================================================
 * 匹配
 * ========================================================================== */

/** 该型号是否有**同一条** variant 同时满足全部规格轴。 */
function hasVariantMatchingAllAxes(model: PublicWheelModel, q: NormalizedQuery): boolean {
  const { diameters, widths, pcds } = q;
  if (!diameters.length && !widths.length && !pcds.length) return true;

  return model.variants.some((variant) => {
    if (diameters.length) {
      if (variant.diameter === null || !diameters.includes(variant.diameter)) return false;
    }
    if (widths.length) {
      if (variant.width === null || !widths.includes(variant.width)) return false;
    }
    if (pcds.length) {
      // 双孔距轮毂会展开成多个键；命中任一即代表这条 variant 真实提供该孔距
      const keys = normalizePcds(variant.pcd);
      if (!keys.some((k) => pcds.includes(k))) return false;
    }
    return true;
  });
}

export function matchesQuery(model: PublicWheelModel, q: NormalizedQuery): boolean {
  if (q.q) {
    // 只搜型号代码。**不搜 styleName** —— 那里面是第三方商标（spec §5.1）
    if (!model.model.toLowerCase().includes(q.q.toLowerCase())) return false;
  }
  if (q.processes.length && !q.processes.includes(model.processKey)) return false;
  return hasVariantMatchingAllAxes(model, q);
}

export function filterModels(models: PublicWheelModel[], q: NormalizedQuery): PublicWheelModel[] {
  return models.filter((m) => matchesQuery(m, q));
}

/* ============================================================================
 * 排序
 * ========================================================================== */

function minDiameter(model: PublicWheelModel): number {
  return model.diameters.length ? model.diameters[0] : Number.POSITIVE_INFINITY;
}

function maxDiameter(model: PublicWheelModel): number {
  return model.diameters.length
    ? model.diameters[model.diameters.length - 1]
    : Number.NEGATIVE_INFINITY;
}

export function sortModels(models: PublicWheelModel[], sort: CatalogueSort): PublicWheelModel[] {
  const out = [...models];
  // 稳定二级键一律是 slug —— 保证同分时顺序确定，避免构建产物抖动
  const tie = (a: PublicWheelModel, b: PublicWheelModel) => a.slug.localeCompare(b.slug, "en");

  switch (sort) {
    case "diameter-asc":
      out.sort((a, b) => minDiameter(a) - minDiameter(b) || tie(a, b));
      break;
    case "diameter-desc":
      out.sort((a, b) => maxDiameter(b) - maxDiameter(a) || tie(a, b));
      break;
    case "variants-desc":
      out.sort(
        (a, b) => b.approvedVariantCount - a.approvedVariantCount || tie(a, b),
      );
      break;
    case "model-asc":
    default:
      out.sort(
        (a, b) => a.model.localeCompare(b.model, "en", { numeric: true }) || tie(a, b),
      );
      break;
  }
  return out;
}

/* ============================================================================
 * 分页
 * ========================================================================== */

export function totalPages(total: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/* ============================================================================
 * Facets
 * ========================================================================== */

/**
 * 求某个轴的可选值全集 —— 用**全部公开型号**作为稳定全集，
 * 这样筛到 0 的选项仍然可见、只是被禁用（spec §9「值为 0 的选项禁用但可见」）。
 */
function universeFor(models: PublicWheelModel[], axis: "diameter" | "width" | "pcd"): string[] {
  const set = new Set<string>();
  for (const m of models) {
    if (axis === "diameter") for (const d of m.diameters) set.add(String(d));
    if (axis === "width") for (const w of m.widths) set.add(String(w));
    if (axis === "pcd") for (const p of m.pcds) set.add(p);
  }
  return [...set];
}

function sortNumericStrings(values: string[]): string[] {
  return [...values].sort((a, b) => Number(a) - Number(b));
}

/**
 * 计数口径：把该轴置为「仅这一个值」，其余轴保持用户当前选择，数还有多少型号命中。
 *
 * 这比「数 subset 里出现过的值」更准确 —— 后者会把
 * 「该型号虽有这个直径、但它的该直径变体不满足其他轴」的情况也算进去。
 */
function countForValue(
  models: PublicWheelModel[],
  q: NormalizedQuery,
  axis: "diameters" | "widths" | "pcds",
  value: string,
): number {
  const probe: NormalizedQuery =
    axis === "diameters"
      ? { ...q, diameters: [Number(value)] }
      : axis === "widths"
        ? { ...q, widths: [Number(value)] }
        : { ...q, pcds: [value] };
  return models.filter((m) => matchesQuery(m, probe)).length;
}

export function buildFacets(models: PublicWheelModel[], q: NormalizedQuery): CatalogueFacets {
  const diaOptions: FacetOption[] = sortNumericStrings(universeFor(models, "diameter")).map((v) => {
    const count = countForValue(models, q, "diameters", v);
    return { value: v, label: `${v}"`, count, disabled: count === 0 };
  });

  const widthOptions: FacetOption[] = sortNumericStrings(universeFor(models, "width")).map((v) => {
    const count = countForValue(models, q, "widths", v);
    return { value: v, label: `${v}"`, count, disabled: count === 0 };
  });

  const pcdOptions: FacetOption[] = universeFor(models, "pcd")
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((v) => {
      const count = countForValue(models, q, "pcds", v);
      return { value: v, label: v.replace(/x/g, "×"), count, disabled: count === 0 };
    });

  const processOptions = PROCESS_KEYS.map((key) => {
    const count = models.filter(
      (m) => matchesQuery(m, { ...q, processes: [key] }),
    ).length;
    const label =
      key === "not-specified"
        ? "Not specified in source data"
        : (PROCESS_META[key]?.labelEn ?? key);
    return { key, value: key, label, count, disabled: count === 0 };
  });

  return {
    diameters: diaOptions,
    widths: widthOptions,
    pcds: pcdOptions,
    processes: processOptions,
  };
}

/* ============================================================================
 * 目录卡投影
 * ========================================================================== */

/** 最多 3 个直径 / 2 个孔距 —— 超出由页面显示 `+N`（spec §4 W02）。 */
export function toCatalogueCard(model: PublicWheelModel) {
  return {
    slug: model.slug,
    model: model.model,
    displayModel: model.displayModel,
    primaryImage: model.primaryImage,
    processKey: model.processKey,
    processLabel: model.processLabel,
    diameters: model.diameters.slice(0, 3),
    diametersTotal: model.diameters.length,
    pcds: model.pcds.slice(0, 2),
    pcdsTotal: model.pcds.length,
    approvedVariantCount: model.approvedVariantCount,
    approvedFinishCount: model.approvedFinishCount,
  };
}

/** 是否带了任何筛选（决定结果文案与 canonical 策略）。 */
export function isFiltered(q: NormalizedQuery): boolean {
  return Boolean(
    q.q || q.diameters.length || q.widths.length || q.pcds.length || q.processes.length,
  );
}

/** 供 process 标签使用（页面可以直接从 types 取，这里转发一次保持单点）。 */
export { processLabelEn };
