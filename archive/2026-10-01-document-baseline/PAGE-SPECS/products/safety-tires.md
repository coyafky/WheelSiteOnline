# `/products/safety-tires` 页面规格（自修复安全轮胎 —— 品类页）

> **路由**：`/products/safety-tires`（⚠️ **路由尚不存在，需新建**）
> **目标文件**：`src/app/products/safety-tires/page.tsx`
> **渲染**：静态（**零客户端交互**；FAQ 手风琴是唯一交互）
> **数据**：**需新建** `src/content/safety-tires.ts`（`AnswerBlock` + `NeedPoint[]` + `MechanismStage[]` + `SpecPair[]` + `FaqEntry[]` + `RouteStep[]`）
> **设计依据**：`../../ARCHITECTURE/page-architecture/safety-tires-page.md`（**八段式 + 逐段归属标记，本规格只翻译成施工口径**）

---

## 0. 一句话

**🔴 本页现在不能上线**（`README.md` §2.8：「未确认前此页不上线」仍然有效）。
**本规格的存在意义不是「让它上线」，而是**：
1. 把**已经到手的峰徊自有内容**（③④⑥ 三段）翻译成可直接施工的图纸；
2. 把**依赖第三方的部分逐段标出来**，让丰怀一次看清要授权什么；
3. 给出**归属确认后的两条实现路径**（**A 品牌方 / B 合作方**）的**施工差异表**。

**🔴 本页是全站唯一一页受「品牌归属红线」约束的页面** ——
**每一段都必须带归属标记**：✅ 峰徊自有 ｜ ⚠️ 归属待定 ｜ ❌ 第三方专属。

**★ 一个被忽略的事实**：**③④⑥ 三段完全出自峰徊自有画册（P16–P19），不受归属影响**
—— 这是**本页最安全、也最有价值的部分**。②⑧ 是通用结构。**→ 即使「洛克不能用」，仍有 5 段可上线。**

**⚠️ 但上线结论不变** —— 因为 ① 的 CTA 与 ⑨ 无法定稿、⑦ FAQ#6（客户必问）无法回答、⑤ 段写法二义。

**⚠️ 结构判定**：本页在 `index.md` §2 里属「三条能力线」→ 需要 **`<ParamTable>`**（⑥ 段）。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §15 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/products/safety-tires/page.tsx` 实测 **9 个 `<section>`**（2026-10-02）。

> 审计原文：`PageHero` → ② Definition（3 卡）→ ③ `#pain-point`（痛点 + 对号入座 4 条）→ ④ `#mechanism`（`MechanismSteps`）→ ⑤ capability（4 项）→ ⑥ `#specs`（`ParamTable`）→ ⑦ FAQ + **归属未定的开放问题框** → ⑧ `RouteBlock` → ⑨ CTA（**条件：`cta ? ... : DataNotice`**）。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这条线是什么？ | ① `PageHero` | `tireHero` | 深色径向橙光 | 主 CTA（⚠️ 待定） | 无 | ✅ 合规 |
| **02** | 自密封轮胎是什么？ | ② Definition | `tireDefinition` + 3 卡 | 左文 + 3 卡 | 无 | 无 | ✅ 合规 |
| **03** | 我需要吗？ | ③ `#pain-point` | `tirePain` + `audience` 4 条 | 左文 + 4 条网格 | 无 | 无 | ✅ 合规 |
| **04** | 它怎么做到的？ | ④ `#mechanism` | `MechanismSteps` 四步 + 示意图位 | 步骤 + 媒体位 | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **05** | 谁在管验证与交付？ | ⑤ capability | `tireCapabilities` 4 项 | 4 列 `CapabilityGrid` | 无 | 无 | ⚠️ **拥挤**（见 B-1，与 04 相邻） |
| **06** | 性能数字是多少？ | ⑥ `#specs` | `ParamTable` 4 项 + 标准行 + 披露 | 参数表 | 无 | 无 | ✅ 合规 |
| **07** | 常见问题？ | ⑦ FAQ + 开放问题框 | `tireFaqs` + `tireAttributionDisclosure` | 手风琴 + 橙色开放框 | 无 | 无 | ✅ 合规 |
| **08** | 接下来去哪？ | ⑧ `RouteBlock` | `tireRoutes` 3 出口 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |
| **09** | 怎么询盘？ | ⑨ 条件 CTA | `cta` 或 `DataNotice`（pending） | 橙底 / 提示条 | `cta.primary` | `cta.secondary` | ✅ 合规（条件渲染做得好） |

**判定统计**：✅ 6 ｜ ⚠️ 拥挤 3 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 1

### 0.5.3 审计给出的处置

| # | 判定 | 审计发现（原文标题） |
|---|---|---|
| B-1 | ⚠️ | 视口 04（④ mechanism）与 05（⑤ capability）：原理与验证被拆成两屏 |
| B-2 | 🗑️ | 视口 08（⑧ RouteBlock）：答案是重复的 |

> 逐条理由与建议见 `_viewport-audit.md` §15 的 B 小节 —— **本文件不复制理由，只登记落点**。

### 0.5.4 高度预算与询盘整屏

| 项 | 要求 |
|---|---|
| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |
| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** （`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |
| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |

---

<!-- ASSET-REALIGNMENT-2026-10-02 -->
## 0.6 ★ 真实图片资产重排（2026-10-02）

| 视口问题 | 图片资产 | 模块用途 |
|---|---|---|
| 为什么需要安全轮胎？ | `/images/safety-tires/hero-road.webp`、`roadside-damage.webp` | 道路风险与停车/救援场景 |
| 自密封如何工作？ | `/images/safety-tires/yellow-layer-cutaway.webp`、`sealing-layer-diagram.webp`、`sealing-detail.webp` | 解释结构与密封机制 |
| 如何验证？ | `/images/safety-tires/puncture-test-four-nails.webp`、`puncture-test-rig.webp`、`puncture-measurement.webp` | 展示测试场景，性能数字仍以结构化数据和来源为准 |
| 如何生产？ | `/images/safety-tires/production-line.webp`、`vulcanization-workshop.webp` | 生产过程证据 |

**处置**：`roadside-damage.webp` 只用于风险语境，不作为自密封性能证明；证书图片与合作方 Logo 暂不作为已确认品牌/认证事实发布。

## 1. 页面骨架（八段式）+ 🔴 归属总表

| 序 | 内容块 | 必须性 | 说明什么 | 就绪度 | **归属** |
|---|---|---|---|---|---|
| ① | Hero | 必须有 | 定位 | ✅ 有自有文案 | ⚠️ **CTA 待定** |
| ② | 这条线是什么（定义） | 必须有 | 自密封轮胎是什么 + 为什么值得关注 | ✅ | ✅ **不依赖** |
| ③ | **★ 痛点段** | 必须有 | 一次扎钉的代价（**合并「对号入座」**） | ✅ **强** | ✅ **不依赖（P16）** |
| ④ | **★★ 工作原理** | 必须有 | 涂层 / 刺入 / 拔出 / 闭合（四步） | ✅✅ **最强** | ✅ **不依赖（P17）** |
| ⑤ | 我们能提供什么（能力） | 必须有 | 产品 + 验证能力 | ⚠️ 部分 | ⚠️ **中（视归属）** |
| ⑥ | **★ 性能参数** | 必须有 | 4 项数字 + GB/T 38510 参考行 | ✅ **四项全自有** | ✅ **不依赖（P19/P18）** |
| ⑦ | 常见问题 FAQ | 必须有 | 工程与合规口径 | ⚠️ 4/6 可用 | ⚠️ **2 条待定** |
| ⑧ | 路由（下一步去哪） | 必须有 | → `/capabilities` `/products` `/contact` | ✅ | ✅ |
| ⑨ | 询盘 CTA | 必须有 | ⚠️ **视归属** | ❌ | ❌ **完全依赖** |
| ~~⑤b~~ | ~~型号 / 规格~~ | **留空** | ❌ 语料库无任何轮胎规格 → 不渲染 | — | — |

**⚠️ 兑现上架门槛**（`README.md` §3.1）：本线 ⑤ 型号/规格留空 → **9 段模板实际落成 8 段**。

**⚠️ 与 §3.1 模板的一处偏离**（设计文档 §4 明写）：
模板的 ③ 是「给谁用 / 对号入座」，**本页把它与痛点段合并** ——
因为轮胎的「对号入座」天然就是痛点（**EV 没备胎的人 / 跑长途的人 / 补胎成本高的人**）。

```
/products/safety-tires
├── ① <HeroDark>                       eyebrow SAFETY TIRES · H1 + 副标 + CTA(⚠️待定)
├── ② <AnswerBlock>                     定义三段
├── ③ <NeedBlock>  ★                   痛点核心句 + 对号入座 4 条（合并段）
├── ④ <MechanismSteps>  ★★             四步原理 + 示意图组（⚠️ 图待授权）
├── ⑤ <CapabilityGrid>                  验证 / 标准 / 检测 / 售后（⚠️ 视归属改写）
├── ⑥ <ParamTable>  ★                   4 项参数 + GB/T 38510 参考行 + 3mm/8mm 区分行
├── ⑦ <FaqAccordion>  ★                 5–6 条（**#6 = 必答题，归属确认前空着**）
├── ⑧ <RouteBlock>                      三出口（T7）
│      └── <TireCta>  ⚠️                ★ 收尾（**归属确认前不写具体文案**）
└──    <DataNotice>                     性能数字「测试条件与报告可按需提供」
```

**🔴 归属标记图例（全规格通用，施工时逐段照抄）**：
- ✅ **峰徊自有** —— 可安全使用
- ⚠️ **归属待定** —— 语料库标注为洛克，但峰徊画册同页并列过
- ❌ **第三方专属** —— 明确属洛克或航鹏，**不得表述为峰徊自有**

---

## 2. 逐块规格

### ① Hero（深色）｜归属：⚠️ **CTA 待定**

| 项 | 内容 | 归属 |
|---|---|---|
| 结构 | `.eyebrow` + `<h1>` + 副标 + 一句话 + CTA | — |
| eyebrow | `SAFETY TIRES` | ✅ |
| H1 | **自修复安全轮胎** / Self-Sealing Safety Tires | ✅ 峰徊 P2 |
| 副标 | 高分子复合自密封涂层 / High-performance polymer self-sealing coating | ✅ 峰徊 P4/17 |
| 一句话 | 异物刺入时包裹异物并抑制漏气；拔出后材料快速闭合穿刺通道 | ✅ 峰徊 P17 |
| **CTA** | ⚠️ **待归属确认**（⚠️ **确认前不写具体文案**） | ⚠️ |
| 容器 | `.container-fh`（1180） | — |
| 背景图 | `tires-user-provided-self-sealing-tire-hero-png`（`altReviewed:true`）；⚠️ 备注写「内部结构按**示意图**处理」 | ⚠️ |

**CTA 双路径文案（施工时按归属结论择一，**现在都不写**）**：

| 路径 | 主 CTA | 次 CTA |
|---|---|---|
| **A 品牌方** | 「经销咨询」→ `/contact` | 「看性能参数」→ `#specs` |
| **B 合作方 / 渠道方** | 「合作咨询」→ `/contact` | 「看工作原理」→ `#mechanism` |

**🔴 硬规则**：
1. **背景图若用，必须标「示意图」** —— registry 备注明文要求（内部结构不能用实拍口吻）。
2. **三处禁词（全页，不限本段）**：
   - ❌ **「扎不破」「防扎」** —— 绝对化用语风险区（峰徊自有口径用「自密封」「穿刺通道闭合」，**更稳妥**）
   - ❌ **「龙头企业」「第一」「比国标更高一级」**（洛克口径）
   - ❌ **「70% 车祸」「伤亡率接近 100%」**（详见 ③ 段）

**就绪度**：✅ 文案齐（**全部不出现「洛克」字样**）；⚠️ CTA 待定；⚠️ 主图待授权

---

### ② 这条线是什么（定义段）｜归属：✅ **不依赖**

| 项 | 规格 |
|---|---|
| 结构 | 3 小节：**是什么** / **解决什么** / **为什么现在值得关注** |
| 组件 | **`<AnswerBlock>`**（`types.ts:123` 复用） |

**三段口径**（照设计文档 §4②）：

| 小节 | 内容 | 归属 |
|---|---|---|
| 1. 什么是自密封轮胎 | 涂层位于**轮胎内衬区域** | ✅ 峰徊 P17 |
| 2. 它解决什么问题 | **不是「防刺穿」，是「扎了之后不必立即停车换胎」**（时间与安全） | ✅ |
| 3. **为什么现在值得关注** | **「未配备备胎的 EV，对道路救援的依赖更直接」** | ✅ **峰徊 P16** |

**★ 第 3 点是最有力的自有论据** —— 把产品与新能源趋势绑定，**完全出自峰徊画册，不依赖任何第三方**。

**props 契约**：

```ts
// 复用已有类型 src/content/types.ts:123
type AnswerBlock = {
  eyebrow: string;    // "这条线是什么"
  heading: string;    // "扎了之后，不必立即停车换胎"
  body: string;       // 涂层位置 + 解决什么
  points: string[];   // ★ 三条，第 3 条 = EV 无备胎论据（供 AI 抽取）
};
```

**禁止项**：
- ❌ 不得写「防刺穿」「扎不破」（见 ① 段禁词表）
- ❌ 不得引用洛克的市场数据（**6.3 万亿 / 3.6 万亿 / 3.36 亿辆 / 2.2 亿条**）

**就绪度**：✅ 定义全就绪

---

### ③ ★ 痛点段（合并「对号入座」）｜归属：✅ **不依赖（峰徊 P16）**

**核心句（峰徊 P16，自有口径 —— 本页现在就能用的文案资产）**：

> **一次扎钉，代价不只是补胎** / A Puncture Costs More Than a Repair
>
> **轮胎扎钉不仅是维修问题，也会同时带来安全、时间与道路救援问题。**
> Tire punctures are not only a maintenance issue. They create safety risks,
> downtime and roadside-assistance costs.

| 项 | 规格 |
|---|---|
| 结构 | **核心句块** + **对号入座 4 条** |
| 组件 | **`<NeedBlock>`**（**需新建** —— 与 `<SelfIdentifyBlock>` 同族，**优先复用**，见 §3） |
| 数据 | `PositioningPoint[]`（`types.ts:157`，**已定义**）|
| 锚点 | `id="pain-point"` |

**对号入座 4 条**（要新写，但**基于自有论据**）：

```
如果你符合下面任一情况，这类产品值得了解：
① 你的车没有备胎（越来越多的新能源车如此）
② 你经常跑长途 / 高速 / 非铺装路
③ 你不想在路边补胎（时间成本 + 救援成本）
④ 你是渠道商，想补一个「安全」卖点的品类
```

**props 契约**：

```ts
// src/components/need-block.tsx（★ 需新建 —— 但优先核对 <SelfIdentifyBlock> 是否可复用）
type PositioningPoint = { title: string; body: string };   // types.ts:157 复用

type NeedBlockProps = {
  eyebrow: string;                    // "一次扎钉的代价"
  heading: string;                    // 核心句中文
  headingEn?: string;                 // 核心句英文（双语并列）
  body: string;                       // 展开说明
  audienceHeading: string;            // "如果你符合下面任一情况…"
  audience: PositioningPoint[];       // ★ 4 条
  className?: string;
};
```

**🔴🔴 硬规则（本段的红线，施工时零容忍）**：

| ❌ 绝对不用 | 为什么 | 来源 |
|---|---|---|
| **「70% 的车祸源于扎钉」** | 洛克口径 + 声称源自公安部。**峰徊官网若发布 = 峰徊对第三方数据背书** | 洛克 P6 |
| **「爆胎伤亡率接近 100%」** | 极端数据，**广告法高风险表述** | 洛克 P6 |
| 任何「用恐吓卖安全」的写法 | 既踩广告法，也不是峰徊自有口径 | 设计文档 §4③ |

**⚠️ 「对号入座」4 条必须基于自有论据** —— **不得引用第三方事故率数据**。

**就绪度**：✅ **强（峰徊 P16 自有，四句一套）**

---

### ④ ★★ 工作原理（本页最重要、也最安全的一段）｜归属：✅ **不依赖（峰徊 P17）**

**整段基于峰徊自有 P17 —— 本页唯一不受归属影响的完整技术叙述。**

| 项 | 规格 |
|---|---|
| 结构 | **四步机制条** + **示意图组**（⚠️ 图待授权） |
| 组件 | **`<MechanismSteps>`**（**需新建**）→ 内含 `<MechanismStep>`（4 项） |
| 数据 | `FlowStep[]`（`types.ts:163` **复用** —— 四步 = step/title/body 正好吻合） |
| 锚点 | `id="mechanism"` |
| 栅格 | ≥1024 → 4 列；768 → 2 列；390 → 纵向连接线 |
| 图规范 | 按 `content-design-and-new-pages.md` 图例规范：**「过程/机制」首选 mermaid 围栏或示意图（档 A/B）** |

**四步内容**（照设计文档 §4④，**不改写**）：

| # | 步骤 | 内容 |
|---|---|---|
| ① | **涂层位置** | 高性能高分子复合密封层位于**轮胎内衬区域** |
| ② | **异物刺入** | 涂层包裹异物并帮助抑制漏气 |
| ③ | **异物拔出** | 材料快速闭合穿刺通道 |
| ④ | **密封响应** | 自密封响应可达 **0.05 s** ← ⚠️ **该数字见下方归属提示** |

**⚠️ 已有素材（正好对应四步）**：
`assets/preview-media/` 里 `tire-cutaway.webp` / `tire-sealing-detail.webp` /
`tire-puncture.webp` / `tire-validation.webp` —— **正好对应本段四个步骤**。
**但这 9 张 tire 图全部 `public: false`**，且多数标注
**「品牌、市场数据、客户照片须重核」**（来源 `luoke-project-mobile-cn-2024`）→ **见 §6 #5**。

**props 契约**：

```ts
// src/components/mechanism-steps.tsx（★ 需新建）
type FlowStep = { step: string; title: string; body: string };   // types.ts:163 复用

type MechanismStep = FlowStep & {
  /** ★ 配图（⚠️ 全部 public:false，未授权时 undefined → 走纯文字） */
  image?: { src: string; alt: string; width: number; height: number };
};

type MechanismStepsProps = {
  steps: MechanismStep[];        // ★ 固定 4 条
  /** ★ 整段级免责 —— 图片与叙事的证据声明 */
  mediaNotice?: string;          // "内部结构为示意图"
  anchorId?: string;             // "mechanism"
  className?: string;
};
```

**🔴 硬规则**：
1. **「0.05 s」的归属在确认前不进 DOM** —— 语料库两处皆有此数字，**但归属不同**：
   - ✅ 峰徊 P17：「自密封响应可达 0.05 s」
   - ❌ 洛克 P9：「0.05S 修复创口」（**洛克「自愈系统」口径**）
   **→ 看似可以直接用，但必须确认后再用**（§6 #3）。
   **施工实现**：把 0.05 s 做成**第 ④ 步的可选字段**（`responseValue?: string`），
   **归属确认前 `undefined` → 第 ④ 步只写文字「材料快速闭合穿刺通道」，不出现数字**。
2. **图片必须带 `mediaNotice`** —— 「内部结构按示意图处理」（registry 备注要求）。
3. **四步顺序不可调** —— 涂层位置 → 刺入 → 拔出 → 闭合 是**机制顺序**。

**禁止项**：
- ❌ 不得出现「洛克高分子聚变记忆橡胶涂层」（**明示为洛克专利涂层**）
- ❌ 不得出现「高分子复合材料 18 种」（洛克口径）
- ❌ 不得出现「0.05S 修复创口」（洛克口号式表述）

**就绪度**：✅✅ **最强（峰徊 P17 自有，四步完整）** —— ⚠️ 仅 0.05 s 与图片待授权

---

### ⑤ 我们能提供什么（能力段）｜归属：⚠️ **中（视归属）**

**⚠️ 本段的写法完全取决于归属结论**（见 §5 双路径）：

| 归属 | ⑤ 段写什么 | 主语 |
|---|---|---|
| **路径 A 品牌方** | 产品谱系 + 自密封验证能力（压钉验证 / GB/T 38510 参考） | 「我们的安全轮胎」 |
| **路径 B 合作方 / 渠道方** | **我们能提供这个品类** + 验证与质量把关 + 交付能力 | 「峰徊提供的安全轮胎」 |

**⭐ 无论哪种归属，都有一块可用的自有内容**：

| 卡 | 项 | 内容 | 归属 |
|---|---|---|---|
| 1 | **验证方式** | **内部压钉验证**（8 mm 测试钉） | ✅ 峰徊 P18 |
| 2 | **参考标准** | GB/T 38510—2020（**作为参考**） | ✅ 峰徊 P18 |
| 3 | **检测流程** | **数智化生产** | ✅ 峰徊 P20 |
| 4 | **售后** | 拖车与道路救援 | ✅ 峰徊 P16 |

**props 契约**：**复用 `<CapabilityGrid>`**（同 ev-components ⑤ / custom-aluminum ⑤ 同一组件）。

```ts
type Capability = { index: string; title: string; body: string };   // types.ts:16 复用

// ⚠️ 调用时按归属改写：路径 B 需把主语从「我们的」换成「峰徊提供的」
<CapabilityGrid capabilities={tireCapabilities} columns={4} />
```

**🔴 禁止项（本段的「不写」清单）**：
- ❌ 自有工厂 / 源头工厂 / 无中间商赚差价（**洛克的工厂**，不是峰徊的）
- ❌ 产能 / 专利数 / 龙头企业 / 专精特新 / 国家级高新技术企业（洛克口径）
- ❌ 热熔喷涂流水线（洛克产线）
- ❌ 云仓渠道 / 无理由换货 / 闪电售后（洛克渠道政策）
- ❌ 覆盖全球 70 多个国家和地区（洛克市场覆盖）
- ❌ 项目输出 / 城市运营 / 加盟连锁 / 国际贸易四种生态模式（洛克商业模式）

**就绪度**：⚠️ 部分 —— **4 卡有自有来源，但整段主语待归属结论**（§6 #7 缺口：峰徊自有的产能/产地/MOQ/渠道政策）

---

### ⑥ ★ 性能参数｜归属：✅ **不依赖（峰徊 P19 + P18）**

**这四项数字全部来自峰徊画册 P19（自有口径），是本页可公开展示的硬数据。**

| 项 | 规格 |
|---|---|
| 结构 | **4 项参数表** + **GB/T 38510 参考行** + **3mm/8mm 区分行** |
| 组件 | **`<ParamTable>`**（`index.md` §2 已登记，「三条能力线」共用件 → **需新建**） |
| 数据 | `SpecPair[]`（`types.ts:83` 复用） |
| 锚点 | `id="specs"` |
| 数字字体 | **`font-display`**（瘦长，视觉锚点 —— `_components.md` §1.2 纪律） |

**4 项参数**（照设计文档 §4⑥）：

| 参数 | 值 | 英文 |
|---|---|---|
| 滚动噪声 | **60–67 dB(A)** | Rolling noise |
| 平均耐磨值 | **390** | Average tread-wear index |
| 湿地抓地等级 | **Grade A** | Wet-grip class |
| 耐温范围 | **−40 ~ +178 °C** | Operating-temperature range |

**★ 参考标准行（峰徊 P18）**：
> **以 GB/T 38510—2020 为参考并列示 3 mm 测试钉**
> Reference standard: GB/T 38510-2020; 3-mm test spike per national-standard specification.

**★ 3mm/8mm 区分行（峰徊 P18 —— 设计文档说这是本页设计得最好的地方）**：
> **3 mm 参考条件，8 mm 内部验证** —— 国标要求 3 mm，**我们内部按 8 mm 验证**。
>
> ⚠️ 「品控比国标更高一级」是**洛克口径，不能直接用**；
> 但**「3mm 参考 / 8mm 内部验证」是峰徊自有**，且传达同样信息 —— **用这句。**

**props 契约**：

```ts
// src/components/param-table.tsx（★ 需新建 —— 三条能力线共用）
type SpecPair = { label: string; value: string };   // types.ts:83 复用

type ParamRow = SpecPair & {
  /** ★ 该参数是否有测试报告支撑（缺口 10） */
  reportAvailable: boolean;
  /** 英文名（双语并列） */
  labelEn?: string;
};

type ParamTableProps = {
  rows: ParamRow[];              // ★ 4 项性能参数
  /** ★ 参考标准行（本页必填 —— GB/T 38510—2020） */
  standardNote?: { label: string; value: string; note: string };
  /** ★ 区分行（3mm 参考 / 8mm 内部验证） */
  highlightNote?: { title: string; body: string };
  /** ★ 数字下统一声明 —— 必填 */
  reportNote: string;            // "测试条件与报告可按需提供"
  anchorId?: string;             // "specs"
  className?: string;
};
```

**🔴 硬规则（本段的纪律）**：
1. **每个数字下方标「测试条件与报告可按需提供」** ——
   **不写「通过 XX 认证」**（认证按 §3 纪律写「按适用型号和目的国确认」）。
2. **认证表述照抄峰徊 P20**：
   > **ECE、DOT 等资料按适用型号和目的国确认**
   **← 照抄这句，不承诺具体型号。**
3. **不得写「通过 ECE / DOT 认证」** —— 认证必须写清范围。

**禁止项**：
- ❌ 不得写「品控比国标更高一级」（洛克口径；**用 3mm/8mm 区分行代替**）
- ❌ 不得由 390/60–67 等数字推出「行业领先」等比较性结论
- ❌ 不得把 GB/T 38510 写成「我们通过了 GB/T 38510」（**它是参考并列，不是认证**）

**就绪度**：✅ **四项数字全自有（峰徊 P19）** —— ⚠️ 仅缺测试报告佐证（缺口 10）

---

### ⑦ 常见问题 FAQ｜归属：⚠️ **2 条待定**

| 项 | 规格 |
|---|---|
| 结构 | 手风琴 **5–6 条** |
| 组件 | **`<FaqAccordion>`**（复用，契约同 `ev-components.md` §2⑦） |
| 数据 | `FaqEntry[]`（`types.ts:77` 复用） |
| 调性 | 工程与**合规**口径 |

**6 条题目（照设计文档 §4⑦，归属标记照抄）**：

| # | 问题 | 回答要点 | 归属/可用性 |
|---|---|---|---|
| 1 | 自密封涂层在哪一层？ | **轮胎内衬区域** | ✅ 自有（P17） |
| 2 | 扎了多大的钉子能自密封？ | **3 mm 参考 / 8 mm 内部验证**；⚠️ **可封闭最大孔径待确认** | ✅ 部分（P18） |
| 3 | 拔钉后会漏气吗？ | 材料快速闭合穿刺通道 | ✅ 自有（P17） |
| 4 | 有 ECE / DOT 认证吗？ | **「按适用型号和目的国确认」**（照抄） | ✅ 自有（P20） |
| 5 | 质保多久？ | ⚠️ **待归属确认** —— 3 年 6 万公里与 PICC 1000 万均标洛克 | ⚠️ 待定 |
| 6 | **你们的轮胎和洛克是什么关系？** | ⚠️ **待归属确认** | ❌ **空** |

**🔴🔴 FAQ#6 是本页的「必答题」**：
> **客户一定会问，而且不答反而更糟。**
> **在归属确认前，这一条空着；确认后必须正面回答。**（设计文档 §4⑦原文）

**施工实现（关键）**：**FAQ#6 不是「隐藏」，而是「数据层不导出 + 页面显式说明」**
—— 因为**隐藏会让页面看起来在回避**（比空着更糟）。

```ts
// 三态开关（★ 与 boundaryTerms.excludedConfirmed 同思路）
export const tireFaqs: FaqEntry[] = [ /* #1–#4 ✅ + #5/#6 视归属 */ ];

export const faqDisclosure: {
  /** ★ 归属确认状态 → 决定 #5/#6 是否进 DOM */
  attributionResolved: boolean;    // ⚠️ 默认 false
  /** ⚠️ false 时的公开说明（★ 必填，不得静默省略） */
  pendingNote: string;
} = {
  attributionResolved: false,
  pendingNote: "关于品牌与合作关系的说明，正在与品牌方核实，确认后补充。",
};
```

**⚠️ 归属确认后 #6 必须正面回答，两条路径的答法**：

| 路径 | #6 答法 |
|---|---|
| **A 品牌方 / 同集团** | 「洛克是[同集团 / 我们的]品牌，具体关系：……」（**需丰怀提供官方表述**） |
| **B 合作方** | 「我们提供由洛克生产的安全轮胎品类，双方的供货与合作关系是……」 |

**🔴 硬规则**：
- ✅ FAQ#4 认证答法**必须逐字照抄**「按适用型号和目的国确认」
- ❌ #5 质保**不得填 3 年 6 万公里**（归属待定 —— 设计文档 §6 #2）

**就绪度**：⚠️ **4/6 可用，2 条待定**（其中 #6 是必答题）

---

### ⑧ 路由段（下一步去哪）｜归属：✅ **不依赖**

| 项 | 规格 |
|---|---|
| 组件 | **`<RouteBlock>`**（复用，`RouteStep[]`，`columns={3}`） |

```ts
// 三出口（照设计文档 §4⑧）
const routes: RouteStep[] = [
  { step: "01", title: "这一品类的验证与制造背景", body: "想看验证与制造",
    href: "/capabilities", linkLabel: "看能力全景" },
  { step: "02", title: "峰徊的其它产品线", body: "想看其它三条产品线",
    href: "/products", linkLabel: "看全部产品线" },
  { step: "03", title: "想谈经销或合作", body: "直接沟通",
    href: "/contact", linkLabel: "联系我们" },
];
```

**⚠️ 与 `/capabilities` 的边界（必写清，`safety-tires-page.md` §8）**：
> **安全轮胎的验证（压钉）与三电的验证（泄漏检测）性质不同，不宜混在一页。**
> **本页写「这个产品怎么被验证」；`/capabilities` 写「我们的产线与实验室长什么样」（资产导向）。**

**就绪度**：✅ 结构就绪

---

### ⑨ 询盘 CTA ｜归属：❌ **完全依赖（确认前不写具体文案）**

| 项 | 规格 |
|---|---|
| 组件 | ⚠️ **`<TireCta>`（需新建）或复用 `<DealerCta>`** —— **取决于归属**（见下表） |
| **文案** | ⚠️ **归属确认前不写具体文案**（**本段整体留空，不渲染任何 CTA 块**） |
| 字数 | ≤80 字 |

**⚠️ 双路径 CTA 差异**：

| 路径 | CTA 语义 | 组件建议 |
|---|---|---|
| **A 品牌方** | **经销咨询** | 可复用 **`<DealerCta>`**（21 处在用，语义吻合） |
| **B 合作方 / 渠道方** | **渠道合作咨询** | **`<DealerCta>` 换文案** 或新建 `<PartnerCta>` |

**🔴 施工实现（关键）**：
**归属未确认前，⑨ 段整块不渲染** —— 而不是渲染一个占位 CTA。
理由：一个不知道指向哪里的 CTA，比没有 CTA 更伤转化与信任。
**（但这违反 `index.md` §4 全局纪律 #1「每页必须有询盘入口」→ 见 §6 阻塞 #5。）**

**就绪度**：❌ **完全依赖归属结论**

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 本页用途 | 备注 |
|---|---|---|---|
| **`<DealerCta>`** | `src/components/sections/dealer-cta.tsx` | ⑨ 收尾（**仅路径 A**） | ✅ 21 处在用 |

**⚠️ 可直接复用的已有组件 = 1 个（且条件性）** —— 与另两份能力线规格结论一致。

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 | 优先级 |
|---|---|---|---|---|
| **`<ParamTable>`** | `src/components/param-table.tsx` | ⑥ 参数表（4 项 + 标准行 + 区分行） | **三条能力线** | 🔴 **本页核心** |
| **`<MechanismSteps>`** | `src/components/mechanism-steps.tsx` | ④ 四步原理 + 示意图组 | 仅本页（**形态可复用**） | 🔴 |
| **`<NeedBlock>`** | `src/components/need-block.tsx` | ③ 痛点 + 对号入座 | **2+ 页**（**优先并入 `<SelfIdentifyBlock>`**） | 🟠 |
| **`<CapabilityGrid>`** | `src/components/capability-grid.tsx` | ⑤ 4 能力卡 | **3 条能力线共用** ★ | 🟠 |
| **`<FaqAccordion>`** | `src/components/faq-accordion.tsx` | ⑦ FAQ | **3 页** ★ | 🟠 #5 |
| **`<RouteBlock>`** | `src/components/route-block.tsx` | ⑧ 三出口 | **8+ 页** ★ | 🔴 #2 |
| **`<DataNotice>`** | `src/components/data-notice.tsx` | ⑥ 报告声明 + ⑨ 尾部 | **6 页** ★ | 🔴 #1 |
| **`<TireCta>`** | ⚠️ **建议先不建** | ⑨ 收尾（**路径 B 才需要**） | 仅本页 | 🟡 |

**⚠️ 命名纪律核对**（`index.md` §2.1）：
`FaqAccordion` / `RouteBlock` / `ProcessSteps` / `DataNotice` / `StatStrip` / `CapabilityGrid` 六个公共名**不得起别名**。
**⚠️ 本页新增的名字**：
- **`ParamTable`**（`index.md` §2 已登记 ✓ 「三条能力线」共用）
- **`MechanismSteps`**（**本规格首次提出** —— 与 `ProcessDiagram` / `ProcessSteps` 同族，
  建议先核对能否并入 `ProcessSteps` 的 `variant: "steps" | "diagram" | "mechanism"`，见 §6 阻塞 #3）
- **`NeedBlock`**（**本规格首次提出** —— 与 `<SelfIdentifyBlock>` 高度同构，
  **强烈建议不新建**，直接用 `SelfIdentifyBlock` + 不同数据，见 §6 阻塞 #4）

---

## 4. 数据契约

### 4.1 类型（全部复用 `types.ts` 已有类型）

```ts
// src/content/safety-tires.ts —— ★ 需新建
import type {
  AnswerBlock,        // types.ts:123 —— ② 定义
  Capability,         // types.ts:16  —— ⑤ 能力
  FaqEntry,           // types.ts:77  —— ⑦ FAQ
  FlowStep,           // types.ts:163 —— ④ 四步原理
  PositioningPoint,   // types.ts:157 —— ③ 对号入座
  RouteStep,          // types.ts:105 —— ⑧ 路由
  SpecPair,           // types.ts:83  —— ⑥ 参数
} from "./types";

/** ★ 归属标记 —— 本页每个导出块都带（施工时逐段照抄） */
export type Attribution = "fenghuai" | "pending" | "third-party";

export type Attributed<T> = {
  value: T;
  attribution: Attribution;   // ✅ / ⚠️ / ❌
  /** ⚠️ / ❌ 时的说明与来源 */
  note?: string;
};

/** ★ 本页新增 1 个类型（④ 段） */
export type MechanismStep = FlowStep & {
  responseValue?: string;      // ⚠️ "0.05 s" —— 归属确认前 undefined
  image?: { src: string; alt: string; width: number; height: number };
};

export const tiresHero: Attributed<{ eyebrow; heading; subheading; lede }> = { /* ✅ */ };
export const tiresCta: Attributed<{ title; body; primary; secondary }> | null = null;  // ❌ 待定
export const tiresDefinition: Attributed<AnswerBlock> = { /* ✅ */ };
export const tiresPain: Attributed<{ heading; headingEn; body; audience: PositioningPoint[] }> = { /* ✅ */ };
export const tiresMechanism: Attributed<MechanismStep[]> = { /* ✅ ×4，responseValue 待定 */ };
export const tiresCapabilities: Attributed<Capability[]> = { /* ⚠️ 4 条，主语待定 */ };
export const tiresSpecs: Attributed<{ rows: SpecPair[]; standardNote; highlightNote; reportNote }> = { /* ✅ */ };
export const tiresFaqs: Attributed<FaqEntry[]> = { /* ⚠️ #1–#4 ✅，#5/#6 待定 */ };
export const tiresRoutes: Attributed<RouteStep[]> = { /* ✅ */ };

/** ★ 归属开关（页面级 + 全局） */
export const attribution: {
  resolved: boolean;                                  // ⚠️ 默认 false
  path: "A-brand-owner" | "B-partner" | null;         // 确认后落定
  note: string;                                       // 确认后替换
} = { resolved: false, path: null, note: "品牌归属待确认" };
```

**★ `Attributed<T>` 是本页唯一的「新概念」，只服务本页** ——
**不要推广到另两份能力线**（那两页没有归属问题）。

### 4.2 字段来源与归属（**逐字段照抄语料库来源列**）

| 段 | 字段 | 来源 | 归属 | 施工可用性 |
|---|---|---|---|---|
| ① | H1 / 副标 / 一句话 | 峰徊 P2 / P4·17 / P17 | ✅ | 可用 |
| ① | **CTA 文案** | — | ⚠️ | ❌ **不写** |
| ② | 三段 | 峰徊 P17 / P16 | ✅ | 可用 |
| ③ | 核心句 + 对号入座 | 峰徊 P16 | ✅ | 可用 |
| ④ | 四步 | 峰徊 P17 | ✅ | 可用（⚠️ 0.05 s 待确认） |
| ④ | 配图 ×4 | `assets/preview-media/tire-*` | ⚠️ | ❌ **全部 `public:false`** |
| ⑤ | 4 能力卡 | 峰徊 P18 / P18 / P20 / P16 | ✅ | ⚠️ 主语待归属 |
| ⑥ | 4 参数 + 标准行 + 区分行 | 峰徊 P19 / P18 | ✅ | 可用（⚠️ 报告佐证缺口 10） |
| ⑦ | #1–#4 | 峰徊 P17 / P18 / P17 / P20 | ✅ | 可用 |
| ⑦ | #5 质保 | 洛克 P21 | ⚠️ | ❌ **不写** |
| ⑦ | #6 与洛克关系 | — | ❌ | ❌ **空（必答题）** |
| ⑧ | 三出口 | — | ✅ | 可用 |
| ⑨ | CTA | — | ❌ | ❌ **整块不渲染** |

### 4.3 ★ 图片从哪来（**本页图依赖最重的一段**）

| 段 | 需要图？ | 素材 | 现状 | 搬运 |
|---|---|---|---|---|
| ① Hero | 是 | `tires-user-provided-self-sealing-tire-hero-png` | ⚠️ `altReviewed:true` 但 `draft` | 须核实 |
| **④ 四步** | **是（4 张）** | `tire-cutaway.webp` / `tire-sealing-detail.webp` / `tire-puncture.webp` / `tire-validation.webp` + `tire-risk.webp` / `tire-measurement.webp` / `tire-production-line.webp` / `tire.png` / `tire.webp`（**共 9 张**） | ❌ **全部 `public:false`**，多数标「品牌、市场数据、客户照片须重核」（来源 `luoke-project-mobile-cn-2024`） | ❌ **须逐条核实后可搬** |
| ⑤⑥⑦ | 否 | — | ✅ 纯文字/表格 | — |

**🔴 施工纪律**：
1. **9 张 tire 图全部未授权** → ④ 段**走纯文字四步 + 手绘示意（CSS/SVG）**，
   **不请求 `public/` 里的不存在的文件**（否则 404）。
2. **搬运路径**（授权后）：`assets/preview-media/tire-*.webp` → `public/images/products/safety-tires/*.webp`
   （**目录不存在，需 `mkdir`**）。
3. **④ 段图片必须带 `alt` + `mediaNotice`「内部结构为示意图」**。
4. **预留位「原理示意图组」不渲染空模块**（设计文档 §7.3）。

---

## 5. ★ 归属确认后的两条实现路径（**施工差异表**）

**这是本规格最有价值的产出：无论结论是什么，都有可执行的施工路线。**

### 路径 A：峰徊是品牌方（或与洛克同集团、可授权）

**做法**：本页升级为**完整产品页**。

| 可新增内容 | 来源 | 施工影响 |
|---|---|---|
| 洛克品牌与峰徊关系的明示段 | 需丰怀提供官方表述 | **新增第 ② 段子块** |
| 质保条款（3 年 6 万公里 / PICC 1000 万责任险） | 洛克 P21（授权后） | **⑦ FAQ#5 落地 + 可选「质保与渠道卡」** |
| 产品谱系（轮胎规格 / 花纹型号） | ⚠️ **目前完全缺失**（语料库无任何轮胎规格） | **⑤b 型号/规格位可启用 → 页变「九段式」** |
| 渠道政策（云仓 / 无理由换货） | 洛克 P14/23（授权后） | **⑤ 段新增卡** |
| 8 张 tire-* 图片（PICC / 生产 / 仓储） | registry `09-tires` 34 条（授权后） | **④ 段图片组上线** |
| ⑨ CTA =「经销咨询」 | — | **复用 `<DealerCta>`** |

**⚠️ 即便授权，路径 A 仍缺最关键的一项：轮胎规格清单（缺口 #4）。**
**没有规格，仍做不成产品页 —— 只能做品牌页。**

### 路径 B：峰徊是合作方 / 渠道方

**做法**：本页**降级为「品类介绍页」**，主语全部改为「峰徊提供的安全轮胎」。

| 段落 | 路径 B 的施工写法 |
|---|---|
| ① Hero | 「自修复安全轮胎 —— 峰徊提供的安全出行品类」；CTA =「合作咨询」 |
| ② 定义 | ✅ **不受影响** |
| ③ 痛点 | ✅ **不受影响**（自有口径） |
| ④ 原理 | ✅ **不受影响**（自有口径） |
| ⑤ 能力 | 改为「我们的验证与交付能力」（**主语改写**） |
| ⑥ 参数 | ✅ **不受影响**（自有口径） |
| ⑦ FAQ | **去掉质保条**；**保留「与洛克的关系」并正面说明** |
| ⑧ 路由 | ✅ **不受影响** |
| ⑨ CTA | 改为「渠道合作咨询」（**建议复用 `<DealerCta>` 换文案**，不新建组件） |

**→ 路径 B 下本页依然可以上线，且 ④⑥ 两段（最技术、最有价值的两段）完全保留。**

### 两条路径的施工对照

| | **路径 A（品牌方）** | **路径 B（合作方）** |
|---|---|---|
| 页面上线 | 需**规格数据**才能成产品页 | **可直接上线**（品类页） |
| 段数 | 可扩展为 **9 段**（启用 ⑤b 规格位） | **8 段**（⑤b 永久留空） |
| 新增组件 | `ProductSpecTable`（本页首次需要） | 无（全部复用） |
| 主语 | 「我们的安全轮胎」 | 「峰徊提供的安全轮胎」 |
| ④ 段图片 | 可上线 | 视授权（可仅看图不看品牌语境） |
| 主要风险 | 授权范围不清 | 客户误解关系 |
| 建议优先级 | 数据补齐后 | **✅ 可先走这条** |

---

## 6. 待补与阻塞

### 6.1 🔴 待确认（设计文档 §6 —— **本页阻塞项最重**，归施工影响排序）

| # | 事项 | 阻塞哪段 | 谁回答 |
|---|---|---|---|
| 1 | 🔴🔴 **峰徊与洛克 LOAKE 的法律关系**（品牌方 / 同集团 / 合作 / 无关） | **全页** | 丰怀 + 法务 |
| 2 | ⚠️ **3 年 6 万公里质保 + PICC 1000 万责任险是否属于峰徊产品**（峰徊画册 P21 同载数字） | ⑦ FAQ#5 | 丰怀商务 |
| 3 | ⚠️ **「0.05 s」的归属**（峰徊 P17 与洛克 P9 同数字） | ④ 原理段第 ④ 步 | 丰怀工程 |
| 4 | **轮胎规格 / 花纹型号清单是否存在** | ⑤ 能力 · ⑤b 产品位 | 丰怀 |
| 5 | **9 张 tire-* 图片能否公开** | ④ 原理段配图 | 丰怀 + 法务 |
| 6 | **ECE / DOT / CCC 的具体持证型号** | ⑦ FAQ#4 | 丰怀 |
| 7 | **峰徊自有的产能 / 产地 / MOQ / 渠道政策**（现有全为洛克口径） | ⑤ ⑨ | 丰怀商务 |
| 8 | 「航鹏」内容是否与本页相关（航鹏为**轮毂**企业） | 无关 —— **确认后可整块排除** | 丰怀 |
| 9 | **是否允许出现「洛克」品牌名** | ①② 段 | 法务 |
| 10 | **性能数字（390 / 60–67 dB / −40~178 °C）是否有测试报告支撑** | ⑥ 参数段 | 丰怀工程 |

### 6.2 施工阻塞（本规格新增）

| # | 事项 | 阻塞 | 归属 |
|---|---|---|---|
| 1 | 🔴🔴 **§6.1 #1 未回答前，本页不上线**（`README.md` §2.8 红线） | **整页** | **需求方 + 法务** |
| 2 | 🔴 **路由 `/products/safety-tires` 不存在，需新建** | 整页 | 施工方 |
| 3 | **`<MechanismSteps>` 是否并入 `<ProcessSteps>` 的 `variant`**（项目已有 `ProcessSteps` 4 页用） | ④ 实现 | 施工方（**先 grep 现有规格**） |
| 4 | **`<NeedBlock>` 是否并入 `<SelfIdentifyBlock>`**（形态同构） | ③ 实现 | 施工方（**复用优先律**） |
| 5 | ⚠️ **⑨ 段不渲染 vs `index.md` §4 全局纪律 #1「每页必须有询盘入口」的冲突** —— 归属未定时如何处置 | ⑨ | **需求方拍板** |
| 6 | **`attribution.resolved` 开关的位置**（content 层 vs 页面层） | 全页 | 技术 |
| 7 | **④ 段图片的 alt 文案 + 「示意图」标注口径** | ④ 视觉 | 内容 + 合规 |
| 8 | ⑤ 段主语改写（路径 B 版）的文案 | ⑤ | 内容 |

### 6.3 预留位（设计文档 §7.3 —— **全部不渲染空模块**）

| 预留位 | 位置 | 升级条件 |
|---|---|---|
| 产品规格表 | ⑥ 之后（启用 ⑤b） | 有轮胎规格 / 花纹型号清单（#4） |
| 质保与渠道卡 | ⑦ 之内 | 归属确认（#1 / #2） |
| 原理示意图组 | ④ 之内 | 图片可公开（#5） |

### 6.4 ★ 上线判断（设计文档 §7.2）

**③④⑥ 是峰徊自有的完整内容，②⑧ 是通用结构 → 即使「洛克不能用」，本页仍有 5 段可上线。**

**⚠️ 但这不改变上线结论** —— `README.md` §2.8 的「未确认前此页不上线」仍然有效，因为：
- ① 的 CTA 与 ⑨ 无法定稿
- ⑦ FAQ#6（客户必问）无法回答
- ⑤ 段的写法二义

**→ 建议施工顺序**：**先回答 §6.1 #1，再决定走 §5 的 A 还是 B。**
其余缺口可在路径确定后并行补。
**（若必须上线：只能走路径 B 的「品类页」形态，且 ⑤ 段主语改写 + ⑨ 段去掉质保语境。）**

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 八段式（Hero / 定义 / 痛点 / 原理 / 能力 / 参数 / FAQ / 路由+CTA） | `safety-tires-page.md` §4 |
| **③ 痛点段合并「对号入座」**（偏离九段式模板） | 同上 §4（模板偏离说明） |
| ④ 四步原理 = 本页最安全的一段 | 同上 §4④ + §7.2 |
| ⑥ 4 项参数全自有（峰徊 P19）+ GB/T 38510 + 3mm/8mm | 同上 §4⑥ |
| **⑦ FAQ#6 是必答题，归属确认前空着** | 同上 §4⑦ |
| **⑨ CTA 完全依赖归属，确认前不写具体文案** | 同上 §4⑨ |
| **逐段归属标记（✅ / ⚠️ / ❌）** | 同上 §0 + §2 归属总览 |
| **两条实现路径 A 品牌方 / B 合作方** | 同上 §5 ★ 本文件最有价值的产出 |
| 三处特别危险项（70% 车祸 / 伤亡率 100% / 0.05 s） | 同上 §2.3 🔴 |
| 「扎不破」属绝对化用语风险区 | 同上 §3 纪律 2 |
| 认证照抄「按适用型号和目的国确认」 | 同上 §3 纪律 3 + §4⑥ |
| 品控比国标更高一级 = 洛克口径（用 3mm/8mm 代替） | 同上 §4⑥ |
| 与 `/capabilities` 的验证边界（压钉 vs 泄漏检测） | 同上 §8 |
| 型号/规格留空 → 8 段 | 同上 §4 开头 + `README.md` §3.1 上架门槛 |
| 预留位不渲染空模块 | 同上 §7.3（用户 2026-10-01 定案 B） |
| 未确认前此页不上线 | `README.md` §2.8 + `safety-tires-page.md` §0 |
| `<ParamTable>` / `<CapabilityGrid>` / `<FaqAccordion>` 归属 | `../../index.md` §2 组件复用矩阵 |
| `<FaqAccordion>` `<RouteBlock>` `<DataNotice>` 命名与优先级 | `../index.md` §2.1 |
| 「过程/机制」首选 mermaid 围栏（档 A/B） | `safety-tires-page.md` §4④ 引 `content-design-and-new-pages.md` §1.3 |
| `SpecPair` `FlowStep` `PositioningPoint` 等类型 | `src/content/types.ts`（`SpecPair:83` / `FlowStep:163` / `PositioningPoint:157`） |
| 设计 token / 按钮类 / fail-visible | `../_components.md` §1 |
| 图片资产真相（9 张 tire-* 全部 `public:false`） | `../_components.md` §5 |
