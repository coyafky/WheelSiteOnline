import Link from "next/link";

import { cn } from "@/lib/utils";
import type { CatalogueFacets, WheelCatalogueInput } from "@/lib/wheels";

import { WheelCatalogueAppliedChips } from "./wheel-catalogue-filters";

/**
 * W03 —— 空状态与目录末尾询盘块（PAGE-SPECS/wheel-catalog.md §4 W03）。
 *
 * ── 空结果不是错误 ─────────────────────────────────────────────────────────
 * §5.2：**合法但无结果**的筛选返回 200 + noindex 空状态，不是 404。这里不推荐
 * 任何「差不多」的型号来填空（§9 W03）—— 那会把一次诚实的「没有匹配」变成一次错误承诺。
 *
 * ── 询盘带着筛选快照走 ─────────────────────────────────────────────────────
 * 「Request a wheel review」把 `product_line=wheels`、当前筛选快照和
 * `intent=catalogue_no_match` 一起带进 `/request-a-quote`，销售不必追问「你刚才筛了什么」。
 * 快照参数名与目录一致，孔距仍是 ASCII `x`。
 */

const CATALOGUE_PATH = "/products/wheels";
const QUOTE_PATH = "/request-a-quote";

/** 目录筛选快照 → 询盘 URL（§4 W03 Context）。 */
function reviewHref(query: WheelCatalogueInput, intent?: string): string {
  const sp = new URLSearchParams();
  sp.set("product_line", "wheels");
  if (intent) sp.set("intent", intent);
  if (query.q) sp.set("q", query.q);
  if (query.diameters?.length) sp.set("diameter", query.diameters.join(","));
  if (query.widths?.length) sp.set("width", query.widths.join(","));
  if (query.pcds?.length) sp.set("pcd", query.pcds.join(","));
  if (query.processes?.length) sp.set("process", query.processes.join(","));
  return `${QUOTE_PATH}?${sp.toString()}`;
}

/** 无匹配时的原位空状态：保留筛选摘要 + 一键清除 + 带快照询盘。 */
export function WheelCatalogueEmptyState({
  query,
  facets,
  className,
}: {
  query: WheelCatalogueInput;
  facets: CatalogueFacets;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="wheel-catalogue-empty-title"
      className={cn("rounded-lg border border-border bg-card p-6 lg:p-8", className)}
    >
      <h2
        id="wheel-catalogue-empty-title"
        className="font-display text-[clamp(1.3rem,2.8vw,1.75rem)] font-800 uppercase leading-tight tracking-[-0.01em] text-ink"
      >
        No published model matches all selected specifications
      </h2>
      <p className="mt-4 max-w-[680px] text-[0.95rem] leading-relaxed text-steel">
        Try removing one filter, check that the selected size and PCD belong to the same
        required configuration, or send the project details for an engineering review.
      </p>

      {/* 筛选摘要：可逐项移除（§9 W03「保留当前筛选摘要」） */}
      <WheelCatalogueAppliedChips facets={facets} query={query} className="mt-5" />

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Link href={CATALOGUE_PATH} className="btn-pill-solid !text-white">
          Clear filters
        </Link>
        <Link
          href={reviewHref(query, "catalogue_no_match")}
          className="btn-pill-outline !text-ink"
        >
          Request a wheel review
        </Link>
      </div>
    </section>
  );
}

/** 有结果时的目录末尾询盘块：紧凑，不复述目录。 */
export function WheelCatalogueEnd({
  query,
  className,
}: {
  query: WheelCatalogueInput;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="wheel-catalogue-end-title"
      className={cn("mt-10 rounded-lg bg-ink p-6 lg:p-8", className)}
    >
      <h2
        id="wheel-catalogue-end-title"
        className="font-display text-[clamp(1.3rem,2.8vw,1.75rem)] font-800 uppercase leading-tight tracking-[-0.01em] text-white"
      >
        Need a specification that is not listed?
      </h2>
      <p className="mt-4 max-w-[720px] text-[0.95rem] leading-relaxed text-white/70">
        Share the vehicle or application, target size, PCD, offset, centre bore, quantity
        and finish. The team will confirm whether an existing variant or a custom program
        is the appropriate route.
      </p>
      <div className="mt-6">
        <Link href={reviewHref(query)} className="btn-pill-solid !text-white">
          Request a wheel review
        </Link>
      </div>
    </section>
  );
}
