import { NextResponse } from "next/server";
import { getWpConfig } from "@/lib/wordpress/client";
import { SITE_PAGES_CACHE_TAG } from "@/lib/wordpress/pages-contract";

/**
 * Application health check.
 *
 * The previous container probe fetched `/robots.txt`, a statically generated
 * route. It answered 200 even when the CMS was unreachable or the enquiry
 * endpoint was misconfigured — so the orchestrator reported "healthy" for a site
 * that could not serve its own content. A probe that cannot fail is not a probe.
 *
 * This endpoint checks what actually matters:
 *   - the process can render (trivially true if we got here)
 *   - the CMS answers when the site is supposed to be live
 *   - required configuration is present for the features that depend on it
 *
 * Status semantics:
 *   200  all checks pass, or degraded-but-serving (warnings only)
 *   503  a critical dependency is down
 *
 * It reports booleans and error class names — never URLs, credentials or
 * response bodies.
 */

type CheckStatus = "ok" | "warn" | "fail";

type Check = {
  name: string;
  status: CheckStatus;
  detail?: string;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CMS_TIMEOUT_MS = 3000;

async function checkCms(mode: string, baseUrl: string): Promise<Check> {
  if (mode !== "live") {
    // Mock mode is a deliberate configuration, not a fault. It is a warning so
    // a misconfigured production deploy (which should be `live`) is visible.
    return { name: "cms", status: "warn", detail: "mock-mode" };
  }
  if (!baseUrl) {
    return { name: "cms", status: "fail", detail: "not-configured" };
  }

  try {
    const response = await fetch(`${baseUrl}/fh/v1/pages?key=home`, {
      signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return { name: "cms", status: "fail", detail: `http-${response.status}` };
    }
    return { name: "cms", status: "ok" };
  } catch (error) {
    return {
      name: "cms",
      status: "fail",
      detail: error instanceof Error ? error.name : "unknown",
    };
  }
}

function checkSiteUrl(): Check {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) {
    // Without it, sitemap is empty and robots disallows everything. That is
    // fail-closed and correct for a preview, but it must never ship unnoticed,
    // so it surfaces as a warning on every probe.
    return { name: "site-url", status: "warn", detail: "not-configured" };
  }
  try {
    new URL(raw);
    return { name: "site-url", status: "ok" };
  } catch {
    return { name: "site-url", status: "fail", detail: "malformed" };
  }
}

function checkRevalidateSecret(): Check {
  const configured = Boolean(process.env.WP_REVALIDATE_SECRET?.trim());
  return configured
    ? { name: "revalidate-secret", status: "ok" }
    : { name: "revalidate-secret", status: "warn", detail: "not-configured" };
}

function checkInquiryServiceKey(): Check {
  const configured = Boolean(process.env.WP_INQUIRY_SERVICE_KEY?.trim());
  // Without it the enquiry endpoint answers 503, i.e. no lead can be captured.
  return configured
    ? { name: "inquiry-key", status: "ok" }
    : { name: "inquiry-key", status: "fail", detail: "not-configured" };
}

export async function GET() {
  const config = getWpConfig();

  const checks: Check[] = [
    checkSiteUrl(),
    checkInquiryServiceKey(),
    checkRevalidateSecret(),
    await checkCms(config.mode, config.baseUrl),
  ];

  const failed = checks.filter((check) => check.status === "fail");
  const warned = checks.filter((check) => check.status === "warn");
  const status = failed.length > 0 ? 503 : 200;

  return NextResponse.json(
    {
      status: failed.length > 0 ? "unhealthy" : warned.length > 0 ? "degraded" : "healthy",
      checks,
      // A stable marker for the cache tags the app relies on, so a probe can
      // confirm the deployment is the one that expects this contract.
      cacheTag: SITE_PAGES_CACHE_TAG,
    },
    {
      status,
      headers: {
        "cache-control": "no-store",
        // Health payloads are diagnostics, never content.
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}
