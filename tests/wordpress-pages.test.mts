import assert from "node:assert/strict";
import test from "node:test";
import {
  SITE_PAGES_CACHE_TAG,
  normalizeWordpressPage,
  normalizeWordpressLocalePage,
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

test("独立语言 Page 不跨语言回退，撤回优先于旧内容", () => {
  const independent: WordpressPageRecord = {
    ...record,
    page: {
      page_key: "home",
      locale: "zh",
      revision: "2026-10-16T12:00:00Z",
      publication_status: "approved",
      content: { modules: [] },
      seo_title: "首页",
      seo_description: "已批准的中文简介",
    },
  };
  assert.deepEqual(normalizeWordpressLocalePage(independent, "home", "es"), { status: "missing-locale" });
  const ready = normalizeWordpressLocalePage<{ modules: unknown[] }>(independent, "home", "zh");
  assert.equal(ready.status, "ready");
  if (ready.status === "ready") assert.equal(ready.page.revision, "2026-10-16T12:00:00Z");
  assert.deepEqual(normalizeWordpressLocalePage({
    ...independent,
    page: { ...independent.page, publication_status: "withdrawn" },
  }, "home", "zh"), { status: "withdrawn" });
  assert.deepEqual(normalizeWordpressLocalePage({
    ...independent,
    page: { ...independent.page, seo_description: "" },
  }, "home", "zh"), { status: "unpublished" });
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
  assert.deepEqual(sitePageRevalidationPaths("about"), ["/about", "/zh/about", "/es/about", "/th/about", "/sitemap.xml"]);
  assert.deepEqual(sitePageRevalidationPaths("request-a-quote"), ["/request-a-quote", "/zh/request-a-quote", "/es/request-a-quote", "/th/request-a-quote", "/sitemap.xml"]);
  assert.deepEqual(sitePageRevalidationPaths("contact"), ["/contact", "/zh/contact", "/es/contact", "/th/contact", "/sitemap.xml"]);
  const privacyPaths = sitePageRevalidationPaths("privacy");
  assert.ok(privacyPaths.includes("/zh/support/privacy"));
  assert.ok(privacyPaths.includes("/es/request-a-quote"));
  assert.ok(privacyPaths.includes("/th/contact"));
  assert.ok(privacyPaths.includes("/sitemap.xml"));
  assert.deepEqual(sitePageRevalidationPaths("thank-you"), ["/thank-you", "/zh/thank-you", "/es/thank-you", "/th/thank-you", "/sitemap.xml"]);
  assert.deepEqual(sitePageRevalidationPaths("home"), ["/", "/zh", "/es", "/th", "/sitemap.xml"]);
  assert.equal(SITE_PAGES_CACHE_TAG, "site-pages");
});
