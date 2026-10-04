import type { HeroProduct, HeroSlide } from "./types";

/**
 * Homepage hero content.
 *
 * Deliberately plain data — mirrors the four-product-line architecture
 * (ARCHITECTURE/page-architecture/README.md §0①) and is shaped so the CMS can
 * take it over later without touching any component. See the hero PageSpec §31
 * and §32: WordPress will own slides + card titles/images/URLs; Next.js keeps
 * the layout, overlay, animation and breakpoints.
 */

export const heroCopy = {
  eyebrow: "Factory-direct automotive manufacturing",
  /**
   * Company-level, not product-level.
   *
   * The previous H1 was "Custom Forged Wheels" — with four product lines now
   * in the nav, a wheels-only headline made the company read as a wheel shop.
   */
  headingLines: ["Forged Wheels", "& Automotive", "Components"],
  /** Rendered smaller beneath the H1, in forge orange. */
  supporting: "Engineered for performance",
  description:
    "Forged wheels, EV aluminum components, self-healing tires and custom automotive parts — engineered and manufactured for global B2B customers.",
  primaryCta: { label: "Explore products", href: "/products" },
  secondaryCta: { label: "Request a quote", href: "/request-a-quote" },
} as const;

export const heroSlides: HeroSlide[] = [
  {
    id: "slide-01",
    image: "/images/hero/hero-01.webp",
    alt: "",
    /** Framing note — helps whoever supplies the next photo. */
    subject: "Track, three-quarter front, car right of frame",
  },
  {
    id: "slide-02",
    image: "/images/hero/hero-02.webp",
    alt: "",
    subject: "High-speed pan, low angle, wheels sharp",
  },
  {
    id: "slide-03",
    image: "/images/hero/hero-03.webp",
    alt: "",
    subject: "Static, side profile, industrial backdrop",
  },
];

/**
 * ⚠️ Subtitles are kept short on purpose.
 *
 * The cards are ~273px wide at 1440px with a 16px gutter and an arrow badge,
 * which fits roughly 30 characters of 12px text on one line. Anything longer
 * wraps to two lines and the four cards then look ragged against each other.
 * Keep these under ~24 characters.
 */
export const heroProducts: HeroProduct[] = [
  {
    id: "wheels",
    title: "Forged Wheels",
    subtitle: "Monoblock · Two-piece",
    description:
      "1018 catalogue models across 15–20 inch plus off-road and HP fitments, finished to your specification.",
    href: "/products/wheels",
    image: "/images/cards/card-wheels.webp",
  },
  {
    id: "custom-aluminum",
    title: "Custom Aluminum",
    subtitle: "Drawing or sample",
    description:
      "Brackets, end covers, control arms and structural parts — built from your drawing, 3D data or sample.",
    href: "/products/custom-aluminum",
    // Close-up of a machined aluminium part — keeps all four cards in the
    // same "product detail" register rather than mixing scene photography in.
    image: "/images/cards/card-aluminum.webp",
  },
  {
    id: "ev-components",
    title: "EV Components",
    subtitle: "EV drive & battery",
    description:
      "Motor, controller and battery housings — including integrated spiral cooling channels for stator assemblies.",
    href: "/products/ev-components",
    image: "/images/cards/card-ev.webp",
  },
  {
    id: "safety-tires",
    title: "Self-Healing Tires",
    subtitle: "Self-sealing coating",
    description:
      "A polymer self-sealing layer in the inner liner closes the puncture channel in as little as 0.05 s.",
    href: "/products/safety-tires",
    image: "/images/cards/card-tires.webp",
  },
];
