import assert from "node:assert/strict";
import test from "node:test";
import { isKnownRoute } from "../src/lib/i18n/routes.ts";

test("静态页面全部登记为已知路由", () => {
  for (const path of [
    "/",
    "/about",
    "/capabilities",
    "/contact",
    "/custom-development",
    "/dealers",
    "/dealers/private-label",
    "/insights",
    "/insights/bolt-patterns",
    "/manufacturing",
    "/products",
    "/products/custom-aluminum",
    "/products/ev-components",
    "/products/safety-tires",
    "/products/wheels",
    "/products/wheels/flow-formed",
    "/products/wheels/forged",
    "/request-a-quote",
    "/resources",
    "/resources/bolt-patterns",
    "/support/privacy",
    "/support/returns",
    "/support/shipping",
    "/support/terms",
    "/support/warranty",
    "/thank-you",
    "/tools",
    "/tools/offset-calculator",
  ]) {
    assert.equal(isKnownRoute(path), true, `${path} 应为已知路由`);
  }
});

test("动态路由族接受单个尾段", () => {
  assert.equal(isKnownRoute("/products/wheels/wff01"), true);
  assert.equal(isKnownRoute("/insights/how-to-measure-fitment"), true);
  assert.equal(isKnownRoute("/insights/bolt-patterns/5x112"), true);
  assert.equal(isKnownRoute("/resources/some-slug"), true);
  assert.equal(isKnownRoute("/resources/bolt-patterns/5x120"), true);
});

test("未知路径一律不认（fail-closed）", () => {
  // Regression guard for T-09: this used to fall through to `["en"]`, so any
  // unregistered path was treated as approved English content.
  assert.equal(isKnownRoute("/does-not-exist"), false);
  assert.equal(isKnownRoute("/zh/does-not-exist"), false);
  assert.equal(isKnownRoute("/products/monoblock"), false);
  assert.equal(isKnownRoute("/products/two-piece"), false);
  assert.equal(isKnownRoute("/products/off-road"), false);
  assert.equal(isKnownRoute("/nope/deeper/path"), false);
});

test("动态族不接受空段或多段", () => {
  assert.equal(isKnownRoute("/products/wheels/"), false);
  assert.equal(isKnownRoute("/products/wheels/a/b"), false);
  assert.equal(isKnownRoute("/fitment/a/b"), false);
  assert.equal(isKnownRoute("/resources/"), false);
});

test("空字符串按根路径处理", () => {
  assert.equal(isKnownRoute(""), true);
});
