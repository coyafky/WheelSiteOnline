# 归档：V3.0 重构前的文档基线（2026-10-17）

**归档原因**：项目按《Next.js + Headless WordPress 企业级架构设计 V3.0》重构文档体系，
原有文档的「正本」地位全部让位给 `docs/audit/` 与 `docs/architecture/`。

**本目录内容不指导当前实现**，仅供追溯原因。

---

## 旧正本 → 新正本 对照

| 归档文件 | 原地位 | 现被谁取代 | 处置理由 |
|---|---|---|---|
| `ARCHITECTURE.md`（26KB） | 系统结构正本 | [`docs/audit/CURRENT_ARCHITECTURE.md`](../../docs/audit/CURRENT_ARCHITECTURE.md) + [`docs/architecture/TARGET_ARCHITECTURE.md`](../../docs/architecture/TARGET_ARCHITECTURE.md) | 旧文混写「现状/目标/待确认」，无法直接作为审计基线；新文档拆分并全部带文件级证据 |
| `DECISIONS.md`（207KB） | 流程决定正本 | 【待拆分】见下方「遗留问题」 | 体积过大且每次全量注入，需按 DEC-xxx 拆分；新决策暂记 `docs/architecture/` 各页的 ADR 表 |
| `STATUS.md`（12KB） | 当前状态正本 | [`docs/implementation/ROADMAP.md`](../../docs/implementation/ROADMAP.md) | 状态改为按 Task 追踪，见 `TASKS.md` |
| `PROJECT.md`（5KB） | 项目目标与范围 | [`docs/architecture/TARGET_ARCHITECTURE.md`](../../docs/architecture/TARGET_ARCHITECTURE.md) | 业务边界内容并入目标架构的「原则」与「不做清单」 |
| `DOCUMENTATION.md`（9KB） | 唯一文档地图 | [`docs/README.md`](../../docs/README.md)（新建） | 地图重写以匹配 V3.0 目录树 |
| `CHANGELOG.md`（15KB） | 变更流水 | 不再维护独立 CHANGELOG | git log + `work/completed/` 已足够 |
| `AGENT-OPERATING-GUIDE.md`（17KB） | Agent 操作提示词 | 【待并入】`AGENTS.md` | 与 `AGENTS.md` 职责重叠，需合并后删除 |
| `DESIGN.md`（4.5KB） | 视觉正本 | 【待确认】设计令牌仍在 `src/theme/` | 内容与 `src/theme/fenghuai-neutral/` 重复，需确认是否需要独立文档 |

## 归档的 docs/ 子目录

| 归档路径 | 内容 | 归档理由 |
|---|---|---|
| `docs/competitor-next-wordpress-analysis.md` | 竞品 Next+WP 分析 | 已被 V3.0 目标架构取代 |
| `docs/BLANK-PAGE-AUDIT.md` | 空白页审计 | 一次性审计结论，已过期 |
| `docs/rebuild/` | 重建删除清单 | 那次重建已完成 |
| `docs/plans/` | 询盘系统架构方案 | 已被实际实现取代（M10 审计已还原真实实现） |
| `docs/superpowers/` | 两份实施计划 | 已执行完毕 |
| `docs/research/next-wp/` | 4 篇 Next+WP 教程笔记 | 已被 V3.0 与本项目实测取代 |
| `docs/research/tbr8-headless-wordpress-tutorial.md` | 外部教程 | 学习材料，非项目事实 |
| `docs/research/2nforged-reference.md` | 竞品参考 | 参考材料 |

---

## 未归档、仍保留在原位的文档

| 保留项 | 位置 | 理由 |
|---|---|---|
| `AGENTS.md` | 仓库根 | Agent 规则源，仍在用 |
| `CLAUDE.md` | 仓库根 | Claude Code 入口，仍在用 |
| `README.md` | 仓库根 | 已重写为指向新文档树 |
| `PAGE-SPECS/` | 仓库根 | 页面施工规格，仍是有效正本 |
| `docs/adr/` | 3 份 | 架构决策记录，沿用 |
| `docs/research/keyword-research-b2b-en.md`、`关键词调研报告-峰徊四线.md` | docs/research/ | SEO 实证数据，仍是有效输入 |
| `docs/research/seo-knowledge-base/` | docs/research/ | 产品与行业知识库，仍是有效输入 |

---

## 遗留问题（本次未处理）

1. **`DECISIONS.md` 207KB 未拆分** —— 需按编号切成 `docs/adr/` 条目或索引页。风险：新决策与旧决策可能冲突且无人发现。
2. **`AGENT-OPERATING-GUIDE.md` 与 `AGENTS.md` 职责重叠** —— 需合并，但合并涉及 Agent 工作流变更，需单独确认。
3. **`DESIGN.md` 是否需要独立存在** —— 设计令牌已在 `src/theme/`，文档可能冗余。
4. **`work/` 目录 132 个任务卡** —— 未整理；V3.0 的 `docs/implementation/` 是新的任务追踪处，旧任务卡保留为历史。

---

## 恢复方式

归档前的完整备份：
`~/.config/alma/backups/wordpresswheelsite-docs-pre-v3-20261017-154340.tar.gz`（3.5MB，389 个条目）

恢复单个文件：
```bash
tar xzf ~/.config/alma/backups/wordpresswheelsite-docs-pre-v3-20261017-154340.tar.gz -C /tmp ARCHITECTURE.md
cp /tmp/ARCHITECTURE.md ./ARCHITECTURE.md
```

全部恢复（**会覆盖新文档**，不建议）：
```bash
tar xzf ~/.config/alma/backups/wordpresswheelsite-docs-pre-v3-20261017-154340.tar.gz -C .
```
