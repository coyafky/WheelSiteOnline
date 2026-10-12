# Astryx 交互反馈、弹窗基线与高风险交互审计

- 日期：2026-10-10
- Astryx 固定版本：`@astryxdesign/core@0.6.7`、`@astryxdesign/theme-neutral@0.6.7`
- 方法：CodeGraph 关系检查、公开组件 API 核对、Playwright CLI 交互巡检、自动化回归
- 关联决定：DEC-090

## 一、结果

本轮完成了两项运行时代码切片和三项浏览器审计：

1. 询盘清单新增 Astryx `Toast` 动作反馈，浮动询盘入口用 `Badge` 显示配置项数量；
2. 偏距计算器的六个数值字段迁移到 Astryx `NumberInput`，公式抽成纯函数并增加单元测试；
3. 直接询盘弹窗补齐 768×1024、320×568 和 Validation、Submitting、Success、Server Error 基线；
4. 修复 320×568 成功态保留表单滚动位置、导致弹窗标题和关闭入口被裁掉的问题；
5. 完成 FAQ、制造能力和 Insights 分类的交互语义审计，没有为了 Astryx 覆盖率制造不需要的交互。

## 二、询盘清单反馈

### 已实现

- 新增配置时显示成功 Toast；
- 重复配置合并数量时显示更新后的真实数量；
- 达到最多 20 个配置时显示错误 Toast；
- 浮动询盘入口显示 Astryx `Badge`，数值表示配置项数量，不是假装成商品件数；
- `ToastViewport` 放在根 Provider 内，只负责动作反馈，真实清单仍来自 `useInquiryCart()` 与
  `localStorage`；
- 直接询盘仍与总询盘清单隔离，不因 Toast/Badge 接入改变 payload 或成功清理规则。

### 自动化契约

Playwright 验证第一次加入显示“已加入”，第二次加入同一配置显示数量变为 2，Badge 仍为 1 个配置项。
这防止 UI 把“配置项数量”和“采购件数”混为一谈。

## 三、偏距计算器 NumberInput

六个宽度、偏距和直径字段使用 Astryx `NumberInput`，并保留：

- 宽度小数步进；
- 负偏距；
- 单位、最小值、最大值和步进器；
- 清空草稿后的无效结果提示；
- Enter、焦点和屏幕阅读器标签；
- 公式、工程免责声明和结果解释由本项目负责。

计算公式已移到 `src/lib/wheels/offset-calculator.ts`，覆盖同偏距加宽、降低偏距、增加直径、负偏距和
无效零宽度。浏览器回归覆盖六个 Astryx 控件、负偏距与小数、390px 聚焦和清空、等效 200% 视口、
无横向溢出及 WCAG A/AA axe 扫描。

## 四、直接询盘视觉基线

基线目录：

[`ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/`](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/)

| 视口 | Open | Validation | Submitting | Success | Server Error |
|---|---|---|---|---|---|
| 320×568 | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/320x568-open.png) | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/320x568-validation.png) | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/320x568-submitting.png) | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/320x568-success.png) | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/320x568-server-error.png) |
| 768×1024 | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/768x1024-open.png) | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/768x1024-validation.png) | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/768x1024-submitting.png) | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/768x1024-success.png) | [截图](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/768x1024-server-error.png) |

Playwright CLI 发现 320×568 的 Success 状态沿用提交前滚动位置，成功后弹窗顶部、标题和关闭入口不可见。
现在共享表单通过显式 `onSuccess` 通知弹窗把内部 `LayoutContent` 滚回顶部；自动化断言
`scrollTop === 0` 且标题位于视口内。

Server Error 截图使用受控 503 响应。浏览器控制台只记录预期的 503 网络失败，没有应用脚本异常，
也没有 React 开发态 CSP `eval()` 错误。

## 五、FAQ、制造能力 Tabs 与 Insights 分类审计

### FAQ：保留静态全文

当前公开 FAQ 使用服务端 `<dl>`，所有问答无需 JavaScript 即可阅读。仓库中的
`faq-accordion.tsx` 没有实际调用方。Astryx `Collapsible` 虽可用，但迁移会隐藏本来直接可比较的
采购与工程事实，并增加客户端边界，因此本轮不采用。

### 制造能力：没有可迁移的真实 Tabs

`/capabilities` 是静态能力卡和流程内容，页面没有 `tablist`、`tab` 或折叠面板；
`/manufacturing` 只做永久重定向。仓库中的 `process-explorer.tsx` 没有调用方。没有真实“切换视图”
任务时，不用 Astryx `TabList` 把静态内容改造成伪 Tabs。

### Insights：保留 `aria-pressed` 分类筛选

Insights 分类改变结果集合，不是在多个视图间导航。当前按钮组使用 `aria-pressed`，键盘 Space 可切换，
结果列表通过 `aria-live` 更新，并保留完整文章链接；URL 当前不变。Astryx `TabList` 的语义是视图导航，
不适合替换筛选输入。

证据截图：

- [Insights 分类筛选 768×1024](ui-evidence-2026-10-10/direct-wheel-inquiry-baselines/insights-category-filter-768x1024.png)

若未来产品要求分类状态可复制、可返回或可被搜索引擎识别，应先把状态提升到 URL，再单独评估
`SegmentedControl`；这不是本次视觉迁移的隐含范围。

## 六、结论

Astryx 本轮只接管重复交互基础设施：数值录入、即时反馈、持久入口计数和模态表单外壳。FAQ、制造
能力内容和 Insights 分类继续使用更符合当前任务语义的原生结构。组件选择服从业务任务、URL、
无 JavaScript 和内容可见性，而不是服从组件目录覆盖率。

## 七、完成门禁

- `npm test`：41/41 通过；
- `npm run lint`：通过；
- `npm run typecheck`：通过；
- `npm run build`：191/191 页面生成成功；
- Chromium E2E：47/47 通过（2 workers）；
- `git diff --check`：通过；
- 未 commit、push 或 deploy。
