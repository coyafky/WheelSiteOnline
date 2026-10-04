# `/fitment/*` 页面规格（三条专题页族 —— 车系 / PCD / 尺寸）

> **路由**：`/fitment/[vehicle]` ｜ `/fitment/pcd/[pcd]` ｜ `/fitment/size/[size]`
> **目标文件**：`src/app/fitment/[vehicle]/page.tsx`（新建）｜ `src/app/fitment/pcd/[pcd]/page.tsx`（新建）｜ `src/app/fitment/size/[size]/page.tsx`（新建）
> **渲染**：**静态生成 + `generateStaticParams`**（全部枚举，无客户端筛选）
> **数据**：★ **生成物** `src/content/fitment-by-model.ts`（`styleName` 派生，见 §4）｜ `content/fitment.ts`（文案）｜ `WheelModel` 类型
> **设计依据**：`fitment-pages-plan.md`（车系方案）｜ `wheel-browsing-and-fitment-pages.md` §3-§4（切法 + §3.3 两层区分）

---

## 0. 一句话

**三条线是同一种页面的三种切法 —— 共用一套八段式模板，数据全部来自同一批目录数据。**

```
                    ┌────────────────────┐
                    │   1349 个型号       │   ← assets/wheel-data/WHEEL-CATALOG-ALL.json
                    └─────────┬──────────┘
          ┌───────────────────┼───────────────────┐
          ↓                   ↓                   ↓
   /fitment/[vehicle]   /fitment/pcd/[pcd]   /fitment/size/[size]
   按 styleName 派生     按 pcds              按 sizes/sizeCategory
   覆盖 762/1349         覆盖 1349/1349 ✅     覆盖 1349/1349 ✅
```

**🔴 全页最重要的一件事是「不说谎」** —— 这是全站证据纪律最严的页面族。
我们有的是「**这个型号的目录标注里提到了坦克**」，**不是「这个型号适配坦克 300」**。
两者差别是根本性的（`wheel-browsing-and-fitment-pages.md` §3.3），**不得混淆**。

**★ 三条线里 PCD / 尺寸覆盖率 100%（不像车系只有 57%）** ——
它们是**全站最扎实的专题页类型**，且搜索意图最明确（采购方知道自己车的 PCD，不知道要哪个型号）。

**⚠️ 现有 `/fitment/[platform]` 与 `/fitment/page.tsx` 是竞品底本**（宝马 M 车系），
`suitableVehicles` 全空 —— **本族页是它的替代物，不是延伸**（见 §6 #1）。

---

## 1. 页面骨架（八段式）

**三条线共用这个骨架** —— 只有 ②③④ 的内容随切法变，其余段落逐字相同。

| 序 | 内容块 | 必须性 | 说明什么 | 就绪度 |
|---|---|---|---|---|
| ① | **车系/专题 hero** | 必须有 | **这条线最矮的 hero**（服务图文，不抢眼） | ✅ |
| ② | ★ **快捷路径** | 必须有 | 车系：按具体车型分区；PCD/尺寸：无 → **改为主筛入口** | ✅ |
| ③ | ★★ **型号列表** | 必须有 | 该切法命中的型号 —— 复用 `<WheelModelGrid>` | ⚠️ 依赖目录接入（§4.3） |
| ④ | **PCD/尺寸分布** | 必须有 | ★ **「目录标注统计」口径**（🔴 见 §2④） | ⚠️ 依赖生成物 |
| ⑤ | 设计方向 | 必须有 | 该切法车主常比较的几种 | ✅ |
| ⑥ | 安装注意 | 必须有 | ★ **只写通用提示，不写具体 ET** | ✅ |
| ⑦ | 路由段 | 必须有 | T7 三条出口（`<RouteBlock>` / `<RouteStep>`） | ✅ |
| ⑧ | FAQ + CTA | 必须有 | `<FaqAccordion>` + 询盘（**携带切法上下文**） | ✅ |

```
/fitment/tank            （车系线示例）
├── ① <FitmentHero>              eyebrow + H1「坦克轮毂」+ 一句 + 🔴 免责句
├── ② <QuickPaths>              坦克300 / 坦克400 / 坦克500 / 坦克700 分区锚点
├── ③ <WheelModelGrid>   ★★      该车系 77 个型号 → <WheelCard> × N
├── ④ <DistributionBlock>  ★     PCD / 尺寸分布（文案口径见 §2④）
├── ⑤ <DesignDirectionGrid>     越野向设计方向
├── ⑥ <FitmentNotes>            通用安装提示（🔴 无具体数值）
├── ⑦ <RouteBlock>              T7：三条出口
└── ⑧ <FaqAccordion> + <DealerCta>
    <DataNotice>                🔴 免责句（与 hero 的免责句同源）
```

**★ 三条线的段落差异表**：

| 段 | `/fitment/[vehicle]` | `/fitment/pcd/[pcd]` | `/fitment/size/[size]` |
|---|---|---|---|
| ① hero | 「**坦克** 轮毂」+ 77 型号 | 「**6×139.7** 轮毂」 | 「**19 寸** 轮毂」 |
| ② 快捷路径 | **按车型分区**（300/400/500/700） | **PCD 兄弟链**（5×114.3 / 5×112…） | **尺寸兄弟链**（18 / 20…） |
| ③ 型号列表 | 77 个（坦克） | 193 个（6×139.7） | 346 个（19 寸） |
| ④ 分布 | **PCD 分布 + 尺寸分布** | **尺寸分布 + 孔数分布** | **PCD 分布 + 款式(HP/越野)** |
| ⑤ 设计方向 | 越野向 | 通用 | 通用 |

---

## 2. 逐块规格

### ① 车系 hero（**这条线最矮的 hero**）

| 项 | 规格 |
|---|---|
| 高度纪律 | 🔴 **全站最矮的 hero** —— 服务图文页，**不得用首页的高 hero**（竞品此页 620px） |
| 结构 | `.eyebrow` + `<h1>` + 一句 + 🔴 **免责句（见下）** |
| eyebrow | `FITMENT`（三线统一） |
| H1 | `<车系> 轮毂` / `<PCD> 轮毂` / `<尺寸> 轮毂` |
| 容器 | `.container-fh`（1180） |
| 深色段 | ⚠️ **浅色底色** —— 与首页/产品页的深色 hero 区分（专题页是服务页，不是门面） |

**🔴 免责句必须出现在 hero 里（逐字，不得改写）**：

> **本页型号基于产品目录的车型标注整理，非确认适配。具体安装请以下单前工程确认为准。**

```ts
// src/components/fitment-hero.tsx（需新建）
type FitmentHeroProps = {
  eyebrow: string;              // "FITMENT"
  title: string;               // "坦克 轮毂"
  support: string;             // 一句定位（≤40 字）
  /** ★ 该切法命中的型号数 —— 用于「本页 N 个型号」 */
  modelCount: number;
  /** ★ 切法类型 —— 决定 hero 角标措辞 */
  kind: "vehicle" | "pcd" | "size";
  /** 🔴 免责句（必填，从 <DataNotice> 同一常量取，不硬编码） */
  disclaimer: string;
};
```

**⚠️ 免责句的唯一事实源**：与 `<DataNotice>` 共用同一个常量
（建议 `src/content/fitment.ts` 导出 `FITMENT_DISCLAIMER`），
**hero 与页尾 `DataNotice` 引用同一字符串** —— 防止两处措辞漂移。

### ② 快捷路径 / 兄弟链

**车系线（本段是本页的导航主体）**：

```
坦克300 (25)   坦克400 (10)   坦克500 (1)   坦克700 (1)   坦克（未指明）(29)
```

| 项 | 规格 |
|---|---|
| 组件 | `<QuickPaths>`（**需新建**） |
| 车系线 | 按 `styleName` 细分车系分区（锚点跳转 `#model-<key>`） |
| PCD/尺寸线 | **改为兄弟链**：「其他 PCD / 其他尺寸」横向 pill 链（`<TagRow>` 语义） |
| 交互 | 车系线是页内锚点；PCD/尺寸线是**跨页链接**（同族 `<Link>`） |
| 数据 | `modelCount` 必须随分区显示（「坦克300（25）」） |

```ts
// src/components/quick-paths.tsx（需新建）
type QuickPath = {
  key: string;               // "tank-300" | "tank-400" | … （锚点 id）
  label: string;             // "坦克300"
  count: number;             // 25
  /** 车系线：页内锚点 href="#model-tank-300"；PCD/尺寸线：跨页 "/fitment/pcd/5x114-3" */
  href: string;
  active?: boolean;          // 兄弟链里标记「当前页」
};

type QuickPathsProps = {
  eyebrow: string;
  heading: string;
  paths: QuickPath[];
  /** "anchor" = 车系分区（本页内）；"cross" = 兄弟链（跨页） */
  mode: "anchor" | "cross";
};
```

### ③ ★★ 型号列表（**复用 `<WheelModelGrid>` + `<WheelCard>`**）

| 项 | 规格 |
|---|---|
| 组件 | **`<WheelModelGrid>` + `<WheelCard>`（与 `/products/wheels` 同一组件，见 §3.1）** |
| 布局 | 同目录页：≥1440 四列 / 1024 三列 / 768 两列 / 390 两列紧凑 |
| 每页数量 | ⚠️ **本页不分页** —— 专题页是「全集展示」（坦克 77 / PCD 可到 193） |
| 卡片 props | 逐字复用 `products/wheels.md` §2④ 的 `WheelCardProps`（**不扩字段**） |
| 分区 | 车系线按具体车型分区（`#model-tank-300` 锚点）；PCD/尺寸线单块 |
| 动效 | `[data-reveal-group]` 错峰，**上限 12 项**（同目录页纪律） |
| 🔴 无图不上架 | `hasImage === false` 的型号**不进列表、不进 sitemap**（`DEC-013`） |

**🔴 型号列表的数据口径（三线各自不同）**：

| 线 | 命中条件 | 实测 |
|---|---|---|
| 车系 | `vehicleHints.includes(车辆key)` —— **从 `styleName` A 类派生** | 坦克 77 / BJ40 40 / 牧马人 13 |
| PCD | `pcds.includes("6*139.7")` —— **精确匹配，含归一化** | 6×139.7 → 193 |
| 尺寸 | `sizeCategory === "19寸"`（已归一化，`17寸-3` → `17寸`） | 19 寸 → 346 |

**⚠️ PCD 归一化必须与目录筛选器同一套规则** —— 否则 `/fitment/pcd/5x114-3` 的计数
与 `/products/wheels?pcd=5*114.3` 的计数**会对不上**（同一份数据两套解析 = 事故）。
**→ `buildFitmentIndex()` 与筛选器 facet 生成必须 import 同一个 `normalizePcd()`。**

### ④ ★ PCD / 尺寸分布（**全页最危险的一段 —— 口径错了就是发布未确认数据**）

**🔴 这是本规格的核心纪律段。逐条落位**：

| # | 纪律 | ✅ 正确写法 | ❌ 事故写法 |
|---|---|---|---|
| 1 | **不得写「确认适配」** | 「基于产品目录标注的车型参考」 | 「确认适配坦克300」 |
| 2 | **目录统计 ≠ 车辆规格** | 「**本页 77 个型号的目录标注 PCD 均为 6×139.7**」 | 「**坦克300 的 PCD 是 6×139.7**」 |
| 3 | **不写具体 ET** | 「ET 需工程确认」 | 「建议 ET +25」 |
| 4 | **统计必须带主语** | 「本页型号的…分布」 | 「该车规格为…」 |

**实测数据（写进页面时必须带上「本页 N 个型号」这个限定语）**：

| 线 | 页面文案（✅ 正确口径） |
|---|---|
| 坦克 | 「**本页 77 个型号的目录标注 PCD 均为 `6×139.7`**（单一值，无例外）。」 |
| BJ40 | 「本页 40 个型号的目录标注 PCD 分布：…」 |
| 牧马人 | 「本页 13 个型号的目录标注 PCD 分布：…」 |

**⚠️ 坦克那条「100% 单一值」尤其危险** —— 它**看起来像**车辆规格（因为太干净），
**但实际上仍然只是目录标注**。页面必须**明确写出「目录标注」四个字**，
**不能因为「100% 一致」就升级为车辆规格**（源码注释 `types.ts:447-450` 已警告此点）。

```ts
// src/components/distribution-block.tsx（需新建）
type DistributionRow = {
  label: string;             // "6×139.7" | "19寸" | "5孔"
  count: number;             // 77
  /** 占比（用于条宽）—— ⚠️ 分母是本页型号数，不是全目录 */
  ratio: number;             // count / totalModels
};

type DistributionBlockProps = {
  eyebrow: string;
  heading: string;
  /** 🔴 主语限定：本页命中的型号总数（★ 必须出现在正文里） */
  totalModels: number;
  rows: DistributionRow[];
  /** 🔴 口径标签：三线统一传「目录标注统计」 */
  basis: "catalogue-annotation";
  /** 🔴 免责句（与 hero 同源常量） */
  disclaimer: string;
  /** ⚠️ 无图表库 → 用条宽 div，不用 svg/canvas */
  variant?: "bars" | "table";
};
```

**🔴 无图表库**（`_components.md` §4）—— 分布只能用 **`<div>` 条宽** 或 **表格**，
**不得引入 recharts / d3**。条宽用 `style={{ width: ratio*100 + "%" }}`（inline，动态值），
色用 `--color-forge`。

### ⑤ 设计方向

| 项 | 规格 |
|---|---|
| 组件 | 复用现有 `<fitment/[platform]>` **E 段**的「方向卡网格」结构（`designDirections`） |
| 数据 | `PlatformFitment.designDirections`（`types.ts:325` —— **已存在**） |
| 车系线 | 越野向（防脱圈风格 / 粗辐条 / 深 ET 视觉…）⚠️ **方向描述不得含具体数值** |
| PCD/尺寸线 | 通用方向（HP / 越野款两类，对应 `sizeCategory` 的 HP/越野款分组） |

### ⑥ 安装注意（**🔴 只写通用提示，不写具体 ET**）

**清单（逐字，不得加数值）**：

```
✅ 中心孔 CB 与孔距必须与车辆原始规格一致 —— 我们不建议用变径圈/垫片「凑」适配
✅ 螺栓规格（螺纹/锥面/球面）必须与轮毂座面匹配 —— 下单前确认
✅ 刹车卡钳避让与轮眉间隙需实测 —— 大刹车套件尤甚
✅ 悬挂状态（升高/原厂）会改变可用 ET 范围 —— 需工程确认
❌ 不写具体 ET 值 / 不写「推荐 ET +xx」
❌ 不写「本页型号可直接安装」
```

| 项 | 规格 |
|---|---|
| 组件 | `<FitmentNotes>`（需新建）或复用现有 `<fitment/[platform]>` **F 段**的 `<ul>` 结构 |
| 数据 | `PlatformFitment.fitmentNotes: string[]`（`types.ts:338` —— **已存在**） |
| 图标 | `lucide-react` 的 `TriangleAlert`（现有页已在用） |

### ⑦ 路由段（T7：三条出口）

**三条出口固定**（与 `contact.md` 的 T7 同源）：

```
① 「我有具体型号」  → /products/wheels
② 「我想看设计」    → /gallery/wheels（⚠️ 阶段暂缓，见 §6 #7）
③ 「直接要报价」    → /request-a-quote?from=fitment&series=<key>   ★ 携带上下文
```

| 项 | 规格 |
|---|---|
| 组件 | **`<RouteBlock>`（需新建，公共名）** |
| 数据 | **`RouteStep` 类型（`types.ts:105` —— 已存在）** |
| 交互 | ③ 必须携带 `InquiryContext`（`series` + `sourcePageType:"other"`）→ 见 `request-a-quote.md` §2③ |

```ts
// src/components/route-block.tsx（★ 公共组件名，与其它规格统一）
import type { RouteStep } from "@/content/types";   // { step, title, body, href, linkLabel }

type RouteBlockProps = {
  eyebrow: string;
  heading: string;
  steps: RouteStep[];          // 恰好 3 条（T7）
  variant?: "light" | "soft";
};
```

### ⑧ FAQ + CTA

| 项 | 规格 |
|---|---|
| 组件 | **`<FaqAccordion>`（需新建，公共名）** + **`<DealerCta>`（复用，21 处）** |
| 数据 | `PlatformFitment.faqs: FaqEntry[]`（`types.ts:339`）+ `FaqEntry`（`types.ts:77`） |
| 🔴 FAQ 纪律 | **没有一条答案可以引用具体测量值** —— 现有页已遵守（「None of them quote a measurement value」） |
| CTA 上下文 | 询盘链接**必须带上本页切法**（`?from=fitment&series=tank` 或 `&pcd=6*139.7`） |
| 交互 | 手风琴展开，`aria-expanded`；默认全收起 |

```ts
// src/components/faq-accordion.tsx（★ 公共组件名 —— 全站 FAQ 统一）
import type { FaqEntry } from "@/content/types";

type FaqAccordionProps = {
  eyebrow?: string;
  heading: string;
  items: FaqEntry[];
  /** 手风琴展开模式 */
  mode?: "single" | "multiple";
  /** ★ 新增：是否输出 FAQPage JSON-LD（专题页 true） */
  jsonLd?: boolean;
  variant?: "light" | "soft";
};
```

---

## 3. 组件清单

### 3.1 复用已有（标路径）

| 组件 | 路径 | 用途 | 备注 |
|---|---|---|---|
| **`<DealerCta>`** | `sections/dealer-cta.tsx` | ⑧ 收尾 | ✅ 复用（21 处） |
| **`<WheelCard>`** | **（目录页新建）** | ③ 型号卡 | ★ **同一组件**，见 `products/wheels.md` §3.2 |
| **`<WheelModelGrid>`** | **（目录页新建）** | ③ 网格 | ★ **同一组件**，三线共用 |
| **`<DataNotice>`** | **（`contact.md`/`[model].md` 新建）** | 免责句 | ★ **全站唯一免责组件** |
| 现有 `PlatformFitment` 的 E/F 段结构 | `src/app/fitment/[platform]/page.tsx:190-260` | ⑤⑥ 段 | ⚠️ 复制结构，**不 import**（现有页将被替换） |

**🔴 提取纪律**：`<WheelCard>` / `<WheelModelGrid>` / `<DataNotice>` **都必须从第一天就在
`src/components/`** —— 目录页 + 单品页 + 本族页（3 处）共用，写在任一页面文件里就是复制。

### 3.2 需新建（标路径 + 职责 + 复用度）

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<FitmentHero>`** | `src/components/fitment-hero.tsx` | ① 最矮 hero + 免责句 | **3 线** |
| **`<QuickPaths>`** | `src/components/quick-paths.tsx` | ② 分区锚点 / 兄弟链 | **3 线** |
| **`<DistributionBlock>`** | `src/components/distribution-block.tsx` | ④ 分布（**目录标注口径**） | **3 线** |
| **`<RouteBlock>`** | `src/components/route-block.tsx` | ⑦ T7 三条出口 | **3 线 + 其它页** |
| **`<FaqAccordion>`** | `src/components/faq-accordion.tsx` | ⑧ FAQ + JSON-LD | **全站** |
| **`<WheelCard>`** | `src/components/wheel-card.tsx` | ③ 型号卡 | **3+ 页**（目录页新建） |
| **`<WheelModelGrid>`** | `src/components/wheel-model-grid.tsx` | ③ 响应式网格 | **3 线 + 系列页** |
| **`<DataNotice>`** | `src/components/data-notice.tsx` | 免责句 | **全站** |
| **`<TagRow>`** | `src/components/tag-row.tsx` | ② PCD/尺寸线兄弟链 | **2+ 页**（`[model].md` 同） |
| **`<Breadcrumb>`** | `src/components/breadcrumb.tsx` | 「首页 › Fitment › 坦克」 | **3+ 页** |
| **`buildFitmentIndex()`** | `src/lib/fitment-index.ts` | ★ `styleName` → 车系映射（**§4 核心**） | **3 线 + sitemap** |

**⚠️ 与既有规格的组件名统一**：`FaqAccordion` `RouteBlock` `DataNotice`
`WheelCard` `WheelModelGrid` `Breadcrumb` `TagRow` —— **全与
`products/wheels.md` / `products/wheels/[model].md` / `contact.md` 同名同路径**，
**不得在本规格另起名**。

---

## 4. 数据契约

### 4.1 ★ 生成物路径（**本规格的核心交付物**）

```
assets/wheel-data/WHEEL-CATALOG-ALL.json        （1349 型号 —— 真实现状：未接进 src/）
        │
        │  ★ 构建期脚本  scripts/generate-fitment-index.mjs
        │     ① 提取 models[].styleName
        │     ② 分类：A 车型 / B 品牌款号 / C 形状  （fitment-pages-plan.md §3）
        │     ③ 只保留 A 类 → 归一化（坦克 → tank）
        │     ④ 建立 车辆key → 型号列表 映射
        │     ⑤ 同时遍历 pcds / sizes 建立反查索引
        ▼
src/content/fitment-by-model.ts                 ← 生成物（禁手改，文件头写生成命令）
        ├── vehicleIndex:  Record<VehicleKey, string[]>        （型号 code 列表）
        ├── pcdIndex:      Record<PcdKey, string[]>             （归一化 PCD → 型号）
        ├── sizeIndex:     Record<SizeKey, string[]>            （归一化尺寸 → 型号）
        └── meta: { generatedAt, sourceFile, stats }
```

**★ 为什么落这里**：与 `products/wheels.md` §4.1 的 `src/content/wheel-catalogue.ts`
**同级同目录**（同属「构建期生成、禁手改」的内容层文件）——
**不要放进 `src/app/`**，因为它被 3 个路由 + `sitemap.ts` 共用。

**⚠️ 脚本与 `wheel-catalogue.ts` 生成脚本的关系**：
若两者都从同一份 `WHEEL-CATALOG-ALL.json` 生成，**必须共用同一个清洗/归一化模块**
（`scripts/lib/normalize.mjs`）—— 否则 PCD 计数会与目录筛选器对不上（§2③ 已警告）。

### 4.2 索引 key 规范化（三线各自）

```ts
// src/content/fitment-by-model.ts（生成物形状）
export type VehicleKey = string;   // "tank" | "tank-300" | "bj40" | "wrangler" | …
export type PcdKey = string;       // ★ 归一化小写连字符："5x114-3" | "6x139-7"
export type SizeKey = string;      // ★ 归一化纯数字："15" | "19" | "hp" | "offroad"

export type FitmentIndex = {
  /** 车系线：车辆 key → 命中型号的 model code 列表 */
  vehicleIndex: Record<VehicleKey, string[]>;
  /** PCD 线：归一化 PCD → 型号列表 */
  pcdIndex: Record<PcdKey, string[]>;
  /** 尺寸线：归一化尺寸 → 型号列表 */
  sizeIndex: Record<SizeKey, string[]>;
  meta: {
    generatedAt: string;           // ISO 8601
    sourceFile: string;            // "assets/wheel-data/WHEEL-CATALOG-ALL.json"
    styleNameCoverage: number;     // 762（车系线覆盖率）
    stats: { total: number; byVehicle: number; byPcd: number; bySize: number };
  };
};
```

**🔴 归一化规则（实测验证）**：

| 维度 | 原始 | 归一化 key | 显示值 |
|---|---|---|---|
| PCD | `5*114.3` | `5x114-3` | `5×114.3` |
| PCD | `6*139.7` | `6x139-7` | `6×139.7` |
| 尺寸 | `19寸` / `19寸-2` | `19` | `19 寸` |
| 尺寸 | `越野款` | `offroad` | `越野款` |
| 尺寸 | `HP` | `hp` | `HP` |

**⚠️ PCD 分隔符**：数据里是 `*`（星号），**URL 里用 `x`（字母）** ——
`*` 在 URL 中是保留/歧义字符。**页面显示统一为 `×`（U+00D7 乘号）**。

### 4.3 ★ 车系 key 的列表（起步做 3 个）

| key | 显示 | 型号数（实测） | 状态 |
|---|---|---|---|
| `tank` | 坦克 | **77**（含 300/400/500/700 + 未指明） | ✅ **起步** |
| `bj40` | 北京 BJ40 | **40** | ✅ **起步** |
| `wrangler` | 牧马人 | **13** | ✅ **起步** |
| `tank-300` | 坦克300 | 25 | P1（坦克总页太挤时拆） |
| `audi` / `toyota` / `benz` / `bmw` | — | 34 / 33 / 30 / 28 | P2 |

**⚠️ 坦克细分（供 ② 段分区）**：坦克 29（未指明）/ 坦克300 25 / 坦克400 10 / 坦克500 1 / 坦克700 1
→ **500/700 并进「坦克」总页，不单独建页**。

**⚠️ 牧马人实测 13**，⚠️ 之前文档写「11」—— **以生成为准，生成脚本做对账**。

### 4.4 🔴 复合条目必须拆成三条线（**否则看起来像重复**）

```
styleName: "长城炮/坦克/北京212"   →  11 个型号

❌ 若整串当 value：/fitment/tank、/fitment/changchengpao、/fitment/beijing-212
    三个页面各显示这 11 个型号 → 用户以为是重复内容（且 SEO 上近乎重复页）

✅ 必须拆：拆成三个独立 key，各自命中一次
    changchengpao  ← 11（长城炮线）
    tank           ← 11（并入坦克 77 → 88？⚠️ 见下）
    beijing-212    ← 11（北京212线）
```

**🔴 拆分规则待定（§6 #5）** —— 若 `tank` 页把复合条目也计入，「坦克」会从 77 变 88，
**这会破坏「本页 77 个型号」这个已经写进多处文档的数字**。
**建议**：复合条目**单列一个「共享标注」分区**（坦克页显示「另有 11 个型号同时标注了长城炮与北京212」），
**不计入 77**，保持数字稳定。

### 4.5 输入类型（**全部已存在，不新建**）

```ts
import type {
  WheelModel,          // types.ts:419 —— 型号数据源
  FitmentModel,        // types.ts:299 —— 车系页型号行（code/name/years/sizes/notes/verified）
  PlatformFitment,     // types.ts:327 —— 现有 platform 形状（designDirections/fitmentNotes/faqs）
  FaqEntry,            // types.ts:77  —— FAQ
  RouteStep,           // types.ts:105 —— ⑦ 路由段
  DesignDirection,     // types.ts:323 —— ⑤ 设计方向
} from "@/content/types";
```

**⚠️ 类型复用说明**：
- ⑤⑥ 段直接用 `PlatformFitment` 的 `designDirections` / `fitmentNotes` / `faqs` 字段
  —— **现有类型够用，不必新建 `FitmentFamily` 类型**。
- ③ 段（型号列表）用 `WheelModel`，**不用** `FitmentModel`
  —— 因为 `FitmentModel` 是「chassis code + 年款」结构（宝马 M 底本），
  我们的车系线是「目录型号」，**两者语义不同**。

### 4.6 就绪度总表（逐段）

| 段 | 依赖 | 就绪度 |
|---|---|---|
| ① hero | 文案 + 免责句常量 | ✅ |
| ② 快捷路径 | 生成物 `vehicleIndex` | ⚠️ 依赖 §4.1 生成 |
| ③ 型号列表 | **`WheelModel` 数据接入 `src/`** + `hasImage` + 图片搬运 | ⚠️ **传递性阻塞** |
| ④ 分布 | 生成物 `pcdIndex` / `sizeIndex` | ⚠️ 依赖 §4.1 生成 |
| ⑤ 设计方向 | `content/fitment.ts` 文案 | ✅（需按车系重写） |
| ⑥ 安装注意 | 通用提示文案 | ✅ |
| ⑦ 路由段 | `RouteStep[]` 文案 | ✅ |
| ⑧ FAQ + CTA | `FaqEntry[]` + 询盘链接带上下文 | ⚠️ CTA 依赖 `buildInquiryContext()`（`request-a-quote.md` §3.2） |

**→ 8 段里，③④ 阻塞在「目录接入 + 生成脚本」，其余基本就绪。**

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh`（1180）正文段；③ 型号网格用 `.container-fh-wide`（1440） |
| 桌面布局 | 默认单列纵向；④ 分布可 `lg:grid-cols-2`（PCD 分布 + 尺寸分布并排） |
| ③ 网格 | ≥1440 四列 / 1024 三列 / 768 两列 / 390 两列紧凑（**同目录页**） |
| 卡片图 | **1:1** + `object-fit: contain`（`DEC-014`） |
| 深色段 | ⚠️ **无** —— 专题页全浅色（hero 也是浅色，见 §2①） |
| 动效 | 每段 `[data-reveal]`；③ 网格 `[data-reveal-group]`（**上限 12 项**） |
| 🔴 fail-visible | **不要自己加 `opacity-0`**（`globals.css:224-267`） |
| 按钮 | `.btn-pill-solid` / `.btn-pill-outline` —— **不是 `<Button>`** |
| 图标 | `lucide-react`（`TriangleAlert` / `ArrowRight` / `CircleHelp`） |
| 🔴 无图表库 | ④ 分布**只用 `<div>` 条宽**，不得引入图表库 |

**⚠️ ③ 段不分页的后果**：`/fitment/pcd/5x114-3` 有 **662 个型号**（PCD 线最大值）
—— 一次性渲染 662 张卡片**性能与体验都不可接受**。**待定（§6 #6）**：
要么截断（显示前 48 + 「查看全部 → 去目录页」），要么分页。
**本规格建议截断**（专题页是入口，不是目录）。

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 就绪度 |
|---|---|---|---|
| **1** | **现有 `/fitment/page.tsx` + `/fitment/[platform]/page.tsx`（宝马 M 底本）如何处置** | **整族** | 🔴 **待拍板**（替换/保留/合并） |
| **2** | ★ **路由归属矛盾**：PCD/尺寸放 `/fitment/` 还是 `/wheels/` 下 | **② ③ ④ 全部** | 🔴 **文档矛盾，待拍板**（见附 A） |
| **3** | **`WheelModel` 数据接入 `src/`** + 图片搬运 | ③ | ⚠️ 传递性阻塞（同 `products/wheels.md` #1-2） |
| **4** | **`styleName` → 车系映射脚本**（`scripts/generate-fitment-index.mjs`） | ①②④ | ⚠️ **未写** |
| **5** | **复合条目（长城炮/坦克/北京212，11 型号）拆分规则** | ③④ 数字 | 🔴 待定（§4.4 —— 影响「77」这个数） |
| **6** | **③ 型号列表是否分页/截断**（PCD 线 662 个） | ③ | ⚠️ 待定 |
| **7** | `/gallery/wheels` 阶段暂缓 → ⑦ 路由段出口 ② 指向失效 | ⑦ | ⚠️ 暂缓（`_components.md` §6） |
| **8** | **车企商标**：`坦克300`/`BJ40`/`牧马人` 能否作页面标题 | ① H1 | 🔴 **法务**（`fitment-pages-plan.md` §9 #2） |
| **9** | **B/C 类 styleName 处理**（`TE37`/`BBS-LM` 商标；`螳螂刀锋` 形状） | 生成物分类 | 🔴 **法务**（DEC-010） |
| **10** | **`sizeCategory` 归一化规则**（`17寸-3` → `17寸`）是否按 `browsing §2.3` | ④ | ⚠️ 待定（须与筛选器同规则） |
| **11** | PCD 归一化（`*` → `x`）与 URL 编码 | ② | ⚠️ 待定 |
| **12** | 车系页**是否公开 PCD 分布**（本规格按「标注目录统计」口径已写，但需产品确认敢不敢发） | ④ | ⚠️ 待确认 |

**🔴 阻塞汇总：#1 #2 #8 #9 是硬阻塞**（其中 #8 #9 需法务）。

---

## 附 A：🔴 与设计文档的对应 + 两处文档矛盾

### A.1 与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 八段式模板 | `fitment-pages-plan.md` §5 + `browsing §3.5` |
| ② 快捷路径（按车型分区） | `fitment-pages-plan.md` §4 段 2 |
| ③ 型号列表（来自 `styleName`） | `fitment-pages-plan.md` §6.1 派生流程 |
| ④ **目录标注口径（核心纪律）** | `browsing §3.3` 两层区分 + §3.4.1（坦克 100% 6×139.7） |
| ④ 坦克 = 77 型号 | 实测（本规格已复现：`坦克 matches: 77`，PCD 100% `6*139.7`） |
| ⑤⑥ 砍掉「SPEC RESOURCES」段 | `fitment-pages-plan.md` §5 末段 |
| ⑥ **只写通用提示不写 ET** | `fitment-pages-plan.md` §6.2 纪律 1 |
| ⑦ 三条出口（T7） | `browsing` T7 + `contact.md` §2⑦ |
| ⑧ FAQ 无测量值 | 现有 `/fitment/[platform]` FAQ 段已经如此 |
| ⑨ 复合条目拆分 | `fitment-pages-plan.md` §6.2 纪律 3 + `browsing §6` #6 |
| 三线互补优先级（PCD/尺寸 100%） | `fitment-pages-plan.md` §7.2-7.3 |

### A.2 🔴 矛盾一：PCD / 尺寸的路由归属（**必须拍板**）

```
ARCHITECTURE/page-architecture/README.md §2.16（第 499 行）：
    /fitment/pcd/[pcd]  /fitment/size/[size]     ← ★ 放 /fitment/ 下

ARCHITECTURE/page-architecture/wheel-browsing-and-fitment-pages.md §4（URL 建议）：
    「把 PCD 和 尺寸 放 /wheels/ 下（属产品维度），车系放 /fitment/ 下（属应用维度）」
    → /wheels/pcd/5x114-3  /wheels/size/19
```

**两文档冲突。两种 URL 方案的规格：**

#### 方案 A：`/fitment/` 下（README §2.16 口径）

```
/fitment/tank  /fitment/bj40  /fitment/wrangler        ← 车系
/fitment/pcd/6x139-7  /fitment/size/19                 ← PCD / 尺寸
```
- ✅ **族内内链天然同域**（三条线互相链接无需跨目录）
- ✅ `sitemap.ts` 一段搞定 `/fitment/*`
- ⚠️ **语义混装** —— 「PCD」是产品维度，挂在「fitment（应用）」下有点勉强

#### 方案 B：`/wheels/` 下（browsing §4 口径）

```
/fitment/tank  /fitment/bj40                            ← 车系（应用维度）
/wheels/pcd/6x139-7  /wheels/size/19                   ← PCD / 尺寸（产品维度）
```
- ✅ **语义干净** —— 产品维度归产品，应用维度归应用
- ⚠️ ⚠️ **与现有 `/products/wheels` 路由冲突** —— 本站轮毂目录在 `/products/wheels`，
  **不是 `/wheels`**（`_components.md` §6）。若用方案 B，PCD 页会落在 `/wheels/*`，
  **与目录 `/products/wheels/*` 形成两个轮毂 URL 前缀** → SEO 上混乱
- ⚠️ 需新增 `/wheels/*` 路由族，或改为 `/products/wheels/pcd/*`（更长）

#### ★ 本规格的倾向：**方案 A（`/fitment/` 下）**

三个理由：① README §2.16 是**更新的裁决层**（`fitment-pages-plan.md:§8` 明确说
「README.md §2.16 从『降级保留』改为『专题页族』」已改过）；② 方案 B 的 `/wheels/`
**在本站不存在**（目录是 `/products/wheels`），照搬会造出冲突前缀；
③ 三条线共用一套模板，**同目录内聚更好维护**。

**⚠️ 但若拍板方案 B**：本规格 §1-§5 **全部成立**，只需把 `/fitment/pcd/[pcd]` 机械替换为
`/products/wheels/pcd/[pcd]`（若用 `/products/wheels/` 前缀）——**段落、组件、数据一字不改**。

### A.3 🔴 矛盾二：现有 `/fitment/[platform]`（宝马 M）如何处置

- `_components.md` §3.1 记录：现有 `/fitment` `/fitment/[platform]` 都 import `content/fitment.ts`，
  内容全是 **BMW M / Mercedes-AMG / Audi RS**（竞品底本，`suitableVehicles` 全空）。
- 本规格要做的是**坦克 / BJ40 / 牧马人**（中文越野车系）。

**两种处置（待拍板，见 §6 #1）**：

| 方案 | 做法 | 后果 |
|---|---|---|
| **替换** | `[platform]` 改为 `[vehicle]`，内容换成中文车系；`platformFitments` 废弃 | ⚠️ 已外发的 `/fitment/bmw-m` 链接 301 到 `/fitment` |
| **并存** | 保留 `[platform]`（欧美车系）+ 新增 `[vehicle]`（中文车系） | ⚠️ 两个动态段语义重叠，路由歧义 |

**★ 本规格倾向「替换」** —— 因为：① 车系线的**数据源是同一个**（`styleName`），
欧美车系（宝马/奔驰/奥迪）同样可从 `styleName` 派生（34/30/28 型号，见 §4.3），
**不需要两套模板**；② 现有 `[platform]` 的 `FitmentModel` 结构（chassis code + 年款）
**与我们的目录型号语义不符**，强留会产生「宝马 M 用 code，坦克用 model」的两套心智。

**→ 若拍板「替换」**：现有 `content/fitment.ts` 的 `platformFitments` 保留为
**文案与结构参考**，但 `models` 字段不再使用（改用 `fitment-by-model.ts` 的生成数据）。

### A.4 ★ 与 `request-a-quote.md` 的接口

⑦ 段 CTA 与 ⑧ 段询盘链接**必须携带本页上下文**（`request-a-quote.md` §4.2 定义）：

```
/fitment/tank         →  /request-a-quote?from=fitment&series=tank
/fitment/pcd/6x139-7  →  /request-a-quote?from=fitment&pcd=6*139.7
/fitment/size/19      →  /request-a-quote?from=fitment&size=19
```

**⚠️ 这依赖 `buildInquiryContext()`（`request-a-quote.md` §3.2）识别 `from=fitment` +
`series`/`pcd`/`size` 三个新参数** —— **两规格必须同时落地**，否则 CTA 带过去的上下文会被丢掉。
