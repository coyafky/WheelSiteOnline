# 移动端与关键交互核验（2026-10-19）

本记录是有日期的**本地技术审计证据**，不替代页面规格、业务验收、内容审批或生产验证。使用 Playwright CLI + 本地 Chrome 访问 `http://localhost:3000`；移动端采用 390×844 CSS 视口与减少动效设置，并非真机。当前工作树有未提交改动，本轮未修改应用代码，也未提交询盘。

## 覆盖与结果

- 33/33 个路由模板最终页面返回 HTTP 200，有 `<main>` 和 H1；包括 25 个普通页面、3 个动态模板示例、5 个兼容重定向。不存在的 `/this-route-does-not-exist` 返回 HTTP 404 并显示“Page not found”。
- 33/33 个模板在 390px 视口下 `document.documentElement.scrollWidth - innerWidth = 0`；检查时已加载的图片未发现 `naturalWidth = 0`。这只是该视口和当时数据的一次烟测，不代表其他设备或页面状态均通过。
- 5 个兼容路径落点：`/manufacturing` → `/capabilities`；`/resources` → `/insights`；`/resources/forged-vs-cast` → `/insights/forged-vs-cast`；`/resources/bolt-patterns` → `/insights/bolt-patterns`；`/resources/bolt-patterns/5x112` → `/insights/bolt-patterns/5x112`。
- 33 条 [Notion 页面与模块记录](https://app.notion.com/p/841a05e0dda44e32b27a053db959c077) 均补入“移动端与交互核验”；8 条重点页面另附手机全页长图。入口见 [Notion 页面图像索引](https://app.notion.com/p/3fe8de6ee7d281a49650e0f9805c2e6a)。

## 实际点击过的交互

| 路径 | 动作与观测 | 边界 |
|---|---|---|
| `/` | 移动导航展开；Products 子菜单展开后 Wheels 链接可见 | 语言选择器只有 English，未验证跨语言切换 |
| `/products/wheels` | 筛选抽屉搜索 `A015` 得 1 条；无匹配词得 0 条、显示清除入口；分页可进入后续页 | 未穷举筛选组合、排序和全部产品 |
| `/products/wheels/a015` | 选择生产编码 `A015188502W`，URL 保留 `variant`/`code`；“Request this configuration” 展开询盘表单 | 未提交，未验证订单或适配 |
| `/insights` | Fitment 筛选后显示 2 篇；Quick preview 展开正文 | 未逐篇核实文章事实 |
| `/contact` | 空白点击 Continue 显示客户类型、产品线和描述的必填错误；补齐首步后进入联系信息步；Back 返回首步 | 未点击 Submit，落库/邮件/失败重试均未测 |
| `/tools/offset-calculator` | 选择“Same width, lower offset”，显示内侧 −15 mm、外侧 +15 mm；Reset 回到默认的两项均 +12.7 mm 示例 | 算法与说明仍需工程复核，不是车辆适配批准 |
| 不存在的路径 | 返回 404，显示“Page not found” | 未测服务器级故障页与 CMS 断连态 |

## 发现与待办

1. `/insights` 首屏文案写“Six working guides”，同页计数与卡片为 9 篇；本地来源是 [`src/content/resources.ts:23`](../../src/content/resources.ts)。应改为由真实数量生成或去掉固定数量，避免 CMS 增减后反复失真。
2. 偏距计算器**展示公式与计算实现不一致**：[`src/content/tools.ts:101`](../../src/content/tools.ts) 展示 `innerChange = newBackspace − oldBackspace`，而 [`src/lib/wheels/offset-calculator.ts:50`](../../src/lib/wheels/offset-calculator.ts) 实际另加 `diameterShift`，外侧同样如此。是否应把直径变化计入“内侧间隙/外侧凸出”还涉及几何定义，需要工程人员确定后同步算法、公式、解释与测试；当前不可把结果当作真实适配判断。
3. `/support/privacy` 仍显示预发布隐私文案。页面可渲染、没有横向溢出，并不意味着法律文本获批。
4. 询盘未实际提交，以免产生真实记录或邮件。WordPress 落库、幂等、outbox、邮件投递、失败恢复与生产告警仍属于单独验收。

## 手机长图

| 页面 | 本地证据 |
|---|---|
| 首页 | [home.png](../../outputs/project-audit/mobile-acceptance/home.png) |
| 轮毂目录 | [wheel-catalogue.png](../../outputs/project-audit/mobile-acceptance/wheel-catalogue.png) |
| A015 详情 | [wheel-detail.png](../../outputs/project-audit/mobile-acceptance/wheel-detail.png) |
| Insights | [insights.png](../../outputs/project-audit/mobile-acceptance/insights.png) |
| 联系表单 | [contact.png](../../outputs/project-audit/mobile-acceptance/contact.png) |
| 询盘入口 | [quote.png](../../outputs/project-audit/mobile-acceptance/quote.png) |
| 隐私文案 | [privacy.png](../../outputs/project-audit/mobile-acceptance/privacy.png) |
| 偏距计算器 | [offset-calculator.png](../../outputs/project-audit/mobile-acceptance/offset-calculator.png) |
| 404 异常状态 | [not-found.png](../../outputs/project-audit/mobile-acceptance/not-found.png) |

**验收出口**：逐页交互用例、至少一种真实手机/平板、CMS 异常态、询盘端到端及内容审批分别留证后，才可改变对应 Notion 记录的验证状态。本轮保留“已实现未验证”，未自称业务验收完成。
