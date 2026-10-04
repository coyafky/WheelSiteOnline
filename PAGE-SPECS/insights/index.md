# `/insights` 页面规格（内容中心 · 索引结构决定成败）

> **路由**：`/insights`（⚠️ **现为 `/resources`，需改名**）
> **目标文件**：`src/app/insights/page.tsx`（由 `src/app/resources/page.tsx` **改名 + 重排**）
> **渲染**：静态壳 + 客户端分类筛选（列表小，无需往返 `/resources/page.tsx` 现即为 client 筛）
> **数据**：`content/resources.ts`（`guides: GuideEntry[]` 共 **6 篇**）
> **设计依据**：`../../ARCHITECTURE/page-architecture/resources-hub-page.md`

---

## 0. 一句话

**这一页是「内容中心索引」，不是「内容本身」** ——
竞品页面很轻（3 段 / 3,804px / 589 字），**但它链出去 9 个内容页，那些才是 SEO 资产**。

**→ 判定这一页好坏的标准是「索引结构」，不是页面长度。**

**🔴 🔴 而竞品的索引结构是坏的**：它写了 8 篇文章，**却只用了一个 `ALL CATEGORIES` 分组**
—— 分类在它那里**只是装饰性标题（14 字，不可点选）**，没有起到组织作用。

**→ 我们的核心改进（三条，缺一不可）**：
1. **分类导航必须可点选**
2. **分类必须带计数**
3. **计数必须真实**

---

## 1. 页面骨架（四段式）

竞品 3 段（Hero + 分类条 + 网格）。**我们加一段「入门区」**（学它的 `START HERE`）。

| 序 | 内容块 | 必须性 | 说明什么 | 段落类型 | 就绪度 |
|---|---|---|---|---|---|
| ① | Hero | 必须有 | 内容中心定位 + **目标市场** | 定位 | ⚠️ 市场待确认 |
| ② | **分类导航 ★** | 必须有 | **可点选 + 带计数** | **导航** | ⚠️ 计数真实但仅 6 篇 |
| ③ | **START HERE** | 必须有 | 3–4 篇入门必读 | **入门路由** | ⚠️ 需标定入门文 |
| ④ | 文章网格 | 必须有 | 按分类分组 | 索引 | ⚠️ **6 篇，需补稿** |

**与竞品对照（逐段动作）**：

| 段 | 竞品 | 我们 | 动作 |
|---|---|---|---|
| ① Hero | ✅ 53 字 | ✅ | KEEP |
| ② 分类条 | ⚠️ **装饰性**（14 字，不可点） | **★ 升级为可点选 + 计数** | **改进（核心）** |
| ③ START HERE | ✅（混在网格里） | **★ 独立成段** | **改进** |
| ④ 网格 | ✅ 单分类，8 篇 | **按分类分组** | **改进** |

```
/insights
├── ① <InsightsHero>          H1 + 导语（★ 含目标市场）
├── ② <CategoryNav>  ★         可点选分类 + 真实计数 ← 竞品没做到
├── ③ <StartHere>             3–4 篇入门必读（独立成段）
└── ④ <GuideGrid>             按分类分组的文章卡（16:9 卡片）
    └── <GuideCard> × N
```

---

## 2. 逐块规格

### ① Hero（InsightsHero）

| 项 | 内容 |
|---|---|
| H1 | **轮毂知识与选型指南**（面向经销商 / 改装店 / 采购） |
| eyebrow | `INSIGHTS` |
| 导语 | 一句话说清这页收录什么（选型 / 规格 / 工艺 / 采购） |
| **目标市场** | ⚠️ **需丰怀确认峰徊主力出口市场** |

**⚠️ 竞品在 meta description 里藏了市场定位**：

> *"Forged wheel resources for dealers in **North America and the Middle East / GCC**…"*

**它明确写了目标市场 —— 这是内容策略的一部分**（不是泛泛写「面向经销商」，而是点名了具体区域）。
**→ 我们对应：峰徊的出口市场是哪几个？必须问丰怀**（现在项目里没这个信息）。

**props 契约**：

```ts
// src/components/sections/insights-hero.tsx（需新建）
type InsightsHeroProps = {
  eyebrow: string;        // "INSIGHTS"
  title: string;
  lede: string;
  /** ⚠️ 目标市场 —— 未确认时为空数组，导语降级为通用表述 */
  markets: string[];      // ["北美", "中东 / 海湾"] —— 竞品做法
};
```

**⚠️ 数据已存在**：`content/resources.ts` 已有 `resourcesHero`（`resources.ts:18`）—— 直接接，仅补 `markets`。

### ② ★ 分类导航（CategoryNav，本页核心改进）

**竞品做成装饰，我们做成功能**：

| 项 | 竞品 | 我们 |
|---|---|---|
| 形态 | 一条 161px 的窄条，14 个字 | **可点选的分类 + 计数** |
| 行为 | 不可点（装饰） | **点击筛选** |
| 计数 | ❌ 无 | **✅ 「车型适配（4）」** |

**🔴 分类计数必须真实** —— 只有 3 篇文章就不能写「8 篇」。

#### 2.1 目标四分类（对齐设计文档 §5）

```
① 车型适配      坦克 / BJ40 / 牧马人 / …
② 规格与技术    PCD / ET / CB / 尺寸 / 孔距
③ 工艺与制造    旋压 / 低压 / 锻造 / 表面处理
④ 采购与合规    选型清单 / 询盘准备 / 贸易条款
```

**★ 四类与「九段式产品线模板」呼应** —— **内容中心不是孤立的，它是产品线的延伸阅读。**

#### 2.2 🔴 现状与目标的差异（**施工前必须处理**）

**实测现有 `guides` 的分类计数（6 篇）**：

| 现有 category（英文） | 篇数 |
|---|---|
| `Fitment` | 2 |
| `Construction` | 2 |
| `Finishing` | 1 |
| `Logistics` | 1 |
| **合计** | **6** |

**🔴 冲突**：现有分类是**英文四类，且与目标四分类不是一一对应**：
- `Fitment` → ① 车型适配（但现有 2 篇可能偏**方法**而非车型）—— ⚠️ **需逐篇复核**
- `Construction` → ③ 工艺与制造 ✅
- `Finishing` → ③ 工艺与制造（**会与 Construction 合并**）
- `Logistics` → ④ 采购与合规 ✅
- **② 规格与技术** → **现有 0 篇**（PCD/ET/CB 类文章尚无，尽管 `bolt-patterns` 路由存在）

**→ 施工要求：**
1. **必须在 `resources.ts` 里改 `category` 字段为四个中文目标分类**（或建立映射表）
2. **② 规格与技术 计数为 0 时，该分类标签仍然渲染**（显示「0」），
   **⚠️ 但点击后必须给出空态提示，不能跳进空白页**
3. ⚠️ `Fitment` 的 2 篇需逐篇判断：是车型文（→①）还是方法文（→②）

**props 契约**：

```ts
// src/components/category-nav.tsx（★ 公共组件 —— 未来 /products/wheels 筛选器同族）
type InsightCategory = {
  /** 稳定 ID（URL 参数用），如 "fitment" —— 不随显示名变化 */
  id: string;
  /** 显示名，如 "车型适配" */
  label: string;
  /** ★ 真实计数 —— 从 guides 计算，不手写 */
  count: number;
};

type CategoryNavProps = {
  categories: InsightCategory[];
  /** "all" 或某个 category.id —— 与 URL 同步 */
  value: string;
  onChange: (next: string) => void;
  /** ★ "全部" 标签的计数 = guides.length */
  totalCount: number;
  /** ⚠️ 计数为 0 的分类仍渲染，但标记为 disabled-link */
  showEmptyCategories?: boolean;
};
```

**交互纪律**：
- ✅ **分类状态必须进 URL**（可分享、可 SEO、返回可复原）—— 与 `/products/wheels` 筛选器同纪律
  `router.replace` + `scroll: false`，**不要 push 出历史堆栈**
- ✅ **计数从数据实时计算**（`guides.filter(g => g.category === id).length`）
- ❌ **禁止硬编码计数** —— 加一篇文章就会对不上
- ❌ **禁止**用「热门 / 推荐」类排序（我们没有阅读量数据）

### ③ START HERE（入门区，独立成段）

**竞品把它混在网格里**（它的 `START HERE` 是网格内的一个 H2），**我们独立成段**。

**内容**：**3–4 篇入门必读** —— 覆盖「三类读者」各一篇起点：

| 读者 | 入门文 | 状态 |
|---|---|---|
| 只想懂规格 | 《轮毂尺寸怎么量（PCD/CB/ET）》 | ⚠️ 需写稿 |
| 想知道怎么选 | 《轮毂偏距（ET）怎么选》 | ⚠️ 需写稿 |
| 想给某车型选 | 《坦克 300 轮毂适配指南》 | ⚠️ 需写稿（★ 数据强项） |
| 想看工艺 | 《锻造轮毂是怎么做出来的》 | ⚠️ 需写稿 |

**props 契约**：

```ts
// src/components/start-here.tsx（本页）
import type { GuideEntry } from "@/content/types";

type StartHereProps = {
  eyebrow: string;          // "START HERE"
  heading: string;          // "第一次来，先看这四篇"
  /** ★ 3–4 篇 —— 由数据侧标定（见 §4.2），不写死在组件里 */
  guides: GuideEntry[];
};
```

**🔴 纪律**：`guides` **必须是数据侧标定的入门文**（如 `GuideEntry` 加 `isStartHere?: boolean`），
**不得在组件里按数组下标取前 4 篇**（顺序一变入门区就乱）。

### ④ 文章网格（GuideGrid + GuideCard）

**布局**：`.container-fh-wide` 内 CSS Grid，**按分类分组**（每组一个 H2 + 该组卡片）。

| 断点 | 列数 |
|---|---|
| ≥1440 | **3 列** |
| 1024 | 2 列 |
| 768 | 2 列 |
| 390 | 1 列 |

#### 4.1 ★ 卡片规格（16:9 横构图 —— 与轮毂卡区分）

**竞品卡片图实测**（15 张）：渲染 `307×172` ≈ **16:9 横构图**
（与它的轮毂卡片 `0.71` 竖构图**不同**）。

| 项 | 规格 |
|---|---|
| 比例 | **16:9 横构图** ★ **与轮毂卡的 1:1 明确区分** |
| 尺寸 | **1600×900** |
| 格式 | WebP |
| **alt** | **区分实拍 / 示意图**，带车型或主题 |
| 无图时 | **不显示图**（不做占位图）—— 文章卡没图不违和 |

**★ 竞品 alt 写得好**（值得学）：
> *"Tesla Model Y side profile with custom wheels for EV fitment reference"*（实拍）
> *"Positive zero and negative wheel offset diagram for a forged wheel fitment guide"*（示意图）

**props 契约**：

```ts
// src/components/guide-card.tsx（本页 + 未来分类页复用）
import type { GuideEntry } from "@/content/types";

type GuideCardProps = {
  slug: string;
  title: string;
  summary: string;
  category: string;          // 显示用分类名
  readingTime: string;       // "5 min read"
  /** ⚠️ 无图时不传 → 卡片不渲染图区（不是占位图） */
  image?: { src: string; width: number; height: number; alt: string };
  /** ★ 图片来源类型 —— 决定 alt 写法 */
  imageKind?: "photo" | "diagram";
  /** ★ 带 needsVerification 的文章必须显示核验提示（类型已内建） */
  needsVerification?: boolean;
  href: string;              // /insights/<slug>
};
```

**🔴 三条硬纪律**：
1. **卡片图 16:9 / 1600×900**（**不要用轮毂卡的 1:1**）—— 两类卡片视觉必须能分辨
2. **无图不占位** —— `image` 缺失时**不渲染图区**，卡片变成纯文字卡
3. **`needsVerification` 必须透传显示** —— `GuideEntry` 类型已内建该字段（`types.ts:170`），
   指向「含需工程核准数字」的文章，**不得在卡片层吞掉**

**alt 模板**：
- 实拍：`<车型> 侧面照，配 <型号> 轮毂`
- 示意图：`<主题>示意图，用于 <文章标题>`

#### 4.2 分组渲染

```ts
// 页面内联逻辑（不建组件）
const grouped = categories.map(c => ({
  category: c,
  guides: guides.filter(g => g.category === c.label),
})).filter(g => g.guides.length > 0);
```

**⚠️ 空分类组不渲染 H2**（只保留 ② 里的「0」计数标签）。

---

## 3. 组件清单

### 3.1 复用已有

| 组件 | 路径 | 用途 | 处置 |
|---|---|---|---|
| **`<GuidesAccordion>`** | `src/components/guides-accordion.tsx`（210 行，client） | 现有文章列表 + 客户端分类筛选 | ⚠️ **可复用但建议改名/拆分**，见下 |
| **`<ProseArticle>`** | `src/components/prose-article.tsx`（260 行） | **`/insights/[slug]` 文章正文渲染器** | ✅ **直接复用，不改** |
| `<DealerCta>` | `src/components/sections/dealer-cta.tsx` | ④ 段后收尾 | ✅ **21 处复用** |
| `content.resources` | `src/content/resources.ts` | `guides` / `resourcesHero` / `resourcesPathways` | ✅ 已就绪 |

**⚠️ `<GuidesAccordion>` 的处置（三选一，建议 A）**：

| 方案 | 做法 | 评价 |
|---|---|---|
| **A（建议）** | **拆成 `<CategoryNav>` + `<GuideCard>` + `<GuideGrid>`**，删除 accordion 形态 | 卡片直接跳文章页（`ProseArticle` 已承担展开阅读）；accordion 与「跳详情页」职责重复 |
| B | 保留 `<GuidesAccordion>`，仅替换分类条为 `<CategoryNav>` | 改动最小，但卡片仍是「就地展开」而非「跳转」，与 16:9 卡片规格不符 |
| C | 改名 `<GuideGrid>` 并改内部 | 名字改了、内部仍带 accordion 状态，语义混乱 |

**→ 本规格按方案 A 描述**：`<GuidesAccordion>` 的「分类筛选」逻辑**提取进 `<CategoryNav>`**，
「卡片」逻辑**提取进 `<GuideCard>`**，**accordion 展开态废弃**（用户应进文章页阅读）。

### 3.2 需新建

| 组件 | 建议路径 | 职责 | 复用度 |
|---|---|---|---|
| **`<CategoryNav>`** | `src/components/category-nav.tsx` | ★ 可点选分类 + 真实计数 | **2 页**（本页 + 未来分类页） |
| **`<GuideCard>`** | `src/components/guide-card.tsx` | 16:9 文章卡（无图降级） | **2+ 页** |
| **`<GuideGrid>`** | `src/components/guide-grid.tsx` | 按分类分组网格 | 2 页 |
| `<InsightsHero>` | `src/components/sections/insights-hero.tsx` | H1 + 导语 + 市场 | 本页 |
| `<StartHere>` | `src/components/start-here.tsx` | 入门区独立成段 | **2 页**（本页 + 未来分类页） |

**★ 提取纪律**：`<GuideCard>` 与 `<GuideGrid>` **从第一天就放进 `src/components/`** ——
**不要先写在页面文件里**（否则第二页要复制）。

---

## 4. 数据契约

### 4.1 现有内容模块（`src/content/resources.ts`）

```ts
// ✅ 已存在
export const resourcesHero: { /* eyebrow, title, lede */ };          // → ①
export const resourcesIntro: { /* … */ };                            // → ①
export const resourcesCards: { /* … */ };                            // → ④
export const guideVerificationNotice: { /* … */ };                   // → ④ needsVerification
export const guides: GuideEntry[];                                   // → ②③④ ★ 共 6 篇
export const resourcesExtraIndex: { /* … */ };                       // → ④
export const resourcesPathways: ResourceLink[];                      // → ④ 尾部
export const guideArticleCopy: { /* … */ };                          // → /insights/[slug]
```

### 4.2 `GuideEntry` 需要的字段变更（🔴 施工前置）

```ts
// src/content/types.ts —— 建议扩展 GuideEntry（types.ts:170 现状）
export type GuideEntry = {
  slug: string;
  title: string;
  summary: string;
  category: string;          // ⚠️ 必须改为四个中文目标分类之一
  readingTime: string;
  detail: GuideDetail[];     // 现有：hub 就地预览（方案 A 下不再使用）
  sections: GuideSection[];  // ★ /insights/[slug] 正文
  answer: string;            // ★ 答案先行 standfirst
  needsVerification: boolean;// ★ 含需工程核准数字

  // ★ 新增（本规格需要）
  /** 是否入门必读 —— 决定 ③ START HERE 的成员 */
  isStartHere?: boolean;
  /** 卡片图（⚠️ 16:9 / 1600×900）—— 缺省则不渲染图区 */
  image?: { src: string; width: number; height: number; alt: string; kind: "photo" | "diagram" };
};
```

### 4.3 分类计数（★ 必须真实 —— 从数据计算）

```ts
// 页面内联计算，禁止手写
const categories: InsightCategory[] = [
  { id: "fitment",      label: "车型适配",   count: guides.filter(g => g.category === "车型适配").length },
  { id: "spec",         label: "规格与技术", count: guides.filter(g => g.category === "规格与技术").length },
  { id: "manufacturing",label: "工艺与制造", count: guides.filter(g => g.category === "工艺与制造").length },
  { id: "procurement",  label: "采购与合规", count: guides.filter(g => g.category === "采购与合规").length },
];
```

**🔴 实测现状 vs 目标（施工前必读）**：

| 目标分类 | 现状篇数（按现有英文分类折算） | 缺口 |
|---|---|---|
| 车型适配 | ⚠️ 0–2（取决于 `Fitment` 2 篇的性质） | 需车型文 |
| 规格与技术 | **0** | **★ 完全缺（有 `/resources/bolt-patterns` 但不在 guides 里）** |
| 工艺与制造 | 3（`Construction` 2 + `Finishing` 1） | 较齐 |
| 采购与合规 | 1（`Logistics` 1） | 需补 |
| **合计** | **6** | **潜力 12+** |

### 4.4 就绪度总表

| 段 | 依赖 | 就绪度 |
|---|---|---|
| ① Hero | 内容定位 + **目标市场** | ⚠️ 市场待确认 |
| ② 分类 | 分类体系（已定四类） + **改 `category` 字段** | ⚠️ **需改数据** |
| ③ START HERE | **3–4 篇入门文标定** | ⚠️ **需标定 + 写稿** |
| ④ 网格 | 文章（现有 6 篇，目标 12+） | ⚠️ **需写稿** |

**→ 这页的阻塞不在数据，在「写稿」与「分类字段改造」。**
**12 个选题全部有数据支撑，但没有一篇现成的文章**（设计文档 §4.1）。

---

## 5. 布局与响应式

| 项 | 规格 |
|---|---|
| 容器 | `.container-fh-wide`（1440）—— **索引页用宽容器**（与 `/products/wheels` 一致） |
| 深色段 | **① Hero 可用 `bg-ink`**（与站内页头统一）；②③④ 全浅色 |
| ② 分类导航 | 横向滚动条（移动端）／ 换行（桌面）；`sticky top-20` 可选 |
| ④ 网格 | `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` |
| 卡片图 | **16:9**，`aspect-[16/9]`，`object-fit: cover`（⚠️ **文章图可以 cover**，与轮毂图的 `contain` 纪律不同 —— 那是圆形的特例） |
| 断点 | 重点 **768**（竞品在索引类页面有横向溢出史）与 **390** |
| 动效 | 网格用 `[data-reveal-group]` 错峰 80ms，**上限 12 项** |
| 🔴 fail-visible | **不要自己加 `opacity-0`** |
| 标题 | `font-display` + uppercase + `tracking-[0.0xem]` |

---

## 6. 待补与阻塞

| # | 事项 | 阻塞 | 就绪度 |
|---|---|---|---|
| **1** | **峰徊主力出口市场**（竞品明写北美 + 中东/GCC） | **① Hero + 市场专题文** | ❌ **需丰怀确认** |
| **2** | **路由改名 `/resources` → `/insights`** | **全部内链 + 13 处引用** | ❌ **未执行**（见 §6.1） |
| **3** | **`guides` 的 `category` 字段改为四个目标分类** | ② 分类导航 | ❌ **未执行** |
| **4** | **② 规格与技术 现有 0 篇** | ②（点进去空白） | ❌ **需写稿** |
| **5** | **12 篇选题的写作排期与责任人** | 内容上线 | ❌ **未排** |
| **6** | **③ START HERE 的 3–4 篇标定**（`isStartHere`） | ③ | ❌ **未标** |
| **7** | 文章配图从哪来（无真实素材） | ④ 卡片视觉 | ❌ **无素材** |
| **8** | 是否要中英双语 | 工作量 ×2 | ⚠️ 待定 |
| **9** | 分类计数的展示方式（角标 / 括号） | ② | ⚠️ 小 |
| **10** | `/insights/bolt-patterns` 是否并入 guides 分类 | ②④ | ⚠️ 现为独立路由树 |

### 6.1 🔴 路由改名的影响面（施工清单）

**⚠️ 现路由是 `/resources`，需改名 `/insights`。** 实测影响：

```bash
# 实测：src/ 下 "/resources" 字面量引用 13 处
src/app/resources/                    → src/app/insights/          （目录改名）
src/app/resources/[slug]/             → src/app/insights/[slug]/
src/app/resources/bolt-patterns/      → src/app/insights/bolt-patterns/   （⚠️ 或保持独立）
src/content/site.ts（footerNav:96）   "Resources" → "Insights"（+ href 改）
src/content/site.ts（footerNav:99）   "/resources/bolt-patterns" → …
src/components/prose-article.tsx      面包屑 "Resources" → "Insights" + href
src/content/resources.ts（多处 href）
+ next.config.ts 加 301： /resources/:path* → /insights/:path*
+ sitemap.ts / robots.ts 同步
```

**🔴 纪律**：**改名必须带 301 重定向** —— `/resources` 已有索引（若有外链），硬改会丢权重。

---

## 附 A：`/insights/[slug]` 文章页（**架构缺口 —— 按 `<ProseArticle>` 实际实现写**）

> **⚠️ 现有架构文档完全没定义文章页。** 本节按 `src/components/prose-article.tsx`（260 行）
> 与 `src/app/resources/[slug]/page.tsx`（现实现）**实测反推**，填上这个缺口。

### A.1 页面骨架

**文章页 = `<ProseArticle>` + `<DealerCta>`** —— 路由层极薄（**thin wrapper**）。

```
src/app/insights/[slug]/page.tsx
├── <ProseArticle guide={guide} related={related} />
└── <DealerCta />
```

**✅ 现有实现已如此**（`src/app/resources/[slug]/page.tsx`）——
原文注释：*"Thin wrapper over the shared `ProseArticle` renderer, which owns structure,
the conditional verification notice, the table of contents and the related-guides footer.
Keeps every route in lockstep."*

### A.2 props 契约（**实测，非推断**）

```ts
// src/components/prose-article.tsx —— 现有签名（不要改）
import type { GuideEntry } from "@/content/types";

export function ProseArticle({
  guide,        // 单篇指南（含 sections / answer / needsVerification）
  related,      // 相关文章
}: {
  guide: GuideEntry;
  related: GuideEntry[];
}) { … }
```

### A.3 `<ProseArticle>` 的内部结构（实测 A 段）

| 序 | 内部块 | 实现要点（实测） |
|---|---|---|
| A | **Hero** | `id="top"` / `aria-labelledby="article-title"`；`bg-ink` 深色；径向渐变 `rgba(194,101,10,0.22)` + 斜纹 overlay（`opacity-[0.06]`） |
| — | 面包屑 | `Home / Resources / <category>` —— 🔴 **`Resources` 需改 `Insights`**（`prose-article.tsx` 内硬编码，实测） |
| — | eyebrow | `guide.category`（`!text-forge`） |
| — | H1 | `id="article-title"`；`font-display` `clamp(2.2rem,6vw,4.2rem)` `font-800` uppercase `leading-[0.94]` |
| B | **核验提示** | ⚠️ **由 `guide.needsVerification` 驱动，NOT 由路由传入** —— 「含需工程核准数字的文章永远显示警告，不可能被意外渲染而无警告」 |
| C | **目录（TOC）** | 从 `guide.sections` 派生 |
| D | **正文** | `guide.sections: GuideSection[]` → `{ heading, body: string[] }` 逐段落 |
| E | **答案先行** | `guide.answer`（standfirst） |
| F | **相关文章页脚** | `related: GuideEntry[]`（3 篇） |

### A.4 路由层规格

```ts
// src/app/insights/[slug]/page.tsx
type GuidePageProps = { params: Promise<{ slug: string }> };   // ⚠️ Next 15 async params

// ✅ 现有实现（照搬即可）
export async function generateStaticParams() { /* guides.map(g => ({ slug: g.slug })) */ }
export async function generateMetadata({ params }) {
  // title: `${guide.title} — ${guide.category} Guide`
  // description: guide.summary
  // ⚠️ 未命中 → { title: "Guide not found" }
}
export default async function GuideArticlePage({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  // related 取法（实测）：同类优先 3 篇
  const sameCategory = guides.filter(g => g.slug !== guide.slug && g.category === guide.category);
  const others       = guides.filter(g => g.slug !== guide.slug && g.category !== guide.category);
  const related = [...sameCategory, ...others].slice(0, 3);
  return <><ProseArticle guide={guide} related={related} /><DealerCta /></>;
}
```

### A.5 文章页的硬纪律

| # | 纪律 | 依据 |
|---|---|---|
| 1 | **`needsVerification` 永不被绕过** | `types.ts:170` + `ProseArticle` 注释（**由数据驱动，不由路由控制**） |
| 2 | **「XX 车型适配指南」必须严守来源口径** | `fitment-pages-plan.md` §3.3：✅「本目录 77 个型号的标注 PCD 为 6×139.7」／❌「坦克 300 的 PCD 是 6×139.7」 |
| 3 | **文章里出现「确认适配」四个字就是事故** | 同上 —— 文章比页面更容易写飘 |
| 4 | **面包屑 `Resources` → `Insights`** | 路由改名（`prose-article.tsx` 内需同步） |
| 5 | **`generateMetadata` 未命中要返回 `notFound()`** | 现有实现已处理 |
| 6 | **文章卡图 16:9，文内图可自由** | 卡片规格见 §2④ |

### A.6 文章页待补

| # | 事项 | 就绪度 |
|---|---|---|
| 1 | 文章配图（无真实素材；示意图可用语料术语图） | ❌ |
| 2 | `resources/bolt-patterns` 与 guides 的关系（独立树？并入？） | ⚠️ |
| 3 | 文章结构化数据（`Article` / `FAQPage` JSON-LD）—— **现有未实现** | ⚠️ 缺口 |
| 4 | 面包屑 JSON-LD（`BreadcrumbList`）—— **现有未实现** | ⚠️ 缺口 |

---

## 附 B：与设计文档的对应

| 本规格的段 | 设计依据 |
|---|---|
| 四段式（3→4 的加段） | `resources-hub-page.md` §3 |
| ① Hero + 市场定位 | `resources-hub-page.md` §1.1 |
| ② ★ 分类可点选 + 计数 | `resources-hub-page.md` §1.2 + §5.1 |
| ② 四分类体系 | `resources-hub-page.md` §5 |
| ③ START HERE 独立成段 | `resources-hub-page.md` §3 |
| ④ 卡片 16:9 / 1600×900 | `resources-hub-page.md` §6 |
| ④ alt 区分实拍/示意图 | `resources-hub-page.md` §6 |
| 12 篇选题清单 | `resources-hub-page.md` §4.1 |
| 「机型指南」来源口径纪律 | `resources-hub-page.md` §4.3 + `fitment-pages-plan.md` §3.3 |
| 路由改名 `/resources` → `/insights` | `PAGE-SPECS/_components.md` §6 差异表 |
| `/insights/[slug]` 文章页 | **架构缺口** —— 按 `prose-article.tsx` 实测反推 |
| 竞品底本 3 段 / 8 篇 / 1 个装饰性分类 | `resources-hub-page.md` 附录 |
