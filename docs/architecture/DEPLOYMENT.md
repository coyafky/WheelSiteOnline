# 部署架构（DEPLOYMENT）

制定日期：2026-10-17
配套：[`TARGET_ARCHITECTURE.md`](TARGET_ARCHITECTURE.md) ｜ [`SECURITY.md`](SECURITY.md) ｜ [`../runbooks/`](../runbooks/)

> 现状描述取自 `deploy/` 与源码审计；目标态标注为【目标】。

---

## 1. 环境拓扑

### 1.1 预发布（当前唯一环境）

```
公网 :9080
  │
  ▼ Nginx（deploy/frontend/nginx-9080.conf）
  │   · add_header X-Robots-Tag "noindex, nofollow" always
  │   · X-Real-IP / X-Forwarded-For
  │   · access_log / error_log
  ▼ 127.0.0.1:9081
Next.js 容器（:3000 内部）
  · image: fenghuai-frontend-9080:2026-10-09   ← 硬编码日期 tag
  · cap_drop: ALL / no-new-privileges / USER node
  · 内存 700M
  · healthcheck: fetch('/robots.txt')
  │
  ▼ 127.0.0.1:7081（只绑本机）
WordPress 容器（PHP 8.3-apache，digest 固定）
  │   · DISALLOW_FILE_EDIT
  │   · xmlrpc.php → 404
  │   · 点文件 deny all
  ▼
MySQL 8.0 容器（digest 固定，不发布端口）
  · 命名卷 db_data / wordpress_data
```

公网 :7080 → Nginx（`deploy/wordpress/nginx-7080.conf`）→ 127.0.0.1:7081（WP 后台，**当前仅 HTTP**）

### 1.2 【目标】生产

变化点：
1. **全站 HTTPS**（前端 443 + WP 后台 443，Let's Encrypt 自动续期）
2. **限流下沉到 Nginx**（`limit_req_zone` 兜底进程内限流）
3. **前端镜像 tag = git SHA**
4. **`/healthz` 应用级健康检查**（探 DB + WP + 缓存可写）
5. 环境变量按环境分离（预发布 / 生产两套 `.env`，不共用）

---

## 2. 部署流程

### 2.1 当前（手工）

```
① 本地：npm run check 全绿
② 本地：docker build -f Dockerfile.prebuilt --platform linux/amd64 -t ...
③ 上传镜像 tar
④ 服务器：sha256sum 校验（仓库内无脚本，人工执行）
⑤ docker load
⑥ docker compose up -d --no-build
⑦ 人工 curl 抽查
```

**已知约束**：`deploy/frontend/README.md:31`「服务器只有 2 GB 内存，**不得在服务器执行 next build**」

### 2.2 【目标】CI/CD

```
PR 阶段（CI）
  ├─ npm ci
  ├─ npm run check（theme:check + test + lint + typecheck + build）
  ├─ npx playwright test（新增）
  ├─ npm audit --omit=dev
  └─ 契约比对脚本（新增）

merge main 阶段（CD，新增）
  ├─ docker build --platform linux/amd64 -t <registry>/frontend:${GIT_SHA}
  ├─ 推送镜像
  ├─ 部署到预发布（自动）
  ├─ 运行部署校验脚本（新增加固）
  └─ 通过 → 手动审批 → 生产
```

**必须先解决的坑**（MEMORY 与历史记录已踩）：
- `.next/required-server-files.json` 硬编码构建机的 `appDir` 绝对路径 → **不能在 Mac 上构建再传服务器**
- `NEXT_PUBLIC_APP_URL` 构建期烤入 → **跨机部署必须逐项比对烤入值**，不能只看页面 200
- 正解已验证：容器内构建（`node:20-slim` / 与服务器同 Node 版本），或构建机与目标机路径一致

---

## 3. 回滚策略

| 层 | 当前 | 【目标】 |
|---|---|---|
| 前端 | 旧镜像 + `/opt/fenghuai-backups/<时间戳>/` 人工恢复 | 镜像 tag 可追溯 → `compose` 改 tag 即回滚；保留最近 5 个版本 |
| WordPress | 备份目录（db dump + compose + 配置 + mu-plugin） | 同上 + 每次发布前自动备份 |
| 数据库 | 无自动备份脚本 | 【目标】每日 dump + 异地副本 + 恢复演练记录 |
| 内容 | WP revision | 保留；【目标】加 Agent 操作审计日志 |

**回滚判据**：`systemctl`/`docker` 里旧实例被 SIGTERM 的收尾日志**不是**新实例失败；判据是健康检查 + 实际 HTTP 探活。

---

## 4. 环境变量清单（只列名）

| 变量 | 用途 | 缺失后果 |
|---|---|---|
| `WP_API_URL` | 服务端读 WP | mock 模式（不报错，静默降级） |
| `WP_PUBLIC_API_URL` | 浏览器可用地址 | 图片 remotePatterns 缺失 |
| `WP_API_TOKEN` | Basic 认证读 `/wp/v2` | 401 |
| `WP_MODE` | `live` 才真连 | 一直 mock |
| `NEXT_PUBLIC_APP_URL` | **烤入构建产物**的 canonical 域名 | sitemap 空 / robots 全禁 / llms.txt 404 |
| `WP_REST_ROOT` | REST 根路径覆盖 | 自动推导 |
| `WP_INQUIRY_SERVICE_KEY` | 询盘写入鉴权 | 503 fail-closed |
| `FH_INQUIRY_WEBHOOK_SECRET` | 邮件回调 HMAC | 回调被拒 |
| `FH_INQUIRY_RETENTION_DAYS` | 询盘保留期 | 默认值 |
| `WP_PREVIEW_SECRET` | 预览进入密钥 | 预览不可用 |
| `WP_REVALIDATE_SECRET` | 失效 webhook HMAC | 失效全 401 |
| `INQUIRY_RECEIPT_SECRET` | 感谢页回执签名 | 回落使用 `WP_INQUIRY_SERVICE_KEY` |
| `RESEND_API_KEY` | 邮件兜底 | 走 SMTP |
| `INQUIRY_FROM` / `INQUIRY_TO` | 收发件人 | 邮件失败 |
| `NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION` | 隐私版本号 | 页面显示占位 |
| `INQUIRY_ALLOWED_ORIGINS` | Origin 白名单 | 生产拒绝所有提交 |

**【目标】新增**：`FH_REVALIDATE_QUEUE_*`（重投）、`SENTRY_DSN`（可选）、`UPTIME_*`（探活）

---

## 5. 备份与恢复【目标】

```
每日 03:00（系统 cron，非 WP-Cron）
  ├─ mysqldump --single-transaction → gzip
  ├─ tar wp-content/uploads
  ├─ sha256sum 校验
  ├─ 上传到异地（对象存储或另一台机）
  └─ 本地保留 7 天，异地保留 30 天

每月一次恢复演练
  ├─ 新容器导入 dump
  ├─ wp option get home 与线上一致
  ├─ 抽查 3 张图片可访问
  └─ 记录耗时 + 负责人到 docs/runbooks/
```

**注意**：备份内含 `.env` → **必须加密存储**。

---

## 6. 监控与告警【目标】

| 项 | 工具 | 阈值 |
|---|---|---|
| 站点可用性 | Uptime Kuma（自托管，免费） | 3 次连续失败告警 |
| 5xx 率 | Nginx 日志聚合 | 5 分钟 > 1% |
| 询盘失败 | WP outbox 积压（已有摘要） | due > 0 即告警 |
| 缓存失效失败 | 重投队列长度 | > 10 持续 10 分钟 |
| 备份失败 | 备份脚本退出码 | 非 0 即告警 |
| 磁盘 | node_exporter 或 cron 脚本 | > 80% |

**告警必须接到真人**：当前 `do_action('fh_inquiry_delivery_alert')` **无监听者**，这是必须修的项。建议接到邮件 + 飞书/微信机器人。

---

## 7. 部署铁律（本项目）

1. **禁止在 2GB 服务器构建**：`next build` 会触发 swap 死亡螺旋（可用 ping 通但 SSH 卡 banner）
2. **跨机部署必须比对烤入值**：`.next` 里的 `appDir`、`NEXT_PUBLIC_APP_URL`、canonical/OG/sitemap 实际输出
3. **rsync `--delete` 必须先 dry-run**：长选项带 `=值` 会被误解析
4. **禁止 `output: "export"`**：会破坏询盘 API
5. **构建产物必须保留**：用于回滚
6. **预发布测试成功 ≠ 生产已批准**：内容、法律、运行时各自需验收
7. **任何涉及 DNS / 域名 / 生产数据库的操作**：先停下问
