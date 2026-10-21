# 首页多语言模块试点

日期：2026-10-16。状态：技术试点已完成；全站迁移待分批评审。

依据：[`目标架构提案`](../../outputs/reports/2026-10-16-multilingual-module-architecture-proposal.md)、[`架构决定`](../../docs/adr/2026-10-16-homepage-locale-modules.md)。

## 本轮范围

首页 `home` 的四语独立 WordPress Page、受控五模块 PageView、可移动模块排序、逐语言发布资格，以及首页页面、metadata、sitemap、hreflang 和语言切换一致性。H01–H05 必需，不支持隐藏；已批准译文缺失时不公开索引。其他页面族在首页验收后再评审迁移。

## 执行清单

- [x] 扩展 WordPress Page 合同，按 `page_key + locale` 查询独立修订；旧聚合 Page 保留只读兼容，撤回阻断回退。
- [x] 提供首页受控字段编辑和模块排序；运行时校验五个必需模块、内容、媒体与 SEO。
- [x] 将首页五组件接入类型化 `PageView`，产品卡可见文案也按语言提供；缺译不静默回退英文。
- [x] 统一首页页面、metadata、sitemap、hreflang 和语言切换的公开资格；未批准语言不进入索引。
- [x] 迁移并核对本地首页四语言记录；只把真正有审校结果的语言标为批准，不自动批准译文。
- [x] 验证修改、排序、撤回、预览、SEO 和回滚；运行相关测试、lint、typecheck、build 与浏览器验收。
- [x] 更新状态、架构与任务结果，列出需要负责人评审的全站迁移决定。

## 约束

不得删除旧 JSON、未经审核的译文或原始素材；不得改变询盘 API、产品事实和其他页面的公开内容；不自动 commit、push 或部署。

## 结果与待办

验收证据及全站迁移评审见[`首页试点验收与全站迁移评审`](../../outputs/reports/2026-10-16-homepage-pilot-and-sitewide-review.md)。中文、西语、泰语首页草稿仍待人工翻译与图文审核，批准前保持不公开。其他页面族的迁移和站点级 SEO 门槛须另立批次，不归入本任务完成状态。
