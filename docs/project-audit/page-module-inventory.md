# 页面与模块清单

## 全局共享模块

根布局为所有内容页注入 `SiteMotion`、`SiteHeader`、`SiteFooter`（`src/app/layout.tsx:139-150`）。`src/components/` 当前共有 68 个 `.tsx/.ts` 文件；本审计把“组件文件”作为模块资产计数，避免把同一共享组件按页面重复建档。

复用度最高的核心模块：`DealerCta`、`SiteBreadcrumbs`、`PageHero`、`AstryxScope`、`LegalDocumentPage`、`PreviewBanner`、`InquiryForm`、`AutomotiveBackdrop`、`LongformOutline`、`LanguageSwitcher`。

## 页面模块关系

| 页面 | 核心模块 | 数据/状态 |
|---|---|---|
| 首页 | 5 类注册模块：Hero、产品线、能力、交付、Closing | WordPress 首页 Page；非 ready 时 404 |
| About | AboutHero、CompanyRole、TireFactory、WheelFactory、AboutClosing | WordPress adapter + fallback |
| Capabilities | WheelCapabilities | WordPress capability 内容 |
| Contact | InquiryForm | 询盘 API |
| Custom development | FlowStepRow、CrossLink、PageHero、DealerCta | 页面内容文档 |
| Dealers | PageHero、DealerCta | 页面内容文档 |
| Private label | PageHero、DealerCta、Breadcrumbs | 页面内容文档 |
| Insights 列表 | GuidesAccordion、PreviewBanner、DealerCta | WordPress post/guide adapter |
| Insights 详情 | ProseArticle、PreviewBanner、DealerCta | 动态 slug |
| Bolt patterns | PageHero、Breadcrumbs、DealerCta | 指南数据 |
| Products | ProductFamilyGrid、DealerCta | 产品线内容 |
| Wheel catalogue | Backdrop、CardView、Pagination、Breadcrumbs | 公开轮毂目录 |
| Wheel detail | WheelDetailInteractive | 动态 model + 发布门槛 |
| Request quote | PageHero、InquiryForm、PreviewBanner、QuoteContextBar、Breadcrumbs | 询盘上下文 |
| 五个法律页 | LegalDocumentPage | WordPress 法律 Page；需法务确认 |
| Tools | PageHero、DealerCta、Breadcrumbs、OffsetCalculator | 本地计算逻辑 |
| Thank-you | 询盘回执与 conversion page 文档 | 明确 noindex/nofollow |

## 模块风险

- 首页有正式注册表；其余页面多为静态组合，尚无统一模块注册机制。
- 首页未知模块在生产环境记录错误后返回 `null`（`home-module-registry.tsx:67-89`），可能形成静默空洞。
- `llms.txt` 当前仍列出 `/thank-you`，与其 noindex、sitemap 排除策略不一致。
- 组件存在不等于每种空态、错态和响应式行为都已运行验证；Notion 中统一标为“已实现未验证”或“部分核验”。
