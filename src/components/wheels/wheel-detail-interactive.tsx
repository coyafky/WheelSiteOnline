"use client";

import { useEffect, useId, useState } from "react";

import {
  WHEEL_DETAIL_CONFIGURATION_ANCHOR,
  wheelDetailEnquiryContext,
} from "@/content/wheel-detail";

import type { WheelVariantSpec } from "./spec-format";
import { WheelInquiryPanel } from "./wheel-inquiry-panel";
import { WheelVariantSelector } from "./wheel-variant-selector";

/**
 * WD02 + WD03 — the one piece of the detail page that holds state.
 *
 * ── Why the selection lives in the URL, under two query keys ────────────────
 * §6 specifies `?variant={productionCode}` as the way to link to, refresh into
 * and return to a recorded configuration. The shared enquiry form, however,
 * reads its context from the query string it is submitted on and looks for
 * `code` / `model` / `product_line` / `intent`. Writing both keeps one URL that
 * satisfies §6 *and* lets the shared form carry `model + productionCode` without
 * a second form implementation. Both keys always hold the same value, and both
 * are rewritten from the resolved selection, so a hand-edited URL cannot leave
 * the page showing one configuration while the enquiry names another.
 *
 * ── Why `replaceState` rather than a router navigation ─────────────────────
 * Choosing a radio option is a sub-second interaction, not a page change; the
 * query string exists so that a reload — and the enquiry form — can see it. The
 * value is validated on load and again when the enquiry is resolved server-side,
 * so a stale history entry can never become an order fact.
 *
 * The rest of the context — the specification snapshot, destination market,
 * language and timestamp — is re-resolved from `model + productionCode`. Nothing
 * the client sends here is trusted as an order fact.
 */

const ENQUIRY_SECTION_ID = "wheel-enquiry";

export function WheelDetailInteractive({
  model,
  variants,
  initialSelectedCode,
}: {
  model: string;
  /** Already projected for the browser — the raw source `finish` is not sent. */
  variants: WheelVariantSpec[];
  /**
   * Server-validated `?variant=` (or `?code=`) value. `null` for a multi-variant
   * model with no valid selection — the visitor is never pre-decided for (§6).
   */
  initialSelectedCode: string | null;
}) {
  const baseId = useId();
  const [selectedCode, setSelectedCode] = useState<string | null>(initialSelectedCode);

  const selectedVariant =
    variants.find((variant) => variant.productionCode === selectedCode) ?? null;

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("model", model);
    params.set("product_line", wheelDetailEnquiryContext.productLine);
    params.set("intent", wheelDetailEnquiryContext.intent);
    if (selectedCode) {
      params.set("variant", selectedCode);
      params.set("code", selectedCode);
    }

    const next = `${window.location.pathname}?${params.toString()}`;
    // Rewriting on mount is deliberate: it *cleans* a stale or illegal `variant`
    // and seeds the model context the enquiry form reads (§6).
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [model, selectedCode]);

  return (
    <>
      <WheelVariantSelector
        variants={variants}
        selectedCode={selectedCode}
        onSelect={setSelectedCode}
        baseId={baseId}
        headingId={WHEEL_DETAIL_CONFIGURATION_ANCHOR}
      />
      <WheelInquiryPanel
        model={model}
        selectedVariant={selectedVariant}
        headingId={ENQUIRY_SECTION_ID}
      />
    </>
  );
}
