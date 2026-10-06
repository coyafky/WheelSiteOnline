# 架构与 README 校准

- 状态：已完成
- 日期：2026-10-05
- 领域：项目架构 / 开发入口

## 目标

把根 README、系统架构正本和架构导航与四条产品线、真实轮毂数据、统一询盘、WordPress 接缝和 OpenNext 目标架构对齐。

## 产出

- `README.md`
- `ARCHITECTURE.md`
- `ARCHITECTURE/README.md`
- `outputs/architecture-alignment-audit.md`
- `DEC-042` 与 `STATUS.md` 同步更新

## 关键结果

1. 文档统一使用“已实现 / 已设计 / 待确认”状态，目标能力不再冒充现成功能。
2. 架构正本覆盖内容、证据、发布集合、页面、询盘、运行时和运维完整数据流。
3. README 不再描述纯轮毂 B2B、16 个示例 SKU、全部静态或没有询盘后端。
4. 当前内存询盘、未接线 WordPress、未配置 OpenNext、旧路由和模板 Docker/包元数据均诚实列为差距。

## 验收

- Markdown 本地链接检查通过。
- 关键事实与当前代码、DEC-023～DEC-041 和现行 Page SPEC 对齐。
- `git diff --check` 通过。
- 本次没有修改应用代码，因此不重复运行应用 lint/typecheck/build。
