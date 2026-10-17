import "server-only";

/**
 * 公开轮毂目录模块 —— **对外唯一入口**
 *
 * 页面、sitemap、询盘路由只允许调用这里暴露的四个函数；
 * 不得直接读 `wheelCatalogue`、`wheel-publication.json`、WordPress 响应或任何原始 JSON。
 *
 * 四个接口（架构稿 §5）：
 *   getWheelCataloguePage()          目录（旋压页通过锁定 process 复用）
 *   getWheelDetailPage()             详情
 *   listPublishedWheelSlugs()        generateStaticParams 与 sitemap 的唯一来源
 *   resolvePublishedWheelSelection() 询盘服务端复核
 *
 * 返回 Promise 是刻意的：当前数据来自构建期快照（同步可得），
 * 但接 WordPress 实时读取时接口不能变，否则所有调用方都要改。
 */

import { getPublishedWheelModels } from "./source";
import {
  PAGE_SIZE,
  PROCESS_KEYS,
  SORT_KEYS,
  buildFacets,
  emptyQuery,
  filterModels,
  isFiltered,
  paginate,
  sortModels,
  toCatalogueCard,
  totalPages,
  type NormalizedQuery,
} from "./query";
import { pickRelatedModels } from "./related";
import { normalizePcds } from "./normalize";
import type {
  CatalogueSort,
  ProcessKey,
  ResolvedWheelSelection,
  WheelCatalogueInput,
  WheelCataloguePageView,
  WheelDetailView,
} from "./types";

export { PAGE_SIZE, PROCESS_KEYS, SORT_KEYS };

/**
 * 旋压入口的锁定工艺集合。
 *
 * 见 PAGE-SPECS/wheel-catalog.md §4 W01 与 flow-formed-wheels.md：
 * 「只聚合明确记录为旋压或低压+旋压的批准型号」——
 * 未标注工艺（`not-specified`）**不得**被算作旋压。
 */
export const FLOW_FORMED_PROCESSES: ProcessKey[] = [
  "flow-formed",
  "low-pressure-flow-formed",
];

/* ============================================================================
 * 1) 目录
 * ========================================================================== */

export async function getWheelCataloguePage(
  input: WheelCatalogueInput = {},
): Promise<WheelCataloguePageView> {
  const all = await getPublishedWheelModels();
  const query = normalizeQuery(input);

  const matched = filterModels(all, query);
  const sorted = sortModels(matched, query.sort);
  const pages = totalPages(sorted.length, PAGE_SIZE);
  const page = Math.min(Math.max(1, query.page), pages);
  const cards = paginate(sorted, page, PAGE_SIZE).map(toCatalogueCard);

  return {
    cards,
    total: sorted.length,
    page,
    pageSize: PAGE_SIZE,
    totalPages: pages,
    isFiltered: isFiltered(query),
    normalizedQuery: {
      q: query.q || undefined,
      diameters: query.diameters,
      widths: query.widths,
      pcds: query.pcds,
      processes: query.processes,
      sort: query.sort,
      page,
    },
    facets: buildFacets(all, query),
  };
}

/**
 * 请求的页码是否越界。越界应返回 **404**（spec §5.2），
 * 而不是静默落到最后一页 —— 那会让爬虫把不存在的页当内容收录。
 */
export function isPageOutOfRange(view: WheelCataloguePageView, requestedPage: number): boolean {
  return requestedPage > view.totalPages;
}

/* ============================================================================
 * 2) 详情
 * ========================================================================== */

export async function getWheelDetailPage(slug: string): Promise<WheelDetailView | null> {
  const all = await getPublishedWheelModels();
  const model = all.find((item) => item.slug === slug.trim().toLowerCase()) ?? null;
  if (!model) return null;

  const related = pickRelatedModels(all, model);

  return {
    slug: model.slug,
    model: model.model,
    displayModel: model.displayModel,
    processKey: model.processKey,
    processLabel: model.processLabel,
    primaryImage: model.primaryImage,
    approvedVariants: model.variants,
    approvedFinishCount: model.approvedFinishCount,
    relatedModels: related,
    seoTitle: model.seoTitle,
    seoDescription: model.seoDescription,
  };
}

/* ============================================================================
 * 3) slug 全量
 * ========================================================================== */

export async function listPublishedWheelSlugs(): Promise<string[]> {
  return (await getPublishedWheelModels()).map((model) => model.slug);
}

/* ============================================================================
 * 4) 询盘服务端复核
 * ========================================================================== */

/**
 * 用 slug + productionCode 在**公开集合**里重新解析。
 *
 * ⚠️ 绝不相信客户端提交的尺寸 / PCD / ET / CB / finish ——
 * 客户端可以把 URL 里的规格改掉，制造一条不存在的配置。
 * 这里只认服务端重新查出来的那一条 variant（架构稿 §11）。
 */
export async function resolvePublishedWheelSelection(input: {
  slug: string;
  productionCode: string;
}): Promise<ResolvedWheelSelection | null> {
  const all = await getPublishedWheelModels();
  const model = all.find((item) => item.slug === input.slug.trim().toLowerCase()) ?? null;
  if (!model) return null;

  const code = String(input.productionCode ?? "").trim();
  if (!code) return null;

  const variant = model.variants.find((v) => v.productionCode === code);
  if (!variant) return null;

  return {
    slug: model.slug,
    model: model.model,
    displayModel: model.displayModel,
    processKey: model.processKey,
    variant,
  };
}

/* ============================================================================
 * 查询参数解析（URL → 查询）
 * ========================================================================== */

function asArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return (Array.isArray(value) ? value : [value]).flatMap((v) => String(v).split(","));
}

/**
 * 直径与宽度的合法量程**不同**，不能共用一个区间：
 * 直径 10–26 英寸，宽度 4–14 英寸（实测 6–10.5）。
 * 共用会把宽度 8 / 8.5 全部过滤掉 —— 这是验收里真抓到过一次的 bug。
 */
const DIAMETER_RANGE = { min: 10, max: 26 } as const;
const WIDTH_RANGE = { min: 4, max: 14 } as const;

function toNumberInRange(values: string[], range: { min: number; max: number }): number[] {
  return [
    ...new Set(
      values
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isFinite(n) && n >= range.min && n <= range.max),
    ),
  ].sort((a, b) => a - b);
}

/** URL 里的孔距一律用 ASCII `x`；同时容忍用户手打 `×` 或 `*`。 */
function toPcdKeys(values: string[]): string[] {
  const out = new Set<string>();
  for (const raw of values) {
    if (!raw.trim()) continue;
    for (const key of normalizePcds(raw)) out.add(key);
  }
  return [...out].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}

function toProcesses(values: string[]): ProcessKey[] {
  const out = new Set<ProcessKey>();
  for (const raw of values) {
    const v = raw.trim() as ProcessKey;
    if (PROCESS_KEYS.includes(v)) out.add(v);
  }
  return [...out];
}

function toSort(value: string | string[] | undefined): CatalogueSort {
  const v = (Array.isArray(value) ? value[0] : value)?.trim() as CatalogueSort | undefined;
  return v && SORT_KEYS.includes(v) ? v : "model-asc";
}

function toPage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/**
 * 解析 `searchParams`。**未知参数忽略、非法值忽略，绝不 500**（spec §5.2）。
 */
export function parseCatalogueSearchParams(
  params: Record<string, string | string[] | undefined>,
): WheelCatalogueInput {
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim();

  return {
    q: q || undefined,
    diameters: toNumberInRange(asArray(params.diameter), DIAMETER_RANGE),
    widths: toNumberInRange(asArray(params.width), WIDTH_RANGE),
    pcds: toPcdKeys(asArray(params.pcd)),
    processes: toProcesses(asArray(params.process)),
    sort: toSort(params.sort),
    page: toPage(params.page),
  };
}

/**
 * Native GET forms submit an empty search input as `?q=`. The query parser
 * correctly treats that as no search, but page routes use this predicate to
 * redirect the browser to the equivalent clean URL instead of leaving a
 * meaningless parameter in history, canonical checks or copied links.
 */
export function hasEmptySearchParam(
  params: Record<string, string | string[] | undefined>,
): boolean {
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  return raw !== undefined && raw.trim() === "";
}

function normalizeQuery(input: WheelCatalogueInput): NormalizedQuery {
  const base = emptyQuery();
  return {
    q: (input.q ?? "").trim(),
    diameters: [...new Set(input.diameters ?? [])].sort((a, b) => a - b),
    widths: [...new Set(input.widths ?? [])].sort((a, b) => a - b),
    pcds: [...new Set(input.pcds ?? [])].sort((a, b) => a.localeCompare(b, "en", { numeric: true })),
    processes: [...new Set(input.processes ?? [])],
    sort: input.sort && SORT_KEYS.includes(input.sort) ? input.sort : base.sort,
    page: Number.isFinite(input.page) && (input.page as number) >= 1 ? Math.floor(input.page as number) : 1,
  };
}

/** 把规范化查询还原成 URL 查询串（页面生成分页链接用）。 */
export function buildCatalogueHref(
  query: WheelCatalogueInput,
  overrides: {
    page?: number;
    sort?: CatalogueSort;
    /**
     * Base path for the result URL. Defaults to the wheel catalogue.
     *
     * Sub-catalogues need it because their filter form must submit back to
     * their **own** route: `/products/wheels/flow-formed`, not the catalogue.
     * Without it a filter change on the flow-formed page would silently widen
     * the result set by dropping the page's locked process boundary.
     */
    path?: string;
    /**
     * Process values that are **locked by the route**, not chosen by the
     * visitor. They are dropped from the query string entirely.
     *
     * PAGE-SPECS/flow-formed-wheels.md §4 requires "用户不能通过 URL 清除工艺边界".
     * Leaving `process=…` in the URL would let a visitor — or a crawler — widen
     * the page to every wheel by editing one parameter, and would also give the
     * same result set two indexable URLs.
     */
    lockedProcesses?: readonly string[];
  } = {},
): string {
  const basePath = overrides.path ?? "/products/wheels";
  const locked = new Set(overrides.lockedProcesses ?? []);

  const sp = new URLSearchParams();
  if (query.q) sp.set("q", query.q);
  if (query.diameters?.length) sp.set("diameter", query.diameters.join(","));
  if (query.widths?.length) sp.set("width", query.widths.join(","));
  if (query.pcds?.length) sp.set("pcd", query.pcds.join(","));
  if (locked.size === 0 && query.processes?.length) {
    sp.set("process", query.processes.join(","));
  }
  const sort = overrides.sort ?? query.sort;
  if (sort && sort !== "model-asc") sp.set("sort", sort);
  const page = overrides.page ?? query.page ?? 1;
  if (page > 1) sp.set("page", String(page));

  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
