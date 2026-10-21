# Agent E · 质量 / 性能 / Agent 化审计（M08 / M17 / M18）

> 审计对象：`/Users/fkycoya/Documents/Code/WordpressWheelSIte`
> 事实源：`outputs/audit-v3/BASELINE.md`（E5）
> 代码证据：E1（工作区源码，**不等于已提交状态**，见 BASELINE §2：177 项未提交改动）
> 测试证据：E3（`playwright-report/` + `test-results/` 最近一次运行）
> 明确未做：未跑 E2E、未跑 build、未改源码、未 install

---

## M08 产品系统

**成熟度**: **2 / 5**

**状态**: 数据契约层做得很扎实（fail-closed 的发布门槛、服务端权威解析、禁止客户端规格回填），但**三级关系并不成立——实际只有两级**：`WheelModel → PublicWheelVariant`，没有 Category / Series 实体。发布门槛函数有 2 套互不相干的实现，构成"同一概念两个真相"的结构性隐患。

### 证据

**E1 · 数据模型只有两级**
- `src/lib/wheels/types.ts:92-109` —— `PublicWheelVariant`（一条已批准生产配置，含 `productionCode` / `size` / `diameter` / `width` / `pcd` / `pcdKey` / `offset` / `centerBore` / `finish`）
- `src/lib/wheels/types.ts:110-137` —— `PublicWheelModel`（`slug` / `model` / `displayModel` / `processKey` / `variants[]` / 派生的 `diameters` / `pcds` / `approvedVariantCount`）
- **`types.ts` 全文没有任何 `series` / `category` 字段**（grep `series|category` 在 `src/lib/wheels/types.ts` 返回 0 行）
- 工艺是**扁平枚举**而非 Series 实体：`types.ts:47-52` `ProcessKey = "flow-formed" | "low-pressure-cast" | "low-pressure-flow-formed" | "forged" | "not-specified"`

**E1 · 路由侧印证：`/products/wheels/flow-formed` 不是 Series 页，而是硬编码静态页**
- `src/app/products/wheels/flow-formed/page.tsx:2` 从 `@/content/flow-formed-wheels` 取 `flowFormedWheelsPage`（TS 硬编码内容），WordPress 只提供 slug + 四段正文（`src/lib/wordpress/flow-formed.ts:48-54` 注释明确写了 "Both stay owned by `@/content/flow-formed-wheels`; the WordPress body carries the `slug` plus the four body sections only"）
- 所以 `/products/wheels/flow-formed` 是**营销落地页**，不是从产品数据自动聚合的 Series 页。`/products/wheels/forged` 同理（`src/app/sitemap.ts:32` 硬编码）。

**E1 · 已具备：已下架产品会被询盘接口拒绝（这是本项目最硬的一块）**
- `src/lib/wheels/inquiry-binding.ts:117-140` `bindWheelEnquiry()`：服务端调用 `resolvePublishedWheelSelection({slug, productionCode})`，解析不到时 ——
  - 丢弃 `productionCode`，置 `selectedSpec: undefined`
  - 标 `variantPending: true` 让业务人工跟进
  - **注释原文**："客户给了线索但解析不到 —— 不能把他的规格写进事实源"、"spec 只能来自服务端解析，解析不到就没有规格"
- `src/lib/wheels/inquiry-binding.ts:78-83`：多品清单模式下任一 SKU 未发布 → 整单拒绝（`ok: false`，`"One selected wheel is no longer available."`）
- `src/lib/wheels/public-catalogue.ts:157-169` `resolvePublishedWheelSelection`：`model.variants.find(...)` 找不到即 `return null`（fail-closed）
- **结论：已下架 SKU 不能被当作有效询盘提交，且不会污染规格快照。这是 5/5 水平的实现。**

**E1 · 已具备：发布门槛 fail-closed**
- `src/content/flow-formed-wheels.ts:220-224` `isFlowFormedPublishingOpen()`：`copyReviewed === true && equipmentImageRights === "approved"`，注释写 "True only when every gate is positively cleared — fail-closed by default"
- `src/content/custom-aluminum.ts:64-68` `isCustomAluminumIndexable()`：`publicationStatus === "approved" && boundary.declinedConfirmed`
- `src/content/types.ts:1440-1444` 设计意图写得很清楚：门槛"checked in metadata, not in the component tree, so a viewport can never reveal what the gate hides"

### 已具备
1. **服务端权威规格快照**（`inquiry-binding.ts:117-140`）—— 拒绝客户端传入的规格，全部服务端解析。这是防伪造的核心。
2. **SKU 级别 fail-closed 校验**（`public-catalogue.ts:157-169` + `inquiry-binding.ts:78-83`）。
3. **发布门槛 fail-closed**，两个页面族都有，且门槛在 metadata 层不在组件树内。
4. **派生集合而非型号级集合**：`types.ts:126-131` 明确 `diameters` / `pcds` 全部从已批准 `variants` 派生（注释引 spec §3.3），避免"型号级声明与真实产能不符"。
5. **工艺不猜**：`types.ts:63-67` `processKeyOf()` 表外值一律归 `not-specified`，`processLabelEn()` 返回 `undefined` 而不是兜底成某个具体工艺。

### 缺口

| # | 缺口 | 严重度 | 阻塞上线 | 证据 |
|---|---|---|---|---|
| M08-1 | **三级关系不存在**：无 Category / Series 实体，只有 WheelModel → Variant 两级。"Series" 靠硬编码静态页 `/products/wheels/flow-formed`、`/products/wheels/forged` 表现，新增 Series 必须写新 page.tsx | **高** | 否（当前 4 条产品线够用） | `types.ts:110-137`；`sitemap.ts:33` 硬编码 |
| M08-2 | **发布门槛 2 套实现、2 套语义**：`isFlowFormedPublishingOpen` 用 `copyReviewed + equipmentImageRights`，`isCustomAluminumIndexable` 用 `publicationStatus + declinedConfirmed`。命名（PublishingOpen vs Indexable）、返回语义（布尔不变式 vs 异步包装）、字段名全不同，未来第三个页面族会出现第三套 | **中** | 否 | `flow-formed-wheels.ts:220` vs `custom-aluminum.ts:64` |
| M08-3 | **门槛逻辑重复出现在两个调用点**：`sitemap.ts:22-24` 与 `flow-formed/page.tsx:94` 都写 `isFlowFormedPublishingOpen(...) && view.total > 0`，这个 `&& total > 0` 复合条件在两处各写一遍 | **中** | 否 | `sitemap.ts:22-24`；`flow-formed/page.tsx:94` |
| M08-4 | **custom-aluminum 当前是 `draft`**（`custom-aluminum.ts:74` `publicationStatus: "draft"`），即该页面族**永久 noindex 且不进 sitemap**。是「有意未上线」还是「忘了改」需产品侧确认 | **中** | 否 | `custom-aluminum.ts:74`；`sitemap.ts:69` |
| M08-5 | **SKU 参数存在多份副本**：TS 硬编码内容（`src/content/*.ts` 29 个文件）+ WordPress ACF 字段 + 前端 `specSnapshotOf()` 生成的 `Record<string,string>` 快照（键名 `size/pcd/et/cb/finish`）。三处键名契约靠注释维持（`inquiry-binding.ts` "契约一致" 注释），**没有 zod schema 或共享常量强制** | **中** | 否 | `inquiry-binding.ts:1-10`（`specSnapshotOf`，键名硬编码）；`src/content/` 29 个文件 |
| M08-6 | **无 Variant 级唯一约束的数据库保证**：重复校验靠应用层 `seen` Set（`inquiry-binding.ts:88-93`），WordPress 侧是否有唯一索引未验证 | 低 | 否 | `inquiry-binding.ts:88-93` |

### 重复实现
- **发布门槛 2 套**（见 M08-2）—— 同一业务概念（"这个页面能不能被索引"）两套字段名、两套判断。
- **`&& total > 0` 复合条件 2 处**（见 M08-3）。
- **规格字段名 3 份**：`types.ts` 的 `PublicWheelVariant`（camelCase：`centerBore` / `pcdKey`）、`specSnapshotOf` 的快照键（`cb` / `et` / `pcd`）、WordPress ACF 字段名（未读，移交 Agent A）。三者之间只有注释级约定。
- 注：`PublicWheelVariant` 与 `WheelCatalogueCard` 是有意裁切的同源视图（`types.ts:138-141` 注释明说），**不算重复**。

### 风险
1. **新增产品族的边际成本高**：没有 Series 抽象，来一条 Product Line 就要写一个 page.tsx + 一个 content/*.ts + 一个门槛函数。当前 4 条线（flow-formed / forged / custom-aluminum / EV）尚可，第 6-8 条会失控。
2. **门槛语义漂移**：两套门槛都"看起来对"，但一个要求 `publicationStatus === "approved"` 另一个要求 `copyReviewed === true`。审核人员按哪套 checklist 走？无统一文档 → 未来必然出现「A 页面已上线但按 B 页面标准不算批准」的争议。
3. **`custom-aluminum` 处于 draft 而 sitemap 有分支**（`sitemap.ts:69` `if (customAluminumIndexable) paths.push(...)`）—— 这段分支目前**永不执行**，是死代码，但会让人误以为该页已上线。

### 建议动作
1. （P1）抽 `src/lib/publication/gate.ts` 定义统一 `PublicationGate` 类型 + `isPublishable(gate)`，把 flow-formed / custom-aluminum / 未来族全部收敛。**统一字段命名**（`reviewed` / `rightsApproved` / `status`），把 `&& total > 0` 收进 gate 求值函数。
2. （P2）把 `specSnapshotOf` 的键名提到共享常量（`SPEC_SNAPSHOT_KEYS`）+ zod schema，让 TS 侧与 WP ACF 字段名在同一处声明。
3. （P2）显式记录「Series 不是实体」是**有意决策**（而非遗漏），并在 `docs/` 写清「新增产品线 = 新增静态页」的 SOP。若未来需要 Series 聚合页，则先做数据模型再写页面。
4. （P3）确认 `custom-aluminum` 的 draft 状态是否为预期；不是则改，是则加注释防误读。

### 依赖
- 依赖 **Agent A**：确认 `src/lib/wordpress/` 21 个文件的 fetch/校验是否有重复实现（BASELINE §8 已指派）。
- 依赖 **Agent B**：WordPress ACF 字段名与 `PublicWheelVariant` 的映射是否 1:1，是否有 Variant 唯一索引。
- 依赖 **Agent C**：`custom-aluminum` / `flow-formed` 的索引策略与 sitemap 一致性。

### 验收方式
- 门槛统一后：一条 `node --test` 单元测试覆盖「gate 缺任一字段 → `isPublishable()` 返回 false」（当前单测 **16 个文件里没有任何一个测 `isFlowFormedPublishingOpen` / `isCustomAluminumIndexable`** —— BASELINE §3.2 清单可证，这是**测试空白**）。
- SDK 契约测试：给 `bindWheelEnquiry` 传一个已 `withdrawn` 的 SKU，断言 `selectedSpec === undefined && variantPending === true`（当前 `inquiry-contract.test.mts` 有 13 用例，是否覆盖该分支需 Agent B 确认）。

---

## M17 AI Agent 接入

**成熟度**: **3 / 5**

**状态**: `AGENTS.md` + `AGENT-OPERATING-GUIDE.md` 是**真实可执行的工作流文档**（10 步 + 可直接粘贴的 prompt 模板，不是摆设）。**但 ⚠️ 一个重大更正：V3.0 假设的"受控内容写入 mutation 接口"在代码里不存在** —— `fenghuai-wheel-authoring.php` 只注册了 `WP_REST_Server::READABLE`（GET），insights 侧连 REST 路由都没有。内容写入 = 人类在 WP Admin 手点 Meta Box。另外**没有 PR 模板 / CODEOWNERS / 分支策略**，diff 审核靠 Agent 自判"低风险可跳过"，CI 不跑 E2E。

### 证据

**E1 · `AGENTS.md`（254 行）定义了 10 节可执行工作流**

| 节 | 行 | 内容 | 是否可执行 |
|---|---|---|---|
| §3 Session 开始 | 37-55 | 渐进式加载上下文 | ✅ 有明确步骤 |
| §4 Session 结束 | 56-69 | 收尾清单 | ✅ |
| §6 归档路由表 | 114-133 | "东西该放哪" | ✅ |
| §7.0 发布资格 | 138-141 | 无图/未确认内容不进页面、筛选、sitemap | ✅ 与 M08 门槛呼应 |
| §7.1 内容接缝是契约 | 142-145 | 展示层只消费 `src/content/types.ts` 类型，不读 WP 原始响应 | ✅ 架构约束 |
| §7.2 证据纪律 | 146-152 | `PLACEHOLDER` 不得为过构建而删；"数字未知时…**绝不是编一个看起来合理的值**" | ✅ 强约束 |
| §9 完成定义 | 216-226 | "代码能跑不等于完成"，4 条验收信号 | ⚠️ **按风险自选**，无强制门禁 |
| §10 技能路由 | 227-231 | 指向 `SKILLS/fenghuai-engineering-workflow/SKILL.md`，且明写"按风险与复杂度选择步骤，不要求每项工作都创建完整规格、子任务或独立审查" | ⚠️ **明确允许跳过** |

**E1 · `AGENT-OPERATING-GUIDE.md`（262 行）定义了 10 步工作流提示词**
- 第 0 步快速分流（:46）、1 澄清（:62）、2 调查现状（:85）、3 方案对抗审查（:105）、4 写规格拆切片（:122）、5 实施增量（:147）、6 自测验证（:164）、**7 对抗性代码审查（:179）**、8 端到端与人工验收（:194）、9 记录收尾（:210）
- 每步都给了**可直接粘贴的 prompt 模板**（如 `:186-190` 的审查 prompt："先给 findings，按严重程度排序…没有发现时说明检查范围、证据和未覆盖风险；不要为了列问题制造问题"）。这是**高质量的 Agent 协作资产**。

**E1 · 门禁缺失（硬证据）**
- `.github/` 目录**只有 `workflows/verify.yml` 一个文件**（`ls -la .github/` 输出：仅 `workflows` 目录）。→ **无 `PULL_REQUEST_TEMPLATE.md`、无 `CODEOWNERS`、无 `ISSUE_TEMPLATE/`**
- `AGENT-OPERATING-GUIDE.md:179` 第 7 步原文："适合中高风险…；**普通低风险小改动可跳过独立审查**" —— 是否"中高风险"由**执行 Agent 自己判定**
- `AGENTS.md` 全文无「分支策略」「PR 要求」「reviewer 必需」字样（§9 完成定义只提 lint/typecheck/build/STATUS.md，不提 PR）

**E1 · `WP_API_TOKEN` 与 `WP_INQUIRY_SERVICE_KEY` 已分离（5/5 水平）**
- 读路径：`src/lib/wordpress/client.ts:17-24` `getWpConfig()` 用 `process.env.WP_API_TOKEN`
- 写路径：`src/lib/wordpress/client.ts:212-232` `wpWrite()` 用 `process.env.WP_INQUIRY_SERVICE_KEY`，且注释 `:207-210` 明确："Auth is a **service key**, not a WP user: the value travels in the `X-FH-Service-Key` header. **Never in the URL** (query strings end up in access logs) and never from a cookie jar."
- 第三处：`src/lib/inquiry/receipt.ts:9` 也用 `WP_INQUIRY_SERVICE_KEY` 做签名
- `client.ts:12-13` 明确警告："This module must never be imported from a client component — the auth token and the CMS hostname stay server-side"，且 `:1` 有 `import "server-only"` 强制

**E1 · ⚠️ 重大更正：`fenghuai-wheel-authoring.php` 不是 mutation 接口，是只读集合接口**
- `fenghuai-wheel-authoring.php:311-323` `register_rest_route('fh/v1', '/wheels', ...)` —— **`'methods' => WP_REST_Server::READABLE`**（只有 GET）
- `:317` `'permission_callback' => '__return_true'` —— **公开可读**（设计如此，因为是公开产品目录）
- 唯一带权限的分支：`:328` `if ($preview && !current_user_can('edit_posts')) return WP_Error(..., 401)` —— 预览需 `edit_posts`
- **真正的写入通道是 WP Admin Meta Box**：`:83-82` `fh_wheel_authoring_add_meta_box()`、`:226-233` `fh_wheel_authoring_save()`，其权限检查是 `:230` `if (!current_user_can('edit_post', $postId)) return;`
- 可编辑字段：`:377` `'editable_meta' => ['variants_json', 'gallery_media_ids']`
- **结论：V3.0 说的"受控内容写入 mutation 接口"在 wheel 侧不存在。写入 = 人类在 WP Admin 手动编辑 Meta Box，Agent 只能 GET。**

**E1 · `fenghuai-insights-authoring.php`（286 行）同样没有 REST 写入路由**
- `grep register_rest_route` → **0 行**（该文件不注册任何 REST 路由）
- 只有 ACF/字段级权限：`:132` `'auth_callback' => static fn(): bool => current_user_can('edit_posts')`（字段级开关）
- `:269` `if (!current_user_can('edit_post', $postId)) return;`（保存钩子）
- **结论：insights 侧也是 WP Admin 人工编辑，无 API。**

### 已具备
1. **`AGENT-OPERATING-GUIDE.md` 10 步 prompt 模板**（:46-227）—— 这是本项目最被低估的资产，可直接给任何编码 Agent 用。
2. **`AGENTS.md` §7.2 证据纪律**（:146-152）—— "数字未知时…绝不是编一个看起来合理的值"，这条规则与 M08 的 fail-closed 门槛互为表里，是**真实的工程文化而非文档装饰**（E1 可证：`processKeyOf` 表外值不猜、`inquiry-binding.ts` 解析不到就不附规格）。
3. **Token 读写分离 + `server-only` 强制**（`client.ts:1,12-13,207-210`）。
4. **§9 完成定义**要求 `STATUS.md` 反映实际状态（:225）。

### 缺口

| # | 缺口 | 严重度 | 阻塞上线 | 证据 |
|---|---|---|---|---|
| M17-1 | **无 diff 审核门禁**：无 PR 模板、无 CODEOWNERS、无分支保护证据。审查是否做，由执行 Agent 自判「低风险可跳过」 | **高** | 否（但直接导致 177 项未提交改动堆积） | `.github/` 只有 `workflows/`；`AGENT-OPERATING-GUIDE.md:179` |
| M17-2 | **无"受控内容写入 API"**：`fenghuai-wheel-authoring.php` 只有 `WP_REST_Server::READABLE`（:315），insights 侧无 REST 路由。V3.0 的 mutation 接口假设**与代码不符** | **高**（若是 V3.0 的核心卖点） | 需产品侧确认 | `wheel-authoring.php:315,317`；`insights-authoring.php` 无 `register_rest_route` |
| M17-3 | **Agent 无法完成"内容上线"闭环**：Agent 只能 GET 产品数据；写入必须人类进 WP Admin 点 Meta Box。所谓"AI 可写"实际是"AI 出建议 + 人手工录" | **中** | 否 | `wheel-authoring.php:226-233` 是 `save_post` 钩子而非 REST |
| M17-4 | **CI 不跑 E2E**，Agent 的 §9「完整 lint/typecheck/build 与对应业务验证」中"业务验证"在 CI 无强制 | **高** | 否 | BASELINE §10（verify.yml 无 E2E）；本次 4 个 E2E 失败已溜过 |
| M17-5 | **`AGENTS.md` 自称"规则优先级"（§2）但无版本/生效日期**，Agent 无法判断文档是否过期 | 低 | 否 | `AGENTS.md:19-36` |
| M17-6 | **`SKILLS/fenghuai-engineering-workflow/SKILL.md` 未验证存在**（§10 引用） | 低 | 否 | `AGENTS.md:229-230`（本轮未读，见移交） |

### 重复实现
- **两套 Agent 文档并存**：`AGENTS.md`（规则）与 `AGENT-OPERATING-GUIDE.md`（提示词）。二者有重叠（完成定义 vs 第 6 步自测验证），但没有明确的"谁是正本"声明。`AGENTS.md:19-36` 的规则优先级表**未提及 `AGENT-OPERATING-GUIDE.md`**（本轮未逐行核对 §2 全文，标注为待确认）。

### 风险
1. **177 项未提交改动就是 M17-1 的直接后果**（BASELINE §2）。没有 PR 门禁 → Agent 连续工作不切分支不提交 → 工作区与任何已提交状态都不一致 → 审计本身都只能描述"工作区现状"。
2. **"受控写入"的叙事风险**：如果对外（投资人/客户）宣称"AI Agent 可受控写内容"，而实际是 WP Admin 人工操作，这是**叙事与实现不符**。必须在 V3.0 里澄清。
3. **质量靠人自觉不可规模化**：4 个 E2E 失败长期挂着无人修（`test-results/` 是最近一次运行结果），正是"自选风险、自判可跳过"的实证。

### 建议动作
1. （P0）加 `.github/PULL_REQUEST_TEMPLATE.md`，把 `AGENTS.md:216-226` 的 4 条完成定义变成勾选项；加 `.github/CODEOWNERS` 给 `src/lib/inquiry/**`、`src/lib/wheels/**`、`local-wp/**` 指定 reviewer。
2. （P0）把 E2E 挂进 CI（可只跑 `site-contract` + `inquiry` 两个 spec 做最小门禁），修复 4 个失败后再放开全量。
3. （P1）**澄清 mutation 接口的真实状态**：要么承认"无写入 API，Agent 只读"，要么真的实现一条带 `edit_posts` 权限 + HMAC 签名的 `POST /fh/v1/wheels`。当前是"文档说有、代码说没有"。
4. （P2）在 `AGENTS.md` §2 补一条："`AGENT-OPERATING-GUIDE.md` 是提示词库，`AGENTS.md` 是规则正本；冲突时以 `AGENTS.md` 为准"。

### 依赖
- 依赖 **Agent D**：`verify.yml` 的分支触发条件、是否有 main 分支保护（GitHub 侧配置不在仓库里）。
- 依赖 **Agent A**：`fenghuai-content-webhooks.php`（135 行）是否是另一条写入路径。

### 验收方式
- 门禁：一个故意引入类型错误的 PR 在 CI 变红（当前 typecheck 已在 CI，此条已满足）。
- E2E 门禁：故意把 `/thank-you` 留在 sitemap → CI 变红（当前不会）。
- Token 分离：`grep -c "WP_API_TOKEN" src` 只出现在 `src/lib/wordpress/client.ts` 且不在任何 client component 中（当前满足）。

---

## M18 性能与质量

**成熟度**: **2 / 5**

**状态**: 4 个 E2E 失败中，**2 个是真正的功能/契约回归（E1 可证）**，2 个是断言过期。

### 4 个 E2E 失败定性（核心结论）

**E3 来源**：`test-results/.last-run.json` `"status": "failed"`，4 个 failedTests 全部在 `site-contract.spec.ts`（ID 前缀 `f56d01d93e0637e13c80`）。
**错误原文**取自 4 个 `test-results/*/error-context.md` 的 `# Error details` 段。

| # | 用例 | 错误原文 | 定性 | 依据（E1） |
|---|---|---|---|---|
| 1 | robots 与 sitemap 只发布配置域名和可索引页面 | `expect(received).not.toContain(expected)` / `Expected substring: not "/thank-you"` | 🔴 **真正的功能回归（或者说：测试揭示了一个真实 SEO 缺陷）** | `src/app/sitemap.ts:38` **硬编码把 `/thank-you` 放进了 sitemap**。E2E `site-contract.spec.ts:28` 断言 `expect(xml).not.toContain("/thank-you")`。**sitemap 当前会把询盘提交后的确认页收录进搜索引擎**，这是真实的 SEO/转化污染缺陷，不是测试过期。 |
| 2 | 中文独立 URL、语言声明和切换路径保持正确 | `Expected: "noindex, follow"` / `Received: undefined` | 🟡 **断言过期（测试期望的响应头在实现中不存在）** | `site-contract.spec.ts:133` 断言 `response.headers()["x-robots-tag"] === "noindex, follow"`。但 **`grep -rn "x-robots-tag" src -i` 返回 0 行** —— 整个 `src/` 从不发这个响应头。`src/proxy.ts:33,74` 只设 `Content-Language`，不设 `X-Robots-Tag`。实现改用 `<meta name="robots">`（`site-contract.spec.ts:172` 另一条用例断言 HTML 里有 `name="robots" content="noindex"`）。→ **测试是按旧架构（响应头方案）写的，实现已改成 meta 方案，测试没跟上。** |
| 3 | 公开内容页统一使用 Astryx 面包屑并标记当前页面 | `Locator: getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Products' })` / `Expected: "/zh/products"` | 🟡 **断言过期（中文标签未本地化，非功能损坏）** | `site-contract.spec.ts:219-223` 断言 `/zh/products/wheels` 的面包屑里有名为 **"Products"（英文）** 的链接指向 `/zh/products`。失败时的 accessibility snapshot 显示 `link "峰徊首页"` / `text: Fenghuai 制造` —— 即**中文页面已经把面包屑标签本地化了**（"首页" 而不是 "Home"），所以英文名 "Products" 找不到。→ 中文面包屑功能**正常**，是测试用了英文 label。**但需注意：这可能只是"标签变了"，也可能是"该链接 href 不再指向 /zh/products"**，两者需实跑才能区分（E3 快照只到 banner 层，未含 breadcrumb 层）。**标注为 E3 未完全判定。** |
| 4 | 西班牙语与泰语路径可访问但在正文审核前保持 noindex | `Expected: "noindex, follow"` / `Received: undefined` | 🟡 **断言过期（同 #2，同一根因）** | 同 #2：`site-contract.spec.ts:161` 断言 `x-robots-tag` 响应头，实现无此头。 |

**结论**：4 个失败 = **1 个真缺陷（`/thank-you` 进 sitemap）+ 3 个断言过期（2 个同根因：`x-robots-tag` → meta 迁移未同步测试；1 个中文 label 本地化未同步测试）**。

> ⚠️ **必须声明**：以上定性基于 E1 源码 grep + E3 error-context，**未实跑复现**。CAS 编号 2/4 的"实现无 `x-robots-tag`"是 E1 强证据（grep 0 行）；#3 的 href 是否正确**未能确证**，需实跑或读 `src/components/site-breadcrumbs.tsx` 定论。

### 已具备
1. **`accessibility.spec.ts` 是真实的 a11y 门禁**：`@axe-core/playwright` + `.withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"])`（`:18`），覆盖 7 个代表页（`:4-12`），断言 `expect(summary).toEqual([])`（`:26`）—— **零容忍**，不是"有 issue 但不严重"。且 `:16` `page.emulateMedia({reducedMotion: "reduce"})` 会顺带验证动效降级。
2. **键盘可达性有真断言**：`:8-13` `tabUntil()` 最多 40 次 Tab 找到目标，`:23` 断言 `toBeFocused()`，`:29` 断言 `outline !== "none" || boxShadow !== "none"` —— 这是**真实的焦点可见性检查**，不是形式。
3. **200% 缩放无横向溢出**（`:58`）。**错误聚焦首个单选项**（`:33-37`）。
4. **`inquiry.spec.ts` 是高价值功能测试**：拦截请求读 `requestBody` 断言 `context.pageUrl` / 各上下文键（`:75-79`）；**断言幂等重放**（`:84-95` "200 幂等重放仍视为成功" → `INQ-E2E-REPLAY`）；**断言多配置清单刷新后恢复**（`:98-145` "2 of 20 configurations selected" 跨刷新保持）。**这不是"页面能打开"式的假测试。**
5. **`site-contract.spec.ts` 无 JS 场景验证**：`:262-274` 用 `request.get()` 拿裸 HTML 断言 `astryx-empty-state` / `astryx-outline` / `href="#section-1"` 与 `id="section-1"` 成对存在 —— **真实的可爬取性/无 JS 降级检查**。
6. **单测 68/68 通过**（E5，BASELINE §3）。

### 缺口

| # | 缺口 | 严重度 | 阻塞上线 | 证据 |
|---|---|---|---|---|
| M18-1 | **`/thank-you` 被写进 sitemap** —— 询盘成功确认页会被收录，污染搜索结果与转化归因 | **高** | **是**（上线前必修） | `src/app/sitemap.ts:38` vs `e2e/site-contract.spec.ts:28` |
| M18-2 | **E2E 从未进 CI**（BASELINE §10），4 个失败长期挂账 | **高** | 是（等于无回归防线） | BASELINE §10 |
| M18-3 | **测试与实现漂移无人发现**：实现已从 `X-Robots-Tag` 响应头迁移到 `<meta name="robots">`，测试仍在断言响应头。`grep -rn "x-robots-tag" src -i` → **0 行** | **中** | 否（功能正确，测试错） | `site-contract.spec.ts:133,161`；`src/proxy.ts` 只设 `Content-Language`（:33,74） |
| M18-4 | **Core Web Vitals 零测量**：`src/` 无 `useReportWebVitals`、无 `web-vitals` 依赖、无 Lighthouse CI。grep `lighthouse\|web-vitals\|LCP\|CLS` 在 `src/`、`package.json`、`playwright.config.ts` **全部 0 命中**（仅内容文案误命中） | **高** | 否（但性能盲飞） | 全仓 grep |
| M18-5 | **`@stylexjs/stylex@0.19.1` 是纯死依赖**：`grep -rln "stylex" src` → **0 个文件**。装了、在 `package.json` 里、但一行代码没用 | **中**（供应链攻击面 + 认知负担） | 否 | `grep -rln stylex src` = 空 |
| M18-6 | **样式体系三套并存且职责不清**：`@astryxdesign/*`（17 个文件引用）+ `tailwindcss@4`（`globals.css:6` `@import "tailwindcss"` + `:8` `@import "shadcn/tailwind.css"` + `:21` `@theme inline`）+ 482 行手写 `globals.css`。**实际是"两套系统 + 一个死依赖"** | **中** | 否 | `src/app/globals.css:6,8,21,1-482` |
| M18-7 | **`src/theme/fenghuai-neutral/` 有 12 个文件，其中 4 个是 `.generated.ts` / `.receipt.json`**（`neutralPalettes.generated.ts`、`neutralPaletteRefs.generated.ts`、`neutralPalettes.generated.receipt.json`、`site-theme.css.d.ts`）。生成物入库 + `theme:check` 每 CI 跑一次 diff，是**正确的做法**（可审计），但意味着改色必须走 `astryx theme build` 而不能手改 CSS | 低（正确设计，但知识门槛高） | 否 | `package.json:41`；`src/theme/fenghuai-neutral/` |
| M18-8 | **46 个路由全是 `ƒ` Dynamic**（BASELINE §3.1），无 ISR/静态化，缓存策略是否兜住未验证 | **中** | 否 | BASELINE §3.1 |
| M18-9 | **无性能预算/包体监控**：无 `bundlesize`、无 `.size-limit.json` | **中** | 否 | 全仓无配置 |
| M18-10 | **E2E 未覆盖 5 个 API 路由中的 2 个**：`/api/preview/exit`（8 行）无独立用例；`/api/revalidate/wordpress` 只有正向用例 | 低 | 否 | BASELINE §5.1 vs `site-contract.spec.ts` |

### 重复实现
- **样式体系两套共存**（Astryx design token vs Tailwind v4 `@theme inline`）—— `globals.css:21` 的 `@theme inline` 把 token 桥接到 Tailwind，说明**有人刻意做了桥接**，所以不是无政府重复，而是"两套系统 + 一层适配"。但这也意味着：**新组件该用哪套，没有成文规则**（`AGENTS.md:153` §7.3 只说"用设计令牌不用 hex"，未指定 Astryx 还是 Tailwind class）。
- **`@stylexjs/stylex` 完全未用**（M18-5）—— 最纯粹的重复：第三套方案装了但没启用。

### 风险
1. **性能完全盲飞**（M18-4 + M18-8 + M18-9）：46 个路由全 Dynamic、零 CWV 测量、零包体预算。Turbopack 构建 57.5s 好看，但**首屏 TTFB / LCP 无任何数据**。对 SEO（本项目核心目标）这是**最危险的盲区**——Google 用 CWV 做排名信号，而我们连数字都没有。
2. **`/thank-you` 进 sitemap**（M18-1）：直接后果是 Google 可能把提交确认页作为搜索结果展示，用户点进去看不到价值 → 跳出率上升 + 品牌信任受损。**这是 1 行修复，但不修就是真损失。**
3. **测试漂移无人察觉**（M18-3）：`x-robots-tag` 断言过期说明**实现变更时没人跑 E2E**。如果这次审计没做，这条会一直挂着直到某天有人"顺手"把断言删掉——**那时就永久失去了 noindex 的保护性检查**。
4. **样式体系认知门槛**（M18-6/7）：新来的 Agent/开发者要在 Astryx token、Tailwind v4 `@theme`、482 行 globals.css 之间找答案，且 `theme:check` 会因手改 CSS 失败。这是**可维护性税**。
5. **`@stylexjs/stylex` 死依赖**（M18-5）：0.19.1 是 pre-1.0 包，长期不更新会成为 `npm audit` 噪音源。

### 建议动作
1. **（P0，1 行）** 删 `src/app/sitemap.ts:38` 的 `"/thank-you",`。同时补一条单测：`sitemap()` 输出不含 `/thank-you`（当前无任何单测覆盖 sitemap 内容）。
2. **（P0）** 新增 `e2e/` 到 CI，先只跑 `site-contract` + `inquiry` + `accessibility` 三个 spec，修复 4 个失败后放开全量。
3. **（P0）** 修 3 个过期断言：`site-contract.spec.ts:133`、`:161` 改为断言 `<meta name="robots" content="noindex">`；`:219-223` 改为断言本地化后的面包屑 label（或断言 `href` 而非 label）。
4. **（P1）** 接入 CWV：Next 16 自带 `useReportWebVitals`，加 `src/app/_components/vitals.tsx` 打到 `/api/vitals` 或现有 analytics；加 Lighthouse CI budget（LCP < 2.5s / CLS < 0.1 / INP < 200ms）。**没有测量就没有优化，也没有验收。**
5. **（P1）** 删 `@stylexjs/stylex`（`package.json` 去掉 + `npm uninstall`），或在 `AGENTS.md` §7.3 里写明"本包不用，保留是因为 X"。
6. **（P2）** 在 `AGENTS.md` §7.3 补样式决策树：「布局/排版用 Tailwind v4 utility；组件外观用 Astryx 组件 + token；禁止裸 hex；禁止新增 `.module.css`」。
7. **（P2）** 评估 Dynamic 是否必要：静态内容页（`/about`、`/support/*`、`/insights/*`）可考虑 ISR + `revalidateTag`（已有 `wheel-publication` / `site-pages` tag 机制，`site-contract.spec.ts:100-118` 可证）。

### 依赖
- 依赖 **Agent C**：sitemap 的 SEO 正确性整体判定（本报告只报 `/thank-you` 这一条）。
- 依赖 **Agent D**：CI 改造归属；`verify.yml` 是否可加 E2E job（需端口/构建策略）。
- 依赖 **Agent A**：46 路由全 Dynamic 的成因（是 `force-dynamic` 还是用了动态 API）。

### 验收方式
- M18-1：`curl -s localhost:3100/sitemap.xml | grep -c thank-you` → **0**。
- M18-3：4 个失败用例修复后 `npx playwright test e2e/site-contract.spec.ts` 全绿（**本轮禁止实跑，标注为待验收**）。
- M18-4：CI 出现 Lighthouse 报告且 LCP/CLS 有具体数值。
- M18-5：`npm ls @stylexjs/stylex` → `(empty)`。
- M18-6：`grep -rn "className=\"[^\"]*\(flex\|grid\|p-[0-9]\)" src/components | wc -l` 作为 Tailwind 使用量基线，确认桥接层是否真的在用。

---

## 测试真实覆盖度评估

**总判断：覆盖是"两层厚、三层空"的哑铃形 —— 单测和 E2E 各自都不弱，但中间层（集成/契约）和两端的外围（性能、WP 侧、CI 执行）全是空的。**

### 哪几层被覆盖了（有真断言）

| 层 | 覆盖情况 | 证据 |
|---|---|---|
| **单元测试（业务逻辑）** | ✅ **较好**。68 用例 / 16 文件，`npm test` 退出码 0（E5） | BASELINE §3.2 |
| **E2E 功能路径（询盘）** | ✅ **强**。拦截请求读 body 断言上下文（`inquiry.spec.ts:75-79`）、断言幂等重放（`:84-95`）、断言跨刷新状态恢复（`:98-145`） | E1 |
| **E2E 无障碍** | ✅ **强**。axe WCAG 2.0/2.1 A+AA 四标签、7 页、零容忍 `toEqual([])`、键盘 Tab 焦点可见（`accessibility.spec.ts:18,26`） | E1 |
| **E2E 无 JS 降级 / 可爬取性** | ✅ **有**。裸 HTML 断言（`site-contract.spec.ts:262-274`）——这是很多项目根本没有的层 | E1 |
| **E2E 安全边界** | ✅ **有**。`site-contract.spec.ts:46-58` 断言 `/api/inquiries`、`/.env`、`/.git/config`、`/wp-admin`、`/wp-json/...` 全部 404/405，且响应体不含密钥名 | E1 |
| **E2E 移动端** | ✅ **有**。`mobile-page-friendliness.spec.ts`（4 用例）+ `site-contract.spec.ts:181-186` 视口 390×844 且 hero ≥ 844px | E1 / BASELINE §3.3 |
| **E2E i18n 路由** | ✅ **有**。`i18n-*.spec.ts` 4 个 spec + `site-contract.spec.ts:120-160` | E1 / BASELINE §3.3 |

### 哪几层是空的（这是要写进 FINAL_REPORT 的）

| 空洞 | 严重度 | 证据 |
|---|---|---|
| **1. CI 执行层：E2E 从未在 CI 跑过** | 🔴 **最高** | BASELINE §10：`verify.yml` 只有 `npm test` + `npm run check` + `audit:prod`。90 个 E2E 用例**一次都没在 CI 跑过**，全靠人工本地跑 → 4 个失败长期挂账就是证明 |
| **2. WordPress / PHP 侧全空**：`local-wp/` 5,711 行 MU 插件，**零测试**（无 PHPUnit、CI 无 PHP 步骤）。8 个 `verify-*.py/php` 脚本**一个都没挂 CI**（BASELINE §9） | 🔴 高 | BASELINE §9、§10 |
| **3. 性能层全空**：零 CWV 测量、零 Lighthouse、零包体预算 | 🔴 高 | M18-4（全仓 grep 0 命中） |
| **4. `src/theme/` 层**：12 个文件（含 4 个生成物）无单测；只有 `theme:check` 的 CSS diff 检查 | 🟡 中 | `package.json:41`；BASELINE §3.2 无 theme 用例 |
| **5. 发布门槛函数零单测**：`isFlowFormedPublishingOpen`（`flow-formed-wheels.ts:220`）与 `isCustomAluminumIndexable`（`custom-aluminum.ts:64`）**在 BASELINE §3.2 的 16 个测试文件里找不到对应文件** | 🟡 中 | BASELINE §3.2 清单比对 |
| **6. sitemap 内容零单测**：`/thank-you` 混入（M18-1）能被 E2E 抓到但**单测抓不到**，因为单测从不生成 sitemap | 🟡 中 | M18-1 |
| **7. 集成层（Next ↔ WP 真实联调）**：`WP_MODE=mock` 为默认（`client.ts:22`），**E2E 大概率跑在 mock 上**，真实 WP 契约的变化 E2E 抓不到 | 🟡 中 | `client.ts:17-24`；`playwright.config.ts` 有 `PLAYWRIGHT_LIVE_WP`（BASELINE §6） |
| **8. 视觉回归**：无截图比对（snapshot / toHaveScreenshot） | 🟢 低 | 全仓无配置 |
| **9. 并发/压测**：询盘 store 有事务/幂等逻辑（`store.ts` 420 行），但只有 E2E 层面的"重放幂等"（`inquiry.spec.ts:84`），无并发用例 | 🟡 中 | 移交 Agent B |

### 结论一句话
**90 个 E2E 是"高质量但从不被执行"的资产；68 个单测是"被执行但覆盖不到关键门槛"的资产。真正的风险不是测试写得差，而是"测试与执行之间断了线"——CI 不跑 E2E，等于 90 个用例只能证明"某天某人本地跑过"。**

### 顺带回答「假测试」判定
抽 2 个 spec 检查：
- **`inquiry.spec.ts`：不是假测试。** `:60-83` 拦截提交请求读 `requestBody`，逐键断言 `context[key]`；`:84-95` 断言幂等重放返回成功；`:98-145` 断言多配置清单跨刷新恢复并逐项核对数量值（`"5"` / `"5000"` / `"2 of 20 configurations selected"`）。**这是功能级断言。**
- **`site-contract.spec.ts`：不是假测试，但断言层次不均。** 强项：`:262-274` 裸 HTML 断言、`:46-58` 安全边界、`:28` sitemap 排除项。弱项：`:186` `expect(heroBox!.height).toBeGreaterThanOrEqual(844)` 这类**纯布局数值**会随设计调整误报，且 `:219-223` 用英文 label 查中文页面（本次失败根因之一）。**问题不是"假"，而是"脆"——断言绑定了实现细节。**

---

## 移交事项

### → 移交 Agent A（架构 / 数据模型）
1. `src/lib/wordpress/` 21 个文件是否各自重复实现 fetch/校验/错误处理（BASELINE §8 已指派）。
2. 46 个路由全 `ƒ` Dynamic（BASELINE §3.1）的成因：是 `export const dynamic = "force-dynamic"` 还是用了 `cookies()` / `headers()` 等动态 API？**这直接决定 M18-8 能否用 ISR 修**。
3. `WP_MODE` 的取值域与默认值语义：`src/lib/wordpress/client.ts:17-24` 显示默认 `mock`，仅当 `WP_API_URL` 存在且 `WP_MODE === "live"` 才走 live。
4. `fenghuai-content-webhooks.php`（135 行）是否是第三条内容写入路径。
5. `src/lib/wheels/publication.ts`（307 行）与 `src/lib/wheels/public-catalogue.ts`（318 行）是否存在发布判定的第三/第四份实现——本报告只确认了「门槛函数 2 套」，未逐行读这两个文件。

### → 移交 Agent B（后端 / 询盘 / WordPress）
1. **`src/lib/inquiry/store.ts`（420 行）无专属测试文件**（BASELINE §3.2 观察）—— 事务/幂等逻辑是否被 `inquiry-contract.test.mts` 的 13 用例覆盖。
2. **并发安全**：`inquiry.spec.ts:84-95` 只测了串行重放幂等，**无并发双提交用例**。
3. **`fenghuai-inquiries.php` 3,029 行**（BASELINE §7）的复杂度与 `WP_INQUIRY_SERVICE_KEY` 在 PHP 侧的校验实现（本报告只审了 Next 侧的 token 使用，`client.ts:207-232`）。
4. **`WP_API_TOKEN` vs `WP_INQUIRY_SERVICE_KEY` 在 WP 侧的权限是否真的分离**：本报告只证明 Next 侧用两个不同 env 变量，**未证明 WP 侧对这两个凭证授予不同 capability**。
5. 规格字段三方映射：`PublicWheelVariant`（`types.ts:92-109`）↔ `specSnapshotOf` 快照键（`inquiry-binding.ts` 内 `size/pcd/et/cb/finish`）↔ ACF 字段名（含 `variants_json`）是否 1:1，是否有 Variant 唯一索引。

### → 移交 Agent C（SEO / 内容）
1. **`/thank-you` 进 sitemap**（M18-1，`src/app/sitemap.ts:38`）—— 本报告只报事实，**sitemap 整体正确性归 Agent C**。
2. `x-robots-tag` → `<meta name="robots">` 的迁移是否**完整**：本报告证明 `src/` 无 `x-robots-tag`（grep 0 行），但**未验证每个非 en locale 页面是否都输出了 `noindex` meta**。这是「未批准译文不索引」的最终防线。
3. `custom-aluminum` 处于 `draft`（`custom-aluminum.ts:74`）→ 永久 noindex + 不进 sitemap，是否符合预期。
4. `localizedEntries` 除首页外无条件展开到所有 `INDEXABLE_LOCALES`（BASELINE §5.3 已记）与本报告的 meta noindex 策略是否自洽（**进了 sitemap 却是 noindex = 自相矛盾**）。
5. 4 个 E2E 失败中 #2/#4 的 `noindex` 断言改为 meta 断言后，能否同时覆盖「未批准译文」的真实约束。

### → 移交 Agent D（DevOps / CI / 部署）
1. **`.github/` 只有 `workflows/verify.yml`**：无 `PULL_REQUEST_TEMPLATE.md`、无 `CODEOWNERS`、无 `ISSUE_TEMPLATE/`（M17-1）。
2. **E2E 加入 CI 的可行性**：需独占端口 3100 + 生产构建（BASELINE §3.3）；`verify.yml` 当前 5 步已含 `npm run build`，理论上可复用产物跑 Playwright。
3. **main 分支是否有保护规则**（GitHub 侧配置不在仓库，需确认）。
4. 177 项未提交改动（BASELINE §2）与「无分支策略」的因果关系。
5. `deploy/` 两套 compose 是否可用（BASELINE §11 已指派）。

### → 给 FINAL_REPORT 的三条必写事项
1. **本报告所有 E1 证据描述「工作区现状」，不等于任何已提交状态**（BASELINE §2：177 项未提交）。
2. **E2E 实际从未在 CI 执行**，90 用例的"存在"不等于"有效防线"。
3. **V3.0 的「受控内容写入 mutation 接口」与代码不符** —— `fenghuai-wheel-authoring.php` 只有 `WP_REST_Server::READABLE`（:315），insights 侧无 REST 路由。若 V3.0 以此为核心卖点，需澄清。

---

## 附：本轮证据来源与未验证声明

| 类别 | 具体 |
|---|---|
| **E1（源码，可支撑「已满足」）** | `e2e/site-contract.spec.ts`、`e2e/inquiry.spec.ts`、`e2e/accessibility.spec.ts`、`src/lib/wheels/types.ts`、`src/lib/wheels/inquiry-binding.ts`、`src/lib/wheels/public-catalogue.ts`、`src/content/flow-formed-wheels.ts`、`src/content/custom-aluminum.ts`、`src/content/types.ts`、`src/app/sitemap.ts`、`src/proxy.ts`、`src/lib/wordpress/client.ts`、`local-wp/.../fenghuai-wheel-authoring.php`、`local-wp/.../fenghuai-insights-authoring.php`、`AGENTS.md`、`AGENT-OPERATING-GUIDE.md`、`package.json`、`src/app/globals.css`、`src/theme/fenghuai-neutral/`、`.github/` 目录列表、`test-results/*/error-context.md` |
| **E3（playwright-report / test-results，仅作线索）** | `test-results/.last-run.json`（status: failed, 4 个 failedTests）、4 个 `error-context.md` 的 `# Error details` 与 accessibility snapshot |
| **E5（BASELINE 实跑）** | 68/68 单测通过、lint/typecheck/build 零错、192 页构建、46 路由全 Dynamic |
| **❌ 未验证（不得当作已验证）** | ①未实跑任何 E2E（禁端口 3100）②未跑 build（已由 Wave 0 跑过）③未连 WordPress 实例 ④未读 `.env.local` ⑤`test-results/` 的时间戳未确认，**"最近一次运行"可能不是当前工作区代码的结果** ⑥中文面包屑 `href` 是否仍指向 `/zh/products`（#3 定性留有余地）⑦`SKILLS/fenghuai-engineering-workflow/SKILL.md` 是否存在 ⑧`publication.ts` / `public-catalogue.ts` 是否含更多发布判定副本 |

> 纪律声明：本报告未修改任何源码，未执行 `npm install`，未跑 E2E，未出现任何密钥值。
