# 询盘后端 + 新建页面

- **状态**：已完成
- **创建日期**：2026-10-01
- **领域**：询盘系统 / 页面路由

## 目标

为独立询盘流程建立后端（读取层 + 域 + 第一个 API 路由），并把本轮需要的新页面
落到路由树。

## 执行结果

**内容后端读取层 `src/lib/wordpress/`**（实测 3 文件）：

```
src/lib/wordpress/types.ts
src/lib/wordpress/client.ts     ← 切 live 只改这一个文件
src/lib/wordpress/index.ts
```

**询盘域 `src/lib/inquiry/`**（实测 5 文件）：

```
src/lib/inquiry/types.ts
src/lib/inquiry/store.ts
src/lib/inquiry/mailer.ts
src/lib/inquiry/validate.ts
src/lib/inquiry/index.ts
```

**第一个 API 路由**：`src/app/api/inquiries/route.ts`（POST / GET）。

**新建页面**（实测 `src/app/` 下 `page.tsx` 共 **33** 个，本轮 26 → 33）：

- `/products/{ev-components,custom-aluminum,safety-tires}` —— 三条非轮毂产品线
- `/capabilities` —— 由 `/manufacturing` **改名**而来，旧路由 `/manufacturing`
  保留并做 **307 重定向**（实测 `src/app/manufacturing/page.tsx` 调
  `redirect("/capabilities")`）
- `/custom-development`、`/request-a-quote`、`/thank-you`

> ⚠️ 说明：任务描述写 `/manufacturing` 是 301，**实测代码是 307**
> （`redirect()` 从 Server Component 抛出的是 307），以代码为准。

## 重要结论

1. **三条纪律**（`src/lib/inquiry/`，`DEC-021` 相关）：
   - **先落库再发信** —— 邮件失败不得丢询盘
   - **存快照不存引用** —— 询盘里存的是当时的规格/上下文**快照**，不是对会变的
     数据的引用（否则历史询盘会随数据改动而失真）
   - **上下文随询盘走** —— 询盘要带全来源上下文，便于后续处理与归因
2. **实测通过**：`POST` 返回 **201**；校验失败返回 **422**；`GET` 可读回落库数据
   （mock 模式）。
3. **Headless WP 读取层 `mode: "mock"`** —— **切 live 只改 `client.ts` 一个文件**，
   这是刻意的接缝设计（`AGENTS.md` §7.1 内容接缝是契约）。
4. **`/api/inquiries` 的存在反过来锁死了部署约束**：`next.config.ts` **不得**
   改成 `output: "export"` —— 纯静态导出下该路由完全不可用，等于物理上废掉询盘
   系统（`AGENTS.md` §7.6 / `DEC-009`）。
5. **路由数实测 26 → 33**（`find src/app -name 'page.tsx' | wc -l` = 33）。

## 未解决问题

- **询盘系统仍是 mock**：DB 与邮件都未接真 —— 待接真实 DB + Resend
  （`STATUS.md` Next Actions #6）。
- **内容层接 WordPress**：`src/lib/wordpress/` 已就位，等切 `mode: "live"`，
  前提是「无头 WordPress 由谁托管」有答案（`STATUS.md` Open Questions #8）。
- **`/manufacturing` 307 的长期处置**：改名后旧路由保留是临时兼容；是否要加
  永久重定向或删除该路由，`page.tsx` 注释提示「保留一个会重定向的页面以保住
  既有外链与搜索结果的收益」，尚无最终决议。
- **安全轮胎页（`/products/safety-tires`）在归属确认前不上线**（`DEC-017`）——
  路由已建但内容态待定。
