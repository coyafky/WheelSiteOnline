# About 页：公司角色分工模块 Page SPEC

- 路由：`/about`（模块 `about.A02`）
- 页面位置：`about.A01` 公司身份之后、`about.AF01–AF03` 轮毂制造基地之前
- 模块状态：已实现（**实现先于本规格，见 §8 实施顺序**）
- 公开语言：英文优先
- 来源：用户 2026-10-06 提供的《贵州蓝辉集团简介（2026 版）》18 页 PDF（321 行提取稿 + 104 张原图）、峰徊画册 PPT 第 3/22 页、`2026-10-04-launch-viewport-spec.md` 第 12 节 A02 行
- 目的：说明客户对接峰徊之后**谁做什么**，并把「同一 ownership group」这条公开口径固定为可核对的条文，防止日后漂移

> **2026-10-06 口径定案**：用户确认对外表述为「**同一 ownership group**（同一实际控制人体系）」。本规格是该口径的**唯一正本** —— 用户明确决定**不另立 DEC 条目**，所以口径与依据都留在本文，改动本文即改动口径。
> `2026-10-04-launch-viewport-spec.md` 第 12 节 A02 行「公开说明同一实际控制人体系，文件保留实际法人主体」由本规格落实；两者冲突时以本规格为准。

## 1. 本模块只回答两个问题

| 视口 | 用户问题 | 主信息 | 主视觉 | 主行动 |
|---|---|---|---|---|
| A02-1 | 客户对接峰徊之后谁做什么 | 需求整理、工程协调、商务跟进、证据匹配四项角色 | 四格职责矩阵 | 无强制按钮，继续了解制造基地 |
| A02-2 | 背后是谁在生产 | 四条产品线由**同一 ownership group** 下的生产公司承担；材料 → 模具 → 铸造 → 精深加工 → 成品是一条纵向链条，由专门公司分环节承担 | 五段编号链条 + 证据边界注记 | 无强制按钮，进入轮毂制造基地 |

两问合在一屏半以内，**不重复** `about.AF01` 的厂区图与铸造/机加工/涂装三卡，也不重复 `about.A01` 的公司身份表述。

## 2. 事实归属

### 2.1 本模块必须明确表达

- `SHENZHEN FENGHUAI TECHNOLOGY CO., LTD.` 是深圳的**商务与项目接口**：需求整理、工程协调、商务跟进、证据匹配由峰徊承担。
- 承接生产的是**同一 ownership group 下的生产公司**，公开表述用 `the same ownership group`，**不点名**具体法人（见 §2.2）。
- 集团按**纵向链条**组织：`alloy material → mould and tooling → casting and forming → precision machining → finished component`，各环节落在专门运营公司，而**不是**一个大而全的车间。
- 合同、认证、专利、测试证据**始终标明实际法人主体与适用范围**，不随集团归属上移。

### 2.2 本模块禁止发布的表述

**A. 军工与政治内容**（来源资料第 4、2 节）

- 中央军委装备发展部**武器装备承制资格**、武器装备质量管理体系认证、国军标质量管理体系认证。理由：军工资质；本站是面向海外 B/C 客户的公开商务站，此类资质性质敏感，且与四条民用产品线无关。
- 省委书记徐麟、省长李炳军、市委书记李睿莅临视察；「富矿精开」重点项目等政治性背书。理由：海外客户视角下是噪音，占用篇幅而不回答任何采购问题。

**B. 内部经营数据**（来源资料第 7、11 节）

- 每吨成本节约明细：能源 300 元/吨、烧损 400 元/吨、合计 900 元以上。理由：**成本结构属内部数据**，公开等于把它交给对手与客户。
- 铝土矿探明储量超 7 亿吨、全国占比 24%、遵义铝业年产 41 万吨电解铝、厂区距遵义铝业 800 米。理由：同上，属资源与成本条件。

**C. 第三方权利**

- 客户与合作方名单：吉利汽车、遵义大地和、上海电驱动、华川电装、时代电动、大洋电机、卧龙电器驱动等（来源资料第 6 节）。理由：**未获授权不得公开他人名义**。

**D. 未逐项标明持有主体的数字**（来源资料第 1、3、5 节）

- 产能：年产汽车改装轮毂 100 万只、新能源汽车核心零部件 50 万套、免热处理材料 15 万吨。
- 专利：已授权发明专利 5 项、实用新型 17 项、申请中 3 项。
- 体系认证：IATF16949:2016、45001、14001。
- 理由：DEC-044 明令「不得由集团归属进一步推导未经确认的产能、认证、专利或产品性能」，且来源资料**未逐项标明持证主体**。要用必须先补齐「持证主体 + 编号 + 有效状态 + 适用范围」。

**E. 用户 2026-10-06 明确排除**

- 集团级资质与荣誉：成立于 2019 年、遵义市红花岗区、国家高新技术企业、省级「专精特新」中小企业。
- 主体名称：贵州蓝辉集团、贵州蓝辉新材料、贵州航鹏新材料科技、遵义华鸿精密科技、遵义凯诺模具、遵义盛创动力。
- 理由：用户决定不加；且与全站现有口径一致 —— 现有页面只用 `companies within the same ownership group`，**从不点名**任何一个法人。

**F. 结构类禁令**

- 不得把五段链条写成「每个产品都依次经过全部五个环节」。链条描述的是**集团如何组织**，不是某个产品的固定工艺路线。
- 不得由集团归属推导面积、厂房、设备、认证、产能、专利、客户或测试结论（这是 §3 `groupNote` 存在的全部理由）。

## 3. 可直接录入的英文内容

> **大小写约定**：本节 Eyebrow 按**渲染结果**写成全大写（`.eyebrow` 由 CSS `text-transform: uppercase` 呈现）；`src/content/about.ts` 里存的是句首大写（`How the group works`）。校验 §9「逐字一致」时 Eyebrow 不区分大小写，其余字段区分。这与 `about-wheel-factory.md` 等既有规格的写法一致。

### A02-1：四项角色

**Eyebrow**

`HOW THE GROUP WORKS`

**Heading**

`A clear commercial interface, with the responsible factory kept visible`

**Body**

`Fenghuai organizes the customer-facing project in Shenzhen. Manufacturing, engineering evidence and market documents remain tied to the legal entity and production base responsible for the selected product.`

**职责矩阵（4 格，2×2）**

| 标题 | 正文 |
|---|---|
| `Requirement intake` | `We record the product, application, market, quantity and documents you already have.` |
| `Engineering coordination` | `The applicable manufacturing team reviews drawings, samples, variants and process questions.` |
| `Commercial follow-through` | `One project reference keeps quotation scope, changes, timing and delivery requirements connected.` |
| `Evidence matching` | `Certificates, reports and inspection records are checked against the issuing entity, product and market.` |

**关系披露（高亮块）**

`The manufacturing companies operate within the same ownership group. Contracts, certifications, patents and test evidence continue to identify the actual legal entity and applicable scope.`

### A02-2：集团结构

**Eyebrow**

`GROUP STRUCTURE`

**Heading**

`One ownership group, organised as an integrated chain`

**Intro**

`The product lines on this site are served by production companies under the same ownership. Material, tooling, casting, precision machining and finished-product work sit in specialist operating companies rather than one general workshop, so each project is routed to the stage and the entity that actually performs the work — and that entity is the one named in the documents.`

**链条五段**（编号 `01`–`05`）

| # | 标题 | 正文 |
|---|---|---|
| 01 | `Alloy material` | `Base alloy melted and cast for the downstream forming and machining stages.` |
| 02 | `Mould and tooling` | `Mould and tooling engineered and built for the approved part geometry.` |
| 03 | `Casting and forming` | `Gravity casting, low-pressure casting, die casting, flow forming and forging, selected by the approved route.` |
| 04 | `Precision machining` | `Critical bores, faces, interfaces and datums machined against the approved drawing.` |
| 05 | `Finished component` | `Product-specific finishing or assembly where the route requires it, then inspection and supply documentation.` |

**证据边界注记（高亮块，必填）**

`This describes how the group is organised, not what any one company has been verified to do. Capacity, certification, patent, customer and test claims are not inherited from the group: each is confirmed against the entity, product and market that actually holds it.`

### 排版约束（防返工，两处都是本项目踩过的）

- **四项职责用 2×2 网格是安全的**（4 = 2×2，无孤儿格）；若日后增减条目，必须同时改列数，否则末行留半宽空卡（`DEC-059` 在 `/gallery/finishes` 踩过）。
- **五段链条禁止改成并列卡片网格**。5 条放进 2 列或 3 列网格**必然**留下半宽/单张孤儿卡，且卡片网格读作「五个并列属性」，与「一条有方向的链条」语义相反。用 `01–05` 的**编号行** —— 任何宽度下都无孤儿格，且样式本身就读作序列。

## 4. 内容接缝

组件不直接读取 WordPress 原始对象。`src/content/about.ts` 的 `role` 分支输出以下稳定形状；字段已在 `src/content/types.ts` 的 `AboutContent["role"]` 中声明。

```ts
type AboutCompanyRoleSection = {
  eyebrow: string;
  heading: string;
  body: string;
  responsibilities: Array<{ title: string; body: string }>;
  disclosure: string;
  // 2026-10-06 新增（集团结构）
  groupEyebrow: string;
  groupHeading: string;
  groupIntro: string;
  groupStages: Array<{ id: string; title: string; body: string }>;
  groupNote: string;
};
```

- 新增的 5 个字段是**必填**（非可选）：它们承载 §2.1 的全部事实与 §2.2F 的证据边界，缺失即模块不完整。
- `groupStages` 的顺序**即**展示顺序（`01`–`05`），不要另加排序字段。
- 按 `AGENTS.md`：改动 `types.ts` 等于改动**内容契约**，需要同步本规格的 §4 与 §3。

## 5. 桌面视口规格

基准：1440×900；内容宽度沿用 `container-fh`；颜色只用现有设计令牌；声明式入场沿用 `data-reveal` / `data-reveal-group`。

### A02-1

- 12 列网格：文字 5 列（`minmax(0,0.82fr)`）、职责矩阵 7 列（`minmax(0,1.18fr)`），间距 `lg:gap-20`。
- 左栏顺序：Eyebrow → H2 → Body。
- 右栏：2×2 网格，用 `border-l border-t` + 每格 `border-b border-r` 拼出**细线矩阵**（不用卡片阴影），格内为标题 + 一段正文。
- 关系披露块紧跟在矩阵下方（左描边 + 浅底），**必须在同一基准视口内可见**，不得藏在折叠或 tooltip 里。

### A02-2

- 整段在 A02-1 之下，用上边框 + 上间距与前一屏切开。
- 标题区左对齐单列（`max-w-3xl`）。
- 五段链条用 `<ol>` 编号行：`sm:grid-cols-[3rem_minmax(0,13rem)_minmax(0,1fr)]`，即「编号 / 阶段名 / 说明」三栏；行间 `border-b`。
- 编号用等宽字体 + `tabular-nums`，确保 `01`–`05` 宽度一致不错位。
- 证据边界注记放在链条**之后**（`max-w-3xl` + 左描边浅底），与 A02-1 的披露块同一视觉语言，让它读作「同一条约束的第二次声明」。
- 实测列宽：1440 与 1280 均为 `48px 208px 876px`；768 为 `48px 208px 424px`。

## 6. 移动视口规格

基准：390×844。

- A02-1 顺序为 Eyebrow → H2 → Body → 职责矩阵（**单列**）→ 关系披露。
- A02-2 的链条行为**单列堆叠**（实测 `grid-template-columns: 350px`）：编号 → 阶段名 → 说明纵向排列，`gap-1.5`；编号在前，不与阶段名同行。
- H2 最多约 4 行；正文保持自然高度，页面允许滚动，不裁切文字。
- 触控目标 ≥44×44；200% 放大时不出现横向滚动。
- 不因此段新增任何图片请求（本模块无图）。

## 7. 现有实现的替换要求

- 本模块**无 WordPress 媒体绑定**，不引入 `MediaAsset`；A02 的视觉全部由排版承担。
- 不得在组件内硬编码第 3 节文案 —— 文案只在 `src/content/about.ts`。
- 不改动设计令牌与声明式动效规则。
- 若将来把 §2.2 任何一条解除禁令，必须**同时**在本文记录「解除依据（谁批准、持证主体、文件编号）」，不允许只改页面。

## 8. 实施顺序（诚实记录一次倒置）

**本模块是「先改页面、后补规格」的。** 2026-10-06 我先按用户提供的母公司资料把集团结构段落进 `src/content/about.ts` + `src/components/about/about-intro.tsx`，随后用户指出 **About 应当先写 PageSpec、再照 PageSpec 更新页面**。

处理方式：本文补齐后，**以本文为准重新核对实现**（见 §9），而不是把本文写成对既有实现的追认。核对结果与偏差记录在 §9。

后续新增或修改 About 任何段落，一律走「先本规格 → 再页面」。`about.A01`（公司身份）与 `about.A03`（公司核验与联系）目前**同样没有活的子规格**，属于同一类缺口，需要时按同一格式补。

## 9. 验收清单

> **2026-10-06 实测记录**（照本规格核对实现，而非追认实现）。环境：`WP_API_URL=http://localhost:8081/wp-json/wp/v2 WP_MODE=live npx next build` 的 standalone 生产实例，端口 3997。

- [x] A02-1 与 A02-2 的英文文案与第 3 节**逐字一致** —— spec §3 提取 26 条，**26/26** 命中 `src/content/about.ts`（2 条 Eyebrow 走大小写不敏感）；`src/components/` 8 个特征串硬编码命中 **0**。
- [x] 关系披露块在 1440×900 首屏内可见 —— 角色段首对齐视口时 `top=341 / bottom=445`；1280 同值。
- [x] §2.1 四项事实全部出现 —— 深圳接口 / 同一 ownership group / 五段链条 / 证据按实际法人主体，五项断言全过。
- [x] 证据边界注记已渲染且位于链条之后 —— 文本序位 `intro=1993 < 末段=2764 < note=3048`。
- [x] §2.2 A–F 六类禁令命中 0 —— 43 个禁词（中英含主体名、政治人名、军工资质、成本数字、客户名单）在 `innerText` 与渲染 HTML 中**全部 0 命中**。
- [x] 桌面 1440 / 1280 与移动 390：横向溢出 **0**，链条 **5** 行，无孤儿卡，断图 **0**（12 张图全加载）。职责矩阵四格等宽（1440/1280 各 `324px`；390 各 `349px` 单列）。
- [x] 编号 `01`–`05` 宽度一致 —— 计算样式实测 `font-variant-numeric: tabular-nums`（不只是类名存在）。
- [x] 单页仅 1 个 `<h1>`；本模块 H2 → H3（4 职责 + 1 集团标题）→ H4（5 个阶段）—— 段界内 h4 恰为 **5**。
- [x] `data-reveal` 入场正常 —— 滚到该段时（挂载后 2.2s，**早于 5 秒 CSS 兜底**）`is-revealed=true`、`opacity=0.851903`（过渡中）→ 是滚动驱动生效，不是被兜底救回。
- [x] lint、typecheck、build 与 `/about` 生产实例冒烟通过 —— `tsc` 0 错误 / `eslint src` 0 问题 / `next build` 退出码 0 / `/about` HTTP 200。

### 核对过程中确认的两处「实现没问题、断言写错了」

1. 我第一版结构断言按「**全页**只有 5 个 h4」写 —— 但 `wheelFactory` / `tireFactory` 本来还有 8 个 h4。改为**限定在段界内**（`company-group-title` 到下一个 `<h2>`）后为 5。**教训：段级断言必须钉住段边界，不能对全页计数。**
2. 第一版 reveal 探测把 iframe 放在 `left:-9999px` —— 移出视口后 `IntersectionObserver` 不触发，于是量到 `opacity=0`，看起来像缺陷。把 iframe 放到可见位置后立刻测到 `is-revealed=true`。**教训：测「滚入视口才显现」的行为，被测元素必须真的在视口里。**

### 未在本轮核对（诚实标注）

- 未做真机屏幕阅读器验证（`aria-labelledby` 挂在 `<ol>` 上的可访问名播报效果未实测）。
- 未做 Safari / Firefox 交叉验证，仅在 Chromium 内核下实测。
- `about.A01`（公司身份）与 `about.A03`（公司核验与联系）**仍无活的子规格** —— 属同一类缺口，本轮未补。
