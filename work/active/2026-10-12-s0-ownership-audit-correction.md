# S0 · 归属实况修正账目（写代码前的必做项）

- **状态**：已完成（本轮）
- **日期**：2026-10-12
- **性质**：**只读核查**，零代码改动
- **为什么先做**：我在 10-11 的两版计划里**累计错了 3 处归类**，若不修正会让 S1/S3 清单直接错

---

## 一、修正的 3 处错误

### ❌ 错误 1：`flow-formed` / `forged-wheel` 不是「只需接线」

我在 `2026-10-12-planA-scope-and-order.md` 把它们列为 **B 类「适配器已存在，只需接线」⭐最省力**。**这是错的。**

实测：两个适配器**只做媒体解析**，**完全没有内容层**：

| 能力 | flow-formed / forged-wheel | 真正已接线的（about / safety-tires）|
|---|---|---|
| 媒体解析（`resolveWordpressMediaCollection`） | ✅ 有 | ✅ 有 |
| **内容层**（`getWordpressPageDocument`） | ❌ **0 引用** | ✅ 有 |
| **locale 接线**（`getLocale` / `resolveLocalized`） | ❌ **0 引用** | ✅ 有 |
| **WP 记录** | ❌ **不存在** | ✅ 有 |

→ 真实归类应为 **「需新建 WP 归属 + 搬内容」**（同 `contact` 那一类），**不是省力项**。

### ❌ 错误 2：`privacy` 不在 WP 里

我在分类文档里把 `/support/privacy` 列进 **「A 类：已有 WP Page 归属，已接 locale，已中文化」**。**这是错的。**

实测 `key=privacy` → **`wp=NONE`**（无记录）。

它的真实结构是**混合的**：
```
SEO（title/description）→ getWordpressPageDocument("privacy")   ← 读 WP，但记录不存在 → 走 fallback 字面量
正文                    → getLegalDocument("privacy")            ← 本地 @/content/legal
```
→ 所以「5 篇法律文本中 privacy 已完成」的说法不成立。**5 篇全在本地 `legal.ts`**。

### ❌ 错误 3：`request-a-quote` 无 WP 记录

计划里列为 A 类。实测 `wp=NONE`。
页面确实 `getWordpressPageDocument("request-a-quote")` 但**记录不存在** → 恒走 fallback。

---

## 二、修正后的完整实况（12 项逐一实测）

| # | 路由 | page key | WP 记录 | 正文来源 | 真实分类 |
|---:|---|---|---|---|---|
| 1 | `/about` | `about` | **1312** ✅ | WP | **A 真已接线** |
| 2 | `/capabilities` | `capabilities` | **1313** ✅ | WP | **A 真已接线** |
| 3 | `/products` | `product-lines` | **1314** ✅ | WP | **A 真已接线** |
| 4 | `/products/ev-components` | `ev-components` | **1315** ✅ | WP | **A 真已接线** |
| 5 | `/products/custom-aluminum` | `custom-aluminum` | **1316** ✅ | WP | **A 真已接线** |
| 6 | `/products/safety-tires` | `safety-tires` | **1317** ✅ | WP | **A 真已接线** |
| 7 | `/thank-you` | `thank-you` | **1341** ✅ | WP（ls 仅 en）| **A 未接 locale** |
| 8 | `/request-a-quote` | `request-a-quote` | ❌ NONE | 本地 + fallback | **C 需新建** |
| 9 | `/support/privacy` | `privacy` | ❌ NONE | 本地 `legal.ts` | **C 需新建** |
| 10 | `/support/{returns,shipping,terms,warranty}` | — | ❌ NONE | 本地 `legal.ts` | **C 需新建** |
| 11 | `/products/wheels/flow-formed` | `flow-formed` | ❌ NONE | 本地 | **C 需新建** |
| 12 | `/products/wheels/forged` | `forged-wheel` | ❌ NONE | 本地 | **C 需新建** |

**关键结论**：真正「已接线且已中文化」的只有 **6 个**（#1–6），不是我上一版说的 11 个。
其余 6 项（#7–12）**都需要新建 WP 归属**。

---

## 三、修正后的 S1 范围（比原计划大）

原计划 S1 = contact / custom-development / dealers / private-label（4 个）。

**实际 S1 应包含**（都是「新建 WP 归属」）：
| 优先级 | 页面 | 备注 |
|---|---|---|
| P0 | `flow-formed` / `forged-wheel` | 已有媒体层，只差内容层 → **最接近完成** |
| P0 | `request-a-quote` | 页面已在调 `getWordpressPageDocument`，只差记录 |
| P1 | `contact` / `custom-development` / `dealers` / `dealers-private-label` | 纯本地 |
| P2 | `fitment` / `gallery-finishes` / `tools` / `insights-bolt-patterns` | 中量 |
| P3 | `legal`（4 篇：returns/shipping/terms/warranty）+ `privacy` | 法律文本，人工核验 |
| — | `products/wheels` | **确认排除**（1349 型号数据保持本地）|

---

## 四、⚠️ 另一处需要你拍板的：`privacy` 要不要合并进 `legal`？

你已定「法律文本 = 4 个独立 Page（returns/shipping/terms/warranty），privacy 保持独立」。
但实测后我提出一个疑问：

- **`privacy` 与那 4 篇同源** —— 都在 `@/content/legal` 的 `legalDocuments` 数组里，**同一个渲染器**（`legal-document.tsx`）、**同一个 `getLegalDocument(slug)` 检索**
- 它「独立」的唯一依据是**你上一轮的指令**，代码层面它与另外 4 篇**完全同构**

**两种做法**：
| 方案 | 做法 | 代价 |
|---|---|---|
| **按你的指令**（推荐） | 5 篇各建 1 个 Page（privacy + 4）| 统一、无需特例；运营维护 5 条 |
| 合并 | 1 个 `legal` Page 装 5 篇 | 少了 4 条记录，但要给 privacy 写特例 |

→ **我倾向按你的指令（5 个独立 Page）** —— 5 篇同构就该同样处理，不该为 privacy 开特例。
但因为你之前特意说过「privacy 保持独立」，我**不擅自当作默认**，请确认：**是 5 个独立 Page（含 privacy），还是 privacy 单独走别的路径？**

---

## 五、本轮边界

- ✅ 做了什么：逐项实测 12 个页面的 WP 记录存在性 + 正文来源；修正 3 处归类错误；重排 S1 范围
- ❌ **未做**：零代码改动、零 WP 写入、未建任何记录
- ⚠️ 未核：`legal` 4 篇的**人工核验工作量**（法务签字是外部依赖）
- ⚠️ 未逐字段盘点各页 content 模块（那是每页开工第一件事）
