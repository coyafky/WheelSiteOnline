# /products 收尾：8 处硬编码字面量 + DealerCta 全站字典化

- **状态**：进行中
- **日期**：2026-10-11
- **前置**：`work/active/2026-10-11-product-lines-catalogue-in-wp.md`（已把七块搬进 WP）

## 问题

`/products` 的 WP 托管部分已中文化，但**页面自身的 JSX 字面量**与 **`DealerCta` 共享组件**仍是英文：

### A. `/products` 的 8 处硬编码字面量
| 行 | 字符串 | 性质 |
|---:|---|---|
| 82 | `Four product lines` | section-B eyebrow |
| 87 | `Four lines, one factory` | 区块标题 |
| 90 | `Wheels, EV components, custom aluminum and self-healing tires — …` | 区块 lede |
| 208 | `Request a quote` | 按钮 |
| 212 | `Fitment resources` | 链接文案 |
| 243 | `Keep exploring` | eyebrow |
| 248 | `Related resources` | 区块标题 |
| 287 | `Related resources` 区块内的 eyebrow | — |
| 292 | `Ordering questions, answered` | FAQ 区块标题 |
| 295 | `The questions dealers ask before the first order. If yours is not here, ask us directly — we would rather answer it early than discover it at order stage.` | FAQ 区块 lede |

（另 `request-a-quote` 区块的按钮文案也在其中）

### B. `DealerCta` 共享组件
`src/components/sections/dealer-cta.tsx` 里另有 4 处英文（`Enquiries` / `title` 默认值 / `body` 默认值 / `Request a quote`），
**被 ~17 个页面调用** → 修它一次，`/zh` 下博客 / 工具 / insights / fitment / gallery / dealers / legal 全部一起受益。

**用户已拍板：一次改全站 DealerCta**（不是只给 /products 传参）。

## 关键设计决定

### 为什么走「字典」而不是「WP」
| 内容 | 归属 | 理由 |
|---|---|---|
| 页面区块标签、按钮、eyebrow、区块标题/lede、FAQ 区块标题 | **`src/lib/i18n/dictionaries/*`** | 它们是 **UI chrome**，不是 CMS 内容。`en.ts` 文件头明确写着「This file holds CHROME text only. Page body copy lives in `src/content/*`」 |
| `DealerCta` 的 4 处 | **字典** | 共享组件，跨页复用，正是 chrome 的定义 |
| 七块业务正文（intro/guidance/skuCallout/routes/fitmentSupport/resourceLinks/faqs） | **WP**（上一轮已完成） | 运营要能改的业务文案 |

⚠️ **不要把 8 处塞进 WP** —— 那会让运营在后台看到一堆不该编辑的界面标签。

### 现有可复用资产
- **`cta.requestQuote` 键已存在且四语言都有**（`en`=Request a Quote ｜ `zh`=获取报价 ｜ es/th 齐备）→ **直接复用，不要新建**
- 字典现有命名空间：`nav.*` / `footer.*` / `cta.*` / `common.*` / `a11y.*` / `breadcrumb.*` / `outline.*`
- `en.ts` 的**铁律**：**每个键必须在四种语言字典里都存在**（缺失会静默回落英文 → 运行时看不见）
- 服务端用 `getTranslator()`（`src/lib/i18n`），返回 `{ locale, t }`
- 客户端安全版：`createT(locale)`（`src/lib/i18n/use-t`）

## 执行计划

### 1. 扩字典（四个文件，键集合必须完全一致）
在 `en.ts` / `zh.ts` / `es.ts` / `th.ts` **同步新增**（建议新命名空间 `catalogue.*`，避免污染既有）：

```
catalogue.families.eyebrow            "Four product lines"
catalogue.families.heading            "Four lines, one factory"
catalogue.families.lede               "Wheels, EV components, custom aluminum and self-healing tires — engineered and manufactured across four parallel lines." (以实际 JSX 原文为准)
catalogue.skuCta                      (按钮文案 — 复用 cta.requestQuote 或新增)
catalogue.fitmentLink                 "Fitment resources"
catalogue.resources.eyebrow           "Keep exploring"
catalogue.resources.heading           "Related resources"
catalogue.faq.eyebrow                 "Questions"
catalogue.faq.heading                 "Ordering questions, answered"
catalogue.faq.lede                    "The questions dealers ask before the first order. …"
```

`DealerCta` 用（放 `cta.*` 下更合适）：
```
cta.enquiriesEyebrow                  "Enquiries"
cta.dealerTitle                       "Tell us what the part has to do"
cta.dealerBody                        "Send a drawing, a sample or a target specification. We will come back with a process route, a tooling position and pricing."
cta.requestQuote                      ← 已存在，直接复用
```

⚠️ **`es` / `th` 也要填**（不能只填 en/zh）—— 否则 `en.ts` 的「键必须四种语言都有」铁律被破坏，
且缺失会静默回落英文。译文要**专业、与既有术语表一致**（见下方术语表）。

### 2. 改 `/products`（`src/app/products/page.tsx`）
- 引入 `getTranslator()`，取 `t`
- 把 10 处字面量替换成 `{t("catalogue.…")}`
- ⚠️ **JSX 里有多行折行的字符串**（如 line 90 的 lede、line 295 的 FAQ lede）—— 替换时注意 JSX 会把换行折叠成空格，
  字典值应写成**单行**，与渲染结果的空白归一化一致

### 3. 改 `DealerCta`（`src/components/sections/dealer-cta.tsx`）
- 组件当前**无 `use client`**（是服务端组件）→ 可用 `await getTranslator()`
- 但 `title` / `body` 是 **props 默认值** → 默认值不能直接 await。改法：
  ```ts
  export async function DealerCta({ title, body, variant }: {...}) {
    const { t } = await getTranslator();
    const resolvedTitle = title ?? t("cta.dealerTitle");
    const resolvedBody = body ?? t("cta.dealerBody");
    ...
  }
  ```
  → **props 仍是可选**（调用方零改动），只有没传时才用字典默认值
- ⚠️ **改成 async 会影响 17 个调用点吗？** 服务端组件可以 async await 直接用，
  但要**确认没有调用点本身就是客户端组件**（若是，async 组件不能渲染 → 需降级方案）。
  **必须先 grep 所有 17 处的宿主文件是否含 `"use client"`**，这一步不能跳。
- `Enquiries` eyebrow 与 `Request a quote` 按钮同样走 `t()`
- ⚠️ **保留 `title`/`body` props 覆盖能力**（`custom-development` 与 `dealers/private-label` 在用）

### 4. 术语表（与既有词表保持一致，不要另创）
`轮毂` ｜ `电驱铝制壳体` ｜ `定制铝制品开发` ｜ `自密封轮胎` ｜ `锻造` ｜ `旋压成形` ｜
`适配` ｜ `表面处理` ｜ `轻改`（self-healing/safety tires 语境）｜ `获取报价` ｜ `询盘`

## 完成记录（2026-10-11）

### ✅ 已完成 —— `/zh/products` 现在**全中文**

| 文件 | 改动 |
|---|---|
| `src/lib/i18n/dictionaries/{en,zh,es,th}.ts` | 各 **+12 键**（11 个 `catalogue.*` / `cta.*` + 我补的 `catalogue.card.explore`）→ 四份均 **60 → 72 键** |
| `src/app/products/page.tsx` | 引入 `getTranslator()`，10 处 JSX 字面量改 `t(...)` |
| `src/components/sections/dealer-cta.tsx` | 改 `async`，`getTranslator()`；`title`/`body` 默认值改走 `?? t(...)`；eyebrow 与两个按钮文案走 `t()`（复用既有 `cta.requestQuote`） |
| **`src/components/family-card.tsx`** | **子 agent 漏掉的一处**（见下）—— 改 `async` + 卡片脚注走 `t("catalogue.card.explore")` |

### 🔴 我复核时抓到子 agent 漏掉的一处：`FamilyCard` 的 `Explore`

子 agent 报告「10 处字面量已全部替换」且自测通过。我独立复验 `/zh/products` 时，**仍扫出 4 个 `Explore`**（四张产品线卡片的脚注）。

- **归属**：`src/components/family-card.tsx:98`（**共享组件**，经 `product-family-grid.tsx` 用于 `/products`）
- **为什么漏**：子 agent 只 grep 了 `products/page.tsx` 本身的字面量，**没跟着渲染链下钻到它引用的组件**
- **这正是盘点文档 §3 那条自我限定（「5 处是下限不是上限」）第二次应验**
- 修法：`FamilyCard` 同为服务端组件 → 同样改 `async` + `t()`
- 补键：`catalogue.card.explore` = `了解详情` / `Explorar` / `ดูรายละเอียด`

📌 **纪律：验证「页面是否全中文」必须扫渲染后的 HTML，不能只看页面文件本身** —— 组件树的字面量不在页面文件里。

### 端到端实测（全部独立复跑）

| 检查 | 结果 |
|---|---|
| **四语言字典键集合一致** | `en/zh/es/th` **各 72 键**，missing=0 extra=0 → **PARITY PASS** |
| `/zh/products` 剩余英文 | 只剩 `Fenghuai`（品牌名）+ `English` / `Español`（语言切换器）→ **均正确，非缺口** |
| `/zh/products` 卡片脚注 | `了解详情` **×4**（四张卡全部命中） |
| `/products` | `Explore` ×4、CJK 只有 `中文`（语言下拉）→ **零泄漏** |
| **全站 DealerCta** | `/zh/insights` `/zh/tools` `/zh/fitment` `/zh/gallery/finishes` `/zh/dealers` **五页全部** `告诉我们这个零件要做到什么` ✅ |
| **覆盖保留** | `/custom-development` → `Bring us the drawing and the volume`（**字典默认值未出现**）｜`/dealers/private-label` → `Put your own name on the wheel` ✅ |

### 门禁（全绿）

`npm test` **42/42** ｜ `npx tsc --noEmit` exit 0 ｜ `npx eslint .` **0 error 0 warning** ｜ `npm run build` exit 0 ｜ 无 commit

### 命名与术语（新造，供词表升级）

`了解详情`（Explore，卡片脚注）｜`四条产品线，一座工厂`（Four lines, one factory）｜
`继续了解` / `相关资料`（Keep exploring / Related resources）｜`下单前的常见问题`（Ordering questions, answered）｜
`询盘`（Enquiries eyebrow，与既有 footer 用语一致）｜`获取报价`（复用既有 `cta.requestQuote`）

⚠️ **`es` / `th` 的 register 差异**（子 agent 报告，我认可）：既有 zh 字典用「你」，而 es/th 的 footer CTA 用敬语（`usted` / `คุณ`）→ **按各语言自身的主流 register 走，不强求统一**。

### 顺带发现（本轮范围外，未改）

首页有 3 处**同类英文兜底**（`?? "Explore ..."`）：
`product-showcase.tsx:47,87` ｜ `home/hero/hero-product-card.tsx:38`
→ 首页优先用 WP 供给的 `actionLabels`，**`??` 仅在缺数据时触发** → 不是当前缺口，但属同一模式，列入后续盘点。

### ⚠️ 一个环境观察

中途 `curl 3200` 曾返回 `000`（连接失败），但**下一次请求就 200** —— 是子 agent 按纪律重启 dev server 的窗口期，不是服务真挂。**判定「服务挂了」前应重试一次再下结论**。

## 非范围

- 不碰 WP 数据（七块已就位）
- 不动 `src/content/*.ts`
- 不给其余 26 个非 WP 页面接 locale（独立切片）
- 不 commit / push / deploy

## 纪律（历轮血泪）

1. **改 WP 数据或 tokens 后必须 `kill` dev server + `rm -rf .next` + 同参数重启** —— 内存缓存删磁盘清不掉
2. **改 CSS 令牌后要从「服务端实际吐出的 CSS」验证**，别信源码
3. **抽样动态路由从数据源取真实 slug**，别按命名规律猜
4. **子 agent 说「某机制不可行」时必须自己复现一遍再采信**
5. **`grep '@/content/'` 要区分「类型 import」与「文案 import」**
