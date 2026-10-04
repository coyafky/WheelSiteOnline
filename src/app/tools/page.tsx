import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Wrench } from "lucide-react";
import { tools, toolsHubCopy, toolsPathways } from "@/content/tools";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  title: "Wheel Tools — Offset Calculator & Fitment Aids",
  description:
    "Working tools for forged wheel fitment: a wheel offset calculator that compares an original wheel against a replacement, plus further tools in development.",
};

/**
 * Tools hub (`/tools`).
 *
 * A small index of the interactive tools. Today there is one; the array-driven
 * list means adding the next one is a content change, not a page rewrite.
 */
export default function ToolsPage() {
  const available = tools.filter((tool) => tool.status === "available");
  const planned = tools.filter((tool) => tool.status === "planned");

  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="tools-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_78%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <p className="eyebrow !text-forge">{toolsHubCopy.eyebrow}</p>
          <h1
            id="tools-title"
            className="mt-5 font-display text-[clamp(2.6rem,8vw,5.6rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-white"
          >
            {toolsHubCopy.heading}
          </h1>
          <p className="mt-7 max-w-[680px] text-[1.05rem] leading-relaxed text-white/75">
            {toolsHubCopy.lede}
          </p>
          <p className="mt-4 max-w-[640px] text-sm leading-relaxed text-white/55">
            {toolsHubCopy.supporting}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/tools/offset-calculator"
              className="btn-pill-solid"
            >
              Open the offset calculator
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/insights" className="btn-pill-outline !text-white">
              Fitment guides
            </Link>
          </div>
        </div>
      </section>

      {/* B. Available tools ------------------------------------------------ */}
      <section
        aria-labelledby="available-tools-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[680px]">
            <p className="eyebrow">Available now</p>
            <h2
              id="available-tools-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Tools that do the arithmetic
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7"
          >
            {available.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="group flex flex-col rounded-xl border border-border bg-soft p-8 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-forge/12 text-forge">
                  <Wrench className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-[1.5rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {tool.name}
                </h3>
                <p className="mt-3 font-display text-[0.68rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {tool.computes}
                </p>
                <p className="mt-4 flex-1 text-[0.96rem] leading-relaxed text-steel">
                  {tool.body}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  Open the tool
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* C. Planned tools -------------------------------------------------- */}
      <section
        aria-labelledby="planned-tools-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[680px]">
            <p className="eyebrow">In development</p>
            <h2
              id="planned-tools-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              More tools are on the way
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              We would rather publish a tool late than publish one that looks
              authoritative and is not. Anything below is listed for visibility
              only — it is not built, and nothing here is a substitute for
              talking to us.
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {planned.map((tool) => (
              <article
                key={tool.slug}
                className="rounded-xl border border-dashed border-border bg-white p-7"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-steel">
                  <Clock className="size-3.5" aria-hidden="true" />
                  Not yet available
                </span>
                <h3 className="mt-5 font-display text-[1.24rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {tool.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">
                  {tool.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* D. Pathways ------------------------------------------------------- */}
      <section
        aria-labelledby="tools-pathways-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="tools-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Where to go next
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {toolsPathways.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className="group flex flex-col rounded-xl border border-border bg-soft p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{pathway.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.24rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {pathway.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {pathway.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {pathway.linkLabel}
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DealerCta />
    </>
  );
}
