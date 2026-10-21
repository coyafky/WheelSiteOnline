# 移动端页面友好度 QA 报告

日期：2026-10-16  
状态：**FAIL**（发现 1 项 P1 移动端内容裁切、2 项 P2 交互/密度问题，另有 1 项低风险 URL 清洁问题）

## 1. 执行范围

- 测试环境：本项目本地 Next.js，`http://127.0.0.1:3214`，`WP_MODE=mock`，不读取生产内容、不提交真实询盘、不发送邮件。
- 浏览器：Playwright Chromium；项目 `@playwright/test` 版本 1.64.0，Chromium 1248。
- 视口：390×844、360×800。
- 核心路由：13 条，包括首页、产品总览、轮毂目录、旋压/锻造轮毂、三电壳体、定制铝制品、自密封轮胎、About、Capabilities、询盘、Contact、Thank-you。
- 证据截图：`.playwright-cli/` 下的本地截图；截图来自真实浏览器，不是代码推测。

## 2. 结果总览

| 检查 | 结果 |
|---|---|
| 26 个路由 × 视口返回 | **26/26 为 200** |
| 页面级横向滚动检测 | 26 个页面均未出现 `documentElement.scrollWidth > clientWidth` |
| 破图检测 | 26 个页面均未发现已完成加载但 `naturalWidth = 0` 的图片 |
| 控制台错误/失败请求 | 26 个页面均为 0 |
| 轮毂筛选与分页 E2E | **4/4 通过** |
| 元素级移动裁切 | 自密封轮胎页存在，页面级 scrollWidth 检测未捕获 |

## 3. 已确认问题

### QA-20261016-01 · P1 · 自密封轮胎页移动端内容被裁切

- 路由/视口：`/products/safety-tires` @ 390×844、360×800
- 复现：滚动到“Normal road use”图文模块；继续滚动到“Material development”证据模块。
- 期望：图片和叠加文字在手机内容列内完整显示，正文可读。
- 实际：组件内部出现 686px/560px 宽的内容块，390px/360px 视口只能看到左侧；`overflow-hidden` 又阻止横向查看，文字右侧被截断。页面级横向滚动数值仍为 390/360，因此不能只用 `scrollWidth` 判定通过。
- 证据：[`fenghuai-safety-tires-mobile-overflow.png`](../../.playwright-cli/fenghuai-safety-tires-mobile-overflow.png)
- 代码定位：`src/components/safety-tires/self-sealing-tire-page.tsx:163`、`:287`。移动基础断点把宽屏 `aspect-ratio + min-height` 组合保留下来，最小高度反推出超出视口的宽度。
- 建议：移动端改为 `width: 100%` 且取消宽屏最小高度/宽屏宽高比；只在 `lg` 断点恢复宽屏比例与最小高度。修复后复跑 390/360 两个视口并逐段截图。

### QA-20261016-02 · P2 · 轮毂目录单列密度导致页面过长

- 路由/视口：`/products/wheels` @ 390×844、360×800；`/products/wheels/flow-formed` @ 390×844、360×800
- 复现：打开页面，不加筛选，观察第一页并滚动到底部。
- 期望：分页应有效控制一次浏览的负担，用户能较快比较型号并进入下一页。
- 实际：每页仍返回 24 张卡，360–639px 使用单列；轮毂目录第一页文档高度约 19,513px（390）/18,891px（360），旋压入口约 22,841px/22,216px。单张目录卡在手机上约 553–656px 高，分页存在但只把超长内容拆成多页。
- 证据：[`fenghuai-wheel-mobile-initial.png`](../../.playwright-cli/fenghuai-wheel-mobile-initial.png)
- 代码定位：`src/app/products/wheels/page.tsx:250-261`；当前基础网格为 `grid-cols-1`，每页数量由目录视图固定为 24。
- 建议：优先评估移动端每页 8–12 张，或设计更紧凑的移动目录卡；不要未经产品/SEO确认直接改成两列，因为现行规格明确要求 390px 单列。分页 URL、总页数、筛选快照和无 JS GET 回退需一起回归。

### QA-20261016-03 · P2 · 移动筛选不是规格要求的模态抽屉

- 路由/视口：`/products/wheels` @ 390×844
- 复现：点击 `Filter wheels`，按 `Escape`。
- 期望：移动筛选使用有标题、关闭按钮、焦点锁定、Escape 关闭、关闭后焦点返回的模态抽屉。
- 实际：筛选实现为原生 `<details>`，表单在页面流中展开；DOM 中没有 `role="dialog"`/`aria-modal`，按 Escape 后 `details.open` 仍为 `true`。筛选字段、底部 Apply 按钮和结果更新本身可用。
- 证据：[`fenghuai-wheel-mobile-filter-open.png`](../../.playwright-cli/fenghuai-wheel-mobile-filter-open.png)
- 代码定位：`src/components/wheels/wheel-catalogue-filters.tsx:460-500`。
- 建议：保留无 JS 的 GET 回退，同时用 JS 增强为固定底部抽屉/对话框；补关闭按钮、`aria-labelledby`、焦点锁定、Escape 和焦点返回测试。

## 4. 低风险观察

### QA-20261016-04 · P3 · 空筛选提交会生成 `q=`

在移动端打开筛选、不选择任何条件、直接点击 Apply 后，URL 变为 `/products/wheels?q=`。筛选后继续分页时又会变为不含空 `q` 的 URL。功能不受阻断，但 URL 状态不一致，建议提交前过滤空字符串，并补一个空筛选 URL 回归用例。

### 关于“筛选提示不明显”的结论

该观察有体验依据，但当前不是“功能缺失”：390px 截图中 `Filter wheels` 入口确实可见，现有 `e2e/wheel-filter.spec.ts` 的 4 项测试也全部通过。主要问题是移动首屏的 Hero 较高，筛选入口位于首屏下沿；若同时处理目录密度，可将筛选/结果数放进更紧凑的 sticky 工具栏，增强入口的持续可见性。

## 5. 已执行命令与结果

```text
身份校验：3214 首页标题为 Fenghuai；3080 阴性对照为 DeepSeek Harness
全站移动冒烟：13 路由 × 2 视口，26/26 HTTP 200，控制台错误 0，失败请求 0
PLAYWRIGHT_PORT=3215 PLAYWRIGHT_HTML_OPEN=never npx playwright test e2e/wheel-filter.spec.ts
4 passed (18.1s)
EXIT=0
git diff --check
通过
```

首次 E2E 尝试因我启动的 3214 Next 开发服务占用 `.next` 开发锁而退出 1；回收该服务后改用 3215 重跑，得到上面的 4/4 通过结果。该次退出 1 判定为环境问题，不计入页面失败。

## 6. 未覆盖风险

- 未在真实 iOS Safari、Android Chrome、低端设备或真实弱网下测试。
- 未验证生产 OpenNext 运行时、真实 WordPress 媒体响应和真实图片 CDN。
- 未修改代码；上述问题需要修复后重新进行同一组移动端回归。
