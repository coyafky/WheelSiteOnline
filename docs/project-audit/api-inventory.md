# API 清单

## Next.js 接口

| Entity ID | Method / Endpoint | 认证与保护 | 状态 |
|---|---|---|---|
| API-HEALTH | GET `/api/health` | 不输出凭据；关键依赖失败为 503 | 已实现，当前本地 503 |
| API-INQUIRY-CREATE | POST `/api/inquiries` | Origin、体积、反自动化、限流、Zod | 已实现；生产待验 |
| API-INQUIRY-LIST-DENY | GET `/api/inquiries` | 固定 404 | 已验证设计 |
| API-PREVIEW-ENTER | GET `/api/preview` | secret 常量时间比较；仍兼容 query | 部分完成 |
| API-PREVIEW-EXIT | POST `/api/preview/exit` | Draft Mode cookie | E2E 有 1 失败 |
| API-PUBLICATION | GET `/api/publication` | 内部 Proxy 查询 | 已实现 |
| API-REVALIDATE | POST `/api/revalidate/wordpress` | HMAC + `timingSafeEqual` | 已实现；外部待验 |
| API-LLMS | GET `/llms.txt` | 站点 URL 缺失时 404 | 已实现，内容仍需收敛 |

## WordPress 自定义 REST

| Entity ID | Endpoint | 证据 |
|---|---|---|
| WP-PAGES-V1 | GET `/fh/v1/pages` | `fenghuai-pages.php:90-101` |
| WP-PAGES-V2 | GET `/fh/v2/pages` | `fenghuai-pages.php:102-111` |
| WP-WHEELS | GET `/fh/v1/wheels` | `fenghuai-wheel-authoring.php:343-352` |
| WP-GUIDES | GET `/fh/v1/guides` | `fenghuai-guides.php:240-270` |
| WP-INQUIRIES | POST `/fh/v1/inquiries` | `fenghuai-inquiries.php:482-491` |
| WP-EMAIL-EVENTS | POST `/fh/v1/email-events` | `fenghuai-inquiries.php:493-498` |

## 外部服务

- WordPress 核心 `/wp-json/wp/v2`：pages、posts、media、wheel models 等。
- SMTP / PHPMailer：主邮件通道。
- Resend `https://api.resend.com/emails`：WordPress 兜底；Next 仍有旧实现，存在双实现漂移风险。

## 风险

- 公开读接口依赖 PHP 内部发布状态过滤，仍需在目标环境用匿名 HTTP 复核。
- 预览 query secret 尚未完全退役。
- 客户端 IP 信任链仍可能被伪造头影响，见 `risk-register.md`。
