# Entity 与关系图

> 阶段状态：Entity 定义初稿已完成。实体关系以项目正本、页面规格和一方资料为依据；买家语言及美国 Google SERP 仍待 Topic 阶段验证。

## 网站与公司实体

| ID | Entity | 类型 | 关系/状态 | 来源 |
|---|---|---|---|---|
| ent_site_fenghuai | 丰怀英文优先 B2B/B2C 询盘站 | 网站 | 统一呈现、选型、工程/商务接洽；公开内容受审核门槛控制 | `src_project`、`src_arch` |
| ent_company_shenzhen_fenghuai | 深圳峰徊科技有限公司 | 公司/商业接口 | 与蓝辉及两家供应商为同股东关联的不同法人；正式英文名需批准 | `src_project` |
| ent_supplier_bluehui | 蓝辉 | 供应链/供应商主体 | 资料与资产来源之一；不自动并入峰徊自有工厂/资质 | `src_project`、产品资料 |
| ent_suppliers_other | 其他专业供应商 | 供应链主体 | 具体产品、制造、质量和售后职责须逐项核实 | `src_project` |

## 四条并列产品线 Entity

| ID | Entity | 关联的产品/工艺实体 | 明确边界 | 来源 |
|---|---|---|---|---|
| ent_wheels | Automotive Wheels | Flow-formed wheels；custom forged wheel program；真实轮毂型号/variant | flow forming 与 forging 是不同工艺；锻造为定制服务而非当前库存目录 | `src_project`、`src_spec_wheels`、`src_spec_forged` |
| ent_ev_aluminum | EV Aluminum Components | Water-cooled motor housing；HPDC motor housing；controller/inverter housing | 工程评估类别，不是已核实库存 SKU；供应商资料声明不得升级为峰徊自有产线能力 | `src_spec_ev` |
| ent_custom_aluminum | Custom Aluminum Manufacturing | Drawing/3D/sample-led custom development；DFM/工艺/模具/试制评估 | 定制评估入口；当前公开索引门槛未通过；不能并入所有 EV 应用为已供货品类 | `src_spec_custom` |
| ent_self_sealing_tires | Self-Sealing Tires | Sealing-layer mechanism；tread-puncture scope；供应商资料中的内部测试条件 | 不等同 run-flat 或传统补胎；不使用 self-healing 暗示广泛修复效果 | `src_spec_tires` |

## 买家与采购实体

| ID | Entity | 关系状态 | 需验证的买家任务 |
|---|---|---|---|
| ent_buyer_distributor | 海外经销商/分销商 | 项目目标用户；轮毂相关需求有页面依据 | 采购型号、渠道合作、私牌或批量供应评估 |
| ent_buyer_oem_tier1 | OEM/Tier 1/系统集成商采购与工程人员 | 项目目标用户 | 评估 EV 壳体/定制零件、确认规格和验证文件 |
| ent_buyer_fleet | 车队 | 项目目标用户 | 轮毂/轮胎应用与供应评估 |
| ent_buyer_individual | 海外个人客户/改装用户 | 少量 C 端用户 | 了解规格与技术边界；不承诺具体车型适配或零售服务条款 |

这些角色作为 Entity/Topic 的研究结构，具体关键词、搜索占比和转化优先级仍是 `INFERENCE`，须由本轮 Google SERP 与可用一方证据验证。

## 当前受限实体/关系

- fitment 与 BMW M / Mercedes-AMG / Audi RS 平台：`UNVERIFIED`，不视为可索引实体关系。
- 具体认证、客户、产能、测试性能、价格/MOQ/交期：`UNKNOWN / RESTRICTED`，不因为竞品或 SERP 出现而附加至峰徊。
- EV battery housing、battery tray、cold plate 等：可能属于定制铝制品评估范围，不等于 EV 页面当前产品实体。
- `manufacturer`、`factory`、`OEM supplier` 等组织实体描述：研究可观察需求，但公开语义需先核实真实供货与制造主体。
