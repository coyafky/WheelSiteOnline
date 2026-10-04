import type { ReactNode } from "react";

/**
 * Shared page-opening dark hero.
 *
 * This is the "identity band" pattern described in DESIGN.md §1.2 and §3:
 * a dark ink surface carrying a radial forge glow and a faint diagonal
 * texture. Before this component existed the same three-layer composition
 * was copied verbatim into 19 page files.
 *
 * The composition is intentionally identical everywhere — the band tells the
 * visitor "this is what this page is", so it must not drift per page.
 */

export type PageHeroProps = {
  /** id for aria-labelledby on the section */
  id?: string;
  /** id applied to the <h1>, referenced by aria-labelledby */
  titleId: string;
  /** Small label above the heading (rendered in .eyebrow / forge) */
  eyebrow?: string;
  /** Optional breadcrumb node rendered above the eyebrow */
  breadcrumb?: ReactNode;
  /** Page heading — rendered as <h1> */
  heading: ReactNode;
  /** Lead paragraph (larger, white/75) */
  lede?: ReactNode;
  /** Supporting paragraph (smaller, white/55) */
  supporting?: ReactNode;
  /** CTAs / extra content below the copy */
  children?: ReactNode;
  /** Heading max-width when the title is short (about-page uses 1000px) */
  headingMaxWidth?: string;
  /** Optional page-specific WebP backdrop. The ink layer remains the base. */
  backgroundImage?: { src: string; alt: string };
};

export function PageHero({
  id = "top",
  titleId,
  eyebrow,
  breadcrumb,
  heading,
  lede,
  supporting,
  children,
  headingMaxWidth = "1000px",
  backgroundImage,
}: PageHeroProps) {
  return (
    <section
      id={id}
      aria-labelledby={titleId}
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

      {backgroundImage ? (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-25" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- curated page WebP backdrop */}
          <img
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            width={1440}
            height={810}
            className="size-full object-cover object-center mix-blend-screen"
          />
          <span className="absolute inset-0 bg-ink/70" />
        </div>
      ) : null}

      <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
        {breadcrumb}

        {eyebrow ? <p className="eyebrow !text-forge">{eyebrow}</p> : null}

        <h1
          id={titleId}
          style={{ maxWidth: headingMaxWidth }}
          className="mt-5 font-display text-[clamp(2.6rem,7.6vw,5.4rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-white"
        >
          {heading}
        </h1>

        {lede ? (
          <p className="mt-7 max-w-[700px] text-[1.05rem] leading-relaxed text-white/75">
            {lede}
          </p>
        ) : null}

        {supporting ? (
          <p className="mt-4 max-w-[660px] text-sm leading-relaxed text-white/55">
            {supporting}
          </p>
        ) : null}

        {children ? <div className="mt-9 flex flex-wrap gap-4">{children}</div> : null}
      </div>
    </section>
  );
}
