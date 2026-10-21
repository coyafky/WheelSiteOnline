/**
 * Startup validation for environment configuration.
 *
 * Before this, a missing variable surfaced only when the code path that needed
 * it ran: an absent `NEXT_PUBLIC_APP_URL` silently emptied the sitemap and
 * disallowed crawling; an absent `WP_INQUIRY_SERVICE_KEY` made every enquiry
 * answer 503. Both were discoverable only by exercising the site — or by a
 * customer noticing.
 *
 * The rules live here so they can be tested and reused; `instrumentation.ts`
 * calls the reporter once at boot.
 *
 * Deliberately depends on nothing but `process.env`: importing the WordPress
 * client (for `getWpConfig`) would drag `server-only` and the CMS layer into a
 * module that must load in every runtime.
 */

export type EnvSeverity = "error" | "warn";

export type EnvIssue = {
  /** Variable name. Never the value. */
  key: string;
  severity: EnvSeverity;
  problem: string;
  impact: string;
};

export type EnvReading = Record<string, string | undefined>;

/** A variable that must be present once the site is meant to be live. */
type Rule = {
  key: string;
  severity: EnvSeverity;
  problem: string;
  impact: string;
  /** Only enforced in production; other environments get a warning instead. */
  productionOnly?: boolean;
  /** Extra check beyond presence. */
  invalid?: (value: string) => string | null;
};

const isUrl = (value: string): string | null => {
  try {
    new URL(value);
    return null;
  } catch {
    return "不是合法 URL";
  }
};

const RULES: readonly Rule[] = [
  {
    key: "NEXT_PUBLIC_APP_URL",
    severity: "error",
    problem: "未配置",
    impact: "canonical/OG/sitemap 无基址：sitemap 为空、robots 全站禁抓",
    invalid: isUrl,
  },
  {
    key: "WP_MODE",
    severity: "error",
    problem: "未配置",
    impact: "无法判定内容来源；非 live 一律按 mock 处理，前台读不到 CMS 内容",
  },
  {
    key: "WP_INQUIRY_SERVICE_KEY",
    severity: "error",
    problem: "未配置",
    impact: "询盘写入返回 503，客户线索无法落库",
    productionOnly: true,
  },
  {
    key: "WP_REVALIDATE_SECRET",
    severity: "error",
    problem: "未配置",
    impact: "WordPress 缓存失效 webhook 全部 401，发布/撤回不会反映到前台",
    productionOnly: true,
  },
  {
    key: "WP_PREVIEW_SECRET",
    severity: "warn",
    problem: "未配置",
    impact: "编辑预览不可用（不影响公开站点）",
  },
  {
    key: "INQUIRY_RECEIPT_SECRET",
    severity: "warn",
    problem: "未配置",
    impact: "回执签名回落到 WP_INQUIRY_SERVICE_KEY，轮换会同时打断两条链路",
  },
  {
    key: "INQUIRY_TO",
    severity: "warn",
    problem: "未配置",
    impact: "销售收不到询盘通知邮件（询盘本身仍会入库）",
    productionOnly: true,
  },
];

export type EnvValidation = {
  /** true when nothing would break a live site. */
  ok: boolean;
  issues: EnvIssue[];
  /** NODE_ENV as observed, for the log line. */
  environment: string;
};

/**
 * Validate a set of readings. Pure, so tests can drive it with fixtures.
 *
 * `production` is passed in rather than read from `process.env` so a test does
 * not have to mutate the process environment.
 */
export function validateEnv(
  env: EnvReading,
  options: { production: boolean },
): EnvValidation {
  const issues: EnvIssue[] = [];
  const value = (key: string) => (env[key] ?? "").trim();

  for (const rule of RULES) {
    const raw = value(rule.key);
    const missing = raw === "";

    if (missing) {
      // A production-only rule is a warning elsewhere: a local `next dev`
      // session legitimately has no CMS secrets.
      const severity: EnvSeverity =
        rule.productionOnly && !options.production ? "warn" : rule.severity;
      issues.push({
        key: rule.key,
        severity,
        problem: rule.productionOnly && !options.production
          ? `${rule.problem}（仅生产必须）`
          : rule.problem,
        impact: rule.impact,
      });
      continue;
    }

    const invalid = rule.invalid?.(raw);
    if (invalid) {
      issues.push({
        key: rule.key,
        severity: "error",
        problem: invalid,
        impact: rule.impact,
      });
    }
  }

  return {
    ok: issues.every((issue) => issue.severity !== "error"),
    issues,
    environment: options.production ? "production" : "development",
  };
}

/** Read the live process environment and validate it. */
export function validateProcessEnv(): EnvValidation {
  return validateEnv(process.env as EnvReading, {
    production: process.env.NODE_ENV === "production",
  });
}

/**
 * Format a report for the server log.
 *
 * Values are never printed — only names, so a log shipped off-box cannot leak a
 * secret.
 */
export function formatEnvReport(result: EnvValidation): string {
  if (result.issues.length === 0) {
    return `[env] configuration OK (${result.environment})`;
  }
  const lines = result.issues.map((issue) => {
    const mark = issue.severity === "error" ? "ERROR" : "WARN ";
    return `  ${mark} ${issue.key}: ${issue.problem} → ${issue.impact}`;
  });
  const errors = result.issues.filter((i) => i.severity === "error").length;
  const warnings = result.issues.length - errors;
  return [
    `[env] ${result.environment} 配置自检：${errors} 个错误 / ${warnings} 个警告`,
    ...lines,
  ].join("\n");
}

/**
 * Report at boot.
 *
 * Reports, never throws. A missing variable must not stop the process: the
 * remaining configuration may be perfectly usable (the home page still renders
 * from fallback content when the CMS is unreachable), and crashing would turn a
 * degraded site into a hard outage. The failures are loud in the log and visible
 * on `/api/health`.
 */
export function reportEnvAtStartup(): EnvValidation {
  const result = validateProcessEnv();
  if (result.issues.length === 0) {
    console.log(formatEnvReport(result));
  } else if (result.ok) {
    console.warn(formatEnvReport(result));
  } else {
    console.error(formatEnvReport(result));
  }
  return result;
}
