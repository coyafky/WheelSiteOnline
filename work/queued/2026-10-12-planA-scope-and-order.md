# 方案甲 · 定稿：实测修正后的范围与顺序

- **状态**：待用户确认范围，尚未实施；进入队列等待决定
- **日期**：2026-10-12
- **用户已拍板**：**方案甲（把本地区块搬进 WordPress）**
- **前置**：`archive/superseded-work-plans/2026-10-12-content-ownership-then-locale-plan.md`（归属调研；本计划已更新其执行范围）

---

## ⚠️ 上一版计划的三处估算，实测后必须修正

### 修正 1：**`/products/wheels/forged` 不是「非 WP 页面」**

它**已经有 WP 适配器**（`src/lib/wordpress/forged-wheel.ts`），和 `flow-formed.ts` 一对。

| 事实 | 实测 |
|---|---|
| 适配器存在 | ✅ `forged-wheel.ts` + `flow-formed.ts` |
| 接 locale 了吗 | ❌ **两者都没有**（`grep getLocale` 零命中）|
| 搬运内容了吗 | ❌ 仍是 `...forgedWheelPage` 本地展开 |
| 页面 import | `@/lib/wordpress/forged-wheel` ← **不是直接 import content** |

→ **它们属于「适配器已存在但没接线」，不是「要新建 WP 归属」** —— 与 `/insights` 同型，不是同 `/contact`。
→ **这 2 页的迁移成本远低于我上一版的估算。**

### 修正 2：**`src/content/wheel-catalogue.ts` 的 69,162 行全是数据，不是文案**

```
统计：1349 型号（上架 1073 / 未上架 276）｜ 3485 个可下单配置
「自动生成，禁止手改」｜ 数据源 assets/wheel-data/WHEEL-CATALOG-ALL.json
```

→ **它不该搬进 WP**，也不该按文案翻译。型号/尺寸/PCD/ET/中心孔是**事实数据**。
→ 我上一版把它列进 12 个待迁页是**错的**（会误导成"要写 5000 条词条"）。

### 修正 3：**真实文案总量是 ~430 条，不是我估的 500–800**

实测（剔注释、剔路径、剔纯 slug，只留 >10 字符人类可读串）：

| content 模块 | 唯一文案 |
|---|---:|
| forged-wheel | 57 |
| fitment | 55 |
| tools | 54 |
| dealer-programs | 48 |
| flow-formed-wheels | 48 |
| custom-development | 45 |
| contact | 39 |
| bolt-patterns | 37 |
| private-label | 27 |
| finish-guide | 15 |
| finishes | 7 |
| **合计** | **~432 条** |

→ 仍然是大活，但**比估算少一半**，而且可以按页切片交付。

---

## 一、修正后的真实清单（不是 12 个，是三类 12 项）

### A. 纯本地 → 需新建 WP Page（9 个）
| # | 路由 | content 模块 | 文案数 | 备注 |
|---:|---|---|---:|---|
| 1 | `/contact` | `contact` + `site` | 39 | `site` 是共享的，要单列 |
| 2 | `/custom-development` | `custom-development` | 45 | |
| 3 | `/dealers` | `dealer-programs` + `faq` | 48 | `faq` 与 `/products` 共用 ← **同一份 faq 已搬过，应复用** |
| 4 | `/dealers/private-label` | `private-label` | 27 | |
| 5 | `/fitment` + `/fitment/[platform]` | `fitment` | 55 | 数据驱动，只翻骨架 + 展示字段 |
| 6 | `/gallery/finishes` | `finishes` + `finish-guide` | 22 | |
| 7 | `/tools` + `/tools/offset-calculator` | `tools` | 54 | 两页共用同一模块 |
| 8 | `/insights/bolt-patterns`（+`[pattern]`）| `bolt-patterns` | 37 | 孔距是数据，只翻骨架 |
| 9 | `/support/{returns,shipping,terms,warranty}` | `legal` | — | **法律文本，须人工核验，建议最后做** |

### B. 适配器已存在，**只需接线**（2 个）⭐ 最省力
| # | 路由 | 适配器 | 缺什么 |
|---:|---|---|---|
| 10 | `/products/wheels/flow-formed` | `flow-formed.ts` | 接 locale + 扩 content 到 WP |
| 11 | `/products/wheels/forged` | `forged-wheel.ts` | 同上 |

### C. **明确排除**（2 个）
| 路由 | 为什么排除 |
|---|---|
| `/products/wheels`（目录页） | 正文骨架在组件里，真身是 **1349 型号数据**（`wheel-catalogue.ts` 自动生成）。**搬 WP 会把数据层搞乱** → 只翻页面级 UI 文案，数据保持本地 |
| `/products/wheels/[model]`（138 型号详情） | 同上，走 `wheel_model` CPT（已有独立契约），**不在方案甲范围** |

---

## 二、⭐ 一个比方案甲更省力的发现：共享模块只要搬一次

这些模块**被多页复用**，搬一次全部受益：

| 共享模块 | 被谁用 | 处理 |
|---|---|---|
| `faq` | `/products`（**已搬进 WP**）+ `/dealers` + 其他 | **复用 `/products` 的 WP 副本**，不要建第二份 |
| `site` | 全站（footer / contact 等） | 是**站点级常量**，不该进单页 WP 记录 → 建议**保留本地 + 走字典**（它是 chrome 性质）|
| `automotiveScenes` | 多页装饰图 | 仅图片路径，**不译**（已确认） |
| `legal` | 4 个 support 页 | **一次搬迁，4 页共用**（`getLegalDocument(slug)` 按 slug 检索）→ 比建 4 个 Page 更合理 |

📌 **对上一版计划的修正**：我曾建议「4 篇法律文本各建一个 Page（与 privacy 一致）」。
看到 `getLegalDocument(slug)` 的检索式设计后**改推荐**：**建 1 个 `legal` Page 承载 4 篇**，
按 slug 取。理由：它们共用同一份文档结构，建 4 个会让运营维护 4 条几乎一样的记录。

---

## 三、执行顺序（按「风险 × 收益」重排）

```
S0  接线（不含翻译）—— 2 个已存在的适配器 + 把 contact 等页接上 resolveLocalized
      ↓  （先让 en 走 WP，验证零回归）
S1  搬 WP：先 4 个高价值页（contact / custom-development / dealers / private-label）
      ↓
S2  搬 WP：再 3 个（fitment / gallery-finishes / tools）
      ↓
S3  搬 WP：bolt-patterns + legal（法律文本需人工核验，最慢）
      ↓
S4  填 zh：全部已搬页面 + Insights 6 篇
      ↓
S5  es / th 翻译：全部已接 locale 的页面
```

**每页的固定动作**（`/products` 已验证的流程）：
1. 读该页 content 模块 → 构同构 JSON
2. 扩 `translations_zh.py` 词表（生成器会给「未翻译叶子数」）
3. seed 进 WP（**同时写 `fh_content_json` 正本 + `content_by_locale`** ← 血泪教训）
4. 前端 `page.tsx` 改 import → `resolveLocalized`
5. **kill dev server + `rm -rf .next` + 重启** → 验证
6. **扫渲染后 HTML**（不只页面文件）
7. 门禁 + 「未翻译叶子数」回归

---

## 四、验收标准（每切片）

- [ ] en 侧**零回归**（该页改动前后渲染一致）
- [ ] 生成器「未翻译叶子数」可见（en 阶段应为 0 缺口）
- [ ] `/zh` 渲染中文；`/` 渲染英文；`/es` `/th` 回落**且日志留痕**
- [ ] **渲染后 HTML 拉丁文本扫描**，逐条归类
- [ ] `npm test` / `typecheck` / `lint` / `build` 全绿
- [ ] `INDEXABLE_LOCALES` 仍 `["en"]`（**索引门槛不动**）
- [ ] 无 commit / push / deploy

---

## 五、需要用户拍板（3 项）

1. **法律文本**：建 1 个 `legal` Page（我改推荐）还是 4 个独立 Page？
2. **`site` 常量**（全站共享）：走字典（我推荐，它是 chrome）还是进 WP？
3. **`/products/wheels` 目录页**：确认**排除**在方案甲之外（只翻页面 UI 文案，1349 型号数据保持本地）？

---

## 六、本计划的边界（诚实标注）

- ❌ **未改任何代码、未建任何 WP 记录、未开始 S0**
- ⚠️ 文案数是**正则粗估**（剔注释/路径/slug），实际可能 ±20%
- ⚠️ **未逐页读 content 模块的字段结构** —— 那是每页开工的第一件事
- ⚠️ 未核 `/fitment/[platform]` 与 `bolt-patterns/[pattern]` 的**数据条数**（已知真实 slug：`bmw-m`/`mercedes-amg`/`audi-rs`）
- ⚠️ 未评估 `legal` 4 篇的**人工核验工作量**（法务签字是外部依赖，不在我控制内）
