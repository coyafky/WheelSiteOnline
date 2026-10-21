# Hostinger 与 Cloudflare 部署选项调研

- 调研日期：2026-10-14
- 范围：Next.js 前端部署候选，以及它们与现有 Headless WordPress、询盘 API、站点 URL 和缓存行为的适配关系。
- 目的：为后续部署手册和平台样机提供依据；本文件不是可直接执行的生产操作手册，也不构成平台选择决定。

## 结论

1. **Hostinger 托管 Node.js Web App 可列为低运维候选。** Hostinger 官方文档将 Next.js 列入支持框架，提供 GitHub 导入、构建配置、环境变量、日志和资源监控。当前项目是 Next.js 16、Node `>=24`，版本范围有对应项，但仍需验证其构建器能否正确运行本项目的 `output: "standalone"`、API Route、图片优化和重验证，以及具体账户计划的资源限制。
2. **Hostinger VPS + CloudPanel 可列为自管 Node 候选。** 它给出更高的进程和服务器控制权，同时需要团队负责 Node 进程、反向代理、TLS、补丁、监控、备份和恢复；与现有腾讯云 Docker 预览形态更接近，但不是最省运维的路径。
3. **Cloudflare Workers 是现有 OpenNext 决策下的主要样机候选。** `@opennextjs/cloudflare` 支持 Next.js 16 的 App Router、Route Handler、动态路由、SSR、ISR 和经典 Middleware，但需要引入适配器/Wrangler、配置 Node 兼容和绑定，并重新核对图片优化与增量缓存。OpenNext 目前不支持 Node Middleware。
4. **Cloudflare 官方 Next.js 指南当前优先介绍 vinext，但仍标为 beta。** 这是新的评估信息，不自动推翻 DEC-009 已选择 OpenNext 的决定。后续样机可以将 `vinext check` 作为兼容性对照；生产路径仍需按 DEC-009 的 OpenNext 决策验证，或另行形成正式架构决定。
5. **静态导出不适用于本项目。** `/api/inquiries`、WordPress 预览/重验证等依赖服务端能力，禁止用 `output: "export"` 作为部署方案。

## 当前实现基线

- 项目决定采用 OpenNext，具体平台待验证（DEC-009）；仓库当前没有 OpenNext 或 Wrangler 依赖与配置。
- `next.config.ts` 当前使用 `output: "standalone"`；本地和预发布 Node/Docker 路径不能视为 OpenNext 已落地。
- [`deploy/frontend/README.md`](../../deploy/frontend/README.md) 描述的是腾讯云 `:9080` 预发布联调环境：浏览器经 Nginx 访问 Next 容器，再由 Next 访问 WordPress；该环境无正式域名/TLS，不是生产部署手册。
- `NEXT_PUBLIC_APP_URL` 在构建时固化并影响 canonical、Open Graph 与 sitemap。跨环境构建必须核对实际烤入的域名（DEC-005、DEC-063）。
- WordPress 是独立内容后端；生产前端平台必须能通过 HTTPS 访问 WordPress API，且图片源和媒体 URL 满足前端图片域名白名单。
- 询盘 API 与内容重验证均要求保留服务端运行能力；数据仍必须保存在 WordPress 询盘模块，邮件失败不应丢失已接收询盘。

## 选项对照

| 路径 | 与当前项目的契合度 | 已知优势 | 必须验证/承担的工作 |
|---|---|---|---|
| Hostinger 托管 Node.js Web App | 候选，需实测 | Next.js 列入支持框架；GitHub 部署、环境变量、构建日志和资源图表由面板管理 | `standalone` 的构建/启动约定；Node 24；API Route、图片优化、ISR/缓存标签；HTTPS、自定义域名、计划资源与备份策略 |
| Hostinger VPS + CloudPanel | 候选，自管 | 可运行常规 Node 服务；进程、端口和服务器可控 | 运维责任较多；反向代理、进程守护、TLS、补丁、资源告警、备份恢复与部署回滚需团队维护 |
| Cloudflare Workers + OpenNext | 既定方向的样机候选 | 可在 Worker 上提供 Next 服务端路由，同时静态资源走 Cloudflare；OpenNext 覆盖多项 App Router 能力 | 适配器配置；Node 兼容；图片优化绑定；ISR/缓存与 WordPress 重验证；Worker 压缩包大小限制；构建 URL 和生产回滚验证 |
| Cloudflare Workers + vinext | 对照样机，beta | Cloudflare 当前 Next.js 指南的默认路径；官方提供兼容性检查命令 | beta 状态、迁移方式和本项目插件/行为兼容性；需要先完成独立验证与架构决策，不直接替代 OpenNext |
| Cloudflare Pages 静态导出 | 不适用 | 部署纯静态站点简单 | 丢失询盘 API 等服务端功能，违反项目决策 |

## 样机验收清单

对 Hostinger 与 Cloudflare 候选使用同一组真实业务路径验收，避免只比较首页能否打开：

1. 使用 Node 24 和锁文件构建，检查构建命令、启动入口、日志与失败回滚。
2. 验证页面 SSR/静态资源、产品筛选页、WordPress 数据读取、草稿预览和图片加载。
3. 验证 `/api/inquiries`：服务端输入验证、持久化、重复提交处理、邮件失败后的可恢复性；不得把生产客户数据用于测试。
4. 验证 WordPress 内容更新后的缓存失效/重验证；确认 ISR、缓存标签及目标平台适配器行为。
5. 检查环境变量边界：公开 URL 构建时固化；WordPress 凭据、邮件凭据等只在服务端环境；生产 WordPress API 通过 HTTPS 可达。
6. 检查 canonical、OG、sitemap、robots 和 `NEXT_PUBLIC_APP_URL`，特别是跨环境构建时构建产物中的域名。
7. 评估图片优化、Worker/平台资源限制、冷启动或请求时延、费用、日志、监控、备份和恢复。
8. 仅在本地与预发布样机验收完成后，再进入平台决定和正式部署手册编写；任何远程生产部署仍须遵守项目授权门槛。

## 官方资料

- Hostinger：[Deploy a Node.js website](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
- Hostinger：[Node.js hosting options](https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/)
- Hostinger：[Set up a Node.js application using CloudPanel](https://www.hostinger.com/support/9553137-how-to-set-up-a-node-js-application-using-hostinger-cloudpanel/)
- Cloudflare：[Next.js on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- OpenNext：[Cloudflare support matrix](https://opennext.js.org/cloudflare)
- OpenNext：[Get started with Cloudflare](https://opennext.js.org/cloudflare/get-started)

官方平台指南会持续变化；正式手册编写前应重新打开并核对以上资料、目标账户计划、平台限额和实际配置界面。
