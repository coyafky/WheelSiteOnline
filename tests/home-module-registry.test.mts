import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

/**
 * The registry is a .tsx module importing React components, so the test runner
 * cannot import it directly. These checks read the source instead and assert
 * the properties the registry was introduced to guarantee — which is what makes
 * the difference observable at all.
 */

const SOURCE = readFileSync(
  new URL("../src/components/home/home-module-registry.tsx", import.meta.url),
  "utf8",
);

const PAGE = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");

const MODULE_TYPES = [
  "home.hero",
  "home.product-lines",
  "home.capabilities",
  "home.delivery",
  "home.closing",
]; 

test("每个已知模块类型都在注册表里", () => {
  for (const type of MODULE_TYPES) {
    assert.ok(
      SOURCE.includes(`"${type}":`),
      `注册表缺少 ${type}，该模块会被渲染为空`,
    );
  }
});

test("注册表键的数量与已知类型一致（没有漏也没有多余的旧键）", () => {
  const matches = SOURCE.match(/^\s{2}"home\.[a-z-]+":/gm) ?? [];
  assert.equal(
    matches.length,
    MODULE_TYPES.length,
    `注册表里出现了 ${matches.length} 个模块类型，期望 ${MODULE_TYPES.length}`,
  );
});

test("未知类型有显式降级出口，不会渲染为 undefined", () => {
  assert.ok(
    SOURCE.includes("isRegisteredModuleType"),
    "缺少未知类型判定函数",
  );
  assert.ok(
    SOURCE.includes("UnknownModule"),
    "缺少未知类型的降级组件：未知类型会静默消失",
  );
  // 非生产环境下必须可见，否则开发时也发现不了
  assert.match(SOURCE, /NODE_ENV !== "production"/);
  // 生产环境必须留下日志
  assert.match(SOURCE, /console\.error/);
});

test("首页不再用 switch 分发模块", () => {
  assert.ok(
    !PAGE.includes("switch (module.type)"),
    "首页仍在用 switch 分发：新增模块要改页面，未知类型会落空",
  );
  assert.ok(
    PAGE.includes("renderHomeModule"),
    "首页没有调用注册表渲染函数",
  );
});

test("首页把注册表渲染结果包在带 key 的 Fragment 里", () => {
  // map 里直接返回组件会丢 key；Fragment 是必要的包装
  assert.match(PAGE, /<Fragment key=\{module\.id\}>/);
});

test("渲染函数的键类型是模块联合类型，不是 string", () => {
  // 用 string 做键会让拼写错误通过编译，只在运行时变成空渲染
  assert.ok(
    SOURCE.includes('type ModuleType = HomepageModuleView["type"]'),
    "注册表键应取自模块联合类型",
  );
});
