# 全站 SEO Topic 与关键词研究 Run

## 研究合同

- **Run ID**：`run_49640978b2a8`
- **项目**：`fenghuai-b2b-site`
- **范围**：全站 Entity → Topic → Keyword → Cluster → Topic Map
- **市场/搜索语境**：Google / 美国 / 英文 `en-US` / 桌面
- **建立时间**：2026-10-15 23:37:56 UTC（中国时间 2026-10-16）
- **费用上限**：USD 0；不调用收费 SEO/SERP API，不购买任何数据。
- **证据新鲜度**：关键 SERP 观察 30 天；超期需复查。
- **产品线**：Automotive Wheels、EV Aluminum Components、Self-Sealing Tires、Custom Aluminum Manufacturing。
- **数据来源**：项目一方正本和审核材料；Ego Lite `ego-browser` 人工式 Google 页面观察；免费公开资料。Search Console 数据及付费 provider 数据均为 `NOT_AVAILABLE` / `NOT_RUN`，不因此填补估值。
- **采集设备**：Ego Lite 默认桌面视口。Google 查询 URL 使用 `hl=en&gl=us`；页面另显示按访问 IP 推断的国家/地区。精确城市、账号个性化状态与浏览器内部设置为 `UNKNOWN`，不得把这次观察当成所有美国用户的统一 SERP。
- **资料访问边界**：不收集或保存密码、cookie、客户资料；不登录或更改用户浏览器设置；公开网页仅用于搜索结果与页面模式研究。

## 研究路径

先定义网站、公司和产品/采购实体；收集有证据的用户需求主题；用少量种子查询与 Google SERP 评估主题；只对通过/待验证主题继续挖掘查询和自然语言问题句；用 SERP 重叠与买家任务决定关键词簇；最后形成长期 Topic Map。Topic Map 是路线，不是全部立即制作的页面列表。

## 当前状态

- 阶段 0（研究合同）：`COMPLETE`
- 阶段 1（Entity / market offering）：`COMPLETE`（基于项目正本与页面规格；主体/供应关系的未决项仍在证据缺口中）
- 阶段 2（Topic 收集）：`COMPLETE`（主题收集与页面盘点完成；质量证据不均已标明）
- 阶段 3–11（Topic 评估、Keyword、SERP/意图、聚类、机会、Buyer Job Map、页面图、IA）：`COMPLETE`；阶段 12（QA 与移交）：`COMPLETE`（schema validator 通过；URL 级重叠边界仍显式待后续复核）。

## 来源与采集状态

- 内部业务证据：`OK`，见 `sources/ledger.jsonl`、`evidence/business-context.md`、`evidence/market-map.md`。
- 历史 SEO 证据：`PARTIAL`，旧报告为 2026-10-06/07 的 Bing en-US 观察，只做主题线索，不代替本轮 Google 结果。
- Ego Lite Google 当前 SERP：本轮已在 Ego Lite 中手动搜索 11 个 query 并保存可读快照；单次 US/en-US 样本，不代表全市场。精确目标页 URL 重叠未确认，相关 cluster 边保留人工复核状态。
- 免费关键词需求指标：`NOT_AVAILABLE`，未使用 Search Console 或第三方付费数据。
- 竞争者分类：本轮按 SERP/内容/零售/目录角色记录；SERP 结果不自动等于商业竞争者。

## 未决事实

1. 深圳峰徊正式英文名称及品牌译名仍需业务确认。
2. 每条产品线的具体供货主体、制造边界和可公开资格需逐项核对；供应商资料不自动转为峰徊自有能力。
3. SEO 页面最终放行仍受图片/图权、型号/规格、工程与法律审查门槛约束。
4. 本次 Google 的城市级位置和个性化无法完全固定；记录每条 SERP 中可见地区、日期和参数。

## 交付与续跑规则

- 中文审核报告：`deliverables/RESEARCH-REPORT.md`；HTML 为可重建视图。项目输出目录中的同名报告路径是此正本的符号链接。
- 机器可读关键词清单：[`deliverables/keyword-export.csv`](deliverables/keyword-export.csv)，81 条去重 query。CSV 保留发现方式、证据状态、SERP 意图（仅有快照时填写）及未获取的需求指标；AI 分析栏留空，交由后续 run 结合产品知识库和当次 sitemap 判断。
- Topic Map/页面所有权：`deliverables/page-map.md` / `.json`；IA 建议：`deliverables/ia-proposal.md`。
- 复用本次研究资产时，配套读取 [`产品与行业 SEO 知识库`](../../../../docs/research/seo-knowledge-base/README.md)，并重新获取当日目标站的完整 sitemap URL LIST；本 run 的 page map 不能替代实时 sitemap。
- 本 run 已完成交接；后续市场、语言或引擎变化需建立独立 run，不覆盖本次记录。

## 续跑规则

继续本 run 前先运行 `validate_run.py`，读取本文件、`run-manifest.json`、假设登记与最近完成的阶段输出。若市场、语言、搜索引擎或业务身份边界变化，建立新 run 或写版本化修订并使受影响下游阶段失效；不覆盖历史记录。
