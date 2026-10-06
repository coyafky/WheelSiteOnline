/**
 * Headless WordPress content contracts.
 *
 * WordPress owns "what we sell" — wheels, specs, images, articles.
 * Next.js only reads. These types mirror the REST shape we expect from
 * WP (post + ACF fields flattened into `acf`).
 *
 * See docs/plans/inquiry-system-architecture.md §5.
 */

/** A WP post in its raw REST shape (subset we depend on). */
export type WpPost<T> = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  acf: T;
};

export type WpTerm = {
  id: number;
  slug: string;
  name: string;
  count: number;
};

/** Media-library item returned by `/wp/v2/media/{id}`. */
export type WpMedia = {
  id: number;
  source_url: string;
  alt_text: string;
  caption: { rendered: string };
  media_details: {
    width?: number;
    height?: number;
  };
};

/** Wheel model as exposed by the `wheel` CPT. */
export type WpWheelAcf = {
  model: string;
  style_name: string;
  process: string;
  size_category: string;
  sizes: string[];
  pcds: string[];
  offsets: number[];
  center_bores: number[];
  finishes: string[];
  production_codes: string[];
  hero_image: string;
  has_image: boolean;
};

/** Product-line page (the three capability lines). */
export type WpProductLineAcf = {
  line_key: string;
  eyebrow: string;
  heading: string;
  lede: string;
  parts: string[];
};

export type WpArticleAcf = {
  category: string;
  reading_minutes: number;
  hero_image: string;
};

export type WpRegion = "global";

export type WpClientConfig = {
  /** e.g. https://cms.fenghuai.com/wp-json/wp/v2 */
  baseUrl: string;
  /** Application password / JWT, injected server-side only. */
  authToken?: string;
  /** V1 runs on mock data until the CMS is live. */
  mode: "mock" | "live";
};
