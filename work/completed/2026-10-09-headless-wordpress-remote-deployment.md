# Headless WordPress 腾讯云预发布部署

- **状态**：已完成
- **日期**：2026-10-09
- **目标**：后台 `http://119.91.205.130:7080`；联调前端 `http://119.91.205.130:9080`
- **来源**：用户 2026-10-09 明确授权覆盖既有 7080 预览；DEC-070

## 验收标准

- [x] 旧 nginx 配置、systemd 状态和应用目录可回滚，不删除历史服务。
- [x] Docker Engine/Compose 安装成功，MySQL 不暴露公网。
- [x] 本地 WordPress 数据库、媒体和 6 个 mu-plugin 完整迁移。
- [x] 远端 `/wp-json/fh/v1/wheels` 返回权威 138 型号，Insights 返回 6 篇和图片。
- [x] `/wp-admin/` 可访问，`/wp-json/fh/v1/inquiries` 未带服务密钥时 fail-closed。
- [x] 公网只开放 nginx 7080；容器 WordPress 仅监听服务器回环端口。
- [x] 备份、恢复和回滚命令写入中文部署文档。
- [x] 9080 前端以 Node 24 容器运行，canonical、WordPress API 和询盘服务密钥取值正确。
- [x] 从 9080 页面提交测试询盘，并在 7080 WordPress 后台确认同一询盘号。

## 安全边界

- 无域名/TLS 时只作为上线验收环境；QQ SMTP 密钥只保存在权限为 `0600` 的服务器
  `.env`，通知范围只限已批准的内部收件邮箱。
- 不删除 `/opt/fenghuai-site-preview`；切换失败时恢复 nginx 并重启原 systemd 服务。
- 数据库密码、询盘服务密钥和 WordPress salts 不进入 Git。

## 完成证据

- 旧服务回滚材料保存在服务器 `/opt/fenghuai-backups/20261009-175852/`，旧应用目录
  `/opt/fenghuai-site-preview` 未删除。
- 服务器使用 Docker Engine 29.9.0 与 Compose 5.6.0；WordPress、MySQL、Next.js 三个
  容器均通过健康检查。公网 7080/9080 由 nginx 持有，7081/9081 只绑定回环地址。
- WordPress 登录表单实测 `302`，带登录 Cookie 的 `/wp-admin/` 返回 `200`；询盘 CPT
  已注册且 `show_ui=true`，服务密钥存在，key/outbox/event 三个专用表均存在。
- 前端首次提交测试询盘返回 `201`，幂等重放返回 `200`，两次均为
  `INQ-20261009-0004`；WordPress 后台最新记录标题与编号一致。
- 按用户要求将本地已验收的 QQ SMTP 参数安全同步到远端，配置摘要完全一致；同步前配置
  备份为服务器 `.env.before-smtp-20261009-191040`。远端合成询盘
  `INQ-20261009-0007` 返回 `201` 与 `accepted`，后台 CPT 已发布，outbox 为
  `accepted`、尝试 1 次、无错误；向内部 QQ 收件邮箱发送 1 封验收通知。
- WordPress→Next 缓存刷新未签名请求返回 `401`；轮毂与 Insights 两类签名回调均成功。
- 首次 9080 镜像在 HTTP 环境仍携带 `upgrade-insecure-requests`，浏览器把 CSS/JS 升级
  为 HTTPS 后失败。已以协议条件修复并增加回归测试；Playwright 复核 `/zh` 为 0 条
  控制台错误、0 条警告，证据见 `outputs/remote-9080-zh-rendered-2026-10-09.png`。
- 2 GB 服务器不得执行 `next build`；本次高内存构建曾使实例失去响应，重启后清理
  1.863 GB 构建缓存。以后由开发机生成并验证 amd64 镜像，服务器只校验、加载和运行。
