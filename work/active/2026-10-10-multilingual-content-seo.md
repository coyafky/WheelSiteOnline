# P1 多语言正文与 SEO 路由接管

- **状态**：进行中
- **创建日期**：2026-10-10
- **来源规格**：用户 P1 要求、DEC-066、`ARCHITECTURE.md` §7.3

## 问题

当前站点只有英文根 URL 和中文前缀的路由骨架，正文主要仍来自英文内容模块；语言切换
只有中英文文字按钮，WordPress Page 也没有结构化的多语言字段。直接把英文正文复制到
西班牙语、泰语或中文 URL 会造成 SEO 和事实表达失真。

## 本切片目标

1. 支持英文、中文、西班牙语、泰语四种独立 URL 前缀，并提供可访问的语言下拉选择；
2. WordPress Page/Insights 契约预留按 locale 的正文与 SEO 字段，Next.js 只读取稳定
   适配后的 locale 内容；
3. 未完成人工核验的语言继续 `noindex, follow`，不输出可索引 `hreflang`，不进入 sitemap；
4. 保留英文根 URL，不破坏现有外链；语言切换保留路径、查询参数和片段。

## 实现决定

- 不引入第二套路由或复制 26 个页面目录；继续由 Proxy 将 `/zh/*`、`/es/*`、`/th/*`
  rewrite 到现有 App Router，locale 通过请求头进入服务端内容适配器；
- 先扩展现有 `src/lib/i18n`，不引入未经验证的第三方国际化运行时；Next.js 负责 App
  Router、metadata 和 rewrite，项目层负责内容批准门槛；
- WordPress 使用 `content_by_locale`、`seo_by_locale` 等受控字段，缺失翻译时不把英文
  快照伪装成目标语言；
- 本轮只开放语言框架、下拉控件和契约/SEO 门禁，不擅自编写未经业务核验的全站西班牙语、
  泰语法律与技术正文。逐页翻译和批准作为后续纵向 Issue。

## 验收标准

- [x] `en/zh/es/th` 路径可以保留当前路径、查询参数和片段切换；
- [x] Header 语言控件为下拉选择，键盘和屏幕阅读器可用；
- [x] 四种语言的站点 chrome 有对应字典，缺失键测试失败；
- [x] WordPress Page REST 契约可以返回目标 locale 的内容和 SEO 字段；
- [x] 未完成 locale 的响应带 `noindex, follow`，不输出可索引 `hreflang`，不进入 sitemap；
- [x] 英文根页面 canonical、现有中文 noindex 行为和询盘/WordPress 契约不回归；
- [x] 完成 lint、typecheck、build、单元测试和 Playwright URL/SEO 检查。

## 非范围

- 不在本 Issue 内虚构公司正式翻译、隐私、质保、交付或工程规格；
- 不自动打开中文、西班牙语或泰语索引；
- 不删除现有英文内容快照和 WordPress 回退路径；
- 不执行 commit、push、部署或 DNS 变更。
