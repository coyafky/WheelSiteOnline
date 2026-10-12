import type { ReactNode } from "react";

/**
 * Shared page-opening identity band.
 *
 * Two tones, one composition:
 *
 *  - `tone="light"` (default) is the warm paper surface described in
 *    DESIGN.md §1.2/§3: near-white base, faint copper radial wash, hairline
 *    grid. Before this component existed the same three layers were copied
 *    verbatim into 19 page files. Its rendered output is unchanged by the
 *    `tone` addition — P1's `/about`, `/capabilities`, `/products`,
 *    `/custom-development` and `/request-a-quote` keep the exact bytes.
 *  - `tone="dark"` is the ink surface used where the page family carries an
 *    engineering tone or a photographic band (`/fitment`, `/dealers*`,
 *    `/gallery/finishes`, `/tools*`, `/support/*`). P1 kept those surfaces
 *    deliberately (report 28 §2.5) — but the *composition* had drifted: the
 *    radial-gradient position, its alpha, the heading clamp and the layer
 *    opacity all differed per file across the ten hand-rolled copies.
 *    Folding them into this component removes that drift without changing
 *    the tone.
 *
 * The tone decides the surface and the copy colours. Deciding heading colour
 * by tone rather than by inheritance also guards the bug class P1 found: an
 * `<h1>` that relies on inherited colour picks up the theme's light-mode ink
 * on a dark surface and becomes unreadable.
 */

export type PageHeroTone = "light" | "dark";

export type PageHeroProps = {
  /** id for aria-labelledby on the section */
  id?: string;
  /** id applied to the <h1>, referenced by aria-labelledby */
  titleId: string;
  /** Surface tone. Defaults to the warm-light identity band. */
  tone?: PageHeroTone;
  /** Small label above the heading (rendered in .eyebrow / forge) */
  eyebrow?: string;
  /** Optional breadcrumb node rendered above the eyebrow */
  breadcrumb?: ReactNode;
  /** Page heading — rendered as <h1> */
  heading: ReactNode;
  /** Lead paragraph (larger) */
  lede?: ReactNode;
  /** Supporting paragraph (smaller) */
  supporting?: ReactNode;
  /** CTAs / extra content below the copy */
  children?: ReactNode;
  /** Heading max-width when the title is short (about-page uses 1000px) */
  headingMaxWidth?: string;
  /** Optional page-specific WebP backdrop. The ink layer remains the base. */
  backgroundImage?: { src: string; alt: string };
  /** Optional node rendered between the breadcrumb and the eyebrow (e.g. a badge). */
  leading?: ReactNode;
};

export function PageHero({
  id = "top",
  titleId,
  tone = "light",
  eyebrow,
  breadcrumb,
  leading,
  heading,
  lede,
  supporting,
  children,
  headingMaxWidth = "1000px",
  backgroundImage,
}: PageHeroProps) {
  const dark = tone === "dark";
  // The dark family pairs a breadcrumb / leading node with the eyebrow and
  // spaces the eyebrow off it; the light family renders the eyebrow flush.
  const spacedEyebrow = dark && (breadcrumb || leading);

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      data-reveal
      className={
        dark
          ? "relative isolate overflow-hidden bg-ink text-white"
          : "relative isolate overflow-hidden border-b border-border bg-background text-ink"
      }
    >
      <div
        className={
          dark
            ? "pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_78%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
            : "pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_90%_at_90%_0%,rgba(199,124,69,0.12)_0%,rgba(251,250,247,0)_66%)]"
        }
        aria-hidden="true"
      />
      <div
        className={
          dark
            ? "pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
            : "pointer-events-none absolute inset-0 -z-10 opacity-[0.18] [background-image:repeating-linear-gradient(115deg,var(--fh-muted)_0_1px,transparent_1px_64px)]"
        }
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
          <span className="absolute inset-0 bg-background/50" />
        </div>
      ) : null}

      <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
        {breadcrumb}

        {leading}

        {/* On the dark tone the light-surface accent (--fh-forge #9b4b1d) measures
            2.45:1 against --fh-ink, a WCAG 1.4.3 failure; the bright variant
            measures 4.88:1. Tone is already the surface signal, so the accent
            follows it. */}
        {eyebrow ? (
          <p
            className={`eyebrow ${tone === "dark" ? "!text-forge-bright" : "!text-forge"}${spacedEyebrow ? " mt-6" : ""}`}
          >
            {eyebrow}
          </p>
        ) : null}

        <h1
          id={titleId}
          style={{ maxWidth: headingMaxWidth }}
          className={`mt-5 font-display text-[clamp(2.6rem,7.6vw,5.4rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {heading}
        </h1>

        {lede ? (
          <p
            className={`mt-7 max-w-[700px] text-[1.05rem] leading-relaxed ${
              dark ? "text-white/75" : "text-steel"
            }`}
          >
            {lede}
          </p>
        ) : null}

        {supporting ? (
          <p
            className={`mt-4 max-w-[660px] text-sm leading-relaxed ${
              dark ? "text-white/55" : "text-steel"
            }`}
          >
            {supporting}
          </p>
        ) : null}

        {children ? <div className="mt-9 flex flex-wrap gap-4">{children}</div> : null}
      </div>
    </section>
  );
}
