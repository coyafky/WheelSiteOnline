# `/products` 页面规格（产品中心 · 四条线平行入口）

> **路由**：`/products`
> **目标文件**：`src/app/products/page.tsx`（**重建** —— 现有页面是竞品的
> monoblock / two-piece / off-road 三分类，不是丰怀的四条线）
> **渲染**：静态（`export const dynamic = "force-static"` 或不声明）
> **数据**：`src/content/products.ts`（需重写为四条线）+ `src/content/faq.ts`
> **设计依据**：`../../ARCHITECTURE/page-architecture/README.md` §2.2
>
> **本规格版本**：v2（2026-10-02）—— 由「三段式」升级为**视口驱动**。
> v1 的三段（总览 / 简介 / 询盘）是**内容块清单**，不是视口切分；
> v2 补 §0.5，把 7 个实际段收敛为 **3 个视口**。见 §0.5.3 的对照表。

---

## 0. 一句话

**这是四条产品线的平行入口页，不是「轮毂目录」。**

**🔴 全页只有一条纪律：轮毂的视觉权重不得高于其他三条。**
四条卡**同尺寸、同字号、同交互、同图片规格** —— 轮毂可以有更多子类，
**但不设为其他三条的父级**（README §0① 地基条款）。

**⚠️ 重建而非改文案** —— 现有 `products.ts` 的 3 个 family 是竞品切法，
**必须整个替换**。见 §4.2。

---

## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5：**一个视口 = 一个核心用户问题**；
> §0.5.2 **合并或删除律**：「如果两个连续 Section 没有回答两个不同的问题，
> 则应合并或删除」；§0.5.4 **询盘组件必须完整落在一个视口内**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**（`src/app/products/page.tsx`，2026-10-02 实测）：页面有 **7 个 `<section>`**：

| # | section | `aria-labelledby` | v1 规格提到过吗 |
|---|---|---|---|
| 1 | 页头 | `products-title` | ⚠️ 被并入 ① 的容器 |
| 2 | 产品族卡 | `families-title` | ✅ ① |
| 3 | **SKU 提示** | `sku-callout-title` | ❌ **v1 未提** |
| 4 | 选型指引 | `guidance-title` | ✅ 被 v1 点名删除 |
| 5 | Fitment 支持 | `fitment-title` | ✅ 被 v1 点名删除 |
| 6 | **资源** | `resources-title` | ❌ **v1 未提** |
| 7 | FAQ | `faq-title` | ✅ 被 v1 点名删除 |

**🔴 v1 的两处失实**：v1 §1 写「现有 `/products` 页面是
『hero → guidance → route cards → fitment support → FAQ → closing CTA』六段」——
**实测是 7 段，且段名与实测不符**（没有 `route cards`/`closing CTA` 这两个
`aria-labelledby`，多出 `sku-callout` 与 `resources`）。
**施工时以本表实测为准，不要沿用 v1 的段描述。**

### 0.5.2 三个视口（本页定案）

| 视口 | 核心问题（一句话） | 含哪些段 | 主要信息（1） | 主要视觉（1） | 主要行动（1） | 次要行动（0–2） |
|---|---|---|---|---|---|---|
| **01** | **你们做哪几条线？** | 页头 + 四条线卡（**同视口两段**） | 四条平行产品线 | 四张等高产品线卡 | 进入某条线（卡内链） | 无 |
| **02** | **哪条线适合我的需求？** | 各线简介（单段） | 每条线：做什么 / 给谁 / 怎么合作 | 一列四项文本 | 进入该线 | 无 |
| **03** | **不确定该选哪条，怎么办？** | 询盘收口（单段） | 一句话降门槛 | `bg-forge-soft` 橙底 | `Request a quote` → `/request-a-quote` | 邮箱文字链 |

**⚠️ 视口 01 为什么允许两段**（不违反 §0.5.1）：
页头**不独立回答问题** —— 它只是 ① 的标题，与四卡同属「你们做哪几条线」。
`DESIGN.md` §0.5.3 明确「页头并入首屏」不算第二个问题。
**但页头不得自带第二个 CTA**（否则与卡内链争同一次点击，即首页 Hero 的
7 出口事故，见 `DEC-022`）。

### 0.5.3 ★ 从 7 段到 3 视口：处置表

| 现段 | 问题（§0.5.1） | 处置 | 理由 |
|---|---|---|---|
| ① 页头 | 无独立问题 | **并入视口 01** | 与四卡同问题 |
| ② 产品族卡 | ✅ **我们做哪几条线** | **保留为视口 01 主视觉** | — |
| ③ SKU 提示 | 答「有多少型号」 | 🗑️ **删除** | 与视口 01 同问题，且是**轮毂单线**口径，破坏四线平行（§0 核心纪律） |
| ④ 选型指引 | 答「哪条线适合我」 | 🔀 **升级为视口 02**（与 ⑤ 各线简介合并） | 两者同问题 —— 正是 §0.5.2 合并律的适用场景 |
| ⑤ Fitment 支持 | 答「怎么装」 | 🗑️ **删除** | 属**单品页/车型页**的问题，不是「我要选哪条线」；放这里会与视口 02 争同一次点击 |
| ⑥ 资源 | 答「有资料吗」 | 🗑️ **删除** | 属 `/resources`；本页无此问题 |
| ⑦ FAQ | 混合（选型 + 合作 + 物流） | 🗑️ **删除**，选型类问题并入视口 02 | FAQ 是**多问题容器**，天然违反一视口一问题；`/products` 不需要它 |

**🗑️ 删除 4 段、🔀 合并 1 段、保留 2 段（页头 → 并入 + 卡段）→ 3 视口。**

### 0.5.4 全页高度预算

| 视口 | 目标高度 | 说明 |
|---|---|---|
| 01 | ≈ 1 屏（`min-h-svh` 不强制） | 页头 + 四卡；四卡在 1440 应一行放下 |
| 02 | ≈ 0.8 屏 | 四条简介，文本段收窄 |
| 03 | ≈ 0.5 屏 | 收口，**询盘组件必须完整落在视口内**（§0.5.4 硬规则） |

**合计目标 ≈ 2.3 屏。** v1 未给高度预算 —— v2 补上，因为「删 4 段」这个
动作需要有量化目标才能验收（否则容易删了段、留了空白）。

---

## 1. 页面骨架（三视口）

| 视口 | 内容块 | 必须性 | 说明什么 |
|---|---|---|---|
| **01** | 页头 + 四条线总览 | 必须有 | 平行四卡，每卡一句定位 + 一个代表图 |
| **02** | 各线简介 | 必须有 | 每条线 2–3 句：做什么 / 给谁 / 怎么合作 |
| **03** | 询盘入口 | 必须有 | 不确定该选哪条的，直接进获取报价 |

```
/products （3 个视口）
│
├─ 视口 01 "你们做哪几条线？" ─────────────────────── 浅色
│   ├── 页头（eyebrow + H1）                        ← 并入本视口，不单独成段
│   └── <ProductFamilyGrid>   ★  → <ProductCard> × 4（等高、同规格）
│
├─ 视口 02 "哪条线适合我的需求？" ─────────────────── 浅色
│   └── <FamilyBriefList>     每条线 2–3 句 + 「进入该线」链接
│
└─ 视口 03 "不确定该选哪条，怎么办？" ─────────────── 浅橙（收口）
    └── <DealerCta>
```

**⚠️ 三视口就是三视口。** 实测现有 `/products` 是 **7 个 `<section>`**
（见 §0.5.1 实测表）—— 那是竞品的产品中心底本，与我们的定位冲突
（它把轮毂三分类当主角）。
**重建时按 §0.5.3 处置表执行：删 4 段、合并 1 段、保留 2 段。**
**特别是 `sku-callout` 与 `resources` 两段** —— v1 规格没提它们，
但它们同样必须删（理由见 §0.5.3）。

---

## 2. 逐块规格

### ① 四条线总览（**本页唯一样式重点**）

**布局**：`.container-fh-wide` 内 CSS Grid，**四条卡等高**

| 断点 | 列数 |
|---|---|
| ≥1024 | **4 列**（一行四条，强调平行） |
| 768 | 2 列 |
| 390 | 1 列 |

**卡片结构**（`<ProductCard>`，**复用已有，需扩 props**）：

```
┌────────────────────────┐
│  代表图 4:3             │  ← ⚠️ 四张图必须同比例、同留白口径
│  WebP / lazy           │
├────────────────────────┤
│ WHEELS                 │  ← eyebrow（英文线名，font-display）
│ 轮毂                    │  ← 线名（H3）
│ 15–23 英寸 · 旋压/低压/锻造│  ← 一句定位（≤30 字）
│ 进入 →                 │  ← 链接
└────────────────────────┘
```

**props 契约**：

```ts
// src/components/product-card.tsx —— 已有文件（97 行），需扩 2 个可选字段
type ProductCardProps = {
  family: ProductFamily;
  className?: string;
  /** ★ 新增：卡片尺寸变体。本页用 "uniform"，保证四卡等高 */
  variant?: "default" | "uniform";
  /** ★ 新增：是否显示「进入 →」底栏 */
  showFooterLink?: boolean;
};
```

**⚠️ 现有 `<ProductCard>` 是为「轮毂分类」设计的**（有 highlights 展开、hoverImage 换图）。
用于本页时要检查两条：
1. **高度是否由内容撑开** → 四条线文案长短不一会导致不等高 → `variant="uniform"` 强制 `min-h` + `items-stretch`
2. **hover 换图**：四条线只有轮毂有第二张图 → 其他三条 `hoverImage` 缺省时**不得留空白位**（现状 `hasRender` 已处理降级，需复核）

**🔴 禁止项**：
- ❌ 把轮毂卡做大、其他三条做小（**违反 §0 核心纪律**）
- ❌ 在轮毂卡上放「1018 型号」这类**量化诱惑**而其他三卡只有一句话（同罪）
- ❌ 给四条线做「推荐」「热门」排序（我们没有销量数据）
- ❌ 轮毂卡用产品实拍图、其他三卡用图标（**图片规格必须平行**）

**✅ 正确做法**：若轮毂卡写「1018 型号」，
其他三卡就写各自**真实**的规模口径（如「仅语料，无型号」→ 改写成能力口径，
**不编数字**，见 §4.3）。

### ② 各线简介

**为什么需要这一段**：① 的卡片放不下 2–3 句，但经销商**需要知道每条线给谁、怎么合作**
才会点进去。

| 结构 | 内容 | 组件 |
|---|---|---|
| 一列四项 | 线名 + 2–3 句（做什么 / 给谁 / 怎么合作）+ 「进入 <线名>」链接 | ⚠️ **无现成组件** → 原生 `<section>` + 2 列文本（**不为此建组件**） |
| 分隔 | `border-t border-muted`，与 ① 视觉分层 | — |
| 容器 | `.container-fh`（1180）—— 文本段收窄 | — |

**每条线的简介口径**（来自 `ProductFamily.summary`，需重写）：

| 线 | 做什么 | 给谁 | 怎么合作 |
|---|---|---|---|
| 轮毂 | 15–23 英寸旋压 / 低压 / 锻造 | 经销商 / 分销商 / 轮毂品牌 | 现货型号 + 定制 |
| EV 三电壳体 | 水冷电机壳 / 高压压铸电机壳 / 电控箱逆变器壳体 | **整车厂 / Tier1** | 按图纸 / 按样件 |
| 铝制品定制 | 按图纸或样件开发（端盖 / 控制臂 / 转向节 / 轻量化结构件） | 有定制需求的采购 | 按图纸 / 按样件 |
| 安全轮胎 | 洛克 LOAKE 自密封安全轮胎 | 渠道商 | ⚠️ **归属未定，见 §6 阻塞 #4** |

**⚠️ 四条线的 CTA 动词不同**（这是**平行**而非**同质**）：
轮毂「浏览型号」/ EV「提交图纸」/ 铝制品「提交图纸」/ 轮胎「咨询渠道」。
**动词可以不同，卡片尺寸与视觉权重不能不同。**

### ③ 询盘入口

| 元素 | 内容 |
|---|---|
| 说明 | 一行：「不确定属于哪条线？」 |
| CTA | `<DealerCta>`（复用）—— 指向 `/request-a-quote` |
| 结尾 CTA | **≤ 80 字**，不重复四条线的描述 |

**🔴 不要在本页放表单** —— 表单只住在 `/contact` 与 `/request-a-quote`。

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 | 现状 |
|---|---|---|---|
| **`<ProductCard>`** | `src/components/product-card.tsx`（97 行，client） | ① 四条线卡 | **需扩 `variant` / `showFooterLink` 两个可选 props** |
| `<DealerCta>` | `src/components/sections/dealer-cta.tsx` | ③ 收尾 | 直接复用，21 处在用 |

**⚠️ 关于 `<ProductCard>` 的复用判定**：
它目前服务于**轮毂分类**（2 处使用），本页要服务**四条产品线** ——
**这是同一个形态（「带图的分类卡」）吗？**
- **是** → 扩 props 复用（**推荐**，避免两套卡）
- **否**（若四线卡需要完全没有 highlights/hover 的极简形态）→ 则**不是复用**，
  应在 `src/components/family-card.tsx` 新建，并**把 `<ProductCard>` 保留给轮毂分类**

**⚠️ 这是一个真实决策点，记在 §6 待补 #1，施工前必须拍板。**

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<ProductFamilyGrid>`** | `src/components/product-family-grid.tsx` | ① 等高四卡栅格 | **首页第 2 段共用（★ 强制复用）** |
| `<FamilyBriefList>` | **内联**（原生 `<section>`） | ② 各线简介 | 仅本页 |

**★ 强制复用条款**：`<ProductFamilyGrid>` **必须供 `/products` 与 `/` 首页第 2 段共用**
（README §2.1 第 2 段「四条产品线入口 · 平行四卡」）。
**→ 从第一天就放进 `src/components/`，不要写在页面文件里。**
**→ props 必须支持两页的差异**（首页可能更紧凑、无 ② 链接）：

```ts
// src/components/product-family-grid.tsx
type ProductFamilyGridProps = {
  families: ProductFamily[];          // 恰好 4 条
  /** 首页用 "compact"（卡更矮）；产品中心用 "roomy" */
  density?: "compact" | "roomy";
  /** 列数策略：4 列并排 / 2×2 / 1 列 —— 两页默认一致 */
  columns?: "auto" | 2 | 4;
  className?: string;
};
```

---

## 4. 数据契约

### 4.1 类型（已有，不需新增）

```ts
// src/content/types.ts —— 已存在
type ProductFamily = {
  slug: string;                 // "wheels" | "ev-components" | "custom-aluminum" | "safety-tires"
  name: string;                 // "轮毂"
  summary: string;              // 2–3 句：做什么 / 给谁 / 怎么合作
  highlights: string[];         // ⚠️ 本页用不到，四条线暂无 highlights
  hasRender: /** */ boolean;    // ⚠️ 除轮毂外全部 false → 走品牌占位
  image: string;                // 代表图路径
  hoverImage?: string;          // ⚠️ 仅轮毂有
  href: string;                 // "/products/wheels" 等
};
```

### 4.2 ⚠️ 数据来源：`src/content/products.ts` 必须重写

| 现状 | 目标 |
|---|---|
| 3 个 family：`monoblock` / `two-piece` / `off-road` | **4 条线：`wheels` / `ev-components` / `custom-aluminum` / `safety-tires`** |
| 全部 `hasRender: false`，`image` 指向 `public/images/products/*`（**该目录不存在**） | 代表图改指 `assets/preview-media/` 搬运后的路径 |
| 服务 `/products` + `/products/[slug]` 两页 | ⚠️ `/products/[slug]` 的消费者需同步处理（见 §6 阻塞 #2） |

**重写清单**：

```
① 删掉 3 个旧 family（monoblock/two-piece/off-road）
② 新增 4 条线，slug 与站点地图 §1 一致
③ image 字段：先留空 → 走 hasRender:false 的品牌占位（当前 `<ProductCard>` 已支持）
④ 四条线的 image 必须同比例 —— 见下方搬运步骤
```

**⚠️ `products.ts` 的重写会连带影响**：
`/products/[slug]`（现页面）、`/contact`（import `products`）——
**必须同步排查，否则构建失败**。

### 4.3 ★ 图片从哪来（`assets/` → `public/` 搬运步骤）

**事实**：`public/images/` 只有 `.gitkeep`，**零张真实图**；
`assets/preview-media/` 有 20 个文件（含 `ev-*` `custom-*` `tire-*` `wheel-0~3`
`factory.webp`）—— **与代码零引用，完全脱钩。**

**搬运步骤（本页 ① 段前置）**：

```bash
cd /Users/fkycoya/Documents/Code/WordpressWheelSIte
mkdir -p public/images/products

# 四条线代表图（从 preview-media 挑，1:1 或 4:3 统一裁切）
cp assets/preview-media/wheel-0.webp      public/images/products/family-wheels.webp
cp assets/preview-media/ev-01.webp        public/images/products/family-ev-components.webp
cp assets/preview-media/custom-01.webp    public/images/products/family-custom-aluminum.webp
cp assets/preview-media/tire-01.webp      public/images/products/family-safety-tires.webp
# （具体文件名以 `ls assets/preview-media/` 实列为准）
```

**随后**：`products.ts` 里 `image` 填 `/images/products/family-*.webp`，
`hasRender` 翻 `true`。

**🔴 三条纪律**：
1. **四张图必须同比例、同留白口径** —— 否则①段的「平行」在视觉上就破了
2. **图片资产 `public: false` 的不得上站**（README §4 待确认项 #9：58 张 registry
   条目全部 `public: false`）→ **搬运前必须逐条核实 publicationStatus**
3. **未接入前**：① 段按「四条同规格品牌占位卡」渲染（视觉仍平行），
   **不因缺图而破坏卡片等高** —— 这要求 `<ProductFamilyGrid>` 对占位与真图用**同一盒子尺寸**

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | 视口 01 用 `.container-fh-wide`（1440）；视口 02 用 `.container-fh`（1180）；视口 03 自带 |
| 视口 01 栅格 | ≥1024 → 4 列 ｜ 768 → 2 列 ｜ 390 → 1 列，**卡片 `items-stretch` 等高** |
| 视口 01 卡片图 | 统一 4:3（或统一 1:1），WebP，显式宽高防 CLS |
| 深色段 | ⚠️ **本页全浅色**（`bg-white` / `bg-soft` 交替）+ 视口 03 的 `bg-forge-soft` —— 深色留给首页 Hero 与能力页 |
| 段间 | `border-t border-muted` 分隔，不用大面积换色 |
| 动效 | 视口 01 用 `[data-reveal-group]`（四条错峰 80ms，**格数上限 8**，`DESIGN.md` §1.5）；`fail-visible` 纪律：**不自加 `opacity-0`** |
| 断点 | 768 **必须专项测**（四条卡在平板是 2×2，容易与文字溢出打架） |
| **视口高度** | 01 ≈ 1 屏 ｜ 02 ≈ 0.8 屏 ｜ 03 ≈ 0.5 屏 ｜ **合计 ≈ 2.3 屏**（见 §0.5.4） |
| 🔴 **询盘整屏** | 视口 03 的 `<DealerCta>` **必须完整落在一个视口内** —— 即 `section` 的总高（含 padding）**≤ 视口高 − 页脚可视部分**。`DESIGN.md` §0.5.4 硬规则：「询盘组件在一个视口内需要完全展示」，不得让按钮落在折线下 |

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 归属 |
|---|---|---|---|
| 1 | **`<ProductCard>` 扩 props 复用 vs 新建 `<FamilyCard>`**（§3.1 决策点） | ① 段 | 施工前拍板 |
| 2 | `products.ts` 重写会波及 `/products/[slug]` 与 `/contact` | 构建 | 施工方 |
| 3 | **四条线代表图**（`assets/` → `public/` + `public:false` 核实） | ① 段视觉 | 视觉 + 内容 |
| 4 | 🔴 **安全轮胎线的品牌归属**（峰徊 vs 洛克 LOAKE）决定该卡是否上线 | ① 段第 4 卡 | 决策（最高优先） |
| 5 | `highlights` 字段四条线暂时全空 —— 是否在本页使用 | ① 卡片结构 | 设计 |
| 6 | 是否保留 `/products/[slug]` 路由（README §1.1 判「重建为四条产品线」） | 路由 | 决策 |
| 7 | 四条线是否需要**英文名 eyebrow**（Wheels / EV Components…） | ① 卡片 | 内容 |
| 8 | 🔴 **`sku-callout` 段删除的连带影响** —— v1 未提这段，但它在代码里，且可能被别的页面引用（或本身就是死代码）→ **删前先 `grep` 其数据源** | 视口 01 | 施工方 |
| 9 | 🔴 **`resources` 段的处置** —— 它列的资源若只在本页出现，删掉即丢失入口；若 `/resources` 已有等价列表，则本页是重复 | 视口 03 | 内容 |
| 10 | **`guidance` 与各线简介的合并方式** —— v1 说 guidance 要删、② 要建，v2 说两者合并成视口 02。**合并后 `guidance` 的哪些问题该保留？**（选型类保留，合作类移入 `/dealers`） | 视口 02 | 设计 |

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| **§0.5 三视口切分**（你们做哪几条 / 哪条适合我 / 不确定怎么办） | `../../DESIGN.md` §0.5.1–§0.5.4 |
| 三视口（四条线总览 / 各线简介 / 询盘入口） | `../../ARCHITECTURE/page-architecture/README.md` §2.2 |
| **轮毂视觉权重不得高于其他三条** | 同上 §2.2 关键纪律 + §0① 四条平行地基 |
| 四条线不设父子关系 | 同上 §0① |
| 其余三条线本期只出能力页 | 同上 §3.1 表格（②定义 ⚠️ / ⑤型号 ❌ / ⑥对比 ⚠️） |
| 与 `/products/custom-aluminum` 的分工 | `custom-aluminum-page.md` §8 边界线表 |
| 每页必须有询盘入口 | 同上 README §3.2 |
| 无图不上架 / 占位降级 | `DEC-013` + `ProductFamily.hasRender` |
