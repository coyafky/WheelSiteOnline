# 计划：非 WP 页面 → WP 归属梳理 → 接 locale → es/th 翻译

- **状态**：待用户确认（**尚未动任何代码**）
- **日期**：2026-10-12
- **用户指令**：「先 make a plan：非 wp 页面变成 wp 页面，且如果是 post 管理的就归类到 post 中、
  如果是 page 管理的就归类到 page 中；然后再执行接入 locale；最后是 /es、/th 翻译」

---

## ⚠️ 先纠正用户前提里的一处事实（重要，影响方案）

用户说「如果是 **post** 管理的就归类到 post 中，如果是 **page** 管理的就归类到 page 中」。

**实测：WP 原生只有 `post` 和 `page` 两种类型，但这个项目已经多出两条自定义业务线：**

| WP 侧实体 | post_type | 记录数 | 承载 |
|---|---|---:|---|
| `page` | **`page`**（原生） | **12** | 站点页面（首页/关于/能力/四条产品线/询盘/感谢/隐私…）|
| `post` | **`post`**（原生） | **7** | **Insights 文章**（6 篇正式 + 1 篇 `Hello world!`）|
| `fh_guide` | 自定义 CPT | — | Insights 的**旧回退源**（迁移期保留，`fh_guides_native_authoritative` 开启后走 `post`）|
| `wheel_model` | 自定义 CPT | **138** | 轮毂型号目录 |

**→ 所以不是「二选一」而是「三选一 + 一个遗留」。**
`/products/wheels/[model]`（138 个型号）走的是 `wheel_model`，**既不是 post 也不是 page** ——
如果按「只有 post/page」去归类，这条线会被塞错。

📌 **本计划按「实体 → 归属」而不是「按页面路径」来组织**，避免把型号目录误归到 post。

---

## 一、当前真实拓扑（38 条路由，实测）

按**内容来源**分四类：

### A. 已有 WP Page 归属，且**已接 locale** ✅（7 条）
`/` `/about` `/capabilities` `/products` `/products/ev-components` `/products/custom-aluminum` `/products/safety-tires` `/request-a-quote` `/support/privacy` `/thank-you`

→ 已完成 zh。**本计划不动它们。**

### B. 已有 WP 归属，但**未接 locale**（2 条）⚠️
| 路由 | 实体 | 状态 |
|---|---|---|
| `/insights` | `post`（6 篇） | 契约支持 `translations`，**页面已传 locale**（上一轮接的），但**没有 zh 数据** |
| `/insights/[slug]` | `post` | 同上 |

→ **不是「变成 WP 页面」，而是「给已有的 WP 内容填 zh」**。

### C. 纯本地常量托管（**本计划的真正对象**）
| 路由 | 行数 | 内容来源 | 业务实体性质 |
|---|---:|---|---|
| `/contact` | 322 | `@/content/contact`（2 处） | **站点页面** |
| `/custom-development` | — | `@/content/custom-development` | **站点页面** |
| `/dealers` | — | `@/content/dealer-programs` | **站点页面** |
| `/dealers/private-label` | — | `@/content/private-label` | **站点页面** |
| `/fitment` | — | `@/content/fitment` | **站点页面**（含 `[platform]`）|
| `/fitment/[platform]` | — | 同上 | 数据驱动（真实 slug：`bmw-m` 等）|
| `/gallery/finishes` | — | `@/content/finishes` + `finish-guide` | **站点页面** |
| `/tools` | — | `@/content/tools` | **站点页面** |
| `/tools/offset-calculator` | — | `@/content/tools` | **工具页** |
| `/insights/bolt-patterns` | — | `@/content/bolt-patterns` | **站点页面** |
| `/insights/bolt-patterns/[pattern]` | — | 同上 | 数据驱动 |
| `/products/wheels` | — | `@/content/wheel-catalogue` | **目录页** |
| `/products/wheels/[model]` | — | `@/content/wheel-detail` | **型号详情（138 个）** |
| `/products/wheels/flow-formed` | wp=1 | `@/content/flow-formed-wheels` | **工艺页** |
| `/products/wheels/forged` | wp=1 | — | **工艺页** |
| `/support/{returns,shipping,terms,warranty}` | — | `@/content/legal` | **法律文本（4 篇）** |

### D. 纯重定向（**不是页面，不要建 WP 记录**）（7 条）
`/gallery`→`/fitment`｜`/gallery/wheels`→`/products/wheels`｜`/manufacturing`→`/capabilities`｜
`/resources`→`/insights`｜`/resources/[slug]`｜`/resources/bolt-patterns`→`/insights/bolt-patterns`｜
`/resources/bolt-patterns/[pattern]`

→ ⚠️ **这 7 条必须排除在「变成 WP 页面」之外** —— 它们没有自己的内容，
建 WP 记录是错的（且 `ARCHITECTURE.md` 明确登记「6×308 + 1×307 刻意保留」）。

---

## 二、归属决策表（本计划的核心交付）

**规则**：按**内容性质**而非路径归类。

| 内容性质 | 归属 | 理由 |
|---|---|---|
| **站点页面**（关于/能力/政策/工具入口/联系） | **`page`** | 一次性、编辑式、有固定位置 |
| **编辑文章**（Insights） | **`post`** | 可累积、有发布时间/分类、博客语义 |
| **型号目录**（138 个轮毂型号） | **保持 `wheel_model`** | 有结构化规格、独立上架门槛、不适用 post/page |
| **重定向** | **不建记录** | 无自有内容 |

### 需要新建/迁移的具体清单

**① 归入 `page`（12 个新 Page）**
| WP page_key | 路由 |
|---|---|
| `contact` | `/contact` |
| `custom-development` | `/custom-development` |
| `dealers` | `/dealers` |
| `dealers-private-label` | `/dealers/private-label` |
| `fitment` | `/fitment` |
| `gallery-finishes` | `/gallery/finishes` |
| `tools` | `/tools` |
| `tools-offset-calculator` | `/tools/offset-calculator` |
| `insights-bolt-patterns` | `/insights/bolt-patterns` |
| `products-wheels` | `/products/wheels` |
| `products-wheels-flow-formed` | `/products/wheels/flow-formed` |
| `products-wheels-forged` | `/products/wheels/forged` |

⚠️ **法律文本 4 篇（returns/shipping/terms/warranty）需单独决定**：
- 选项 1：各建一个 `page`（与 `privacy` 一致 → 已有先例）
- 选项 2：4 篇合成一个 `page`（`legal`），按 slug 检索
- **我建议选项 1**（与既有 `privacy` 一致，且法律文本各有独立批准需求）

**② 归入 `post`** —— 已由现有 6 篇 Insights 承载，**无需新建**
→ 只是**补 zh 内容**（`translations.zh` + `translation_status.zh = approved`）

**③ 数据驱动页（不建记录，走数据层）**
`/fitment/[platform]`、`/insights/bolt-patterns/[pattern]`、`/products/wheels/[model]`
→ 它们的**正文骨架**在父页，**数据**在 content 模块。**只翻骨架 + 数据里的展示字段**，不建独立 WP 记录。

---

## 三、⚠️ 一个必须先解决的前置问题：`src/content/*.ts` 无 locale 维度

**这是整件事的根因**（38 个模块 / 77k 行，`grep locale` 零命中）。

**两个方案，需要用户拍板：**

### 方案甲 · 全部搬进 WP（沿用 `/products` 已验证的模式）
- 每个页面把本地常量搬进对应 WP 记录的 `content`，前端加 `resolveLocalized` 回落
- ✅ 一次性解决，en/zh/es/th 全自动可用；✅ 运营可后台改文案
- ⚠️ 成本：12 个 Page + 4 法律页，每个都要写迁移脚本 + 词表（估 **~500–800 条新词条**）
- ⚠️ **`/products/wheels/[model]` 的 138 个型号数据不适合搬**（量大、结构化、有独立上架门槛）→ 需单独设计

### 方案乙 · 给 `src/content/*.ts` 加 locale 变体
```ts
export const contactContent: Record<Locale, ContactContent> = { en: {...}, zh: {...} }
```
- ✅ 不依赖 WP；✅ 类型安全
- ⚠️ 要手改 38 个模块；⚠️ **每次加语言都要改 38 个文件**；⚠️ 运营改不了文案

**我建议甲（理由）**：`/products` 已经验证过这条路，模式可复制；运营能改文案；加 es/th 时零代码改动。
**但 138 个型号数据建议保持方案乙或独立表**（不该塞进单条 WP 记录）。

---

## 四、执行顺序（4 个切片）

| 切片 | 内容 | 前置 | 估时 |
|---|---|---|---|
| **S1** | **归属落地**：12 个 Page 建进 WP + 内容迁入 + 前端接 `resolveLocalized`（**先只做 en，验证不回归**） | 用户拍板方案甲/乙 | 大 |
| **S2** | **接 locale**：给 S1 的页面接 `getLocale()` + 生成器扩词表 | S1 完成且 en 零回归 | 中 |
| **S3** | **zh 填充**：S1+S2 的页面 + Insights 6 篇，填 zh 并 seed | S2 | 中 |
| **S4** | **es/th 翻译**：全部已接 locale 的页面（含前面已完成的 11 页） | S3 | 大 |

⚠️ **顺序不可颠倒**（用户已定）：先归属 → 再接 locale → 再 es/th。
📌 **理由（我补充的）**：若先接 locale 再搬 WP，等于**对两套来源各接一遍 locale**，返工。

---

## 五、每个切片的验收标准（统一）

- [ ] `npm test` / `typecheck` / `lint` / `build` 全绿
- [ ] **渲染后 HTML 扫描**（不只页面文件）—— 见下方纪律
- [ ] `/zh` 渲染中文；``/` 渲染英文；`/es` `/th` 回落**且日志留痕**
- [ ] 无中文泄漏进 en 页（语言下拉的「中文」除外）
- [ ] `INDEXABLE_LOCALES` 仍 `["en"]`（索引门槛**不动**）
- [ ] 无 commit / push / deploy

---

## 六、纪律（历轮血泪，逐条都是踩过的）

1. **改 WP 数据后必须 `kill` dev server + `rm -rf .next` + 同参数重启**（Next 16 内存缓存删磁盘清不掉）
2. **英文正本 `fh_content_json` 与 `content_by_locale` 是两份 meta** —— 迁移形状必须**两份都写**
3. **验证必须扫渲染后的 HTML**，不能只看页面文件（组件树里的字面量不在页面文件里）
4. **生成器报 0 untranslated ≠ 渲染无英文** —— 两者测不同层，必须都做
5. **`grep '@/content/'` 要区分「类型 import」与「文案 import」**
6. **抽样动态路由必须从数据源取真实 slug**（踩过两次：`TOYOTA001`、`5x114-3`）
7. **子 agent 说「某机制不可行」时必须自己复现**（曾误判过一次）
8. **子 agent 步数用尽是稳定模式** → 必须自己复核它承诺的每份交付物是否存在

---

## 七、需要用户拍板（4 项）

1. **方案甲（搬 WP）还是方案乙（content 加 locale 变体）？** —— 我建议甲
2. **4 篇法律文本**：各建一个 Page（建议）还是合并成 1 个？
3. **138 个轮毂型号**：保持 `wheel_model` CPT 不动（建议），还是也要接 locale？
4. **`/gallery/finishes`、`/tools/*`、`/insights/bolt-patterns`** 这类「工具/参考页」要不要都搬？
   （它们偏产品化，改动价值可能低于成本 —— 可考虑只做前 6 个高价值页）

---

## 八、本计划未做的事（边界）

- ❌ **未改任何代码**（纯 read-only 调查 + 计划）
- ❌ 未建任何 WP 记录
- ❌ 未开始 S1
- ⚠️ 行数为「按路由粗估」，**未逐字段盘点**（那是 S1 的第一项工作）
- ⚠️ 未核 `/fitment/[platform]` 与 `bolt-patterns/[pattern]` 的**真实数据量**（前者的真实 slug 已知：`bmw-m`/`mercedes-amg`/`audi-rs`）
- ⚠️ 未评估 **`/products/wheels` 目录页**的筛选参数与 WP 化的兼容性（它当前走 `getWheelCataloguePage()` 查询层）
