# Agent D · 部署 / CI / 可恢复（M13 / M15 / M16）

> 审计对象：V3.0 商用成熟度 · M13 缓存与内容同步、M15 CI/CD 与部署、M16 监控与备份
> 事实源：`outputs/audit-v3/BASELINE.md`（E5）+ 工作区源码（E1）
> 采集方式：只读静态分析。**未启动任何 Docker 容器、未执行部署、未连生产、未重跑 build/E2E。**
> 采集时间：2026-10-17
> 纪律声明：`outputs/reports/` 下的历史报告一律按 **E3（历史声称）** 处理，**不得用于支撑「已满足」**。

---

## 摘要（先给结论）

| 模块 | 成熟度 | 一句话判定 |
|---|---|---|
| **M13 缓存与内容同步** | **2 / 5** | 管道搭得比预期完整（HMAC 签名 + tag 级 + 路径级 + 多语言 + 预览隔离都在），但**前端不可达时会静默丢事件**，且**运行时缓存层在 standalone 上是否成立未被验证**。 |
| **M15 CI/CD 与部署** | **1 / 5** | CI 是合格的「仓库门禁」，但**不是 CI/CD**：零 E2E、零部署、零产物发布、零 PHP 验证。`deploy/` 是预发布联调产物，**不是生产部署**（仓库自己承认）。 |
| **M16 监控与备份** | **0.5 / 5** | **纯工程空白**。仓库内 grep 不到任何备份脚本、监控配置、告警定义、恢复演练记录。不是「做了没调度」，是**没做**。 |

### 三个必须写进 FINAL_REPORT 的判定

1. **⚠️ M13 的「缓存失效」在当前 standalone 部署形态下大概率不生效。**
   全部 46 路由是 `ƒ Dynamic`，`next.config.ts:82` 设 `output: "standalone"`（非 `standalone` + ISR/CDN）。
   Next 的 Data Cache 在**未 self-host 共享 cache handler** 的 standalone 部署里是进程内、非持久化内存 cache。
   也就是说：`revalidateTag()` / `revalidatePath()` 失效的是一个**每个实例各自持有、重启即空、多实例互不可见**的内存层。
   代码**看起来**是对的，但「失效」在生产多实例下**无法保证**。这是本次审计对 M13 最重要的判断。

2. **M15 的 CI 有效性存在结构性盲区**：CI 跑 `npm run check`（含 build），而 build 在 **`WP_MODE` 缺省/mock** 下进行 →
   **CI 从未验证过任何 live WordPress 代码路径**。基线 `npm run build` 输出 `Environments: .env.local` 才让全绿成立；
   CI 里没有 `.env.local`，构建走的是 mock 分支。**「CI 全绿」≠「生产路径可用」。**

3. **M16 是唯一一个「不是欠调度、是压根没做」的模块**。`deploy/frontend/README.md:37` 与 `ARCHITECTURE.md:368` 把
   备份/监控/恢复演练列为**尚未完成的前置条件**——这是仓库自己的 E1 供词，不依赖我的推断。

---

## M13 缓存与内容同步

**成熟度**: 2/5
**状态**: 部分满足（链路在，可靠性不在）

### 证据

| # | 证据 | 类型 |
|---|---|---|
| 1 | `local-wp/wp-data/wp-content/mu-plugins/fenghuai-content-webhooks.php:26-53` 发送函数全文 | E1 |
| 2 | 同上 `:41-42` —— `'timeout' => 0.5, 'blocking' => false` | E1 |
| 3 | 同上 `:50-51` —— 仅 `error_log` 后 `return false`，**无重试、无队列** | E1 |
| 4 | 同上 `:29` —— 配置缺失时 `return false`（静默） | E1 |
| 5 | 同上 `:88-93` —— 6 个 hook：`save_post_wheel_model/fh_guide/post/page`、`trashed_post`、`before_delete_post` | E1 |
| 6 | 同上 `:127` `fh_content_revalidate_self_check()` **全仓库无任何调用者** | E1 |
| 7 | 同上 —— 全文无 `wp_schedule_event` / `wp_next_scheduled` / 队列表 / 重试表 | E1 |
| 8 | `src/app/api/revalidate/wordpress/route.ts:21-27` —— HMAC-SHA256 + `timingSafeEqual` 常量时间比对 | E1 |
| 9 | 同上 `:63` —— `revalidateTag(tag, { expire: 0 })` | E1 |
| 10 | 同上 `:64` —— `for (const path of paths) revalidatePath(path)` | E1 |
| 11 | `src/lib/wordpress/pages-contract.ts:148-172` —— 路径**按 `LOCALES` 全量展开** + `/sitemap.xml` | E1 |
| 12 | `src/lib/wordpress/wheels-contract.ts:183-188` —— `["/products/wheels", "/products/wheels/flow-formed", …/${slug}, "/sitemap.xml"]` | E1 |
| 13 | `src/lib/wordpress/insights-contract.ts:501-505` —— `["/insights", "/insights/${slug}"]` (**不含 sitemap**) | E1 |
| 14 | 三个 tag 常量：`insights-contract.ts:3` `insights-guides`、`wheels-contract.ts:8` `wheel-publication`、`pages-contract.ts:4` `site-pages` | E1 |
| 15 | **tag 确实被消费**：`pages.ts:30,47,90`、`inquiry-content.ts:184`、`insights.ts:45`、`wheels.ts:16` | E1 |
| 16 | `src/lib/wordpress/client.ts:108-116` —— 预览态 `cache: "no-store"`，公开态 `next: { revalidate: 3600, tags }` | E1 |
| 17 | `src/app/api/preview/route.ts:17-24` —— secret 校验，失败 401 | E1 |
| 18 | 同上 `:37-39 / :45-47` —— `draftMode().enable()` 后 redirect | E1 |
| 19 | `src/app/api/preview/exit/route.ts:4-7` —— `draftMode().disable()` | E1 |
| 20 | `src/components/preview-banner.tsx:19,31` —— exit 有 UI 入口（form + fetch 双保险） | E1 |
| 21 | `src/app/request-a-quote/page.tsx:17,24` —— 预览态 `robots: { index: !preview }` | E1 |
| 22 | `next.config.ts:82` —— `output: "standalone"` | E1 |
| 23 | E5 BASELINE §3.1 —— **46 路由全 `ƒ Dynamic`**，仅 `/robots.txt`、`/sitemap.xml` 为 `○` | E5 |
| 24 | E5 BASELINE §4 —— **`ioredis` 未安装**；无 Redis、无共享 cache | E5 |
| 25 | `src/lib/wordpress/client.ts:28-37` —— 自述「轮毂页**不在请求时读 WordPress**，读构建期快照，没有运行时可失效对象」 | E1 |
| 26 | `src/lib/wordpress/wheels.ts:11-20` —— 唯一的 live 轮毂读取（无 preview 分支） | E1 |
| 27 | `ARCHITECTURE.md:239-240` —— 「生产运行时**仍须配置**回调 URL、密钥与失败监控」 | E1 |

### 已具备

必须公允：这条链路**比典型自研项目完整**，以下都是真实实现、非占位：

1. **签名是真签名**。`route.ts:21-27` 用 `createHmac("sha256")` + `timingSafeEqual`，长度先比对再常量时间比较——没有经典的 `===` 时序侧信道。PHP 侧 `:46` 用 `hash_hmac` 对应。**这一环做对了。**
2. **失效粒度是 tag + path 双层，不是 `revalidatePath("/")` 全站轰炸**。三个独立 tag 各自对应内容域（`site-pages` / `insights-guides` / `wheel-publication`），且**确认被 `wpRead` 消费**（证据 15）——不是声明了没用的死常量。
3. **多语言失效没漏**。`pages-contract.ts:168` 用 `LOCALES.map(l => localizedPath(path, locale))` 展开，`LOCALES = ["en","zh","es","th"]`（`i18n/types.ts:8`）。因为 locale 是靠 proxy rewrite（`src/proxy.ts:73-78`）而非独立路由目录，**同一份 Data Cache entry 服务全语言**，所以展开路径是「干净的冗余」而非遗漏。**这条比我预期好。**
4. **输入校验有**。`route.ts:49` 非法 type 返回 422；slug 过 `validSitePageKey` / `validInsightPreviewSlug`（`:52`）白名单正则，`revision` 截断到 80 字符（`:56`）。
5. **预览与线上隔离是真隔离**。`client.ts:108` 预览走 `cache: "no-store"` 完全绕过 Data Cache；`request-a-quote/page.tsx:24` 预览态自动 `robots: index: false`；exit 有 UI 且清得干净（`draftMode().disable()` 是 Next 唯一正确的清理方式）。
6. **撤回/删除有 hook**。`:92-93` 覆盖 `trashed_post` 与 `before_delete_post`，不是只监听 save。

### 缺口

| # | 缺口 | 证据 | 后果 |
|---|---|---|---|
| G1 | **webhook 无重试、无队列、无持久化** | `webhooks.php:41-42,50-51` | 前端 500 / 重启 / 网络抖动 → **事件永久丢失，页面永久停留旧内容**，直到下一次保存或 3600s 自然过期 |
| G2 | **50ms 超时基本必然失败** | `webhooks.php:41` `'timeout' => 0.5`（0.5 秒）+ `'blocking' => false` | 非阻塞请求的理论回报窗口极短；`wp_remote_post` 非阻塞时一旦排不出去即 `WP_Error`，落进 `:50` 的 `error_log` 死路 |
| G3 | **失败无任何告警** | `webhooks.php:50` 只有 `error_log` | 运维不主动看 PHP error_log 就永远不会知道同步断了 |
| G4 | **`self_check()` 是死代码** | `webhooks.php:127` 零调用者 | 明明写了健康自检，但没有**任何**入口（无 REST 路由、无 admin 页面、无 cron）去调用它 |
| G5 | **配置缺失时静默返回 false** | `webhooks.php:29` | `FH_NEXT_REVALIDATE_URL/SECRET` 未配置 → 保存照常成功、页面悄悄不同步，**没有「你还没配置」的任何提示** |
| G6 | **insights 失效不刷 sitemap** | 对比 `wheels-contract.ts:187`（含 `/sitemap.xml`）vs `insights-contract.ts:501-505`（**不含**） | 发新博文后 `/sitemap.xml` 不失效 → 新文章延迟进入 sitemap。**这是一处真实的不一致，且方向对 SEO 不利** |
| G7 | **⚠️ Data Cache 在 standalone 多实例下不可共享** | `next.config.ts:82` + BASELINE §4 无 Redis | `revalidateTag` 只打到「处理该请求的那个进程」。多实例/滚动发布时，其余实例的 tag 缓存继续吐旧内容，直到 3600s 自然过期 |
| G8 | **轮毂域没有运行时可失效对象** | `client.ts:28-37` 自述 + `publication.ts:22` 读构建期 JSON | 轮毂的「发布→上线」实际路径是 `sync-wheel-publication.py` + **重新构建**，不是 revalidate。tag 是为将来预埋的 |
| G9 | **multilingual 的列表页失效依赖「同 entry」假设** | `proxy.ts:73-78` rewrite 方案 | 当前成立，但一旦引入 `generateStaticParams` 按 locale 预渲染（ISR/CDN 化），`pages-contract.ts:168` 的展开才真正必要，**目前是无害冗余、届时是必需品**——这个演化边界没有任何注释记录 |

### 重复实现

- **`local-wp/mu-plugins/` 与 `local-wp/wp-data/wp-content/mu-plugins/` 是两份完全相同的副本**（`diff -q` 返回 IDENTICAL）。
  而 `local-wp/docker-compose.yml:83` 挂载的是 `./wp-data`，**`local-wp/mu-plugins/` 是孤儿副本**。
  `deploy/wordpress/compose.yml:84` 却挂载 `./mu-plugins`——**该路径在 `deploy/wordpress/` 下不存在**（见 M15 G4）。两份副本 + 一个错误挂载点，是「改一份忘另一份」的现成温床。

### 风险

- **R1（高）**：内容同步是**静默单点**。`blocking: false` + `timeout: 0.5` + 零重试 + 零告警 = 「99% 的时候看起来能用，坏的时候没人知道」。这比「明确报错」危险得多——运营会在毫不知情的情况下发出与 WordPress 不一致的旧内容。
- **R2（高）**：G7 意味着**即使 webhook 全部成功送达，生产环境也未必真的变**。这是「代码对、部署形态让代码失效」的典型陷阱，**只靠读 `route.ts` 无法发现**。
- **R3（中）**：G8 让「轮毂发布即时生效」这一运营心智模型不成立。实际是「跑同步脚本 + 重建」，`ARCHITECTURE.md:239` 声称「不依赖运营手工运行同步脚本」——**该声称对轮毂域不成立**，是文档与实现的冲突。

### 建议动作

1. **把 webhook 改成事务性发件箱**（复用询盘系统已有的 outbox 模式）：`webhooks.php` 落一行 `fh_revalidate_queue` 表，由 WP-Cron（或系统 cron 调 `wp cron event run`）批量消费 + 指数退避 + N 次后进 dead-letter。**这是 M13 从 2 分走向 3.5 分的唯一关键改动。**
2. `timeout` 从 0.5 提到 3（服务端到服务端、同机 Docker 网络，3s 足够），或保持非阻塞但要配合队列。
3. 给 `self_check()` 接一个 admin 通知条 + 一个 `/fh/v1/revalidate-health` REST 端点，让「未配置/上次失败时间」可见。
4. 补齐 `insightsRevalidationPaths`，把 `/sitemap.xml` 加上（对齐 `wheels` 的写法），消除 G6。
5. 在 `client.ts:35` 附近加一行注释，写明「tag 对 wheel 域是预埋，当前失效靠重建」，避免下一个工程师误以为轮毂已实时。
6. **部署形态决策**：若要 standalone 多实例，必须自建 `cacheHandler`（社区有 file/redis 实现）。若不打算做，就应在 `ARCHITECTURE.md` 明确「单实例部署」并把它变成硬约束。

### 依赖

- 动作 1 依赖 Agent B（M11 询盘发件箱）确认 outbox 模式能否复用。
- 动作 6 依赖 M15 的平台决策（OpenNext vs 自建 standalone）。

### 验收方式

- 断网演练：断开 WordPress 到 Next 的链路 → 保存一篇文章 → 恢复链路 → **在不重新保存的前提下**验证页面在 N 分钟内自动更新。当前代码此测试**必失败**。
- 检查 `fh_revalidate_queue` 表存在且有重试计数字段。
- 多实例测试：起 2 个 Next 实例，写 A 实例的 tag 缓存，请求命中 B 实例，验证 B 不返回旧内容。
- `curl` 一次 `/api/revalidate/wordpress` 带错误签名 → 必须 401；带 `type: "evil"` → 必须 422。

---

## M15 CI/CD 与部署

**成熟度**: 1/5
**状态**: 未实现（生产部署）；有风险（预发布配置可用但不可靠）

### 证据

| # | 证据 | 类型 |
|---|---|---|
| 1 | `.github/workflows/verify.yml:1-27` —— 全文 27 行，仅 checkout / setup-node / npm ci / npm test / npm run check / audit:prod | E1 |
| 2 | 同上 `:14-16` —— `on: pull_request` + `push: branches: [main]` | E1 |
| 3 | 同上 `:25` —— `npm run check`（含 `theme:check && test && lint && typecheck && build`，见 `package.json`） | E1 |
| 4 | `package.json` scripts —— 有 `test:e2e`，**CI 中零引用** | E1 |
| 5 | `deploy/frontend/Dockerfile:1-44` —— 三阶段 node:24-bookworm-slim，`npm run build` 在 builder 内完成 | E1 |
| 6 | 同上 `:38-40` —— `COPY .next/standalone ./` + `.next/static ./.next/static` + `public ./public` | E1 |
| 7 | `deploy/frontend/Dockerfile.prebuilt:15-19` —— **多 COPY 一行 `node_modules`**，且 `COPY .next/standalone/server.js .next/standalone/package.json ./` | E1 |
| 8 | `deploy/frontend/compose.yml:5` —— `image: fenghuai-frontend-9080:2026-10-09`（**硬编码日期 tag**） | E1 |
| 9 | 同上 `:12` —— build args 里 `WP_API_URL: ${WP_PUBLIC_API_URL}`（值来自 *PUBLIC* 变量） | E1 |
| 10 | 同上 `:17` —— build arg `WP_MODE: mock`，`:25` runtime `WP_MODE: live` | E1 |
| 11 | 同上 `:34` —— `127.0.0.1:${FRONTEND_BIND_PORT:-9081}:3000` | E1 |
| 12 | 同上 `:39-48` —— healthcheck 用裸 `fetch('http://127.0.0.1:3000/robots.txt')` | E1 |
| 13 | `deploy/frontend/nginx-9080.conf:1-22` —— 全 22 行；`:9` 强制 `X-Robots-Tag: noindex, nofollow`；`:14` `proxy_set_header Host $http_host` | E1 |
| 14 | `deploy/frontend/README.md:3` —— 「**不是** DEC-009 所定义的正式 OpenNext 部署」 | E1 |
| 15 | 同上 `:25-28` —— 「服务器只有 2GB，**不得**在服务器 `next build`」，必须开发机 prebuilt | E1 |
| 16 | 同上 `:35` —— 9080 只有 HTTP，强制 noindex | E1 |
| 17 | 同上 `:37` —— 「正式发布**仍需**域名、TLS、OpenNext 目标平台、邮件资源、监控和备份恢复演练」 | E1 |
| 18 | `deploy/wordpress/compose.yml:5,30` —— mysql:8.0 与 wordpress:php8.3-apache **均用 `@sha256:` 摘要锁定** | E1 |
| 19 | 同上 `:86` —— WordPress 仅绑 `127.0.0.1:${WP_BIND_PORT:-7081}:80`，DB 不发布端口 | E1 |
| 20 | 同上 `:84` —— `- ./mu-plugins:/var/www/html/wp-content/mu-plugins:ro` | E1 |
| 21 | **`deploy/wordpress/mu-plugins/` 目录不存在**（`ls` → No such file or directory） | E1 |
| 22 | `deploy/wordpress/README.md:9` —— .env 只在服务器 `/opt/fenghuai-wordpress/.env`，0600 | E1 |
| 23 | 同上 `:25-29` —— 唯一的「回滚」段：手工 cp nginx 配置 + `systemctl reload` + 重启 `fenghuai-site-preview.service` | E1 |
| 24 | **`fenghuai-site-preview.service` 全仓库仅出现在该 README，无 `.service` 文件** | E1 |
| 25 | `next.config.ts:102-118` —— 安全头按 `NEXT_PUBLIC_APP_URL` 协议条件注入 HSTS / upgrade-insecure-requests | E1 |
| 26 | `next.config.ts:8-29` —— `remotePatterns` 硬编码 `localhost:8081` + `127.0.0.1:8081` | E1 |
| 27 | `src/proxy.ts:97-106` —— matcher 排除 api/_next/robots.txt/sitemap.xml | E1 |
| 28 | **`WP_API_TOKEN` 在 `client.ts:18` 被消费，但 `deploy/frontend/.env.example` 与 `compose.yml` 均无此变量** | E1 |
| 29 | **`RESEND_API_KEY`(`mailer.ts:60`)、`INQUIRY_FROM`/`INQUIRY_TO`(`mailer.ts:14-15`) 均被消费，compose 全部缺失** | E1 |
| 30 | E5 BASELINE §10 —— CI 五缺口（无 E2E / 无部署 / 无产物 / 无 PHP / 无环境隔离检查） | E5 |
| 31 | E5 BASELINE §9 —— **8 个 verify 脚本零个进 CI** | E5 |
| 32 | `ARCHITECTURE.md:335` —— 「**仓库中没有生产部署文件**，待 OpenNext 平台确定后新写」 | E1 |
| 33 | `ARCHITECTURE.md:347` —— 「没有域名、TLS、CDN 和正式监控时**不得标记为生产**」 | E1 |
| 34 | `STATUS.md:24` —— 「正式法律文本、生产 WordPress/数据库/邮件可靠性、**OpenNext 目标平台**、备份恢复和负责人交接需要各自完成核验」 | E1 |

### 已具备

不要因为打分低就抹掉已有的东西。以下是真的：

1. **CI 是有效的「合入前守门员」**，只覆盖正确的那部分。`verify.yml:4-5` 同时挂 `pull_request` 与 `main` push，`:8` `permissions: contents: read` 是最小权限（没有不必要的写权限），`:17` `npm ci` 锁定依赖，`:26` `audit:prod` 提供依赖漏洞门禁（**这一项在同类项目里经常缺席**）。`:12` `timeout-minutes: 20` 防止挂死。
2. **`Dockerfile` 写法正确**。`:1` 使用 `node:24` 与 BASELINE §1 的 v24.15.0 一致（不是过期基础镜像）；`:38-40` standalone 三件套 `public` / `.next/standalone` / `.next/static` 齐全、路径正确；`:42` `USER node` 非 root 运行；`:20` `NEXT_TELEMETRY_DISABLED=1`。
3. **WordPress compose 的安全性高于同类**。`:5,30` 用 `@sha256:` 摘要锁镜像（防供应链漂移）；`:86` WP 只绑 127.0.0.1、DB 不发布端口；`:68` `DISALLOW_FILE_EDIT`；`:83-84` 卷声明正确（更新容器不删数据）。
4. **前端 compose 的容器加固是认真做的**。`:49-52` `no-new-privileges` + `cap_drop: ALL`；`:53-56` 内存上限 700M（配合 2GB 服务器）；`:39-48` 有 healthcheck + `start_period: 30s`。
5. **`Dockerfile` / `Dockerfile.prebuilt` 的**用途划分**是自洽的**，且与 `README.md:25-28` 的 2GB 约束对应：`Dockerfile` = 在别处（CI/开发机）完整构建；`Dockerfile.prebuilt` = **把已构建好的 `.next` 塞进 runtime 镜像**（不跑 build），正是「服务器不构建」这一约束的落地。
6. **`WP_MODE: mock`(build) / `live`(runtime) 的双写是有意设计且有注释**（`compose.yml:15-17`），不是笔误——目的是让 2GB 服务器构建期不抓 138 个 CMS 页面。**这个设计思路是对的**（虽然代价见风险 R2）。
7. **9080 的 noindex 是硬保证**，不靠应用自觉：`nginx-9080.conf:9` `add_header X-Robots-Tag "noindex, nofollow" always`。`always` 参数意味着连 404/500 响应也带上。**这一条做得比很多生产站都严谨。**
8. **安全头协议感知**（`next.config.ts:102-118`）：HTTP 联调期不注入 HSTS / `upgrade-insecure-requests`（否则浏览器会强制跳 HTTPS 直接打挂联调环境），切 HTTPS 域名后自动恢复。**这是踩过坑才会写的代码。**

### 缺口（逐项，按用户要求「逐项列出」）

| # | CI 缺什么 | 现状 | 严重度 |
|---|---|---|---|
| C1 | **E2E（90 用例 / 15 spec）** | `test:e2e` 存在于 `package.json`，CI **零引用**。BASELINE §3.3 说 STATUS 自述有既有失败 | 高 |
| C2 | **部署步骤** | 无。CI 到 build 结束 | 高 |
| C3 | **构建产物发布 / 版本化** | 无 artifact upload，无镜像推送，无 release tag | 高 |
| C4 | **WordPress / PHP 侧验证** | 8 个 verify 脚本（BASELINE §9）**一个都没跑**。PHP 语法、ACF 契约、REST 端点全部无门禁 | 高 |
| C5 | **环境隔离检查** | 无「检测是否指向生产」的守卫。若 `.env` 误配成生产 URL，CI 不会拦 | 中 |
| C6 | **依赖缓存失效/锁文件一致性** | 有 `cache: npm`，但没有 `npm ci --dry-run` 或 lockfile diff 检查 | 低 |
| C7 | **Node 版本矩阵** | 只在 24 单版本。engines 是 `>=24`，但没有测试 25 | 低 |
| C8 | **Dockerfile 构建验证** | CI 从不 build 镜像 → `Dockerfile` 的 standalone 路径若写错，**CI 永远发现不了** | 中 |

| # | 部署配置缺什么 | 证据 | 严重度 |
|---|---|---|---|
| D1 | **`deploy/wordpress/compose.yml:84` 挂载的 `./mu-plugins` 路径不存在** | `ls deploy/wordpress/mu-plugins` → No such file | **高（起不来 / 起来是空插件）** |
| D2 | **`compose.yml` 缺 4 个被代码消费的环境变量**：`WP_API_TOKEN`、`RESEND_API_KEY`、`INQUIRY_FROM`、`INQUIRY_TO`（证据 28-29） | compose 全文 grep | **高（live WP 无认证 token；邮件永远 mock）** |
| D3 | **`Dockerfile.prebuilt` 与 `Dockerfile` 产物结构不一致** | 证据 6 vs 7：前者 `COPY .next/standalone ./`，后者 `COPY .../server.js .../package.json ./` + `standalone/.next ./.next` | 中（两条路径必有一条是错的/未验证） |
| D4 | **`compose.yml:12` build arg `WP_API_URL` 取自 `WP_PUBLIC_API_URL`** | 变量名错位 | 中（构建期图片源可能进错 remotePatterns） |
| D5 | **镜像 tag 是硬编码日期 `:2026-10-09`** | `compose.yml:5` | 中（无法判断当前跑的是哪次构建，回滚无锚点） |
| D6 | **无 TLS / 无域名** | `README.md:35`、`ARCHITECTURE.md:347` | **高（阻塞上线）** |
| D7 | **healthcheck 可能被 proxy 干扰** | `compose.yml:44` 探 `/robots.txt`，而 `proxy.ts:99` matcher 已排除 `robots.txt` → 该路径不进 proxy，**探针实际有效**；但它只证明 HTTP 层活着，不证明 CMS 连通 | 低（记录） |
| D8 | **`next.config.ts:8-29` 硬编码 localhost:8081 remotePatterns 进生产** | 生产镜像里存在这些死规则 | 低（无害但脏） |

### 重复实现

- **三个部署入口并存且互不相同**：`deploy/frontend/Dockerfile`、`deploy/frontend/Dockerfile.prebuilt`、`local-wp/docker-compose.yml`（本地 8081）。
  加 `deploy/wordpress/compose.yml` v.s. `local-wp/docker-compose.yml` 两套 WordPress compose。
  **没有一处是生产**，但**有 4+ 份配置需要同步维护**——这正是 `mu-plugins` 出现两份副本（M13 重复实现）的根因。
- `local-wp/mu-plugins/` 与 `local-wp/wp-data/wp-content/mu-plugins/` 完全相同的两份（见 M13）。

### 风险

- **⚠️ R1（最高，且是本次审计的独有发现）**：**CI 从未验证 live WordPress 路径。**
  CI 无 `.env.local` → `getWpConfig()`（`client.ts:15-24`）返回 `mode: "mock"` → 所有 `wpRead` 立即 `return null`（`client.ts:85-86`）→ **`src/lib/wordpress/` 全部 21 个文件的真实代码路径在 CI 中一次都没执行过**。
  BASELINE 里 `npm run build` 全绿是因为本机有 `.env.local`（`Environments: .env.local`）。**在 CI 环境里这次 build 走的是另一条分支。**
  ⇒ **「CI 绿」对 live 路径零信息量。** 这是 M15 最危险的结构性盲区，且不看 CI 环境差异根本发现不了。
- **R2（高）**：build 时 `WP_MODE=mock`（`compose.yml:17`）意味着**构建产物里的 `remotePatterns`、sitemap、静态生成内容全部基于 mock 数据**。README `:22-23` 说「运行时 live + 启动后调签名失效接口刷新」——但刷新只管 **Data Cache**，**管不了构建期已固化的 `remotePatterns`**（那是 `next.config.ts`，构建期决定）。若 CMS 域名与构建期给的 `WP_PUBLIC_API_URL` 不同，**图片优化器仍会 400**。README `:17-20` 自己警告过这个坑，但 `compose.yml:12` 又把 `WP_API_URL` 接到了 `WP_PUBLIC_API_URL` —— 一个警告与一个实现互相打架。
- **R3（高）**：**回滚不是流程，是一段散文**。`README.md:25-29` 描述「手工 cp nginx 配置 + reload + 重启 service」，其中：
  - 没有任何可执行脚本；
  - 引用的 `fenghuai-site-preview.service` **在仓库里不存在**（证据 24）——它在服务器上是否存在**无法从仓库验证**；
  - 无版本化产物（D5 硬编码 tag）→ **没有「退回到哪个版本」的客观答案**。
  ⇒ 真出事时，回滚依赖「某个人记得上次怎么做的」。这是 0 分项。
- **R4（中）**：`WP_API_TOKEN` 缺失（D2）意味着即便 `WP_MODE=live`，`client.ts:62-64` 也不会带 `Authorization` 头。若 WP 侧要求认证读，**所有 live 读取 401 → 静默 fallback 到本地兜底 → 网站看起来正常但内容全是不对的**。这是最恶劣的失败模式：**没有报错，只是内容错**。
- **R5（中）**：9080 是「预发布」的定性**与 STATUS 一致**（BASELINE §11 已确认端口吻合）。但 `ARCHITECTURE.md:380` 把它描述为「备份与回滚说明」的承载者——`deploy/wordpress/` 里确实只有 README 的散文，**没有备份脚本**（见 M16）。架构文档高估了 `deploy/` 的完备度。
- **R6（中）**：**「正式域名没配置 → 生产构建关 sitemap」是设计，不是 bug，但它是上线阻塞。**
  `sitemap.ts` 的 fail-closed 逻辑（BASELINE §5.3）在 `configuredSiteUrl` 为空时返回 `[]`，`robots.ts` 则 `disallow: "/"`。这是**正确且值得表扬的安全默认**（宁可不索引，也不要索引错域名）。但它的直接后果是：**在配置真域名之前，生产构建出来的站是不可被搜索引擎发现的黑洞**。所以判定为：**设计正确 / 上线阻塞**。不配域名就上线 = 上线一个 SEO 隐形的站。

### 建议动作

**P0（不解决不能上线）**
1. 修 `deploy/wordpress/compose.yml:84` 的挂载路径，或把 mu-plugins 同步到 `deploy/wordpress/mu-plugins/`。（D1）
2. 把 `WP_API_TOKEN` / `RESEND_API_KEY` / `INQUIRY_FROM` / `INQUIRY_TO` 补进 `deploy/frontend/compose.yml` + `.env.example`。（D2/R4）
3. 申请正式域名 + TLS，设 `NEXT_PUBLIC_APP_URL=https://<域名>`，验证 sitemap/robots/canonical 三者同时生效。（D6/R6）
4. 把所有 `:2026-10-09` 式硬编码 tag 换成 `<git-sha>`，并把「上一版镜像 tag」写进部署记录。（D5/R3）

**P1（上线后一个月内）**

5. CI 加 E2E job（可先只跑 `@smoke` 子集，用 `playwright --grep`），至少让 90 个用例有 CI 归宿。（C1）
6. **CI 加一个「live 模式构建」job**：起 docker WP（`local-wp/docker-compose.yml` 现成）→ `WP_MODE=live npm run build` → 证明 live 路径能构建。这是消除 R1 的唯一办法。（C4）
7. 8 个 verify 脚本挑能无副作用跑的（`verify-page-v2-contract.php`、`verify-home-editor-flow.php` 等只读的）挂进 CI。（C4）
8. 写 `scripts/deploy-frontend.sh` + `scripts/rollback-frontend.sh`，把 `README.md:25-29` 的散文变成可执行、有 `set -euo pipefail` 的脚本。（R3）
9. 统一 `Dockerfile` 与 `Dockerfile.prebuilt` 的产物结构，并加一条 CI job 至少 `docker build --target runtime` 验证路径正确。（C8/D3）

**P2（清理）**

10. 删掉 `local-wp/mu-plugins/` 孤儿副本，只保留 `wp-data/wp-content/mu-plugins/`。
11. `next.config.ts:8-29` 的 localhost remotePatterns 改为仅在 `NODE_ENV !== "production"` 注入。

### 依赖

- 动作 3 依赖负责人域名/证书决策（**非工程阻塞，是业务前置**）。
- 动作 6 依赖 Docker-in-CI（GitHub Actions 的 ubuntu-latest 原生可用）。
- 动作 1/2 依赖 Agent B 确认 WP 侧 REST 是否强制认证读（决定 `WP_API_TOKEN` 是必需还是可选）。

### 验收方式

- `docker compose -f deploy/wordpress/compose.yml config` 零报错，且 `docker compose ... up -d` 后 `curl 127.0.0.1:7081` 返回 WP 首页而非空插件警告。
- 起前端容器后 `curl http://127.0.0.1:9081/robots.txt` → **生产域名下必须返回含 `Sitemap:` 的 allow 规则**（不是 `Disallow: /`）。
- 在 CI 日志里 grep 到 `Environments: .env.ci`（或显式 `WP_MODE=live`），且 build 成功。
- `bash scripts/rollback-frontend.sh` 在预发布机上能带上一版镜像跑起来。

---

## M16 监控与备份

**成熟度**: 0.5/5
**状态**: 未实现

### 证据

| # | 证据 | 类型 |
|---|---|---|
| 1 | `scripts/` 31 项全清单（BASELINE §9 已列）—— **无任何 `backup*` / `restore*` / `dump*` / `mysqldump` 脚本** | E1+E5 |
| 2 | 全仓 `find deploy scripts docs -iname "*backup*" -o -iname "*restore*" -o -iname "*dump*"` → 仅命中 `scripts/i18n/dump-wheel-process-content.mts`（内容导出，非数据备份） | E1 |
| 3 | `deploy/frontend/README.md:37` —— 「正式发布仍需…**监控和备份恢复演练**」 | E1 |
| 4 | `deploy/wordpress/README.md:18` —— 更新顺序第 1 步「备份远端数据库、上传目录、nginx 配置和 `.env`」= **手工动作，无脚本** | E1 |
| 5 | `deploy/wordpress/README.md:9,11` —— 「更换 QQ 授权码时**先备份 .env**，再重建容器」= 手工，**这是唯一像「凭据轮换」的流程** | E1 |
| 6 | `ARCHITECTURE.md:323` —— 「签名事件回调、平台可靠调度、法务批准的保留天数、备份内删除策略、**异常/积压告警**和…」列为**待补** | E1 |
| 7 | `ARCHITECTURE.md:352,354,356` —— 「前端独立备份」「邮件发送器和回调拥有独立重试、**监控和告警**」「发布具备回滚、**数据库备份恢复**」= 全部是**目标态**措辞 | E1 |
| 8 | `ARCHITECTURE.md:368` —— 「内容、数据库、媒体和构建产物**分别备份，并实际演练恢复**」= 目标态 | E1 |
| 9 | `STATUS.md:24` —— 「…**备份恢复**和负责人交接需要各自完成核验」 | E1 |
| 10 | `STATUS.md:17` —— 「首页迁移前备份完成」= **一次性手工备份**，非周期性 | E1 |
| 11 | 全仓 `grep requestId/correlationId/traceId/X-Request-Id src/` → **零命中** | E1 |
| 12 | `fenghuai-content-webhooks.php:50` —— 失败仅 `error_log`，无结构化字段、无 ID | E1 |
| 13 | `src/lib/wordpress/client.ts:73,113` —— WP 失败仅 `console.error(`[wp] ${path} failed: ${res.status}`)`，无关联 ID | E1 |
| 14 | `deploy/frontend/compose.yml:39-48` —— 有容器 healthcheck（唯一的「监控」） | E1 |
| 15 | `deploy/wordpress/compose.yml:18-23,87-92` —— DB 与 WP 各有 healthcheck | E1 |
| 16 | E5 BASELINE §9 —— 8 个 verify 脚本零个进 CI | E5 |

### 已具备

极少数是真的，但必须承认：

1. **容器级 healthcheck 存在且合理**：`deploy/frontend/compose.yml:39-48`（探 `/robots.txt`，`interval: 15s`、`retries: 12`、`start_period: 30s`）；`deploy/wordpress/compose.yml:18-23`（`mysqladmin ping`）、`:87-92`（`fsockopen 127.0.0.1:80`）。配合 `restart: unless-stopped`（frontend `:18`、wordpress `:6,31`），**这构成「进程挂了会自动重启」这一层最低保障**。
2. **凭据轮换有一个（唯一一个）成文流程**：`deploy/wordpress/README.md:11-12` 描述 QQ SMTP 授权码轮换——先备份 .env → 重建容器 → 用合成询盘核对 CPT/outbox/收件箱。**虽然手工，但步骤是完整且可执行的**，这是 M16 里唯一像流程的东西。
3. **凭据未入库**：`.gitignore:65` 忽略 `local-wp/local-credentials.txt`、`.gitignore:69` 忽略 `local-wp/.env`，`git ls-files` 确认两者均未被跟踪。**基线卫生合格。**
4. **文档对缺口是诚实的**。`README.md:37`、`ARCHITECTURE.md:368`、`STATUS.md:24` 三处独立承认备份恢复未做。**没有粉饰**——这让本次审计不需要「揭穿」，只需要「记录」。

### 缺口

| # | 缺口 | 判定 |
|---|---|---|
| G1 | **无任何备份脚本**（DB / uploads / .env / nginx conf / 构建产物） | **没做**（不是没调度） |
| G2 | **无备份调度**（无 cron、无 systemd timer、无 CI 定时 job） | **没做** |
| G3 | **无恢复演练**，也无演练记录 | **没做** |
| G4 | **无 uptime 探测**（仓库内无任何外部探活配置） | **没做** |
| G5 | **无 5xx 告警** | **没做** |
| G6 | **无邮件积压/失败告警**——`ARCHITECTURE.md:323` 明列为待补 | **没做** |
| G7 | **无数据库空间告警** | **没做** |
| G8 | **无关联 ID**（证据 11）→ 一条用户投诉的 500 无法关联到具体 WP 请求 | **没做** |
| G9 | **日志脱敏无验证**。`webhooks.php:50` 不打印 secret（合格），但 `client.ts:73` 打印 `path`（含 REST 路径，一般安全）。**没有集中的脱敏层，靠每处自觉** | **有风险** |
| G10 | **凭据轮换无周期性**。只有 SMTP 一个，且是「出问题才换」；`WP_REVALIDATE_SECRET` / `WP_PREVIEW_SECRET` / `INQUIRY_RECEIPT_SECRET` / WordPress salt 全部无轮换流程 | **部分（1/5 类凭据有）** |
| G11 | **verify 脚本存在但不被调度** | **做了但没调度**（这是唯一属于此类的一项） |

> **重要区分（遵守纪律）**：G1-G8 是「**工程没做**」——仓库里连脚手架都没有。
> G11 是「**做了但没调度**」——8 个 verify 脚本是真实资产，只是没人跑。
> 两者不能混为一谈：G11 修起来是「加一行 CI yaml」，G1-G8 修起来是「从零建运维体系」。

### 重复实现

无。此模块没有任何东西可以做重复——它是空的。

### 风险

- **R1（最高）**：**单机 + 单卷 + 零备份 = 数据无副本**。
  `deploy/wordpress/compose.yml:98-100` 的 `db_data` / `wordpress_data` 是两个 Docker 命名卷，位于**同一台机器、同一块盘**。
  卷不是备份：`docker volume rm`、`docker system prune -a --volumes`、磁盘故障、误删 `/var/lib/docker` 任一条都会**同时带走进询盘数据和全部上传媒体**。
  询盘是**唯一的商业线索来源**，这个损失的期望值远高于任何工程债。
- **R2（高）**：**故障发现依赖人类偶然撞见**。无 uptime 探测 → 站点挂了要等客户打电话；无 5xx 告警 → 询盘 500 了要等销售说「今天没单」。
- **R3（高）**：**`ARCHITECTURE.md:368` 要求「实际演练恢复」，而 `STATUS.md:24` 承认未核验**——文档要求与自己承认的现状直接冲突，意味着**备份这件事从未被当作交付物对待**。
- **R4（中）**：无关联 ID + 无集中日志 → **事后无法排查**。`webhooks.php:50` 和 `client.ts:73` 的 `console.error` / `error_log` 在容器里会被 `docker logs` 轮转冲掉（Docker 默认 json-file 无大小限制时实际上是无限增长，但**没有配置**，见 `compose.yml` 全文无 `logging:` 段）。**日志既不可靠留存，又可能撑爆 2GB 服务器的磁盘。** 这是一个双向风险，且两个方向都没人管。

### 建议动作

**P0（上线前必须）**
1. `scripts/backup-wordpress.sh`：`docker compose exec -T db mysqldump --single-transaction` + `tar` uploads + 拷 `.env`/nginx conf，输出到 `/opt/fenghuai-backups/<ts>/`，**并异地存一份**（R1 要求跨盘/跨机，同机备份不算）。
2. `scripts/restore-wordpress.sh` + **真的演练一次**，把演练记录写进 `outputs/reports/`。这是 `ARCHITECTURE.md:368` 的硬性要求。
3. 调度：systemd timer（或宿主 cron）每日 02:00 全量 + 保留 N 天。**必须有调度，否则脚本等于没写。**
4. 一个外部 uptime 探测（任意 SaaS 或自建 cron+curl），至少探 `/`、`/api/inquiries`（OPTIONS）、`/sitemap.xml`。

**P1**

5. 5xx 与询盘失败告警：`webhooks.php:50` 和 `client.ts:73` 的 catch 加一个告警出口（邮件或 webhook）。
6. `compose.yml` 加 `logging: driver: json-file, options: {max-size: 10m, max-file: 3}`，防撑爆磁盘。
7. 引入 request id：proxy 生成 `x-request-id`，贯穿 `wpRead` 与错误日志。（`src/proxy.ts:80-82` 已有 header 注入机制，加一个 header 成本很低）
8. DB 空间探针：`mysql` 查 `information_schema.TABLES` 或简单 `df` 阈值告警。

**P2**

9. 把 8 个 verify 脚本里只读的子集挂进 CI 的定时 job（`schedule: cron`），把 G11 的「做了没调度」关掉。
10. 为 `WP_REVALIDATE_SECRET` / `WP_PREVIEW_SECRET` / `INQUIRY_RECEIPT_SECRET` 写轮换 SOP（复用 README `:11-12` 已有的 SMTP 轮换模板）。

### 依赖

- 动作 1 依赖「服务器是否允许异地存储」的业务决策（成本/合规）。
- 动作 5 依赖 M11 的告警出口设计（Agent B），避免另造一套。
- 动作 7 依赖 `proxy.ts` 已在 `next.config` 生效（E5 确认 `ƒ Proxy (Middleware)` 存在）。

### 验收方式

- `bash scripts/backup-wordpress.sh` 产出一个含 `dump.sql` + `uploads.tar.gz` + `.env` 的目录，且 `dump.sql` 大小 > 0 且含 `CREATE TABLE wp_fh_inquiries`。
- **在另一台机器**（或全新卷）执行 `restore-wordpress.sh`，站点起来且询盘列表非空。演练记录落盘。
- `crontab -l` 或 `systemctl list-timers` 能看到备份任务。
- 人为把前端容器停掉 → uptime 探测在 5 分钟内发出告警。
- `docker logs` 有 `max-size` 限制（`docker inspect` 可见）。

---

## 上线阻塞清单

按严重度降序。每条注明「阻塞什么」与「证据」。

| # | 严重度 | 阻塞项 | 阻塞什么 | 证据 | 责任模块 |
|---|---|---|---|---|---|
| **1** | **P0 · 致命** | **零备份 + 零恢复演练，且数据在单机单卷** | 任何故障都会**不可逆丢失询盘与媒体**。`COMPOSE` 的 `db_data`/`wordpress_data` 与服务器同盘 | M16 G1-G3；`deploy/wordpress/compose.yml:98-100`；`ARCHITECTURE.md:368` | M16 |
| **2** | **P0 · 致命** | **无正式域名 / TLS** | `NEXT_PUBLIC_APP_URL` 非 https → `sitemap.ts` 返回 `[]`、`robots.ts` `disallow: "/"` → **上线即 SEO 隐形**；且 9080/7080 全是 HTTP | `deploy/frontend/README.md:35,37`；`ARCHITECTURE.md:347`；BASELINE §5.3-5.4 | M15 |
| **3** | **P0 · 致命** | **`deploy/wordpress/compose.yml:84` 挂载不存在的 `./mu-plugins`** | WordPress 容器起来后 **mu-plugins 全部为空** → 没有询盘 CPT、没有轮毂 CPT、没有 webhook → 后端塌方 | `deploy/wordpress/compose.yml:84`；`ls deploy/wordpress/mu-plugins` = Not found | M15 |
| **4** | **P0 · 致命** | **compose 缺 `WP_API_TOKEN` / `RESEND_API_KEY` / `INQUIRY_FROM` / `INQUIRY_TO`** | live 读取可能 401 → **静默 fallback 到兜底内容**（站看着正常、内容全错）；邮件永远 mock → **询盘不落到人** | `compose.yml` 全文；`client.ts:18`；`mailer.ts:14,15,60,101` | M15 |
| **5** | **P1 · 高** | **CI 从不验证 live WordPress 路径** | 「CI 全绿」对生产路径**零信息量**。mock 分支让 21 个 `src/lib/wordpress/*` 文件在 CI 中从未执行 | `verify.yml` 无 env；`client.ts:15-24,85-86`；BASELINE §3.1 `Environments: .env.local` | M15 |
| **6** | **P1 · 高** | **webhook 无重试/无队列/无告警（失败即丢）** | 内容发布后线上可能永久不更新，且**没人会知道** | `webhooks.php:41-42,50-51`；`self_check` 零调用（`:127`） | M13 |
| **7** | **P1 · 高** | **无 uptime 探测 / 无 5xx 告警 / 无询盘积压告警** | 站点或询盘挂了靠客户投诉发现 | 全仓无监控配置；`ARCHITECTURE.md:323` | M16 |
| **8** | **P1 · 高** | **回滚是散文，不是脚本；无版本化产物** | 出事时回滚靠「谁记得」；`fenghuai-site-preview.service` 在仓库中不存在；镜像 tag 硬编码 `:2026-10-09` | `deploy/wordpress/README.md:25-29`；`compose.yml:5` | M15 |
| **9** | **P1 · 高** | **Data Cache 在 standalone 下不可跨实例共享** | `revalidateTag` 只打本进程 → 多实例/滚动发布时**部分用户持续看到旧内容**，且 webhook 显示「成功」 | `next.config.ts:82`；BASELINE §4 无 Redis；`route.ts:63` | M13 |
| **10** | **P2 · 中** | **90 个 E2E 用例从未进 CI** | 回归无人守；STATUS 自述有既有失败 | BASELINE §10、§3.3 | M15 |
| **11** | **P2 · 中** | **8 个 verify 脚本零个被调度** | PHP/ACF/REST 契约无门禁，改坏无人知 | BASELINE §9 | M16（G11） |
| **12** | **P2 · 中** | **无关联 ID + 日志无大小上限** | 500 无法事后归因；json-file 无 `max-size` 可能撑爆 2GB 磁盘 | 全仓 grep 零命中；`compose.yml` 无 `logging:` 段 | M16 |
| **13** | **P2 · 中** | **`insights` 失效不刷 `/sitemap.xml`**（wheels 刷、insights 不刷） | 新博文延迟进 sitemap | `insights-contract.ts:501-505` vs `wheels-contract.ts:183-188` | M13（G6） |
| **14** | **P3 · 低** | **两份相同的 mu-plugins 副本 + 4 套部署配置并存** | 改一份漏一份的确定性隐患 | `diff -q` IDENTICAL；`local-wp/docker-compose.yml:83` 挂 `wp-data`，`deploy/wordpress/compose.yml:84` 挂 `./mu-plugins` | M13/M15 |
| **15** | **P3 · 低** | **`Dockerfile` vs `Dockerfile.prebuilt` 产物结构不一致；`compose.yml:12` 变量错位** | 两条构建路径必有一条未验证 | `Dockerfile:38-40` vs `Dockerfile.prebuilt:15-19`；`compose.yml:12` | M15 |

### 上线判定的净结论

**当前仓库不具备上线条件。** 阻塞不是「打磨不够」，而是四件**功能性**缺失叠在一起：

1. **数据没有副本**（#1）—— 一旦出事无法挽回。
2. **域名/TLS 没配**（#2）—— 上线等于自我隐形。
3. **WordPress 侧 compose 按现状起不来/起来是残的**（#3 #4）—— 后端是空的。
4. **没有回滚能力**（#8）—— 上线后出事只能硬扛。

其中 **#3、#4、#2 是纯工程/配置工作，1-2 天可闭环**（修一个挂载路径、补 4 个变量、申请域名）。
**#1 需要跨盘/跨机存储决策**，是唯一需要业务资源投入的项。
**#5-#9 决定「上线后能不能稳住」**，建议在上线同批次完成 #6 #7，否则第一周就会盲飞。

> 说明：本报告未对 `outputs/reports/` 下任何历史报告赋予「已满足」权重。凡标注 E3 的历史声称，一律只作为「曾被记录过」的线索，不作为完成证据。
