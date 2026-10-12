import { defineConfig, devices } from "@playwright/test";

/**
 * P3 临时回归配置 —— 复用已在 3200 运行的开发服务器。
 *
 * 为什么不是默认 `playwright.config.ts`：Next 16 的开发锁按项目目录持有，
 * 3200 上的服务器已握着它，再起一个只会 `exit 1`。任务书明确要求**复用** 3200，
 * 因此本配置 `reuseExistingServer: true`，**不启动**第二个 `next dev`。
 *
 * 3200 运行在 `WP_MODE=live`（用户自己的开发服务器）。安全边界由测试自身保证：
 * 询盘提交全部走 `mockInquiryResponse` 拦截 `/api/inquiries`，
 * 不会到达 WordPress / QQ SMTP（DEC-092）。本配置不写任何 `.env`。
 */
const port = Number(process.env.P3_PORT ?? 3200);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /astryx-product\.spec\.ts/,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "true", // 不启动服务器；复用 3200。
    url: baseURL,
    reuseExistingServer: true,
    timeout: 5_000,
  },
});
