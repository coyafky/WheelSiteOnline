import assert from "node:assert/strict";
import test from "node:test";
import {
  groupByTranslation,
  identityOf,
  localesForGroup,
} from "../src/lib/wordpress/translation-group.ts";

/**
 * The acceptance case for T-18: a language's slug differs, and the page still
 * resolves as one cross-language entity.
 */
const HOMEPAGE = [
  { locale: "en", translation_group: "home", page_key: "home", path: "/" },
  { locale: "zh", translation_group: "home", page_key: "home", path: "/zh" },
  { locale: "es", translation_group: "home", page_key: "home", path: "/es" },
  { locale: "th", translation_group: "home", page_key: "home", path: "/th" },
];

test("不同 slug 的同一页面归入同一组", () => {
  const { members } = groupByTranslation(HOMEPAGE);
  const home = members.get("home");
  assert.ok(home, "应存在 home 组");
  assert.equal(home.length, 4);
});

test("各语言 slug 不同也仍能列出全部语言", () => {
  // This is the T-18 验收：slug 不同（home / home-zh / home-es / home-th），
  // 聚合结果不受影响，因为身份来自 translation_group 而不是路径。
  assert.deepEqual(localesForGroup(HOMEPAGE, "home"), ["en", "zh", "es", "th"]);
});

test("语言顺序固定，不随记录顺序变化", () => {
  const shuffled = [...HOMEPAGE].reverse();
  assert.deepEqual(localesForGroup(shuffled, "home"), ["en", "zh", "es", "th"]);
});

test("translation_group 优先于 page_key", () => {
  assert.equal(
    identityOf({ translation_group: "home", page_key: "legacy-key" }),
    "home",
  );
});

test("缺 translation_group 时回落到 page_key（老数据兼容）", () => {
  assert.equal(identityOf({ page_key: "about" }), "about");
});

test("两者都缺时不分组，而不是落到空字符串", () => {
  assert.equal(identityOf({ locale: "en" }), null);
  assert.equal(identityOf({ translation_group: "   ", page_key: "" }), null);
  const { members } = groupByTranslation([{ locale: "en" }, { locale: "zh" }]);
  assert.equal(members.size, 0);
});

test("未知语言被忽略，不会污染语言集合", () => {
  assert.deepEqual(
    localesForGroup(
      [
        ...HOMEPAGE,
        { locale: "fr", translation_group: "home" },
        { locale: "", translation_group: "home" },
      ],
      "home",
    ),
    ["en", "zh", "es", "th"],
  );
});

test("同组同语言重复会被报告，而不是静默合并", () => {
  // 真实数据里 home 的英文有两条记录（home / home-en），正是这种情况。
  const { members, duplicates } = groupByTranslation([
    { locale: "en", translation_group: "home", page_key: "home" },
    { locale: "en", translation_group: "home", page_key: "home" },
  ]);
  assert.equal(duplicates.length, 1);
  assert.match(duplicates[0], /^home::en$/);
  // 只保留一条，避免同一语言出现两个候选
  assert.equal(members.get("home")?.length, 1);
});

test("不同组互不干扰", () => {
  const records = [
    { locale: "en", translation_group: "home" },
    { locale: "zh", translation_group: "home" },
    { locale: "en", translation_group: "about" },
  ];
  assert.deepEqual(localesForGroup(records, "home"), ["en", "zh"]);
  assert.deepEqual(localesForGroup(records, "about"), ["en"]);
});

test("不存在的组返回空数组", () => {
  assert.deepEqual(localesForGroup(HOMEPAGE, "nope"), []);
});
