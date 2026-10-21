# 自密封轮胎 Page SPEC

- 路由：`/products/safety-tires`
- 页面类型：自密封轮胎产品线能力与询盘页；没有核准型号数据时不建立 SKU 目录
- 视口：T01–T06，共 6 个核心问题视口
- 状态：页面已实现；T01–T06、8 mm 结构化证据与双端视觉验收曾完成（2026-10-05）。2026-10-16 已修复证据模块在 360/390px 的响应式裁切，并通过移动专项边界检查。T03 三张机制 WebP 已替换为无文字解释性图示，开发/生产模式在 1440/390/360px 均通过；本地 WordPress live 权威内容尚待 Docker 恢复后同步复验，不能因本地替换而关闭 P0。详见[交付报告](../outputs/reports/self-sealing-mechanism-asset-replacement-2026-10-16.md)。
- 公开语言：英文优先
- 来源：峰徊画册第 16–21 页、洛克项目资料第 7–12/21 页、用户提供的四张页面图、WordPress 本地媒体库
- 主要受众：个人车主、车队、轮胎渠道商与地区合作方
- 公开术语：目标市场为 Google US / en-US，英文统一使用 `self-sealing tire(s)`；`self-healing` 只作为来源资料中的材料描述，不用来暗示轮胎能够修复所有损伤

## 1. 页面目标与视口顺序

页面先用常见道路场景说明问题，再解释胎面穿刺时的自密封机理，然后单独说明 8 mm 的测试含义和边界。事故拼图、伤亡统计和绝对安全口号不进入网页。

| 视口 | 客户问题 | 主信息 | 主视觉 | 主行动 |
|---|---|---|---|---|
| T01 | 轮胎扎钉为什么不只是补胎问题 | 漏气、路边换胎、维修/换胎、拖车和行程中断 | 四张日常场景图 | 继续了解原理 |
| T02 | 这种轮胎是什么 | 内衬区域有高分子复合密封层；异物刺入时包裹异物并帮助限制漏气 | 行驶中的轮胎 + 扎钉特写 | 查看工作原理 |
| T03 | 钉子刺入和拔出时发生什么 | 刺入并包裹 → 帮助限制漏气 → 拔出后闭合穿刺通道 | 三张连续机理图 | 查看验证条件 |
| T04 | “可接受 8 mm”准确指什么 | 8 mm 是供应商资料所述的内部测试钉直径，不是对任意损伤的保证 | 钉高测量 + 碾压钉板测试 | 询问适用型号和报告 |
| T05 | 研发、生产和质量如何核验 | 研发场景、测试条件、生产追溯和型号文件必须对应 | 研发三图；生产图核准后显示 | 请求目标市场资料 |
| T06 | 哪些情况适用、怎样咨询 | 胎面测试区域与未覆盖损伤分开；个人与渠道使用不同询盘字段 | 边界表 + 双入口询盘 | `Ask about self-sealing tires` |

T01–T04 对应用户提出的三个重点：道路痛点、自密封机理、8 mm；T05–T06 补齐采购所需的证据和转化闭环。

## 2. 事实与证据边界

### 2.1 当前可以表达

- 扎钉可能带来胎压下降、被迫停车、路边操作、维修/换胎、拖车费用和行程中断。
- 供应商资料描述了一层位于轮胎内衬区域的高分子复合密封材料：异物穿过胎面时材料包裹异物，异物移除后材料闭合穿刺通道。
- 供应商资料和图片展示了使用直径 8 mm 测试钉的内部压钉/碾压演示。
- `GB/T 38510-2020《涂覆式刺扎自密封轮胎自密封性能评价》`在国家标准公开系统中显示为现行标准；是否符合其中某项要求必须由适用型号的正式报告证明。
- WordPress 中存在道路痛点、机理、内部测试、研发及生产场景图片，可作为待审核候选素材。

### 2.2 “8 mm”的公开口径

用户确认的“可以接受 8 mm”，在网页上必须翻译为一个有条件的测试主张：

> `Supplier materials state that the self-sealing system has been evaluated with an 8 mm-diameter test spike through the tread area.`

不能翻译为：

- `Repairs any puncture up to 8 mm`
- `Drive safely after any 8 mm puncture`
- `8 mm puncture-proof`
- `No inspection or repair is required`

正式上线 8 mm 主张前，至少要把以下信息与具体型号绑定：轮胎型号/尺寸、测试钉几何与直径、穿刺位置、胎压、速度或静态条件、环境温度、刺入与拔出流程、观察时间、允许压降/泄漏、测试日期、执行主体和结论。缺少报告时可以显示“供应商资料所述的内部演示条件”，不能显示为全系列保证。

### 2.3 禁止直接发布

- “高速 110 mph 爆胎死亡率接近 100%”“每 5 分钟死亡 1 人”“每分钟 1 人受伤”“每年 30,000 人死于爆胎”及类似数字。资料没有给出可追溯统计来源。
- “46% 交通事故由轮胎故障导致，其中 70% 来自爆胎”。同样缺少统计定义和来源。
- “永不爆胎”“扎不破”“任何钉子都能自愈”“永久修复”“无需检查”。
- `0.05 s` 响应、`−40…+178°C`、`60–67 dB(A)`、耐磨值 `390`、湿地等级 `A`，直到取得对应型号的完整报告和测试条件。
- “品控高于国标”“国标只要求 3 mm”。画册这样描述，但在核对标准具体条款和测试方法前不作为网站事实。
- ECE、DOT、专利、产品责任险、3 年/6 万公里、换新、道路救援等承诺，直到核对持有人、型号、地区、期限、条款和峰徊的授权范围。
- 用事故车辆、翻滚、爆炸图片制造产品能够避免伤亡的因果暗示。
- 把自密封轮胎与缺气保用轮胎、胎压监测、应急安全装置或传统补胎当成同一技术。

## 3. 可直接录入的英文内容

### T01：道路痛点

**Eyebrow**

`THE ROADSIDE PROBLEM`

**Heading**

`A puncture can turn into a roadside interruption`

**Lead**

`A nail puncture can mean air loss, an unsafe place to stop, a repair or replacement decision, and an unplanned recovery call. For a vehicle without a spare wheel, the interruption can be even more immediate.`

| 场景 | 英文标题 | 英文说明 |
|---|---|---|
| 01 | `Air loss after a tread puncture` | `A penetrating object can create an air-loss path and force the driver to respond before continuing the journey.` |
| 02 | `Changing a tire at the roadside` | `The driver may not have the tools, experience or safe working space required for a roadside wheel change.` |
| 03 | `Repair or replacement` | `Workshop time and the condition of the tire determine whether inspection, repair or replacement is required.` |
| 04 | `Towing and delay` | `Waiting for roadside assistance adds cost and interrupts personal, commercial or fleet travel.` |

**Boundary note**

`Self-sealing technology is intended to reduce the immediate interruption caused by an applicable tread puncture. It does not prevent every form of tire damage.`

本视口不使用事故图，不显示死亡人数或事故比例。

### T02：方案定位

**Eyebrow**

`SELF-SEALING TIRE TECHNOLOGY`

**Heading**

`A sealing layer responds around an applicable tread puncture`

**Lead**

`A polymer-composite sealing layer is applied to the tire inner liner. When an object penetrates the tread, the material surrounds it and helps limit air loss. After the object is removed, the material closes the puncture channel.`

**Definition note**

`Self-sealing describes the behavior of the internal sealing layer. It does not mean that the tire is immune to damage or that professional inspection is unnecessary.`

**Primary in-page action**

- Label：`See how the sealing layer responds`
- Href：`#self-sealing-mechanism`

### T03：自密封机理

**Eyebrow**

`HOW IT RESPONDS`

**Heading**

`How self-sealing tires work: the material closes around the puncture channel`

| 步骤 | 英文标题 | 英文说明 | 图片 |
|---|---|---|---|
| 01 | `Object enters the tread area` | `The object passes through the tread and into the sealing layer on the inner liner.` | WP 149 |
| 02 | `The material surrounds the object` | `The sealing material closes around the penetrating object and helps limit the air path while it remains in place.` | WP 131 |
| 03 | `The channel closes after removal` | `When the object is removed, the material recovers over the channel. The tire still requires inspection to confirm its condition.` | WP 139 |

**Boundary note**

`This sequence illustrates the stated sealing mechanism in the tested tread area. It is not a repair instruction and does not describe sidewall, shoulder, impact or structural damage.`

### T04：8 mm 内部验证

**Eyebrow**

`8 MM INTERNAL PUNCTURE CONDITION`

**Heading**

`8 mm describes the test spike, not every possible puncture`

**Approved draft copy**

`Supplier materials state that the self-sealing system has been evaluated with an 8 mm-diameter test spike through the tread area. The result applies to the tested tire, puncture location and test conditions. Ask for the documentation applicable to the tire model and destination market.`

**Inspection note**

`After a puncture, check tire pressure and have the tire inspected by a qualified professional. Do not treat the 8 mm figure as permission to continue driving with visible damage, abnormal pressure, vibration or a sidewall injury.`

**Evidence state**

| 字段 | 当前状态 | 页面处理 |
|---|---|---|
| 8 mm 测试钉 | 用户确认 + 供应商资料/图片 | 可以按“内部测试条件”表达 |
| 适用轮胎型号和尺寸 | 未提供 | 询盘时确认，不写“全系列” |
| 穿刺区域和工况 | 资料只表明胎面演示 | 公开文案限定为 `tread area`，报告到位后补充 |
| 结果判定和观察时间 | 未提供 | 不写“完全不漏气”或永久保持 |
| GB/T 38510-2020 | 官方系统确认标准现行 | 只引用标准名称/状态；具体 3 mm 条款待全文核对 |
| 第三方/型号报告 | 未提供 | 不显示认证或“通过国标”徽章 |

**Primary CTA**

- Label：`Ask for the applicable test record`
- Href：`/request-a-quote`
- Context：`product_line = safety-tires`、`intent = test_documentation`、`claim = 8mm_internal_puncture`

### T05：研发、生产与质量证据

**Eyebrow**

`EVIDENCE BEHIND THE PRODUCT`

**Heading**

`The evidence must match the tire model and market`

| 证据层 | 英文标题 | 英文说明 | 页面素材 |
|---|---|---|---|
| 研发场景 | `Material development` | `Supplier materials show a dedicated development and laboratory environment. Research partners and ownership of results are published only after documentary confirmation.` | WP 146/140/147 |
| 测试条件 | `Puncture validation` | `The test setup records the object, puncture zone, tire condition, pressure, procedure and acceptance result for the identified tire.` | WP 156/125/135 |
| 生产过程 | `Controlled application` | `Supplier-provided production-base imagery illustrates coating equipment used in the self-sealing tire program; process approval remains tied to the responsible entity and tire program.` | WP 155：`Supplier-provided coating equipment scene; not proof of ownership or a specific production result.`；按图权与主体审核显示 |
| 型号文件 | `Model and market documentation` | `A report or certificate must identify the holder, tire, method, result, validity and intended market before it is used as a sales claim.` | 使用可读正式文件，不用模糊缩略图 |

**Boundary note**

`A laboratory or production photograph demonstrates an environment, not a test result. Product claims are supported by documents that identify the tested tire and conditions.`

**Secondary CTA**

- Label：`See the partner production environment`
- Href：`/about#tire-manufacturing`

### T06：适用边界与询盘

**Eyebrow**

`CHECK THE APPLICATION`

**Heading**

`Confirm the tire, puncture condition and local support`

| 可以咨询确认 | 不能由本页保证 |
|---|---|
| 可供应的轮胎型号和尺寸 | 任意品牌轮胎都能后涂改造 |
| 8 mm 内部测试适用的具体型号 | 任意位置、形状或深度的 8 mm 损伤 |
| 胎面密封层的覆盖区域 | 胎侧、胎肩、帘布层或撞击损伤自动修复 |
| 目标市场所需报告和标识 | 全系列自动符合 ECE、DOT 或所有国家要求 |
| 当地安装、检查、售后和质保 | 全球统一道路救援或换新承诺 |

**个人客户输入**

- `Country or region`
- `Vehicle and current tire size`
- `Driving use and expected replacement timing`
- `Photo of the tire sidewall marking, if available`

**渠道/车队输入**

- `Target market and customer type`
- `Required sizes, load and speed ratings`
- `Expected quantity and delivery region`
- `Required test, certification and warranty documents`
- `Installation, inspection and after-sales plan`

**Primary CTA**

- Label：`Ask about self-sealing tires`
- Href：`/request-a-quote`
- Context：`product_line = safety-tires`、`intent = product_inquiry`

**Secondary CTA**

- Label：`Contact the project team`
- Href：`/contact`

品牌和供货关系尚未冻结时，询盘按钮只使用中性产品咨询口径，不显示授权经销、独家代理或厂家直营。

## 4. WordPress 媒体映射

以下 WordPress 图片已按实际像素检查；仍由 WordPress 提供的候选媒体需在发布前补齐来源、权利和批准状态。T03 的三张机制图已改为本地生成的解释性 WebP，不再引用下表中的旧 WordPress 媒体。

### 4.1 T01 道路痛点

| WP ID | 当前标题 | 尺寸 | 用途 | 必填 alt |
|---:|---|---:|---|---|
| 151 | `痛点_扎钉轮胎特写` | 992×491 | 扎钉与漏气路径 | `Nail embedded in the tread of a tire` |
| 122 | `痛点_司机蹲地换胎` | 918×491 | 路边换胎 | `Driver attempting to change a tire at the roadside` |
| 137 | `痛点_车间师傅抱轮胎` | 992×491 | 维修或更换 | `Workshop technician carrying a replacement tire` |
| 130 | `痛点_道路救援拖车` | 918×491 | 道路救援和拖车 | `Roadside recovery truck transporting a vehicle` |

不使用 ID 119/124/133/134/138/158/161 的事故、翻滚或爆炸图片。

### 4.2 T02–T03 产品和机理

| WP ID | 当前标题 | 尺寸 | 用途 | 必填 alt |
|---:|---|---:|---|---|
| 153 | `品牌_轮胎行驶特写` | 2158×772 | T02 宽幅主图 | `Close view of a tire in normal road use` |
| 144 | `产品_扎钉轮胎特写` | 595×1228 | T02 产品补充图；不可作桌面通栏 | `Tire tread shown with a puncturing object` |
| — | 本地生成 `mechanism-entry.webp` | 1774×887 | T03 刺入 | `Explanatory cutaway showing an object entering the tire tread and sealing layer` |
| — | 本地生成 `mechanism-surround.webp` | 1774×887 | T03 包裹 | `Explanatory cutaway showing sealing material surrounding a penetrating object` |
| — | 本地生成 `mechanism-close.webp` | 1774×887 | T03 闭合 | `Explanatory cutaway showing the sealing layer closing the channel after object removal` |

图片内已有 `LOAKE` 或产品口号时，必须先完成品牌公开授权；不能仅靠裁切隐藏来源。

### 4.3 T04 8 mm 内部测试

| WP ID | 当前标题 | 尺寸 | 用途 | 必填 alt |
|---:|---|---:|---|---|
| 156 | `测试_钢钉高度测量` | 769×421 | 测试钉/测量场景 | `Measurement of a puncture-test spike used in an internal tire evaluation` |
| 135 | `测试_轮胎碾压钉板一` | 768×421 | 碾压钉板过程 | `Tire approaching a controlled puncture-test board` |
| 125 | `测试_轮胎碾压钢钉二` | 769×421 | 碾压测试后续 | `Tire passing over puncture-test spikes during an internal evaluation` |

alt 不写“8 mm”除非该张图中尺寸量具清晰可读并已由测试记录确认；8 mm 数字由结构化测试字段提供，不靠图片文件名推断。

### 4.4 T05 研发与生产候选

| WP ID | 当前标题 | 尺寸 | 用途 | 必填 alt |
|---:|---|---:|---|---|
| 146 | `研发_总部大楼` | 769×421 | 研发机构外景 | `Exterior of the supplier research facility shown in project materials` |
| 140 | `研发_实验室团队` | 768×421 | 实验室团队 | `Laboratory team working with material-processing equipment` |
| 147 | `研发_洁净实验室` | 769×421 | 实验室环境 | `Controlled laboratory environment shown in supplier materials` |
| 155 | `生产_热熔喷涂线机械臂` | 769×386 | 涂覆生产候选 | `Automated equipment on a tire coating line` |
| 136 | `生产_检测产线` | 719×421 | 生产检测候选 | `Inspection equipment on a tire production line` |

研发合作单位、工厂主体和图片图权没有批准前，T05 可用“供应商资料展示”口径，不写峰徊自研、自有实验室或自有工厂。

### 4.5 媒体后台字段

每张媒体至少补齐：

- `source_entity`、`source_document`、`source_page`
- `rights_status = pending | approved | rejected`
- `content_role = pain_point | product | mechanism | validation | research | production`
- `brand_visibility = visible | removed_with_permission | not_present`
- `claim_ids`：图片支持的主张编号，不等于报告结论
- `approved_by`、`approved_at`

测试媒体另需关联 `test_record_id`；研发/生产媒体需关联负责主体。前端使用稳定媒体对象，不硬编码 `localhost:8081`。

## 5. 测试证据数据结构

8 mm 不应只是正文中的一个数字，需要能够回溯到测试记录：

```ts
type TirePunctureEvidence = {
  id: string;
  status: "supplier-stated" | "verified" | "rejected";
  tyreModel?: string;
  tyreSize?: string;
  punctureZone: "tread" | "unspecified";
  objectType: string;
  objectDiameterMm: number;
  inflationPressure?: string;
  testSpeed?: string;
  ambientTemperature?: string;
  observationPeriod?: string;
  acceptanceCriterion?: string;
  testDate?: string;
  performedBy?: string;
  reportAsset?: MediaAsset;
  sourceRefs: string[];
};

type SelfSealingTirePage = {
  slug: "safety-tires";
  publicationStatus: "draft" | "approved";
  attributionStatus: "pending" | "approved";
  painPoint: TireViewport;
  definition: TireViewport;
  mechanism: TireViewport;
  punctureValidation: TireViewport & {
    evidence: TirePunctureEvidence;
  };
  evidenceSystem: TireViewport;
  applicationAndInquiry: TireViewport;
};
```

当 `status = supplier-stated` 时，组件必须渲染供应商资料说明和边界文案；只有 `verified` 才能显示为已验证结论。类型变更属于 WordPress 契约变更，实施时记录新的决策条目。

## 6. 桌面视口规格

基准：1440×900；补测 1280×800。段落自然增高，不强制 `100vh`。

### T01

- 左侧 4–5 列为标题、Lead 和边界说明；右侧 7–8 列为 2×2 日常场景图。
- 图片顺序：扎钉 → 路边换胎 → 维修/换胎 → 拖车。
- 不使用黑白事故拼图、全屏警示红色或伤亡数字墙。

### T02

- 宽幅行驶图承担产品定位，正文以 4–5 列覆盖或相邻排版；确保文字对比度。
- 竖幅扎钉特写只作补充，不强行裁成宽幅。
- 首次出现 `self-sealing` 时给出一段定义说明。

### T03

- 三张机理图等宽横排，使用 01/02/03 步骤编号和简短正文。
- 图片内原有宣传句不能作为唯一说明；全部过程以 HTML 文本呈现。
- 三图品牌授权未解决时，使用现有图形重绘为自有示意图后再公开，不能直接抹除来源 Logo。

### T04

- 左侧突出 `8 mm` 数字和限定词 `internal puncture condition`；右侧为测量图和一张测试过程图。
- 数字附近必须同时出现 `test spike`、`tread area` 和型号/条件限制，不能把限制放到页面底部小字。
- 报告未核准时显示 `Supplier-stated internal evaluation`，不显示“certified”“passed”或标准徽章。

### T05

- 研发三图组成主视觉；测试、生产和文件使用四项证据清单。
- 生产图片只能在制造主体与授权确认后加入，不能写 `our factory`。
- 正式报告如展示，需有可读标题、主体、型号、日期和状态；不用模糊证书墙。

### T06

- 上半段为两列表格“可确认 / 不保证”；下半段为个人和渠道两个询盘入口。
- 根据客户类型显示不同字段，但提交到同一询盘 API 和数据库契约。
- 品牌关系待确认时，按钮保持中性咨询，不承诺经销授权、价格、安装或售后覆盖。

## 7. 移动视口规格

基准：390×844；补测 360×800。

- T01 四张场景图转为 2 列图片 + 单列说明；不使用必须横向滑动才能看到的关键卡片。
- T02 标题和定义先于图片；竖幅产品图使用自然比例，避免截掉穿刺位置。
- T03 三步骤单列，图和对应文字不能拆到不同顺序。
- T04 在第一个移动视口内同时看到 `8 mm`、`test spike` 和限定说明；CTA 可在下一自然段出现。
- T05 研发图片 1 张主图 + 2 张辅助图；低分辨率图不放大到失真。
- T06 边界表转换为带标签的纵向条目；个人/渠道切换无 JavaScript 时仍能看到两个入口。
- 200% 放大无横向滚动；互动目标至少 44×44；所有正文和 CTA 在无 JavaScript 时可用。

## 8. SEO、结构化数据与术语

**建议 title**

`Self-Sealing Tires | Puncture Response & Test Conditions | Fenghuai`

**建议 description**

`Learn how an inner-liner sealing layer responds to an applicable tread puncture, what the supplier-stated 8 mm test condition means, and which tire and market documents to confirm.`

**建议 H1**

`Self-sealing tires for applicable tread punctures`

- 使用美国英语拼写 `tire`，与 Google US/en-US 目标市场一致；代码字段和 URL 保持现有 `safety-tires`。
- 核心术语使用 `self-sealing tire`、`sealing layer`、`tread puncture`、`puncture-test spike`。
- 不用 `puncture-proof`、`bulletproof tire`、`never flat`、`automatic permanent repair`。
- 没有真实型号、价格和库存时，不输出 Product/Offer schema；使用 WebPage 或 Service 语义。
- 不创建 `8mm self healing tire for [car brand]` 一类车型适配 SEO 页。
- canonical、OG 和 sitemap 使用正确的 `NEXT_PUBLIC_APP_URL` 构建值。

## 9. 现有页面实现的替换要求

当前 `/products/safety-tires` 已存在，但与本规格存在以下冲突，实施时必须处理：

1. `src/content/safety-tires.ts` 声称性能数字来自“our own material and are safe to publish”，但同一文件把报告标记为 `reportAvailable: false`；在报告到位前移除温度、噪声、耐磨和湿地等级数字。
2. 当前文案把 8 mm 写成 `our in-house validation` 和 `our own acceptance criterion`。制造/测试主体未冻结前改为 `supplier-stated internal evaluation`。
3. 当前文案直接断言“国家标准测试使用 3 mm 测试钉”。在标准具体条款核对前改为“画册所述的 3 mm 参考条件”，或暂不显示 3 mm 对比。
4. `The response is fast enough that the driver does not have to stop`、道路救援覆盖、批次必然匹配样品等表述缺少证据，使用本规格的限定文案替换。
5. Hero 和各视口需要接入 WordPress 候选图片，但继续通过 `src/content/` 稳定接缝提供；组件不直接读取原始 WP JSON。
6. 保留 `tireAttribution` 门槛；品牌关系、制造主体和供货授权未确认时，T05/T06 使用中性供应商口径。
7. 所有图片使用 `hasRender`/批准状态兜底；未批准媒体不产生空框或 404。
8. 动效使用现有声明式属性，组件使用设计令牌，不写裸 hex。

## 10. 验收清单

- [x] T01–T06 分别回答道路问题、产品定义、工作机理、8 mm、证据系统和适用/询盘六个问题。
- [x] T01 只使用日常扎钉、换胎、维修和拖车场景，没有事故拼图或伤亡统计。
- [x] T03 的三张机理图与三步文字一一对应，无 JavaScript 时仍按正确顺序可见。
- [x] 8 mm 始终写成测试钉直径和限定测试条件，不写成任意损伤的保证。
- [x] 8 mm 主张至少标注 `supplier-stated`；取得型号报告后才可改为 `verified`。
- [x] 未核对 GB/T 38510-2020 具体条款前，不发布“国标规定 3 mm”或“高于国标”。
- [x] 不出现 0.05 s、温度、噪声、耐磨、湿地等级、伤亡比例、保险和质保等未核准数字。
- [x] 页面明确区分胎面适用测试区域与胎侧、胎肩、撞击或结构损伤。
- [ ] 仍由 WordPress 提供的候选媒体均有准确 alt、caption、来源、图权和批准状态；T03 三张本地生成解释性 WebP 已具备对应元数据，但 live 权威同步仍待复验。
- [x] 带 LOAKE 标识的图片按用户确认的媒体库可用范围公开，原有标识未抹除。
- [x] 个人与渠道询盘进入同一后端，保留 `product_line = safety-tires` 和客户类型。
- [x] 桌面 1440×900、1280×800 与移动 390×844、360×800 截图通过。
- [x] 200% 等效移动视口、键盘可达链接、无 JavaScript 和 WordPress 本地回退场景通过。
- [x] 页面没有虚构型号、价格、库存、车型适配、认证或全球售后承诺。
- [x] 实现阶段 lint、typecheck、build 和本地生产实例冒烟通过。

## 11. 标准核验来源

- [国家标准公开系统：GB/T 38510-2020](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=911A9104E6EC7F2A245FFDDB041D7815)：截至 2026-10-04 显示标准名称为《涂覆式刺扎自密封轮胎自密封性能评价》，状态为现行，实施日期为 2021-02-01。
- 该公开详情页没有直接证明本项目画册所述的 3 mm 条件或任何轮胎型号已经通过测试；正式网页主张仍需核对标准全文和型号报告。
