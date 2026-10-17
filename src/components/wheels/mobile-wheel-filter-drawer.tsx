"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hidden && element.getClientRects().length > 0,
  );
}

/**
 * 移动筛选的渐进增强层。
 *
 * 服务端仍输出原生 `<details>` + GET 表单；JS 可用时才把内容提升为固定抽屉，
 * 加上 dialog 语义、遮罩、焦点锁定、Escape 关闭和关闭后返回触发器。这样 JS
 * 失败或被禁用时不会留下一个无法提交的假控件。
 */
export function MobileWheelFilterDrawer({
  summaryLabel,
  summaryAriaLabel,
  summaryMeta,
  dialogTitle,
  closeLabel,
  children,
}: {
  summaryLabel: string;
  summaryAriaLabel: string;
  summaryMeta: string;
  dialogTitle: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const details = detailsRef.current;
    const summary = summaryRef.current;
    const panel = panelRef.current;
    if (!details || !summary || !panel) return;

    const closeButton = panel.querySelector<HTMLButtonElement>("[data-mobile-filter-close]");
    const backdrop = details.querySelector<HTMLButtonElement>("[data-mobile-filter-backdrop]");
    const previousBodyOverflow = document.body.style.overflow;
    let wasOpen = details.open;

    const close = () => {
      details.open = false;
    };

    const syncState = () => {
      const open = details.open;
      details.dataset.jsReady = "true";
      summary.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-hidden", String(!open));
      if (backdrop) backdrop.hidden = !open;

      if (open) {
        document.body.style.overflow = "hidden";
        window.requestAnimationFrame(() => {
          closeButton?.focus({ preventScroll: true });
        });
      } else {
        document.body.style.overflow = previousBodyOverflow;
        if (wasOpen && panel.contains(document.activeElement)) {
          summary.focus({ preventScroll: true });
        }
      }
      wasOpen = open;
    };

    const onToggle = () => syncState();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !details.open) return;
      const focusable = focusableElements(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    details.addEventListener("toggle", onToggle);
    panel.addEventListener("keydown", onKeyDown);
    closeButton?.addEventListener("click", close);
    backdrop?.addEventListener("click", close);
    syncState();

    return () => {
      details.removeEventListener("toggle", onToggle);
      panel.removeEventListener("keydown", onKeyDown);
      closeButton?.removeEventListener("click", close);
      backdrop?.removeEventListener("click", close);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  const dialogId = "mobile-wheel-filter-dialog";

  return (
    <details
      ref={detailsRef}
      data-catalogue-mobile-filter
      className="group/mobile-filter border border-border bg-white lg:hidden"
    >
      <summary
        ref={summaryRef}
        role="button"
        aria-label={summaryAriaLabel}
        aria-controls={dialogId}
        aria-expanded="false"
        className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 bg-ink px-4 py-3 text-white marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forge"
      >
        <span className="font-display text-[0.78rem] font-700 uppercase tracking-[0.14em] text-white">
          {summaryLabel}
        </span>
        <span className="text-[0.75rem] text-white/70">{summaryMeta}</span>
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center font-display text-[1rem] font-700 leading-none text-forge transition-transform duration-200 ease-out group-open/mobile-filter:rotate-45"
        >
          +
        </span>
      </summary>

      <button
        type="button"
        data-mobile-filter-backdrop
        hidden
        aria-label={closeLabel}
        className="fixed inset-0 z-40 hidden bg-ink/45 lg:hidden"
      />

      <div
        ref={panelRef}
        id={dialogId}
        data-mobile-filter-panel
        role="dialog"
        aria-labelledby={`${dialogId}-title`}
        tabIndex={-1}
        className="border-t border-border px-4 pb-5 pt-5"
      >
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
          <h2
            id={`${dialogId}-title`}
            className="font-display text-[0.78rem] font-700 uppercase tracking-[0.14em] text-ink"
          >
            {dialogTitle}
          </h2>
          <button
            type="button"
            data-mobile-filter-close
            aria-label={closeLabel}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border text-xl leading-none text-ink transition-colors hover:border-forge hover:text-forge focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forge"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </details>
  );
}
