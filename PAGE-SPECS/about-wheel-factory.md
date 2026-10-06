# About 页：轮毂制造基地模块 Page SPEC

- 路由：`/about#wheel-manufacturing`
- 页面位置：`about.A02` 角色分工之后、`about.A03` 公司核验与联系之前
- 模块状态：已实现；用户已批准图片与品牌层“我们的制造基地”口径，法人证据仍按实际主体
- 公开语言：英文优先
- 来源：航鹏画册 PDF 第 2 页、用户提供的公司简介页面、WordPress 本地媒体库
- 目的：说明集团轮毂产品线由什么制造体系支撑，同时清楚区分品牌表达与实际法人主体

> **2026-10-05 实施更新（DEC-044、DEC-045）**：用户确认相关制造公司属于同一实际控制人体系，公开页采用 `our wheel manufacturing base`。本文早期使用的 `partner manufacturing facility`、禁止品牌层使用 `our factory` 等保守口径已被本更新取代。合同、认证、专利、测试报告和法规责任仍必须显示实际法人主体与适用范围。

## 1. 本模块只回答三个问题

| 视口 | 用户问题 | 主信息 | 主视觉 | 主行动 |
|---|---|---|---|---|
| AF01 | 谁负责轮毂制造 | 峰徊是深圳商务/项目接口；图片展示集团轮毂制造基地 | 厂区航拍 | 无强制按钮，继续了解能力 |
| AF02 | 工厂里有哪些可见环节 | 铸造、CNC 机加工、涂装是当前图片能够直接证明的三个环节 | 三张车间图 | 查看制造与质量 |
| AF03 | 我的轮毂项目可以讨论什么 | 材料/模具、铸造成形、旋压、热处理、抛丸、CNC、表面处理可作为项目评估范围；具体路线逐项目确认 | 紧凑能力清单 | Discuss a wheel program |

要把三个问题压成一张“公司简介”长图。整页画册截图只作为来源证据，不进入网页。

## 2. 事实归属

### 2.1 页面必须明确表达

- `SHENZHEN FENGHUAI TECHNOLOGY CO., LTD.` 是客户对接、需求整理、项目协调与商务沟通接口。
- 本模块照片来自集团轮毂制造基地；对外可称“我们的轮毂制造基地”。
- 生产路线、设备可用性、认证、规格和交期按具体项目由负责制造的主体确认。

### 2.2 本模块禁止发布的表述

- 不得把集团品牌归属扩写成深圳峰徊单一法人拥有全部厂房、设备或资质；证据文件按实际主体展示。
- `175 亩 / 175 acres`。源资料中英文单位冲突。
- 发明专利 4 项、实用新型 40 项、申请中 10 项，除非取得权利主体、编号和有效状态清单。
- 年产 100 万只轮毂或 20 万套新能源零部件，除非确认统计口径、时间和授权。
- 将铸造、旋压、锻造写成每个轮毂都依次经过的统一流程。
- 根据厂房照片推导 IATF、TÜV、JWL、车型适配或每件产品的试验结论。

## 3. 可直接录入的英文内容

### AF01：制造关系与厂区

**Eyebrow**

`WHEEL MANUFACTURING`

**Heading**

`A specialized production base for wheel programs`

**Lead**

`Our wheel manufacturing base combines forming, machining and finishing resources for approved wheel and aluminum-component programs.`

**Relationship disclosure**

`Fenghuai is your Shenzhen commercial and project interface. Manufacturing scope, certification requirements and production availability are confirmed for each program with the responsible manufacturing entity.`

**图片说明**

`Wheel and aluminum-component manufacturing base.`

### AF02：可见生产环节

**Section heading**

`Inside the wheel production system`

| 卡片 | 标题 | 正文 | 图片说明 |
|---|---|---|---|
| 1 | `Casting workshop` | `Casting resources support approved wheel and aluminum-component programs. The selected casting route is confirmed against the product design and required properties.` | `Casting workshop at the partner manufacturing facility.` |
| 2 | `CNC machining` | `CNC machining turns the approved design into controlled dimensions and interfaces. Inspection requirements are defined with the drawing before production.` | `CNC machining workshop for wheel and aluminum components.` |
| 3 | `Coating and finishing` | `Surface preparation and coating are planned around the approved finish, appearance standard and service environment.` | `Coating line at the partner manufacturing facility.` |

卡片不显示虚构数字，不写“所有产品都经过”或“世界领先设备”。

### AF03：项目评估范围

**Section heading**

`Capabilities reviewed for each wheel program`

**Intro**

`The manufacturing route is selected for the actual wheel design rather than applied as a fixed sequence. Share the target size, vehicle or application, quantity and finish so the responsible team can confirm a buildable route.`

**Capability items**

- `Alloy and mould engineering`
- `Gravity and low-pressure casting`
- `Flow forming`
- `Heat treatment and shot blasting`
- `CNC machining`
- `Surface preparation and coating`

高压铸造可以保留在供应商总能力资料中，但没有工程确认前不列为当前轮毂路线。锻造能力使用画册第 4 页的独立证据，在锻造轮毂模块另行说明，不由本页四张图片证明。

**Primary CTA**

- Label：`Discuss a wheel program`
- Href：`/contact`
- 提交上下文：`product_line = wheels`，由询盘接缝带入，不依赖 URL 文案猜测

**Secondary CTA**

- Label：`View wheel manufacturing and quality`
- Href：`/capabilities`

## 4. WordPress 媒体映射

当前本地 WordPress 地址只用于实验，前端不得硬编码 `localhost:8081`。内容层按媒体 ID 读取并转换成稳定的 `MediaAsset`。

| 用途 | WP 媒体 ID | 当前标题 | 尺寸 | 必填替代文本 | 焦点/裁切 |
|---|---:|---|---:|---|---|
| AF01 厂区主图 | 114 | `厂区航拍全景` | 2560×1463 | `Aerial view of a partner manufacturing campus supporting wheel production` | 中心偏下；保留厂房主体与山体环境，桌面 16:9，移动端 4:3 |
| AF02 铸造 | 61 | `车间_铸造组` | 1070×769 | `Casting workshop at a partner wheel manufacturing facility` | 中央生产线；4:3 |
| AF02 机加工 | 78 | `车间_机加组` | 1221×779 | `CNC machining workshop for wheel and aluminum components` | 保留右侧设备与通道；4:3 |
| AF02 涂装 | 84 | `车间_涂装组` | 2098×1071 | `Coating line at a partner wheel manufacturing facility` | 中央通道；桌面 16:9，移动端 4:3 |

核查时四个媒体的 `alt_text` 与 `caption` 均为空。发布前必须在 WordPress 补齐；caption 使用第 3 节的图片说明。媒体 ID 32、10、9/6 是相同车间图的泛化或重复命名，不作为本模块主绑定，避免编辑误选。

每个媒体记录还需补内部字段：

- `source_entity = 贵州航鹏新材料科技有限公司`
- `source_document = 航鹏画册组最终稿(1).pdf`
- `source_page = 2`
- `usage_scope = website_about_wheel_manufacturing`
- `rights_status = pending | approved | rejected`
- `approved_by`、`approved_at`

只有 `rights_status = approved` 的图片可以进入公开响应。WordPress 当前“已上传”不等于“已授权发布”。

## 5. 内容接缝

组件不能直接读取 WordPress 原始对象。适配器输出以下稳定形状；字段加入 `src/content/types.ts` 时需要记录契约变更。

```ts
type AboutWheelFactorySection = {
  anchor: "wheel-manufacturing";
  status: "draft" | "approved";
  eyebrow: string;
  heading: string;
  lead: string;
  relationshipDisclosure: string;
  heroMedia: MediaAsset;
  workshops: Array<{
    id: "casting" | "machining" | "coating";
    title: string;
    body: string;
    media: MediaAsset;
  }>;
  capabilitiesHeading: string;
  capabilitiesIntro: string;
  capabilities: string[];
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
};
```

`MediaAsset` 至少包含 `id`、`src`、`width`、`height`、`alt`、`caption`、`focalPoint`、`rightsStatus`。组件仅在 section 和所需媒体均为 `approved` 时渲染；缺少批准主图时整个模块保持草稿，不显示空白框或来源截图。

## 6. 桌面视口规格

基准：1440×900；内容宽度沿用 `container-fh` / `container-fh-wide`，颜色只用现有设计令牌。

### AF01

- 浅色背景，12 列网格，文字 5 列、厂区图 7 列。
- Eyebrow、H2、Lead、关系说明形成一组；关系说明使用可见的小型证据块，不能藏在 tooltip。
- 厂区图使用 `sizes` 与响应式图片，不使用画册整页截图。
- 一个基准视口内完整看到标题、关系说明和主要厂房；不强制 `100vh`。

### AF02

- 第一行是标题和一句短说明；下方三张证据卡。
- 1440px 时使用三列；照片高度视觉一致，但各图通过焦点控制避免裁掉主要设备。
- 卡片只含标题、1 段正文和 caption，不使用统计数字或悬浮才出现的关键信息。
- 点击图片可放大时，需有键盘关闭、焦点返回和图片说明；首发也可不做灯箱。

### AF03

- 左侧为标题与说明，右侧为两列能力清单；底部放主次 CTA。
- 能力项使用简单列表或分隔行，不把每个词做成厚重卡片。
- 与下一段公司联系方式之间保留清晰段落间隔，不重复 About 页 Hero CTA。

## 7. 移动视口规格

基准：390×844。

- AF01 顺序为 Eyebrow → H2 → Lead → 关系说明 → 厂区图 → caption。
- H2 最多约 4 行；正文保持自然高度，页面允许滚动，不裁切文字。
- AF02 三张卡按铸造 → 机加工 → 涂装纵向排列；图片宽度 100%，说明始终可见。
- AF03 能力清单单列；主 CTA 全宽，次 CTA 为文本链接或描边按钮。
- 图片采用 WordPress 响应式尺寸，不在移动端下载 2560px 原图。
- 触控目标至少 44×44；200% 放大时不出现横向滚动。

## 8. 现有 About 实现的替换要求

当前 `src/content/about.ts` 和 `/about` 页面把原材料、锻造、机加工、涂装写成峰徊自有/厂内能力，并使用 `factory-floor-wide.webp`。实施本 SPEC 时：

1. 用本模块关系文案替换 `aboutChain` 的自有工厂表述。
2. 删除或改写 `Raw material produced in-house`、`Integrated forging capability in-house`、`production happens on our lines` 等未经主体证明的句子。
3. 不把旧 `factory-floor-wide.webp` 与 WP 图片并列形成两套来源；统一走 WordPress → 内容适配器 → 组件。
4. 不改动组件的设计令牌与声明式动效规则。
5. 不在组件里硬编码本 SPEC 的英文文案。

## 9. 验收清单

- [ ] AF01 首屏可见“partner / responsible manufacturing entity”关系说明。
- [x] 品牌层使用 `our manufacturing base`；合同、认证、专利和测试证据仍按实际法人主体。
- [x] 使用 WP 媒体 114、61、78、84，且均有英文 alt、caption 和批准状态。
- [ ] 没有使用整页截图、试用水印、重复媒体或本地固定 URL。
- [ ] 没有出现面积、专利、年产量、认证、车型适配等未核准数字或结论。
- [ ] 桌面 1440×900 与移动 390×844 截图通过，关键内容无裁切、无横向滚动。
- [ ] 禁用 JavaScript 后正文与图片说明仍可见。
- [x] CTA 提交时保留 `product_line = wheels` 上下文。
- [x] WordPress 内容替换不要求修改展示组件。
- [ ] lint、typecheck、build 和 About 页本地生产实例冒烟通过。
