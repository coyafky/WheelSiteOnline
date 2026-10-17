# JEV SEO 与代码关键词审计

- **状态**：已完成审计，修复待排期
- **日期**：2026-10-12
- **输入**：`docs/research/关键词调研报告-峰徊四线.md`
- **工具**：本机 `jev-seo`，审计 9080 公开预发布入口；未启用 DataForSEO
- **产出**：`outputs/reports/41-jev-seo-code-keyword-audit-2026-10-12.md`

## 结果摘要

1. JEV 抓取 60 页并发现 12 项规则问题。20/100 的 F 主要由预发布 `X-Robots-Tag: noindex, nofollow` 造成，不能作为关键词相关性评分。
2. 代码中最严重的关键词风险是首页/总览仍使用 `Forged Wheels`、`1018 catalogue models`、`off-road and HP fitments`，与公开 138 型号、锻造型号 0 条、车型适配未核验的事实不一致。
3. BMW M、Mercedes-AMG、Audi RS fitment 页面仍可索引并进入 sitemap，但所有车型数据 `verified: false`，应先关闭索引再等待工程签字。
4. self-healing、safety tires、self-sealing tyres 混用，且全局描述把四条线概括为铝制品，需要统一为证据允许的产品线表述。
5. dealer/private-label 与 Insights 相关英文页面仍 noindex，需按英语内容审批矩阵逐页决定是否开放。

## 未决工作

- 关键词文案修订
- fitment noindex 与 sitemap gate
- 英语页面索引矩阵和 canonical 补齐
- 正式域名 HTTPS 与 `NEXT_PUBLIC_APP_URL` 构建门禁
- 正式域名环境复跑 JEV

