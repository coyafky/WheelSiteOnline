# 轮毂产品目录 Page SPEC

- 路由：`/products/wheels`
- 页面类型：真实型号目录与询盘入口
- 视口：W01–W03；W02 产品网格可自然延续多个屏高
- 状态：**已实现**（2026-10-09，DEC-053、DEC-069）。W01–W03 只读 `@/lib/wheels`；live 模式读取 WordPress 可编辑规格/媒体，契约或网络失败时使用最后有效静态集合；保存、撤回和删除通过签名 webhook 立即失效。无 JS 可用（GET 表单 + 普通链接 + 原生 `<details>` 抽屉）；四视口运行时验收全绿。⚠️ 已知偏差：§10 的「焦点锁定 + Escape 关闭」与「无 JS 可用」不可兼得，当前选后者。§4 的 `/products/wheels/flow-formed` **已实现**（DEC-054）。
- 公开语言：英文优先
- 参考结构：[Vossen Wheels 目录](https://vossenwheels.com/wheels/)；只借鉴筛选、产品卡和密集浏览方式
- 数据来源：WordPress `/fh/v1/wheels` 可编辑正本；`src/content/wheel-catalogue.ts` 与批准快照只作故障兜底和审计
- 上架规则：有图只是技术候选；图片、规格、供货和使用授权全部批准后才进入公开目录

## 1. 页面目标与叙事

页面要帮助客户从真实目录中缩小选择，并把一个实际型号/变体带入询盘。它不承担制造故事、车型适配保证或价格商城职责。

| 视口 | 客户问题 | 主信息 | 主视觉/交互 | 主行动 |
|---|---|---|---|---|
| W01 | 我怎样快速缩小范围 | 紧凑页首、旋压/锻造路线入口、型号搜索、规格筛选、结果数 | 筛选栏 + 第一排真实产品 | 选择筛选或进入型号 |
| W02 | 哪些真实型号符合条件 | 单图产品卡、型号、已记录工艺、尺寸/PCD 摘要、真实配置数量、分页 | 响应式产品网格 | `View specifications` |
| W03 | 没有匹配项或没有合适规格怎么办 | 清除筛选、检查输入、提交实际需求 | 紧凑空状态或目录末尾询盘块 | `Request a wheel review` |

W01 不使用大型 Hero。桌面 1440×900 首屏应看到页面定位、筛选控件和至少第一排产品上半部；移动端首屏看到标题、结果数、筛选按钮和首张产品卡。

## 2. Vossen 模块的取舍

### 2.1 借鉴

- 导航之后直接进入目录，减少从“想找产品”到“看到产品”的距离。
- 桌面左侧持续可见分类/筛选，右侧用统一图片比例比较型号。
- 卡片把型号、工艺/系列、尺寸和 finish 信息放在图下，扫描层级清楚。
- 分类显示结果数量，筛选状态与产品结果在同一上下文中。
- 大图、小字、充足留白，产品本身承担视觉重点。

### 2.2 根据峰徊数据重构

| Vossen 模块 | 峰徊替代 | 原因 |
|---|---|---|
| Series | `Diameter / Width / PCD / Recorded process` | 峰徊没有核准系列体系，`styleName` 含第三方商标 |
| Price | 不显示 | 没有经核准公开价格；本项目以询盘成交 |
| Finish colour swatches | 首发只显示 `N finish options` | 531 个原始 finish 文本尚未归一化和英文化 |
| New Release | 不显示 | 数据没有发布日期或上新状态 |
| Vehicle application | 不显示 | `suitableVehicles` 为空，派生 hints 不是适配证据 |
| 单页长列表 | 服务端筛选 + 24 个/页 | 1073 个候选型号不能一次渲染 |
| 移动多列裁切 | 390px 单列 + 筛选抽屉 | 参考页移动截图出现横向溢出 |
| 系列介绍卡混入网格 | 路线入口留在 W01 | 目录型号与能力路线属于不同数据粒度 |

不得复制 Vossen 的图像、产品名、系列文案、价格、徽标、色板或 CSS。

## 3. 真实数据基线

### 3.1 当前数据量

| 项目 | 数量/状态 | 页面含义 |
|---|---:|---|
| 全部型号 | 1349 | 内部数据，不等于公开商品数 |
| 有图技术候选 | 1073 | 可进入审批队列 |
| 无图 | 276 | 不建页、不进目录/筛选/sitemap |
| 全目录变体 | 3485 | 每条是实际规格组合 |
| 有图候选中的变体 | 2705 | 公开数量还要经过型号与变体批准 |
| 多变体候选型号 | 515 | 目录卡不能把规格集合自由组合 |
| 工艺未标注 | 647 / 1073 | 不推断为旋压、锻造或低压 |
| 原始 finish 文本 | 531 种 | 首发不做 finish 筛选/色板 |
| 明显异常/复合 PCD 型号 | 13 个有图候选 | 修正或确认前不能获得规格批准 |

### 3.2 上架资格

公开目录集合不是简单的 `publishedWheelModels`。真正条件是：

```text
hasImage = true
AND publicationStatus = approved
AND imageRightsStatus = approved
AND supplyStatus = confirmed
AND specificationStatus = verified
AND 至少一个 variant = approved
```

任何一项未满足，型号保留在内部数据层，不出现在公开目录、搜索、筛选、详情页或 sitemap。首发仍建议从 1073 个技术候选中批准 10–20 个，而不是一次发布全部。

### 3.3 变体真相

筛选必须在同一个 `WheelVariant` 上求交集。例如用户选择 `18×8.5 + 5×112 + ET35`，只有真实存在这一整组组合的型号才命中。禁止分别从 `sizes[]`、`pcds[]`、`offsets[]` 取集合后拼出源数据中不存在的配置。

## 4. 可直接录入的英文内容

### W01：紧凑页首与筛选

**Breadcrumb**

`Products / Wheels`

**Eyebrow**

`WHEEL CATALOGUE`

**H1**

`Find a wheel by verified production specification`

**Lead**

`Browse published wheel models by diameter, width, PCD and recorded manufacturing process. Every result has an approved image, and every selectable specification comes from an actual recorded variant.`

**Supporting note**

`A catalogue match is a starting point for quotation. Vehicle fitment, brake clearance, load requirements and destination-market documents are confirmed before an order is approved.`

**Route links**

| Label | Href | 使用条件 |
|---|---|---|
| `Browse recorded flow-formed wheels` | `/products/wheels/flow-formed` | 只聚合明确记录为旋压或低压+旋压的批准型号 |
| `Discuss a custom forged wheel` | `/products/wheels/forged` | 进入锻造能力/定制页，不显示虚构锻造目录数量 |

### W02：结果区

**Result summary templates**

- 无筛选：`{count} published wheel models`
- 有筛选：`{count} models match the selected production specifications`
- 搜索：`{count} models found for “{query}”`

这里的 `{count}` 只统计完整通过上架资格的型号，不能显示 1073 技术候选数或 1349 内部总数。

**Card labels**

- 型号：原始 `model`，保持生产代码大小写；URL 使用稳定小写 slug
- 工艺：只在 `process` 有核准公开翻译时显示
- 尺寸：展示直径范围/集合，最多 3 个值，超出显示 `+N`
- PCD：最多 2 个已核准规范值，超出显示 `+N`
- 配置：`{variantCount} recorded configuration(s)`，只统计批准变体
- 表面：`{finishCount} finish option(s)`，只统计批准且已映射的公开 finish
- CTA：`View specifications`

**Card boundary note（不逐卡重复）**

`Specifications shown in the catalogue are production records, not a vehicle-fitment guarantee.`

### W03：空状态与询盘

**No-result heading**

`No published model matches all selected specifications`

**No-result body**

`Try removing one filter, check that the selected size and PCD belong to the same required configuration, or send the project details for an engineering review.`

**Actions**

- `Clear filters`
- `Request a wheel review` → `/request-a-quote`
- Context：`product_line = wheels`、当前筛选快照、`intent = catalogue_no_match`

**Catalogue-end heading**

`Need a specification that is not listed?`

**Catalogue-end body**

`Share the vehicle or application, target size, PCD, offset, centre bore, quantity and finish. The team will confirm whether an existing variant or a custom program is the appropriate route.`

## 5. 筛选与 URL 契约

### 5.1 首发筛选器

| 顺序 | 筛选 | 数据源 | 控件 | 发布规则 |
|---:|---|---|---|---|
| — | Model search | `model` | 文本搜索 | 大小写不敏感；不搜索 `styleName` 商标词 |
| 1 | **PCD** | `variant.pcd` 规范值 | **可搜索**多选（2 列） | 异常/复合写法未经确认不进入选项；长尾按计数折入 `Show more` |
| 2 | Diameter | `variant.size` 直径 | 多选 checkbox（3 列） | 当前批准数据范围 15–20 英寸 |
| 3 | Width | `variant.size` 宽度 | 多选 checkbox（2 列） | 只显示当前结果中有批准变体的值；长尾折入 `Show more` |
| 4 | Recorded process | `model.process` | 多选 checkbox | `Flow Formed`、`Low Pressure Cast`、`Low Pressure Cast + Flow Formed`、`Not specified in source data` |

**主行动在最上。** `Apply filters` 与结果计数固定在筛选栏顶部（不随筛选区滚动），因为它
是这一栏唯一的动作，也是**需要按下才生效**的那个控件 —— 埋在列表末尾等于让人做完所有
工作再去找提交键。实测依据：原实现把 Apply 放在末尾，勾完 18 寸要滚约 700px 才按得到。

**筛选轴顺序的依据不是审美，是适配工程**（2026-10-06 调研，三个独立来源一致）：
Discord Tire 官方流程「先验证 bolt pattern，再选直径与宽度，然后确认 offset 与 centre bore，
最后核刹车与悬挂间隙」｜Curva Concepts「轮毂必须**先物理装上车**，这从 bolt pattern 开始；
**选错，别的都无意义**」｜Tire Rack「bolt pattern 是轮毂被列为适配某车前必须核实的项」。

⭐ **决定性理由是「不对称性」**：PCD 是这一页上**唯一一个「选错 = 零件直接不可用」的
轴**（`5×114.3` 与 `5×112` 相差 2.3mm，物理装不上，无补救），而直径/宽度/工艺都是偏好
区间。中心孔与偏距是同样的硬门槛，但本规格首发不做这两项筛选 —— 于是 **PCD 独自承担了
整个「能不能装」的职责**。

反方证据一并记下，免得日后被当成疏漏：Vossen 用 Series/Size/Price、Fitment Industries
画廊用直径优先。但那两个都是**视觉画廊**（用户在看效果），本页是**生产目录**（用户在看能不能装）。

**必须显式说明「多选」。** 同类多选 OR、跨轴 AND，但用户对筛选栏的默认预期是单选，
最常见的两种误解是「点 18 寸会不会把 19 寸排除掉」和「再点一个是换还是加」。
筛选栏顶部要有常驻说明（纯文字，不依赖 JS）；每个组的 `legend` 在**应用后**显示
`· N selected`（勾选是 uncontrolled 的，所以该计数只在 Apply 之后刷新 —— 这是已知行为，
不是缺陷）。

首发不提供 finish、车辆、价格、库存、交期、ET、CB 独立筛选。ET 和 CB 保留在详情页实际变体表中；若以后加入高级筛选，也必须按同一变体求交集。

**长尾处理。** 计数低于阈值的选项折进原生 `<details>`（无 JS 可展开），但**仍在表单里** ——
「折起来 → 勾选 → 提交」必须成立（已实测）。**已勾选的值永远留在可见区**，否则用户勾了
某个长尾值后又去改动别的轴，自己选的那条会在收起区里「消失」（但它仍在提交），看起来像被吞了。

### 5.2 查询参数

```text
/products/wheels
  ?q=hp12
  &diameter=18,19
  &width=8,8.5
  &pcd=5x112,5x114.3
  &process=flow-formed
  &sort=model-asc
  &page=2
```

- URL 使用公开规范值；界面显示可以使用乘号 `×`，参数使用稳定 ASCII `x`。
- 同类多选为 OR，不同筛选轴之间为 AND；所有规格条件必须在至少一个相同批准变体上成立。
- 筛选变化时 `page` 重置为 1；浏览器前进/后退恢复筛选、页码和合理滚动位置。
- 未知参数忽略并从规范 URL 移除；非法值不导致 500。
- 没有结果的合法筛选返回 200 + noindex 空状态；超过最后页的 `page` 返回 404。

### 5.3 排序

首发排序：

1. `Model A–Z`（默认，稳定二级键为内部 source key）
2. `Diameter: low to high`
3. `Diameter: high to low`
4. `Most recorded configurations`

不提供 `Newest`、`Popular`、`Price`，因为没有对应真实字段。

### 5.4 分页

- 每页 24 个型号；桌面 4 列×6 行，平板 2–3 列，移动单列。
- 使用可爬取的普通链接和服务端结果，不用无限滚动作为唯一导航。
- 分页组件显示上一页、下一页、当前页及邻近页；总页数很大时使用省略号。
- 筛选状态完整保留在分页 URL。
- 无 JavaScript 时 GET 表单、结果和分页仍可工作。

## 6. PCD 与表面处理数据门槛

### 6.1 PCD

当前至少 13 个有图型号含待处理值：`4`、`120`、`112-114.3`、`5-114.3`、带空括号的 `5*112`、双孔距连写和 `10*5*112-5*114.3` 等。

处理规则：

1. 保留原始 `sourcePcd`，不得覆盖原数据。
2. 新增经人工确认的 `normalizedPcd[]`；单孔距、双孔距和总孔数分别表达，不能只靠字符串替换。
3. 未确认型号的 `specificationStatus` 保持 `needs-review`，不能公开。
4. 筛选器只从批准变体的 `normalizedPcd` 生成选项和数量。

### 6.2 Finish

531 种原始写法需要映射为：

- `publicNameEn`：公开英文名
- `colorFamily`：Black / Grey / Bronze / Silver / White / Other
- `surfaceTreatment`：Painted / Machined Face / Polished / Matte / Gloss / Other
- `sourceFinish`：保留原值
- `approvalStatus`

完成映射前，目录卡只显示批准 finish 的数量，不画推测色板，也不直接输出中文原值。

## 7. 产品卡规格

### 7.1 数据

```ts
type WheelCatalogueCard = {
  model: string;
  href: string;
  primaryImage: MediaAsset;
  processLabel?: string;
  diameters: number[];
  pcds: string[];
  approvedVariantCount: number;
  approvedFinishCount: number;
  badges: Array<"new" | "featured">;
};
```

`new` 和 `featured` 只有在 WordPress 存在编辑审核字段时才能使用，当前数据不能自动生成。

### 7.2 视觉

- 图片容器 1:1，使用 `object-contain`，保留轮毂完整外缘和产品留白。
- 只显示第一张批准图片；不做自动轮播，不用第二张图片造成 hover 下载。
- 卡片顺序：图片 → 可选 badge → 型号 → 工艺 → 直径/PCD → 配置和 finish 数量 → CTA。
- 卡片整块可以点击，但内部文本仍有明确链接名称；焦点样式清楚。
- hover 只做轻微位移/缩放，尊重 `prefers-reduced-motion`。
- 固定图片宽高，加载时不产生布局跳动。

### 7.3 不显示

- `styleName` 中的第三方商标或车型名称
- `vehicleHints`
- 未核准价格、库存、MOQ、交期、载荷、重量和认证
- 将 sizes/PCDs/offsets/CB 集合拼出的假配置
- 无图占位型号或“Coming Soon”空壳卡

## 8. 内容与发布接缝

WordPress 维护型号、逐条规格、媒体、发布状态与公开命名；原始生成目录保持只读，作为迁移对账和最后有效兜底。稳定公开视图如下：

```ts
type WheelPublicationRecord = {
  model: string;
  publicationStatus: "draft" | "approved" | "withdrawn";
  supplyStatus: "unconfirmed" | "confirmed" | "unavailable";
  specificationStatus: "needs-review" | "verified";
  imageRightsStatus: "pending" | "approved" | "rejected";
  approvedVariantCodes: string[];
  normalizedPcdByVariant: Record<string, string[]>;
  publicFinishBySource: Record<string, {
    publicNameEn: string;
    colorFamily: string;
    surfaceTreatment: string;
    approvalStatus: "draft" | "approved";
  }>;
  publicProcessLabel?: string;
  featured?: boolean;
  approvedBy?: string;
  approvedAt?: string;
};

type WheelCatalogueQuery = {
  q?: string;
  diameters: number[];
  widths: number[];
  pcds: string[];
  processes: Array<"flow-formed" | "low-pressure-cast" | "low-pressure-flow-formed" | "not-specified">;
  sort: "model-asc" | "diameter-asc" | "diameter-desc" | "variants-desc";
  page: number;
  pageSize: 24;
};
```

组件消费适配后的目录结果，不直接 import 原始 WordPress 响应或供应商 JSON。正式扩展类型等于修改内容/WordPress 契约，实施时更新决策记录。

## 9. 桌面视口规格

基准：1440×900；补测 1280×800。

### W01

- 页首总高度控制在约 260–340px，包含 Breadcrumb、H1、Lead、两个路线链接。
- 进入结果区后左侧筛选栏约 240–280px，右侧为结果标题、排序和四列产品。
- 筛选栏可以在内容区内 sticky，但不能遮挡全站 Header，也不能使页尾无法到达。
- 结果数与排序和第一排同屏；不插入大面积装饰图。

### W02

- 1440px 四列；1280px 三列或四列以卡片最小宽度 230px 为准。
- 每页 24 张图片，只给第一排设置优先加载；其余懒加载。
- 筛选数量基于当前其他筛选条件动态计算，值为 0 的选项禁用但可见，便于理解为什么没有结果。
- 产品网格可以跨多个视口自然延续，不把每一排当独立 Section。

### W03

- 有结果时，目录末尾显示紧凑询盘块；无结果时在结果区原位显示空状态。
- 空状态保留当前筛选摘要，客户可以一键清除或把筛选快照带进询盘。
- 不推荐不匹配的型号来填空。

## 10. 移动视口规格

基准：390×844；补测 360×800。

- 页首自然流，H1 后立即显示结果数和 `Filters` 按钮；第一张卡尽量在首屏下部出现。
- 360–639px 单列卡片；640px 起才进入两列。避免 Vossen 参考页在 390px 下出现的横向裁切。
- 筛选使用模态抽屉：有可访问标题、焦点锁定、Escape/关闭按钮、应用与清除按钮、关闭后焦点返回。
- 抽屉内显示预期结果数；`Apply filters` 后更新 URL 并回到结果标题。
- 已应用筛选在抽屉外显示可移除 chips；chip 横向换行，不建立不可见横向滚动区。
- 排序使用原生 select；分页按钮至少 44×44。
- 200% 放大无横向滚动；无 JavaScript 时回退为页面内 GET 筛选表单。

## 11. SEO 与结构化数据

**建议 title**

`Wheel Catalogue | Sizes, PCDs & Production Specifications | Fenghuai`

**建议 description**

`Browse approved wheel models by diameter, width, PCD and recorded manufacturing process, then select an actual production configuration for enquiry.`

**建议 H1**

`Find a wheel by verified production specification`

- `/products/wheels` 为基础 canonical。
- 无筛选分页可使用自身分页 URL；页面标题包含页码，分页使用可爬取链接。
- 带筛选或搜索参数的结果页使用 `noindex,follow`，canonical 指向基础目录，避免组合爆炸。
- 空结果页始终 noindex；不进入 sitemap。
- 型号详情 sitemap 只列完整通过上架资格的型号。
- 目录页可以输出当前页 `ItemList`；没有价格/库存时不输出 Offer，未核准型号不输出 Product。
- 图片 alt 使用 `Fenghuai wheel model {model}, front view`，不加入未验证车型或竞品款式名称。

## 12. 性能与数据加载

- 服务端解析查询并返回当前页 24 条，不能把 1073 条完整数据和全部变体序列化给浏览器后再筛选。
- 目录索引可以由生成脚本/适配器预构建，但它是可重建索引，不成为第二事实源。
- 查询结果使用稳定键缓存；WordPress 发布/撤回触发相关路径和索引重验证。
- 图片使用已知宽高、响应式 `sizes` 和 WebP；第一排之外懒加载。
- 首发性能目标：移动 Lighthouse Performance ≥ 85，Accessibility/SEO ≥ 95；无 404 图片请求。
- 过滤、分页和浏览器返回不应重复下载已缓存产品图片。

## 13. 现有实现替换要求

以下替换要求已于 2026-10-06～09 完成：

1. 改读 WordPress live 集合；故障时回退最后有效 `publishedWheelModels` 静态集合。
2. 删除目录页对 `wheelSkus`、`getSkusByFamily`、`productFamilies` 和 `WheelSketch` 的依赖。
3. 使用真实第一张批准图片，不再生成示意轮毂 SVG。
4. 不继续显示虚构三分类、虚构 summary、spoke count 或 finish。
5. 详情路由同步改读 `WheelModel`；无图、草稿、撤回或规格未通过型号返回真实 404。
6. sitemap 只使用相同公开集合，清除虚构 SKU URL。
7. 询盘存储选中的真实 `productionCode` 和规格快照；只有选型号未选变体时明确记录 `variant_pending`。
8. 内容继续通过 `src/content/` 接缝提供；组件使用设计令牌和声明式动效。

## 14. 验收清单

- [ ] 页面结构借鉴 Vossen 的筛选+大图卡片，但没有 Vossen 品牌、图片、文案、系列或价格残留。
- [ ] W01 首屏包含紧凑页首、筛选/结果数和首排产品，不被大 Hero 占满。
- [ ] 公开数量来自完整上架资格集合，不显示 1349 或 1073 为可销售数量。
- [ ] 无图、草稿、撤回、无供货确认、无图权或规格待审核型号不出现在目录/搜索/详情/sitemap。
- [ ] 13 个含异常/复合 PCD 的有图型号修正并批准前不公开。
- [ ] 647 个工艺未标注候选不被推断为旋压、低压或锻造；筛选中作为独立状态处理。
- [ ] finish 未完成英文化/归一化前不生成色板或筛选。
- [ ] 多轴规格筛选在同一个真实 variant 上求交集，不产生不存在的组合。
- [ ] 产品卡使用真实图片、型号、批准规格摘要和配置数量，不显示适配、价格、库存或交期。
- [ ] 搜索、筛选、排序和分页状态可复制 URL、刷新保持、前进/后退恢复。
- [ ] 每页 24 个；合法空结果 200 + noindex，越界页码 404。
- [ ] 移动 390px 单列无横向裁切，筛选抽屉可键盘操作并正确返回焦点。
- [ ] 无 JavaScript 时 GET 筛选与分页仍可使用。
- [ ] 200% 放大、键盘导航、图片失败、空结果和慢网场景通过。
- [ ] CTA 保留筛选快照、型号和选中 `productionCode` 上下文。
- [ ] canonical、robots、ItemList 与 sitemap 只反映真实公开状态。
- [ ] 实现阶段 lint、typecheck、build 与本地生产实例冒烟通过。

## 15. 参考证据

- [Vossen Wheels 目录页](https://vossenwheels.com/wheels/)：截至 2026-10-04，页面公开呈现 Series/Size/Price 筛选以及包含型号、工艺/系列、尺寸、价格和 finish 信息的产品卡。
- [本地参考与数据审计](../resources/research/2026-10-04-vossen-wheel-catalog-reference.md)：包含桌面/移动截图、可借鉴模块、不可照搬项和真实目录字段统计。
