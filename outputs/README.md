# 可交付成果与验收证据

`outputs/` 保存可以交付、审核或复核的成果。每项成果应能说明服务对象、日期/版本、范围和结论，并链接回现行规格或任务。

## 目录归属

| 路径 | 内容 |
|---|---|
| `reports/` | 商业、内容、SEO、实现审计与验收报告；报告是证据，不是当前状态正本 |
| `site-launch-plan/` | 项目启动范围、内容/询盘数据方案和相关任务卡；若与现行计划冲突，按 `STATUS.md` 与当前任务判断 |
| `designs/` | 可评审的设计或技术方案 |
| `exports/` | 从只读数据源生成、供审核使用的导出清单 |
| `*-review/`、`architecture-diagrams/` | 被报告引用的选定截图和图示证据 |
| `hangpeng-wheel-media/` | 经来源追溯的候选素材浏览交付物；候选不代表已批准发布 |
| `templates/` | 可复用交付模板；模板不等于已审核的法律正文 |

## 验收记录整理

- 保留最终报告和能证明关键结论的截图；重复视口、逐次调试截图和原始 runner 输出优先放在本机临时目录。
- 每个新审计应关联任务、标明实际执行的检查、环境/版本和未覆盖边界，并同步 `STATUS.md`。
- 日期化报告保留其历史结论，不得把旧验收误当成当前状态；被替代的方案或长篇中间记录归档并链接至替代结论。
- 不为“测试通过”创建独立流水账；测试框架的 `test-results/`、`playwright-report/` 等生成目录不是项目文档。

## 现有入口

- [`site-launch-plan/README.md`](site-launch-plan/README.md)：首发范围、排期和验证框架。
- [`architecture-alignment-audit.md`](architecture-alignment-audit.md)：架构与代码的一次性差异核验。
- [`reports/`](reports/)：按日期追溯审计与验收结果。
- [`page-spec-agent-prompts/README.md`](page-spec-agent-prompts/README.md)：仍需按 Page SPEC 执行时可复用的提示模板。

当前进度以根目录 `STATUS.md` 为准，施工规格以 `PAGE-SPECS/` 为准，系统边界以 `ARCHITECTURE.md` 为准。
