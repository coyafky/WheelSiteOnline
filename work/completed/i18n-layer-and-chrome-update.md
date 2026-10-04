# i18n 层与 Header / Footer 改造

- **状态**：已完成
- **创建日期**：2026-10-01
- **领域**：国际化（i18n）/ 站点框架

## 目标

建立中英双语层，并在不迁移路由结构的前提下让 header / footer 支持语言切换、
产品入口与四条产品线一致。

## 执行结果

**新建 `src/lib/i18n/`**（实测 6 个文件）：

```
src/lib/i18n/types.ts
src/lib/i18n/index.ts                 ← 服务端 getLocale（用 next/headers）
src/lib/i18n/use-t.ts                 ← client-safe createT
src/lib/i18n/dictionaries/en.ts
src/lib/i18n/dictionaries/zh.ts
src/lib/i18n/dictionaries/index.ts    ← 桶（关键结构约束，见下）
```

**新建 `src/components/language-switcher.tsx`**。

**header / footer 改造**：

- header 的 `Request Quote` 走 i18n，并改指 `/request-a-quote`
- footer 从「竞品三分类」改为**四条产品线**（实测 `footerNav` 首组 Products
  含 `ev-components` / `custom-aluminum` / `safety-tires` 与轮毂线）
- `site.name` 从 `"Fenghuai Forged Wheels"` 改为 **`"Fenghuai"`**（实测
  `src/content/site.ts` 第 11 行 `name: "Fenghuai"`）—— 原名字会让每个页面都
  自称「锻造轮毂」，与四条产品线的事实冲突

## 重要结论

1. **语言切换用 cookie（`fh-locale`），不是 `[locale]` 路由段。** 理由是
   26 条路由加段名是**另一次迁移**，本轮不做。
2. **⚠️ 代价（已知取舍）：中英文没有独立 URL，SEO 上不利于双语收录。**
   这是一项**明确记录的取舍**，不是疏忽 —— 是否要迁到 `[locale]` 路由段属于
   独立决策（见 `STATUS.md` Open Questions #9）。
3. **⚠️ 关键结构约束（踩坑记录）**：`use-t.ts` 若从 `./index` 导入，会把
   `next/headers` 拖进 client bundle → **构建失败**。解法是**拆出
   `dictionaries/index.ts` 桶**，让 client 组件只从字典桶导入，不碰
   `next/headers`。这是本层最容易再次踩到的地方 —— **新增 client 侧 i18n
   入口时，必须只从 `dictionaries/index.ts` 导入**。
4. **迁移方向已被结构性锁死**：`index.ts`（服务端 `getLocale`）与
   `use-t.ts`（client `createT`）分属两侧，将来切到 `[locale]` 路由段时，
   只要保证这条导入边界，改造面可控。

## 未解决问题

- **是否从 cookie 迁到 `[locale]` 路由段？** —— 决定双语能否被搜索引擎分别
  收录（`STATUS.md` Open Questions #9，⏳ 待答）。若要迁，牵动全部 26+ 条路由，
  是一次独立迁移。
- **i18n 覆盖面尚不完整**：本轮只改了 header 的 `Request Quote`、footer 与
  `site.name` 等局部；页面正文文案是否全部走 i18n 未系统核查。
- **`footerNav` 已改四条线，但 `primaryNav` 仍是旧结构**（header 下拉未改），
  两边**当前不一致**。
  → 后续任务见 `work/queued/primary-nav-align-with-footer.md`。
