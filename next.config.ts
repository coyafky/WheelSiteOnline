import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const remotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [];

/**
 * Loopback media origins are useful when WordPress runs locally (docker on
 * :8081), but keeping them in a production build lets the image optimizer be
 * pointed at internal addresses — an SSRF surface. They are therefore only
 * registered outside production, or when a deployment explicitly opts in via
 * `ALLOW_LOOPBACK_WP_MEDIA=true` (single-host Docker Compose where WordPress
 * really does listen on loopback).
 */
if (
  process.env.NODE_ENV !== "production" ||
  process.env.ALLOW_LOOPBACK_WP_MEDIA === "true"
) {
  remotePatterns.push(
    {
      protocol: "http",
      hostname: "localhost",
      port: "8081",
      pathname: "/wp-content/uploads/**",
    },
    {
      protocol: "http",
      hostname: "127.0.0.1",
      port: "8081",
      pathname: "/wp-content/uploads/**",
    },
  );
}

let allowLocalWordpressMedia = false;

function addWordpressMediaPattern(rawUrl: string | undefined): void {
  if (!rawUrl) return;

  try {
    const wordpressUrl = new URL(rawUrl);
    remotePatterns.push({
      protocol: wordpressUrl.protocol === "http:" ? "http" : "https",
      hostname: wordpressUrl.hostname,
      port: wordpressUrl.port,
      pathname: "/wp-content/uploads/**",
    });
  } catch {
    // Runtime validation in the WordPress client handles malformed URLs.
  }
}

if (process.env.WP_API_URL) {
  try {
    const wordpressUrl = new URL(process.env.WP_API_URL);
    allowLocalWordpressMedia = ["localhost", "127.0.0.1", "::1"].includes(
      wordpressUrl.hostname,
    );
  } catch {
    // Runtime validation in the WordPress client handles malformed URLs.
  }
}

// Server-side CMS reads use the Docker-internal URL in production, while
// WordPress media records contain the browser-visible public URL. Both origins
// must be allowed at build time for Next's image optimizer to fetch those files.
addWordpressMediaPattern(process.env.WP_API_URL);
addWordpressMediaPattern(process.env.WP_PUBLIC_API_URL);

const localInterfaceOrigins = Object.values(networkInterfaces())
  .flat()
  .filter(
    (address): address is NonNullable<typeof address> =>
      Boolean(address && address.family === "IPv4" && !address.internal),
  )
  .map((address) => address.address);

const allowedDevOrigins = Array.from(
  new Set([
    "127.0.0.1",
    ...localInterfaceOrigins,
    ...(process.env.NEXT_DEV_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]),
);

const nextConfig: NextConfig = {
  // Next.js 16 blocks dev-only scripts, fonts and HMR when the browser hostname
  // differs from the hostname passed to `next dev`. This project is commonly
  // started on 0.0.0.0 and viewed through 127.0.0.1 or a LAN address, so allow
  // loopback plus this machine's active IPv4 interfaces. Explicit env entries
  // remain available for stable aliases and development tunnels.
  allowedDevOrigins,
  output: "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns,
    dangerouslyAllowLocalIP: allowLocalWordpressMedia,
    /**
     * AVIF first, WebP second. Both are served through `Accept` negotiation, so
     * a browser that cannot decode AVIF still receives WebP — the order only
     * decides which format wins when both are acceptable.
     *
     * AVIF costs more CPU per encode, which is why the optimizer TTL below
     * matters: encoding happens once and is then reused.
     */
    formats: ["image/avif", "image/webp"],

    /**
     * Next 默认 deviceSizes 末尾是 3840，但站内所有源图最宽只有 2560
     * （hero `factory.webp` = 2560x1463）。提供 3840 档只会让浏览器把一个
     * 不存在的分辨率重新放大 1.5 倍再传一遍 —— 纯浪费字节。
     *
     * 去掉 3840 后，任何 `sizes` 写法失误最多取到 2048，不会再有硬放大。
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    /**
     * Next defaults to 60 seconds, which re-encodes unchanged product photos
     * every minute. These images are content-addressed uploads that change only
     * when an editor replaces one, so a week is the right order of magnitude
     * for the cache while `revalidateTag` still handles real updates
     * immediately.
     */
    minimumCacheTTL: 604800,
  },
  /**
   * The /gallery and /fitment route families were clone-era leftovers and have
   * been retired. Their URLs may still be indexed or linked from outside, so
   * they 308 to the nearest real destination instead of returning 404.
   *
   * `/gallery/finishes` had no successor page (its swatch data was placeholder),
   * so it redirects to the wheel catalogue rather than inventing a target.
   */
  async redirects() {
    return [
      { source: "/gallery", destination: "/products", permanent: true },
      { source: "/gallery/wheels", destination: "/products/wheels", permanent: true },
      { source: "/gallery/finishes", destination: "/products/wheels", permanent: true },
      { source: "/fitment", destination: "/contact", permanent: true },
      { source: "/fitment/:platform", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    const appUsesHttps = (() => {
      try {
        return process.env.NEXT_PUBLIC_APP_URL
          ? new URL(process.env.NEXT_PUBLIC_APP_URL).protocol === "https:"
          : false;
      } catch {
        return false;
      }
    })();
    const cmsOrigin = (() => {
      try {
        return process.env.WP_API_URL ? new URL(process.env.WP_API_URL).origin : "";
      } catch {
        return "";
      }
    })();
    const scriptSource = [
      "script-src 'self' 'unsafe-inline'",
      ...(process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : []),
    ].join(" ");
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      scriptSource,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob:${cmsOrigin ? ` ${cmsOrigin}` : ""}`,
      `connect-src 'self'${cmsOrigin ? ` ${cmsOrigin}` : ""}`,
      "font-src 'self' data:",
      ...(appUsesHttps ? ["upgrade-insecure-requests"] : []),
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ...(appUsesHttps
        ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
        : []),
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
