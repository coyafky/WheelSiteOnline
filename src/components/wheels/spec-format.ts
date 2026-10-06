import type { PublicWheelVariant } from "@/lib/wheels/types";

/**
 * Display formatting for one **approved** `PublicWheelVariant`.
 *
 * Every value shown by WD02/WD03 comes from a single variant object — nothing
 * here reads a model-level `sizes[]` / `pcds[]` set, so a size, PCD, offset,
 * centre bore or finish can never be recombined into a configuration that does
 * not exist in the record (spec §3.3, §6).
 *
 * Units are always attached: `ET 35`, `73.1 mm`, `18×8.5`. A missing value is an
 * explicit em dash rather than a bare number (spec §6 "avoid bare numbers").
 */

/**
 * The variant fields a **browser** is allowed to receive.
 *
 * `PublicWheelVariant.finish` is the raw source value (Chinese) with no approved
 * English public name, and neither WD02 nor WD03 prints it. Passing it to a
 * client component would serialise every unpublished Chinese finish string into
 * the page source through the RSC payload — the on-screen ban of spec §3.3 fact
 * 4 leaking into the markup instead. So the interactive half of the page gets
 * this projection and the finish cell is rendered from `finishNamePending`.
 *
 * The only reader of `finish` is the WD04 publication gate, which runs on the
 * server and never ships the value.
 */
export type WheelVariantSpec = Pick<
  PublicWheelVariant,
  "productionCode" | "size" | "pcd" | "pcdKey" | "offset" | "centerBore"
>;

/** Project one approved variant down to what the browser may hold. */
export function toBrowserVariant(variant: PublicWheelVariant): WheelVariantSpec {
  return {
    productionCode: variant.productionCode,
    size: variant.size,
    pcd: variant.pcd,
    pcdKey: variant.pcdKey,
    offset: variant.offset,
    centerBore: variant.centerBore,
  };
}

/** Shown when the record has no value for a field. Never a guess. */
export const UNKNOWN_SPEC = "—";

/** `"18*8.5"` → `"18×8.5"`. The source separator becomes the site's display form. */
export function sizeLabel(variant: WheelVariantSpec): string {
  const raw = variant.size.trim();
  return raw ? raw.replace(/\*/g, "×") : UNKNOWN_SPEC;
}

/**
 * The **approved canonical** PCD, not the raw source string (spec §3.3 fact 3).
 * `pcdKey` is `"5x112"`; the site displays the multiplication sign.
 */
export function pcdLabel(variant: WheelVariantSpec): string {
  const raw = (variant.pcdKey || variant.pcd).trim();
  return raw ? raw.replace(/x/g, "×") : UNKNOWN_SPEC;
}

/** Bare numeric offset (`"35"`) — used inside §4's `ET{offset}` summary slot. */
export function offsetValue(variant: WheelVariantSpec): string {
  return variant.offset === null ? UNKNOWN_SPEC : String(variant.offset);
}

/** Bare numeric centre bore (`"73.1"`) — used inside §4's `CB {centerBore} mm`. */
export function centreBoreValue(variant: WheelVariantSpec): string {
  return variant.centerBore === null ? UNKNOWN_SPEC : String(variant.centerBore);
}

/** Table-cell form: `ET 35`. */
export function offsetLabel(variant: WheelVariantSpec): string {
  return `ET ${offsetValue(variant)}`;
}

/** Table-cell form: `73.1 mm`. */
export function centreBoreLabel(variant: WheelVariantSpec): string {
  return `${centreBoreValue(variant)} mm`;
}
