import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { finishNote, finishes } from "@/content/finishes";
import {
  finishesHero,
  finishesHonesty,
  finishesPage,
  finishesPathways,
  finishesSampleCta,
  isFinishesPublishingOpen,
} from "@/content/finish-guide";
import { DealerCta } from "@/components/sections/dealer-cta";
import { cn } from "@/lib/utils";

/**
 * The publishing gate is in metadata, not in the component tree.
 *
 * The eight finish names are still placeholders and no real swatch photograph
 * exists behind them, so `finishesPage.publicationGate` is unresolved and this
 * route declares `robots: { index: false, follow: true }` and publishes **no
 * canonical**. The page itself still renders in full — hero, honesty note,
 * swatch grid and all — because its content is truthful about being
 * illustrative. Clearing the flag in `@/content/finish-guide` is the only edit
 * needed to make it indexable; `sitemap.ts` reads the same gate so the two can
 * never disagree. See DEC-059.
 */
export async function generateMetadata(): Promise<Metadata> {
  const gateOpen = isFinishesPublishingOpen(finishesPage.publicationGate);

  const head: Metadata = {
    title: "Finish Gallery — Brushed, Satin, Gloss & Matte Wheel Finishes",
    description:
      "Compare the forged wheel finishes Fenghuai offers — brushed clear, satin gunmetal, gloss black, matte bronze, polished lip and more — with guidance on requesting real samples.",
    robots: { index: gateOpen, follow: true },
  };

  // Fail-closed: while a gate flag is unresolved the route publishes no
  // canonical at all, so nothing points at an unconfirmed page (DEC-050).
  if (!gateOpen) return head;

  return {
    ...head,
    alternates: { canonical: "/gallery/finishes" },
  };
}

/** Finishes reference: hero → honesty note → swatch grid → pathways → CTA. */
export default function FinishGalleryPage() {
  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="finishes-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_20%_0%,rgba(194,101,10,0.24)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          {/*
            这里原本是 `Gallery / {heading}` 的面包屑。`/gallery` 已按 DEC-059 退休
            （308 → `/fitment`），所以「Gallery」这个标签点下去会到 Fitment ——
            **标签与目的地不符**，比没有面包屑更糟。
            而面包屑的存在前提是「有父级」：`/gallery/finishes` 现在是一个
            孤儿子路由（父级已退役），没有可回的真实父级，所以整条移除。
          */}

          <h1
            id="finishes-title"
            className="mt-6 font-display text-[clamp(2.6rem,8vw,5.6rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-white"
          >
            {finishesHero.heading}
          </h1>
          <p className="mt-7 max-w-[680px] text-[1.05rem] leading-relaxed text-white/75">
            {finishesHero.lede}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={finishesSampleCta.href} className="btn-pill-solid">
              {finishesSampleCta.label}
              <ArrowRight className="size-4" />
            </Link>
            {/* 「Back to gallery」已移除：`/gallery` 在这次变更中退休，
                没有 gallery 可回了。主 CTA（样品申请）保留。 */}
          </div>
        </div>
      </section>

      {/* B. Honesty note ---------------------------------------------------- */}
      <section
        aria-labelledby="honesty-title"
        data-reveal
        className="border-b border-border bg-forge-soft py-14 lg:py-16"
      >
        <div className="container-fh grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-10">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/12 text-forge">
            <Info className="size-5" aria-hidden="true" />
          </span>

          <div>
            <p className="eyebrow">{finishesHonesty.eyebrow}</p>
            <h2
              id="honesty-title"
              className="mt-3 font-display text-[clamp(1.5rem,3.4vw,2.2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {finishesHonesty.heading}
            </h2>
            <p className="mt-4 max-w-[720px] text-[1.02rem] leading-relaxed text-steel">
              {finishesHonesty.body}
            </p>

            <ul
              data-reveal-group
              className="mt-7 grid gap-3 sm:grid-cols-2 sm:gap-x-8"
            >
              {finishesHonesty.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-sm leading-relaxed text-ink/80"
                >
                  <span
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-forge"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* C. Swatch grid ----------------------------------------------------- */}
      <section
        aria-labelledby="swatches-title"
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div data-reveal className="max-w-[680px] px-4">
            <p className="eyebrow">Eight directions</p>
            <h2
              id="swatches-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Finish range
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {finishNote}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7"
          >
            {finishes.map((finish) => (
              <article
                key={finish.slug}
                className="group overflow-hidden rounded-xl border border-border bg-white transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                {/* Illustrative swatch — a CSS representation, not a photograph. */}
                <div
                  role="img"
                  aria-label={`${finish.name} — illustrative colour swatch, not a photograph`}
                  className="relative aspect-4/3 border-b border-border"
                  style={{ backgroundImage: finish.swatch }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0)_42%,rgba(11,15,22,0.20)_100%)]"
                    aria-hidden="true"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-2.5 py-1 font-display text-[0.62rem] font-700 uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
                    Illustrative
                  </span>
                </div>

                <div className="p-6">
                  <p className="eyebrow !text-steel">{finish.family}</p>
                  <h3 className="mt-2.5 font-display text-[1.22rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                    {finish.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-steel">
                    {finish.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div data-reveal className="mt-12 flex flex-wrap gap-4 px-4">
            <Link href={finishesSampleCta.href} className="btn-pill-solid">
              {finishesSampleCta.label}
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/products" className="btn-pill-outline text-ink">
              Choose a construction
            </Link>
          </div>
        </div>
      </section>

      {/* D. Pathways -------------------------------------------------------- */}
      <section
        aria-labelledby="finish-pathways-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="finish-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Where to go next
            </h2>
          </div>

          {/* 列数随条目数走。
              DEC-059 删掉了原来的「Vehicle gallery」卡（指向已归档的 /gallery，
              且文案声称 "sizes we built to" 而从未有过那些 build），这一组
              只剩 1 条。固定在 `sm:grid-cols-2` 会把它渲染成**半宽孤卡**，
              看起来像漏了一张 —— 所以 ≥2 条才分两列。 */}
          <div
            data-reveal-group
            className={cn(
              "mt-10 grid grid-cols-1 gap-6",
              finishesPathways.length > 1 && "sm:grid-cols-2",
            )}
          >
            {finishesPathways.map((pathway) => (
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
