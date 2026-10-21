# 部署架构与执行计划

更新日期：2026-10-20
配套：[`TARGET_ARCHITECTURE.md`](TARGET_ARCHITECTURE.md) ｜ [`SECURITY.md`](SECURITY.md) ｜ [`../implementation/TASKS.md`](../implementation/TASKS.md) ｜ [`../runbooks/backup-and-restore.md`](../runbooks/backup-and-restore.md) ｜ [`../adr/2026-10-20-single-server-runtime-choice.md`](../adr/2026-10-20-single-server-runtime-choice.md) ｜ [`../adr/2026-10-20-caddy-automatic-https.md`](../adr/2026-10-20-caddy-automatic-https.md)

> 本文是部署正本。下文将「已核实」与「待核实」分开；截图、历史联调配置和公开 DNS 不等于服务器已完成配置。发布上线、改 DNS、发送真实邮件和购买服务须由操作者明确授权。

## 1. 本轮目标与已知条件

本轮目标是在一台腾讯云新加坡轻量应用服务器上运行 Next.js 前端、无头 WordPress 与 MySQL，使用 `fenghuaitech.store` 提供 HTTPS 网站，并建立可回滚的发布与备份流程。**运行时保留 `/api/inquiries`、预览和缓存失效；不做静态导出。** 优先验证现有 Node/standalone 容器，OpenNext 是备选，不是门槛。

| 项 | 2026-10-20 已核实 | 后续动作 |
|---|---|---|
| 服务器 | SSH 实测为 OpenCloudOS 9.6、x86_64、2 核、约 3.6 GiB 内存、60 GB 系统盘；初始仅有宝塔面板等系统服务 | 已装 Docker Engine 29.9.1 与 Compose 5.6.0；正式发布前核对面板安全设置及续费安排 |
| SSH | 用户已为实例绑定 `fenghuai.pub`，本机私钥权限收紧到 `0600`，`root@43.160.228.93` 公钥登录成功 | 后续将部署登录改为最小权限账号，保留应急入口 |
| 域名与 TLS | `@`、`www`、`cms` 均解析到 `43.160.228.93`；Caddy 已自动取得三域名证书，外部 TLS 验证通过；用户授权后主站与 CMS 已临时公开，`www` 跳转主域名 | 当前全站暂不收录，`/dealers` 与 `/insights` 已依用户要求先展示；根域名 MX 仍待邮箱方案确定 |
| 旧联调环境 | 仓库 `deploy/` 指向 `119.91.205.130` 的 9080/7080 HTTP 联调实例 | 只作为实现参考；新实例绝不直接套用旧 IP、旧证书、旧密钥或公开 HTTP 端口 |
| GitHub | 当前仓库 `origin` 是 `coyafky/WheelSiteOnline`；目标 `infofenghuai-cmd/fenghuai-website` 对当前账号不可见，返回 404 | 公司账号确认 URL 并邀请当前账号获写入权限；先比较历史，再添加独立远端同步，不覆盖 `origin` |
| 内容与邮件 | WordPress Outbox 负责保存和通知询盘；当前代码优先 SMTP，仅在 SMTP **未配置**时用 Resend API | 先确定收件服务、真实收件人和发件域名，核对事件回调及失败重放；SMTP 运行失败不会自动切到 Resend |

## 2. 目标拓扑

```text
访客 ── HTTPS 443 ── Caddy ── Docker 私网 ── Next.js Node/standalone
                       └───── Docker 私网 ── WordPress/PHP
                                              └─ Docker 私有网络 ─ MySQL 8

fenghuaitech.store       网站主域名（canonical）
www.fenghuaitech.store   301 到主域名（启用前核对 DNS）
cms.fenghuaitech.store   WordPress API / 后台 / 媒体；全程 HTTPS
```

宿主机只公开 SSH、HTTP 证书申请及 HTTPS 所需端口；数据库、Next.js 和 WordPress 的容器端口只绑定回环或私有网络。WordPress 后台至少启用强认证、最小权限和登录防护；管理路径与 REST、媒体的访问策略分开，不能为了锁后台误封前端读 API。Caddy 负责自动签发与续期证书；公网切流前核验转发来源头、真实客户端 IP、TLS、安全头、请求体上限和询盘限流。上线前验证 Caddy 配置并确认预览日志不记录密钥。

单机意味着主机故障会同时影响前后端。备份必须有异地副本和恢复演练，不能只留在同一块 60 GB 系统盘。前端缓存失效、健康检查及图片优化均须按单实例验证；后续扩容时另评共享缓存。

## 3. 分阶段执行与验收

### 阶段 A：权限、基线与发布资格

1. 确认公司仓库地址和访问权限，`fetch` 后比较目标默认分支与本地历史；先处理工作树现有未提交改动。只同步经过审查的提交，不强推、不把密钥或本地备份纳入 Git。
2. 通过 SSH 只读盘点新服务器；记录系统版本、CPU 架构、内存/磁盘空余、开放端口、防火墙、Docker/Compose、反向代理和现存服务。若有业务数据，发布前先做可验证备份；不得覆盖未知服务或删除卷。
3. 本地运行 `npm run check`、相关端到端测试和 PHP 契约检查；审查当前改动。按发布清单复核竞品残留、`PLACEHOLDER`、真实图片权利、产品规格、法律文案与隐私政策版本。缺批准的内容继续保持不可公开。
4. 锁定主域名、WordPress 子域名、`www` 跳转与后台访问方式；列出每一条拟修改的 DNS 记录及旧值，准备回退表。

**阶段验收**：Git 历史清楚且无密钥；服务器实际资源和数据基线已记录；发布内容与隐私版本有负责人确认；`npm run check` 及本轮相关业务测试通过。

### 阶段 B：服务器底座与 WordPress

1. 安装/核对受支持的 Docker Compose 和 Caddy；按最小权限建部署目录与密钥文件，生产 `.env` 权限 `0600`，密钥只存服务器或受控密钥系统。现有 `deploy/wordpress/compose.yml` 可作为起点，但生产文件须去掉旧 IP 与 HTTP 假设。
2. 部署固定版本的 MySQL 8 与 WordPress/PHP，命名卷保存数据库和上传目录；先在回环/私网核对容器健康。迁移真实内容前做源库和媒体备份、校验和及独立恢复演练；明确 `home`、`siteurl` 与媒体 URL 的目标域名。
3. 安装经审核的 MU 插件，核对内容读 API、发布资格、预览、询盘写入、Outbox、缓存失效签名和最小权限。WordPress 不向互联网暴露数据库、服务密钥或原始 HTTP 后台。
4. 准备 `cms.fenghuaitech.store` 的 DNS 与 TLS，授权后才切换；验证后台登录、REST、图片、上传和证书续期。证书申请方式按服务器实际环境确定。

**阶段验收**：数据库与上传目录可恢复；WordPress 后台和公开 API 全程 HTTPS；私有写入接口未泄露；Caddy 配置校验和端到端 CMS 流程通过。

### 阶段 C：前端构建、部署与 SEO

1. 在 Linux/amd64 构建环境生成可追溯镜像，镜像标记为 Git 提交 SHA 并记录构建输入。本轮外部模拟构建较慢，已在 4 GB 新实例原生构建成功；后续优先保留外部构建能力，避免构建负载影响在线服务。既有 macOS 专用素材步骤留在本地，服务器不运行 `sips`/`cwebp`。
2. 构建时固定 `NEXT_PUBLIC_APP_URL=https://fenghuaitech.store`、经批准的隐私政策版本及 WordPress 公网媒体来源；运行时使用容器私网 CMS 地址、`WP_MODE=live` 和成对一致的服务密钥。构建与运行两侧变量分开，避免把预发布 URL 烤进生产镜像。
3. 先在内部入口或不收录的预发布入口冒烟，再由 Caddy 将正式 HTTPS 请求切到新容器。验证 `/api/health`、首页、产品和内容页、WordPress 媒体、预览、签名失效、询盘持久化与失败状态；生产邮箱未批准前只用测试通道。
4. 从**实际生产响应**核对 canonical、OG、robots、sitemap 与 hreflang 均指向批准的域名和公开内容；检查 404/500、图片优化与 `www` 跳转。页面返回 200 不能代替这一步。

**阶段验收**：运行镜像能追溯到 SHA；服务端 API 正常；真实 SEO 输出与发布资格一致；回滚至上一镜像可在不改数据库的前提下完成。

### 阶段 D：企业邮箱、Resend 与询盘通知

**过渡验证（2026-10-20 用户指定）**：先在本地 WordPress 使用个人 Gmail
`infofenghuai@gmail.com` 验证 SMTP 与询盘通知，发件人与测试收件人均设为该地址。
本地使用独立、被 Git 忽略的 `local-wp/.env.gmail` 覆盖文件，保留现有
`local-wp/.env` 不动；应用专用密码只填在本机该文件中，不写入仓库、文档或聊天。
配置采用 `smtp.gmail.com`、465、隐式 TLS、完整邮箱地址作用户名。
先验证 SMTP 可连通及测试邮件实际到达，再用合成询盘核对持久化、Outbox
与邮件状态。**该本地验证已于 2026-10-20 通过**，证据记录在
[`TASKS.md`](../implementation/TASKS.md) 的 DEP-05。该地址属于测试阶段配置，
不作为正式网站发件身份。

同日新加坡服务器的私有验收也已通过：Gmail 配置从本机加密传入服务器的
`0600` 文件；服务器与 Gmail 完成 TLS 和 SMTP 认证，WordPress 发出的独立测试邮件
与一条合成询盘通知均在收件箱找到。合成询盘已入库，Outbox 为 `accepted`、
尝试 1 次。之后经用户授权临时公开，公网 HTTPS 询盘 `INQ-20261020-0160` 亦已入库并被 Gmail SMTP 接受；历史询盘依用户选择未迁移。

域名所有权只提供配置资格，**不会自动创建企业邮箱收件箱**。先选择并开通企业邮箱服务，把 `sales@fenghuaitech.store` 等真实收件箱及 MX 记录配好，再验证外部来信能收。发信建议单独使用 `notify.fenghuaitech.store` 子域接 Resend，以免与根域企业邮箱的 MX/SPF 冲突；具体 DNS 值以服务商控制台生成值为准，不能猜填。核对 SPF、DKIM、DMARC，且每个主机名只保留一条有效 SPF 记录。

当前 WordPress 代码可二选一：配置企业邮箱 SMTP 作为询盘通知通道，或不配置 SMTP、使用 `FH_RESEND_API_KEY` 调 Resend API。若选 SMTP，服务器避开受限的 25 端口，按服务商使用加密的 465/587。**现有逻辑不会在 SMTP 发送失败时自动切到 Resend**；需要真正的运行失败切换时，先另立改动并验证重复投递与幂等。Next.js `.env.example` 中的旧 `RESEND_API_KEY` 不是当前询盘路由的生产发信配置。

通知前先确定 `FH_INQUIRY_MAIL_FROM`、`FH_INQUIRY_MAIL_TO`、回调密钥、重试与告警接收人，并完成一次经批准的真实收件测试：核对 WordPress 询盘记录、Outbox、服务商接受、最终送达或退信、失败重放。发给客户的自动回复若将来启用，另做同意与文案审核。

**阶段验收**：真实收件箱可收；测试询盘入库且销售通知实际送达；失败不会丢询盘，重复重试不会产生无法辨认的重复邮件；告警到达负责人。

### 阶段 E：切流与运维

用户已授权临时公开，网站与 CMS 于 2026-10-20 接通公网 HTTPS。最初因页面正文存在待核实标记，在边缘屏蔽 `/dealers`、`/insights` 及子路径；用户随后明确要求先展示、后调整，现已撤除屏蔽，相关页面和子路径返回 200。由于内容与运维门槛尚未全部验收，当前全站暂不收录；`robots.txt` 禁止抓取，sitemap 暂回 404。正式可收录发布前须审定待核实内容并完成备份、监控和回滚验收，再撤除收录限制。切流前保存的 Caddy 旧配置可回退至 503 维护页；数据库和媒体备份已通过隔离恢复演练，但异地副本待完成。切流后观察健康检查、5xx、询盘 Outbox、证书、磁盘和备份任务；记录负责人、恢复时间和回退触发条件。

备份至少覆盖数据库与上传目录，带校验和、加密和异地副本；在隔离环境做一次恢复演练。监控至少覆盖网站、CMS、数据库、询盘积压、备份失败、磁盘用量和证书到期。服务器截图显示的到期日较近，正式上线前须确认续费或迁移安排，避免单机停服。

## 4. 回滚顺序

| 故障 | 立即动作 | 数据保护 |
|---|---|---|
| 前端新镜像异常 | Caddy 指回旧健康容器，或将 Compose 镜像标记恢复为上一 SHA | 不回滚数据库；核对询盘仍落同一 WordPress |
| WordPress 插件异常 | 停止新插件版本，恢复上一镜像/只读插件包并验证 REST 与写入 | 先做数据库与媒体快照；不执行 `down -v` |
| 数据迁移错误 | 停止写入、保存故障现场，在隔离环境验证备份后按恢复手册执行 | 任何覆盖生产库的恢复须单独授权 |
| DNS/TLS 异常 | 按记录的旧值和 TTL 回退 DNS 或恢复上一 Caddy 配置 | 不删证书与旧配置，先验证 Caddy 配置 |
| 邮件异常 | 保持询盘持久化，暂停错误投递并检查 Outbox；修正后按幂等规则重放 | 不删除失败记录，不在日志打印客户资料或授权码 |

## 5. 本轮部署进度与尚未通过的门槛

- 新服务器的 WordPress/MySQL、Gmail、内容与媒体隔离恢复演练已验收。前端原生 Linux/amd64 镜像 `stage-20261020-961762efd277-dirty-r2` 已在回环端口运行，健康检查全部为 `ok`；公网首页、联系页、WordPress REST/媒体和后台登录均返回 200，后台账号实际登录成功，canonical 抽检为目标域名。该镜像含未提交改动，仍待制作可追溯的正式版本。
- 公司 GitHub 仓库对当前账号不可见，仓库地址与默认分支尚待确认。
- 企业邮箱服务、MX、Resend 验证记录、真实收件人及邮件授权尚未确定。
- 用户已添加 `cms` A 记录；三域名受信任证书签发并从外部验证成功。`/dealers`、`/insights` 及原先屏蔽的子路径已恢复 200；主站全站 `noindex`，`robots.txt` 禁止抓取、sitemap 暂回 404；`xmlrpc.php` 返回 403。异地备份、监控、完整预览/失效/SEO/回滚验收、进一步的后台登录防护、内容和法律审批尚未完成。
- 当前工作树有其他未提交改动；必须先审查、测试并明确本轮同步范围。

以上门槛由 [`../implementation/TASKS.md`](../implementation/TASKS.md) 跟踪。旧 `deploy/frontend/README.md` 与 `deploy/wordpress/README.md` 仍是 `119.91.205.130` 的联调记录，不是本轮新服务器的生产手册。
