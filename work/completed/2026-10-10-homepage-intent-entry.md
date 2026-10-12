# 首页需求入口增量

- **状态**：已完成
- **完成日期**：2026-10-10
- **来源规格**：`outputs/reports/13-first-principles-incremental-roadmap-2026-10-10.md`

> 2026-10-10 后续复核：本任务交付的 Hero 三入口已按用户要求由
> `work/completed/2026-10-10-homepage-visual-rollback.md` 回退；询盘上下文能力继续保留。

## 已交付

- 首页 Hero 保留原有品牌视觉，并在首屏加入三个采购起点：已有轮毂型号、已有图纸/样件、
  正在了解产品线；桌面 1280×720 和移动 390×844 均能看到入口。
- 三个入口分别生成既有 `product_line`、`intent`、`input_type` 和 `from` 上下文；产品线
  入口保留 `/products` 选择路径，不伪造具体产品线。
- 询盘页的来源确认条现在也承认产品线、意图、输入方式和来源字段；上下文通过
  `data-inquiry-context` 属性可被前端回归与运营验收观测。
- 入口文案加入 en、zh、es、th 四套 chrome 字典，语言前缀由既有 `localizedPath` 保留。

## 验收证据

- `CI=1 npx playwright test e2e/site-contract.spec.ts --project=chromium --grep "首页提供三个采购起点"`
- `CI=1 npx playwright test --project=chromium`：30/30
- `npm test`：31/31；`npm run lint`；`npm run typecheck`；`npm run build`：191 页
- 截图：`outputs/reports/ui-evidence-2026-10-10/home-1280x720-after.png`、
  `home-mobile-after.png`、`home-desktop-after.png`

## 未包含

- 尚未记录真实线上点击率；后续按路线图 P2 最小匿名事件统计处理。
