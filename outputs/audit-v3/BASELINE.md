# Wave 0 · 基线锚定

> 采集时间：2026-10-17 13:14–13:22 (Asia/Shanghai)
> 采集方式：本机实跑，只读操作
> **本文件是后续五个 Subagent 的唯一事实源。若 Subagent 报告与本文件冲突，以本文件为准，并把冲突本身记为发现。**

---

## 1. 运行时与工具链

| 项 | 值 | 证据 |
|---|---|---|
| Node.js | **v24.15.0** | E5 实跑 |
| npm | **11.11.0** | E5 实跑 |
| `.nvmrc` | `24` | E2 |
| `package.json` engines | `node >=24` | E2 |
| Next.js | **16.4.0**（Turbopack 构建） | E1 + E5 |
| React / React DOM | **19.2.4** | E1 |
| TypeScript | **5.9.3** | E1 |
| ESLint | **9.39.4**（flat config） | E1 |

---

## 2. Git 状态

| 项 | 值 |
|---|---|
| 当前分支 | **`codex/full-site-current-20261012`** |
| HEAD | **`3d8a25e`** docs: 重整项目文档与开发流程 |
| 提交总数 | 14 |
| **未提交改动总数** | **177**（修改 111 + 未跟踪 66） |

未提交改动按目录分布（Top）：

| 目录 | 改动数 |
|---|---|
| `src/app` | 36 |
| `src/lib` | 18 |
| `src/components` | 18 |
| `outputs/reports` | 16 |
| `src/content` | 11 |
| `work/completed` | 9 |
| `resources/research` | 5 |
| `local-wp/mu-plugins` | 4 |

> ⚠️ **审计含义**：`src/app` 有 36 处、`src/lib` 有 18 处未提交改动，意味着**本机工作区代码 ≠ 任何已提交状态**。所有 Subagent 的 E1 证据描述的是「工作区现状」，不等于「仓库已固化的状态」。这一点必须在 FINAL_REPORT 里声明。

---

## 3. 五个命令实跑结果（E5）

| 命令 | 退出码 | 结果 | 耗时 |
|---|---|---|---|
| `npm test` | **0** | **68 / 68 通过**，0 fail / 0 skip | 4.4s |
| `npm run lint` | **0** | 零输出（无 error、无 warning） | ~8s |
| `npm run typecheck` | **0** | 零错误 | ~13s |
| `npm run build` | **0** | **零告警**，192 页生成成功 | **57.5s** |
| `npm run theme:check` | 未单独跑 | 已包含在 `npm run check` 内 | — |

### 3.1 构建细节（重要）

```
▲ Next.js 16.4.0 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 115ms
✓ Compiled successfully in 3.7s
  Finished TypeScript in 13.6s
✓ Generating static pages (192/192) in 34.5s
real 57.52 / user 17.95 / sys 6.99
```

**⚠️ 关键事实：全部 46 个路由标记为 `ƒ`（Dynamic，服务端按需渲染），只有 `/robots.txt` 与 `/sitemap.xml` 是 `○`（Static）。**

- SEO 影响：**正面**——所有页面 HTML 都是服务端产出，正文可被爬虫读取。
- 性能/缓存影响：**需评估**——全部 Dynamic 意味着每次请求都可能回源，缓存策略是否兜住，是 M13/M18 的核心问题。
- 另外日志里出现 **`ƒ Proxy (Middleware)`** —— 已定位：**`src/proxy.ts`**（3,373 字节，导出 `export function proxy(request: NextRequest)`，Next 16 的 middleware 命名）。**该文件当前未提交（在 177 项改动内）**，需 Agent D 审计其逻辑（是否做 locale 重定向 / noindex 注入）。

### 3.2 单元测试分布（68 用例 / 16 文件）

| 文件 | 用例 |
|---|---|
| `inquiry-contract.test.mts` | 13 |
| `wordpress-insights.test.mts` | 12 |
| `homepage-page-view.test.mts` | 6 |
| `wordpress-wheels.test.mts` | 6 |
| `i18n-routing.test.mts` | 5 |
| `wordpress-pages.test.mts` | 5 |
| `offset-calculator.test.mts` | 4 |
| `security-headers.test.mts` | 4 |
| `flow-formed-i18n.test.mts` | 3 |
| `astryx-feedback-shell-probe.test.mts` | 2 |
| `wheel-catalogue-i18n.test.mts` | 2 |
| `wheel-query.test.mts` | 2 |
| 其余 4 个文件各 1 | 4 |

**观察**：`src/lib/inquiry/store.ts`（420 行，最大的业务文件）**没有专属测试文件**——inquiry 的 13 个用例在 `inquiry-contract.test.mts` 里，是否覆盖 store 的事务/幂等逻辑，需 Agent B 确认。

### 3.3 E2E 规模（**未实跑**）

| spec | 用例数 |
|---|---|
| `astryx-product.spec.ts` | 16 |
| `inquiry.spec.ts` | 15 |
| `site-contract.spec.ts` | 15 |
| `accessibility.spec.ts` | 12 |
| `wheel-filter.spec.ts` | 7 |
| `astryx-interactions.spec.ts` | 5 |
| `local-interactions.spec.ts` | 4 |
| `mobile-page-friendliness.spec.ts` | 4 |
| `conversion-locale.spec.ts` | 3 |
| `homepage-locale-pilot.spec.ts` | 2 |
| `i18n-wheel-catalogue.spec.ts` | 2 |
| `i18n-wheel-enquiry.spec.ts` | 2 |
| `astryx-sitewide-p5.spec.ts` | 1 |
| `i18n-flow-formed.spec.ts` | 1 |
| `self-sealing-mechanism.spec.ts` | 1 |
| **合计** | **90 个用例 / 15 个 spec** |

> ⚠️ **本次 Wave 0 没有跑 E2E**（需独占端口 3100 + 生产构建，且 `STATUS.md` 自述「全量 Playwright 仍有既有失败」）。
> **这是本次审计最大的未验证面**，必须写进 FINAL_REPORT 的「未验证项」。
> E2E 真实通过率由 Agent E 从 `playwright-report/` 最近一次结果读取（若有），并标注为 **E3** 而非 E5。

---

## 4. 依赖清单（直接依赖 25 个）

| 包 | 声明 | 实际安装 |
|---|---|---|
| `next` | `^16.4.0` | **16.4.0** |
| `react` / `react-dom` | `19.2.4` | 19.2.4 |
| `@astryxdesign/core` | `^0.6.7` | 0.6.7 |
| `@astryxdesign/theme-neutral` | `^0.6.7` | 0.6.7 |
| `@astryxdesign/cli` (dev) | `0.6.7` | 0.6.7 |
| `@base-ui/react` | `^1.3.0` | 1.3.0 |
| `@stylexjs/stylex` | `^0.19.1` | 0.19.1 |
| `zod` | `^4.6.5` | 4.6.5 |
| `lucide-react` | `^1.6.0` | 1.54.0 |
| `tailwindcss` | `^4` | 4.2.2 |
| `@playwright/test` (dev) | `^1.64.0` | 1.64.0 |
| `@axe-core/playwright` (dev) | `^4.13.0` | 4.13.0 |

**未安装但 V3.0 提到的**：`next-intl`、`prisma`、`nodemailer`、`ioredis`、`vitest`。
→ 说明 i18n 是**自研**、测试用 **node 原生 test runner**、无 ORM、无 Redis、无 Node 邮件库。

---

## 5. 路由与 SEO 覆盖面

### 5.1 路由规模

- **`page.tsx` 路由：38 个**
- **API 路由：4 个**
  - `/api/inquiries`（215 行）
  - `/api/revalidate/wordpress`（66 行）
  - `/api/preview`（48 行）+ `/api/preview/exit`（8 行）
- **动态路由段 6 个**：`fitment/[platform]`、`insights/[slug]`、`insights/bolt-patterns/[pattern]`、`products/wheels/[model]`、`resources/[slug]`、`resources/bolt-patterns/[pattern]`
- **特殊路由**：`llms.txt`、`robots.ts`、`sitemap.ts`

### 5.2 Metadata 覆盖率

| 项 | 值 |
|---|---|
| 有 `generateMetadata` 的页面 | **24** |
| 有静态 `export const metadata` 的页面 | **7** |
| **有 metadata 的页面合计** | **31 / 38** |
| **完全没有 metadata 的页面** | **7** |

**这 7 个页面（全部没有任何 metadata 导出）：**

```
/gallery
/gallery/wheels
/manufacturing
/resources
/resources/[slug]
/resources/bolt-patterns
/resources/bolt-patterns/[pattern]
```

> ⚠️ **交叉核对发现（交给 Agent C）**：`sitemap.ts` 的 `paths` 数组**不含**上述 7 个路径中的任何一个（`/gallery/wheels`、`/manufacturing`、`/resources*` 都没进 sitemap）。
> 也就是说：**7 个无 metadata 的页面恰好都不在 sitemap 里**。这既可能是「有意为之（这些页不该被索引）」，也可能是「两边都漏了」。**需要 Agent C 判定这 7 个页面的定位，并检查它们是否被导航链接暴露（若导航可达但不在 sitemap，是 IA 不一致）。**

### 5.3 sitemap 生成逻辑（E1 已读）

- **fail-closed**：`configuredSiteUrl` 未配置时返回 `[]` —— 设计正确。
- 英文路径硬编码 26 条 + 动态 3 类（fitment / bolt-patterns / guides）+ 按发布门槛条件插入 3 条（custom-aluminum / flow-formed / 首页）。
- **多语言展开逻辑**：对所有非 en 的 `INDEXABLE_LOCALES` 做全量展开，**只对首页做了逐语言门槛过滤**。
  > ⚠️ **交 Agent C**：`localizedEntries` 的 filter 条件是 `entry.pathname !== "/" || homepageLocales.includes(locale)` —— 即**除首页外，所有路径无条件展开到所有 INDEXABLE_LOCALES**。这与「未批准译文不公开索引」的要求是否一致？`STATUS.md` 自述「首页已收口，其他页面族待迁移」—— **代码行为印证了这个自述**。这是一条可确证的 E1 证据，不需要猜。

### 5.4 robots（E1 已读）

- `configuredSiteUrl` 未配置 → `disallow: "/"`（fail-closed，正确）
- 已配置 → `allow: "/"`，`disallow: "/api/"`，并指向 `sitemap.xml`

---

## 6. 环境变量清单（18 个，仅名称）

```
FH_INQUIRY_RETENTION_DAYS      WP_API_TOKEN                  WP_REST_ROOT
FH_INQUIRY_WEBHOOK_SECRET      WP_API_URL                    WP_REVALIDATE_SECRET
INQUIRY_ALLOWED_ORIGINS        WP_INQUIRY_SERVICE_KEY        WP_PREVIEW_SECRET
INQUIRY_FROM                   WP_MODE                       RESEND_API_KEY
INQUIRY_TO                     WP_PUBLIC_API_URL             NEXT_DEV_ALLOWED_ORIGINS
INQUIRY_RECEIPT_SECRET         NEXT_PUBLIC_APP_URL           NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION
```

### ⚠️ 两个必须先记下的矛盾点

1. **无任何 `SMTP_*` 变量**，但存在 `RESEND_API_KEY`。
   → MEMORY 与 `STATUS.md` 都说「询盘走 QQ SMTP / PHPMailer」。**若 SMTP 凭证在 WordPress 侧（不在 Next 的 env），那 `RESEND_API_KEY` 是干什么的？是否两套邮件路径并存？**
   **交 Agent B 定论，这是 M11 的核心问题。**

2. **`.env.example` 只有 18 个变量，但代码里被引用的环境变量可能更多**。
   → 例如 `playwright.config.ts` 用了 `PLAYWRIGHT_PORT`/`PLAYWRIGHT_PRODUCTION`/`PLAYWRIGHT_LIVE_WP`（测试专用，可不进 example）。但 **`WP_MODE` 的取值域（mock/live）没有注释说明**，Agent A/D 需确认。

3. **本地存在 `.env.local`（528B）** —— 未读取内容（含密钥），仅记录存在。`.env.example` 4332B。

---

## 7. WordPress 侧

| 项 | 值 |
|---|---|
| 位置 | `local-wp/wp-data/wp-content/` |
| **MU 插件 7 个** | 合计 **5,711 行** |
| 普通插件 | `advanced-custom-fields`、`akismet`、`hello.php` |
| **未装** | Polylang（多语言插件）|

### MU 插件规模

| 插件 | 行数 |
|---|---|
| `fenghuai-inquiries.php` | **3,029** |
| `fenghuai-wheels.php` | 760 |
| `fenghuai-pages.php` | 674 |
| `fenghuai-guides.php` | 448 |
| `fenghuai-wheel-authoring.php` | 379 |
| `fenghuai-insights-authoring.php` | 286 |
| `fenghuai-content-webhooks.php` | 135 |

> ⚠️ **两条交给 Agent A/C 的重大发现**：
> 1. **没有 Polylang**。V3.0 假设「Polylang Free + 自定义桥接」。本项目显然走了**另一条路**（纯 ACF + 自研 locale 字段）。这既可能是「更简洁的自主方案」，也可能是「缺翻译关系管理」。**必须判定，不能默认缺失。**
> 2. **`fenghuai-inquiries.php` 3,029 行**，是整个项目最大的单一文件（超过 `src` 里任何文件）。这个体量本身就说明询盘系统的复杂度/技术债风险。**Agent B 的重点审计对象。**

---

## 8. 源码规模

| 项 | 值 |
|---|---|
| TS/TSX 文件 | **232** |
| `src` 总行数 | **106,168** |

### 分布

| 目录 | 文件数 |
|---|---|
| `src/components` | **71** |
| `src/lib` | **61** |
| `src/app` | 49 |
| `src/content` | 40 |
| `src/theme` | 8 |
| `src/hooks` | 2 |
| `src/types` | **0**（空目录，只有 `.gitkeep`） |

### `src/lib/wordpress/` —— 21 个文件 / 2,883 行

| 文件 | 行数 |
|---|---|
| `client.ts` | **318**（最大）|
| `inquiry-content.ts` | 227 |
| `wheels-contract.ts` | 188 |
| `pages-contract.ts` | 175 |
| `homepage.ts` | 159 |
| `flow-formed.ts` | 157 |
| `product-lines.ts` | 129 |
| `legal.ts` | 101 |
| `pages.ts` | 98 |
| `custom-aluminum.ts` | 94 |
| `forged-wheel.ts` | 92 |
| `ev-components.ts` | 90 |
| `types.ts` | 83 |
| `insights.ts` | 80 |
| `safety-tires.ts` | 72 |
| `conversion-pages.ts` | 71 |
| `wheel-capabilities.ts` | 69 |
| `media.ts` | 63 |
| `about.ts` | 63 |
| `index.ts` | 24 |
| `wheels.ts` | 20 |

> **观察（交 Agent A）**：21 个文件里，**按内容类型分文件**（about / ev-components / safety-tires / forged-wheel…）是清晰的领域切分。但 `client.ts` 之外的 20 个文件**是否各自重复实现了 fetch/校验/错误处理**，是 M02 的核心判断题。**不接受「文件多 = 重复」，要有逐文件的证据。**

### `src/lib/inquiry/` —— 8 个文件 / 1,029 行

| 文件 | 行数 |
|---|---|
| `store.ts` | **420** |
| `schema.ts` | 131 |
| `types.ts` | 128 |
| `guard.ts` | 104 |
| `mailer.ts` | 102 |
| `validate.ts` | 80 |
| `receipt.ts` | 51 |
| `index.ts` | 13 |

---

## 9. 脚本与工具

- **`scripts/` 31 项**（含 `__pycache__`）
  - PHP 侧：`verify-inquiry-backend.py`、`verify-inquiry-delivery.py`、`verify-insights-cms.py`、`verify-native-pages.py`、`verify-home-editor-flow.php`、`verify-page-v2-contract.php`、`verify-wheel-cpt.py`、`verify-wordpress-content-authoring.py` 等 **8 个 verify 脚本**
  - 迁移类：`migrate-*.php`（3 个）、`import-*.php`（2 个）、`sync-*.php`（2 个）
  - 生成类：`generate-wheel-catalogue.mjs`、`build-wheel-import.py` 等

> ⚠️ **关键判断（交 Agent D）**：有 **8 个 verify 脚本**，但**没有任何一个被挂进 CI**（CI 只跑 `npm test` + `npm run check` + `audit:prod`）。
> 「有脚本 ≠ 有验收」—— 这些脚本如果没人定时跑，就只是「一次性调试工具」。**必须区分「存在」和「在用」。**

---

## 10. CI/CD（E1 已读全文）

`.github/workflows/verify.yml` 的步骤**只有 5 步**：

```
1. actions/checkout@v4
2. actions/setup-node@v4 (node 24, cache: npm)
3. npm ci
4. npm test
5. npm run check        ← theme:check + test + lint + typecheck + build
6. npm run audit:prod
```

**缺口（直接可证）：**
- ❌ **没有 E2E**（90 个用例从未在 CI 跑）
- ❌ **没有部署步骤**
- ❌ **没有构建产物 publish**
- ❌ **没有 WordPress/PHP 侧任何验证**
- ❌ **没有环境隔离检查**
- ✅ 有依赖漏洞门禁（`audit:prod`）

---

## 11. 部署配置（E1 已扫）

`deploy/` 下两套 Docker Compose：

| 路径 | 内容 |
|---|---|
| `deploy/frontend/` | `Dockerfile`、`Dockerfile.prebuilt`、`nginx-9080.conf`、`compose.yml`、`.env.example` |
| `deploy/wordpress/` | `README.md`、`.env.example`、`compose.yml`、`nginx-7080.conf` |

> 端口 **9080 / 7080** 与 `STATUS.md` 说的「9080 是预发布环境」吻合。
> **待 Agent D 确认**：这两个 compose 是否真能起、是否只是模板残留（`STATUS.md` 自己说「旧容器为模板默认值」）。

---

## 12. 本次未采集 / 未验证的项（诚实声明）

以下内容**本轮没有做**，不得在后续报告中当作已验证：

| 项 | 原因 | 由谁补 |
|---|---|---|
| **E2E 实跑（90 用例）** | 需独占端口 + 生产构建，Wave 0 串行预算内不跑 | Agent E 读 `playwright-report/` 最近结果（E3） |
| **`npm run check` 整体跑一遍** | 五个子命令已单独跑过，重复耗时 | 不需要，已有等价证据 |
| **Docker Compose 能否真的起容器** | 会动 Docker 状态，属有副作用操作 | Agent D 只做静态分析 |
| **WordPress 数据库实际表结构** | 未连本地 Docker WP（可能未启动） | Agent B 只读 PHP/SQL 源码 |
| **生产环境真实状态** | 明确禁止 | 不查 |
| **`.env.local` 内容** | 含密钥，禁止读取 | 不查 |

---

## 13. 给五个 Subagent 的强制约束（复述）

1. 本文件是唯一事实源。版本号、命令结果以本文件为准。
2. **只有 E1（源码）和 E5（本文件里的实跑结果）能支撑「已满足」。**
3. **不要重跑 `npm run build`**（已跑，产物在 `.next`）。
4. **不要跑 E2E**（会抢端口 3100，且 Agent E 统一处理）。
5. 不要 `npm install`，不要改任何文件。
6. 报告里不出现任何密钥值。
7. 你的文件域之外的问题，写「移交 X 号 Agent」而不是自己下结论。
