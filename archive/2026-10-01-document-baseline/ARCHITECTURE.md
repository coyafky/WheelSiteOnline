# 独立站模块架构规范

## 2026-10-04 首发规划补充（先于旧描述阅读）

用户确认深圳峰徊公司按 PPT，与蓝辉为共同股东下不同法人；四线平行，服务海外 B/C 客户，英文优先。目标 2026-11-04、整体运行维护约 1000 元/月。旧文中的“只做 B2B”与“单一工厂主体”不再适用。

结构目标登记：

- L3 保留类型化内容接缝，补齐异步读取、真实产品/变体、来源/图权与审核。WordPress/MySQL 为内容事实源，产品与变体独立记录；当前静态数组尚未被接通的 WP 读取函数替换。
- L5 采用英文根路径，首期不提供 cookie 切换的公开双语页面；后续中文用独立 URL。沿用 `/resources`，增加旋压/锻造入口并防止与型号动态路由冲突；10–20 个候选轮毂获准后首发，三条能力页不得补虚构 SKU。
- L6 推荐独立 PostgreSQL，询盘、明细快照、分配和邮件发件箱同事务保存；受保护发送器和签名回调处理投递。匿名询盘读取须关闭。服务端是运行时边界，不依赖 `standalone` 本身提供业务正确性。
- L7 保留 OpenNext，推荐 Cloudflare Workers 样机；WordPress/PHP/MySQL 独立托管；媒体/缓存/询盘存储分别管理。正式服务商、驱动、恢复套餐需验证，尚未购入或实施。
- 页面施工按 [本轮逐视口规格](PAGE-SPECS/2026-10-04-launch-viewport-spec.md) 执行；素材来自 [核验登记](outputs/site-launch-plan/03-content-and-assets.md)，不把预览图和 PPT 宣传语视为已批准资料。
- 文档版本与阅读顺序以 [项目文档导航](DOCUMENTATION.md) 为准。2026-10-01 的页面架构与施工图属于历史参考，不能覆盖 2026-10-04 首发正本。

详图与数据库契约见 [首发计划](outputs/site-launch-plan/README.md) 与 [数据库设计](outputs/site-launch-plan/02-data-and-inquiry-design.md)。技术组合为待实现建议；本轮未更改运行代码或 `src/content/types.ts`。决策理由见 DEC-023–025。下文 2026-10-01 的现状和数量保留作历史，不作为此次重新验证结果。

> **本文件是本站「有哪些模块、每个模块归谁管、数据从哪来」的单一事实源。**
>
> 任何新增页面、新增字段、接入新的内容源，都必须先在这里登记。
> 本文件只描述**架构**（模块边界与数据流），不描述**进度**（进度看 `STATUS.md`），
> 也不描述**决策理由**（理由看 `DECISIONS.md`），更不描述**设计**（设计看 `DESIGN.md`）。

- 版本：v1.1
- 建立日期：2026-10-01 ｜ 最近更新：2026-10-01（新增文档四层分工、视口驱动设计引用、
  三条非轮毂产品线、`src/lib/{wordpress,inquiry,i18n}` 三层、图片资产以实体文件为准）
- 适用仓库：`WordpressWheelSIte`（丰怀锻造轮毂独立站）

---

## 0. 三条不可违反的前提

在读任何模块之前，先接受这三条。它们约束了下文全部设计。

**① 本站是「四条平行产品线」的 B/C 询盘站，首期海外英文优先。**

这是本项目最容易搞错的一点。实测语料库与兄弟项目 IA
（`site-architecture.md`）确认，产品平台共 **四条**：

| 产品线 | 英文 | 现有资产 |
|---|---|---|
| 轮毂 | Wheels | **充足**（1349 型号 / 2757 图） |
| 新能源三电壳体 | EV Powertrain Housings | 仅语料 |
| 铝制品定制 | Custom Aluminum Components | 仅语料 |
| 自修复安全轮胎（洛克 LOAKE） | Safety Tires | 仅语料 |

**四条线在层级、字号、交互、卡片尺寸上平行。轮毂可以有更多子类和单品，
但不得被设置成其他三条线的父级。**

**② 前端 UI 克隆自竞品，可借鉴结构，不得搬运内容。**
详见 `DEC-010`。任何模块的文案与图片都必须是丰怀的。

**③ 未确认的数据不作为规格发布。**
详见 `DEC-004`。**注意：这条现在有了新的含义** —— 我们拿到了真实产品的
PCD / ET / CB / 尺寸数据（见 §3.2），所以「未确认」的判定标准从「我们没有」
变成了「**是否为该型号的实际生产数据**」。系列通用值不得冒充型号规格。

---

## 1. 模块总览

站点由 **7 个模块层**构成。每层有明确的职责与唯一数据源。

```
┌─────────────────────────────────────────────────────────────┐
│  L7  交付与运维     部署 / 域名 / 监测 / 回滚                  │
├─────────────────────────────────────────────────────────────┤
│  L6  询盘管线       表单 → 持久化 → 分配 → 邮件               │
├─────────────────────────────────────────────────────────────┤
│  L5  页面与路由     33 个路由模板 → 静态产物                  │
├─────────────────────────────────────────────────────────────┤
│  L4  展示组件       卡片 / 画廊 / 表格 / 计算器                │
├─────────────────────────────────────────────────────────────┤
│  L3  内容与数据层   src/content/*  ← 唯一接缝                 │
│                     + src/lib/{wordpress,inquiry,i18n}        │
├─────────────────────────────────────────────────────────────┤
│  L2  资产层         assets/ 图片 / 数据 / 语料                │
├─────────────────────────────────────────────────────────────┤
│  L1  规范与档案     AGENTS / PROJECT / STATUS / DECISIONS     │
│                     / ARCHITECTURE / DESIGN / PAGE-SPECS      │
└─────────────────────────────────────────────────────────────┘
```

**依赖方向严格自上而下。** L5 不得直接读 `assets/`，必须经 L3。
L3 不得依赖 L4/L5。违反依赖方向的改动一律视为架构错误。

---

## 2. L1 · 规范与档案层

### 2.0 ★ 四类文档的职责边界（2026-10-01 定案）

本仓库的「怎么记录」由**四类文档**分管。**它们互不复制，只互相引用。**

| 文档 | 回答的问题 | 性质 | 更新频率 |
|---|---|---|---|
| `ARCHITECTURE/` + **本文件** | **是什么形状** —— 模块边界、数据流、页面结构 | 结构 | 中频 |
| `DECISIONS.md` | **为什么是这个形状** —— 决策与取舍 | 理由 | 中频 |
| **`DESIGN.md`**（项目根） | **页面现在长什么样、为什么好看** —— 从已跑页面反推的**设计正本** | **沉淀**（不是禁令清单） | 低频 |
| **`PAGE-SPECS/`** | **照着搭什么** —— 按路由命名的页面施工图 | 施工图 | 高频 |

**边界规则（三条）：**

1. **`DESIGN.md` 是「存量」，`PAGE-SPECS/` 是「增量」。**
   `DESIGN.md` 只记录**已经跑起来的页面里反推出**的好设计（当前 26 个页面），
   不制定新规则、不设新限制（`DEC-019`）；`PAGE-SPECS/` 写新页面**怎么搭**，
   好设计验证成功后**回流**到 `DESIGN.md`。
2. **`ARCHITECTURE/page-architecture/` 与 `PAGE-SPECS/` 的分工**：
   前者说「**为什么这样设计**」（内容与布局的理由，与竞品对照），
   后者说「**照着搭什么**」（放哪个组件、吃什么 props、什么栅格）。
   **施工图不重复理由，需要理由时链接过去。**（`DEC-015`）
3. **数值的唯一来源是 `src/app/globals.css`。** `DESIGN.md` 只写用法不抄数值；
   `PAGE-SPECS/` 引用 `globals.css` 行号。

### 2.1 档案文件

| 文件 | 职责 | 更新频率 |
|---|---|---|
| `AGENTS.md` | agent 行为契约 | 低频 |
| `PROJECT.md` | 项目为什么存在 | 极低频 |
| `STATUS.md` | 现在做到哪了 | 高频 |
| `DECISIONS.md` | 为什么这样决定 | 中频 |
| **`ARCHITECTURE.md`** | **本文件 · 模块架构** | 中频 |
| **`DESIGN.md`** | **设计正本（见 2.0）** | 低频 |

**规则**：本文件说「**是什么形状**」，`DECISIONS.md` 说「**为什么是这个形状**」，
`DESIGN.md` 说「**长什么样**」。改架构要同时改本文件与 `DECISIONS.md`。

### 2.2 ★ 设计原则引用：视口驱动设计（全站第一原则）

> **本条原则高于网站其余所有设计内容。它与视觉无关，决定的是「页面上该有什么」。**

**不在此复制，权威正文在 `DESIGN.md` §0.5。** 架构层面只引用三条结论：

| 结论 | 出处 | 架构含义 |
|---|---|---|
| **一个视口 = 一个核心问题**（1 主信息 + 1 主视觉 + 1 主行动 + 0–2 次行动） | `DESIGN.md` §0.5.1 | 讨论「这一页放几个 Section」之前，先问「这一屏要回答哪个问题」 |
| **★ 合并或删除律**：两个连续 Section 没回答两个不同问题 → **合并或删除** | `DESIGN.md` §0.5.2 | 这是一条**删除授权**，不是排版偏好 —— 它直接决定 §6 页面骨架的段数 |
| **询盘组件必须完整落在一个视口内**（含提交按钮） | `DESIGN.md` §0.5.4 | 询盘页的视口划分**由表单尺寸决定**，不是先定视口再塞表单 |

**⚠️ 与 `PAGE-SPECS/` 的待办**：`DESIGN.md §0.5.6` 已声明规格的轴心应改为
**「视口 → 段 → 组件 → 内容」**，但现有规格仍按「第 N 段」写 ——
**文档与规格当前不一致**，属已知待办（见 `STATUS.md` In Progress）。

---

## 3. L2 · 资产层 `assets/`

**本层是只读输入。** 任何代码不得就地修改 `assets/` 下的文件。

### 3.1 目录结构（2026-10-01 建立）

```
assets/
├── README.md                     来源说明
├── wheel-data/                   轮毂产品 JSON（19 个 + pending 9 个）
│   ├── WHEEL-CATALOG-ALL.json    全量索引 ★ 主数据源
│   ├── 15寸~20寸-WHEEL-CATALOG.json   按尺寸分册
│   ├── HP/WHEEL-CATALOG / 越野款      按款式分册
│   └── pending-images/           待补图片清单（1518 个型号待补图）
├── wheel-images-webp/            2757 张图（57 MB）★ 唯一图片格式
├── site-data/
│   ├── generated-wheel-data.json         生成物（1.8 MB）
│   ├── generated-wheel-data-webp.json    生成物（1.4 MB）
│   ├── asset-manifest.json               ★ 图片资产真相（2772 条，按实体文件扫描）
│   ├── image-registry.json               图片注册表（253 条，⚠️ 已失效，见 3.5）
│   └── 峰徊科技独立站-中英内容语料库.md    ★ 文案语料底座（43 KB）
├── _non-webp-archive/            5 个位图归档（站点不再引用，见 3.4）
└── preview-media/                15 个 webp 站点预览媒体
```

> **命名来源**：`public/images/` 下的实拍图已整理为
> `wheels/`（2757）、`preview/`（15）、`hero/`（3 张汽车背景）、`cards/`
> （4 张产品线卡）。

### 3.4 ★ WebP 是唯一图片格式（2026-10-01 定案）

**PNG 原图（1.1 GB / 2757 张）已删除**，只保留 WebP（57 MB）。

- `resources/` 从 **1.2 GB → 72 MB**；`assets/` 72 MB
- WebP 与 PNG 原本一一对应，删 PNG **不丢任何型号**
- `preview-media/` 现为 **15 张 webp**；原 3 张位图（`custom` / `ev` / `tire`）
  属于**站点预览图、不是轮毂产品图**，本日连同另外 2 个位图一并移入
  `assets/_non-webp-archive/`（站点只留 webp）

**纪律**：任何新增轮毂图**只进 WebP**。不要再引入 PNG 原图到本仓库 ——
原图如有需要，回源项目 `深圳公司的独立站搭建` 取。

### 3.5 ★ 图片资产以实体文件为准（2026-10-01 更正）

**`image-registry.json` 的 253 条记录全部指向 `assets/image/...`，而该目录
不存在。** 这个索引是按一个**已消失的图片库**生成的，长期误导了资产判断
（曾据此错误地把 253 条刷成 `public:true`，发现后已回滚）。
现已全数标记为 `no-asset`（诚实标注「索引有此条目、实体不存在」）。

**权威来源改为 `assets/site-data/asset-manifest.json`** —— 按**实际文件扫描**
生成，实测 **2772 条**（2757 轮毂图 + 15 preview-media），全部 `public: true`。

**纪律**：**任何关于「我们有哪些图」的判断，一律以 `asset-manifest.json`
或文件系统实测为准，不得引用 `image-registry.json`。** 见 `DEC-018`。

### 3.2 ★ 轮毂主数据结构（实测）

`WHEEL-CATALOG-ALL.json` 的 `metadata`：

```
models: 1349 ｜ variants: 3485 ｜ images: 2757
filter: 仅保留有图片的轮毂（图片名与编号一致）
excludedFields: MOQ / 库存 / 待发货 / 价格 / 库位   ← 刻意排除，不得回填
```

单个 model 结构：

```jsonc
{
  "model": "1081X",
  "sizes": ["15*7"],            // 直径*宽度
  "pcds": ["4*100"],
  "offsets": [35],
  "centerBores": [73.1],
  "finishes": ["白色全涂装", "枪灰全涂装"],
  "variants": [                  // ★ 真正的最小可下单单位
    { "productionCode": "1081X157001W", "size": "15*7", "pcd": "4*100",
      "offset": 35, "centerBore": 73.1, "finish": "白色全涂装" }
  ],
  "styleName": "WEDS TC005 旋压工艺",
  "suitableVehicles": [],        // ⚠️ 全量为空，1349/1349
  "process": "旋压",
  "sizeCategory": "15寸"
}
```

**字段覆盖率（实测，决定哪些能上前端）**：

| 字段 | 覆盖 | 能否做筛选 |
|---|---|---|
| `model` / `sizes` / `pcds` / `offsets` / `centerBores` / `finishes` / `variants` | 1349 / 1349 | ✅ 可 |
| `sizeCategory` | 1349 / 1349 | ✅ 可 |
| `styleName` | **762** / 1349 | ⚠️ 缺 587，只能做「有则显示」 |
| `process` | **512** / 1349 | ⚠️ 缺 837，不能当必填筛选项 |
| `suitableVehicles` | **0** / 1349 | ❌ **完全不能做车型适配** |

**分布实测（供筛选项设计）**：

- 尺寸：18寸 362 ｜ 19寸 335 ｜ 17寸 149 ｜ **15寸 106** ｜ 20寸 80 ｜ 16寸 75 ｜ 越野款 42
- 工艺：旋压 350 ｜ 低压 142 ｜ 低压+旋压 20 ｜ **未标注 837**
- PCD 前五：5\*114.3 (662) ｜ 5\*112 (439) ｜ 6\*139.7 (193) ｜ 4\*100 (177) ｜ 5\*120 (144)
- 表面处理前五：高亮黑 195 ｜ 黑色车面 137 ｜ 哑黑+哑黑压盘 66 ｜ 哑黑全涂 60 ｜ 高亮黑车边 56

> ⚠️ **`sizeCategory` 里混着分册名而非尺寸**：存在 `17寸-2`/`17寸-3`/`17寸-4`/`17寸-5`
> 与 `18寸-2/3/4`、`HP`、`19寸-2`、`20寸-2`。这是**源分册遗留**，不是真实尺寸。
> 数据清洗时须归一化到 `{15,16,17,18,19,20}寸` + 独立的 `HP`/`越野款` 标记。

### 3.3 ★ 图片命名规则 —— 文件名即产品代码

**这是权威规则。** 图片文件名**就是轮毂的产品代码**，不是随手起的名字。

```
<尺寸前缀>-<产品代码>[-<序号>].webp
```

| 例子 | 拆解 |
|---|---|
| `15-1081x.webp` | 15寸 ｜ 产品代码 `1081X` |
| `15-1081x-2.webp` / `-3` / `-4` / `-5` | 同一代码的多角度图 |
| `17-3-2507065.webp` | 分册前缀 `17-3` ｜ 代码 `2507065` |
| `off-road-rh10018-3.webp` | 越野款 ｜ 代码 `rh10018` |

**提取规则**：剥掉**尺寸前缀**（`15-` / `17-3-` / `off-road-` / `hp-`）
与**末尾序号**（`-2` / `-3`…），剩下的就是产品代码，小写归一化后
**对应 `models[].model`**。

**实测匹配率：2185 / 2757 = 79.3%**

**图片命名变体实测分布**（2757 张）：

| 首段前缀 | 张数 |
|---|---|
| `15` `16` `17` `18` `19` `20`（纯尺寸） | 大部分 |
| `17-2` / `17-3` / `17-4` / `17-5` | 分册前缀（对应 `sizeCategory` 的脏值） |
| `18-2` / `18-3` / `18-4`、`19-2`、`20-2` | 同上 |
| `off`（off-road） | **123 张** |
| `hp` | **31 张** |

### 3.3.1 ⚠️ 未匹配的 572 张（21%）

按首段分组：`18`:168 ｜ `17`:146 ｜ `off`:123 ｜ `19`:62 ｜ `hp`:31 ｜
`20`:22 ｜ `16`:18 ｜ `15`:2

两类原因：

1. **越野款 / HP 款整批在 `models[]` 里没有对应记录**（`off` 123 + `hp` 31
   = 154 张）→ 图有、型号表没有
2. **分册前缀类**（`17-2-*` 等）→ 其 `model` 可能登记在别的分册里，
   或名称格式不同

**这 572 张不能假定"没有型号"** —— 需要回源项目核对。
在核清之前，这些图**只可用于画廊展示，不得绑定到某个 SKU**（绑定错 =
给客户看错产品）。

### 3.3.2 命名纪律

- **全部小写**，匹配时一律小写归一化
- **WebP 是唯一线上格式**（PNG 已于 2026-10-01 删除，见 §3.4）
- 匹配逻辑的机器可读版本在 `image-registry.json`，但**该索引已失效**（见 3.5）——
  判断图片是否存在，一律以 `asset-manifest.json` 为准
- **不要重命名图片文件** —— 文件名是产品代码，改名即断链

### 3.4 语料库（文案唯一底座）

`site-data/峰徊科技独立站-中英内容语料库.md`（43 KB）结构：

| 部分 | 内容 | 规模 |
|---|---|---|
| 第一部分 | 产品与行业术语表 | 162 条（含中英对照 + 来源 + 页码 + 证据片段） |
| 第二部分 | 行业词汇 / 常用词组 | 60+ 条（品牌定位/产品/工程/质量/市场/商业/品牌宣传） |
| 第三部分 | 可复用文案句子库 | 40+ 条（品牌公司/轮毂/EV三电/安全轮胎/洛克/航鹏） |

**来源**：《深圳峰徊科技｜中英双语企业宣传画册 v5》PPTX 23 页 ｜
《2024洛克项目介绍》PDF 26 页 ｜ 《航鹏画册组最终稿》PDF 6 页

> **纪律**：站点上任何文案必须能追溯到语料库某一条，或由丰怀新提供。
> 不得自行创作产品卖点。**注意语料库混有「航鹏」与「洛克」两个第三方品牌
> 的内容** —— 用于本站时须确认其可用性（见 §8 待确认项）。

---

## 4. L3 · 内容与数据层 `src/content/` ★ 唯一接缝

### 4.1 契约

```
src/content/types.ts      类型契约（改它 = 改数据源契约）
src/content/*.ts          30 个内容模块（实测）
```

**不可破坏的性质**：把一个模块替换成 API 调用（WordPress），**必须不需要
修改任何组件**。见 `DEC-001`。这是全项目最重要的一条约束。

### 4.1.1 与 L3 并列的三个运行时库（2026-10-01 新增）

`src/lib/` 下新增**三个库**，它们不替换 `src/content/` 接缝，而是**供
接缝在将来切换到真实数据源时使用**，以及承载 `src/content/` 无法表达的
运行时行为（读写、发信、locale）：

```
src/lib/wordpress/    Headless WP 读取层
  types.ts  client.ts  index.ts
  └─ mode: "mock"（默认）｜"live" —— ★ 切 live 只改 client.ts 一个文件
  └─ 在 mock 模式下，每次调用都从本地 fixture 解析；站上一切可离线跑通

src/lib/inquiry/      询盘域（三条纪律，见 §7.1）
  types.ts  store.ts  mailer.ts  validate.ts  index.ts
  └─ store.ts   持久化（mock 内存 / 将来 DB）
  └─ mailer.ts  send() 是可替换接缝，将来换 Resend 只改这一个文件

src/lib/i18n/         中英双语层
  types.ts  index.ts  use-t.ts  dictionaries/{en,zh,index}.ts
  └─ index.ts     getLocale() —— ⚠️ 用 next/headers，服务端专用
  └─ use-t.ts     createT(locale) —— client-safe
```

> **⚠️ 关键结构约束（造成过构建失败，务必遵守）**：
> `src/lib/i18n/index.ts` 导入 `next/headers`（服务端专用）。因此
> **client 组件只能从 `src/lib/i18n/use-t.ts` 导入**，而 `use-t.ts`
> **只能从 `dictionaries/index.ts` 这个桶导入字典**。若 client 组件
> 误 import `./index`，会把 `next/headers` 拖进 client bundle →
> 构建报错 *"You're importing a component that needs next/headers"*。

**依赖方向**：`src/content/` 与 `src/lib/{wordpress,inquiry,i18n}` 同属 L3，
可互相协作；**它们都不得依赖 L4/L5**。

### 4.2 模块清单与数据来源映射

| 模块 | 承载什么 | 未来来源 | 当前状态 |
|---|---|---|---|
| `types.ts` | 全部类型契约 | — | ⚠️ **缺规格字段，见 4.3** |
| `site.ts` | 站点名/导航/页脚/联系信息 | WP `site-settings` | ⚠️ **`primaryNav` 仍是竞品结构**（见 §6.2）；footer 已改四条线 |
| `products.ts` | 产品**系列**（monoblock/two-piece/off-road） | WP `product-lines` | **须重写为四条线**（实测仍是 3 个虚构系列） |
| `wheel-skus.ts` | 轮毂单品（实测 18 个） | WP `products` | **须扩到 1349** |
| `homepage-hero.ts`（新） | 首页 Hero 内容数据 | WP pages | 本日新增 |
| `ev-components.ts` / `custom-aluminum.ts` / `safety-tires.ts`（新） | 三条非轮毂线能力页内容 | WP pages | 本日新增，**大量数据待丰怀确认** |
| `custom-development.ts` / `request-a-quote.ts` / `thank-you.ts`（新） | 定制开发 / 询盘 / 提交成功 | WP pages | 本日新增 |
| `wheel-designs.ts` | 22 个设计 | WP `design-series` | 须按 `styleName` 重建 |
| `finishes.ts` | 表面处理 | WP taxonomy | 须对齐真实 **679 个**值（须分 4 组） |
| `fitment.ts` | 车型适配（安全关键） | 工程签字 | ⚠️ `suitableVehicles` 全空 |
| `gallery.ts` / `builds.ts` | 改装案例 | WP `builds` | 须真实素材 |
| `faq.ts` / `resources.ts` / `faq` 系列 | 知识文章 | WP `posts` | 须重写 |
| `legal.ts` | 政策文件 | 律师 | ⚠️ 48 处 PLACEHOLDER（全库共 98 处） |
| `tools.ts` | 偏距计算器预设 | 本地 | 已可用 |
| `process.ts` / `capabilities.ts` | 制造工艺 | WP pages | 须对齐四条线 |
| `private-label.ts` / `dealer-programs.ts` | 经销商/贴牌 | WP pages | 须重写 |
| `contact.ts` | 询盘文案 | WP `inquiry-settings` | 已可用 |

### 4.3 ★ 当前最大缺口：类型层缺规格

**实测 `types.ts` 的 `WheelSku` 只有**：
`sku / name / family / spokes / construction / finishes / summary /
description / applications / hasRender`（+ 图片字段）

**没有** `size` / `pcd` / `offset` / `centerBore` / `process` / `variant`。

而 `assets/` 里**全都有**。这意味着：**资产层比类型层更完整。**

> **架构动作（P0）**：Type 须新增规格字段，让数据层能承载真实数据。
> 这是所有下游（筛选、询盘快照、SKU 页）的前置条件。
> **不做这一步，轮毂目录只能是个静态图册。**

---

## 5. L4 · 展示组件层 `src/components/`

```
components/
├── ui/                     shadcn 原语
├── sections/               页面区块组合
│   ├── home-hero.tsx.retired   ⚠️ 旧 Hero（已退役，保留待清）
│   ├── page-hero.tsx           ★ 通用页首深色 hero（本日新增）
│   ├── product-showcase.tsx    四条产品线（本日由「三宫格」改造）
│   ├── trust-strip.tsx / gallery-band.tsx / dealer-cta.tsx
├── home/hero/               ★ 首页 Hero 专用（本日新增）
│   ├── home-hero.tsx           品牌独占一屏（回答「我们是谁」）
│   ├── hero-background.tsx     背景（汽车图 + 深色 + 光晕）
│   ├── hero-product-card.tsx   产品线卡
│   └── hero-product-grid.tsx   四卡栅格
├── product-card.tsx        ← 单一产品卡片（hasRender 模式）
├── wheel-gallery.tsx       轮毂设计画廊
├── offset-calculator.tsx   ★ 偏距计算器（已可用，公式经独立基准验证）
├── process-explorer.tsx    制造流程浏览器
├── prose-article.tsx       长文排版
├── legal-document.tsx      政策文件排版
├── site-header.tsx / site-footer.tsx
├── language-switcher.tsx   ★ 语言切换（写 `fh-locale` cookie，本日新增）
├── quote-context-bar.tsx   ★ 询盘上下文条（本日新增）
├── inquiry-form.tsx        询盘表单（提交到 `/api/inquiries`）
├── floating-quote.tsx      常驻悬浮 CTA（`HIDDEN_ON = ["/contact"]`）
├── site-motion.tsx         ★ 动效控制器（见 5.2）
└── …                       三条能力线组件（本日新增）：
                            part-group-cards / boundary-table / param-table /
                            mechanism-steps / input-type-cards /
                            process-diagram / faq-accordion / route-block /
                            data-notice / capacity-stats
```

> 实测 `src/components/` 下共 **40 个 `.tsx`**（含 `ui/` 原语），
> 2026-10-01 的组件清单保存在 `archive/2026-10-01-document-baseline/PAGE-SPECS/_components.md`，仅作历史参考；当前施工以首发正本为准。

### 5.1 设计令牌

统一定义在 `src/app/globals.css`。**组件内绝不出现裸 hex 值。**
**数值的唯一来源是 `globals.css`** —— `DESIGN.md` 只写用法不抄数值，
`PAGE-SPECS/` 引用行号。

| 令牌 | 用途 |
|---|---|
| `text-ink` / `bg-ink` | 石墨主色（`#0b0f16`）——**页首身份段 / 图底 / 页脚** |
| `text-hero` / `bg-hero` | ★ **本日新增**（`#05070a`）—— 收编第 4 阶深色（原裸 hex `#05070b`） |
| `text-steel` / `bg-soft` | 钢灰次级 / 浅底交替色 |
| `text-forge` | 炉火琥珀强调（`#c2650a`）——**全站唯一的彩** |
| `text-forge-deep` | 深底上的可点文字 hover · 警示标签 |
| `bg-forge-soft` | ★ **段级 token**：全站唯一浅橙段（`DealerCta`）—— 拿它当卡片底会稀释「开始转化」信号 |

**⚠️ 命名陷阱**：`--fh-muted` 名字像文字色，**实际只绑 border/input**；
正文次级色是 `steel`。`graphite` / `panel` 已定义但**零使用**（只服务未启用的
`.dark`）。详见 `DESIGN.md` §1.1–§1.2、§6。

### 5.2 动效契约

两个效果，**声明式**，由属性驱动：

- **滚动显现**：`data-reveal`（区块）/ `data-reveal-group`（容器，子元素错峰）
- **视差**：`data-parallax-media`（±8px，rAF 节流）

**必须保持**：挂在 JS 添加的 `motion-ready` 类之下（无 JS 内容仍可见）；
`prefers-reduced-motion` 下全关。**禁止在页面里手写 IntersectionObserver** ——
违反此条曾造成整站空白事故（`docs/BLANK-PAGE-AUDIT.md`）。

### 5.3 资产兜底

`hasRender` 标志模式：无图时渲染品牌占位，**不发 404 请求**。
资产到位后翻转标志，**不要删除兜底分支**。

---

## 6. L5 · 页面与路由层 `src/app/`

### 6.1 现状（实测 **33 个 `src/app/**/page.tsx`**）

> 实测命令：`find src/app -name page.tsx | wc -l` → **33**。
> 本日由 26 增至 33（新增 3 条产品线 + 3 个功能页 + 1 个改名页）。

```
/                                    首页
/products                            目录入口
/products/[slug]                     系列（⚠️ 仍是 monoblock / two-piece / off-road）
/products/wheels                     SKU 索引（18 个）
/products/wheels/[sku]               单品详情
/products/ev-components              ★ 新能源三电壳体（本日新增）
/products/custom-aluminum            ★ 铝制品定制（本日新增）
/products/safety-tires               ★ 自修复安全轮胎（本日新增）
/capabilities                        ★ 制造与质量（本日由 /manufacturing 改名）
/manufacturing                       ← 旧路由，保留并 **307 重定向**到 /capabilities
/custom-development                  ★ 定制开发（本日新增）
/request-a-quote                     ★ 独立询盘页（本日新增）
/thank-you                           ★ 提交成功页（本日新增）
/gallery  /gallery/wheels  /gallery/finishes    画廊（本阶段不做，代码保留）
/tools  /tools/offset-calculator     工具（本阶段不做，代码保留）
/fitment  /fitment/[platform]        适配（降级，无数据）
/dealers  /dealers/private-label     经销商 / 贴牌
/about                               关于
/contact                             询盘
/resources  /resources/[slug]        资源文章
/resources/bolt-patterns  /resources/bolt-patterns/[pattern]   孔距指南
/support/{warranty,returns,shipping,terms,privacy}   政策
```

**`/manufacturing` → `/capabilities` 的重定向**由 `manufacturing/page.tsx`
里的 `redirect()` 实现（Server Component 请求时 **307**），**不是**
`next.config` 的静态重定向 —— 这样能保住旧 URL 的收录与既有链接。

**★ 本阶段明确不做的页（用户 2026-10-01 定案）**：
`/gallery`、`/gallery/finishes`、`/tools`、`/tools/offset-calculator`
—— 不进本轮施工范围，**代码保留不删**（见 `CHANGELOG.md` 「暂缓」）。

### 6.2 ★ 信息架构需要重构（不是改字）

**竞品的 IA 是按竞品业务切的。丰怀是四条平行产品线。** 目标 IA（对齐
兄弟项目 `site-architecture.md`，且那里已确认过）：

```
/                                        首页
/products                                产品中心（四条线平行入口）
├── /products/wheels                     轮毂
│   ├── /products/wheels/series/[series]     设计系列
│   └── /products/wheels/[model]             单品
├── /products/ev-components              新能源三电壳体
├── /products/custom-aluminum            铝制品定制
└── /products/safety-tires               自修复安全轮胎
/capabilities                            制造与质量
/custom-development                      定制开发
/insights  /insights/[slug]              技术与见解
/about  /contact  /request-a-quote       关于 / 联系 / 获取报价
/thank-you  /privacy-policy
```

**映射动作（本日进度）**：

| 现路由 | 动作 | 状态 |
|---|---|---|
| `/products/ev-components` `/custom-aluminum` `/safety-tires` | 新增三条产品线 | ✅ **已完成**（本日） |
| `/capabilities` | 由 `/manufacturing` 改名 + 旧路重定向 | ✅ **已完成**（本日） |
| `/custom-development` `/request-a-quote` `/thank-you` | 新增功能页 | ✅ **已完成**（本日） |
| `/products/[slug]`（3 个虚构系列） | → **重建为四条平行产品线** | ❌ **未做**（`products.ts` 仍是 3 系列） |
| `/products/wheels/[sku]`（18 个） | → 扩容至 1349 model / 3485 variant | ❌ 未做 |
| `/gallery/wheels` | → 并入 `/products/wheels` 的筛选，或保留为独立灵感页 | ⏸ 本阶段不做 |
| `/fitment/*` | ⚠️ **保留但降级**（`suitableVehicles` 全空，无可发布数据） | ⏸ 降级保留 |
| `/dealers/private-label` | → 保留，对齐语料库「商业与合作」 | ✅ 保留 |
| `/resources/*` | → 更名 `/insights/*`，对齐内容中心 | ❌ 未做 |

**⚠️ 已知不一致（本日）**：`site.ts` 的 **`primaryNav`（header 下拉）仍是旧结构**
—— Products 下拉仍是 `All Wheels / Monoblock / Two-Piece / Off-Road`，
**没有三条能力线**；而 **footer 已改**为四条产品线。**两边不一致。**
（见 `STATUS.md` In Progress / Blockers）

### 6.3 渲染策略

当前 `next.config.ts` = `output: "standalone"`，**33 路由全静态预渲染**
（`/api/inquiries` 是唯一运行时路由）。
**部署走 OpenNext**（`DEC-009`）。**严禁改成 `output: "export"`** ——
那会让 `/api/inquiries` 完全不可用。

### 6.4 国际化（i18n）与 URL 结构

**语言切换用 cookie（`fh-locale`），不是 `[locale]` 路由段。**
`src/lib/i18n/index.ts` 的 `getLocale()` 读 cookie；`language-switcher.tsx`
写 cookie 并刷新服务端组件。

- **理由**：给 33 个路由各加一层 `[locale]` 段是**另一次迁移**，本轮不做。
- **⚠️ 已知代价**：**中英文没有独立 URL** —— 对 SEO 的双语收录不利。
  这是一个**已记账的取舍**，不是疏漏（见 `STATUS.md` Open Questions）。



---

## 7. L6 · 询盘管线

**定位：不是后台，是单向数据管道。** 见 `DEC-003`。无运营界面，
进数据 → 分配 → 发信，就此结束。

```
[产品页 / 目录页]
      ↓  携带 model + variant + 已选规格
[Inquiry Cart]  （会话内，可加多件）
      ↓
[Request Quote 表单]
      ↓
POST /api/inquiries        ← 本项目唯一的运行时 API
      ↓
  ┌───┴────┐
  ↓        ↓
[数据库]  [Resend 邮件]
  ↓        ↓
持久化   业务员收件（Reply-To = 客户邮箱，可直接回复）
```

### 7.1 数据模型（三条纪律）

1. **先落库，再发信。** 邮件失败不得丢失询盘。
2. **存快照，不存引用。** 询盘里要固化当时的规格快照 —— 产品数据会变，
   历史询盘不能跟着变。
3. **规格字段分三段**（因 `WheelSku` 缺字段，见 4.3）：
   - **真实存在字段**：model / finish / variant productionCode
   - **客户自填字段**：尺寸 / 数量 / 车型 / 备注
   - **待补的规格字段**：pcd / et / cb（类型补齐后转为真实字段）

### 7.2 状态（2026-10-01 更新）

| 项 | 状态 |
|---|---|
| 架构方案 | ✅ 定稿 `docs/plans/inquiry-system-architecture.md` |
| `src/lib/inquiry/` | ✅ **已建**（`store` / `mailer` / `validate` / `types` / `index`） |
| `src/app/api/inquiries/route.ts` | ✅ **已建** —— 本项目**唯一**运行时 API；实测 POST **201** / 校验失败 **422** |
| 执行顺序 | ✅ 已按纪律落码：validate → **persist** → send → record outcome |
| `runtime` | `nodejs`（依赖 `output: "standalone"`） |
| DB / 邮件依赖 | ⚠️ **仍是 mock**：`store` 内存持久化、`mailer.send()` 不发真信（零 DB / 零 Resend 依赖） |
| 表单 | ✅ `inquiry-form.tsx` 已接 `/api/inquiries`（`/contact`、`/request-a-quote`） |

---

## 8. L7 · 交付与运维

| 项 | 现状 |
|---|---|
| 本地门禁 | `npm run check` = lint + typecheck + build ✅ 全绿 |
| 部署层 | ❌ **OpenNext 未接入**（零依赖零配置） |
| `Dockerfile` / `docker-compose.yml` | ⚠️ **仍是克隆模板默认值**（`ai-website-cloner:latest`） |
| 域名 / TLS | ❌ 未绑定 |
| 版本控制 | ❌ **当前不是 git 仓库** |

### 8.1 两个静默陷阱

**① `NEXT_PUBLIC_APP_URL`**（`DEC-005`）
烤进构建产物，静默改写全站 canonical / OG / sitemap。跨机构建部署必须
**逐项比对烤入值**，不能只看页面 200。

**② macOS 专有工具**（`DEC-006`）
`sips` / `cwebp` 缺失时**静默降级**，产出「构建成功但更差」的结果。
依赖 macOS 的步骤留在本地，服务器只跑校验与 `next build`。

### 8.2 跨机构建

`next.config.ts` 的 `standalone` 产物会硬编码构建机绝对路径
（历史教训：`.next/required-server-files.json` 里的 `appDir`）。
跨机部署须在**同版本 Node 容器内**构建，不能直接搬运 Mac 产物。

---

## 9. SKILLS · 开发技能库

`SKILLS/`（3.2 MB，20 个技能）从兄弟项目
`深圳公司的独立站搭建` 迁移而来。**全部带 `SKILL.md`，来源记录在
`SKILLS/skills-lock.json`。**

按用途分五组：

| 组 | 技能 | 用在 |
|---|---|---|
| **设计品味** | `design-taste-frontend`(`-v1`) / `gpt-taste` / `stitch-design-taste` / `high-end-visual-design` / `minimalist-ui` / `industrial-brutalist-ui` | 前端视觉方向 |
| **图像与还原** | `image-to-code` / `imagegen-frontend-web` / `imagegen-frontend-mobile` / `impeccable` | 设计稿→代码、B2B 配图 |
| **改造与迁移** | `redesign-existing-projects` / `migrate-radix-to-base` / `shadcn` / `brandkit` | ★ **前端去竞品化改造正是这组** |
| **质量与安全** | `open-code-review` / `open-code-review-delegate` / `security-audit` / `full-output-enforcement` | 评审、审计 |
| **市场研究** | `seo-market-research` | 关键词与竞品情报 |

### 9.1 使用纪律

- **不要绕过技能自造流程。** 技能里是验证过的命令与参数。
- `open-code-review` 默认模型已规范为 `group/auto-deepseek-v4-flash`
  （见技能内 `LOCAL-CONFIG.md`）。
- `security-audit` 的完整流程需要 OS 级沙箱；本机无 Docker/podman 时
  只能跑只读部分，结论会降级为 `needs_validation`。
- 技能是**从兄弟项目复制**的，不是软链。两边各自演进，**不要假定同步**。

---

## 10. 模块依赖矩阵

| 模块 | 可以依赖 | **禁止依赖** |
|---|---|---|
| L2 `assets/` | — | 一切（只读输入） |
| L3 `src/content/` | L2（构建期导入） | L4 / L5 |
| L4 `src/components/` | L3 | `assets/` 直读、L5 |
| L5 `src/app/` | L3 / L4 | `assets/` 直读 |
| L6 询盘 | L3（快照）| L4 组件内部状态 |
| L7 运维 | 全部（只读） | — |

**最常见的架构错误**：在 L5 页面里直接 `import` 一个 `assets/*.json`
去遍历。正确做法是经 L3 的类型化模块。**那条接缝是本站唯一可替换的数据边界。**

---

## 11. 待确认项（阻塞架构落地）

| # | 事项 | 阻塞什么 |
|---|---|---|
| 1 | `sizeCategory` 归一化规则（`17寸-3` 是否为真实尺寸） | 轮毂筛选器设计 |
| 2 | `styleName` 缺失的 587 个型号如何归类 | 设计系列页 |
| 3 | `suitableVehicles` 全空 —— 工程能否补齐 | 车型适配页 |
| 4 | `process` 未标注的 837 个能否从其他字段推断 | 工艺筛选 |
| 5 | **572 张图未匹配到型号**（越野款 123 + HP 31 + 分册类） | 图片能否绑定 SKU |
| 6 | 语料库中「航鹏」「洛克」内容可否用于本站（第三方品牌） | 文案可用范围 |
| 7 | 四条产品线中三条无图的，何时提供资产 | 产品中心上线 |
| 8 | **1518 个型号待补图**，是否补齐、补到什么程度 | 目录完整度 |
| 9 | OpenNext 落在哪个平台 | 部署与询盘运行时 |
| 10 | `WheelSku` 规格字段的最终形状 | 全部下游 |

---

## 11.5 架构文档集 `ARCHITECTURE/` 与文档四层

本文件是**总纲**。逐页与逐模块的落地设计在子目录：

```
ARCHITECTURE/
├── README.md                  索引与阅读顺序
├── page-architecture/         ★ 每一页要说明什么（内容与布局 · 为什么这么设计）
└── tech-architecture/         ★ 每个模块怎么落地（数据流与技术）
```

| 文件 | 回答 |
|---|---|
| `ARCHITECTURE.md`（本文件） | 模块怎么切、谁不能依赖谁 |
| `ARCHITECTURE/page-architecture/` | 这一页给谁看、说明什么、什么顺序 |
| `ARCHITECTURE/tech-architecture/` | 数据从哪来、怎么渲染、坏了会怎样 |

**本日新增的三条文档线（与上表合并看，见 §2.0 的四类边界）**：

| 新增 | 位置 | 回答 |
|---|---|---|
| **`DESIGN.md`** | 项目根 | 页面**现在长什么样、为什么好看**（设计正本，**沉淀**） |
| **`PAGE-SPECS/`** | 项目根 | 新页面**照着搭什么**（按路由命名的施工图） |
| 三条产品线页面架构 | `ARCHITECTURE/page-architecture/` | `ev-components-page.md` / `custom-aluminum-page.md` / `safety-tires-page.md` |

**`PAGE-SPECS/` 实测结构**：目录内共 **22 个文件** —— 3 份公共文件
（`README.md` / `_components.md` / `_viewport-audit.md`）+ `index.md` 总表
+ 18 份页面规格；每份规格固定 7 节，与 `page-architecture/` 的分工是
「**搭什么** vs **为什么**」。

**改动任一处，四份要同步**（`ARCHITECTURE/` 内部三份 + 涉及设计时的 `DESIGN.md`／
涉及施工时的 `PAGE-SPECS/`；见 `ARCHITECTURE/README.md` 铁律 ③）。

### ★ 上架门槛（用户 2026-10-01 定案）

**只为「有图」的型号建页面。** 实测：

```
1349 型号 → 1018 有图（上架）｜331 无图（先不上架）
```

无图型号不建页、不进列表、不进 sitemap。**不删数据**，图到位后翻转标志即可。
无数据的产品线（EV三电 / 铝制品 / 安全轮胎）同理 —— **先出能力页，不列型号**。

---

## 12. 变更流程

改这个文件之前，先问：

1. **这是架构变化还是实现细节？** 实现细节写进对应代码的注释，不写这里。
2. **是否违反 §0 三条前提？** 违反则停手，先记录 `DECISIONS.md`。
3. **是否影响 `assets/` → `src/content/` 的映射？** 影响则同步更新 §4.2 表。
4. **是否需要新的 `DEC-xxx`？** 见 `AGENTS.md` §9。

**新增模块的登记格式**：

```markdown
### <模块名>
- **职责**：
- **数据源**：
- **依赖**：
- **禁止依赖**：
- **状态**：
```
