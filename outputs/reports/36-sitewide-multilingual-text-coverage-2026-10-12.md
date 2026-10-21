# 全站可见文字多语言：归属契约与实施顺序

- 日期：2026-10-12
- 状态：实施中；轮毂详情与询盘 UI 切片已改，整站四语验收未通过
- 目标：`en`、`zh`、`es`、`th` 的每个已发布页面，其可见和辅助技术可读文字均来自明确的语言正本；未完成页面不得冒充完整译文
- 与现有任务关系：`work/queued/2026-10-12-planA-scope-and-order.md` 负责正文归 WordPress（等待用户确认范围）；`work/queued/2026-10-10-multilingual-page-body-migration.md` 负责逐页翻译/SEO。本文件补齐二者未覆盖的**组件、错误、媒体和全站验收**，不另建重复的迁移任务。

## 1. 一种语言路由，三类文字正本

| 类别 | 正本位置 | 典型文字 | 边界 |
|---|---|---|---|
| **界面语言** | Next.js 的类型化本地字典 | 导航、按钮、筛选器、弹窗、表单标签、提示、Toast、分页、`aria-label`、通用状态/错误、日期/数量格式 | 组件可读本地字典，但不得另存一套英文硬编码；WordPress 不管理纯交互标签 |
| **可编辑内容** | WordPress Page/Post 按 locale 的结构化正文、SEO 和媒体说明，经适配器转成稳定视图模型 | Hero、段落、FAQ、CTA 营销句、文章、政策、`title/description`、图片 `alt/caption` | 客户端组件不直接读原始 REST；本地英文快照仅作受控回退，不能伪装成已完成目标语言 |
| **产品事实与展示名** | `wheel_model`/事实层保持稳定代码和数值；可译的展示名通过明确 locale 字段或词表 | 型号、productionCode、PCD/ET/尺寸保持原样；工艺、表面处理、栏目名、说明可翻译 | 不翻译 SKU、孔距或工程数值；未经工程确认的规格不得通过翻译改写事实 |

**同一文案只有一个正本**：例如“询盘按钮标签”归界面字典；“这个产品线能做什么”归 WordPress。WordPress 插件负责返回已批准语言数据、草稿/撤回和版本状态；Next.js 负责选择 URL locale、渲染和本地交互字典。页面只消费稳定视图模型，不改变 `src/content` 接缝原则。

## 2. 已有能力与已确认的缺口

- 已有四语言独立 URL、`getLocale()`、本地字典和 WordPress `content_by_locale`/`seo_by_locale` 接缝。当前 `INDEXABLE_LOCALES` 仍只有 `en`，这是正确的安全门槛，不应为了看见译文提前放开。
- `translate()` 对缺失键静默回退英文，`resolveLocalized()` 对缺失正文记录日志但仍渲染英文。这能保证预览可用，**不能证明目标语言已完成**；必须增加页面级缺口清单与渲染后检查。
- 轮毂直接询盘弹窗目前直接 import 英文 `wheelDetailEnquiry`、`wheelDetailFormCopy`，并没有接 locale；询盘表单默认 `inquiryFormUi` 也是英文。即使轮毂详情正文已翻译，弹窗仍可能英文化。
- 表单会保留带具体含义的服务端英文错误文本，避免丢失原因；全面多语言需要 API 返回稳定**错误代码/参数**，由前端字典翻译，而不能用通用译文覆盖具体原因。
- 最近修复的媒体合并优先级说明：WordPress 媒体库的单语 caption 不应覆盖页面 locale 载荷中的 caption。验收要扫**最终 HTML/DOM**，不只检查翻译 JSON。
- 询盘隐私版本与 WordPress page key 的缺口属于**独立的提交门槛**；不能靠翻译组件绕过同意校验。当前 `request-a-quote`、`privacy` 与 `legal-privacy` 的内容归属须先统一，批准前表单保持关闭。

## 3. 纵向实施顺序

1. **建立覆盖账本与测试基线**：按路由 × locale × 状态列出 UI、正文、SEO、图片说明、表单错误、无障碍名称、链接、邮件/成功页。使用已有 31 模板作为起点，再抽动态产品和文章实例；静态扫描硬编码只是线索，浏览器渲染后逐项复核。区分品牌名、SKU、`CNC` 等合法非译 token 与真正漏译。
2. **先切转化链**：Header/Footer → 轮毂筛选/详情 → 直接询盘弹窗 → 总询盘清单 → 两步表单 → 四种提交状态/服务端错误 → 感谢页。每切片同时验 `en/zh/es/th`、键盘、移动端和提交契约；翻译不能改变 direct/cart 隔离或“落库才成功”。
3. **并行按现有方案甲迁正文**：固定页面走 WordPress Page、Insights 走 Post、型号走 `wheel_model`；英语正本零回归后逐页填译文。法律文本与工程/供货主张分别需要授权审核；WP 的技术 `approved` 字段不能代替真实业务/法务签字。
4. **收口 SEO/媒体/格式**：每页 `html lang`、H1、metadata、canonical、内链、图片 `alt/caption`、日期/数量格式一致；只让已完整翻译、已审核的对应页面进入 sitemap/hreflang，而非“一次打开整个语言”。未完成目标语言继续 `noindex`，必要时不把该页面作为公开语言切换目标。
5. **持续门禁**：字典键集合一致性；未翻译字段数；服务端 fallback 日志；渲染后残留语言扫描；Playwright 关键交互和四视口；WordPress 草稿/批准/撤回与缓存刷新。人工审校处理语义、术语和法律准确性，自动检查不宣称能替代它。

## 4. 完成定义

某个页面某种语言“完成”必须同时满足：①没有非例外的英文/其他语言残留（含 aria、错误、弹窗、SEO、alt/caption）；②内容与页面级审核通过；③没有回退日志；④ UI 交互和链接在该语言能用；⑤该语言的索引/`hreflang`/sitemap 状态与审批一致。整站“全语言完成”是所有计划公开的页面 × 语言通过这个矩阵，**不是仅有四个 URL 前缀或四套导航词典**。

Google 的多语言页面建议以独立 URL 和对应关系表达语言版本；只翻译模板、正文仍是另一种语言，会让本地化页面质量与索引判断都变差。参考：[Google 多语言页面文档](https://developers.google.com/search/docs/specialty/international/localized-versions)、[多地区/多语言站点文档](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)。

## 5. 本轮边界

这是架构/验收计划，不声称已完成全站翻译。没有运行代码门禁、Playwright 或正式域名 SEO 检查；没有修改 `ARCHITECTURE.md` 或 `DECISIONS.md`，因为本轮尚未作代码级架构迁移决定。开工时应先把上述归属契约正式写入架构，再按既有任务生命周期逐切片实施。

## 6. 2026-10-12 实施记录与验收结论

- 已将轮毂详情模板、配置表、询盘弹窗、相关产品卡、表单 UI 与清单反馈接入本地四语副本；直接询盘与 `/contact` 在隐私版本缺失时 fail-closed。没有修改规格事实或发布门槛。
- `npm test` 42/42、`npm run typecheck`、`npm run lint`、`npm run build` 通过；隔离生产构建的 `e2e/i18n-wheel-enquiry.spec.ts` 4/4 通过。Playwright CLI 在本地 `:3200` 实测 `/zh`、`/es`、`/th/products/wheels/dx424` 的正文与入口为对应语言。
- WordPress 只读命令 `node scripts/i18n/audit-page-locales.mjs http://127.0.0.1:8081` 返回 **46 个未通过的页面×语言组合**（17 键 × 4 语言；15 条现有记录加询盘所需的 2 个缺失键）。`es/th` Page 正文为 0 已批准；`zh` 仅 7 条已批准。
- Playwright CLI 实测 `/es/contact`、`/es/request-a-quote` 的页面标题/正文仍为英文。故**全站四语全文目标不通过**，不能开放非英文索引，也不能把隐私政策译文当作已核准同意文本。
- 额外 fail-closed 核验：用隔离端口启动生产构建，令 WordPress API 指向不可达本地端口，同时给出测试隐私版本；Playwright CLI 仍只看到中文“项目询盘暂未开放”提示，表单未显示。测试端口和浏览器会话已关闭，未调用真实邮件端点。
- 待验：其他页面的正文、媒体说明、SEO、文章、法律页面、服务端字段错误及全链路转化。法务与业务批准仍是独立门槛。此记录取代上文“本轮未改代码”的历史边界描述；原第 5 节保留作为规划当时的记录。
