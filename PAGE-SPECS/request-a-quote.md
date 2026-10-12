# 项目询盘页 Page SPEC

- 路由：`/request-a-quote`
- 页面类型：四条产品线共用的 B/C 项目询盘入口
- 视口：QF01–QF03
- 状态：应用层已实现并复验（2026-10-08）。QF01–QF03 两步四线/B-C 表单、来源上下文、浏览器幂等、统一 `/api/inquiries`、服务端校验、WordPress 同库事务、outbox、隐私版本门槛、应用层反滥用、感谢页和最小权限角色均已落地。正式隐私文本与联系信息、邮件提供商事件回调、生产平台 cron/边缘限流、预发布 UAT 仍待外部资源。
- 公开语言：英文优先
- 四语接线（2026-10-12）：`request-a-quote` 与 `contact` 是两个独立 WordPress Page 业务正文正本，均有 `en/zh/es/th` 本地批准译文；按钮、标签、状态走 Next.js 本地字典。`privacy` 是独立同意版本门槛，法律/隐私草稿不能因业务正文获批而开放表单。非英语仍不索引。正式批准与商用发布另行验收。
- 结构参考：[2N Request Wheel Quote](https://2nforged.com/contact-us/)；只借鉴低门槛说明、短准备清单、紧凑表单和直接联系兜底
- 后端依据：[数据与询盘设计](../outputs/site-launch-plan/02-data-and-inquiry-design.md)
- 硬规则：正常基准视口中，每个表单步骤必须连同主按钮完整可见；键盘弹出、200% 放大和辅助设备下允许自然滚动

## 1. 页面目标与叙事

页面只完成一件事：把一个可追踪、可回复的真实项目意向安全写入询盘系统。客户不需要在第一次联系前准备完整工程规格，站点也不能用模糊成功提示掩盖数据库或邮件故障。

`/contact` 负责展示已经确认的公司联系方式和进入询盘的入口；`/request-a-quote` 负责结构化收集项目。两页必须共用同一套字段、验证、持久化和成功状态，不能各自实现一套表单。

| 视口 | 客户问题 | 主信息 | 主视觉/交互 | 主行动 |
|---|---|---|---|---|
| QF01 | 我需要准备到什么程度 | 不必备齐全部规格；按当前产品线显示 3–5 条准备提示 | 轻量标题 + 动态准备卡，不用大幅图片 | 开始填写 / 表单首字段 |
| QF02 | 我想询问什么 | 客户类型、产品线、来源产品上下文、项目描述、可选数量 | 两步表单第 1 步 | `Continue` |
| QF03 | 团队怎样回复我 | 姓名、邮箱、国家/市场、条件式公司、可选 Phone/WhatsApp、隐私同意 | 两步表单第 2 步 | `Submit project enquiry` |

QF01 与 QF02 在桌面可合并进同一屏，但只能共同回答“怎样开始这个项目”。移动端若内容高度不足，准备提示折叠成当前产品线的 3 条，不得把 `Continue` 推出正常视口。

## 2. 2N 页面模块的取舍

### 2.1 借鉴

- 页面开头直接说明可以先发已知信息，不制造“规格不完整就不能联系”的压力。
- `What to send` 与短表单相邻，让客户边看边填。
- 首次联系字段保持短小，自由描述承担尚未结构化的工程信息。
- 已确认的直接联系方式放在表单之后，作为网络或表单故障的备用路径。

### 2.2 按峰徊业务重构

| 参考模块 | 峰徊替代 | 验收边界 |
|---|---|---|
| `Request Wheel Quote` | 跨四条产品线的 `Project enquiry` | 默认不把访客写成轮毂客户 |
| 轮毂 `What to send` | 随产品线切换的准备提示 | 不向三电、铝制品或轮胎客户询问 VIN |
| 单页自由表单 | 两步短表单 | 每步必填不超过 3 个，按钮同屏可见 |
| Email/WhatsApp 跟进承诺 | 已确认回复渠道 + 可验证状态 | 未确认官方 WhatsApp 时不显示号码或响应承诺 |
| 质量视频/验厂邀请 | 后续按主体和保密条件确认 | 通用询盘页不承诺所有项目均可验厂或直播 |

不得复制 2N 的品牌、文案、联系方式、WhatsApp 号码、CSS、车型清单、工厂访问承诺或任何表单默认值。

## 3. 页面入口与上下文

### 3.1 入口来源

统一表单接受以下入口：

- 全站 Header、首页 H05、Footer：只有产品线或来源页面上下文；
- 产品线页：自动带入 `productLine`；
- 轮毂详情的“加入总询盘”路径：带入批准的 `model`、`productionCode` 和同一 variant 的规格
  快照；详情页“直接询盘”在当前页弹窗提交，不经过本页，也不读取或清空这里的总询盘清单；
- 轮毂目录：可带入型号，未选择 variant 时不得制造规格快照；
- `/contact`：带入 `from=contact`，不预选未知产品线。

### 3.2 可见上下文条

有上下文时，QF02 顶部显示可读摘要：

`Enquiring about: {product line} / {model or project type} / {approved configuration}`

客户可以移除或更换产品线，但不需要重新键入已经选过的型号和配置。上下文条是便利信息，不是可信数据源；服务端必须复核型号、生产代码和批准状态，再生成不可变快照。

没有上下文时不显示空条，也不显示 `Coming soon`。

### 3.3 来源归因

内部可记录首个来源 URL、提交页、UTM、referrer 和发生时间，但这些字段：

- 不拼进客户消息正文；
- 不在成功页 URL 中公开；
- 不用来绕过服务端产品校验；
- 按隐私政策规定的期限保存。

## 4. QF01：低门槛说明与准备提示

### 4.1 可直接录入的英文内容

**Eyebrow**：`PROJECT ENQUIRY`

**H1**：`Tell us what you need to source or develop`

**Lead**：`Choose a product line and send what you already know. A model number, drawing status or application description is enough to start the review.`

**Supporting**：`You do not need every specification ready. Missing technical details are confirmed before quotation or production approval.`

**Preparation label**：`Useful details, if available`

### 4.2 动态准备提示

准备提示来自类型化内容，不写死在组件中。每次只显示当前产品线的 3–5 条：

| 产品线 | 提示内容 |
|---|---|
| Wheels | model or design reference；recorded configuration or target size；vehicle/application；quantity；destination market |
| EV aluminum components | part category；2D/3D data status；cooling/sealing/interface requirements；prototype or annual quantity；target market |
| Custom aluminum | drawing/3D data/sample status；part function；material or performance target；quantity；destination market |
| Self-sealing tires | tire size/model；vehicle or fleet use；dealer/fleet/individual context；quantity；market and required test documents |

如果客户尚未选择产品线，只显示三条通用提示：项目对象、已有资料、预计数量/市场。不得一次铺开四套清单。

### 4.3 布局

- 不使用全屏产品图、轮毂草图或自动轮播。
- 桌面标题区控制在约 220–280px 高，下面立即进入 QF02。
- 移动端 H1、Lead、三条提示和首个字段应在一次短滚动内出现。
- 页面加载后不自动把焦点抢到表单；锚点入口进入页面时可以聚焦 step 标题。

## 5. QF02：我想询问什么

### 5.1 字段

| 字段 | 类型 | 必填 | 规则 |
|---|---|---:|---|
| `customerType` | 单选 | 是 | `Business` / `Individual`；不预设 |
| `productLine` | 单选卡或原生 select | 是 | 四条正式产品线；有合法上下文时预选 |
| `message` | textarea | 是 | 10–5000 字符；说明需求、应用或问题 |
| `quantity` | text | 否 | 允许 `prototype`、`10 sets`、`500/year` 等真实表达，不强制纯数字 |
| `inputsAvailable` | 多选 | 否 | `2D drawing` / `3D data` / `physical sample` / `product code` / `none yet`；按产品线显示 |

本步必填共 3 个。产品上下文来自详情页时仍可见，但不作为第四个让客户重复填写的必填项。
总询盘清单中每个 `items[].quantity` 是独立的单配置正整数，没有业务上限；这里的 `quantity`
仍是项目规模文本。两者不能互相覆盖或用 999 等任意数字限制。

### 5.2 英文内容

- Step：`Step 1 of 2`
- H2：`What are you asking about?`
- Message label：`Describe the part, product or result you need`
- Message help：`Include the application, known specifications, quantity or market if you have them.`
- 主行动：`Continue`

### 5.3 行为

- 点击 `Continue` 只做本步前端校验，不向服务器创建询盘。
- 错误显示在字段旁，同时把焦点移到第一个错误；错误摘要不得代替就地说明。
- 从 QF03 返回时完整保留本步内容和合法产品上下文。
- 不用 `localStorage` 长期保存姓名、邮箱或消息；同一次页面会话的 React 状态即可。
- `inputsAvailable` 只说明资料存在，不提供首发文件上传控件。

## 6. QF03：团队怎样回复我

### 6.1 字段

| 字段 | 类型 | 必填 | 规则 |
|---|---|---:|---|
| `name` | text | 是 | `autocomplete=name`，1–120 字符 |
| `email` | email | 是 | `autocomplete=email`，服务端重新验证 |
| `country` | 国家/市场 select | 是 | 存 ISO 代码与显示名；不使用国旗作为唯一标识 |
| `company` | text | 否 | B 端选择后显示，C 端隐藏或选填；首轮不因公司为空阻止提交 |
| `whatsapp` | tel | 否 | 标签写 `Phone or WhatsApp`；客户主动选择该渠道才收集 |
| `privacyConsent` | checkbox | 是 | 不与营销订阅合并；存版本和同意时间 |

本步业务字段只要求姓名、邮箱和国家；公司保持可选，隐私同意属于提交的合法性门槛。实施前必须通过 390×844 视口验证；若按钮被推出视口，优先折叠可选联系渠道，不能压缩标签或隐私文字。

### 6.2 英文内容

- Step：`Step 2 of 2`
- H2：`How should we reply?`
- 隐私同意：`I agree that Fenghuai may use the information provided to review and respond to this enquiry.`
- 主行动：`Submit project enquiry`
- 次行动：`Back`

在 `Fenghuai` 或相邻位置链接已批准的隐私政策；政策未完成时不得用空链接，也不得公开表单。

### 6.3 直接联系兜底

表单之后只显示已确认并完成责任人配置的正式销售邮箱。官方 WhatsApp 或电话只有在号码、工作时间、责任人和隐私流程确认后才显示；不展示私人号码或来源公司未授权的联系方式。

兜底文字：`If the form is unavailable, send the same project details to {confirmed sales email}.`

正式邮箱尚未确认时，隐藏整个兜底模块，不能显示 `PLACEHOLDER`。

## 7. 提交、持久化与状态

### 7.1 提交顺序

```text
客户端校验
→ 服务端校验与反滥用
→ 复核产品上下文
→ 同一数据库事务写 inquiry + item/context snapshot + consent + outbox
→ 返回 201 和询盘号
→ 异步发送通知与回执
→ 邮件事件单独更新 accepted/delivered/bounced/unknown
```

只有数据库事务提交成功后才能显示成功。邮件服务商接受请求不等于邮件送达，也不能作为创建询盘的依据。

### 7.2 幂等与重复提交

- 客户端进入页面或首次开始填写时生成 `idempotencyKey`；重试复用同一键。
- 提交后立即禁用按钮并显示明确进行中状态，但服务端仍必须做唯一约束。
- 同一键重复请求返回同一询盘号，不创建第二条记录或第二封 outbox。
- 客户修改项目后主动“再提交”需要新的键。

### 7.3 成功

成功后进入 `/thank-you`，使用服务端签发的短期状态或仅包含不可猜测引用标识；URL 不携带姓名、邮箱、公司、消息或规格全文。

- 标题：`Your enquiry has been recorded`
- 正文：`Reference: {inquiryNumber}. Keep this number for follow-up.`
- 通知未完成时：`The enquiry is recorded. Email delivery status does not affect this reference.`

不得显示“确认邮件已送达”“销售已经收到”“将在一个工作日回复”等无法验证的结果或 SLA。

### 7.4 失败

| 状态 | 页面行为 |
|---|---|
| 422 字段错误 | 留在当前步骤，就地提示并聚焦第一个错误 |
| 409/幂等重放 | 返回原询盘号，不显示重复错误 |
| 429 超限 | 保留全部输入，说明稍后重试；提供已确认直接渠道 |
| 数据库/事务失败 | 明确 `Your enquiry was not submitted`，保留输入，不跳成功页 |
| 网络失败 | 保留输入，允许使用同一幂等键重试 |
| 数据已存、邮件失败 | 正常显示询盘号，邮件状态单独说明，不要求客户重复提交 |

当前生产路径没有真实持久化配置时，应返回不可用状态并显示诚实失败；不能继续使用内存 Map 后向客户声称“已安全记录”。

## 8. 数据契约

页面组件消费适配后的内容和表单契约，不直接读取 WordPress 原始字段：

```ts
type ProductLineId =
  | "wheels"
  | "ev-components"
  | "custom-aluminum"
  | "safety-tires";

type InquiryDraft = {
  customerType: "business" | "individual";
  productLine: ProductLineId;
  message: string;
  quantity?: string;
  inputsAvailable: string[];
  name: string;
  email: string;
  countryCode: string;
  company?: string;
  whatsapp?: string;
  privacyConsent: true;
  privacyVersion: string;
  idempotencyKey: string;
  context: InquiryContext;
};
```

正式实现该类型会改变现有 `InquiryInput` 和 WordPress/前端接缝，必须按 AGENTS §7.1 记录新的架构决策。本文件只定义目标，不在本次文档任务中修改 `src/content/types.ts`。

### 8.1 现有字段迁移

| 现有字段/行为 | 目标 |
|---|---|
| `company` 对所有人必填 | 只对 B 端条件式处理；C 端不阻塞 |
| `vehicle` 必填 | 仅轮毂准备提示或上下文字段，不作为跨产品线必填 |
| `family: ProductFamily` | 改为四条正式 `ProductLineId`，复用全站同一数据源 |
| `finish` 独立填写 | 轮毂详情从批准 variant 带入；其他入口不通用展示 |
| `quantity` 必填且必须有数字 | 可选文本，允许样件或年需求表达 |
| 仅 name/email/message 的服务端硬校验 | 增加客户类型、产品线、国家、隐私版本、幂等键与上下文复核 |
| `delivered: boolean` | 分离持久化结果与邮件 accepted/delivered/bounced/unknown |

## 9. 文件与保密资料

首发不提供附件上传。客户只选择是否已有 2D、3D 或样件，询盘生成后再由已确认流程交换资料。

后续增加附件必须同时具备：私有对象存储和短期签名 URL；扩展名、MIME、大小和病毒扫描；访问日志、保留期限和删除机制；NDA 与文件所有权提示；文件记录与询盘的权限绑定；上传失败不会让已经保存的文本询盘丢失。

不把工程图上传到 WordPress 媒体库，不用公开 URL 保存客户文件。

## 10. 反滥用、安全与隐私

- 服务端验证所有字段长度、枚举、产品上下文和来源；客户端验证只改善体验。
- 使用 honeypot、时间陷阱、Origin/CSRF 防护、IP/邮箱维度限流和幂等键。
- 首发不强制可见 CAPTCHA；出现真实滥用再启用可访问的风险挑战。
- 应用日志不输出消息全文、邮箱、电话、图纸名或完整请求体。
- 隐私同意存 `privacyVersion`、`consentedAt` 和来源；营销订阅必须另设未勾选选项。
- 成功页 `noindex`；询盘页可以 `index,follow`，但不把用户输入写入 metadata、URL 或分析事件名。

## 11. 可访问性与响应式

### 桌面 1440×900

- 内容最大宽度约 1040–1120px；表单主体约 620–720px，准备提示可在右侧窄栏。
- 当前步骤从标题到主按钮完整可见；不要在同屏增加产品推荐或第二个主 CTA。
- 步骤指示器使用文本 `Step 1 of 2` / `Step 2 of 2`，当前步骤带 `aria-current="step"`。

### 移动 390×844

- 单列，标签永远在字段上方；选择卡在空间不足时改原生 select。
- 每一步的必填字段、隐私同意和按钮在正常视口内完成；公司条件字段导致超高时优先降低其首填要求。
- 软键盘弹出后允许自然滚动，按钮不使用遮挡输入的固定底栏。
- 国家字段使用可键盘操作的控件；错误、提交中和成功状态使用 `aria-live`。

### 通用

- 每个输入有永久 label、help、错误 ID 与 `aria-describedby`。
- 错误不用颜色作为唯一线索；提交中按钮保留原宽度，避免布局跳动。
- 200% 放大无横向滚动；Tab 顺序与视觉顺序一致。
- `prefers-reduced-motion` 下取消步骤切换位移；无 JS 时至少显示已确认直接联系渠道，不能显示一个无法工作的假表单。

## 12. SEO 与分析

- Title：`Request a Project Quote | Fenghuai`
- Description：`Send a wheel, EV aluminum component, custom aluminum or self-sealing tire project enquiry to Fenghuai.`
- canonical：`/request-a-quote`
- robots：`index,follow`
- 页面类型可使用 `ContactPage`/`WebPage`，但没有正式电话和工作时间时不生成虚构 `ContactPoint`。
- 分析事件只记录步骤开始、验证失败类别、提交结果、产品线和来源类别；不记录消息、邮箱、电话、公司名或产品文件名。
- 统计漏斗：进入 QF01 → 完成 QF02 → 提交 QF03 → 持久化成功；邮件投递不算前端转化成功条件。

## 13. 组件与内容接缝

### 复用并改造

- `QuoteContextBar`：显示并允许清除合法上下文；服务端重新复核。
- `InquiryForm`：拆成两步，去掉轮毂专属 `ProductFamily` 依赖。
- 统一按钮、字段、错误摘要、`DataNotice` 和页面容器令牌。
- `/contact`、轮毂详情和产品线页调用同一 `InquiryForm` 核心契约；嵌入式版本可缩短说明，不能改变后端语义。

### 删除或替换

- 删除当前 PageHero 中 `Go to the form` 的中间跳转；进入页面即看到说明与表单。
- 删除跨产品线不成立的 `Wheel enquiry`、车型必填、系列必填和 finish 通用字段。
- 替换 `safely recorded`、`confirmation is on its way`、`sales team will follow up` 等超前承诺。
- 不再向 `InquiryForm` 传 `productFamilies`；改传全站唯一 `productLines`。

所有公开文案放在 `src/content/*.ts`，组件不硬编码营销文字。四条产品线名称与 Header、首页和产品中心共用同一数据源。

## 14. 发布门槛与验收

### 发布门槛

- [ ] 正式隐私政策已批准并有真实版本号。
- [ ] 正式销售邮箱已确认；若显示 WhatsApp/电话，责任人和工作流程也已确认。
- [x] WordPress 同库持久化、事务 outbox、幂等唯一约束已运行。
- [x] 生产写入路径不再使用进程内 Map 保存询盘。
- [x] 产品上下文由服务端复核并保存快照。
- [ ] 邮件 accepted、delivered、bounced、unknown 与询盘保存状态分开。
- [ ] 四条产品线与 B/C 路径均完成真实提交测试。
- [x] 没有工程文件公开上传路径。

### 功能验收

- [ ] 无来源上下文、产品线来源、轮毂型号来源、批准 variant 来源四种入口正确。
- [x] B 端显示公司字段；C 端不因公司为空被阻止。
- [x] 每步必填不超过 3 个；桌面与移动基准视口均看见主按钮。
- [x] 前进、后退、校验失败和网络重试不丢当前输入。
- [x] 双击提交或超时重试只产生一个询盘号。
- [x] 数据库失败绝不跳转成功页。
- [x] 数据已存而邮件失败时仍显示同一询盘号，且不要求重复提交。
- [x] 直接访问 `/thank-you` 不能伪造成功；只有 15 分钟内的 HMAC 回执可显示已记录状态。

### 内容与视觉验收

- [x] 页面没有 2N 品牌、文案、联系方式、图片或专有样式残留。
- [x] 准备提示只对应当前产品线，不一次铺开四套内容。
- [x] 页面不用工厂图、事故图或轮毂图抢占表单主任务。
- [x] 无正式 WhatsApp 时不显示号码或响应承诺。
- [x] 未验证 SLA、确认邮件、报价时限、验厂和生产结果均未出现。

### 工程验收

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [ ] 生产实例运行时验证 201 / 422 / 429 / DB 失败 / 邮件失败 / 幂等重放。
- [ ] canonical、robots、成功页 noindex 与敏感 URL 检查通过。
- [ ] 日志抽查没有 PII 或消息全文。
