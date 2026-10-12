import { createHash } from "node:crypto";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_BY_IP = 6;
const MAX_BY_EMAIL = 3;
const MIN_FILL_MS = 1_500;
const MAX_FILL_MS = 24 * 60 * 60 * 1000;

type Counter = { count: number; resetAt: number };
const counters = new Map<string, Counter>();

function configuredOrigins(): Set<string> {
  const values = [
    process.env.NEXT_PUBLIC_APP_URL,
    ...(process.env.INQUIRY_ALLOWED_ORIGINS ?? "").split(","),
  ];
  const origins = new Set<string>();
  for (const raw of values) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      origins.add(new URL(value).origin);
    } catch {
      // 构建配置校验会报告无效 URL；这里保持 fail-closed。
    }
  }
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return origins;
}

export function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  if (process.env.NODE_ENV !== "production") {
    try {
      const url = new URL(origin);
      if (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname)) {
        return true;
      }
    } catch {
      // Fall through to the configured-origin check.
    }
  }
  return configuredOrigins().has(origin);
}

export function automationTrap(body: unknown, now = Date.now()): string | null {
  if (!body || typeof body !== "object") return "Invalid submission.";
  const raw = body as Record<string, unknown>;
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return "Unable to accept this submission.";
  }
  if (typeof raw.formStartedAt !== "number") return "Please reload the form and try again.";
  const elapsed = now - raw.formStartedAt;
  if (elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return "Please reload the form and try again.";
  }
  return null;
}

function consume(key: string, limit: number, now: number): number | null {
  const current = counters.get(key);
  if (!current || current.resetAt <= now) {
    counters.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  current.count += 1;
  if (current.count <= limit) return null;
  return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
}

function clientAddress(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  ).slice(0, 80);
}

/** 限流存储只保留不可逆摘要，不把 IP 或邮箱原文放进进程内键。 */
export function hashedRateLimitKey(kind: "ip" | "email", value: string): string {
  const normalized = value.trim().toLowerCase();
  const digest = createHash("sha256").update(normalized).digest("hex");
  return `${kind}:${digest}`;
}

export function rateLimit(request: Request, email: string, now = Date.now()): number | null {
  if (counters.size > 5_000) {
    for (const [key, value] of counters) {
      if (value.resetAt <= now) counters.delete(key);
    }
  }
  return consume(hashedRateLimitKey("ip", clientAddress(request)), MAX_BY_IP, now)
    ?? consume(hashedRateLimitKey("email", email), MAX_BY_EMAIL, now);
}

/** 仅供自动测试清理进程内计数。 */
export function resetRateLimitsForTest(): void {
  counters.clear();
}
