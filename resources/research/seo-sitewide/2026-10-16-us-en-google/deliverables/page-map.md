# 全站 SEO 页面所有权与主题覆盖图

> 研究输出，不是页面上线或改站批准。Google US/en-US 单轮样本；volume/KD/CPC 未取得。

| 优先级/状态 | 现有或候选 URL | 主责搜索主题 | 代表词/问句 | 用户任务 | 门槛/下一步 |
|---|---|---|---|---|---|
| MUST_HAVE / EXISTING_PAGE | `/` | 首页身份和四条并列产品线 | `automotive components supplier；OEM automotive components partner` | `全站定位、四线入口、项目询盘` | 建议更新页面定位/CTA，不创建新URL；证明要求：供应链/法人英文身份审核，四线平衡呈现 |
| MUST_HAVE / EXISTING_PAGE | `/products` | wheels / EV components / custom aluminum / self-sealing tires | `automotive components products` | `产品线发现` | 统一词形与产品简介，不将线合并；证明要求：四线产品实体、命名与公开内容审核 |
| MUST_HAVE / EXISTING_PAGE | `/products/wheels` | alloy wheel catalogue；wheel specifications | `wheel catalogue；alloy wheels；bolt pattern / offset (only verified fields)` | `按真实规格浏览轮毂` | 目录成为 wheel browsing 主责URL；证明要求：型号发布资格、图权、规格审核；无车型 fitment 外推 |
| MUST_HAVE / EXISTING_PAGE | `/products/wheels/flow-formed` | flow-formed wheels | `flow formed wheels manufacturer；flow forming process；flow vs forged` | `解释旋压产品/工艺` | 保留旋压与锻造分离；证明要求：批准型号、工艺描述、图片图权 |
| MUST_HAVE / EXISTING_PAGE | `/products/wheels/forged` | custom forged wheels | `custom forged wheels manufacturer；forged wheel supplier` | `启动定制锻造项目` | 明确不是现货 SKU 目录；证明要求：真实供货/制造关系、工艺和可提供范围 |
| DEFER / SECTION | `/custom-development` | OEM wheel supplier | `OEM wheel supplier；OEM wheel manufacturer` | `确认 OEM 类供货资格后承接` | 不瞄准 OEM replacement retail intent；证明要求：实际 OEM/OES 供应链资格及页面意图复采 |
| GROWTH_CANDIDATE / EXISTING_PAGE | `/dealers/private-label` | private label wheels program | `private label wheels manufacturer；private label wheel supplier` | `评估私牌合作` | 先解除内容审批门槛，不承诺MOQ/交期；证明要求：英文内容批准、实际产品/交付计划/条款、noindex核验 |
| GROWTH_CANDIDATE / EXISTING_PAGE | `/tools/offset-calculator` | wheel offset calculator | `wheel offset explained；wheel offset chart` | `按 offset 学习/计算` | 工具与解释任务归一URL；证明要求：公式/单位、结果文案、canonical、车型建议边界 |
| DEFER / EXISTING_PAGE | `/resources/bolt-patterns` | wheel bolt pattern guide | `wheel bolt pattern；5x114.3 wheels` | `解释 PCD 与规格` | 指定一个资源主责URL；证明要求：Google SERP复采、pattern数据审核、与 /insights/bolt-patterns 去重 |
| MUST_HAVE / EXISTING_PAGE | `/products/ev-components` | EV motor housing supplier | `EV motor housing supplier；aluminum EV motor housing` | `评估电机/电控铝壳体项目` | 先一页承接；更细分URL另评；证明要求：产品/工艺/制造主体/工程图权确认 |
| DEFER / SECTION | `/products/ev-components` | electric vehicle inverter housing manufacturer | `EV inverter housing supplier；traction inverter enclosure` | `确认 housing 具体产品后评估` | 不承接 traction inverter 整机/电路设计意图；证明要求：housing-specific SERP及真实产品清单、供应链证据 |
| MUST_HAVE_BUT_NOINDEX / EXISTING_PAGE | `/products/custom-aluminum` | custom aluminum components supplier | `custom aluminum components；custom aluminium parts` | `按图/样件定制铝件评估` | 有结构必要性但不等于当前可发布/索引；证明要求：目前 noindex；需确认产品范围、供货主体和每项工艺 |
| GROWTH_CANDIDATE / SECTION | `/products/custom-aluminum#request-project-review` | custom aluminum parts from drawing supplier | `aluminum parts made to drawing；custom aluminum parts RFQ；custom aluminum parts quote` | `告诉买家如何准备项目资料` | 优先补转化模块，不急于新增 URL；证明要求：表单真实字段、图纸保密/上传流程、工程审核 |
| MUST_HAVE / EXISTING_PAGE | `/products/safety-tires` | self-sealing tire manufacturer | `self-sealing tires；self-sealing tire supplier` | `产品/供应商识别` | 移除 self-healing 作为主产品词；证明要求：统一 self-sealing 词形，供应商关系/具体型号/性能边界审核 |
| GROWTH_CANDIDATE / NEW_PAGE_CANDIDATE | `/resources/self-sealing-tire-technology` | how do self sealing tires work | `self-sealing tire technology；self-sealing vs run flat` | `解释机制和限制` | 经审核后再决定文章还是产品页内模块；证明要求：工程审核工作机制、可封堵范围、维修提示和适用性 |
| MUST_HAVE / EXISTING_PAGE | `/request-a-quote` | request quote custom aluminum parts | `what information should I send for an OEM automotive component inquiry` | `准备与提交询盘` | 各产品页 CTA 回流此处；证明要求：生产隐私/邮件/UAT与表单字段审核，不承诺答复速度 |
| DO_NOT_TARGET / EXISTING_PAGE | `/fitment/[platform]` | vehicle-specific wheel fitment | `BMW M wheel fitment (blocked)` | `未来仅在数据核验后承担` | 不做 topic/keyword 页面化；证明要求：当前 verified=false；先 noindex 并移出 sitemap，后由工程确认 |
| MUST_HAVE / REVIEW_EXISTING | `/capabilities 与 /manufacturing` | automotive components manufacturing capabilities | `manufacturer / factory / die casting (claim gated)` | `解释制造与项目能力` | 复核两页面主题边界，不按关键词扩写能力；证明要求：逐工艺、主体与证据审核；避免两个 URL 抢同一 manufacturing intent |

## 主题所有权边界

- `/products/wheels/flow-formed` 归 flow-formed 工艺/产品；`/products/wheels/forged` 归 custom forged 项目，两者不要合并。
- `/products/safety-tires` 归产品/供应商识别；自密封机制解释是独立的信息任务，可先作为本页模块，证据充分后再评估新文章。
- `/products/custom-aluminum` 当前 noindex；其 Topic Map 结构不能解除索引门槛。按图 RFQ 优先作为转化模块。
- `/products/ev-components` 先覆盖确认后的壳体项目；motor housing 可作为待核实模块，inverter housing 独立页面暂缓。
- `/resources/bolt-patterns` 与 `/insights/bolt-patterns` 存在重复风险，先确定单一主责 URL。
- 未核验 fitment、认证、价格、MOQ、交期、客户、产能、材料/公差和性能主题一律不作为上线 target。

## SERP URL 级聚类限制

Google 页面快照记录结果标题与可见域名，但链接由 Google 包装；本轮没有逐一点击全部结果确认每个目标 URL。聚类因此按实体、用户任务、SERP 页面类型和边界人工审阅，URL 重叠边明确标记 `UNRESOLVED_URL_LEVEL`，没有将同域名误当成同一页面。
