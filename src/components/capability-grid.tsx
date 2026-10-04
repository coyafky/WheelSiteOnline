import type { Capability } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * A grid of numbered capability cards.
 *
 * Shared by all three capability-line pages:
 *   - `/products/ev-components`   §⑤ five casting / joining capabilities
 *   - `/products/custom-aluminum` §⑤ six making capabilities
 *   - `/products/safety-tires`    §⑤ four validation capabilities
 *
 * The card count is never hard-coded; `columns` is a hint, and the grid falls
 * back to a count that divides evenly so a five-card set never leaves a
 * phantom grey cell (DESIGN.md §3.3 — column count follows the content).
 *
 * `highlightLast` marks the final card as a technical standout. It is used
 * once, on the EV page, for "sand-core spiral cooling channels": the claim
 * that lifts a housing supplier above a generic catalogue. Keep it rare —
 * highlighting every card highlights none.
 */
export function CapabilityGrid({
  capabilities,
  columns,
  highlightLast = false,
  className,
}: {
  capabilities: Capability[];
  /** Preferred column count at `lg`. Defaults to the largest fit ≤ 3. */
  columns?: 2 | 3 | 4;
  /** Render the final card on the accent surface. */
  highlightLast?: boolean;
  className?: string;
}) {
  const lgColumns =
    columns ??
    (capabilities.length >= 3 ? 3 : capabilities.length === 2 ? 2 : 1);

  const lgColumnClass: Record<number, string> = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  return (
    <div
      data-reveal-group
      className={cn(
        "grid grid-cols-1 items-stretch gap-6",
        capabilities.length > 1 && "sm:grid-cols-2",
        lgColumnClass[lgColumns],
        className,
      )}
    >
      {capabilities.map((capability, index) => {
        const highlighted = highlightLast && index === capabilities.length - 1;

        return (
          <article
            key={capability.index}
            className={cn(
              "flex flex-col rounded-xl border p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5",
              highlighted
                ? "border-forge/35 bg-forge-soft hover:border-forge"
                : "border-border bg-white hover:border-forge",
            )}
          >
            <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
              {capability.index}
            </span>
            <h3 className="mt-4 font-display text-[1.24rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
              {capability.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
              {capability.body}
            </p>

            {highlighted ? (
              <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-forge/35 bg-white px-2.5 py-1 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                Technical highlight
              </span>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
