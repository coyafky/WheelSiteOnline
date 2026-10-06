# `/products/wheels/[model]` 页面规格（型号单品）

> **路由**：`/products/wheels/[model]`（⚠️ 现为 `[sku]`，**需改段名**）
> **目标文件**：`src/app/products/wheels/[model]/page.tsx`
> **渲染**：**SSG × 1018**（`generateStaticParams`）
> **数据**：`WHEEL-CATALOG-ALL.json` 的单个 `WheelModel`
> **设计依据**：`../../ARCHITECTURE/page-architecture/wheel-detail-page.md`

---

## 0. 一句话

**这是全站核心竞争力所在。** 竞品单品页**一个规格数字都没有**（全定制模式，只写
`16-26 inch available`）；**我们有 3485 个 variant 的真实 size/PCD/ET/CB/finish**
→ **「竞品做设计目录，我们做规格目录」。**

**⚠️ 1018 页共用这一个模板** —— 所以**版式必须统一**，不允许按型号微调。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §4 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/products/wheels/[sku]/page.tsx` 实测 **5 个 `<section>`**（2026-10-02）。

> 审计原文：A Hero（面包屑 + H1 + 单图 + 2 CTA）→ B Specification（dl）→ C Finish options → D Applications + fitment bridge → E Related SKUs → `DealerCta`。 规格要求九段（`PAGE-SPECS/products/wheels/[model].md` §1）。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这是什么型号？ | A 面包屑 + H1 + 图 + 描述 | `sku` + `sku.name` + `sku.description` | 1:1 `WheelSketch` | `Request a quote` → `/contact` | `About {family.name}` → family 页 | ⚠️ **拥挤**（见 B-1） |
| **02** | 具体参数是多少？ | B Specification | `specs[]` + `specDisclosure` 免责 | `dl` 2 列参数格 | 无 | 无 | ✅ 合规 |
| **03** | 有哪些颜色？ | C Finish options | `sku.finishes` 色卡 + `finishNote` | 色卡圆点列 | 无 | 无 | ✅ 合规 |
| **04** | 能用在我车上吗？ | D Applications + fitment | 应用清单 + 「Fitment is safety-critical」免责 + 2 CTA | 左勾选列 + 右卡片 | `Send vehicle details` → `/contact` | `How to measure fitment` → 资源页 | ✅ 合规 |
| **05** | 还有别的型号吗？ | E Related SKUs | `related` 卡 | 3 列卡 | 卡内链接 | 无 | ✅ 合规 |
| **06** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

**判定统计**：✅ 5 ｜ ⚠️ 拥挤 1 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 0

### 0.5.3 审计给出的处置

| # | 判定 | 审计发现（原文标题） |
|---|---|---|
| B-1 | ⚠️ | 视口 01：`Request a quote` 与 `About {family.name}` 是两个不同阶段的目标 |

> 逐条理由与建议见 `_viewport-audit.md` §4 的 B 小节 —— **本文件不复制理由，只登记落点**。

### 0.5.4 高度预算与询盘整屏

| 项 | 要求 |
|---|---|
| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |
| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** （`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |
| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |

---

<!-- ASSET-REALIGNMENT-2026-10-02 -->
## 0.6 ★ 图片资产边界（2026-10-02）

本轮不改变轮毂单品页图片策略。详情页继续使用 `/images/wheels/` 的单图契约；非轮毂页面新建的图片目录不参与型号详情页。

## 1. 页面骨架（九段式）

| 序 | 内容块 | 必须性 | 说明什么 |
|---|---|---|---|
| ① | 面包屑 | 必须有 | 层级导航（支持从系列页进来的四级） |
| ② | 图库 | 必须有 | ★ **只展示 1 张主图**（`DEC-014`） |
| ③ | 标签行 | **视数据** | 三维分类，可点击回目录 |
| ④ | 标题区 | 必须有 | 型号 + H1 + 一句话定位 |
| ⑤ | **规格表 ★★** | 必须有 | **逐 variant 列 —— 全页核心** |
| ⑥ | 表面处理 | **可选** | 分类 + 说明 + 色卡 |
| ⑦ | 询盘区 | 必须有 | 从规格里选，不是客户填 |
| ⑧ | 相关型号 | 可选 | 同系列 / 同尺寸 3–4 个 |
| ⑨ | 数据说明 | 必须有 | 来源与免责（诚信底线） |

```
/products/wheels/1081X
├── ① <Breadcrumb>
├── ② <HeroImage>              1:1 单图
├── ③ <TagRow>                 尺寸 / PCD / 工艺（只显示有数据的）
├── ④ 标题区                    H1 + styleName 副标
├── ⑤ <VariantSpecTable>  ★★    逐 variant
├── ⑥ <FinishPalette>          缺 finishes 则整段隐藏
├── ⑦ <InquiryPicker>          → 携带 model + variant 进询盘
├── ⑧ <RelatedModels>          3–4 个 <WheelCard>
├── ⑨ <DataNotice>
└──    <DealerCta>
```

---

## 2. 逐块规格

### ① 面包屑

```
Home  ›  轮毂  ›  1081X
```

| 项 | 规格 |
|---|---|
| 结构 | `首页 › 产品中心 › 轮毂 › <model>` |
| 组件 | `<Breadcrumb>`（**需新建**，3+ 页复用） |
| 四级 | 从系列页进来时插入「系列」一级 |
| SEO | 必须输出 `BreadcrumbList` 结构化数据 |

### ② 图库（**单图**）

| 项 | 规格 |
|---|---|
| 张数 | **1 张**（`DEC-014` 定案） |
| 容器 | **1:1 正方**，宽度撑满内容列，**不设最大宽度上限** |
| `object-fit` | **`contain`** —— 🔴 **不能 `cover`**（轮毂是圆的，cover 会切掉边缘） |
| 格式 | WebP（唯一） |
| 加载 | 首屏图 `priority`，**不给 lazy** |
| 尺寸 | 显式 `width`/`height` 防 CLS |

**🔴 禁止**：多图 / 缩略图条 / 轮播（`DEC-014`）
> 「1018 页版式统一：每页只展示 1 张主图。不做缩略图条、不做轮播。」

**取图规则**：按文件名**自然排序取第一张**，确定性、可复现，**不手工挑图**。

**alt 模板**（与目录页卡片一致）：
`1081X 轮毂 — 15×7 · 4×100 · 旋压 · 白色全涂装`

### ③ 标签行（视数据）

**只渲染「有数据」的标签** —— 缺就不渲染，不占位。

| 标签 | 字段 | 覆盖率 | 缺时 |
|---|---|---|---|
| 尺寸 | `sizeCategory` | 100% | — |
| PCD | `pcds` | 100% | — |
| 工艺 | `process` | ⚠️ **38%** | **隐藏该标签**（不写「待确认」） |

**交互**：每个标签**可点击** → 回目录页并**已按该值筛好**
（单品页兼作筛选入口）。

**🔴 禁止**：伪造我们没有的标签（如「深凹」）。

### ④ 标题区

| 行 | 内容 | 缺时 |
|---|---|---|
| H1 | **型号**（`font-display` 大字） | — |
| 副标题 | `styleName` | ⚠️ **57% 覆盖率** → **缺失则整行不渲染** |
| 一句话 | 主要应用场景（`applications`） | 可选 |

**🔴 禁止**：写「灵感来自 X」式话术 —— **那是暗示复刻，商标风险**。
**也不写我们没有的参数**（如 deep concave）。

### ⑤ ★★ 规格表（全页核心）

**逐 variant 列** —— 3485 个 variant 按型号分组，本页列出该型号的全部。

| 列 | 字段 | 单位纪律 |
|---|---|---|
| 生产代码 | `productionCode` | `1081X157001W` |
| 尺寸 | `size` | `15*7` |
| PCD | `pcd` | `4*100` |
| 偏距 | `offset` | **`ET +35`（不是 `35`）** |
| 中心孔 | `centerBore` | **`CB 73.1 mm`** |
| 表面处理 | `finish` | 全名 |

**props 契约**：

```ts
// src/components/variant-spec-table.tsx
type VariantSpecTableProps = {
  variants: WheelVariant[];       // 该型号的全部 variant
  model: string;
  onPick?: (v: WheelVariant) => void;   // → 带进询盘
};
```

**响应式**：移动端**转卡片布局，不横向滚动**（严格）。

**🔴 四条纪律**：
1. **规格必须来自该型号的实际 variant 数据** —— 不得用系列通用值顶替（`DEC-004`）
2. **`process` 未标注时留白，不推测** —— 「宁可不显示这一段」
3. **不做「适配车型」声称**（`suitableVehicles` 全空）
4. **单位不得省略**（`ET +35` / `CB 73.1mm`）

### ⑥ 表面处理（可选）

| 项 | 规格 |
|---|---|
| 内容 | 该型号全部 `finishes` |
| 分类 | 按目录页的 4 分组（单色 / 车面 / 全涂装 / 压盘双色） |
| 色卡 | **CSS 近似色，必须标注「示意」** |
| 缺时 | `finishes` 为空 → **整段隐藏**（100% 覆盖率，罕见） |

**🔴 禁止**：拿竞品的色卡图冒充（`DEC-010`）。

### ⑦ 询盘区（**从规格里选，不是客户填**）

**★ 核心设计：把「客户填规格」变成「客户从数据里选规格」。**

| 交互 | 说明 |
|---|---|
| 入口 | 规格表每行有「加入询盘」按钮 |
| 自动携带 | `model` + `productionCode` + 全部已选规格 + **来源页 URL** |
| 自由出口 | **★ 必须保留**：「以上都不是，我要定制」→ 走自由填写 |

**⚠️ 为什么必须留自由出口**：491 个单图型号可能数据不全，
客户的需求不一定在表里 —— **堵死出口 = 丢单**。

### ⑧ 相关型号（可选）

| 项 | 规则 |
|---|---|
| 数量 | **3–4 个** |
| 优先级 | 同 `styleName` → 同尺寸 → 同 PCD |
| 回退 | 无同系列时回退到同尺寸 |
| 组件 | 复用 `<WheelCard>`（与目录页同一个） |

### ⑨ 数据说明

| 元素 | 内容 |
|---|---|
| 来源 | 「规格来自产品目录数据」 |
| 免责 | 「**以最终确认为准**；不构成适配承诺」 |
| CTA | `<DealerCta>` |

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 |
|---|---|---|
| `<DealerCta>` | `sections/dealer-cta.tsx` | 收尾 |
| `<WheelCard>` | **（目录页新建）** | 第 ⑧ 段相关型号 |
| `<WheelSketch>` | `wheel-gallery.tsx` | ⚠️ 不推荐 —— 无图型号不上架 |

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<Breadcrumb>`** | `src/components/breadcrumb.tsx` | 层级导航 + JSON-LD | **3+ 页** |
| **`<HeroImage>`** | `src/components/hero-image.tsx` | 1:1 单图容器 | 产品页 |
| **`<TagRow>`** | `src/components/tag-row.tsx` | 可点击分类标签 | 2 页 |
| **`<VariantSpecTable>`** | `src/components/variant-spec-table.tsx` | ★ 逐 variant 规格表 | **本页核心** |
| **`<FinishPalette>`** | `src/components/finish-palette.tsx` | 色卡网格（标注示意） | 表面处理页也用 |
| **`<InquiryPicker>`** | `src/components/inquiry-picker.tsx` | 选规格 → 带进询盘 | 复用 `InquiryForm` 逻辑 |
| **`<RelatedModels>`** | 内联（用 `<WheelCard>`） | 相关型号 | — |
| **`<DataNotice>`** | `src/components/data-notice.tsx` | 数据来源免责 | **全部产品页** |

---

## 4. 数据契约

```ts
type WheelVariant = {
  productionCode: string;   // "1081X157001W"
  size: string;             // "15*7"
  pcd: string;              // "4*100"
  offset: number;           // 35
  centerBore: number;       // 73.1
  finish: string;           // "白色全涂装"
};
```

**静态生成**：
```ts
export async function generateStaticParams() {
  return wheelCatalogue.models
    .filter(m => m.hasImage)                 // ★ 无图不上架（331 个排除）
    .map(m => ({ model: m.model }));         // → 1018 条
}
```

**🔴 SEO**：每页唯一 `title` / `description` + `Product` 结构化数据
（`name` `image` `sku` `brand`）。**无图型号不进 `sitemap`。**

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180）—— 单品页用标准容器 |
| 桌面 | 图 + 规格双列（`lg:grid-cols-2`）或上图下规格 |
| 规格表 | **移动端转卡片，绝不横向滚动** |
| 深色段 | **无** |
| 图片 | 1:1 / contain / WebP / priority |

**⚠️ 规格表移动端转卡片的断点待定** —— 竞品正是在 768 溢出。

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 |
|---|---|---|
| 1 | **数据接入**（16 个示意 SKU → 1018 真实型号） | **整页** |
| 2 | 2757 张 WebP 搬进 `public/` | 图库 |
| 3 | 路由段改名 `[sku]` → `[model]` | 所有链接 |
| 4 | **表面处理 CSS 近似色具体色值** | 第 ⑥ 段 |
| 5 | 规格表移动端转卡片**具体断点** | 移动端 |
| 6 | **`styleName` 缺失的 587 个型号**标题区怎么处理（影响 43% 页面） | 第 ④ 段 |
| 7 | 询盘「自由填写」路径设计 | 第 ⑦ 段 |
| 8 | 竞品「暗示复刻」话术是否完全避免（**法务**） | 第 ④ 段 |
| 9 | **图片文件名 → 型号的映射规则**（`DEC-012` 命中率 79.3%，剩 20.7% 怎么补） | 图库 |

---

## 附：与设计文档的对应

| 本规格 | 依据 |
|---|---|
| 九段式 | `wheel-detail-page.md` §2 |
| 单图 1:1 contain | `DEC-014` + `wheel-detail-page.md` §3② |
| 逐 variant 规格表 | `wheel-detail-page.md` §3⑤ + `DEC-004` |
| 不用系列通用值 | `DEC-004` |
| 色卡标示意 | `DEC-010` |
| 无图不上架 | `DEC-013` |
