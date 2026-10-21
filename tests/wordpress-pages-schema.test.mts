import assert from "node:assert/strict";
import test from "node:test";
import {
  wordpressLocalePageResponseSchema,
  wordpressPageCollectionSchema,
} from "../src/lib/wordpress/pages-schema.ts";

test("合法集合通过校验", () => {
  const parsed = wordpressPageCollectionSchema.safeParse({
    authoritative: true,
    items: [
      {
        id: 101,
        slug: "home",
        status: "publish",
        title: { rendered: "Home" },
        content: { rendered: "" },
        page: { page_key: "home", locale: "en", publication_status: "approved" },
      },
    ],
  });
  assert.equal(parsed.success, true);
});

test("items 不是数组时判为契约不符，而不是抛异常", () => {
  // This is the case the domain normalisers cannot defend against: the payload
  // throws before any publication rule runs.
  const parsed = wordpressPageCollectionSchema.safeParse({
    authoritative: true,
    items: { 0: { id: 1 } },
  });
  assert.equal(parsed.success, false);
});

test("缺少 authoritative 判为契约不符", () => {
  const parsed = wordpressPageCollectionSchema.safeParse({ items: [] });
  assert.equal(parsed.success, false);
});

test("独立语言响应只接受已知状态", () => {
  assert.equal(
    wordpressLocalePageResponseSchema.safeParse({ authoritative: true, status: "ready" }).success,
    true,
  );
  assert.equal(
    wordpressLocalePageResponseSchema.safeParse({ authoritative: true, status: "something-else" })
      .success,
    false,
  );
});

test("未知顶层键被剥离，不泄漏进领域类型", () => {
  const parsed = wordpressPageCollectionSchema.safeParse({
    authoritative: true,
    items: [],
    unexpected: "ignored",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(Object.hasOwn(parsed.data, "unexpected"), false);
  }
});

test("页面 locale 只接受受支持的语言", () => {
  const ok = wordpressPageCollectionSchema.safeParse({
    authoritative: true,
    items: [
      {
        id: 1,
        slug: "home",
        title: { rendered: "Home" },
        content: { rendered: "" },
        page: { page_key: "home", locale: "zh" },
      },
    ],
  });
  assert.equal(ok.success, true);

  const bad = wordpressPageCollectionSchema.safeParse({
    authoritative: true,
    items: [
      {
        id: 1,
        slug: "home",
        title: { rendered: "Home" },
        content: { rendered: "" },
        page: { page_key: "home", locale: "de" },
      },
    ],
  });
  assert.equal(bad.success, false);
});
