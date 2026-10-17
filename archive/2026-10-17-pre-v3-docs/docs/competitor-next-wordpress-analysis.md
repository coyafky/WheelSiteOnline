# 竞品技术架构报告：2nforged-monorepo（Next.js + Headless WooCommerce）

> 分析对象：`/tmp/nw-probe`（`github.com/meathill/next-wordpress`，package name `2nforged-monorepo`）
> 仓库状态：单 commit（`442f7d6 初始化 2nforged headless monorepo`），即**骨架/第一版**，不是成熟生产系统。结论需按此前提打折。
> 我们自身：`/Users/fkycoya/Documents/Code/WordpressWheelSIte`（Next 16.3.5 + React 19.2.4 + Tailwind 4，内容站 + `src/lib/wordpress` 只读取）

---

## 1. 整体拓扑

```
2nforged-monorepo (pnpm workspace, pnpm@11.0.9, node >=24)
├── apps/
│   ├── storefront/   @2nforged/storefront  Next 16 前台 + BFF API
│   └── wordpress/    @2nforged/wordpress   WP/Woo 容器 + smoke test（不是代码 app）
└── packages/
    ├── shared/       @2nforged/shared      领域类型 + 纯函数（有 vitest）
    └── ui/           @2nforged/ui          项目级 UI 封装（无构建，直出 src）
```

`pnpm-workspace.yaml`：`packages: ["apps/*", "packages/*"]`，`allowBuilds: [esbuild, sharp, workerd]`。

**依赖关系**（从 package.json 读到的真实边）：
- storefront → `@2nforged/shared`(workspace:*) + `@2nforged/ui`(workspace:*)，外部仅 `next / react / react-dom / zustand / lucide-react`
- ui → `clsx / tailwind-merge / lucide-react`，`peerDependencies: react ^19`
- shared → **零运行时依赖**（只有 devDep vitest）
- wordpress → 只有 `mysql2`

**为什么这么切**：
1. `shared` 无依赖，意味着**领域模型和规则可以被服务端（route handler）、客户端（Zustand store）、测试三方共用**而不引入循环依赖。典型证据：`isVariationCompatible(variation, fitment)` 定义在 shared，被 `packages/shared/src/index.test.ts` 直接单测。
2. `ui` 与 `shared` 分开，是把「无业务语义的视觉原语」和「有业务语义的领域模型」切成两层，避免 UI 包被领域类型污染。
3. `apps/wordpress` 放进 monorepo 只为**让容器配置、mu-plugin、smoke test 跟前台代码同版本管理**，它不产出 npm 包、不参与 build（`package.json` 只有 `smoke:test` / `typecheck`）。

**关键设计：两个 package 都是 `exports: "./src/index.ts"`，不走构建**。`storefront/next.config.ts` 用 `transpilePackages: ["@2nforged/shared", "@2nforged/ui"]` 让 Next 直接编译 TS 源码。省掉了 tsup/rollup 一层，代价是类型检查必须靠各包自己的 `tsc --project` 兜。

---

## 2. 前后端分离方式

### 职责切分（README.md 原文口径）
> `2nforged.com`：Cloudflare Worker 运行 OpenNext storefront；`cms.2nforged.com`：WordPress/WooCommerce 提供**商品、库存、订单和结账能力**。

即：**WP 是 CMS + 交易/权威数据源，Next 是渲染层 + BFF**。

### mu-plugin 实际做了什么（`apps/wordpress/mu-plugins/2nforged-headless.php`，全文仅 ~25 行）

只有两个钩子：

```php
add_filter('allowed_redirect_hosts', function (array $hosts): array {
    $hosts[] = '2nforged.com'; $hosts[] = 'www.2nforged.com'; $hosts[] = 'cms.2nforged.com';
    return array_values(array_unique($hosts));
});

add_action('send_headers', function (): void {
    if (is_admin()) { return; }
    header('Access-Control-Allow-Origin: https://2nforged.com');
    header('Access-Control-Allow-Credentials: true');
});
```

**必须诚实指出：这个 mu-plugin 是「半成品」**，与常见 headless 改造清单相比缺了很多：

| 常见 headless 改造项 | 本仓库是否做了 |
|---|---|
| CORS 放行前台域 | ✅ 做了（但**硬编码单个 origin**，非 admin 全站，且未处理 OPTIONS 预检） |
| allowed_redirect_hosts 白名单 | ✅ 做了 |
| 关闭/接管前端主题（template_redirect 跳走 / REST 化） | ❌ **未做**，无主题相关代码 |
| 暴露自定义 REST 路由（车型适配、fitment 查询） | ❌ **未做**，只依赖 WooCommerce 自带 Store API |
| Store API 鉴权（JWT / consumer key） | ❌ **未做**，`wc/store/v1` 是公开只读端点，不需要鉴权 |
| 购物车 nonce / cart-token 透传 | ❌ **未做**（见 §4，购物车还是 stub） |
| 媒体域名改写为 R2（media.2nforged.com） | ❌ 仓库内未见；`.env.example` 有 `R2_PUBLIC_URL` 但 mu-plugin 无对应代码 |
| 隐藏 wp-json 中敏感字段 | ❌ 未做 |

**结论**：headless 化几乎没有靠 mu-plugin，主要靠「Next 直接打公开 Store API + WP 后台单独放在 cms 子域」。这是**低侵入**路线——好处是 WP 侧维护成本几乎为 0，风险是**任何需要 WP 侧计算的能力（车型适配匹配、库存校验、优惠券）都没有落点**，只能全搬进 Next。

### 其他 WP 侧配置（`docker-compose.yml`）
- 镜像 `wordpress:6.8.3-php8.3-apache`，`wp-cli:cli-php8.3` 挂在 `profiles: [tools]` 下（默认不启动，`docker compose --profile tools run wp-cli` 才起）
- `redis:7.4-alpine`，`command: ["redis-server","--save","","--appendonly","no"]`（纯缓存，不做持久化）
- mu-plugins 以 `:ro` 只读挂载
- `WORDPRESS_CONFIG_EXTRA` 注入：`WP_HOME/WP_SITEURL` 指向 `https://${WORDPRESS_DOMAIN}`、`FORCE_SSL_ADMIN=true`、`MYSQL_CLIENT_FLAGS = MYSQLI_CLIENT_SSL`、`WP_REDIS_HOST/PORT`、`WP_CACHE=true`，以及反向代理下 `HTTP_X_FORWARDED_PROTO=https → $_SERVER['HTTPS']='on'`（防 WP 后台无限重定向的经典修补）
- `WORDPRESS_ENVIRONMENT_TYPE` 从 env 取，默认 `local`

---

## 3. 数据层

### TiDB Cloud 选型（DEV_NOTE.md 决策原文）
> TiDB Cloud 是 WooCommerce 主数据库，利用自动备份能力；混合搜索根据套餐和区域支持情况逐步启用。
> 除 TiDB Cloud 外，基础设施优先使用 Cloudflare 全家桶。

**真实动机读出来是三点**：(1) MySQL 协议兼容 → WooCommerce 无需改造即可跑；(2) 托管自动备份 → 不用自己运维 MySQL；(3) 为将来「混合搜索（向量 + 关键词）」留口子，但明确写了「根据套餐和区域支持情况逐步启用」，即**当前未启用**。

### 连接方式
- `WORDPRESS_DB_HOST: "${TIDB_HOST}:${TIDB_PORT:-4000}"`（TiDB Cloud 默认 4000）
- SSL 强制：WP 侧 `MYSQLI_CLIENT_SSL`；smoke test 侧 `ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true }`
- 另有 `TIDB_SSL_CA_PATH=/run/secrets/tidb_ca`（`.env.example`）——**注意：smoke-test.ts 里没用这个 CA 路径**，只用 `rejectUnauthorized: true`，两者口径不一致

### smoke test 覆盖范围（`apps/wordpress/scripts/smoke-test.ts`）
```
connection.ping()                      → MySQL 协议连通性
assertTableExists("wp_options")        → WP 基础表
assertTableExists("wp_posts")
assertTableExists("wp_postmeta")
like 'wp_wc_%' limit 1                 → WooCommerce 表存在性（缺失只 console.warn，不抛错）
```
设计要点：**不读 `.env`**（`TESTING.md` 明确说明），强制从环境变量取，避免脚本触碰密钥文件——这和 `AGENTS.md` 的「不要访问项目里面的 .env 文件」是同一条纪律的两处落地。用 `mysql2/promise` + 顶层 `await main()`，靠 `node scripts/smoke-test.ts`（Node 24 直跑 TS，无需 ts-node）。

**覆盖度评价**：只验证了「连得上 + 表在」，**没有验证 WordPress 是否安装完成、Store API 是否可访问、商品数据是否存在**。属于基建连通性 smoke，不是业务 smoke。

### 表结构用法
仓库内**没有任何自定义表或自定义 SQL 查询**，完全依赖 WooCommerce 原生表（`wp_posts` 存 product/variation，`wp_postmeta` 存 `_price/_sku/_stock` 等，HPOS 表 `wp_wc_*`）。前台只读 Store API，**不直连数据库**（`wrangler.toml` 里的 `hyperdrive TIDB` 是预留 binding，`apps/storefront` 代码中未使用 → **未接线**）。

---

## 4. 前台数据获取

### 唯一取数入口：`apps/storefront/src/lib/woocommerce.ts`

```ts
const response = await fetch(`${getWordPressBaseUrl()}/wp-json/wc/store/v1/products`, {
  next: { revalidate: 300, tags: ["products"] },
});
if (!response.ok) throw new Error(`WooCommerce 商品接口失败：${response.status}`);
```

关键事实：
- **API 路径**：`{WP_BASE}/wp-json/wc/store/v1/products` —— WooCommerce **Store API**（`wc/store/v1`），不是 `wc/v3`（后者需要 consumer key/secret + HMAC 签名）。Store API 是 WC 为 headless 设计的**公开只读**接口，基于 cart token / nonce 做写操作。
- **鉴权**：**完全无鉴权头**。这是 Store API 的正确用法，但也意味着只能读公开商品数据。
- **缓存**：`revalidate: 300`（5 分钟 ISR）+ `tags: ["products"]`（为后续 `revalidateTag("products")` 预留）。**注意：`tags` 已声明，但仓库里没有任何 `revalidateTag` 调用点** → 失效链路未接线（DEPLOYMENT 提到 Queues 做「缓存失效」，但代码里没有）。
- **错误处理**：`throw`，不做降级。对比我们自己 `src/lib/wordpress/client.ts` 的 `console.error` + `return null`（「a CMS outage must not blank the site」）——**我们这版更稳，这条别抄他的**。
- **降级开关**：`if (process.env.USE_DEMO_CATALOG !== "false") return demoProducts;` —— 「非显式关闭就走 demo」。好处是零配置可跑，风险是**生产环境漏配 env 会静默返回假数据**。生产级做法是反过来（显式 `=== "true"` 才开 demo）。

### 数据映射（值得注意的缺陷）

```ts
priceRange: { min: {amount:"0",currency:"USD"}, max: {amount:"0",currency:"USD"} },
attributes: [],
variations: [],
```
Store API 的 `products` 响应**不含价格区间、属性、变体**（那些要打 `/products/{id}` 或 `/wc/store/v1/products?...` 的扩展字段，或走 `wc/store/v1/products/{id}/variations`）。所以真实接入后 `page.tsx` 里的 `product.variations[0]` 会是 `undefined`，`finishes` 会 fallback。这是**明确的未完成点**。

### BFF API 路由（`src/app/api/*`）

| 路由 | 方法 | 行为 | 真实性 |
|---|---|---|---|
| `/api/products` | GET | `listProducts()` 直出 | 真取数 |
| `/api/products/[slug]` | GET | `getProductBySlug()`，未找到返回 404 | 真取数，但**实现是 `listProducts().find()`**——取一个 slug 要拉全量列表并过滤，靠 300s revalidate 兜底 |
| `/api/search` | GET | `listProducts()` 后 JS 端 `includes()` 过滤 | **纯内存子串匹配**，返回 `mode: "structured"`，未接 WP 搜索/混合搜索 |
| `/api/cart/items` | POST | 校验 `productId/variationId/quantity`，返回 `itemKey: "${productId}:${variationId}:${Date.now()}"` | **stub**，未调 Store API `/cart/items` |
| `/api/checkout` | POST | 校验 `country === "US"`，返回 `orderId: "test-${Date.now()}"`、`status: "pending-payment"` | **stub** |

路由设计本身值得抄的点：
- `[slug]/route.ts` 用了 Next 15/16 的 `params: Promise<{slug:string}>` 异步签名，并 `await context.params` —— 与 Next 16 一致
- 校验在 BFF 层做（400 返回 `{message}` 统一错误形状），而不是信任客户端
- checkout 里硬编码「仅 US」作为 v1 范围约束（`CheckoutAddress.country: "US"` 在类型层也锁死）

**但整体要清醒**：这是一个「shape 好了但没接线」的 BFF。README/页面文案自己都承认：`page.tsx` 里写着 "Cart and checkout routes are already shaped for Store API integration. The demo mode keeps the first build usable before live CMS credentials are configured."

### 值得抄的模式（汇总）
1. **`lib/env.ts` 集中取 env 并给默认值**：`process.env.WORDPRESS_BASE_URL ?? "https://cms.2nforged.com"`。单一出口，避免 env 散落。
2. **`fetch` 的 `next: { revalidate, tags }` 写在数据层而不是页面层**——页面不关心缓存策略。
3. **降级开关放在数据层最顶部**，一个 env 切换全站数据源。
4. **BFF 路由与页面共用同一个 `lib/woocommerce.ts`**，不存在两套取数逻辑。

---

## 5. 配置器（configurator）实现

### 状态设计（`src/stores/configurator-store.ts`）

Zustand 里只有三个字段 + 一个派生函数：
```ts
fitment: WheelFitment;      // 车型适配
finish: string;             // 表面处理
customerNote: string;       // 定制备注
getCustomization(): CartCustomization  // 派生，组装成入参
```

**存什么 / 不存什么**（DEV_NOTE.md 明文决策）：
> Zustand 只保存客户端交互状态，不保存价格、库存、税费、运费等权威数据。

即：**只存「用户意图」，不存「事实」**。价格/库存/税费/运费一律以 WooCommerce 为准。理由很实在：客户端状态会过期、可被篡改，一旦把权威数据放进 store 就要自己处理失效与对账。

`cart-store.ts` 同理，只存 UI 与意图：`isOpen`、`checkoutStep`（`"cart"|"address"|"payment"|"review"` 四态机）、`items`。item 用 `localId: crypto.randomUUID()` 作本地 key——**刻意不与 WooCommerce 的 `itemKey` 混用**，因为真 key 要等 Store API 返回。

### 车型适配（fitment）的真实完成度

**要泼冷水**：适配能力目前是**静态的、未真正打通**。证据：

`configurator-panel.tsx` 里三个「选择器」每个只有 1 个 option，且**直接读 `defaultFitment` 而非 store**：
```tsx
<h2>{defaultFitment.year} {defaultFitment.make} {defaultFitment.model}</h2>
<Field label="Diameter">
  <Select defaultValue={defaultFitment.diameter}>
    <option value={defaultFitment.diameter}>{defaultFitment.diameter} inch</option>
  </Select>
</Field>
```
`setFitment` 在 store 里定义了但**组件中未被调用**（只有 `setFinish` / `setCustomerNote` 被绑）。`vehicleOptions`（BMW M3/M4 2024-2026、Porsche 911 Carrera 2023-2026）定义在 `demo-catalog.ts` 但**没有任何组件消费它**。

所以交互上真正活的只有 **Finish 单选 + Build note 文本**。适配是"预留了数据结构和 store 槽位，UI 未接"。

### 适配匹配规则（`packages/shared/src/index.ts`）
```ts
export function isVariationCompatible(variation, fitment): boolean {
  return variation.attributes.diameter === fitment.diameter
    && variation.attributes.width === fitment.width
    && variation.attributes["bolt-pattern"] === fitment.boltPattern;
}
```
用「直径 + 宽度 + 孔距」三元组精确匹配；`offsetRange`、`centerBore` 在 `WheelFitment` 类型里定义了但**未参与匹配**（推测是留给后续范围判断，未证实）。函数放在 shared 而非 storefront，就是为了可单测（`index.test.ts` 有用例）。

### 视觉预览（`wheel-preview.tsx`）——纯 CSS，不用 3D

DEV_NOTE.md 决策：**「第一版定制体验为车型适配 + 视觉预览，不做完整 3D 配置器」**。

实现：
```tsx
const SPOKE_ROTATIONS = [0,36,72,108,144,180,216,252,288,324] as const;
const finishClass = finish === "Satin Black" ? "from-zinc-900 via-zinc-700 to-zinc-950"
  : finish === "Frozen Bronze" ? "from-stone-600 via-amber-600 to-stone-900"
  : "from-zinc-300 via-zinc-500 to-zinc-800";
```
用 10 根 `<div>` 按 `rotate(36deg)` 递增排成 10 辐轮毂，配 Tailwind `bg-linear-to-br` 渐变模拟三种表面。组件是 **server-compatible**（无 `"use client"`，无状态，纯 props）。页面上明确标注：*"Visual preview is illustrative until production render assets are uploaded to R2."* —— 即这是**占位方案**，终态是 R2 上的真实渲染图。

**这个取舍很值得抄**：3D 配置器（three.js / WebGL）成本高、移动端性能差、SEO 无收益；用纯 CSS 做「示意级预览」把「选配 → 反馈」闭环先跑通，真图后面换素材即可，且换素材不动代码结构。

---

## 6. 部署链路

### OpenNext + Cloudflare

`open-next.config.ts` **全文只有两行**：
```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```
即**全部用默认配置**：默认 incremental cache 走 R2（OpenNext Cloudflare 的默认实现），无自定义 `durableObject` / `kv` / `queue` 覆盖。**注意：默认缓存不写 KV，所以 `wrangler.toml` 里声明的 `SITE_CACHE` KV namespace 实际未被 OpenNext 使用** → 声明但未接线（未证实是否有其他代码用它，我在 `apps/storefront` 全量文件列表中未发现 `env.SITE_CACHE` 引用）。

`wrangler.toml`：
```toml
name = "2nforged-storefront"
main = ".open-next/worker.js"
compatibility_date = "2026-05-17"
compatibility_flags = ["nodejs_compat"]

routes = [
  { pattern = "2nforged.com", custom_domain = true },
  { pattern = "www.2nforged.com", custom_domain = true }
]
[assets] directory = ".open-next/assets" binding = "ASSETS"
[[kv_namespaces]] binding = "SITE_CACHE" id = "replace-with-production-kv-id"
[[queues.producers]] binding = "COMMERCE_EVENTS" queue = "2nforged-commerce-events"
[[r2_buckets]] binding = "MEDIA_BUCKET" bucket_name = "2nforged-media"
[[hyperdrive]] binding = "TIDB" id = "replace-with-hyperdrive-id"
```

- `main = ".open-next/worker.js"` + `compatibility_flags = ["nodejs_compat"]` 是 OpenNext Cloudflare 的固定组合
- `nodejs_compat`（不带 `v2`）是 1.8.x 时期的写法
- 所有 binding id 都是 **placeholder**，说明**尚未真实部署过**（或部署时手动改）

### 域名与 301

`DEPLOYMENT.md` 说 `www.2nforged.com` 301 到 `https://2nforged.com`，但 `wrangler.toml` 里两个域都是 `custom_domain = true` 的**平级路由**，仓库内**没有 301 规则代码**（无 `_routes.json`、无 middleware、无 `_headers`）。推断 301 靠 Cloudflare Dashboard 的 Bulk Redirect / Page Rule 实现 → **此仓库内未证实**。

### Cloudflare 服务规划（DEPLOYMENT.md 列出，多数未接线）
Workers（前台+BFF）/ R2（产品图、uploads、预览素材）/ KV（导航、筛选项、短 TTL 缓存）/ Queues（商品同步、缓存失效、搜索索引、订单后处理）/ Turnstile+WAF+Rate Limiting（表单、checkout、CMS 登录）/ Hyperdrive（Workers 直连 TiDB）。

### env 管理
- 生产：env 在容器平台配置，明确禁止用仓库 `.env.example`
- 前台：`WORDPRESS_BASE_URL`（默认 `https://cms.2nforged.com`）、`NEXT_PUBLIC_SITE_URL`（默认 `https://2nforged.com`）、`USE_DEMO_CATALOG`
- **无 `.env.local` / secrets 管理机制**，无 `wrangler secret` 相关说明 → 当前无敏感变量需要注入（因为 Store API 公开只读），这是刻意选择

### 部署命令
```bash
pnpm --filter @2nforged/storefront build      # next build
pnpm --filter @2nforged/storefront deploy     # opennextjs-cloudflare deploy
# 另有 opennext:build / preview 两个中间态脚本
```

---

## 7. 工程化

**包管理**：pnpm 11.0.9，`engines.node >= 24`。`allowBuilds` 白名单只放行 `esbuild / sharp / workerd` —— 这是 pnpm 10+ 的 postinstall 安全特性，显式声明哪些包允许跑构建脚本。

**格式化/ lint**：Biome `^2.3.7`（schema 版本 2.4.15）。`lineWidth: 100`、2 空格、双引号、`trailingCommas: "all"`、`semicolons: "always"`；`css.parser.tailwindDirectives = true`（让 Biome 正确解析 `@theme` / `@apply`）；`vcs.useIgnoreFile: true`（尊重 .gitignore）。**没有 ESLint**。

**测试**：vitest `^4.0.13`。**只有 `packages/shared` 有 `"test": "vitest run"`**，storefront / wordpress / ui 都无 test 脚本（根 `pnpm -r --if-present` 会跳过）。所以实际单测只有 2 个用例（`formatUsd`、`isVariationCompatible`）。

**tsconfig 继承**：
```
tsconfig.base.json (target ES2023 / module ESNext / moduleResolution Bundler / strict / noEmit / isolatedModules)
├── apps/storefront/tsconfig.json  + jsx:preserve, plugins:[next], paths:{"@/*": ["./src/*"]}
├── apps/wordpress/tsconfig.json   + types:["node"], include:["scripts/**/*.ts"]
└── packages/{shared,ui}/tsconfig.json + jsx:react-jsx, include:["src/**/*"]
```
只有 storefront 配 `paths` 别名 `@/*`；**base 里没有 `baseUrl`**，靠各自 `paths` 相对自身解析。

**脚本组织**：根脚本全是 fan-out（`pnpm -r --if-present run typecheck|test|build`），各子包自持 `typecheck`。`format`/`lint` 只在根、用 Biome 全仓扫。

**AGENTS.md 的可抄条目**（很有价值的工程纪律）：
- 单文件不超过 400 行、控制在 300 行附近（这条直接塑造了 `woocommerce.ts` ~55 行、`wheel-preview.tsx` ~45 行的粒度）
- 不要用 JSDoc、不要 `any`、不要 `const handleXXX = () => {}`，用 `function handleXXX() {}`
- 不内嵌 SVG，用 lucide（`SaveIcon` 而非 `Save`）
- 修 bug 必须先把复现方式固化成测试用例
- 文档分层：README/TESTING/DEPLOYMENT/DEV_NOTE 常规，WIP/TODO 临时且**要随时清理**
- **DEV_NOTE「只记录决策依据和最后决策，不记录做了什么」** —— 这条很关键，把 DEV_NOTE 从流水账变成决策日志
- 安全：AI 不得读 `.env`，需操作 env 时写脚本由人跑（这条在 smoke-test.ts 的「不读 .env」处得到验证）

---

## 8. UI 层

`packages/ui/src/index.ts` 导出：`Badge / Button / Field / Select / cn`。

**封装思路**：
1. **无构建，直出 `src/index.ts`**（`"exports": {".": "./src/index.ts"}`），靠 `transpilePackages` 编译
2. **手写而非 registry 复制**（当前 4 个组件都是手写），但用 **coss/ui 兼容的 Tailwind v4 token 命名**：`bg-primary / text-primary-foreground / bg-surface / border-border / text-muted-foreground / bg-success / bg-warning`
3. **Props 直接扩展原生 HTML 属性**：`ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`、`SelectProps extends SelectHTMLAttributes<HTMLSelectElement>` —— 不加 wrapper，不做受控/非受控抽象
4. **变体用条件字符串拼接 + `cn()`**，不用 `cva`（对比我们自己用了 `class-variance-authority`）：
```ts
variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90 ..."
size === "lg" && "h-12 px-5 text-base"
```
5. `cn = twMerge(clsx(...))` —— 业界标准组合
6. `Field` 是**无 label 关联时的降级设计**：有 `htmlFor` 渲染 `<label>`，没有则渲染 `<span>`（避免 a11y 误报）
7. `Button` 有 `icon?: ReactNode` 槽位且**默认 `type = "button"`**（防止 form 内误提交）

**与 coss/ui 的关系**（`packages/ui/README.md` + DEV_NOTE）：
> coss/ui 通过 shadcn registry 分发，不是 npm 包；项目使用 `packages/ui` 作为统一导入面，后续新增组件时从 coss registry 导入或按组件页手动复制。
```bash
pnpm dlx shadcn@latest add @coss/ui @coss/colors-neutral
```
即：**coss/ui 是「上游样式源」，`packages/ui` 是「本地收敛层」**。好处是 storefront 只 import `@2nforged/ui` 一个面，将来换 registry 或改样式只动一处；代价是升级要手动同步。

**主题系统**（`src/app/globals.css`）：Tailwind v4 的 CSS-first 配置——`:root` 定义 oklch 变量，`@theme inline` 映射成 `--color-*` / `--font-*` token。**没有 shadcn 的 `dark:` 变量对**，只有一套亮色主题。（我们自己用了 `tw-animate-css` + `@base-ui/react`，比他重。）

---

## 9. 明确的取舍与「没做」的事

### DEV_NOTE.md「技术决策」原文 6 条
1. WP/WooCommerce 是后台和交易系统，**不引入 Shopify** → 自托管交易，成本换可控
2. Next.js **必须**通过 OpenNext Cloudflare adapter 部署到 Workers → 锁定边缘运行时，代价是不能用 Node-only 库
3. TiDB Cloud 作主库，混合搜索「逐步启用」→ 当前无搜索增强
4. 除 TiDB 外**基础设施优先 Cloudflare 全家桶** → 单供应商锁定换运维简化
5. Zustand 只存交互状态，不存价格/库存/税费/运费
6. 第一版只做车型适配 + 视觉预览，**不做完整 3D 配置器**

### DEV_NOTE.md「待长期关注」3 条风险
1. **WooCommerce 插件与 TiDB 兼容性需持续 smoke test** —— 这是选 TiDB 的真实代价：WC 官方只保证 MySQL/MariaDB，TiDB 的分布式事务、DDL、自增 ID 行为有差异
2. **Headless checkout 的支付网关 provider 需在接入 Stripe/PayPal 前明确安全和回调策略** —— 当前 `/api/checkout` 只支持 `paymentProvider: "test"`
3. **coss/ui 是 registry 不是 npm 包** → 升级靠手动复制，需持续投入

### 从代码读出的额外「没做」（DEV_NOTE 未列但事实存在）
- Store API 只接了 products 列表；**价格、属性、变体映射为空**
- **购物车 / checkout 完全是 stub**，未调 Store API 的 `/cart` 系列端点
- **`revalidateTag("products")` 无调用点**，缓存失效链路未通
- **搜索是内存 `includes()`**，未接 WP 搜索或混合搜索
- **车型适配 UI 未接 store**（`setFitment` 定义未用，`vehicleOptions` 无消费方）
- CORS 硬编码单 origin、未处理 OPTIONS 预检
- 无 i18n / 多货币（`CurrencyCode` 只有 `"USD"`，`country: "US"` 锁死）
- 无鉴权 / 无用户体系
- 仓库只有 1 个 commit，**无真实部署证据**（wrangler id 全是 placeholder）

---

## 10. 对我们项目的可借鉴清单

> 我们现状：Next 16.3.5 + React 19.2.4 + Tailwind 4，`src/lib/wordpress` 已做只读 WP REST 客户端（带 `mode !== "live"` 降级 + `console.error` + `return null`），已有 fitment/products/gallery/capabilities 等内容页。

### A. 直接可抄（低改造成本、无副作用）

| # | 抄什么 | 出处 | 为什么 |
|---|---|---|---|
| A1 | **领域模型提到独立 `packages/shared`，零运行时依赖** | `packages/shared/src/index.ts` | 我们 `src/types` + `src/lib/wordpress/types.ts` 已分散；抽出后可被页面、API、客户端 store 共用。我们的 `WpPost<T>` 已接近这个形态 |
| A2 | **适配匹配规则写成可单测纯函数**（`isVariationCompatible`） | shared + `index.test.ts` | 我们有 `src/app/fitment/[platform]`，匹配逻辑大概率埋在组件里；抽出来后 vitest 可覆盖边界（offsetRange 范围、centerBore 容差） |
| A3 | **`revalidate + tags` 写在数据层而非页面层** | `woocommerce.ts` | 我们 `wpFetch<T>(path, revalidate = 3600)` 已类似，但缺 `tags`。加上 `tags: ["products"]` 为将来 Webhook 失效留口 |
| A4 | **`lib/env.ts` 集中取 env + 默认值** | `lib/env.ts` | 我们有 `getWpConfig()`，可收敛成同一出口 |
| A5 | **纯 CSS 轮毂预览（10 辐 rotate + 渐变模拟 finish）** | `wheel-preview.tsx` | 我们有 gallery，但产品页大概率缺「选配实时反馈」。这个组件无依赖、<50 行、server-compatible、可直接嵌 |
| A6 | **Zustand 只存意图不存事实**（价格/库存/运费不进 store） | DEV_NOTE 决策 5 | 我们要加配置器时直接照此划线，避免后续对账地狱 |
| A7 | **cart item 用 `crypto.randomUUID()` 作 localId，不与后端 key 混用** | `cart-store.ts` | 我们的询价/购物车将来接 WP 时同样要区分本地态与权威态 |
| A8 | **checkout 步骤状态机 `"cart"|"address"|"payment"|"review"`** | `cart-store.ts` | 我们有 `/request-a-quote` + `/thank-you`，多步表单可直接套 |
| A9 | **Biome 取代 ESLint**，`css.parser.tailwindDirectives = true` | `biome.json` | 我们同时装了 eslint + eslint-config-next + prettier 隐式；Biome 单工具更快。但**改造成本不小，见 B** |
| A10 | **AGENTS.md 的文档分层与「DEV_NOTE 只记决策不记流水」** | `AGENTS.md` | 我们已有 `docs/plans/`，可明确「plan 文档定期清理、决策并入 DEV_NOTE」 |
| A11 | **`Field` 组件的 `htmlFor` 降级设计** | `packages/ui/src/primitives/field.tsx` | 我们表单多（contact / request-a-quote / dealers），无关联控件时用 `<span>` 避免 a11y 误报 |
| A12 | **mu-plugin 里 `HTTP_X_FORWARDED_PROTO → HTTPS=on`** | `docker-compose.yml` | 我们 WP 若在反代后必踩这个坑，先抄 |

### B. 需要改造才能抄

| # | 抄什么 | 为什么不能直接抄 | 改造建议 |
|---|---|---|---|
| B1 | **`transpilePackages` + `exports: "./src/index.ts"` 无构建包** | 我们是单仓库非 monorepo，没有 workspace 机制 | 若暂不拆 monorepo，可用 tsconfig `paths` + Next 16 的 `transpilePackages` 指向本地目录；或先按 `src/lib/domain/` 分层，日后再拆 |
| B2 | **Store API (`wc/store/v1`) 取商品** | 我们现状是 WP REST (`wp-json/wp/v2` + ACF)，不是 WooCommerce 商品；我们的站是**询盘型**不是交易型 | 若不做交易，无需 Store API。但"**BFF 路由 + 数据层单一出口**"这个形状可保留：把 `wpFetch` 包成 `getProducts()/getProductBySlug()`，再给 `src/app/api/*` 复用 |
| B3 | **`USE_DEMO_CATALOG !== "false"` 降级开关** | 默认走 demo 是危险方向（生产漏配 → 静默假数据） | 反过来：`=== "true"` 才降级。我们 `wpConfig.mode !== "live" → return null` 已经是正确方向，**保持现状，别抄他** |
| B4 | **Biome 替换 ESLint** | 我们已有 eslint-config-next（含 Next 规则：hooks、img、link 等），Biome 无等价规则 | 若要换，保留 `next lint` 做规则检查，Biome 只做 format + 通用 lint；不要一次性全替 |
| B5 | **OpenNext + Cloudflare Workers 部署** | 我们可能在 Vercel/自托管；OpenNext CF 会限制 Node API 与包体积 | 先确认部署目标。若在 Vercel，OpenNext 不适用；若上 CF，wrangler.toml 的 binding 骨架可直接抄（但要**删掉未接线的 KV/Hyperdrive 声明**，留着会误导） |
| B6 | **`packages/ui` 手写 4 原语 + coss registry** | 我们已用 `shadcn@4.1.0` + `@base-ui/react` + `cva`，组件库更重也更完整 | 不必退化到手写 4 个组件。可抄的是「**统一导入面**」：我们 `src/components/ui` 已起到同样作用，保持即可 |
| B7 | **`getProductBySlug = listProducts().find()`** | 列表接口取详情是反模式（payload 大、字段不全） | **不要抄**。我们有 `wpItem` 单独取单个，已更优 |
| B8 | **`/api/search` 内存 `includes()`** | 只适合 demo | 我们若要搜索，至少用 WP REST 的 `?search=` 参数下推到服务端；规模再大再考虑 Algolia/TiDB 混合搜索 |

### C. 不适用（我们的场景不同）

| # | 项目 | 为什么不适用 |
|---|---|---|
| C1 | **WooCommerce Store API / checkout / cart / paymentProvider** | 我们是**询盘型**（`/request-a-quote`、`/thank-you`、`src/lib/inquiry`），不走在线交易。引入 Store API 的 cart-token / nonce 机制是纯负担 |
| C2 | **TiDB Cloud 作主库** | 我们 WP 用常规 MySQL 即可，且我们不是 DB owner。TiDB 的吸引力（自动备份、混合搜索）与我们当前诉求不匹配；且它有 WC 兼容性长期风险 |
| C3 | **Cloudflare Queues / Hyperdrive / KV / Turnstile 全套** | 我们无商品同步、缓存失效、订单后处理的规模诉求；Hyperdrive 是为了 Workers 直连 DB，我们 Next 层不直连 DB |
| C4 | **mu-plugin 的 headless 改造本身** | 它实际只做了 CORS + redirect 白名单，而我们 Next 通过服务端 `fetch` 读 WP（**服务端请求不受浏览器 CORS 约束**）——**我们根本不需要 CORS 头**。这条尤其重要：他们的 CORS 是为浏览器直连 Store API 准备的，我们不走这条路 |
| C5 | **单货币 `"USD"` + `country: "US"` 锁死** | 我们是中文站面向多市场，已有 `src/lib/i18n`；需要多货币/多地区 |
| C6 | **无鉴权的公开只读 Store API** | 我们 WP REST 用了 `Authorization: Basic`（`src/lib/wordpress/client.ts`），说明我们读的是需要鉴权的内容（草稿/私有字段/ACF）。两边信任模型不同 |
| C7 | **`compatibility_date = "2026-05-17"` / `nodejs_compat`（非 v2）** | 版本相关，且与我们的部署平台无关 |
| C8 | **硬编码 origin 的 allowed_redirect_hosts** | 我们域名未定/可能多变；且我们不做 WP 侧重定向跳转 |

---

## 附：一句话判断

这个竞品仓库的价值**不在「它实现了什么」（大量是 stub），而在「它把边界划在哪里」**：领域模型独立成零依赖包、Zustand 只存意图、3D 降级为 CSS 预览、预览素材走 R2、交易权威全留给 WooCommerce、部署锁定 Cloudflare 全家桶。这些边界决策清晰且自洽，是真正值得抄的部分；而其数据接入、购物车、搜索、适配 UI 均处于「shape 好了没接线」状态，**不要把这些当作成熟方案参考**。

### 未证实清单（报告中已标注，此处汇总）
- `www → 裸域` 301 的具体实现方式（wrangler.toml 内无此规则）
- `SITE_CACHE` KV 是否被任何代码消费（全量文件列表中未见 `env.SITE_CACHE`）
- `OPEN_NEXT` 默认缓存实际落 R2 还是 KV（未在仓库内覆写，取决于 opennextjs-cloudflare 1.8.x 默认行为）
- Queues / Hyperdrive / Turnstile 的任何代码接线（仅见于 DEPLOYMENT.md 规划）
- `TIDB_SSL_CA_PATH` 与 smoke-test 的 `rejectUnauthorized` 是否为同一信任链
- 仓库是否有过真实部署（wrangler binding id 全为 placeholder，倾向「未部署」）
- 媒体域名 `media.2nforged.com` 与 R2 的绑定方式（`next.config.ts` 有 remotePatterns，mu-plugin 无对应改写代码）
