# 测试与质量矩阵

执行日期：2026-10-18；基线提交 `961762e`；工作区有未提交修改。

| Test ID | 命令/范围 | 结果 | 证据口径 |
|---|---|---|---|
| TEST-UNIT-001 | `npm test` | 144/144 通过 | 实际执行 |
| TEST-TYPE-001 | `npm run typecheck` | 通过 | 实际执行 |
| TEST-CONTRACT-001 | `npm run contract:check` | 7 项通过 | 实际执行 |
| TEST-THEME-001 | `npm run theme:check` | 通过 | 实际执行 |
| TEST-BUILD-001 | `npm run build` | 通过，生成 186 个静态页 | 实际执行 |
| TEST-AUDIT-001 | `npm run audit:prod` | 0 个生产依赖漏洞 | 实际执行 |
| TEST-LINT-001 | `npm run lint` | 失败：10 error / 8 warning | 错误集中在 `qa-audit/perf/*.cjs` 的 `require()` |
| TEST-E2E-001 | 定向 Playwright 22 项 | 20 通过 / 2 失败 | 实际执行，约 1.1 分钟 |
| TEST-HEALTH-001 | uptime probe dry-run | 503 | CMS `http-404`，站点 URL/重验证密钥缺失 |
| TEST-BACKUP-001 | `scripts/backup/backup.sh --dry-run` | 通过前置检查 | 未写备份，不能当作恢复成功 |

## E2E 失败

1. `e2e/publication-qualification.spec.ts:55`：RSC 请求预期 200，实际 307。
2. `e2e/site-contract.spec.ts:89`：退出预览后预期 `/insights`，实际仍停留在详情页。

## 未执行/阻塞

- 真实生产邮件送达、收件箱可见性。
- 生产数据库事务/回滚破坏性测试。
- 正式域名 canonical/OG/sitemap 烘焙值核对。
- 真实备份恢复、异地副本与加密校验。
- Nginx `log_format` 的服务器 `http` 作用域配置与 `nginx -t`。
- 全站真实浏览器/设备、Core Web Vitals 与生产负载测试。
