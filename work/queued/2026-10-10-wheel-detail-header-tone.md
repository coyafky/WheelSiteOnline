# 轮毂详情与浅色首屏 Header 明暗契约

- **状态**：待开始
- **创建日期**：2026-10-10
- **优先级**：P1
- **来源**：`outputs/reports/18-astryx-all-page-ui-audit-2026-10-10.md`

## 问题

轮毂详情页首屏是白底，但全局 Header 在未滚动时仍使用深色 Hero 的透明白字模式。桌面导航、
Logo 和移动菜单按钮几乎不可见。本地隐私诊断面板为浅底时也会触发同类问题。

## 目标

建立显式的页面首屏 tone 契约：深色 Hero 使用透明白字，浅色首屏使用可读的深字/实色 Header；
滚动后继续进入现有 solid 状态。不用替换成 Astryx `TopNav`，不改导航 URL、语言切换和品牌结构。

## 验收

- `/products/wheels/[model]` 桌面与 390px 移动端首屏 Header 可读；
- 本地隐私诊断面板存在时 Header 可读；
- 深色 Hero 页面未退化；
- 键盘焦点、菜单展开、滚动切换和四语言路径保持；
- Playwright 截图、axe、lint、typecheck、build 和 `git diff --check` 通过。
