# 引入项目工程工作流技能

- **状态**：已完成
- **创建日期**：2026-10-08
- **完成日期**：2026-10-08
- **领域**：项目治理与开发流程

## 目标

采用 Matt Pocock 的工程技能方法，让需求、规格、Issue、实现、诊断、评审和复盘形成
可重复流程，同时保持本项目所有项目记录使用中文，并且不破坏现有任务、架构和授权规则。

## 执行结果

1. 固定上游 `mattpocock/skills@v1.3.1`。
2. 新建 `SKILLS/fenghuai-engineering-workflow/` 中文技能正本，归并：
   - 规格与纵向 Issue；
   - TDD 与证据化诊断；
   - 规范/规格双轴评审；
   - 工程复盘与自动化改进。
3. 新建 `.agents/skills/fenghuai-engineering-workflow/` 薄装载入口，便于 Codex 等 agent
   在后续 session 发现项目技能。
4. 在 `UPSTREAM.md` 固定 tag 与八个来源文件的 Git blob SHA。
5. 在 `.local-patch.md` 记录中文、任务路由、无自动提交等八项有意偏离。
6. 更新 `AGENTS.md`、`SKILLS/README.md`、`skills-lock.json`、`STATUS.md` 与
   `DECISIONS.md`（DEC-061）。

## 重要结论

- 采用上游工程方法，不等于采用上游所有默认工具和目录。
- `work/` 是本项目唯一 Issue 正本，GitHub Issue 只有用户明确要求时才启用。
- 上游 `implement` 的自动 commit 与本项目授权规则冲突，已明确移除。
- 中文项目记录是知识治理约束，不因引入外部技能而改变。

## 未解决问题

- 尚未把现有商用整改计划拆成一组更细的纵向 Issue；后续真正启动整改时按新技能执行。
- 当前没有 CI 自动执行 `npm run check`，仍是商用整改 Issue COM-022。
