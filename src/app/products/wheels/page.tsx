import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { AutomotiveBackdrop } from "@/components/automotive-backdrop";
import {
  getWheelCataloguePage,
  isPageOutOfRange,
  parseCatalogueSearchParams,
  type WheelCatalogueInput,
  type WheelCataloguePageView,
} from "@/lib/wheels";
import { WheelCatalogueCardView } from "@/components/wheels/wheel-catalogue-card";
import {
  WheelCatalogueAppliedChips,
  WheelCatalogueFilters,
  WheelCatalogueSort,
} from "@/components/wheels/wheel-catalogue-filters";
import { WheelCataloguePagination } from "@/components/wheels/wheel-catalogue-pagination";
import {
  WheelCatalogueEmptyState,
  WheelCatalogueEnd,
} from "@/components/wheels/wheel-catalogue-empty";
import { automotiveScenes } from "@/content/automotive-scenes";

/**
 * `/products/wheels` — 轮毂目录（PAGE-SPECS/wheel-catalog.md W01–W03）。
 *
 * ── 这一页是 Server Component，且**必须是** ─────────────────────────────────
 * §12：不能把 1073 条完整数据和全部变体序列化给浏览器后再前端筛选。所以这里
 * `await searchParams` → `parseCatalogueSearchParams` → `getWheelCataloguePage`，
 * 服务端只把**当前页 24 条**投影成 card 交出。整个页面没有 `"use client"`，
 * 筛选是 GET 表单、分页是普通链接 —— 无 JS 时筛选、排序、翻页全部照常工作（§10）。
 *
 * ── 只认 `@/lib/wheels` ────────────────────────────────────────────────────
 * 页面不 import `@/content/wheel-skus` / `@/content/wheel-catalogue`，也不用
 * `WheelSketch`。公开集合的资格判定只有一处（`lib/wheels/publication.ts`）：
 * 有图 + 发布批准 + 图权批准 + 供货确认 + 规格已验证 + 至少一条批准变体。
 * 无图/草稿/撤回/规格待审的型号**不可能**出现在这里 —— 是类型与数据层的保证。
 *
 * ── 三个视口 ───────────────────────────────────────────────────────────────
 * W01 紧凑页首（不是大 Hero，§9）+ 两条路线入口；
 * W02 筛选栏 + 4 列产品网格 + 分页 + 目录末尾询盘块；
 * W03 合法空结果 → 原位空状态（200 + noindex，§5.2），不推荐不匹配的型号。
 */

type CataloguePageProps = {
  /** Next 16：`searchParams` 是 Promise，必须 await。 */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const BASE_TITLE =
  "Wheel Catalogue | Sizes, PCDs & Production Specifications | Fenghuai";
const PAGE_TITLE = (page: number) =>
  `Wheel Catalogue — Page ${page} | Sizes, PCDs & Production Specifications | Fenghuai`;
const DESCRIPTION =
  "Browse approved wheel models by diameter, width, PCD and recorded manufacturing process, then select an actual production configuration for enquiry.";
const CANONICAL = "/products/wheels";

/* ---------------------------------------------------------------------------
 * W02 结果文案模板（§4，逐字）
 * ------------------------------------------------------------------------- */

function resultSummary(view: WheelCataloguePageView): string {
  const search = view.normalizedQuery.q;
  if (search) return `${view.total} models found for “${search}”`;
  if (view.isFiltered) {
    return `${view.total} models match the selected production specifications`;
  }
  return `${view.total} published wheel models`;
}

/* ---------------------------------------------------------------------------
 * SEO（§11）
 * ------------------------------------------------------------------------- */

export async function generateMetadata({
  searchParams,
}: CataloguePageProps): Promise<Metadata> {
  const query = parseCatalogueSearchParams(await searchParams);
  const view = await getWheelCataloguePage(query);

  const requestedPage = query.page ?? 1;
  const filtered = view.isFiltered;
  const empty = view.total === 0;
  const paged = requestedPage > 1;

  // 带筛选/搜索的结果页 noindex,follow 且 canonical 指回基础目录（避免组合爆炸）；
  // 空结果页始终 noindex；无筛选的基础页可索引，分页用自身 URL 作 canonical。
  const noindex = filtered || empty;
  const canonical = noindex
    ? CANONICAL
    : paged
      ? `${CANONICAL}?page=${requestedPage}`
      : CANONICAL;

  return {
    // `absolute`：根 layout 的 `%s | Fenghuai` 模板会再追加一次品牌。
    title: { absolute: paged && !noindex ? PAGE_TITLE(requestedPage) : BASE_TITLE },
    description: DESCRIPTION,
    alternates: { canonical },
    robots: { index: !noindex, follow: true },
  };
}

/* ---------------------------------------------------------------------------
 * 页面
 * ------------------------------------------------------------------------- */

export default async function WheelCataloguePage({ searchParams }: CataloguePageProps) {
  const params = await searchParams;
  const query = parseCatalogueSearchParams(params);
  const view = await getWheelCataloguePage(query);

  // 越界页返回 404，而不是静默落到最后一页（§5.2）——否则爬虫会把不存在的页当内容收录。
  if (isPageOutOfRange(view, query.page ?? 1)) notFound();

  // 之后一律用规范化查询生成 URL：未知参数已被忽略、非法值已被丢掉。
  const pageQuery: WheelCatalogueInput = view.normalizedQuery;
  const summary = resultSummary(view);
  const itemListPositionBase = (view.page - 1) * view.pageSize;

  return (
    <>
      {/* ═══ W01 · 紧凑页首（§4 W01、§9 W01）══════════════════════════════
          不是大 Hero：目的只是定位 + 两个路线入口，首屏要尽快看到筛选与产品。 */}
      <section
        id="top"
        aria-labelledby="wheel-catalogue-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <AutomotiveBackdrop scene={automotiveScenes.wheelCatalogue} priority />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/90 to-ink/35"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_24%_0%,rgba(194,101,10,0.22)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-9 pt-[100px] lg:pb-11 lg:pt-[112px]">
          <nav aria-label="Breadcrumb" className="eyebrow !text-white/45">
            <Link href="/products" className="transition-colors hover:!text-forge">
              Products
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span className="!text-forge">Wheels</span>
          </nav>

          <p className="eyebrow mt-5 !text-forge">WHEEL CATALOGUE</p>
          <h1
            id="wheel-catalogue-title"
            className="mt-3 max-w-[860px] font-display text-[clamp(1.85rem,4.4vw,2.6rem)] font-800 uppercase leading-[0.96] tracking-[-0.02em] text-white"
          >
            Find a wheel by verified production specification
          </h1>
          <p className="mt-4 max-w-[760px] text-[0.98rem] leading-relaxed text-white/75">
            Browse published wheel models by diameter, width, PCD and recorded
            manufacturing process. Every result has an approved image, and every
            selectable specification comes from an actual recorded variant.
          </p>
          <p className="mt-3 max-w-[760px] text-[0.82rem] leading-relaxed text-white/55">
            A catalogue match is a starting point for quotation. Vehicle fitment, brake
            clearance, load requirements and destination-market documents are confirmed
            before an order is approved.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              href="/products/wheels/flow-formed"
              className="group inline-flex items-center gap-2 font-display text-[0.74rem] font-700 uppercase tracking-[0.13em] text-forge transition-colors hover:text-white"
            >
              Browse recorded flow-formed wheels
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/products/wheels/forged"
              className="group inline-flex items-center gap-2 font-display text-[0.74rem] font-700 uppercase tracking-[0.13em] text-forge transition-colors hover:text-white"
            >
              Discuss a custom forged wheel
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ W02 · 结果区 / W03 · 空状态（§4、§9、§10）══════════════════ */}
      <section
        aria-label="Wheel catalogue results"
        data-floating-quote-hide
        className="border-b border-border bg-white py-8 lg:py-14"
      >
        <div className="container-fh-wide">
          {/* 移动：结果数在 Filters 按钮之前（§10「H1 后立即显示结果数和 Filters 按钮」） */}
          <p className="font-display text-[0.78rem] font-700 uppercase tracking-[0.1em] text-ink lg:hidden">
            {summary}
          </p>

          <div className="lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start lg:gap-x-10">
            {/* 左栏：筛选（sticky，但不遮挡 Header、不阻断页尾）。
                高度约束与内部滚动移进了 `WheelCatalogueFilters` 的表单 ——
                只有那样「筛选区滚动 + Apply 常驻」才成立。 */}
            <div className="mt-4 lg:sticky lg:top-24 lg:mt-0 lg:border-r lg:border-border lg:pr-8">
              <WheelCatalogueFilters
                facets={view.facets}
                query={pageQuery}
                total={view.total}
                isFiltered={view.isFiltered}
              />
            </div>

            {/* 右栏：结果 */}
            <div className="mt-6 lg:mt-0">
              {view.total === 0 ? (
                // W03：合法但无结果 → 200 + noindex 空状态，原位显示（§5.2、§9 W03）
                <WheelCatalogueEmptyState query={pageQuery} facets={view.facets} />
              ) : (
                <>
                  {/* 结果数 + 排序同屏（§9 W01）；结果数在桌面显示（移动那份已在上面） */}
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/12 pb-5">
                    <p className="mr-auto hidden font-display text-[0.82rem] font-700 uppercase tracking-[0.12em] text-ink lg:block">
                      {summary}
                    </p>
                    <WheelCatalogueSort query={pageQuery} />
                  </div>

                  <WheelCatalogueAppliedChips
                    facets={view.facets}
                    query={pageQuery}
                    className="mt-4"
                  />

                  {/* 卡片边界说明 —— 只出现一次，不逐卡重复（§4 W02） */}
                  <p className="mt-5 max-w-[720px] text-[0.75rem] leading-relaxed text-muted-foreground">
                    Specifications shown in the catalogue are production records, not a
                    vehicle-fitment guarantee.
                  </p>

                  {/* 每页 24 张；移动单列（360–639）→ 640 起两列 → 桌面四列，
                      且任何一列都不窄于 230px（§5.4、§9、§10）。只给第一排 priority。 */}
                  <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] lg:gap-y-14">
                    {view.cards.map((card, index) => (
                      <WheelCatalogueCardView
                        key={card.slug}
                        card={card}
                        priority={index < 4}
                      />
                    ))}
                  </div>

                  <WheelCataloguePagination
                    query={pageQuery}
                    page={view.page}
                    totalPages={view.totalPages}
                  />

                  <WheelCatalogueEnd query={pageQuery} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 当前页 ItemList（§11）。没有价格/库存 → 不输出 Offer；未核准型号不输出 Product。 */}
      {!view.isFiltered && view.total > 0 ? (
        <script
          type="application/ld+json"
          // 只有我们自己的数据层内容进入这里；没有访客输入，没有 CMS 文本。
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListOrder: "https://schema.org/ItemListOrderAscending",
              numberOfItems: view.cards.length,
              itemListElement: view.cards.map((card, index) => ({
                "@type": "ListItem",
                position: itemListPositionBase + index + 1,
                url: `${CANONICAL}/${card.slug}`,
                name: card.model,
              })),
            }),
          }}
        />
      ) : null}
    </>
  );
}
