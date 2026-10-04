import type { FlowStep } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * A horizontal row of numbered process steps.
 *
 * Shared by the homepage (④ compact, 4 steps) and `/custom-development`
 * (③ roomy, 5 steps). The component never hard-codes a step count or a column
 * count — callers pass `steps` and choose a density.
 *
 * Uses the `gap-as-border` technique from DESIGN.md §3.4: a single `gap-px`
 * grid over a `bg-border` backdrop paints 1px separators without per-cell
 * borders, so the row reads as one ruled band rather than a set of cards.
 */
export function FlowStepRow({
  steps,
  density = "roomy",
  columns = "auto",
  className,
}: {
  steps: FlowStep[];
  /** `compact` tightens padding and type for dense homepage use. */
  density?: "compact" | "roomy";
  /** Fixed column count at `lg`, or `auto` to cap at the step count. */
  columns?: 3 | 4 | 5 | "auto";
  className?: string;
}) {
  const compact = density === "compact";

  // `auto` never invents columns we do not have data for.
  const lgColumnClass: Record<number, string> = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
  };
  const resolvedColumns =
    columns === "auto" ? Math.min(steps.length, 5) : columns;
  const lgColumns =
    lgColumnClass[resolvedColumns] ??
    (resolvedColumns >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-3");

  return (
    <ol
      data-reveal-group
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border",
        steps.length > 1 && "sm:grid-cols-2",
        lgColumns,
        className,
      )}
    >
      {steps.map((step) => (
        <li
          key={step.step}
          className={cn(
            "flex flex-col bg-white transition-colors hover:bg-forge-soft",
            compact ? "p-6" : "p-7",
          )}
        >
          <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
            {step.step}
          </span>
          <h3
            className={cn(
              "mt-4 font-display font-700 uppercase leading-tight tracking-[0.01em] text-ink",
              compact ? "text-[1.05rem]" : "text-[1.16rem]",
            )}
          >
            {step.title}
          </h3>
          <p
            className={cn(
              "mt-3 flex-1 leading-relaxed text-steel",
              compact ? "text-[0.86rem]" : "text-sm",
            )}
          >
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
