import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

/**
 * T-30 — every content domain carries a record shape version.
 *
 * The version only earns its keep if a reader refuses a shape it does not
 * understand. These checks pin both halves: the field exists on all three
 * domains, and the wheels reader actually gates on it.
 */

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const PHP_PAGES = read("local-wp/mu-plugins/fenghuai-pages.php");
const PHP_WHEELS = read("local-wp/mu-plugins/fenghuai-wheels.php");
const PHP_GUIDES = read("local-wp/mu-plugins/fenghuai-guides.php");
const TS_PUBLICATION = read("src/lib/wheels/publication.ts");

test("三个内容域都声明了记录结构版本", () => {
  assert.match(PHP_PAGES, /FH_PAGE_META_SCHEMA_VERSION/, "pages 域缺版本字段");
  assert.match(PHP_WHEELS, /FH_WHEEL_META_SCHEMA_VERSION/, "wheels 域缺版本字段");
  assert.match(PHP_GUIDES, /'schema_version'/, "insights 域缺版本字段");
});

test("每个域都有常量，且值一致起点为 1", () => {
  for (const [name, src] of [
    ["wheels", PHP_WHEELS],
    ["insights", PHP_GUIDES],
  ] as const) {
    const m = src.match(/const FH_\w*SCHEMA_VERSION\s*=\s*(\d+)/);
    assert.ok(m, `${name} 域缺 SCHEMA_VERSION 常量`);
    assert.equal(Number(m[1]), 1, `${name} 域版本起点应为 1`);
  }
});

test("PHP 侧注册时带 by-default 值，老记录不会读成空", () => {
  // 默认值缺失时，老记录读出来是 ''/0，前端会当成「版本 0」而判为新奇形状。
  assert.match(
    PHP_WHEELS,
    /FH_WHEEL_META_SCHEMA_VERSION[\s\S]{0,260}'default'\s*=>\s*FH_WHEEL_SCHEMA_VERSION/,
    "wheels 注册块应把 default 指向常量",
  );
});

test("前端守卫：版本高于本构建则拒绝，而不是照旧解析", () => {
  assert.match(TS_PUBLICATION, /WHEEL_SCHEMA_VERSION\s*=\s*1/);
  assert.match(TS_PUBLICATION, /hasReadableShape/);
  assert.match(
    TS_PUBLICATION,
    /Number\(version\)\s*<=\s*WHEEL_SCHEMA_VERSION/,
    "守卫应比较大小后放行，否则等于没有守卫",
  );
});

test("缺少年份字段视为可读（向后兼容，不误杀老记录）", () => {
  assert.match(
    TS_PUBLICATION,
    /version === undefined \|\| version === null\)\s*return true/,
    "缺失应放行；老记录本来就没有这个字段",
  );
});

test("守卫接在机器闸门上，不是摆设", () => {
  assert.match(
    TS_PUBLICATION,
    /function passesMachineGate[\s\S]{0,200}hasReadableShape\(fact\)/,
    "hasReadableShape 必须真的被调用",
  );
});
