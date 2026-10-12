# Astryx 面包屑与目录空状态增量

- **状态**：已完成
- **创建日期**：2026-10-10
- **前置任务**：`work/completed/2026-10-10-astryx-breadcrumb-form.md`、
  `outputs/reports/14-astryx-first-principles-component-roadmap-2026-10-10.md`
- **阻塞于**：无外部资源；需要保持当前服务端 URL 筛选契约

## 用户结果

访客在目录、详情、Insights 和政策页面知道自己所在位置；筛选无结果时知道发生了什么，
可以清空筛选或继续提交询盘。

## 实施切片

1. 把 `SiteBreadcrumbs` 扩展到仍使用手写 `<nav aria-label="Breadcrumb">` 的页面；
2. 只迁移 `WheelCatalogueEmptyState` 的空状态外壳到 Astryx `EmptyState`，保留现有清空和询盘链接；
3. 评估已应用筛选的 `Badge`/`Token` 外壳，不能改变 query 参数；
4. 不迁移筛选状态、移动抽屉、服务端分页或语言导航；
5. 用英文、中文、移动端、无 JS/键盘和 axe 验证，保存截图。

## 实际完成

- `SiteBreadcrumbs` 已覆盖轮毂目录、轮毂详情、旋压路线、Dealer、Fitment、Insights、工具和法律页面；
  所有内部路径按当前 locale 生成，保留英文根路径并支持 `/zh/*` 等前缀。
- 轮毂目录合法无结果分支已使用 Astryx `EmptyState`，保留筛选摘要、清空筛选和带快照询盘链接；
  未迁移服务端 GET 筛选状态与分页。
- Playwright 新增公开页面面包屑、中文路径和空状态契约断言；当前切片 targeted E2E 通过。
- Playwright CLI 截图已保存：`outputs/reports/ui-evidence-2026-10-10/astryx-empty-state/`

## 验收证据

- `npm run typecheck`、`npm run lint` 通过；
- Chromium E2E：34/34 通过（`--retries=0`）；
- 未改变产品数据、询盘 API、WordPress 内容契约或 URL 筛选语义。

## 完成门槛

- 面包屑最后一项为纯文本并有 `aria-current="page"`；
- 空状态至少有标题、原因、清空筛选和询盘下一步；
- 复制带筛选 URL、刷新和返回操作结果一致；
- `npm run lint`、`npm run typecheck`、`npm run build` 与完整 Chromium E2E 通过；
- 未经明确授权不 commit、push 或 deploy。
