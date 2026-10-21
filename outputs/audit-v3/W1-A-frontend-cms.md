# W1-A · 前端与内容接缝（M01 / M02 / M03 / M04 / M09 / M12）

> 审计人：Agent A
> 事实源：`outputs/audit-v3/BASELINE.md`（下文引用为 E5）
> 证据等级：E1 = 源码行号；E5 = BASELINE 实跑结果。E3/E4（历史报告、STATUS.md 自述）**未用于**支撑任何「已满足」。
> 范围纪律：本报告只覆盖 `package.json` / `next.config.ts` / `tsconfig.json` / `eslint.config.mjs` / `.env.example` / `src/app/**` / `src/components/**` / `src/lib/wordpress/**` / `src/content/**` / `src/lib/site-url.ts` / `src/lib/utils.ts` / `local-wp/wp-data/wp-content/mu-plugins/**`。
> **未重跑 build / E2E，未安装依赖，未改任何源码，未读取 `.env.local`。**

---

## 全局事实校正（先说三处与 BASELINE 的差异，均不构成冲突而是精度补充）

| # | BASELINE 说法 | 实测（E1） | 影响 |
|---|---|---|---|
| C1 | `src/lib/wordpress/types.ts` 83 行 | ✅ 一致（`types.ts` 83 行） | 无 |
| C2 | `insights-contract.ts` 不在行数表中（表内最大是 `client.ts` 318） | ❌ **`insights-contract.ts` 实为 510 行**，是 `src/lib/wordpress/` 的真实最大文件。21 文件合计 2,883 行 ✅ 总数一致，只是漏列了 `insights-contract.ts`、多列了不存在的项 | M02 的「最大文件」判断需以 510 行为准，不是 318 |
| C3 | MU 插件 7 个 / 5,711 行 | ✅ 一致；但**仓库里有两份完全相同的拷贝**：`local-wp/mu-plugins/` 与 `local-wp/wp-data/wp-content/mu-plugins/`，`diff -rq` 退出码 0（完全相同） | M03 新增技术债：同一份 5,711 行代码双份存放 |

补充实测：

- `src/app/**/page.tsx` = **38 个** ✅（与 BASELINE §5.1 一致）
- `src/app/**/layout.tsx` = **1 个**（仅 `src/app/layout.tsx`）
- `src/components/` = **72 个文件 / 12,361 行**（BASELINE 记 71；多出的是 `src/components/sections/home-hero.tsx.retired`，非 `.tsx` 后缀故未被计入 71 的统计口径，也**不会被编译**）
- `src/middleware.ts` **不存在**；`src/instrumentation.ts` **不存在**；`src/proxy.ts` 是唯一 middleware（Next 16 命名）

---

## M01 项目基础架构

**成熟度**: 3/5
**状态**: 部分满足

### 证据

**目录结构偏差**

- [E1] `ls` 根目录 → 单仓（single-app）布局：`src/`、`local-wp/`、`deploy/`、`scripts/`、`e2e/`、`tests/`、`outputs/`、`resources/`、`assets/`、`docs/`、`archive/`、`work/`。**不存在** `apps/web`、`packages/*`、`infra/`、`wordpress/`（顶层）。WordPress 侧在 `local-wp/`，前端在仓根。
- [E1] `package.json`（`"name": "wheel-site-online"`, `"version": "0.1.0"`）→ 单 package，无 `workspaces` 字段、无 turbo/nx。
- [E1] `tsconfig.json` 的 `paths` 只有一条：`"@/*": ["./src/*"]` → 说明**代码从未被设计成可跨包引用**。

**TypeScript 严格度**

- [E1] `tsconfig.json:7` `"strict": true`（已开）。
- [E1] `tsconfig.json:6` `"skipLibCheck": true`（开了 —— 跳过所有 `.d.ts` 检查，属常见但**降低**保障的选项）。
- [E1] `tsconfig.json` **未出现**以下严格度开关（即全部取默认值）：`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`noImplicitOverride`、`noPropertyAccessFromIndexSignature`、`noFallthroughCasesInSwitch`、`noUnusedLocals`、`noUnusedParameters`、`noUncheckedSideEffectImports`。
- [E1] `tsconfig.json:3` `"target": "ES2017"`（对 Node 24 / 现代浏览器偏低，但 Next 会二次编译，实际影响小）。
- [E1] `next.config.ts` 全文无 `typescript: { ignoreBuildErrors: true }`，也没设 `eslint.ignoreDuringBuilds` → **构建期类型检查与 lint 是真跑的**，与 E5「`npm run typecheck` 0 错误 / `npm run lint` 零输出」互相印证。

**环境变量集中校验层**

- [E1] `src/lib/site-url.ts:1-20` **全文只有 20 行**，只处理 **1 个** 变量（`NEXT_PUBLIC_APP_URL`）：`parseConfiguredUrl()` 校验协议白名单 `http:/https:`、清空 path/search/hash，解析失败返回 `null`；导出 `configuredSiteUrl` / `siteUrl` / `siteUrlIsConfigured`。**这是一个「单变量解析器」，不是环境变量校验层。**
- [E1] `src/lib/wordpress/client.ts:17-25` `getWpConfig()` 是**第二个**分散的 env 读取点：读 `WP_API_URL`、`WP_API_TOKEN`、`WP_MODE`，把 mode 降级为 `baseUrl && WP_MODE === "live" ? "live" : "mock"`。**这是「静默降级」不是「校验报错」**——拼错 `WP_MODE`（例如 `Live`）会无声变 mock。
- [E1] `src/lib/wordpress/client.ts:135-156` `getWpRestRoot()` 是**第三个** env 读取点：读 `WP_REST_ROOT`，缺省时从 `WP_API_URL` 反推（三条正则分支），最差情况强行拼 `/wp-json`。
- [E1] `src/app/layout.tsx` → `metadataBase` 使用 `siteUrl`；即 SEO 基址与 env 校验绑在一处，但其余 14 个变量没有对等处理。
- [E1] `.env.example`（BASELINE §6 记 18 个变量）中，**有注释但无任何程序化 schema**：例如 `WP_MODE=mock` 只靠一段中文注释「其它值一律按 mock 处理」定义取值域（`.env.example` 第 13 行附近）。取值域不在类型系统里。
- [E1] 全仓 `zod` 只被 **1 个文件**引用：`src/lib/inquiry/schema.ts:1` `import { z } from "zod";`（grep `from "zod"` 全 `src` 仅此一处）→ **env 与 WP 响应都没有 Zod 校验**（详见 M02）。

**`output: "standalone"` 与 Dockerfile 一致性**

- [E1] `next.config.ts:83` `output: "standalone"`。
- [E1] `deploy/frontend/Dockerfile:1` `FROM node:24-bookworm-slim`，最终阶段 `CMD ["node", "server.js"]`，`COPY /app/.next/standalone ./` + `COPY /app/.next/static ./.next/static` + `COPY /app/public ./public` → **与 standalone 产物契约一致**。
- [E1] `deploy/frontend/Dockerfile.prebuilt:1` 同样 `node:24-bookworm-slim`，但 `COPY .next/standalone/server.js .next/standalone/package.json ./` 后 `COPY .next/standalone/.next ./.next` → 与 `Dockerfile` 的 `COPY .next/standalone ./` **copytree 目标不同但落点等价**，两套并行。
- [E5] Node `v24.15.0`；`package.json` `engines.node: ">=24"`；`.nvmrc` `24`；Dockerfile `node:24-bookworm-slim` → **四处一致**。
- [E1] `deploy/frontend/compose.yml:6` `image: fenghuai-frontend-9080:2026-10-09`（**镜像带硬编码日期标签**，需要人工维护），`compose.yml:14` `WP_MODE: mock`（构建参数）而 `compose.yml:25` `WP_MODE: live`（运行时）→ 有意为之，注释已说明。
- ⚠️ **[E1] `compose.yml:16-17` `WP_API_URL: ${WP_PUBLIC_API_URL}` / `WP_REST_ROOT: ${WP_PUBLIC_REST_ROOT}`（构建参数）与 `compose.yml:27-28` `WP_API_URL: http://wordpress/wp-json/wp/v2` / `WP_REST_ROOT: http://wordpress/wp-json`（运行时）不一致。** 这直接影响 `next.config.ts` 的 `remotePatterns`：构建期用的是**公网域名**，运行时服务端读取用的是**docker 内网名 `wordpress`**。详见 M12 风险 R12-1。

**`src/proxy.ts`（Next 16 middleware）**

- [E1] `src/proxy.ts:22-76` `export function proxy(request: NextRequest)`。职责 5 条：
  1. `proxy.ts:24-25` 从 pathname 取 locale（`localeFromPathname`），非默认语言视为「本地化路由」；
  2. `proxy.ts:31-35` 内部 rewrite 回环保护（`x-fh-locale` 头存在且非默认语言 → 直接 `next()`，防 redirect 环）；
  3. `proxy.ts:11-20 / 37-52` 语言偏好：cookie `LOCALE_COOKIE` → `accept-language` → `DEFAULT_LOCALE`，非默认语言且非 RSC/router-data 请求时 **302 redirect 到 `/{locale}/...`**；
  4. `proxy.ts:58-68` `/zh/*` → 内部 rewrite 到无前缀路径；`proxy.ts:55-56` 注入 `x-fh-locale` 与 `x-fh-public-path` 请求头；
  5. `proxy.ts:69-74` 写回 locale cookie（1 年）并设置 `Content-Language` 响应头。
- [E1] `proxy.ts` **没有任何 noindex / X-Robots-Tag 逻辑**（grep `noindex` 在 `src/proxy.ts` 中 0 命中）。→ BASELINE §3.1 提出的「是否做 noindex 注入」问题，**答案是否**。noindex 完全由各页面 `generateMetadata` 的 `robots` 字段承担（例：`src/app/page.tsx:19` hero metadata 失败分支 `robots: { index: false, follow: true }`）。
- [E1] `proxy.ts:82-86` matcher 排除 `api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml` 与所有带扩展名的路径。
- [E5] BASELINE §3.1 记录构建日志出现 `ƒ Proxy (Middleware)`，46 路由全部 `ƒ` Dynamic → middleware 对**每个 HTML 请求都执行**，这是全站 Dynamic 的成因之一（移交 Agent C 做缓存量化）。
- ⚠️ **[E1] `src/proxy.ts` 是 177 项未提交改动之一（BASELINE §2）**，即在任何已提交状态下**不存在**。→ 它属于「工作区现状」，见风险 R01-2。

### 已具备

- TS `strict: true` + 构建期真做 typecheck（E1 `tsconfig.json:7` + `next.config.ts` 无忽略开关 + E5 typecheck 0 错误）
- Node 版本四处一致（E5 + E1 三处声明）
- `output: "standalone"` 与两套 Dockerfile 产物契约一致（E1）
- 单一 env 入口 `NEXT_PUBLIC_APP_URL` 有解析 + 协议白名单 + fail-closed 下游（`site-url.ts:3-20` + robots/sitemap fail-closed，见 BASELINE §5.3/§5.4）
- 有一个**真正做决策**的 middleware（locale 路由 + 回环保护 + cookie 偏好），不是空壳（E1 `proxy.ts:22-76`）
- ESLint flat config 有明确、逐个解释了理由的 ignore 列表（`eslint.config.mjs` 全文）

### 缺口

| ID | 描述 | 严重度 | 阻塞上线 |
|---|---|---|---|
| G01-1 | **没有集中式环境变量校验层。** 18 个变量分散在 ≥3 个模块（`site-url.ts:4`、`client.ts:18-20`、`client.ts:136`）+ `next.config.ts` 的 4 处 `process.env` 读取，**无 schema、无启动期校验、无类型收窄**。配置错误的表现是「静默降级为 mock / 静默为空 / 运行时 404 后再排查」，而不是启动即失败。 | **High** | 否（但会显著拉长故障定位） |
| G01-2 | **`WP_MODE` 是无声降级开关。** `client.ts:22` `mode: baseUrl && process.env.WP_MODE === "live" ? "live" : "mock"` —— 任何拼写偏差、大小写偏差、结尾空格都会退回 mock，页面看起来正常但读的是本地快照。生产 `compose.yml:25` 硬编码 `WP_MODE: live` 掩盖了这个隐患（本地/预发才会中招）。 | High | 否 |
| G01-3 | **仓库存在两份完全相同的 MU 插件拷贝**（`local-wp/mu-plugins/` 与 `local-wp/wp-data/wp-content/mu-plugins/`，`diff -rq` 退出码 0）。5,711 行 × 2。改一份不生效、或改错一份上线，都是现实风险。 | **High** | 是（发布路径不唯一） |
| G01-4 | **TS 严格度停在 `strict: true`，未开 `noUncheckedIndexedAccess`。** 这个项目里 `record[key]` / `array[i]` 出现极密（`pages-contract.ts:132` `fields?.content_by_locale?.[locale]`、`insights-contract.ts:450` `fields?.translations?.[locale]`、`inquiry-content.ts:97` `candidate[key]` 等），未开的索引访问检查正好是这类代码最容易出错的地方。 | Medium | 否 |
| G01-5 | **`skipLibCheck: true`**（`tsconfig.json:6`）—— 对第三方 `.d.ts` 不做检查，属常见取舍，但结合上一条意味着类型保障实际比「strict: true」听起来要弱。 | Low | 否 |
| G01-6 | **目录结构不是 V3.0 的 `apps/web + packages + infra`，且无任何可抽取的边界**（无 workspaces、无 turbo、`paths` 只有 `@/*`）。 | Medium | 否 |
| G01-7 | **`src/proxy.ts` 未提交**（BASELINE §2 / 177 项改动）。多语言路由 + Content-Language 全部承载在一个未入库的文件上。 | **High** | 是（见 R01-2） |
| G01-8 | `compose.yml:6` 镜像标签硬编码日期 `fenghuai-frontend-9080:2026-10-09`，无版本号/commit 关联。 | Low | 否 |
| G01-9 | `src/components/` 里留了 `sections/home-hero.tsx.retired`（非 `.tsx`，不参与编译，但会让「71 vs 72」之类的盘点点错）。属于死文件未清理。 | Low | 否 |

### 重复实现

- **D01-1 环境变量读取点 3 套**：`site-url.ts:3-16`（结构化 URL 解析）/ `client.ts:17-25`（三变量 + mode 推断）/ `client.ts:135-156`（REST root 反推三条正则）/ `next.config.ts:20-70`（4 处 `process.env` + 2 个 `new URL` 的 try/catch，注释还写着 "Runtime validation in the WordPress client handles malformed URLs" — 即 **next.config 主动把校验责任甩给 client，但 client 并没有真正的校验层**）。
- **D01-2 Dockerfile 两份**：`deploy/frontend/Dockerfile`（多阶段全量构建）与 `deploy/frontend/Dockerfile.prebuilt`（拿现成 `.next` 打包）。用途不同，**属合理分工**，不算重复实现；但两者对 `.next/standalone` 的拷贝方式不同（`./` vs 逐项），任何一次 standalone 目录结构变动都需要改两处。

### 风险

- **R01-1（High）**：没有启动期 env 校验 → 生产配置错误的唯一信号是「页面读不到 CMS 内容但仍 200」。结合 M02 的「所有失败都 `return null`」，这一条会把「配置错」和「CMS 挂了」和「CMS 真的没内容」混成一类。
- **R01-2（High）**：`src/proxy.ts` 未提交。BASELINE §2 明确指出「本机工作区代码 ≠ 任何已提交状态」。**如果按当前 HEAD 发布，`/zh/*` 语言路由、`Content-Language`、locale cookie 全部消失**，且 `src/proxy.ts` 引用的 `LOCALE_COOKIE` 常量是否已在已提交版本中存在，也需核实（本轮未核）。这不是「代码质量问题」，是「发布风险」。
- **R01-3（Medium）**：`compose.yml` 构建参数与运行时 env 的 `WP_API_URL` 语义不同（公网 vs 内网），而 `next.config.ts` 只在**构建期**固化了 `remotePatterns`。见 M12 R12-1，两者是同一个根因。

### 建议动作

1. **建 `src/lib/env.ts`**：用 `zod` 定义 18 个变量 schema（`WP_MODE: z.enum(["mock","live"])`、`NEXT_PUBLIC_APP_URL: z.string().url().optional()` 等），在模块顶层解析并**抛错**。让 `site-url.ts`、`client.ts`、`next.config.ts` 全部改从它读。这一步同时消灭 D01-1。
2. **`WP_MODE` 拼错必须报错，不能降级**：至少在生产构建里（`NODE_ENV === "production"`）对非法值 `throw`。
3. **删掉 `local-wp/mu-plugins/` 或 `local-wp/wp-data/wp-content/mu-plugins/` 之一**，并在 `.gitignore`/文档里写明唯一真源。
4. `tsconfig.json` 加 `"noUncheckedIndexedAccess": true`，跑一次 typecheck 看真实爆炸面（本报告无法预跑，属**待核实**）。
5. 把 `src/proxy.ts` 纳入提交；在 CI 里加一条「`git status --porcelain` 为空」的门禁，杜绝「发布靠未提交文件」。
6. 清掉 `src/components/sections/home-hero.tsx.retired`。

### 依赖

- 动作 1/2 需与 **Agent B**（`src/lib/inquiry/*` 也读 env，见 `client.ts` wpWrite 用 `WP_INQUIRY_SERVICE_KEY`）对齐，避免两套 env 模块。
- 动作 5 需 **Agent D**（CI 配置）落地门禁。
- `next.config.ts` `remotePatterns` 与 `compose.yml` 的构建/运行时 env 差异 → **Agent D** 判定部署事实。

### 验收方式

- `node -e 'process.env.WP_MODE="Live"; require...'` 之类的最小复现：非法 `WP_MODE` 必须抛错，不能静默 mock。
- `git ls-files src/proxy.ts` 返回非空。
- `find . -path ./node_modules -prune -o -name "fenghuai-pages.php" -print` 只返回 **1** 条。
- `grep -rn "process.env\." src next.config.ts | grep -v "src/lib/env.ts"` 结果为空（所有 env 只经集中层）。

---

## M02 CMS 接入层

**成熟度**: 3/5
**状态**: 部分满足

### 证据

**先回答 BASELINE 的核心判断题：21 个文件是否各自重复实现 fetch / URL 拼接 / 错误处理？**

> **结论：`fetch` 与错误处理没有重复；URL 拼装和契约定义有重复；运行时校验用的是「各家手写 type guard」，不是 Zod。**

- [E1] `grep -rn "fetch(\|AbortSignal" src/lib/wordpress/*.ts` → **只有 `client.ts` 一处**：
  - `client.ts:59` `await fetch(\`${cfg.baseUrl}${path}\`)`（`wpFetch`）
  - `client.ts:103` `await fetch(\`${baseUrl}${path}\`)`（`wpRead`）
  - `client.ts:243` `await fetch(\`${root}${path}\`)`（`wpWrite`）
  - `client.ts:68` / `client.ts:115` / `client.ts:252` 三个 `AbortSignal.timeout(...)`（8000 / 8000 / `opts.timeoutMs ?? 10_000`）
  → **其余 20 个文件 0 处 `fetch`**。BASELINE §8 的担心（「是否各自重复实现 fetch」）**不成立**。

**`client.ts`（318 行）提供的抽象**

- [E1] `client.ts:17-25` `getWpConfig()` — 配置与 mode 降级（见 M01 G01-2）
- [E1] `client.ts:44-82` `wpFetch<T>` — **私有**（未 export）。超时 8s（`client.ts:68`），`next.revalidate` 默认 3600（`client.ts:111` 属于 `wpRead`，`wpFetch` 用 3600 字面量），支持 tags；失败：`console.error` + `return null`（`client.ts:72-79`）
- [E1] `client.ts:86-131` `wpRead<T>` — **公开**，除 `wpFetch` 外多 `restRoot` 开关（`client.ts:97` `options.restRoot ? getWpRestRoot() : cfg.baseUrl`）与 `noStore` 开关（`client.ts:107-116`）
- [E1] `client.ts:135-156` `getWpRestRoot()` — `WP_REST_ROOT` → 反推 `/wp-json`；三正则分支 + 兜底拼接
- [E1] `client.ts:158-197` `WpWriteFailureReason` = `"not_configured" | "network" | "client" | "server"`，`WpWriteResult<T>` 判别联合 → **这是全仓唯一的错误分类抽象，且只用于写**。`client.ts:166-196` 的 docstring 明确解释了为什么写不能复用 `wpFetch`（写不能缓存、写不能吞成 null）。**这是正确的设计判断，不是重复。**
- [E1] `client.ts:199-279` `wpWrite<T>` — `not_configured` 三种前置检查（`client.ts:227-249`）、`network`（`client.ts:250-257`）、`client/server`（`client.ts:269-275`）、error body 保留（`client.ts:262-267`）
- [E1] `client.ts:282-296` `wpMedia` / `wpMediaCollection`（批量 `_fields` 精简）
- [E1] `client.ts:299-317` `wpCollection` / `wpItem`
- **读路径的错误分类：无。** `client.ts:72-79` 与 `client.ts:118-127` 都只有 `res.ok` 二元判断 + `console.error` + `null`。**HTTP 500 与 404 与超时在读路径上完全不可区分** —— 与写路径的精细分类形成鲜明对比。

**`types.ts`（83 行）是否是统一契约？**

> **结论：不是。它是一份「历史契约残留」，与实际在用的契约几乎无关。**

- [E1] `types.ts:12-22` `WpPost<T>`（`title.rendered` / `content.rendered` / `excerpt.rendered` / `acf: T`）
- [E1] `types.ts:24-29` `WpTerm` / `types.ts:32-41` `WpMedia` / `types.ts:44-57` `WpWheelAcf` / `types.ts:60-66` `WpProductLineAcf` / `types.ts:68-72` `WpArticleAcf` / `types.ts:74` `WpRegion = "global"` / `types.ts:76-83` `WpClientConfig`
- [E1] `grep -rn "WpPost\|WpWheelAcf\|WpArticleAcf\|WpTerm\|WpProductLineAcf\|WpRegion" src` → **除 `types.ts` 自身，只有 `client.ts:3` 与 `client.ts:303/312` 引用 `WpPost`/`WpClientConfig`/`WpMedia`**。且：
  - `wpCollection` / `wpItem` **全仓零调用方**（`grep wpCollection\|wpItem src` 只命中 `client.ts` 定义与 `index.ts:4-5` 的 re-export）
  - `WpWheelAcf` / `WpProductLineAcf` / `WpArticleAcf` / `WpTerm` / `WpRegion` **全仓零引用**（死类型，共 33 行）
- [E1] **真实在用的契约在别处，各有其主**：
  - `pages-contract.ts:6-53`（`WordpressPageFields` / `WordpressPageRecord` / `WordpressPageCollection` / `WordpressLocalePageResponse` / `PageResult` / `SitePageDocument`）
  - `insights-contract.ts:5-63`（`WordpressGuideFields` / `WordpressGuideRecord` / `WordpressGuideCollection` / `InsightGuideDocument`）
  - `wheels-contract.ts`（`WordpressWheelCollection` 等）
  - `insights-contract.ts:137-148`、`pages-contract.ts:18-23`、`insights-contract.ts:29-34` 三处**各自重抄了一遍 `image: { id?, src?, alt?, caption? }`**
  - → **同一份 83 行「统一契约」被 3 套领域契约取代，且这 3 套之间没有共享父类型。**

**运行时校验：Zod 还是 `as`？**

> **结论：都不是。是 13 个手写 `value is X` type guard，加上若干不可验证的 `as`。**

- [E1] `client.ts:75` `return (await res.json()) as T;` 与 `client.ts:121` 同款 → **网络层的 JSON 完全没有运行时校验**，`as T` 是纯编译期谎言。
- [E1] `grep -rn 'from "zod"' src` → **全 `src` 只有 `src/lib/inquiry/schema.ts:1` 一处**。`src/lib/wordpress/**` 21 个文件 **0 处 Zod**。
- [E1] 各领域自建 type guard（每人一套风格）：
  - `about.ts:11-16`（只查 5 个 key 是 object）
  - `wheel-capabilities.ts:15-20`（6 个 key 是 object）
  - `forged-wheel.ts:44-49`（5 个 key 存在）
  - `custom-aluminum.ts:45-50`（9 个 key 存在）
  - `ev-components.ts:51-56`（7 个 key 存在）
  - `safety-tires.ts:19-24`（9 个 key 存在）
  - `flow-formed.ts:68-101`（**最深**：逐字段 `textFields` + 数组长度 === 3 / === 4 校验）
  - `product-lines.ts:53-65` + `:87-105`（两层：`isProductLine` + `isProductLinesContent`，且检查 `lines.length !== 4`）
  - `legal.ts:44-70`（`nonEmptyString` + `isLegalSection` + `isLegalDocument`）
  - `inquiry-content.ts:81-169`（**最重**：`object`/`string`/`stringValue`/`hasStrings` 四个私有 helper，`isFormUi` 校验 **41 个字符串键**，`isContent` 校验 12 组）
  - `conversion-pages.ts:14-61`（`record`/`fields`/`internalHref` 三个 helper）
  - `insights-contract.ts:65-116`（`decodeHtmlText`/`text`/`isStringArray`/`normalizeDetail`/`normalizeSections`）
  - `pages-contract.ts:100-118`（`text`/`normalizeImage`）
  - `homepage.ts:34-43`（又一个独立的 `isHomepageContent`，与 `page-view.ts:114` 的 `isValidHomepageContent` **功能重叠**）
- [E1] `as` 强制转换（不可验证处）：
  - `pages-contract.ts:89` `content: fields.content as T`
  - `pages-contract.ts:138` `content: localizedContent as T`
  - `wheels-contract.ts:140` `const publicVariants = variants as PublicWheelVariant[];`
  - `wheels-contract.ts:177` `const publicModels = models as PublicWheelModel[];`
  - `homepage.ts:119` `const nativeContent = native.page.content as HomepageContent & {...}`

**逐文件的「调用 client + 自己的字段映射」清单（20 个文件）**

| 文件 | 是否走 client | 具体路径 | 自己的额外实现 |
|---|---|---|---|
| `insights.ts` | ✅ | `wpRead`（`:41`）`/fh/v1/guides`，`restRoot: true` | URL 用 `URLSearchParams`（`:39-42`） |
| `pages.ts` | ✅ | `wpRead`（`:28`）`/fh/v2/pages`、（`:45`）`/fh/v1/pages`、（`:86`）`/fh/v1/pages` | `URLSearchParams` ×2（`:26`、`:43`、`:84`） |
| `inquiry-content.ts` | ✅ | `wpRead`（`:180`）`/fh/v1/pages?key=...` | **手拼 query 字符串** `:181` `?key=${encodeURIComponent(key)}${preview ? "&preview=true" : ""}`，与 `pages.ts:26` 的 `URLSearchParams` 做法不同 |
| `wheels.ts` | ✅ | `wpRead`（`:14`）`/fh/v1/wheels` | — |
| `media.ts` | ✅ | `wpMedia`/`wpMediaCollection`（`:43`、`:55`） | 自己的 `stripHtml`（`:8-10`），与 `pages-contract.ts:101` 的 `text()`、`insights-contract.ts:79` 的 `text()` **第三份 HTML 剥离实现** |
| `homepage.ts` | ✅ | 经 `pages.ts:51/88` | 自己的 `isHomepageContent`（`:34`）、`withProductLineItems`（`:24`） |
| `about.ts` | ✅ | `pages.ts:20` | 自己的 `byId` Map 重建（`:34-40`） |
| `legal.ts` | ✅ | `pages.ts:89` | 自己的 `isLegalDocument` |
| `product-lines.ts` | ✅ | `pages.ts:110` | 自己的双层 guard |
| `custom-aluminum.ts` | ✅ | `pages.ts:54` | `byId` Map（`:73-75`）+ `restoreBoundaryCopy`（`:40-43`） |
| `ev-components.ts` | ✅ | `pages.ts:60` | `byId` Map（`:69-71`）+ `restoreBoundaryCopy`（`:46-49`） |
| `flow-formed.ts` | ✅ | `pages.ts:110` | `restoreBoundaryCopy`（`:56-59`）+ 最深 guard |
| `forged-wheel.ts` | ✅ | `pages.ts:53` | `byId` Map（`:76`）+ `resolveViewport`（`:77-83`） |
| `safety-tires.ts` | ✅ | `pages.ts:28` | `byId` Map（`:45-49`）+ `resolveViewport`（`:51-60`） |
| `wheel-capabilities.ts` | ✅ | `pages.ts:28` | 自己的 viewport 平铺（`:22-24`） |
| `conversion-pages.ts` | ✅ | `pages.ts:64/69` | 3 个 helper |
| `pages-contract.ts` | ❌（纯契约） | — | `normalizeImage`（`:104-118`）、`text`（`:100-102`） |
| `insights-contract.ts` | ❌（纯契约） | — | 510 行：html 解码、Gutenberg 解析器（`:118-421`，约 **300 行**）、`normalizeImage`（`:423-435`）、`text`（`:77-80`） |
| `wheels-contract.ts` | ❌（纯契约） | — | normalize 系列 |
| `index.ts` | ❌（barrel） | — | **全仓零 import**（`grep "lib/wordpress/index"` 无命中） |

### 已具备

- **唯一的网络出口**（`client.ts` 3 个 fetch，其余 20 文件 0 fetch），超时统一（8s 读 / 10s 写）
- **写路径有真正的错误分类**（`client.ts:158-197`），且 docstring 解释了「为什么不复用 wpFetch」（`client.ts:198-217`），这是有意识的设计取舍
- **缓存控制是显式的**（`wpRead` 的 `revalidate` / `tags` / `noStore`，`client.ts:86-131`），且 cache tag 常量集中在各 contract（`pages-contract.ts:4` `SITE_PAGES_CACHE_TAG`、`insights-contract.ts:3` `INSIGHTS_CACHE_TAG`、`wheels-contract.ts` 的 `WHEEL_PUBLICATION_TAG`）
- **发布门槛前置在网络层之外**（`pages-contract.ts:72-82`：page_key/locale 匹配 → withdrawn → unpublished → seo 完整性），CMS 返回不完整时**返回 null 而不是渲染 undefined**（`pages.ts:74-78` docstring 明说）
- **Gutenberg 输出有安全白名单解析器**（`insights-contract.ts:118-421`）：标签白名单 `h2/p/ul/ol/li/blockquote/a/figure/img/figcaption`（`:124-126`）、属性白名单（`:132-138`）、父子结构表（`:167-175`），未知标记一律判失败并回退 migration JSON（`:214-217` 注释 + `:460-462`）。**这是全项目质量最高的一个模块**，且不把原始 HTML 送进 UI。

### 缺口

| ID | 描述 | 严重度 | 阻塞上线 |
|---|---|---|---|
| G02-1 | **网络层零运行时校验。** `client.ts:75` / `client.ts:121` `as T` —— WP 返回任何形状都被当作目标类型。所有校验都靠下游 13 个手写 guard，而其中 `about.ts:11-16`、`wheel-capabilities.ts:15-20`、`forged-wheel.ts:44-49`、`custom-aluminum.ts:45-50`、`ev-components.ts:51-56`、`homepage.ts:34-43` 只检查「key 是 object / key 存在」，**深一层就是裸奔**。 | **High** | 否（有 fallback 兜住渲染崩溃）但会造成**静默错内容** |
| G02-2 | **读路径无错误分类。** `client.ts:72-79` 与 `:118-127` 对 4xx / 5xx / 超时 / DNS 一律 `console.error` + `null`。上游 `pages.ts:52` 于是只能把「CMS 挂了」和「CMS 说没有这个语言」压成 `temporarily-unavailable`（虽然 `pages.ts:49-53` 试图区分 `missing-locale`，但那只是内部分支，最终还是 `null` 语义）。生产排障需要翻日志。 | High | 否 |
| G02-3 | **`types.ts` 是死契约。** 83 行里 `WpWheelAcf`(14)+`WpProductLineAcf`(7)+`WpArticleAcf`(5)+`WpTerm`(6)+`WpRegion`(1) = **33 行全仓零引用**；`wpCollection`/`wpItem` 两个导出（`client.ts:299-317`，**19 行**）零调用方。合计约 52 行死代码，且它被 `index.ts:1` `export *` 广播成「公开 API」。 | Medium | 否 |
| G02-4 | **同一概念三份 HTML 剥离实现**：`pages-contract.ts:100-102` `text()`、`insights-contract.ts:77-80` `text()`（多了 HTML 实体解码）、`media.ts:8-10` `stripHtml()`。三者行为**不一致**（一个解码实体、两个不解码）。 | Medium | 否 |
| G02-5 | **同一概念三份 `normalizeImage`**：`pages-contract.ts:104-118`、`insights-contract.ts:423-435`、以及 `types.ts:18-23`/`insights-contract.ts:29-34` 各写一遍的类型定义。三份正则会漂移。 | Medium | 否 |
| G02-6 | **query 拼装有 3 种手法**：`URLSearchParams`（`pages.ts:26/43/84`、`insights.ts:39`、`client.ts:290`）、手拼字符串（`inquiry-content.ts:181`）、`key` 直接插（`pages.ts:84`）。**`inquiry-content.ts:181` 是唯一手拼的一处，且它拼的是同一个 `/fh/v1/pages` 端点，与 `pages.ts` 并行。** | Medium | 否 |
| G02-7 | **`homepage.ts` 和 `page-view.ts` 各有一套 homepage 校验**：`homepage.ts:34-43` `isHomepageContent`（浅）与 `page-view.ts:50-77`+`114-116` `validHomepageContent`/`isValidHomepageContent`（深）。`homepage.ts:53` 用的是浅的那套，`homepage.ts:127` 用的是深的那套 —— 同文件内两套并存。 | Medium | 否 |
| G02-8 | **`client.ts` 内的 `wpFetch` 与 `wpRead` 是两代实现并存**：`wpFetch`（`:44-82`，私有，无法选 restRoot）与 `wpRead`（`:86-131`，公开，多了 restRoot/noStore）。`wpFetch` 仍被 `wpMedia`/`wpMediaCollection`/`wpCollection`/`wpItem` 使用（`:283/296/303/313`）—— 而 `wpCollection`/`wpItem` 零调用方。也就是说 `wpFetch` 现在只为 `wpMedia*` 活着。 | Low | 否 |
| G02-9 | **`index.ts` barrel 零 consumers。** 24 行 re-export，全仓无 `from "@/lib/wordpress"` 的 import。所有页面都是深层路径直连（`@/lib/wordpress/pages`、`@/lib/wordpress/legal`…）。barrel 只是维护负担。 | Low | 否 |
| G02-10 | `insights-contract.ts` **510 行**（BASEILNE 未列），其中约 **300 行是内嵌的 Gutenberg HTML 解析器**（`:118-421`）。这是个好实现，但**它属于 lib 而非 contract**，放在 `*-contract.ts` 里让「契约文件」的概念失真。 | Low | 否 |

### 重复实现（有具体行号）

| ID | 重复内容 | 证据 |
|---|---|---|
| **R02-1** | HTML 标签剥离 `text()` 两份 + `stripHtml()` 一份 | `pages-contract.ts:100-102`、`insights-contract.ts:77-80`、`media.ts:8-10` |
| **R02-2** | `normalizeImage()` 两份，逻辑逐字相同（`Number.isInteger(id) && id>0` + `^(?:https?:\/\/|\/)` + 必有 alt） | `pages-contract.ts:104-118` **vs** `insights-contract.ts:423-435` |
| **R02-3** | `image: { id?, src?, alt?, caption? }` 类型定义三份 | `types.ts:18-23`（内嵌于 `WordpressPageFields`）、`pages-contract.ts:18-23`、`insights-contract.ts:29-34` |
| **R02-4** | `byId` Map 重建模式 **5 份**，逻辑同构（`resolved.flatMap(a => a.wordpressId ? [[a.wordpressId,a]] : [])`） | `about.ts:34-38`、`custom-aluminum.ts:73-75`、`ev-components.ts:69-71`、`forged-wheel.ts:76`、`safety-tires.ts:45-49` |
| **R02-5** | `restoreBoundaryCopy()` **3 份逐字相同**（`if (resolved.wordpressId !== original.wordpressId) return resolved; return { ...resolved, alt: original.alt, caption: original.caption };`） | `custom-aluminum.ts:40-43`、`ev-components.ts:46-49`、`flow-formed.ts:56-59` |
| **R02-6** | `resolveViewport()` / media 重映射 **2 份同构**（泛型 `<T extends XxxViewport>`） | `forged-wheel.ts:77-83`、`safety-tires.ts:51-60` |
| **R02-7** | 「key 存在即通过」型浅 guard **6 份** | `about.ts:11-16`、`wheel-capabilities.ts:15-20`、`forged-wheel.ts:44-49`、`custom-aluminum.ts:45-50`、`ev-components.ts:51-56`、`safety-tires.ts:19-24` |
| **R02-8** | `/fh/v1/pages` 读取器 **2 份**（`pages.ts` 与 `inquiry-content.ts` 各建一套 `PageRead`/`SitePageDocument` 解析） | `pages.ts:20-70` + `:79-98` **vs** `inquiry-content.ts:171-197`（`PageRead<T>` 类型 `:171-173`、`readInquiryPage` `:175-197`） |
| **R02-9** | `textFields(record, fields)` 型 helper 至少 3 种写法 | `flow-formed.ts:81-82`、`conversion-pages.ts:20-23` + `inquiry-content.ts:95-98` + `legal.ts:44-46` |
| **R02-10** | 首页内容校验两套 | `homepage.ts:34-43` **vs** `page-view.ts:50-77` |

> **对「文件多 = 重复」这个伪命题的裁定**：21 个文件的**领域切分是合理的**（每个业务页面一族一个 adapter，各自映射到 `@/content/types` 的领域类型）。真正的重复不在「文件数」，而在**上面这 10 条横切工具函数**——它们本可以是 1 个 `wordpress/normalize.ts` + 1 个 `wordpress/media-resolver.ts`。

### 风险

- **R02-1（High）**：`as T` + 浅 guard 的组合意味着「WordPress 内容被改坏」不会报错，只会**渲染出一半正确的内容**。最坏情况：某个 key 从 `object` 变成 `string`，`about.ts:11-16` 的 `.every(key => candidate[key] && typeof candidate[key] === "object")` 返回 false → 回退本地英文 —— 这还算好的。真正危险的是 `custom-aluminum.ts:45-50`（只查 `!== undefined`）：一个 `methods: []` 也能通过，然后 `source.methods.items.flatMap` 在 `:71` 处抛异常或在 `:87` 处渲染空。
- **R02-2（Medium）**：`R02-2` 的两份 `normalizeImage` 若一方被修（例如允许无 alt 的装饰图），另一方不会跟着改，`pages` 与 `insights` 两条线会呈现不同的图片可用性。
- **R02-3（Medium）**：`R02-8` 的 `/fh/v1/pages` 双读取器是**最危险的一条**：`pages.ts:20-70` 已经实现了 v2→v1 双读 + 语言门槛，而 `inquiry-content.ts:175-197` 自己又写了一遍**只读 v1、不查 locale_status、不查 seo_by_locale** 的版本。→ 询盘页的语言门槛与其它页面**不是同一套规则**。
- **R02-4（Low）**：`index.ts` + `types.ts` 的死代码会让新加入者把死契约当作「统一契约」去扩展，进一步分叉。

### 建议动作

1. **在 `client.ts` 加一层运行时校验出口**：`wpReadRaw()` 返回 `unknown`，各 contract 用 Zod 解析。最低成本版：先给 **3 个收益最高的端点**加 schema —— `/fh/v2/pages`、`/fh/v1/guides`、`/fh/v1/wheels`。`inquiry-content.ts` 与 `pages.ts` 的手写 guard 可以保留作为第二道，但网络层必须有 schema。
2. **把读路径的错误分类补齐**：`wpRead` 返回 `{ ok: true, data } | { ok: false, reason: "not_configured"|"network"|"client"|"server", status? }`，与已有的 `WpWriteFailureReason` 对齐（这个枚举已经写好了，直接复用）。
3. **抽 `src/lib/wordpress/normalize.ts`**：收掉 R02-1 / R02-2 / R02-3；**抽 `src/lib/wordpress/media-map.ts`**：收掉 R02-4 / R02-5 / R02-6。
4. **删 `inquiry-content.ts:171-197`，改调 `pages.ts` 的读取器**：一次性消灭 R02-8 与「询盘页语言门槛不同步」这条隐性 bug 源。
5. 删 `types.ts` 的死类型与 `client.ts:299-317` 的 `wpCollection`/`wpItem`；删 `index.ts` 或给它在 `tsconfig` 里加 `"noUnusedLocals"` 之外的显式消费方。
6. 把 `insights-contract.ts` 的 Gutenberg 解析器（`:118-421`）拆到 `src/lib/wordpress/gutenberg.ts`，让 `*-contract.ts` 回归「类型 + 归一化入口」。

### 依赖

- 建议 2 的错误分类会改变 `pages.ts` / `insights.ts` 的返回签名 → 需要与 **Agent B**（`src/lib/inquiry/store.ts:280` 也消费 `wpWrite`）与 **Agent C**（`generateMetadata` 的 fallback 分支）同步。
- 建议 1 的 Zod schema 需要 **Agent B** 确认 WP 侧真实返回形状（PHP 定义在 `fenghuai-pages.php:160-178` 等，B 号 Agent 读得到全貌）。

### 验收方式

- `grep -c 'as T' src/lib/wordpress/client.ts` → 0（网络层不再 `as`）。
- `grep -rn "from \"zod\"" src/lib/wordpress` → ≥1（至少一个端点有 schema）。
- `grep -rn "resolveWordpressMediaCollection\|restoreBoundaryCopy" src/lib/wordpress` 的 `restoreBoundaryCopy` 定义数 → 1。
- `grep -rn "readInquiryPage" src/lib/wordpress` → 0。
- 故意让本地 WP 返回 500：`pages.ts` 的返回值应能区分 `"cms-error"` 与 `"missing-locale"`。

---

## M03 WordPress 内容模型

**成熟度**: 3/5
**状态**: 部分满足

### 证据

**7 个 MU 插件是「按业务域切分」还是「功能重复」？**

> **结论：按业务域切分，7 个文件职责不重叠；但 `wheel` 域被拆成 3 层（wheels / wheel-authoring / insights-authoring 里的 repeater），其中 2 层的分工需要看注释才分得清，属「可理解但易误操作」的切分。**

- [E1] `fenghuai-inquiries.php:3-4` —「注册 `fh_inquiry` 文章类型、幂等键 / 发件箱 / 邮件事件三张专用表，提供 WordPress 唯一写入端点 `POST /fh/v1/inquiries`」→ 域：**询盘持久化 + 投递**。3,029 行。（属 Agent B 深审范围，此处只作职责定位）
- [E1] `fenghuai-wheels.php:3-4` —「注册 `wheel_model` 文章类型、尺寸/工艺分类法，以及『发布决定』与『事实快照』两组字段。**本层只保存编辑决定，不复制事实层规格**」→ 域：**轮毂发布决策层**。常量 `:30-32` `FH_WHEEL_POST_TYPE='wheel_model'`、`FH_WHEEL_TAX_DIAMETER`、`FH_WHEEL_TAX_PROCESS`；`:35` `FH_WHEEL_FACT_PREFIX='fact_'`
- [E1] `fenghuai-wheel-authoring.php:3-4` —「为 `wheel_model` 提供可视化多规格、媒体库图库和稳定公开 REST 契约」→ 域：**轮毂编辑 UI + REST 输出**。`:16` `FH_WHEEL_AUTHORING_POST_TYPE='wheel_model'`（与上一条**同一个 CPT**）；`:314` `register_rest_route('fh/v1', '/wheels', ...)`
- [E1] `fenghuai-pages.php:3-4` —「用 WordPress 原生 Page 管理首页、公司与产品线页面的结构化文案、SEO 和媒体」→ 域：**原生 Page 接管**。`:12-25` 15 个 meta 常量（`fh_page_key` / `fh_publication_status` / `fh_content_json` / `fh_content_by_locale_json` / `fh_seo_title` / `fh_seo_by_locale_json` / `fh_locale_status_json` / `fh_page_locale` / `fh_translation_group` / `fh_page_schema_version` …）；`:28` `FH_PAGE_LOCALES = ['en','zh','es','th']`
- [E1] `fenghuai-guides.php:3-4` —「为 Insights 注册独立文章类型、稳定 REST 契约、双重发布门槛与编辑预览字段」→ 域：**Insights 读取契约**。`:15` `FH_GUIDE_POST_TYPE='fh_guide'`、`:18` `FH_GUIDE_NATIVE_POST_TYPE='post'`（**双 CPT 并存：新 `fh_guide` + 原生 `post`**）
- [E1] `fenghuai-insights-authoring.php:3-4` —「用可增删排序的段落编辑器替代原始 JSON，并为每篇 Insights 文章关联批准图片」→ 域：**Insights 编辑 UI**。`:15-16` 同样两个 CPT 常量；`:18` `FH_GUIDE_ACF_GROUP_KEY='group_fh_insights_structured'`
- [E1] `fenghuai-content-webhooks.php:3-4` —「轮毂、原生博客与原生页面保存、撤回或删除后，以共享密钥通知 Next.js 失效对应缓存」→ 域：**变更事件（出向 webhook）**。`:15-16` 两个 option 名
- → **7 个插件 = 5 个业务域（轮毂 / 页面 / Insights / 询盘 / webhook）× 2 个域被拆成「数据层 + 编辑层」两份**。切分沿革清楚（文件头 Description 都写了「本层」的关系），**不是功能重复**。唯一的结构隐患是：`fenghuai-wheels.php` 与 `fenghuai-wheel-authoring.php` **共享 `wheel_model` 这一个 CPT**，两个文件的常量分开定义（`:30` vs `:16`），改 CPT 名要改两处。

**V3.0 的 Headless Core 六项能力，有几项？**

| 能力 | 有？ | 证据 |
|---|---|---|
| 1. 统一内容读取 | **部分** | `fh/v1/pages`（`fenghuai-pages.php:93`）+ `fh/v2/pages`（`:102`）+ `fh/v1/guides`（`fenghuai-guides.php:229`）+ `fh/v1/wheels`（`fenghuai-wheel-authoring.php:314`）= **4 个读取端点，3 个 namespace 版本（`fh/v1`×3、`fh/v2`×1）**。**不是单一读取接口**，且 `fh/v1/pages` 与 `fh/v2/pages` 是两代并存（`:114-116` 注释：「v2：逐语言独立 Page 契约。旧 `/fh/v1/pages` 不改变，迁移由前端双读控制」）。 |
| 2. 语言翻译关系 | **部分** | 有 `FH_PAGE_META_TRANSLATION_GROUP`（`fenghuai-pages.php:24`），写入（`:649` `update_post_meta($postId, FH_PAGE_META_TRANSLATION_GROUP, $translationGroup)`）与读出（`:169` `'translation_group' => ...`）。**但只在 `fh/v2/pages` 的输出里作为字符串透传，前端 `pages-contract.ts` 里根本没定义 `translation_group` 字段**（`pages-contract.ts:6-24` 的 `WordpressPageFields` 无此字段）→ **关系数据存在，但读取链路上被丢弃了。** 翻译关系实际靠 `(page_key, locale)` 元组承担（`fenghuai-pages.php:133-136` 的 meta_query）。 |
| 3. 结构化块输出 | **有（两种含义都有）** | ① Gutenberg 块 → 前端 `insights-contract.ts:118-421` 白名单解析器把 `post.content.rendered` 转成 `GuideArticleSection[]`；② 首页模块化：`fenghuai-pages.php:31` `FH_HOME_MODULES` 定义 H01–H05，前端 `page-view.ts:118-127` `CMS_MODULES` 与之镜像。**两侧常量必须手工保持一致，无共享 schema。** |
| 4. 变更事件 | **有** | `fenghuai-content-webhooks.php:3-4` 明确「保存、撤回或删除后，以共享密钥通知 Next.js 失效对应缓存」；消费端 `src/app/api/revalidate/wordpress/route.ts`（BASELINE §5.1，66 行）。HMAC 密钥 `WP_REVALIDATE_SECRET`（`.env.example`）。 |
| 5. 受控写入 | **有（且设计正确）** | 唯一写端点 `POST /fh/v1/inquiries`（`fenghuai-inquiries.php:485`），服务密钥头 `X-FH-Service-Key`（`client.ts:246`），有 `not_configured` 前置拒绝（`client.ts:227-249`）。**注意：内容侧（pages/guides/wheels）完全没有写端点** —— 编辑只在 wp-admin 内发生。这是正确的 headless 边界。 |
| 6. 健康检查 | **无** | `grep -rn "health\|_ping" mu-plugins/*.php` → **0 命中**。`fenghuai-guides.php:434` 只有一个后台诊断用的 `'acf_installed' => function_exists('acf_add_local_field_group')` 检查项，不是健康端点。前端 `compose.yml` 的 healthcheck 打的是 `/robots.txt`（`compose.yml:49-56`），**该路径完全不触达 WordPress** —— 即容器「健康」不代表 CMS 可达。 |

> **得分：6 项里 2 项完整（变更事件、受控写入）+ 2 项部分（统一读取、语言翻译）+ 1 项有但两侧脱钩（结构化块）+ 1 项无（健康检查）= 2.5/6。**

**CPT 注册在哪？有哪些？**

- [E1] `wheel_model` → `fenghuai-wheels.php:121-124`（`add_action('init','fh_wheel_register_post_type')`）
- [E1] `fh_guide` → `fenghuai-guides.php:55`（`register_post_type(FH_GUIDE_POST_TYPE, ...)`）
- [E1] `fh_inquiry` → `fenghuai-inquiries.php:336-339`
- [E1] **原生 `post` 被复用为 Insights 的真实容器**：`fenghuai-insights-authoring.php:99` ACF group 的 `location` 是 `post_type == 'post'`（`FH_GUIDE_AUTHORING_NATIVE_POST_TYPE`）。→ **Insights 有两个可能的来源（`fh_guide` 与原生 `post`），由 option `fh_guides_authoritative` / `fh_guides_native_authoritative` 切换**（`fenghuai-guides.php:16`/`:19`）。
- [E1] **原生 `page` 被全面接管**：`fenghuai-pages.php:550` `add_action('save_post_page','fh_pages_save_meta',20)`，meta 驱动。
- [E1] 分类法：`wheel_diameter` / `wheel_process`（`fenghuai-wheels.php:31-32`）。**`post` 无自定义分类法**（`fenghuai-guides.php:39` 的 `category` 是 ACF 字符串字段，不是 taxonomy）。

**ACF 字段组是否落盘可复现？**

- [E1] **没有 `acf-json` 目录。** `find local-wp/wp-data/wp-content -name "acf-json"` → **0 结果**。
- [E1] 唯一的 ACF 字段组用代码注册：`fenghuai-insights-authoring.php:88-118`（`add_action('acf/init','fh_guide_authoring_register_acf_fields')` → `acf_add_local_field_group([...])` 于 `:109`，`'location' => post_type == post`，`'show_in_rest' => 0` 于 `:116`）
- [E1] 其余所有内容字段都是**直接 `update_post_meta` / `get_post_meta` 的裸 meta**，不经 ACF：`fenghuai-pages.php:12-25` 15 个 meta key、`fenghuai-wheels.php:35` `fact_` 前缀。→ **字段定义分散在 PHP 常量 + wp-admin 手写表单 + JS 里，没有 schema 文件。**
- [E1] `fenghuai-insights-authoring.php:92` `if (!function_exists('acf_add_local_field_group')) return;` → **ACF 未装时字段组静默消失**，编辑器退化为裸 meta 编辑，无报错。

**`entityId` 跨语言稳定标识存在吗？**

- [E1] **不存在。** `grep -rn "entity_id\|entityId" mu-plugins/*.php` → **0 命中**。
- [E1] 实际承担跨语言身份的是 **`(page_key, locale)` 二元组**：`fenghuai-pages.php:133-136` 的 meta_query 同时按 `FH_PAGE_META_KEY` 与 `FH_PAGE_META_LOCALE` 查；前端 `pages-contract.ts:72` `if (fields?.page_key !== key || fields.locale !== locale) return { status: "missing-locale" }`。
- [E1] **`translation_group` 字段存在但被丢弃**（见上「语言翻译关系」）。
- → 跨语言稳定标识是**「业务 key + locale」**，不是 slug（这点做对了，`page_key` 是业务 key 不是 slug）。但**没有 group 级身份**，导致「同一条内容有哪些语言版本」这个查询在读取 API 上无法回答 —— 只能前端逐个 locale 轮询（`homepage.ts:153-159` `getHomepagePublicLocales()` 就是这么干的：`Promise.all(LOCALES.map(locale => getHomepagePageView({locale})))`）。

**关于「没装 Polylang」的裁定**

> **自研方案的真实形态**：Page 级用 **「每语言一条独立 Page 记录」**（`fh/v2/pages`，`fenghuai-pages.php:128-137` 按 key+locale 查），Insights 级用 **「同一条 post 内的 `translations{}` + `translation_status{}` 嵌套」**（`insights-contract.ts:17-28`）。
> **两条线用了两种不同的多语言模型** —— 这才是真问题，而不是「缺 Polylang」。

- [E1] Page 模型：语言 = **独立 post**。证据：`fenghuai-pages.php:102-111` 的 v2 端点签名要求 `key` + `locale` 双必填；`:128-137` 用 meta_query 找那一条；`:139` 独立记录不存在时返回 `status: 'missing-locale'`。
- [E1] Insights 模型：语言 = **同一 post 的一个 key**。证据：`insights-contract.ts:17-27` `translations?: Record<string, Partial<{title, summary, category, reading_time, answer, detail, sections, seo_title, seo_description}>>`；`:450-452` 取 `fields?.translations?.[locale]`，非 en 且无 translation 直接 `return null`。
- [E1] Page 模型：语言门槛 = `locale_status?: Record<string, "draft"|"approved"|"withdrawn">`（`pages-contract.ts:17`），`pages-contract.ts:133` `if (locale !== "en" && !preview && fields?.locale_status?.[locale] !== "approved") return null`。
- [E1] Insights 模型：语言门槛 = `translation_status?: Record<string, "draft"|"approved"|"withdrawn">`（`insights-contract.ts:28`），`:452` 同款判断。
- → **两套语义等价、实现独立的翻译门槛。** 结果是：新增一个语言时，要改 **两处** 数据模型、**至少 4 处** 检查代码。这就是「缺 Polylang」的真实代价，但代价来自自研的双模型，不是来自没用插件。

### 已具备

- 7 个 MU 插件**业务域清晰、职责不重叠**，每个文件头 Description 都写明「本层做什么 / 不做什么」（E1 全部 7 个文件 `:3-4`）
- **唯一的对外写端点只有 1 个**（`fh/v1/inquiries`），内容侧零写端点 —— headless 边界干净
- **变更事件具备**（webhook + HMAC + 前端消费路由）
- **双重/三重发布门槛**：`publication_status`（draft/approved/withdrawn）+ WP 的 `post_status` + 语言级 `locale_status` / `translation_status` 三层叠加（`pages-contract.ts:74/82/133`、`insights-contract.ts:446/452`）
- **`page_key` 是业务 key 而非 slug**，因此改 slug 不会断链（`fenghuai-pages.php:145-146` 注释亦印证 key 与 slug 分离）
- **ACF 字段组以代码注册**（`fenghuai-insights-authoring.php:109`），不是「只在数据库里的配置」，至少这一处是可复现的（虽然不在 `acf-json`）

### 缺口

| ID | 描述 | 严重度 | 阻塞上线 |
|---|---|---|---|
| G03-1 | **无健康检查端点**（6 项能力唯一空缺）。`compose.yml:49-56` 的 healthcheck 打 `/robots.txt`，不触达 CMS。CMS 挂了容器仍报 healthy。 | **High** | 是（运维不可观测） |
| G03-2 | **没有 `acf-json`，字段定义不可复现。** 15 个 `fh_*` meta（`fenghuai-pages.php:12-25`）+ `fact_*` meta（`fenghuai-wheels.php:35`）+ `wheel_model` 决策字段 + `fh_guide` authoring 字段，**全部靠 PHP 常量 + 手写 wp-admin 表单 + JS 约定**。换一台机器 / 重建环境，字段结构无法从代码恢复（只能靠脚本 `scripts/import-*.php` 回填数据）。 | **High** | 是（环境不可重建） |
| G03-3 | **多语言两套模型并存**（Page=独立 post；Insights=嵌套 translations）。新增语言需双线改动，且两条线的门槛/回退语义各自实现。 | High | 否 |
| G03-4 | **`translation_group` 字段被写入却在前端契约里丢失**（`fenghuai-pages.php:169` 有输出 → `pages-contract.ts:6-24` 无字段 → 无消费）。翻译关系数据白存。 | Medium | 否 |
| G03-5 | **没有 `entityId` 级稳定标识。** 跨语言「同一条内容」无法在读取 API 上表达，导致 `homepage.ts:153-159` 需要 N 次请求轮询所有 locale 才能判断「哪些语言已发布」。 | Medium | 否 |
| G03-6 | **`fh/v1/pages` 与 `fh/v2/pages` 两代并存**（`fenghuai-pages.php:93`/`:102`），前端 `pages.ts:20-70` 也在做 v2→v1 双读回退。迁移窗口未收口。 | Medium | 否 |
| G03-7 | **Insights 双 CPT 并存**：`fh_guide`（`fenghuai-guides.php:15`）与原生 `post`（`fenghuai-insights-authoring.php:99` ACF location），由 option 切换。两个 option（`fh_guides_authoritative` / `fh_guides_native_authoritative`）谁在校验？**待核实**（PHP 侧是否有互斥检查，本轮未定位到）。 | Medium | 否 |
| G03-8 | **ACF 缺失时静默降级**：`fenghuai-insights-authoring.php:92` `if (!function_exists(...)) return;` —— 没有 admin notice、没有 log。 | Low | 否 |
| G03-9 | `wheel_model` CPT 常量在两个文件双份定义（`fenghuai-wheels.php:30` / `fenghuai-wheel-authoring.php:16`）。 | Low | 否 |
| G03-10 | **仓库存在 MU 插件双份拷贝**（见 M01 G01-3，`diff -rq` 退出码 0）。 | High | 是 |

### 重复实现

- **R03-1**：MU 插件整目录两份（`local-wp/mu-plugins/` ≡ `local-wp/wp-data/wp-content/mu-plugins/`，7 文件 5,711 行 ×2）
- **R03-2**：`wheel_model` CPT 常量两处（`fenghuai-wheels.php:30`、`fenghuai-wheel-authoring.php:16`）
- **R03-3**：Insights 的语言门槛两处语义（PHP 侧 `fh_guides_authoritative` option 一条路，`fh_guides_native_authoritative` 另一条路；前端 `insights-contract.ts:452` 再判一次）
- **R03-4**：首页模块定义两处手工镜像（PHP `fenghuai-pages.php:31` `FH_HOME_MODULES` **vs** TS `page-view.ts:118-127` `CMS_MODULES`）—— 任何新增模块必须同时改 PHP 与 TS，没有共享 schema

### 风险

- **R03-1（High）**：无健康检查 + healthcheck 打 `/robots.txt`。生产最可能的故障模式（WP 容器 OOM / MySQL 挂）**不会被任何探针发现**，只会表现为「页面内容退回英文快照」——而由于 M02 的 `return null` 静默设计，日志里也只是一行 `console.error`。
- **R03-2（High）**：字段结构不可复现 + 数据靠 import 脚本回填 = **恢复点是「数据库备份」，不是「代码」**。一次误删 meta 需要靠 `scripts/` 里的一次性 PHP 脚本救，而这些脚本未进 CI（BASELINE §9 已指出）。
- **R03-3（Medium）**：`translation_group` 白写意味着运维以为「翻译组已建立」，但读取链路根本不用它 —— 会误导后续多语言规划和 hreflang 设计。

### 建议动作

1. **加一个 `GET /fh/v1/health`**：返回 `{ ok, wp_version, db_ok, authoritative: {pages, guides, wheels, inquiries}, counts }`，并把 `compose.yml` 的 healthcheck 改打这个端点。
2. **启用 ACF Local JSON**（`functions.php` 或 mu-plugin 里 `add_filter('acf/settings/save_json', ...)` + `acf/settings/load_json`），把 `group_fh_insights_structured` 落盘到 `acf-json/`。即使其它 meta 不走 ACF，至少把**唯一的 ACF 组**纳入版本控制。
3. **把 15 个 `fh_*` page meta 提升为代码可读的 schema 文件**（YAML/JSON），PHP 与 TS 两侧从同一份生成 —— 一并消灭 R03-4。
4. **统一多语言模型**：给 Page 也加 `translations{}` 嵌套（或反之给 Insights 也拆独立 post）。短期最低成本：**把 `translation_group` 补进 `pages-contract.ts` 的 `WordpressPageFields` 并在 `SitePageDocument` 暴露**，至少让读取链路能用它做 hreflang 与「已发布语言」查询（替代 `homepage.ts:153-159` 的 N 次轮询）。
5. **删一份 MU 插件目录**（与 M01 动作 3 同一条）。
6. 收敛 `fh/v1/pages` → `fh/v2/pages`，删掉前端 `pages.ts:43-69` 的 legacy 回退分支。

### 依赖

- `fenghuai-inquiries.php` 3,029 行的内部结构 → **Agent B**。
- 健康端点的运维价值、Docker healthcheck 改法 → **Agent D**。
- 多语言与 hreflang / sitemap 的交互 → **Agent C**（`localizedEntries` 全量展开问题见 BASELINE §5.3 已交 C）。

### 验收方式

- `curl -s localhost:8081/wp-json/fh/v1/health | jq .ok` → `true`
- `find . -name "acf-json" -type d` → ≥1
- `grep -rn "FH_PAGE_META_" local-wp/wp-data/wp-content/mu-plugins/fenghuai-pages.php | wc -l` 与 `pages-contract.ts` 的字段数一致（或有生成器保证）
- `grep -n "translation_group" src/lib/wordpress/pages-contract.ts` → ≥1
- `find . -name "fenghuai-pages.php" -not -path "*/node_modules/*"` → 1 条

---

## M04 页面组件系统

**成熟度**: 3/5
**状态**: 部分满足

### 证据

**`home` / `sections` / `ui` 的分层是否清晰？**

> **结论：分层在「目录名」上存在，在「职责」上不成立。`ui/` 是死目录，`sections/` 混了首页模块与非首页组件，`home/` 只装了 hero 一种。**

- [E1] `src/components/ui/` **只有 1 个文件** `button.tsx`（3,211 B），且**全仓零 import**：`grep -rn "components/ui/button\|ui/button" src` → 0 命中。项目实际用的是 `@astryxdesign/core/Button`（`src/components/inquiry-form.tsx:7` `import { Button } from "@astryxdesign/core/Button";`）。→ **`ui/` 是 shadcn 脚手架残留，`components.json` 的 `aliases.ui` 指向它，但没人用。**
- [E1] `src/components/home/` 的内容 = `hero/`（5 个文件：`hero-background` / `hero-media` / `hero-product-card` / `hero-product-grid` / `home-hero`）+ `home-closing.tsx` + `project-route-section.tsx`。→ **只覆盖 H01 / H04 / H05 三个首页模块**。
- [E1] `src/components/sections/` 的内容 = `dealer-cta.tsx` / `page-hero.tsx` / `product-showcase.tsx`（H02）/ `trust-strip.tsx`（H03）/ **`home-hero.tsx.retired`（已退役，非 `.tsx`）**。→ **H02 / H03 在 `sections/`，H01 / H04 / H05 在 `home/`。首页 5 个模块散在两个目录。**
- [E1] 首页路由的实际 import 印证了这一点：`src/app/page.tsx:4-8`
  ```
  import { HomeClosing } from "@/components/home/home-closing";
  import { HomeHero } from "@/components/home/hero/home-hero";
  import { ProjectRouteSection } from "@/components/home/project-route-section";
  import { ProductShowcase } from "@/components/sections/product-showcase";   ← 跨目录
  import { TrustStrip } from "@/components/sections/trust-strip";             ← 跨目录
  ```
- [E1] 其余 40+ 个组件完全平铺在 `src/components/` 根（`family-card` / `product-card` / `wheel-card` / `process-diagram` / `param-table` / `faq-accordion` / `prose-article` …），无 `shared/` / `primitives/` 层。

**是否存在同一视觉模块的多份实现？**

> **结论：4 套「图片 + 标题 + CTA」卡片 + 2 套按钮体系 + 2 套 hero。**

**卡片（4 份，全部独立实现）**

| 文件 | 行数 | 用途 | 关键实现 |
|---|---|---|---|
| `src/components/family-card.tsx` | 111 | 产品族卡片 | 裸 `<img>`（`:63`），`alt=""`（`:65`），hover 第二张图（`family.hoverImage`） |
| `src/components/product-card.tsx` | 97 | 产品卡（另一套） | 裸 `<img>` ×2（`:46` 有 alt `:48`；`:59` hover 图 `alt=""`），`onError` 降级（`:51`/`:65`） |
| `src/components/wheel-card.tsx` | 114 | 轮毂卡 | 裸 `<img>`（`:77`）带 `width/height/loading/fetchPriority`（`:80-84`） |
| `src/components/wheels/wheel-catalogue-card.tsx` | 132 | 目录页轮毂卡 | `next/image`（`:41`）+ `copy.imageAlt(model)`（`:43`）+ 加购按钮 |

- [E1] 四者都自己处理「hover 换图 / 图失败降级 / 尺寸 / 圆角 / 渐变」，**没有共享 primitive**。`wheel-card.tsx` 与 `wheels/wheel-catalogue-card.tsx` 的语义几乎重叠（都是轮毂卡），只是渲染出口不同（一个裸 img 一个 next/image）。

**按钮（2 套）**

- [E1] `src/components/ui/button.tsx`（cva + class-variance-authority，3211 B）**零消费**
- [E1] 实际按钮 = `@astryxdesign/core/Button`（`inquiry-form.tsx:7`）
- [E1] 另有 **11 个文件直接写裸 `<button>`**（`grep -rln "<button" src/components`）：`guides-accordion` / `inquiry-form` / `offset-calculator` / `preview-banner` / `process-explorer` / `site-header` / `wheels/inquiry-cart-summary` / `wheels/mobile-wheel-filter-drawer` / `wheels/pcd-search-group` / `wheels/wheel-catalogue-filters` / `wheels/wheel-variant-selector`

**Hero（2 套 + 1 个退役）**

- [E1] `src/components/home/hero/home-hero.tsx`（首页 H01）
- [E1] `src/components/sections/page-hero.tsx`（内页 hero，`page-hero.tsx:108-114` 裸 `<img>`，有 alt）
- [E1] `src/components/sections/home-hero.tsx.retired`（退役文件仍在盘上）

**有没有「模块注册 / PageView 动态渲染」机制？**

> **结论：首页有，且是真实的 discriminated union + switch；但它是「5 个固定槽位」不是「可注册的模块表」，且只服务首页一条路由。**

- [E1] 类型：`src/content/types.ts:176-191` `HomepageModuleView` = **5 个成员的 discriminated union**（`{ type: "home.hero"; id: "H01"; order: number; required: true; content: ... }` … `home.closing`/H05）。
- [E1] 构建：`src/content/page-view.ts:78-90` `buildHomepageModules(content, order)` → **硬编码 5 行数组**，只支持改 `order`，不支持增删模块。
- [E1] 校验：`page-view.ts:92-112` `validateHomepageModules` —— 强制 `length === 5`、id 齐全、order 唯一、**H01 必须最小 order、H05 必须最大 order**（`:101-102`）。→ **即使 WordPress 里拖动顺序，首尾也被钉死。**
- [E1] CMS 解析：`page-view.ts:118-127` `CMS_MODULES = { H01:"hero", H02:"product-line-grid", H03:"capabilities", H04:"process", H05:"closing" }`，与 PHP `fenghuai-pages.php:31` `FH_HOME_MODULES` 手工镜像。
- [E1] 渲染：`src/app/page.tsx:38-51` **`switch (module.type)` + 5 个 case 的 JSX**。case 内是硬编码组件 import，不是查表。
  ```
  case "home.hero":          return <HomeHero ... />;
  case "home.product-lines": return <ProductShowcase ... />;
  case "home.capabilities":  return <TrustStrip ... />;
  case "home.delivery":      return <ProjectRouteSection ... />;
  case "home.closing":       return <HomeClosing ... />;
  ```
- → **这是「模块化数据 + 硬编码渲染」，不是「模块注册表 + 动态渲染」。** 好处：类型安全、编译期穷尽检查。代价：新增模块必须改 4 处（`types.ts` union、`page-view.ts` 数组 + `CMS_MODULES`、`page.tsx` switch、PHP `FH_HOME_MODULES`）。
- [E1] **其余 37 个路由完全没有模块机制**：全部是 page.tsx 里直接拼组件（例：`src/app/insights/[slug]/page.tsx` 直接 `<ProseArticle>` + `<DealerCta>`）。
- [E1] `src/components/sections/product-showcase.tsx:19` 里有 `data-module-id="H02"` —— **组件自己写着模块 id**，说明模块语义是双处硬编码的。

**`src/content/` 的定位：类型化 fallback 还是第二套数据库？与 WordPress 的权威关系在代码里如何表达？**

> **结论：`src/content/` 是「类型化 fallback + 事实上的一方数据源」。权威关系在代码里表达为 3 种互不相同的模式，其中第 3 种已经不是 fallback。**

- [E1] **模式 A — 「WP 优先，本地兜底」（多数页面）**：`about.ts:21-26`、`wheel-capabilities.ts:29-34`、`safety-tires.ts:29-34`、`forged-wheel.ts:61-69`、`custom-aluminum.ts:55-60`、`ev-components.ts:61-66`、`product-lines.ts:111-116` —— 结构统一为 `resolveLocalized({ requested: native && isXxx(native.content) ? native.content : null, default: localConstant, locale, scope })`。
- [E1] **模式 B — 「只有 en 允许 fallback，其它语言缺失即 notFound」**：`homepage.ts:90-110` —— `if (locale === "en" && !preview && native.status === "temporarily-unavailable")` 才用本地；其它语言直接 `return native`（`notFound()`）。**这是最严格的一种。**
- [E1] **模式 C — 本地数据已经是一方数据源（不是 fallback）**：
  - `legal.ts:83-86` 先 `getLegalDocument(slug)`，取不到直接 `throw new Error(...)` —— **本地是硬依赖**
  - `flow-formed.ts:128` `publicationGate: flowFormedWheelsPage.publicationGate` —— **发布门永远来自本地常量，WP 无法覆盖**
  - `flow-formed.ts:44-50` 注释明说：「`seo` 和 `publicationGate` **never move into the WP body**」
  - `forged-wheel.ts:57-60` + `:64` `slug` 和 `publicationStatus` 从本地常量重新贴回
  - `custom-aluminum.ts:40-43` / `ev-components.ts:46-49` / `flow-formed.ts:56-59` `restoreBoundaryCopy()` —— **WP 的 alt/caption 被本地内容强制覆盖**
  - `inquiry-content.ts:203-213` `withLocalUi()` —— `formUi` / `preparation` **永远取本地**，WP 的这两个字段被丢弃
- [E1] **规模证据**：`grep -rn "from \"@/content/" src/app src/components --include="*.tsx"` → **77 处引用，21 个不同 content 模块**（`automotive-scenes` / `bolt-patterns` / `custom-development` / `dealer-programs` / `faq` / `finish-guide` / `finishes` / `fitment` / `flow-formed-wheels` / `home-wheel-strip` / `inquiry-form` / `insights-visuals` / `legal` / `page-view` / `private-label` / `product-lines` / `resources` / `site` / `tools` / `types` / `wheel-detail`）。
  → **UI 层大量直接 import 本地内容常量，完全绕过 `src/lib/wordpress/` 的 adapter 层。** 这些页面对 WordPress 而言是**只读本地**。
- [E1] `src/content/wheel-publication.json` 是**构建期快照**（`client.ts:32-42` 注释明确提到 DEC-052：轮毂页面在请求时不读 WordPress，读构建期快照）。

### 已具备

- 首页有**真正的判别联合类型**（`content/types.ts:176-191`），`switch` 分支被 TypeScript 穷尽检查覆盖
- 模块顺序/完整性有**运行时校验**（`page-view.ts:92-112`），且校验规则比数据结构更严（钉死首尾）
- **三级回退语义被明确区分**（模式 A/B/C），且 `homepage.ts:90-93` 对「非英文不得静默复用英文」这条是**认真实现的**
- **证据边界被写进代码**：`custom-aluminum.ts:20-34`、`ev-components.ts:24-40`、`flow-formed.ts:31-41` 三处长注释解释「为什么 WP 的 alt/caption 必须被本地覆盖」，并写明「改正 WP 记录后此处自然 no-op」。**这是全项目对「内容权威性」思考最深的代码。**
- `restoreBoundaryCopy` 有明确的「一旦 WP 修正即为 no-op」的心智模型（3 处注释同款措辞）

### 缺口

| ID | 描述 | 严重度 | 阻塞上线 |
|---|---|---|---|
| G04-1 | **`ui/` 是死目录**（1 文件 / 零 import），实际按钮来自 `@astryxdesign/core`。`components.json` 仍在把 `ui` alias 指向它。新人会往里加组件，然后没人用。 | Medium | 否 |
| G04-2 | **4 套卡片独立实现，2 套轮毂卡语义重叠**（`wheel-card.tsx` 裸 img **vs** `wheels/wheel-catalogue-card.tsx` next/image），**无共享 primitive**。改一次视觉要改 4 处。 | **High** | 否（但视觉一致性会漂移） |
| G04-3 | **3 套按钮体系**：`ui/button.tsx`（死）、`@astryxdesign/core/Button`（在用）、11 个文件裸 `<button>`。 | Medium | 否 |
| G04-4 | **首页 5 个模块散在 `home/` 与 `sections/` 两个目录**（`src/app/page.tsx:4-8`），`sections/` 还混着非首页的 `page-hero` / `dealer-cta`。分层名不副实。 | Medium | 否 |
| G04-5 | **「模块系统」不是注册表，新增一个首页模块要改 4 处**（`content/types.ts:176-191`、`page-view.ts:82-88` + `:118-127`、`app/page.tsx:38-51`、PHP `fenghuai-pages.php:31`）。且 `page-view.ts:101-102` **禁止 H01/H05 换位**，CMS 里能拖但拖了会被判无效 → 编辑器体验与数据模型不一致。 | Medium | 否 |
| G04-6 | **37 个路由零模块化**。`/products`、`/capabilities`、`/insights` 等全部是 page.tsx 直接拼组件。新增一个可编辑区块必须改代码 + 重新部署，不能靠 CMS。 | **High** | 否（但限制内容运营自主性） |
| G04-7 | **UI 层 77 处直接 import `@/content/*`**，绕过 adapter 层。21 个 content 模块里有 `faq` / `finishes` / `fitment` / `bolt-patterns` / `dealer-programs` / `private-label` / `custom-development` / `tools` 等**根本没有任何 WP adapter**。→ **这些内容在 WordPress 里不可编辑。** | **High** | 否 |
| G04-8 | **`legal.ts:83-86` 的本地常量是硬依赖**（取不到就 throw）。一旦 `getLegalDocument(slug)` 因任何原因返回 undefined，整条路由 500。 | Medium | 否 |
| G04-9 | **`restoreBoundaryCopy` 是三处复制粘贴**（`custom-aluminum.ts:40-43` / `ev-components.ts:46-49` / `flow-formed.ts:56-59`），改一处漏两处的风险高。 | Medium | 否 |
| G04-10 | `src/components/sections/home-hero.tsx.retired` 留在盘上。 | Low | 否 |

### 重复实现

| ID | 内容 | 证据 |
|---|---|---|
| **R04-1** | 卡片 4 份（其中 2 份语义重叠） | `family-card.tsx`（111 行）/ `product-card.tsx`（97）/ `wheel-card.tsx`（114）/ `wheels/wheel-catalogue-card.tsx`（132） |
| **R04-2** | 按钮 3 套 | `ui/button.tsx` / `@astryxdesign/core/Button` / 11 个裸 `<button>` 文件 |
| **R04-3** | Hero 2 套 + 1 退役 | `home/hero/home-hero.tsx` / `sections/page-hero.tsx` / `sections/home-hero.tsx.retired` |
| **R04-4** | `restoreBoundaryCopy` 3 份逐字相同 | `custom-aluminum.ts:40-43` / `ev-components.ts:46-49` / `flow-formed.ts:56-59` |
| **R04-5** | `byId` Map 重建 5 份 | 见 M02 R02-4 |
| **R04-6** | 首页模块定义 4 处硬编码 | `content/types.ts:176-191` / `page-view.ts:82-88` / `page-view.ts:118-127` / `app/page.tsx:38-51` / PHP `fenghuai-pages.php:31` |
| **R04-7** | 模块 id 双处标注（组件自标 + 路由 switch） | `product-showcase.tsx:19` `data-module-id="H02"` vs `app/page.tsx:42-43` |

### 风险

- **R04-1（High）**：4 套卡片意味着**任何一次视觉/无障碍修正都极可能漏掉 1–2 处**。`wheel-card.tsx:77-86`（裸 img，有 alt、有 width/height、有 loading）与 `wheel-catalogue-card.tsx:41-43`（next/image，有 alt、无 width/height 依赖 fill）在**图片优化路径上已经不一致** —— 同一个轮毂在 `/` 与 `/products/wheels` 上走两条完全不同的图片管线。
- **R04-2（High）**：77 处直接 import `@/content/*` 意味着「内容能否在 CMS 编辑」取决于**开发者有没有给它写 adapter**，而不是取决于业务需要。目前 **21 个 content 模块中只有约 12 个有对应 adapter**，其余（`faq` / `finishes` / `fitment` / `bolt-patterns` / `dealer-programs` / `private-label` / `custom-development` / `tools` / `automotive-scenes`）**不可 CMS 编辑**，且这一事实在代码里没有任何标记（没有 `// LOCAL ONLY` 之类的约定）。
- **R04-3（Medium）**：`legal.ts:85` 的 `throw` 会让 support 页面整体 500，而它本来只是「取不到本地常量」这种纯代码错误 —— 上线后只有开发者能修。

### 建议动作

1. **删 `src/components/ui/`**（或把 `@astryxdesign/core/Button` 包一层放进去，让 alias 名副其实）。同删 `sections/home-hero.tsx.retired`。
2. **抽 `src/components/shared/media-card.tsx`**：把 4 套卡片的「图片容器 + hover 换图 + 失败降级 + 尺寸 + 圆角」收口，4 个卡片组件只保留各自的语义头部与 CTA。
3. **统一卡片图片出口**：先决定「轮毂图走 next/image 还是裸 img」，再统一 `wheel-card` 与 `wheel-catalogue-card`。这项与 M12 的 `remotePatterns` 风险直接相关（见 R12-1）。
4. **把首页 5 个模块的组件移到 `src/components/home/modules/`**，`sections/` 只留真正的跨页区块（`page-hero` / `dealer-cta`）。或者在 `content/types.ts:176` 的 union 里加一行 `component` 字段做注册表 —— 但代价是失去编译期穷尽检查，**建议保持 switch，只整理目录**。
5. **在 `src/content/*.ts` 每个文件头标注「有无 WP adapter」**，并加一个 CI 检查（有 adapter 的模块必须出现在 `src/lib/wordpress/` 某处 import 里）。这条能让「哪些内容不可编辑」变成可查询的事实，而不是靠人脑记。
6. `legal.ts:85` 的 `throw` 改为 `return fallbackDocument`（或在 build 期用断言保证）。

### 依赖

- 卡片图片统一 → **Agent C**（CWV / LCP 影响）与 **Agent D**（`next.config.ts` remotePatterns）。
- 「哪些 content 模块不可编辑」→ 需要 **Agent B/C** 确认这不是刻意（例如 `tools` / `faq` 可能确实设计为代码常量的结构化数据）。

### 验收方式

- `grep -rn "components/ui/" src` → 0 或 ≥1（不能是 0 命中却保留目录）
- `grep -c "restoreBoundaryCopy" src/lib/wordpress/*.ts` 的定义数 → 1
- `ls src/components/shared/` 存在且被 ≥3 个卡片组件 import
- `grep -rn "from \"@/content/" src/app src/components --include="*.tsx" | wc -l` → 显著下降，或每个 `@/content/*` 模块旁有 `// LOCAL ONLY` / `// ADAPTER: wordpress/xxx.ts` 注释

---

## M09 博客与案例

**成熟度**: 3/5
**状态**: 部分满足

### 证据

**Insights 走 `post` CPT？**

> **结论：是「双容器」——原生 `post`（当前真实编辑器）+ `fh_guide`（历史/兼容 CPT），由 option 切换 authoritative。前端不知道这件事，只认 `/fh/v1/guides` 一个端点。**

- [E1] `fenghuai-insights-authoring.php:15-16` `FH_GUIDE_AUTHORING_POST_TYPE='fh_guide'` + `FH_GUIDE_AUTHORING_NATIVE_POST_TYPE='post'`
- [E1] `fenghuai-insights-authoring.php:99` ACF 字段组 location = `post_type == 'post'`（`FH_GUIDE_AUTHORING_NATIVE_POST_TYPE`）→ **编辑器挂在原生 post 上**
- [E1] `fenghuai-insights-authoring.php:120-123` 注释：「Legacy `fh_guide` metadata remains readable during migration, but only the native Post editor owns this authoring field going forward.」→ **迁移已完成，`fh_guide` 只读**
- [E1] `fenghuai-guides.php:15-19` 两个 option：`FH_GUIDE_OPTION_AUTHORITATIVE='fh_guides_authoritative'`（`fh_guide` 侧）+ `FH_GUIDE_NATIVE_OPTION_AUTHORITATIVE='fh_guides_native_authoritative'`（`post` 侧）
- [E1] `fenghuai-guides.php:229` `register_rest_route('fh/v1', '/guides', ...)` —— **对外只有一个端点，CPT 细节被封装在 PHP 里**
- [E1] 前端：`insights.ts:41-48` `wpRead<WordpressGuideCollection>('/fh/v1/guides' + query, { restRoot: true, tags: [INSIGHTS_CACHE_TAG], noStore: preview })`
- [E1] 复用原生 `post` 的 `content.rendered`：`insights-contract.ts:43-44` `content?: { rendered: string }`，`:461` `normalizeGutenbergSections(record.content?.rendered) ?? legacySections` —— **只用 Gutenberg 正文一次，且只在 `locale === "en"` 时（`:460`）**

**`insights-contract.ts` 契约是什么？**

- [E1] 输入（WP 侧）：
  - `insights-contract.ts:5-35` `WordpressGuideFields`：`publication_status` / `summary` / `category` / `reading_time` / `reading_minutes` / `answer` / `needs_verification` / `detail` / `sections` / `seo_title` / `seo_description` / **`translations?: Record<locale, Partial<{...9 个字段...}>>`** / **`translation_status?: Record<locale, "draft"|"approved"|"withdrawn">`** / `image`
  - `:37-48` `WordpressGuideRecord`：`id` / `slug` / `status` / `title.rendered` / `excerpt.rendered` / `content.rendered` / `guide?` / **`acf?`（迁移期兼容）**
  - `:50-53` `WordpressGuideCollection`：`{ authoritative: boolean; items: WordpressGuideRecord[] }`
- [E1] 输出（UI 侧）：`:55-63` `InsightGuideDocument` = `{ guide: GuideEntry; seoTitle; seoDescription; source: "wordpress"|"local"; preview; publicationStatus: "draft"|"approved"|"withdrawn"; media?: MediaAsset }`
- [E1] `GuideEntry` 的字段（`:467-477`）：`slug` / `title` / `summary` / `category` / `readingTime` / `detail: GuideDetail[]` / `sections: GuideArticleSection[]` / `answer` / `needsVerification`
- [E1] **发布门槛（三重，全在 `:444-452`）**：`record.status === 'publish'` + `publication_status === 'approved'`（`:446`）+ slug 正则（`:447`）+ 语言版本存在（`:451`）+ 语言状态 approved（`:452`）
- [E1] **完整性门槛（`:465`）**：`if (!title || !summary || !category || !answer || !readingTime || !detail || !sections) return null;` → **7 个字段缺一即整条文章丢弃**（不是部分渲染）
- [E1] **SEO 有默认值**（这一点做得比 pages 好）：`:480` `text(localized.seo_title) || text(fields?.seo_title) || \`${title} — ${category} Guide\``，`:481` 同款保底为 `summary`。

**分类/标签/关联内容可用吗？**

- [E1] **分类：可用但是「自由文本字符串」，不是 taxonomy。**
  - `fenghuai-guides.php:39` `'category' => ['label' => '分类', 'type' => 'string']`（ACF/字段定义里是 `string`）
  - `fenghuai-guides.php:202` `'category' => (string) fh_guide_field_value($post_id, 'fh_category', 'fh_category')`
  - `insights-contract.ts:456` `const category = text(localized.category) || text(fields?.category);`
  - `src/content/resources.ts` 里的取值：`"Fitment"` / `"Construction"` / `"Finishing"` / `"Logistics"`（`resources.ts:199`、`:272`、`:343`、`:417` 等）
  - → **分类是字符串，无 taxonomy 表、无 term 关系、无计数。** 拼错一个 `"Fitment "`（尾空格，`text()` 会 trim）或 `"fitment"` 就会裂成两个分类。
- [E1] **分类的消费侧：`src/app/insights/page.tsx` 里 `grep "category"` → 0 命中。** 即**分类只被显示，不被筛选**。没有按分类过滤的 UI、没有分类页、没有 `/insights?category=`。
- [E1] **标签：不存在。** `fenghuai-guides.php` 里 `grep "tag\|taxonomy"` → 0 命中（唯一命中是 ACF 字段定义里的 `'category'`）。前端 `insights-contract.ts` 也无 tag 字段。
- [E1] **关联内容：不存在显式关联。**
  - 没有「相关文章」字段、没有 `related_posts`、没有 taxonomy 共现计算。
  - 唯一的隐式关联是 `category` 字符串相同（但 UI 不使用它）。
  - `src/app/insights/[slug]/page.tsx:1-73` 只有 `<ProseArticle>` + `<DealerCta>` + `<PreviewBanner>`，**无相关文章区块**。

**案例（Case Study）实体存在吗？**

- [E1] **不存在。** `grep -rni "case.study\|caseStudy" src local-wp/wp-data/wp-content/mu-plugins` → **唯一命中是 `src/content/custom-aluminum.ts:172` 的一句业务文案**（"These names describe assessment directions supplied in the supplied material..."），与「案例实体」无关。
- [E1] 无 `case_study` CPT（`grep "register_post_type"` 只返回 `wheel_model` / `fh_guide` / `fh_inquiry` 三个）
- [E1] 无 `/case-studies` 路由（`find src/app -name "page.tsx"` 38 个里无此类）
- → 项目**没有案例（Case Study）内容类型、没有路由、没有数据**。V3.0 若假设有案例，那是 V3.0 的高估。

**其他相关事实**

- [E1] **`generateStaticParams` 只从本地常量生成**：`src/app/insights/[slug]/page.tsx:20-22` `return guides.map((guide) => ({ slug: guide.slug }))`（`guides` 来自 `@/content/resources`）。→ **WordPress 里新增的文章，如果本地没有同名 slug，不会被预渲染。** 结合 E5「全部 46 路由 `ƒ` Dynamic」，实际影响被 Dynamic 渲染兜住，但 `generateStaticParams` 的语义已经失效（它声明了「build 时全量」，实际只覆盖本地）。
- [E1] **本地 fallback 永远是英文**：`insights.ts:19-21` `localInsightDocuments()` 从 `localGuides`（`@/content/resources`）构造，`localGuideDocument`（`insights-contract.ts:489-499`）把 `publicationStatus` 硬编码为 `"approved"`、`source` 为 `"local"`。→ **本地文章在代码层面永远「已批准」，没有撤回能力**。
- [E1] `insights.ts:49` `if (response === null || response.authoritative !== true)` → 回退本地；`:66-71` 若 WP 回答但无该语言版本，也回退（`requested: localized.length > 0 ? localized : null`）。→ **非英文读者可能看到英文文章** —— 与首页的严格策略（`homepage.ts:90-93`）**不一致**。

### 已具备

- **Wp → UI 的契约完整且严格**（`insights-contract.ts:55-63` + `:444-465` 的三重发布门槛 + 7 字段完整性门槛）
- **SEO 有三级保底**（`:480-481`），不会因为 WP 没填 seo 就丢 meta
- **Gutenberg 正文有沙箱解析器**（`:118-421`，见 M02「已具备」）
- **CPT 细节被封装在 PHP 内**，前端只认一个 `/fh/v1/guides` 端点 —— 迁移 `fh_guide` → `post` 时前端零改动，这是正确设计
- **`acf?` / `guide?` 双字段并存**（`:45-47`）为迁移期留了后路

### 缺口

| ID | 描述 | 严重度 | 阻塞上线 |
|---|---|---|---|
| G09-1 | **分类是自由文本，不是 taxonomy。** 无终止表、无计数、无校验。`insights-contract.ts:456` 直接取 `.category` 字符串。 | Medium | 否 |
| G09-2 | **分类没有任何消费侧 UI**（`app/insights/page.tsx` 无 category 过滤）。分类只显示不筛选。 | Medium | 否 |
| G09-3 | **无标签机制**（无 taxonomy、无 ACF 字段）。 | Medium | 否 |
| G09-4 | **无关联内容 / 相关文章**。`insights/[slug]/page.tsx` 无相关文章区块。 | Medium | 否 |
| G09-5 | **无案例（Case Study）内容类型/路由/数据。** 若 V3.0 要求，则整体缺失。 | **High**（若业务要求） | 是（若要求） |
| G09-6 | **非英文读者的回退策略与首页不一致**：Insights 静默回英文（`insights.ts:66-71`），首页直接 notFound（`homepage.ts:90-109`）。→ 同站两套语言政策。 | **High** | 否 |
| G09-7 | **`generateStaticParams` 只覆盖本地 slug**（`insights/[slug]/page.tsx:20-22`），与「build 时全量」的意图不符。 | Medium | 否 |
| G09-8 | **本地 fallback 硬编码 `publicationStatus: "approved"`**（`insights-contract.ts:496`），本地文章无法「撤回」。 | Medium | 否 |
| G09-9 | **`fh_guide` 与原生 `post` 双容器并存**，两个 authoritative option 的互斥关系未在前端/文档中固定（**待核实** PHP 侧是否校验互斥）。 | Medium | 否 |
| G09-10 | `insights-contract.ts:118-421`（约 300 行 Gutenberg 解析器）放在 contract 文件里，文件达 510 行。 | Low | 否 |

### 重复实现

- **R09-1**：`insights-contract.ts` 有**自己的** `text()` / `decodeHtmlText()` / `isStringArray()` / `normalizeImage()` / `normalizeDetail()` / `normalizeSections()`，与 `pages-contract.ts` 的同名工具**各自一套**（见 M02 R02-1 / R02-2 / R02-3）
- **R09-2**：分类的「字符串 + trim」在 PHP（`fenghuai-guides.php:202` → `(string)`）与 TS（`insights-contract.ts:456` → `text()`）两侧各做一次规范化，无共享枚举

### 风险

- **R09-1（High）**：G09-6 的语言政策不一致。同一站点，首页在 zh 缺失时 404，Insights 在 zh 缺失时给英文。对 SEO 而言这意味着 `/zh/insights/xxx` 会返回英文正文但**仍带 zh 的 hreflang/canonical**（`insights/[slug]/page.tsx:39` `localizedAlternates(...)`）→ **hreflang 声明与实际语言不符**，这是会被 Google 判为 soft 404 / 语言错配的经典情形。**必须交 Agent C 复核。**
- **R09-2（Medium）**：`insights-contract.ts:496` 本地文章永远 approved，而 WP 文章有 withdrawn。一旦 WP 侧撤回一篇文章，前端会**回退到本地英文版本继续发布** —— 「撤回」事实上无效。
- **R09-3（Medium）**：G09-5 若 V3.0 把案例当作卖点，则这是一整块业务能力缺失，而非「技术债」。

### 建议动作

1. **把 `category` 提升为 WordPress taxonomy**（`register_taxonomy('fh_guide_category', ['post','fh_guide'])`），并在前端加分类枚举（`z.enum` 或 const array），使拼错立刻可见。短期最低成本：在 `insights-contract.ts:456` 后加 `if (!KNOWN_CATEGORIES.includes(category)) return null;`。
2. **加分类筛选 UI**（`/insights` 页 + `?category=` 查询参数），让分类真正被消费。
3. **加「相关文章」**：同 `category` 下按 `modified` 倒序取 3 篇；无需新数据结构。
4. **统一语言政策**：把 `insights.ts:66-71` 改为与 `homepage.ts:90-109` 一致——非英文且 WP 无该语言时，返回 `notFound()` 语义，**不回退英文**。
5. **`generateStaticParams` 改从 `getInsightGuideDocuments()` 取**（而不是本地 `guides`），或明确注释「已废弃，全部 Dynamic 渲染」。
6. **若业务需要案例**：新增 `case_study` CPT + `/case-studies` + `/case-studies/[slug]` + 一条 adapter。若不需要，在文档里明确写「不做案例」，避免反复追问。
7. 本地 fallback 的 `publicationStatus` 改为从 `content/resources.ts` 读取（或加 `withdrawn` 支持），让「撤回」在本地也生效。

### 依赖

- 语言政策不一致 → **Agent C**（hreflang / canonical / soft 404）。
- `case_study` 是否属于业务必需 → **Product Owner / FINAL_REPORT**，不是本项目代码能回答的。
- `fh_guide` ↔ `post` 的 authoritative option 互斥校验 → 需读 PHP 全文，**移交 Agent B**。

### 验收方式

- `grep -n "taxonomy" local-wp/wp-data/wp-content/mu-plugins/fenghuai-guides.php` → ≥1
- `grep -n "category" src/app/insights/page.tsx` → ≥1（有筛选）
- 撤回一篇 WP 文章后，`/insights/{slug}` 应 404，**不得**回退本地英文
- `curl -s /zh/insights/{en-only-slug}` → 404（而非 200 + 英文正文）

---

## M12 媒体资源

**成熟度**: 2/5
**状态**: 有风险

### 证据

**`next/image` vs 裸 `<img>` 比例**

- [E1] `grep -rn "<img" src --include="*.tsx"` → **6 处真实渲染**（另有 2 处是注释：`src/content/process.ts:53`、`src/components/process-explorer.tsx:21`）：
  | 文件:行 | 用途 | alt |
  |---|---|---|
  | `src/components/home/hero/hero-background.tsx:60` | 首页背景轮播 | `alt=""`（`:62`）装饰性，旁边有注释「First slide is the LCP element」 |
  | `src/components/home/hero/hero-product-card.tsx:49` | hero 产品卡背景 | `alt=""`（`:51`） |
  | `src/components/sections/page-hero.tsx:108` | 内页 hero 背景 | **有 alt**（`:110` `backgroundImage.alt`） |
  | `src/components/family-card.tsx:63` | 产品族卡 | `alt=""`（`:65`） |
  | `src/components/product-card.tsx:46` | 产品卡主图 | **有 alt**（`:48` `` `${family.name} forged wheel` ``） |
  | `src/components/product-card.tsx:59` | 产品卡 hover 图 | `alt=""` + `aria-hidden="true"`（`:61-62`）正确 |
  | `src/components/wheel-card.tsx:77` | 轮毂卡 | **有 alt**（`:79` `wheel.alt`） |
- [E1] `grep -rln "from \"next/image\"" src` → **17 个文件**；`grep -rn "<Image" src --include="*.tsx" | wc -l` → **19 处**
- → **比例：`next/image` 19 处 : 裸 `<img>` 6 处 ≈ 76% : 24%**
- [E1] **裸 `<img>` 集中在最关键的三个位置**：首页 hero 背景（LCP 元素，`hero-background.tsx:60`）、首页 hero 产品卡（`hero-product-card.tsx:49`）、产品族/产品卡（`family-card.tsx:63` / `product-card.tsx:46`）。→ **首页与产品列表页——也就是流量与转化最重要的两个页面——主图全部绕过 Next 图片优化。**

**Alt 覆盖率（抽 10 个组件）**

| # | 组件 | `<Image>` 或 `<img>` | alt | 判定 |
|---|---|---|---|---|
| 1 | `src/app/insights/page.tsx:88-93` | Image | `insightsHeroMedia.alt` | ✅ |
| 2 | `src/components/home/hero/hero-media.tsx:33-38` | Image | `media.alt` | ✅ |
| 3 | `src/components/home/project-route-section.tsx:13-18` | Image | `media.alt` | ✅ |
| 4 | `src/components/about/wheel-factory.tsx:13-15` | Image | `media.alt` | ✅ |
| 5 | `src/components/wheels/flow-formed-page.tsx:180-185` | Image | `media.alt` | ✅ |
| 6 | `src/components/wheels/flow-formed-page.tsx:209-215` | Image | `labels.imageAlt.replace("{model}", card.model)` | ✅ |
| 7 | `src/components/wheels/wheel-detail-sections.tsx:74-82` | Image | `seo.imageAlt(model)` | ✅ |
| 8 | `src/components/custom-aluminum/custom-aluminum-page.tsx:83-85` | Image | `media.alt` | ✅ |
| 9 | `src/components/guided-accordion` → `src/components/guides-accordion.tsx:107-109` | Image | `visual.alt` | ✅ |
| 10 | `src/components/automotive-backdrop.tsx:20-22` | Image | `alt=""` | ⚠️ 装饰用（需人工确认是否真装饰） |
| 11 | `src/components/prose-article.tsx:46-51` | Image | `alt=""` + `priority` | ⚠️ 同上 |
| 12 | `src/components/sections/product-showcase.tsx:57-61` | Image | `alt=""` | ⚠️ 同上 |

**Alt 结论：19 处 `<Image>` 中 16 处有真实 alt（84%），3 处 `alt=""`；6 处裸 `<img>` 中 3 处有真实 alt、3 处 `alt=""`（其中 2 处配 `aria-hidden`，属正确用法）。整体 alt 覆盖率约 19/25 = 76% 到 22/25 = 88% 之间，取决于 3 处 `alt=""` 是否真装饰。**

- [E1] **重要**：`alt` 的实质保障来自**上游 normalization**：`pages-contract.ts:105-108` `if (!/^(?:https?:\/\/|\/)/.test(src) || !alt) return undefined;` —— **无 alt 的图片记录在契约层就被丢弃（返回 undefined）**。`insights-contract.ts:424-427` 同款。→ **进入 UI 的 `MediaAsset` 一定带非空 alt。这是全项目对 alt 最强的一道保障。**

**`remotePatterns` 只放行 `WP_API_URL` / `WP_PUBLIC_API_URL` / localhost —— 生产换域名或加 CDN 会不会 404？**

> **结论：会。而且不是「可能」，是「已有一处不一致使得它在当前部署里就可能出问题」。**

- [E1] `next.config.ts:5-19` 硬编码两条：`http://localhost:8081/wp-content/uploads/**` 与 `http://127.0.0.1:8081/wp-content/uploads/**`
- [E1] `next.config.ts:23-38` `addWordpressMediaPattern(rawUrl)` —— 从 URL 提取 `protocol` / `hostname` / `port`，pathname **硬编码为 `/wp-content/uploads/**`**
- [E1] `next.config.ts:60-61` 只对 `WP_API_URL` 与 `WP_PUBLIC_API_URL` 两个 env 调用它
- [E1] `next.config.ts:84-89` `images: { remotePatterns, dangerouslyAllowLocalIP: allowLocalWordpressMedia }`
- [E1] **`remotePatterns` 是构建期常量**（Next 的 `images.remotePatterns` 在 build 时序列化进产物）→ 运行时改 env 无效，必须重新构建。
- 🔴 **[E1] 已存在的配置不一致**：`deploy/frontend/compose.yml:16-17` 构建参数传 `WP_API_URL: ${WP_PUBLIC_API_URL}`（公网），而 `compose.yml:27` 运行时 `WP_API_URL: http://wordpress/wp-json/wp/v2`（内网）。→ **构建期 `remotePatterns` 里是公网域名，运行时服务端读的是 `http://wordpress/...`**。如果 WordPress 返回的 `source_url` 是内网地址（很常见——WP 的 `home_url()` 由 `WP_HOME` 决定），那么 `next/image` 的 optimizer 会去 fetch 一个**不在 `remotePatterns` 里的 host**，Next 直接 **400 Bad Request**（`"url" parameter is not allowed`），**图片全挂**。这不是假设：`next.config.ts:55-57` 的注释自己就写着「Server-side CMS reads use the Docker-internal URL in production, while WordPress media records contain the browser-visible public URL」——**注释承认了两个 URL 并存，却依赖「WP 返回公网 URL」这个前提**。这个前提是否成立，**待核实（需读 WP 侧 `fh_pages_public_image` 实现，移交 Agent B）**。
- [E1] **加 CDN 的后果**：任何 CDN 域名（`cdn.example.com` / Cloudflare `/cdn-cgi/image/`）都不在两个 env 里 → `next/image` 全部 400。修法必须改 `next.config.ts` + 重新构建 + 重新部署。
- [E1] `next.config.ts:23-38` 的 `pathname: "/wp-content/uploads/**"` 是硬编码 → **如果 WP 用了别的 uploads 路径（多站点 / 自定义 `UPLOADS` 常量 / WP Offload Media 到 S3）**，同样全 400。

**WebP/AVIF、响应式尺寸、懒加载策略**

- [E1] `next.config.ts:84-90` `images` 只配了 `remotePatterns` 与 `dangerouslyAllowLocalIP`。**没有 `formats`、没有 `qualities`、没有 `deviceSizes`/`imageSizes`、没有 `minimumCacheTTL`。** → Next 16 默认 `formats: ['image/webp']`（**不含 AVIF**）。**AVIF 未启用。**
- [E1] `sizes=` 属性 **41 处**（`grep -c "sizes=" src --include="*.tsx"`）→ 响应式尺寸**覆盖良好**，例：`src/app/insights/page.tsx:93` `"(min-width: 1024px) 38vw, 100vw"`、`home/project-route-section.tsx:18` 三档、`capabilities/wheel-capabilities.tsx:116/136/173` 多档。
- [E1] `priority` 只用在 6 处（`insights/page.tsx:92`、`products/wheels/page.tsx:263` `priority={index < 4}`、`prose-article.tsx:50`、`wheel-strip-section.tsx:69` `priority={i < 3}`、`wheels/flow-formed-page.tsx:215`、`wheels/wheel-detail-sections.tsx:82`）→ LCP 优化是有意识的，但**首页 hero 的 LCP 元素（`hero-background.tsx:60` 裸 img）用的是 `fetchPriority="high"` + `loading="eager"` 手写**（正确，但依赖开发者记得手写）。
- [E1] 裸 `<img>` 的懒加载：`hero-product-card.tsx:52` `loading="lazy"`、`family-card.tsx:68` `loading="lazy"`、`product-card.tsx:49/63` `loading="lazy"`、`wheel-card.tsx:82` `loading={priority ? "eager" : "lazy"}` + `fetchPriority`（`:83`）、`hero-background.tsx:65` `loading={i === 0 ? "eager" : "lazy"}` + `fetchPriority={i === 0 ? "high" : "low"}`（`:64`）→ **手写但正确**。
- [E1] **本地图源已是 WebP**：`scripts/select-wheel-first-batch.py:8` 注释「`assets/wheel-images-webp/*.webp` 站点图片（2757 张）」→ 轮毂图在本地就是 WebP，不依赖 optimizer 转码。

### 已具备

- **alt 有契约层保障**：`pages-contract.ts:105-108` 与 `insights-contract.ts:424-427` 在契约层丢弃无 alt 的图片记录 → UI 收到的 `MediaAsset` 必带非空 alt
- **`sizes` 覆盖良好**（41 处），响应式尺寸不是摆设
- **LCP 意识明确**：`priority` 6 处 + 裸 img 的 `fetchPriority`/`loading` 手写正确
- **本地资产是 WebP**（2757 张），不依赖运行时转码
- `next/image` 占比 76%（19:6），主流量页面大部分走优化管线
- `next.config.ts:23-38` 的 `addWordpressMediaPattern` 是**有意识地覆盖两个 env**（服务端 URL + 浏览器 URL），说明作者已经识别过这个问题

### 缺口

| ID | 描述 | 严重度 | 阻塞上线 |
|---|---|---|---|
| G12-1 | **`remotePatterns` 是构建期硬编码，只认 2 个 env + localhost。** 换域名 / 加 CDN / 换 uploads 路径 → `next/image` 全 400，且必须重新构建才能修。 | **High** | 是（发布路径脆弱） |
| G12-2 | **`compose.yml` 的构建期 `WP_API_URL`（公网）与运行时 `WP_API_URL`（内网 `http://wordpress`）不一致**，若 WP 返回内网 `source_url`，则 `remotePatterns` 不匹配 → 图片 400。**当前部署是否已中招待核实。** | **Critical**（若中招） | 是 |
| G12-3 | **AVIF 未启用**（`next.config.ts:84-90` 无 `formats`）。WebP 是默认，但 AVIF 通常再省 20–30%。 | Medium | 否 |
| G12-4 | **首页 hero 的 LCP 元素是裸 `<img>`**（`hero-background.tsx:60`），绕过 optimizer。虽然手写了 `fetchPriority="high"`，但少了自动 `srcset`。 | **High** | 否（LCP 影响，交 C 量化） |
| G12-5 | **首页 hero 产品卡 / 产品族卡 / 产品卡走裸 `<img>`**（`hero-product-card.tsx:49`、`family-card.tsx:63`、`product-card.tsx:46`）→ 首页与产品列表主图无响应式 srcset、无格式协商。 | **High** | 否 |
| G12-6 | **`wheel-card.tsx` 与 `wheel-catalogue-card.tsx` 图片管线不一致**：前者裸 img，后者 next/image。同一个轮毂在两个页面走两条路径。 | **High** | 否 |
| G12-7 | `pathname: "/wp-content/uploads/**"` 硬编码（`next.config.ts:15/18/34`）→ 不兼容 CDN / S3 offload / 自定义 uploads 目录。 | Medium | 否 |
| G12-8 | 无 `minimumCacheTTL` → 优化后的图片缓存用 Next 默认值，与 WP 侧的图片替换策略可能不匹配（**待核实**团队是否依赖 WP 覆盖同名文件）。 | Low | 否 |
| G12-9 | 3 处 `alt=""`（`automotive-backdrop.tsx:22`、`prose-article.tsx:48`、`sections/product-showcase.tsx:59`）是否为真装饰，无注释说明。考虑到项目其它地方对 alt 的严格程度（契约层丢弃无 alt 记录），这 3 处**可能是有意**（背景图），但缺注释。 | Low | 否 |

### 重复实现

- **R12-1**：**3 条图片渲染路径**并存：① `next/image`（19 处，17 文件）② 裸 `<img>` + 手写响应式/懒加载（6 处）③ 本地 WebP 直出（`assets/wheel-images-webp/`）。三者无共享 wrapper。
- **R12-2**：`MediaVisual` / `ApprovedImage` / `ProductionImage` 等**每页一个图片包装组件**（`capabilities/wheel-capabilities.tsx:18`、`about/wheel-factory.tsx:13-18`、`about/tire-factory.tsx:9`、`safety-tires/self-sealing-tire-page.tsx:34`、`forged-wheel/forged-wheel-page.tsx:10`、`ev-components/ev-components-page.tsx:107`、`custom-aluminum/custom-aluminum-page.tsx:83`、`wheels/flow-formed-page.tsx:180`）—— **8 个几乎相同的 `<Image ... fill className="object-cover" sizes={sizes}/>` 包装**，每个文件各自定义一次。
- **R12-3**：`normalizeImage` 两份（见 M02 R02-2）导致两条线的图片校验规则可能漂移。

### 风险

- **R12-1（Critical，若 G12-2 成立）**：`compose.yml` 的内外网 URL 不一致 + `remotePatterns` 只在构建期固化 = **部署一次就可能全站图片 400**，而且错误信息是 Next 的 `"url" parameter is not allowed`，与「CMS 挂了」看起来完全不像。这是本次审计里**最可能导致「上线即故障」的单点**。
- **R12-2（High）**：换域名/加 CDN 需要「改 next.config.ts → 重新构建 → 重新部署」。对一个 B2B 官网，把「CDN 接入」这种标准运维动作变成代码变更，是结构性缺陷。
- **R12-3（High）**：首页 hero 与产品卡全部裸 `<img>` 意味着 **LCP 全靠手写属性**，一次重构就可能丢掉 `fetchPriority`。而 `hero-background.tsx:63` 的注释「First slide is the LCP element (spec §28 / AC-09)」说明这是被明确识别过的关键项——正因为关键，更该由组件封装保证，而不是靠注释提醒。
- **R12-4（Medium）**：`pathname` 硬编码 `/wp-content/uploads/**` 使「WP Offload Media / S3 / Cloudflare Images」这类常规扩展成为不可能。

### 建议动作

1. **把 `remotePatterns` 从「构建期硬编码」改为「更宽的 host 白名单 + 运行时校验」**：至少再加上一个 `NEXT_PUBLIC_MEDIA_HOSTS`（逗号分隔）env，让运维能加 CDN 而不动代码。同时在 `next.config.ts` 里对 `WP_PUBLIC_API_URL` 与 `WP_API_URL` 之外的 host 打一条 build warning，而不是静默拒绝。
2. **统一 compose 的构建/运行时 `WP_API_URL`**（或明确让 WP 侧返回公网 `source_url`，并在 `next.config.ts` 注释里写死这个前提）。这需要 **Agent D + Agent B** 联合确认。这是 G12-2 的根治。
3. **把 `pathname` 放宽为 `/**` 或可配置**（风险可控，因为 host 已白名单）。
4. **启用 AVIF**：`images.formats: ['image/avif', 'image/webp']`，然后量一次 LCP/带宽（交 Agent C）。
5. **抽 `src/components/shared/media-image.tsx`**（`next/image` 封装 + 内建 sizes 默认值 + priority 语义），收掉 R12-2 的 8 份包装；**把首页 hero 与 4 个卡片的裸 `<img>` 迁到它上面**，消灭 G12-4 / G12-5 / G12-6 / R12-1。
6. 给 3 处 `alt=""` 加一行注释说明「装饰性，配合 sr-only 文案」，让审计和后续维护者不再反复怀疑。

### 依赖

- G12-2 是否已在生产发生 → **Agent B**（WP 侧 `source_url` 生成逻辑）+ **Agent D**（部署实际 env）。
- LCP / 带宽影响量化 → **Agent C**。
- CDN 接入的需求与时间点 → **Product Owner / FINAL_REPORT**。

### 验收方式

- `curl -I "https://<prod>/_next/image?url=<WP media url>&w=640&q=75"` → 200（不是 400）
- `grep -c "next/image" src/**/*.tsx` 与 `grep -c "<img" src/**/*.tsx` 的比值 → 裸 img 显著下降
- `grep -n "formats" next.config.ts` → ≥1
- `grep -rn "MediaVisual\|ApprovedImage\|ProductionImage" src/components | grep -c "export function"` → 1（只剩共享 wrapper）
- `next build` 输出里不应有 remotePatterns 相关的 runtime 400（需真实请求验证，**本轮未跑**）

---

## 移交事项

以下事项超出 Agent A 的文件域或需要 E5/E3 之外的验证，**我不下结论**：

| # | 事项 | 移交对象 | 理由 |
|---|---|---|---|
| T1 | `fenghuai-inquiries.php`（3,029 行）内部结构、幂等键、事务边界、`assignOwner` seam | **Agent B** | `src/lib/inquiry/**` 与 3,029 行 PHP 属于 Agent B 域 |
| T2 | `SMTP_*` 缺失 vs `RESEND_API_KEY` 存在的矛盾；询盘是否有两套邮件路径 | **Agent B** | BASELINE §6 矛盾点 1，属 M11 |
| T3 | PHPMD/静态分析结果 | — | **未在本次审计范围内执行** |
| T4 | `fh_guide` ↔ 原生 `post` 两个 authoritative option 是否存在互斥校验（G03-7 / G09-9） | **Agent B** | 需读 `fenghuai-guides.php` 全文 |
| T5 | WP 媒体 `source_url` 返回的是公网 URL 还是内网 URL（决定 G12-2 是否已在生产发生） | **Agent B** | 需读 `fh_pages_public_image` / `fh_guide_*` 的 URL 生成实现 |
| T6 | `compose.yml` 构建/运行时 `WP_API_URL` 不一致是否已在部署中造成图片 400 | **Agent D** | 部署事实 |
| T7 | 两个 compose（9080/7080）是否能真起；`nginx-9080.conf` 硬编码 IP `119.91.205.130` 与 `X-Robots-Tag: noindex` 的影响 | **Agent D** | 部署事实 + 我未做容器操作 |
| T8 | 8 个 `scripts/verify-*.py` 未进 CI 的含义 | **Agent D** | CI 配置 |
| T9 | 46 路由全 `ƒ` Dynamic 的缓存量化影响；`remotePatterns` 修复后的 CWV 变化；首页裸 img 的 LCP 实际值 | **Agent C** | 性能测量 |
| T10 | `sitemap.ts` 除首页外对所有 `INDEXABLE_LOCALES` 无条件展开（BASELINE §5.3）；`insights.ts` 非英文静默回退英文（G09-6）导致的 hreflang/soft-404 风险 | **Agent C** | SEO |
| T11 | BASELINE §5.2 的 7 个无 metadata 页面（`/gallery`、`/gallery/wheels`、`/manufacturing`、`/resources*`）的定位与 IA 一致性 | **Agent C** | SEO/IA |
| T12 | `src/proxy.ts` 未提交（G01-7 / R01-2）所导致的发布缺口：已提交版本的 `src/lib/i18n/types.ts` 是否含 `LOCALE_COOKIE` 等被 proxy 引用的符号 | **Agent E / FINAL_REPORT** | 需对比 git HEAD 与工作区，超出单文件域 |
| T13 | 177 项未提交改动本身（BASELINE §2）的处置建议：哪些必须入库才能发布 | **Agent E / FINAL_REPORT** | 跨全域 |
| T14 | 90 个 E2E 用例真实通过率；`homepage-page-view.test.mts`（6 用例）、`wordpress-pages.test.mts`（5）、`wordpress-insights.test.mts`（12）、`wordpress-wheels.test.mts`（6）对 M02/M04 缺口（G02-1 浅 guard、G04-5 模块顺序）的**实际覆盖程度** | **Agent E** | 我只读了源码，未读测试实现 |
| T15 | 「是否需要 Case Study」（G09-5）是业务需求问题，不是代码问题 | **Product Owner / FINAL_REPORT** | 非技术判定 |
| T16 | `src/theme/**`（8 文件）与 `npm run theme:check` 的门禁有效性 | **Agent D** | 我未审 theme |

---

## 附：Agent A 成熟度汇总

| 模块 | 成熟度 | 状态 | 最高严重度缺口 | 阻塞上线 |
|---|---|---|---|---|
| M01 项目基础架构 | **3/5** | 部分满足 | G01-1 无集中 env 校验 / G01-7 proxy 未提交 | 是（G01-3 / G01-7） |
| M02 CMS 接入层 | **3/5** | 部分满足 | G02-1 网络层零运行时校验 | 否 |
| M03 WordPress 内容模型 | **3/5** | 部分满足 | G03-1 无健康检查 / G03-2 字段不可复现 | 是（G03-1 / G03-2 / G03-10） |
| M04 页面组件系统 | **3/5** | 部分满足 | G04-2 4 套卡片 / G04-7 77 处直连 content | 否 |
| M09 博客与案例 | **3/5** | 部分满足 | G09-5 无案例 / G09-6 语言政策不一致 | 是（仅当业务要求案例） |
| M12 媒体资源 | **2/5** | **有风险** | G12-2 remotePatterns 与内网 URL 冲突 | **是（Critical）** |

> **分数说明（防凑分）**：六个模块无一个达到 4/5，理由统一是：**「有设计」不等于「有保障」**。本轮所有「已具备」都指向「作者想过这件事」，而所有「缺口」都指向「想过但没有机制保证它不被破坏」——例如 alt 有契约层保障（强），但图片管线有三条并行路径（弱）；env 有单点解析（强），但 18 个变量没有 schema（弱）；发布门槛有三层（强），但字段结构不可从代码重建（弱）。M12 给 2 分是因为它有一个**可能已在当前部署中发作**的 Critical 风险（G12-2），而这一点在我能看到的证据里无法排除。
