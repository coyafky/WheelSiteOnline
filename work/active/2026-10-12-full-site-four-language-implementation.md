# 全站多语言化与新增语言扩展实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 `superpowers:executing-plans` 逐任务执行此计划；每项使用复选框跟踪。项目规则禁止未经用户授权创建子代理、提交或推送，执行时遵守仓库 `AGENTS.md`。

**目标：** 让全站路由、页面内容、共享组件、交互状态、表单错误、媒体说明和 SEO 都按当前语言完整呈现，并让新增语言通过注册、词条、内容和验收扩展，而无需在各页面增加语言分支。

**架构：** Next.js 展示层只消费类型化的本地 UI 文案和 WordPress 本地化正文；产品规格、型号、PCD、尺寸等事实保持稳定值，再通过本地化标签呈现。语言注册、路径、格式化、可索引状态集中管理；翻译缺失或未批准时不静默显示英文正文，也不进入 sitemap 或可索引页面。

**技术栈：** Next.js App Router、TypeScript、Headless WordPress REST 接缝、现有 `src/lib/i18n`、Node 内建测试、Playwright、ESLint、TypeScript、`scripts/i18n`。

---

## 目标语言与验收边界

当前语言为 `en`、`zh`、`es`、`th`，英文继续使用根路径，其余语言使用 `/zh`、`/es`、`/th`。首个实施周期补齐这四种语言；新增语言必须能按同一接缝增量加入。

“页面已多语言化”须同时满足以下层面：

1. **框架 UI**：导航、页脚、语言选择、面包屑、按钮、表格/筛选/分页、空/加载/错误状态、弹窗、工具控件、表单标签、验证与成功反馈、无障碍名称、日期/数字格式。
2. **页面正文**：标题、正文、卡片、FAQ、步骤、说明、免责声明、CTA、站内链接标签及 WordPress 页面/文章/指南内容。
3. **媒体**：图片替代文本、图注、视频标题/字幕、下载资源名称；产品型号和可核验规格仍使用原始事实值。
4. **SEO**：本地化 title/description、canonical、Open Graph、结构化数据、语言标注、hreflang、sitemap 与索引资格。
5. **运行时反馈**：API 字段错误由稳定错误码映射成当前语言；网络错误、限流、服务未开放等界面有本地化文本。

所有非英文译文在业务、工程或法律责任人审核前保持草稿。语言前缀存在不代表页面翻译完成；未通过语言的页面保持 `noindex`，不加入 sitemap。页面缺少已批准译文时不得静默回退为英语正文，应显示该语言的本地化不可用状态并提供本地语言返回入口，或按路由合同返回该语言的不可索引状态页。

## 现有结构与本计划的实施顺序

当前有四语言注册、路径辅助函数、UI 字典、WordPress Page/Insights 本地化接缝、翻译审计脚本和若干页面专用 copy 模块。`translateStrict()` 缺键返回 key；这让漏项可见，但全站仍有页面常量、组件文案和内容字段未经过 locale resolver。`resolveLocalized()` 当前仍可在缺少 WordPress 译文时返回英文默认内容并记录日志；迁移时须改为显式的缺译结果，避免把日志当作用户界面保障。

执行顺序先落地语言扩展底座和旋压轮毂页面，再逐个按共享组件、产品、转化、工具、内容、公司与支持页面推进。每个页面切片按“可见文字 → 交互与错误 → 媒体 → SEO → 浏览器验收 → 发布状态”完整闭环，不以 URL 能打开作为完成信号。

## 文件与职责清单

### 多语言底座

- 修改：`src/lib/i18n/types.ts` — 当前语言列表、路径、显示名称、可用/可索引状态；新增语言的唯一注册入口。
- 修改：`src/lib/i18n/dictionaries/index.ts`、`src/lib/i18n/dictionaries/en.ts`、`src/lib/i18n/dictionaries/zh.ts`、`src/lib/i18n/dictionaries/es.ts`、`src/lib/i18n/dictionaries/th.ts` — UI 词条和语言键完整性。
- 修改：`src/lib/i18n/index.ts`、`src/lib/i18n/use-t.ts`、`src/app/providers.tsx` — 统一 translator 注入和缺词策略。
- 修改：`src/lib/i18n/localized-page.ts`、`src/lib/wordpress/pages-contract.ts`、`src/lib/wordpress/pages.ts` — 明确区分已批准译文、缺失译文、未批准译文和读取失败。
- 创建：`tests/i18n-coverage.test.mts` — 字典键一致、locale 注册与可索引白名单、缺译 fail-closed、格式化约束。
- 修改：`tests/i18n-routing.test.mts` — locale 前缀、路径往返和未知语言输入。

### 本轮首切片：旋压轮毂页面

- 修改：`src/content/flow-formed-wheels.ts`、`src/content/types.ts` — 英文源内容和 `FlowFormedWheelsPage` 内容契约；保留媒体与发布门槛。
- 创建：`src/lib/i18n/flow-formed-copy.ts` — 四语言 WFF01–WFF05 文案；按现有页面结构给出强类型 copy，不复制产品/工艺事实字段。
- 修改：`src/lib/wordpress/flow-formed.ts`、`src/app/products/wheels/flow-formed/page.tsx` — 按请求 locale 取批准正文、显式处理缺译状态，并传入 locale-specific metadata。
- 修改：`src/components/wheels/flow-formed-page.tsx`、`src/components/site-breadcrumbs.tsx`、相关目录空状态组件 — 页面正文、面包屑名称、图像替代文本与目录空态使用 copy 接缝。
- 创建：`tests/flow-formed-i18n.test.mts`、`e2e/i18n-flow-formed.spec.ts` — 文案键覆盖、页面 locale、CTA/面包屑、缺译状态和 SEO 验收。
- 检查：`src/app/sitemap.ts`、`scripts/i18n/dump-wheel-process-content.mts`、WordPress `seed-wheel-process-content.php` — sitemap 发布门槛与 WP 内容导出/导入字段仍一致。

### 共享组件与站点框架

- 修改：`src/components/site-header.tsx`、`src/components/site-footer.tsx`、`src/components/site-breadcrumbs.tsx`、`src/components/faq-accordion.tsx`、`src/components/route-block.tsx` — 导航、页脚、语言选择器、无障碍标签、通用步骤和 FAQ。
- 扫描并迁移：`src/components/sections/`、`src/components/ui/`、`src/components/wheels/`、`src/components/forged-wheel/` — 只迁移有用户可见文本的组件；图标、排版和布局不进入字典。
- 修改：`src/app/layout.tsx`、`src/app/providers.tsx` — `<html lang>`、语言 cookie/导航和请求 locale 传递；遵循现有 locale 路由实现，不预设新增 middleware 文件。
- 修改：`src/app/not-found.tsx`、`src/app/error.tsx` — 已完成四语基础文本；纳入统一缺词审计并维持回归测试。
- 创建：`tests/shared-i18n-components.test.mts`、扩展 `e2e/accessibility.spec.ts` — 确保可访问名称和站点框架随页面语言变化。

### 页面路由清单与内容正本

以下路径来自当前 `src/app` 页面路由。实施时按模板/内容域共用工作包，逐条验收，不为每个 URL 复制一套翻译逻辑。

| 页面域 | 当前路由 | 主要内容/组件正本 |
|---|---|---|
| 首页与公司 | `/`、`/about`、`/capabilities`、`/manufacturing` | 对应 `src/app/**/page.tsx`、`src/content/` 页面模块及 `src/components/sections/` |
| 产品入口与产品线 | `/products`、`/products/custom-aluminum`、`/products/ev-components`、`/products/safety-tires` | `src/content/products.ts`、产品线内容模块、对应 `src/components/` 页面模块 |
| 轮毂目录与详情 | `/products/wheels`、`/products/wheels/[model]`、`/products/wheels/forged`、`/products/wheels/flow-formed` | `src/content/wheel-catalogue.ts`、`src/content/wheel-detail.ts`、`src/content/flow-formed-wheels.ts`、`src/lib/i18n/wheel-*-copy.ts`、轮毂组件 |
| 转化与经销 | `/contact`、`/request-a-quote`、`/thank-you`、`/dealers`、`/dealers/private-label`、`/custom-development` | `src/content/inquiry-form.ts`、`src/lib/i18n/conversion-ui-copy.ts`、`src/lib/i18n/inquiry-*-copy.ts`、对应页面与询盘组件 |
| Fitment 与工具 | `/fitment`、`/fitment/[platform]`、`/tools`、`/tools/offset-calculator` | `src/content/` Fitment/工具数据、`src/components/offset-calculator.tsx`、对应页面 |
| 内容与知识库 | `/insights`、`/insights/[slug]`、`/insights/bolt-patterns`、`/insights/bolt-patterns/[pattern]`、`/resources`、`/resources/[slug]`、`/resources/bolt-patterns`、`/resources/bolt-patterns/[pattern]` | `src/lib/wordpress/insights.ts`、资源内容模块、文章模板、`tests/wordpress-insights.test.mts` |
| 展示与画廊 | `/gallery`、`/gallery/finishes`、`/gallery/wheels` | 画廊内容模块、媒体对象与对应组件 |
| 法律与支持 | `/support/privacy`、`/support/returns`、`/support/shipping`、`/support/terms`、`/support/warranty` | WordPress 法律/支持 Page contract 与对应 `src/app/` 页面；法律译文需法律审核 |

- 创建：`tests/page-locales-contract.test.mts` — 路由模板、内容来源、测试 fixture 与 locale 验收清单有完整映射。
- 修改：每组实际路由文件及其内容/组件正本；未在某语言准备好前保持不可索引。

### API、SEO、媒体与发布验收

- 修改：`src/app/api/inquiries/route.ts` 与相关 schema/错误码模块 — API 返回稳定错误码和字段标识，不向客户端依赖英文错误句子。
- 修改：`src/app/sitemap.ts`、`src/app/robots.ts`、页面 metadata 与结构化数据工具 — 仅列入逐页面批准的语言版本；canonical/hreflang 指向真实对应页。
- 修改：`scripts/i18n/audit-page-locales.mjs` — 报告页面键 × locale × 正文/SEO/状态，并以未通过退出码阻断发布。
- 创建：`scripts/i18n/audit-ui-locales.mjs` — 检查静态词条键一致、源代码直写英文可见文案例外清单和不允许的静默 fallback。
- 修改：`package.json` — 增加 `i18n:audit` 聚合命令，调用上述两项审计；`npm run check` 保持当前基础门禁。
- 修改：`e2e/site-contract.spec.ts`、`e2e/conversion-locale.spec.ts`、新增页面级 locale specs — 断言语言属性、页面关键标题、关键交互、错误/空状态和 metadata。
- 更新：`STATUS.md`、本任务文件、`ARCHITECTURE.md` 与 `DOCUMENTATION.md` — 仅当实现改变当前事实、架构正本或任务生命周期时同步；翻译计划不提前宣称批准或完成。

## 实施任务

### 任务 1：收紧语言注册与缺译合同

**文件：** 见“多语言底座”。

- [ ] 写 `tests/i18n-coverage.test.mts`：四份字典必须具有相同键；每个注册语言必须有显示名、路径前缀和格式化 locale；缺失 WordPress 文案返回 `unavailable`，不得返回英文正文。核心断言按此合同编写：

  ```typescript
  const result = resolveLocalized({
    requested: null,
    default: { heading: "English heading" },
    locale: "zh",
    scope: "flow-formed",
  });
  assert.deepEqual(result, {
    status: "unavailable",
    locale: "zh",
    reason: "missing-or-unapproved",
  });
  ```

- [ ] 运行 `npm test`，确认新断言先失败，并记录当前 `resolveLocalized()` 的英文 fallback 行为为失败原因。
- [x] 将语言路由、显示名称与 Intl locale 集中为 `LOCALE_CONFIG`，并用 `satisfies` 检查字段；索引资格继续由独立审核白名单控制。UI 支持状态字段和新增语言验收仍待补。
- [ ] 将字典类型从宽泛 `Record<string,string>` 收紧为英文键推导的类型；其余语言用 `satisfies Dictionary` 检查相同 key。
- [ ] 将正文 resolver 返回值改成可区分的联合状态：`{ status: "translated", content, locale }` 或 `{ status: "unavailable", locale, reason: "missing-or-unapproved" }`；只有批准内容能进入 `translated` 分支。
- [x] 为日期/数字格式化提供基于 registry 的 `Intl.DateTimeFormat` / `Intl.NumberFormat` 工具；不翻译 PCD、型号、尺寸原值。
- [x] 已运行 `npm test`（49 项）、`npm run typecheck`、`npm run lint` 和 `npm run build`；全部通过。架构变化已同步到 `ARCHITECTURE.md` 与现有国际化 ADR。正文 resolver 的 fail-closed 联合状态仍未实现。

### 任务 2：完成旋压轮毂页四语文案（首个完整页面切片）

**文件：** `src/content/flow-formed-wheels.ts`、`src/content/types.ts`、新建 `src/lib/i18n/flow-formed-copy.ts`、`src/lib/wordpress/flow-formed.ts`、`src/app/products/wheels/flow-formed/page.tsx`、`src/components/wheels/flow-formed-page.tsx`、相应测试与 `e2e/i18n-flow-formed.spec.ts`。

- [x] 新增 `tests/flow-formed-i18n.test.mts`，遍历 `en/zh/es/th` 检查 WFF01–WFF05 核心 copy、CTA、面包屑、目录空状态和 SEO，并确认非英文状态显式为 `draft`。

  ```typescript
  for (const locale of LOCALES) {
    const copy = flowFormedCopyFor(locale);
    assert.ok(copy.hero.heading.trim());
    assert.ok(copy.processDefinition.evidenceNote.trim());
    assert.ok(copy.catalogue.emptyResultHeading.trim());
    assert.ok(copy.inquiry.primaryCta.label.trim());
    assert.ok(copy.seo.title.trim());
  }
  ```

- [x] 首次定向测试曾因 copy 模块/语言字段缺失失败；实现后 `node --experimental-strip-types --test tests/flow-formed-i18n.test.mts` 通过。
- [x] 新增与 `FlowFormedWheelsPage` 对齐的四语类型化 copy，覆盖 Hero、工艺边界、步骤、目录、询盘、SEO、媒体 alt 和 CTA 标签；产品事实、页面锚点和素材来源保持英文正本定义。
- [x] Hero 面包屑、目录文案、媒体辅助文本改为 locale copy；站内页面 href 按 locale 生成，页内锚点保持稳定。
- [x] route 读取请求 locale 并调用本地化 copy/WordPress 适配器；WordPress 译文须通过既有 `locale_status` 归一化门槛，草稿语言 noindex，英文源内容不被用于非英文页面。未批准页面显示本语言的草稿 copy 以供预览，正式翻译审核仍未完成。
- [x] metadata 与 Open Graph 使用当前语言 title/description；草稿语言不输出 canonical 或 alternate，英文 canonical 仍受发布门槛、语言白名单和目录条件控制。
- [x] 已新增四语言 Playwright 验收，覆盖标题、Hero CTA、面包屑、目录标题/模型或空状态、语言选择器、`<html lang>`、Open Graph、canonical 和 `noindex`。
- [ ] 执行 `npx playwright test e2e/i18n-flow-formed.spec.ts`；当前本机 Playwright Chromium 缺失，下载遭遇 TLS `ECONNRESET`，浏览器测试尚未成功启动。恢复浏览器后重跑。
- [x] 单元测试、整站 `npm test`（49 项）、类型检查、lint、production build 和四语言 SSR metadata/语言属性核对通过；Playwright 浏览器验收待运行。

### 任务 3：审计并迁移共享组件文案

**文件：** `src/components/site-header.tsx`、`site-footer.tsx`、`site-breadcrumbs.tsx`、`faq-accordion.tsx`、`route-block.tsx`、`src/components/sections/`、`src/components/wheels/`、`src/components/forged-wheel/`、字典和共享组件测试。

- [ ] 先为 header/footer/面包屑/FAQ/route block 建立四语渲染断言，覆盖可见文本及 `aria-label`、`aria-current`、`title`、`placeholder`。
- [ ] 运行 `node --experimental-strip-types --test tests/shared-i18n-components.test.mts`，确认尚未迁移的文本断言失败。
- [ ] 将共享组件文案放入有命名空间的字典，例如 `nav.*`、`footer.*`、`common.*`、`a11y.*`；页面专有句子留给页面 copy，不把大段正文塞进通用字典。
- [ ] 搜索上述组件中的用户可见文本，逐项改为 `t()` 或显式 `copy` prop；每项命名例外须说明它是产品事实、品牌名或无障碍隐藏文本，不保留无说明硬编码英文。
- [ ] 扩展 `e2e/accessibility.spec.ts` 对每种语言检查关键 landmarks、链接名称和按钮名称；运行共享组件测试与该 E2E。

进度：`RouteBlock` 的默认 eyebrow 已改为读取现有四语字典键，并加入字典覆盖断言。共享组件整组渲染审计、FAQ/header/footer 可访问名称验收和浏览器回归仍未完成。

### 任务 4：按路由模板完成产品和转化页面

**文件：** 首页/公司与产品清单中列出的 route、`src/content/products.ts`、`src/content/wheel-catalogue.ts`、`src/content/wheel-detail.ts`、`src/content/inquiry-form.ts`、`src/lib/i18n/*copy.ts`、`src/components/inquiry-form.tsx`、`src/components/wheels/*`、对应路由 E2E。

- [ ] 建立产品路由矩阵，逐项记录：页面正文来源、组件、UI copy、SEO、图片 alt、语言发布状态；覆盖 `/`、公司三页、`/products`、四条产品线、目录、forged、flow-formed、型号详情。
- [ ] 对照现有轮毂目录、型号详情和询盘四语切片，把各产品页的 Hero、规格说明、披露、FAQ、相关资源和 CTA 接到本地化内容对象；事实值保持统一。
- [ ] 对 `/contact`、`/request-a-quote`、`/thank-you`、经销商、private-label 与 custom-development 检查表单选项、准备提示、隐私链接、字段错误、限流、失败和成功状态全部来自 locale copy。
- [ ] 把 API 字段错误转为稳定 `{ code, field }`，由客户端按当前 locale 映射；未知 code 显示本地化通用错误，不显示服务端英文原文。
- [ ] 增加每个页面族至少一个非英文 Playwright 断言，并覆盖成功/校验失败/网络失败；`npm run test:e2e -- e2e/i18n-wheel-catalogue.spec.ts e2e/i18n-wheel-enquiry.spec.ts e2e/conversion-locale.spec.ts` 通过。

### 任务 5：完成 Fitment、工具、Insights、Resources 与 Gallery

**文件：** 页面清单中 Fitment/工具、内容/知识库、展示/画廊路径；`src/components/offset-calculator.tsx`、WordPress Insights adapter、对应内容模块、测试。

- [ ] 给 Fitment 列表和 `[platform]` 模板、工具页与 offset calculator 增加 locale copy；本地化输入标签、单位描述、结果说明、校验/空结果和复制反馈。数值计算结果不随语言改变。
- [ ] 给 Insights 列表、文章、bolt pattern 文章和 Resources 指南共用模板增加已批准的本地化 WP 内容读取；标题、摘要、正文、作者/日期显示、SEO 与文章内链接逐 locale 验收。
- [ ] 为 Gallery、finishes、wheels 的筛选、图注、alt、空态和 CTA 增加 locale copy；图片权利状态与实际颜色/工艺事实不从翻译推断。
- [ ] 扩展 `tests/wordpress-insights.test.mts` 和新页面族单测覆盖翻译缺失、未批准、错误响应和内容批准四种状态。
- [ ] 运行 `npm test`、`npm run typecheck`、相关 Playwright 页面测试；预期缺译页面无英文正文，且不可索引。

### 任务 6：完成法律与支持页面的审校闭环

**文件：** `/support/privacy`、`returns`、`shipping`、`terms`、`warranty` 页面、WordPress Page contract、`scripts/i18n/audit-page-locales.mjs`、法律页面测试。

- [ ] 每个法律/政策页面按 locale 核对正文、摘要、metadata、更新时间、联系方式和内部链接；WordPress `locale_status` 必须表示实际责任人审核，不由 seed 脚本自动标成 `approved`。
- [ ] 更新只读审计脚本，逐记录检查正文对象、SEO 对象、批准状态和 required page key；输出页面键 × locale × body/SEO/status 四列原因，任何缺项返回非零退出码。
- [ ] 新增脚本单测，分别用 approved、missing、draft、malformed fixture 验证状态与退出码；命令 `node --test scripts/i18n/audit-page-locales.test.mjs` 通过。
- [ ] 只有法务确认的译文才能进入已批准状态和 `hreflang`/sitemap；其余语言输出本地化不可用状态并 noindex。

### 任务 7：统一 metadata、路由索引与 sitemap

**文件：** `src/app/sitemap.ts`、`src/app/robots.ts`、页面 metadata、SEO/locale helpers、`tests/i18n-routing.test.mts`、E2E site contract。

- [ ] 对每个 route/template 生成当前语言 canonical；无对应批准页面时不生成 hreflang alternate，也不把未审核 locale URL 放进 sitemap。
- [ ] 为页面审核状态建立读取入口，sitemap 按 page key + locale 状态过滤；维持站点级 staging noindex，并且不影响英文已批准页策略。
- [ ] 结构化数据中的 `inLanguage`、面包屑名称、描述等文字按当前 locale 输出，产品标识和规格事实不改写。
- [ ] 测试 default locale root 路径、`/zh|/es|/th` 路径、翻译不存在、重定向/旧路径和 alternates；`npm test` 与 `npx playwright test e2e/site-contract.spec.ts` 通过。

### 任务 8：建好“新增语言”增量接入流程

**文件：** locale registry、字典、翻译 schema、`scripts/i18n/audit-ui-locales.mjs`、`package.json`、新增 fixture 和文档。

- [ ] 增加 `i18n:audit` 命令，依次运行 UI 字典/静态 copy 审计和 WordPress 页面正文/SEO 审计；缺失词条、未批准内容和结构不匹配均退出非零。
- [ ] 在 `tests/i18n-coverage.test.mts` 放入一个测试用临时 locale，验证新增语言若缺 display name、Intl locale、字典 key 或 WP locale schema 会失败，而不需要改页面组件。
- [ ] 写“新增语言接入”检查步骤到本任务交付结论及 `ARCHITECTURE.md`：添加 registry entry → 完整字典 → 格式化规则 → WP locale 字段/审核人 → 路由 fixture → 页面与媒体翻译 → 浏览器验收 → 审批与索引启用。
- [ ] 索引开关保持独立审核白名单；新增语言默认可在预览环境校验但不被索引，完成批准后才逐页面开放，不能仅因语言已注册就全站开放。
- [ ] 验证新增临时语言过程只需改 registry、字典和内容数据；route/page/component 中没有 locale 专用条件分支。

### 任务 9：全站覆盖验收与任务收尾

**文件：** `STATUS.md`、本任务、`ARCHITECTURE.md`、`DOCUMENTATION.md`（仅地图变化时）、验收报告 `outputs/reports/`。

- [ ] 运行 `npm run i18n:audit`，期望所有已开放语言的页面×正文/SEO/状态与 UI 字典检查通过；未开放语言逐页列出剩余项。
- [ ] 运行 `npm run check`，期望 theme、Node tests、lint、typecheck、production build 全部通过。
- [ ] 在有可用预发布 WordPress 数据时运行 `npm run test:e2e` 和四语言全路由 smoke；检查 `<html lang>`、页面标题、导航、表单、交互错误、alt、canonical、hreflang、robots 与 sitemap。预发布 WordPress 不可用时，保留失败状态，不用本地 mock 伪装成内容审核通过。
- [ ] 人工审阅每语言长文本布局、字体、断行、移动端导航、表格/筛选和法律文字；保存测试证据与未通过页面列表。
- [ ] 更新 `STATUS.md` 的优先级和发布阻断。只有全部目标页面、所有可见状态、媒体和 SEO 通过且责任人审批完成，才把本任务从 `work/active/` 移入 `work/completed/`；此计划不授权自动 commit、push 或 deploy。

## 首轮实施验收

完成任务 1 与任务 2 后，至少满足：

- 四种语言的旋压轮毂页面 copy 契约键一致，文案未审核状态可见且不冒充已批准内容。
- 旋压轮毂页的页面正文、面包屑、Hero、CTA、空态、图片 alt、metadata 与链接均按请求语言输出；不出现无意英文正文回退。
- 英文页面保持既有公开行为；zh/es/th 在审批完成前保持 noindex 且不进入 sitemap。
- 单测、对应 Playwright、类型检查和 lint 通过；`ARCHITECTURE.md` 与 `STATUS.md` 记录的新合同与实际行为相符。

## 执行记录

- 已完成的基础：严格 UI 字典查找、移动端导航 aria 标签、四语 404/error、轮毂目录和筛选链、轮毂型号详情及询盘切片。具体历史证据见 [多语言覆盖报告](../../outputs/reports/36-sitewide-multilingual-text-coverage-2026-10-12.md) 和 [转化页验收报告](../../outputs/reports/37-conversion-pages-four-languages-and-deploy-gate-2026-10-12.md)。
- 当前仍未完成：其余路由正文与 UI、WP Page/Insights 审批、媒体说明、字段错误语言映射、完整 SEO 对应关系，以及外部法律/工程审核。
- **下一切片：任务 1 的缺译合同测试，然后执行任务 2：旋压轮毂页自己的四语言文案。**

## 审计修复计划 A-01

**状态：**本地资格接缝、发现入口和旧 cookie 策略已实施并通过隔离 WordPress 验证；逐页实际审核和 live/正式域名验收未完成，A-01 仍在进行中。本节是逐路径逐语言发布资格的唯一责任卡；上文的四语内容制作任务继续负责翻译本身。本节仅保留 4 个审计 Todo，避免把原卡已有复选框重复计入[总计划](../../outputs/audit-v3/2026-10-17-seven-audit-implementation-plan.md)的 72 项。

**来源与当前证据：**[逐编号对照表](../../outputs/audit-v3/2026-10-17-audit-number-disposition-ledger.md)中的 W1-C `M05-G1/G2/G5`、`M06-G3`；交叉关注 `M05-R2/R4` 和 QA `D-01` 的旧 cookie／导航边界。当前 `src/lib/i18n/types.ts` 把 `INDEXABLE_LOCALES` 设为全部四语；`src/app/layout.tsx` 对非首页使用它生成 metadata 和语言选择项；`src/app/sitemap.ts` 据此展开非首页 URL。首页已经通过 `getHomepagePublicLocales()` 逐语言筛选，但其他页面族没有同一资格来源。`src/proxy.ts` 会因旧 cookie 或 `Accept-Language` 把无前缀 URL 重定向到未必公开的语言路径。各子路由还可能覆盖根 metadata，必须验最终 HTML，不能只验 helper 的返回值。

### 目标合同与实施边界

对每个**规范页面路径 × 语言**计算一个服务端资格结果，至少区分「可公开」、「仅授权预览」、「不可公开」和「来源暂不可判定」，并携带原因、内容修订标识、批准来源及该路径当前可公开的语言集合。URL 有语言前缀、UI 字典有词条、WordPress 返回 `publish`，均不能单独构成批准。公开资格须同时满足正文、该语言 SEO、所需媒体、页面或产品自身发布门槛与责任人审核；撤回优先于旧聚合记录和本地 fallback。资格接口返回页面消费的稳定类型，展示组件不得直接读取 WordPress 原始字段。

具体输出合同：可公开版本可被访问，页面输出该语言正文、自指 canonical、准确的 `hreflang`，并可进入 sitemap 和当前页面语言切换目标；其余版本不显示英文正文冒充译文，不给出可索引 canonical/alternate，不进 sitemap，也不作为切换目标。未公开 URL 按页面族既有合同返回 404 或本地化不可用页，两者都必须 `noindex`。授权预览可看草稿，但永远不进入公开集合。CMS 暂时失联时，只有能证明仍获批准且未被撤回的最后有效快照可继续公开；无法证明则保守关闭该语言资格。

此卡负责**资格的一致消费**。翻译文案与媒体补齐仍在本卡上文各页面切片；产品事实和图权由[A-02](../queued/2026-10-10-product-image-trust-verification.md)负责，Insights／Fitment 的事实签核由[A-14](../queued/2026-10-17-audit-14-insights-fitment-publication.md)负责，感谢页固定不可索引由[A-03](../queued/2026-10-17-audit-03-thank-you-indexing.md)负责，Webhook 可靠投递由[A-05](../queued/2026-10-17-audit-05-cms-publish-events.md)负责。本卡不把中文、西语、泰语批量标为已批准，不引入另一套平行审批数据库，也不把全站缩成只剩英文的永久开关。

### 路径盘点与推进批次

| 批次 | 页面族与代表路径 | 资格来源与关键验证 |
|---|---|---|
| 0 | `/` | 复用已验收的独立 Page + `PageView`；确认首页撤回、预览和旧聚合回退优先级不退化。 |
| 1 | `/about`、`/capabilities`、`/products` 及四条产品线入口 | 逐页记录本地 copy／WordPress Page、SEO、媒体和审核人；非英文 fallback 不得被当作公开译文。 |
| 2 | `/products/wheels`、工艺页、`/products/wheels/[model]` | 先保留既有产品公开集合和工艺门槛，再逐语言判正文与 metadata；动态型号 slug 不因有翻译路径就绕过产品批准。 |
| 3 | `/contact`、`/request-a-quote`、经销与支持／法律页 | 分开核对营销正文、询盘同意文本和法律批准；表单可用性与页面索引资格分别记录。 |
| 4 | `/insights`、`/insights/[slug]`、Fitment、工具及其他动态内容 | 使用真实 slug／平台集合逐项判语言资格；不凭列表页通过就放行全部详情页。 |

盘点应以当前 `src/app/**/page.tsx`、重定向和 `src/app/sitemap.ts` 的并集为准，按页面模板与动态实体记录，而不是手抄固定 URL 数量。每行记录 `path/template`、实体 ID、语言、正文来源与修订、SEO 状态、媒体／事实门槛、审核人、当前输出、预期输出及阻塞原因；缺少审核证据时状态为「不可公开」。这份矩阵作为本卡执行证据，避免在 `STATUS.md` 复制全量清单。

### 四个实施 Todo

- [x] **建立资格矩阵与类型合同。** 从页面、CMS 接缝和动态实体来源生成路径 × 四语盘点；为首页、营销 Page、产品、文章、法律、Fitment 分别指认批准事实和撤回来源。先写状态矩阵测试，覆盖批准、草稿、缺译、撤回、预览、CMS 失联及英文已批准快照。将 `LOCALES` 仅保留为支持的语言注册表，逐页公开资格从内容事实计算；旧 `INDEXABLE_LOCALES` 不再充当非首页批准证据。已建立 38 个路由模板 × 四语的[本地矩阵](../../outputs/audit-v3/2026-10-17-a01-route-locale-matrix.csv)和带原因、修订与批准来源的服务端决策类型；动态实体的 live 清单仍属验收输入。
- [x] **统一页面与发现入口。** 让服务端页面、根／子路由 metadata、语言切换器和 sitemap 消费同一资格结果或其可验证派生值。按页面族逐批迁移，每批都抓最终 HTML；只有真实可访问且已批准的目标才输出互指 `hreflang`。sitemap 按已批准路径集合生成，不做路径 × 四语的无条件笛卡儿积；保留 `NEXT_PUBLIC_APP_URL` 缺失时的站点级闭锁、既有产品门槛和预发布 `noindex`。当前无获批非英文样本，其复核保留在末项验收。
- [x] **处理直接访问、旧 cookie 与撤回。** 显式语言 URL 以其自身资格为准；无前缀 URL 不因 cookie 或 `Accept-Language` 被自动送到未批准语言。优先采用无前缀 URL 不做隐式语言重定向、只在用户主动切换时导航的简单策略；若确需保留自动跳转，先证明代理层能读取与页面相同且可失效的公开语言快照。覆盖旧 cookie、`_rsc`／预取、查询串、浏览器前进后退、撤回后的缓存失效；撤回时不得由旧聚合数据或英文 fallback 复活页面。旧 cookie、预取和查询参数已通过本地端到端验收；真实撤回事件与缓存刷新仍待 live 复核。
- [ ] **完成四语发布状态验收。** 对每个页面模板至少选一条英文批准、一条非英文批准、一条草稿或缺译、一条撤回样本；动态模板再测存在／不存在的实体。核对状态码与正文语言、`<html lang>`、robots、canonical、`hreflang`、sitemap、切换器目标和预览隔离。运行相关单元/契约/Playwright 测试及 `npm run check`，保存矩阵、最终 HTML、sitemap 样本、命令与环境；未获业务、工程或法律审核的语言保持不可公开，本卡不标完成。

### 可执行验收矩阵

| 场景 | 页面与导航 | 搜索发现 |
|---|---|---|
| 英文已批准 | 英文正文；既有产品／法律门槛继续生效 | 自指 canonical；仅互指已批准语言；符合其他门槛时进 sitemap |
| 非英文已批准 | 对应语言正文、UI 与媒体说明；切换器可达 | 该语言自指 canonical；互指集合与实际公开页一致；进 sitemap |
| 草稿／缺译／审核未完成 | 404 或本地化不可用页；不显示英文正文冒充译文；切换器不提供该目标 | `noindex`；无可索引 canonical／`hreflang`；不进 sitemap |
| 已公开后撤回 | 旧 cookie、直达 URL 与缓存刷新后均不再显示撤回正文 | 从 sitemap 和互指集合移除；旧 URL 不继续宣称可索引 |
| 授权预览 | 编辑可看当前语言草稿，匿名不可看 | 始终 `noindex`，不改变公开 sitemap／切换器 |
| CMS 不可达 | 有可证明的最后批准快照才可服务；否则关闭该语言资格并记录故障 | 不把错误状态或本地英文默认文案提升为公开译文 |

### 文件切片、依赖与回滚

预计先改 `src/lib/i18n/types.ts` 附近的资格合同及 `src/lib/wordpress/pages*`／各内容适配器，再改 `src/app/layout.tsx`、相关子路由 metadata、`src/app/sitemap.ts`、`src/components/language-switcher.tsx` 与 `src/proxy.ts`；测试入口为 `tests/i18n-routing.test.mts`、WordPress 页面契约测试、`e2e/homepage-locale-pilot.spec.ts` 和 `e2e/site-contract.spec.ts`，按页面族补充 fixture。执行代码前先读仓库当前 Next 版本的相关文档。避免在每个路由重复取 CMS 状态：同一请求共享资格结果，缓存标签与发布／撤回事件一致；可靠事件重试仍由 A-05 负责。

外部输入是逐页逐语言的批准人、译文/SEO/媒体证据，以及产品、工程、法律的各自签核。缺少输入时，代码切片可完成但对应语言保持草稿或不可索引。每一批先保留旧输出快照和可回退实现；若出现误封已批准英文页、公开未批准译文或 URL／缓存不一致，停止扩大迁移并回退该批资格消费。回退不能重新开放已撤回内容；优先以保守不可公开状态保护内容。

### 本轮执行与剩余门槛（2026-10-17）

负责人确认：WordPress 暂时不可用时，英文首页 `local-home-v1` 快照仍已获批准，可继续公开索引。`src/lib/i18n/publication.ts` 现在按路径给出公开语言集合及决策状态；首页使用独立 PageView 的审批和修订，非首页在译文审核前只保留现有英文资格。服务端页面、首页和根 metadata、语言切换器与 sitemap 消费这套资格；动态轮毂、文章、Fitment 和 bolt pattern 的实体必须在各自公开集合中。旧 cookie 与 `Accept-Language` 不再改写无前缀 URL；明确语言 URL 的未批准版本返回 404 和 `noindex`。正式 URL 未配置时代理层另发 `X-Robots-Tag: noindex, follow`。

本地 `WP_MODE=mock`、测试 URL `http://127.0.0.1:3100` 下，38 个页面模板的 152 行[资格矩阵](../../outputs/audit-v3/2026-10-17-a01-route-locale-matrix.csv)已经建立。`npm run check` 通过（68 项单测、lint、typecheck、生产构建）；A-01 专项 Playwright 通过：首页英文批准快照、未批准四语路径 404、最终 HTML 的 canonical/hreflang/robots、sitemap、切换器和旧 cookie。WordPress Page 契约单测覆盖撤回优先于旧聚合内容。

末项 Todo 尚不能打勾：当前没有已获批准的非英文正式样本，也未取得 live WordPress 的逐页批准修订、撤回事件与缓存恢复、真实动态实体全集、正式域名和生产代理的结果。需负责人提供逐页正文、SEO、媒体与业务／法律／工程签核后，在只读或预发布环境逐项验证，并按本卡验收矩阵记录最终 HTML 与响应。此处不代替 A-02 产品事实、A-03 感谢页、A-05 Webhook 或 A-14 Insights/Fitment 内容审核。

总计划仍见[七份审计实施总计划](../../outputs/audit-v3/2026-10-17-seven-audit-implementation-plan.md)。本轮未写 WordPress 内容、未改变正式发布状态。
