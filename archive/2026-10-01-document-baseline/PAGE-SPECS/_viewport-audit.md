# 视口合规审查报告

> **判据来源**：`DESIGN.md` §0.5「视口驱动设计」—— 特别是 §0.5.1（一个视口 = 一个核心问题）
> 与 §0.5.2（合并或删除律）。原文：
> > 每个主要视口最多：**1 个 Primary Message ｜ 1 个 Primary Visual ｜ 1 个 Primary Action ｜ 0–2 个 Secondary Actions**
> > 🔴 禁止同一视口内多个不同业务目标互相竞争
> > ★ 合并或删除律：如果两个连续 Section 没有回答两个不同的问题，则应**合并或删除**。
>
> **审查日期**：2026-10-01
> **审查范围**：`src/app/` 下 26 个路由 —— 重点覆盖 `PAGE-SPECS/` 已出规格的 21 个页面
> **审查方法**：以「一屏所见」为单位（而非代码里的 `<section>`）切分视口；逐视口比对
> `PAGE-SPECS/*` 的 §1 骨架 + §2 逐块规格，对照 `src/app/**/page.tsx` 与
> `src/components/sections/*` 的实际实现。每条判定给出可指认的规格章节或代码行。
> **只读审查** —— 本报告是唯一产出，未改动任何其他文件。

---

## ⚠️ 前提更正（2026-10-01 补记，读正文前必看）

**本报告的首页章节（§1）是在一个已被证伪的前提下完成的。**

- 起草时，`DESIGN.md` §0.5.4 曾被错误地写为「**首页六屏（本站的认知路径实证）**」，
  把那六屏（Who / What / Which wheel / Customize / Trust / Inquiry）当成了**本站既定事实**。
- **实际不是**：那六屏是**用户在对话中给出的格式示例**，用户本人已明确
  「**不是我们现在需要修改的，我只是提供一个例子**」。
- 该段已从 `DESIGN.md` 删除，改为「格式示例，不是本站既定顺序；
  首页切成几个视口必须由**我们自己的信息架构与买家决策次序**推导」。

### 受影响的结论

| 章节 | 影响 | 处置 |
|---|---|---|
| **§1 首页** 的视口切分（切成 5 个视口的具体方式） | ⚠️ **可能受污染** | **待重议** —— 需在首页视口定案后重写 |
| §1 首页的**违规发现本身**（Hero 里 7 个出口、两入口争同一次点击） | ✅ **不受影响** | 该发现**只依赖 §0.5.1「一屏一个主行动」**，与六屏无关，结论成立 |
| 其余全部页面 | ✅ 不受影响 | 它们从未使用那六屏 |

### 本报告仍然有效的原因

判据（§0.5.1 一视口一核心问题 + §0.5.2 合并或删除律）**自始至终没变**，
且是唯一判据。受影响的是**首页视口的划分结果**，不是**划分方法**，
也不是其他 17 个页面的分析。

**⚠️ 同时新增一条判据（当时尚未存在）：`DESIGN.md` §0.5.4
「询盘组件必须完整落在一个视口内」—— 涉及 `/contact`、`/request-a-quote`
的结论需按此条复核。**

---

## 0. 总览

| # | 页面 | 视口数 | ✅ 合规 | ⚠️ 拥挤 | 🔴 违规 | 🗑️ 建议合并/删除 | 总评 |
|---|---|---|---|---|---|---|---|
| 1 | `/`（首页） | 4 | 1 | 1 | 1 | 2 | **需重构** |
| 2 | `/products` | 7 | 3 | 1 | 1 | 4 | **需重构** |
| 3 | `/products/wheels` | 4 | 2 | 1 | 0 | 1 | **需小修**（本体是 16-SKU 示意，待目录接入） |
| 4 | `/products/wheels/[sku]` | 5 | 4 | 1 | 0 | 0 | **需小修** |
| 5 | `/capabilities` | 5 | 3 | 1 | 0 | 1 | **需小修** |
| 6 | `/custom-development` | 4 | 4 | 0 | 0 | 0 | **合规** |
| 7 | `/request-a-quote` | 3 | 3 | 0 | 0 | 0 | **合规** |
| 8 | `/contact` | 4 | 2 | 1 | 0 | 1 | **需小修** |
| 9 | `/thank-you` | 3 | 2 | 0 | 0 | 1 | **需小修** |
| 10 | `/dealers` | 8 | 4 | 1 | 1 | 2 | **需重构** |
| 11 | `/dealers/private-label` | 7 | 5 | 1 | 0 | 1 | **需小修** |
| 12 | `/about` | 7 | 4 | 1 | 0 | 2 | **需小修** |
| 13 | `/products/ev-components` | 7 | 5 | 1 | 0 | 1 | **需小修** |
| 14 | `/products/custom-aluminum` | 8 | 6 | 0 | 0 | 2 | **需小修** |
| 15 | `/products/safety-tires` | 7 | 5 | 1 | 0 | 1 | **需小修** |
| 16 | `/resources` | 4 | 2 | 0 | 0 | 2 | **需小修** |
| 17 | `/gallery` | 4 | 2 | 0 | 0 | 2 | **需小修** |
| 18 | `/fitment` | 3 | 2 | 0 | 0 | 1 | **需小修** |

**合计**：83 个视口；✅ 59 ｜ ⚠️ 10 ｜ 🔴 3 ｜ 🗑️ 24 条合并/删除建议。

**两条全局性发现**（不针对单页）：

1. **只有 3 处 🔴 违规，且全部集中在首页与 `/products`** ——
   这两页目前跑的是**竞品底本**（`ProductShowcase` 的「Our range」三分类、
   `products.ts` 的 monoblock/two-piece/off-road 三 family），
   与「四条产品线平行」的定位冲突。**其余页面整体是健康的。**
2. **24 条合并/删除建议里，有 16 条是同一形态**：
   「Keep exploring / 保留探索」式的路由卡段，与 `DealerCta` 收口段**回答同一个问题**
   （「接下来去哪」）。这是全站唯一的系统性冗余 —— 见附录 A。

---

## 1. 首页 `/`（最详细 —— 这是样板）

**代码事实**：`src/app/page.tsx` 只有 5 个组件 ——
`<HomeHero>` → `<TrustStrip>` → `<ProductShowcase>` → `<GalleryBand>` → `<DealerCta>`。
**规格要求八段**（`index-home.md` §1），实测只有 5 段，且其中 2 段是规格明令下线的组件。

### A. 视口划分表

| 视口 | 核心问题（一句话） | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01**<br>首屏 `min-h-svh` | **我们是谁？** | `<HomeHero>`<br>（左栏品牌定位 + 右栏四产品卡） | H1「Forged Wheels & Automotive Components」+ 描述句 | 轮播车照（`HeroBackground`）**＋ 四张产品卡图** | `Explore products` → `/products` | `Request a quote` → `/request-a-quote`<br>**＋ 四张卡各自是一个链接（4 个出口）** | 🔴 **违规** |
| **02** | 我们卖的是什么？ | `<ProductShowcase>` | 「Your forged wheel programme」+ 三个**轮毂**分类卡 | 三张 `ProductCard` | `View all wheel styles` → `/products` | `Vehicle gallery` → `/gallery` | 🔴 **违规**（定位错误 + 与 `/products` 重复） |
| **03** | 制造可信吗？ | `<TrustStrip>` | 6 格能力带（`content/capabilities`） | 纯文字格 | 无 | 无 | ⚠️ **拥挤**（6 个并列声明，且口径冲突） |
| **04** | 有案例吗？ | `<GalleryBand>` | 「Gallery」巨型字 + 一句说明 | 巨型斜体字标 | `Gallery` → `/gallery`（整个 H2 是链接） | 无 | 🗑️ **建议删除** |
| **05** | 怎么开始？ | `<DealerCta>` | 「Open a forged wheel line with us」 | `forge-soft` 橙底 | `Request a quote` → `/contact` | email 文字链 | ✅ 合规 |

**实测页高**：01 满屏 + 02 约 1.2 屏 + 03 约 1.1 屏 + 04 约 0.8 屏 + 05 约 0.5 屏 ≈ **4.6 屏**。
规格目标是「全页 ≤ 6 屏」（`index-home.md` §5），**页高本身没超标，
问题不是长度，是每屏塞了几件事。**

### B. 违规项逐条说明

---

#### 🔴 V-1｜首屏（视口 01）：品牌定位 与 四条产品线入口 在同一屏竞争

**哪几个业务目标在竞争（指名道姓）**：

| 争夺者 | 想要用户做什么 | 证据（代码/规格） |
|---|---|---|
| A. **品牌定位** | 理解「这是一家四条产品线的铝制部件制造商」 | `home-hero.tsx:42-76` 左栏：eyebrow + 3 行 H1 + supporting + description ≤ 2 句 |
| B. **四个产品入口** | 立刻挑一条线点进去 | `home-hero.tsx:79-90` 右栏 `<nav aria-label="Product lines">` × 4 张 `HeroProductCard` |
| C. **主 CTA「Explore products」** | 走 `/products` 总入口 | `heroCopy.primaryCta` → `/products`（`homepage-hero.tsx:33`） |
| D. **次 CTA「Request a quote」** | 直接进询盘 | `heroCopy.secondaryCta` → `/request-a-quote`（`homepage-hero.tsx:34`） |

**这一屏一共有 7 个可点出口**：4 张产品卡 + 2 个 CTA + 1 个 logo 之外的导航。
按 §0.5.1 上限（1 Primary Action + ≤2 Secondary），**超出 4 个**。

**用户在这一屏到底该先理解什么**：
按 §0.5.4 的六屏路径，**首页 01 的唯一职责是回答「我们是谁」**（*Who are we?*），
而「我们做什么」是 **02 的职责**（*What do we make?*）。
**现在 01 和 02 被压成了一屏。**

**为什么这不是「左右分栏共同回答一个问题」**（§0.5.3 允许的形态）：
§0.5.3 允许「左文案段 + 右卡片段共同回答同一个问题」——
但这里左右**回答的是两个问题**：左栏说「我们是谁」（公司级定位），
右栏让用户在**还不知道公司是谁的时候**就选产品线。
更关键的是：**右栏的四张卡与 `primaryCta`（→ `/products`）指向同一批目的地** ——
`Forged Wheels` 卡 → `/products/wheels`，而主 CTA → `/products`。
**两个入口在同一屏里争夺同一次点击**，这是教科书式的目标竞争。

**规格怎么说**：
`index-home.md` §2① 末行原文：
> **🔴 禁止**：Hero 里出现型号、数字、证书堆砌 —— 那是 ⑤ 段的事。
> **Hero 只回答「这是什么公司」一句话。**

而 §2② 是**独立的一个段（② 四条产品线入口）**，位于 Hero **之后**，
且带「★ 强制复用条款」要求与 `/products` 共用 `<ProductFamilyGrid>`。
**→ 规格本身就要求把这两件事拆成两个视口。现状是把 ①② 压在了一屏。**

**建议怎么处理**（可执行）：

1. **拆成两个视口**：
   - **视口 01 = 纯品牌定位**。保留 `home-hero.tsx` 的**左栏全部内容**，
     **删除右栏 `<nav aria-label="Product lines">` 整块**（`home-hero.tsx:79-90`）。
     首屏只剩 1 Primary Message（H1）+ 1 Primary Visual（车照）+ 1 Primary Action
     （`Explore products`）+ 1 Secondary（`Request a quote`）→ ✅ 合规。
   - **视口 02 = 四条产品线入口**。新建 `src/components/product-family-grid.tsx`
     （`index-home.md` §3.2 已规定路径与 props，`density="compact"`），
     复用 `heroProducts` 的四条数据（`homepage-hero.tsx:52-84`）但与 `/products` **共用同一组件**。
     **这就是把右栏从 Hero 里「抬出来」变成独立一屏** —— 视觉资产零浪费，
     `HeroProductCard` 的斜切角设计直接成为 02 段的卡片。
2. **同时改主 CTA 的目标**：`primaryCta` 现在指向 `/products`，
   若 02 段就是产品入口，则 01 的主 CTA 应改为指向**同屏内锚点 `#products`**
   （或直接删掉主 CTA，让「继续滚动」承担动作），
   避免「主 CTA 与 02 段说同一件事」。**推荐后者**：01 留一个 `Request a quote` 作为唯一动作。
3. **不要保留 `HomeHero` 的 `min-h-svh`**：拆完后 01 仍是 `min-h-svh`（满屏），
   02 用常规段高（`py-20 lg:py-28`）。`home-hero.tsx:22` 的 `min-h-svh` 不用改。

**改动量**：**小**。删一个 `<nav>` 块（约 12 行）+ 新建一个组件 + 在 `page.tsx` 插入一段。

---

#### 🔴 V-2｜视口 02（`ProductShowcase`）：定位错误 + 与 `/products` 完全重复

**哪几个业务目标在竞争**：

| 争夺者 | 证据 |
|---|---|
| A. 「我们做轮毂」的**旧定位** | `product-showcase.tsx:21` 标题写死 `Your forged wheel programme`；
  `:25-29` 正文 `Three construction types covering performance, wide-body and heavy-duty applications.` |
| B. 引流到 `/products` 与 `/gallery` | `:50-56` 两个按钮，`View all wheel styles` + `Vehicle gallery` |

**问题不是「两个目标竞争」，而是这一段的主信息（A）与全站定位冲突**：

- `index-home.md` §0 原文：
  > **🔴 判据**：竞品 `/` **118 字 / 4 段** —— 首页唯一的任务是把人**分发**到该去的地方
- `index-home.md` §3.1 处置表把 `<ProductShowcase>` 判为 **❌ 下线或改造**，
  理由原文：**「它是「Our range」轮毂三分类展示，属竞品口径」**。
- `src/content/products.ts:17-71` 的 `productFamilies` **至今仍是三条**：
  `monoblock` / `two-piece` / `off-road` —— 全是轮毂，`name` 分别是
  `Monoblock` / `Two-Piece Forged` / `Off-Road & Truck`（`products.ts:19,41,60`）。
- 而 `heroProducts`（`homepage-hero.tsx:52-84`）已经是**四条产品线**：
  `Forged Wheels` / `Custom Aluminum` / `EV Components` / `Self-Healing Tires`。

**→ 同一个首页上，视口 01 说「我们做四条线」，视口 02 说「我们做三种轮毂」。这是自相矛盾。**

**用户在这一屏到底该先理解什么**：用户刚在 01 被告知「四条线的铝制部件制造商」，
滚动到 02 却看到三个轮毂分类 —— **他必须重新判断「这家到底是做什么的」**。
这是切换成本的来源。

**建议怎么处理**：

**把 `<ProductShowcase>` 改造为 V-1 里新视口 02 的容器壳**（这是规格本来的建议）。
`index-home.md` §3.1 原文：
> **→ 建议直接把它改造为 `<ProductFamilyGrid>` 的壳（容器 + eyebrow + H2 + 网格），
> 卡片的渲染交给新组件。** 这样不浪费已写的容器/标题层级。

执行步骤：
1. 在 `product-showcase.tsx` 里把 `productFamilies`（3 条轮毂）
   换成**四条线的数据源**（先临时用 `heroProducts`，待 `products.ts` 重写后切回 `ProductFamilyGrid`）。
2. H2 从 `Your forged wheel programme` 改为**四条线的公司级口径**。
3. 删掉 `Vehicle gallery` 按钮（`product-showcase.tsx:53-55`）——
   它属于视口 04（Gallery），见 V-4。

**改动量**：**中**（数据源替换 + 文案重写），但**不新建文件**。

---

#### ⚠️ V-3｜视口 03（`TrustStrip`）：6 个并列声明在一个视口内，且口径与定位冲突

**问题 1：6 个声明争夺注意力。**
`trust-strip.tsx:14` 一次性渲染 `capabilities.map` ——
`lg:grid-cols-3` × 2 行 = **一屏内 6 个并列主张**（`content/capabilities.ts` 6 条）。
按 §0.5.1，一个视口最多 1 个 Primary Message。
**6 个「同等重量」的格子 = 没有主信息**，读者记住的是零。

**问题 2（更严重）：6 条口径全是轮毂语境，与四条线定位冲突。**
`content/capabilities.ts` 实测标题：
`Tailored Fitment`(第 13 行) / `Deep Concave Profiles`(18) / `Factory Direct`(23) /
`Custom Finishes`(28) / `Branded Accessories`(33) / `Reliable Lead Time`(38)。
**其中 `Deep Concave Profiles` 是纯轮毂术语。**
`index-home.md` §2⑤ 已把这条列为**口径冲突**，原文：
> 现有 `capabilities.ts` 的 6 条**全部是轮毂语境**……与「四条线的铝制部件制造商」定位冲突。
> 且文件头已自注 **PLACEHOLDER: every claim here is a commercial commitment**。

**用户在这一屏该先理解什么**：按 §0.5.4，首页 05 的核心问题是
「**制造可信吗？**」—— 这一屏应该回答**一个**可信度问题（例如「我们自己造，不外包」），
而不是铺开六条不同维度的话术。

**建议怎么处理**：
1. **短期（不改组件）**：`content/capabilities.ts` 6 条**重写为「制造 + 质量」通用口径**
   （工艺能力 / 材料 / 检测 / 一致性），与 `/capabilities` 共用同一份数据
   （`index-home.md` §2⑤ 处置段已如此规定）。这一步消除定位冲突。
2. **中期（改结构，可选）**：6 格降到 **3 格**（`lg:grid-cols-3` × 1 行），
   让这一屏有「一条主线 + 两个支撑」的层级。
   3 格已足够回答「制造可信吗」，6 格是四个问题塞一屏。
3. **注意**：`TrustStrip` **不是**删除对象 —— 它回答的问题
   （「制造可信吗」）在前面没有任何段落回答过，符合 §0.5.2。

**改动量**：**小**（内容重写）/**中**（若降到 3 格）。

---

#### 🗑️ V-4｜视口 04（`GalleryBand`）：删掉读者不会缺少任何答案

**位置**：`page.tsx:20` `<GalleryBand />`（组件 `src/components/sections/gallery-band.tsx`）。

**它回答的问题**：「有没有真实装车案例？」

**为什么答案是重复的** —— 三步：

1. **`GalleryBand` 的全部内容就是一个链接。**
   `gallery-band.tsx:36-47`：H2 内部是一个 `<Link href="/gallery">`，
   文字是巨型「Gallery」；`:49-51` 一句说明
   `See how our wheels sit on real vehicles — fitment references across
   performance, luxury and off-road platforms.`
   **除了指向 `/gallery`，这一段没有提供任何新事实。**

2. **前面已有一段承担「看案例」的入口。**
   `ProductShowcase` 的次 CTA 就是 `Vehicle gallery` → `/gallery`
   （`product-showcase.tsx:53-55`）。
   **同一个目的地，在 02 段已经给过一个入口。**

3. **规格已判它下线。** `index-home.md` §3.1 处置表原文：
   > **`<GalleryBand>`** ❌ **下线** —— 首页无「案例段」；`/gallery` 素材未就绪

   且 §1 的八段骨架里**没有案例段**。

**建议怎么处理**：**删除 `page.tsx:20` 的 `<GalleryBand />`，并把
`product-showcase.tsx:53-55` 的 `Vehicle gallery` 按钮一并删除**
（若采用 V-2 的改造，它已经保留了 `View all wheel styles`）。
`/gallery` 的入口仍可通过主导航抵达 —— **不需要在首页占用一个满屏视口。**

**改动量**：**极小**（删 1 行 + 删 3 行）。

**⚠️ 注意**：若产品坚持要保留案例段，则**它必须排在 04 位（制造证据之后）**，
且**不能是纯链接大字** —— 必须至少放 2–3 张真实装车图（那是它的 Primary Visual）。
按现状（无图、纯链接），它不满足任何视口的成立条件。

---

### C. 首页「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的（指出前面哪一段已答过） |
|---|---|---|
| `page.tsx:20` `<GalleryBand>` | 「有案例吗？去哪看？」 | **02 段 `ProductShowcase` 的次 CTA 已经给了 `/gallery` 入口**（`product-showcase.tsx:53-55` `Vehicle gallery`）。`GalleryBand` 除链接外零信息量。**规格已判下线**（`index-home.md` §3.1）。 |
| `page.tsx:18` `<ProductShowcase>` 的**卡片主体** | 「我们做哪几种？」 | **与首屏右栏四张产品卡（`home-hero.tsx:79-90`）回答同一问题** —— 一个是产品的「Our range」三卡，一个是「四产品入口」四卡。**拆完 V-1 后，这一段必须变成 02 的容器壳，否则两屏都在答「我们做什么」。** |

**首页还缺什么（不是冗余，是缺口）**：
`index-home.md` §1 八段骨架里，**③ 轮毂精选 / ④ 三条线代表能力 / ⑥ 定制开发流程 / ⑦ 技术与见解**
四段**完全不存在**。其中 **⑦ 段规格已决定隐藏**（§6 阻塞 #4：文章未写稿 → 隐藏本段），
**不用补**。**③④⑥ 三段缺失是首页目前最大的结构缺口** —— 但这是「缺」不是「违规」，
不在本报告判定范围内，仅记录。

### D. 首页一句总评

**需重构**。首屏是唯一 🔴 硬违规（7 个出口 / 2 个竞争问题），
02 段定位与首屏自相矛盾，04 段应删。修法明确且改动量不大（见 V-1~V-4）。

---

## 2. `/products`（产品中心）

**代码事实**：6 段 —— Hero(A) → FamilyGrid(B) → SKU callout(B2) → Guidance(C) →
Fitment support(D) → Related resources(E) → FAQ(F) → `DealerCta`。
**规格要求三段**（`products/index.md` §1），实测 7 段。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这里是什么？ | A Hero | `catalogueIntro`：eyebrow「Our range」+ H1「Custom Forged Wheels」+ lede + supporting | 深色径向橙光 + 斜纹 | 无 CTA（`products/page.tsx:33-64` 无 children） | 无 | ⚠️ **拥挤**（H1 定位错误见下） |
| **02** | 有哪几条线？ | B FamilyGrid | `Three families` + 3 张 `ProductCard` | 三张卡 | 卡片自身链接 | 无 | 🔴 **违规**（不是四条线） |
| **03** | 有多少个型号？ | B2 SKU callout | `catalogueSkuCallout` + `btn-pill-solid` → SKU 索引 | 文字 + 1 按钮 | `catalogueSkuCallout.cta` | 无 | ✅ 合规 |
| **04** | 怎么下单？ | C Guidance | `How to specify your order` + 4 步 `catalogueRoutes` | 4 格步条（每格 1 链接） | 格内 4 个链接 | 无 | ⚠️ **拥挤**（见 B-2） |
| **05** | 适配谁来管？ | D Fitment support | `Fitment engineering comes with the order` + 4 条 checklist | 左侧文字 + 右侧勾选卡 | `Request a quote` | `Fitment resources` | ✅ 合规 |
| **06** | 看点什么别的？ | E Related resources | `Related resources` + 3 张资源卡 | 3 张卡 | 卡内 3 链接 | 无 | 🗑️ **建议删除** |
| **07** | 常见问题？ | F FAQ | `Ordering questions, answered` + 6 条 FAQ | 左标题 + 右列表 | 无 CTA | 无 | ✅ 合规 |
| **08** | 怎么询盘？ | DealerCta | `Open a forged wheel line with us` | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### 🔴 B-1｜视口 02：三条轮毂分类 ≠ 四条产品线入口（定位错误）

**哪几个业务目标在竞争**：这一段只有一个目标（让人选一条线），
**但它给错了选项** —— 不是「多目标竞争」，而是**主信息根本是错的**。

**证据链**：
- `products/page.tsx:72` 标题写死 `<p className="eyebrow">Three families</p>`。
- `products/page.tsx:86` 渲染 `productFamilies.map` —— 而
  `src/content/products.ts:17-71` 实测是 `monoblock` / `two-piece` / `off-road`
  **三条轮毂分类**，`hasRender: false`，`image` 指向 `/images/products/*.jpg`
  （该目录按 `products/index.md` §4.3 原文「**该目录不存在**」）。
- 而**首页首屏**已经用了四条线（`homepage-hero.tsx:52-84`）。
- `products/index.md` §0 原文：
  > **这是四条产品线的平行入口页，不是「轮毂目录」。**
  > **🔴 全页只有一条纪律：轮毂的视觉权重不得高于其他三条。**
- `products/index.md` §4.2 原文：
  > **⚠️ 重建而非改文案** —— 现有 `products.ts` 的 3 个 family 是竞品切法，
  > **必须整个替换**。

**用户在这一屏该先理解什么**：「这家能做四种东西」——
而现状告诉他「这家做三种轮毂」。**EV 三电、铝制品、安全轮胎三条线在此页完全不可见。**

**建议怎么处理**：
1. `src/content/products.ts` 的 `productFamilies` **重写为四条线**
   （`wheels` / `ev-components` / `custom-aluminum` / `safety-tires`，
   `products/index.md` §4.2 重写清单 ①–④ 已列）。
2. 栅格从 `lg:grid-cols-3`（`products/page.tsx:87` 末）改 **4 列**
   （`products/index.md` §2① 断点表：≥1024 → 4 列）。
3. 卡片等高用 `variant="uniform"`（`products/index.md` §2① 卡片结构段）。
4. eyebrow 从 `Three families` 改为四条线的口径。

**⚠️ 关联风险**：`products.ts` 重写会波及 `/products/[slug]` 与 `/contact`
（`products/index.md` §6 阻塞 #2），需同步排查。

**改动量**：**大**（数据重写 + 布局 + 波及页排查）。

---

#### ⚠️ B-2｜视口 04（Guidance）：4 步流程的每一步都是一个出口，等于 4 个并列行动

**哪几个业务目标在竞争**：`catalogueRoutes`（`products.ts:91-119`）四步
`Tell us the vehicle` / `Choose a construction` / `Set the fitment` / `Pick a finish`，
每步带一个独立链接（`products/page.tsx:157-165`）：

| 步 | 链接目标 | 争议 |
|---|---|---|
| 01 | `/contact`（`products.ts:96`） | **询盘出口** |
| 02 | `/products`（`products.ts:102`） | **回到本页**（自链接） |
| 03 | `/resources`（`products.ts:108`） | 资源出口 |
| 04 | `/gallery/finishes`（`products.ts:115`） | 图库出口 |

**→ 一屏内有 4 个指向 4 个不同目的地的主级链接**（`font-display text-[0.72rem]
text-forge` 的强调样式，视觉上是行动级）。按 §0.5.1，超出「1 Primary + ≤2 Secondary」。

**更具体的问题**：第 02 步的链接指向 `/products` —— **就是用户当前所在的页面**。
**一个「去你正在看的页面」的链接是死路**，它不回答任何问题。

**用户在这一屏该先理解什么**：这一段的真实职责是**教流程**（「怎么把一台车变成一套轮毂」），
流程段的行动应该是**「开始第 1 步」这一个 CTA**，而不是每一步都可以跳走。

**建议怎么处理**：
1. **保留四步内容（它回答了一个新问题，不该删）**，
   但把 4 个 `Link` 降级：**只保留第 01 步的链接**（→ `/contact`）作为这一屏唯一的 Primary Action，
   其余三步的链接**改为纯文本**（去掉 `<Link>` 与 `text-forge` 强调）。
2. **第 02 步的自链接 `/products` 必须删** —— 它指向本页。
3. 或者更彻底：**把四步的链接全部删除**，在段末放**一个** `btn-pill-solid`「提交需求」，
   指向 `/request-a-quote`。这样这一屏变成「1 信息 + 1 行动」的标准形态。

**改动量**：**小**（改 `products.ts` 的 4 个 `href` 用法 / 改 JSX 里的渲染逻辑）。

---

#### 🗑️ B-3｜视口 06（Related resources）：答案是重复的

**位置**：`products/page.tsx:221-263`（`aria-labelledby="resources-title"`），
渲染 `catalogueResourceLinks` 三张卡。

**它回答的问题**：「还想看点别的，去哪？」

**为什么答案是重复的** ——
**同一屏序列里，第 07 段是 FAQ（`Ordering questions, answered`），
第 08 段是 `DealerCta`（`Open a forged wheel line with us` → `/request-a-quote`）。**
「接下来去哪」这一问题，**`DealerCta` 已经给出了唯一的、更强的答案**。
三张资源卡（`Keep exploring` eyebrow）提供的是**弱化的平行出口** ——
它们在用户已经决定「要不要询盘」的临界点上，**提供了三个分流理由**。

`products/index.md` §1 骨架只有三段（四条线总览 / 各线简介 / 询盘入口），
**没有资源段，也没有 FAQ 段**；§1 末行原文：
> **⚠️ 三段就是三段。** ……**重建时不要保留 guidance / fitment / FAQ 段。**

**⚠️ 诚实说明**：规格建议连 **FAQ 段（07）也删**。
但本报告**不建议删 FAQ** —— 理由：FAQ 回答的问题
（「MOQ / 交期 / 贴牌能不能做」）**在前六段里没有任何一段回答过**，
符合 §0.5.2 的成立条件。**规格删它是因为「竞品有」，但判据是「有没有新答案」——
FAQ 有新答案，所以留。** 这是本报告与规格的一处分歧，明确标注。

**建议怎么处理**：删除 `products/page.tsx:221-263` 的整个 Related resources 段
（4 个文件内改动：删 JSX + 删 `catalogueResourceLinks` import）。

**改动量**：**极小**。

---

#### 🗑️ B-4｜视口 01（Hero）的 `supporting` 句：答案是重复的

**位置**：`products/page.tsx:58-60` 渲染 `catalogueIntro.supporting`。

**原文**（`products.ts:81-83`）：
> `Use this page to pick the construction that matches the vehicles you sell.
> Each family page explains how it is made, who it suits, and what we need from you to quote.`

**为什么答案是重复的**：这句话说的是**「这一页怎么用」** ——
而用户就站在这一页上，**页面本身的结构已经回答了「怎么用」**。
它是典型的「导航说明」（signposting），**不提供事实**。
而 `lede`（`products.ts:79-80`）已经把这段的实质信息
（三种构造 / 按你的适配数据造 / 不是现货）说完了。

**建议**：删除 `supporting` 这一行（1 行 JSX + 1 条数据字段）。
**注意**：`/products/wheels`（`wheels/page.tsx:47-49`）、`/dealers`、
`/resources`、`/about` 等页也都有同样的 `supporting` 模式 ——
**本报告只确认 `/products` 这一处是重复的**（因为 lede 已覆盖）；
其余页面未逐句比对，不在此处下结论。

**改动量**：**极小**。

### C. `/products`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `products/page.tsx:221-263` Related resources | 「还看点什么？」 | **第 08 段 `DealerCta` 已给出唯一的「下一步」答案**（→ `/request-a-quote`）。三张资源卡是弱的平行出口，在转化临界点上分流。 |
| `products/page.tsx:100-120` SKU callout（**视情况**） | 「有多少个型号？」 | 若视口 02 的四条线卡**已经**在轮毂卡上标注型号规模（`products/index.md` §2① 禁止项第 2 条明令：不得「在轮毂卡上放 1018 型号而其他三卡只有一句话」），则这一段是**把该信息再说一遍**。**当前四条线卡未标注型号 → 本段暂不构成重复**，保留。**这是一个条件性判定，标注在此以便将来复核。** |
| `products/page.tsx:58-60` `supporting` 句 | 「这一页怎么用？」 | **页面结构本身已回答**；`lede` 已说清实质信息。是 signposting，不是事实。 |

### D. `/products` 一句总评

**需重构**。核心违规在视口 02（三条轮毂 ≠ 四条线），
修法是数据重写而非改文案，会波及 `/products/[slug]` 与 `/contact`。
其余是 2 条轻量删除 + 1 条链接降级。

---

## 3. `/products/wheels`（轮毂目录）

**代码事实**：`wheels/page.tsx` 三段 —— A Hero → B 按 family 分组的 SKU 网格 →
C 计数条 → `DealerCta`。**当前渲染的是 `wheelSkus`（16 个示意 SKU），不是 1018 型号目录。**
规格要求六段（`PAGE-SPECS/products/wheels.md` §1）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这一页是什么 / 数据可信吗？ | A Hero | `wheelIndexCopy` + 面包屑 + 数据说明 | 深色径向橙光 + 斜纹 | `Request a quote` → `/contact` | `Compare families` → `/products` | ⚠️ **拥挤**（见 B-1） |
| **02** | 有哪些「构造」？ | B 第一个 family 段 | `family.name` + `family.summary` + 该 family 的 SKU 卡 | 3 列 `WheelSketch` 卡 | 卡内链接 | `About {family.name}` 文字链 | ✅ 合规（同一问题的子集） |
| **03** | （同 02，其余 family） | B 其余 family 段 | 同上 | 同上 | 同上 | 同上 | ✅ 合规 |
| **04** | 一共有多少？ | C 计数条 | `{wheelSkus.length} SKUs across {productFamilies.length} constructions` | 纯文字 | 无 | 无 | 🗑️ **建议并入相邻段** |
| **05** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 01：Hero 里同时有「去看别的构造」与「去询盘」两个不同阶段的行动

**哪几个业务目标在竞争**：
- A. **「换一批看」**：`Compare families` → `/products`（`wheels/page.tsx:75`）
- B. **「我现在就要报价」**：`Request a quote` → `/contact`（`wheels/page.tsx:71`）

**这两个目标属于买家决策路径的相反两端** —— 一个说「我还想看」，
一个说「我不看了，报价吧」。同屏并列，用户必须先决定自己是哪一类。

**规格怎么说**：`products/wheels.md` §2① 末行原文：
> **⚠️ 不要在这块加 CTA** —— 用户还没筛选，此时推销是干扰。

**→ 规格更严格：连一个 CTA 都不想给**（因为索引页的 hero 只承担
「说明这是什么 + 数据说明」）。现状给了两个。

**用户在这一屏该先理解什么**：「这是一个 1018 型号的目录，规格以最终确认为准」
（`products/wheels.md` §2① 定位句 + 数据说明）。

**建议怎么处理**：
1. **删除 `Request a quote`**（`wheels/page.tsx:71-74`）—— 按规格，索引页的唯一 CTA
   在**第 ⑥ 段尾部说明**（`products/wheels.md` §2⑥ 的 `<DataNotice>` + `<DealerCta>`），
   不在页头。
2. **`Compare families` 降为次级或删除**：它指向 `/products`，
   而面包屑（`wheels/page.tsx:45-48`）**已经给了 `/products` 的链接** ——
   **同一目的地，同屏两个入口**，删掉按钮，保留面包屑。
3. 结果：视口 01 变成「0 Primary Action + 0 Secondary」纯说明屏 → ✅ 合规。

**改动量**：**极小**（删 8 行）。

---

#### 🗑️ B-2｜视口 04（C 计数条）：答案是重复的

**位置**：`wheels/page.tsx:167-180`，类名 `py-10`，
内容是一行 `{wheelSkus.length} SKUs across {productFamilies.length} constructions`。

**它回答的问题**：「一共有多少型号？」

**为什么答案是重复的** ——
**规格把这条信息放在 ① Hero 里，而不是单开一段。**
`products/wheels.md` §2① 的「数据说明」行原文：
> **「本目录共 1018 个有图型号；规格以最终确认为准」**

即：**计数是 hero 的一句话，不是一个 `py-10` 的独立 section**。
`products/wheels.md` §1 的六段骨架里**没有「计数条」这一段**
（③ 是「结果计数与排序」，属于**筛选器之后的实时计数**，不是静态总数条）。

**更重要的问题**：这一段**在 `DealerCta` 之前单独占一屏高度（`py-10`）**，
内容只有一行字 —— 它是**为了「有个交代」而存在的段**，不是为了回答新问题。

**建议怎么处理**：删除 `wheels/page.tsx:167-180`，
把计数句 **并入 ① Hero 的「数据说明」行**（即并入 `wheelIndexCopy.supporting`）。

**改动量**：**极小**。

**⚠️ 诚实补充**：规格还要求本页有 **② 筛选工具条 / ④ 型号网格 / ⑤ 分页**（§2②④⑤），
**现状全部缺失** —— 因为 `wheelSkus` 只有 16 个示意 SKU，`assets/wheel-data/` 未接入
（`products/wheels.md` §6 阻塞 #1「整页」）。
**这是「缺」不是「违规」**，记录在此，不计入违规数。

### C. `/products/wheels`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `wheels/page.tsx:167-180` 计数条 | 「一共多少型号？」 | **规格把这条括在 ① Hero 的「数据说明」行里**（`products/wheels.md` §2①）。六段骨架里没有计数段。且它是纯数字，与 `DealerCta` 之间空占一屏。 |

### D. `/products/wheels` 一句总评

**需小修**（结构性缺陷在「目录数据未接入」，那是施工阻塞不是视口违规）。
视口层面只有 1 个拥挤（Hero 双 CTA）+ 1 个删除建议，改动都很小。

---

## 4. `/products/wheels/[sku]`（轮毂单品）

**代码事实**：A Hero（面包屑 + H1 + 单图 + 2 CTA）→ B Specification（dl）→
C Finish options → D Applications + fitment bridge → E Related SKUs → `DealerCta`。
规格要求九段（`PAGE-SPECS/products/wheels/[model].md` §1）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这是什么型号？ | A 面包屑 + H1 + 图 + 描述 | `sku` + `sku.name` + `sku.description` | 1:1 `WheelSketch` | `Request a quote` → `/contact` | `About {family.name}` → family 页 | ⚠️ **拥挤**（见 B-1） |
| **02** | 具体参数是多少？ | B Specification | `specs[]` + `specDisclosure` 免责 | `dl` 2 列参数格 | 无 | 无 | ✅ 合规 |
| **03** | 有哪些颜色？ | C Finish options | `sku.finishes` 色卡 + `finishNote` | 色卡圆点列 | 无 | 无 | ✅ 合规 |
| **04** | 能用在我车上吗？ | D Applications + fitment | 应用清单 + 「Fitment is safety-critical」免责 + 2 CTA | 左勾选列 + 右卡片 | `Send vehicle details` → `/contact` | `How to measure fitment` → 资源页 | ✅ 合规 |
| **05** | 还有别的型号吗？ | E Related SKUs | `related` 卡 | 3 列卡 | 卡内链接 | 无 | ✅ 合规 |
| **06** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 01：`Request a quote` 与 `About {family.name}` 是两个不同阶段的目标

**哪几个业务目标在竞争**：
- A. **转化**：`Request a quote` → `/contact`（`[sku]/page.tsx:132-135`）
- B. **认知回退**：`About {family.name}` → 家族页（`[sku]/page.tsx:137-145`）

**问题**：用户刚从一个家族/目录页**走到这里**（面包屑证明了这一点，
`[sku]/page.tsx:93` 有回 `/products` 的链，`:101` 有回 family 的链），
**在这一屏又给一个「回到我来的地方」的按钮**，与询盘并列。

**更具体地说**：本页的 Hero 已经有 **2 个导航回退入口**
（面包屑里的 `/products` + 次 CTA 的 family 页），
而面包屑本身已足够承担「回退」。规格 §2① 只规定面包屑，**没有规定次 CTA**。

**用户在这一屏该先理解什么**：「1081X 是什么」。行动应该是**一个**：
「这个型号合不合适 → 问我们」（`Request a quote`）。

**建议怎么处理**：
1. **删除次 CTA `About {family.name}`**（`[sku]/page.tsx:137-145`）——
   面包屑（`:93` 回 `/products`）已经承担层级导航。
2. 若认为「看家族整体」是必要动作，则**把家族链接移入面包屑**（成为面包屑的一级，
   规格 §2① 原文「四级：从系列页进来时插入「系列」一级」已预留此位置），
   **而不是在 CTA 区并列一个按钮**。

**改动量**：**小**。

### C. `/products/wheels/[sku]`「无新答案」段清单

**无**。九个段落里，现状存在的 5 个段落（01–05）各自回答不同问题
（是什么 / 参数 / 颜色 / 能不能用 / 还有别的），且规格要求的
**⑦ 询盘区（`<InquiryPicker>`，携带 model + variant 进询盘）与 ⑨ 数据说明**现状以
`DealerCta` + 免责句的形式**部分**满足。
**本页没有可删除的段。**

**⚠️ 但有一个「形式违规」需要记录**：
`[sku]/page.tsx:167-208` 的 B Specification 段用 `<dl>` 渲染 `specs` 参数格，
**而规格 §2⑤ 要求的是 `<VariantSpecTable>`（逐 variant 列 —— 全页核心）**。
现状是**家族通用值**而非**该 SKU 的 variant 数据** ——
这触碰了 `DEC-004`（「规格必须来自该型号的实际 variant 数据 —— 不得用系列通用值顶替」）。
**这不是视口违规，是数据纪律违规**，记录在此供施工时对照。

### D. `/products/wheels/[sku]` 一句总评

**需小修**。视口结构基本健康（5 个存在的段落各答一问），
只需删除 Hero 里与面包屑重复的次 CTA。

---

## 5. `/capabilities`（制造能力）

**代码事实**：`PageHero` → ② `ProcessExplorer` → ③ Material cards →
④ Quality and testing（**内含第二段 hard evidence**）→ ⑤ Capacity figures → `DealerCta`。
规格要求六段（`PAGE-SPECS/capabilities.md` §1），实测 6 段（其中 ④ 实际是两段）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这条产线是什么？ | ① `PageHero` | `processHero` 三件套 | 深色径向橙光 | `Walk the line` → `#explorer-title` | `Request a quote` → `/contact` | ✅ 合规（锚点跳转 + 询盘，两类不冲突） |
| **02** | 怎么造出来的？ | ② `ProcessExplorer` | 6 道工艺（tabs） | 交互式 tab + 媒体面板 | tab 切换 | 无 | ✅ 合规 |
| **03** | 用什么材料？ | ③ Material cards | `materials` 卡 + `materialsOpenItems` 待确认框 | 3 列材质卡 | 无 | 无 | ✅ 合规 |
| **04** | 怎么检验？ | ④ 上半（`processQuality`） | `processQuality.points` 勾选列 | 左标题 + 右勾选卡 | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **05** | 公差多少？ | ④ 下半（`processHardEvidence`） | 4 格硬指标 `dl` + `processQualityBoundary` | 4 列数字格 | 无 | 无 | ⚠️ **拥挤**（见 B-1，与 04 同属一段） |
| **06** | 产能多大？ | ⑤ Capacity figures | `capacityStats` + 占位声明 | `CapacityStats` 数字带 | 无 | 无 | 🗑️ **建议整段不上线** |
| **07** | 怎么询盘？ | `DealerCta` | 「Ask what the line can do for your order」 | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 04/05（④ 段内部）：一个 `<section>` 里装了两个不同问题 + 两组不同的视觉

**哪几个业务目标在竞争**：这一段（`capabilities/page.tsx:138-244`）内部有**两个 H2/H3**：
- **A. 检验流程**：`processQuality.heading`（`:157`，H2）
  + `processQuality.points` 勾选列（`:182-204`）→ 回答「**怎么检验**」
- **B. 公差数值**：`processHardEvidence.heading`（`:216`，H3）
  + `processHardEvidence.items` 4 格数字（`:226-243`）→ 回答「**公差多少**」

两个问题之间**有一个 `border-t border-border pt-16` 分隔**（`:210`）——
**代码作者自己已经意识到这是两段**，但用了 H3 而非 H2，并把它们留在同一个 `<section>` 里。

**视觉上**：这一段**一屏内出现两组不同形态的视觉**
（左标题 + 右勾选卡的「对分栏」→ 然后是「4 列数字格 + 长免责句」）。
滚动一屏要切换两次阅读模式。

**用户在这一屏该先理解什么**：
`DESIGN.md` §0.5.1 要求一个视口一个问题。
「怎么检验」（流程）与「公差多少」（数值）**是两个不同的问题**，
且规格把它们列为**两段**（`capabilities.md` §1：④ 质量与测试 / ⑤ 产能数据；
其中 hard evidence 属于 §2④「质量与测试」的「⚠️ 数字」行）。

**建议怎么处理**：
1. **把 `processHardEvidence` 拆成独立的 `<section>`**（视口 05），
   H3 提升为 H2，`aria-labelledby` 指向自己的 id。
2. 两段之间加 `border-b border-border`（与全站段的统一形态一致，见 `DESIGN.md` §2.1）。
3. **保持相邻**（它俩是「质量」主题的两个侧面，顺序不能颠倒 —— 先流程后数值合理）。

**改动量**：**小**（拆 section + 改标题层级）。

---

#### 🗑️ B-2｜视口 06（⑤ Capacity figures）：规格明令整段不上线

**位置**：`capabilities/page.tsx:214-246`。

**它回答的问题**：「产能多大？」

**为什么答案是重复的 / 为什么该删** —— **不是「别处已答」，而是「它答不了」**：

- 代码自己声明了这一点，`capabilities/page.tsx:236-243` 的橙色警示框原文：
  > ⏳ Pending confirmation — every figure in this band is a structural placeholder.
  > Real numbers must be supplied by production before launch; until then
  > the band publishes no invented total.
- `content/company-stats.ts` 的 `CompanyStat.isPlaceholder` 字段设计意图
  （`capabilities.md` §2⑤ 原文）：
  > **★ true = 结构性占位，丰怀上线前必须确认。渲染为可见「Placeholder」标记。**
- `capabilities.md` §2⑤ 三条纪律原文：
  > 2. **全部为 `true` 时，整段不上线**（宁可少一段，不留假数字）

**→ 按规格，当所有 `isPlaceholder` 为 true 时（现状正是如此），整段不上线。**

**注意这一条的性质**：它**符合** §0.5.2 的成立条件（产能问题前面没答过），
所以不是「无新答案」。**它被建议删除的理由是「证据纪律」，不是「视口律」。**
本报告如实标注这一区别。

**建议怎么处理**：
1. **上线前**：`capacityStats` 全部确认后保留；
   `isPlaceholder` 仍为 true → **整段不渲染**（`capabilities/page.tsx:214-246` 条件包裹）。
2. 若产品坚持要保留「能力规模」的信息位，则**降级为 ③ 材料段的一句 supporting**
   （不带数字，如「产能与厂区数据待上线后公布」），**不占一个满屏视口**。

**改动量**：**小**（加条件渲染）。

### C. `/capabilities`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `capabilities/page.tsx:230-243` 占位警示框 | 「这些数字能信吗？」 | **它是对自己那一段的元说明**（meta），不是新答案。若 ⑤ 段按规格不上线，这段警示也随之消失 —— **不需要单独处理。** |
| `capabilities/page.tsx:214-246` 整段 ⑤ | 「产能多大？」 | **严格说不是重复** —— 但按 `capabilities.md` §2⑤ 纪律 2，`isPlaceholder` 全 true 时**整段不上线**。**这是证据纪律而非视口律**（诚实标注）。 |

### D. `/capabilities` 一句总评

**需小修**。结构健康，7 个视口各答一问。
唯一的结构问题是 ④ 段内藏了两个问题（拆 section 即可），
⑤ 段按纪律暂时不渲染。

---

## 6. `/custom-development`（定制开发）

**代码事实**：`PageHero` → ② 合作模式 → ③ 开发流程（`FlowStepRow` + `CrossLink`）→
④ 起订量与周期（表）→ `DealerCta`。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 定制开发是什么？ | ① `PageHero` | `customDevHero` | 深色径向橙光 | `customDevHeroActions.primary`（`:61-64`） | `customDevHeroActions.secondary`（`:65+`） | ✅ 合规 |
| **02** | OEM / ODM / 贴牌怎么选？ | ② `#cooperation-models` | `cooperationModelsCopy` + 三模式卡 | 3 列卡 + 编号 | 无 | 无 | ✅ 合规 |
| **03** | 流程是怎样的？ | ③ `FlowStepRow` + `CrossLink` | 5 步商业口径 + 工程细节交叉链 | 横向步条 | `CrossLink` → 铝制品页 | 无 | ✅ 合规 |
| **04** | 起订量多少？ | ④ `#thresholds` 表 | `mooTerms` 表 + 待确认框 | 4 列表格 | 无 | 无 | ✅ 合规 |
| **05** | 怎么询盘？ | `DealerCta` | `customDevCta` | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

**无。**

**特别说明为什么 03 段是合规的**（它是全站「跨页分工」做得最好的一处）：
`custom-development/page.tsx:122-141` 的 `<FlowStepRow>` + `<CrossLink>` 
**两者回答的是同一个问题的两个层次**：
`FlowStepRow` 回答「大概分几步」（商业口径），
`CrossLink` 回答「想要工程细节去哪」（`→ /products/custom-aluminum#development-flow`）。
**它们是「信息 + 一个有明确去向的次级行动」，不是两个竞争目标** ——
符合 §0.5.1 的「1 Primary + ≤2 Secondary」。

`custom-development.md` §1.1 用整节篇幅规定了这条分工（含三条交叉链接写法与
两个稳定锚点 id `#cooperation-models` / `#development-flow`），
**实测代码完整实现了它**（`custom-development/page.tsx:87` 的
`id="cooperation-models"`；`custom-aluminum/page.tsx:319` 的
`anchorId="development-flow"`）。

### C. `/custom-development`「无新答案」段清单

**无。**

### D. `/custom-development` 一句总评

**合规**。这是全站视口纪律执行得最好的一页：
5 个视口、每屏一个问题、跨页分工有锚点契约、无冗余段、无竞争目标。

---

## 7. `/request-a-quote`（索取报价）

**代码事实**：`PageHero` → （条件）`QuoteContextBar` → ③ 表单 → ④ `DataNotice`。
规格要求四段（`PAGE-SPECS/request-a-quote.md` §1），实测 4 段。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 在这里能做什么？ | ① `PageHero` | `requestQuoteHero`（eyebrow `QUOTE` + H1 + 1 句） | 深色径向橙光 | `Go to the form` → `#quote-form-title` | 无 | ✅ 合规 |
| **02** | 你们已经知道什么？ | ② `QuoteContextBar`（条件） | 回显 model + 规格快照 | 浅色边框条 | 「换个型号」→ `/products/wheels` | 无 | ✅ 合规 |
| **03** | 我要填什么？ | ③ 表单 | `quoteFormHeading` + `InquiryForm` | 表单 | 提交表单 | 无 | ✅ 合规 |
| **04** | 我的数据怎么处理？ | ④ `DataNotice` | `quoteDataNotice` + `/contact` 文字链 | 纯文字 | 文字链 | 无 | ✅ 合规 |

### B. 违规项逐条说明

**无。**

**特别说明为什么这一页是「专注态」的正面样板**：

- **Hero 的 Primary Action 是 `#quote-form-title`（同页锚点）**，
  不是一个外链（`request-a-quote/page.tsx:59`）。
  **这让「页头」和「表单」服务同一个目标** —— 而不是像 `/products/wheels` 那样
  给出两个不同阶段的出口。
- **没有 `<DealerCta>`**，代码注释明写理由
  （`request-a-quote/page.tsx:38` 附近）：
  > There is no `<DealerCta>` and no second CTA anywhere: the form is the call to action.
  **这正是 `request-a-quote.md` §2④ 的纪律**：
  > **🔴 专注态的唯一出口是「提交」** —— 页面上任何别的 `btn-pill-solid` 都是事故。
- **`QuoteContextBar` 是条件渲染**（`request-a-quote/page.tsx:67-69`），
  无上下文时整段消失 —— 符合 `request-a-quote.md` §2② 纪律 2「无上下文则整段不渲染」。

### C. `/request-a-quote`「无新答案」段清单

**无。**

### D. `/request-a-quote` 一句总评

**合规**。这是「一个视口一个核心问题」的教科书实现 ——
四个视口对应「能做什么 / 你已知什么 / 你要填什么 / 数据怎么处理」四个必答问题，
且**全页只有「提交」一个行动**。

---

## 8. `/contact`（联系）

**代码事实**：A Hero → B 表单 + 联系详情（**左表单 + 右 aside 两卡**）→
C What happens next（步骤 + 勾选）→ D Read first pathways → （无 `DealerCta`）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这里能做什么？ | A Hero | `contactHero`（eyebrow `CONTACT` + H1 + lede + supporting） | 深色径向橙光 | 无 | 无 | ✅ 合规 |
| **02** | 我要填什么？ | B 表单 | `Wheel enquiry form` + `InquiryForm` | 表单（左 1.3fr） | 提交表单 | 无 | ⚠️ **拥挤**（见 B-1） |
| **03** | 怎么联系你们 / 什么能加速报价？ | B aside（两卡） | `contactDetailsCopy` 四行 dl + 占位警示 + `contactAside` 勾选列 | 右 aside 0.7fr 两卡（白卡 + 深卡） | email / tel 链接 | 无 | ⚠️ **拥挤**（见 B-1，与 02 同屏） |
| **04** | 接下来会怎样？ | C What happens next | `contactSteps` 4 步 + `contactWhatHappens.points` 4 条勾选 | 左步条 + 右勾选卡 | 无 | 无 | ✅ 合规 |
| **05** | 有什么该先读的？ | D Read first pathways | `contactPathways` 2–3 张卡 | 2 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 02/03（B 段）：一屏内 4 个不同的问题并列

**哪几个业务目标在竞争** —— B 段（`contact/page.tsx:78-219`）在**同一屏内**并列了：

| # | 内容 | 回答的问题 | 证据 |
|---|---|---|---|
| 1 | 表单（左栏 `lg:grid-cols-[1.3fr_0.7fr]`） | 「我要填什么」（**转化**） | `contact/page.tsx:80-98` |
| 2 | `contactDetailsCopy` 联系详情（右侧白卡） | 「怎么联系你们」（**另一个渠道**） | `:102-170` |
| 3 | **PLACEHOLDER 警示框** | 「这些联系方式是真的吗」（**元信息**） | `:173-189` |
| 4 | `contactAside`「What makes a quote fast」（右侧深卡） | 「怎么填报价更快」（**给表单的建议**） | `:192-218` |

**问题**：
- **① 和 ② 是竞争关系**：表单说「填表」，联系详情说「或者直接发邮件 / 打电话」。
  用户在填表的过程中，**右侧一直挂着一个「别填了，直接联系」的出口**。
- **③ 是元信息占位**：一段给内部看的施工警示（`PLACEHOLDER contact details —
  ... Replace them in src/content/site.ts before launch.`）
  **出现在了面向用户的转化屏上**。它不回答用户的任何问题。
- **④ 与 ① 是同向的**（都在说「怎么让报价更快」），算是合理支撑，
  但它跟 ③ 挤在同一个 aside 里。

**规格怎么说**：`contact.md` §1 的五段式里，
**④ 底部联系块是独立的一段**（「邮箱 + WhatsApp + 响应承诺」），不是与表单同屏的 aside。
规格原文（§2④）：
> **★ 响应承诺是转化页的信任核心**

**用户在这一屏该先理解什么**：「填这个表」（唯一行动）。
`contact.md` §1 的五段式把「表单」与「联系块」排成**先后两段**正是这个意图。

**建议怎么处理**：
1. **把 `contactDetailsCopy` 白卡移出 B 段**，成为独立的视口
   （放在 C 段「What happens next」之后，或 B 段之后、C 段之前）。
   它回答「怎么联系」—— 这是一个**备用渠道的问题，不是填表的一部分**。
2. **`PLACEHOLDER` 警示框必须在正式上线前删除**（`:173-189`）。
   它是**开发期脚手架**，不该出现在用户视野。若需要内部提醒，
   改为 `site.contact.confirmed === false` 时的构建期报错，而不是页面渲染。
3. **`contactAside` 深卡可以留在表单旁边**（它是「填写建议」，与表单同向不竞争），
   但改为**表单上方的简短提示条**会更好 —— 或者保留，因为 0.7fr 的 aside 只放一张卡时
   视觉上不再拥挤。

**改动量**：**中**（移动一段 JSX 的位置 + 删警示框）。

---

#### 🗑️ B-2｜视口 05（D Read first pathways）：答案是重复的

**位置**：`contact/page.tsx:282-334`（`aria-labelledby="contact-pathways-title"`），
标题 `Where to go next`，`contactPathways.links` 2–3 张卡。

**它回答的问题**：「在联系之前，我还该看点什么？」

**为什么答案是重复的** ——
1. **这是页面最后一段，页面到此结束** —— 没有 `DealerCta`（代码注释说明：
   `contact/page.tsx:35` 「`<DealerCta />` — the form is the call to action」）。
   所以这一段是**用户离开本页前看到的最后内容**。
2. **但「看什么」的问题在 02 段（B）已经回答过**：
   `contactAside` 的**深色卡**（`:192-218`）就是「为了拿到好报价，你需要准备什么」——
   它和 `contactPathways` 是**同一类内容**（导流到其他页面/资源）。
3. **规格的五段式里没有这一段**（`contact.md` §1：① 页头 ② 先发什么清单 ③ 表单
   ④ 底部联系块 ⑤ 后端链路）。
4. **`contact.md` §2③ 的「先发什么」清单（规格的 ② 段）本来就应该承担这个职责** ——
   代码把它换成了 `contactAside`/`contactPathways` 两张卡，
   **职责被拆成两份，两份都不完整**。

**建议怎么处理**：删除 `contact/page.tsx:282-334` 的整段。
若需要保留导流，则**把最有价值的一条（如「How to measure fitment」）并入
B 段的 `contactAside` 深卡**，作为一个额外的 checklist 条目 —— **不占独立一屏**。

**改动量**：**小**。

### C. `/contact`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `contact/page.tsx:282-334` D Read first pathways | 「联系之前还该看什么？」 | **B 段的 `contactAside` 深卡已回答同类问题**（都在导流到其他页面）；且**规格五段式里没有这一段**（`contact.md` §1）。 |
| `contact/page.tsx:173-189` PLACEHOLDER 警示框 | —— | **不回答用户任何问题** —— 是给施工方看的元信息（`Replace them in src/content/site.ts before launch.`）。**上线前必须删除。** |
| `contact/page.tsx:192-218` `contactAside` 深卡（**条件性**） | 「怎么让报价更快？」 | **若采纳 B-1 建议把联系详情独立成段**，则这一张深卡与新的联系段会**在同一序列里连续出现两张「白卡 + 深卡」组合** —— 那时它构成重复。**当前形态下不构成重复**（它在一个 aside 里与表单同向），**标注为条件性。** |

### D. `/contact` 一句总评

**需小修**。核心问题是一屏塞了四个问题（含一条不该给用户看的占位警示），
修法是「把联系详情移出去成为独立视口 + 删占位框 + 删尾部导流段」。

---

## 9. `/thank-you`（提交后）

**代码事实**：① Confirmation（深色）→ ② Response promise → ③ Urgent contact。
**无 `DealerCta`**（代码注释 `thank-you/page.tsx:24` 说明理由）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 你们收到了吗？ | ① Confirmation | `thankYouConfirm` + 条件 `referenceId` + 回首页文字链 | 深底 + 大号 ✓ 图标 | `← 返回首页`（**文字链，非按钮**，`:97-104`） | 无 | ✅ 合规 |
| **02** | 多久回我？ | ② Response promise | `thankYouResponsePromise`（window + note + nextStep） | 白底 + Clock 图标条 | 无 | 无 | ✅ 合规 |
| **03** | 急的话怎么找人？ | ③ Urgent contact | `thankYouUrgentContact`（条件渲染联系方式 / pendingNote） | 浅底 + 2 张卡 或 1 个提示条 | email / tel 链接 | `/contact` 文字链 | 🗑️ **建议合并进 02** |

### B. 违规项逐条说明

#### 🗑️ B-1｜视口 03（③ Urgent contact）：与 02 回答同一个问题的两个侧面

**位置**：`thank-you/page.tsx:141-198`。

**它回答的问题**：「多久回我 / 急的话怎么找人」。

**02 段回答的问题**：`thankYouResponsePromise` ——
`window`（响应窗口）+ `windowNote` + `nextStepNote`（「资料不全我们会来问你」）。

**为什么答案是重复的** ——
两段**共同构成**「接下来会发生什么」这一个问题的完整答案：
- 02 说「**什么时候**」→ 03 说「**等不及的话，现在就找我**」。

**规格怎么规定**：`thank-you.md` §1 明确**三块式**（① 已收到 ② 多久内回复 ③ 紧急联系方式），
**三块都在** —— 所以「两段都在」本身符合规格。

**⚠️ 但本报告判定它应合并，理由来自 §0.5.2 本身**：
`thank-you.md` §1 说「只有三块，不要再加第四块」，
但**规格没问过「删掉 ③ 会不会缺少答案」**。
按 §0.5.2 的判断法：
- 删掉 ② → 用户不知道等多久 → **缺少答案，不能删**
- 删掉 ③ → 用户在 02 已经知道「X 小时内回复」，且 ① 有回首页链。
  **「很急怎么办」的答案仍然存在** —— 因为 ③ 的实质内容是
  **一组联系方式**，而联系方式的存在是**常识**（用户可以回 `/contact`，
  ③ 段自己就给了这个文字链，`:187-195`）。

**更实际的问题**：③ 段**当前渲染的是 `pendingNote`**
（`thank-you/page.tsx:171-186`，当 `hasRealContact === false` 时），
即一段「联系方式待确认」的占位说明 —— **它不回答任何问题**。

**建议怎么处理**：
1. **把 ③ 段的联系方式卡并入 ② 段**，作为 02 段的下半部分
   （同一个 `container-fh`，一个 `<section>`）。
   合并后这一屏的形态是：「响应窗口（大字）→ 如果比较急，你也可以直接找到人（联系方式卡）」——
   **这是一个问题的两面，符合 §0.5.3「同一视口内的段必须共同服务于同一个问题」。**
2. **当 `hasRealContact === false` 时，③ 段的全部内容（含 `pendingNote`）不渲染** —— 
   不要用「联系方式待确认」这种给内部看的占位文案占据用户屏幕。
3. 保留 ② 的 `nextStepNote`（它回答「万一我资料没给全」——是第三个真实问题，
   但**体量小到可以是 02 段的一句 supporting**，不值得独立成屏）。

**改动量**：**小**（合并两个 section，加条件渲染）。

### C. `/thank-you`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `thank-you/page.tsx:141-198` ③ Urgent contact | 「急的话怎么找人？」 | **与 02「多久回我」是同一问题的两个侧面**（都是「接下来会发生什么」）。且现状渲染的是 `pendingNote` 占位说明（`:171-186`），**不回答任何问题**。 |
| `thank-you/page.tsx:124-127` `windowNote` | 「这个时间准确吗？」 | 是**对同段 `window` 的补充说明**，不是新问题。**可以留**（体量小、同一视口内），**仅记录。** |

**⚠️ 补充（非视口问题，但值得记录）**：
`thank-you/page.tsx:24` 的注释说明本页**故意不放 `DealerCta`** ——
这与 `thank-you.md` §2① 纪律一致：
> ❌ **不加任何 CTA / 不推荐产品 / 不引导关注**

**实测代码符合这一纪律**（`thank-you/page.tsx:97-104` 是安静的文字链接，
不是 `.btn-pill-solid` 按钮）。**这一点做得对，应保持。**

### D. `/thank-you` 一句总评

**需小修**。三块式结构基本正确，只需把「紧急联系方式」合并进「响应时间」成为一屏
（它们回答同一个问题），并在无真实联系方式时整块不渲染。

---

## 10. `/dealers`（经销商）

**代码事实**：8 段 —— A Hero → B dealer model → C programmes → D onboarding →
E shipping + F traceability（**同一 section 内左右分栏**）→ G FAQ → H pathways → `DealerCta`。
规格要求十二段（`PAGE-SPECS/dealers/index.md` §1）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 为什么跟你们做？ | A Hero | `dealerHero` 三件套 | 深色径向橙光 | `Start a dealer enquiry` → `/contact` | `Private label programme` → `/dealers/private-label` | ✅ 合规 |
| **02** | 合作模式是什么？ | B dealer model | `dealerModel` + 勾选列 | 左文 + 右卡 | 无 | 无 | ✅ 合规 |
| **03** | 有哪几种合作方式？ | C programmes | `Pick how you want to go to market` + `dealerPrograms` 3 卡 | 3 列卡（深色卡首 + 白底身体） | 卡内链接 | 无 | ⚠️ **拥挤**（见 B-1） |
| **04** | 开始之后怎么走？ | D onboarding | `From first enquiry to repeat order` + `dealerOnboarding` 6 步 | 3 列 × 2 行步条 | 无 | 无 | ✅ 合规 |
| **05** | 货运怎么算？ | E shipping | `dealerShipping` + 勾选列 | 左文 + 右卡 | 无 | 无 | ⚠️ **拥挤**（见 B-2） |
| **06** | 我能看到什么？ | F traceability | `dealerTraceability` + 勾选列 | 右卡（白底） | 无 | 无 | ⚠️ **拥挤**（见 B-2，与 05 同 section） |
| **07** | 常见问题？ | G FAQ | `Asked before the first order` + `faqs` 6 条 | 左标题 + 右列表 | 无 | 无 | 🔴 **违规**（见 B-3） |
| **08** | 接下来去哪？ | H pathways | `Where to go next` + `dealerPathways` 3 卡 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |
| **09** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 03（C programmes）：3 张卡各自是一个出口，且与下一段回答同一问题

**哪几个业务目标在竞争**：
`dealerPrograms`（`content/dealer-programs.ts`）三张卡
`Supply` / `Private label` / `Programme support`，**每张卡都是一个 `<article>` 带卡片内链**。

**具体问题**：这一段的标题写的是
`Pick how you want to go to market`（`dealers/page.tsx:123`），
**正文自己解释了三个程序回答不同的问题**（`:129-134` 原文）：

> The programmes are not tiers — they answer different questions. Supply
> is about not holding stock, private label is about who owns the brand,
> and programme support is about what you need to launch.

**→ 这一段是作者主动承认的「三个不同问题」**，而且卡片各有出口。
按 §0.5.1，一屏最多 1 Primary Message + 1 Primary Action。
**这里是一屏 3 个平行主张 + 3 个出口。**

**与下一段（04 onboarding）的关系**：04 段回答「开始之后怎么走」（6 步流程），
03 段回答「选哪条路」—— **它们其实是同一个决策问题的前后两半**
（选路 → 走路）。规格把这两者放在**不同的段**（`dealers/index.md` §1 的 ⑦ 六步流程
与 ⑥ 目录优势/③ 对号入座），**顺序是「先对号入座，再讲流程」**。

**用户在这一屏该先理解什么**：「有三种合作方式」——
但**一屏放不下「三种方式分别适合谁」**，所以现状是三个卡片的标题 + 一句 tagline，
**用户读完仍不知道选哪个**。

**建议怎么处理**：
1. **保留三段内容**（它们回答真实问题，不删），但**把卡片内链降级**：
   三张卡**只保留 Private label 一条链接**（因为它是唯一有独立页面的一条，
   `dealers/page.tsx:81` Hero 的次 CTA 已经指向它），
   其余两条改为纯文本说明。
2. **或**：把这一屏的 Primary Action 明确为**「不确定？直接询盘」**，
   三张卡全部去掉链接 —— 让用户在这里**只做理解，不做跳转**，
   选择留在下一屏（`DealerCta`）。

**⚠️ 注意**：`Private label` 的链接**与 Hero 的次 CTA 目的地完全相同**
（`/dealers/private-label`）—— 同页两个入口指向同一页，
这是可以在同一屏里合并的（保留 Hero 的，删除卡的）。

**改动量**：**小**。

---

#### ⚠️ B-2｜视口 05/06（E + F）：一个 `<section>` 里两个不同问题并列

**位置**：`dealers/page.tsx:234-301`。

**哪几个业务目标在竞争**：
- **E. 货运与物流**：`dealerShipping`（`:243-248`）+ `dealerShipping.points`
- **F. 可追溯性**：`dealerTraceability`（`:273-275`）+ `dealerTraceability.points`

两者在同一个 `<section>`（`:234` 的 `aria-labelledby="shipping-title"`）
内用 `lg:grid-cols-2` 左右分栏。

**规格怎么说**：`dealers/index.md` §1 的十二段式里，
**⑦ 六步下单流程** 与 **⑧ 可追溯点**是**两段**，且规格对 ⑧ 有硬性前置：

> **⚠️ ⑧ 段有硬性前置**：**若丰怀不能提供生产节点照片/视频，这一段必须整段删掉** ——
> 不能承诺做不到的事

**即规格认为「可追溯性」是一个可能被删除的独立段，不是什么「货运的补充」。**

**用户在这一屏该先理解什么**：
「货运怎么算」（物流问题）与「我能看到生产过程的什么证据」（可信度问题）
**是两个不同的问题**。左栏回答前者，右栏回答后者 ——
**滚动到这一屏要读两个不相干的标题。**

**建议怎么处理**：
1. **拆成两个 `<section>`**（各带自己的 `border-b border-border` 与 `py-20 lg:py-28`）。
2. **F 段先按规格的前置条件判断**：确认能提供生产节点照片/视频 → 保留；
   不能 → **整段删除**（`dealers/index.md` §1 原文）。

**改动量**：**小**（拆 section）/ **小**（删 F 段）。

---

#### 🔴 B-3｜视口 07（G FAQ）：FAQ 问题与 `content/faq.ts` 的全站共用数据冲突

**位置**：`dealers/page.tsx:305-338`，渲染 `faqs`（从 `content/faq` import）。

**实测 `content/faq.ts` 有 6 条 `question`。**
**同一个 `faqs` 也被 `/products`（`products/page.tsx:288`）渲染。**

**问题**：`dealers/index.md` §1 的 ⑪ 段要求
**「8–10 条」**，且其导读文案（`dealers/page.tsx:325-330`）自称：

> MOQ, lead time, fitment, private label, testing and freight — the six
> answers dealers want before they commit.

**而 `/products` 页的同一份数据导读写的是**（`products/page.tsx:296-299`）：

> The questions dealers ask before the first order.

**→ 同一个数据源，两页各自陈述它「包含什么」，且 `dealers` 页明确声称覆盖
「MOQ / lead time / fitment / private label / testing / freight」六个主题。**

**🔴 这是「视口违规」还是「数据问题」？**
严格说，**这里只有 1 个 Primary Message（「经销商问的六个问题」）+ 1 组列表 + 0 个行动**，
**形式上不违反 §0.5.1**。

**但本报告判定它为 🔴**，理由是一条**更难验证、但可证明的**问题：
**`/dealers` 页的 FAQ 与 `/products` 页的 FAQ 逐字相同**
（同一个 `faqs` 数组、同一个 `divide-y` 列表结构、同样的 `font-display text-[1.1rem]` 标题）。
按 §0.5.2 判断法：「删掉 `/dealers` 的 FAQ，读者会缺少什么答案？」
→ **读者在 `/products` 已经看到过完全相同的 6 条**。
**跨页重复不是 §0.5.2 的直接管辖范围**（该条讲「连续 Section」），
所以本报告**降级处理**：把这一条作为**强 ⚠️**记录，而不是 🔴。

> **⚠️ 更正**：综上，本项的准确判定是 **⚠️ 拥挤（跨页重复）**，不是 🔴。
> 上表「违规」列已据此理解为「跨页重复」，总览计数中 `/dealers` 的 🔴 计为 **0**。

**建议怎么处理**：
1. **`content/faq.ts` 拆成两份**：
   `dealerFaqs`（经销商专属：MOQ / 交期 / 贴牌 / 货运）用于 `/dealers`，
   `productFaqs`（产品专属：构造 / 适配数据 / 打样）用于 `/products`。
2. 每页的导读文案与自己的数据源对齐 —— **`dealers` 页声称的六个主题必须真实存在**。
3. 或者：**`/dealers` 保留 FAQ，`/products` 删除 FAQ 段**
   （`products/index.md` §1 本来就要求删）—— 这样同一份数据只在一处出现。

**改动量**：**中**（数据拆分）/ **小**（删 `/products` 的 FAQ 段）。

---

#### 🗑️ B-4｜视口 08（H pathways）：答案是重复的

**位置**：`dealers/page.tsx:342-382`，标题 `Where to go next` + `dealerPathways` 3 卡。
**紧跟其后是 `DealerCta`**（`:384`）。

**它回答的问题**：「接下来去哪？」

**为什么答案是重复的** ——
**同一屏序列的下一步就是 `DealerCta`**，它的 Primary Action
`Request a quote` → `/contact` 是**唯一的、更强的「接下来」答案**。
三张 pathway 卡（→ 贴牌 / 定制开发 / 轮毂目录）是**弱化的平行出口**。

`dealers/index.md` §1 的骨架里，⑩ 是路由段，⑫ 是收束 CTA ——
**规格确实要求两者都在**。**但规格是在旧的「段」视角下写的**；
按 §0.5.2，**两者回答同一个问题（下一步）**，且规格自己在 §0.5.5 说
「`PAGE-SPECS/` 规格的轴心从「第 N 段」改为「视口 N → 段 → 组件 → 内容」——
**即规格的段序在本判据下需要重新评估。**

**建议怎么处理**：删除 `dealers/page.tsx:342-382`，保留 `DealerCta`。
若认为 `/dealers/private-label` 与 `/custom-development` 的入口必须保留，
则**把它们并入 `DealerCta` 作为次级文字链**（`DealerCta` 已有
「email 文字链」的次级位置，`dealer-cta.tsx:51-58`）。

**改动量**：**小**。

### C. `/dealers`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `dealers/page.tsx:342-382` H pathways | 「接下来去哪？」 | **紧接其后的 `DealerCta` 已给出唯一答案**（→ `/request-a-quote`）。三张卡是弱化的平行分流。 |
| `dealers/page.tsx:305-338` G FAQ（**跨页重复**） | 「有什么常见问题？」 | **同一 `faqs` 数组已在 `/products` 渲染**（`products/page.tsx:288`），逐字相同。导读文案声称的六主题需与数据核对。 |
| `dealers/page.tsx:96-110` B dealer model 的 `dealerModel.body`（**条件性**） | 「我们怎么合作？」 | 若视口 03（C programmes）保留，则「怎么合作」会在两屏内被回答两次（B 段说合作模式，C 段说三种程序）。**当前 B 段偏「不囤货」主张、C 段偏「三种方式」 → 暂不构成重复**，标注为条件性。 |

### D. `/dealers` 一句总评

**需重构**。8 段里 3 段是弱的平行出口（C/H 部分 + G 跨页重复），
2 段被压在一屏（E+F）。修完视口数从 9 降到 7，每屏一问。

---

## 11. `/dealers/private-label`（贴牌）

**代码事实**：7 段 —— A Hero → B offer → C branding surfaces（4 格）→
D confidentiality + exclusivity（**左右分栏**）→ E flow（5 步）→ F audience（4 卡）→
G pathways → `DealerCta`。
规格要求十四段（`dealers/private-label.md` §1）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 贴牌是什么？ | A Hero | `privateLabelHero` | 深色径向橙光 | 主 CTA（`:73+`） | 次 CTA | ✅ 合规 |
| **02** | 你们给什么？ | B offer | `privateLabelOffer` + 勾选列 | 左文 + 右卡 | 无 | 无 | ✅ 合规 |
| **03** | 我的牌子出现在哪？ | C branding | `Every surface the customer sees` + 4 格 | 4 列编号格 | 无 | 无 | ✅ 合规 |
| **04** | 我的设计安全吗？ | D confidentiality + exclusivity | 左：勾选列；右：`Terms to be agreed in writing` 框 | 左文 + 右橙色框 | 无 | 无 | ✅ 合规 |
| **05** | 流程是怎样的？ | E flow | `From brief to repeat order` + 5 步 | 5 列步条 | 无 | 无 | ✅ 合规 |
| **06** | 适合我吗？ | F audience | `privateLabelAudience` + 4 卡 | 2 列卡 | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **07** | 接下来去哪？ | G pathways | `Where to go next` + 3 卡 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |
| **08** | 怎么询盘？ | `DealerCta` | 「Put your own name on the wheel」 | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 06（F audience）：「贴牌的定义」在这之前已被回答过三次

**哪几个业务目标在竞争**：这一段只有一个目标（回答「适合我吗」），
**但它与 02/04/05 三段的信息重叠**：

| 段 | 回答的问题 | 出处 |
|---|---|---|
| B offer | 「你们给什么」——`privateLabelOffer.body` 说贴牌是「不用先建仓库」 | `:100-110` |
| D confidentiality | 「设计安全吗」——`privateLabelConfidentiality.body` 说「不公开展示、不转卖」 | `:188-192` |
| E flow | 「流程」——`privateLabelFlow` 五步，第 03 步说「样件确认后产线成为你的」 | `:245-278` |
| **F audience** | **「适合我吗」**——`privateLabelAudiencePoints` 4 卡 | `:290-323` |

**规格怎么说**：`dealers/private-label.md` §1 的十四段里，**② 何时该贴牌**
是「4 信号 + ★ 什么情况下不该」——**这是「前置判定」，规格把它排在第二位**（不是倒数第二）。
而 **⑥ 先做一套 / ⑩ 卖给谁**等其他段落承担了「适合吗」的不同侧面。

**用户在这一屏该先理解什么**：用户读到这里已经看完了 offer / branding / 法务 / 流程，
**「适不适合」的判断应该在最前面做，而不是最后**（
读完全部信息再问「我适合吗」= 用户已经浪费了几分钟）。

**建议怎么处理**（二选一）：
1. **把 F audience 移到 B offer 之前**（成为视口 02），
   让「适不适合」先筛人 —— 与规格的「② 何时该贴牌」位置一致。
   这样 06 位空出来 → 视口数不变但顺序正确。
2. **或**：若产品坚持「先讲价值再筛人」，则**把 F 段从 4 卡压成 2 句
   并入 B 段**（`privateLabelOffer.body` 之后），**删除 4 卡栅格**。

**为什么这是 ⚠️ 而不是 🔴**：本段**形式上**是「1 个问题 + 1 组卡片」，
**符合 §0.5.1**。它的缺陷是**位置错误**（顺序），不是「多目标竞争」。
诚实标注这个区别。

**改动量**：**小**（移动 JSX 块）。

---

#### 🗑️ B-2｜视口 07（G pathways）：答案是重复的

**位置**：`dealers/private-label/page.tsx:327-367`，`Where to go next` + 3 卡。

**为什么答案是重复的**：与第 10 节 `/dealers` 的 B-4 **完全同形** ——
紧接其后的 `DealerCta`（`:369-372`）给出了唯一的「下一步」答案
（`Request a quote`）。三张 pathway 卡是弱化的平行出口。

**规格怎么说**：`dealers/private-label.md` §1 的 ⑬ 路由段确实要求，
**但 §1 末尾的三段核心是 ⑦⑧⑨ 法务**（规格原文：
「🔴 法务三段（⑦⑧⑨）独立成段，不合并、不塞进 FAQ」）——
**规格真正在意的是法务段独立，路由段是模板化的附加项。**

**建议**：删除 `:327-367`，把有必要的入口（→ `/dealers`、`/custom-development`）
并入 `DealerCta` 的次级文字链位置。

**改动量**：**小**。

### C. `/dealers/private-label`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `:327-367` G pathways | 「接下来去哪？」 | **紧接其后的 `DealerCta` 已给出唯一答案**。与 `/dealers` H 段同形。 |
| `:283-323` F audience（**位置问题**） | 「适合我吗？」 | 前面 B/D/E 三段已分别从「给什么 / 安全吗 / 流程」三个角度回答过。**不构成严格重复，但位置应前移**（规格 ② 段位）。 |

### D. `/dealers/private-label` 一句总评

**需小修**。7 段里 5 段结构正确（含规格最重视的法务段，实现质量高），
只需删尾部 route 段 + 前移 audience 段。

---

## 12. `/about`（关于）

**代码事实**：7 段 —— A Hero → B stats strip（`aboutStats` 4 格，带 Placeholder 标记）→
C chain（供应链）→ D quality → E positioning（`aboutAreNot` / `aboutAre` 两列）→
F dealer model（4 步）→ G pathways → `DealerCta`。
规格要求九段（`PAGE-SPECS/about.md` §1）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 你们是谁？ | A Hero | `aboutHero` + 成立年份侧栏 | 深色径向橙光 | 主 CTA | 次 CTA | ✅ 合规 |
| **02** | 规模多大？ | B stats strip | `aboutStats` 4 格 + Placeholder 徽标 | 4 列数字格 | 无 | 无 | ✅ 合规（有 `isPlaceholder` 标记，诚实） |
| **03** | 供应链是怎样的？ | C chain | `aboutChain` + 勾选列 + `aboutChainStages` | 左文 + 右编号列 | 无 | 无 | ✅ 合规 |
| **04** | 质量怎么保证？ | D quality | `aboutQuality` + 勾选列 | 左文 + 右勾选卡 | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **05** | 你们为谁服务？ | E positioning | `aboutPositioning` + `What we are not` / `What we are` 两列 | 左负右正两列 | 无 | 无 | ⚠️ **拥挤**（见 B-1，与 04 相邻同形） |
| **06** | 怎么跟经销商合作？ | F dealer model | `aboutDealerModel` + `aboutDealerSteps` 4 步 | 4 列步条 | 无 | 无 | 🗑️ **建议与 `/dealers` 二选一** |
| **07** | 接下来去哪？ | G pathways | `Where to go next` + 3 卡 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |
| **08** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 04（D quality）与 05（E positioning）：连续两屏用同一形态

**哪几个业务目标在竞争**：
- **D quality**（`:190-224`）：`aboutQuality` + `aboutQuality.points` 勾选列
- **E positioning**（`:228-259`）：`aboutPositioning` + `aboutAreNot` / `aboutAre` 两列

**两者格式几乎相同**（都是「左标题文 + 右侧清单」），
**而 E 段的清单变成了两列对比**（负/正），形成**第三种视觉密度**。

**更严格的检查**（按 §0.5.2）：
- 删掉 D quality → 读者缺少「质量怎么保证」的答案 → **不能删** ✅ 成立
- 删掉 E positioning → 读者缺少「你们为谁服务」的答案 → **不能删** ✅ 成立

**→ 两段都成立**，**都不该删**。

**那为什么标 ⚠️**：
因为**连续两屏的视觉形态几乎相同**（左文右清单），
而 E 段又额外加了「正负两列」的结构 ——
**读者滚动时会以为自己在看同一段**，这是「认知路径没有前进」的观感来源，
虽然内容确实是两个问题。**这是呈现层问题，不是内容层违规。**

**建议怎么处理**（不要删段，改结构）：
1. **E positioning 的「What we are not / What we are」两列是它的特色**，
   建议**把它做成这一屏的唯一视觉焦点**（放大、去掉左边的 `aboutPositioning.body` 长文，
   改为一行导语），**与 D 段的「左文右清单」形成形态差异**。
2. 或者**在 D 与 E 之间插入一段有实质差异的段**（若视口顺序可调）。

**改动量**：**小**（改 E 段布局）。

---

#### 🗑️ B-2｜视口 06（F dealer model）：答案是重复的（与 `/dealers` 冲突）

**位置**：`about/page.tsx:263-303`，`Working with dealers` + `aboutDealerSteps` 4 步。

**它回答的问题**：「跟你们合作怎么走？」

**为什么答案是重复的** ——
**`/dealers` 页的第 04 段（D onboarding）回答完全相同的问题**
（`dealers/page.tsx:189-230`，`From first enquiry to repeat order` + `dealerOnboarding` **6 步**）。

两页对比：

| | `/about` F 段 | `/dealers` D 段 |
|---|---|---|
| 标题 | `Working with dealers`（`about/page.tsx:270`） | `From first enquiry to repeat order`（`dealers/page.tsx:196`） |
| 步数 | **4 步**（`aboutDealerSteps`） | **6 步**（`dealerOnboarding`） |
| 结构 | `lg:grid-cols-4` 编号格 | `lg:grid-cols-3` 编号格 |
| 回答 | 「合作怎么走」 | 「合作怎么走」 |

**→ `/about` 的 4 步是 `/dealers` 6 步的简化版。**
按 §0.5.2：「删掉 `/about` 的 F 段，读者会缺少什么答案？」
→ **不缺少** —— 因为 `/about` 的 G 段（pathways）**和 `DealerCta` 都会把用户送到
`/dealers` 类的页面**（见下），那里有更完整的 6 步。

**建议怎么处理**：
1. **`/about` 保留 F 段的标题与一句导语，删除 4 步栅格** ——
   改为一句「从首次询盘到复购的完整流程，见经销商页」+ 一个链接。
2. **或**直接删除整段（`:263-303`），因为 `/about` 的核心问题是「你们是谁」，
   「怎么合作」是 `/dealers` 的职责（`about.md` §1 的 ⑧ 路由段本意就是把人送过去）。

**改动量**：**小**。

---

#### 🗑️ B-3｜视口 07（G pathways）：答案是重复的

**位置**：`about/page.tsx:307-347`，`Where to go next` + `aboutPathways` 3 卡。

**与第 10/11 节的 B-4/B-2 完全同形** —— 紧接 `DealerCta`，
三张卡是弱化的平行出口。

**建议**：删除，或把必要入口并入 `DealerCta` 次级文字链。

**改动量**：**小**。

### C. `/about`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `about/page.tsx:263-303` F dealer model | 「怎么跟你们合作？」 | **`/dealers` 的 D 段（`dealers/page.tsx:189-230`）回答同一问题且更完整**（6 步 vs 此处 4 步）。删掉后读者可通过 pathways/CTA 抵达更完整答案。 |
| `about/page.tsx:307-347` G pathways | 「接下来去哪？」 | **紧接其后的 `DealerCta` 已给出唯一答案**。与 `/dealers`、`/dealers/private-label` 同形。 |

### D. `/about` 一句总评

**需小修**。核心问题不在多余段，而在「与 `/dealers` 的合作流程重复」，
以及尾部路由段的老问题。整体内容质量高（`isPlaceholder` 徽标、
`What we are not` 反筛选都是好设计）。

---

## 13. `/products/ev-components`（EV 三电）

**代码事实**：`PageHero` → ② Definition（3 卡）→ ③ `#capable-parts`（`PartGroupCards`）→
④ audience（`SelfIdentifyBlock`）→ ⑤ capability（`CapabilityGrid`）→
⑥ `QualityEvidence` → ⑦ FAQ + `DataNotice` → ⑧ `RouteBlock` → ⑧b `#engineering-eval` CTA。
规格要求八段（`PAGE-SPECS/products/ev-components.md` §1）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这条线是什么？ | ① `PageHero` | `evHero` | 深色径向橙光 | 主 CTA | 无 | ✅ 合规 |
| **02** | 三电壳体指哪些件？ | ② Definition | `evDefinition` + 3 编号卡 | 左文 + 3 列卡 | 无 | 无 | ✅ 合规 |
| **03** | 能做哪些具体零件？ | ③ `#capable-parts` | `Fifteen part types` + `PartGroupCards` | 分组卡 | 无 | 无 | ✅ 合规 |
| **04** | 这页是给我看的吗？ | ④ audience | `Whether this page is for you` + `SelfIdentifyBlock` | 正负筛选块 | 无 | 无 | ✅ 合规 |
| **05** | 你们有哪些能力？ | ⑤ capability | `evCapabilities` 5 项 | `CapabilityGrid` 3 列 | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **06** | 怎么检验的？ | ⑥ `QualityEvidence` | `evQuality.rows` + disclosure | 3 行证据表 | 无 | 无 | ⚠️ **拥挤**（见 B-1，与 05 相邻） |
| **07** | 常见问题？ | ⑦ FAQ + `DataNotice` | `evFaqs` + `evFaqNotice` | 手风琴 | 无 | 无 | ✅ 合规 |
| **08** | 接下来去哪？ | ⑧ `RouteBlock` | `evRoutes` 3 出口 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除**（见 B-2） |
| **09** | 怎么给你们图纸？ | ⑧b `#engineering-eval` | `evCta` | `forge-soft` 橙底 | `evCta.primary` | `evCta.secondary` | ✅ 合规 |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 05（⑤ capability）与 06（⑥ QualityEvidence）：能力与质检被拆成两屏

**哪几个业务目标在竞争**：
- **⑤ capability**（`:176-202`）：`What a housing project needs, and what we hold` —— 5 项能力
- **⑥ QualityEvidence**（`:206-219`）：`How a housing is checked before it ships` —— 3 行证据

**问题**：
**规格把这两者视为同一段**（`ev-components.md` §1 的 ⑥「质量与检测」）——
即规格认为「能力」与「检测」是**一个问题（这条线的工程可信度）的两个侧面**。
实测把它们拆成了**两个满屏的 `<section>`**（各带 `py-20 lg:py-28`）。

**更具体的证据**：⑥ 段的 `lede` 原文自述
（`ev-components/page.tsx:211-213`）：
> Two rows are evidenced today. The third is the question every vehicle
> customer asks, and it is shown as it stands rather than answered in general terms.

**→ ⑥ 段的实质内容只有「3 行表格 + 一句披露」，体量远小于一个满屏 section。**
它被单独成段是因为**证据纪律**（要显式披露一行缺失），
不是因为它是新问题。

**用户在这一屏该先理解什么**：「你们能造什么 + 怎么证明能造好」——
这两件事在买家心里是**同一个判断**（这个供应商靠谱吗）。

**建议怎么处理**：
1. **把 ⑥ `QualityEvidence` 并入 ⑤ 段的尾部**（同一 `<section>`，
   `QualityEvidence` 用 `mt-16` 承接，`ev-components.md` §2⑥ 原文即如此要求：
   「← `/capabilities` 规划件，本页只取「三行证据表」形态」）。
2. 这样 ⑤ 段变成「5 项能力 + 3 行证据」，**体量配得上一个满屏**。
3. 合并后视口数从 9 降到 8。

**改动量**：**小**（合并 section）。

---

#### 🗑️ B-2｜视口 08（⑧ RouteBlock）：答案是重复的

**位置**：`ev-components/page.tsx:248-260`，`RouteBlock` with 3 routes。

**它回答的问题**：「接下来去哪？」

**为什么答案是重复的** ——
**紧接其后的 ⑧b 段（`#engineering-eval`，`:264-295`）是一个完整的橙底收口段**，
带 `evCta.primary` + `evCta.secondary` 两个行动。
**两段在同一屏序列里连续出现，回答同一个问题（下一步）。**

**规格怎么说**：`ev-components.md` §1 的八段式**同时**有
⑧（`<RouteBlock>`，三出口）+ `#engineering-eval`（`<EngineeringEvalCta>`），
且 §1 特别说明：
> **⚠️ 与 `index.md` §3 的差异**：`index.md` 给三条能力线统一套 `<DealerCta>` 收尾。
> **本页例外** —— CTA 语义是「工程评估」不是「询盘」

**→ 规格刻意给了本页一个不同的收尾，但同时保留了 RouteBlock。**
按 §0.5.2 判断：「删掉 RouteBlock，读者会缺少什么答案？」
→ **不缺少** —— `#engineering-eval` 本身就是「接下来去哪」的答案，
且它更强（有具体行动 + 橙底信号）。

**建议怎么处理**：删除 `:248-260` 的 RouteBlock 段，
把三出口中的必要项（如 → `/capabilities`）**并入 `evCta.secondary`**
（`#engineering-eval` 已有 secondary 位置，`:285-290`）。

**改动量**：**极小**。

### C. `/products/ev-components`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `ev-components/page.tsx:248-260` ⑧ RouteBlock | 「接下来去哪？」 | **紧接其后的 `#engineering-eval`（`:264-295`）是更强的「下一步」答案**（橙底 + 具体行动）。规格同时保留两者，但 RouteBlock 不提供额外答案。 |
| `ev-components/page.tsx:206-219` ⑥ QualityEvidence（**合并而非删除**） | 「怎么检验的？」 | **与 ⑤ 的能力段是同一个问题的两个侧面**（工程可信度），规格视为同一段（§1 ⑥）。应并入 ⑤，**不是删除**。 |

### D. `/products/ev-components` 一句总评

**需小修**。内容质量高（`SelfIdentifyBlock` 反筛选、显式披露缺失证据都是好设计），
只需合并「能力 + 质检」成一屏、删除尾部 RouteBlock。

---

## 14. `/products/custom-aluminum`（铝制品定制）

**代码事实**：`PageHero` → ② Definition + `CrossLink`（分流框）→ ③ `#inputs`（4 卡）→
④ `#boundary`（`BoundaryTable` + 条件 `DataNotice`）→ ⑤ capability（6 项）→
⑥ typical parts（`PartGroupCards`）→ ⑦ `#development-flow`（`ProcessDiagram` + `CrossLink`）→
⑧ FAQ + `DataNotice` → ⑨ `RouteBlock` → ⑨b `DealerCta`。
规格要求九段（`PAGE-SPECS/products/custom-aluminum.md` §1）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这条线是什么？ | ① `PageHero` | `caHero` | 深色径向橙光 | 主 CTA | 无 | ✅ 合规 |
| **02** | 铝制品定制 ≠ 卖标准铝件（与 EV 页怎么分？） | ② Definition + **`CrossLink` 分流框** | `caDefinition` + 3 卡 + `caSplit` | 左文 + 3 卡 + **橙色分流框** | `CrossLink` → EV 页 | 无 | ✅ 合规 |
| **03** | 项目怎么开始？ | ③ `#inputs` | `Four ways a project starts` + `InputTypeCards` 4 卡 | 4 卡 | 无 | 无 | ✅ 合规 |
| **04** | 你们不做什么？ | ④ `#boundary` | `Where the boundary is` + `BoundaryTable` + 条件 DataNotice | 三态表 | 无 | 无 | ✅ 合规 |
| **05** | 你们有哪些能力？ | ⑤ capability | 6 项 | `CapabilityGrid` | 无 | 无 | ✅ 合规 |
| **06** | 典型件是什么样？ | ⑥ typical parts | `Where this capability lands` + 2 组 | `PartGroupCards` | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **07** | 图纸怎么变成件？ | ⑦ `#development-flow` | `ProcessDiagram` 8 环节 + NDA + `CrossLink` | 流程图 | `CrossLink` → `/custom-development#cooperation-models` | 无 | ✅ 合规 |
| **08** | 常见问题？ | ⑧ FAQ + `DataNotice` | `caFaqs` 3 条 + `caFaqNotice` | 手风琴 | 无 | 无 | ✅ 合规 |
| **09** | 接下来去哪？ | ⑨ `RouteBlock` | `caRoutes` 3 出口 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |
| **10** | 怎么询盘？ | ⑨b `DealerCta` | `caCta` | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 05（⑤ capability）与 06（⑥ typical parts）：能力与典型件被拆成两屏

**哪几个业务目标在竞争**：
- **⑤ capability**（`:239-263`）：`Six capabilities, combined per project` + 6 项
- **⑥ typical parts**（`:267-292`）：`Where this capability lands` + 2 组典型件

**问题**：
⑥ 段的标题 `Where this capability lands`（`custom-aluminum/page.tsx:279`）
**直接承认它是 ⑤ 的延续**（「capability 落在哪里」）。
两段用同一形态（`CapabilityGrid` / `PartGroupCards` 都是卡片栅格），
**连续两屏读起来是同一种内容。**

**规格怎么说**：`custom-aluminum.md` §1 把 ⑤（我们能做什么）与 ⑥（典型件举例）
列为**两段**，所以「都在」符合规格。
**但规格 §2⑥ 原文**：
> 两组典型件（复用 ev-components ③ 同一组件）

即规格认为 ⑥ 是**轻量补充**（两组示例），不是满屏的独立主张。

**用户在这一屏该先理解什么**：读完 ⑤ 的六项能力后，用户需要的是**一个锚点**
（「所以你们实际做出来的东西长什么样」）—— 这是 ⑤ 的收尾，不是新问题。

**建议怎么处理**：
1. **把 ⑥ 的 `PartGroupCards` 并入 ⑤ 段尾部**（同一 `<section>`），
   去掉 ⑥ 独立的 `py-20 lg:py-28`。
2. `Where this capability lands` 的标题降为 H3。
3. 合并后视口数从 10 降到 9。

**改动量**：**小**。

---

#### 🗑️ B-2｜视口 09（⑨ RouteBlock）：答案是重复的

**位置**：`custom-aluminum/page.tsx:360-368`，`RouteBlock` with 3 routes。

**为什么答案是重复的**：与第 13 节 B-2 **同形** ——
紧接其后的 ⑨b `DealerCta`（`:371`，`caCta.title` / `caCta.body`）
是这个页面序列里**唯一、更强的「下一步」答案**。

**建议**：删除 RouteBlock，把必要入口（→ `/custom-development`）并入
`DealerCta` 或 ⑦ 段已有的 `CrossLink`（`:322-329` 已经指向
`/custom-development#cooperation-models` —— **入口已经存在**）。

**改动量**：**极小**。

### C. `/products/custom-aluminum`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `custom-aluminum/page.tsx:360-368` ⑨ RouteBlock | 「接下来去哪？」 | **紧接其后的 `DealerCta`（`:371`）已给出唯一答案**；且 ⑦ 段的 `CrossLink`（`:322-329`）已经提供了 `/custom-development` 的入口 —— **同一目的地，段内已有**。 |
| `custom-aluminum/page.tsx:267-292` ⑥ typical parts（**合并而非删除**） | 「实际做出来的东西长什么样？」 | **是 ⑤ 能力段的锚点收尾**，规格 §2⑥ 定位为轻量补充（两组示例）。应并入 ⑤，**不是删除**。 |

### D. `/products/custom-aluminum` 一句总评

**需小修**。这是三条非轮毂线里**内容纪律最好的一页** ——
④ 段「我能做什么 / 不能做什么」（`BoundaryTable` + 条件 `DataNotice` 显式说明
「middle column is shown empty rather than filled in」）是**全站证据纪律的样板**。
唯一结构冗余是尾部 RouteBlock。

---

## 15. `/products/safety-tires`（安全轮胎）

**代码事实**：`PageHero` → ② Definition（3 卡）→ ③ `#pain-point`（痛点 + 对号入座 4 条）→
④ `#mechanism`（`MechanismSteps`）→ ⑤ capability（4 项）→ ⑥ `#specs`（`ParamTable`）→
⑦ FAQ + **归属未定的开放问题框** → ⑧ `RouteBlock` → ⑨ CTA（**条件：`cta ? ... : DataNotice`**）。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这条线是什么？ | ① `PageHero` | `tireHero` | 深色径向橙光 | 主 CTA（⚠️ 待定） | 无 | ✅ 合规 |
| **02** | 自密封轮胎是什么？ | ② Definition | `tireDefinition` + 3 卡 | 左文 + 3 卡 | 无 | 无 | ✅ 合规 |
| **03** | 我需要吗？ | ③ `#pain-point` | `tirePain` + `audience` 4 条 | 左文 + 4 条网格 | 无 | 无 | ✅ 合规 |
| **04** | 它怎么做到的？ | ④ `#mechanism` | `MechanismSteps` 四步 + 示意图位 | 步骤 + 媒体位 | 无 | 无 | ⚠️ **拥挤**（见 B-1） |
| **05** | 谁在管验证与交付？ | ⑤ capability | `tireCapabilities` 4 项 | 4 列 `CapabilityGrid` | 无 | 无 | ⚠️ **拥挤**（见 B-1，与 04 相邻） |
| **06** | 性能数字是多少？ | ⑥ `#specs` | `ParamTable` 4 项 + 标准行 + 披露 | 参数表 | 无 | 无 | ✅ 合规 |
| **07** | 常见问题？ | ⑦ FAQ + 开放问题框 | `tireFaqs` + `tireAttributionDisclosure` | 手风琴 + 橙色开放框 | 无 | 无 | ✅ 合规 |
| **08** | 接下来去哪？ | ⑧ `RouteBlock` | `tireRoutes` 3 出口 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |
| **09** | 怎么询盘？ | ⑨ 条件 CTA | `cta` 或 `DataNotice`（pending） | 橙底 / 提示条 | `cta.primary` | `cta.secondary` | ✅ 合规（条件渲染做得好） |

### B. 违规项逐条说明

#### ⚠️ B-1｜视口 04（④ mechanism）与 05（⑤ capability）：原理与验证被拆成两屏

**哪几个业务目标在竞争**：
- **④ mechanism**（`:181-199`）：`MechanismSteps` —— 「它怎么做到的」（四步原理）
- **⑤ capability**（`:203-227`）：`tireCapabilities` —— 「谁在管验证与交付」

**问题**：
这两段的**主题差异是真实的**（原理 vs 验证），但：
1. **两段都只有一个标题 + 一组卡片**，中间没有过渡；
2. **代码注释显示作者自己也标注了 ⑤ 的不确定性**
   （`safety-tires/page.tsx:203`：
   `{/* ⑤ Capability — ⚠️ verification and delivery, not the factory ------- */}`）；
3. **规格把 ④（MechanismSteps）定为「本页最强的一段」**
   （`safety-tires.md` §1 原文：`④ <MechanismSteps> ★★ 四步原理 + 示意图组（⚠️ 图待授权）`），
   **而 ⑤ 只有一行说明（`CapabilityGrid` 四项）**。

**→ 问题不是「两个问题竞争」，而是「④ 的视觉分量不足，⑤ 被拉出来单独占一屏稀释了 ④」。**
按规格，④ 应该是本页的**主视觉**（四步原理 + 示意图组），
现状它没有图（图待授权），**导致它和一个次要的 ⑤ 段视觉重量相当**，
读者滚动时无法分辨哪一段是本页重点。

**建议怎么处理**：
1. **把 ⑤ 的 `CapabilityGrid` 并入 ④ 段尾部**（同一 `<section>`），
   作为「原理之后的验证说明」—— 与规格「④ 是本页最强段」的定位一致。
2. 清空出来的屏位留给 ④ 的示意图（图授权后）。
3. 合并后视口数从 9 降到 8。

**改动量**：**小**。

---

#### 🗑️ B-2｜视口 08（⑧ RouteBlock）：答案是重复的

**位置**：`safety-tires/page.tsx:301-313`，`RouteBlock`。

**为什么答案是重复的**：与第 13/14 节 **完全同形** ——
紧接其后的 ⑨ 段（`:321-352` 的橙底 CTA 或 `:355-376` 的 `DataNotice`）
是这一屏序列的最终去向。

**建议**：删除 RouteBlock，必要入口并入 ⑨ 段的 secondary。

**改动量**：**极小**。

### C. `/products/safety-tires`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `safety-tires/page.tsx:301-313` ⑧ RouteBlock | 「接下来去哪？」 | **紧接其后的 ⑨ 段（条件 CTA / DataNotice）已给出最终去向**。与 ev-components / custom-aluminum 同形。 |
| `safety-tires/page.tsx:203-227` ⑤ capability（**合并而非删除**） | 「谁在验证与交付？」 | **是 ④ 原理段的验证收尾**（规格把 ④ 定为本页最强段，⑤ 只有一行说明）。应并入 ④，**不是删除**。 |

**⚠️ 补充（本页做得对的地方，应保持）**：
`safety-tires/page.tsx:277-295` 的「开放问题框」实现了本页最重要的纪律 ——
**答不出的问题不隐藏，而是显式声明**。代码注释（`:282-285`）原文：
> The one question we cannot answer yet is not deleted. Hiding it
> would read as avoidance on the first thing a buyer asks, so it sits
> in the list with an explicit statement instead.

**这是全站最佳实践之一**，与「视口律」无关但与「证据纪律」直接相关，**建议推广到其他页面。**

### D. `/products/safety-tires` 一句总评

**需小修**。内容纪律优秀（开放问题显式声明 + 条件 CTA），
只需合并 ④⑤ 成屏、删尾部 RouteBlock。

---

## 16. `/resources`（技术与见解 —— 对应规格 `insights/index`）

**代码事实**：4 段 —— A Hero → B `GuidesAccordion` → B2 reference sets（2 卡）→
C pathways（3 卡）→ `DealerCta`。
规格要求四段（`PAGE-SPECS/insights/index.md` §1），但**四段的具体内容不同**。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 内容中心是什么？ | A Hero | `resourcesHero` | 深色径向橙光 | `Browse the guides` → `#guides-title` | `Ask a technical question` → `/contact` | ✅ 合规（锚点跳转 + 咨询，不冲突） |
| **02** | 有哪些指南？ | B Guide cards | `resourcesIntro` + `GuidesAccordion` | 手风琴 | 展开/关闭 | 无 | ✅ 合规 |
| **03** | 还有什么参考资料？ | B2 reference sets | `resourcesExtraIndex` + 2 卡（bolt patterns / offset calculator） | 2 列卡 | 卡内链接 | 无 | 🗑️ **建议并入 02** |
| **04** | 接下来去哪？ | C pathways | `Where to go next` + 3 卡 | 3 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |
| **05** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### 🗑️ B-1｜视口 03（B2 reference sets）：答案是重复的（与 02 是同一问题）

**位置**：`resources/page.tsx:101-144`，`aria-labelledby="reference-sets-title"`，
标题 `resourcesExtraIndex.heading`，2 张卡。

**它回答的问题**：「有哪些参考资料？」

**为什么答案是重复的** ——
**02 段（`GuidesAccordion`）回答的就是「有哪些参考资料」**，
只不过 B2 把它拆成「两种资料类型」（指南 vs 参考集）。

**规格怎么说**：`insights/index.md` §1 的四段式是
① Hero ② **分类导航（可点选 + 带计数）** ③ START HERE ④ 文章网格。
**规格用「一个可点选的分类导航」来区分内容类型，而不是「两个段落」。**

规格 §1 的对照表原文（对竞品的评价）：
> ② 分类条 | ⚠️ **装饰性**（14 字，不可点） | **★ 升级为可点选 + 计数** | **改进（核心）**

**→ 规格要求的是「导航」（一段，可点选）而不是「两个并列的资料段」。**
现状的 B2 是一个**静态的两卡段**，规格判这类形态为「装饰性」。

**用户在这一屏该先理解什么**：「这里有什么类型的内容」——
这个问题的答案是**一段导航**，不是「第二屏卡片」。

**建议怎么处理**：
1. **把 B2 并入 02 段**：在 `GuidesAccordion` 上方加一行**可点选的分类条**
   （「指南 / 换装参考 / 工具」+ 计数），点击滚动到对应区块。
2. 或者最简单：**删除 B2 的独立段落包装**（去掉 `py-20 lg:py-24` 的 section），
   把 2 张卡直接放在 `GuidesAccordion` 下方 —— **成为 02 段的一部分**。

**改动量**：**小**。

---

#### 🗑️ B-2｜视口 04（C pathways）：答案是重复的

**位置**：`resources/page.tsx:148-188`，`Where to go next` + `resourcesPathways` 3 卡。

**为什么答案是重复的**：与第 10–15 节 **完全同形** —— 紧接 `DealerCta`。
**本页的 `DealerCta` 没有传 props**（`resources/page.tsx:190` 是 `<DealerCta />`），
所以它用的是默认文案「Open a forged wheel line with us」——
**这是所有页面里最弱的一个收口**（没有针对内容中心定制）。

**建议**：
1. **删除 C 段**（`:148-188`）。
2. **同时给 `DealerCta` 传 props**，让收口与内容中心的语境匹配
   （例如「关于你的适配问题，我们可以直接回答」→ `/contact`）。

**改动量**：**小**。

### C. `/resources`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `resources/page.tsx:101-144` B2 reference sets | 「有哪些参考资料？」 | **02 段的 `GuidesAccordion` 已经在答「有哪些内容」**。规格要求用「一段可点选导航」区分类型（`insights/index.md` §1 ②），不是两个并列段。 |
| `resources/page.tsx:148-188` C pathways | 「接下来去哪？」 | **紧接其后的 `DealerCta` 已给出唯一答案**。与全站 7 处同形。 |

### D. `/resources` 一句总评

**需小修**。前两段合规，后两段是本站最常见的老问题（双段并列 + 尾部路由）。
**⚠️ 注意**：规格要求本页路由名应为 `/insights`（`insights/index.md` 与
`index-home.md` §2⑦ 都写 `/insights/*`），**现状仍是 `/resources`** ——
这是路由命名问题，不是视口问题，仅记录。

---

## 17. `/gallery`（作品集）

**代码事实**：4 段 —— A Hero → B `BuildsGallery`（筛选网格）→
C `galleryAnswer`（How to read this）→ D pathways（2 卡）→ `DealerCta`。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这里是什么？ | A Hero | `galleryHero` | 深色 + **超大字号 H1**（`clamp(2.8rem,9vw,6.4rem)`，`:43`） | `Request a fitment` → `/contact` | `Finish reference` → `/gallery/finishes` | ✅ 合规 |
| **02** | 有哪些案例？ | B `BuildsGallery` | `Completed builds` + 筛选器 + 网格 | 筛选网格 | 筛选操作 | 无 | ✅ 合规 |
| **03** | 怎么读这些案例？ | C `galleryAnswer` | `galleryAnswer` + 勾选列 | 左文 + 右勾选 | 无 | 无 | 🗑️ **建议删除**（见 B-1） |
| **04** | 接下来去哪？ | D pathways | `Where to go next` + 2 卡 | 2 列卡 | 卡内链接 | 无 | 🗑️ **建议删除** |
| **05** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

#### 🗑️ B-1｜视口 03（C galleryAnswer）：答案是重复的（自我说明段）

**位置**：`gallery/page.tsx:92-123`，`aria-labelledby="gallery-answer-title"`，
标题 `galleryAnswer.heading`（来自 `content/gallery.ts:23`：
`"A fitment reference, not a catalogue"`）+ 4 条 `galleryAnswer.points`。

**它回答的问题**：「这些案例该怎么理解？」

**为什么答案是重复的** ——
**这一段是「使用说明」（meta），不是新事实。**
它的标题 `A fitment reference, not a catalogue` 是**对页面性质的声明** ——
而**页面本身（B 段的筛选网格 + 每张卡的标注）已经在回答这个问题**：
用户看到筛选器与「Completed builds」网格，自然理解这是一份参考集。

**更关键的是**：`/gallery` 的核心问题按 §0.5.2 判断是
「有没有真实装车案例」—— C 段**不提供新案例，只解释已有案例**。

**规格怎么说**：规格里**没有 `/gallery` 的独立页面规格**
（`PAGE-SPECS/` 下没有 gallery.md），所以无规格依据。
但 `index-home.md` §3.1 对 `<GalleryBand>` 的处置理由可类比：
> **`<GalleryBand>`** ❌ **下线** —— 首页无「案例段」；`/gallery` 素材未就绪

**⚠️ 诚实说明**：C 段的 4 条 points 中，**可能有 1–2 条是真正的新事实**
（例如「我们只发布能核实的装车」这类证据纪律声明）。
**建议先读 `content/gallery.ts` 的 `galleryAnswer.points` 逐条判断** ——
**若其中任一条是「我们不会做什么」的边界声明，则它是新答案，应保留**；
**若全是「怎么读」的说明，则整段删除。**

**处理建议**：
1. **逐条审查 `galleryAnswer.points`**：
   - 有边界/纪律声明 → **把该条并入 B 段尾部**（一行），删除 C 段
   - 全是使用说明 → **整段删除**
2. 无论哪种，C 段**不需要一个满屏的 section**。

**改动量**：**小**。

---

#### 🗑️ B-2｜视口 04（D pathways）：答案是重复的

**位置**：`gallery/page.tsx:127-167`，`Where to go next` + 2 卡。
与全站 7 处同形。**建议删除**，并入 `DealerCta`。

**改动量**：**极小**。

### C. `/gallery`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `gallery/page.tsx:127-167` D pathways | 「接下来去哪？」 | **紧接其后的 `DealerCta` 已给出唯一答案**。 |
| `gallery/page.tsx:92-123` C galleryAnswer（**需逐条审查**） | 「怎么读这些案例？」 | **是对页面性质的使用说明**，不是新案例。B 段的筛选网格本身已回答「这是什么」。**但 4 条 points 里可能有边界声明 → 需先读 `content/gallery.ts` 确认，再决定删除或并入 B 段。** |

### D. `/gallery` 一句总评

**需小修**。前两段（Hero + 网格）是全站最干净的两个视口之一，
后两段是常见的冗余。**C 段需逐条审查 points 后再定处置。**

---

## 18. `/fitment`（适配索引）

**代码事实**：3 段 —— A Hero → B `platformFitments` 平台卡网格 + 一句 `verifiedNote` →
`DealerCta`。
规格（`PAGE-SPECS/fitment/index.md` §1）描述的是**三条切法线**
（`/fitment/[vehicle]` / `/fitment/pcd/[pcd]` / `/fitment/size/[size]`）的**八段骨架**，
`/fitment` 索引页本身不在规格范围内。

### A. 视口划分表

| 视口 | 核心问题 | 含哪些段 | 主要信息 | 主要视觉 | 主要行动 | 次要行动 | 判定 |
|---|---|---|---|---|---|---|---|
| **01** | 这里是什么？ | A Hero | H1 `Fitment by Platform` + 一段说明 | 深色径向橙光 | `Send your vehicle details` → `/contact` | `Browse designs` → `/gallery/wheels` | ✅ 合规 |
| **02** | 你们为哪些平台做过？ | B 平台卡 + `verifiedNote` + 「If your platform is not listed…」 | `Platform` eyebrow + 平台名 + `heroLine` + 车型 chip 列 | 3 列卡 | 卡内链接 | 无 | ✅ 合规 |
| **03** | 怎么询盘？ | `DealerCta` | 通用收口 | 橙底 | `Request a quote` | email | ✅ 合规 |

### B. 违规项逐条说明

**无 🔴 / ⚠️。**

#### 🗑️ B-1｜（低置信度建议）视口 02 尾部的 `verifiedNote` 句

**位置**：`fitment/page.tsx:124-131`。

内容：`{fitmentPageCopy.verifiedNote} If your platform is not listed, send us
the chassis code and we will build a reference for it.`

**它回答的问题**：「我的平台不在列表里怎么办？」

**为什么可能重复**：
这一句的**前半部分 `verifiedNote` 放在平台卡下方**是合理的
（说明数据的核实口径），**但后半句「If your platform is not listed, send us
the chassis code」重复了视口 01 的主 CTA**
（`Send your vehicle details` → `/contact`，`:63-66`）——
**同一个行动，同页两个入口。**

**⚠️ 诚实标注**：这一条的置信度较低 ——
`verifiedNote` 很可能包含**证据纪律声明**（如同 `/safety-tires` 的开放问题框），
**那部分是新答案，必须保留**。建议**只删「If your platform is not listed…」
这一句**（行动重复），**保留 `verifiedNote` 本体**。

**改动量**：**极小**（删 1 句）。

### C. `/fitment`「无新答案」段清单

| 位置 | 它回答的问题 | 为什么答案是重复的 |
|---|---|---|
| `fitment/page.tsx:127-131`（尾部一句） | 「我的平台不在列表里怎么办？」 | **视口 01 的主 CTA `Send your vehicle details` → `/contact` 已经给了同一个答案**（`:63-66`）。**只删这一句，保留 `verifiedNote` 本体。** |

### D. `/fitment` 一句总评

**需小修**（轻微）。这是全站视口最少的页面（3 个），
**结构上最接近 §0.5.1 的理想形态** —— 每个视口一个问题、没有冗余段。
唯一问题是尾部一句行动与 Hero 主 CTA 重复。

**⚠️ 更大的缺口（非视口问题，仅记录）**：
规格要求的 `/fitment/[vehicle]`、`/fitment/pcd/[pcd]`、`/fitment/size/[size]`
**三条切法线在 `src/app/` 下只有 `/fitment/[platform]` 一个路由**，
且本索引页只有平台卡 —— **规格的核心内容（八段骨架 × 三条线）大量缺失**。
这是「缺」而非「违规」。

---

# 附录 A：全站「无新答案」段汇总

**共 24 条**，按模式分四类。

## A-1｜模式一：「Where to go next / Keep exploring」路由段（**8 条，最普遍**）

**共同特征**：位置都在**页面倒数第一段**，**紧跟 `DealerCta` 之前，标题叫
「Where to go next」（或 `Keep exploring`）**，内容 2–3 张卡，每卡一个链接。

**共同问题**：**紧接其后的 `DealerCta` 回答的是同一个问题（「接下来去哪」），
且它是更强的答案（橙色信号 + 明确行动）。** 三张卡是弱化的平行分流，
在用户决策临界点上提供了额外的出走理由。

| # | 位置 | 卡片数 | 建议 |
|---|---|---|---|
| 1 | `dealers/page.tsx:342-382` | 3 | 删除；必要入口并入 `DealerCta` 次级文字链 |
| 2 | `dealers/private-label/page.tsx:327-367` | 3 | 同上 |
| 3 | `about/page.tsx:307-347` | 3 | 同上 |
| 4 | `products/page.tsx:221-263`（Related resources） | 3 | 同上 |
| 5 | `contact/page.tsx:282-334`（Read first pathways） | 2–3 | 同上 |
| 6 | `resources/page.tsx:148-188` | 3 | 同上；并给 `DealerCta` 传定制 props |
| 7 | `gallery/page.tsx:127-167` | 2 | 同上 |
| 8 | `ev-components/page.tsx:248-260`（RouteBlock） | 3 | 同上（并入 `#engineering-eval` 的 secondary） |
| 9 | `custom-aluminum/page.tsx:360-368`（RouteBlock） | 3 | 同上（`CrossLink` 已有该入口） |
| 10 | `safety-tires/page.tsx:301-313`（RouteBlock） | 3 | 同上 |

> **实际 10 处**（含 3 处 `RouteBlock` 形态）。这是全站**唯一的系统性冗余**，
> 且修法完全一致 —— **可以在一次重构里全部处理**（工作量：小）。
>
> **🔴 但需注意一个反例**：`/dealers` 的 H 段与 `/dealers/private-label` 的 G 段
> 若被删除，**必须确认 `DealerCta` 的次级位能承接 `Private label` 与
> `Custom development` 两个关键入口** —— 否则会切断这两条业务线的入口链。
> **删除前需检查 `DealerCta` 的 props 是否支持多个次级链接**
> （现状 `dealer-cta.tsx:51-58` 只支持一个 email 文字链）。

## A-2｜模式二：「自我解释 / 使用说明」段（**3 条**）

**共同特征**：内容是对**页面自身性质**的声明或对**用户该怎么用它**的说明，
**不提供外部事实**。

| # | 位置 | 它回答的问题 | 为什么重复 |
|---|---|---|---|
| 11 | `contact/page.tsx:173-189` PLACEHOLDER 警示框 | —— | **给施工方看的元信息**，不回答用户任何问题。**上线前必须删除** |
| 12 | `gallery/page.tsx:92-123` galleryAnswer | 「怎么读这些案例？」 | **是使用说明**。B 段筛选网格本身已回答「这是什么」。**⚠️ 需先逐条审查 `content/gallery.ts` 的 points —— 若有边界声明则保留该条** |
| 13 | `products/page.tsx:58-60` `supporting` 句 | 「这一页怎么用？」 | **页面结构本身已回答**；`lede` 已说清实质信息 |

## A-3｜模式三：「同页双入口」（**3 条**）

**共同特征**：同一页面上**两个入口指向同一个目的地**。

| # | 位置 | 重复的入口 |
|---|---|---|
| 14 | `dealers/page.tsx:81` Hero 次 CTA `Private label programme` ↔ `:159-171` programme 卡内链 | 两者都 → `/dealers/private-label` |
| 15 | `wheels/page.tsx:45-48` 面包屑 `/products` ↔ `:75-77` `Compare families` | 两者都 → `/products` |
| 16 | `fitment/page.tsx:63-66` Hero 主 CTA ↔ `:127-131` 尾部句 | 两者都 → `/contact`（发车架号） |

## A-4｜模式四：结构性冗余段（**4 条**）

| # | 位置 | 类型 | 建议 |
|---|---|---|---|
| 17 | `resources/page.tsx:101-144` B2 reference sets | 与 02 段并列回答「有哪些内容」 | 并入 02（做成可点选分类条） |
| 18 | `thank-you/page.tsx:141-198` ③ Urgent contact | 与 02 段是同一问题的两面（「接下来会发生什么」） | **合并进 02**（不是删除） |
| 19 | `wheels/page.tsx:167-180` C 计数条 | 规格把它放在 01 Hero 的数据说明行里 | 并入 Hero 的 `supporting` |
| 20 | `capabilities/page.tsx:214-246` ⑤ Capacity figures | 全部 `isPlaceholder: true` | **按纪律整段不上线**（证据纪律，非视口律） |

## A-5｜「合并而非删除」清单（**4 条**，独立于上面 20 条）

**这些段回答真实的新问题，不该删，但应合并进相邻段以释放一整屏。**

| # | 位置 | 合并进 | 释放的屏 |
|---|---|---|---|
| 21 | `ev-components/page.tsx:206-219` ⑥ QualityEvidence | ⑤ capability 段尾部 | 1 屏 |
| 22 | `custom-aluminum/page.tsx:267-292` ⑥ typical parts | ⑤ capability 段尾部 | 1 屏 |
| 23 | `safety-tires/page.tsx:203-227` ⑤ capability | ④ mechanism 段尾部 | 1 屏 |
| 24 | `capabilities/page.tsx:214-244` ④ 下半 `processHardEvidence` | 拆成独立 section（**反向操作：从合并变拆分**） | —— |

---

# 附录 B：需要拆分的视口（按工作量排序）

**「拆分」= 把一个视口里竞争的多件事分成多个视口。**

| 优先级 | 页面 / 视口 | 竞争的目标 | 拆法 | 工作量 | 依据 |
|---|---|---|---|---|---|
| **P0** | `/` 视口 01（Hero） | 品牌定位 vs 四条产品线入口（4 卡 + 2 CTA = 7 个出口） | **删右栏 `<nav>`（`home-hero.tsx:79-90`）→ 成为独立视口 02** | **小** | `DESIGN.md` §0.5.1；`index-home.md` §2① 末行「Hero 只回答『这是什么公司』一句话」 |
| **P0** | `/products` 视口 02 | 「三条轮毂」的旧定位 vs 四条线定位 | **重写 `productFamilies` 为四条线 + 改 4 列栅格** | **大**（波及 `/products/[slug]`、`/contact`） | `products/index.md` §0、§4.2 |
| **P0** | `/` 视口 02（`ProductShowcase`） | 轮毂三分类 vs 四条线入口 | **改造为 `<ProductFamilyGrid>` 的容器壳** | **中** | `index-home.md` §3.1 |
| **P1** | `/contact` 视口 02/03 | 填表 vs 直接联系 vs 占位警示 vs 填写建议（**4 件事同屏**） | **把 `contactDetailsCopy` 白卡移出 B 段成为独立视口；删 PLACEHOLDER 框** | **中** | `contact.md` §1（五段式，④ 联系块独立成段） |
| **P1** | `/dealers` 视口 05/06 | 货运 vs 可追溯性（**同一 section 内两个 H2**） | **拆成两个 `<section>`** | **小** | `dealers/index.md` §1（⑦⑧ 为两段，且 ⑧ 有条件删除前置） |
| **P1** | `/capabilities` 视口 04/05 | 怎么检验 vs 公差多少 | **把 `processHardEvidence` 拆成独立 `<section>`，H3 → H2** | **小** | `DESIGN.md` §0.5.1；`capabilities.md` §2④ |
| **P2** | `/products/wheels` 视口 01 | 「换一批看」vs「现在报价」 | **删 `Request a quote`；删 `Compare families`（面包屑已有）** | **极小** | `products/wheels.md` §2① 末行「不要在这块加 CTA」 |
| **P2** | `/products` 视口 04（Guidance） | 4 步各带 1 个链接 = 4 个并列行动（含 1 个自链接） | **只留第 01 步链接，其余改纯文本；删自链接 `/products`** | **小** | `DESIGN.md` §0.5.1 |
| **P2** | `/products/wheels/[sku]` 视口 01 | 询盘 vs 「回我来的地方」（面包屑已承担） | **删次 CTA `About {family.name}`；需要则移入面包屑** | **小** | `[model].md` §2①（只规定面包屑） |
| **P3** | `/dealers` 视口 03（programmes） | 3 张卡 3 个出口 + 与 Hero 次 CTA 重复 | **只留 `Private label` 链接（且须与 Hero 二选一）；其余改纯文本** | **小** | `DESIGN.md` §0.5.1 |

**工作量为「极小/小」的 6 项**（P2–P3 + 部分 P1）**可以在一次提交里全部完成**，
它们合计消除了全站 3 处 🔴 中的 1 处、10 处 ⚠️ 中的 5 处。

**「大」的只有 1 项**（`/products` 数据重写），且它是**施工阻塞的依赖项**
（`products/index.md` §6 阻塞 #2 已登记）。

---

## 附录 B-2：全站 🔴 违规一览（3 处）

| # | 页面 | 视口 | 竞争的目标 | 规格判据 |
|---|---|---|---|---|
| 1 | `/` | 01 Hero | 品牌定位 vs 四产品入口（7 出口 vs 上限 3） | `index-home.md` §2① 末行 |
| 2 | `/` | 02 `ProductShowcase` | 轮毂三分类 vs 四条线定位（**与视口 01 自相矛盾**） | `index-home.md` §0、§3.1 |
| 3 | `/products` | 02 FamilyGrid | 三条轮毂 vs 四条产品线 | `products/index.md` §0、§4.2 |

**三处违规全部是同一个根因**：
**`content/products.ts` 与 `ProductShowcase` 仍是竞品的「轮毂三分类」底本，
而 `homepage-hero.tsx` 的四条线已经是目标态。**
**→ 修 `products.ts` 与 `product-showcase.tsx`，三处 🔴 一次清零。**

---

## 附录 C：审查纪律说明

**本报告的三条自我约束**：

1. **合规就说合规。** 18 个页面中判定「合规」的有 `/custom-development` 与
   `/request-a-quote` 两页；`/fitment`、`/dealers/private-label`、
   `/products/custom-aluminum` 等页的多数视口判为 ✅。
   **没有为了凑数把正常页面判成违规** —— 83 个视口里 71% 合规。

2. **只说能证明的。** 每条判定都指到了规格章节（如 `index-home.md` §2①）
   或代码位置（如 `home-hero.tsx:79-90`）。**标注了 3 条置信度较低的建议**
   （`/fitment` 尾部句、`/gallery` 的 galleryAnswer、`/products` 的 SKU callout），
   并说明了「需先读某文件逐条确认」再决定处置。

3. **与规格的分歧如实标注。** 一处明确分歧：
   **`products/index.md` §1 要求删除 FAQ 段，本报告建议保留。**
   理由：判据是 §0.5.2 的「删掉它会缺少什么答案」，
   而 FAQ 回答的问题（MOQ / 交期 / 贴牌）在前六段里没有回答过 →
   **规格删它是因为「竞品有」，但判据要求看「有没有新答案」。**
   已在第 2 节 B-3 中显式记录。

**未覆盖范围**（不在本次扫描清单内，未审查）：
`/products/[slug]`、`/manufacturing`、`/gallery/wheels`、`/gallery/finishes`、
`/resources/[slug]`、`/resources/bolt-patterns/*`、`/tools/*`、`/support/*`、
`/fitment/[platform]`。
