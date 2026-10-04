import { Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The standing provenance line on every page that publishes technical data.
 *
 * Two jobs, one component:
 *
 *  1. `tone="pending"` states that a specific set of figures is still being
 *     confirmed. It is the honest counterpart to a missing row — the
 *     alternative, a vague "in line with industry standards", is exactly the
 *     fudge these pages are written to avoid.
 *
 *  2. `tone="reference"` states where a published figure comes from and on
 *     what conditions (test reports available on request, standards cited as
 *     reference rather than as certification).
 *
 * This is not decoration. On a B2B page read by engineers, a number without a
 * provenance line reads as marketing, and a missing number without an
 * explanation reads as evasion.
 */
export function DataNotice({
  children,
  tone = "reference",
  label,
  className,
}: {
  children: React.ReactNode;
  /** `pending` = unconfirmed data; `reference` = provenance of published data. */
  tone?: "pending" | "reference";
  /** Optional short lead-in chip, e.g. "Pending confirmation". */
  label?: string;
  className?: string;
}) {
  const pending = tone === "pending";
  const Icon = pending ? TriangleAlert : Info;

  return (
    <p
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-5 py-4 text-sm leading-relaxed",
        pending
          ? "border-forge/30 bg-forge-soft text-ink/80"
          : "border-border bg-soft text-steel",
        className,
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          pending ? "text-forge-deep" : "text-steel",
        )}
        aria-hidden="true"
      />
      <span>
        {label ? (
          <span
            className={cn(
              "font-display text-[0.68rem] font-700 uppercase tracking-[0.16em]",
              pending ? "text-forge-deep" : "text-steel",
            )}
          >
            {label} —{" "}
          </span>
        ) : null}
        {children}
      </span>
    </p>
  );
}
