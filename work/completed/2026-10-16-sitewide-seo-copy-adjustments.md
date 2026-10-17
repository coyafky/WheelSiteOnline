# 全站 SEO 文案与关键词术语对齐实施计划

> **执行说明：** 按 executing-plans 在当前非主分支逐项执行；每步完成后核对研究页面映射、现行 Page SPEC 与内容证据边界。

**目标：** 将首页、全站 metadata、产品总览和自密封轮胎页面的英文 SEO 文案对齐 Google US/en-US 关键词研究，同时清理旧产品定位与不一致术语。

**实施方式：** 只改现有页面和本地内容回退中的英文可见文案及 metadata，不新增 URL、不改页面布局、不写入 WordPress、不更改 noindex、canonical 或 sitemap。自密封轮胎统一使用美国英语的 `self-sealing tires`；其余产品线继续按已审核范围描述。

**技术栈：** Next.js App Router、TypeScript、`src/content/` 类型化内容接缝、现行 Markdown Page SPEC。

## 全局约束

- 项目记录使用中文；面对美国市场的 SEO 文案使用清晰的美国英语。
- 轮胎产品主术语为 `self-sealing tires`；不将 `self-healing`、`puncture-proof`、`never-flat` 或 run-flat 当作同义词或性能承诺。
- 不扩写未经证实的制造主体、工艺、规格、性能、认证、MOQ、价格、交期或供货承诺。
- `/products/custom-aluminum` 继续 `noindex, follow`；fitment 索引问题仍由独立 P0 任务处理。
- 不增加 URL，不改 canonical、robots、sitemap、WordPress 数据或生产发布状态。
- 不购买数据，不报告研究中未取得的 volume、KD、CPC 或排名数据。
- 不提交或推送变更。

---

### 任务 1：修正全站身份与产品总览 metadata

**文件：**
- 修改：`src/app/layout.tsx`
- 修改：`src/app/page.tsx`
- 修改：`src/app/products/page.tsx`
- 修改：`src/content/products.ts`
- 参考：`resources/research/seo-sitewide/2026-10-16-us-en-google/deliverables/RESEARCH-REPORT.md`
- 参考：`resources/research/seo-sitewide/2026-10-16-us-en-google/deliverables/page-map.md`

- [x] 将根布局 description 从单一制造商与 `self-healing safety tires` 叙述改为四产品线、项目评估与真实询盘路径；使用 `self-sealing tires`。
- [x] 将首页 fallback title 从 `Safety Tires` 统一为 `Self-Sealing Tires`，description 与首页四线定位及 Page SPEC 保持一致。
- [x] 将 `/products` fallback title/description 的 forged-only 和 `self-healing` 用词改为四条产品线与产品发现意图；不改此页其他旧版目录模块。
- [x] 将 `/products` 首段的 `self-healing` 和“四线共享同一 facility”旧表述改为 self-sealing 与按项目确认责任主体/设施的中性表达。

### 任务 2：统一自密封轮胎页面的美国英语与主词

**文件：**
- 修改：`src/app/products/safety-tires/page.tsx`
- 修改：`src/app/about/page.tsx`
- 修改：`src/content/safety-tires.ts`
- 修改：`src/content/homepage.ts`
- 修改：`src/content/about.ts`
- 修改：`src/content/tools.ts`
- 修改：`src/content/wheel-detail.ts`

- [x] 将访客可见英文文案中的 `tyre/tyres` 统一为 `tire/tires`；保留 `tyreModel` 等内部类型/字段名、产品型号名以及 `safety-tires` URL。
- [x] 将自密封页面 SEO title/description 及可见文案以 `self-sealing tires` 为主词；保留 puncture/test 条件边界，不能弱化供应商声明。
- [x] 将首页和 About 页面与同一主词保持一致；仅改拼写或旧词，不改工艺、主体和发布状态。

### 任务 3：同步页面规格并完成轻量核对

**文件：**
- 修改：`PAGE-SPECS/homepage.md`
- 修改：`PAGE-SPECS/self-sealing-tires.md`
- 修改：`PAGE-SPECS/about-self-sealing-tire-factory.md`
- 修改：`PAGE-SPECS/wheel-detail.md`

- [x] 同步美国英语拼写及 metadata 词形，确保 Page SPEC 与代码 fallback 一致。
- [x] 保留 custom-aluminum noindex、fitment P0、现有 canonical 与 sitemap；检查 diff 未包含索引/URL/CMS 修改。
- [x] 对照 SEO report 与 page-map 检查页面关键词对应关系及证据边界。
- [x] 运行 `git diff --check`，检查引用文件存在，并人工复读修改后的 metadata 与英文句子；本任务不运行应用测试或构建。

**已知限制：** Google US 本轮只有单次 SERP 观察、无付费关键词指标和 GSC 数据。WordPress 中已发布的权威文案优先于本地 fallback；本任务只改仓库内可审核的英文 fallback 与 Page SPEC，不同步或发布 CMS。

**执行结果：** 完成。当前运行配置为 `WP_MODE=mock`，本地页面采用更新后的 fallback。`git diff --check` 通过；未运行应用测试/构建，未改 URL、robots、canonical、sitemap 或 CMS。
