# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-10-01

> 本项目自己的第一个版本段。**以上（`[0.5.1]` 及更早）为克隆模板自带的英文历史，保留原文以便对照上游**，
> 不属于本项目的开发记录。以下用中文书写，遵循 `AGENTS.md` 第 6 行「项目记录一律用中文」。

### Added

**页面规格模块（PAGE-SPECS）**
- 新建 `PAGE-SPECS/` —— 按路由命名的页面施工图，与 `ARCHITECTURE/page-architecture/` 分工（后者说「为什么这样设计」，前者说「照着搭什么」）。第 ① 节可照 `DEC-015`
- 实测目录内共 **22 个文件**：**18 份页面规格** + **3 份公共文件**（`README.md`、`_components.md`、`_viewport-audit.md`）+ **1 份模块总表**（`index.md`）
  - ⚠️ 其中 `index.md` 是模块总表（索引表 + 组件复用矩阵 + 组件优先级），**不是页面规格** —— 早先误把它算进规格数是 21，实测应为 18
- 每份规格固定 7 节：一句话判断 → 骨架（段数表 + 组件树）→ 逐块规格（含真实 TS props 契约）→ 组件清单（复用 / 新建）→ 数据契约 → 布局响应式 → 待补阻塞
- `PAGE-SPECS/_components.md` —— 公共引用：现有组件清单 + 全部设计 token + 图片资产真相
- `PAGE-SPECS/_viewport-audit.md` —— 视口合规审查报告，实测 **123239 字节（约 122 KB）**，**83 个视口 / 24 条合并建议**；首页章节前提已被证伪，报告开头已加「前提更正」段（见 `DEC-020`）

**架构文档：三条非轮毂产品线的页面架构**
- `ARCHITECTURE/page-architecture/ev-components-page.md`
- `ARCHITECTURE/page-architecture/custom-aluminum-page.md`
- `ARCHITECTURE/page-architecture/safety-tires-page.md`
- 这三页**没有竞品底本**（竞品是纯轮毂公司），结构刻意不同于其他页；实测 EV 三电零件数为 **17 项**（非先前口头的 20）
- 安全轮胎页逐段标注归属（✅ 峰徊自有 / ⚠️ 归属待定 / ❌ 第三方专属），并给出 A 品牌方 / B 合作方两条实现路径（见 `DEC-017`）

**设计正本**
- 新建项目根 `DESIGN.md`（实测 **17414 字节**）—— 性质是**沉淀**而非禁令：从已跑起来的页面上反推好设计。含 **§0.5 视口驱动设计（全站第一原则）**、深色的语义、`forge-soft` 段级 token、CTA 四级体系、`.eyebrow` 受控词汇表、fail-visible 三层保护，以及 **6 处「已知裂缝」**（记录，不擅自改）。见 `DEC-019`、`DEC-020`

**Headless WordPress 读取层**
- `src/lib/wordpress/`（`types.ts` / `client.ts` / `index.ts`）—— Headless WP 读取层，mock 模式

**询盘域**
- `src/lib/inquiry/`（`types.ts` / `store.ts` / `mailer.ts` / `validate.ts` / `index.ts`）—— 三条纪律：**先落库再发信** / **存快照不存引用** / **上下文随询盘走**
- `src/app/api/inquiries/route.ts` —— POST / GET，实测 POST 返回 **201**、校验失败返回 **422**

**国际化层**
- `src/lib/i18n/`（`index.ts` / `types.ts` / `use-t.ts` + `dictionaries/{en,zh,index}.ts`）—— en / zh 字典 + 服务端 `getLocale` + client-safe `createT`
- `src/components/language-switcher.tsx` —— 语言切换器

**首页 Hero 重做（按用户 Hero PageSpec：35 节 + 10 条验收标准）**
- `src/components/home/hero/` —— `home-hero.tsx` / `hero-background.tsx` / `hero-product-card.tsx`（另有 `hero-product-grid.tsx`）
- `src/content/homepage-hero.ts` —— Hero 内容数据
- Hero 拆分：**品牌独占一屏**（回答「我们是谁」），四张产品卡**移出**成为独立的下一屏（见 `DEC-022`）
- 新建 **`--fh-hero` token（`#05070a`）** —— 收编一个存在已久但未 token 化的**第 4 阶深色**（原 `home-hero.tsx` / `gallery-band.tsx` 用裸 hex `#05070b`）
- 生成 **3 张 Hero 汽车背景图 + 4 张产品线卡图**（micu-image MCP / gpt-image-2），全部 WebP（**36–115 KB**）

**图片资产清单**
- 新建 `assets/site-data/asset-manifest.json` —— 按**实际文件扫描**生成，实测 **2772 条**（2757 轮毂图 + 15 preview-media），全部 `public:true`
- `assets/_non-webp-archive/` —— 收编 5 个位图（`custom-product.jpg` / `custom.png` / `ev-product.jpg` / `ev.png` / `tire.png`），站点只留 webp

**新增页面（实测 `src/app/` 下共 33 个 `page.tsx`）**
- `/products/ev-components`、`/products/custom-aluminum`、`/products/safety-tires` —— 三条非轮毂产品线（能力页 + 预留产品位，见 `DEC-016`）
- `/capabilities` —— 由 `/manufacturing` **改名**而来（旧路由 301 重定向）
- `/custom-development`、`/request-a-quote`、`/thank-you`

### Changed

- **首页 Hero 拆分**：品牌与产品线分属两个视口；Hero 里原有 **7 个出口挤一屏**（4 卡 + 2 CTA + 导航），上限是 1+2=3（`DEC-020`、`DEC-022`）
- **`ProductShowcase` 改造**：原「三宫格锻造轮毂」（**竞品的切法**）→ 改为**四条产品线**，首页不再自相矛盾
- **Header 透明态**：`bg-transparent` → **`bg-hero/72 + backdrop-blur-xl`**（让背景透出来）
- **浮动 CTA**：首页**滚动 30% 后**才出现（其他页恒显），且指向 `/request-a-quote`
- **`image-registry.json` 的 253 条改为 `no-asset`** —— 诚实标注「索引有此条目，实体不存在」（见 `DEC-018`）
- **Header 的 `Request Quote`** 走 i18n 并改指 `/request-a-quote`
- **Footer** 从「**竞品三分类**」改为「**四条产品线**」
- **设计规范的性质**：定为「沉淀」而非「禁令」；那 100+ 条禁令**原样不动**，`DESIGN.md` 只写正面系统（用户拍板「不要做那么多限制」，见 `DEC-019`）

### Fixed

- **`.btn-pill` 缺 `white-space: nowrap`** → header 的 `REQUEST A QUOTE` **折成两行**（高 106px）
- **`w-full` 覆盖 `.container-fh` 的 width** → 首页左右**贴边出血**（左列 x=0、卡片右缘 1440）
- **`use-t.ts` 从 `./index` 导入会把 `next/headers` 拖进 client bundle → 构建失败** —— 拆出 `dictionaries/index.ts` 桶后解决
- **失效的图片索引**：`image-registry.json` 里 **253 条记录全部指向不存在的 `assets/image/...`** —— 该索引按一个**已消失的图片库**生成，一直被它误导；改为以实体文件为准（见 `DEC-018`）
- **⚠️ 过程更正**：核查中曾**错误地把 253 条全部刷成 `public:true`**（未核实文件是否存在），**已回滚**为 `no-asset`

### Removed

- **5 个位图移入 `assets/_non-webp-archive/`**（`custom-product.jpg` / `custom.png` / `ev-product.jpg` / `ev.png` / `tire.png`）—— 站点只留 webp

### 暂缓（代码保留，不进本轮施工范围）

- 用户定案：**`/gallery`、`/gallery/finishes`、`/tools`、`/tools/offset-calculator` 本阶段不做**
  - `/gallery` —— 无素材
  - `/gallery/finishes` —— 只有示意值
  - `/tools/offset-calculator` —— 代码已存在，无需施工图
- **代码保留不删，只是不进本轮施工范围。**

### 安全

- 安全轮胎页的归属红线：「洛克 LOAKE」「航鹏」是**第三方品牌**，归属未定 → **归属确认前该页不上线**（见 `DEC-017`）

## [0.5.1] - 2026-09-26

### Changed
- Recommend Claude Code with Opus 5.5 in the README
- Refreshed the static Star History chart through September 2026
- Removed a redundant note about editing the canonical skill from the README

### Security
- Update Next.js and eslint-config-next to 16.3.5 with exact version pins, and refresh vulnerable transitive dependencies. Thanks to @atahan150 for the report in [#117](https://github.com/JCodesMore/ai-website-cloner-template/issues/117) and proposed fix in [#118](https://github.com/JCodesMore/ai-website-cloner-template/pull/118).

## [0.5.0] - 2026-09-17

### Added
- Repository ranking badges in the README

### Changed
- Simplified Quick Start with a copyable agent setup prompt, a template button, and one cloning command example
- Consolidated Claude Code, Codex, Cursor, and OpenCode support around one canonical Agent Skill in `.agents/skills/clone-website/`
- Reduced the Claude Code integration to a thin command bridge that forwards arguments to the canonical skill without creating a duplicate skill in other agents
- Moved the website inspection guide into the canonical skill's on-demand references

### Removed
- Expired sponsor integrations
- Japanese and Simplified Chinese READMEs; the English README is the single maintained entry point
- Redundant workflow diagrams from the READMEs
- Generated skill and instruction copies for unsupported or redundant agent platforms
- The agent-rule and skill synchronization scripts and their generated-file CI gate

## [0.4.0] - 2026-08-10

### Added
- Docker workflows for local development and multi-stage production builds
- Kiro support through a generated workspace `/clone-website` skill
- Complete generated workspace skills for Cline and Roo Code, including a Roo slash-command bridge
- Simplified Chinese and Japanese READMEs with the same onboarding and workflow guidance as the English documentation
- Contributor and security policies, including a private vulnerability-reporting path
- CI enforcement that generated agent rules and skills remain synchronized with their source files
- Compact pipeline diagrams and a static Star History chart in every README

### Changed
- Raised the project Node.js baseline to 24 across local development, CI, Docker, and contributor-facing documentation
- Refreshed Next.js to 16.3, React to 19.2.4, and related dependencies
- Updated `/clone-website` so later runs preserve existing pages and isolate routes, research, components, assets, and downloaders for each target
- Improved multi-origin and query/fragment planning with collision-resistant output namespaces and explicit route verification
- Redesigned README onboarding around the template workflow, Opus 5 recommendation, supported platforms, and community links
- Hardened the rule and skill generators for current platform schemas and deterministic output

### Fixed
- Gemini CLI command validation by adding the required name and flattening the prompt schema
- Cline and Roo Code invocation, frontmatter, and argument handling
- Next.js documentation resolution in generated agent rules
- Vulnerable framework dependencies and generated-file consistency checks

### Removed
- Aider from the officially supported-platform list because its current capabilities cannot run the complete browser and subagent workflow reliably; `.aider.conf.yml` remains available for loading general project context

### Security
- Documented responsible vulnerability disclosure through GitHub private vulnerability reporting
- Updated vulnerable dependencies to patched releases

## [0.3.1] - 2026-03-29

### Fixed
- `sync-agent-rules.sh` failing to resolve `@file` imports on Windows due to CRLF line endings — platform instruction files now correctly inline the Inspection Guide content

## [0.3.0] - 2026-03-29

### Added
- Multi-URL support for `/clone-website` — clone multiple sites in a single command with parallel processing and isolated output
- CI quality gates via GitHub Actions — automated lint, typecheck, and build on every push and PR
- `npm run typecheck` and `npm run check` scripts for local quality validation
- `.gitattributes` for cross-platform line ending normalization
- `.nvmrc` to pin Node.js 20 for contributor consistency

### Changed
- Streamlined PR template — removed redundant checklist items and screenshots section
- Improved project description and README — clearer use cases, limitations, and modern wording
- Refined documentation and agent rules across all platforms for clarity and consistency
- Fixed CRLF handling in `sync-skills.mjs` for reliable Windows operation

### Removed
- Outdated use case from README documentation

## [0.2.0] - 2026-03-28

### Added
- Multi-platform AI agent support: Claude Code, Codex CLI, OpenCode, GitHub Copilot, Cursor, Windsurf, Gemini CLI, Cline/Roo Code, Continue, Amazon Q, Augment Code, Aider
- Platform-specific instruction files and `/clone-website` skill for each supported agent
- `scripts/sync-agent-rules.sh` to regenerate platform instruction files from AGENTS.md
- `scripts/sync-skills.mjs` to regenerate `/clone-website` skill across all platforms
- GEMINI.md for Gemini CLI configuration
- Supported Platforms table in README
- "Updating for Other Platforms" documentation section in README

### Changed
- README now describes the project as multi-agent (Claude Code recommended, not required)
- AGENTS.md updated with sync script reminders

## [0.1.1] - 2026-03-28

### Added
- Bug report and feature request issue templates
- Pull request template with checklist
- CHANGELOG.md following Keep a Changelog format
- Package.json metadata (description, repository, homepage, keywords, engines)

### Fixed
- LICENSE copyright holder now attributed to JCodesMore

## [0.1.0] - 2026-03-28

### Added
- Initial template scaffold for website reverse-engineering with Claude Code
- `/clone-website` skill for full-site cloning pipeline
- `/build-from-spec` and `/customize` skills
- Parallel builder agents with git worktree isolation
- Chrome MCP integration for design token extraction
- Comprehensive inspection guide and project structure documentation
- Next.js 16 + shadcn/ui + Tailwind CSS v4 base scaffold
- MIT license
- README with badges, demo section, quick start, and star history

[Unreleased]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/JCodesMore/ai-website-cloner-template/releases/tag/v0.1.0

> **口径说明（2026-10-01 核准）**：`PAGE-SPECS/` 共 **22 个 .md** =
> **18 份路由规格** + **3 份公共文件**（`README.md` / `_components.md` / `_viewport-audit.md`）
> + **1 份模块总表**（`index.md`）。
> ⚠️ `dealers/index.md`、`fitment/index.md`、`insights/index.md`、`products/index.md`
> **是路由 `/dealers` 等页面的规格，不是模块索引** —— 不要按文件名把它们归成索引页。
> 早先出现过「21 份」「19 份」等错数，均已作废。
