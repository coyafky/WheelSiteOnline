import assert from "node:assert/strict";
import test from "node:test";
import {
  ALL_CACHE_TAGS,
  CACHE_TAGS,
  INSIGHTS_CACHE_TAG,
  REVALIDATION_TYPES,
  SITE_PAGES_CACHE_TAG,
  WHEEL_PUBLICATION_TAG,
  cacheTagFor,
  isRevalidationType,
} from "../src/lib/wordpress/cache-tags.ts";

test("每个内容域都有且只有一个标签", () => {
  assert.deepEqual(REVALIDATION_TYPES, ["pages", "wheels", "insights"]);
  for (const type of REVALIDATION_TYPES) {
    const tag = cacheTagFor(type);
    assert.equal(typeof tag, "string");
    assert.ok(tag.length > 0, `${type} 的标签不能为空`);
  }
});

test("标签互不重复", () => {
  // A shared tag would mean invalidating one domain also dumps another's cache;
  // a duplicate would mean two names for one bucket and one of them silently
  // never matching the reader.
  const tags = ALL_CACHE_TAGS;
  assert.equal(new Set(tags).size, tags.length, `标签存在重复: ${tags.join(", ")}`);
});

test("域到标签的映射与各 contract 的再导出一致", () => {
  // The contracts re-export from the register, so these must be the same string.
  assert.equal(cacheTagFor("pages"), SITE_PAGES_CACHE_TAG);
  assert.equal(cacheTagFor("wheels"), WHEEL_PUBLICATION_TAG);
  assert.equal(cacheTagFor("insights"), INSIGHTS_CACHE_TAG);
});

test("标签字符串本身稳定（改动即破坏线上缓存契约）", () => {
  // These literals are part of the runtime contract between WordPress and
  // Next.js. Changing one without the other leaves stale pages behind, so the
  // values are pinned here on purpose.
  assert.equal(SITE_PAGES_CACHE_TAG, "site-pages");
  assert.equal(WHEEL_PUBLICATION_TAG, "wheel-publication");
  assert.equal(INSIGHTS_CACHE_TAG, "insights-guides");
});

test("未知内容类型被拒绝，不会静默回落到某个标签", () => {
  assert.equal(isRevalidationType("pages"), true);
  assert.equal(isRevalidationType("wheels"), true);
  assert.equal(isRevalidationType("insights"), true);
  assert.equal(isRevalidationType("something-else"), false);
  assert.equal(isRevalidationType(""), false);
  assert.equal(isRevalidationType(null), false);
  assert.equal(isRevalidationType(42), false);
});

test("CACHE_TAGS 覆盖全部登记类型", () => {
  assert.deepEqual(Object.keys(CACHE_TAGS).sort(), [...REVALIDATION_TYPES].sort());
});
