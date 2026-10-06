import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, FileCheck2 } from "lucide-react";

import type {
  CapabilityViewport,
  CapabilityViewportItem,
  MediaAsset,
  WheelManufacturingCapabilities,
} from "@/content/types";

function MediaVisual({ media, sizes }: { media: MediaAsset; sizes: string }) {
  if (!media.hasRender || media.approvalStatus !== "approved") {
    return <div className="fh-industrial-grid absolute inset-0" role="img" aria-label={media.alt} />;
  }

  return <Image src={media.src} alt={media.alt} fill className="object-cover" sizes={sizes} />;
}

function SectionHeading({
  section,
  titleId,
  dark = false,
}: {
  section: CapabilityViewport;
  titleId: string;
  dark?: boolean;
}) {
  return (
    <div data-reveal>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.18em] text-forge">{section.id}</span>
        <span className={`h-px w-10 ${dark ? "bg-white/18" : "bg-ink/16"}`} aria-hidden="true" />
        <p className="eyebrow">{section.eyebrow}</p>
      </div>
      <h2 id={titleId} className={`mt-5 max-w-3xl font-display text-4xl font-700 uppercase leading-[0.94] tracking-[-0.035em] sm:text-5xl lg:text-6xl ${dark ? "text-white" : "text-ink"}`}>
        {section.heading}
      </h2>
      {section.lead ? (
        <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${dark ? "text-white/64" : "text-steel"}`}>
          {section.lead}
        </p>
      ) : null}
    </div>
  );
}

function BoundaryNote({ text, dark = false }: { text?: string; dark?: boolean }) {
  if (!text) return null;
  return (
    <p className={`mt-10 border-l-2 border-forge pl-5 text-sm leading-6 ${dark ? "text-white/60" : "text-ink/68"}`} data-reveal>
      {text}
    </p>
  );
}

export function CapabilitiesHero({ hero }: { hero: WheelManufacturingCapabilities["hero"] }) {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-hero text-white" aria-labelledby="capabilities-title">
      <div className="fh-industrial-grid absolute inset-0 -z-20 opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-hero via-hero/95 to-hero/68" aria-hidden="true" />
      <div className="container-fh grid min-h-[760px] items-end gap-12 pb-18 pt-[132px] lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-24 lg:pt-[168px]">
        <div data-reveal>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="capabilities-title" className="mt-5 max-w-[940px] font-display text-[clamp(3.2rem,7.8vw,7.2rem)] font-800 uppercase leading-[0.85] tracking-[-0.04em]">
            {hero.heading}
          </h1>
          <p className="mt-8 max-w-[760px] text-base leading-7 text-white/72 sm:text-lg sm:leading-8">{hero.lead}</p>
          <p className="mt-6 max-w-[700px] border-l-2 border-forge pl-5 text-sm leading-6 text-white/56">{hero.disclosure}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={hero.primaryAction.href} className="btn-pill-solid">
              {hero.primaryAction.label}
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={hero.secondaryAction.href} className="btn-pill-outline text-white">
              {hero.secondaryAction.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="hidden border-l border-white/16 pl-7 lg:block" data-reveal>
          {["WM01", "WM02", "WM03", "WM04", "WM05"].map((id) => (
            <div key={id} className="flex items-center justify-between border-b border-white/12 py-4">
              <span className="font-mono text-[0.66rem] font-bold tracking-[0.18em] text-forge">{id}</span>
              <span className="size-1.5 rounded-full bg-white/34" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EngineeringCapability({ section }: { section: CapabilityViewport }) {
  if (section.publicationStatus !== "approved") return null;
  return (
    <section id="engineering-before-production" className="scroll-mt-20 bg-white py-20 sm:py-24 lg:py-32" aria-labelledby="wm01-title">
      <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:gap-16">
        <div>
          <SectionHeading section={section} titleId="wm01-title" />
          <BoundaryNote text={section.boundaryNote} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2" data-reveal-group>
          {section.items.map((item) => (
            <article key={item.id} className="group overflow-hidden border border-muted bg-white">
              {item.media ? (
                <div className="relative aspect-[1.86/1] overflow-hidden bg-soft">
                  <MediaVisual media={item.media} sizes="(min-width: 1024px) 27vw, (min-width: 640px) 50vw, 100vw" />
                </div>
              ) : null}
              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RouteCard({ item }: { item: CapabilityViewportItem }) {
  return (
    <article className={`group flex min-h-full flex-col overflow-hidden border border-muted ${item.media ? "bg-white" : "fh-industrial-grid text-white"}`}>
      {item.media ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-panel">
          <MediaVisual media={item.media} sizes="(min-width: 1024px) 32vw, 100vw" />
        </div>
      ) : (
        <div className="relative aspect-[16/10] border-b border-white/14">
          <div className="absolute inset-8 border border-white/14" aria-hidden="true" />
          <div className="absolute bottom-8 left-8 right-8 h-px bg-forge/70" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {item.note ? <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-forge">{item.note}</p> : null}
        <h3 className={`mt-3 text-2xl font-semibold tracking-[-0.025em] ${item.media ? "text-ink" : "text-white"}`}>{item.title}</h3>
        <p className={`mt-3 text-sm leading-6 ${item.media ? "text-steel" : "text-white/60"}`}>{item.body}</p>
      </div>
    </article>
  );
}

export function FormingRoutesCapability({ section }: { section: CapabilityViewport }) {
  if (section.publicationStatus !== "approved") return null;
  return (
    <section className="border-y border-muted bg-soft py-20 sm:py-24 lg:py-28" aria-labelledby="wm02-title">
      <div className="container-fh">
        <SectionHeading section={section} titleId="wm02-title" />
        <div className="mt-12 grid gap-6 lg:grid-cols-3" data-reveal-group>
          {section.items.map((item) => <RouteCard key={item.id} item={item} />)}
        </div>
        <BoundaryNote text={section.boundaryNote} />
      </div>
    </section>
  );
}

function EvidenceCard({ item, dark = false }: { item: CapabilityViewportItem; dark?: boolean }) {
  return (
    <article className={`overflow-hidden border ${dark ? "border-white/13 bg-white/[0.035]" : "border-muted bg-white"}`}>
      {item.media ? (
        <div className={`relative aspect-[4/3] overflow-hidden ${dark ? "bg-panel" : "bg-soft"}`}>
          <MediaVisual media={item.media} sizes="(min-width: 1024px) 31vw, 100vw" />
        </div>
      ) : null}
      <div className="p-6 sm:p-7">
        {item.note ? <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.15em] text-forge">{item.note}</p> : null}
        <h3 className={`text-2xl font-semibold tracking-[-0.025em] ${item.note ? "mt-3" : ""} ${dark ? "text-white" : "text-ink"}`}>{item.title}</h3>
        <p className={`mt-3 text-sm leading-6 ${dark ? "text-white/58" : "text-steel"}`}>{item.body}</p>
        {item.media ? <p className={`mt-6 border-t pt-4 text-xs leading-5 ${dark ? "border-white/12 text-white/44" : "border-muted text-steel/80"}`}>{item.media.caption}</p> : null}
      </div>
    </article>
  );
}

export function InspectionCapability({ section }: { section: CapabilityViewport }) {
  if (section.publicationStatus !== "approved") return null;
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28" aria-labelledby="wm03-title">
      <div className="container-fh">
        <SectionHeading section={section} titleId="wm03-title" />
        <div className="mt-12 grid gap-6 lg:grid-cols-3" data-reveal-group>
          {section.items.map((item) => <EvidenceCard key={item.id} item={item} />)}
        </div>
        <BoundaryNote text={section.boundaryNote} />
      </div>
    </section>
  );
}

export function ValidationCapability({ section }: { section: CapabilityViewport }) {
  if (section.publicationStatus !== "approved") return null;
  return (
    <section className="bg-ink py-20 text-white sm:py-24 lg:py-28" aria-labelledby="wm04-title">
      <div className="container-fh">
        <SectionHeading section={section} titleId="wm04-title" dark />
        <div className="mt-12 grid gap-6 lg:grid-cols-3" data-reveal-group>
          {section.items.map((item) => <EvidenceCard key={item.id} item={item} dark />)}
        </div>
        <BoundaryNote text={section.boundaryNote} dark />
      </div>
    </section>
  );
}

export function DocumentedEvidence({ section }: { section: WheelManufacturingCapabilities["documentedEvidence"] }) {
  if (section.publicationStatus !== "approved") return null;
  return (
    <section className="bg-forge-soft py-20 sm:py-24 lg:py-28" aria-labelledby="wm05-title">
      <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-20">
        <div>
          <SectionHeading section={section} titleId="wm05-title" />
          <div className="mt-10 border-t border-ink/14" data-reveal-group>
            {section.items.map((item) => (
              <article key={item.id} className="grid gap-3 border-b border-ink/14 py-6 sm:grid-cols-[220px_1fr] sm:gap-9">
                <h3 className="flex items-start gap-3 font-display text-base font-semibold uppercase leading-6 tracking-[0.01em] text-ink">
                  <FileCheck2 className="mt-0.5 size-5 shrink-0 text-forge" aria-hidden="true" />
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-steel">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="self-start bg-ink p-7 text-white sm:p-9 lg:sticky lg:top-28" data-reveal>
          <p className="border-l-2 border-forge pl-5 text-sm leading-6 text-white/62">{section.boundaryNote}</p>
          <ul className="mt-8 grid gap-3">
            {section.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 text-sm text-white/78">
                <Check className="size-4 shrink-0 text-forge" aria-hidden="true" />
                {item.title}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-col gap-3">
            <Link href={section.primaryAction.href} className="btn-pill-solid w-full">
              {section.primaryAction.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={section.secondaryAction.href} className="btn-pill-outline w-full text-white">
              {section.secondaryAction.label}
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
