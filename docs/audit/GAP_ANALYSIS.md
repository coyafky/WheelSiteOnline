# M01–M18 差距分析（Gap Analysis）

审计日期：2026-10-17
审计基线：HEAD `3d8a25e`，分支 `codex/full-site-current-20261012`，工作区有未提交改动（见文末「审计基线声明」）
审计方式：只读静态审计，四路并行取证，每条结论标注 `文件:行号`
对照基线：《Next.js + Headless WordPress 企业级架构设计 V3.0》18 个模块

> 本页状态口径：**已满足** / **部分满足** / **未实现** / **有风险** / **待核实**。
> 没有证据的一律标「待核实」，不做推测。审计材料不替代项目正本。

---

## 总表

| 编号 | 模块 | 状态 | 风险 | 建议动作 | 一句话根因 |
|---|---|---|---|---|---|
| M01 | 项目基础架构 | 部分满足 | Medium | 修补 | 单仓健康、env 纪律到位；三套样式体系并存、29 个脚本无入口 |
| M02 | CMS 接入层 | 部分满足 | **High** | 修补 | fetch 出口集中、零组件直连；但读路径无重试、无 schema 边界、错误退化为 `null` |
| M03 | WordPress 内容模型 | 部分满足 | **High** | 修补 | CPT/taxonomy/REST 齐全、schema 版本化真实；但同一事实存 5 处，PHP⇄TS 靠手抄 |
| M04 | 页面组件系统 | 部分满足 | Medium | 修补 | 首页模块系统达标；其余 11 页无模块层无版本，6 个孤儿组件 |
| M05 | 多语言系统 | 部分满足 | **High** | 修补 | 路由与门槛成型；`localizedAlternates` 默认值使 hreflang 与发布门槛脱钩 |
| M06 | SEO 基础设施 | 部分满足 | **High** | 修补+新增 | fail-closed 做得好；canonical 非单点，sitemap 与测试硬矛盾 |
| M07 | GEO 内容结构 | 未实现 / 有风险 | **High** | 新增+修补 | GEO 三字段全缺；PLACEHOLDER FAQ 已上线且含商业承诺 |
| M08 | 产品系统 | 部分满足 | Medium | 修补+重构 | 发布判定集中；三套产品分类互不引用，图集链路未接通 |
| M09 | 博客与案例 | 部分满足 | Medium | 修补 | 已迁原生 post；分类是裸文本、无分页、100 条硬上限 |
| M10 | 询盘系统 | 部分满足 | Medium | 修补 | 事务+幂等+快照扎实；限流仅内存、WP 侧无速率限制、无同意采集 |
| M11 | 邮件通知 | 已满足 / 部分满足 | Medium | 修补 | 先存后发+租约重试完整；告警钩子无监听者、无死信重放 |
| M12 | 媒体资源 | 部分满足 | Medium | 修补+新增 | 全 WebP、alt 有回退链；无 AVIF、生产配置含 localhost remotePatterns |
| M13 | 缓存与内容同步 | 部分满足 | **High** | 修补 | HMAC 校验到位；但失效是 fire-and-forget，失败即永久丢失 |
| M14 | 安全与权限 | 部分满足 | **High** | 修补 | 多层防护；预览密钥进日志、限流可绕过、WP 后台明文 HTTP |
| M15 | CI/CD 与部署 | 部分满足 | Medium | 新增+修补 | 只有 CI 没有 CD；E2E 不进 CI；前端镜像 tag 不可追溯 |
| M16 | 监控与备份 | 未实现 | **High** | 新增 | 无错误追踪、无 uptime、无备份脚本、无恢复演练 |
| M17 | AI Agent 接入 | 部分满足 | Medium | 修补+新增 | 契约完备但无技术强制；无审计日志、无受控写入接口 |
| M18 | 性能与质量 | 部分满足 | Medium | 新增+修补 | E2E/a11y 强；CWV 零覆盖、无性能预算 |

**八个 High 风险模块**：M02 M03 M05 M06 M07 M13 M14 M16。
其中**已经影响线上内容正确性**的是：M05（hreflang 脱钩）、M06（sitemap 与测试矛盾）、M07（未核验 FAQ 已发布）。

---

## M01 项目基础架构

**当前实现**
单仓（非 monorepo）：根目录一个 `package.json`，无 `apps/`、`packages/`、workspace 声明。Next.js 16.4.0 + React 19.2.4 + `output: "standalone"`，Node 要求 `>=24`（`.nvmrc`=24）。`src/` 按 `app / components / content / lib / hooks / theme / types` 分层，`@/*` 别名映射 `./src/*`。`.env.example` 已把 15 个变量名全部文档化，真实 `.env.local` 与 `local-wp/.env` 均被 gitignore。

**证据**
- `package.json:24-27` `"engines": {"node": ">=24"}`；`.nvmrc` = `24`
- `tsconfig.json:29-31` `paths: {"@/*": ["./src/*"]}`；`tsconfig.json:35-53` `exclude` 含 `archive`、`.next`、`.alma-snapshots`
- `next.config.ts:82` `output: "standalone"`
- `.gitignore:13-17`、`.gitignore:63-69`（忽略 `local-wp/db-data/`、`local-wp/wp-data/`、`local-wp/.env`）
- `.env.example` 变量名清单：`WP_API_URL / WP_PUBLIC_API_URL / WP_API_TOKEN / WP_MODE / NEXT_PUBLIC_APP_URL / WP_REST_ROOT / WP_INQUIRY_SERVICE_KEY / FH_INQUIRY_WEBHOOK_SECRET / FH_INQUIRY_RETENTION_DAYS / WP_PREVIEW_SECRET / WP_REVALIDATE_SECRET / INQUIRY_RECEIPT_SECRET / RESEND_API_KEY / INQUIRY_FROM / INQUIRY_TO / NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION / INQUIRY_ALLOWED_ORIGINS`

**已有能力**
- Node/Next 版本由 `.nvmrc` + `engines` + CI 三处一致收紧
- 环境变量「名值分离」纪律落实：只提交 `.env.example`，无真实密钥入库
- 构建产物 `standalone` + Dockerfile 路径闭合
- 安全响应头集中式配置且有单测（`tests/security-headers.test.mts`）
- `.env.example` 为每个变量写明「留空会怎样」的契约

**缺失能力**
- 无跨语言契约共享机制（PHP 字段名与 TS 类型靠人工同步，见 M03）
- 29 个 `scripts/` 脚本无 npm 入口、无 README 索引，可发现性差
- 无 `.env` schema 校验（缺变量只在运行时报 503，非启动期 fail-fast）
- 无部署平台声明文件，部署契约只存在于 `deploy/` 与文档

**重复功能**
- 样式体系三套并存：`@astryxdesign`、Tailwind v4、`shadcn/tailwind.css`（`src/app/globals.css:3-8`）；`@stylexjs/stylex` 在 dependencies 中但 `grep -rln stylex src/` 为 0 → 死依赖

**安全风险**
- `next.config.ts:127` CSP 含 `script-src 'self' 'unsafe-inline'`（常量，非仅 dev）
- 仓库根目录存在 `local-wp/local-credentials.txt`（gitignore 已核实未入库）→ 操作风险非代码风险

**状态**：部分满足 ｜ **风险**：Medium ｜ **动作**：修补

**验收方式**
1. `git ls-files | grep -iE "\.env($|\.)" | grep -v example` → 必须返回空
2. `npm run check` 全绿（`theme:check && test && lint && typecheck && build`）
3. `grep -rn "stylex" src/ | wc -l` → 为 0 则依赖可判定为死依赖
4. `npm ls @stylexjs/stylex @astryxdesign/core tailwindcss shadcn` → 确认三套样式的真实使用面

---

## M02 CMS 接入层

**当前实现**
`src/lib/wordpress/` 是唯一 CMS 访问层，`client.ts`（318 行）集中承担 4 个能力：`wpFetch`、`wpRead`（带 cache tag + noStore）、`wpWrite`（POST 到 `fh/v1`，服务密钥 + 403/5xx 分类）、`getWpRestRoot`。`WP_MODE` 机制：`baseUrl && WP_MODE === "live"` 才 live，否则 mock 返回 `null`。各内容域有独立 adapter。**无 Zod 边界**——`zod` 只用于询盘表单。

**证据**
- `src/lib/wordpress/client.ts:16-24` `getWpConfig()`（mode 判定单点）
- `src/lib/wordpress/client.ts:51-83` `wpFetch`（`AbortSignal.timeout(8000)`，`!res.ok` → `console.error` + 返回 `null`，**无重试**）
- `src/lib/wordpress/client.ts:86-131` `wpRead`
- `src/lib/wordpress/client.ts:172-292` `wpWrite` + `WpWriteFailureReason = "not_configured" | "network" | "client" | "server"`
- `grep -rn "fetch(" src/` → 仅 `client.ts:59/103/243`、`inquiry-form.tsx:375`、`preview-banner.tsx:19`、`inquiry/mailer.ts:74` → **0 处组件直 fetch WordPress**
- `grep -rl 'zod' src/` → 3 个文件，全部在询盘域

**已有能力**
- 单一 fetch 出口，客户端组件零直连
- 超时（8s 读 / 10s 写）全覆盖
- 写入失败 4 分类，body 不吞
- `WP_MODE` 显式 opt-in，默认离线可跑
- `import "server-only"` 在多个 adapter 顶部
- 缓存 tag → `revalidateTag` + `revalidatePath` 链路完整

**缺失能力**
- **读路径无重试**，8s 超时对冷启动 WP 偏紧
- **无统一错误模型**：`wpRead` 只返回 `null`，调用方分不清「CMS 挂了」「返回空」「契约损坏」
- **无 schema 校验边界**：手写 `is*()` 只验 key 存在，不验内部结构
- 错误只进 `console.error`，无 metrics/告警埋点
- `src/lib/wordpress/index.ts` barrel 导出 15 个符号但使用次数为 0 → 死代码
- 缓存 tag 未集中登记（3 处分散常量）

**重复功能**
- `wpFetch` 与 `wpRead` 逻辑高度重合
- 手写守卫重复：`isAboutContent`、`isSelfSealingTirePage`、`isWheelCapabilities`、`validHomepageContent` 四份同构

**安全风险**
- `src/app/api/preview/route.ts:22` 用 `!==` 比较预览密钥，非 `timingSafeEqual`（对比 `revalidate/route.ts:27` 已用）
- 多处以 `permission_callback => '__return_true'` 开放只读端点（`fenghuai-pages.php:96,105`、`fenghuai-guides.php:233`、`fenghuai-wheel-authoring.php:316`），preview 分支另有 `current_user_can` 兜底

**状态**：部分满足 ｜ **风险**：High ｜ **动作**：修补

**验收方式**
1. `grep -rn "fetch(" src/ | grep -v "client.ts"` → 只应剩询盘路由、preview exit、Resend 三处
2. `grep -c "AbortSignal.timeout" src/lib/wordpress/client.ts` → 应为 3
3. `grep -rn "zod" src/lib/wordpress/ | wc -l` → 当前 0，作为「无 schema 边界」的量化基线
4. 断网演练：`WP_MODE=live` + 黑洞地址 → 页面走 fallback 且 8s 内返回不 hang
5. 补「畸形 CMS 响应 → adapter 返回 null 而非抛异常」的回归用例

---

## M03 WordPress 内容模型

**当前实现**
7 个 mu-plugin（共 5711 行）是 schema 唯一所有者，源文件在 `local-wp/mu-plugins/`（进 git），运行时经 `scripts/sync-mu-plugins.py` 同步到 gitignored 的 `wp-data/`。实际存在 **4 个 CPT**（`wheel_model`、`fh_guide`、`fh_inquiry`、原生 `post`）、**2 个 taxonomy**（`wheel_diameter`、`wheel_process`）、**6 个 REST 路由**、**1 个 ACF 字段组**，其余全部走 `register_post_meta`。

**证据**

CPT：

| CPT | 常量/行号 | rest_base | 状态 |
|---|---|---|---|
| `wheel_model` | `fenghuai-wheels.php:30` / `:143` | `wheel-models` | 活跃 |
| `fh_guide` | `fenghuai-guides.php:15` / `:67` | `fh-guides` | 迁移期只读回滚源，`show_ui:false` |
| `fh_inquiry` | `fenghuai-inquiries.php:39` / `:337` | — | 询盘存储，`show_in_rest` 关闭 |
| 原生 `post` | `fenghuai-insights-authoring.php:16` | `posts` | Insights 真正编辑载体 |

| 路由 | 方法 | 行号 | 权限 |
|---|---|---|---|
| `fh/v1/pages` | GET | `fenghuai-pages.php:93` | `__return_true` + preview 校验 |
| `fh/v2/pages` | GET | `fenghuai-pages.php:102` | 同上 |
| `fh/v1/guides` | GET | `fenghuai-guides.php:229` | `__return_true` + preview 校验 |
| `fh/v1/wheels` | GET | `fenghuai-wheel-authoring.php:314` | `__return_true` + preview 校验 |
| `fh/v1/inquiries` | POST | `fenghuai-inquiries.php:485` | `X-FH-Service-Key` + `hash_equals` |
| `fh/v1/email-events` | POST | `fenghuai-inquiries.php:493` | HMAC webhook |

- `FH_HOME_MODULES`（`fenghuai-pages.php:31-37`）与 `src/content/page-view.ts:118-124` `CMS_MODULES` 逐字对应
- `FH_HOME_PRODUCT_LINE_FACTS`（`fenghuai-pages.php:40-45`）把 4 条产品线 `image`/`href` 钉死在 PHP 侧
- 双向校验：`fh_pages_valid_home_modules()`（`:182-209`）↔ `normalizeHomepageCmsDocument()`（`page-view.ts:127-155`）

**已有能力**
- schema 版本化真实存在：`fh_page_schema_version`（`pages.php:25`），版本不符直接判 `unpublished`（`:152-155`）
- 发布门槛双条件：`post_status === 'publish'` 且 `fh_publication_status === 'approved'`
- 逐语言状态机：`fh_locale_status_json`（`pages.php:526`）
- `scripts/sync-mu-plugins.py` 有 `--check` 模式
- 验证脚本族：`verify-page-v2-contract.php`、`verify-wheel-cpt.py`、`verify-insights-cms.py` 等

**缺失能力**
- 无 PHP⇄TS 契约共享层，两份手抄常量靠 CI 之外的约定维持同步
- `schema_version` 只覆盖 Page 域；wheel/insight/inquiry 域无版本号
- 无字段级「唯一所有者」登记表

**重复功能 —— 同一事实存多份（5 处）**
1. 产品线卡片事实三处：`src/content/product-lines.ts:46`、`src/content/homepage-hero.ts:68`、`fenghuai-pages.php:41`（前两处已 TS 侧比对，PHP↔TS 无自动化）
2. Insights 双源双开关：`fh_guide` CPT 与原生 `post` 同时可读，`fh_guides_authoritative` / `fh_guides_native_authoritative` 两个开关
3. Wheel 三份数据：WP CPT + `fh/v1/wheels` + 构建期快照 `src/content/wheel-publication.json`（72KB，DEC-052）
4. 首页 H01 两份组件：`home/hero/home-hero.tsx`（活跃）vs `sections/home-hero.tsx.retired`
5. Pages v1/v2 双读：`pages.ts:20-67`

**安全风险**
- `fenghuai-inquiries.php` 3029 行，全仓最大单文件 → 变更风险高
- 公开 GET 端点依赖 handler 内部 `current_user_can` 逐处自查

**状态**：部分满足 ｜ **风险**：High ｜ **动作**：修补（骨架对，缺跨语言单一事实源）

**验收方式**
1. `grep -rn "register_post_type\|register_taxonomy\|register_rest_route" local-wp/mu-plugins/` → 应为 4 CPT / 2 taxonomy / 6 路由
2. `python3 scripts/sync-mu-plugins.py --check` → 退出码 0
3. `php scripts/verify-page-v2-contract.php` → 通过
4. 新增脚本化比对 `FH_HOME_MODULES` vs `CMS_MODULES`、`FH_HOME_PRODUCT_LINE_FACTS` vs `product-lines.ts`（当前无自动化 → 待补门禁）

---

## M04 页面组件系统

**当前实现**
只有**首页**实现了真正的「模块注册 + 可调序 + schemaVersion」，且是**硬编码 switch 分发**（`src/app/page.tsx:44-58`），不是通用注册表。`HomepageModuleView` 是判别联合，5 个模块 `required: true` 不可选。其余 11 个 CMS 页面是整体 JSON blob，无模块层。`src/components/ui/` 只有 1 个文件且**零引用**。

**证据**
- `src/content/types.ts:177-190` `HomepageModuleView`；`:202` `schemaVersion: 1`
- `src/content/page-view.ts:78-90` `buildHomepageModules`、`:92-112` `validateHomepageModules`、`:127-155` `normalizeHomepageCmsDocument`
- `src/app/page.tsx:44-58` `switch (module.type)` 五分支，**无 default**
- `src/lib/wordpress/pages-contract.ts:89-124` `normalizeWordpressLocalePage`、`:127-148` `normalizeWordpressPage`
- `fenghuai-pages.php:212-259` `fh_pages_home_field_specs()`（60+ 可编辑 path）
- `fenghuai-pages.php:206-208` H01.order 恒等 10、H05 恒等 50、中段 20/30/40 排列
- 首页组件零 CMS import，纯业务类型入参

**已有能力**
- 首页模块可后台编辑（60+ 字段 path 级）
- 首页模块可调序（中段可置换）
- 有 schemaVersion，版本不符 fail-closed
- 双向契约校验（PHP + TS）
- 组件与内容解耦良好
- `tests/homepage-page-view.test.mts` 锁死模块契约
- `page-hero.tsx` 收口了 19 处复制粘贴

**缺失能力**
- 模块系统只覆盖首页：加第 6 个模块要改 3~4 个文件，无注册表抽象
- 不可增删：`validateHomepageModules` 强制 `length !== REQUIRED.length → false`（`page-view.ts:93`）
- 非首页页面无模块层、无版本（`normalizeWordpressPage` 只做 `typeof object` 检查）
- `schemaVersion` 不覆盖其余 6 个内容域
- 无「未识别 type 的降级渲染」分支

**重复功能**
- `src/components/ui/button.tsx` 零引用孤儿（`grep 'from "@/components/ui' src/` = 0）
- `sections/home-hero.tsx.retired` 与 `home/hero/home-hero.tsx` 同名冲突
- `wheel-strip-section.tsx` 的 `WheelStripSection` 零引用
- `homepage-hero.ts`、`process.ts`、`capabilities.ts` 零引用内容模块
- `product-card.tsx` / `family-card.tsx` / `product-family-grid.tsx` 三者疑似重叠（**待核实**）

**安全风险**
- switch 无 default → 未知 `module.type` 静默消失（内容完整性风险，非安全漏洞）
- 无 `dangerouslySetInnerHTML` 命中

**状态**：部分满足（首页达标，其余未达标）｜ **风险**：Medium ｜ **动作**：修补

**验收方式**
1. `grep -rn "home.hero\|home.product-lines\|..." src/ local-wp/` → 确认「加模块需改 3~4 文件」
2. `grep -rn "schemaVersion\|schema_version" src/ local-wp/mu-plugins/` → 确认仅集中在 Page/Home
3. 孤儿清点脚本；`tests/homepage-page-view.test.mts` 保持绿

---

## M05 多语言系统

**当前实现**
**自研 i18n，未使用 next-intl**（`package.json` 依赖表无 `next-intl`）。`LOCALES = ["en","zh","es","th"]`，英文走根路径、其余走静态前缀；`src/proxy.ts` 把 `/zh/*` **rewrite** 回无前缀内部路径，并把实际语言写进 `x-fh-locale` 请求头。**不存在 `src/app/[locale]/` 路由段**。内容翻译关系**没有稳定 entityId / wpId 跨语言绑定**。Polylang **未安装**。

**证据**
- `src/lib/i18n/types.ts:8` `LOCALES`；`:19-24` `LOCALE_CONFIG`；`:26` `DEFAULT_LOCALE`；`:42` `INDEXABLE_LOCALES = ["en"]`；`:80-93` `localizedAlternates`
- `src/proxy.ts:11-41`（rewrite + header 注入）、`:59-62` matcher
- `src/lib/i18n/index.ts:18-25` `getLocale`
- `src/lib/i18n/publication.ts:35-69` `getPublicLocalesForPath`（非首页一律返回 `["en"]`）
- `src/app/layout.tsx:99-101`（`locale !== "en" && decision.status !== "public"` → `notFound()`）
- `src/components/language-switcher.tsx:77-81`（未公开语言渲染为 disabled option）
- `local-wp/wp-data/wp-content/plugins/` 实际只有 `advanced-custom-fields`、`akismet`、`hello.php` → **Polylang 未装**
- `tests/i18n-routing.test.mts:20-57`、`e2e/publication-qualification.spec.ts:9-35`

**已有能力**
- 单一 locale registry + 前缀映射 + Intl 格式化
- 显式「URL 决定语言」策略（cookie 与 Accept-Language 不会把英文 URL 重定向）
- 逐路径 × 逐语言发布门槛，**四层一致**：页面、metadata、sitemap、切换器
- 未审批译文默认 404 + `noindex`
- Insights 有「翻译级」发布门（双层）
- 缺译回退不再静默（`localized-page.ts:56-59` 打日志）

**缺失能力**
- **缺稳定跨语言 entityId / translationGroup / wpId 映射**——一旦 `/zh` 需要不同 slug，`localizedPath()` 立刻失效
- **`INDEXABLE_LOCALES` 只对一半页面生效**：`localizedAlternates` 默认 `readyLocales = ["en"]`，**20 处调用中 19 处没传第三参**（唯一传参的是 `src/app/page.tsx:31`）→ 若某路由对 `/zh` 开放，其 hreflang 会被自己的默认值清空
- 除首页外没有页面族的翻译正文审批闭环（`publication.ts:66-68` 直接 `return ["en"]`）
- 未收录语言的 404 依赖 Next 默认输出 `noindex` meta，**仓库内无代码产出** → 未验证耦合
- 缺译 UI 策略不统一（键名 vs 英文正文）
- `translateStrict` 不判空字符串

**重复功能**
- `translatorFor`（`index.ts:41`）与 `createT`（`use-t.ts:13`）同一函数两个副本
- `localizedAlternates` 与 `layout.tsx:73-85` 的 languages 构造块是同一算法两份实现
- 前缀 strip 逻辑在 `language-switcher.tsx:50` 与 `proxy.ts:36-38` 各实现一遍

**安全风险**
- locale cookie 覆盖语义偏差（`proxy.ts:45-49` 每请求写 cookie，`index.ts:18-25` 当偏好读；实际 header 永远被设置 → 属死逻辑）
- `/llms.txt` 不设 noindex 响应头，与 HTML 的预发布兜底不一致

**状态**：部分满足 ｜ **风险**：High ｜ **动作**：修补（改造成 next-intl 收益低于风险）

**核心问题一句话**：`localizedAlternates` 默认值与发布门槛脱钩，是**已存在的逻辑错误**，被 `return ["en"]` 长期掩盖；一旦放开任何页面族的 `/zh`，立刻产生「可访问但 hreflang 为空」的收录不一致。

**验收方式**
1. 静态断言：所有 `localizedAlternates(` 调用必须显式传入 `getPublicLocalesForPath(...)` 结果
2. `curl -sI /zh` → 404 + `Content-Language: zh-CN` + `X-Robots-Tag: noindex`
3. 抓 sitemap 全部 URL，断言页面 hreflang 集合 == sitemap 同路径语言集合
4. `docker exec <wp> wp plugin list` 复核 Polylang（**待核实**）

---

## M06 SEO 基础设施

**当前实现**
Canonical 与 hreflang **不是集中单点生成**：根 `layout.tsx` 生成一次，**另有 20 处页面级 `generateMetadata` 各自再生成一次并覆盖**。域名来自 `src/lib/site-url.ts` 的 `NEXT_PUBLIC_APP_URL`，未配置时 sitemap 返回空数组、robots 全禁、llms.txt 404（**fail-closed 真实生效**）。JSON-LD 仅覆盖 4 类页面（Product / ItemList / CollectionPage / Service），**无 Organization / WebSite / BreadcrumbList / FAQPage**。

**证据**
- `src/lib/site-url.ts:18-20`
- `src/app/sitemap.ts:16-17`（未配置返回 `[]`）、`:24-52`（硬编码路径清单）、`:62-68`
- `src/app/robots.ts:14-15`（未配置 → `disallow: /`）
- `src/app/layout.tsx:52-58`、`:60-85`
- **无 canonical 的页面**：`src/app/about/page.tsx:11-19`、`src/app/insights/page.tsx:20-28`
- JSON-LD：`products/wheels/[model]/page.tsx:203-227`、`products/wheels/page.tsx:283-303`、`products/wheels/flow-formed/page.tsx:109-142`、`products/ev-components/page.tsx:46-70`
- `next.config.ts:75-141` **无 `redirects()`**；重定向散在 6 个 `page.tsx` 里（`resources/*` 用 `redirect()` → 307 而非 308）

**已有能力**
- **fail-closed 三连真实生效**
- `metadataBase` 单点设为 `siteUrl`
- 轮毂目录查询参数策略清晰（筛选 noindex + canonical 指回基础目录）
- Structured data **明确不伪造 Offer/price/availability**
- 308 重定向保留 query
- 安全头集中且有单测

**缺失能力**
- **Canonical 非单点**，正确性依赖「没人重新引入第二个 generateMetadata」
- **sitemap 与 e2e 硬矛盾**：`sitemap.ts:37` 含 `/thank-you`、`:40` 含 `/gallery/finishes`，而 `e2e/site-contract.spec.ts:29-30` 断言 `not.toContain` → **必有一方错（待核实构建产物）**
- `/manufacturing` 路由存在但不在 sitemap
- Organization / WebSite / BreadcrumbList / FAQPage 全缺
- JSON-LD 无任何测试覆盖
- 410 未使用
- `NEXT_PUBLIC_APP_URL` 模块加载期求值，缺失时无启动告警

**重复功能**
- canonical/hreflang 两份实现（`layout.tsx:73-85` vs `types.ts:80-93`）
- sitemap 与 llms.txt 路径清单两份手写数组，已出现漂移
- `robots.index` 判断在至少 8 个 `generateMetadata` 里各写一遍

**安全风险**
- **实测共 14 处 `robots: { index: true, follow: true }` 硬编码**，全部绕过 `preview` 判断：
`insights/bolt-patterns/[pattern]/page.tsx:41`、`insights/bolt-patterns/page.tsx:22`、`products/wheels/[model]/page.tsx:77`、`products/ev-components/page.tsx:41`、`thank-you/page.tsx:19`、`gallery/finishes/page.tsx:28`、`fitment/[platform]/page.tsx:42`、`fitment/page.tsx:17`、`support/terms/page.tsx:14`、`support/shipping/page.tsx:14`、`support/returns/page.tsx:14`、`support/warranty/page.tsx:14`、`dealers/private-label/page.tsx:25`、`dealers/page.tsx:21`
—— 其中 `thank-you`、`gallery/finishes` 二例同时是 T-01 的收录矛盾源
- `llms.txt` 无 noindex 头，未配置域名时返回 404（AI 抓取器可能长期不重试）
- `siteUrl` fallback 是 `http://localhost:3000`

**状态**：部分满足 ｜ **风险**：High ｜ **动作**：修补 + 新增

**验收方式**
1. **先解决 sitemap 与 e2e 的矛盾**（读生产构建产物的 sitemap body 定夺）
2. 抓 30 个模板 URL，断言 `<link rel="canonical">` 存在且唯一（当前 `/about`、`/insights` 期望失败）
3. `/` 与 `/about` 至少 1 个 `application/ld+json`（当前 0）
4. 未配置 `NEXT_PUBLIC_APP_URL` 构建后 `curl -sI /robots.txt` → `Disallow: /`

---

## M07 GEO 内容结构

**当前实现**
内容层具备**证据纪律**（`needsVerification` 门控的显式警告条、`evidenceStatus`、`sourceRefs`），Insights 有 **`answer` 字段作为 answer-first 导语**。但**没有** `lastVerifiedAt`、`sourceReferences`（结构化引用列表）、`shortAnswer` 三类 GEO 字段。FAQ 只在 3 个路由以「标题+段落」渲染，**无 FAQPage schema**；llms.txt 是纯链接索引。全仓**无 `datePublished` / `dateModified`**。

**证据**
- `grep -rn "lastVerifiedAt\|sourceReferences\|shortAnswer"` → **零命中**
- `src/content/types.ts:112` / `:222` / `:481` `evidenceStatus: "supplier-stated" | "verified"`
- `src/content/types.ts:35` `Capability.evidence`（注释明说 **Not rendered**）
- `src/components/prose-article.tsx:84-86`（`guide.answer` 渲染在 H1 下方）、`:111-113`（验证警告条）
- `local-wp/mu-plugins/fenghuai-insights-authoring.php:99-100`（`fh_answer`、`fh_needs_verification`，`'default_value' => 0`）
- `src/content/faq.ts:3-8`（**PLACEHOLDER 注释**）、`:9-40`（6 条）
- FAQ 渲染三处：`dealers/page.tsx:304-315`、`products/page.tsx:300-311`、`fitment/[platform]/page.tsx:382`
- `src/components/faq-accordion.tsx:18` **定义了但生产未使用**
- `src/app/llms.txt/route.ts:25-70`（纯链接列表）

**已有能力**
- 证据分级制真实存在（`supplier-stated` / `verified`）
- 「未知即显式空槽」的渲染纪律（`pendingNote`）
- answer-first 已落地（H1 正下方）
- 工程确认警告条不可绕过（由数据字段驱动）
- llms.txt 存在且带「勿将示例当作承诺」免责

**缺失能力**
- `lastVerifiedAt` 完全缺失
- `sourceReferences` 结构化引用缺失（`sourceRef` 是自由字符串，值是 `"WP 116"` 这类内部记录号）
- `shortAnswer` 独立可摘录短答案缺失
- FAQ 无结构、无 schema，同一份 FAQ 复用到两个不同意图页面
- `FaqAccordion` 是死代码（写了未启用）
- llms.txt 无事实层
- 无 `datePublished` / `dateModified`
- `Capability.evidence` 写了但不渲染

**安全风险（真实业务风险）**
- **`needsVerification` 默认 false** → 编辑忘记勾选，警告条消失，未核验数字被当事实发布
- **`src/content/faq.ts` 仍是 PLACEHOLDER 但已上线渲染**在 `/dealers` 与 `/products`，内容涉及 MOQ / 交期 / 质保 / 贸易术语 → **未核验的商业承诺已在发布**
- `sourceRef` 是内部记录号，对外不可验证

**状态**：未实现 / 有风险 ｜ **风险**：High ｜ **动作**：新增 + 修补

**验收方式**
1. `grep -rn "lastVerifiedAt\|sourceReferences\|shortAnswer" src local-wp/mu-plugins` → 当前 0，目标每个 ≥1 且成为必填
2. `curl -s /dealers | grep -c "FAQPage"` → 当前 0，目标 ≥1
3. `grep -rn "PLACEHOLDER" src/content/faq.ts` → 目标 0
4. `curl -s /llms.txt | grep -c "Founded\|MOQ\|ISO\|capacity"` → 当前 0，目标 ≥3 条可摘录事实
5. 新增单测：`needsVerification: true` 必须输出警告条

---

## M08 产品系统

**当前实现**
「构建期事实层 + WordPress 人工批准快照」两段式：事实层是自动生成的 `src/content/wheel-catalogue.ts`（1349 型号 / 3485 配置），批准记录 `src/content/wheel-publication.json`（138 条），两者在 `src/lib/wheels/publication.ts` 的 `passesHumanApproval()` + `passesMachineGate()` 里做 AND 判定。对外只暴露 `public-catalogue.ts` 的四个函数。

**证据**
- `src/content/wheel-catalogue.ts:1-14`（头部注释）、`src/content/wheel-publication.json`（`count: 138`）
- `src/lib/wheels/publication.ts:66-92`、`:217-230`
- `src/lib/wheels/public-catalogue.ts:1-40`、`:148-169`
- `src/lib/wheels/inquiry-binding.ts:87-125`、`:136-180`
- `src/content/fitment.ts:1-28`（`verified: false` 共 11 处、`true` 0 处）
- 产品页尺寸/PCD/ET 字面量硬编码：**0 命中**

**已有能力**
- 型号→变体→规格层级成立且判定集中
- 规格事实单副本
- 服务端二次复核（客户端提交的 spec 一律丢弃重查）
- fitment 有「未核验可见标记」而非假数据
- 产品页无硬编码规格

**缺失能力**
- `src/content/products.ts:33/49/65` 的 `href` 指向 `/products/monoblock`、`/products/two-piece`、`/products/off-road`，**这三个路由不存在**
- `hasRender: false` 的占位卡 UI 分支未实现
- **图集（多图）链路未接通**：`resolveWordpressMediaCollection` 无 wheel catalogue 调用方
- 已撤下型号仍可提交询盘（`variantPending: true` 分支），缺显式「已下架」标记

**重复功能**
- 三套互不引用的产品分类：`content/products.ts`（monoblock/two-piece/off-road）、`content/product-lines.ts`（四产品线）、`wheel-catalogue.ts`（型号级）
- 批准判定实现两份（TS `passesHumanApproval` 与 PHP `fh_wheel_is_approved()`），注释自认「两边必须一致」，无自动比对

**安全风险**
- `/fh/v1/wheels` 匿名可读已发布记录；preview 仅校验 `edit_posts`（Contributor 级）
- `sitemap.ts:27` 无条件写入 `/products/wheels/forged`，而 flow-formed 与 custom-aluminum 有 indexability 闸门 → 不一致

**状态**：部分满足 ｜ **风险**：Medium ｜ **动作**：修补 + 重构（统一分类）

**验收方式**
1. `find src/app/products -type d` 应包含三个缺失目录，或改掉 `products.ts` 的 href
2. 任一上架型号：`getWheelDetailPage()` 应返回 ≥2 张图（当前断言会失败 → 证明缺失）
3. `grep -rn "verified: false" src/content/fitment.ts | wc -l` 与产品侧 `specification_status` 语义不得混用（需写进文档）

---

## M09 博客与案例

**当前实现**
文章源已从 `fh_guide` CPT 切到 **原生 `post`**，由 option `fh_guides_native_authoritative` 控制，`scripts/migrate-insights-to-native-posts.php` 负责回填。Next 通过 `/fh/v1/guides` 拿记录，`normalizeWordpressGuide()` 做发布/翻译双闸门。草稿隔离通过 `draftMode()` + `/api/preview`（带 secret）。

**证据**
- `local-wp/mu-plugins/fenghuai-guides.php:15-19`、`:219-224`、`:226-300`、`:257`（`posts_per_page => 100`）
- `fenghuai-insights-authoring.php:192`（`'category' => ['分类','text']`）
- `src/lib/wordpress/insights-contract.ts:439-447`、`:452`
- `src/app/insights/page.tsx:39`（一次性取全量）
- `src/app/insights/[slug]/page.tsx:61-71`（关联内容内存筛选）

**已有能力**
- 文章在原生 post，迁移路径明确且带 backfill 计数
- 双闸门一致拦截，旧 CPT 编辑入口已封
- 草稿隔离有 secret 且预览页 noindex
- 关联内容有确定排序规则

**缺失能力**
- **分类不是 taxonomy**，只是 post_meta 文本（实测 4 个自由文本值），无分类归档页
- **列表无分页**，WP 侧硬上限 100 篇 → 超过静默截断
- 关联内容非服务端计算
- 无「案例」维度

**重复功能**
- 本地兜底 `resources.ts` 与 CMS 两套内容并存（刻意 fail-safe，但会漂移）
- legacy CPT 与 native post 同时可读

**安全风险**
- `preview=true` 仅校验 `edit_posts`，Contributor 可读全部草稿
- **回滚开关语义不一致**：`fh_guides_authoritative=1` 而 native=0 时，前台读 legacy、后台改不了 → 死内容

**状态**：部分满足 ｜ **风险**：Medium ｜ **动作**：修补

**验收方式**
1. `wp post list --post_type=post --format=count` 与 `/fh/v1/guides` 返回数相等
2. `?preview=true` 匿名应 401
3. `wp option get fh_guides_native_authoritative` = 1 且 legacy 开关为 0
4. `grep -rn "paginat" src/app/insights/page.tsx` 应命中（当前缺失）

---

## M10 询盘系统

**当前实现**
走 **WordPress 自定义表 + CPT，不是独立 DB**。Next 侧 `store.ts` 是转发器；WP 在**显式事务**里写 `wp_fh_inquiry_key`（幂等键，主键）+ `wp_posts` + postmeta + `wp_fh_inquiry_outbox`。防垃圾由 `guard.ts` 的「Origin 白名单 + 蜜罐 + 填表时长陷阱 + 进程内 SHA-256 限流」负责。主询盘与多产品是**一对多**（`items[]` 最多 20 项）。

**证据**
- `src/lib/inquiry/store.ts:10-33`（DEC-055：WordPress 是唯一写入方）、`:262-300`
- `local-wp/mu-plugins/fenghuai-inquiries.php:270-320`（三张表）、`:1044-1160`（事务 + 幂等）、`:926-943`（`INQ-YYYYMMDD-NNNN`，故意不用 post ID）
- `src/app/api/inquiries/route.ts:38`（幂等键正则）、`:53-172`（处理顺序）、`:207-215`（GET 恒 404）
- `src/lib/inquiry/guard.ts:37-48`（蜜罐 + 时长）、`:74-92`（SHA-256 限流键）、`:94-99`（IP 6 / 邮箱 3 / 10 分钟）
- `src/lib/inquiry/schema.ts:79`（items max 20）

**已有能力**
- 事务边界是显式的，且有实测探针 `scripts/verify-inquiry-backend.py:255`（Case B 回滚断言）
- 幂等靠唯一键冲突而非「先查再插」
- 业务状态与邮件状态严格分离
- 快照冻结（`buildSnapshot()`）
- 匿名读彻底关闭（Next 404 + CPT 不公开 + meta `show_in_rest=false`）
- 一对多成立且 WP 做二次重复校验

**缺失能力**
- Next 侧 `get()`/`list()` 只读进程内 Map，`assignOwner()` 恒返回 `"unassigned"`，无持久化出口
- **隐私同意未采集**（注释明写不要求同意勾选；`store.ts:236-238` 显式 `consentedAt: undefined`）→ GDPR/PIPL 缺同意证据
- **限流是进程内存**，多实例时阈值 = 6 × 实例数
- 缺幂等键时不拒绝（降级为 at-least-once）

**重复功能**
- 邮件发送两套实现：Next `mailer.ts` **已无调用点**，真正发信在 PHP
- 校验两套（Zod + PHP 手写），字段上限靠人肉对齐
- `markDelivered()` 无调用点

**安全风险**
- **`/fh/v1/inquiries` 无速率限制**，绕过 Next 直打 WP 即可无限写入（若 8081 可外部触达则为 High）
- 回执密钥回落到 `WP_INQUIRY_SERVICE_KEY`（`receipt.ts:5-11`），轮换会同时打断两条链路
- WP 侧 email 以 postmeta 明文存储

**状态**：部分满足 ｜ **风险**：Medium（WP 端口对公网开放则 High）｜ **动作**：修补 + 新增

**验收方式**
1. `python3 scripts/verify-inquiry-backend.py` 全绿
2. 同 idempotencyKey 连发 2 次：201 + 200，库里只 1 行
3. `curl -X GET /api/inquiries` → 404
4. 同邮箱 10 分钟内第 4 次 → 429

---

## M11 邮件通知

**当前实现**
**先存后发**：WP 在事务内写询盘 + outbox，`COMMIT` 之后才发信；失败只改 `email_status`/outbox 行，**不回滚询盘**。通道优先 SMTP（PHPMailer），未配回落 Resend。重试由 **WP-Cron**（5 分钟）+ **租约制领取**驱动，退避 1/5/15/60 分钟，上限 5 次转 `failed`，另有积压告警 cron。

**证据**
- `fenghuai-inquiries.php:1150-1160`（COMMIT 后才发信）、`:1436-1443`（注释：绝不能改变「询盘已保存」）
- `:1474-1532`（SMTP 分支）、`:1534-1593`（Resend 分支）
- `:2949-3030`（`fh_inquiry_send_via_smtp`，465 SSL / 587 STARTTLS，Timeout 15）
- `:2216`（MAX_ATTEMPTS = 5）、`:1617-1622`（退避）、`:2229-2255`（cron 注册）
- `:2369-2427`（租约：`UPDATE ... WHERE ... AND (lease_owner IS NULL OR lease_expires_at<=now)`）
- `:2257-2360`（告警摘要 + 指纹去重）
- `:1600-1615`（错误脱敏：邮箱/电话/密钥三路替换）

**已有能力**
- 邮件失败 ≠ 询盘丢失，代码与注释双重保证，且有实测脚本
- 失败分类明确（未配通道 → `pending` fail-closed）
- 防重复发信靠租约原子性
- 提供商回调去重（UNIQUE + HMAC + 时间戳）
- 达到上限转 `abandoned` 并进告警统计
- 错误信息脱敏充分

**缺失能力**
- **告警只 `error_log` + `do_action`，全仓无监听者** → 空转钩子
- WP-Cron 依赖页面访问触发，若未配系统级 cron 会整体停摆（**待核实部署配置**）
- 发信层幂等不完整：SMTP 侧不回写 `Message-ID`，超时重试可能重复发信
- **无死信队列/人工重放 UI**
- 无 SMTP 连接池

**重复功能**
- Next `mailer.ts` 的 Resend 分支与 PHP 分支功能重叠，前者已死

**安全风险**
- SMTP/Resend 密钥可能来自 WP option（`wp_options` 明文）——需核对是否用 `WORDPRESS_CONFIG_EXTRA` 注入常量（**待核实**）

**状态**：已满足（核心语义）/ 部分满足（告警与重放）｜ **风险**：Medium ｜ **动作**：修补

**验收方式**
1. `wp cron event list | grep fh_inquiry` 应看到两个 tick 且 next_run 在 5 分钟内
2. 停 SMTP 提交询盘 → `email_status = failed`，outbox attempts 递增，5 次后 `next_attempt_at IS NULL`
3. 全流程 `wp post list --post_type=fh_inquiry --format=count` 只增不减

---

## M12 媒体资源

**当前实现**
本地图全部是 **WebP**（2926 个，0 个 jpg/png），18 个目录。渲染走 `next/image`（19 处）与 8 处原生 `<img>`（均写明理由）。WP 媒体通过 `remotePatterns` 白名单接入，Alt/Caption 采用「内容载荷优先、媒体库兜底」。

**证据**
- `next.config.ts:4-40`（写死 `localhost:8081` / `127.0.0.1:8081` 的 `/wp-content/uploads/**`）
- `next.config.ts:80-88`（`images: { remotePatterns, dangerouslyAllowLocalIP }`）
- **未配置** `formats` / `deviceSizes` / `minimumCacheTTL` / `qualities` → 默认只有 `webp`，**无 AVIF**
- `src/lib/wordpress/media.ts:23-33`（`alt: media.alt.trim() || wordpressMedia.alt_text.trim()`）
- `alt=""` 7 处，均为装饰图或轮播占位（带 `aria-hidden`）
- `sizes=` 41 处

**已有能力**
- 全站图片统一 WebP
- `remotePatterns` 是白名单
- Alt 有正式回退链且载荷优先（多语言图注不被英文媒体库覆盖）
- 无明显缺 alt 的内容图
- `sizes` 覆盖率高
- 媒体库批量取数避免 N+1

**缺失能力**
- 无 AVIF（通常再省 20–30%）
- 无 `minimumCacheTTL` / `deviceSizes` 调优
- 无对象存储（2926 个 WebP 进 git 与构建产物）
- 媒体↔WP 同步是单向拉取，两份物理副本无一致性校验
- 图集链路未接通（见 M08）
- `generated/`、`preview/` 与正式素材混在同一命名空间

**安全风险**
- **生产配置可能允许优化器访问内网**（`localhost` remotePatterns 写死 + `dangerouslyAllowLocalIP`）→ SSRF 面（**待核实生产 `WP_API_URL`**）

**状态**：部分满足 ｜ **风险**：Medium（生产命中则 High）｜ **动作**：修补 + 新增

**验收方式**
1. `curl -H 'Accept: image/avif' /_next/image?...` 应返回 `image/avif`（当前预期 `image/webp`）
2. 生产构建产物 `grep -o "8081" .next/server/**/*.js` 应为 0 命中
3. `find public/images -type f ! -name "*.webp" ! -name ".gitkeep"` 应为空

---

## M13 缓存与内容同步

**当前实现**
WP 在 `save_post_*` / `trashed_post` / `before_delete_post` 上以 HMAC-SHA256 签名**非阻塞 POST** 到 Next `/api/revalidate/wordpress`；Next 用 `createHmac` + `timingSafeEqual` 校验后 `revalidateTag(tag, { expire: 0 })` + 逐个 `revalidatePath`。整体是「WordPress 主动推送失效」，**没有拉取式回退，也没有失败重投**。

**证据**
- `local-wp/mu-plugins/fenghuai-content-webhooks.php:44-50`（`timeout => 0.5, blocking => false`；失败仅 `error_log`）
- `src/app/api/revalidate/wordpress/route.ts:20`（HMAC + `timingSafeEqual`）、`:33`（未签名 401）、`:71-72`
- 标签常量：`wheels-contract.ts:8`、`insights-contract.ts:3`、`pages-contract.ts:4`
- `client.ts:63`（`next: { revalidate, tags }`），默认 `revalidate: 3600`

**已有能力**
- HMAC 真实校验 + 常量时间比较 + 缺密钥 fail-closed
- 标签与失效路径集中在 contract 文件，有单测断言
- 预览与公开读取严格分离
- 超时不无限挂起

**缺失能力**
- **失败无重试**：`blocking: false` + 0.5s 超时，Next 不可用时失效**永久丢失**，等 3600s 自然过期才自愈
- 无失效结果对账（返回的 `paths` 无消费者）
- 多实例一致性未设计（当前单容器）
- 失效粒度粗（一篇文章打掉整类）
- 无签名时间戳/nonce

**重复功能**
- 签名校验两处独立实现（格式不同是有意的，但缺文档）
- 失效路径映射在三个 contract 各维护一份

**安全风险**
- `WP_PREVIEW_SECRET` 走 URL query → 落进 nginx access log（见 M14）
- 无重试是**可用性**风险：撤稿内容在 CDN/缓存里多活最长 1 小时（业务红线）

**状态**：部分满足 ｜ **风险**：High ｜ **动作**：修补

**验收方式**
1. 断网 Next 容器后发布一篇文章，恢复后 15 分钟内确认有重投记录且内容最终更新
2. 新增单测：`revalidateTag` 抛错时的行为
3. E2E 扩展「失效接口 500 后页面仍能自愈」

---

## M14 安全与权限

**当前实现**
Next 层四层防护：安全头、`/api/inquiries` 的 Origin/体积/蜜罐/限流、`/api/revalidate/*` 的 HMAC、`/api/preview` 的共享密钥。WP 层用独立服务密钥（`hash_equals`）保护询盘写入，用带时间戳的 HMAC 保护邮件回调，容器侧 `DISALLOW_FILE_EDIT` + xmlrpc 404 + 只绑 127.0.0.1。

**证据**
- `next.config.ts:94-137`；CSP `'unsafe-inline'`（`:105`，无 nonce）
- `guard.ts:80-85` 采信 `cf-connecting-ip` / `x-real-ip`；`deploy/frontend/nginx-9080.conf:14` 未剥离客户端自带的 `CF-Connecting-IP`
- `fenghuai-inquiries.php:521-530`（`hash_equals`）、`:541-575`（时间戳 + HMAC + 过期拒绝）、`:321`（UNIQUE 去重）
- `deploy/wordpress/compose.yml:66` `DISALLOW_FILE_EDIT`；`nginx-7080.conf:16-22` xmlrpc 404 + 点文件 deny；`:63` 只绑 `127.0.0.1`
- `deploy/frontend/nginx-9080.conf:9` 与 `deploy/wordpress/nginx-7080.conf:9` 双层 `X-Robots-Tag: noindex`
- `src/app/api/preview/route.ts:22` 密钥走 URL query + `!==` 比较

**已有能力**
- webhook 伪造防护：两处 HMAC 均常量时间比较，缺密钥 fail-closed
- 邮件回调**有**重放防护（时间窗 + UNIQUE）——全仓最完整的实现
- 限流键只存 SHA-256 摘要
- 日志无敏感值
- WP 服务密钥不走 query string
- 预发布双层 noindex

**缺失能力**
- 无分布式限流（进程内 Map）
- `clientAddress()` 信任链未定义（可伪造 IP 头绕过 IP 维度限流）
- CSP 允许 `'unsafe-inline'`
- 文件上传校验：应用层不接受上传，此项**不适用**

**重复功能**
- 两套并行认证（Basic 应用密码 + 服务密钥），缺「何时用哪个」的说明

**安全风险**
- **预览密钥走 URL** → 进 nginx access log 与浏览器历史；且用 `!==` 而非 `timingSafeEqual`
- **WP 后台仅 HTTP** → 登录凭据明文传输
- 限流可绕过

**状态**：部分满足 ｜ **风险**：High ｜ **动作**：修补

**验收方式**
1. `curl -sI` 逐项比对六条安全头
2. `grep "secret=" /var/log/nginx/*access.log` → 确认预览密钥**已经**在日志里（当前必然出现）
3. 伪造 `CF-Connecting-IP` 连打 10 次 → 7 次起应 429
4. 复核所有日志参数不含 body/email/token

---

## M15 CI/CD 与部署

**当前实现**
只有 CI，没有 CD。`verify.yml` 30 行：`npm ci` → `npm test` → `npm run check` → `npm audit --omit=dev`。部署是手工流程：本地打镜像 → 上传 → SHA-256 校验 → `docker load` → `compose up --no-build`。回滚靠「旧镜像 + 备份目录」人工恢复。

**证据**
- `.github/workflows/verify.yml:1-30`（`permissions: contents: read`、`timeout-minutes: 20`）
- **无 E2E 步骤**；`:24` 的 `npm test` 与 `:26` 的 `check`（内含 `npm test`）→ **单测跑两遍**
- `deploy/frontend/Dockerfile:1-38`、`Dockerfile.prebuilt:23-31`
- `deploy/frontend/compose.yml:3` 镜像 tag **硬编码日期** `fenghuai-frontend-9080:2026-10-09`；`:41` 只绑 127.0.0.1；`:46-56` healthcheck 探 `/robots.txt`；`:58-62` `no-new-privileges` + `cap_drop: ALL`
- `deploy/wordpress/compose.yml:2`、`:27` 用 **digest 固定**
- `deploy/frontend/README.md:31`「服务器只有 2 GB 内存，不得在服务器执行 next build」

**已有能力**
- CI 门禁有实质内容，`permissions` 已最小化
- 部署安全基线好（cap_drop、no-new-privileges、USER node、DB 不发布端口）
- 有 healthcheck 且被 `service_healthy` 使用
- 明确禁止在 2GB 服务器构建
- 回滚材料有实际记录

**缺失能力**
- **零 CD**：无任何 workflow 触发部署，`verify.yml` 只读权限结构上不可能部署
- **CI 无 E2E**：17 个 spec 从不进 CI
- **前端镜像 tag 不可追溯**（与 git commit 无关联）
- **无「构建产物 → 部署 → 验证」链路**（README 要求 SHA-256 校验但仓库无脚本）
- 健康检查过浅（`/robots.txt` 是静态路由）
- 无环境分层，`deploy/frontend/.env.example:1` 直接写 IP

**重复功能**
- 测试双跑（纯浪费 CI 时间）
- 两个 Dockerfile 维护两份 standalone 拷贝逻辑

**安全风险**
- 预发布全程 HTTP
- `verify.yml` 无 `concurrency`，同 PR 连续 push 会并行跑

**状态**：部分满足 ｜ **风险**：Medium ｜ **动作**：新增 + 修补

**验收方式**
1. `grep -c playwright .github/workflows/verify.yml` → 期望 ≥1
2. 前端镜像改为 `${GIT_SHA}` 或 digest
3. 新增 `scripts/deploy/verify-image.sh`
4. 回滚演练需有日志/截图证据

---

## M16 监控与备份

**当前实现**
无错误追踪（无 Sentry/APM），无外部 uptime，**无备份脚本入库**。应用侧日志是 `console.*` / PHP `error_log`，内容为路径、状态码、错误类型名——**未发现敏感值**。唯一「告警」是 WP 内部 wp-cron 驱动的询盘投递积压监测，`do_action` 后**无监听者**。

**证据**
- 全仓搜索 `sentry|uptime|prometheus|grafana|datadog|newrelic` → **零命中**
- 日志清单 9 处，均不含 body/email/token/IP/Cookie
- `fenghuai-inquiries.php:2337-2352`（告警 + 指纹去重 + `do_action('fh_inquiry_delivery_alert')`），全仓无 `add_action('fh_inquiry_delivery_alert'`
- 备份：`scripts/` 34 项中**无 backup/dump/restore**
- 备份存在证据仅来自任务记录：`work/completed/2026-10-12-staging-conversion-release.md:12`

**缺失能力**
- 无错误追踪、无外部 uptime、无告警接收人
- **只有 WP 侧有告警，Next 侧没有**
- 无备份脚本、无保留策略、无异地副本、无加密
- **无恢复演练记录**
- 日志无保留/轮转策略
- 无关联 ID（Next 询盘 id 与 WP outbox id 不贯通）

**安全风险**
- **同机备份**（`/opt/fenghuai-backups/`），磁盘故障即全失；且未见加密，备份内含 `.env`

**状态**：未实现（备份/监控主体）｜ **风险**：High ｜ **动作**：新增 + 修补

**验收方式**
1. `ls scripts | grep -iE "backup|dump|restore"` → 期望 ≥1（当前 0）
2. 备份脚本跑一次 + **恢复演练**（新容器导入 dump，`wp option get home` 与线上一致）
3. `grep -rn "fh_inquiry_delivery_alert" .` 应能找到真实监听器
4. 断掉 WP 容器 → `/products` 降级 + 3 分钟内产生可送达告警

---

## M17 AI Agent 接入

**当前实现**
`AGENTS.md` 是约 240 行的操作契约（规则优先级、渐进式上下文加载、8 条项目特有规则、完成定义）。任务生命周期是文件系统约定 `work/queued → active → completed`（34/12/86）。**Agent 没有专用写入接口**——与人类一样通过 wp-admin 或 repo 文件改内容。

**证据**
- `AGENTS.md:30-40`（规则优先级）、`:44-58`（渐进加载）、`:118-137`（归档路由）、`:141-215`（§7 项目特有规则）、`:225-236`（§8「未经明确授权，不要 commit，不要 push」）、`:238-247`（§9 完成定义）
- `SKILLS/` 161 文件、22 个技能目录
- **无 mutation 端点**：`grep register_rest_route` 全部为只读 + 询盘 POST
- **无审计日志**（全仓无「谁改了什么」的实现）
- `grep .husky|pre-commit` 无命中 → 契约无技术强制

**已有能力**
- 契约质量高、可执行
- 明确红线（不可逆先问、未授权不 commit）
- 任务生命周期有真实数据支撑
- 自带 `security-audit` 与 `open-code-review` 技能
- 内容写入继承 WP 原生 capability

**缺失能力**
- 无受控写入接口（无 scoped token、无 diff 预览端点）
- 无审计日志（WP revision 存在但无 Agent 身份标识）
- 权限边界只写在文档，无技术强制
- 任务状态无机器校验（自由文本 `- 状态：`）
- `docs/runbooks/` 与 `docs/audit/` 曾为空目录

**重复功能**
- 三份 Agent 入口文档并存：`AGENTS.md`、`CLAUDE.md`、`AGENT-OPERATING-GUIDE.md`

**安全风险**
- 无审计轨迹 → 误改无法定位责任人与影响范围
- 任何读不到 `AGENTS.md` 的工具不受约束

**状态**：部分满足 ｜ **风险**：Medium ｜ **动作**：修补 + 新增

**验收方式**
1. `git ls-files | grep local-credentials` → 必须为空
2. Agent 独立账号 + 操作日志（账号 + 时间戳 + 前后值）
3. 任务卡改 frontmatter + `scripts/verify-work-tasks.mjs` 校验三态

---

## M18 性能与质量

**当前实现**
17 个 Playwright spec（93 个 `test()`）+ 16 个 Node 原生 test 文件。a11y 用 `@axe-core/playwright`，在两个 spec 做 WCAG 2.0/2.1 A+AA 扫描：31 条模板 × 4 视口。**无任何 CWV 测量，无性能预算。**

**证据**
- E2E 覆盖：`astryx-sitewide-p5`（31 模板×4 视口）、`astryx-product`（17）、`site-contract`（15）、`inquiry`（15）、`wheel-filter`（7）、`accessibility`（12）等
- 单测关键是契约测试：fail-closed、路径穿越拒绝、缓存失效路径断言
- `playwright.config.ts:15-16`（`forbidOnly`、CI retries=2）、`:35-42`（`WP_MODE=mock` 隔离 + `reuseExistingServer: false`）
- `grep web-vitals|lighthouse|cwv` → **零命中**；devDeps 无 `web-vitals`、无 `lighthouse`

**已有能力**
- 覆盖率在同类站点里属高水平（首页、产品、博客、询盘、法律、工具、多语言全有 E2E）
- a11y 不是装饰（31 模板 × 4 视口 + 键盘 + 200% 缩放）
- 询盘 E2E 覆盖失败路径（429/422/DB 失败/邮件失败）
- 单测有真契约测试
- mock 隔离与 `reuseExistingServer:false` 防误跑

**缺失能力**
- **CWV 完全空白**（无 LCP/INP/CLS，无 RUM，无 Lighthouse CI）
- 无性能预算（bundle / 图片 / JS 体积上限）
- **E2E 不在 CI 里**
- a11y 缺口：31 模板清单不含动态筛选组合状态
- 无视觉回归基线（截图不比对）
- `playwright.p3.config.ts` 是临时配置

**重复功能**
- 两份 playwright 配置
- `/`、`/request-a-quote`、`/insights` 等 7 页被两个 spec 双重覆盖

**状态**：部分满足 ｜ **风险**：Medium ｜ **动作**：新增 + 修补

**验收方式**
1. `grep -c playwright .github/workflows/verify.yml` → 期望 ≥1
2. 引入 `web-vitals` 或 Lighthouse CI，对 4 条 URL 设阈值（LCP < 2.5s、INP < 200ms、CLS < 0.1）
3. 加 bundle 预算断言
4. axe 扫描扩展到「应用筛选后」状态

---

## 跨模块共性结论（四条）

1. **「写了但没接线」**
   `fenghuai-inquiries.php:2351` 的 `do_action` 无监听者；`revalidate/route.ts:74` 返回的 `paths` 无消费者；`deploy/wordpress/README.md` 要求的 SHA-256 校验无脚本；`FaqAccordion` 写好未启用；`local-wp` 的 barrel 导出无人使用。**骨架搭好，回路没闭合。**

2. **「契约在文档、缺在系统」**
   `AGENTS.md:227-229` 的 commit/push 禁令无 hook 强制；回滚流程无脚本；Agent 权限边界无技术实现；`schemaVersion` 只覆盖 1 个内容域。

3. **「默认值兜底掩盖逻辑缺口」**
   `publication.ts:66-68` 的 `return ["en"]`、`localizedAlternates` 的 `INDEXABLE_LOCALES` 默认值、`needsVerification` 默认 false、`index: true` 硬编码——四处都是**人工开关默认放行**。在 AI 会把这些内容当事实引用的场景下，应统一改为**默认拒绝**。

4. **「预发布态当生产用」**
   `deploy/*/.env.example` 都是 HTTP + 裸 IP；`AGENTS.md` 承认正式平台未定；WP 后台明文 HTTP。**当前所有「已满足」都只对预发布成立。**

---

## 待核实清单（不下结论）

1. sitemap 构建产物实际含哪些路径（`/thank-you`、`/gallery/finishes` 是否真在 xml 里）
2. `/zh` 未收录时是否真的输出 `name="robots" content="noindex"`（e2e 依赖但源码无出处）
3. WordPress 是否装 Polylang（仅读到文件系统，未跑 `wp plugin list`）
4. `localizedAlternates` 19 处不传第三参的运行时后果（依赖 Next metadata 合并语义，未实测）
5. `JSON-LD` 里相对路径 URL 是否被 Google 接受
6. `local-wp/docker-compose.yml` 是否设 `DISABLE_WP_CRON`
7. WP 8081 是否对公网暴露（决定 M10 风险等级）
8. SMTP/Resend 密钥是否走常量而非 WP option
9. 生产 `WP_API_URL` 是否非 localhost（决定 M12 SSRF 面）
10. `local-wp/local-credentials.txt` 是否已入库
11. 生产环境是否已有仓库外的 uptime / 日志聚合

---

## 审计基线声明

- 审计时工作区有 **20+ 文件未提交**（含 `local-wp/mu-plugins/*.php`、多个 `src/app/**/page.tsx`、`e2e/*.spec.ts`）→ 本报告描述的是**工作区状态**，不完全等于 HEAD `3d8a25e`
- 全仓搜索与 `grep` 类结论仅代表**代码文本**层面；运行时行为以实际执行为准
- 本报告**未读取**任何 `.env` / `local-credentials.txt` 的实际值，未发起任何网络请求或部署操作
- 仓库内已有 `outputs/audit-v3/` 前次审计结论，本轮**未采信**，全部由源码独立复核
