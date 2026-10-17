"use client";

import Link from "next/link";

import {
  wheelDetailEnquiryContext,
} from "@/content/wheel-detail";
import { localizedPath, type Locale } from "@/lib/i18n/types";
import { wheelEnquiryCopyFor, wheelFinishPendingFor } from "@/lib/i18n/wheel-enquiry-copy";

import {
  centreBoreValue,
  offsetValue,
  pcdLabel,
  sizeLabel,
  type WheelVariantSpec,
} from "./spec-format";
import { AddWheelToInquiryButton } from "./inquiry-cart-summary";
import { DirectWheelInquiryDialog } from "./direct-wheel-inquiry-dialog";

/**
 * WD03 — two explicit enquiry intents on the model page (spec §7).
 *
 * "Add to total enquiry" persists the selected configuration for a later
 * multi-item request. "Request this configuration" opens the shared form in an
 * Astryx dialog and submits only this model/configuration.
 *
 * ── What is carried, and what is not trusted ───────────────────────────────
 * Direct mode receives its context explicitly. Everything the client sends is
 * still a hint: the route re-resolves `model + productionCode` against the
 * public catalogue before storing the snapshot.
 *
 * ── No selection is a real state, not a blocked one ────────────────────────
 * Submitting without choosing is allowed and recorded as `variant_pending`, so
 * the reminder above the form is the whole gate.
 */
export function WheelInquiryPanel({
  model,
  selectedVariant,
  headingId,
  locale,
  privacyVersion,
  privacyLinkLabel,
  privacyLinkHref,
}: {
  model: string;
  /** `null` when the visitor has not chosen a configuration yet. */
  selectedVariant: WheelVariantSpec | null;
  headingId: string;
  locale: Locale;
  privacyVersion: string;
  privacyLinkLabel: string;
  privacyLinkHref: string;
}) {
  const copy = wheelEnquiryCopyFor(locale);
  // §12: the same enquiry, reachable without JavaScript. Carries the model and —
  // when one is selected — the production code, so nothing has to be
  // re-explained on arrival (§2.1).
  const fallbackParams = new URLSearchParams({
    model,
    product_line: wheelDetailEnquiryContext.productLine,
    intent: wheelDetailEnquiryContext.intent,
  });
  if (selectedVariant) fallbackParams.set("code", selectedVariant.productionCode);
  const fallbackHref = `${localizedPath("/request-a-quote", locale)}?${fallbackParams.toString()}`;

  const summary = selectedVariant
    ? copy.selectedSummary({
        model,
        productionCode: selectedVariant.productionCode,
        size: sizeLabel(selectedVariant),
        pcd: pcdLabel(selectedVariant),
        offset: offsetValue(selectedVariant),
        centreBore: centreBoreValue(selectedVariant),
        finish: wheelFinishPendingFor(locale),
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

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {selectedVariant ? (
            <div className="rounded-xl border border-border bg-white p-5">
              <p className="text-sm leading-relaxed text-steel">{copy.addToListHelp}</p>
              <div className="mt-4">
                <AddWheelToInquiryButton
                  locale={locale}
                  item={{
                    model,
                    slug: model.toLowerCase(),
                    productionCode: selectedVariant.productionCode,
                    size: selectedVariant.size,
                    pcd: selectedVariant.pcd,
                    offset: selectedVariant.offset,
                    centerBore: selectedVariant.centerBore,
                  }}
                  label={copy.addToListLabel}
                  addedLabel={copy.addedToListLabel}
                />
              </div>
            </div>
          ) : null}
          <div
            className={selectedVariant
              ? "rounded-xl border border-forge/35 bg-forge-soft p-5"
              : "rounded-xl border border-forge/35 bg-forge-soft p-5 md:col-span-2"}
          >
            <p className="text-sm leading-relaxed text-steel">{copy.directHelp}</p>
            <div className="mt-4">
              <DirectWheelInquiryDialog
                key={selectedVariant?.productionCode ?? model}
                model={model}
                productionCode={selectedVariant?.productionCode}
                selectedSummary={summary ?? undefined}
                locale={locale}
                privacyVersion={privacyVersion}
                privacyLinkLabel={privacyLinkLabel}
                privacyLinkHref={privacyLinkHref}
              />
            </div>
          </div>
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
