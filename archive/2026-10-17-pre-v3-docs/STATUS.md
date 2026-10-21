# 项目当前状态

更新：2026-10-16。**本文件只写现在有效的状态、当前阻断和下一步，不记逐日流水。** Agent 开始工作先读本页，再只打开它指向的相关任务/报告；不要为理解当前情况通读历史。

## 当前阶段

开发与预发布验证阶段，尚未达到正式商用发布条件。9080 是预发布环境，保持 `noindex`；预发布测试成功不代表正式内容、法律文本或生产运行时已批准。项目目标与稳定范围见 [`PROJECT.md`](PROJECT.md)。

页面文档快照：现行页面规格对应的主要页面代码已实现，Astryx Neutral 暖白主题与本地跨模板回归已完成；这不等于商用发布通过。自密封轮胎机制图的本地 WebP 已替换并通过页面回归，但 WordPress live 权威同步仍待复验；全站四语接管以及媒体、法律和生产运行时审核仍会阻断上线。历史实现曾开放 Fitment 与其他现有内容的四语索引；负责人现要求未批准译文不公开索引，首页已收口，其他页面族待迁移。车型数据仍标记为未核验。逐页状态以 [`PAGE-SPECS/index.md`](PAGE-SPECS/index.md) 为准。

## 当前优先事项

首页逐语言模块试点已完成本地技术验收：英文首页来自独立 WordPress Page 并公开；中文、西语、泰语独立草稿待人工审校，匿名访问不公开且不入首页 sitemap/hreflang/语言切换。H01–H05 全部必需，仅 H02–H04 可调顺序。全站迁移已完成架构评审，下一步按页面族落实发布资格与内容责任，不视为已上线。[验收与评审](outputs/reports/2026-10-16-homepage-pilot-and-sitewide-review.md) · [架构决定](docs/adr/2026-10-16-homepage-locale-modules.md)

1. **P0 · 自密封轮胎机制图**：三张本地公开 WebP 已换成无文字解释性图示，mock/开发/生产页面回归已通过；但本地 WordPress live 权威内容尚未同步，不能确认 live 不会继续覆盖旧路径，因此 P0 暂不关闭。[交付报告](outputs/reports/self-sealing-mechanism-asset-replacement-2026-10-16.md) · [原始诊断](outputs/reports/pre-run-visual-diagnosis-2026-10-13.md)
2. **P1 · SEO 收录配置**：此前四种语言 URL 已统一开放；负责人现确认改为“未批准译文不公开索引”。首页已接入逐语言门槛，其他页面族仍需后续迁移，当前不能宣称全站已收口。正式域名尚未配置，生产构建会安全地关闭 sitemap 并禁止抓取。车型 fitment 的 `verified: false` 状态未改，仍需工程事实审核后才能作为适配结论依赖。[先前开放记录](work/completed/2026-10-16-public-indexing-sitemap-robots-llms.md) · [首页试点](work/completed/2026-10-16-homepage-multilingual-module-pilot.md)
3. **P1 · 内容接管与多语言**：中央 locale registry 已补入标签、路径和 Intl 格式；旋压轮毂页 WFF01–WFF05 已接入四语 copy、localized metadata 和站内链接。首页独立 Page 与模块接缝已在本地验收；其他页面族的逐语言译文审批、编辑事件对账和缓存恢复尚未完成。当前工作区 WordPress 容器已重新挂载，首页迁移前备份完成；6 篇旧 `fh_guide` 已幂等迁移到原生 `post`。生产运行时联调仍未完成。A-01 逐路径逐语言发布资格的实施计划已细化，下一步先建立路径 × 语言批准矩阵及状态合同，尚未修改代码或公开资格。[四语实施计划与 A-01](work/active/2026-10-12-full-site-four-language-implementation.md) · [首页试点](work/completed/2026-10-16-homepage-multilingual-module-pilot.md)


## 仍未满足的发布条件

- 产品图、供货主体、图权和实际规格按型号/页面完成审核；没有真实证据的内容撤下或保持草稿。
- fitment 索引已按负责人指示开放，但车型数据尚未工程核验；正式域名下 canonical/OG/sitemap/robots 核对、竞品残留扫描仍需在发布前完成。
- 正式法律文本、生产 WordPress/数据库/邮件可靠性、OpenNext 目标平台、备份恢复和负责人交接需要各自完成核验。
- 未完成项目目标与费用/责任人核对前，不标记上线就绪。

稳定产品与发布边界见 [`PROJECT.md`](PROJECT.md)；系统状态、接缝和运行时见 [`ARCHITECTURE.md`](ARCHITECTURE.md)；页面验收见 [`PAGE-SPECS/`](PAGE-SPECS/README.md)。不要在本页重复这些规则全文。

## 等待启动

- [七份审计实施总计划](outputs/audit-v3/2026-10-17-seven-audit-implementation-plan.md)：202 个主编号已有[逐编号对照表](outputs/audit-v3/2026-10-17-audit-number-disposition-ledger.md)；20 张仓库责任卡与 72 项审计 Todo 已建立，仍处规划／待执行状态，未创建外部 Issue。[核验基线](outputs/audit-v3/2026-10-17-seven-report-verification-and-backlog.md)保留原始统计和误判说明。现行发布门槛仍以上述项目正本和实际验收为准。
- [商业化增量实施规划](outputs/reports/commercial-rebuild-technology-plan-2026-10-14.md)已完成：进入实施时先校准 `PROJECT.md`、`ARCHITECTURE.md` 与相关任务中关于内存询盘、多款清单、页面接管和隐私提交门槛的旧描述，再推进 OpenNext 样机与内容契约加固；本轮未实施代码重构，当前 P0 内容与索引问题仍优先。
- [方案甲范围确认](work/queued/2026-10-12-planA-scope-and-order.md)：等待确认法律内容是否合并为一个 WP Page、全站 `site` 常量的归属、轮毂目录页是否排除在迁移范围外。
- [首发产品与图片可信度核验](work/queued/2026-10-10-product-image-trust-verification.md)：等待首发型号清单、供货主体、图片/产品可发布声明和工程变体签字。
- [Hostinger / Cloudflare 平台样机与部署手册](work/queued/2026-10-14-deployment-platform-spike-and-guide.md)：已完成官方资料与本项目差距调研；待本地和预发布样机验证后确定正式平台并编写生产操作手册。[调研记录](resources/research/2026-10-14-hostinger-cloudflare-deployment-options.md)
- [SEO Machine 能力模块适配](work/queued/2026-10-16-seo-machine-module-adaptation.md)：已完成模块适配计划；公开内容索引授权已明确，Fitment 索引门槛不再阻塞首轮只读 SEO 审计。可先核查 metadata、canonical、语言路径、robots、sitemap 和公开内容结构；计划只吸收编辑工作流，不代表已安装或接入数据服务。

## Agent 更新约定

- 每次完成有意义的切片、发现阻断或用户改变范围时，更新本页的**当前事实**、优先级和下一步；替换已经过期的条目，不按日期追加流水。
- 完成过程、命令输出、截图和详细发现写在对应 `work/completed/` 或 `outputs/reports/`，本页只链接结论。
- 决策原因记入 `DECISIONS.md` 或 `docs/adr/`，本页只引用当前仍有效的影响。
- 当前任务只读 `work/active/` 中与本切片直接相关的一份任务文件；历史状态快照在 [`archive/status-history/`](archive/status-history/README.md)，默认无需加载。
- 若某个事实已被新验证推翻，直接更新本页和事实正本；旧记录留在历史档案，不继续作为当前要求引用。

## 最近完成

- [首页逐语言模块试点](work/completed/2026-10-16-homepage-multilingual-module-pilot.md)：四条独立语言 Page、五模块 PageView、受控编辑和调序、逐语言 SEO 资格、预览、撤回及恢复已完成本地验收；英文本地公开，其他语言保持待审草稿。[验收与全站迁移评审](outputs/reports/2026-10-16-homepage-pilot-and-sitewide-review.md)
- [公开内容索引、sitemap、robots 与 llms.txt](work/completed/2026-10-16-public-indexing-sitemap-robots-llms.md)：按负责人指示开放现有前端内容和四种语言的索引，将公开路由纳入 sitemap/llms.txt；API 排除、草稿预览限制和预发布边缘 noindex 保留，正式域名与预发布新构建验证待完成。
- [全站 SEO 文案与关键词术语对齐](work/completed/2026-10-16-sitewide-seo-copy-adjustments.md)：首页、全站默认 metadata、产品总览、自密封轮胎与相关说明统一到 Google US/en-US 术语；修正旧的单一铝件制造商/`self-healing` 表述，保留产品证据限定与所有索引门槛。当前 `WP_MODE=mock`，仅更新代码 fallback 和 Page SPEC，未写入 CMS。
- [2026-10-16 关键词意图与 Topic Map 复核](outputs/reports/sitewide-seo-topic-map-run_96deb74dab44.md)：基于产品知识库、第一轮 11 个与本轮 1 个 Google US/en-US SERP 样本，形成显性/隐性意图、需求方向和候选页面映射；`fenghuaitech.com` 为未来域名，线上 sitemap 尚不可访问，所有路径均未实时核验。
- [SEO 页面写作与模块优化计划](outputs/reports/seo-page-writing-and-module-optimization-plan-2026-10-16.md)：已完成首轮本地文案与发布门槛对齐，详见[执行记录](work/completed/2026-10-16-seo-page-writing-plan-implementation.md)。当前 `WP_MODE=live`；获批的 WordPress 正文可能覆盖本地 fallback。本轮未写 CMS，需完成相应文案审核后再同步。
- [2026-10-16 全站 SEO Topic Map 与关键词研究](outputs/reports/sitewide-seo-topic-map-run_49640978b2a8.md)：完成 Google US/en-US 免费研究，形成 81 条去重 query（实测词、PAA/相关词与待验证假设分开）、四条产品线主题评估、页面所有权图和 IA 路线；不含搜索量估值或改站实施。
- [峰徊产品与行业 SEO 知识库及关键词分析规程](docs/research/seo-knowledge-base/README.md)：整理公司角色、四条产品线、买家任务、证据边界和显性/隐性意图判断方法；同步导出 81 条关键词 CSV，供后续 AI 结合当次实时 sitemap 形成可追溯 Topic Map。它不改变产品事实或页面发布门槛。
- [SEO Machine 能力适配计划](outputs/reports/seo-machine-module-adaptation-plan-2026-10-16.md)：核对参考仓库并映射到本站内容接缝、索引门槛和 WordPress 审稿流程；未安装依赖、连接数据源或写入 CMS。
- [2026-10-16 移动端页面友好度修复](outputs/reports/mobile-page-friendliness-remediation-2026-10-16.md)：自密封轮胎移动裁切已修复；轮毂总目录与旋压目录保持 PC/移动均 24 张/页并在移动端使用两列；筛选渐进增强为可访问抽屉，保留无 JS GET 回退；筛选项按已选条件联动剩余型号数；专项生产模式 E2E 14/14、`npm run check` 全部通过。全量 Playwright 仍有既有询盘环境、多语言/robots 基线失败，未纳入本切片。
- [2026-10-14 技术栈与增量重建规划](outputs/reports/commercial-rebuild-technology-plan-2026-10-14.md)：核对现有依赖、内容与询盘关键代码及部署配置，完成选型、32 模块映射、10 个工作包、工期估算与迁移验收方案；未重跑历史业务测试或远程验证。
- [2026-10-14 商业独立站目标蓝图](outputs/reports/nextjs-headless-wordpress-commercial-blueprint-2026-10-14.md)：按用户认可的商业标准完成整体架构、内容模型、32 个模块改造说明与上线验收清单；属于目标建议，未审计现有实现，也未启动重构。
- [2026-10-13 文档与 Agent 工作流整理](work/completed/2026-10-13-documentation-workflow-reorganization.md)：统一文档地图，Claude Code 加入项目目录导航，工程流程按风险伸缩；DEC-101。
- [2026-10-13 预发布视觉诊断](outputs/reports/pre-run-visual-diagnosis-2026-10-13.md)：发现并记录当前 P0 图像问题。
- [2026-10-12 询盘端到端验证](outputs/reports/40-consentless-inquiry-qq-smtp-2026-10-12.md)：预发布 WordPress 持久化与 SMTP 接受已验证；不等同于正式法律审批或生产发布。
