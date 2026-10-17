import type {
  HomepageContent,
  HomepageModuleView,
  HomepageProductLineCard,
  MediaAsset,
} from "./types";
import type { Locale } from "@/lib/i18n/types";
import { productLines as productLineFacts } from "./product-lines.ts";

export type {
  HomepageCmsDocument,
  HomepageModuleView,
  HomepagePageResult,
  HomepagePageView,
  HomepageProductLineCard,
} from "./types";

const REQUIRED_MODULES = ["H01", "H02", "H03", "H04", "H05"] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasApprovedMedia(value: unknown): value is MediaAsset {
  if (!isObject(value)) return false;
  return value.hasRender === true && value.approvalStatus === "approved"
    && hasText(value.alt) && isMediaSource(value.src);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isInternalHref(value: unknown): value is string {
  return hasText(value) && ((value.startsWith("/") && !value.startsWith("//")) || value.startsWith("#"));
}

function isMediaSource(value: unknown): value is string {
  return hasText(value) && ((value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//.test(value));
}

export function hasHomepageSeo(value: { title?: unknown; description?: unknown }): value is { title: string; description: string } {
  return hasText(value.title) && hasText(value.description);
}

function hasCta(value: unknown): boolean {
  return isObject(value) && hasText(value.label) && isInternalHref(value.href);
}

function validHomepageContent(value: unknown): value is HomepageContent & { productLines: HomepageContent["productLines"] & { items: HomepageProductLineCard[] } } {
  if (!isObject(value)) return false;
  const hero = value.hero;
  const productLines = value.productLines;
  const capabilities = value.capabilities;
  const delivery = value.delivery;
  const closing = value.closing;
  if (!isObject(hero) || !isObject(productLines) || !isObject(capabilities) || !isObject(delivery) || !isObject(closing)) return false;
  if (![hero.eyebrow, hero.heading, hero.lead, hero.disclosure, hero.mediaLabel].every(hasText)) return false;
  if (!hasApprovedMedia(hero.media) || !hasCta(hero.primaryAction) || !hasCta(hero.secondaryAction)) return false;
  if (![productLines.eyebrow, productLines.heading, productLines.intro].every(hasText) || !Array.isArray(productLines.items)) return false;
  if (productLines.items.length !== 4 || productLines.items.some((item, index) => {
    if (!isObject(item)) return true;
    const fact = productLineFacts[index];
    return !fact || item.slug !== fact.slug || item.image !== fact.image || item.href !== fact.href
      || ![item.name, item.summary].every(hasText)
      || (item.subtitle !== undefined && !hasText(item.subtitle))
      || item.hasRender !== true;
  })) return false;
  if (![capabilities.eyebrow, capabilities.heading].every(hasText) || !Array.isArray(capabilities.items) || !hasCta(capabilities.action)) return false;
  if (capabilities.items.some((item) => !isObject(item) || !hasText(item.id) || !hasText(item.title) || !hasText(item.body) || !Array.isArray(item.appliesTo))) return false;
  if (![delivery.eyebrow, delivery.heading, delivery.lead].every(hasText) || !Array.isArray(delivery.stages) || !Array.isArray(delivery.evidence) || !hasCta(delivery.action)) return false;
  if (delivery.stages.some((item) => !isObject(item) || !hasText(item.id) || !hasText(item.title) || !hasText(item.body))) return false;
  if (delivery.evidence.some((item) => !isObject(item) || !hasText(item.id) || !hasText(item.label) || !hasText(item.body) || !hasApprovedMedia(item.media))) return false;
  if (![closing.eyebrow, closing.heading, closing.body, closing.inputLabel].every(hasText) || !Array.isArray(closing.inputPrompts) || closing.inputPrompts.some((item) => !hasText(item)) || !hasCta(closing.primaryAction) || !hasCta(closing.secondaryAction)) return false;
  return true;
}

export function buildHomepageModules(
  content: HomepageContent & { productLines: HomepageContent["productLines"] & { items: HomepageProductLineCard[] } },
  order: Partial<Record<HomepageModuleView["id"], number>> = {},
): HomepageModuleView[] {
  const modules: HomepageModuleView[] = [
    { type: "home.hero", id: "H01", order: order.H01 ?? 1, required: true, content: content.hero },
    { type: "home.product-lines", id: "H02", order: order.H02 ?? 2, required: true, content: content.productLines },
    { type: "home.capabilities", id: "H03", order: order.H03 ?? 3, required: true, content: content.capabilities },
    { type: "home.delivery", id: "H04", order: order.H04 ?? 4, required: true, content: content.delivery },
    { type: "home.closing", id: "H05", order: order.H05 ?? 5, required: true, content: content.closing },
  ];
  return modules;
}

export function validateHomepageModules(modules: HomepageModuleView[]): boolean {
  if (modules.length !== REQUIRED_MODULES.length) return false;
  const ids = modules.map((module) => module.id);
  if (new Set(ids).size !== ids.length || REQUIRED_MODULES.some((id) => !ids.includes(id))) return false;
  if (modules.some((module) => module.required !== true || !Number.isInteger(module.order) || module.order < 1)) return false;
  const orders = modules.map((module) => module.order);
  if (new Set(orders).size !== orders.length) return false;
  const firstOrder = Math.min(...orders);
  const lastOrder = Math.max(...orders);
  if (modules.find((module) => module.id === "H01")?.order !== firstOrder) return false;
  if (modules.find((module) => module.id === "H05")?.order !== lastOrder) return false;
  const byId = Object.fromEntries(modules.map((module) => [module.id, module])) as Record<string, HomepageModuleView>;
  if (byId.H01.type !== "home.hero" || byId.H02.type !== "home.product-lines" || byId.H03.type !== "home.capabilities" || byId.H04.type !== "home.delivery" || byId.H05.type !== "home.closing") return false;
  return validHomepageContent({
    hero: byId.H01.content,
    productLines: byId.H02.content,
    capabilities: byId.H03.content,
    delivery: byId.H04.content,
    closing: byId.H05.content,
  });
}

export function isValidHomepageContent(value: unknown): value is HomepageContent & { productLines: HomepageContent["productLines"] & { items: HomepageProductLineCard[] } } {
  return validHomepageContent(value);
}

const CMS_MODULES = {
  H01: "hero",
  H02: "product-line-grid",
  H03: "capabilities",
  H04: "process",
  H05: "call-to-action",
} as const;

/** Convert the versioned CMS module tree into the stable component contract. */
export function normalizeHomepageCmsDocument(value: unknown, locale: Locale): {
  content: HomepageContent & { productLines: HomepageContent["productLines"] & { items: HomepageProductLineCard[] } };
  seoTitle: string;
  seoDescription: string;
  moduleOrder: Partial<Record<HomepageModuleView["id"], number>>;
} | null {
  if (!isObject(value) || value.schemaVersion !== 1 || value.pageKey !== "home" || value.locale !== locale || !Array.isArray(value.modules)) return null;
  if (value.modules.length !== REQUIRED_MODULES.length) return null;
  const modules = value.modules;
  const seen = new Set<string>();
  const byId = new Map<string, Record<string, unknown>>();
  const moduleOrder: Partial<Record<HomepageModuleView["id"], number>> = {};
  for (const raw of modules) {
    if (!isObject(raw) || typeof raw.id !== "string" || typeof raw.type !== "string" || typeof raw.order !== "number" || !Number.isInteger(raw.order) || raw.order < 1 || raw.enabled !== true || !isObject(raw.data)) return null;
    if (seen.has(raw.id) || !Object.hasOwn(CMS_MODULES, raw.id) || CMS_MODULES[raw.id as keyof typeof CMS_MODULES] !== raw.type) return null;
    seen.add(raw.id);
    byId.set(raw.id, raw.data);
    moduleOrder[raw.id as HomepageModuleView["id"]] = raw.order;
  }
  if (REQUIRED_MODULES.some((id) => !byId.has(id)) || new Set(modules.map((raw) => (raw as { order: number }).order)).size !== modules.length) return null;
  const content = {
    hero: byId.get("H01"),
    productLines: byId.get("H02"),
    capabilities: byId.get("H03"),
    delivery: byId.get("H04"),
    closing: byId.get("H05"),
  };
  return isValidHomepageContent(content)
    ? { content, seoTitle: typeof value.seo_title === "string" ? value.seo_title : "", seoDescription: typeof value.seo_description === "string" ? value.seo_description : "", moduleOrder }
    : null;
}
