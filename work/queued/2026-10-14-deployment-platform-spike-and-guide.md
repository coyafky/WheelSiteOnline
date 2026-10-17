# Hostinger / Cloudflare 平台样机与部署手册

- 状态：queued；待本地产品内容与上线门槛优先级允许后开始。
- 背景调研：[Hostinger 与 Cloudflare 部署选项](../../resources/research/2026-10-14-hostinger-cloudflare-deployment-options.md)
- 当前部署基线：[腾讯云 9080 预发布说明](../../deploy/frontend/README.md)
- 正式平台决定依据：DEC-009；不得把本任务或调研记录视为平台已选定。

## 目标

在 Hostinger Node.js Web App、Hostinger VPS + CloudPanel、Cloudflare Workers + OpenNext 中完成有证据的候选验证；对 Cloudflare `vinext` 只做兼容性对照。基于验证结果更新正式部署平台决策，并编写团队可执行、可回滚的中文部署手册。

## 范围

- 核对目标平台当前支持的 Next.js/Node.js 版本、构建和启动约定、环境变量、域名/TLS、资源限制、日志、监控、备份和回滚能力。
- 使用无生产客户数据的样机验证页面、WordPress API、询盘服务端路径、图片、缓存重验证、SEO URL 和恢复流程。
- 对照当前 `standalone` 构建与 OpenNext 适配所需改动；任何代码变更先在本地验证。
- 通过样机后编写平台专属部署手册，分别说明前端和 WordPress 的依赖、密钥、发布、检查、回滚和恢复步骤。

## 验收标准

- 实际目标环境完整运行询盘 API 和 WordPress 内容读取，证明不是静态导出路径。
- `NEXT_PUBLIC_APP_URL`、canonical、OG、sitemap 与 robots 在目标构建中正确。
- 图片、缓存失效、表单持久化、邮件失败恢复、日志告警、部署失败回滚均有验证结果。
- 明确主平台、备选平台、未支持行为和平台限制；若没有候选通过，则记录阻断与下一步，不写成可投产手册。
- 平台选择记录进入 `docs/adr/`，并同步 `ARCHITECTURE.md`、`STATUS.md` 与本任务结果。
- 正式手册包含版本/前置条件、环境变量管理、从提交到发布、验收清单、回滚、故障排查、WordPress 连接、备份恢复与费用/额度核对，并附官方来源和验证日期。

## 风险与约束

- 禁止 `output: "export"`，不将当前腾讯云 `:9080` 测试配置误当生产配置。
- 不在样机中向真实客户发信、不使用生产个人信息；不进行 DNS 切换或生产部署，除非得到明确授权。
- Cloudflare 官方指南将 vinext 标为 beta；不能仅凭该推荐覆盖 DEC-009 的 OpenNext 决策。
- OpenNext Worker 大小、图像处理、缓存行为和当前 WordPress 网络可达性必须在目标平台实测。

## 审计修复计划 A-09

**唯一负责范围：**平台样机与正式 URL。本节是七份审计的 A-09 正本；旧卡中其他复选框属于既有工作，不计入本次 72 项。

**来源编号：**C:M06-G4、C:M06-G12、D:M13-G7、D:M15-C2、D:M15-C5、D:M15-C8、D:M15-D3、D:M15-D4、D:M15-D6、D:M15-D8、AI:C3。逐条证据与误判/重复判定见[逐编号对照表](../../outputs/audit-v3/2026-10-17-audit-number-disposition-ledger.md)。

**证据摘要：**当前仓库定位到 deploy/frontend/compose.yml、next.config.ts、DECISIONS.md；逐编号的来源、反证和待核条件以对照表为准。生产行为未在规划阶段断言。

**用户可见结果：**候选 OpenNext 平台可运行完整站点，正式 URL、图片和缓存行为有样机证据。

**实施边界：**仅处理来源编号中确认可执行的根因；条件性风险先取证。维持类型化内容接缝、草稿不可公开和既有已审核事实。

**分步 Todo（本次审计计数）：**

- [ ] 运行 OpenNext 候选平台样机，验证 App Router、询盘 API、CMS 读取、图片和运行约束。
- [ ] 核对正式域名、TLS、WordPress 公网媒体 URL 与图片允许域，记录所需业务和运维输入。
- [ ] 比对构建期 NEXT_PUBLIC_APP_URL 与运行配置，抓 canonical、OG、sitemap、robots 的实际输出。
- [ ] 测单实例及计划实例数的缓存失效、滚动发布和重放；按结果决定共享协调或限制实例数。

**依赖与外部输入：**候选平台账号、域名/TLS/媒体 URL；DEC-005/009。缺少业务、工程、法律或运维确认时保持 queued/既有 active 状态，不提前发布。

**失败与回滚：**候选样机失败则记录不兼容并退出该平台；DNS/正式流量不切换。

**相关测试与完成证据：**目标平台样机跑完整 API、图片、URL 标签、单/多实例 revalidation 和滚动发布。完成时附命令、日期、环境、关键输出与审核人，并回填对照表的“先核实”结论。涉及路由、公共接缝或发布切片，再运行 lint、typecheck、build 与对应业务验证。

**总计划：**[七份审计实施总计划](../../outputs/audit-v3/2026-10-17-seven-audit-implementation-plan.md)。
