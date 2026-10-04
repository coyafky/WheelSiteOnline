# `/products/wheels/series/[series]` 页面规格（设计系列）

> **路由**：`/products/wheels/series/[series]`
> **目标文件**：`src/app/products/wheels/series/[series]/page.tsx`
> **渲染**：**SSG × N**（`generateStaticParams`，仅为清洗后的系列建页）
> **数据**：`wheelCatalogue.models` 按 `styleName` 分组（派生，无独立数据源）
> **设计依据**：`../../../ARCHITECTURE/page-architecture/README.md` §2.5

---

## 0. 一句话

**这是「按外观找货」的入口** —— 客户说「我要那种样子的」，这一页把「那种样子」
翻译成**可报价的型号清单**。

**⚠️ 本页最大的风险不是设计，是命名。** 源数据 `styleName` 里混着第三方商标
（`TE37` = Rays / `BBS-LM` = BBS / `HRE-FF10` = HRE）—— **这些词一个字都不能
作为丰怀的系列名出现在 URL、标题、文案里。** 见 §6 阻塞 #1 与 §4.2。

---

<!-- VIEWPORT-SPEC-INJECTED -->
## 0.5 ★ 视口切分（全页第一原则）

> 判据来自 `../../DESIGN.md` §0.5.1 / §0.5.2 / §0.5.4。
> ⚠️ **本页尚未进入 `_viewport-audit.md` 的审计范围** —— 下面的视口切分是**待验证**的，不要当已审结论用。

### 0.5.1 实测现状 vs 规格要求

**代码事实**：`/products/wheels/series/[series]` **在 `src/app/` 下没有对应实现** —— 本规格描述的是一页尚未建的页面。

**⚠️ 本规格 §1 的「N 段式」是内容块清单，不是视口切分。** 施工时先按 §0.5.2 定视口，再往视口里放段。

### 0.5.2 视口切分（来自审计）

⚠️ 审计未为本页产出视口划分表 —— **切分待定**，需先补审计再施工。

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
## 0.6 ★ 图片资产边界（2026-10-02）

本轮不接入非轮毂图片。该动态路由当前没有对应实现，待路由落地后仍必须使用 `/images/wheels/` 与轮毂目录契约，不能从能力页或内容中心借图。

## 1. 页面骨架（四段式）

| 序 | 内容块 | 必须性 | 说明什么 |
|---|---|---|---|
| ① | 系列说明 | 必须有 | 这个外观的设计语言、适用场景 |
| ② | **该系列型号列表 ★** | 必须有 | 按尺寸 / 工艺分组，卡片复用目录页 |
| ③ | 与工艺的关系 | 必须有 | 同一外观可对应多种工艺 —— 说清区别 |
| ④ | 询盘入口 | 必须有 | 系列级询盘 |

```
/products/wheels/series/[series]
├── ① <SeriesHeader>            eyebrow + H1(系列名) + 设计语言 + 车型/尺寸线索
├── ② <WheelModelGrid>    ★     → <WheelCard> × N（按 sizeCategory/process 分组标题）
├── ③ <ProcessRelationNote>     同一外观 × 不同工艺对照（对比小表）
└── ④ <DataNotice> + <DealerCta>
```

**⚠️ 本页没有「相关系列」段** —— 竞品底本无此页、无该形态。加一个「其他系列」
导航虽合理，但会与 ④ 询盘入口争夺底部注意；**本期不做，见 §6 待补 #5。**

---

## 2. 逐块规格

### ① 系列说明

| 项 | 内容 |
|---|---|
| 结构 | `.eyebrow` + `<h1>`（系列名）+ 一段设计语言（≤60 字）+ 一行数据线索 |
| eyebrow | `SERIES` |
| H1 | **系列名**（清洗后的丰怀命名 —— ⚠️ 见 §4.2） |
| 设计语言 | 1 段：辐条形态、面型、适用场景（不写「灵感来自 X」） |
| 数据线索 | 「本系列 N 个型号；尺寸 15–20 寸；常见工艺 旋压 / 低压」 |
| 容器 | `.container-fh`（1180）—— 系列页用标准容器，与目录页的宽容器区分 |
| 组件 | ⚠️ **无现成组件** → 原生 `<header>` + 工具类（**不为此建组件**，与目录页①同样处理） |

**🔴 禁止**：
- 写「复刻/致敬/同款 TE37」式话术 —— **这是商标事故**（`DEC-010`）
- 放竞品的产品图 —— `DEC-010` 同条纪律
- 加 CTA（用户还没看型号，此时推销是干扰）

### ② ★ 该系列型号列表

**分组规则**（按优先级取第一个可用维度分组）：

| 优先级 | 分组维度 | 分组标题 | 降级条件 |
|---|---|---|---|
| 1 | `process`（工艺） | 旋压 / 低压 / 锻造 / **未标注工艺** | `process` 全空则降级 |
| 2 | `sizeCategory`（尺寸） | 15寸 / 16寸 / … / 越野款 / HP | — |

**⚠️ 未标注工艺的型号必须单列一组**（「未标注工艺」）—— 与目录页 §3.2 同一条铁律：
**缺数据不得静默排除**。

**网格**：复用目录页的 `<WheelModelGrid>` + `<WheelCard>`（4 / 3 / 2 / 2 列，
规则完全一致 —— 见 `../wheels.md` §2④）。**本页不重复定义卡片。**

**props 契约**（复用目录页定义，本页不新增）：

```ts
// 已在 ../wheels.md §3.2 定义，本页直接 import
type WheelModelGridProps = {
  models: WheelModel[];        // 已过滤 hasImage === true
  priorityCount?: number;      // 首屏 6–8 张 priority
};

type WheelCardProps = {
  model: string;
  styleName?: string;          // ⚠️ 本页卡片可省略该行（已在系列内，冗余）
  sizes: string[];
  pcds: string[];
  finishes: string[];
  process?: string;            // ⚠️ 38% → 缺失不显示
  image: { src: string; width: number; height: number };
  priority?: boolean;
  href: string;                // /products/wheels/<model>
};
```

**分组标题组件**：`<SeriesGroupHeading>`（本页内联即可，**不提取**）

| 项 | 规格 |
|---|---|
| 形态 | `font-display` uppercase + 右侧计数徽标（「12 个型号」） |
| 层级 | `<h2>`（系列 H1 之下） |
| 锚点 | `id={slug(group)}`，供系列页顶部快速跳转（**本期可选**） |

**🔴 三条硬纪律**（继承目录页）：
1. `hasImage === false` 的型号**不进本页**（`DEC-013`）
2. 图片 1:1 + `object-fit: contain`（`DEC-014`）
3. 每页型号数 **> 48 时分页**（复用 `<Pagination>`）；≤ 48 一屏不分页

### ③ 与工艺的关系（本页差异化段）

**这一段回答一个具体问题**：「同一个样子，为什么报价差一倍？」

| 结构 | 内容 |
|---|---|
| 小标题 | 「同一外观，三种工艺」 |
| 对照表 | 3–4 行 × 3 列（工艺 / 是什么 / 适合什么量） |
| 数据约束 | ⚠️ **只能用 `process` 字段里真实出现的值** —— 不得凭空列出工厂没有的工艺 |

| 工艺 | 一句话 | 数据来源 |
|---|---|---|
| 旋压 | 铸造轮辋旋压成形，强度/成本折中 | `WheelProcess` 枚举值 |
| 低压 | 低压铸造，模具成本低、适合中小批量 | 同上 |
| 低压+旋压 | 二者组合 | 同上 |
| 锻造 | 一体锻造成形，强度最高、成本最高 | 同上 |
| **未标注** | ⚠️ **不得写「不适用」** —— 写「本目录未标注工艺的型号」 | — |

**⚠️ 本段文案必须来自丰怀确认的工艺说明**，不可自行编造价格区间或强度倍数。

### ④ 询盘入口

| 元素 | 内容 |
|---|---|
| 数据说明 | `<DataNotice>`：系列内规格来自产品目录数据，**以最终确认为准** |
| CTA | `<DealerCta>`（复用，21 处使用中）—— **本页不做独立收尾设计** |
| 结尾 CTA 文案 | **≤ 80 字** |

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 |
|---|---|---|
| `<DealerCta>` | `src/components/sections/dealer-cta.tsx` | ④ 收尾（21 处复用冠军） |

### 3.2 复用「目录页新建」（**本页是这些组件的第二个消费者 → 必须已提取**）

| 组件 | 路径 | 本页用途 | 备注 |
|---|---|---|---|
| **`<WheelCard>`** | `src/components/wheel-card.tsx` | ② 型号卡 | **目录页 + 本页 + 单品页「相关型号」三处消费** |
| **`<WheelModelGrid>`** | `src/components/wheel-model-grid.tsx` | ② 响应式网格 | 目录页 + 本页 |
| **`<DataNotice>`** | `src/components/data-notice.tsx` | ④ 数据来源免责 | 全部产品页 |
| **`<Pagination>`** | `src/components/pagination.tsx` | ② 型号 > 48 时 | 目录页 + 本页 |
| **`<Breadcrumb>`** | `src/components/breadcrumb.tsx` | 页面顶部 | 单品页 + 本页（四级：首页 › 产品中心 › 轮毂 › 系列） |
| **`<TagRow>`** | `src/components/tag-row.tsx` | ① 系列的数据线索行（可选） | 单品页 + 本页 |

**★ 提取纪律**：以上六个组件**都不在本页新建** —— 它们的建造责任在目录页规格
（`../wheels.md` §3.2）。**本页若发现它们还写在页面文件里，必须先提取再消费。**

### 3.3 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<SeriesHeader>`** | **内联到页面即可**（与目录页 ① 同处理） | eyebrow + H1 + 设计语言 | 仅本页 |
| **`<ProcessRelationNote>`** | **内联**（原生 `<table>` + 工具类） | ③ 工艺对照小表 | ⚠️ **若 `/capabilities` 也要做工艺对比，则提取到 `src/components/process-compare.tsx`** |

**⚠️ 本页唯一可能触发提取的是 ③**。若 `/capabilities`（见 `../../capabilities.md`）
的「工艺能力」段也做成同一形态的对照表 → **两页共用 → 必须提取**；否则内联。
**决策点记在 §6 待补 #4。**

---

## 4. 数据契约

### 4.1 输入类型（已有）

```ts
// src/content/types.ts —— 已存在，本页不新增类型
type WheelModel = {
  model: string;
  sizeCategory: string;        // "15寸" … "20寸" / "越野款" / "HP"
  sizes: string[];
  pcds: string[];
  offsets: number[];
  centerBores: number[];
  finishes: string[];
  variants: WheelVariant[];
  styleName?: string;          // ⚠️ 762 / 1349 —— 本页的分组键
  process?: WheelProcess;      // ⚠️ 512 / 1349
  vehicleHints: string[];      // ⚠️ 派生自 styleName，非出厂规格
  hasImage: boolean;
  images: string[];
};
```

### 4.2 ★ 系列派生规则（本页的「数据源」是一段逻辑，不是一个文件）

**⚠️ 没有 `series.ts` 这种数据模块** —— 系列是从 `styleName` 派生的**视图**。

派生三步（**构建期，不是运行期**）：

```
① 取 WheelModel[] where styleName != null  → 762 个型号
② 按 styleName 去重分组                     → 得到 N 个原始系列名
③ ⚠️ 商标清洗（必须，阻塞项）：
   - 命中第三方商标黑名单（TE37 / BBS-LM / HRE-FFxx / …）→ 改写为丰怀命名
   - 或整组标注「风格参考」并移除品牌词
   - 生成 seriesSlug（小写、连字符、URL-safe、全站唯一）
   → src/content/wheel-series.ts  ← 生成物，禁手改（含映射表，供审计）
```

**生成物形状（建议）**：

```ts
// src/content/wheel-series.ts —— 生成物
export type WheelSeries = {
  slug: string;                 // "cross-spoke-6" —— URL 段（清洗后，无商标）
  name: string;                 // 展示名（清洗后）
  nameSource: string;           // ⚠️ 原始 styleName，仅供审计/后台，不上前台
  hasTrademarkRisk: boolean;    // ⚠️ true 的系列不得直接上线
  models: WheelModel[];         // 该系列的型号（已滤 hasImage）
  count: number;
};
```

**🔴 铁律**：
1. **`generateStaticParams` 只返回 `hasTrademarkRisk === false` 的系列**
2. **`nameSource` 永不渲染到 DOM** —— 只用于内部审计
3. **未通过商标清洗的系列，其 `slug` 不得进 `sitemap.ts`**
4. `styleName` 缺失的 **587 个型号不进任何系列页**（README §2.5）——
   它们只出现在目录页与单品页

### 4.3 SEO

| 项 | 规格 |
|---|---|
| title | `<系列名> 轮毂系列 — 峰徊` （⚠️ 系列名必须已清洗） |
| description | 系列定位 + 型号数 + 尺寸范围 |
| 结构化数据 | `ItemList`（不是 `Product` —— 本页是列表） |
| BreadcrumbList | 四级：首页 › 产品中心 › 轮毂 › 系列 |

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180） |
| 网格 | 复用 `<WheelModelGrid>`：≥1440 → 4 列 ｜ 1024 → 3 ｜ **768 → 2（★ 必测）** ｜ 390 → 2 紧凑 |
| 卡片图 | **1:1**，`object-fit: contain` |
| 分组间距 | 组间 `py-12`，组标题与网格 `mt-6` |
| 深色段 | **① 可做深色 Hero**（与目录页全浅色区分），② 起回到浅色 |
| 动效 | 每个分组用 `[data-reveal-group]`（80ms/项，**每组上限 12 项**） |
| 分页 | `> 48` 显示（复用 `<Pagination>`） |

**⚠️ 768 断点必须专项测试** —— 与目录页同一条纪律（竞品正是在此溢出）。

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 归属 |
|---|---|---|---|
| 1 | **🔴 第三方商标清洗名单与替代命名**（`TE37`/`BBS-LM`/`HRE-FF10`… → 丰怀命名） | **整页（URL + 标题 + 文案）** | 决策 + 法务 |
| 2 | `styleName` 762 个值 → **系列 slug 的归一化规则**（大小写/空格/连字符/中文） | `generateStaticParams` | 施工方 |
| 3 | **每系列型号数分布**（是否有些系列只有 1 个型号？是否该建页？） | 页数 | 数据 |
| 4 | ③ 工艺对照表是否与 `/capabilities` 共用 → 是否提取 `<ProcessCompare>` | 组件边界 | 施工方 |
| 5 | 是否加「其他系列」底部导航（本期判定：不做） | ④ 段形态 | 设计 |
| 6 | `styleName` 中**中文系列名 vs 英文系列名**的展示口径 | H1 | 内容 |
| 7 | 系列页是否需要**共享 OG 图**（无实拍图时） | SEO | 视觉 |

---

## 附：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 四段式（系列说明 / 型号列表 / 与工艺的关系 / 询盘） | `../../../ARCHITECTURE/page-architecture/README.md` §2.5 |
| `styleName` 只覆盖 762/1349 → 只为这 762 建系列 | 同上 §2.5 数据约束 |
| 第三方商标不得作为系列名 | 同上 §2.5 命名风险 + §4 待确认项 #4 + `DEC-010` |
| 缺数据不静默排除（未标注工艺单列） | `wheel-catalog-page.md` §3.2 铁律一 |
| 无图不上架 | `DEC-013` |
| 卡片 1:1 contain | `DEC-014` |
| 每页必须有询盘入口 | 同上 README §3.2 |
