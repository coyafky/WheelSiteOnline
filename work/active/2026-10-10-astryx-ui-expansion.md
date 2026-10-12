# Astryx UI 后续扩展

- **状态**：进行中
- **创建日期**：2026-10-10
- **前置任务**：`work/completed/2026-10-10-astryx-breadcrumb-form.md`、
  `work/completed/2026-10-10-astryx-breadcrumb-empty-state.md`

## 目标

在面包屑与询盘表单第一切片稳定后，继续用 Astryx Neutral 改善产品选择效率，但不做全站换皮，
不破坏现有黑灰橙品牌、内容接缝、筛选 URL、询盘上下文或 WordPress 契约。

## 切片顺序

1. 先做 Astryx `Pagination` 的服务端链接适配探针，确认是否能保留可复制 URL 与无 JS 行为；
2. 评估轮毂目录筛选器的 `Field`/`CheckboxInput` 外壳，筛选状态继续由 GET URL 驱动；
3. 评估通知横幅与询价清单反馈，不为了组件覆盖率替换已经更适合品牌表达的 Hero、产品卡片；
4. 每个切片分别保存桌面/移动截图并运行 axe、键盘、200% 缩放和筛选 URL 回归；
5. Astryx 升级前检查 beta 版本变更，不自动追新版本。

## 已完成的第一步

- 已用固定版本 `@astryxdesign/core@0.6.7` 做服务端静态渲染探针；
- 结果：`Pagination` 需要 `onChange`，输出按钮而不是普通链接；
- 决定：本项目继续保留 `WheelCataloguePagination` 的服务端 `<a href>`，不做客户端替换；
- 证据：`outputs/reports/15-astryx-pagination-server-link-probe-2026-10-10.md`、
  `tests/astryx-pagination-probe.test.mts`。

## 已完成的第二步

- 已查阅 Astryx 官方组件目录，并用固定版本做 `CheckboxInput` 静态输出探针；
- `Field` 已用于轮毂目录的型号搜索，保留原生 `input[name=q]`、GET URL 和服务端解析；
- `CheckboxInput` 暂不替换直径、宽度、PCD、工艺多选框：其 `value` 是布尔态，无法承载
  `value="18"` 等业务值；强行接入会破坏无 JavaScript 多值提交；
- axe 发现的筛选计数对比度问题已通过 `text-steel` 令牌修复；
- 定向筛选 URL、服务端 HTML、axe、键盘焦点、等效 200% 视口均已验证；截图与报告见
  `outputs/reports/16-astryx-wheel-filter-shell-probe-2026-10-10.md`。

## 下一步

- 已完成 `Banner` / `FormLayout` 评估：筛选操作说明使用 `Banner status="info"`；普通结果摘要与
  `EmptyState` 保持原实现；`FormLayout` 不包裹轮毂筛选器。证据见
  `outputs/reports/17-astryx-feedback-shell-probe-2026-10-10.md`，决定见 DEC-088。
- 已完成 38 个路由文件、31 个实际渲染模板的全页面 Astryx UI 审计；报告见
  `outputs/reports/18-astryx-all-page-ui-audit-2026-10-10.md`，桌面/移动证据见
  `outputs/reports/ui-evidence-2026-10-10/astryx-all-page-audit/`。
- 轮毂详情 `Dialog`、偏距计算器 `NumberInput`、清单 `Toast`/`Badge` 已完成；直接询盘已保存
  320×568 与 768×1024 的 Open、Validation、Submitting、Success、Server Error 基线；
- FAQ 保留服务端静态全文；`/capabilities` 没有真实 Tabs；Insights 分类继续使用
  `aria-pressed` 筛选按钮，不用 `TabList` 伪装输入控件。证据见
  `outputs/reports/20-astryx-interaction-feedback-and-baselines-2026-10-10.md`，决定见 DEC-090；
- 长文 `Outline` 已完成：法律文档与 Insights 文章共用薄适配器，保留服务端正文、hash、无 JS 与
  四语言标签；证据见 `outputs/reports/21-astryx-longform-outline-2026-10-10.md`，决定见 DEC-091；
- 隐私页浅色首屏 Header 已在 Outline axe 扩面时修复；轮毂详情 Header tone 仍按独立排队任务处理；
- 不做全站换皮。
- 后续任务已写入 `work/queued/2026-10-10-wheel-detail-header-tone.md`、
  `work/completed/2026-10-10-direct-wheel-inquiry-dialog-and-quantity.md`、
  `work/completed/2026-10-10-astryx-longform-outline.md`、
  `work/completed/2026-10-10-astryx-offset-number-input.md` 和
  `work/completed/2026-10-10-astryx-interaction-feedback-and-baselines.md`。
- 保持现有分页、语言切换和筛选 checkbox 为服务端/原生实现，除非 Astryx 提供兼容适配器；
- 每个后续切片仍需运行全量 `npm test`、lint、typecheck、build 与 Chromium E2E。

## 完成门槛

- 所有迁移组件使用 Astryx 公共 API，不依赖内部类名实现业务逻辑；
- 组件仍只接收 `src/content` 或稳定适配器数据，不直接消费 WordPress 原始字段；
- 页面无横向溢出，焦点和错误状态可见，现有询盘与目录 E2E 全部通过；
- `npm run lint`、`npm run typecheck`、`npm run build` 通过；
- 未经单独授权不提交、推送或部署。
