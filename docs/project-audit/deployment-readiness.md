# 部署准备度

## 结论

当前建议：**不进入正式生产上线**。代码具备预发布基础，但质量门禁、生产平台、TLS、正式域名、外部依赖、恢复与告警证据未闭环。

| 项目 | 状态 | 证据 |
|---|---|---|
| Node/Next standalone | 已验证 | `npm run build` 通过 |
| OpenNext 平台 | 待决策 | 仓库无 `@opennextjs/*` / Wrangler |
| WordPress/MySQL Compose | 已实现未生产验收 | `deploy/wordpress/` |
| 前端 Nginx/Compose | 已实现未生产验收 | `deploy/frontend/` |
| 前后台 HTTPS | 阻塞 | WP 后台当前仅 HTTP |
| 正式域名与 DNS | 阻塞 | 需审批；不得擅自修改 |
| 环境变量管理 | 部分实现 | `.env.example` 有清单；生产值未核验 |
| CI | 已实现 | check、audit、E2E job |
| CD | 待开发 | 无镜像推送/自动预发布/生产门禁 |
| 回滚 | 已设计未验证 | 镜像与备份方案存在，未做生产演练 |
| 健康检查 | 已实现但当前失败 | 本地 `/api/health` 返回 503 |
| 备份 | 脚本可 dry-run | 未真实恢复、未证明异地/加密 |
| 监控告警 | 部分实现 | probe 和监听器存在，送达未验 |
| 业务验收 | 阻塞 | 法律、图权、规格、邮件、生产内容待确认 |

## 上线硬门槛

1. lint、typecheck、build、单测和批准范围 E2E 全绿。
2. 正式域名构建后的 canonical、OG、robots、sitemap 与 `NEXT_PUBLIC_APP_URL` 一致。
3. WordPress 后台 HTTPS；Nginx 配置通过目标服务器 `nginx -t`。
4. 询盘 201、数据库持久化、outbox、真实收件、失败重试和权限验收。
5. 备份可恢复、回滚可执行、告警可送达。
6. 竞品残留扫描为 0；法律、产品事实、图权和公开语言全部有批准记录。
