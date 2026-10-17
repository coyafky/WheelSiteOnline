# 轮毂详情页 Page SPEC

- 路由：`/products/wheels/[model]`
- 页面类型：真实轮毂型号、实际变体选择与询盘
- 视口：WD01–WD06
- 状态：**已实现**（2026-10-09，DEC-053、DEC-069）。WD01–WD06 已落地；路由由 `[sku]` 改为 `[model]`；`generateStaticParams`、详情、询盘复核和 sitemap 共用 WordPress live/静态兜底集合；签名 webhook 的发布、修改、撤回和删除已用临时 FH-002 验收；四视口运行时验收全绿。
- 公开语言：英文优先
- 结构参考：[2N Forged N-501RS](https://2nforged.com/wheel-products/n-501rs/)；只借鉴产品首屏、配置询盘、finish 解释和相关产品结构
- 数据来源：WordPress `/fh/v1/wheels` 可编辑规格/媒体正本；静态目录与批准快照作故障兜底
- 上架规则：复用 [轮毂产品目录 Page SPEC](wheel-catalog.md) 的完整发布资格；目录、详情、询盘和 sitemap 必须使用同一公开集合

## 1. 页面目标与叙事

页面要让客户确认“这是哪个真实型号、有哪些真实生产配置、我选中的到底是哪一条”，然后把型号和配置完整带入询盘。页面不承担车型适配保证、在线定价或任意规格配置器职责。

| 视口 | 客户问题 | 主信息 | 主视觉/交互 | 主行动 |
|---|---|---|---|---|
| WD01 | 这是什么型号 | 面包屑、真实型号、批准主图、已记录工艺和简短事实说明 | 单张产品主图 + 型号信息 | 浏览配置 |
| WD02 | 有哪些真实配置 | 每一条批准 variant 的生产代码、尺寸、PCD、ET、CB、finish | 桌面表格 / 移动配置卡 | 选择一个配置 |
| WD03 | 怎样询问这个型号 | 已选配置摘要、加入总询盘与当前产品直接询盘 | 双路径 CTA + 当前页弹窗 | `Request this configuration` |
| WD04 | 有哪些表面处理 | 仅列本型号已批准变体中的公开 finish；说明实际颜色需样品确认 | 文本卡；有批准实物图后才显示图 | 把 finish 带入询盘 |
| WD05 | 这个型号是否适配我的车 | 生产规格与车型适配的区别、工程还需要哪些输入 | 适配核对清单 | 提交车型/应用信息 |
| WD06 | 还可比较哪些型号 | 最多三个完整批准、字段相关的真实型号 | 复用目录产品卡 | 查看另一个型号 |

## 2. 2N 页面模块的取舍

### 2.1 借鉴

- 桌面首屏采用左产品、右信息和询盘的双栏结构。
- 产品编号是页面最强标题，图片承担主要视觉，不用大段品牌 Hero。
- 客户在查看型号时即可进入询盘，不必返回 Contact 页面重新说明产品。
- finish 说明放在首屏之后，相关型号放在页面末尾。
- 移动端按产品图 → 型号 → 配置 → 询盘顺序堆叠。

### 2.2 按峰徊事实重构

| 2N 模块 | 峰徊替代 | 验收边界 |
|---|---|---|
| 三图图库 | 一张批准主图 | 延续 DEC-014；不显示只有一张图的伪缩略图条 |
| 自由尺寸/偏距配置 | 实际 variant 单选 | 不允许跨 variant 组合尺寸、PCD、ET、CB 或 finish |
| 16–26 英寸范围 | 当前型号的批准尺寸 | 不使用系列通用范围代替型号记录 |
| finish 色点 | 批准英文 finish 文本 | 映射和实物图未批准时不画推测色板 |
| Email/WhatsApp 独立表单 | 复用统一 `/api/inquiries` 契约 | 同一校验、持久化、邮件、同意与错误处理 |
| 风格/车型营销描述 | 型号事实说明 + 适配边界 | 不公开 `styleName` 商标或 `vehicleHints` 推断 |
| 同类设计 | 真实字段相关型号 | 只从公开集合计算，不手工补虚构卡片 |

不得复制 2N 的 N-501RS 型号、轮毂图片、finish 图片、营销文案、可用尺寸、车型描述、表单字段默认值、徽标或 CSS。

## 3. 页面数据契约

### 3.1 页面资格

只有同时满足以下条件的型号才生成详情：

```text
hasImage = true
AND publicationStatus = approved
AND imageRightsStatus = approved
AND supplyStatus = confirmed
AND specificationStatus = verified
AND 至少一个 variant = approved
```

无图、草稿、撤回、无供货确认、图权未批、规格待审核或没有批准 variant 的型号统一真实 404。不能因为猜中 URL 返回带占位图的 200 页面。

### 3.2 页面视图模型

页面组件只消费适配后的类型，不直接读取供应商 JSON 或 WordPress 原始响应：

```ts
type WheelDetailView = {
  model: string;
  slug: string;
  primaryImage: MediaAsset;
  processLabel?: string;
  approvedVariants: Array<{
    productionCode: string;
    sizeLabel: string;
    pcdLabels: string[];
    offsetMm: number;
    centerBoreMm: number;
    finishLabel: string;
  }>;
  publicFinishes: Array<{
    sourceFinish: string;
    publicNameEn: string;
    sampleImage?: MediaAsset;
  }>;
  relatedModels: WheelCatalogueCard[];
};
```

`WheelDetailView` 是实现建议，不在本次文档任务中修改 `src/content/types.ts`。正式加类型时按内容接缝规则记录 WordPress 契约变化。

### 3.3 事实优先级

1. 规格行唯一事实源是批准的 `WheelVariant`。
2. `WheelModel.sizes/pcds/offsets/centerBores/finishes` 只可生成摘要，不能生成配置行。
3. PCD 使用人工批准的规范值；保留原始值供审计。
4. finish 使用 WordPress 批准的英文公开名；不能直接输出中文原值。
5. `styleName` 和 `vehicleHints` 不进入详情页。

## 4. 可直接录入的英文内容

### WD01：产品身份

**Breadcrumb**

`Products / Wheels / {model}`

**Eyebrow**

`PUBLISHED WHEEL MODEL`

**H1**

`{model}`

**Process line**

- 已确认：`Recorded process: {processLabel}`
- 未记录：`Manufacturing process is not specified in the source record.`

**Intro**

`Model {model} is shown with the approved production configurations currently available for enquiry. Select one recorded configuration below so the team can review supply, application and destination-market requirements.`

**Boundary note**

`The image identifies the wheel design. Final finish appearance, vehicle fitment, brake clearance and load requirements are confirmed for the selected project.`

### WD02：实际配置

**H2**

`Recorded production configurations`

**Lead**

`Each row is one recorded combination. Size, PCD, offset, centre bore and finish must stay together under the same production code.`

**Column labels**

`Select` / `Production code` / `Size` / `PCD` / `Offset` / `Centre bore` / `Finish`

**Disclosure**

`A recorded configuration is available for enquiry; it is not a vehicle-fitment or stock guarantee.`

### WD03：询盘

**H2**

`Request this wheel configuration`

**No selection message**

`Select one recorded configuration to attach its production specifications to the enquiry.`

**Selected summary**

`{model} / {productionCode} / {size} / {pcd} / ET{offset} / CB {centerBore} mm / {finish}`

**CTA**

`Request this configuration`

**Success**

`Your enquiry has been received. Please keep reference {inquiryId} for follow-up.`

### WD04：表面处理

**H2**

`Recorded finish options for {model}`

**Body**

`The finishes below come from approved production records for this model. Colour, gloss level and machining appearance should be confirmed against an approved sample before production.`

无批准 finish 时隐藏整个 WD04，不显示 `Coming soon`。

### WD05：适配边界

**H2**

`Confirm the application before production`

**Body**

`Matching diameter and PCD does not confirm vehicle fitment. Share the vehicle or application, model year or generation, brake package, suspension changes, tire plan, load requirement and target market for review.`

**Checklist**

- `Vehicle or application and model year`
- `Brake package and suspension changes`
- `Tire size and intended use`
- `Required quantity and destination market`

### WD06：相关型号

**H2**

`Compare other published wheel models`

只显示真实型号卡，不为凑满三张而放宽发布门槛。

## 5. WD01 首屏布局

### 桌面 1440×900

- Header 后显示轻量面包屑，不增加独立大 Hero。
- 主区域两列：左侧约 55%，右侧约 45%；最大内容宽度沿用站点容器。
- 左侧使用 1:1 图片容器和 `object-contain`；主图完整显示轮毂外缘，背景使用现有设计令牌。
- 不显示缩略图条、切换箭头、放大镜或自动轮播。
- 右侧显示型号、工艺、事实说明和配置摘要；首屏底部露出 WD02 标题或第一条配置。
- 右侧可以有 `Select a configuration` 锚点按钮，不在尚未选定 variant 时生成含假规格的询盘。

### 移动 390×844

- 顺序固定为面包屑 → 主图 → 型号/工艺/说明 → 配置。
- 主图保持 `object-contain`，不得像参考页一样让轮毂右缘超出视口。
- 图片高度控制在约 320–390px；型号必须在首屏或一次短滚动内出现。
- 页面无横向滚动；200% 放大仍能读取型号和 CTA。

## 6. WD02 变体选择

### 桌面表格

- 每一行对应一个批准的 `productionCode`。
- 使用单选控件选择整行；点击行也可选择，但保留可访问 label。
- 表头保持可见；数值单位写在列名或单元格中，避免裸数字。
- 默认按直径、宽度、PCD、ET、生产代码稳定排序。
- 只有一个批准 variant 时可默认选中；多条时不自动替客户决定。

### 移动配置卡

- 每条卡片顶部为单选和生产代码。
- 下面使用 `dt/dd` 两列展示 Size、PCD、Offset、Centre bore、Finish。
- 一张卡内的字段不可拆成独立 select；finish 也是该生产配置的一部分。
- 超过 12 条批准 variant 时首屏显示筛选/折叠入口，但搜索仍只在本型号批准数据中进行。

### URL 与恢复

- 可使用 `?variant={productionCode}` 链接到一个批准配置。
- 非本型号、未批准或非法代码忽略并清理；不能回显其规格。
- 刷新和浏览器返回恢复合法选择。

## 7. WD03 询盘行为

详情页不直接铺开完整表单，而是明确分成两条业务路径：

- `Add to total enquiry`：只把当前批准配置加入可跨页面保留的总询盘清单，客户可继续比较型号；
- `Request this configuration`：在当前页打开可访问弹窗，只提交当前型号/配置，不读取也不清空
  总询盘清单；未选择配置时使用 `Request this wheel model`，按既有 `variant_pending` 语义提交。

两条路径仍复用统一 `InquiryForm`、`/api/inquiries`、隐私同意、服务端复核、WordPress 持久化和
投递状态，不建立第二套 Email/WhatsApp 处理逻辑。直接模式提交成功后在弹窗内显示询盘编号，
不跳转 `/request-a-quote`；总询盘模式提交成功后才清空清单。

弹窗使用 Astryx `Dialog purpose="form"`：关闭按钮和 Escape 可退出、背景不可操作、关闭后焦点
返回触发按钮。移动端内容在视口内纵向滚动，页面不得产生横向溢出。

### 可见字段

- `Buyer type`：Business / Individual
- `Name`
- `Company`：B 端必填，C 端隐藏或选填
- `Business email` / `Email`
- `Country or market`
- `Quantity for this configuration`：选中配置时为正整数，无业务上限；只受安全整数等技术边界保护
- 项目总量文本：继续允许 `prototype`、`500/year` 等表达，不与单配置数量混为一个上限
- `Vehicle or application`
- `Message`
- 隐私同意

### 自动附带且不可由客户端伪造的上下文

- `productLine = wheels`
- `intent = wheel_model_quote`
- `model`
- 选中 `productionCode`
- 该代码对应的服务端规格快照
- 当前页面 URL、语言、提交时间

服务端必须按公开目录重新查询 `model + productionCode`。客户端隐藏字段只能作为提示，不能成为订单事实源。

### 状态

- 未选配置：允许提交“只询问型号”，但明确存为 `variant_pending`；CTA 前提醒客户选择可加快处理。
- 提交中：按钮禁用并有文字状态。
- 校验失败：错误与字段关联，保留客户输入和已选配置。
- 服务不可用：返回真实失败，不显示成功；遵循现有 T03 规则。
- 成功：显示询盘编号，不把客户全文写入浏览器或服务器普通日志。

## 8. WD04 Finish 展示

- 只对本型号批准 variant 去重，并按公开英文名显示。
- 首发使用文字标签/卡片，不使用根据名称生成的 CSS 颜色。
- 有该 finish 的批准实物图后，可显示 1:1 图片；图片必须属于供应商可公开样品，并标注 `Finish sample`，不能让客户误以为是该型号实拍。
- Solid / Brushed 等解释只有在公开映射中存在 `surfaceTreatment` 时出现。
- finish 选择不能改变已选 productionCode；若客户想要记录外 finish，放进 `Requested alternative finish` 备注并进入工程审核。

## 9. WD05 适配与工程边界

- 不显示从 `styleName` 派生的车型。
- 不根据 PCD 或尺寸自动写“适配 BMW / Audi / Toyota”等结论。
- 不使用 `universal fitment`、`guaranteed fit`、`direct replacement`。
- 页面把“生产记录”和“车辆适配审核”分开表达。
- 若将来有工程签字的 fitment 记录，通过独立受控类型接入，不能写回通用营销文案。

## 10. WD06 相关型号算法

从相同公开集合中排除当前型号后计分：

1. 至少一个相同规范 PCD：+4
2. 至少一个相同直径：+3
3. 相同已记录工艺：+2
4. 至少一个相同公开 finish family：+1

按分数降序、型号升序取前三个。0 分型号不显示；不足三个就少显示。相关卡复用目录卡，不使用 `styleName`、车型或人工“相似款”标签。

## 11. SEO 与结构化数据

**Title**

`{model} Wheel Specifications & Configurations | Fenghuai`

**Description**

`View approved production configurations for Fenghuai wheel model {model}, including size, PCD, offset, centre bore and finish, then send the selected configuration for enquiry.`

- canonical：`/products/wheels/{normalized-slug}`，不含 `variant` 参数。
- 大小写或旧 slug 只在有确定映射时 308 到规范 slug；不存在的型号 404。
- 只有完整公开型号进入 sitemap。
- 可输出 `Product`，`name={model}`，`image=批准主图`，`sku={model}`；没有价格/库存时不输出 `Offer`。
- variant 表可输出 `additionalProperty`，但只包含当前公开规格；不输出车型适配。
- 主图 alt：`Fenghuai wheel model {model}, front view`；不加入竞品风格词或车型。

## 12. 性能与可访问性

- WD01 只加载一张主图，提供已知宽高、响应式 `sizes` 和 WebP。
- 相关型号图片懒加载；首屏主图可 priority，其余不抢占。
- 不把全部 1073 型号或全部目录变体发送给浏览器；相关型号由服务端索引计算。
- 表格具备 caption/可见标题，单选有完整 label；移动卡保持相同语义。
- 焦点顺序与视觉顺序一致；错误摘要可聚焦；成功消息使用合适 live region。
- 所有交互尊重 `prefers-reduced-motion`；无 JS 时仍可阅读规格并进入带型号上下文的询盘页。
- 目标：移动 Lighthouse Performance ≥85，Accessibility/SEO ≥95，无图片 404。

## 13. 现有实现替换要求

以下替换要求已完成；旧 `[sku]` 方案仅保留在归档记录中：

1. 路由逻辑改读公开 `WheelModel` 和 WordPress 发布覆盖层；参数语义统一为 `model`。
2. `generateStaticParams`、页面查询和 sitemap 使用完全相同的公开集合。
3. 删除页面对 `wheel-skus.ts`、`skuSpecRows`、`WheelSketch`、`wheelFinishSwatches`、`getProductFamily` 和虚构 applications 的依赖。
4. 使用 `images[0]` 的批准真实图片；继续保留资产层其他图片，不在详情模板展示。
5. 规格表逐行读取批准 variant，不读取型号级集合拼表。
6. 询盘复用统一组件/API，服务端重新验证 productionCode 并保存规格快照。
7. 相关型号改用第 10 节算法，不按虚构 family 取值。
8. `/products/wheels/forged`、`flow-formed` 等静态路由不得落入动态型号模板。
9. 页面文案放在 `src/content/` 接缝；组件不硬编码营销文字。
10. 组件只使用设计令牌和声明式动效。

## 14. 验收清单

- [ ] 页面借鉴 2N 的左图右信息首屏、配置询盘、finish 说明和相关产品顺序，但没有竞品内容残留。
- [ ] 主图来自真实批准资产，全站所有型号统一单图模板，没有伪图库和缩略图条。
- [ ] 无图或任何发布条件未满足的型号返回 404，不出现空壳详情。
- [ ] 所有规格行对应一个批准 `WheelVariant`，productionCode 可回溯。
- [ ] 尺寸、PCD、ET、CB 和 finish 不能跨 variant 自由拼接。
- [ ] PCD 异常型号修正并批准前不公开。
- [ ] 工艺未标注时诚实显示未知，不推断为旋压、低压或锻造。
- [ ] finish 未完成英文映射前不显示中文原值、推测色板或通用样品图。
- [ ] 多 variant 时不自动替客户选中；单 variant 默认选择可清楚感知。
- [ ] 询盘携带型号、productionCode 和服务端规格快照；未选配置记录为 `variant_pending`。
- [ ] 表单成功与失败真实反映 API 结果，不泄露客户全文。
- [ ] 页面不声称车型适配、库存、价格、交期、载荷或认证。
- [ ] 相关型号只来自公开集合，算法可重复，不用第三方款式名。
- [ ] 390px 无横向滚动和主图裁切；桌面首屏能看见产品身份与配置入口。
- [ ] 键盘、200% 放大、无 JS、慢网、图片失败、非法 variant 和猜 URL 场景通过。
- [ ] canonical、Product schema、sitemap 与公开状态一致，不输出 Offer。
- [ ] 实现阶段 lint、typecheck、build 与本地生产实例冒烟通过。

## 15. 参考证据

- [2N Forged N-501RS](https://2nforged.com/wheel-products/n-501rs/)：产品图库、型号说明、首屏定制询盘、finish 样品和相关产品结构参考。
- [本地参考记录](../resources/research/2026-10-04-2n-wheel-detail-reference.md)：包含桌面/移动快照、模块拆解、数据映射与不可照搬项。
- [轮毂产品目录 Page SPEC](wheel-catalog.md)：公开集合、PCD/finish 治理、查询与产品卡契约。
