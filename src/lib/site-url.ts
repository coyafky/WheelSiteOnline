const FALLBACK_SITE_URL = "http://localhost:3000";

function parseConfiguredUrl(): URL | null {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export const configuredSiteUrl = parseConfiguredUrl();
export const siteUrl = configuredSiteUrl ?? new URL(FALLBACK_SITE_URL);
export const siteUrlIsConfigured = configuredSiteUrl !== null;
