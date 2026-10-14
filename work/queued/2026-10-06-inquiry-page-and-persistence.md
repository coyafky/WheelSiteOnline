# 四线询盘页与生产持久化

## Spec-Driven 元数据

- **Phase**：3
- **Milestone**：待创建/映射
- **GitHub Issue**：[#2](https://github.com/coyafky/WheelSiteOnline/issues/2)
- **Delivery Batch**：询盘闭环批次，待拆分
- **依赖**：正式隐私文本、销售邮箱/电话、WordPress 生产边界
- **S.U.P.E.R 关注**：Ports over Implementation（表单与存储/邮件适配器解耦）；Unidirectional Flow（客户端体验→服务端真相→持久化→邮件事件）
- **验证命令**：`npm test`、`npm run lint`、`npm run typecheck`、`npm run build`、API 集成与故障路径检查
- **漂移规则**：契约、权限或隐私边界变化时回 Phase 2

- 状态：待执行
- 创建日期：2026-10-06
- 来源：当前实现状态审计

## 目标

按 QF01–QF03 把轮毂长表单改为四条产品线共用的两步短表单，并用持久化事务、
幂等键与独立邮件事件替换进程内 `Map` 和单一 `delivered` 布尔值。

## 已知问题

- 当前表单强制车型、轮毂系列和数量，不适合三电、定制铝件和轮胎项目。
- `family` 在客户端校验和成功摘要中出现，但未进入 API payload。
- 内存记录重启即丢；邮件 accepted 被直接视为 delivered。
- 正式隐私文本、销售邮箱、电话和直接联系兜底尚未确认。

## 验收

- 每步必填不超过 3 项，并按产品线显示条件字段与准备提示。
- 客户类型、产品线、来源上下文、同意记录和快照全部服务端校验并事务保存。
- 重复提交不会生成两条询盘；邮件失败不丢询盘，也不显示假成功。
- `/contact` 与 `/request-a-quote` 共用同一契约和状态。
- lint、typecheck、build、API 集成测试与故障路径检查全绿。
