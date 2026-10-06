import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  CircleAlert,
  FileCheck2,
  ShieldCheck,
  X,
} from "lucide-react";

import type {
  MediaAsset,
  SelfSealingTirePage,
  TireViewport,
} from "@/content/types";

function MediaVisual({
  media,
  sizes,
  className = "object-cover",
}: {
  media: MediaAsset;
  sizes: string;
  className?: string;
}) {
  if (!media.hasRender || media.approvalStatus !== "approved") {
    return <div className="fh-industrial-grid absolute inset-0" role="img" aria-label={media.alt} />;
  }

  return <Image src={media.src} alt={media.alt} fill className={className} sizes={sizes} />;
}

function ViewportHeading({
  section,
  titleId,
  dark = false,
}: {
  section: TireViewport;
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
      <h2 id={titleId} className={`mt-5 max-w-4xl font-display text-4xl font-700 uppercase leading-[0.94] tracking-[-0.035em] sm:text-5xl lg:text-6xl ${dark ? "text-white" : "text-ink"}`}>
        {section.heading}
      </h2>
      {section.lead ? (
        <p className={`mt-6 max-w-3xl text-base leading-7 sm:text-lg sm:leading-8 ${dark ? "text-white/64" : "text-steel"}`}>
          {section.lead}
        </p>
      ) : null}
    </div>
  );
}

function BoundaryNote({ text, dark = false }: { text?: string; dark?: boolean }) {
  if (!text) return null;
  return (
    <p className={`border-l-2 border-forge pl-5 text-sm leading-6 ${dark ? "text-white/60" : "text-ink/68"}`} data-reveal>
      {text}
    </p>
  );
}

export function SelfSealingHero({ content }: { content: SelfSealingTirePage }) {
  const sections = [content.painPoint, content.definition, content.mechanism, content.punctureValidation, content.evidenceSystem, content.applicationAndInquiry];

  return (
    <section id="top" className="relative isolate overflow-hidden bg-hero text-white" aria-labelledby="safety-tires-title">
      <div className="fh-industrial-grid absolute inset-0 -z-20 opacity-75" aria-hidden="true" />
      <div className="absolute -right-40 top-24 -z-10 size-[560px] rounded-full border border-white/8" aria-hidden="true" />
      <div className="absolute -right-10 top-60 -z-10 size-[300px] rounded-full border border-forge/30" aria-hidden="true" />
      <div className="container-fh grid min-h-[760px] items-end gap-14 pb-18 pt-[132px] lg:grid-cols-[minmax(0,1fr)_330px] lg:pb-24 lg:pt-[168px]">
        <div data-reveal>
          <p className="eyebrow">{content.hero.eyebrow}</p>
          <h1 id="safety-tires-title" className="mt-5 max-w-[940px] font-display text-[clamp(3.1rem,7.5vw,7rem)] font-800 uppercase leading-[0.86] tracking-[-0.04em]">
            {content.hero.heading}
          </h1>
          <p className="mt-8 max-w-[760px] text-base leading-7 text-white/72 sm:text-lg sm:leading-8">{content.hero.lead}</p>
          <p className="mt-6 max-w-[700px] border-l-2 border-forge pl-5 text-sm leading-6 text-white/56">{content.hero.disclosure}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={content.hero.primaryAction.href} className="btn-pill-solid">
              {content.hero.primaryAction.label}
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={content.hero.secondaryAction.href} className="btn-pill-outline text-white">
              {content.hero.secondaryAction.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <nav className="hidden border-l border-white/16 pl-7 lg:block" aria-label="Page sections" data-reveal>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id.toLowerCase()}`} className="group grid grid-cols-[36px_1fr] gap-3 border-b border-white/12 py-4">
              <span className="font-mono text-[0.66rem] font-bold tracking-[0.18em] text-forge">{section.id}</span>
              <span className="text-xs leading-5 text-white/48 transition-colors group-hover:text-white/80">{section.heading}</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

export function RoadsideProblem({ section }: { section: SelfSealingTirePage["painPoint"] }) {
  if (section.publicationStatus !== "approved") return null;
  return (
    <section id="t01" className="scroll-mt-20 bg-white py-20 sm:py-24 lg:py-32" aria-labelledby="t01-title">
      <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ViewportHeading section={section} titleId="t01-title" />
          <div className="mt-8"><BoundaryNote text={section.boundaryNote} /></div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2" data-reveal-group>
          {section.items.map((item) => (
            <article key={item.id} className="overflow-hidden border border-muted bg-soft">
              {item.media ? (
                <figure>
                  <div className="relative aspect-[1.9/1] overflow-hidden bg-panel">
                    <MediaVisual media={item.media} sizes="(min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw" />
                  </div>
                </figure>
              ) : null}
              <div className="p-5 sm:p-6">
                <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-forge">{item.id}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TyreDefinition({ section }: { section: SelfSealingTirePage["definition"] }) {
  if (section.publicationStatus !== "approved") return null;
  const [roadUse, puncture] = section.items;
  return (
    <section id="t02" className="scroll-mt-20 border-y border-muted bg-soft py-20 sm:py-24 lg:py-28" aria-labelledby="t02-title">
      <div className="container-fh">
        <ViewportHeading section={section} titleId="t02-title" />
        <div className="mt-12 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.45fr)]" data-reveal-group>
          {roadUse?.media ? (
            <article className="min-w-0 overflow-hidden bg-ink text-white">
              <div className="relative aspect-[2.45/1] min-h-[280px] overflow-hidden bg-panel">
                <MediaVisual media={roadUse.media} sizes="(min-width: 1024px) 75vw, 100vw" />
                <div className="absolute inset-0 bg-linear-to-t from-hero/88 via-hero/10 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <h3 className="text-2xl font-semibold tracking-[-0.025em]">{roadUse.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">{roadUse.body}</p>
                </div>
              </div>
            </article>
          ) : null}
          {puncture?.media ? (
            <article className="min-w-0 overflow-hidden border border-muted bg-white">
              <div className="relative aspect-[0.9/1] min-h-[360px] overflow-hidden bg-panel lg:min-h-0">
                <MediaVisual media={puncture.media} sizes="(min-width: 1024px) 24vw, 100vw" className="object-cover object-center" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink">{puncture.title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{puncture.body}</p>
              </div>
            </article>
          ) : null}
        </div>
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_auto]">
          <BoundaryNote text={section.boundaryNote} />
          <Link href={section.primaryAction.href} className="btn-pill-outline text-ink">
            {section.primaryAction.label}
            <ArrowDownRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SealingMechanism({ section }: { section: SelfSealingTirePage["mechanism"] }) {
  if (section.publicationStatus !== "approved") return null;
  return (
    <section id="self-sealing-mechanism" className="scroll-mt-20 bg-white py-20 sm:py-24 lg:py-32" aria-labelledby="t03-title">
      <div id="t03" className="container-fh scroll-mt-20">
        <ViewportHeading section={section} titleId="t03-title" />
        <div className="mt-12 grid gap-6 lg:grid-cols-3" data-reveal-group>
          {section.items.map((item, index) => (
            <article key={item.id} className="relative overflow-hidden border border-muted bg-white">
              {item.media ? (
                <div className="relative aspect-[1.98/1] overflow-hidden bg-soft">
                  <MediaVisual media={item.media} sizes="(min-width: 1024px) 33vw, 100vw" />
                </div>
              ) : null}
              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-4">
                  <span className="flex size-9 items-center justify-center rounded-full bg-forge text-sm font-bold text-white">{item.id}</span>
                  {index < section.items.length - 1 ? <ArrowRight className="size-4 text-steel/50" aria-hidden="true" /> : <Check className="size-4 text-forge" aria-hidden="true" />}
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.025em] text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10"><BoundaryNote text={section.boundaryNote} /></div>
      </div>
    </section>
  );
}

export function PunctureValidation({ section }: { section: SelfSealingTirePage["punctureValidation"] }) {
  if (section.publicationStatus !== "approved") return null;
  return (
    <section id="t04" className="scroll-mt-20 overflow-hidden bg-ink py-20 text-white sm:py-24 lg:py-32" aria-labelledby="t04-title">
      <div className="container-fh">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-16">
          <div>
            <ViewportHeading section={section} titleId="t04-title" dark />
            <div className="mt-8 flex items-end gap-4 border-y border-white/12 py-7" data-reveal>
              <span className="font-display text-[clamp(5rem,13vw,9rem)] font-800 leading-[0.72] tracking-[-0.055em] text-forge">{section.evidence.objectDiameterMm}</span>
              <div className="pb-1">
                <p className="font-display text-3xl font-700 uppercase leading-none">mm</p>
                <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/48">{section.evidence.objectType} · {section.evidence.punctureZone} area</p>
              </div>
            </div>
            <div className="mt-7 flex items-start gap-3 text-sm leading-6 text-white/62" data-reveal>
              <CircleAlert className="mt-1 size-4 shrink-0 text-forge" aria-hidden="true" />
              <p>{section.inspectionNote}</p>
            </div>
            <div className="mt-8"><BoundaryNote text={section.boundaryNote} dark /></div>
            <Link href={section.primaryAction.href} className="btn-pill-solid mt-9">
              {section.primaryAction.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2" data-reveal-group>
            {section.items.map((item, index) => (
              <article key={item.id} className={`overflow-hidden border border-white/12 bg-white/[0.035] ${index === 0 ? "sm:col-span-2" : ""}`}>
                {item.media ? (
                  <div className={`relative overflow-hidden bg-panel ${index === 0 ? "aspect-[1.82/1]" : "aspect-[1.82/1]"}`}>
                    <MediaVisual media={item.media} sizes={index === 0 ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 27vw, 50vw"} />
                  </div>
                ) : null}
                <div className="p-5 sm:p-6">
                  <h3 className="text-xl font-semibold tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/56">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductEvidence({ section }: { section: SelfSealingTirePage["evidenceSystem"] }) {
  if (section.publicationStatus !== "approved") return null;
  const research = section.items.slice(0, 3);
  const production = section.items.slice(3);
  return (
    <section id="t05" className="scroll-mt-20 bg-soft py-20 sm:py-24 lg:py-32" aria-labelledby="t05-title">
      <div className="container-fh">
        <ViewportHeading section={section} titleId="t05-title" />
        <div className="mt-12 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2 lg:grid-rows-2" data-reveal-group>
          {research.map((item, index) => (
            <article key={item.id} className={`min-w-0 overflow-hidden border border-muted bg-white ${index === 0 ? "lg:row-span-2" : ""}`}>
              {item.media ? (
                <div className={`relative overflow-hidden bg-panel ${index === 0 ? "aspect-[4/3] h-full min-h-[420px]" : "aspect-[2.3/1]"}`}>
                  <MediaVisual media={item.media} sizes={index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 50vw, 100vw"} />
                  <div className="absolute inset-0 bg-linear-to-t from-hero/90 via-transparent to-transparent" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <h3 className="text-2xl font-semibold tracking-[-0.025em] text-white">{item.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/66">{item.body}</p>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-6 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2" data-reveal-group>
          {production.map((item) => (
            <article key={item.id} className="grid min-w-0 overflow-hidden border border-muted bg-white sm:grid-cols-[0.9fr_1.1fr]">
              {item.media ? (
                <div className="relative aspect-[1.55/1] overflow-hidden bg-panel sm:aspect-auto sm:min-h-[250px]">
                  <MediaVisual media={item.media} sizes="(min-width: 1024px) 24vw, 100vw" />
                </div>
              ) : null}
              <div className="p-6 sm:p-7">
                {item.note ? <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.15em] text-forge">{item.note}</p> : null}
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{item.body}</p>
                <p className="mt-5 border-t border-muted pt-4 text-xs leading-5 text-steel/80">{item.media?.caption}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 grid items-start gap-7 lg:grid-cols-[1fr_auto]">
          <BoundaryNote text={section.boundaryNote} />
          <Link href={section.secondaryAction.href} className="btn-pill-outline text-ink">
            {section.secondaryAction.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ApplicationInquiry({ section }: { section: SelfSealingTirePage["applicationAndInquiry"] }) {
  if (section.publicationStatus !== "approved") return null;
  return (
    <section id="t06" className="scroll-mt-20 border-t border-muted bg-white py-20 sm:py-24 lg:py-32" aria-labelledby="t06-title">
      <div className="container-fh">
        <ViewportHeading section={section} titleId="t06-title" />
        <div className="mt-12 grid gap-px overflow-hidden border border-muted bg-muted lg:grid-cols-2" data-reveal-group>
          <div className="bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-forge" aria-hidden="true" />
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink">{section.canConfirmLabel}</h3>
            </div>
            <ul className="mt-6 space-y-4">
              {section.canConfirm.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-steel"><Check className="mt-1 size-4 shrink-0 text-forge" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-soft p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <CircleAlert className="size-5 text-forge" aria-hidden="true" />
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink">{section.cannotGuaranteeLabel}</h3>
            </div>
            <ul className="mt-6 space-y-4">
              {section.cannotGuarantee.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-steel"><X className="mt-1 size-4 shrink-0 text-steel" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2" data-reveal-group>
          {section.audiences.map((audience) => (
            <article key={audience.id} className="flex flex-col border border-muted bg-white p-7 sm:p-9">
              <FileCheck2 className="size-6 text-forge" aria-hidden="true" />
              <h3 className="mt-6 font-display text-3xl font-700 uppercase leading-none tracking-[-0.025em] text-ink">{audience.title}</h3>
              <p className="mt-4 text-sm leading-6 text-steel">{audience.body}</p>
              <p className="mt-7 font-mono text-[0.62rem] font-bold uppercase tracking-[0.15em] text-forge">{section.inputLabel}</p>
              <ul className="mt-4 flex-1 space-y-3 border-t border-muted pt-5">
                {audience.inputs.map((input) => <li key={input} className="flex gap-3 text-sm leading-6 text-ink/76"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-forge" aria-hidden="true" />{input}</li>)}
              </ul>
              <Link href={audience.action.href} className="btn-pill-solid mt-8 w-full">
                {audience.action.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center" data-reveal>
          <Link href={section.secondaryAction.href} className="btn-pill-outline text-ink">{section.secondaryAction.label}</Link>
        </div>
      </div>
    </section>
  );
}
