import type { ForgedWheelCustomizationPage, MediaAsset } from "./types";

const forgedCta = "/request-a-quote?product_line=wheels&wheel_process=forged&intent=custom_program";
const sourceRef = "航鹏画册组最终稿(1).pdf · PDF 4 / printed 05–06";

function media(wordpressId: number, src: string, alt: string, caption: string): MediaAsset {
  return { wordpressId, src, alt, caption, hasRender: true, approvalStatus: "approved", sourceRef };
}

export const forgedWheelCustomizationPage: ForgedWheelCustomizationPage = {
  slug: "forged",
  publicationStatus: "approved",
  hero: {
    id: "WF01",
    eyebrow: "CUSTOM FORGED WHEELS",
    heading: "A forged wheel program built around an approved specification",
    lead: "Fenghuai coordinates custom forged wheel programs with the responsible manufacturing partner, from engineering input and material review through forming, machining, finish and inspection.",
    boundaryNote: "Fenghuai is your Shenzhen commercial and project interface. Manufacturing scope, available processes and validation requirements are confirmed for the actual program.",
    items: [{ id: "wheel-example", title: "Forged wheel design example", body: "A reference image for discussing a custom wheel program.", media: media(42, "/images/capabilities/wheel-3d-model.webp", "Forged aluminum wheel design example for a custom program", "Forged aluminum wheel design example") }],
    primaryCta: { label: "Start a forged wheel project", href: forgedCta },
    secondaryCta: { label: "See manufacturing capability", href: "/capabilities#wheel-manufacturing" },
    publicationStatus: "approved",
  },
  materialReview: {
    id: "WF02",
    eyebrow: "MATERIAL AND DESIGN REVIEW",
    heading: "Material choice begins with the application",
    lead: "Wheel geometry, service conditions, target market, load assumptions, finish requirements and production quantity are reviewed before a material and process route is confirmed.",
    items: [
      { id: "aluminum", title: "Forged aluminum", body: "Forged aluminum may be considered where the approved wheel design and program requirements call for its combination of formability, strength and finish options.", media: media(42, "/images/capabilities/wheel-3d-model.webp", "Forged aluminum wheel design example for a custom program", "Forged aluminum wheel design example") },
      { id: "magnesium", title: "Forged magnesium", body: "A forged magnesium route requires program-specific review of material supply, corrosion protection, finish, validation and target-market requirements." },
    ],
    boundaryNote: "Share the intended application and required specification before selecting a material route. This page does not rank materials or publish a weight comparison.",
    publicationStatus: "approved",
  },
  forgingRoute: {
    id: "WF03",
    eyebrow: "FORGING ROUTE",
    heading: "An approved billet is formed for the machining stage",
    lead: "The forming route is confirmed against the selected material, geometry and manufacturing plan; the process images show an available environment, not a fixed public specification.",
    items: [
      { id: "01", title: "Material and billet review", body: "Material identity and the billet route are confirmed against the approved program requirements before forming." },
      { id: "02", title: "Controlled heating and forming", body: "The forming plan is established for the selected material, geometry and manufacturing route." },
      { id: "03", title: "Forging operation", body: "The responsible manufacturing team confirms the press, tooling and process settings required for the approved design.", media: media(29, "/images/capabilities/forging-production-line.webp", "Forging press at the partner manufacturing facility", "Forging press at the partner manufacturing facility") },
      { id: "04", title: "Forged blank inspection", body: "The forged blank is evaluated against the defined checkpoints before machining continues." },
    ],
    boundaryNote: "Equipment images demonstrate an available process environment. Press capacity, alloy grade, inspection method and production availability are confirmed for the actual program.",
    publicationStatus: "approved",
  },
  completion: {
    id: "WF04",
    eyebrow: "FROM FORGED BLANK TO FINISHED WHEEL",
    heading: "Each manufacturing step answers a different requirement",
    items: [
      { id: "inspection", title: "Forged blank inspection", body: "An applicable inspection method may be used to evaluate the forged blank before further processing. The method and frequency follow the approved control plan.", media: media(58, "/images/capabilities/inspection-camera.webp", "Inspection of a forged wheel blank before machining", "Inspection of a forged wheel blank before machining") },
      { id: "cnc", title: "CNC machining", body: "Controlled machining creates the approved wheel geometry, mounting interfaces and other specified features.", media: media(70, "/images/capabilities/machining-process.webp", "CNC machining of an approved custom wheel design", "CNC machining of an approved custom wheel design") },
      { id: "finish", title: "Finish development", body: "Colour, surface preparation and coating requirements are defined against an approved finish sample and service environment.", media: media(30, "/images/capabilities/casting-control-panel.webp", "Wheel finish samples used for colour and appearance review", "Wheel finish samples used for colour and appearance review") },
      { id: "product-check", title: "Product inspection", body: "Specified dimensions, appearance and recorded inspection status are checked before release.", media: media(76, "/images/capabilities/worker-inspection.webp", "Operator carrying out a product inspection on a wheel", "Operator carrying out a product inspection on a wheel") },
    ],
    boundaryNote: "Process images show available manufacturing stages. They do not establish compliance for a wheel without its approved drawing, control plan and applicable records.",
    secondaryCta: { label: "View wheel manufacturing and quality", href: "/capabilities#wheel-manufacturing" },
    publicationStatus: "approved",
  },
  inquiryInputs: {
    id: "WF06",
    eyebrow: "START WITH THE PROJECT INPUTS",
    heading: "Share what is known; the engineering review can define what is missing",
    lead: "You do not need a complete drawing to start a discussion. Unknown values remain open until they are reviewed and approved; they are not filled with generic specifications.",
    items: [
      { id: "application", title: "Application", body: "Vehicle or application; brake-clearance or package constraints." },
      { id: "wheel-specification", title: "Wheel specification", body: "Target diameter and width; required PCD, offset and centre bore, if known." },
      { id: "program", title: "Program", body: "Target market, validation requirements, expected quantity, timing, finish, colour, branding and available drawings, scans or reference samples." },
    ],
    primaryCta: { label: "Start a forged wheel project", href: forgedCta },
    secondaryCta: { label: "Contact the project team", href: "/contact" },
    publicationStatus: "approved",
  },
};
