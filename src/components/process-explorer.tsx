"use client";

import { useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { ProcessStage } from "@/content/types";
import { cn } from "@/lib/utils";

type StageNote = { location: string; guards: string };

/**
 * Interactive manufacturing stage explorer.
 *
 * Deliberately click-driven: a vertical tab list of the stages on one side,
 * the selected stage's detail on the other. Implemented with the WAI-ARIA
 * tabs pattern (`role="tablist"` / `role="tab"` / `role="tabpanel"`), with
 * roving focus via arrow keys and Home/End — clicking a stage selects it,
 * arrow keys move between stages.
 *
 * The selected stage's media area is a numbered CSS panel. `ProcessStage`
 * carries an `image` path, but no photography exists in
 * `public/images/process/` yet, so no `<img>` is rendered and no request is
 * made for a missing file. Drop the assets in and render a `<picture>` layer
 * here once they exist.
 */
export function ProcessExplorer({
  stages,
  notes,
  copy,
}: {
  stages: ProcessStage[];
  /** Per-stage supporting facts, keyed by stage number. */
  notes: Record<string, StageNote>;
  copy: {
    eyebrow: string;
    heading: string;
    lede: string;
    tabListLabel: string;
    panelLabel: string;
  };
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const active = stages[activeIndex];
  const activeNote = notes[active.step];

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;

  /** Focus the tab at `index` and select it. */
  const selectAndFocus = (index: number) => {
    const next = (index + stages.length) % stages.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        selectAndFocus(index + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        selectAndFocus(index - 1);
        break;
      case "Home":
        event.preventDefault();
        selectAndFocus(0);
        break;
      case "End":
        event.preventDefault();
        selectAndFocus(stages.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {/* Heading ------------------------------------------------------------ */}
      <div data-reveal className="max-w-[700px]">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2
          id="explorer-title"
          className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
        >
          {copy.heading}
        </h2>
        <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
          {copy.lede}
        </p>
      </div>

      <div
        data-reveal
        className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-10"
      >
        {/* Stage list ------------------------------------------------------ */}
        <div
          role="tablist"
          aria-label={copy.tabListLabel}
          aria-orientation="vertical"
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-white"
        >
          {stages.map((stage, index) => {
            const selected = index === activeIndex;

            return (
              <button
                key={stage.step}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={tabId(index)}
                aria-selected={selected}
                aria-controls={panelId(index)}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "group flex items-center gap-5 border-b border-border px-6 py-5 text-left transition-colors duration-200 ease-out last:border-b-0",
                  "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forge",
                  selected
                    ? "bg-ink"
                    : "bg-white hover:bg-soft",
                )}
              >
                <span
                  className={cn(
                    "font-display text-[0.86rem] font-800 tracking-[0.08em] transition-colors",
                    selected ? "text-forge" : "text-steel",
                  )}
                >
                  {stage.step}
                </span>

                <span
                  className={cn(
                    "flex-1 font-display text-[1.06rem] font-700 uppercase leading-tight tracking-[0.01em] transition-colors",
                    selected ? "text-white" : "text-ink",
                  )}
                >
                  {stage.title}
                </span>

                {/* Height rail: fills in for the selected stage. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-6 w-[3px] shrink-0 rounded-full transition-colors",
                    selected ? "bg-forge" : "bg-border",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Detail panel ---------------------------------------------------- */}
        <div
          role="tabpanel"
          id={panelId(activeIndex)}
          aria-labelledby={tabId(activeIndex)}
          aria-label={copy.panelLabel}
          tabIndex={0}
          className="overflow-hidden rounded-xl border border-border bg-white outline-none focus-visible:ring-2 focus-visible:ring-forge"
        >
          {/* Numbered CSS panel — stands in for stage photography. */}
          <div
            className="relative flex aspect-[16/8] items-center justify-center overflow-hidden bg-ink"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(194,101,10,0.24)_0%,rgba(11,15,22,0)_62%)]" />
            <div className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_56px)]" />

            <div className="relative flex flex-col items-center">
              <span className="font-display text-[clamp(3.4rem,9vw,5.6rem)] font-800 leading-none tracking-[-0.02em] text-white/22">
                {active.step}
              </span>
              <span className="mt-3 font-display text-[0.68rem] font-700 uppercase tracking-[0.24em] text-white/40">
                Stage photography coming soon
              </span>
            </div>
          </div>

          <div className="p-8 lg:p-10">
            <p className="eyebrow">
              Stage {active.step} of {String(stages.length).padStart(2, "0")}
            </p>

            <h3 className="mt-3 font-display text-[clamp(1.4rem,3.2vw,2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink">
              {active.title}
            </h3>

            <p className="mt-4 max-w-[560px] text-[1rem] leading-relaxed text-steel">
              {active.body}
            </p>

            {activeNote ? (
              <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                <div className="bg-soft px-6 py-5">
                  <dt className="font-display text-[0.68rem] font-700 uppercase tracking-[0.14em] text-steel">
                    Where it happens
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-ink">
                    {activeNote.location}
                  </dd>
                </div>
                <div className="bg-soft px-6 py-5">
                  <dt className="flex items-center gap-2 font-display text-[0.68rem] font-700 uppercase tracking-[0.14em] text-steel">
                    <Check className="size-3.5 text-forge" strokeWidth={3} aria-hidden="true" />
                    What it guards against
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink/80">
                    {activeNote.guards}
                  </dd>
                </div>
              </dl>
            ) : null}

            {/* Explicit controls so the interaction is discoverable without a pointer. */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => selectAndFocus(activeIndex - 1)}
                disabled={stages.length < 2}
                className="btn-pill-outline !min-h-[42px] text-ink disabled:opacity-40"
              >
                Previous stage
              </button>
              <button
                type="button"
                onClick={() => selectAndFocus(activeIndex + 1)}
                disabled={stages.length < 2}
                className="btn-pill-solid !min-h-[42px] disabled:opacity-40"
              >
                Next stage
              </button>

              <p className="ml-auto font-display text-[0.68rem] font-700 uppercase tracking-[0.14em] text-steel">
                Use ← → or ↑ ↓ to move
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
