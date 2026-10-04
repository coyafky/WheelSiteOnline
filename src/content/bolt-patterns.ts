import type { FaqEntry, GuideSection } from "./types";

/**
 * Bolt-pattern guides (`/insights/bolt-patterns` + `/[pattern]`).
 *
 * ⚠️ SAFETY-CRITICAL. A bolt pattern (PCD) that does not match the hub means
 * the wheel cannot be torqued correctly, and that is a wheel-loss failure
 * mode. This module therefore follows the same discipline as
 * `src/content/fitment.ts`:
 *
 *   • No vehicle → pattern mapping is published as verified fact.
 *   • `commonVehicles` is a STARTING REFERENCE ONLY. It carries a `note` and
 *     the UI renders a "verify against your specific vehicle" marker beside it
 *     on every surface.
 *   • The primary content is METHOD — how to measure the pattern yourself —
 *     because that is the only route to a number you can trust.
 *   • PCD is expressed as it is written on a wheel: 5x114.3, never 5x114.30
 *     with false precision, and never as a fitment guarantee.
 *
 * When Fenghuai engineering has confirmed a vehicle's PCD, the entry model can
 * carry `verified: true` and the marker flips — exactly as the fitment pages
 * do. Nothing here sets it true.
 */

/** Standing notice rendered above the fold on the index and every guide. */
export const boltPatternNotice = {
  label: "Safety-critical fitment data",
  heading: "Measure your own bolt pattern — do not trust a list",
  body: "Bolt pattern is the circle the wheel's mounting holes sit on, and getting it wrong is a wheel-loss risk, not a styling problem. The vehicle lists on these pages are starting points for research only: they are compiled from public references, not from Fenghuai engineering data, and they are not a fitment guarantee. Identify your pattern by measuring the wheel or the hub, or by checking your vehicle's factory documentation for the exact trim, brake package and model year. Fenghuai confirms PCD, centre bore and offset per order before anything is manufactured.",
} as const;

/** Per-entry marker text — the "verify this yourself" flag. */
export const boltPatternVerifyLabel = "Verify against your specific vehicle";

/** Index-page copy. */
export const boltPatternsIndexCopy = {
  eyebrow: "Reference",
  heading: "Bolt Pattern Guides",
  lede: "A bolt pattern defines how a wheel mounts to the hub: how many fixing points, and the diameter of the circle they sit on. These guides explain what the two numbers mean, how to measure a pattern on a real wheel, and how to size a spigot — with the vehicle lists clearly marked as a starting point rather than a fitment authority.",
  supporting:
    "Three guides today: 5x112, 5x114.3 and 5x120. Each one leads with the method, not the list.",
  /** Note shown above the entry grid. */
  listNote:
    "The vehicle references below are compiled from public sources and are NOT verified fitment data. Always confirm against your specific vehicle before ordering.",
  methodEyebrow: "The method",
  methodHeading: "How to identify the pattern you actually have",
  methodBody:
    "Two reliable routes: read the marking on your existing wheel, or measure the pattern directly. Both are covered in each guide, and the measuring method is the same for every pattern.",
} as const;

/* ---------------------------------------------------------------------------
   Measuring method — shared across all guides
--------------------------------------------------------------------------- */

/** The measuring procedure, in GuideSection form so it can be reused verbatim. */
export const boltPatternMeasuringSections: GuideSection[] = [
  {
    heading: "What the two numbers mean",
    body: [
      "A bolt pattern is written as two numbers separated by an 'x': the number of fixing points, then the diameter of the circle those points sit on. 5x114.3 means five studs or bolts, sitting on a circle 114.3 millimetres across.",
      "The count is straightforward to see. The circle diameter is the part that gets measured wrong, because the obvious measurement — the straight-line distance between two adjacent holes — is not the circle diameter except in one special case (an even number of fixings, measured across the centre).",
      "The unit matters too. Most patterns are quoted in millimetres, but some marques publish their own in inches, and 5x4.5 inches and 5x114.3 mm are the same pattern written two ways. A wheel listed as 5x4.5 and a hub quoted as 5x114.3 will fit each other; a wheel listed as 5x114 and a hub quoted as 5x114.3 may not, because those are not the same number.",
    ],
  },
  {
    heading: "Measure it: five-stud patterns",
    body: [
      "For an odd number of fixings, you cannot measure straight across, because no hole sits directly opposite another. The standard method is to measure from the CENTRE of one hole to the OUTER EDGE of the hole directly opposite it — not centre-to-centre, and not across two adjacent holes.",
      "The reason is geometric: for an odd count, that centre-to-opposite-outer-edge distance equals the diameter of the bolt circle. Measuring hole-to-hole across the nearest pair instead gives a smaller number that looks plausible and is wrong, which is exactly why unverified PCD data spreads.",
      "Measure on the hub if you can, not on a wheel — the hub studs or bolt holes are the reference the wheel must match, and a wheel may already be the wrong one. Use a caliper or a steel rule with a square edge, and measure across the largest span the fixing circle offers.",
    ],
  },
  {
    heading: "Measure it: four- and six-stud patterns",
    body: [
      "For an even number of fixings, a hole sits directly opposite the one you started from, so you can measure centre-to-centre across the pattern and that distance is the circle diameter. Four- and six-stud patterns are therefore easier to measure than five-stud ones.",
      "Even so, measure across the full span — pick the pair with the greatest centre-to-centre distance. On a six-stud pattern that is any of the three opposite pairs; on a four-stud pattern, either diagonal.",
    ],
  },
  {
    heading: "Read it: markings and documentation",
    body: [
      "The pattern is usually cast, stamped or moulded on the inside face of the wheel or under the centre cap, often alongside the offset and sometimes the centre bore. Look for a group like '5x114.3' or '5Jx17 ET45 5x114.3' — the pattern is the part with an x between a small whole number and a decimal.",
      "Where the marking is missing or illegible, the vehicle's factory documentation for the exact trim is a better source than a pattern list, because it is specific to your car rather than to a model family that spans several generations and brake packages.",
      "Whatever route you take to a number, measure to confirm it before an order. A number you have confirmed beats a number that is probably right.",
    ],
  },
  {
    heading: "Centre bore and spigot rings",
    body: [
      "Bolt pattern is only one of the two things that locate a wheel on the hub. The centre bore must also match the hub spigot, because that is what centres the wheel before the fixings are torqued; the studs or bolts then clamp it, they do not locate it.",
      "A spigot ring is a plastics or metal sleeve that bridges a centre-bore mismatch. It is a legitimate aftermarket fitment aid on a production wheel, but it is not the right answer on a custom order: if we are manufacturing the wheel for your car, we build it with the correct centre bore in the first place.",
    ],
  },
];

/* ---------------------------------------------------------------------------
   Entries
--------------------------------------------------------------------------- */

export type BoltPatternVehicleReference = {
  /** Make and model family, as a research pointer only. */
  vehicle: string;
  /** Free-text note on which generations/trims this pointer usually covers. */
  note: string;
};

export type BoltPatternEntry = {
  /** URL segment, e.g. "5x114-3". */
  slug: string;
  /** Pattern as written on a wheel, e.g. "5x114.3". */
  pattern: string;
  /** Short human label, e.g. "Five-stud, 114.3 mm circle". */
  label: string;
  /** Answer-first intro. */
  intro: string;
  /** `GuideSection`-shaped explanation of the two numbers in this pattern. */
  explanation: GuideSection[];
  /**
   * Starting reference only. NOT a fitment list. Every surface renders the
   * verify marker beside this.
   */
  commonVehicles: BoltPatternVehicleReference[];
  /** How to measure this specific pattern, in `GuideSection` form. */
  measuringNotes: GuideSection[];
  /** Long-form article body. */
  sections: GuideSection[];
  /** Whether Fenghuai engineering has signed this entry off. Always false. */
  verified: boolean;
};

export const boltPatterns: BoltPatternEntry[] = [
  {
    slug: "5x112",
    pattern: "5x112",
    label: "Five-stud, 112 mm circle",
    intro:
      "5x112 is a five-stud pattern on a 112 mm bolt circle, used across a large share of European production cars. The pattern name is fixed; the centre bore and offset that go with it are not — they vary by platform, generation and brake package, which is why the pattern alone never defines a wheel.",
    verified: false,
    explanation: [
      {
        heading: "Breaking down 5x112",
        body: [
          "The '5' is the number of fixing points: five wheel bolts or studs. It tells you what to count. It does not tell you the thread pitch of the bolts, the seat type (ball or cone), or whether the car uses bolts into the hub or studs with nuts — all of which you also need to order hardware correctly.",
          "The '112' is the diameter, in millimetres, of the circle that passes through the centre of the five fixing points. It is not the distance between two adjacent bolts, and reading it that way is the single most common mistake in bolt-pattern identification.",
          "Because 112 is a whole number in millimetres, 5x112 is unambiguous in unit terms. Contrast that with patterns published in inches, where the same physical circle may be written as a decimal inch figure and needs converting before it can be compared.",
        ],
      },
      {
        heading: "Why the pattern number alone is not enough",
        body: [
          "Two cars can both be 5x112 and still need completely different wheels, because centre bore and offset differ. The centre bore must match the hub spigot or the wheel will not be centred; the offset must put the wheel where the arch, the suspension and the brake caliper allow.",
          "A wheel is therefore specified by at least five values — diameter, width, offset, PCD and centre bore — and a listing that gives you only the PCD is a starting point, not a specification.",
          "PLACEHOLDER: any platform-specific centre bore or offset figure must come from Fenghuai engineering for the exact vehicle. Do not infer one from the pattern.",
        ],
      },
    ],
    commonVehicles: [
      {
        vehicle: "Volkswagen Group (Audi, VW, Skoda, SEAT) — many platforms",
        note: "Widely associated with 5x112, but generations, trims and brake options within a single model line vary. Confirm the pattern on the specific vehicle.",
      },
      {
        vehicle: "Mercedes-Benz — a large share of passenger models",
        note: "Many, not all. Centre bore is a common differentiator between otherwise similar wheels. Do not assume from the badge.",
      },
      {
        vehicle: "BMW — some models",
        note: "BMW also uses 5x120 widely, so a general BMW reference is not enough to identify the pattern. Check the specific generation.",
      },
    ],
    measuringNotes: [
      {
        heading: "Measuring a 5x112 pattern",
        body: [
          "Five fixings means no hole sits directly opposite another, so measure from the CENTRE of one bolt hole to the OUTER EDGE of the hole roughly opposite it. That span is the bolt circle diameter: on a true 5x112 it reads 112 mm.",
          "Measuring centre-to-centre between two adjacent holes gives roughly 65–66 mm on this pattern, which is a plausible-looking number that does not identify the pattern. If your measurement came out around that figure, you measured the wrong span.",
          "Measure the hub rather than a wheel where possible. On a vehicle with bolts rather than studs, measuring the hole centres on the hub face is the more direct route to the circle the wheel must match.",
        ],
      },
      {
        heading: "Confirming before you order",
        body: [
          "Compare your measured figure against the marking on the existing wheel. If both agree at 112, you have confirmed it twice. If they disagree, trust the measurement — a marking can belong to a wheel that was already wrong for the car.",
          "Send us the measured figure along with the vehicle, the exact trim and the wheel size you are after. We confirm the specification in writing before material is cut.",
        ],
      },
    ],
    sections: [
      {
        heading: "What 5x112 describes",
        body: [
          "A bolt pattern is written count-first, then circle diameter: five fixing points on a 112 mm circle. The count tells you how many fixing points the wheel must have and nothing about their size, thread or seat. The diameter tells you how far apart those points are arranged, measured through the circle they define rather than between any two of them.",
          "The practical consequence is that a wheel with five holes spaced 112 mm across the bolt circle will sit over five hub fixings arranged the same way, and a wheel with any other circle diameter will not. There is no adjustment and no adapter that makes a bolt pattern fit safely; the only correct answer is a wheel manufactured with the right one.",
          "5x112 is common on European production cars. That breadth is exactly why the pattern name alone is not a fitment answer: the same pattern appears on cars with very different centre bores, offsets and brake packages, so the PCD is the first question, not the last.",
        ],
      },
      {
        heading: "How to measure it on a real vehicle",
        body: [
          "With an odd number of fixings you cannot measure straight across, because no fixing sits directly opposite another. The correct method is to measure from the centre of one fixing point to the outer edge of the fixing point roughly across from it. That span equals the bolt circle diameter.",
          "The intuitive-but-wrong method is to measure centre-to-centre between the two nearest fixings. On 5x112 that returns roughly 65–66 mm. It looks like a legitimate measurement and it identifies nothing, which is how incorrect pattern data propagates from one forum post to the next.",
          "Measure the hub rather than a wheel when you can. The hub is the reference the wheel must match, and a wheel that is already on the car may itself be the wrong one — particularly on a used vehicle you did not build.",
        ],
      },
      {
        heading: "The values that travel with the pattern",
        body: [
          "Bolt pattern does not travel alone. Each vehicle also has a centre bore — the diameter of the hub spigot the wheel locates on — and a range of offsets. On a custom order we build the centre bore to match the vehicle exactly, which is why we ask for it rather than supplying a spigot ring.",
          "Offset is the other value that must come with the vehicle rather than the pattern. Two 5x112 cars can need completely different offsets because of arch width, suspension design and brake package, and an offset that fits one can foul the other.",
          "The honest summary: the pattern tells you the wheel can be bolted on; it says nothing about whether it will then sit correctly or clear anything. That is a separate conversation, and it is the one we want to have before the order.",
        ],
      },
      {
        heading: "Vehicle references, and why they are only a starting point",
        body: [
          "The vehicle list on this page is compiled from public references. It is here so you can orient yourself, not so you can order from it. Model families span multiple generations, and within a single generation the pattern can differ between trims and markets.",
          "Treat any list — ours or a marketplace's — as a prompt to go and measure your own vehicle. A pattern list that is 95% correct is worse than useless for the 5% it gets wrong, because the failure mode is a wheel that cannot be torqued correctly.",
          "PLACEHOLDER: to publish verified per-vehicle pattern data, Fenghuai engineering must confirm each entry and the entry must carry `verified: true`. Until then the marker stays.",
        ],
      },
      {
        heading: "What we need to confirm your specification",
        body: [
          "Send the vehicle make, model, exact trim and model year, the chassis code where you have it, the brake package if there is a choice, and your measured PCD and centre bore. If you have the factory wheel specification, include that too.",
          "We review the pattern, centre bore, offset, width and load rating together, and return a written specification for approval before production. A number you have measured and we have confirmed is the only kind worth building from.",
        ],
      },
    ],
  },
  {
    slug: "5x114-3",
    pattern: "5x114.3",
    label: "Five-stud, 114.3 mm circle",
    intro:
      "5x114.3 is a five-stud pattern on a 114.3 mm bolt circle — the metric expression of the pattern many sources still publish in inches as 5x4.5. Because 114.3 mm and 4.5 inches describe the same circle, the two names are interchangeable; because sources mix them, the ambiguity is a common source of ordering errors.",
    verified: false,
    explanation: [
      {
        heading: "Breaking down 5x114.3",
        body: [
          "Five fixing points, arranged on a circle 114.3 millimetres across. The figure is not arbitrary: 114.3 mm is exactly 4.5 inches, which is why the same pattern appears in older and American-market sources as 5x4.5. Both describe one physical arrangement.",
          "That equivalence is worth holding onto, because it explains why a wheel advertised as 5x4.5 and a hub quoted as 5x114.3 are compatible, while a wheel listed loosely as '5x114' is a question mark. 114 and 114.3 are different numbers; whether they describe the same wheel depends on who was rounding.",
          "As with every pattern, the count is visible and the circle diameter must be measured. The 5x4.5 / 5x114.3 naming simply adds a unit-conversion trap on top of the ordinary measuring trap.",
        ],
      },
      {
        heading: "The unit trap",
        body: [
          "Where a source publishes inch figures, 4.5 inches converts to 114.3 mm. A catalogue that lists the same wheel as 5x114.3 in one place and 5x114 in another is not describing two products; it is rounding inconsistently. Before comparing anything, convert to one unit and write it to a consistent number of decimals.",
          "This matters at the point of ordering, not just in research. A specification sheet that says 5x114 is ambiguous: it may mean 114.3 correctly rounded, or it may be a transcription error. When we return a specification in writing, we state the pattern to a decimal so there is nothing to interpret.",
        ],
      },
    ],
    commonVehicles: [
      {
        vehicle: "Japanese marques — a large share of passenger and performance models",
        note: "5x114.3 is widely used across Japanese platforms, but model generations differ. Confirm on the specific vehicle, not the marque.",
      },
      {
        vehicle: "Korean marques — many passenger models",
        note: "Commonly associated with 5x114.3 on several platforms. Treat as a research pointer only.",
      },
      {
        vehicle: "Some American-market models",
        note: "Often published as 5x4.5 rather than 5x114.3 — the same circle, different unit. Confirm which unit a listing is using before comparing.",
      },
    ],
    measuringNotes: [
      {
        heading: "Measuring a 5x114.3 pattern",
        body: [
          "Odd fixing count: measure from the CENTRE of one fixing point to the OUTER EDGE of the roughly opposite fixing point. A true 5x114.3 reads 114.3 mm across that span.",
          "Centre-to-centre between two adjacent fixings returns roughly 67 mm on this pattern, which — as with 5x112 — is the wrong span and a plausible-looking wrong answer.",
          "If your measurement comes out at 114.0 mm, resist rounding it to 114.3 without checking. Re-measure, and compare against the marking on the wheel; 0.3 mm is within measuring error on a poor technique but is worth resolving before an order.",
        ],
      },
      {
        heading: "Confirming the unit and the figure",
        body: [
          "Write the pattern in millimetres with one decimal — 114.3 — and, if you are comparing against an inch-unit source, note the equivalence explicitly at 4.5 inches. That single convention removes the most common error on this pattern.",
          "Then confirm the pattern against the existing wheel's marking and send both figures to us along with the vehicle details for a written specification.",
        ],
      },
    ],
    sections: [
      {
        heading: "What 5x114.3 describes",
        body: [
          "Five fixing points on a 114.3 mm bolt circle. The number after the x is the diameter of the circle through the centres of those five points — not the gap between adjacent points, and not the diameter of the hub itself.",
          "This pattern carries an unusual amount of naming noise because it sits exactly on a unit boundary. 114.3 mm is 4.5 inches precisely, so American-market and older sources write it as 5x4.5 while metric sources write 5x114.3. The two are the same arrangement of fixing points and wheels are interchangeable across them.",
          "The noise creates a real risk at the ordering stage. A listing written 5x114 might be correct metric notation rounded for tidiness, or it might be a typo. Treat the un-decimated form as unverified and go back to measurement.",
        ],
      },
      {
        heading: "How to measure it on a real vehicle",
        body: [
          "With five fixings there is no opposite pair, so measure from the centre of one fixing point to the outer edge of the fixing point across from it. That span is the circle diameter: 114.3 mm on this pattern.",
          "Measuring between adjacent fixings instead gives roughly 67 mm and identifies nothing. It is the error that produces 'almost 114' figures in second-hand listings.",
          "Prefer the hub as your measuring surface. Where the vehicle uses studs, lay a steel rule across the stud centres with a square edge to find the widest span; where it uses bolts, measure the hole pattern on the hub face in the same way.",
        ],
      },
      {
        heading: "Unit equivalence, done properly",
        body: [
          "Convert every figure to millimetres before comparing, and write it to one decimal place. 4.5 inches becomes 114.3 mm. Do not carry a rounded 114 forward into a comparison against a wheel marked 114.3 and conclude they match — verify the conversion rather than assuming it.",
          "The same discipline applies to any pattern published in inches. Convert, then compare, then confirm by measuring. Three cheap steps that remove almost all of the risk in this part of a specification.",
        ],
      },
      {
        heading: "Vehicle references, and why they are only a starting point",
        body: [
          "The list on this page is compiled from public references so you can orient yourself. It is not a fitment list and it is not verified. Within a single model line, pattern, centre bore and offset can change between generations, trims and markets.",
          "Worse, this pattern is frequently mis-transcribed as 5x114 in consumer-facing listings, so a vehicle list that appears to say a model is '5x114' may be repeating a rounding, not a fact.",
          "PLACEHOLDER: no per-vehicle pattern on this page is verified. Fenghuai engineering must confirm each entry, and the entry must carry `verified: true`, before any of it is presented as more than a research pointer.",
        ],
      },
      {
        heading: "What we need to confirm your specification",
        body: [
          "Send the vehicle make, model, exact trim and year, the brake package where there is a choice, and your measured PCD and centre bore — stating whether the figure came from measurement, a wheel marking or factory documentation.",
          "We check pattern, centre bore, offset, width and load rating as one specification, and return it in writing for approval before material is cut.",
        ],
      },
    ],
  },
  {
    slug: "5x120",
    pattern: "5x120",
    label: "Five-stud, 120 mm circle",
    intro:
      "5x120 is a five-stud pattern on a 120 mm bolt circle. It is most strongly associated with BMW and a number of other rear-drive European platforms, and it is a pattern where the vehicle lists are particularly misleading — several marques use both 5x120 and other patterns across their ranges, so a badge is never an answer.",
    verified: false,
    explanation: [
      {
        heading: "Breaking down 5x120",
        body: [
          "Five fixing points on a 120 mm circle. As with every pattern, the count is what you can see and the circle diameter is what you must measure — the straight-line distance between two adjacent fixings is not it.",
          "On 5x120 the adjacent-fixing span is roughly 70–71 mm. If you measure that and conclude you have a 5x120 wheel, you have skipped the measurement that actually matters.",
          "Also note that 120 is a whole number in millimetres, so there is no unit ambiguity in the name itself. Where this pattern goes wrong is not conversion; it is assuming a marque always uses it.",
        ],
      },
      {
        heading: "Centre bore, not just pattern",
        body: [
          "Vehicles on 5x120 differ in centre bore. Two wheels can share the pattern and still not interchange if the centre bore does not match the hub spigot, because the bore is what centres the wheel before the fixings are torqued.",
          "On a custom order we machine the correct centre bore for the vehicle, so this is a value we ask for rather than a mismatch we bridge with a spigot ring.",
          "PLACEHOLDER: any centre bore or offset figure per vehicle must come from Fenghuai engineering for the exact trim. Nothing on this page supplies one.",
        ],
      },
    ],
    commonVehicles: [
      {
        vehicle: "BMW — many rear-drive and all-wheel-drive models",
        note: "BMW also uses 5x112 on some models (notably many front-drive-based platforms), so 'it is a BMW' does not identify the pattern. Check the specific model and generation.",
      },
      {
        vehicle: "Some General Motors rear-drive platforms",
        note: "Associated with 5x120 on certain models and generations. Treat as a pointer, not a fact.",
      },
      {
        vehicle: "Various European rear-drive performance models",
        note: "Included where public references list 5x120, but cross-checked against nothing authoritative here. Measure your own vehicle.",
      },
    ],
    measuringNotes: [
      {
        heading: "Measuring a 5x120 pattern",
        body: [
          "Measure from the CENTRE of one fixing point to the OUTER EDGE of the roughly opposite fixing point. On a true 5x120 that span is 120 mm.",
          "Centre-to-centre between two adjacent fixings reads roughly 70–71 mm on this pattern — close enough to other patterns' figures to be mistaken for a valid measurement if you have not established which span to take.",
          "As always, prefer the hub as the measuring reference, and confirm your figure against the marking on the existing wheel.",
        ],
      },
      {
        heading: "The particular risk on this pattern",
        body: [
          "5x120 is often assumed from the marque rather than measured, because a few manufacturers are strongly associated with it. That assumption fails whenever the same marque sells a platform on a different pattern — which several do, alongside 5x112.",
          "The remedy is unglamorous and it works: measure the vehicle in front of you, confirm against the wheel marking, and send both figures. We then confirm PCD, centre bore, offset and load rating together in writing.",
        ],
      },
    ],
    sections: [
      {
        heading: "What 5x120 describes",
        body: [
          "Five fixing points arranged on a 120 mm bolt circle. The pattern says a wheel with five correctly spaced holes will sit over five hub fixings spaced the same way. It says nothing about centre bore, offset, or whether the wheel will clear the brake package.",
          "5x120 is strongly associated with rear-drive European performance cars and with a small number of American rear-drive platforms. That association is useful for orientation and dangerous as a substitute for measurement, because several marques that use 5x120 also use 5x112 on other models within the same range.",
          "A dealer who assumes from the badge will eventually supply a wheel that cannot be bolted to the car. The pattern is a measurement, not a brand attribute.",
        ],
      },
      {
        heading: "How to measure it on a real vehicle",
        body: [
          "Five fixings: no opposite pair exists, so take the span from the centre of one fixing point to the outer edge of the roughly opposite one. That distance is the bolt circle diameter, 120 mm on this pattern.",
          "Adjacent-fixing centre-to-centre on 5x120 comes out around 70–71 mm. That number is not the pattern and does not identify it.",
          "Measure the vehicle's hub rather than a wheel already fitted to it, and use a caliper or steel rule held square to the pattern so the span is measured through the hole centres rather than across their edges.",
        ],
      },
      {
        heading: "Centre bore and the values that travel with the pattern",
        body: [
          "The centre bore must match the hub spigot, because it is the bore that centres the wheel. The fixing points clamp it once centred; they do not locate it. A mismatch here — even with a correct pattern — is why spigot rings exist, and why we would rather machine the right bore.",
          "Offset must also be confirmed per vehicle. On rear-drive performance cars with a large brake option, the inboard clearance is often the binding constraint, and it is not derivable from the pattern or the model name.",
          "The full specification we work to is diameter, width, offset, PCD and centre bore, with the load rating confirmed as well. A pattern on its own is one fifth of it.",
        ],
      },
      {
        heading: "Vehicle references, and why they are only a starting point",
        body: [
          "The vehicle references here are compiled from public sources for orientation. They are not verified and they are not exhaustive. Within a single marque, some models use 5x120 and others use 5x112, and that distinction is not visible from the badge.",
          "Any pattern list should be treated as a prompt to measure, never as a source of a number you act on. The cost of treating a list as fact is a wheel that will not torque down correctly, which is a safety failure rather than an inconvenience.",
          "PLACEHOLDER: no entry on this page has been signed off by Fenghuai engineering. Each would need confirmation and a `verified: true` flag before it could be presented as anything more than a research pointer.",
        ],
      },
      {
        heading: "What we need to confirm your specification",
        body: [
          "Send the vehicle make, model, exact trim and model year, the chassis code where known, the brake package option, and your measured PCD and centre bore with a note on how you measured them.",
          "We return a written specification covering pattern, centre bore, offset, width and load rating for approval before production. Confirmed numbers only — no assumed ones.",
        ],
      },
    ],
  },
];

export function getBoltPattern(slug: string): BoltPatternEntry | undefined {
  return boltPatterns.find((entry) => entry.slug === slug);
}

/** Related links shown at the foot of the index and each guide. */
export const boltPatternPathways = [
  {
    eyebrow: "Guide",
    title: "How to measure your fitment",
    body: "The five numbers a forged wheel order needs — including where the bolt pattern fits into the specification.",
    href: "/insights/how-to-measure-fitment",
    linkLabel: "Read the guide",
  },
  {
    eyebrow: "Guide",
    title: "Understanding offset and backspacing",
    body: "Offset is the other invisible value that decides whether a wheel clears. This is how it works.",
    href: "/insights/offset-and-backspacing",
    linkLabel: "Read the guide",
  },
  {
    eyebrow: "Tool",
    title: "Wheel offset calculator",
    body: "Compare an original wheel against a replacement and see how far each edge moves, in millimetres.",
    href: "/tools/offset-calculator",
    linkLabel: "Open the tool",
  },
] as const;

/** FAQ shown on the bolt-pattern index. */
export const boltPatternFaqs: FaqEntry[] = [
  {
    question: "Is 5x114 the same as 5x114.3?",
    answer:
      "Not necessarily, and you should not assume it. 5x114.3 is the pattern, and 114.3 mm is exactly 4.5 inches — which is why the same pattern is published as 5x4.5 in inch-unit sources. A listing written 5x114 may be correct metric notation inexpertly rounded, or a transcription error. Convert, measure, and confirm before treating them as the same.",
  },
  {
    question: "Can I use an adapter to change my bolt pattern?",
    answer:
      "Wheel adapters exist and are used in the aftermarket, but they change the offset and add a fastened interface between the hub and the wheel. On a custom order there is no reason to accept that: we manufacture the wheel with your pattern and centre bore, which removes the adapter and the risk it carries. We do not recommend adapters as a substitute for a correctly specified forged wheel.",
  },
  {
    question: "How do I measure a five-stud pattern correctly?",
    answer:
      "You cannot measure straight across, because no fixing sits directly opposite another. Measure from the centre of one fixing point to the outer edge of the roughly opposite fixing point — that span equals the bolt circle diameter. Measuring centre-to-centre between two adjacent fixings gives a smaller, plausible-looking number that identifies nothing.",
  },
  {
    question: "Where is the pattern marked on a wheel?",
    answer:
      "Usually cast, stamped or moulded on the inside face of the wheel or under the centre cap, often next to the offset and sometimes the centre bore. Look for a group like 5x114.3. Where it is illegible, your vehicle's factory documentation for the exact trim is a better reference than any published pattern list.",
  },
  {
    question: "Does the bolt pattern alone tell me a wheel will fit?",
    answer:
      "No. A wheel needs the correct pattern to bolt on, but it also needs the correct centre bore to centre on the hub, an offset that clears the suspension, brakes and arch, and a load rating suited to the vehicle. We confirm all of those together per order.",
  },
  {
    question: "Can you look up my car's bolt pattern for me?",
    answer:
      "We will confirm the specification for your vehicle when you order, but we deliberately do not publish per-vehicle pattern data as verified fact, because a figure that is right for one trim, generation or brake package can be wrong for the next. The reliable answers come from measuring your own vehicle or from its factory documentation.",
  },
];
