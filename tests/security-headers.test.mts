import assert from "node:assert/strict";
import { after, test } from "node:test";
import nextConfig from "../next.config.ts";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

after(() => {
  if (originalAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
});

async function responseHeaders(): Promise<Map<string, string>> {
  const headers = nextConfig.headers;
  if (typeof headers !== "function") {
    assert.fail("next.config.ts 必须提供 headers() 安全响应头配置。");
  }
  const rules = await headers();
  const catchAll = rules.find((rule) => rule.source === "/:path*");
  assert.ok(catchAll);
  return new Map(catchAll.headers.map(({ key, value }) => [key, value]));
}

test("HTTP 测试地址不会把静态资源强制升级到 HTTPS", async () => {
  process.env.NEXT_PUBLIC_APP_URL = "http://119.91.205.130:9080";
  const headers = await responseHeaders();

  assert.doesNotMatch(
    headers.get("Content-Security-Policy") ?? "",
    /upgrade-insecure-requests/,
  );
  assert.equal(headers.has("Strict-Transport-Security"), false);
});

test("HTTPS 正式地址保留资源升级与 HSTS", async () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://www.example.com";
  const headers = await responseHeaders();

  assert.match(
    headers.get("Content-Security-Policy") ?? "",
    /upgrade-insecure-requests/,
  );
  assert.equal(
    headers.get("Strict-Transport-Security"),
    "max-age=31536000; includeSubDomains",
  );
});

test("开发环境允许 React 调试栈使用 eval，但生产环境不允许", async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  let developmentHeaders: Map<string, string>;
  let productionHeaders: Map<string, string>;
  try {
    Reflect.set(process.env, "NODE_ENV", "development");
    developmentHeaders = await responseHeaders();

    Reflect.set(process.env, "NODE_ENV", "production");
    productionHeaders = await responseHeaders();
  } finally {
    if (originalNodeEnv === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Reflect.set(process.env, "NODE_ENV", originalNodeEnv);
  }

  assert.match(
    developmentHeaders.get("Content-Security-Policy") ?? "",
    /script-src[^;]*'unsafe-eval'/,
  );
  assert.doesNotMatch(
    productionHeaders.get("Content-Security-Policy") ?? "",
    /script-src[^;]*'unsafe-eval'/,
  );
});

test("开发服务器允许通过 127.0.0.1 加载交互资源", () => {
  assert.ok(
    nextConfig.allowedDevOrigins?.includes("127.0.0.1"),
    "使用 --hostname 0.0.0.0 启动时，必须允许 127.0.0.1 请求 Next.js 开发资源。",
  );
});
