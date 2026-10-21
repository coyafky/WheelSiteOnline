# 计划：轮毂管理后台 —— 图片预览 + PCD / 宽度可维护

状态：**待用户批准**（尚未写一行代码）
起草：2026-10-18 ｜ 基线：worktree `chief-partridge` @ `ce6a942` ｜ 线上 WP 容器 `fh-wp`（实际加载 `local-wp/wp-data/wp-content/mu-plugins/`）

---

## 一、需求（用户已确认，四项全选）

| # | 需求 | 现状（实测） |
|---|---|---|
| R1 | **列表页每行直接看到 PCD / 宽度** | ❌ 没有。「规格/图片」列只有计数 `11 / 6`，看不到具体值 |
| R2 | **单独一个选项管理入口** | ❌ 不存在 |
| R3 | **编辑页规格表里新增一行规格** | ⚠️ 按钮**已有**（`#fh-add-variant`「新增规格」），但需可用性加固 |
| R4 | **PCD / 宽度做成可维护的下拉选项** | ❌ 两者都是自由文本输入（无 `datalist`、无 `select`） |

**另有用户明说的第 0 项**：
> 「轮毂型号这个模块没有预览到图片」

| # | 需求 | 现状（实测） |
|---|---|---|
| **R0** | **「轮毂型号」列表页要能看到图片预览** | ❌ 7 个列（发布状态 / 图权 / 供货 / 规格核验 / 候选分 / 规格÷图片 / 商标）**全是文字徽章，零缩略图**。当前列集里**没有** `thumbnail`、`fh_image` 渲染的是「图权」文字徽章 |

---

## 二、关键侦察结论（决定方案形态）

### 2.1 数据形态
- 规格存在 **`wp_postmeta.variants_json`**（JSON 数组），每行：
  `{production_code, diameter, width(数字), pcd(字符串), offset, center_bore, finish, approved}`
- 图片：**`gallery_media_ids`**（逗号分隔附件 ID，首张 = 主图）+ 派生字段 **`hero_media_id`**
- 覆盖率：**138 个已发布型号，138 个都有 hero 且指向有效图片** → R0 可 100% 落地

### 2.2 「轮毂尺寸」分类法就是现成范式
- `wheel_diameter`（taxonomy，12–20 寸 9 个 term，`show_admin_column: true`）
- `wheel_process`（工艺，从唯一正本 `fh_wheel_process_options()` 播种）
- 播种模式：`get_option('fh_wheel_terms_seeded')` 只建一次 + `term_exists()` 去重
- **PCD 与宽度可直接复制这套**（`hierarchical: false`、`public: false`、`show_ui: true`）

### 2.3 真实数据已经脏了（R4 的硬理由）
实测 PCD 取值 17 种，其中：
- `5*114.3` `4*100` `5*112` …（正常）
- **`5*112??`（2 条，问号是脏字符）**
- **`4/5*100`（3 条，双孔距写法）**
- **`8*100, 8*114.3` / `5*112, 5*114.3`（逗号并列）**
- 宽度：`6 / 6.5 / **6.6** / 7 / 7.5 / 8 / **8.25** / 8.5 / 9 / 9.5 / 10.5` → **6.6 与 8.25 是可疑值**（其余都落在 0.5 网格）

→ **做成下拉不只为了省事，是为了止血**：自由文本正持续制造前台解析不了的脏值。

### 2.4 前端**本来就能容忍**不规则 PCD（重要）
`src/lib/wheels/normalize.ts` 的 `normalizePcds()` 会：
去掉 `（）()`、把 `×*` 统一成 `x`、把 `，、` 统一成 `,`、按 `,` 和 `-` 拆组、支持 `4/5*100` 这种斜杠并集，并丢弃 lug 不在 3–10 的组。
`pcdKey()` 取第一个结果当 URL 参数，`pcdLabel()` 把 `x` 显示成 `×`。

→ **所以脏值的真实后果是「静默」**：`5*112??` 大概率能解析出 `5x112`，但**它是个陷阱** —— 下拉化之后如果照抄脏值当选项，脏值会被「合法化」并扩散。
→ **结论：选项的初始播种值必须做规范化清洗，不能原样导入。**

### 2.5 落盘链路（必须遵守）
```
local-wp/mu-plugins/*.php        ← 唯一源（进 git、有 diff）
        ↓  python3 scripts/sync-mu-plugins.py
local-wp/wp-data/wp-content/mu-plugins/   ← 运行时（gitignored）
```
- 实测：脚本存在，主仓库内**源与运行时 0 差异**（已同步）
- ⚠️ **worktree(`ce6a942`) 的插件显著落后于主仓库(`961762e`)**：主仓库多出 `FH_WHEEL_SCHEMA_VERSION`、工艺唯一正本注释、`fenghuai-pages.php`、`fenghuai-operations-alerts.php` 等

**决策点 D1：改哪一份？** 见 §五。

---

## 三、方案

### 3.1 R0 · 列表页加缩略图列
- 在 `fh_wheel_admin_columns()` 的「型号」之后插入 `fh_thumb = '图片'`
- 在 `fh_wheel_admin_column_content()` 加 `case 'fh_thumb'`：
  - 读 `hero_media_id`（回退 `gallery_media_ids` 首项）
  - `wp_get_attachment_image($id, [56,56])` 输出缩略图
  - 无图时输出占位（`—`）
- 建议同时把「图权」徽章与缩略图并排（一眼看出「图对不对 / 图是否已核准」）
- 可选：点多张图时角标 `3`

### 3.2 R1 · 列表页显示 PCD / 宽度
- 新增两列或在「规格/图片」列内展开：
  - `fh_pcd = 'PCD'`：列出该型号所有行的去重 PCD 值
  - `fh_width = '宽度'`：列出所有宽度（升序、去重、带 `"` 单位）
- 截断策略：>3 个值时显示前 3 个 + `+N`
- ⚠️ 读 `variants_json` 每行解析，注意**列表页性能**（138 行 × 每行 JSON 解析，可接受但要避免 N+1 查 meta）

### 3.3 R4 · PCD / 宽度分类法（可维护下拉）
- 注册两个 taxonomy：
  - `fh_wheel_pcd`（PCD）
  - `fh_wheel_width`（宽度）
- 注册参数照抄 `wheel_diameter`：`public:false / show_ui:true / show_admin_column:true / show_in_rest:true / hierarchical:false`
- **播种**（只跑一次，带清洗）：
  - PCD：从现有 `variants_json` 抽出 → **经规范化函数清洗** → 去重 → 建 term
  - 宽度：从现有取值去重 → 建 term；**`6.6` / `8.25` 需人工裁决**（保留还是并入 6.5/8）
- 后台「轮毂型号 → PCD / 宽度」菜单自动出现，可自己加新值
- 编辑页把自由文本 `input` 换成 `datalist`（**保留手输能力**，避免一次性锁死运营动作）

**决策点 D2：要不要把 `variants_json` 换成读 taxonomy？**
- **方案 A（推荐，低风险）**：只做「字典 + 列表展示」，`variants_json` 结构**不动** → 前端零影响、零契约改动
- **方案 B（彻底）**：把 pcd/width 改成 taxonomy 关联 → 需改前端读法 + `npm run contract:check` + 数据迁移，风险大
- **建议先 A**，等字典稳定运行一段时间再讨论 B。

### 3.4 R3 · 编辑页「新增规格」加固
按钮已存在，需验证并加固：
- [ ] 新建型号页（`post-new.php?post_type=wheel_model`）点「新增规格」能插行 —— 实测表格存在（0 行）、按钮存在，**待真点验证**
- [ ] 新行 `width` 的 `min/max`（4–14）与 `step 0.1` 是否合理
- [ ] PCD 列换成 `datalist` 后仍可自由输入
- [ ] 保存后 `variants_json` 正确落库（含新增行）

### 3.5 R2 · 选项管理入口
有两条路（**决策点 D3**）：

| 路线 | 做法 | 优 | 劣 |
|---|---|---|---|
| **D3-a（推荐）** | 用 taxonomy 自带管理页（`edit-tags.php?taxonomy=fh_wheel_pcd`），自动出现在「轮毂型号」菜单下 | 零 UI 代码、支持增删改、`term_exists` 去重、与「轮毂尺寸/工艺」一致 | 无法自定义帮助文案 |
| **D3-b** | 仿 `fenghuai-inquiries.php:1724` 的 `add_menu_page` 自建设置页 | 可加说明、可加「批量导入/清洗」按钮 | 要写全 CRUD UI |

---

## 四、文件改动清单（预估）

| 文件 | 改动 |
|---|---|
| `local-wp/mu-plugins/fenghuai-wheels.php` | ① 新增 `fh_thumb` / `fh_pcd` / `fh_width` 三列（`fh_wheel_admin_columns` + `fh_wheel_admin_column_content`）② 注册 `fh_wheel_pcd` / `fh_wheel_width` 两个 taxonomy + 清洗播种 |
| `local-wp/mu-plugins/fenghuai-wheel-authoring.php` | PCD / 宽度输入改 `datalist`（从 taxonomy 取值填充）；「新增规格」加固 |
| `scripts/sync-mu-plugins.py` | 无需改，跑一次同步 |
| （可选）`src/lib/wheels/*` | **仅在选 D2-B 时才动** |

⚠️ **不新增 mu-plugin 文件**：新增文件要同步、要注册、且 `wp-data/` 那份是派生产物 —— 改动集中在既有两个文件里更安全。

---

## 五、决策点（**需你拍板**）

### D1 · 改哪一份代码库？
- **D1-a（推荐）**：在**主仓库** `/Users/fkycoya/Documents/Code/WordpressWheelSIte`（分支 `codex/full-site-current-20261012`）改 —— 它是唯一连着运行时 WP 容器与 :3000 的库，插件不落后
- **D1-b**：在本 worktree（`chief-partridge`）改 —— 但**必须先 rebase / merge 主仓库**，否则会把主仓库已有的新特性（schema version、工艺正本、pages 插件）**倒退掉**

### D2 · `variants_json` 是否改结构？
- **D2-A（推荐）**：不动结构，只加字典与展示 → 前端零影响
- **D2-B**：改成 taxonomy 关联 → 风险大，需全链路回归

### D3 · 管理入口形态？
- **D3-a（推荐）**：用 taxonomy 自带页
- **D3-b**：自建设置页

### D4 · 脏值如何处理？
- `5*112??`（2 条）→ 清洗成 `5*112` 还是保留？
- `4/5*100`（3 条）→ 保留双孔距，还是拆成 `4x100` + `5x100`？
- 宽度 `6.6` / `8.25` → 保留、还是并入 `6.5` / `8`？
- — 这些**直接影响前台筛选结果**，建议保留原值但在后台标出来，由你逐条裁决

---

## 六、验证计划

| 项 | 方法 | 通过标准 |
|---|---|---|
| R0 缩略图 | 打开 `edit.php?post_type=wheel_model` 截图 | 每行显示对应型号的图；138/138 有图 |
| R1 PCD/宽度 | 同页读列 | 与 DB 里该型号 `variants_json` 一致 |
| R3 新增规格 | **ego-browser 真点**「新增规格」→ 填 PCD+宽度 → 保存 | `variants_json` 新增一行且落库 |
| R4 下拉 | 编辑页检查 `datalist` 选项 = taxonomy terms | 下拉能选到新加的值 |
| R2 管理入口 | 在 PCD 页新增一个值 → 回编辑页 | 新值出现在下拉里 |
| 保存链路 | `python3 scripts/sync-mu-plugins.py --check` | 0 差异 |
| 回归 | `npm run contract:check` + `npm run typecheck` | 全过（仅 D2-B 时才有实质风险） |
| 前台回归 | `/products/wheels` 筛选 + 抽 3 个详情页 | 全 200，PCD 筛选结果数不变 |

---

## 七、风险

1. **列表页 N+1**：每行解析 `variants_json` + 取附件图 → 138 行可接受，但要用 `_prime_post_caches` 或缓存 meta
2. **`variants_json` 与 taxonomy 双源**：若只把 taxonomy 当下拉字典、值仍存 JSON，则两者可能脱节 → 需明确「taxonomy 是候选集，JSON 是事实」，并在管理页提供「JSON 里出现过但字典里没有」的对照（**这正是清洗现有脏值的入口**）
3. **`show_in_rest: true`**：新 taxonomy 会出现在 REST，但 `public: false` 不泄漏；需确认不影响 Next 侧
4. **worktree / 主仓库分叉**：D1 选错会把主仓库新特性倒退（已实测 worktree 落后 ~79 行 diff）
5. **不动 `variants_json` 结构**（D2-A）可把风险压到几乎为零

---

## 八、执行顺序（批准后）

1. 定 D1/D2/D3/D4
2. 改 `fenghuai-wheels.php`：taxonomy 注册 + 播种（清洗）
3. 改 `fenghuai-wheels.php`：三列（缩略图 / PCD / 宽度）
4. 改 `fenghuai-wheel-authoring.php`：datalist + 新增规格加固
5. `python3 scripts/sync-mu-plugins.py` 同步进容器
6. ego-browser 真机验收（§六 全表）
7. 出报告 + 截图存档

---

## 九、明确不做

- 不改 `variants_json` 结构（除非选 D2-B）
- 不新增 mu-plugin 文件
- 不动前端 `src/lib/wheels/*`（除非选 D2-B）
- 不删任何现有列（只增列）
- 不自动清洗数据库里的脏值（**只报告，由你裁决**）
