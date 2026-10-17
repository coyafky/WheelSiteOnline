import assert from "node:assert/strict";
import test from "node:test";
import { en } from "../src/lib/i18n/dictionaries/en.ts";
import { zh } from "../src/lib/i18n/dictionaries/zh.ts";
import { es } from "../src/lib/i18n/dictionaries/es.ts";
import { th } from "../src/lib/i18n/dictionaries/th.ts";
import {
  LOCALES,
  INDEXABLE_LOCALES,
  LOCALE_CONFIG,
  localeFromPathname,
  localizedPath,
  localizedAlternates,
  stripLocalePrefix,
  formatLocaleDate,
  formatLocaleNumber,
} from "../src/lib/i18n/types.ts";
import { translateStrict } from "../src/lib/i18n/types.ts";

test("所有已开放语言的字典键集合完全一致", () => {
  for (const dictionary of [zh, es, th]) {
    assert.deepEqual(Object.keys(dictionary).sort(), Object.keys(en).sort());
  }
  assert.deepEqual(LOCALES, ["en", "zh", "es", "th"]);
});

test("页面 alternates 只列入已批准的语言", () => {
  assert.deepEqual(INDEXABLE_LOCALES, ["en"]);
  assert.deepEqual(localizedAlternates("/about", "zh"), { languages: {} });
  assert.deepEqual(localizedAlternates("/about", "en"), {
    canonical: "/about",
    languages: { en: "/about", "x-default": "/about" },
  });
  assert.deepEqual(localizedAlternates("/", "zh", ["en", "zh"]), {
    canonical: "/zh",
    languages: { en: "/", zh: "/zh", "x-default": "/" },
  });
  assert.deepEqual(localizedAlternates("/", "zh", ["zh"]), {
    canonical: "/zh",
    languages: { zh: "/zh" },
  });
});

test("语言 URL 使用独立前缀且切回英文时保留路径", () => {
  assert.equal(localizedPath("/products/wheels", "zh"), "/zh/products/wheels");
  assert.equal(localizedPath("/products/wheels", "es"), "/es/products/wheels");
  assert.equal(localizedPath("/products/wheels", "th"), "/th/products/wheels");
  assert.equal(localizedPath("/zh/products/wheels", "en"), "/products/wheels");
  assert.equal(localizedPath("/es/products/wheels", "th"), "/th/products/wheels");
  assert.equal(localizedPath("/", "zh"), "/zh");
  assert.equal(stripLocalePrefix("/zh"), "/");
  assert.equal(stripLocalePrefix("/th/products/wheels"), "/products/wheels");
  assert.equal(localeFromPathname("/zh/insights"), "zh");
  assert.equal(localeFromPathname("/es/insights"), "es");
  assert.equal(localeFromPathname("/th/insights"), "th");
  assert.equal(localeFromPathname("/insights"), "en");
});

test("语言注册表为每种语言提供路由、显示名称与 Intl 格式", () => {
  for (const locale of LOCALES) {
    assert.ok(LOCALE_CONFIG[locale].label);
    assert.ok(LOCALE_CONFIG[locale].intlLocale);
    assert.equal(typeof LOCALE_CONFIG[locale].prefix, "string");
    assert.ok(formatLocaleNumber(1234.5, locale));
    assert.ok(formatLocaleDate(new Date("2026-10-14T00:00:00.000Z"), locale));
  }
  assert.equal(LOCALE_CONFIG.en.prefix, "");
  assert.equal(LOCALE_CONFIG.zh.prefix, "/zh");
});

test("共享错误页和导航辅助标签都有四语文案", () => {
  const requiredKeys = [
    "a11y.toggleSubmenu",
    "a11y.siteHome",
    "catalogue.resources.eyebrow",
    "error.notFound.heading",
    "error.notFound.body",
    "error.notFound.cta",
    "error.generic.heading",
    "error.generic.body",
    "error.generic.retry",
  ];

  for (const locale of LOCALES) {
    const dictionary = { en, zh, es, th }[locale];
    for (const key of requiredKeys) {
      assert.notEqual(translateStrict(dictionary, key), key, `${locale} is missing ${key}`);
    }
    assert.equal(translateStrict(dictionary, "missing.test.key"), "missing.test.key");
  }
});
