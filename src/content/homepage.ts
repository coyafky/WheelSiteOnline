import type { HomepageContent } from "./types";

export const homepageContent: HomepageContent = {
  hero: {
    eyebrow: "Four product lines · One project interface",
    heading: "Automotive components backed by specialized manufacturing",
    lead:
      "Fenghuai integrates wheel, EV housing, custom aluminum and self-sealing tyre manufacturing for overseas buyers—from requirement review and engineering input to production documentation.",
    disclosure:
      "Manufacturing is carried out across our specialized production bases. The responsible facility, capability, certification and supply scope are confirmed for each project.",
    mediaLabel: "Our wheel manufacturing facility",
    media: {
      wordpressId: 114,
      src: "/images/home/factory.webp",
      alt: "Aerial view of the Fenghuai wheel manufacturing facility",
      caption: "Fenghuai wheel manufacturing base",
      hasRender: true,
      approvalStatus: "approved",
      sourceRef: "WP 114",
    },
    primaryAction: { label: "Explore product lines", href: "#product-lines" },
    secondaryAction: {
      label: "Request a project review",
      href: "/request-a-quote?from=home",
    },
  },
  productLines: {
    eyebrow: "Product lines",
    heading: "Four product lines, each with its own engineering route",
    intro:
      "Choose the line that matches the part or supply requirement. Product data, manufacturing route and validation evidence are reviewed within that line rather than treated as one universal process.",
    actionLabels: {
      wheels: "Explore wheels",
      "ev-components": "Review EV housing categories",
      "custom-aluminum": "Start with your input",
      "safety-tires": "Review self-sealing tires",
    },
  },
  capabilities: {
    eyebrow: "Manufacturing and engineering",
    heading: "Capability is useful only when its scope and evidence are clear",
    items: [
      {
        id: "01",
        title: "Engineering review",
        body: "Drawings, 3D data, samples and application requirements are reviewed before a route is confirmed.",
        appliesTo: ["All project lines"],
        evidenceStatus: "supplier-stated",
      },
      {
        id: "02",
        title: "Casting and forming routes",
        body: "Gravity casting, low-pressure casting, flow forming, die casting and forging are route options across defined product lines.",
        appliesTo: ["Wheels", "EV housings", "Custom aluminum"],
        evidenceStatus: "supplier-stated",
      },
      {
        id: "03",
        title: "Precision machining",
        body: "Critical bores, faces, interfaces and datums are machined and inspected against the approved drawing.",
        appliesTo: ["Wheels", "EV housings", "Custom aluminum"],
        evidenceStatus: "supplier-stated",
      },
      {
        id: "04",
        title: "Product-specific processes",
        body: "Joining, coating, heat treatment or sealing-layer application is included only where the approved product route requires it.",
        appliesTo: ["Route dependent"],
        evidenceStatus: "supplier-stated",
      },
      {
        id: "05",
        title: "Inspection and validation",
        body: "Dimensions, balance, leak boundaries, fatigue or puncture conditions are planned for the applicable product and market.",
        appliesTo: ["Product and market dependent"],
        evidenceStatus: "supplier-stated",
      },
      {
        id: "06",
        title: "Documented evidence",
        body: "Certificates, test reports and inspection records are checked for the legal entity, scope, product and validity.",
        appliesTo: ["Approved project evidence"],
        evidenceStatus: "verified",
      },
    ],
    action: { label: "See manufacturing & quality", href: "/capabilities" },
  },
  delivery: {
    eyebrow: "From requirement to approved supply",
    heading: "One project interface, product-specific manufacturing routes",
    lead:
      "Fenghuai coordinates one commercial and project interface in Shenzhen across our specialized manufacturing bases. Those bases sit within the same ownership group and together cover material, tooling, casting and precision machining stages. The responsible facility, process route, validation plan and document set are confirmed for the selected product line.",
    stages: [
      {
        id: "01",
        title: "Define the requirement",
        body: "Start from a recorded wheel variant, a drawing, 3D data, a sample or a tire supply requirement.",
      },
      {
        id: "02",
        title: "Confirm the responsible route",
        body: "Identify the manufacturing entity, process scope, engineering owner and evidence needed for the project.",
      },
      {
        id: "03",
        title: "Select or develop the product",
        body: "Review an existing specification, or proceed through tooling, trial and first-article work where development is required.",
      },
      {
        id: "04",
        title: "Inspect and approve",
        body: "Evaluate agreed characteristics and applicable validation evidence before the supply baseline is released.",
      },
      {
        id: "05",
        title: "Supply with records",
        body: "Confirm repeatability, traceability, packaging and the documents required for the approved order or batch.",
      },
    ],
    evidence: [
      {
        id: "wheel-manufacturing",
        label: "Our wheel manufacturing base",
        body: "Wheel forming and production equipment support the route selected for the approved wheel program.",
        media: {
          wordpressId: 61,
          src: "/images/about/casting-process.webp",
          alt: "Wheel casting production line inside a Fenghuai manufacturing facility",
          caption: "Fenghuai wheel manufacturing base",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 61 / WP 116",
        },
      },
      {
        id: "aluminum-production",
        label: "Our aluminum component base",
        body: "Machining and housing production resources are assigned to the approved aluminum component route.",
        media: {
          wordpressId: 78,
          src: "/images/about/machining-workshop.webp",
          alt: "Aluminum component machining workshop inside a Fenghuai manufacturing facility",
          caption: "Fenghuai aluminum component manufacturing base",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 78 / WP 38",
        },
      },
      {
        id: "tire-production",
        label: "Our self-sealing tire production base",
        body: "A dedicated hot-melt coating line supports approved self-sealing tire programs and their documented process route.",
        media: {
          wordpressId: 155,
          src: "/images/safety-tires/automated-production-line.webp",
          alt: "Robotic hot-melt coating line inside a Fenghuai self-sealing tire production facility",
          caption: "Fenghuai self-sealing tire production base",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 155",
        },
      },
    ],
    action: { label: "How projects are developed", href: "/custom-development" },
  },
  closing: {
    eyebrow: "Start with what you have",
    heading: "Send a model, a drawing or the requirement you need to solve",
    body: "Tell us the product line, destination market and what information is already available. We will use the enquiry reference to continue the specification and evidence review.",
    inputLabel: "Suggested starting inputs",
    inputPrompts: [
      "Recorded model or complete wheel specification",
      "2D drawing, 3D data or authorized physical sample",
      "Application, quantity, market and required documents",
    ],
    primaryAction: {
      label: "Request a project review",
      href: "/request-a-quote?from=home",
    },
    secondaryAction: { label: "Explore all product lines", href: "/products" },
  },
};
