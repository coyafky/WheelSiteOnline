# `/` 页面规格（首页 · 视口驱动版）

> **路由**：`/`
> **目标文件**：`src/app/page.tsx`（**改造** —— 现有 5 个组件，需增删并重排）
> **渲染**：静态（`export const dynamic = "force-static"` 或不声明）
> **数据**：`content/homepage-hero`（已含四线数据）· `content/process`（六道工序）
> `content/products`（需重写为四线）· `content/capabilities`（口径待重写）
> `content/company-stats`（全部占位）· `public/images/wheels/*.webp`（2757 张真图）
> **设计依据**：`DESIGN.md` §0.5（**视口驱动 = 全站第一原则，高于其余所有条目**）
> + `DEC-020`（一视口一核心问题 + 合并或删除律）· `DEC-021`（询盘组件落在一个视口内）
> · `DEC-022`（Hero 拆分）· `DEC-013`（无图不上架）· `DEC-014`（目录图只做单图）

---

## 0. 一句话（首页的本质判断）

**首页不是内容页，是「六个问题的连续回答」。**

**🔴 判据（`DESIGN.md` §0.5.2 合并或删除律）**：
每个视口存在的唯一理由是**它回答了一个前面没回答过的问题**。
首页的问题数 = 视口数 —— **不是段数**。十个回答同一问题的段，
不如两个回答不同问题的段。

**⚠️ 本规格的轴心是「视口 → 段 → 组件 → 内容」，不是「第 N 段」**（`DESIGN.md` §0.5.6）。
一份视口可以含多段，但**同视口内的段必须共同服务同一个问题**（§0.5.3）。

**⚠️ 现状偏差（必须纠正的定位问题）**：
- `content/homepage-hero.ts` 已纠偏（H1 = "Forged Wheels & Automotive Components"，`DEC-022`）✅
- 但 `content/products.ts` **仍是 3 个轮毂构造**（Monoblock / Two-Piece / Off-Road），
  **不是丰怀的四条产品线** → 第 02 屏数据源错误（见 §4.2）
- `content/capabilities.ts` 六格是**轮毂销售卖点**，且含**未确认承诺**（见 §2.03 处置）

---

## 1. 六屏骨架（用户定案）

**⚠️ 六屏 = 六个视口 = 六个问题，不是「六个段」。**

| 屏 | 核心问题 | 含哪些段 | 主要信息（1） | 主要视觉（1） | 主要行动（1） | 次要行动（0–2） | 现状 |
|---|---|---|---|---|---|---|---|
| **01** | **我们是谁** | Hero（单段） | 四条线的铝制部件制造商 | 深色 Hero 背景（3 张车图轮播） | `Explore products` → `/products` | `Request a quote` | ✅ 已重做（`DEC-022`） |
| **02** | **我们做什么** | 四线卡片网格（单段） | 四条平行产品线 | 四张等高产品线卡 | 进入某条线（卡内链） | `All products` → `/products` | ⚠️ 组件在，**数据是旧的轮毂三分类** |
| **03** | **做得好不好（实力）** | 工序条 + 质检证据（同视口多段） | 六道工序 + 检测记录 | 六道工序横向条（编号 + 标题） | `See the process` → `/capabilities` | — | ❌ **本屏不存在**，需新建 |
| **04** | **有什么可看（视觉）** | 轮毂精选带（单段） | 6 张真实轮毂图 | 轮毂图网格（1:1） | 点图 → `/products/wheels` | `View all 1018 →` | ❌ 现挂 `GalleryBand`（指向空页），需替换 |
| **05** | **选哪个（选型入口）** | 四条线选型导航（单段） | 「按什么维度选」四问 | 四条选型路径（文字 + 箭头） | 选一条路径 | — | ❌ **本屏不存在**，需新建 |
| **06** | **怎么开始（询盘）** | 收口 CTA（单段） | 一份报价请求 | 浅橙收口面（`bg-forge-soft`） | `Request a quote` → `/request-a-quote` | 邮件链接 | ✅ `<DealerCta>` 在，**默认文案是轮毂单线口径** |

**★ 每屏的主行动唯一** —— 六屏里**不允许出现第二个主 CTA 与主行动竞争同一次点击**
（`DEC-020`，Hero 的 7 个出口事故见 `DEC-022`）。

### 1.1 骨架图（每屏用什么组件）

```
/ （六个视口）
│
├─ 视口 01 "我们是谁" ──────────────────────────────────────── 深色
│   └── <HomeHero>                        ✅ 已有（home/hero/home-hero.tsx）
│         ├── <HeroBackground>              （3 张车图 + forge 辉光）
│         └── 两个 CTA：主 /products · 次 /request-a-quote
│
├─ 视口 02 "我们做什么" ────────────────────────────────────── 浅色
│   └── <ProductFamilyGrid density="compact">   ⚠️ 改造已有 <ProductShowcase> 的壳
│         └── <ProductLineCard> × 4              四条等高卡（同尺寸同权重）
│
├─ 视口 03 "做得好不好（实力）" ─────────────────────────────── 深色（承上启下）
│   ├── <section> 工序条
│   │     └── <ProcessStepStrip>          ❌ 新建（六道工序横向条，简化版）
│   └── <section> 质检证据（同视口第二段）
│         └── <QualityEvidenceNote>       ❌ 新建（质检要点 + 待确认占位，不编数字）
│
├─ 视口 04 "有什么可看（视觉）" ─────────────────────────────── 深色（图底）
│   └── <WheelStripSection>               ❌ 新建（替换 <GalleryBand>）
│         └── <WheelCard> × 6              真轮毂图 1:1，点图 → /products/wheels
│
├─ 视口 05 "选哪个（选型入口）" ─────────────────────────────── 浅色
│   └── <SelectionPathways>               ❌ 新建（四条选型路径）
│
└─ 视口 06 "怎么开始（询盘）" ───────────────────────────────── 浅橙（收口）
    └── <DealerCta title=… body=…>        ✅ 已有，⚠️ 默认文案需按四线口径传参
```

**⚠️ 视口 02 与视口 04 的边界（用户原话的落点）**：
> 用户：「我们的轮毂有展示页（**工厂的实力**轮毂等等），和**画廊**（衡多产品）」
- **「工厂实力」= 视口 03**（工序 / 质检 / 工厂）
- **「画廊」= 视口 04**（多产品视觉精选）
- **两者是两个不同视口，不得混**（用户明示）。

---

## 2. 逐屏规格

### 视口 01 —— 我们是谁（✅ 已就绪）

**结构**：单段 `<section min-h-svh>`，深色，左侧品牌块 + 右侧无（四卡已移出，`DEC-022`）。

| 项 | 内容 |
|---|---|
| 组件 | **`<HomeHero>`**（复用 `src/components/home/hero/home-hero.tsx`，已重做） |
| eyebrow | `heroCopy.eyebrow` = "Factory-direct automotive manufacturing" |
| H1 | `heroCopy.headingLines` = `["Forged Wheels", "& Automotive", "Components"]`（第 2 行 forge 橙） |
| 副题 | `heroCopy.supporting` = "Engineered for performance" |
| 正文 | `heroCopy.description`（≤2 句，四线 + B2B 对象） |
| 主 CTA | `.btn-pill-solid` → `/products`（`Explore products`） |
| 次 CTA | `.btn-pill-outline !text-white` → `/request-a-quote` |
| 背景 | `<HeroBackground slides={heroSlides}>` —— 3 张真车图（`/images/hero/hero-0{1,2,3}.webp`） |
| 高度 | `min-h-svh` + header 浮于其上（`DEC-022` 已修） |

```ts
// src/content/homepage-hero.ts —— 已存在，本屏消费
type HeroCopy = {
  eyebrow: string;
  headingLines: [string, string, string];   // 3 行（第 2 行橙色）
  supporting: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};
type HeroSlide = { id: string; image: string; alt: string; subject: string };
```

**用户在这一屏得到什么答案**：**「这家公司是谁、做什么的。」** 一句话读完。

**🔴 本屏不许出现什么**：
- ❌ **产品卡 / 产品线入口**（已移出，不得回来 —— `DEC-022`）
- ❌ 型号、数字、证书堆砌（那是 03/04 屏的事）
- ❌ 第二个主 CTA（主行动只有 1 个）
- ❌ 导航之外的第 4 个出口（出口上限 = 1 主 + 2 次）

**删除测试**：删掉它 → 用户不知道「这家公司是什么」，**没有答案替代** → **必须保留**。

**就绪度**：✅ 已有，无需改动。

---

### 视口 02 —— 我们做什么（⚠️ 组件在，数据错）

**结构**：单段，浅色。eyebrow + H2 + 一句 lede + **四条等高卡** + 一个次行动。

| 项 | 内容 |
|---|---|
| 组件 | **`<ProductFamilyGrid density="compact">`** —— ⚠️ **改造已有 `<ProductShowcase>` 的壳**（容器 + eyebrow + H2 + 网格），卡片抽成 `<ProductLineCard>` |
| eyebrow | `Product lines` |
| H2 | `Four lines, one factory` |
| lede | ≤1 句：轮毂是起点，同一套铝材 / 铸造 / 机加工能力跑四条线 |
| 卡片 | **恰好 4 条**：轮毂 / EV 三电 / 铝制品定制 / 安全轮胎 |
| 主行动 | **卡内链**（点卡 = 进入该线）—— 四条线各自 href |
| 次行动 | `All products` → `/products`（`.btn-pill-outline`） |
| 栅格 | ≥1024 → **4 列**；768 → 2 列；390 → 1 列（`items-stretch` 等高） |

```ts
// src/components/product-family-grid.tsx（与 /products 强制共用）
type ProductFamilyGridProps = {
  families: ProductFamily[];            // 恰好 4 条
  density?: "compact" | "roomy";        // ★ 首页传 "compact"，/products 传 "roomy"
  columns?: "auto" | 2 | 4;
  className?: string;
};

// src/components/product-line-card.tsx（由 <ProductShowcase> 的卡抽出）
type ProductLineCardProps = {
  family: ProductFamily;
  density?: "compact" | "roomy";
  className?: string;
};
```

**用户在这一屏得到什么答案**：**「这家公司具体做哪几条线。」** 一屏看全，不点也能数出四条。

**🔴 本屏不许出现什么**：
- ❌ **轮毂视觉权重高于其他三条** —— 四条卡**同尺寸、同字号、同交互、同图片规格**，
  **轮毂不设为其他三条的父级**（`products/index.md` §0 核心纪律）
- ❌ 用「1018 型号」把轮毂卡撑得比其他三卡重
- ❌ **列型号 / 放竞品型号图**（三条非轮毂线只有语料，`DEC-013` / `DEC-016`）
- ❌ 「推荐 / 热门」排序（无销量数据）
- ❌ 复述品牌定位（那是 01 屏）或工序（那是 03 屏）

**删除测试**：删掉它 → 用户不知道公司做几条线、点哪里看产品 → **必须保留**。

**⚠️ 数据阻塞（本屏唯一真问题，见 §4.2）**：
`content/products.ts` 现为 **3 个轮毂构造**（Monoblock / Two-Piece / Off-Road）——
**是竞品的切法，不是丰怀的四条线** → **必须重写为四线**，
否则本屏把「我们做什么」回答成「我们做三种轮毂」，与 01 屏自相矛盾。

**就绪度**：⚠️ 组件可复用，**数据源错误 → 阻塞**。

---

### 视口 03 —— 做得好不好（实力）❌ 本屏不存在，需新建

> **用户定案：选 B「先建立实力」** —— 在「有什么可看」之前，先回答「你做得行不行」。

**⚠️ 本屏 = 一个视口含两段（`DESIGN.md` §0.5.3）**：
- ① 六道工序条（**主视觉**）
- ② 质检证据摘要（**同视口的支撑段**）
两段**共同回答同一个问题**「做得行不行」，**不拆成两个视口**。

**结构**：

| 段 | 内容 | 组件 |
|---|---|---|
| 03-a 工序条 | eyebrow `Process` + H2 + 一句 lede + **六道工序横向条** | `<ProcessStepStrip>`（❌ 新建） |
| 03-b 质检证据 | 质检要点（≤4 条）+ **待丰怀确认占位** | `<QualityEvidenceNote>`（❌ 新建） |

**主信息**：六道工序 + 检测记录 → **「这家厂有一套可追溯的制造与质检流程。」**
**主视觉**：六道工序的**编号 + 标题**横向条（不用实拍图 —— `public/images/process/` 为空）。
**主行动**：`See the process` → `/capabilities`（`.btn-pill-outline`）。

**素材来源（现成，不得另编）**：`src/content/process.ts`

```ts
// src/content/process.ts —— 已存在，本屏消费
type ProcessStage = { step: string; title: string; body: string; image: string };

// processStages（六道工序，生产顺序）：
// 01 Engineering Review · 02 Forging · 03 CNC Machining
// 04 Finishing · 05 Quality Control · 06 Protective Packaging
```

**首页工序条 = `/capabilities` 的简化版**（**不是把整页搬来**）：
- `/capabilities` 用 `<ProcessExplorer>`（256 行，**客户端 tab 交互 + 每工序 location/guards 明细**）
- 首页只用 **`step` + `title`** 两项，最多加**一个字的动词**；**不搬 `body` 全文**、
  **不搬 `processStageNotes`（location/guards）**、**不做 tab 交互**
- 理由：首页是「有没有这套流程」的判断，`/capabilities` 才是「每步具体做什么」的展开

```ts
// src/components/process-step-strip.tsx（建议路径）
type ProcessStepStripProps = {
  stages: Pick<ProcessStage, "step" | "title">[];  // 首页只吃这两项
  href: string;              // "/capabilities"
  linkLabel: string;         // "See the process"
  className?: string;
};
```

**质检证据段（03-b）的处置 —— 诚实纪律**：

| 数据 | 现状 | 首页可否用 |
|---|---|---|
| `processQuality.points`（4 条检测要点） | ✅ 可用（无数字） | ✅ **用**（取前 3–4 条，不含占位项） |
| `processQuality.points[4]`（实验室/公差） | ⏳ Pending confirmation | ❌ **不用** |
| `processHardEvidence.items`（runout / 公差 / 认证） | 全部 `"⏳ Pending confirmation"` | ❌ **一条都不用**（`process.ts` 明注「未确认的数字比缺数字更糟」） |
| `processQualityBoundary`（不主张未持有的认证） | ✅ 文字边界声明 | ⚠️ 可选（首页写长，留给 `/capabilities`） |
| `content/company-stats.ts`（产能/厂房/年限） | 全部 `isPlaceholder: true` | ❌ **不用**（`company-stats` 明注「全占位则整段不上线」） |

**🔴 本屏不许出现什么**：
- ❌ **任何未由丰怀确认的数字** —— 交期 / 产能 / 公差 / 认证 / 厂房面积
  （`process.ts`、`company-stats.ts`、`site.ts` 三处都写着"待确认"）
- ❌ 把六道工序的 `body` 全文搬来（那是 `/capabilities` 的活）
- ❌ 复制 `<ProcessExplorer>` 的 tab 交互（首页不做交互，只做陈述）
- ❌ 在 03-b 放第二套 CTA 与 03-a 的主行动竞争
- ❌ 认证 logo 墙

**删除测试**：删掉它 → 用户只知道「做四条线」，不知道「做得好不好」，
**在「有什么可看」之前缺了可信度答案** → **必须建**（用户选定「先建立实力」）。

**就绪度**：❌ **需新建两个组件**（`<ProcessStepStrip>` + `<QualityEvidenceNote>`）；
数据大部分现成（`process.ts`），**但必须剔除全部 `Pending confirmation` 占位项**。

---

### 视口 04 —— 有什么可看（视觉精选带）❌ 需替换 `GalleryBand`

> **用户定案 A：用 `public/images/wheels/*.webp` 真轮毂图做精选带，
> 不依赖 `/gallery`（本阶段不做，见 `PAGE-SPECS/index.md` §1 暂缓表）。**

**结构**：单段，深色（图底）。eyebrow + 一行标题 + **6 张真轮毂图** + 快速入口。

| 项 | 内容 |
|---|---|
| 组件 | `<WheelStripSection>`（❌ 新建）+ `<WheelCard>`（复用于目录/系列/单品页） |
| eyebrow | `Range`（受控词汇，见 `DESIGN.md` §1.4） |
| 标题 | 一行，≤ 12 字 |
| 主视觉 | **6 张轮毂图**，**1:1 正方**，`object-fit: contain`（`DEC-014`） |
| 主行动 | **点图** → `/products/wheels`（整卡可点） |
| 次行动 | `View all 1018 models →` → `/products/wheels` |
| 栅格 | ≥1024 → 3 列 × 2 行 或 6 列 × 1 行；768 → 2 列；390 → 2 列紧凑 |

```ts
// src/components/wheel-strip-section.tsx（建议路径）
type WheelStripSectionProps = {
  models: WheelCardProps[];      // 6 个（见下方选图逻辑）
  href: string;                  // "/products/wheels"
  linkLabel: string;             // "View all 1018 models"
  columns?: 3 | 6;
};
```

**★ 选图逻辑建议（不许手挑 2757 张）**：
1. **来源**：`public/images/wheels/*.webp`（**实测 2757 张**，文件名 = 产品代码，
   `DEC-012` / `DEC-018`）
2. **确定性规则**（可复现，不手挑）：
   - 按 `sizeCategory` **各尺寸桶取 1 张**（覆盖 15–20 寸的广度），或
   - **按文件名自然排序 + 固定步长抽取**（如每 `floor(2757/6)` 张取 1 张）
   - ⚠️ **推荐前者**（尺寸桶抽样）：视觉上更能体现「多产品」，
     且天然避开同尺寸重复。**写入构建期脚本或 `content` 常量，禁手改**。
3. **`alt` 模板**：`1081X 轮毂 — 15×7 · 4×100 · 旋压`（**不得写 `product-1.webp`**）
4. **首屏 6 张可 `priority`**，其余 `lazy` + 显式宽高防 CLS

**⚠️ 如实说明图片限制（`DEC-014`）**：
> 这些图是**目录图**（命名即产品代码），**不是商业精修照**。
> 因此本屏**不做整屏轮播、不做放大精修展示** —— 用法是**网格缩略（1:1 contain）**，
> 让「多」说话，而不是让「精」说话。**我们的强项是规格，不是摄影。**

**🔴 本屏不许出现什么**：
- ❌ **`object-fit: cover`** —— 轮毂是圆的，cover 会切掉边缘（`DEC-014`）
- ❌ 指向 `/gallery`（本阶段不做，点进去是空页 —— 见 §2.04 处置）
- ❌ 车图 / 场景图（那是 01 屏；本屏是**产品视觉**）
- ❌ 型号文字过多（图是主角；型号名可省或极小）
- ❌ 与 03 屏重复讲工序（本屏只回答「有什么可看」）

**删除测试**：删掉它 → 用户看不到任何**真实产品**，四条线只剩文字 → **必须保留**
（这是首页**唯一**展示真实轮毂的地方）。

**就绪度**：⚠️ **素材就绪（2757 张真图已在 `public/`），但组件需新建**。

---

### 视口 05 —— 选哪个（选型入口）❌ 本屏不存在，需新建

> **⚠️ 本屏必须与视口 06（怎么开始）区分清楚**：
> **05 回答「我该选哪条线 / 哪个型号」；06 回答「怎么联系、怎么下单」。**
> 05 是**判断**，06 是**动作**。

**结构**：单段，浅色。一句引导 + **四条选型路径**（按「你怎么描述需求」分流）。

| 项 | 内容 |
|---|---|
| 组件 | `<SelectionPathways>`（❌ 新建；可内联到页面，仅本页用） |
| eyebrow | `Guide`（受控词汇） |
| 标题 | 「不确定从哪开始？」（≤ 10 字） |
| 四条路径 | ① 按车型 / 尺寸选轮毂 → `/products/wheels` ② 按图纸 / 样件做铝件 → `/products/custom-aluminum` ③ 按电机 / 电池壳体需求 → `/products/ev-components` ④ 按渠道 / 贴牌合作 → `/dealers` |
| 主行动 | **选一条路径**（= 点击对应链接） |
| 次行动 | 无（本屏不重复 06 的询盘 CTA） |

```ts
// 可内联，或 src/components/selection-pathways.tsx
type SelectionPath = {
  index: string;      // "01"
  label: string;      // "按车型 / 尺寸选轮毂"
  hint: string;       // ≤ 20 字
  href: string;
};
type SelectionPathwaysProps = { paths: SelectionPath[] };  // 恰好 4 条
```

**用户在这一屏得到什么答案**：**「我这单该走哪条线 / 点哪里。」**

**🔴 本屏不许出现什么**：
- ❌ **放询盘表单 / 放主 CTA「获取报价」** —— 那是 06 屏，本屏若放就是**同一意图的第二出口**
  （正是 `DEC-022` 里 Hero「两出口争同一次点击」的错误）
- ❌ 列出多于 4 条的路径（一屏一个问题，路径多了就是索引页）
- ❌ 复述四条线是什么（那是 02 屏）—— 本屏讲的是**「怎么选」，不是「有什么」**
- ❌ 编数字（如「按 1018 型号选」可，但不得编不存在的规模口径）

**删除测试**：删掉它 → 用户知道「有哪四条线」（02）却不知道**「我这单走哪条」** →
**在 02 与 06 之间缺了「分流」这一跳** → **必须建**。
⚠️ 若判定 02 屏的卡内链已足够分流，本屏可与 02 **合并**（`§0.5.2`）——
**但用户已定案 6 屏，故本屏独立保留**，以「按需求类型（而非产品类型）」重新分流为存在理由。

**就绪度**：❌ **需新建**（结构简单，可内联实现）。

---

### 视口 06 —— 怎么开始（询盘）✅ 组件在，文案需传参

**结构**：单段，浅橙（`bg-forge-soft`，全站唯一强调面）。标题 + ≤80 字 + 主 CTA。

| 元素 | 内容 |
|---|---|
| 组件 | **`<DealerCta title={…} body={…}>`**（复用 `sections/dealer-cta.tsx`，21 处在用） |
| 目标 | `Request a quote` → `/contact`（⚠️ 组件内硬编码 `/contact`，见下） |
| 文案 | **≤ 80 字**（`DESIGN.md` §2.2 收口律） |
| eyebrow | 组件内固定 `Dealer enquiries`（⚠️ 可与四线口径不一致，见下） |
| 辅助 | 邮件链接（`site.contact.email`，⚠️ `confirmed: false` 待确认） |

**⚠️ 现状问题（本屏要处置的）**：
`<DealerCta>` 默认文案是**轮毂单线口径**：
```ts
title = "Open a forged wheel line with us"
body  = "Send us your target fitments and volumes. We will come back with a
         specification, a production window and pricing."
```
→ 与**四条产品线**定位不符（首页不是「开一条锻造轮毂线」）。
**且 `body` 里的 "a production window" 暗示交期承诺**，而交期是**待确认项**
（`STATUS.md` / `dealers-page.md:96,334`）。

**处置**：**组件不改**，首页**传参覆盖** `title` / `body` 为四线口径（无数字）：
```tsx
<DealerCta
  title="Start with one message"
  body="Send the vehicle, the drawing or the brief. We reply with a
        specification and the next step — no account required."
/>
```
⚠️ **`eyebrow` "Dealer enquiries" 与邮件链接在组件内硬编码** —— 若首页要改，
需给 `<DealerCta>` 增两个可选 props（`eyebrow?` / `showEmail?`），**见 §3.2**。

**用户在这一屏得到什么答案**：**「怎么开始、点哪里联系。」**

**🔴 本屏不许出现什么**：
- ❌ 第二个 CTA（表单前后不得放第二个主行动 —— `DEC-021` 推论）
- ❌ 弹窗 / 浮层推销（`README` §3.2）
- ❌ 交期 / 报价数字（未确认）
- ❌ 复制 05 屏的选型内容

**删除测试**：删掉它 → 用户没有转化入口 → **必须保留**（`index.md` §4 全局纪律 #1）。

**就绪度**：✅ 组件在；⚠️ 默认文案需传参覆盖（不改组件即可上线，改 eyebrow/email 可选）。

---

## 3. 组件清单

### 3.1 复用已有（标真实路径）

| 组件 | 路径 | 用于 | 处置 |
|---|---|---|---|
| **`<HomeHero>`** | `src/components/home/hero/home-hero.tsx` | 01 | ✅ **直接复用**（已按 `DEC-022` 重做） |
| `<HeroBackground>` | `src/components/home/hero/hero-background.tsx` | 01 | ✅ 直接复用 |
| **`<DealerCta>`** | `src/components/sections/dealer-cta.tsx` | 06 | ✅ 复用，**传参覆盖默认文案** |
| **`<ProductShowcase>`** | `src/components/sections/product-showcase.tsx` | 02 | ⚠️ **改造**：拆壳（容器 + eyebrow + H2 + 网格）↔ 卡，抽出 `<ProductLineCard>`；壳改名 `<ProductFamilyGrid>` 或保留壳 + 新组件 |
| `<ProcessExplorer>` | `src/components/process-explorer.tsx`（256 行） | — | ❌ **本页不用**（属 `/capabilities`；首页只做简化条） |
| `<WheelSketch>` | `src/components/wheel-gallery.tsx` | 04 | ❌ 不用（本阶段有真图；无图型号不上架，`DEC-013`） |
| `<ProductCard>` | `src/components/product-card.tsx`（97 行） | 02 | ⚠️ 服务于轮毂分类，**不直接复用**（四线卡是新形态，见 §3.3） |

### 3.2 需改造已有（标改动）

| 组件 | 文件 | 改动 |
|---|---|---|
| **`<DealerCta>`** | `sections/dealer-cta.tsx` | ① **默认文案可选**（首页传 `title`/`body`）② 可选增 `eyebrow?: string` 与 `showEmail?: boolean` 两个 props（首页若需四线口径的 eyebrow / 隐藏未确认邮箱）—— **不破坏 21 处既有用法** |
| **`<ProductShowcase>`** | `sections/product-showcase.tsx` | 拆成「壳 + 卡」两层：壳的 eyebrow/H2/lede/容器保留，卡抽为 `<ProductLineCard>`；数据源从 `heroProducts` 切到**四条线**（见 §4.2 数据重写） |

### 3.3 需新建（标建议路径 + 职责）

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<ProductFamilyGrid>`** | `src/components/product-family-grid.tsx` | 02 四线等高栅格 | **2 页**（`/` + `/products`）★ **强制共用** |
| **`<ProductLineCard>`** | `src/components/product-line-card.tsx` | 02 单条线卡（从 `<ProductShowcase>` 抽出） | 2 页 |
| **`<ProcessStepStrip>`** | `src/components/process-step-strip.tsx` | 03 六道工序横向条（简化版） | **2 页**（`/` + `/capabilities` 可用同一形态） |
| **`<QualityEvidenceNote>`** | **内联到页面即可** | 03 质检要点（无数字） | 仅本页 |
| **`<WheelStripSection>`** | `src/components/wheel-strip-section.tsx` | 04 轮毂真图精选带 | 仅本页 |
| **`<WheelCard>`** | `src/components/wheel-card.tsx` | 04 单张轮毂卡（1:1 contain） | **4 处**（目录 + 单品相关 + 系列 + 首页精选，`index.md` §2.1 🔴4） |
| **`<SelectionPathways>`** | **内联到页面即可** | 05 四条选型路径 | 仅本页 |

**★ 提取纪律**：
1. `<ProductFamilyGrid>` + `<ProductLineCard>` —— 首页与 `/products` 共用 → **第一天进 `src/components/`**
2. `<WheelCard>` —— 首页 + 目录 + 单品 + 系列（4 处）→ **必须提取**（`index.md` §2.1）
3. `<ProcessStepStrip>` —— 首页与 `/capabilities` 形态一致 → **提取**

**❌ 本轮下线**：`<GalleryBand>`（`src/components/sections/gallery-band.tsx`）——
它指向 `/gallery`（本阶段不做，无素材），**点进去是空页** → 由视口 04 的
`<WheelStripSection>` 取代。**代码保留**（`/gallery` 路由仍可用），**仅首页不再挂载**。

---

## 4. 数据契约

### 4.1 本页消费的类型

```ts
// src/content/types.ts
type Capability   = { index: string; title: string; body: string };   // 03（若用）
type ProcessStage = { step: string; title: string; body: string; image: string }; // 03
type ProductFamily = {
  slug: string; name: string; summary: string; highlights: string[];
  hasRender: boolean; image: string; hoverImage?: string; href: string;
};                                                                    // 02
type HeroProduct = { id: string; title: string; subtitle: string; description: string;
                     href: string; image: string };                    // 02（现数据源）
```

### 4.2 数据来源一览（⚠️ 含缺口）

| 屏 | 数据模块 | 现状 | 缺口 |
|---|---|---|---|
| 01 | `content/homepage-hero.ts`（`heroCopy` / `heroSlides`） | ✅ 已就绪 | 无 |
| 02 | `content/products.ts`（`productFamilies`） | ⚠️ **仍是 3 个轮毂构造**（Monoblock/Two-Piece/Off-Road） | 🔴 **必须重写为 4 条线**（`wheels`/`ev-components`/`custom-aluminum`/`safety-tires`） |
| 02 | `assets/preview-media/*.webp` → `public/images/products/family-*.webp` | 🔴 **`public/images/products/` 为空** | 需搬 4 张代表图（同比例） |
| 03 | `content/process.ts`（`processStages` 六道工序） | ✅ 存在 | 剔除 `Pending confirmation` 占位项 |
| 03 | `content/company-stats.ts`（产能/厂房） | ⚠️ **全部 `isPlaceholder: true`** | ❌ **不用**（全占位不上线） |
| 04 | `public/images/wheels/*.webp` | ✅ **实测 2757 张真图在 `public/`** | 需**确定性选图规则**（脚本/常量，非手挑） |
| 04 | `content/wheel-skus.ts` | ⚠️ 仅 16 个示意 SKU（克隆残留） | 真目录在 `assets/wheel-data/`，**未接入 `src/`** |
| 05 | 内联数组（四条选型路径） | ❌ 不存在 | 新建（可内联页面） |
| 06 | `<DealerCta>` props（传参） | ✅ 可传参 | 默认文案需覆盖 |

### 4.3 旧版 `capabilities.ts` 的处置（**本规范不采用其六格**）

**现状**（`content/capabilities.ts`）六格：
`01 Tailored Fitment` · `02 Deep Concave Profiles` · `03 Factory Direct` ·
`04 Custom Finishes` · `05 Branded Accessories` · `06 Reliable Lead Time`

**⚠️ 两个真问题**：
1. **口径不是「工艺能力」，是「轮毂专线的销售卖点」** —— 与四条产品线冲突
   （"Deep Concave Profiles" / "Tailored Fitment" 全是轮毂语境）
2. **含未确认承诺**：`06 Reliable Lead Time: "20–30 day production windows"`
   —— `STATUS.md` 与 `dealers-page.md:96,334` 明确「20–30 天**待丰怀确认**，
   我们不写 20-30 天除非确认」→ **不得作为已确认事实发布**

**处置（三选一，本规范建议 ③）**：

| 方案 | 做法 | 评价 |
|---|---|---|
| ① 原地重写 | 六格改写为「制造 + 质量」通用口径（工艺/材料/检测/一致性），剔除交期 | 与 `/capabilities` 争用同一份数据，且首页 03 屏已用 `process.ts` → **重复** |
| ② 合并进 03 屏 | 删掉独立六格，内容并入 `<ProcessStepStrip>` + `<QualityEvidenceNote>` | ✅ 符合「合并或删除律」 |
| ③ **本页整段不用 `<TrustStrip>`**（★ 推荐） | 首页 03 屏改用 `process.ts` 的六道工序（更贴「实力」），`<TrustStrip>` **不在首页挂载** | ✅ 一个视口一个主视觉，不并列两个「六格带」 |

**⚠️ 无论选哪个，`capabilities.ts` 的 `Reliable Lead Time`（20–30 天）必须删除或标注待确认。**

**📌 更正（2026-10-02 实测）**：早先本文件写「这是全站唯一把未确认交期写死成事实的地方」，
**该表述不准确**。「20–30 天」实际出现在 **3 处**：

| 文件 | 位置 |
|---|---|
| `content/capabilities.ts:39` | TrustStrip 六格之一 |
| `content/faq.ts:18` | FAQ 的生产周期 |
| `content/site.ts:38` | `site.leadTime`（**全局字段，可能被多页引用**） |

→ **本屏的处置只是其中一处**。三处应**一并复核**（`site.leadTime` 影响面最大，
先查它被哪些页吃），否则会「首页改了、别处还在承诺」。
（`site.ts` 的 `leadTime: "20–30 days"` 也标着 "Confirm before launch"，
同为待确认项。）

**🔴 诚实标注**：本规范**不要求**首页采用 `<TrustStrip>`；若 03 屏采用
`process.ts` 素材，则 `capabilities.ts` 的六格在首页**不出现** —— 避免与 03 屏
「再讲一遍能力」形成重复（`§0.5.2`）。

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | 01 `.container-fh`（1180）｜02 `.container-fh`｜03 `.container-fh`｜04 `.container-fh-wide`（1440）｜05 `.container-fh`｜06 自带 |
| 深色段 | **01 深色**（`bg-hero`）｜**03 深色**（承上启下）｜**04 深色**（图底）｜02 05 浅色｜06 浅橙 |
| ⚠️ 深色上限 | **深色视口 ≤ 3**（01 / 03 / 04）—— `DESIGN.md` §1.2「深色 = 入口，不是背景」 |
| 段间 | `border-b border-border` 交替 `bg-white` / `bg-soft`（浅色视口之间） |
| 断点 | 02 ≥1024 四列 / 768 两列 / 390 一列｜04 ≥1024 三或六列 / 768 两列 / 390 两列紧凑｜03 ≥1024 六列横排 / 768 三列 / 390 两列 |
| 卡片图 | 02 四线图 **同比例**；04 轮毂图 **1:1 `object-fit: contain`**（`DEC-014`） |
| 动效 | 各视口 `[data-reveal-group]`，`--motion-stagger-step` 80ms；**格数上限 8**（`DESIGN.md` §1.5 `Math.min(index,8)`） |
| 🔴 fail-visible | **组件内不得自加 `opacity-0`** —— 仅 `html[data-motion-armed]` 下隐藏（`globals.css:224-267`） |
| 高度 | 全页目标 **≈ 6 屏**（每视口 ≈ 1 屏）；**不得**把 `/capabilities` 的长内容搬进 03 屏 |

---

## 6. 待补与阻塞

| # | 事项 | 阻塞屏 | 归属 |
|---|---|---|---|
| 1 | 🔴 **`content/products.ts` 重写为四条线**（现为 3 个轮毂构造） | **02** | 施工方（同步 `products/index.md` §4.2） |
| 2 | 🔴 **四条线代表图搬运**（`assets/preview-media/` → `public/images/products/family-*.webp`，`public/images/products/` 现为空） | 02 视觉 | 视觉 |
| 3 | 🔴 **`capabilities.ts` 的 `Reliable Lead Time`（20–30 天）** 是待确认项，**不得发布** | 03 / 全站口径 | 内容 + 丰怀确认 |
| 4 | **03 屏两个新组件**（`<ProcessStepStrip>` + `<QualityEvidenceNote>`） | **03** | 施工方 |
| 5 | **04 屏选图规则**（2757 张的确定性抽样，禁手挑） | **04** | 视觉 + 施工方 |
| 6 | **05 屏组件**（`<SelectionPathways>`，可内联） | **05** | 施工方 |
| 7 | **`<WheelCard>` 提取**（4 处复用，`index.md` §2.1） | 04 | 施工方 |
| 8 | **`<DealerCta>` 是否增 `eyebrow` / `showEmail` props** | 06 | 施工前拍板 |
| 9 | 🔴 **安全轮胎线品牌归属未定**（`DEC-017`）→ 02 屏第 4 卡可否上线 | 02 第 4 卡 | 决策（最高优先） |
| 10 | **`/products/wheels` 现无筛选器**（实测 `page.tsx` 182 行，无 filter 实现）→ 04 / 05 屏「点进去」后落到的页面**还不是筛选体验** | 04 / 05 的落点 | 见 `products/wheels.md` §6 阻塞 #1 |
| 11 | `site.ts` 的 `leadTime` / `contact.confirmed` 均为待确认 | 06 | 内容 + 丰怀确认 |
| 12 | **`<GalleryBand>` 下线**（指向空页 `/gallery`）需在 CHANGELOG 记录 | 04 | 施工方 |

---

## 附：与设计文档的对应

| 本规格的条目 | 设计依据 |
|---|---|
| 一视口一核心问题（六屏六问） | `DESIGN.md` §0.5.1 + `DEC-020` |
| 每屏「删除测试」 | `DESIGN.md` §0.5.2（合并或删除律） |
| 03 屏 = 一视口含两段 | `DESIGN.md` §0.5.3（视口可含多段） |
| 06 屏表单/CTA 唯一 | `DESIGN.md` §0.5.4 + `DEC-021` |
| 01 屏品牌独占一屏 | `DEC-022`（Hero 拆分） |
| 02 屏四条线平行、轮毂不突出 | `products/index.md` §0 + README §0① 地基条款 |
| 03 屏六道工序来源 | `content/process.ts`（`processStages`） |
| 03 屏不编数字 | `process.ts` / `company-stats.ts` / `site.ts` 三处 "Pending confirmation" |
| 04 屏轮毂目录图用法 | `DEC-014`（目录图非精修照）+ `DEC-012`（文件名即产品代码） |
| 04 屏 1:1 contain | `DEC-014`（cover 会切掉圆的边缘） |
| 无图不上架 | `DEC-013` |
| 三条非轮毂线不列型号 | `DEC-016` + README §3.1（型号 ❌） |
| 结尾 CTA ≤80 字 | `DESIGN.md` §2.2 收口律 |
| 深色 ≤3 处、白/soft 交替 | `DESIGN.md` §1.2 |
| fail-visible 动效纪律 | `DESIGN.md` §1.5 + `_components.md` §1.5 + `globals.css:224-267` |
| 每页必须有询盘入口 | `PAGE-SPECS/index.md` §4 全局纪律 #1 |
