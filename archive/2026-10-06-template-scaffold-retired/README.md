# 退休：克隆模板脚手架与元数据

归档日期：2026-10-06 ｜ 决策：**DEC-060**

## 归档内容

| 文件 | 原位置 | 为什么归档 |
|---|---|---|
| `package.json`（原样副本见下） | — | 不归档；**原文件是改元数据，不是搬走** |
| `Dockerfile` | 仓库根 | 克隆模板默认值，镜像名 `ai-website-cloner:latest` |
| `Dockerfile.dev` | 仓库根 | 同上（dev 变体） |
| `.dockerignore` | 仓库根 | 只服务于上面两个 Dockerfile |
| `docker-compose.yml` | 仓库根 | 同上；本地 WordPress 实验场用的是另一个 `local-wp/docker-compose.yml`，与本文件无关 |
| `LICENSE` | 仓库根 | **模板作者的 MIT**（`Copyright (c) 2025 JCodesMore`） |
| `CONTRIBUTING.md` | 仓库根 | 模板治理文档：指向 `master` 分支（本项目是 `main`）与**模板作者的 Discord 社区** |
| `SECURITY.md` | 仓库根 | 模板治理文档，正文自称 *"This project is a template rather than a versioned library"* |
| `bun.lock` | 仓库根 | **误跑的第二个锁文件**（见下） |

## 为什么归档而不是留用

### 1. `package.json` 元数据（本轮已改，不是归档）
原值全部指向模板：`name: ai-website-clone-template`、`version: 0.5.1`、
`author: JCodesMore`、`license: MIT`、`homepage`/`repository`/`bugs` 均指模板仓库。
**这些会出现在 npm 输出、编辑器、任何读 package.json 的工具里** —— 是这一批里最容易被看见的错误。

改成本项目自己的（9 个字段），并同步 `package-lock.json`
（5 行：`name`×2 + `version`×2 + `license`×1，**零依赖版本变动**）。

`license` 从 `"MIT"` 改成 **`"UNLICENSED"`**：项目是 `private: true` 的专有代码，
且 MIT 那一份是模板作者的许可，与本仓库无关。**删掉 LICENSE 文件不等于我们声明了许可**，
`UNLICENSED` 才是 npm 对「无许可/专有」的标准表示。

### 2. 根 Docker 文件
`ARCHITECTURE.md` §9.1 早就写着它们「仍有克隆模板遗留，**不能当生产方案**」；
`AGENTS.md` 也写着「不要把那些默认值当成既有能力」。

- **无人引用**：本地全部验证一直走 `.next/standalone` + `node server.js`，
  没有任何文档或脚本把根 `docker compose` 当运行方式（已 grep 确认）
- 目标部署层是 **OpenNext**（DEC-009），平台待定
- 任务卡 `2026-10-05-template-runtime-metadata-cleanup.md` 的前置条件写着
  「**不在决定前把 Node standalone 或模板 Docker 文件包装成生产架构**」

→ 所以**归档而不是重做**。等平台定了**新写**一份，不要照抄归档件。
（DEC-026 已加指针说明这个变化。）

### 3. `bun.lock` —— 两个锁文件不能共存
判定 npm 是权威、bun 是误跑，证据是**这个仓库自己的文档**：

| 证据 | 值 |
|---|---|
| `README.md` | `npm install` / `npm run dev` |
| `CONTRIBUTING.md` | `npm ci` |
| `AGENTS.md` | `npm run lint` / `typecheck` / `build` / `check` |
| `package.json` 的 `scripts` | 全是 `next` / `eslint` / `tsc`，**零 bun** |
| `packageManager` 字段 | **不存在** |
| CI | `.github/workflows/` **不存在** |

`package-lock.json` 里出现过 "bun" 字样只是传递依赖（`is-bun-module`、`bundle-name`），不是 bun 用法。
`bun.lock` 的 workspace 名还烤着 `ai-website-clone-template`，说明它从未随本项目更新过。

两个锁文件同时存在是**真实的复现风险**：`bun install` 会读 `bun.lock`，
可能与 `package-lock.json` 解析出不同版本树。

### 4. `CONTRIBUTING` / `SECURITY` / `LICENSE`
三者都是**模板治理文档**，内容对本项目**已经失真**（不是"风格不合"，是事实错误）：
`master` vs 我们的 `main`、模板作者 Discord、自称 template、版权归属 JCodesMore。

## 有意**保留**的（不是残留，别误删）

| 文件 | 保留理由 |
|---|---|
| `CHANGELOG.md` | 保留模板英文历史 + 中文说明，**用于对照上游**（前一任的明确决定） |
| `AGENTS.md` 尾部的模板原文块 | 同样是带围栏说明的「对照上游」保留（`> 以下为克隆模板自带说明…本项目的工作规范以本文上半部分为准`） |
| `components.json` | shadcn 配置，**`shadcn` 是 package.json 的直接依赖** |
| `.gitattributes` | 通用有用：LF 规范化、`.sh` 强制 LF、`.bat`/`.cmd` 强制 CRLF |
| `.nvmrc`(24) + `engines.node`(>=24) | 二者一致，且本机就是 Node 24 |

## 回滚

```bash
cd /Users/fkycoya/Documents/Code/WordpressWheelSIte
for f in Dockerfile Dockerfile.dev .dockerignore docker-compose.yml LICENSE CONTRIBUTING.md SECURITY.md bun.lock; do
  mv "archive/2026-10-06-template-scaffold-retired/$f" "$f"
done
git checkout -- package.json package-lock.json   # 元数据
```

⚠️ **回滚 `bun.lock` 前先想清楚**：它会让 `bun install` 与 `npm ci` 解析出两套依赖树。
本项目全程用 npm。

⚠️ **回滚 LICENSE 前先读 DEC-060** —— 那份 MIT 的版权人是模板作者，不是本项目。
