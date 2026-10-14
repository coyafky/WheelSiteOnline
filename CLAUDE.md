# CLAUDE.md — 丰怀四产品线独立站 AI 开发入口

本文件是 Claude Code、Codex 及其他 AI 开发代理进入本仓库后的第一份项目上下文。它负责说明项目地图、工作顺序、AI 开发流程和完成门禁；业务事实、架构细节和当前进度以引用的现行正本为准。

项目记录、任务记录、审计报告和架构说明一律使用中文。代码、命令、变量名、协议字段和第三方专名保留英文。

## 1. 先读什么

开始任何有意义的工作前，按任务需要渐进加载，不要一开始扫完整仓库：

1. `AGENTS.md`：项目操作契约和不可破坏的边界。
2. `PROJECT.md`：项目目标、业务范围、首发范围和完成定义。
3. `STATUS.md`：当前真实进度、阻断项和下一步。这里的事实优先于历史记录。
4. `ARCHITECTURE.md`：模块边界、数据流、依赖方向和运行时架构。
5. `ARCHITECTURE/README.md`：架构文档导航。
6. 与任务相关的 `PAGE-SPECS/`、`outputs/site-launch-plan/`、`docs/adr/` 和 `DECISIONS.md` 条目。
7. `work/active/`；没有活动任务时，从 `work/queued/` 选择一个明确任务。
8. 修改 Next.js 代码前，读取当前安装版本的相关文档：`node_modules/next/dist/docs/`。

如果文档之间冲突：更近目录的 `AGENTS.md` 和用户当前指令优先；当前事实看 `STATUS.md`；系统结构看 `ARCHITECTURE.md`；为什么这样决定看 `DECISIONS.md` / `docs/adr/`。不要静默猜测，记录差异或询问用户。

## 2. 项目是什么

这是深圳峰徊科技有限公司面向海外客户的英文优先 B2B/B2C 询盘站：

- 前端：Next.js 16 App Router、React 19、TypeScript strict、Tailwind CSS v4。
- 内容后台：Headless WordPress，通过 REST 和稳定的项目自有视图契约提供内容与媒体。
- 产品线：轮毂（旋压、锻造）、新能源三电铝制品、定制铝制品、自密封轮胎。
- 业务形态：展示真实能力和经过审核的产品，接收项目询盘；不做在线支付、订单管理、客户登录、自研 CRM 或 AI 客服。
- 主要用户：海外 B 端采购商、经销商、工程客户以及 C 端个人客户。
- 当前上线判断：以 `STATUS.md` 为准；在正式主体、域名、法律文本、首发产品签字、生产运行时、邮件事件、监控和恢复演练完成前，不得把项目标记为商用生产。

站点前端最初参考并克隆了竞品 2nforged.com 的结构。可以借鉴版式和交互模型，但公开产物不得残留竞品文案、图片、视频、品牌名、路径或专有页面标题；竞品结构也不能直接当作丰怀的信息架构。

## 3. 核心事实边界

### 产品发布

- 无图不上架：无图型号不建详情页、不进目录、不进筛选、不进相关产品、不进 sitemap；数据保留，图片和审批到位后再放开。
- 无完整产品事实的产品线先做能力页，不渲染空产品卡、占位详情页或虚构型号。
- `hasImage` 只代表技术上匹配图片，不代表图权、供货、规格或业务发布批准。
- 公开轮毂必须经过图片、发布状态、图权、供货、规格和至少一个 approved variant 的共同门槛；资格判定集中在 `src/lib/wheels/publication.ts`。
- 规格只能来自同一条实际 `WheelVariant`，不能跨变体拼接，也不能用系列通用值替代实际规格。
- 车型适配属于安全关键内容。没有工程确认时，不得发布偏距、孔距、中心孔、载荷等未经验证的数据。

### 内容与证据

- 页面组件只消费稳定的类型化视图模型，不直接读取 WordPress 原始响应、供应商 JSON、数据库或邮件服务响应。
- 文案和页面数据优先放在 `src/content/*.ts`，契约在 `src/content/types.ts`；WordPress 适配器必须返回相同的视图模型。
- `assets/` 是只读原始资产；`resources/` 保存来源、提取和核验过程；`outputs/` 保存可审核交付物；`public/` 只放批准或构建所需的公开资源。
- `PLACEHOLDER` 表示尚未溯源的内容，不能为了通过构建而删除或改成看似合理的数字。
- 图片存在不等于图权、主体、性能、认证、产能或产品关联已批准；每项公开主张都要有实际主体和证据边界。
- 深圳峰徊、蓝辉及其他供应商是不同资料主体。共同股东或合作关系不能自动转移工厂、专利、证书、图片、测试结果或售后承诺。

### 询盘与隐私

- 客户端携带的型号、变体和规格只用于体验；服务端必须重新解析公开集合并保存不可变快照。
- 数据库事务成功才算询盘成功；邮件 accepted、delivered、bounced 和销售已阅读是不同状态。
- 询盘遵循“先落库再发信、存快照不存引用、上下文随询盘走”。
- 匿名用户只能创建询盘，不能读取客户资料或询盘列表；日志不得输出邮箱、电话、完整消息、图纸名或请求体。
- 保持现有 Origin/CSRF、蜜罐、时间陷阱、限流、幂等、请求体上限、隐私版本和服务端校验。
- 首期不开放工程文件上传，不把客户文件放入 WordPress 公共媒体库。

### 部署与运行时

- 保留 OpenNext 方向；不得把 `next.config.ts` 改成 `output: "export"`，否则 `/api/inquiries` 会失效。
- 当前是否已配置 OpenNext、生产平台、远程服务和生产监控，以 `STATUS.md` 和 `ARCHITECTURE.md` 为准；不要把 `standalone`、本地 Docker 或 9080 联调入口写成正式生产。
- `NEXT_PUBLIC_APP_URL` 会在构建时固化到 canonical、OG 和 sitemap。跨机器构建或部署必须核对烤入值，页面返回 200 不足以证明部署正确。
- macOS 专有的 `sips`、`cwebp` 等步骤留在本地；服务器只运行可复现的校验和构建步骤。
- 任何内容、代码、数据、媒体或后台配置都遵循“本地验证 → 本地生产实例冒烟 → 本地/预发布运行时验收 → 才能考虑远程”的顺序。

## 4. 代码地图

| 路径 | 用途 |
|---|---|
| `src/app/` | App Router 页面、metadata、robots、sitemap、API 路由 |
| `src/components/` | 展示和交互组件；只消费稳定接口 |
| `src/content/` | 类型化内容和页面内容契约 |
| `src/lib/wheels/` | 轮毂事实、公开资格、查询、相关型号和询盘绑定 |
| `src/lib/wordpress/` | WordPress REST 客户端、媒体和内容适配器 |
| `src/lib/inquiry/` | 询盘 schema、验证、反滥用、存储、邮件和回执 |
| `src/lib/i18n/` | 英文根路由、中文 `/zh/*` 路由及字典契约 |
| `deploy/wordpress/` | WordPress Compose、nginx、备份和回滚说明 |
| `deploy/frontend/` | 9080 联调前端容器、nginx 和部署说明，不等于正式生产 |
| `tests/` | Node contract tests；浏览器测试位于 Playwright 配置指定位置 |
| `PAGE-SPECS/` | 页面逐视口施工规格，回答“这一页搭什么” |
| `work/queued/` | 已确认但未开始的任务 |
| `work/active/` | 当前正在执行的任务，保持数量少 |
| `work/completed/` | 已完成任务及结果记录 |
| `resources/` | 原始资料、研究、截图和核验证据 |
| `outputs/` | 审计报告、方案、计划和其他可交付成果 |
| `archive/` | 被现行正本取代的历史内容，不随意删除 |

公开路由主要分为公司入口、产品中心、轮毂目录/详情/工艺、三条能力线、项目流程、Insights/Resources 和政策页面。仓库中仍可能存在克隆阶段遗留的 gallery、fitment、dealers、tools 等路由；上线前必须逐条决定保留、重定向、`noindex` 或关闭，不能因为文件存在就当作已批准公开页面。

## 5. Spec-Driven Develop 入口

唯一流程正本是 [`SKILLS/spec-driven-development/SKILL.md`](SKILLS/spec-driven-development/SKILL.md)，发现入口为 `.agents/skills/spec-driven-development/`。`SKILLS/fenghuai-engineering-workflow/` 只负责本项目硬约束、TDD、诊断和工程适配，不再另定义任务生命周期。

### 5.1 先判断工作模式

1. 目标、事实、授权或验收仍会改变结果：进入 **Deep Discuss**，先讨论澄清，用户明确开始前不实施。
2. 用户要求审查：进入 **Review SPD**，按 findings-first 区分工作树、commit、分支和 PR diff。
3. 跨文件、跨 session、接口/架构/公开内容/安全边界变化：进入 **Spec-Driven Develop Phase 0–6**。
4. 单文件、低风险、已有规格覆盖的简单修复：保留最小规格和验证。
5. 发布、部署、DNS、公开索引、真实发信或付费：按发布门禁逐项确认。

### 5.2 Phase 0–6 门槛

- **Phase 0–2**：形成意图、事实、假设、风险、范围、非范围、接口、验收和待确认项。
- **Phase 3**：生成规格、任务树、依赖、S.U.P.E.R 检查、Delivery Batch、worktree 边界和 GitHub Full 映射。
- **Phase 4**：执行前写入 `docs/progress/MASTER.md`，记录阶段、Milestone、Issue、阻塞和 drift score。
- **Phase 5**：只有用户明确确认后执行；按批次和互不相交的 worktree 泳道推进，最多 4 条并行泳道。
- **Phase 6**：归档分析、规格、遥测、Review SPD、验证证据、未验证边界和回滚方式。

漂移达到 2 重新分解，达到 3 回 Phase 2 重新确认，达到 4–5 停止并进入 Deep Discuss。未验证内容不得标记完成。

### 5.3 GITHUB_FULL 与本地任务

当前项目默认 `GITHUB_FULL`：Issue 是任务级事实，Milestone 是阶段聚合，Project 是跨阶段看板，Delivery Batch/批次 PR 是集成边界，`work/` 是中文规格和执行证据。现行本地任务与 Issue 必须双向链接；历史 `work/completed/` 与 `archive/` 不补造 Issue/PR，不重写历史结论。已授权的流程迁移外部资源创建仅限本次范围，创建前必须只读核对目标和重复项；权限不足时记录 WARN，不伪造编号。

### 5.4 任务生命周期

1. Phase 3 在 `work/queued/` 建立任务正本，写来源、Issue、Milestone、依赖、Batch、S.U.P.E.R、验收和验证命令。
2. Phase 5 开始时才移动到 `work/active/`，不得复制第二份状态。
3. 先做可演示/验证的纵向切片，频繁运行最窄检查。
4. 完成后移动到 `work/completed/`，记录实际证据和未决项。
5. 收尾同步 `MASTER.md`、`STATUS.md`、`DECISIONS.md`、`outputs/`、`resources/` 和 `inbox/`。

### 5.1 对齐问题

先用一句话写清楚用户要解决的结果，再区分：

- 已确认事实；
- 当前假设；
- 会改变结果的待确认项；
- 明确不在范围内的工作。

如果歧义会改变数据模型、页面结构、公开主张、部署方式或安全边界，停止猜测并询问。若只是实现细节且已有代码先例，遵循现有先例并记录理由。

### 5.2 选择最小工作模式

- 需求仍会变化：先写规格，参考 `SKILLS/fenghuai-engineering-workflow/references/spec-and-tickets.md`。
- 需求明确但跨多文件：先拆成可独立验证的纵向任务。
- 新功能或行为修复：采用 TDD，先写能失败的目标测试，再写最小实现。
- 故障或回归：先复现原始症状，再列 3–5 个可证伪假设，定位后修复并增加回归保护。
- UI 变更：读取相关 Page SPEC 和现有组件，使用 Playwright 验证视口、键盘、无障碍、控制台、断图和横向溢出。
- API、询盘或外部接口：先明确输入、输出、错误、权限、幂等和数据来源，再实现。
- 架构、类型契约、部署平台、公开资格或产品线变化：先更新 `ARCHITECTURE.md` 和对应决定记录，再改代码。

### 5.3 任务生命周期

1. 在 `work/queued/` 创建中文任务文件，写目标、范围、依赖、验收和验证命令。
2. 开始时将任务移动到 `work/active/`，保持任务正本只有一份。
3. 先做一个能演示或验证的纵向切片，不预先实现未要求的扩展。
4. 频繁运行最窄的相关检查；任务完成后运行完整门禁。
5. 把任务移动到 `work/completed/`，记录实际结果、证据、未决项和后续任务。
6. 收尾检查 `STATUS.md`、`DECISIONS.md`、`work/queued/`、`outputs/`、`resources/` 和 `inbox/` 是否需要更新。

未经用户明确授权，不自动 commit、push、创建批次 PR、deploy、改 DNS、付费或向真实客户地址发信。流程迁移范围内已授权的 GitHub Issue/Milestone/Project 创建，仍须按 `GITHUB_FULL` 逐项核对；不建立第二套任务状态。

### 5.4 实现纪律

- 修改前先读目标文件、相关类型、相关测试和一个现有同类实现。
- 优先复用现有组件、schema、查询模块和设计 token；不要为一次性逻辑新增抽象。
- TypeScript strict，禁止 `any`；命名和导出遵循现有代码风格。
- 组件使用 `globals.css` 中的设计 token 和 Tailwind 别名，不在组件内新增裸 hex。
- 滚动显现和视差使用 `data-reveal`、`data-reveal-group`、`data-parallax-media` 与 `site-motion.tsx`，不要在页面内手写 IntersectionObserver。
- 图片使用 `hasRender` / 兜底模式；不要请求不存在的资源，也不要删除兜底逻辑。
- 不为了“看起来完整”补虚构型号、规格、数量、认证、案例、适配、产能、交付或售后承诺。
- 不顺手清理无关代码，不删除历史材料；需要移除的内容优先归档并先确认。

## 6. 验证门禁

代码改动至少运行：

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev

git diff --check
```

根据改动追加验证：

- UI：`npm run test:e2e`，并检查关键桌面/移动视口、0 控制台错误、0 断图、0 横向溢出、键盘焦点和 axe 结果。
- 询盘/CMS：运行对应 Docker/WordPress 探针、事务回滚、幂等重放、权限、缓存失效、邮件 accepted/失败路径和敏感信息日志检查。
- SEO/内容：检查公开集合、详情 404、robots、canonical、OG、sitemap、语言 URL、`noindex` 和发布门槛一致。
- 部署：检查实际运行时、健康检查、环境变量、`NEXT_PUBLIC_APP_URL` 烤入值、回滚和备份恢复证据。
- 依赖或安全：运行生产依赖审计；不要未经授权执行破坏性的 force fix 或升级。

只报告实际运行过的验证。无法运行的检查写明具体原因，并标为未验证或 WARN，不得把“脚本存在”写成“已通过”。

## 7. 文档更新规则

- `PROJECT.md`：稳定的项目目标、范围、主体和完成定义。
- `STATUS.md`：当前事实、已完成、阻断和下一步；不要把规划写成完成。
- `ARCHITECTURE.md`：系统形状、模块边界、数据流和依赖方向。
- `DECISIONS.md`：工程和流程决定；架构级决定进入 `docs/adr/`。
- `PAGE-SPECS/`：页面展示什么、视口如何组织、组件和验收标准。
- `work/`：任务生命周期和验收记录。
- `resources/`：原始资料与核验过程。
- `outputs/`：供人审核的计划、报告、设计和交付成果。

以下变化必须先更新架构/决定文档：新增或删除产品线、页面族、数据源、运行时；修改 `src/content/types.ts`、公开资格或询盘契约；改变 WordPress、数据库、邮件或部署职责；改变 URL 语言策略；引入上传、账户、支付、CRM 或管理后台。

## 8. 快速检查清单

开始工作前：

- [ ] 已读 `AGENTS.md`、`PROJECT.md`、`STATUS.md` 和相关架构/规格。
- [ ] 已确认任务不依赖未解决的事实、授权或业务决定。
- [ ] 已找到一个现有实现和相关测试作为模式。
- [ ] 已明确本次改动不触碰的范围。

结束工作前：

- [ ] 代码、内容和证据边界没有越界。
- [ ] 没有新增竞品残留、虚构数据或未溯源 `PLACEHOLDER` 主张。
- [ ] 相关测试和项目门禁已运行并如实记录。
- [ ] `STATUS.md`、决定记录和任务生命周期与实际一致。
- [ ] 没有自动 commit、push、deploy 或其他对外动作。
