# 全站中文正文与 SEO 放行

## Spec-Driven 元数据

- **Phase**：3
- **Milestone**：待创建/映射
- **GitHub Issue**：[#5](https://github.com/coyafky/WheelSiteOnline/issues/5)
- **Delivery Batch**：中文内容分页面批次；按首页、产品、询盘、Insights/政策拆分
- **依赖**：逐页业务/工程/法务批准，现有英文根 URL + 中文 `/zh/*` 契约
- **S.U.P.E.R 关注**：Ports over Implementation（locale 变体不改变组件）；Unidirectional Flow（正文审核→metadata→索引资格）
- **验证命令**：i18n contract tests、`npm run lint`、`npm run typecheck`、`npm run build`、Playwright 关键视口/键盘/200% 检查
- **漂移规则**：语言范围或索引政策变化时回 Phase 2，不开放半成品中文索引

- 日期：2026-10-09
- 状态：queued
- 前置：英文根 URL + 中文 `/zh/*` 路由框架已完成（DEC-066）

## 目标

按页面规格和证据门槛逐页提供完整中文正文、metadata、表单提示与错误信息；完成中英内容
对照审核后，才为该页开放中文 canonical、`hreflang` 和 sitemap。

## 原则

- 不用机器直译替代工程、法务或业务核验；
- 未完成页面继续响应 `noindex,follow`；
- 保持 `src/content` 类型契约，优先使用同一内容对象的 locale 变体；
- 先做首页、产品总览、四条产品线、询盘，再做洞察、工具和政策；
- 每页完成桌面/移动、键盘、200% 缩放和中英文路径切换验收。

## 完成定义

- 所有公开页面正文不存在中英混杂；
- `html lang`、canonical、`hreflang`、OG locale 和 sitemap 一致；
- 英文与中文页互相可达且切换保留路径、查询参数和片段；
- 中文内容取得对应业务/工程/法务批准记录。
