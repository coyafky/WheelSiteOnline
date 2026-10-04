import type { Capability } from "./types";

/**
 * The six capability cells shown directly under the homepage hero.
 *
 * ── Why these six (rewritten 2026-10-02) ────────────────────────────────────
 * The previous set was written in the clone era, when this template still
 * modelled a wheel-only shop. Every cell was a wheel-retail selling point —
 * `Deep Concave Profiles`, `Tailored Fitment`, `Branded Accessories` — which
 * meant the band directly under the hero contradicted the hero: the hero said
 * four product lines (see `site.description`, DEC-022), the band answered as if
 * only one of them existed. A visitor's first six facts were all about rims.
 *
 * These six answer the question that actually holds across all four lines:
 * **can this factory make the part I need, to my specification, without a
 * middleman, and can the output carry my own brand?** Nothing here assumes the
 * part is round.
 *
 * ── Grouping (two cells each) ───────────────────────────────────────────────
 * 01–02  what we can make     — engineering input + process breadth
 * 03–04  how it reaches you   — direct relationship + specification integrity
 * 05–06  what stays yours     — your brand + visibility of your own order
 *
 * ── Evidence discipline ─────────────────────────────────────────────────────
 * Each cell carries an `evidence` field naming what would prove it. Three of
 * the six still carry a `Pending confirmation` placeholder — the factory facts
 * are not in hand yet (see ARCHITECTURE/PROJECT.md open questions). Those are
 * named here rather than papered over. Grep for `Pending confirmation` before
 * launch; every hit is an unverified commercial claim currently shipped.
 *
 * ⚠️ The old cell 06 ("Reliable Lead Time", 20–30 days) was removed rather
 * than kept: the same unconfirmed window also appears on `/capabilities` and in
 * `site.leadTime`. Three unverified copies were worse than one, and a promise
 * replicated across three files is the hardest kind to retract.
 */

export const capabilities: Capability[] = [
  {
    index: "01",
    title: "Engineering-Led Development",
    body: "We build from your drawing, 3D model or sample. DFM feedback on wall thickness, draft and machining stock comes back before tooling starts.",
    evidence:
      "Needs a documented DFM review step. Pending confirmation of the actual engineering workflow.",
  },
  {
    index: "02",
    title: "Multi-Process Manufacturing",
    body: "Forging, die casting, CNC machining, spinning and surface treatment under one roof — so one part does not cross three suppliers to get finished.",
    evidence:
      "Needs the confirmed in-house process list. Pending confirmation.",
  },
  {
    index: "03",
    title: "Factory Direct Supply",
    body: "You buy from the line, not from a trading layer. That is what makes bespoke runs and mid-production changes physically possible.",
    evidence:
      "Supported by direct factory ownership. Confirm which lines are in-house vs subcontracted.",
  },
  {
    index: "04",
    title: "Specification Discipline",
    body: "Dimensional and material data travel with the part. Regulated programmes get material certificates and inspection records, not just finished goods.",
    evidence:
      "Needs the real inspection capability: CMM, X-ray, dye penetrant, salt spray hours. Pending confirmation.",
  },
  {
    index: "05",
    title: "Private Label Delivery",
    body: "Casting marks, packaging, manuals and inspection paperwork all carry your brand. Fenghuai stays invisible to your customer.",
    evidence: "Supported by the existing private-label rules and model codes.",
  },
  {
    index: "06",
    title: "Production Visibility",
    body: "Fixed sample-to-mass-production stages, each with an approval gate. You always know which stage your order is sitting in.",
    evidence:
      "Supported by the sample-first, approval-gated order flow. Confirm the real stage names and gate owners.",
  },
];
