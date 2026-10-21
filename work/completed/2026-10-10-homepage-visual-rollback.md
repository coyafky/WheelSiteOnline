# 首页视觉回退

- **状态**：已完成
- **开始日期**：2026-10-10
- **完成日期**：2026-10-10
- **用户结果**：首页恢复最近一次需求入口增量之前的完整工业品牌首屏，不再把三个采购起点卡片挤进 Hero；其余内容区块和已完成业务能力不回退。

## 范围

1. 移除首页 Hero 的三个需求入口卡片与对应页面装配；
2. 恢复 Hero 原有标题比例、上下留白、正文间距与品牌按钮字形；
3. 保留 Hero 媒体失败兜底、WordPress 首页内容/SEO、四语言路由和完整五区块；
4. Astryx 继续只用于已批准的面包屑与询盘表单切片，不扩散到首页；
5. 更新与旧需求入口相冲突的浏览器验收，并保存桌面/移动截图。

## 非范围

- 不删除询盘上下文解析能力；其他页面仍可携带 `product_line`、`intent` 和 `input_type`；
- 不回退 WordPress 内容接管、多语言路由、询盘可靠性或 Astryx 表单；
- 不提交、推送或部署。

## 验收条件

- 首页不存在 `[data-home-intent-entry]`；
- 首页仍渲染 Hero、产品线、能力、交付流程和收尾询盘五个直接区块；
- 首页主 CTA 恢复 Barlow Condensed 和 uppercase 品牌字形；
- 首图失败兜底、键盘、axe、移动端无横向溢出和完整工程门禁通过。

## 完成结果

- Hero 三个采购起点及页面装配已移除；
- 标题比例、上下留白、正文间距和双 CTA 字形已恢复；
- Hero 媒体失败兜底、WordPress SEO、四语言路由和其余四个首页区块均保留；
- `btn-pill-brand` 只应用于首页 Hero，没有回退普通按钮的易读性改进；
- 1440×1000 与 390×844 视口均为五个直接内容区块、零入口卡片、零横向溢出。

## 验收证据

- `npm test`：31/31；
- `npm run lint`、`npm run typecheck`：通过；
- `npm run build`：191 页面；
- `CI=1 npx playwright test --project=chromium`：31/31；
- 截图：`outputs/reports/ui-evidence-2026-10-10/homepage-rollback/home-desktop.png`、
  `home-mobile.png`。
