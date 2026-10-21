# Astryx 询盘反馈、视觉基线与交互审计

- **状态**：已完成
- **创建日期**：2026-10-10
- **完成日期**：2026-10-10
- **优先级**：P1

## 范围

1. Inquiry Cart 的 Toast/Badge 反馈；
2. 768×1024 与 320×568 的直接询盘弹窗基线；
3. Validation、Submitting、Success、Server Error 四种视觉状态；
4. FAQ、制造流程 Tabs、Insights 分类交互审计；
5. 偏距计算器 Astryx `NumberInput` 改造。

## 结果

- Toast 明确区分新增、重复合并和清单满额，Badge 表示配置项数量；
- 两种视口、五种弹窗状态均已保存截图；
- 修复 320×568 成功态没有回到弹窗顶部的问题；
- FAQ 保留静态全文，制造能力页不制造伪 Tabs，Insights 保留 `aria-pressed` 分类筛选；
- 偏距计算器 NumberInput、公式单元测试、390px、200% 和 axe 回归完成。

详细证据见 `outputs/reports/20-astryx-interaction-feedback-and-baselines-2026-10-10.md`。
