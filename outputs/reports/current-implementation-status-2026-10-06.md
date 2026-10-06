# 当前实现状态审计（2026-10-06）

## 审计结论

**总体状态：WARN｜核心展示页已形成可审阅闭环，但网站尚未达到首发条件。**

首页、About、Capabilities、自密封轮胎、锻造轮毂、三电壳体和定制铝制品共
7 个核心页面已经按各自 Page SPEC 形成内容契约、组件、路由与 WordPress 媒体
接缝，并通过本轮 lint、typecheck、production build 与本地 200 响应检查。

首发主链路仍有四个缺口：轮毂目录仍展示 16 个虚构 SKU，轮毂详情仍使用旧
`WheelSku` 与 SVG 示意图，旋压入口返回 404，统一询盘仍是轮毂长表单且只用
进程内存保存。sitemap 仍发布 16 个虚构轮毂 URL，且没有收录三条新产品线、
锻造入口与询盘页。因此当前版本适合继续开发与内容审核，不适合公开部署。

## 页面核验矩阵

| 页面 / 模块 | 状态 | 本轮证据 | 剩余事项 |
|---|---|---|---|
| `/` 首页 H01–H05 | PASS | 路由 200；读取 `getHomepageContent()`；四线、能力、项目路径与收口均由内容契约驱动 | 正式域名、联系信息和上线范围仍需冻结 |
| `/about` | PASS | 路由 200；WP 114/61/78/84 等实时媒体 URL 已进入 HTML；双制造基地结构存在 | 法人文件继续按实际主体展示 |
| `/capabilities` WM01–WM05 | PASS | 路由 200；工程、路线、检查、验证与文件证据五段已实现 | 证书候选仍不得在文件未核验时公开 |
| `/products/safety-tires` T01–T06 | PASS | 路由 200；17 张媒体接缝、8 mm 结构化证据和既有四视口截图存在 | 具体型号报告与品牌/市场授权仍需补全 |
| `/products/wheels/forged` WF01–WF06 | WARN | 路由 200；WF01–WF04、WF06 已实现；WP 批量媒体与本地同图回退存在 | WF05 因案例证据不足隐藏；后台标题/元数据待修；页面 title 当前重复 `Fenghuai` |
| `/products/ev-components` EV01–EV06 | WARN | 路由 200；三类壳体、工程问题、路线、证据矩阵与询盘入口已实现；canonical 与 `Service` schema 存在 | WP 20/24/38/49 的图权、主体、类别和后台元数据待运营补齐 |
| `/products/custom-aluminum` CA01–CA07 | WARN | 路由 200；按来图来样评估实施；当前正确输出 `noindex,follow` 且无 canonical | 不承接清单、制造/外协边界和图片权属确认后才能开放索引 |
| `/products/wheels` | FAIL | 路由虽为 200，但仍读取 `src/content/wheel-skus.ts` 的 16 个虚构 SKU | 改接 `wheel-catalogue.ts` 的真实型号/变体与批准覆盖层 |
| `/products/wheels/[sku]` | FAIL | 仍用旧 `WheelSku`、`WheelSketch`、推测 finish 色块与 applications | 按 WD01–WD06 改为真实 `WheelModel/WheelVariant`，只生成批准型号 |
| `/products/wheels/flow-formed` | FAIL | 本轮 HTTP 实测为 404 | 按 WFF01–WFF05 建路由，并复用批准目录集合 |
| `/request-a-quote` | WARN | 路由 200；来源上下文、POST API、422 校验、感谢页和真实受理号路径已存在 | 当前仍强制车型/轮毂系列；`family` 未写入 payload；需四线两步表单、隐私同意、幂等与持久化 |

## 数据、CMS 与询盘

### WordPress

- `fh-wp` 与 `fh-wp-db` 容器运行中；REST 实际地址为
  `http://127.0.0.1:8081/wp-json/wp/v2`。
- 对 WP 114/61/78/84 的批量请求返回 200 和 4 条媒体记录。
- `/about` 的服务端 HTML 包含 `localhost:8081/wp-content/uploads/...`，说明当前
  Next.js 实例确实处于 live 媒体读取状态，不是只显示本地回退。
- 页面文案主体仍来自 `src/content/*.ts`，WordPress 目前主要负责批准媒体覆盖；
  还不能描述成“全部内容由 CMS 管理”。

### 轮毂真实数据

- `src/content/wheel-catalogue.ts` 已生成 1349 个型号、3485 条变体；其中 1073 个
  有图技术候选、276 个无图。
- 当前公开目录、详情和 sitemap 没有消费这套真实数据，仍走 16 个旧示例 SKU。
- “有图”只满足技术候选条件；图权、规格和供货批准仍需作为公开集合的覆盖层。

### 询盘

- `POST /api/inquiries` 有服务端校验；空 payload 实测返回 422。
- `GET /api/inquiries` 在未配置管理员 token 时返回 404，未开放匿名列表。
- 生产环境未配置 Resend 时会返回 503，不会伪装销售团队已收到邮件。
- 记录当前保存于进程内 `Map`，服务器重启即丢；Resend 返回 accepted 即被记为
  delivered，没有 webhook、重试和独立邮件事件。
- 前端表单验证了 `family`，但提交 payload 没有包含它；跨四线使用时会丢失访客
  在表单中选择的产品线/系列信息。

## SEO、部署与仓库状态

| 检查 | 结果 | 说明 |
|---|---|---|
| sitemap | FAIL | 50 个 URL 中仍含 16 个虚构轮毂详情；缺少 EV、定制铝、轮胎、锻造和询盘等新路由 |
| canonical | WARN | 当前使用 `https://www.fenghuai.com`，但 `src/content/site.ts` 明确标为待确认 |
| 正式联系方式 | FAIL | 邮箱、电话、地址仍是 PLACEHOLDER；`confirmed=false` |
| OpenNext | FAIL | 仍无 OpenNext 依赖或配置；根 Docker 文件仍是克隆模板默认方案 |
| 包元数据 | WARN | `package.json` 仍是 `ai-website-clone-template` 的名称、仓库与说明 |
| 法务页 | WARN | 仍显示草稿提示，需要律师确认 |
| 工作树 | WARN | 本轮审计时有 205 条未提交工作树记录；大批归档迁移、代码与资产尚未形成可追溯提交 |
| 竞品/占位内容 | WARN | `src/content` 仍有 43 个 `PLACEHOLDER` token；旧产品、经销商、资源与适配路由仍需逐页发布审查 |

## 自动与运行时核验

| 检查 | 结果 |
|---|---|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS；Next.js 16.3.5，65 个页面数据项 |
| `git diff --check` | PASS |
| 7 个已实施核心页面 HTTP | PASS；全部 200 |
| 旋压入口 HTTP | FAIL；404，符合“尚未实现”的代码事实 |
| WP REST（正确端口 8081） | PASS；200，4 条目标媒体 |
| 既有视觉证据 | PASS；`outputs/` 下共 19 张页面验收截图 |

## 建议执行顺序

1. 先完成轮毂公开集合、目录、详情与 sitemap，使 1349 型号资产真正进入统一发布门槛。
2. 在目录卡片可复用后实现旋压入口，避免复制第二套筛选与分页逻辑。
3. 把询盘改为四线两步表单，修复产品线丢失，再接持久化数据库、幂等键和邮件事件。
4. 冻结域名、邮箱、电话、隐私文本和首发型号，清掉公开链路中的占位与虚构 URL。
5. 再做 OpenNext 运行时样机、备份恢复和部署成本验证。

## 本次记录边界

本次只核验和记录现状，没有提交、推送、部署或向真实地址发送测试邮件。已有截图
来自各页面实现任务；本轮没有把旧截图当成实时 CMS 证据，而是另外检查了 REST、
HTML、路由与生产构建。
