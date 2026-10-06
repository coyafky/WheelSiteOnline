# 新能源三电铝制品 Page SPEC

- 路由：`/products/ev-components`
- 页面类型：B2B 能力说明与工程评估入口，不是库存产品目录
- 视口：EV01–EV06
- 状态：已实现（2026-10-06）。EV01–EV06 已按本规格落地；页面只发布三类有图壳体，WP 38/24/49/20 经单次批量解析并保留本地 WebP 回退。仍待运营侧完成：四张媒体的图权、拍摄主体、产品类别、alt、caption 与批准状态录入；材料/公差/泄漏率/产能/认证等数值在取得证据前不发布。
- 公开语言：英文优先
- 内容来源：峰徊综合画册第三章 + WP 49/24/20/38
- 发布原则：图片证明“存在这类样件/场景”；工艺与性能由供应商资料主张和工程文件分别控制

## 1. 页面目标

页面帮助海外 OEM、Tier 1、系统集成商或采购工程师判断：峰徊是否能组织水冷电机壳、高压铸造电机壳、电控/逆变器壳体项目的工程评估，以及开始评估需要提交什么。

页面不发布标准 SKU、库存、通用材料牌号、公差、泄漏率、设备吨位、产能、车型适配或质量体系证书。

| 视口 | 客户问题 | 主模块 | 图片 | 主行动 |
|---|---|---|---|---|
| EV01 | 这里能对接什么 | 三类壳体定位、项目制说明、批量样件场景 | WP 38 | 查看三类壳体 |
| EV02 | 三类壳体有什么不同 | 水冷电机壳、高压铸造电机壳、电控/逆变器壳体三张产品卡 | WP 24 / 49 / 20 | 选择项目类别 |
| EV03 | 项目核心工程问题是什么 | 冷却通道、密封边界、关键接口精度三项 | 使用 EV02 局部裁切或无图 | 查看工程路线 |
| EV04 | 可能涉及哪些制造路线 | LPDC、HPDC、精密加工、摩擦焊/FSW、清洗与检测；全部标注证据状态 | WP 38 仅作批量场景 | 发起可制造性评估 |
| EV05 | 怎样证明可以交付 | 尺寸、泄漏、材料/过程、首件与目标市场文件证据矩阵 | 无伪证书图 | 请求项目证据清单 |
| EV06 | 开始评估要提交什么 | 零件类别、图纸/3D、关键接口、冷却/密封要求、数量与市场 | 统一询盘表单 | `Start an engineering assessment` |

## 2. 信息边界

### 2.1 首发只展示三类有图壳体

1. `Water-cooled motor housing`
2. `High-pressure die-cast motor housing`
3. `Controller / inverter housing`

电池托盘、端板、冷板、模组支架、控制臂、转向节、PDU、OBC、水泵壳体和阀块进入定制铝制品页的“可评估应用范围”，不在本页显示为三电现有产品。

### 2.2 证据状态

| 内容 | 当前状态 | 页面处理 |
|---|---|---|
| 三类产品名称 | `supplier-stated` | 可显示，并注明来自供应商资料 |
| 三张产品照片 | `media-present` | 图权、主体和项目归属批准后显示 |
| LPDC / HPDC 路线 | `supplier-stated` | 用“资料所述路线”，不写每张图已经验证该工艺 |
| 摩擦焊 / FSW | `supplier-stated` | 可列为项目路线，不把 WP 38 当焊接证据 |
| 尺寸与泄漏检测 | `supplier-stated` | 不给数值；项目询盘时索取验收标准 |
| 批量一致性 | `supplier-stated` | 不写产能、良率或量产客户 |
| 材料牌号、公差、泄漏率 | `missing` | 不显示数值 |
| IATF/ISO 等证书 | `missing` | 不显示认证标志 |

## 3. 可直接录入的英文内容

### EV01：首屏

**Eyebrow**

`EV ALUMINUM HOUSINGS`

**H1**

`Aluminum housings for EV motor and controller projects`

**Lead**

`Fenghuai provides a Shenzhen-based project interface for supplier-supported motor and power-electronics housing programs. Each project starts from the customer drawing, interface requirements and validation plan.`

**Scope line**

`Water-cooled motor housings · Die-cast motor housings · Controller and inverter housings`

**Boundary**

`These are engineering project categories, not stocked components. Material, process route, tolerances, sealing criteria and supply status are confirmed for each project.`

**Actions**

- `View housing categories` → `#housing-categories`
- `Start an engineering assessment` → `#engineering-assessment`

### EV02：三类壳体

**H2**

`Three housing categories in the supplied portfolio`

**Card 1 — Water-cooled motor housing**

`The supplier material describes a low-pressure-cast stator housing with an integrally formed spiral water passage. Cooling-channel geometry, pressure boundary and acceptance criteria must be reviewed against the customer drawing.`

**Card 2 — Die-cast motor housing**

`The supplier material describes high-pressure die casting, precision machining and a welded cooling route for motor-housing programs. The applicable joining method and validation plan are confirmed per part.`

**Card 3 — Controller / inverter housing**

`A machined aluminum enclosure route for controller or inverter projects, where cooling features, sealing faces, connector interfaces and mounting locations are defined by the customer design.`

每张卡下显示：`Project category — not a stock SKU`。

### EV03：三个工程问题

**H2**

`The drawing has to resolve cooling, sealing and interfaces together`

| 标题 | 英文正文 |
|---|---|
| `Cooling path` | `Confirm how the water or oil passage is formed, closed, cleaned and inspected before tooling is approved.` |
| `Sealing boundary` | `Define every pressure boundary, sealing face, joint and acceptance method. A housing photo does not establish leak performance.` |
| `Critical interfaces` | `Identify bores, bearing locations, flange faces, connector positions and datums that control assembly.` |

### EV04：制造路线

**H2**

`A process route is selected for the part, not from a fixed menu`

建议路线卡：

1. `Casting route review` — LPDC / HPDC / gravity casting as supplier-stated options.
2. `Tooling and trial` — tooling concept, trial casting and first-part review.
3. `Precision machining` — critical bores, faces, interfaces and datums.
4. `Joining and closure` — friction welding or FSW only where the approved route requires it.
5. `Cleaning and inspection` — dimensional and leak-test planning against the drawing.

固定说明：`The route above describes supplier-stated capability. It does not mean every housing uses every process or that each process is owned by the Shenzhen company.`

### EV05：证据矩阵

**H2**

`Evidence is agreed with the validation plan`

| Evidence item | Before quotation | Before sample approval | Before serial supply |
|---|---|---|---|
| Drawing revision and critical characteristics | Required | Frozen revision | Controlled revision |
| Material and process route | Proposed | Sample record | Lot traceability plan |
| Dimensional inspection | Scope agreed | First-article results | Control plan |
| Leak / pressure test | Method requested | Results where applicable | Frequency and acceptance agreed |
| Target-market documents | Requirements listed | Applicable documents reviewed | Shipment documents agreed |

表格只定义应索取的证据，不声称现有项目已经全部具备。

### EV06：工程评估

**H2**

`Start with the part and its acceptance conditions`

**Required inputs**

- `Housing category and application`
- `2D drawing and available 3D data`
- `Critical interfaces and datums`
- `Cooling medium, pressure and sealing boundary`
- `Material or performance requirements`
- `Prototype and annual quantity`
- `Target market and required documents`
- `Requested sample timing`

**CTA**

`Start an engineering assessment`

不要显示上传按钮，除非文件上传、访问控制、病毒扫描、保留周期和 NDA 流程已经实现。首发用询盘编号回复安全文件交换方式。

## 4. 图片绑定与裁切

| 模块 | WP ID | 显示比例 | 使用方式 | 不得写成 |
|---|---:|---|---|---|
| EV01 | 38 | 桌面 16:9 / 移动 4:3 | 批量壳体场景，深色渐变保证文字可读 | 焊接、密封或泄漏检测实拍 |
| EV02-1 | 24 | 4:3 | 完整显示壳体，不裁掉法兰和接口 | 可见螺旋水道 |
| EV02-2 | 49 | 4:3 | 电机壳候选，保留管口和内孔 | 已验证 HPDC/摩擦焊项目 |
| EV02-3 | 20 | 4:3 | 电控/逆变器壳候选，`object-contain` | PDU、OBC 或具体车型零件 |

所有图片在 WordPress 补齐以下字段后才把 `approvalStatus` 翻为 `approved`：主体、地点、产品类别、供应关系、图权、可公开区域、alt、caption、批准人和日期。

## 5. WordPress 内容接缝

建议内容记录：

```ts
type EvHousingPageContent = {
  hero: CapabilityHero;
  categories: Array<{
    slug: "water-cooled-motor" | "die-cast-motor" | "controller-inverter";
    publicName: string;
    body: string;
    media: MediaAsset;
    claimStatus: "supplier-stated" | "verified";
  }>;
  engineeringConcerns: ContentCard[];
  processRoutes: EvidenceCard[];
  evidenceMatrix: EvidenceRequirement[];
  inquiryChecklist: string[];
};
```

组件只消费适配后的内容，不读取媒体标题推断产品或工艺。类型落地时属于 WordPress 契约变更，需要记录决定。

## 6. 桌面与移动视口

### 桌面 1440×900

- EV01 使用约 60/40 的文字与图片布局；首屏显示 H1、三类范围、边界说明和两个动作。
- EV02 三列卡，图片高度一致；每张卡只回答一个产品类别。
- EV03 三列工程问题；EV04 用五步水平/折线流程，不能伪装成所有产品固定流水线。
- EV05 表格允许横向空间但不使用小于 14px 的正文。
- EV06 为左清单、右询盘摘要；正式表单复用统一询盘组件。

### 移动 390×844

- EV01 图片在文案之后，避免文字压在复杂工厂照片上。
- EV02 单列，顺序为水冷电机壳 → 电机壳 → 电控/逆变器壳。
- EV04 变为纵向步骤；EV05 变为逐项证据卡，不建立横向滚动表。
- 所有 CTA 至少 44×44，200% 放大无横向滚动。

## 7. SEO 与询盘

**Title**

`EV Motor & Controller Aluminum Housings | Engineering Assessment | Fenghuai`

**Description**

`Review supplier-supported aluminum housing categories for EV motor and controller projects, then submit drawing, cooling, sealing and volume requirements for engineering assessment.`

- 页面是能力页，可输出 `Service`，不能输出带价格或库存的 `Product/Offer`。
- 图片 alt 不加入具体客户、车型、材料牌号或未经确认工艺。
- 询盘上下文固定带 `product_line=ev-components`、选中 category、页面来源和证据需求。
- 表单提交走统一 `/api/inquiries`，成功和失败必须反映真实服务状态。

## 8. 现有实现替换要求

当前页面和 `src/content/ev-components.ts` 已有较完整结构，但实施本规格时必须：

1. 将 15 个部件类型收敛为三类有图壳体；其余应用移到定制铝制品页。
2. 用 WP 38/24/49/20 和批准元数据替换直接 public 资源绑定。
3. 删除或降级没有本线证据的油冷壳体、PDU/OBC、电池托盘、冷板、X-ray 与完整受控流程主张。
4. 把气密、精度、材料和质量体系改为项目输入/证据要求，不能写成已经满足的结果。
5. 保留“工程评估而非直接报价”的 CTA 逻辑。
6. 不使用 `in-house`、`our plant` 或深圳自有制造表述；制造关系遵循合作方边界。
7. 所有文案继续位于 `src/content/`，组件使用设计令牌和声明式动效。

## 9. 验收清单

- [ ] 页面只把三类有图壳体作为首发产品类别，不展示虚构 SKU 或库存。
- [ ] WP 38 不被称为焊接/密封/泄漏检测照片。
- [ ] WP 24 的隐藏水道不被描述成“图中可见”。
- [ ] LPDC、HPDC、摩擦焊和 FSW 均有供应商资料状态，不由照片自动证明。
- [ ] 未发布材料、公差、泄漏率、压力、产能、客户或车型数字。
- [ ] 尺寸、泄漏、首件和目标市场文件以证据要求呈现。
- [ ] 页面明确峰徊是深圳项目接口，制造主体待关系文件确认。
- [ ] 四张图片完成图权、主体、类别、alt、caption 和批准状态。
- [ ] 移动 390px 无图片裁切、横向滚动或不可读表格。
- [ ] 表单携带类别和工程输入，失败不显示假成功。
- [ ] metadata、Service schema、canonical 和 robots 正确。
- [ ] 实现阶段 lint、typecheck、build 与本地生产实例冒烟通过。

## 10. 参考

- [资料核验记录](../resources/research/2026-10-05-ev-custom-aluminum-source-audit.md)
- `3家公司的PPT资料/峰徊科技_A版/A科技_产品综合介绍.md` 第 03 章
- [现行首发总规格](2026-10-04-launch-viewport-spec.md)
