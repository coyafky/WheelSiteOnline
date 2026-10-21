import assert from "node:assert/strict";
import test from "node:test";
import {
  breadcrumbJsonLd,
  jsonLdGraph,
  organizationJsonLd,
  serializeJsonLd,
  websiteJsonLd,
} from "../src/lib/seo/structured-data.ts";

const BASE = "https://example.com/";

/** Mirrors site.ts: contact is unconfirmed, i.e. the values are placeholders. */
const PUBLISHER = {
  name: "Fenghuai",
  description: "Aluminum components across four product lines",
  contact: { confirmed: false, email: "sales@fenghuai.com", phone: "+86 000 0000 0000" },
};

const VERIFIED_PUBLISHER = {
  ...PUBLISHER,
  contact: { confirmed: true, email: "sales@fenghuai.com", phone: "+86 757 1234 5678" },
};

test("Organization 声明 name / url / @id", () => {
  const org = organizationJsonLd(BASE, PUBLISHER);
  assert.equal(org["@type"], "Organization");
  assert.ok(typeof org.name === "string" && org.name.length > 0);
  assert.equal(org.url, "https://example.com/");
  assert.equal(org["@id"], "https://example.com/#organization");
});

test("联络方式未确认时绝不输出 telephone / email", () => {
  // site.contact.confirmed 当前为 false，即电话与邮箱是占位。
  // 把它们当事实发布出去，搜索引擎会在富媒体结果里展示一个假号码。
  const org = organizationJsonLd(BASE, PUBLISHER);
  assert.equal(org.contactPoint, undefined, "未确认的联系方式不得出现在结构化数据里");
  assert.equal(org.address, undefined, "未确认的地址不得出现");
  assert.ok(!JSON.stringify(org).includes("000 0000"), "占位电话泄漏了");
});

test("WebSite 指回 Organization 而不是另立实体", () => {
  const site = websiteJsonLd(BASE, ["en", "zh"], PUBLISHER);
  assert.equal(site["@type"], "WebSite");
  assert.deepEqual(site.publisher, { "@id": "https://example.com/#organization" });
  assert.deepEqual(site.inLanguage, ["en", "zh"]);
});

test("语言集合为空时回落到 en，不输出空数组", () => {
  const site = websiteJsonLd(BASE, [], PUBLISHER);
  assert.deepEqual(site.inLanguage, ["en"]);
});

test("面包屑按顺序生成，末项不带链接", () => {
  const crumb = breadcrumbJsonLd(BASE, "/products/wheels/a01", [
    { name: "Home", path: "/" },
    { name: "Wheels", path: "/products/wheels" },
    { name: "A01", path: "/products/wheels/a01" },
  ]);
  assert.ok(crumb);
  const items = crumb.itemListElement as Array<Record<string, unknown>>;
  assert.equal(items.length, 3);
  assert.deepEqual(items.map((i) => i.position), [1, 2, 3]);
  assert.equal(items[0].item, "https://example.com/");
  // 末项是当前页，按 schema.org 约定不给 item
  assert.equal(items[2].item, undefined);
});

test("只有一项的面包屑不生成（没有层级信息）", () => {
  assert.equal(breadcrumbJsonLd(BASE, "/about", [{ name: "Home", path: "/" }]), null);
});

test("graph 过滤空实体，全部为空时返回 null", () => {
  const graph = jsonLdGraph([organizationJsonLd(BASE, PUBLISHER), null, websiteJsonLd(BASE, ["en"], PUBLISHER)]);
  assert.ok(graph);
  const nodes = graph["@graph"] as unknown[];
  assert.equal(nodes.length, 2);

  assert.equal(jsonLdGraph([null, null]), null);
});

test("序列化转义 < 防止提前闭合 script 标签", () => {
  const malicious = { "@type": "Thing", name: "</script><script>alert(1)</script>" };
  const serialized = serializeJsonLd(malicious);
  assert.ok(!serialized.includes("</script>"), "不得存在可闭合的 script 结束标签");
  assert.ok(serialized.includes("\\u003c"));
});

test("序列化结果仍是可解析的 JSON", () => {
  const data = jsonLdGraph([organizationJsonLd(BASE, PUBLISHER)])!;
  const roundTrip = JSON.parse(serializeJsonLd(data));
  assert.equal(roundTrip["@context"], "https://schema.org");
});

test("@id 用绝对地址，不出现相对路径", () => {
  const graph = jsonLdGraph([
    organizationJsonLd(BASE, PUBLISHER),
    websiteJsonLd(BASE, ["en"], PUBLISHER),
  ])!;
  const nodes = graph["@graph"] as Array<Record<string, unknown>>;
  for (const node of nodes) {
    assert.match(String(node["@id"]), /^https:\/\//);
  }
});

test("确认后必须输出联络方式（否则上一条测试会变成永远为真的空断言）", () => {
  const org = organizationJsonLd(BASE, VERIFIED_PUBLISHER);
  assert.ok(org.contactPoint, "已确认时不应再省略 contactPoint");
  const cp = org.contactPoint as Record<string, unknown>;
  assert.equal(cp.telephone, "+86 757 1234 5678");
  assert.equal(cp.email, "sales@fenghuai.com");
  assert.ok(org.address);
});
