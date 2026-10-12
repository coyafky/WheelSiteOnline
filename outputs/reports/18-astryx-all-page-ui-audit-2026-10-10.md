# Astryx 全页面 UI 审计

- 日期：2026-10-10
- Astryx 固定版本：`@astryxdesign/core@0.6.7`、`@astryxdesign/theme-neutral@0.6.7`
- 审计范围：`src/app` 的 38 个 `page.tsx` 路由文件
- 审计方法：CodeGraph 路由/组件关系、源码语义检查、Astryx 安装包公开类型与源码、Playwright CLI 桌面/移动巡检
- 关联任务：`work/active/2026-10-10-astryx-ui-expansion.md`

## 一、结论先行

本轮不建议做“全站 Astryx 换皮”。最值得采用 Astryx 的地方集中在四条重复交互链：

1. **轮毂详情直接询盘**：采用 `Dialog`、`DialogHeader`，复用现有 Astryx 表单控件；这是最高优先级。
2. **长文页目录**：法律文档和 Insights 文章采用 `Outline` 做渐进增强；原生 `#section-*` 链接继续保留。
3. **数值录入**：偏距计算器与轮毂数量候选采用 `NumberInput`，但数量上限必须先由业务确定，组件不能替代业务规则。
4. **加入询盘清单反馈**：采用 `Toast`，补足当前按钮仅短暂变成 “Added” 的弱反馈；清单本身仍以 localStorage 和服务端复核为真相。

以下组件只适合小范围探针：Insights 分类的 `SegmentedControl`、状态标签的 `Badge`、预览态的
`Banner`。以下组件明确不应迁移：全局导航、语言选择、服务端分页、多值 GET checkbox、移动筛选
抽屉、营销 Hero/Card、工程规格表。

审计还发现一个与 Astryx 无关、但应先修的 P1 UI 缺陷：**轮毂详情页首屏是白底，全局 Header
仍使用深色 Hero 的白色文字模式，桌面和移动导航几乎不可见**。本地隐私诊断页的浅色首屏也有
同类问题。这个缺陷不能靠替换成 Astryx `TopNav` 解决，应修正 Header 的明暗模式契约。

## 二、范围与浏览器证据

### 路由覆盖

- 38 个页面路由文件中，31 个是实际渲染模板；
- 7 个只做永久/临时重定向：`/gallery`、`/gallery/wheels`、`/manufacturing`、`/resources`、
  `/resources/[slug]`、`/resources/bolt-patterns`、`/resources/bolt-patterns/[pattern]`；
- 动态轮毂型号、Fitment 平台、Insights 文章和 Bolt Pattern 按模板族审计，没有把同一模板的
  138 个型号和四语言 URL 重复计算成不同 UI。

### Playwright CLI 结果

在当前仓库独立的 `http://localhost:3100` 上，以英语 locale 巡检 31 个实际模板：

- 1440×900：31/31 返回 200，31/31 无页面级横向溢出；
- 390×844：31/31 返回 200，31/31 无页面级横向溢出；
- 每个模板都有且只有一个 `h1`；
- 轮毂目录是交互密度最高的页面：84 个表单控件、5 个原生 `details`、2 个状态区；
- 轮毂详情有 17 个表单控件和 1 个配置表，但当前没有任何 dialog；
- 偏距计算器有 6 个页面业务输入（另有 3 个全局语言选择节点）和 1 个原生 `details`；
- Insights Hub 有 11 个页面业务按钮（另有全局 Header 按钮），当前分类过滤与卡片展开均为手写状态。

代表性桌面/移动截图保存在
[`ui-evidence-2026-10-10/astryx-all-page-audit/`](ui-evidence-2026-10-10/astryx-all-page-audit/)。

## 三、现有 Astryx 覆盖

当前接入已经覆盖了适合的第一批基础设施：

- 根 Provider：`LinkProvider`、Astryx i18n；
- 共享导航：`Breadcrumbs`；
- 询盘表单：`TextInput`、`TextArea`、`Selector`、`RadioList`、`CheckboxList`、
  `CheckboxInput`、`Button`、`FormLayout`、`Banner`；
- 轮毂目录：搜索 `Field`、筛选说明 `Banner`、无结果 `EmptyState`；
- 已验证但拒绝：`Pagination` 不保留链接 URL，`CheckboxInput` 不能承载多值 GET 的真实
  `name=value`，因此均未强行替换。

这意味着后续应优先补“当前仍由页面各自手写的交互能力”，而不是重复迁移已经稳定的静态布局。

## 四、按页面模板族的审计矩阵

| 页面模板族 | 覆盖路由 | 当前 UI 任务 | Astryx 候选 | 结论 |
|---|---|---|---|---|
| 全局 Shell | 全部 31 个渲染模板 | Header、移动菜单、语言导航、浮动询价 | `TopNav`、`MobileNav`、`Selector` | **不迁移**。现有导航绑定四语言 URL、品牌首屏明暗和移动状态；语言切换是导航而不是取值控件。先修 Header 明暗模式契约。 |
| 首页 | `/` | 品牌 Hero、产品线、能力、流程、CTA | `Card`、`Carousel`、`Button` | **不迁移**。这些区块承担丰怀品牌表达，且首页 Astryx 化增量已经按用户复核回退。 |
| 公司与能力 | `/about`、`/capabilities` | 工厂/能力叙事、证据区块 | `Card`、`MetadataList` | **不迁移主体**。静态事实没有重复交互成本；可访问性收益不足以覆盖视觉回归。 |
| 产品总览 | `/products` | 产品线和采购路径 | `ClickableCard` | **不迁移**。卡片包含品牌层级和内容接缝，当前原生链接语义已经正确。 |
| 产品线能力页 | `/products/custom-aluminum`、`/products/ev-components`、`/products/safety-tires`、`/products/wheels/forged` | 能力说明、流程、规格证据 | `Card`、`Table`、`MetadataList` | **不迁移主体/表格**。EV 和定制开发表格是服务端语义事实，不需要 Astryx 的客户端表格插件。 |
| 定制与 Dealer | `/custom-development`、`/dealers`、`/dealers/private-label` | 合作模式、步骤、条款说明 | `Badge`、`Banner` | `Badge` 仅可作为 P2 状态外壳；静态条款/警示不应统一变成 `role=status/alert` 的 Banner。 |
| Fitment | `/fitment`、`/fitment/[platform]` | 平台入口、未核验状态、车型资料 | `Badge`、`MetadataList` | **P2 `Badge` 探针**。只替换“待确认”等状态外壳，文案和 `verified` 事实仍来自内容层；规格卡不迁移。 |
| Finish Gallery | `/gallery/finishes` | 表面处理卡片、图片真实性说明 | `Card`、`Banner` | **不迁移**。色板和真实性说明是品牌/证据区块，不是通用应用卡片或动态状态。 |
| Insights Hub | `/insights` | 分类过滤、卡片短文展开 | `SegmentedControl`、`CollapsibleGroup` | **P2 只评估分类**。五个分类段需先验证 390px 截断和键盘行为；卡片展开与品牌卡片耦合，暂不迁移。 |
| Insights 文章 | `/insights/[slug]` | 长文目录、预览态、核验说明 | `Outline`、`Banner` | **P1 `Outline`**。公开 API 输出真实 `href="#id"`，无 JS 仍可跳转；scroll-spy 是渐进增强。预览 Banner 为 P2。 |
| Bolt Pattern | `/insights/bolt-patterns`、`/insights/bolt-patterns/[pattern]` | 资料索引、核验警示、FAQ | `Badge`、`Collapsible` | **不折叠 FAQ**。所有答案当前直接可读，更符合证据页任务；状态词可纳入 P2 Badge 适配层。 |
| 轮毂目录 | `/products/wheels`、`/products/wheels/flow-formed` | 搜索、GET 多选、排序、分页、清单加入 | 已用 `Field`、`Banner`、`EmptyState`；候选 `Toast` | **P1 `Toast`** 补加入/达到上限反馈。继续拒绝 `Pagination`、`CheckboxInput`、`BottomSheet`，保留 URL、无 JS 和服务端筛选。 |
| 轮毂详情 | `/products/wheels/[model]` | 变体选择、加入总清单、直接询盘、数量 | `Dialog`、`DialogHeader`、`NumberInput`、`Toast` | **P0/P1**。直接询盘用 `Dialog purpose="form"`；总清单和直接提交严格分流。数量上限先由业务确定。 |
| 联系与总询盘 | `/contact`、`/request-a-quote` | 两步询盘、隐私同意、清单摘要 | 已用完整 Astryx 表单族；候选 `NumberInput` | **基本完成**。只在数量契约确定后评估 cart 行 `NumberInput`，不改 API/WordPress 契约。 |
| 法律文档 | `/support/privacy`、`/support/returns`、`/support/shipping`、`/support/terms`、`/support/warranty` | 长文目录、草稿状态、交叉导航 | `Outline`、`Banner` | **P1 `Outline`**，五页共享一次实现；草稿提示是静态发布状态，是否迁移 Banner 需先校准 `role=alert` 语义。 |
| 感谢页 | `/thank-you` | 收件结果、参考号、下一步 | `Banner`、`MetadataList` | **不迁移主确认 Hero**。它是页面核心状态，不应降级为通用 Banner；参考号可选用 MetadataList，但收益低。 |
| 工具 Hub | `/tools` | 可用/未开放工具状态 | `Badge` | **P2**。可统一“Not yet available”视觉，但不得把未完成工具变成可点击入口。 |
| 偏距计算器 | `/tools/offset-calculator` | 6 个数值输入、预设/重置、计算过程 | `NumberInput`、`ButtonGroup`、`Collapsible`、`MetadataList` | **P1 `NumberInput`**。单位、范围、locale 解析和合法值回调均匹配；计算公式与结果仍由本项目负责。`Collapsible` 仅替换已依赖 JS 的计算过程详情。 |
| 重定向页 | 7 个 `/gallery`、`/manufacturing`、`/resources*` 路由 | URL 兼容 | 无 | **不应添加 UI**。继续保持服务端重定向。 |

## 五、推荐的纵向切片

### P0：轮毂详情直接询盘弹窗

采用：`Dialog`、`DialogHeader`、现有 `FormLayout`/表单控件、可选 `NumberInput`。

- `purpose="form"` 会阻止误点背景关闭，同时保留 Escape；
- 原生 `<dialog>` 提供模态、背景不可操作和焦点基础；
- 桌面使用标准宽度，390px 需验证动态视口、内部滚动和软键盘；
- direct 模式只提交当前型号/配置，不读取或清空总 cart；
- cart 模式继续进入 `/request-a-quote`，两者共用 `/api/inquiries`。

现有任务：`work/queued/2026-10-10-direct-wheel-inquiry-dialog-and-quantity.md`。

### P1：长文页 `Outline`

一次共享适配覆盖 `LegalDocumentPage` 和 `ProseArticle`：

- 从现有 `doc.sections` / `guide.sections` 构造 `{ id, label, level }`；
- 保持现有 `section-*` ID 和原生 hash 链接；
- 设置固定 Header offset，验证点击落点不被 Header 遮挡；
- 无 JS 时仍必须有完整链接与全文；
- 移动端可保持普通目录或折叠成静态区块，不引入应用型 `SideNav`。

### P1：偏距计算器 `NumberInput`

- 六个宽度/偏距/直径字段迁移为 `NumberInput`；
- 使用 `units`、`min`、`max`、`step`，但公式仍在本项目；
- 重点验证 0、负偏距、小数、清空草稿、Enter/blur 提交和四语言小数格式；
- 计算结果继续是技术事实，不交给组件决定。

### P1：询价清单 `Toast`

- 根 Provider 增加一个 `ToastViewport`；
- “已加入”“数量已更新”“达到 20 项上限”使用不同持续时间和语义；
- 用 `uniqueID` 按生产代码去重，避免连续点击堆叠；
- Toast 只反馈动作，不作为保存事实；真实状态仍来自 `useInquiryCart()`；
- 错误 Toast 不自动消失，成功 Toast 可自动隐藏。

### P2：分类与状态外壳

- Insights 分类先做 `SegmentedControl` 探针，验证五段在 390px 的标签截断和读屏语义；
- 建立很薄的 `SiteStatusBadge`，只映射“待确认/已核验/未开放”等状态，不把营销标签和类别标签
  全部组件化；
- PreviewBanner 可评估 `Banner container="section"` + `endContent`，但必须保留 fixed 顶部定位、
  退出 action 和 Header 偏移，收益低于前四项。

## 六、明确不采用的 Astryx 组件

| Astryx 组件 | 不采用位置 | 原因 |
|---|---|---|
| `TopNav` / `MobileNav` | 全局 Header | 当前导航承担品牌、透明/实色首屏、四语言 URL、桌面 hover 与移动折叠；现有缺陷是明暗模式契约，不是缺组件。 |
| `Selector` | 语言切换 | 语言选择触发完整 URL 导航并更新 `<html lang>`，不是表单值。 |
| `Pagination` | 轮毂目录 | 0.6.7 需要 `onChange` 并输出按钮，破坏服务端链接、复制 URL、爬虫与无 JS。 |
| `CheckboxInput` | 轮毂多值筛选 | 布尔 `value` 不能承载 `diameter=18` 等真实 GET 值。 |
| `BottomSheet` | 移动筛选 | 会把当前原生 `details` + GET 表单变成必须依赖 JS 的客户端弹层。 |
| `Table` | 轮毂变体、EV/定制规格表 | 当前表格是服务端事实展示并已有移动卡片；Astryx Table 的选择/排序插件会扩大客户端边界。 |
| `Card` / `ClickableCard` | Hero、产品线、工厂、能力、Finish 卡 | 这些组件承载工业品牌和证据层级，不是重复应用卡片。 |
| `Collapsible` | FAQ 和关键工程说明 | 当前答案直接可读；折叠会隐藏采购者需要比较的事实。只允许用于本来就可选的计算过程详情。 |

## 七、独立 UI 缺陷

### P1：轮毂详情 Header 对比度失效

Playwright 截图显示 `/products/wheels/12?variant=12198501W` 在桌面和移动端首屏均为白底，Header
却仍按“未滚动的深色 Hero”使用透明背景和白色文字，Logo、菜单和移动菜单按钮几乎不可见。

建议不要替换整个 Header，而是在页面/布局层建立明确的首屏 tone 契约：

- `dark-hero`：未滚动时白字透明 Header；
- `light-hero`：未滚动时深字/白底 Header；
- 滚动后两者统一进入当前 solid 状态。

同一契约应覆盖本地隐私诊断面板；诊断面板是浅底时不能把白色 Header 叠在其上。

证据：

- [`wheel-detail-desktop.png`](ui-evidence-2026-10-10/astryx-all-page-audit/wheel-detail-desktop.png)
- [`wheel-detail-mobile.png`](ui-evidence-2026-10-10/astryx-all-page-audit/wheel-detail-mobile.png)
- [`legal-mobile.png`](ui-evidence-2026-10-10/astryx-all-page-audit/legal-mobile.png)

## 八、验收门槛

后续每个切片分别验收，不把本报告当成一次性迁移授权：

1. 继续固定 Astryx 版本，不自动追 beta；
2. 保留 `src/content` / WordPress 稳定接缝，Astryx 不读取原始 REST 字段；
3. 桌面 1440px、移动 390px、键盘、axe、200% 缩放和无横向溢出；
4. 轮毂目录保留 GET URL 和无 JS；长文 Outline 保留 hash 链接和无 JS 全文；
5. direct/cart 询盘分别验证 payload、清单保留/清空、隐私、幂等、422、429 和邮件待投递；
6. `npm test`、lint、typecheck、build、Chromium E2E、`git diff --check`；
7. 未经授权不 commit、push 或 deploy。

## 九、最终排序

```text
先修 Header 明暗缺陷
  → 轮毂详情 Astryx Dialog（直接询盘）
  → 法律/文章 Astryx Outline
  → 偏距计算器 Astryx NumberInput
  → 询价清单 Astryx Toast
  → SegmentedControl / Badge 小范围探针
```

这条顺序优先修复可见缺陷和采购主链路，再扩展可访问交互基础设施；营销页面和工程事实模块保持
现有品牌实现。
