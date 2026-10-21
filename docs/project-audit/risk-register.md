# 风险登记

| Risk ID | 级别 | 风险 | 证据/影响 | 处理方向 |
|---|---|---|---|---|
| RISK-001 | P0 | 当前 `npm run check` 不会全绿 | lint 10 error | 修复 QA CJS lint 策略或文件实现 |
| RISK-002 | P0 | 定向 E2E 两项失败 | RSC 307、退出预览路径错误 | 修复测试或实现并复跑 |
| RISK-003 | P0 | WordPress 管理面仅 HTTP | 登录凭据可能明文 | 上线前强制 TLS |
| RISK-004 | P0 | 转发 IP 信任链可被伪造 | `clientAddress()` 信任头；Nginx 未清空 CF 头 | 明确信任代理并覆盖不可信头 |
| RISK-005 | P0 | 构建期站点 URL 可能烤错 | canonical/OG/sitemap 静默错误 | 构建和部署后双重断言 |
| RISK-006 | P1 | 生产备份可恢复性未证明 | 只有 dry-run；无异地/加密证据 | 执行隔离恢复演练 |
| RISK-007 | P1 | 真实告警送达未证明 | handler 存在，外部通道未验 | 接收人、阈值、演练 |
| RISK-008 | P1 | 法律/商业内容未经正式确认 | 隐私、条款、规格、适配影响上线 | 法务/业务签字后发布 |
| RISK-009 | P1 | 非英文页面族审批闭环不完整 | 4 语言注册不等于已公开 | 逐页面族建立批准与 hreflang 验证 |
| RISK-010 | P1 | GEO 事实字段缺失 | 三字段零命中 | 有来源后再结构化，不编造 |
| RISK-011 | P1 | `llms.txt` 列出 thank-you | 与 noindex/sitemap 口径冲突 | 移除转化确认页 |
| RISK-012 | P2 | CSP 仍含 unsafe-inline | 降低脚本/样式注入防护强度 | nonce/hash 渐进收紧 |
