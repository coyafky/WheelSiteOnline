import assert from "node:assert/strict";
import test from "node:test";
import { en } from "../src/lib/i18n/dictionaries/en.ts";
import { zh } from "../src/lib/i18n/dictionaries/zh.ts";
import { DICTIONARIES } from "../src/lib/i18n/dictionaries/index.ts";
import {
  DEFAULT_LOCALE,
  LOCALES,
  resolveLocalized,
  translate,
} from "../src/lib/i18n/types.ts";

test("当前只注册英文和中文", () => {
  assert.deepEqual(LOCALES, ["en", "zh"]);
  assert.deepEqual(Object.keys(DICTIONARIES).sort(), ["en", "zh"]);
  assert.equal(DEFAULT_LOCALE, "en");
});

test("已注册字典使用英文键集且键集合完整", () => {
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort());
});

test("缺少当前语言 UI 键时不静默回退英文", () => {
  assert.equal(translate({ "known.key": "已翻译" }, "known.key"), "已翻译");
  assert.equal(translate({}, "missing.key"), "missing.key");
});

test("缺少、无批准标记或未批准的正文翻译返回 unavailable", () => {
  assert.deepEqual(resolveLocalized({ en: { value: "English copy", approved: true } }, "zh"), {
    status: "unavailable",
    locale: "zh",
  });
  assert.deepEqual(
    resolveLocalized(
      { zh: { value: "中文正文", approved: false } },
      "zh",
    ),
    { status: "unavailable", locale: "zh" },
  );
});

test("已批准正文翻译返回 translated", () => {
  assert.deepEqual(
    resolveLocalized(
      { zh: { value: "中文正文", approved: true } },
      "zh",
    ),
    { status: "translated", locale: "zh", value: "中文正文" },
  );
});

test("未完成中文正文没有索引资格", () => {
  assert.equal(
    resolveLocalized(
      { en: { value: "English copy", approved: true } },
      "zh",
    ).status,
    "unavailable",
  );
  assert.equal(
    resolveLocalized(
      { zh: { value: "中文正文", approved: true } },
      "zh",
    ).status,
    "translated",
  );
});
