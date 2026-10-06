# ARCHITECTURE — 架构文档集

本目录是**架构的正本**。根目录的 `ARCHITECTURE.md` 是总纲（模块怎么切、
数据从哪来、谁不能依赖谁），本目录存放**逐页与逐模块的落地设计**。

- 建立日期：2026-10-01
- 上位文件：`../ARCHITECTURE.md`（先读它，再读这里）

---

## 目录

```
ARCHITECTURE/
├── README.md                  本文件 · 索引与阅读顺序
├── page-architecture/         ★ 每一页要说明什么（内容与布局）
│   ├── README.md                      我们的页面架构
│   ├── 2nforged-page-inventory.md     竞品事实（12 页 / 88 section）
│   ├── content-design-and-new-pages.md 内容设计法 + 页面增量决策
│   ├── fitment-pages-plan.md          ★ 车型适配页方案（坦克等）
│   ├── wheel-browsing-and-fitment-pages.md ★ 浏览维度 + 车系专题页（对口 WheelPros）
│   ├── wheel-catalog-page.md          ★★ 轮毂目录页（1018 型号 + 7 组筛选器）
│   ├── wheel-detail-page.md           ★★ 轮毂详情页（1018 页的模板 · 核心）
│   ├── dealers-page.md                ★★ 经销商页（14 段竞品底本 · 转化最重）
│   ├── private-label-page.md          ★★ 贴牌页（16 段竞品底本 · 全文最长）
│   ├── resources-hub-page.md          ★★ 资源中心（内容中心索引 + 12 选题）
│   ├── about-page.md                  ★★ 关于我们（工厂信任页 · 9 段）
│   └── contact-page.md                ★★ 联系页（全站最短 · 但连着后端）
└── tech-architecture/         ★ 每个模块怎么落地（数据流与技术选型）
    └── README.md
```

---

## 两份文档的分工

这是本目录最重要的一件事。**两份文档回答的是不同问题，不要互相串。**

| | `page-architecture/` | `tech-architecture/` |
|---|---|---|
| 回答 | **这一页要给谁看、说明什么、怎么组织** | **这一页的数据从哪来、怎么渲染、边界在哪** |
| 读者 | 内容策划、设计、丰怀业务方 | 开发者、agent |
| 输出 | 页面清单 + 每页模块顺序 + 每块要写什么 | 数据流 + 组件树 + 依赖 + 失败模式 |
| 变更触发 | 业务需求变、产品线变 | 技术选型变、数据源变 |
| 反例（不算） | 「用 `<Grid>` 两列」 | 「这页讲什么故事」 |

**一句话**：page 架构说「**说什么**」，tech 架构说「**怎么说**」。

---

## 阅读顺序

**新接手的人 / agent**：

1. `../ARCHITECTURE.md` —— 7 层模块模型、依赖矩阵
2. `page-architecture/2nforged-page-inventory.md` —— 竞品事实（我们照什么搭）
3. `page-architecture/README.md` —— 我们的页面架构（站点地图、每页要说明什么）
4. `page-architecture/content-design-and-new-pages.md` —— **每页内容怎么写、要加什么页**
5. `tech-architecture/README.md` —— 数据流、类型契约、渲染策略

**要开工某页时**：

1. 先看 `page-architecture/` 的对应条目 —— 确认这页要说的是什么
2. 再看 `tech-architecture/` 的对应条目 —— 确认数据从哪来、有什么约束
3. 两者都读过再动手

---

## 本目录的三条铁律

### ① 上架门槛：无图不上架

**只为「有图」的型号建页面。** 实测数据：

```
1349 个型号 中
  ├─ 1018 有图  → 可以上架
  └─  331 无图  → ★ 先不上架（用户 2026-10-01 定案）
```

无图型号**不建 SKU 页、不进目录列表、不出现在筛选结果里**。
它们的数据保留在 `assets/`，等图到位后直接放开 —— 不需要改架构。

⚠️ **不要把无图型号做成「占位页」**。空壳页对经销商是负价值：
点进去什么都没有，比搜不到更伤信任。

### ② 未确认不上架

规格数据（PCD / ET / CB）**必须来自该型号的实际生产数据**，
不得用系列通用值顶替。见 `../DECISIONS.md` DEC-004。

### ③ 两文档必须同步

改任何一页，**两份都要改**：

- 只改 page → 实现时不知道数据从哪来
- 只改 tech → 实现了但不知道这页该说什么

`AGENTS.md` §9 的「完成」定义里已包含这一条。

---

## 变更流程

新增或修改一页 / 一个模块，走这个顺序：

```
1. 在 page-architecture/ 登记：这页是谁的、要说明什么
        ↓
2. 在 tech-architecture/ 登记：数据源、组件、约束
        ↓
3. 若引入新决策 → 写入 ../DECISIONS.md（DEC-xxx）
        ↓
4. 若改动模块边界 → 同步 ../ARCHITECTURE.md
        ↓
5. 建任务 → work/queued/ 或 work/active/
```

**顺序不能颠倒。** 先写页面结构再定数据来源，等于先决定说什么再找素材 ——
通常会返工。

---

## 当前状态

| 文档 | 状态 |
|---|---|
| `page-architecture/README.md` | ✅ 已建（v1.0） |
| `tech-architecture/README.md` | ✅ 已建（v1.0） |
| 逐页细分（每页一个文件） | ⏳ 待建 —— 等信息架构定稿后按需展开 |
| 逐模块细分（每模块一个文件） | ⏳ 待建 —— 同上 |

> **不要预先建一堆空文件。** 逐页 / 逐模块的细分文档**在该页真正开工时建**。
> 这与 `../ARCHITECTURE.md` §12 的「新增模块的登记格式」是同一原则。
