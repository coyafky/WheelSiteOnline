# `/custom-development` 页面规格（定制开发 · 合作模式）

> **路由**：`/custom-development`（⚠️ **路由尚不存在，需新建**）
> **目标文件**：`src/app/custom-development/page.tsx`
> **渲染**：静态（无客户端交互；流程条为纯展示）
> **数据**：**需新建** `src/content/custom-development.ts`（`DealerProgram[]` + `FlowStep[]`）
> **设计依据**：`../ARCHITECTURE/page-architecture/README.md` §2.10b
> **重叠裁定**：`../ARCHITECTURE/page-architecture/custom-aluminum-page.md` **§8**

---

## 0. 一句话

**这一页回答「能不能按我的品牌做？流程和门槛是什么？」** ——
读者是**贴牌客户 / OEM 项目客户**，不是经销商（经销商在 `/dealers`）。

**🔴 本页最重要的不是内容，是「分工」** —— 它的第 ③ 段与
`/products/custom-aluminum` 的第 ⑦ 段**天然重叠**。
**`custom-aluminum-page.md` §8 给了「必须二选一做强」的建议**，
本规格**采纳该建议并落成施工规则**（见 §1.1）。

**⚠️ 本页是 5 段式（README §2.10b），是四条能力线里最短的一页** ——
它的价值在于**把「合作模式」讲清楚**，不在于长。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §6 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/custom-development/page.tsx` 实测 **3 个 `<section>`**（2026-10-02）。

> 审计原文：`PageHero` → ② 合作模式 → ③ 开发流程（`FlowStepRow` + `CrossLink`）→ ④ 起订量与周期（表）→ `DealerCta`。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 定制开发是什么？ | ① `PageHero` | `customDevHero` | 深色径向橙光 | `customDevHeroActions.primary`（`:61-64`） | `customDevHeroActions.secondary`（`:65+`） | ✅ 合规 |
| **02** | OEM / ODM / 贴牌怎么选？ | ② `#cooperation-models` | `cooperationModelsCopy` + 三模式卡 | 3 列卡 + 编号 | 无 | 无 | ✅ 合规 |
| **03** | 流程是怎样的？ | ③ `FlowStepRow` + `CrossLink` | 5 步商业口径 + 工程细节交叉链 | 横向步条 | `CrossLink` → 铝制品页 | 无 | ✅ 合规 |
| **04** | 起订量多少？ | ④ `#thresholds` 表 | `mooTerms` 表 + 待确认框 | 4 列表格 | 无 | 无 | ✅ 合规 |
| **05** | 怎么询盘？ | `DealerCta` | `customDevCta` | 橙底 | `Request a quote` | email | ✅ 合规 |

**判定统计**：✅ 5 ｜ ⚠️ 拥挤 0 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 0

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
## 0.6 ★ 真实图片资产重排（2026-10-02）

> 定制开发页采用文字流程为主、实物图片为辅，不把一张产品照误写成完整开发能力证明。

| 内容块 | 可用视觉 | 规则 |
|---|---|---|
| 输入与评估 | `/images/custom-aluminum/hero.webp`、`machined-part.webp` | 服务四条产品线的图纸/样件开发，不限定为轮毂开发 |
| 工程协作 | `/images/capabilities/cad-design.webp`、`fea-analysis.webp` | 只说明工程评审/分析过程，具体能力依对应产品线确认 |

**处置**：本页不新建图片画廊；图片只服务「从输入到评估」的一个问题，商业门槛仍以书面报价和项目数据为准。

## 1. 页面骨架（五段式）

| 序 | 内容块 | 必须性 | 说明什么 |
|---|---|---|---|
| ① | 页头 | 必须有 | 定制开发定位 |
| ② | **合作模式 ★** | 必须有 | OEM / ODM / 贴牌 —— **哪种适合你** |
| ③ | 开发流程 | 必须有 | 需求 → 设计 → 打样 → 验证 → 量产（**合作视角**） |
| ④ | 起订量与周期 | 必须有 | ⚠️ **需丰怀确认** |
| ⑤ | 询盘入口 | 必须有 | — |

```
/custom-development
├── ① <PageHeader>              eyebrow + H1 + 定位句
├── ② <CooperationModelGrid>  ★ → <ModelCard> × 3（OEM / ODM / 贴牌）
├── ③ <FlowStepRow>             5 步横向流程（★ 与首页 ⑥ 共用组件）
│      └── <CrossLink>          ★ 指向铝制品页的「技术流程」
├── ④ <MooLeadTimeTable>        MOQ / 交期 表（⚠️ 全占位）
└── ⑤ <DealerCta>
```

### 1.1 ★ 与 `/products/custom-aluminum` 的分工裁定（**本规格的核心**）

**设计文档原文**（`custom-aluminum-page.md` §8）：

> **⑦ 开发流程 vs `/custom-development`：必须二选一做强**
> - **`/custom-development` 做「合作模式」为主**（OEM / ODM / 贴牌怎么选）
> - **本页 ⑦ 做「技术流程」为主**（图纸怎么变成件，DFM/首件/FAIR 的工程细节）
> - 两页各留一个交叉链接
>
> **⚠️ 若决定合并**，则本页 ⑦ 段降为 3 行摘要 + 指向 `/custom-development`。
> **这是一个待用户拍板的接口问题。**

**→ 本规格采纳第一种（分开、各做强），并按下列规则施工：**

| | **`/custom-development`（本页）** | **`/products/custom-aluminum` ⑦** |
|---|---|---|
| **主线** | **合作模式**（商业口径） | **技术流程**（工程口径） |
| 核心问题 | 「我该选 OEM / ODM / 还是贴牌？」 | 「我的图纸怎么变成件？」 |
| ③ 段内容 | 流程的**商业节点**：谁提供图纸 / 谁出模具费 / 谁拥有模具 / 谁审版 | 流程的**工程节点**：DFM → 模具开发 → 首件 → FAIR → 小批验证 |
| 用词 | MOQ、模具归属、打样费、周期、保密 | 公差、材料牌号、DFM 反馈、首件报告 |
| 篇幅 | 5 步 × 1 句（**商业节点**） | 详细步骤 + 工程细节（**技术节点**） |
| CTA | 「提交询盘」 | 「提交图纸进入工程评估」 |
| 受众 | 贴牌客户 / 采购经理 | 产品工程师 / 技术评估 |

**🔴 三条交叉链接写法（必须都做，少一条就重复）**：

**① 本页 ③ 段末尾 → 指向铝制品页技术流程（「技术细节看这里」）**

```tsx
// 本页 ③ 段末尾
<CrossLink
  eyebrow="技术细节"
  title="工程视角的完整流程"
  body="DFM 反馈、模具开发、首件报告（FAIR）、小批验证的工程细节，见铝制品定制页。"
  href="/products/custom-aluminum#development-flow"
  linkLabel="看技术流程"
/>
```

**② 铝制品页 ⑦ 段末尾 → 指向本页合作模式（「商务条款看这里」）**

```tsx
// /products/custom-aluminum ⑦ 段末尾（该页规格里写）
<CrossLink
  eyebrow="合作模式"
  title="OEM / ODM / 贴牌怎么选"
  body="模具归属、起订量、打样费与交期的商务条款，见定制开发页。"
  href="/custom-development#cooperation-models"
  linkLabel="看合作模式"
/>
```

**③ 两页的锚点 id 必须是稳定契约**（否则链接就断了）：

| 页 | 锚点 id | 指向 |
|---|---|---|
| 本页 ② 段 | `#cooperation-models` | 由铝制品页链接过来 |
| 铝制品页 ⑦ 段 | `#development-flow` | 由本页链接过来 |

**🔴 禁止项（防重复的三条）**：
- ❌ 本页 ③ 段**不得**出现 `DFM` / `FAIR` / `公差` / `材料牌号` 等工程术语
  → 那是铝制品页 ⑦ 的领地
- ❌ 铝制品页 ⑦ 段**不得**出现 `MOQ` 明细 / `模具归属` / `打样费` 商务条款
  → 那是本页的领地
- ❌ 两页**不得**各自写一份「需求 → 设计 → 打样 → 验证 → 量产」的完整五步叙述
  → **同一形态只做一次，第二页只做交叉链接**

**⚠️ 若用户最终选择「合并」路径**：本页 ③ 段降为 **3 行摘要 + 指向铝制品页**，
本规格 §2③ 替换为该摘要。**决策点记在 §6 阻塞 #1。**

---

## 2. 逐块规格

### ① 页头

| 项 | 内容 |
|---|---|
| 结构 | `.eyebrow` + `<h1>` + 一句定位 + 一行受众说明 |
| eyebrow | `CUSTOM DEVELOPMENT` |
| H1 | **定制开发** / Custom Development |
| 定位句 | 「按你的品牌、你的图纸、你的规格开模具」 |
| 受众句 | 「面向贴牌客户与 OEM 项目客户」 |
| ⚠️ | **不得与 `/dealers/private-label` 混淆** —— 贴牌页讲「你的牌子」（品牌授权），本页讲「你的品牌 + 项目」（`custom-aluminum-page.md` §8 边界线表） |
| 容器 | `.container-fh`（1180） |
| 组件 | ⚠️ 无现成组件 → 原生 `<header>`（**不为此建组件**，全站统一处理） |

### ② ★ 合作模式（**本页主体**）

| 项 | 内容 |
|---|---|
| 结构 | 三卡并列（OEM / ODM / 贴牌），每卡：模式名 + 一句定义 + 「适合谁」+ 「你需要提供什么」 |
| 组件 | `<CooperationModelGrid>`（**需新建**）→ 内含 `<ModelCard>` |
| 锚点 | `id="cooperation-models"`（★ 铝制品页链接目标，见 §1.1） |
| 栅格 | ≥1024 → 3 列；768 → 2 列；390 → 1 列 |

**三卡内容口径**（⚠️ 需丰怀确认各模式的真实条款）：

| 模式 | 一句定义 | 适合谁 | 你需要提供 |
|---|---|---|---|
| **OEM** | 按你的图纸与规格生产，打你的品牌 | 有设计能力的品牌方 | 图纸 / 规格 / 数量 |
| **ODM** | 从我们的现成设计里选，改外观/参数打你的品牌 | 想快速上线的品牌方 | 选择 + 定制点 |
| **贴牌** | 从现货型号里选，换你的 logo 与包装 | 有稳定客群的店 | 型号清单 + 数量 |

**⚠️ 术语纪律**：三个词的边界**必须在本页定义清楚** ——
客户对 OEM/ODM 的理解各不相同，**不定义就等于三个空词**。

**🔴 禁止**：把三种模式做成「套餐式」推销（「推荐 ODM」）；
**不排序、不推荐** —— 客户自己判断哪种适合。

### ③ 开发流程（**合作视角**）

| 项 | 内容 |
|---|---|
| 结构 | 5 步横向流程条（数字 + 标题 + 一句 + 可选链接） |
| 步骤 | 需求 → 设计/评审 → 打样 → 验证 → 量产 |
| 组件 | **`<FlowStepRow>`**（**复用** —— 与首页 ⑥ 段**同一个组件**） |
| 数据 | `FlowStep[]`（`content/types.ts:163`，**已定义**） |
| ⚠️ 口径 | **每步只写商业节点**（谁做什么、谁出钱、要多久），不写工程细节 |
| 末尾 | **`<CrossLink>` → `/products/custom-aluminum#development-flow`**（★ 见 §1.1 ①） |

**5 步的商业口径示范**（⚠️ 时间/费用待丰怀确认）：

| 步 | 标题 | 一句话（商业口径，不是工程口径） |
|---|---|---|
| 01 | 需求确认 | 你给图纸或样件，我们确认能不能做、怎么合作 |
| 02 | 设计评审 | 我们反馈可制造性与模具方案，确认规格与数量 |
| 03 | 打样 | 开模并出首件，你确认外观与装配 |
| 04 | 验证 | 首件通过后小批试产，验证一致性 |
| 05 | 量产 | 转入批量生产与交付 |

**🔴 本段与首页 ⑥ 段的关系**：
**同一个 `<FlowStepRow>` 组件，两种数据粒度** ——
首页用 4 步极简（`FlowStep[]`），本页用 5 步带商业说明。
**→ 组件必须支持 `steps: FlowStep[]` 任意长度，不得硬编码步数。**

```ts
// src/components/flow-step-row.tsx（首页 + 本页共用，★ 必须提取）
type FlowStepRowProps = {
  steps: FlowStep[];                 // 4（首页）/ 5（本页），不硬编码
  density?: "compact" | "roomy";     // 首页 compact / 本页 roomy
  columns?: 3 | 4 | 5;               // 或 "auto"
  className?: string;
};
```

### ④ 起订量与周期

| 项 | 内容 |
|---|---|
| 结构 | 表：模式 / 起订量 / 打样周期 / 量产周期 / 模具费归属 |
| 组件 | `<MooLeadTimeTable>`（**需新建** 或内联 `<table>`） |
| ⚠️ 🔴 | **全部数据需丰怀确认**（README §4 待确认项 #3：起订量与交期） |
| 未确认时 | **整段隐藏 + 改用一句话**：「起订量、打样周期与模具费按项目评估，请提交需求后获取」 |

**🔴 三条纪律**：
1. **不得编造 MOQ 数字**（如「500 件起」）—— 这是商业承诺
2. **未确认时不上表格** —— 用兜底句代替，**不留空表**
3. **模具费归属**是 OEM/ODM 客户最关心的一条 —— **有这个信息就一定要写**

### ⑤ 询盘入口

| 元素 | 内容 |
|---|---|
| 组件 | `<DealerCta>`（复用） |
| 目标 | `/request-a-quote`（⚠️ 路由尚不存在） |
| 文案 | **≤ 80 字**，聚焦「品牌 + 图纸 + 数量」三要素 |
| 🔴 | 不做弹窗；不做「立即咨询」浮层（README §3.2 静态入口即可） |

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 本页用途 | 备注 |
|---|---|---|---|
| `<DealerCta>` | `src/components/sections/dealer-cta.tsx` | ⑤ 收尾 | 21 处在用 |

**⚠️ 本页可复用的**已有组件**极少** —— 它是全站最新的两条页之一（另一条是
`/custom-development` 自身在站点地图 §1 里是新页）。
**这正是 §1.1 分工裁定的现实原因：没有现成资产，所以必须与铝制品页共用形态。**

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<FlowStepRow>`** | `src/components/flow-step-row.tsx` | ③ 流程条 | **2 页**（`/` 首页 ⑥ + 本页）★ **必须提取** |
| **`<CooperationModelGrid>`** | `src/components/cooperation-model-grid.tsx` | ② 三模式卡栅格 | 仅本页 |
| **`<ModelCard>`** | 内联于 `cooperation-model-grid.tsx` | 单张模式卡 | 仅本页 |
| **`<CrossLink>`** | `src/components/cross-link.tsx` | ★ **跨页分工链接** | **2 页**（本页 ③ + 铝制品页 ⑦）★ 必须提取 |
| **`<MooLeadTimeTable>`** | **内联 `<table>`** | ④ MOQ / 周期表 | 仅本页（未确认时整段隐藏） |

**★ 两个强制提取**：
1. **`<FlowStepRow>`** —— 首页 ⑥ 段与本页 ③ 段**是同一个形态** →
   **若首页先写了，本页不得复制** → 施工顺序上应**先建组件**。
2. **`<CrossLink>`** —— 本页 ③ 与铝制品页 ⑦ **互指**，两处是同一形态 →
   **必须共用一个组件**（否则两页的链接样式会漂移）。

```ts
// src/components/cross-link.tsx —— 形态参考
type CrossLinkProps = {
  eyebrow: string;      // "技术细节"
  title: string;        // "工程视角的完整流程"
  body: string;         // 为什么去那边看
  href: string;         // 含锚点，如 "/products/custom-aluminum#development-flow"
  linkLabel: string;    // "看技术流程"
  className?: string;
};
```

**⚠️ `<CrossLink>` 与 `<ResourceLink>` 的区别**：
`ResourceLink`（`types.ts:114`）是**同页内的路由卡**（M2 长页尾部路由段）；
`CrossLink` 是**跨页的分工链接**（专门解决本节 §1.1 的重复问题）。
**若判定两者视觉同构 → 复用 `ResourceLink` 的数据形状，只新建渲染组件。**

---

## 4. 数据契约

### 4.1 类型

```ts
// src/content/types.ts —— 已存在，★ 本页两个段直接可用
type FlowStep = { step: string; title: string; body: string };   // ③ 段

type ResourceLink = { eyebrow: string; title: string; body: string;
                      href: string; linkLabel: string };          // <CrossLink> 可复用其形状

type DealerProgram = {                    // ★ ② 段可复用此类型（或派生）
  slug: string;                           // "oem" | "odm" | "private-label"
  name: string;                           // "OEM"
  tagline: string;                        // 一句定义
  body: string;                           // 适合谁 / 提供什么
  points: string[];                       // 「你需要提供」清单
  href: string;
};
```

**🔴 类型选择判定**：
- ② 段三种合作模式**语义上就是 `DealerProgram`**（模式 + 定位 + 要点）
  → **优先复用 `DealerProgram`**，不为本页新造类型；
- 若确认需要「适合谁 / 提供什么」两个独立字段 → 则新建
  `CooperationModel` 并**保留 `DealerProgram` 给 `/dealers`**（两者不再共用）。

### 4.2 数据来源一览（**全部需新建**）

| 段 | 数据模块 | 现状 |
|---|---|---|
| ① | 内联文案 | ❌ 需撰 |
| ② | 建议新建 `content/custom-development.ts` → `cooperationModels: DealerProgram[]` | ❌ 不存在 |
| ③ | 同上模块 → `developmentFlow: FlowStep[]`（5 步） | ❌ 不存在 |
| ④ | 同上模块 → `mooTerms`（⚠️ 待丰怀确认） | ❌ 不存在 |
| ⑤ | `<DealerCta>` 内联 | ✅ |

**⚠️ 建议的模块形状**：

```ts
// src/content/custom-development.ts —— 新建
export const customDevHero = { eyebrow, heading, lede, audience } as const;
export const cooperationModels: DealerProgram[] = [ /* OEM / ODM / 贴牌 */ ];
export const developmentFlow: FlowStep[] = [ /* 01…05，商业口径 */ ];
export const mooTerms: {
  confirmed: boolean;          // ★ false 时整段隐藏、走兜底句
  rows: { model: string; moq: string; toolingDays: string;
          productionDays: string; toolingCost: string }[];
} = { confirmed: false, rows: [] };   // ⚠️ 默认未确认
```

**★ `mooTerms.confirmed` 是本页唯一的「开关字段」** ——
与 `CompanyStat.isPlaceholder` 同思路：**未确认的数据不进 DOM，而不是进了再隐藏**。

### 4.3 ★ 图片从哪来

| 段 | 图片来源 | 搬运 |
|---|---|---|
| ① | 无图 | ✅ |
| ② | 无图（文字卡） | ✅ |
| ③ | 无图（流程条，CSS/SVG 画） | ✅ |
| ④ | 无图（表格） | ✅ |
| ⑤ | 无图 | ✅ |

**🔴 结论：本页是纯文字页，零图片依赖 → 可立即上线**（前提是 ②③④ 文案齐备）。

**⚠️ 唯一例外**：若 ③ 段流程图要配 `assets/site-data/image-registry.json` 里的
`#106 模具开发 / #107 首件 / #108 小批验证` 三张图 —— **它们全部 `public: false`**，
**搬运前必须逐条核实 publicationStatus**（README §4 待确认项 #9）。

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180）—— 文本页不用宽容器 |
| ② 三模式卡 | ≥1024 → 3 列（`items-stretch` 等高）；768 → 2；390 → 1 |
| ③ 流程条 | ≥1024 → 5 列一行（组件 `columns={5}`）；768 → 3+2 或纵向；390 → 纵向连接线 |
| ④ 表格 | 桌面 `<table>`；**移动端转卡片，绝不横向滚动**（与单品页规格表同一纪律） |
| 深色段 | **① 深色 Hero**；其余浅色（本页短，深色只压头尾） |
| 动效 | ②③ 用 `[data-reveal-group]`（80ms 错峰） |
| 🔴 fail-visible | 组件内不得自加 `opacity-0`（仅 `html[data-motion-armed]` 下隐藏） |
| 断点 | 768 **必测**（5 步流程条在平板最易挤爆） |
| 锚点 | `#cooperation-models` / `#development-flow` 两处 **scroll-margin-top 需留出固定头部高度** |

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 归属 |
|---|---|---|---|
| 1 | 🔴 **§1.1 分工裁定需用户拍板**：分开做强（本规格默认）vs 合并（本页 ③ 降为摘要） | ③ 段 + 铝制品页 ⑦ | **决策（最高优先）** |
| 2 | 🔴 **路由 `/custom-development` 不存在，需新建** | 整页 | 施工方 |
| 3 | **起订量 / 打样周期 / 量产周期 / 模具费归属**（README §4 #3） | ④ 段 | 丰怀确认 |
| 4 | **三种合作模式的真实条款边界**（我们到底做不做 ODM？） | ② 段 | 丰怀确认 |
| 5 | `mooTerms.confirmed` 未确认前 ④ 段的兜底句文案 | ④ 段 | 内容 |
| 6 | `<FlowStepRow>` 是否已由首页建立（提取顺序） | ③ 段实现 | 施工方 |
| 7 | `<CrossLink>` vs 复用 `<ResourceLink>` 形状的判定 | ③ 段实现 | 施工方 |
| 8 | `/request-a-quote` 路由不存在（⑤ 段链接 404） | ⑤ 段 | 施工方 |
| 9 | ② 段坐标（本页）与 `/dealers/private-label` 的边界复核 | ② 段 | 内容 |
| 10 | 是否引用铝制品页的三张流程配图（全部 `public: false`） | ③ 段视觉 | 视觉 + 合规 |

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 五段式（页头 / 合作模式 / 开发流程 / 起订量周期 / 询盘） | `../ARCHITECTURE/page-architecture/README.md` §2.10b |
| 受众 = 贴牌客户 / OEM 项目客户 | 同上 §2.10b |
| 起订量与周期 ⚠️ 需丰怀确认 | 同上 §2.10b 第 4 段 + §4 待确认项 #3 |
| **③ 与铝制品页 ⑦ 的分工（合作模式 vs 技术流程）** | `custom-aluminum-page.md` **§8 ⚠️ 必须二选一做强** |
| 两页各留一个交叉链接 | 同上 §8 建议 |
| 与 `/dealers/private-label` 的边界（你的品牌 vs 你的牌子/图） | 同上 §8 边界线表 |
| 与 `/products`、`/capabilities` 的边界 | 同上 §8 边界线表 |
| 每页必须有询盘入口 | 同上 README §3.2 |
| 表格移动端转卡片不横滚 | `wheel-detail-page.md` §5（单品页规格表同纪律） |
| `FlowStep` 类型 | `src/content/types.ts:163` |
| 首页 ⑥ 段与本页共用 `<FlowStepRow>` | `../PAGE-SPECS/index-home.md` §3.2 |
