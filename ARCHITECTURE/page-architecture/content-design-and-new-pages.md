# 页面内容设计法 + 页面增量决策

> **回答两个问题**：① 参考 2N Forged，我们**怎么设计每一页的内容**？
> ② 我们要**增加什么页面**（竞品有而我们没有 / 竞品也没有但我们该有）？
>
> 上游依据：`2nforged-page-inventory.md`（竞品 12 页 / 88 section 事实）
> 落地约束：`README.md`（上架门槛、九段式模板、待确认项）

- 版本：v1.0
- 建立日期：2026-10-01
- 证据来源：竞品 12 页 `structure-1440.json`（逐 section 的字数、CTA、图片、表单）

---

## 第一部分 · 怎么设计每一页的内容

### 1.1 第一步：先量竞品的内容密度（这是设计的地基）

我从结构 JSON 抽了每页的**总字数**与**逐段字数**。这是最重要的数据 ——
**它告诉我们每一段该写多少字，而不是凭感觉。**

| 竞品页 | 总字数 | section | 平均/段 | 类型 |
|---|---|---|---|---|
| `/` 首页 | **118** | 4 | **30** | 极轻 |
| `/contact-us/` | 187 | 1 | 187 | 极轻 |
| `/process/` | 566 | 1 | 566 | 中 |
| `/about-us/` | 657 | 9 | 73 | 中 |
| `/products/` | 833 | 1 | 833 | 中 |
| `/2-piece-forged-wheels/` | 871 | 9 | **97** | 中重 |
| `/bmw-m-wheels/` | 1,230 | 10 | 123 | 重 |
| `/wheel-gallery/` | 1,595 | 3 | 531 | 重（含产品名） |
| `/monoblock-wheels/` | 1,991 | 17 | **117** | 重 |
| `/custom-forged-wheels-for-dealers/` | 2,121 | 14 | **151** | 重 |
| `/private-label-wheels/` | 2,479 | 16 | **155** | **最重** |

### ★ 三条可直接照搬的密度规律

**规律一：内容越「决策重」，页面越长。**

```
首页 118 字  →  产品页 1,991 字  →  经销商/贴牌 2,121 / 2,479 字
```

→ **首页不是内容页，是路由页。** 别在首页堆字。
→ 决策越重大（要不要跟你合作），用户越愿意读长文，**页面就该越长**。

**规律二：单段字数有明确区间。**

| 段落类型 | 竞品实测 | 建议 |
|---|---|---|
| 定义/解释段 | 98–166 字 | 100–160 |
| 论证/说服段 | 207–301 字 | 200–300 |
| 案例/参考段 | 352 字 | 可到 350 |
| FAQ 段 | 46–120 字 | 60–120 |
| 结尾 CTA 段 | 40–76 字 | **务必 ≤80** |

→ **结尾 CTA 段竞品只写 40–76 字**（如 *"Send the next sold set"* 只有 61 字）。
**这是个容易被忽略的纪律**：结尾不要再来一大段，用户已经决定要不要联系你了。

**规律三：段落节奏是「轻→重→轻」。**

看 `monoblock` 的曲线：

```
57 → 98 → 107 → 151 → 164 → 92 → 177 → 46 → 236 → 181 → 183 → 111 → 88 → 76 → 46 → 135 → 43
```

**开头 57（轻）→ 中段 236（最重）→ 结尾 43（最轻）。**

⚠️ 竞品在这里**做错了**：中段 236 到结尾 43 之间，有 181/183/111/88/76 一路波动，
**节奏不干净**（这是 `2nforged-page-inventory.md` §4 A6 记录的问题）。

→ **我们的曲线要更干净**：开头轻 → 中段重 → 尾部**单调递减收束**。

---

### 1.2 第二步：按段落类型套「内容配方」

竞品的段落**不是随便写的**，可以归成 8 种类型。每种有固定的内容配方：

| # | 类型 | 配比（做什么 / 证明 / 数据） | 竞品实例 | 我们用在哪 |
|---|---|---|---|---|
| **T1** | **定义段** | 60% 做什么 · 30% 与什么不同 · 10% 数据 | *Monoblock Forged Wheels Explained* | 每条产品线② |
| **T2** | **痛点段** | 80% 描述你的处境 · 20% 不给方案 | *THE FOUR RISKS EVERY WHEEL DEALER CARRIES* | 经销商页 |
| **T3** | **降门槛段** | 70% 你只要给这一点 · 30% 剩下的我们做 | *VIN + TARGET WHEEL SIZE IS ENOUGH TO START* | 询盘引导 |
| **T4** | **对比段** | 30% A · 30% B · 40% 怎么选 | *COMPARE MONOBLOCK WITH 2-PIECE* | 轮毂线⑥ |
| **T5** | **攻心段** | 100% 说出对方不好意思问的顾虑 | *THE QUESTIONS NOBODY WANTS TO ASK THE SUPPLIER* | 贴牌页 |
| **T6** | **证据段** | 40% 能看什么 · 60% 这些东西证明什么 | *WHAT THE DEALER CAN TRACE BEFORE SHIPMENT* | 全站 |
| **T7** | **路由段** | 三个出口，各一句话 | *DEALER SUPPLY / PRIVATE LABEL / MANUFACTURING PROCESS* | 长页尾部 |
| **T8** | **收束 CTA** | 一句话指令，≤80 字，单品必带 | *Send the next sold set* | 每页结尾 |

**★ T7 路由段的写法值得单独学。** 竞品在 `about-us` 第 7 段放了三个出口：

```
DEALER SUPPLY          Sell custom forged wheels without stocking inventory
PRIVATE LABEL WHEELS   Put your shop name, logo or center cap on the wheels
MANUFACTURING PROCESS  See how confirmed specs move into drawing and production
```

**每个出口 = 标题 + 一句话说明是什么。** 用户读完长页后不用自己想下一步。

---

### 1.3 第三步：CTA 设计纪律

我统计了竞品全部 CTA 文案。规律很清晰：

**① CTA 分两档，绝不混用**

| 档 | 用词特征 | 竞品实例 |
|---|---|---|
| **主 CTA（动作）** | 动词开头，具体 | *Request a Monoblock Quote* ｜ *Send your next sold set* ｜ *Talk about dealer supply* |
| **次 CTA（探索）** | View / Explore / Compare | *View Wheel Gallery* ｜ *Compare Construction Options* ｜ *View Products* |

**② 主 CTA 必须带上文语境。**
不要写 "Contact Us"，要写：
- `Request a Monoblock Quote`（带品类）
- `Send your next sold set`（带场景）
- `Ask about grouped dealer shipments`（带具体问题）

**③ 结尾双 CTA = 主 + WhatsApp。**
`about-us` 和 `dealers` 结尾都是 `Contact Our Team` + `Talk on WhatsApp`。
→ **B2B 外贸的习惯：表单之外必须留即时通讯**。我们应加 WhatsApp。

**④ 画廊/目录页的 CTA 是卡片本身。**
`wheel-gallery` 的 CTA 全是产品名（*Gunmetal Retro Five-Spoke Forged Wheels…*）——
说明**每张卡片就是询盘入口**。

---

### 1.4 第四步：套「九段式产品线模板」

综合以上，`README.md` §3.1 的九段式模板细化成**内容配方表**：

| 段 | 类型 | 字数 | 要写什么 | 数据来源 |
|---|---|---|---|---|
| ① 页头定位 | — | 50–80 | 这条线是什么 + 一句话定位 | 语料库 |
| ② 定义 | **T1** | 100–160 | 这东西是什么、跟什么不同 | 语料库 162 术语 |
| ③ 对号入座 | **T2/T3** | 100–160 | 什么情况下你需要它 | 业务归纳 |
| ④ 能力 | **T6** | 150–300 | 我们能做什么（工艺/材料/范围） | 语料库 |
| ⑤ 型号/规格 | — | — | **★ 有数据才做** | `assets/` |
| ⑥ 对比 | **T4** | 150–250 | 与替代方案对比 | 需新写 |
| ⑦ FAQ | — | 60–120 ×5 | 常见问题 | 语料库 + 业务 |
| ⑧ 路由 | **T7** | 60–100 | 三个出口 | — |
| ⑨ CTA | **T8** | ≤80 | 主 CTA + WhatsApp | — |

**总字数目标：1,000–1,800 字**（对照竞品 monoblock 1,991）。

---

### 1.5 第五步：写之前必须过的四道关

| 关 | 检查 | 依据 |
|---|---|---|
| **G1 溯源** | 每句话能否追溯到语料库某条，或丰怀新提供？ | `AGENTS.md` §7.2 |
| **G2 数据** | 每个数字是否有真实来源？（无则留占位） | DEC-004 |
| **G3 平行** | 四条产品线是否用了同一套模板、同一密度？ | `README.md` §3.1 |
| **G4 转化** | 这段读完，用户知道下一步做什么吗？ | — |

---

## 第二部分 · 我们要增加什么页面

### 2.1 ★ 最大的发现：竞品有一批「车型适配指南」，我们完全没规划

竞品 `/forged-wheel-resources/` 第 2 段里藏着**六个具体适配指南**（我原以为只是文章列表）：

```
EV FITMENT   TESLA MODEL Y WHEEL FITMENT GUIDE        Compare 19, 20, …
EV FITMENT   TESLA MODEL 3 WHEEL FITMENT GUIDE        Compare 18, 19, …
VEHICLE FITMENT  BMW G80 M3 WHEEL FITMENT & BOLT PATTERN GUIDE
TRUCK FITMENT    TOYOTA TACOMA WHEEL FITMENT GUIDE    Compare 2016…
```

**这是一条完整的「车型适配内容线」** —— 竞品有，**我们的页面规划里完全没有。**

### ✅ 修正：我们其实有数据，只是不在我最初扫的那个字段里

我最初只扫了 `suitableVehicles`（全空）就下结论「无数据」。**这是错的** ——
车型线索真实存在，在 **`styleName`** 里：

```
坦克 77 ｜ BJ40 40 ｜ 奥迪 34 ｜ 丰田 33 ｜ 奔驰 30
宝马 28 ｜ 牧马人 11 ｜ 福特 7 ｜ 方程豹 6
```

**完整方案见 `fitment-pages-plan.md`。**

**教训（值得记住）**：一个字段为空 ≠ 这个维度的数据不存在。
**应该把所有字段都扫一遍再判定**，而不是扫一个就下结论。

---

### 2.2 三张表：竞品有 / 我们有 / 该新增

#### 表 A：竞品有、我们也要（KEEP 类）

| 竞品页 | 我们的路由 | 状态 |
|---|---|---|
| `/` | `/` | ✅ 已有 |
| `/products/` | `/products` ＋ `/products/wheels` ＋ `[model]` | ✅ 已有（要拆三层） |
| `/wheel-gallery/` | `/products/wheels` 筛选 | ✅ 已有（要合并） |
| `/process/` | `/capabilities` | ✅ 已有（要改名） |
| `/about-us/` | `/about` | ✅ 已有 |
| `/monoblock-wheels/` 等产品页 | `/products/wheels` 的解释区 | ✅ 已有 |
| `/2-piece-forged-wheels/` | 同上 | ✅ 已有 |
| `/forged-wheel-resources/` | `/insights` | ✅ 已有（要改名） |
| `/custom-forged-wheels-for-dealers/` | `/custom-development` | ✅ 已有（要改名） |
| `/private-label-wheels/` | `/dealers/private-label` | ✅ 已有 |
| `/contact-us/` | `/contact` `/request-a-quote` | ✅ 已有 |

→ **竞品 12 页，我们 11 个都能对上。** 差距不在数量。

#### 表 B：★ 我们要新增的页面（竞品没有或做得差）

| # | 新页面 | 为什么 | 依赖 | 优先级 |
|---|---|---|---|---|
| **N1** | **`/products/[line]` 另外三条产品线页** | 我们是四条线，竞品只有轮毂 | 语料库 ✅ | **P1** |
| **N2** | **`/products/wheels/[model]` 单品页（1018 个）** | 竞品把目录压一页，**无单品页** | 类型补齐 | **P0** |
| **N3** | **`/request-a-quote` 独立询盘页** | 竞品只有 `/contact-us`（187 字，太薄） | 询盘后端 | **P0** |
| **N4** | **`/thank-you` 提交成功页** | 竞品**没有** —— 提交后无处可去 | — | **P0** |
| **N5** | **`/capabilities` 拆出子页：`/capabilities/quality`、`/capabilities/process`** | 竞品工艺页**零 CTA**，我们要做得更强 | 产能数据 | P2 |
| **N6** | **`/insights/[slug]` 文章页** | 竞品资源页只有索引，**文章页不在采集范围内** | 写稿 | P1 |
| **N7** | **`/fitment/[vehicle]` 车型适配页** | 竞品只有 BMW M 一个 | ⚠️ **部分可用** | **P1** ← 已修正 |
| **N8** | **`/support/*` 政策页（5 个）** | 竞品**完全没做**（无隐私政策） | 律师 | P1 |

**其中 N2 / N3 / N4 是 P0** —— 都是竞品的**结构性缺口**，不是锦上添花。

#### 表 C：竞品也没有、B2B 外贸站该有的（增量）

| # | 页面 | 为什么该有 | 竞品为何没有 |
|---|---|---|---|
| **N15** | **★ PCD 专页 `5x114.3` / `5x112`…** | **覆盖率 100%**，是采购方真实搜索词 | 竞品无此切法 |
| **N16** | **★ 尺寸专页 `19寸轮毂`…** | **覆盖率 100%**，意图明确 | 竞品无此切法 |
| **N9** | **`/downloads` 资料下载页** | B2B 采购要图纸、规格表、认证文件 | 竞品无 PDF 资产 |
| **N10** | **`/quality` 质量与检测专页** | 「能力证据」是 B2B 决策核心 | 竞品只在 about 里带过 |
| **N11** | **`/faq` 全站 FAQ** | 长页 FAQ 分散，缺统一入口 | 竞品各页自带 FAQ |
| **N12** | **`/case-studies` 项目案例页** | 竞品用 gallery 代替，但那是图不是案例 | 竞品靠图 |
| **N13** | **`/sustainability` 或 `/compliance`** | 出口市场的合规需求 | 竞品无 |
| **N14** | **`/news` 或 `/blog` 与 `/insights` 分离** | 技术文 vs 公司动态，性质不同 | 竞品只有一种 |

⚠️ **N9–N14 是「该有但不急」**。**不要一次全建** —— 它们依赖真实素材，
空页不如没有（与上架门槛同源）。

---

### 2.3 ★ 页面总数对照

| | 竞品 | 现在（原型） | 建议目标 |
|---|---|---|---|
| 静态页 | 12 | 26 路由 / 56 页 | **22 路由 + 1018 单品** |
| 三类页面 | — | — | 见下 |

**我们的目标结构（三层）**：

```
L1 固定页（静态生成）        约 18 个
   首页 / 产品中心 / 四条线 / capabilities / custom-development
   / insights / about / contact / request-a-quote / thank-you
   / privacy / support×4 / tools

L2 索引页（静态 + 客户端筛选）  约 3 个
   /products/wheels ｜ /gallery ｜ /insights

L3 单品页（1018 静态生成）      1018 + ≤762 系列
   /products/wheels/[model] ｜ /products/wheels/series/[series]
```

---

## 第三部分 · 行动清单

### P0（数据齐、无阻塞）

| # | 事项 | 依赖 |
|---|---|---|
| 0 | **补 `WheelSku`/`WheelModel` 类型** | 无 —— **一切的闸门** |
| N2 | `/products/wheels/[model]` 单品页 | 上一条 |
| N3 | `/request-a-quote` | 询盘后端 |
| N4 | `/thank-you` | — |

### P1（部分依赖）

| # | 事项 | 卡在哪 |
|---|---|---|
| N1 | 另外三条产品线页 | 语料库够用，**六段能力内容要新写** |
| N6 | `/insights/[slug]` | 需要写稿（语料库是素材不是成稿） |
| N8 | `/support/*` 5 页 | **需要律师** |

### HOLD（等数据）

| # | 事项 | 等什么 |
|---|---|---|
| N7 | 车型适配页 | `suitableVehicles` 全空 |
| N5 | capabilities 子页 | 产能数字需丰怀确认 |
| N9–N14 | 增量页 | 真实素材 |

---

## 附：本文件用的证据与复现

```bash
# 抽取竞品逐 section 字数与 CTA（证据来源）
cd 深圳公司的独立站搭建/docs/site-capture/2nforged/raw
python3 - <<'EOF'
import json
d = json.load(open("monoblock-wheels/structure-1440.json"))
for s in d["sections"]:
    print(s["index"], s.get("wordCount"), [c.get("label") for c in (s.get("ctas") or [])])
EOF
```

**关键字段**：`sections[].wordCount`（该段字数）｜`sections[].ctas[].label`（CTA 文案）
｜`sections[].headings[].sample`（标题）｜`sections[].imgs[]`（图片与宽高比）
