import Link from "next/link";

import { cn } from "@/lib/utils";
import { buildCatalogueHref, type ProcessKey, type WheelCatalogueInput } from "@/lib/wheels";

/**
 * 目录分页（PAGE-SPECS/wheel-catalog.md §5.4、§9、§10）。
 *
 * ── 为什么是普通 `<a href>` ─────────────────────────────────────────────────
 * §5.4：「使用可爬取的普通链接和服务端结果，不用无限滚动作为唯一导航」。
 * 每个页码都是一条真实的、可被爬虫跟随的 URL，带着完整的筛选状态；
 * **无 JS 时照样能翻页**（§10 末条）。
 *
 * 上一页 / 下一页 / 当前页 / 邻近页，总页数很大时用省略号（§5.4）。
 * 触控目标 ≥44×44（§10）。
 */

/** 页码序列：首尾 + 当前页 ±1，跳过处插一个省略号。 */
function pageWindow(page: number, totalPages: number): Array<number | "gap"> {
  const out: Array<number | "gap"> = [];
  let last = 0;
  for (let n = 1; n <= totalPages; n += 1) {
    const nearCurrent = Math.abs(n - page) <= 1;
    const edge = n === 1 || n === totalPages;
    if (!nearCurrent && !edge) continue;
    if (last !== 0 && n - last > 1) out.push("gap");
    out.push(n);
    last = n;
  }
  return out;
}

function PageLink({
  href,
  label,
  rel,
  current = false,
}: {
  href: string;
  label: string;
  rel?: "prev" | "next";
  current?: boolean;
}) {
  return (
    <Link
      href={href}
      rel={rel}
      aria-current={current ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center border px-3 font-display text-[0.78rem] font-700 uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forge",
        current
          ? "border-forge bg-forge text-white"
          : "border-border bg-white text-ink hover:border-forge hover:text-forge",
      )}
    >
      {label}
    </Link>
  );
}

function DisabledPage({ label }: { label: string }) {
  return (
    <span
      aria-disabled="true"
      className="inline-flex min-h-11 min-w-11 items-center justify-center border border-border bg-white px-3 font-display text-[0.78rem] font-700 uppercase tracking-[0.1em] text-muted-foreground opacity-50"
    >
      {label}
    </span>
  );
}

export function WheelCataloguePagination({
  query,
  page,
  totalPages,
  lockedProcesses = [],
  basePath,
  className,
}: {
  query: WheelCatalogueInput;
  page: number;
  totalPages: number;
  /**
   * 本路由锁定的工艺。传了就**不把 `process` 写进页码 URL**。
   *
   * 漏了这一项会让子目录的「第 2 页」变成一条能放宽工艺边界的 URL ——
   * 页面本身锁住了，分页链接却把它解开了。
   */
  lockedProcesses?: readonly ProcessKey[];
  /**
   * 结果 URL 的基础路径。默认轮毂总目录。
   *
   * 子目录必须传自己的路径，否则翻页会把访客悄悄送回总目录
   * （结果集变大、上下文丢失，而且是静默的）。
   */
  basePath?: string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) =>
    buildCatalogueHref(query, { page: target, path: basePath, lockedProcesses });

  return (
    <nav
      aria-label="Catalogue pagination"
      className={cn("mt-10 flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      {page > 1 ? (
        <PageLink
          href={href(page - 1)}
          label="Previous"
          rel="prev"
        />
      ) : (
        <DisabledPage label="Previous" />
      )}

      {pageWindow(page, totalPages).map((item, index) =>
        item === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-muted-foreground"
          >
            …
          </span>
        ) : (
          <PageLink
            key={item}
            href={href(item)}
            label={String(item)}
            current={item === page}
          />
        ),
      )}

      {page < totalPages ? (
        <PageLink href={href(page + 1)} label="Next" rel="next" />
      ) : (
        <DisabledPage label="Next" />
      )}
    </nav>
  );
}
