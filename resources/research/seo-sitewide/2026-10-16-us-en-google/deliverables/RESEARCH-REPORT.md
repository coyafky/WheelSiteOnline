# 全站 SEO 关键词与 Topic Map 研究报告

- **Run**：`run_49640978b2a8`
- **研究市场**：Google US / 英文 `en-US` / desktop
- **数据预算**：USD 0；没有付费工具、Google Search Console 或历史排名数据
- **实际 Google UI 采集**：11 个手动输入 query；2026-10-15 23:43–23:46 UTC（中国时间 2026-10-16）。Google 页面显示 United States、按访问 IP 推断位置。
- **研究法**：Entity → Topic → Topic 评估 → Keyword → Cluster → Topic Map。关键词清单以用户任务为主，不按工具导出量排序。
- **交付状态**：主题地图和查询覆盖供负责人审核；不代表已批准公开文案/页面/索引。

## 执行摘要

本轮先用项目正本确定网站实体与四条并列产品线，再收集买家任务、查看页面现状、挑选代表性英文查询观察 Google 页面类型与可见问题。交付覆盖：11 个实测 query、70 条 SERP 问句/相关表达/扩展假设（总 query universe 81 条；实测和未实测严格区分）、16 个主题簇和 URL 所有权建议。

**核心结论**：先修齐全站产品定位骨架和四线主入口，再分批扩展增长主题；不把搜索量当作唯一排序依据。当前 Google 单轮证据支持优先评估私牌 wheels、wheel offset 教育、自密封轮胎机制、按图定制铝件 RFQ 和 EV motor housing 内容模块。`OEM wheel supplier` 实际 SERP 被替换轮毂零售/二手/本地购买意图稀释；`EV inverter housing` 则偏逆变器整机和电力电子教育，需暂缓独立页。

## 一、研究合同与证据边界

- 市场、语言、搜索引擎：美国 Google 英文 `en-US`，为用户确认。
- 免费范围：Ego Lite 手动 Google UI；Search Console 和收费 provider 均未运行。没有搜索量、keyword difficulty、CPC、趋势、排名或流量数值。所有这类指标均为 `NOT_AVAILABLE` / `NOT_RUN`，而不是 0。
- SERP：11 个单次 desktop 快照。Google 页面地址带 `hl=en&gl=us`，页脚仍显示 IP 推断的 United States；具体城市、登录/个性化与所有美国用户的真实结果无法固定。快照时间接近，不能代表长期排序或市场规模。
- 结果 URL：保存了完整可读快照、标题与域名。Google redirect link 包装了不少最终 URL，本轮未点击全部结果确认 canonical destination；因此不将域名重叠冒充同 URL 聚类。`overlap-edges.jsonl` 将这些边留为 `UNRESOLVED_URL_LEVEL`。
- 搜索建议/PAA：只证明当时查询页上有可见表达，不证明这些短语的搜索量。LLM/研究员扩词标为 `RESEARCH_HYPOTHESIS`。

## 二、Entity：我们是谁、有哪些产品

| 实体 | 研究建模 | SEO 与公开表述边界 |
|---|---|---|
| 网站/项目接口 | 面向海外买家提供多产品线信息、项目评估和询盘入口的深圳峰徊海外商业接口（内部研究建模） | 英文法定名待批准；不可将多家供应主体写成峰徊自有工厂或能力。 |
| Automotive Wheels | 轮毂目录、flow-formed wheel 产品与 custom forged 项目并列 | flow forming 与 forging 是不同工艺；锻造页是定制服务，不是已发布 SKU 目录；不扩大未核验 fitment。 |
| EV Aluminum Components | EV motor/electronics housing 项目评估 | 页面或供应商资料里的类别不证明工艺、量产、材料、公差、客户、认证或峰徊自有制造。 |
| Custom Aluminum Manufacturing | 按 2D/3D/样件进入定制评估 | 当前页面公开索引门槛未通过；不能扩写未核实 CNC、挤压、压铸、深拉等能力。 |
| Self-Sealing Tires | 自密封轮胎产品与技术项目 | 美国主词用 `self-sealing tires`；不将 `self-healing`、run-flat、puncture-proof 或 never-flat 当作同义或承诺。 |

## 三、Topic 与优先路线

### 产品定位必做型（不受缺少 volume 数据否定）

1. 首页：清楚呈现四条线、项目/供货角色、核心产品与 CTA。核验并移除过时的单一锻造轮毂定位与未证实目录数字。
2. Products 总览：四线平衡入口，统一英文产品命名。
3. 四线核心页面：wheel catalogue、flow-formed、custom forged、EV components、custom aluminum、self-sealing tire。确认供货主体、型号、工艺、媒体图权和索引/语言批准门槛。
4. 询盘路径：产品页 CTA 回到现有 quote 页面；只描述真实可提交的资料和下一步，不承诺价格、免费报价或响应时间。

### 增长型候选（逐批次审核）

| Topic | 观测信号 | 当前建议 |
|---|---|---|
| Private-label wheels | Google 结果中有 Forgestar、HRE、CWS 等私牌计划页面；PAA 也有私牌供应商问题。 | 私牌页是强 B2B 候选；但现有英文页面 noindex/审批状态与计划条款要先核实。 |
| Wheel offset explained / calculator | Google 显示 AI Overview、技术指南、视频、calculator 相关搜索及数值 PAA。 | 用现有工具/技术指南承接；需核对 canonical、公式和工程边界，不能外推车型 fitment。 |
| Self-sealing mechanism | “how do … work”出现 AI Overview、技术解释、品牌页、视频和使用限制 PAA。 | 与轮胎供应商/产品页分开；优先做经工程审核的解释模块/文章。 |
| Drawing-led custom aluminum RFQ | 搜索结果有图纸、quote、按单制造、CNC 在线下单等结果；PAA 询问去哪找零件/加工成本。 | 优先做按图提交资料的 CTA/表单说明模块；页面 noindex、工艺证据和图纸保密条件未过门前不公开索引。 |
| EV motor housing | 结果含 motor housing 能力页、EV 铝压铸供应商、产品页和供应商名单。 | 先在 EV 入口页明确已核实范围；具体工艺/独立页等主体、产品与证据确认后再决定。 |

### 暂缓或拒绝

- **OEM wheel supplier**：单次 SERP 主要混合 OEM replacement wheels 零售、二手/翻新、附近门店与制造商；不是稳定纯 B2B query。除非核实 OEM/OES 供货关系且定向变体 SERP 支持，不做专门页。
- **EV inverter housing**：结果偏 traction inverter 供应商/整机、功率电子技术、厂商榜单和价格；Google 显示 `housing` 缺词。暂不建独立 housing 页。
- **车型 fitment**：当前平台数据 `verified:false`，审计仍发现可索引/sitemap 收录风险；先关闭索引门槛，工程验证后再研究。
- **价格、MOQ、交期、认证、客户、产能、性能承诺**：无针对性项目证明，不作为页面 keyword target 或 public claims。

## 四、全站关键词与自然语言搜索句覆盖

标记说明：**实测** = 研究员在 Google UI 手动搜索；**PAA/相关搜索观察** = Google 查询页当时可见但没有单独搜索；**待验证** = Topic 导出的关键词假设，不等于需求或已批准文案。下表按产品线与买家任务组织。

### 站点身份 / 产品线发现

- 关键词候选：`automotive components supplier`（待验证；需英文主体审核），`OEM automotive components partner`（待验证），`automotive components products`（待验证）。
- 搜索句：`What automotive component product line should I contact for my project?`（研究员问题假设，未单独 SERP 验证）。
- 页面：`/`、`/products`、`/custom-development`；不要构造一个将四线压为单一产品类目的泛词首页。

### Automotive Wheels

**工艺与项目**
- 实测：`flow formed wheels manufacturer`、`custom forged wheels manufacturer`。
- PAA/相关表达：`Who makes flow-formed wheels?`、`Are flow-formed wheels any good?`、`What are the best flow-formed wheels?`、`Where are flow one wheels made?`、`flow formed wheels vs forged`、`How much does it cost to make forged wheels?`、`Who makes the most affordable forged wheels?`、`Who makes the best forged truck wheels?`、`How to make your own forged wheels?`。
- 待验证：`flow formed wheels supplier`、`flow forming wheel process`、`flow formed vs forged wheels difference`、`custom forged wheels supplier`、`forged wheels made to order`。
- URL 所有权：旋压 → `/products/wheels/flow-formed`；锻造定制 → `/products/wheels/forged`。不合并。

**OEM / Dealer / Private Label**
- 实测：`OEM wheel supplier`、`private label wheels manufacturer`。
- PAA：`Who sells OEM wheels?`、`What does OEM mean for wheels?`、`Does anyone buy OEM wheels?`、`Is OEM Wheel Shop legit?`、`Where can I find private label manufacturers?`、`Who is the world’s largest wheel manufacturer?`、`Who are some reputable custom wheel manufacturers in the USA?`、`Who makes the rims for NASCAR?`。
- 待验证：`private label wheel supplier`、`private label forged wheels`、`OEM wheel manufacturer`。
- URL 所有权：私牌页候选 `/dealers/private-label`；OEM 词先不 target，避免替换轮毂零售意图混淆。

**规格教育/选型**
- 实测：`wheel offset explained`。
- PAA：`What does +35 offset mean?`、`What does a +40 offset mean?`、`Do I want a positive or negative offset?`、`What does +20 offset mean?`。相关：`wheel offset calculator`、`wheel offset chart`、`wheel offset examples`。
- 待验证：`wheel bolt pattern guide`、`5x114.3 wheels`、`wheel center bore explained`。
- URL：offset → `/tools/offset-calculator`；bolt pattern → `/resources/bolt-patterns` 或 `/insights/bolt-patterns` 二选一做主责。具体车型适配仍暂缓。

### EV Aluminum Components

- 实测：`EV motor housing supplier`、`electric vehicle inverter housing manufacturer`。
- 可见相关搜索：`EV motor housing supplier USA`、`EV motor housing supplier California`、`EV inverter manufacturers`、`Traction inverter in electric vehicle`、`EV inverter price`、`EV inverter for home`。
- PAA：`Who are some inverter manufacturers in the USA?`、`Which type of inverter is used in EV?`、`Who are the top inverter manufacturers in China?`、`Who are some major manufacturers of electric vehicle components?`。
- 待验证：`aluminum EV motor housing manufacturer`、`EV motor housing die casting supplier`、`EV inverter housing supplier`、`traction inverter enclosure supplier`、`electric vehicle power electronics housing supplier`。
- URL 所有权：已核验类别落到 `/products/ev-components`；motor housing 可先为模块；inverter housing 等 housing-specific query 和事实复核后再决定是否独立页。

### Custom Aluminum Manufacturing

- 实测：`custom aluminum components supplier`、`custom aluminum parts from drawing supplier`。
- PAA：`Where can I find custom aluminum parts?`、`How much does it cost to CNC machine aluminum?`、`Where can I find machined parts online?`、`Where can I buy aluminum blanks?`。
- 相关/待验证：`Custom aluminum parts from drawing supplier USA`、`custom aluminum components manufacturer`、`custom aluminum parts RFQ`、`aluminum parts made to drawing`、`custom aluminum parts quote`、`what information should I send for a custom aluminum parts quote`。
- URL 所有权：`/products/custom-aluminum` 是结构候选但当前 noindex。按图/RFQ 先补在页面或 `/custom-development` 的真实 CTA 模块，不复制建立相似 URL；未证实工艺不可列为能力。

### Self-Sealing Tires

- 实测：`self sealing tire manufacturer`、`how do self sealing tires work`。
- PAA：`Who makes self-sealing tires?`、`Do self-sealing tires really work?`、`What kind of tires have built-in sealant?`、`Does Michelin make a self-sealing tire?`、`How long can you drive on self-sealing tires?`、`How much do self-sealing tires typically cost?`、`What are the downsides of using tire sealant?`。
- 相关/待验证：`self-sealing tire supplier`、`self-sealing tire technology`、`self-sealing tires vs run flat`、`self-sealing tire repair`、`self-sealing tyres technology`（仅英式变体）。
- URL 所有权：供应商/产品 → `/products/safety-tires`；机制与限制 → 经审核的文章/模块。`self-healing` 不作为产品主词；不承诺 puncture-proof/never-flat。

### 全站 RFQ

- 待验证自然语言句：`What information should I send for an OEM automotive component inquiry?`、`Can a supplier review my aluminum drawing?`、`How do I request a quote for custom forged wheels?`
- URL：CTA 回 `/request-a-quote`；表单隐私、图纸收件能力和所需字段按真实产品流程核准。

## 五、关键词簇与页面 ownership

| Cluster | 页面 / 处置 | 不要合并到 | 置信说明 |
|---|---|---|---|
| Wheel catalogue / verified specs | `/products/wheels` | vehicle fitment / price listing | 产品结构必需；本轮规格 SERP 未采样。 |
| Flow formed | `/products/wheels/flow-formed` | forged | SERP 有独立工艺和品牌产品混合；精确页面重叠尚未测定。 |
| Custom forged | `/products/wheels/forged` | flow formed / inventory | 搜索结果聚焦按单定制与厂商识别；项目事实仍受限。 |
| OEM wheel supplier | 暂缓/排除 replacement 意图 | private label | SERP 有零售、used、repair 和 B2B 供应混合。 |
| Private label wheels | `/dealers/private-label` 待页面批准 | 通用 dealer 或零售定制 | SERP 有明确 B2B 程序页，但本项目商业条款待核实。 |
| Wheel offset | `/tools/offset-calculator` 与教育说明 | 工艺页/车型 fitment | 强信息型 SERP；canonical、公式与风险提示先核验。 |
| EV motor housing | `/products/ev-components` 模块；独立 URL 候选 | inverter whole-unit | SERP 支持供应商发现任务，不能推导峰徊产线。 |
| EV inverter housing | 暂缓独立 URL | EV inverter unit suppliers | 单轮 SERP 偏整机/教育，housing 意图不稳定。 |
| Custom aluminum components | `/products/custom-aluminum`（noindex） | 任何具体工艺页 | 搜索快照较稀疏且词形不完全匹配；索引门槛未通过。 |
| Drawing-led RFQ | 定制页询盘模块 | CNC/深拉/在线零件下单 | 是最清楚的 project-intake 任务，但工艺与表单证明未齐。 |
| Self-sealing product | `/products/safety-tires` | mechanism guide / run-flat | 品牌技术与供应识别混合；供应角色应核实。 |
| Self-sealing mechanism | 文章或产品页解释模块 | supplier page | 信息型任务明确；所有技术阈值需审核。 |
| Fitment / unverified claims | 禁止 target | — | 当前一方审计和发布证据门槛直接阻断。 |

本 run 的机器层未做同页 URL-overlap 自动聚类：因 Google 包装链接，精确目标页未逐条点击验证。语义簇是按主题、任务与页面类型提出的候选；页面 ownership 需在下一轮用已解析的结果 URL、相似 query 的 SERP 和负责人审核确认。

## 六、Topic Map 路线及复查触发器

1. **先定位必做骨架**：首页/产品总览/四线核心产品页/询盘页，把产品身份、能力、场景、证据和 CTA 对齐。
2. **修复索引和术语风险**：fitment 未核验页的 noindex/sitemap；统一 self-sealing 术语；确认 private-label/custom-aluminum 英文页面审批和索引状态；检查 offset 工具 canonical。
3. **低成本增强已有页**：经审核的轮毂工艺/规格说明、自密封机制边界、按图 RFQ 输入说明。
4. **按证据分批试增长页**：私牌、offset guide、EV motor housing 模块、drawing-RFQ 模块。每个候选先解决产品证据和页面 owner。
5. **用 Search Console 复盘**：用户授权后纳入 query/page impressions、clicks、CTR；与 Google SERP 页面意图并读，不以 impressions 单指标定优先级。

触发重跑：供货主体/产品类别改变、页面 noindex/批准状态改变、新增真实型号/图权资料、Google SERP 结果型态改变、取得 GSC 数据、市场语言改变。改市场须建新的独立 run。

## 七、未决事项与下一负责人决策

- 批准网站英文名、供应链主体关系和各产品线可公开 manufacturer/supplier/OEM 表述。
- 确认所有当前存在的 noindex/英文审批状态是否维持，并先处理 fitment 错误索引风险。
- 决定 Private Label 是否为真实、可承接并有批准条款的合作计划。
- 确认 EV housing 类别、工艺和具体生产主体；特别确认 inverter housing 是否真实在售/可承接。
- 确认 Custom Aluminum 发布索引门槛、供应范围、询盘表单是否收图及图纸保密流程。
- 本轮没有付费需求数据；若必须按量级排序，需新增已授权的数据来源或等待 GSC 实际数据。

## 附件与来源

- 原始 Google UI 快照：`sources/raw/google-serp-001` 至 `google-serp-011`。
- 轮毂/轮胎 SERP 人工审阅：`analysis/agent-review-wheels-tires.md`。
- EV/Custom Aluminum SERP 人工审阅：`analysis/agent-review-ev-custom.md`。
- 页面库存：`deliverables/page-map.md`；信息架构：`deliverables/ia-proposal.md`。
- 完整 query universe、source ledger、topic scorecard、opportunity vectors、intent decisions、SERP snapshots 和 buyer-job map 均随本 run 一并保存。
