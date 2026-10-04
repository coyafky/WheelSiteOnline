import type {
  AnswerBlock,
  Capability,
  FaqEntry,
  MechanismStep,
  ParamRow,
  PositioningPoint,
  RouteStep,
} from "./types";

/**
 * Self-sealing safety tyres (`/products/safety-tires`).
 *
 * 🔴 ATTRIBUTION IS LOAD-BEARING ON THIS PAGE — READ THIS BEFORE EDITING
 * ---------------------------------------------------------------------
 * This is the only line on the site that is not wholly ours. The product
 * itself is a partner's, and the brand relationship is still being confirmed.
 * Every claim below therefore comes from one of three buckets:
 *
 *   OURS      — written by us, about self-sealing tyres generally. Pain point,
 *               mechanism, performance figures and routing all come from our
 *               own material and are safe to publish.
 *   PENDING   — a figure we hold but cannot yet attribute (a warranty term, a
 *               response time). It stays undefined in this module until the
 *               attribution is settled. The components render the surrounding
 *               sentence without the number.
 *   EXCLUDED  — partner copy that presents their brand, market data,
 *               certifications or channel policy. None of it appears here, in
 *               any paraphrase.
 *
 * WHAT IS DELIBERATELY ABSENT
 * Terminal-value language ("punctures can't happen", "the leading brand"), any
 * accident-rate statistic sourced from a third party, channel and warranty
 * promises belonging to the partner, and any claim of having passed a
 * certification. The words that remain — self-sealing, channel closure — are
 * also the more defensible ones for a product whose performance is bounded by
 * hole size.
 *
 * HEADER IMAGERY: none is used. Every tyre asset we hold is unreleased, and
 * one of the published notes requires internal structure to be presented as a
 * schematic rather than as a photograph. The page runs on a plain dark ground
 * instead, which costs nothing it cannot afford.
 */

/** Attribution state for the whole page. Flips the CTA and the FAQ disclosure. */
export const tireAttribution: {
  resolved: boolean;
  path: "brand-owner" | "partner" | null;
  note: string;
} = {
  resolved: false,
  path: null,
  note: "The brand relationship behind this product is still being confirmed.",
};

/**
 * The CTA is not written while the attribution is open.
 *
 * There are two different closing actions depending on how the relationship
 * resolves — a distributor enquiry if we own the brand, a channel-partnership
 * enquiry if we supply it. Neither is chosen yet, so neither is published: the
 * section is omitted rather than filled with a placeholder button, because a
 * button that points at the wrong conversation costs more trust than one that
 * is not shown.
 */
export const tireCta: {
  title: string;
  body: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
} | null = null;

export const tireHero = {
  eyebrow: "SAFETY TIRES",
  heading: "Self-Sealing Safety Tires",
  subheading:
    "A high-performance polymer self-sealing coating bonded to the tyre's inner liner.",
  lede: "The coating encapsulates a penetrating object and limits air loss while it is in place. When the object is withdrawn, the material closes the channel it left behind.",
} as const;

export const tireDefinition: AnswerBlock = {
  eyebrow: "What this line is",
  heading: "A puncture stops being a roadside event",
  body: "A self-sealing tyre carries a polymer sealing layer on the inner liner of the tyre. It is not a run-flat construction and it does not make a tyre immune to damage. What it does is change the consequence of the most common kind of puncture: instead of a deflation that forces the driver to stop, the layer holds the object in place, limits the air loss around it, and closes over the channel once it is removed. The value is time and safety rather than indestructibility, which is why the figures on this page are stated in millimetres and seconds rather than in absolute terms.",
  points: [
    "The sealing layer sits on the inner liner — an internal layer, not a tread insert or a carcass change.",
    "The problem it removes is not tyre damage but the immediate obligation to stop, which is what a puncture usually forces.",
    "The case for it has grown with the vehicle mix: as more cars ship without a spare wheel, a puncture means a recovery call rather than ten minutes at the roadside.",
  ],
};

/**
 * The pain point, with the fit list folded into the same section.
 *
 * A tyre's "who is this for" is naturally its pain point, so the two are one
 * section rather than two. The audience list is written from the product's own
 * characteristics — no spare wheel, long distances, low appetite for roadside
 * repairs — and deliberately avoids accident statistics. Fear-based framing is
 * both a regulatory risk and a weaker argument than the everyday inconvenience
 * it replaces.
 */
export const tirePain = {
  eyebrow: "The case for it",
  heading: "A puncture costs more than the repair",
  headingEn: "A Puncture Costs More Than a Repair",
  body: "A punctured tyre is not only a maintenance item. It puts safety, time and a recovery call on the same afternoon, and it does so at the moment the driver is least able to deal with it. A sealing layer does not prevent the puncture; it removes the emergency from it.",
  audienceHeading: "If any of these sounds like your operation, this category is worth understanding",
  audience: [
    {
      title: "Vehicles without a spare wheel",
      body: "A growing share of new cars — electric models especially — ship without one, so a puncture depends on roadside support rather than on the boot.",
    },
    {
      title: "Long-distance, motorway and unsealed-road use",
      body: "The further the vehicle is from a workshop when something goes in, the more a self-sealing layer is worth having.",
    },
    {
      title: "Buyers who will not repair at the roadside",
      body: "Time cost and recovery cost are the real price of a puncture; a sealing layer is bought against both.",
    },
    {
      title: "Trade customers adding a safety line",
      body: "For a channel customer, this is a category that extends an existing safety story rather than replacing anything in it.",
    },
  ] satisfies PositioningPoint[],
} as const;

/**
 * The mechanism, in the order it happens: where the layer is, what enters,
 * what leaves, and how the material responds.
 *
 * This is the strongest section on the page — it comes entirely from our own
 * material and does not depend on the attribution question at all.
 *
 * 🔴 The response time stays undefined. The same figure appears in both our
 * material and the partner's, which means it cannot yet be attributed, and an
 * unattributed number is not published here. The fourth step therefore states
 * the behaviour in words. Pass a value into `responseValue` only once the
 * attribution is settled.
 */
export const tireMechanism: MechanismStep[] = [
  {
    step: "01",
    title: "Sealing layer",
    body: "A high-performance polymer sealing layer is bonded to the inner liner of the tyre, running across the area a puncture normally passes through.",
  },
  {
    step: "02",
    title: "Object enters",
    body: "When a nail or screw penetrates the tread, the layer closes around it and holds it in place, limiting the air that escapes alongside it.",
  },
  {
    step: "03",
    title: "Object withdraws",
    body: "If the object comes out — pulled free by the road or removed by hand — the material immediately closes over the channel it left behind.",
  },
  {
    step: "04",
    title: "Sealing response",
    body: "The material recovers and seals the channel. The response is fast enough that the driver does not have to stop and change a wheel at the roadside.",
  },
];

/**
 * Schematics rather than photographs, and no internal imagery is used at all.
 * The published note on these assets requires internal structure to be
 * presented as a diagram rather than as a photograph, so this statement is
 * carried even where the section runs on text alone.
 */
export const tireMechanismNotice =
  "Internal structure is described and illustrated as a schematic. The mechanism is a material behaviour inside the tyre, not something a photograph of the outside of a tyre can show.";

export const tireMechanismHead = {
  eyebrow: "Mechanism",
  heading: "Where the layer is, and what it does",
  lede: "Four steps, in the order they happen. The order is the mechanism — the layer has to be in place before the object enters it, and the channel can only close once the object is out.",
};

/**
 * What we bring to this category.
 *
 * The section is written about verification and handling rather than about the
 * factory: the partner manufactures the tyre, so a claim about production
 * capacity or facility would be someone else's claim. What is ours is how the
 * category is validated and delivered — the in-house puncture check, the
 * reference standard, production control and after-sales support.
 *
 * Nothing here names the partner's factory, output, patents or channel policy.
 */
export const tireCapabilities: Capability[] = [
  {
    index: "01",
    title: "In-house puncture validation",
    body: "The self-sealing behaviour is verified in house with a test spike — an 8 mm spike driven through the tread, against a 3 mm reference condition.",
    evidence:
      "In-house test, not a third-party report. Per-model test documentation is confirmed on request — see the data notice below.",
  },
  {
    index: "02",
    title: "Reference standard",
    body: "GB/T 38510-2020 is cited as the reference standard, alongside the corresponding 3 mm test-spike condition used in national-standard testing.",
    evidence:
      "Cited as the reference standard. This is not a certification held across the range — see tireStandardNote.",
  },
  {
    index: "03",
    title: "Production control",
    body: "Manufacturing runs on a digitalised, instrumented line, so the batch that ships matches the sample that was approved.",
    evidence:
      "Partner-plant capability. The partner is not named on this page by design — confirm whether the line can be described in more detail.",
  },
  {
    index: "04",
    title: "After-sales cover",
    body: "Towing and roadside assistance sit behind the product rather than beside it — the sealing layer reduces the number of recovery events, and the cover handles the ones that remain.",
    evidence:
      "Needs the actual cover terms: territory, duration, claim route. Pending confirmation — do not publish until the terms are in hand.",
  },
];

export const tireCapabilityHead = {
  eyebrow: "Capability",
  heading: "How this category is verified and delivered",
  lede: "Verification for a self-sealing tyre is a puncture test, not a leak test — a different question from the one an aluminium housing has to answer, which is why it is documented on this page rather than grouped with the plant's casting and machining evidence.",
};

/**
 * Performance figures.
 *
 * These four come from our own material and are the hard numbers the page can
 * publish. They are stated as values with a provenance line attached, and no
 * comparative conclusion is drawn from them — a rolling-noise range and a
 * tread-wear index are not a ranking.
 *
 * Certification language is deliberately absent. The certification position is
 * that documentation is confirmed per model and per destination market, and
 * that is exactly how it is written: no certificate is claimed for a range.
 */
export const tireSpecs: ParamRow[] = [
  {
    label: "Rolling noise",
    labelEn: "Rolling noise",
    value: "60–67 dB(A)",
    reportAvailable: false,
  },
  {
    label: "Average tread-wear index",
    labelEn: "Average tread-wear",
    value: "390",
    reportAvailable: false,
  },
  {
    label: "Wet-grip class",
    labelEn: "Wet grip",
    value: "Grade A",
    reportAvailable: false,
  },
  {
    label: "Operating temperature",
    labelEn: "Temperature range",
    value: "−40 ~ +178 °C",
    reportAvailable: false,
  },
];

export const tireStandardNote = {
  label: "Reference standard",
  value: "GB/T 38510-2020",
  note: "Cited as the reference standard, together with the 3 mm test spike specified in national-standard testing. It is referenced, not claimed as a certification held across the range.",
};

/**
 * The one contrast worth lifting out of the table.
 *
 * The partner's framing on the same subject is a superiority claim against the
 * national standard. Ours states the two conditions and lets the reader draw
 * the conclusion: a 3 mm spike is the reference case, an 8 mm spike is what we
 * validate against in house. Same information, stated as fact rather than as a
 * boast.
 */
export const tireHighlightNote = {
  title: "3 mm reference · 8 mm in-house validation",
  body: "National-standard testing uses a 3 mm test spike. Our internal validation uses an 8 mm spike. The larger figure is our own acceptance criterion rather than a requirement, which is why both numbers are stated: the reference condition and the condition we hold the product to.",
};

export const tireReportNote =
  "Figures are stated as measured values. Test conditions and reports are available on request. Certification documentation — ECE, DOT and equivalents — is confirmed per applicable model and destination market; no certification is claimed here for the range as a whole.";

/**
 * FAQ.
 *
 * Four entries are answerable today: where the layer sits, what size hole it
 * handles, what happens when the object is pulled, and the certification
 * position. Two are not, and they are handled differently rather than dropped:
 *
 *   - The warranty question is not authored. The terms we hold are attributed
 *     to the partner, so nothing is stated.
 *   - The brand-relationship question IS authored, as an explicit open item.
 *     It is the question every reader will have, and pretending it is not
 *     being asked would read as evasion. `tireAttribution.resolved` controls
 *     whether the entry carries a real answer or the open disclosure, and the
 *     entry is never removed from the page.
 */
export const tireFaqs: FaqEntry[] = [
  {
    question: "Which layer of the tyre does the coating sit on?",
    answer:
      "The inner liner. The sealing layer is bonded to the inside surface of the tyre, spanning the region a tread puncture passes through, rather than sitting in the tread or replacing part of the carcass.",
  },
  {
    question: "How big a puncture can it seal?",
    answer:
      "National-standard testing uses a 3 mm test spike; our in-house validation uses an 8 mm spike. Those two conditions define what we verify against. A punctured tyre should still be inspected by a professional, and damage outside the sealed area — a sidewall cut, for instance — is not addressed by the layer.",
  },
  {
    question: "Will it leak after the object is pulled out?",
    answer:
      "The material closes over the channel as the object leaves it, which is the point of the layer. The tyre should be checked afterwards, but the driver is not left changing a wheel at the roadside in the meantime.",
  },
  {
    question: "Is the tyre ECE or DOT certified?",
    answer:
      "Certification documentation is confirmed per applicable model and destination market. We do not state a certification for the range as a whole, because the holding model and the intended market both decide which documentation applies — ask us for the specific model and market combination and we will confirm what is held.",
  },
  {
    question: "What is the relationship between this product and the brand behind it?",
    answer: "",
  },
];

export const tireFaqHead = {
  eyebrow: "Questions",
  heading: "Compliance and mechanism questions",
  lede: "Answered plainly where we can, and marked open where we cannot — including the one about the brand relationship, which is the question a buyer asks first.",
};

/** The honest statement attached to the open brand question. */
export const tireAttributionDisclosure =
  "This one is open, and we are not going to answer around it. The relationship between this product and the brand that manufactures it is still being confirmed, so the answer will be published once it is settled rather than described in general terms now. Everything else on this page — the mechanism, the validation and the figures — comes from our own documentation and is unaffected.";

export const tireRoutes: RouteStep[] = [
  {
    step: "01",
    title: "How this category is verified",
    body: "The validation and manufacturing background behind a self-sealing tyre, alongside the rest of the plant's capability.",
    href: "/capabilities",
    linkLabel: "See capability",
  },
  {
    step: "02",
    title: "The other product lines",
    body: "Aluminium housings and custom components — the cast, forged and machined side of the business.",
    href: "/products",
    linkLabel: "See all lines",
  },
  {
    step: "03",
    title: "Talk to us about the category",
    body: "For distribution or partnership questions, and anything this page has left open.",
    href: "/contact",
    linkLabel: "Get in touch",
  },
];

/** Standing provenance line for the section that carries the figures. */
export const tireSpecsHead = {
  eyebrow: "Reference",
  heading: "Measured performance",
  lede: "Figures from our own documentation. They describe the tyre, not a comparison against other products.",
};
