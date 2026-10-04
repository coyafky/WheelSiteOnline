# `/products/ev-components` 页面规格（新能源三电壳体 —— 能力页）

> **路由**：`/products/ev-components`（⚠️ **路由尚不存在，需新建**）
> **目标文件**：`src/app/products/ev-components/page.tsx`
> **渲染**：静态（零客户端交互；本页无筛选器、无表单、无图表库）
> **数据**：**需新建** `src/content/ev-components.ts`（`AnswerBlock` + `PartGroup[]` + `Capability[]` + `FaqEntry[]` + `RouteStep[]`）
> **设计依据**：`../../ARCHITECTURE/page-architecture/ev-components-page.md`（**八段式 + 完整证据链，本规格只翻译成施工口径，不改设计**）

---

## 0. 一句话

**这不是「产品目录页」，是「能力 + 质量」页** —— 受众是**整车厂 / Tier1 的采购与工程师**，
不是经销商。**全站唯一一页「越像工程文档越好」。**

**🔴 两条施工级纪律**（来自设计文档 §1）：
1. **CTA 不是「获取报价」，是「提交图纸进入工程评估」** —— 报价在三电线过早。
2. **⑤ 规格段留空**（无型号数据）—— 按用户 2026-10-01 定案 B「能力页 + 预留产品位」，
   **预留位不渲染空模块**（`index.md` §3 骨架表已定为 **8 段**）。

**🔴 结构判定**：本页在 `index.md` §2 组件矩阵里是「三条能力线」之一 →
**`<PartGroupCards>` / `<BoundaryTable>` / `<ProcessDiagram>` / `<ParamTable>` / `<FaqAccordion>` 是这批页的共用新建件**。
本页用到其中 **`<PartGroupCards>`**（另两份规格各用到 `BoundaryTable` / `ProcessDiagram` / `ParamTable`）。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §13 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/products/ev-components/page.tsx` 实测 **8 个 `<section>`**（2026-10-02）。

> 审计原文：`PageHero` → ② Definition（3 卡）→ ③ `#capable-parts`（`PartGroupCards`）→ ④ audience（`SelfIdentifyBlock`）→ ⑤ capability（`CapabilityGrid`）→ ⑥ `QualityEvidence` → ⑦ FAQ + `DataNotice` → ⑧ `RouteBlock` → ⑧b `#engineering-eval` CTA。 规格要求八段（`PAGE-SPECS/products/ev-components.md` §1）。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这条线是什么？ | ① `PageHero` | `evHero` | 深色径向橙光 | 主 CTA | 无 | ✅ 合规 |
| **02** | 三电壳体指哪些件？ | ② Definition | `evDefinition` + 3 编号卡 | 左文 + 3 列卡 | 无 | 无 | ✅ 合规 |
| **03** | 能做哪些具体零件？ | ③ `#capable-parts` | `Fifteen part types` + `PartGroupCards` | 分组卡 | 无 | 无 | ✅ 合规 |
| **04** | 这页是给我看的吗？ | ④ audience | `Whether this page is for you` + `SelfIdentifyBlock` | 正负筛选块 | 无 | 无 | ✅ 合规 |
| **05** | 你们有哪些能力？ | ⑤ capability | `evCapabilities` 5 项 | `CapabilityGrid` 3 列 | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **06** | 怎么检验的？ | ⑥ `QualityEvidence` | `evQuality.rows` + disclosure | 3 行证据表 | 无 | 无 | ⚠️ **拥挤**（见 B-1，与 05 相邻） |
| **07** | 常见问题？ | ⑦ FAQ + `DataNotice` | `evFaqs` + `evFaqNotice` | 手风琴 | 无 | 无 | ✅ 合规 |
| **08** | 接下来去哪？ | ⑧ `RouteBlock` | `evRoutes` 3 出口 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除**（见 B-2） |
| **09** | 怎么给你们图纸？ | ⑧b `#engineering-eval` | `evCta` | `forge-soft` 橙底 | `evCta.primary` | `evCta.secondary` | ✅ 合规 |

**判定统计**：✅ 6 ｜ ⚠️ 拥挤 2 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 1

### 0.5.3 审计给出的处置

| # | 判定 | 审计发现（原文标题） |
|---|---|---|
| B-1 | ⚠️ | 视口 05（⑤ capability）与 06（⑥ QualityEvidence）：能力与质检被拆成两屏 |
| B-2 | 🗑️ | 视口 08（⑧ RouteBlock）：答案是重复的 |

> 逐条理由与建议见 `_viewport-audit.md` §13 的 B 小节 —— **本文件不复制理由，只登记落点**。

### 0.5.4 高度预算与询盘整屏

| 项 | 要求 |
|---|---|
| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |
| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** （`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |
| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |

---

<!-- ASSET-REALIGNMENT-2026-10-02 -->
## 0.6 ★ 真实图片资产重排（2026-10-02）

| 视口 | 图片资产 | 模块用途 |
|---|---|---|
| Hero | `/images/ev-components/hero.webp` | EV 壳体产品线入口，建立「按图纸开发」语境 |
| 零件说明 | `/images/ev-components/ev-component.webp`、`housing-interfaces.webp` | 说明壳体、接口和装配关系 |
| 制造证据 | `/images/ev-components/housing-welded.webp`、`production.webp` | 说明焊接/生产场景，不扩写未确认参数 |

**处置**：Hero 使用真实 EV 素材；产品分组优先采用「壳体类型 / 接口 / 工艺证据」三类内容，不再使用轮毂图或通用占位图填充 EV 页面。

## 1. 页面骨架（八段式）

| 序 | 内容块 | 必须性 | 说明什么 | 就绪度 |
|---|---|---|---|---|
| ① | Hero（深色） | 必须有 | 定位：聚焦电机与电控系统的铝合金壳体 | ✅ |
| ② | 这条线是什么（定义） | 必须有 | 三电壳体指哪些件 + **为什么难做**（散热·密封·精度） | ⚠️ |
| ③ | **可承接零件清单 ★** | 必须有 | **17 个零件名** / 3 组卡 —— **本页差异化段** | ✅ |
| ④ | 给谁用 / 对号入座 | 必须有 | 反向筛选（错配成本极高） | ✅ |
| ⑤ | 我们能做什么（能力） | 必须有 | LPDC / HPDC / FSW + 工程前置 | ⚠️ |
| ⑥ | **质量与检测 ★** | 必须有 | 尺寸与泄漏检测 + 全流程控制 | ⚠️ |
| ~~⑤b~~ | ~~型号 / 规格~~ | **留空** | ❌ **无数据 → 不渲染**（预留位，见 §6） | — |
| ⑦ | 常见问题 FAQ | 必须有 | 4–6 条，**工程口径** | ❌ |
| ⑧ | 路由 + 工程评估 CTA ★ | 必须有 | → `/capabilities` `/custom-development` `/contact` | ✅ |

**⚠️ 兑现上架门槛**（`README.md` §3.1）：本线 ⑤ 型号/规格留空 → **9 段模板实际落成 8 段**。

```
/products/ev-components
├── ① <HeroDark>                    eyebrow EV POWERTRAIN · H1 + 副标 + 主 CTA
├── ② <AnswerBlock>                 定义三段（60/30/10，数据配比降到 ~0）
├── ③ <PartGroupCards>  ★★           → <PartGroupCard> × 3（电驱 / 电控 / 电池系统）
│      └── 通用件 2 项                ★ 并入 ③ 段尾的 <BoundaryNote>（不单独成卡 → 见 §2③）
├── ④ <SelfIdentifyBlock>           反向筛选（对号入座）
├── ⑤ <CapabilityGrid>              五能力块（复刻 dealers ⑤ 同形态）
├── ⑥ <QualityEvidence>             ← /capabilities 规划件，本页只取「三行证据表」形态
├── ⑦ <FaqAccordion>  ★             4–6 条（**5 条待确认，见 §2⑦**）
├── ⑧ <RouteBlock>                  三出口（T7）
│      └── <EngineeringEvalCta>     ★ 本页专属收尾（**不是 <DealerCta>**，见 §2⑧）
└──    <DataNotice>                 （并入 ⑧ 段底部，不单独成段）
```

**⚠️ 与 `index.md` §3 的差异**：`index.md` 给三条能力线统一套 `<DealerCta>` 收尾。
**本页例外** —— CTA 语义是「工程评估」不是「询盘」，见 §2⑧。

---

## 2. 逐块规格

### ① Hero（深色）

| 项 | 内容 |
|---|---|
| 结构 | `.eyebrow` + `<h1>` + 副标（英文） + 一句零件列举 + 主 CTA |
| eyebrow | `EV POWERTRAIN` |
| H1 | **新能源三电壳体** / EV Powertrain Housings |
| 副标 | **聚焦电机与电控系统的铝合金壳体** · Aluminum Housings for EV Motor & Controller Systems |
| 零件句 | 水冷电机壳 · 高压压铸电机壳 · 电控箱/逆变器壳体 |
| 主 CTA | **提交图纸，进入工程评估** → `/contact`（`className="btn-pill-solid"`） |
| 容器 | `.container-fh`（1180） |
| 深色底 | `--color-ink`（`globals.css` `@theme`） |
| 背景图 | ⚠️ **无图** —— `public/images/` 只有 `.gitkeep`；`assets/preview-media/ev.webp` 存在但**代码零引用**。走**深色纯底版式**，不请求图片（同 `<ProcessExplorer>` 的媒体区纪律） |

**禁止项**：
- ❌ 本段**不得**出现「获取报价」/「价格」/「便宜」
- ❌ 不得用轮毂的产能数字（1349 型号 / 3485 配置）充门面 —— 客户群不同（设计文档 §0）

```ts
// 复用形态：无现成深色 Hero 组件（<HomeHero> 只服务 `/`）
// → 用原生 <section className="bg-ink text-white"> + 工具类，不为此建组件（同 wheels ① 的处理）
```

**就绪度**：✅ 文案齐（峰徊 P1/2/4/12）；⚠️ 主图需授权（17 条 registry 全部 `public:false`，见 §6）

---

### ② 这条线是什么（定义段）

| 项 | 内容 |
|---|---|
| 结构 | 3 小节：**是哪些件** / **为什么难做** / **我们的落点** |
| 组件 | **`<AnswerBlock>`**（`types.ts:123`，**形状正好吻合**：eyebrow + heading + body + points） |
| 配比 | 60% 做什么 / 30% 与什么不同 / **10% 数据 → 降到 ~0**（无本线可公开数字） |

**三段口径**（照设计文档 §4②，**不改写**）：

| 小节 | 内容 |
|---|---|
| 1. 是哪些件 | 电驱（电机 / 减速器）· 电控（逆变器 / PDU / OBC）· 电池（箱体 / 端板 / 水冷板） |
| 2. 为什么难做 | **散热（水道）· 密封（气密水密）· 精度（装配面）** ← ★ 三个词是后面全部内容的骨架 |
| 3. 我们的落点 | 低压铸造（水冷电机壳）+ 高压压铸（高压压铸电机壳）+ 摩擦焊/FSW（水道与箱体密封） |

**props 契约**：

```ts
// 复用已有类型 src/content/types.ts:123
type AnswerBlock = {
  eyebrow: string;    // "这条线是什么"
  heading: string;    // "散热、密封、精度 —— 壳体类件的三个难点"
  body: string;       // 「是哪些件」+「与标准件目录的不同」
  points: string[];   // ★ 三条难点逐条列出，供 AI 抽取
};
```

**禁止项**：
- ❌ **不得编造尺寸包络** —— 「编一个尺寸范围比留白更糟」（设计文档 §4②）
- ❌ 不得出现 IATF 16949（**唯一来源是航鹏，第三方**，见 §2⑥）
- ❌ 不得出现 6061 / 镁合金「一体锻造成形」（**轮毂语境**，原文限定 "wheel programs"）

**就绪度**：⚠️ 部分 —— 定性能写（三难点有语料），**定量全缺**（缺口 1：尺寸/重量范围）

---

### ③ ★★ 可承接零件清单（本页差异化段）

**⚠️ 这是「可承接零件类型」，不是「在售型号」** —— 性质与轮毂 1018 型号完全不同。

| 项 | 规格 |
|---|---|
| 结构 | **3 张卡**，每卡：组名 + 零件（中/英）+ **一句「这组的难点是什么」** |
| 组件 | **`<PartGroupCards>`**（**需新建 ★ 三条能力线共用件**）→ 内含 `<PartGroupCard>` |
| 栅格 | ≥1024 → **3 列等高**；768 → 2 列；390 → 1 列 |
| 锚点 | `id="capable-parts"` |

**三组内容**（**17 项**，逐条已核实 —— 电驱 5 + 电控 6 + 电池系统 4 + 通用 2）：

| 卡 | 组名 | 零件（中 / 英） | 数量 |
|---|---|---|---|
| 1 | **电驱壳体** | 水冷电机壳 / 高压压铸电机壳 / 油冷电机壳体 / 定子总成壳体 / 减速器壳体 | 5 |
| 2 | **电控壳体** | 电控箱·逆变器壳体 / 逆变器 / PDU 配电单元 / OBC 车载充电机 / 水泵壳体 / 阀块与接头 | 6 |
| 3 | **电池系统** | 电池箱体 / 电池端板 / 水冷板 / 模组支架 | 4 |
| （尾） | **通用件** | 端盖 / 支架 | **2** ← ⚠️ **见下** |

**🔴 施工决策：通用件 2 项不单独成第 4 张卡，而是 ③ 段尾部的 `<BoundaryNote>` 一行**。
**理由**：① 只有 2 项，成卡会破坏「3 列等高」；② 这两项**与 `/products/custom-aluminum` ⑥ 典型件重叠**
（端盖 / 支架在两个设计文档里都被引用，`custom-aluminum-page.md` §3.1「动力与传动」组）→
**本页只列名 + 指向铝制品页**，避免两页各写一份。

**✅ 数量已核实（2026-10-01）**：逐条清点为 **17 项**，
**不是 20 项**（此前口头报数有误）。
口径 = 电驱 5 ｜ 电控 6 ｜ 电池系统 4 ｜ 通用 2。
分三张卡呈现时，**「通用 2 项」（端盖 / 支架）并入「电驱」卡**，
或作为卡片底部的补充行 —— ⚠️ 不要为 2 项单独开一张卡。

**props 契约**：

```ts
// src/components/part-group-cards.tsx（★ 需新建）
type PartGroup = {
  slug: "powertrain" | "controller" | "battery";
  name: string;          // "电驱壳体"
  nameEn: string;        // "Motor & Reducer Housings"
  /** ★ 这组的难点是什么 —— 每卡必有，不许空 */
  difficulty: string;    // "螺旋水道一体成形 + 接口面密封"
  parts: {
    name: string;        // "水冷电机壳"
    nameEn: string;      // "Water-cooled motor housing"
    /** 工艺归属（可选）：LPDC / HPDC / — */
    process?: string;
  }[];
};

type PartGroupCardsProps = {
  groups: PartGroup[];          // ★ 固定 3 条
  /** ★ 卡下统一边界句 —— 必填，组件层强约束 */
  boundaryNote: string;         // "以上为可承接零件类型，具体规格按图纸评估"
  /** 通用件尾注（端盖 / 支架）→ 指向铝制品页 */
  genericNote?: { text: string; href: string };
  className?: string;
};
```

**🔴 交互纪律 / 硬规则**：
1. **每张卡必须带边界句** —— `boundaryNote` 是 **props 必填**（TS 层不给默认值）：
   > 「以上为**可承接零件类型**，具体规格按图纸评估」
   **不加这一句，客户会以为我们在卖标准件** —— 设计文档点名这是本页最容易犯的错。
2. **零件名双语并列** —— 中为主、英为辅（`font-display` 小号灰字）。
3. **无 href** —— 零件名**不可点击**（没有单品页，做成链接 = 404）。

**禁止项**：
- ❌ 不得做成「产品网格 + 卡片图」（**无图，且这不是产品目录**）
- ❌ 不得加数量徽标、价格、MOQ、交期
- ❌ 不得把 17 项平铺成一长串

**就绪度**：✅ **语料齐（峰徊 P4/P12/P14，全部自有口径）** —— 本页最就绪的一段

---

### ④ 给谁用 / 对号入座

| 项 | 规格 |
|---|---|
| 结构 | **反向筛选框** 在上 + **三条「符合则继续」** 在下 |
| 组件 | **`<SelfIdentifyBlock>`**（`index.md` §2 已列 dealer 页规划件 → **与 `/dealers` ③ 共用同一组件**） |
| 数据 | `PositioningPoint[]`（`types.ts:157`，**已定义**：`{ title, body }`） |

**文案口径**（照设计文档 §4④）：

```
你的情况                      → 我们能不能帮
❌ 你要找标准件目录的采购        → 这页不适合你。我们做的是按图纸开发的三电壳体。
✅ 你有图纸 / 3D 数据 / 实物样件  → 继续往下看
✅ 你在做电驱或电池包的国产化/二供 → 继续往下看
✅ 你的项目需要 NDA 与 DFM 前置   → 继续往下看
```

**props 契约**：

```ts
// src/components/self-identify-block.tsx（★ 与 /dealers ③ 共用，需先 grep 是否已建）
type PositioningPoint = {           // types.ts:157 复用，不新造
  title: string;                    // "你有一份壳体的图纸 / 3D 数据 / 实物样件"
  body: string;                     // 一句说明
};

type SelfIdentifyBlockProps = {
  negative: { title: string; body: string };   // ★ 反向筛选（本页的关键）
  positiveHeading: string;                     // "如果你符合下面任一情况，继续往下看"
  positives: PositioningPoint[];               // 3 条
  className?: string;
};
```

**🔴 交互纪律**：
- ✅ **反向筛选必须放最前** —— 「三电壳体客户极少，错配成本极高」（一份图纸走完评估才发现做不了，双方都亏）
- ✅ 正向三条**不用图标对勾**，用 `Check`（lucide，已用图标之一）

**禁止项**：
- ❌ 不得写「无论您有什么需求，我们都能满足」式兜底（与反向筛选矛盾）
- ❌ 不得放客户 logo 墙（**缺口 12：无任何主机厂或 Tier1 客户名**）

**就绪度**：✅ 结构可用；⚠️ 缺案例（本条不阻塞，只是少了佐证）

---

### ⑤ 我们能做什么（能力段）

| 项 | 规格 |
|---|---|
| 结构 | **5 张能力卡** + 一句收尾 |
| 组件 | **`<CapabilityGrid>`**（`index.md` §2.1 优先级 #8，**`/dealers` ⑤ 与三条能力线共用**） |
| 栅格 | ≥1024 → 3 列；768 → 2 列；390 → 1 列（5 卡 → 3+2） |
| 收尾句 | ⚠️ **本线无对应原句** —— 铝制品页有（峰徊 P7），**本页不得借用**（那是铝制品语境） |

**5 张卡**（照设计文档 §4⑤）：

| 卡 | 标题 | 内容要点 |
|---|---|---|
| 1 | **成形** | 低压铸造（LPDC）· 高压压铸（HPDC）· 重力铸造 |
| 2 | **连接** | **摩擦焊 / 搅拌摩擦焊（FSW）** —— 服务水道与箱体密封 |
| 3 | **精加工** | CNC 精密加工 · 关键接口精加工 |
| 4 | **工程前置** | 3D 设计 · 有限元分析（FEA）· 铸造模拟 · 逆向工程 |
| 5 | **★ 技术亮点** | **砂芯螺旋水道一体成形** —— 面向驱动电机定子总成壳体 |

**props 契约**：

```ts
// src/components/capability-grid.tsx（★ 需新建）
type Capability = {                 // types.ts:16 复用，不新造
  index: string;                    // "01"…"05"
  title: string;                    // "砂芯螺旋水道一体成形"
  body: string;                     // 要点句
};

type CapabilityGridProps = {
  capabilities: Capability[];       // ★ 5 条
  columns?: 2 | 3;                  // 默认 3
  /** ★ 第 5 卡高亮（技术亮点）—— 用 --color-forge-soft 底 */
  highlightLast?: boolean;
  className?: string;
};
```

**🔴 硬规则**：
1. **技术亮点必须单独成卡且视觉高亮** —— 「它把『我们做壳体』升级成『我们能把螺旋水道一体做出来』，
   这是同行目录里不会写的东西」（设计文档 §2.2）。
2. **不得写**：模具吨位 / 压铸机型号 / 产能节拍 —— **数据不存在**（缺口 5/6）。

**禁止项**：
- ❌ 不得借用铝制品页的收尾句（峰徊 P7「根据尺寸、载荷、重量、成本和项目规模…」是**通用件语境**）
- ❌ 不得出现「万吨锻造机」「锻坯探伤」（**航鹏的轮毂设备**）

**就绪度**：⚠️ 部分 —— 工艺名称齐（峰徊 P6/7/12/13/14），**参数全缺**（缺口 1–6）

---

### ⑥ ★ 质量与检测

| 项 | 规格 |
|---|---|
| 结构 | **证据表 3 行** + 一行体系占位 |
| 组件 | **内联 `<table>`（复用 `<ProcessSteps>` 的行渲染？❌ 否）** → **`<QualityEvidence>`**（`/capabilities` 规划件）|

**⚠️ 施工裁定**：`index.md` §2 把 `<QualityEvidence>` 归给 `/capabilities`。
本页**需要同形态但不同数据** → **复用 `/capabilities` 的 `<QualityEvidence>`，不另起名**
（`_components.md` §1 复用优先律 + `index.md` §2.1「同一形态只做一个组件」）。
**若 `/capabilities` 先施工则直接复用；若本页先施工则提取到 `src/components/quality-evidence.tsx`。**

**3 行证据**（照设计文档 §4⑥）：

| 行 | 内容 | 来源 |
|---|---|---|
| 全流程控制 | 铸件 → 机加 → 清洗 → **尺寸与泄漏检测** | ✅ 峰徊 P13 |
| 内部质量 | 锻坯 X 射线检测 | ⚠️ 峰徊 P9（**原文讲锻坯**，本页引用需核对语境，见 §6 #3） |
| **体系** | **⚠️ 空 —— 不填** | ❌ 无（IATF 唯一来源是航鹏） |

**props 契约**：

```ts
// src/components/quality-evidence.tsx（★ 与 /capabilities 共用件）
type QualityRow = {
  label: string;                 // "全流程控制"
  value: string;                 // "铸件 → 机加 → 清洗 → 尺寸与泄漏检测"
  /** ★ 该行是否已确认。false → 渲染为显式空位，不渲染猜测值 */
  confirmed: boolean;
  /** confirmed=false 时的公开说明（★ 必填） */
  pendingNote?: string;
};

type QualityEvidenceProps = {
  rows: QualityRow[];
  /** ★ 未确认行的统一声明 —— 不允许组件静默隐藏 */
  disclosure: string;            // "本项正在核实，确认后更新"
  className?: string;
};
```

**🔴 硬规则（本段最重要的一条）**：

> **「体系」这一行现在是空的。汽车行业客户一定会问 IATF 16949。
> 在丰怀给出答案之前，本段不写，也不含糊其辞。**（设计文档 §4⑥原文）

**施工口径 = 三选一，但必须显式**：
| 方案 | 条件 | 呈现 |
|---|---|---|
| A. **整行移除** | 上线前确认「未持有」 | 表格只剩 2 行，**不出现任何体系字样** |
| B. **显式待确认行** | 上线前仍未确认 | 第 3 行 label「质量体系」+ value `—` + `pendingNote`「正在核实」 |
| C. **正常填写** | 确认持有并提供证书编号 | 填 IATF 16949 + 编号 |

**🔴 禁止项**：
- ❌ **不得写「按行业标准执行」「符合汽车行业质量要求」等含糊话术** —— 这就是「含糊其辞」
- ❌ 不得出现 `IATF 16949` 五个字（**除非走方案 C 且丰怀书面确认**）
- ❌ 不得出现 SAE J175 / JIS D4103 / ISO 3006 / GB/T 5334 / JWL / TUV（**全部是轮毂标准，航鹏口径**）

**就绪度**：⚠️ **半空** —— 2 行有来源，**体系行阻塞**（缺口 8，🔴 高：客户必问）

---

### ⑦ 常见问题 FAQ（工程口径）

| 项 | 规格 |
|---|---|
| 结构 | 手风琴，**4–6 条** |
| 组件 | **`<FaqAccordion>`**（`index.md` §2.1 优先级 #5，**3 页共用**） |
| 数据 | `FaqEntry[]`（`types.ts:77` 复用） |
| 调性 | **⚠️ 由工程师回答，不用营销腔** —— 与轮毂页 FAQ 不同 |

**6 条题目（照设计文档 §4⑦，可用性照抄）**：

| # | 问题 | 可用性 | 回答要点 |
|---|---|---|---|
| 1 | 你们能做什么材料？ | ❌ **空** | 语料只有轮毂语境 6061/镁合金，本线无牌号清单 |
| 2 | 最大能做多大？ | ❌ **空** | 无尺寸包络 |
| 3 | 公差能到多少？ | ❌ **空** | 只有「关键接口精加工」一句 |
| 4 | 你们有 IATF 16949 吗？ | ❌ **空** | 与 ⑥ 段同源，见 §6 #1 |
| 5 | 要签 NDA 吗？ | ✅ **可答** | 支持签署 NDA（峰徊 P15） |
| 6 | 多久能出样？ | ❌ **空** | 无天数 |

**🔴 施工纪律：宁缺勿滥（设计文档 §7.2 明写）**
- **上线只放第 5 条**（NDA，确定的）
- **第 6 条改写为开放问法**：「打样周期怎么评估？」→ 答「按图纸复杂度评估，请提交需求后获取」
- **其余 4 条不渲染** —— **不留「待更新」占位条目**（违反「不渲染空模块」纪律）

**props 契约**：

```ts
// src/components/faq-accordion.tsx（★ 需新建，3 页共用）
type FaqEntry = { question: string; answer: string };   // types.ts:77 复用

type FaqAccordionProps = {
  entries: FaqEntry[];
  /** ★ 默认展开首条 */
  defaultOpenIndex?: number;
  /** ★ 该条是否已确认；false 的条目在施工期由数据层过滤，不进 DOM */
  // （不给运行时开关 —— 未确认的条目直接在 content 层不导出）
  className?: string;
};
```

**⚠️ 只放 2 条的后果与应对**：页面会显得 FAQ 段很薄。
**→ 应对：⑦ 段末尾加一行 `<DataNotice>`**（不是加假条目）：
「更多工程参数（材料牌号 / 尺寸包络 / 公差）正在核实，确认后补充」

**就绪度**：❌ **6 条里 5 条空** —— **本页最空的一段**（但按 §7.2 可「薄版上线」）

---

### ⑧ 路由 + 工程评估 CTA ★

**⑧a 路由段（T7 三出口）**

| 项 | 规格 |
|---|---|
| 组件 | **`<RouteBlock>`**（`index.md` §2.1 优先级 #2，**8+ 页共用**） |
| 数据 | `RouteStep[]`（`types.ts:105` 复用） |
| 栅格 | `columns={3}` |

```ts
// 三出口（照设计文档 §4⑧）
type RouteStep = {                     // types.ts:105 复用
  step: string; title: string; body: string;
  href: string; linkLabel: string;
};

const routes: RouteStep[] = [
  { step: "01", title: "全厂工艺与设备全景", body: "想看整厂的产线与设备",
    href: "/capabilities", linkLabel: "看能力全景" },
  { step: "02", title: "按图纸/样件走完整开发流程", body: "想看开发流程与合作模式",
    href: "/custom-development", linkLabel: "看开发流程" },
  { step: "03", title: "先聊聊你的项目", body: "只想先沟通需求",
    href: "/contact", linkLabel: "联系我们" },
];
```

**⑧b 工程评估 CTA（★ 本页专属，不是 `<DealerCta>`）**

| 项 | 规格 |
|---|---|
| 组件 | **`<EngineeringEvalCta>`**（**需新建** —— 本页 + `/custom-development` 可能共用，见下） |
| 文案 | **主**：**有图纸或样件？先做一次工程评估。**<br>**副**：支持签署 NDA。图纸、3D 数据或实物样件，都能进入开发流程。 |
| 按钮 | `.btn-pill-solid`「提交图纸，进入工程评估」→ `/contact`　`.btn-pill-outline`「看开发流程」→ `/custom-development` |
| 字数 | **≤80 字**（`index.md` §3 结尾 CTA 纪律） |
| 锚点 | `id="engineering-eval"` |

**🔴 禁止项（三条，全部照设计文档 §1）**：
- ❌ **不出现「报价」「价格」「便宜」** —— 项目制采购价格由图纸决定，提价格显得不专业
- ❌ **不得复用 `<DealerCta>`** —— 那是经销商询盘语义（21 处在用），本页受众不同
- ❌ 不做弹窗 / 不做「立即咨询」浮层

**就绪度**：✅ 文案齐

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 本页用途 | 备注 |
|---|---|---|---|
| — | — | — | ⚠️ **本页可直接复用的已有组件 = 0** |

**⚠️ 说明**：已有 19 个组件里，**没有一个是能力线页的形态**
（`<HomeHero>` 只服务 `/`、`<TrustStrip>` 只服务 `/`、`<ProcessExplorer>` 服务 `/manufacturing`）。
**这与 `/custom-development` 规格的结论一致**（`custom-development.md` §3.1）。

**→ 因此本页的复用全部发生在「同一批新建件」内部**（三条能力线 + `/dealers` + `/capabilities` 共用）。

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 | 优先级 |
|---|---|---|---|---|
| **`<PartGroupCards>`** | `src/components/part-group-cards.tsx` | ③ 零件组卡（3 卡 + 边界句） | **三条能力线** | 🔴 本页核心 |
| （内含 `<PartGroupCard>`） | 同上文件内联 | 单张零件组卡 | — | — |
| **`<FaqAccordion>`** | `src/components/faq-accordion.tsx` | ⑦ 统一 FAQ 手风琴 | **3 页**（`/dealers` · `/dealers/private-label` · 三条能力线） | 🟠 #5 |
| **`<RouteBlock>`** | `src/components/route-block.tsx` | ⑧a T7 三出口 | **8+ 页** | 🔴 #2 |
| **`<DataNotice>`** | `src/components/data-notice.tsx` | ⑦ 尾 + ⑧ 底部数据说明 | **6 页（全部产品页）** | 🔴 #1 |
| **`<SelfIdentifyBlock>`** | `src/components/self-identify-block.tsx` | ④ 对号入座 | **2+ 页**（`/dealers` ③） | 🟠 |
| **`<CapabilityGrid>`** | `src/components/capability-grid.tsx` | ⑤ 五能力卡 | **2+ 页** | 🟠 #8 |
| **`<QualityEvidence>`** | `src/components/quality-evidence.tsx` | ⑥ 证据表（**与 `/capabilities` 共用**） | 2 页 | 🟠 |
| **`<EngineeringEvalCta>`** | `src/components/engineering-eval-cta.tsx` | ⑧b 工程评估收尾 | **2 页**（本页 + `/custom-development` 可共用） | 🟠 |

**★ 三个强制提取**（不能写在页面文件里）：
1. **`<PartGroupCards>`** —— 三条能力线共用形态（本页用 `groups` 语义；
   `custom-aluminum` 的「典型件」组、`safety-tires` 的「品类说明」组可复用同一组件或同族）
2. **`<RouteBlock>`** —— 8+ 页共用（`index.md` §2.1 实测）
3. **`<DataNotice>`** —— 6 页共用，优先级最高，且是实现顺序第一名

**⚠️ 命名纪律核对**（`index.md` §2.1）：`FaqAccordion` / `RouteBlock` / `ProcessSteps` / `DataNotice` /
`StatStrip` / `CapabilityGrid` **六个公共名已全站统一，不得起别名**。
本页**新增** 3 个名字：`PartGroupCards`（`index.md` §2 已登记 ✓）、
`SelfIdentifyBlock`（`index.md` §2 dealer 页已登记 ✓）、`EngineeringEvalCta`（**本规格首次提出** —— 建议先 grep 是否有同形态件；
若无，则**优先复用 `<DealerCta>` 的 chrome 换文案**，见 §6 阻塞 #4）。

---

## 4. 数据契约

### 4.1 类型（全部复用 `src/content/types.ts` 已有类型，**不新造结构**）

```ts
// src/content/ev-components.ts —— ★ 需新建（模块名未注册，见 §6 阻塞 #3）
import type {
  AnswerBlock,        // types.ts:123 —— ② 段
  Capability,         // types.ts:16  —— ⑤ 段
  FaqEntry,           // types.ts:77  —— ⑦ 段
  RouteStep,          // types.ts:105 —— ⑧a 段
  PositioningPoint,   // types.ts:157 —— ④ 段
} from "./types";

// ★ 本页唯一的新类型（③ 段）
export type PartGroup = {
  slug: "powertrain" | "controller" | "battery";
  name: string;          // "电驱壳体"
  nameEn: string;        // "Motor & Reducer Housings"
  difficulty: string;    // ★ 这组的难点
  parts: { name: string; nameEn: string; process?: string }[];
};

export const evHero = { eyebrow, heading, subheading, partsLine, ctaLabel } as const;
export const evDefinition: AnswerBlock = { /* ② */ };
export const partGroups: PartGroup[] = [ /* ③ —— ★ 清点 = 17 项 */ ];
export const partGroupBoundary = "以上为可承接零件类型，具体规格按图纸评估。";
export const evAudience = { negative, positiveHeading, positives: PositioningPoint[] };
export const evCapabilities: Capability[] = [ /* ⑤ —— 5 条 */ ];
export const evQuality: { rows: QualityRow[]; disclosure: string } = { /* ⑥ */ };
export const evFaqs: FaqEntry[] = [ /* ⑦ —— ★ 上线只导出 2 条 */ ];
export const evRoutes: RouteStep[] = [ /* ⑧a —— 3 条 */ ];
export const evCta = { title, body, primary, secondary } as const;   // ⑧b
```

### 4.2 字段来源与缺口

| 段 | 字段 | 来源 | 缺口 |
|---|---|---|---|
| ① | H1 / 副标 / 零件句 | ✅ 峰徊 P1/2/4/12 | 主图授权 |
| ② | 三段 | ⚠️ 定性 ✅ / 定量 ❌ | **缺口 1**（尺寸/重量） |
| ③ | 17 项零件 + 3 组难点 | ✅ 峰徊 P4/12/14 | 无 —— **最就绪** |
| ④ | 反向筛选 + 3 正条 | ✅ 业务归纳 | 缺口 12（客户案例） |
| ⑤ | 5 能力块 | ⚠️ 工艺名 ✅ / 参数 ❌ | **缺口 1–6**（材料/尺寸/公差/壁厚/设备/产能） |
| ⑥ | 3 行证据 | ⚠️ 2 行 ✅ / 体系 ❌ | **缺口 8（🔴 客户必问）** + 缺口 9 |
| ⑦ | 6 条 FAQ | ❌ 5 条空 | 缺口 1/2/3/7/8 |
| ⑧ | 3 出口 + CTA 文案 | ✅ | 无 |

### 4.3 ★ 图片从哪来（**施工前置**）

| 段 | 需要图？ | 现状 | 搬运步骤 |
|---|---|---|---|
| ① Hero | 想要 | ❌ `public/images/` 只有 `.gitkeep` | `assets/preview-media/ev.webp` → `public/images/products/ev/hero.webp`（**目录不存在，需 mkdir**） |
| ②③⑤⑥ | 不请求图 | ✅ 纯文字/表格 | — |
| 全页 | — | ⚠️ registry 里 `07-ev-components` **17 条全部 `public:false` / `draft`** | **须逐条核实 publicationStatus 后才能搬** |

**🔴 施工纪律**：**图片未接入前，① 段走深色纯底版式**（不请求不存在的文件，避免 404 与控制台报错）。

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180）—— **文本/证据页不用宽容器**（同 `/custom-development`） |
| ① Hero | 深色 `--color-ink`，全宽出血底 + `.container-fh` 内容 |
| ③ 三卡 | ≥1024 → 3 列 `items-stretch` 等高；768 → 2 列（**第 3 卡跨满或落单，需专门测**）；390 → 1 列 |
| ④ 对号入座 | 桌面左右双栏（反向框 | 正向三条）；390 → 纵向 |
| ⑤ 五卡 | ≥1024 → 3 列（3+2 留空位，**不留灰块**）；768 → 2 列；390 → 1 列 |
| ⑥ 证据表 | 桌面两列表格；**390 → 转卡片，绝不横向滚动**（同单品页规格表纪律） |
| ⑦ FAQ | 全宽手风琴，最大宽 `720px` 居中（长文本可读性） |
| ⑧ 路由 + CTA | 三卡同行 → 390 纵向；CTA 居中，双按钮（solid + outline） |
| **深色段** | **仅 ① Hero** —— 本页是工程文档调性，大面积深色会显得像营销页 |
| 动效 | ③④⑤ 用 `[data-reveal-group]`（`--motion-stagger-step` 80ms 错峰）；**上限 12 项** |
| 🔴 fail-visible | 组件内**不得**自加 `opacity-0`（`_components.md` §1.5：仅 `html[data-motion-armed]` 下隐藏） |
| 断点 | **768 必测**（三卡 + 五卡两处都是 2 列，最易出现等高断裂） |
| 锚点 | `#capable-parts` / `#engineering-eval` 需 `scroll-margin-top` 留出固定头部高度 |
| 图标 | 仅 `lucide-react`（已用图标）+ **无图表库** |

---

## 6. 待补与阻塞

### 6.1 数据缺口（设计文档 §5，施工侧排序）

| # | 缺口 | 阻塞哪段 | 严重度 |
|---|---|---|---|
| 1 | 尺寸与重量范围（单件尺寸/包络/单重） | ② ⑤ ⑦#2 | 🔴 |
| 2 | 材料牌号（ADC12 / A356 / AlSi10Mg…） | ⑤ ⑦#1 | 🔴 |
| 3 | 公差与表面粗糙度 | ⑤ ⑥ ⑦#3 | 🔴 |
| 8 | **本线专属质量体系（IATF 16949 / PPAP / APQP）** | **⑥ ⑦#4 · 全页可信度** | 🔴 **最高** |
| 5 | 设备吨位与机型 | ⑤ ⑦ | 🟡 |
| 6 | 产能 / 节拍 / 年产量 | ⑤ | 🟡 |
| 7 | MOQ 与交期 | ⑦ | 🟡 |
| 9 | 本线专属测试（气密压力/泄漏率/CT） | ⑥ | 🟡 |
| 10 | FSW 焊缝验收标准（气密判据） | ⑤ | 🟡 |
| 12 | 客户 / 装车案例 | ④ | 🟡 |
| 4 | 壁厚与轻量化指标 | ⑤ | 🟡 |
| 11 | 散热性能参数 | ③ ⑤ | 🟢（可留白） |
| 13 | 表面处理选项 | ⑤ | 🟢 |
| 14 | 本线质保条款 | ⑦ | 🟢 |

### 6.2 施工阻塞（本规格新增）

| # | 事项 | 阻塞 | 归属 |
|---|---|---|---|
| 1 | 🔴 **路由 `/products/ev-components` 不存在，需新建** | 整页 | 施工方 |
| 2 | ~~③ 段零件数核对~~ ✅ **已结**：核实为 **17 项**（电驱 5 / 电控 6 / 电池 4 / 通用 2） | ③ | — |
| 3 | **content 模块命名**：`src/content/ev-components.ts`（建议）—— 是否与后续 WordPress 源冲突 | 数据层 | 施工方 + 技术 |
| 4 | **`<EngineeringEvalCta>` 是否真需新建，还是复用 `<DealerCta>` 换文案** | ⑧b | 施工方（**先 grep 同形态件**） |
| 5 | **⑥ 段「体系」行走 A（移除）/ B（显式待确认）/ C（填写）哪种** | ⑥ | **丰怀 + 技术**（见 §2⑥） |
| 6 | ⑦ 段 FAQ 上线条目数（设计文档建议只放 2 条） | ⑦ | 内容 |
| 7 | `assets/preview-media/ev.webp` → `public/` 的搬运 + 授权 | ① 视觉 | 施工 + 法务 |
| 8 | `<SelfIdentifyBlock>` 是否已被 `/dealers` 规格建立（提取顺序） | ④ 实现 | 施工方 |
| 9 | ⑥ 段「锻坯 X 射线检测」在**壳体语境**是否成立（原文讲锻坯） | ⑥ | 丰怀工程（**见 §6.3 #3**） |

### 6.3 待确认（设计文档 §6，归施工影响排序）

| # | 事项 | 阻塞 | 谁回答 |
|---|---|---|---|
| 1 | 🔴 **峰徊是否持有 IATF 16949？证书编号？** | ⑥ · ⑦#4 · **全页可信度** | 丰怀 |
| 2 | 可承接尺寸包络（最大/最小件） | ② ⑤ | 丰怀工程 |
| 3 | 材料牌号清单 | ⑤ ⑦#1 | 丰怀工程 |
| 4 | 公差能力（可达 ±？mm） | ⑤ ⑥ | 丰怀工程 |
| 5 | 压铸机吨位 / CNC 规格 | ⑤ | 丰怀 |
| 6 | 本线产能 / 交期 / MOQ | ⑤ ⑦ | 丰怀 |
| 7 | 可披露客户或装车案例（**脱敏也可**） | ④ | 丰怀 |
| 8 | FSW 焊缝验收标准（气密判据） | ⑤ | 丰怀工程 |
| 9 | 本线产品照片是否可公开（**17 条全部 `public:false`**） | ① 视觉 | 丰怀 + 法务 |
| 10 | 航鹏材料体系是否可用 | ⑤（若可用） | 法务 |

**⚠️ 上线判断**（设计文档 §7.2）：**本页可「薄版上线」** —— ③④⑧⑨ 四段全就绪，
⑤⑥ 写到「工艺 + 检测手段」层，⑦ 只放 2 条。
**但若 #1（IATF）答案是「没有」→ 受众定位需重估**（转「二供 / 二级供应商 / 售后市场电驱件」，
不硬撑 Tier1 口径）。

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 八段式（Hero / 定义 / 零件清单 / 对号入座 / 能力 / 质量 / FAQ / 路由+CTA） | `ev-components-page.md` §4 |
| ③ 零件清单 = 差异化段 + 每卡必带边界句 | 同上 §4③（**本页最容易犯的错**） |
| ⑤ 型号/规格留空 → 8 段 | 同上 §4 开头 + `README.md` §3.1 上架门槛 |
| CTA =「提交图纸进入工程评估」不是「获取报价」 | 同上 §1 第二条纪律 + §4⑨ |
| ⑥「体系」行空着也不含糊其辞 | 同上 §4⑥ + §6 #1 |
| ⑦ FAQ 宁缺勿滥（只放 2 条） | 同上 §7.2 |
| 反向筛选（错配成本极高） | 同上 §4④ |
| 散热·密封·精度三词为骨架 | 同上 §4② |
| 不得用航鹏 / 轮毂语境内容 | 同上 §3.1 §3.2 |
| 预留产品位不渲染空模块 | 同上 §7.3（用户 2026-10-01 定案 B） |
| 与 `/capabilities` 边界（需求导向 vs 资产导向） | 同上 §8 |
| 与 `/custom-development` 边界（本页不内嵌表单） | 同上 §8 + `custom-development.md` §1.1 |
| `<PartGroupCards>` / `<BoundaryTable>` / `<ProcessDiagram>` / `<ParamTable>` / `<FaqAccordion>` 归属 | `../../../PAGE-SPECS/index.md` §2 组件复用矩阵 |
| `<FaqAccordion>` `<RouteBlock>` `<DataNotice>` 命名与优先级 | `../index.md` §2.1 |
| 结尾 CTA ≤80 字 | `content-design-and-new-pages.md` §1.3 |
| 设计 token / 按钮类 / fail-visible | `../_components.md` §1 |
| 图片资产真相（`public/images/` 零图） | `../_components.md` §5 |
