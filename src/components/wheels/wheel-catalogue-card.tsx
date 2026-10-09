import Image from "next/image";
import Link from "next/link";

import type { WheelCatalogueCard } from "@/lib/wheels/types";

/**
 * 目录产品卡 —— **唯一一份**（PAGE-SPECS/wheel-catalog.md §7）
 *
 * 三个调用点共用：目录页（W02）、详情页相关型号、旋压入口。只显示第一张批准图片，
 * 规格全部来自公开集合投影；不显示未核准的价格、库存、载荷或车型适配。
 */
export function WheelCatalogueCardView({
  card,
  /** 第一排的卡才给 priority，其余懒加载（§9）。 */
  priority = false,
}: {
  card: WheelCatalogueCard;
  priority?: boolean;
}) {
  const href = `/products/wheels/${card.slug}`;
  const extraDiameters = card.diametersTotal - card.diameters.length;
  const extraPcds = card.pcdsTotal - card.pcds.length;

  return (
    <Link
      href={href}
      aria-label={`${card.model} — view specifications`}
      className="group flex min-w-0 flex-col bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-soft transition-colors duration-300 group-hover:bg-muted">
        <div className="absolute inset-3 sm:inset-4">
          <Image
            src={card.primaryImage}
            alt={`Fenghuai wheel model ${card.model}, front view`}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center border-b border-ink/12 px-3 pb-7 pt-5 text-center sm:px-4">
        <div className="min-h-[54px]">
          <p className="font-display text-[1.05rem] font-800 uppercase tracking-[0.06em] text-ink">
            {card.model}
          </p>
          {card.processLabel ? (
            <p className="mt-1.5 text-[0.66rem] font-700 uppercase tracking-[0.16em] text-forge">
              {card.processLabel}
            </p>
          ) : (
            <p className="mt-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground">
              Process not specified
            </p>
          )}
        </div>

        <dl className="mt-4 w-full text-[0.78rem]">
          <div>
            <dt className="sr-only">Diameter</dt>
            <dd className="font-700 leading-6 text-ink">
              {card.diameters.length
                ? card.diameters.map((diameter) => `${diameter}″`).join("  |  ")
                : "—"}
              {extraDiameters > 0 ? (
                <span className="text-muted-foreground"> +{extraDiameters}</span>
              ) : null}
            </dd>
          </div>
          <div className="mt-1.5">
            <dt className="sr-only">PCD</dt>
            <dd className="leading-5 text-steel">
              <span className="mr-1.5 font-display text-[0.62rem] font-700 uppercase tracking-[0.12em] text-muted-foreground">
                PCD
              </span>
              {card.pcds.length
                ? card.pcds.map((pcd) => pcd.replace("x", "×")).join(" · ")
                : "—"}
              {extraPcds > 0 ? (
                <span className="text-muted-foreground"> +{extraPcds}</span>
              ) : null}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-[0.7rem] leading-5 text-muted-foreground">
          {card.approvedVariantCount} recorded{" "}
          {card.approvedVariantCount === 1 ? "configuration" : "configurations"}
          {card.approvedFinishCount > 0
            ? ` · ${card.approvedFinishCount} ${card.approvedFinishCount === 1 ? "finish" : "finishes"}`
            : ""}
        </p>

        <span className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.68rem] font-700 uppercase tracking-[0.12em] text-forge">
          View specifications
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
