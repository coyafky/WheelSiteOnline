# MASTER：Spec-Driven Develop 跨会话索引

- **更新日期**：2026-10-15
- **流程模式**：`GITHUB_FULL`
- **当前阶段**：Phase 4：进度追踪；流程治理迁移待用户确认后进入 Phase 5
- **当前发布判断**：No-Go；本索引不改变生产、索引、真实发信或部署状态
- **唯一流程正本**：`SKILLS/spec-driven-development/SKILL.md`
- **项目适配层**：`SKILLS/fenghuai-engineering-workflow/SKILL.md`
- **本地任务正本**：`work/queued/`、`work/active/`、`work/completed/`

## 当前目标

把项目现有的规格、TDD、纵向切片、双轴评审和收尾规则统一映射到 Spec-Driven Develop Phase 0–6，并建立可跨 session、可追溯到 GitHub 的治理入口；不重写历史结论，不修改业务代码，不改变生产边界。

## 已确认事实

- 目标仓库：`coyafky/WheelSiteOnline`；默认分支：`main`。
- 当前分支：`coyafky/burrfish`；工作树开始时已有 i18n 相关未提交修改，属于用户既有工作，本次不触碰。
- GitHub 账户已登录，仓库权限为 `ADMIN`。
- Milestone `#1 SDD-Phase-0-4-Governance` 与 `#2 SDD-Phase-5-6-Migration` 已创建。
- 现行/queued 9 个任务已创建并映射 GitHub Issue `#1`–`#9`；本地任务已回链 Issue。
- GitHub Project 已创建：[#1 WheelSiteOnline · Spec-Driven Delivery](https://github.com/users/coyafky/projects/1)，绑定仓库 Issue 1–9。
- Project 已配置字段：`Status`、`Phase`、`Priority`、`Swimlane`、`Blocked By`、`Delivery Batch`，其中 `Blocked By` 当前为文本字段，未填猜测依赖。
- 当前活动任务 1 个，queued 任务 8 个；completed/archive 为历史证据，不补造外部资源。
- 本次外部写操作创建 2 个 Milestone、9 个 Issue 和 1 个 Project；未创建 PR，不关闭或重写已有资源。

## Phase 状态

| Phase | 状态 | 证据/下一步 |
|---|---|---|
| 0 意图捕获 | 已完成 | 用户提供迁移计划；边界为流程治理，不改业务代码 |
| 1 深度分析 | 已完成 | 已读取入口、现行技能、活动/queued 任务并核对 GitHub |
| 2 意图精炼 | 已完成 | 已确认 GITHUB_FULL、历史保留、中文记录和无自动外部动作边界 |
| 3 规格/任务分解 | 已完成 | 新增 Spec-Driven、Deep Discuss、Review SPD 与模板体系 |
| 4 进度追踪 | 当前 | 本文件建立；Milestone #1/#2 与 Issue #1–#9 已映射 |
| 5 确认并执行 | 待用户确认 | 文档迁移可继续；实现代码和批次 PR 不在本轮伪造 |
| 6 归档 | 待执行 | 更新 STATUS、DECISIONS、任务映射和验证证据 |

## Milestone / Delivery Batch / Issue 映射

### Milestone

| Milestone | GitHub 状态 | 本地范围 | 备注 |
|---|---|---|---|
| `SDD-Phase-0-4-Governance` | #1 已创建 | 流程正本、入口、MASTER、模板、历史映射 | [Milestone #1](https://github.com/coyafky/WheelSiteOnline/milestone/1) |
| `SDD-Phase-5-6-Migration` | #2 已创建 | 现行任务元数据、演练、验证与归档 | [Milestone #2](https://github.com/coyafky/WheelSiteOnline/milestone/2) |

### Delivery Batch

| Batch | 目的 | 文件集/泳道 | 状态 |
|---|---|---|---|
| `DB-GOV-01` | 流程正本、技能和模板 | `SKILLS/`、`docs/progress/` | 进行中 |
| `DB-GOV-02` | 入口规则、任务元数据、状态和决定 | `CLAUDE.md`、`AGENTS.md`、`work/`、`STATUS.md`、`DECISIONS.md` | 待执行 |
| `DB-GOV-03` | GitHub Full 演练与资源映射 | GitHub 外部资源、MASTER | Project #1 已创建并完成字段映射 |

### 现行任务

> 任务文件已存在；现行任务已与 GitHub Issue #1–#9 双向映射，并加入 Project #1。

| 本地任务 | 状态 | Phase | Milestone | Issue | Batch | 依赖 |
|---|---|---|---|---|---|---|
| `work/active/2026-10-09-wheel-catalogue-visual-refinement.md` | active | 5 | #2 | [#1](https://github.com/coyafky/WheelSiteOnline/issues/1) | 业务批次待定 | 图片规范化可影响验收 |
| `work/queued/2026-10-06-inquiry-page-and-persistence.md` | queued | 3 | #2 | [#2](https://github.com/coyafky/WheelSiteOnline/issues/2) | 业务批次待定 | 正式隐私/销售信息 |
| `work/queued/2026-10-06-wheel-catalog-detail-flow-sitemap.md` | queued | 3 | #2 | [#3](https://github.com/coyafky/WheelSiteOnline/issues/3) | 业务批次待定 | 公开集合与架构决定 |
| `work/queued/2026-10-08-commercial-launch-remediation.md` | queued | 3 | #2 | [#4](https://github.com/coyafky/WheelSiteOnline/issues/4) | 业务批次待定 | 多项外部批准 |
| `work/queued/2026-10-09-chinese-content-localization-and-seo-release.md` | queued | 3 | #2 | [#5](https://github.com/coyafky/WheelSiteOnline/issues/5) | 业务批次待定 | 中文正文与逐页审核 |
| `work/queued/2026-10-09-development-dependency-security-audit.md` | queued | 3 | #2 | [#6](https://github.com/coyafky/WheelSiteOnline/issues/6) | 业务批次待定 | 依赖版本与回归 |
| `work/queued/2026-10-09-inquiry-cart-multi-item.md` | queued | 3 | #2 | [#7](https://github.com/coyafky/WheelSiteOnline/issues/7) | 业务批次待定 | 询盘契约演进 |
| `work/queued/2026-10-09-wheel-image-normalization.md` | queued | 3 | #2 | [#8](https://github.com/coyafky/WheelSiteOnline/issues/8) | 业务批次待定 | 首发集合与素材审核 |
| `work/queued/2026-10-09-wordpress-content-adapter-expansion.md` | queued | 3 | #2 | [#9](https://github.com/coyafky/WheelSiteOnline/issues/9) | 业务批次待定 | 内容契约与 CMS 正本 |

## S.U.P.E.R 关注项

- Single Purpose：治理文档、任务记录和 GitHub 资源各司其职，不复制完整正文。
- Unidirectional Flow：需求 → 规格 → Issue/任务 → 批次 → 验证 → 归档；MASTER 只做索引。
- Ports over Implementation：页面继续依赖稳定内容模型；GitHub 追踪不改变代码契约。
- Environment-Agnostic：流程检查不依赖本地 Docker、生产平台或特定机器；未验证能力标 WARN。
- Replaceable Parts：GitHub Full 可在授权不足时降级为本地映射，但当前默认模式不静默切换。

## 自适应控制

- 当前 drift score：`1/5`。原因：Project 查询权限缺失、`gh` 不支持 milestone 子命令，但不影响本地规范落地。
- 阈值：2 重新分解；3 回 Phase 2 重新确认；4–5 停止实施并进入 Deep Discuss。
- 本次遥测：计划任务 5 项；治理文件与任务元数据已完成；创建 2 个 Milestone、9 个 Issue、1 个 Project；完成 Project 字段映射；未创建 PR；未 commit/push/deploy。

## 历史边界

- `work/completed/`：历史记录，按旧流程完成；不补造 GitHub Issue/PR，不重写结论。
- `archive/`：只读历史；不批量迁移。新的流程只通过本索引和本迁移说明建立关系。
- 缺失的活动多语言任务不伪造；如需继续，按新流程创建新的规格和 Issue，并在此记录来源。

## 验证与未验证

已验证：入口文件和现行技能可读取；active/queued 文件存在；目标仓库、默认分支、账户和仓库权限；Milestone #1/#2 与 Issue #1–#9 已创建并映射；Project #1 已创建、字段已配置、Issue 1–9 已加入并写入阶段/优先级/泳道/批次/状态；本地分支和既有工作树状态。

未验证/WARN：worktree 并行互斥；PR 自动关联；归档脚本；完整 Markdown 链接检查尚未执行。

## 归档链接

- 流程正本：`SKILLS/spec-driven-development/SKILL.md`
- Deep Discuss：`SKILLS/deep-discuss/SKILL.md`
- Review SPD：`SKILLS/review-spd/SKILL.md`
- 模板：`docs/progress/templates/`
- 项目适配层：`SKILLS/fenghuai-engineering-workflow/SKILL.md`
