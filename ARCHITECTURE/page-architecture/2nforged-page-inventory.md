# 2N Forged 全站页面清单 —— 我们的搭建底本

> **用途**：丰怀站点的页面架构**以 2N Forged 为底本**建立，再结合我们的业务改造。
>
> 本文件是**竞品事实的完整记录**（12 页 / 全部 section / 每段在讲什么），
> 它是 `../page-architecture/README.md` 的上游依据。
>
> **纪律**：可借鉴**页面结构与信息层级**；不得搬运**文案 / 图片 / 品牌标识**（DEC-010）。

- 建立日期：2026-10-01
- 数据来源：兄弟项目 `深圳公司的独立站搭建/docs/site-capture/2nforged/`
  （708 MB / 222 文件，2026-10-01 采集）
- 采集方式：Playwright 1.63.0 × 4 断点（1440 / 1280 / 768 / 390）
- **产物对账**：12 页 × 4 断点 = 96 张 PNG ＋ 24 份结构 JSON ＋ 48 张标注图，零缺件

---

## 0. 我们手上已有什么（别重复劳动）

兄弟项目已经做完了**全套逆向**，本仓库直接复用：

| 素材 | 位置 | 内容 |
|---|---|---|
| **结构 JSON** | `raw/<page>/structure-1440.json` ｜ `-390.json` | 每 section 的坐标、尺寸、网格列数、gap、标题排版、CTA、图片比例、表单字段、筛选元素 |
| **原始截图** | `raw/<page>/{1440,1280,768,390}-*.png` | 96 张，含首屏与整页长图 |
| **红笔标注** | `annotated/<page>-reverse-analysis-{1440,390}.png` | **2N 在做什么** —— 分区边界、栅格、层级、交互 |
| **绿笔标注** | `annotated/<page>-fenghuai-redesign-{1440,390}.png` | **丰怀保留/修改什么** —— 逐条 KEEP / CHANGE（编号与红图一一对应） |
| 采集脚本 | `capture.mjs` / `annotate.mjs` | 可重跑（采集 7.5 min ＋ 标注 1.5 min） |
| 标注规范 | `ANNOTATION-SPEC.md` | 断点、标注维度、转化规则 |

> ⚠️ **WAF 坑**：自定义 Chrome UA 会 **403**。脚本必须用 Playwright 默认 UA。

---

## 1. 竞品全站页面清单（12 页）

| 优先级 | 页面 | URL | 1440 高度 | section 数 |
|---|---|---|---|---|
| **P0** | 首页 | `/` | 3,331 px | **4** |
| **P0** | 产品目录 | `/products/` | 5,096 px | **1**（内含 4 段） |
| **P0** | 轮毂画廊 | `/wheel-gallery/` | 5,535 px | **3** |
| **P0** | 制造工艺 | `/process/` | 8,397 px | **1**（内含滑块） |
| P1 | 关于我们 | `/about-us/` | 7,119 px | **9** |
| P1 | 单片锻造 | `/monoblock-wheels/` | **13,941 px** | **17** |
| P1 | BMW M 适配 | `/bmw-m-wheels/` | 5,940 px | **10** |
| P1 | 双片锻造 | `/2-piece-forged-wheels/` | 9,401 px | **9** |
| P1 | 资源中心 | `/forged-wheel-resources/` | 3,804 px | **3** |
| P1 | 经销商 | `/custom-forged-wheels-for-dealers/` | **12,880 px** | **14** |
| P1 | 贴牌 | `/private-label-wheels/` | **13,953 px** | **16** |
| P1 | 联系我们 | `/contact-us/` | 1,520 px | **1** |

**合计 12 页 / 88 个 section。**

### 1.1 竞品没有但我们需要的

| 缺失 | 说明 |
|---|---|
| `/dealers/` | manifest 里列了但**线上不存在** |
| `/oem-wheel-specs/` | 同上 |
| 车型适配页 | 只有 `bmw-m-wheels` **一个**，无其他车系 |
| 产品单品页 | 无 `/products/[model]` —— 竞品把目录压在一页 |

→ **这三块是我们的增量**（尤其单品页，我们有 1018 个型号）。

### 1.2 竞品的四个「设计系统」

竞品 12 页并非各自设计，而是**复用四套系统**（这是架构上最值得学的）：

| 系统 | 类名前缀 | 用在 | 特征 |
|---|---|---|---|
| **首页系统** | `hero` / `trust-strip` / `gallery-hero` | 仅首页 | 全屏 hero，唯一使用 `hero` 类 |
| **长文落地页系统** | `dealer-hero` / `dealer-section` | about-us ｜ dealers ｜ private-label | 全段 `data-reveal`，结尾统一 `dealer-final-cta` |
| **产品解释页系统** | `two-piece-*` | monoblock ｜ 2-piece | 深色 hero ＋ 明暗交替长段 |
| **画廊系统** | `gallery-page-hero` / `gallery-albums` | wheel-gallery ｜ gallery | 筛选 ＋ 网格 |

**「一个系统服务多页」是这个站可维护的原因。** 我们要照抄这个思路。

---

## 2. 逐页 section 详解

### 2.1 首页 `/` —— 4 段

| # | y | 尺寸 | 标题 | 在讲什么 |
|---|---|---|---|---|
| 0 | 0 | 1440×1000 | *Custom Forged Wheels Engineered for Aggressive Fitment* | 全屏 hero（`min-height:100svh`），`#top` |
| 1 | 1000 | 1440×401 | — | **trust-strip** 能力带（`data-reveal-group` 错峰） |
| 2 | 1401 | 1440×1015 | *YOUR CUSTOM FORGED WHEEL PARTNER* | 产品预览 ＋ 收藏集 |
| 3 | 2416 | 1440×590 | *GALLERY* | 画廊引导带 |

**值得学**：首页只有 4 段、3,331 px。**极短。** 不堆内容，靠 hero 一句话 ＋ 能力带 ＋ 产品预览 ＋ 画廊入口就收尾。

**我们要改**：丰怀是**四条产品线**，首页 4 段装不下。但**不要把 4 段变 12 段** —— 建议 7–8 段（见主文档 §2.1）。

---

### 2.2 `/products/` —— 1 段（4,770 px）

| # | 标题 | 在讲什么 |
|---|---|---|
| 0 | *CUSTOM FORGED WHEELS* ／ *START WITH WHAT YOU KNOW* | **单段巨型目录页**：起步引导 → 路由 → 适配支持 → FAQ（26 个 H2，16 张图，4 个 CTA） |

**关键观察**：竞品把**整个目录压在一页**（26 个 H2）。**这是它最大的架构缺陷** ——
我们不该学。原因：

- 无法按型号做 SEO（没有独立 URL）
- 无法按型号派发询盘（拿不到具体产品上下文）
- 1018 个型号压一页会爆炸

→ **我们改为 `/products/wheels`（目录）＋ `/products/wheels/[model]`（单品）两层。**

---

### 2.3 `/wheel-gallery/` —— 3 段

| # | y | 尺寸 | 标题 | 在讲什么 |
|---|---|---|---|---|
| 0 | 113 | 1440×302 | *WHEEL GALLERY* | 页头（`section-light`） |
| 1 | 447 | 1432×**4762** | *Filter* ／ *Filter Designs* | **筛选 ＋ 网格**，32 个 H2，21 张图，**10 个 CTA** |
| 2 | 0 | 0×0 | — | （空 section，疑似采集噪声） |

**值得学**：**整页就是筛选器 ＋ 网格**，4762 px 里全是产品。
CTA 密度极高（10 个）—— 说明**每个卡片都带询盘入口**。

**竞品真实缺陷**（采集实测）：**768 断点横向溢出** —— 筛选栏与网格冲突。
→ 我们做筛选器时**必须专门测平板竖屏**。

---

### 2.4 `/process/` —— 1 段（8,072 px）

| # | 标题 | 在讲什么 |
|---|---|---|
| 0 | *FORGED WHEEL MANUFACTURING PROCESS* ／ *RAW FORGINGS.* | **单段超长工艺页**，内置滑块分步（10 个 H2，11 张图，0 个 CTA） |

**值得学**：工艺页用**滑块分步**而不是堆段落 → 视觉上是一段，内容上是 10 步。

**⚠️ 注意**：**0 个独立 CTA**。竞品的工艺页**不带转化** —— 这是个可改进点，
丰怀的工艺页应该在结尾带上询盘入口。

---

### 2.5 `/about-us/` —— 9 段

| # | 标题 | 在讲什么 |
|---|---|---|
| 0 | *Factory-Backed Custom Forged Wheel Manufacturer* | hero |
| 1 | *BUILT FOR INTERNATIONAL CUSTOM WHEEL PROJECTS* | 能力带 |
| 2 | *HOW 2N TURNS UPSTREAM PARTS INTO A FINISHED WHEEL* | 供应链说明 |
| 3 | *A MANUFACTURING PARTNER FOCUSED ON REAL PROJECTS* ／ *CNC PRODUCTION ENVIRONMENT* | 工厂实景 |
| 4 | *PROJECT DETAILS CONFIRMED BEFORE PRODUCTION* | 信任（先确认再生产） |
| 5 | *DESIGNED FOR BUYERS WHO NEED MORE THAN A CATALOG* | 定位 |
| 6 | *FACTORY DETAILS BEHIND EVERY CUSTOM ORDER* | 质量 |
| 7 | *Where to go after you know the factory side* | **路由段**（下一步去哪） |
| 8 | *READY TO DISCUSS A CUSTOM FORGED WHEEL PROJECT* | 结尾 CTA |

**值得学**：第 7 段「你已经了解工厂了，接下来去哪」—— **显式的路径引导**，
避免用户在长页末尾迷路。**这个模式我们要用。**

---

### 2.6 `/monoblock-wheels/` —— 17 段（13,941 px，最长页）

**这是竞品的「产品解释页」母版**，17 段结构：

| # | 标题 | 在讲什么 |
|---|---|---|
| 0 | *Custom Monoblock Forged Wheels* | hero（760px，比其他页矮） |
| 1 | *Monoblock Forged Wheels Explained* | **定义**（这是什么） |
| 2 | *WHY CHOOSE CUSTOM MONOBLOCK FORGED WHEELS?* ／ *VEHICLE-SPECIFIC FITMENT* | 为什么选 |
| 3 | *HOW CUSTOM MONOBLOCK WHEELS ARE MADE* ／ *Forged blank* | 怎么做 |
| 4 | *ENGINEERED AS A SINGLE STRUCTURE* | 技术优势 |
| 5 | *COMPARE MONOBLOCK WITH 2-PIECE AND SPECIALTY 3* ／ *MONOBLOCK STRENGTH* | **横向对比** |
| 6 | *FORGED MONOBLOCK VS CAST MONOBLOCK* | **工艺对比**（锻造 vs 铸造） |
| 7 | *FEATURED MONOBLOCK BUILDS* | 案例 |
| 8 | *COMMON MONOBLOCK FITMENT QUESTIONS* | 适配 FAQ |
| 9 | *MATCH MONOBLOCK FORGED WHEELS TO THE VEHICLE* ／ *PERFORMANCE SEDANS AND COUPES* | 按车型匹配 |
| 10 | *CUSTOM MONOBLOCK FORGED WHEELS START WITH VEHICLE* ／ *MEASURE THE STARTING POINT* | **测量引导** |
| 11 | *HOW MUCH DO MONOBLOCK FORGED WHEELS COST?* | **价格问题** |
| 12 | *START WITH WHAT YOU KNOW* | 起步引导 |
| 13 | *HOW TO START A CUSTOM MONOBLOCK PROJECT* ／ *Step 1* | **步骤** |
| 14 | *MONOBLOCK WHEELS FAQ* | FAQ |
| 15 | *CHOOSE THE RIGHT FORGED WHEEL CONSTRUCTION PATH* | 路由（选哪条工艺） |
| 16 | *GET A CUSTOM MONOBLOCK FITMENT RECOMMENDATION* | 结尾 CTA（1440 满宽） |

**这是全站最有价值的一页 —— 它是一个完整的「产品解释模板」。**

拆解它的逻辑链：

```
定义 → 为什么选 → 怎么做 → 技术优势
  → 横向对比（vs 2-piece/3-piece）
  → 工艺对比（vs 铸造）
  → 案例 → 适配FAQ → 按车型匹配 → 测量引导
  → 价格 → 起步引导 → 步骤 → FAQ
  → 路由 → CTA
```

**⚠️ 第 11 段「HOW MUCH DO ... COST?」值得注意。**
竞品**公开谈价格**。但丰怀是**询盘站不发布价格**（DEC-003）→
**这一段要改造**：不谈数字，谈「什么影响价格」（尺寸/工艺/数量/表面处理）。

**⚠️ 竞品真实缺陷**：第 10 段 1,529 px、第 15 段 1,324 px、第 16 段 521 px
—— 长页尾部节奏失衡。我们要控节奏。

---

### 2.7 `/bmw-m-wheels/` —— 10 段（车型适配模板）

| # | 标题 | 在讲什么 |
|---|---|---|
| 0 | *BMW M WHEELS* | hero（620px） |
| 1 | *FIND A FORGED WHEEL DIRECTION THAT WORKS WITH...* | 引导 |
| 2 | *BMW M QUICK PATHS* ／ *G87 M2* | **快捷路径**（按具体车型） |
| 3 | *BMW M2, M3 & M4 WHEEL FITMENT REFERENCES* | **适配参考** |
| 4 | *CUSTOM FORGED WHEEL DESIGNS FOR BMW M2, M3 & M4* | 该车型的设计 |
| 5 | *DESIGN DIRECTIONS BMW M OWNERS USUALLY COMPARE* ／ *Clean performance fitment* | 设计方向 |
| 6 | *BMW M FITMENT & SPEC RESOURCES* | 资源 |
| 7 | *FROM BMW M WHEEL IDEA TO PRODUCTION-READY SPEC* | 从想法到规格 |
| 8 | *CHOOSE CONSTRUCTION OR DEALER PATH* | 路由 |
| 9 | *BMW M CUSTOM WHEEL FAQ* | FAQ |

**这是竞品唯一的车型适配页**（16 个 CTA，密度最高）。

**⚠️ 对我们：暂缓。**
`assets/` 里 `suitableVehicles` **全空（0/1349）** → 我们**没有适配数据**。
按上架门槛（DEC-013），**无数据的页面不做**。

→ 竞品这套模板**记录下来备用**，等工程补齐适配数据再启用。

---

### 2.8 `/2-piece-forged-wheels/` —— 9 段

| # | 标题 | 在讲什么 |
|---|---|---|
| 0 | *CUSTOM 2-PIECE FORGED WHEELS* | hero |
| 1 | *WHAT IS A 2-PIECE FORGED WHEEL?* ／ *2-PIECE VS MONOBLOCK VS 3-PIECE* | 定义 ＋ 对比 |
| 2 | *WHY CHOOSE 2-PIECE FORGED WHEELS?* ／ *CUSTOM DEEP LIP FITMENT* | 为什么选 |
| 3 | *2-PIECE FORGED WHEEL FITMENT EXAMPLES* ／ *PORSCHE 911...* | 案例（1,506px） |
| 4 | *BUILT TO YOUR EXACT SPECIFICATIONS* ／ *AVAILABLE SIZES: 18"–24"* | 规格范围 |
| 5 | *POPULAR 2-PIECE FORGED WHEEL DESIGNS* ／ *DEEP LIP MESH* | 设计 |
| 6 | *2-PIECE FORGED WHEEL FAQ* | FAQ |
| 7 | *CHOOSE THE RIGHT FORGED WHEEL CONSTRUCTION PATH* | 路由（1,794px） |
| 8 | *REQUEST A QUOTE FOR CUSTOM 2-PIECE FORGED WHEELS* | CTA |

**与 monoblock 页对比**：同为「产品解释页系统」，但 monoblock 17 段、
2-piece 9 段 —— **同样的系统，按内容多少自由伸缩**。这正是模块化的价值。

---

### 2.9 `/forged-wheel-resources/` —— 3 段（内容中心）

| # | y | 尺寸 | 标题 | 在讲什么 |
|---|---|---|---|---|
| 0 | 0 | 1180×594 | *FORGED WHEEL RESOURCES FOR DEALERS AND WHEEL SHOPS* | 页头 |
| 1 | 616 | 1180×161 | *Resource Topics* | 分类条（窄） |
| 2 | 811 | 1180×**2667** | *ALL CATEGORIES* ／ *Order clarity path* | **分类列表** |

**值得学**：**索引页而非长文页** —— 3 段解决。7 个 H2、16 张图、11 个 CTA。

→ **对应我们的 `/insights`。** 直接采用这个「页头 ＋ 分类条 ＋ 列表」三明治结构。

---

### 2.10 `/custom-forged-wheels-for-dealers/` —— 14 段（12,880 px）

**经销商页母版。** 全段 `data-reveal`。

| # | 标题 | 在讲什么 |
|---|---|---|
| 0 | *Sell custom forged wheels without stocking them first* | **最强主张**：不用囤货 |
| 1 | *IF YOU'VE ONLY SOLD STOCK WHEELS BEFORE, START HERE* | 对号入座（新入行经销商） |
| 2 | *VIN + TARGET WHEEL SIZE IS ENOUGH TO START* | **降低门槛**（只要 VIN ＋ 目标尺寸） |
| 3 | *THE FOUR RISKS EVERY WHEEL DEALER CARRIES* ／ *CAPITAL STUCK IN STOCK* | **痛点：四个风险** |
| 4 | *WHAT THIS DEALER SUPPLY PROGRAM ACTUALLY GIVES YOU* | 方案 |
| 5 | *SINGLE-SET SHIPPING GETS EXPENSIVE. DEALERS CAN...* | 物流成本 |
| 6 | *HOW A DEALER ORDER RUNS* | 订单流程 |
| 7 | *WHAT THE DEALER CAN TRACE BEFORE SHIPMENT* | **可追溯性**（1,038px） |
| 8 | *WHAT CAN YOU SHOW YOUR CUSTOMER BEFORE SHIPMENT?* | 给经销商「能给客户的证据」 |
| 9 | *YOU STAY THE SELLER. 2N STAYS BEHIND YOU.* | **定位承诺**（不抢客户） |
| 10 | *WHEN YOUR DEALER ORDERS BECOME YOUR OWN WHEEL...* | 贴牌衔接 |
| 11 | *WHAT DO YOU SHOW BEFORE THE WHEELS EXIST?* | 下单前给客户看什么 |
| 12 | *DEALER QUESTIONS BEFORE THE FIRST ORDER* | FAQ（1,492px） |
| 13 | *YOUR SHELVES STAY LIGHTER. YOUR ORDER BOOK DOES...* | 收尾 CTA |

**这是全站结构最完整的一页。** 逻辑链极清晰：

```
强主张 → 对号入座 → 降门槛 → 痛点 → 方案
  → 物流 → 流程 → 可追溯 → 证据
  → 定位承诺 → 贴牌衔接 → 售前材料 → FAQ → 收尾
```

**★ 这一页的写法我们要重点学 —— 它全程在讲「你能得到什么」，而不是「我们多厉害」。**

---

### 2.11 `/private-label-wheels/` —— 16 段（13,953 px，最长）

**贴牌页母版。**

| # | 标题 | 在讲什么 |
|---|---|---|
| 0 | *Private Label Forged Wheels for Your Brand* | hero |
| 1 | *WHEN PRIVATE LABEL MAKES SENSE* ／ *THE SAME VEHICLE GROUPS KEEP COMING BACK* | **什么时候该贴牌** |
| 2 | *WHY PUT YOUR OWN NAME ON THE WHEEL?* | 为什么 |
| 3 | *THE QUESTIONS NOBODY WANTS TO ASK THE SUPPLIER* | **★ 攻心：没人敢问供应商的问题** |

（其余 12 段同 `dealer-section` 系统）

**★ 第 3 段「THE QUESTIONS NOBODY WANTS TO ASK THE SUPPLIER」是极高明的设计** ——
主动说出客户不好意思问的顾虑（比如「你会不会绕过我直接卖给我的客户」），
**把信任问题提前拆解**。这是 B2B 长文页的核心技巧，**值得直接学。**

---

### 2.12 `/contact-us/` —— 1 段（1,520 px）

| # | 标题 | 在讲什么 |
|---|---|---|
| 0 | *Request Wheel Quote* | **单段询盘页**：5 个 H2，2 张图，2 个 CTA |

**极简**：一个 section 解决。**我们要学这个克制** —— 询盘页就该短。

---

## 3. 从竞品提炼的六个可复用模式

| # | 模式 | 说明 | 我们用在哪 |
|---|---|---|---|
| **M1** | **一个系统服务多页** | `dealer-*` 一套服务 3 页；`two-piece-*` 一套服务 2 页 | 我们的四条产品线共用一套模板 |
| **M2** | **长页尾部必有「路由段」** | 「你已经了解 X 了，接下来去哪」 | 所有长页 |
| **M3** | **工艺/结构对比段** | monoblock vs 2-piece、锻造 vs 铸造 | 轮毂线核心段落 |
| **M4** | **对号入座段** | 「如果你是只卖过现货轮毂的，从这里开始」 | 经销商 / 贴牌页 |
| **M5** | **攻心段** | 「没人敢问供应商的问题」 | 贴牌页 |
| **M6** | **索引页用三明治** | 页头 ＋ 分类条 ＋ 列表（3 段解决） | `/insights` |

---

## 4. 竞品做错的地方（我们不要学）

| # | 问题 | 证据 | 我们的对策 |
|---|---|---|---|
| **A1** | **整个目录压一页** | `/products/` 单 section 4,770px、26 个 H2 | 拆成目录 ＋ 单品两级（我们有 1018 型号） |
| **A2** | **车型适配只有 BMW M 一个** | 12 页里只有 1 个车系页 | 有数据再做；无数据不做（DEC-013） |
| **A3** | **公开谈价格** | monoblock 第 11 段 *HOW MUCH DO...COST?* | 改谈「什么影响价格」（DEC-003 不发布价格） |
| **A4** | **工艺页零 CTA** | `/process/` 0 个独立 CTA | 工艺页结尾带询盘入口 |
| **A5** | **平板竖屏溢出** | wheel-gallery ＠768、dealers ＠768 | 筛选器必须专测 768 |
| **A6** | **长页尾部节奏失衡** | monoblock 尾部 1,529 / 1,324 / 521 px 跳变 | 控节奏，尾部逐步收束 |
| **A7** | **极高的 CTA 密度** | wheel-gallery 10 个、BMW 16 个 | 保留但要克制，避免骚扰感 |

---

## 5. ★ 我们的页面结构：竞品底本 ＋ 丰怀业务

### 5.1 映射总表

| 竞品页 | 我们的页 | 动作 |
|---|---|---|
| `/`（4 段） | `/` | **CHANGE** —— 4 段扩到 7–8 段（容纳四条产品线） |
| `/products/`（1 段巨型） | `/products` ＋ `/products/wheels` ＋ `/products/wheels/[model]` | **CHANGE** —— 一页拆三层 |
| `/wheel-gallery/` | `/products/wheels` 的筛选 | **MERGE** —— 与目录是同一批数据的两种视图 |
| `/process/` | `/capabilities` | **KEEP 结构 ＋ CHANGE 内容**（加 CTA） |
| `/about-us/`（9 段） | `/about` | **KEEP** —— 结构可直接用 |
| `/monoblock-wheels/`（17 段） | 轮毂线的**产品解释模板** | **KEEP 骨架 ＋ CHANGE 价格段** |
| `/bmw-m-wheels/`（10 段） | 车型适配页 | **HOLD** —— 无适配数据，暂不做 |
| `/2-piece-forged-wheels/`（9 段） | 另一条工艺解释页 | **KEEP** —— 与 monoblock 同系统 |
| `/forged-wheel-resources/`（3 段） | `/insights` | **KEEP** —— 三明治结构直接用 |
| `/custom-forged-wheels-for-dealers/`（14 段） | `/custom-development` | **KEEP 骨架 ＋ CHANGE 内容** |
| `/private-label-wheels/`（16 段） | `/dealers/private-label` | **KEEP 骨架 ＋ CHANGE 内容** |
| `/contact-us/`（1 段） | `/contact` `/request-a-quote` | **KEEP** —— 极简是对的 |

### 5.2 ★ 四条产品线的页面模板（我们的增量）

竞品是**单线（轮毂）**，我们**四条平行线**。所以需要一套**线级模板**：

```
产品线页 = ① 页头定位
         → ② 这条线是什么（定义）        ← 学 M2.6 第1段
         → ③ 给谁用 / 对号入座            ← 学 M4
         → ④ 我们能做什么（能力）
         → ⑤ 规格 / 型号（★ 有数据才做）
         → ⑥ 工艺/结构对比                ← 学 M3
         → ⑦ 常见问题 FAQ
         → ⑧ 路由（下一步去哪）            ← 学 M2
         → ⑨ 询盘 CTA
```

**四条线各自填充**：

| 段落 | 轮毂 | EV三电 | 铝制品 | 安全轮胎 |
|---|---|---|---|---|
| ① 定位 | ✅ | ✅ | ✅ | ✅ |
| ② 定义 | ✅ 有 | ⚠️ 语料 | ⚠️ 语料 | ⚠️ 语料 |
| ③ 对号入座 | ✅ | ✅ | ✅ | ✅ |
| ④ 能力 | ✅ | ✅ | ✅ | ✅ |
| ⑤ **型号/规格** | ✅ **1018 型号** | ❌ 无 | ❌ 无 | ❌ 无 |
| ⑥ 对比 | ✅ | ⚠️ 待写 | ⚠️ 待写 | ⚠️ 待写 |
| ⑦ FAQ | ✅ | ✅ | ✅ | ✅ |
| ⑧ 路由 | ✅ | ✅ | ✅ | ✅ |
| ⑨ CTA | ✅ | ✅ | ✅ | ✅ |

→ **其余三条线只出到「能力页」（①③④⑦⑧⑨），⑤⑥ 留空** —— 兑现上架门槛（DEC-013）。

### 5.3 我们比竞品多的一层：单品页

竞品没有 `/products/[model]`。我们有 **1018 个型号**，所以：

```
/products/wheels/[model]
  ├─ 面包屑 ＋ 型号
  ├─ 图库（文件名即产品代码）
  ├─ 摘要
  ├─ 规格表（逐 variant：size / PCD / ET / CB / 孔数 / finish）
  ├─ 工艺（有标注才显示）
  ├─ 相关型号
  └─ 询盘入口（携带型号 ＋ 已选规格）
```

**这是竞品没有的转化入口** —— 询盘能带上精确规格。

---

## 6. 待确认

| # | 事项 | 影响 |
|---|---|---|
| 1 | 竞品的**绿笔标注**（丰怀 KEEP/CHANGE）我们要不要逐张对照采纳？ | 页面改造细节 |
| 2 | 那 48 张标注图（526 MB）要不要复制进本仓库？ | 体积 vs 便利 |
| 3 | 竞品的**产品摄影纪律**（一机位/一角度/一背景）我们能否要求丰怀照做？ | 1018 型号的图质量 |
| 4 | 四条线的 ②③④⑦ 文案由谁写？ | 内容生产 |

---

## 附：复现与核对

```bash
# 抽取竞品 section 清单（本仓库自带脚本）
python3 resources/_extract_2n.py          # 人读
python3 resources/_extract_2n.py --json   # 机器读

# 重跑采集（在兄弟项目）
cd 深圳公司的独立站搭建/docs/site-capture/2nforged
node capture.mjs        # 7.5 min
node annotate.mjs --all # 1.5 min
```

**结构 JSON 查询示例**（不必重新看图）：

```bash
python3 -c "
import json
d = json.load(open('raw/monoblock-wheels/structure-1440.json'))
for s in d['sections']:
    print(s['index'], s['y'], f\"{s['w']}x{s['h']}\", [h['sample'] for h in s['headings']][:2])
"
```
