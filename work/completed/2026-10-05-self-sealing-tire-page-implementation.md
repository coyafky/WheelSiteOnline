# 自密封轮胎页面实现

- 日期：2026-10-05
- 状态：已完成
- 路由：`/products/safety-tires`
- 依据：`PAGE-SPECS/self-sealing-tires.md`

## 范围

- 按 T01–T06 重建道路痛点、产品定义、密封机理、8 mm 内部测试条件、证据系统和询盘边界。
- 接入 WordPress 151/122/137/130、153/144、149/131/139、156/135/125、146/140/147/155/136。
- 为 17 张公开媒体补齐可访问文本、说明文字、来源、用途与批准元数据，并提供本地 WebP 回退。
- 删除旧页中没有型号报告支持的性能数字、泛化认证和绝对安全表达。
- 完成桌面、移动、WordPress live、无横向溢出、lint/typecheck/build 与生产实例验收。

## 验收记录

- T01–T06 全部实现；旧页的无报告性能数字、泛化认证和绝对安全表达已移除。
- 17 张公开媒体通过一次 WordPress REST 请求读取；17/17 有 alt 和 caption，并有同图本地 WebP 回退。
- 8 mm 保存为 `supplier-stated`、`tread`、`puncture-test spike` 的结构化证据，询盘保留测试文件上下文。
- `npm run check` 通过；Next.js 生产构建完成 64 个静态页面数据生成。
- standalone live：页面 200、1.09 秒、17 个 WordPress 媒体 URL。
- standalone mock：页面 200、0.18 秒、17 个本地 WebP 回退、0 个 WordPress URL。
- 1440×900、1280×800、390×844 与 360×800 全页截图完成；四个视口均无页面横向溢出，图片加载失败数为 0。
- 无 JavaScript：页面 200、六个主标题和八个主内容链接可见，390 宽度无溢出。
- 交付截图：`outputs/self-sealing-tire-page-review/`。
