# 项目状态

## 2026-10-12 询盘无隐私勾选门槛与 QQ SMTP 端到端验证完成

- `/request-a-quote` 已移除隐私勾选和“隐私未批准导致表单关闭”的业务门槛；页面保留隐私说明入口，但可以直接填写并提交项目询盘。
- 本地与 9080 远程 WordPress MU 插件均已同步：`privacyConsent`、`privacyVersion`、`consentedAt` 为兼容字段，不再是必填；数据库保存成功仍是客户看到成功页的最低标准。
- 本地无隐私字段 POST 已返回 `201` 并成功落库；本地 SMTP 配置无法连接，因此只验证到 Outbox 保存，未把本地失败误报为客户询盘失败。
- 9080 Playwright CLI 最终验收：无关闭提示、无隐私 checkbox、页面表单存在、控制台 0 错误；真实 UI 提交返回 `201` 并进入 `/zh/thank-you`。
- 远程最近验收记录 `INQ-20261012-0013`：WordPress/MySQL 记录存在，Outbox `accepted`，尝试 1 次，`last_error` 为 `NULL`，说明 QQ SMTP 服务端已接受通知消息。当前工具无法直接读取 QQ 收件箱，因此收件箱可见性仍需人工打开 QQ 邮箱确认。
- 9080 当前前端镜像为 `fenghuai-frontend-9080:consentless-20261012-final2-amd64`，容器健康；镜像压缩包 SHA-256：`47d09559e43401656f7cba9a4c05bd6c277e29280670ba8ee7a11491bace3bac`。
- 本轮门禁：`npm test` 42/42、`npm run lint`、`npm run typecheck`、`npm run build` 通过；最终远程 Playwright 页面控制台 0 错误。
- 正式上线前剩余事项：把测试/过渡隐私页面替换为业务/法务确认的正式版本，人工核验 QQ 收件箱显示，并按正式域名重新构建与核对 canonical、sitemap、robots 和 SMTP 收件人配置。

## 2026-10-12 预发布询盘已开放并完成本地/远程端到端验收

- 用户要求为测试开放询盘后，本地与远程 WordPress 均写入明确标注为
  `staging-test-2026-10-12` 的测试隐私版本；四语均为 `approved`，但该版本只代表
  预发布功能测试，不代表正式法律隐私政策。
- 9080 远程 Playwright CLI 实测：`/zh/request-a-quote?product_line=wheels` 从第 1 步进入第 2 步，填写姓名、邮箱、国家并勾选测试声明后，`POST /api/inquiries` 返回 `201 Created`，进入确认页，控制台错误 0。
- 本地 `127.0.0.1:3200` 同样完成真实 UI 提交：`POST /api/inquiries` 返回 `201 Created`，确认页加载成功，控制台错误 0。
- MySQL / WordPress 核验：本地 `fh_inquiry` 1 条、Outbox 1 条且为 `accepted`；远程 `fh_inquiry` 9 条、Outbox 9 条且全部为 `accepted`，最近记录无 `last_error`。成功最低标准继续执行 DEC-092：必须先落库再显示成功。
- 询盘页面缓存失效已补齐：隐私 Page 更新时同时刷新 `/support/privacy`、`/request-a-quote`、`/contact` 和 sitemap，避免隐私版本已更新但转化页仍显示旧关闭状态。
- 本轮门禁：`npm test` 42/42、`npm run lint`、`npm run typecheck`、`npm run build` 全部通过；远程镜像已包含本轮前端修复。远程轮毂目录图片此前已实测 25/25 加载、0 破图。
- 重要边界：本地与远程并非整库镜像。询盘数据保留各自环境，不能用本地 dump 覆盖远程；远程仍只有已迁移的转化页和历史测试询盘，其余 WordPress Page 需另行迁移。

## 2026-10-12 远程媒体图片故障已定位，询盘页同步已核验

- 9080 轮毂目录旧镜像的 WordPress 图片直链抽样均为 200，但 Next.js `/_next/image` 因公网 WordPress 媒体源未进入 `images.remotePatterns` 返回 400；Playwright 实测第 2 页 25 张图仅 1 张加载成功。
- 本地与远程 WordPress 的 `request-a-quote`、`contact` 四语正文、SEO 和批准状态逐字段一致；本地与远程 8 条询盘/联系路径的渲染正文哈希全部一致。隐私未批准导致表单关闭是预期门禁，不是同步故障。
- 已在 `next.config.ts`、前端 Docker 构建参数和部署说明中增加 `WP_PUBLIC_API_URL`，明确区分内部 CMS 地址和公网媒体地址。lint、typecheck、npm test 42/42、生产构建均通过；远程全量镜像发布待本轮提交后执行。
- 证据报告：`outputs/reports/38-remote-wordpress-media-optimizer-2026-10-12.md`。当前工作仍在 `work/active/`，远程图片修复未完成前不标记完成。

## 2026-10-12 当前全量快照已推送并部署到 9080 预发布

- 发布分支为 `codex/full-site-current-20261012`，最新提交 `d98bbd1`；基础全量快照 `d91d8ae` 已推送到远端仓库。当前工作树干净。
- 本地门禁：`npm run lint`、`npm run typecheck`、`npm test` 42/42、生产构建通过；Playwright CLI 全量 **131 passed / 1 skipped / 0 failed**。跳过项是明确要求真实 WordPress 权限的只读用例，默认 mock 模式下不执行真实写入。
- 前端镜像 `fenghuai-frontend-9080:d91d8ae` 已在本机构建为 `linux/amd64`，镜像摘要为 `sha256:88764fad0b1b0113483b203af39adcf35cb19aac41eb19b7bdf24243ace671ec`；远端容器健康，9080 的 robots、sitemap、四语路由均通过 HTTP 冒烟。
- 远端 WordPress 已加载 Pages 接缝与受控运行时 seeder；`request-a-quote` 页面 ID 1262、`contact` 页面 ID 1263，四语业务内容均为 `approved`，单页 API 返回 `authoritative: true`。全量页面接管开关仍未打开，避免未迁移页面被误宣称为 CMS 权威。
- 远端备份位于 `/opt/fenghuai-backups/20261012-162734`，包含数据库 dump、compose、配置和 mu-plugin 压缩包。公开 9080 仍保持 `noindex, nofollow`；隐私版本未批准，询盘表单保持关闭，未发送真实邮件。
- 下一步：轮毂目录 `/products/wheels` 的页面/筛选/排序/空态/分页 UI 四语化；之后处理其余业务 Page、文章、媒体与错误码。隐私法务审核、正式域名 SEO、真实 SMTP 投递和生产发布仍是独立门槛。

## 2026-10-12 四语全文实施中：轮毂详情切片已验，整站未通过

- `/products/wheels/[model]` 的页面说明、配置选择、直接询盘、相关卡片、SEO
  文案新增 `en/zh/es/th` 本地语言副本；规格代码和数值不翻译。询盘表单的
  标签、准备提示和清单反馈已接语言，`contact` 入口也改为读取 WordPress
  隐私版本；明确的空版本不再被环境变量兜底打开。
- 本地 WordPress 只读审计：15 条 Page 正本 + 缺失的 `request-a-quote`、
  `privacy`，共 17 个必查键 × 4 语言，**46 组缺失或未批准**；`es/th`
  目前没有任何已批准 Page 正文，不能宣称全站四语完成。`/es/contact`、
  `/es/request-a-quote` 的标题/正文仍回落英文。`zh/es/th` 继续 noindex。
- 已通过：`npm test` 42/42、`npm run typecheck`、`npm run lint`、
  `npm run build`；最新表单接线后复跑生产构建隔离端口的 Playwright
  轮毂详情测试 4/4。另以隔离端口模拟 WordPress 不可达且环境变量含隐私版本，
  Playwright CLI 确认 `/zh/contact` 仍显示“项目询盘暂未开放”。
  全站四语人工/浏览器验收仍未完成。
- 下一步：按 `outputs/reports/36-sitewide-multilingual-text-coverage-2026-10-12.md`
  的路由矩阵补齐 WordPress 正文、SEO/媒体和界面字典；法律/工程译文仍需
  法务与业务审核。当前任务留在 `work/active/`，**不得标记全站验收完成**。

## 2026-10-11 四个 A 类页中文落地 + 修掉一个全站性图注缺陷

`capabilities` / `ev-components` / `custom-aluminum` / `safety-tires` 四页补齐 zh 正文：
`translations_zh.py` 词表增至 **7 页**，WP posts 1313/1315/1316/1317 均写入
`locale_status {en:approved, zh:approved}`。实测 4 条 `/zh` 路由全部渲染中文，英文侧未变。

**🔴🔴 顺带挖出并修掉一个影响全站多语言的既存缺陷**：

`/zh/products/safety-tires` 正文已全中文，**但图片说明仍全是英文**。逐层排查确认
WP 载荷里的 zh caption **是中文**，问题在渲染层 —— `src/lib/wordpress/media.ts` 的
media 合并**让媒体库优先于内容载荷**：

```ts
caption: stripHtml(wordpressMedia.caption.rendered) || media.caption,   // ❌ 媒体库优先
```

但媒体库（`wp/v2/media`）的 `alt_text`/`caption` 是**英文单语资源、无 locale 分版**，
而载荷里的 `alt`/`caption` 才是按语言翻译好的 → **任何非英文页面都被强制回落英文图注**。

**实测影响面**：四页共 **36 条图注**全中（capabilities 12 / ev-components 4 / custom-aluminum 3 / safety-tires 17），
且属**先于本轮的既存缺陷**（about / product-lines 同样中招，只是上一轮没扫到 caption 这一层）。

**修法**：反转优先级（载荷优先、媒体库兜底），`src` 仍取媒体库。
**已验证 en 零回归** —— 实测 `content_by_locale.en` 的 caption 与媒体库逐字一致，
故英文侧两种优先级结果相同；`/products/safety-tires` 的 caption/alt 实测未变。

**收尾扫描**：4 条 zh 路由的渲染后 HTML 剩余拉丁文本**全部为结构/技术 token**
（品牌名、语言切换器、区块 ID `WM01`/`EV02`、工艺缩写 `CNC`/`HPDC`、锚点 slug），
无真实文案缺口。

📌 **重要结论**：「生成器报 0 untranslated」**不等于**「渲染无英文」——
生成器测的是「载荷是否漏译」，渲染扫描测的是「页面是否漏译」，**两者必须都做**（本轮正是靠后者才发现）。

门禁：`npm test` 42/42 ｜ typecheck ｜ lint 0/0 ｜ build 全绿 ｜ 无 commit。
任务见 `work/active/2026-10-11-four-a-type-pages-zh.md`。

## 2026-10-11 /products 收尾：硬编码字面量 + DealerCta 全站字典化

`/products` 的 WP 业务正文已中文化，但页面自身的 JSX 字面量与共享组件 `DealerCta` 仍是英文。

**做法（与既有架构一致）**：这些是 **UI chrome 不是 CMS 内容** → 走 `src/lib/i18n/dictionaries/*`（四语言），
**不塞进 WordPress**（否则运营会在后台看到一堆不该编辑的界面标签）。

**改动**：字典各 **+12 键**（60 → 72）；`/products` 10 处字面量改 `t()`；
`DealerCta` 改 `async` + 默认值走 `t()`（**props 覆盖能力保留**，`custom-development` / `private-label` 仍用自己的文案）。

**🔴 复核抓到子 agent 漏掉的一处**：它只 grep 了 `products/page.tsx`，**没跟着组件树下钻** →
漏掉 `family-card.tsx:98` 的卡片脚注 `Explore`（四张产品线卡片各一处）。我扫渲染后的 HTML 才发现并补修。

**实测**：`/zh/products` 现在**全中文**，剩余拉丁文本只有 `Fenghuai`（品牌）与 `English`/`Español`（语言切换器）——
均属正确。`/products` 零中文泄漏。**全站 DealerCta** 在 `/zh/insights` `/zh/tools` `/zh/fitment`
`/zh/gallery/finishes` `/zh/dealers` **五页全部中文**。**四语言字典键集合一致性断言 PASS（各 72 键）**。

门禁：`npm test` 42/42 ｜ typecheck ｜ lint 0/0 ｜ build 全绿 ｜ 无 commit。

📌 **纪律**：验证「页面是否全中文」**必须扫渲染后的 HTML**，不能只看页面文件本身 —— 组件树的字面量不在页面文件里。

任务见 `work/active/2026-10-11-products-hardcoded-and-dealercta-i18n.md`。

## 2026-10-11 混合页改造：/products 的 86% 本地区块已搬进 WordPress（方案 A）

`/products` 是唯一混合页（卡片来自 WP，其余 86% 来自 `src/content/products.ts` + `faq.ts`），
导致 `/zh/products` 是半中文页（卡片中文、H1 仍 `Four product lines`）。本轮按方案 A 改造。

**核心简化**：实测 **WP 对 `content` 字段是自由 JSON 透传、无 schema 校验** → **插件一行未改**，
只改 Next 侧类型/守卫/接线 + 重新 seed。

**改动**：`content` 从裸数组改为 `{ lines, catalogue }` 包装对象；新增 `getProductLinesContent()`，
`getProductLines()` 保留为薄封装；页面重接 18 处引用；zh 词表 16 → 62 条。

**实测**：`/products` H1 = `Four product lines` ｜ **`/zh/products` H1 = `四条产品线`** ｜
七块全部中文 ｜ es/th 回落且日志留痕 ｜ 四张卡片 zh 未回归 ｜ CJK 计数 zh 1836 / en 6（后者全是语言下拉选项）。
门禁：`npm test` 42/42、typecheck、lint 0/0、build 全绿。

**🔴 关键发现（原计划漏了）**：英文有**独立的「正本」meta `fh_content_json`**，
而 `normalizeWordpressPage` 对 `en` 读的是它、**不是** `content_by_locale.en`
（`pages-contract.ts:78-80`）→ **只写 `content_by_locale` 会让 en 侧静默回落**（页面照 200，肉眼难发现）。
seeder 已两份都写。**凡迁移形状必须正本 + by_locale 两份同时写。**

**仍未翻译（范围外）**：`/zh/products` 还有 **8 处页面自身的硬编码 JSX 字面量**
（`Four lines, one factory` / `Keep exploring` / `Related resources` / `Ordering questions, answered` 等）
+ `DealerCta`（共享组件，按计划另切片）。盘点文档里估的「5 处」是下限，本页实测 8 处。

任务见 `work/active/2026-10-11-product-lines-catalogue-in-wp.md`。

## 2026-10-11 多语言正文：第二个页面（/about）落地 + 修掉一个真缺陷

承接同日「多语言正文链路打通」。本轮两件事：

**① 修掉 `safety-tires.ts` 的真实缺陷**（第一刀只标记未修）
五个 viewport 从**本地英文常量**取数而不是 WP 解析后的 `source`：
`painPoint: resolveViewport(selfSealingTirePage.painPoint)` → 应为 `source.painPoint`。
后果是即使 WordPress 返回了已批准译文，这五个视口仍渲染英文正本。
**全仓扫描确认是孤例**：`about` / `wheel-capabilities` / `custom-aluminum` / `ev-components`
四个 resolver 都正确使用 `source.*`。

**② `/zh/about` 中文已落地**
生成器重构为**页面无关**（词表拆到 `scripts/i18n/translations_zh.py`，按 page key 分组）。
`about` 全字段覆盖，未翻译叶子 **0**；已 seed 进 WP（post 1312），
`locale_status: {en: approved, zh: approved}`。

**实测矩阵**：`/zh` → 中文 ｜ `/zh/about` → 中文 ｜ `/` `/about` → 英文 ｜
`/es` `/th` 两页 → 英文回落**并留痕** ｜ `zh` 的 fallback 日志计数 **0**（有译文就不回落）。
`en/about` 的 6 个 CJK 字符已逐一定位 = 语言下拉里的「中文」选项（预期，非泄漏）。

**🔴 本轮最重要发现：Next 16 的 data cache 删目录清不掉**
seed 后 `/zh/about` 仍渲染英文且持续打 fallback 日志，而同一 REST 端点 curl 返回 `zh: approved`。
逐层排查（复现契约逻辑 → 契约层诊断 → fetch 层探针**从未触发**）定位为
**响应来自进程内存缓存**：`rm -rf .next/cache/fetch-cache` 无效，
**必须 `kill` + `rm -rf .next` + 重启** 才生效。
📌 纪律：改 WP 内容后验证，标准动作 = 杀进程 → 删 `.next` → 重启，否则会把「缓存未失效」
误判成「代码有 bug」。

**门禁**：`npm test` 42/42 ｜ typecheck exit 0 ｜ lint 0/0 ｜ build exit 0 ｜ 无 commit。
任务见 `work/active/2026-10-11-i18n-content-seam-wiring.md`。

## 2026-10-11 多语言正文链路打通（预览版口径：功能优先）

用户指令：「正文一定要多语言模式执行好；现在是预览版本，先把功能实现，再考虑权限问题」。

此前只有站点 chrome（Header/Footer）做了多语言，**页面正文始终渲染英文**，无论 `/zh`、`/es`、`/th`。
根因是三层：`src/content/*.ts`（38 模块 / 77k 行）无 locale 维度；WP 适配器有 `locale` 参数但
**调用方从不传**；非 en 回落**静默**无痕。

本轮完成：

- **`resolveLocalized()`（新增 `src/lib/i18n/localized-page.ts`）**：把英文回落从静默改成
  服务端留痕 `[i18n] fallback locale=<x> scope=<y> reason=no-approved-translation`；`en` 是严格 no-op；
- **10 处适配器调用点全部传 locale**，含诊断阶段**遗漏的 2 处**——`src/app/page.tsx` 与
  `src/app/about/page.tsx` 在 `generateMetadata()` 里直接调适配器、绕过 resolver，只修 7 个 resolver
  会让每个本地化 URL 吐英文 SEO；
- **Insights 列表/详情页补 locale**（此前连 `getLocale` 都没导入）；
- **WP 侧填入 home 中文正文并验证**：新增 `scripts/i18n/make-locale-content.py`（从 en 结构派生
  **同构**中文 JSON，硬校验形状一致）+ `seed-locale-content.php`（合并写入、不覆盖其他语言）。

验收证据：`curl /zh` → `<h1>以专业制造能力支撑的汽车部件`；`curl /` → 英文（零回归）；
`/es` `/th` 回落英文并留痕；中文零泄漏进 en 页；`npm test` 42/42、typecheck / lint 全绿。

**撤回门实测是双层的**：WordPress 插件 `fenghuai-pages.php:104` 先把非 `approved` 语言从公开 payload
剔除，Next `pages-contract.ts:81` 再判一次 → 任一层都能独立阻断，比设计预期更稳。

**未做（刻意）**：`INDEXABLE_LOCALES` 仍为 `["en"]`，noindex / hreflang / sitemap 门槛未动；其余
6 个 WP 页面与 26 个非 WP 页面（正文在 `src/content/*.ts`）尚未接 locale。任务见
`work/active/2026-10-11-i18n-content-seam-wiring.md`。

## 2026-10-11 最新结论：Astryx P0–P5 本地验收完成，商用发布仍 No-Go

全站暖白 Neutral 主题及选择性 Astryx 交互原语已按页面族迁移；用户不需要的全站浮动 Request Quote 已移除，桌面／移动导航、Footer、产品直接询盘和总询盘路径保留。31 个渲染模板在 320／390／768／1440 四视口均通过首屏截图、单一 main、h1、主题、溢出、键盘和 axe 基础检查；四语言各模板路径与 noindex 门槛已核。隔离 `WP_MODE=mock` 的完整 Playwright **116/116**，`npm run check` **42/42 单测、lint、typecheck、191 页构建**与 `git diff --check` 通过。首页语言链接与 RSC 预取循环也已修复并回归。P0–P5 与全站迁移任务已归档到 `work/completed/`；最终报告：[`33-astryx-p5-final-commercial-seo-handoff-2026-10-11.md`](outputs/reports/33-astryx-p5-final-commercial-seo-handoff-2026-10-11.md)。

**当前重点**是 `work/queued/2026-10-08-commercial-launch-remediation.md`：先取得公司／首批产品／图权／法务批准，再建立 OpenNext 隔离预发布、真实落库与 Outbox 监控恢复，随后逐页审批英文内容和正式域名 SEO，最后做真机、性能、恢复和回滚 UAT。正式域名、索引与真实邮件仍未获放行；本地 P5 通过不等于可商用上线。未提交、推送、部署或向真实邮箱发信。

下方 2026-10-11 的“进行中／排队／下一步先做 P0”均为当时阶段记录，不再代表当前状态；请以上述最新结论和 33 号报告为准。

## 2026-10-11 Astryx P5 阶段记录（历史，已由上文取代）

P5 阶段性成果：**整套 E2E 从 3 failed 修到 84 passed / 0 failed**，并挖出三个真缺陷。
**总任务未收口**，不移入 `work/completed/`。报告：
[`outputs/reports/32-astryx-p5-regression-closure-alma-2026-10-11.md`](outputs/reports/32-astryx-p5-regression-closure-alma-2026-10-11.md)。

⚠️ **默认 E2E 端口 3100 被另一个项目占用**（实测返回蓝辉的 title）→ 按 `playwright.config.ts` 自身注释，
复用他人服务会「静默跑在错误的站上」→ 本轮改用隔离 `PLAYWRIGHT_PORT=3214` + `WP_MODE=mock`。

### 修掉的三个真缺陷

1. **询盘 422 服务端消息被客户端文案覆盖（P2 引入的回归）**
   `localizeServerErrors()` 无条件用通用文案覆盖服务端消息 → 「This address cannot receive replies.」
   被替换掉。修法：通用文案降级为**兜底**而非覆盖。→ 询盘全量 17 passed（成功判定保护用例未被破坏）。
2. **首页 `<h2>`/`<h3>` 继承浅色墨色 = 实测 1.06:1**（**正是 P1 那个 bug 类，首页仍在**，9 个标题）
   → 逐个显式 `text-white`，**未加全局覆盖**。
3. **深色表面强调色过暗**：`--fh-forge-bright: #c77c45` 在 hero 上仅 4.32:1 → **令牌改 `#cb8150`**（4.58/4.88）；
   证据卡计数器误用 `text-forge`（2.31:1）→ 改 `forge-bright`；Insights 标签 3.2:1 → 改 `text-white/75`。
   → `/` 与 `/insights` 对比度失败 **22/2 → 0/0**；`accessibility.spec.ts` **18 passed**。
4. 顺带修：首页卡片链接 `focus-visible:outline-none` 只换边框色（WCAG 2.4.7，HEAD 即存在）→ 补真实焦点环。

> ⚠️ **踩坑**：改 `globals.css` 令牌后页面仍显示旧色 —— Next dev 的 CSS 缓存要**整个删掉 `.next` 重启**才生效。

### A11y 子 agent 的采集**大部分不可用**（已复核更正）
`axe-results.json` 62 行中，`/fitment/bmw-m` 的 `html-has-lang`/`document-title`/`landmark-one-main`/
`page-has-heading-one` **经复核全是假阳性**（实测该页有 `<html lang="en">`、正确 `<title>`、`<main>`）——
根因是它采集期间服务器（:3210）未真正服务该路由。**该 JSON 保留为原始记录，不作结论引用。**

### 已实测的正面结论
弹窗焦点回触发器 ✅ ｜ 焦点陷阱 `shiftTabBack.escapes=0` ✅ ｜
**无 JS 目录筛选可提交**（`?q=dx` → 26→17）✅ ｜ **无 JS FAQ 全文在 DOM** ✅ ｜
7 个重定向：6×308 + 1×307（**刻意，未改动**）✅ ｜ 索引门：`en` 可索引、`zh/es/th` 全 `noindex, follow` ✅

### 门禁（全绿）
`npx playwright test` **84 passed / 0 failed** ｜ `theme:check` ok ｜ `npm test` **42/42** ｜
`lint` **0 error 0 warning** ｜ `typecheck` clean ｜ `build` exit 0 ｜ `git diff --check` clean

### **尚未完成（未收口）**
① 四语言**全站**回归 ｜② 键盘 **31 模板全序** ｜③ **全模板 axe**（子 agent 采集不可用，需重跑）｜
④ 31 模板 × 4 视口一次性全量 sweep ｜⑤ **收缩重复外壳/样式** ｜⑥ `DESIGN.md` 其余历史章节回写 ｜
⑦ Page SPEC 回写 ｜⑧ 总任务移入 `work/completed/`（**该目录尚不存在**）

本轮改动 6 个文件：`inquiry-form.tsx`、`home/project-route-section.tsx`、`insights/page.tsx`、
`globals.css`、`sections/product-showcase.tsx`、`eslint.config.mjs`。
**未 commit/push/deploy**（HEAD 仍 `338d228`）；未向真实 QQ SMTP 发信；全部 dev server 已停止。

## 2026-10-11 Astryx 产品链（P3）与内容/工具/政策链（P4）范围完成

### P4：消除 10 处手写首屏漂移 + 修掉一个真溢出

给共享 `src/components/sections/page-hero.tsx` **新增 `tone: "light" | "dark"`**，
把散落各页的深色/浅色首屏统一收进来，**净减 96 行**（10 files, +332/−428）。
之所以用 `tone` 而非全局改色：P1 实测 Astryx 生成主题按 **landmark 而非按表面**取 h1 墨色，
10 处手写首屏各自的渐变/alpha/clamp **逐个文件都在漂移**；收进来后**表面与文字颜色由 `tone` 一处决定**，
深色首屏也不必强改浅色（尊重 P1 保留的照片/工程语气带）。

🔴 **顺手修掉真缺陷**：`/support/returns` 在 320px 溢出 **33px**。真 Chrome 逐元素定位到
`legal-document.tsx:132` 的 `<aside>` —— CSS Grid 子项默认 `min-width:auto`，而 Astryx `Outline`
是**不换行的导航轨道**，不会收缩到内容宽度以下。补 `min-w-0` 后 **33px → 0px**，
并对 15 条 P4 路由 × 3 移动视口（45 组合）复扫**全部 0 溢出**。该缺陷早于 P4（Outline 迁移遗留），由 P4 扫描暴露。

**76 组合实测**（19 路由 × 4 视口，after 采集）：非 200 **0** ｜ 横向溢出 **0** ｜ 控制台错误 **0** ｜
缺 `data-astryx-theme="neutral"` **0**。四语言 16 组合**全部 200**。
KEEP 清单实测未破坏：FAQ 服务端全文 + 无 JS、Insights 分类非 tabs、长文锚点/无 JS 目录、偏距公式。
证据：[`outputs/reports/31-astryx-p4-content-evidence-alma-2026-10-11.md`](outputs/reports/31-astryx-p4-content-evidence-alma-2026-10-11.md)。

### P3：四条契约本来就对，本轮把它们变成回归资产

筛选 / 分页 / 上架门槛 / 同变体规格本来就被正确实现，**未改写**。净交付是新增
**`e2e/astryx-product.spec.ts`（23 条断言，23 passed / 0 failed）**，覆盖原生 GET 多值筛选、
真实 `<a href>` 分页、URL 可复制、320px Filter 入口、**无图型号不可公开**（真实反例）、
**同 productionCode 变体规格**、询盘绑定、四视口 0 控制台错误/0 溢出、SEO 完整，
以及**能力线首屏 h1 深度守护**（守住 P1 的 1.00–1.06:1 → 14+ 修复，后续切片弄不坏它）。

Astryx 候选探针结论 **1 可用 / 3 拒绝**：

| 候选 | 结论 | 依据 |
|---|---|---|
| `Table` | ❌ **拒绝** | **无 `caption` prop** —— 传 `caption="…"` 只落到 `<table>` 的**无效 HTML 属性**，**不产生 `<caption>` 元素**；项目 3 处 `<caption class="sr-only">` 会静默失去表格名称。0.6.7 的 SSR 路径另抛 React key 警告 |
| `ClickableCard` | ✅ 可用（Next Link 已验） | `LinkProvider` 下渲染 `<a href data-next-link="1">`，可爬取 + 走软导航 |
| `MetadataList` | ✅ 语义成立，**不采用** | 真实 `<dl>/<dt>/<dd>`；但 `columns="multi"` 引入 `Show more` 折叠，规格必须默认全可见 |
| `Card` | ✅ 服务端安全，**不采用** | 纯容器，替换产品卡外壳无净收益 |

证据：[`outputs/reports/30-astryx-p3-product-evidence-alma-2026-10-11.md`](outputs/reports/30-astryx-p3-product-evidence-alma-2026-10-11.md)。

门禁：`theme:check` ok ｜ `npm test` 42/42 ｜ `lint` 0 error ｜ `typecheck` clean ｜ `build` exit 0 ｜ `git diff --check` clean。
**无 commit/push/deploy**；未向真实 QQ SMTP 发信；临时探针脚本已清理。
P3/P4 任务**留在 `work/queued/`，不声明 completed**（须等 P5）。
剩余：P5 全站回归收口（四语言全站、键盘全序、axe、全模板族）。

## 2026-10-11 Astryx 询盘转化链（P2）范围完成

P2 已把**直接询盘**与**清单询盘**两条分叉路径收进同一个 `InquiryForm`（`mode: "direct" | "cart"`），
证据见 [`outputs/reports/29-astryx-p2-inquiry-evidence-alma-2026-10-11.md`](outputs/reports/29-astryx-p2-inquiry-evidence-alma-2026-10-11.md)
与[四态截图](outputs/reports/astryx-p2-evidence-2026-10-11/)。

**成功判定本来就是对的，本轮没有改它**：`ok && persisted === true` 才成功
（`inquiry-form.tsx:406-415` ← `api/inquiries/route.ts:151` ← `lib/inquiry/store.ts:312`），
**SMTP / Outbox 从未参与成功判定**。刻意未改 API 路由、store、schema 与 mailer 链路。

三处实测结论：
1. **隔离性成立** —— `clearInquiryCart()` 只在 `mode === "cart"` 且已进入成功分支后执行（`inquiry-form.tsx:412`）
   → **直接询盘失败永不触碰清单**；已捕获 `isolation/direct-fail-preserves-cart` 截图（320/768）。
2. **数量无 999 上限** —— `lib/inquiry/schema.ts:29-35` = `.int().min(1).refine(Number.isSafeInteger)`，`grep 999` 零命中。
3. **四态 × 双视口 18 组合**全部取证：Open / Validation(client+server-422) / Submitting / Success /
   Server Error(503) / isolation / focus-escape，**横向溢出全 0**；仅有的 2 类控制台错误是测试注入的 422/503（预期）。

改动：`src/components/inquiry-form.tsx`（−284/+390）、`src/content/inquiry-form.ts`（+20）；
**调用方零改动**（新 props 全可选）。测试用**隔离的 `127.0.0.1:3210` + `WP_MODE=mock`**，
未复用 3200 主服务器、**未向真实 QQ 邮箱发信**。
门禁：`theme:check` ok ｜ `npm test` 42/42 ｜ `lint` 0 error ｜ `typecheck` clean ｜ `build` exit 0 ｜ `git diff --check` clean。

P2 任务**留在 `work/queued/`，不声明 completed**（须等 P3–P5）。`/thank-you` 视觉未单独评审；
键盘全序、axe 扫描与四语言全站回归仍在 P5。

## 2026-10-11 Astryx 暖白首屏与共享外壳（P1）范围完成

P1 已逐页审计全部 39 个含 `bg-ink`/`bg-hero` 的文件，证据见
[`outputs/reports/28-astryx-p1-warm-hero-evidence-alma-2026-10-11.md`](outputs/reports/28-astryx-p1-warm-hero-evidence-alma-2026-10-11.md)
与[截图/采集](outputs/reports/astryx-p1-evidence-2026-10-11/)。

**交接估算的「约 21 个旧深色 Hero」实测不成立**：真正的旧深色页面首屏只有 **3 个**
（`/` 已暖白；`/about`、`/capabilities` 本轮迁移）；其余 36 个命中是共享控件的选中态、
`bg-ink/16` 发丝分隔线、以及首屏**以下**的深色对比段与图片底板，均按原样保留
（承载真实照片或工程语气，机械转白会破坏图文对比）。

**顺带挖出并修复一个既有 WCAG 缺陷**（交接与 P0 都未记录）：Astryx 生成主题的
`:where(h1…) { color: var(--color-text-primary) }`（`src/theme/fenghuai-neutral/site-theme.css:11-14`）
按 **landmark** 而非按**表面**取头条墨色。凡 `<h1>` 纯靠继承的深色首屏，会拿到浅色模式墨色 →
**实测 1.00–1.06:1 的不可读大标题**，**7 路由 × 4 视口全部命中**（WCAG 1.4.3 失败）。
修法是让这 7 个 `<h1>` **各自声明颜色**（暖白页 `text-ink`、保留深色页 `text-white`），
**未加全局 CSS 覆盖**（交接明确否决 `section#top` 探针）、未改 `@generated` 主题、未改 `--fh-*` 数值。

实测验：`/about`、`/capabilities` 改用共享 `PageHero`（暖白），保留深色的 5 个首屏
（三条其他能力线 + 旋压 + 锻造）只修墨色。**before → after 对比度：1.00–1.06:1 → 14.17–15.07:1**
（7 路由 × 4 视口 = 28 组合全部 AA 通过）；28 个 after 组合 0 溢出 / 0 控制台错误 / 0 非 200；
四语言 `/about` 全 200 且带 `data-astryx-theme="neutral"`；`<section id="top">`、`aria-labelledby`、
CTA 真实 `<a href>` 与查询参数全部保留。
门禁：`theme:check` ok ｜ `npm test` 42/42 ｜ `lint` clean ｜ `typecheck` clean ｜ `build` exit 0 ｜ `git diff --check` clean。

`DESIGN.md` 已补入本切片的实测结论。P1 任务**留在 `work/queued/`，不声明 completed**——
按完成条件须等 P2–P5；全站回归、询盘四态、键盘/axe 扫描与真实浏览器焦点验证仍在 P5。

## 2026-10-11 Astryx 组件兼容性基线与全站盘点（P0）完成

全站迁移第一项 P0 只读审计已完成，产出兼容性基线与四态矩阵，
报告见 [`outputs/reports/26-astryx-component-compatibility-matrix-alma-2026-10-11.md`](outputs/reports/26-astryx-component-compatibility-matrix-alma-2026-10-11.md)
与[探针证据](outputs/reports/27-astryx-probe-evidence-alma-2026-10-11.md)。
实测当前工作树 `find src/app -name page.tsx` = 38，其中纯重定向 7 个
（`/gallery`、`/gallery/wheels`、`/manufacturing`、`/resources`、`/resources/[slug]`、
`/resources/bolt-patterns`、`/resources/bolt-patterns/[pattern]`），故 **38 − 7 = 31 个渲染模板**，
全部登记归属；`products/wheels/[model]` 是渲染模板（仅在 slug 规范化时 308），不计入重定向。

以 `@astryxdesign/core@0.6.7` 做真实探针（`react-dom/server` 静态渲染 + `.d.ts` 逐 props +
:3200 运行中服务器的实际 HTML）：**Pagination** 的 `onChange` 必填且**无 `href`**，SSR 实测产出
`<button>` 无 `<a>`，故**保留原生链接分页**（可爬取 + 无 JS）；**CheckboxInput** 是受控单布尔，
而目录筛选实测为 **76 个原生同名多值 checkbox + `<form method="get">`**，故**保留原生多值筛选**；
**TopNav** 是扁平 strip、**MobileNav** 是单层 `dialog`，现有 Header 是多级 flyout，
故**保留项目 Header**；**Card** 无 `use client`（服务端安全）→ 已探针待验收；
**Table**、FAQ **Collapsible**、长文 **Markdown**、Insights 分类 **TabList** 均给出具体保留/不适用理由。
四态计数：已采用 15 / 已探针待验收 5 / 有理由保留 7 / 不适用 2。

本轮未改任何业务逻辑、页面 JSX 或组件代码；未提交、推送或部署；未新起 `next dev`（复用 :3200）；
未提交真实询盘。任务记录见
[`work/completed/2026-10-11-astryx-component-compatibility-matrix.md`](work/completed/2026-10-11-astryx-component-compatibility-matrix.md)。
遗留（交 P1–P4）：Next Link 软导航/预取、无 JS/键盘/焦点/四语言/320px 逐切片自测、`ClickableCard`
与 `MetadataList` 的生产验收。

## 2026-10-11 Astryx Neutral 暖白全站迁移进行中

用户已定案以白色、暖灰和克制铜色取代旧版黑灰橙作为全站目标。根 Astryx Theme、可编辑 Neutral 源码及静态构建产物已接入，品牌色继续由 `globals.css` 的 `--fh-*` 统一定义；首页、通用 PageHero、产品总览、轮毂目录、Header/Footer 已改为暖白首屏/外壳。既有 Astryx 询盘、目录、偏距输入和长文适配器改从本地主题获取一致令牌，Next.js/WordPress 内容与发布边界未变。

19 个代表路由在 320×568、390×844、768×1024、1440×900 共 76 个路由-视口组合均返回 200，根主题为 Neutral，且无页面级横向溢出；320px 发现并修复了 About、Capabilities、轮毂排序、锻造与定制铝件的最小内容宽度问题。Playwright CLI 已确认目录筛选入口可展开、直接询盘 Dialog 在 320/768 可见、控制台 0 error。42 个单测、lint、typecheck、191 页 production build 及主题产物新鲜度校验通过。未向真实地址发信，未提交、推送或部署。

当时任务仍在 [`2026-10-11-astryx-neutral-sitewide-migration.md`](work/completed/2026-10-11-astryx-neutral-sitewide-migration.md)：旧版约 21 个文件含深色 Hero 模板，需 Alma 按页面族逐一判断改暖白或保留为有证据的深色照片区；四语言逐页视觉/键盘与完整 E2E 也未在本轮重跑。现已编写 [Alma 交接](outputs/reports/24-astryx-neutral-warm-handoff-alma-2026-10-11.md)和[全站 Astryx 组件化计划](outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md)，拆分 P0–P5 六个排队切片；下一步先做 P0 兼容性基线，尚未执行这些新切片。

## 2026-10-11 轮毂筛选入口与移动端提交动作修复

移动目录现在明确显示“Filter wheels”入口；展开后在选项末尾也有“Apply filters”按钮。修正嵌套折叠项的展开样式，并让结果区的浮动询盘按钮在长页面中正确隐藏，避免遮挡筛选和排序。Playwright CLI 实测 390×844 下组合筛选 PCD 5×112 与 18 英寸后显示 23 个型号，控制台 0 error；4 条 Chromium 筛选回归、lint、typecheck、191 页 production build 与 `git diff --check` 均通过。已有开发进程占用 Next 的开发锁，回归测试经核对后复用本仓库本地服务执行。未提交、推送或部署。

## 2026-10-11 询盘持久化与 QQ SMTP 端到端修复完成

询盘成功语义现已收紧为：只有 WordPress/MySQL 同事务写入询盘、幂等键和 Outbox，API 才返回
成功；未配置 CMS、写入失败或任何 `persisted:false` 均返回/显示失败，并保留表单与总询盘清单。
前端同时校验 `ok:true && persisted:true`，邮件接受、送达或失败继续作为落库后的独立状态。

本地 Next.js 已接入 WordPress REST，并只发送 1 条明确标记的合成询盘完成真实链路：HTTP 201、
`persisted:true`、QQ SMTP `accepted`、`mock:false`；写入时 MySQL 中 CPT、幂等键与 Outbox 各 1 条，
Outbox 尝试 1 次且无错误。SMTP 接受不等于 QQ 收件箱最终投递，仍需人工按询盘号
`INQ-20261011-0001` 核对收件箱/垃圾箱。

后续后端验收暴露出脚本会清空本地全部询盘，导致上述合成记录被清理；现已改为只删除脚本自己的
测试邮箱/固定探针记录，并以保护性哨兵证明普通询盘保留、测试夹具删除。Playwright 也不再复用
端口上的陌生站点，并固定 `WP_MODE=mock`，避免自动化误发真实邮件。

验收：42/42 单元测试、lint、typecheck、191/191 页面 production build、18/18 询盘 Chromium E2E、
WordPress 后端 80/80、邮件事件/积压恢复 18/18、PHP 语法与清理边界探针通过。报告见
[`outputs/reports/23-inquiry-persistence-smtp-e2e-2026-10-11.md`](outputs/reports/23-inquiry-persistence-smtp-e2e-2026-10-11.md)，
决定见 DEC-092。未提交、推送或部署。

## 2026-10-11 本地交互整体失效已修复

本地“页面有样式但所有互动失效”并非轮毂筛选、询盘与导航三个模块同时损坏，而是开发资源未被
浏览器加载：轮毂站以 `0.0.0.0:3200` 启动后，Next.js 16 阻止来自 `127.0.0.1` 和本机局域网
地址的 dev-only 脚本、字体与 HMR 请求，React 因此没有完成水合。与此同时，浏览器中遗留的
`127.0.0.1:3000` 实际由另一个 PersonalWebsite 项目占用，不是当前轮毂站。

`next.config.ts` 现默认允许回环地址并自动收集本机活动 IPv4 接口；稳定别名或开发隧道可通过
`NEXT_DEV_ALLOWED_ORIGINS` 显式追加。桌面导航另有一个真实缺陷：hover 已展开后，随后 click
会立刻切回关闭；现已让鼠标点击保持展开、键盘 Enter 保留切换、Escape 关闭。新增 Playwright
水合与导航回归，并实测筛选 GET、直接询盘 Dialog、总询盘 Toast/Badge 和局域网开发脚本均恢复。

验收：42/42 单元测试、lint、typecheck、191/191 页面 production build、55/55 Chromium E2E、
`git diff --check` 通过。修复说明见
[`outputs/reports/22-local-interaction-recovery-2026-10-11.md`](outputs/reports/22-local-interaction-recovery-2026-10-11.md)，
任务见 `work/completed/2026-10-11-local-interaction-recovery.md`。未提交、推送或部署。

## 2026-10-10 Astryx 长文 Outline 已完成

法律文档与 Insights 正文已共用薄 `LongformOutline` 适配器：服务端继续生成标题、正文、稳定
`section-*` ID 和普通 hash 链接，Astryx 只接管滚动激活与 Arrow/Home/End 键盘导航。英文、中文、
西班牙语与泰语均补齐“本页内容/页面章节”界面标签；无 JavaScript 时目录和全文仍直接可用。

Playwright CLI 发现原 `data-reveal-group` 会让锚点本身先位移、滚动后再上移到固定 Header 下方；现已
保留稳定的 `article` 锚点，只让内部正文执行声明式 reveal。桌面最终落点为 109.67px，Header 底部
为 93px；390px 与等效 200% 均无横向溢出，控制台 0 error。新增隐私页 axe 代表扫描还发现其浅色
询盘政策面板与透明白字 Header 冲突，现已让该路径首屏使用实色 Header 并预留导航高度。

验收：41/41 单元测试、lint、typecheck、191/191 页面 production build、53/53 Chromium E2E 和
`git diff --check` 通过。报告与截图见
[`outputs/reports/21-astryx-longform-outline-2026-10-10.md`](outputs/reports/21-astryx-longform-outline-2026-10-10.md)，
任务见 `work/completed/2026-10-10-astryx-longform-outline.md`，决定见 DEC-091。未提交、推送或部署。

## 2026-10-10 Astryx 询盘反馈、弹窗基线与偏距输入已完成

本轮完成询盘清单 `Toast`/`Badge`、偏距计算器六个 Astryx `NumberInput`、直接询盘两档视口与五种
状态截图，并完成 FAQ、制造能力和 Insights 分类交互审计。Toast 区分新增、重复数量合并和 20 个
配置满额；Badge 表示配置项数量，不把采购件数伪装成购物车商品数。偏距公式已抽成纯函数，负偏距、
小数、清空草稿、390px、等效 200% 和 axe 均有回归。

Playwright CLI 在 320×568 Success 基线中发现弹窗仍保留提交前滚动位置，导致标题和关闭入口被裁掉；
现已在成功后把内部内容滚回顶部。768×1024 与 320×568 的 Open、Validation、Submitting、Success、
Server Error 共 10 张基线均已保存。

交互审计结论：公开 FAQ 继续用服务端 `<dl>` 展示全文；`/capabilities` 没有真实 Tabs，不启用孤立未
调用的 `ProcessExplorer`；Insights 分类是结果筛选而非视图导航，继续使用 `aria-pressed`，不误用
Astryx `TabList`。详细报告与截图见
[`outputs/reports/20-astryx-interaction-feedback-and-baselines-2026-10-10.md`](outputs/reports/20-astryx-interaction-feedback-and-baselines-2026-10-10.md)，
决定见 DEC-090。

验收：41/41 单元测试、lint、typecheck、191/191 页面 production build、47/47 Chromium E2E 和
`git diff --check` 通过。任务见
`work/completed/2026-10-10-astryx-interaction-feedback-and-baselines.md` 与
`work/completed/2026-10-10-astryx-offset-number-input.md`；下一条独立 Astryx 切片仍是排队中的长文
`Outline`。未提交、推送或部署。

## 2026-10-10 Astryx 全页面 UI 审计完成

已按 `fenghuai-engineering-workflow` 审计 `src/app` 的 38 个页面路由文件，其中 31 个为实际渲染
模板、7 个为纯重定向。Playwright CLI 在当前仓库独立的 3100 端口完成 1440×900 与 390×844
巡检：31/31 页面返回 200，桌面/移动均无页面级横向溢出。动态型号、平台和文章按共享模板族审计，
没有把同模板的 138 个型号和四语言 URL 重复计算。

结论：Astryx 下一步优先用于轮毂详情 `Dialog` 直接询盘、法律/文章 `Outline`、偏距计算器
`NumberInput` 和询价清单 `Toast`；Insights `SegmentedControl` 与状态 `Badge` 只做 P2 探针。
继续拒绝用 `TopNav`/`MobileNav`、`Pagination`、`CheckboxInput`、`BottomSheet`、`Table` 或通用
`Card` 改写导航、服务端筛选、工程规格和品牌 Hero。

审计同时发现 P1 独立缺陷：轮毂详情为白色首屏，但全局 Header 仍按深色 Hero 使用透明白字，
桌面和移动端导航几乎不可见；本地隐私诊断浅色首屏有同类问题。已建立 Header tone、长文
Outline 和偏距 NumberInput 三个排队任务，并把 Astryx 组件选择补入既有直接询盘计划。完整矩阵与
截图见 [`outputs/reports/18-astryx-all-page-ui-audit-2026-10-10.md`](outputs/reports/18-astryx-all-page-ui-audit-2026-10-10.md)。
本轮只新增审计文档与任务记录，没有修改运行时代码、提交或部署。

## 2026-10-10 轮毂直接询盘弹窗与无数量上限已完成

轮毂详情页已拆成“加入总询盘”和“直接询问当前产品”两条路径：前者继续持久化多配置清单，
后者使用 Astryx `Dialog purpose="form"` 在当前页打开共享表单，只发送当前型号/配置，不读取、
提交或清空已有清单。未选 variant 时仍允许型号级询盘，并由既有 `variant_pending` 语义跟进。

单配置数量已从浏览器、Zod 和 WordPress 三层删除 999 业务上限，统一为安全正整数；项目数量
文本继续允许 `prototype`、`500/year` 等表达。Astryx `NumberInput` 已用于配置数量，5,000 件
通过真实 WordPress 快照验证。开发态 CSP 允许 React 调试所需 `unsafe-eval`，生产态继续禁止；
Playwright CLI 控制台 0 error，没有再出现原 eval 报错。

验收：37/37 单元测试、lint、typecheck、191 页 production build、26/26 Chromium E2E、
WordPress 后端 80/80、邮件事件/积压恢复验收、PHP 语法和 `git diff --check` 全部通过。390×844
弹窗无横向溢出、内部可滚动、Escape 关闭并恢复触发焦点；证据见
[`outputs/reports/ui-evidence-2026-10-10/direct-wheel-inquiry-mobile.png`](outputs/reports/ui-evidence-2026-10-10/direct-wheel-inquiry-mobile.png)。
任务见 [`work/completed/2026-10-10-direct-wheel-inquiry-dialog-and-quantity.md`](work/completed/2026-10-10-direct-wheel-inquiry-dialog-and-quantity.md)，决定见 DEC-089。

## 2026-10-10 Astryx Banner / FormLayout 反馈外壳评估完成

按 `fenghuai-engineering-workflow` 完成 Astryx 第三条 UI 纵向切片：轮毂目录的筛选组合规则已迁移到
Astryx `Banner status="info"`，桌面和移动筛选面板均保留服务端渲染。普通结果数量仍是文本摘要，
无结果继续使用 `EmptyState`；`FormLayout` 仅适合询盘字段布局，不包裹轮毂筛选器，避免破坏原生
`fieldset`、GET 字段和无 JavaScript 语义。

新增 `tests/astryx-feedback-shell-probe.test.mts` 与筛选 Banner 契约测试；35/35 单元测试、lint、
typecheck、191 页面 production build、39/39 Chromium E2E、`git diff --check` 全部通过。桌面/移动
证据与完整结论见 [`outputs/reports/17-astryx-feedback-shell-probe-2026-10-10.md`](outputs/reports/17-astryx-feedback-shell-probe-2026-10-10.md)。
决定记录见 DEC-088。Astryx UI 主线下一步可评估询盘成功/待投递反馈，但不再为了组件覆盖率改写结果摘要或原生筛选。

## 2026-10-10 Astryx 轮毂筛选器外壳评估完成

按 `fenghuai-engineering-workflow` 完成 Astryx 第二条 UI 纵向切片：轮毂目录的型号搜索已接入
Astryx `Field`，实际查询仍由原生 `input[name=q]`、GET URL 和服务端解析负责。对
`CheckboxInput` 做了固定版本静态探针，确认其布尔 `value` 不能承载 `diameter=18`、
`pcd=5x112` 这类业务值；为保持无 JavaScript 多选提交，直径/宽度/PCD/工艺 checkbox 保留原生实现。

筛选计数的对比度从 3.59:1 修复为 `text-steel` 令牌；新增筛选 URL、服务端 HTML、axe、键盘焦点和
等效 200% 视口回归。桌面/移动截图与探针记录见
[`outputs/reports/16-astryx-wheel-filter-shell-probe-2026-10-10.md`](outputs/reports/16-astryx-wheel-filter-shell-probe-2026-10-10.md)。
验收证据：33/33 单元测试、lint、typecheck、191 页面 production build、38/38 Chromium E2E、
`git diff --check` 全部通过。当前任务仍在 `work/active/2026-10-10-astryx-ui-expansion.md`，下一步评估
`Banner` 或 `FormLayout`，不改变筛选状态模型；排队任务见
`work/queued/2026-10-10-astryx-feedback-shell.md`。

## 2026-10-10 Astryx Pagination 探针完成，保留服务端链接分页

按 `fenghuai-engineering-workflow` 执行下一条纵向切片的第一步：用固定版本
`@astryxdesign/core@0.6.7` 对官方 `Pagination` 做服务端静态渲染探针。组件有正确的分页
landmark、当前页语义和可访问名称，但要求 `onChange` 并输出按钮，不是普通 `<a href>`。

因此没有替换现有 `WheelCataloguePagination`，继续保持筛选参数、页码、工艺锁定、复制 URL、
无 JavaScript 和爬虫行为。探针测试和报告见
[`outputs/reports/15-astryx-pagination-server-link-probe-2026-10-10.md`](outputs/reports/15-astryx-pagination-server-link-probe-2026-10-10.md)。
原排队任务已移动到 `work/active/2026-10-10-astryx-ui-expansion.md`，下一步是评估筛选器外壳。

## 2026-10-10 Astryx 面包屑与轮毂空状态第二切片已完成

按路线图完成了第一个可回滚的导航/筛选反馈切片：轮毂目录、详情、旋压路线、Dealer、Fitment、
Insights、工具与法律页面均改用共享 `SiteBreadcrumbs`；轮毂合法无结果分支改用 Astryx
`EmptyState`，仍保留筛选摘要、清空筛选与带当前筛选快照的询盘入口。所有业务 URL、服务端 GET
筛选、分页、产品事实和无 JS 兜底均未交给客户端组件接管，中文前缀会生成 `/zh/*` 面包屑路径。

本切片的 Playwright 契约覆盖英文公开页面、中文轮毂目录与无结果状态；`npm run typecheck` 和
`npm run lint` 已通过。任务已从 `work/queued/2026-10-10-astryx-breadcrumb-empty-state.md`
移至 `work/completed/2026-10-10-astryx-breadcrumb-empty-state.md`。收尾门禁已通过：31/31 单元测试、
lint、typecheck、191 页面 production build、34/34 Chromium E2E（`--retries=0`）和
`git diff --check`；截图见 `outputs/reports/ui-evidence-2026-10-10/astryx-empty-state/`。

## 2026-10-10 Astryx 页面组件第一性原理评估完成

已确认 Astryx 适合解决跨页面重复的交互基础设施，不适合替换首页 Hero、产品卡片、工程规格表
或服务端筛选状态。官方组件目录和设计原则已与现有页面逐项映射：下一条排队任务是扩展共享
面包屑，并只迁移轮毂目录的空状态/筛选反馈外壳；分页、筛选器状态和语言导航暂不强行迁移。
详细报告见 [`outputs/reports/14-astryx-first-principles-component-roadmap-2026-10-10.md`](outputs/reports/14-astryx-first-principles-component-roadmap-2026-10-10.md)，任务见
`work/queued/2026-10-10-astryx-breadcrumb-empty-state.md`。

## 2026-10-10 首页已恢复完整工业品牌首屏

按用户复核结果，首页不再把三个采购起点卡片塞入 Hero。首屏已恢复上一版的大标题比例、留白、
双行动按钮和展示字体；页面下方的产品线、能力、交付流程与收尾询盘仍完整保留，因此首页仍是
五区块品牌与转化页面，不是单一组件展示页。

本次只回退首页视觉增量：WordPress 首页内容/SEO、四语言路由、Hero 媒体加载失败兜底、询盘
上下文解析、Astryx 面包屑与询盘表单均继续保留。桌面 1440×1000 和移动 390×844 均无横向
溢出，截图见 `outputs/reports/ui-evidence-2026-10-10/homepage-rollback/`。

验收证据：31/31 单元测试、31/31 Chromium E2E、lint、typecheck、191 页面 production build、
`git diff --check` 通过。开发模式截图中的 CSP `eval()` 与 HMR 跨源消息不进入 production build。

## 2026-10-10 Astryx Neutral 面包屑与询盘表单第一切片已完成

本轮没有假造不存在的“Meta 品牌主题”。Astryx 是在 Meta 内部成长并开源的组件系统，公开主题中
适合当前工业独立站作为迁移起点的是 Neutral。已按纵向切片将 Astryx 引入询盘主链路，同时保留
现有黑灰橙品牌令牌、Zod 校验、两步表单状态、购物清单、幂等键和 WordPress 载荷契约。

已完成：

- 安装 `@astryxdesign/core`、`@astryxdesign/theme-neutral` 与 `@stylexjs/stylex`，接入 Next.js
  `LinkProvider` 和四语言国际化环境；
- 新增共享 `SiteBreadcrumbs`，`/request-a-quote` 首屏使用 Astryx `Breadcrumbs`；
- 询盘表单的输入框、文本域、选择器、单选、多选、复选、提示横幅和按钮均改用 Astryx 原生组件；
- Neutral `Theme` 只包围 Astryx 表面，避免其语义颜色污染既有深色首页；CSS 明确声明
  reset、Astryx 基础/主题与 Tailwind utilities 的级联顺序；
- 保留自有两步进度组件：官方 Stepper 面向 3–7 步流程，不强行用于当前两步表单；
- 英文、中文、西班牙语使用官方目录，泰语为当前切片补最小覆盖，缺失短语可见回退英文；
- 桌面与 390px 移动端无横向溢出，UI 证据存于
  `outputs/reports/ui-evidence-2026-10-10/astryx/`。

验收证据：`npm test` 31/31、`npm run lint`、`npm run typecheck`、`npm run build`（191 页）、
`CI=1 npx playwright test --project=chromium` 31/31、`npm run audit:prod` 0 漏洞、
`git diff --check` 通过。Astryx Doctor 为 0 failure、8 pass、2 warning；两个警告分别来自手工接入
主题/Provider 和未让 CLI 改写项目级 `AGENTS.md`，均为有意保留本项目治理规则。

## 2026-10-10 第一批 UI 增量已完成，首页入口增量已按复核回退

按第一性原理，网站的核心链路是“定位需求 → 找到产品/能力 → 验证证据 → 选择规格 → 提交询盘”。
本轮曾按纵向切片完成 P0 首页需求入口、P0 移动端行动入口安全区和 P1 Hero 媒体失败兜底；
后续用户复核决定回退首页三入口和 Hero 字体压缩，其余两项与普通控件字体收敛继续保留。详细路线图见
[`outputs/reports/13-first-principles-incremental-roadmap-2026-10-10.md`](outputs/reports/13-first-principles-incremental-roadmap-2026-10-10.md)。

已完成：

- 首页三入口已由 DEC-083 回退；既有 `product_line`、`intent`、`input_type`、`from`
  询盘上下文与四语言字典接缝继续保留，可供目录、详情和外部入口使用；
- 移动端浮动询价入口保留 78px 内容安全区和系统 `safe-area-inset-bottom`，桌面端恢复原位置；
  筛选抽屉、询盘页、感谢页和页脚隐藏与键盘可达性保持不变；
- Hero 批准媒体失败时切换同尺寸工业网格，不改变标题/CTA 位置，也不以生成图替代产品事实；
- 普通导航、表单和浮动询价入口继续使用 Inter 正文字体与普通句式；首页 Hero 双 CTA 按用户
  复核恢复展示字体与大写字形，但不扩散到其他控件。

验收证据：`npm test` 31/31、`npm run lint`、`npm run typecheck`、`npm run build` 191 页、
`CI=1 npx playwright test --project=chromium` 31/31、`git diff --check`；截图存放在
`outputs/reports/ui-evidence-2026-10-10/`。当前进行中任务见
`work/active/2026-10-10-content-density-typography.md`，后续仍按 P1 目录选择效率、中文/多语言
正文迁移、P2 最小匿名数据反馈顺序推进。

## 2026-10-10 阶段 4：产品与图片可信度流程已明确，首发资料仍阻塞

本轮没有把现有 138 个技术/迁移批准型号误报为商用首发。已把图片确认收缩为轻量流程：主图
实体存在、型号/变体匹配、供货确认和公司负责人批量声明。只有第三方 Logo、客户车辆、外部
供应商素材或授权明显不明时，才升级逐图权利核验。现有 WordPress 的发布、图权、供货、规格
和批准变体门槛继续 fail-closed。

当前阻塞：首发 10–20 个型号清单、工程与供应确认、公司负责人批量可发布声明、补图计划和最终
批准人。开发可以先做候选资产检查报告（文件存在、哈希、尺寸、命名绑定），但不能自动提升
公开状态。详细流程见 [`outputs/reports/12-product-image-trust-verification-process-2026-10-10.md`](outputs/reports/12-product-image-trust-verification-process-2026-10-10.md)，
任务见 `work/active/2026-10-10-product-image-trust-verification.md`。

备用图片采用分批策略：尚未确定型号的图片留在只读候选库；确定型号后再按一个型号/一个小批次
上传 WordPress、绑定图库并单独验收，不要求一次性迁移全部图片。后续任务见
`work/queued/2026-10-10-reserve-wheel-image-incremental-upload.md`。

## 2026-10-10 P1：多语言路由、正文字段与 SEO 门禁第一切片已完成

本轮按 `fenghuai-engineering-workflow` 先完成不依赖业务翻译批准的工程切片：英文根 URL
保持不变，新增中文、西班牙语、泰语独立前缀；WordPress Page 与 Insights 契约预留按
locale 的正文、SEO 和发布状态。未完成人工翻译和核验的语言不会被搜索引擎收录。

已完成：

- `src/lib/i18n` 支持 `en / zh / es / th`，Proxy 可将四种前缀 rewrite 到现有 App Router，
  语言选择改为可访问的下拉控件，并保留当前路径、查询参数和片段；
- 四种语言的站点 Header/Footer chrome 字典键集合一致；页面正文没有凭空复制成翻译；
- WordPress 原生 Page 增加 `content_by_locale`、`seo_by_locale` 和 `locale_status` 字段；
  只有 `approved` 的语言版本进入公开契约，编辑预览可以查看草稿；
- Insights 原生文章增加 `translations` 与 `translation_status` 字段，保持既有
  `GuideEntry` 适配器不变；
- 根布局只为当前允许索引的语言输出 `hreflang`，语言未完成时响应带
  `noindex, follow` 且不进入 sitemap；当前允许索引集合仍只有英文；
- 验收证据：31/31 单元测试、WordPress 原生 Page/CMS 探针、Playwright 6/6 站点契约、
  lint、typecheck、191 页面 production build 通过。

尚未完成：

1. 逐页补齐中文、西班牙语、泰语正文、metadata、媒体 alt 与业务核验；
2. 将已完成语言加入 `INDEXABLE_LOCALES`，再验收 canonical、hreflang、sitemap 和真实域名；
3. 运营在 WordPress 后台使用多语言 JSON 字段完成首批页面/Insights 翻译并做预览、批准、
   撤回演练。

详细任务见 `work/active/2026-10-10-multilingual-content-seo.md`。

## 2026-10-10 阶段 3：原生 WordPress 内容接管第一、第二切片已完成

本轮按 `expand–migrate–contract` 扩展内容后台，目标是让运营通过 WordPress 原生编辑器
管理博客与站点页面，同时保持 Next.js 组件只接收既有稳定类型。当前状态为“已迁移并开启
本地权威接管”，第三切片代码已完成，但正式隐私版本未确认，因此询盘 Page 保持草稿、
表单继续 fail-closed。

已完成：

- 6 篇已审核 Insights 已复制到原生 WordPress `post`，保留结构化摘要、正文分段、SEO、
  媒体和日期；`fh_guides_native_authoritative` 开启后，公开接口明确返回
  `source=wordpress-post`；旧 `fh_guide` 保留为回退和对账源；
- 新增原生 Page 内容插件与稳定 REST 契约，支持页面键、结构化内容 JSON、SEO 标题/描述、
  特色媒体、草稿/批准/撤回和授权预览；7 个页面已导入：首页、公司、能力、产品中心、
  EV、定制铝制品、自密封轮胎；
- 首页、公司、能力和四条产品线服务端适配器均先归一化为既有 `src/content/types.ts`
  类型，字段不完整时回退最后一次有效本地快照；产品页 SEO 已切换为读取 Page SEO；
- 原生 post/page 保存、撤回、回收站和删除均接入 HMAC 缓存回调，失效对应页面、Insights
  tag 和 `/sitemap.xml`；预览接口要求编辑权限，草稿不会进入公开集合；
- 询盘入口、感谢页和隐私受控字段已加入原生 Page 迁移包：包括 Step 1/Step 2 提示、字段
  错误、成功、网络失败、邮件待投递和隐私同意文本；当前因环境没有正式隐私版本号，
  `request-a-quote` 与 `privacy` 在 WordPress 中保持草稿，公开接口返回空集合；
- 已补充隐私版本/同意文本模板和前台观测路径：`outputs/templates/2026-10-10-privacy-consent-template.md`
  记录待确认字段与发布门槛；`/api/preview?secret=...&page=privacy` 和
  `...&page=request-a-quote` 可在授权预览态查看 WordPress 草稿，页面顶部显示预览横幅，
  隐私页直接展示版本号、同意文本和链接；版本号为空时询盘表单仍显示不可用提示，不会写入数据；
- 缓存失效的 `pages` 类型覆盖 `/request-a-quote`、`/support/privacy`、`/thank-you` 与
  `/sitemap.xml`，并已加入 Playwright 契约测试；
- 验收证据：`python3 scripts/verify-insights-cms.py`、`python3 scripts/verify-native-pages.py`
  通过；`npm test` 29/29、`npm run lint`、`npm run typecheck`、`npm run build`、
  `git diff --check` 通过。

下一步：

1. 由业务/法务确认正式隐私版本号和同意文本，重新导出并批准 `request-a-quote`、`privacy`；
2. 在真实运营编辑一轮后再收缩本地录入职责，不删除本地最后一次有效快照；
3. 生产环境补真实域名下的预览 token、回调密钥、备份和 sitemap 联调。

详细 Issue 记录见 `work/active/2026-10-10-wordpress-native-content-takeover.md`，决定见
`DECISIONS.md` 的 DEC-075。

## 2026-10-10 阶段 2：多款轮毂询价清单已完成

本阶段已把单产品询盘扩展为一次最多 20 款轮毂的结构化清单，且不破坏旧载荷和既有
WordPress 记录。当前实现链路为：

`目录/详情加入清单 → localStorage 刷新恢复 → Step 1/Step 2 表单 → Zod 服务端校验 →
Next.js 按 model + productionCode 重查已发布集合 → WordPress CPT 事务保存
inquiry_items_json 快照 → 同一快照生成 HTML/纯文本 QQ 通知 → 后台逐项查看`。

本阶段已完成：

- `InquiryItem[]` 类型与 Zod 契约：最多 20 项、数量 1–999 的整数；旧单产品载荷和旧记录
  继续可读；重复清单项在客户端合并，服务端仍拒绝重复 canonical 配置；
- 目录卡片可把首个已批准配置加入清单，详情页可把当前选择的配置加入清单；询价页支持
  删除、改数量、清空和刷新恢复，成功提交后清空；浮动询价入口显示清单数量；
- 服务端不信任客户端规格：每项以 `model + productionCode` 重新解析公开集合并覆盖规格；
  未发布、篡改或不存在配置返回 422，整次提交不写入；
- WordPress 新增 `inquiry_items_json` 自定义字段，在 CPT 写入事务中保存不可变快照；后台
  详情、列表关联记录、HTML 邮件和纯文本备用正文显示同一逐项清单；
- 验收证据：`npm run lint`、`npm run typecheck`、`npm test`（26/26）、`npm run build`
  全部通过；`CI=1 npx playwright test e2e/inquiry.spec.ts --project=chromium`
  12/12 通过（开发环境离线字体下载仅产生 fallback 警告）；`python3 scripts/verify-inquiry-backend.py`
  80/80 通过；PHP 语法检查与 Docker 配置检查通过。

本阶段的取舍与迁移门槛记录在 `DECISIONS.md` 的 DEC-074；Issue 已移至
`work/completed/2026-10-10-inquiry-cart-multi-item.md`。尚未包含价格、下单、支付、客户
账号或独立 `fh_inquiry_item` 查询表。

## 2026-10-09 商用基线继续收口

**当前判断仍为 No-Go。** 本轮已关闭所有不依赖管理层决定的本地工程基线，但正式
主体/域名/法律文本/首发产品签字/OpenNext 平台/生产邮件事件/监控恢复仍未具备，不能部署
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

本轮核验新增的 P1 已完成：当前询盘已经支持一次提交多款轮毂；实现与证据见
`work/completed/2026-10-10-inquiry-cart-multi-item.md` 和 `outputs/reports/09-multi-wheel-inquiry-implementation-2026-10-10.md`。
邮件通道核验确认没有引入 Nodemailer，远程由 WordPress 自带 PHPMailer 走 QQ SMTP；
Insights 首批 6 篇已由 `fh_guide` 自定义内容类型接管，`src/content/resources.ts`
仅作为 CMS 不可用时的回退。

2026-10-10 已形成基于第一性原理的增量路线图，按“询盘可靠性 → 多产品询价 →
WordPress 内容接管 → 产品/图片可信度 → 中文 i18n → 正式部署演练”排序，并将外部阻塞
与可自主推进的工程切片分开：[`outputs/reports/08-incremental-roadmap-first-principles-2026-10-10.md`](outputs/reports/08-incremental-roadmap-first-principles-2026-10-10.md)。

## 2026-10-10 询盘可靠性生产化：本地闭环已完成

本地继续沿用 WordPress 内置 PHPMailer/QQ SMTP，不引入 Nodemailer。SMTP 成功只代表
提供商接受（`accepted`），因此新增独立的签名事件接缝：

- `POST /wp-json/fh/v1/email-events` 使用时间戳 + HMAC-SHA256，支持 `delivered`、
  `bounced`、`failed`，事件表以 `provider_event_id + event_type` 去重；
- 事件只保存最小化审计字段，回写同一条 WordPress 询盘和 outbox；乱序的
  `delivered` 不会覆盖已确认的 `bounced/failed`；未匹配事件返回 `202` 并保留审计；
- outbox worker 原有租约、退避、最大尝试次数保持不变，新增五分钟积压摘要、已放弃和
  过期租约告警；日志只有计数与时间，不含邮箱、电话或正文；
- `scripts/verify-inquiry-delivery.py` 使用合成询盘完成签名、重复/乱序、未匹配、错误
  签名、积压告警和过期租约恢复演练，全部通过；`php -l` 和既有后端验收通过（既有
  列表字段顺序探针仍有 1 项历史失败，与本次改动无关）。

生产剩余项是选择支持 Webhook 的邮件提供商、配置 `FH_INQUIRY_WEBHOOK_SECRET`、公开
HTTPS 回调地址、可靠系统 cron/队列和告警接收方；QQ SMTP 本身不能凭发送成功生成
`delivered/bounced` 事件。实施记录见
`work/active/2026-10-10-inquiry-delivery-productionization.md`。

本轮未改 DNS；已部署 7080/9080 公网联调环境，并向已配置的内部 QQ
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
