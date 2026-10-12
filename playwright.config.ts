import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;
// A production build uses .next while a developer's Next 16 dev server uses
// .next/dev. This lets the full suite run in isolation without taking down the
// user's preview (and without reusing its potentially live WordPress settings).
const useProductionServer = process.env.PLAYWRIGHT_PRODUCTION === "1";
const useLiveWpReadOnly = process.env.PLAYWRIGHT_LIVE_WP === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      // 默认隔离本地 WordPress；仅显式设置 PLAYWRIGHT_LIVE_WP=1 时读取本地内容。
      // 验收脚本不提交询盘，不触发真实邮件。
      `WP_MODE=${useLiveWpReadOnly ? "live" : "mock"} ` +
      `NEXT_PUBLIC_APP_URL=${baseURL} ` +
      "NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION=privacy-e2e " +
      "INQUIRY_RECEIPT_SECRET=e2e-receipt-secret " +
      "WP_PREVIEW_SECRET=e2e-preview-secret " +
      "WP_REVALIDATE_SECRET=e2e-revalidate-secret " +
      (useProductionServer
        ? `npm run start -- --hostname 127.0.0.1 --port ${port}`
        : `npm run dev -- --hostname 127.0.0.1 --port ${port}`),
    url: baseURL,
    // A different local Next.js project may already own this port. Reusing any
    // HTTP 200 server silently runs the suite against the wrong application.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
