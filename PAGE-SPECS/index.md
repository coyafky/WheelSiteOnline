# PAGE-SPECS 总表

> **2026-10-04 首发更新**：本轮以 [英文首发逐页逐视口施工规格](2026-10-04-launch-viewport-spec.md) 为范围与内容顺序正本，覆盖四产品线、B/C 询盘和 PPT 素材。下表为 10 月 1 日历史索引，其中 `/insights`、海量系列/适配页、纯 B2B 描述不作为一个月首发要求；首期沿用 `/resources`，只发布逐项获准产品。旧文件保留供组件与历史参考。

> **本模块 = 页面施工图。** 每份规格回答「这一页有哪些内容块、每块用什么组件、吃什么数据、什么栅格」。
> **不回答「为什么这样设计」** —— 那是 `../ARCHITECTURE/page-architecture/` 的事。

- 建立：2026-10-01
- 上位：`../ARCHITECTURE/page-architecture/README.md`（站点地图与全局规则）
- 公共引用：**`_components.md`**（19 个现有组件 + 全部设计 token + 图片资产真相）

---

## 1. 全部页面规格索引

| # | 路由 | 规格文件 | 优先级 | 渲染方式 | 数据就绪 |
|---|---|---|---|---|---|
| 1 | `/` | `index-home.md` | P0 | 静态 | 部分（缺公司事实） |
| 2 | `/products` | `products/index.md` | P0 | 静态 | ✅ |
| 3 | `/products/wheels` | `products/wheels.md` | **P0** | 静态壳 + 客户端筛选 | ⚠️ 数据在 `assets/`，未接入 |
| 4 | `/products/wheels/[model]` | `products/wheels/[model].md` | **P0** | **SSG × 1018** | ⚠️ 同上 |
| 5 | `/products/wheels/series/[series]` | `products/wheels/series/[series].md` | P1 | SSG × ≤762 | ⚠️ + 商标风险 |
| 6 | `/products/ev-components` | `products/ev-components.md` | P1 | 静态 | ⚠️ 工程参数缺 |
| 7 | `/products/custom-aluminum` | `products/custom-aluminum.md` | P1 | 静态 | ⚠️ 边界数据缺 |
| 8 | `/products/safety-tires` | `products/safety-tires.md` | P1 | 静态 | 🔴 归属未定 |
| 9 | `/capabilities` | `capabilities.md` | P1 | 静态 | ⚠️ 产能数字缺 |
| 10 | `/custom-development` | `custom-development.md` | P1 | 静态 | ⚠️ MOQ/交期缺 |
| 11 | `/dealers` | `dealers/index.md` | P1 | 静态 | ⚠️ 政策缺 |
| 12 | `/dealers/private-label` | `dealers/private-label.md` | P1 | 静态 | 🔴 6 项政策缺 |
| 13 | `/about` | `about.md` | P1 | 静态 | ⚠️ 工厂事实缺 |
| 14 | `/contact` | `contact.md` | **P0** | **需 Node runtime** | ✅ 内容齐，❌ 无后端 |
| 15 | `/request-a-quote` | `request-a-quote.md` | **P0** | **Node runtime** | ✅ 内容齐，❌ 无后端 |
| 16 | `/thank-you` | `thank-you.md` | P0 | 静态 | ✅ |
| 17 | `/insights` | `insights/index.md` | P2 | 静态 | ⚠️ 需写稿 |
| 18 | `/insights/[slug]` | **见 `insights/index.md` 附 A**（不单列文件） | P2 | SSG | ⚠️ 需写稿 |
| 19 | `/privacy-policy` | **刻意不写**（见 §1.1） | P1 | 静态 | ⚠️ 需律师 |
| 20 | `/support/*` | **刻意不写**（代码已存在，见 §1.1） | P1 | 已有 ✅ | ⚠️ 需律师 |
| 21 | `/fitment/*` | `fitment/index.md` | P3 | SSG | ❌ 需派生（`styleName`） |

### 1.1 ✅ 完成度（2026-10-01）

| 状态 | 数量 | 说明 |
|---|---|---|
| **已出施工图** | **18** | 本表 #1–#18 全部有文件 |
| 不需要 | 1 | #21 `/fitment/*` 已含在 `fitment/index.md` |
| **刻意不写** | 3 | #19 `privacy` / #20 `support/*` —— ⚠️ **见下** |
| 本阶段不做 | 4 | `/gallery` `/gallery/finishes` `/tools` `/tools/offset-calculator`（见下） |

**⚠️ `privacy-policy` 与 `support/*` 为什么没有规格**：
`/support/{privacy,returns,shipping,terms,warranty}` **五页代码已存在**，
共享 `<LegalDocumentPage>`（`legal-document.tsx`，261 行）+ `content/legal.ts`（414 行）。
**它们是「法务文书」不是「页面设计」** —— 内容是律师的工作，组件已定型。
**→ 写施工图无意义。** 待律师给出文案后，只需改 `content/legal.ts` 的数据，**零组件改动**。

### 🚫 本阶段明确不做（2026-10-01 用户定案）

| 路由 | 现优先级 | 为什么不做 |
|---|---|---|
| `/gallery` | P3 | ❌ **无任何素材**（`assets/preview-media/` 里只有 `wheel-0~3` 和 `factory.webp`，**没有一张真实改装案例**） |
| `/gallery/finishes` | P2 | ⚠️ 只有示意值 —— `content/finishes.ts` 的 swatch 是 CSS 近似色，**不是真实色卡** |
| `/tools` | P2 | 工具集线器，本期无新增工具 |
| `/tools/offset-calculator` | P2 | ✅ **代码已存在且可用**，不需要施工图（没人要改它） |

**→ 本阶段不写这四份规格、不排期、不进任何页面的「路由段」。**
**⚠️ 但代码不删** —— `/gallery`、`/gallery/finishes`、`/tools/offset-calculator` 现路由保持可用，
只是**不在本轮施工范围里**（`<DealerCta>` 等组件不动它们）。

**⚠️ 一条连带影响**：`index.md` §5「三条全局纪律」中的「每页必须有询盘入口」
**不适用于暂缓页** —— 它们保持现状，不做增补。

---

## 2. ★ 组件复用矩阵（**最能看出哪些要新建**）

行 = 页面，列 = 组件。`●` = 复用已有 ｜ `○` = **需新建** ｜ `—` = 不用

| 页面 ＼ 组件 | 已有可直接复用 | 需新建 |
|---|---|---|
| `/` | `HomeHero` `TrustStrip` `ProductShowcase` `GalleryBand` `DealerCta` | `ProductLineCards`（四线平行卡）`CapabilityEvidence` `ProcessSteps` `InsightCardGrid` |
| `/products` | `DealerCta` | `ProductLineCards`（**复用首页同一个**）`LineIntroList` |
| `/products/wheels` | `DealerCta` `WheelSketch` | `WheelFilterBar` `WheelResultCount` `WheelModelGrid` `WheelCard` `Pagination` |
| `/products/wheels/[model]` | `DealerCta` `WheelSketch` | `Breadcrumb` `HeroImage` `TagRow` `VariantSpecTable` `FinishPalette` `RelatedModels` `DataNotice` |
| `series/[series]` | 同上 | `SeriesHeader` + 复用型号网格 |
| 三条能力线 | `DealerCta` | `CapabilityHero` `PartGroupCards` `BoundaryTable` `ProcessDiagram` `ParamTable` `FaqAccordion` |
| `/capabilities` | `ProcessExplorer`（已有，改名复用）`DealerCta` | `CapacityStrip` `QualityEvidence` |
| `/dealers` | `DealerCta` | `StatStrip` `SelfIdentifyBlock` `RiskCards` `CapabilityCards` `FlowSteps` `RouteBlock` `FaqAccordion` |
| `/dealers/private-label` | `DealerCta` | 同上 + `HardQuestions` `LegalBlock` `ChecklistBlock` |
| `/about` | `DealerCta` | `StatStrip`（复用经销商页）`SupplyChainBlock` `PartnerCards` `QualityNumbers` `RouteBlock` |
| `/contact` | `InquiryForm`（已有，**要接后端**）`DealerCta` | `LowBarrierIntro` `WhatToSend` `ContactDetails` |
| `/thank-you` | — | `ThankYouPanel` |
| `/insights` | `DealerCta` | `CategoryNav`（带计数）`StartHereBlock` `GuideCardGrid` |
| `/insights/[slug]` | `ProseArticle`（已有，改名复用）`DealerCta` | — |
| `/support/*` | `LegalDocumentPage`（已有 ✅）| — |
| ~~`/gallery`~~ · ~~`/gallery/finishes`~~ · ~~`/tools/*`~~ | **本阶段不做**（见 §1 暂缓表） | — |

### 2.1 ★ 新建组件优先级（**已按 16 份规格实测统计**）

| 优先 | 组件 | 规格提到它的文件数 | 说明 |
|---|---|---|---|
| 🔴 1 | **`DataNotice`** | **6** | 数据来源与免责（**全部产品页**，诚信底线） |
| 🔴 2 | **`RouteBlock`**（T7 路由段） | **4** | 长页尾部「接下来去哪」，**M2 模式** |
| 🔴 3 | **`ProcessSteps`** | **4** | 流程步骤（`/` · `/custom-development` · `/capabilities` · 能力线） |
| 🔴 4 | **`WheelCard`** | **4** | 型号卡（目录页 · 单品页相关型号 · 系列页 · 首页精选） |
| 🟠 5 | `FaqAccordion` | **3** | 统一 FAQ 手风琴（现在各页手写） |
| 🟠 6 | `StatStrip` | **3** | 数字信任带（`/dealers` · `/dealers/private-label` · `/about`） |
| 🟠 7 | `ProductFamilyGrid` | **2** | 四线平行卡 —— **`/` 与 `/products` 强制共用同一个** |
| 🟠 8 | `CapabilityGrid` | 2 | 能力卡组 |
| 🟠 9 | `FirstMessageChecklist` | 2 | T3 降门槛「先发什么」清单 |
| 🟠 10 | `TraceabilityBlock` | 2 | T6 证据段 |
| 🟡 11 | `CategoryNav` | 2 | 带计数的分类筛选条 |
| 🟡 12 | `Breadcrumb` · `TagRow` · `Pagination` · `WheelModelGrid` | 各 1–2 | 产品线骨架 |

**⚠️ 命名纪律已全站统一**（21 份规格实测，无别名）：

| 组 | 组件 |
|---|---|
| **跨 4+ 页** | `DataNotice`(6) ｜ `RouteBlock`(4→**6**) ｜ `ProcessSteps`(4) ｜ `WheelCard`(4) |
| **跨 2–3 页** | `FaqAccordion`(3→**6**) ｜ `StatStrip`(3) ｜ `CapabilityGrid`(2→**4**) ｜ `ProductFamilyGrid`(2) ｜ `FirstMessageChecklist`(2) ｜ `TraceabilityBlock`(2) ｜ `CategoryNav`(2) ｜ `Breadcrumb` · `TagRow` · `Pagination` · `WheelModelGrid` |
| **单页专用** | `PartGroupCards`｜`BoundaryTable`｜`ParamTable`｜`MechanismSteps`｜`FitmentHero`｜`QuickPaths`｜`DistributionBlock`｜`QuoteContextBar` 等 |

**⚠️ 三条新增纪律**（本轮 5 份规格带出来的）：
1. **同一形态的组件，第二个页面要用就必须提取** —— 本轮已有 3 例走了这条路：
   `PartGroupCards`（ev-components ③ 与 custom-aluminum ⑥ **同一文件**）、
   `CapabilityGrid`（ev/custom/tires/safety 四页）、
   `SelfIdentifyBlock`（ev ④ 与 safety ③ 合并）
2. **不为 2 项内容开一张卡** —— 通用件（端盖/支架）并入相邻卡，不单列
3. **能力线 CTA 不复用 `<DealerCta>`** —— EV 三电线用 `<EngineeringEvalCta>`（工程评估口径，
   不是「获取报价」）

**→ 实现顺序建议**：先做 **`DataNotice`**（6 处用，且是纪律要求），
再做 `WheelCard`（4 处，且是产品线骨架），然后 `RouteBlock` / `ProcessSteps` / `StatStrip`。

**⚠️ 复用优先律**：**同一形态的东西只做一个组件。**
现在 `DealerCta` 被 21 处复用是正确示范；
**新组件如果第二个页面要用，就必须提取，不能两页各写一份。**

---

## 3. ★ 页面骨架总览（一眼看全站节奏）

| 页面 | 段数 | 深色段 | 结尾 |
|---|---|---|---|
| `/` | 8 | Hero | `DealerCta` |
| `/products` | 3 | — | `DealerCta` |
| `/products/wheels` | 6 | — | 尾部说明 + `DealerCta` |
| `/products/wheels/[model]` | 9 | — | 数据说明 + `DealerCta` |
| 三条能力线 | 8 | Hero | `DealerCta` |
| `/capabilities` | 6 | — | `DealerCta` |
| `/custom-development` | 5 | — | `DealerCta` |
| `/dealers` | **12** | — | 收束 CTA（≤80 字） |
| `/dealers/private-label` | **14** | — | 收束 CTA（≤80 字） |
| `/about` | 9 | **Hero** | 收束 CTA（≤80 字） |
| `/contact` | 5 | — | 联系块 |
| `/request-a-quote` | 4 | — | 承接区 + 表单（`/contact` 专注态） |
| `/fitment/*` | 8 | — | FAQ + CTA（**最矮 hero**） |
| 三条能力线 | 8 | **Hero** | 各不相同（见各规格） |
| `/insights` | 4 | — | `DealerCta` |

**⚠️ 两条节奏律**（来自 `ARCHITECTURE/page-architecture/content-design-and-new-pages.md` §1.1）：
1. **结尾 CTA 段 ≤80 字** —— 长页尤其（dealers 2,121 字 / private-label 2,479 字）
2. **首页不是内容页，是路由页**（竞品首页 118 字 / 4 段）—— **别在首页堆字**

---

## 4. 三条全局纪律（每份规格都要兑现）

| # | 纪律 | 出处 | 在规格里怎么体现 |
|---|---|---|---|
| 1 | **每页必须有询盘入口** | README §3.2 | 骨架表最后一段必须有 `DealerCta` 或等价 CTA |
| 2 | **缺数据显式暴露，不得静默排除** | catalog 铁律一 | 筛选器规格必须写「未标注 N 个」的处理 |
| 3 | **无图不上架** | DEC-013 | 产品网格规格必须写「无图不生成卡片」 |

---

## 5. 本模块与其它文档的边界

| 文档 | 回答 | 本模块如何对待 |
|---|---|---|
| `../ARCHITECTURE/page-architecture/*` | **为什么**这样设计（含竞品参考） | **链接过去，不复制** |
| `../ARCHITECTURE/tech-architecture/*` | 数据怎么落到类型层 | 本模块**引用类型名**，不复述技术方案 |
| **`PAGE-SPECS/*`（本模块）** | **搭什么组件、吃什么数据、什么栅格** | — |
| `../DECISIONS.md` | 已拍板的决策 | 规格里标 `DEC-0xx` 引用 |
| `../STATUS.md` | 项目进度 | 不重复 |

**⚠️ 三类东西必须分清（这是本模块存在的理由）**：

| 性质 | 落在哪 |
|---|---|
| 🔍 **参考**（竞品怎么做） | `ARCHITECTURE/page-architecture/2nforged-page-inventory.md` |
| 🎯 **设计**（这页说明什么） | `ARCHITECTURE/page-architecture/*-page.md` |
| 📐 **规划**（站点怎么组织） | `ARCHITECTURE/page-architecture/README.md` |
| **🔨 施工（这页怎么搭）** | **`PAGE-SPECS/`（本模块）** |
