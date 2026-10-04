/**
 * Material capability copy for `/capabilities` (section ③).
 *
 * 🔴 SCOPING DISCIPLINE
 * ---------------------
 * The only material language currently verified in the corpus is 6061
 * aluminium. Magnesium appears only in a wheel-context note inherited from the
 * P9 reference material and cannot be reused to claim a magnesium capability
 * on any other line without Fenghuai confirming it exists.
 *
 * So each entry carries `status`:
 *   - "confirmed"       → safe to state plainly
 *   - "representative"  → industry-generic framing only, no named figures
 *   - "pending"         → do NOT state as fact; surfaced as an open question
 *
 * No figures (alloy tempers, size envelopes, tolerances) are stated as fact
 * here. See `docs` §4 open item: material grades, size envelopes and
 * tolerances for the non-wheel lines are unconfirmed.
 */

export type MaterialStatus = "confirmed" | "representative" | "pending";

export type MaterialEntry = {
  /** Short eyebrow-style index, e.g. "01". */
  index: string;
  /** Material designation, shown as the card's display heading. */
  name: string;
  /** One-line statement of what the material is. */
  definition: string;
  /** What it is used for, stated at a level we can stand behind. */
  application: string;
  status: MaterialStatus;
  /** Rendered only when the entry is not yet confirmed. */
  note?: string;
};

export const materialsCopy = {
  eyebrow: "Materials",
  heading: "What the lines are set up to run",
  lede: "A manufacturing capability is only as wide as the materials the plant can process repeatably. Where a material is not yet confirmed by production, it is marked as such rather than listed as a claim.",
} as const;

export const materials: MaterialEntry[] = [
  {
    index: "01",
    name: "6061 Aluminium",
    definition:
      "A heat-treatable aluminium-magnesium-silicon alloy, widely specified where a good strength-to-weight ratio and machinability are both required.",
    application:
      "The base alloy behind our forged and machined wheel range, and the material our engineering review assumes unless a project specifies otherwise.",
    status: "confirmed",
  },
  {
    index: "02",
    name: "Magnesium Alloy",
    definition:
      "A lighter alloy family sometimes specified where minimum unsprung weight matters more than cost or corrosion management.",
    application:
      "⚠️ Pending confirmation — whether our lines process magnesium at production scale is not yet confirmed.",
    status: "pending",
    note: "Do not state as an available capability until production confirms tooling, safety handling and finishing routes.",
  },
  {
    index: "03",
    name: "Material Testing",
    definition:
      "Alloy grade and temper are verified against the purchase specification before blanks enter the line.",
    application:
      "Incoming verification of the material the drawing was approved against, so the blank that is cut matches the specification that was signed off.",
    status: "representative",
    note: "Framed as an industry-standard practice. Name specific test methods only once production confirms them.",
  },
];

/**
 * The open questions this section is currently blocked on. Rendered as a
 * visible note so the gap is honest rather than papered over with invention.
 */
export const materialsOpenItems: string[] = [
  "Confirmed alloy grades and tempers per product line",
  "Size envelopes the plant can actually produce",
  "Tolerances held per process, not per marketing claim",
];
