# 开发依赖高危公告核验与升级

## Spec-Driven 元数据

- **Phase**：3
- **Milestone**：待创建/映射
- **GitHub Issue**：[#6](https://github.com/coyafky/WheelSiteOnline/issues/6)
- **Delivery Batch**：依赖安全批次
- **依赖**：上游兼容版本、lockfile 变更和完整回归环境
- **S.U.P.E.R 关注**：Replaceable Parts（避免不必要的直接依赖升级）；Environment-Agnostic（生产依赖与开发依赖分层）
- **验证命令**：`npm audit --audit-level=high`、`npm run lint`、`npm run typecheck`、`npm test`、Playwright、`npm run build`
- **漂移规则**：需要 `--force`、改变生产依赖或无法证明兼容时回 Phase 2

- **状态**：排队中
- **日期**：2026-10-09
- **来源**：远端部署收尾时执行完整 `npm audit`

## 问题

生产依赖审计 `npm audit --omit=dev` 为 0 漏洞，但完整依赖树报告 9 个 high，根因是
`braces` 的深层模式匹配栈耗尽公告，经 `micromatch`、`fast-glob` 进入 Next ESLint、
shadcn registry 与 ts-morph 等开发工具链。

自动建议的 `npm audit fix --force` 会把 `shadcn` 切换为不兼容版本，不能在没有回归验证
的情况下直接执行；当前运行镜像只安装 `--omit=dev`，因此没有把该依赖链带入生产容器。

## 验收标准

- [ ] 核对上游包是否已有兼容修复版本或可安全使用的 overrides。
- [ ] 不使用未经评审的 `npm audit fix --force`，记录每个直接依赖的升级影响。
- [ ] 升级后完整 `npm audit --audit-level=high` 为 0，或逐项记录无法消除的原因与隔离措施。
- [ ] lint、typecheck、单元测试、Playwright 与 production build 全绿。
