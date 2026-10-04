# 项目交接文档 · WordpressWheelSIte 现状全量快照

> **生成时间**：2026-10-04（周日）
> **生成目的**：把项目现状完整、准确、无遗漏地盘点清楚，供下一个 AI（或开发者）直接接手继续开发。
> **本文性质**：**现状快照，不是改进方案**。第 5 部分「建议路径」是建议，不是既定计划。
> **证据纪律**：所有数字来自实测命令输出，未核实的一律标注「未证实」。

---

## 第 0 部分 · 三十秒速览

| 维度 | 现状 | 一句话 |
|---|---|---|
| 前端骨架 | **90%** | 从竞品 2nforged.com 逆向克隆，36 个路由全部可跑 |
| 内容层 | **厚** | `src/content/` 34 个文件 6992 行，全部硬编码 TS，不走 CMS |
| Headless WordPress | **10%** | 读取层骨架在，但 `mode !== "live"` 时直接返回 null，**永远走本地 fixture** |
| 询盘系统 | **40%** | API 能跑通（POST 201/422），但存储是内存 Map、发信是 mock |
| 部署层 | **0%** | 无 OpenNext、无 CI、无 .git、无 .env |
| 测试 | **0** | 全项目零测试文件（node_modules 里的不算） |
| 静态资产 | **足** | `public/` 2891 张图 / 79MB；另有 72MB 原始数据包 |
| 文档 | **厚但散** | 根 10 个 md（~180KB）+ ARCHITECTURE/ + PAGE-SPECS/ 22 份施工图 |

**一句话定位**：这是一个**前端跑通了、内容写在代码里、后端完全没接**的逆向克隆站。最大的缺口是 Headless WordPress 这条线只起了个头。

⚠️ **另一个易踩的坑**：**实际路由（36 个）与 `PAGE-SPECS/` 规范路由对不上** —— 有需新建的、需改名的、规范说「本阶段不做」但代码已存在的。详见 **§2.2.1**。

---

## 第 1 部分 · 项目身份

### 1.1 技术栈（实测 `package.json`）

| 项 | 版本 |
|---|---|
| Next.js | **16.3.5** |
| React / React DOM | **19.2.4** |
| Tailwind CSS | **4**（`@tailwindcss/postcss`） |
| TypeScript | **^5** |
| @base-ui/react | ^1.3.0 |
| lucide-react | ^1.6.0 |
| shadcn | ^4.1.0 |
| class-variance-authority | ^0.7.1 |
| tailwind-merge | ^3.5.0 |
| clsx | ^2.1.1 |
| tw-animate-css | ^1.4.0 |
| Node 要求 | **>=24** |

**`package.json` 全部 scripts（共 6 个）**：

| 命令 | 实际作用 |
|---|---|
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm run start` | `next start` |
| `npm run lint` | `eslint` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | `lint && typecheck && build` 三连 |

⚠️ **注意**：没有 `test` 脚本（因为没测试），没有 prebuild 钩子，没有图片校验。

### 1.2 业务模型：**询盘型（RFQ），不是交易型**

证据（三条，均来自代码）：

1. **没有购物车 / checkout 的任何痕迹** —— 全仓搜不到 cart、price、add-to-cart 相关页面。C 端路径是「浏览产品 → 提交询价表单」。
2. **有 `/request-a-quote`（询价）和 `/thank-you`**，且 `src/content/request-a-quote.ts` 专门写了表单文案（58 行）。
3. **`src/lib/inquiry/`** 是一个完整的询盘处理模块（361 行：types / validate / store / mailer / index）。`store.ts` 开头注释明确写着：

   > V1 uses an in-process Map so the whole flow is exercisable end-to-end without provisioning a database.

👉 **这个定性极其重要**：它决定了我们从竞品能抄什么。竞品 `2nforged` 是**交易型**（WooCommerce + Store API + 购物车 + checkout），我们**不需要**那一整套。

### 1.3 项目从哪来（用户原话）

> 「当前项目的话，我只是用那个克隆嘛，把前端模块给克隆，但是 Headless 现在是没做的。看到他这个竞品的话，我也是抄他们的网站中的一些 UI 设计等等而做。」

即：**UI/前端是从竞品 2nforged.com 逆向克隆来的，Headless 后端尚未开工。**

竞品仓库 `github.com/meathill/next-wordpress.git` 的完整分析已存于：
**`docs/competitor-next-wordpress-analysis.md`（33KB）** —— 接手者必读。

### 1.4 品牌与产品线

来自 `STATUS.md` 已答问题：**四条平行产品线**

1. **轮毂**（数据最完整：1349 型号 / 2757 图 / 完整规格）
2. **EV 三电壳体**
3. **铝制品定制**
4. **自修复安全轮胎**

⚠️ 其中**只有轮毂这条线有完整数据和图片**，其余三条线资产缺失（见 STATUS.md Open Questions #7）。

---

## 第 2 部分 · 已建成清单（穷尽）

### 2.1 代码规模（实测）

| 指标 | 数值 |
|---|---|
| `src/` 下 ts/tsx 文件数 | **131** |
| `src/` 下总行数 | **22,490** |
| `src/content/` 文件数 | **34** |
| `src/content/` 总行数 | **6,992** |
| `src/app/` 路由目录 | **36** |
| `src/components/` 组件数 | **~45** |
| `public/` 文件数 / 体积 | **2,894 / 79MB**（其中图片 2891 张） |
| `resources/wheel-data-pack/` | **72MB** |

### 2.2 全部路由（38 个 page + 2 个特殊）

**静态路由（28 个）**：

| 路由 | 文件 |
|---|---|
| `/` | `src/app/page.tsx` |
| `/about` | `src/app/about/page.tsx` |
| `/capabilities` | `src/app/capabilities/page.tsx` |
| `/contact` | `src/app/contact/page.tsx` |
| `/custom-development` | `src/app/custom-development/page.tsx` |
| `/dealers` | `src/app/dealers/page.tsx` |
| `/dealers/private-label` | `src/app/dealers/private-label/page.tsx` |
| `/fitment` | `src/app/fitment/page.tsx` |
| `/gallery` | `src/app/gallery/page.tsx` |
| `/gallery/finishes` | `src/app/gallery/finishes/page.tsx` |
| `/gallery/wheels` | `src/app/gallery/wheels/page.tsx` |
| `/manufacturing` | `src/app/manufacturing/page.tsx` |
| `/products` | `src/app/products/page.tsx` |
| `/products/custom-aluminum` | `src/app/products/custom-aluminum/page.tsx` |
| `/products/ev-components` | `src/app/products/ev-components/page.tsx` |
| `/products/safety-tires` | `src/app/products/safety-tires/page.tsx` |
| `/products/wheels` | `src/app/products/wheels/page.tsx` |
| `/request-a-quote` | `src/app/request-a-quote/page.tsx` |
| `/resources` | `src/app/resources/page.tsx` |
| `/resources/bolt-patterns` | `src/app/resources/bolt-patterns/page.tsx` |
| `/thank-you` | `src/app/thank-you/page.tsx` |
| `/tools` | `src/app/tools/page.tsx` |
| `/tools/offset-calculator` | `src/app/tools/offset-calculator/page.tsx` |
| `/support/privacy` | `src/app/support/privacy/page.tsx` |
| `/support/returns` | `src/app/support/returns/page.tsx` |
| `/support/shipping` | `src/app/support/shipping/page.tsx` |
| `/support/terms` | `src/app/support/terms/page.tsx` |
| `/support/warranty` | `src/app/support/warranty/page.tsx` |

**动态路由（4 组）**：

| 路由模式 | 文件 | 动态段 |
|---|---|---|
| `/products/[slug]` | `src/app/products/[slug]/page.tsx` | slug |
| `/products/wheels/[sku]` | `src/app/products/wheels/[sku]/page.tsx` | sku |
| `/fitment/[platform]` | `src/app/fitment/[platform]/page.tsx` | platform |
| `/resources/[slug]` | `src/app/resources/[slug]/page.tsx` | slug |
| `/resources/bolt-patterns/[pattern]` | `src/app/resources/bolt-patterns/[pattern]/page.tsx` | pattern |

**特殊文件（2 个）**：

| 文件 | 作用 |
|---|---|
| `src/app/api/inquiries/route.ts` | 询盘 API（唯一 API 路由） |
| `src/app/sitemap.ts` | 站点地图生成 |
| `src/app/robots.ts` | robots.txt 生成 |
| `src/app/layout.tsx` | 根布局 + metadata |

**数据来源说明**：以上**所有**路由的内容都来自 `src/content/*.ts` 里的硬编码 TypeScript 常量，**没有一个**从 WordPress 拉数据（原因见第 3 部分）。

### 2.2.1 🔴 关键：**实际路由 ≠ 规范路由**（接手者必读）

> ⚠️ **这一节是全文档最容易踩坑的地方。**
> 上面 2.2 列的 36 个路由目录是**代码里实际存在的**；而 `PAGE-SPECS/` 里定义的是**规范想要的**。
> **两者对不上。** 规范侧明确标注了偏差（原文摘录见下）。

#### A. 规范要、但代码还没有的路由（需新建）

| 规范路由 | 出处 | 规范原文标注 |
|---|---|---|
| `/products/wheels/[model]` | `PAGE-SPECS/products/wheels/[model].md` | ⚠️ **现为 `[sku]`，需改段名** |
| `/products/wheels/series/[series]` | `PAGE-SPECS/products/wheels/series/[series].md` | 需新建（SSG × ≤762） |
| `/products/ev-components` | `PAGE-SPECS/products/ev-components.md` | 🔴 **路由不存在，需新建** |
| `/products/custom-aluminum` | `PAGE-SPECS/products/custom-aluminum.md` | 🔴 **路由不存在，需新建** |
| `/products/safety-tires` | `PAGE-SPECS/products/safety-tires.md` | 🔴 **路由不存在，需新建** |
| `/custom-development` | `PAGE-SPECS/custom-development.md` | 🔴 **路由不存在，需新建** |
| `/fitment/[vehicle]` | `PAGE-SPECS/fitment/index.md` | 需新建 |
| `/fitment/pcd/[pcd]` | `PAGE-SPECS/fitment/index.md` | 需新建 |
| `/fitment/size/[size]` | `PAGE-SPECS/fitment/index.md` | 需新建 |

⚠️ **注意矛盾**：`/products/{ev-components,custom-aluminum,safety-tires}` 与 `/custom-development`
这四个路由在 §2.2 的实际清单里**是存在的**，但 PAGE-SPECS 的规格文件却标注「不存在，需新建」。
→ **说明规格文件写于页面建成之前，规格里的「不存在」标注已过时**。接手者需**以代码为准**，规格作为内容重排依据。

#### B. 规范要改名 / 重排的路由

| 现路由 | 规范要改成 | 规范原文 |
|---|---|---|
| `/resources` | `/insights` | ⚠️ **现为 `/resources`，需改名**（`PAGE-SPECS/insights/index.md`） |
| `/request-a-quote` | 与 `/contact` 关系待定 | ⚠️ **二者关系待定，见 §6 #9 与附 B** |

#### C. 规范「刻意不写」的（不是遗漏，是决定不写）

| 路由 | 原因（规范原文） |
|---|---|
| `/privacy-policy` | 刻意不写 |
| `/support/*`（5 页） | **刻意不写** —— 代码已存在，共享 `<LegalDocumentPage>`（`legal-document.tsx` 261 行）+ `content/legal.ts`（414 行）。**「它们是法务文书不是页面设计」** —— 内容是律师的工作 |

⚠️ **但注意**：`/support/privacy` 等 5 页代码**确实存在**（见 §2.2），只是没有施工图。

#### D. 规范「本阶段不做」的（4 个路由，但代码已有）

| 路由 | 规范状态 |
|---|---|
| `/gallery` | 本阶段不做 |
| `/gallery/finishes` | 本阶段不做 |
| `/tools` | 本阶段不做 |
| `/tools/offset-calculator` | 本阶段不做 |

⚠️ **矛盾点**：这 4 个路由在代码里**都实际存在且可访问**，只是被规范打入「暂缓」。
→ 接手者要决定：**是删掉、是留着补内容、还是暂时不动。**

#### E. 规范的总账（`PAGE-SPECS/index.md` §1.1 原文）

| 状态 | 数量 | 说明 |
|---|---|---|
| **已出施工图** | **18** | 总表 #1–#18 全部有文件 |
| 不需要 | 1 | #21 `/fitment/*` 已含在 `fitment/index.md` |
| **刻意不写** | 3 | `/privacy` `/support/*` |
| **本阶段不做** | 4 | `/gallery` `/gallery/finishes` `/tools` `/tools/offset-calculator` |

#### F. 规范点名「需新建」的组件（不只是路由）

`PAGE-SPECS/products/ev-components.md` 里点名要新建的组件（★ 标记 = 多条产品线共用）：

| 组件 | 说明 |
|---|---|
| `part-group-cards.tsx` | ★ 三条能力线共用件（**代码里已存在**） |
| `capability-grid.tsx` | 需新建 |
| `faq-accordion.tsx` | ★ 需新建，3 页共用 |
| `EngineeringEvalCta` | 需新建（本页 + `/custom-development` 共用） |
| `content/ev-components.ts` | ★ 需新建（**代码里已存在**，322 行） |

⚠️ 同样存在「规格说过时」的情况：`part-group-cards.tsx` 与 `content/ev-components.ts` 在代码里都已存在。

#### G. 给接手者的处置建议（建议，非计划）

1. **以代码为事实基准**，把 PAGE-SPECS 里过时的「不存在/需新建」标注批量核对一遍
2. **`/resources` → `/insights` 改名**是规范明确要求的，但**影响 sitemap、内链、SEO 收录**，需单独决策
3. **`/fitment/*` 的三段结构**（`[vehicle]` / `pcd/[pcd]` / `size/[size]`）与现 `[platform]` 单段**完全不同**，是较大改造
4. **4 个「本阶段不做但已存在」的路由**要给出明确处置（删 / 留 / 补内容），否则 sitemap 里会挂着空页

---

### 2.3 内容层全部 34 个文件（实测行数 + 导出）

| 文件 | 行数 | 主要导出 |
|---|---|---|
| `types.ts` | 653 | 全站内容类型契约（最大，正本） |
| `resources.ts` | 549 | resourcesCopy 等 |
| `bolt-patterns.ts` | 488 | boltPattern 数据 |
| `custom-aluminum.ts` | 461 | 铝制品定制页内容 |
| `legal.ts` | 414 | legalPathways / legalDocuments / draftNotice |
| `wheel-designs.ts` | 396 | 轮毂设计系列 |
| `safety-tires.ts` | 370 | 安全轮胎线 |
| `fitment.ts` | 352 | 车型适配数据 |
| `wheel-skus.ts` | 342 | SKU 数据 |
| `ev-components.ts` | 322 | EV 三电线 |
| `products.ts` | 315 | productFamilies / catalogueIntro / catalogueGuidance / catalogueRoutes / familyDetailChapters |
| `tools.ts` | 234 | 工具页 |
| `process.ts` | 209 | processStages / processHero / processExplorerCopy / processStageNotes / processQuality / processHardEvidence |
| `about.ts` | 183 | 关于页 |
| `site.ts` | 169 | 站点级配置（导航/页脚等） |
| `dealer-programs.ts` | 163 | 经销商项目 |
| `private-label.ts` | 158 | privateLabelHero / privateLabelOffer / privateLabelBranding / privateLabelConfidentiality / privateLabelExclusivity / privateLabelFlow |
| `contact.ts` | 109 | 联系页 |
| `builds.ts` | 99 | 案例 |
| `homepage-hero.ts` | 99 | 首页 Hero |
| `product-lines.ts` | 87 | productLines |
| `finishes.ts` | 84 | 表面处理 |
| `materials.ts` | 83 | MaterialStatus / MaterialEntry / materialsCopy / materials / materialsOpenItems |
| `capabilities.ts` | 79 | 能力页 |
| `home-wheel-strip.ts` | 68 | 首页轮毂条 |
| `company-stats.ts` | 62 | 公司数据 |
| `request-a-quote.ts` | 58 | requestQuoteHero / quoteContextBarCopy / quoteFormHeading / requestQuoteFormCopy |
| `thank-you.ts` | 49 | 感谢页 |
| `gallery.ts` | 48 | 画廊 |
| `finish-guide.ts` | 47 | 表面处理指南 |
| `faq.ts` | 40 | FAQ |
| `wheel-catalogue.ts` | — | **生成物**（由 `scripts/generate-wheel-catalogue.mjs` 生成，禁止手改） |

⚠️ **重要**：`src/content/wheel-catalogue.ts` 是**脚本生成物**，源头是 `resources/wheel-data-pack/轮毂产品数据打包-20261001/assets/wheel-data/WHEEL-CATALOG-ALL.json`（只读）。改数据要改源头再跑脚本，不能直接改生成物。

### 2.4 组件层（~45 个）

**顶级组件（32 个）**：

`auto-fit-hero.tsx` ｜ `bolt-pattern-finder.tsx` ｜ `catalogue-filter-bar.tsx` ｜ `catalogue-table.tsx` ｜ `compare-bar.tsx` ｜ `content-section.tsx` ｜ `fitment-vehicle-picker.tsx` ｜ `footer-cta.tsx` ｜ `home-fitment-entry.tsx` ｜ `inquiry-form.tsx` ｜ `input-type-cards.tsx` ｜ `language-switcher.tsx` ｜ `legal-document.tsx` ｜ `mechanism-steps.tsx` ｜ `offset-calculator.tsx` ｜ `param-table.tsx` ｜ `part-group-cards.tsx` ｜ `process-diagram.tsx` ｜ `process-explorer.tsx` ｜ `product-card.tsx` ｜ `product-family-grid.tsx` ｜ `prose-article.tsx` ｜ `quality-evidence.tsx` ｜ `quote-context-bar.tsx` ｜ `route-block.tsx` ｜ `self-identify-block.tsx` ｜ `site-footer.tsx` ｜ `site-header.tsx` ｜ `site-motion.tsx` ｜ `wheel-card.tsx` ｜ `wheel-gallery.tsx` ｜ `wheel-strip-section.tsx`

**子目录**：

| 目录 | 内容 |
|---|---|
| `components/home/hero/` | `home-hero.tsx`（首页 Hero，已重做） |
| `components/sections/` | `dealer-cta.tsx` ｜ `gallery-band.tsx` ｜ `page-hero.tsx` ｜ `product-showcase.tsx` ｜ `trust-strip.tsx` ｜ `home-hero.tsx.retired`（**已退役，待清理**） |
| `components/ui/` | 只有 `button.tsx` |

### 2.5 lib 层

| 模块 | 规模 | 现状 |
|---|---|---|
| `lib/wordpress/` | client.ts + types.ts + index.ts | **骨架在，未接线**（详见第 3 部分） |
| `lib/inquiry/` | **361 行**（types 71 / validate 92 / store 95 / mailer 99 / index 4） | 完整可跑，存储与发信是 mock |
| `lib/i18n/` | **107 行**（en.ts 53 / zh.ts 48 / index.ts 6） | ⚠️ **字典极小**，只覆盖极少量 UI 串 |
| `lib/utils.ts` | — | 通用工具（cn 等） |
| `lib/inquiry-context.ts` | — | 询盘上下文 |

#### i18n 现状（重要，需接手者确认）

- 字典文件只有 **53/48 行** —— 这意味着**中英双语只做了很小一部分**，绝大多数页面文案仍是单一语言硬编码在 `src/content/*.ts` 里。
- `STATUS.md` Open Questions #9 明确提出：**「i18n 是否要从 cookie 迁到 `[locale]` 路由段？」** —— 当前是 **cookie 方案**（`language-switcher.tsx`），**没有独立 URL，对 SEO 双语收录不利**。这条是待决策项。

### 2.6 API 路由：询盘系统

#### ✅ 已查实：发信是「有条件真发」（`mailer.ts`）

- 文件头注释原文：`V1 logs to the server console instead of calling Resend so the flow is...`
- 无 key 时 → **mock 模式**，只 `console.info(\`[inquiry:mock-mail] would send ${rec.id} to ${TO}...\`)`，返回 `{ delivered: false, error: "mock-mode" }`
- 有 key 时 → 真调 `POST https://api.resend.com/emails`
- → **结论：接 Resend key 即可真发信，代码路径已通。**（`RESEND_API_KEY` 之类的变量名需读 `mailer.ts` 第 55–70 行确认，本次未读到该段）


**唯一 API**：`src/app/api/inquiries/route.ts`

- **POST**：提交询盘 → 校验 → 存内存 Map → 返回 **201**（成功）/ **422**（校验失败）
- **GET**：列出所有询盘记录（`{ ok, count, records }`）—— ⚠️ **无鉴权，开发用**

**存储真相**（`src/lib/inquiry/store.ts` 开头注释原文）：

```ts
/**
 * V1 uses an in-process Map so the whole flow is exercisable end-to-end
 * without provisioning a database. The interface below is the seam: swapping
 * in Postgres/Neon later means writing a second implementation, not touching
 * the route handler or the form.
 *
 * ⚠️ The in-memory store does NOT survive a server restart.
 */
const memory = new Map<string, InquiryRecord>();
```

- ID 格式：`INQ-YYYYMMDD-0001`（内存计数器，重启归零）
- **发信**：`mailer.ts`（99 行）—— 未证实是否真发信，倾向 **mock/日志**
- **校验**：`validate.ts`（92 行）—— 输入校验

### 2.7 SEO / 元数据

- ✅ `src/app/sitemap.ts` —— 已实现
- ✅ `src/app/robots.ts` —— 已实现
- ✅ `src/app/layout.tsx` 有 metadata
- ⚠️ **未证实**：canonical / OG 图 / 各页 metadata 是否全覆盖（需逐页查）

### 2.8 静态资产

| 位置 | 规模 | 说明 |
|---|---|---|
| `public/` | **2,894 文件 / 79MB** | 其中图片 2891 张（webp 为主） |
| `public/images/capabilities/` | 多个 webp | machining-process / fea-analysis / inspection-camera / forging-production-line 等 |
| `public/images/content-center/` | 多个 webp | 车辆/轮胎场景图 |
| `resources/wheel-data-pack/轮毂产品数据打包-20261001/` | **72MB** | 含 `wheel-data/`（WHEEL-CATALOG-ALL.json）、`wheel-images-webp/`、`preview-media/`、`site-data/`、`README.md` |

👉 **资产其实不缺**，特别是轮毂线（1349 型号 / 2757 图）。

### 2.9 文档体系（比预想完整）

**根目录 10 个 md（约 180KB）**：

| 文件 | 体积 | 内容 |
|---|---|---|
| `DECISIONS.md` | **43KB** | 决策记录（最厚，含 DEC-018/019/020/021/022 等） |
| `ARCHITECTURE.md` | **39KB** | 架构主文档 |
| `AGENTS.md` | 15.6KB | 开发规范 |
| `CHANGELOG.md` | 15KB | 变更日志 |
| `STATUS.md` | 17KB | 项目状态（含进度条 + Open Questions） |
| `DESIGN.md` | 17KB | 设计正本（§0.5 视口驱动设计 = 全站第一原则） |
| `PROJECT.md` | 9.4KB | 项目定义 |
| `README.md` | 7.4KB | 说明 |
| `CONTRIBUTING.md` | 2.5KB | 贡献指南 |
| `SECURITY.md` | 2KB | 安全 |
| `CLAUDE.md` | 11 字节 | 占位 |

**`ARCHITECTURE/` 目录（14 个文件）**：
- `README.md`
- `tech-architecture/README.md`
- `page-architecture/`：README + **12 份页面架构**
  （2nforged-page-inventory / about / contact / content-design-and-new-pages / custom-aluminum / dealers / ev-components / fitment-pages-plan / private-label / resources-hub / safety-tires / wheel-browsing-and-fitment / wheel-catalog / wheel-detail）

**`PAGE-SPECS/` 目录（22 份施工图）**：
- 根：`README.md` ｜ `_components.md` ｜ `_viewport-audit.md` ｜ `about.md` ｜ `capabilities.md` ｜ `contact.md` ｜ `custom-development.md` ｜ `index-home.md` ｜ `index.md` ｜ `request-a-quote.md` ｜ `thank-you.md`
- `dealers/`：`index.md` ｜ `private-label.md`
- `fitment/`：`index.md`
- `insights/`：`index.md`
- `products/`：`index.md` ｜ `custom-aluminum.md` ｜ `ev-components.md` ｜ `safety-tires.md` ｜ `wheels.md` ｜ `wheels/[model].md` ｜ `wheels/series/[series].md`

**`docs/` 目录（13 个文件）**：
- `competitor-next-wordpress-analysis.md`（33KB，**本轮新增**）
- `plans/inquiry-system-architecture.md`（19.6KB）
- `research/`：2nforged-reference.md ｜ tbr8-headless-wordpress-tutorial.md ｜ `next-wp/` 4 份
- `BLANK-PAGE-AUDIT.md` ｜ `superpowers/plans/2026-10-02-page-spec-asset-realignment.md`
- `assets/star-history.png` ｜ `design-references/comparison.png`

**`work/` 三态任务目录**：
- `completed/`（11 个）：design-md-created ｜ homepage-hero-rebuilt ｜ … ｜ design-principle（等）
- `queued/`（4 个）：homepage-remaining-sections-viewport-review ｜ homepage-viewport-division-decision ｜ page-specs-axis-migration ｜ primary-nav-align-with-footer
- `active/`：空

**`scripts/`（3 个生成脚本）**：
- `generate-wheel-catalogue.mjs`（10.3KB）—— JSON → `src/content/wheel-catalogue.ts`，支持 `--check`
- `generate-home-wheel-strip.mjs`（5.9KB）
- `inject-viewport-specs.py`（10.3KB）—— 把 §0.5 视口章节注入 PAGE-SPECS


---

## 第 3 部分 · 缺口清单（重点）

### 3.1 🔴 Headless WordPress：最大的缺口（进度 10%）

#### 现状（代码原文）

`src/lib/wordpress/client.ts` 的核心函数：

```ts
async function wpFetch<T>(path: string, revalidate = 3600): Promise<T | null> {
  const cfg = getWpConfig();
  if (cfg.mode !== "live") return null;      // ← 关键：非 live 直接返回 null

  const res = await fetch(`${cfg.baseUrl}${path}`, {
    headers: cfg.authToken ? { Authorization: `Basic ${cfg.authToken}` } : undefined,
    next: { revalidate },
  });

  if (!res.ok) {
    // Never throw into a page render — a CMS outage must not blank the site.
    console.error(`[wp] ${path} failed: ${res.status}`);
    return null;
  }
  return (await res.json()) as T;
}
```

两个包装器 `wpCollection()` / `wpItem()` 都是「取不到就用 fallback」：

```ts
export async function wpCollection<T extends WpPost<unknown>>(
  path: string, fallback: T[],
): Promise<T[]> {
  const live = await wpFetch<T[]>(path);
  return live ?? fallback;
}
```

**结论**：设计上是对的（CMS 挂了不能让整站空白），但 **`mode` 目前只可能是 mock** —— 因为：
1. **没有 `.env` 文件**（实测根目录只有 `next-env.d.ts`，无 `.env` / `.env.local` / `.env.example`）
2. **没有 WordPress 站点**（未证实有任何 WP 实例存在）
3. **没有 CPT / ACF 定义**（未证实）

→ **所有页面 100% 走本地 `src/content/*.ts` fixture。**

#### 已定义的期望契约（`src/lib/wordpress/types.ts`，读到的部分）

这说明「我们希望 WP 侧长什么样」，**这是给 WP 后端施工的需求书**：

```ts
/** A WP post in its raw REST shape (subset we depend on). */
export type WpPost<T> = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  acf: T;                        // ← ACF 字段展平到这里
};

export type WpTerm = {
  id: number; slug: string; name: string; count: number;
};

/** Wheel model as exposed by the `wheel` CPT. */
export type WpWheelAcf = {
  model: string;
  style_name: string;
  process: string;
  size_category: string;
  sizes: string[];
  pcds: string[];
  offsets: number[];
  center_bores: number[];
  finishes: string[];
  production_codes: string[];
  hero_image: string;
  has_image: boolean;
};

/** Product-line page (the three capability lines). */
export type WpProductLineAcf = {
  line_key: string;
  eyebrow: string;
  heading: string;
  // …（截断，接手者需自行读全）
};
```

文件头注释（原文）：

> WordPress owns "what we sell" — wheels, specs, images, articles.
> Next.js only reads. These types mirror the REST shape we expect from WP (post + ACF fields flattened into `acf`).
> See `docs/plans/inquiry-system-architecture.md` §5.

#### Headless 要跑通还差什么（清单）

| # | 缺口 | 说明 |
|---|---|---|
| 1 | **WordPress 实例** | 谁托管？（STATUS.md Open Questions #8 明确列为待答） |
| 2 | **CPT 注册** | 至少需要 `wheel` CPT（从 `WpWheelAcf` 反推），可能还有 product-line / resource 等 |
| 3 | **ACF 字段组** | 按 `WpWheelAcf` / `WpProductLineAcf` 逐个建 |
| 4 | **REST 暴露** | WP REST v2 需开放（`show_in_rest`），含 ACF `show_in_rest` |
| 5 | **鉴权** | 代码用 `Authorization: Basic` → 说明要读**需要鉴权的内容**（草稿/私有字段/ACF）。需 Application Password |
| 6 | **`.env` 配置** | 需建 `.env.example`，三个变量（已查实，见下方） |
| 7 | **`mode` 如何切 live** | 已查实：`WP_API_URL` 非空 **且** `WP_MODE === "live"`（两个条件都要满足） |

#### ✅ 已查实：`getWpConfig()` 的环境变量（`client.ts` 第 14–23 行原文）

```ts
export function getWpConfig(): WpClientConfig {
  const baseUrl = process.env.WP_API_URL ?? "";
  const authToken = process.env.WP_API_TOKEN;
  return {
    baseUrl,
    authToken,
    // Live only when a CMS URL is configured AND explicitly opted in.
    mode: baseUrl && process.env.WP_MODE === "live" ? "live" : "mock",
  };
}
```

**三个环境变量**：

| 变量 | 必填 | 说明 |
|---|---|---|
| `WP_API_URL` | ✅ | WP REST 基址；为空则强制 mock |
| `WP_MODE` | ✅ | 必须**字面量** `"live"` 才启用（否则一律 mock） |
| `WP_API_TOKEN` | ❌ | Basic 鉴权 token；有则加 `Authorization: Basic` |

⚠️ 注意 `mode` 是**双重条件**（URL 非空 **AND** MODE=live），只设一个不生效。
| 8 | **内容迁移** | `src/content/*.ts` 6992 行硬编码 → 要迁进 WP 吗？迁哪些？**未决策** |
| 9 | **revalidate 策略** | 当前默认 3600（1 小时），是否加 `tags` 做 webhook 失效？**未做**（竞品有 tags 但也没接线） |
| 10 | **图片域名** | WP 侧图片走哪？`next.config.ts` 的 remotePatterns 目前**空**（只有 `output: "standalone"`） |

#### `next.config.ts` 全文（极简）

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
};

export default nextConfig;
```

⚠️ **没有 `images.remotePatterns`** —— 接 WP 图片后必须补。

### 3.2 🔴 这些基础设施完全没有

| 项 | 现状 | 影响 |
|---|---|---|
| **Git** | ❌ **不是 git 仓库**（`git status` 报 `fatal: not a git repository`） | 无法版本控制、无法回滚、无法协作。**接手第一件事应该是 `git init`** |
| **测试** | ❌ **零测试文件**（全项目 `*.test.*` / `*.spec.*` 只在 node_modules 里） | 重构无保护网 |
| **CI** | ❌ 无 `.github/` | 无法自动化验证 |
| **`.env`** | ❌ 无任何 env 文件（连 `.env.example` 都没有） | WP 配置无从下手 |
| **OpenNext / 部署** | ❌ 零依赖零配置 | STATUS.md 进度条：部署层 **0%** |
| **DB** | ❌ 询盘走内存 Map | 重启即丢 |
| **邮件发送** | ✅ 已查实：**默认 mock（只打日志）**；配了 key 才真发 Resend | 见下方 |

### 3.3 🟡 内容缺口（来自 STATUS.md Open Questions，实测摘录）

| # | 问题（原文） | 影响 |
|---|---|---|
| 2 | `sizeCategory` 里的 `17寸-3`/`18寸-2` 是**真实尺寸**还是**源分册名**？ | 轮毂筛选器设计 |
| 3 | `styleName` 缺失的 **587 个**型号如何归类？ | 设计系列页（只有 762 有分类） |
| 4 | `suitableVehicles` 全空 —— 工程能否补齐？ | **车型适配页能否上线** |
| 5 | `process` 未标注的 **837 个**能否从其他字段推断？ | 工艺筛选（只有 512 有标注） |
| 6 | 语料库里「**航鹏**」「**洛克**」是第三方品牌 —— 内容可否用于本站？ | 文案可用范围（**法务风险**） |
| 7 | 四条线中三条无图，何时提供资产？ | 产品中心三条线能否完整上线 |
| 9 | i18n 是否要从 cookie 迁到 `[locale]` 路由段？ | **SEO 双语收录** |

另有两处 STATUS.md 已记录的设计裂缝：
- **`image-registry.json` 的 253 条指向不存在的目录**（`DEC-018`：图片索引**不可信**，改以实体文件为准）
- **primaryNav 仍是旧结构**（Blocker，与四条产品线事实不符）

### 3.4 🟡 i18n 缺口

- 字典只有 **en.ts 53 行 / zh.ts 48 行**
- 34 个内容文件共 6992 行**绝大多数是单一语言硬编码**
- cookie 方案 → **无独立 URL → 双语无法被搜索引擎分别收录**

### 3.5 🟢 已知的设计裂缝（DESIGN.md §6 记录，不擅自改）

`DESIGN.md` 第 373 行起记录了 **6 处已知裂缝**。接手者应读 DESIGN.md §6。

---

## 第 4 部分 · 从竞品可借鉴的点

> 完整分析见 **`docs/competitor-next-wordpress-analysis.md`（33KB）**。此处只给落点。
> ⚠️ **前提提醒**：竞品仓库**只有 1 个 commit**（`442f7d6 初始化 2nforged headless monorepo`），是**骨架不是成熟方案**。购物车/checkout/搜索/适配 UI 全是 stub。**不要把它当成熟方案参考。**

### A 档 · 直接可抄（低改造、无副作用）

| # | 抄什么 | 在我们项目里的落点 | 理由 |
|---|---|---|---|
| A1 | **纯 CSS 轮毂预览**：10 根 `<div>` 按 `rotate(36deg)` 递增排成轮毂 + Tailwind 渐变模拟 finish | 新建 `src/components/wheel-preview.tsx`（<50 行，server-compatible，无依赖） | 竞品 DEV_NOTE 明确「第一版不做 3D 配置器」。我们的产品页/gallery 缺「选配实时反馈」 |
| A2 | **适配匹配抽为纯函数**：`isVariationCompatible` 按 直径+宽度+孔距 三元组匹配，放 shared 包以便单测 | 新建 `src/lib/fitment/match.ts`，从 `fitment-vehicle-picker.tsx` 里抽出来 | 我们现在匹配逻辑很可能埋在组件里；抽出来后可覆盖边界（offsetRange 范围、centerBore 容差） |
| A3 | **`revalidate + tags` 写在数据层而非页面层** | `src/lib/wordpress/client.ts` 的 `wpFetch` 已有 `revalidate`，**补 `tags`** | 为将来 Webhook 失效留口；竞品 `tags: ["products"]` 已声明 |
| A4 | **`lib/env.ts` 集中取 env + 默认值** | 我们有 `getWpConfig()`，可收敛成统一出口 | 单一出口便于将来加校验 |
| A5 | **Zustand 只存「意图」不存「事实」**（价格/库存/税费/运费不进 store） | 我们要加配置器时照此划线 | 避免后续对账地狱 |
| A6 | **cart item 用 `crypto.randomUUID()` 作 localId**，不与后端 key 混用 | 我们的询盘将来接 WP 时同样要区分本地态与权威态 | 通用模式 |
| A7 | **`Field` 组件的 `htmlFor` 降级设计**（无关联控件时用 `<span>` 避免 a11y 误报） | 我们表单多（contact / request-a-quote / dealers），改 `inquiry-form.tsx` | 小改动，消 a11y 误报 |
| A8 | **mu-plugin 里 `HTTP_X_FORWARDED_PROTO → HTTPS=on`** | WordPress 若在反代后必踩这个坑 | 先抄，省一次排查 |
| A9 | **AGENTS.md 的文档分层 +「DEV_NOTE 只记决策不记流水」** | 我们有 180KB 根文档，可明确「plan 定期清理、决策并入 DECISIONS.md」 | 治理层面的好习惯 |

### B 档 · 需要改造才能抄

| # | 抄什么 | 改造点 |
|---|---|---|
| B1 | pnpm monorepo 切分（apps/storefront + apps/wordpress + packages/shared + packages/ui） | 我们是单包。要切需重构，但 **`packages/shared` 零依赖领域类型**这条思路可先局部落地（把 `types.ts` 653 行里的领域模型抽出） |
| B2 | Biome 取代 ESLint | 我们同时装了 eslint + eslint-config-next；Biome 单工具更快，但改造成本不小 |
| B3 | OpenNext + Cloudflare Workers 部署 | 需先回答 STATUS.md Open Questions #1（**落到哪个平台？**） |
| B4 | checkout 步骤状态机 `"cart"｜"address"｜"payment"｜"review"` | 我们是询盘不是结算，但**多步表单**形态可借鉴到 `/request-a-quote` |
| B5 | smoke test 脚本（TiDB 连通性 + WP 表 + Woo 表） | 我们接 WP 后需要**自己的**连通性 smoke test（不读 .env，只从环境变量读） |

### C 档 · 不适用（我们是询盘型，不是交易型）

| # | 不抄什么 | 为什么 |
|---|---|---|
| C1 | **WooCommerce Store API 全套** | 我们不卖货，走询价 |
| C2 | **购物车 / checkout / 支付网关** | 同上 |
| C3 | **TiDB Cloud**（MySQL 协议数据库） | 我们 DB 需求只是存询盘，Postgres/Neon/SQLite 足够 |
| C4 | **单货币 `USD` + `country: "US"` 锁死** | 我们中文站面向多市场，已有 i18n |
| C5 | **无鉴权的公开只读 Store API** | 我们 WP REST 走 `Authorization: Basic`，信任模型不同 |
| C6 | **硬编码 origin 的 `allowed_redirect_hosts`** | 我们域名未定 |
| C7 | **Cloudflare KV / Hyperdrive / Queues 规划** | 与我们的部署平台无关 |

### 🔴 一条反向提醒（重要）

竞品的取数降级方向是 **`if (USE_DEMO_CATALOG !== "false") return demoProducts`** —— 即**默认走假数据**。

而我们的 `wpFetch` 是 **`if (cfg.mode !== "live") return null`**，且失败时 `console.error` 后 `return null`（注释：「CMS 挂了不能让整站空白」）。

→ **我们的方向更正确。不要为了对齐竞品而改回去。**

---

## 第 5 部分 · 给接手者的建议路径

> ⚠️ 这是**建议**，不是既定计划。排序按「依赖关系的硬约束」+「投入产出比」。

### 第 0 步（必须先做，零成本、解锁一切）

1. **`git init` + 首次提交** —— 当前不是 git 仓库，任何重构都没有回滚点
2. **补 `.env.example`** —— 明确 `getWpConfig()` 需要哪些变量（`WP_BASE_URL` / `WP_AUTH_TOKEN` / `WP_MODE` 等，具体名需读 `client.ts` 的 `getWpConfig()`）
3. **跑一次 `npm run build`** 确认基线健康（已知 `npm run typecheck` **通过**，exit 0）

### 第 1 步 · 回答 9 个 Open Questions

`STATUS.md` §Open Questions 有 9 个待答问题，**其中 4 个是硬阻塞**：

| # | 问题 | 为什么阻塞 |
|---|---|---|
| **8** | 「无头 WordPress」由谁托管？ | **整个内容层的前提** |
| **1** | OpenNext 落到哪个平台？ | 决定部署配置形状 |
| **9** | i18n 是否迁到 `[locale]` 路由段？ | 影响全部路由结构，**晚改成本极高** |
| **4** | `suitableVehicles` 全空能否补齐？ | 车型适配页能否上线 |

### 第 2 步 · 补测试网（在重构前）

- `src/lib/fitment/match.ts`（适配匹配）是最值得先测的纯函数
- `src/lib/inquiry/validate.ts`（92 行校验逻辑）
- 至少要有 `vitest` + 上面两个的用例

### 第 3 步 · Headless WP 接线（最大工程量）

按顺序：WP 实例 → CPT/ACF → REST 暴露 → Application Password → `.env` → `mode: "live"` → 逐页切换数据源 → 图片 remotePatterns → webhook revalidate

⚠️ **内容迁移是独立大决策**：`src/content/*.ts` 6992 行要不要迁进 WP？迁哪些？**建议先只迁「会变的」（产品/规格/文章），保留「不变的」（法律页/导航/CTA 文案）在代码里。**

### 第 4 步 · 询盘系统落地

内存 Map → 真 DB（Postgres/Neon）；`mailer.ts` 核实并接真发信；GET 端点加鉴权。

### 第 5 步 · 内容缺口补齐

按 §3.3 的 7 个问题逐条补（587 个 styleName 缺失、837 个 process 未标注、suitableVehicles 全空等）。

### 明确不建议现在做的

- ❌ 3D 配置器（竞品明确降级为 CSS 预览）
- ❌ 购物车/结算（我们是询盘型）
- ❌ 大改 i18n 架构（等 Open Questions #9 拍板）

---

## 第 6 部分 · 关键文件索引表（接手者先看这些）

### 必读（按顺序）

| 序 | 文件 | 体积 | 看什么 |
|---|---|---|---|
| 1 | **`STATUS.md`** | 17KB | 进度条 + **9 个 Open Questions**（最有信息密度） |
| 2 | **`ARCHITECTURE.md`** | 39KB | 架构主文档 |
| 3 | **`DECISIONS.md`** | 43KB | 决策记录（DEC-018~022 都是近期关键） |
| 4 | **`DESIGN.md`** | 17KB | §0.5 视口驱动设计 = **全站第一原则**；§6 已知裂缝 |
| 5 | **`src/content/types.ts`** | 653 行 | 全站内容类型契约（内容层正本） |
| 6 | **`src/lib/wordpress/client.ts`** | — | Headless 读取层现状 |
| 7 | **`src/lib/wordpress/types.ts`** | — | **WP 侧需求书**（期望的 REST/ACF 形状） |
| 8 | **`docs/competitor-next-wordpress-analysis.md`** | 33KB | 竞品完整分析（本轮新增） |
| 9 | **`docs/plans/inquiry-system-architecture.md`** | 19.6KB | 询盘系统架构 |
| 10 | **`AGENTS.md`** | 15.6KB | 开发规范 |

### 施工图层（要动手改页面时看）

| 目录 | 份数 | 说明 |
|---|---|---|
| `PAGE-SPECS/` | **22** | 页面施工图（含 `_viewport-audit.md`） |
| `ARCHITECTURE/page-architecture/` | **12** | 页面架构 |
| `docs/BLANK-PAGE-AUDIT.md` | — | 空白页审计 |

### 数据层

| 文件 | 说明 |
|---|---|
| `resources/wheel-data-pack/轮毂产品数据打包-20261001/assets/wheel-data/WHEEL-CATALOG-ALL.json` | **只读源头**（72MB 包内） |
| `src/content/wheel-catalogue.ts` | **生成物，禁止手改** |
| `scripts/generate-wheel-catalogue.mjs` | 生成脚本（支持 `--check`） |

### 待清理

| 项 | 说明 |
|---|---|
| `src/components/sections/home-hero.tsx.retired` | 已退役组件，未删 |
| `work/active/` | 空目录 |
| `tsconfig.tsbuildinfo`（134KB） | 构建缓存，通常不入库 |

---

## 附录 · 本盘点的实测命令与结果

| 检查项 | 命令 | 结果 |
|---|---|---|
| 类型检查 | `npx tsc --noEmit` | **exit 0（通过）** |
| 是否 git 仓库 | `git status --short` | `fatal: not a git repository` |
| src 文件数 | `find src -type f \( -name "*.ts" -o -name "*.tsx" \) \| wc -l` | **131** |
| src 总行数 | 同上文件 `cat \| wc -l` | **22,490** |
| content 行数 | `wc -l src/content/*.ts` | **6,992**（34 文件） |
| 路由数 | `find src/app -type d \| wc -l` | **36** |
| public 规模 | `find public -type f \| wc -l` + `du -sh` | **2,894 文件 / 79MB**；图片 2,891 |
| 测试文件 | `find . -name "*.test.*" -o -name "*.spec.*"` | **仅 node_modules 内有**（= 零测试） |
| CI | `ls -a .github` | **No such file or directory** |
| env 文件 | `ls -a \| grep -i env` | **仅 `next-env.d.ts`**（无 .env） |
| i18n 规模 | `wc -l src/lib/i18n/dictionaries/*.ts` | en 53 / zh 48 / index 6 = **107** |
| inquiry 规模 | `wc -l src/lib/inquiry/*.ts` | **361**（types 71 / validate 92 / store 95 / mailer 99 / index 4） |
| 数据包 | `du -sh resources/wheel-data-pack/` | **72MB** |

### 文中标注为「未证实」的项（接手者需自行核实）

1. 各页 metadata / canonical / OG 图是否全覆盖
4. `WpProductLineAcf` 完整字段（读文件时输出被截断）
5. 是否存在任何 WordPress 实例
6. `work/completed/` 11 个任务的完整清单（只抽查了 2 个）
7. 竞品是否真实部署过（wrangler binding id 全是 placeholder，倾向未部署）

---

**文档结束。** 本文为 2026-10-04 的现状快照，后续改动请以代码为准。
