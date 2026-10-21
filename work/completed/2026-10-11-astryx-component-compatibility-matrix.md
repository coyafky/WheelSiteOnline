# Astryx 组件兼容性基线与全站盘点（P0）

- 状态：**已完成并归档（2026-10-11）**。P5 全站验证见 `outputs/reports/33-astryx-p5-final-commercial-seo-handoff-2026-10-11.md`；下文“留在 queued”的记录是当时阶段状态。
- 总任务：`work/completed/2026-10-11-astryx-neutral-sitewide-migration.md`。
- 执行计划：`outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md`。

## 要做

1. 以 31 个渲染模板和 7 个重定向路由建立清单，标注页面族、当前通用模式、Astryx 已用组件、待探针候选及项目组件保留理由。
2. 核对本地 `@astryxdesign/core@0.6.7` 的实际导出、props、样式与 SSR/水合表现；对 TopNav/MobileNav、Pagination、CheckboxInput、Table、Card、Markdown 等争议候选做最小探针。
3. 记录 Next Link、普通 GET 链接、无 JavaScript、键盘/焦点、四语言和 320px 行为。先读已有 DEC 与页面规格，不能因“有导出”就绕过已验证契约。
4. 产出逐模式四态矩阵：已采用、已探针待验收、经验证保留原生/项目组件、不适用；附复现步骤和证据链接。

## 验收

- 31 个渲染模板均有归属，7 个重定向均登记；未把未实现候选写成已迁移。
- 每项例外有具体行为依据；P1–P4 可以据此独立实施。
- 不改业务数据契约、不提交真实询盘、不自动改全站 JSX。

---

## 完成记录

- 日期：2026-10-11
- 结论：**P0 完成**。四态矩阵、31 模板清单、7 重定向登记、争议候选探针全部产出。
- 交付物：
  - 主矩阵：[`outputs/reports/26-astryx-component-compatibility-matrix-alma-2026-10-11.md`](../../outputs/reports/26-astryx-component-compatibility-matrix-alma-2026-10-11.md)
  - 探针证据：[`outputs/reports/27-astryx-probe-evidence-alma-2026-10-11.md`](../../outputs/reports/27-astryx-probe-evidence-alma-2026-10-11.md)
  - 原始证据目录：[`outputs/reports/astryx-p0-probes/`](../../outputs/reports/astryx-p0-probes/)（`COMMANDS.md`、`raw-dts-signals.txt`、`ssr-probe*.mjs`/`-output.txt`、`rendered/*.html`）
- 关键发现（均有 file:line / 探针输出证据，详见 26 号报告 §二）：
  - **Pagination**：`onChange` 必填、**无 `href`**；SSR 实测产出 `<button>`，无 `<a>` → **保留原生链接分页**（可爬取 + 无 JS）。
  - **CheckboxInput**：受控单布尔 `onChange`；现用 **76 个原生同名多值 checkbox + `<form method="get">`** → **保留原生多值筛选**（单布尔同意项则已采用）。
  - **TopNav/MobileNav**：TopNav 是扁平 strip、MobileNav 是单层 `dialog`；现有 Header 是**多级 flyout**（自管 hover/click/Enter/Escape）→ **保留项目 Header**。
  - **Card**：无 `use client`（服务端安全）→ **已探针待验收**；`ClickableCard` 亦然。
  - **Table / Collapsible / Markdown / TabList(Insights)**：`有理由保留原生` 或 `不适用`，理由见 26 号报告。
- 推导校订：当前工作树实测 `find src/app -name page.tsx` = **38**（任务书正文写的 36 为旧数）；
  纯重定向 7 个（`products/wheels/[model]` 是渲染模板，只在 slug 规范化时 308）→ **38 − 7 = 31**，
  与验收目标一致。
- 边界遵守：未改业务逻辑 / 页面 JSX / 组件代码；未提交、推送或部署；未新起 `next dev`
  （复用 :3200）；`WP_MODE=mock` 未触碰询盘；未跑 `astryx init`。
- 遗留（交 P1–P4）：
  1. `Button href` / `ClickableCard href` 的 **Next Link 软导航与预取** 未在真机验证（开放问题 1、2）。
  2. **无 JS / 键盘 / 焦点 / 四语言 / 320px** 未在本轮重跑，按 plan §六 每切片自测（开放问题 3–5）。
  3. 本任务只读，**未产生任何需要收缩的旧包装**；P0 无「已迁移」项，全部为基线登记。
- 任务去向：本文件**保留在 `queued/`**（未正式移入 `active/`，因审计已收尾）。归档时再移入
  `work/completed/`，与 P1 启动解耦。
