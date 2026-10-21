import assert from "node:assert/strict";
import test from "node:test";
import { wheelCatalogueCopyFor } from "../src/lib/i18n/wheel-catalogue-copy.ts";
import { LOCALES } from "../src/lib/i18n/types.ts";

test("轮毂目录所有 UI 字段在四种语言中完整且非空", () => {
  const dictionaries = LOCALES.map((locale) => wheelCatalogueCopyFor(locale));
  const expectedKeys = Object.keys(dictionaries[0]).sort();

  for (const copy of dictionaries) {
    assert.deepEqual(Object.keys(copy).sort(), expectedKeys);
    for (const [key, value] of Object.entries(copy)) {
      if (typeof value === "string") assert.ok(value.trim(), `${key} must not be empty`);
    }
  }
});

test("轮毂目录动态文案能格式化结果数、筛选数与工程工艺名", () => {
  for (const locale of LOCALES) {
    const copy = wheelCatalogueCopyFor(locale);
    for (const text of [
      copy.resultSearch(3, "HP12"),
      copy.resultFiltered(3),
      copy.resultAll(3),
      copy.filterShowMore(4),
      copy.filterSelected(2),
      copy.filterLockedProcessNote(copy.processName("forged")),
      copy.pcdNoMatches("5x114", 16),
      copy.pcdShowingSome(4, 16, 12),
    ]) {
      assert.ok(text.trim());
      assert.ok(!text.includes("undefined"));
    }
  }
});
