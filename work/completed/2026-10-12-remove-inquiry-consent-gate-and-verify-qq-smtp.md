# 已完成：移除询盘提交同意门槛并验证 QQ SMTP

## 结果

- 本地与 9080 远程 `/request-a-quote` 不再要求隐私 checkbox、`privacyVersion` 或 `consentedAt` 才能提交。
- WordPress/MySQL 仍是询盘成功的最低标准；落库后才显示成功页，邮件失败不会回滚询盘。
- 远程 Playwright CLI 最终提交返回 `201 Created` 并进入感谢页；控制台 0 错误、0 警告。
- 远程 `INQ-20261012-0013` 的 Outbox 为 `accepted`，尝试 1 次，`last_error=NULL`；QQ SMTP 服务端已接受消息。
- 四语 `request-a-quote` 页面提示已从“隐私未批准、表单关闭”改为非阻塞的业务说明；本地与远程 WordPress 均已更新。

## 验证门禁

- `npm test`：42/42
- `npm run lint`：通过
- `npm run typecheck`：通过
- `npm run build`：通过，191 个页面
- 远程镜像：`fenghuai-frontend-9080:consentless-20261012-final2-amd64`，容器健康

## 证据与边界

- 完整记录见 [`40-consentless-inquiry-qq-smtp-2026-10-12.md`](/Users/fkycoya/Documents/Code/WordpressWheelSIte/outputs/reports/40-consentless-inquiry-qq-smtp-2026-10-12.md)。
- 本地 SMTP 配置不可用，因此本地只验证到落库与 Outbox 保存；真实 QQ SMTP 接受验证在 9080 完成。
- 当前工具不能直接读取 QQ 收件箱；“SMTP accepted”不等同于人工确认收件箱显示。
- 正式上线前仍需替换业务/法务确认的正式隐私版本，并在正式域名、正式 SMTP 配置下重跑验收。

## 后续任务

- 在 QQ 邮箱中人工确认最终测试邮件的收件人、主题、正文和编码。
- 准备正式隐私版本后，按正式域名重建并完成 canonical、sitemap、robots、SMTP 收件配置核对。
