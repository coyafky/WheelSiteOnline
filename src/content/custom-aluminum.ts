import type { CustomAluminumPage } from "./types";

/**
 * Custom aluminum assessment page (`/products/custom-aluminum`).
 *
 * This page is a project-development route, not a catalogue. The "product" is
 * the act of turning an input — a drawing, a 3D model or a physical sample —
 * into an assessed, tooled and inspected part. Nothing on it is orderable, and
 * nothing on it is a photograph of a finished non-wheel, non-housing aluminum
 * component: the source material has no image that can be confirmed as one.
 *
 * ── WHERE THE COPIES CAME FROM ──────────────────────────────────────────────
 * Every sentence below is either verbatim from
 * `PAGE-SPECS/custom-aluminum.md` §4 or a faithful reduction of it. The
 * boundaries are not optional decoration: the page publishes what is *listed*,
 * what is *assessed per project* and what is *not yet confirmed*, and it never
 * promotes a listed direction into a shipped product.
 *
 * ── THE PUBLISHING GATE ─────────────────────────────────────────────────────
 * `boundary.declinedConfirmed` is false because the business has not confirmed
 * which categories it declines. While false:
 *   • the status matrix publishes THREE columns and no blank "what we decline"
 *     column — an empty column reads as a promise to make anything;
 *   • the route metadata stays `noindex, follow` (see page.tsx), and the
 *     component never hides the gap with CSS.
 * Give the business a confirmed declined list, set the flag, add the rows and
 * the route can be indexed.
 *
 * ── WHAT IS DELIBERATELY ABSENT ─────────────────────────────────────────────
 * No magnesium capability claim, no general heat treatment, no in-house
 * coating, no "unlimited size", no corrosion repeatability, and no
 * `competitor's part`. None of those is supported by the source material for
 * this line. No material grade, tolerance, minimum order, lead time, tool life,
 * capacity or size-envelope figure is published either, and the three
 * engineering images are labelled as methods shown on wheel geometry rather
 * than as reports for a custom aluminum part.
 */

/**
 * Enquiry context.
 *
 * The context is frozen into the URL: `product_line`, `intent`, the application
 * group, the input type and the originating page. `application` and
 * `input_type` are always present — `unspecified` when the visitor has not
 * picked one — so the enquiry record never arrives without them.
 */
const ASSESSMENT_BASE =
  "/request-a-quote?product_line=custom-aluminum&intent=project_assessment&from=custom-aluminum";

function assessmentHref(application: string, inputType: string): string {
  return `${ASSESSMENT_BASE}&application=${application}&input_type=${inputType}`;
}

/** Page-level enquiry link — nothing selected yet. */
export const customAluminumAssessmentHref = assessmentHref(
  "unspecified",
  "unspecified",
);

/**
 * The route is indexable only after both its content and business boundary are
 * approved. Keep this predicate shared by page metadata and the sitemap.
 */
export function isCustomAluminumIndexable(
  page: Pick<CustomAluminumPage, "publicationStatus" | "boundary">,
): boolean {
  return page.publicationStatus === "approved" && page.boundary.declinedConfirmed;
}

const EV_HOUSING_HREF = "/products/ev-components";

export const customAluminumPage: CustomAluminumPage = {
  slug: "custom-aluminum",
  publicationStatus: "draft",

  /* CA01 — no product photograph ------------------------------------------ */
  hero: {
    id: "CA01",
    eyebrow: "CUSTOM ALUMINUM DEVELOPMENT",
    heading: "Start with a drawing, 3D model or physical sample",
    lead: "Fenghuai coordinates drawing-led aluminum component projects through engineering assessment, tooling, first-article review and supplier-supported production.",
    boundaryNote:
      "This is a project-development route, not a catalogue. Part feasibility, material, process, inspection, quantity and delivery plan are agreed against the customer input.",
    primaryCta: { label: "See what can start an assessment", href: "#project-inputs" },
    secondaryCta: {
      label: "Start a custom aluminum assessment",
      href: "#custom-aluminum-assessment",
    },
  },

  /* The fork to the EV housing page ---------------------------------------- */
  evRoute: {
    id: "CA01-EV",
    eyebrow: "Are you on the right page?",
    heading: "Motor and controller housings have their own route",
    lead: "Water-cooled motor housings, high-pressure die-cast motor housings and controller or inverter housings are collected on the EV housing page, where cooling, sealing and interface requirements belong together.",
    categories: [
      "Water-cooled motor housing",
      "HPDC motor housing",
      "controller or inverter housing",
    ],
    prompt:
      "If the part is a motor or controller housing, use the EV housing route so cooling, sealing and interface requirements are collected correctly.",
    href: EV_HOUSING_HREF,
    linkLabel: "Go to the EV housing route",
  },

  /* CA02 — assessment scope, not a stocked range --------------------------- */
  applications: {
    id: "CA02",
    eyebrow: "Application scope",
    heading: "Application areas listed for project assessment",
    lead: "The groups below describe where a drawing-led project may begin. They are not stocked products and do not prove that every geometry, material or validation requirement is feasible.",
    scopeLabel: "Assessment scope",
    groups: [
      {
        slug: "motor-reducer",
        name: "Motor & reducer",
        examples: [
          "End covers",
          "Brackets",
          "Reducer housings",
          "Oil-cooled motor housings",
        ],
        framing: "Applications listed for project assessment",
        evidenceStatus: "supplier-stated",
        href: assessmentHref("motor-reducer", "unspecified"),
      },
      {
        slug: "power-electronics-thermal-management",
        name: "Power electronics & thermal management",
        examples: [
          "Inverter",
          "PDU",
          "OBC",
          "Water-pump housings",
          "Valve blocks",
          "Fittings",
        ],
        framing: "Drawing-led applications; not stocked parts",
        evidenceStatus: "supplier-stated",
        href: assessmentHref("power-electronics-thermal-management", "unspecified"),
      },
      {
        slug: "battery-system-structures",
        name: "Battery-system structures",
        examples: [
          "Battery enclosures",
          "End plates",
          "Cold plates",
          "Module brackets",
        ],
        framing: "Subject to size, sealing and validation review",
        evidenceStatus: "supplier-stated",
        href: assessmentHref("battery-system-structures", "unspecified"),
      },
      {
        slug: "chassis-body",
        name: "Chassis & body",
        examples: [
          "Control arms",
          "Steering knuckles",
          "Connectors",
          "Lightweight structures",
        ],
        framing: "Subject to load case, process and test review",
        evidenceStatus: "supplier-stated",
        href: assessmentHref("chassis-body", "unspecified"),
      },
    ],
    boundaryNote:
      "These names describe assessment directions listed in the supplied material. With no project drawing, part number or customer approval behind them, the page publishes no production, stock or case-study claim.",
  },

  /* CA03 — three inputs; reverse engineering sits inside the sample route -- */
  inputs: {
    id: "project-inputs",
    eyebrow: "Project inputs",
    heading: "Three inputs can start the engineering review",
    lead: "A drawing, a 3D model and a physical sample all enter the same assessment route. Each one asks something different of you, so each card states what the review needs before it can begin.",
    routes: [
      {
        id: "2d-drawing",
        title: "2D drawing",
        summary: "Dimensions, datums and tolerance intent",
        requirements: [
          "Provide dimensions, datums, critical characteristics, tolerance intent, material or performance requirements and the applicable revision.",
        ],
        href: assessmentHref("unspecified", "2d-drawing"),
      },
      {
        id: "3d-data",
        title: "3D data",
        summary: "A neutral model plus the interfaces that matter",
        requirements: [
          "Provide a neutral STEP or IGES model together with the drawing or a marked list of critical interfaces. A 3D model alone does not define acceptance.",
        ],
        href: assessmentHref("unspecified", "3d-data"),
      },
      {
        id: "physical-sample",
        title: "Physical sample",
        summary: "The part itself, with rights confirmed",
        requirements: [
          "Provide the sample, its known function, mating conditions and the features that must be reproduced. Reverse engineering is assessed after sample ownership and reproduction rights are confirmed.",
        ],
        rightsNote:
          "Submitting a sample confirms the right to deliver, measure and reproduce it for a manufacturing assessment.",
        href: assessmentHref("unspecified", "physical-sample"),
      },
    ],
    note: "Reverse engineering is part of the physical-sample route rather than a fourth option. It proceeds only once ownership and reproduction rights for the sample are confirmed, because a copy cannot be assessed before the right to make one is established.",
    rightsDeclaration:
      "The submitting party confirms they are entitled to hand over, measure and use the sample for a manufacturing assessment.",
  },

  /* CA04 — methods, with the wheel-geometry boundary attached -------------- */
  methods: {
    id: "CA04",
    eyebrow: "Engineering assessment",
    heading: "Engineering tools support the decision before tooling",
    lead: "Assessment happens before a tool is cut, so that geometry, process and acceptance criteria are agreed while changing them is still cheap.",
    items: [
      {
        id: "dfm-review",
        title: "DFM review",
        body: "Review geometry, critical interfaces, draft, machining access, joining, inspection and the risks that have to be closed before tooling.",
      },
      {
        id: "structural-analysis-example",
        title: "Structural analysis example",
        body: "The supplied material includes a structural-analysis image using wheel geometry. It demonstrates an analysis workflow example; it is not a report for a custom aluminum part.",
        media: {
          wordpressId: 67,
          src: "/images/capabilities/wheel-fea-review.webp",
          alt: "Structural analysis result plotted on a wheel design",
          caption:
            "Structural-analysis workflow example shown on wheel geometry; not a project-specific report.",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 67 · 峰徊科技_A版/A科技_产品综合介绍.md 第 04 章",
        },
      },
      {
        id: "casting-simulation-examples",
        title: "Casting simulation examples",
        body: "The supplied material includes casting-process simulation images using wheel geometry. Project-specific simulation, model assumptions and acceptance criteria must be confirmed for the actual part.",
        media: {
          wordpressId: 31,
          src: "/images/capabilities/wheel-casting-simulation.webp",
          alt: "Casting temperature simulation result plotted on a wheel design",
          caption:
            "Casting-process simulation example shown on wheel geometry; assumptions require project confirmation.",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 31 · 峰徊科技_A版/A科技_产品综合介绍.md 第 04 章",
        },
        supportingMedia: {
          wordpressId: 48,
          src: "/images/capabilities/wheel-reverse-engineering.webp",
          alt: "Casting simulation setup showing a runner and gate model",
          caption: "Casting simulation setup example from supplied material.",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 48 · 峰徊科技_A版/A科技_产品综合介绍.md 第 04 章",
        },
        // The source image is 318×204. Cap the rendered width at 318px so the
        // setup screenshot is never upscaled into something it is not.
        supportingMediaMaxWidth: 318,
      },
    ],
    evidenceNote:
      "Method examples from supplied material — not project-specific validation reports.",
  },

  /* CA05 — five auditable stages ------------------------------------------ */
  stages: {
    id: "development-flow",
    eyebrow: "Development stages",
    heading: "From engineering input to approved production",
    lead: "Five stages, in order. Each one has an exit: a project can end at any of them, and the page says so rather than presenting the sequence as a promise of production.",
    steps: [
      {
        step: "01",
        title: "Engineering assessment",
        body: "Review requirements, DFM risks, process options, evidence needs and the basis for quotation.",
      },
      {
        step: "02",
        title: "Tooling and trial",
        body: "Develop the tooling route, produce trial parts and record the drawing revision used for the first article.",
      },
      {
        step: "03",
        title: "Inspection and sample review",
        body: "Measure agreed characteristics and complete applicable performance checks before customer review.",
      },
      {
        step: "04",
        title: "Approval and engineering closure",
        body: "Record sample approval and close agreed engineering changes before the production baseline is released.",
      },
      {
        step: "05",
        title: "Pilot and serial supply",
        body: "Confirm repeatability, inspection frequency, traceability, packaging and shipment documents for the approved project.",
      },
    ],
    boundaryNote:
      "A project may stop after any stage on a technical, commercial or compliance assessment. Entering one stage does not commit either side to the next.",
  },

  /* CA06 — three columns, no blank "what we decline" ---------------------- */
  boundary: {
    id: "capability-boundary",
    eyebrow: "Boundary",
    heading: "What is listed, what is assessed and what still needs a boundary",
    lead: "Most capability pages list what a supplier can do. This one separates what the source material lists, what is decided per project, and what cannot be published yet — because the expensive failure in custom work is discovering at the end of an assessment that the part could not have been made.",
    columns: [
      {
        id: "listed",
        label: "Listed in supplier material",
        items: [
          "HPDC",
          "LPDC",
          "Gravity casting",
          "Forging",
          "CNC",
          "FSW",
          "Surface treatment",
        ],
        note: "Possible combined routes. Which manufacturing entity supplies each route, and where subcontracted work begins, is confirmed per project.",
      },
      {
        id: "assessed",
        label: "Assessed per project",
        items: [
          "Material",
          "Size",
          "Weight",
          "Wall section",
          "Tolerance",
          "Load",
          "Sealing",
          "Finish",
          "Inspection",
          "Tooling",
          "Volume",
        ],
        note: "Not every project uses every route, and a route being listed is not a statement that it runs in-house.",
      },
      {
        id: "unconfirmed",
        label: "Not yet confirmed for publication",
        items: [
          "General size and weight envelope",
          "Achievable tolerance ranges",
          "Universal material grades",
          "Minimum order",
          "Lead time",
          "Declined categories",
        ],
        note: "These are withheld deliberately. Publishing an unconfirmed figure here would be a commercial commitment, and publishing an unconfirmed exclusion would be worse.",
      },
    ],
    declined: [],
    declinedConfirmed: false,
    publicationNote:
      "The categories we decline are still being confirmed, so no “what we decline” column is published and this route stays out of search indexing. A blank column would read as a claim to take on anything.",
  },

  /* CA07 — the enquiry entry ---------------------------------------------- */
  inquiry: {
    id: "custom-aluminum-assessment",
    eyebrow: "Start an assessment",
    heading: "Send enough information for a useful first assessment",
    lead: "A first assessment is only as good as its inputs. The list below is what the engineering review works from; anything unknown stays open rather than being filled with a generic value.",
    checklistLabel: "Required inputs",
    checklist: [
      "Application and part function",
      "2D drawing, 3D model or sample status",
      "Critical dimensions, datums and tolerance intent",
      "Material or performance requirements",
      "Load, cooling, sealing or environmental conditions",
      "Surface and corrosion requirements",
      "Inspection and target-market documents",
      "Prototype quantity and expected annual volume",
      "Target sample timing and destination market",
    ],
    uploadNote:
      "No direct upload is available yet. Marking a drawing or a sample as available does not attach a file — the project team sends a controlled exchange method against your enquiry reference instead.",
    primaryCta: {
      label: "Start a custom aluminum assessment",
      href: customAluminumAssessmentHref,
    },
    secondaryCta: { label: "Contact the project team", href: "/contact" },
    contextNotice:
      "Your enquiry carries product_line=custom-aluminum together with the application group, the input type and this page as its source. NDA available for project discussion.",
  },

  closing: {
    eyebrow: "Enquiries",
    heading: "One drawing is enough to start.",
    body: "A drawing, 3D data or a physical sample all begin the same assessment route, and each stage can be stopped before the next one is committed.",
    primaryCta: {
      label: "Start a custom aluminum assessment",
      href: customAluminumAssessmentHref,
    },
    secondaryCta: { label: "Contact the project team", href: "/contact" },
  },
};
