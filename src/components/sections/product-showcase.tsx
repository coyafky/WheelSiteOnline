import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { productLines } from "@/content/product-lines";
import type { HomepageContent } from "@/content/types";

export function ProductShowcase({
  copy,
}: {
  copy: HomepageContent["productLines"];
}) {

  return (
    <section
      id="product-lines"
      aria-labelledby="product-lines-title"
      data-reveal
      className="scroll-mt-20 border-b border-border bg-white py-20 lg:py-28"
    >
      <div className="container-fh">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2
              id="product-lines-title"
              className="mt-4 max-w-[720px] font-display text-[clamp(2.3rem,5vw,4rem)] font-800 uppercase leading-[0.94] tracking-[-0.02em] text-ink"
            >
              {copy.heading}
            </h2>
          </div>
          <p className="max-w-[600px] text-[1.02rem] leading-relaxed text-steel lg:pb-1">
            {copy.intro}
          </p>
        </div>

        <ul
          data-reveal-group
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:gap-6"
        >
          {productLines.map((product, index) => (
            <li key={product.slug}>
              <Link
                href={product.href}
                aria-label={copy.actionLabels[product.slug] ?? `Explore ${product.name}`}
                className="group relative flex h-full min-h-[390px] flex-col justify-end overflow-hidden rounded-xl border border-border bg-hero p-6 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-forge hover:shadow-[0_22px_50px_rgb(11_15_22/0.16)] focus-visible:border-forge focus-visible:outline-none lg:min-h-[440px] lg:p-8"
              >
                {product.hasRender ? (
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="-z-10 object-cover brightness-[0.58] transition-[filter,transform] duration-500 group-hover:scale-[1.035] group-hover:brightness-[0.72]"
                  />
                ) : (
                  <div className="fh-industrial-grid absolute inset-0 -z-10" aria-hidden="true" />
                )}
                <div className="absolute inset-0 -z-10 bg-linear-to-t from-hero via-hero/58 to-hero/10" />

                <div
                  aria-hidden="true"
                  className="absolute left-6 top-6 font-display text-sm font-700 tracking-[0.16em] text-white/70 lg:left-8 lg:top-8"
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="relative">
                  <p className="font-display text-[0.78rem] font-600 uppercase tracking-[0.13em] text-forge-bright">
                    {product.subtitle}
                  </p>
                  <h3 className="mt-3 max-w-[520px] font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-800 uppercase leading-[0.95] tracking-[-0.01em] text-white">
                    {product.name}
                  </h3>
                  <p className="mt-4 max-w-[520px] text-[0.94rem] leading-relaxed text-white/72">
                    {product.summary}
                  </p>

                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-display text-[0.8rem] font-700 uppercase tracking-[0.12em] text-white transition-colors duration-300 group-hover:text-forge-bright">
                    {copy.actionLabels[product.slug] ?? "Explore product line"}
                    <ArrowUpRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
