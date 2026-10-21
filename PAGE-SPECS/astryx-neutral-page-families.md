# Astryx Neutral 暖白界面：页面族实施映射

- 日期：2026-10-11
- 状态：全站主题与 P5 本地回归已完成；内容任务以首发逐视口规格和各子规格为准，商用发布仍 No-Go。
- 主题入口：`src/app/providers.tsx`、`src/theme/fenghuai-neutral/neutralTheme.ts`、`src/app/globals.css`。

## 共享站点外壳

| 范围 | 用法 | 保留的业务边界 | 验收 |
|---|---|---|---|
| Header 与移动导航 | 根 Astryx Theme 提供语义色；导航保留 Next Link 和原生按钮 | 路由、四语言、菜单层级不由主题决定 | 320/390/768/1440；按钮可见、展开、Escape/焦点、当前页标记 |
| Footer、语言切换、面包屑 | 浅色表面、暖灰边线和文字；既有控件引用本地 Neutral 主题 | 链接目标与翻译字典不变 | 四语言链接与返回顶部；脚注文案足够对比 |
| 询盘入口与 Toast | 导航、页脚、产品页原位行动；Neutral Toast 提示加入总询盘 | 不挂载全站浮动按钮；不把未保存的询盘显示为提交成功 | 320×568 可进入询盘页，清单刷新后保留；错误可读 |

## 页面族

| 路由/模板 | Astryx 候选或已采用原语 | 项目组件继续负责 | 必验状态 |
|---|---|---|---|
| `/`、`/about`、`/capabilities`、`/products` | Theme、通用按钮/链接、提示 | Hero、制造关系、媒体归属、四线卡片 | 暖白首屏、图片缺失兜底、无 JS 可读 |
| `/products/wheels`、`/products/wheels/flow-formed` | Field/Banner/EmptyState 等已核验原语 | 服务端 GET 筛选、普通链接分页、真实卡片 | 多值组合、空结果、320 按钮、无 JS、当前页 URL |
| `/products/wheels/[model]`、`/products/wheels/forged` | Dialog、NumberInput、Toast | 单变体规格、finish、直接询盘与清单隔离 | 320/768 弹窗、数量任意安全正整数、失败保留输入 |
| `/products/ev-components`、`/products/custom-aluminum`、`/products/safety-tires` | Theme 与适用的行动、提示原语 | 能力说明、证据图、工艺与工程门槛 | 不生成虚构 SKU/性能主张；主行动进入正确询盘上下文 |
| `/request-a-quote`、`/contact`、`/thank-you` | Field、表单布局、Banner、Toast | Zod、隐私版本、Next API、WordPress/MySQL、Outbox | Validation/Submitting/Success/Server Error；仅落库才显示成功 |
| `/insights`、文章、孔距指南 | Tabs/Outline 等仅在语义与服务端结果等价时采用 | WordPress 批准内容、URL 类别、正文锚点 | 分类切换、撤回不公开、无 JS 正文 |
| `/fitment`、平台页 | 信息提示/面包屑 | 未验证适配数据边界 | 不把孔距或轮毂目录匹配说成车型适配保证 |
| `/tools`、`/tools/offset-calculator` | NumberInput、提示/错误原语 | 公式、单位、结果说明 | 键盘输入、负偏距、重置、移动布局 |
| `/support/*` | 面包屑/提示 | 法律草稿和版本门槛 | 未批准条款不伪装为正式政策；正文可读 |

## 迁移禁区与证据

1. 轮毂 GET 表单和分页保留服务端/原生行为；不能为了统一组件外观把筛选变成仅客户端按钮。
2. WordPress 原始 JSON 只在适配层消费；组件只读稳定内容契约。主题不改变草稿、撤回、翻译和图片审批状态。
3. Astryx 的 Dialog 和表单原语不决定询盘成功；成功条件是 WordPress/MySQL 已写入。QQ SMTP 的发送结果由 Outbox 独立处理。
4. 每个页面族交付时附桌面和手机截图、控制台、键盘/对比度检查，以及未通过项。全站 Theme 已实施；少量深色首屏因照片或工程语义有意保留，标题必须显式设浅色并通过对比度检查。
