import assert from "node:assert/strict";
import test from "node:test";
import { homepageContent } from "../src/content/homepage.ts";
import { productLines } from "../src/content/product-lines.ts";
import {
  buildHomepageModules,
  hasHomepageSeo,
  normalizeHomepageCmsDocument,
  validateHomepageModules,
  type HomepageProductLineCard,
} from "../src/content/page-view.ts";

const content = {
  ...homepageContent,
  productLines: {
    ...homepageContent.productLines,
    items: productLines.map((line): HomepageProductLineCard => ({ ...line })),
  },
};

test("首页 PageView 生成五个必需模块并按稳定 ID 对齐", () => {
  const modules = buildHomepageModules(content);
  assert.deepEqual(modules.map((module) => module.id), ["H01", "H02", "H03", "H04", "H05"]);
  assert.equal(validateHomepageModules(modules), true);
  assert.equal(modules.find((module) => module.id === "H02")?.content.items.length, 4);
});

test("首页模块可以调整顺序，但不能缺失、重复或改变类型", () => {
  const modules = buildHomepageModules(content);
  const reordered = [modules[2], modules[0], modules[1], modules[4], modules[3]];
  assert.equal(validateHomepageModules(reordered), true);

  assert.equal(validateHomepageModules(modules.slice(0, 4)), false);
  assert.equal(validateHomepageModules([...modules, modules[0]]), false);
  const wrongType = modules.map((module) => module.id === "H01"
    ? { ...module, id: "H02", type: "home.product-lines" as const }
    : module) as typeof modules;
  assert.equal(
    validateHomepageModules(wrongType),
    false,
  );

  const h01Moved = buildHomepageModules(content, { H01: 2, H02: 1, H03: 3, H04: 4, H05: 5 });
  assert.equal(validateHomepageModules(h01Moved), false);
  const h05Moved = buildHomepageModules(content, { H01: 1, H02: 2, H03: 3, H04: 5, H05: 4 });
  assert.equal(validateHomepageModules(h05Moved), false);
});

test("首页产品卡必须有本地化文案和可渲染图片", () => {
  const modules = buildHomepageModules({
    ...content,
    productLines: {
      ...content.productLines,
      items: content.productLines.items.map((item, index) => index === 0 ? { ...item, name: "" } : item),
    },
  });
  assert.equal(validateHomepageModules(modules), false);
});

test("首页拒绝缺少图片说明、危险按钮链接和被改写的产品事实", () => {
  assert.equal(validateHomepageModules(buildHomepageModules({
    ...content,
    hero: { ...content.hero, media: { ...content.hero.media, alt: "" } },
  })), false);
  assert.equal(validateHomepageModules(buildHomepageModules({
    ...content,
    closing: { ...content.closing, primaryAction: { ...content.closing.primaryAction, href: "javascript:alert(1)" } },
  })), false);
  assert.equal(validateHomepageModules(buildHomepageModules({
    ...content,
    productLines: {
      ...content.productLines,
      items: content.productLines.items.map((item, index) => index === 0 ? { ...item, href: "/unreviewed-product" } : item),
    },
  })), false);
});

test("版本化 CMS 模块树校验固定类型、顺序和语言", () => {
  const modules = buildHomepageModules(content).map((module) => ({
    id: module.id,
    type: ({ H01: "hero", H02: "product-line-grid", H03: "capabilities", H04: "process", H05: "call-to-action" } as Record<string, string>)[module.id],
    order: module.order * 10,
    enabled: true,
    data: module.content,
  }));
  const normalized = normalizeHomepageCmsDocument({
    schemaVersion: 1,
    pageKey: "home",
    locale: "zh",
    modules,
    seo_title: "首页",
    seo_description: "中文首页",
  }, "zh");
  assert.ok(normalized);
  assert.equal(normalized.moduleOrder.H03, 30);
  assert.equal(normalizeHomepageCmsDocument({ schemaVersion: 1, pageKey: "home", locale: "es", modules }, "zh"), null);
  assert.equal(normalizeHomepageCmsDocument({ schemaVersion: 1, pageKey: "home", locale: "zh", modules: modules.map((module) => ({ ...module, enabled: false })) }, "zh"), null);
});

test("首页 PageView 不接受缺少 title 或 description 的 SEO", () => {
  assert.equal(hasHomepageSeo({ title: "首页", description: "中文首页" }), true);
  assert.equal(hasHomepageSeo({ title: "首页", description: "" }), false);
  assert.equal(hasHomepageSeo({ title: undefined, description: "中文首页" }), false);
});

