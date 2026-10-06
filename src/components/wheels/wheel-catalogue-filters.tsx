import Link from "next/link";

import { cn } from "@/lib/utils";
import { PcdSearchGroup } from "./pcd-search-group";
import {
  SORT_KEYS,
  buildCatalogueHref,
  type CatalogueFacets,
  type CatalogueSort,
  type FacetOption,
  processLabelEn,
  type ProcessKey,
  type WheelCatalogueInput,
} from "@/lib/wheels";

/**
 * 目录筛选栏、已应用筛选 chips 与排序控件（PAGE-SPECS/wheel-catalog.md §5、§9、§10）。
 *
 * ── 为什么是 Server Component ───────────────────────────────────────────────
 * §12 明令：**不能把 1073 条完整数据序列化给浏览器再前端筛选**。所以这里没有
 * `"use client"`，也没有任何 `onChange`。全部筛选状态活在 **URL** 里，由
 * `<form method="get">` 提交、由服务端 `parseCatalogueSearchParams` 解析。
 * 唯一代价是排序 select 需要一个显式的提交按钮 —— 换来的是**无 JS 也能筛选、排序**（§10 末条）。
 *
 * ── 两个表单，不是一份复制 ──────────────────────────────────────────────────
 * 桌面用左侧 `<aside>`，移动用原生 `<details>` 抽屉（§10）。它们是**两个独立的
 * `<form>`**，而不是一个表单里的两份控件：否则 `q` 会以同一 `name` 提交两次，
 * 用户改的是抽屉里那份、被提交的却可能是被 CSS 藏起来的那份。两个表单各提交自己，
 * 交互到哪一份就提交哪一份。
 *
 * ── 勾选态与 URL ───────────────────────────────────────────────────────────
 * 同类多选 OR、不同轴 AND 由数据层保证（`query.ts`），这里只负责把勾选态**忠实映射**进
 * URL。孔距参数一律 ASCII `x`（`pcd=5x112,5x114.3`），展示才用 `×`（§5.2）。
 */

const CATALOGUE_PATH = "/products/wheels";

/**
 * 锁定工艺的展示标签。
 *
 * 走 `processLabelEn`（与型号详情表的工艺标签同一映射），未记录工艺在锁定集合里
 * 不会出现，但仍给它一个明确的文案而不是原始 key。
 */
function processLabelFor(key: ProcessKey): string {
  if (key === "not-specified") return "Not specified in source data";
  return processLabelEn(key) ?? key;
}

/** §5.3 的四种排序；文案逐字取自规格表。 */
const SORT_LABELS: Record<CatalogueSort, string> = {
  "model-asc": "Model A–Z",
  "diameter-asc": "Diameter: low to high",
  "diameter-desc": "Diameter: high to low",
  "variants-desc": "Most recorded configurations",
};

type CatalogueFilterProps = {
  facets: CatalogueFacets;
  /** 规范化后的查询（页面已把 URL 收敛成它）。 */
  query: WheelCatalogueInput;
  /** 当前命中数 —— 抽屉内作为「预期结果数」显示（§10）。 */
  total: number;
  /**
   * 是否有任何筛选生效。
   *
   * 没有它，未筛选的目录也会显示「N models match the current filters」——
   * 而当时根本没有 filters，这句话与事实不符（2026-10-06 实测抓到）。
   */
  isFiltered: boolean;
  /**
   * 工艺轴被**本路由锁定**（不是访客选的）。
   *
   * 设置后：
   *  · 工艺 checkbox 组换成不可移除的标签；
   *  · `process` 从表单隐藏域与每个 chip 的 href 里**整体移除**。
   *
   * PAGE-SPECS/flow-formed-wheels.md §4：用户不能通过 URL 清除工艺边界。
   * 留在 URL 里的话，改一个参数就能把页面放宽成全站轮毂，
   * 而且同一批结果会有两个可索引 URL。
   */
  lockedProcesses?: ProcessKey[];
  /** 结果 URL 的基础路径。默认轮毂总目录。 */
  basePath?: string;
};

/* ---------------------------------------------------------------------------
 * URL 快照
 * ------------------------------------------------------------------------- */

/**
 * 过滤器投影成 GET 隐藏域 —— 供「只改排序」的表单保留其余轴。
 *
 * ⚠️ 锁定的工艺**不写进隐藏域**：写进去就等于给了它一个可编辑的 URL 出口。
 */
function snapshotPairs(
  query: WheelCatalogueInput,
  lockedProcesses: readonly ProcessKey[] = [],
): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  if (query.q) pairs.push(["q", query.q]);
  if (query.diameters?.length) pairs.push(["diameter", query.diameters.join(",")]);
  if (query.widths?.length) pairs.push(["width", query.widths.join(",")]);
  if (query.pcds?.length) pairs.push(["pcd", query.pcds.join(",")]);
  if (lockedProcesses.length === 0 && query.processes?.length) {
    pairs.push(["process", query.processes.join(",")]);
  }
  return pairs;
}

/* ---------------------------------------------------------------------------
 * 单个筛选轴
 * ------------------------------------------------------------------------- */

function CheckboxGroup({
  legend,
  name,
  options,
  selected,
  idPrefix,
  collapseAfter = 0,
  columns = 1,
}: {
  legend: string;
  name: string;
  options: FacetOption[];
  selected: Array<string | number> | undefined;
  idPrefix: string;
  /**
   * 计数低于这个值的选项折进「Show more」。`0` = 不折。
   *
   * 为什么需要：宽度有 11 个值，但 `6"`(2 个型号)、`6.6"`(1)、`8.25"`(1)、
   * `10.5"`(3) 这四项加起来才 7 个型号 —— 却和 `8.5"`(53 个) 一样占一行。
   * 长尾不是没价值，是**不该和主流量占同样的视觉预算**；收起来仍然可达。
   *
   * ⚠️ 折进去的 checkbox **仍在表单里**（只是被 `<details>` 收起），
   * 所以「折起来 → 勾选 → 提交」这条路不会被截断。这一点已实测验证。
   */
  collapseAfter?: number;
  /** 列表列数。仅对短标签用（`15"` / `8.5"`）—— 长的（工艺名）必须单列。 */
  columns?: 1 | 2 | 3;
}) {
  const selectedSet = new Set((selected ?? []).map(String));
  // 只数「真实存在于本组」的已选值 —— 否则别的轴的残留会算进来。
  const selectedCount = options.filter((o) => selectedSet.has(String(o.value))).length;

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

  // 已勾选的**必须留在可见区**：否则用户勾了某个长尾值、又去改动别的轴，
  // 自己选的那条会「消失」在收起区里 —— 但它仍在提交，看起来像被吞了。
  const primary: FacetOption[] = [];
  const rare: FacetOption[] = [];
  for (const option of options) {
    const pinned = selectedSet.has(String(option.value));
    if (collapseAfter <= 0 || pinned || option.count >= collapseAfter) {
      primary.push(option);
    } else {
      rare.push(option);
    }
  }

  return (
    <fieldset className="mt-6 border-t border-border pt-5">
      <legend className="eyebrow !text-ink">
        {legend}
        {/* 「已选 N」既是反馈也是隐含提示 —— 能同时选中两个，就说明这是多选。
            也让用户在勾选项滚出视野后仍知道当前选了什么。 */}
        {selectedCount > 0 ? (
          <span className="ml-2 font-600 text-forge normal-case tracking-normal">
            · {selectedCount} selected
          </span>
        ) : null}
      </legend>
      <div
        className={cn(
          "mt-3",
          columns === 3
            ? "grid grid-cols-3 gap-x-2 gap-y-2"
            : columns === 2
              ? "grid grid-cols-2 gap-x-3 gap-y-2"
              : "space-y-2",
        )}
      >
        {primary.map(renderOption)}
      </div>

      {rare.length > 0 ? (
        /* 原生 details —— 无 JS 可展开，与移动抽屉同一套机制。 */
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
    </fieldset>
  );
}

/** 一套完整的筛选控件。桌面与移动各渲染一次（见文件头注释）。 */
function FilterFields({
  facets,
  query,
  isFiltered,
  lockedProcesses = [],
  basePath = CATALOGUE_PATH,
  idPrefix,
  total,
}: CatalogueFilterProps & { idPrefix: string }) {
  return (
    /*
     * 两段式结构：**筛选区滚动，主行动常驻**。
     *
     * 为什么不是「Apply 也粘在滚动区底部」：`sticky bottom-0` 钉的是**滚动容器的
     * 底边**。而左栏在 `sticky top-24` 生效前（页面顶部）位于 y=501，高 788px →
     * 底边落在 y=1289，**在 900px 视口之外**。于是那个「粘性」条根本粘在看不见的
     * 地方 —— 2026-10-06 实测：滚 400px 后按钮位置纹丝不动。
     *
     * 拆成 flex 列后，Apply 是**固定那一格**，只要左栏可见它就可见，与滚动位置无关。
     * 这比在滚动盒里做 sticky 稳，因为它不依赖滚动容器的几何。
     */
    <>
      {/*
        ══ 主行动在最上（固定），不是最下 ═══════════════════════════════════════

        2026-10-06 用户指出：**Apply 应该是第一位**。他是对的 —— 它是这一栏里
        唯一的动作，用户的心智是「改完 → 应用」；把它埋在 16 行勾选框之后，
        等于先让人做完全部工作再去找提交键。

        也顺便修掉一个更实际的问题：`sticky top-24` 只在滚动后才吸顶，页面还在
        顶部时左栏是从 y=501 开始、往下延伸的 —— 贴在底部的主行动会落在视口外。
        放在**顶部**就没有这个问题：只要左栏可见，它就可见。

        它**不随筛选区滚动**（那部分在下面的 flex-1 滚动格里）。
      */}
      <div className="shrink-0">
        <p className="text-[0.75rem] text-muted-foreground">
          {isFiltered
            ? `${total} ${total === 1 ? "model" : "models"} match the current filters`
            : `${total} ${total === 1 ? "model" : "models"} available`}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button type="submit" className="btn-pill-solid !text-white">
            Apply filters
          </button>
          <Link
            href={basePath}
            className="font-display text-[0.72rem] font-700 uppercase tracking-[0.13em] text-forge transition-colors hover:text-forge-deep"
          >
            Clear filters
          </Link>
        </div>

        {/*
          ══ 「多选」必须明说（2026-10-06 用户要求）══════════════════════════════

          轮毂筛选本质是多选（同类 OR、跨轴 AND），但用户对筛选栏的默认预期是
          单选。不提示的话，最常见的两种误解是：
            · 「点 18 寸会不会把 19 寸排除掉？」
            · 「再点一个是「换」还是「加」？」
          两种都会让人不敢多点，或者点完看到一堆结果不知所以。

          写成一个**左边框注记**而不是一行灰色小字：小字在这个位置会被当成
          免责声明直接跳过，而它其实是操作说明。左边框 + 稍深一点的墨色，
          既能被看到，又不占一整块盒子的高度。
        */}
        <p className="mt-2.5 border-l-2 border-forge/40 pl-2.5 text-[0.74rem] leading-relaxed text-steel">
          Tick <strong className="font-600 text-ink">any number</strong> of boxes per
          group — they add up, they don&rsquo;t replace each other. Ticking 18″{" "}
          <em>and</em> 19″ shows both; the same applies to bolt patterns.
        </p>
      </div>

      {/* 筛选区：独立滚动，不与上面的主行动抢位置 */}
      <div className="mt-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 lg:border-t lg:border-border lg:pt-1">
      <div className="mt-5">
        <label htmlFor={`${idPrefix}-q`} className="eyebrow !text-ink">
          Model search
        </label>
        <input
          id={`${idPrefix}-q`}
          type="search"
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="e.g. HP12"
          autoComplete="off"
          className="mt-3 w-full rounded-md border border-border bg-white px-3 py-2 text-[0.85rem] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forge"
        />
      </div>

      {/*
        ═══ 筛选轴顺序（改顺序 = 移动下面的块）═══════════════════════════════════

        **孔距 → 直径 → 宽度 → 工艺**

        这不是审美排序，是适配工程的顺序。三个独立来源一致：

        · Discount Tire 的官方流程：`verify your vehicle's bolt pattern` →
          `choose the correct wheel diameter and width` → `confirm offset and
          center bore` → `ensure brake and suspension clearance`
        · Curva Concepts：轮毂「has to physically mount to your car. That starts
          with the bolt pattern. **Get it wrong and nothing else matters.**」
        · Tire Rack：bolt pattern 是 wheel 被列为适配某车前必须核实的项

        ⭐ 决定性理由 —— **不对称性**：孔距是这一页上**唯一一个「选错 = 零件直接
        不可用」的轴**。`5×114.3` 与 `5×112` 差 2.3mm，物理上装不上，没有补救；
        而直径 / 宽度 / 工艺都是偏好区间，选偏了不理想但能用。

        中心孔与偏距是同样的硬门槛，但规格 §5.1 明确首发不做这两项筛选 ——
        于是**孔距一个人扛下了整个「能不能装」的职责**。把它放在第 4 位、
        要滚过 22 个选项才能看到，是说不通的（2026-10-06 实测：它曾在 1367px 处，
        完全在 900px 首屏之外）。

        反方证据也记一下，免得日后被当成疏漏：Vossen 用 Series/Size/Price、
        Fitment Industries 画廊用直径优先 —— 但那两个都是**视觉画廊**，
        用户在看效果；本页是**生产目录**，用户在看能不能装。
      */}

      {/* ① 孔距 —— 门禁。16 个值，买家通常只关心 1–3 个 → 带搜索。 */}
      <PcdSearchGroup
        legend="Bolt pattern (PCD)"
        name="pcd"
        options={facets.pcds}
        selected={query.pcds}
        idPrefix={idPrefix}
        columns={2}
      />

      {/* ② 直径 —— 最直观、最常用，6 个值不需要折叠或搜索。 */}
      <CheckboxGroup
        legend="Diameter"
        name="diameter"
        options={facets.diameters}
        selected={query.diameters}
        idPrefix={idPrefix}
        columns={3}
      />

      {/* ③ 宽度 —— 11 个值，其中 4 个合计只覆盖 7 个型号 → 长尾收起。 */}
      <CheckboxGroup
        legend="Width"
        name="width"
        options={facets.widths}
        selected={query.widths}
        idPrefix={idPrefix}
        collapseAfter={5}
        columns={2}
      />

      {/* ④ 工艺 —— 偏好，不是约束，所以最后。 */}
      {lockedProcesses.length > 0 ? (
        /*
         * 锁定工艺：没有 checkbox，因此也没有可从 URL 移除的轴。
         * 这里必须让访客看见边界是什么 —— 否则「为什么只有这些型号」
         * 在界面上无从解释，且看起来像是筛选还没加载完。
         */
        <div className="mt-6 border-t border-border pt-5">
          <p className="eyebrow !text-ink">Recorded process</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {lockedProcesses.map((key) => (
              <li
                key={key}
                className="inline-flex min-h-8 items-center rounded-full border border-forge/45 bg-forge-soft px-3 text-[0.75rem] text-ink"
              >
                {processLabelFor(key)}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.72rem] leading-relaxed text-muted-foreground">
            This page only shows models whose production record states one of the
            processes above. The process filter cannot be widened from the URL.
          </p>
        </div>
      ) : (
        <CheckboxGroup
          legend="Recorded process"
          name="process"
          options={facets.processes}
          selected={query.processes}
          idPrefix={idPrefix}
        />
      )}

      </div>
    </>
  );
}

/**
 * 筛选面板 —— 桌面左侧栏 + 移动抽屉。
 *
 * 排序**不在这里**：结果数与排序在同一个上下文（§9），由 `WheelCatalogueSort`
 * 渲染在结果标题旁。筛选表单用一个隐藏域把当前排序带过去，改筛选不会把排序冲掉。
 */
export function WheelCatalogueFilters(props: CatalogueFilterProps) {
  const { query, lockedProcesses = [], basePath = CATALOGUE_PATH } = props;
  const appliedCount =
    (query.q ? 1 : 0) +
    (query.diameters?.length ?? 0) +
    (query.widths?.length ?? 0) +
    (query.pcds?.length ?? 0) +
    (lockedProcesses.length > 0 ? 0 : (query.processes?.length ?? 0));
  const sortPairs: Array<[string, string]> =
    query.sort && query.sort !== "model-asc" ? [["sort", query.sort]] : [];

  return (
    <>
      {/* 移动：原生 details 抽屉，无 JS 可展开（§10 末条） */}
      <details className="group rounded-lg border border-border bg-card lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none">
          <span className="font-display text-[0.78rem] font-700 uppercase tracking-[0.14em] text-ink">
            Filters
          </span>
          <span className="text-[0.75rem] text-muted-foreground">
            {appliedCount > 0 ? `${appliedCount} applied` : "All models"}
          </span>
          <span
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-display text-[0.9rem] font-700 leading-none text-steel transition-transform duration-200 ease-out group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <div className="border-t border-border px-4 pb-5 pt-5">
          <form method="get" action={basePath} aria-label="Filter the wheel catalogue">
            {sortPairs.map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <FilterFields {...props} idPrefix="mobile" />
          </form>
        </div>
      </details>

      {/* 桌面：左栏常驻（sticky 由页面容器提供）；表单本身是 flex 列，
          好让「筛选区滚动 + 主行动常驻」成立。 */}
      <aside aria-label="Catalogue filters" className="hidden lg:block">
        <form
          method="get"
          action={basePath}
          aria-label="Filter the wheel catalogue"
          className="lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col"
        >
          {sortPairs.map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <FilterFields {...props} idPrefix="desktop" />
        </form>
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * 已应用筛选 chips（抽屉外，可移除；§10）
 * ------------------------------------------------------------------------- */

type Chip = { key: string; label: string; href: string };

function labelFor(
  options: FacetOption[],
  value: string,
  fallback: string,
): string {
  return options.find((o) => o.value === value)?.label ?? fallback;
}

function buildChips(
  facets: CatalogueFacets,
  query: WheelCatalogueInput,
  lockedProcesses: readonly ProcessKey[] = [],
  basePath = CATALOGUE_PATH,
): Chip[] {
  const chips: Chip[] = [];
  /** 所有 chip 的 href 都回到本路由，并带上锁定工艺。 */
  const href = (
    next: WheelCatalogueInput,
    overrides: { page?: number } = {},
  ) => buildCatalogueHref(next, { ...overrides, path: basePath, lockedProcesses });

  if (query.q) {
    chips.push({
      key: "q",
      label: `Search “${query.q}”`,
      href: href({ ...query, q: undefined }, { page: 1 }),
    });
  }

  for (const d of query.diameters ?? []) {
    chips.push({
      key: `diameter-${d}`,
      label: `Diameter ${labelFor(facets.diameters, String(d), `${d}"`)}`,
      href: href(
        { ...query, diameters: (query.diameters ?? []).filter((x) => x !== d) },
        { page: 1 },
      ),
    });
  }

  for (const w of query.widths ?? []) {
    chips.push({
      key: `width-${w}`,
      label: `Width ${labelFor(facets.widths, String(w), `${w}"`)}`,
      href: href(
        { ...query, widths: (query.widths ?? []).filter((x) => x !== w) },
        { page: 1 },
      ),
    });
  }

  for (const p of query.pcds ?? []) {
    chips.push({
      key: `pcd-${p}`,
      label: `PCD ${labelFor(facets.pcds, p, p.replace(/x/g, "×"))}`,
      href: href(
        { ...query, pcds: (query.pcds ?? []).filter((x) => x !== p) },
        { page: 1 },
      ),
    });
  }

  // 锁定工艺**不生成 chip**：它没有「移除」这个动作（§4）。
  if (lockedProcesses.length === 0) {
    for (const key of query.processes ?? []) {
      chips.push({
        key: `process-${key}`,
        label: `Process ${labelFor(facets.processes, key, key)}`,
        href: href(
          { ...query, processes: (query.processes ?? []).filter((x) => x !== key) },
          { page: 1 },
        ),
      });
    }
  }

  return chips;
}

export function WheelCatalogueAppliedChips({
  facets,
  query,
  lockedProcesses = [],
  basePath = CATALOGUE_PATH,
  className,
}: {
  facets: CatalogueFacets;
  query: WheelCatalogueInput;
  /** 锁定工艺 —— 不出 chip（它没有「移除」动作）。 */
  lockedProcesses?: ProcessKey[];
  /** 结果 URL 的基础路径。默认轮毂总目录。 */
  basePath?: string;
  className?: string;
}) {
  const chips = buildChips(facets, query, lockedProcesses, basePath);
  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="sr-only">Applied filters</span>
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[0.75rem] text-foreground transition-colors hover:border-forge/60 hover:text-forge focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forge"
        >
          {chip.label}
          <span aria-hidden="true" className="text-muted-foreground">
            ×
          </span>
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}
      <Link
        href={basePath}
        className="inline-flex min-h-8 items-center px-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.13em] text-forge transition-colors hover:text-forge-deep"
      >
        Clear all
      </Link>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 排序（原生 select + 显式提交按钮 —— 无 JS 也能排序）
 * ------------------------------------------------------------------------- */

export function WheelCatalogueSort({
  query,
  lockedProcesses = [],
  basePath = CATALOGUE_PATH,
}: {
  query: WheelCatalogueInput;
  /** 锁定工艺不写进隐藏域 —— 否则等于给了它一个可编辑的 URL 出口。 */
  lockedProcesses?: ProcessKey[];
  /** 结果 URL 的基础路径。默认轮毂总目录。 */
  basePath?: string;
}) {
  return (
    <form
      method="get"
      action={basePath}
      className="flex items-center gap-2"
      aria-label="Sort the wheel catalogue"
    >
      {snapshotPairs(query, lockedProcesses).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <label
        htmlFor="catalogue-sort"
        className="font-display text-[0.72rem] font-600 uppercase tracking-[0.12em] text-muted-foreground"
      >
        Sort
      </label>
      <select
        id="catalogue-sort"
        name="sort"
        defaultValue={query.sort ?? "model-asc"}
        className="min-h-11 rounded-md border border-border bg-card px-3 text-[0.82rem] text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forge"
      >
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="min-h-11 rounded-md border border-border bg-card px-3 font-display text-[0.72rem] font-700 uppercase tracking-[0.12em] text-ink transition-colors hover:border-forge focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forge"
      >
        Apply
      </button>
    </form>
  );
}
