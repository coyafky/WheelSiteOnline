import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { InquiryContext } from "@/lib/inquiry/types";

/**
 * `/request-a-quote` carry-over band.
 *
 * Echoes the context that arrived in the URL so the visitor can confirm what
 * we already know before filling the form — "these specs came with you".
 *
 * Two hard rules:
 *   1. Echo only, never infer. It shows exactly the values in the URL and adds
 *      no fitment claims of its own.
 *   2. No context, no bar. A visitor who lands on `/request-a-quote` bare sees
 *      a clean form, not an empty "where you came from" shell. The caller is
 *      responsible for not rendering this when `hasContext()` is false.
 */

/** Human labels for the `selectedSpec` snapshot keys, in display order. */
const SPEC_KEYS = ["size", "pcd", "offset", "centerBore", "finish"] as const;

export function QuoteContextBar({
  context,
  copy,
  specLabels,
}: {
  /** The same context object handed to `<InquiryForm>` — one source of truth. */
  context: InquiryContext;
  copy: {
    eyebrow: string;
    carryOver: string;
    notThis: string;
    changeModel: string;
    changeHref: string;
  };
  specLabels: Record<string, string>;
}) {
  const specs = SPEC_KEYS.flatMap((key) => {
    const value = context.selectedSpec?.[key];
    return value ? [{ label: specLabels[key] ?? key, value }] : [];
  });

  return (
    <section
      data-reveal
      data-inquiry-context
      data-product-line={context.productLine}
      data-inquiry-intent={context.intent}
      data-input-type={context.inputType}
      data-inquiry-source={context.from}
      aria-label={copy.eyebrow}
      className="border-b border-border bg-soft py-10 lg:py-12"
    >
      <div className="container-fh">
        <div className="rounded-xl border border-border bg-white p-6 lg:p-7">
          <p className="eyebrow">{copy.eyebrow}</p>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
            {context.model ? (
              <span className="font-display text-[1.15rem] font-800 uppercase tracking-[-0.01em] text-ink">
                {context.model}
              </span>
            ) : null}

            {specs.length > 0 ? (
              <span className="text-[0.95rem] leading-relaxed text-steel">
                {specs.map((spec, index) => (
                  <span key={spec.label}>
                    {index > 0 ? <span className="mx-1.5 text-border">·</span> : null}
                    <span className="text-steel/70">{spec.label}</span>{" "}
                    <span className="text-ink">{spec.value}</span>
                  </span>
                ))}
              </span>
            ) : null}
          </div>

          <p className="mt-3 flex items-start gap-2.5 text-[0.86rem] leading-relaxed text-steel">
            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            </span>
            <span>{copy.carryOver}</span>
          </p>

          <p className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5 text-[0.84rem] text-steel">
            {copy.notThis}
            <Link
              href={copy.changeHref}
              className="inline-flex items-center gap-1.5 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
            >
              {copy.changeModel}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
