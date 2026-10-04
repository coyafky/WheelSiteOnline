import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getSkusByFamily,
  wheelIndexCopy,
  wheelSkus,
} from "@/content/wheel-skus";
import { productFamilies } from "@/content/products";
import { WheelSketch } from "@/components/wheel-gallery";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  title: "Wheel Products — Forged Wheel SKUs by Construction",
  description:
    "Every forged wheel SKU in the Fenghuai range, grouped by construction. Each SKU fixes the shape; diameter, width, offset and finish are specified to your order.",
};

/**
 * SKU index (`/products/wheels`).
 *
 * The flat list of orderable shapes, grouped by construction. Sits between the
 * family hub (`/products`) and the individual SKU pages, so a dealer can go
 * family → SKU in one hop without losing the construction grouping.
 */
export default function WheelProductsIndexPage() {
  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="wheel-index-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_24%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <nav aria-label="Breadcrumb" className="eyebrow !text-white/45">
            <Link href="/products" className="transition-colors hover:!text-forge">
              Products
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span className="!text-forge">Wheels</span>
          </nav>

          <p className="eyebrow mt-6 !text-forge">{wheelIndexCopy.eyebrow}</p>
          <h1
            id="wheel-index-title"
            className="mt-5 font-display text-[clamp(2.6rem,8vw,5.4rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-white"
          >
            {wheelIndexCopy.heading}
          </h1>
          <p className="mt-7 max-w-[700px] text-[1.05rem] leading-relaxed text-white/75">
            {wheelIndexCopy.lede}
          </p>
          <p className="mt-4 max-w-[640px] text-sm leading-relaxed text-white/55">
            {wheelIndexCopy.supporting}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/contact" className="btn-pill-solid">
              Request a quote
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/products" className="btn-pill-outline !text-white">
              Compare families
            </Link>
          </div>
        </div>
      </section>

      {/* B. SKUs grouped by family ----------------------------------------- */}
      {productFamilies.map((family, index) => {
        const skus = getSkusByFamily(family.slug);
        if (skus.length === 0) return null;

        return (
          <section
            key={family.slug}
            aria-labelledby={`family-${family.slug}-title`}
            data-reveal
            className={
              index % 2 === 0
                ? "border-b border-border bg-white py-20 lg:py-24"
                : "border-b border-border bg-soft py-20 lg:py-24"
            }
          >
            <div className="container-fh-wide">
              <div className="flex flex-wrap items-end justify-between gap-6 px-4">
                <div className="max-w-[640px]">
                  <p className="eyebrow">{family.name}</p>
                  <h2
                    id={`family-${family.slug}-title`}
                    className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
                  >
                    {family.summary}
                  </h2>
                </div>
                <Link
                  href={family.href}
                  className="inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
                >
                  About {family.name}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div
                data-reveal-group
                className="mt-10 grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
              >
                {skus.map((sku) => {
                  const finish =
                    sku.finishes.find((value) => value === "Gunmetal") ??
                    sku.finishes[0];
                  return (
                    <Link
                      key={sku.sku}
                      href={`/products/wheels/${sku.sku.toLowerCase()}`}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
                    >
                      <div className="aspect-square overflow-hidden bg-ink">
                        <WheelSketch
                          id={`index-${sku.sku}`}
                          count={sku.spokes}
                          finish={finish}
                          label={`${sku.name} — ${sku.spokes} spokes`}
                          className="size-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <span className="font-display text-[0.78rem] font-800 uppercase tracking-[0.12em] text-forge">
                          {sku.sku}
                        </span>
                        <h3 className="mt-2 font-display text-[1.1rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                          {sku.name}
                        </h3>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                          {sku.summary}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                          {wheelIndexCopy.cardCta}
                          <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* C. Count note ------------------------------------------------------ */}
      <section
        data-reveal
        aria-label="Catalogue size"
        className="border-b border-border bg-white py-10"
      >
        <div className="container-fh">
          <p className="font-display text-[0.76rem] font-700 uppercase tracking-[0.14em] text-steel">
            {wheelSkus.length} SKUs across {productFamilies.length} constructions
          </p>
        </div>
      </section>

      <DealerCta />
    </>
  );
}
