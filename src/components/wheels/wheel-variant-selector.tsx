"use client";

import { useMemo, useState } from "react";

import { wheelDetailCopyFor } from "@/lib/i18n/wheel-detail-copy";
import { wheelFinishPendingFor } from "@/lib/i18n/wheel-enquiry-copy";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

import {
  centreBoreLabel,
  offsetLabel,
  pcdLabel,
  sizeLabel,
  type WheelVariantSpec,
} from "./spec-format";

/**
 * WD02 — the recorded production configurations of **one** wheel model.
 *
 * ── One row = one approved `WheelVariant` (spec §3.3, §6) ────────────────────
 * Size, PCD, offset, centre bore and finish are read from a single variant object
 * and can therefore never be recombined into a configuration that is not in the
 * record. There is no per-field `<select>` anywhere, on either layout.
 *
 * ── Desktop table, mobile configuration cards, one data set ─────────────────
 * §6 asks for a table on desktop and `dt/dd` cards on mobile. Both are rendered
 * so that no JavaScript is needed to read the specifications; CSS picks which is
 * displayed. They use **different radio `name`s** on purpose — the same name in
 * one document forms a single radio group, so two mirrored groups would fight
 * over which element ends up checked.
 *
 * ── Selection (spec §6) ─────────────────────────────────────────────────────
 * Nothing is pre-selected when the model has more than one approved variant; the
 * single-variant case is defaulted by the caller and shows as a pre-checked row.
 * Clicking a row selects it, and every radio keeps a real `<label>`.
 *
 * ── >12 variants (spec §6) ──────────────────────────────────────────────────
 * A filter entry appears above the list. It searches **only this model's approved
 * variants** — client-side text over the rows already on the page, never a
 * catalogue-wide search and never a query that can surface another model.
 */

type WheelVariantSelectorProps = {
  locale: Locale;
  model: string;
  variants: WheelVariantSpec[];
  /** `null` until the visitor chooses (multi-variant models start unselected). */
  selectedCode: string | null;
  onSelect: (productionCode: string) => void;
  /** Unique per page instance — keeps radio ids/names stable and collision-free. */
  baseId: string;
  /** Id of the section heading, used as the radiogroup's accessible name. */
  headingId: string;
};

/** Below this count the list fits on one screen and needs no filter. */
const FILTER_THRESHOLD = 12;

type Row = { variant: WheelVariantSpec; index: number };

/**
 * Searchable text for the filter. Built from the **public** spec fields only:
 * the projected variant carries no `finish` at all, so the unpublished finish
 * text can never be echoed back through a match.
 */
function haystack(variant: WheelVariantSpec): string {
  return [
    variant.productionCode,
    variant.size,
    variant.pcd,
    variant.pcdKey,
    variant.offset === null ? "" : String(variant.offset),
    variant.centerBore === null ? "" : String(variant.centerBore),
  ]
    .join(" ")
    .toLowerCase();
}

export function WheelVariantSelector({
  locale,
  model,
  variants,
  selectedCode,
  onSelect,
  baseId,
  headingId,
}: WheelVariantSelectorProps) {
  const copy = wheelDetailCopyFor(locale).configurations;
  const finishNamePending = wheelFinishPendingFor(locale);
  const [query, setQuery] = useState("");
  const filterEnabled = variants.length > FILTER_THRESHOLD;

  const rows = useMemo<Row[]>(() => {
    const all = variants.map((variant, index) => ({ variant, index }));
    const needle = query.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      ({ variant }) =>
        // The selected row stays visible even when it does not match: filtering
        // must never be able to hide what the enquiry is about to carry.
        variant.productionCode === selectedCode || haystack(variant).includes(needle),
    );
  }, [variants, query, selectedCode]);

  const desktopName = `${baseId}-config-desktop`;
  const mobileName = `${baseId}-config-mobile`;
  const desktopId = (index: number) => `${baseId}-config-desktop-${index}`;
  const mobileId = (index: number) => `${baseId}-config-mobile-${index}`;
  const filterId = `${baseId}-config-filter`;

  return (
    <section
      id={headingId}
      aria-labelledby={`${headingId}-title`}
      data-reveal
      className="scroll-mt-[96px] border-b border-border bg-card py-16 lg:py-20"
    >
      <div className="container-fh">
        <h2
          id={`${headingId}-title`}
          className="max-w-[720px] font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
        >
          {copy.heading}
        </h2>
        <p className="mt-4 max-w-[780px] text-[0.98rem] leading-relaxed text-steel">
          {copy.lead}
        </p>

        {/* Filter entry — only once the list is long enough to need one (§6). */}
        {filterEnabled ? (
          <div className="mt-8 max-w-[520px]">
            <label
              htmlFor={filterId}
              className="mb-2.5 block font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-ink"
            >
              {copy.filterLabel}
            </label>
            <div className="flex gap-3">
              <input
                id={filterId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.filterPlaceholder}
                className="min-h-[50px] w-full rounded-lg border border-border bg-card px-4 text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-steel/70 focus:border-forge focus:ring-2 focus:ring-forge/25"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="btn-pill-outline shrink-0 text-ink"
                >
                  {copy.filterClear}
                </button>
              ) : null}
            </div>
            <p aria-live="polite" className="mt-3 text-[0.78rem] text-steel">
              {rows.length === 0
                ? copy.filterEmpty
                : copy.filterCount(rows.length, variants.length)}
            </p>
          </div>
        ) : null}

        {/* Desktop: table (§6). Hidden below `lg` so it is never the element a
            mobile visitor has to scroll sideways. */}
        <div className="mt-8 hidden lg:block">
          <table className="w-full border-collapse text-left text-[0.85rem]">
            <caption className="sr-only">{copy.tableCaption(model)}</caption>
            <thead>
              <tr>
                {[
                  copy.columnSelect,
                  copy.columnProductionCode,
                  copy.columnSize,
                  copy.columnPcd,
                  copy.columnOffset,
                  copy.columnCentreBore,
                  copy.columnFinish,
                ].map((label) => (
                  <th
                    key={label}
                    scope="col"
                    // Held below the site's fixed header (h-[74px] / lg:h-[86px])
                    // so the column headings stay readable while scrolling (§6).
                    className="sticky top-[74px] z-10 border-b border-border bg-card px-4 py-3 font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-steel lg:top-[86px]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ variant, index }) => {
                const selected = variant.productionCode === selectedCode;
                return (
                  <tr
                    key={variant.productionCode}
                    onClick={() => onSelect(variant.productionCode)}
                    className={cn(
                      "cursor-pointer border-b border-border/60 transition-colors",
                      selected ? "bg-forge-soft" : "hover:bg-soft",
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        id={desktopId(index)}
                        type="radio"
                        name={desktopName}
                        value={variant.productionCode}
                        checked={selected}
                        onChange={() => onSelect(variant.productionCode)}
                        className="size-4 accent-forge"
                      />
                      <label htmlFor={desktopId(index)} className="sr-only">
                        {copy.selectRow(variant.productionCode)}
                      </label>
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.82rem] uppercase tracking-[0.04em] text-ink">
                      {variant.productionCode}
                    </td>
                    <td className="px-4 py-3 text-ink/85">{sizeLabel(variant)}</td>
                    <td className="px-4 py-3 text-ink/85">{pcdLabel(variant)}</td>
                    <td className="px-4 py-3 text-ink/85">{offsetLabel(variant)}</td>
                    <td className="px-4 py-3 text-ink/85">{centreBoreLabel(variant)}</td>
                    <td className="px-4 py-3 text-steel">{finishNamePending}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: configuration cards (§6). */}
        <div
          role="radiogroup"
          aria-labelledby={`${headingId}-title`}
          className="mt-8 grid gap-4 lg:hidden"
        >
          {rows.map(({ variant, index }) => {
            const selected = variant.productionCode === selectedCode;
            return (
              <div
                key={variant.productionCode}
                onClick={() => onSelect(variant.productionCode)}
                className={cn(
                  "cursor-pointer rounded-xl border p-4 transition-colors",
                  selected ? "border-forge bg-forge-soft" : "border-border bg-card",
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    id={mobileId(index)}
                    type="radio"
                    name={mobileName}
                    value={variant.productionCode}
                    checked={selected}
                    onChange={() => onSelect(variant.productionCode)}
                    className="size-4 accent-forge"
                  />
                  <label
                    htmlFor={mobileId(index)}
                    className="font-mono text-[0.88rem] uppercase tracking-[0.04em] text-ink"
                  >
                    {variant.productionCode}
                  </label>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[0.8rem]">
                  {[
                    { label: copy.columnSize, value: sizeLabel(variant) },
                    { label: copy.columnPcd, value: pcdLabel(variant) },
                    { label: copy.columnOffset, value: offsetLabel(variant) },
                    { label: copy.columnCentreBore, value: centreBoreLabel(variant) },
                    { label: copy.columnFinish, value: finishNamePending },
                  ].map((row) => (
                    <div key={row.label}>
                      <dt className="font-display text-[0.62rem] font-700 uppercase tracking-[0.14em] text-steel">
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-ink/85">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>

        <p className="mt-8 max-w-[780px] border-l-2 border-forge pl-4 text-[0.86rem] leading-relaxed text-steel">
          {copy.disclosure}
        </p>
      </div>
    </section>
  );
}
