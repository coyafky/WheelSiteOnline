# 询盘四语切片预发布（已完成）

- 创建：2026-10-12
- 目标：把已验收的 `/request-a-quote`、`/contact` 四语业务正文和对应前端安全地发布到既有 9080/7080 测试服务器，不开放法律未批准的表单。
- 状态：已完成；发布到预发布，不等于正式上线。
- 发布提交：`d91d8ae`（全量快照）→ `71c060b`（受控运行时 seeder）→ `d98bbd1`（按页面键接管 WordPress）。

## 开工条件

1. 已使用 `/Users/fkycoya/Downloads/PersonWeb.pem` 通过 `root@119.91.205.130` 访问预发布。
2. 已冻结并推送分支 `codex/full-site-current-20261012`，当前工作树干净。
3. 已备份到 `/opt/fenghuai-backups/20261012-162734`，包含数据库 dump、compose、配置和 mu-plugin。
4. 已迁移 Pages 插件并导入页面 ID 1262/1263；`privacy` 未创建/未批准，页面接管按 key 生效，未覆盖未知 Page。
5. 已在开发机生成并校验 `linux/amd64` 镜像；远端只执行 `docker load` 与无构建启动，完成 canonical/sitemap/健康检查。

## 验收

- 9080/7080 各自健康；两页四语路径均 200，语言声明、非英语 noindex、业务正文和停用提示通过远端只读冒烟。
- `privacy` 未批准时前后端均 fail-closed；未向真实邮箱发送测试询盘。
- nginx 维持 `X-Robots-Tag: noindex, nofollow`；旧镜像、数据库和插件备份保留，回滚路径已记录。
