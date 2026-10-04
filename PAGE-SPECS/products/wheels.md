# `/products/wheels` 页面规格（轮毂目录）

> **路由**：`/products/wheels`
> **目标文件**：`src/app/products/wheels/page.tsx`
> **渲染**：静态壳 + 客户端筛选（1018 个型号一次性下发，或按需分片）
> **数据**：`assets/wheel-data/WHEEL-CATALOG-ALL.json`（1349 型号 / 3485 variant / 1018 有图）
> **设计依据**：`../../ARCHITECTURE/page-architecture/wheel-catalog-page.md`

---

## 0. 一句话

**这是全站唯一的「索引页」** —— 页面上没有说服工作，只有一个**筛选器 + 网格 + 分页**。
**复杂度是竞品的 40 倍**（竞品仅 25 个设计 / 3 组单选，我们 1018 型号 / 7 组筛选）。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> 本节由 `scripts/inject-viewport-specs.py` 从 `_viewport-audit.md` §3 生成 —— **不复制结论，只搬事实**。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`src/app/products/wheels/page.tsx` 实测 **3 个 `<section>`**（2026-10-02）。

> 审计原文：`wheels/page.tsx` 三段 —— A Hero → B 按 family 分组的 SKU 网格 → C 计数条 → `DealerCta`。**当前渲染的是 `wheelSkus`（16 个示意 SKU），不是 1018 型号目录。** 规格要求六段（`PAGE-SPECS/products/wheels.md` §1）。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这一页是什么 / 数据可信吗？ | A Hero | `wheelIndexCopy` + 面包屑 + 数据说明 | 深色径向橙光 + 斜纹 | `Request a quote` → `/contact` | `Compare families` → `/products` | ⚠️ **拥挤**（见 B-1） |
| **02** | 有哪些「构造」？ | B 第一个 family 段 | `family.name` + `family.summary` + 该 family 的 SKU 卡 | 3 列 `WheelSketch` 卡 | 卡内链接 | `About {family.name}` 文字链 | ✅ 合规（同一问题的子集） |
| **03** | （同 02，其余 family） | B 其余 family 段 | 同上 | 同上 | 同上 | 同上 | ✅ 合规 |
| **04** | 一共有多少？ | C 计数条 | `{wheelSkus.length} SKUs across {productFamilies.length} constructions` | 纯文字 | 无 | 无 | 🗑️ **建议并入相邻段** |
| **05** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

**判定统计**：✅ 3 ｜ ⚠️ 拥挤 1 ｜ 🔴 违规 0 ｜ 🗑️ 建议合并/删除 1

### 0.5.3 审计给出的处置

| # | 判定 | 审计发现（原文标题） |
|---|---|---|
| B-1 | ⚠️ | 视口 01：Hero 里同时有「去看别的构造」与「去询盘」两个不同阶段的行动 |
| B-2 | 🗑️ | 视口 04（C 计数条）：答案是重复的 |

> 逐条理由与建议见 `_viewport-audit.md` §3 的 B 小节 —— **本文件不复制理由，只登记落点**。

### 0.5.4 高度预算与询盘整屏

| 项 | 要求 |
|---|---|
| 每视口 | ≈ 1 屏（`min-h-svh` 不强制，但一屏一个核心问题） |
| 🔴 询盘整屏 | 结尾 CTA **必须完整落在一个视口内** （`DESIGN.md` §0.5.4 硬规则），不得让按钮落在折线下 |
| 深色段 | 深色视口 ≤ 3；深色是入口，不是背景（`DESIGN.md` §1.2） |

---

<!-- ASSET-REALIGNMENT-2026-10-02 -->
## 0.6 ★ 图片资产边界（2026-10-02）

本轮资产重排**不修改轮毂目录**。轮毂图片继续遵循 `DEC-011`、`DEC-012`、`DEC-013`、`DEC-014`，统一从 `/images/wheels/` 读取；新增的 EV、铝制品、安全轮胎、能力页和内容中心图片不得进入轮毂目录。

## 1. 页面骨架（六段式）

| 序 | 内容块 | 必须性 | 说明什么 |
|---|---|---|---|
| ① | 页头 | 必须有 | 轮毂产品线定位 + 数据说明 |
| ② | **筛选工具条 ★** | 必须有 | 桌面侧栏 / 移动抽屉 |
| ③ | 结果计数与排序 | 必须有 | 「共 N 个型号」+ 排序 |
| ④ | **型号网格 ★** | 必须有 | 卡片：单图 + 型号 + 规格摘要 |
| ⑤ | 分页 | 必须有 | 1018 个必须分 |
| ⑥ | 尾部说明 | 必须有 | 数据来源 + 免责 + 询盘入口 |

```
/products/wheels
├── ① <PageHeader>              eyebrow + H1 + 定位句
├── ② <WheelFilterBar>  ★       桌面 aside / 移动 Sheet
├── ③ <WheelResultCount>        「共 1018 个型号」+ <SortSelect>
├── ④ <WheelModelGrid>          → <WheelCard> × 24
├── ⑤ <Pagination>
└── ⑥ <DataNotice> + <DealerCta>
```

---

## 2. 逐块规格

### ① 页头

| 项 | 内容 |
|---|---|
| 结构 | `.eyebrow` + `<h1>` + 一句定位 + 一行数据说明 |
| eyebrow | `WHEELS` |
| H1 | **轮毂** / Wheels |
| 定位句 | 15–20 寸 + HP / 越野款 · 旋压 / 低压铸造 / 锻造 |
| 数据说明 | 「本目录共 1018 个有图型号；规格以最终确认为准」 |
| 容器 | `.container-fh-wide`（1440）—— 索引页用宽容器 |
| 组件 | ⚠️ **无现成组件** → 直接用原生 `<header>` + 工具类（**不为此建组件**，全站唯一一处） |

**⚠️ 不要在这块加 CTA** —— 用户还没筛选，此时推销是干扰。

### ② ★ 筛选工具条

**桌面**：左侧固定侧栏（`sticky top-24` ／ 宽 280px）｜**移动**：底部 Sheet 抽屉

**7 组筛选器（完整规格）**：

| # | 筛选项 | 字段 | 控件类型 | 覆盖率 | 缺数据处理 |
|---|---|---|---|---|---|
| 1 | 尺寸 | `sizeCategory` | **多选** checkbox | 1349/1349 | — |
| 2 | PCD / 孔距 | `pcds` | **多选**（超 12 项折叠 `Show more`） | 1349/1349 | — |
| 3 | 孔数 | 派生自 `pcds` | **多选** | 1349/1349 | ⚠️ 须白名单，剔 `120孔` 脏值 |
| 4 | 工艺 | `process` | **多选** | ⚠️ **512/1349（38%）** | ★ **见下方铁律** |
| 5 | 偏距 ET | `offsets` | **范围滑杆**（0~46） | 1349/1349 | — |
| 6 | 中心孔 CB | `centerBores` | **多选** | 1349/1349 | — |
| 7 | 表面处理 | `finishes` | **多选 + 4 组分组** | 1349/1349（679 值） | 分组见下 |

**表面处理 4 分组**（679 个去重值）：单色 283 ｜ 车面 217 ｜ 全涂装 152 ｜ 压盘双色 27

**🔴 铁律：缺数据不得静默排除**（catalog §3.2）
> 选了「旋压」后，**837 个未标注工艺的型号不能凭空消失**。
> 必须显示提示：**「另有 837 个型号未标注工艺」**，或把这些型号单列一组。

**props 契约**：

```ts
// 建议：src/components/wheel-filter-bar.tsx
type FacetGroup = {
  key: "sizeCategory" | "pcd" | "lug" | "process" | "et" | "centerBore" | "finish";
  label: string;                       // "尺寸"
  kind: "checkbox" | "range";
  options: { value: string; count: number; group?: string }[];
  collapsedAfter?: number;             // PCD 超 12 项折叠
  unlabelledCount?: number;            // ★ 工艺专用：「另有 N 个未标注」
};

type WheelFilterBarProps = {
  facets: FacetGroup[];
  value: WheelFilters;                 // 来自 URL
  onChange: (next: WheelFilters) => void;
  onClearAll: () => void;
  mobile?: boolean;                    // 桌面 aside / 移动 Sheet 两态
};
```

**交互纪律**：
- ✅ **筛选状态必须进 URL**（可分享、可 SEO、返回可复原）—— catalog §3.3
  > 「URL 同步是我们必须做而两家都没做好的」
- ✅ 每组底部有**计数**
- ✅ 顶部有 `Clear all`
- ⚠️ 用 `router.replace` + `scroll: false`，**不要 push 出历史记录堆栈**

### ③ 结果计数与排序

| 元素 | 内容 |
|---|---|
| 计数 | **「共 1018 个型号」** —— 随筛选实时变化 |
| 排序 | `<select>`：**型号（默认）** ｜ 尺寸 小→大 ｜ 表面处理数 多→前 |
| 移动端 | 计数 + 「筛选」按钮同行 |

**⚠️ 禁止排序项**：**「热门」「推荐」** —— 我们没有销量数据，编排序规则是误导（catalog §6.2）。

### ④ ★ 型号网格

**布局**：`.container-fh-wide` 内 CSS Grid

| 断点 | 列数 |
|---|---|
| ≥1440 | **4 列** |
| 1024 | 3 列 |
| 768 | 2 列 ⚠️ **竞品在此横向溢出，必须专门测** |
| 390 | 2 列紧凑 / 1 列 |

**每页 24 个**（4×6）。

**卡片结构**（`<WheelCard>`）：

```
┌────────────────────┐
│                    │
│   正方图 1:1        │  ← object-fit: contain（★ 不是 cover）
│   WebP / lazy      │     显式 width/height 防 CLS
│                    │
├────────────────────┤
│ 1081X              │  ← 型号（H3，font-display）
│ WEDS TC005 旋压工艺  │  ← styleName（⚠️ 仅 762/1349 有，缺失则整行不渲染）
│ 15×7 · 4×100        │  ← sizes + pcds（规格摘要）
│ 白色全涂装 · 枪灰     │  ← finishes 前 2 个 + 「等 N 种」
└────────────────────┘
```

**`<WheelCard>` props**：

```ts
type WheelCardProps = {
  model: string;              // "1081X"
  styleName?: string;         // ⚠️ 57% 覆盖率 → 缺失时整行省略
  sizes: string[];            // ["15*7"]
  pcds: string[];             // ["4*100"]
  finishes: string[];         // 显示前 2 + 余量
  process?: string;           // ⚠️ 38% → 缺失时不显示该标签
  image: { src: string; width: number; height: number };
  priority?: boolean;         // 首屏 6–8 张 true
  href: string;               // /products/wheels/1081X
};
```

**🔴 三条硬纪律**：
1. **无图的 331 个型号不生成卡片**（`DEC-013` 无图不上架）
2. **图片必须 1:1 正方 + `object-fit: contain`**（`DEC-014`）
   > 「轮毂是圆的，**cover 会切掉边缘**」
3. **alt 模板**：`1081X 轮毂 — 15×7 · 4×100 · 旋压 · 白色全涂装`
   ❌ 不得写 `product-1.png` 这类无价值描述

**图片加载**：WebP ｜ 首屏 6–8 张 `priority`，其余 `lazy` ｜ 显式宽高防 CLS

### ⑤ 分页

| 项 | 规格 |
|---|---|
| 类型 | **页码分页**（不是「加载更多」） |
| 理由 | B2B 采购会想直接跳到第 12 页（catalog §5.2） |
| 每页 | 24 个 → 约 43 页 |
| 自适应 | 结果 **> 48** 显示分页；**≤ 48** 一屏不显示分页 |
| 组件 | `<Pagination>`（**需新建**） |

### ⑥ 尾部说明

| 元素 | 内容 |
|---|---|
| 数据来源 | 「以上规格来自产品目录数据；**以最终确认为准**」 |
| 免责 | 不声称适配车型（`suitableVehicles` 全空） |
| CTA | `<DealerCta>`（复用已有，21 处使用中） |

**⚠️ 这一段是诚信底线，不能省** —— 规格页越像产品目录，数据溯源越要显式。

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 |
|---|---|---|
| `<DealerCta>` | `sections/dealer-cta.tsx` | 第六段收尾 |
| `<WheelSketch>` | `wheel-gallery.tsx` | ⚠️ 可选 —— 无图时的 SVG 线稿兜底（**本轮不用**，无图型号不上架） |

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<WheelFilterBar>`** | `src/components/wheel-filter-bar.tsx` | 7 组 facet + 桌面/移动两态 | 仅本页 |
| **`<WheelResultCount>`** | 内联到页面即可 | 计数 + 排序 | 仅本页 |
| **`<WheelModelGrid>`** | `src/components/wheel-model-grid.tsx` | 响应式网格 | 系列页也用 |
| **`<WheelCard>`** | `src/components/wheel-card.tsx` | 型号卡 | **系列页 + 相关型号也用** |
| **`<Pagination>`** | `src/components/pagination.tsx` | 页码分页 | 2 页 |
| **`<DataNotice>`** | `src/components/data-notice.tsx` | 数据来源与免责 | **全部产品页** |

**★ 提取纪律**：`<WheelCard>` 与 `<WheelModelGrid>` **系列页也要用** → 从第一天就放进 `src/components/`，
**不要先写在页面文件里**（否则第二页要复制）。

---

## 4. 数据契约

### 4.1 输入类型（⚠️ 类型已定义，数据未接入）

```ts
// src/content/types.ts —— 已存在
type WheelModel = {
  model: string;                 // "1081X"
  sizes: string[];               // ["15*7"]
  pcds: string[];                // ["4*100"]
  offsets: number[];             // [35]
  centerBores: number[];         // [73.1]
  finishes: string[];            // ["白色全涂装","枪灰全涂装"]
  variants: WheelVariant[];      // 3485 个
  styleName: string;             // ⚠️ 762/1349
  suitableVehicles: string[];    // ⚠️ 全空 —— 不得使用
  process: string;               // ⚠️ 512/1349
  sizeCategory: string;          // "15寸"
};
```

**🔴 关键缺口**：`WheelModel` 类型已定义，但**数据尚未从 `assets/` 接进 `src/`**。
当前 `src/content/wheel-skus.ts` 只有 **16 个示意 SKU**（克隆原型残留）。

**接入路径**（施工前置）：
```
assets/wheel-data/WHEEL-CATALOG-ALL.json
  ↓ 构建期脚本（或 src/content/wheel-catalogue.ts 直接 import）
  ↓ 过滤：只保留有图的 1018 个
src/content/wheel-catalogue.ts   ← 生成物，禁手改
```

### 4.2 筛选状态（URL schema）

```
/products/wheels?size=18%E5%AF%B8,19%E5%AF%B8&pcd=5*114.3&process=旋压&et=20-40&page=3
```

| 参数 | 类型 | 多值分隔 |
|---|---|---|
| `size` | 多值 | `,` |
| `pcd` | 多值 | `,` |
| `lug` | 多值 | `,` |
| `process` | 多值 | `,` |
| `et` | 范围 | `min-max` |
| `cb` | 多值 | `,` |
| `finish` | 多值 | `,` |
| `sort` | 单值 | — |
| `page` | 单值 | — |

**⚠️ URL 参数命名规范待定**（catalog §9 #6）—— 先按上表实现，可改。

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh-wide`（1440） |
| 桌面布局 | `grid-cols-[280px_1fr]`，筛选栏 `sticky top-24` |
| 移动 | 筛选收进 Sheet，网格占满 |
| 卡片图 | **1:1**，`object-fit: contain` |
| 深色段 | **无**（索引页全浅色） |
| 动效 | 网格用 `[data-reveal-group]` 错峰（80ms/项），**上限 12 项**（多了会显得慢） |

**⚠️ 平板 768 必须专门测** —— 竞品正是在这个断点横向溢出。

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 |
|---|---|---|
| 1 | **`assets/` 数据接入 `src/`**（真实目录 vs 16 个示意 SKU） | **整页** |
| 2 | 2757 张 WebP 从 `assets/wheel-images-webp/` 搬进 `public/` | 网格 |
| 3 | 679 个表面处理 **4 分组需人工复核** | 筛选器第 7 组 |
| 4 | 41 个 PCD 是否全列 / CB 是否值得做筛选 | 筛选器第 2、6 组 |
| 5 | URL 参数命名规范 | 筛选状态 |
| 6 | 移动抽屉交互细节 | 移动端 |
| 7 | 768 溢出修法 | 平板 |
| 8 | **`sizeCategory` 归一化规则**（文档有 15–23 寸 vs 15–20 寸两种口径） | 筛选器第 1 组 |

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 骨架六段式 | `wheel-catalog-page.md` §2 |
| 7 组筛选器 | `wheel-catalog-page.md` §3.1 |
| 缺数据不静默排除 | `wheel-catalog-page.md` §3.2 铁律一 |
| 24/页 + 页码分页 | `wheel-catalog-page.md` §5.2 |
| 卡片 1:1 contain | `DEC-014` + `wheel-catalog-page.md` §1.3 |
| 无图不上架 | `DEC-013` |
