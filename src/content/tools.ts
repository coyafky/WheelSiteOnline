import type { FaqEntry, ResourceLink } from "./types";

/**
 * Tools hub (`/tools`) and the offset calculator (`/tools/offset-calculator`).
 *
 * The calculator is an ENGINEERING AID, not a fitment authority. Its copy is
 * written to say so plainly: it models width, offset and diameter only, and it
 * cannot see a brake caliper, suspension travel, camber or arch clearance.
 * Nothing on these pages quotes a real vehicle's stock offset as fact — any
 * example figures are labelled illustrative.
 */

export const toolsHubCopy = {
  eyebrow: "Tools",
  heading: "Wheel Tools",
  lede: "Working tools for the questions that come up between a dealer and a factory. Each one does a real calculation and shows the formula it used, so you can check the arithmetic rather than trust it.",
  supporting:
    "More tools are coming — a backspacing converter, a load-rating reference and a tyre-diameter comparison. Ask us if there is one you need now.",
} as const;

/** The one tool that exists today. The hub lists from this array. */
export type ToolEntry = {
  slug: string;
  name: string;
  summary: string;
  body: string;
  href: string;
  /** Short label describing what it computes. */
  computes: string;
  status: "available" | "planned";
};

export const tools: ToolEntry[] = [
  {
    slug: "offset-calculator",
    name: "Wheel Offset Calculator",
    summary:
      "Compare an original wheel against a replacement and see how far the inner and outer edges move.",
    body: "Enter the width, offset and diameter of both wheels. The calculator returns the change in inner clearance, outer poke and strut clearance in millimetres, with the formula shown alongside.",
    href: "/tools/offset-calculator",
    computes: "Inner + outer edge movement (mm)",
    status: "available",
  },
  {
    slug: "backspacing-converter",
    name: "Backspacing Converter",
    summary:
      "Convert between offset (ET) and backspacing for a known wheel width.",
    body: "Offset and backspacing describe the same geometry from opposite reference points. This converter takes a width and one of the two values and returns the other.",
    href: "#",
    computes: "Offset ⇄ backspacing",
    status: "planned",
  },
  {
    slug: "load-rating-reference",
    name: "Load Rating Reference",
    summary:
      "Look up the load rating a given vehicle class demands per wheel.",
    body: "A per-axle and per-wheel load reference for truck, SUV and passenger applications, to be published once Fenghuai engineering has signed off the source data.",
    href: "#",
    computes: "Required load per wheel",
    status: "planned",
  },
];

/* ---------------------------------------------------------------------------
   Offset calculator (`/tools/offset-calculator`)
--------------------------------------------------------------------------- */

export const offsetCalculatorCopy = {
  eyebrow: "Tool",
  heading: "Wheel Offset Calculator",
  lede: "Compare a wheel you have against a wheel you are considering, and see exactly how much further the new one reaches — inward toward the suspension, and outward toward the arch.",
  supporting:
    "Enter both wheels below. The result is a planning figure: it models width, offset and diameter, and nothing else.",

  /** Honesty notice — rendered prominently above the tool. */
  noticeLabel: "Planning aid — not a fitment approval",
  noticeHeading: "Check the result against the real car before you order",
  noticeBody:
    "This calculator models wheel width, offset and diameter only. It does not account for brake caliper shape, suspension travel, camber, arch or liner clearance, or the load rating your vehicle requires. It cannot tell you whether a wheel will physically fit. Fenghuai confirms the final specification against your specific vehicle before an order is cut, and any figure below is a starting point for that conversation rather than a substitute for it.",

  /** What offset is. */
  whatEyebrow: "The basics",
  whatHeading: "What wheel offset actually is",
  whatBody: [
    "Offset — written as ET on the wheel, from the German Einpresstiefe — is the distance in millimetres from the wheel's mounting face to its centreline. It describes where the wheel sits on the hub, not how wide it is.",
    "Positive offset means the mounting face sits outboard of the centreline: the wheel tucks further under the arch, with more of its width inboard. Negative offset means the mounting face sits inboard of the centreline: the wheel sits further out, with more of its width outboard. Zero offset puts the mounting face exactly on the centreline.",
    "The consequence people miss is that offset and width interact. Fitting a wider wheel at the same offset moves both edges outward — and the inboard edge is the one that fouls the strut, the control arm or the brake caliper. That is why this calculator reports the inboard change as well as the outer poke.",
  ],

  /** The formula, stated in prose on the page. */
  formulaEyebrow: "The formula",
  formulaHeading: "How the numbers are worked out",
  formulaBody:
    "The calculator works from backspace — the distance from the mounting face to the wheel's inner edge — which is the value that determines inboard clearance.",
  /** Rendered in a monospace block; also present verbatim in the component. */
  formulaLines: [
    "backspace(mm)    = (width_in × 25.4) / 2 + offset_mm",
    "frontspace(mm)   = (width_in × 25.4) / 2 − offset_mm",
    "innerChange(mm)  = newBackspace − oldBackspace",
    "outerChange(mm)  = newFrontspace − oldFrontspace",
    "diameterChange(in) = newDiameter − oldDiameter",
  ],
  formulaNote:
    "A positive innerChange means the inner edge moves further into the car, reducing inboard clearance. A positive outerChange means the outer edge moves further out, increasing poke. Both edges also move outward by half the diameter change, because a larger wheel reaches further in every direction from the hub.",

  /** How to read the result. */
  readEyebrow: "Reading the result",
  readHeading: "What the output tells you, and what it does not",
  readPoints: [
    {
      title: "Inner clearance change",
      body: "How much closer the wheel's inner edge sits to the suspension, relative to the original. A positive figure means less room than before — the single most common cause of a fitment that rubs.",
    },
    {
      title: "Outer poke / clearance change",
      body: "How much further the wheel's outer edge sits from the hub, relative to the original. A positive figure means more poke. On a car with limited arch room, that is where rubbing on the arch or liner appears.",
    },
    {
      title: "Diameter change",
      body: "A larger diameter reaches further both inboard and outboard by half the increase, regardless of offset. It also changes rolling radius, which affects speedometer accuracy and gearing.",
    },
    {
      title: "What it cannot see",
      body: "Brake caliper shape and spoke clearance, suspension travel under compression, camber change, arch liner and brake ducting. A result inside the original envelope is a good sign, not an approval.",
    },
  ],

  /** Examples, explicitly illustrative. */
  examplesEyebrow: "Worked examples",
  examplesHeading: "Two illustrative examples",
  examplesNote:
    "ILLUSTRATIVE ONLY. These examples use made-up round numbers to show how the arithmetic behaves — they are not any vehicle's actual stock specification, and must not be used as a lookup. Confirm the real values for your vehicle before relying on them.",
  examples: [
    {
      title: "Wider wheel, same offset",
      setup: "8.0J ET35 → 9.0J ET35, same diameter",
      result:
        "The width is 25.4 mm greater, so each edge moves outward by 12.7 mm. Inboard clearance drops by 12.7 mm and poke rises by 12.7 mm. This is the change that catches people out: they only budgeted for the extra poke.",
    },
    {
      title: "Same width, lower offset",
      setup: "9.0J ET45 → 9.0J ET30, same diameter",
      result:
        "The width is unchanged, so the whole wheel shifts outboard by the 15 mm offset change. Poke rises by 15 mm and inboard clearance improves by 15 mm. This is the cheap way to gain brake clearance — with the trade-off that the outer edge moves out.",
    },
  ],

  /** Offset types explainer. */
  typesEyebrow: "Offset types",
  typesHeading: "Positive, zero and negative offset",
  typesBody:
    "Every production car is built around a particular offset range. Moving far outside it changes steering geometry, wheel bearing load and how the car behaves under braking, whether or not the wheel physically fits.",
  types: [
    {
      name: "Positive offset",
      range: "Most common on modern cars",
      body: "The mounting face is outboard of the centreline, so most of the wheel's width sits inboard. Modern front-wheel-drive and most all-wheel-drive cars use relatively high positive offsets because it keeps the scrub radius small and the steering axis inside the tyre contact patch.",
    },
    {
      name: "Zero offset",
      range: "Common on older rear-drive cars",
      body: "The mounting face sits on the centreline, splitting the width evenly either side. It is characteristic of older rear-drive platforms and of wheels designed for a deep-lip look where the lip is a genuine part of the geometry rather than styling.",
    },
    {
      name: "Negative offset",
      range: "Deep-dish and off-road",
      body: "The mounting face is inboard of the centreline, pushing the wheel outboard. It produces the deep-dish appearance and is common on lifted trucks and off-road builds. On a road car it increases the load on the hub and wheel bearings and changes steering feel, so it should be a deliberate decision, not an accident of the wheel you bought.",
    },
  ],

  /** FAQ. */
  faqEyebrow: "Questions",
  faqHeading: "Offset calculator FAQ",
} as const;

export const offsetCalculatorFaqs: FaqEntry[] = [
  {
    question: "Can I fit a wider wheel at the same offset?",
    answer:
      "Sometimes, but the constraint is usually the inboard edge rather than the arch. Adding width at the same offset moves both edges outward equally, so inboard clearance falls by half the width increase in millimetres. Run the numbers above and check whether the original wheel had that much room to give — on a car with a large brake package it often did not.",
  },
  {
    question: "Does a lower offset always mean more poke?",
    answer:
      "For the same width and diameter, yes: lowering the offset moves the whole wheel outboard, so the outer edge moves out and the inboard edge moves away from the suspension. It is the standard way to gain brake clearance, at the cost of arch clearance and a change in steering geometry.",
  },
  {
    question: "Why does the calculator ask for diameter?",
    answer:
      "Because diameter changes both edges independently of offset. Increasing the diameter by one inch moves the inner and outer edges outward by 12.7 mm each, even at an unchanged width and offset. It also changes the rolling radius, which affects your speedometer and gearing.",
  },
  {
    question: "Will a wheel that clears here actually fit my car?",
    answer:
      "Not necessarily, and we would not treat this calculator as an answer. It cannot see your brake caliper shape, suspension travel, camber, arch liner or the load rating your vehicle needs. Send us the vehicle and the specification and we will confirm it in writing before anything is cut.",
  },
  {
    question: "Can you tell me my car's stock offset?",
    answer:
      "Not from a calculator, and we deliberately do not publish stock offsets as facts — a figure that is correct for one trim or brake package is wrong for the next. The reliable figure is on the wheel itself (stamped as ET) or in your vehicle's factory documentation for that exact trim.",
  },
  {
    question: "Is a negative offset wheel safe on a road car?",
    answer:
      "It is a legitimate specification on many platforms, but it is not free. Moving the wheel outboard increases the load on the hub and bearings and alters the steering geometry the car was designed around. If you are considering a large offset change, discuss it with us before ordering — that is exactly the conversation the calculator exists to start.",
  },
];

/** Related links shown at the foot of the calculator page and the tools hub. */
export const toolsPathways: ResourceLink[] = [
  {
    eyebrow: "Guide",
    title: "Understanding offset and backspacing",
    body: "The two ways of describing the same geometry, and the conversion between them.",
    href: "/insights/offset-and-backspacing",
    linkLabel: "Read the guide",
  },
  {
    eyebrow: "Guide",
    title: "How to measure your fitment",
    body: "The five numbers a forged wheel order needs, and why a tape measure alone is not enough.",
    href: "/insights/how-to-measure-fitment",
    linkLabel: "Read the guide",
  },
  {
    eyebrow: "Reference",
    title: "Bolt pattern guides",
    body: "What the two numbers in a bolt pattern mean, and how to measure the pattern on a real wheel.",
    href: "/insights/bolt-patterns",
    linkLabel: "Open the guides",
  },
];
