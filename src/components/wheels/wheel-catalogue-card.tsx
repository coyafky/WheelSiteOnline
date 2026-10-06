import Image from "next/image";
import Link from "next/link";

import type { WheelCatalogueCard } from "@/lib/wheels/types";

/**
 * 目录产品卡 —— **唯一一份**（PAGE-SPECS/wheel-catalog.md §7）
 *
 * ⚠️ 三个调用点共用：目录页（W02）、详情页的相关型号（WD06）、将来旋压入口。
 *    不要在调用点复制一份；要改就改这里。
 *
 * ── 图片纪律（§7.2 + DEC-014）────────────────────────────────────────────────
 * **只显示第一张批准图片**（`primaryImage`）。不做自动轮播、不用第二张图做
 * hover 预载 —— 那会让用户在没点进去前先下载两倍图片。
 * 1:1 容器 + `object-contain`：轮毂是圆的，`cover` 会把轮缘裁掉。
 * 固定宽高，加载时不产生布局跳动。
 *
 * ── 不显示（§7.3）────────────────────────────────────────────────────────────
 * `styleName` 里的第三方商标或车型名 ｜ `vehicleHints` ｜ 未核准的价格/库存/
 * MOQ/交期/载荷/重量/认证 ｜ 用型号级集合拼出的假配置 ｜ 无图占位卡。
 * 本组件拿到的 `card` 已经是公开集合投影，不存在上述字段 —— 这是**类型层面**的保证，
 * 不是靠自觉。
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
      // 整块可点，但链接有明确名称（§7.2 可访问性要求）
      aria-label={`${card.model} — view specifications`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-forge/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forge motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* 图片：1:1 容器，object-contain，固定尺寸防抖动 */}
      <div className="relative aspect-square w-full bg-hero">
        <Image
          src={card.primaryImage}
          alt={`Fenghuai wheel model ${card.model}, front view`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain"
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
      </div>

      {/* 卡片顺序：型号 → 工艺 → 直径/PCD → 配置与 finish 数量 → CTA（§7.2） */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-mono text-[0.95rem] font-600 uppercase tracking-[0.08em] text-foreground">
            {card.model}
          </p>
          {card.processLabel ? (
            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-forge">
              {card.processLabel}
            </p>
          ) : (
            // 未记录工艺是**诚实状态**，不是缺失（§5.1 的独立分组）
            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
              Process not specified
            </p>
          )}
        </div>

        <dl className="mt-auto grid gap-2 text-[0.78rem]">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">Diameter</dt>
            <dd className="text-right text-foreground/85">
              {card.diameters.length
                ? card.diameters.map((d) => `${d}"`).join(" · ")
                : "—"}
              {extraDiameters > 0 ? (
                <span className="text-muted-foreground"> +{extraDiameters}</span>
              ) : null}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">PCD</dt>
            <dd className="text-right text-foreground/85">
              {card.pcds.length
                ? card.pcds.map((p) => p.replace("x", "×")).join(" · ")
                : "—"}
              {extraPcds > 0 ? (
                <span className="text-muted-foreground"> +{extraPcds}</span>
              ) : null}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">Configurations</dt>
            <dd className="text-right text-foreground/85">
              {card.approvedVariantCount} recorded
            </dd>
          </div>
          {card.approvedFinishCount > 0 ? (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">Finishes</dt>
              <dd className="text-right text-foreground/85">
                {card.approvedFinishCount}{" "}
                {card.approvedFinishCount === 1 ? "option" : "options"}
              </dd>
            </div>
          ) : null}
        </dl>

        <span className="mt-1 inline-flex items-center gap-1.5 text-[0.78rem] font-600 text-forge">
          View specifications
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
