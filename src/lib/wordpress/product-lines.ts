import "server-only";

import { faqs as localFaqs } from "@/content/faq";
import { productLines as localProductLines } from "@/content/product-lines";
import {
  catalogueFitmentSupport,
  catalogueGuidance,
  catalogueIntro,
  catalogueResourceLinks,
  catalogueRoutes,
  catalogueSkuCallout,
} from "@/content/products";
import type { ProductLine, ProductLinesContent } from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { getWordpressPageDocument } from "./pages";

/**
 * Last-verified local snapshot of the `/products` page body.
 *
 * ⚠️ The catalogue blocks used to be read straight from `@/content/products` by
 * the page component, so only the four cards travelled through the localized
 * WordPress seam — `/zh/products` rendered a Chinese card grid under an English
 * `Four product lines` `<h1>`. They are assembled here so the whole page body
 * has one source and one fallback path.
 *
 * Nothing in `@/content/*` changes: those modules still export the same
 * constants for every other caller. This only re-homes them under the
 * `product-lines` page content shape.
 */
const localContent: ProductLinesContent = {
  lines: localProductLines,
  catalogue: {
    intro: { ...catalogueIntro },
    guidance: { ...catalogueGuidance },
    skuCallout: {
      eyebrow: catalogueSkuCallout.eyebrow,
      heading: catalogueSkuCallout.heading,
      body: catalogueSkuCallout.body,
      cta: { ...catalogueSkuCallout.cta },
    },
    routes: catalogueRoutes.map((route) => ({ ...route })),
    fitmentSupport: {
      ...catalogueFitmentSupport,
      points: [...catalogueFitmentSupport.points],
    },
    resourceLinks: catalogueResourceLinks.map((link) => ({ ...link })),
    faqs: localFaqs.map((faq) => ({ ...faq })),
  },
};

function isProductLine(value: unknown): value is ProductLine {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["slug", "name", "summary", "highlights", "hasRender", "image", "href"]
    .every((key) => candidate[key] !== undefined)
    && typeof candidate.slug === "string"
    && typeof candidate.name === "string"
    && typeof candidate.summary === "string"
    && Array.isArray(candidate.highlights)
    && typeof candidate.hasRender === "boolean"
    && typeof candidate.image === "string"
    && typeof candidate.href === "string";
}

/** Keys the catalogue half must carry — a partially seeded page is rejected. */
const CATALOGUE_KEYS = [
  "intro",
  "guidance",
  "skuCallout",
  "routes",
  "fitmentSupport",
  "resourceLinks",
  "faqs",
] as const;

/**
 * Shape guard for the WordPress `product-lines` content.
 *
 * Deliberately strict on presence, not on the deep shape of each block: the four
 * lines gate on the fields `ProductFamilyGrid` reads, and the catalogue gates on
 * all seven sub-keys existing with `routes`/`resourceLinks`/`faqs` as arrays.
 * A page seeded before this migration (a bare 4-element array) fails here and
 * falls back to the local snapshot instead of rendering `undefined`.
 */
export function isProductLinesContent(value: unknown): value is ProductLinesContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.lines) || candidate.lines.length !== 4) return false;
  if (!candidate.lines.every(isProductLine)) return false;

  const catalogue = candidate.catalogue;
  if (!catalogue || typeof catalogue !== "object" || Array.isArray(catalogue)) return false;
  const blocks = catalogue as Record<string, unknown>;
  return CATALOGUE_KEYS.every((key) => blocks[key] !== undefined && blocks[key] !== null)
    && Array.isArray(blocks.routes)
    && blocks.routes.length === 4
    && Array.isArray(blocks.resourceLinks)
    && Array.isArray(blocks.faqs)
    && typeof blocks.intro === "object"
    && typeof blocks.guidance === "object"
    && typeof blocks.skuCallout === "object"
    && typeof blocks.fitmentSupport === "object";
}

/** 读取产品线原生 Page（四条产品线 + 目录页正文），字段不完整时保留本地快照。 */
export async function getProductLinesContent(): Promise<ProductLinesContent> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<unknown>("product-lines", { locale });
  const { content } = resolveLocalized<ProductLinesContent>({
    requested: native && isProductLinesContent(native.content) ? native.content : null,
    default: localContent,
    locale,
    scope: "product-lines",
  });
  return content;
}

/**
 * The four product lines only.
 *
 * Thin wrapper kept so `src/lib/wordpress/index.ts` (and its callers) keep the
 * same surface — they want the card grid, not the catalogue body.
 */
export async function getProductLines(): Promise<ProductLine[]> {
  const { lines } = await getProductLinesContent();
  return lines;
}
