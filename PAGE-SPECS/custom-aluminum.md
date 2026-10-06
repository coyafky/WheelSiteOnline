# 定制铝制品 Page SPEC

- 路由：`/products/custom-aluminum`
- 页面类型：来图/来样定制能力与工程评估入口，不是标准产品目录
- 视口：CA01–CA07
- 状态：已实现（2026-10-06）。CA01–CA07 已按本规格落地；`boundary.declinedConfirmed = false`，路由实测输出 `noindex,follow` 且无 canonical。仍待业务确认：不承接清单、图片归属与图权、部分工艺的制造主体与外协边界；确认并补齐后把 `declinedConfirmed` 与 `publicationStatus` 置为已批准即可开放索引。
- 公开语言：英文优先
- 内容来源：峰徊综合画册第四章 + 工程方法候选媒体 WP 67/31/48
- 关键缺口：目前没有可确认属于非轮毂、非三电项目的定制铝制品实拍，不使用三电壳体冒充通用案例

## 1. 页面目标

页面帮助手上有图纸、3D 数据或样件的海外客户判断项目是否值得进入 DFM 评估，并收集足以开始评估的输入。页面的“产品”是从输入到首件和批量交付的开发过程，不是可直接下单的零件清单。

| 视口 | 客户问题 | 主模块 | 图片 | 主行动 |
|---|---|---|---|---|
| CA01 | 这页适合什么项目 | 来图/来样开发定位、非目录说明、三电分流 | 无产品 Hero；排版与工程输入图形 | 判断是否进入本页 |
| CA02 | 哪些应用方向可评估 | 电机减速器、电控热管理、电池结构、底盘车身四组 | 首发文字卡，不补未知产品照 | 选择应用方向 |
| CA03 | 我手上什么资料可以开始 | 2D 图纸、3D 数据、物理样件三种输入 | 文件类型图形/图标 | 准备工程输入 |
| CA04 | 工程评估会做什么 | DFM、结构分析、铸造模拟、路线评估；三张工具截图 | WP 67 / 31 / 48 | 查看证据边界 |
| CA05 | 项目怎样进入首件和量产 | 工程评估 → 模具/试制 → 检验/样品批准 → 小批/量产 | 无伪工厂流程图 | 理解开发阶段 |
| CA06 | 哪些能力已确认、哪些需逐项评估 | 工艺矩阵、承接/评估/不承接边界与发布门槛 | 无图 | 判断是否提交 |
| CA07 | 发起评估要提供什么 | 材料/功能、尺寸、公差、表面、检验、数量、市场、时间 | 统一询盘表单 | `Start a custom aluminum assessment` |

## 2. 页面与三电页的分工

### 进入三电页

客户目标明确属于以下类别时，引导至 `/products/ev-components`：

- 水冷电机壳
- 高压铸造电机壳
- 电控箱或逆变器壳体

### 留在本页

客户拥有图纸、3D 或样件，需要评估的零件不属于上述三个已定义壳体类别，或属于资料列出的更广新能源汽车铝制件范围。

固定提示：`If the part is a motor or controller housing, use the EV housing route so cooling, sealing and interface requirements are collected correctly.`

## 3. 公开范围与证据边界

### 3.1 可评估应用，不是已供货目录

| 应用组 | 资料列出的示例 | 页面表述 |
|---|---|---|
| Motor & reducer | End covers, brackets, reducer housings, oil-cooled motor housings | `Applications listed for project assessment` |
| Power electronics & thermal management | Inverter, PDU, OBC, water-pump housings, valve blocks, fittings | `Drawing-led applications; not stocked parts` |
| Battery-system structures | Battery enclosures, end plates, cold plates, module brackets | `Subject to size, sealing and validation review` |
| Chassis & body | Control arms, steering knuckles, connectors, lightweight structures | `Subject to load case, process and test review` |

这些名称只说明资料列出的评估方向。没有项目图、图号或客户批准时，不显示“已量产”“案例”或产品卡。

### 3.2 工艺证据

资料列出 `HPDC / LPDC / gravity casting / forging / CNC / FSW / surface treatment`。页面可以把它们列为“供应商资料中的可组合路线”，但必须同时说明：

- 哪些由哪一家制造主体提供尚待关系文件确认。
- 不是每个项目都会使用全部工艺。
- 没有材料、尺寸、重量、设备、产能与可达公差数字时不能推测。
- 非轮毂零件能否使用锻造、热处理、镁合金等必须逐项确认；首发不把它们写成已确认通用能力。

### 3.3 发布门槛

在以下信息完成前页面保持 `noindex,follow`：

1. 确认至少一组“不承接”类别，避免形成“什么都能做”的承诺。
2. 确认 HPDC/LPDC/重力铸造/锻造/CNC/FSW/表面处理的实际制造主体和外协边界。
3. 确认页面列出的四组应用确实可以进入供应商评估。
4. 完成工程截图的图权、项目来源和公开批准。

## 4. 可直接录入的英文内容

### CA01：首屏

**Eyebrow**

`CUSTOM ALUMINUM DEVELOPMENT`

**H1**

`Start with a drawing, 3D model or physical sample`

**Lead**

`Fenghuai coordinates drawing-led aluminum component projects through engineering assessment, tooling, first-article review and supplier-supported production.`

**Boundary**

`This is a project-development route, not a catalogue. Part feasibility, material, process, inspection, quantity and delivery plan are agreed against the customer input.`

**Actions**

- `See what can start an assessment` → `#project-inputs`
- `Start a custom aluminum assessment` → `#custom-aluminum-assessment`

Hero 不使用三电壳体、轮毂 FEA 或铸造设备作全屏背景。使用排版、线框文件图形和设计令牌构成无照片首屏，直至获得一张可公开的非三电定制铝件图。

### CA02：应用范围

**H2**

`Application areas listed for project assessment`

**Intro**

`The groups below describe where a drawing-led project may begin. They are not stocked products and do not prove that every geometry, material or validation requirement is feasible.`

卡片使用第 3.1 节四组内容。每张卡固定标签：`Assessment scope`。

### CA03：输入方式

**H2**

`Three inputs can start the engineering review`

**2D drawing**

`Provide dimensions, datums, critical characteristics, tolerance intent, material or performance requirements and the applicable revision.`

**3D data**

`Provide a neutral STEP or IGES model together with the drawing or a marked list of critical interfaces. A 3D model alone does not define acceptance.`

**Physical sample**

`Provide the sample, its known function, mating conditions and the features that must be reproduced. Reverse engineering is assessed after sample ownership and reproduction rights are confirmed.`

版权边界：不再使用 `competitor's part`。客户必须确认其有权提交、测量和复制样件。

### CA04：工程评估

**H2**

`Engineering tools support the decision before tooling`

**DFM review**

`Review geometry, critical interfaces, draft, machining access, joining, inspection and the risks that have to be closed before tooling.`

**Structural analysis example**

`The supplied material includes a structural-analysis image using wheel geometry. It demonstrates an analysis workflow example; it is not a report for a custom aluminum part.`

**Casting simulation examples**

`The supplied material includes casting-process simulation images using wheel geometry. Project-specific simulation, model assumptions and acceptance criteria must be confirmed for the actual part.`

固定证据说明：`Method examples from supplied material — not project-specific validation reports.`

### CA05：开发阶段

**H2**

`From engineering input to approved production`

| 阶段 | 标题 | 英文正文 |
|---:|---|---|
| 01 | `Engineering assessment` | `Review requirements, DFM risks, process options, evidence needs and the basis for quotation.` |
| 02 | `Tooling and trial` | `Develop the tooling route, produce trial parts and record the drawing revision used for the first article.` |
| 03 | `Inspection and sample review` | `Measure agreed characteristics and complete applicable performance checks before customer review.` |
| 04 | `Approval and engineering closure` | `Record sample approval and close agreed engineering changes before the production baseline is released.` |
| 05 | `Pilot and serial supply` | `Confirm repeatability, inspection frequency, traceability, packaging and shipment documents for the approved project.` |

不要承诺每个项目必然进入下一阶段；每一步都可能因技术、商务或合规评估停止。

### CA06：能力边界

**H2**

`What is listed, what is assessed and what still needs a boundary`

| 状态 | 内容 |
|---|---|
| `Listed in supplier material` | HPDC, LPDC, gravity casting, forging, CNC, FSW and surface treatment as possible combined routes |
| `Assessed per project` | Material, size, weight, wall section, tolerance, load, sealing, finish, inspection, tooling and volume |
| `Not yet confirmed for publication` | General size/weight envelope, achievable tolerance ranges, universal material grades, minimum order, lead time and declined categories |

不承接清单未确认时显示内部草稿提示，公开页面保持 noindex；正式上线前不能把空白“不做”列直接呈现给客户。

### CA07：询盘输入

**H2**

`Send enough information for a useful first assessment`

**Required inputs**

- `Application and part function`
- `2D drawing, 3D model or sample status`
- `Critical dimensions, datums and tolerance intent`
- `Material or performance requirements`
- `Load, cooling, sealing or environmental conditions`
- `Surface and corrosion requirements`
- `Inspection and target-market documents`
- `Prototype quantity and expected annual volume`
- `Target sample timing and destination market`

**CTA**

`Start a custom aluminum assessment`

首发不显示直接上传。如果客户勾选 `Drawing available` 或 `Sample available`，提交后由业务人员通过询盘编号提供受控交换方式。

## 5. 工程图片绑定

| 模块 | WP ID | 画面真实含义 | 版式 | 公开 caption |
|---|---:|---|---|---|
| CA04-1 | 67 | 轮毂结构分析结果；与 WP 22 重复 | 16:9，`object-contain` | `Structural-analysis workflow example shown on wheel geometry; not a project-specific report.` |
| CA04-2 | 31 | ProCAST 温度/循环铸造模拟 | 4:3，`object-contain` | `Casting-process simulation example shown on wheel geometry; assumptions require project confirmation.` |
| CA04-3 | 48 | 浇道/模型模拟界面，低分辨率 | 小卡片，不放大超过原始有效尺寸 | `Casting simulation setup example from supplied material.` |

WP 44 实际是低压铸造设备，不是逆向工程，禁止用于 CA03 的 Physical Sample / Reverse Engineering 卡。它保留给轮毂制造能力资料，不删除。

## 6. WordPress 内容接缝

```ts
type CustomAluminumPageContent = {
  hero: CapabilityHero;
  applicationGroups: Array<{
    slug: string;
    publicName: string;
    examples: string[];
    evidenceStatus: "supplier-stated" | "verified";
  }>;
  acceptedInputs: InputRequirement[];
  engineeringMethods: Array<{
    title: string;
    body: string;
    media?: MediaAsset;
    evidenceBoundary: string;
  }>;
  developmentStages: DevelopmentStage[];
  capabilityBoundary: {
    listed: string[];
    assess: string[];
    declined: string[];
    declinedConfirmed: boolean;
  };
  inquiryChecklist: string[];
};
```

`declinedConfirmed=false` 时页面 metadata 自动保持 `noindex,follow`。组件不得通过隐藏 CSS 绕过状态，也不得从图片文件名推断工程方法。

## 7. 桌面与移动视口

### 桌面 1440×900

- CA01 为 55/45 双栏：左侧文案，右侧显示 2D/3D/Sample 三种输入的抽象文件卡，不使用假产品图。
- CA02 四列应用卡；不放产品缩略图。
- CA03 三列输入卡；CA04 三张工程方法卡，WP 48 保持较小显示。
- CA05 使用五阶段流程；CA06 用三列状态矩阵。
- CA07 左侧输入清单、右侧询盘入口。

### 移动 390×844

- CA01 文案后显示输入卡，首屏内出现 H1 和至少一个 CTA。
- CA02–CA04 全部单列；截图使用固定宽高避免布局跳动。
- CA05 变纵向时间线；CA06 变为三个状态区块，不用横向表格。
- 200% 放大无横向滚动；按钮至少 44×44。

## 8. SEO、隐私和询盘

**Title**

`Custom Aluminum Components | Drawing & Sample Assessment | Fenghuai`

**Description**

`Start a drawing-led aluminum component assessment with 2D drawings, 3D data or a physical sample, covering DFM, tooling, first article and supplier-supported production.`

- 发布门槛未满足时 `noindex,follow`；满足后 canonical 为 `/products/custom-aluminum`。
- 可使用 `Service` schema，不输出 Product、Offer、库存或价格。
- NDA 表述使用 `NDA available for project discussion`；不承诺未经流程确认的即时签署或特定法律文本。
- 样件输入增加权利声明：提交方确认有权交付、测量和用于制造评估。
- 询盘上下文固定带 `product_line=custom-aluminum`、application group、input type 和页面来源。

## 9. 现有实现替换要求

当前页面的结构可以复用，但内容和图片需按本规格收敛：

1. Hero 改为无产品照片的工程输入型首屏；现有 `hero.webp` 不作为通用定制零件证明。
2. 应用范围改为资料中的四组，并明确是评估范围而非现货或已供货案例。
3. 输入方式从四类收敛为 2D、3D、物理样件；逆向工程属于样件路线，并增加复制权确认。
4. 删除“铝与镁通用能力”主张；镁合金只在非轮毂项目获得工程确认后加入。
5. 删除 `applied in house`、通用热处理、通用腐蚀重复性等未确认表述。
6. 将八阶段流程收敛为五个可审核阶段，避免把常规做法写成每个项目的绝对承诺。
7. 使用 WP 67/31/48，并显示“轮毂几何上的方法示例”证据边界；不使用 WP 44 证明逆向工程。
8. 保留 `excludedConfirmed=false` 的 noindex 门槛，待业务确认不承接清单后再开放索引。
9. 询盘继续使用统一 API；不实现未经安全设计的直接文件上传。
10. 内容留在 `src/content/` 接缝，组件使用设计令牌和声明式动效。

## 10. 验收清单

- [ ] 页面明确为来图/来样评估，不展示标准 SKU、库存或虚构案例。
- [ ] 三电三类壳体正确分流到 EV 页面。
- [ ] 四组应用都标记为评估范围，不写成已量产项目。
- [ ] 不公开镁合金、通用热处理、内部涂装或无限尺寸能力。
- [ ] 物理样件路线包含所有权与复制权确认。
- [ ] WP 67/31/48 的真实画面说明正确，并注明使用轮毂几何。
- [ ] WP 44 不再作为逆向工程图片。
- [ ] 不承接清单未确认时保持 noindex，不公开空白边界表。
- [ ] 工艺列表说明制造主体与外协边界待项目确认。
- [ ] 页面不发布材料、公差、MOQ、周期、模具寿命或产能数字。
- [ ] 无文件安全链路时不显示上传按钮。
- [ ] 390px 和 200% 放大无横向滚动、文本截断和截图过度放大。
- [ ] Service schema、canonical、robots 和询盘上下文正确。
- [ ] 实现阶段 lint、typecheck、build 与本地生产实例冒烟通过。

## 11. 参考

- [资料核验记录](../resources/research/2026-10-05-ev-custom-aluminum-source-audit.md)
- `3家公司的PPT资料/峰徊科技_A版/A科技_产品综合介绍.md` 第 04 章
- [新能源三电铝制品 Page SPEC](ev-components.md)
- [现行首发总规格](2026-10-04-launch-viewport-spec.md)
