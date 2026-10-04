import type { FaqEntry } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The FAQ list used by every capability-line page.
 *
 * Built on native `<details>` / `<summary>` rather than a controlled React
 * accordion. That is intentional: these pages are server components with no
 * client state, the disclosure behaviour is exactly what the platform element
 * provides, and it keeps working with JavaScript disabled — the same
 * fail-visible reasoning DESIGN.md §1.5 records for the reveal animation.
 *
 * There is no "to be updated" placeholder entry. An unanswered question is
 * omitted at the data layer and acknowledged with a `<DataNotice>` instead,
 * because a FAQ slot that says "coming soon" advertises the gap without
 * closing it.
 */
export function FaqAccordion({
  entries,
  eyebrow,
  heading,
  headingId,
  lede,
  defaultOpenIndex = 0,
  className,
}: {
  entries: FaqEntry[];
  eyebrow?: string;
  heading: string;
  /** Lets a section use `aria-labelledby` pointing at this heading. */
  headingId?: string;
  lede?: string;
  /** Index opened by default. Pass -1 to open nothing. */
  defaultOpenIndex?: number;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div className="max-w-[720px]">
        <p className="eyebrow">{eyebrow ?? "Reference"}</p>
        <h2
          id={headingId}
          className="mt-4 scroll-mt-[120px] font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
        >
          {heading}
        </h2>
        {lede ? (
          <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">{lede}</p>
        ) : null}
      </div>

      <div className="mt-10 max-w-[720px] divide-y divide-border border-y border-border">
        {entries.map((entry, index) => (
          <details
            key={entry.question}
            open={index === defaultOpenIndex}
            className="group py-2"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 marker:content-none">
              <h3 className="font-display text-[1.1rem] font-700 uppercase leading-snug tracking-[0.01em] text-ink transition-colors group-hover:text-forge">
                {entry.question}
              </h3>
              <span
                aria-hidden="true"
                className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-display text-[0.9rem] font-700 leading-none text-steel transition-[transform,border-color,color] duration-200 ease-out group-open:rotate-45 group-open:border-forge group-open:text-forge"
              >
                +
              </span>
            </summary>
            <p className="pb-5 pr-11 text-[0.96rem] leading-relaxed text-steel">
              {entry.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
