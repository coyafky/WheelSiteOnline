# `/contact` + `/request-a-quote` 页面规格（转化页 · 全站最短）

> **路由**：`/contact` ｜ `/request-a-quote`（⚠️ **二者关系待定，见 §6 #9 与附 B**）
> **目标文件**：`src/app/contact/page.tsx`（已存在，有表单 UI **无后端**）｜ `src/app/request-a-quote/page.tsx`（**不存在**）
> **渲染**：**Node runtime（非静态导出）** —— 因为有 `POST /api/inquiries`
> **数据**：`content/contact.ts`（7 个导出）+ `content/products.ts` + `content/site.ts` + **`WheelModel` 类型**（型号选择器）
> **设计依据**：`../../ARCHITECTURE/page-architecture/contact-page.md`

---

## 0. 一句话

**转化页不该有说服工作量。**

竞品把最重的内容（贴牌 13,953px）和最轻的转化页（1,520px）放在同一个站里 ——
**这说明它懂一件事**：走到 `/contact-us/` 的人**已经决定要联系**，
说服在前面的页面已经做完了，**他只需要一个不碍事的表单**。

**⚠️ 这是最容易做错的一页** —— 常见错误是把联系页做成「第二个首页」，再讲一遍公司优势。
**那是在用户已经决定之后还继续推销。**

**🔴 我们与竞品最大的差别**：**我们的表单必须真的有后端。**
竞品是 WPForms 插件黑箱（是否落库/可追溯/丢了怎么办全不可知），**我们不行** ——
三条纪律：**先落库再发信 / 存快照不存引用 / 上下文随询盘走**。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §8 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/contact/page.tsx` 实测 **4 个 `<section>`**（2026-10-02）。

> 审计原文：A Hero → B 表单 + 联系详情（**左表单 + 右 aside 两卡**）→ C What happens next（步骤 + 勾选）→ D Read first pathways → （无 `DealerCta`）。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这里能做什么？ | A Hero | `contactHero`（eyebrow `CONTACT` + H1 + lede + supporting） | 深色径向橙光 | 无 | 无 | ✅ 合规 |
| **02** | 我要填什么？ | B 表单 | `Wheel enquiry form` + `InquiryForm` | 表单（左 1.3fr） | 提交表单 | 无 | ⚠️ **拥挤**（见 B-1） |
| **03** | 怎么联系你们 / 什么能加速报价？ | B aside（两卡） | `contactDetailsCopy` 四行 dl + 占位警示 + `contactAside` 勾选列 | 右 aside 0.7fr 两卡（白卡 + 深卡） | email / tel 链接 | 无 | ⚠️ **拥挤**（见 B-1，与 02 同屏） |
| **04** | 接下来会怎样？ | C What happens next | `contactSteps` 4 步 + `contactWhatHappens.points` 4 条勾选 | 左步条 + 右勾选卡 | 无 | 无 | ✅ 合规 |
| **05** | 有什么该先读的？ | D Read first pathways | `contactPathways` 2–3 张卡 | 2 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |

**判定统计**：✅ 2 ｜ ⚠️ 拥挤 2 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 1

### 0.5.3 审计给出的处置

| # | 判定 | 审计发现（原文标题） |
|---|---|---|
| B-1 | ⚠️ | 视口 02/03（B 段）：一屏内 4 个不同的问题并列 |
| B-2 | 🗑️ | 视口 05（D Read first pathways）：答案是重复的 |

> 逐条理由与建议见 `_viewport-audit.md` §8 的 B 小节 —— **本文件不复制理由，只登记落点**。

### 0.5.4 高度预算与询盘整屏

| 项 | 要求 |
|---|---|
| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |
| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** （`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |
| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |

---

<!-- ASSET-REALIGNMENT-2026-10-02 -->
## 0.6 ★ 图片资产边界（2026-10-02）

本页是联系与询盘入口，保持文字/表单优先，不强制加入产品图片。产品图片应由询盘上下文或具体产品页提供，不在联系表单页重复展示。

## 1. 页面骨架（五段式）

竞品 1 段，我们加 4 段（都是必要的，不是堆内容）：

| 序 | 内容块 | 必须性 | 说明什么 | 段落类型 | 就绪度 |
|---|---|---|---|---|---|
| ① | 页头 + 三段降门槛导语 | 必须有 | 照抄竞品结构 | 降门槛 | ✅ |
| ② | ★「先发什么」清单 | 必须有 | **三种起步方案**（比竞品更具体） | **T3 降门槛** | ✅ |
| ③ | ★★ 表单 | 必须有 | 10 字段（必填 2）+ 上下文自动携带 | 转化 | ⚠️ 型号选择器依赖目录接入 |
| ④ | 底部联系块 | 必须有 | 邮箱 + WhatsApp + **响应承诺** | 联系方式 | ❌ **需丰怀确认** |
| ⑤ | 后端链路 | 必须有 | `POST /api/inquiries` → 落库 → 发信 | **技术硬约束** | ❌ **全部待定** |

```
/dealers… 任何页
├── ① <ContactHero>           eyebrow + H1 + 三段降门槛导语
├── ② <FirstMessageChecklist> 三种起步方案（复用贴牌页 ⑫ 组件）
├── ③ <InquiryForm>  ★★       10 字段 + 上下文 props + 折叠第二批
├── ④ <ContactDetails>        邮箱 / WhatsApp / 响应承诺
└── ⑤ ── POST /api/inquiries ──  ← ❌ 目前不存在（见 §2⑤）
```

---

## 2. 逐块规格

### ① 页头 + 三段降门槛导语

竞品导语**有 3 段，而且全在「降低心理门槛」**：

| 句 | 做的事情 | 我们的对应 |
|---|---|---|
| *"You do not need every specification ready"* | **免去准备负担** | 同 |
| *"Our team can follow up by email or WhatsApp"* | **说明下一步会发生什么** | 同 |
| *"If a detail is missing, send the vehicle and target look."* | **给最低可行输入** | **★ 强化：给三种起步方案** |

**★ 三句话解决三个顾虑，一个字不提自己多厉害。**

| 项 | 内容 |
|---|---|
| H1 | **索取轮毂报价**（对齐竞品 `REQUEST WHEEL QUOTE`） |
| eyebrow | `CONTACT` |
| 结构 | `.eyebrow` + `<h1>` + 三段导语 |
| 容器 | `.container-fh`（1180） |
| SEO | ⚠️ **竞品此页无 JSON-LD（可改进点）** → 我们加 `ContactPage` + `Organization` |

**props 契约**：

```ts
// src/components/sections/contact-hero.tsx（需新建；现有页面是内联的）
type ContactHeroProps = {
  eyebrow: string;            // "CONTACT"
  title: string;             // "索取轮毂报价"
  ledes: string[];           // ★ 恰好 3 段，顺序有意义
  /** 三段各自承担的降门槛职责，供内容审核 */
  ledeRoles?: ("no-prep-needed" | "what-happens-next" | "minimum-viable-input")[];
};
```

**⚠️ 数据已就绪**：`content/contact.ts` 已有 `contactHero`（`src/content/contact.ts:11`）。

### ② ★「先发什么」清单（三种起步方案）

**竞品** `WHAT TO SEND IN THE FIRST MESSAGE` + 3 条要点，且第 3 条反过来告诉客户
**「不知道怎么量也没关系」**。

**⚠️ 我们的强化版**：我们比竞品多一样东西 —— **1018 个型号 + 3485 个配置**，
所以清单可以更具体：

```
✅ 方案 A（客户已知道要什么）
   型号 + 表面处理 + 数量

✅ 方案 B（客户只知道车）
   车型 / 年份 + 想要的效果

✅ 方案 C（客户只有一张参考图）
   图片 + 数量

三种都能起步 —— 不用等资料齐。
```

**★ 这比竞品的「Vehicle or VIN」更降门槛**，因为我们能**从目录里帮他找到型号**。

**props 契约**：**复用 `<FirstMessageChecklist>`**（与贴牌页 ⑫ 同一个组件），
本页传 `variant="three-paths"`（三种方案）而贴牌页传 10 条清单。

```ts
// src/components/first-message-checklist.tsx（★ 公共组件，2 页复用）
type StartPath = { label: string; items: string[] };   // 方案 A/B/C
type FirstMessageChecklistProps = {
  eyebrow: string;
  heading: string;
  /** 两种形态：本页用 paths（三种起步），贴牌页用 items（10 条清单） */
  paths?: StartPath[];
  items?: string[];
  reassurance: string;      // ★ "不知道适配数据也没关系"
  variant?: "light" | "soft";
};
```

**🔴 禁止**：把「先发什么」做成必须完成的 checklist。**它是邀请，不是门槛。**

### ③ ★★ 表单（InquiryForm —— 复用已有，566 行）

**⚠️ 一页一个表单**（竞品的结构性缺陷是页面上留了两个表单 —— 迁移遗留：
自定义 5 字段 + WPForms 5 字段 + 7 隐藏，字段名重复、必填规则冲突）。

**✅ 现有 `<InquiryForm>`（`src/components/inquiry-form.tsx`，566 行）可复用，但无后端。**

#### 3.1 现有实现事实（读源码，非推断）

| 项 | 现状 |
|---|---|
| 文件 | `src/components/inquiry-form.tsx`（566 行，client 组件） |
| 现有 props | `{ families: ProductFamily[]; copy: {...} }` |
| 现有字段（`FormValues`） | `company` `contactName` `email` `country` `vehicle` `family` `quantity` `finish` `message`（**9 个**） |
| 现有必填 | `company` `contactName` `email` `message`（**4 个**） |
| 现有行为 | `useState` 校验 + `status: idle/submitting/success` **仅前端**，无 fetch |
| 现有成功态 | 内联 success 面板（`successTitle/successBody/successDisclaimer`）→ **⚠️ 与 `/thank-you` 的关系待定，见附 B** |
| 缺什么 | ① **后端**（`src/app/api/` 目录不存在）② WhatsApp 字段 ③ 型号选择器 ④ 上下文 props ⑤ 响应承诺 |
| 依赖 | 零 DB / 邮件依赖（无 resend / prisma / drizzle / neon） |

#### 3.2 ★ 目标字段表（10 字段，必填 2 个）

**⚠️ 与现有实现的差异**：现有 9 字段 4 必填 → 目标 10 字段 **2 必填**。

| # | 字段 | key | 类型 | 必填 | 来源 | 相对竞品 | 批次 |
|---|---|---|---|---|---|---|---|
| 1 | 姓名 | `contactName` | text | ✅ | 客户填 | 合并 first/last（中文语境不需拆） | 第一批 |
| 2 | 邮箱 | `email` | email | ✅ | 客户填 | 同 | 第一批 |
| 3 | 项目描述 | `message` | textarea | ✅ | 客户填 | 同 | 第一批 |
| 4 | **公司** | `company` | text | ❌ | 客户填 | **★ 新增**（B2B 语境公司比姓名重要） | 第二批 |
| 5 | **WhatsApp** | `whatsapp` | tel | ❌ | 客户填 | 同（**B2B 外贸必备**） | 第二批 |
| 6 | **国家 / 地区** | `country` | text/select | ❌ | 客户填 | **★ 新增**（报价要看运费） | 第二批 |
| 7 | **感兴趣的产品线** | `family` | select | ❌ | 四条线 | **★ 新增**（我们有四条线） | 第一批 |
| 8 | **型号** | `model` | 目录选择器（1018 个） | ❌ | 目录 | **★ 新增**（竞品做不了） | 第二批 |
| 9 | **表面处理** | `finish` | select（该型号的 finishes） | ❌ | 型号联动 | **★ 新增** | 第二批 |
| 10 | **数量** | `quantity` | number/text | ❌ | 客户填 | **★ 新增**（单独字段比塞进正文强） | 第二批 |

**🔴 必填只有 3 个字段（姓名 / 邮箱 / 项目描述）** —— 设计文档 §7 说「必填 2 个」
（指**第一批的非自动带字段**中最少要填的）；规格按**实际必填 3 个**落地，
因为项目描述是**我们唯一能让销售有意义回复的内容**。
**⚠️ 与设计文档的 `第二批（选填，折叠）` 分组保持一致**：

```
第一批（常显，3 个必填）：姓名 + 邮箱 + 项目描述
第二批（折叠，全选填）：公司 / WhatsApp / 国家 / 产品线 / 型号 / 表面处理 / 数量
```

**★ 理由**：**字段越多，提交率越低**。但因为**很多字段我们能自动带**
（从详情页来的询盘自动带上型号 + 规格），**实际要客户填的反而比竞品少**
（竞品让客户手写「19 inch / Gunmetal」，我们从 URL 里就知道了）。

#### 3.3 ★ props 契约（目标版）

```ts
// src/components/inquiry-form.tsx —— 目标签名（在现有基础扩展）
import type { ProductFamily, WheelModel } from "@/content/types";

/** ★ 上下文：随询盘走（纪律三）。全部可选，来源决定填哪些。 */
type InquiryContext = {
  /** 来源页 URL，如 "/products/wheels/1081X" */
  pageUrl: string;
  /** 来源页类型 —— 决定销售怎么开场 */
  sourcePageType: "detail" | "catalogue" | "series" | "private-label" | "dealer" | "about" | "other";
  /** 轮毂型号（若从详情页来） */
  model?: string;
  /** 生产代码（若已选配置）—— 锁定具体 variant */
  productionCode?: string;
  /** 已选规格（快照）—— ⚠️ 存快照不存引用（纪律二） */
  selectedSpec?: {
    size?: string;         // "15*7"
    pcd?: string;          // "4*100"
    offset?: number;       // 35
    centerBore?: number;   // 73.1
    finish?: string;       // "白色全涂装"
  };
  /** 筛选条件（若从目录页来） */
  filters?: Record<string, string>;
  /** 关注车系（若从车系页来） */
  series?: string;
};

type InquiryFormProps = {
  /** 产品线选择项（四条线）—— 复用现有 props */
  families: ProductFamily[];
  /** ⚠️ 型号选择器数据源；目录未接入时为 undefined → 选择器降级为文本输入 */
  models?: Pick<WheelModel, "model" | "finishes">[];
  /** ★ 上下文自动携带（纪律三：上下文随询盘走） */
  context?: InquiryContext;
  /** 文案包 —— 复用现有 copy 结构，新增字段 */
  copy: {
    requiredNote: string;
    optional: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    successDisclaimer: string;
    resetLabel: string;
    errorSummaryTitle: string;
    errorSummaryBody: string;
    /** ★ 新增：折叠批次标签 */
    optionalGroupLabel: string;     // "补充信息（选填）"
    /** ★ 新增：上下文回显标签（让客户看到「我们已经知道什么」） */
    contextLabel: string;           // "我们从你浏览的页面带上了这些信息"
  };
};
```

#### 3.4 ★ 后端链路（第 ⑤ 段，我们与竞品最大的差别）

**竞品这页的诚实度无法验证** —— 表单是 WPForms 插件，能收到邮件，
但**是否落库、是否可追溯、丢了怎么办，全在插件黑箱里**。**我们不行。**

**🔴 三条后端纪律**（`docs/plans/inquiry-system-architecture.md`）：

| 纪律 | 含义 | 实现要点 |
|---|---|---|
| **先落库再发信** | 邮件失败不丢询盘 | 先 `INSERT`，再 `sendEmail`；发信失败不回滚，标记 `mailStatus: "failed"` |
| **存快照不存引用** | 产品数据会变，历史询盘不跟着变 | **询盘存规格文本快照，不存 `productionCode` 外键**（引用会随目录更新而失效） |
| **上下文随询盘走** | 销售要知道客户从哪来、看的是什么 | `InquiryContext` 全量入库，与询盘同行 |

```
/contact 页面
    ↓ POST /api/inquiries     ← ❌ src/app/api/ 目录目前不存在
[src/app/api/inquiries/route.ts]
    ↓
  ├─ ① 校验（服务端复校验，不信客户端）
  ├─ ② 落库（DB 选型待定：Neon / Supabase / 自建）  ← 先落库
  └─ ③ 发信（Resend）                              ← 再发信（失败不丢单）
    ↓
  → 302 /contact/thank-you  或  内联成功态（见附 B）
```

**API props 契约（route handler 的请求/响应）**：

```ts
// src/app/api/inquiries/route.ts（需新建）
type InquiryPayload = {
  // 第一批
  contactName: string;
  email: string;
  message: string;
  // 第二批（选填）
  company?: string;
  whatsapp?: string;
  country?: string;
  family?: string;
  model?: string;
  finish?: string;
  quantity?: string;
  // ★ 上下文快照（纪律二 + 三）
  context: InquiryContext;
  // 反滥用
  turnstileToken?: string;   // ⚠️ 是否上 Turnstile 待定（§6 #8）
};

type InquiryResponse =
  | { ok: true;  id: string; mailStatus: "sent" | "queued" | "failed" }
  | { ok: false; errors: Record<string, string> };
```

**🔴 后端纪律**：
- ✅ **服务端必须复校验**（客户端校验只是体验，不是安全）
- ✅ 落库成功即返回 `ok: true`，`mailStatus` **不阻塞成功**（先落库再发信的推论）
- ❌ **不得存 `productionCode` 外键** —— 存规格**文本快照**
- ✅ 部署形态必须 **Node runtime**（**不是静态导出**）

### ④ 底部联系块

| 元素 | 内容 | 就绪度 |
|---|---|---|
| 邮箱 | ⚠️ 公司邮箱（竞品用 `info@2nforged.com`） | ❌ **需丰怀确认** |
| WhatsApp | ⚠️ 商务号 | ❌ **需丰怀确认** |
| 电话 | ⚠️ 可选 | ❌ **需丰怀确认** |
| **响应承诺** | ⚠️ 多久回复 | ❌ **需丰怀确认** |
| 地址 | ⚠️ 是否公开（丰怀在深圳/广东） | ❌ **需丰怀确认** |

**★ 响应承诺是转化页的信任核心** —— 竞品没有，我们要有。
**⚠️ 未确认前，本段只渲染邮箱（若有）+ 表单，不渲染 WhatsApp 与响应承诺**
（不做假号、不编响应时间）。

```ts
// src/components/contact-details.tsx（本页）
type ContactDetailsProps = {
  eyebrow: string;
  heading: string;
  email?: string;              // ⚠️ 未确认 → 不渲染该行
  whatsapp?: string;           // ⚠️ 未确认 → 不渲染该行
  phone?: string;
  /** ★ 响应承诺 —— 未确认时不渲染整块 */
  responsePromise?: { window: string; channel: string };
  address?: string;
};
```

### ⑤ 后端链路说明（本规格内的显式段）

**这一段不是页面可见内容，是施工要求** —— 见 §2③3.4。

**⚠️ 本页的「架构」有一半在 `tech-architecture/` 里，不在页面设计文档里。**
需要同步产出：`ARCHITECTURE/tech-architecture/inquiry-system.md`（若不存在）。

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 | 备注 |
|---|---|---|---|
| **`<InquiryForm>`** | `src/components/inquiry-form.tsx`（566 行，client） | 第 ③ 段表单 | ★ **可复用但需扩展**（字段 + 上下文 + 后端接线） |
| `content.contact` | `src/content/contact.ts` | 文案（7 个导出） | 已就绪 |
| — | `src/components/ui/button.tsx` | ⚠️ **零使用，不 import** —— 用 `.btn-pill-*` | |

**⚠️ `<FloatingQuote>` 在 `/contact` 上自动隐藏**（`layout.tsx:40`）—— **不要在本页另加浮动 CTA。**

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<FirstMessageChecklist>`** | `src/components/first-message-checklist.tsx` | 「先发什么」（三种方案 / 清单） | **2 页** ★ 与贴牌页 ⑫ 同一组件 |
| **`<DataNotice>`** | `src/components/data-notice.tsx` | 询盘数据用途说明（隐私） | **全站** ★ 同族 |
| `<ContactHero>` | `src/components/sections/contact-hero.tsx` | H1 + 三段导语 | 本页（+ `/request-a-quote` 若保留） |
| `<ContactDetails>` | `src/components/contact-details.tsx` | 邮箱 / WhatsApp / 响应承诺 | 本页（+ `/thank-you` 联系块） |
| **`POST /api/inquiries`** | `src/app/api/inquiries/route.ts` | ★★ 落库 + 发信 | **全站唯一询盘入口** |

**★ 提取纪律**：`<FirstMessageChecklist>` `<DataNotice>` 必须与 `/dealers`（`/dealers` ⑪ 附近的清单）
和 `/dealers/private-label` ⑫ 用**同名同路径**。

**⚠️ `<InquiryForm>` 的扩展方向**（不改名、不新建第二份）：

```
现有：{ families, copy }
目标：{ families, models?, context?, copy }
       ↑ 新增两个可选 props，向后兼容 —— 现有调用点不需改
```

---

## 4. 数据契约

### 4.1 现有内容模块（`src/content/contact.ts`，7 个导出）

```ts
// ✅ 已存在
export const contactHero: { /* eyebrow, title, ledes, … */ };       // → ①
export const contactFormCopy: { /* 现有 copy 包 */ };                // → ③
export const contactWhatHappens: AnswerBlock;                       // → ②/④
export const contactSteps: FlowStep[];                              // → ②
export const contactDetailsCopy: { /* … */ };                       // → ④
export const contactAside: { /* … */ };                             // → ④
export const contactPathways: { /* … */ };                          // → ②
// 页面还 import：products（四条线）、site（公司信息）
```

### 4.2 表单数据类型（复用站内既有类型）

```ts
import type {
  ProductFamily,   // 产品线选择项（四条线）—— types.ts:23
  WheelModel,      // ★ 型号选择器数据源 —— types.ts:419
  FlowStep,        // contactSteps
  AnswerBlock,     // contactWhatHappens
  CtaLink,         // 按钮
} from "@/content/types";
```

### 4.3 就绪度总表（逐段）

| 段 | 依赖 | 就绪度 |
|---|---|---|
| ① 页头导语 | 文案（`contactHero`） | ✅ |
| ② 起步清单 | 目录数据（1018 型号） | ✅ |
| ③ 表单字段 | **`WheelModel` 类型**（型号选择器） | ⚠️ 类型已定义，**数据未接入 `src/`** |
| ④ 底部 | **邮箱 / 电话 / 响应承诺 / 地址** | ❌ **需丰怀确认 ×4** |
| ⑤ **后端** | **DB 选型 + Resend + 部署形态** | ❌ **全部待定** |

**→ 5 段里，2 段阻塞在丰怀（④⑤ 部分），1 段阻塞在技术选型（⑤）。**

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180） |
| 布局 | 桌面：表单主列 + ④ 联系块 aside（`lg:grid-cols-[1fr_320px]`）；移动：**表单优先**，联系块下沉 |
| 深色段 | **无** —— 转化页保持明亮、低干扰（⚠️ 唯一例外：若 `ContactHero` 需与站内其他页头统一，可用 `bg-ink`） |
| 表单栅格 | 字段 `grid-cols-1 md:grid-cols-2`（姓名/邮箱同行，正文跨列） |
| 第二批折叠 | ⚠️ **不要用「展开更多」把必填藏起来** —— 折叠只装**真正的选填项** |
| 动效 | `[data-reveal]` 每段；**表单区不做错峰动画**（避免输入时元素还在位移） |
| 🔴 fail-visible | **不要自己加 `opacity-0`** |
| 按钮 | `.btn-pill-solid`（提交）/ `.btn-pill-outline`（重置）—— **不是 `<Button>`** |
| 无障碍 | ⚠️ **现有 `<InquiryForm>` 已有较好的 ARIA 结构**（`errorId` / `errorSummary` / `attempted` 门控）—— **扩展时不要破坏** |

**★ 竞品的移动端纪律**：竞品在 768 无横向溢出问题（因为只有单列表单），
**我们加第二列时要专门测 768**。

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 就绪度 |
|---|---|---|---|
| **1** | **公司邮箱**（竞品用 `info@2nforged.com`） | ④ | ❌ **需丰怀确认** |
| **2** | **电话 / WhatsApp 商务号** | ④ | ❌ **需丰怀确认** |
| **3** | **响应承诺**（多久回复） | ④ + `/thank-you` | ❌ **需丰怀确认 —— 两页共用** |
| **4** | 公司地址是否公开（丰怀在深圳/广东） | ④ | ❌ **需丰怀确认** |
| **5** | **数据库选型**（Neon / Supabase / 自建） | ⑤ | ❌ **待定** |
| **6** | 邮件服务（Resend）账号 | ⑤ | ❌ **待定** |
| **7** | 部署形态（**Node runtime，非静态导出**） | ⑤ | ❌ **待定** |
| **8** | 是否上防滥用（Turnstile） | ③ | ⚠️ 待定 |
| **9** | **`/contact` 与 `/request-a-quote` 是否合并** | **路由（见附 B）** | 🔴 **文档矛盾，待拍板** |
| **10** | **型号选择器数据源**（`WheelModel` 数据未接入 `src/`） | ③ 字段 8 | ⚠️ 传递性阻塞 |
| **11** | 提交成功后：**内联成功态 vs 跳 `/thank-you`** | ③ + `/thank-you` | 🔴 **待拍板（见附 B）** |
| **12** | 询盘数据隐私说明（收集/存储/第三方 Resend/留存期） | ②/④ | ⚠️ 需律师（`README` §2.15） |

**🔴 四组丰怀确认项（邮箱 / 商务号 / 响应承诺 / 地址）—— 未确认前对应元素不渲染，不做假。**

---

## 附 A：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 五段式（1→5 的加段） | `contact-page.md` §5 |
| ① 三段降门槛导语 | `contact-page.md` §1.1 |
| ② 三种起步方案 | `contact-page.md` §2 |
| ③ 一页一个表单（修正竞品缺陷） | `contact-page.md` §3 |
| ③ 字段表 10 字段 / 两批 | `contact-page.md` §4.1 + §7 |
| ③ 上下文自动携带 | `contact-page.md` §4.2 |
| ④ 底部 + 响应承诺 | `contact-page.md` §5 + §1.1 |
| ⑤ 三条后端纪律 | `contact-page.md` §6 + `README.md` §2.13 |
| 竞品底本 1 段 / 1,520px / 187 字 | `contact-page.md` 附录 |

---

## 附 B：🔴 待确认的两处文档矛盾（必须拍板）

### B.1 路由：`/contact` 与 `/request-a-quote` 是否合并

**🔴 矛盾**：
- `contact-page.md` §5 **建议合并成一个 `/contact`** ——
  「两个入口指向同一个表单会分散权重，且没有必要」（竞品也只有一个 `/contact-us/`）。
- `README.md`（PAGE-SPECS/README.md）的**文件命名 = 路由表**里，
  **保留两个路由**：`/contact` 与 `/request-a-quote`（目标站点地图 `README` §1 也列了 `/request-a-quote`）。

**→ 两种实现规格，请拍板后二选一：**

#### 方案 1（合并，设计文档推荐）—— 只保留 `/contact`

```
src/app/contact/page.tsx          ← 唯一转化页（现有文件，重排为五段式）
src/app/request-a-quote/          ← ❌ 不创建
+ next.config.ts 加 301：/request-a-quote → /contact（若旧链接已外发）
```
- ✅ 权重集中，SEO 干净
- ✅ 与竞品结构一致
- ⚠️ 需要处理已外发的 `/request-a-quote` 外部链接（301）

#### 方案 2（保留两个路由）—— 各自语义分工

```
src/app/contact/page.tsx              ← 「联系」：通用咨询 + 四线路由
src/app/request-a-quote/page.tsx      ← 「报价」：★ 深度询盘表单（带型号选择器 + 上下文）
```
- ⚠️ **必须避免两个表单** —— 做法：**两个路由复用同一个 `<InquiryForm>`**（同一后端），
  只是**上下文与预填不同**（`/contact` 无上下文；`/request-a-quote` 从 `?model=`/`?pcd=` 接收）
- ⚠️ **必须避免关键词自我竞争** —— 两页 `<title>`/`<h1>`/`canonical` 必须明确分工
- ⚠️ **本规格 §1 五段式两张页都要落地**，`/contact` 可精简 ②（起步清单）为链接

**本规格默认按方案 1 描述**（因为设计文档明确推荐），**但组件清单对两种方案都成立**。

### B.2 提交成功后：内联成功态 vs 跳 `/thank-you`

**🔴 现状矛盾**：
- **现有 `<InquiryForm>`（566 行）已有内联 success 面板**
  （`successTitle` / `successBody` / `successDisclaimer`）→ 提交后**留在本页**。
- **目标站点地图有 `/thank-you`**（`README` §2.14），且要求
  「⚠️ 不要做成营销页」→ 暗示**提交后跳转到独立页**。

**→ 两种实现，请拍板：**

| | 内联成功态 | 跳 `/thank-you` |
|---|---|---|
| 现状 | ✅ 已实现 | ❌ 页面不存在 |
| 可测量性 | ⚠️ 转化事件全靠前端埋点 | ✅ 独立 URL，**转化追踪最硬**（GA4 / Ads 可精确归因） |
| 用户体验 | ⚠️ 用户可能重复提交 | ✅ 明确的「已完成」心理确认 |
| 后端配合 | 同页 | 需 `?ref=<inquiryId>` 或 sessionStorage 传递上下文 |

**★ 建议**：**跳 `/thank-you`**（转化追踪更硬），
**但保留内联 success 作为 POST 失败的降级**（网络中断时不让用户白填）。
→ 若采纳，`<InquiryForm>` 的 `copy.success*` 三个字段**降级为错误回退文案**，不删。

**⚠️ 本条与 `/thank-you` 规格强耦合 —— 两份规格必须同时定。**
