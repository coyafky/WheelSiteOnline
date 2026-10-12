# Astryx 内容、工具与政策页面切片（P4）

- 状态：**已完成并归档（2026-10-11）**。31 模板四视口／四语言深度回归见 `outputs/reports/33-astryx-p5-final-commercial-seo-handoff-2026-10-11.md`；下文“留在 queued”是阶段性原始记录。
- 总计划：`outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md`。

## 范围

首页、About、Capabilities、Insights/文章、Fitment、Dealers、Gallery Finishes、Tools/偏距计算器、Support/法律与感谢页。统一内容容器、标题、警示、目录和合适的 Astryx 输入/布局原语。

## 实施与验收

1. 已批准正文、媒体、翻译、撤回状态继续来自 WordPress/`src/content` 接缝；未批准法律文案与翻译不得因 UI 迁移而上线。
2. FAQ 服务端全文、Insights 分类 URL 状态、长文锚点与无 JS 目录、偏距计算公式与负数/小数输入均保持原语义。只把实际有 Tabs 语义的内容迁移为 Tabs。
3. 对每个页面族核验 SSR/水合、四语言、320/390/768/1440、键盘、焦点、reduced motion、axe 基础扫描和控制台。
4. 更新对应 Page SPEC 与采用/保留矩阵；跑项目质量门禁。涉及内容契约或架构边界时先按仓库规则更新相应文档。

---

## 完成记录（2026-10-11）

**状态：范围完成，任务留在 queued/ 不声明 completed**（须等 P5 与总任务）。

### 实质动作：消除 10 处手写首屏的漂移

给共享 `src/components/sections/page-hero.tsx` **新增 `tone: "light" | "dark"`**，
把散落各页的深色/浅色首屏统一收进来。**10 files changed, +332 / −428 = 净 −96 行**。

**为什么加 `tone` 而不是全局改色**：P1 实测（报告 28 §四）Astryx 生成主题的
`:where(h1…) { color: … }` 是**按 landmark 而非按表面**取墨色；10 处手写首屏各自复制了
radial-gradient 位置、alpha、标题 clamp 与层不透明度，**逐个文件都在漂移**。
收进 `PageHero` 后**表面与文字颜色由 `tone` 一处决定** → 不可能再出现「深色表面 + 浅色墨色」；
且深色首屏**不必**改成浅色（尊重 P1 §2.5 保留的照片/工程语气带）。

改动文件：`dealers/page.tsx`、`dealers/private-label/page.tsx`、`fitment/page.tsx`、
`fitment/[platform]/page.tsx`、`gallery/finishes/page.tsx`、`insights/bolt-patterns/page.tsx`、
`tools/page.tsx`、`tools/offset-calculator/page.tsx`、`page-hero.tsx`、`legal-document.tsx`。

### 🔴 顺手修掉一个真缺陷：`/support/returns` @320px 溢出 33px

- **定位**（真 Chrome 逐元素测 `right > viewportWidth`）：元凶是 `legal-document.tsx:132` 的 `<aside>`
  —— CSS Grid 子项默认 `min-width: auto`，而 Astryx `Outline` 是**不换行的导航轨道**，
  不会收缩到内容宽度以下 → aside 撑到 333px，**超出 320px 视口 33px**。
- **修法**（一行，与 P1 同类）：grid 子项补 `min-w-0`。
- **复验**：`/support/returns` @320 **33px → 0px**；修复后 15 条 P4 路由 × 3 移动视口 = **45 组合全部 0 溢出**。
- 该缺陷**早于 P4**（Outline 迁移的遗留），由 P4 的扫描暴露并修掉。

### KEEP 清单：实测未破坏

| 项 | 结果 |
|---|---|
| FAQ 服务端全文 + 无 JS 可用 | ✅ 原生 `<details>` 未动，全文在 DOM |
| Insights 分类**非 tabs** | ✅ 保持并列 `<section>` + 各自 URL 状态 |
| 长文锚点 + 无 JS 目录 | ✅ `LongformOutline`（Astryx `Outline`）保留 |
| 偏距公式 / 负数 / 小数输入 | ✅ 逻辑未动 |
| 未批准法律文案 / 翻译 | ✅ 未新增、未公开 |

### 76 组合实测（19 路由 × 4 视口，**after** 采集）

非 200 **0** ｜ 横向溢出 **0** ｜ 控制台错误 **0** ｜ 缺 `data-astryx-theme="neutral"` **0**。
四语言：`/` `/zh` `/es` `/th` × 4 条代表路由 = **16 组合全部 200**。

⚠️ **两处采集自我更正**（已在报告 31 §3 记录）：
1. 早先 `themeOk` 字段报出的若干 `false` 经 `curl` 独立复核为**采集时序假象**，非真缺陷；
   已改用 after-sweep 的 `theme` 字段重采 → 76/76 通过。
2. `/fitment/5x114-3` 的 404 是**我自己臆造的 slug**（真实值是 `bmw-m`/`mercedes-amg`/`audi-rs`）；
   换真实 slug 后 200，臆造 slug 返回 404 是**正确**行为。

### 门禁

`theme:check` ok ｜ `npm test` **42/42** ｜ `lint` **0 error**（脚本清理后无 warning）｜
`typecheck` clean ｜ `build` exit 0 ｜ `git diff --check` clean

### 诚实边界（未做）

- **未做全量 axe 扫描**（只抽查「未新引入违规」）；**未验证键盘完整 Tab 顺序**（只确认无新 focus trap）。
- **Page SPEC 未逐份回写** —— 本轮是「同一 hero 的表现层收敛」，未改变页面任务/证据/事实边界；
  **规格级变更留待 P5**。
- 未覆盖文章详情逐篇；四语言只抽 4 条代表路由（**不是四语言全站回归**）。
- **未向真实 QQ SMTP 发信**；**未 commit/push/deploy**；临时脚本 `.tmp-p4-*.mjs`（6 个）已清理。
