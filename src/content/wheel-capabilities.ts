import type { WheelManufacturingCapabilities } from "./types";

export const wheelManufacturingCapabilities: WheelManufacturingCapabilities = {
  anchor: "wheel-manufacturing",
  status: "approved",
  hero: {
    eyebrow: "Wheel manufacturing and quality",
    heading: "Engineering decisions first. Process evidence at every gate.",
    lead:
      "A wheel program moves from defined inputs to a selected forming route, planned inspection, applicable validation and documents that match the product and market.",
    disclosure:
      "Fenghuai coordinates the project in Shenzhen. The responsible manufacturing entity confirms the engineering scope, process route, test plan and supporting records for each program.",
    primaryAction: { label: "Start with engineering inputs", href: "#engineering-before-production" },
    secondaryAction: {
      label: "Discuss a wheel program",
      href: "/request-a-quote?product_line=wheels&intent=manufacturing_capability&from=capabilities",
    },
  },
  engineering: {
    id: "WM01",
    eyebrow: "Engineering before production",
    heading: "A wheel program starts with defined inputs",
    lead:
      "Target size, vehicle or application, load assumptions, styling intent, brake clearance and finish requirements are reviewed before a manufacturing route is confirmed.",
    publicationStatus: "approved",
    items: [
      {
        id: "3d-model",
        title: "3D wheel modelling",
        body: "The approved design intent is translated into controlled geometry for engineering review and production preparation.",
        media: {
          wordpressId: 65,
          src: "/images/capabilities/wheel-3d-model.webp",
          alt: "3D wheel model prepared for engineering review",
          caption: "3D wheel modelling for design review and production preparation",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 65 · Hangpeng company profile p.3",
        },
      },
      {
        id: "fea",
        title: "Finite element review",
        body: "Load cases may be evaluated against the project model to identify areas requiring design adjustment. Results stay specific to the approved model and assumptions.",
        media: {
          wordpressId: 67,
          src: "/images/capabilities/wheel-fea-review.webp",
          alt: "Finite element analysis view of a wheel design",
          caption: "Finite element review of an approved wheel model",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 67 · Hangpeng company profile p.3",
        },
      },
      {
        id: "casting-simulation",
        title: "Casting simulation",
        body: "For an applicable cast wheel program, filling and solidification behaviour can be reviewed before tooling and production decisions are finalized.",
        media: {
          wordpressId: 96,
          src: "/images/capabilities/wheel-casting-simulation.webp",
          alt: "Casting simulation view for a wheel design",
          caption: "Casting simulation for an applicable cast wheel program",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 96 · Hangpeng company profile p.3",
        },
      },
      {
        id: "reverse-engineering",
        title: "Reverse engineering",
        body: "An authorized sample or scan can support geometry capture when the customer has the right to use the reference design.",
        media: {
          wordpressId: 48,
          src: "/images/capabilities/wheel-reverse-engineering.webp",
          alt: "Reverse engineering view used to capture approved geometry",
          caption: "Geometry reconstruction for an authorized reference",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 48 · Hangpeng company profile p.3",
        },
      },
    ],
    boundaryNote:
      "Engineering images show available evaluation methods. They are not a pass report for every wheel displayed on this website.",
  },
  formingRoutes: {
    id: "WM02",
    eyebrow: "Forming routes",
    heading: "The process route follows the wheel design",
    lead:
      "Gravity casting, low-pressure casting and flow forming serve different design and program needs. Geometry, performance target, quantity and finish requirements inform the route selection.",
    publicationStatus: "approved",
    items: [
      {
        id: "gravity-casting",
        title: "Gravity casting",
        body: "A gravity-fed casting route may be considered for suitable wheel geometries and program requirements.",
        note: "Route option",
        media: {
          wordpressId: 82,
          src: "/images/capabilities/wheel-gravity-casting.webp",
          alt: "Gravity casting equipment used for applicable wheel programs",
          caption: "Gravity casting equipment for an applicable wheel route",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 82 · Hangpeng company profile p.3",
        },
      },
      {
        id: "low-pressure-casting",
        title: "Low-pressure casting",
        body: "A controlled low-pressure filling route may be considered where the approved design and material plan call for it.",
        note: "Project-specific · no dedicated image published",
      },
      {
        id: "flow-forming",
        title: "Flow forming",
        body: "For an applicable cast blank, flow forming shapes the rim section through controlled forming. It is described separately from forging.",
        note: "Route option",
        media: {
          wordpressId: 116,
          src: "/images/capabilities/wheel-flow-forming.webp",
          alt: "Flow forming equipment for an applicable cast wheel blank",
          caption: "Flow forming equipment for an applicable cast rim section",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 116 · Hangpeng company profile p.3",
        },
      },
    ],
    boundaryNote:
      "These are route options, not three mandatory stages. The responsible engineering team confirms the route for each wheel program.",
  },
  processInspection: {
    id: "WM03",
    eyebrow: "Process control",
    heading: "Inspection follows defined checkpoints",
    publicationStatus: "approved",
    items: [
      {
        id: "visual-dimensional",
        title: "Visual and dimensional inspection",
        body: "Dimensions, appearance and specified interfaces are checked against the approved drawing and control plan.",
        media: {
          wordpressId: 87,
          src: "/images/capabilities/wheel-dimensional-inspection.webp",
          alt: "Wheel undergoing visual and dimensional inspection",
          caption: "Visual and dimensional inspection",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 87 · Hangpeng company profile p.3",
        },
      },
      {
        id: "dynamic-balance",
        title: "Dynamic balance check",
        body: "Balance is evaluated with the specified wheel and test setup before the approved release decision.",
        media: {
          wordpressId: 115,
          src: "/images/capabilities/wheel-dynamic-balance.webp",
          alt: "Wheel mounted on dynamic balance test equipment",
          caption: "Dynamic balance check with the specified setup",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 115 · Hangpeng company profile p.3",
        },
      },
      {
        id: "final-inspection",
        title: "Final inspection",
        body: "Final checks confirm required appearance, identification and recorded inspection status before packing.",
        media: {
          wordpressId: 101,
          src: "/images/capabilities/wheel-final-inspection.webp",
          alt: "Operator carrying out a final wheel inspection",
          caption: "Final wheel inspection before release and packing",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 101 · Hangpeng company profile p.3",
        },
      },
    ],
    boundaryNote:
      "Inspection scope, frequency, acceptance limits and retained records are agreed for the actual program. Not every check shown necessarily applies to every wheel.",
  },
  validationTests: {
    id: "WM04",
    eyebrow: "Validation capability",
    heading: "Different tests address different wheel risks",
    publicationStatus: "approved",
    items: [
      {
        id: "impact",
        title: "Impact test",
        body: "Evaluates wheel behaviour under a defined impact condition intended to represent a severe road event.",
        note: "Risk addressed: impact behaviour",
        media: {
          wordpressId: 45,
          src: "/images/capabilities/wheel-impact-test.webp",
          alt: "Wheel impact test equipment",
          caption: "Impact test equipment for a defined validation condition",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 45 · Hangpeng company profile p.3",
        },
      },
      {
        id: "cornering-fatigue",
        title: "Dynamic cornering fatigue test",
        body: "Evaluates resistance to repeated bending loads associated with cornering conditions.",
        note: "Risk addressed: repeated bending loads",
        media: {
          wordpressId: 43,
          src: "/images/capabilities/wheel-cornering-fatigue.webp",
          alt: "Dynamic cornering fatigue test equipment for a wheel",
          caption: "Dynamic cornering fatigue test equipment",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 43 · Hangpeng company profile p.3",
        },
      },
      {
        id: "radial-fatigue",
        title: "Dynamic radial fatigue test",
        body: "Evaluates resistance to repeated radial loading associated with straight-line service conditions.",
        note: "Risk addressed: repeated radial loads",
        media: {
          wordpressId: 39,
          src: "/images/capabilities/wheel-radial-fatigue.webp",
          alt: "Dynamic radial fatigue test equipment with a mounted wheel",
          caption: "Dynamic radial fatigue test equipment",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 39 · Hangpeng company profile p.3",
        },
      },
    ],
    boundaryNote:
      "Equipment images demonstrate available test capability. Compliance is established only by a report identifying the tested wheel, method, standard revision, result and responsible laboratory.",
  },
  documentedEvidence: {
    id: "WM05",
    eyebrow: "Documented evidence",
    heading: "The document must match the product and market",
    lead:
      "Quality-system certificates describe an organization and scope. Product reports describe a specific wheel and test condition. Inspection records describe a production order or batch.",
    publicationStatus: "approved",
    items: [
      {
        id: "quality-system",
        title: "Quality-system certificate",
        body: "Legal entity, certified scope and validity are checked before a certificate is referenced publicly.",
      },
      {
        id: "validation-report",
        title: "Product validation report",
        body: "Wheel identification, method, standard revision, result and responsible laboratory must match the program.",
      },
      {
        id: "inspection-record",
        title: "Production inspection record",
        body: "The record must identify the order or batch, inspected characteristics and acceptance status.",
      },
    ],
    boundaryNote:
      "Certificate candidates remain internal until the legal entity, scope, number, validity and readable source file are confirmed. This page does not use an unsupported badge wall.",
    primaryAction: {
      label: "Discuss a wheel program",
      href: "/request-a-quote?product_line=wheels&intent=manufacturing_capability&from=capabilities",
    },
    secondaryAction: {
      label: "See our wheel manufacturing base",
      href: "/about#wheel-manufacturing",
    },
  },
};
