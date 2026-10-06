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
  images: {
    remotePatterns,
    dangerouslyAllowLocalIP: allowLocalWordpressMedia,
  },
};

export default nextConfig;
