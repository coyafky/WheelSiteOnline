import assert from "node:assert/strict";
import test from "node:test";
import { en } from "../src/lib/i18n/dictionaries/en.ts";
import { zh } from "../src/lib/i18n/dictionaries/zh.ts";
import {
  localeFromPathname,
  localizedPath,
  stripLocalePrefix,
} from "../src/lib/i18n/types.ts";

test("中英文字典键集合完全一致", () => {
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort());
});

test("中文 URL 使用独立前缀且切回英文时保留路径", () => {
  assert.equal(localizedPath("/products/wheels", "zh"), "/zh/products/wheels");
  assert.equal(localizedPath("/zh/products/wheels", "en"), "/products/wheels");
  assert.equal(localizedPath("/", "zh"), "/zh");
  assert.equal(stripLocalePrefix("/zh"), "/");
  assert.equal(localeFromPathname("/zh/insights"), "zh");
  assert.equal(localeFromPathname("/insights"), "en");
});
