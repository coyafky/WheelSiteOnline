# SEO、GEO 与多语言路线图

## 当前能力

- 未配置站点 URL 时 robots/sitemap/llms fail-closed。
- 页面 metadata 已有统一 helper，canonical、hreflang、robots 绑定公开语言集合。
- 根布局具备 Organization / WebSite JSON-LD。
- 轮毂目录筛选和动态详情具备索引控制。
- 自研四语言路由：英文无前缀，中文/西语/泰语前缀；未批准语言由 Proxy 返回 404 + noindex。

## 缺口

- 当前本地环境 `/robots.txt` 全禁、`/sitemap.xml` 为空、`/llms.txt` 404，因为站点 URL 未配置；这是安全默认值，不是生产通过证据。
- `llms.txt` 仍列出 `/thank-you`。
- Breadcrumb 视觉组件没有 BreadcrumbList JSON-LD。
- FAQ 内容为空且没有 FAQPage；不得在没有真实口径时为了 schema 恢复占位内容。
- `lastVerifiedAt`、`sourceReferences`、`shortAnswer` 在 `src` 和 mu-plugin 中零命中。
- 除首页与个别域外，非英文页面族没有完整审批闭环；缺网络级 hreflang-sitemap parity。

## 分阶段计划

1. 上线前：正式域名与索引策略核验；移除 llms 的 thank-you；修 E2E；确认英语内容与法律页面。
2. 预发布：逐页抓取 canonical、hreflang、robots、JSON-LD、alt 和内部链接；与 sitemap 交叉验证。
3. 上线后基础：接 Search Console / Bing / analytics，建立真实曝光与询盘基线。
4. 多语言：按市场优先级逐页面族翻译、审核、批准；不做默认公开。
5. GEO：只基于可验证品牌/产品事实补短答、来源与核验日期；建设 FAQ、实体页和可引用片段。
6. 持续运营：记录内容来源、更新时间、变更原因和 AI 搜索基线；不承诺一定获得 AI 推荐。
