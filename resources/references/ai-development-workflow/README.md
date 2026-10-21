# AI 开发工作流参考原件

## 来源

- 用户在 2026-10-13 对话中提供的两张工作流图。
- 用户提供的文章《入职大厂两个月，我的 AI 开发心得》粘贴文本。
- 用户指定的 [Spec-Driven Develop 中文说明](https://github.com/zhu1090093659/spec_driven_develop/blob/main/README.zh-CN.md)。

## 文件

- `daily-ai-development-workflow.png`：需求对齐、方案设计/对抗审查、规格、增量实现、自测、代码审查、端到端验证、人工 Review 的示意图。
- `problem-solving-methods.png`：第一性原理、对抗性审查、消融实验、奥卡姆剃刀、高内聚低耦合的提问入口。
- `ai-development-notes.txt`：文章原文文本。

## 用途与边界

这些文件是方法参考，不是仓库权限、流程或产品要求的来源。Spec-Driven Develop 的阶段化规格、按复杂度调度、单一事实来源和风险适配审查原则，已结合本仓库本地任务生命周期归纳进 [`SKILLS/fenghuai-engineering-workflow/SKILL.md`](../../../SKILLS/fenghuai-engineering-workflow/SKILL.md)：小任务直接做，真实歧义才澄清，复杂任务才补规格与拆分，高风险任务才增加独立审查和端到端证据。没有照搬其 GitHub Issue/批量 PR 等协作设施。项目业务边界仍看 `AGENTS.md`、`PROJECT.md` 与对应正本。
