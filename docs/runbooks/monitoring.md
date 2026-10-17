# 运维手册：监控与告警

最后验证：2026-10-17
相关：`scripts/monitor/uptime-probe.sh` ｜ `/api/health` ｜ `deploy/frontend/compose.yml`

---

## 1. 问题背景

审计（M16）发现三件事，本条逐一解决：

| 发现 | 现状 |
|---|---|
| healthcheck 探 `/robots.txt` | ❌ 静态路由，DB/CMS 挂了照样 200 → 已换成 `/api/health` |
| 无 uptime 探活 | ❌ 站点挂了没人知道 → 已提供 `uptime-probe.sh` |
| 告警钩子无监听者 | ❌ `do_action` 空转 → 已接线（见 `backup-and-restore.md` 同级的告警插件） |

---

## 2. 应用级健康检查 `/api/health`

### 检查项与语义

| 检查 | ok | warn | fail |
|---|---|---|---|
| `site-url` | 已配置且合法 | 未配置（sitemap 空、robots 全禁） | 格式非法 |
| `inquiry-key` | 已配置 | — | 未配置（询盘返回 503，**丢线索**） |
| `revalidate-secret` | 已配置 | 未配置（失效通知全 401） | — |
| `cms` | live 且可达 | mock 模式 | live 但不可达 |

### 状态码

- **200 `healthy`** — 全部 ok
- **200 `degraded`** — 有 warn 无 fail（能服务，但有配置问题）
- **503 `unhealthy`** — 有 fail（关键依赖不可用）

### 实测证据（2026-10-17）

| 场景 | 输出 |
|---|---|
| mock 模式 | `degraded` / 200，`cms: warn (mock-mode)` |
| live 但 CMS 不可达 | **`unhealthy` / 503**，`cms: fail (TypeError)` ✅ |
| 缺询盘密钥 | **`unhealthy` / 503**，`inquiry-key: fail (not-configured)` ✅ |
| CMS 真实可达（容器网络内实测 200） | `cms: ok` |

⚠️ **验证限制（诚实记录）**：宿主机的 `next start` 不在 Docker 网络里，解析不了
`fh-wp`，所以「healthy 全绿」这一态是在容器网络内用等价的 HTTP 探测确认的
（`docker run --network local-wp_default` → CMS 返回 200），不是端到端跑出来的。

### 安全

- 只输出布尔值与错误类名，**不含 URL、凭证、响应体**
- 响应带 `cache-control: no-store` 与 `x-robots-tag: noindex`

---

## 3. 容器健康检查

`deploy/frontend/compose.yml` 已从探测 `/robots.txt` 改为 `/api/health`：

```yaml
test: fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1))
interval: 30s       # 原 15s：健康检查现在真的会打 CMS，不必过于频繁
timeout: 8s         # > CMS 自身的 3s 超时
retries: 5          # 原 12
start_period: 60s   # 冷启动 + 首次 CMS 读不能误判为失败
```

---

## 4. Uptime 探活

```bash
# 探测一次
scripts/monitor/uptime-probe.sh --url https://example.com

# 只探测不告警（用于验证部署）
scripts/monitor/uptime-probe.sh --url https://example.com --dry-run

# 自定义状态目录与阈值
scripts/monitor/uptime-probe.sh --url https://example.com \
  --state-dir ~/.config/alma/state/uptime-probe --threshold 2
```

### 设计要点

| 点 | 说明 |
|---|---|
| **状态机告警** | 只在「确认失败」与「恢复」两个**转换点**告警，连续失败不重复通知 |
| 失败阈值 | 默认连续 2 次才告警（`FH_UPTIME_FAIL_THRESHOLD`） |
| 不只是 200 | 还验证响应体含 `<html>`（防代理错误页/门户劫持） |
| 借力 health | 健康端点自己知道原因，直接透传它的判词而不是猜 |
| 无外部依赖 | 只用 `curl` + `sendmail`；不引入付费监控服务 |
| 状态落盘 | `state` + `history.log`，删掉 `state` 即可重置状态机 |

### 退出码

| 码 | 含义 |
|---|---|
| 0 | 健康 |
| 1 | 不健康 |
| 2 | 参数缺失 |

### 实测证据（2026-10-17）

```
[站点挂掉] UNHEALTHY ... home returned HTTP 000 (consecutive=1)
           state: last_status=down fail_count=1
[站点恢复] RECOVERED http://127.0.0.1:3141
           state: last_status=up fail_count=0
历史: FAIL ... (consecutive=1)
      UP   ... recovered after 1 failed checks
```

⚠️ **修掉的真 bug**：第一版失败时只累加 `fail_count` 而不把 `last_status` 置为
`down`，导致恢复时判不出「此前是 down」→ **恢复事件与恢复通知双双丢失**。
修复后两者都正确记录。

### 定时化（尚未启用）

```cron
*/5 * * * * cd /path/to/repo && FH_UPTIME_ALERT_TO=ops@example.com \
  ./scripts/monitor/uptime-probe.sh --url https://example.com >> /var/log/fenghuai-uptime.log 2>&1
```

⚠️ 启用前需确认：
1. 正式域名与 HTTPS 已就绪（当前预发布是 HTTP + IP）
2. `sendmail` 在目标主机可用（不可用时脚本会明确报「告警未发出」而非静默）

---

## 5. 告警通道依赖

`uptime-probe.sh` 用 `sendmail`；WordPress 侧告警用 `wp_mail`（已配置 SMTP）。
两条通道**互相独立**——这正是有意为之：邮件服务本身出问题时，至少还有一条能报。

---

## 6. 仍未做

- **未接外部 uptime 服务**：按「免费优先 + 无外部依赖」原则只做了自托管脚本
- **定时任务未启用**：需先有正式域名
- **无错误追踪（Sentry 等）**：5xx 仍只能翻 `docker logs`
- **日志无轮转策略**：nginx 未配 logrotate，容器未配 `max-size`
