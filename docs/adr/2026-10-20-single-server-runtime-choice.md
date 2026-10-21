# 单机部署的前端运行形态不预设 OpenNext

- 日期：2026-10-20
- 状态：已采纳（用户明确调整部署约束）
- 取代：归档决策 `archive/2026-10-17-pre-v3-docs/DECISIONS.md` 中 DEC-009 的「必须采用 OpenNext」部分

## 背景

项目需要在腾讯云新加坡轻量应用服务器上部署 Next.js 前端和无头 WordPress。
前端有 `/api/inquiries`、预览、缓存失效等服务端路径，不能用纯静态导出。
仓库已有单机联调用的 Next.js standalone 容器；旧 DEC-009 则将 OpenNext
设为唯一部署层。用户明确表示本次部署不一定使用 OpenNext。

## 决定

在这台服务器上先验证 Next.js Node/standalone 自托管与现有 API、图片优化、
缓存失效、WordPress 内网通信的兼容性。若验收通过，可以作为正式运行形态。
OpenNext 保留为后续候选方案，不是上线门槛。生产反向代理、TLS、容器编排、
备份、监控和回滚按 `docs/architecture/DEPLOYMENT.md` 的计划实施。

`next.config.ts` 不得改成 `output: "export"`；任何方案都必须保留完整服务端能力，
并在真实构建产物里核对 `NEXT_PUBLIC_APP_URL` 对 canonical、OG、robots 和 sitemap
的影响。生产部署配置须新建，不复用 9080 HTTP 联调入口。

## 理由与影响

- 单机服务器已经是本轮明确的部署目标，Node/standalone 与现有联调链路更接近，
  可减少新适配器与缓存后端的引入。
- OpenNext 的经典 Node 包装器可运行在自托管环境，但其缓存、队列与镜像链路
  仍需单独验证；当前不为形式统一增加这些部署工作。
- 保留旧 DEC-009 关于禁止静态导出的业务判断；只撤销 OpenNext 单选约束。
- 不凭该决定宣布生产已可发布。内容、图权、法律、邮件、HTTPS、备份恢复、
  监控与端到端验收仍按各自门槛通过后才发布。
