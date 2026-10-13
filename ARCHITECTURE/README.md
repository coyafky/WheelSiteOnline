# 架构文档导航

更新：2026-10-14。系统形状唯一正本是根目录 [`ARCHITECTURE.md`](../ARCHITECTURE.md)；本目录仅作为阅读导航，不再维护一份平行的分模块架构。项目文档统一导航见 [`DOCUMENTATION.md`](../DOCUMENTATION.md)。

## 按问题阅读

| 问题 | 阅读入口 |
|---|---|
| 项目服务谁、做什么？ | [`PROJECT.md`](../PROJECT.md) |
| 当前实现、阻断和下一步？ | [`STATUS.md`](../STATUS.md) |
| 模块边界、依赖、数据流？ | [`ARCHITECTURE.md`](../ARCHITECTURE.md) |
| 页面内容、媒体和验收标准？ | [`PAGE-SPECS/`](../PAGE-SPECS/README.md) |
| WordPress、询盘、数据、部署专题？ | [`docs/`](../docs/) 与 [`outputs/site-launch-plan/`](../outputs/site-launch-plan/README.md) |
| 为什么采用某种系统设计？ | [`docs/adr/`](../docs/adr/)；流程取舍见 [`DECISIONS.md`](../DECISIONS.md) |

## 阅读原则

架构中的状态需区分“已实现、已设计、待确认”。客户端或接口存在不代表真实服务已接通；有图片不代表获得发布授权；预发布验证不代表正式商用批准。架构事实变更时更新总纲，并为真实、持久的技术取舍增加 ADR；进度只更新 `STATUS.md`，不要在架构文档里重复流水账。

## 历史

被替代的旧结构和当时的页面架构保存在 [`archive/2026-10-01-document-baseline/`](../archive/2026-10-01-document-baseline/README.md)。归档内容用于追溯，不作为当前范围或技术事实。
