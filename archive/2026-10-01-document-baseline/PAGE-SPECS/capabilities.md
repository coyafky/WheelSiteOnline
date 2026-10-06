# `/capabilities` 页面规格（制造与质量）

> **路由**：`/capabilities`（⚠️ **现路由是 `/manufacturing`，需改名**）
> **目标文件**：`src/app/capabilities/page.tsx`（**从 `src/app/manufacturing/page.tsx` 迁改**）
> **渲染**：静态壳 + 客户端工艺浏览器（`<ProcessExplorer>` 是 `"use client"`）
> **数据**：`src/content/process.ts`（工艺）+ `src/content/capabilities.ts`（能力）
> **设计依据**：`../ARCHITECTURE/page-architecture/README.md` §2.9

---

## 0. 一句话

**这一页给「关心产能与一致性的采购」看** —— 他要回答的是
**「你们的工厂能做什么？质量怎么保证？」**

**⚠️ 本页不是「我们的故事」，是「我们的产线」** ——
所以**证据 > 形容词**：工艺名、材料牌号、检测环节、公差数字（**前提是丰怀确认过**）。

**⚠️ 与 `/products/custom-aluminum` 的边界**：本页讲**全厂工艺与质量全景**（资产导向）；
铝制品页只讲**那一条线**（`custom-aluminum-page.md` §8 边界线表）。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §5 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/capabilities/page.tsx` 实测 **4 个 `<section>`**（2026-10-02）。

> 审计原文：`PageHero` → ② `ProcessExplorer` → ③ Material cards → ④ Quality and testing（**内含第二段 hard evidence**）→ ⑤ Capacity figures → `DealerCta`。 规格要求六段（`PAGE-SPECS/capabilities.md` §1），实测 6 段（其中 ④ 实际是两段）。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这条产线是什么？ | ① `PageHero` | `processHero` 三件套 | 深色径向橙光 | `Walk the line` → `#explorer-title` | `Request a quote` → `/contact` | ✅ 合规（锚点跳转 + 询盘，两类不冲突） |
| **02** | 怎么造出来的？ | ② `ProcessExplorer` | 6 道工艺（tabs） | 交互式 tab + 媒体面板 | tab 切换 | 无 | ✅ 合规 |
| **03** | 用什么材料？ | ③ Material cards | `materials` 卡 + `materialsOpenItems` 待确认框 | 3 列材质卡 | 无 | 无 | ✅ 合规 |
| **04** | 怎么检验？ | ④ 上半（`processQuality`） | `processQuality.points` 勾选列 | 左标题 + 右勾选卡 | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **05** | 公差多少？ | ④ 下半（`processHardEvidence`） | 4 格硬指标 `dl` + `processQualityBoundary` | 4 列数字格 | 无 | 无 | ⚠️ **拥挤**（见 B-1，与 04 同属一段） |
| **06** | 产能多大？ | ⑤ Capacity figures | `capacityStats` + 占位声明 | `CapacityStats` 数字带 | 无 | 无 | 🗑️ **建议整段不上线** |
| **07** | 怎么询盘？ | `DealerCta` | 「Ask what the line can do for your order」 | 橙底 | `Request a quote` | email | ✅ 合规 |

**判定统计**：✅ 4 ｜ ⚠️ 拥挤 2 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 1

### 0.5.3 审计给出的处置

| # | 判定 | 审计发现（原文标题） |
|---|---|---|
| B-1 | ⚠️ | 视口 04/05（④ 段内部）：一个 `<section>` 里装了两个不同问题 + 两组不同的视觉 |
| B-2 | 🗑️ | 视口 06（⑤ Capacity figures）：规格明令整段不上线 |

> 逐条理由与建议见 `_viewport-audit.md` §5 的 B 小节 —— **本文件不复制理由，只登记落点**。

### 0.5.4 高度预算与询盘整屏

| 项 | 要求 |
|---|---|
| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |
| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** （`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |
| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |

---

<!-- ASSET-REALIGNMENT-2026-10-02 -->
## 0.6 ★ 真实图片资产重排（2026-10-02）

> `/capabilities` 的图片按证据层级使用，不按「一张图一个卖点」堆叠。

| 证据层 | 可用资产目录 | 适合回答的问题 | 使用规则 |
|---|---|---|---|
| 工厂规模 | `/images/capabilities/factory-aerial.webp`、`factory-aerial-view.webp`、`factory-floor.webp` | 工厂是否真实存在、规模如何 | 只说明现场与布局，不推导面积或产量 |
| 工程开发 | `/images/capabilities/cad-design.webp`、`fea-analysis.webp`、`casting-simulation.webp` | 能否从图纸进入工艺路线 | 图片是工程过程证据，不代表已承诺某项认证 |
| 制造过程 | `/images/capabilities/forging-production-line.webp`、`low-pressure-casting.webp`、`machining-workshop.webp` | 工艺路线包含哪些环节 | 与已确认的工艺数据逐项对应 |
| 质量检查 | `/images/capabilities/inspection-camera.webp`、`runout-inspection.webp`、`impact-test.webp`、`worker-inspection.webp` | 产出如何被检查 | 不从图片推导精度、检测频率或认证结论 |

**处置**：优先使用「工厂规模 → 工程 → 制造 → 质量」四类证据模块；不再强制使用纯文字六格能力带作为唯一主视觉。证书图片 `quality-certificate-*.webp` 只有在证书名称、主体和有效性得到确认后才能进入发布模块。

## 1. 页面骨架（六段式）

| 序 | 内容块 | 必须性 | 说明什么 |
|---|---|---|---|
| ① | 页头 | 必须有 | 制造能力总览 |
| ② | **工艺能力 ★** | 必须有 | 旋压成形 / 低压铸造 / 重力铸造 / 一体锻造 |
| ③ | 材料能力 | 必须有 | 6061 铝合金、镁合金 |
| ④ | 质量与测试 | 必须有 | 检测流程、标准 |
| ⑤ | 产能数据 | 必须有 | ⚠️ **需丰怀确认后才能写** |
| ⑥ | 询盘入口 | 必须有 | — |

```
/capabilities
├── ① <PageHeader>              eyebrow + H1 + 产线定位句（沿用 processHero 三件套）
├── ② <ProcessExplorer>   ★     复用已有（256 行，client）—— 交互式工艺浏览器
├── ③ <MaterialGrid>            材料牌号卡（6061 / 镁合金 / …）
├── ④ <QualityEvidence>         检测环节 + 标准 + 公差（⚠️ 数字待确认）
├── ⑤ <CapacityStats>           产能数字带（<CompanyStat> 形态）⚠️ 全占位
└── ⑥ <DealerCta>
```

**六段就是六段。** 现有 `/manufacturing` 页面若还挂 `processCapability` /
`processPathways` 之类的附加段，按 §3.1 处置表决定去留 —— **不要超过六段**。

---

## 2. 逐块规格

### ① 页头

| 项 | 内容 |
|---|---|
| 数据 | `content/process.ts` 的 `processHero`（**已存在**） |
| eyebrow | `Manufacturing`（⚠️ 若定位改「制造与质量」，eyebrow 建议改 `Capabilities` 或 `Manufacturing & Quality`） |
| H1 | `processHero.heading` —— ⚠️ 现文案「How a Forged Wheel Actually Gets Made」**是轮毂专用口径**，需按四条线定位改写 |
| lede | `processHero.lede` |
| supporting | `processHero.supporting`（现有：「无外包，同厂完成」—— ⚠️ **这是商业承诺，需丰怀确认**） |
| 容器 | `.container-fh`（1180） |
| 组件 | ⚠️ **无现成组件** → 原生 `<header>` + 工具类（与目录页①同处理，**不为此建组件**） |

**🔴 禁止**：写未经确认的产能 / 面积 / 设备数 / 证书（README §4 待确认项 #2）。

### ② ★ 工艺能力（**本页主体，直接复用已有组件**）

**组件**：**`<ProcessExplorer>`** —— `src/components/process-explorer.tsx`（256 行，`"use client"`）
**⚠️ 可直接复用，无需改组件代码** —— 它是一个可配置的工艺浏览器。

```ts
// src/components/process-explorer.tsx —— 完整 props（实测，勿改签名）
type StageNote = { location: string; guards: string };

type ProcessExplorerProps = {
  stages: ProcessStage[];                    // 六道工艺
  notes: Record<string, StageNote>;          // 按 stage.step 键
  copy: {
    eyebrow: string;
    heading: string;
    lede: string;
    tabListLabel: string;                    // 无障碍：tablist 的 aria-label
    panelLabel: string;                      // 无障碍：tabpanel 的 aria-label
  };
};
```

**数据装配（本页直接消费 `content/process.ts`）**：

```tsx
import { ProcessExplorer } from "@/components/process-explorer";
import { processStages, processStageNotes, processExplorerCopy } from "@/content/process";

<ProcessExplorer
  stages={processStages}          // ProcessStage[]，6 条（01 工程 … 06 包装）
  notes={processStageNotes}       // Record<string, { location, guards }>
  copy={processExplorerCopy}      // eyebrow / heading / lede / tabListLabel / panelLabel
/>
```

**交互纪律（组件已实现，规格只需遵守）**：
- ✅ **点击驱动**（不是 hover / 不是自动轮播）—— 采购要能停在自己关心的那一步
- ✅ WAI-ARIA tabs 模式（`role="tablist"` / `tab` / `tabpanel`，roving focus，方向键 + Home/End）
- ✅ **媒体区是编号 CSS 面板，不请求图片** —— `ProcessStage.image` 字段有值，
  但 `public/images/process/` 尚不存在，**组件刻意不渲染 `<img>`**（避免 404）

**🔄 图片接入后可升级（可选，非阻塞）**：
在 `process-explorer.tsx` 的媒体区把 CSS 面板换成 `<picture>` 层。**搬运步骤**：

```bash
cd /Users/fkycoya/Documents/Code/WordpressWheelSIte
mkdir -p public/images/process
# process.ts 已声明的路径（6 张，需从 assets/factory-press 等素材产出）
# /images/process/01-engineering.jpg
# /images/process/02-forging.jpg
# /images/process/03-machining.jpg
# /images/process/04-finishing.jpg
# /images/process/05-quality.jpg
# /images/process/06-packaging.jpg
```

**⚠️ 未接入前本段完全可上线** —— 这是全站少有的「无图不阻塞」段。

**🔴 工艺名必须与 `WheelProcess` 枚举一致**：
`"旋压" | "低压" | "低压+旋压" | "锻造"`（`types.ts:410`）。
⚠️ README §2.9 列了「旋压成形 / 低压铸造 / **重力铸造** / 一体锻造」四工艺 ——
**「重力铸造」不在枚举里**，本页出现该词**必须经丰怀确认产线实际具备**后再写，
否则与轮毂目录页的工艺口径互相矛盾。

### ③ 材料能力

| 项 | 内容 |
|---|---|
| 结构 | 材料卡栅格：牌号（大字 `font-display`）+ 一句用途 + 可选参数 |
| 材料 | **6061 铝合金**（已语料确认）/ **镁合金**（⚠️ 语境存疑，见下） |
| 组件 | `<MaterialGrid>`（**需新建**，或内联 —— 见 §3.2） |
| ⚠️ | 现有唯一材料语料（术语 #55–#57）来自**峰徊 P9 的轮毂语境**（`custom-aluminum-page.md` §2.3）—— **不得直接挪用来声称「铝制品线用镁合金」** |

**🔴 通用数据缺口（README §4 待确认项 #6）**：
三条非轮毂线的材料牌号 / 尺寸包络 / 公差 / 产能全部未确认。
**本段若只写「6061 + 镁合金」两句，就是空壳** → 见 §6 阻塞 #3。

### ④ 质量与测试

| 项 | 内容 |
|---|---|
| 结构 | 检测环节清单（有序）+ 标准引用 + 关键公差 |
| 数据 | `content/process.ts` 的 `processQuality`（**已存在**，需核实是否通用口径） |
| 组件 | `<QualityEvidence>`（**需新建** 或内联） |
| ⚠️ 数字 | 引用 `about-page.md` 的硬证据口径：`runout <0.01 inch`、`关键尺寸 ±0.05mm` —— **但这两项与产能数字同属「需丰怀确认」（README §4 #2）** |
| 🔴 | 不得引用未持有的体系认证（如 IATF 16949 —— 那是 `/products/ev-components` 的必答题，README §4 #7） |

### ⑤ 产能数据

| 项 | 内容 |
|---|---|
| 结构 | 数字带（3–6 格）：成立年限 / 厂区面积 / 月产能 / 出口市场 / 设备数 |
| 类型 | **`CompanyStat`**（`content/types.ts:144`，**已定义**） |
| 🔴 关键字段 | **`isPlaceholder: boolean`** —— 组件按它渲染可见的「Placeholder」标记 |
| ⚠️ 现状 | **全部数字均为行业合理估值，非实际值** → **`isPlaceholder` 全为 `true`** |
| 组件 | `<CapacityStats>`（**需新建**；若 `/about` 也做同形数字带 → 提取到 `src/components/`） |

```ts
type CompanyStat = {
  index: string;
  label: string;
  value: string;
  body: string;
  /** ★ true = 结构性占位，丰怀上线前必须确认。渲染为可见「Placeholder」标记。 */
  isPlaceholder: boolean;
};
```

**🔴 三条纪律**：
1. **`isPlaceholder: true` 的格子必须显示占位标记** —— 不得静默当真实数字渲染
2. **全部为 `true` 时，整段不上线**（宁可少一段，不留假数字）
3. **禁止在本页编造任何数字**（包括「20–30 天交期」这类 —— 见 §6 阻塞 #1）

**⚠️ 现有 `capabilities.ts` 里已有未确认承诺**：
- `"Reliable Lead Time"` → `"20–30 day production windows"` ⚠️ 交期未确认
- `"Factory Direct"` → `"Manufactured in our own facility"` ⚠️ 商业承诺
- `"Custom Finishes"` → `"Brushed, polished, anodised…"` ⚠️ 工艺清单未确认

文件头自注：**PLACEHOLDER: every claim here is a commercial commitment.**
**→ 这 6 条与首页 ⑤ 段共用，重写责任两页同步。** 见 §6 阻塞 #2。

### ⑥ 询盘入口

| 元素 | 内容 |
|---|---|
| 组件 | `<DealerCta>`（复用，21 处冠军） |
| 目标 | `/request-a-quote`（⚠️ 该路由尚不存在，见 `index-home.md` §6 #10） |
| 文案 | **≤ 80 字**，聚焦「产能/一致性/检测」而非泛泛的「联系我们」 |

---

## 3. 组件清单

### 3.1 复用已有（真实路径）

| 组件 | 路径 | 本页用途 | 处置 |
|---|---|---|---|
| **`<ProcessExplorer>`** | `src/components/process-explorer.tsx`（256 行，client） | ② **本页主体** | ✅ **直接复用，零改动**（换 `stages`/`notes`/`copy` 即可） |
| `<DealerCta>` | `src/components/sections/dealer-cta.tsx` | ⑥ | 直接复用 |

**★ 这是本模块里**唯一**一个「现成组件能直接扛住主体段」的页面** ——
`<ProcessExplorer>` 的 props 已经参数化，**不要重写它**。

**⚠️ 现有 `/manufacturing` 页面的附加段处置**：

| 内容 | 来源 | 处置 |
|---|---|---|
| 工艺浏览器 | `<ProcessExplorer>` | ✅ 保留（② 段） |
| `processCapability`（"What this buys you"，4 条 point） | `process.ts` | ⚠️ **可并入 ④ 质量段的引子**，或删除（避免 >6 段） |
| `processPathways`（路由卡，`ResourceLink[]`） | `process.ts` | ⚠️ **可并入 ⑥ 段之前**（M2「长页尾部必有路由段」）—— 但要数进六段 |
| `processHero` | `process.ts` | ✅ 保留（① 段） |
| `processQuality` | `process.ts` | ✅ 保留（④ 段） |

**⚠️ 决策点**：若采用 `processPathways`（尾部路由段），则骨架变 7 段 ——
**README §2.9 只列 6 段** → **要么并入 ⑥，要么不加**。记在 §6 待补 #5。

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<MaterialGrid>`** | **内联到页面即可**（原生栅格 + 工具类） | ③ 材料卡 | 仅本页（除非铝制品页也列材料 → 则提取） |
| **`<QualityEvidence>`** | **内联或 `src/components/quality-evidence.tsx`** | ④ 检测环节 + 公差 | ⚠️ 若 `/about` 也讲硬证据 → 提取 |
| **`<CapacityStats>`** | `src/components/capacity-stats.tsx` | ⑤ `CompanyStat[]` 数字带 + 占位标记 | **2 页**（`/capabilities` + `/about`）→ 必须提取 |
| **`<ProcessCompare>`** | `src/components/process-compare.tsx` | ⚠️ **条件新建**：若与系列页 ③ 的工艺对照表同形 | 见下 |

**★ 提取纪律**：
1. **`<CapacityStats>` 必须提取** —— `/about` 的 9 段里也有 capability strip
   （`about-page.md`），**同为 `CompanyStat[]` 数字带 → 两页共用**
2. **`<ProcessCompare>` 是条件项** —— 系列页规格（`products/wheels/series/[series].md` §6 #4）
   已把这列为待决：**若两页都把「工艺对照表」做成同一形态 → 必须提取**；
   否则各页内联。**施工前拍板。**

---

## 4. 数据契约

### 4.1 类型（全部已存在，本页不新增类型）

```ts
// src/content/types.ts —— 已存在
type ProcessStage = { step: string; title: string; body: string; image: string };  // ②
type Capability   = { index: string; title: string; body: string };               // 复用（首页） 
type CompanyStat  = { index: string; label: string; value: string;
                      body: string; isPlaceholder: boolean };                     // ⑤ 关键
type ResourceLink = { eyebrow: string; title: string; body: string;
                      href: string; linkLabel: string };                          // 尾部路由段
type WheelProcess = "旋压" | "低压" | "低压+旋压" | "锻造";                        // ② 工艺名口径
```

### 4.2 数据来源一览

| 段 | 数据模块 | 现状 |
|---|---|---|
| ① | `content/process.ts` → `processHero` | ✅ 存在，⚠️ 文案是轮毂口径，需改 |
| ② | `content/process.ts` → `processStages`(6) + `processStageNotes` + `processExplorerCopy` | ✅ 存在，✅ 立即可用 |
| ③ | ❌ 不存在 → **需新建 `content/materials.ts`** | ❌ 阻塞（丰怀确认材料牌号） |
| ④ | `content/process.ts` → `processQuality` | ✅ 存在，⚠️ 数字待确认 |
| ⑤ | ❌ 不存在 → **需新建 `content/company-stats.ts`**（`CompanyStat[]`） | ⚠️ **全占位** |
| ⑥ | `<DealerCta>` 内联默认文案 | ✅ |

**⚠️ `content/capabilities.ts` 的定位**：它现在**只被 `<TrustStrip>` 消费**
（首页 ⑤ 段），**不直接服务本页**。本页 ⑤ 段应新建 `content/company-stats.ts`
（`CompanyStat[]`），**不要复用 `capabilities.ts` 的 6 条**（那是能力格，不是产能数字）。

### 4.3 ★ 图片从哪来

| 段 | 图片来源 | 搬运 |
|---|---|---|
| ① | 无图 | ✅ |
| ② | ⚠️ `ProcessStage.image` 有路径，**`public/images/process/` 不存在** | **默认不渲染 `<img>`**（组件已如此设计）；接入步骤见 §2② |
| ③ | 无图（文字卡） | ✅ |
| ④ | 无图 | ✅ |
| ⑤ | 无图（数字带） | ✅ |
| ⑥ | 无图 | ✅ |

**🔴 结论：本页是四条能力/制造线里唯一「零图片阻塞」的页面。**
`assets/` → `public/` 的搬运**只在 ② 段可选升级时需要**；
`assets/preview-media/factory.webp` 可作为 ① 段背景备选（⚠️ 需核实 `public: false`）。

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180）—— 本页是文本/证据页，不用宽容器 |
| ② 工艺浏览器 | **组件自带双栏**（左 tablist / 右 panel）；移动端组件内部已处理堆叠 |
| ③ 材料栅格 | ≥1024 → 3 列；768 → 2 列；390 → 1 列 |
| ④ 质量 | 单列有序列表（`<ol>`），宽 ≤ 820px |
| ⑤ 数字带 | ≥1024 → 3–4 列；768 → 2 列；390 → 1 列；数字 `font-display` |
| 深色段 | **① 可深色 Hero**；**⑤ 建议深色**（数字带在 `bg-ink` 上最醒目）；其余浅色 |
| 动效 | ③④⑤ 用 `[data-reveal-group]`（80ms 错峰）；`<ProcessExplorer>` 自带交互，不加 reveal |
| 🔴 fail-visible | 组件内不得自加 `opacity-0`（仅 `html[data-motion-armed]` 下隐藏） |
| 断点 | 768 **必测**（材料/数字带两列时文字易溢出） |

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 归属 |
|---|---|---|---|
| 1 | 🔴 **路由改名 `/manufacturing` → `/capabilities`**（+ 全站内链、sitemap、导航、README §1.1） | **整页路由** | 施工方 |
| 2 | ⚠️ **`capabilities.ts` 6 条商业承诺重写**（lead time / factory direct / finishes）—— 与首页 ⑤ 同步 | ⑤ 段 + 首页 | 内容 + 丰怀确认 |
| 3 | **材料能力（③）无数据**：6061 已确认、镁合金语境存疑、无牌号参数 | ③ 段 | 丰怀确认 |
| 4 | **产能数字（⑤）全占位**：成立年限 / 厂区 / 月产能 / 出口市场 | ⑤ 段 | 丰怀确认（**README §4 #2**） |
| 5 | `processPathways` 尾部路由段是否计入（6 段 vs 7 段） | 骨架 | 设计 |
| 6 | **「重力铸造」是否在产线内**（README 列了，`WheelProcess` 枚举没有） | ② 段工艺名 | 丰怀确认 |
| 7 | `processHero` 文案是轮毂口径，需改四线通用口径 | ① 段 | 内容 |
| 8 | `/about` 也用 `CompanyStat` 数字带 → `<CapacityStats>` 必须两页共用 | 组件边界 | 施工方 |
| 9 | 是否引用 `runout <0.01 inch` / `±0.05mm`（与 `/about` 同属待确认数字） | ④ 段 | 丰怀确认 |
| 10 | ② 段图片是否本轮接入（不接入也能上线） | ② 段视觉 | 视觉 + 合规 |

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 六段式（页头 / 工艺 / 材料 / 质量 / 产能 / 询盘） | `../ARCHITECTURE/page-architecture/README.md` §2.9 |
| 路由改名 `/manufacturing` → `/capabilities` | 同上 §1.1 映射表（范围更准：不只制造，还有质量） |
| 产能数据 ⚠️ 需丰怀确认 | 同上 §2.9 第 5 段 + §4 待确认项 #2 |
| 与铝制品页的边界（全厂 vs 单线） | `custom-aluminum-page.md` §8 边界线表 |
| 工艺名与 `WheelProcess` 枚举一致 | `src/content/types.ts:410` + `wheel-catalog-page.md` §3.2 |
| 硬证据口径（runout / 公差） | `about-page.md`（README §2.12 引用） |
| `CompanyStat.isPlaceholder` 可见占位标记 | `src/content/types.ts:144` |
| 每页必须有询盘入口 | 同上 README §3.2 |
