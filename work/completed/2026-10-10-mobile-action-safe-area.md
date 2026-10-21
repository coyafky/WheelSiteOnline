# 移动端行动入口与安全区修复

- **状态**：已完成
- **完成日期**：2026-10-10
- **来源规格**：`outputs/reports/13-first-principles-incremental-roadmap-2026-10-10.md`

## 已交付

- 浮动询价入口在移动端调整为距底部 78px 加 `safe-area-inset-bottom`，桌面端在大屏恢复原有
  22px 位置，避免覆盖目录产品图、规格和表单底部控件。
- 保留询盘页、感谢页、页脚和移动筛选抽屉的隐藏逻辑；隐藏时继续设置
  `aria-hidden=true` 与 `tabIndex=-1`。
- 增加 `data-floating-quote-safe-zone` 观测标记，便于截图和浏览器回归定位。

## 验收证据

- 390×844 移动视口安全区 Playwright 断言通过。
- 页脚遮挡、键盘焦点、axe/WCAG、200% 等效缩放和完整 30 项浏览器回归通过。
- 截图：`outputs/reports/ui-evidence-2026-10-10/wheels-mobile.png`

## 未包含

- 真实设备刘海区的硬件矩阵尚未采集；CSS 已遵守系统安全区变量，后续在发布前用真实设备复核。
