# `/about` 页面规格（工厂侧信任页 · 全站最轻密度）

> **路由**：`/about`
> **目标文件**：`src/app/about/page.tsx`（已存在，需按本规格重排）
> **渲染**：全静态（无客户端状态）
> **数据**：`content/about.ts`（已有 11 个导出）+ `assets/` 实测
> **设计依据**：`../../ARCHITECTURE/page-architecture/about-page.md`

---

## 0. 一句话

**这页不回答「我们是谁」，它回答「你的订单背后有没有实体工厂」。**

竞品 H1 是 *Factory-Backed Custom Forged Wheel Manufacturer* —— **关键词是 `Factory-Backed`（有工厂背书）**。
**它是「证据页」，不是「说服页」** —— 竞品 657 字 / 9 段 = **73 字/段，全站最轻密度**
（比经销商页 151 字/段轻一半，比贴牌页轻更多）。

**⚠️ 对我们的前置**：**经销商页讲「怎么合作」，关于页讲「工厂是不是真的」** ——
**两页不重复，是接力**。写作时必须守住这条边界（见 §2 ⑧ 与设计文档 §5）。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §12 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/about/page.tsx` 实测 **7 个 `<section>`**（2026-10-02）。

> 审计原文：7 段 —— A Hero → B stats strip（`aboutStats` 4 格，带 Placeholder 标记）→ C chain（供应链）→ D quality → E positioning（`aboutAreNot` / `aboutAre` 两列）→ F dealer model（4 步）→ G pathways → `DealerCta`。 规格要求九段（`PAGE-SPECS/about.md` §1）。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 你们是谁？ | A Hero | `aboutHero` + 成立年份侧栏 | 深色径向橙光 | 主 CTA | 次 CTA | ✅ 合规 |
| **02** | 规模多大？ | B stats strip | `aboutStats` 4 格 + Placeholder 徽标 | 4 列数字格 | 无 | 无 | ✅ 合规（有 `isPlaceholder` 标记，诚实） |
| **03** | 供应链是怎样的？ | C chain | `aboutChain` + 勾选列 + `aboutChainStages` | 左文 + 右编号列 | 无 | 无 | ✅ 合规 |
| **04** | 质量怎么保证？ | D quality | `aboutQuality` + 勾选列 | 左文 + 右勾选卡 | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **05** | 你们为谁服务？ | E positioning | `aboutPositioning` + `What we are not` / `What we are` 两列 | 左负右正两列 | 无 | 无 | ⚠️ **拥挤**（见 B-1，与 04 相邻同形） |
| **06** | 怎么跟经销商合作？ | F dealer model | `aboutDealerModel` + `aboutDealerSteps` 4 步 | 4 列步条 | 无 | 无 | 🗑️ **建议与 `/dealers` 二选一** |
| **07** | 接下来去哪？ | G pathways | `Where to go next` + 3 卡 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |
| **08** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

**判定统计**：✅ 4 ｜ ⚠️ 拥挤 2 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 2

### 0.5.3 审计给出的处置

| # | 判定 | 审计发现（原文标题） |
|---|---|---|
| B-1 | ⚠️ | 视口 04（D quality）与 05（E positioning）：连续两屏用同一形态 |
| B-2 | 🗑️ | 视口 06（F dealer model）：答案是重复的（与 `/dealers` 冲突） |
| B-3 | 🗑️ | 视口 07（G pathways）：答案是重复的 |

> 逐条理由与建议见 `_viewport-audit.md` §12 的 B 小节 —— **本文件不复制理由，只登记落点**。

### 0.5.4 高度预算与询盘整屏

| 项 | 要求 |
|---|---|
| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |
| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** （`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |
| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |

---

<!-- ASSET-REALIGNMENT-2026-10-02 -->
## 0.6 ★ 真实图片资产重排（2026-10-02）

> 本页不再为了满足旧版「3 卡 3 图」而凑图。真实资产支持的是「工厂证据 + 质量证据」两类视觉，分别服务两个不同问题。

| 视口 | 使用资产 | 组件职责 | 内容边界 |
|---|---|---|---|
| 03 供应链 | `/images/about/factory-floor-wide.webp` | 工厂证据图 + 供应链说明 | 证明制造现场与原料/锻造叙事，不虚构产线数量 |
| 04 质量 | `/images/about/inspection-camera.webp` | 检测证据图 | 证明存在检测场景，不把图片当成具体认证或精度数字 |
| 02 事实带 | 无强制图片 | 四格事实带 | `12,000 t`、`Global` 可发布；成立年份、月产能继续占位 |

**处置**：删除「制造伙伴 3 卡 3 图」作为硬性要求；保留单张工厂证据与单张检测证据。`company-events.webp` 可作为后续公司历史模块候选，但本轮不强制挂载。

## 1. 页面骨架（九段式）

| 序 | 内容块 | 必须性 | 说明什么 | 段落类型 | 就绪度 |
|---|---|---|---|---|---|
| ① | Hero（深色） | 必须有 | 定位 + 「我们不卖仓库目录」 | 定位 | ✅ |
| ② | **四个硬数字 ★** | 必须有 | 材料 / 减重 / 尺寸 / 规模 | 事实带 | ❌ **3 条待确认** |
| ③ | **供应链坦白 ★** | 必须有 | **本页最关键的分叉点** | **论证/坦白** | ❌ **关键分叉** |
| ④ | 制造伙伴（3 卡 3 图） | 必须有 | 产线 / 图纸沟通 / 生产检查 | 信任 | ❌ 无工厂实景照片 |
| ⑤ | 生产前确认 | 必须有 | 清单 | **T6 证据** | ✅ |
| ⑥ | 定位筛选 | 必须有 | 「为需要不止目录货的买家」 | 定位 | ✅ |
| ⑦ | 质量证据 ★ | 必须有 | 公差 / 检测标准 | **T6 证据** | ❌ **需丰怀确认** |
| ⑧ | 路由段 | 必须有 | → 经销商 / 贴牌 / 制造 | **T7** | ✅ |
| ⑨ | 收束 CTA | 必须有 | ≤80 字 + WhatsApp | **T8** | ⚠️ 商务号 |

**⚠️ ②③④⑦ 四段依赖丰怀工厂事实（4 段阻塞）** —— 与设计文档 §6 一致。

```
/about
├── ① <AboutHero>            深色；H1 定位 + 「我们不卖仓库目录」+ 成立年份侧栏
├── ② <StatStrip>  ★           四数字（CompanyStat[] → isPlaceholder 标记）
├── ③ <SupplyChainReality>  ★  供应链坦白（两种写法，见 §2③）
├── ④ <TrustTriad>            3 卡 3 图（产线 / 图纸沟通 / 生产检查）
├── ⑤ <PreProductionConfirm>  生产前确认清单（T6）
├── ⑥ <PositioningSplit>      为谁的买家（为 / 不为 两列）
├── ⑦ <QualityEvidence>  ★     公差与检测（T6）
├── ⑧ <RouteBlock>            T7 三出口
└── ⑨ <DealerCta>             ≤80 字收束
```

---

## 2. 逐块规格

### ① Hero（深色）

| 项 | 内容 |
|---|---|
| eyebrow | `ABOUT` |
| H1 | **有工厂背书的定制轮毂制造方**（对齐竞品 Factory-Backed 定位） |
| 一句 | ★ **「我们不卖仓库目录」**（竞品段 0 核心句） |
| 侧栏 | 成立年份（⚠️ 需丰怀确认；竞品写了 `Since 2020`） |
| 背景 | **深色** `bg-ink`（#0b0f16），对齐竞品 `rgb(5,7,11)` |

**⚠️ Hero 不加 CTA 按钮** —— 这是证据页的开场，不是落地页。
（竞品段 0 也没有主 CTA。）

**props 契约**：

```ts
// src/components/sections/about-hero.tsx（需新建；现有页面是内联的）
type AboutHeroProps = {
  eyebrow: string;         // "ABOUT"
  title: string;           // "有工厂背书的定制轮毂制造方"
  lede: string;            // ★ 「我们不卖仓库目录」
  since?: string;          // ⚠️ 成立年份，未确认则整个侧栏不渲染
};
```

### ② ★ 四个硬数字（StatStrip）

**竞品四条全是可验证的硬指标，没有一个形容词**：

| # | 竞品 | 我们能填吗 | 就绪度 |
|---|---|---|---|
| 1 | 月产能 3,000 只 | ⚠️ 需丰怀确认 | ❌ |
| 2 | 材料 6061-T6 | ✅ 语料库有 | ✅ |
| 3 | 12,000 吨锻压 | ⚠️ **见下警告** | ❌ |
| 4 | 2 个主要市场 | ❌ 需丰怀确认出口市场 | ❌ |

**🔴🔴 第 3 条有大坑**：语料库里的「**万吨锻造机**」出自 **航鹏画册 P4（第三方品牌）**，
**不能直接当丰怀的设备写**。已列为待确认，**未确认前不得写任何吨位数字。**

**★ 我们的替代策略（设计文档 §4.2）**：
**用「目录事实」替代「产能数字」** —— 产能要等丰怀确认，但
**材料 / 减重 / 尺寸 / 规模** 是我们**实测已知**的：

| # | 我们的数字 | 状态 |
|---|---|---|
| 1 | **材料：6061 铝合金 + 镁合金** | ✅ 语料库可直接用 |
| 2 | **减重效果：锻造铝合金减重 10–20%** | ✅ 语料库 P9 |
| 3 | **尺寸范围：15–20 寸 + HP/越野款** | ✅ 资产实测 |
| 4 | **型号规模：1018 型号 / 3485 配置** | ✅ 资产实测 |

**→ 四条里现在能填 4 条（换掉竞品那套依赖产能的路子）。
⚠️ 若丰怀后来提供了产能/锻压吨位，应替换掉较弱的第 2/3 条。**

**props 契约**：**复用 `<StatStrip>`**（与 `/dealers` ② 同一个组件），`stats: CompanyStat[]`、`columns={4}`。

```ts
import type { CompanyStat } from "@/content/types";
// CompanyStat = { index, label, value, body, isPlaceholder }
type StatStripProps = { stats: CompanyStat[]; variant?: "light" | "dark"; columns?: 2 | 4 };
```

**🔴 纪律**：
- `isPlaceholder: true` → **渲染 + 可见「待确认」角标**（`CompanyStat` 内建此意图）
- ❌ **不得显示任何未经丰怀确认的数字**（尤其锻压吨位）

### ③ ★★ 供应链坦白（本页最关键的分叉点）

**竞品这一段是全页最聪明的** —— 它**主动承认**锻坯和轮辋是从上游供应商买的：

> *"Most custom forged wheel orders start with forged blanks and rim parts from
> specialist upstream suppliers. **That is normal in this industry.**"*

**为什么不藏**：① 同行都知道，藏没意义 ② 主动说 = 诚实信号 ③ 然后重新定义自己的价值
（「**2N takes the order from there**」—— 从锻坯到成品这一段的控制才是它的本事）。

**🔴🔴 但对我们有个前置问题：丰怀的锻坯是自产还是外购？**

语料库说「**我们具备 6061 铝合金与镁合金轮毂一体锻造成形能力**」
（峰徊画册 P9 / *"One-piece forging capability is available for 6061-aluminum and magnesium wheel programs"*）
→ **听起来是自产**。

**★ 两种写法（取决于丰怀实际）—— 这是本页最重要的分叉**：

| 若丰怀是… | 写法 | 依据 |
|---|---|---|
| **外购锻坯** | **照抄竞品**：坦白上游 → 强调「从锻坯到成品的控制」 | 语料未见自产证据 |
| **能一体锻造** | **反过来写**：「具备 6061/镁合金一体锻造成形能力」→ **这是相对同行的优势** | 语料库 P9 明确写了「我们具备」 |

**→ 规格要求：组件必须支持两种形态，由数据（而非代码改动）切换。**

**props 契约**：

```ts
// src/components/supply-chain-reality.tsx（本页 —— 结构独特，专属）
type SupplyChainMode = "outsourced-blanks" | "in-house-forging";

type SupplyChainRealityProps = {
  eyebrow: string;
  heading: string;
  /**
   * ★ 分叉开关 —— 决定「坦白」还是「优势」。
   * ⚠️ 未确认前：不渲染本段，而不是猜一个。
   */
  mode: SupplyChainMode | null;
  /** mode = "outsourced-blanks"：承认上游 + 强调下游控制 */
  transparency?: {
    admission: string;      // "锻坯与轮辋来自专业上游供应商"
    normalcy: string;       // "这是行业常态"
  };
  /** mode = "in-house-forging"：把能力当优势写 */
  capability?: {
    claim: string;          // "具备 6061/镁合金一体锻造成形能力"
    advantage: string;      // 相对同行的意义
  };
  /** 两种模式共用：从哪到哪这一段的控制清单 */
  controlledStages: string[];  // 车数据 → 规格 → 图纸审核 → 加工协调 → 表面 → logo/盖 → 终检 → 出口
};
```

**🔴 纪律**：
- `mode: null` → **整段不渲染**（不留「待确认」占位 —— 这是论证段，占位比缺更糟）
- ❌ **不得在 `mode` 未定时同时写两种说法**
- ❌ **不得把「万吨锻造机」（第三方来源）写进本段**

### ④ 制造伙伴（3 卡 3 图）

**竞品 3 卡**：CNC 产线 / 图纸与适配沟通 / 亲手生产检查。

| 卡 | 内容 | 图 |
|---|---|---|
| 1 | CNC 产线 | ⚠️ 无工厂实景照片 |
| 2 | 图纸与适配沟通 | ⚠️ 无图 |
| 3 | 生产检查 | ⚠️ 无图 |

**🔴 图片真相**：`public/images/` **当前零张真实图**（只有 `.gitkeep`）。
**本段 3 张图是「工厂实景」—— 无法用示意图替代**（示意图证明不了「有工厂」）。

**→ 本段在拿到工厂照片前，只能渲染 3 卡无图版**（`variant: "no-media"`）。

```ts
// src/components/trust-triad.tsx（本页）
type TrustCard = {
  eyebrow: string;
  title: string;
  body: string;
  image?: { src: string; width: number; height: number; alt: string };
};
type TrustTriadProps = {
  eyebrow: string;
  heading: string;
  cards: TrustCard[];             // 恰好 3 张
  /** ⚠️ 无实拍图时 true → 渲染纯文本卡，不做占位图 */
  noMedia: boolean;
};
```

**🔴 纪律**：**无图时不生成占位图框** —— 空的灰色图片框会**削弱**本段要传达的「有实体工厂」。
宁可三张纯文本卡。**图片搬入步骤见 §5。**

### ⑤ 生产前确认（T6）

**竞品清单**：
```
车数据确认 → 图纸/加工/表面记录 → 表面协调 → 生产照片 → 保护性包装 → 复购支持
```

**props 契约**：**复用 `<ProcessSteps>`**（与 `/dealers` ⑦ 同一个组件），
`steps: FlowStep[]`、`variant="light"`。
**⚠️ 若含「生产照片」条目而丰怀不能提供，该条必须去掉**（与 `/dealers` ⑧ 同源纪律）。

### ⑥ 定位筛选

**竞品段 5**：*"DESIGNED FOR BUYERS WHO NEED MORE THAN A CATALOG WHEEL"*。

**★ 竞品在这里说清了分工**：
> *"For cooperation terms, use the dealer page. For production steps, use the manufacturing page."*
> （合作条款看经销商页，生产步骤看制造页）

**→ 竞品把「去哪看什么」直接写在正文里。这个做法我们要学。**

**props 契约**（复用站内既有 `PositioningPoint` 类型）：

```ts
// src/components/positioning-split.tsx（本页 + 未来产品页复用）
import type { PositioningPoint } from "@/content/types";   // { title, body }

type PositioningSplitProps = {
  eyebrow: string;
  heading: string;
  /** ★ 两列：为谁 / 不为谁 —— 对齐 about.ts 里已有的 aboutAre / aboutAreNot */
  forWhom: PositioningPoint[];      // aboutAre
  notForWhom: PositioningPoint[];   // aboutAreNot
  divisionNote?: string;            // "合作条款看经销商页，生产步骤看制造页"
};
```

**★ 数据已就绪**：`about.ts` 已有 `aboutAre` / `aboutAreNot`（两个 `PositioningPoint[]`）→ **直接接。**

### ⑦ ★ 质量证据（T6）

**竞品段 6 的两个公差数字，是全站技术含量最高的两个数字**：

```
100% runout testing under 0.01 inch      （跳动 <0.01 英寸）
Key dimensions checked to +/-0.05 mm     （关键尺寸 ±0.05mm）
```

**⚠️ 我们能不能写？必须丰怀确认实际检测标准 —— 写了做不到就是事故。**

**竞品同段的其余三项**（较软，可先写）：
- 图纸确认 → 序列号与规格刻印 → 100% 跳动测试 → 关键尺寸检查

**props 契约**：

```ts
// src/components/quality-evidence.tsx（本页 + 贴牌页 ⑨ 相关）
type QualityMetric = {
  label: string;        // "跳动测试" / "关键尺寸"
  value: string;        // ⚠️ 未确认时为空
  unit?: string;
  isPlaceholder: boolean;
};
type QualityEvidenceProps = {
  eyebrow: string;
  heading: string;
  /** ★ 公差数字 —— 未确认时数组为空，本块不渲染数字，只渲染流程条目 */
  metrics: QualityMetric[];
  /** 较软的流程条目（图纸确认 / 刻印 / 检测）—— 可先写 */
  processPoints: string[];
  serialEngraving?: boolean;   // ⚠️ 是否有序列号刻印（待确认）
};
```

**🔴 纪律**：`metrics` 里 `isPlaceholder: true` 的项**必须带可见标旗，不得裸输出数字**。
**宁可只写流程条目，也不写一个做不到的公差。**

### ⑧ 路由段（T7）

**竞品三个出口 + 一段导语**：

> *"If this page helped you understand **who is behind the wheel**, these pages explain
> **how to work with us** in a more practical way."*

| 出口 | 一句话 | href |
|---|---|---|
| **经销商供货** | 不囤货卖定制轮毂 | `/dealers` |
| **贴牌代工** | 把名字 / logo / 中心盖印在你客户想要的轮毂上 | `/dealers/private-label` |
| **制造工艺** | 看确认的规格如何进入图纸审核、加工、表面与检查 | `/manufacturing`（⚠️ 目标应改名 `/capabilities`） |

**★ 导语必须保留** —— 它显式承认「关于页讲的是人，接下来讲的是怎么合作」。
**这就是「关于页 → 经销商页」的接力关系。**

**props 契约**：**复用 `<RouteBlock>`**（与 `/dealers` ③⑩ 同一个组件），`items: RouteStep[]`、`columns={3}`。

### ⑨ 收束 CTA（T8，≤80 字）

**竞品 40 字，全站第二短。**

**⚠️ 必须 ≤80 字**。**组件**：**复用 `<DealerCta>`**（`sections/dealer-cta.tsx`）。

**⚠️ 若含 WhatsApp** → 商务号未确认前**降级为邮件链接**。

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 |
|---|---|---|
| `<DealerCta>` | `src/components/sections/dealer-cta.tsx` | 第 ⑨ 段收束（**21 处复用**） |
| — | `src/components/ui/button.tsx` | ⚠️ **零使用，不 import** —— 用 `.btn-pill-*` |

**✅ 数据复用**：`about.ts` 已有 11 个导出（`aboutHero` `aboutStats` `aboutChain` `aboutChainStages`
`aboutQuality` `aboutPositioning` `aboutAreNot` `aboutAre` `aboutDealerModel` `aboutDealerSteps`
`aboutPathways` `aboutHeroActions`）—— **页面直接 import，不要重写文案。**

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<StatStrip>`** | `src/components/stat-strip.tsx` | 四硬数字带 | **4 页** ★ 与 `/dealers` ② 同一组件 |
| **`<RouteBlock>`** | `src/components/route-block.tsx` | T7 三出口 | **8+ 页** ★ 同一组件 |
| **`<ProcessSteps>`** | `src/components/process-steps.tsx` | 生产前确认清单 | **6+ 页** ★ 同一组件 |
| **`<DataNotice>`** | `src/components/data-notice.tsx` | 数据来源免责 | **全站证据页** |
| `<AboutHero>` | `src/components/sections/about-hero.tsx` | 深色 Hero | 本页 |
| **`<SupplyChainReality>`** | `src/components/supply-chain-reality.tsx` | ★ 供应链坦白（双模式） | 本页 —— **结构独特，专属** |
| `<TrustTriad>` | `src/components/trust-triad.tsx` | 3 卡 3 图（支持无图） | 本页 |
| `<PositioningSplit>` | `src/components/positioning-split.tsx` | 为谁 / 不为谁 | **2 页**（+ 产品页） |
| `<QualityEvidence>` | `src/components/quality-evidence.tsx` | 公差与检测 | **2 页**（+ 贴牌页相关） |

**★ 组件纪律**：**上表前 4 个必须与 `/dealers` / `/products/wheels` 的规格同名同路径。**

---

## 4. 数据契约

### 4.1 现有内容模块（`src/content/about.ts`，11 个导出）

```ts
// ✅ 已存在
export const aboutHero: { /* eyebrow, title, lede, … */ };      // → ①
export const aboutStats: CompanyStat[];                        // → ②（★ 已含 isPlaceholder）
export const aboutChain: { /* eyebrow, heading, body */ };     // → ③
export const aboutChainStages: FlowStep[];                     // → ③ 控制清单
export const aboutQuality: AnswerBlock;                        // → ⑦
export const aboutPositioning: { /* eyebrow, heading, body */ };// → ⑥
export const aboutAreNot: PositioningPoint[];                  // → ⑥（不为谁）
export const aboutAre: PositioningPoint[];                     // → ⑥（为谁）
export const aboutDealerModel: { /* … */ };                    // → ⑤
export const aboutDealerSteps: FlowStep[];                     // → ⑤
export const aboutPathways: ResourceLink[];                    // → ⑧
export const aboutHeroActions: { primary: CtaLink; secondary: CtaLink };  // → ①
```

**🔴 关键**：`aboutStats: CompanyStat[]` **已经带 `isPlaceholder` 字段** ——
这正是设计文档 §2.1「四条里只有 1 条现在能填」在数据层的表达。
**渲染层必须尊重这个字段，不得忽略。**

### 4.2 需要新增 / 修改的数据

```ts
// src/content/about.ts 调整

/** ② 四硬数字 —— 用「目录事实」策略替换依赖产能的条目 */
export const aboutStats: CompanyStat[] = [
  { index: "1", label: "材料",     value: "6061 铝合金 + 镁合金", body: "锻造轮毂常用牌号", isPlaceholder: false },
  { index: "2", label: "减重效果", value: "10–20%",              body: "锻造铝合金相对铸造", isPlaceholder: false },
  { index: "3", label: "尺寸范围", value: "15–20 寸",            body: "含 HP 与越野款",    isPlaceholder: false },
  { index: "4", label: "型号规模", value: "1018 / 3485",         body: "在册型号 / 可下单配置", isPlaceholder: false },
];
// ⚠️ 月产能 / 锻压吨位 / 出口市场 三项目前 未确认 → 不进数组（或 isPlaceholder:true）

/** ③ 供应链分叉 —— mode 未确认前为 null */
export const aboutSupplyChainMode: "outsourced-blanks" | "in-house-forging" | null = null;

/** ⑦ 质量公差 —— 未确认时为空数组 */
export const aboutQualityMetrics: QualityMetric[] = [];
```

### 4.3 就绪度总表（逐段）

| 段 | 依赖 | 就绪度 |
|---|---|---|
| ① Hero | 定位文案 + 成立年份 | ✅（⚠️ 年份待确认，缺失则不渲染侧栏） |
| **② 四个硬数字** | 产能 / 锻压吨位 / 出口市场 | **❌ 3 条待确认**（★ 用目录事替代后可解 4 条） |
| **③ 供应链坦白** | **自产 or 外购？** | **❌ 关键分叉** |
| **④ 三卡三图** | **工厂实景照片** | **❌ 无素材** |
| ⑤ 生产前确认 | 流程 | ✅（⚠️ 「生产照片」条视丰怀而定） |
| ⑥ 定位 | 文案（数据已就绪） | ✅ |
| **⑦ 质量证据** | **跳动 / 公差标准** | **❌ 待确认** |
| ⑧ 路由 | 已有页面 | ✅ |
| ⑨ CTA | 文案 + WhatsApp | ⚠️ 商务号 |

**→ 9 段里 4 段阻塞在丰怀工厂事实上（②③④⑦）。**

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180）—— 与 `/dealers` 一致 |
| 深色段 | **① Hero 深色** `bg-ink`（#0b0f16）；**⑤ 可深色**（对齐竞品段 4 `rgb(30,41,59)` → 用 `bg-panel`/`bg-graphite`）；其余浅色，**§④⑥ 用 `bg-soft` 交替** |
| 栅格 | ② 四数字 `grid-cols-2 lg:grid-cols-4`；④ 三卡 `grid-cols-1 md:grid-cols-3`；⑥ 两列 `grid-cols-1 md:grid-cols-2`（为谁 / 不为谁）；⑧ 三出口 `md:grid-cols-3` |
| 断点 | 重点 **768**（④ 三卡与 ⑥ 两列的临界）与 **390** |
| 动效 | 每段 `[data-reveal]`；②④ 用 `[data-reveal-group]` 错峰 80ms |
| 🔴 fail-visible | **不要自己加 `opacity-0`**（`globals.css:224-267`） |
| 标题 | `font-display` + uppercase + `tracking-[0.0xem]`；**数字也用 `font-display`** |
| 按钮 | `.btn-pill-solid` / `.btn-pill-outline` |

**★ 图片资产搬运步骤（本段 §④ 需要）**：

```
现状：public/images/ 只有 .gitkeep；assets/preview-media/ 有 factory.webp 等 20 个文件
步骤：① 从 assets/preview-media/ 挑选工厂实景（factory.webp 需核验是否丰怀实拍）
      ② 搬运至 public/images/factory/
      ③ 在 <TrustTriad> 里以显式 width/height 引用
⚠️ 代码零引用 assets/ —— 完全脱钩，是离线素材
⚠️ assets/preview-media/factory.webp 的来源必须核验：若是第三方（如航鹏）素材，不得当作丰怀工厂照
```

**★ 密度纪律**：**本页 73 字/段是全站最轻** —— **不要往段落里加字数**。
每段只放能证明「有工厂」的东西，**叙述性内容一律砍掉**。

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 就绪度 |
|---|---|---|---|
| **1** | **锻坯是自产还是外购？**（决定 ③ 是「坦白」还是「优势」） | **③ 全段** | ❌ **需丰怀确认（最关键）** |
| **2** | **月产能是多少只？** | ② 数字 | ❌ **需丰怀确认** |
| **3** | **锻压机吨位？**（语料「万吨」出自**航鹏画册**，第三方） | ② 数字 | ❌ **需丰怀确认 —— 不得直接用第三方数据** |
| **4** | **主力出口市场？** | ② 数字 | ❌ **需丰怀确认** |
| **5** | **检测标准**（跳动 / 公差具体值） | **⑦ 全段** | ❌ **需丰怀确认** |
| **6** | **工厂实景照片**（CNC 产线 / 图纸 / 车间） | **④ 三张图** | ❌ **无素材** |
| **7** | **是否有一体锻造能力**（语料说「具备」，需确认） | ③ + ② | ❌ **需丰怀确认** |
| **8** | **成立年份** | ① Hero 侧栏 | ❌ **需丰怀确认** |
| **9** | 是否有序列号刻印 | ⑦ | ⚠️ 需确认 |
| **10** | WhatsApp 商务号 | ⑨ | ❌ **需丰怀确认** |
| **11** | `/manufacturing` → `/capabilities` 改名 | ⑧ 路由出口 3 | ⚠️ 站点地图待执行 |
| **12** | `assets/preview-media/factory.webp` 来源核验 | ④ | ⚠️ 需确认非第三方 |

**🔴 语料陷阱（务必记牢）**：
> **「万吨锻造机」出自航鹏画册（第三方品牌）—— 不能当丰怀设备写。**
> **同源风险**：`assets/preview-media/factory.webp` 若同来自画册，亦不得当丰怀工厂照。

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 九段式 | `about-page.md` §1 + §4 |
| ① Hero `Factory-Backed` 定位 | `about-page.md` §0 |
| ② 四硬数字 → 换「目录事实」策略 | `about-page.md` §2.1 + §4.2 |
| ③ ★ 供应链坦白双模式分叉 | `about-page.md` §2.2 + §4.1 |
| ④ 三卡三图 | `about-page.md` §1（段 3）+ §4 |
| ⑤ 生产前确认清单 | `about-page.md` §3（段 4） |
| ⑥ 定位筛选 + 分工说明 | `about-page.md` §1（段 5）+ §5 |
| ⑦ 两个公差数字 | `about-page.md` §3（段 6）+ §2.1 |
| ⑧ 路由段 + 「接力」导语 | `about-page.md` §2.3 + §4 |
| ⑨ 收束 ≤40 字 → ≤80 字 | `about-page.md` §1（段 8）+ `content-design-and-new-pages.md` §1.1 |
| 「万吨锻造机」第三方陷阱 | `about-page.md` §2.1 + §7 #3 |
| 4 段阻塞 / 10 条待确认 | `about-page.md` §6 + §7 |
| 竞品底本 9 段 / 7,119px / 657 字 / 73 字每段 | `about-page.md` 附录 |
