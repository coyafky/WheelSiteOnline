import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  resourcesCards,
  resourcesExtraIndex,
  resourcesHero,
  resourcesIntro,
  resourcesPathways,
} from "@/content/resources";
import { insightsHeroMedia } from "@/content/insights-visuals";
import { GuidesAccordion } from "@/components/guides-accordion";
import { DealerCta } from "@/components/sections/dealer-cta";
import { PreviewBanner } from "@/components/preview-banner";
import { getLocale } from "@/lib/i18n";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { getInsightGuideDocuments } from "@/lib/wordpress/insights";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { isEnabled: preview } = await draftMode();
  return {
    title: "Forged Wheel Insights — Fitment, Construction & Import Guides",
    description:
      "Reference guides for dealers and wheel shops: measuring fitment, offset and backspacing, choosing a construction, finish options and importing wheels.",
    ...(await buildRouteMetadata("/insights", locale, { preview })),
  };
}

/**
 * Insights hub.
 *
 * 工程资料库：用编辑型主视觉、可筛选 dossier 卡和参考工具入口组织内容。
 * 视觉借鉴高端汽车网站的图像节奏与强层级，但文字、素材和信息架构均为丰怀自有。
 */
export default async function InsightsPage() {
  const { isEnabled: preview } = await draftMode();
  const locale = await getLocale();
  const documents = await getInsightGuideDocuments({ preview, locale });
  const guides = documents.map((document) => document.guide);
  const guideMedia = Object.fromEntries(
    documents.flatMap((document) => document.media ? [[document.guide.slug, document.media]] : []),
  );
  return (
    <>
      <PreviewBanner enabled={preview} />
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="resources-title"
        data-reveal
        className="relative isolate overflow-hidden bg-hero"
      >
        <div className="container-fh grid min-h-[760px] items-end gap-10 pb-16 pt-[140px] lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] lg:gap-16 lg:pb-20 lg:pt-[168px]">
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <p className="eyebrow !text-forge-bright">{resourcesHero.eyebrow}</p>
              <span className="h-px w-12 bg-white/25" aria-hidden="true" />
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white/65">
                {String(guides.length).padStart(2, "0")} dossiers
              </p>
            </div>
            <h1
              id="resources-title"
              className="mt-7 max-w-[900px] font-display text-[clamp(3.2rem,8vw,7.3rem)] font-800 uppercase leading-[0.82] tracking-[-0.035em] text-white"
            >
              {resourcesHero.heading}
            </h1>
            <p className="mt-8 max-w-[680px] text-[1.08rem] leading-relaxed text-white/78">
              {resourcesHero.lede}
            </p>
            <p className="mt-4 max-w-[620px] text-sm leading-relaxed text-white/62">
              {resourcesHero.supporting}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="#guides-title" className="btn-pill-solid">
                Browse the guides
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/contact" className="btn-pill-outline !text-white">
                Ask a technical question
              </Link>
            </div>
          </div>

          <figure className="relative min-h-[360px] overflow-hidden border border-white/15 bg-panel lg:min-h-[560px]" data-reveal>
            <Image
              src={insightsHeroMedia.src}
              alt={insightsHeroMedia.alt}
              fill
              priority
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover brightness-[0.72] contrast-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-hero via-transparent to-hero/15" aria-hidden="true" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 border-t border-white/15 bg-hero/70 p-5 backdrop-blur-sm">
              <span className="max-w-[360px] text-xs leading-5 text-white/75">{insightsHeroMedia.caption}</span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/75">Technical library</span>
            </figcaption>
          </figure>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-[8%] -z-10 w-px bg-white/[0.06]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-[8%] -z-10 w-px bg-white/[0.06]" aria-hidden="true" />
      </section>

      {/* B. Guide cards ------------------------------------------------------ */}
      <section
        aria-labelledby="guides-title"
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div data-reveal className="max-w-[720px] px-4">
            <p className="eyebrow">{resourcesIntro.eyebrow}</p>
            <h2
              id="guides-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {resourcesIntro.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {resourcesIntro.body}
            </p>
          </div>

          <div data-reveal className="mt-12 px-4">
            <GuidesAccordion guides={guides} copy={resourcesCards} media={guideMedia} />
          </div>
        </div>
      </section>

      {/* B2. Reference sets (bolt patterns + tools) ------------------------ */}
      <section
        aria-labelledby="reference-sets-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[680px]">
            <p className="eyebrow">{resourcesExtraIndex.eyebrow}</p>
            <h2
              id="reference-sets-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {resourcesExtraIndex.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {resourcesExtraIndex.body}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {resourcesExtraIndex.cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{card.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {card.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {card.linkLabel}
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* C. Pathways --------------------------------------------------------- */}
      <section
        aria-labelledby="resource-pathways-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="resource-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Where to go next
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {resourcesPathways.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{pathway.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
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
