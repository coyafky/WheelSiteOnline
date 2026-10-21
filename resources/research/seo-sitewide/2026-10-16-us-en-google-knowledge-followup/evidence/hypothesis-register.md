# 假设登记表

| ID | 假设 | 类型 | 状态 | 支持来源 | 反证/限制 | 如何验证或解决 |
|---|---|---|---|---|---|---|
| hyp_001 | 首轮研究对象为美国 Google 英文 `en-US`，不使用付费关键词数据。 | MARKET | SUPPORTED | 用户 2026-10-16 在本任务中的明确确认 | Google 页面可能按 IP 与个性化展示不同结果 | Run 合同记录 `US/en-US/Google/desktop`，逐条保留页面可见位置与日期 |
| hyp_002 | 网站主体是深圳峰徊的海外商务/项目接口，而不是所有供应商工厂或能力的统一所有者。 | ENTITY | SUPPORTED | `src_project`、`src_arch` | 正式英文名称及逐产品供货/制造主体待业务核实 | 核对项目正本及后续负责人确认；不得将其写成直接公开 claim |
| hyp_003 | 四条产品线是并列实体，不能用“全是铝制品”或“锻造轮毂站”概括整个网站。 | ENTITY | SUPPORTED | `src_project`、页面规格 | 仍需后续 Google 用户表达判断各线的主题结构 | 按线独立收集 Topic 和 Cluster，检查 IA 不改变产品关系 |
| hyp_004 | 轮毂规格筛选和已批准型号可能承接一部分规格导航任务。 | TOPIC | OPEN | `src_spec_wheels`、`src_hist_bing` | 规格页与车型适配页意图可能不同；型号发布状态有门槛 | 用少量 seed query 检查 Google 结果页类型/重叠；工程事实另行核验 |
| hyp_005 | `flow-formed wheels` 与 `custom forged wheels` 是不同产品/服务 Topic，且可能需要分别承接。 | TOPIC | OPEN | `src_spec_flow`、`src_spec_forged` | 个别 query 的 Google 页面类型和页面拥有关系待采样 | 按独立 SERP 与页面任务比较；不按词义近似合并 |
| hyp_006 | EV 壳体主题可能同时包含产品类别查询和工程评估任务。 | TOPIC | OPEN | `src_spec_ev` | 搜索语言和商业意图尚未观察；供应商资料不能证明峰徊自有制造 | 选少量 query 做美国 SERP；页面证据和业务主体仍需审核 |
| hyp_007 | Custom Aluminum 的需求主题可进入研究地图，但目前页面发布/索引状态可能不允许作为公开增长页面。 | PAGE | OPEN | `src_spec_custom`、`src_jev` | 后续页面审核可能改变状态 | Topic Map 区分研究价值和上线资格，记录恢复索引的证据条件 |
| hyp_008 | `self-sealing tires` 是当前英文主术语；`self-sealing tyres` 可作为自然英式变体。 | ENTITY | SUPPORTED | `src_spec_tires`、`src_jev` | 美国 SERP 词形频次待观察，不能从术语政策推导需求量 | 在 Google en-US 分别观察词形和 SERP；不混用 `self-healing` |
| hyp_009 | Dealer/private-label/OEM/ODM 查询的页面归属可能出现 SERP 重叠或不同意图。 | PAGE | OPEN | `src_jev`、`src_hist_four_line` | 旧数据为 Bing；英文页面有 noindex/审批门槛 | 重新观察 Google 自然结果；区分不同页面类型和页面审批状态 |
| hyp_010 | 未核验车型适配、认证、客户案例、性能、价格、MOQ、交期不应进入可发布主题建议。 | CLAIM | SUPPORTED | `src_project`、`src_jev`、相关 Page Specs | 未来获得针对性批准证据可改变部分条目状态 | 保留 `PARKED/REJECTED` 与重开条件，不把词频当作证据 |
| hyp_011 | 搜索量、KD、CPC 和历史趋势在零预算条件下可能无法可靠取得。 | DATA | OPEN | 用户零付费限制；`src_hist_bing` 明确无这些指标 | Search Console / Google Ads 账号和授权状态未确认 | 仅用免费授权数据；无数据写 `REQUIRES_API`/`NOT_AVAILABLE`，不估填 |

允许状态：`OPEN`、`SUPPORTED`、`CONTRADICTED`、`REJECTED`、`UNRESOLVED`。报告中的推论必须说明证据与可能反例。
