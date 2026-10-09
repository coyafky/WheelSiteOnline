"use client";

import Link from "next/link";

import { InquiryForm } from "@/components/inquiry-form";
import {
  finishNamePending,
  wheelDetailEnquiry as copy,
  wheelDetailEnquiryContext,
  wheelDetailFormCopy,
} from "@/content/wheel-detail";

import {
  centreBoreValue,
  offsetValue,
  pcdLabel,
  sizeLabel,
  type WheelVariantSpec,
} from "./spec-format";

/**
 * WD03 — the enquiry, embedded in the model page (spec §7).
 *
 * ── Why it renders the shared form instead of its own ───────────────────────
 * §7 requires one validation path, one `/api/inquiries` contract, one consent
 * line and one error handling. This block therefore *embeds* `<InquiryForm>`; it
 * restates none of it and adds no second Email/WhatsApp route.
 *
 * ── What is carried, and what is not trusted ───────────────────────────────
 * The form captures its context from the URL query at submit time. The parent
 * `WheelDetailInteractive` keeps `model`, `code`/`variant`, `product_line` and
 * `intent` in that query, so the enquiry arrives already pointing at
 * `model + productionCode`. Everything the client sends is a *hint*: the route
 * re-resolves the pair against the public catalogue and stores that snapshot — a
 * visitor editing the URL cannot manufacture a configuration (spec §7).
 *
 * ── No selection is a real state, not a blocked one ────────────────────────
 * Submitting without choosing is allowed and recorded as `variant_pending`, so
 * the reminder above the form is the whole gate.
 */
export function WheelInquiryPanel({
  model,
  selectedVariant,
  headingId,
}: {
  model: string;
  /** `null` when the visitor has not chosen a configuration yet. */
  selectedVariant: WheelVariantSpec | null;
  headingId: string;
}) {
  // §12: the same enquiry, reachable without JavaScript. Carries the model and —
  // when one is selected — the production code, so nothing has to be
  // re-explained on arrival (§2.1).
  const fallbackParams = new URLSearchParams({
    model,
    product_line: wheelDetailEnquiryContext.productLine,
    intent: wheelDetailEnquiryContext.intent,
  });
  if (selectedVariant) fallbackParams.set("code", selectedVariant.productionCode);
  const fallbackHref = `/request-a-quote?${fallbackParams.toString()}`;

  const summary = selectedVariant
    ? copy.selectedSummary({
        model,
        productionCode: selectedVariant.productionCode,
        size: sizeLabel(selectedVariant),
        pcd: pcdLabel(selectedVariant),
        offset: offsetValue(selectedVariant),
        centreBore: centreBoreValue(selectedVariant),
        finish: finishNamePending,
      })
    : null;

  return (
    <section
      id={headingId}
      aria-labelledby={`${headingId}-title`}
      data-reveal
      className="scroll-mt-[96px] border-b border-border bg-soft py-16 lg:py-20"
    >
      <div className="container-fh">
        <h2
          id={`${headingId}-title`}
          className="max-w-[720px] font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
        >
          {copy.heading}
        </h2>

        {/* Echo of the attached configuration — the answer to "which one am I
            asking about" (§1). Announced politely as the selection changes. */}
        <div aria-live="polite" className="mt-5">
          {summary ? (
            <p className="rounded-lg border border-forge/35 bg-forge-soft px-5 py-4">
              <span className="font-display text-[0.64rem] font-700 uppercase tracking-[0.14em] text-steel">
                {copy.selectedLabel}
              </span>
              <span className="mt-1.5 block font-mono text-[0.86rem] leading-relaxed text-ink">
                {summary}
              </span>
            </p>
          ) : (
            <p className="max-w-[720px] text-[0.95rem] leading-relaxed text-steel">
              {copy.noSelection}
            </p>
          )}
        </div>

        <div className="mt-8">
          <InquiryForm copy={wheelDetailFormCopy} />
        </div>

        <p className="mt-5 text-[0.8rem] leading-relaxed text-steel">
          {copy.fallbackNote}{" "}
          <Link
            href={fallbackHref}
            className="underline decoration-border underline-offset-4 transition-colors hover:text-forge"
          >
            {copy.fallbackLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
