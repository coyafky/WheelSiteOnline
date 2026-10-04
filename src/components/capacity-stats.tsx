import { TriangleAlert } from "lucide-react";
import type { CompanyStat } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * A strip of headline company figures — years, facility, capacity, markets.
 *
 * Shared by `/capabilities` (section ⑤) and `/about` (capability strip), which
 * both render `CompanyStat[]`. Extracted deliberately: two pages using the
 * same shape must not drift into two different number strips.
 *
 * Placeholder discipline: rows flagged `isPlaceholder` render a visible
 * "Placeholder — confirm figures" chip. The component will not quietly render
 * an invented figure as if it were real, and callers should not publish a
 * strip whose rows are all still placeholders.
 *
 * The strip uses the no-image "capability band" form from DESIGN.md §3.1 —
 * hairline borders and an orange underline that slides in on hover, rather
 * than a bordered card.
 */
export function CapacityStats({
  stats,
  tone = "light",
  className,
}: {
  stats: CompanyStat[];
  /** `light` renders on white; `dark` renders on the ink surface. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <div
      data-reveal-group
      className={cn(
        "container-fh-wide grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {stats.map((stat) => (
        <article
          key={stat.index}
          className={cn(
            "group relative min-h-[212px] border-b border-border px-7 py-9 transition-colors sm:px-8 lg:px-9",
            dark ? "hover:bg-white/5" : "hover:bg-soft",
            dark && "border-white/12",
          )}
        >
          <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
            {stat.index}
          </span>
          <p
            className={cn(
              "mt-4 font-display text-[0.72rem] font-700 uppercase tracking-[0.16em]",
              dark ? "text-white/55" : "text-steel",
            )}
          >
            {stat.label}
          </p>
          <p
            className={cn(
              "mt-2 font-display text-[1.24rem] font-800 uppercase leading-tight tracking-[0.01em]",
              dark ? "text-white" : "text-ink",
            )}
          >
            {stat.value}
          </p>
          <p
            className={cn(
              "mt-3 max-w-[300px] text-sm leading-relaxed",
              dark ? "text-white/60" : "text-steel",
            )}
          >
            {stat.body}
          </p>

          {stat.isPlaceholder ? (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-forge/35 bg-forge-soft px-2.5 py-1 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
              <TriangleAlert className="size-3" aria-hidden="true" />
              Placeholder — confirm figures
            </span>
          ) : null}

          <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-forge transition-transform duration-300 ease-out group-hover:scale-x-100" />
        </article>
      ))}
    </div>
  );
}
