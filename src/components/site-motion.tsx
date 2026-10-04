"use client";

import { useSiteMotion } from "@/hooks/use-site-motion";

/** Mounts the site-wide reveal/parallax observers. Renders nothing. */
export function SiteMotion() {
  useSiteMotion();
  return null;
}
