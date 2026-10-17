import type {
  MediaAsset,
  SelfSealingTirePage,
  TireViewportItem,
} from "./types";

const sourceRef = "2024洛克项目介绍-手机端(12.12).pdf";
const generatedMechanismSourceRef =
  "AI-generated explanatory illustration based on the approved supplier-stated sealing mechanism copy; not a test photograph or test report";

function media(
  wordpressId: number,
  src: string,
  alt: string,
  caption: string,
): MediaAsset {
  return {
    wordpressId,
    src,
    alt,
    caption,
    hasRender: true,
    approvalStatus: "approved",
    sourceRef,
  };
}

function generatedMechanismMedia(
  src: string,
  alt: string,
  caption: string,
): MediaAsset {
  return {
    src,
    alt,
    caption,
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: generatedMechanismSourceRef,
  };
}

const painItems: TireViewportItem[] = [
  {
    id: "01",
    title: "Air loss after a tread puncture",
    body: "A penetrating object can create an air-loss path and force the driver to respond before continuing the journey.",
    media: media(151, "/images/safety-tires/roadside-nail.webp", "Nail embedded in the tread of a tire", "A penetrating object lodged in the tread area"),
  },
  {
    id: "02",
    title: "Changing a tire at the roadside",
    body: "The driver may not have the tools, experience or safe working space required for a roadside wheel change.",
    media: media(122, "/images/safety-tires/roadside-tire-change.webp", "Driver attempting to change a tire at the roadside", "A roadside wheel change in an uncontrolled environment"),
  },
  {
    id: "03",
    title: "Repair or replacement",
    body: "Workshop time and the condition of the tire determine whether inspection, repair or replacement is required.",
    media: media(137, "/images/safety-tires/workshop-replacement.webp", "Workshop technician carrying a replacement tire", "Workshop inspection determines the next action for a damaged tire"),
  },
  {
    id: "04",
    title: "Towing and delay",
    body: "Waiting for roadside assistance adds cost and interrupts personal, commercial or fleet travel.",
    media: media(130, "/images/safety-tires/roadside-recovery.webp", "Roadside recovery truck transporting a vehicle", "Roadside recovery can add time and cost to a puncture event"),
  },
];

const definitionItems: TireViewportItem[] = [
  {
    id: "road-use",
    title: "Normal road use",
    body: "The product concept is intended to help limit immediate air loss from an applicable puncture through the tread area.",
    media: media(153, "/images/safety-tires/road-use.webp", "Close view of a tire in normal road use", "Tire shown in normal road use in supplier project materials"),
  },
  {
    id: "puncture-detail",
    title: "The puncture area matters",
    body: "The illustrated response concerns the tread and internal sealing layer. Sidewall, shoulder, impact and structural damage require a different assessment.",
    media: media(144, "/images/safety-tires/puncture-closeup.webp", "Tire tread shown with a puncturing object", "Close view of a puncturing object in the tire tread"),
  },
];

const mechanismItems: TireViewportItem[] = [
  {
    id: "01",
    title: "Object enters the tread area",
    body: "The object passes through the tread and into the sealing layer on the inner liner.",
    media: generatedMechanismMedia(
      "/images/safety-tires/mechanism-entry.webp",
      "Explanatory cutaway showing an object entering the tire tread and sealing layer",
      "Explanatory illustration of the initial tread-puncture stage; not a test result",
    ),
  },
  {
    id: "02",
    title: "The material surrounds the object",
    body: "The sealing material closes around the penetrating object and helps limit the air path while it remains in place.",
    media: generatedMechanismMedia(
      "/images/safety-tires/mechanism-surround.webp",
      "Explanatory cutaway showing sealing material surrounding a penetrating object",
      "Explanatory illustration of sealing material around the object; not a test result",
    ),
  },
  {
    id: "03",
    title: "The channel closes after removal",
    body: "When the object is removed, the material recovers over the channel. The tire still requires inspection to confirm its condition.",
    media: generatedMechanismMedia(
      "/images/safety-tires/mechanism-close.webp",
      "Explanatory cutaway showing the sealing layer closing the channel after object removal",
      "Explanatory illustration of channel closure after object removal; inspection remains required",
    ),
  },
];

const validationItems: TireViewportItem[] = [
  {
    id: "measurement",
    title: "Test object recorded",
    body: "The test object and its geometry belong in the applicable test record rather than being inferred from a marketing image.",
    media: media(156, "/images/safety-tires/test-spike-measurement.webp", "Measurement of a puncture-test spike used in an internal tire evaluation", "Measurement scene from a supplier-stated internal puncture evaluation"),
  },
  {
    id: "approach",
    title: "Controlled puncture position",
    body: "The tire model, pressure, puncture position and procedure determine what the evaluation can support.",
    media: media(135, "/images/safety-tires/test-board-approach.webp", "Tire approaching a controlled puncture-test board", "Tire approaching a puncture-test board during an internal evaluation"),
  },
  {
    id: "pass",
    title: "Result tied to test conditions",
    body: "A result applies to the identified tire and recorded conditions. It does not create a universal puncture limit.",
    media: media(125, "/images/safety-tires/test-board-pass.webp", "Tire passing over puncture-test spikes during an internal evaluation", "Tire passing over test spikes in supplier project materials"),
  },
];

const evidenceItems: TireViewportItem[] = [
  {
    id: "material-development",
    title: "Material development",
    body: "Supplier materials show a dedicated development and laboratory environment. Research partners and ownership of results are published only after documentary confirmation.",
    media: media(146, "/images/safety-tires/research-facility.webp", "Exterior of the supplier research facility shown in project materials", "Research facility shown in supplier project materials"),
  },
  {
    id: "laboratory-team",
    title: "Laboratory work",
    body: "Development imagery establishes the environment. A product claim still requires an identified tire, method and result.",
    media: media(140, "/images/safety-tires/lab-team.webp", "Laboratory team working with material-processing equipment", "Laboratory team shown in supplier project materials"),
  },
  {
    id: "controlled-laboratory",
    title: "Controlled environment",
    body: "Test conditions, sample identity and acceptance criteria must remain traceable to the applicable record.",
    media: media(147, "/images/safety-tires/controlled-lab.webp", "Controlled laboratory environment shown in supplier materials", "Controlled laboratory environment shown in supplier project materials"),
  },
  {
    id: "controlled-application",
    title: "Controlled application",
    body: "Supplier-provided production-base imagery illustrates coating equipment used in the self-sealing tire program; process approval remains tied to the responsible entity and tire program.",
    note: "Production evidence",
    media: media(155, "/images/safety-tires/automated-production-line.webp", "Robotic coating equipment shown in a supplier-provided tire production environment", "Supplier-provided coating equipment scene; not proof of ownership or a specific production result"),
  },
  {
    id: "inspection",
    title: "Process inspection",
    body: "Inspection equipment supports production control. It does not by itself prove a tire model has passed a named standard.",
    note: "Production evidence",
    media: media(136, "/images/safety-tires/inspection-line.webp", "Inspection equipment in the self-sealing tire production environment", "Inspection equipment in the production environment"),
  },
];

export const selfSealingTirePage: SelfSealingTirePage = {
  slug: "safety-tires",
  publicationStatus: "approved",
  attributionStatus: "pending",
  hero: {
    eyebrow: "SELF-SEALING TIRE TECHNOLOGY",
    heading: "Self-sealing tires for applicable tread punctures",
    lead: "Understand how the inner sealing layer responds, what the supplier-stated 8 mm test condition means, and which documents to confirm for a tire and market.",
    disclosure: "This is a product-line capability page. Available models, sizes and market approvals are confirmed through enquiry before supply.",
    primaryAction: { label: "See how it responds", href: "#self-sealing-mechanism" },
    secondaryAction: { label: "Ask about a tire program", href: "/request-a-quote?product_line=safety-tires&intent=product_inquiry&from=safety-tires" },
  },
  painPoint: {
    id: "T01",
    eyebrow: "THE ROADSIDE PROBLEM",
    heading: "A puncture can turn into a roadside interruption",
    lead: "A nail puncture can mean air loss, an unsafe place to stop, a repair or replacement decision, and an unplanned recovery call. For a vehicle without a spare wheel, the interruption can be even more immediate.",
    items: painItems,
    boundaryNote: "Self-sealing technology is intended to reduce the immediate interruption caused by an applicable tread puncture. It does not prevent every form of tire damage.",
    publicationStatus: "approved",
  },
  definition: {
    id: "T02",
    eyebrow: "SELF-SEALING TIRE TECHNOLOGY",
    heading: "A sealing layer responds around an applicable tread puncture",
    lead: "A polymer-composite sealing layer is applied to the tire inner liner. When an object penetrates the tread, the material surrounds it and helps limit air loss. After the object is removed, the material closes the puncture channel.",
    items: definitionItems,
    boundaryNote: "Self-sealing describes the behavior of the internal sealing layer. It does not mean that the tire is immune to damage or that professional inspection is unnecessary.",
    publicationStatus: "approved",
    primaryAction: { label: "See how the sealing layer responds", href: "#self-sealing-mechanism" },
  },
  mechanism: {
    id: "T03",
    eyebrow: "HOW IT RESPONDS",
    heading: "How self-sealing tires work: the material closes around the puncture channel",
    items: mechanismItems,
    boundaryNote: "This sequence illustrates the stated sealing mechanism in the tested tread area. It is not a repair instruction and does not describe sidewall, shoulder, impact or structural damage.",
    publicationStatus: "approved",
  },
  punctureValidation: {
    id: "T04",
    eyebrow: "8 MM INTERNAL PUNCTURE CONDITION",
    heading: "8 mm describes the test spike, not every possible puncture",
    lead: "Supplier materials state that the self-sealing system has been evaluated with an 8 mm-diameter test spike through the tread area. The result applies to the tested tire, puncture location and test conditions. Ask for the documentation applicable to the tire model and destination market.",
    items: validationItems,
    boundaryNote: "The tire model, size, pressure, procedure, observation period and acceptance result have not yet been supplied as a publishable report. The 8 mm statement therefore remains supplier-stated.",
    publicationStatus: "approved",
    evidence: {
      id: "tire-puncture-8mm-internal",
      status: "supplier-stated",
      punctureZone: "tread",
      objectType: "puncture-test spike",
      objectDiameterMm: 8,
      sourceRefs: [sourceRef, "用户确认的供应商测试口径（2026-10-04）"],
    },
    inspectionNote: "After a puncture, check tire pressure and have the tire inspected by a qualified professional. Do not treat the 8 mm figure as permission to continue driving with visible damage, abnormal pressure, vibration or a sidewall injury.",
    primaryAction: { label: "Ask for the applicable test record", href: "/request-a-quote?product_line=safety-tires&intent=test_documentation&claim=8mm_internal_puncture&from=safety-tires" },
  },
  evidenceSystem: {
    id: "T05",
    eyebrow: "EVIDENCE BEHIND THE PRODUCT",
    heading: "The evidence must match the tire model and market",
    lead: "Development, testing, controlled application and inspection form one evidence chain. A photograph shows the environment; the applicable record supports the product claim.",
    items: evidenceItems,
    boundaryNote: "A laboratory or production photograph demonstrates an environment, not a test result. Product claims are supported by documents that identify the tested tire and conditions.",
    publicationStatus: "approved",
    secondaryAction: { label: "See the production environment", href: "/about#tire-manufacturing" },
  },
  applicationAndInquiry: {
    id: "T06",
    eyebrow: "CHECK THE APPLICATION",
    heading: "Confirm the tire, puncture condition and local support",
    lead: "Share the target tire and market so the project team can check supply, evidence and service requirements against the intended use.",
    items: [],
    publicationStatus: "approved",
    canConfirmLabel: "What the project team can confirm",
    cannotGuaranteeLabel: "What this page cannot guarantee",
    inputLabel: "Include these details",
    canConfirm: ["Available tire models and sizes", "The specific model covered by the supplier-stated 8 mm internal evaluation", "The tread area covered by the sealing layer", "Reports and markings required in the destination market", "Local installation, inspection, after-sales and warranty arrangements"],
    cannotGuarantee: ["Post-application to any tire brand", "Any location, shape or depth of 8 mm damage", "Automatic repair of sidewall, shoulder, cord or impact damage", "Automatic ECE, DOT or every-country compliance across the range", "One global roadside-assistance or replacement promise"],
    audiences: [
      {
        id: "consumer",
        title: "Vehicle owner",
        body: "Ask whether an available tire and local support route match your vehicle and replacement timing.",
        inputs: ["Country or region", "Vehicle and current tire size", "Driving use and expected replacement timing", "Photo of the tire sidewall marking, if available"],
        action: { label: "Ask about a tire", href: "/request-a-quote?product_line=safety-tires&intent=product_inquiry&customer_type=consumer&from=safety-tires" },
      },
      {
        id: "channel",
        title: "Channel or fleet",
        body: "Start with the market, required sizes, volume and the documents your program must carry.",
        inputs: ["Target market and customer type", "Required sizes, load and speed ratings", "Expected quantity and delivery region", "Required test, certification and warranty documents", "Installation, inspection and after-sales plan"],
        action: { label: "Discuss a supply program", href: "/request-a-quote?product_line=safety-tires&intent=product_inquiry&customer_type=channel&from=safety-tires" },
      },
    ],
    secondaryAction: { label: "Contact the project team", href: "/contact" },
  },
};
