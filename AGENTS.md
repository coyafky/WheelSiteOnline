# AGENTS.md — 丰怀锻造轮毂独立站

本文件是本仓库中所有 agent 的操作契约，适用于 Alma、Claude Code、Codex、
Cursor、OpenCode，以及任何读到它的人。动手之前先读完本文件。

**项目记录一律用中文书写。** `docs/architecture/TARGET_ARCHITECTURE.md`、`docs/implementation/TASKS.md`、`docs/adr/`、
本文件，以及所有项目级文档，均使用中文。

---

## 1. 项目是什么

丰怀的 B2B 锻造轮毂厂商网站，形态是「静态优先的 Next.js 前端 + 无头
WordPress 内容后端」。

完整的背景、目标、范围与约束在 `docs/architecture/TARGET_ARCHITECTURE.md` 里，**不要在这里重复**。
先去读那份文件。

## 2. 规则优先级

当指令冲突时，越具体、越靠近当前工作目录的规则胜出：

```
全局 Hermes 规则
  ↓
本文件（项目 AGENTS.md）
  ↓
当前路径下最近的 AGENTS.md
  ↓
具体任务要求
```

本文件以下的任何文件**只能追加约束，不能放宽约束**。

仓库级项目事实各自只有一个正本。开始文档或架构工作前先查 `docs/README.md`，找到对应正本后更新它；只有主题长期有效且现有正本确实无法承载时才新建文档，并同步文档地图。不得在 README、PROJECT、STATUS、DESIGN、ARCHITECTURE 或任务记录中复制另一份“最新版”。

## 3. Session 开始 —— 渐进式加载上下文

只加载当前任务真正需要的，按以下顺序取，够用就停：

| 顺序 | 文件 | 为什么 |
|---|---|---|
| 1 | `AGENTS.md`（本文件） | 规则 |
| 2 | `docs/architecture/TARGET_ARCHITECTURE.md` | 项目是什么、不是什么 |
| 3 | `docs/implementation/TASKS.md` | 现在做到哪了 |
| 4 | `docs/audit/CURRENT_ARCHITECTURE.md` 与 `ARCHITECTURE/README.md` | 模块怎么切、数据从哪来、如何阅读架构 |
| 5 | `PAGE-SPECS/`、领域规则或具体任务 | 只读本次改动相关部分 |
| 6 | 任务引用到的 `DEC-xxx` 条目 | 仅在需要理解既有取舍时打开 |

**职责分工**：`docs/audit/CURRENT_ARCHITECTURE.md` 说「是什么形状」，`docs/adr/` 说「为什么
是这个形状」，`docs/implementation/TASKS.md` 说「现在到哪了」。改架构要同时改前两者。

**不要一进项目就扫全仓库。** 那是上下文成本上的错误，不是勤勉。如果按上述
链路找不到需要的东西，写进 `docs/implementation/TASKS.md` 的「未决问题」，而不是把整个项目读一遍。

## 4. Session 结束 —— 收尾清单

完成有意义的工作后，按本次实际改动检查下列项目。不适用的跳过；小而局部的改动不为了填清单而造新文档。

1. `docs/implementation/TASKS.md` —— 「当前重点 / 进行中 / 下一步」是否还符合实际情况？
2. `docs/adr/` —— 你是否做了将来会有人问「当初为什么」的决定？
3. `work/active/` → `work/completed/` —— 这个任务真的完成了吗？
4. `work/queued/` —— 这次工作是否产生了下一个任务？写下来。
5. `outputs/` —— 有没有可交付、可审核的成果？放对位置了吗？
6. `resources/` —— 你用过哪些原始资料？归档了吗？
7. `inbox/` —— 有没有留下未分类的东西？

任务、报告或项目事实发生变化时，更新对应正本；不要为了没有产生的新内容创建目录或占位文档。

## 5. 仓库布局

```
WordpressWheelSIte/
├── AGENTS.md            ← 本文件
├── CLAUDE.md            ← Claude Code 目录与流程入口
├── README.md            ← 项目入口与文档导航
│
├── docs/                ← ★ 唯一文档树（入口 docs/README.md）
│   ├── README.md            ← 文档地图（唯一的导航入口）
│   ├── audit/               ← 从代码还原的现状与差距（只写"是什么"）
│   │   ├── CURRENT_ARCHITECTURE.md
│   │   └── GAP_ANALYSIS.md
│   ├── architecture/        ← 目标架构与专项设计（只写"应该是什么"）
│   ├── implementation/      ← 路线 / 任务 / 验收
│   ├── adr/                 ← 架构决策记录
│   ├── research/            ← 调研输入（证据，不是规则）
│   └── runbooks/            ← 运维手册
│
├── PAGE-SPECS/          ← 页面施工规格
│
├── assets/              ← 只读产品数据、图片与语料
├── SKILLS/              ← 项目技能库；按 SKILLS/README.md 选择
│
├── inbox/               ← 未分类入口。不是长期存储区。
├── work/
│   ├── queued/          ← 已定要做、尚未开始
│   ├── active/          ← 正在推进且有明确下一步的任务
│   └── completed/       ← 已完成，含结果与未决问题
├── resources/           ← 工作输入：参考资料、调研、原始存档
├── outputs/             ← 可交付成果
└── archive/             ← 被取代的方案。搬过来，不要删。
```

**不要为了凑齐这张图去建目录。** 新建目录必须当天就有实际内容，否则不建。

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
| 上新模块 / 改模块边界 | **先改 `docs/audit/CURRENT_ARCHITECTURE.md`，再动手** |
| 给人读的审计报告 | `outputs/`（若用于记录仓库本身则放 `docs/`） |
| 关于**系统结构**的决定 | `docs/adr/` —— 架构级 |
| 关于**我们怎么干活**的决定 | `docs/adr/` —— 流程级 |
| 有人答应要做的任务 | `work/queued/` |
| 你此刻正在做的任务 | `work/active/` |
| 昨天被放弃的旧方案 | `archive/` |

`docs/` 是技术文档树，包含 ADR、专题研究、架构方案和审计；根目录核心文件负责项目档案。归档的克隆模板说明见 `archive/2026-10-13-template-agent-instructions.md`，不再指导本项目。

## 7. 本项目特有的规则

以下规则让本仓库区别于一个通用 Next.js 项目。它们不是风格偏好。

### 7.0 发布资格

产品和内容只有在真实资料、图权/主体确认与所需规格审核完成后才能公开；无图、未确认内容不进入公开页面、筛选或 sitemap。具体业务边界以 `docs/architecture/TARGET_ARCHITECTURE.md` 和对应 Page SPEC 为准，不在本文件维护会过期的数量副本。

### 7.1 内容接缝是契约

展示层只消费稳定的类型化内容，不读取 WordPress 原始响应；更换数据源不能要求重写组件。类型定义在 `src/content/types.ts`；影响持久接口/业务取舍时记录决定。数据流正本见 `docs/audit/CURRENT_ARCHITECTURE.md`。

### 7.2 证据纪律 —— 未经确认的内容不上线

- 字符串 `PLACEHOLDER` 标记了尚未溯源的表述。**绝不要为了让构建通过而删掉
  标记。** 要么解决这个主张，要么删掉这个主张。
- Fitment 只能公开已核实的适配字段；法律文案需专业审核。对应事实和页面门槛分别以 `docs/architecture/TARGET_ARCHITECTURE.md` 与 Page SPEC 为准。
- 数字未知时，正确做法是留可见占位或诚实省略 —— **绝不是编一个看起来合理的值。**

### 7.3 用设计令牌，不用 hex 值

颜色令牌定义在 `src/app/globals.css`；组件只用项目语义 token，不写裸 hex。当前视觉规则以 `src/theme/` 为准。

### 7.4 动效是声明式的

滚动显现与视差由 `data-reveal` / `data-reveal-group` / `data-parallax-media`
属性驱动，逻辑在 `src/components/site-motion.tsx`。**不要在页面组件里手写
IntersectionObserver。** 两个效果都必须保持挂在 JS 添加的 `motion-ready`
类之下，以保证无 JS 时内容仍可见 —— 违反这一条曾导致全文空白的事故。

### 7.5 资源使用 `hasRender` 模式

媒体须按当前内容契约检查批准状态和可渲染 URL；缺失或未批准时使用已有兜底，
不请求不存在的文件、不产生破图。素材到位后更新对应内容状态，**不要删掉兜底逻辑**。

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

## 9. 代码改动的完成定义

代码能跑不等于完成。完成意味着：

1. 验收信号按风险选择：文档只做链接/引用和补丁检查；小范围代码改动运行相关检查；公共接缝、跨模块集成、路由/构建或发布切片再运行完整 lint、typecheck、build 与对应业务验证。
2. 内容接缝性质（§7.1）依然成立。
3. 没有引入新的 `PLACEHOLDER`，也没有发布未确认的规格。
4. `docs/implementation/TASKS.md` 与任务文件反映实际状态；若形成持久取舍，记录在对应决策正本。

纯文档整理不运行无关应用测试；检查文档链接、引用目标、重复正本和归档关系，并运行 `git diff --check`。

## 10. 工程工作流技能

新功能、缺陷修复、重构、规格整理、任务拆分、代码评审和 session 复盘，参考项目
技能 `SKILLS/fenghuai-engineering-workflow/SKILL.md`。按风险与复杂度选择步骤，不要求
每项工作都创建完整规格、子任务或独立审查。

该技能参考规格、纵向切片、TDD、证据化诊断、双轴评审与复盘方法，
但以下本项目原则永远优先：

- 所有项目记录用中文；
- 项目任务生命周期走 `work/queued → work/active → work/completed`；
- 页面规格、架构、决定与状态继续放在本文件规定的位置；
- 不得因为通用技能的默认动作而自动 commit、push、deploy 或创建外部 Issue；
- 内容接缝、证据纪律和发布门槛不得被通用流程放宽；代码门禁按改动相关性执行。

**Agent 必须按此顺序工作**：先读项目规则、项目范围和当前状态；查文档地图定位唯一正本；按任务选择 Skills 中必要步骤；实施后只同步确实变化的正本、任务状态和决定。不得因为某个历史方案、完成记录或参考材料写得详细，就把它当成新的规范或当前架构。

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
