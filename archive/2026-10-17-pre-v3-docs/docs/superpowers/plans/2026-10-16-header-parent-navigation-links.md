# Header 父级导航链接实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**目标：** 让桌面端带下拉菜单的 Header 父级文字直接导航到其主页面，同时保留独立的 Chevron 控件负责展开下拉菜单，并用 Playwright 覆盖桌面、键盘、移动端和页面跳转行为。

**架构：** primaryNav 已经为每个父级提供稳定的 href，不修改内容接缝或路由数据。桌面端把当前包住文字和 Chevron 的单一 button 拆成同级 Link + button；父级容器继续负责 hover 展开，下拉内容继续由 aria-expanded / aria-controls 驱动。移动端现有“父级文字链接 + 独立 Chevron”结构保持不变，只补充回归覆盖。

**技术栈：** Next.js 16 App Router、React、TypeScript、next/link、Lucide React、Tailwind CSS、Playwright Test。

## 全局约束

- 项目记录使用中文；本计划是实施计划，不替代 PROJECT.md、STATUS.md 或页面规格。
- 只消费 primaryNav 的 href 和 children，不在组件内复制路由字符串或读取 WordPress 原始响应。
- 保留当前 src/components/site-header.tsx 中未提交的 a11y.siteHome 与本地化 a11y.toggleSubmenu 改动，不覆盖用户工作区变更。
- 桌面父级文字点击必须导航；桌面 Chevron 点击必须展开下拉；父级 hover 仍然展开下拉；键盘必须可独立操作。
- 下拉菜单的关闭行为保持现状：鼠标离开父级容器时关闭，键盘 Escape 关闭并把焦点还给 Chevron；父级链接点击由路由导航负责关闭组件状态。
- 不新增依赖、不改 primaryNav 数据、不改移动端的信息架构、不改 Header 之外的页面视觉。
- 不提交 commit、不 push、不 deploy；完成后只报告工作区变更和验证结果，等待明确授权。
- Next.js 代码变更前遵循当前安装版本文档；本任务只使用现有 next/link、React 事件和既有 Header 模式。

## 文件结构与职责

| 文件 | 变更 | 职责 |
|---|---|---|
| src/components/site-header.tsx | 修改桌面端带子菜单项的 JSX 和触发器事件 | 共享 Header 的桌面/移动导航渲染、下拉状态和键盘行为 |
| e2e/local-interactions.spec.ts | 修改既有 Header 测试并增加桌面跳转、键盘、移动端回归 | 验证真实用户操作后的 URL、ARIA 状态和可见下拉 |
| src/content/site.ts | 不修改 | 继续作为父级和子级导航 href 的唯一配置来源 |

## 实施任务

### 任务 1：扩展 Header 行为的失败测试

**文件：**

- 修改：e2e/local-interactions.spec.ts:1-14
- 不创建新的测试文件；沿用现有 Playwright webServer、默认英文 locale 和 Chromium project。

**接口：**

- 消费：现有 primaryNav 产生的 Products、/products、Toggle Products submenu 和 #submenu-Products。
- 产出：实现后必须满足的桌面、键盘和移动端可观察行为。

- [x] **步骤 1：将现有桌面测试改成先断言父级是链接，再断言 Chevron 展开。**

将现有“桌面导航点击后展开产品子菜单”测试替换为以下测试。它会在当前实现上因找不到桌面 Products 链接而失败，先锁定用户要求的行为：

~~~ts
test("桌面导航父级文字可导航且 Chevron 独立展开产品子菜单", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const products = page.getByRole("link", { name: "Products", exact: true }).first();
  await expect(products).toHaveAttribute("href", "/products");
  await products.click();
  await expect(page).toHaveURL(/[/]products$/);

  await page.goto("/");
  const submenuToggle = page.getByRole("button", {
    name: "Toggle submenu for Products",
  });

  await submenuToggle.click();
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#submenu-Products")).toHaveClass(/pointer-events-auto/);
  await expect(page.locator("#submenu-Products a").first()).toBeVisible();
});
~~~

- [x] **步骤 2：增加 hover 和键盘回归。**

在同一测试文件加入以下测试，分别验证 hover 展开、Enter 展开和 Escape 收起并恢复焦点：

~~~ts
test("桌面导航 hover 展开下拉且键盘 Escape 收起并恢复焦点", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const submenuToggle = page.getByRole("button", {
    name: "Toggle submenu for Products",
  });

  await submenuToggle.hover();
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#submenu-Products")).toHaveCSS("opacity", "1");

  await submenuToggle.focus();
  await page.keyboard.press("Enter");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("Enter");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Space");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "false");
  await expect(submenuToggle).toBeFocused();
});
~~~

由于 hover 会先打开菜单，桌面 Chevron 的鼠标点击实现必须保留现有“真实鼠标点击不因 hover 预先打开而立即关闭”的 event.detail > 0 语义；键盘激活的 event.detail === 0 继续作为可切换操作。

- [x] **步骤 3：增加移动端菜单、父级跳转和子菜单跳转回归。**

加入以下测试，确保桌面拆分不会破坏移动端现有结构：

~~~ts
test("移动端父级文字导航、Chevron 子菜单和子链接跳转均可用", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await menuButton.click();
  await expect(page.getByRole("button", { name: "Close navigation" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  const mobileProducts = page
    .locator("#mobile-nav")
    .getByRole("link", { name: "Products", exact: true });
  await expect(mobileProducts).toHaveAttribute("href", "/products");
  await mobileProducts.click();
  await expect(page).toHaveURL(/[/]products$/);

  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobileSubmenuToggle = page.getByRole("button", {
    name: "Toggle submenu for Products",
  });
  await mobileSubmenuToggle.click();
  await expect(mobileSubmenuToggle).toHaveAttribute("aria-expanded", "true");

  const wheels = page.locator("#mobile-nav").getByRole("link", {
    name: "Wheels",
    exact: true,
  });
  await expect(wheels).toBeVisible();
  await wheels.click();
  await expect(page).toHaveURL(/[/]products[/]wheels$/);
});
~~~

- [x] **步骤 4：运行失败测试并记录基线。**

运行：

~~~bash
npx playwright test e2e/local-interactions.spec.ts --project=chromium --grep "导航|navigation|Chevron"
~~~

预期：新增的桌面父级链接断言失败；现有旧测试也会继续暴露“Products 仍是 button”的实现差异。失败原因应是选择器/语义不匹配，而不是 webServer、WordPress 或浏览器启动失败。

### 任务 2：拆分桌面父级链接和 Chevron 触发器

**文件：**

- 修改：src/components/site-header.tsx:116-180
- 保留：src/components/site-header.tsx:83-89 和 src/components/site-header.tsx:239-257 当前用户未提交的无障碍本地化改动。

**接口：**

- 消费：item.href、item.children、hrefFor、navLabel、expanded、setExpanded、active。
- 产出：桌面带子菜单项同时提供 Link[hrefFor(item.href)] 和有 aria-expanded / aria-controls 的独立 button；下拉 ID 仍为 submenu- 加 item.label，子链接结构不变。

- [x] **步骤 1：把原来包住文字和 Chevron 的桌面 button 拆成同级 Link 与 button。**

将 primaryNav.map 中 item.children 分支改为以下结构；item.children.map 的下拉内容保持原有链接和样式：

~~~tsx
return (
  <div
    key={item.label}
    className="group relative"
    onMouseEnter={() => setExpanded(item.label)}
    onMouseLeave={() => setExpanded(null)}
  >
    <div className="flex items-center">
      <Link
        href={hrefFor(item.href)}
        className={cn(
          "relative whitespace-nowrap border-b-2 border-transparent px-2.5 py-3 font-display text-[0.76rem] font-700 uppercase tracking-[0.08em] transition-colors xl:px-3",
          solid ? "text-ink/80 hover:text-forge" : "text-white/80 hover:text-white",
          active && (solid ? "border-forge !text-forge" : "border-forge-bright !text-white"),
        )}
      >
        {navLabel(t, item)}
      </Link>

      <button
        type="button"
        aria-label={t("a11y.toggleSubmenu") + " " + navLabel(t, item)}
        aria-expanded={expanded === item.label}
        aria-controls={"submenu-" + item.label}
        onClick={(event) => {
          setExpanded((current) => {
            // Hover opens before a pointer click reaches the Chevron. Keep the
            // menu open for that pointer activation; keyboard activation remains
            // a normal toggle and Escape closes it below.
            if (event.detail > 0) return item.label;
            return current === item.label ? null : item.label;
          });
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setExpanded(null);
            event.currentTarget.focus();
          }
        }}
        className={cn(
          "flex items-center justify-center border-b-2 border-transparent px-1.5 py-3 font-display text-[0.76rem] font-700 transition-colors",
          solid ? "text-ink/80 hover:text-forge" : "text-white/80 hover:text-white",
          active && (solid ? "border-forge !text-forge" : "border-forge-bright !text-white"),
        )}
      >
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            expanded === item.label && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      id={"submenu-" + item.label}
      data-nav-submenu
      className={cn(
        "absolute left-0 top-full min-w-[220px] origin-top pt-2 transition-[opacity,transform] duration-150",
        expanded === item.label
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none -translate-y-1 opacity-0",
      )}
    >
      <div className="overflow-hidden rounded-lg border border-border bg-white py-2 shadow-[0_20px_60px_rgba(11,15,22,0.14)]">
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={hrefFor(child.href)}
            className="block px-4 py-2.5 text-sm text-ink/80 transition-colors hover:bg-soft hover:text-forge"
          >
            {navLabel(t, child)}
          </Link>
        ))}
      </div>
    </div>
  </div>
);
~~~

- [x] **步骤 2：确认移动端分支不被重构误伤。**

保留移动端现有结构：#mobile-nav 内父级文字使用 Link href={hrefFor(item.href)}，右侧 Chevron 使用独立 button 展开 item.children。不把桌面端的 event.detail 处理复制到移动端，也不改变移动端点击文字后 setOpen(false) 的行为。

- [x] **步骤 3：运行任务 1 的新增测试，确认实现达到行为契约。**

运行：

~~~bash
npx playwright test e2e/local-interactions.spec.ts --project=chromium --grep "导航|navigation|Chevron"
~~~

预期：桌面父级链接可导航到 /products；Chevron 点击和 hover 可展开 #submenu-Products；键盘 Enter/Escape 状态正确；移动端父级和子链接 URL 正确。

### 任务 3：完成相关质量门禁与 Playwright 回归

**文件：**

- 读取：src/components/site-header.tsx
- 读取：e2e/local-interactions.spec.ts
- 验证：不新增源文件或文档副本。

**接口：**

- 消费：任务 2 的 Header DOM、ARIA 状态、locale 路由和 Playwright 测试。
- 产出：可审计的测试结果；若失败，区分本次改动失败与既有环境/WP 依赖失败。

- [x] **步骤 1：运行局部 ESLint。**

~~~bash
npm run lint -- src/components/site-header.tsx e2e/local-interactions.spec.ts
~~~

预期：退出码为 0，无 React、Next.js、ARIA 或未使用变量错误。

- [x] **步骤 2：运行 TypeScript 类型检查。**

~~~bash
npm run typecheck
~~~

预期：退出码为 0；Link、事件对象和 locale 路径类型均通过。

- [x] **步骤 3：运行相关 Playwright 测试。**

~~~bash
npx playwright test e2e/local-interactions.spec.ts --project=chromium
~~~

预期：Header 新增测试和文件内现有交互测试通过；如果 WordPress localhost:8081 未启动，只记录页面媒体 fallback 或 Console 噪声，不把它归因于 Header。

- [x] **步骤 4：运行完整 Playwright 回归。**

~~~bash
npm run test:e2e -- --project=chromium
~~~

预期：完整回归结果可复现；既有失败必须记录测试名、失败原因和是否与本次 Header 改动相关，不通过删测试或放宽断言来隐藏。

- [x] **步骤 5：运行生产构建。**

~~~bash
npm run build
~~~

预期：Next.js 生产构建、TypeScript、页面数据收集和路由生成全部完成；不增加 output: "export"，不改变 OpenNext 方向。

- [x] **步骤 6：做最终补丁与工作区检查。**

~~~bash
git diff --check
git diff -- src/components/site-header.tsx e2e/local-interactions.spec.ts
git status --short
~~~

检查内容：桌面父级文字确实是 Link，Chevron 才是展开 button；移动端结构和用户已有无障碍文案改动仍在；没有生成临时截图、测试报告或未授权 commit。

## 验收标准

- 桌面 1440px 下，Products、Capabilities、Dealer Programs、Insights 的文字均有对应主路由 href，点击后 URL 分别进入 /products、/capabilities、/dealers、/insights。
- 桌面 hover 父级容器仍会打开对应下拉；独立 Chevron 点击不会把 hover 已打开的下拉立即关闭；下拉子链接可以真实点击并导航。
- 桌面键盘焦点能到父级链接和 Chevron；Chevron 的 Enter/Space 可展开，Escape 可关闭并恢复 Chevron 焦点。
- 移动端菜单可打开/关闭；父级文字继续导航；Chevron 独立展开子菜单；子链接可导航并关闭移动菜单。
- 相关 Playwright、lint、typecheck、build 均按上文运行并记录真实结果。
- 没有新增内容主张、路由数据副本、竞品残留或未授权外部动作。

## 自审

### 规格覆盖

- 父级文字改为导航链接：任务 1 步骤 1、任务 2 步骤 1。
- Chevron 独立下拉触发器：任务 1 步骤 1–2、任务 2 步骤 1。
- 鼠标、键盘、移动端、页面跳转：任务 1 三组测试和任务 3 步骤 3–4。
- lint、typecheck、build：任务 3 步骤 1、2、5。
- 保留现有工作区改动和不 commit 约束：全局约束、任务 2 文件说明、任务 3 步骤 6。

### 占位符扫描

本计划没有 TBD、TODO 或需要实施者自行猜测的文件、选择器、命令、路由和断言；所有新增测试均给出具体代码和预期结果。

### 类型与接口一致性

- 测试使用的 Products、/products、Toggle submenu for Products 与现有 primaryNav、字典键 a11y.toggleSubmenu 和 hrefFor 一致。
- 实现继续使用 item.href、item.children、expanded 和 setExpanded，没有引入测试中不存在的新状态接口。
- 下拉 ID 仍为 submenu- 加 item.label，与现有 aria-controls、测试选择器和移动端无关的 DOM 契约一致。

## 执行结果（2026-10-16）

- 基线测试按预期先失败，原因是桌面父级仍为 button，且移动端打开菜单后 aria-label 会切换为 Close navigation。
- 相关回归：`npx playwright test e2e/local-interactions.spec.ts --project=chromium --grep "导航|navigation|Chevron"`，3 passed。
- 文件级回归：`npx playwright test e2e/local-interactions.spec.ts --project=chromium`，4 passed。
- 局部 ESLint、TypeScript typecheck 均通过。
- 完整 Chromium 回归：127 passed、29 failed、1 skipped；失败集中在既有询盘接口、筛选分页、国际化页面和组件水合/并发稳定性，未涉及 Header 相关测试。
- `npm run build` 成功完成编译、TypeScript、页面数据收集和路由生成；本地 WordPress `127.0.0.1:8081` 未启动，仅产生内容 fallback 警告。
- `git diff --check` 通过；未执行 commit、push 或 deploy。

## 执行交接

计划已保存并按 Inline Execution 在当前会话中完成执行；代码与验证结果以工作区实际状态为准。
