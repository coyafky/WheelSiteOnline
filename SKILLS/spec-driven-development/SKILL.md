---
name: spec-driven-development
description: 丰怀项目唯一的 Spec-Driven Develop 治理正本；用于非简单任务的需求澄清、规格、任务分解、GitHub Full 追踪、执行确认与归档。
metadata:
  version: 1.0.0
  mode: GITHUB_FULL
---

# Spec-Driven Develop

本技能是项目级流程正本。`SKILLS/fenghuai-engineering-workflow/` 是项目约束与工程方法适配层，不再另定义一套任务生命周期；它必须引用本技能处理 Phase 0–6。`.agents/skills/spec-driven-development/` 只提供发现入口，不复制正文。

## 入口判断

收到请求后先判断：

1. **Deep Discuss**：目标、用户、事实、权限或验收仍不明确，且不同答案会改变结果。只讨论和记录，不实施。
2. **Review SPD**：用户要求审查规格、未提交修改、commit、分支或 PR diff。只读 findings-first。
3. **Spec-Driven Develop**：跨文件、跨 session、改变接口/架构/公开内容/安全边界，或需要 Issue、批次和验收。
4. **简单修复**：单文件、目标明确、低风险且已有规格覆盖；保留最小验证，不生成完整流程。
5. **发布流程**：涉及 deploy、DNS、公开索引、真实发信、付费或生产配置，另按发布门禁并逐项确认。

如果歧义会改变数据模型、页面结构、公开主张、部署方式或安全边界，必须停止猜测并进入 Deep Discuss。

## Phase 0–6

### Phase 0：意图捕获

记录一句话结果、目标用户、触发场景、来源请求、已知事实、当前假设、非范围和会改变结果的待确认项。输出分析记录，不开始实现。

### Phase 1：深度分析

读取最少但足够的项目上下文，列出现状、约束、依赖、风险、候选方案和证据缺口。至少检查 `AGENTS.md`、`PROJECT.md`、`STATUS.md`、相关架构/规格和现行任务。发现冲突时记录并询问。

### Phase 2：意图精炼

与用户确认问题定义、用户故事、范围、非范围、接口契约、发布门槛、测试决定、回滚边界和完成定义。未得到明确开始信号前不得进入 Phase 5。

### Phase 3：规格与任务分解

产出规格和任务树：

- 每个任务是可独立演示、测试或复核的纵向切片；
- 写明依赖、阻塞关系、最多 4 条可独立验证的并行泳道；
- 应用 S.U.P.E.R 检查；
- 规划 Delivery Batch、worktree 边界、批次 PR 边界；
- 按 GITHUB_FULL 创建或映射 Milestone、Issue、Project；Issue 与本地任务双向链接；
- 任务文件进入 `work/queued/`，只有开始执行才移入 `work/active/`。

### Phase 4：进度追踪

在执行前写入 `docs/progress/MASTER.md`，维护当前阶段、Milestone、Delivery Batch、Issue 映射、阻塞、drift score、下一步和归档链接。MASTER 是跨 session 导航索引，不替代任务文件或 GitHub Issue 的详细正本。

### Phase 5：确认并执行

只有用户明确确认 Phase 5/开始执行后才能修改实现。按 Delivery Batch 和 worktree 执行；并行文件集不得相交。每个切片遵循实现 → 最窄测试 → 验证 → 记录遥测，禁止把未验证内容标为完成。commit、push、PR、deploy 仍需按项目和用户授权逐项执行；本项目默认不自动执行。

### Phase 6：归档

记录实际结果、遥测、drift、评审、验证证据、外部副作用、未验证边界、回滚方式和后续任务。任务移动到 `work/completed/` 前，更新 MASTER、STATUS、DECISIONS 及必要输出。`work/completed/` 与 `archive/` 历史记录不为格式迁移而重写。

## S.U.P.E.R 架构检查

在 Phase 3 和 Review SPD 中逐项回答：

- **Single Purpose**：模块/任务是否只有一个变化原因？
- **Unidirectional Flow**：数据和依赖是否单向流动，没有反向耦合或循环？
- **Ports over Implementation**：组件是否依赖稳定的类型化契约/端口，而不是 WordPress、数据库、邮件等实现细节？
- **Environment-Agnostic**：核心逻辑是否不依赖本地机器、容器、生产平台或隐含环境变量？
- **Replaceable Parts**：适配器、存储、邮件和内容来源是否可替换而不改消费者？

项目硬约束优先：内容接缝、无图不上架、证据纪律、询盘安全、OpenNext 方向、No-Go 发布门槛和中文记录不得因 S.U.P.E.R 放宽。

## GITHUB_FULL

当前项目模式固定为 `GITHUB_FULL`，除非用户明确改为本地模式。映射关系：

| 层级 | 正本 | 用途 |
|---|---|---|
| 任务 | GitHub Issue + `work/` 文件 | Issue 是任务事实；本地文件保存中文规格、执行证据和审计档案 |
| 阶段 | Milestone | 聚合一组 Phase/批次 |
| 看板 | GitHub Project | 跨阶段状态、阶段、优先级、泳道、阻塞和 Delivery Batch |
| 集成 | Delivery Batch + 批次 PR | 交付边界；没有实际改动不得伪造 PR |
| 并行 | worktree | 只用于文件集互不相交的独立泳道 |

每个本地现行任务必须有 `GitHub Issue` 字段；Issue 正文必须反向链接本地任务、来源规格、依赖、验收和验证命令。历史 completed/archive 不补造 Issue/PR。没有足够 GitHub 权限时记录 WARN，不能伪造资源编号。

GitHub 写操作仅限本次授权范围，创建前核对仓库、名称、内容和重复项；不删除、关闭或重写已有资源。Project 字段、自动关联、worktree 和 PR 关联若未实际验证，必须标记未验证。

## 自适应控制与遥测

每个切片记录：开始/结束阶段、计划任务数、完成任务数、重分解次数、阻塞分钟数（若可得）、范围变更、验证结果和用户确认点。`drift score` 使用 0–5 级：

- 0：范围、依赖、验收和证据均稳定；
- 1：仅文案/文件定位等局部偏差；
- 2：一个任务需要重拆或验收调整；
- 3：接口、架构、公开主张或关键依赖变化；
- 4：原始意图或安全边界变化；
- 5：无法继续证明目标，必须回到 Phase 0/1。

达到 2：暂停当前切片，重新分解并更新 MASTER；达到 3：回到 Phase 2 重新确认；达到 4–5：停止实施，进入 Deep Discuss，必要时记录新的决定。不得用“继续做完再说”掩盖漂移。

## 验证与权限

只报告实际执行的检查。文档治理至少检查链接、路径、模板字段、MASTER 映射和 `git diff --check`；代码任务按项目门禁执行。无法执行的 GitHub Project、worktree、PR 自动关联、归档脚本或权限动作，列为 WARN/未验证。未经用户明确授权不 commit、push、deploy、改 DNS、公开索引、真实发信或付费。
