# WordPress 内容适配器扩展：旧队列快照

来源：合并前 `origin/main` 的 `work/queued/2026-10-09-wordpress-content-adapter-expansion.md`。该队列卡已在后续全站改造分支退出当前任务目录；保留此快照供追溯。现行状态以 [任务正本](../docs/implementation/TASKS.md) 为准。

# WordPress 内容适配器扩展

## Spec-Driven 元数据

- **Phase**：3
- **Milestone**：待创建/映射
- **GitHub Issue**：[#9](https://github.com/coyafky/WheelSiteOnline/issues/9)
- **Delivery Batch**：CMS 内容接缝批次，按页面族拆分
- **依赖**：Insights 稳定契约、`src/content/types.ts`、发布/撤回/缓存失效规则
- **S.U.P.E.R 关注**：Ports over Implementation（组件只消费稳定视图模型）；Unidirectional Flow（CMS 原始响应→适配器→内容契约→组件）；Replaceable Parts（CMS 不可用回退）
- **验证命令**：字段完整性、回退、撤回、预览、缓存失效测试，另跑 `npm run lint`、`npm run typecheck`、`npm run build`
- **漂移规则**：修改内容契约或 WordPress 职责时先更新架构/决定并回 Phase 2

- 日期：2026-10-09
- 状态：queued
- 前置：Insights `fh_guide` 稳定契约已完成（DEC-065）

## 目标

沿用 Insights 已验证的模式，把首页、公司、能力与四条产品线的文案、SEO 和发布状态逐个
迁入 WordPress，同时保持页面组件只消费 `src/content/types.ts` 定义的稳定视图模型。

## 切片顺序

1. 首页与公司级 SEO；
2. 四条产品线能力页；
3. 询盘入口文案与政策版本；
4. 发布/撤回/预览/缓存失效的跨页面一致性；
5. sitemap 只消费相同发布事实。

每个切片必须有字段完整性 fail-closed、CMS 不可用回退、撤回、预览和缓存失效测试，
不得创建第二套组件专用类型。
