# 询盘持久化与 QQ SMTP 端到端修复

## 用户结果

客户只有在询盘已经写入 WordPress/MySQL，并与 Outbox 同事务创建后，才能看到成功状态。邮件发送
失败不得回滚询盘；页面显示“已保存、待投递”。未写入数据库时保留表单与询盘清单并明确失败。

## 根因与修复

- 本地 Next 缺少 WordPress live 配置，仓储生成 `persisted:false` 的内存记录；
- API 仍返回 201，前端又没有校验持久化标志，造成假成功；
- API 现对未持久化统一返回 503，前端只接受 `ok:true && persisted:true`；
- Playwright 固定 mock 模式并禁止复用陌生本地服务，不触发真实邮件；
- 后端验收清理器从“清空所有询盘”收紧为“只删自身测试夹具”。

## 端到端结果

只发送 1 条合成询盘：`INQ-20261011-0001`。Next.js 返回 201、`persisted:true`、
`emailStatus:accepted`、`mock:false`；写入时 MySQL 的 CPT、幂等键、Outbox 各 1 条，Outbox 尝试
1 次、无错误。QQ SMTP 接受不等于最终收件箱投递，需人工按询盘号核对。

旧版后端验收脚本随后误清理了该本地合成记录；没有再次发信。脚本已修复并通过普通询盘哨兵保护
测试，今后不会再以“本地库”为由删除全部客户数据。

## 验收

- 失败测试先红后绿；
- 询盘 Chromium E2E 18/18；
- WordPress 后端 80/80；
- 邮件事件与恢复 18/18；
- Node 单元测试 42/42；
- lint、typecheck、PHP 语法通过；
- production build 191/191 页面；
- 清理边界探针通过；
- `git diff --check` 通过。

报告：`outputs/reports/23-inquiry-persistence-smtp-e2e-2026-10-11.md`。未提交、推送或部署。
