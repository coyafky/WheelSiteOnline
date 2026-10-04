# 技术架构 —— 每个模块怎么落地

> **本文件回答一个问题：数据从哪来、怎么流到页面、边界在哪、坏了会怎样。**
>
> 它**不回答**「这一页要说什么」—— 那是 `../page-architecture/README.md` 的事。
> 不要在这里写内容策划。

- 版本：v1.0
- 建立日期：2026-10-01
- 上位：`../../ARCHITECTURE.md`（7 层模块模型与依赖矩阵）

---

## 0. 一句话总览

```
assets/*.json          ← 真实产品数据（只读）
      ↓  构建期导入
src/content/*.ts       ← ★ 唯一接缝（类型化模块）
      ↓  类型契约
src/components/*       ← 展示组件
      ↓  组合
src/app/**/page.tsx    ← 路由与渲染
      ↓  构建
OpenNext 产物          ← 部署
      ↑
src/app/api/inquiries  ← ★ 唯一运行时 API（询盘）
```

**依赖方向严格单向。** 页面**不得**直接读 `assets/`。
那条接缝（`src/content/`）是全站唯一可替换的数据边界。

---

## 1. 数据层：从 JSON 到类型化模块

### 1.1 现状与目标

| 层 | 现状 | 目标 |
|---|---|---|
| `assets/wheel-data/WHEEL-CATALOG-ALL.json` | 1349 型号 / 3485 变体 | 保持只读 |
| `src/content/types.ts` | ⚠️ **WheelSku 缺规格字段** | 补齐（P0） |
| `src/content/wheel-skus.ts` | 16 个手写 SKU | 由 JSON 生成 1018 个 |

### 1.2 ★ P0：类型契约补齐

当前 `WheelSku` 实际字段（实测）：

```ts
// 现有
sku / name / family / spokes / construction / finishes
summary / description / applications / hasRender (+ 图片字段)

// ★ 缺失 —— 而 assets/ 里全都有
size / pcd / offset / centerBore / process / variant
```

**目标类型**（对齐 `WHEEL-CATALOG-ALL.json` 的真实形状）：

```ts
/** 最小可下单单位。一个 model 有多个 variant（尺寸×孔距×偏距×中心孔×表面处理）。 */
export type WheelVariant = {
  /** 生产代码，如 "1081X157001W"。唯一标识。 */
  productionCode: string;
  /** 尺寸，如 "15*7"（直径*宽度） */
  size: string;
  /** 孔距，如 "5*114.3" */
  pcd: string;
  /** 偏距 ET */
  offset: number;
  /** 中心孔 CB */
  centerBore: number;
  /** 表面处理 */
  finish: string;
};

/** 一个轮毂型号。图片文件名即产品代码，见 ARCHITECTURE.md §3.3。 */
export type WheelModel = {
  /** 型号 / 产品代码，如 "1081X"。对应图片文件名（小写归一化）。 */
  model: string;
  /** 尺寸归类：15寸…20寸 / 越野款 / HP。⚠️ 需归一化，见 §1.4 */
  sizeCategory: string;
  sizes: string[];
  pcds: string[];
  offsets: number[];
  centerBores: number[];
  finishes: string[];
  variants: WheelVariant[];
  /** 设计系列。⚠️ 覆盖 762/1349，缺失为 undefined */
  styleName?: string;
  /** 制造工艺：旋压 / 低压 / 锻造。⚠️ 覆盖 512/1349 */
  process?: string;
  /** 车型适配。⚠️ 全量为空，暂不发布 */
  suitableVehicles: string[];
  /** ★ 是否有图。上架门槛，见 §1.3 */
  hasImage: boolean;
  /** 该型号的全部图片路径（派生自 model） */
  images: string[];
};
```

**为什么要区分 `WheelModel` 与 `WheelVariant`**：
询盘必须精确到 variant（客户要的是「15×7 / 4×100 / ET35 / 白色」这个具体组合），
但页面浏览的粒度是 model。**两者混用会导致询盘带错规格。**

### 1.3 ★ 上架门槛：`hasImage`

```
1349 型号 → 1018 hasImage: true（生成页面）
          →  331 hasImage: false（保留数据，不生成页面）
```

**实现方式**：在生成步骤里跑一次图片索引比对（剥尺寸前缀 + 序号 → 小写归一化），
把结果写进 `hasImage`。

**⚠️ 三个约束**：
1. 无图型号**不生成** `/products/wheels/[model]` 页面
2. 无图型号**不进**目录列表、筛选结果、sitemap
3. **不删数据** —— 图到位后翻转 `hasImage` 即可放开，无需改架构

**可复用的比对逻辑**（已实测 79.3% 命中率）：

```js
// 图片名 → 产品代码：剥尺寸前缀与末尾序号
const toModelCode = (file) =>
  file.replace(/\.webp$/, "")
      .replace(/^(\d+|off-road|off|hp)-\d*-?/, "")   // 剥前缀
      .replace(/-\d+$/, "")                           // 剥序号
      .toLowerCase();
```

### 1.4 数据清洗规则

`assets/` 里的原始数据有已知脏点，必须在生成步骤处理：

| 问题 | 规则 |
|---|---|
| `sizeCategory` 混入分册名（`17寸-3`/`18寸-2`/`HP`） | 归一化为 `{15,16,17,18,19,20}寸`；`越野`/`HP` 单列为**款式标记**而非尺寸 |
| `process` 未标注 837 个 | 保持 `undefined`，**不推断**。UI 层处理缺失 |
| `styleName` 缺失 587 个 | 保持 `undefined`，不进系列页 |
| `suitableVehicles` 全空 | 原样保留，**构建期校验禁止其进入任何页面** |

**⚠️ 一条铁律**：清洗只做**归一化与补全**，**绝不做推断**。
「这个型号看起来像旋压的」不是数据，是猜测。

### 1.5 生成步骤

```
assets/wheel-data/WHEEL-CATALOG-ALL.json
      ↓  scripts/generate-wheel-content.mjs
      ├─ 清洗（§1.4）
      ├─ 比对图片（§1.3）→ hasImage / images
      └─ 输出
src/content/wheel-models.ts     ← 生成物，禁止手改
```

**纪律**：
- 生成物文件头写明「**此文件由脚本生成，请勿手改**」
- 脚本本身进版本控制，生成物可重新生成
- 生成后跑校验：型号数 == 1018（有图）+ 331（无图）

---

## 2. 组件层

### 2.1 组件清单与职责

| 组件 | 职责 | 依赖 |
|---|---|---|
| `product-card.tsx` | 型号卡片（图 + 型号 + 规格摘要） | `WheelModel` |
| `wheel-gallery.tsx` | 图片画廊 | `images[]` |
| `offset-calculator.tsx` | 偏距计算器 | 本地，无外部依赖 |
| `finish-swatch.tsx` | 表面处理色板 | `finishes[]` |
| `spec-table.tsx` | **规格表**（按 variant 展开） | `WheelVariant[]` |
| `model-filter.tsx` | 目录筛选器 | 见 §2.2 |
| `inquiry-cta.tsx` | 询盘入口（携带上下文） | — |
| `prose-article.tsx` | 长文排版 | — |
| `legal-document.tsx` | 政策页排版 | — |
| `site-motion.tsx` | 动效控制器 | — |

### 2.2 ★ 筛选器的技术约束

筛选器是**唯一会受数据覆盖率影响正确性**的组件。

**问题**：`process` 只有 512/1349 有值。若筛选「旋压」时静默排除未标注的 837 个，
用户会以为我们没有那些产品。

**方案**：把「未标注」当作一个**显式分组**，而不是排除条件。

```ts
type ProcessFilter = "旋压" | "低压" | "低压+旋压" | "未标注";

// 选「旋压」时 → 结果 = (process === "旋压") ∪ 用户勾选「包含未标注」
```

**UI 上必须可见**：筛选面板里显示每组数量，让用户知道自己排除了什么。

### 2.3 动效契约（不可违反）

- 滚动显现：`data-reveal`（区块）/ `data-reveal-group`（容器错峰）
- 视差：`data-parallax-media`（±8px，rAF 节流）
- **必须**挂在 JS 添加的 `motion-ready` 之下（无 JS 内容仍可见）
- **禁止**在页面里手写 IntersectionObserver —— 违反此条曾致整站空白
  （`docs/BLANK-PAGE-AUDIT.md`）

### 2.4 资产兜底

`hasRender` / `hasImage` 标志模式：无图渲染品牌占位，**不发 404 请求**。
**不要删除兜底分支** —— 上架门槛保证了页面级无图，但图库可能部分缺失。

---

## 3. 路由与渲染层

### 3.1 路由表

见 `../page-architecture/README.md` §1。技术侧关注的是**哪些路由是动态生成**：

| 路由 | 生成方式 | 数量 |
|---|---|---|
| `/products/wheels/[model]` | `generateStaticParams` | **1018**（有图才有） |
| `/products/wheels/series/[series]` | `generateStaticParams` | ≤762 |
| `/insights/[slug]` | `generateStaticParams` | 待定 |
| 其余 | 静态 | 固定 |

### 3.2 渲染策略

- 当前 `next.config.ts` = `output: "standalone"`
- **部署走 OpenNext**（`DEC-009`）
- **严禁**改成 `output: "export"` —— 会让 `/api/inquiries` 完全不可用

### 3.3 SEO 技术要求

- 每个 model 页有唯一 title / description（派生自型号 + 规格）
- `Product` 结构化数据
- **无图型号不进 sitemap**（否则产出 404 页）
- `sitemap.ts` 必须从 `WheelModel[]` 派生，而不是硬编码

---

## 4. 询盘系统

**定位：单向数据管道，不是后台。**（`DEC-003`）

### 4.1 数据流

```
[型号页 / 目录页]
      ↓  携带 model + variant + 已选规格
[Inquiry Cart]（会话内）
      ↓
[Request Quote 表单]
      ↓
POST /api/inquiries          ← 唯一运行时 API
      ↓
  ┌───┴────┐
  ↓        ↓
[DB]     [Resend]
先落库    后发信
```

### 4.2 三条纪律

1. **先落库再发信** —— 邮件失败不丢询盘
2. **存快照不存引用** —— 产品数据会变，历史询盘不能跟着变
3. **规格字段分三段**：
   - 真实字段：`model` / `finish` / `productionCode`
   - 客户自填：尺寸 / 数量 / 车型 / 备注
   - 待补字段：pcd / et / cb（类型补齐后转为真实字段）

### 4.3 现状（实测）

| 项 | 状态 |
|---|---|
| `src/app/api/` | ❌ **目录不存在** |
| DB / 邮件依赖 | ❌ **零依赖** |
| `/contact` 表单 | ⚠️ 有 UI，无后端 |
| 架构方案 | ✅ `docs/plans/inquiry-system-architecture.md` |

### 4.4 未决

- 数据库选型（Neon / Supabase / 自建）
- 发信子域 `notify.` 是否可建（需域名控制权）
- 退信 webhook 是否接入
- 是否需要 Turnstile 防滥用

---

## 5. 部署与运维

### 5.1 现状

| 项 | 现状 |
|---|---|
| 本地门禁 | `npm run check` ✅ 三绿 |
| 部署层 | ❌ **OpenNext 未接入（零依赖零配置）** |
| `Dockerfile` / `docker-compose.yml` | ⚠️ **仍是克隆模板默认值** |
| 域名 / TLS | ❌ 未绑定 |
| 版本控制 | ❌ **当前不是 git 仓库** |

### 5.2 两个静默陷阱

**① `NEXT_PUBLIC_APP_URL`**（`DEC-005`）
烤进产物，静默改写全站 canonical / OG / sitemap。
跨机构建必须**逐项比对烤入值**，不能只看页面 200。

**② macOS 专有工具**（`DEC-006`）
`sips` / `cwebp` 缺失时**静默降级**，产出「构建成功但更差」的结果。
依赖 macOS 的步骤留在本地，服务器只跑校验与 `next build`。

### 5.3 跨机构建

`standalone` 产物硬编码构建机绝对路径（`required-server-files.json` 的 `appDir`）。
跨机部署须在**同版本 Node 容器内**构建。已在 PersonalWebsite 项目验证：
`docker run node:20-slim` + 挂暂存副本 + `NPM_CONFIG_...`。

---

## 6. 构建门禁

### 6.1 现有

```json
"check": "npm run lint && npm run typecheck && npm run build"
```

### 6.2 本架构新增的校验要求

| 校验 | 检查什么 | 为什么 |
|---|---|---|
| **数据完整性** | 生成型号数 == 1018 + 331 | 防生成步骤静默丢数据 |
| **上架门槛** | 无 `hasImage` 的型号不出现在路由/sitemap | 防产出空壳页 |
| **规格来源** | fitment 相关页面不含未确认值 | 安全关键（DEC-004） |
| **图片存在** | 页面引用的图片都存在 | 防破图 |
| **竞品残留** | 全仓无 `2nforged` / 竞品路径 | DEC-010 |

**⚠️ 这些校验必须进 CI**，不能靠人工记得跑。

---

## 7. 模块依赖矩阵（本项目细化版）

| 模块 | 可以依赖 | **禁止依赖** |
|---|---|---|
| `assets/` | — | 一切（只读输入） |
| `scripts/generate-*` | `assets/` | `src/`（生成步骤不依赖产物） |
| `src/content/` | `assets/`（构建期） | 组件、页面 |
| `src/components/` | `src/content/` | `assets/` 直读、`src/app/` |
| `src/app/**/page.tsx` | `src/content/`、`src/components/` | **`assets/` 直读** |
| `src/app/api/*` | `src/content/`（快照用） | 组件内部状态 |

**最常见的架构错误**：在页面里直接 `import` 一个 `assets/*.json` 遍历。
正确做法是经 `src/content/` 的类型化模块。

---

## 8. 待确认 / 待建设

| # | 事项 | 影响 |
|---|---|---|
| 1 | **类型补齐的最终形状**（§1.2） | **一切下游** |
| 2 | 生成脚本的落地（§1.5） | 1018 型号能否进页面 |
| 3 | 图片索引比对脚本的准确率（现 79.3%） | 331 无图的判定是否可靠 |
| 4 | `sizeCategory` 归一化规则 | 筛选器设计 |
| 5 | 572 张未匹配图片的归属 | 能否绑定 SKU |
| 6 | OpenNext 平台选型 | 部署与询盘运行时 |
| 7 | 数据库选型 | 询盘持久化 |
| 8 | 生成物是否进版本控制（体积 vs 可复现） | 仓库策略 |

---

## 9. 变更流程

改本文件前先问：

1. **这是数据流变化还是实现细节？** 细节写进代码注释，不写这里。
2. **是否违反依赖方向（§7）？** 违反则停手，先记 `DECISIONS.md`。
3. **是否影响 `../page-architecture/`？** 影响则两份都改（`../README.md` 铁律 ③）。
4. **是否需要新校验（§6.2）？** 需要则加进 CI。
