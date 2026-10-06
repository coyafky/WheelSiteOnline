# 资源中心 Page 架构（`/insights`）

> **本文件定义内容中心 —— 竞品的 `/forged-wheel-resources/`。**
>
> 底本 = [2N Forged `/forged-wheel-resources/`](https://2nforged.com/forged-wheel-resources/)
> （3 段 / 3,804 px —— **竞品最轻的页面之一，但藏着最重的内容资产**）

- 版本：v1.0
- 建立日期：2026-10-01
- 上位：`README.md` §2.11 ｜ `content-design-and-new-pages.md` §2.1

---

## 0. 🔴 核心发现：这页是「入口」，真正的资产在别处

我原本以为它是「文章列表」。**读完才发现：真正的价值不在这一页，而在它链出去的 9 篇指南。**

| | 页面本身 | 它链出去的 |
|---|---|---|
| 段数 | **3 段** | — |
| 高度 | 3,804 px | 单篇指南自成一页 |
| 字数 | 589 | — |
| **链接** | **9 个内容页** | **这些才是 SEO 资产** |

**→ 这页在架构上的角色是「内容中心索引」，不是「内容本身」。**
**判定这一页好坏的标准是「索引结构」，不是「页面长度」。**

---

## 1. 竞品实测：3 段结构

| # | y | 尺寸 | 类名 | 字数 | 图 | 内容 |
|---|---|---|---|---|---|---|
| 0 | 0 | 1180×594 | `resources-hero` | 53 | 0 | **H1** + 导语 |
| 1 | 616 | 1180×161 | `resources-category-strip` | 14 | 1 | **分类条**（很窄） |
| 2 | 811 | 1180×2667 | `resources-layout` | 522 | 15 | **文章网格** |

### 1.1 段 0：Hero

```
H1: FORGED WHEEL RESOURCES FOR DEALERS AND WHEEL SHOPS
```

**⚠️ 注意它的 meta description 里藏了市场定位**：

> *"Forged wheel resources for dealers in **North America and the Middle East / GCC**, covering fitment, manufacturing, finishes, and dealer support."*

**它明确写了目标市场（北美 + 中东/海湾）。** 这是**内容策略的一部分** ——
不是泛泛写「面向经销商」，而是点名了具体区域。

**→ 我们对应**：峰徊的出口市场是哪几个？**必须问丰怀**（现在项目里没这个信息）。

### 1.2 段 1：分类条（只有 161px 高）

```
H2: Resource Topics
```

**极窄的一条** —— 它只是标签行，不是完整导航。
**⚠️ 只有 14 个字，1 张图。** 说明分类**没有做成可点选的筛选器**，只是装饰性标题。

### 1.3 段 2：文章网格（主体）

**结构是「两个层级」**：

```
H2: ALL CATEGORIES
   H3: Order clarity path          ← 分类名（在左）
   H3: Need a fitment review?      ← 转化入口（在右）

H2: START HERE
   H3: <8 篇文章>                   ← 实际文章卡
```

**⚠️ 关键发现：它只有「ALL CATEGORIES」一个分类分组。**
**「分类」在它这里只是装饰** —— 8 篇文章全堆在 `START HERE` 下面。

---

## 2. ★ 竞品的 9 篇内容（这才是真资产）

从 CTA href 完整提取（**9 个**）：

| # | 分类标签 | 标题 | URL | 类型 |
|---|---|---|---|---|
| 1 | **EV FITMENT** | TESLA MODEL Y WHEEL FITMENT GUIDE | `/tesla-model-y-wheel-fitment-guide/` | ① 车型 |
| 2 | **EV FITMENT** | TESLA MODEL 3 WHEEL FITMENT GUIDE | `/tesla-model-3-wheel-fitment-guide/` | ① 车型 |
| 3 | **VEHICLE FITMENT** | BMW G80 M3 WHEEL FITMENT & BOLT PATTERN GUIDE | `/bmw-g80-m3-wheel-fitment-guide/` | ① 车型 |
| 4 | **TRUCK FITMENT** | TOYOTA TACOMA WHEEL FITMENT GUIDE | `/toyota-tacoma-wheel-fitment-guide/` | ① 车型 |
| 5 | **WHEEL FITMENT** | WHEEL OFFSET FITMENT GUIDE | `/wheel-offset-fitment-guide/` | ② 方法 |
| 6 | **WHEEL FINISHES** | FORGED WHEEL FINISHES FOR DEALER PROGRAMS | `/forged-wheel-finishes/` | ③ 产品知识 |
| 7 | **WHEEL MANUFACTURING** | HOW FORGED WHEELS ARE MADE | `/how-forged-wheels-are-made/` | ③ 产品知识 |
| 8 | *(START HERE)* | UAE SUV WHEEL SETUP GUIDE: PATROL, LAND CRUISER & DESERT USE | — | ④ 市场 |
| 9 | *(START HERE)* | CUSTOM WHEEL FITMENT CHECKLIST | — | ② 方法 |

**另有 2 篇 bolt pattern（h3 有但未在 CTA 里找到 href）**：
- `BOLT PATTERN GUIDE: HOW TO CHECK PCD BEFORE ORDERING`
- `5×120 BOLT PATTERN CAR LIST & WHEEL FITMENT GUIDE`
- `5×112 BOLT PATTERN GUIDE`

**→ h3 共 10 个（含分类名 2 个），实际文章 8 篇 + 2 个分类标签。**

### 2.1 ★ 内容分四类（这是可复用的结构）

| 类型 | 竞品篇数 | 特征 | 我们对应 |
|---|---|---|---|
| **① 车型适配指南** | **4** | `Tesla Model Y/3`、`BMW G80 M3`、`Toyota Tacoma` | **★ 我们有 1018 型号 + 坦克系数据！** |
| **② 方法/清单** | 2–4 | `Fitment Checklist`、`Offset Guide`、`Bolt Pattern` ×3 | 可写（偏通用） |
| **③ 产品知识** | 2 | `How Forged Wheels Are Made`、`Finishes` | ✅ 语料库有料 |
| **④ 市场专题** | 1 | `UAE SUV SETUP GUIDE: PATROL, LAND CRUISER & DESERT USE` | ⚠️ 需市场信息 |

**★ 类型 ④「UAE SUV 沙漠用车指南」很值得注意**：
它把「市场」和「车型」结合 —— **中东市场的 Patrol / Land Cruiser 沙漠改装**。
**这是一个地区专属的选题，不是通用内容。** 说明竞品在做**本地化内容营销**。

---

## 3. ★ 我们的内容中心结构（四段式）

竞品 3 段（Hero + 分类条 + 网格）。**我们加一段「入门区」**（学它的 `START HERE`）。

```
/insights
├── ① Hero              内容中心定位 + 目标市场（★ 需丰怀确认）
├── ② 分类导航 ★        可点选的分类（竞品只做了装饰）
├── ③ START HERE        3–4 篇入门必读（学竞品）
└── ④ 文章网格          按分类分组
```

**与竞品对照**：

| 段 | 竞品 | 我们 | 差异 |
|---|---|---|---|
| ① Hero | ✅ | ✅ | KEEP |
| ② 分类条 | ⚠️ 装饰性（14 字，不可点） | **★ 升级为可点选分类** | **改进** |
| ③ START HERE | ✅（混在网格里） | **★ 独立成段** | **改进** |
| ④ 网格 | ✅ 单分类，8 篇 | **按分类分组** | **改进** |

**→ 竞品的核心缺陷：它写了 8 篇文章，但只用了一个 `ALL CATEGORIES` 分组。**
**分类在它这里没有起到组织作用。** 我们有 30+ 篇的潜力，**必须真的分类。**

---

## 4. ★ 内容规划：我们能写什么

**这是本页最重要的部分 —— 内容中心的成败取决于选题。**

### 4.1 我们能直接写（数据已就绪）

| # | 选题 | 依据 | 优先级 |
|---|---|---|---|
| **1** | **坦克 300 轮毂适配指南** | 实测 **77 个型号**标注坦克，PCD 100% 是 `6*139.7` | **P1** |
| **2** | **BJ40 轮毂适配指南** | **40 个型号** | **P1** |
| **3** | **牧马人轮毂适配指南** | **11 个型号** | P1 |
| **4** | **5×114.3 孔距完全指南** | **662 个型号**用这个 PCD（最高频） | **P1** |
| **5** | **5×112 孔距指南** | **439 个型号** | P1 |
| **6** | **6×139.7 孔距指南** | **193 个型号**（越野/皮卡） | P1 |
| **7** | **轮毂偏距（ET）怎么选** | 语料库有术语（ET −12~+48） | P1 |
| **8** | **旋压 vs 低压铸造 vs 锻造** | **350 / 142 / 20 个型号**有标注 | **P1** |
| **9** | **19 寸轮毂选购指南** | **346 个型号** | P2 |
| **10** | **锻造轮毂是怎么做出来的** | 语料库「工程与流程」类 | P1 |
| **11** | **轮毂表面处理完全指南** | **679 个值**，可分 4 类 | P2 |
| **12** | **轮毂尺寸怎么量（PCD/CB/ET）** | 语料库「轮毂参数」9 条术语 | P1 |

**→ 12 篇全部有真实数据支撑，不依赖丰怀新提供素材。**

### 4.2 需要丰怀确认才能写

| 选题 | 缺什么 |
|---|---|
| 出口市场专题（对应竞品的 UAE 篇） | **峰徊的主力出口市场是哪些？** |
| 交期与产能相关 | 交期数据 |
| 认证/合规 | 有哪些认证 |

### 4.3 ⚠️ 一条不能碰的

**「XX 车型适配指南」必须严守来源口径**（`fitment-pages-plan.md` §3.3）：

```
✅ 能写：「本目录 77 个型号的标注 PCD 为 6×139.7」
❌ 不能写：「坦克 300 的 PCD 是 6×139.7」
```

**后者是发布车辆出厂规格，需要来源证明。** 文章比页面更容易写飘 ——
**文章里出现「确认适配」四个字就是事故。**

---

## 5. 分类设计（★ 我们要真的分类）

**竞品只用了一个分类，我们按内容类型分四类**（对齐 §2.1）：

```
① 车型适配        坦克 / BJ40 / 牧马人 / …
② 规格与技术      PCD / ET / CB / 尺寸 / 孔距
③ 工艺与制造      旋压 / 低压 / 锻造 / 表面处理
④ 采购与合规      选型清单 / 询盘准备 / 贸易条款
```

**四类与「九段式产品线模板」呼应**（`README.md` §3.1）——
**内容中心不是孤立的，它是产品线的延伸阅读。**

### 5.1 分类导航（竞品做成装饰，我们做成功能）

| 项 | 竞品 | 我们 |
|---|---|---|
| 形态 | 一条 161px 的窄条，14 个字 | **可点选的分类 + 计数** |
| 行为 | 不可点（装饰） | **点击筛选** |
| 计数 | ❌ 无 | **✅ 「车型适配（4）」** |

**⚠️ 分类计数必须真实** —— 只有 3 篇文章就不能写「8 篇」。

---

## 6. 文章卡片规范

**竞品的卡片图实测**（15 张）：

```
渲染尺寸: 307×172   （≈ 16:9 横构图）
nat:      1600×900 / 1400×788 / 1200×900 / 800×600 / 1200×1200
```

**⚠️ 竞品用的是 16:9 横构图（307×172）** —— 与它的轮毂卡片（0.71 竖构图）**不同**。

**alt 写得很好**（值得学）：

> *"Tesla Model Y side profile with custom wheels for EV fitment reference"*
> *"Positive zero and negative wheel offset diagram for a forged wheel fitment guide"*

**★ 它区分了图片类型**：
- **实拍图**（`side profile with custom wheels`）
- **示意图**（`diagram for a forged wheel fitment guide`）

**→ 我们的卡片规范**：

| 项 | 规格 |
|---|---|
| 比例 | **16:9 横构图**（与竞品一致，文章卡与产品卡区分开） |
| 尺寸 | 1600×900 |
| **alt** | **区分实拍/示意图**，带车型或主题 |
| 无图时 | **不显示图**（不做占位图）—— 文章卡没图不违和 |

**⚠️ 我们目前没有文章配图。** 但语料库有术语图可做示意图，且
`SKILLS/imagegen-frontend-web` 可生成**氛围图**（不承载事实，见 `PROJECT.md`）。

---

## 7. 数据与依赖

| 段 | 依赖 | 就绪度 |
|---|---|---|
| ① Hero | 内容定位 + **目标市场** | ⚠️ 市场待确认 |
| ② 分类 | 分类体系 | ✅ 我们定了四类 |
| ③ START HERE | 3–4 篇入门文 | ⚠️ **需写稿** |
| ④ 网格 | 文章 | ⚠️ **需写稿** |

**→ 这页的阻塞不在数据，在「写稿」。**
**12 个选题全部有数据支撑，但没有一篇现成的文章。**

---

## 8. ★ 与竞品的关键差异

| 维度 | 竞品 | 我们 |
|---|---|---|
| 文章数 | **8 篇** | 潜力 12+ 篇 |
| 分类 | ⚠️ **1 个**（装饰性） | **4 类**（可点选 + 计数） |
| 车型文 | Tesla ×2 / BMW ×1 / Tacoma ×1 | **坦克 / BJ40 / 牧马人** ← **我们的数据强项** |
| PCD 文 | 3 篇（5×120 / 5×112 / 通用） | **5×114.3（662 型号）** 等 |
| 市场专题 | ✅ UAE 沙漠用车 | ⚠️ 待确认市场 |
| 转化入口 | ✅ `Need a fitment review?` | ✅ 学 |

**★ 我们的优势**：竞品的车型文是 **Tesla / BMW**（欧美主流），
而我们的数据强项是 **坦克 / BJ40 / 牧马人**（越野/皮卡）。

**→ 这不是劣势，是差异化定位。** 越野和皮卡是改装需求最旺的细分，
而且**竞品在中文越野车型上完全没有覆盖**。

---

## 9. 待确认

| # | 事项 | 影响 |
|---|---|---|
| **1** | **峰徊的主力出口市场是哪些？**（竞品明写北美 + 中东/GCC） | Hero + 市场专题文 |
| 2 | 12 篇选题的写作排期与责任人 | 内容上线 |
| 3 | 文章是否已有写手（`SKILLS/` 里有各平台写手 agent） | 生产路径 |
| 4 | 是否要中英双语 | 工作量 ×2 |
| 5 | 文章配图从哪来（无真实素材） | 卡片视觉 |
| 6 | 分类计数的展示方式 | 分类导航 |

---

## 附：数据来源与 WAF 陷阱（2026-10-01 再次验证）

**本文件的竞品事实全部来自已采集的结构数据**，不是现场抓取：

```
深圳公司的独立站搭建/docs/site-capture/2nforged/raw/
  └── forged-wheel-resources/structure-1440.json
```

### ⚠️ 现场抓取会失败（本次实测）

编写本文件时尝试 `curl` 现场抓取该页 → **返回 `403 - Forbidden`**，
页面内容为空（只有 WAF 错误页）：

```
<title>403 - Forbidden</title>
<title>bg_error_lines</title>
```

**原因**：竞品 WAF 拦截非 Playwright 的 User-Agent。
**这正是 `2nforged-page-inventory.md` 顶部已记录的坑** —— 本次是它的**第二次实证**。

**→ 纪律**：需要竞品现场数据时**必须走 Playwright 默认 UA**
（`cd 深圳公司的独立站搭建/docs/site-capture/2nforged && node capture.mjs <page>`），
**不要用 `curl` + 自定义 UA**。

**→ 但更该做的是：先用已采集的 `structure-*.json`。**
它含每个 section 的坐标、字数、CTA（含完整 href）、图片 alt ——
**本次分析的 8 篇文章＋9 个链出页全部由此得出，零现场请求。**

---

## 附：竞品实测数据

```
URL:       https://2nforged.com/forged-wheel-resources/
标题:      Forged Wheel Resources | Guides for Dealers and Wheel Shops
H1:        FORGED WHEEL RESOURCES FOR DEALERS AND WHEEL SHOPS
desc:      ...dealer in North America and the Middle East / GCC
段数:      3 段
高度:      3,804 px（全站第 2 矮，仅次于 contact）
字数:      589
分类:      1 个（"ALL CATEGORIES"，仅装饰）
文章数:    8 篇
链出:      9 个内容页
卡片图:    16:9 横构图（307×172 渲染 / 1600×900 原图）
alt 质量:  ★ 好（区分实拍与示意图）

内容四类：
  ① 车型适配 4 篇（Tesla×2 / BMW×1 / Tacoma×1）
  ② 方法清单 2-4 篇
  ③ 产品知识 2 篇
  ④ 市场专题 1 篇（UAE 沙漠用车）
```

**一句话**：这一页**页面很轻（3,804 px）、内容很重（8 篇指南）** ——
**它的架构成败取决于「索引结构」和「选题」，不是页面长度。**
