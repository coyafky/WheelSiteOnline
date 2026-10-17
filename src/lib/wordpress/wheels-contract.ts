import type {
  ProcessKey,
  PublicWheelModel,
  PublicWheelVariant,
} from "../wheels/types";
import { normalizePcds } from "../wheels/normalize.ts";

// Declared once in the cache-tag register; see ./cache-tags.ts.
export { WHEEL_PUBLICATION_TAG } from "./cache-tags.ts";

export type WordpressWheelVariant = {
  production_code?: unknown;
  diameter?: unknown;
  width?: unknown;
  pcd?: unknown;
  offset?: unknown;
  center_bore?: unknown;
  finish?: unknown;
};

export type WordpressWheelImage = {
  id?: unknown;
  src?: unknown;
  alt?: unknown;
  caption?: unknown;
};

export type WordpressWheelFields = {
  model?: unknown;
  display_model?: unknown;
  publication_status?: unknown;
  image_rights_status?: unknown;
  supply_status?: unknown;
  specification_status?: unknown;
  approved_process?: unknown;
  seo_title?: unknown;
  seo_description?: unknown;
  images?: WordpressWheelImage[];
  variants?: WordpressWheelVariant[];
};

export type WordpressWheelRecord = {
  id: number;
  slug: string;
  status?: "publish" | "draft" | "pending" | "private" | "future" | "trash";
  wheel: WordpressWheelFields;
};

export type WordpressWheelCollection = {
  authoritative: boolean;
  items: WordpressWheelRecord[];
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function processKey(value: unknown): ProcessKey {
  const source = text(value);
  if (source === "旋压") return "flow-formed";
  if (source === "低压") return "low-pressure-cast";
  if (source === "低压+旋压") return "low-pressure-flow-formed";
  if (source === "锻造") return "forged";
  return "not-specified";
}

function processLabel(key: ProcessKey): string | undefined {
  return {
    "flow-formed": "Flow Formed",
    "low-pressure-cast": "Low Pressure Cast",
    "low-pressure-flow-formed": "Low Pressure Cast + Flow Formed",
    forged: "Forged",
    "not-specified": undefined,
  }[key];
}

function normalizeVariant(value: WordpressWheelVariant): PublicWheelVariant | null {
  const productionCode = text(value.production_code);
  const diameter = finiteNumber(value.diameter);
  const width = finiteNumber(value.width);
  const pcd = text(value.pcd);
  const pcdKeys = normalizePcds(pcd);
  const offset = finiteNumber(value.offset);
  const centerBore = finiteNumber(value.center_bore);
  if (
    !productionCode
    || diameter === null || diameter < 10 || diameter > 26
    || width === null || width < 4 || width > 14
    || pcdKeys.length === 0
    || offset === null || offset < -100 || offset > 100
    // WordPress 只接管已有已核准事实，数值范围继续沿用旧目录契约：
    // 有限且为正即可；是否为源数据笔误由运营在后台更正，不在迁移时静默删型号。
    || centerBore === null || centerBore <= 0
  ) return null;

  return {
    productionCode,
    size: `${Number(diameter.toFixed(3))}*${Number(width.toFixed(3))}`,
    diameter,
    width,
    pcd,
    pcdKey: pcdKeys[0],
    offset,
    centerBore,
    finish: text(value.finish),
  };
}

/** 把公开 REST 记录收敛到页面既有视图；任一关键字段异常都拒绝整条型号。 */
export function normalizeWordpressWheel(record: WordpressWheelRecord): PublicWheelModel | null {
  const fields = record.wheel;
  if (record.status !== "publish") return null;
  if (fields.publication_status !== "approved") return null;
  if (fields.image_rights_status !== "approved") return null;
  if (fields.supply_status !== "confirmed") return null;
  if (fields.specification_status !== "verified") return null;

  const slug = text(record.slug).toLowerCase();
  const model = text(fields.model);
  if (!validSlug(slug) || !model) return null;

  const images = (Array.isArray(fields.images) ? fields.images : [])
    .map((image) => text(image.src))
    .filter((src) => /^(?:https?:\/\/|\/)/.test(src));
  if (images.length === 0) return null;

  if (!Array.isArray(fields.variants) || fields.variants.length === 0) return null;
  const variants = fields.variants.map(normalizeVariant);
  if (variants.some((variant) => variant === null)) return null;
  const publicVariants = variants as PublicWheelVariant[];
  const codes = publicVariants.map((variant) => variant.productionCode.toLowerCase());
  if (new Set(codes).size !== codes.length) return null;

  const diameters = [...new Set(publicVariants.map((variant) => variant.diameter).filter((value): value is number => value !== null))].sort((a, b) => a - b);
  const widths = [...new Set(publicVariants.map((variant) => variant.width).filter((value): value is number => value !== null))].sort((a, b) => a - b);
  const pcds = [...new Set(publicVariants.flatMap((variant) => normalizePcds(variant.pcd)))].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const key = processKey(fields.approved_process);

  return {
    slug,
    model,
    displayModel: text(fields.display_model) || model,
    processKey: key,
    processLabel: processLabel(key),
    primaryImage: images[0],
    images: [...new Set(images)],
    variants: publicVariants,
    diameters,
    widths,
    pcds,
    approvedVariantCount: publicVariants.length,
    approvedFinishCount: new Set(publicVariants.map((variant) => variant.finish).filter(Boolean)).size,
    seoTitle: text(fields.seo_title) || undefined,
    seoDescription: text(fields.seo_description) || undefined,
  };
}

/**
 * `null` 表示调用方必须使用最后有效静态集合；空数组表示 CMS 已权威接管并明确全部撤回。
 */
export function normalizeWordpressWheelCollection(
  collection: WordpressWheelCollection,
): PublicWheelModel[] | null {
  if (collection.authoritative !== true || !Array.isArray(collection.items)) return null;
  const models = collection.items.map(normalizeWordpressWheel);
  if (models.some((model) => model === null)) return null;
  const publicModels = models as PublicWheelModel[];
  const slugs = publicModels.map((model) => model.slug);
  if (new Set(slugs).size !== slugs.length) return null;
  return publicModels.sort((a, b) => a.model.localeCompare(b.model, "en", { numeric: true }));
}

export function wheelRevalidationPaths(slug?: string): string[] {
  const paths = ["/products/wheels", "/products/wheels/flow-formed"];
  if (slug && validSlug(slug)) paths.push(`/products/wheels/${slug}`);
  paths.push("/sitemap.xml");
  return paths;
}
