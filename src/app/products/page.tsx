import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ProductFamilyGrid } from "@/components/product-family-grid";
import { DealerCta } from "@/components/sections/dealer-cta";
import { getProductLinesContent } from "@/lib/wordpress/product-lines";
import { getWordpressPageDocument } from "@/lib/wordpress/pages";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getWordpressPageDocument("product-lines");
  return {
    title: page?.seoTitle || "Products — Wheels, EV Components, Aluminum Parts & Tires",
    description:
      page?.seoDescription ||
      "Fenghuai manufactures across four product lines — forged wheels, EV powertrain housings, custom aluminum parts and self-healing safety tires.",
  };
}

/**
 * Product hub — four parallel lines.
 *
 * ── Viewport 01 was rebuilt 2026-10-02 (PAGE-SPECS/products/index.md v2 §0.5) ─
 * The page used to open with a wheel-only hero
 * ("Custom Forged Wheel Range — Monoblock, Two-Piece & Off-Road") followed by a
 * "Three families" grid of wheel categories. Both described a wheel shop; the
 * company sells four product lines. Viewport 01 is now the company's four lines
 * — page header plus the shared `<ProductFamilyGrid>` — with the header folding
 * into the same viewport rather than standing as its own section.
 *
 * ⚠️ The remaining sections below are **unchanged and still on the old copy**.
 * `products/index.md` §0.5.3 calls for deleting four of them (sku-callout,
 * guidance, fitment, resources, FAQ) and merging one into viewport 02. That has
 * not happened yet — this edit is scoped to the first module only.
 */
export default async function ProductsPage() {
  const { t } = await getTranslator();
  const content = await getProductLinesContent();
  const productLines = content.lines;
  const { intro, guidance, skuCallout, routes, fitmentSupport, resourceLinks, faqs } =
    content.catalogue;
  return (
    <>
      {/* A. Hero ---------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="products-title"
        data-reveal
        className="relative isolate overflow-hidden border-b border-border bg-background"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_82%_0%,var(--fh-forge-soft)_0%,transparent_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.15] [background-image:repeating-linear-gradient(115deg,var(--fh-muted)_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <p className="eyebrow !text-forge">{intro.eyebrow}</p>
          <h1
            id="products-title"
            className="mt-5 font-display text-[clamp(2.6rem,8vw,5.6rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-ink"
          >
            {intro.heading}
          </h1>
          <p className="mt-7 max-w-[680px] text-[1.05rem] leading-relaxed text-steel">
            {intro.lede}
          </p>
          <p className="mt-4 max-w-[640px] text-sm leading-relaxed text-steel/85">
            {intro.supporting}
          </p>
        </div>
      </section>

      {/* B. Family card grid ---------------------------------------------- */}
      <section
        aria-labelledby="families-title"
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div data-reveal className="max-w-[720px] px-4">
            <p className="eyebrow">{t("catalogue.families.eyebrow")}</p>
            <h2
              id="families-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {t("catalogue.families.heading")}
            </h2>
            <p className="mt-5 text-[1rem] leading-relaxed text-steel">
              {t("catalogue.families.lede")}
            </p>
          </div>

          {/* Shared with the homepage product section (§3.2 mandatory reuse).
              Never four separate <FamilyCard>s inlined here — the two call
              sites must not be able to drift apart. */}
          <ProductFamilyGrid
            lines={productLines}
            density="roomy"
            className="mt-12 px-4"
          />
        </div>
      </section>

      {/* B2. SKU index callout ------------------------------------------- */}
      <section
        aria-labelledby="sku-callout-title"
        data-reveal
        className="border-b border-border bg-soft py-16 lg:py-20"
      >
        <div className="container-fh grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="eyebrow">{skuCallout.eyebrow}</p>
            <h2
              id="sku-callout-title"
              className="mt-4 max-w-[640px] font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {skuCallout.heading}
            </h2>
            <p className="mt-5 max-w-[620px] text-[1.02rem] leading-relaxed text-steel">
              {skuCallout.body}
            </p>
          </div>

          <Link
            href={skuCallout.cta.href}
            className="btn-pill-solid lg:justify-self-end"
          >
            {skuCallout.cta.label}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* C. How to specify your order ------------------------------------- */}
      <section
        aria-labelledby="guidance-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{guidance.eyebrow}</p>
            <h2
              id="guidance-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {guidance.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {guidance.lede}
            </p>
          </div>

          <ol
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
          >
            {routes.map((route) => (
              <li
                key={route.step}
                className="flex flex-col bg-white p-7 transition-colors hover:bg-forge-soft"
              >
                <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                  {route.step}
                </span>
                <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {route.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {route.body}
                </p>
                <Link
                  href={route.href}
                  className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
                >
                  {route.linkLabel}
                  <ArrowRight className="size-3.5" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* D. Fitment support ----------------------------------------------- */}
      <section
        aria-labelledby="fitment-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{fitmentSupport.eyebrow}</p>
            <h2
              id="fitment-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {fitmentSupport.heading}
            </h2>
            <p className="mt-5 max-w-[520px] text-[1.02rem] leading-relaxed text-steel">
              {fitmentSupport.lede}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-pill-solid">
                {t("cta.requestQuote")}
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/insights" className="btn-pill-outline text-ink">
                {t("catalogue.fitmentLink")}
              </Link>
            </div>
          </div>

          <ul
            data-reveal-group
            className="grid content-start gap-5 rounded-xl border border-border bg-soft p-8"
          >
            {fitmentSupport.points.map((point) => (
              <li key={point} className="flex items-start gap-3.5">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="text-[0.96rem] leading-relaxed text-ink/80">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* E. Related resources --------------------------------------------- */}
      <section
        aria-labelledby="resources-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">{t("catalogue.resources.eyebrow")}</p>
            <h2
              id="resources-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {t("catalogue.resources.heading")}
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {resourceLinks.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{resource.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {resource.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {resource.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {resource.linkLabel}
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* F. FAQ ------------------------------------------------------------ */}
      <section
        aria-labelledby="faq-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{t("catalogue.faq.eyebrow")}</p>
            <h2
              id="faq-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {t("catalogue.faq.heading")}
            </h2>
            <p className="mt-5 max-w-[420px] text-[1.02rem] leading-relaxed text-steel">
              {t("catalogue.faq.lede")}
            </p>
          </div>

          <div data-reveal-group className="divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <article key={faq.question} className="py-6">
                <h3 className="font-display text-[1.1rem] font-700 uppercase leading-snug tracking-[0.01em] text-ink">
                  {faq.question}
                </h3>
                <p className="mt-3 text-[0.96rem] leading-relaxed text-steel">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <DealerCta />
    </>
  );
}
