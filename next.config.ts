import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
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
];

let allowLocalWordpressMedia = false;

if (process.env.WP_API_URL) {
  try {
    const wordpressUrl = new URL(process.env.WP_API_URL);
    allowLocalWordpressMedia = ["localhost", "127.0.0.1", "::1"].includes(
      wordpressUrl.hostname,
    );
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

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns,
    dangerouslyAllowLocalIP: allowLocalWordpressMedia,
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
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline'",
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
