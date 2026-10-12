"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@/theme/fenghuai-neutral/neutral";
import { cn } from "@/lib/utils";
import {
  backspaceMm,
  computeOffset,
  frontspaceMm,
  type WheelInput,
} from "@/lib/wheels/offset-calculator";

/**
 * Wheel offset calculator.
 *
 * ── The model ───────────────────────────────────────────────────────────────
 * A wheel is treated as a box: a width (inches) and a diameter (inches), with a
 * mounting face whose position is set by the offset (ET, mm). Everything the
 * tool reports is derived from where that box's two edges land, relative to
 * the hub, compared against the original wheel.
 *
 *   backspace(mm)  = (width_in × 25.4) / 2 + offset_mm
 *   frontspace(mm) = (width_in × 25.4) / 2 − offset_mm
 *
 *   backspace  = distance from the mounting face to the INNER edge
 *   frontspace = distance from the mounting face to the OUTER edge
 *
 * The change between two wheels is then a straight subtraction, plus half the
 * diameter change on each edge (a larger wheel reaches further in every
 * direction from the hub, regardless of offset):
 *
 *   innerChange(mm)  = (newBackspace − oldBackspace) + (newDiameter − oldDiameter) × 25.4 / 2
 *   outerChange(mm)  = (newFrontspace − oldFrontspace) + (newDiameter − oldDiameter) × 25.4 / 2
 *
 * A positive innerChange means the inner edge moves further into the car —
 * LESS clearance. A positive outerChange means more poke.
 *
 * ── What it deliberately does not model ─────────────────────────────────────
 * Brake caliper shape and spoke clearance, suspension travel under
 * compression, camber, arch and liner clearance, and load rating. Those are
 * confirmed by Fenghuai per order. This is a planning aid and the UI says so.
 */

type WheelDraft = {
  width: number | null;
  offset: number | null;
  diameter: number | null;
};

type Preset = {
  label: string;
  note: string;
  original: WheelInput;
  replacement: WheelInput;
};

/**
 * ILLUSTRATIVE presets.
 *
 * These are round numbers chosen to demonstrate the arithmetic, NOT any
 * vehicle's stock specification. No stock offset is published anywhere on
 * this site as verified fact.
 */
const PRESETS: Preset[] = [
  {
    label: "Wider, same offset",
    note: "8.0J ET35 → 9.0J ET35, 18\" both",
    original: { width: 8, offset: 35, diameter: 18 },
    replacement: { width: 9, offset: 35, diameter: 18 },
  },
  {
    label: "Same width, lower offset",
    note: "9.0J ET45 → 9.0J ET30, 19\" both",
    original: { width: 9, offset: 45, diameter: 19 },
    replacement: { width: 9, offset: 30, diameter: 19 },
  },
  {
    label: "Plus-size, wider",
    note: "8.5J ET40 19\" → 9.5J ET35 20\"",
    original: { width: 8.5, offset: 40, diameter: 19 },
    replacement: { width: 9.5, offset: 35, diameter: 20 },
  },
  {
    label: "Deep-dish conversion",
    note: "10.0J ET40 → 11.0J ET15, 20\" both",
    original: { width: 10, offset: 40, diameter: 20 },
    replacement: { width: 11, offset: 15, diameter: 20 },
  },
];

const DEFAULTS: { original: WheelDraft; replacement: WheelDraft } = {
  original: { width: 8, offset: 35, diameter: 18 },
  replacement: { width: 9, offset: 35, diameter: 18 },
};

function committedWheel(wheel: WheelDraft): WheelInput {
  return {
    width: wheel.width ?? Number.NaN,
    offset: wheel.offset ?? Number.NaN,
    diameter: wheel.diameter ?? Number.NaN,
  };
}

/** Signed millimetre figure, always with a sign so direction is unambiguous. */
function signed(value: number, digits = 1): string {
  const rounded = Number(value.toFixed(digits));
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "±";
  return `${sign}${Math.abs(rounded)} mm`;
}

/** Plain-language read of the inner-edge change. */
function describeInner(change: number): string {
  if (Math.abs(change) < 0.05) {
    return "Inner clearance stays the same as the original wheel.";
  }
  if (change > 0) {
    return `Inner edge moves ${Math.abs(change).toFixed(1)} mm further in — that much less room before it reaches the strut, arm or caliper.`;
  }
  return `Inner edge moves ${Math.abs(change).toFixed(1)} mm further out — that much more inboard clearance than the original.`;
}

/** Plain-language read of the outer-edge change. */
function describeOuter(change: number): string {
  if (Math.abs(change) < 0.05) {
    return "Outer edge sits where the original sits — no additional poke.";
  }
  if (change > 0) {
    return `Outer edge moves ${Math.abs(change).toFixed(1)} mm further out — more poke, and that much less arch clearance.`;
  }
  return `Outer edge tucks ${Math.abs(change).toFixed(1)} mm further in — less poke than the original.`;
}

export function OffsetCalculator() {
  const [original, setOriginal] = useState<WheelDraft>(DEFAULTS.original);
  const [replacement, setReplacement] = useState<WheelDraft>(
    DEFAULTS.replacement,
  );
  const [preset, setPreset] = useState<string | null>(null);

  const result = useMemo(
    () => computeOffset(committedWheel(original), committedWheel(replacement)),
    [original, replacement],
  );

  const applyPreset = (item: Preset) => {
    setOriginal(item.original);
    setReplacement(item.replacement);
    setPreset(item.label);
  };

  const reset = () => {
    setOriginal(DEFAULTS.original);
    setReplacement(DEFAULTS.replacement);
    setPreset(null);
  };

  return (
    <Theme theme={neutralTheme} mode="light">
      <div className="grid gap-8">
      {/* Presets ---------------------------------------------------------- */}
      <div>
        <p className="font-display text-[0.7rem] font-700 uppercase tracking-[0.16em] text-steel">
          Start from an illustrative preset
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {PRESETS.map((item) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={preset === item.label}
              onClick={() => applyPreset(item)}
              className={cn(
                "inline-flex min-h-[42px] flex-col items-start justify-center gap-0.5 rounded-full border px-4 py-2 text-left",
                "transition-[background,color,border-color] duration-200 ease-out",
                preset === item.label
                  ? "border-forge bg-forge text-white"
                  : "border-border bg-white text-ink hover:border-forge hover:text-forge",
              )}
            >
              <span className="font-display text-[0.68rem] font-700 uppercase tracking-[0.1em]">
                {item.label}
              </span>
              {/*
                The note is deliberately visible, not a tooltip: the preset
                values must always read as illustrative.
              */}
              <span
                className={cn(
                  "text-[0.68rem]",
                  preset === item.label ? "text-white/80" : "text-steel",
                )}
              >
                {item.note}
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-dashed border-border px-4 font-display text-[0.68rem] font-700 uppercase tracking-[0.1em] text-steel transition-colors hover:border-forge hover:text-forge"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-steel">
          Presets are made-up round numbers used to demonstrate the arithmetic.
          They are not any vehicle&apos;s actual factory specification.
        </p>
      </div>

      {/* Inputs ----------------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-2">
        <WheelFieldset
          legend="Original wheel"
          caption="The wheel you have now"
          wheel={original}
          onChange={setOriginal}
          accent={false}
        />
        <WheelFieldset
          legend="Replacement wheel"
          caption="The wheel you are considering"
          wheel={replacement}
          onChange={setReplacement}
          accent
        />
      </div>

      {/* Results ---------------------------------------------------------- */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="rounded-xl border border-border bg-soft p-7"
      >
        {result.valid ? (
          <>
            <p className="font-display text-[0.7rem] font-700 uppercase tracking-[0.16em] text-steel">
              Result
            </p>

            <dl className="mt-5 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
              <ResultCell
                label="Inner clearance change"
                value={signed(result.innerChange)}
                tone={result.innerChange > 0.05 ? "tight" : "room"}
              />
              <ResultCell
                label="Outer poke change"
                value={signed(result.outerChange)}
                tone={result.outerChange > 0.05 ? "room" : "tight"}
              />
              <ResultCell
                label="Diameter change"
                value={`${result.diameterChange > 0 ? "+" : ""}${result.diameterChange.toFixed(1)} in`}
                tone="neutral"
              />
            </dl>

            <div className="mt-5 grid gap-3 text-sm leading-relaxed text-ink/80">
              <p>{describeInner(result.innerChange)}</p>
              <p>{describeOuter(result.outerChange)}</p>
            </div>

            <details className="mt-5 rounded-lg border border-border bg-white p-5">
              <summary className="cursor-pointer font-display text-[0.7rem] font-700 uppercase tracking-[0.14em] text-steel">
                Working, in millimetres
              </summary>
              <dl className="mt-4 grid gap-2.5 font-mono text-[0.78rem] text-steel">
                <div className="flex justify-between gap-4">
                  <dt>Original backspace</dt>
                  <dd>{result.oldBackspace.toFixed(1)} mm</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Replacement backspace</dt>
                  <dd>{result.newBackspace.toFixed(1)} mm</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Original frontspace</dt>
                  <dd>{result.oldFrontspace.toFixed(1)} mm</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Replacement frontspace</dt>
                  <dd>{result.newFrontspace.toFixed(1)} mm</dd>
                </div>
              </dl>
            </details>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-steel">
            Enter a width greater than zero for both wheels to see a result.
          </p>
        )}
      </div>

      <p className="text-xs leading-relaxed text-steel">
        Planning aid only. Brake caliper shape, suspension travel, camber, arch
        clearance and load rating are confirmed by Fenghuai against your
        vehicle before an order is cut.
      </p>
      </div>
    </Theme>
  );
}

/** One wheel's three inputs, as a labelled fieldset. */
function WheelFieldset({
  legend,
  caption,
  wheel,
  onChange,
  accent,
}: {
  legend: string;
  caption: string;
  wheel: WheelDraft;
  onChange: (wheel: WheelDraft) => void;
  accent: boolean;
}) {
  return (
    <fieldset
      className={cn(
        "rounded-xl border bg-white p-7",
        accent ? "border-forge/40" : "border-border",
      )}
    >
      <legend className="px-1 font-display text-[0.78rem] font-700 uppercase tracking-[0.14em] text-ink">
        {legend}
      </legend>
      <p className="mt-1 text-xs text-steel">{caption}</p>

      <div className="mt-5 grid gap-4">
        <NumberField
          label={`${legend} width`}
          suffix="inches"
          min={4}
          max={16}
          step={0.5}
          value={wheel.width}
          onChange={(width) => onChange({ ...wheel, width })}
        />
        <NumberField
          label={`${legend} offset`}
          suffix="mm"
          min={-80}
          max={100}
          step={1}
          value={wheel.offset}
          onChange={(offset) => onChange({ ...wheel, offset })}
        />
        <NumberField
          label={`${legend} diameter`}
          suffix="inches"
          min={13}
          max={26}
          step={1}
          value={wheel.diameter}
          onChange={(diameter) => onChange({ ...wheel, diameter })}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div>
          <dt className="font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-steel">
            Backspace
          </dt>
          <dd className="mt-1 font-mono text-[0.82rem] text-ink">
            {formatDistance(backspaceMm(committedWheel(wheel)))}
          </dd>
        </div>
        <div>
          <dt className="font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-steel">
            Frontspace
          </dt>
          <dd className="mt-1 font-mono text-[0.82rem] text-ink">
            {formatDistance(frontspaceMm(committedWheel(wheel)))}
          </dd>
        </div>
      </dl>
    </fieldset>
  );
}

/** A numeric input with a real label and a unit suffix. */
function NumberField({
  label,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number | null;
  min: number;
  max: number;
  step: number;
  onChange: (value: number | null) => void;
}) {
  return (
    <NumberInput
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      units={suffix}
      width="100%"
      size="lg"
      hasClear
      hasNumberSteppers
      onChange={onChange}
    />
  );
}

function formatDistance(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(1)} mm` : "—";
}

/** One headline result cell. */
function ResultCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "tight" | "room" | "neutral";
}) {
  const toneClass =
    tone === "tight"
      ? "text-forge-deep"
      : tone === "room"
        ? "text-ink"
        : "text-steel";

  return (
    <div className="bg-white px-5 py-5">
      <dt className="font-display text-[0.62rem] font-700 uppercase tracking-[0.12em] text-steel">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-2 font-display text-[1.5rem] font-800 leading-none tracking-[0.01em]",
          toneClass,
        )}
      >
        {value}
      </dd>
    </div>
  );
}
