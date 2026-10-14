# AGENTS.md — 丰怀锻造轮毂独立站

本文件是本仓库中所有 agent 的操作契约，适用于 Alma、Claude Code、Codex、
Cursor、OpenCode，以及任何读到它的人。动手之前先读完本文件。

**项目记录一律用中文书写。** `PROJECT.md`、`STATUS.md`、`DECISIONS.md`、
本文件，以及所有项目级文档，均使用中文。

---

## 1. 项目是什么

丰怀的 B2B 锻造轮毂厂商网站，形态是「静态优先的 Next.js 前端 + 无头
WordPress 内容后端」。

完整的背景、目标、范围与约束在 `PROJECT.md` 里，**不要在这里重复**。
先去读那份文件。

## 2. 规则优先级

当指令冲突时，越具体、越靠近当前工作目录的规则胜出：

```
全局 Hermes 规则
  ↓
本文件（项目 AGENTS.md）
  ↓
areas/<领域>/AGENTS.md
  ↓
具体任务要求
```

本文件以下的任何文件**只能追加约束，不能放宽约束**。

## 3. Session 开始 —— 渐进式加载上下文

只加载当前任务真正需要的，按以下顺序取，够用就停：

| 顺序 | 文件 | 为什么 |
|---|---|---|
| 1 | `AGENTS.md`（本文件） | 规则 |
| 2 | `PROJECT.md` | 项目是什么、不是什么 |
| 3 | `STATUS.md` | 现在做到哪了 |
| 4 | **`ARCHITECTURE.md`** | **模块怎么切、数据从哪来、谁不能依赖谁** |
| 4b | `ARCHITECTURE/page-architecture/` | 这一页给谁看、说明什么 |
| 4c | `ARCHITECTURE/tech-architecture/` | 数据从哪来、怎么渲染 |
| 5 | `areas/<领域>/AGENTS.md` | 领域专属规则（若你在某个领域内工作） |
| 6 | `work/active/` 中的任务文件 | 你实际在做的事 |
| 7 | 任务引用到的 `DEC-xxx` 条目 | 地基为什么长这样 |

**职责分工**：`ARCHITECTURE.md` 说「是什么形状」，`DECISIONS.md` 说「为什么
是这个形状」，`STATUS.md` 说「现在到哪了」。改架构要同时改前两者。

**不要一进项目就扫全仓库。** 那是上下文成本上的错误，不是勤勉。如果按上述
链路找不到需要的东西，写进 `STATUS.md` 的「未决问题」，而不是把整个项目读一遍。

## 4. Session 结束 —— 收尾清单

完成有意义的工作后，逐条走一遍。不适用的可跳过，但**清单本身不能跳过**。

1. `STATUS.md` —— 「当前重点 / 进行中 / 下一步」是否还符合实际情况？
2. `DECISIONS.md` —— 你是否做了将来会有人问「当初为什么」的决定？
3. `work/active/` → `work/completed/` —— 这个任务真的完成了吗？
4. `work/queued/` —— 这次工作是否产生了下一个任务？写下来。
5. `outputs/` —— 有没有可交付、可审核的成果？放对位置了吗？
6. `resources/` —— 你用过哪些原始资料？归档了吗？
7. `inbox/` —— 有没有留下未分类的东西？

产生了产出却没做收尾，等于这次 session 没干完。

## 5. 仓库布局

```
WordpressWheelSIte/
├── AGENTS.md            ← 本文件
├── PROJECT.md           ← 项目为什么存在（稳定）
├── STATUS.md            ← 项目现在在哪（易变）
├── DECISIONS.md         ← 为什么当初这样做
├── ARCHITECTURE.md      ← ★ 模块架构总纲（是什么形状）
├── ARCHITECTURE/        ← ★ 架构文档集
│   ├── README.md        ←   索引与阅读顺序
│   ├── page-architecture/  每一页要说明什么
│   └── tech-architecture/  每个模块怎么落地
│
├── assets/              ← ★ 只读资产：1349 型号 / 2757 图 / 语料库
├── SKILLS/              ← ★ 项目技能库（21 个，含项目工程工作流）
│
├── inbox/               ← 未分类入口。不是长期存储区。
├── areas/               ← 长期业务领域（按需创建）
├── work/
│   ├── queued/          ← 已定要做、尚未开始
│   ├── active/          ← 正在执行。保持这个目录短。
│   └── completed/       ← 已完成，含结果与未决问题
├── resources/           ← 工作输入：参考资料、调研、原始存档
├── outputs/             ← 可交付成果
└── archive/             ← 被取代的方案。搬过来，不要删。
```

**不要为了凑齐这张图去建目录。** `areas/` 与 `archive/` 出现在这里是因为
它们已经存在；新建目录必须当天就有内容，否则不建。

### 真正的应用代码在哪

这是一个可运行的 Next.js 仓库，不只是一套项目档案。前端已建好：

```
src/app/          路由树（App Router）
src/components/   React 组件；ui/ 存放 shadcn 原语
src/content/      类型化内容模块 —— 就是「接缝」，见 §7.1
src/lib/          工具函数
public/           图片、视频、SEO 资源
docs/             调研、方案、设计参考
```

## 6. 归档路由表 —— 东西该放哪

| 你手上的东西 | 放这里 |
|---|---|
| 五分钟前刚到的新需求 | 先放 `inbox/`，之后再分类 |
| 你还在调查的问题 | `resources/research/` |
| 竞品网页截图 | `resources/screenshots/` |
| 待评审的设计稿 | `outputs/` |
| 真实产品数据 / 图片 / 语料 | `assets/`（**只读**，不得就地改） |
| 开发技能（本项目专用） | `SKILLS/` |
| 上新模块 / 改模块边界 | **先改 `ARCHITECTURE.md`，再动手** |
| 给人读的审计报告 | `outputs/`（若用于记录仓库本身则放 `docs/`） |
| 关于**系统结构**的决定 | `docs/adr/` —— 架构级 |
| 关于**我们怎么干活**的决定 | `DECISIONS.md` —— 流程级 |
| 有人答应要做的任务 | `work/queued/` |
| 你此刻正在做的任务 | `work/active/` |
| 昨天被放弃的旧方案 | `archive/` |

`docs/` 目录已存在，存放的是模板自带文档、`next-wp` 调研系列、询盘架构方案、
空白页审计报告。它**早于本规范存在，因此本规范不重构它** —— 把 `docs/`
视为技术文档树，把根目录这几个文件视为项目档案。

## 7. 本项目特有的规则

以下规则让本仓库区别于一个通用 Next.js 项目。它们不是风格偏好。

### 7.0 ★ 上架门槛 —— 无图不上架，未确认不上架

用户 2026-10-01 定案。**这是产品决策，不是技术选择。**

```
1349 型号 → 1018 有图（上架）｜331 无图（先不上架）
```

- **无图型号不建页、不进目录、不进筛选结果、不进 sitemap。**
- **不删数据** —— 数据保留在 `assets/`，图到位后翻转 `hasImage` 即可放开。
- **不要把无图型号做成「占位页」** —— 空壳页比搜不到更伤经销商信任。
- 同理：**没有产品数据的产品线先出「能力页」，不列型号。**
- 规格必须来自**该型号的实际 variant 数据**，不得用系列通用值顶替（DEC-004）。

**违反这一条的典型错误**：为了让「型号总数看起来多」，把 331 个无图型号也
生成页面。这不是完整，是空壳。

### 7.1 内容接缝是契约

`src/content/*.ts` 以类型化数据承载全部文案，组件从不硬编码营销文字。这不是
约定，而是**无头 WordPress 抓取层将来接入的接缝**。**把一个模块替换成 API
调用，必须不需要改任何组件。** 如果某项改动会破坏这个性质，那这个改动就是错的。

类型定义在 `src/content/types.ts`。改类型等于改 WordPress 契约，必须记入
`DECISIONS.md`。

### 7.2 证据纪律 —— 未经确认的内容不上线

- 字符串 `PLACEHOLDER` 标记了尚未溯源的表述。**绝不要为了让构建通过而删掉
  标记。** 要么解决这个主张，要么删掉这个主张。
- `src/content/fitment.ts` 只发布宽/直径的*起始范围*。不要添加偏距、孔距、
  中心孔或载荷等级。每个车型在工程签字前都保持 `verified: false`；模板被
  构造成物理上无法把未确认值渲染成规格。
- `src/content/legal.ts` 是带草稿横幅与内联占位符的模板。**它需要律师，
  不是文案。**
- 数字未知时，正确做法是留可见占位或诚实省略 —— **绝不是编一个看起来合理的值。**

### 7.3 用设计令牌，不用 hex 值

配色统一定义在 `src/app/globals.css`。组件使用 Tailwind 别名
（`text-ink`、`text-steel`、`bg-soft`、`text-forge` 等）。
**组件内绝不出现裸 hex 值。**

### 7.4 动效是声明式的

滚动显现与视差由 `data-reveal` / `data-reveal-group` / `data-parallax-media`
属性驱动，逻辑在 `src/components/site-motion.tsx`。**不要在页面组件里手写
IntersectionObserver。** 两个效果都必须保持挂在 JS 添加的 `motion-ready`
类之下，以保证无 JS 时内容仍可见 —— 违反这一条曾导致全文空白的事故。

### 7.5 资源使用 `hasRender` 模式

目前没有任何真实照片。组件检查标志位后渲染品牌占位图，而不是去请求一个不存在
的文件 —— 不产生破图，也不产生无谓的 404 请求。资源到位后翻转标志位，
**不要删掉兜底逻辑**。

### 7.6 部署走 OpenNext，且不得改成静态导出

- **部署层是 OpenNext**（见 DEC-009）。具体目标平台待定。
- **严禁把 `next.config.ts` 改成 `output: "export"`。** 纯静态导出下
  `/api/inquiries` 完全不可用 —— 那等于物理上废掉询盘系统，与本项目的业务
  定位直接冲突。
- 根 `Dockerfile` / `docker-compose.yml` / `Dockerfile.dev` / `.dockerignore`
  已**归档**到 `archive/2026-10-06-template-scaffold-retired/`（DEC-060）——
  它们是克隆模板的默认值（镜像名 `ai-website-cloner:latest`），与本项目无关。
  生产部署文件需在 OpenNext 平台确定后**新写**，不要照抄归档件。
- 仓库里**目前没有任何 OpenNext 依赖或配置**（`@opennextjs/*`、`wrangler`
  均不存在）。

### 7.7 `NEXT_PUBLIC_APP_URL` 是静默陷阱

`NEXT_PUBLIC_APP_URL` 会被烤进构建产物，并静默改写全站的 canonical、OG 标签
与 sitemap 条目。在取值错误的机器上构建出的产物，**看起来完全正常，但哪里
都是错的**。跨机构建部署必须逐项比对烤入值，不能只检查页面是否 200。任何部署
工作之前，先读 `DEC-005`。

### 7.8 前端是克隆来的，不得把竞品内容留在产物里

本仓库前端克隆自竞品 [2nforged.com](https://2nforged.com)（见 DEC-010）。
**保留**版式、信息架构与交互模型是允许的；**搬运**文案、图片、视频、品牌标识
是禁止的。任何页面改动都要问一句：**这段内容是我的，还是从竞品抄来的？**

上线前的硬门槛是「0 处竞品残留」—— 扫描 `2nforged`、竞品图片路径
（`/wp-content/themes/2nforged-theme/...`）、竞品品牌名与专有页面标题。

同时注意：**竞品的页面结构是按竞品的业务切的**，丰怀的产品线不同，
所以信息架构本身也需要重新判断，不是「只换字」。前端业务改造是一项独立工作项。

### 7.9 macOS 专有工具不得进入服务器

本地构建步骤可能用到 `sips` 与 `cwebp`。二者在缺失时会静默降级，产出一个
「构建成功但输出更差」的结果。把依赖 macOS 的步骤留在本地；服务器只跑校验和
`next build`。

## 8. 与操作者的协作方式

- 与用户对话用中文，项目文档也用中文。**不要产生中英混杂的项目记录。**
- **不可逆或对外的动作，先停下问**：删除有历史价值的内容、强推（force push）、
  发布上线、花钱、向真实地址发信、改动 DNS。
- **优先 `archive/` 而非删除。** 将来可能被问起的东西，搬走，别删。
- **未经明确授权，不要 commit，不要 push。** 报告已暂存的内容，然后等指令。
- 任务歧义会改变结果时，问；不会改变结果时，自己选，并记录下来。

## 9. 一次改动的「完成」定义

代码能跑不等于完成。完成意味着：

1. `npm run lint`、`npm run typecheck` 干净。
2. `npm run build` 成功。
3. 内容接缝性质（§7.1）依然成立。
4. 没有引入新的 `PLACEHOLDER`，也没有发布未确认的规格。
5. `STATUS.md` 反映新状态。
6. 若做了决定，已记入 `DECISIONS.md`。

## 10. Spec-Driven Develop 与工程工作流

非简单任务先使用项目级 Spec-Driven Develop 正本
`SKILLS/spec-driven-development/SKILL.md`，发现入口为
`.agents/skills/spec-driven-development/`。需求不明确时使用
`SKILLS/deep-discuss/SKILL.md`；用户要求审查时使用
`SKILLS/review-spd/SKILL.md`。`SKILLS/fenghuai-engineering-workflow/SKILL.md`
是项目适配层，负责 TDD、诊断、页面/内容/安全门禁，不与 Spec-Driven Develop 竞争。

所有 agent 必须遵循：

1. Phase 0–2 先捕获意图、分析事实与风险、完成用户确认；
2. Phase 3 生成规格、任务树、依赖、S.U.P.E.R、Delivery Batch 和 GitHub Full 映射；
3. Phase 4 将当前状态写入 `docs/progress/MASTER.md`；
4. Phase 5 只有用户明确确认后执行，按互不相交文件集的 worktree 泳道推进，最多 4 条；
5. Phase 6 归档规格、遥测、Review SPD、验证证据和未决项。

当前项目模式固定为 `GITHUB_FULL`：Issue 是任务事实，Milestone 是阶段聚合，Project 是跨阶段看板，
Delivery Batch/批次 PR 是集成边界；本地现行任务与 Issue 必须双向链接。历史
`work/completed/` 和 `archive/` 不补造 Issue/PR、不重写结论。Project、worktree、PR 自动关联
等未实测能力必须标 WARN，不得伪造完成。

以下原则永远优先：

- 所有项目记录用中文；
- Issue 生命周期仍走 `work/queued → work/active → work/completed`；
- 页面规格、架构、决定、状态与跨 session 索引放在规定位置；
- 只在本次授权范围内创建 GitHub 资源，创建前先核对目标、权限和重复项；
- 不自动 commit、push、deploy、改 DNS、真实发信、付费或创建批次 PR；
- 项目完成门禁、内容接缝、证据纪律、无图不上架和发布门槛不得被通用流程放宽。

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Website Reverse-Engineer Template

> 以下为克隆模板自带说明，保留原文以便对照上游。本项目的工作规范以本文
> 上半部分为准。

## What This Is
A reusable template for reverse-engineering any website into a clean, modern Next.js codebase using AI coding agents. The Next.js + shadcn/ui + Tailwind v4 base is pre-scaffolded — just run `/clone-website <url1> [<url2> ...]`.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React (default — will be replaced/supplemented by extracted SVGs)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Vercel

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **No personal aesthetic changes during emulation phase** — match 1:1 first, customize later
- **Real content** — use actual text and assets from the target site, not placeholders
- **Beauty-first** — every pixel matters

## Project Structure
```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons as React components
  lib/
    utils.ts        # cn() utility (shadcn)
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target site
  videos/           # Downloaded videos from target site
  seo/              # Favicons, OG images, webmanifest
docs/
  research/         # Inspection output (design tokens, components, layout)
  design-references/ # Screenshots and visual references
scripts/            # Asset download scripts
.agents/
  skills/
    clone-website/  # Canonical cross-agent cloning workflow
.claude/
  commands/
    clone-website.md # Thin Claude Code invocation bridge
```

## Agent Workflow
- Edit `.agents/skills/clone-website/` for cloning-workflow changes. It is the canonical skill used by Codex, Cursor, and OpenCode.
- Keep `.claude/commands/clone-website.md` as a thin Claude Code bridge to the canonical skill; do not duplicate the workflow there.
