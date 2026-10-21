import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import type { AboutContent, MediaAsset } from "@/content/types";

function ApprovedImage({ media, sizes }: { media: MediaAsset; sizes: string }) {
  if (!media.hasRender || media.approvalStatus !== "approved") {
    return <div className="fh-industrial-grid absolute inset-0" role="img" aria-label={media.alt} />;
  }

  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      className="object-cover transition duration-700 group-hover:scale-[1.025]"
      sizes={sizes}
    />
  );
}

export function WheelFactory({ section }: { section: AboutContent["wheelFactory"] }) {
  if (section.status !== "approved") return null;

  return (
    <section id={section.anchor} className="scroll-mt-20 bg-soft" aria-labelledby="wheel-factory-title">
      <div className="container-fh grid gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-16 lg:py-32">
        <div data-reveal>
          <p className="eyebrow">{section.eyebrow}</p>
          <h2
            id="wheel-factory-title"
            className="mt-5 font-display text-4xl font-700 uppercase leading-[0.94] tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl"
          >
            {section.heading}
          </h2>
          <p className="mt-6 text-base leading-7 text-steel sm:text-lg">{section.lead}</p>
          <p className="mt-7 border-l-2 border-forge pl-5 text-sm leading-6 text-ink/68">
            {section.relationshipDisclosure}
          </p>
        </div>

        <figure className="group" data-reveal>
          <div className="relative aspect-[16/9] overflow-hidden bg-panel">
            <ApprovedImage media={section.heroMedia} sizes="(min-width: 1024px) 58vw, 100vw" />
          </div>
          <figcaption className="mt-3 text-xs leading-5 text-steel">
            {section.heroMedia.caption}
          </figcaption>
        </figure>
      </div>

      <div className="border-y border-muted bg-white py-20 sm:py-24 lg:py-28">
        <div className="container-fh">
          <div className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16" data-reveal>
            <div>
              <p className="eyebrow">{section.workshopsEyebrow}</p>
              <h3 className="mt-4 font-display text-4xl font-700 uppercase leading-[0.96] tracking-[-0.03em] text-ink sm:text-5xl">
                {section.workshopsHeading}
              </h3>
            </div>
            <p className="self-end max-w-2xl text-base leading-7 text-steel">{section.workshopsIntro}</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3" data-reveal-group>
            {section.workshops.map((item) => (
              <article key={item.id} className="group border border-muted bg-white">
                <div className="relative aspect-[4/3] overflow-hidden bg-panel">
                  <ApprovedImage media={item.media} sizes="(min-width: 1024px) 31vw, 100vw" />
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-semibold tracking-[-0.025em] text-ink">{item.title}</h4>
                  <p className="mt-3 text-sm leading-6 text-steel">{item.body}</p>
                  <p className="mt-6 border-t border-muted pt-4 text-xs leading-5 text-steel">{item.media.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-ink py-20 text-white sm:py-24 lg:py-28">
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-20">
          <div data-reveal>
            <p className="eyebrow">{section.capabilitiesEyebrow}</p>
            <h3 className="mt-5 font-display text-4xl font-700 uppercase leading-[0.96] tracking-[-0.03em] text-white sm:text-5xl">
              {section.capabilitiesHeading}
            </h3>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/62">{section.capabilitiesIntro}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href={section.primaryAction.href} className="btn-pill-solid">
                {section.primaryAction.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={section.secondaryAction.href} className="btn-pill-outline text-white">
                {section.secondaryAction.label}
              </Link>
            </div>
          </div>

          <ul className="grid content-start border-l border-t border-white/14 sm:grid-cols-2" data-reveal-group>
            {section.capabilities.map((item) => (
              <li key={item} className="flex min-h-24 items-center gap-4 border-b border-r border-white/14 px-5 py-5 text-sm font-medium text-white/82">
                <Check className="size-4 shrink-0 text-forge" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
