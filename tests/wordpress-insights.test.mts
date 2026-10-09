import assert from "node:assert/strict";
import test from "node:test";
import {
  INSIGHTS_CACHE_TAG,
  insightRevalidationPaths,
  normalizeWordpressGuide,
  validInsightPreviewSlug,
  type WordpressGuideRecord,
} from "../src/lib/wordpress/insights-contract.ts";

const record: WordpressGuideRecord = {
  id: 42,
  slug: "fitment-basics",
  status: "publish",
  title: { rendered: "Fitment &amp; basics" },
  excerpt: { rendered: "<p>Fallback summary</p>" },
  guide: {
    publication_status: "approved",
    summary: "A stable summary.",
    category: "Fitment",
    reading_minutes: 5,
    answer: "Start from the verified vehicle specification.",
    needs_verification: true,
    detail: [{ heading: "Quick view", paragraphs: ["One concise paragraph."] }],
    sections: [{ heading: "Working detail", body: ["One complete section."] }],
    seo_title: "Fitment basics for dealers",
    seo_description: "Dealer fitment reference.",
    image: {
      id: 88,
      src: "http://localhost:8081/wp-content/uploads/fitment.webp",
      alt: "Wheel fitment measurement reference",
      caption: "Approved article image",
    },
  },
};

test("WordPress 已批准文章映射到既有 GuideEntry 契约与 SEO", () => {
  const result = normalizeWordpressGuide(record);
  assert.ok(result);
  assert.equal(result.guide.title, "Fitment & basics");
  assert.equal(result.guide.readingTime, "5 min read");
  assert.equal(result.seoTitle, "Fitment basics for dealers");
  assert.equal(result.guide.needsVerification, true);
  assert.equal(result.media?.wordpressId, 88);
  assert.equal(result.media?.src, record.guide?.image?.src);
});

test("撤回文章从公开列表消失，但编辑预览仍可读取", () => {
  const withdrawn: WordpressGuideRecord = {
    ...record,
    status: "draft",
    guide: { ...record.guide, publication_status: "withdrawn" },
  };
  assert.equal(normalizeWordpressGuide(withdrawn), null);
  assert.equal(
    normalizeWordpressGuide(withdrawn, { preview: true })?.publicationStatus,
    "withdrawn",
  );
});

test("字段不完整时 fail-closed，不发布空壳文章", () => {
  const invalid: WordpressGuideRecord = {
    ...record,
    guide: { ...record.guide, sections: [] },
  };
  assert.equal(normalizeWordpressGuide(invalid), null);
});

test("预览 slug 与缓存失效路径不可形成开放跳转", () => {
  assert.equal(validInsightPreviewSlug("fitment-basics"), "fitment-basics");
  assert.equal(validInsightPreviewSlug("https://evil.example"), null);
  assert.equal(validInsightPreviewSlug("../admin"), null);
  assert.deepEqual(insightRevalidationPaths("fitment-basics"), [
    "/insights",
    "/insights/fitment-basics",
  ]);
  assert.equal(INSIGHTS_CACHE_TAG, "insights-guides");
});
