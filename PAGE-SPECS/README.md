# 页面规格

本目录只保存当前有效的页面施工规格。

## 现行正本

[2026-10-04 英文首发逐页逐视口施工规格](2026-10-04-launch-viewport-spec.md) 是当前唯一执行依据，覆盖四条产品线、B/C 询盘、桌面与移动视口、内容模块、素材来源和验收标准。

已拆出的现行子规格：

- [首页](homepage.md)：2N 首页结构取舍、四条产品线、六项制造能力、制造关系、统一询盘和现有组件替换。
- [About 页：轮毂制造基地模块](about-wheel-factory.md)：厂区、铸造、机加工、涂装四张 WordPress 图片及品牌/法人边界；代码已实现。
- [Capabilities 页：轮毂制造与质量能力](capabilities-wheel-manufacturing.md)：工程设计、成形路线、过程检查、三类试验和文件证据；代码已实现。
- [锻造轮毂高端定制页](forged-wheel-customization.md)：材料与设计、锻造成形、CNC/表面/检查、受控案例和询盘输入；代码已实现，WF05 因证据不足隐藏。
- [自密封轮胎页](self-sealing-tires.md)：道路痛点、自密封机理、8 mm 内部测试条件、证据边界和双客户询盘。
- [About 页：自密封轮胎制造基地模块](about-self-sealing-tire-factory.md)：七张生产环境图、制造归属边界和证据核验；代码已实现。
- [轮毂产品目录](wheel-catalog.md)：Vossen 模块取舍、真实型号/变体筛选、产品卡、分页和发布门槛。
- [轮毂详情页](wheel-detail.md)：2N 单品页结构取舍、单图首屏、真实变体、嵌入式询盘、finish 和相关型号。
- [旋压轮毂入口](flow-formed-wheels.md)：旋压/低压+旋压工艺边界、真实型号集合、WP 116、目录复用和变体询盘。
- [新能源三电铝制品](ev-components.md)：三类有图壳体、冷却/密封/接口工程问题、制造路线证据和工程询盘。
- [定制铝制品](custom-aluminum.md)：来图来样评估、四类应用范围、工程方法示例、开发阶段和 noindex 发布门槛。
- [项目询盘页](request-a-quote.md)：参考 2N 的低门槛节奏，重构为四线/B-C 分流、两步短表单、产品上下文快照、事务成功与隐私门槛。

旧版按路由拆分的 2026-10-01 规格已归档到
[archive/2026-10-01-document-baseline/PAGE-SPECS/](../archive/2026-10-01-document-baseline/PAGE-SPECS/README.md)。旧版可帮助理解组件与设计演变，但不得覆盖现行首发范围。

新增或修改页面时，优先更新现行正本。只有当单文件已经影响实施效率时，才按现行页面架构拆分成多个文件，并同步更新本索引、`DOCUMENTATION.md` 和 `STATUS.md`。
