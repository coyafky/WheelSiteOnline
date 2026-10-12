# Astryx P4 — 内容、工具与政策页面切片（证据）

- 日期：2026-10-11
- 任务：`work/queued/2026-10-11-astryx-content-component-slice.md`（P4）
- 上游：P0 `outputs/reports/26-...` §七；P1 `28-...`；P2 `29-...`
- 证据目录：`outputs/reports/astryx-p4-evidence-2026-10-11/`
- 状态：**范围完成**。全站收口仍待 P5。

> 诚实声明：本文件区分「已实测」与「只读代码」。未实现的一律不写作已完成。

---

## 〇、一句话结论

P4 的实质动作是**消除 10 处手写首屏的漂移**：把散落在各页的深色/浅色首屏统一收进
共享 `PageHero`（新增 `tone: "light" | "dark"`），**净减 96 行**，
同时**顺手修掉一个真实的 320px 横向溢出缺陷**（`/support/returns` +33px）。

---

## 一、改动范围（表现层；KEEP 清单未动）

| 文件 | 改动 |
|---|---|
| `src/components/sections/page-hero.tsx` | **新增 `tone` prop**（`light` 暖白身份带 / `dark` 照片或工程语气带）；标题颜色**由 tone 决定**而非继承 |
| `src/app/dealers/page.tsx` | 改用共享 `PageHero` |
| `src/app/dealers/private-label/page.tsx` | 同上 |
| `src/app/fitment/page.tsx` | 同上 |
| `src/app/fitment/[platform]/page.tsx` | 同上 |
| `src/app/gallery/finishes/page.tsx` | 同上 |
| `src/app/insights/bolt-patterns/page.tsx` | 同上 |
| `src/app/tools/page.tsx` | 同上 |
| `src/app/tools/offset-calculator/page.tsx` | 同上 |
| `src/components/legal-document.tsx` | **修 320px 溢出**（见 §四） |

合计 **10 files changed, +332 / −428 = 净 −96 行**。

**未改**（刻意保留，P0 已定）：

- `src/components/faq-accordion.tsx` —— 原生 `<details open>`，无 JS 可用
- Insights 分类结构 —— 并列 `<section>`，**不是 tabs**
- 长文正文来源 —— `src/content` + WordPress 批准内容，**非 Markdown 字符串源**
- 偏距计算公式与 `NumberInput` 绑定
- 3 处原生 `<table>`

### 1.1 为什么加 `tone` 而不是全局改色

P1 已实测（见报告 28 §四）：Astryx 生成主题的 `:where(h1…) { color: var(--color-text-primary) }`
是**按 landmark 而非按表面**取墨色。10 处手写首屏各自复制了 radial-gradient 位置、alpha、
标题 clamp 与层不透明度，**逐个文件都在漂移**。收进 `PageHero` 后：

- **表面与文字颜色由 `tone` 一处决定** → 不可能再出现「深色表面 + 浅色墨色」
- 消除 10 份重复的渐变定义 → 净减 96 行
- 深色首屏**不必**改成浅色（尊重 P1 §2.5 保留的照片/工程语气带）

---

## 二、KEEP 清单：实测未被破坏

| 项 | 检查方式 | 结果 |
|---|---|---|
| FAQ 服务端全文 | `/about` 等页 HTML 直出 | ✅ 全文在 DOM，非客户端水合后才出现 |
| FAQ 无 JS 可用 | 原生 `<details>`（非 Astryx `Collapsible`） | ✅ 未改 |
| Insights 分类**非 tabs** | 保持并列 `<section>` + 各自 URL 状态 | ✅ 未改成 `TabList` |
| 长文锚点 + 无 JS 目录 | `LongformOutline`（Astryx `Outline`）保留 | ✅ |
| 偏距公式 / 负数 / 小数输入 | `offset-calculator` 逻辑未动 | ✅ |
| 法律文案来源 | 未新增任何未批准文案 | ✅ |

**正文来源仍走 WordPress/`src/content` 接缝**；组件不读 WordPress 原始 JSON。
**未批准的法律文案与翻译未被公开发布。**

---

## 三、76 组合实测（19 路由 × 4 视口）

`astryx-p4-evidence-2026-10-11/audit-after.json`（**after** 采集，改动之后）：

| 指标 | 结果 |
|---|---|
| 路由-视口组合 | **76** |
| 非 200 | **0** |
| 页面级横向溢出 | **0** |
| 控制台错误 | **0** |
| 缺少 `data-astryx-theme="neutral"` | **0** |

视口：320×568 / 390×844 / 768×1024 / 1440×900。
路由覆盖：首页、About、Capabilities、Insights 族、Fitment 族、Dealers 族、
Gallery Finishes、Tools 族、Support 全部 5 页、Thank-you。

### 3.1 四语言

`/`、`/zh`、`/es`、`/th` × 4 条代表路由（about / insights / tools/offset-calculator / support/privacy）
= **16 组合，全部 200**。

> ⚠️ **诚实更正一处采集缺陷**：早先一轮 sweep 用 `themeOk` 字段报出若干 `false`，
> 经**独立复核**（`curl` 直取 HTML 且统计 `data-astryx-theme="neutral"` 出现次数）确认为
> **采集时序假象**，不是真缺陷；已改用 after-sweep 的 `theme` 字段重新采集，
> **76/76 全部通过**。原始 `audit-before.json` 里的 `langResults[].themeOk` 不应被引用。

### 3.2 一个**我自己**造成的假异常（记录以免误传）

首轮 after-sweep 出现 `/fitment/5x114-3` 全视口 **404**。
核实后确认**是我的错误**：`[platform]` 是平台 slug（真实值 `bmw-m` / `mercedes-amg` / `audi-rs`，
见 `src/content/fitment.ts:27,123,205`），`5x114-3` 是我按孔距**臆造的**。
换成 `bmw-m` 后 **200**；而臆造 slug 返回 **404 是正确的**行为（等价于一条负例）。
→ 与 2026-10-10 记忆里的教训一致：**抽样动态路由必须从数据源取真实 slug，不能靠命名规律猜**。

---

## 四、顺手修掉的真缺陷：`/support/returns` @320px 横向溢出 33px

**发现方式**：after-sweep 的 `overflow` 字段报出 `/support/returns 320x568 = 33`。

**真 Chrome 实测定位**（逐元素比对 `getBoundingClientRect().right > viewportWidth`）：

```
ASIDE  class="lg:sticky lg:top-[110px] lg:self-start"  right=353  width=333
  H2   …                                                right=353  width=333
    NAV class="astryx-outline compact …"                right=353  width=333
```

**根因**：`src/components/legal-document.tsx:132` 的 `<aside>` 是 CSS Grid 的直接子元素。
Grid/Flex 子项默认 `min-width: auto`，而 Astryx `Outline` 是一条**不换行的导航轨道**，
不会收缩到内容宽度以下 → 整个 aside 撑到 333px，**超出 320px 视口 33px**。

**修法**（一行，与 P1 同类修法）：给 grid 子项补 `min-w-0`。

```diff
- <aside className="lg:sticky lg:top-[110px] lg:self-start">
+ <aside className="min-w-0 lg:sticky lg:top-[110px] lg:self-start">
```

**复验**：

| 项 | 修复前 | 修复后 |
|---|---|---|
| `/support/returns` @320 溢出 | **33px** | **0px** |

并在修复后对 **15 条 P4 路由 × 3 个移动视口（320/390/768）= 45 组合**重跑专项扫描：**全部 0 溢出**。

> 注：该缺陷**早于 P4**（`legal-document.tsx` 在 P4 之前就存在，属此前切片的 Astryx Outline 迁移遗留），
> 由 P4 的扫描暴露并被本轮修掉。

---

## 五、SSR / 无 JS / 键盘 / reduced motion

| 项 | 结果 |
|---|---|
| 服务端首屏 | 全部 19 路由 HTML 直出内容（非客户端占位） |
| 无 JS 关键路径 | FAQ 全文（原生 `<details>`）、长文目录与锚点为服务端可读 |
| reduced motion | 未新增动画；既有 `prefers-reduced-motion` 规则未动 |
| 键盘 / 焦点 | 未引入新的 focus trap；`PageHero` 的 CTA 仍是真实 `<a href>` |
| axe 基础扫描 | 未新引入违规（`<h1>` 颜色由 `tone` 显式决定，反而不依赖继承） |

---

## 六、门禁

| 命令 | 结果 |
|---|---|
| `npm run theme:check` | **ok** |
| `npm test` | **42 pass / 0 fail** |
| `npm run lint` | **0 error**（临时探针脚本已清理，清理后无 warning） |
| `npm run typecheck` | **clean** |
| `npm run build` | **exit 0** |
| `git diff --check` | **clean** |

---

## 七、本轮**未做**的事（诚实边界）

1. **未做全量 axe 扫描** —— 只做「未新引入违规」的抽查，不是逐页 axe CI。
2. **未验证键盘完整 Tab 顺序** —— 只确认没有新增 focus trap。
3. **Page SPEC 未逐份回写** —— 本轮改动是「同一 hero 的表现层收敛」，
   未改变页面任务/证据/事实边界，故未改 Page SPEC；**规格级变更（如新增视口）留待 P5**。
4. **未覆盖**：`/insights/[slug]` 与 `/gallery/finishes` 之外的动态内容页族（文章详情逐篇）。
5. 四语言只抽 4 条代表路由 × 4 语言 = 16 组合，**不是四语言全站回归**。

---

## 八、安全与工作树

- **未向真实 QQ SMTP 发任何信**；本轮无自动提交行为。
- **未 commit / push / deploy**。
- 未覆盖 221 个遗留未提交改动。
- 临时探针 `.tmp-p4-*.mjs`（6 个）已清理；真实证据保留在 `astryx-p4-evidence-2026-10-11/`。
