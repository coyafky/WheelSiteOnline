# SEO 页面写作与模块优化计划

更新：2026-10-16。状态：已按计划实施页面文案与技术门槛对齐；执行与验收记录见 [`work/completed/2026-10-16-seo-page-writing-plan-implementation.md`](../../work/completed/2026-10-16-seo-page-writing-plan-implementation.md)。本次未写入 WordPress。

## 计划目标

将关键词研究转成逐页写作 brief：为每个主题确定唯一主责页面、主词/辅助词、页面要回答的采购问题、模块顺序、站内链接、证据来源和发布门槛。写作目标是帮助访客完成判断和下一步行动，不是把关键词机械塞入标题或堆叠薄内容。

研究依据：[关键词研究补充报告](sitewide-seo-topic-map-run_96deb74dab44.md)、[峰徊产品与行业 SEO 知识库](../../docs/research/seo-knowledge-base/README.md)、相关 [Page SPEC](../../PAGE-SPECS/index.md)。正式文案必须以 Page SPEC、PROJECT.md、已批准产品资料和工程/业务审核为事实依据。

## 先决条件与边界

- 目标市场是 Google US / en-US。`fenghuaitech.com` 是未来部署域名；本计划所列路径来自项目页面规格和现有路由规划，不等同于该域名当前 sitemap 已验证。
- 研究运行有 12 个 Google SERP 快照，其中本轮新增实测只有 `flow formed wheels supplier`；若干相关搜索尚未单独搜索。研究没有搜索量、KD、CPC、GSC 或转化数据，故按业务相关性、页面准备度和证据风险排顺序，不做流量预测。
- 不新建 URL，不放宽 `noindex`、产品发布、图权或 sitemap 门槛。文案准备、事实审批和公开发布是三个不同状态。
- `manufacturer`、`factory`、`OEM`、`private label`、`puncture-proof` 等词不得因搜索机会而自动成为公司自称或产品承诺。
- 研究中提出的“隐性需求”是可检验的写作假设，不是客户访谈结论。页面先回答可确认的问题，并为缺失信息给出透明的确认流程。

## 页面优先级总表

| 顺序 | 页面/主题 owner | 优先级 | 写作状态 | 处理结论 |
|---|---|---:|---|---|
| 1 | `/products/wheels/flow-formed` | P1 | 可基于现有规格做文案盘点与局部优化 | 当前索引与 sitemap 门槛已开；优先对齐混合的供应商发现、产品比较和工艺理解意图。 |
| 2 | `/products/safety-tires` | P1 | 可以整理草稿；涉及技术和产品主张必须逐项复核 | 保留产品/询盘页主责；把机制、8 mm 测试口径、适用边界和询盘证据写清，优先清理未有报告支撑的数字和绝对承诺。 |
| 3 | `/products/ev-components` | P2 | 受证据状态限制的内容整理 | 用已核准三类壳体及 supplier-stated 边界说明项目评估；先完成媒体/主体/metadata 与事实审核。 |
| 4 | `/products/custom-aluminum` | P2 | 内部写作/业务评审；页面继续 noindex | 按图 RFQ 是高相关方向，但 `declinedConfirmed=false`、不承接边界及图权/制造主体仍待确认。完成门槛前不公开、不要求索引。 |
| 5 | `/products/wheels` 与 `/products/wheels/forged` | P2 | 按现有规格校对，不扩写未核实产品项 | 总目录回答已批准规格筛选；锻造页回答 custom forged 项目评估，避免和旋压页混为一谈。 |
| 6 | offset 指南/工具、轮胎机制内容 | P3 | 先查现有路由/canonical 与技术审核条件 | 先补现有页面模块或确认唯一 URL；不能只因关键词创建新文章/工具。 |
| 7 | private-label wheels | 暂缓 | 不启动成稿 | 先由业务确认该合作模式是否对外开放以及条款；当前没有已批准的页面规格。 |
| 排除 | `OEM wheel supplier` 泛词、未核验 fitment 词 | 暂不优化 | 不纳入页面目标词 | SERP 零售含义混杂、OEM/OES 资格或车辆数据尚未支持。 |

P1 表示可优先进行证据内的编辑盘点，不代表自动允许扩大事实主张、增加页面或重新发布。

## 逐页写作 brief

### 1. Flow-formed wheels：产品、规格与工艺页面

**主责路径：** `/products/wheels/flow-formed`。**主词簇：** `flow formed wheels`、`flow-formed wheels`、`flow formed wheels supplier`、`flow formed wheels manufacturer`。**辅助主题：** 记录的生产路线、型号/PCD 浏览、flow forming 与 forged 的边界、fitment/supply review。

**搜索者显性任务：** 找到 flow-formed 轮毂产品/品牌/供货来源。**写作假设：** 访客也想比较工艺、规格和可信供货范围；SERP 有消费者和零售结果，页面不能只写成高意向 B2B 询盘页。

**模块顺序与写作任务：**

1. 首屏沿用 SPEC 的 H1 `Browse flow-formed wheels by recorded production specification`。Lead 明确这些型号的生产资料记录了 flow forming，并把访客带到已批准型号。不要在首屏泛称峰徊是轮毂制造工厂。
2. 工艺解释：清楚说 flow forming 记录代表什么、与整体锻造的区别，以及哪些路线信息未知。仅依 SPEC 允许值说明 `Flow formed` 与 `Low-pressure cast + flow formed`；不能把旋压、锻造、低压铸造互换。
3. 型号目录：只展示通过供货、图片、规格和审批门槛的型号/变体。模块标题用自然语言引入真实筛选项；PCD、尺寸、ET/offset、center bore 等须保持具体变体字段绑定。
4. 选择/适配边界：告诉用户 PCD 等单一规格不足以确认车辆适配，还需刹车间隙、载荷、目的市场文件等 review。CTA 指向 `Ask about a wheel requirement`，提交前显示已选真实变体。
5. 询盘模块：面向渠道、改装采购、车队/OEM 项目和个人用户保留适合的输入；询盘不是库存、报价或适配保证。

**站内链接：** wheel catalogue、custom forged 项目页、经核准的轮毂详情页；如链接 offset 工具，锚文本应描述学习/计算用途，不暗示确认适配。

**文案验收：** 目标词自然出现在 title/H1/首段或相关标题中即可；避免重复 `supplier/manufacturer`。现有 SPEC 的 title/description 作基线，编辑须确认和真实已批准型号集合一致。筛选和分页状态不因文案改动改变；索引、canonical、ItemList 与 sitemap 门槛保持一致。

### 2. Self-sealing tires：产品/供货与机制说明

**主责路径：** `/products/safety-tires`。**主词簇：** `self-sealing tires`、`self-sealing tire supplier`、`self-sealing tire manufacturer`（只有公司角色核准后可用）。**次级意图：** 自密封如何工作、适用限制、测试条件和询盘。

**模块顺序与写作任务：**

1. 道路场景/价值：用扎钉、漏气、停车、检查/维修等具体场景陈述问题，不用伤亡数字或恐惧式事故图。
2. 产品定义：解释内衬密封层如何响应胎面穿刺；`self-sealing` 不等于 `run-flat`、`self-healing`、`puncture-proof`，也不代表无需检查。
3. 工作原理：用三步说明异物刺入、材料包裹/限制漏气、拔出后通道闭合；每句话与批准机制图一致。
4. `8 mm` 证据模块：只有在 SPEC 要求的型号、测试钉、穿刺位置、胎压、条件、执行主体、观察结果等与报告对应后，才允许呈现为带条件的测试事实。资料不足时保留 supplier-stated/内部演示口径，不写成全部型号保证。
5. 证据与限制：清楚区分胎面条件与胎侧/胎肩/结构损伤，说明检查和专业维修边界。未有报告支持的温度、噪声、耐磨、湿地、响应时间、认证、质保数据不放入 SEO 文案。
6. 询盘分流：个人用户与渠道/车队入口保持 SPEC 定义；提交后询问具体车型/尺寸/市场等真实表单支持字段，不能暗示未核实库存。

**新内容处理：** `how do self-sealing tires work` 可先作为产品页内的明确机制模块/FAQ 需求，不默认另建 `/resources/self-sealing-tire-technology`。待独立 SERP、工程审批和现有内容重复检查后，再决定是否需要单独教育页。

**站内链接：** 自密封轮胎制造基地模块（主体与生产环境表述按其 SPEC）、询盘入口、相关轮胎内容；不要链向通用 `run-flat` 页面时造成技术等同。

### 3. EV aluminum components：项目评估页

**主责路径：** `/products/ev-components`。**主词簇：** `EV motor housing supplier`、`aluminum EV motor housing`、`electric motor housing manufacturer`；`inverter/control housing` 作为相关产品类别而非独立增长页。

**模块顺序与写作任务：**

1. 首屏准确描述深圳商务/项目接口和 supplier-supported 项目协调身份，沿用 SPEC 的工程评估路线。不要把峰徊写成直接制造全部壳体的单一工厂。
2. 三类壳体卡：water-cooled motor housing、high-pressure die-cast motor housing、controller/inverter housing。对供应商资料主张加来源/状态语义；不能由图片推出工艺、主体或量产事实。
3. 工程问题模块：冷却通道、密封边界、关键接口；表达为项目审核问题，不给未证实公差、泄漏率、材料或性能数字。
4. 制造路线模块：仅按 SPEC 把 LPDC/HPDC/CNC/FSW 等标成资料所述候选路线或需逐项目确认，不写成峰徊自有设备清单。
5. 验证文件模块：说明项目可能要对齐的尺寸、泄漏、材料/过程、首件和市场文件要求；没有实际报告/证书时明确“按项目确认”，不摆虚构证书标志。
6. RFQ 模块：零件类别、图纸/3D、接口、冷却/密封要求、数量和市场；只要求当前表单实际能接收的字段。

**意图处置：** motor housing 可由 EV 页承担；`EV inverter housing` SERP 有整机逆变器和教育结果，暂不拆独立 URL。补充关键词必须包含 enclosure/housing 语境并重新核对 SERP 和产品事实。

### 4. Custom aluminum：按图评估/RFQ 页面

**主责路径：** `/products/custom-aluminum`。**主词簇：** `custom aluminum components supplier`、`custom aluminum parts from drawing supplier`、`aluminum parts made to drawing`、`custom aluminum parts RFQ/quote`。

**模块顺序与写作任务：**

1. 首屏沿用 SPEC 的 `Start with a drawing, 3D model or physical sample`，明确这是项目评估路径而非现货目录。
2. 项目输入：2D、3D 或物理样件；只列已经被业务确认且实际表单可接收的信息。用途、材料要求、公差、数量、样件阶段、检验、法规和交付地可以作为评估问题，但未支持字段不得包装成已开放在线表单。
3. 应用范围：仅按 SPEC 资料中的应用分组与评估口径描述，不暗示每类都已供货或可制造。
4. 工程评估流程：说明评审、路线选择、tooling、first article、supplier-supported production 的阶段关系；避免给统一报价/交期和绝对承诺。
5. 能力/边界矩阵：业务确认不承接清单和工艺实际主体之前，不公开空边界表；供应商资料、外协、峰徊协调和实际制造主体分开说明。
6. 图纸/隐私模块：讲清提交方式、文件访问者、保留期限、NDA 与权利声明；没有批准的接收和保密流程前，不写“secure upload”或即时 NDA 承诺，也不引导上传敏感图纸。
7. RFQ CTA：`Start a custom aluminum assessment`；提交文案说明后续由项目人员确认承接性，不暗示自动报价。

**发布门槛：** 先在内部按此 brief 起草和评审；`declinedConfirmed=false`、图权/主体/工艺边界未完成前保持 `noindex,follow`，不以 SEO 需要解除门槛。

### 5. Wheels catalogue 与 custom forged wheels

**目录主责：** `/products/wheels`；关键词如 `alloy wheels`、`wheel catalogue`、按真实规格筛选的轮毂词。页面围绕批准型号、筛选字段、规格组合和详情页展开。关键词只在品类说明、筛选标签、空结果提示及必要帮助文本中自然出现；不把每个 PCD/车型值做成索引页。未批准、无图、规格不完整或供货状态不明的型号不得为覆盖长尾词而曝光。

**锻造定制主责：** `/products/wheels/forged`；词组为 `custom forged wheels`、`custom forged wheels supplier/manufacturer`、`forged wheels made to order`。写作回答项目是否适合定制、图纸/应用/车辆参数如何提交、变体确认与工程评估流程；产品级强度、载荷、减重、价格、MOQ、交期和 fitment 未证明前不写。与 flow-formed 页用明确工艺边界互链，不互相争同一主词。

**统一页面块：** 目录解释和真实筛选 → 批准型号/变体 → 规格选择帮助 → 询盘/详情入口。价格和 Offer 结构化数据在没有可核验报价/库存前不启用。

### 6. Homepage 与公司角色

首页只负责解释峰徊的商务/项目接口及四条产品线的导航，不能兼任每个产品词的落地页。首屏/产品入口使用已批准实体口径；四条线分别链接到产品 owner。公司角色模块区分商务协调与实际制造主体，并保持证书、产能、客户、工厂归属等事实跟随具体法人和证据。用此页承接公司品牌/产品线导航，不重复堆叠四组产品关键词。

### 7. Private label、offset 与暂缓主题

- **Private label wheels**：当前只形成写作需求清单，不写成正式网页。业务需回答：是否接受私牌项目、适用产品、品牌/包装与定制范围、供货主体、目标地区、可公开的 MOQ/条款/质量证据、线索由谁承接。答案签核后先编 Page SPEC，再决定是否新建页面或复用经销页面。不得承诺“best supplier”、保密、MOQ 或交期。
- **Offset explained/calculator**：先查当前唯一计算器/指南 URL、canonical 与产品规格逻辑。若现有工具可承接，补定义、输入解释、公式示例、结果边界与 FAQ；不能同时新建多个 offset guide/chart/calculator 页面。公式未经工程核验前不改结果或给 fitment 建议。
- **OEM wheel supplier/replacement OEM wheels**：不列为本轮目标词。只有业务确认 OEM/OES 供货角色和 SERP 任务边界后重新研究，不用标题暗示认证供应商资格。
- **Private label、EV inverter standalone、独立 self-sealing 技术文章**：不因关键词存在而自动产生新 URL；先证明业务/产品必要性、独立搜索意图和与现有页的差异。

## 全站写作规范

### 关键词放置

每页一个主责主题和少量服务同一买家任务的辅助词。自然覆盖顺序为：title、H1、开头说明、对应该任务的 H2/模块、图片 alt（只描述图像）、内链锚文本。每个位置以准确、易读为先，不重复关键词、不把搜索词原样硬塞进所有标题。不要为未单独搜索的 related query 创建独立页或 FAQ。

### 模块完整性

每个产品/能力页至少让访客看懂：这是何种产品/项目、峰徊扮演什么角色、适用范围是什么、需要哪些输入、哪些事项要逐项确认、下一步如何联系。FAQ 仅由真实 Page SPEC、审核过的买家问题或已观察的 SERP 问题支持；避免凭空写答案、添加无证据 schema。

### 内链与重复意图

- 产品目录 → 对应工艺/项目页 → 真实详情/询盘，路径清晰。
- Flow-formed 与 forged 互链但术语不互换。
- EV housing 与通用 custom aluminum 通过“部件/项目路由”交叉链接：EV 专用壳体回 EV 页面，泛化按图定制归 custom aluminum。
- Self-sealing 产品页负责产品/供应咨询；机制内容先作为本页模块，确认独立必要性后才拆分。
- 全站 CTA 的锚文本说明动作和产品上下文，不用多个泛化的 `Learn more`。

### Metadata 与技术 SEO

逐页按现行 Page SPEC 检查 title、description、H1、canonical、语言、robots、Open Graph、内部链接和结构化数据。文案工作不创建索引状态变更；如果 title/meta 要采用新主词，先核对页面 owner 与正式域名构建的 `NEXT_PUBLIC_APP_URL`。不在筛选参数、未批准型号或候选路线产生可索引入口。

## 写作与审核工作流

1. **页面基线表**：每页记录当前 title/H1/lead/meta、canonical、robots/index 状态、主责 topic、源材料、当前模块与 CTA。保存为本轮编辑前快照。
2. **写作 brief**：按本计划和 Page SPEC，为每模块填写访客问题、单一回答、证据来源、必要限制、目标 query cluster、内链和 CTA。
3. **事实审查**：产品/业务负责人确认主体、供货关系、应用范围和商业条款；工程或供应商审核工艺、测试、参数和安全边界；图像负责人核对图权、主体、alt/caption。争议内容保持 UNKNOWN/GATED。
4. **文案审查**：检查美式英语用词、术语一致性、同一页面是否重复回答其他 owner 的任务、隐性需求是否写成事实，以及是否有关键词堆砌、泛化承诺或 competitor copy。
5. **页面实施**：获准后再同步对应 `src/content/` 与 WordPress 约定来源；保持内容接缝，不让组件读取 WP 原始响应。只改对应文案/模块，不顺带开放 noindex 或 sitemap。
6. **验收**：逐项核验 SPEC 模块、事实来源、链接、表单 context、canonical/robots、语言、移动端阅读和 CTA。写作切片只运行相关验证；应用测试范围按 AGENTS.md §9 风险判断。
7. **上线后学习**：域名部署后存档 sitemap 快照；用 Search Console 的 query/page/地区/日期数据检查真实曝光和同词多页问题。先看至少一个可比观察窗口，再决定下一轮文案，不预设流量提升幅度。

## 每页完成定义

- 主 query cluster 只有一个 owner；辅助词与页面任务一致，来源状态可追溯。
- H1、首屏承诺、模块顺序和 CTA 回答显性任务，并针对有证据支持的隐性顾虑提供信息。
- 每个可验证产品/工程主张关联 Page SPEC、资料/报告或业务签核；缺证据的数字、身份、能力不发布。
- title/description 不承诺页面正文无法兑现的能力；canonical 与 robots 延续现行门槛。
- FAQ、图片 alt、结构化数据、内链对用户有用，不是关键词容器。
- 不创建重复 URL、不把 sitemap 收录当成内容批准、不使用搜索表现预测当验收标准。

## 本轮交付和下一个实际动作

本文件保留为执行依据。首轮已在本地内容接缝完成证据内的文案调整，并修正索引 metadata 与 sitemap 的门槛一致性；细节见执行记录。当前 `WP_MODE=live`，已批准的 WordPress 内容可能覆盖本地 fallback，因此本轮没有声称 CMS 正文已同步或已对外更新。涉及产品事实、主体或图片归属的文案，仍需按 Page SPEC 完成相应审核后再写入 CMS。
