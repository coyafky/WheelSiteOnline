# Capabilities 页面视觉验收

- 路由：`http://127.0.0.1:3005/capabilities`
- 桌面截图：`capabilities-1440x900.png`，视口 1440×900，完整页
- 桌面补测：`capabilities-1280x800.png`，视口 1280×800，完整页
- 手机截图：`capabilities-390x844.png`，视口 390×844，完整页
- 手机补测：`capabilities-360x800.png`，视口 360×800，完整页
- 移动端横向溢出：无，`document.documentElement.scrollWidth = 390`
- 补测横向溢出：1280 与 360 视口的 `scrollWidth` 均等于视口宽度
- 图片加载：WM01–WM04 共 12 张公开媒体全部完成加载
- WordPress live：生产实例 HTML 使用 12 个 WordPress 媒体 URL；本地回退未触发
- 证书：WP 53/106 保持内部候选，页面未渲染
