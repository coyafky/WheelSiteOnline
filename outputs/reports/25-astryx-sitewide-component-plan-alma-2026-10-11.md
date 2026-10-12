# 给 Alma：全站 Astryx 组件化执行计划

- 日期：2026-10-11
- 状态：**待执行计划**；不是已完成声明。
- 上一轮实测交接：`outputs/reports/24-astryx-neutral-warm-handoff-alma-2026-10-11.md`。
- 现行规格：`PAGE-SPECS/astryx-neutral-global.md` 与 `PAGE-SPECS/astryx-neutral-page-families.md`。
- 总任务：`work/active/2026-10-11-astryx-neutral-sitewide-migration.md`。

## 一、Alma 要交付的结果

访客在所有公开页面看到一致的 Astryx Neutral 暖白界面；可复用的按钮、表单、对话框、反馈、面包屑、目录等通用交互优先由已核验的 Astryx 原语承载。网站仍是 **Next.js 前端 + Headless WordPress 内容后端**：WordPress 的文案、媒体与审核状态不迁入组件库，Next.js 服务端继续组织页面、SEO 和业务事实。

“全站替换”的可验收含义不是 100% DOM 都来自 Astryx。目标是：

1. 31 个实际渲染模板全部使用同一暖白主题与语义令牌；7 个重定向路由只验 URL/状态，不制造新页面。
2. 每个重复出现的通用 UI 模式都有一项**已采用的 Astryx 原语或可追溯的例外**；不能因为组件名存在就强行替换语义不同的业务控件。
3. 页面内容和产品事实仍经 `src/content` / WordPress 服务端适配器进入 React；组件不读取 WordPress 原始 REST JSON，也不把业务文本复制进组件源码。
4. 多值 GET 筛选、普通链接分页、真实同一 variant 的规格、直接/清单询盘隔离及“数据库落库才成功”等行为不退化。

本地已确认 `@astryxdesign/core@0.6.7` 的 `package.json` 确有 `Button`、`Card`、`ClickableCard`、`Dialog`、`Field`、`Layout`、`Grid`、`Stack`、`Heading`、`Text`、`Banner`、`EmptyState`、`Outline`、`NumberInput`、`Toast`、`Breadcrumbs`、`Table` 等导出。这里只确认**导出存在**；具体 props、SSR、键盘、链接和无 JavaScript 等价性须在每一切片先做探针。不要盲升依赖版本。

## 二、准入与保留矩阵

| 模式 | 优先方案 | 必须保留或验证的语义 | 当前判断 |
|---|---|---|---|
| 全局主题、排版、表面与间距 | 根 `Theme`、Neutral 静态 CSS；按需 `Section`/`Layout`/`Grid`/`Stack`/`Heading`/`Text` | 首屏服务端可见、暖白品牌令牌从 `globals.css` 一处取值 | 根主题已接入；布局原语按页验证，不做全站一次性 JSX 改写 |
| 普通按钮、反馈与状态 | `Button`、`IconButton`、`Banner`、`Badge`、`Toast`、`EmptyState`、`Spinner` | Next Link 导航、禁用/加载/错误、焦点、翻译 | 已有局部采用；清理重复样式前做交互等价测试 |
| 询盘字段与弹窗 | `Field`、`TextInput`、`TextArea`、`NumberInput`、`Selector`、`RadioList`、`Dialog` | Zod、隐私版本、错误归位、表单提交与落库、关闭后焦点恢复 | 已有较多采用；主要是状态与组合一致性审计 |
| 轮毂目录筛选与排序 | Astryx `Field`/`Banner` 作外壳，原生 `form method=get`、`fieldset`、多值选项 | URL 可复制、无 JS 提交、同一 variant 交集、移动 Filter 入口 | **不得**用客户端 `Pagination`/`CheckboxInput` 直接替换已验证的原生契约 |
| 产品卡与规格 | 先探针 `Card`、`ClickableCard`、`MetadataList`、`Table` | 图片和图权门槛、生产代码、同一变体字段、链接可爬取 | 可改外壳，不可用通用卡推断/拼接规格；不合适则保留项目组件 |
| 导航、文章与 FAQ | `Breadcrumbs`、`Outline`；`TopNav`/`MobileNav`/`TabList`/`Collapsible` 只作适配探针 | Next 路由、分类 URL、服务端正文、无 JS 目录/全文、键盘 | 已知 Insights 分类不是 Tabs；FAQ 公开全文不用默认折叠；导航不得为换库丢路由行为 |
| 品牌 Hero、真实媒体与能力关系 | Astryx 令牌和必要布局原语包裹项目组件 | 视觉叙事、图片归属、`hasRender`、无图不上架、法人与主张边界 | **保留领域组件**；不把事实内容塞进通用 `Card` 模板以求覆盖率 |

每项候选都按四态登记：`已采用`、`已探针待验收`、`有理由保留原生/项目组件`、`不适用`。拒绝使用的组件要记录可复现原因，而不是笼统写“组件不好”。

## 三、执行顺序与阻塞关系

采用 **expand → migrate → contract**，任一阶段都保持 `npm run check` 可通过。不能先删旧控件再大面积改页面。

| 阶段 | 任务文件 | 可演示成果 | 阻塞于 |
|---|---|---|---|
| P0 兼容性基线 | `work/queued/2026-10-11-astryx-component-compatibility-matrix.md` | 31 模板 × 通用模式矩阵、实际 API/SSR/无 JS/键盘探针、现状截图 | 无 |
| P1 外壳与暖白首屏 | `work/queued/2026-10-11-astryx-warm-hero-and-component-followup.md` | Header/Footer/导航与每个旧深色首屏逐页判定；同类外壳统一 | P0 |
| P2 询盘转化链 | `work/queued/2026-10-11-astryx-inquiry-component-slice.md` | 直接询盘、清单、统一表单、四状态视觉与失败保留 | P0；可与 P1 在不同文件并行 |
| P3 产品选择链 | `work/queued/2026-10-11-astryx-product-component-slice.md` | 轮毂目录/详情/旋压/锻造和三条能力页的通用控件统一 | P0；如触及共享外壳则等 P1 |
| P4 内容、工具与政策链 | `work/queued/2026-10-11-astryx-content-component-slice.md` | About/Capabilities/Insights/Fitment/Tools/法律/感谢页的内容容器和交互统一 | P0；可分模板族推进 |
| P5 全站验收与收缩 | `work/queued/2026-10-11-astryx-sitewide-regression-closure.md` | 全部模板与语言回归、删重复外壳、设计正本回写、总任务闭环 | P1–P4 |

Alma 每次只移动一个任务 `queued → active → completed`，并在该任务里写实际组件、未采用理由和截图/测试结果。旧 `Theme` 嵌套包装只能在等价性证明后收缩；根 Theme 已存在不代表每个局部包装都可立即删除。

## 四、页面族责任清单

| 页面族 | 路由/模板 | 组件化重点 | 不可破坏的内容与业务契约 |
|---|---|---|---|
| 共享外壳 | 所有公开页 | 导航、语言、面包屑、CTA、Footer、反馈与响应式面板 | Next Link、语言前缀/查询参数、SEO 与无 JS 路径 |
| 公司与产品入口 | `/`、`/about`、`/capabilities`、`/products` | Heading/Text/Section/Grid、提示、行动、能力卡 | 四线平行；工厂/证书/主体证据；品牌 Hero 媒体兜底 |
| 轮毂 | `/products/wheels`、`/[model]`、`/flow-formed`、`/forged` | Field/Banner/EmptyState、卡片/规格外壳、Dialog、NumberInput | 真实型号和 variant、无图/未批准 404、GET/链接、直接与清单隔离 |
| 其他能力线 | `/products/ev-components`、`/products/custom-aluminum`、`/products/safety-tires` | 容器、卡片、行动与状态提示 | 不虚构 SKU、载荷、认证、适配或测试承诺 |
| 转化 | `/request-a-quote`、`/contact`、`/thank-you`、`/custom-development` | 表单字段、步骤、成功/失败提示、Dialog | WordPress/MySQL 保存成功才成功；Outbox/SMTP 独立；隐私版本批准 |
| 内容与参考 | `/insights/*`、`/fitment/*`、`/gallery/finishes`、`/dealers/*`、`/tools/*`、`/support/*` | 目录、文章分节、字段、警示、计算器输入 | 已批准正文/翻译、锚点、公式、法律草稿标识及 noindex |
| 历史别名 | `/gallery`、`/gallery/wheels`、`/manufacturing`、`/resources/*` | **无组件迁移**；只验 308 和目标路由 | 不复活旧虚构内容，不破坏 canonical 与已有链接 |

对动态 `[model]`、`[slug]`、`[platform]`、`[pattern]`，选至少一个已批准实例、一个未批准/不存在反例。对所有页面使用同一矩阵记录“服务端首屏、客户端水合、无 JS、移动、翻译和 SEO”。

## 五、每个切片的工作步骤

1. **基线**：阅读该页 Page SPEC、业务数据接缝和当前截图；确认业务成功条件，记录 HTML/无 JS 行为。对脏工作树先 `git status`，不覆盖其他 agent 的修改。
2. **探针**：只针对候选 Astryx 0.6.7 组件写最小测试页或隔离测试，实测导出、props、SSR/hydration、焦点、键盘、Next Link、四语言和 CSS。失败即登记例外，不用 `unsafe-eval` 或全局样式补丁掩盖。
3. **扩展**：建立共享薄适配器或并存外壳，保持原页面可运行；主题颜色只用项目语义令牌。避免让所有 Server Component 因一个控件变成 Client Component。
4. **迁移**：一次只改一个可验收页面族。客户可见路径先做失败/成功信号，再替换外壳。保留原有 `src/content` 类型和 WordPress 适配，除非明确另立架构任务。
5. **收缩**：只有新旧交互、SEO、发布门槛、无 JS 行为和视觉状态对等后，才移除重复包装与旧样式。不得删除仍有历史价值的资料。
6. **记录**：任务文件填上代码路径、实跑命令、截图、拒绝组件原因和未覆盖边界，更新 `STATUS.md`。涉及新模块边界先改 `ARCHITECTURE.md`，涉及契约变更记决定。

## 六、验证矩阵与停止条件

- 每个切片先跑最窄单测/Playwright，再跑 `npm run theme:check`、`npm test`、`npm run lint`、`npm run typecheck`、`npm run build` 与 `git diff --check`。本轮基线的 42 单测和 191 静态页生成数只作为比较，未来数量变动需解释，不能当成永恒目标。
- 视口：320×568、390×844、768×1024、1440×900；全部渲染模板查水平溢出、遮挡、断图和控制台。交互页另查键盘顺序、Escape、焦点恢复、reduced motion、axe 基础扫描。
- 语言：`/`、`/zh`、`/es`、`/th` 的 chrome、URL、已批准正文与 `noindex/hreflang`。未批准翻译不可因改 UI 被公开。
- 询盘：只在 `WP_MODE=mock` 或隔离本地 WordPress 夹具执行自动提交；Validation、Submitting、Success、Server Error 四态截图。失败保留输入和清单，成功须有 `persisted:true`，不以 QQ SMTP 是否进入收件箱决定提交成功。
- 轮毂：筛选 URL、排序/分页、同变体交集、无 JS 提交、数量为安全正整数且无业务上限；草稿/无图/撤回不进入目录、详情、相关项或 sitemap。
- SEO/内容：标题、canonical、robots、sitemap、媒体 alt/归属、WordPress 草稿/撤回/缓存失效抽样核验。
- **停线**：任一切片造成 API 询盘“未落库却显示成功”、无图产品公开、事实字段跨变体拼接、无 JS 主要路径失效、页面正文因动画/主题丢失、四语言未经批准内容进入索引，立即回退该切片并记录原因。

## 七、交付与权限

完成时给用户一份按 31 个渲染模板列出的组件覆盖矩阵：`已采用 / 经验证保留项目组件 / 尚未完成`；每个例外有证据。回写 `DESIGN.md` 的实测暖白系统，更新 `PAGE-SPECS`、`STATUS.md`、`DECISIONS.md` 和任务状态。不存在“全页 100% Astryx 标签”这一发布指标。

本计划不授权真实发信、生产 WordPress 写入、上线、DNS、付费、commit 或 push。需要外部授权时停下向用户确认；不要把给 Alma 的文档当成已经发送给 Alma 的消息。
