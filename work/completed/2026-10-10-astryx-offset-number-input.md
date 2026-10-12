# Astryx 偏距计算器 NumberInput 切片

- **状态**：已完成
- **创建日期**：2026-10-10
- **完成日期**：2026-10-10
- **优先级**：P1
- **来源**：`outputs/reports/18-astryx-all-page-ui-audit-2026-10-10.md`

## 范围

把偏距计算器的六个宽度、偏距和直径输入迁移到 Astryx `NumberInput`，使用公开的 `units`、
`min`、`max`、`step` 和合法值回调。公式、结果文案和工程免责声明继续由本项目管理。

## 已完成

- 六个字段已迁移到 Astryx `NumberInput`，保留单位、范围、步进器和可清空草稿；
- 负偏距、小数、0、清空、Enter 和焦点行为已覆盖；
- 公式抽到 `src/lib/wheels/offset-calculator.ts`，组件不再承担计算事实；
- 新增同偏距加宽、降低偏距、直径增加、负偏距和无效零宽度单元测试；
- Playwright 覆盖 390px 聚焦/清空/无横向溢出、等效 200% 视口和 axe；
- 没有把这一切片扩展到轮毂询盘数量；询盘数量规则已由 DEC-089 独立确定。

## 结果

实现与审计记录见
`outputs/reports/20-astryx-interaction-feedback-and-baselines-2026-10-10.md`。
