# 七份审计实施总计划

日期：2026-10-17。此文件是执行导航；原始主张、逐编号结论和原因只在[对照表](2026-10-17-audit-number-disposition-ledger.md)维护。基线：[七份报告核验与拆分](2026-10-17-seven-report-verification-and-backlog.md)。

## 范围与状态

- 202 个主编号均有唯一去向：修复 32；先核实 108；重复 13；误判／预期行为 17；暂缓增强 32。其中 193 个是报告写出的候选问题，另 9 个是 AI 风险报告的未命中／无法判定项；这里的结论是实施分流，不等于已修复数量。
- 20 个逻辑 Issue，72 个本轮审计 Todo。A-01、A-02、A-09 复用既有卡；其余 17 卡新建于 `work/queued/`。卡片只规划，修复尚未实施。
- W1-C 的 14 个风险编号与 W1-D 的 15 个上线阻塞编号只在对照表交叉引用。

## 任务卡与依赖顺序

| 顺序 | 唯一责任卡 | Todo | 前置条件／阶段 |
|---:|---|---:|---|
| 01 | [A-01 逐路径逐语言发布资格](../../work/active/2026-10-12-full-site-four-language-implementation.md) | 4 | 先行；项目四语批准人、逐路径内容清单 |
| 02 | [A-02 公开内容与产品事实](../../work/queued/2026-10-10-product-image-trust-verification.md) | 4 | 输入到位后并行准备；业务负责人、首发型号、图权与工程签核 |
| 03 | [A-03 感谢页索引](../../work/queued/2026-10-17-audit-03-thank-you-indexing.md) | 2 | 先行；A-01 的 URL 发布资格合同 |
| 04 | [A-04 询盘幂等与事务](../../work/queued/2026-10-17-audit-04-inquiry-idempotency-transaction.md) | 3 | 先行；目标 MySQL 引擎与排序规则、隔离库备份 |
| 05 | [A-05 CMS 发布事件同步](../../work/queued/2026-10-17-audit-05-cms-publish-events.md) | 4 | 输入到位后并行准备；A-06 生产 WP 包及 A-09 样机 |
| 06 | [A-06 WordPress 生产包](../../work/queued/2026-10-17-audit-06-wordpress-production-package.md) | 4 | 先行；生产配置所有者、空环境样机 |
| 07 | [A-07 邮件与个人数据生命周期](../../work/queued/2026-10-17-audit-07-mail-personal-data.md) | 4 | 输入到位后并行准备；业务/法律负责人、测试邮件通道 |
| 08 | [A-08 备份、恢复和回滚](../../work/queued/2026-10-17-audit-08-backup-restore-rollback.md) | 4 | 输入到位后并行准备；运维负责人、备份目标与隔离恢复环境 |
| 09 | [A-09 平台样机与正式 URL](../../work/queued/2026-10-14-deployment-platform-spike-and-guide.md) | 4 | 输入到位后并行准备；候选平台账号、域名/TLS/媒体 URL；DEC-005/009 |
| 10 | [A-10 CI 业务门禁](../../work/queued/2026-10-17-audit-10-ci-business-gates.md) | 4 | 回归门禁；A-01/03/04/06 的关键业务路径 |
| 11 | [A-11 WordPress 内容接缝](../../work/queued/2026-10-17-audit-11-wordpress-content-boundary.md) | 4 | 后续切片；A-01 内容状态合同与 WP 测试环境 |
| 12 | [A-12 编辑模型与迁移](../../work/queued/2026-10-17-audit-12-editorial-model-migration.md) | 4 | 后续切片；编辑负责人、旧内容迁移窗口 |
| 13 | [A-13 SEO 元数据与事实标记](../../work/queued/2026-10-17-audit-13-seo-metadata-facts.md) | 4 | 后续切片；A-01 发布矩阵、A-09 正式基址样机 |
| 14 | [A-14 Insights 与 Fitment 发布边界](../../work/queued/2026-10-17-audit-14-insights-fitment-publication.md) | 4 | 后续切片；编辑与工程批准人、A-01 资格合同 |
| 15 | [A-15 图片来源与媒体管线](../../work/queued/2026-10-17-audit-15-media-provenance-pipeline.md) | 3 | 后续切片；A-02 已批准图片、A-09 媒体 URL |
| 16 | [A-16 移动端与无障碍](../../work/queued/2026-10-17-audit-16-mobile-accessibility.md) | 3 | 后续切片；目标设备/浏览器与读屏人员 |
| 17 | [A-17 性能基线](../../work/queued/2026-10-17-audit-17-performance-baseline.md) | 3 | 后续切片；A-09 样机与代表性页面 |
| 18 | [A-18 观测与安全配置](../../work/queued/2026-10-17-audit-18-observability-security.md) | 4 | 后续切片；运维账号、代理拓扑与密钥所有者 |
| 19 | [A-19 前端与内容代码收敛](../../work/queued/2026-10-17-audit-19-frontend-content-consolidation.md) | 3 | 随切片收口；A-11/12 运行时契约稳定后 |
| 20 | [A-20 任务及审查工作流](../../work/queued/2026-10-17-audit-20-task-review-workflow.md) | 3 | 随切片收口；当前未提交工作区与各任务负责人 |
| **合计** | **20 张** | **72** |  |

**关键路径：**A-01 → A-03 → A-04 → A-06。A-02、A-05、A-07、A-08、A-09 在取得输入后准备；A-10 提供回归门禁，再逐步推进 A-11 至 A-18。A-19、A-20 随相关切片收口。关键路径是规划顺序，不表示当前任务已完成。

## 阻塞输入与发布门槛

- **业务内容：**首发页面、型号、规格、供货、图片原件与使用权的批准记录；未批准内容不进入公开页、筛选、询盘或 sitemap。
- **生产配置：**WordPress 账号权限、MySQL 引擎/collation、邮件通道及退信、外部备份、监控、真实媒体 URL、代理头来源、OpenNext 目标平台与实例数均待责任人提供证据。
- **审核：**法律文本及个人数据保留/删除由业务和法律负责人确认；迁移、内容发布、真实邮件和生产配置必须先隔离演练并经对应负责人验收。
- **发布：**完成内容事实与语言资格、询盘持久化和邮件、备份恢复、平台 URL/缓存、CI 关键门禁及负责人验收后，方可提出正式上线审批；本计划不授权部署、DNS 变更或真实地址邮件。

## 执行与验收约定

- 每次只从唯一责任卡取下一条 Todo；“先核实”先取得生产或运行证据，再决定具体代码改动。重复编号只更新主编号对应卡。
- 修改公共接缝、路由或发布路径时，按项目完成定义跑相关业务验证及完整 lint、typecheck、build；记录命令、环境、结果与回滚。
- 完成卡片后更新其状态、`STATUS.md` 和对照表；若架构或持久接口取舍改变，更新对应正本和决策记录。
- 规划阶段只检查本文件、任务卡和引用链接及 `git diff --check`；不运行无关应用测试。
