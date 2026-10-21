# 远程 WordPress 媒体与询盘页面同步核验

日期：2026-10-12

## 结论

远程询盘页正文没有丢失。本地与远程 WordPress 的 `request-a-quote`、`contact` 页面四语正文、SEO、状态和字段结构逐字段一致；本地与远程 8 条询盘/联系路径的渲染正文也逐条精确一致。

图片故障的直接原因是 Next.js 图片优化器的构建配置：WordPress 返回的媒体 URL 使用公网 `119.91.205.130:7080`，但旧前端镜像没有将该公网源加入 `images.remotePatterns`。WordPress 直链可返回 200，`/_next/image` 却返回 400，因此表现为页面图片全部丢失。

## 证据

- 远程 `/products/wheels?page=2` Playwright：25 个图片节点，旧镜像仅 1 张加载成功、24 张 `naturalWidth=0`；对应 `/_next/image` 请求均为 400。
- 远程 WordPress 图片直链抽样：`15-dx146.webp`、`15-dx163-2.webp`、`off-road-dx189-10.webp`、`17-dx282.webp`、`16-dx424-2.webp` 均返回 200。
- 本地/远程 WordPress 页面 API：两页四语均为 `approved`，正文与 SEO 载荷精确匹配。
- 本地/远程浏览器渲染：`/request-a-quote`、`/zh/request-a-quote`、`/es/request-a-quote`、`/th/request-a-quote`、`/contact`、`/zh/contact`、`/es/contact`、`/th/contact` 的正文哈希全部匹配；隐私未批准时均正确显示询盘关闭提示。

## 修复

- `next.config.ts` 新增 `WP_PUBLIC_API_URL` 媒体源接缝，同时保留 `WP_API_URL` 内部源。
- 部署 Docker 构建参数和说明明确区分内部 CMS API 与公网媒体源。
- 本地已用远程预发布参数重新构建 `linux/amd64` 镜像，待全量版本提交后加载到 9080。

## 业务结论

本次不是询盘页 WordPress/Next 内容不同步，也不是必须重新导入询盘页面；是前端图片优化器白名单缺少媒体公网源。隐私页面仍未批准，询盘表单继续按设计保持关闭。
