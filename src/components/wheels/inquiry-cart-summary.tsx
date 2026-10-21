"use client";

import { useState } from "react";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { useToast } from "@astryxdesign/core/Toast";

import { inquiryCartCopyFor } from "@/lib/i18n/inquiry-cart-copy";
import type { Locale } from "@/lib/i18n/types";

import {
  addInquiryCartItem,
  clearInquiryCart,
  MAX_INQUIRY_ITEMS,
  readInquiryCart,
  removeInquiryCartItem,
  setInquiryCartQuantity,
  useInquiryCart,
  type InquiryCartItem,
} from "@/lib/wheels/inquiry-cart";

function displaySpec(item: InquiryCartItem): string {
  return [item.size.replace(/\*/g, "×"), item.pcd.replace(/x/g, "×"), item.offset === null ? "" : `ET ${item.offset}`]
    .filter(Boolean)
    .join(" · ");
}

export function AddWheelToInquiryButton({
  item,
  locale = "en",
  label,
  addedLabel,
}: {
  item: Omit<InquiryCartItem, "quantity">;
  locale?: Locale;
  label?: string;
  addedLabel?: string;
}) {
  const copy = inquiryCartCopyFor(locale);
  const [added, setAdded] = useState(false);
  const showToast = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        const existing = readInquiryCart().some(
          (candidate) => candidate.productionCode === item.productionCode,
        );
        addInquiryCartItem(item);
        const saved = readInquiryCart().find(
          (candidate) => candidate.productionCode === item.productionCode,
        );

        if (!saved) {
          showToast({
            body: copy.fullToast,
            type: "error",
            uniqueID: "inquiry-cart-full",
          });
          return;
        }

        showToast({
          body: existing
            ? copy.quantityUpdatedToast(item.model, item.productionCode, saved.quantity)
            : copy.addedToast(item.model, item.productionCode),
          uniqueID: `inquiry-cart-${item.productionCode}`,
          collisionBehavior: "overwrite",
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      className="inline-flex min-h-10 items-center justify-center rounded-full bg-forge px-4 font-display text-[0.68rem] font-700 uppercase tracking-[0.12em] text-white transition-colors hover:bg-forge-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forge"
    >
      {added ? addedLabel ?? copy.addedLabel : label ?? copy.addLabel}
    </button>
  );
}

export function InquiryCartSummary({ locale = "en" }: { locale?: Locale }) {
  const items = useInquiryCart();
  if (items.length === 0) return null;
  const copy = inquiryCartCopyFor(locale);

  return (
    <section
      aria-labelledby="inquiry-cart-title"
      className="mb-8 rounded-xl border border-forge/35 bg-forge-soft p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.68rem] font-700 uppercase tracking-[0.14em] text-forge">
            {copy.listTitle}
          </p>
          <h3 id="inquiry-cart-title" className="mt-1 font-display text-xl font-800 uppercase text-ink">
            {copy.selectedCount(items.length, MAX_INQUIRY_ITEMS)}
          </h3>
        </div>
        <button
          type="button"
          onClick={clearInquiryCart}
          className="text-[0.75rem] font-700 uppercase tracking-[0.1em] text-steel underline underline-offset-4 hover:text-forge"
        >
          {copy.clear}
        </button>
      </div>

      <ul className="mt-5 divide-y divide-forge/15" aria-label={copy.selectedAria}>
        {items.map((item) => (
          <li key={`${item.model}-${item.productionCode}`} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-800 uppercase text-ink">{item.model}</p>
              <p className="font-mono text-xs text-steel">{item.productionCode} · {displaySpec(item)}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-700 uppercase tracking-[0.08em] text-steel">
              <span aria-hidden="true">{copy.quantity}</span>
              <NumberInput
                label={copy.quantityAria(item.model, item.productionCode)}
                isLabelHidden
                min={1}
                step={1}
                isIntegerOnly
                hasNumberSteppers
                value={item.quantity}
                width={104}
                onChange={(quantity) => setInquiryCartQuantity(item.productionCode, quantity)}
              />
            </div>
            <button
              type="button"
              onClick={() => removeInquiryCartItem(item.productionCode)}
              aria-label={copy.removeAria(item.model, item.productionCode)}
              className="text-xs font-700 uppercase tracking-[0.08em] text-steel underline underline-offset-4 hover:text-forge"
            >
              {copy.remove}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
