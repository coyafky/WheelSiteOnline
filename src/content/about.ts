import type { AboutContent } from "./types";

export const aboutContent: AboutContent = {
  hero: {
    eyebrow: "About Fenghuai",
    heading: "One Shenzhen project interface. Specialized manufacturing behind every line.",
    lead:
      "Shenzhen Fenghuai Technology coordinates overseas automotive component programs across wheels, EV aluminum housings, custom aluminum parts and self-sealing tires.",
    companyName: "Shenzhen Fenghuai Technology Co., Ltd.",
    location: "Shenzhen · China",
    primaryAction: { label: "Discuss a project", href: "/request-a-quote?from=about" },
    secondaryAction: { label: "See manufacturing", href: "#wheel-manufacturing" },
  },
  role: {
    eyebrow: "How the group works",
    heading: "A clear commercial interface, with the responsible factory kept visible",
    body:
      "Fenghuai organizes the customer-facing project in Shenzhen. Manufacturing, engineering evidence and market documents remain tied to the legal entity and production base responsible for the selected product.",
    responsibilities: [
      {
        title: "Requirement intake",
        body: "We record the product, application, market, quantity and documents you already have.",
      },
      {
        title: "Engineering coordination",
        body: "The applicable manufacturing team reviews drawings, samples, variants and process questions.",
      },
      {
        title: "Commercial follow-through",
        body: "One project reference keeps quotation scope, changes, timing and delivery requirements connected.",
      },
      {
        title: "Evidence matching",
        body: "Certificates, reports and inspection records are checked against the issuing entity, product and market.",
      },
    ],
    disclosure:
      "The manufacturing companies operate within the same ownership group. Contracts, certifications, patents and test evidence continue to identify the actual legal entity and applicable scope.",
    groupEyebrow: "Group structure",
    groupHeading: "One ownership group, organised as an integrated chain",
    groupIntro:
      "The product lines on this site are served by production companies under the same ownership. Material, tooling, casting, precision machining and finished-product work sit in specialist operating companies rather than one general workshop, so each project is routed to the stage and the entity that actually performs the work — and that entity is the one named in the documents.",
    groupStages: [
      {
        id: "material",
        title: "Alloy material",
        body: "Base alloy melted and cast for the downstream forming and machining stages.",
      },
      {
        id: "tooling",
        title: "Mould and tooling",
        body: "Mould and tooling engineered and built for the approved part geometry.",
      },
      {
        id: "casting",
        title: "Casting and forming",
        body: "Gravity casting, low-pressure casting, die casting, flow forming and forging, selected by the approved route.",
      },
      {
        id: "machining",
        title: "Precision machining",
        body: "Critical bores, faces, interfaces and datums machined against the approved drawing.",
      },
      {
        id: "finished",
        title: "Finished component",
        body: "Product-specific finishing or assembly where the route requires it, then inspection and supply documentation.",
      },
    ],
    groupNote:
      "This describes how the group is organised, not what any one company has been verified to do. Capacity, certification, patent, customer and test claims are not inherited from the group: each is confirmed against the entity, product and market that actually holds it.",
  },
  wheelFactory: {
    anchor: "wheel-manufacturing",
    status: "approved",
    eyebrow: "Wheel manufacturing base",
    heading: "A specialized production base for wheel programs",
    lead:
      "Our wheel manufacturing base combines forming, machining and finishing resources for approved wheel and aluminum-component programs.",
    relationshipDisclosure:
      "Fenghuai is the Shenzhen commercial and project interface. The responsible manufacturing entity, route, certification requirement and production availability are confirmed for each program.",
    heroMedia: {
      wordpressId: 114,
      src: "/images/home/factory.webp",
      alt: "Aerial view of the Fenghuai wheel manufacturing base",
      caption: "Wheel and aluminum-component manufacturing base",
      hasRender: true,
      approvalStatus: "approved",
      sourceRef: "WP 114 · Hangpeng company profile p.2",
    },
    workshopsEyebrow: "Inside the production system",
    workshopsHeading: "Visible stages, shown as evidence rather than a universal sequence",
    workshopsIntro:
      "These photographs document three production environments. The actual route is selected for the approved design and does not require every product to pass through every pictured stage.",
    workshops: [
      {
        id: "casting",
        title: "Casting workshop",
        body: "Casting resources support approved wheel and aluminum-component programs. The route is confirmed against the design and required properties.",
        media: {
          wordpressId: 61,
          src: "/images/about/casting-process.webp",
          alt: "Wheel casting production line inside the manufacturing base",
          caption: "Casting workshop for wheel and aluminum-component programs",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 61 · Hangpeng company profile p.2",
        },
      },
      {
        id: "machining",
        title: "CNC machining",
        body: "CNC machining establishes controlled dimensions and interfaces. Inspection requirements are defined with the approved drawing.",
        media: {
          wordpressId: 78,
          src: "/images/about/machining-workshop.webp",
          alt: "CNC machining workshop for wheels and aluminum components",
          caption: "CNC machining workshop for controlled product interfaces",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 78 · Hangpeng company profile p.2",
        },
      },
      {
        id: "coating",
        title: "Coating and finishing",
        body: "Surface preparation and coating are planned around the approved finish, appearance standard and service environment.",
        media: {
          wordpressId: 84,
          src: "/images/about/coating-workshop.webp",
          alt: "Coating line inside the wheel manufacturing base",
          caption: "Coating and finishing line for approved product programs",
          hasRender: true,
          approvalStatus: "approved",
          sourceRef: "WP 84 · Hangpeng company profile p.2",
        },
      },
    ],
    capabilitiesEyebrow: "Program scope",
    capabilitiesHeading: "Capabilities reviewed for each wheel program",
    capabilitiesIntro:
      "Share the target size, application, quantity and finish. The manufacturing team will confirm a buildable route and the evidence required for that program.",
    capabilities: [
      "Alloy and mould engineering",
      "Gravity and low-pressure casting",
      "Flow forming",
      "Heat treatment and shot blasting",
      "CNC machining",
      "Surface preparation and coating",
    ],
    primaryAction: {
      label: "Discuss a wheel program",
      href: "/request-a-quote?product_line=wheels&from=about",
    },
    secondaryAction: { label: "View manufacturing and quality", href: "/capabilities" },
  },
  tireFactory: {
    anchor: "tire-manufacturing",
    status: "approved",
    eyebrow: "Self-sealing tire manufacturing",
    heading: "A dedicated production environment for self-sealing tire programs",
    lead:
      "Our self-sealing tire production base includes automated equipment, dedicated machinery, material handling and inspection environments presented for this product line.",
    relationshipDisclosure:
      "Fenghuai coordinates the supply program in Shenzhen. The responsible manufacturing entity, available tire models, process scope and destination-market documents are confirmed for each enquiry.",
    heroMedia: {
      wordpressId: 155,
      src: "/images/safety-tires/automated-production-line.webp",
      alt: "Robotic equipment on an enclosed self-sealing tire production line",
      caption: "Automated equipment in the self-sealing tire production base",
      hasRender: true,
      approvalStatus: "approved",
      sourceRef: "WP 155 · Loake project profile p.14",
    },
    productionEyebrow: "Inside the production environment",
    productionHeading: "Visible equipment across application, handling and inspection",
    productionIntro:
      "The images document equipment and working areas supplied for this product line. Final process flow, operating parameters and inspection points are confirmed against the applicable tire and control plan.",
    boundaryNote:
      "Production images show equipment and working environments. They do not replace a process specification, inspection record or product test report.",
    productionGroups: [
      {
        id: "application",
        title: "Automated application equipment",
        body: "An enclosed line with robotic handling is shown. Its exact process scope and current production use are confirmed with the responsible factory.",
        evidenceStatus: "supplier-stated",
        media: [
          {
            wordpressId: 155,
            src: "/images/safety-tires/automated-production-line.webp",
            alt: "Robotic equipment on an enclosed self-sealing tire production line",
            caption: "Automated production equipment",
            hasRender: true,
            approvalStatus: "approved",
            sourceRef: "WP 155 · Loake project profile p.14",
          },
        ],
      },
      {
        id: "machinery",
        title: "Dedicated production machinery",
        body: "Purpose-built machines and fixtures are visible in the production environment. A photograph alone does not establish output, cycle time or process capability.",
        evidenceStatus: "supplier-stated",
        media: [
          {
            wordpressId: 159,
            src: "/images/safety-tires/dedicated-machinery.webp",
            alt: "Dedicated production machinery in the self-sealing tire manufacturing base",
            caption: "Dedicated production machinery",
            hasRender: true,
            approvalStatus: "approved",
            sourceRef: "WP 159 · Loake project profile p.14",
          },
          {
            wordpressId: 148,
            src: "/images/safety-tires/automated-handling.webp",
            alt: "Automated handling equipment in the self-sealing tire production environment",
            caption: "Automated handling equipment",
            hasRender: true,
            approvalStatus: "approved",
            sourceRef: "WP 148 · Loake project profile p.14",
          },
        ],
      },
      {
        id: "line",
        title: "Production-line environment",
        body: "Multiple line and equipment views document the facility environment without presenting the photographs as a fixed production sequence.",
        evidenceStatus: "supplier-stated",
        media: [
          {
            wordpressId: 18,
            src: "/images/safety-tires/digital-production-line.webp",
            alt: "Production-line equipment in the self-sealing tire manufacturing base",
            caption: "Production-line equipment",
            hasRender: true,
            approvalStatus: "approved",
            sourceRef: "WP 18 · Loake project profile p.14",
          },
          {
            wordpressId: 16,
            src: "/images/safety-tires/process-equipment.webp",
            alt: "Tire-processing equipment within the production line",
            caption: "Tire-processing equipment",
            hasRender: true,
            approvalStatus: "approved",
            sourceRef: "WP 16 · Loake project profile p.14",
          },
        ],
      },
      {
        id: "material",
        title: "Material-processing stage",
        body: "A material-processing view is included in the production set. Material identity and its role in the sealing system require the applicable process documentation.",
        evidenceStatus: "supplier-stated",
        media: [
          {
            wordpressId: 145,
            src: "/images/safety-tires/material-processing.webp",
            alt: "Material-processing equipment in the self-sealing tire production base",
            caption: "Material-processing equipment",
            hasRender: true,
            approvalStatus: "approved",
            sourceRef: "WP 145 · Loake project profile p.14",
          },
        ],
      },
      {
        id: "inspection",
        title: "Inspection equipment",
        body: "Inspection equipment is visible within the production environment. Method, frequency and acceptance criteria remain model- and control-plan-specific.",
        evidenceStatus: "supplier-stated",
        media: [
          {
            wordpressId: 136,
            src: "/images/safety-tires/inspection-line.webp",
            alt: "Inspection equipment in the self-sealing tire production environment",
            caption: "Inspection equipment in the production environment",
            hasRender: true,
            approvalStatus: "approved",
            sourceRef: "WP 136 · Loake project profile p.14",
          },
        ],
      },
    ],
    evidenceEyebrow: "Verify the responsible manufacturer",
    evidenceHeading: "The entity, process and product documents must match",
    evidenceIntro:
      "A production photograph identifies an environment. A purchase decision also needs documents identifying who manufactures the tire, which models are covered and how each claim is evaluated.",
    evidenceChecklist: [
      { label: "Manufacturing entity", requirement: "Legal name, location and commercial authorization" },
      { label: "Process scope", requirement: "Applicable tire, sealing material, processing and inspection scope" },
      { label: "Equipment and facility", requirement: "Current equipment status, location and relationship to the product line" },
      { label: "Tire model evidence", requirement: "Model, size, method, conditions, date, test party and result" },
      { label: "Market documentation", requirement: "Holder, model scope, destination market, validity and publishable copy" },
      { label: "Commercial support", requirement: "Available sizes, quantity, region, inspection, warranty and service boundary" },
    ],
    primaryAction: {
      label: "Discuss a tire supply program",
      href: "/request-a-quote?product_line=safety-tires&intent=supplier_program&from=about",
    },
    secondaryAction: { label: "See self-sealing technology", href: "/products/safety-tires" },
  },
  closing: {
    eyebrow: "Company verification and contact",
    heading: "Start with the product and market you need to serve",
    body:
      "Send the product line, application, destination market and the information already available. We will identify the responsible route and the documents needed for the next review.",
    facts: [
      { label: "Company", value: "Shenzhen Fenghuai Technology Co., Ltd." },
      { label: "Project interface", value: "Shenzhen, China" },
      { label: "Public language", value: "English-first for overseas enquiries" },
      { label: "Business model", value: "B2B and qualified B2C project enquiries" },
    ],
    primaryAction: { label: "Request a project review", href: "/request-a-quote?from=about" },
    secondaryAction: { label: "Explore product lines", href: "/products" },
  },
};
