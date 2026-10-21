/**
 * Next.js instrumentation hook — runs once when the server process starts.
 *
 * Used here only to validate environment configuration at boot, so a missing
 * variable is reported in the startup log instead of surfacing later as an empty
 * sitemap or a 503 on the enquiry endpoint.
 *
 * `register()` executes in every runtime; the Node-only work is guarded so the
 * edge runtime does not try to load it.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { reportEnvAtStartup } = await import("@/lib/env/validate");
  reportEnvAtStartup();
}
