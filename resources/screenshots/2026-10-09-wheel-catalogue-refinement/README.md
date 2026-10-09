# 轮毂目录视觉优化验收

日期：2026-10-09

## 截图与视口

- `wheels-desktop.png`：1440 × 1100；
- `wheels-tablet.png`：768 × 1100；
- `wheels-mobile.png`：390 × 1200；
- `wheels-mobile-360.png`：360 × 1000。

## 结论

四个视口的 `scrollWidth` 均等于 `innerWidth`，无页面级横向溢出。桌面为左侧筛选与四列
产品陈列，768px 为三列，390/360px 按页面规格保持单列。结果区进入视口时隐藏全站浮动
询盘按钮，避免遮挡产品图与卡片操作。

当前差距主要来自源图片背景、角度和清晰度不一致，已拆为
`work/queued/2026-10-09-wheel-image-normalization.md`，不在 UI 层伪造产品细节。

截图中的红色 `1 Issue` 为 Next.js 开发模式提示，不属于生产页面元素。
