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

test("Gutenberg 正文优先归一化为 sections，不泄漏原始 HTML", () => {
  const nativePost: WordpressGuideRecord = {
    ...record,
    content: {
      rendered: "<h2>Verified heading</h2><p>First paragraph.</p><p>Second paragraph.</p><h2>Next heading</h2><p>Next paragraph.</p>",
    },
  };
  const result = normalizeWordpressGuide(nativePost);
  assert.ok(result);
  assert.deepEqual(result.guide.sections, [
    { heading: "Verified heading", body: ["First paragraph.", "Second paragraph."] },
    { heading: "Next heading", body: ["Next paragraph."] },
  ]);
  assert.doesNotMatch(JSON.stringify(result.guide.sections), /<h2>|<p>/);
});

test("Gutenberg 列表、引用和安全链接归一化为纯文本 sections", () => {
  const nativePost: WordpressGuideRecord = {
    ...record,
    content: {
      rendered: [
        '<!-- wp:heading {"level":2} --><h2 class="wp-block-heading">Choosing <a href="/fitment">fitment</a></h2><!-- /wp:heading -->',
        '<!-- wp:list --><ul class="wp-block-list"><li>Check the verified specification.</li><li><a href="https://example.com/reference">Read the reference</a></li><li><p>Confirm the wheel clears the brake package.</p><ol><li>Measure the baseline.</li><li><a href="#approved">Record the approved value.</a></li></ol></li></ul><!-- /wp:list -->',
        '<!-- wp:quote --><blockquote class="wp-block-quote"><p>Use the approved specification as the source of truth.</p></blockquote><!-- /wp:quote -->',
      ].join(""),
    },
  };
  const result = normalizeWordpressGuide(nativePost);
  assert.ok(result);
  assert.deepEqual(result.guide.sections, [
    {
      heading: "Choosing fitment",
      body: [
        "• Check the verified specification.",
        "• Read the reference",
        "• Confirm the wheel clears the brake package.",
        "  1. Measure the baseline.",
        "  2. Record the approved value.",
        "“Use the approved specification as the source of truth.”",
      ],
    },
  ]);
  assert.doesNotMatch(JSON.stringify(result.guide.sections), /<\/?(?:h2|p|ul|ol|li|blockquote|a)\b/i);
});

test("Gutenberg 图片块保留批准媒体的稳定字段", () => {
  const nativePost: WordpressGuideRecord = {
    ...record,
    content: {
      rendered: [
        '<!-- wp:heading --><h2 class="wp-block-heading">Media</h2><!-- /wp:heading -->',
        '<!-- wp:image --><figure class="wp-block-image size-large"><img loading="lazy" decoding="async" width="2560" height="1463" src="http://localhost:8081/wp-content/uploads/factory.webp" alt="Factory overview" class="wp-image-1237"/><figcaption>Factory overview caption.</figcaption></figure><!-- /wp:image -->',
        '<!-- wp:paragraph --><p>Image metadata reaches the stable contract.</p><!-- /wp:paragraph -->',
      ].join(""),
    },
  };
  const result = normalizeWordpressGuide(nativePost);
  assert.ok(result);
  assert.deepEqual(result.guide.sections, [
    {
      heading: "Media",
      body: [
        {
          kind: "image",
          media: {
            wordpressId: 1237,
            src: "http://localhost:8081/wp-content/uploads/factory.webp",
            alt: "Factory overview",
            caption: "Factory overview caption.",
            hasRender: true,
            approvalStatus: "approved",
            sourceRef: "WordPress media 1237",
          },
        },
        "Image metadata reaches the stable contract.",
      ],
    },
  ]);
  assert.doesNotMatch(JSON.stringify(result.guide.sections), /<figure|<img|<figcaption/);
});

test("Gutenberg 图片缺少媒体 ID 或替代文本时回退旧 sections", () => {
  const nativePost: WordpressGuideRecord = {
    ...record,
    content: {
      rendered: '<h2>Unsafe image</h2><figure class="wp-block-image"><img src="https://example.com/factory.webp" alt="" /></figure>',
    },
  };
  const result = normalizeWordpressGuide(nativePost);
  assert.ok(result);
  assert.deepEqual(result.guide.sections, record.guide?.sections);
});

test("Gutenberg 空正文回退迁移期旧 sections", () => {
  const nativePost: WordpressGuideRecord = {
    ...record,
    content: { rendered: "   " },
  };
  const result = normalizeWordpressGuide(nativePost);
  assert.ok(result);
  assert.deepEqual(result.guide.sections, record.guide?.sections);
});

test("Gutenberg 无有效段落或包含不安全标签时回退旧 sections", () => {
  for (const rendered of [
    "<p>Paragraph without a heading.</p>",
    "<h2>Heading without a paragraph</h2>",
    "<h2>Unsafe</h2><script>alert(1)</script><p>Paragraph.</p>",
    '<h2>Unsafe link</h2><p><a href="javascript:alert(1)">Click</a></p>',
    '<h2>Unsafe data</h2><p><a href="data:text/html;base64,Zm9v">Click</a></p>',
    '<h2>Unsafe protocol-relative</h2><p><a href="//evil.example">Click</a></p>',
    "<h2>Malformed list</h2><ul>Unexpected text<li>Item</li></ul>",
  ]) {
    const result = normalizeWordpressGuide({ ...record, content: { rendered } });
    assert.ok(result);
    assert.deepEqual(result.guide.sections, record.guide?.sections);
  }
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

test("Insights 多语言正文必须有已批准翻译，草稿只在预览可见", () => {
  const localized: WordpressGuideRecord = {
    ...record,
    guide: {
      ...record.guide,
      translations: {
        zh: {
          title: "适配基础",
          summary: "中文摘要。",
          category: "适配",
          reading_time: "5 分钟阅读",
          answer: "从已核验的车型规格开始。",
          detail: [{ heading: "快速查看", paragraphs: ["中文段落。"] }],
          sections: [{ heading: "工作细节", body: ["中文正文。"] }],
          seo_title: "经销商适配基础",
          seo_description: "中文适配参考。",
        },
      },
      translation_status: { zh: "approved" },
    },
  };
  const zh = normalizeWordpressGuide(localized, { locale: "zh" });
  assert.ok(zh);
  assert.equal(zh.guide.title, "适配基础");
  assert.equal(normalizeWordpressGuide(localized, { locale: "es" }), null);
});

test("非英文 locale 优先使用已批准翻译 sections，不被英文 Gutenberg 正文覆盖", () => {
  const localized: WordpressGuideRecord = {
    ...record,
    content: { rendered: "<h2>English heading</h2><p>English paragraph.</p>" },
    guide: {
      ...record.guide,
      translations: {
        zh: {
          title: "适配基础",
          summary: "中文摘要。",
          category: "适配",
          reading_time: "5 分钟阅读",
          answer: "从已核验的车型规格开始。",
          detail: [{ heading: "快速查看", paragraphs: ["中文段落。"] }],
          sections: [{ heading: "中文标题", body: ["中文正文。"] }],
        },
      },
      translation_status: { zh: "approved" },
    },
  };
  const result = normalizeWordpressGuide(localized, { locale: "zh" });
  assert.ok(result);
  assert.deepEqual(result.guide.sections, [
    { heading: "中文标题", body: ["中文正文。"] },
  ]);
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
