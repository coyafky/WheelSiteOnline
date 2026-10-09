# 项目状态

## 2026-10-09 商用基线继续收口

**当前判断仍为 No-Go。** 本轮已关闭所有不依赖管理层决定的本地工程基线，但正式
主体/域名/法律文本/首发产品签字/OpenNext 平台/邮件事件/监控恢复仍未具备，不能部署
生产、开放索引或向客户发信。

本轮完成：

- 腾讯云公网联调环境已部署：`119.91.205.130:7080` 运行 Headless WordPress，
  `119.91.205.130:9080` 运行 Node 24 Next.js；MySQL 不暴露公网，WordPress/Next 容器
  只绑定 7081/9081 回环端口，nginx 持有公网入口，三个容器均通过健康检查；
- 9080→Next API→WordPress 的询盘链路以 `INQ-20261009-0004` 验收：首次 `201`、幂等
  重放 `200`、WordPress 后台同编号可见；缓存刷新无签名 `401`，轮毂和 Insights 两类
  签名回调成功；
- 本地已经验收的 QQ SMTP 参数已在不向日志或仓库暴露明文的前提下同步到远端，并保留
  同步前 `.env` 备份；
  `INQ-20261009-0007` 在远端完成真实内部通知验收，后台 CPT 与事务 outbox 均为
  `accepted`、尝试次数 1、无错误。SMTP 接受不等同于最终送达，最终到件仍由收件邮箱确认；
- HTTP 联调入口曾因 CSP `upgrade-insecure-requests` 把 CSS/JS 错误升级为 HTTPS，现已
  改为仅对 HTTPS 地址启用，同时只在 HTTPS 下发送 HSTS；Playwright 远端复核 0 错误、
  0 警告，截图见 `outputs/remote-9080-zh-rendered-2026-10-09.png`；
- 服务器只有 2 GB 内存，远端 `next build` 会导致实例失去响应。部署流程已固定为开发机
  生成并冒烟验证 amd64 镜像、服务器只校验/加载/运行；失败构建的 1.863 GB 缓存已清理；
- 询盘表单客户端/服务端现共用 Zod 字段契约，Step 1/Step 2 增加可访问进度、完成状态、
  返回修改入口和错误聚焦；仓库核验为单一根包、多运行时项目，不是 monorepo；
- WordPress 轮毂后台已从“只改发布决定”升级为型号、逐条规格、规格排序、主图和图库的
  可编辑正本；138 个已批准型号和 677 张关联图片已幂等迁移，公开 `/fh/v1/wheels`
  契约接管后仍为 138 个型号，网络/契约失败保留最后有效静态兜底；
- `@/lib/wheels` 既有四个公共接口与页面组件契约不变，目录、筛选、详情、sitemap 和询盘
  复核统一读取 WordPress live 集合；权威空集合不会错误回退旧产品；
- 轮毂与 Insights 的保存、撤回、回收站和删除现以 HMAC-SHA256 请求体签名通知 Next，
  按内容类型失效 tag 与目录/详情/sitemap 路径；错误或缺失签名返回 401；
- Insights 已提供可增删排序的短版/正文分段编辑器和媒体库特色图片；现有 6 篇文章及图片
  已幂等迁移并打开 WordPress 权威接管，列表、文章首屏、预览和撤回均已验收；
- 临时 FH-002 完成草稿、两规格、媒体、批准、目录/筛选/详情/sitemap、修改、撤回和删除
  全生命周期测试；测试记录和媒体已清理，未把虚构产品留在后台；
- 新增 23 项 Playwright E2E：四种询盘上下文、201/200、422、429、数据库失败、邮件
  失败、感谢页回执、robots/sitemap/canonical、敏感 URL、预览/退出/缓存失效、中文
  独立 URL；axe/WCAG、键盘焦点、错误聚焦与等效 200% 缩放全部通过；
- 限流键全部只保存 SHA-256；应用错误日志不再输出异常正文；WordPress 邮件错误入库前
  脱敏邮箱、电话和密钥；新增默认关闭的保留/级联删除接口，Docker 探针已验证且清理；
- Insights 新增 `fh_guide` WordPress 内容类型、中文后台字段、稳定 REST 视图、双重发布
  门槛、权威接管开关、预览、撤回和按 tag 立即失效；CMS 探针完成且无残留数据；
- Insights 列表改为图像主导的工业编辑版式；页头与页脚借鉴参考站的透明叠加、下划线
  导航、强字标和深色大版面，但未复制竞品资产、品牌或文案；
- i18n 改为英文根 URL + 中文 `/zh/*` 独立 URL，切换保留路径、查询参数与片段，站点
  框架中英双语；中文正文尚未逐页完成，因此响应强制 `noindex,follow`，不进入 sitemap；
- 轮毂 Markdown 导出器修复派生字段误参与对账的问题，重新生成并验证 1349 条来源记录、
  3485 条 variant、8 个直径组；两个过期 active 任务已移入 completed；
- 完成深色模块车辆场景审计，生成三张无品牌合成图并接入轮毂目录页首、自修复轮胎
  页首和 EV 工程评估横幅；合成图只承担装饰与应用语境，不进入产品/制造证据链；
- 页头语言切换改为同基线的 `EN / 中文` 文字状态，询盘入口取消桌面胶囊描边，改由
  品牌色与方向箭头强调；中英、透明/滚动态和移动菜单均完成截图验收；
- 轮毂目录参考 Vossen 的白底留白、无框产品陈列与居中信息层级完成 UI 重构，同时保留
  PCD/尺寸/工艺筛选与真实 variant 契约；四视口无横向溢出，源图统一另列资产任务；
- 当前门禁：24/24 单元测试、23/23 浏览器测试、轮毂 CPT 21/21、Insights 结构化 CMS
  探针、FH-002 live 生命周期、lint、typecheck、191 项 production build 与生产进程冒烟全绿。

证据目录：

- `resources/screenshots/2026-10-09-insights-redesign/`
- `resources/screenshots/2026-10-09-header-footer-redesign/`
- `resources/screenshots/2026-10-09-automotive-backgrounds/`
- `resources/screenshots/2026-10-09-header-controls/`
- `resources/screenshots/2026-10-09-vossen-wheel-reference/`
- `resources/screenshots/2026-10-09-wheel-catalogue-refinement/`
- `outputs/reports/04-privacy-logging-retention-audit-2026-10-09.md`
- `outputs/reports/05-automotive-background-module-audit-2026-10-09.md`

当前可继续由开发推进但尚未完成：其余页面正文/SEO 迁入 WordPress 稳定适配器、逐页
中文内容翻译与核验、中文 `hreflang`/sitemap 放行、真机软键盘和屏幕阅读器 UAT。

本轮未 commit、push，未改 DNS；已部署 7080/9080 公网联调环境，并向已配置的内部 QQ
收件邮箱发出 1 封合成 SMTP 验收通知。当前仍是 IP + HTTP、强制 `noindex` 的上线验收
环境，不等同于完成域名、TLS、正式隐私文本、监控和恢复演练后的商用生产环境。生产依赖
审计为 0 漏洞；完整开发依赖树仍有 9 个 high，已排入
`work/queued/2026-10-09-development-dependency-security-audit.md`，未执行破坏性 force fix。

## 2026-10-08 商用完整核验

**当前判断仍为 No-Go：可用于本地演示、内容评审和继续开发，不可正式公开上线。**

工程流程已新增项目技能
`SKILLS/fenghuai-engineering-workflow/`（DEC-061）：固定
`mattpocock/skills@v1.3.1`，归并规格、纵向 Issue、TDD、证据化诊断、双轴评审和
复盘方法。所有项目记录继续使用中文，Issue 继续走 `work/` 生命周期，不自动
commit/push/deploy，也不另建第二套外部 Issue 正本。

本轮完成三个独立交付：

1. [商用就绪完整核验与整改计划](outputs/reports/01-commercial-readiness-audit-2026-10-08.md)
2. [UI 页面审计报告](outputs/reports/02-ui-page-audit-2026-10-08.md)
3. [正式部署所需资源与管理层请示清单](outputs/reports/03-deployment-resource-and-decision-request-2026-10-08.md)

对应整改任务已进入
[商用上线整改与验收](work/queued/2026-10-08-commercial-launch-remediation.md)。

### 2026-10-08 自主整改后状态

已按 DEC-061 的工程流程完成一轮“无需上级请示”的垂直整改：

- 询盘改为 QF01–QF03 两步四线/B-C 表单，个人客户不强制公司；浏览器幂等键、
  200/201 重放、主动隐私同意、确定版本、失败保留与感谢页已贯通；
- API 增加 16 KiB 上限、Origin 白名单、蜜罐、时间陷阱、IP/邮箱窗口限流；匿名 GET
  恒返 404，恶意 Origin 实测 403，超大请求体实测 413；
- WordPress 新增 `fh_inquiry_sales` 最小权限角色，Contributor/Author 不可读询盘，
  邮件派发只给管理员；销售通知改为 HTML + 纯文本备用，邮件可直达同一条 WordPress
  详情，后台列表错列已修；Docker 完整验收更新为 **78/78 通过**；
- 未批准法律、经销、洞察与适配内容已 `noindex` 并退出 sitemap；站点 URL 未配置时
  robots/sitemap fail-closed；假联系渠道已隐藏；
- 英文首发不再读取语言 cookie，未完成语言切换已移除；主要页面恢复静态预渲染；
- 永久迁移统一为 308；CSP、HSTS、nosniff、frame、referrer 和 permissions 安全头已启用；
- Next.js 与 eslint-config-next 升至 16.4.0；`npm audit --omit=dev` 为 **0 漏洞**；
  新增 7 项询盘契约测试与中文 CI；
- 移动筛选展开时隐藏浮动询盘按钮；偏距公式改为自身滚动，390px 视口整页
  `scrollWidth=390`；询盘旧“轮毂/三个字段/一分钟”文案已清除。
- 感谢页成功状态增加 15 分钟 HMAC 回执；直接访问、篡改询盘号或伪造 token 均不会
  显示“已记录”。
- 邮件模板以合成数据通过 900px/390px Playwright 复核，中文 UTF-8、客户输入转义、
  分区和无横向溢出均通过；真实内部验收询盘 `INQ-20261008-0001` 已由 SMTP 接受并
  保留在本地 WordPress（`post_id=538`）供后台查看。

当前工程门禁：`npm run lint`、`npm run typecheck`、`npm test`、带站点 URL/隐私版本的
`npm run build`、`npm audit --omit=dev` 与 `git diff --check` 均通过；Next.js 16.4.0
生成 188 个页面数据项。浏览器证据保存在
`resources/screenshots/2026-10-08-commercial-audit/`。

当前仍阻断正式上线、且不能由开发代理自行决定的事项：

- 正式法定主体、域名、邮箱、电话、地址、工作时间与销售责任人；
- 138 个验收型号收窄为业务/工程/供应/图权共同签字的首发集合，并补齐合格主图；
- 五份法律文本、目标市场、B/C 政策和隐私版本的正式批准；
- OpenNext 平台、生产 WordPress/MySQL、邮件提供商事件回调、可靠 cron、监控、告警、
  备份恢复和应用回滚；
- 预发布 UAT、真机/无障碍、真实 delivered/bounced、第二人恢复演练与最终上线授权。

本轮未 commit、push、deploy，未变更 DNS。本次邮件格式修复只向服务端配置的内部
收件邮箱发送 1 封合成验收通知，未向客户地址发送邮件；`accepted` 不代表最终送达。

## 2026-10-06 当前状态

**当前版本已完成 7 个核心展示页，但轮毂交易主链路、统一询盘持久化、SEO
发布集合与部署层仍未完成，因此只适合本地开发和内容审核，不适合公开上线。**

完整核验报告见
[当前实现状态审计](outputs/reports/current-implementation-status-2026-10-06.md)。本轮未
commit、push、deploy，也没有向真实地址发送测试邮件。

### 已实现并通过本轮构建与路由核验

| 路由 | 当前实现 | 状态边界 |
|---|---|---|
| `/` | H01–H05、四条产品线、制造能力、项目路径与统一收口 | 已实现 |
| `/about` | 公司定位、公司角色分工与集团纵向链条、轮毂制造基地、自密封轮胎制造基地 | 已实现；法人证据仍按实际主体 |
| `/capabilities` | WM01–WM05 轮毂制造与质量证据 | 已实现；证书未核验不公开 |
| `/products/safety-tires` | T01–T06、17 张媒体、8 mm 结构化证据 | 已实现；具体型号报告待补 |
| `/products/wheels/forged` | WF01–WF04、WF06 | 已实现；WF05 因案例证据不足隐藏，后台元数据待补 |
| `/products/ev-components` | EV01–EV06、三类有图壳体 | 已实现；4 张 WP 媒体运营元数据待补 |
| `/products/custom-aluminum` | CA01–CA07、来图来样评估 | 已实现；业务边界未确认，保持 `noindex,follow` |

本轮 `npm run check` 全绿：lint、typecheck、Next.js 16.3.5 production build
均通过，共生成 65 个页面数据项；`git diff --check` 通过。上述 7 个路由在
`127.0.0.1:3005` 全部返回 200。现有页面验收目录共保存 19 张截图。

本地 WordPress 的正确 REST 地址是
`http://127.0.0.1:8081/wp-json/wp/v2`；`fh-wp` 与 `fh-wp-db` 容器运行中，
WP 114/61/78/84 批量请求返回 200 和 4 条记录，`/about` HTML 已出现真实
WordPress 媒体 URL。当前 CMS 接缝主要覆盖批准媒体，页面文案仍以
`src/content/*.ts` 为主，不能描述成全站内容均由 WordPress 管理。

### 部分实现或未实现

0. **✅ 轮毂链路已全部打通（2026-10-06）**：事实层 → WordPress CPT（138 条）→
   批准快照 `src/content/wheel-publication.json` → 公开集合模块 `src/lib/wheels/`
   → **目录页 `/products/wheels`（W01–W03）与详情页 `/products/wheels/[model]`
   （WD01–WD06）已改接完成**，sitemap 与询盘服务端复核同步接入。
   四视口运行时验收全绿（0 横向溢出 / 0 断图 / 0 控制台错误），
   询盘伪造规格实测被服务端真相覆盖。见 DEC-052 与 DEC-053。
   口径提示：本轮按用户决定 138 条全部批准（便于验收分页/筛选/排序），
   与规格「首发 10–20 个」不一致，**上公开环境前必须收窄**。

1. **✅ 旋压入口已实现（2026-10-06，DEC-054）**：`/products/wheels/flow-formed`
   已按 WFF01–WFF05 落地，**死链已修**。工艺边界服务端锁定（`?process=` 任一取值均被
   忽略）；复用目录卡片/筛选/排序/分页（后两者已参数化）。
   ✅ **索引已开放**（2026-10-06，用户指令）：`publicationGate` 两项均置为已确认 →
   `robots: index,follow` + canonical 自指 + 已进 sitemap（177 URL）。
   `sitemap.ts` 读同一门槛，**再关闭会自动退出**（双向耦合已实测）。
2. **`WheelSketch` 已归档（2026-10-06，DEC-059）**：`src/components/wheel-gallery.tsx`
   （含 `WheelSketch`）随 `/gallery/wheels` 一起搬进
   `archive/2026-10-06-fictional-galleries/`。
   ⚠️ **此处原写「那是另一个 PAGE-SPEC（轮毂设计画廊）」—— 该说法是错的。**
   全量复核（现行 `PAGE-SPECS/`、`PAGE-SPECS/index.md`，以及 `archive/*/PAGE-SPECS/`）：
   **`/gallery/*` 从来没有 Page SPEC**。归档基线里的
   `archive/2026-10-01-document-baseline/PAGE-SPECS/_viewport-audit.md` 自己就写着
   「规格里**没有 `/gallery` 的独立页面规格**」，把 `/gallery` 列在「本阶段不做」表里。
   所以「先处理它的规格」这个前置条件不存在 —— 它从上线起就一直是未授权素材的占位。
3. **✅ 旋压入口已实现（2026-10-06，DEC-054）**：`/products/wheels/flow-formed`
   已按 WFF01–WFF05 落地，死链已修；工艺边界服务端锁定；发布门槛已按用户指令开启
   （`index,follow` + canonical + 已进 sitemap）。
4. **询盘后端已落地（2026-10-06，DEC-055）**：**持久化不再是内存 Map** —— 改为
   WordPress CPT `fh_inquiry` + 三张专用表（幂等唯一键 / 邮件 outbox / 邮件事件），
   经服务密钥鉴权的 `POST /fh/v1/inquiries` 写入，WordPress 后台可查阅管理。
   端到端实测通过（含事务回滚与规格快照复核）。
   **仍待做**：QF01–QF03 两步四线表单（当前可见表单仍是轮毂长表单）、
   感谢页按 §7.3 复查、邮件事件回调。mu-plugin 的 WP-Cron 租约重试已在本轮完成
   66/66 运行时复验；生产仍需改由可靠的平台定时任务触发并补齐监控告警。
5. **✅ sitemap 已修正（2026-10-06）**：16 条虚构轮毂 SKU URL 已换成
   `listPublishedWheelSlugs()` 的 138 条真实公开 slug；补上 EV、轮胎、锻造、询盘
   四条真实可索引路由；`/gallery` 与 `/gallery/wheels` 两条**虚构内容路由**已下架
   （DEC-059），`/gallery/finishes` 改读门槛、门槛关闭时不收录。当前 **174** 条。
   `/products/custom-aluminum` 与 `/gallery/finishes` **刻意不在列表内** —— 分别由
   DEC-050 与 DEC-059 的门槛控制。
6. **部署与上线事实未冻结**：OpenNext 尚未落地；正式域名、邮箱、电话、隐私文本
   未确认。**模板遗留已在 2026-10-06 清完（DEC-060）** —— `package.json` 元数据
   已换成本项目自己的，根 Docker 文件 / `LICENSE` / `CONTRIBUTING` / `SECURITY` /
   双锁文件中的 `bun.lock` 全部归档。**仍缺的是生产部署文件本身**（等平台决定）。

对应下一步任务已写入：

- `work/queued/2026-10-06-wheel-catalog-detail-flow-sitemap.md`
- `work/queued/2026-10-06-inquiry-page-and-persistence.md`
- `work/queued/2026-10-05-template-runtime-metadata-cleanup.md`

轮毂链路的施工前架构分析见
[`outputs/designs/wheel-publication-architecture-2026-10-06.md`](outputs/designs/wheel-publication-architecture-2026-10-06.md)，
**该方案已于 2026-10-06 落地并写入 DEC-052**（数据链路部分）。

分析发现的 108 组重复型号已在本轮查清并修正了处置口径：事实层按
「（来源目录, model）」分条，同一 model 横跨多个尺寸目录且各目录变体**互不重叠**，
因此公开型号必须取**并集合并**（1349 条源记录 → 1219 个唯一型号）。
此前「保留分高的那条记录」的去重方式丢掉了 257 个变体（26%），属真实数据丢失，
已在 `select-wheel-first-batch.py` 与 `publication.ts` 两处修正。

公开集合的资格判定集中在 `src/lib/wheels/publication.ts` 一处，逐条对照
mu-plugin 的 `fh_wheel_is_approved()`，**fail-closed**（缺字段即不通过，
快照缺失时公开集合为空，绝不回退成「所有有图型号」）。

工作树当前包含大量尚未提交的架构迁移、代码、图片和验收产物；在继续开发前应按
功能边界整理并形成可追溯提交，但未经用户明确授权不执行 commit 或 push。

## 2026-10-05 历史工作记录（已由上节覆盖）

**本轮完成：在既有规划（5 份文档 + T00–T23 任务卡 + 视口规格）基础上进入执行阶段——T02 工程基线三项门禁全绿；T03 询盘泄漏关闭并经生产实例运行时验证；真实轮毂口径重跑为 1349 型号 → **1073 有图技术候选 / 276 无图**；本地 WordPress 实验场上线并导入 157 张 PPT 图片。首页 H01–H05、About A01/A02/AF01–AF03/AT01–AT03/A03、Capabilities WM01–WM05 和自密封轮胎 T01–T06 已完成代码、Headless WordPress 媒体接线与桌面/移动视觉验收；用户确认集团制造基地可用“我们的工厂”口径，当前媒体库图片均可读取（DEC-042～DEC-048）。部署与真实发信仍未执行。**

已新增 [`outputs/page-spec-agent-prompts/`](outputs/page-spec-agent-prompts/README.md)，把上述已完成页面的实施方法整理为其他 agent 可直接复制的主提示词、媒体证据提示词、独立验收提示词和剩余页面启动提示词。建议按轮毂目录 → 详情模板 → 旋压入口 → 锻造 → 三电 → 定制铝制品 → 统一询盘的依赖顺序执行。

用户已确认：公司按 PPT 为深圳峰徊科技有限公司；与蓝辉为同一股东名下不同公司；四线平行、B/C 客户；海外英文优先；目标 2026-11-04；整体运行维护约 1000 元/月。当前重点由既有首页微调转为首发范围与真实产品/询盘链路。

交付入口：

- [全仓文档导航](DOCUMENTATION.md)
- [总计划与月预算](outputs/site-launch-plan/README.md)
- [数据库与询盘契约](outputs/site-launch-plan/02-data-and-inquiry-design.md)
- [素材分配](outputs/site-launch-plan/03-content-and-assets.md) 与 [40 条 PPT 图片对象定位](resources/research/2026-10-04-site-plan/ppt-image-locations.csv)
- [逐页逐视口施工图](PAGE-SPECS/2026-10-04-launch-viewport-spec.md)
- [首页规格](PAGE-SPECS/homepage.md)：H01–H05、四条产品线、六项制造能力、制造主体边界、交付路径和统一询盘
- [About 轮毂制造合作方模块规格](PAGE-SPECS/about-wheel-factory.md)：WP 媒体 114/61/78/84、英文文案和双端验收
- [Capabilities 轮毂制造与质量能力规格](PAGE-SPECS/capabilities-wheel-manufacturing.md)：WM01–WM05、12 张工艺/检测图、2 张证书候选和证据门槛
- [锻造轮毂高端定制规格](PAGE-SPECS/forged-wheel-customization.md)：WF01–WF06、6 张可用媒体、案例门槛和询盘输入
- [自密封轮胎规格](PAGE-SPECS/self-sealing-tires.md)：T01–T06、8 mm 证据口径、17 张候选媒体和现有页面替换要求
- [About 自密封轮胎制造合作方规格](PAGE-SPECS/about-self-sealing-tire-factory.md)：AT01–AT03、7 张生产图和制造主体边界
- [轮毂产品目录规格](PAGE-SPECS/wheel-catalog.md)：W01–W03、真实变体筛选、24 个/页、SEO 和发布门槛
- [轮毂详情页规格](PAGE-SPECS/wheel-detail.md)：WD01–WD06、单图首屏、真实变体、嵌入式询盘、finish 和相关型号
- [旋压轮毂入口规格](PAGE-SPECS/flow-formed-wheels.md)：WFF01–WFF05、工艺边界、批准型号集合、WP 116、目录复用和变体询盘
- [新能源三电铝制品规格](PAGE-SPECS/ev-components.md)：EV01–EV06、三类有图壳体、工程问题、工艺证据和询盘输入
- [定制铝制品规格](PAGE-SPECS/custom-aluminum.md)：CA01–CA07、来图来样评估、四类应用、工程方法示例和发布门槛
- [项目询盘页规格](PAGE-SPECS/request-a-quote.md)：QF01–QF03、四线/B-C 分流、两步短表单、上下文快照、事务成功和隐私门槛
- [开发任务卡与 DeepSeek 提示模板](outputs/site-launch-plan/04-task-cards.md)
- [航鹏轮毂素材库](outputs/hangpeng-wheel-media/README.md)：68 张候选素材，其中 36 款轮毂按型号命名
- [架构与 README 校准审计](outputs/architecture-alignment-audit.md)：三份核心文档的旧描述、修正结果和剩余实现缺口

### 文档版本

`ARCHITECTURE.md` 已按业务主体、模块接缝、内容证据、产品发布集合、页面、询盘、运行时和运维重新校准，并明确区分已实现、已设计和待确认。根 `README.md` 已从旧纯轮毂静态原型说明改为四线 B/C 项目的真实开发入口；`ARCHITECTURE/README.md` 负责阅读导航。`PAGE-SPECS/` 只保留现行首发正本与子规格。2026-10-01 的详细架构、22 份按路由施工图、旧视口审计、旧交接快照、旧实施草案和四个已被覆盖的待办，完整迁入 `archive/2026-10-01-document-baseline/`。没有删除历史内容。`DOCUMENTATION.md` 是当前文档统一入口（DEC-042）。

首页已按 H01–H05 子规格完成实现：公司级 Hero、四条等权产品线、六项有范围的制造能力、五阶段项目路径与统一询盘收口均已接入。`WheelStripSection` 已从首页移除，旧的 `under one roof`、`factory direct`、`Four lines, one factory` 和结果式询盘承诺不再出现。WP 114、61、78、155 已由用户批准，并通过 `src/lib/wordpress/homepage.ts` 从 Headless WordPress 读取 URL、alt 和 caption；WordPress 不可用时回退到同一张批准图片。页面按用户确认使用“我们的制造基地”口径，法人证据仍按实际主体（DEC-040、DEC-043、DEC-044）。

About 页已按现行规格完成重建。公司 Hero 与四项角色分工替换了旧占位统计和竞品式定位；AF01–AF03 使用 WP 114/61/78/84 展示厂区、铸造、CNC 与涂装；AT01–AT03 使用 WP 155/159/148/18/16/145/136 展示自动化、专用设备、产线、材料和检测环境。11 张媒体均已补英文 alt、caption、来源、用途与批准状态，组件共用 WordPress 批量媒体适配器并保留同图本地 WebP 回退。生产实例实测单次 REST 请求返回 11 张媒体，页面 1.12 秒返回并使用 WordPress URL。桌面 1440×900 与移动 390×844 已验收，无横向溢出（DEC-045）。用户另确认当前媒体库全部 157 张图片均可读取，已统一写入批准元数据；页面是否展示仍由 PageSpec 映射决定（DEC-046）。

Capabilities 页已按 WM01–WM05 完成重建：工程输入、重力/低压/旋压路线选择、过程检查、三类验证试验和文件证据分别回答五个采购问题。12 张公开媒体已通过单次 WordPress 批量请求接入，并有同图 WebP 回退；WP 96/48/87/115/101/53/106 标题已修正，14 张相关媒体均补 alt、caption、来源与用途。证书 WP 53/106 保持内部候选，不进入页面。桌面 1440×900 与移动 390×844 已视觉验收，无横向溢出（DEC-047）。

锻造轮毂页已新增 WF01–WF06 高端定制子规格。像素比对确认 WP 42/29/58/70/30/76 可分别用于锻造铝轮毂示例、压力机、探伤、CNC、表面样件和产品检查；ID 88/56/91 实际是装车图，不能按现标题当产品或工艺图。镁合金、热锻及三张装车图未正确入库；页面代码与后台元数据尚未修改（DEC-032）。

自密封轮胎页已按 T01–T06 完成重建。17 张 WordPress 图片通过一次批量请求接入道路痛点、产品定义、自密封机理、8 mm 内部测试、研发和生产证据，并全部补齐 alt、caption、来源、用途与批准元数据；WordPress 不可用时回退到同图本地 WebP。8 mm 已建模为 `objectDiameterMm=8`、`punctureZone=tread`、`status=supplier-stated` 的结构化证据，未绑定具体型号报告前不会升级为已验证。旧页的无报告性能数字、`our in-house validation`、泛化认证和道路救援承诺已移除；桌面 1440/1280 与移动 390/360、无 JavaScript、无横向溢出和生产实例均已验收（DEC-033、DEC-048）。

About 的 AT01–AT03 已并入页面实现。来源页的 `Independent Production` 未公开，页面使用用户确认的集团制造基地口径；具体制造法人、工厂地址、设备所有权、型号测试与市场文件继续逐项目核验（DEC-034、DEC-044、DEC-045）。

轮毂目录已新增 W01–W03 子规格。Vossen 的紧凑目录、桌面筛选和大图卡片被保留为结构参考；Price、Series、色板和移动溢出不沿用。真实数据审计确认 1073 个有图技术候选含 2705 个变体，13 个型号有异常/复合 PCD、647 个未标工艺、531 种原始 finish 待治理。当前页面仍使用虚构 `wheel-skus.ts`，代码尚未改造（DEC-035）。

轮毂详情已新增 WD01–WD06 子规格。2N N-501RS 的左图右信息首屏、产品上下文内询盘、finish 说明和相关型号顺序被保留为结构参考；三图缩略图库、自由规格组合、通用色点和车型营销不沿用。详情继续使用单张批准主图，规格逐条读取批准 variant，询盘服务端复核 productionCode。当前 `[sku]/page.tsx` 仍使用虚构 `WheelSku`、`WheelSketch`、finish 色块和 applications，代码尚未改造（DEC-036）。

旋压轮毂入口已新增 WFF01–WFF05 子规格。真实生成目录中有 350 个 `旋压` 与 20 个 `低压+旋压` 型号，其中 330 个匹配图片、合计 762 条变体；这些仍是技术候选，不直接写成可售数量。页面只聚合两个规范工艺值和完整批准型号，`旋压` 不反推低压铸造毛坯，也不等同整体锻造。WP 116 仅作为供应商旋压设备场景；当前应用路由尚不存在（DEC-039）。

新能源三电铝制品页已新增 EV01–EV06 子规格。首发只发布水冷电机壳、高压铸造电机壳、电控/逆变器壳体三类有图项目；WP 38/24/49/20 已按像素内容核对。工艺主张与照片证据分开管理，WP 38 不能作为焊接、密封或泄漏检测实拍。现有页面的 15 类部件、X-ray 和完整受控流程等超范围内容需要收敛（DEC-037）。

定制铝制品页已新增 CA01–CA07 子规格。由于目前没有可确认属于非轮毂、非三电项目的定制铝件照片，首屏改用 2D/3D/样件输入型视觉；四组应用仅作为评估范围。WP 67/31/48 只作为轮毂几何上的工程方法示例，WP 44 实际是低压铸造设备，不能证明逆向工程。制造主体、不承接清单、应用范围和图权未确认前保持 `noindex,follow`（DEC-038）。

项目询盘页已新增 QF01–QF03 子规格。2N 的低门槛说明、准备清单、短表单和直接联系兜底被保留为结构参考；页面改为四条产品线与 B/C 客户共用的两步流程。当前 `InquiryForm` 仍强制公司、车型、轮毂系列和数量，并把邮件状态简化为 `delivered: boolean`；实现时需改成产品上下文服务端复核、幂等提交、事务持久化和独立邮件事件。正式隐私政策、销售邮箱和持久化未完成前不得公开成功承诺（DEC-041）。

### 新核查到的发布阻断项

1. `GET /api/inquiries` 公开读取已关闭；询盘仍由内存 Map 保存，重启即丢。生产前必须完成真实持久化。
2. 邮件已有 Resend HTTP 调用，mock 日志已不再输出客户正文；但 accepted 仍被当 delivered，重试、回调与事件状态尚未实现。
3. 首页、About、Capabilities 与自密封轮胎页媒体已接入 WordPress；其他页面内容仍未接线，不能声称全站已由 CMS 驱动。
4. 蓝辉主表 1349 个型号中实测 1073 个有图、276 个无图；有图只满足技术上架门槛，仍不能直接当可销售授权数量。
5. PPT/PDF 素材有试用水印、规格表列顺序问题、面积单位冲突及未经核准的数字；逐项处理，不直接批量上线。

### 下一步

1. **T00/T01 业务事实冻结**：正式域名/邮箱、航鹏与洛克授权范围、首发 10–20 个型号（从 1073 有图型号中选）、PPT 水印/单位/表格歧义处理。
2. **WP 文案录入**：把 3 个 PPT 的模块内容（文案+图片关联）录入本地 WP 实验场（媒体已就位，逐模块建页建文，标注 DRAFT/待审核）。
   - 录入首页 H01–H05：为 WP 114、61/116、78/38、153、155 建立主体、产品线、使用范围、图权、alt、caption 和批准状态；四线媒体未批准时使用各自兜底，不互相冒充。
   - About 双制造基地模块与 11 张媒体元数据已完成。
   - Capabilities WM01–WM05、12 张公开媒体和 2 张证书候选元数据已完成；证书待文件核验后才可公开。
   - 然后录入锻造轮毂 WF01–WF06：修正 42/29/30/76 与 88/56/91 的标题，补 6 张公开候选图元数据；案例图继续保持草稿，缺失素材经审核后再导入。
   - 自密封轮胎 T01–T06 已完成：17 张图片元数据、页面媒体映射和 8 mm 结构化测试证据均已落地；下一步只在取得具体型号报告后补全测试字段。
   - About AT01–AT03 已完成公开图片与中性说明；实际法人、地点、设备作用和型号证据仍按项目文件补全。
   - 录入三电 EV01–EV06：为 WP 38/24/49/20 补主体、产品类别、来源、图权、alt、caption 与批准状态；不得从文件名推断焊接或工艺。
   - 录入定制铝制品 CA01–CA07：为 WP 67/31/48 补“轮毂几何方法示例”caption 和证据边界；WP 44 保留给轮毂能力资料。
   - 录入旋压轮毂 WFF01–WFF05：为 WP 116 补主体、来源、图权、alt、caption 和批准状态；画册产品图没有工艺绑定前不标成旋压产品。
3. **数据接缝接线**：首页、About、Capabilities 与自密封轮胎媒体接缝已完成；下一步把页面文案和其余产品线内容逐步迁入 WordPress 稳定模型。目录/详情/筛选改读 `wheel-catalogue.ts`（T07/T11），随后实现旋压入口、三电、定制铝制品与统一询盘，最后同步 sitemap 并清除虚构 URL（T18）。
4. **T04 运行时样机**：本地验证 OpenNext/数据库/邮件，锁定部署层与费用，再谈远程。
5. 完成 Git 推送并确认远程仓库可克隆。

未决：正式域名/邮箱、目标国家优先级、C 端交付与安装/售后、供应方与图权逐项确认、首发批次、服务商与实际费用/恢复能力。计划中的预算数字是分配上限，不是已核价报价。

收尾：旧 PROJECT 与旧文档基线已归档；项目说明、README、架构、决策与状态已同步；原资料只读，核验输出位于 resources；首页、三电、定制铝制品、旋压轮毂和询盘 Page SPEC、竞品/数据/媒体/架构审计与完成记录已归档；应用上一轮 lint/typecheck/build 已三绿；Git 已初始化、提交并关联远程（推送进行中）；本地 WordPress 实验场数据不入库（gitignore）。本轮架构校准只改文档，没有改应用代码，因此以 Markdown 链接检查和 `git diff --check` 验收。

## 历史快照：2026-10-01（以下不是本轮实测）

Last Updated:
2026-10-01 21:30

## Current Phase

**阶段 3：文档三层建立 + 首页结构重构完成，进入「视口语义对齐 + 规格轴心改造」**

这一阶段最大的变化**不是代码，是「怎么记录」**：一日之内多出**三个文档层**
——`DESIGN.md`（设计正本）、`PAGE-SPECS/`（页面施工图）、
`ARCHITECTURE/` 下三条非轮毂产品线的页面架构。
站点也随之从 **26 个页面路由扩到 33 个**，首页 Hero 完成结构级拆分。

```
前端克隆骨架  █████████░  90%  竞品痕迹已清；但 primaryNav 仍是旧结构（见 Blocker）
资产层        ██████████ 100%  1349 型号 / 2757 图 / 语料库 / 技能库
类型层        ████░░░░░░  40%  ⚠️ 仍缺规格字段，接不住资产层（未动）
内容后端      █░░░░░░░░░  10%  Headless WP 读取层已建（mock 模式），未接真站
部署层        ░░░░░░░░░░   0%  OpenNext 未接入，仓库里零依赖零配置
询盘系统      ████░░░░░░  40%  API 路由已可跑（POST 201 / 422），DB 与邮件仍是 mock
文档与设计层  █████████░  90%  DESIGN / PAGE-SPECS / page-architecture 三线已成，轴心待统一
```

## Current Focus

**从「能跑起来」转向「按视口原则把页面切对」。**

`DESIGN.md` §0.5 确立了一条全站第一原则 —— **一个视口 = 一个核心问题**
（1 主信息 + 1 主视觉 + 1 主行动 + 0–2 次行动），并由此推出
**★ 合并或删除律**（两个连续 Section 没回答两个不同问题 → 合并或删除）。

首页 Hero 已经按这条原则动过刀（品牌独占一屏、四张产品卡移出），
但**页面其余部分和新规格尚未系统对齐** —— 这是当前正在做的事。

## Completed

- ✅ **前端克隆骨架**：以竞品 [2nforged.com](https://2nforged.com) 为蓝本，
  逆向重建为 Next.js 16 App Router，26 个路由全部静态预渲染
- ✅ **内容层结构**：21 个类型化内容模块（`src/content/*.ts`），契约在 `types.ts`
- ⛔ **两块画廊已退场（2026-10-06，DEC-059）**：`/gallery`（按车型）与
  `/gallery/wheels`（按设计）发布的是**虚构内容、0 张真实素材**，已归档并改为
  **308 永久重定向**（→ `/fitment` / → `/products/wheels`）。`/gallery/finishes`
  **保留但加发布门槛**（色名未确认 → `noindex, follow`、不发 canonical、不进 sitemap）
- ✅ **偏距计算器**：可用，公式已对独立基准验证
- ✅ **空白页事故修复**：动效系统 fail-hidden 缺陷已定位并修复
  （详见 `docs/BLANK-PAGE-AUDIT.md`）
- ✅ **竞品结构侦察**：`docs/research/2nforged-reference.md`（UI 蓝本记录）
- ✅ **询盘系统架构定稿**：`docs/plans/inquiry-system-architecture.md`
- ✅ **对标架构调研**：`docs/research/next-wp/` 四篇分册
- ✅ **项目档案层**：四个根文件 + `inbox/` `resources/` `outputs/` `work/`
- ✅ **架构规范**：`ARCHITECTURE.md`（7 层模块模型 · 26 KB）
- ✅ **架构文档集**：`ARCHITECTURE/`（14 份）
  - `page-architecture/2nforged-page-inventory.md` —— 竞品 **12 页 / 88 section** 完整清单
  - `page-architecture/content-design-and-new-pages.md` —— **内容设计法 + 新增页决策**
  - `page-architecture/README.md` —— 我们的页面架构（九段式模板）
  - `page-architecture/wheel-detail-page.md` —— ★★ **单车品页（1018 页的模板）**
  - `page-architecture/fitment-pages-plan.md` + `wheel-browsing-and-fitment-pages.md`
    —— 车系适配页 + 浏览维度（对口 WheelPros）
  - `page-architecture/wheel-catalog-page.md` —— ★★ **轮毂目录页（1018 + 7 组筛选器）**
  - `page-architecture/dealers-page.md` —— ★★ **经销商页（竞品 14 段底本）**
  - `page-architecture/private-label-page.md` —— ★★ **贴牌页（竞品 16 段底本）**
  - `page-architecture/resources-hub-page.md` —— ★★ **资源中心（12 选题）**
  - `page-architecture/about-page.md` —— ★★ **关于我们（工厂信任页）**
  - `page-architecture/contact-page.md` —— ★★ **联系页（全站最短 · 连着后端）**
  - `page-architecture/private-label-page.md` —— ★★ **贴牌页（竞品 16 段底本）**
  - `tech-architecture/README.md` —— 数据流与类型契约
- ✅ **真实产品数据到位**：`assets/`（72 MB / 2810 文件）—— **1349 型号 /
  3485 变体 / 2757 张图**，含真实 PCD / ET / CB / 尺寸
- ✅ **文案底座到位**：中英内容语料库 43 KB（162 条术语 + 60 词汇 + 40 文案句）
- ✅ **技能库到位**：`SKILLS/` 20 个技能（含 `skills-lock.json` 来源记录）
- ✅ **门禁实测通过**：`typecheck` / `lint` / `build` 三绿
  （已把 `SKILLS/` `assets/` `resources/` 加入 eslint ignore —— 它们是第三方
  资产与只读数据，不是我们的源码）

### 2026-10-01 新增（本日 · 按类别）

**① 文档层（本日最大结构变化）**
- ✅ **`DESIGN.md` 设计正本**（项目根）—— 从已跑起来的页面上**反推好设计**，
  性质是**沉淀，不是禁令清单**。含 **§0.5 视口驱动设计（全站第一原则）**、
  §1 视觉基调（深色 = 页首专用 / `forge-soft` 是段级 token / `.eyebrow` 是
  受控词汇表 / fail-visible 三层保护）、§3 CTA 四级体系、
  §6 **已知裂缝 6 处**（记录，不擅自改）。见 `DEC-019` `DEC-020`
- ✅ **`PAGE-SPECS/` 页面施工图模块** —— 按路由命名，说「照着搭什么」。
  实测目录内 **22 个文件**（3 份公共文件 + `index.md` 总表 + 18 份页面规格）。
  `_components.md` 收录现有组件 + 全部设计 token + **图片资产真相**；
  `_viewport-audit.md` 是视口合规审查报告（83 个视口 / 24 条合并建议）。见 `DEC-015`
- ✅ **`ARCHITECTURE/page-architecture/` 三条非轮毂产品线页面架构**：
  `ev-components-page.md` / `custom-aluminum-page.md` / `safety-tires-page.md`
  —— 这三页**没有竞品底本**（竞品是纯轮毂公司），结构刻意不同。见 `DEC-016` `DEC-017`

**② 代码层：三个新库 + 第一个 API 路由**
- ✅ **`src/lib/wordpress/`**（`types` / `client` / `index`）—— Headless WP
  读取层，`mode: "mock"`；**切 live 只改一个文件**（`client.ts`）
- ✅ **`src/lib/inquiry/`**（`types` / `store` / `mailer` / `validate` / `index`）
  —— 询盘域，三条纪律：**先落库再发信** / **存快照不存引用** / **上下文随询盘走**
- ✅ **`src/lib/i18n/`**（`types` / `dictionaries/{en,zh,index}` / `index` / `use-t`）
  —— 中英双语层。**关键结构约束**：`index.ts` 用 `next/headers`（服务端专用），
  `use-t.ts` 只能从 `dictionaries/index.ts` 导入
- ✅ **`src/app/api/inquiries/route.ts`** —— 本项目**第一个 API 路由**，
  实测 POST 返回 **201**、校验失败返回 **422**
- ✅ **`src/components/` 新组件**：`home/hero/`（`home-hero` / `hero-background` /
  `hero-product-card` / `hero-product-grid`）、`language-switcher`、
  `quote-context-bar`、`sections/page-hero`，以及三条能力线共用的
  `part-group-cards` / `boundary-table` / `param-table` / `mechanism-steps` /
  `input-type-cards` / `process-diagram` / `faq-accordion` / `route-block` /
  `data-notice` 等

**③ 页面路由（实测 26 → 33 个 `page.tsx`）**
- ✅ 三条非轮毂产品线：`/products/ev-components`、`/products/custom-aluminum`、
  `/products/safety-tires`
- ✅ `/capabilities` —— 由 `/manufacturing` **改名**，旧路由保留并 **307 重定向**
- ✅ `/custom-development`、`/request-a-quote`、`/thank-you`

**④ ★ 首页 Hero 结构重构**
- ✅ **Hero 拆分**：品牌独占一屏（回答「我们是谁」），四张产品卡**移出**成为
  独立视口。原因：**Hero 里 7 个出口挤一屏**（4 卡 + 2 CTA + 导航），
  上限是 1+2=3。见 `DEC-022`
- ✅ **`ProductShowcase` 改造**：原「三宫格锻造轮毂」（**竞品切法**）→
  **四条产品线**，首页不再自相矛盾
- ✅ 新增 token **`--fh-hero`（`#05070a`）** —— 收编长期未 token 化的第 4 阶深色
- ⚠️ 首页现结构：`HomeHero`（我们是谁）→ `TrustStrip` → `ProductShowcase`
  → `GalleryBand` → `DealerCta`。**后三段尚未按视口原则复核**（见 In Progress）

**⑤ 图片资产真相更正**
- ✅ **`image-registry.json` 的 253 条全部指向 `assets/image/...`，该目录不存在**
  → 全数标记 `no-asset`；索引从此**只作线索，不作依据**。见 `DEC-018`
- ✅ 新建 **`assets/site-data/asset-manifest.json`** —— 按**实际文件扫描**生成，
  实测 **2772 条**（2757 轮毂图 + 15 preview-media）
- ✅ 5 个 jpg/png 移入 `assets/_non-webp-archive/`（站点**只留 webp**）
- ✅ 新增图片落地 `public/images/`：`hero/`（3 张汽车背景）、`cards/`
  （4 张产品线卡）、`wheels/`（2757）、`preview/`（15）

**⑥ i18n**
- ✅ 语言切换用 **cookie（`fh-locale`）**，**不是 `[locale]` 路由段**
- ⚠️ **代价：中英文没有独立 URL，SEO 上不利于双语收录** —— 已知取舍
- ✅ header 的 `Request Quote` 走 i18n 并改指 `/request-a-quote`
- ✅ footer 从「竞品三分类（Monoblock / Two-Piece / Off-Road）」改为
  **四条产品线**；`site.name` 从 `"Fenghuai Forged Wheels"` 改为 `"Fenghuai"`

## In Progress

三项，皆因 `DESIGN.md §0.5` 确立后浮出：

1. **首页后三段视口复核** —— `TrustStrip` / `GalleryBand` / `DealerCta` 尚未
   按「一视口一核心问题 + 合并或删除律」复核；Hero 已改，其余三段待议。
2. **`primaryNav` 对齐** —— header 下拉仍是旧结构（Products 下拉还是
   `All Wheels / Monoblock / Two-Piece / Off-Road`，**没有三条能力线**）；
   **footer 已改而 header 未改，两边不一致**（详见 Blockers）。
3. **`PAGE-SPECS/` 轴心改造** —— `DESIGN.md §0.5.6` 已声明规格轴心应改为
   **「视口 → 段 → 组件 → 内容」**，但 PAGE-SPECS 现有规格仍是
   「第 N 段」写法，**文档与规格当前不一致**，需改造。

## Next Actions

按优先级排序。

0. **★ 补 `WheelSku` 规格字段（P0，一切的前置，仍未动）** —— 实测 `types.ts` 的
   `WheelSku` **没有** size / pcd / offset / centerBore / process / variant。
   **资产层比类型层更完整** —— 真实数据有，类型接不住。
   不补这一步，1349 个型号无法进 SKU 页、无法做筛选、询盘无法带规格快照。
   见 `ARCHITECTURE.md` §4.3。
0b. **★ 三个竞品结构性缺口要补（P0，都是竞品没有的）** ——
   `content-design-and-new-pages.md` §2.2 表 B：
   - **N2** `/products/wheels/[model]` **单品页 × 1018** —— 竞品把整个目录压一页，**没有单品页**
   - **N3** `/request-a-quote` **独立询盘页** —— ✅ **已建**（本日）
   - **N4** `/thank-you` **提交成功页** —— ✅ **已建**（本日）

1. **完成 In Progress 三项** —— 首页后三段视口复核 → `primaryNav` 对齐 →
   `PAGE-SPECS/` 轴心改造（前一项的结论决定后一项怎么写）。**优先级最高的
   是 `primaryNav` 对齐**：它是**已上线的不一致**，而另两项是文档一致性。
2. **前端业务改造（P0，未完成）** —— 竞品品牌痕迹已清，但
   **信息架构仍未重建为四条平行产品线**：`src/content/products.ts` 的
   `productFamilies` **仍是 3 个虚构系列**（`monoblock` / `two-piece` / `off-road`），
   `/products/[slug]` 仍按它们出页。见 `ARCHITECTURE.md` §6.2。
   技能用 `SKILLS/redesign-existing-projects`。
3. **OpenNext 落地** —— 选平台（Cloudflare Workers / AWS Lambda / 自托管）→
   装依赖 → 改配置 → 重做 `Dockerfile` / `docker-compose.yml`（现在还是克隆
   模板默认值）→ 跑通部署
4. **内容层接 WordPress** —— `src/content/*.ts` → REST API fetcher
   （`src/lib/wordpress/` 已就位，等切 `mode: "live"`）
5. **`PLACEHOLDER` 清查**：实测 `src/content/` 共 **98 处**（`legal.ts` 占 48 处）
6. **询盘系统实装**：API 路由已可跑（mock），待接真实 DB + Resend

## Blockers

| 阻塞 | 影响 |
|---|---|
| **`primaryNav` 仍是旧结构** | header 与 footer 不一致；用户看到的产品入口仍是竞品三分类 |
| **三条非轮毂线大量数据待丰怀确认** | EV 的 IATF 16949 认证 / 铝制品的「不做清单」/ 轮胎的品牌归属 |
| **安全轮胎页品牌归属未定**（「洛克 LOAKE」「航鹏」是第三方品牌） | **归属确认前该页不上线**（`DEC-017`） |
| **`suitableVehicles` 全空**（0 / 1349） | **车型适配页无数据可发布**，`/fitment/*` 只能保持待确认态 |
| 四条产品线中 **三条无图** | 产品中心那三条线只能先出能力页 |
| OpenNext 平台未定 | 部署与询盘运行时 |

**已大幅缓解**：资产到位后，「没有丰怀数据」这个阻塞基本解除 ——
**轮毂这条线是全站数据最完整的一条**（1349 型号 / 2757 图 / 完整规格，随时可开工）。

## Open Questions

**✅ 已答（本日新增）**：
- ~~设计规范该是「规范」还是「沉淀」？~~ → **沉淀**。从已跑页面反推，不建禁令清单（`DEC-019`）
- ~~首页 Hero 里能放几个出口？~~ → **上限 3**（1 主行动 + 2 次行动）；品牌与产品线必须分属两个视口（`DEC-022`）
- ~~图片索引可信吗？~~ → **不可信**。`image-registry.json` 的 253 条指向不存在的目录，改以实体文件为准（`DEC-018`）

**✅ 更早已答**：
- ~~丰怀的真实产品线是什么？~~ → **四条平行线**：轮毂 / EV三电壳体 / 铝制品定制 / 自修复安全轮胎
- ~~规格字段有无真实数据？~~ → **有，且完整**。1349 型号 3485 变体带 PCD/ET/CB/尺寸

**⏳ 待答**：

| # | 问题 | 影响 |
|---|---|---|
| 1 | **OpenNext 落到哪个平台？**（Cloudflare Workers / AWS Lambda / 自托管 Node） | 决定部署配置形状与询盘运行时 |
| 2 | `sizeCategory` 里的 `17寸-3`/`18寸-2` 是**真实尺寸**还是**源分册名**？ | 轮毂筛选器设计 —— 见 `ARCHITECTURE.md` §3.2 |
| 3 | `styleName` 缺失的 **587 个**型号如何归类？ | 设计系列页（只有 762 有分类） |
| 4 | `suitableVehicles` 全空 —— 工程能否补齐？ | 车型适配页能否上线 |
| 5 | `process` 未标注的 **837 个**能否从其他字段推断？ | 工艺筛选（只有 512 有标注） |
| 6 | 语料库里「**航鹏**」「**洛克**」是第三方品牌 —— 内容可否用于本站？ | 文案可用范围（法务，关联 `DEC-017`） |
| 7 | 四条线中三条无图，何时提供资产？ | 产品中心三条线能否完整上线 |
| 8 | 「无头 WordPress」由谁托管？ | 整个内容层的前提 |
| 9 | i18n 是否要从 cookie 迁到 `[locale]` 路由段？ | **SEO 双语收录**（cookie 方案没有独立 URL，见本日 i18n 条目） |

## Recent Changes

- **2026-10-01（本日）** — **详见 `CHANGELOG.md` `[0.1.0]`**。要点：
  - **文档三层建立**：`DESIGN.md`（设计正本，含 §0.5 视口驱动设计 =
    全站第一原则）、`PAGE-SPECS/`（21 份施工图 + 3 份公共文件）、
    `ARCHITECTURE/page-architecture/` 三条非轮毂产品线
  - **代码三层新增**：`src/lib/{wordpress,inquiry,i18n}` +
    `src/app/api/inquiries/route.ts`（第一个 API 路由）
  - **页面 26 → 33**：三条产品线 + `/capabilities`（改自 `/manufacturing`，
    307 重定向）+ `/custom-development` / `/request-a-quote` / `/thank-you`
  - **首页 Hero 拆分**：品牌独占一屏，产品卡移出；`ProductShowcase` 改四条线
  - **图片资产更正**：`image-registry` 253 条全指向不存在的目录 → 改以
    `asset-manifest.json`（实测 2772 条）为准（`DEC-018`）
  - 新增决策 **`DEC-015` ~ `DEC-022`** 共 8 条
- **2026-10-01 17:10** — **资产与技能到位，建立架构规范**：
  详见 `CHANGELOG.md` 之上一条记录与 `ARCHITECTURE.md`。
- **2026-10-01** — **纠正项目状态的过度表述**：此前文档把前端描述为「结构
  完整原型」，未说明它是竞品克隆。现已更正为「三层都还没做完」，并新增
  **DEC-009（OpenNext）** 与 **DEC-010（克隆来源与合规边界）** 两条决策。

## Notes on the repository state

- **实际技术栈的现状（实测，别信推测）**：
  - `package.json` 依赖只有 10 个（base-ui / cva / clsx / lucide / next /
    react / react-dom / shadcn / tailwind-merge / tw-animate-css）
  - **无任何 `@opennextjs/*`、无 `wrangler`、无 DB/邮件依赖**
  - `next.config.ts` = `output: "standalone"`
  - `docker-compose.yml` / `Dockerfile` = **克隆模板默认值**
    （镜像名 `ai-website-cloner:latest`，Node 24.14.1-slim）
  - `src/app/api/` **已存在**（`inquiries/route.ts`，本日建立）
- **本仓库还不是 git 仓库。** 根目录无 `.git`（实测 `git rev-parse` 报错）。
- **`README.md` 已改写**为本项目自己的文本（不再是克隆模板遗留）；
  `CONTRIBUTING.md` 仍待整理。
- **`docs/` 早于项目规范存在**，不被本规范重构。技术文档归 `docs/`，
  项目档案归根目录四个文件。
