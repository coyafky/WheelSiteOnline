# 关于我们 Page 架构（`/about`）

> **本文件定义 `/about` —— 竞品的 `/about-us/`。**
>
> 底本 = [2N Forged `/about-us/`](https://2nforged.com/about-us/)
> （**9 段 / 7,119 px / 657 字**）

- 版本：v1.0
- 建立日期：2026-10-01
- 上位：`README.md` §2.12 ｜ `dealers-page.md`（同一 `dealer-*` 系统）

---

## 0. 这页的定位：**「工厂侧」的信任页，不是公司简介**

读完竞品这页，最重要的判断：

| 常见做法 | 竞品实际做的 |
|---|---|
| 公司历史、愿景、团队照片 | **「工厂这边到底是谁」** |
| 「我们成立于 X 年，秉承…」 | **「项目怎么被控制住的」** |
| 感性、励志 | **具体、可验证** |

**它的 H1 就定调了**：

> **Factory-Backed Custom Forged Wheel Manufacturer**
> （有工厂背书的定制锻造轮毂制造商）

**→ 关键词是 `Factory-Backed`（有工厂背书）。**
**这页不回答「我们是谁」，而是回答「你的订单背后有没有实体工厂」。**

⚠️ **对我们尤其重要** —— 因为**经销商页（`/dealers`）讲的是「怎么合作」，
关于页讲的是「工厂是不是真的」**。两页**不重复，是接力**。

---

## 1. 竞品实测：9 段逐段拆解

| # | 类名 | 高度 | 字数 | 背景 | H2 | 在讲什么 |
|---|---|---|---|---|---|---|
| 0 | `dealer-hero about-dealer-hero` | 1000 | 58 | **深色** `rgb(5,7,11)` | *Factory-Backed Custom Forged Wheel Manufacturer* | **定位** + 一句「我们不卖仓库目录」 |
| 1 | `about-capability-strip` | 530 | 53 | 白 | *BUILT FOR INTERNATIONAL CUSTOM WHEEL PROJECTS* | **★ 四个硬数字** |
| 2 | `about-supply-chain` | 582 | 102 | 透明 | *HOW 2N TURNS UPSTREAM PARTS INTO A FINISHED WHEEL* | **★ 坦白供应链** |
| 3 | `about-trust` | 1392 | 105 | 透明 | *A MANUFACTURING PARTNER FOCUSED ON REAL PROJECT CONTROL* | **3 卡 + 3 图** |
| 4 | `dealer-brand-section about-brand-section` | 690 | 74 | **深色** `rgb(30,41,59)` | *PROJECT DETAILS CONFIRMED BEFORE PRODUCTION* | 生产前确认 |
| 5 | `about-positioning` | 545 | 72 | 透明 | *DESIGNED FOR BUYERS WHO NEED MORE THAN A CATALOG WHEEL* | 定位筛选 |
| 6 | `about-quality` | 1116 | 70 | 透明 | *FACTORY DETAILS BEHIND EVERY CUSTOM ORDER* | **质量证据** |
| 7 | `about-next-paths` | 418 | 83 | 透明 | *Where to go after you know the factory side* | **★ 路由段（T7）** |
| 8 | `dealer-final-cta about-final-cta` | 521 | 40 | 透明 | *READY TO DISCUSS A CUSTOM FORGED WHEEL PROJECT?* | 收束 CTA |

**合计 9 段 / 657 字 —— 每段平均只有 73 字。**
**⚠️ 比经销商页（151 字/段）轻一半。** 这页是**证据页，不是说服页**。

---

## 2. ★ 三个「教科书级」的设计

### 2.1 ★★ 第 1 段：四个硬数字（`about-capability-strip`）

```
3,000        Wheels Monthly Production Capacity
6061-T6      Forged Aluminum Material
12,000-Ton   High-Pressure Forging Process
2 Primary Dealer Markets   North America and Middle East / GCC dealer programs
```

**四条全是可验证的硬指标。没有一个形容词。**

| # | 竞品的数字 | 我们能填吗 |
|---|---|---|
| 1 | 月产能 3,000 只 | ⚠️ **需丰怀确认** |
| 2 | 材料 6061-T6 | ✅ **语料库有** —— 「6061 铝合金与镁合金轮毂一体锻造成形」 |
| 3 | 12,000 吨锻压 | ⚠️ 语料有「**万吨锻造机**」（航鹏画册 P4）→ **10,000 吨**，但**是第三方来源** |
| 4 | 2 个主要市场 | ❌ **需丰怀确认出口市场** |

**⚠️ 第 3 条有坑**：语料库里的「万吨锻造机」出自**航鹏画册**（第三方品牌），
**不能直接当丰怀的设备写**。已列待确认。

**→ 四条里只有 1 条现在能填。这是这页最大的阻塞。**

### 2.2 ★★ 第 2 段：坦白供应链（`about-supply-chain`）

**这一段我认为是全页最聪明的。**

> *"Most custom forged wheel orders start with forged blanks and rim parts from **specialist upstream suppliers**. **That is normal in this industry.** Those parts are only the starting point."*

**它主动承认：锻坯和轮辋是从上游供应商买的。**

**为什么不藏？**

1. **同行都知道** —— 藏没意义，懂行的人一眼看穿
2. **主动说 = 诚实信号** —— 比被问出来强得多
3. **然后重新定义自己的价值**：*"2N takes the order from there"* —— 从锻坯到成品这一段的控制才是它的本事

**★ 它的价值主张因此变成**：

```
上游 → [锻坯/轮辋]  ← 行业通用，我们如实说
     ↓
   2N 负责这一段：车数据 → 轮毂规格 → 图纸审核 → 加工协调
                 → 表面处理 → logo/盖 → 终检 → 出口准备
```

**→ 这是个「承认边界，强调控制」的经典写法。**

**⚠️ 但对我们有个前置问题**：**丰怀的锻坯是自产还是外购？**
语料库说「我们具备 **一体锻造成形能力**」（峰徊画册 P9）→ **听起来是自产**。
**如果丰怀真能一体锻造，这段要改成反过来的写法** ——
「我们能做一体锻造，这是相对同行的优势」。

**必须问清。**

### 2.3 ★ 第 7 段：路由段（T7）

**这和 `dealers-page.md` §1.3 的路由段是同一个模式**：

```
DEALER SUPPLY          Sell custom forged wheels without stocking inventory first.
PRIVATE LABEL WHEELS   Put your shop name, logo or center cap on wheels your customers already want.
MANUFACTURING PROCESS  See how confirmed specs move into drawing review, machining, finishing and checking.
```

**格式统一**：标签 + **加粗一句话** + 一行小字 CTA（`Open dealer page` / `View process`）。

**★ 而且它的导语写得很妙**：

> *"If this page helped you understand **who is behind the wheel**, these pages explain **how to work with 2N** in a more practical way."*

**→ 它显式承认「关于页讲的是人，接下来讲的是怎么合作」。**
**这就是「关于页 → 经销商页」的接力关系。**

---

## 3. 竞品的证据清单（可复用的话术模板）

竞品在 9 段里塞了 **5 组清单**，每组都是「我们能给你看的」：

| 段 | 清单内容 | 类型 |
|---|---|---|
| 2 | 锻坯/轮辋 → 规格审核 → 图/视频 → 对照订单检查 | 供应链 |
| 4 | 车数据确认 → 图纸/加工/表面记录 → 表面协调 → 生产照片 → 保护性包装 → 复购支持 | 生产前确认 |
| 5 | 制造身份 / 项目沟通 / 经销商与贴牌支持 / 链接到产品·经销商·制造 | 定位 |
| 6 | 图纸确认 → 序列号与规格刻印 → **100% 跳动测试 <0.01 英寸** → **关键尺寸 ±0.05mm** | **★ 质量** |
| 3 | CNC 产线 / 图纸与适配沟通 / 亲手生产检查 | 信任 |

**★ 第 6 段的两个公差数字最硬**：

```
100% runout testing under 0.01 inch      （跳动 <0.01 英寸）
Key dimensions checked to +/-0.05 mm     （关键尺寸 ±0.05mm）
```

**这是全站技术含量最高的两个数字。**
**⚠️ 我们能不能写？必须丰怀确认实际检测标准 —— 写了做不到就是事故。**

---

## 4. ★ 我们的关于页结构（九段式）

**竞品 9 段可直接复用，但第 1/2 段要按丰怀实际改写。**

```
/about
├── ① Hero（深色）          定位 + 「我们不卖仓库目录」
├── ② 四个硬数字 ★          ⚠️ 需丰怀确认具体值
├── ③ 供应链坦白 ★          ⚠️ 取决于自产还是外购
├── ④ 制造伙伴（3 卡 3 图）  产线 / 图纸沟通 / 生产检查
├── ⑤ 生产前确认            清单（T6）
├── ⑥ 定位筛选              「为需要不止目录货的买家」
├── ⑦ 质量证据 ★            公差数字 ⚠️ 需确认
├── ⑧ 路由段（T7）          → 经销商 / 贴牌 / 定制开发
└── ⑨ 收束 CTA              ≤80 字 + WhatsApp
```

**与竞品对照**：

| 段 | 竞品 | 我们 | 动作 |
|---|---|---|---|
| ① Hero | 深色 1000px | 同 | KEEP |
| ② 数字 | 4 个 | **4 个（换丰怀的）** | CHANGE 内容 |
| ③ 供应链 | 坦白上游 | **★ 见下** | **须按实际改写** |
| ④ 三卡 | 3 卡 3 图 | 同 | KEEP 结构 |
| ⑤ 生产前 | 清单 | 同 | KEEP |
| ⑥ 定位 | 筛选买家 | 同 | KEEP |
| ⑦ 质量 | 2 个公差 | **需丰怀确认** | CHANGE |
| ⑧ 路由 | 3 出口 | **3 出口（换我们的）** | CHANGE 目标页 |
| ⑨ CTA | ≤40 字 | 同 | KEEP |

### 4.1 ★ 第 ③ 段的两种写法（取决于丰怀的实际）

**这是本页最关键的分叉点。**

| 若丰怀是… | 写法 | 依据 |
|---|---|---|
| **外购锻坯** | **照抄竞品**：坦白上游 → 强调「从锻坯到成品的控制」 | 语料未见自产证据 |
| **能一体锻造** | **反过来写**：「具备 6061/镁合金一体锻造成形能力」→ **这是相对同行的优势** | 语料库 P9 明确写了「我们具备」 |

**⚠️ 语料库的原文**：

> 「我们具备 6061 铝合金与镁合金轮毂**一体锻造成形**能力」
> *"One‑piece forging capability is available for 6061‑aluminum and magnesium wheel programs"*

**→ 如果这句是真的，第 ③ 段应该写成优势，而不是坦白。**
**这是本页最需要丰怀确认的一条。**

### 4.2 我们能填的四个数字（实测）

| # | 项 | 我们的数据 | 状态 |
|---|---|---|---|
| 1 | **材料** | **6061 铝合金 + 镁合金** | ✅ 语料库可直接用 |
| 2 | **减重效果** | **锻造铝合金减重 10–20%** | ✅ 语料库 P9 |
| 3 | **尺寸范围** | **15–20 寸 + HP/越野款** | ✅ 资产实测 |
| 4 | **型号规模** | **1018 型号 / 3485 配置** | ✅ 资产实测 |

**★ 我们的第 2 段可以比竞品更硬** ——
因为竞品只有材料名，我们还有**减重百分比 + 1018 型号 + 3485 配置**。

**这是「目录事实」替代「产能数字」的策略**：
产能要等丰怀确认，但目录规模是我们**实测已知**的。

---

## 5. 与其它页的关系（避免重复）

**⚠️ 这一页最容易和另外三页写重。**

| 页 | 回答什么 | 与关于页的边界 |
|---|---|---|
| **`/about`** | **工厂是不是真的** | 本页 |
| `/dealers` | 怎么合作（不囤货） | 关于页讲「有工厂」，经销商页讲「怎么用这个工厂」 |
| `/capabilities` | 能做什么工艺 | 关于页讲「工厂存在」，能力页讲「工艺细节」 |
| `/custom-development` | 怎么按我图纸做 | 关于页只给路由口 |

**★ 竞品自己也在段 ⑥ 里说清了分工**：

> *"For cooperation terms, use the dealer page. For production steps, use the manufacturing page."*
> （合作条款看经销商页，生产步骤看制造页）

**→ 竞品把「去哪看什么」直接写在正文里。这个做法我们要学。**

---

## 6. 数据与依赖

| 段 | 依赖 | 就绪度 |
|---|---|---|
| ① Hero | 定位文案 | ✅ |
| ② 四个数字 | **产能 / 锻压吨位 / 出口市场** | ❌ **3 条待确认** |
| ③ 供应链 | **自产 or 外购？** | ❌ **关键分叉** |
| ④ 三卡三图 | **工厂实景照片** | ❌ 无素材 |
| ⑤ 生产前确认 | 流程 | ✅ |
| ⑥ 定位 | 文案 | ✅ |
| ⑦ 质量证据 | **跳动/公差标准** | ❌ 待确认 |
| ⑧ 路由 | 已有页面 | ✅ |
| ⑨ CTA | 文案 + WhatsApp | ⚠️ 需商务号 |

**→ 9 段里 4 段阻塞在丰怀工厂事实上。**

---

## 7. 待确认（本页对工厂信息依赖最重）

| # | 事项 | 阻塞 |
|---|---|---|
| **1** | **锻坯是自产还是外购？**（决定第 ③ 段是「坦白」还是「优势」） | **③ 全段** |
| **2** | **月产能是多少只？** | ② 第 1 个数字 |
| **3** | **锻压机吨位？**（语料的「万吨」出自航鹏画册，属第三方） | ② 第 3 个数字 |
| **4** | **主力出口市场？** | ② 第 4 个数字 |
| **5** | **检测标准**（跳动 / 公差具体值） | ⑦ 全段 |
| **6** | **工厂实景照片**（CNC 产线/图纸/车间） | ④ 三张图 |
| **7** | **是否有一体锻造能力**（语料说「具备」，需确认） | ③ + ② |
| **8** | **成立年份** | Hero 侧栏（竞品写了 "Since 2020"） |
| **9** | 是否有序列号刻印 | ⑦ |
| 10 | WhatsApp 商务号 | ⑨ |

---

## 附：竞品实测数据

```
URL:      https://2nforged.com/about-us/
标题:     About 2N Forged | Custom Forged Wheel Factory
H1:       Factory-Backed Custom Forged Wheel Manufacturer
desc:     ...a custom forged wheel factory serving North America and the
          Middle East / GCC with fitment, finishing, and export support.
段数:     9 段  ｜ 高度 7,119 px ｜ 字数 657（73 字/段）
图片:     6 张（3 张工厂实景 + 3 张其他）
系统:     dealer-*（与经销商页、贴牌页共用一套）
深色段:   2 段（hero rgb(5,7,11) + brand rgb(30,41,59)）
四个数字: 3,000 月产能 / 6061-T6 / 12,000 吨 / 2 个主要市场
两个公差: runout <0.01 inch ｜ 关键尺寸 ±0.05mm
路由段:   3 个出口（经销商 / 贴牌 / 制造）
```

**一句话**：这一页**不回答「我们是谁」，回答「你的订单背后有没有实体工厂」** ——
**它把「供应链坦白」和「可验证公差」当成主要内容。**
