# 首页 Page SPEC

- 路由：`/`
- 页面类型：公司级定位、四产品线分流与制造能力证据入口
- 受众：海外经销商、采购、OEM/Tier 1 项目人员、改装客户和个人客户
- 视口：H01–H05
- 状态：页面已实现；H01/H04 媒体与集团制造归属已由用户批准
- 公开语言：英文优先
- 结构参考：2N 首页的全视口 Hero、能力条、产品展示和强收口节奏
- 核心边界：峰徊是深圳项目与商务接口；用户确认相关制造公司属于同一实际控制人体系，品牌层可称“我们的制造基地”，法人文件仍按实际主体展示

## 1. 首页只回答五个问题

| 视口 | 用户问题 | 主模块 | 主视觉 | 主行动 |
|---|---|---|---|---|
| H01 | 这家公司能为我组织什么 | 公司级制造定位、四线范围、主体边界 | WP 114 轮毂制造基地 | `Explore product lines` |
| H02 | 我的需求属于哪条产品线 | 轮毂、EV 壳体、定制铝件、自密封轮胎 2×2 等权入口 | 四条线各一个获准视觉 | 进入对应产品线 |
| H03 | 制造与技术能力体现在哪里 | 工程、成形、加工、过程、验证、文件六项能力条 | 3×2 纯文本证据单元 | `See manufacturing & quality` |
| H04 | 不同产品怎样进入生产和交付 | 一个项目接口、三类制造环境、五阶段交付路径 | WP 61、78、155 分产品线展示 | `How projects are developed` |
| H05 | 我现在应该提供什么 | 型号、图纸/3D/样件、应用需求三种起点 + 统一询盘 | 简洁强调色收口，不再加第二组产品图 | `Request a project review` |

H02 与 H03 不得互相重复：H02 回答“做什么”，H03 回答“凭什么能做”。H04 不再罗列能力名，而是解释项目怎样被路由到负责制造方并形成批准交付。

## 2. 从 2N 参考中保留与舍弃的内容

### 2.1 保留

- 全视口深色 Hero 和单一强视觉。
- Hero 后迅速给出清晰的业务入口，不在首页写成长篇公司史。
- 六项短能力单元的 3×2 桌面节奏。
- 大标题、短正文、充足留白、深浅交替和强收口。
- Header 透明转实色、轻微视差、滚动显现、固定询盘入口。

### 2.2 舍弃

- 2N 的品牌、Logo、轮毂文案、车型图、产品图片和 Gallery 资产。
- 单一锻造轮毂分类、Aggressive Fitment、Deep Concave 等轮毂专属叙事。
- `Factory Direct`、固定交期、固定性能数字等未经峰徊证据支持的主张。
- 首页三张轮毂展示和全屏 Gallery；峰徊需要四线等权和制造证据。
- 双图换角悬停效果；峰徊当前没有四线一致的双视角素材。

## 3. 可直接录入的英文内容

### H01：公司级 Hero

**Eyebrow**

`FOUR PRODUCT LINES · ONE PROJECT INTERFACE`

**H1**

`Automotive components backed by specialized manufacturing`

**Lead**

`Fenghuai coordinates overseas projects across wheels, EV housings, custom aluminum components and self-sealing tires—from requirement review and engineering input to production documentation.`

**Relationship disclosure**

`Manufacturing is carried out across our specialized production bases. The responsible facility, capability, certification and supply scope are confirmed for each project.`

**Primary CTA**

`Explore product lines` → `#product-lines`

**Secondary CTA**

`Request a project review` → `/request-a-quote`

**Hero 角标**

`Our wheel manufacturing facility`

角标仅在 WP 114 获准后显示，并明确照片的产品线与归属。没有批准主图时使用现有设计令牌生成的工业纹理背景，不能回退到竞品汽车图片。

### H02：四条产品线

**Eyebrow**

`PRODUCT LINES`

**H2**

`Four product lines, each with its own engineering route`

**Intro**

`Choose the line that matches the part or supply requirement. Product data, manufacturing route and validation evidence are reviewed within that line rather than treated as one universal process.`

#### Card 1 — Wheels

- Title：`Wheels`
- Label：`Recorded models · Flow formed · Custom forged`
- Body：`Browse approved wheel specifications, review recorded flow-formed routes, or start a custom forged wheel program.`
- CTA：`Explore wheels` → `/products/wheels`
- Media：一个完整批准的 `WheelModel.images[0]`

#### Card 2 — EV aluminum housings

- Title：`EV Aluminum Housings`
- Label：`Motor · Controller · Inverter`
- Body：`Engineering assessment for water-cooled motor, die-cast motor and controller or inverter housing projects.`
- CTA：`Review EV housing categories` → `/products/ev-components`
- Media：WP 49；主体、类别与图权批准后显示

#### Card 3 — Custom aluminum development

- Title：`Custom Aluminum Development`
- Label：`2D drawing · 3D data · Physical sample`
- Body：`Start a drawing- or sample-led assessment for an aluminum component outside the defined wheel and EV housing categories.`
- CTA：`Start with your input` → `/products/custom-aluminum`
- Media：2D/3D/Sample 抽象输入图形；不使用三电产品图冒充

#### Card 4 — Self-sealing tires

- Title：`Self-Sealing Tires`
- Label：`Technology · Testing · Supply review`
- Body：`Review the self-sealing concept, documented test conditions and the information needed to discuss an applicable tire program.`
- CTA：`Review self-sealing tires` → `/products/safety-tires`
- Media：WP 153；品牌和供应授权获批后显示

卡片全部加内部状态字段。某条线媒体未批准时使用该线的品牌占位图，不借用另一条线的产品图。

### H03：制造与技术能力

**Eyebrow**

`MANUFACTURING AND ENGINEERING`

**H2**

`Capability is useful only when its scope and evidence are clear`

| 编号 | 英文标题 | 英文正文 | 证据边界 |
|---:|---|---|---|
| 01 | `Engineering review` | `Drawings, 3D data, samples and application requirements are reviewed before a route is confirmed.` | 具体分析只对批准项目有效 |
| 02 | `Casting and forming routes` | `Gravity casting, low-pressure casting, flow forming, die casting and forging are route options across defined product lines.` | 不是每个产品都经过全部工艺 |
| 03 | `Precision machining` | `Critical bores, faces, interfaces and datums are machined and inspected against the approved drawing.` | 不公开通用公差值 |
| 04 | `Product-specific processes` | `Joining, coating, heat treatment or sealing-layer application is included only where the approved product route requires it.` | 不写成同一工厂的一条总流水线 |
| 05 | `Inspection and validation` | `Dimensions, balance, leak boundaries, fatigue or puncture conditions are planned for the applicable product and market.` | 设备图不等于产品合格报告 |
| 06 | `Documented evidence` | `Certificates, test reports and inspection records are checked for the legal entity, scope, product and validity.` | 不做无主体的徽章墙 |

**CTA**

`See manufacturing & quality` → `/capabilities`

H03 采用 3×2 文本单元，不为每个单元塞图标或数字。每项可以带小型 `Applies to` 标签，但标签必须来自内容数据，不能让所有能力默认覆盖四条线。

### H04：制造组织与交付路径

**Eyebrow**

`FROM REQUIREMENT TO APPROVED SUPPLY`

**H2**

`One project interface, product-specific manufacturing routes`

**Lead**

`Fenghuai coordinates one commercial and project interface in Shenzhen across our specialized manufacturing bases. The responsible facility, process route, validation plan and document set are confirmed for the selected product line.`

**五阶段**

| 阶段 | 标题 | 英文正文 |
|---:|---|---|
| 01 | `Define the requirement` | `Start from a recorded wheel variant, a drawing, 3D data, a sample or a tire supply requirement.` |
| 02 | `Confirm the responsible route` | `Identify the manufacturing entity, process scope, engineering owner and evidence needed for the project.` |
| 03 | `Select or develop the product` | `Review an existing specification, or proceed through tooling, trial and first-article work where development is required.` |
| 04 | `Inspect and approve` | `Evaluate agreed characteristics and applicable validation evidence before the supply baseline is released.` |
| 05 | `Supply with records` | `Confirm repeatability, traceability, packaging and the documents required for the approved order or batch.` |

**证据图组**

| 标签 | 媒体 | 公开说明 |
|---|---|---|
| `Our wheel manufacturing base` | WP 61 | 轮毂铸造车间；不扩写成所有轮毂的固定连续流程 |
| `Our aluminum component base` | WP 78 | 机加工车间；不扩写成所有铝制品的统一路线 |
| `Our self-sealing tire production base` | WP 155 | 热熔喷涂机械臂产线；不扩写未核验的性能结果 |

**CTA**

`How projects are developed` → `/custom-development`

### H05：询盘收口

**Eyebrow**

`START WITH WHAT YOU HAVE`

**H2**

`Send a model, a drawing or the requirement you need to solve`

**Body**

`Tell us the product line, destination market and what information is already available. We will use the enquiry reference to continue the specification and evidence review.`

**三个输入提示**

- `Recorded model or complete wheel specification`
- `2D drawing, 3D data or authorized physical sample`
- `Application, quantity, market and required documents`

**Primary CTA**

`Request a project review` → `/request-a-quote`

**Secondary CTA**

`Explore all product lines` → `/products`

不在首页嵌入长表单，不显示固定回复时限、MOQ、报价或交期。`/request-a-quote` 根据来源带入 `source_page=home`；个人客户不被公司必填字段挡住。

## 4. 媒体绑定与发布条件

| 视口 | 媒体 | 版式 | 发布条件 | 禁止表述 |
|---|---|---|---|---|
| H01 | WP 114 | 桌面全屏背景，焦点中心偏下；移动 4:5 专用裁切 | 已批准用于集团轮毂制造基地展示 | 四线全部在此生产 |
| H02 Wheels | 批准 `WheelModel.images[0]` | 4:3 或 1:1，`object-contain` | 型号、图权、供货、规格批准 | 车型适配、现货 |
| H02 EV | WP 49 | 4:3，保留管口和内孔 | 主体、类别、项目归属、图权批准 | 已验证 HPDC/摩擦焊性能 |
| H02 Custom | 抽象输入图形 | 4:3，使用设计令牌 | 无产品图依赖 | 虚构定制案例 |
| H02 Tire | WP 153 | 桌面宽幅裁切，卡片内保持轮胎主体 | LOAKE/品牌、图权、供应关系批准 | 永不爆胎、适用所有损伤 |
| H04 Wheel | WP 61 / 116 | 两张中选一张主图或双卡 | 每图分别标制造主体、工艺与图权 | 所有轮毂的固定流水线 |
| H04 Aluminum | WP 78 / 38 | 4:3 | 场景含义、主体和图权批准 | WP 38 是焊接/泄漏检测 |
| H04 Tire | WP 155 | 受控 16:9，不放大失真 | 已批准用于集团自密封轮胎生产基地展示 | 未核验性能结果 |

WordPress 已上传不等于批准。任何未批准媒体由 `hasRender/approvalStatus` 兜底，不请求不存在文件，不显示空白框。

### Hero 视频升级条件

视频不是首发必需项。将来只有满足以下条件才替换 H01 静态图：

1. 8–12 秒可无缝循环、无竞品 Logo 和无未授权人员特写。
2. 明确制造主体、地点、产品线、可公开工序和图权。
3. 同时提供 poster、移动裁切和静态降级图。
4. `muted`、`playsInline`；reduced-motion 或数据节省模式下只显示 poster。
5. LCP 与移动流量预算通过，不延迟 H1 和主要 CTA。

## 5. 内容接缝

建议 WordPress 适配后的稳定视图：

```ts
type HomepageContent = {
  hero: {
    eyebrow: string;
    heading: string;
    lead: string;
    relationshipDisclosure: string;
    media: MediaAsset;
    mediaScopeLabel: string;
    actions: CtaLink[];
  };
  productLines: ProductLine[];
  capabilities: Array<{
    id: string;
    title: string;
    body: string;
    appliesTo: ProductLineSlug[];
    evidenceStatus: "supplier-stated" | "verified";
  }>;
  delivery: {
    lead: string;
    stages: DevelopmentStage[];
    evidenceMedia: MediaAsset[];
  };
  closing: {
    heading: string;
    body: string;
    inputPrompts: string[];
    actions: CtaLink[];
  };
};
```

四条产品线必须与 `/products` 共用同一个 `ProductLine[]`，不能继续维护 `heroProducts` 与 `productLines` 两份会漂移的数据。组件只消费稳定对象，不直接读取 WordPress 原始 JSON，也不从媒体标题推断主体或工艺。

类型正式调整时属于内容/WordPress 契约变更，需要更新 `DECISIONS.md`。

## 6. 桌面与移动规格

### 桌面 1440×900

- H01 `min-height:100svh`，Header 覆盖在 Hero 上；内容最大宽度约 720px，主视觉保持右侧/全幅空间。
- H1、Lead、关系说明和两个 CTA 可在一个基准视口内看到；关系说明不小于正文可读尺寸。
- H02 四卡 2×2，每卡最小高度一致；图片、标题、范围、正文和 CTA 顺序统一。
- H03 3×2 能力条，边框形成网格；不使用假统计数字。
- H04 深色证据段：左侧五阶段，右侧三张按制造主体标注的证据图；不用自动轮播。
- H05 强调色浅底收口，文本与 CTA 左对齐，避免和右下固定询盘按钮重叠。

### 平板 768px

- H02 保持 2 列；H03 变为 2×3。
- H04 阶段在上、证据图在下，图组三列或横向可访问滚动。
- Header 使用移动导航逻辑时，固定询盘按钮在菜单打开期间隐藏。

### 移动 390×844

- H01 使用 4:5 专用裁切，深色叠层保证文字对比；H1 不超过四行，CTA 可换行但不超出首屏主要内容。
- H02 单列卡；不使用仅 hover 可见的信息，整卡可点且保留可见 CTA。
- H03 单列或 2 列短单元，正文保持完整，不做自动轮播。
- H04 五阶段纵向；三张证据图逐张显示并带主体/范围说明。
- H05 主 CTA 宽度适配内容，底部留出固定询盘按钮与安全区空间。
- 200% 放大无横向滚动；所有交互目标至少 44×44。

## 7. 交互模型

- Header：沿用现有透明 Hero 状态和滚动后的实色/模糊背景状态。
- H01：单张图片轻微 `data-parallax-media`；不使用自动轮播，避免四线定位被不同汽车照片带偏。
- H02：卡片 hover 只做轻微图片缩放、亮度和边框变化；键盘 focus 呈现同等状态。
- H03/H04：使用 `data-reveal-group` 的有限错峰；无 JS 时内容必须可见。
- reduced-motion：关闭视差和位移动画，保留即时状态变化。
- 不在页面组件里新增 IntersectionObserver；所有动效继续由 `site-motion.tsx` 管理。
- 固定询盘按钮不可遮挡 H05 主 CTA；移动菜单打开时不可点击。

## 8. SEO 与结构化数据

**Title**

`Fenghuai | Wheels, EV Housings, Custom Aluminum & Self-Sealing Tires`

**Description**

`Explore Fenghuai's four automotive product lines, specialized manufacturing capabilities and project routes for wheels, EV aluminum housings, custom aluminum components and self-sealing tires.`

- canonical 使用经过构建环境核对的正式首页 URL。
- `Organization` 只输出已确认的正式名称、URL、Logo 和联系方式；未确认地址、成立年份、工厂面积不输出。
- 四条产品线可用 `ItemList` 链接到四个入口，不把能力页输出成带价格/库存的 Product/Offer。
- H01 关系说明和可见正文必须与 metadata 一致；品牌层使用集团制造基地口径，法人文件仍按实际主体。
- 所有公开图片使用准确 alt；纯装饰叠层 alt 为空。

## 9. 当前实现替换要求

1. `HomeHero` 从三张汽车场景轮播收敛为一个批准制造视觉；删除当前未核准的 `Factory-direct` 和轮毂偏重文案。
2. `homepage-hero.ts` 的 `heroProducts` 与 `product-lines.ts` 合并为单一四线数据源；避免顺序和内容漂移。
3. `ProductShowcase` 保留 2×2 结构，文案和媒体改用 H02 规定；`Four lines, one factory` 改成不混淆制造主体的标题。
4. `TrustStrip` 六项替换为 H03 内容；删除 `under one roof`、`factory direct`、无证据 private label 和具体检测能力。
5. 删除首页 `WheelStripSection`。轮毂实物型号留在轮毂目录，首页不再让轮毂获得第五个独占模块。
6. H04 项目组织与制造证据段分别绑定已批准的 WP 61、78、155。
7. `DealerCta` 按 H05 改为 `/request-a-quote`，不再使用当前“process route/tooling/pricing 一定回复”的结果式承诺。
8. 首页不链接空 Gallery，不创建没有授权素材的画廊承诺。
9. 文案继续位于 `src/content/`；组件使用设计令牌、声明式动效和批准媒体兜底。
10. 改造前阅读当前 Next.js 版本的 `node_modules/next/dist/docs/` 相关指南。

## 10. 验收清单

- [ ] 首屏在一句 H1 内表达公司级汽车零部件制造定位，不再像单一轮毂品牌。
- [ ] 四条产品线同层级、同卡片结构、同视觉权重，顺序全站一致。
- [ ] 首页没有第五个轮毂独占展示段，也没有竞品三类轮毂分类。
- [ ] 六项能力均有适用范围与证据状态，不写 `under one roof` 或无主体 `factory direct`。
- [x] WP 114 已批准为轮毂制造基地视觉，并限定轮毂范围，不暗示四线在同一厂区生产。
- [ ] H04 三类制造环境分别标注主体和产品线，不拼成一条虚假总流水线。
- [ ] 没有未经核准的产能、专利、面积、客户数、交期、MOQ、性能或认证数字。
- [ ] Custom Aluminum 卡没有使用三电壳体冒充案例；轮胎图完成品牌和图权批准。
- [ ] 所有媒体都有来源、主体、usage scope、图权、alt、caption 和批准状态。
- [ ] H01 静态降级可用；无 JS、reduced-motion 和数据节省模式下核心内容完整。
- [ ] 移动 390px、平板 768px、桌面 1440px 逐视口验收，200% 放大无横向滚动。
- [ ] Header、卡片、固定询盘按钮、键盘 focus 和移动导航状态通过。
- [ ] `/request-a-quote` 正确收到 `source_page=home`，个人客户不强制公司字段。
- [ ] metadata、Organization/ItemList、canonical、OG 和 sitemap 使用正式构建 URL。
- [ ] 全站扫描没有 `2nforged` 路径、品牌、文案、图片或视频残留。
- [ ] 实现阶段 lint、typecheck、build 和本地生产实例冒烟通过。

## 11. 关联资料

- [2N 首页适配记录](../resources/research/2026-10-05-2n-homepage-reference.md)
- [英文首发总视口规格](2026-10-04-launch-viewport-spec.md)
- [About 轮毂制造合作方模块](about-wheel-factory.md)
- [轮毂制造与质量能力](capabilities-wheel-manufacturing.md)
- [新能源三电铝制品](ev-components.md)
- [定制铝制品](custom-aluminum.md)
- [自密封轮胎](self-sealing-tires.md)
