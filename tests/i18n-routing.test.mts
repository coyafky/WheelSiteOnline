import assert from "node:assert/strict";
import test from "node:test";
import { en } from "../src/lib/i18n/dictionaries/en.ts";
import { zh } from "../src/lib/i18n/dictionaries/zh.ts";
import { es } from "../src/lib/i18n/dictionaries/es.ts";
import { th } from "../src/lib/i18n/dictionaries/th.ts";
import {
  LOCALES,
  localeFromPathname,
  localizedPath,
  stripLocalePrefix,
} from "../src/lib/i18n/types.ts";

test("所有已开放语言的字典键集合完全一致", () => {
  for (const dictionary of [zh, es, th]) {
    assert.deepEqual(Object.keys(dictionary).sort(), Object.keys(en).sort());
  }
  assert.deepEqual(LOCALES, ["en", "zh", "es", "th"]);
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
