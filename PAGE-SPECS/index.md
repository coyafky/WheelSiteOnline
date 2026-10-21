# 页面规格索引

更新：2026-10-16。这里的“已实现”只表示页面代码、内容接缝和已有本地验收已落地，不等于可以正式发布；图权、主体、规格、法律、索引和生产运行时门槛仍以 [`STATUS.md`](../STATUS.md) 与各页规格为准。

| 版本 | 文件 | 状态 | 用途 |
|---|---|---|---|
| 2026-10-04 | [英文首发逐页逐视口施工规格](2026-10-04-launch-viewport-spec.md) | 现行正本 | 当前开发、内容制作与验收 |
| 2026-10-11 | [Astryx Neutral 暖白界面规格](astryx-neutral-global.md) | 已完成本地回归，商用发布受阻断 | 全站色彩、字体、原语与可访问状态；不改变内容证据门槛 |
| 2026-10-11 | [Astryx Neutral 页面族映射](astryx-neutral-page-families.md) | 已完成本地回归，商用发布受阻断 | 各路由族的组件与验收映射 |
| 2026-10-05 | [首页](homepage.md) | 已实现 | `/` 的四线公司定位、制造能力、主体边界、项目路径、SEO 与询盘 |
| 2026-10-05 | [About：轮毂制造基地模块](about-wheel-factory.md) | 已实现 | `/about#wheel-manufacturing` 的内容、WP 媒体和双端布局 |
| 2026-10-05 | [Capabilities：轮毂制造与质量能力](capabilities-wheel-manufacturing.md) | 已实现 | `/capabilities#wheel-manufacturing` 的设计、路线、检查、验证和文件证据 |
| 2026-10-04 | [锻造轮毂高端定制](forged-wheel-customization.md) | 已实现，WF05 隐藏 | `/products/wheels/forged` 的材料、制造、案例门槛和询盘输入 |
| 2026-10-04 | [自密封轮胎](self-sealing-tires.md) | 本地三张机制 WebP 已替换并通过桌面/移动回归；本地 WordPress live 权威同步待 Docker 恢复后复验，P0 暂不关闭 | `/products/safety-tires` 的道路痛点、机理、8 mm 条件、证据和询盘 |
| 2026-10-05 | [About：自密封轮胎制造基地](about-self-sealing-tire-factory.md) | 已实现 | `/about#tire-manufacturing` 的生产环境、主体边界和证据清单 |
| 2026-10-04 | [轮毂产品目录](wheel-catalog.md) | 已实现，移动两列/筛选抽屉专项验收 14/14 通过 | `/products/wheels` 的真实数据筛选、产品卡、分页、SEO 与询盘；当前读批准型号集合 |
| 2026-10-04 | [轮毂详情页](wheel-detail.md) | 已实现，暖白视觉本地回归完成 | `/products/wheels/[model]` 的单图、真实变体、直接询盘 Dialog、finish、SEO 与相关型号 |
| 2026-10-05 | [旋压轮毂入口](flow-formed-wheels.md) | 已实现，移动两列/24 张分页专项验收通过 | `/products/wheels/flow-formed` 的工艺边界、批准型号集合、目录复用、SEO 与询盘 |
| 2026-10-05 | [新能源三电铝制品](ev-components.md) | 已实现，运营元数据待补 | `/products/ev-components` 的三类壳体、工程问题、工艺证据、询盘与媒体边界 |
| 2026-10-05 | [定制铝制品](custom-aluminum.md) | 已实现，保持 noindex | `/products/custom-aluminum` 的来图来样评估、应用范围、工程方法、开发阶段和发布门槛 |
| 2026-10-05 | [项目询盘页](request-a-quote.md) | 已实现，预发布持久化与 SMTP 已验收；生产环境仍待验收 | 四线两步表单、持久化契约、直接/清单询盘隔离；生产邮件投递、限流、法律文本和 UAT 仍单独验收 |
| 2026-10-01 | [旧版按路由施工图](../archive/2026-10-01-document-baseline/PAGE-SPECS/index.md) | 已归档 | 历史追溯与组件参考 |

内容与发布门槛冲突时，以 2026-10-04 正本、`PROJECT.md` 和 `STATUS.md` 为准；跨页视觉以 2026-10-11 暖白界面规格为准。
