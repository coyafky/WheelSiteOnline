# `/thank-you` 页面规格（提交成功 · 极短确认页）

> **路由**：`/thank-you`
> **目标文件**：`src/app/thank-you/page.tsx`（**不存在，需新建**）
> **渲染**：静态壳（**转化事件已在 `/contact` 判定；本页不采集**）
> **数据**：`content/contact.ts`（响应承诺相关字段）+ `content/site.ts`
> **设计依据**：`../ARCHITECTURE/page-architecture/README.md` §2.14（极短）

---

## 0. 一句话

**这页只回答两个问题：「提交成功了吗？」「接下来会怎样？」**

**🔴 而且它绝对不能做成营销页** ——
`README` §2.14 原文：**「提交完就跳营销页会让客户怀疑没提交成功。」**

**⚠️ 这不是风格偏好，是转化心理学** —— 用户刚点完提交，处在「我做对了吗」的焦虑期。
**任何推销、任何新产品推荐、任何「顺便看看这些」都会让这个焦虑升级成怀疑。**

**→ 本页是全站唯一不允许出现 CTA 的页面。**

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §9 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/thank-you/page.tsx` 实测 **3 个 `<section>`**（2026-10-02）。

> 审计原文：① Confirmation（深色）→ ② Response promise → ③ Urgent contact。 **无 `DealerCta`**（代码注释 `thank-you/page.tsx:24` 说明理由）。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 你们收到了吗？ | ① Confirmation | `thankYouConfirm` + 条件 `referenceId` + 回首页文字链 | 深底 + 大号 ✓ 图标 | `← 返回首页`（**文字链，非按钮**，`:97-104`） | 无 | ✅ 合规 |
| **02** | 多久回我？ | ② Response promise | `thankYouResponsePromise`（window + note + nextStep） | 白底 + Clock 图标条 | 无 | 无 | ✅ 合规 |
| **03** | 急的话怎么找人？ | ③ Urgent contact | `thankYouUrgentContact`（条件渲染联系方式 / pendingNote） | 浅底 + 2 张卡 或 1 个提示条 | email / tel 链接 | `/contact` 文字链 | 🗑️ **建议合并进 02** |

**判定统计**：✅ 2 ｜ ⚠️ 拥挤 0 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 1

### 0.5.3 审计给出的处置

| # | 判定 | 审计发现（原文标题） |
|---|---|---|
| B-1 | 🗑️ | 视口 03（③ Urgent contact）：与 02 回答同一个问题的两个侧面 |

> 逐条理由与建议见 `_viewport-audit.md` §9 的 B 小节 —— **本文件不复制理由，只登记落点**。

### 0.5.4 高度预算与询盘整屏

| 项 | 要求 |
|---|---|
| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |
| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** （`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |
| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |

---

<!-- ASSET-REALIGNMENT-2026-10-02 -->
## 0.6 ★ 图片资产边界（2026-10-02）

提交成功页保持确认信息优先，不接入产品图片。图片不会增加确认信息，也不能替代 reference ID、响应说明或联系方式。

## 1. 页面骨架（三块式）

`README` §2.14 明确三块：**已收到 / 多久内回复 / 紧急联系方式**。

| 序 | 内容块 | 必须性 | 说明什么 | 段落类型 | 就绪度 |
|---|---|---|---|---|---|
| ① | **已收到（确认）** | 必须有 | 我们收到了你的询盘 | **确认** | ✅ |
| ② | **多久内回复（承诺）** | 必须有 | 响应窗口 + 通过什么渠道 | **承诺** | ❌ **需丰怀确认** |
| ③ | **紧急联系方式** | 必须有 | 如果很急，怎么找到人 | **兜底** | ❌ **需丰怀确认** |

**⚠️ 只有三块，不要再加第四块。** 竞品没有这一页（它用插件内联成功态），
所以**本页没有竞品底本可比 —— 它是一页「按纪律推导出来的页面」。**

```
/thank-you
├── ① <ThankYouConfirm>      Large check 图标 + H1 + 一句确认
├── ② <ResponsePromise>      ★ 响应窗口 + 渠道（未确认 → 不渲染，见下）
└── ③ <UrgentContact>        ★ 紧急通道（未确认 → 不渲染）
```

---

## 2. 逐块规格

### ① 已收到（ThankYouConfirm）

| 项 | 内容 |
|---|---|
| 图标 | `lucide-react` 的 **`Check`**（已用 24 图标之一）或 **`CheckCircle2`**；**不要用装饰性动效** |
| eyebrow | `INQUIRY RECEIVED` |
| H1 | **我们收到了你的询盘** |
| 一句 | ★ **「你的信息已进入我们的处理队列」** —— 这句是「成功」的**可验证表达** |
| 返回 | ⚠️ **一个安静的文字链接回首页**（`← 返回首页`），**不是按钮** |

**🔴 纪律**：
- ✅ H1 必须是**确认语气**（「我们收到了」），不是感谢语（「感谢你的咨询！」）
  —— 感谢语听起来像话术，确认语气听起来像系统回执
- ✅ **回显一个询盘编号（若有）** —— 若 `/contact` 走方案「跳转」，可带 `?ref=<inquiryId>`；
  **⚠️ 无 ID 时不得编造编号**（`INQ-2026-0001` 这类假编号是事故）
- ❌ **不加任何 CTA / 不推荐产品 / 不引导关注**

**props 契约**：

```ts
// src/components/sections/thank-you-confirm.tsx（需新建）
type ThankYouConfirmProps = {
  eyebrow: string;              // "INQUIRY RECEIVED"
  title: string;                // "我们收到了你的询盘"
  body: string;                 // "你的信息已进入我们的处理队列"
  /** ⚠️ 询盘编号 —— 仅在真的能拿到时传入；undefined 则整行不渲染 */
  referenceId?: string;
  /** 安静的回首页链接（不是按钮） */
  backLink: CtaLink;            // { label: "返回首页", href: "/" }
};
```

**🔴 禁止**：
- ❌ 用 `.btn-pill-solid` 做「继续浏览产品」（**这是营销，明确禁止**）
- ❌ 加「你可能也喜欢」「看看我们的轮毂」类模块
- ❌ 加庆祝动效 / 撒花 / 音效（轻浮，不符 B2B 专业感）
- ❌ 编造询盘编号

### ② 多久内回复（ResponsePromise）

**★ 这是本页的**核心**，也是本页唯一的**数据依赖**。**

| 元素 | 内容 | 就绪度 |
|---|---|---|
| 响应窗口 | ⚠️ 「我们会在 **X 个工作小时内**回复」 | ❌ **需丰怀确认** |
| 回复渠道 | 从哪个邮箱 / WhatsApp 回复（客户好加白名单） | ⚠️ 需丰怀确认 |
| 下一步说明 | 「如果资料不全，我们会在回复里向你确认」 | ✅ 可写 |

**🔴 纪律**：
- ❌ **不得编响应窗口** —— 「24 小时内回复」是一个**承诺**，承诺不了就不能写
- ✅ `responsePromise` 为 `undefined` → **整块不渲染**（不留占位）
- ✅ 若只确认了窗口但没确认渠道 → **只渲染窗口**（字段级条件渲染）
- ⚠️ **响应窗口必须与 `/contact` ④ 的 `responsePromise` 用同一个数据源** ——
  **两页不一致是事故**（`contact.md` §2④ 与本页共享 `contact.responsePromise`）

**props 契约**：

```ts
// src/components/response-promise.tsx（★ 与 /contact ④ 共用数据源）
import type { CtaLink } from "@/content/types";

type ResponsePromiseProps = {
  /** ⚠️ 未确认时为 undefined → 整块不渲染 */
  promise?: {
    /** "2 个工作日" / "24 小时" —— ★ 必须与 /contact 完全一致 */
    window: string;
    /** 从哪个渠道回复，如 "sales@…" —— 未确认则只渲染 window */
    channel?: string;
  };
  /** 下一步说明（不依赖丰怀，可写） */
  nextStepNote: string;   // "如果资料不全，我们会在回复里向你确认"
};
```

### ③ 紧急联系方式（UrgentContact）

**「如果很急，怎么找到人」** —— 这是兜底块，不是主转化块。

| 元素 | 内容 | 就绪度 |
|---|---|---|
| WhatsApp | ⚠️ 商务号 | ❌ **需丰怀确认** |
| 邮箱 | ⚠️ 公司邮箱 | ❌ **需丰怀确认** |
| 电话 | ⚠️ 可选 | ❌ **需丰怀确认** |

**🔴 纪律**：
- ❌ **不做假号** —— 未确认的渠道**整行不渲染**
- ✅ 措辞纪律：「**如果比较紧急，你可以在 X 直接找到我们**」——
  **不要说「还没收到回复？」**（暗示我们会漏，削弱 ②  的承诺）
- ⚠️ **本块优先复用 `<ContactDetails>`**（`/contact` ④ 的组件），
  以 `variant="urgent"` 区分 —— **不要另建一个只显示联系方式的组件**

**props 契约**：**复用 `<ContactDetails>`**（见 `contact.md` §3.2）。

```ts
type ContactDetailsProps = {   // 与 /contact ④ 同一个组件
  eyebrow: string;
  heading: string;
  email?: string;
  whatsapp?: string;
  phone?: string;
  responsePromise?: { window: string; channel: string };
  address?: string;
  variant?: "default" | "urgent";   // ★ 本页用 "urgent"
};
```

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 |
|---|---|---|
| **`<ContactDetails>`** | `src/components/contact-details.tsx`（**`/contact` 规格新建**） | 第 ③ 段，`variant="urgent"` |
| `Check` / `CheckCircle2` | `lucide-react` | 第 ① 段图标（已用图标库成员） |
| — | `src/components/ui/button.tsx` | ⚠️ **零使用，不 import** |

**⚠️ 本页几乎全部复用** —— 这符合「这页不该有工作量」的判断。

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| `<ThankYouConfirm>` | `src/components/sections/thank-you-confirm.tsx` | 确认块（图标 + H1 + 回显） | 本页 |
| **`<ResponsePromise>`** | `src/components/response-promise.tsx` | 响应承诺 | **2 页** ★ 与 `/contact` ④ 同数据源 |

**★ 提取纪律**：`<ResponsePromise>` 与 `<ContactDetails>` **必须同名同路径跨越两页** ——
**响应承诺是同一个事实，不允许两页各写一遍。**

---

## 4. 数据契约

### 4.1 复用 `content/contact.ts` 的响应承诺字段

```ts
// src/content/contact.ts —— 本页与 /contact 共用
export const contactResponsePromise: {
  window: string;      // ⚠️ 需丰怀确认："2 个工作日"
  channel?: string;    // ⚠️ 需丰怀确认："sales@…"
} | undefined = undefined;   // ★ 未确认 = undefined，两页同步「不渲染」

export const thankYouCopy = {
  eyebrow: "INQUIRY RECEIVED",
  title: "我们收到了你的询盘",
  body: "你的信息已进入我们的处理队列",
  nextStepNote: "如果资料不全，我们会在回复里向你确认",
  backLabel: "返回首页",
} as const;
```

**🔴 关键**：`contactResponsePromise` 是**单一数据源** ——
`/contact` ④ 与 `/thank-you` ② **读同一个常量**，未确认时两页同步不渲染。
**禁止在两页各写一份响应窗口文案。**

### 4.2 就绪度总表

| 块 | 依赖 | 就绪度 |
|---|---|---|
| ① 已收到 | 文案 + 询盘编号（可选） | ✅ |
| ② 多久回复 | **响应承诺（窗口 + 渠道）** | ❌ **需丰怀确认** |
| ③ 紧急联系 | **邮箱 / WhatsApp / 电话** | ❌ **需丰怀确认** |

**→ 3 块里 2 块阻塞在丰怀的联系方式与响应承诺上。**
**⚠️ 未确认前，本页可上线的只有 ①（单块），但那意味着页面只完成 1/3 ——
建议与 `/contact` 同批拿到丰怀信息后再上线。**

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180） |
| 布局 | **居中单列**，`max-w-[720px]` —— 极短页不要拉宽 |
| 垂直 | 顶部留白较厚（`pt-[140px]` 级别，与站内页头节奏一致） |
| 深色段 | **无** —— 保持明亮、平静（与 `/contact` 一致） |
| 栅格 | ③ 联系块 `grid-cols-1 md:grid-cols-2`（邮箱 / WhatsApp 并列） |
| 动效 | ⚠️ **只给 ① 的图标一个 `[data-reveal]` 淡入，其余不做动效** —— 不要错峰、不要庆祝性动画 |
| 🔴 fail-visible | **不要自己加 `opacity-0`** |
| 图标 | `Check` 用 `text-forge`（#c2650a）—— **唯一允许的品牌色点缀** |
| 按钮 | ❌ **本页没有主按钮**；① 的回首页是**文字链接** |

**★ 视觉基调**：**安静、确认、无压力。** 本页不该有任何元素在「催」用户做事。

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 就绪度 |
|---|---|---|---|
| **1** | **响应承诺窗口**（多久回复） | **② 整块** | ❌ **需丰怀确认（与 `/contact` 同源）** |
| **2** | **响应渠道**（从哪个邮箱/号回复） | ② | ❌ **需丰怀确认** |
| **3** | **公司邮箱** | ③ | ❌ **需丰怀确认** |
| **4** | **WhatsApp / 电话商务号** | ③ | ❌ **需丰怀确认** |
| **5** | **是否传询盘编号**（决定 `/contact` 跳转方案，见 `contact.md` 附 B.2） | ① | 🔴 **待拍板** |
| **6** | 询盘编号格式（若传） | ① | ⚠️ 需与后端约定 |
| **7** | `/contact` 是内联成功态还是跳本页 | 本页是否上线 | 🔴 **待拍板（`contact.md` 附 B.2）** |

**🔴 响应承诺必须与 `/contact` ④ 完全一致 —— 两页不一致是事故。**

---

## 附：与设计文档的对应

| 本规格的块 | 设计依据 |
|---|---|
| 三块式 | `README.md` §2.14 |
| 「不要做成营销页」 | `README.md` §2.14（原句引用） |
| 已收到 / 多久回复 / 紧急联系 三块 | `README.md` §2.14 |
| 响应承诺与 `/contact` 同源 | `contact-page.md` §5 + §9 #3 |
| 无竞品底本 | 竞品用插件内联成功态，未设独立页 |
