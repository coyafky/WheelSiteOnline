# 移动端页面友好度修复交付报告

- **日期**：2026-10-16
- **范围**：轮毂总目录、旋压轮毂目录、自密封轮胎页面，以及移动筛选、分页和筛选计数。
- **对应任务**：[移动端页面友好度修复计划](../../work/completed/2026-10-16-mobile-page-friendliness-remediation.md)
- **前置证据**：[移动端页面友好度 QA 报告](mobile-page-friendliness-qa-2026-10-16.md)

## 结论

本次移动端修复已完成。最终方案为 PC 与移动端都保持 24 张/页；移动端在 360–639px 使用两列产品卡，不通过 viewport 改变分页集合。移动筛选继续支持无 JavaScript 的 GET 表单，有 JavaScript 时增强为可访问抽屉。筛选项数字会按照当前已选条件下仍可匹配的批准型号数联动更新，0 项保留显示但禁用未选项。

## 已完成改动

1. **自密封轮胎裁切**
   - 将宽屏专用的固定比例/最小高度约束限定到桌面断点。
   - 移动端使用更适合正文叠加的比例，保留图片批准状态和 `hasRender` 兜底。
   - `Normal road use`、`Material development` 等证据模块在 360/390px 通过元素边界检查。

2. **轮毂目录密度**
   - `/products/wheels` 与 `/products/wheels/flow-formed` 均保持 `pageSize = 24`。
   - 移动端产品网格改为两列，卡片型号、工艺、规格摘要、变体数量和 CTA 通过 360/390px 验收。
   - 桌面网格和服务端分页集合未改动。

3. **移动筛选抽屉**
   - 新增渐进增强组件：固定底部抽屉、遮罩、明确标题、关闭按钮、`role="dialog"`、`aria-modal`、`aria-labelledby`。
   - 支持打开后聚焦、Tab 焦点锁定、Escape/按钮/遮罩关闭、关闭后返回触发器焦点。
   - 保留原生 `<details>` 和 GET 表单作为无 JS 回退。

4. **筛选联动计数与 URL**
   - 已确认并覆盖 `buildFacets` 的同一批准变体求交集逻辑。
   - 选择 17 英寸后，宽度/PCD/工艺计数反映剩余可匹配型号；叠加第二条件后继续求交集；没有结果的选项显示 0 并禁用，已选项仍可清除。
   - 空搜索提交不再保留 `?q=`，总目录和旋压目录都会清理到干净 URL。

## 验收结果

### 自动化门禁

| 检查 | 结果 |
|---|---|
| `npm run check` | 通过：主题检查、58 项单测、lint、typecheck、Next build 全部通过 |
| 移动专项生产模式 E2E | 通过：14/14 |
| 视口覆盖 | 通过：360×800、390×844；轮毂总目录、旋压目录、自密封轮胎、筛选抽屉和筛选计数 |
| `git diff --check` | 通过 |

专项命令：

```text
PLAYWRIGHT_PORT=3219 PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_HTML_OPEN=never npx playwright test e2e/wheel-filter.spec.ts e2e/mobile-page-friendliness.spec.ts
```

### 全量回归说明

全量生产 Playwright 结果为 **128 passed / 21 failed / 1 skipped**。失败并非本次移动修复引入，主要为：

- 既有询盘测试等待隐私复选框超时，属于当前测试环境/页面基线不一致；
- 既有多语言流程和 robots URL 断言失败；
- 生产启动提示 `next start` 不适用于当前 `output: standalone` 配置，应使用 standalone server 启动方式。

本次相关的移动页面、轮毂筛选、目录分页与 P5 路由测试均通过；全量回归遗留项需要另立任务处理，不在本次移动修复中扩大范围。

## 仍需保留的发布阻断

- 自密封轮胎 3 张机制 WebP 的伪文字/乱码问题仍是内容与素材审核阻断，不能因布局修复而视为已解决。
- Fitment 验证、真实产品图/图权/规格、法律文本、生产 WordPress 与部署运行时仍按 `STATUS.md` 的发布门槛执行。
- 本次未执行 commit、push 或 deploy。
