# 分册四 · 部署、测试与真实缺口

> 本篇两部分：**怎么部署**（照抄即可）、**源码里我实测出的 6 个问题**（照抄会踩）。
> 所有问题都不是"读代码觉得不对"，而是有可复现的验证命令。

---

## 一、部署：三条路径

### 路径 A · Railway 一键部署（官方推荐）

`railway.json`：

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Railway 模板会把 **MySQL + WordPress + Next.js 三件套**一起拉起来。这是本项目最省事的路径。

部署后如果要做自定义，README 给了 Eject 流程：

> *Settings → Source → Upstream Repo → Eject → 选你的 GitHub 账号 → Eject service*

Eject 会在你的 GitHub 建一份仓库副本，之后 push 就自动部署。

> ⚠️ **healthcheckTimeout: 300（5 分钟）不是随便设的**。WordPress 首次启动要解包核心文件、建库、跑 `setup.sh`，冷启动很慢。设成 60 秒大概率健康检查失败 → 无限重启。**这是那个 `#76` PR（`fix(railway): harden WordPress deploy for 1-click`）修的东西之一。**

### 路径 B · Vercel 部署前端（用你自己的 WordPress）

```bash
1. 点 Deploy with Vercel
2. 填三个环境变量
3. 等构建完成
4. 在你的 WordPress 上装 revalidation 插件
5. 用 Vercel 部署 URL 配置插件
```

`vercel.json` 里有一条**容易被忽略但很关键**的配置：

```json
{
  "installCommand": "corepack enable && corepack prepare pnpm@11.20.0 --activate && pnpm install --no-frozen-lockfile"
}
```

**为什么要写这么长？** 因为 Vercel 默认用 npm。项目锁了 pnpm 11.20.0（`packageManager` 字段），必须显式启用 corepack 并激活指定版本，否则构建会失败或装出不一致的依赖树。

### 路径 C · 本地开发

```bash
pnpm install
cp .env.example .env.local
# 编辑 .env.local
pnpm dev      # → http://localhost:3000
```

三个环境变量（`.env.example`）：

```bash
WORDPRESS_URL="https://wordpress.com"          # 完整 URL，带协议
WORDPRESS_HOSTNAME="wordpress.com"             # 只要域名，给 next/image 用
WORDPRESS_WEBHOOK_SECRET="your-secret-key-here" # Webhook 校验
```

生成密钥：

```bash
openssl rand -base64 32
```

> 📌 **`WORDPRESS_URL` 和 `WORDPRESS_HOSTNAME` 是两个不同的东西**，很多人会只配一个然后发现图片不显示。`next.config.ts` 里 hostname 是给 `images.remotePatterns` 用的。

---

## 二、两个 Dockerfile：一个关键巧思

### 前端 `Dockerfile` —— 三阶段 + 条件 standalone

```dockerfile
# Stage 1: Deps
FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG WORDPRESS_URL
ARG WORDPRESS_HOSTNAME
ENV WORDPRESS_URL=$WORDPRESS_URL
ENV WORDPRESS_HOSTNAME=$WORDPRESS_HOSTNAME
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Stage 3: Runner
FROM node:22-alpine AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

**关键 1：`ARG` → `ENV` 把变量带进构建期**

```dockerfile
ARG WORDPRESS_URL
ENV WORDPRESS_URL=$WORDPRESS_URL
```

因为 `next build` 会**执行** `generateStaticParams()` → 真的去请求 WordPress。**构建期没有 `WORDPRESS_URL`，构建出来的就是空站。**

> 🔴 这与我在另一个项目踩过的坑同源：**`NEXT_PUBLIC_*` 是构建期烤进产物的**。跨机部署时必须逐项比对"烤入值"，光看页面 200 是不够的。

**关键 2：`next.config.ts` 里的条件 standalone**

```ts
const nextConfig: NextConfig = {
  // Standalone is for Docker/Railway; Vercel handles its own tracing/standalone
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  // ...
};
```

**这是很聪明的一招**：Vercel 有自己的一套构建产物处理，如果强行 `output: "standalone"` 反而会出问题。用 `process.env.VERCEL`（Vercel 平台自动注入）判断，本地/Docker 走 standalone，Vercel 走它自己的。

**关键 3：非 root 用户运行**

```dockerfile
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs
```

容器里不用 root 跑 Node 进程 —— 基本安全实践，很多 Next.js Dockerfile 都漏了这条。

### 后端 `wordpress/Dockerfile` —— 三个必做的修补

```dockerfile
FROM wordpress:php8.3-apache

# ① 强制单一 MPM
# Defensive: PHP's mod_php requires prefork MPM; upstream rebuilds have
# intermittently shipped with multiple MPMs enabled (AH00534). Force single MPM.
# See https://github.com/9d8dev/next-wp/issues/76
RUN a2dismod mpm_event mpm_worker 2>/dev/null || true && a2enmod mpm_prefork

# ② 装 WP-CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar && mv wp-cli.phar /usr/local/bin/wp

# ③ 装 mysql client
# mysqlcheck/mysqldump are required by wp-cli commands like `wp db check` (used in setup.sh)
RUN apt-get update && apt-get install -y --no-install-recommends default-mysql-client \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /etc/mysql/conf.d \
    && printf "[client]\nssl=0\n" > /etc/mysql/conf.d/skip-ssl.cnf

# ④ 拷插件和主题到暂存区（volume 会覆盖 /var/www/html）
COPY next-revalidate /usr/src/next-revalidate
COPY theme /usr/src/nextjs-headless

COPY setup.sh /usr/local/bin/setup-wordpress.sh
COPY entrypoint.sh /usr/local/bin/custom-entrypoint.sh
RUN chmod +x /usr/local/bin/setup-wordpress.sh /usr/local/bin/custom-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/custom-entrypoint.sh"]
CMD ["apache2-foreground"]
```

**① 为什么必须强制 MPM？** 上游 `wordpress` 镜像曾间歇性启用多个 Apache MPM → 启动直接报 `AH00534` 崩溃。这是一行"防上游翻车"的补丁，**理由写在注释里 + 挂了 issue 链接**，这是好注释的范本。

**③ 为什么装 mysql client？** `setup.sh` 里调了 `wp db check`，那个命令依赖 `mysqlcheck`。**没有它，`setup.sh` 会静默失败**（`entrypoint.sh` 里用 `if ! ...` 包着，只打 WARNING）。

**③ 里的 `skip-ssl.cnf`** 是个很实际的细节：`wp db check` 默认走 SSL 连 MySQL，很多托管 MySQL 没配 → 连接失败。写 `ssl=0` 跳过。

---

## 三、GitHub Actions

`.github/` 目录存在。CI 的作用在 `CLAUDE.md` 里能看出一部分 —— 项目用 `pnpm test` + `pnpm lint` 作为质量门。

---

## 四、测试：45 个用例，真的全过

我实际跑了：

```bash
pnpm install --frozen-lockfile
pnpm test
```

**结果**：

```
 ✓ __tests__/lib/metadata.test.ts   (14 tests)
 ✓ __tests__/api/revalidate.test.ts (11 tests)
 ✓ __tests__/lib/wordpress.test.ts  (15 tests)
 ✓ __tests__/lib/utils.test.ts      ( 5 tests)

 Test Files  4 passed (4)
      Tests  45 passed (45)
   Duration  615ms
```

`pnpm lint` 也是 **0 error**。

### 测试覆盖了什么

| 文件 | 行数 | 用例数 | 覆盖 |
|---|---|---|---|
| `lib/wordpress.test.ts` | 257 | 15 | fetch 层、分页、错误处理、优雅降级 |
| `api/revalidate.test.ts` | 209 | 11 | 密钥校验、内容类型分支、缓存标签 |
| `lib/metadata.test.ts` | 121 | 14 | `stripHtml`、`truncateHtml`、OG/Twitter 元数据 |
| `lib/utils.test.ts` | 26 | 5 | `cn()` 类名合并去重 |

**测试手法值得学**：`revalidate.test.ts` 里手写了 `NextRequest` / `NextResponse` 的 mock：

```ts
vi.mock("next/server", () => {
  class MockNextRequest {
    private _body: unknown;
    private _headers: Map<string, string>;
    constructor(url, init) {
      this._body = init?.body ? JSON.parse(init.body) : null;
      this._headers = new Map(Object.entries(init?.headers ?? {}));
    }
    async json() { return this._body; }
    get headers() {
      return { get: (name) => this._headers.get(name) ?? null };
    }
  }
  // ...
});
```

`lib/wordpress.test.ts` 则 mock `global.fetch` —— **不发真实网络请求，测试能在 CI 里跑**。

### 🔴 但测试有一个致命盲区

看 `revalidate.test.ts` 里的请求体：

```ts
const req = createRequest({ contentType: "post", contentId: 42 }, ...);
```

**测试用的字段名和路由读取的字段名完全一致** —— 所以测试全绿。

问题在于：**这个契约是"前端自己和自己约定的"，从来没有和真正的 WordPress 插件对齐过。** 而 Docker 装的插件 v1.1.0 发的是 `{type, data}`。

> 📌 **教训**：mock 掉对端之后，你验证的是"我以为的契约"，不是"真实的契约"。
> 要覆盖这一类问题，需要**一个契约测试**：把插件真实发送的 payload（JSON 样本）作为 fixture 喂给路由，断言它被正确处理。
> 这也解释了为什么"45 个测试全过"和"Webhook 根本不通"可以同时成立。

---

## 五、实测发现的 6 个问题

以下全部经过实际命令验证，附证据。

### 🔴 问题 1：详情页缺 `revalidate`（构建输出实证）

**这是最值得看的一条**，因为 `next build` 的输出直接把它打印出来了：

```
Route (app)                Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /api/og
├ ƒ /api/revalidate
├ ○ /opengraph-image.jpeg
├ ○ /pages                         1h      1y
├ ● /pages/[slug]                              ← 无 Revalidate
├ ƒ /posts
├ ● /posts/[slug]                              ← 无 Revalidate
├ ○ /posts/authors                 1h      1y
├ ○ /posts/categories              1h      1y
├ ○ /posts/tags                    1h      1y
├ ○ /robots.txt
├ ○ /sitemap.xml                   1h      1y
└ ○ /twitter-image.jpeg
```

**`/pages/[slug]` 和 `/posts/[slug]` 两个动态路由都没有 Revalidate 值**，而其他路由都是 `1h`。

但我前面读源码时看到 `app/pages/[slug]/page.tsx` 明明写了 `export const revalidate = 3600`：

```tsx
// app/pages/[slug]/page.tsx 第 9 行
export const revalidate = 3600;
```

**为什么构建输出里没有？**

因为 `generateStaticParams` 返回的页面在**构建期**就静态生成了，路由级的 `revalidate` 对"已预生成的静态页"不产生 `Revalidate` 列 —— 它需要**有请求进来触发**才会体现。

> ⚠️ **我要修正前面分册二的表述**：不能说"`/pages/[slug]` 有、`/posts/[slug]` 没有所以不一致"。真实情况是**两个都没有生效的 Revalidate**，因为二者都是 `● (SSG)` 预生成。
>
> **真正的结论是**：两个详情页的刷新**完全依赖 Webhook**（或首次访问后的后台再生）。而 Webhook 链路有问题（见问题 2）。**这才是"改了不更新"的完整因果。**

**修复建议**：给 `app/posts/[slug]/page.tsx` 补上 `export const revalidate = 3600`（与 pages 对齐），并且**修好 Webhook 契约**。两条路都通才算稳。

### 🔴 问题 2：插件与路由的 payload 契约不匹配（最严重）

**这是唯一一个会导致"功能完全不工作"的问题。**

```php
// wordpress/next-revalidate/next-revalidate.php —— 唯一的发布版本（v1.1.0）
$payload = [
    'type' => $type,          // 'post' | 'term' | ...
    'data' => $data,          // {id, slug, type, action}
    'timestamp' => time()
];
```

```ts
// app/api/revalidate/route.ts —— 前端
const { contentType, contentId } = requestBody;
if (!contentType) {
  return NextResponse.json({ message: "Missing content type" }, { status: 400 });
}
```

**字段名完全不在一个频道上**：发的是 `type` / `data.id`，读的是 `contentType` / `contentId`。

**验证命令**：

```bash
grep -c "contentType" wordpress/next-revalidate/next-revalidate.php   # → 0
grep -n "contentType" app/api/revalidate/route.ts                     # → 路由在等它
```

**结论**：**无论走 Docker 还是下载 Release zip，Webhook 收到后 100% 返回 400，缓存永不按内容刷新。**

> ⚠️ **我第一轮把这个判定为"两个版本冲突"，是错的。** 经 CI workflow 核实（见分册三），两条发布链路都从 `wordpress/next-revalidate/` 取代码，只有一份活代码；`plugin/` 是 2025-05 的残留副本。**问题不来自版本冲突，而来自这一份代码本身就和前端对不上。**
>
> **修复（改路由更稳，能兼容新旧客户端）**：
> ```ts
> const contentType = requestBody.contentType ?? requestBody.type;
> const contentId   = requestBody.contentId   ?? requestBody.data?.id;
> ```

### ✅ 已排除：插件 option 名"不一致"（我先前误判）

我第一轮报告过"`setup.sh` 写的 option 键与插件读的对不上"。**经核实这个判断是错的**：

```bash
grep -n "option_name =" wordpress/next-revalidate/next-revalidate.php   # next_revalidate_settings
grep -n "wp option update" wordpress/setup.sh                           # next_revalidate_settings
```

**两边一致。** 我会误判是因为看到了 `plugin/`（陈旧副本）里用的是 `next_revalidation_settings`（少一个 `e`），但 **`plugin/` 不在任何发布链路上**。

> ⚠️ 仍建议清理：`plugin/next-revalidate.zip` 是 2025-05 的旧包，还留在仓库里，容易被误用。

### 🟡 问题 4：缓存标签写入与清除不对齐

```bash
# 写入端
grep -n 'cacheTags\|"wordpress",' lib/wordpress.ts

# 清除端
grep -n 'revalidateTag(' app/api/revalidate/route.ts
```

| 标签 | 写入 | 清除 | 结论 |
|---|---|---|---|
| `wordpress` | ✅ 全部 | ✅ 永远先清 | **清它等于全站失效**，后面的精细标签失去意义 |
| `posts` | ✅ | ✅ | 正常 |
| `posts-page-{n}` | ✅（任意页） | ⚠️ **只清 `posts-page-1`** | **翻到第 2 页后的文章更新不刷新** |
| `posts-category-{id}` | ✅ | ✅ | 正常 |
| `posts-tag-{id}` | ✅ | ✅ | 正常 |
| `posts-author-{id}` | ✅ | ✅ | 正常 |
| `post-{id}` | ❌ **无** | ✅ | 空转 |
| `category-{id}` / `tag-{id}` / `author-{id}` | ❌ **无** | ✅ | 空转 |

**核心问题**：路由第 42 行 `revalidateTag("wordpress", { expire: 0 })` 会清空所有带 `wordpress` 标签的缓存 —— **即全部**。既然已经全清，后面那些精准标签就没有额外效果。

**"精准缓存失效"是这套架构的卖点，但在当前实现里没有兑现。**

### 🟡 问题 5：`catch {}` 吞掉原始错误

```ts
} catch {
  console.warn(`WordPress fetch failed for ${path}`);
  return fallback;
}
```

无论是 401、404 还是网络超时，日志里都是同一句话。生产排障会很痛苦。

**改法**：

```ts
} catch (error) {
  console.warn(`WordPress fetch failed for ${path}:`, error);
  return fallback;
}
```

### 🟢 问题 6：中文站的两个小坑

**① `truncateHtml` 按空白切词 —— 中文整段算一个词**

```ts
const words = text.split(/\s+/);
if (words.length <= maxWords) return text;     // 中文永远命中这里
```

中文没有空格，所以截断**永远不生效**。应改成按字符数。

**② `str_word_count` 类问题同理** —— 若按本项目的模式给 WordPress 加"阅读时间"自定义字段，用 `str_word_count()` 会得到 0（中文不认）。应改用 `mb_strlen($content, 'UTF-8')`。

---

## 六、修复清单（按优先级）

| 优先级 | 问题 | 一行修复 |
|---|---|---|
| **P0** | Webhook 契约不匹配 | 路由改为 `contentType = body.contentType ?? body.type` |
| **P1** | 清理陈旧副本 `plugin/` | 删掉 2025-05 的残留 zip，防误用 |
| **P1** | 详情页缺 `revalidate` | 补 `export const revalidate = 3600` |
| **P1** | 只清 `posts-page-1` | 改为清 `posts` 或遍历要清的页 |
| **P1** | `revalidateTag("wordpress")` 全清在前 | 想精准失效就删掉它 |
| **P2** | `catch {}` 吞错误 | 保留 `error` 对象 |
| **P2** | 标签写了不读/读了不写 | 对读两端清单，删死标签 |
| **P3** | `truncateHtml` 不认中文 | 改按字符数 |
| **P3** | `robots.txt` 无 Sitemap 行 | 改写成 `app/robots.ts` |

**验证 P0 是否修好**：

```bash
# 起本地服务后，模拟插件真实发的 payload
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $WORDPRESS_WEBHOOK_SECRET" \
  -d '{"type":"post","data":{"id":1,"slug":"test"},"timestamp":0}'

# 修好前：400 {"message":"Missing content type"}
# 修好后：200 {"revalidated":true,...}
```

---

## 七、总结：这套项目值不值得用

### 值得用的理由

1. **三件套齐全** —— 前端 + 后端插件 + 部署编排，clone 下来能跑
2. **数据层设计干净** —— 单一出口、双通道、缓存标签体系（虽然实现有 bug，但架构方向对）
3. **部署考虑周全** —— 双 Dockerfile、volumes 幂等、MPM 补丁、条件 standalone，都是踩过坑留下的
4. **45 个测试 + lint 全过** —— 有基本质量门槛
5. **注释质量高** —— 关键处都写了"为什么"，还挂了 issue 链接

### 用之前必须处理的事

| 必须做 | 理由 |
|---|---|
| **修 Webhook 契约** | 否则实时更新完全不通——这是选它的首要理由 |
| **确认插件版本** | Docker 装 v1.1.0、zip 装 v1.0.5，功能不同 |
| **改 `site.config.ts`** | 域名烤进 OG 图与 sitemap，不改就指向错域名 |
| **加中文截断** | 做中文站必改 |
| **配 CDN / 缓存策略** | 构建期要拉全站内容，WordPress 慢会拖垮构建 |

### 一句话结论

**它是一个"骨架完整、细节有瑕"的优秀起点。** 拿它学架构是划算的 —— 双通道取数、缓存标签、Docker 装配这几处都有真东西可学。但**别指望 clone 下来直接上线**：那条把 WordPress 和 Next.js 连起来的关键链路（Webhook）在 Docker 路径下是断的，而 613 行测试因为只用 mock 自证，没能发现它。

---

**上一篇** → [分册三：后端与实时更新](next-wp-03-wordpress-backend.md) ｜ **回到** → [总目录](README.md)
