import { Check, X } from "lucide-react";
import type { PositioningPoint } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * "Which side of the line are you on?" — an explicit mis-match filter.
 *
 * The negative case is rendered first and on equal footing with the positive
 * one. That ordering is the whole point: for project-based work the cost of a
 * bad match is asymmetric (a drawing can travel through a full engineering
 * evaluation before anyone discovers it cannot be made), so turning the wrong
 * visitor away early is worth more than one more enquiry.
 *
 * A page using this must not also carry a "whatever your requirement, we can
 * meet it" line — the two statements cancel each other out and the filter
 * stops working.
 */
export function SelfIdentifyBlock({
  negative,
  positiveHeading,
  positives,
  className,
}: {
  /** The explicit mis-match. Rendered first. */
  negative: { title: string; body: string };
  positiveHeading: string;
  positives: PositioningPoint[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10", className)}>
      <div className="rounded-xl border border-border bg-white/60 p-8">
        <p className="eyebrow !text-steel">Not a match</p>
        <div className="mt-6 flex items-start gap-4">
          <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-steel">
            <X className="size-3.5" strokeWidth={3} aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-[1.08rem] font-700 uppercase leading-snug tracking-[0.01em] text-ink">
              {negative.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              {negative.body}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-forge/30 bg-white p-8">
        <p className="eyebrow">{positiveHeading}</p>

        <ul data-reveal-group className="mt-7 grid gap-7">
          {positives.map((point) => (
            <li key={point.title} className="flex items-start gap-4">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge text-white">
                <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-[1.08rem] font-700 uppercase leading-snug tracking-[0.01em] text-ink">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">
                  {point.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
