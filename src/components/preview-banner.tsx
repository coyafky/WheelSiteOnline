"use client";

import { useRouter } from "next/navigation";

export function PreviewBanner({
  enabled,
  status,
  exitHref = "/insights",
}: {
  enabled: boolean;
  status?: string;
  exitHref?: string;
}) {
  const router = useRouter();
  if (!enabled) return null;

  async function exitPreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/preview/exit", { method: "POST" });
    if (!response.ok) return;
    router.replace(exitHref);
    router.refresh();
  }

  return (
    <aside
      role="status"
      className="fixed inset-x-0 top-0 z-[80] flex min-h-11 items-center justify-center gap-4 bg-forge-deep px-4 py-2 text-sm font-semibold text-white"
    >
      <span>WordPress preview{status ? ` · ${status}` : ""}</span>
      <form action="/api/preview/exit" method="post" onSubmit={exitPreview}>
        <button
          type="submit"
          className="rounded-full border border-white/60 px-3 py-1 text-xs uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Exit preview
        </button>
      </form>
    </aside>
  );
}
