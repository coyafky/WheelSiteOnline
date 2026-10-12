# Hero 媒体加载韧性

- **状态**：已完成
- **完成日期**：2026-10-10
- **来源规格**：`outputs/reports/13-first-principles-incremental-roadmap-2026-10-10.md`

## 已交付

- 新增客户端 Hero 媒体包装器：批准图片正常渲染时保留原有渐变与视差，触发图片错误时切换
  同尺寸工业网格，不改变 Hero 高度、标题或 CTA 位置。
- 没有生成产品事实或替换产品图片；兜底图只承担装饰层和页面可读性。
- 图片不可用和未批准两种状态都保留稳定背景，页面不会出现空黑块或破图。

## 验收证据

- Playwright 在浏览器中主动触发首图 `error`，断言 fallback、H1 和 CTA 仍可见。
- reduced-motion、axe/WCAG、控制台、200% 缩放和完整 30 项浏览器回归通过。
- 截图：`outputs/reports/ui-evidence-2026-10-10/home-desktop-after.png`、
  `home-mobile-after.png`

## 未包含

- 生产真实网络下 LCP/解码失败上报尚未接入；这是路线图 P2 数据反馈，不在本切片引入分析平台。
