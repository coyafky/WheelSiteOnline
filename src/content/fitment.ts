import type { PlatformFitment, ResourceLink } from "./types";

/**
 * Vehicle fitment landing pages (`/fitment/[platform]`).
 *
 * ---------------------------------------------------------------------------
 * READ THIS BEFORE EDITING ANY NUMBER BELOW
 * ---------------------------------------------------------------------------
 * Wheel fitment is safety-critical. A wrong PCD, centre bore or offset
 * published as fact can lead to a wheel that does not seat, a stud that
 * shears, or an accident. So:
 *
 *   • `sizes` are STARTING REFERENCE RANGES ONLY — diameter/width bands people
 *     commonly run, not a confirmed offset/PCD/centre-bore specification.
 *   • `verified` is `false` on every model. The UI renders a visible "pending
 *     verification" marker on unverified rows, and every fitment surface shows
 *     the standing notice that figures are illustrative and require
 *     confirmation against the specific vehicle.
 *   • FAQ answers deliberately do NOT state measurement values as fact.
 *
 * Fenghuai engineers the final specification per order against the actual
 * vehicle. Do not convert these ranges into a lookup table.
 */

export const platformFitments: PlatformFitment[] = [
  {
    slug: "bmw-m",
    name: "BMW M",
    heroLine: "Forged wheels for BMW M performance platforms",
    intro:
      "BMW M cars are one of the most common forged wheel enquiries we get, and one of the most sensitive to getting fitment wrong — the brake packages are large and the arches vary significantly between generations. We engineer each set against the specific chassis code, brake option and suspension you tell us, not against a generic M fitment.",
    models: [
      {
        code: "G87",
        name: "M2",
        years: "2023–present",
        sizes: "Front 19–20\" · Rear 19–20\"",
        notes:
          "Wide front track with a large standard brake package. Geometry differs from the F87 it replaced, so F87 data does not carry over.",
        verified: false,
      },
      {
        code: "G80",
        name: "M3",
        years: "2021–present",
        sizes: "Front 19\" · Rear 20\" (staggered common)",
        notes:
          "Carbon-ceramic brake option materially changes inboard clearance and must be specified up front.",
        verified: false,
      },
      {
        code: "G82",
        name: "M4",
        years: "2021–present",
        sizes: "Front 19\" · Rear 20\"",
        notes:
          "Shares most of its underbody with the G80 M3; still confirm per axle rather than assuming identical clearances.",
        verified: false,
      },
      {
        code: "F87",
        name: "M2",
        years: "2016–2021",
        sizes: "Front 19\" · Rear 19\"",
        notes:
          "Narrower body than the G87. Aggressive offsets that fit the newer car will typically protrude on this one.",
        verified: false,
      },
      {
        code: "F80 / F82",
        name: "M3 / M4",
        years: "2014–2020",
        sizes: "Front 19\" · Rear 19–20\"",
        notes:
          "Well-documented platform, but aftermarket suspension and camber plates change the available clearance.",
        verified: false,
      },
    ],
    designDirections: [
      {
        name: "Split-spoke motorsport",
        body: "A ten-spoke split design keeps a large brake caliper visible behind the wheel and reads as factory-plus rather than aftermarket. Our default direction for M3 and M4 builds that are used hard.",
      },
      {
        name: "Retro five-spoke",
        body: "A bolder, more classic face. Suits the E-generation and F87 cars where a simpler, chunkier spoke sits well against a less complex body line.",
      },
      {
        name: "Diamond-cut five-spoke",
        body: "A machined highlight over a darker base gives an M car a strong, bright edge that still shows the wheel's concavity. Popular on G-series cars in lighter body colours.",
      },
    ],
    fitmentNotes: [
      "Tell us the exact chassis code, model year and brake option — M fitment is not interchangeable across generations.",
      "Note any suspension change (coilovers, lowering springs, camber plates); these move the clearance envelope before offset is decided.",
      "Wide front fitments on G-series cars can foul the inner arch liner at full lock; we check this against your stated target.",
      "If you plan to run a track wheel and a road wheel, specify both — the correct compromise between them is an engineering decision.",
    ],
    faqs: [
      {
        question: "Can you guarantee a fitment for my M car?",
        answer:
          "We engineer the specification against the vehicle data you provide, and we return a written specification for approval before anything is cut. We do not publish a fitment table and ask you to match it yourself, because brake and suspension options vary too much between individual cars.",
      },
      {
        question: "Will a wheel from a newer M car fit my older one?",
        answer:
          "Not reliably. Track widths, arch shapes and brake packages differ between generations, so a figure that works on one chassis can protrude or foul on another. Always start from the specific chassis code.",
      },
      {
        question: "Do I need to change the bolt pattern or centre bore?",
        answer:
          "No — we manufacture to your vehicle's standard bolt pattern and centre bore so the wheel mounts as the manufacturer intended. We do not recommend adapters or spigot rings as a way to make a wheel fit that was not built for the car.",
      },
      {
        question: "Can you match a factory M wheel style?",
        answer:
          "We can build a design in the same visual direction and finish. Send us a photograph or a reference and we will tell you what is reproduceable and what would need to change to be manufactured safely.",
      },
    ],
  },
  {
    slug: "mercedes-amg",
    name: "Mercedes-AMG",
    heroLine: "Forged wheels for Mercedes-AMG platforms",
    intro:
      "AMG cars span a very wide range — from the compact A45 to the E63 — and each line has its own clearance story. The key variable is usually the brake package: the larger composite and ceramic systems used across AMG range substantially reduce inboard clearance, and we treat that as a hard constraint when we set an offset.",
    models: [
      {
        code: "W206",
        name: "C63",
        years: "2022–present",
        sizes: "Front 19–20\" · Rear 19–20\"",
        notes:
          "Includes electrified powertrain variants; confirm the exact model designation, as brake hardware differs across the range.",
        verified: false,
      },
      {
        code: "W213",
        name: "E63",
        years: "2016–2023",
        sizes: "Front 19–20\" · Rear 20\"",
        notes:
          "Long wheelbase with a wide rear track. The 4MATIC+ drivetrain means front and rear fitment must be considered as a pair.",
        verified: false,
      },
      {
        code: "C118",
        name: "A45",
        years: "2019–present",
        sizes: "Front 19\" · Rear 19\"",
        notes:
          "Compact platform with a surprisingly large brake option. Clearance is tight; conservative widths are usually the right call.",
        verified: false,
      },
    ],
    designDirections: [
      {
        name: "Multi-spoke luxury",
        body: "A fine multi-spoke face is the AMG visual language and stays restrained on a large saloon or coupe. Suits E63 builds where the wheel should complement rather than dominate.",
      },
      {
        name: "Monoblock full-face",
        body: "A flatter full-face design reads as calm and expensive under a big body. Good on AMG SUVs and long-wheelbase cars where an aggressive concave would look mismatched.",
      },
      {
        name: "Two-tone deep-lip",
        body: "A contrasting face and lip adds presence without shouting. Popular on W213 E63 stance builds where a deeper lip is the point.",
      },
      {
        name: "Diamond-cut five-spoke",
        body: "Bright machined face with a darker base for contrast. Works well on W206 C63 builds in darker paint finishes.",
      },
    ],
    fitmentNotes: [
      "State the exact model designation and brake package — AMG brake hardware varies within a single model line.",
      "Rear-axle steering and 4MATIC+ change how front and rear geometry interact; we treat the two axles together.",
      "Air suspension ride-height changes affect clearance through the full travel, not just at rest — tell us if the car raises or lowers.",
      "Wheel bolts on AMG are typically a ball-seat type; we supply hardware matched to the vehicle rather than a generic set.",
    ],
    faqs: [
      {
        question: "Do you keep the original AMG centre caps or supply your own?",
        answer:
          "Either. We can build to accept factory-fitment caps where the geometry allows, or supply our own with your branding. Tell us which you want before the order is cut, because it affects the centre-bore specification.",
      },
      {
        question: "Are your wheels compatible with AMG ceramic brakes?",
        answer:
          "Compatibility depends on the specific brake package, not on the AMG badge. Send us the brake option for your car and we will check the inboard clearance as part of the fitment review rather than assuming it fits.",
      },
      {
        question: "Can you match an AMG factory wheel finish?",
        answer:
          "We can build a finish in the same direction — matte graphite, satin black, diamond-cut highlights. Exact colour matching against an OEM finish is a sample-based conversation; ask us for a physical sample before committing a full set.",
      },
      {
        question: "How do I choose between monoblock and two-piece for an AMG?",
        answer:
          "If the goal is unsprung weight and steering response, monoblock. If the goal is a deep-lip look or a width a single piece cannot reach, two-piece. Read the monoblock vs two-piece guide in Resources, then tell us the goal and we will confirm which is buildable.",
      },
    ],
  },
  {
    slug: "audi-rs",
    name: "Audi RS",
    heroLine: "Forged wheels for Audi RS platforms",
    intro:
      "Audi RS cars are a natural fit for forged wheels: quattros benefit materially from reduced unsprung weight, and the RS brake packages are large enough that clearance, not styling, is usually the limiting factor. We build to the specific platform — B9, C8 or 8Y — and check the brake hardware you have before we set a width.",
    models: [
      {
        code: "B9",
        name: "RS4 / RS5",
        years: "2017–present",
        sizes: "Front 19–20\" · Rear 19–20\"",
        notes:
          "Wide arches but tight inboard clearance with the standard RS brake. Aftermarket brake kits change this significantly.",
        verified: false,
      },
      {
        code: "C8",
        name: "RS6 / RS7",
        years: "2019–present",
        sizes: "Front 21\" · Rear 21\" (commonly large)",
        notes:
          "Heavy car with a very large brake option. Load rating and clearance both matter more here than on the smaller RS cars.",
        verified: false,
      },
      {
        code: "8Y",
        name: "RS3",
        years: "2021–present",
        sizes: "Front 19\" · Rear 19\"",
        notes:
          "Compact platform with a wide front track. The staggered factory setup means aftermarket widths should be considered axle by axle.",
        verified: false,
      },
    ],
    designDirections: [
      {
        name: "Turbine aero",
        body: "A directional turbine face references motorsport without being literal. Suits RS6 and RS7 builds where the car is large and the wheel needs to carry visual weight.",
      },
      {
        name: "Split-spoke motorsport",
        body: "Ten-spoke split design shows the brake caliper and keeps the wheel light visually. Our default for RS3 and RS5 track-focused builds.",
      },
      {
        name: "Retro five-spoke",
        body: "A simpler, chunkier face that reads as a deliberate nod to the original Quattro. Works well on B9 RS4 Avants.",
      },
      {
        name: "Matte black multi-spoke",
        body: "Understated and easy to live with. Common direction on C8 RS6 builds that want the wheel to recede behind the body.",
      },
    ],
    fitmentNotes: [
      "Quattro drivetrains are sensitive to rolling-diameter differences between axles; keep front and rear close and tell us if you are not.",
      "Audi RS brake options vary widely; specify the exact brake package rather than the model name.",
      "Heavy C8-class cars need a load rating confirmed for the axle, not just a dimensional fit — we check both.",
      "Air suspension on many RS models means the clearance envelope is dynamic. We size against the lowest and highest ride heights you use.",
    ],
    faqs: [
      {
        question: "Why do quattros need matched front and rear sizes?",
        answer:
          "Because the drivetrain distributes torque across axles that are expected to travel at a consistent rate. Large differences in rolling diameter between front and rear put load on the system. We will flag it if your proposed specification pushes outside a sensible margin.",
      },
      {
        question: "Can I run a staggered setup on an RS car?",
        answer:
          "That is a per-model question, not a rule. Some RS platforms take a mild stagger comfortably while others are sensitive to it. Tell us the platform and the stagger you want and we will confirm whether it is appropriate.",
      },
      {
        question: "Do forged wheels make a noticeable difference on a heavy RS6?",
        answer:
          "Reducing unsprung and rotational mass is directionally beneficial on any car and generally more noticeable on a heavy one. We will not quote a specific weight saving here — ask our engineers for figures with a stated test basis for your intended specification.",
      },
      {
        question: "Can you build to a specific load rating?",
        answer:
          "Load rating is part of the specification we confirm against your vehicle, not an afterthought. For heavy platforms we will state the rating we are building to and how it was established. Ask for the documentation relevant to your market.",
      },
    ],
  },
];

/**
 * Fitment pages become indexable only after every model shown on that page has
 * been confirmed by engineering. This keeps the page metadata and sitemap on
 * the same fail-closed publication boundary.
 */
export function isPlatformFitmentIndexable(platform: PlatformFitment): boolean {
  return platform.models.length > 0 && platform.models.every((model) => model.verified);
}

export function getPlatform(slug: string): PlatformFitment | undefined {
  return platformFitments.find((platform) => platform.slug === slug);
}

/* ---------------------------------------------------------------------------
   Shared copy
--------------------------------------------------------------------------- */

export const fitmentPageCopy = {
  /**
   * The standing honesty notice. This is NOT optional and appears on every
   * fitment surface — the sizes shown are starting points, not a lookup table.
   */
  notice: {
    label: "Not a fitment table",
    heading: "These figures are starting points, not a specification",
    body: "Every size range on this page is illustrative — a commonly-run diameter and width band for that platform, not a confirmed offset, bolt pattern, centre bore or load rating. Fitment depends on your exact chassis, brake package and suspension, and a wrong figure is a safety risk as well as a fitment failure. Send us the vehicle and Fenghuai engineers the final specification per order, in writing, before material is cut.",
  },
  verifiedLabel: "Pending verification",
  verifiedNote:
    "Model data on this page has not yet been signed off by Fenghuai engineering.",
  modelHeading: "Models we build for",
  modelEyebrow: "Quick paths",
  modelsIntro:
    "Jump to a chassis code. Sizes are the band we most often discuss for that platform — confirm the specific vehicle with us before you quote a customer.",
  designEyebrow: "Design directions",
  designHeading: "How these cars usually get specified",
  notesEyebrow: "Engineering notes",
  notesHeading: "What we need before we set an offset",
  bridgeEyebrow: "From specification to order",
  bridgeHeading: "Fitment in, then construction and finish",
  bridgeBody:
    "Once the fitment envelope is agreed, the conversation moves to construction and finish — monoblock or two-piece, then the design and colour. Read those guides, or send us the vehicle and we will take it from there.",
} as const;

/** Related links shown at the foot of every fitment page. */
export const fitmentResourceLinks: ResourceLink[] = [
  {
    eyebrow: "Guide",
    title: "Measuring your fitment",
    body: "The numbers a forged wheel order actually needs, and why a tape measure alone is not enough.",
    href: "/insights/how-to-measure-fitment",
    linkLabel: "Read the guide",
  },
  {
    eyebrow: "Guide",
    title: "Offset and backspacing",
    body: "Two ways of describing the same measurement — and the conversion that keeps a quoted fitment honest.",
    href: "/insights/offset-and-backspacing",
    linkLabel: "Read the guide",
  },
  // The "Wheel gallery → /gallery/wheels" card was removed 2026-10-06
  // (DEC-059): that design catalogue was fictional and is archived.
];

/** Other platforms, shown as sibling links. */
export const fitmentPathwayCopy = {
  eyebrow: "Other platforms",
  heading: "Fitment pages for other marques",
} as const;
