import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, TriangleAlert } from "lucide-react";
import {
  processExplorerCopy,
  processHardEvidence,
  processHero,
  processQuality,
  processQualityBoundary,
  processStageNotes,
  processStages,
} from "@/content/process";
import {
  materials,
  materialsCopy,
  materialsOpenItems,
  type MaterialEntry,
} from "@/content/materials";
import { capacityStats } from "@/content/company-stats";
import { ProcessExplorer } from "@/components/process-explorer";
import { CapacityStats } from "@/components/capacity-stats";
import { PageHero } from "@/components/sections/page-hero";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  // ⚠️ Do NOT put "Fenghuai" in this string — `layout.tsx` appends
  // "| Fenghuai" via the title template, so it would render twice.
  title: "Manufacturing Capabilities & Quality Control",
  description:
    "The processes on Fenghuai's floor, the materials the lines run, the inspection every order clears and the capacity behind them — the factory seen as a tool rather than a story.",
};

/**
 * Capabilities page (`/capabilities`).
 *
 * The former `/manufacturing` route, renamed and re-scoped: this is the
 * full-plant capability and quality overview a procurement reader uses to
 * judge the factory, not a single-product walkthrough. `/manufacturing` now
 * redirects here.
 *
 * Six sections, per the page spec:
 *   ① hero            — what the plant can make
 *   ② process explorer — the six production stages (shared, interactive)
 *   ③ materials       — what the lines are set up to run
 *   ④ quality         — inspection stages, standards and tolerances
 *   ⑤ capacity        — headline figures (every one still a placeholder)
 *   ⑥ CTA             — enquiry entry
 *
 * NOTE ON THE CAPACITY BAND: the page spec suggests rendering it on a dark
 * surface. It is rendered light here because DESIGN.md §1.2 records that no
 * page on the site uses a dark band mid-page — dark means "this is the entry
 * to the page". Consistency with the site beats a local contrast idea.
 *
 * Every commercial figure and tolerance on this page is a visible placeholder.
 */
export default function CapabilitiesPage() {
  return (
    <>
      {/* ① Hero ------------------------------------------------------------ */}
      <PageHero
        id="top"
        titleId="capabilities-title"
        eyebrow={processHero.eyebrow}
        heading={processHero.heading}
        lede={processHero.lede}
        supporting={processHero.supporting}
      >
        <Link href="#explorer-title" className="btn-pill-solid">
          Walk the line
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/contact" className="btn-pill-outline !text-white">
          Request a quote
        </Link>
      </PageHero>

      {/* ② Process capability (shared interactive explorer) ---------------- */}
      <section
        aria-labelledby="explorer-title"
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <ProcessExplorer
            stages={processStages}
            notes={processStageNotes}
            copy={processExplorerCopy}
          />
        </div>
      </section>

      {/* ③ Material capability --------------------------------------------- */}
      <section
        aria-labelledby="materials-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[700px]">
            <p className="eyebrow">{materialsCopy.eyebrow}</p>
            <h2
              id="materials-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {materialsCopy.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {materialsCopy.lede}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {materials.map((material) => (
              <MaterialCard key={material.index} material={material} />
            ))}
          </div>

          <div className="mt-10 max-w-[760px] rounded-xl border border-forge/30 bg-forge-soft p-7">
            <span className="inline-flex items-center gap-2 font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge-deep">
              <TriangleAlert className="size-4" aria-hidden="true" />
              Still to confirm before this section is complete
            </span>
            <ul data-reveal-group className="mt-5 grid gap-3">
              {materialsOpenItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-forge" aria-hidden="true" />
                  <span className="text-sm leading-relaxed text-ink/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ④ Quality and testing --------------------------------------------- */}
      <section
        aria-labelledby="quality-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{processQuality.eyebrow}</p>
            <h2
              id="quality-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {processQuality.heading}
            </h2>
            <p className="mt-5 max-w-[440px] text-[1.02rem] leading-relaxed text-steel">
              {processQuality.body}
            </p>
          </div>

          <ol
            data-reveal-group
            className="grid content-start gap-5 self-start rounded-xl border border-border bg-white p-8"
          >
            {processQuality.points.map((point) => (
              <li key={point} className="flex items-start gap-3.5">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                <span className="text-[0.96rem] leading-relaxed text-ink/80">
                  {point}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Hard evidence — measurements, every figure still uncertain. */}
        <div className="container-fh mt-16 border-t border-border pt-16">
          <div className="max-w-[700px]">
            <p className="eyebrow">{processHardEvidence.eyebrow}</p>
            <h3 className="mt-4 font-display text-[clamp(1.5rem,3.4vw,2.2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink">
              {processHardEvidence.heading}
            </h3>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {processHardEvidence.body}
            </p>
          </div>

          <dl
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
          >
            {processHardEvidence.items.map((item) => (
              <div key={item.label} className="flex flex-col bg-white p-7">
                <dt className="font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-steel">
                  {item.label}
                </dt>
                <dd className="mt-3 flex-1">
                  <span className="block font-display text-[1.1rem] font-800 uppercase leading-tight tracking-[0.01em] text-forge-deep">
                    {item.value}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-steel">
                    {item.note}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 max-w-[760px] text-sm leading-relaxed text-steel">
            {processQualityBoundary}
          </p>
        </div>
      </section>

      {/* ⑤ Capacity figures ------------------------------------------------ */}
      <section
        aria-labelledby="capacity-title"
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <h2 id="capacity-title" className="sr-only">
            Capacity at a glance
          </h2>

          <div className="max-w-[700px]">
            <p className="eyebrow">Capacity</p>
            <h3 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink">
              The numbers behind the line
            </h3>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Capacity, floor area, headcount and export coverage decide whether
              a factory can carry your volume — so they belong on a capability
              page rather than in a sales sentence.
            </p>
            <p className="mt-5 max-w-[760px] rounded-xl border border-forge/30 bg-forge-soft p-5 text-sm leading-relaxed text-ink/80">
              <span className="font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge-deep">
                ⏳ Pending confirmation —{" "}
              </span>
              every figure in this band is a structural placeholder. Real
              numbers must be supplied by production before launch; until then
              the band publishes no invented total.
            </p>
          </div>
        </div>

        <CapacityStats stats={capacityStats} className="mt-12" />
      </section>

      {/* ⑥ Enquiry --------------------------------------------------------- */}
      <DealerCta
        title="Ask what the line can do for your order"
        body="Send us the material and the volume you are quoting against. We will come back on the process route, the inspection it clears and a delivery position."
      />
    </>
  );
}

/**
 * A single material card.
 *
 * Status drives the treatment: a confirmed material reads as a plain card, a
 * pending one carries a visible flag so a reader can tell a capability we hold
 * from one we have not verified.
 */
function MaterialCard({ material }: { material: MaterialEntry }) {
  const pending = material.status === "pending";

  return (
    <article className="flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge">
      <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
        {material.index}
      </span>
      <h3 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
        {material.name}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-steel">
        {material.definition}
      </p>
      <p className="mt-4 flex-1 border-t border-border pt-4 text-sm leading-relaxed text-ink/80">
        {material.application}
      </p>

      {material.note ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-forge/30 bg-forge-soft px-3.5 py-2.5 text-[0.78rem] leading-relaxed text-forge-deep">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{material.note}</span>
        </p>
      ) : null}

      {pending ? (
        <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-forge/35 bg-white px-2.5 py-1 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
          <TriangleAlert className="size-3" aria-hidden="true" />
          Not yet confirmed
        </span>
      ) : null}
    </article>
  );
}
