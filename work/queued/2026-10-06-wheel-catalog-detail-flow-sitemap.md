# 轮毂目录、详情、旋压与 sitemap 统一改造

## Spec-Driven 元数据

- **Phase**：3
- **Milestone**：待创建/映射
- **GitHub Issue**：[#3](https://github.com/coyafky/WheelSiteOnline/issues/3)
- **Delivery Batch**：轮毂公开集合批次，按目录/详情/旋压/sitemap 拆分
- **依赖**：公开资格、重复型号处理和架构决定
- **S.U.P.E.R 关注**：Single Purpose（统一公开集合）；Unidirectional Flow（事实→批准集合→页面/询盘/sitemap）；Replaceable Parts（静态快照与 WordPress 适配器）
- **验证命令**：`npm run lint`、`npm run typecheck`、`npm run build`、路由/页面验收、`git diff --check`
- **漂移规则**：公开资格或规格契约变化时 drift ≥ 3，回 Phase 2

- 状态：待执行
- 创建日期：2026-10-06
- 来源：当前实现状态审计
- 架构讨论稿：`outputs/designs/wheel-publication-architecture-2026-10-06.md`

## 目标

让 `/products/wheels`、`/products/wheels/[model]`、
`/products/wheels/flow-formed` 与 sitemap 共用同一个批准公开集合，移除 16 个
虚构 SKU 和由它们生成的 URL。

## 施工顺序

1. 建立真实目录的批准覆盖层，严格执行无图不上架、未确认不上架。
   开工前先按讨论稿处理 108 组重复型号、77 组重复 productionCode 与稳定公开 slug，
   并把确认结果写入 `ARCHITECTURE.md` 和 `DECISIONS.md`。
2. 按 W01–W03 改造目录，并形成可复用的筛选、分页和产品卡。
3. 按 WD01–WD06 改造详情，只允许选择同一实际 variant，不跨行拼规格。
4. 复用目录组件实现 WFF01–WFF05，只纳入批准的 `旋压` 与 `低压+旋压` 型号。
5. sitemap 改用同一公开集合，删除所有虚构详情 URL。

## 验收

- 三个路由按 Page SPEC 通过桌面、移动、无 JS、键盘与 200% 检查。
- 无图或未批准型号不会进入目录、详情、筛选、相关型号与 sitemap。
- 询盘携带真实 model、productionCode 和完整 variant 快照。
- lint、typecheck、build 与 `git diff --check` 全绿。
