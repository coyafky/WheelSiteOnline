import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import type { ForgedWheelCustomizationPage, ForgedWheelViewport, MediaAsset } from "@/content/types";

function MediaVisual({ media, sizes }: { media: MediaAsset; sizes: string }) {
  if (!media.hasRender || media.approvalStatus !== "approved") {
    return <div className="fh-industrial-grid absolute inset-0" role="img" aria-label={media.alt} />;
  }
  return <Image src={media.src} alt={media.alt} fill className="object-cover" sizes={sizes} />;
}

function Heading({ section, dark = false }: { section: ForgedWheelViewport; dark?: boolean }) {
  return (
    <div data-reveal>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[0.64rem] font-bold tracking-[0.18em] text-forge">{section.id}</span>
        <span className={`h-px w-10 ${dark ? "bg-white/18" : "bg-ink/16"}`} aria-hidden="true" />
        <p className="eyebrow">{section.eyebrow}</p>
      </div>
      <h2 id={`${section.id.toLowerCase()}-title`} className={`mt-5 max-w-4xl font-display text-4xl font-700 uppercase leading-[0.94] tracking-[-0.035em] sm:text-5xl lg:text-6xl ${dark ? "text-white" : "text-ink"}`}>{section.heading}</h2>
      {section.lead ? <p className={`mt-6 max-w-3xl text-base leading-7 sm:text-lg sm:leading-8 ${dark ? "text-white/64" : "text-steel"}`}>{section.lead}</p> : null}
    </div>
  );
}

function Boundary({ text, dark = false }: { text?: string; dark?: boolean }) {
  return text ? <p data-reveal className={`border-l-2 border-forge pl-5 text-sm leading-6 ${dark ? "text-white/60" : "text-ink/68"}`}>{text}</p> : null;
}

function Actions({ section }: { section: ForgedWheelViewport }) {
  if (!section.primaryCta && !section.secondaryCta) return null;
  return <div className="mt-9 flex flex-wrap gap-4">{section.primaryCta ? <Link href={section.primaryCta.href} className="btn-pill-solid">{section.primaryCta.label}<ArrowDownRight className="size-4" aria-hidden="true" /></Link> : null}{section.secondaryCta ? <Link href={section.secondaryCta.href} className="btn-pill-outline text-ink">{section.secondaryCta.label}<ArrowRight className="size-4" aria-hidden="true" /></Link> : null}</div>;
}

export function ForgedWheelHero({ content }: { content: ForgedWheelCustomizationPage }) {
  const media = content.hero.items[0]?.media;
  return <section id="top" className="relative isolate overflow-hidden bg-hero text-white" aria-labelledby="forged-title"><div className="fh-industrial-grid absolute inset-0 -z-20 opacity-75" aria-hidden="true" /><div className="container-fh grid gap-12 pb-18 pt-[132px] lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end lg:gap-16 lg:pb-24 lg:pt-[168px]"><div data-reveal><p className="eyebrow">{content.hero.eyebrow}</p><h1 id="forged-title" className="mt-5 max-w-[760px] font-display text-[clamp(3rem,7.2vw,6.7rem)] font-800 uppercase leading-[0.86] tracking-[-0.04em]">{content.hero.heading}</h1><p className="mt-8 max-w-[680px] text-base leading-7 text-white/72 sm:text-lg sm:leading-8">{content.hero.lead}</p><Boundary text={content.hero.boundaryNote} dark /><Actions section={content.hero} /></div>{media ? <figure className="relative aspect-square overflow-hidden border border-white/16 bg-panel lg:aspect-[1.1/1]" data-reveal><MediaVisual media={media} sizes="(min-width: 1024px) 55vw, 100vw" /><figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-hero/90 to-transparent p-5 pt-16 text-sm text-white/72">{media.caption}</figcaption></figure> : null}</div></section>;
}

export function ForgedMaterialReview({ section }: { section: ForgedWheelCustomizationPage["materialReview"] }) {
  return <section id="wf02" className="scroll-mt-20 border-b border-muted bg-soft py-20 sm:py-24 lg:py-32" aria-labelledby="wf02-title"><div className="container-fh"><Heading section={section} /><div className="mt-12 grid gap-5 lg:grid-cols-2" data-reveal-group>{section.items.map((item) => <article key={item.id} className="min-w-0 overflow-hidden border border-muted bg-white">{item.media ? <div className="relative aspect-[1.7/1] bg-panel"><MediaVisual media={item.media} sizes="(min-width: 1024px) 50vw, 100vw" /></div> : null}<div className="p-6 sm:p-8"><p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-forge">{item.id}</p><h3 className="mt-3 text-2xl font-semibold text-ink">{item.title}</h3><p className="mt-3 text-sm leading-6 text-steel">{item.body}</p></div></article>)}</div><div className="mt-10"><Boundary text={section.boundaryNote} /></div></div></section>;
}

export function ForgedForgingRoute({ section }: { section: ForgedWheelCustomizationPage["forgingRoute"] }) {
  return <section id="wf03" className="scroll-mt-20 bg-white py-20 sm:py-24 lg:py-32" aria-labelledby="wf03-title"><div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-16"><div><Heading section={section} /><div className="mt-8"><Boundary text={section.boundaryNote} /></div></div><div className="grid gap-5 sm:grid-cols-2" data-reveal-group>{section.items.map((item) => <article key={item.id} className="min-w-0 border border-muted bg-soft p-6 sm:p-7">{item.media ? <div className="relative mb-6 aspect-[1.7/1] overflow-hidden bg-panel"><MediaVisual media={item.media} sizes="(min-width: 1024px) 30vw, 100vw" /></div> : null}<span className="font-mono text-[0.64rem] font-bold tracking-[0.18em] text-forge">{item.id}</span><h3 className="mt-4 text-xl font-semibold text-ink">{item.title}</h3><p className="mt-3 text-sm leading-6 text-steel">{item.body}</p></article>)}</div></div></section>;
}

export function ForgedCompletion({ section }: { section: ForgedWheelCustomizationPage["completion"] }) {
  return <section id="wf04" className="scroll-mt-20 border-y border-muted bg-soft py-20 sm:py-24 lg:py-32" aria-labelledby="wf04-title"><div className="container-fh"><Heading section={section} /><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>{section.items.map((item) => <article key={item.id} className="min-w-0 overflow-hidden border border-muted bg-white"><div className="relative aspect-square bg-panel">{item.media ? <MediaVisual media={item.media} sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" /> : null}</div><div className="p-5"><h3 className="text-xl font-semibold text-ink">{item.title}</h3><p className="mt-3 text-sm leading-6 text-steel">{item.body}</p></div></article>)}</div><div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto]"><Boundary text={section.boundaryNote} /><Actions section={section} /></div></div></section>;
}

export function ForgedInquiryInputs({ section }: { section: ForgedWheelCustomizationPage["inquiryInputs"] }) {
  return <section id="wf06" className="scroll-mt-20 bg-ink py-20 text-white sm:py-24 lg:py-32" aria-labelledby="wf06-title"><div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.65fr)] lg:gap-20"><div><Heading section={section} dark /><div className="mt-10 grid gap-4 sm:grid-cols-3" data-reveal-group>{section.items.map((item) => <article key={item.id} className="border border-white/12 bg-white/[0.035] p-5"><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-white/60">{item.body}</p></article>)}</div></div><div data-reveal className="lg:pt-20"><p className="border-l-2 border-forge pl-5 text-sm leading-6 text-white/64">{section.lead}</p><Actions section={section} /></div></div></section>;
}
