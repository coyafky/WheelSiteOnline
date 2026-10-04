import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Info } from "lucide-react";
import {
  getSkusByFamily,
  getWheelSku,
  skuSpecRows,
  wheelSkuCopy,
  wheelSkus,
} from "@/content/wheel-skus";
import { getProductFamily } from "@/content/products";
import { getGuide } from "@/content/resources";
import { wheelFinishSwatches } from "@/content/wheel-designs";
import { WheelSketch } from "@/components/wheel-gallery";
import { DealerCta } from "@/components/sections/dealer-cta";

type SkuPageProps = {
  params: Promise<{ sku: string }>;
};

/** Build every SKU page at build time. */
export function generateStaticParams() {
  return wheelSkus.map((sku) => ({ sku: sku.sku.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: SkuPageProps): Promise<Metadata> {
  const { sku: code } = await params;
  const sku = getWheelSku(code);

  if (!sku) {
    return { title: "Wheel not found" };
  }

  return {
    title: `${sku.sku} — ${sku.name}`,
    description: sku.summary,
  };
}

/**
 * Per-SKU wheel product page (`/products/wheels/[sku]`).
 *
 * Sits below the family pages: a family explains a construction, a SKU
 * describes one shape within it. Structure follows the site's product
 * archetype — dark hero with the SKU code → generated wheel drawing →
 * specification table → finish options → applications → related SKUs → CTA.
 *
 * The hero visual is a data-driven SVG (`WheelSketch`), not an `<img>`: no
 * wheel photography exists on this site and none is requested.
 */
export default async function WheelSkuPage({ params }: SkuPageProps) {
  const { sku: code } = await params;
  const sku = getWheelSku(code);

  if (!sku) {
    notFound();
  }

  const family = getProductFamily(sku.family);
  const related = getSkusByFamily(sku.family, sku.sku).slice(0, 3);
  const specs = skuSpecRows(sku);

  // Pick a hero finish: prefer a neutral, so the drawing reads as a technical
  // line diagram rather than a colour statement.
  const heroFinish =
    sku.finishes.find((finish) => finish === "Gunmetal") ?? sku.finishes[0];

  const fitmentGuide = getGuide("how-to-measure-fitment");

  return (
    <>
      {/* A. Dark hero + drawing ------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="sku-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_80%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <nav aria-label="Breadcrumb" className="eyebrow !text-white/45">
            <Link href="/products" className="transition-colors hover:!text-forge">
              {wheelSkuCopy.breadcrumbRoot.label}
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            {family ? (
              <>
                <Link
                  href={family.href}
                  className="transition-colors hover:!text-forge"
                >
                  {family.name}
                </Link>
                <span aria-hidden="true" className="px-2">
                  /
                </span>
              </>
            ) : null}
            <span className="!text-forge">{sku.sku}</span>
          </nav>

          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-center lg:gap-16">
            <div>
              <p className="eyebrow !text-forge">{wheelSkuCopy.heroEyebrow}</p>
              <h1
                id="sku-title"
                className="mt-5 font-display text-[clamp(2.4rem,7vw,4.8rem)] font-800 uppercase leading-[0.92] tracking-[-0.02em] text-white"
              >
                {sku.sku}
              </h1>
              <p className="mt-4 font-display text-[clamp(1.1rem,2.4vw,1.5rem)] font-700 uppercase leading-tight tracking-[0.01em] text-white/70">
                {sku.name}
              </p>
              <p className="mt-7 max-w-[560px] text-[1.05rem] leading-relaxed text-white/75">
                {sku.description}
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-pill-solid">
                  Request a quote
                  <ArrowRight className="size-4" />
                </Link>
                {family ? (
                  <Link
                    href={family.href}
                    className="btn-pill-outline !text-white"
                  >
                    About {family.name}
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Generated drawing — no <img>, no missing asset. */}
            <figure className="mx-auto w-full max-w-[440px]">
              <div className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-ink">
                <WheelSketch
                  id={`sku-${sku.sku}`}
                  count={sku.spokes}
                  finish={heroFinish}
                  label={`${sku.name} — ${sku.spokes} spokes, shown in ${heroFinish}`}
                  className="size-full"
                />
              </div>
              <figcaption className="mt-4 text-xs leading-relaxed text-white/50">
                {wheelSkuCopy.renderNote}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* B. Specification -------------------------------------------------- */}
      <section
        aria-labelledby="spec-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{wheelSkuCopy.specEyebrow}</p>
            <h2
              id="spec-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {wheelSkuCopy.specHeading}
            </h2>
            <p className="mt-5 max-w-[440px] text-[0.98rem] leading-relaxed text-steel">
              {sku.summary}
            </p>

            <p className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-soft p-5 text-[0.9rem] leading-relaxed text-steel">
              <Info className="mt-0.5 size-4 shrink-0 text-forge" aria-hidden="true" />
              {wheelSkuCopy.specDisclosure}
            </p>
          </div>

          <dl
            data-reveal-group
            className="grid grid-cols-1 gap-px self-start overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2"
          >
            {specs.map((spec) => (
              <div key={spec.label} className="bg-white px-6 py-5">
                <dt className="font-display text-[0.68rem] font-700 uppercase tracking-[0.14em] text-steel">
                  {spec.label}
                </dt>
                <dd className="mt-2 font-display text-[1.02rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* C. Finish options -------------------------------------------------- */}
      <section
        aria-labelledby="finish-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[680px]">
            <p className="eyebrow">{wheelSkuCopy.finishEyebrow}</p>
            <h2
              id="finish-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {wheelSkuCopy.finishHeading}
            </h2>
          </div>

          <ul data-reveal-group className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* De-duplicated: a finish repeated in the data would otherwise
                produce duplicate React keys and an unreliable swatch list. */}
            {[...new Set(sku.finishes)].map((finish) => {
              const { swatch, note } = wheelFinishSwatches[finish];
              return (
                <li
                  key={finish}
                  className="flex items-start gap-4 rounded-xl border border-border bg-white p-6"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 size-8 shrink-0 rounded-full ring-1 ring-black/10"
                    style={{ background: swatch }}
                  />
                  <div>
                    <p className="font-display text-[1rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                      {finish}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-steel">
                      {note}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 max-w-[640px] text-sm leading-relaxed text-steel">
            {wheelSkuCopy.finishNote}
          </p>
        </div>
      </section>

      {/* D. Applications + fitment bridge ---------------------------------- */}
      <section
        aria-labelledby="applications-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{wheelSkuCopy.applicationEyebrow}</p>
            <h2
              id="applications-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {wheelSkuCopy.applicationHeading}
            </h2>

            <ul data-reveal-group className="mt-8 grid gap-5">
              {sku.applications.map((application) => (
                <li key={application} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[0.96rem] leading-relaxed text-ink/80">
                    {application}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-soft p-8">
            <p className="eyebrow">{wheelSkuCopy.fitmentEyebrow}</p>
            <h3 className="mt-4 font-display text-[clamp(1.4rem,3vw,2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink">
              {wheelSkuCopy.fitmentHeading}
            </h3>
            <p className="mt-4 text-[0.96rem] leading-relaxed text-steel">
              {wheelSkuCopy.fitmentBody}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-steel">
              Fitment is safety-critical. We publish no offset, PCD, centre bore
              or load rating as a fact for any vehicle — every value is
              confirmed per order.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-pill-solid">
                Send vehicle details
              </Link>
              {fitmentGuide ? (
                <Link
                  href={`/insights/${fitmentGuide.slug}`}
                  className="btn-pill-outline text-ink"
                >
                  How to measure fitment
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* E. Related SKUs --------------------------------------------------- */}
      {related.length > 0 ? (
        <section
          aria-labelledby="related-skus-title"
          data-reveal
          className="border-b border-border bg-soft py-20 lg:py-24"
        >
          <div className="container-fh">
            <div className="max-w-[640px]">
              <p className="eyebrow">{wheelSkuCopy.relatedEyebrow}</p>
              <h2
                id="related-skus-title"
                className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
              >
                {wheelSkuCopy.relatedHeading}
              </h2>
            </div>

            <div
              data-reveal-group
              className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {related.map((item) => {
                const finish =
                  item.finishes.find((value) => value === "Gunmetal") ??
                  item.finishes[0];
                return (
                  <Link
                    key={item.sku}
                    href={`/products/wheels/${item.sku.toLowerCase()}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
                  >
                    <div className="aspect-square overflow-hidden bg-ink">
                      <WheelSketch
                        id={`related-${item.sku}`}
                        count={item.spokes}
                        finish={finish}
                        label={`${item.name} — ${item.spokes} spokes`}
                        className="size-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="font-display text-[0.78rem] font-800 uppercase tracking-[0.12em] text-forge">
                        {item.sku}
                      </span>
                      <h3 className="mt-2 font-display text-[1.1rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                        {item.name}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                        {item.summary}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {family ? (
              <Link
                href={family.href}
                className="mt-10 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
              >
                All {family.name} wheels
                <ArrowRight className="size-3.5" />
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <DealerCta />
    </>
  );
}
