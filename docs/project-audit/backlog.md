# 审计后 Backlog

| Task ID | 优先级 | 分类 | 任务 | 验收标准 | 阻止上线 |
|---|---|---|---|---|---|
| AUD-TASK-001 | P0 | 缺陷 | 修复 lint 10 error | `npm run lint` 0 error | 是 |
| AUD-TASK-002 | P0 | 缺陷 | 修复定向 E2E 两项失败 | 22/22 通过且日志无新异常 | 是 |
| AUD-TASK-003 | P0 | 安全 | 收紧真实客户端 IP 信任链 | 伪造转发头不能绕过限流 | 是 |
| AUD-TASK-004 | P0 | 部署 | WordPress 后台 TLS 与 Nginx 配置验收 | HTTPS + `nginx -t` + 安全头 | 是 |
| AUD-TASK-005 | P0 | 发布 | 正式域名构建变量与产物核对 | canonical/OG/robots/sitemap 全部使用批准域名 | 是 |
| AUD-TASK-006 | P1 | 运维 | 真实备份恢复演练 | 独立目标恢复、抽查、耗时和责任人记录 | 是 |
| AUD-TASK-007 | P1 | 监控 | 接通 uptime 与告警送达 | 人为故障能收到告警并恢复 | 是 |
| AUD-TASK-008 | P1 | 内容 | 法律/业务/图权/规格审批 | 对应页面有明确批准记录 | 是 |
| AUD-TASK-009 | P1 | 邮件 | 真实收件箱可见性与失败重试验收 | 持久化、outbox、收件、重放均有证据 | 是 |
| AUD-TASK-010 | P1 | i18n | 补 hreflang-sitemap 网络级一致性 | 所有公开 locale 集合一致 | 否 |
| AUD-TASK-011 | P2 | SEO/GEO | Breadcrumb/FAQ/GEO 事实结构化 | 只发布可追溯事实并通过 schema 检查 | 否 |
| AUD-TASK-012 | P2 | CI/CD | 明确 OpenNext 平台并建立可回滚发布 | 镜像可追溯、预发布门禁、人工生产审批 | 是 |

复杂度均为审计估算，不是交付承诺；负责人和计划日期待管理层分派。
