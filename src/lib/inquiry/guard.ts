import { createHash } from "node:crypto";

const WINDOW_MS = 10 * 60 * 1000;
const MIN_FILL_MS = 1_500;
const MAX_FILL_MS = 24 * 60 * 60 * 1000;

/**
 * 每 10 分钟窗口内允许的提交次数。
 *
 * 为什么这两个数不能太小：**幂等重放也消耗额度**（重放走的是同一条
 * rateLimit() 路径），而一次网络抖动重试就会产生一次计数。旧的 3/6 让
 * 「一个真实买家点一下按钮、手抖几次」就能把自己封掉 —— 实测同一幂等键
 * 并发 15 次会产生 1×201 + 5×200 + 9×429。
 *
 * 放宽后真正的反脚本主力仍是另外两道：automationTrap（按填表耗时判定）
 * 与 Origin 白名单；限流只做兜底。
 *
 * 默认 10 / 60：
 *   - email 10：同一邮箱 10 分钟内提 10 个询盘，已远超任何真实买家的意图；
 *     再往上等于取消这道防护。
 *   - IP 60：共享出口 IP 是真实场景（展会现场、公司办公室多人同时提问），
 *     6 次会让第二个同事直接撞墙。
 *
 * 这两个数可以按环境覆盖，避免调参要改代码重建镜像。
 * 非法或非正数一律回落到默认值 —— 配错不能让防护静默失效。
 */
const DEFAULT_MAX_BY_IP = 60;
const DEFAULT_MAX_BY_EMAIL = 10;

function readLimit(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

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

function retryAfterSeconds(current: Counter, now: number): number {
  return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
}

function consume(key: string, limit: number, now: number): number | null {
  const current = counters.get(key);
  if (!current || current.resetAt <= now) {
    counters.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  // 已达上限就**不再自增**（用 >= 而不是 >）。
  // 若在被拦的那次也自增，计数会停在 limit+1，于是「退一次款」只能把计数
  // 拉回 limit，下一次请求又变成 limit+1 —— 退款永远追不平，重放依然被封。
  // 窗口内计数只需要区分「到没到上限」，不需要精确计数超额的次数。
  if (current.count >= limit) return retryAfterSeconds(current, now);
  current.count += 1;
  return null;
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
  const ipKey = hashedRateLimitKey("ip", clientAddress(request));
  const emailKey = hashedRateLimitKey("email", email);
  // 两个桶**都会**被计费：IP 未超限时（返回 null）继续走到 email 桶。
  // 所以退款也必须两个桶一起退，见 refundRateLimit。
  const limitedByIp = consume(ipKey, readLimit("INQUIRY_RATE_LIMIT_IP", DEFAULT_MAX_BY_IP), now);
  if (limitedByIp !== null) return limitedByIp;
  return consume(emailKey, readLimit("INQUIRY_RATE_LIMIT_EMAIL", DEFAULT_MAX_BY_EMAIL), now);
}

/**
 * 退还一次额度 —— 只给**幂等重放**用。
 *
 * 重放不是一次新的提交意图：数据库里什么都没新增，返回的是同一个询盘号。
 * 让它消耗额度，等于把「网络抖动重试」记成用户行为，真实买家会因此被封。
 *
 * 只做减 1，不删桶：
 *   - 减 1 对重放恰好，对「一次提交被计了两次」的夹具是尽力而为。
 *   - **绝不能删桶**：删了就等于给每个知道幂等键的人一个重置计数的入口。
 * 计数本就封顶在 limit + 1（consume 超限后不再自增），所以减 1 不会回到负数区间。
 */
export function refundRateLimit(request: Request, email: string, now = Date.now()): void {
  // 一次**放行**的请求会把 IP 桶与 email 桶**各加 1**（rateLimit 里 IP 未超限时
  // 会继续走到 email）。所以退一次必须两个桶各退 1 —— 只退第一个桶会让 email
  // 计数永远追不平，退完仍然被限流（这正是最初的实现被测试抓到的 bug）。
  for (const key of [
    hashedRateLimitKey("ip", clientAddress(request)),
    hashedRateLimitKey("email", email),
  ]) {
    const counter = counters.get(key);
    if (counter && counter.resetAt > now) {
      counter.count = Math.max(0, counter.count - 1);
    }
  }
}

/** 仅供自动测试清理进程内计数。 */
export function resetRateLimitsForTest(): void {
  counters.clear();
}
