# Astryx Banner / FormLayout 反馈外壳评估

- 日期：2026-10-10
- 状态：已完成本切片
- 关联任务：`work/active/2026-10-10-astryx-ui-expansion.md`
- 关联决定：DEC-088
- 范围：轮毂目录的筛选操作提示、结果反馈和移动筛选抽屉

## 一、先定义问题

轮毂目录有三种不同性质的信息，不能只按“看起来像提示框”来替换：

1. **操作说明**：告诉用户同一筛选组可以多选、组内是 OR 关系；
2. **结果摘要**：告诉用户当前命中多少型号；
3. **无结果反馈**：告诉用户没有匹配，并给出清除筛选和发起工程复核的路线。

第一种是持续性的辅助信息，第二种是页面内容，第三种已经有明确的 `EmptyState` 业务外壳。
因此不能把三者都包成 `alert`，否则屏幕阅读器会把正常目录状态误报成错误。

## 二、Astryx 官方 API 探针

本次固定使用仓库中的 `@astryxdesign/core@0.6.7` 与 `@astryxdesign/theme-neutral@0.6.7`，并查阅
[Astryx 组件目录](https://astryx.atmeta.com/components) 与安装包随附的公开源码。

### `Banner`

- `status="info"` 输出 `role="status"`，适合持续性的筛选操作说明；
- `status="warning"` / `"error"` 输出 `role="alert"`，保留给真正需要立即注意的异常；
- `container="card"` 和 `collapsible={false}` 可以在服务端直接输出稳定的可见说明；
- 组件是公开 API，不依赖内部 CSS 类名承载业务逻辑；
- `Theme` 可以局部包围组件，Neutral 的颜色不会扩散到目录原有黑灰橙布局。

### `FormLayout`

- 只输出一个布局 `<div>`，通过 `direction` 提供垂直、水平或标签左右布局；
- 不创建 `<form>`，也不替代 `fieldset`、`legend`、`name`、`value` 或 GET 提交；
- 适合询盘表单中一组 Astryx 字段的间距和方向，当前 Step 1 已在使用；
- 不适合包住轮毂筛选器：筛选器由桌面/移动两份原生 GET 表单、多个语义 `fieldset` 和锁定工艺说明组成。

探针文件：

- `tests/astryx-feedback-shell-probe.test.mts`

探针同时验证了：信息 Banner 是 `status` 而非 `alert`；警告 Banner 才是 `alert`；FormLayout 不会把
原生 `fieldset` 改成客户端表单。

## 三、本切片的实现

### 已迁移：筛选组合规则

`src/components/wheels/wheel-catalogue-filters.tsx` 新增了局部
`FilterInstructionBanner`：

- 使用 Astryx `Banner status="info"`；
- 桌面栏和移动 `<details>` 抽屉各渲染一份，保持两份表单的独立提交；
- 保留原有说明文案，不改变 `q`、`diameter`、`width`、`pcd`、`process` 字段；
- 不引入 `onChange`、客户端筛选状态或隐藏字段同步；
- `Theme` 只包住 Banner，目录布局和品牌令牌仍由本项目控制。

### 明确不迁移：结果摘要和无结果状态

- “23 models match …” 继续使用普通结果摘要，不放进 `role="status"`，避免每次筛选都产生额外播报；
- 无结果继续使用 Astryx `EmptyState`，并保留筛选摘要、清除筛选和工程复核链接；
- 不用 `FormLayout` 改写筛选器的字段组，因为它不能替代原生 GET 语义。

## 四、浏览器与无障碍验收

新增契约：

- `e2e/site-contract.spec.ts`：筛选页存在两份 Banner，信息提示为 `role="status"`，不存在同文案的
  `role="alert"`；结果摘要仍可见。

回归结果：

- 单元/静态探针：35/35 通过；
- `npm run lint`：通过；
- `npm run typecheck`：通过；
- `npm run build`：191 个页面生成成功；
- Chromium E2E：39/39 通过；
- `git diff --check`：通过；
- 轮毂筛选 GET 状态 axe、键盘焦点、等效 200% 视口：通过。

桌面与移动证据：

- [桌面筛选反馈](ui-evidence-2026-10-10/astryx-feedback-shell/desktop-production.png)
- [移动筛选反馈（抽屉展开）](ui-evidence-2026-10-10/astryx-feedback-shell/mobile-production-open.png)

截图使用 production server；`next start` 会提示本项目应使用 standalone server，这是现有部署方式提示，
不影响本次页面验收。开发服务器的 React `eval()` 提示不计入 production 结果。

## 五、结论与后续

本切片的最小可用结论是：

1. **Banner 适合筛选操作提示**，已落地；
2. **Banner 不替代正常结果摘要或 EmptyState**，避免错误的状态播报；
3. **FormLayout 适合询盘字段组，不适合轮毂筛选器**，本次不强行迁移；
4. 轮毂目录仍保持 URL 可复制、服务端筛选、无 JavaScript 提交和产品事实边界。

后续若要继续 Astryx 增量，优先评估询盘提交后的成功/待投递反馈是否需要统一 Banner 外壳；任何迁移仍需
先验证文案来源、状态语义和服务端/无脚本回退。
