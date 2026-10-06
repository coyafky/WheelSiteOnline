"use client";

import { useSyncExternalStore, useState } from "react";

import { cn } from "@/lib/utils";
import type { FacetOption } from "@/lib/wheels";

/**
 * 孔距（PCD）筛选组 —— 带搜索。
 *
 * ── 为什么只有这一组需要搜索 ────────────────────────────────────────────────
 * 首期数据里孔距有 16 个值，而买家通常只关心其中 1–3 个（自己的车那一个）。
 * 在 16 行里肉眼找 `5×114.3` 是纯浪费时间 —— 宽度只有 11 个、直径只有 6 个，
 * 扫一遍还能接受；孔距不行。规格 §5.1 原本也要求孔距是「可搜索多选」。
 *
 * ── 无 JS 时仍然完全可用（这是硬要求）─────────────────────────────────────
 * 这是一次**渐进增强**，形状与 `useSiteMotion` 完全一致：
 *   · 全部 checkbox 由**服务端渲染**，搜索框只是额外加的一层过滤；
 *   · 组件不 hydrate（无 JS / JS 报错）时，输入框不出现，16 个 checkbox
 *     一个不少地铺在那里，`<form method="get">` 照常提交。
 * 所以「加搜索」**不会**让任何人失去筛选能力 —— 它只会让有 JS 的人更快。
 *
 * ── 两个必须守住的规则 ──────────────────────────────────────────────────────
 * 1. **已勾选的永远可见**。否则用户勾了 `5×114.3`、又去搜 `112`，
 *    自己选的那条会凭空消失（但它仍在提交），看起来像被吞了。
 * 2. **搜索框不带 `name`**。带 name 就会作为查询参数提交到 URL，
 *    而 `parseCatalogueSearchParams` 里没有它 → 变成一个只能靠忽略来兜住的垃圾参数。
 */

/**
 * 搜索归一化：抹掉所有分隔符差异。
 *
 * `5×114.3` / `5x114.3` / `5*114.3` / `5 114.3` / `5114` 全部归一成纯数字串，
 * 这样用户随手打「5 114」或「5114」都能命中 `5x114.3`（"51143" 含 "5114"）。
 * 轮毂行业里 × / x / * 混用是常态，不该让用户为此试错。
 */
/** 订阅永不变化 —— 我们只关心「服务端快照 vs 客户端快照」这一次切换。 */
const subscribeNoop = () => () => {};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^0-9a-z]/g, "");
}

export function PcdSearchGroup({
  legend,
  name,
  options,
  selected,
  idPrefix,
  collapseAfter = 5,
  columns = 2,
}: {
  legend: string;
  name: string;
  options: FacetOption[];
  selected: Array<string | number> | undefined;
  idPrefix: string;
  /**
   * 未搜索时，计数低于此值的孔距折进「Show more」。`0` = 不折。
   *
   * ⚠️ 为什么必须有它（2026-10-06 实测的回归）：搜索框**本身不约束高度**。
   * 第一版只加了搜索、去掉了原来的 `max-h-44` 滚动盒，结果 16 行全展开，
   * 左栏从 1144px 涨到 **1494px**、移动抽屉从 1213px 涨到 **1563px** ——
   * 比改之前还差。所以「搜索」和「收敛高度」是两件事，必须都有。
   *
   * 分工：**平常只列主流孔距（可用「Show more」展开全部），搜索则穿透到全部**。
   * 用户要么在常见值里看到自己要的，要么用搜索直接找到长尾的那个。
   */
  collapseAfter?: number;
  /**
   * 列表列数。孔距标签很短（`5×114.3`），侧栏 248px 里一行放得下两个 ——
   * 16 个值从 16 行压到 8 行，**零信息损失**（对比「滚动盒」是把内容藏起来）。
   */
  columns?: 1 | 2;
}) {
  const [query, setQuery] = useState("");

  /**
   * 搜索框只在 JS 真正可用之后才渲染。
   *
   * ⚠️ 这是一个**假控件**问题：`PcdSearchGroup` 是客户端组件，但它照样会被
   * 服务端渲染 —— 所以无 JS 时输入框会出现在页面上，而打字什么都不会发生。
   * 规格 §11 明令「无 JS 时…不能显示一个无法工作的假表单」。
   * 所以先不渲染，挂载成功（= JS 可用）后才出现；此时 16 个 checkbox
   * 一个不少地铺着，「Show more」也是原生 `<details>`，照样能筛能提交。
   *
   * 用 `useSyncExternalStore` 而不是 `useState` + `useEffect`：
   * 服务端快照返回 `false`、客户端快照返回 `true`，React 会在 hydrate 后自动
   * 切过来。这正是这个 hook 的用途（读取「只在客户端存在」的外部状态），
   * 而且不像 effect 里 setState 那样多一次渲染并触发
   * `react-hooks/set-state-in-effect`。
   */
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const needle = normalize(query);
  const selectedSet = new Set((selected ?? []).map(String));
  // 只数本组真实存在的值（避免别的轴的残留被算进来）。
  const selectedCount = options.filter((o) => selectedSet.has(String(o.value))).length;

  const isMatch = (option: FacetOption): boolean =>
    needle === "" ||
    selectedSet.has(String(option.value)) ||
    normalize(option.value).includes(needle) ||
    normalize(option.label).includes(needle);

  const matched = options.filter(isMatch);
  // 已勾选的**必须留在可见区**（在收起区里「消失」看起来像被吞了）。
  const pinned = (o: FacetOption) => selectedSet.has(String(o.value));

  // 搜索时穿透到全部匹配项；没搜索时才按计数收敛。
  const rare =
    needle === "" && collapseAfter > 0
      ? matched.filter((o) => !pinned(o) && o.count < collapseAfter)
      : [];
  const primary = matched.filter((o) => !rare.includes(o));

  const hiddenCount = options.length - matched.length;

  const renderOption = (option: FacetOption) => {
    const checked = selectedSet.has(String(option.value));
    // 值为 0 的选项「禁用但可见」（§9）—— 但**已勾选的不能禁用**，
    // 否则用户改动其他轴后按下 Apply，这条筛选会因为控件被禁用而从 URL 里消失。
    const disabled = option.disabled && !checked;
    const id = `${idPrefix}-${name}-${option.value}`;
    return (
      <label
        key={option.value}
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 text-[0.82rem] leading-snug text-foreground",
          disabled && "cursor-not-allowed text-muted-foreground",
        )}
      >
        <input
          id={id}
          type="checkbox"
          name={name}
          value={option.value}
          defaultChecked={checked}
          disabled={disabled}
          className="size-4 shrink-0 accent-forge"
        />
        <span>{option.label}</span>
        <span
          className={cn(
            "ml-auto tabular-nums text-[0.75rem] text-muted-foreground",
            disabled && "opacity-60",
          )}
        >
          {option.count}
        </span>
      </label>
    );
  };

  return (
    <fieldset className="mt-6 border-t border-border pt-5">
      <legend className="eyebrow !text-ink">
        {legend}
        {selectedCount > 0 ? (
          <span className="ml-2 font-600 text-forge normal-case tracking-normal">
            · {selectedCount} selected
          </span>
        ) : null}
      </legend>

      {/* 搜索框只在 JS 可用后出现 —— 见 `mounted` 的注释（假控件问题）。 */}
      {mounted ? (
        <>
          <div className="relative mt-3">
            <input
              type="search"
              /* ⚠️ 故意不给 `name`：它只过滤眼前的列表，不参与提交。 */
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. 5x114 or 112"
              aria-label={`Search ${legend}`}
              autoComplete="off"
              className="w-full rounded-md border border-border bg-white px-3 py-2 pr-9 text-[0.85rem] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forge"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-soft hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forge"
              >
                ×
              </button>
            ) : null}
          </div>

          {/*
            结果数只在**搜索时**播报。
            不搜索时说一句「16 bolt patterns」是纯噪音 —— legend 已经说了这是孔距，
            下面列的就是它们；而搜索时用户确实需要知道「筛完还剩几条」。
            省下的这一行也直接换成了高度（侧栏每多一行，首屏就少看一截）。
          */}
          {needle !== "" ? (
            <p aria-live="polite" className="mt-2 text-[0.72rem] text-muted-foreground">
              {hiddenCount === 0
                ? `Showing all ${options.length}`
                : `${matched.length} of ${options.length} — ${hiddenCount} hidden`}
            </p>
          ) : null}
        </>
      ) : null}

      <div
        className={cn(
          "mt-3",
          columns === 2 ? "grid grid-cols-2 gap-x-3 gap-y-2" : "space-y-2",
        )}
      >
        {primary.map(renderOption)}
      </div>

      {/* 长尾：原生 details，无 JS 可展开。搜索时 `rare` 为空，不出现。 */}
      {rare.length > 0 ? (
        <details className="group mt-2">
          <summary className="flex min-h-8 cursor-pointer list-none items-center gap-1.5 text-[0.75rem] font-600 text-forge marker:content-none transition-colors hover:text-forge-deep">
            <span
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center rounded-full border border-forge/50 font-display text-[0.8rem] font-700 leading-none transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
            <span className="group-open:hidden">Show {rare.length} more</span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <div
            className={cn(
              "mt-3",
              columns === 2 ? "grid grid-cols-2 gap-x-3 gap-y-2" : "space-y-2",
            )}
          >
            {rare.map(renderOption)}
          </div>
        </details>
      ) : null}

      {/* 搜不到任何东西时给一条出口，而不是只留一个空盒子。 */}
      {needle !== "" && matched.length === 0 ? (
        <p className="mt-2 text-[0.78rem] text-muted-foreground">
          No bolt pattern matches “{query}”. Clear the search to see all{" "}
          {options.length}.
        </p>
      ) : null}
    </fieldset>
  );
}
