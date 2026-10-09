# B2B 制造业英文独立站 · 关键词调研报告

**调研日期**：2026-10-06
**目标站点**：深圳峰徊科技（贵州蓝辉集团 manufacturing 资源）英文独立站，四条产品线（铝合金轮毂 / 新能源三电铝制品 / 定制铝制品 / 自修复轮胎）
**目标访客**：海外 B 端采购商（distributor、Tier 1、OEM 项目采购）+ 少量海外 C 端改装车主
**取证方式**：Bing（en-US 市场）实测 SERP + 竞品站点抓取
**上线目标**：2026-11-04（全新站，零权重、零外链）

---

## 0. 取证方法与缺口（先读这一节）

### 实测做到了什么
- 通过 Bing（`setmkt=en-US&setlang=en`）跑了 **38 组真实查询**，抓取每条的 top 10 结果域名、标题、People-also-ask、related searches。
- 直接抓取了 4 个竞品站点的真实页面 IA：`2nforged.com`、`flexiforgewheel.com`、`kipardoracing.com`、`rimaxwheel.com`。
- 对抓取到的 342 条结果链接做了域名类型聚合（184 个唯一域名）。

### 没做到什么（诚实标注）
| 缺口 | 说明 |
|---|---|
| **Google 无法访问** | 本环境 `google.com`、`suggestqueries.google.com`（下拉词 API）全部超时/被拦。所有 SERP 数据来自 **Bing**，与 Google 有差异（Bing 对厂家独立站更宽容、对 Reddit 权重更低）。 |
| **Reddit 无法访问** | `reddit.com` 及 `.json` API 在本环境超时。我改用 Bing 搜 `reddit + 关键词` 想间接命中 Reddit 帖子，**但没有一条 Reddit 线程进入 top 10** —— 所以"论坛真实用语"这一维度我**只有间接证据**，不能声称实测。 |
| **无搜索量 / KD 数据** | 没有 Ahrefs / Semrush / GSC 权限。**本报告不含任何搜索量与 KD 数字**，所有机会等级为基于 SERP 构成的定性判断。 |
| **AI 助手 fan-out 未实测** | 没有调用 ChatGPT / Perplexity / AI Overview 去跑真实 fan-out。第 5 节的子问题是**基于 Bing 的 PAA / related searches / AI 摘要**推演的，不是实测的 AI 输出。 |

> **纪律声明**：凡标注「实测」= 我在 Bing SERP 或竞品页面上真实看到；凡标注「推断」= 我基于 SERP 构成推的，未验证。

---

## 1. 需求分层：海外买家/工程师真实会搜的英文词

### 1.1 Informational（认知/科普层）—— 新站最容易切的一层

**实测来源**：Bing SERP `flow formed vs forged wheels difference`、`flow forming process aluminum wheels how it works`、`wheel offset ET explained`、`JWL VIA certification wheels what is it`、`run flat vs self sealing tire difference` 等。

| 英文原词（实测出现在 SERP / related searches 中） | 来源证据 |
|---|---|
| `flow formed vs forged wheels` | Bing related searches 实际显示：`flow formed vs cast forged` / `forged wheels vs flow forms` / `cast vs flow formed wheels` / `forged wheel vs cast wheel` |
| `cast vs flow formed vs forged wheels` | dorimm.com 标题实测：`Cast vs Flow-Formed vs Forged Wheels: Key Differences` |
| `what is flow forming` / `flow forming manufacturing process` | kipardoracing.com 实测页面 `Flow Forming Manufacturing Process` |
| `rotary forged vs flow formed` | variantwheels.com 实测：`Forged vs. Flow-Formed Wheels: What's the Difference?`（Bing AI 摘要确认二者基本同义） |
| `are forged wheels worth it` | variantwheels.com 实测标题：`Are Forged Wheels Worth It? An Honest Cost-vs-Benefit Breakdown` |
| `wheel offset explained` / `what does ET mean on wheels` | oemwheelshop.com 实测：`OEM Wheel Offset Explained: What ET Means and Why It Matters` |
| `how to measure wheel bolt pattern PCD offset center bore` | tisliwheels.com 实测：`How to Measure Wheels Correctly – Diameter, Width, Offset, PCD & Center Bore` |
| `what cars use 5x114.3 wheels` | gadgetsfeed.com / carxplorer.com 实测标题：`What Cars Use 5x114.3 Wheels? Bolt Pattern Fitment List` |
| `JWL VIA vs TUV certification wheels` | news.konigwheels.com 实测：`Wheel Standards (VIA, SAE, JWL, TUV) Does It Matter?` |
| `extruded vs die cast motor housings` | linkedalu.com 实测：`Extruded vs Die-Cast Motor Housings: An Engineer's Guide to Choosing` |
| `how does a self sealing tire work` | engineerfix.com / apollotyres.com 实测标题 |
| `run flat vs self sealing tires` | etyres.co.uk、ppteck.com 实测 |
| `custom forged wheels lead time` | flexiforgewheel.com 实测：`Forged Wheel MOQ, Lead Time & Pricing Explained` |

### 1.2 Commercial Investigation（选型/对比层）—— B 端最密集的一层

**实测来源**：Bing `EV motor housing manufacturer`、`die cast motor housing supplier`、`aluminum die casting china manufacturer`、`forged wheels MOQ wholesale wheels factory direct`。

| 英文原词 | 证据 |
|---|---|
| `forged wheels manufacturer` | 实测 ~58,300 results；#1 ankusiwheels.com，还有 flexiforgewheel.com、hydforged.com、khrwheel.com |
| `flow formed wheels manufacturer supplier` | 实测 ~29,400；#1 kipardoracing.com，rimaxwheel.com |
| `custom forged wheels manufacturer` | 实测：flexiforgewheel / XINLAI / ankusiwheels |
| `private label wheels manufacturer` | 实测 #1 xtforged.com/private-label-wheel-manufacturer/ |
| `wholesale alloy wheels distributor program` | 实测 ~3,680；cnyoker.com、awrswheels.com |
| `aluminum wheel manufacturer OEM ODM custom PCD offset` | 实测 ~4,470；robustwheels.com/oem-odm-solutions/、dhwheel.com/oemodm-service |
| `forged wheel dealer program MOQ` | 实测：flexiforgewheel.com/dealer-supply-program/（MOQ 4 pcs）、rpwheel.com/b2b-wheel-programs/ |
| `EV motor housing manufacturer` | 实测 ~33,900；sydensen / cncpioneer / fendadiecasting / kastdiecast |
| `die cast motor housing supplier` | 实测：hawentech、hentach、innovaw、made-in-china |
| `EV inverter housing manufacturer` | 实测 ~18,600；mecoogroup #1、fusionprecision、alibaba、BorgWarner |
| `controller housing die casting EV supplier` | 实测 ~40,700；fendadiecasting、huizhengmachinery |
| `water cooled motor housing electric vehicle` | 实测 ~40,300；cgcooler、hiqalum、xindaaitech、fonnovaluminium |
| `electric motor housing aluminum extrusion manufacturer` | 实测 ~9,910；aluminum-extrusions.com #1 |
| `aluminum die casting supplier China` | 实测：Bing AI 摘要直接列出 10 家中国厂名（Botou / Hebei / Dongguan 系） |
| `aluminum die casting IATF 16949 automotive supplier` | 实测 ~6,930；ecer.com、dcxmetalparts.com |
| `custom aluminum parts manufacturer` | 实测 ~44,700；hsjfabrication、rapidmanufacture、be-cu、aluphant、jjdmetals、fonnovaluminium、guodialuminum |
| `OEM aluminum parts manufacturer` | 实测：made-in-china ×2、jingjie-aluminum、syntonextrusions、fsdprecision、partzcore |
| `self sealing tire manufacturer` | 实测：selfsealingtires.com、made-in-china、haoqingyu |
| `self sealing tire China manufacturer wholesale` | 实测 ~2,650；made-in-china、dusauto、arestone |

### 1.3 Transactional（下单/询价层）—— 长尾、低竞争、最该先做

| 英文原词 | 类型 | 备注 |
|---|---|---|
| `forged wheels MOQ` | transactional | **实测** flexiforgewheel 专门做了 MOQ 页；SERP 明确显示 MOQ 4 pcs |
| `custom forged wheels lead time` | transactional | **实测** 有独立页面承接 |
| `wholesale forged wheels` | transactional | **实测** ankusiwheels.com/wholesale/、xtforged.com/wholesale-forged-wheels/ |
| `request quote custom forged wheels` | transactional | 推断（2nforged 有 `/contact-us/` + 浮动 Request Quote 按钮） |
| `aluminum die casting quote` / `RFQ aluminum housing` | transactional | 推断 |
| `PPAP die casting supplier` | transactional | **实测**：Bing AI 摘要出现 "request EV-specific quotes with MOQ, capacity, and tolerance data" |

### 1.4 Navigational（品牌/型号层）—— 你有筛选目录，这是独有优势

- **实测竞品在做**：kipardoracing.com 的 `flow-form-wheels` 页里按 **PCD + 尺寸** 分组列产品（`6×114.3-139.7`、`5/6×114.3-150`、`17×9/20×9/20×9.5`）。
- **实测**：2nforged 有 `/bmw-m-wheels/` 这种**车型专区页**。
- 因此 navigational 层真实词形为：`5x114.3 wheels`、`6x139.7 wheels`、`BMW M wheels`、`Toyota Hilux wheel PCD`（**推断**词形，非实测）。
- 你站有「直径/宽度/PCD/ET/CB 筛选目录」—— 这对应 `5x114.3 wheels`、`6x139.7 wheels` 这类**规格导航词**，是竞品用静态页面抢而你可用筛选页规模化覆盖的缺口。

---

## 2. SERP 格局观察（分品类）

### 2.1 轮毂类：**厂家独立站 + 科普对比文双轨，平台几乎不占位**

**实测** `forged wheels manufacturer`（~58,300 results）top 域：ankusiwheels.com、flexiforgewheel.com、…、hydforged.com、khrwheel.com —— **全部是中国厂家独立站**，无 Alibaba / Thomasnet。
**实测** `flow formed wheels manufacturer supplier`（~29,400）：kipardoracing.com #1、rimaxwheel.com —— 同样是厂家站。

对比/科普文的占位情况（**实测** `flow formed vs forged wheels difference`）：
- kaifengaorui.com、tisliwheels.com、discountedwheelwarehouse.com、dorimm.com、**flexiforgewheel.com（"A B2B Sourcing Guide"）**、viztunr.com、variantwheels.com

**结论**：轮毂类**两条路都在抢词**——
1. **产品/品类页**抢 `X wheels manufacturer`（B2B 意图）
2. **对比科普文**抢 `X vs Y wheels`（认知意图，且被 B2B 站当作引流入口，flexiforgewheel 直接把标题写成 "A B2B Sourcing Guide"）

值得注意：**2nforged 的 IA 实测显示**它建了 `/forged-wheel-resources/` 作为资源 hub（"Guides for Dealers and Wheel Shops"），说明头部竞品是把「科普文」当独立内容体系做的，不是顺手发博客。

### 2.2 EV 壳体类：**平台占位中等，但"厂家站 + 中国制造站"仍是主力**

**实测** `EV motor housing manufacturer`（~33,900）：sydensen.com、cncpioneer.com、fendadiecasting.com、kastdiecast.com
**实测** `die cast motor housing supplier`：hawentech.com、made-in-china.com、hentach.com、alibaba.com、innovaw.com
**实测** `EV inverter housing manufacturer`（~18,600）：mecoogroup.com #1、made-in-china #2、fusionprecision、alibaba、BorgWarner #10

平台出现情况（实测）：
- **made-in-china.com** 在 EV 类查询中占位很强（`/products-search/hot-china-products/Motor_Housing_Cast.html`、`/manufacturers/inverter-housing_4.html`）
- **alibaba.com** 出现（`/inverter-housing-suppliers.html`、`electronics.alibaba.com`）
- **Thomasnet / IndiaMART / GlobalSpec**：Thomasnet 只在 `forged wheel supplier USA distributor` 拿了 **#1**（thomasnet.com/suppliers/usa/forged-wheels-93830701）。**EV 壳体类查询中我没有实测到 Thomasnet/IndiaMART/GlobalSpec 进 top 10。**

**跨 38 组查询的域名聚合（我实测抓到的 342 条链接，184 个唯一域名）**：
- 平台类（alibaba / made-in-china / ensun / accio / thomasnet / taobao 等）合计 **29 条**
- 剔除 Bing 自身链接（cn.bing.com 26 + go.microsoft.com 36）后，占比约 **11%**

⚠️ 这个 11% 是全查询平均。**分类别看差异极大**：轮毂类 ≈ 0–5%，EV/定制铝类实测约 20–30%（made-in-china 单域名就出现 11 次）。这是**定性判断**，不是精确统计。

### 2.3 定制铝类：**"Top 10 厂家榜单"文霸屏——这是一个被中国同行做烂的红海**

**实测** `aluminum die casting china manufacturer`（~24,600）top 10 里**至少 6 条是同一种内容**：
- casting-yz.com `Top 10 Aluminum Die Casting Manufacturers in China`
- machcncmaster.com `Top 9 ...`
- anebonmetal.com `Top 10 ...`
- aludiecasting.com `Top 10 ...`
- innovawcasting.com `Top 10 ...`
- ensun.io（B2B 平台榜单）

**实测** `custom aluminum parts manufacturer`（~44,700）/ `OEM aluminum parts manufacturer`：hsjfabrication、be-cu、aluphant、jjdmetals、fonnovaluminium、guodialuminum、fsdprecision、partzcore、syntonextrusions —— 清一色中小中国厂站，无一是大牌。

**判断**：这个品类 SERP 顶部**没有权威大牌**（无 Wikipedia、无 Thomasnet 主导、无国际大牌官网），全是「同量级中国厂站」在互相挤。**对新站是好事也是坏事**：好事是没有权威墙；坏事是同质化极严重、榜单文泛滥，你必须靠**差异化证据**（证书、设备吨位、公差数据、PPAP）而不是"另一篇 Top 10"。

---

## 3. 新站可切入 vs 需积累（两栏清单）

**判断依据**：顶部 10 结果的域名类型分布 —— 顶部是「同量级中小厂站 / 内容站」= 可切；顶部是「平台 / 国际大牌 / 权威机构」= 需积累。**无工具数据，以下为基于 SERP 构成的定性判断。**

### ✅ 现在可切入（DR≈0 有机会）

| 关键词 | 意图 | 判断依据（实测） |
|---|---|---|
| `extruded vs die cast motor housings` | informational | 顶部是 linkedalu.com 这种同量级厂站的技术文，无权威墙 |
| `flow forming manufacturing process` | informational | kipardoracing.com（厂站）在排，无平台 |
| `water cooled motor housing EV` | commercial | ~40,300 results，顶部 cgcooler / hiqalum / xindaaitech 都是中小厂站 |
| `electric motor housing aluminum extrusion manufacturer` | commercial | ~9,910 results，**量级很小**，#1 是 aluminum-extrusions.com（厂站） |
| `controller housing die casting EV supplier` | commercial | ~40,700，顶部 fendadiecasting / huizhengmachinery 都是中小厂站 |
| `aluminum die casting IATF 16949 automotive supplier` | commercial | **~6,930 results，极小**，顶部 ecer.com / dcxmetalparts.com |
| `custom aluminum parts manufacturer` | commercial | ~44,700，顶部全是中小厂站，无权威墙 |
| `OEM aluminum parts manufacturer` | commercial | 同上，顶部 made-in-china + 一批中小厂站 |
| `wholesale alloy wheels distributor program` | commercial | **~3,680 results，极小**，顶部 cnyoker / awrswheels 都是中小厂站 |
| `aluminum wheel manufacturer OEM ODM custom PCD offset` | commercial | **~4,470 results，极小**，顶部 robustwheels / dhwheel |
| `forged wheel dealer program MOQ` | commercial | 顶部 flexiforgewheel / rpwheel，都是中小厂站 |
| `self sealing tire China manufacturer wholesale` | commercial | **~2,650 results，全场最小**，无权威墙 |
| `run flat vs self sealing tires` | informational | 顶部是 etyres.co.uk / ppteck.com 这类内容站 |
| `how does a self sealing tire work` | informational | 顶部 engineerfix / apollotyres 内容站 |
| `how to measure wheel PCD offset center bore` | informational | 顶部 tisliwheels（厂站）+ 内容站 |
| `5x114.3 wheels` 等规格导航词 | navigational | 你有筛选目录，可规模化；竞品用静态页 |

### ⏳ 需权重积累（现在别冲）

| 关键词 | 意图 | 判断依据（实测） |
|---|---|---|
| `forged wheels manufacturer` | commercial | ~58,300；顶部 ankusiwheels / flexiforgewheel / hydforged / khrwheel —— 一批已建权重的中国厂站扎堆 |
| `flow formed wheels manufacturer supplier` | commercial | ~29,400；kipardoracing #1、rimaxwheel —— 老站 |
| `custom forged wheels manufacturer` | commercial | flexiforgewheel / XINLAI / ankusiwheels 群雄 |
| `private label wheels manufacturer` | commercial | xtforged / xborul / senyaoforgedwheel 已占 |
| `EV motor housing manufacturer` | commercial | ~33,900；sydensen / cncpioneer / fendadiecasting 已建站 |
| `EV inverter housing manufacturer` | commercial | ~18,600 但 **#10 是 BorgWarner（国际大牌）**，说明这个词有 Tier 1 竞争意图 |
| `aluminum die casting china manufacturer` | commercial | ~24,600；**"Top 10 榜单"文霸屏**，同质化红海，新站进不去也无需进 |
| `forged wheel supplier USA distributor` | commercial | **thomasnet.com 拿 #1** —— 权威平台墙 |
| `EV battery housing aluminum manufacturer` | commercial | ~149,000 results，量级最大，需长期积累 |
| `aluminum die casting supplier China` | commercial | Bing AI 摘要直接给厂商名单，说明是成熟词 |

---

## 4. B2B 修饰词与后缀（实测）

以下修饰词是我在 **SERP 标题、related searches、竞品 nav/URL 里真实看到**的：

**身份类后缀**（最常用）：
- `manufacturer` —— 出现频率最高（`forged wheels manufacturer` / `EV motor housing manufacturer` / `custom aluminum parts manufacturer`）
- `supplier` ——（`die cast motor housing supplier` / `inverter housing supplier`）
- `factory` —— 实测 kipardoracing 页面 H1："**Your Reliable Flow Formed Wheels Factory**"；rimaxwheel title："Wholesale Flow Formed Wheel Manufacturer and Supplier, **Factory** Pricelist"
- `China` / `Chinese` —— 大量标题内嵌（`Custom Forged Wheels Manufacturer in China`、`China Die Cast Aluminum Motor Housing Supplier`）
- `vendor`、`distributor` —— 实测 `forged wheel supplier USA distributor`、`alloy wheel distributor program`

**采购模式类**：
- `wholesale` —— 实测 ankusiwheels.com/**wholesale/**、xtforged.com/**wholesale-forged-wheels/**
- `bulk` —— 实测标题 "wholesale **bulk** custom made forged wheels"
- `OEM` / `ODM` —— 实测 robustwheels.com/**oem-odm-solutions/**、dhwheel.com/**oemodm-service**、xborulwheels.com/products/**oem-private-label/**
- `private label` —— 实测 2nforged 有 `/private-label-wheels/` 整页，xtforged 有 `/private-label-wheel-manufacturer/`
- `custom` —— 无处不在
- `MOQ` —— 实测 flexiforgewheel 有独立 dealer 页写 "MOQ 4 pcs"
- `dealer program` / `B2B program` / `partner program` —— 实测 flexiforgewheel/dealer-supply-program、rpwheel/b2b-wheel-programs、awrswheels/partner-program、cnyoker/alloy-wheel-distributor-program

**认证/合规类（B 端特有，且是新站差异化抓手）**：
- `IATF 16949` —— 实测 `aluminum die casting IATF 16949 automotive supplier`（~6,930）
- `ISO 9001`、`PPAP`、`CMM` —— 实测出现在 Bing AI 摘要："verify ISO/IATF certifications"
- `JWL` / `VIA` / `TÜV` —— 实测 konigwheels、treewheels 有专门页

**规格类（轮毂独有）**：`PCD`、`ET / offset`、`center bore / CB`、`bolt pattern`、`5x114.3`、`6x139.7`、`concave`、`beadlock`、`monoblock`、`2-piece / 3-piece`

**工艺类**：`flow formed / flow forming`、`rotary forged`、`forged`、`cast / gravity cast`、`die cast / high pressure die casting (HPDC)`、`extrusion`、`friction welded`、`CNC machining`

---

## 5. AEO / AI 搜索 fan-out 子问题

⚠️ **这部分未实测 AI 助手**。以下 8 个子问题是从 Bing 的 **AI 摘要、People-also-ask、related searches** 里提取的真实问句形态，**推断**这些形态在 AI 助手里会被拆成同类子问题。

1. **What is flow forming, and how is it different from forging?**
   （实测依据：Bing AI 摘要 "A flow-formed wheel (also called rotary forged) starts life as a cast blank…"）

2. **Is a flow-formed wheel stronger than a cast wheel? Is it lighter?**
   （实测：related searches 中 `cast vs flow formed wheels` 反复出现）

3. **Are "rotary forged", "flow formed", and "spin forged" the same thing?**
   （实测：Bing AI 摘要直接回答 "Yes, rotary forged, flow formed, and spin forged all describe essentially the same manufacturing process"）

4. **What does ET / offset mean on a wheel, and how do I measure PCD and center bore?**
   （实测：oemwheelshop、tisliwheels 有专门页；Bing AI 摘要解释了 Einpresstiefe）

5. **What cars use a 5x114.3 / 6x139.7 bolt pattern?**
   （实测：gadgetsfeed、carxplorer 榜单页；Bing AI 摘要列了 Honda/Toyota/Ford/Tesla 并提示 center bore、offset、brake clearance 也要匹配）

6. **Die-cast vs extruded aluminum for an EV motor housing — which is better and why?**
   （实测：linkedalu.com "An Engineer's Guide to Choosing"，对比 thermal conductivity、porosity、pressure tightness、tooling cost）

7. **How do I verify a Chinese aluminum die-casting supplier is legitimate?**
   （实测：Bing AI 摘要 "verify ISO/IATF certifications; request EV-specific quotes with MOQ, capacity, and tolerance data"）

8. **What's the MOQ and lead time for custom forged wheels?**
   （实测：flexiforgewheel 有专页，Bing AI 摘要给出 1-piece 15–20 天 / 2-piece 20–25 天 / 3-piece 25–30 天）

**给 AI 可摘录性的建议（我的判断）**：这 8 类问题在 SERP 上**都由「一句话直接回答 + 对比表 + FAQ」的页面占位**。你站每个产品页和每篇科普文都应在开头 40–60 词内给出可直接摘录的结论句，并配结构化 FAQ。

---

## 6. 给你的三条行动建议（基于以上证据）

1. **先做「低量级 + 无权威墙」的 commercial 长尾**：`wholesale alloy wheels distributor program`（~3,680）、`aluminum wheel manufacturer OEM ODM custom PCD offset`（~4,470）、`aluminum die casting IATF 16949 automotive supplier`（~6,930）、`electric motor housing aluminum extrusion manufacturer`（~9,910）、`self sealing tire China manufacturer wholesale`（~2,650）。这些是我实测到**结果量最小、顶部全是同量级厂站**的词。

2. **科普文要按 2nforged / flexiforgewheel 的方式做成体系，不是发博客**：实测 2nforged 有 `/forged-wheel-resources/` hub，flexiforgewheel 把对比文直接命名为 "A B2B Sourcing Guide"。你的 `flow formed vs forged`、`extruded vs die cast motor housings` 应该是**独立页面 + FAQ + 对比表**，且要能被 B 端检索到（标题里带 B2B sourcing 语义）。

3. **用你的筛选目录打规格导航词**：竞品（kipardoracing 实测）还在用静态页手列 `6×114.3-139.7`、`17×9/20×9`。你的「直径/宽度/PCD/ET/CB 筛选」可以规模化覆盖 `5x114.3 wheels`、`6x139.7 wheels` 这类词——这是结构性优势。

---

## 7. 取证缺口汇总

| 缺什么 | 影响 | 建议补法 |
|---|---|---|
| Google SERP（含 PAA、AI Overview） | 本报告 SERP 全部来自 Bing，Google 结果可能不同 | 需在有 Google 访问的环境重跑 |
| Google 下拉词 / autocomplete | 第 4 节修饰词来自 SERP 标题而非真实下拉 | 用 suggestqueries API 或 Keyword Planner 补 |
| Reddit / 工程论坛真实用语 | 未实测到任何论坛原文，论坛维度只有间接证据 | 用 Reddit JSON API 或 `agent-reach` skill 补 |
| 搜索量、KD、CPC | 完全没有 | Ahrefs / Semrush / Google Keyword Planner |
| AI 助手真实 fan-out | 第 5 节为推断 | 实际调用 ChatGPT / Perplexity / Google AI Mode 跑一遍 |
| 竞品域名权威度（DR/DA） | 「可切入/需积累」判断基于域名**类型**而非真实 DR | 用 Ahrefs/Moz 查 DR 验证 |
| Thomasnet / IndiaMART / GlobalSpec 在 EV 类的真实占位率 | 我只在轮毂 supplier 词上实测到 Thomasnet #1 | 需在这些平台内直接搜品类 |
