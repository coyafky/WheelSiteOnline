import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductLine } from "@/content/types";
import { getTranslator } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * A single product-line card.
 *
 * ── Why this is not `<ProductCard>` (see PAGE-SPECS/products/index.md §3.1) ─
 * `<ProductCard>` serves the three *wheel categories*. It is a client component
 * with hover-image swapping and an expandable highlights list, because a wheel
 * category genuinely has multiple angles and several things to say.
 *
 * A product line does not. All four lines have one sentence and one image, and
 * the one thing they must do above all is look *identical* to each other —
 * that is the §0 core discipline ("轮毂的视觉权重不得高于其他三条"). Reusing
 * `<ProductCard>` would have meant shipping the hover machinery and the
 * highlights branch to four lines that never use them, and every card would
 * then be one prop away from rendering differently from its neighbours.
 *
 * So this is a **server component with no state**: no hover image, no
 * expansion, no client bundle. Four identical boxes.
 *
 * ── The parallelism is in the geometry ──────────────────────────────────────
 *   • every card gets the same `aspect-4/3` image box
 *   • every card's body is `flex-1`, so a two-line summary and a one-line
 *     summary still produce four cards of equal height in a stretched grid
 *   • the footer link is `mt-auto`, so the arrows line up across the row
 *   • `hasRender: false` renders the same box with a tinted panel — a missing
 *     image must not change the card's size, or the row stops being parallel
 *
 * DEC-013 (no image, no listing) is why `hasRender` exists at all. All four
 * lines currently pass it; the fallback stays because the fifth line will not.
 */
export async function FamilyCard({
  line,
  className,
}: {
  line: ProductLine;
  className?: string;
}) {
  // 服务端组件：卡片脚注是界面文案（chrome），走字典而非 WordPress 内容。
  const { t } = await getTranslator();

  return (
    <Link
      href={line.href}
      aria-label={`${line.name} — ${line.summary}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-white",
        "transition-[transform,border-color,box-shadow] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-forge hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]",
        "focus-visible:border-forge focus-visible:outline-none",
        className,
      )}
    >
      {/* aspect-4/3 on all four — never `cover`, never a different ratio. */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-hero">
        {line.hasRender ? (
          /* eslint-disable-next-line @next/next/no-img-element -- four fixed
             1024px WebP assets; the optimizer adds nothing for pre-sized art. */
          <img
            src={line.image}
            alt=""
            width={1024}
            height={1024}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          // Same box, same height — a placeholder that changed the geometry
          // would break the parallel row it is standing in for.
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center bg-soft"
          >
            <span className="font-display text-[0.7rem] uppercase tracking-[0.16em] text-steel/60">
              {line.name}
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 lg:p-6">
        {line.subtitle ? (
          <p className="eyebrow !text-forge !text-[0.62rem]">{line.subtitle}</p>
        ) : null}

        <h3 className="mt-2.5 font-display text-[1.05rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
          {line.name}
        </h3>

        <p className="mt-3 text-[0.86rem] leading-relaxed text-steel">
          {line.summary}
        </p>

        {/* mt-auto pins the arrow row to the bottom edge, so all four line up
            even when the summaries wrap to different line counts. */}
        <span className="mt-auto flex items-center gap-2 pt-5 font-display text-[0.72rem] font-700 uppercase tracking-[0.1em] text-forge">
          {t("catalogue.card.explore")}
          <ArrowRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
