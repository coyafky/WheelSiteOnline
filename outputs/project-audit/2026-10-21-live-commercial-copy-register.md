# 已公开网站商业表达问题台账

审计日期：2026-10-21<br>
对象：`https://fenghuaitech.store/` 及其公开英文页面<br>
性质：只读内容审计；本文记录问题与待确认事项，不代表已修改网页或批准任何商业承诺。

## 口径与证据边界

- 从公开的 `/llms.txt` 提取并去重 172 个地址，逐页 GET 读取 HTML 主内容；初次请求有 3 次 TLS 读取错误，重试后 172 个地址均返回 200。另核对 3 个未列入该清单的 CMS 测试文章，均返回 200。本次共核对 175 个不同 URL。
- 以下引文取自 2026-10-21 的公开响应。页面可能随 CMS 或部署变化；复核时应重新访问对应 URL。只读检查未登录后台、未提交表单、未触碰生产数据。
- `P0` 表示正式商业发布或开放收录前必须关闭；`P1` 表示影响采购信任、准确性或转化的重大问题；`P2` 表示值得排期的表达优化。当前“临时公开、全站暂不收录”是已授权状态，不把它误记为本次发现的配置事故。
- 必要的技术边界（例如“具体车辆适配须工程确认”）应保留事实含义；问题在于把内部待办、未审定承诺或不清楚的业务口径直接交给客户。本文不建议用未经证实的数字替换占位内容。

## 一、必须审定或撤回的公开内容

| 编号 | 页面与公开原文摘录 | 为什么不适合商业化展示 | 处理方向与验收 | 级别/责任 |
|---|---|---|---|---|
| BC-01 | 五个政策页：[`/support/privacy`](https://fenghuaitech.store/support/privacy)、[`/support/terms`](https://fenghuaitech.store/support/terms)、[`/support/returns`](https://fenghuaitech.store/support/returns)、[`/support/shipping`](https://fenghuaitech.store/support/shipping)、[`/support/warranty`](https://fenghuaitech.store/support/warranty)。页面仍写 `Pending legal review`、`These terms are provisional`；正文包含 `[Assumed — confirm]`。 | 访客会读到尚未确认的合同、退货、贸易、质保与个人信息处理条款；其中一些段落使用确定性的权利义务语气，和“仅为假设”并列，容易造成相互矛盾的预期。 | 法务与业务逐条确认或撤回；未审核条款不作为正式政策公开。验收：五页不再含 `Assumed`、`Pending legal review`、`provisional`，批准版本与生效主体可追溯。 | **P0**；法务、业务负责人 |
| BC-02 | [`/support/privacy`](https://fenghuaitech.store/support/privacy) 的 HTML 标题为 `Staging Test Privacy Notice`，页面顶部还显示中文“询盘模板”“正式版本须经公司与法务确认”。 | 英文正式域名的隐私入口露出测试标题和后台编辑说明；这不是面向客户的隐私告知。 | 与 BC-01 同步处理；验收：标题、顶部正文、表单链接指向同一经批准的隐私版本，英文页不出现编辑说明。 | **P0**；法务、内容负责人 |
| BC-03 | [`/dealers`](https://fenghuaitech.store/dealers) 直接展示 `PLACEHOLDER: shipping incoterms ... must be confirmed before publishing` 和测试报告/认证项目待命名的内部提示。 | 采购方最关心的贸易条件和合规证据未确认，却以内部待办形式公开；同页已有“无需备货”等明确合作承诺。 | 核实可提供的贸易条件、市场文件和合作模式；不能确认的承诺先撤回或改为不作保证的询问入口。验收：公开页无 `PLACEHOLDER`，每项文件与条款有责任主体。 | **P0**；销售、物流、质量负责人 |
| BC-04 | [`/dealers/private-label`](https://fenghuaitech.store/dealers/private-label) 写有最低量、设计独占、地域和模具归属等 6 处 `PLACEHOLDER`；同时出现 `Your Brand on the Wheel, Never Ours` 和保密、独占、样品、生产流程的确定语气。 | 独占、模具所有权、品牌标识及保密义务属于交易核心边界，当前文案把未定条款与已承诺服务混在一起。 | 业务与法务分别确定“标准可提供”“需单独谈判”“不提供”的边界；未批准前不写默认独占或模具归属。验收：本页无内部标记，报价/协议模板与网页口径一致。 | **P0**；业务、法务 |
| BC-05 | [`/custom-development`](https://fenghuaitech.store/custom-development) 公开写 `Pending confirmation`，涉及 OEM/ODM/私牌的模具、独占、最低量和交期；页面其他段落描述了具体样品与量产里程碑。 | “上线前待确认”的内部状态已经出现在上线页；客户可能把示例流程当作已可提供的标准服务。 | 先核对合作模式与交付范围，再把项目特定的条件写成清楚的询价规则。验收：移除内部上线提示；三种模式定义与私牌页一致。 | **P0**；业务、生产负责人 |
| BC-06 | [`/insights`](https://fenghuaitech.store/insights) 与 6 篇指南/孔距页仍含 `PLACEHOLDER`；例如[运费与关税指南](https://fenghuaitech.store/insights/importing-freight-and-duties)要求内部确认 Incoterms，[5×112 指南](https://fenghuaitech.store/insights/bolt-patterns/5x112)要求工程签核车型数据。完整 10 页见附录 A。 | 指南以专业建议形式出现，却含“发布前确认”的编辑指令。即便全站暂不收录，客户仍可直接访问、引用。 | 按段落逐条核实、删掉未核实主张，或撤回整篇；不因构建或 SEO 需要而直接删除标记并保留未经确认的主张。验收：10 页公开正文无 `PLACEHOLDER`，工程及贸易事实有来源。 | **P0**；工程、物流、内容负责人 |
| BC-07 | [`/products/safety-tires`](https://fenghuaitech.store/products/safety-tires) 展示“8 mm”测试物体，同时说明轮胎型号、规格、压力、步骤和结果尚无可公开报告。 | 页面有谨慎限定，但数字仍可能被客户截取为产品级性能承诺；风险来自数字与缺失证据并列。 | 质量与产品负责人确认报告及适用型号；无可公开报告时考虑只描述测试方法与待询证据，不把数字做为对外卖点。验收：所有性能数值能对应具体报告、型号与条件。 | **P1**；质量、产品负责人 |
| BC-08 | [`/products/ev-components`](https://fenghuaitech.store/products/ev-components) 多处使用 `Stated in supplier material`，其中一张候选产品图的“具体零件名称和权利仍在确认”。 | 页面已经对外展示候选产品与图片，但命名、图权、工艺和供货主体的证据层级不一致。谨慎说明有价值，未确认图权和零件身份仍是发布资格问题。 | 逐张核对图片权利、零件名称、制造主体和可提供范围；未确认媒体撤回或用已有合规兜底。验收：公开图、标题和能力表述均有批准记录。 | **P1**；产品、素材权利负责人 |

## 二、误入公开站的内部状态与测试内容

| 编号 | 页面与证据 | 商业影响 | 处理方向与验收 | 级别/责任 |
|---|---|---|---|---|
| BC-09 | Insights 列表公开收录 3 篇内部验证文章：[`ISR Sync Test Post From Ego`](https://fenghuaitech.store/insights/isr-sync-test-post-from-ego)、[`Native Post Media Import Verification`](https://fenghuaitech.store/insights/native-post-media-import-verification)、[`Native WordPress Post Authoring Test`](https://fenghuaitech.store/insights/native-post-authoring-verification)。正文谈 WordPress、REST、Gutenberg 和兼容探针，均返回 200。 | 内容目录把工程验收记录当作客户指南；这些文章还进入相关文章推荐，稀释采购内容与品牌专业度。 | 在 CMS 中按发布流程撤回这 3 篇，并把今后测试内容与公开审批隔离；保留历史记录，勿为清理网页而删除有价值的测试资料。验收：列表、详情、相关文章及未来 sitemap/`llms.txt` 均无这些测试文章。 | **P0**；内容运营、工程 |
| BC-10 | 本次抽到的 **35 个**轮毂详情页，在配置文案中显示 `Recorded (name pending approval)`；代表页为[`/products/wheels/cg02b`](https://fenghuaitech.store/products/wheels/cg02b)。完整 slug 见附录 B。 | 型号已公开，但客户在规格选择处看到“名称待批准”的内部状态；会怀疑型号与报价标识是否最终确定。不能据此推断规格本身错误。 | 产品负责人确认可对外使用的型号名；若仅能用生产代码，就明确以代码为正式展示名，不向访客显示审批工作流。验收：35 页不再出现 `name pending approval`，询盘快照和客户可见名称一致。 | **P1**；产品、销售 |
| BC-11 | [`/products/custom-aluminum`](https://fenghuaitech.store/products/custom-aluminum) 的公开区块标题是 `Not yet confirmed for publication`，并说明内部尚未定“拒接类别”。 | 页面把编辑/发布管理语言直接写给客户，削弱“可以开始评估”的主线；又可能被误读为任何项目都可接。 | 保留“能力须按项目评估”的真实边界；把内部区块从客户页移到编辑审核记录，客户页只说需要哪些输入、评估后给什么答复。验收：无内部发布状态文字，受理范围不被夸大。 | **P1**；产品、内容 |
| BC-12 | 面向 AI 的[`/llms.txt`](https://fenghuaitech.store/llms.txt) 自称公开参考页可能含“illustrative or unverified material”；同页列出询盘确认页。 | 这是对内容可信度的公开自我降级说明，也把非信息内容列给检索系统；不能以免责声明代替事实审定。 | 先完成 BC-01～10，再按合格公开页生成事实索引，移除询盘确认页。验收：列出的每个页面有公开资格，简介只包含可溯源事实。 | **P1**；内容、SEO/GEO |

## 三、商业表达与转化体验

| 编号 | 页面与证据 | 判断与建议 | 级别/责任 |
|---|---|---|---|
| BC-13 | [`/contact`](https://fenghuaitech.store/contact) 有 `Or reach us directly` 标题，紧接着写 `Direct contact details are still being verified`，没有可用的直接联系方式。 | **已证实的入口矛盾。** 在号码与邮箱完成核实之前，移除“直接联系”承诺，明确表单是当前可用通道；获批后再展示真实渠道。验收：所有可见联系 CTA 都能完成对应动作。**P1**；销售、内容。 |
| BC-14 | [`/custom-development`](https://fenghuaitech.store/custom-development) 将 Private Label 定义为“选现有型号加品牌”，而[`/dealers/private-label`](https://fenghuaitech.store/dealers/private-label)说它“不是重新贴牌的目录轮毂”。 | **跨页口径不一致。** 先由业务决定私牌是否有“既有型号贴牌”“客户专属设计”两种方案，再分别命名与说明，不能让同一服务在两个页面互相否定。验收：页面、询盘分流和报价模板使用同一分类。**P1**；业务负责人。 |
| BC-15 | [`/products`](https://fenghuaitech.store/products) 出现 `Shop the range by SKU`、`every orderable wheel`，同页又说明适配和项目条件须逐项确认。 | **表达优化判断。** “Shop/可下单”容易让 B2B 买家认为目录就是可直接订货及适配承诺。建议统一为“按已记录规格查找并发起询价”，保留必要的适配确认。验收：目录 CTA 与实际询盘流程一致。**P2**；产品、内容。 |
| BC-16 | 19 个已核对页面复用 `We will come back with a process route, a tooling position and pricing`，包括[隐私页](https://fenghuaitech.store/support/privacy)、[指南页](https://fenghuaitech.store/insights)和[偏距计算器](https://fenghuaitech.store/tools/offset-calculator)。 | **表达优化判断。** 同一承诺不适合所有页面和四条产品线，也暗示每次询问都会提供模具方案。按页面任务与产品线写下一步；政策页可只保留联系入口。验收：CTA 说明与表单可交付结果一致。**P2**；内容、销售。 |
| BC-17 | [`/insights`](https://fenghuaitech.store/insights) 同屏显示 `09 dossiers`、`9 reference guides` 和 `Six working guides`。 | **已证实的数量冲突。** 不再写死篇数，或从已公开文章集合生成。验收：增减文章后标题、计数和说明一致；已有任务 [`AUD-TASK-014`](../../docs/implementation/TASKS.md)。**P2**；内容、前端。 |
| BC-18 | 四个 HTML 标题重复品牌尾缀，例如[`/products`](https://fenghuaitech.store/products) 的 `... | Fenghuai | Fenghuai`；其余为锻造轮毂、隐私及感谢页。 | **表达与搜索摘要优化。** 去重标题生成规则，不把它提高到内容/法律问题之前。验收：目标页标题只保留一次品牌名。**P2**；前端、SEO。 |
| BC-19 | [首页](https://fenghuaitech.store/)和[关于页](https://fenghuaitech.store/about)强调“同一所有权集团”“深圳项目接口”，但公开正文未直接列出各制造法人的身份及其负责产品。 | **待业务核实的清晰度问题**，并非已证实的虚假陈述。建议由主体负责人确认可披露的企业关系、工厂证据和采购联系人，再以可核查信息说明“谁签约、谁生产、谁出证据”。验收：关键关系有来源，页面能回答采购方的主体问题。**P1**；管理层、业务。 |

## 四、处理顺序与未决信息

1. **先处理公开资格**：BC-01～09。逐条核实事实、法律和图权；无法核实的内容按现有发布资格流程撤回，不能只删掉 `PLACEHOLDER` 字样。
2. **再统一交易口径**：BC-10、13、14、19。确定型号命名、真实联系渠道、私牌方案、制造和签约主体。
3. **最后改表达和转化**：BC-11、12、15～18。根据已批准事实重写，复查页面和 SEO/GEO 输出。

待业务/法务回答的问题：可公开的贸易条件及市场文件；独占与模具归属的标准边界；五类政策的生效版本和法律主体；35 个型号能否正式使用生产代码；EV 产品图权和名称；自密封轮胎测试报告的型号与条件；正式直联渠道；测试文章撤回后的长期测试内容存放方式。

## 附录 A：本次发现含 `PLACEHOLDER` 的 10 个公开 URL

1. <https://fenghuaitech.store/dealers>
2. <https://fenghuaitech.store/dealers/private-label>
3. <https://fenghuaitech.store/insights>
4. <https://fenghuaitech.store/insights/bolt-patterns/5x112>
5. <https://fenghuaitech.store/insights/bolt-patterns/5x114-3>
6. <https://fenghuaitech.store/insights/bolt-patterns/5x120>
7. <https://fenghuaitech.store/insights/finishing-options-explained>
8. <https://fenghuaitech.store/insights/how-to-measure-fitment>
9. <https://fenghuaitech.store/insights/importing-freight-and-duties>
10. <https://fenghuaitech.store/insights/offset-and-backspacing>

## 附录 B：公开配置显示“名称待批准”的 35 个轮毂详情 URL

以下 slug 均接在 `https://fenghuaitech.store/products/wheels/` 后：

`260201004`、`cg02b`、`cg02p`、`dq019209001s3212`、`dq019209011sh3212`、`dx137`、
`f034208511s3324`、`f034209003s6002`、`f034209005s6017`、`f034209015s2051`、`f034209017sh3324`、
`f075208513s6014`、`f075208514s6014`、`f075208519s6068`、`f075209053s6014`、
`hp41167001sx`、`hp41167002sx`、`hp41167003sx`、`hp41167005sx`、`hp41167006sx`、`hp41167007sx`、`hp41167008sx`、`hp41167009sx`、
`ittosai`、`lc2715`、`sr23`、`sy5006`、`y6002`、`ysw-61`、`zkx315`、`zkx319`、`zkx323`、`zs019157021s`、`zs019157022s`、`zy543`。

## 复核信号

- 公开页面（包含列表、详情及推荐位）中，`PLACEHOLDER`、`Assumed — confirm`、`Pending legal review`、测试文章标题、`name pending approval` 的命中数均为 0；每一处清零都必须对应事实批准、改写或撤回记录。
- 五个政策页经专业审核，页面标题、版本、法律主体与询盘说明一致。
- 公开合作承诺、型号名、联系入口、询盘分流及报价模板使用同一已批准口径。
- 全站仍保持当前暂不收录设置，直到独立的正式发布审批通过；本台账完成不自动授权开放搜索收录。
