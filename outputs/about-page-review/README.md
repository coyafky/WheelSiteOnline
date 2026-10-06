# About 页面视觉验收

- 路由：`http://127.0.0.1:3005/about`
- 桌面截图：`about-1440x900.png`，视口 1440×900，完整页
- 手机截图：`about-390x844.png`，视口 390×844，完整页
- 移动端横向溢出：无，`document.documentElement.scrollWidth = 390`
- 图片加载：11 张 About 制造媒体全部完成加载
- 动效检查：逐段滚动触发后截图；无 JavaScript 时内容保持可见的声明式规则未改动
