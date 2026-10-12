# Astryx 反馈外壳评估

- **状态**：已完成
- **创建日期**：2026-10-10
- **前置任务**：`work/active/2026-10-10-astryx-ui-expansion.md`
- **目标**：评估 `Banner` / `FormLayout` 是否能改善轮毂目录的结果说明、筛选提示和移动布局，同时不改变 GET URL、服务端筛选、无 JavaScript 行为或品牌令牌。

## 范围

- 先做官方 API 静态渲染探针；
- 只选择能保持服务端 HTML 与可复制链接的组件；
- 有结果、无结果、错误和移动抽屉分别验证；
- 通过 axe、键盘、200% 等效视口和全量 Chromium E2E 后再决定是否迁移。

## 非范围

- 不把筛选状态改成客户端状态；
- 不替换服务端分页、语言切换或产品规格事实；
- 不为了覆盖组件目录而修改首页 Hero 或产品卡片。

## 完成门槛

- 有中文探针报告和决定记录；
- 若组件不兼容，保留原实现并写明证据；
- 未经单独授权不 commit、push 或 deploy。

## 结果

- 筛选操作说明已使用 Astryx `Banner status="info"`，保留桌面/移动两份原生 GET 表单；
- 普通结果摘要不使用 Banner，避免把正常数量播报成状态告警；
- 无结果继续使用 `EmptyState`；
- `FormLayout` 评估为适合询盘字段组、不适合轮毂筛选器；
- 35/35 单元测试、lint、typecheck、191 页面构建和 39/39 Chromium E2E 通过；
- 证据：`outputs/reports/17-astryx-feedback-shell-probe-2026-10-10.md`。
