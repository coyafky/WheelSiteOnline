# 安全架构（SECURITY）

制定日期：2026-10-17
依据：[`GAP_ANALYSIS.md` M14](../audit/GAP_ANALYSIS.md#m14-安全与权限) 实测证据
配套：[`DEPLOYMENT.md`](DEPLOYMENT.md) ｜ [`DATA_FLOW.md`](DATA_FLOW.md)

---

## 1. 现有防护矩阵

| 面 | 实现 | 证据 |
|---|---|---|
| 安全响应头 | CSP / Referrer-Policy / nosniff / X-Frame / Permissions-Policy / 条件 HSTS | `next.config.ts:94-137` + `tests/security-headers.test.mts` |
| 询盘限流 | IP 6 / 邮箱 3 / 10 分钟，键只存 SHA-256 | `guard.ts:74-99` |
| Origin 白名单 | 生产无 Origin 直接拒 | `guard.ts:37` |
| 蜜罐 + 时长陷阱 | `website` 字段 + 1.5s 下限 + 24h 上限 | `guard.ts:37-48` |
| Webhook 验签 | HMAC-SHA256 + `timingSafeEqual`，缺密钥 fail-closed | `revalidate/route.ts:20-33` |
| 邮件回调 | HMAC + 时间戳（300s）+ UNIQUE 去重 | `fenghuai-inquiries.php:541-575`、`:321` |
| 询盘写入鉴权 | `X-FH-Service-Key` + `hash_equals`，不走 query | `fenghuai-inquiries.php:521-530` |
| WP 容器加固 | `DISALLOW_FILE_EDIT` + xmlrpc 404 + 点文件 deny + 只绑 127.0.0.1 | `deploy/wordpress/` |
| 预发布 noindex | nginx 两层 `X-Robots-Tag` | `nginx-9080.conf:9`、`nginx-7080.conf:9` |
| 日志脱敏 | 9 处日志点均无 body/email/token/IP | 逐条核对 |
| 凭证管理 | 只提交 `.env.example` | `.gitignore:13-17` |

---

## 2. 必须修的缺口

### 2.1 预览密钥走 URL query ⚠️ High

```ts
// src/app/api/preview/route.ts:22
if (secret !== process.env.WP_PREVIEW_SECRET) return ...
```

两个问题：
1. **secret 在 URL query** → 落进 nginx access log、浏览器历史、Referer
2. **`!==` 非常量时间比较**（对比 `revalidate/route.ts:27` 已用 `timingSafeEqual`）

**修复（P0）**：
- 改为一一次性签发的短时效 token（HMAC + 时间戳），或改为 POST body
- 使用 `timingSafeEqual`
- 在 nginx 层对 `secret=` 参数做日志脱敏

### 2.2 限流可被 IP 头伪造绕过 ⚠️ High

```ts
// guard.ts:80-85
clientAddress() 直接采信 cf-connecting-ip / x-real-ip / x-forwarded-for
```

`nginx-9080.conf:14` 只设置 `X-Real-IP`/`X-Forwarded-For`，**未剥离客户端自带的 `CF-Connecting-IP`**。

**修复**：
- nginx 显式 `proxy_set_header CF-Connecting-IP ""` 清空不可信头
- 应用侧只信任**最靠近的一跳**设置的 IP
- 加 Nginx `limit_req` 作为独立兜底

### 2.3 WP 后台仅 HTTP ⚠️ High

`deploy/wordpress/README.md` 明确「当前入口只有 HTTP」→ 登录凭据明文传输。

**修复（P0，上线前必须）**：配 TLS（Let's Encrypt），或至少限源 IP + 强制 HTTPS 跳转。

### 2.4 WP 侧无速率限制 ⚠️ Medium~High

`/fh/v1/inquiries` 只校验服务密钥 + `hash_equals`，**无速率限制**。限流全在 Next 侧 → **绕过 Next 直打 WP 即可无限写入**（若 8081 可外部触达则 High）。

**修复**：
- 确认 WP 端口不对公网暴露（当前只绑 127.0.0.1 ✅）
- WP 侧加基于 IP/邮箱的计数限制（DB 表或 transient）
- 防火墙层限制只有 Next 容器 IP 可访问 7081

### 2.5 CSP 允许 `'unsafe-inline'` ⚠️ Medium

`next.config.ts:105` `script-src 'self' 'unsafe-inline'`，无 nonce/hash → XSS 缓解能力有限。

**修复（P2）**：引入 nonce-based CSP，去掉 `unsafe-inline`。

### 2.6 回执密钥回落到服务密钥 ⚠️ Medium

`receipt.ts:5-11` 未配 `INQUIRY_RECEIPT_SECRET` 时回落使用 `WP_INQUIRY_SERVICE_KEY` → 轮换会同时打断两条链路。

**修复**：强制要求独立密钥，缺失即 fail-closed。

### 2.7 生产 remotePatterns 可能允许内网访问 ⚠️ Medium~High

`next.config.ts:4-18` 把 `localhost:8081` / `127.0.0.1:8081` 写死在**所有环境**的配置里，配合 `dangerouslyAllowLocalIP`。

**修复**：按 `NODE_ENV` 或 `WP_API_URL` 是否存在来条件化；生产构建产物中 `grep -o "8081"` 必须为 0。

### 2.8 隐私同意未采集 ⚠️ Medium（合规）

`fenghuai-inquiries.php` 注释明写「The enquiry path does not require a consent checkbox」；
`store.ts:236-238` 显式 `consentedAt: undefined`。

**修复**：采集同意时间戳 + 隐私政策版本号（`NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION` 已存在）。

---

## 3. 敏感数据清单

| 数据 | 存放 | 加密 | 留存 |
|---|---|---|---|
| 询盘邮箱/电话 | WP postmeta 明文 | ❌ | `FH_INQUIRY_RETENTION_DAYS` |
| SMTP / Resend 密钥 | 常量或 WP option（**待核实**） | — | — |
| WP 应用密码 | `.env` | — | — |
| 预览 / 失效 / 回执密钥 | `.env` | — | — |
| 备份文件 | `/opt/fenghuai-backups/`（同机） | ❌ | 无策略 |

**铁律**：
- 密钥**绝不**出现在日志、URL、错误信息、构建产物
- 备份内含 `.env` → **必须加密存储**
- 轮换任何密钥前，先确认它被几处复用

---

## 4. 攻击面清单

| 入口 | 暴露面 | 防护 | 缺口 |
|---|---|---|---|
| `/api/inquiries` | 公网 | Origin + 体积 + 蜜罐 + 限流 | 限流可绕过（2.2） |
| `/api/preview` | 公网 | 共享密钥 | 密钥在 URL（2.1） |
| `/api/revalidate/wordpress` | 公网 | HMAC | 无时间戳/nonce |
| `/fh/v1/*`（WP） | 仅 127.0.0.1 | 服务密钥 / 公开读 | 无速率限制（2.4） |
| WP 后台 7080 | 公网 | 口令 | 明文 HTTP（2.3） |
| `/wp-json/wp/v2/*` | 视配置 | Basic token | 需核实账号 capability |

---

## 5. WP 最小权限

| 能力 | 要求 |
|---|---|
| Next 读内容的账号 | **只读**（`read`）。当前 `WP_API_TOKEN` 实际 capability **待核实** |
| 询盘写入 | 走服务密钥端点，不依赖 WP 用户 |
| 编辑账号 | 最小角色；`DISALLOW_FILE_EDIT` 已开 |
| Agent（若有） | 独立账号 + 操作日志，不复用人工账号 |

---

## 6. 安全检查清单（发布前）

```bash
# 安全头齐全
curl -sI https://<host>/ | grep -E "content-security-policy|referrer-policy|x-content-type-options|x-frame-options|permissions-policy|strict-transport-security"

# 预览密钥不进日志
grep -c "secret=" /var/log/nginx/*access.log    # 目标 0

# 限流有效
for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<host>/api/inquiries -d '{}' ; done
# 期望第 7 次起 429

# .env 未入库
git ls-files | grep -iE "\.env($|\.)" | grep -v example   # 空

# 生产构建不含 localhost
grep -o "8081" .next/server/**/*.js | wc -l              # 0

# 敏感路径不泄露
for p in /.env /.git/config /wp-admin /wp-json/wp/v2/users; do curl -s -o /dev/null -w "$p %{http_code}\n" https://<host>$p; done
```

---

## 7. 事故响应

| 场景 | 动作 |
|---|---|
| 密钥泄露 | 立即轮换 → 查日志确认是否被使用 → 评估影响面 |
| 询盘被刷 | 限流阈值临时下调 → 查 Origin 与 IP 分布 → 加验证码（暂未实现） |
| 内容被误改 | WP revision 回滚 → 【目标】查审计日志定位操作者 |
| 站点被挂马 | 下线 → 从备份恢复 → 审查 WP 插件与账号 → 改所有密钥 |
