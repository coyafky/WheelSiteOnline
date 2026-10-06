# 锻造轮毂高端定制 Page SPEC

- 路由：`/products/wheels/forged`
- 页面类型：锻造轮毂产品线能力页，不是型号目录
- 视口：WF01–WF06，共 6 个核心问题视口
- 状态：页面代码与内容接缝已实现；WP 媒体批量读取保留本地 fallback；WF05 因证据不足不渲染；WordPress 后台标题/元数据修正仍需另行录入
- 公开语言：英文优先
- 来源：航鹏画册 PDF 第 4 页（画册印刷页 05–06）、用户提供的“高端定制”页面、WordPress 本地媒体库
- 主要受众：有锻造轮毂定制需求的品牌方、经销商、改装项目方和个人客户

## 1. 页面目标与叙事

这个页面回答“峰徊能否协调一个锻造轮毂定制项目，以及项目怎样开始”。它不承担库存目录、车型适配表或认证证书墙的职责。

| 视口 | 客户问题 | 主信息 | 主视觉 | 主行动 |
|---|---|---|---|---|
| WF01 | 这里能支持什么锻造轮毂项目 | 峰徊作为深圳项目接口，协调工程评估、制造与检查 | 一张已确认的锻造轮毂示例 | `Start a forged wheel project` |
| WF02 | 材料和设计路线怎样确定 | 铝合金/镁合金是项目选项；用途、载荷、市场、几何与表面要求决定路线 | 两张材料示例；镁合金图未入库时只显示铝合金图 | 查看需要提交的输入 |
| WF03 | 设计如何变成锻坯 | 材料确认、加热/成形、压力机、锻坯检查组成受控路线 | 锻造压力机 + 热锻候选小图 | 无强制 CTA |
| WF04 | 锻坯怎样完成为成品 | 探伤、CNC、表面处理、产品检查分别解决不同问题 | 四张制造卡 | 查看制造与质量能力 |
| WF05 | 装车图片能证明什么 | 只作项目风格参考；没有型号、规格、授权与适配证据就不发布品牌适配结论 | 经审核的装车案例画廊；未审核时整个视口隐藏 | 询问类似项目 |
| WF06 | 为了评估项目要提供什么 | 应用、真实规格组合、刹车间隙、载荷/市场、数量、表面与资料状态 | 输入清单 + 紧凑询盘入口 | `Start a forged wheel project` |

顺序遵循采购与定制决策：先确认可支持的项目，再确定材料和设计边界，然后理解成形与后续制造，最后用真实输入发起评估。不要把原画册左右两页直接做成一个网页长图。

## 2. 事实与发布边界

### 2.1 当前资料可以证明

- 画册展示了锻造铝合金和锻造镁合金轮毂示例，但没有给出可公开销售的型号、变体或测试报告。
- 图片展示了锻造压力机、热锻成形、锻坯探伤、CNC 加工、表面处理样件和产品检查场景。
- 这些图片可以说明制造合作方资料覆盖锻造成形与后续制造环节；具体设备、材料、检查频次和供应范围仍按项目确认。
- 画册含六张装车图片，只能作为来源线索，不能单独证明车型适配、客户关系或公开使用授权。

### 2.2 未取得证据前禁止公开

- “轻 10–20%”“镁合金再轻 30%”等比例。比较基准、设计、尺寸、载荷和测试条件均不完整。
- “万吨锻造机”、`6061`、一体锻造成形或固定材料牌号。必须取得设备清单、材料文件及负责制造主体确认。
- “适用于保时捷、奔驰、宝马、路虎、奥迪、坦克”。装车照片不是适配证明。
- “X 光检查每一件产品”“全部产品通过产品检验”。检查方法、频率和记录要由实际控制计划支持。
- “峰徊自有锻造厂”“in-house forging”。制造关系沿用 About 模块的合作制造方边界。
- 用画册中的汽车品牌、中心盖标识或车身照片暗示授权、代工客户或官方合作。
- 没有型号数据时生成锻造型号卡、假 SKU、价格、MOQ、交期或通用规格表。

## 3. 可直接录入的英文内容

### WF01：页面首屏

**Eyebrow**

`CUSTOM FORGED WHEELS`

**Heading**

`A forged wheel program built around an approved specification`

**Lead**

`Fenghuai coordinates custom forged wheel programs with the responsible manufacturing partner, from engineering input and material review through forming, machining, finish and inspection.`

**Relationship note**

`Fenghuai is your Shenzhen commercial and project interface. Manufacturing scope, available processes and validation requirements are confirmed for the actual program.`

**Primary CTA**

- Label：`Start a forged wheel project`
- Href：`/request-a-quote`
- Context：`product_line = wheels`、`wheel_process = forged`、`intent = custom_program`

**Secondary CTA**

- Label：`See manufacturing capability`
- Href：`/capabilities#wheel-manufacturing`

主图只标注 `Forged wheel design example`，不能写成现货型号或特定车型适配产品。

### WF02：材料与工程路线

**Eyebrow**

`MATERIAL AND DESIGN REVIEW`

**Heading**

`Material choice begins with the application`

**Lead**

`Wheel geometry, service conditions, target market, load assumptions, finish requirements and production quantity are reviewed before a material and process route is confirmed.`

| 选项 | 英文说明 | 发布条件 |
|---|---|---|
| `Forged aluminum` | `Forged aluminum may be considered where the approved wheel design and program requirements call for its combination of formability, strength and finish options.` | 可使用 WP ID 42；不显示减重比例或牌号 |
| `Forged magnesium` | `A forged magnesium route requires program-specific review of material supply, corrosion protection, finish, validation and target-market requirements.` | 正确图片重新入库且材料能力经制造方确认后显示 |

**Input prompt**

`Share the intended application and required specification before selecting a material route.`

材料卡不做“铝 vs 镁”的绝对性能排名，也不把画册示意图当已验证产品。

### WF03：锻造成形

**Eyebrow**

`FORGING ROUTE`

**Heading**

`An approved billet is formed for the machining stage`

| 步骤 | 英文标题 | 英文说明 |
|---|---|---|
| 01 | `Material and billet review` | `Material identity and the billet route are confirmed against the approved program requirements before forming.` |
| 02 | `Controlled heating and forming` | `The forming plan is established for the selected material, geometry and manufacturing route.` |
| 03 | `Forging operation` | `The responsible manufacturing team confirms the press, tooling and process settings required for the approved design.` |
| 04 | `Forged blank inspection` | `The forged blank is evaluated against the defined checkpoints before machining continues.` |

**Boundary note**

`Equipment images demonstrate an available process environment. Press capacity, alloy grade, inspection method and production availability are confirmed for the actual program.`

这里使用流程说明而不是固定参数表。压力机和热锻原图分辨率低，只能做步骤小图，不能通栏放大。

### WF04：专业制造与检查

**Eyebrow**

`FROM FORGED BLANK TO FINISHED WHEEL`

**Heading**

`Each manufacturing step answers a different requirement`

| 卡片 | 英文标题 | 英文说明 |
|---|---|---|
| 1 | `Forged blank inspection` | `An applicable inspection method may be used to evaluate the forged blank before further processing. The method and frequency follow the approved control plan.` |
| 2 | `CNC machining` | `Controlled machining creates the approved wheel geometry, mounting interfaces and other specified features.` |
| 3 | `Finish development` | `Colour, surface preparation and coating requirements are defined against an approved finish sample and service environment.` |
| 4 | `Product inspection` | `Specified dimensions, appearance and recorded inspection status are checked before release.` |

**Boundary note**

`Process images show available manufacturing stages. They do not establish compliance for a wheel without its approved drawing, control plan and applicable records.`

**Secondary CTA**

- Label：`View wheel manufacturing and quality`
- Href：`/capabilities#wheel-manufacturing`

### WF05：装车案例候选

这个视口默认不发布。只有一张案例同时具备 `rights_status = approved`、已识别轮毂型号、实际规格、项目关系和适配审核记录时，才进入公开画廊。

**Eyebrow**

`PROJECT REFERENCES`

**Heading**

`See the design in its intended vehicle context`

**Lead**

`Approved project imagery can help communicate style and application intent. Final fitment always depends on the verified wheel specification, vehicle data and brake clearance.`

**Required note**

`Vehicle images are project references only. Vehicle manufacturers do not sponsor or endorse Fenghuai unless explicitly stated.`

在证据不足时，不用六张来源图拼成“Porsche / Mercedes / BMW / Land Rover / Audi / Tank fitment”画廊。若未来仅取得图片发布权但没有适配资料，可使用 `Performance coupe`、`Luxury sedan`、`SUV application` 等中性分类，并继续保留适配边界说明。

### WF06：项目输入与询盘

**Eyebrow**

`START WITH THE PROJECT INPUTS`

**Heading**

`Share what is known; the engineering review can define what is missing`

**Required inputs**

- `Vehicle or application`
- `Target diameter and width`
- `Required PCD, offset and centre bore, if known`
- `Brake-clearance or package constraints`
- `Target market and validation requirements`
- `Expected quantity and program timing`
- `Finish, colour and branding requirements`
- `Available drawing, 3D model, scan or reference sample`

**Helper text**

`You do not need a complete drawing to start a discussion. Unknown values remain open until they are reviewed and approved; they are not filled with generic specifications.`

**Primary CTA**

- Label：`Start a forged wheel project`
- Href：`/request-a-quote`
- Context：`product_line = wheels`、`wheel_process = forged`、`intent = custom_program`

**Secondary CTA**

- Label：`Contact the project team`
- Href：`/contact`

## 4. WordPress 媒体映射

以下结果按来源原图与 WordPress 媒体实际像素比对得出，不能根据当前标题选图。当前媒体标题错位严重，且 `alt_text`、caption、图权字段尚未完成。

### 4.1 可以绑定的媒体

| 用途 | WP ID | 实际内容 | 当前 WP 标题 | 上线前标题 | 必填 alt |
|---|---:|---|---|---|---|
| WF01/WF02 锻造铝轮毂示例 | 42 | 画册锻造铝合金轮毂 | `锻造_锻压成型设备` | `锻造_铝合金轮毂示例` | `Forged aluminum wheel design example for a custom program` |
| WF03 锻造压力机 | 29 | 锻造压力机 | `锻造_锻坯X射线探伤` | `锻造_压力机` | `Forging press at the partner manufacturing facility` |
| WF04 锻坯探伤 | 58 | 锻坯探伤画面 | `制造_X光探伤` | `制造_锻坯探伤` | `Inspection of a forged wheel blank before machining` |
| WF04 CNC | 70 | CNC 精密加工 | `制造_CNC精密加工` | 保持 | `CNC machining of an approved custom wheel design` |
| WF04 表面处理样件 | 30 | 两只不同颜色轮毂样件 | `锻造_涂装与终检` | `制造_轮毂表面处理样件` | `Wheel finish samples used for colour and appearance review` |
| WF04 产品检查 | 76 | 操作员检查轮毂 | `制造_喷涂工序` | `制造_轮毂产品检查` | `Operator carrying out a product inspection on a wheel` |

说明：WP ID 40 与 58 是同一张探伤图，ID 14 与 70 是同一张 CNC 图，ID 69 与 30 是同一张表面样件图。本规格绑定 58、70、30；重复项先标记，不删除。

### 4.2 尚未正确入库

| 素材 | 来源候选 | 当前状态 | 页面处理 |
|---|---|---|---|
| 锻造镁合金轮毂示例 | `outputs/hangpeng-wheel-media/forged-examples/hangpeng-p04-forged-magnesium-example.webp` | WordPress 未找到像素匹配项；来源图层与画册中心盖外观有差异 | WF02 先不显示镁合金图片；审核品牌/图权后再导入 |
| 热锻成形画面 | `outputs/hangpeng-wheel-media/manufacturing/hangpeng-p04-hot-forging.webp` | WordPress 未找到匹配项；201×283，分辨率低 | WF03 可无图发布；后续只作小步骤图，不作主视觉 |
| 宝马装车图 | `outputs/hangpeng-wheel-media/vehicle-examples/hangpeng-p04-vehicle-example-bmw.webp` | 未入库，图权与适配未核准 | 不公开 |
| 奥迪装车图 | `outputs/hangpeng-wheel-media/vehicle-examples/hangpeng-p04-vehicle-example-audi.webp` | 未入库，图权与适配未核准 | 不公开 |
| 坦克装车图 | `outputs/hangpeng-wheel-media/vehicle-examples/hangpeng-p04-vehicle-example-tank.webp` | 未入库，图权与适配未核准 | 不公开 |

### 4.3 当前被错命名的装车图片

| WP ID | 实际内容 | 当前错误标题 | 正确内部标题 | 公开状态 |
|---:|---|---|---|---|
| 88 | 保时捷装车图 | `锻造_锻造铝合金轮毂` | `案例候选_保时捷装车图` | 待图权、项目关系、轮毂型号与适配审核 |
| 56 | 奔驰装车图 | `锻造_锻造镁合金轮毂` | `案例候选_奔驰装车图` | 同上 |
| 91 | 路虎装车图 | `锻造_锻压成型红热锻件` | `案例候选_路虎装车图` | 同上 |

这三张图片不得用于 WF01–WF04 的产品或制造步骤。即使修正标题，也要保持 `publication_status = draft`，直到 WF05 的全部门槛满足。

### 4.4 媒体后台字段

每张候选媒体至少补齐：

- `source_entity`：负责制造主体
- `source_document = 航鹏画册组最终稿(1).pdf`
- `source_page = PDF 4 / printed 05–06`
- `rights_status = pending | approved | rejected`
- `content_role = product_example | process | inspection | project_reference`
- `fitment_verified`：仅案例图使用，默认 `false`
- `wheel_model`、`verified_spec`：仅真实案例存在时填写
- `approved_by`、`approved_at`

前端按媒体 ID 或稳定资源对象读取，不硬编码 `localhost:8081` URL。原始画册带水印，整页截图不得进入公开站点。

## 5. 内容接缝

正式改 `src/content/types.ts` 时需记录契约决策。建议页面数据形状：

```ts
type ForgedWheelCustomizationPage = {
  slug: "forged";
  status: "draft" | "approved";
  hero: ForgedWheelViewport;
  materialReview: ForgedWheelViewport;
  forgingRoute: ForgedWheelViewport;
  completion: ForgedWheelViewport;
  projectReferences?: ProjectReferenceViewport;
  inquiryInputs: ForgedWheelViewport;
};

type ForgedWheelViewport = {
  id: "WF01" | "WF02" | "WF03" | "WF04" | "WF06";
  eyebrow: string;
  heading: string;
  lead?: string;
  items?: Array<{
    id: string;
    title: string;
    body: string;
    media?: MediaAsset;
  }>;
  boundaryNote?: string;
  primaryCta?: ActionLink;
  secondaryCta?: ActionLink;
  publicationStatus: "draft" | "approved";
};

type ProjectReferenceViewport = {
  id: "WF05";
  items: Array<{
    media: MediaAsset;
    publicLabel: string;
    wheelModel: string;
    verifiedSpec: string;
    rightsStatus: "approved";
    fitmentVerified: true;
  }>;
};
```

`ProjectReferenceViewport.items` 为空时，WF05 整段不渲染。组件不读取 WordPress 原始字段，不硬编码英文营销文案；WordPress 适配器先转换成稳定契约。

## 6. 桌面视口规格

基准：1440×900；补测 1280×800。所有段允许根据内容自然增高，不强制 `100vh`。

### WF01

- 12 列网格：左侧 5 列为定位、关系说明和 CTA；右侧 7 列为单张轮毂示例。
- 主图完整展示轮毂轮廓，不裁掉轮辋边缘；中心盖如存在第三方标识，必须使用已获准版本或处理后的自有标识图。
- 首屏只说明项目能力，不放材料比例、适配品牌、认证 Logo 或假型号。

### WF02

- 标题与 Lead 占上方；下方采用两张材料路线卡。
- 镁合金图片未批准时，使用“铝合金图 + 镁合金文字卡”布局，不用汽车装车图顶替。
- 两卡只解释决策条件，不做数字对比图表。

### WF03

- 左侧为四步路线，右侧为压力机与热锻小图组；热锻图未入库时只显示压力机一张小图和边界说明。
- 不在设备照片上叠加“10,000 TON”“6061”等未核准数字。
- 步骤使用 HTML 文本；信息不能只藏在视频或图片内。

### WF04

- 四张卡以 2×2 或四列布局展示探伤、CNC、表面处理、检查。
- 每张卡的标题说明该环节解决的问题，不把四张图画成“每个轮毂固定依次经历”的强制流程。
- 图片统一 1:1 容器，使用焦点裁切；产品检查图必须保留操作员与轮毂主体。

### WF05

- 只有至少 3 个已审核案例时才显示此视口；不足 3 个时并入后续项目内容，不建空画廊。
- 桌面为 3 列画廊，卡片显示中性应用标签、真实轮毂型号与经核准规格。
- 汽车品牌名、Logo 和“fitment”文案只有在权利和适配记录完成时出现。

### WF06

- 左侧 7 列为分组输入清单，右侧 5 列为 CTA 与“资料不完整也可开始”的辅助说明。
- 不在页面复制完整表单；CTA 进入统一询盘流程并保留上下文。
- 如果嵌入短表单，仍使用现有服务端校验和询盘契约，不另建第二套提交逻辑。

## 7. 移动视口规格

基准：390×844；补测 360×800。

- 内容顺序统一为标题 → 说明 → 图片/卡片 → 边界说明 → CTA。
- WF01 先显示标题与 CTA，再显示完整轮毂图；主行动在首个正常视口内可见。
- WF02 单列；镁合金卡没有图片时不保留空白媒体框。
- WF03 四步自然滚动，压力机和热锻小图不做横向滑动的关键内容。
- WF04 四张卡单列或 2 列小图 + 单列正文；关键说明不可依赖 hover。
- WF05 若获准上线，案例单列或 2 列；图片 alt 描述场景，不把未验证车型写进 alt。
- WF06 输入清单分为 `Application`、`Wheel specification`、`Program` 三组；CTA 全宽。
- 200% 放大无横向滚动；互动目标至少 44×44；无 JavaScript 时正文、图片与 CTA 仍可见。

## 8. SEO 与路由

**建议 title**

`Custom Forged Wheels | Engineering & Manufacturing Support | Fenghuai`

**建议 description**

`Discuss a custom forged wheel program with Fenghuai, from application and material review through forging, CNC machining, finish and inspection.`

**建议 H1**

`Custom forged wheels built around your program`

- 本页是能力/定制意图页，canonical 为正式域名下的 `/products/wheels/forged`。
- 不用未验证的 `forged wheels for Porsche` 等品牌适配关键词。
- 没有真实 SKU 时不生成 Product schema、价格、库存、评分或型号 sitemap。
- 可以使用 `Service` 或普通 WebPage 语义；主体必须是峰徊对外角色，制造关系在正文可见。
- 当前静态路由尚不存在；实现时新建 `/products/wheels/forged`，并验证它不会落入 `/products/wheels/[model]` 的型号模板。

## 9. 现有实现的替换要求

1. 不从现有虚构 `wheel-skus.ts` 生成锻造产品卡。
2. 不把 WP ID 88、56、91 按当前错误标题绑定为产品/工艺图。
3. 页面文案通过 `src/content/` 接缝或 WordPress 适配器进入组件。
4. 素材继续使用 `hasRender`/批准状态兜底；图片缺失时不请求不存在 URL。
5. 动效只使用现有 `data-reveal`、`data-reveal-group`、`data-parallax-media` 声明。
6. 组件只使用设计令牌，不写裸 hex。
7. 询盘 CTA 传递锻造轮毂上下文，但不把未核准规格预填成事实。

## 10. 验收清单

- [ ] WF01–WF06 分别回答定位、材料、锻造、后续制造、案例和项目输入六个不同问题。
- [ ] 页面被实现为锻造定制能力页，没有假型号、假库存、价格、MOQ 或车型适配表。
- [ ] WP ID 42、29、58、70、30、76 按实际像素绑定，错误标题已修正。
- [ ] WP ID 88、56、91 不再被当成铝轮毂、镁轮毂或热锻图。
- [ ] 镁合金示例与热锻图未正确入库时，页面有完整无破图的降级布局。
- [ ] WF05 在图权、项目关系、型号、规格和适配记录不完整时完全隐藏。
- [ ] 页面不出现未核准减重比例、万吨设备、6061、逐件 X 光、认证或品牌适配主张。
- [ ] 峰徊与制造合作方的角色说明在 WF01 可见。
- [ ] CTA 带入 `product_line = wheels`、`wheel_process = forged`、`intent = custom_program`。
- [ ] 桌面 1440×900、1280×800 与移动 390×844、360×800 截图通过。
- [ ] 200% 放大、键盘导航、无 JavaScript 和图片加载失败场景通过。
- [ ] SEO metadata、canonical、OG URL 使用正确的 `NEXT_PUBLIC_APP_URL` 构建值。
- [ ] 新静态路由返回 200，无效型号继续返回真实 404。
- [ ] 实现阶段的 lint、typecheck、build 与本地生产实例冒烟通过。
