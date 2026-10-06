# 2N Forged N-501RS 轮毂详情页参考记录

- 参考页面：<https://2nforged.com/wheel-products/n-501rs/>
- 调研日期：2026-10-04
- 用途：为峰徊 `/products/wheels/[model]` 建立详情页结构参考
- 边界：只参考信息架构、版式层级和询盘路径；不复制竞品品牌、型号、图片、文案、规格或表面处理样品

## 1. 本地证据

- [桌面首屏](../screenshots/2n-n501rs-1440x1200.png)：1440×1200
- [移动首屏](../screenshots/2n-n501rs-390x844.png)：390×844
- [桌面长页](../screenshots/2n-n501rs-full-1440.png)：1440×5000
- [移动长页](../screenshots/2n-n501rs-full-390.png)：390×5000

目标站直接自动访问受到 CDN 检查限制。以上截图由目标页公开 HTML、公开样式和公开图片通过只读代理重建，用于内部版式研究；截图和竞品图片不进入峰徊公开站点。

## 2. 页面实际结构

### 2.1 首屏

1. 顶部是全站导航和 `Home > Products > N-501RS` 面包屑。
2. 左栏以一张大轮毂图为视觉主体，下方有三张缩略图切换角度。
3. 右栏依次是型号、设计口号、描述、产品分类和 `Customize This Wheel` 配置表单。
4. 配置表单包含直径、期望宽度、期望偏距、补充信息、finish 单选、Email、WhatsApp 和 `Request Quote`。
5. 产品图、产品身份、配置输入和询盘按钮在桌面首屏内完成闭环。

### 2.2 下半页

1. `Wheel Finish Options` 先解释 Solid / Brushed 两类处理。
2. 再用 12 张中心盖照片展示 Gloss Black、Satin Black、Bronze、Gunmetal、Silver、White、Brushed Clear/Smoke 等样品。
3. 页尾显示三个同类轮毂设计卡片。
4. 页面没有可核对的逐项 PCD、ET、CB 变体表；其输入更接近“定制需求收集”，不是库存或生产记录查询。

## 3. 值得借鉴

- 产品优先：进入详情后先看轮毂本体，制造故事不抢产品首屏。
- 首屏闭环：型号、图片、简短说明、配置和询盘在同一上下文中。
- 双栏层级清楚：左侧看产品，右侧作选择；移动端按图片 → 型号 → 配置顺序自然堆叠。
- finish 解释与产品选择分层：首屏只做选择，下方再解释不同处理方向。
- 相关产品紧接详情末尾，方便继续浏览而不打断询盘。

## 4. 峰徊不能照搬的部分

| 竞品内容 | 峰徊处理 | 原因 |
|---|---|---|
| 三图图库与缩略图 | 固定单张批准主图 | 1073 个有图候选中图片数量不一致；DEC-014 已确定单图详情模板 |
| `16–26 inch available` | 只显示该型号批准变体中的实际尺寸 | 峰徊当前源数据范围和每个型号都不同 |
| 自由输入 Width / Offset | 先选择真实 `productionCode`，需要特殊规格时再填备注 | 自由拼接会产生不存在的生产组合 |
| Custom PCD / CB 承诺 | 展示批准变体；定制能力另行工程评审 | 不能把任意参数写成已支持 |
| finish 圆点与中心盖样品 | 首发显示批准 finish 文本；有实物图后才展示图片 | 当前有 531 种未归一化中文 finish，且没有逐项样品图 |
| 车型与风格营销段落 | 使用型号事实说明与适配边界 | `vehicleHints` 不是适配证据，`styleName` 可能含第三方商标 |
| Email + WhatsApp 简化表单 | 复用站内询盘 API 和统一隐私同意 | 避免形成第二套收件、验证和隐私流程 |
| 同类设计 | 只推荐完整批准且有共同真实字段的型号 | 不用人工风格标签或第三方款式名制造关联 |

## 5. 与峰徊真实数据的映射

| 详情页字段 | 峰徊来源 | 公开条件 |
|---|---|---|
| 型号 | `WheelModel.model` | 型号整体通过发布审核 |
| 主图 | `WheelModel.images[0]` | 图权与主图批准；自然排序第一张 |
| 工艺 | `WheelModel.process` | 有公开英文映射；未知不推断 |
| 配置 | `WheelModel.variants[]` | 只显示 `approvedVariantCodes` 中的记录 |
| 尺寸 | `WheelVariant.size` | 保持同一 variant |
| PCD | 人工批准的 `normalizedPcdByVariant` | 原始异常值修正前不公开 |
| ET | `WheelVariant.offset` | 同一 variant 的实际数值 |
| CB | `WheelVariant.centerBore` | 同一 variant 的实际数值 |
| Finish | `WheelVariant.finish` + 公开映射 | 英文化映射批准后显示 |
| 相关型号 | 公开目录索引 | 有共同直径/PCD/工艺，且同样通过发布门槛 |

完整实施规则见 [轮毂详情页 Page SPEC](../../PAGE-SPECS/wheel-detail.md)。
