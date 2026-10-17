# 全站 SEO 关键词与页面布局调研实施计划

**Goal：** 先明确网站实体与用户需求主题，再建立覆盖全站四条产品线的英文关键词、自然语言搜索句和页面 Topic Map。

**Architecture：** 按“定义 Entity → 收集 Topic → 评估 Topic → 挖掘 Keyword → 关键词聚类 → 形成并持续维护 Topic Map”推进。用 Ego Lite 在 Google 英文界面模拟研究员逐步搜寻、查看 SERP、追读相关页面；保存证据与市场上下文后，把已验证的主题和关键词簇映射到现有或候选 URL，交负责人审核。

**Tech Stack：** Ego Lite `ego-browser`、Google 免费网页界面、项目 `SKILLS/seo-market-research` 的研究规范与验证脚本、Markdown 和 JSON/JSONL。当前预算为 0，不使用付费数据接口。

## 全局约束

- 主要搜索引擎为 Google，首要语言为英文；目标国家/地区开跑前确认，每个市场的 SERP 独立记录。
- 四条产品线保持并列；查询与页面建议服从真实业务、产品事实、工程确认、图权与发布门槛。
- 搜索量、KD、CPC、趋势或排名没有免费可靠来源时标为缺失，绝不推算或编造。
- 研究交付是关键词、自然语言问题句、URL 承接与优先级建议；不得隐式改动网站内容、页面、metadata、sitemap 或索引状态。
- 研究记录与项目任务生命周期遵循仓库 `AGENTS.md`；本任务已获用户明确授权调用 GPT-5.6 Luna 子代理协助审核；不 commit、不 push、不发布，也不执行对外动作。

---

- **状态**：已完成；研究包、页面 Topic Map 和未决审核项已交付。
- **建立日期**：2026-10-16；执行完成：2026-10-16
- **目标**：为现有网站建立有证据、可审核的全站 SEO 页面布局与关键词承接方案，支持负责人决定哪些现有页面先完善、哪些候选页面值得后续建设、哪些主题暂缓或拒绝。
- **覆盖产品线**：Automotive Wheels、EV Aluminum Components、Self-Sealing Tires、Custom Aluminum Manufacturing。四条产品线并列研究，不因证据量不同合并或制造父子产品关系。
- **主要交付**：网站实体表、主题长名单及评估结果、全站英文关键词与自然语言搜索句覆盖矩阵、关键词簇与现有/候选 URL 的所有权关系、可持续维护的 Topic Map、证据与排序报告及结构化数据。交付后停止在研究移交，不自动改页面、sitemap、metadata 或公开内容。

## 背景与已有证据

开始研究前先读取并复核：

- [`docs/research/keyword-research-b2b-en.md`](../../docs/research/keyword-research-b2b-en.md)：2026-10-06 的 en-US Bing 观察和竞品页面记录；没有 Google SERP、搜索量、KD 或 GSC 数据，旧观察需标注日期并重新验证。
- [`docs/research/关键词调研报告-峰徊四线.md`](../../docs/research/关键词调研报告-峰徊四线.md)：2026-10-07 的四线业务与查询映射基线；不视为当前可发布关键词清单。
- [`outputs/reports/41-jev-seo-code-keyword-audit-2026-10-12.md`](../../outputs/reports/41-jev-seo-code-keyword-audit-2026-10-12.md)：2026-10-12 的代码/证据边界审计。需结合当前状态复查 fitment 索引门槛、页面 noindex、sitemap、canonical 和正式域名状态。
- [`STATUS.md`](../../STATUS.md)、[`PROJECT.md`](../../PROJECT.md)、相关 [`PAGE-SPECS/`](../../PAGE-SPECS/README.md)、内容状态与已确认业务/产品证据。
- 若仓库中存在 `CONTEXT.md`、`SOUL.md`、`HANDOFF.md`，启动时一并读取；按任务读取相关 ADR 与来源材料，不通读无关历史。

附件提出的六步顺序作为本计划的研究主线：**定义 Entity → 收集 Topic → 评估 Topic → 挖掘 Keyword → 关键词聚类 → 形成 Topic Map**。其中 Topic Map 是长期路线图，不等于一次性要制作或上线全部主题页。按产品相关性、商业价值、搜索意图、主题潜力、竞争难度和当前交付能力评估主题；先确保产品定位必需页，再安排增长型主题。图片只提供方法参考，不构成项目事实或关键词证据，也不覆盖本项目的产品发布门槛。

## 开始前需确定的研究合同

在开始实际采集前，记录并确认：

1. **目标市场**：首轮美国市场（`en-US`）；本轮不扩展到其他国家。后续第二市场必须作为独立 run。
2. **语言与搜索引擎**：首要研究语言为英文，主要搜索引擎为 Google。记录各 run 实际使用的 BCP-47 locale；需要研究的其他语言/国家须各自建独立 run，不混并 SERP。
3. **研究范围**：四条产品线全覆盖；明确首期重点市场、已有页面、候选增长主题及排除主题。
4. **数据与费用上限**：当前费用上限为 0，研究限于免费或已授权来源，不调用收费 SEO/SERP API，不购买历史趋势或竞争度数据。对免费来源拿不到的搜索量、KD、CPC、趋势等写 `REQUIRES_API` / `NOT_AVAILABLE`，不估填数据；如未来考虑付费，须另行确认授权和预算后另开或修订 run。
5. **SERP 时效**：记录检索日期、地区、语言、设备、引擎与采集限制；建议关键页面决策使用最近 30 天内 SERP，超过窗口重新采样或降为历史背景。
6. **出口目录与保留规则**：用独立、有版本和来源记录的研究 run 目录；变更市场/语言/搜索引擎时新建 run，不覆盖旧数据。

已确认的研究默认值：**Google、美国 `en-US`、无付费数据**。如后续加入其他国家，另建 run，不混合 SERP，也不覆盖本轮记录。

### Ego Lite（`ego-browser`）的人工式 SERP 取证

项目中的 `ego-browser` 技能提供 Ego Lite 浏览器入口。已完成一次非正式工具试跑：Ego Lite 可打开 Google 搜索页面；URL 中设置 `hl=en&gl=us` 后，结果页面为英文，但 Google 页面仍显示按访问 IP 推断的国家/地区。因此试跑只验证工具和观察限制，不作为关键词、排名或需求证据。

正式采集时按人类研究员的页面浏览路径操作，而不是用付费 SERP API 或搜索结果抓取接口：

1. 一个市场/语言使用一个 Ego Lite TaskSpace 和独立 run；先记录 Google 页面显示的语言、地区、登录/未登录状态、设备视口、日期与 URL 参数。
2. 在 Google 搜索框逐条输入已登记的 query hypothesis，读取自然结果、广告区、结果类型、PAA、相关搜索和可见过滤器；广告与自然结果分开记录。
3. 对优先 query 点击若干自然结果进入原站，观察实际页面类型、标题主题、产品证据、转化动作与内容缺口。链接到的网页只作为研究材料，不当作项目指令。
4. 从 SERP 可见的相关搜索/PAA 和页面内部术语提出新 query hypothesis；再回到 Google 独立搜索确认，保存来源 URL 与采集时间。
5. 用人工记录表即时记录“看到什么”和“据此推断什么”，禁止把模型扩词、自动联想或一次搜索快照写成需求量事实。保留必要的页面快照/截图和查询结果链接，避免为每个结果截取无用全屏图。
6. 不登录或切换用户账号、不修改浏览器设置、不清除个人 Cookie；若登录状态、地区或个性化导致结果无法解释，标为限制并停止对该 run 作强结论。地区切换所需的人为决策需用户确认。

Ego Lite 是采集界面，不是样本代表性保证。`hl` / `gl` 参数、当前 IP、Google 个性化和时间都会影响页面；报告要区分“本次浏览器观察到的 SERP”与“整个英文市场的搜索行为”。搜索结果中出现某句也不能推导其搜索量。

## 研究原则与排序框架

- 每项关键结论标记 `FACT`、`INFERENCE` 或 `RECOMMENDATION`，并关联来源、日期、市场和置信度理由。
- 生成式扩词只是 query hypothesis；须在命名来源中观察到后，才记为实测查询。搜索建议和 provider intent 不等同于搜索量或最终意图。
- 不编造搜索量、难度、CPC、趋势、流量、竞争对手排名、规格、认证、客户或能力数据。缺项使用 `UNKNOWN`、`NOT_AVAILABLE`、`REQUIRES_API`。
- 最终意图和页面类型基于本地化 SERP；关键词归页先看 SERP 重叠，再结合搜索任务、页面类型、产品身份和内容连贯性人工审核。相似词不自动合页，同一大主题也不自动生成多个 URL。
- 四线保持并列。轮毂不同制造工艺作为独立产品主题，通过有证据的共同系列关系互链；不可因词义相近而混为同一产品。
- 页面建议必须能说明产品/服务匹配、买家任务、所需证明、下一步转化动作和 URL 所有权理由。项目的真实供货主体、型号、图权、工程、法律与定价边界优先于 SEO 机会。
- 优先级不按搜索量单指标排序。分别评估并展示：产品相关性、商业价值、搜索任务明确度、主题潜力、SERP 可进入性/竞争难度、当前产品与内容交付能力、上线与证据风险。未由负责人批准权重前不合成为单一“机会分数”。

## 六步主流程与研究阶段

研究先回答“网站是谁、要服务哪些需求主题”，再确认人们如何搜索；关键词工具或 Google 搜索不是起点。研究合同与最终 QA 是贯穿六步主流程的前置和收尾门。

| 顺序 | 工作 | 主要动作 | 主要产物 | Gate |
|---|---|---|---|---|
| 0. 前置：锁定 Research Contract | 先确定目标国家/地区、英文 locale、Google、免费来源、SERP freshness 与目录；明确缺失项 | `RUN.md`、manifest、假设登记 | 目标市场和采集边界可复核；费用为 0 |
| 1. 定义 Entity | 定义网站/公司身份、四条产品线、产品与工艺实体、采购模式、受众及证据状态；划清不可混同的实体与未经确认的能力 | Entity records、实体关系图、事实/未知/禁用主张清单 | 四线并列；公司与供应商主体关系准确；产品/工艺不混淆 |
| 2. 收集 Topic | 从项目资料、产品与页面现状、买家角色/任务、旧调研、竞品网站和 Google SERP 探索主题；先收需求主题，不以导出词量作为主题 | Topic longlist、来源登记、buyer-job notes、反证记录 | 每个主题有来源或 `INFERENCE` 标记；能关联 Entity 与需求任务 |
| 3. 评估 Topic | 逐题评估产品相关性、商业价值、用户任务清晰度、主题潜力、SERP 竞争/可进入性、内容交付能力及事实风险；只用少量种子查询观察 Google SERP 来判断意图和结果可进入性；区分必做型、增长型、暂缓/拒绝 | Topic scorecard（多轴展示）、主题状态与评估理由 | 不用搜索量单独排序、不采用未批准综合权重；每题说明下一步或拒绝原因 |
| 4. 挖掘 Keyword | 仅对评估通过或需验证的主题收集主词、修饰词、规格/型号词、长尾词和自然语言问题句；Google 查询、相关搜索、PAA、页面词汇及免费可用数据均保留发现来源 | 有来源链的 query universe、自然语言问题库、provider 状态 | 主题之外的孤立词不自动纳入；假设和 SERP 实测查询分开；缺失指标不填估值 |
| 5. 关键词聚类 | 对优先 query 搜集同一市场/语言的 Google SERP；用重叠结果提出 cluster candidates，结合意图、页面类型、Entity、买家任务和内容连贯性人工审定 | SERP snapshots、overlap edges、reviewed keyword clusters、边界 QA | 语义相似不单独定簇；流程/实体冲突保留为不同页簇；URL 有唯一主责主题 |
| 6. 形成并维护 Topic Map | 把已评估主题、关键词簇和买家旅程映射到现有 URL、补强模块、候选新页、支持内容或暂缓/拒绝；标明优先顺序、依赖与复查触发条件 | Topic Map、页面所有权矩阵、阶段路线图、报告 | 地图是长期路线而非一次上线清单；四线并列，核心定位页不被流量主题挤掉 |
| 7. 收尾：QA 与移交 | 校验 schema、来源、日期/locale、证据状态、SERP 新鲜度、孤儿主题/URL、未证实主张与报告/结构化记录一致性 | QA 结果、Markdown 报告、必要时 HTML 视图、待决项 | SEO 技能 validator 通过；交付不隐式触发网站实现 |

### 持续更新 Topic Map 的触发条件

Topic Map 交付后作为维护底图，不承诺定期制造页面。出现下列真实变化时重新进入相关阶段，保留版本和变更原因：产品实体/供货证据变化；新增获批产品或服务；Google SERP 结果形态或页面意图明显变化；Search Console 在取得权限后出现新的查询/页面数据；已有 URL 页面能力、内容审核或发布状态变化。每次更新只重跑受影响的 topic 和 query clusters，并标出哪些旧建议因此失效。

## 页面框架：必须型与增长型分开评估

### A. SEO 必做型：产品定位与转化骨架

研究现有页面是否清楚解释站点整体身份、四条产品线、核心产品/服务能力、采购/使用场景和询盘路径。预期检查页面类别包括：

- 首页和产品/产品线总览；
- 每条产品线的核心入口，以及确有证据的核心产品、能力或服务页；
- 采购合作 / OEM-ODM / 私牌等已证实的解决方案入口；
- 有明确买家任务且达到事实审核要求的产品规格、指南及联系/询盘路径。

此类页面的成立理由首先是网站需要具备清晰可信的产品定位与承接结构。即便关键词暂时无数据、SERP 竞争强或短期无排名，也要评估其信息与商业承接是否缺失；关键词只帮助校准页面语言、主责主题与用户任务，不替代发布批准。

### B. SEO 增长型：经过验证的流量拓展

评估核心产品结构之外的指南、对比、长尾采购场景、规格导航、行业问题和专题 hub。只有当查询意图明确、业务相关、SERP 有可进入空间、可产出准确证据且能连回核心页面时，才进入优先候选。增长型页面可以分批试做，不以主题地图的覆盖数量作为目标。

### C. 暂缓或拒绝

明确保留“暂缓/拒绝”映射，尤其是当前缺乏工程确认的车型适配、无证据认证/案例/性能/客户、未知价格/MOQ/交期，以及只有搜索量却没有业务与交付承接能力的主题。否决时注明阻断证据和重新打开条件。

## 最终研究报告必须回答：全站需要覆盖哪些词和哪些搜索句

报告不能停在“做关键词调研”或只给一个关键词列表。最终人工审核版需要呈现**网站 Entity → Topic → Keyword Cluster → 页面/URL → 下一步内容路线**的关系，并按**站点层级 → 产品线 → 买家任务**查看覆盖。以下是矩阵的结构和研究种子示例；它们当前均为 `QUERY_HYPOTHESIS`，用于帮助收集 Topic 时发现搜索表达，不是已验证搜索需求、已批准 SEO 词或公开文案。只有 Topic 评估通过后，才进入系统扩词与 SERP 聚类。

| 覆盖层 | 需要研究的关键词/搜索表达类型 | 起始 query hypothesis 示例（英文原句） | 输出归属 |
|---|---|---|---|
| 全站身份 | 多产品线汽车零部件、供应合作、定制项目等总括表达；只有经主体与供货链证据核准才推荐 `manufacturer` / `supplier` 等身份词 | `automotive components supplier`；`OEM automotive components partner`；`custom automotive component sourcing` | 首页、产品总览、定制开发入口；若无法诚实概括四线则不强造单一总词 |
| 轮毂核心产品 | alloy / automotive wheels、真实工艺、可公开规格和型号，按目录数据核对词形 | `alloy wheel manufacturer`；`flow formed wheels supplier`；`custom forged wheels` | 轮毂总览、旋压轮毂、锻造定制服务、真实型号与规格目录；锻造词不得伪装成现货目录 |
| 轮毂规格导航 | PCD / bolt pattern、diameter、width、offset / ET、center bore / CB 等实际存在且批准公开的字段；区分可筛选词与值得独立 URL 的词 | `5x114.3 wheels`；`6x139.7 wheels`；`wheel offset ET`；`wheel center bore` | 现有筛选器、规格指南或候选页面；车型适配词需要工程验证，不从规格词外推 |
| EV 三电铝制品 | 以已确认产品实体为中心，研究 motor / inverter / controller housing 等名称、采购角色与项目评估表达；未经资料确认的部件类型仅为假设 | `EV motor housing supplier`；`electric vehicle inverter housing`；`aluminum housing for electric vehicle components` | EV 产品线入口及确有对应实体的能力/项目评估页；不得扩写成已量产、已认证或完整代工能力 |
| 自密封轮胎 | 主词、英美拼写、supplier/technology、工作原理与适用边界问题；统一用 self-sealing 概念核对，不将 self-healing 当同义词 | `self-sealing tire supplier`；`self-sealing tyre technology`；`self sealing tires manufacturer` | 轮胎产品入口与技术说明；正文问题须与真实技术边界一致 |
| 定制铝制品 | custom aluminum/aluminium components、按图开发、采购/RFQ 表达；分别研究英美拼写及其 SERP 差异 | `custom aluminum components supplier`；`custom aluminium parts manufacturer`；`OEM aluminum components` | 定制铝制品入口或开发服务页；品牌/工厂身份按真实供货关系审核 |
| 采购方案 | OEM、ODM、private label、wholesale、dealer/distributor、custom development 等采购模式；逐产品线判断适用性 | `private label wheels supplier`；`OEM wheel supplier`；`custom aluminum parts RFQ` | 经销合作、私牌、定制开发或相应产品线页；不添加未确认的 MOQ、价格、交期 |
| 信息与比较任务 | 工艺差异、规格解释、材料/工艺选择、产品工作原理、采购前核对事项；问题必须能由项目证据准确回答 | `What is the difference between flow-formed and forged wheels?`；`How does a self-sealing tire work?`；`What information is needed for a custom aluminum component quote?` | 已有指南/文章、产品页中的说明模块或增长候选；复杂度和证据不足时可不做独立页面 |
| 转化与联系任务 | 买家准备沟通时会问的项目输入、询盘流程及适用角色；不许承诺回复时间、免费报价、价格或交期 | `How do I request a quote for custom wheels?`；`What details should I send for an OEM automotive component inquiry?` | 对应产品页 CTA、询盘表单说明或通用询盘页；语言应与实际表单能力一致 |
| 暂缓/拒绝 | 不可核实的车型适配、价格/MOQ/交期、认证、客户/案例、性能保证、无业务承接的大词 | `BMW M wheel fitment`；`wheel manufacturer MOQ`；`IATF certified aluminum supplier`；`EV battery housing manufacturer` | 记录状态、拒绝/暂缓原因及重开条件；无证据时不可作为上线关键词或文案 |

### Topic Map 与研究表的字段

结构化数据至少分为三个层次并保留稳定 ID 与关系，避免一行关键词承担所有决策：

- **Entity 记录**：entity ID、名称/同义名称、entity 类型（站点/公司/产品线/产品/工艺/采购模式/买家角色）、父子或关联关系、允许表述、证据来源、未知项、发布限制、状态。
- **Topic 评估记录**：topic ID、所属 Entity、用户需求/买家任务、来源 ID、claim type、产品相关性、商业价值、意图清晰度、主题潜力、SERP 竞争与进入空间、交付能力、证据/发布风险、状态（必做型/增长候选/暂缓/拒绝）、理由、置信度、改变决定所需证据；各轴独立展示。
- **Keyword Cluster 与页面映射记录**：cluster ID、parent topic ID、查询原文、同簇变体、完整自然语言问题句、查询意图、SERP overlap edges、市场/语言/日期/设备、来源 ID、免费需求信号及缺失状态、页面类型、现有/候选 URL、主责主题、支持内容、处置、置信度。
- **Topic Map 路线图**：topic/cluster 到 URL 的边、Must-have / Growth / Parked / Rejected 状态、依赖和证据门、建议批次、内部链接方向、复查触发条件、地图版本与变更说明。

### “句子”交付规则

- 将用户在 Google 中可能输入的完整英文问题句单独列出，不把它们改写成页面营销文案。
- 每句标注来源：Google PAA/相关搜索、点击页面中的真实问题，还是研究员生成且尚待 SERP 验证的假设。
- 给出对应页面或模块以及建议回答的事实问题；未获核准的数据、规格和承诺不进入答案草案。
- 研究覆盖“用户会怎么搜”，页面 brief 只说明要回答什么；正文写作与翻译审核不属于本计划。

## 研究执行工作包与文件职责

本研究仍按 `work/queued → work/active → work/completed` 生命周期执行。本计划留在项目任务目录作为唯一任务文件；不另复制到 `docs/superpowers/plans/`，避免产生第二份正本。本文件已按任务生命周期由 `work/queued/` 移至 `work/active/`，完成后转入 `work/completed/`。按 SEO 调研技能运行，研究记录与交付报告职责如下：

- `resources/research/seo-sitewide/<run-id>/RUN.md`：run 合同、续跑说明和研究限制。
- `resources/research/seo-sitewide/<run-id>/run-manifest.json`：locale、Google 采集设置、来源状态、阶段、hash、完成时间和下游失效记录。
- `resources/research/seo-sitewide/<run-id>/sources/`：来源登记；必要原始快照/截图按授权与隐私限制保存。
- `resources/research/seo-sitewide/<run-id>/entities/`：实体、实体关系及事实/未知/发布限制记录。
- `resources/research/seo-sitewide/<run-id>/topics/`：Topic 长名单、主题评估轴和状态变更记录。
- `resources/research/seo-sitewide/<run-id>/queries/`：通过评估的 Topic 对应的假设登记、query universe、Google SERP 观察和关键词簇结构数据；统一用 JSON/JSONL，不输出工作 CSV。
- `resources/research/seo-sitewide/<run-id>/topic-map/`：Topic、cluster、页面 URL、优先顺序、依赖和维护触发条件的地图数据。
- `resources/research/seo-sitewide/<run-id>/deliverables/RESEARCH-REPORT.md`：SEO run 内唯一中文人工审核正本，按 Entity → Topic → Keyword Cluster → URL 展示站点覆盖、搜索句、评估理由、路线图与未决问题；`outputs/reports/sitewide-seo-topic-map-<run-id>.md` 为该正本的符号链接，避免维护两份。
- 如确有审阅便利需要，从审核后的 Markdown 生成同名 HTML；HTML 不单独编辑，也不替代 Markdown。

实际调研工作包按六步主流程逐项设 gate；每一步的结构化记录须可单独审核后再进入下一步：

1. **Entity 定义**：核验网站身份、公司与供应链主体、四线实体、产品/工艺关系、采购模式、角色、证据与禁区。验收：实体关系图不把供应商能力归到未确认主体名下，未知项显式登记。
2. **Topic 收集**：按 Entity 和 buyer job 建立主题长名单；结合项目资料、页面现状、旧调研、SERP 和竞品分类收集，不先堆几千关键词。验收：每个 Topic 对应具体需求/任务和来源；推测主题标明推测依据。
3. **Topic 评估**：对每个候选主题审阅相关性、商业价值、意图、主题潜力、SERP 竞争/进入空间、交付能力与证据风险。验收：标为必做、增长、暂缓或拒绝并说明理由；不基于单一搜索量或未批准的加权总分排序。
4. **Keyword 挖掘**：只针对通过或需补证的 Topic 扩出头部词、变体、采购修饰词、规格词、自然语言问句。用 Ego Lite Google 搜索观察搜索表达，并区分 SERP 中真实出现、页面来源表达和研究员 query hypothesis。验收：每条 query 都有 parent topic 与 provenance；不合格主题不靠扩词数量“救活”。
5. **关键词聚类**：按独立 query 在同一 Google 市场的 SERP overlap 生成候选簇，再审核意图、Entity、买家任务、页面类型与内容连贯性。验收：同簇决定能解释 SERP/任务重叠；规格、工艺或业务身份冲突不被强行合并。
6. **Topic Map 形成与维护**：把 Entity、Topic、Keyword Cluster、URL 和内容路径连成可维护地图；标出必做与增长批次、依赖、排除项和复查信号。验收：每个获推荐主题都有主责 URL 或明确的暂缓理由；Topic Map 明示长期路线不等于全部立即生产。
7. **最终 QA 与移交**：验证来源、schema、SERP freshness、地图边完整性、未支持主张、报告/机器层一致性。验收：SEO 技能 validator 通过，未决项与负责人下一决定清楚，任务再转入 completed。

## 交付结构

研究 run 采用 [`SKILLS/seo-market-research/`](../../SKILLS/seo-market-research/SKILL.md) 的规范：

- 人工审核正本：中文 `RESEARCH-REPORT.md`（保留查询原文与页面用户可见英文词的原样，不把项目说明写成中英混杂）；
- 结构化机器记录：manifest、hypotheses、sources、业务实体、query universe、provider 数据、SERP snapshots、重叠边、机会向量、买家任务图、页面映射；
- 必要时从审核后的 Markdown 生成 HTML 视图；Markdown 是审阅正本，HTML 可重建；CSV 不作为最终或工作数据格式；
- 明确披露来源限制、时效、冲突、缺失状态、置信度、改变推荐所需证据和负责人决策。

## 验收标准

- 四条产品线均有独立的证据、查询主题和页面归属分析；未完成的线明确标出证据不足，不能用其他线的数据代替。
- 搜索意图/页面类型决策有对应市场、语言、时间和 SERP 证据；旧报告里的 Bing 观察只作为待验证历史记录。
- 每个查询和结论保留来源 ID；指标有 provider、定义、日期、市场和状态。
- 页面建议区分必做型、增长型、暂缓/拒绝，含产品相关性、商业价值、买家任务、交付可行性、目标页面/下一步和 ownership 逻辑。
- 未核验的规格、fitment、认证、价格、MOQ、交期、客户和能力没有变成上线建议或 claims。
- 机会排序未擅自使用未批准的综合权重。
- 研究包通过 SEO 调研技能的 run/schema/evidence QA；未生成 CSV 最终产物。
- 不创建或修改网站页面、页面规格、metadata、sitemap 或公开内容；不触发收费数据调用。

## 依赖与风险

- 已确认 Google、英文优先、当前不付费。首轮美国 `en-US` 已由用户确认；本轮不比较第二市场。收费 provider 不在本轮范围内。
- 新站 Search Console 数据可能稀疏或尚无可用表现；按实际状态记录，不作为查询需求全貌。
- 项目产品主体、型号、图权、规格、工程/法律审核状态可能随时间变化；每轮研究需要从当前正本重新核验。
- 正式域名和生产索引状态未定，9080 预发布结果只适合有限诊断，不能替代正式域名发布前验证。
- 研究建议不自动解除任何 `noindex`、fitment、产品发布或语言批准门槛。

## 完成后的下一步

研究通过审核后，负责人再决定是否单独启动页面布局/SEO 修复任务。内容 brief、改写 metadata、解除 noindex、新增 URL、更新 sitemap、发布内容和正式站 SEO 验收均属于后续工作，不含在本任务授权内。
