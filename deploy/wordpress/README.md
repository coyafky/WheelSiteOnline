# Headless WordPress 预发布部署

本目录定义 `119.91.205.130:7080` 的 WordPress 预发布运行方式。公开流量由宿主机
nginx 接收，再转发到仅绑定 `127.0.0.1:7081` 的 WordPress 容器；MySQL 不发布
宿主机端口。

## 安全边界

- 真实 `.env` 只保存在服务器 `/opt/fenghuai-wordpress/.env`，权限为 `0600`。
- 当前入口只有 HTTP，因此只用于预发布验收；正式运营前必须申请域名、HTTPS 与访问控制。
- SMTP 授权码只保存在服务器 `.env`，不得进入 Git、日志或运维截图。更换 QQ 授权码时
  先备份 `.env`，再重建 WordPress 容器并用合成询盘核对 CPT、outbox 与收件箱。
- `FH_INQUIRY_RETENTION_DAYS=0` 表示不自动删除；正式值等待隐私/法务确认。
- 数据库与上传目录分别保存在 Docker 命名卷中，更新容器不能删除卷。

## 更新与迁移顺序

1. 备份远端数据库、上传目录、nginx 配置和 `.env`。
2. 上传本目录与 `local-wp/mu-plugins/` 的已验收版本。
3. 执行 `docker compose pull && docker compose up -d`。
4. 从本地迁移数据库和 `wp-content/uploads`，然后修正 `home`、`siteurl`。
5. 先从服务器本机验证 `127.0.0.1:7081`，再切换 nginx 7080。
6. 验证 wheels、guides、后台登录、媒体 URL 与询盘端点 fail-closed。

## 回滚

每次切换前都要在 `/opt/fenghuai-backups/<时间戳>/` 保存原 nginx 配置、systemd
单元与状态。若新服务验证失败：恢复原 nginx 配置并执行 `nginx -t && systemctl
reload nginx`，随后重新启动 `fenghuai-site-preview.service`。旧应用目录不在部署过程中删除。
