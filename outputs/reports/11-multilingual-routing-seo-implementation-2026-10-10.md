# 多语言路由与 SEO 门禁实施记录

## 结论

P1 的工程第一切片已经完成：英文根 URL 保持不变，新增中文、西班牙语、泰语独立路径，
并把 WordPress Page 与 Insights 的多语言正文、SEO 和发布状态接到既有 Next.js 内容接缝。
语言下拉可以切换当前页面并保留查询参数与片段。

这不等于中文、西班牙语、泰语正文已经完成翻译。当前只有英文进入索引放行集合；其余语言
可访问、可预览，但统一返回 `noindex, follow`，不输出可索引 `hreflang`，不进入 sitemap。

## 实现范围

- `en` 使用既有根 URL，`zh`、`es`、`th` 使用 `/zh/*`、`/es/*`、`/th/*`；Proxy 负责
  URL locale 与 App Router 内部 rewrite 的边界。
- Header 语言控件改为可访问下拉，支持键盘操作、屏幕阅读器标签，并保留当前路径、查询参数
  和 hash。
- 站点 chrome 字典增加西班牙语和泰语；四种字典键集合由测试锁定。
- WordPress 原生 Page 增加 `content_by_locale`、`seo_by_locale`、`locale_status`。
  Insights 原生文章增加 `translations`、`translation_status`。公开 REST 只返回已批准
  的语言版本，授权预览可以读取草稿。
- Next.js 适配器先把 WordPress 响应归一化为原有 `src/content/types.ts` / `GuideEntry`
  契约，组件不读取 WordPress 原始字段；字段不完整时 fail-closed。
- `INDEXABLE_LOCALES` 是唯一 SEO 放行点，目前值为 `['en']`。只有逐页完成正文、SEO、
  媒体 alt 和业务核验后，才可把目标语言加入该集合。

## 验收证据

- 单元测试：31/31 通过。
- 浏览器回归：26/26 通过，包含 WCAG 基础扫描、键盘焦点、两步询盘、幂等、限流、失败保留、
  感谢页回执、中文 URL、`es/th` noindex、预览和缓存失效。
- WordPress：`verify-native-pages.py`、`verify-insights-cms.py` 通过；两个多语言字段组
  已挂载到原生编辑器。
- `npm run lint`、`npm run typecheck`、`npm run build` 通过，生产构建生成 191 个页面。
- `git diff --check` 通过。

## 下一切片

见 [`work/queued/2026-10-10-multilingual-page-body-migration.md`](../../work/queued/2026-10-10-multilingual-page-body-migration.md)：
运营/翻译人员逐页录入并预览中文、西班牙语、泰语正文、SEO 和 alt，逐语言批准后，才扩展
`INDEXABLE_LOCALES`，再次验收 canonical、hreflang、sitemap 和真实域名。

本轮未执行 commit、push、部署或 DNS 变更。
