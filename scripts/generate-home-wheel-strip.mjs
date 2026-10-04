/**
 * Generate the homepage "featured wheels" strip data.
 *
 * ⚠️ DETERMINISTIC BY DESIGN. The strip must be reproducible: no hand-picking
 * from 2757 photos, and re-running this script after the catalogue changes must
 * produce the same result for the same inputs.
 *
 * Selection rule (see PAGE-SPECS/index-home.md §2 视口 04):
 *   1. Walk the real catalogue (assets/wheel-data/WHEEL-CATALOG-ALL.json).
 *   2. Keep only models that have a matching image on disk (DEC-013 — no
 *      image, no listing).
 *   3. Bucket by `sizeCategory` and take ONE model per bucket, smallest
 *      diameter first, so the strip shows breadth across the range rather
 *      than six near-identical 18-inch wheels.
 *   4. Within a bucket, take the first model in sorted order — never a
 *      "prettiest" one.
 *
 * Output: src/content/home-wheel-strip.ts (do not hand-edit).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOGUE = join(root, "assets/wheel-data/WHEEL-CATALOG-ALL.json");
const IMAGE_DIR = join(root, "public/images/wheels");
const OUT = join(root, "src/content/home-wheel-strip.ts");

const COUNT = 6;

// ── 1 · Catalogue ────────────────────────────────────────────────────────────
const catalogue = JSON.parse(readFileSync(CATALOGUE, "utf8"));

// ── 2 · Images on disk, indexed by model code ────────────────────────────────
// Filenames look like `<size>-<model>[-variant].webp` (e.g. 15-1081x-2.webp).
// The model code is everything after the size prefix, minus any trailing
// `-<digits>` variant suffix. Lower-cased for matching (DEC-012).
const imagesFor = new Map();
for (const file of readdirSync(IMAGE_DIR)) {
  if (!file.endsWith(".webp")) continue;
  const base = file.slice(0, -".webp".length);
  const afterSize = base.replace(/^\d+-/, "");
  const model = afterSize.replace(/-\d+$/, "").toLowerCase();
  if (!imagesFor.has(model)) imagesFor.set(model, []);
  imagesFor.get(model).push(file);
}

/**
 * Pick the first image for a model, in natural (sorted) order.
 *
 * ⚠️ `expectedSize` is not optional decoration: the same model code appears at
 * several diameters (0216 exists at both 19 and 20 inch), so matching on the
 * model code alone can hand a bucket an image whose size prefix contradicts the
 * bucket it is serving — the strip then shows the same photo twice. Requiring
 * the size prefix to match keeps every card's picture consistent with the spec
 * printed under it.
 */
function firstImage(model, expectedSize) {
  const files = imagesFor.get(model.toLowerCase());
  if (!files || files.length === 0) return null;
  const prefix = expectedSize.replace(/[^0-9]/g, "");
  const sized = files.filter((f) => f.startsWith(`${prefix}-`));
  if (sized.length === 0) return null;
  return [...sized].sort()[0];
}

// ── 3 · Bucket by size, take one per bucket ──────────────────────────────────
const SIZE_ORDER = ["15寸", "16寸", "17寸", "18寸", "19寸", "20寸"];

const buckets = new Map();
for (const m of catalogue.models) {
  const image = firstImage(m.model, m.sizeCategory);
  if (!image) continue; // no image → not listable (DEC-013)
  const bucket = m.sizeCategory || "未标注";
  if (!buckets.has(bucket)) buckets.set(bucket, []);
  buckets.get(bucket).push({ ...m, image });
}

const picked = [];
const usedModelCodes = new Set();
for (const size of SIZE_ORDER) {
  const bucket = buckets.get(size);
  if (!bucket || bucket.length === 0) continue;
  // Deterministic: sort by model code, then take the first model this strip
  // has not already shown. A model that exists at two diameters (e.g. 0216 at
  // 19 and 20 inch) would otherwise appear as two visually identical cards.
  const chosen = [...bucket]
    .sort((a, b) => a.model.localeCompare(b.model))
    .find((m) => !usedModelCodes.has(m.model.toLowerCase()));
  if (!chosen) continue;
  usedModelCodes.add(chosen.model.toLowerCase());
  picked.push(chosen);
  if (picked.length === COUNT) break;
}

if (picked.length < COUNT) {
  console.error(
    `⚠️  only ${picked.length} models matched an image across ${SIZE_ORDER.length} size buckets`,
  );
}

// ── 4 · Emit ─────────────────────────────────────────────────────────────────
const rows = picked.map((m) => {
  const size = m.sizes?.[0] ?? "";
  const pcd = m.pcds?.[0] ?? "";
  const finish = m.finishes?.[0] ?? "";
  const process = m.process || null;
  // alt mirrors the catalogue card template (index-home.md §3.4).
  const altParts = [m.model, "轮毂", size, pcd, process, finish].filter(Boolean);
  return {
    model: m.model,
    image: `/images/wheels/${m.image}`,
    size,
    pcd,
    finish,
    process,
    alt: altParts.join(" · "),
  };
});

const banner = `/**
 * Homepage featured-wheel strip — GENERATED, DO NOT HAND-EDIT.
 *
 * Produced by scripts/generate-home-wheel-strip.mjs from
 * assets/wheel-data/WHEEL-CATALOG-ALL.json + public/images/wheels/.
 *
 * Selection is deterministic (one model per size bucket, first in sorted
 * order). Re-run the script after the catalogue changes:
 *   node scripts/generate-home-wheel-strip.mjs
 */
import type { FeaturedWheel } from "./types";

export const homeWheelStrip: FeaturedWheel[] = ${JSON.stringify(rows, null, 2)};
`;

writeFileSync(OUT, banner);
console.log(`✔ wrote ${OUT}`);
for (const r of rows) console.log(`   ${r.model.padEnd(14)} ${r.size.padEnd(8)} ${r.image}`);
