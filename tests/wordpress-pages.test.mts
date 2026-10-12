import assert from "node:assert/strict";
import test from "node:test";
import {
  SITE_PAGES_CACHE_TAG,
  normalizeWordpressPage,
  sitePageRevalidationPaths,
  validSitePageKey,
  type WordpressPageRecord,
} from "../src/lib/wordpress/pages-contract.ts";

const record: WordpressPageRecord = {
  id: 7,
  slug: "about",
  status: "publish",
  title: { rendered: "About Fenghuai" },
  content: { rendered: "" },
  page: {
    page_key: "about",
    publication_status: "approved",
    content: { hero: { heading: "A native page" } },
    seo_title: "About — CMS",
    seo_description: "CMS description",
  },
};

test("原生 Page 适配为稳定契约并保留 SEO", () => {
  const result = normalizeWordpressPage<{ hero: { heading: string } }>(record, "about");
  assert.ok(result);
  assert.equal(result.source, "wordpress");
  assert.equal(result.content.hero.heading, "A native page");
  assert.equal(result.seoTitle, "About — CMS");
});

test("原生 Page 按 locale 读取已批准翻译，未批准翻译 fail-closed", () => {
  const localized: WordpressPageRecord = {
    ...record,
    page: {
      ...record.page,
      content_by_locale: {
        zh: { hero: { heading: "关于峰徊" } },
        es: { hero: { heading: "Sobre Fenghuai" } },
      },
      seo_by_locale: {
        zh: { title: "关于峰徊", description: "峰徊公司介绍" },
        es: { title: "Sobre Fenghuai", description: "Presentación de Fenghuai" },
      },
      locale_status: { zh: "approved", es: "draft" },
    },
  };
  const zh = normalizeWordpressPage<{ hero: { heading: string } }>(localized, "about", { locale: "zh" });
  assert.ok(zh);
  assert.equal(zh.content.hero.heading, "关于峰徊");
  assert.equal(zh.seoTitle, "关于峰徊");
  assert.equal(normalizeWordpressPage(localized, "about", { locale: "es" }), null);
  const esPreview = normalizeWordpressPage<{ hero: { heading: string } }>(localized, "about", { locale: "es", preview: true });
  assert.ok(esPreview);
  assert.equal(esPreview.content.hero.heading, "Sobre Fenghuai");
});

test("Page 草稿、撤回或键不匹配时 fail-closed", () => {
  assert.equal(normalizeWordpressPage(record, "home"), null);
  assert.equal(normalizeWordpressPage({ ...record, status: "draft" }, "about"), null);
  assert.equal(
    normalizeWordpressPage({ ...record, page: { ...record.page, publication_status: "withdrawn" } }, "about"),
    null,
  );
});

test("页面缓存失效覆盖页面、首页和 sitemap，键不接受路径穿越", () => {
  assert.equal(validSitePageKey("about"), "about");
  assert.equal(validSitePageKey("../admin"), null);
  assert.deepEqual(sitePageRevalidationPaths("about"), ["/about", "/sitemap.xml"]);
  assert.deepEqual(sitePageRevalidationPaths("request-a-quote"), ["/request-a-quote", "/sitemap.xml"]);
  assert.deepEqual(sitePageRevalidationPaths("contact"), ["/contact", "/sitemap.xml"]);
  assert.deepEqual(sitePageRevalidationPaths("privacy"), ["/support/privacy", "/request-a-quote", "/contact", "/sitemap.xml"]);
  assert.deepEqual(sitePageRevalidationPaths("thank-you"), ["/thank-you", "/sitemap.xml"]);
  assert.equal(SITE_PAGES_CACHE_TAG, "site-pages");
});
