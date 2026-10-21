# Astryx 页面组件增量路线图：第一性原理探究

日期：2026-10-10
状态：探究完成，等待下一条切片执行

## 一、先从问题本身出发

网站不是为了“使用更多组件”而使用组件。对丰怀独立站而言，Astryx 只有在下面三个条件
同时成立时才值得引入：

1. 同一类用户任务在多个页面重复出现；
2. 现有实现容易出现可访问性、焦点、错误状态或视觉不一致；
3. 组件不会改变业务事实、URL 契约、服务端渲染或无 JavaScript 兜底。

因此排序应是：

```text
采购任务 → 需要的交互能力 → 可验证的公共接缝 → 最小 Astryx 组件 → 回归证据
```

而不是：

```text
Astryx 组件目录 → 找页面套组件 → 让页面适配组件
```

## 二、Astryx 的原理和对本项目的意义

官方将 Astryx 描述为基于 React 和 StyleX 的、提供预编译 CSS 与类型化 React 组件的设计系统，
目前仍处于 beta。它强调四点：

- 把重复的 UI 问题解决一次，减少不同页面各自实现；
- 组件提供能力而不是强制业务流程，业务仍由应用决定；
- 主题、组件样式、局部 CSS 到源码托管是逐级增加控制和责任的路径；
- 通过可访问性、文档和实际测量来验证约定，而不是凭组件数量或审美判断。

这与本项目的内容接缝原则相容，但也给出边界：Astryx 管交互基础设施，`src/content`、
WordPress 适配器和产品事实仍由本项目管理。Astryx 是 MIT 许可，可商用；正式分发需保留上游
版权和许可声明。[官方工作原理与许可](https://astryx.atmeta.com/blog/how-astryx-works)

官方组件目录覆盖 Action、Container、Content、Feedback & Status、Form Controls、Layout、
Navigation、Overlay、Table & List 等类别。[官方组件目录](https://astryx.atmeta.com/components)

## 三、按用户任务评估页面组件

| 用户任务 | 当前页面/组件 | Astryx 适配候选 | 结论 | 原因 |
|---|---|---|---|---|
| 判断所在位置并返回上级 | 报价页、目录页、详情页、文章页、法律页的手写面包屑 | `Breadcrumbs` | P1 扩展 | 已在报价页验证；适合统一 `aria-current`、链接 Provider 和层级标签 |
| 填写并提交询盘 | `InquiryForm`、错误状态、两步流程 | `TextInput`、`TextArea`、`Selector`、`RadioList`、`CheckboxList`、`Banner`、`Button`、`FormLayout` | P0 已完成 | 已通过 Zod、焦点、axe、201/200/422/429 和邮件失败回归 |
| 在目录中按规格筛选 | `WheelCatalogueFilters`、两个 GET 表单、原生 checkbox、移动 `details` 抽屉 | `Field`、`CheckboxInput`、`Selector`、`Multi Selector` | 暂不整套替换 | 当前无 JS、URL 是唯一状态源；直接使用需要 `onChange` 的组件会破坏服务端和无 JS 契约 |
| 查看筛选后没有结果 | `WheelCatalogueEmptyState` | `EmptyState` + 现有清空筛选/提交询盘链接 | P1 推荐 | Astryx 明确要求空状态必须给出下一步；业务动作仍由本项目链接决定 |
| 查看已应用筛选 | `WheelCatalogueAppliedChips` | `Badge`/`Token` 外壳 + 原有可点击链接 | P1 可选 | 只换状态视觉，不改变 query 参数和清除行为 |
| 翻页浏览目录 | `WheelCataloguePagination` 的普通链接 | `Pagination` | 暂不替换 | 官方 `Pagination` 的核心 API 需要 `onChange`；当前分页是服务端可爬取链接，不能为视觉引入客户端边界 |
| 选择型号的具体变体 | `WheelVariantSelector`、服务端规格快照 | `Selector`、`Field` | P2 评估 | 只有在保留 URL/服务端复核、键盘搜索和未确认规格 fail-closed 的前提下才可迁移 |
| 阅读 Insights 分类与展开详情 | `GuidesAccordion` 的分类按钮和 `hidden` 详情 | `SegmentedControl`、`Collapsible` | P2 评估 | 分类数量适合 segmented control；展开内容需先证明 Astryx Collapsible 不损失无 JS 可读性 |
| 添加轮毂到询价清单 | `AddWheelToInquiryButton`、清单摘要 | `Button`、`Toast`、`Banner` | P2 推荐 | 可改善“已加入/数量变化”的反馈，但必须保留 localStorage、幂等和询盘清单快照 |
| 预览、草稿和邮件状态提示 | `PreviewBanner`、询盘成功/待投递提示 | `Banner` | P1 可选 | 与 Astryx Banner 的持久反馈语义一致；需要保持预览横幅和生产状态不同色/不同文案 |
| 语言切换 | `LanguageSwitcher` 的原生 select | `Selector` | 不迁移 | Astryx 文档明确 Selector 不是导航组件；语言切换本质是 URL 导航，不是表单取值 |
| 顶部导航和移动菜单 | `SiteHeader` 自定义导航 | `Top Nav`、`Top Nav Mega Menu` | 暂不迁移 | 现有导航承载品牌、四语言 URL、下拉和移动状态，替换收益小、回归面大 |
| 首页 Hero、产品卡片、制造流程 | `HomeHero`、`ProductShowcase`、`ProjectRouteSection` | `Card`、`Carousel`、`Layout` | 不迁移 | 这些模块表达丰怀独有的工业品牌和证据边界；官方也提醒 Card 不是默认布局工具，Carousel 不应隐藏必须比较的信息 |
| 规格表和能力证据 | `wheel-detail-sections`、能力页视口 | `Table`、`MetadataList`、`Card` | 暂不迁移 | 业务事实优先；先保持现有语义 HTML、逐变体来源和媒体兜底，不能为皮肤换组件 |

## 四、推荐增量顺序

### 切片 A：共享面包屑扩展（P1）

把已验证的 `SiteBreadcrumbs` 扩展到目录、轮毂详情、Insights 文章、能力页和法律页。
每页的文本由当前 locale 和稳定内容适配器提供，组件不读取 WordPress 原始字段。

验收：当前项不可点击并带 `aria-current="page"`；英文/中文路径正确；不改变 canonical、
hreflang、sitemap；axe 和键盘通过。

### 切片 B：轮毂目录空状态与筛选反馈（P1）

只迁移 `EmptyState` 和可选的 `Badge`/`Token` 视觉，不迁移筛选状态管理。保留两个 GET 表单、
移动 `details` 抽屉、服务端筛选、query 参数和清空/询盘链接。

验收：无结果时说明具体原因并可一键清空或进入询盘；刷新和复制 URL 结果一致；无 JS 仍可操作。

### 切片 C：目录分页适配评估（P1 研究，不保证采用）

先做适配层探针，确认 Astryx `Pagination` 能否以服务端链接渲染；若必须依赖 `onChange`，
保持现有链接分页，不为组件覆盖率改成客户端分页。

### 切片 D：Insights 分类与展开（P2）

分类少且稳定时评估 `SegmentedControl`；详情展开评估 `Collapsible`。若无 JavaScript 时不能
保持文章摘要和详情可读，则继续使用现有原生按钮/`hidden` 方案。

### 切片 E：清单操作反馈（P2）

用 `Toast` 或 `Banner` 明确告知“已加入询价清单”和当前数量。通知不能成为保存事实；真实清单
仍以 localStorage、服务端重查和 WordPress 快照为准。

## 五、明确不做的事

- 不把首页回退后的 Hero、产品卡片和制造流程改成 Astryx 模板；
- 不把所有 `<button>`、`<select>`、`<input>` 机械替换成 Astryx；
- 不为使用 `Pagination`、`Selector` 或 `Collapsible` 强行把服务端页面改成客户端页面；
- 不让 Astryx 组件直接读取 WordPress REST 原始字段；
- 不因 Astryx beta 升级而自动追新版本；每次升级重新运行完整询盘、目录和无障碍回归。

## 六、当前结论

最值得继续做的是：

1. 共享面包屑扩展；
2. 轮毂目录 EmptyState 与筛选反馈；
3. 研究而非承诺分页迁移；
4. 最后才考虑 Insights 交互和清单 Toast。

首页维持当前回退后的完整工业品牌样式。Astryx 在本项目中的角色是可审计的交互底座，不是
品牌重做工具。

## 参考

- [Astryx 工作原理与许可](https://astryx.atmeta.com/blog/how-astryx-works)
- [Astryx 组件目录](https://astryx.atmeta.com/components)
- [Astryx 主题系统](https://astryx.atmeta.com/docs/theme)
- [Astryx CLI 与组件查询](https://astryx.atmeta.com/docs/cli)

## 七、2026-10-10 执行记录

已按切片 A、B 完成第一轮实现：

- 目录、轮毂详情、旋压路线、Dealer、Fitment、Insights、工具和法律页面统一接入共享
  `SiteBreadcrumbs`；服务端按当前 locale 生成内部链接，中文目录验证为 `/zh/products`。
- 合法无结果目录使用 Neutral 主题下的 Astryx `EmptyState`；筛选摘要、清空筛选、带筛选快照的
  询盘链接仍由本项目组件和 URL 契约负责。
- 新增英文/中文/无 JavaScript HTML 契约测试，并保存桌面与移动截图到
  `outputs/reports/ui-evidence-2026-10-10/astryx-empty-state/`。
- 收尾门禁：31/31 单元测试、lint、typecheck、191 页面 production build、34/34 Chromium
  E2E（`--retries=0`）、生产依赖审计 0 漏洞和 `git diff --check` 通过。

本轮没有迁移服务端筛选、分页、语言导航、首页 Hero、产品卡片或规格表。下一步按切片 C 先做
`Pagination` 服务端链接适配探针；若不能保留可复制 URL 和无 JS 行为，则继续使用现有实现。
