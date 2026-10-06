# PAGE-SPECS —— 按路由命名的页面搭建规格

> **本模块与 `../ARCHITECTURE/page-architecture/` 的分工：**
>
> | | `ARCHITECTURE/page-architecture/` | **`PAGE-SPECS/`（本模块）** |
> |---|---|---|
> | 回答 | **为什么**这样设计 | 照着**搭什么** |
> | 性质 | 参考 + 设计 + 规划（三类混放） | **施工图** |
> | 读者 | 决策者 / 架构评审 | **动手写代码的人** |
> | 粒度 | 这一段要说明什么 | **这一块放哪个组件、吃什么 props、什么栅格** |
>
> **⚠️ 不重复：本模块不写竞品拆解、不写设计理由。**
> 需要理由时**链接过去**，不复制。

- 建立日期：2026-10-01
- 上位：`../ARCHITECTURE/page-architecture/README.md`（站点地图与全局规则）

---

## 每份规格的固定结构

```
# <路由> 页面规格
> 路由 / 目标文件 / 渲染方式 / 数据源

## 1. 页面骨架        ← 内容块清单（顺序 + 必须有/可省 + 依赖）
## 2. 逐块规格        ← 每块：内容要点 / 用什么组件 / props / 数据来源 / 布局
## 3. 组件清单        ← 复用已有（标路径）/ 需新建（标建议路径 + 职责）
## 4. 数据契约        ← TS 类型 → 字段 → 来源
## 5. 布局与响应式    ← 栅格 / 断点 / 深色段 / 动效
## 6. 待补与阻塞
```

---

## 文件命名 = 路由

| 文件 | 路由 |
|---|---|
| `index.md` | （本模块总表） |
| `products/index.md` | `/products` |
| `products/wheels.md` | `/products/wheels` |
| `products/wheels/[model].md` | `/products/wheels/[model]` |
| `products/wheels/series/[series].md` | `/products/wheels/series/[series]` |
| `products/ev-components.md` | `/products/ev-components` |
| `products/custom-aluminum.md` | `/products/custom-aluminum` |
| `products/safety-tires.md` | `/products/safety-tires` |
| `index-home.md` | `/` |

⚠️ 文件名里的 `[xxx]` 是**根路由**（与 Next.js 动态段写法一致）。
