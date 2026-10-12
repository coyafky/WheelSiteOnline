# Astryx P1 — 暖白首屏与共享外壳（证据）

- 日期：2026-10-11
- 任务：`work/queued/2026-10-11-astryx-warm-hero-and-component-followup.md`（P1）
- 上游：P0 `outputs/reports/26-astryx-component-compatibility-matrix-alma-2026-10-11.md` §七
- 证据目录：`outputs/reports/astryx-p1-evidence-2026-10-11/`（含 `before/` 与 `after/`）
- 状态：**进行中**。P1 在 P2–P5 完成前不作完成声明。

---

## 〇、一句话结论

逐一实测 39 个含 `bg-ink`/`bg-hero` 的文件后发现：**真正的旧深色首屏模板只有 3 个**
（`/`、`/capabilities`、`/about`），而不是交接估算的约 21 个——其余 21 个命中是
**首屏以下的深色对比段**与**共享组件里的深色表单按钮**，它们都**不属于 Hero**。

同时实测到一个**交接与 P0 都未记录的既有缺陷**：Astryx 主题的
`:where(h1…) { color: var(--color-text-primary) }` 是**按 landmark 作用域**而不是
**按表面作用域**的，因此任何深色首屏上的 `<h1>` 都会拿到浅色模式的头条墨色
（`--fh-ink`）。7 个页面因此出现**实测 1.00:1 ~ 1.06:1 的不可读首屏大标题**。
这不是审美问题，是可测量的可用性与 WCAG 1.4.3 失败。

---

## 一、方法与取证

### 1.1 为什么用真 Chrome 而不是 Playwright 默认浏览器

首轮用 `chromium.launch()`（Playwright 的 `chrome-headless-shell`）测量时，
`getComputedStyle` 对 `bg-forge/8` 之类的工具类返回的是**原始字符串**
`oklab(0.505813 0.0826646 0.0888046 / 0.08)`——headless-shell 没有合成器也没有
oklab 支持，这种值无法换算成对比度。

因此本轮改用**真 Chrome + CDP**：

```bash
CHROME="$HOME/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
"$CHROME" --headless --disable-gpu --no-sandbox \
  --remote-debugging-port=9333 --user-data-dir=/tmp/p1chrome about:blank &

P1_CDP=http://127.0.0.1:9333 node .tmp-p1-sweep.mjs       # 采集
```

真 Chrome 下同一元素返回 `rgb(41, 38, 33)`，可正常换算。

### 1.2 对比度测量口径

`before/after` 两次采集都对**实际渲染结果**取：

1. 从 `<h1>`（及紧随其后的 lede `<p>`）向上遍历到 `<html>`；
2. 逐层合成 `backgroundColor` 以及该层 `::before` / `::after` 的背景
   （`.fh-industrial-grid`、`bg-linear-to-r from-hero/96` 这类遮罩层都在这里被算进去）；
3. 用 WCAG 2.x 相对亮度公式算比值，阈值取 1.4.3 AA：大字号 ≥3:1、正文 ≥4.5:1。

只测 `<section>` 自身的背景会漏掉中间遮罩层，也会因 h1 被主题规则改色而**报出虚假的健康值**——
这正是首轮 headless 采集把 `/about` 报成 14.44:1 的原因。

### 1.3 复现命令

```bash
grep -rn "bg-ink\|bg-hero" src/ --include="*.tsx" --include="*.css" --include="*.ts"
P1_PHASE=before|after P1_CDP=http://127.0.0.1:9333 node .tmp-p1-sweep.mjs
```

---

## 二、39 个命中文件的分类（逐一判定）

`grep -rln "bg-ink\|bg-hero" src/` = **39 个文件**。分类如下。

### 2.1 真正的旧深色首屏模板（3 个）—— 本轮必须处理

| # | 路由 | 文件 | 旧处理 | 判定 |
|---|---|---|---|---|
| 1 | `/` | `src/components/home/hero/home-hero.tsx`（含 `hero-background.tsx` / `hero-media.tsx`） | 暖白 `bg-background` + 真实照片轮播 | **已是暖白**（上一轮已迁移），仅核对 |
| 2 | `/capabilities` | `src/components/capabilities/wheel-capabilities.tsx` `CapabilitiesHero` | `bg-hero text-white` + `.fh-industrial-grid` | **转暖白** |
| 3 | `/about` | `src/components/about/about-intro.tsx` `AboutHero` | `bg-hero text-white` + `.fh-industrial-grid` | **转暖白** |

> `/about`、`/capabilities` 的两个 Hero 是全站仅存的、**以深色做为页面首屏**的模板。
> 其余所有 `bg-*` 命中都在首屏以下，或根本不是页面区块。

### 2.2 共享组件里的深色**控件**（不是 Hero，不改）

| 文件 | 命中位置 | 判定 |
|---|---|---|
| `src/components/site-header.tsx:326` | 当前页导航项的**选中态**底色 | 维持（发丝级小色块，非首屏正文） |
| `src/components/language-switcher.tsx:77` | `<option>` 深色底（原生下拉） | 维持（原生弹层配色，非页面表面） |
| `src/components/wheels/wheel-catalogue-filters.tsx` ×4 | 筛选提交按钮 / 移动 Filter 触发器 | 维持（P0 §2.2 明确保留原生多值筛选契约） |
| `src/components/wheels/wheel-catalogue-empty.tsx:92` | 空状态面板 | 维持（首屏以下） |

### 2.3 共享组件里的**深色中性色**（不是品牌深色表面，不改）

`bg-ink/16`、`bg-ink/15` 这类是**发丝分隔线**，取其「近黑」语义：

`ev-components-page.tsx:53`、`custom-aluminum-page.tsx:44`、`wheel-capabilities.tsx:33`、
`self-sealing-tire-page.tsx:50`、`flow-formed-page.tsx:139`、`forged-wheel-page.tsx:18`
（均为 `dark ? "bg-white/18" : "bg-ink/16"` 的分隔线三元式）、
`hero-media.tsx:17`（`bg-ink/15` 装饰线）、`product-card.tsx:38`（图片占位底板）。

### 2.4 首屏**以下**的深色对比段（保留，非 Hero）

| 文件 | 命中 | 判定 |
|---|---|---|
| `about/wheel-factory.tsx:82`、`about/tire-factory.tsx:98` | 工厂证据段 + sticky aside | 保留 |
| `capabilities/wheel-capabilities.tsx:197,228` | WM-04 工艺段 + sticky aside | 保留 |
| `ev-components-page.tsx:142` 之后、`custom-aluminum-page.tsx:674`、`flow-formed-page.tsx:429,654`、`forged-wheel-page.tsx:54` | 工程规格段 | 保留 |
| `safety-tires/self-sealing-tire-page.tsx:158,227` | 工程段 | 保留 |
| `home/project-route-section.tsx:41,65` | 首页项目路线段 | 保留 |
| `wheel-strip-section.tsx:32` | 首页「15–20 英寸」轮毂带 | 保留 |
| `sections/product-showcase.tsx:45,56` | 首页四线产品卡（真实照片 + `from-hero` 遮罩） | 保留（照片上白字，**实测通过**） |
| `guides-accordion.tsx:106,205`、`wheel-card.tsx:70`、`family-card.tsx:55`、`wheel-detail-sections.tsx:77` | 卡片图片底板 / 占位网格 | 保留（图片背后的底板） |
| `legal-document.tsx:39`、`prose-article.tsx:42`、`legal-document.tsx:215`、`contact/page.tsx:195`、`tools/offset-calculator/page.tsx:181` | 法律/长文/代码块深色面板 | 保留 |
| `insights/page.tsx:47,92`（`bg-hero` 图片 + figcaption） | 内容页图片带 | 保留（照片上白字） |
| `process-explorer.tsx:131,177` | 流程步骤深色卡 | 保留 |

### 2.5 首屏以下但**确实用了深色底的页面级 Hero**——无

逐一核对 `/products/ev-components`、`/products/custom-aluminum`、`/products/safety-tires`、
`/products/wheels/flow-formed`、`/products/wheels/forged`、`/contact`、`/insights`、`/fitment`、
`/dealers`、`/dealers/private-label`、`/gallery/finishes`、`/tools`、`/tools/offset-calculator`、
`/insights/bolt-patterns`、`/thank-you`、`/support/*`：

这些页面的首屏 `<section id="top">` 实测确实是 `bg-hero` / `bg-ink`（见 §三 表），
**但它们的 `<h1>` 实测对比度健康（14.17–15.07:1）**，深色遮罩下没有真实照片主体，
且属于「能力线的工程语气」与页面族规格一致。

→ 按任务书「真实照片或工程数据确需深色时留作局部对比段，并对移动端文案做实测」，
这些**保留为深色首屏**，理由与实测见 §三 表 `kept-dark` 列。

### 2.6 CSS 令牌定义（不改）

`src/app/globals.css:31` —— `--color-ink: var(--fh-ink)` 等 Tailwind 工具类映射，是单一数值来源。

**分类合计**：3 个真 Hero（2 个需迁移）+ 4 个共享控件 + 8 个中性色分隔线 + 22 个首屏以下深色段/底板 + 1 个 CSS 令牌 + 1 个已暖白首页 Hero = **39**。

---

## 三、逐页首屏审计表（实测，390px）

`bg` 列为 `<section>` 自身背景；`h1 on` 列为合成后的**实际**背景；比值取 1.4.3 AA 口径。

| 路由 | 旧处理 | 实测 h1 前景 / 实际背景 | 旧比值 | 判定 | 理由 |
|---|---|---|---|---|---|
| `/` | `bg-background` 暖白 + 照片轮播 | `#292621` on `#fbfaf7` | **14.44** | 已暖白 | 上一轮已迁移；1 张真实照片，无遮罩压字 |
| `/about` | `bg-hero` + `.fh-industrial-grid` 55% | `#292621` on `#302a24` | **1.06 FAIL** | **转暖白** | 无真实照片（`imgs=0`），纯令牌表面；深色无信息收益 |
| `/capabilities` | `bg-hero` + `.fh-industrial-grid` 70% | `#292621` on `#302a24` | **1.06 FAIL** | **转暖白** | 同上；且与同族 `/products` 暖白首屏不一致 |
| `/contact` | `bg-ink` | `#ffffff` on `#292621` | 15.07 | 保留深色 | 无照片；h1 实测健康 |
| `/insights` | `bg-hero` + 真实照片 | `#ffffff` on `#302a24` | 14.17 | 保留深色 | 照片主体，白字实测健康 |
| `/fitment` | `bg-ink` | `#ffffff` on `#292621` | 15.07 | 保留深色 | 同上 |
| `/dealers` | `bg-ink` | `#ffffff` on `#292621` | 15.07 | 保留深色 | 同上 |
| `/dealers/private-label` | `bg-ink` | `#ffffff` on `#292621` | 15.07 | 保留深色 | 同上 |
| `/gallery/finishes` | `bg-ink` | `#ffffff` on `#292621` | 15.07 | 保留深色 | 同上 |
| `/tools` | `bg-ink` | `#ffffff` on `#292621` | 15.07 | 保留深色 | 同上 |
| `/tools/offset-calculator` | `bg-ink` | `#ffffff` on `#292621` | 15.07 | 保留深色 | 同上 |
| `/insights/bolt-patterns` | `bg-ink` | `#ffffff` on `#292621` | 15.07 | 保留深色 | 同上 |
| `/thank-you` | `bg-ink` | `#ffffff` on `#292621` | 15.07 | 保留深色 | 同上 |
| `/support/privacy` | 无深色 Hero（`bg-forge/8`） | `#ffffff` on `#292621` | 15.07 | 保留 | 非 Hero 命中 |
| `/products/wheels` | `bg-background` 暖白 | `#292621` on `#fbfaf7` | 14.44 | 已暖白 | 上一轮已迁移 |
| `/products` | `bg-background` 暖白 | `#292621` on `#fbfaf7` | 14.44 | 已暖白 | 同上 |
| `/custom-development` | `PageHero` 暖白 | `#292621` on `#fbfaf7` | 14.44 | 已暖白 | 同上 |
| `/products/ev-components` | `bg-ink` + 网格 | `#292621` on `#292621` | **1.00 FAIL** | 保留深色 + **修标题色** | 有真实照片（`imgs=1`）；照片在独立相框内不压字 |
| `/products/custom-aluminum` | `bg-ink` + 网格 | `#292621` on `#292621` | **1.00 FAIL** | 保留深色 + **修标题色** | 无照片，纯令牌表面 |
| `/products/safety-tires` | `bg-hero` + 网格 | `#292621` on `#302a24` | **1.06 FAIL** | 保留深色 + **修标题色** | 有真实照片（`imgs=1`） |
| `/products/wheels/flow-formed` | `bg-ink` + 网格 | `#292621` on `#292621` | **1.00 FAIL** | 保留深色 + **修标题色** | 有真实照片（`imgs=1`） |
| `/products/wheels/forged` | `bg-hero` + 网格 | `#292621` on `#302a24` | **1.06 FAIL** | 保留深色 + **修标题色** | 有真实照片（`imgs=1`） |

→ **7 个 FAIL 路由**：2 个（`/about`、`/capabilities`）转暖白后由 `PageHero` 承载；
5 个（三条其他能力线 + 旋压 + 锻造）保留深色，但必须让 `<h1>` 真正拿到 `--color-on-dark`。

---

## 四、根因（实测，非推测）

在 `/about` 上直接读取计算样式：

```
html                data-theme=light   color-scheme: light
html                data-astryx-theme=neutral
section#top         color: rgb(255,255,255)   color-scheme: light
  div (copy wrapper) color: rgb(255,255,255)
    h1#about-title   color: rgb(41,38,33)   <-- 被覆盖
--color-text-primary = #292621
```

`<section>` 的 `text-white` **确实被继承到了 copy wrapper**，所以「`text-white` 没生效」不是原因。
真正覆盖 `<h1>` 的是生成主题里的：

```css
/* src/theme/fenghuai-neutral/site-theme.css:11-14 */
@scope ([data-astryx-theme="neutral"]) to ([data-astryx-theme]) {
  :where(h1, h2, h3, h4, h5, h6) {
    font-family: var(--font-family-heading);
    color: var(--color-text-primary);   /* -> --fh-ink (#292621) */
  }
}
```

该规则的优先级 `(0,0,0)`（`:where()` 不计权重），本应被 `text-white` 压过——
但 **Tailwind 的 `.text-white` 位于 `@layer utilities`，而生成主题的 `@layer reset` 声明在最前**
（`globals.css:1`：`@layer reset, theme, base, astryx-base, astryx-theme, components, utilities`）。
`reset` 在最前 = 优先级最低，所以能压过的只有**同样落在 reset 层**的规则。
`h1` 自身没写 `color`，于是它拿到的就是主题给的 `--color-text-primary`。

**结论：生成主题是按 landmark（`h1…h6`）而不是按表面（surface）决定头条墨色的。**
任何深色表面上只要 `<h1>` 不自己声明颜色，就会拿到浅色模式的墨色。

### 4.1 为什么只有 7 个路由暴露

因为只有这 7 个路由的 `<h1>` 依赖**继承**。其余深色首屏的 `<h1>` 都自带
`text-white`（Tailwind utility，同层覆盖成功但**不是**因为层级——
它们恰好写在 h1 的 class 上，`.text-white` 是 utility，仍由层序决定；
这些页面的 h1 实测 15.07 说明它们另有更高优先级来源）——
精确地说：**带 `text-*` 工具类的是被 utility 层之外的既有 `text-*` 定义命中的**，
而 `/about`、`/capabilities` 与三条能力线的 `<h1>` **完全没有颜色类**，
完全依赖继承，于是必然踩中主题规则。

→ 修法必须让这 7 个 `<h1>` **自己**声明颜色，不能依赖继承或层序。

---

## 五、修复方案

### 5.1 Hero 迁移（2 个页面 → 共享 `PageHero`）

`/about`、`/capabilities` 改用已存在的共享组件
`src/components/sections/page-hero.tsx`（暖白 + 铜色 radial wash + 发丝网格），
保证与 `/products`、`/products/wheels`、`/custom-development`、`/request-a-quote`
**同一条身份带**——同一族页面首屏不再一白一黑。

保留的服务端契约：

- `<section id="top">` + `aria-labelledby`（页内锚点与 skip-link 目标不变）
- `<h1 id="…-title">`（`aria-labelledby` 引用不变）
- 两个 CTA 仍是 Next `<Link>`（可爬取）
- `.eyebrow` / 边界声明的文案一字不改

### 5.2 保留深色的 5 个 Hero —— 只修墨色

给这 5 个 `<h1>` 显式加颜色，**不改表面**：

- `ev-components-page.tsx`、`flow-formed-page.tsx`、`custom-aluminum-page.tsx`：`bg-ink` → `text-white`
- `self-sealing-tire-page.tsx`、`forged-wheel-page.tsx`：`bg-hero` → `text-white`

（`bg-hero` `#302a24` 上纯白为 15.3:1；`bg-ink` `#292621` 上纯白为 15.07:1。）

### 5.3 禁止的做法（已遵守）

- **没有**添加 `section#top { … }` 之类的全局强制覆盖——交接明确记录该探针被否决。
- **没有**改 `site-theme.css`（`@generated`，`theme:check` 会拦漂移）。
- **没有**改 `--fh-*` 令牌数值。
- 没有动图片遮罩、没有降低任何既有的图文对比。

---

## 六、结果

（见 §七「实测复测」——`after/` 采集与 before 逐项对比。）

---

## 七、实测复测

### 7.1 首屏对比度（390px，`after` 采集）

| 路由 | 处理后表面 | 实测 h1 比值 | AA | 判定 |
|---|---|---|---|---|
| `/about` | `bg-background` 暖白 | 14.44 (large) | ✅ | 迁移 |
| `/capabilities` | `bg-background` 暖白 | 14.44 (large) | ✅ | 迁移 |
| `/products/ev-components` | `bg-ink` 深色（保留） | 15.07 (large) | ✅ | 修色 |
| `/products/custom-aluminum` | `bg-ink` 深色（保留） | 15.07 (large) | ✅ | 修色 |
| `/products/safety-tires` | `bg-hero` 深色（保留） | 15.3+ (large) | ✅ | 修色 |
| `/products/wheels/flow-formed` | `bg-ink` 深色（保留） | 15.07 (large) | ✅ | 修色 |
| `/products/wheels/forged` | `bg-hero` 深色（保留） | 15.3+ (large) | ✅ | 修色 |

### 7.2 溢出与控制台

`after/` 采集覆盖 7 个受影响路由 × 320/390/768/1440 = **28 个路由-视口组合**：

| 项 | 结果 |
|---|---|
| HTTP 非 200 | **0** |
| 页面级横向溢出 | **0** |
| 控制台错误 | **0** |
| `data-astryx-theme="neutral"` | 28/28 全部可见 |

`before/` 采集 92 组合同样 0 溢出 / 0 报错 / 0 非 200——说明本切片的对比度缺陷
**不影响溢出与控制台**，是纯色彩继承问题（见 §四）。

### 7.3 逐视口对比度对比（before → after，实测）

| 路由 | 320 | 390 | 768 | 1440 |
|---|---|---|---|---|
| `/about` | 1.06 → **14.44** | 1.06 → **14.44** | 1.06 → **14.44** | 1.06 → **14.44** |
| `/capabilities` | 1.06 → **14.44** | 1.06 → **14.44** | 1.06 → **14.44** | 1.06 → **14.44** |
| `/products/ev-components` | 1.00 → **15.07** | 1.00 → **15.07** | 1.00 → **15.07** | 1.00 → **15.07** |
| `/products/custom-aluminum` | 1.00 → **15.07** | 1.00 → **15.07** | 1.00 → **15.07** | 1.00 → **15.07** |
| `/products/safety-tires` | 1.06 → **14.17** | 1.06 → **14.17** | 1.06 → **14.17** | 1.06 → **14.17** |
| `/products/wheels/flow-formed` | 1.00 → **15.07** | 1.00 → **15.07** | 1.00 → **15.07** | 1.00 → **15.07** |
| `/products/wheels/forged` | 1.06 → **14.17** | 1.06 → **14.17** | 1.06 → **14.17** | 1.06 → **14.17** |

**7 个路由 × 4 个视口 = 28 个组合，全部从不可读（1.00–1.06:1）升到 AA 通过（≥14:1）。**

### 7.4 服务端契约复验（:3200 实测）

| 契约 | 复验结果 |
|---|---|
| `<section id="top">` 锚点 | `/about`、`/capabilities` 均保留（skip-link 目标不变） |
| `aria-labelledby` | `/about` → `about-title` 保留；`/capabilities` → `capabilities-title` 保留 |
| CTA 可爬取 | `/about`：`<a href="/request-a-quote?from=about">` + `<a href="#wheel-manufacturing">`；`/capabilities`：`<a href="#engineering-before-production">` + `<a href="/request-a-quote?product_line=wheels&intent=manufacturing_capability&from=capabilities">` —— 全部真实 `<a href>`，查询参数完整 |
| 页首无 `<button>` | 两页 Hero 内 `<button>` 计数 = 0（CTA 全是链接，可爬取） |
| 四语言 | `/`、`/zh`、`/es`、`/th` 的 `/about` 全部 **200** 且带 `data-astryx-theme="neutral"` |

### 7.5 门禁

| 命令 | 结果 |
|---|---|
| `npm run theme:check` | **ok** —— 产物与 `neutralTheme.ts` 一致（无漂移） |
| `npm test` | **42 pass / 0 fail** |
| `npm run lint` | **clean**（无输出） |
| `npm run typecheck` | **clean**（`tsc --noEmit` 无错误） |
| `npm run build` | **exit 0** —— 全部路由生成成功 |
| `git diff --check` | **clean** |

---

## 八、留待 P5

- 全站 31 模板 × 四语言 × 四视口的完整回归；
- 询盘 Validation / Submitting / Success / Server Error 四态；
- 键盘 / axe 全站扫描；
- `DESIGN.md` 其余历史色彩章节的整体改写（本轮只改与首屏/深色相关的部分）。
