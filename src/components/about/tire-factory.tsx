import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { AboutContent, MediaAsset } from "@/content/types";

function ProductionImage({ media, sizes }: { media: MediaAsset; sizes: string }) {
  if (!media.hasRender || media.approvalStatus !== "approved") return null;
  return <Image src={media.src} alt={media.alt} fill className="object-cover" sizes={sizes} />;
}

export function TireFactory({ section }: { section: AboutContent["tireFactory"] }) {
  if (section.status !== "approved") return null;

  return (
    <section id={section.anchor} className="scroll-mt-20 bg-white" aria-labelledby="tire-factory-title">
      <div className="container-fh grid gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-16 lg:py-32">
        <div data-reveal>
          <p className="eyebrow">{section.eyebrow}</p>
          <h2
            id="tire-factory-title"
            className="mt-5 font-display text-4xl font-700 uppercase leading-[0.94] tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl"
          >
            {section.heading}
          </h2>
          <p className="mt-6 text-base leading-7 text-steel sm:text-lg">{section.lead}</p>
          <p className="mt-7 border-l-2 border-forge pl-5 text-sm leading-6 text-ink/68">
            {section.relationshipDisclosure}
          </p>
        </div>
        <figure data-reveal>
          <div className="relative aspect-[2/1] overflow-hidden bg-panel">
            <ProductionImage media={section.heroMedia} sizes="(min-width: 1024px) 56vw, 100vw" />
          </div>
          <figcaption className="mt-3 text-xs leading-5 text-steel">
            {section.heroMedia.caption}
          </figcaption>
        </figure>
      </div>

      <div className="bg-soft py-20 sm:py-24 lg:py-28">
        <div className="container-fh">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16" data-reveal>
            <div>
              <p className="eyebrow">{section.productionEyebrow}</p>
              <h3 className="mt-4 font-display text-4xl font-700 uppercase leading-[0.96] tracking-[-0.03em] text-ink sm:text-5xl">
                {section.productionHeading}
              </h3>
            </div>
            <div className="self-end">
              <p className="text-base leading-7 text-steel">{section.productionIntro}</p>
              <p className="mt-5 border-l-2 border-forge pl-4 text-sm leading-6 text-ink/68">{section.boundaryNote}</p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2" data-reveal-group>
            {section.productionGroups.map((group, groupIndex) => (
              <article
                key={group.id}
                className={`overflow-hidden border border-muted bg-white ${groupIndex === 0 ? "lg:col-span-2" : ""}`}
              >
                <div className={`grid ${group.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {group.media.map((media) => (
                    <figure key={media.wordpressId ?? media.src} className="border-r border-muted last:border-r-0">
                      <div className={`relative overflow-hidden bg-panel ${groupIndex === 0 ? "aspect-[2.35/1]" : "aspect-[16/9]"}`}>
                        <ProductionImage media={media} sizes={groupIndex === 0 ? "100vw" : "(min-width: 1024px) 25vw, 50vw"} />
                      </div>
                      <figcaption className="border-t border-muted px-4 py-3 text-[0.68rem] leading-4 text-steel">{media.caption}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="p-6 sm:p-7">
                  <h4 className="text-2xl font-semibold tracking-[-0.025em] text-ink">{group.title}</h4>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">{group.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-muted py-20 sm:py-24 lg:py-28">
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div className="min-w-0" data-reveal>
            <p className="eyebrow">{section.evidenceEyebrow}</p>
            <h3 className="mt-5 font-display text-4xl font-700 uppercase leading-[0.96] tracking-[-0.03em] text-ink [overflow-wrap:anywhere] sm:text-5xl">
              {section.evidenceHeading}
            </h3>
            <dl className="mt-10 border-t border-muted">
              {section.evidenceChecklist.map((item) => (
                <div key={item.label} className="grid gap-2 border-b border-muted py-5 sm:grid-cols-[180px_1fr] sm:gap-8">
                  <dt className="font-display text-sm font-semibold uppercase tracking-[0.04em] text-ink">{item.label}</dt>
                  <dd className="text-sm leading-6 text-steel">{item.requirement}</dd>
                </div>
              ))}
            </dl>
          </div>
          <aside className="min-w-0 self-start bg-ink p-7 text-white sm:p-9 lg:sticky lg:top-28" data-reveal>
            <p className="text-base leading-7 text-white/68">{section.evidenceIntro}</p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href={section.primaryAction.href} className="btn-pill-solid w-full min-w-0 text-center">
                {section.primaryAction.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={section.secondaryAction.href} className="btn-pill-outline w-full min-w-0 text-center text-white">
                {section.secondaryAction.label}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
