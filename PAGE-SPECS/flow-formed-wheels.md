# 旋压轮毂入口 Page SPEC

- 路由：`/products/wheels/flow-formed`
- 页面类型：旋压工艺说明 + 真实型号筛选入口
- 受众：海外经销商、改装采购、车队/OEM 项目人员与个人客户
- 视口：WFF01–WFF05
- 状态：**已实现**（2026-10-16，DEC-054、DEC-102）。WFF01–WFF05 已按本规格落地；工艺边界服务端锁定（`?process=` 任一取值均被忽略，生成 URL 不含 `process`）；复用目录卡片/筛选/排序/分页（后两者已加 `basePath` + `lockedProcesses`）；PC 与移动端均每页 24 个型号，移动端 360–639px 使用两列；移动专项生产模式 E2E 通过。
- ✅ **发布门槛已开**（2026-10-06，用户指令）：`publicationGate = { copyReviewed: true, equipmentImageRights: "approved" }` → 页面 `robots: index,follow` + canonical 自指 + **已进 sitemap**（177 URL）。`src/app/sitemap.ts` 读同一门槛，**门槛若再关闭会自动退出 sitemap**（双向耦合已实测）。筛选页与空结果仍 `noindex,follow`。
- 公开语言：英文优先
- 内容来源：航鹏轮毂资料、峰徊综合资料、真实轮毂目录、WP 116
- 核心边界：`旋压`、`低压+旋压`可以进入候选集合；旋压不等于整体锻造，也不能由外观推断

## 1. 页面任务

本页同时完成两件事：

1. 让客户理解本站所说的 flow forming 指什么，以及它与整体锻造的边界。
2. 让客户浏览工艺字段已经记录并完成公开批准的旋压型号，再以一个真实变体进入详情和询盘。

页面不承诺统一减重比例、强度提升、载荷、适配、库存、价格或交期。当前数据中的 330 个有图型号只是技术候选，页面数量必须实时读取批准后的公开集合。

| 视口 | 客户问题 | 主模块 | 主视觉 | 主行动 |
|---|---|---|---|---|
| WFF01 | 这里有哪些旋压轮毂 | 工艺定位、两类记录口径、批准型号首屏 | 一张批准型号主图；没有批准图时使用无产品占位布局 | 浏览已批准型号 |
| WFF02 | 旋压与锻造有什么不同 | 轮辋局部成形、毛坯路线与整体锻造边界 | 结构化对比，不使用伪剖面图 | 查看制造路线 |
| WFF03 | 旋压怎样进入实际生产 | 毛坯确认→轮辋旋压→后续加工/表面→检查验证 | WP 116 旋压设备 | 查看工艺证据 |
| WFF04 | 哪些真实型号可以询价 | 锁定工艺的目录筛选、24 个/页、真实变体摘要 | 批准型号首图网格 | 查看型号规格 |
| WFF05 | 询价前还要确认什么 | 变体选择、车辆/应用、刹车/载荷、市场、数量和文件需求 | 已选变体摘要 + 统一询盘入口 | 提交旋压轮毂询盘 |

## 2. 数据范围和发布资格

### 2.1 允许进入候选集合的工艺值

| 源数据值 | 公开英文标签 | 页面解释 |
|---|---|---|
| `旋压` | `Flow formed` | 源数据明确记录旋压；毛坯路线没有记录时保持未知 |
| `低压+旋压` | `Low-pressure cast + flow formed` | 源数据明确记录低压铸造与旋压组合路线 |

`低压`、空值或仅从 finish/styleName 中出现“旋压”字样的记录都不能自动进入本页。筛选依据是规范化后的 `WheelModel.process`，不是自由文本搜索。

### 2.2 公开型号资格

型号必须同时满足：

1. `process` 为上述两个允许值之一。
2. `hasImage=true` 且至少一张图片通过图权和主体审核。
3. 型号供货状态确认，可以接受新询盘。
4. 至少一个 `WheelVariant` 的尺寸、PCD、ET、中心孔和 finish 完整且审核通过。
5. 异常/复合 PCD 已修正或该变体被排除。
6. 第三方款式名已经移除或改成获准公开的中性名称。
7. 型号与变体具有 `approved` 发布状态。

无图型号不建页、不进本页、不进 sitemap。某型号只有部分变体通过时，只显示批准变体，不用系列通用值补齐。

### 2.3 当前内部审计基线

| 分类 | 总候选 | 有图技术候选 | 有图候选变体 |
|---|---:|---:|---:|
| `旋压` | 350 | 320 | 与下一行合计 762 |
| `低压+旋压` | 20 | 10 | 与上一行合计 762 |
| 合计 | 370 | 330 | 762 |

这组数字只用于开发对账，不在页面写成产品数量。公开计数使用批准覆盖层的实时结果。

## 3. 可直接录入的英文内容

### WFF01：首屏

**Breadcrumb**

`Products / Wheels / Flow Formed`

**Eyebrow**

`FLOW-FORMED WHEELS`

**H1**

`Browse flow-formed wheels by recorded production specification`

**Lead**

`Explore wheel models whose production data records flow forming as part of the manufacturing route. Review an actual size and PCD combination, then ask about flow-formed wheel supply for a specific program.`

**Boundary**

`A recorded process and catalogue specification are the starting point. Vehicle fitment, brake clearance, load requirements, finish availability and destination-market documents are confirmed before an order is accepted.`

**Actions**

- `Browse recorded models` → `#flow-formed-models`
- `Ask about a wheel requirement` → `#flow-formed-inquiry`

**首屏产品规则**

- 右侧只显示一个 `featured=true` 且完整通过第 2.2 节的型号。
- 显示型号、批准主图、已记录尺寸范围和工艺标签。
- 不显示第三方 styleName、车型、价格、库存或减重数字。
- 没有批准型号时不随机选择候选图；页面保持 `noindex,follow` 并使用工艺型无产品布局。

### WFF02：工艺边界

**Eyebrow**

`PROCESS DEFINITION`

**H2**

`Flow forming shapes the rim section; it does not turn the wheel into a forging`

**Body**

`For an applicable wheel blank, controlled forming is applied to the rim section according to the approved design and process plan. The blank route, material condition, final geometry and validation requirements remain specific to the wheel program.`

**对比卡**

| 标题 | 英文说明 |
|---|---|
| `Flow formed` | `The catalogue records flow forming, but does not identify the blank route unless that route is separately recorded.` |
| `Low-pressure cast + flow formed` | `The catalogue records both the low-pressure casting route and the subsequent flow-forming operation.` |
| `Forged wheel project` | `Forging is handled as a separate custom-development route and must not be used as an interchangeable label for a flow-formed wheel.` |

**固定证据说明**

`Weight and performance depend on the approved design, material, process parameters and validation results. This page does not apply a universal improvement percentage.`

“Forged wheel project”链接到 `/products/wheels/forged`，用于分流，不在本页混入锻造产品卡。

### WFF03：制造路线

**Eyebrow**

`MANUFACTURING ROUTE`

**H2**

`The route is confirmed for the actual wheel model`

| 步骤 | 英文标题 | 英文说明 |
|---:|---|---|
| 01 | `Confirm the blank route` | `Use the recorded route and project documents. Do not infer low-pressure casting when the catalogue only states flow forming.` |
| 02 | `Form the applicable rim section` | `The supplier-provided equipment scene shows a flow-forming operation available for applicable wheel programs.` |
| 03 | `Complete the approved downstream work` | `Machining, heat treatment and finish steps follow the route and drawing approved for that model; not every wheel uses an identical sequence.` |
| 04 | `Inspect and validate` | `Dimensions, balance and applicable validation evidence are reviewed against the program control plan and target market.` |

**Boundary**

`The equipment image demonstrates a supplier-provided manufacturing scene. It is not proof that every catalogue model used this machine or passed a specific test.`

### WFF04：型号集合

**Eyebrow**

`RECORDED MODELS`

**H2**

`Filter approved flow-formed wheel specifications`

**结果规则**

- 服务端固定 `process ∈ {旋压, 低压+旋压}`，用户不能通过 URL 清除工艺边界。
- 可筛选直径、宽度、PCD；搜索只匹配批准型号代码和获准公开名称。
- 每页 24 个，结果数只统计批准型号。
- 排序默认按稳定型号代码；将来若增加人工排序，必须来自内容覆盖层。
- 产品卡复用 [轮毂产品目录 Page SPEC](wheel-catalog.md) 的单图、规格摘要和发布规则。

**卡片字段**

1. 批准主图，使用稳定宽高比和 `object-contain`。
2. 型号代码。
3. `Flow formed` 或 `Low-pressure cast + flow formed` 标签。
4. 批准变体中的直径/宽度和 PCD 摘要。
5. 批准配置数；finish 未完成英文映射时不显示 finish 数或色板。
6. `View specifications` → `/products/wheels/[model]`。

**空结果**

`No approved model matches these filters. Clear the size and PCD filters, or send the required specification for review.`

保留当前筛选快照进入询盘。不能推荐不匹配的型号，也不能把 40 个无图工艺候选做成占位卡。

### WFF05：选择与询盘

**Eyebrow**

`FITMENT AND SUPPLY REVIEW`

**H2**

`A catalogue match still needs an application review`

**需要确认**

- `Selected model and complete recorded configuration`
- `Vehicle or application, including trim and year where relevant`
- `Brake, suspension or body modifications`
- `Load and intended use`
- `Requested finish and quantity`
- `Destination market and required documents`
- `Requested sample or delivery timing`

**CTA**

`Request a flow-formed wheel review`

询盘上下文必须包含：

- `product_line = wheels`
- `wheel_route = flow-formed`
- 型号 slug
- 已选 `productionCode`
- 服务端重新读取的规格快照
- 当前筛选与页面来源

客户没有选中型号时允许提交需求询盘，但不能生成虚构 productionCode。个人客户不强制填写公司。

## 4. 媒体绑定

| 模块 | 来源 | 使用方式 | alt / caption | 不得写成 |
|---|---|---|---|---|
| WFF01 | 批准 `WheelModel.images[0]` | 右侧单张产品主图；`object-contain` | 按型号、已批准工艺和可见 finish 生成中性 alt | 车型适配、现货、性能结果 |
| WFF03 | WP 116 | 桌面 4:3 工艺图；移动端置于步骤 02 后 | `Flow forming equipment for an applicable wheel program` | 峰徊自有设备、具体型号加工实拍、产能证明 |
| WFF04 | 各批准型号首图 | 复用目录卡，不建立第二套图片选择逻辑 | 型号 + 中性产品描述 | 从外观判断旋压或锻造 |

画册产品图只有在型号代码、目录记录、图权和工艺字段完成一一核对后才能进入 WFF01/WFF04。当前 WP 产品图不承担旋压工艺证明。

## 5. WordPress 与产品数据接缝

WordPress 管理叙事内容、WP 116、SEO、FAQ 和人工精选型号引用；型号/变体继续来自真实产品数据适配层。组件不直接读取媒体标题或 finish 文本推断工艺。

建议视图契约：

```ts
type FlowFormedWheelPageContent = {
  hero: CapabilityHero;
  processDefinition: ContentSection;
  manufacturingRoute: {
    steps: FlowStep[];
    equipmentMedia: MediaAsset;
    evidenceBoundary: string;
  };
  catalogueIntro: ContentSection;
  featuredModelSlug?: string;
  inquiryChecklist: string[];
  seo: SeoFields;
};

type FlowFormedCatalogueView = {
  allowedProcesses: Array<"旋压" | "低压+旋压">;
  models: PublicWheelModel[];
  page: number;
  pageSize: 24;
  totalApprovedModels: number;
};
```

`PublicWheelModel` 必须由产品发布适配层生成，不能把内部 `WheelModel` 原样暴露给组件。正式增加类型时属于 WordPress/产品契约变更，需要更新 `DECISIONS.md`。

## 6. 桌面与移动布局

### 桌面 1440×900

- WFF01 使用约 55/45 的文字与单图产品布局；H1、边界说明和主行动在首屏可见。
- WFF02 使用三列路线边界卡，锻造卡作为分流入口。
- WFF03 左侧四步路线，右侧 WP 116；图片不铺满整屏。
- WFF04 使用与总目录相同的筛选栏和四列产品网格，24 个/页。
- WFF05 左侧确认清单、右侧已选配置与询盘入口。

### 移动 390×844

- WFF01 顺序为文案→CTA→产品图；没有批准产品时不保留空白图片框。
- WFF02 三卡单列；WFF03 时间线单列，设备图紧随步骤 02。
- WFF04 筛选进入可访问抽屉，工艺条件以不可移除的标签显示；360–639px 产品使用两列，640px 起按卡片最小宽度进入更宽网格。
- 分页保留当前筛选；浏览器返回后恢复滚动和查询状态。
- WFF05 已选配置用逐行标签卡，不缩小桌面表格。
- 200% 放大无横向滚动，交互目标至少 44×44。

## 7. SEO 与结构化数据

**Title**

`Flow-Formed Wheels by Recorded Specification | Fenghuai`

**Description**

`Browse approved wheel models recorded as flow formed or low-pressure cast plus flow formed, then select an actual specification for fitment and supply review.`

- canonical：`/products/wheels/flow-formed`。
- 页面有批准型号时可使用 `CollectionPage` + 当前页批准项目的 `ItemList`。
- 分类页不输出价格、库存或 `Offer`；具体型号的产品结构化数据由详情页决定。
- 没有任何批准型号、WP 116 图权未通过或页面工艺文案未审核时保持 `noindex,follow`，不进 sitemap。
- 分页与筛选 URL 的 canonical、robots 规则沿用轮毂总目录规格，避免制造重复索引页。
- 标题、描述、正文不使用 `forged` 作为旋压同义词。

## 8. 当前实现差距

1. `src/app/products/wheels/flow-formed/page.tsx` 当前不存在，需要新建路由。
2. 当前 `/products/wheels` 仍读取虚构 `wheel-skus.ts`，旋压页不能复制该数据路径。
3. 真实 `wheel-catalogue.ts` 已有 370 个工艺候选和图片匹配，但缺完整发布覆盖层。
4. 需要建立公开工艺翻译、供货状态、图权、异常规格和第三方名称治理。
5. 产品列表和详情必须使用同一个公开集合，避免列表可见而详情 404，或草稿型号被直链访问。
6. sitemap 只收入公开型号和本分类页；无图/草稿型号不生成 URL。
7. 叙事文案继续放在 `src/content/` 接缝；组件使用设计令牌、`hasRender` 兜底和声明式动效。

## 9. 验收清单

- [ ] 只聚合 `process=旋压` 或 `process=低压+旋压` 的批准型号。
- [ ] `旋压` 型号没有被自动写成低压铸造毛坯。
- [ ] 旋压没有被称为锻造，也没有通用减重或强度提升数字。
- [ ] WP 116 只证明供应商资料中的设备场景，不证明具体型号、产能或测试结果。
- [ ] 无图、无供货确认、异常规格、第三方名称未治理或未批准型号不公开。
- [ ] 所有卡片规格来自同一型号的批准变体，详情页只能选择实际完整组合。
- [ ] 结果数量来自公开集合，不显示 330/762 内部审计数为可售数量。
- [ ] URL 不能移除锁定工艺条件或注入未知工艺值。
- [ ] 空结果不产生虚构推荐；筛选快照能带入询盘。
- [ ] 询盘选中变体时携带 productionCode，服务端重新验证并保存规格快照。
- [ ] 个人客户无需公司字段；失败状态不显示假成功。
- [ ] 移动端筛选、分页、返回状态和 200% 放大通过。
- [ ] metadata、canonical、robots、CollectionPage/ItemList 与 sitemap 状态一致。
- [ ] 没有 `2nforged`、Vossen 或第三方款式名残留。
- [ ] 实现阶段 lint、typecheck、build 与本地生产实例冒烟通过。

## 10. 关联规格

- [轮毂产品目录 Page SPEC](wheel-catalog.md)
- [轮毂详情页 Page SPEC](wheel-detail.md)
- [轮毂制造与质量能力 Page SPEC](capabilities-wheel-manufacturing.md)
- [锻造轮毂高端定制 Page SPEC](forged-wheel-customization.md)
- [资料与数据核验](../resources/research/2026-10-05-flow-formed-wheel-source-audit.md)
