# `/dealers` 页面规格（经销商供货 · 全站转化最重的一页）

> **路由**：`/dealers`
> **目标文件**：`src/app/dealers/page.tsx`（已存在，需按本规格重排）
> **渲染**：全静态（无客户端状态；FAQ 折叠是唯一的 client 岛）
> **数据**：`content/dealer-programs.ts`（已有 7 个导出）+ `content/faq.ts` + `assets/` 实测数字
> **设计依据**：`../../ARCHITECTURE/page-architecture/dealers-page.md`
>
> **本规格版本**：v2（2026-10-02）—— 由「十二段式」升级为**视口驱动**。
> v1 把这一页写成「第 ①–⑫ 段」，那是**内容块清单**，不是视口切分。
> v2 补 §0.5，按 `_viewport-audit.md` §10 的实测，把 7 个实际段收敛为 **7 个视口**，
> 并消化审计给的 4 条处置建议。**⚠️ 段序本身要重新评估** —— 见 §0.5.3。

---

## 0. 一句话

**这是全站唯一一页「主语是经销商、不是我们」的页面** ——
竞品这一页 14 段里 **11 段的主语是「你」**，我们不写「我们的工艺多好」，
只写**「你的成本、你的客户、你的风险」**。

**⚠️ 而且这是全站「外部输入依赖」最重的一页之一** ——
起订量 / 交期 / 生产照片 / 会员费 **四组数字全部未确认**，
**未确认前相关段落只能写占位**，不能编。

---

## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本页是审计报告 `_viewport-audit.md` §10 判为**需重构**的两页之一
> （另一页是 `/products`）—— 因为 7 个实际段里**有 4 处需要处置**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**（`src/app/dealers/page.tsx`，2026-10-02 实测）：**7 个 `<section>`**。

| # | section 标题（`aria-labelledby`） | v1 十二段里对应哪几段 |
|---|---|---|
| 1 | `dealers-title` | ① 核心主张 |
| 2 | `model-title` | ② 信任带（`StatStrip`）+ ③ 对号入座 + ④ 四大风险 —— **实测合成一段** |
| 3 | `programmes-title` | ⑤ 六个能力卡 + ⑥ 目录优势 —— **实测合成一段** |
| 4 | `onboarding-title` | ⑦ 六步下单流程 |
| 5 | `shipping-title` | ⑧ 可追溯点 + ⑨ 定位承诺 —— **实测是左右分栏的同一 section** |
| 6 | `dealer-faq-title` | ⑪ FAQ |
| 7 | `dealer-pathways-title` | ⑩ 路由 |
| — | （`DealerCta`，无自己的 `aria-labelledby`） | ⑫ 收束 CTA |

**🔴 关键落差**：**v1 的十二段里有 6 段在代码里根本不存在**，或者被合并进了别的
section（② / ③ / ④ 挤在一段，⑤ / ⑥ 挤在一段，⑧ / ⑨ 挤在一段）。
**「十二段式」是设计蓝图，不是实现现状** —— 施工时以本节实测为准。

### 0.5.2 七个视口（本页定案）

| 视口 | 核心问题（一句话） | 含哪些段 | 主要信息（1） | 主要视觉（1） | 主要行动（1） | 次要行动（0–2） | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 为什么跟你们做？ | Hero | `dealerHero` | 深色径向橙光 | `Start a dealer enquiry` → `/contact` | `Private label programme` | ✅ |
| **02** | 合作模式是什么？ | model | `dealerModel` + 勾选列 | 左文 + 右卡 | 无 | 无 | ✅ |
| **03** | 有哪几种合作方式？ | programmes | 三张 programme 卡 | 3 列卡 | ⚠️ 见 §0.5.3 B-1 | 无 | ⚠️ 拥挤 |
| **04** | 开始之后怎么走？ | onboarding | 六步流程 | 3×2 步条 | 无 | 无 | ✅ |
| **05** | 货运和可追溯性怎么算？ | shipping + **F 可追溯** | 两组勾选列 | 左右分栏 | 无 | 无 | ⚠️ 一屏两问题（§0.5.3 B-2） |
| **06** | 常见问题？ | FAQ | 6 条 | 左标题 + 右列表 | 无 | 无 | ⚠️ 跨页重复（§0.5.3 B-3） |
| **07** | 接下来去哪？ | pathways **+ `DealerCta`** | 三出口 + 询盘 | 3 列卡 + 橙底 | `Request a quote` | email | 🗑️ 合并（§0.5.3 B-4） |

### 0.5.3 ★ 审计给出的 4 条处置建议（本文档的落点）

审计（`_viewport-audit.md` §10 B-1–B-4）对本页给出 4 条，**全部保留原文结论**，
此处只做「落到哪一段」的映射：

| # | 审计判定 | 处置 | 落点 |
|---|---|---|---|
| **B-1** | ⚠️ 视口 03 三卡各是一个出口，且与视口 04 回答同一决策的前后半 | 三卡内链降级：只保留 `Private label` 一条（与 Hero 次 CTA 同目的地 → **合并，保留 Hero 的**），其余两条改纯文本 | 视口 03 |
| **B-2** | ⚠️ 视口 05/06 在一个 `<section>` 里并列两个不同问题（货运 / 可追溯性） | 拆成两屏，**或**按 `DESIGN.md` §0.5.2 合并为「交付与可见性」一个问题 | 视口 05 |
| **B-3** | ⚠️ `/dealers` 与 `/products` 的 FAQ **逐字相同**（同一 `faqs` 数组） | `content/faq.ts` 拆成 `dealerFaqs` / `productFaqs`；**或** 删 `/products` 的 FAQ 段（`products/index.md` §0.5.3 已要求删） | 视口 06 |
| **B-4** | 🗑️ 视口 07 pathways 与视口 08 `DealerCta` **回答同一个问题（下一步）** | 删 pathways，保留 `DealerCta`；若必须保留 `/dealers/private-label` 与 `/custom-development` 入口，**并入 `DealerCta` 作次级文字链** | 视口 07 |

**⚠️ B-2 的两条路怎么选**（本文档不定案，标为待补 §6）：
- **拆两屏** —— 视口数 7 → 8，但两屏各自回答一个真问题
- **合并为一屏（「你的货怎么走，以及你能看到什么」）** —— 保持 7 视口，
  但**必须重写标题**，让这一屏自称回答一个问题（现状标题只有一个 `shipping-title`，
  右半边没有自己的标题 → 读者不知道这里有两个问题）

**🔴 审计的一个方法论提醒（不是判据，但影响判断）**：
B-4 原文指出「**规格是在旧的『段』视角下写的**；
按 §0.5.2，两者回答同一个问题（下一步）」。
**→ 本页的旧段序（⑩ 路由在 ⑪ FAQ 之后）本身就是按「段」排的**
（⑩ 路由 → ⑪ FAQ → ⑫ 收束 CTA），而实测代码里路由此 FAQ **更靠后**。
**段序需要在新判据下重新评估**，不要照抄 v1 的 ①–⑫ 编号。

### 0.5.4 全页高度预算

| 视口 | 目标高度 | 说明 |
|---|---|---|
| 01 Hero | ≈ 1 屏 | 深色 |
| 02–04 | 各 ≈ 0.7–0.9 屏 | 文本 + 卡 |
| 05 | ≈ 0.8 屏（拆两屏则各 0.6） | 见 B-2 |
| 06 FAQ | ≈ 0.8 屏 | 折叠态只显示问题 |
| 07 收口 | ≈ 0.5 屏 | **询盘组件必须完整落在视口内** |

**合计目标 ≈ 5.5 屏。** v1 未给预算 —— v2 补上：**这是「全站转化最重的一页」**，
长是应该的，但**每一屏都要能说清自己在回答什么**。

---

## 1. 页面骨架（十二段设计蓝图）

> **⚠️ 读法**：「十二段」是**内容块清单**（每段放什么内容），
> **不是视口切分** —— 视口见 §0.5.2。两轴的关系：
> **7 个视口 ← 十二个内容块**（例如视口 02 装了三段内容）。
> **施工时先按 §0.5.2 定视口，再按本表往视口里放段。**

| 序 | 内容块 | 必须性 | 说明什么 | 段落类型 | 字数目标 | 实测落在哪个视口 |
|---|---|---|---|---|---|---|
|---|---|---|---|---|---|
| ① | 核心主张 | 必须有 | 不囤货，且不必从零描述需求 | 主张 | ≤90 | **视口 01** |
| ② | **信任带（四数字）★** | 必须有 | 型号数 / 配置数 / 尺寸范围 / 表面处理 | 事实带 | ≤40（四条） | **视口 02** |
| ③ | 对号入座 | 必须有 | 你只卖过现货？/ 你在找第二供应源？ | **T2 痛点** | ~90 | **视口 02** |
| ④ | 四大风险 | 必须有 | 资金 / 交期 / 纠纷 / 供应商黑箱 | **T2 痛点** | ~180 | **视口 02** |
| ⑤ | 我们给你什么 | 必须有 | 六个能力卡 | 方案 | ~200 | **视口 03** |
| ⑥ | **目录优势 ★** | 必须有 | 1018 型号 + 3485 配置 + 规格透明 | 方案 | ~120 | **视口 03** |
| ⑦ | 六步下单流程 | 必须有 | 含「开料前批准」 | 流程 | ~180 | **视口 04** |
| ⑧ | **可追溯点** | ⚠️ 条件性 | 你能看到什么 | **T6 证据** | ~100 | **视口 05** |
| ⑨ | 定位承诺 | 必须有 | 你做卖家，我们在背后 | 承诺 | ~90 | **视口 05** |
| ⑩ | 路由 | 必须有 | → 贴牌 / 定制开发 / 轮毂目录 | **T7** | ~90 | **视口 07** |
| ⑪ | FAQ | 必须有 | 8–10 条 | FAQ | — | **视口 06** |
| ⑫ | 收束 CTA | 必须有 | ≤80 字 + WhatsApp | **T8** | ≤80 | **视口 07** |

**⚠️ ⑧ 段有硬性前置**：**若丰怀不能提供生产节点照片/视频，这一段必须整段删掉** ——
不能承诺做不到的事（见 `dealers-page.md` §5⑧）。删掉后变为**十一段式**。

```
/dealers
├── ① <DealerHero>            eyebrow + H1 + 主张 + 3 CTA（含 WhatsApp）
├── ② <StatStrip>  ★           四数字（CompanyStat[] → isPlaceholder 标记）
├── ③ <RouteBlock>            两个对号入座入口（T2）
├── ④ <RiskGrid>              四风险卡（T2）
├── ⑤ <CapabilityGrid>        六能力卡（复刻竞品格式）
├── ⑥ <CatalogueAdvantage>    ★ 目录优势 + 筛选器截图
├── ⑦ <ProcessSteps>          六步（复用 FlowStep[]）
├── ⑧ <TraceabilityBlock>     ⚠️ 条件渲染（丰怀确认后才有）
├── ⑨ <SellerPromise>         定位承诺
├── ⑩ <RouteBlock>            T7 三出口（→ 贴牌 / 定制 / 目录）
├── ⑪ <FaqAccordion>  ★        8–10 条
└── ⑫ <DealerCta>             ≤80 字收束
```

---

## 2. 逐块规格

### ① 核心主张（DealerHero）

| 项 | 内容 |
|---|---|
| eyebrow | `DEALER SUPPLY` |
| H1 | **按需生产轮毂，不用先囤货** |
| 主张句 | 竞品原话「卖定制轮毂，不用先囤货」+ 我们的增量：「而且不必从零向供应商描述你要什么 —— 目录里 1018 个型号、3485 个配置，**你直接选规格**」 |
| 主 CTA | `.btn-pill-solid` → `/contact` |
| 次 CTA | `.btn-pill-outline` → **WhatsApp 直聊**（⚠️ 商务号待确认） |

**★ WhatsApp 预填纪律**（学竞品，`dealers-page.md` §5①）：点 WhatsApp 时**模板已带好要问的字段**：
`车型 / 目标尺寸 / 风格 / 表面处理 / 数量 / 发运地`。
⚠️ 商务号未确认前，次 CTA **降级为邮件链接**，不做假号码。

**props 契约**：

```ts
// src/components/sections/dealer-hero.tsx（需新建；现有页面是内联的）
type DealerHeroProps = {
  eyebrow: string;
  title: string;
  lede: string;
  primary: CtaLink;      // { label, href }
  secondary?: CtaLink;   // WhatsApp / mailto —— 若无则整行不渲染
  whatsappPrefill?: string;  // 预填模板（未确认商务号时为 undefined）
};
```

### ② ★ 信任带（StatStrip）

**⚠️ 竞品这四条全是「减负」（起订小/输入少/交期明/可追溯），我们的是「给选择」（因为有数据）。**
**两种都成立，但不得混着写** —— 我们的四条全部是**事实陈述**：

| # | 数字 | 值 | 就绪度 |
|---|---|---|---|
| 1 | 在册型号 | **1018**（有图上架） | ✅ 实测 |
| 2 | 可下单配置 | **3485** 个 variant | ✅ 实测 |
| 3 | 尺寸范围 | **15–20 寸** + HP + 越野款 | ✅ 实测 |
| 4 | 表面处理 | **数十种**（679 个去重值） | ✅ 实测（⚠️ 不写 679，因含近似重复） |

**🔴 禁止**把竞品四条（MOQ / VIN / 20-30 天 / 生产节点）写在这 —— **全部未确认**。

**props 契约**：

```ts
// src/components/stat-strip.tsx（★ 公共组件，4 页复用；见 §3.2）
import type { CompanyStat } from "@/content/types";

type StatStripProps = {
  stats: CompanyStat[];        // { index, label, value, body, isPlaceholder }
  variant?: "light" | "dark";  // 本页用 light
  columns?: 2 | 4;
};
```

**交互纪律**：
- ✅ 数字用 `font-display`（瘦长，视觉锚点）
- ✅ `isPlaceholder: true` 的条目**必须渲染可见的「待确认」角标**（类型已内建此意图）
- ❌ **不得显示任何未经丰怀确认的数字**

### ③ 对号入座（T2）

**两个入口**（比竞品多一个）：

| 入口 | 文案 | 指向 |
|---|---|---|
| A | **你只卖过现货轮毂** → 先看这里 | 锚点到 ④ 四风险 |
| B | **你已有定制供应商，想找第二备份源** → 看流程与可追溯 | 锚点到 ⑦⑧ |

**⚠️ 入口 B 是我们的增量** ——「第二供应源」是真实且常见的经销商需求，竞品没覆盖。
**⚠️ 但需要丰怀确认「是否认这个定位」**（见 §6 #8）。

**props 契约**：

```ts
// src/components/route-block.tsx（★ 公共组件，8+ 页复用；见 §3.2）
import type { RouteStep } from "@/content/types";

type RouteBlockProps = {
  eyebrow: string;
  heading?: string;
  items: RouteStep[];          // { step, title, body, href, linkLabel }
  columns?: 2 | 3;             // T2 用 2，T7 用 3
  variant?: "light" | "soft" | "dark";
};
```

**⚠️ 复用纪律**：`RouteStep` 是**站内既有类型**（`types.ts:105`），
**⑩ 路由段也用它** —— 同一页两处同名组件、不同 `columns`，**不要各起一个名字**。

### ④ 四大风险（T2，本页精华）

**竞品四条，全部可借**（`dealers-page.md` §5④）：

| # | 风险 | 写法要点 | 通用性 |
|---|---|---|---|
| 1 | **资金压在库存上** | 囤货把店变成仓库 | ✅ 全通用 |
| 2 | **承诺一个你控制不了的日期** | ★ **别在第一条消息就报交期** | ✅ 全通用 |
| 3 | **落到你桌上的纠纷** | 客户第一个电话打给你 | ✅ 全通用 |
| 4 | **供应商变成黑箱** | 最怕付了定金然后没消息 | ✅ 通用 → 但**要在 ⑧ 自证不是黑箱** |

**★ 第 2 条是极高明的销售建议** —— 它不是推销自己，是**教经销商做事**。
**教客户做事的供应商，看起来更像专家。**

**🔴 纪律**：**不能只列风险不给答案** —— 每个风险卡必须有**一行「我们怎么处理」**，
否则这一段变成恐吓营销。

**props 契约**：

```ts
// src/components/risk-grid.tsx（仅本页）
type RiskCard = {
  index: string;        // "01"
  risk: string;         // 客户的处境
  answer: string;       // ★ 我们怎么处理 —— 必填
};
type RiskGridProps = {
  eyebrow: string;
  heading: string;
  risks: RiskCard[];    // 恰好 4 个
};
```

### ⑤ 六个能力卡

**格式照抄竞品**：小标签 + **加粗一句话** + 一段说明。

| # | 标签 | 加粗句 | 是否独有 |
|---|---|---|---|
| 1 | 按需下单 | **客户先有需求，再下单** | — |
| 2 | 从参考到生产 | **把一张参考图变成可生产订单** | — |
| 3 | **规格透明** | **直接查规格，不用来回猜** | **★ 我们独有** |
| 4 | 贴牌支持 | Logo / 中心盖 / 包装可以早做 | — |
| 5 | 复购复用 | **把上次成交的那套存下来** | — |
| 6 | 订单可见 | **订单走到哪一步你能看到** | — |

**⚠️ 第 3 张卡是核心差异** —— 竞品六卡里没有这条，**因为它没有规格数据**
（它的单品页一个数字都没有）。

**props 契约**：

```ts
// src/components/capability-grid.tsx（本页 + 贴牌页 ⑤ 复用）
type CapabilityCard = {
  eyebrow: string;      // 小标签
  title: string;        // ★ 加粗一句话
  body: string;         // 一段说明
  isDifferentiator?: boolean;  // ★ 规格透明 → 加视觉强调
};
type CapabilityGridProps = {
  eyebrow: string;
  heading: string;
  items: CapabilityCard[];     // 6 个（本页）/ 4 个（贴牌页）
  columns?: 2 | 3;
};
```

### ⑥ ★ 目录优势（竞品完全没有的一段）

**这是相对竞品的核心差异，必须单独成段。**

| 元素 | 内容 |
|---|---|
| 数字行 | 1018 个在册型号 · 3485 个可下单配置 |
| 范围行 | 15–20 寸 + HP / 越野款 |
| 能力行 | 按尺寸 / PCD / 工艺 / 表面处理筛选 |
| 规格行 | 每个配置带真实 PCD / ET / CB |
| **视觉证据** | 目录筛选器**截图或示意** |
| CTA | → `/products/wheels` |

**🔴 三条纪律**（`dealers-page.md` §5⑥）：
1. **不写工艺覆盖为 100%** —— 只有 38% 有标注（512/1349）
2. **不写「全部适配某车型」** —— `suitableVehicles` 全空
3. **数字必须与站点实际一致** —— 上架型号数变了这段要改

**⚠️ 视觉证据的真相**：`public/images/` **当前零张真实图**（只有 `.gitkeep`）。
**本段的「筛选器截图」是唯一不需要实拍素材的证据**（可以截当前已实现的筛选器 UI）
→ **但筛选器本身（`<WheelFilterBar>`）尚未实现**，是本段的**传递性阻塞**。

### ⑦ 六步下单流程

```
01 你的客户有真实项目   → 车型 / 尺寸 / 风格 / 表面 / 数量 / 发运地
02 我们评审并报价       → 按实际项目报价（不是价目表）
03 确认订单             → 形式发票 + 定金
04 ★ 开料前批准         → 切金属前确认全部细节
05 生产                 → 进度可见
06 尾款、发运与跟踪     → 运单号
```

**⚠️ 第 04 步「开料前批准」必须保留**（`dealers-page.md` §2.3）——
它同时说清风险控制点、建立专业感、保护双方。
**⚠️ 但我们不写 20-30 天** —— 交期未确认，第 05 步不写具体天数。

**props 契约**（复用站内既有 `FlowStep` 类型）：

```ts
// src/components/process-steps.tsx（6+ 页复用；见 §3.2）
import type { FlowStep } from "@/content/types";

type ProcessStepsProps = {
  eyebrow: string;
  heading: string;
  steps: FlowStep[];           // { step, title, body }
  variant?: "light" | "dark";
  highlightStep?: string;      // ★ 本页传 "04" —— 开料前批准高亮
};
```

### ⑧ 可追溯点（T6，⚠️ 条件性整段）

**竞品三个**：工程评审 / CNC 进度 / 成品检查。

**🔴 🔴 硬性纪律**：
> **如果丰怀不能提供生产照片/视频，这一段必须整段去掉 —— 不能承诺做不到的事。**

**就绪度判断**：待确认前，本段**渲染为「不显示」**（不是渲染占位）。
这样删掉后页面是干净的十一段式，不留空壳。

**若能提供**，则用 `<DataNotice>` 同族的**证据块**：

```ts
// src/components/traceability-block.tsx（本页 + 贴牌页 ⑨ 复用）
type TraceabilityPoint = {
  stage: string;      // "工程评审" / "CNC 进度" / "成品检查"
  what: string;       // 客户能看到什么
  when: string;       // 在流程的哪一步
};
type TraceabilityBlockProps = {
  eyebrow: string;
  heading: string;
  points: TraceabilityPoint[];
  onRemoveIfUnavailable?: true;   // ★ 语义标记：本块受丰怀政策开关控制
};
```

### ⑨ 定位承诺

**竞品**：*"You stay the seller. 2N stays behind you."*
> 不是推荐计划，客户还是你的客户。你控制本地报价、定价、服务和关系。

**★ 这条我们能直接用 —— 而且要保持原文精神。**

**🔴 必须写清边界**：我们会做到什么、**不会做什么（不直接联系你的客户）**。
**⚠️ 这是承诺，写之前需丰怀确认**（尤其「不直接联系你的客户」这一条商业政策）。

### ⑩ 路由（T7）

**三个出口**（合并竞品第 5/10/11 段）：

| 出口 | 一句话 | href |
|---|---|---|
| **贴牌** | 什么时候该把你的名字印上去 | `/dealers/private-label` |
| **定制开发** | OEM / ODM / 按图纸做 | `/custom-development` ⚠️ 页面不存在 |
| **轮毂目录** | 1018 个型号直接看 | `/products/wheels` |

**props 契约**：**复用 `<RouteBlock>`**（与 ③ 同一个组件），`columns={3}`、`items: RouteStep[]`。

**🔴 禁止**：新增第三个组件名（如 `<PathwayCards>`）。**同一形态必须同一个组件**。

### ⑪ FAQ（8–10 条）

**竞品 7 条，全部可借结构**。**复用 `<FaqAccordion>`**（★ 公共组件，5+ 页复用）。

| # | 问题 | 能不能答 | 就绪度 |
|---|---|---|---|
| 1 | 能不能不囤货当经销商？ | ✅ | ✅ |
| 2 | **有会员费吗？** | ⚠️ 待确认 | ❌ |
| 3 | **有年度最低量吗？** | ⚠️ 待确认 | ❌ |
| 4 | 有经销商价吗？ | ✅（按项目报） | ✅ |
| 5 | **能从小批量开始吗？** | ⚠️ 待确认起订量 | ❌ |
| 6 | 一个订单能混尺寸 / 前后配吗？ | ✅ 能（3485 variant 支持） | ✅ |
| 7 | ★ **该先向客户收集什么？** | ✅ | ✅ |
| 8 | 单套发运成本高吗？（吸收竞品第 5 段物流内容） | ✅ | ⚠️ 贸易条款待确认 |

**★ 第 7 条「该先向客户收集什么」= 直接把销售话术给了经销商** ——
**这是全页最实用的 FAQ**，必须保留。
**⚠️ 第 8 条吸收了竞品第 5 段**：单套发运成本高 / 多单可合并 / **物流时间 ≠ 生产时间**。

**props 契约**：

```ts
// src/components/faq-accordion.tsx（★ 公共组件，5+ 页复用；见 §3.2）
import type { FaqEntry } from "@/content/types";

type FaqAccordionProps = {
  eyebrow?: string;
  heading: string;
  items: FaqEntry[];           // { question, answer }
  defaultOpen?: number;        // 首条默认展开（可选）
  variant?: "light" | "soft";
};
```

### ⑫ 收束 CTA（T8，≤80 字）

**竞品 61 字**：*"YOUR SHELVES STAY LIGHTER. YOUR ORDER BOOK DOESN'T HAVE TO GET SHORTER."*

**⚠️ 必须 ≤80 字**（`content-design-and-new-pages.md` §1.1 规律二）。
**🔴 结尾不要再一大段** —— 这是 T8 段的纪律。

**组件**：**复用 `<DealerCta>`**（`sections/dealer-cta.tsx`，全站 21 处复用）。
**⚠️ props 只有 `{ title?, body? }`** —— 本页传自定义 `title`，`body` 控制 ≤80 字。

```ts
type DealerCtaProps = {
  title?: string;   // 本页："让货架更轻，让订单本不必更薄"
  body?: string;    // ★ ≤80 字
};
```

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 |
|---|---|---|
| `<DealerCta>` | `src/components/sections/dealer-cta.tsx` | 第 ⑫ 段收束（**21 处复用的全站冠军**） |
| — | `src/components/ui/button.tsx` | ⚠️ **零使用，不要 import** —— 按钮用 `.btn-pill-*` 类 |

**⚠️ 本页复用率偏低** —— 因为 `/dealers` 是全站结构最独特的一页。
**但这不意味着要新建 8 个一次性组件** —— 下面 4 个公共组件必须走公共目录。

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<StatStrip>`** | `src/components/stat-strip.tsx` | 四数字信任带（含占位角标） | **4 页**（/dealers /about /products/wheels /manufacturing） |
| **`<RouteBlock>`** | `src/components/route-block.tsx` | 对号入座 + T7 路由（同一组件两形态） | **8+ 页** |
| **`<FaqAccordion>`** | `src/components/faq-accordion.tsx` | FAQ 折叠列表 | **5+ 页**（/dealers /private-label /products /fitment /support） |
| **`<ProcessSteps>`** | `src/components/process-steps.tsx` | 有序流程（可高亮某步） | **6+ 页** |
| **`<DataNotice>`** | `src/components/data-notice.tsx` | 数据来源 + 免责 | **全部产品/证据页** |
| `<DealerHero>` | `src/components/sections/dealer-hero.tsx` | 页头 + 3 CTA | 本页（贴牌页另建自己的 hero） |
| `<RiskGrid>` | `src/components/risk-grid.tsx` | 四风险卡 | 本页 |
| `<CapabilityGrid>` | `src/components/capability-grid.tsx` | 能力卡（6 / 4） | **2 页**（/dealers /private-label） |
| `<CatalogueAdvantage>` | 内联（用 `<StatStrip>` + 一句） | 目录优势 | 本页 |

**★ 提取纪律**：`<StatStrip>` `<RouteBlock>` `<FaqAccordion>` `<ProcessSteps>` `<DataNotice>`
**从第一天就放进 `src/components/`**，**不要先写在页面文件里** ——
否则第二页必然复制（`products/wheels.md` §3.2 同一条纪律）。

---

## 4. 数据契约

### 4.1 现有内容模块（`src/content/dealer-programs.ts`，7 个导出，可直接接）

```ts
// ✅ 已存在，页面应直接 import，不要重写
export const dealerPrograms: DealerProgram[];          // 能力卡 → ⑤
export const dealerHero: { /* eyebrow, title, lede, … */ };  // → ①
export const dealerModel: AnswerBlock;                 // → ①/⑥
export const dealerOnboarding: FlowStep[];             // → ⑦ 六步
export const dealerShipping: { eyebrow; heading; body; points };  // → ⑪ 物流 FAQ
export const dealerTraceability: { eyebrow; heading; body; points };  // → ⑧（含 PLACEHOLDER 行）
export const dealerPathways: ResourceLink[];           // → ⑩ 路由
```

**🔴 关键**：`dealerTraceability.points` 与 `dealerShipping` 里**已含 `PLACEHOLDER:` 前缀的条目** ——
**这些正是未确认项，不能直接上页面**。规格要求：**渲染层必须过滤/标旗**（见 4.3）。

### 4.2 信任带（第 ② 段）——新增数据

```ts
// src/content/dealer-programs.ts 追加
import type { CompanyStat } from "@/content/types";

export const dealerStats: CompanyStat[] = [
  { index: "1", label: "在册型号",   value: "1018",      body: "有图上架型号", isPlaceholder: false },
  { index: "2", label: "可下单配置", value: "3485",      body: "尺寸 × 孔距 × 偏距 × 中心孔 × 表面", isPlaceholder: false },
  { index: "3", label: "尺寸范围",   value: "15–20 寸",  body: "含 HP 与越野款", isPlaceholder: false },
  { index: "4", label: "表面处理",   value: "数十种",    body: "按单色 / 车面 / 全涂装 / 压盘双色分组", isPlaceholder: false },
];
```

### 4.3 占位渲染规则（🔴 本页最重要的一条数据纪律）

```ts
// 判定：任何 value/body 含 "PLACEHOLDER" 前缀，或 isPlaceholder===true
type PlaceholderPolicy = {
  /** 是否渲染未确认条目。本页 = "flag"（渲染并标旗），不是 "hide"。 */
  mode: "flag";
  /** 标旗文案 —— 中英双语，避免内部术语泄漏到线上。 */
  flagLabel: "待确认";
};
```

- ✅ `isPlaceholder: true` → **渲染 + 可见角标**（`CompanyStat` 类型已内建此意图）
- ❌ **不含 PLACEHOLDER 的行才能当作确定事实**
- 🔴 **不得把 `PLACEHOLDER:` 字符串原样输出到页面**（内部标记，不是文案）

### 4.4 就绪度总表（逐段）

| 段 | 数据来源 | 就绪度 |
|---|---|---|
| ① 主张 | 文案 + WhatsApp 号 | ⚠️ 需确认主张 + 商务号 |
| ② 信任带 | `assets/` 实测 | ✅ 齐 |
| ③ 对号入座 | 文案（通用） | ⚠️ 「第二供应源」定位需丰怀认 |
| ④ 四风险 | 文案（通用） | ✅ |
| ⑤ 六能力 | `dealerPrograms` + 文案 | ✅ |
| ⑥ 目录优势 | `assets/` 实测 + **筛选器截图** | ⚠️ 数据齐，**视觉证据依赖筛选器实现** |
| ⑦ 六步流程 | 文案 | ✅（⚠️ 不写交期） |
| ⑧ 可追溯点 | **丰怀能否提供生产照片** | ❌ **整段阻塞** |
| ⑨ 定位承诺 | 文案 + 商务边界 | ⚠️ 需丰怀书面确认 |
| ⑩ 路由 | 已有页面 + `/custom-development` | ⚠️ 定制页不存在 |
| ⑪ FAQ | 起订 / MOQ / 会员费待确认 | ⚠️ 3/8 条阻塞 |
| ⑫ 收束 | 文案 | ✅ |

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| **视口高度** | 01 ≈ 1 屏 ｜ 02–04 各 ≈ 0.7–0.9 屏 ｜ 05 ≈ 0.8 屏 ｜ 06 ≈ 0.8 屏 ｜ 07 ≈ 0.5 屏 ｜ **合计 ≈ 5.5 屏**（§0.5.4） |
| 🔴 **询盘整屏** | 视口 07 的 `<DealerCta>` **必须完整落在一个视口内**（`DESIGN.md` §0.5.4 硬规则）。⚠️ 本页是**全站最长页之一**，`DealerCta` 前若还有 pathways 残余内容，**极易把 CTA 按钮推到折线下** → 按 §0.5.3 B-4 删 pathways 也是为了这一条 |
| 容器 | `.container-fh`（1180）—— 内容页用标准容器，**不是 wide** |
| 深色段 | **① Hero 深色**（`bg-ink` #0b0f16）；其余浅色；**⑤⑥ 用 `bg-soft`（#f5f7fa）交替** |
| 栅格 | ④ 四风险 `grid-cols-1 md:grid-cols-2`；⑤ 六卡 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`；② 四数字 `grid-cols-2 lg:grid-cols-4` |
| 断点 | 重点测 **768**（卡片 2→3 列的临界）与 **390**（单列） |
| 动效 | 每段 `[data-reveal]`；网格用 `[data-reveal-group]` 错峰（`--motion-stagger-step` 80ms） |
| 🔴 fail-visible | **不要自己加 `opacity-0`** —— 内容默认可见，只有 JS 加 `data-motion-armed` 后才隐藏（`globals.css:224-267`） |
| 标题 | 一律 `font-display` + uppercase + `tracking-[0.0xem]` |
| 按钮 | `className="btn-pill-solid"` / `btn-pill-outline` —— **不是 `<Button>`** |

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 就绪度 |
|---|---|---|---|
| **1** | **起订量**（竞品写 1 set / 4 pcs） | ②信任带 + ⑦流程 + ⑪FAQ | ❌ **需丰怀确认** |
| **2** | **交期**（竞品写 20-30 天） | ⑦流程第 05 步 | ❌ **需丰怀确认** |
| **3** | **能否提供生产节点照片/视频** | **⑧ 整段** | ❌ **需丰怀确认（决定删段）** |
| **4** | **是否收会员费** | ⑪ FAQ 第 2 条 | ❌ **需丰怀确认** |
| **5** | 是否有年度最低量 | ⑪ FAQ 第 3 条 | ❌ **需丰怀确认** |
| **6** | 是否有经销商价体系 | ⑪ FAQ 第 4 条 | ⚠️ 需拍板口径 |
| **7** | 是否支持混尺寸/前后配（数据支持，商务呢） | ⑪ FAQ 第 6 条 | ⚠️ |
| **8** | **「第二供应源」这个定位丰怀认不认** | ③ | ❌ **需丰怀确认** |
| **9** | **WhatsApp 商务号** | ① 次 CTA | ❌ **需丰怀确认** |
| **10** | 竞品用 VIN，国内习惯是车型+年份 —— 用哪个 | ① 预填模板 | ⚠️ 需拍板 |
| **11** | **贸易条款（FOB/CIF/DDP）** | ⑪ FAQ 第 8 条 | ⚠️ `dealerShipping` 已标 PLACEHOLDER |
| **12** | 「不直接联系你的客户」是否作为书面承诺 | ⑨ | ❌ **需丰怀确认** |
| **13** | `/custom-development` 页面 | ⑩ 路由出口 2 | ❌ 页面不存在 |
| **14** | 目录优势段的视觉证据（无实拍图） | ⑥ | ⚠️ 依赖筛选器实现 |

**🔴 四组数字（起订量 / 交期 / 生产照片 / 会员费）全部未确认 —— 未确认不能写。**

### ★ v2 新增阻塞（§0.5 带出来的）

| # | 事项 | 阻塞 | 归属 |
|---|---|---|---|
| A | **B-2 二选一**：视口 05 拆两屏 vs 合并为一屏（合并则必须重写标题让该屏自称一个问题） | 视口 05 | 设计 |
| B | **B-3 数据拆分**：`content/faq.ts` 拆 `dealerFaqs` / `productFaqs`，或删 `/products` 的 FAQ 段 | 视口 06 | 内容 / 决策 |
| C | 🔴 **段序要重排** —— 实测路由此 FAQ 更靠后，v1 的 ①–⑫ 编号是按「段」排的**不适用**（§0.5.3 末尾） | 全页 | 设计 |
| D | **v1 十二段里 6 段在代码里不存在**（②③④ / ⑤⑥ / ⑧⑨ 各自被合并）→ 施工前需先决定**是补齐还是接受合并现状** | 全页 | 决策 |

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 十二段式（14→12 的合并） | `dealers-page.md` §4 |
| ① 主张 + 3 CTA | `dealers-page.md` §5① |
| ② 信任带（换成真实数字） | `dealers-page.md` §2.1 + §5② |
| ③ 对号入座（加「第二供应源」） | `dealers-page.md` §5③ |
| ④ 四风险 + 「别在第一条消息报交期」 | `dealers-page.md` §5④ |
| ⑤ 六能力卡格式 | `dealers-page.md` §2.2 + §5⑤ |
| ⑥ 目录优势（新增段） | `dealers-page.md` §5⑥ |
| ⑦ 六步 + 「开料前批准」 | `dealers-page.md` §2.3 + §5⑦ |
| ⑧ 可追溯（可删段） | `dealers-page.md` §5⑧ |
| ⑨ 定位承诺 | `dealers-page.md` §5⑨ |
| ⑩ 路由三出口 | `dealers-page.md` §5⑩（T7 段型见 `content-design-and-new-pages.md` §1.2） |
| ⑪ FAQ 吸收物流段 | `dealers-page.md` §5⑪ |
| ⑫ 收束 ≤80 字 | `dealers-page.md` §5⑫ + `content-design-and-new-pages.md` §1.1 |
| 四组数字未确认 | `dealers-page.md` §7（待确认 10 条） |
| 竞品底本 14 段 / 2,121 字 | `dealers-page.md` 附录 |
