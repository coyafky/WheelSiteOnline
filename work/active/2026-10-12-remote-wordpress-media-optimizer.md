# 远程 WordPress 媒体优化器修复

## 目标

修复 9080 预发布轮毂目录中 WordPress 媒体图片被 Next.js 图片优化器拒绝的问题，并确认询盘转化页的本地/远程内容同步状态。

## 验收口径

- `images.remotePatterns` 同时允许 CMS 内部读取源与 WordPress 公网媒体源。
- 本地构建、类型、单元测试通过。
- 本地与远程 `request-a-quote`、`contact` 四语 WordPress 正文逐字段一致。
- 本地与远程 8 条询盘/联系路径渲染正文一致。
- 远程轮毂目录 Playwright 图片破图数为 0。

## 边界

本任务不修改 WordPress 页面正文、隐私批准状态或媒体数据库；远程服务器只接收已在本机构建的前端镜像。
