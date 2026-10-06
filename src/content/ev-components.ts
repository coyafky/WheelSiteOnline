import type { EvHousingPageContent } from "./types";

/**
 * EV housing assessment page (`/products/ev-components`).
 *
 * EV01–EV06 from `PAGE-SPECS/ev-components.md`. Every English sentence below is
 * either verbatim from the spec's §3 ("可直接录入的英文内容") or a faithful
 * reduction of it; the boundaries are not decoration, they are the reason the
 * page can publish at all.
 *
 * ── WHY THIS PAGE WAS REWRITTEN RATHER THAN EXTENDED ────────────────────────
 * The previous version promoted fifteen part types across three systems and
 * answered a purchasing engineer with claims the source material cannot carry
 * on this line: an oil-cooled motor housing, PDU and OBC housings, a battery
 * tray and a cold plate as if they were this line's products; an internal
 * X-ray inspection capability; and a housing programme running as "one
 * controlled flow rather than as separate subcontracts", which asserts a
 * manufacturing relationship the source does not establish. The source audit
 * (`resources/research/2026-10-05-ev-custom-aluminum-source-audit.md` §4) lists
 * every one of those as out of range. They are gone, not softened.
 *
 * ── EVIDENCE STATE, BY DESIGN ───────────────────────────────────────────────
 * `supplier-stated` — the three category names, and the LPDC / HPDC / friction
 * welding / FSW routes. They may be shown, attributed to the supplier material,
 * and must never be presented as established by a photograph.
 * `missing` — material grades, tolerances, leak rates, pressures, capacity,
 * yield, customers, vehicle programmes and IATF/ISO certification. No numeric
 * value or certification mark appears anywhere in this module, and no field
 * exists for one.
 * Media captions describe what a photograph *shows*. WP 38 is a batch of
 * machined housings in a production area: it is never welding, sealing or leak
 * testing. WP 24's spiral water passage is not visible in the image, so the
 * page never says it is. WP 49 does not demonstrate HPDC or friction welding.
 * WP 20 is not a PDU, an OBC or a named vehicle's inverter housing.
 *
 * ── THE ACTION IS AN ASSESSMENT, NOT A QUOTE ────────────────────────────────
 * The reader does not yet know whether the part can be made, so every CTA on
 * this route leads to an engineering assessment. The word quote appears
 * nowhere, and manufacturing relationship wording follows the partner boundary:
 * Fenghuai is the Shenzhen project interface, not a Shenzhen-owned plant.
 */

/**
 * Enquiry context, frozen into the URL.
 *
 * `product_line=ev-components` classifies the line; `intent=project_assessment`
 * records what the enquiry is for; `category` records which of the three
 * housing categories the visitor started from, and `evidence` records that the
 * enquiry is asking for the project evidence list. All four are always present
 * — `unspecified` when the visitor has not picked a category — so the record
 * never arrives unclassified.
 */
const ASSESSMENT_BASE =
  "/request-a-quote?product_line=ev-components&intent=project_assessment&from=ev-components";

function assessmentHref(category: string, evidence = "unspecified"): string {
  return `${ASSESSMENT_BASE}&category=${category}&evidence=${evidence}`;
}

/** Page-level enquiry link — nothing selected yet. */
export const evAssessmentHref = assessmentHref("unspecified");

/** The same link, flagged as an evidence-list request (EV05's action). */
export const evEvidenceRequestHref = assessmentHref("unspecified", "project_evidence_list");

/** Ancillary links that are not enquiry routes. */
const CUSTOM_ALUMINUM_HREF = "/products/custom-aluminum";

export const evHousingPage: EvHousingPageContent = {
  slug: "ev-components",
  publicationStatus: "approved",

  /* EV01 — the category hero ----------------------------------------------- */
  hero: {
    id: "EV01",
    eyebrow: "EV ALUMINUM HOUSINGS",
    heading: "Aluminum housings for EV motor and controller projects",
    lead: "Fenghuai provides a Shenzhen-based project interface for supplier-supported motor and power-electronics housing programs. Each project starts from the customer drawing, interface requirements and validation plan.",
    scopeLine:
      "Water-cooled motor housings · Die-cast motor housings · Controller and inverter housings",
    boundary:
      "These are engineering project categories, not stocked components. Material, process route, tolerances, sealing criteria and supply status are confirmed for each project.",
    primaryCta: { label: "View housing categories", href: "#housing-categories" },
    secondaryCta: {
      label: "Start an engineering assessment",
      href: "#engineering-assessment",
    },
    media: {
      wordpressId: 38,
      src: "/images/ev-components/batch-housings-in-production.webp",
      alt: "Batch of machined aluminum housings staged in a production area",
      caption:
        "Machined aluminum housings in a production area. The photograph shows batch staging; it is not welding, sealing or leak-test evidence.",
      hasRender: true,
      approvalStatus: "approved",
      sourceRef: "WP 38 · 峰徊科技_A版/A科技_产品综合介绍.md 第 03 章",
    },
  },

  /* EV02 — three categories, each labelled as a project category ----------- */
  categories: {
    id: "EV02",
    eyebrow: "Housing categories",
    heading: "Three housing categories in the supplied portfolio",
    sourceNote:
      "The three names below are stated in the supplier material. They are project categories for assessment, not stocked parts, and no photograph on this page establishes a process or a performance result.",
    actionLabel: "Start with this category",
    items: [
      {
        slug: "water-cooled-motor",
        publicName: "Water-cooled motor housing",
        body: "The supplier material describes a low-pressure-cast stator housing with an integrally formed spiral water passage. Cooling-channel geometry, pressure boundary and acceptance criteria must be reviewed against the customer drawing.",
        scopeLabel: "Project category — not a stock SKU",
        mediaFit: "cover",
        claimStatus: "supplier-stated",
        media: {
          wordpressId: 24,
          src: "/images/ev-components/water-cooled-housing-sample.webp",
          alt: "Aluminum motor housing presented by the supplier as a water-cooled motor housing",
          caption:
            "Housing presented by the supplier as a water-cooled motor housing. The internal water passage is not visible in this photograph.",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 24 · 峰徊科技_A版/A科技_产品综合介绍.md 第 03 章",
        },
        href: assessmentHref("water-cooled-motor"),
      },
      {
        slug: "die-cast-motor",
        publicName: "Die-cast motor housing",
        body: "The supplier material describes high-pressure die casting, precision machining and a welded cooling route for motor-housing programs. The applicable joining method and validation plan are confirmed per part.",
        scopeLabel: "Project category — not a stock SKU",
        mediaFit: "cover",
        claimStatus: "supplier-stated",
        media: {
          wordpressId: 49,
          src: "/images/ev-components/motor-housing-sample.webp",
          alt: "Machined aluminum motor housing with coolant connections, supplier-provided example",
          caption:
            "Machined motor housing from the supplier material. This photograph does not by itself establish high-pressure die casting, friction welding or serial production.",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 49 · 峰徊科技_A版/A科技_产品综合介绍.md 第 03 章",
        },
        href: assessmentHref("die-cast-motor"),
      },
      {
        slug: "controller-inverter",
        publicName: "Controller / inverter housing",
        body: "A machined aluminum enclosure route for controller or inverter projects, where cooling features, sealing faces, connector interfaces and mounting locations are defined by the customer design.",
        scopeLabel: "Project category — not a stock SKU",
        mediaFit: "contain",
        claimStatus: "supplier-stated",
        media: {
          wordpressId: 20,
          src: "/images/ev-components/controller-housing-sample.webp",
          alt: "Machined aluminum controller or inverter housing, supplier-provided example",
          caption:
            "Machined housing from the supplier material, presented as a controller or inverter housing candidate. The specific part name and rights are still being confirmed.",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 20 · 峰徊科技_A版/A科技_产品综合介绍.md 第 03 章",
        },
        href: assessmentHref("controller-inverter"),
      },
    ],
  },

  /* EV03 — the three questions the drawing has to resolve together --------- */
  engineeringConcerns: {
    id: "EV03",
    eyebrow: "Engineering concerns",
    heading: "The drawing has to resolve cooling, sealing and interfaces together",
    items: [
      {
        id: "cooling-path",
        title: "Cooling path",
        body: "Confirm how the water or oil passage is formed, closed, cleaned and inspected before tooling is approved.",
      },
      {
        id: "sealing-boundary",
        title: "Sealing boundary",
        body: "Define every pressure boundary, sealing face, joint and acceptance method. A housing photo does not establish leak performance.",
      },
      {
        id: "critical-interfaces",
        title: "Critical interfaces",
        body: "Identify bores, bearing locations, flange faces, connector positions and datums that control assembly.",
      },
    ],
  },

  /* EV04 — the stated route, with its capability boundary attached --------- */
  processRoutes: {
    id: "EV04",
    eyebrow: "Process route",
    heading: "A process route is selected for the part, not from a fixed menu",
    steps: [
      {
        step: "01",
        title: "Casting route review",
        body: "LPDC, HPDC or gravity casting are reviewed as supplier-stated options for the part.",
      },
      {
        step: "02",
        title: "Tooling and trial",
        body: "Tooling concept, trial casting and first-part review against the drawing revision.",
      },
      {
        step: "03",
        title: "Precision machining",
        body: "Critical bores, faces, interfaces and datums are finished from the agreed reference.",
      },
      {
        step: "04",
        title: "Joining and closure",
        body: "Friction welding or FSW only where the approved route requires it.",
      },
      {
        step: "05",
        title: "Cleaning and inspection",
        body: "Dimensional and leak-test planning against the drawing and its acceptance criteria.",
      },
    ],
    disclosure:
      "The route above describes supplier-stated capability. It does not mean every housing uses every process or that each process is owned by the Shenzhen company.",
  },

  /* EV05 — what to request, at three gates --------------------------------- */
  evidenceMatrix: {
    id: "EV05",
    eyebrow: "Evidence",
    heading: "Evidence is agreed with the validation plan",
    columns: {
      item: "Evidence item",
      beforeQuotation: "Before quotation",
      beforeSampleApproval: "Before sample approval",
      beforeSerialSupply: "Before serial supply",
    },
    rows: [
      {
        item: "Drawing revision and critical characteristics",
        beforeQuotation: "Required",
        beforeSampleApproval: "Frozen revision",
        beforeSerialSupply: "Controlled revision",
      },
      {
        item: "Material and process route",
        beforeQuotation: "Proposed",
        beforeSampleApproval: "Sample record",
        beforeSerialSupply: "Lot traceability plan",
      },
      {
        item: "Dimensional inspection",
        beforeQuotation: "Scope agreed",
        beforeSampleApproval: "First-article results",
        beforeSerialSupply: "Control plan",
      },
      {
        item: "Leak / pressure test",
        beforeQuotation: "Method requested",
        beforeSampleApproval: "Results where applicable",
        beforeSerialSupply: "Frequency and acceptance agreed",
      },
      {
        item: "Target-market documents",
        beforeQuotation: "Requirements listed",
        beforeSampleApproval: "Applicable documents reviewed",
        beforeSerialSupply: "Shipment documents agreed",
      },
    ],
    note: "This matrix defines the evidence to request at each gate. It is not a statement that the current portfolio already holds every record, and it publishes no figure for a grade, tolerance, leak rate, pressure, capacity or certification.",
    action: {
      label: "Request the project evidence list",
      href: evEvidenceRequestHref,
    },
  },

  /* EV06 — the engineering assessment entry -------------------------------- */
  inquiry: {
    id: "EV06",
    anchor: "engineering-assessment",
    eyebrow: "Engineering assessment",
    heading: "Start with the part and its acceptance conditions",
    lead: "A first assessment is only as good as its inputs. The list below is what the engineering review works from; anything unknown stays open rather than being filled with a generic value.",
    checklistLabel: "Required inputs",
    checklist: [
      "Housing category and application",
      "2D drawing and available 3D data",
      "Critical interfaces and datums",
      "Cooling medium, pressure and sealing boundary",
      "Material or performance requirements",
      "Prototype and annual quantity",
      "Target market and required documents",
      "Requested sample timing",
    ],
    uploadNote:
      "No direct upload is available on this page. The project team replies with an enquiry reference and a controlled exchange method for drawings and samples.",
    primaryCta: {
      label: "Start an engineering assessment",
      href: evAssessmentHref,
    },
    secondaryCta: {
      label: "See the custom aluminum route",
      href: CUSTOM_ALUMINUM_HREF,
    },
    contextNotice:
      "Your enquiry carries product_line=ev-components, the housing category you selected, this page as its source and the evidence you asked for. NDA available for project discussion.",
  },
};
