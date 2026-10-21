# 新加坡服务器部署与临时公开

开始日期：2026-10-20
状态：进行中

## 目标

在 `43.160.228.93` 部署 Next.js、WordPress、MySQL，并用个人 Gmail
完成服务器上的询盘通知验收。用户于 2026-10-20 授权公开；当前先以全站暂不收录、未完成栏目屏蔽的方式提供访问，正式收录仍受内容、法律、备份与监控门槛约束。
执行方案以 `docs/architecture/DEPLOYMENT.md` 为正本，阶段状态以
`docs/implementation/TASKS.md` 为正本。

## 已完成的私有验收

- SSH 公钥登录成功；盘点 OpenCloudOS 9.6、x86_64、2 核、约 3.6 GiB 内存、60 GB 系统盘。
- 安装 Docker Engine 29.9.1 和 Compose 5.6.0；保留原有宝塔面板。
- `/opt/fenghuai-stage/` 下运行 WordPress/MySQL，只向 `127.0.0.1:7081` 暴露 WordPress；数据库不发布端口。
- 从本地迁移非询盘内容与媒体；服务器核对 1053 条非询盘内容、0 条历史询盘、0 条历史 Outbox。源数据仍留本机。
- 数据库备份在隔离 MySQL 容器恢复，核对 1053/0/0；媒体归档在隔离目录恢复，核对 2928 个文件。演练后清理临时容器与目录，保留原始归档。
- Gmail 密钥仅在服务器根用户可读的 `0600` 配置中；服务器 SMTP 认证成功。合成询盘 `INQ-20261020-0158` 入库，Outbox `accepted`、尝试 1 次，收件箱确认到达。
- 本机 `npm run check` 通过：144 项单测、lint、typecheck、目标域名构建；生产依赖审计 0 项漏洞。
- 服务器原生 Linux/amd64 镜像 `stage-20261020-961762efd277-dirty-r2` 已在回环端口 `9081` 启动，容器健康。修复健康检查 REST 根路径后，`/api/health` 返回 200，CMS、密钥、站点 URL 均为 `ok`。
- 首页、联系页、轮毂列表、robots、sitemap 与 WordPress 内容 API 在私有端口返回 200；已抽检 canonical 指向 `https://fenghuaitech.store`。`7081` 与 `9081` 均只监听 `127.0.0.1`。
- 用户已添加 `cms.fenghuaitech.store` A 记录；服务器解析到 `43.160.228.93`。官方 Caddy 容器在公网 80/443 自动签发 `@`、`www`、`cms` 三域名证书，外部 HTTPS 验证均通过。
- 用户授权后，Caddy 已代理前端与 CMS；主站首页、联系页、后台登录、WordPress REST 与媒体通过公网 HTTPS 返回 200，`www` 返回 301 至主域名。后台账号已设置强密码，存于本机 `0600` 凭据文件；实际登录后 `/wp-admin/` 返回 200，`xmlrpc.php` 返回 403。
- 173 个 sitemap 页面私有抽检中，10 个页面正文可见 `PLACEHOLDER`，集中于 `/dealers` 与 `/insights`。用户明确要求先展示后，Caddy 已撤除这两个栏目的 404 屏蔽；上述 10 个路径从公网复测均返回 200。全站仍保留 `X-Robots-Tag: noindex, nofollow`，`robots.txt` 为 `Disallow: /`，`sitemap.xml` 暂回 404。公开后的修复表单测试 `INQ-20261020-0160` 经前端 HTTPS 路由入库，邮件状态 `accepted`。

## 下一步

1. 补充后台登录防护与监控、异地备份、续费安排；核对预览、签名失效、完整 SEO 和回滚。
2. 审定 `/dealers`、`/insights` 的待核实文案及内容来源，核对图片权利、产品规格、法律和隐私文本；当前仅按用户要求先展示。
3. 正式收录前撤除全站 `noindex` 与 `robots.txt` 禁止规则，恢复合格 sitemap，并从外部复验 canonical、OG、hreflang 与页面发布资格。

## 临时公开边界

网站与 CMS 已通过 HTTPS 对公网开放；应用容器端口仍只绑定本机回环。用户要求的栏目已展示，仍含明确标记的待核实文案；搜索收录暂关。产品、图权、法律与隐私审定、后台登录防护、监控、异地备份和可追溯镜像仍待完成，不能把当前状态记为正式发布完成。
