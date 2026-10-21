# 深圳峰徊独立站

Next.js 前端 + Headless WordPress 内容后端的 B2B 独立站。

## 开始开发

要求：使用仓库 `package.json` 声明的 Node.js 与 npm 版本。

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # 单测（node --test）
npm run build       # 生产构建
npm run check       # theme + test + lint + typecheck + build（提交前必跑）
```

## 文档入口

**唯一文档地图：[`docs/README.md`](docs/README.md)**

按问题直达：

| 我想知道 | 文件 |
|---|---|
| 代码现在实际是什么样 | [`docs/audit/CURRENT_ARCHITECTURE.md`](docs/audit/CURRENT_ARCHITECTURE.md) |
| 18 个模块缺什么、风险多大 | [`docs/audit/GAP_ANALYSIS.md`](docs/audit/GAP_ANALYSIS.md) |
| 目标架构与技术选型 | [`docs/architecture/TARGET_ARCHITECTURE.md`](docs/architecture/TARGET_ARCHITECTURE.md) |
| 先做什么 | [`docs/implementation/ROADMAP.md`](docs/implementation/ROADMAP.md) |
| 具体任务 | [`docs/implementation/TASKS.md`](docs/implementation/TASKS.md) |
| 怎么验收 | [`docs/implementation/TEST_PLAN.md`](docs/implementation/TEST_PLAN.md) |
| 页面施工规格 | [`PAGE-SPECS/`](PAGE-SPECS/README.md) |
| Agent 规则 | [`AGENTS.md`](AGENTS.md) ｜ [`CLAUDE.md`](CLAUDE.md) |
| 工程 Skills | [`SKILLS/README.md`](SKILLS/README.md) |

## 目录

| 路径 | 内容 |
|---|---|
| `src/` | 应用源码（`app/` 路由、`components/` UI、`content/` 类型化内容、`lib/` 服务） |
| `local-wp/` | WordPress schema 源（mu-plugins 进 git） |
| `deploy/` | frontend + wordpress 两套 Docker Compose / Nginx |
| `e2e/` `tests/` | Playwright E2E 与 Node 单测 |
| `scripts/` | 运维、导入、校验脚本 |
| `assets/` | 原始产品数据与图片（只读） |
| `resources/` `outputs/` | 调研输入与交付证据 |
| `work/` | 任务生命周期历史（新任务走 `docs/implementation/TASKS.md`） |
| `docs/` | 架构、审计、实施文档 |
| `archive/` | 已被替代的正本（不指导当前实现） |

## 2026-10-17 文档体系重构说明

文档已按《Next.js + Headless WordPress 企业级架构设计 V3.0》重构：
原 `ARCHITECTURE.md`、`PROJECT.md`、`STATUS.md`、`DECISIONS.md`、`DOCUMENTATION.md`
等正本已归档至 [`archive/2026-10-17-pre-v3-docs/`](archive/2026-10-17-pre-v3-docs/README.md)，
其内容已吸收进 `docs/audit/` 与 `docs/architecture/`。

旧文件与新文件的对应关系见归档目录的 README。
