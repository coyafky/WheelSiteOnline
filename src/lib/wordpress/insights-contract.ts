import type { GuideArticleSection, GuideBodyImage, GuideDetail, GuideEntry, MediaAsset } from "../../content/types";

export const INSIGHTS_CACHE_TAG = "insights-guides";

export type WordpressGuideFields = {
  publication_status?: "draft" | "approved" | "withdrawn";
  summary?: string;
  category?: string;
  reading_time?: string;
  reading_minutes?: number;
  answer?: string;
  needs_verification?: boolean;
  detail?: unknown;
  sections?: unknown;
  seo_title?: string;
  seo_description?: string;
  translations?: Record<string, Partial<{
    title: string;
    summary: string;
    category: string;
    reading_time: string;
    answer: string;
    detail: unknown;
    sections: unknown;
    seo_title: string;
    seo_description: string;
  }>>;
  translation_status?: Record<string, "draft" | "approved" | "withdrawn">;
  image?: {
    id?: number;
    src?: string;
    alt?: string;
    caption?: string;
  } | null;
};

export type WordpressGuideRecord = {
  id: number;
  slug: string;
  status?: "publish" | "draft" | "pending" | "private" | "future" | "trash";
  title: { rendered: string };
  excerpt: { rendered: string };
  /** WordPress 原生 post 的 Gutenberg 渲染正文；归一化后才进入 UI 契约。 */
  content?: { rendered: string };
  guide?: WordpressGuideFields;
  /** 兼容迁移期旧 ACF 响应；项目自有 WordPress 契约统一输出 guide。 */
  acf?: WordpressGuideFields;
};

export type WordpressGuideCollection = {
  authoritative: boolean;
  items: WordpressGuideRecord[];
};

export type InsightGuideDocument = {
  guide: GuideEntry;
  seoTitle: string;
  seoDescription: string;
  source: "wordpress" | "local";
  preview: boolean;
  publicationStatus: "draft" | "approved" | "withdrawn";
  media?: MediaAsset;
};

function decodeHtmlText(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function text(value: unknown): string {
  if (typeof value !== "string") return "";
  return decodeHtmlText(value.replace(/<[^>]*>/g, " "));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length > 0
    && value.every((item) => typeof item === "string" && item.trim() !== "");
}

function normalizeDetail(value: unknown): GuideDetail[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const rows: GuideDetail[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    if (typeof row.heading !== "string" || !row.heading.trim() || !isStringArray(row.paragraphs)) return null;
    rows.push({
      heading: row.heading.trim(),
      paragraphs: row.paragraphs.map((entry) => entry.trim()),
    });
  }
  return rows;
}

function normalizeSections(value: unknown): GuideArticleSection[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const rows: GuideArticleSection[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    if (typeof row.heading !== "string" || !row.heading.trim() || !isStringArray(row.body)) return null;
    rows.push({
      heading: row.heading.trim(),
      body: row.body.map((entry) => entry.trim()),
    });
  }
  return rows;
}

type GutenbergTag = "h2" | "p" | "ul" | "ol" | "li" | "blockquote" | "a" | "figure" | "img" | "figcaption";

type GutenbergNode =
  | { kind: "text"; value: string }
  | { kind: "element"; tag: GutenbergTag; attrs: Record<string, string>; children: GutenbergNode[] };

const gutenbergTags = new Set<GutenbergTag>([
  "h2", "p", "ul", "ol", "li", "blockquote", "a", "figure", "img", "figcaption",
]);

function isAllowedGutenbergComment(value: string): boolean {
  return /^<!--\s*\/?\s*wp:(?:heading|paragraph|list|list-item|quote|image)(?:\s+[\s\S]*?)?\s*-->$/i.test(value);
}

function allowedGutenbergAttributes(tag: GutenbergTag): Set<string> {
  if (tag === "a") return new Set(["href"]);
  if (tag === "img") return new Set([
    "alt", "class", "decoding", "height", "loading", "sizes", "src", "srcset", "width",
  ]);
  return new Set(["class", "id"]);
}

function parseGutenbergStartTag(value: string): {
  tag: GutenbergTag;
  attrs: Record<string, string>;
  selfClosing: boolean;
} | null {
  const match = /^<([A-Za-z][A-Za-z0-9-]*)([\s\S]*)>$/.exec(value);
  if (!match) return null;
  const tag = match[1].toLowerCase();
  if (!gutenbergTags.has(tag as GutenbergTag)) return null;
  const selfClosing = /\/\s*$/.test(match[2]);
  if (selfClosing && tag !== "img") return null;

  const attrs: Record<string, string> = {};
  const rawAttributes = selfClosing ? match[2].replace(/\/\s*$/, "") : match[2];
  const allowed = allowedGutenbergAttributes(tag as GutenbergTag);
  let cursor = 0;
  while (cursor < rawAttributes.length) {
    while (/\s/.test(rawAttributes[cursor] ?? "")) cursor += 1;
    if (cursor >= rawAttributes.length) break;
    const attribute = /^([A-Za-z_:][A-Za-z0-9:._-]*)\s*=\s*"([^"]*)"/.exec(rawAttributes.slice(cursor));
    if (!attribute || !allowed.has(attribute[1].toLowerCase()) || attribute[1].toLowerCase() in attrs) return null;
    attrs[attribute[1].toLowerCase()] = attribute[2];
    cursor += attribute[0].length;
  }
  return { tag: tag as GutenbergTag, attrs, selfClosing };
}

function canContainGutenbergTag(parent: GutenbergTag | null, child: GutenbergTag): boolean {
  if (!parent) return ["h2", "p", "ul", "ol", "blockquote", "figure"].includes(child);
  if (parent === "h2" || parent === "p" || parent === "a") return child === "a" && parent !== "a";
  if (parent === "ul" || parent === "ol") return child === "li";
  if (parent === "li") return child === "a" || child === "p" || child === "ul" || child === "ol";
  if (parent === "figure") return child === "img" || child === "figcaption";
  if (parent === "figcaption") return child === "a";
  if (parent === "img") return false;
  return parent === "blockquote" && (child === "p" || child === "a");
}

function parseGutenbergHtml(value: string): GutenbergNode[] | null {
  const tokenPattern = /<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>|[^<]+/g;
  const roots: GutenbergNode[] = [];
  const stack: Array<Extract<GutenbergNode, { kind: "element" }>> = [];
  let cursor = 0;
  let token: RegExpExecArray | null;

  while ((token = tokenPattern.exec(value)) !== null) {
    if (token.index !== cursor) return null;
    const raw = token[0];
    cursor = tokenPattern.lastIndex;

    if (raw.startsWith("<!--")) {
      if (!isAllowedGutenbergComment(raw)) return null;
      continue;
    }

    if (raw.startsWith("</")) {
      const closing = /^<\/([A-Za-z][A-Za-z0-9-]*)\s*>$/.exec(raw);
      if (!closing || stack.length === 0 || stack[stack.length - 1].tag !== closing[1].toLowerCase()) return null;
      stack.pop();
      continue;
    }

    if (raw.startsWith("<")) {
      const parsed = parseGutenbergStartTag(raw);
      if (!parsed || !canContainGutenbergTag(stack[stack.length - 1]?.tag ?? null, parsed.tag)) return null;
      const node: Extract<GutenbergNode, { kind: "element" }> = {
        kind: "element",
        tag: parsed.tag,
        attrs: parsed.attrs,
        children: [],
      };
      const parent = stack[stack.length - 1];
      if (parent) parent.children.push(node);
      else roots.push(node);
      if (!parsed.selfClosing && parsed.tag !== "img") stack.push(node);
      continue;
    }

    if (raw.trim() === "") {
      if (stack.length > 0) stack[stack.length - 1].children.push({ kind: "text", value: raw });
      continue;
    }
    if (stack.length === 0) return null;
    stack[stack.length - 1].children.push({ kind: "text", value: raw });
  }

  return cursor === value.length && stack.length === 0 && roots.length > 0 ? roots : null;
}

function allowedGutenbergHref(value: string | undefined): boolean {
  if (!value) return false;
  const href = decodeHtmlText(value);
  if (!href || /[\u0000-\u0020\u007f\\]/.test(href) || href.startsWith("//")) return false;
  if (/^https?:\/\//i.test(href)) {
    try {
      return new URL(href).protocol === "http:" || new URL(href).protocol === "https:";
    } catch {
      return false;
    }
  }
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(href)) return false;
  return true;
}

function normalizeGutenbergInline(nodes: GutenbergNode[]): string | null {
  const parts: string[] = [];
  for (const node of nodes) {
    if (node.kind === "text") {
      if (node.value.trim()) parts.push(decodeHtmlText(node.value));
      continue;
    }
    if (node.tag !== "a" || !allowedGutenbergHref(node.attrs.href)) return null;
    const linkText = normalizeGutenbergInline(node.children);
    if (!linkText) return null;
    parts.push(linkText);
  }
  const result = decodeHtmlText(parts.join(" "));
  return result || null;
}

function normalizeGutenbergList(node: Extract<GutenbergNode, { kind: "element" }>, depth = 0): string[] | null {
  if (node.children.some((child) => child.kind === "text" && child.value.trim() !== "")) return null;
  const items = node.children.filter((child): child is Extract<GutenbergNode, { kind: "element" }> => child.kind === "element");
  if (items.length === 0 || items.some((item) => item.tag !== "li")) return null;

  const rows: string[] = [];
  for (const [index, item] of items.entries()) {
    const textParts: string[] = [];
    const nestedLists: Array<Extract<GutenbergNode, { kind: "element" }>> = [];
    for (const child of item.children) {
      if (child.kind === "text") {
        if (child.value.trim()) textParts.push(decodeHtmlText(child.value));
      } else if (child.tag === "a") {
        const linkText = normalizeGutenbergInline([child]);
        if (!linkText) return null;
        textParts.push(linkText);
      } else if (child.tag === "p") {
        const paragraph = normalizeGutenbergInline(child.children);
        if (!paragraph) return null;
        textParts.push(paragraph);
      } else if (child.tag === "ul" || child.tag === "ol") {
        nestedLists.push(child);
      } else {
        return null;
      }
    }

    const label = decodeHtmlText(textParts.join(" "));
    if (!label) return null;
    const marker = node.tag === "ol" ? `${index + 1}.` : "•";
    rows.push(`${"  ".repeat(depth)}${marker} ${label}`);
    for (const nested of nestedLists) {
      const nestedRows = normalizeGutenbergList(nested, depth + 1);
      if (!nestedRows) return null;
      rows.push(...nestedRows);
    }
  }
  return rows;
}

function normalizeGutenbergImage(
  node: Extract<GutenbergNode, { kind: "element" }>,
): GuideBodyImage | null {
  if (node.tag !== "figure") return null;
  const image = node.children.find(
    (child): child is Extract<GutenbergNode, { kind: "element" }> =>
      child.kind === "element" && child.tag === "img",
  );
  const caption = node.children.find(
    (child): child is Extract<GutenbergNode, { kind: "element" }> =>
      child.kind === "element" && child.tag === "figcaption",
  );
  const elements = node.children.filter(
    (child): child is Extract<GutenbergNode, { kind: "element" }> => child.kind === "element",
  );
  if (
    !image
    || elements.filter((child) => child.tag === "img").length !== 1
    || elements.filter((child) => child.tag === "figcaption").length > 1
    || elements.some((child) => child.tag !== "img" && child.tag !== "figcaption")
    || node.children.some((child) => child.kind === "text" && child.value.trim() !== "")
  ) return null;
  const mediaClass = image.attrs.class ?? "";
  const idMatch = /(?:^|\s)wp-image-(\d+)(?:\s|$)/.exec(mediaClass);
  const id = idMatch ? Number(idMatch[1]) : 0;
  const src = text(image.attrs.src);
  const alt = text(image.attrs.alt);
  if (!Number.isInteger(id) || id <= 0 || !/^(?:https?:\/\/|\/)/.test(src) || !alt) return null;

  let captionText = "";
  if (caption) {
    if (caption.children.some((child) => child.kind === "element" && child.tag !== "a")) return null;
    captionText = normalizeGutenbergInline(caption.children) ?? "";
  }
  return {
    kind: "image",
    media: {
      wordpressId: id,
      src,
      alt,
      caption: captionText,
      hasRender: true,
      approvalStatus: "approved",
      sourceRef: `WordPress media ${id}`,
    },
  };
}

function normalizeGutenbergBlock(node: Extract<GutenbergNode, { kind: "element" }>):
  { kind: "heading"; value: string } | { kind: "body"; value: Array<string | GuideBodyImage> } | null {
  if (node.tag === "figure") {
    const image = normalizeGutenbergImage(node);
    return image ? { kind: "body", value: [image] } : null;
  }
  if (node.tag === "h2") {
    const heading = normalizeGutenbergInline(node.children);
    return heading ? { kind: "heading", value: heading } : null;
  }
  if (node.tag === "p") {
    const paragraph = normalizeGutenbergInline(node.children);
    return paragraph ? { kind: "body", value: [paragraph] } : null;
  }
  if (node.tag === "ul" || node.tag === "ol") {
    const list = normalizeGutenbergList(node);
    return list ? { kind: "body", value: list } : null;
  }
  if (node.tag === "blockquote") {
    const parts: string[] = [];
    for (const child of node.children) {
      if (child.kind === "text") {
        if (child.value.trim()) parts.push(decodeHtmlText(child.value));
      } else if (child.tag === "p" || child.tag === "a") {
        const paragraph = normalizeGutenbergInline(child.tag === "p" ? child.children : [child]);
        if (!paragraph) return null;
        parts.push(paragraph);
      } else {
        return null;
      }
    }
    const quote = decodeHtmlText(parts.join(" "));
    return quote ? { kind: "body", value: [`“${quote}”`] } : null;
  }
  return null;
}

/**
 * 将 Gutenberg 的安全正文接缝归一化为现有 sections 契约。
 *
 * 这里只接受有限的结构标签和属性；列表、引用与链接都会降为纯文本，
 * 不把原始 HTML 传入 UI。未知、危险或结构不完整的标记全部令解析失败，
 * 由调用方回退到迁移期 sections JSON。
 */
function normalizeGutenbergSections(value: unknown): GuideArticleSection[] | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const nodes = parseGutenbergHtml(value);
  if (!nodes) return null;

  const rows: GuideArticleSection[] = [];
  let current: GuideArticleSection | null = null;
  for (const node of nodes) {
    if (node.kind === "text") {
      if (node.value.trim()) return null;
      continue;
    }
    const block = normalizeGutenbergBlock(node);
    if (!block) return null;
    if (block.kind === "heading") {
      if (current) {
        if (current.body.length === 0) return null;
        rows.push(current);
      }
      current = { heading: block.value, body: [] };
    } else {
      if (!current) return null;
      current.body.push(...block.value);
    }
  }

  if (!current || current.body.length === 0) return null;
  rows.push(current);
  return rows.length > 0 ? rows : null;
}

function normalizeImage(value: WordpressGuideFields["image"]): MediaAsset | undefined {
  if (!value || !Number.isInteger(value.id) || (value.id ?? 0) <= 0) return undefined;
  const src = text(value.src);
  const alt = text(value.alt);
  if (!/^(?:https?:\/\/|\/)/.test(src) || !alt) return undefined;
  return {
    wordpressId: value.id,
    src,
    alt,
    caption: text(value.caption),
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: `WordPress media ${value.id}`,
  };
}

export function normalizeWordpressGuide(
  record: WordpressGuideRecord,
  options: { preview?: boolean; locale?: import("@/lib/i18n/types").Locale } = {},
): InsightGuideDocument | null {
  const preview = options.preview === true;
  const fields = record.guide ?? record.acf;
  const publicationStatus = fields?.publication_status ?? "draft";
  if (!preview && (record.status !== "publish" || publicationStatus !== "approved")) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) return null;

  const locale = options.locale ?? "en";
  const translation = locale === "en" ? undefined : fields?.translations?.[locale];
  if (locale !== "en" && !translation) return null;
  if (locale !== "en" && !preview && fields?.translation_status?.[locale] !== "approved") return null;
  const localized = translation ?? {};
  const title = text(localized.title) || text(record.title?.rendered);
  const summary = text(localized.summary) || text(fields?.summary) || text(record.excerpt?.rendered);
  const category = text(localized.category) || text(fields?.category);
  const answer = text(localized.answer) || text(fields?.answer);
  const detail = normalizeDetail(localized.detail ?? fields?.detail);
  const legacySections = normalizeSections(localized.sections ?? fields?.sections);
  const sections = locale === "en"
    ? normalizeGutenbergSections(record.content?.rendered) ?? legacySections
    : legacySections;
  const readingTime = text(localized.reading_time) || text(fields?.reading_time)
    || (Number.isFinite(fields?.reading_minutes) ? `${fields?.reading_minutes} min read` : "");
  if (!title || !summary || !category || !answer || !readingTime || !detail || !sections) return null;

  const guide: GuideEntry = {
    slug: record.slug,
    title,
    summary,
    category,
    readingTime,
    detail,
    sections,
    answer,
    // Fail-closed: only an explicit `false` clears the verification notice. A
    // missing or malformed field means we cannot prove the figures were signed
    // off, so the article keeps advertising that it needs engineering review.
    needsVerification: fields?.needs_verification !== false,
  };
  return {
    guide,
    seoTitle: text(localized.seo_title) || text(fields?.seo_title) || `${title} — ${category} Guide`,
    seoDescription: text(localized.seo_description) || text(fields?.seo_description) || summary,
    source: "wordpress",
    preview,
    publicationStatus,
    media: normalizeImage(fields?.image),
  };
}

export function localGuideDocument(guide: GuideEntry, media?: MediaAsset): InsightGuideDocument {
  return {
    guide,
    seoTitle: `${guide.title} — ${guide.category} Guide`,
    seoDescription: guide.summary,
    source: "local",
    preview: false,
    publicationStatus: "approved",
    media,
  };
}

export function insightRevalidationPaths(slug?: string): string[] {
  const paths = ["/insights"];
  if (slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) paths.push(`/insights/${slug}`);
  return paths;
}

export function validInsightPreviewSlug(value: string | null): string | null {
  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return null;
  return value;
}
