# Astryx 共享外壳与暖白首屏切片（P1）

- 来源：全站 Astryx Neutral 迁移的未完切片，交接给 Alma。
- 状态：**已完成并归档（2026-10-11）**；P5 最终 116/116 回归见 `outputs/reports/33-astryx-p5-final-commercial-seo-handoff-2026-10-11.md`。下文“留在 queued”是阶段性原始记录。
- 执行计划：`outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md`。

## 范围

1. 逐一审计仍使用 `bg-ink`/`bg-hero` 的约 21 个旧 Hero 模板。以暖白首屏为默认；真实照片或工程数据确需深色时留作局部对比段，并对移动端文案做实测。不得用全局 CSS 强制覆盖而损坏图文对比。
2. 核对共享 Header/Footer、桌面与移动导航、语言切换、面包屑、浮动询盘和通用 CTA；仅采用 P0 已证明能保留 Next Link、键盘和无 JS 行为的 Astryx 原语或薄适配器。
3. 对此切片涉及的页面做 320/390/768/1440 截图、焦点、控制台和页面级溢出检查；四语言的共享外壳应一致，不得遮挡首屏正文。
4. 跑相关 Playwright 回归以及主题漂移、单测、lint、typecheck、production build、diff 检查。完整全站与询盘四态回归由 P5/P2 负责，避免本切片重复承诺。

## 完成条件

新暖白设计实测后回写 `DESIGN.md` 的旧色彩与深色页首章节，更新相关规格与状态。每个仍保留深色 Hero 的页面有清楚理由和手机截图；本任务在 P1 证据齐全前不能移入 completed，总任务仍需等待 P2–P5。

---

## 完成记录（2026-10-11）

**状态：范围已完成，任务留在 queued/ 不声明 completed**（按完成条件，须等 P2–P5）。

### 关键发现：交接估算的「约 21 个旧深色 Hero」不成立

`grep -rln "bg-ink\|bg-hero" src/` 实测 **39 个文件**，逐一判定后：

| 分类 | 数 | 处置 |
|---|---|---|
| **真正的旧深色首屏模板** | **3** | `/`（已暖白，核对）；`/about`、`/capabilities`（**转暖白**） |
| 共享组件里的深色**控件** | 4 | 维持（导航选中态、原生 `<option>`、筛选按钮、空状态） |
| 深色中性色**分隔线**（`bg-ink/16`） | 8 | 维持（非表面） |
| 首屏**以下**的深色对比段 / 图片底板 | 22 | 维持（照片上白字，实测通过） |
| CSS 令牌定义 | 1 | 不改 |
| 已暖白首页 Hero | 1 | 核对 |

→ **只有 2 个页面需要真正迁移**，不是 21 个。其余命中都在首屏以下或根本不是页面区块。
（若按「约 21 个 Hero 模板」机械转白，会破坏 22 个有真实照片的对比段。）

### 顺带挖出的既有缺陷（交接与 P0 都未记录）

Astryx 生成主题的 `:where(h1…) { color: var(--color-text-primary) }`
（`src/theme/fenghuai-neutral/site-theme.css:11-14`，`@scope` 在 reset 层）是**按 landmark 而非按表面**取头条墨色。
凡 `<h1>` 未自带颜色类、纯靠继承的深色首屏，都会拿到浅色模式的墨色 → **实测 1.00–1.06:1 的不可读大标题**，
**7 个路由 × 4 个视口 = 28 个组合全部命中**（WCAG 1.4.3 失败）。

**根因**：`globals.css:1` 的层序把 `reset` 放最前 → 主题规则实际优先级最低，但 `h1` 自身没写 `color`，
于是拿到主题给的 `--color-text-primary`。这是**真缺陷，不是配色偏好**。

### 修复

1. **迁移 2 页**：`/about`、`/capabilities` 改用共享 `src/components/sections/page-hero.tsx`（暖白 + 铜色 wash + 发型网格），与 `/products`、`/products/wheels`、`/custom-development`、`/request-a-quote` 同一条身份带。
2. **保留 5 个深色 Hero**（三条其他能力线 + 旋压 + 锻造，均有真实照片或工程语气），只给这 5 个 `<h1>` **显式加颜色**，**不动表面**。
3. **未采用**交接明确否决的 `section#top { … }` 全局覆盖；未改 `site-theme.css`（`@generated`）；未改 `--fh-*` 数值。

### 实测证据

- **对比度 before → after**（7 路由 × 4 视口）：**1.00–1.06:1 → 14.17–15.07:1**，全部 AA 通过。
- **溢出 / 控制台**：28 个 after 组合 0 溢出 / 0 报错 / 0 非 200。
- **服务端契约复验**：`<section id="top">`、`aria-labelledby`、CTA 真实 `<a href>` 与查询参数全部保留；Hero 内 `<button>` = 0。
- **四语言**：`/`、`/zh`、`/es`、`/th` 的 `/about` 全 200 且 `data-astryx-theme="neutral"`。
- **门禁全绿**：`theme:check` ok ｜ `npm test` 42/42 ｜ `lint` clean ｜ `typecheck` clean ｜ `build` exit 0 ｜ `git diff --check` clean。

### 交付物

- 证据报告：`outputs/reports/28-astryx-p1-warm-hero-evidence-alma-2026-10-11.md`
- 截图与采集：`outputs/reports/astryx-p1-evidence-2026-10-11/{before,after}/` + `audit-{before,after}.json`
- 代码：`src/components/about/about-intro.tsx`、`src/components/capabilities/wheel-capabilities.tsx`、`src/components/custom-aluminum/custom-aluminum-page.tsx`、`src/components/ev-components/ev-components-page.tsx`、`src/components/forged-wheel/forged-wheel-page.tsx`、`src/components/safety-tires/self-sealing-tire-page.tsx`、`src/components/wheels/flow-formed-page.tsx`、`DESIGN.md`

### 遗留（交 P5 / 后续切片）

- 全站 31 模板 × 四语言 × 四视口完整回归；询盘四态；键盘 / axe 全站扫描。
- `DESIGN.md` 其余历史色彩章节的整体改写（本轮已改与首屏/深色相关部分）。
- **本轮未做**：真实浏览器键盘焦点顺序、无 JS 端到端、软导航/预取验证（P0 §六 开放问题 1–3 仍在）。
- **诚实边界**：`/about`、`/capabilities` 的暖白迁移只验了首屏；其首屏以下区块未逐段复核。
