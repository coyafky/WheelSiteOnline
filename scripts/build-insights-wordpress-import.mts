import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { guides } from "../src/content/resources.ts";
import { insightGuideMedia } from "../src/content/insights-visuals.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "outputs/exports/insights-wordpress-import.json");
const records = guides.map((guide) => ({
  slug: guide.slug,
  title: guide.title,
  status: "publish",
  publication_status: "approved",
  summary: guide.summary,
  category: guide.category,
  reading_time: guide.readingTime,
  answer: guide.answer,
  needs_verification: guide.needsVerification,
  detail: guide.detail,
  sections: guide.sections,
  seo_title: `${guide.title} — ${guide.category} Guide`,
  seo_description: guide.summary,
  media: insightGuideMedia[guide.slug] ?? null,
}));

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify({ records }, null, 2)}\n`, "utf8");
console.log(`已生成 ${output}（${records.length} 篇）`);
