# `/dealers/private-label` 页面规格（贴牌代工 · 全站最长、法务最重的一页）

> **路由**：`/dealers/private-label`
> **目标文件**：`src/app/dealers/private-label/page.tsx`（已存在，需按本规格重排）
> **渲染**：全静态 + 两个 client 岛（FAQ 折叠、WhatsApp 预填）
> **数据**：`content/private-label.ts`（已有 9 个导出）+ `content/faq.ts` + `assets/` 实测
> **设计依据**：`../../ARCHITECTURE/page-architecture/private-label-page.md`
>
> **本规格版本**：v2（2026-10-02）—— 由「十四段式」升级为**视口驱动**。
> v1 把这一页写成「第 ①–⑭ 段」，那是**内容块清单**。v2 补 §0.5，按
> `_viewport-audit.md` §11 的实测把 7 个实际段收敛为 **7 个视口**，
> 并消化审计给的 2 条处置。**⚠️ 段序要重排** —— 见 §0.5.3。

---

## 0. 一句话

**这一页对丰怀比对竞品更重要** —— 竞品是「轮毂单品厂」，而**贴牌是四条产品线里
单价最高、粘性最强**的合作模式（一旦建立品牌线，换供应商成本极高）。

**⚠️ 但它也是全站「外部输入依赖」最重的一页** ——
**14 段里 5 段完全阻塞在丰怀政策上**（④攻心 ⑥文件归属 ⑦保密 ⑧证明节点 ⑩起订量）。
**这页写不好不是文案问题，是商业风险。**

---

## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本页被审计判为**需小修**（`_viewport-audit.md` §11）——7 段里 **5 段结构正确**，
> 含本页最重视的法务段（实现质量高），只需 **删 1 段 + 移 1 段**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**（`src/app/dealers/private-label/page.tsx`，2026-10-02 实测）：**7 个 `<section>`**。

| # | section（`aria-labelledby`） | v1 十四段里对应哪几段 | 审计判定 |
|---|---|---|---|
| 1 | `private-label-title` | ① 主张（+ ②③④ 的**内容已被压缩掉**） | ✅ 合规 |
| 2 | `offer-title` | ⑤ 包含什么 | ✅ 合规 |
| 3 | `branding-title` | ⑥ Logo 与中心盖 | ✅ 合规 |
| 4 | `confidentiality-title` | ⑦ 文件归属 + ⑧ 设计保密（**同段左右分栏**） | ✅ 合规 |
| 5 | `flow-title` | ⑪ 5 步流程 | ✅ 合规 |
| 6 | `audience-title` | ⑫ 第一次沟通发什么 —— **但位置在倒数第二** | ⚠️ **位置错**（B-1） |
| 7 | `pl-pathways-title` | ⑬ 路由 | 🗑️ **删除**（B-2） |
| — | （`DealerCta`） | ⑭ 收束 | ✅ 合规 |

**🔴 关键落差**：**v1 的十四段里有 7 段在代码里不存在或被合并**
（②③④ 的内容被压进 Hero；⑦⑧ 挤在同一 section；⑨⑩ 无对应实现）。
**「十四段式」是设计蓝图，不是实现现状。**

**⚠️ 而这个落差有实质后果**：v1 §1 把 **② 何时该贴牌**（4 信号 + 什么情况下不该）
排在第 2 位，并称它是「前提判定」——**但代码里这段不存在**。
读者因此**从头到尾没有任何一处被明确告知「你可能不该贴牌」**。
这是全页最值钱的一段（它敢劝退，才让人信），**当前是缺的**。

### 0.5.2 七个视口（本页定案）

| 视口 | 核心问题（一句话） | 含哪些段 | 主要信息（1） | 主要视觉（1） | 主要行动（1） | 次要行动（0–2） | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 贴牌是什么？ | Hero | `privateLabelHero` | 深色径向橙光 | 主 CTA | 次 CTA | ✅ |
| **02** | 你们给什么？ | offer | `privateLabelOffer` + 勾选列 | 左文 + 右卡 | 无 | 无 | ✅ |
| **03** | 我的牌子出现在哪？ | branding | `Every surface the customer sees` + 4 格 | 4 列编号格 | 无 | 无 | ✅ |
| **04** | 我的设计安全吗？ | confidentiality | 左：勾选列；右：`Terms to be agreed in writing` | 左文 + 右橙框 | 无 | 无 | ✅ |
| **05** | 流程是怎样的？ | flow | `From brief to repeat order` + 5 步 | 5 列步条 | 无 | 无 | ✅ |
| **06** | 适合我吗？ | audience | `privateLabelAudience` + 4 卡 | 2 列卡 | 无 | 无 | ⚠️ **位置错**（§0.5.3 B-1） |
| **07** | 怎么开始？ | **`DealerCta`** | 「Put your own name on the wheel」 | 橙底 | `Request a quote` | email | ✅ |

### 0.5.3 ★ 审计给出的 2 条处置（本文档的落点）

| # | 审计判定 | 处置 | 落点 |
|---|---|---|---|
| **B-1** | ⚠️ 视口 06（audience）**位置错**：读完 offer / branding / 法务 / flow 之后才问「我适合吗」，等于让读者**先花几分钟再被告知可能不适合**。规格 §1 把 ②「何时该贴牌」排在**第 2 位**（前置判定） | **二选一**：① 把 audience **前移到 offer 之前**（成为视口 02），与规格 ② 段位一致 ② 若坚持「先讲价值再筛人」，则 **并入视口 02**，压成 2 句、删 4 卡栅格 | 视口 02 / 06 |
| **B-2** | 🗑️ 视口 07（pathways）与紧随其后的 `DealerCta` **回答同一个问题（下一步）** —— 与 `/dealers` B-4 **完全同形** | 删 `:327-367`；有必要的入口（→ `/dealers`、`/custom-development`）**并入 `DealerCta` 作次级文字链** | 视口 07 |

**⚠️ 审计的一个重要区分（原样保留）**：
> **「为什么这是 ⚠️ 而不是 🔴」** —— B-1 的 audience 段**形式上**是
> 「1 个问题 + 1 组卡片」，**符合 §0.5.1**。它的缺陷是**位置错误（顺序）**，
> 不是「多目标竞争」。

**这一点值得记住**：`DESIGN.md` §0.5.1 只管「一屏几件事」，
**不管「这几件事排的什么顺序」**。本页暴露的正是这条判据的边界 ——
**顺序错误逃过了 §0.5.1，但它造成的损失（读者白读几分钟）是真实的。**
→ 建议后续在 `DESIGN.md` 补一条「**前置判定必须前置**」的判据（本文档只记录，不擅自立规）。

**🔴 v1 §1 末尾那条铁律仍然成立**：
> 法务三段（⑦⑧⑨）**独立成段，不合并、不塞进 FAQ**。

**实测现状是它已经守住了** —— ⑦⑧ 在同段左右分栏（允许，它们答的都是「安全吗」），
⑨ 可追溯点**无对应实现（待丰怀确认生产节点照片）**。
**B-1 / B-2 的处置不得触碰这一段。**

### 0.5.4 全页高度预算

| 视口 | 目标高度 | 说明 |
|---|---|---|
| 01 Hero | ≈ 1 屏 | 深色 |
| 02–05 | 各 ≈ 0.7–0.9 屏 | 文本 + 卡 |
| 06 audience | ≈ 0.7 屏（若前移则并入 02） | 见 B-1 |
| 07 收口 | ≈ 0.5 屏 | **询盘组件必须完整落在视口内** |

**合计目标 ≈ 5 屏。** v1 未给预算 —— v2 补上。⚠️ 本页被描述为「全站最长」，
但**「最长」是 v1 十四段蓝图下的预期**；实测 7 段，页高应显著低于预期，
**施工时以实测为准，不要为凑「最长」而加段**。

---

## 1. 页面骨架（十四段设计蓝图）

> **⚠️ 读法**：「十四段」是**内容块清单**，不是视口切分（视口见 §0.5.2）。
> **施工时先按 §0.5.2 定视口，再按本表往视口里放段。**
> 最后一列给出每段**实测落在哪个视口 / 是否根本不存在**。

| 序 | 内容块 | 必须性 | 说明什么 | 段落类型 | 就绪度 | 实测落在哪 |
|---|---|---|---|---|---|
| ① | 主张 | 必须有 | 挂自己的名，不用先建仓库 | 主张 | ⚠️ 需确认主张 | **视口 01** |
| ② | **何时该贴牌 ★** | 必须有 | 4 信号 + ★什么情况下不该 | 前提判定 | ✅ | **🔴 **不存在**（v1 排第 2 位，代码里没有）** |
| ③ | 为什么该做 | 必须有 | 价值捕获：别再替别人建品牌 | 论证 | ✅ | **🔴 **不存在**（内容被压进 Hero）** |
| ④ | **★ 没人敢问的问题** | 必须有 | 6 个（照抄结构，换政策） | **★ T5 攻心** | ❌ **全段阻塞** | **🔴 **不存在**** |
| ⑤ | 包含什么 | 必须有 | 4 个能力卡 | 方案 | ✅ | **视口 02** |
| ⑥ | Logo 与中心盖 | 必须有 | 两个可见位置 | 实物说明 | ⚠️ 工艺能力待确认 | **视口 03** |
| ⑦ | **★ 文件归属** | 必须有 | 三类文件分清 | **法务（独立成段）** | ❌ **全段阻塞** | **视口 04（与 ⑧ 同段左右分栏）** |
| ⑧ | **设计保密** | 必须有 | 不公开展示、不转卖 | **法务（独立成段）** | ❌ **全段阻塞** | **视口 04（与 ⑦ 同段左右分栏）** |
| ⑨ | 证明节点 | ⚠️ 条件性 | 生产前确认 / 出货前照片 | **T6 证据** | ❌ 待确认（可删） | **🔴 **不存在**（待丰怀确认）** |
| ⑩ | **★ 先做一套** | 必须有 | 5 个自检问题 | 降门槛 | ❌ **起订量阻塞** | **🔴 **不存在**** |
| ⑪ | 5 步流程 | 必须有 | 从品牌方向到复购 | 流程 | ⚠️ 第 03 步阻塞 | **视口 05** |
| ⑫ | 第一次沟通发什么 | 必须有 | 清单 | **T3 降门槛** | ✅ | **视口 06（⚠️ 位置错，见 B-1）** |
| ⑬ | 路由 | 必须有 | 经销商 / 贴牌 / 定制开发 | **T7** | ⚠️ 定制页不存在 | **🗑️ 视口 07（建议删，见 B-2）** |
| ⑭ | FAQ + 收束 | 必须有 | 14–16 条 + ≤80 字 | FAQ + **T8** | ⚠️ 5 条法务待确认 | **视口 07（FAQ 段实测不存在）** |

**🔴 法务三段（⑦⑧⑨）独立成段，不合并、不塞进 FAQ。**
竞品把这 3 件法务事当**主要内容**写，不是 FAQ 边角料 —— **这是它敢写 2,479 字的原因。**

```
/dealers/private-label
├── ① <PrivateLabelHero>      eyebrow + H1 + 钩子句 + 3 CTA（WhatsApp 预填 9 字段）
├── ② <FitSignals>  ★         4 信号 + ★ 反向筛选（推到 /dealers）
├── ③ <ValueCapture>          论证段
├── ④ <HardQuestions>  ★★     6 个「没人敢问的问题」（两组：边界 5 + 兜底 1）
├── ⑤ <CapabilityGrid>        4 能力卡（复用 /dealers 的组件）
├── ⑥ <BrandingSurfaces>      Logo 本体 + 中心盖 两位置
├── ⑦ <FileOwnership>         三类文件表（法务）
├── ⑧ <DesignConfidentiality> 不进公开画廊 / 不转卖（法务）
├── ⑨ <TraceabilityBlock>     ⚠️ 条件渲染（与 /dealers ⑧ 同组件）
├── ⑩ <OneSetFirst>  ★        5 个自检问题
├── ⑪ <ProcessSteps>          5 步（复用 /dealers 的组件）
├── ⑫ <FirstMessageChecklist> 清单（T3）
├── ⑬ <RouteBlock>            T7 三出口（复用 /dealers 的组件）
└── ⑭ <FaqAccordion> + <DealerCta>
```

---

## 2. 逐块规格

### ① 主张（≤100 字）

**竞品钩子句是全页的钩子** —— 它把「贴牌」重新定义成**「别再替别人建品牌」**：

> 把名字印在轮毂上，不用先建仓库。
> 你已经会卖了。真正的问题是：那些客户、帖子、适配笔记和复购，
> **现在还在替别人积累品牌吗？**

**★ 三种 CTA（对齐竞品）**：
- 主 CTA → 讨论第一套贴牌订单（`.btn-pill-solid` → `/contact`）
- 次 CTA → **WhatsApp，预填 9 个字段**

**★ 竞品 WhatsApp 预填字段（照抄）**：

```
Brand or shop name / Customer stage / Target vehicle or VIN / Target wheel size /
Logo & center cap direction / Design or finish direction /
Source file or NDA needs / Quantity / Shipping region
```

**★ 「Source file or NDA needs」放在预填里** —— 一次沟通就说清敏感度。

**props 契约**：

```ts
// src/components/sections/private-label-hero.tsx（需新建）
type PrivateLabelHeroProps = {
  eyebrow: string;              // "PRIVATE LABEL"
  title: string;
  lede: string;                 // ★ 含「还在替别人积累品牌吗」
  primary: CtaLink;
  whatsapp?: {
    number: string;             // ⚠️ 未确认 → 整个对象 undefined，次 CTA 降级为邮件
    prefill: string;            // 9 字段模板
    includeNdaField: true;      // ★ 语义标记：NDA 需求必须在预填里
  };
};
```

### ② ★ 何时该贴牌（这一段决定整页质量）

**竞品 4 个信号 + 1 条反向筛选**：

| # | 信号 |
|---|---|
| 1 | 同一批车型反复来 |
| 2 | 轮毂月销稳定到可以总结 |
| 3 | 你的内容比你的产品归属强 |
| 4 | 客户开始问「你们自有线」 |

**★ 反向筛选句（必须写，学竞品 §2.2）：**

> **贴牌是给「有需求要捕获」的店，不是给「还没客户方向」的人。**
> 如果还在验证「定制轮毂能不能卖」，**请先看经销商页**。

**★ 为什么必须写这段**：它主动把不合格客户推走 → 推走的去经销商页（**还是我们的客户**），
留下的质量更高，**顺便做了一次内部路由**。

**⚠️ 我们的额外优势**：丰怀有四条产品线，反向筛选时可以分流到**更具体**的页面
（轮毂目录 / 定制开发），比竞品只有一条 dealer 页更精准。

**props 契约**：

```ts
// src/components/fit-signals.tsx（本页 + 未来 /custom-development 复用）
type FitSignal = { index: string; signal: string; body?: string };
type FitSignalsProps = {
  eyebrow: string;
  heading: string;                    // "什么时候该考虑贴牌"
  signals: FitSignal[];               // 恰好 4 个
  /** ★ 反向筛选 —— 不是可选装饰，是本段的构成要件 */
  reverseFilter: {
    body: string;                     // "不是给还没客户方向的人"
    routeLabel: string;               // "先看经销商页"
    routeHref: string;                // "/dealers"
  };
};
```

**🔴 禁止**：省掉 `reverseFilter`。没有反向筛选的「何时该贴牌」= 只推不筛。

### ③ 为什么该做（论证段）

**核心论点**：
> 客户回来找你，是因为你的适配建议、你的风格、你的作品。
> 但轮毂上印着别人的牌子 —— **每一次成交都在替轮毂厂建品牌。**
> 贴牌不保证利润或区域，**它给你的是「面向客户的产品身份」的控制权**。

**⚠️ 必须保留竞品那句诚实的话**：
> *"Private label does **not magically guarantee margin or territory**."*

**先说清不保证什么，再说不保证之外给什么。** 这是 B2B 该有的严谨。

```ts
// src/components/value-capture.tsx（本页）
type ValueCaptureProps = {
  eyebrow: string;
  heading: string;
  body: string;              // 含「不保证利润或区域」句
  points: string[];          // 3–4 条价值点
  disclaimer: string;        // ★ 不保证声明的独立位置
};
```

### ④ ★★ 没人敢问的问题（HardQuestions，全站最高明的一段）

**六个问题，两个分组**（顺序是「先解决恐惧，再给保障」）：

**第一组：边界（你会不会变成我的对手）**

| # | 问题 | 作答政策来源 | 就绪度 |
|---|---|---|---|
| 1 | **工厂会出现在我的市场吗？** | ⚠️ 全页最敏感 | ❌ |
| 2 | 我的客户会知道是谁做的吗？ | 关系归你，我们在生产侧 | ❌ |
| 3 | 我能拿到源文件吗？ | 文件分级政策 | ❌ |
| 4 | 设计开发出来归谁？ | 归属政策 | ❌ |
| 5 | 设计会卖给别的买家吗？ | 不进公开画廊 | ❌ |

**第二组：质量兜底**

| # | 问题 | 作答要点 | 就绪度 |
|---|---|---|---|
| 6 | 我的名字印上去，质量谁保证？ | 生产前确认 + 出货前照片 | ❌ |

**⚠️ 措辞纪律（学竞品）**：每条回答都在**划边界**，不是打包票。
竞品敢说 *"needs a separate agreement"* —— **它敢说「这需要另签协议」，而不是「没问题都可以」。**

**🔴🔴 这一段的每一条都是承诺，写之前必须丰怀书面确认。**
**规格上的实现纪律**：未确认的条目**渲染为 `isAnswered: false` → 显示「政策待确认」标旗**，
**不得写任何「没问题」「都可以」式兜底话术**。

**props 契约**：

```ts
// src/components/hard-questions.tsx（本页；未来 /custom-development 可能复用）
type HardQuestion = {
  index: string;                 // "01"…"06"
  group: "boundary" | "quality";
  question: string;              // ★ 客户心里的话，原样
  answer?: string;               // ⚠️ 未确认时必须缺省
  isAnswered: boolean;           // false → 渲染政策待确认标旗，不编答案
  requiresPolicy: string[];      // 追踪：["factory-market-boundary"] 等政策 ID
};
type HardQuestionsProps = {
  eyebrow: string;               // "The questions nobody wants to ask"
  heading: string;
  questions: HardQuestion[];     // 恰好 6 个，分 2 组
};
```

**🔴 禁止**：
- ❌ 未确认时编一个「得体」的答案（比留空更危险）
- ❌ 把 6 条合并成 3 条（六条对应六个真实商业风险，不是凑数）
- ❌ 打乱分组顺序（先边界后兜底是有意的）

### ⑤ 包含什么（4 个能力卡）

| # | 标签 | 加粗一句话 |
|---|---|---|
| 1 | 品牌门面 | **Logo、中心盖、面向客户的身份** |
| 2 | 产品方向 | **值得复购的配置** |
| 3 | 批准记录 | **生产前的设计与品牌确认** |
| 4 | 专属支持 | **我们在订单背后** |

**格式照抄竞品**：小标签 + **加粗一句话** + 一段说明。

**props 契约**：**复用 `<CapabilityGrid>`**（与 `/dealers` ⑤ 同一个组件），`items.length === 4`、`columns={2}`。
**🔴 禁止**为本页另起一个 `<PrivateLabelIncludes>` —— 同一形态必须同一个组件。

### ⑥ Logo 与中心盖（两个可见位置）

| 位置 | 要点 |
|---|---|
| **轮辋本体标记** | Logo / 产品码 / 关键数据可刻；**必须在机加工与表面处理前规划好** |
| **中心盖身份** | ★ *"the center cap is often the most visible brand detail"* —— 很多客户先看到盖 |

**★ 「印记要当成产品的一部分来设计，不是事后贴上去」** —— 这句专业感必须保留。

**我们的数据优势**：`assets/` 里 **679 个去重表面处理** →
**盖的材质与表面处理要和轮毂匹配**，这是竞品数据撑不起的一句。

**⚠️ 工艺能力待确认**（刻 / 铣 / 盖、是否提供品牌色定制、logo 与盖能否第一单就做）。

```ts
// src/components/branding-surfaces.tsx（本页）
type BrandingSurface = { surface: string; body: string; note: string };
type BrandingSurfacesProps = {
  eyebrow: string;
  heading: string;
  surfaces: BrandingSurface[];   // 2 个：本体标记 + 中心盖
  finishCount?: number;          // 679 —— 用于「盖与表面需匹配」一句
  capabilityNote?: string;       // ⚠️ 工艺能力说明（未确认时不渲染）
};
```

### ⑦ ★ 文件归属（法务，独立成段，不可省）

**必须写明三类**（照抄竞品分类，内容按丰怀政策）：

```
A. 你的品牌资产（Logo / 店名 / 原始草图）   → 归你（我们只用于准备你的订单）
B. 生产文件（图纸 / 适配数据 / 工程记录）    → 归丰怀，除非书面约定交付
C. 交付文件（销售图 / 可编辑渲染 / CAD）     → 按用途单独约定
```

**★ 必须保留这句话**：

> **预览图、销售图、工程图、可编辑源文件，不是同一种文件。**

**中文语境下「设计稿」三个字涵盖太多东西 —— 不做区分，后面必然扯皮。**

**⚠️ 我们比竞品多一条**：**NDA 的处理方式**（竞品只是提了，没给流程）。

**props 契约**（复用站内既有 `LegalDocument` / `LegalSection` 类型思路，但本段是**页面内嵌**的）：

```ts
// src/components/file-ownership.tsx（本页）
import type { LegalSection } from "@/content/types";   // { heading, body[] } 同族

type FileTier = {
  tier: "A" | "B" | "C";
  label: string;         // "你的品牌资产" / "生产文件" / "交付文件"
  examples: string[];    // ["Logo", "店名", "原始草图"]
  ownership: string;     // 归属结论
  condition?: string;    // "除非书面约定交付"
};
type FileOwnershipProps = {
  eyebrow: string;
  heading: string;
  tiers: FileTier[];                  // 恰好 3 类
  /** ★ 不可省的定调句 */
  clarityNote: string;                // "预览图、销售图、工程图、可编辑源文件，不是同一种文件。"
  ndaProcess?: { steps: FlowStep[] }; // ⚠️ 需丰怀提供流程；未提供则本块不渲染
};
```

**🔴 禁止**：把 ⑦ 合并进 ⑭ FAQ。**法务内容必须在正文里独立成段**（竞品做法，且是正确做法）。

### ⑧ 设计保密（法务，独立成段）

**承诺（可直接用的结构）**：
> 归你的设计，**不进公开画廊、不卖给别的买家**。
> 若项目敏感，**分享详细文件前**先谈 NDA。

**⚠️ 这条与上架门槛有交互**：
**贴牌型号不出现在 `/products/wheels` 的公开目录里** ——
这是一条会**影响数据层**的业务规则，需写入 `tech-architecture`。

**props 契约**：

```ts
// src/components/design-confidentiality.tsx（本页）
type DesignConfidentialityProps = {
  eyebrow: string;
  heading: string;
  commitments: string[];         // ["不进公开画廊", "不转卖给别的买家"]
  ndaTrigger: string;            // "分享详细文件前先谈 NDA"
  /** ★ 数据层约束标记 —— 提醒实现者：贴牌型号不入公开目录 */
  catalogueExclusionNote?: string;
};
```

**🔴 实现警告**：`<DesignConfidentiality>` 承载的是一条**业务规则**，
不只是文案 —— 必须同时产出 `tech-architecture` 侧的一条「贴牌型号排除」规则。

### ⑨ 证明节点（T6，⚠️ 条件性整段）

**竞品四个**：机加工前确认图纸 / 生产前查 logo 与盖 / 出货前成品照片 / 敏感文件前先谈 NDA。

**🔴 与 `/dealers` ⑧ 同源**：**如果丰怀不能提供生产照片，相关条目必须去掉**（不能承诺做不到的事）。

**props 契约**：**复用 `<TraceabilityBlock>`**（与 `/dealers` ⑧ 同一个组件）。
**⚠️ 本页的 `points` 与 `/dealers` 的不同**（多了「敏感文件前先谈 NDA」一条），
但**组件同一个** —— 用数据区分，不用组件名区分。

### ⑩ ★ 先做一套（降门槛，全页最轻的一段）

**竞品 5 个自检问题（照抄结构）**：

```
□ Logo 在轮毂或盖上好看吗？
□ 表面处理有你的品牌感吗？
□ 这个设计在你的市场拍出来好看吗？
□ 你的客户明白这为什么是你的吗？
□ 同样的配置值得复购吗？
```

**★ 「先做一套 = 你的产品样照 + 适配证明 + 表面参照 + 客户测试」** ——
竞品把「第一套」从「试产样」升级成「**四个用途的资产**」。**高潮手法，照学。**

**★ 它把「要不要做品牌」这个吓人的大问题，拆成 5 个可回答的小问题** ——
客户不用想「我要不要创立一个轮毂品牌」（太重），只需想「我这一套好不好看」（很轻）。

**⚠️ 但「先做一套」暗含起订量 = 1 套** → **起订量未确认时，本段标题句需软化**
（如「先做一套看看」→「第一单从一套开始」需按丰怀实际改写）。

```ts
// src/components/one-set-first.tsx（本页）
type OneSetFirstProps = {
  eyebrow: string;
  heading: string;
  checks: string[];              // 恰好 5 个自检问题
  definition: { title: string; points: string[] };  // 「先做一套」的四用途定义
  /** ⚠️ 起订量未确认时为 true → 标题句降级，不承诺「一套起订」 */
  moqUnconfirmed?: boolean;
};
```

### ⑪ 5 步流程

```
01 品牌方向与保密     → 品牌名/logo/设计方向/目标车型/尺寸/表面/盖/数量/发运地（+NDA）
02 设计、图纸与品牌批准 → 确认外观 + 什么承载品牌
03 第一套贴牌生产     → 小起订量（⚠️ 待确认）
04 出货前证明         → 图纸确认 / CNC 照片 / 成品照片（⚠️ 依赖丰怀能否提供）
05 复制有效的         → 存下设计方向/logo与盖备注/适配/表面参照/照片/客户反馈
```

**★ 第 05 步「存下来」是竞品的手法** ——
把「复购」描述成**「把成功的那套记下来」**，而不是「再下一单」。

**props 契约**：**复用 `<ProcessSteps>`**（与 `/dealers` ⑦ 同一个组件），
`steps: FlowStep[]`（5 步）、`highlightStep: "02"`（设计批准是本页的控制点）。

### ⑫ 第一次沟通发什么（T3 降门槛）

**清单**：
```
品牌名或店名 / Logo 文件（若有）/ 是否需要 NDA /
设计方向 / 目标车型或 VIN / 目标轮毂尺寸 /
表面方向 / 中心盖想法 / 数量 / 目的地区域
```

**★ 必须补一句**：*"If you do not know fitment data, that is still fine."* —— 继续降门槛。

```ts
// src/components/first-message-checklist.tsx（本页 + /contact ② 复用）
type FirstMessageChecklistProps = {
  eyebrow: string;
  heading: string;
  items: string[];           // 10 条必带项
  reassurance: string;       // ★ "不知道适配数据也没关系"
  variant?: "light" | "soft";
};
```

### ⑬ 路由（T7）

| 路 | 判断标准 | href |
|---|---|---|
| **经销商** | 「你还在学怎么卖定制轮毂」→ 先去经销商页 | `/dealers` |
| **贴牌** | 「你已会卖轮毂」→ 问题是名字该不该长在商品上 | 本页（current，不可点） |
| **定制开发** | 「你还没想清整个品牌方向 / 要按图纸做」 | `/custom-development` ⚠️ 不存在 |

**⚠️ 竞品的「Wheel Brand Startup」页不存在**（它链到 contact）——**这是个缺口。**
**我们有 `/custom-development` 可以承接**（但页面尚未建）。

**props 契约**：**复用 `<RouteBlock>`**，`items: RouteStep[]`、`columns={3}`。
**🔴 禁止**新增 `<PathwayCards>` 之类同义组件。

### ⑭ FAQ（14–16 条）+ 收束（T8，≤80 字）

**竞品 16 条，其中 5 条是法务/边界**。**复用 `<FaqAccordion>`**。

| # | 问题 | 类型 | 就绪度 |
|---|---|---|---|
| 1 | 你们会出现在我客户面前吗？ | 边界 | ❌ |
| 2 | 什么时候该贴牌？ | 前提 | ✅ |
| 3 | 不囤货能开贴牌线吗？ | 可行性 | ✅ |
| 4 | 能用我自己的 logo 吗？ | 能力 | ⚠️ |
| 5 | ★ **该看贴牌厂的什么？** | **选购指导** | ✅ |
| 6 | 能拿到源文件吗？ | **法务** | ❌ |
| 7 | 设计文件归谁？ | **法务** | ❌ |
| 8 | 设计会泄露或被卖吗？ | **法务** | ❌ |
| 9 | **能照着参考图抄吗？** | **⚠️ 商标红线** | ❌ |
| 10 | 一套能起订吗？ | 门槛 | ❌ |
| 11 | logo 和盖能第一单就做吗？ | 能力 | ⚠️ |
| 12 | 能用我的品牌色吗？ | 能力 | ⚠️ |
| 13 | 我只知道 VIN 和尺寸怎么办？ | 降门槛 | ✅ |
| 14 | 出货前能拿到什么证明？ | 证据 | ❌ |
| 15 | **有区域独家吗？** | **⚠️ 商务** | ❌ |
| 16 | 贴牌等于 OEM/ODM 吗？ | 定义 | ⚠️ |

**★ 两条必须特别处理**：

**① 「能照着参考图抄吗？」** —— 竞品的回答很克制（把话题引到「建立你自己的方向」）。
**⚠️ 对我们这条要更小心** —— 因为 `styleName` 里**混着 `TE37`/`BBS-LM` 等竞品商标**
（见 `fitment-pages-plan.md` §3.1）。
**必须明确划定边界，否则前面所有商标风险都会在这条 FAQ 上爆。**

**② 「有区域独家吗？」** —— 竞品说**不给**（需单独商务评审）。
**⚠️ 这是商务政策，必须丰怀拍板，不能自己写。**

**★ 收束（≤80 字）**：竞品用 *"Your Name On The Wheel. 2N Behind The Production."* —— **8 个词，极简。**

**组件**：**复用 `<DealerCta>`**（`sections/dealer-cta.tsx`）。

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 |
|---|---|---|
| `<DealerCta>` | `src/components/sections/dealer-cta.tsx` | 第 ⑭ 段收束 |

**⚠️ 本页与 `/dealers` 共用 5 个新建公共组件** —— 见 3.2 交叉引用。

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<FaqAccordion>`** | `src/components/faq-accordion.tsx` | FAQ 折叠（14–16 条） | **5+ 页** ★ 与 `/dealers` 同一组件 |
| **`<RouteBlock>`** | `src/components/route-block.tsx` | T7 路由三出口 | **8+ 页** ★ 同一组件 |
| **`<ProcessSteps>`** | `src/components/process-steps.tsx` | 5 步流程 | **6+ 页** ★ 同一组件 |
| **`<CapabilityGrid>`** | `src/components/capability-grid.tsx` | 4 能力卡（/dealers 是 6 个） | **2 页** ★ 同一组件 |
| **`<TraceabilityBlock>`** | `src/components/traceability-block.tsx` | 证明节点 | **2 页** ★ 同一组件 |
| **`<FirstMessageChecklist>`** | `src/components/first-message-checklist.tsx` | 「第一次发什么」清单 | **2 页**（本页 + `/contact` ②） |
| `<PrivateLabelHero>` | `src/components/sections/private-label-hero.tsx` | 页头 + WhatsApp 预填 | 本页 |
| `<FitSignals>` | `src/components/fit-signals.tsx` | 4 信号 + 反向筛选 | 本页（未来定制页复用） |
| `<ValueCapture>` | `src/components/value-capture.tsx` | 论证段 | 本页 |
| **`<HardQuestions>`** | `src/components/hard-questions.tsx` | ★★ 6 个攻心问题 | 本页（结构独特，**建议保留专属**） |
| `<BrandingSurfaces>` | `src/components/branding-surfaces.tsx` | Logo + 中心盖 | 本页 |
| **`<FileOwnership>`** | `src/components/file-ownership.tsx` | ★ 三类文件（法务） | 本页（未来 `/custom-development` 复用） |
| `<DesignConfidentiality>` | `src/components/design-confidentiality.tsx` | 设计保密（法务） | 本页 |
| `<OneSetFirst>` | `src/components/one-set-first.tsx` | 5 自检问题 | 本页 |

**★ 组件纪律**：**上表前 6 个必须与 `/dealers` 的规格用同一个组件名、同一个路径。**
**凡是两页都用到的形态，禁止各起一个名字**（如 `<DealerFaq>` vs `<PrivateLabelFaq>`）。

---

## 4. 数据契约

### 4.1 现有内容模块（`src/content/private-label.ts`，9 个导出）

```ts
// ✅ 已存在，页面应直接 import
export const privateLabelHero: { /* eyebrow, title, lede, … */ };      // → ①
export const privateLabelOffer: AnswerBlock;                          // → ⑤ 四能力
export const privateLabelBranding: FlowStep[];                        // → ⑥ 两个位置
export const privateLabelConfidentiality: { /* eyebrow, heading, body, points */ };  // → ⑧
export const privateLabelExclusivity: PositioningPoint[];             // → ⑭ 独家 FAQ 相关
export const privateLabelFlow: FlowStep[];                            // → ⑪ 5 步
export const privateLabelAudience: { /* … */ };                       // → ②
export const privateLabelAudiencePoints: PositioningPoint[];          // → ② 4 信号
export const privateLabelPathways: ResourceLink[];                    // → ⑬ 路由
```

### 4.2 需要新增的数据（第 ④⑦⑨ 段 —— 阻塞项）

```ts
// src/content/private-label.ts 追加

/** ★ 第 ④ 段：6 个攻心问题。answers 全部待丰怀书面确认。 */
export const privateLabelHardQuestions: HardQuestion[] = [ /* 6 条，isAnswered:false */ ];

/** ★ 第 ⑦ 段：三类文件归属 */
export const privateLabelFileTiers: FileTier[] = [ /* A/B/C */ ];

/** ⚠️ 第 ⑨ 段：证明节点 —— 仅在丰怀确认能提供生产照片时启用 */
export const privateLabelTraceability: TraceabilityPoint[] | null = null;
```

### 4.3 就绪度总表（逐段，本页最重要的一张表）

| 段 | 依赖 | 就绪度 | 说明 |
|---|---|---|---|
| ① 主张 | 文案 + WhatsApp 号 | ⚠️ | 需确认主张与商务号 |
| ② 何时该贴牌 | 文案（通用） | **✅** | 唯一完全就绪的重段 |
| ③ 为什么该做 | 文案（通用） | **✅** | |
| **④ 没人敢问的问题** | **丰怀书面政策 ×6** | **❌** | **全段阻塞** |
| ⑤ 包含什么 | 文案 | **✅** | |
| ⑥ Logo 与中心盖 | `finishes`（679 值）+ 工艺能力 | ⚠️ | 数据齐，工艺能力待确认 |
| **⑦ 文件归属** | **丰怀法务政策** | **❌** | **全段阻塞** |
| **⑧ 设计保密** | **丰怀政策 + 影响数据层** | **❌** | **全段阻塞** |
| **⑨ 证明节点** | **能否提供生产照片** | **❌** | **可删段** |
| **⑩ 先做一套** | **起订量** | **❌** | 起订量阻塞 |
| ⑪ 5 步流程 | 流程（第 03 步依赖起订量） | ⚠️ | 第 03 步阻塞 |
| ⑫ 沟通清单 | 文案 | **✅** | |
| ⑬ 路由 | 已有页面 + `/custom-development` | ⚠️ | 定制页不存在 |
| ⑭ FAQ | 5 条法务/商务待确认 | ⚠️ | 5/16 条阻塞 |

**→ 14 段里 5 段完全阻塞（④⑦⑧⑨⑩），与设计文档 §6 完全一致。**

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| **视口高度** | 01 ≈ 1 屏 ｜ 02–05 各 ≈ 0.7–0.9 屏 ｜ 06 ≈ 0.7 屏 ｜ 07 ≈ 0.5 屏 ｜ **合计 ≈ 5 屏**（§0.5.4） |
| 🔴 **询盘整屏** | 视口 07 的 `<DealerCta>` **必须完整落在一个视口内**（`DESIGN.md` §0.5.4 硬规则）。⚠️ 若按 B-2 把 pathways 的入口并进 `DealerCta` 作次级文字链，**须复核它没有把 CTA 按钮推出折线** |
| 容器 | `.container-fh`（1180）—— 与 `/dealers` 一致 |
| 深色段 | **① Hero 深色**（`bg-ink`）；**⑨⑩ 可用 `bg-soft`（#f5f7fa）交替**；**⑦⑧ 法务段建议深色面板**（`bg-graphite`/`bg-panel`）以示区分 |
| 栅格 | ② 4 信号 `md:grid-cols-2`；④ 攻心 `grid-cols-1 md:grid-cols-2`（5+1 布局：**边界 5 条左，兜底 1 条右侧突出**）；⑤ 4 卡 `md:grid-cols-2`；⑦ 三类 `lg:grid-cols-3` |
| ⑦ 法务表 | **移动端必须转卡片**（与轮毂规格表同纪律），**绝不横向滚动** |
| 断点 | 重点测 **768**（④ 的 5+1 布局临界）与 **390** |
| 动效 | 每段 `[data-reveal]`；② 与 ④ 用 `[data-reveal-group]` 错峰 80ms |
| 🔴 fail-visible | **不要自己加 `opacity-0`** |
| 标题 | `font-display` + uppercase + `tracking-[0.0xem]`；数字同样用 `font-display` |
| 按钮 | `.btn-pill-solid` / `.btn-pill-outline` —— **不是 `<Button>`** |

**★ 版式纪律**：本页是**全站最长的一页（竞品 13,953px）** ——
**段与段之间必须有明确的视觉分隔**，否则长页会读成一坨。
建议：**深色/浅色交替 + 段落编号（`.eyebrow` 带序号）**。

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 就绪度 |
|---|---|---|---|
| **1** | **工厂会不会直接进入客户市场？** | ④ 第 1 问 —— **全页最敏感** | ❌ **需丰怀确认** |
| **2** | **文件分级政策**（哪类给、哪类不给、怎么约定） | **⑦ 整段** | ❌ **需丰怀确认** |
| **3** | **设计归属与保密政策**（是否进公开画廊、是否转卖） | **⑧ 整段** | ❌ **需丰怀确认** |
| **4** | **起订量**（竞品写 1 set / 4 pcs） | ⑩⑪⑭ | ❌ **需丰怀确认** |
| **5** | **能否提供生产节点照片/视频** | **⑨ 整段** | ❌ **需丰怀确认（决定删段）** |
| **6** | **是否给区域独家** | ⑭ FAQ 第 15 条 | ❌ **需丰怀确认** |
| **7** | **能否用客户提供的参考图/竞品款号** | ⑭ FAQ 第 9 条 —— **商标红线** | ❌ **需丰怀确认** |
| **8** | NDA 流程 | ⑦⑧ | ❌ **需丰怀确认** |
| **9** | Logo 与中心盖的实际工艺能力（刻/铣/盖） | ⑥ | ❌ **需丰怀确认** |
| **10** | 是否提供品牌色定制 | ⑥ | ❌ **需丰怀确认** |
| **11** | logo 与盖能否第一单就做 | ⑭ FAQ 第 11 条 | ❌ **需丰怀确认** |
| **12** | 贴牌 vs OEM/ODM 的口径 | ⑭ FAQ 第 16 条 | ⚠️ 需拍板 |
| **13** | WhatsApp 商务号 | ① 次 CTA | ❌ **需丰怀确认** |
| **14** | `/custom-development` 页面 | ⑬ 路由出口 3 | ❌ 页面不存在 |
| **15** | **贴牌型号排除出公开目录** 的数据层规则 | ⑧ | ⚠️ 需写入 `tech-architecture` |

**🔴 五段完全阻塞（④⑦⑧⑨⑩）—— 这是全站对「外部输入」依赖最重的一页。**

---

### ★ v2 新增阻塞（§0.5 带出来的）

| # | 事项 | 阻塞 | 归属 |
|---|---|---|---|
| A | **B-1 二选一**：audience 前移到视口 02 vs 并入视口 02 压成 2 句 | 视口 02/06 | 设计 |
| B | **B-2 删除 pathways 后**，`/dealers` 与 `/custom-development` 的入口要不要保留为 `DealerCta` 次级链 | 视口 07 | 设计 |
| C | 🔴 **② 何时该贴牌整段缺失** —— v1 把它排第 2 位并称「前提判定」，代码里没有。**读者全程没被告知「你可能不该贴牌」**，而这是本页最值钱的一段（敢劝退才可信）。**补齐它比修 B-1 更重要** | 视口 02 | 内容 + 决策 |
| D | 🔴 **③④⑨⑩ 四段全缺** —— 其中 ④ 攻心段（T5）与 ⑩ 先做一套是「降门槛」的核心手段。四段缺失使本页**只剩「我们给什么」的宣传面，没有「你该不该做」的判断面** | 全页 | 决策 |
| E | **顺序判据缺失** —— 本页暴露 `DESIGN.md` §0.5.1 的一个边界：它管「一屏几件事」，**不管顺序**。B-1 正是顺序错。**建议补一条「前置判定必须前置」**（本文档只记录，不擅自立规） | `DESIGN.md` | 决策 |

## 附：给上级的商业价值要点（可直接引用）

| 论点 | 依据 |
|---|---|
| **四条产品线里粘性最强的模式** | 贴牌客户一旦建立品牌线，换供应商成本极高 |
| **客单价最高** | 一套贴牌 = Logo 刻印 + 定制盖 + 定制表面 + 设计确认 |
| **把丰怀从「代工」变成「品牌背后的伙伴」** | 客户越成功，越依赖我们 |
| **语料库已有支撑** | `峰徊科技独立站-中英内容语料库.md` 明确含「商业与合作」「品牌宣传」类目 |
| **竞品把它做成全站最长页** | 说明它认为这是决策成本最高、价值最高的一页 |

**我们比竞品强的三处**：多条产品线 / 真实规格数据（1018 型号 3485 配置）/
`/custom-development` 可承接竞品缺失的「品牌启动」页。

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 十四段式（16→14 的合并） | `private-label-page.md` §4 |
| ① 主张 + WhatsApp 预填 9 字段 | `private-label-page.md` §5① |
| ② 4 信号 + 反向筛选 | `private-label-page.md` §2.2 + §5② |
| ③ 不保证利润或区域 | `private-label-page.md` §5③ |
| ④ ★★ 6 个攻心问题（两句组） | `private-label-page.md` §2.1 + §5④ |
| ⑤ 4 能力卡格式 | `private-label-page.md` §5⑤ |
| ⑥ Logo 与中心盖（含 679 值） | `private-label-page.md` §5⑥ |
| ⑦ 三类文件 + 「不是同一种文件」 | `private-label-page.md` §3.1 + §5⑦ |
| ⑧ 设计保密（含数据层影响） | `private-label-page.md` §3.2 + §5⑧ |
| ⑨ 证明节点（可删） | `private-label-page.md` §5⑨ |
| ⑩ ★ 先做一套（5 自检） | `private-label-page.md` §2.3 + §5⑩ |
| ⑪ 5 步（第 05「存下来」） | `private-label-page.md` §5⑪ |
| ⑫ 第一次沟通清单 | `private-label-page.md` §5⑫ |
| ⑬ 路由（竞品「品牌启动」缺口） | `private-label-page.md` §5⑬ |
| ⑭ 16 条 FAQ + 2 条特别处理 | `private-label-page.md` §5⑭ |
| 5 段阻塞 | `private-label-page.md` §6 + §7（13 条待确认） |
| 竞品底本 16 段 / 2,479 字 | `private-label-page.md` 附录 |
