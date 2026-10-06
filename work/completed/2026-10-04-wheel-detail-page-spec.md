# 轮毂详情页 Page SPEC

- 状态：已完成
- 日期：2026-10-04
- 范围：2N N-501RS 参考抓取、现有详情实现审计与 `/products/wheels/[model]` 施工规格；未实现页面代码

## 结果

- 保存 2N N-501RS 的桌面/移动首屏和长页内部研究快照。
- 拆解左图右信息首屏、配置询盘、finish 解释、finish 样品和相关产品模块。
- 建立 `PAGE-SPECS/wheel-detail.md`，将页面拆为 WD01–WD06。
- 延续 DEC-014 单图规则，不照搬三图缩略图库。
- 规定逐条批准 `WheelVariant` 选择，尺寸、PCD、ET、CB 和 finish 不得跨记录拼接。
- 规定详情页询盘复用统一 API，服务端重新验证 productionCode 并保存规格快照。
- 定义 finish 发布门槛、适配边界、相关型号算法、双端布局、SEO 和结构化数据。
- 列出现有虚构 `WheelSku`、`WheelSketch`、finish 色块和 applications 的替换要求。
- 同步首发正本、页面索引、文档导航、资源索引、状态和 DEC-036。

## 未执行

未修改 React 页面、内容类型、WordPress 发布记录、询盘接口、sitemap 或原始资产；未发布任何型号、finish、车型适配、价格、库存或交期。
