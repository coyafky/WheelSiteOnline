# 路由清单

统计口径：`src/app/**/page.tsx` 与 `src/app/**/route.ts` 当前磁盘代码。

## 页面路由（33）

### 静态页面（28）

`/`、`/about`、`/capabilities`、`/contact`、`/custom-development`、`/dealers`、`/dealers/private-label`、`/insights`、`/insights/bolt-patterns`、`/manufacturing`、`/products`、`/products/custom-aluminum`、`/products/ev-components`、`/products/safety-tires`、`/products/wheels`、`/products/wheels/flow-formed`、`/products/wheels/forged`、`/request-a-quote`、`/resources`、`/resources/bolt-patterns`、`/support/privacy`、`/support/returns`、`/support/shipping`、`/support/terms`、`/support/warranty`、`/thank-you`、`/tools`、`/tools/offset-calculator`。

### 动态模板（5）

| Route | 模板 | 实例来源 |
|---|---|---|
| `/insights/[slug]` | `src/app/insights/[slug]/page.tsx` | WordPress post / Insights adapter |
| `/insights/bolt-patterns/[pattern]` | `src/app/insights/bolt-patterns/[pattern]/page.tsx` | 已批准指南数据 |
| `/products/wheels/[model]` | `src/app/products/wheels/[model]/page.tsx` | 公开轮毂目录 |
| `/resources/[slug]` | `src/app/resources/[slug]/page.tsx` | 兼容重定向到 Insights |
| `/resources/bolt-patterns/[pattern]` | `src/app/resources/bolt-patterns/[pattern]/page.tsx` | 兼容重定向 |

动态路由数量仅代表模板，不能据此推断 WordPress 或目录中真实实例数。

## 兼容重定向模板（5）

`/manufacturing`、`/resources`、`/resources/bolt-patterns`、`/resources/bolt-patterns/[pattern]`、`/resources/[slug]`。证据：对应 `page.tsx` 的 `redirect()` / `permanentRedirect()` 实现。

## API 与文本接口

| Route | 方法 | 作用 |
|---|---|---|
| `/api/health` | GET | 运行时、CMS 和关键配置健康检查 |
| `/api/inquiries` | POST | 询盘校验与持久化 |
| `/api/inquiries` | GET | 明确 404，不提供非权威列表 |
| `/api/preview` | GET | 开启页面/Insights 预览 |
| `/api/preview/exit` | POST | 退出预览 |
| `/api/publication` | GET | Proxy 查询路径发布语言 |
| `/api/revalidate/wordpress` | POST | HMAC 缓存失效 |
| `/llms.txt` | GET | 站点事实与内容索引入口 |

## 特殊路由能力

- 8 个 layout：根布局及 contact、dealers、insights、products/wheels、request-a-quote、support、tools 子树。
- `error.tsx`、`not-found.tsx`、`robots.ts`、`sitemap.ts`。
- `NEXT_PUBLIC_APP_URL` 缺失时 robots 全禁、sitemap 为空、llms.txt 404，属于刻意的 fail-closed。
