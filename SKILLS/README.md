# SKILLS — 独立站开发技能库

本目录存放本项目专属的开发技能。**与全局技能库（`~/.config/alma/skills/`）
是两回事** —— 这里是项目资产，随仓库走。

- 建立日期：2026-10-01
- 来源：从兄弟项目 `深圳公司的独立站搭建`（`ChatGPT/深圳公司的独立站搭建/.agents/skills/`）迁移
- 规模：**19 个技能**（全部含 `SKILL.md`）｜ 3.2 MB
- 来源记录：`skills-lock.json`（含每个技能的 upstream 仓库与 computedHash）

> ⚠️ **这些是复制，不是软链。** 两个项目各自演进，
> **不要假定与兄弟项目同步**。需要更新时显式对比。

---

## 1. 五个分组

### 1.1 设计品味

决定视觉方向与「像不像高端站」。

| 技能 | 用途 |
|---|---|
| `design-taste-frontend` | 前端设计品味主技能（v2） |
| `design-taste-frontend-v1` | 上一版，保留对照 |
| `gpt-taste` | 模型侧的品味校准 |
| `stitch-design-taste` | Google Stitch 风格 |
| `high-end-visual-design` | 高端视觉设计 |
| `minimalist-ui` | 极简方向 |
| `industrial-brutalist-ui` | 工业粗野方向 |

> **本项目相关**：我们的基调是「石墨/钢灰 + 炉火琥珀」的工业质感。
> `high-end-visual-design` 与 `industrial-brutalist-ui` 最贴近，
> `minimalist-ui` 可作对照。

### 1.2 图像与还原

| 技能 | 用途 |
|---|---|
| `image-to-code` | 设计稿 → 代码 |
| `imagegen-frontend-web` | Web 界面配图生成 |
| `imagegen-frontend-mobile` | 移动端界面配图 |
| `impeccable` | 视觉精修（56 文件，最大的一个） |

> **本项目相关**：2757 张轮毂图是**真实产品照**，不是生成图。
> 这组技能用于**站点营销位**（首页 hero、工艺场景、能力配图），
> **不得用于生成轮毂产品图** —— 那会与真实型号数据对不上。

### 1.3 改造与迁移 ★ 本项目当前主力

| 技能 | 用途 |
|---|---|
| `redesign-existing-projects` | **改造既有项目** ← 去竞品化的主力 |
| `migrate-radix-to-base` | Radix → Base UI 迁移 |
| `shadcn` | shadcn/ui 组件 |
| `brandkit` | 品牌套件 |

> **本项目相关**：前端的核心工作是「把克隆自竞品 2nforged 的 UI 改造为丰怀的」。
> `redesign-existing-projects` 正是为此而装（见 `DEC-010`）。
> 另注意本仓库依赖里已经有 `@base-ui/react` —— `migrate-radix-to-base` 可能相关。

### 1.4 质量与安全

| 技能 | 用途 |
|---|---|
| `open-code-review` | 代码评审（默认模型已规范） |
| `open-code-review-delegate` | 评审委派 |
| `security-audit` | 安全审计 |
| `full-output-enforcement` | 强制完整输出（防空转） |

### 1.5 市场研究

| 技能 | 用途 |
|---|---|
| `seo-market-research` | SEO 与市场情报 |

---

## 2. 使用纪律

1. **不要绕过技能自造流程。** 技能里是验证过的命令与参数，
   自己发明一套通常更慢且更糟。
2. **`open-code-review` 的默认模型已规范为 `group/auto-deepseek-v4-flash`**
   —— 见技能内 `LOCAL-CONFIG.md`。别手动改成会撞套餐限额的直连模型。
3. **`security-audit` 需要 OS 级沙箱**（断网/干净 env/只读/限额）。
   本机若无 Docker/podman/lima，只能跑只读部分，**结论会降级为
   `needs_validation`** —— 这种降级必须如实标注，不得当成通过。
4. **技能是复制来的**，不带兄弟项目的 `.local-patch.md` 之外的本地改动历史。
   若要修改技能，**新建 `.local-patch.md` 记录偏离上游的内容与理由**。

---

## 3. 与全局技能的区别

| | `SKILLS/`（本目录） | `~/.config/alma/skills/` |
|---|---|---|
| 归属 | 本项目资产 | 跨项目通用 |
| 随仓库走 | ✅ | ❌ |
| 装载方式 | agent 显式读取 | Alma 自动注入 |
| 数量 | 19 | 100+ |

**放哪的判断**：只服务本项目的 → `SKILLS/`；任何项目都能用的 → 全局。

---

## 4. 变更记录

| 日期 | 变更 |
|---|---|
| 2026-10-01 | 从兄弟项目迁移 19 个技能 + `skills-lock.json`，建立本 README |
