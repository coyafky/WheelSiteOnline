# -*- coding: utf-8 -*-
"""
Chinese translations for the WordPress site-page content, keyed by the exact
English source string.

Why a separate data module: the generator (`make-locale-content.py`) is
page-agnostic; this file is the per-page word list. Adding a page means adding
one key to TRANSLATIONS_ZH — no logic changes.

⚠️ This is a PREVIEW-build seed. It proves the per-locale content seam works
end to end. Production-grade translation is a separate reviewed task; the
generator reports every string it could not translate so gaps stay visible
instead of silently shipping English.
"""

TRANSLATIONS_ZH: dict[str, dict[str, str]] = {
    # ════════════════════════════════════════════════════════════════════════
    # Home page (key: "home")
    # ════════════════════════════════════════════════════════════════════════
    "home": {
        # hero
        "Four product lines · One project interface": "四条产品线 · 一个项目接口",
        "Automotive components backed by specialized manufacturing": "以专业制造能力支撑的汽车部件",
        "Fenghuai integrates wheel, EV housing, custom aluminium and self-sealing tire manufacturing under one commercial interface — so a program can move from requirement to approved supply without changing counterparties.":
            "丰怀将轮毂、电驱壳体、定制铝制品与自密封轮胎的制造能力整合在同一个商务接口之下——让一个项目从需求提出到稳定供货，全程不必更换对接方。",
        "Fenghuai integrates wheel, EV housing, custom aluminum and self-sealing tyre manufacturing for overseas buyers—from requirement review and engineering input to production documentation.":
            "丰怀面向海外买方，整合轮毂、电驱壳体、定制铝制品与自密封轮胎的制造能力——从需求评审、工程输入一直到生产文件。",

        # hero actions
        "Explore product lines": "浏览产品线",
        "Explore all product lines": "浏览全部产品线",
        "Request a project review": "申请项目评估",

        # capabilities block
        "What we actually run": "我们实际运行的能力",
        "Manufacturing routes, stated plainly": "制造路线，如实说明",
        "Every claim below maps to a process we operate or supervise. Where a capability is supplier-stated rather than audited in-house, we say so.":
            "以下每一项能力都对应我们实际运营或监管的工序。若某项能力为供应商自述而非我们内部审核确认，我们会明确标注。",
        "Capability is useful only when its scope and evidence are clear":
            "能力只有在范围与证据清晰时才有意义",
        "Manufacturing and engineering": "制造与工程",
        "Manufacturing is carried out across our specialized production bases. The responsible facility, capability, certification and supply scope are confirmed for each project.":
            "制造在各专业生产基地完成。每一个项目都会确认对应的责任工厂、能力范围、认证情况与供货范围。",
        "Product-specific processes": "按产品区分的工序",
        "Choose the line that matches the part or supply requirement. Product data, manufacturing route and validation evidence are reviewed within that line rather than treated as one universal process.":
            "请选择与零件或供货需求匹配的产品线。产品数据、制造路线与验证证据都在该产品线内评估，而不会当作一套通用流程处理。",
        "Forged wheel production": "锻造轮毂生产",
        "Monoblock, two-piece and flow-formed wheels from 6061-T6 blanks, machined and finished in-house.":
            "以 6061-T6 铝坯生产的单片式、双片式与旋压轮毂，机加工与表面处理均由自有产线完成。",
        "Casting and forming routes": "铸造与成形路线",
        "Gravity casting, low-pressure casting, flow forming, die casting and forged blank supply across the component lines.":
            "覆盖各产品线的重力铸造、低压铸造、旋压成形、压铸与锻坯供应。",
        "Gravity casting, low-pressure casting, flow forming, die casting and forging are route options across defined product lines.":
            "重力铸造、低压铸造、旋压成形、压铸与锻造，是各已定义产品线可选的工艺路线。",
        "See manufacturing & quality": "查看制造与质量",
        "Wheels": "轮毂",
        "EV housings": "电驱壳体",
        "Custom aluminum": "定制铝制品",
        "Product lines": "产品线",
        "All project lines": "全部项目线",
        "Route dependent": "按路线而定",
        "Product and market dependent": "按产品与市场而定",
        "Aluminum component machining resources are assigned to the approved aluminum component route.":
            "铝制部件加工资源按已批准的铝制品路线配置。",
        "Wheel forming and production equipment support the route selected for the approved wheel program.":
            "轮毂成形与生产设备为已批准轮毂项目所选定的路线提供支撑。",
        "A dedicated hot-melt coating line supports approved self-sealing tire programs and their documented process route.":
            "专用热熔涂覆产线为已批准的自密封轮胎项目及其有记录的工序路线提供支撑。",
        "Machining and housing production resources are assigned to the approved aluminum component route.":
            "机加工与壳体生产资源按已批准的铝制部件路线配置。",

        # delivery / project development
        "From requirement to approved supply": "从需求到批准供货",
        "One project interface, product-specific manufacturing routes": "一个项目接口，按产品定制的制造路线",
        "Fenghuai coordinates one commercial and project interface in Shenzhen, then routes each requirement to the manufacturing entity that actually owns the process.":
            "丰怀在深圳统一承接商务与项目接口，再将每一项需求转交给真正拥有该工序的制造主体。",
        "How projects are developed": "项目如何推进",
        "Four product lines, each with its own engineering route": "四条产品线，各自拥有独立的工程路线",
        "Fenghuai coordinates one commercial and project interface in Shenzhen across our specialized manufacturing bases. Those bases sit within the same ownership group and together cover material, tooling, casting and precision machining stages. The responsible facility, process route, validation plan and document set are confirmed for the selected product line.":
            "丰怀在深圳统一承接商务与项目接口，协调各专业生产基地。这些基地同属一个所有权集团，共同覆盖材料、模具、铸造与精密加工环节。针对所选产品线，我们会确认责任工厂、工序路线、验证方案与文件清单。",
        "Start with your input": "从您已有的资料开始",
        "Drawings, 3D data, samples and application requirements are reviewed before a route is confirmed.":
            "在确认路线之前，我们会先审阅图纸、3D 数据、样件与应用需求。",
        "Select or develop the product": "选定或开发产品",
        "Identify the manufacturing entity, process scope, engineering owner and evidence needed for the project.":
            "明确制造主体、工序范围、工程负责人以及项目所需的证据。",
        "Engineering review": "工程评审",
        "Review an existing specification, or proceed through tooling, trial and first-article work where development is required.":
            "审阅现有规格；若需要开发，则依次推进模具、试制与首件工作。",
        "Inspection and validation": "检验与验证",
        "Dimensions, balance, leak boundaries, fatigue or puncture conditions are planned for the applicable product and market.":
            "根据适用产品与目标市场，规划尺寸、平衡、密封边界、疲劳或穿刺等验证条件。",
        "Supply with records": "带记录供货",
        "Confirm repeatability, traceability, packaging and the documents required for the approved order or batch.":
            "确认重复性、可追溯性、包装方式，以及已批准订单或批次所需的文件。",
        "Inspect and approve": "检验与批准",
        "Evaluate agreed characteristics and applicable validation evidence before the supply baseline is released.":
            "在放行供货基准之前，评估约定的特性指标与适用的验证证据。",
        "Precision machining": "精密加工",
        "Critical bores, faces, interfaces and datums are machined and inspected against the approved drawing.":
            "关键孔位、端面、配合面与基准按已批准图纸进行加工与检验。",
        "Joining, coating, heat treatment or sealing-layer application is included only where the approved product route requires it.":
            "连接、涂覆、热处理或密封层施加，仅在已批准的产品路线有要求时纳入。",
        "Certificates, test reports and inspection records are checked for the legal entity, scope, product and validity.":
            "对证书、检测报告与检验记录，按其法人主体、范围、产品与有效期逐项核查。",
        "Approved project evidence": "已批准项目证据",
        "Documented evidence": "有据可查的证据",
        "Start from a recorded wheel variant, a drawing, 3D data, a sample or a tire supply requirement.":
            "从已记录的轮毂变体、图纸、3D 数据、实物样件或轮胎供货需求出发。",
        "Define the requirement": "确认需求",
        "Confirm the responsible route": "确认责任路线",
        "Start from a recorded wheel variant, a drawing, 3D data, a sample or a supply requirement — not from a catalogue guess.":
            "从已记录的轮毂变体、图纸、3D 数据、实物样件或供货需求出发——而不是凭目录猜测。",

        # delivery evidence cards
        "Our wheel manufacturing base": "我们的轮毂生产基地",
        "Aerial view of the Fenghuai wheel manufacturing facility": "丰怀轮毂制造基地鸟瞰图",
        "Our wheel manufacturing facility": "我们的轮毂制造工厂",
        "Wheel casting production line inside a Fenghuai manufacturing facility":
            "丰怀制造基地内的轮毂铸造产线",
        "Our aluminum component base": "我们的铝制部件生产基地",
        "Aluminum component machining workshop inside a Fenghuai manufacturing facility":
            "丰怀制造基地内的铝制部件加工车间",
        "Fenghuai aluminum component manufacturing base": "丰怀铝制部件制造基地",
        "Our self-sealing tire production base": "我们的自密封轮胎生产基地",
        "Robotic hot-melt coating line inside a Fenghuai self-sealing tire production facility":
            "丰怀自密封轮胎生产基地内的机器人热熔涂覆产线",
        "Fenghuai self-sealing tire production base": "丰怀自密封轮胎生产基地",
        "Fenghuai wheel manufacturing base": "丰怀轮毂制造基地",
        "Explore wheels": "浏览轮毂",
        "Review EV housing categories": "查看电驱壳体分类",
        "Review self-sealing tires": "查看自密封轮胎",

        # closing
        "Start with what you have": "从您现有的资料开始",
        "Send a model, a drawing or the requirement you need to solve":
            "把型号、图纸或需要解决的问题发给我们",
        "Tell us the product line, destination market and what information is already available. We will use the enquiry reference to continue the specification and evidence review.":
            "请告知产品线、目标市场以及目前已具备的资料。我们会用询盘编号继续推进规格与证据的核对。",
        "Suggested starting inputs": "建议的起始资料",
        "Recorded model or complete wheel specification": "已记录的型号或完整的轮毂规格",
        "2D drawing, 3D data or authorized physical sample": "2D 图纸、3D 数据或经授权的实物样件",
        "Application, quantity, market and required documents": "应用场景、数量、市场与所需文件",
        "Start a production conversation": "开启生产对话",
        "Bring us the brief": "把需求交给我们",
        "Share the drawing, fitment or supply requirement. We will route it to the right product line and reply with the next information we need.":
            "请把图纸、适配信息或供货需求发给我们。我们会转交至对应的产品线，并回复下一步需要补充的资料。",
        "What are you building?": "您在做什么产品？",

        # never-translated structural values (kept here so the report stays honest)
        "aluminum-production": "aluminum-production",
        "tire-production": "tire-production",
        "wheel-manufacturing": "wheel-manufacturing",
        "verified": "verified",
        "#product-lines": "#product-lines",
    },

    # ════════════════════════════════════════════════════════════════════════
    # About page (key: "about")
    # ════════════════════════════════════════════════════════════════════════
    "about": {
        # ── hero ──────────────────────────────────────────────────────────
        "Company": "公司",
        "About Fenghuai": "关于丰怀",
        "One Shenzhen project interface. Specialized manufacturing behind every line.":
            "一个深圳项目接口，每条产品线背后都有专业制造能力。",
        "Shenzhen Fenghuai Technology coordinates overseas automotive component programs across wheels, EV aluminum housings, custom aluminum parts and self-sealing tyres.":
            "深圳丰怀科技负责统筹海外汽车部件项目，覆盖轮毂、电驱铝制壳体、定制铝制品与自密封轮胎。",
        "Shenzhen Fenghuai Technology Co., Ltd.": "深圳丰怀科技有限公司",
        "Shenzhen, China": "中国·深圳",
        "Shenzhen · China": "中国·深圳",
        "English-first for overseas enquiries": "海外询盘以英文为主",
        "Public language": "对外语言",
        "Discuss a project": "洽谈项目",
        "Explore product lines": "浏览产品线",

        # ── role / group structure ────────────────────────────────────────
        "Business model": "业务模式",
        "A clear commercial interface, with the responsible factory kept visible":
            "清晰的商务接口，责任工厂始终可见",
        "Fenghuai organizes the customer-facing project in Shenzhen. Manufacturing, engineering evidence and market documents remain tied to the legal entity and production base responsible for the selected product.":
            "丰怀在深圳负责面向客户的项目组织。制造过程、工程证据与市场文件，始终归属于所选产品对应的法人主体与生产基地。",
        "Requirement intake": "需求受理",
        "We record the product, application, market, quantity and documents you already have.":
            "我们记录产品、应用场景、目标市场、数量以及您已提供的文件。",
        "Engineering coordination": "工程协调",
        "The applicable manufacturing team reviews drawings, samples, variants and process questions.":
            "由对应的制造团队审阅图纸、样件、变体与工艺问题。",
        "Commercial follow-through": "商务跟进",
        "One project reference keeps quotation scope, changes, timing and delivery requirements connected.":
            "一个项目编号串联报价范围、变更、时间节点与交付要求。",
        "Company verification and contact": "公司核验与联系",
        "Legal name, location and commercial authorization":
            "法定名称、所在地与商务授权",
        "Manufacturing entity": "制造主体",
        "Holder, model scope, destination market, validity and publishable copy":
            "持证人、型号范围、目标市场、有效期与可公开文案",
        "Market documentation": "市场文件",
        "Model, size, method, conditions, date, test party and result":
            "型号、规格、方法、条件、日期、测试方与结果",
        "Tyre-model evidence": "轮胎型号证据",
        "Process scope": "工序范围",
        "Program scope": "项目范围",
        "Project interface": "项目接口",
        "Company verification and contact": "公司核验与联系",
        "Group structure": "集团结构",
        "How the group works": "集团如何运作",
        "One ownership group, organised as an integrated chain":
            "一个所有权集团，按纵向一体化链条组织",
        "The manufacturing companies operate within the same ownership group. Contracts, certifications, patents and test evidence continue to identify the actual legal entity and applicable scope.":
            "各制造公司同属一个所有权集团。合同、认证、专利与测试证据，仍然指向实际承担责任的法人主体与适用范围。",
        "The product lines on this site are served by production companies under the same ownership. Material, tooling, casting, precision machining and finished-product work sit in specialist operating companies rather than one general workshop, so each project is routed to the stage and the entity that actually performs the work — and that entity is the one named in the documents.":
            "本站各产品线由同一所有权下的生产公司承担。材料、模具、铸造、精密加工与成品制造分别落在专业化的运营公司，而不是集中在一个通用车间。因此每个项目都会被转交到真正执行该工序的阶段与主体，而文件中署名的正是该主体。",
        "This describes how the group is organised, not what any one company has been verified to do. Capacity, certification, patent, customer and test claims are not inherited from the group: each is confirmed against the entity, product and market that actually holds it.":
            "此处描述的是集团的组织方式，而非任何单一公司已被核实具备的能力。产能、认证、专利、客户与测试方面的表述不会从集团层面继承：每一项都会对照实际持有该资质的法人主体、产品与市场单独确认。",
        "The entity, process and product documents must match":
            "法人主体、工序与产品文件必须相互对应",

        # ── wheel factory ─────────────────────────────────────────────────
        "Wheel manufacturing base": "轮毂生产基地",
        "A specialized production base for wheel programs": "面向轮毂项目的专业生产基地",
        "Our wheel manufacturing base combines forming, machining and finishing resources for approved wheel and aluminum-component programs.":
            "我们的轮毂生产基地整合成形、机加工与表面处理资源，服务于已批准的轮毂与铝制部件项目。",
        "Robotic equipment on an enclosed self-sealing tyre production line":
            "封闭式自密封轮胎产线上的机器人设备",
        "Capabilities reviewed for each wheel program": "每个轮毂项目都会核查的能力",
        "Visible stages, shown as evidence rather than a universal sequence":
            "展示可见的工序阶段，作为证据而非通用顺序",
        "The images document equipment and working areas supplied for this product line. Final process flow, operating parameters and inspection points are confirmed against the applicable tyre and control plan.":
            "这些图片记录了该产品线所配备的设备与作业区域。最终工艺流向、运行参数与检验点，会对照适用的轮胎与控制计划确认。",
        "Material-processing stage": "材料加工阶段",
        "Alloy and mould engineering": "合金与模具工程",
        "Alloy material": "合金材料",
        "Base alloy melted and cast for the downstream forming and machining stages.":
            "基础合金经熔炼与铸造后，进入后续成形与机加工阶段。",
        "Mould and tooling": "模具与工装",
        "Mould and tooling engineered and built for the approved part geometry.":
            "按已批准的零件几何形状设计并制造模具与工装。",
        "Casting and forming": "铸造与成形",
        "Casting resources support approved wheel and aluminum-component programs. The route is confirmed against the design and required properties.":
            "铸造资源服务于已批准的轮毂与铝制部件项目。具体路线对照设计与所需性能确认。",
        "Gravity and low-pressure casting": "重力铸造与低压铸造",
        "Flow forming": "旋压成形",
        "Machining and housing production resources are assigned to the approved aluminum component route.":
            "机加工与壳体生产资源按已批准的铝制部件路线配置。",
        "CNC machining": "CNC 机加工",
        "CNC machining establishes controlled dimensions and interfaces. Inspection requirements are defined with the approved drawing.":
            "CNC 机加工用于保证受控尺寸与配合面。检验要求按已批准图纸确定。",
        "Precision machining": "精密加工",
        "Critical bores, faces, interfaces and datums machined against the approved drawing.":
            "关键孔位、端面、配合面与基准按已批准图纸加工。",
        "Heat treatment and shot blasting": "热处理与抛丸",
        "Surface preparation and coating": "表面预处理与涂覆",
        "Surface preparation and coating are planned around the approved finish, appearance standard and service environment.":
            "表面预处理与涂覆，围绕已批准的表面处理、外观标准与使用环境来规划。",
        "Coating and finishing": "涂覆与表面处理",
        "Finished component": "成品部件",
        "Product-specific finishing or assembly where the route requires it, then inspection and supply documentation.":
            "在路线需要时进行按产品定制的表面处理或装配，随后执行检验并出具供货文件。",
        "Capabilities reviewed for each wheel program": "每个轮毂项目都会核查的能力",
        "See manufacturing": "查看制造",
        "View manufacturing and quality": "查看制造与质量",
        "Discuss a wheel program": "洽谈轮毂项目",

        # wheel factory workshops
        "Casting workshop": "铸造车间",
        "Casting workshop for wheel and aluminum-component programs":
            "面向轮毂与铝制部件项目的铸造车间",
        "Casting and forming": "铸造与成形",
        "Processing equipment in the wheel manufacturing base": "轮毂生产基地内的加工设备",
        "Machining workshop": "机加工车间",
        "CNC machining workshop for wheels and aluminum components":
            "面向轮毂与铝制部件的 CNC 机加工车间",
        "Precision machining": "精密加工",
        "Coating and finishing line for approved product programs":
            "面向已批准产品项目的涂覆与表面处理产线",
        "Coating line inside the wheel manufacturing base": "轮毂生产基地内的涂覆产线",
        "Coating and finishing": "涂覆与表面处理",
        "Coating and finishing line for approved product programs":
            "面向已批准产品项目的涂覆与表面处理产线",

        # wheel factory capabilities list
        "Gravity casting, low-pressure casting, die casting, flow forming and forging, selected by the approved route.":
            "重力铸造、低压铸造、压铸、旋压成形与锻造，按已批准路线选用。",
        "Alloy material selected and controlled for the approved part specification.":
            "合金材料按已批准的零件规格选用并管控。",
        "CNC machining of critical bores, faces, interfaces and datums.":
            "对关键孔位、端面、配合面与基准进行 CNC 机加工。",
        "Coating and finishing planned around the approved appearance standard.":
            "涂覆与表面处理按已批准的外观标准规划。",
        "Inspection records aligned with the applicable drawing and control plan.":
            "检验记录与适用的图纸及控制计划保持一致。",
        "Supply documentation identifying the responsible entity and scope.":
            "供货文件需标明责任主体与适用范围。",

        # ── tire factory ──────────────────────────────────────────────────
        "Self-sealing tyre manufacturing": "自密封轮胎制造",
        "A dedicated production environment for self-sealing tyre programs":
            "面向自密封轮胎项目的专用生产环境",
        "Our self-sealing tyre production base includes automated equipment, dedicated machinery, material handling and inspection environments presented for this product line.":
            "我们的自密封轮胎生产基地包含自动化设备、专用机械、物料搬运与检验环境，均面向该产品线呈现。",
        "A specialized production base for wheel programs": "面向轮毂项目的专业生产基地",
        "Visible equipment across application, handling and inspection":
            "覆盖施用、搬运与检验环节的可见设备",
        "The images document equipment and working areas supplied for this product line. Final process flow, operating parameters and inspection points are confirmed against the applicable tyre and control plan.":
            "这些图片记录了该产品线所配备的设备与作业区域。最终工艺流向、运行参数与检验点，会对照适用的轮胎与控制计划确认。",
        "Automated application equipment": "自动施用设备",
        "An enclosed line with robotic handling is shown. Its exact process scope and current production use are confirmed with the responsible factory.":
            "图中展示的是一条带机器人搬运的封闭产线。其确切工序范围与当前生产用途，需与责任工厂确认。",
        "Material-processing equipment": "材料加工设备",
        "A material-processing view is included in the production set. Material identity and its role in the sealing system require the applicable process documentation.":
            "生产图片集中包含材料加工环节。材料的身份及其在密封系统中的角色，需要对应的工艺文件来佐证。",
        "Dedicated production machinery": "专用生产机械",
        "Purpose-built machines and fixtures are visible in the production environment. A photograph alone does not establish output, cycle time or process capability.":
            "生产环境中可见专用机械与工装。仅凭照片无法证明产量、节拍或工艺能力。",
        "Automated handling equipment": "自动化搬运设备",
        "Production-line equipment": "产线设备",
        "Inspection equipment": "检验设备",
        "Inspection equipment is visible within the production environment. Method, frequency and acceptance criteria remain model- and control-plan-specific.":
            "检验设备在生产环境中可见。其方法、频次与接收准则仍取决于具体型号与控制计划。",
        "Inside the production environment": "生产环境内部",
        "Inside the production system": "生产体系内部",
        "Production images show equipment and working environments. They do not replace a process specification, inspection record or product test report.":
            "生产图片展示的是设备与作业环境，不能替代工艺规范、检验记录或产品测试报告。",
        "A production photograph identifies an environment. A purchase decision also needs documents identifying who manufactures the tyre, which models are covered and how each claim is evaluated.":
            "生产照片可以说明环境，但采购决策还需要能指明谁制造、覆盖哪些型号、以及每项表述如何评估的文件。",
        "These photographs document three production environments. The actual route is selected for the approved design and does not require every product to pass through every pictured stage.":
            "这些照片记录了三种生产环境。实际路线按已批准的设计选定，并不要求每个产品都经过图中所有阶段。",
        "Multiple line and equipment views document the facility environment without presenting the photographs as a fixed production sequence.":
            "多组产线与设备视图记录了工厂环境，但这些照片并不代表固定的生产顺序。",
        "Tyre-processing equipment": "轮胎加工设备",
        "Tyre-processing equipment within the production line": "产线内的轮胎加工设备",
        "Dedicated production machinery in the self-sealing tyre manufacturing base":
            "自密封轮胎生产基地内的专用生产机械",
        "Production-line equipment in the self-sealing tyre manufacturing base":
            "自密封轮胎生产基地内的产线设备",
        "Material-processing equipment in the self-sealing tyre production base":
            "自密封轮胎生产基地内的材料加工设备",
        "Inspection equipment in the self-sealing tyre production environment":
            "自密封轮胎生产环境中的检验设备",
        "Inspection equipment in the production environment": "生产环境中的检验设备",
        "Automated equipment in the self-sealing tyre production base":
            "自密封轮胎生产基地内的自动化设备",
        "Automated handling equipment in the self-sealing tyre production environment":
            "自密封轮胎生产环境中的自动化搬运设备",
        "Wheel and aluminum-component manufacturing base": "轮毂与铝制部件生产基地",
        "Wheel casting production line inside the manufacturing base":
            "生产基地内的轮毂铸造产线",
        "Casting workshop for wheel and aluminum-component programs":
            "面向轮毂与铝制部件项目的铸造车间",
        "CNC machining workshop for wheels and aluminum components":
            "面向轮毂与铝制部件的 CNC 机加工车间",
        "CNC machining workshop for controlled product interfaces":
            "用于保证产品配合面的 CNC 机加工车间",
        "Aerial view of the Fenghuai wheel manufacturing base": "丰怀轮毂生产基地鸟瞰图",
        "Applicable tyre, sealing material, processing and inspection scope":
            "适用的轮胎、密封材料、加工与检验范围",
        "Available sizes, quantity, region, inspection, warranty and service boundary":
            "可选规格、数量、区域、检验、质保与服务边界",
        "Equipment and facility": "设备与工厂",
        "Current equipment status, location and relationship to the product line":
            "设备当前状态、位置及其与产品线的关系",
        "Evidence matching": "证据匹配",
        "Certificates, reports and inspection records are checked against the issuing entity, product and market.":
            "对证书、报告与检验记录，按签发主体、产品与市场逐项核对。",
        "Verify the responsible manufacturer": "核验责任制造商",
        "B2B and qualified B2C project enquiries": "B2B 及符合条件的 B2C 项目询盘",
        "Discuss a tyre supply program": "洽谈轮胎供货项目",
        "See self-sealing technology": "查看自密封技术",
        "Commercial support": "商务支持",
        "Production-line environment": "产线环境",
        "Wheel manufacturing base": "轮毂生产基地",

        # ── relationship disclosures / intros ─────────────────────────────
        "Fenghuai is the Shenzhen commercial and project interface. The responsible manufacturing entity, route, certification requirement and production availability are confirmed for each program.":
            "丰怀是深圳的商务与项目接口。每一个项目都会确认对应的责任制造主体、工艺路线、认证要求与生产可用性。",
        "Fenghuai coordinates the supply program in Shenzhen. The responsible manufacturing entity, available tyre models, process scope and destination-market documents are confirmed for each enquiry.":
            "丰怀在深圳负责统筹供货项目。每一笔询盘都会确认责任制造主体、可供轮胎型号、工序范围与目标市场文件。",
        "Share the target size, application, quantity and finish. The manufacturing team will confirm a buildable route and the evidence required for that program.":
            "请提供目标规格、应用场景、数量与表面处理要求。制造团队会确认可行的工艺路线以及该项目所需的证据。",

        # ── closing ───────────────────────────────────────────────────────
        "Start with the product and market you need to serve": "从您需要服务的产品与市场开始",
        "Send the product line, application, destination market and the information already available. We will identify the responsible route and the documents needed for the next review.":
            "请告知产品线、应用场景、目标市场以及目前已具备的资料。我们会确定责任工艺路线，以及下一轮评审所需的文件。",
        "Automated production equipment": "自动化生产设备",
        "Request a project review": "申请项目评估",

        # ── machine tokens kept verbatim ──────────────────────────────────
        "wheel-manufacturing": "wheel-manufacturing",
        "tire-manufacturing": "tire-manufacturing",
        "#wheel-manufacturing": "#wheel-manufacturing",
    },

    # ════════════════════════════════════════════════════════════════════════
    # Product lines index (key: "product-lines")
    # ════════════════════════════════════════════════════════════════════════
    "product-lines": {
        "Products": "产品",
        "Four product lines, one manufacturing group": "四条产品线，一个制造集团",

        # card 1 — wheels
        "Wheels": "轮毂",
        "Recorded models · Flow formed · Custom forged": "已记录型号 · 旋压成形 · 定制锻造",
        "Browse approved wheel specifications, review recorded flow-formed routes, or start a custom forged wheel program.":
            "浏览已批准的轮毂规格，查看已记录的旋压成形路线，或启动定制锻造轮毂项目。",

        # card 2 — EV housings
        "EV Aluminum Housings": "电驱铝制壳体",
        "Motor · Controller · Inverter": "电机 · 控制器 · 逆变器",
        "Engineering assessment for water-cooled motor, die-cast motor and controller or inverter housing projects.":
            "面向水冷电机壳体、压铸电机壳体以及控制器或逆变器壳体项目的工程评估。",

        # card 3 — custom aluminum
        "Custom Aluminum Development": "定制铝制品开发",
        "2D drawing · 3D data · Physical sample": "2D 图纸 · 3D 数据 · 实物样件",
        "Start a drawing- or sample-led assessment for an aluminum component outside the defined wheel and EV housing categories.":
            "针对轮毂与电驱壳体两类已定义范围之外的铝制部件，启动以图纸或样件驱动的评估。",

        # card 4 — safety tires
        "Self-Sealing Tires": "自密封轮胎",
        "Technology · Testing · Supply review": "技术 · 测试 · 供货评估",
        "Review the self-sealing concept, documented test conditions and the information needed to discuss an applicable tire program.":
            "了解自密封原理、有记录的测试条件，以及讨论适用轮胎项目所需的信息。",

        # catalogue — intro (view 01 header; `heading` is the page <h1>)
        "What we manufacture": "我们制造什么",
        "Four product lines": "四条产品线",
        "Wheels, EV powertrain components, custom aluminum parts and self-healing tires — engineered and manufactured across four parallel lines.":
            "轮毂、电驱动力总成部件、定制铝制品与自修复轮胎——在四条并行的产品线上完成工程设计与制造。",
        "Not a wheel shop with side projects: each line has its own engineering and process route, and all four share the same facility, tooling discipline and documentation trail.":
            "我们不是一个顺带做点其他业务的轮毂作坊：每条产品线都有独立的工程与工艺路线，而四条线共用同一座工厂、同一套工装规范与同一份文件记录体系。",

        # catalogue — sku callout
        "Individual wheels": "单品轮毂",
        "Shop the range by SKU": "按 SKU 选购产品",
        "Each construction covers several shapes. If you already know the spoke count and face you want, the SKU catalogue lists every orderable wheel with its construction, finishes and applications.":
            "每种结构覆盖多种造型。若您已明确所需的辐条数量与盘面样式，SKU 目录列出了每一款可订购轮毂的结构、表面处理与应用范围。",
        "Browse all wheel SKUs": "浏览全部轮毂 SKU",

        # catalogue — guidance header + numbered routes
        "Getting started": "开始合作",
        "How to specify your order": "如何确定订单规格",
        "You do not need to arrive with a finished drawing. Send us the vehicle and the look you are after — we turn it into a buildable specification.":
            "您不必先准备好完整图纸。把车型和想要的效果告诉我们，我们会把它转化为可生产的规格。",
        "Tell us the vehicle": "告知车型信息",
        "Make, model, trim and any brake or suspension changes. This sets the clearance envelope before any styling decisions.":
            "品牌、车型、配置版本，以及任何刹车或悬挂改动。这些信息在任何造型决策之前，先确定出空间余量的边界。",
        "Send vehicle details": "提交车型信息",
        "Choose a construction": "选择结构形式",
        "Monoblock for the lightest result, two-piece for deep lips and wide fitments, off-road for load-rated truck and SUV builds.":
            "单片式锻造可得到最轻的结果，双片式适合深唇与宽适配，越野结构则面向按规定载荷等级的皮卡与 SUV 改装。",
        "Compare families": "对比产品系列",
        "Set the fitment": "确定适配参数",
        "Diameter, width, offset, PCD and centre bore. We check each against clearance and load rating and flag anything that will not fit.":
            "直径、宽度、ET（偏距）、PCD（孔距）与中心孔。我们会逐项核对空间余量与载荷等级，并标出任何无法适配的组合。",
        "Fitment resources": "适配资料",
        "Pick a finish": "选择表面处理",
        "Brushed, polished, satin, matte or gloss. Choose from the finish reference or send a sample and we will match it.":
            "拉丝、抛光、缎面、哑光或高光。可从表面处理参考中挑选，也可以寄样给我们对色。",
        "See finishes": "查看表面处理",

        # catalogue — fitment support
        "Fitment support": "适配支持",
        "Fitment engineering comes with the order": "适配工程随订单一同提供",
        "Fitment is where custom forged orders go wrong. We review it before production so the wheel you receive clears the brakes, sits where you wanted, and carries the right load rating.":
            "适配正是定制锻造订单最容易出问题的地方。我们在投产前完成评审，确保您收到的轮毂能避开刹车、落在您想要的位置，并具备正确的载荷等级。",
        "Brake and caliper clearance checked against your model data": "依据您的车型数据核对刹车与卡钳空间余量",
        "Offset and width reviewed for the stance you are targeting": "按您想要的车身姿态评估 ET（偏距）与宽度",
        "Load rating confirmed for truck, SUV and heavy-duty applications": "为皮卡、SUV 与重载应用确认载荷等级",
        "Written specification returned for approval before material is cut": "在开料之前出具书面规格供您确认",

        # catalogue — resource links
        "Finishes": "表面处理",
        "Finish reference": "表面处理参考",
        "Eight finish directions with a note on how to request physical samples.":
            "八种表面处理方向，并说明如何索取实物样件。",
        "Compare finishes": "对比表面处理",
        "Manufacturing": "制造",
        "Manufacturing process": "制造流程",
        "Six stages from engineering review to protective packaging.":
            "从工程评审到防护包装的六个阶段。",
        "See the process": "查看工艺流程",

        # catalogue — FAQ
        "What is your minimum order quantity?": "你们的最小起订量是多少？",
        "MOQ depends on the programme. Dealer supply orders can start small, while private-label runs require a tooling commitment for your centre cap mark. Contact us with your target volume and we will confirm the applicable minimum.":
            "最小起订量视项目而定。经销商供货订单可以从小批量起步，而贴牌项目需要为您的中心盖标识承担相应的工装投入。请告知您的目标数量，我们会确认适用的最小起订量。",
        "How long does production take?": "生产需要多长时间？",
        "Production lead time is quoted in writing with your order, not as a standing figure — it runs from approval of the specification to despatch, and depends on the process route, the finish and the load on the line at the time. The number is confirmed at order stage, so nothing here commits us to a fixed window.":
            "交付周期会随订单以书面形式报出，而不是一个固定数字——它从规格确认起算到发货为止，取决于工艺路线、表面处理以及当时产线的排产情况。具体天数在订单阶段确认，因此本页内容不构成任何固定交期的承诺。",
        "Can you build to my exact fitment?": "你们能按我的确切适配参数生产吗？",
        "Yes. Offset, PCD, centre bore and brake clearance are built to the vehicle data you supply. We review the specification against clearance and load rating before cutting any material.":
            "可以。ET（偏距）、PCD（孔距）、中心孔与刹车空间余量都会按您提供的车辆数据生产。在开料之前，我们会依据空间余量与载荷等级评审规格。",
        "Do you offer private label?": "你们提供贴牌服务吗？",
        "Yes. We manufacture to your branding — centre caps, engraving and packaging all carry your identity. Confidentiality agreements and design exclusivity are available on request.":
            "提供。我们按您的品牌生产——中心盖、刻字与包装均体现您的品牌标识。可根据要求签署保密协议并提供设计排他性。",
        "Are your wheels tested?": "你们的轮毂经过测试吗？",
        "Every order goes through dimensional inspection, runout measurement and balance before dispatch, with an inspection record attached. Ask us for the test documentation relevant to your market.":
            "每一笔订单在发货前都会经过尺寸检验、跳动量测量与动平衡，并附上检验记录。如需针对您所在市场的测试文件，请与我们联系。",
        "How are wheels shipped?": "轮毂如何运输？",
        "Orders ship in foam-lined cartons designed for international freight, with branded inserts available. We can quote FOB or arranged freight depending on your destination and preference.":
            "订单采用为国际货运设计的泡棉内衬纸箱发货，亦可提供带品牌标识的内衬。可根据您的目的地与偏好报 FOB 价或代安排运输。",
    },

    # ════════════════════════════════════════════════════════════════════════
    # Capabilities page (key: "capabilities")
    # ════════════════════════════════════════════════════════════════════════
    "capabilities": {
        # ── hero ──────────────────────────────────────────────────────────
        "Wheel manufacturing and quality": "轮毂制造与质量",
        "Engineering decisions first. Process evidence at every gate.":
            "工程决策优先，每道关口均有工序证据。",
        "A wheel program moves from defined inputs to a selected forming route, planned inspection, applicable validation and documents that match the product and market.":
            "轮毂项目从已明确的输入出发，依次经过选定成形路线、计划性检验、适用验证，直至形成与产品及市场相匹配的文件。",
        "Fenghuai coordinates the project in Shenzhen. The responsible manufacturing entity confirms the engineering scope, process route, test plan and supporting records for each program.":
            "丰怀在深圳负责项目统筹。每个项目的工程范围、工序路线、测试计划与支持性记录，均由责任制造主体确认。",
        "Start with engineering inputs": "从工程输入开始",
        "Discuss a wheel program": "洽谈轮毂项目",

        # ── WM01 engineering before production ────────────────────────────
        "Engineering before production": "量产前的工程工作",
        "A wheel program starts with defined inputs": "轮毂项目从已明确的输入开始",
        "Target size, vehicle or application, load assumptions, styling intent, brake clearance and finish requirements are reviewed before a manufacturing route is confirmed.":
            "目标规格、车型或应用场景、载荷假设、造型意图、刹车空间余量与表面处理要求，均在确认制造路线之前完成评审。",
        "3D wheel modelling": "轮毂 3D 建模",
        "The approved design intent is translated into controlled geometry for engineering review and production preparation.":
            "将已批准的设计意图转化为受控几何模型，用于工程评审与生产准备。",
        "3D wheel model prepared for engineering review": "为工程评审准备的轮毂 3D 模型",
        "3D wheel modelling for design review and production preparation":
            "用于设计评审与生产准备的轮毂 3D 建模",
        "Finite element review": "有限元评审",
        "Load cases may be evaluated against the project model to identify areas requiring design adjustment. Results stay specific to the approved model and assumptions.":
            "可针对项目模型评估工况载荷，以识别需要调整设计的部位。评估结果仅对已批准的模型与假设条件有效。",
        "Finite element analysis view of a wheel design": "轮毂设计的有限元分析视图",
        "Finite element review of an approved wheel model": "对已批准轮毂模型进行有限元评审",
        "Casting simulation": "铸造模拟",
        "For an applicable cast wheel program, filling and solidification behaviour can be reviewed before tooling and production decisions are finalized.":
            "对于适用的铸造轮毂项目，可在最终确定工装与生产决策之前，评审充型与凝固行为。",
        "Casting simulation view for a wheel design": "轮毂设计的铸造模拟视图",
        "Casting simulation for an applicable cast wheel program":
            "面向适用铸造轮毂项目的铸造模拟",
        "Reverse engineering": "逆向工程",
        "An authorized sample or scan can support geometry capture when the customer has the right to use the reference design.":
            "在客户拥有使用该参考设计权利的前提下，可借助经授权的样件或扫描数据完成几何采集。",
        "Reverse engineering view used to capture approved geometry":
            "用于采集已批准几何数据的逆向工程视图",
        "Geometry reconstruction for an authorized reference": "针对经授权参考件的几何重建",
        "Engineering images show available evaluation methods. They are not a pass report for every wheel displayed on this website.":
            "工程类图片展示的是可用的评估方法，并不构成本网站上每一款轮毂的合格报告。",

        # ── WM02 forming routes ───────────────────────────────────────────
        "Forming routes": "成形路线",
        "The process route follows the wheel design": "工序路线依轮毂设计而定",
        "Gravity casting, low-pressure casting and flow forming serve different design and program needs. Geometry, performance target, quantity and finish requirements inform the route selection.":
            "重力铸造、低压铸造与旋压成形服务于不同的设计与项目需求。几何形状、性能目标、数量与表面处理要求，共同作为路线选择的依据。",
        "Gravity casting": "重力铸造",
        "A gravity-fed casting route may be considered for suitable wheel geometries and program requirements.":
            "对于几何形状与项目要求合适的轮毂，可考虑采用重力浇注铸造路线。",
        "Route option": "可选路线",
        "Gravity casting equipment used for applicable wheel programs":
            "适用于相应轮毂项目的重力铸造设备",
        "Gravity casting equipment for an applicable wheel route":
            "面向适用轮毂路线的重力铸造设备",
        "Low-pressure casting": "低压铸造",
        "A controlled low-pressure filling route may be considered where the approved design and material plan call for it.":
            "当已批准的设计与材料方案有相应要求时，可考虑采用受控低压充型路线。",
        "Project-specific · no dedicated image published":
            "按项目而定 · 未发布专用图片",
        "Flow forming": "旋压成形",
        "For an applicable cast blank, flow forming shapes the rim section through controlled forming. It is described separately from forging.":
            "对于适用的铸造铝坯，旋压成形通过受控成形加工轮辋部分。该工艺与锻造分开表述。",
        "Flow forming equipment for an applicable cast wheel blank":
            "面向适用铸造轮毂铝坯的旋压成形设备",
        "Flow forming equipment for an applicable cast rim section":
            "面向适用铸造轮辋部分的旋压成形设备",
        "These are route options, not three mandatory stages. The responsible engineering team confirms the route for each wheel program.":
            "这些是可选的工艺路线，而不是三个必经阶段。每个轮毂项目的路线由责任工程团队确认。",

        # ── WM03 process control ──────────────────────────────────────────
        "Process control": "过程控制",
        "Inspection follows defined checkpoints": "检验按已确定的检查点执行",
        "Visual and dimensional inspection": "外观与尺寸检验",
        "Dimensions, appearance and specified interfaces are checked against the approved drawing and control plan.":
            "尺寸、外观与规定的配合面，对照已批准图纸与控制计划进行检验。",
        "Wheel undergoing visual and dimensional inspection": "正在进行外观与尺寸检验的轮毂",
        "Dynamic balance check": "动平衡检测",
        "Balance is evaluated with the specified wheel and test setup before the approved release decision.":
            "在作出批准放行决定之前，使用规定的轮毂与测试装置评估平衡状态。",
        "Wheel mounted on dynamic balance test equipment": "安装在动平衡测试设备上的轮毂",
        "Dynamic balance check with the specified setup": "使用规定装置进行动平衡检测",
        "Final inspection": "最终检验",
        "Final checks confirm required appearance, identification and recorded inspection status before packing.":
            "在包装之前，通过最终检查确认所需的外观、标识与已记录的检验状态。",
        "Operator carrying out a final wheel inspection": "正在执行轮毂最终检验的操作人员",
        "Final wheel inspection before release and packing": "放行与包装前的轮毂最终检验",
        "Inspection scope, frequency, acceptance limits and retained records are agreed for the actual program. Not every check shown necessarily applies to every wheel.":
            "检验范围、频次、接收限值与留存记录均按实际项目约定。图中所示的每一项检查并不必然适用于每一款轮毂。",

        # ── WM04 validation capability ────────────────────────────────────
        "Validation capability": "验证能力",
        "Different tests address different wheel risks": "不同测试对应不同类型的轮毂风险",
        "Impact test": "冲击试验",
        "Evaluates wheel behaviour under a defined impact condition intended to represent a severe road event.":
            "在规定冲击条件下评估轮毂行为，该条件用于模拟严苛的道路状况。",
        "Risk addressed: impact behaviour": "对应风险：冲击行为",
        "Wheel impact test equipment": "轮毂冲击试验设备",
        "Impact test equipment for a defined validation condition":
            "面向规定验证条件的冲击试验设备",
        "Dynamic cornering fatigue test": "动态弯曲疲劳试验",
        "Evaluates resistance to repeated bending loads associated with cornering conditions.":
            "评估在转向工况下对反复弯曲载荷的抵抗能力。",
        "Risk addressed: repeated bending loads": "对应风险：反复弯曲载荷",
        "Dynamic cornering fatigue test equipment for a wheel": "用于轮毂的动态弯曲疲劳试验设备",
        "Dynamic cornering fatigue test equipment": "动态弯曲疲劳试验设备",
        "Dynamic radial fatigue test": "动态径向疲劳试验",
        "Evaluates resistance to repeated radial loading associated with straight-line service conditions.":
            "评估在直线行驶工况下对反复径向载荷的抵抗能力。",
        "Risk addressed: repeated radial loads": "对应风险：反复径向载荷",
        "Dynamic radial fatigue test equipment with a mounted wheel":
            "装有轮毂的动态径向疲劳试验设备",
        "Dynamic radial fatigue test equipment": "动态径向疲劳试验设备",
        "Equipment images demonstrate available test capability. Compliance is established only by a report identifying the tested wheel, method, standard revision, result and responsible laboratory.":
            "设备图片仅用于说明具备的测试能力。合规性只能通过指明受测轮毂、方法、标准版本、结果与责任实验室的报告来确认。",

        # ── WM05 documented evidence ──────────────────────────────────────
        "Documented evidence": "有据可查的证据",
        "The document must match the product and market": "文件必须与产品及市场相匹配",
        "Quality-system certificates describe an organization and scope. Product reports describe a specific wheel and test condition. Inspection records describe a production order or batch.":
            "质量体系证书描述的是某一组织及其范围。产品报告描述的是某一具体轮毂与测试条件。检验记录描述的是某一生产订单或批次。",
        "Quality-system certificate": "质量体系证书",
        "Legal entity, certified scope and validity are checked before a certificate is referenced publicly.":
            "在公开引用某项证书之前，会先核查其法人主体、认证范围与有效期。",
        "Product validation report": "产品验证报告",
        "Wheel identification, method, standard revision, result and responsible laboratory must match the program.":
            "受测轮毂的标识、方法、标准版本、结果与责任实验室，必须与该项目的实际情况一致。",
        "Production inspection record": "生产检验记录",
        "The record must identify the order or batch, inspected characteristics and acceptance status.":
            "记录必须标明订单或批次、受检特性以及接收状态。",
        "Certificate candidates remain internal until the legal entity, scope, number, validity and readable source file are confirmed. This page does not use an unsupported badge wall.":
            "在法人主体、范围、证书编号、有效期与可辨识的原始文件确认之前，候选证书均作内部资料处理。本页不使用缺乏依据的证书徽标墙。",
        "See our wheel manufacturing base": "查看我们的轮毂生产基地",

        # ── copy rendered by the page component, not the `content` dict ────
        # `src/components/capabilities/*` renders its own caption text for these
        # six media items instead of using `content.processInspection` /
        # `content.validationTests` media captions. Short labels only — these
        # are NOT in the content dict, so translating them changes no fact.
        "Visual and dimensional inspection against the approved drawing and control plan":
            "外观与尺寸检验",
        "Dynamic balance check using the specified wheel and test setup":
            "动平衡检测",
        "Final wheel inspection before the approved release and packing decision":
            "最终检验",
        "Impact test equipment for a defined wheel validation condition":
            "冲击试验设备",
        "Dynamic cornering fatigue equipment for repeated bending-load validation":
            "动态弯曲疲劳试验设备",
        "Dynamic radial fatigue equipment for repeated radial-load validation":
            "动态径向疲劳试验设备",
    },

    # ════════════════════════════════════════════════════════════════════════
    # EV components page (key: "ev-components")
    # ════════════════════════════════════════════════════════════════════════
    "ev-components": {
        # ── hero ──────────────────────────────────────────────────────────
        "EV ALUMINUM HOUSINGS": "电驱铝制壳体",
        "Aluminum housings for EV motor and controller projects":
            "面向电驱电机与控制器项目的铝制壳体",
        "Fenghuai provides a Shenzhen-based project interface for supplier-supported motor and power-electronics housing programs. Each project starts from the customer drawing, interface requirements and validation plan.":
            "丰怀在深圳提供项目接口，承接由供应商制造能力支撑的电机与电力电子壳体项目。每个项目都从客户图纸、配合面要求与验证方案出发。",
        "Water-cooled motor housings · Die-cast motor housings · Controller and inverter housings":
            "水冷电机壳体 · 压铸电机壳体 · 控制器与逆变器壳体",
        "These are engineering project categories, not stocked components. Material, process route, tolerances, sealing criteria and supply status are confirmed for each project.":
            "这些是工程项目类别，而非备库零件。材料、工序路线、公差、密封判定准则与供货状态，均按每个项目单独确认。",
        "View housing categories": "查看壳体类别",
        "Start an engineering assessment": "启动工程评估",
        "Batch of machined aluminum housings staged in a production area":
            "在作业区域暂存的批量机加工铝制壳体",
        "Machined aluminum housings in a production area. The photograph shows batch staging; it is not welding, sealing or leak-test evidence.":
            "作业区域内的机加工铝制壳体。照片展示的是批次暂存状态，不构成焊接、密封或气密性测试的证据。",

        # ── EV02 housing categories ───────────────────────────────────────
        "Housing categories": "壳体类别",
        "Three housing categories in the supplied portfolio": "供应商资料中的三类壳体",
        "The three names below are stated in the supplier material. They are project categories for assessment, not stocked parts, and no photograph on this page establishes a process or a performance result.":
            "以下三个名称均出自供应商资料。它们是用于评估的项目类别，而不是备库零件；本页任何照片都不能证明某一工序或某项性能结果。",
        "Start with this category": "从该类别开始",
        "Water-cooled motor housing": "水冷电机壳体",
        "The supplier material describes a low-pressure-cast stator housing with an integrally formed spiral water passage. Cooling-channel geometry, pressure boundary and acceptance criteria must be reviewed against the customer drawing.":
            "供应商资料描述的是带一体成形螺旋水道的低压铸造定子壳体。冷却水道几何形状、压力边界与接收准则，必须对照客户图纸进行评审。",
        "Project category — not a stock SKU": "项目类别——非备库 SKU",
        "Aluminum motor housing presented by the supplier as a water-cooled motor housing":
            "供应商将其作为水冷电机壳体提供的铝制电机壳体",
        "Housing presented by the supplier as a water-cooled motor housing. The internal water passage is not visible in this photograph.":
            "供应商将其作为水冷电机壳体提供的壳体。该照片中看不到内部水道。",
        "Die-cast motor housing": "压铸电机壳体",
        "The supplier material describes high-pressure die casting, precision machining and a welded cooling route for motor-housing programs. The applicable joining method and validation plan are confirmed per part.":
            "供应商资料描述的电机壳体项目路线为高压压铸、精密加工与焊接冷却通道。适用的连接方法与验证方案，按零件逐一确认。",
        "Machined aluminum motor housing with coolant connections, supplier-provided example":
            "带冷却接口的机加工铝制电机壳体，供应商提供的示例",
        "Machined motor housing from the supplier material. This photograph does not by itself establish high-pressure die casting, friction welding or serial production.":
            "来自供应商资料的机加工电机壳体。仅凭该照片无法证明高压压铸、摩擦焊接或批量生产。",
        "Controller / inverter housing": "控制器 / 逆变器壳体",
        "A machined aluminum enclosure route for controller or inverter projects, where cooling features, sealing faces, connector interfaces and mounting locations are defined by the customer design.":
            "面向控制器或逆变器项目的机加工铝制壳体路线，其中冷却结构、密封面、接插件配合面与安装位置均由客户设计确定。",
        "Machined aluminum controller or inverter housing, supplier-provided example":
            "机加工铝制控制器或逆变器壳体，供应商提供的示例",
        "Machined housing from the supplier material, presented as a controller or inverter housing candidate. The specific part name and rights are still being confirmed.":
            "来自供应商资料的机加工壳体，作为控制器或逆变器壳体的候选对象提供。具体零件名称与权属仍在确认中。",

        # ── EV03 engineering concerns ─────────────────────────────────────
        "Engineering concerns": "工程关注点",
        "The drawing has to resolve cooling, sealing and interfaces together":
            "图纸必须同时解决冷却、密封与配合面问题",
        "Cooling path": "冷却路径",
        "Confirm how the water or oil passage is formed, closed, cleaned and inspected before tooling is approved.":
            "在批准工装之前，须确认水道或油道如何成形、封闭、清洗与检验。",
        "Sealing boundary": "密封边界",
        "Define every pressure boundary, sealing face, joint and acceptance method. A housing photo does not establish leak performance.":
            "须明确每一处压力边界、密封面、接缝与接收方法。壳体照片无法证明密封性能。",
        "Critical interfaces": "关键配合面",
        "Identify bores, bearing locations, flange faces, connector positions and datums that control assembly.":
            "识别对装配起控制作用的孔位、轴承座位置、法兰面、接插件位置与基准。",

        # ── EV04 process route ────────────────────────────────────────────
        "Process route": "工序路线",
        "A process route is selected for the part, not from a fixed menu":
            "工序路线按零件选定，而非从固定菜单中套用",
        "Casting route review": "铸造路线评审",
        "LPDC, HPDC or gravity casting are reviewed as supplier-stated options for the part.":
            "低压铸造（LPDC）、高压压铸（HPDC）或重力铸造，作为供应商自述的可选路线按零件评审。",
        "Tooling and trial": "工装与试制",
        "Tooling concept, trial casting and first-part review against the drawing revision.":
            "工装方案、试制铸造，以及对图纸版本进行首件评审。",
        "Precision machining": "精密加工",
        "Critical bores, faces, interfaces and datums are finished from the agreed reference.":
            "关键孔位、端面、配合面与基准，从约定的基准开始精加工。",
        "Joining and closure": "连接与封闭",
        "Friction welding or FSW only where the approved route requires it.":
            "摩擦焊接或搅拌摩擦焊（FSW），仅在已批准路线有要求时采用。",
        "Cleaning and inspection": "清洗与检验",
        "Dimensional and leak-test planning against the drawing and its acceptance criteria.":
            "依据图纸及其接收准则，规划尺寸检验与气密性测试。",
        "The route above describes supplier-stated capability. It does not mean every housing uses every process or that each process is owned by the Shenzhen company.":
            "上述路线描述的是供应商自述的能力，并不意味着每个壳体都使用全部工序，也不意味着每道工序都由深圳公司自有。",

        # ── EV05 evidence matrix ──────────────────────────────────────────
        "Evidence": "证据",
        "Evidence is agreed with the validation plan": "证据依据验证方案共同约定",
        "Evidence item": "证据项",
        "Before quotation": "报价前",
        "Before sample approval": "样件批准前",
        "Before serial supply": "批量供货前",
        "Drawing revision and critical characteristics": "图纸版本与关键特性",
        "Required": "必需",
        "Frozen revision": "冻结版本",
        "Controlled revision": "受控版本",
        "Material and process route": "材料与工序路线",
        "Proposed": "建议方案",
        "Sample record": "样件记录",
        "Lot traceability plan": "批次可追溯性方案",
        "Dimensional inspection": "尺寸检验",
        "Scope agreed": "范围已约定",
        "First-article results": "首件结果",
        "Control plan": "控制计划",
        "Leak / pressure test": "气密性 / 压力测试",
        "Method requested": "已提出方法要求",
        "Results where applicable": "在适用时提供结果",
        "Frequency and acceptance agreed": "频次与接收准则已约定",
        "Target-market documents": "目标市场文件",
        "Requirements listed": "已列明要求",
        "Applicable documents reviewed": "已评审适用文件",
        "Shipment documents agreed": "出货文件已约定",
        "This matrix defines the evidence to request at each gate. It is not a statement that the current portfolio already holds every record, and it publishes no figure for a grade, tolerance, leak rate, pressure, capacity or certification.":
            "本矩阵界定的是每道关口应索取的证据，并不表示当前产品资料已具备全部记录，也未公布任何关于牌号、公差、泄漏率、压力、产能或认证的具体数值。",
        "Request the project evidence list": "索取项目证据清单",

        # ── EV06 inquiry ──────────────────────────────────────────────────
        "Engineering assessment": "工程评估",
        "Start with the part and its acceptance conditions": "从零件及其接收条件开始",
        "A first assessment is only as good as its inputs. The list below is what the engineering review works from; anything unknown stays open rather than being filled with a generic value.":
            "首次评估的质量取决于输入信息的质量。以下清单是工程评审的依据；任何未知项都会保持待确认状态，而不会用通用数值填充。",
        "Required inputs": "必需输入",
        "Housing category and application": "壳体类别与应用场景",
        "2D drawing and available 3D data": "2D 图纸与现有的 3D 数据",
        "Critical interfaces and datums": "关键配合面与基准",
        "Cooling medium, pressure and sealing boundary": "冷却介质、压力与密封边界",
        "Material or performance requirements": "材料或性能要求",
        "Prototype and annual quantity": "试制数量与年用量",
        "Target market and required documents": "目标市场与所需文件",
        "Requested sample timing": "期望样件时间",
        "No direct upload is available on this page. The project team replies with an enquiry reference and a controlled exchange method for drawings and samples.":
            "本页不提供直接上传。项目团队会回复询盘编号，并提供图纸与样件的受控交换方式。",
        "cover": "cover",
        "contain": "contain",
        "See the custom aluminum route": "查看定制铝制品路线",
        "Your enquiry carries product_line=ev-components, the housing category you selected, this page as its source and the evidence you asked for. NDA available for project discussion.":
            "您的询盘会携带 product_line=ev-components、您选择的壳体类别、本页作为来源，以及您所索取证据的类型。项目洽谈可签署 NDA。",
    },

    # ════════════════════════════════════════════════════════════════════════
    # Self-sealing tyres page (key: "safety-tires")
    # ════════════════════════════════════════════════════════════════════════
    "safety-tires": {
        # ── hero ──────────────────────────────────────────────────────────
        "SELF-SEALING TYRE TECHNOLOGY": "自密封轮胎技术",
        "Self-sealing tyres for applicable tread punctures": "面向适用胎面穿刺的自密封轮胎",
        "Understand how the inner sealing layer responds, what the supplier-stated 8 mm test condition means, and which documents to confirm for a tyre and market.":
            "了解内密封层如何响应、供应商自述的 8 mm 测试条件意味着什么，以及针对某一轮胎与市场应确认哪些文件。",
        "This is a product-line capability page. Available models, sizes and market approvals are confirmed through enquiry before supply.":
            "本页为产品线能力说明页。可供型号、规格与市场准入情况，均在供货前通过询盘逐一确认。",
        "See how it responds": "了解其响应方式",
        "Ask about a tyre program": "咨询轮胎项目",

        # ── T01 pain point ────────────────────────────────────────────────
        "THE ROADSIDE PROBLEM": "路边突发问题",
        "A puncture can turn into a roadside interruption": "一次穿刺可能演变为路边中断行程",
        "A nail puncture can mean air loss, an unsafe place to stop, a repair or replacement decision, and an unplanned recovery call. For a vehicle without a spare wheel, the interruption can be even more immediate.":
            "钉子穿刺可能意味着漏气、停在并不安全的位置、面临修补还是更换的判断，以及一次计划外的救援呼叫。对于没有备胎的车辆，这种中断来得更加直接。",
        "Air loss after a tread puncture": "胎面穿刺后漏气",
        "A penetrating object can create an air-loss path and force the driver to respond before continuing the journey.":
            "穿刺物可能形成漏气通道，迫使驾驶者在继续行程之前先行处理。",
        "Nail embedded in the tread of a tyre": "扎入轮胎胎面的钉子",
        "A penetrating object lodged in the tread area": "滞留在胎面区域的穿刺物",
        "Changing a tyre at the roadside": "在路边更换轮胎",
        "The driver may not have the tools, experience or safe working space required for a roadside wheel change.":
            "驾驶者可能并不具备路边换胎所需的工具、经验或安全作业空间。",
        "Driver attempting to change a tyre at the roadside": "驾驶者尝试在路边更换轮胎",
        "A roadside wheel change in an uncontrolled environment": "在不受控环境中的路边换胎",
        "Repair or replacement": "修补或更换",
        "Workshop time and the condition of the tyre determine whether inspection, repair or replacement is required.":
            "是否需要检验、修补或更换，取决于进厂时间与轮胎的实际状况。",
        "Workshop technician carrying a replacement tyre": "车间技师搬运替换轮胎",
        "Workshop inspection determines the next action for a damaged tyre":
            "车间检验决定受损轮胎的下一步处理方式",
        "Towing and delay": "拖车与延误",
        "Waiting for roadside assistance adds cost and interrupts personal, commercial or fleet travel.":
            "等待道路救援会增加费用，并中断私人出行、商业运输或车队运营。",
        "Roadside recovery truck transporting a vehicle": "正在运送车辆的道路救援车",
        "Roadside recovery can add time and cost to a puncture event":
            "道路救援会给一次穿刺事件增加时间与费用",
        "Self-sealing technology is intended to reduce the immediate interruption caused by an applicable tread puncture. It does not prevent every form of tyre damage.":
            "自密封技术旨在减轻适用胎面穿刺所带来的即时中断，但并不能防止所有形式的轮胎损伤。",

        # ── T02 definition ────────────────────────────────────────────────
        "A sealing layer responds around an applicable tread puncture":
            "密封层围绕适用胎面穿刺作出响应",
        "A polymer-composite sealing layer is applied to the tyre inner liner. When an object penetrates the tread, the material surrounds it and helps limit air loss. After the object is removed, the material closes the puncture channel.":
            "轮胎内衬层上施加有一层聚合物复合密封材料。当异物刺穿胎面时，该材料会将其包裹，从而有助于限制漏气。异物取出后，材料会闭合穿刺通道。",
        "Normal road use": "正常道路行驶",
        "The product concept is intended to help limit immediate air loss from an applicable puncture through the tread area.":
            "该产品构想旨在帮助限制适用胎面穿刺造成的即时漏气。",
        "Close view of a tyre in normal road use": "正常道路行驶中轮胎的特写",
        "Tyre shown in normal road use in supplier project materials":
            "供应商项目资料中展示的正常道路行驶轮胎",
        "The puncture area matters": "穿刺位置至关重要",
        "The illustrated response concerns the tread and internal sealing layer. Sidewall, shoulder, impact and structural damage require a different assessment.":
            "所示响应针对的是胎面与内部密封层。胎侧、胎肩、冲击损伤与结构性损伤，需要另行评估。",
        "Tyre tread shown with a puncturing object": "带穿刺物的轮胎胎面",
        "Close view of a puncturing object in the tyre tread": "扎在轮胎胎面中穿刺物的特写",
        "Self-sealing describes the behaviour of the internal sealing layer. It does not mean that the tyre is immune to damage or that professional inspection is unnecessary.":
            "自密封描述的是内部密封层的行为，并不意味着轮胎不会受损，也不意味着无需专业检验。",
        "See how the sealing layer responds": "了解密封层的响应方式",

        # ── T03 mechanism ─────────────────────────────────────────────────
        "HOW IT RESPONDS": "响应方式",
        "The material closes around the puncture channel": "材料围绕穿刺通道闭合",
        "Object enters the tread area": "异物进入胎面区域",
        "The object passes through the tread and into the sealing layer on the inner liner.":
            "异物穿过胎面，进入内衬层上的密封材料中。",
        "Illustration of an object penetrating the tread and sealing layer":
            "异物刺穿胎面与密封层的示意图",
        "Supplier illustration of the initial puncture stage": "供应商提供的穿刺初期阶段示意图",
        "The material surrounds the object": "材料包裹异物",
        "The sealing material closes around the penetrating object and helps limit the air path while it remains in place.":
            "密封材料围绕穿刺物闭合，在异物滞留期间有助于限制漏气通道。",
        "Sealing material surrounding a penetrating object": "密封材料包裹穿刺物",
        "Supplier illustration of sealing material around the object":
            "供应商提供的密封材料包裹异物示意图",
        "The channel closes after removal": "取出后通道闭合",
        "When the object is removed, the material recovers over the channel. The tyre still requires inspection to confirm its condition.":
            "异物取出后，材料会在通道处回弹闭合。但轮胎仍需经检验以确认其状况。",
        "Sealing material closing over the puncture channel after removal":
            "取出异物后密封材料在穿刺通道处闭合",
        "Supplier illustration of the channel after object removal":
            "供应商提供的异物取出后通道状态示意图",
        "This sequence illustrates the stated sealing mechanism in the tested tread area. It is not a repair instruction and does not describe sidewall, shoulder, impact or structural damage.":
            "该流程示意的是所述密封机制在受测胎面区域的作用过程，并非修补操作说明，也不涵盖胎侧、胎肩、冲击或结构性损伤。",

        # ── T04 8 mm puncture validation ──────────────────────────────────
        "8 MM INTERNAL PUNCTURE CONDITION": "8 MM 内部穿刺条件",
        "8 mm describes the test spike, not every possible puncture":
            "8 mm 描述的是试验钢钉，而非所有可能的穿刺",
        "Supplier materials state that the self-sealing system has been evaluated with an 8 mm-diameter test spike through the tread area. The result applies to the tested tyre, puncture location and test conditions. Ask for the documentation applicable to the tyre model and destination market.":
            "供应商资料称，自密封系统已使用直径 8 mm 的试验钢钉在胎面区域完成评估。该结果仅适用于受测轮胎、穿刺位置与测试条件。如需适用于具体轮胎型号与目标市场的文件，请向我们索取。",
        "Test object recorded": "试验对象已记录",
        "The test object and its geometry belong in the applicable test record rather than being inferred from a marketing image.":
            "试验对象及其几何尺寸应记录在对应的试验记录中，而不能凭宣传图片推断。",
        "Measurement of a puncture-test spike used in an internal tyre evaluation":
            "内部轮胎评估所用穿刺试验钢钉的测量",
        "Measurement scene from a supplier-stated internal puncture evaluation":
            "供应商自述的内部穿刺评估测量场景",
        "Controlled puncture position": "受控穿刺位置",
        "The tyre model, pressure, puncture position and procedure determine what the evaluation can support.":
            "轮胎型号、气压、穿刺位置与操作规程，共同决定该评估所能支持的结论范围。",
        "Tyre approaching a controlled puncture-test board": "轮胎接近受控穿刺试验板",
        "Tyre approaching a puncture-test board during an internal evaluation":
            "内部评估中轮胎接近穿刺试验板",
        "Result tied to test conditions": "结果与测试条件绑定",
        "A result applies to the identified tyre and recorded conditions. It does not create a universal puncture limit.":
            "结果仅适用于已标识的轮胎与已记录的条件，并不构成普适的穿刺限值。",
        "Tyre passing over puncture-test spikes during an internal evaluation":
            "内部评估中轮胎碾过穿刺试验钢钉",
        "Tyre passing over test spikes in supplier project materials":
            "供应商项目资料中轮胎碾过试验钢钉",
        "The tyre model, size, pressure, procedure, observation period and acceptance result have not yet been supplied as a publishable report. The 8 mm statement therefore remains supplier-stated.":
            "轮胎型号、规格、气压、操作规程、观察周期与接收结果，尚未以可公开的报告形式提供。因此，8 mm 这一表述仍属供应商自述。",
        "tire-puncture-8mm-internal": "tire-puncture-8mm-internal",
        "puncture-test spike": "puncture-test spike",
        "pending": "pending",
        "tread": "tread",
        "2024洛克项目介绍-手机端(12.12).pdf": "2024洛克项目介绍-手机端(12.12).pdf",
        "用户确认的供应商测试口径（2026-10-04）": "用户确认的供应商测试口径（2026-10-04）",
        "After a puncture, check tyre pressure and have the tyre inspected by a qualified professional. Do not treat the 8 mm figure as permission to continue driving with visible damage, abnormal pressure, vibration or a sidewall injury.":
            "穿刺后请检查轮胎气压，并由具备资质的专业人员对轮胎进行检验。不得将 8 mm 这一数值视为在存在可见损伤、气压异常、振动或胎侧损伤的情况下继续行驶的许可。",
        "Ask for the applicable test record": "索取适用的试验记录",

        # ── T05 evidence system ───────────────────────────────────────────
        "EVIDENCE BEHIND THE PRODUCT": "产品背后的证据",
        "The evidence must match the tyre model and market": "证据必须与轮胎型号及市场相符",
        "Development, testing, controlled application and inspection form one evidence chain. A photograph shows the environment; the applicable record supports the product claim.":
            "开发、测试、受控施用与检验构成同一条证据链。照片说明的是环境，而适用记录才能支撑产品表述。",
        "Material development": "材料开发",
        "Supplier materials show a dedicated development and laboratory environment. Research partners and ownership of results are published only after documentary confirmation.":
            "供应商资料展示了专门的开发与实验环境。研究合作方与成果权属，仅在文件确认之后才会公开。",
        "Exterior of the supplier research facility shown in project materials":
            "项目资料中展示的供应商研发设施外观",
        "Research facility shown in supplier project materials": "供应商项目资料中展示的研发设施",
        "Laboratory work": "实验室工作",
        "Development imagery establishes the environment. A product claim still requires an identified tyre, method and result.":
            "开发类影像只能说明环境。产品表述仍需指明具体轮胎、方法与结果。",
        "Laboratory team working with material-processing equipment":
            "实验室团队使用材料加工设备作业",
        "Laboratory team shown in supplier project materials":
            "供应商项目资料中展示的实验室团队",
        "Controlled environment": "受控环境",
        "Test conditions, sample identity and acceptance criteria must remain traceable to the applicable record.":
            "测试条件、样件标识与接收准则，必须可追溯至对应的记录。",
        "Controlled laboratory environment shown in supplier materials":
            "供应商资料中展示的受控实验环境",
        "Controlled laboratory environment shown in supplier project materials":
            "供应商项目资料中展示的受控实验环境",
        "Controlled application": "受控施用",
        "Our production-base imagery illustrates coating equipment used in the self-sealing tyre program; process approval remains tied to the responsible entity and tyre program.":
            "我们生产基地的影像展示的是自密封轮胎项目所用的涂覆设备；工序批准仍归属于责任主体与具体的轮胎项目。",
        "Production evidence": "生产证据",
        "Robotic equipment on an enclosed self-sealing tyre production line":
            "封闭式自密封轮胎产线上的机器人设备",
        "Automated equipment in the self-sealing tyre production base":
            "自密封轮胎生产基地内的自动化设备",
        "Process inspection": "过程检验",
        "Inspection equipment supports production control. It does not by itself prove a tyre model has passed a named standard.":
            "检验设备用于支持生产控制，其本身并不能证明某一轮胎型号已通过某项具名标准的测试。",
        "Inspection equipment in the self-sealing tyre production environment":
            "自密封轮胎生产环境中的检验设备",
        "Inspection equipment in the production environment": "生产环境中的检验设备",
        "A laboratory or production photograph demonstrates an environment, not a test result. Product claims are supported by documents that identify the tested tyre and conditions.":
            "实验室或生产照片说明的是环境，而不是测试结果。产品表述需由指明受测轮胎与测试条件的文件来支撑。",
        "See the production environment": "查看生产环境",

        # ── T06 application and inquiry ───────────────────────────────────
        "CHECK THE APPLICATION": "确认适用性",
        "Confirm the tyre, puncture condition and local support":
            "确认轮胎、穿刺条件与当地支持",
        "Share the target tyre and market so the project team can check supply, evidence and service requirements against the intended use.":
            "请提供目标轮胎与市场信息，以便项目团队对照预期用途核查供货、证据与服务要求。",
        "What the project team can confirm": "项目团队可以确认的事项",
        "What this page cannot guarantee": "本页无法保证的事项",
        "Include these details": "请提供以下信息",
        "Available tyre models and sizes": "可供的轮胎型号与规格",
        "The specific model covered by the supplier-stated 8 mm internal evaluation":
            "供应商自述的 8 mm 内部穿刺评估所覆盖的具体型号",
        "The tread area covered by the sealing layer": "密封层所覆盖的胎面区域",
        "Reports and markings required in the destination market": "目标市场要求的报告与标识",
        "Local installation, inspection, after-sales and warranty arrangements":
            "当地的安装、检验、售后与质保安排",
        "Post-application to any tyre brand": "对任意轮胎品牌的后期施用",
        "Any location, shape or depth of 8 mm damage": "任意位置、形状或深度的 8 mm 损伤",
        "Automatic repair of sidewall, shoulder, cord or impact damage":
            "对胎侧、胎肩、帘线或冲击损伤的自动修复",
        "Automatic ECE, DOT or every-country compliance across the range":
            "全系列自动符合 ECE、DOT 或各国法规",
        "One global roadside-assistance or replacement promise":
            "提供统一的全球道路救援或更换承诺",
        "Vehicle owner": "车主",
        "Ask whether an available tyre and local support route match your vehicle and replacement timing.":
            "请咨询可供轮胎与当地支持方案是否与您的车辆及换胎时间相匹配。",
        "Country or region": "国家或地区",
        "Vehicle and current tyre size": "车辆与当前轮胎规格",
        "Driving use and expected replacement timing": "使用场景与预计换胎时间",
        "Photo of the tyre sidewall marking, if available": "轮胎胎侧标识的照片（如有）",
        "Ask about a tyre": "咨询轮胎",
        "Channel or fleet": "渠道或车队",
        "Start with the market, required sizes, volume and the documents your program must carry.":
            "请先提供市场、所需规格、数量，以及您的项目必须配备的文件。",
        "Target market and customer type": "目标市场与客户类型",
        "Required sizes, load and speed ratings": "所需规格、载荷等级与速度级别",
        "Expected quantity and delivery region": "预计数量与交付区域",
        "Required test, certification and warranty documents": "所需的测试、认证与质保文件",
        "Installation, inspection and after-sales plan": "安装、检验与售后方案",
        "Discuss a supply program": "洽谈供货项目",
        "Contact the project team": "联系项目团队",

        # ── copy rendered by the page component, not the `content` dict ────
        # The safety-tires component renders `src/content/safety-tires.ts` media
        # captions for these two items rather than `content.evidenceSystem`
        # media captions. Wording mirrors the sibling captions already
        # translated in the T05 block above.
        "Automated equipment in the self-sealing tyre production base":
            "自密封轮胎生产基地内的自动化设备",
        "Inspection equipment in the production environment":
            "生产环境中的检验设备",
    },

    # ════════════════════════════════════════════════════════════════════════
    # Custom aluminum development page (key: "custom-aluminum")
    # ════════════════════════════════════════════════════════════════════════
    "custom-aluminum": {
        "draft": "draft",

        # ── hero ──────────────────────────────────────────────────────────
        "CUSTOM ALUMINUM DEVELOPMENT": "定制铝制品开发",
        "Start with a drawing, 3D model or physical sample":
            "从图纸、3D 模型或实物样件开始",
        "Fenghuai coordinates drawing-led aluminum component projects through engineering assessment, tooling, first-article review and supplier-supported production.":
            "丰怀统筹以图纸驱动的铝制部件项目，覆盖工程评估、工装、首件评审与供应商制造能力支撑的生产。",
        "This is a project-development route, not a catalogue. Part feasibility, material, process, inspection, quantity and delivery plan are agreed against the customer input.":
            "这是一条项目开发路线，而非产品目录。零件可行性、材料、工艺、检验、数量与交付方案，均依据客户输入逐项约定。",
        "See what can start an assessment": "了解可以启动评估的输入",
        "Start a custom aluminum assessment": "启动定制铝制品评估",

        # ── CA01-EV routing block ─────────────────────────────────────────
        "Are you on the right page?": "您是否找对了页面？",
        "Motor and controller housings have their own route":
            "电机与控制器壳体有专门对应的路线",
        "Water-cooled motor housings, high-pressure die-cast motor housings and controller or inverter housings are collected on the EV housing page, where cooling, sealing and interface requirements belong together.":
            "水冷电机壳体、高压压铸电机壳体以及控制器或逆变器壳体，统一归集在电驱壳体页面，因为冷却、密封与配合面要求本就属于同一组问题。",
        "Water-cooled motor housing": "水冷电机壳体",
        "HPDC motor housing": "HPDC 电机壳体",
        "controller or inverter housing": "控制器或逆变器壳体",
        "If the part is a motor or controller housing, use the EV housing route so cooling, sealing and interface requirements are collected correctly.":
            "如果该零件属于电机或控制器壳体，请走电驱壳体路线，以便正确归集冷却、密封与配合面要求。",
        "Go to the EV housing route": "前往电驱壳体路线",

        # ── CA02 application scope ────────────────────────────────────────
        "Application scope": "应用范围",
        "Application areas listed for project assessment": "供项目评估参考的应用领域",
        "The groups below describe where a drawing-led project may begin. They are not stocked products and do not prove that every geometry, material or validation requirement is feasible.":
            "以下几组描述的是以图纸驱动的项目可以从哪些方向起步。它们不是备库产品，也不能证明任何几何形状、材料或验证要求都可行。",
        "Assessment scope": "评估范围",
        "Motor & reducer": "电机与减速器",
        "End covers": "端盖",
        "Brackets": "支架",
        "Reducer housings": "减速器壳体",
        "Oil-cooled motor housings": "油冷电机壳体",
        "Applications listed for project assessment": "供项目评估参考的应用",
        "Power electronics & thermal management": "电力电子与热管理",
        "Inverter": "逆变器",
        "PDU": "PDU",
        "OBC": "OBC",
        "Water-pump housings": "水泵壳体",
        "Valve blocks": "阀块",
        "Fittings": "接头",
        "Drawing-led applications; not stocked parts": "以图纸驱动的应用；非备库零件",
        "Battery-system structures": "电池系统结构件",
        "Battery enclosures": "电池箱体",
        "End plates": "端板",
        "Cold plates": "冷板",
        "Module brackets": "模组支架",
        "Subject to size, sealing and validation review": "需经尺寸、密封与验证评审",
        "Chassis & body": "底盘与车身",
        "Control arms": "控制臂",
        "Steering knuckles": "转向节",
        "Connectors": "连接件",
        "Lightweight structures": "轻量化结构件",
        "Subject to load case, process and test review": "需经工况载荷、工艺与试验评审",
        "These names describe assessment directions listed in the supplied material. With no project drawing, part number or customer approval behind them, the page publishes no production, stock or case-study claim.":
            "这些名称描述的是供应商资料中列出的评估方向。由于背后没有项目图纸、零件编号或客户批准，本页不作出任何关于生产、库存或应用案例的表述。",

        # ── project inputs ────────────────────────────────────────────────
        "Project inputs": "项目输入",
        "Three inputs can start the engineering review": "三类输入均可启动工程评审",
        "A drawing, a 3D model and a physical sample all enter the same assessment route. Each one asks something different of you, so each card states what the review needs before it can begin.":
            "图纸、3D 模型与实物样件进入的是同一条评估路线。三者对您提出的准备要求各不相同，因此每张卡片都说明了评审启动前所需的条件。",
        "2D drawing": "2D 图纸",
        "Dimensions, datums and tolerance intent": "尺寸、基准与公差意图",
        "Provide dimensions, datums, critical characteristics, tolerance intent, material or performance requirements and the applicable revision.":
            "请提供尺寸、基准、关键特性、公差意图、材料或性能要求，以及适用的图纸版本。",
        "3D data": "3D 数据",
        "A neutral model plus the interfaces that matter": "中性格式模型，以及关键配合面信息",
        "Provide a neutral STEP or IGES model together with the drawing or a marked list of critical interfaces. A 3D model alone does not define acceptance.":
            "请提供中性格式的 STEP 或 IGES 模型，并同时提供图纸或标注了关键配合面的清单。仅有 3D 模型无法界定接收准则。",
        "Physical sample": "实物样件",
        "The part itself, with rights confirmed": "零件实物，且权属已确认",
        "Provide the sample, its known function, mating conditions and the features that must be reproduced. Reverse engineering is assessed after sample ownership and reproduction rights are confirmed.":
            "请提供样件，并说明其已知功能、配合条件以及必须复现的特征。逆向工程需在样件所有权与复制权确认之后才进行评估。",
        "Submitting a sample confirms the right to deliver, measure and reproduce it for a manufacturing assessment.":
            "提交样件即表示确认有权为制造评估之目的交付、测量与复制该样件。",
        "Reverse engineering is part of the physical-sample route rather than a fourth option. It proceeds only once ownership and reproduction rights for the sample are confirmed, because a copy cannot be assessed before the right to make one is established.":
            "逆向工程属于实物样件路线的一部分，而不是第四种选项。只有在样件的所有权与复制权确认之后才会推进，因为在复制权确立之前无法评估复制件的可行性。",
        "The submitting party confirms they are entitled to hand over, measure and use the sample for a manufacturing assessment.":
            "提交方确认其有权为制造评估之目的交付、测量与使用该样件。",

        # ── CA04 engineering assessment ───────────────────────────────────
        "Engineering assessment": "工程评估",
        "Engineering tools support the decision before tooling": "工装投入之前，工程工具先支撑决策",
        "Assessment happens before a tool is cut, so that geometry, process and acceptance criteria are agreed while changing them is still cheap.":
            "评估在动刀开模之前完成，使几何形状、工艺与接收准则在修改成本仍然较低的阶段就达成一致。",
        "DFM review": "DFM 评审",
        "Review geometry, critical interfaces, draft, machining access, joining, inspection and the risks that have to be closed before tooling.":
            "评审几何形状、关键配合面、拔模、机加工可达性、连接方式、检验，以及开模前必须关闭的风险项。",
        "Structural analysis example": "结构分析示例",
        "The supplied material includes a structural-analysis image using wheel geometry. It demonstrates an analysis workflow example; it is not a report for a custom aluminum part.":
            "供应商资料中含有一张以轮毂几何为基础的结构分析图。它展示的是分析工作流程示例，并非针对某一定制铝制部件的报告。",
        "Structural analysis result plotted on a wheel design": "绘制在轮毂设计上的结构分析结果",
        "Structural-analysis workflow example shown on wheel geometry; not a project-specific report.":
            "以轮毂几何展示的结构分析工作流程示例；非项目专属报告。",
        "Casting simulation examples": "铸造模拟示例",
        "The supplied material includes casting-process simulation images using wheel geometry. Project-specific simulation, model assumptions and acceptance criteria must be confirmed for the actual part.":
            "供应商资料中含有以轮毂几何为基础的铸造工艺模拟图。针对实际零件的项目专属模拟、模型假设与接收准则，均须另行确认。",
        "Casting temperature simulation result plotted on a wheel design":
            "绘制在轮毂设计上的铸造温度模拟结果",
        "Casting-process simulation example shown on wheel geometry; assumptions require project confirmation.":
            "以轮毂几何展示的铸造工艺模拟示例；假设条件需按项目确认。",
        "Casting simulation setup showing a runner and gate model":
            "含浇道与浇口模型的铸造模拟设置",
        "Casting simulation setup example from supplied material.":
            "来自供应商资料的铸造模拟设置示例。",
        "Method examples from supplied material — not project-specific validation reports.":
            "方法示例来自供应商资料——并非项目专属的验证报告。",

        # ── development stages ────────────────────────────────────────────
        "Development stages": "开发阶段",
        "From engineering input to approved production": "从工程输入到批准生产",
        "Five stages, in order. Each one has an exit: a project can end at any of them, and the page says so rather than presenting the sequence as a promise of production.":
            "共五个阶段，按顺序推进。每个阶段都有出口：项目可以在其中任一阶段终止；本页如实说明这一点，而不会把该流程呈现为必定投产的承诺。",
        "Review requirements, DFM risks, process options, evidence needs and the basis for quotation.":
            "评审需求、DFM 风险、工艺选项、证据需求与报价依据。",
        "Tooling and trial": "工装与试制",
        "Develop the tooling route, produce trial parts and record the drawing revision used for the first article.":
            "确定工装路线，制作试制件，并记录首件所依据的图纸版本。",
        "Inspection and sample review": "检验与样件评审",
        "Measure agreed characteristics and complete applicable performance checks before customer review.":
            "在客户评审之前，测量已约定的特性指标并完成适用的性能检查。",
        "Approval and engineering closure": "批准与工程关闭",
        "Record sample approval and close agreed engineering changes before the production baseline is released.":
            "在放行生产基准之前，记录样件批准结果并关闭已约定的工程变更项。",
        "Pilot and serial supply": "试产与批量供货",
        "Confirm repeatability, inspection frequency, traceability, packaging and shipment documents for the approved project.":
            "针对已批准项目，确认重复性、检验频次、可追溯性、包装与出货文件。",
        "A project may stop after any stage on a technical, commercial or compliance assessment. Entering one stage does not commit either side to the next.":
            "项目可能基于技术、商务或合规方面的评估而在任一阶段之后终止。进入某一阶段并不构成任何一方对下一阶段的承诺。",

        # ── capability boundary ───────────────────────────────────────────
        "Boundary": "边界",
        "What is listed, what is assessed and what still needs a boundary":
            "哪些已列明、哪些按项目评估、哪些仍有待划定边界",
        "Most capability pages list what a supplier can do. This one separates what the source material lists, what is decided per project, and what cannot be published yet — because the expensive failure in custom work is discovering at the end of an assessment that the part could not have been made.":
            "大多数能力页面列出的是供应商能做什么。本页把三件事分开陈述：原始资料已列明的内容、按项目决定的内容，以及目前尚不能公开的内容——因为在定制业务中，代价高昂的失败往往是在评估结束才发现零件根本无法制造。",
        "Listed in supplier material": "供应商资料中已列明",
        "HPDC": "HPDC",
        "CNC": "CNC",
        "LPDC": "LPDC",
        "Gravity casting": "重力铸造",
        "Forging": "锻造",
        "FSW": "FSW",
        "Surface treatment": "表面处理",
        "Possible combined routes. Which manufacturing entity supplies each route, and where subcontracted work begins, is confirmed per project.":
            "可能的组合路线。每条路线由哪个制造主体承担、外协工序从何处开始，均按项目确认。",
        "Assessed per project": "按项目评估",
        "Material": "材料",
        "Size": "尺寸",
        "Weight": "重量",
        "Wall section": "壁厚",
        "Tolerance": "公差",
        "Load": "载荷",
        "Sealing": "密封",
        "Finish": "表面处理",
        "Inspection": "检验",
        "Tooling": "工装",
        "Volume": "数量",
        "Not every project uses every route, and a route being listed is not a statement that it runs in-house.":
            "并非每个项目都会用到全部路线；某项路线被列出，也不表示该工序由自有工厂完成。",
        "Not yet confirmed for publication": "尚未确认可公开",
        "General size and weight envelope": "通用的尺寸与重量范围",
        "Achievable tolerance ranges": "可实现的公差范围",
        "Universal material grades": "通用材料牌号",
        "Minimum order": "最小起订量",
        "Lead time": "交付周期",
        "Declined categories": "不予承接的类别",
        "These are withheld deliberately. Publishing an unconfirmed figure here would be a commercial commitment, and publishing an unconfirmed exclusion would be worse.":
            "这些内容是有意保留的。在此公布未经确认的数值会构成商务承诺，而公布未经确认的不予承接范围，后果更为严重。",
        "The categories we decline are still being confirmed, so no “what we decline” column is published and this route stays out of search indexing. A blank column would read as a claim to take on anything.":
            "我们不予承接的类别仍在确认中，因此本页不设“我们不做什么”一栏，且该路线不纳入搜索索引。若留空栏，会被理解为承诺承接任何业务。",

        # ── inquiry ───────────────────────────────────────────────────────
        "Start an assessment": "启动评估",
        "Send enough information for a useful first assessment":
            "提供足够信息，让首次评估真正有用",
        "A first assessment is only as good as its inputs. The list below is what the engineering review works from; anything unknown stays open rather than being filled with a generic value.":
            "首次评估的质量取决于输入信息的质量。以下清单是工程评审的依据；任何未知项都会保持待确认状态，而不会用通用数值填充。",
        "Required inputs": "必需输入",
        "Application and part function": "应用场景与零件功能",
        "2D drawing, 3D model or sample status": "2D 图纸、3D 模型或样件状态",
        "Critical dimensions, datums and tolerance intent": "关键尺寸、基准与公差意图",
        "Material or performance requirements": "材料或性能要求",
        "Load, cooling, sealing or environmental conditions": "载荷、冷却、密封或环境条件",
        "Surface and corrosion requirements": "表面与防腐要求",
        "Inspection and target-market documents": "检验与目标市场文件",
        "Prototype quantity and expected annual volume": "试制数量与预计年用量",
        "Target sample timing and destination market": "期望样件时间与目的地市场",
        "No direct upload is available yet. Marking a drawing or a sample as available does not attach a file — the project team sends a controlled exchange method against your enquiry reference instead.":
            "目前尚不提供直接上传。将图纸或样件标记为“可提供”并不会附加文件——项目团队会依据您的询盘编号发回一套受控的交换方式。",
        "Your enquiry carries product_line=custom-aluminum together with the application group, the input type and this page as its source. NDA available for project discussion.":
            "您的询盘会携带 product_line=custom-aluminum，以及应用类别、输入类型，并以本页作为来源。项目洽谈可签署 NDA。",

        # ── closing ───────────────────────────────────────────────────────
        "Enquiries": "询盘",
        "Contact the project team": "联系项目团队",
        "One drawing is enough to start.": "一份图纸就足以启动。",
        "A drawing, 3D data or a physical sample all begin the same assessment route, and each stage can be stopped before the next one is committed.":
            "图纸、3D 数据或实物样件都从同一条评估路线开始，且每个阶段都可以在承诺下一阶段之前停下来。",
    },
}
