# 文档目录与 Agent 工作流整理

- **状态**：已完成
- **创建日期**：2026-10-13
- **完成日期**：2026-10-14
- **领域**：项目工程流程与文档治理

## 目标

根据用户提供的 AI 开发流程图、文章和 [Spec-Driven Develop 中文规范](https://github.com/zhu1090093659/spec_driven_develop/blob/main/README.zh-CN.md)，压缩重复文档导航，清楚区分正本、任务、交付证据、来源资料和历史文件；为 Claude Code 补齐现行目录地图，并让工作流按风险和复杂度启用。

## 执行结果

- 重写根 `README.md` 为轻量项目入口；重写 `CLAUDE.md` 为 Claude Code 目录导航与轻量工作流入口，保留 `@AGENTS.md` 作为项目规则来源。
- 重整 `DOCUMENTATION.md` 为唯一文档地图；更新 `PROJECT.md` 执行入口，以及 `resources/README.md`、`outputs/README.md`、`work/README.md`，厘清来源、交付证据与任务生命周期。
- 将原来 1,385 行、混合当前状态和逐日历史的 `STATUS.md` 压缩为当前快照；旧内容原样移至 `archive/status-history/`，并声明 Agent 默认无需加载历史。
- 重写 `SKILLS/README.md`，将项目内技能映射到需求/方案、视觉设计、实现、验证、审查和交付步骤，并标明仅按需使用的条件。
- 将 `DECISIONS.md` 说明为历史取舍库，避免它被当作当前状态或每次任务的必读规则清单。
- 将用户提供的两张图和文章原文归档至 `resources/references/ai-development-workflow/`，标明其仅作方法参考。
- 将项目工程工作流改为按复杂度选择步骤，并调整 AGENTS 与 DESIGN 中过度固定的过程描述；保留真实产品、证据、发布和外部动作门槛。
- 修正 AGENTS 中过时的不存在目录引用和“项目没有真实照片”说明。
- 缩短 AGENTS 中重复的产品计数与规则描述；把旧克隆模板说明移至 `archive/`，不再作为当前约束。
- 将正文已标注完成、却仍在 `work/active/` 的盘点/任务移至 `work/completed/`，另将已明确阻塞或等待决定的工作移至 `work/queued/`，不再将其列为正在进行。
- 清理被 `.gitignore` 忽略的 Playwright 生成目录 `test-results/`（39 MB）和 `playwright-report/`（1 MB）；其余浏览器工作目录、已归档报告与证据截图保留。
- 在 `DECISIONS.md` 新增 DEC-101，记录流程调整与正本归属。
- 将 `DESIGN.md` 收窄为视觉正本，只保留主题、令牌、字体、层级、组件外观、响应式、动效和可读性；项目范围归 `PROJECT.md`，系统职责归 `ARCHITECTURE.md`，逐页内容与验收归 `PAGE-SPECS/`。
- 将分类已完成的 locale 页面盘点移入 `work/completed/`；把等待用户拍板的 Plan A 和等待业务/工程资料的产品图片核验移入 `work/queued/`；将被 Plan A 替代的旧计划移入 `archive/superseded-work-plans/`，并修正受影响任务的链接。
- 在 `STATUS.md` 增加当前两项队列等待事项；更新 `work/README.md`，避免任务目录和状态快照出现不同解释。

## 验收

- 检查所有新增长的本地 Markdown 链接都能解析。
- 检查本次改动的 Markdown 空白与补丁格式。
- 确认临时 Playwright 报告目录已移除。
- 未运行应用测试；本任务没有修改应用代码。

## 未解决问题

- Plan A 范围确认和首发产品图片可信度核验仍等待外部输入，分别列在 `work/queued/` 并由 `STATUS.md` 显示；输入到位后再转入 active。
- 历史日期报告和截图保留作证据；后续按 `outputs/README.md` 的规则在每次收尾时清理临时 runner 输出，不批量删除无法证明为冗余的报告。
