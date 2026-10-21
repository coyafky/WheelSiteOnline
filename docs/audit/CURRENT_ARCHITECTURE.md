# 当前架构（从代码还原）

还原日期：2026-10-17
还原方法：只读静态审计，18 个模块四路并行取证；每条结论可追到 `文件:行号`
审计基线：HEAD `3d8a25e` + 工作区未提交改动
差距与改造建议见 [`../audit/GAP_ANALYSIS.md`](../audit/GAP_ANALYSIS.md)

> 本文只描述**代码当前是什么**，不写"应该是什么"。
> 三种状态：**已实现**（代码或数据存在）/ **已设计**（契约已定未接线）/ **待确认**（依赖外部事实或运行时验证）。

---

## 1. 系统形态

单仓（非 monorepo）的 **Next.js 16 App Router + Headless WordPress** 独立站。

```
┌─────────────────────────────────────────────────────────────┐
│ 访客浏览器                                                    │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTPS（当前预发布为 HTTP :9080）
┌───────────────▼─────────────────────────────────────────────┐
│ Nginx（deploy/frontend/nginx-9080.conf）                     │
│  X-Robots-Tag: noindex ｜ X-Real-IP / X-Forwarded-For        │
└───────────────┬─────────────────────────────────────────────┘
                │ 127.0.0.1:9081
┌───────────────▼─────────────────────────────────────────────┐
│ Next.js 16（standalone, Node >=24）容器                       │
│  ├─ src/proxy.ts        语言前缀 rewrite + x-fh-locale       │
│  ├─ src/app/**          页面路由 + SEO metadata              │
│  ├─ src/lib/wordpress/  唯一 CMS 接入层                       │
│  ├─ src/lib/inquiry/    询盘转发 + 防垃圾                     │
│  └─ src/lib/wheels/     轮毂发布判定（构建期事实层）           │
└──────┬──────────────────────────────────┬───────────────────┘
       │ 只读 GET（Basic WP_API_TOKEN）    │ POST /fh/v1/inquiries
       │ 写 POST（X-FH-Service-Key）       │ （服务密钥）
┌──────▼──────────────────────────────────▼───────────────────┐
│ WordPress（PHP 8.3 / Apache）容器，仅 127.0.0.1:7081          │
│  ├─ 4 CPT + 2 taxonomy + 6 REST 路由                         │
│  ├─ 7 个 mu-plugin（5711 行，schema 唯一所有者）              │
│  └─ 询盘：自定义表 + 事务 outbox + PHPMailer/Resend           │
└──────┬──────────────────────────────────────────────────────┘
       │
┌──────▼──────────┐     ┌──────────────────────────────┐
│ MySQL 8.0       │     │ WP → Next 缓存失效推送         │
│ （内容 + 询盘）  │     │ HMAC POST /api/revalidate     │
└─────────────────┘     └──────────────────────────────┘
```

**关键取舍**：内容与询盘**同一个 MySQL 库**（DEC-055），WordPress 是询盘唯一写入方；Next 只做转发，不直连数据库。

---

## 2. 技术栈实况

| 层 | 实际使用 | 与 V3.0 目标的差异 |
|---|---|---|
| 框架 | Next.js 16.4.0 + React 19.2.4 | — |
| 运行时 | Node `>=24`（`.nvmrc` = 24） | — |
| 构建输出 | `output: "standalone"` + Docker | — |
| 样式 | **三套并存**：`@astryxdesign`（主题生成 CSS）+ Tailwind v4 + `shadcn/tailwind.css` | 目标只要 Tailwind + shadcn |
| 死依赖 | `@stylexjs/stylex` 在 dependencies 但 `src/` 零引用 | — |
| 校验 | `zod` **仅用于询盘**；CMS 响应用手写 `is*()` | 目标要求 Zod 边界 |
| 多语言 | **自研 i18n**（`src/lib/i18n/` + `src/proxy.ts`），**未用 next-intl** | 目标写 next-intl |
| CMS | Headless WordPress + REST（`/wp/v2` + 自定义 `/fh/v1`） | — |
| 多语言内容 | **未装 Polylang Free**；靠 WP 独立 Page + 翻译字段 | 目标写 Polylang |
| 结构化字段 | ACF Free（**只有 1 个字段组**，挂在原生 post）+ 大量 `register_post_meta` | — |
| 业务库 | WordPress MySQL 同库（无 Prisma） | 目标允许 Prisma（"仅在需要时"） |
| 邮件 | WP 侧 PHPMailer（SMTP）优先，回落 Resend；Next 侧 `mailer.ts` **已死** | — |
| 缓存 | Next `fetch` + `next.tags` + `revalidateTag`，默认 3600s | — |
| 测试 | Node `--test`（16 个 `.test.mts`）+ Playwright（17 spec / 93 test） | — |
| CI | GitHub Actions `verify.yml`（30 行，无 E2E、无 CD） | 目标含 CD |
| 监控 | **无**（无 Sentry / uptime / 备份脚本） | 目标含 Uptime Kuma + 备份 |

---

## 3. 目录与分层

```
WordpressWheelSIte/
├── src/
│   ├── app/              路由（App Router，无 [locale] 段）
│   ├── components/       72 个组件，按业务域分目录
│   ├── content/          ★ 类型化内容层 + 构建期事实数据
│   ├── lib/
│   │   ├── wordpress/    ★ 唯一 CMS 接入层（22 个文件）
│   │   ├── inquiry/      询盘域（8 个文件）
│   │   ├── wheels/       轮毂发布判定
│   │   └── i18n/         ★ 自研多语言
│   ├── theme/            Astryx 主题源
│   └── types/
├── local-wp/             ★ WordPress schema 源（mu-plugins 进 git，wp-data 忽略）
├── deploy/               frontend + wordpress 两套 compose/nginx
├── e2e/  tests/          93 个 E2E + 16 个单测
├── scripts/              47 个运维/导入/校验脚本（无 npm 入口）
├── assets/  resources/   原始资料与调研过程
├── outputs/              交付证据与报告
├── work/                 任务生命周期 queued/active/completed
├── SKILLS/               22 个工程技能
├── PAGE-SPECS/           页面施工规格
├── archive/              已被替代的正本（不指导当前实现）
└── docs/                 ★ 架构与审计文档（本目录）
```

**分层纪律**：`src/content/` 是类型化内容缝，展示组件**不耦合 WordPress 原始响应**。经实测：`src/app` 与 `src/components` 通过 `@/lib/wordpress/*` 深路径导入 44 次，**0 处组件直接 `fetch` WordPress**。

---

## 4. CMS 接入层（`src/lib/wordpress/`）

### 4.1 出口唯一

`client.ts`（318 行）是唯一 CMS 访问点：

| 函数 | 行为 |
|---|---|
| `getWpConfig()`（`:16-24`） | `baseUrl && WP_MODE === "live"` 才 live，否则 mock 返回 `null` |
| `wpRead()`（`:86-131`） | GET + 8s 超时 + `next: { revalidate: 3600, tags }`；`!ok` → `console.error` + `null`，**无重试** |
| `wpWrite()`（`:172-292`） | POST 到 `/fh/v1/*`，10s 超时，服务密钥在 header，失败分 4 类 |
| `getWpRestRoot()`（`:139-169`） | 从 `/wp/v2` 反推 `/wp-json` |

**关键事实**：读路径**没有统一错误模型**（只返回 `null`），写路径有 `WpWriteFailureReason`。同一文件内两套标准。

### 4.2 内容域 adapter

22 个文件，每个内容域一个 adapter：about / homepage / capabilities / safety-tires / insights / pages / wheels / product-lines / legal / custom-aluminum / ev-components / flow-formed / forged-wheel / media / conversion-pages。

校验方式是手写类型守卫，例如 `about.ts:13-19` 的 `isAboutContent`（只验 key 存在且是 object）→ **契约漂移只能靠页面渲染时崩**。

### 4.3 缓存标签

三个常量分散在各 contract 文件：
- `pages-contract.ts:4` → `site-pages`
- `wheels-contract.ts:8` → `wheel-publication`
- `insights-contract.ts:3` → `insights-guides`

**无集中登记表**；新增内容域容易漏注册。

---

## 5. WordPress 内容模型（`local-wp/mu-plugins/`，7 文件 5711 行）

### 5.1 实体

| 类型 | 标识 | rest_base | 说明 |
|---|---|---|---|
| CPT `wheel_model` | `fenghuai-wheels.php:30` | `wheel-models` | 轮毂型号，后台可见 |
| CPT `fh_guide` | `fenghuai-guides.php:15` | `fh-guides` | **迁移期只读回滚源**，`show_ui: false` |
| CPT `fh_inquiry` | `fenghuai-inquiries.php:39` | — | 询盘，`show_in_rest` 关闭 |
| 原生 `post` | `fenghuai-insights-authoring.php:16` | `posts` | **Insights 真正编辑载体** |
| Taxonomy `wheel_diameter` | `fenghuai-wheels.php:31` | `wheel-diameters` | 非层级 |
| Taxonomy `wheel_process` | `fenghuai-wheels.php:32` | `wheel-processes` | 非层级 |

### 5.2 字段策略

- **只有 1 个 ACF 字段组**：`group_fh_insights_structured`（`fenghuai-insights-authoring.php:18`），挂在原生 post，`show_in_rest: 0`
- 其余全部 `register_post_meta`：
  - **Pages 12 个**（`fenghuai-pages.php:54-70`）：`fh_page_key` / `fh_publication_status` / `fh_content_json` / `fh_content_by_locale_json` / `fh_seo_title` / `fh_seo_description` / `fh_seo_by_locale_json` / `fh_locale_status_json` / `fh_page_media` / `fh_page_locale` / `fh_translation_group` / `fh_page_schema_version`
  - **Wheels 决策 4 组 + 事实快照 12 个**（`fenghuai-wheels.php:46`、`:99-115`）
  - **Inquiries**：`business_status` / `assigned_to` / `internal_note` / `email_status` / `email_error` / `variant_pending`

### 5.3 REST 端点

| 路由 | 方法 | 权限 |
|---|---|---|
| `fh/v1/pages` | GET | `__return_true`（preview 分支校验 `edit_pages`） |
| `fh/v2/pages` | GET | 同上 |
| `fh/v1/guides` | GET | `__return_true`（preview 校验 `edit_posts`） |
| `fh/v1/wheels` | GET | `__return_true`（preview 校验 `edit_posts`） |
| `fh/v1/inquiries` | POST | `X-FH-Service-Key` + `hash_equals`，未配置时 503 |
| `fh/v1/email-events` | POST | HMAC + 时间戳（300s 窗口）+ UNIQUE 去重 |

### 5.4 发布门槛（双条件，两处实现）

- WordPress 侧：`post_status === 'publish'` **且** `fh_publication_status === 'approved'`（`fenghuai-guides.php:219-224`）
- Next 侧：同一判断（`pages-contract.ts:107-109`、`insights-contract.ts:439-447`）
- **schema 版本检查**：`fh_page_schema_version !== 1` → 直接判 `unpublished`（`fenghuai-pages.php:152-155`），不静默降级

### 5.5 同一事实存多份（已确认 5 处）

1. 产品线卡片 `image`/`href`：`product-lines.ts:46` + `homepage-hero.ts:68` + `fenghuai-pages.php:41`（前两处有 TS 比对，PHP↔TS 无自动化）
2. Insights 双源双开关：`fh_guide` CPT 与原生 `post` 同时可读，两个 `authoritative` 开关
3. Wheel 三份：WP CPT + `fh/v1/wheels` + 构建期快照 `wheel-publication.json`（DEC-052）
4. 首页 H01 两份组件：`home/hero/home-hero.tsx`（活跃）vs `sections/home-hero.tsx.retired`
5. Pages v1/v2 双读（`pages.ts:20-67`）

---

## 6. 多语言（自研，非 next-intl）

### 6.1 路由形态

```
英文：/products/wheels              （无前缀，默认语言）
中文：/zh/products/wheels           （静态前缀）
西语：/es/...    泰语：/th/...
```

`src/proxy.ts` 把 `/zh/*` **rewrite** 回无前缀内部路径，并把实际语言写进 `x-fh-locale` 请求头 → **一套 `app/` 目录 + 前缀改写**，不存在 `src/app/[locale]/` 路由段。

### 6.2 四层一致的门槛

同一份 `getPublicLocalesForPath(path)`（`publication.ts:35-69`）被四处消费：

| 消费点 | 位置 |
|---|---|
| 页面渲染（未公开 → 404） | `layout.tsx:99-101` |
| metadata（canonical/hreflang） | `layout.tsx:60-85` |
| sitemap | `sitemap.ts:62-68` |
| 语言切换器 | `language-switcher.tsx:77-81` |

**当前 `getPublicLocalesForPath` 对除首页外一律 `return ["en"]`**（`publication.ts:66-68`）→ 其余页面族尚无翻译审批闭环。

### 6.3 已知缺陷

`localizedAlternates(path, locale, readyLocales = INDEXABLE_LOCALES)` 的默认值是 `["en"]`，而**20 处调用中 19 处没传第三参**（唯一传参的是 `src/app/page.tsx:31`）→ 一旦某路由对 `/zh` 开放，其 hreflang 会被默认值清空。

### 6.4 内容翻译关系

- 首页：独立 WordPress Page，按 `key` + `locale` 取（`pages.ts:20-68`）
- Insights：同一条 post 记录里的 `translations_json` 字典（`insights-contract.ts:17-28`）
- 其余：英文 slug 直通
- **没有稳定的跨语言 `entityId` / `wpId` 映射**

---

## 7. 内容层（`src/content/`）

### 7.1 两段式产品模型

```
构建期事实层  wheel-catalogue.ts     1349 型号 / 3485 配置（自动生成）
                    ↓ AND
人工批准快照  wheel-publication.json  138 条（WP 导出，DEC-052）
                    ↓
对外四接口    public-catalogue.ts    页面/sitemap/询盘一律只调这四个
```

`src/lib/wheels/publication.ts:66-92` 的 `passesHumanApproval()` + `passesMachineGate()` 是唯一判定点。

### 7.2 页面模块系统（只有首页）

`src/app/page.tsx:44-58` 硬编码 `switch (module.type)` 五分支，**无 default**。5 个模块 `required: true`，中段（H02/H03/H04）可在 order 20/30/40 间置换，H01 恒等 10、H05 恒等 50。

其余 11 个 CMS 页面是整体 JSON blob，无模块层。

### 7.3 孤儿与死代码

| 孤儿 | 位置 | 状态 |
|---|---|---|
| `src/components/ui/button.tsx` | `grep 'from "@/components/ui'` = 0 | 零引用 |
| `sections/home-hero.tsx.retired` | 与 `home/hero/home-hero.tsx` 同名 | 退役未删 |
| `WheelStripSection` | `wheel-strip-section.tsx:24` | 零引用 |
| `homepage-hero.ts` / `process.ts` / `capabilities.ts` | `src/content/` | 零引用 |
| `FaqAccordion` | `faq-accordion.tsx:18` | 写好未启用 |
| `src/lib/wordpress/index.ts` barrel | 15 个导出 | 使用 0 次 |
| `products.ts` 的 `productFamilies` | href 指向 3 个不存在的路由 | 死数据 |
| `src/lib/inquiry/mailer.ts` | `send()` 无调用点 | 死代码 |
| `markDelivered()` | `store.ts:371-379` | 无调用点 |

---

## 8. 询盘流程（端到端）

```
表单（inquiry-form.tsx）
  │ 客户端生成 idempotencyKey（32-64 位）
  │ 蜜罐 website 字段 + 填表时长
  ▼
POST /api/inquiries（route.ts，Node runtime，16KB 上限）
  │ ① Origin 白名单  ② 体积双重校验  ③ 蜜罐/时长陷阱
  │ ④ Zod validate   ⑤ 进程内 SHA-256 限流（IP 6 / 邮箱 3 / 10min）
  │ ⑥ bindWheelEnquiryItems（服务端重查规格，丢弃客户端 spec）
  ▼
POST /fh/v1/inquiries（X-FH-Service-Key）
  ▼
WordPress（fenghuai-inquiries.php:1044-1160）
  START TRANSACTION
    ① INSERT wp_fh_inquiry_key（idempotency_key 主键）→ 冲突则 ROLLBACK + 返回既有记录
    ② wp_insert_post（fh_inquiry CPT）
    ③ 写 postmeta（items JSON / context / 快照）
    ④ INSERT wp_fh_inquiry_outbox（status=pending）
  COMMIT
  ▼（COMMIT 之后才发信，失败不回滚）
fh_inquiry_dispatch_email()
  ├─ SMTP（PHPMailer，465 SSL / 587 STARTTLS，Timeout 15）
  └─ 未配 SMTP → Resend HTTP
  ▼
失败 → outbox 退避 1/5/15/60 分钟，最多 5 次 → failed → 告警 cron
```

**三张表**：`wp_fh_inquiry_key`（幂等键）、`wp_posts`+postmeta（询盘本体）、`wp_fh_inquiry_outbox`（事务发件箱）。

**询盘号**：`INQ-YYYYMMDD-NNNN`，NNNN 取幂等键表自增序号，故意不用 `wp_posts.ID`（避免泄露文章总数）。

**匿名读**：Next `GET /api/inquiries` 恒 404；CPT `show_in_rest=false` + `public=false`；meta `auth_callback` 独立。

---

## 9. SEO / GEO

### 9.1 已实现

- `metadataBase` 单点设为 `siteUrl`（`layout.tsx:57`）
- **fail-closed 三连**：未配 `NEXT_PUBLIC_APP_URL` → sitemap `[]`、robots `disallow: /`、llms.txt 404
- 轮毂目录查询参数策略：筛选 → `noindex` + canonical 指回基础目录；分页 → canonical 带 `?page=N`
- JSON-LD 四类：`Product`（不含 Offer）、`ItemList`、`CollectionPage`、`Service`
- `draftMode()` + preview secret 隔离草稿

### 9.2 未实现

- Canonical 非单点（layout 一次 + 20 处页面级覆盖）；`/about`、`/insights` 列表无 canonical
- 无 `Organization` / `WebSite` / `BreadcrumbList` / `FAQPage`
- 无 `datePublished` / `dateModified`
- GEO 三字段（`lastVerifiedAt` / `sourceReferences` / `shortAnswer`）全缺
- llms.txt 是纯链接索引，无事实层

### 9.3 已存在的矛盾（待定夺）

`sitemap.ts:37` 含 `/thank-you`、`:40` 含 `/gallery/finishes`，
而 `e2e/site-contract.spec.ts:29-30` 断言 `not.toContain` → **必有一方错**。

---

## 10. 安全现状

| 面 | 实现 | 缺口 |
|---|---|---|
| 安全头 | `next.config.ts:94-137`，六条头 + 条件化 HSTS | CSP `script-src 'unsafe-inline'` |
| 询盘限流 | `guard.ts` 进程内 Map | 多实例失效；IP 头信任链可伪造 |
| Webhook 验签 | HMAC + `timingSafeEqual`，缺密钥 fail-closed | 无时间戳/nonce |
| 服务密钥 | header + `hash_equals`，不走 query | WP 侧无速率限制 |
| 预览密钥 | `/api/preview` 共享密钥 | **走 URL query → 落 nginx 日志**；用 `!==` 非常量时间 |
| WP 容器 | `DISALLOW_FILE_EDIT` + xmlrpc 404 + 只绑 127.0.0.1 | 后台仅 HTTP |
| 预发布 noindex | nginx 两层 `X-Robots-Tag` | — |
| 凭证 | 只提交 `.env.example` | `local-wp/local-credentials.txt` 存在于本机 |
| 日志 | 9 处日志点均无 body/email/token/IP | 无关联 ID |

---

## 11. 部署与运维现状

2026-10-20 新加坡实例另有一套临时公开环境：Next.js、WordPress 与 MySQL
已在 Docker 中运行，应用端口仅绑定 `127.0.0.1:9081`、`127.0.0.1:7081`。
此环境与下表所述旧 `9080/7080` 预发布实例并存。公网边缘入口现运行
`deploy/edge/` 的 Caddy，向前端及 CMS 反代；`@`、`www`、`cms` 三个域名的受信任证书由 Caddy 自动管理。主站全站暂设 `noindex`，sitemap 暂不公开；用户要求先展示后，`/dealers`、`/insights` 及原先屏蔽的子路径已恢复 200。`www` 301 跳转至主域名。历史联调实例仍以其原记录为准。

| 项 | 现状 |
|---|---|
| 环境 | 预发布 `:9080 → :9081 → 容器:3000`；WP `:7080 → :7081` |
| 构建 | 本地打镜像（服务器 2GB 禁 build），上传 SHA-256 校验 → `docker load` → `compose up --no-build` |
| 镜像固定 | WP 用 **digest**；前端用**硬编码日期 tag** `2026-10-09`（不可追溯到 commit） |
| 容器加固 | `cap_drop: ALL`、`no-new-privileges`、`USER node`、DB 不发布端口 |
| 健康检查 | 只探 `/robots.txt`（静态路由，DB/CMS 挂了照样 200） |
| CI | `verify.yml` 30 行：`npm ci` → `npm test` → `npm run check` → `npm audit` |
| CD | **无** |
| 回滚 | 人工（旧镜像 + `/opt/fenghuai-backups/<时间戳>/`） |
| 备份 | 仓库内**无脚本**；执行记录仅见于任务卡 |
| 监控 | **无** error tracking / uptime / 日志聚合 |
| 告警 | 仅 WP 侧询盘积压 → `do_action('fh_inquiry_delivery_alert')`，**无监听者** |

---

## 12. Agent 工作契约现状

- 规则源：`AGENTS.md`（约 240 行）→ `CLAUDE.md`（工具入口）→ `AGENT-OPERATING-GUIDE.md`（操作提示词）
- 任务生命周期：`work/queued`（34）→ `work/active`（12）→ `work/completed`（86），状态是 markdown 里的自由文本 `- 状态：`
- 技能：`SKILLS/` 161 文件 / 22 个技能目录（含 `security-audit`、`open-code-review`、`fenghuai-engineering-workflow`）
- **无受控写入接口**（无 `/mutations` 端点）
- **无审计日志**（WP revision 存在但无 Agent 身份标识）
- **无技术强制**（无 husky / pre-commit / CI 校验）

---

## 13. 测试现状

| 层 | 数量 | 覆盖 |
|---|---|---|
| 单测（`.test.mts`） | 16 个文件 | 询盘契约、WP 契约（pages/wheels/insights）、i18n 路由、首页模块、安全头、筛选、偏距计算 |
| E2E（Playwright） | 17 spec / 93 test | 31 模板 × 4 视口、产品目录/详情、询盘全链路、筛选、a11y（WCAG 2.0/2.1 AA）、多语言发布资格 |
| a11y | 2 spec | 31 模板 × 4 视口 axe 扫描 + 键盘 + 200% 缩放 |
| CWV | **0** | 无 LCP / INP / CLS 测量，无性能预算 |

**CI 不跑 E2E**（`verify.yml` 无 playwright 步骤）。

---

## 14. 待确认项（需要运行时或外部事实）

1. sitemap 构建产物实际内容（`/thank-you`、`/gallery/finishes`）
2. `/zh` 未收录时是否真输出 `noindex` meta
3. Polylang 是否装（未跑 `wp plugin list`）
4. `DISABLE_WP_CRON` 是否配置
5. WP `:8081` 是否对公网暴露
6. SMTP / Resend 密钥来源（常量 vs WP option）
7. 生产 `WP_API_URL` 是否 localhost（决定 SSRF 面）
8. 生产环境是否已有仓库外的 uptime / 日志聚合
9. 服务器 `/opt/fenghuai-backups/` 的实际内容与保留策略
