# 数据流（DATA_FLOW）

制定日期：2026-10-17
配套：[`CURRENT_ARCHITECTURE.md`](../audit/CURRENT_ARCHITECTURE.md) ｜ [`TARGET_ARCHITECTURE.md`](TARGET_ARCHITECTURE.md)

---

## 1. 请求进来时的完整链路

### 1.1 公开页面（以 `/zh/products/wheels` 为例）

```
① 浏览器 GET /zh/products/wheels
        │
② Nginx（:9080）
   · add_header X-Robots-Tag "noindex, nofollow" always   ← 预发布兜底
   · X-Real-IP / X-Forwarded-For
        │ proxy_pass 127.0.0.1:9081
        ▼
③ src/proxy.ts
   · localeFromPathname("/zh/products/wheels") → "zh"
   · 二次进入保护（已有 x-fh-locale 则跳过）
   · NextResponse.rewrite → 内部路径 /products/wheels
   · headers.set("x-fh-locale", "zh")
   · headers.set("x-fh-public-path", "/products/wheels")
   · cookies.set("fh-locale", "zh")          ← 当前每请求都写
   · Content-Language: zh-CN
   · 若 NEXT_PUBLIC_APP_URL 未配 → X-Robots-Tag: noindex, follow
        │
④ app/products/wheels/page.tsx（RSC）
   ├─ getPublicLocalesForPath("/products/wheels")     ← publication.ts
   │    当前对非首页一律返回 ["en"]
   │    → 若 "zh" 不在其中，layout.tsx:99 触发 notFound()
   ├─ getWheelCataloguePage(...)                      ← public-catalogue.ts
   │    └─ 纯本地计算：wheel-catalogue.ts + wheel-publication.json
   │       （不打 WP）
   └─ generateMetadata()
        └─ localizedAlternates("/products/wheels", "zh")
             默认 readyLocales = ["en"]  ← 缺陷点
        │
⑤ 渲染 HTML + RSC payload
```

**关键**：轮毂目录**不读 WordPress 实时数据**，读的是构建期快照（DEC-052）。所以这条链路对 WP 停机免疫，但也意味着**后台改型号必须重新构建才生效**。

### 1.2 CMS 页面（以 `/about` 为例）

```
① GET /  → proxy rewrite → layout.tsx → app/about/page.tsx
        │
② getWordpressPageResult("about", "en")        ← pages.ts:20-68
        │
③ wpRead("/fh/v2/pages?key=about&locale=en")   ← client.ts:86-131
        │  · WP_MODE !== "live" → 直接返回 null（mock）
        │  · AbortSignal.timeout(8000)
        │  · next: { revalidate: 3600, tags: ["site-pages"] }
        ▼
④ WordPress mu-plugin fenghuai-pages.php:102
        · schema_version !== 1 → 判 unpublished
        · post_status !== publish 或 fh_publication_status !== approved → unpublished
        · 按 locale 取 fh_content_by_locale_json
        │
⑤ normalizeWordpressPage()  ← pages-contract.ts:127-148
        · 只做 typeof object 检查（弱守卫）
        │
⑥ 页面组件消费业务类型
        │
⑦ 若取不到 → 本地 fallback（src/content/ 里的兜底文案）
```

### 1.3 询盘提交

见 [`CURRENT_ARCHITECTURE.md` §8](../audit/CURRENT_ARCHITECTURE.md#8-询盘流程端到端)，关键节点：

```
客户端 idempotencyKey
  → /api/inquiries（Origin → 体积 → 蜜罐/时长 → Zod → 限流 → 服务端重查规格）
    → /fh/v1/inquiries（X-FH-Service-Key）
      → WP: START TRANSACTION
           INSERT wp_fh_inquiry_key（主键冲突 → 幂等重放）
           wp_insert_post(fh_inquiry)
           postmeta（items JSON + 快照）
           INSERT wp_fh_inquiry_outbox(pending)
         COMMIT
      → dispatch_email（SMTP 优先 / Resend 兜底）
        失败 → outbox 退避 1/5/15/60min，5 次后 abandoned
```

### 1.4 缓存失效

```
编辑在 WP 保存/撤回
  → save_post / trashed_post / before_delete_post 钩子
    → HMAC-SHA256 签 body → POST /api/revalidate/wordpress
       · timeout 0.5s, blocking: false   ← 不读响应
       · 失败仅 error_log                ← 无重投
  → Next: createHmac + timingSafeEqual 校验
    → revalidateTag(tag, { expire: 0 })
    → revalidatePath(...)（每内容域自定义列表）
```

**风险**：Next 不可用时失效永久丢失，等 `revalidate: 3600` 自然过期。

---

## 2. 数据所有权矩阵

| 数据 | 产生 | 存储 | 读取方 | 缓存 |
|---|---|---|---|---|
| 页面正文/SEO | WP 编辑器 | `wp_posts` + postmeta | Next（`fh/v2/pages`） | tag `site-pages`，3600s |
| 首页模块 | WP 编辑器（60+ path） | `fh_content_by_locale_json` | Next（`fh/v2/pages`） | 同上 |
| Insights 文章 | 原生 post + 1 个 ACF 组 | `wp_posts` + postmeta | Next（`fh/v1/guides`） | tag `insights-guides` |
| 轮毂型号规格 | 构建期脚本生成 | `wheel-catalogue.ts` | Next（本地） | 无（构建期） |
| 轮毂批准 | WP 后台勾选 | `wheel-publication.json`（快照） | Next（本地） | 无 |
| 询盘 | 访客提交 | WP 三张表 | WP 后台 | 无 |
| 邮件投递状态 | WP outbox | `wp_fh_inquiry_outbox` | WP 后台 + 告警 cron | 无 |
| UI 文案 | 代码 | `src/lib/i18n/dictionaries/*.ts` | 构建期 | 无 |
| 业务内容兜底 | 代码 | `src/content/*.ts` | 构建期 | 无 |
| 站点域名 | 环境变量 | 构建产物（烤入） | canonical/sitemap/robots | ⚠️ 无法运行时改 |

---

## 3. 缓存策略现状与目标

### 现状

| 内容域 | 标签 | revalidate | 失效触发 |
|---|---|---|---|
| Pages | `site-pages` | 3600s | `save_post_page` 等 |
| Wheels | `wheel-publication` | 3600s | 轮毂 CPT 变更 |
| Insights | `insights-guides` | 3600s | post 变更 |
| 轮毂目录 | 无（构建期） | — | 需重新构建 |

### 目标（M13）

1. **失效失败重投**：WP 侧加队列表（`fh_revalidate_queue`），cron 重投；Next 侧返回结果码供对账
2. **细粒度标签**：`cms:post:<id>:<locale>` / `cms:product:<id>:<locale>` / `cms:list:<type>:<locale>`
3. **标签集中登记**：`src/lib/wordpress/cache-tags.ts` 单一导出
4. **签名加时间戳**（防重放，与邮件 webhook 对齐）
5. **多实例**：当前单实例不需要；若扩容，改用 `revalidateTag` 广播或共享存储

---

## 4. 故障降级矩阵

| 故障 | 当前行为 | 目标行为 |
|---|---|---|
| WP 不可达（读） | adapter 返回 `null` → 页面走本地 fallback | 同一行为，但**区分错误类型**并记 metrics |
| WP 不可达（写询盘） | `wpWrite` 返回 `not_configured`/`network` → 503，不落库 | 同左，加告警 |
| 邮件发送失败 | 询盘已入库，outbox 退避重试，5 次后 abandoned | 同左，加**真实告警通道 + 后台重放** |
| 缓存失效失败 | 无重试，等 3600s 自然过期 | 重投队列，15 分钟内收敛 |
| `NEXT_PUBLIC_APP_URL` 未配 | sitemap 空、robots 全禁、llms.txt 404 | 同左（正确），加**启动告警** |
| 轮毂快照过期 | 无检测 | 构建时比对 WP 数量，差异超阈值告警 |

---

## 5. 跨语言数据流

```
同一实体（如"首页"）
  │
  ├── en: WP Page (key="home", locale="en", id=101)  ← 公开
  ├── zh: WP Page (key="home", locale="zh", id=205)  ← 草稿
  ├── es: WP Page (key="home", locale="es", id=206)  ← 草稿
  └── th: WP Page (key="home", locale="th", id=207)  ← 草稿
        │
        └── fh_translation_group 字段（当前存在但前端未消费）
```

**目标（M05）**：`fh_translation_group` 提升为真正的 `entityId`，前端用它做：
- hreflang 集合计算
- 语言切换保留实体
- sitemap 跨语言聚合

**当前状态**：`entityId` 语义缺失，hreflang 靠「同路径不同前缀」推断 → 一旦某语言需要不同 slug 立即失效。

---

## 6. 数据流铁律

1. **展示层不碰 CMS**：`src/components/` 不 import `@/lib/wordpress/*`
2. **询盘单一写入方**：只有 WordPress 写询盘表
3. **轮毂规格单副本**：只在 `wheel-catalogue.ts`
4. **站点域名单源**：只在 `NEXT_PUBLIC_APP_URL`，且构建期烤入 → 跨机部署必须比对烤入值
5. **发布资格单源**：只在 `publication.ts:getPublicLocalesForPath`，所有消费方必须显式传入结果（不允许用默认值）
