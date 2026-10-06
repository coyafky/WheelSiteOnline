/**
 * `/products/wheels/flow-formed` — WFF01–WFF05 copy seam.
 *
 * Source of truth: `PAGE-SPECS/flow-formed-wheels.md` §3 (English copy, entered
 * verbatim) and §7 (SEO). This file holds **copy and media binding only**; the
 * model collection, the process lock and every eligibility decision come from
 * `@/lib/wheels` at render time. Nothing here can widen the page's scope.
 *
 * ── THREE THINGS THIS FILE DELIBERATELY DOES NOT DO ─────────────────────────
 * 1. It does not name the two permitted process values. They live in
 *    `FLOW_FORMED_PROCESSES` (`@/lib/wheels`), so the boundary is not editable
 *    from a prose module.
 * 2. It carries no improvement figure, no strength comparison, no weight-saving
 *    percentage and no model count. §9 forbids all four, and a field to type
 *    them into is how they come back.
 * 3. It does not describe the WP 116 image as an owned facility, a capacity
 *    proof or a photo of a specific catalogue model being made. The caption is
 *    the evidence boundary, not decoration.
 *
 * ── THE PUBLISHING GATE ─────────────────────────────────────────────────────
 * `publicationGate` is checked in `page.tsx` metadata and nowhere else. Both
 * flags are false/pending today, so the route renders in full but declares
 * `robots: { index: false, follow: true }` and publishes no canonical URL —
 * the same fail-closed pattern as `/products/custom-aluminum` (DEC-050). §7
 * requires exactly this while the process wording is unreviewed or the WP 116
 * image rights are unapproved, and it keeps the page out of the sitemap.
 *
 * Flipping a flag is the *only* edit needed to make the page indexable; there
 * is no second switch to remember.
 */

import type { FlowFormedWheelsPage } from "./types";

export const flowFormedWheelsPage: FlowFormedWheelsPage = {
  slug: "flow-formed",

  /* ── WFF01 · hero ──────────────────────────────────────────────────────── */
  hero: {
    id: "WFF01",
    breadcrumb: [
      { label: "Products", href: "/products" },
      { label: "Wheels", href: "/products/wheels" },
      // Last entry is the current page: a label, not a link (§3 WFF01).
      { label: "Flow Formed", href: "/products/wheels/flow-formed" },
    ],
    eyebrow: "FLOW-FORMED WHEELS",
    heading: "Browse flow-formed wheels by recorded production specification",
    lead: "Explore wheel models whose production data records flow forming as part of the manufacturing route. Select an actual size and PCD combination before requesting fitment and supply review.",
    boundary:
      "A recorded process and catalogue specification are the starting point. Vehicle fitment, brake clearance, load requirements, finish availability and destination-market documents are confirmed before an order is accepted.",
    primaryCta: { label: "Browse recorded models", href: "#flow-formed-models" },
    secondaryCta: { label: "Ask about a wheel requirement", href: "#flow-formed-inquiry" },
  },

  /* ── WFF02 · process boundary ──────────────────────────────────────────── */
  processDefinition: {
    id: "WFF02",
    eyebrow: "PROCESS DEFINITION",
    heading:
      "Flow forming shapes the rim section; it does not turn the wheel into a forging",
    body: "For an applicable wheel blank, controlled forming is applied to the rim section according to the approved design and process plan. The blank route, material condition, final geometry and validation requirements remain specific to the wheel program.",
    cards: [
      {
        id: "flow-formed",
        title: "Flow formed",
        body: "The catalogue records flow forming, but does not identify the blank route unless that route is separately recorded.",
      },
      {
        id: "low-pressure-flow-formed",
        title: "Low-pressure cast + flow formed",
        body: "The catalogue records both the low-pressure casting route and the subsequent flow-forming operation.",
      },
      {
        id: "forged-wheel-project",
        title: "Forged wheel project",
        body: "Forging is handled as a separate custom-development route and must not be used as an interchangeable label for a flow-formed wheel.",
        // The fork: forging is a different development route, so it leaves this
        // page instead of appearing as a fourth product card.
        href: "/products/wheels/forged",
      },
    ],
    evidenceNote:
      "Weight and performance depend on the approved design, material, process parameters and validation results. This page does not apply a universal improvement percentage.",
  },

  /* ── WFF03 · manufacturing route ───────────────────────────────────────── */
  manufacturingRoute: {
    id: "WFF03",
    eyebrow: "MANUFACTURING ROUTE",
    heading: "The route is confirmed for the actual wheel model",
    steps: [
      {
        step: "01",
        title: "Confirm the blank route",
        body: "Use the recorded route and project documents. Do not infer low-pressure casting when the catalogue only states flow forming.",
      },
      {
        step: "02",
        title: "Form the applicable rim section",
        body: "The supplier-provided equipment scene shows a flow-forming operation available for applicable wheel programs.",
      },
      {
        step: "03",
        title: "Complete the approved downstream work",
        body: "Machining, heat treatment and finish steps follow the route and drawing approved for that model; not every wheel uses an identical sequence.",
      },
      {
        step: "04",
        title: "Inspect and validate",
        body: "Dimensions, balance and applicable validation evidence are reviewed against the program control plan and target market.",
      },
    ],
    /**
     * WP 116 (944×696).
     *
     * Local WebP is the offline fallback: the WordPress adapter swaps `src` in
     * only when the media library answers, so the page renders in full with no
     * CMS running (see `@/lib/wordpress/flow-formed.ts`).
     *
     * The alt is §4 WFF03 verbatim — "an applicable wheel program", not "a cast
     * wheel blank". On *this* page the blank route is explicitly not inferred
     * from a flow-forming record (§3 WFF03 step 01, §9 bullet 2), so an alt that
     * asserts a cast blank would contradict the page it sits on.
     */
    equipment: {
      wordpressId: 116,
      src: "/images/capabilities/wheel-flow-forming.webp",
      alt: "Flow forming equipment for an applicable wheel program",
      caption:
        "Supplier-provided flow forming equipment scene. The applicable route is confirmed per wheel model.",
      hasRender: true,
      approvalStatus: "approved",
      sourceRef: "WP 116 · Hangpeng company profile p.3",
    },
    evidenceBoundary:
      "The equipment image demonstrates a supplier-provided manufacturing scene. It is not proof that every catalogue model used this machine or passed a specific test.",
  },

  /* ── WFF04 · recorded models ───────────────────────────────────────────── */
  catalogue: {
    id: "WFF04",
    eyebrow: "RECORDED MODELS",
    heading: "Filter approved flow-formed wheel specifications",
    // §3 WFF04 verbatim, split at its own sentence boundary.
    emptyResultHeading: "No approved model matches these filters.",
    emptyResultBody:
      "Clear the size and PCD filters, or send the required specification for review.",
  },

  /* ── WFF05 · fitment and supply review ─────────────────────────────────── */
  inquiry: {
    id: "WFF05",
    anchor: "flow-formed-inquiry",
    eyebrow: "FITMENT AND SUPPLY REVIEW",
    heading: "A catalogue match still needs an application review",
    checklist: [
      "Selected model and complete recorded configuration",
      "Vehicle or application, including trim and year where relevant",
      "Brake, suspension or body modifications",
      "Load and intended use",
      "Requested finish and quantity",
      "Destination market and required documents",
      "Requested sample or delivery timing",
    ],
    /**
     * The enquiry route, carrying the context §3 WFF05 requires:
     * `product_line=wheels`, `wheel_route=flow-formed` and the page source.
     * The component appends the visitor's live filter snapshot on top, so a
     * "no match" enquiry arrives already describing what was asked for.
     *
     * ⚠️ No `model` and no `productionCode` are set here. This page has no
     * variant selector, and inventing a code is exactly what §3 WFF05 forbids —
     * a visitor without a selection sends a requirement enquiry instead.
     */
    primaryCta: {
      label: "Request a flow-formed wheel review",
      href: "/request-a-quote?product_line=wheels&wheel_route=flow-formed&intent=product_inquiry&from=flow-formed",
    },
  },

  /* ── §7 · SEO ──────────────────────────────────────────────────────────── */
  seo: {
    title: "Flow-Formed Wheels by Recorded Specification | Fenghuai",
    description:
      "Browse approved wheel models recorded as flow formed or low-pressure cast plus flow formed, then select an actual specification for fitment and supply review.",
    canonical: "/products/wheels/flow-formed",
  },

  /**
   * Cleared 2026-10-06 by owner instruction, which opens the route to indexing.
   *
   * §7 keeps the page `noindex, follow` and out of the sitemap until **both**
   * are positively cleared, so this is the single switch for both. Flipping
   * either one back re-closes both — `src/app/sitemap.ts` reads this gate
   * rather than hard-coding the URL, so the two can no longer disagree.
   *
   * Recorded as instructed rather than as a formal review artefact: if a
   * written copy review or an image-rights release exists, cite it here.
   */
  publicationGate: {
    copyReviewed: true,
    equipmentImageRights: "approved",
  },
};

/** True only when every gate is positively cleared — fail-closed by default. */
export function isFlowFormedPublishingOpen(
  gate: FlowFormedWheelsPage["publicationGate"],
): boolean {
  return gate.copyReviewed === true && gate.equipmentImageRights === "approved";
}
