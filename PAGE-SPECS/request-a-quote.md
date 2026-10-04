# `/request-a-quote` 页面规格（`/contact` 的「专注态」，不是独立页面）

> **路由**：`/request-a-quote`
> **目标文件**：`src/app/request-a-quote/page.tsx`（**方案 2 推荐**）—— ⚠️ 不存在
> **渲染**：**Node runtime（非静态导出）** —— 与 `/contact` 共用 `POST /api/inquiries`
> **数据**：`content/contact.ts` + `content/products.ts` + `content/site.ts` + `WheelModel` 类型
> **设计依据**：`contact-page.md` §5（合并建议）+ `PAGE-SPECS/contact.md` 附 B.1

---

## 0. 一句话

**`/request-a-quote` 不是第二个转化页 —— 它是 `/contact` 的「专注态（focused mode）」。**

同一个 `<InquiryForm>`，同一个后端，**只是外壳不同**：

```
/contact            通用入口    联系块 + 四线路由 + 起步清单（长）
        ↕ 同一 <InquiryForm> ↕
/request-a-quote    专注态      无联系块 · 无导航干扰 · 有「承接区」（短）
```

**🔴 三条不变量（本页存在的全部理由）**：

1. **只有一个表单组件、只有一个后端** —— `<InquiryForm>` 与 `POST /api/inquiries` 全站唯一，
   两页**不得各写一份**（竞品的结构性缺陷正是页面上留了两个表单）。
2. **独立 URL 的理由是「承接」不是「说服」** ——
   广告落地页/外链需要一个干净的转化 URL，且**必须承接从单品页过来的上下文**。
3. **与 `/contact` 的 SEO 分工必须写死** —— `title` / `h1` / `canonical` 不得互相竞争
   （见 §2① 与 §6 #1）。

**⚠️ 本页字段表、`InquiryContext`、后端三条纪律全部见 `PAGE-SPECS/contact.md`** ——
**本规格不重复定义，只写差异**。凡本文写「同 `/contact` ③」即为**逐字复用**该段。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §7 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/request-a-quote/page.tsx` 实测 **2 个 `<section>`**（2026-10-02）。

> 审计原文：`PageHero` → （条件）`QuoteContextBar` → ③ 表单 → ④ `DataNotice`。 规格要求四段（`PAGE-SPECS/request-a-quote.md` §1），实测 4 段。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 在这里能做什么？ | ① `PageHero` | `requestQuoteHero`（eyebrow `QUOTE` + H1 + 1 句） | 深色径向橙光 | `Go to the form` → `#quote-form-title` | 无 | ✅ 合规 |
| **02** | 你们已经知道什么？ | ② `QuoteContextBar`（条件） | 回显 model + 规格快照 | 浅色边框条 | 「换个型号」→ `/products/wheels` | 无 | ✅ 合规 |
| **03** | 我要填什么？ | ③ 表单 | `quoteFormHeading` + `InquiryForm` | 表单 | 提交表单 | 无 | ✅ 合规 |
| **04** | 我的数据怎么处理？ | ④ `DataNotice` | `quoteDataNotice` + `/contact` 文字链 | 纯文字 | 文字链 | 无 | ✅ 合规 |

**判定统计**：✅ 4 ｜ ⚠️ 拥挤 0 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 0

### 0.5.3 审计给出的处置

✅ 审计未对本页提出处置项。

### 0.5.4 高度预算与询盘整屏

| 项 | 要求 |
|---|---|
| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |
| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** （`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |
| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |

---

<!-- ASSET-REALIGNMENT-2026-10-02 -->
## 0.6 ★ 图片资产边界（2026-10-02）

本页是专注态询盘表单，保持无图片或极少装饰图的结构。具体产品视觉由上下文参数和来源页面承担，不能用内容中心九宫格分散表单注意力。

## 1. 页面骨架（四段式 = 五段式减一段）

**对照 `/contact` 的五段式**：删「④ 底部联系块」，把「② 起步清单」压成一行承接句，
其余不变。

| 序 | 内容块 | 必须性 | 与 `/contact` 的差异 | 就绪度 |
|---|---|---|---|---|
| ① | **专注态页头** | 必须有 | H1/eyebrow 换成报价口径；**去掉三段导语**，只留一句 | ✅ |
| ② | ★ **承接区** | 必须有 | **本页独有** —— 回显「你从哪来 + 已选了什么」 | ⚠️ 依赖单品页上下文（§4.2） |
| ③ | ★★ **表单** | 必须有 | **同一个 `<InquiryForm>`**，`context` 预填 | ⚠️ 同 `/contact` ③ |
| ④ | 极简合规尾 | 必须有 | 替代 `/contact` 的「④ 联系块」——**只放隐私说明 + 一个返回 `/contact` 的链接** | ⚠️ 隐私需律师 |

```
/request-a-quote?model=1081X&spec=15*7%204*100...
├── ① <QuoteHero>             eyebrow + H1「索取报价」+ 一句「表单 1 分钟」
│       （⚠️ 复用 <ContactHero> 的 props 结构，只是 ledes 变成 1 句 → 见 §3.1）
├── ② <QuoteContextBar>  ★    承接区：回显来源 + 已选规格 + 「不是这个型号？」改写链接
├── ③ <InquiryForm>  ★★      props.context 已填 → 第二批字段预填/省填
└── ④ <DataNotice>           隐私说明 + 「还有别的问题？去 /contact」
```

**🔴 本页不做的事**（对照 `/contact` 逐条砍）：

| `/contact` 有 | `/request-a-quote` | 为什么 |
|---|---|---|
| ② 三种起步方案清单（`<FirstMessageChecklist>`） | ❌ **删**，压成一句「只需姓名/邮箱/一句话」 | 从单品页/广告来的人**已经有明确目标**，清单是干扰 |
| ④ 邮箱 / WhatsApp / 电话 / 响应承诺 | ❌ **删**，只留 `DataNotice` | 专注态=不给出走的出口；联系方式是 `/contact` 的职责 |
| 三段降门槛导语 | ❌ **删**，压成 1 句 | 长导语在专注态里是摩擦 |
| 页脚 `<DealerCta>` | ⚠️ **可选** | 见 §2④ 纪律：**禁止在表单前后放第二个 CTA** |

---

## 2. 逐块规格

### ① 专注态页头

| 项 | 规格 |
|---|---|
| 结构 | `.eyebrow` + `<h1>` + **一句**说明 |
| eyebrow | `QUOTE`（**≠ `/contact` 的 `CONTACT`**） |
| H1 | **索取报价** / Request a Quote |
| 一句说明 | 「填三个字段，一分钟。**浏览时选好的规格已经带上**」 |
| 容器 | `.container-fh`（1180） |
| 深色段 | **无** —— 专注态全浅色，越安静越好 |

**★ 复用组件**：`<ContactHero>`（`contact.md` §3.2 已计划新建）——
本页传 `ledes` 长度 1（`/contact` 传 3）。

```ts
// src/components/sections/contact-hero.tsx —— 与 /contact 同一组件
type ContactHeroProps = {
  eyebrow: string;            // 本页传 "QUOTE"；/contact 传 "CONTACT"
  title: string;             // 本页传 "索取报价"
  ledes: string[];           // ★ 本页恰好 1 段；/contact 恰好 3 段
  ledeRoles?: ("no-prep-needed" | "what-happens-next" | "minimum-viable-input")[];
  /** ★ 新增（本页需要）：专注态不渲染任何次级出口 */
  focused?: boolean;         // true → 不渲染任何 ledes 之外的链接/装饰
};
```

**⚠️ SEO 分工（必写死）**：

```ts
// generateMetadata —— /request-a-quote
title:  "Request a Quote — Forged & Cast Wheels"      // ⚠️ 不得出现 "Contact"
description: "Send your wheel requirement in about a minute. Selected size, PCD and finish carry over from the model page you were viewing."
alternates: { canonical: "/request-a-quote" }
// /contact 侧：title "Contact — Fenghuai Wheels"，canonical "/contact"
// 🔴 两页 canonical 各自指向自己，且标题词根不重叠（quote / contact）
```

### ② ★ 承接区（本页独有 —— 这是 `/request-a-quote` 存在的核心理由）

**做法**：把 `InquiryContext`（`contact.md` §2③3.3 已定义，**不重复定义**）
中**来自 URL 的部分**回显给用户，让他在填表前**确认「你们已经知道了什么」**。

```
┌──────────────────────────────────────────────────────┐
│  YOU CAME FROM                                        │
│  1081X · 15×7 · 4×100 · ET35 · 白色全涂装              │
│                                                       │
│  ✅ 这些规格已经带进下面的表单，不用重填。              │
│  不是这个型号？  ←  /products/wheels   |   换个型号    │
└──────────────────────────────────────────────────────┘
```

| 项 | 规格 |
|---|---|
| 组件 | **`<QuoteContextBar>`（需新建，仅本页）** |
| 显示条件 | **仅当 `context.model \|\| context.selectedSpec` 至少有一样时渲染**；否则整段消失（不留空壳） |
| 回显内容 | `model` + `selectedSpec` 的**有值字段**（size/pcd/offset/centerBore/finish）——**存快照语义** |
| 改写出口 | 一个回 `/products/wheels` 的链接 + 一句「不是这个型号？」 |
| 交互 | **纯展示**，无折叠、无悬停揭示；`[data-reveal]` 单次淡入 |

```ts
// src/components/quote-context-bar.tsx（需新建）
import type { InquiryContext } from "@/components/inquiry-form"; // ★ 与表单同一个类型

type QuoteContextBarProps = {
  /** ★ 直接吃 <InquiryForm> 的 context —— 单一事实源，不另建类型 */
  context: InquiryContext;
  /** 回显文案包（避免硬编码文案） */
  copy: {
    eyebrow: string;          // "You came from"
    carryOver: string;        // "这些规格已经带进下面的表单，不用重填。"
    notThis: string;          // "不是这个型号？"
    changeModel: string;      // "换个型号"
    changeHref: string;       // "/products/wheels"
  };
};
```

**🔴 承接区的三条纪律**：

1. **只回显、不改写** —— 承接区**不得**显示任何「该车型适配…」的推断（与 `/fitment` 同源的证据纪律）。
2. **无上下文则整段不渲染** —— 直接从 `/request-a-quote`（无 query）进来的用户看到的是一个干净表单，
   **不是一块空白的「你从哪来」**。
3. **`selectedSpec` 是快照不是引用** —— 承接区回显的是 URL 里冻结的规格文本，
   **不回查目录**（`contact.md` 纪律二：存快照不存引用）。

### ③ 表单（★ 与 `/contact` 完全同组件，只差两处 props）

| 项 | 规格 |
|---|---|
| 组件 | **`<InquiryForm>`（`src/components/inquiry-form.tsx`，566 行，client）—— 同一份** |
| props 差异 1 | `context`：本页**必带**（从 `searchParams` 构造）；`/contact` 通常 `undefined` |
| props 差异 2 | `copy.optionalGroupLabel` 本页可为「补充信息」；`contextLabel` **不用**（已由承接区显示） |
| 字段表 | **逐字复用 `contact.md` §2③3.2**（10 字段 / 实必填 3 / 两批） |
| 后端 | **逐字复用 `contact.md` §2③3.4**（三条纪律 / `POST /api/inquiries`） |

**⚠️ 表单内不得新增任何字段** —— 专注态的「专注」体现在**外壳**，不在表单本身。
若需要「报价专用字段（目标数量交期）」，**加进公共 10 字段表的第二批**，
**不在本页另开一套**（否则回到「两个表单」的原罪）。

**🔴 上下文从哪来（URL → `InquiryContext`）**：

```ts
// src/app/request-a-quote/page.tsx
import type { InquiryContext } from "@/components/inquiry-form";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** ★ URL → InquiryContext 的唯一转换函数（本页与单品页共用，放 lib/） */
// src/lib/inquiry-context.ts（需新建）
export function buildInquiryContext(
  sp: Awaited<SearchParams>,
  pageUrl: string,            // "/request-a-quote"
): InquiryContext;
```

| query 参数 | → `InquiryContext` 字段 | 来源页 |
|---|---|---|
| `?model=1081X` | `model` | 单品页 ⑦ `<InquiryPicker>` |
| `?productionCode=…` | `productionCode` | 单品页（锁定 variant） |
| `?size=15*7` | `selectedSpec.size` | 单品页 / 承接区改写 |
| `?pcd=4*100` | `selectedSpec.pcd` | 单品页 |
| `?et=35` | `selectedSpec.offset` | 单品页 |
| `?cb=73.1` | `selectedSpec.centerBore` | 单品页 |
| `?finish=白色全涂装` | `selectedSpec.finish` | 单品页 |
| `?from=detail\|catalogue` | `sourcePageType` | 单品/目录页 |
| `?series=…`（可选） | `series` | 系列页 |

**⚠️ 单品页 ⑦ `<InquiryPicker>` 必须输出这套 query 参数** —— 否则本页承接区永远空。
**这是一条跨页契约**，写进 `PAGE-SPECS/products/wheels/[model].md` ⑦ 的待补项（见 §6 #4）。

### ④ 极简合规尾

| 元素 | 内容 | 就绪度 |
|---|---|---|
| 隐私说明 | `<DataNotice>` —— 收集什么、存哪、第三方（Resend） | ⚠️ 同 `/contact` #12（需律师） |
| 返回出口 | **一行文字链接**「还有别的问题？去 `/contact`」 | ✅ |
| ❌ 禁止 | **不得**放第二个 CTA / 邮箱 / WhatsApp / `<DealerCta>` 主导出口 | — |

**🔴 专注态的唯一出口是「提交」** —— 页面上任何别的 `btn-pill-solid` 都是事故。
`<DealerCta>` 默认不渲染；若产品要求保留，**必须降级为纯文字链接**。

```ts
// src/components/data-notice.tsx（★ 与产品页 / /contact 同一组件，全站复用）
type DataNoticeProps = {
  eyebrow?: string;
  body: string;                 // 隐私/来源说明
  /** ★ 新增：尾部可选出口（本页用，指向 /contact） */
  footLink?: { href: string; label: string };
  variant?: "light" | "soft";
};
```

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 | 备注 |
|---|---|---|---|
| **`<InquiryForm>`** | `src/components/inquiry-form.tsx`（566 行，client） | 第 ③ 段 | ★ **全站唯一表单** —— 本页与 `/contact` 传不同 `context` |
| `content.contact` | `src/content/contact.ts` | 文案（7 导出） | 复用 `contactFormCopy` |
| — | `src/components/ui/button.tsx` | ⚠️ **零使用，不 import** —— 用 `.btn-pill-*` | — |
| `<FloatingQuote>` | `floating-quote.tsx` | ⚠️ **本页必须同样隐藏**（同 `/contact`） | 见 §5 |

**⚠️ 复用 `contact.md §3.2` 已计划的新建组件**（不重复建）：
`<ContactHero>`（本页传 `focused:true`）、`<DataNotice>`、`POST /api/inquiries`。

### 3.2 需新建（**本页专属，因为不新建）**

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<QuoteContextBar>`** | `src/components/quote-context-bar.tsx` | 承接区：回显来源 + 已选规格 + 改写出口 | **仅本页** |
| **`buildInquiryContext()`** | `src/lib/inquiry-context.ts` | ★ **URL → `InquiryContext` 的唯一转换器** | **本页 + 单品页**（避免两处解析逻辑漂移） |
| **`<QuoteHero>`** | ⚠️ **不新建** —— 复用 `<ContactHero focused />` | 页头 | — |

**★ 提取纪律**：`buildInquiryContext()` 是**本页与单品页 ⑦ 的共同契约**，
**必须放 `src/lib/`，不许写进任一个 `page.tsx`**（否则单品页要复制一份解析逻辑）。

### 3.3 ⚠️ 两种实现方案（**必须拍板，见 §6 #1**）

#### 方案 1：同一 `page.tsx` 用 searchParam 切态

```
src/app/contact/page.tsx                 ← 唯一 page.tsx
  ├── searchParams.mode === "quote"  → 专注态外壳（① ② ③ ④）
  └── 否则                            → 通用态外壳（/contact 五段式）
+ next.config.ts 加 rewrite：/request-a-quote → /contact?mode=quote
+ ⚠️ 必须给 /request-a-quote 单独 generateMetadata（rewrite 不产生新路由，meta 需处理）
```

| ✅ 优点 | ⚠️ 缺点 |
|---|---|
| 表单/后端物理上只有一份 | **URL 不干净**（要么 rewrite 要么 `?mode=`） |
| 无重复代码风险 | **独立写 meta 困难**（一个 `page.tsx` 要按 searchParam 分叉 metadata） |
| — | **canonical 难写**（两 URL 同一内容，SEO 上近乎重复页） |
| — | **广告落地页拿到 query 串**，追踪参数与 `mode` 混在一起 |

#### 方案 2：两个 `page.tsx` 共用组件（**★ 推荐**）

```
src/app/contact/page.tsx                 ← 通用态（五段式）
src/app/request-a-quote/page.tsx         ← 专注态（四段式）★ 本规格描述的对象
        └── 两者都 import 同一个 <InquiryForm>（同一份 + 同一后端）
        └── 两者各自写 generateMetadata（title/canonical 独立）
```

| ✅ 优点 | ⚠️ 缺点 |
|---|---|
| **URL 干净**（`/request-a-quote` 无 query 也能进） | 两个 `page.tsx` 文件（但**外壳代码量极小**，逻辑都在组件里） |
| **可独立写 meta**（`quote` vs `contact` 词根天然不竞争） | **纪律要求高**：必须抵抗「再写一份表单」的诱惑 |
| 广告落地页 URL 稳定、可独立打转化标签 | — |
| 与 `contact.md` 附 B.1「方案 2 保留两个路由」天然对齐 | — |

**★ 推荐方案 2 的三条硬理由**：

1. **广告与外链需要一个干净的、永不变化的转化 URL** —— query 串会被追踪平台改写。
2. **独立 meta 是「不自我竞争」的前提** —— 方案 1 里 `request-a-quote` 拿不到独立 `title`。
3. **成本差极小** —— 两个 `page.tsx` 各只做「拼外壳 + 传 props」，**共用组件本就是既定纪律**，
   不会真的产生第二份表单。

**→ 若拍板方案 1**：本规格 §1/§2 的四段式仍然成立，只是四段住进 `page.tsx` 的
`mode === "quote"` 分支，§3.2 的 `<QuoteContextBar>` 与 `buildInquiryContext()` 照建不误。

---

## 4. 数据契约

### 4.1 输入（全部来自 `/contact`，**不重复定义**）

```ts
// ⚠️ 以下类型全部已定义在 PAGE-SPECS/contact.md §2③3.3 / §4，本页只引用
import type { InquiryFormProps, InquiryContext } from "@/components/inquiry-form";
import type { ProductFamily, WheelModel } from "@/content/types";
```

| 字段/类型 | 来源 | 本页用法 |
|---|---|---|
| `families: ProductFamily[]` | `content/products.ts`（**✅ 已存在** —— `types.ts:23`） | 传给表单（同 `/contact`） |
| `models?: Pick<WheelModel,"model"\|"finishes">[]` | `WheelModel`（**⚠️ 类型已定义，数据未接入 `src/`**） | 型号选择器；未接入时降级文本输入 |
| `context?: InquiryContext` | ★ **本页从 `searchParams` 构造** | 预填 + 承接区回显 |
| `copy` | `contact.contactFormCopy` | 同 `/contact` |

### 4.2 ★ 本页独有数据流（**这是本规格唯一新增的数据契约**）

```
单品页 ⑦ <InquiryPicker>
   │  Link href="/request-a-quote?model=…&productionCode=…&size=…&pcd=…&et=…&cb=…&finish=…&from=detail"
   ↓
/request-a-quote  page.tsx
   │  searchParams  ──buildInquiryContext()──▶  InquiryContext   ← ★ 单一转换器
   ├──▶ <QuoteContextBar context={ctx} />       （② 承接区，纯回显）
   └──▶ <InquiryForm context={ctx} models={…} families={…} copy={…} />  （③ 表单）
             ↓ 提交
   POST /api/inquiries  { …fields, context: { …ctx, pageUrl: "/request-a-quote" } }
```

**🔴 三条纪律（继承 `contact.md`）**：

1. `context` **入库与询盘同行**（纪律三：上下文随询盘走）。
2. `selectedSpec` 是**文本快照**，**不存 `productionCode` 外键**（纪律二：存快照不存引用）。
3. `pageUrl` 本页固定为 `/request-a-quote` —— **销售据此区分：报价来的是高意向**。

**⚠️ 缺口**：`buildInquiryContext()` 的**参数命名规范未定** ——
必须与单品页 ⑦ `<InquiryPicker>` 的链接生成**同一张表**（见 §6 #4）。

### 4.3 就绪度总表（逐段）

| 段 | 依赖 | 就绪度 |
|---|---|---|
| ① 页头 | `<ContactHero>` 复用（`contact.md` 已计划） | ✅ |
| ② **承接区** | **`buildInquiryContext()` + 单品页 ⑦ 输出这套 query** | ⚠️ **跨页契约未定**（§6 #4） |
| ③ 表单 | `<InquiryForm>` 扩展 + `WheelModel` 数据接入 | ⚠️ 同 `/contact`（§6 #3） |
| ④ 合规尾 | 隐私文案（需律师） | ⚠️ 同 `/contact` #12 |

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180）—— **比 `/contact` 更窄的视觉**：表单主列居中，**无 aside** |
| 布局 | **单列**（四段纵向堆叠）—— 专注态**不做 320px 侧栏**（那是 `/contact` 的 ④ 联系块位） |
| 断点 | 字段栅格 `grid-cols-1 md:grid-cols-2`（同 `/contact`）⚠️ **768 必须专门测** |
| 深色段 | **无** —— 全浅色 |
| 动效 | `[data-reveal]` 每段一次；**② 承接区与 ③ 表单之间不做错峰**（避免元素位移干扰输入） |
| 🔴 fail-visible | **不要自己加 `opacity-0`**（`globals.css:224-267`） |
| 按钮 | `.btn-pill-solid`（提交）/ `.btn-pill-outline`（重置）—— **不是 `<Button>`** |
| 浮动 CTA | ⚠️ **`<FloatingQuote>` 必须在 `/request-a-quote` 上隐藏** —— 与 `/contact` 同理 |

**🔴 `<FloatingQuote>` 隐藏的实现注意**：
现有隐藏逻辑写在 `floating-quote.tsx`（`layout.tsx:40` 挂载），**只判断 `/contact`**。
新增本路由时**必须把 `/request-a-quote` 加进隐藏条件**，否则专注态右下角会浮一个「获取报价」按钮
指向本页自己 —— **自我循环，且是第二个 CTA**。

**★ 移动纪律**：专注态在 390px 上应当是「**一屏一个任务**」——
页头 + 承接区 + 表单首字段应在首屏内，**用户不需要下滑才知道要填什么**。

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 就绪度 |
|---|---|---|---|
| **1** | **实现方案拍板**：方案 1（searchParam 切态）vs **方案 2（两个 page.tsx，推荐）** | **整页** | 🔴 **待拍板**（同 `contact.md` 附 B.1 #9） |
| **2** | `/contact` 与 `/request-a-quote` **是否合并** | 路由存在性 | 🔴 **文档矛盾，待拍板**（见附 A） |
| **3** | **`WheelModel` 数据接入 `src/`** | ③ 型号选择器 | ⚠️ 传递性阻塞（同 `/contact` #10） |
| **4** | ★ **URL query 参数命名 + `<InquiryPicker>` 输出契约** | **② 承接区 + ③ 预填** | 🔴 **跨页契约未定（本页独有阻塞）** |
| **5** | 提交成功：内联成功态 vs 跳 `/thank-you` | ③ | 🔴 待拍板（同 `contact.md` 附 B.2 #11） |
| **6** | **后端**：DB 选型 / Resend / Node runtime | ③ | ❌ 全部待定（同 `/contact` #5-7） |
| **7** | 隐私说明（收集/存储/Resend/留存期） | ④ | ⚠️ 需律师（`README` §2.15） |
| **8** | `<FloatingQuote>` 隐藏条件加本路由 | ⑤ | ✅ 小改动，但**不可漏** |
| **9** | Google Ads / GA4 转化标签是否需要独立 landing 参数 | SEO/投放 | ⚠️ 待定（方案 2 才干净） |

**🔴 阻塞汇总：#1 #4 是本页独有的两个硬阻塞**，其余全部继承自 `/contact`。

---

## 附 A：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 「专注态而非独立页」的定位 | `contact.md` 附 B.1 方案 2 + `contact-page.md:236-237` |
| 四段式（五段式减联系块） | `PAGE-SPECS/contact.md` §1 五段式 |
| 字段表 / `InquiryContext` / 后端三纪律 | **`PAGE-SPECS/contact.md` §2③3.2 / 3.3 / 3.4**（逐字复用） |
| 一键查重：唯一表单 + 唯一后端 | `contact-page.md` §3（一页一个表单） |
| 上下文随询盘走 | `contact-page.md` §4.2 + `README.md` §2.13 |

---

## 附 B：🔴 与 `contact.md` 附 B.1 的协调说明

`contact.md` 附 B.1 记录了**未决矛盾**：

- `contact-page.md` §5 **主张合并成一个 `/contact`**
  —— 「两个入口指向同一个表单会分散权重」。
- `PAGE-SPECS/README.md`（文件命名 = 路由表）与目标站点地图 **保留两个路由**。

**本规格的立场（规格层决定，不推翻设计层）**：

| 若拍板 | 本规格的命运 |
|---|---|
| **保留两个路由（方案 2）** | ✅ **照本规格施工** —— 本文描述的就是 `/request-a-quote` 的专注态 |
| **合并（方案 1 的激进版：只留 `/contact`）** | ⚠️ **本文作废**，但**不是白写** —— §2② `<QuoteContextBar>` + §3.2 `buildInquiryContext()` **整体迁进 `/contact`**，作为 `?mode=quote`（或 `?from=detail`）分支；`contact.md` §6 #9 的两选项一并落地 |

**★ 无论拍板哪个，以下三件事不变、且本规格已给出规格**：

1. **只有一个 `<InquiryForm>`**（§3.1）
2. **承接区（回显上下文）必须存在** —— 只是它可能住在 `/contact` 里（§2②）
3. **`buildInquiryContext()` 必须是唯一转换器**（§3.2）—— 它甚至比路由本身更重要，
   因为它是**单品页 ⑦ 与本页的接口**，与路由合并与否无关。

**→ 所以本规格的交付不依赖 #1/#2 的拍板**：路由结论只是决定「四段式住哪个文件」，
**`<QuoteContextBar>` 与 `buildInquiryContext()` 两个新建件两种方案都要建。**
