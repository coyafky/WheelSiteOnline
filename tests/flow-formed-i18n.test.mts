import assert from "node:assert/strict";
import test from "node:test";
import { LOCALES } from "../src/lib/i18n/types.ts";
import {
  flowFormedCopyStatus,
  flowFormedPageFor,
} from "../src/lib/i18n/flow-formed-copy.ts";

test("旋压页面为每种注册语言提供完整的 WFF01–WFF05 文案", () => {
  for (const locale of LOCALES) {
    const page = flowFormedPageFor(locale);
    assert.ok(page.hero.heading.trim(), `${locale}: hero heading`);
    assert.ok(page.processDefinition.evidenceNote.trim(), `${locale}: evidence note`);
    assert.ok(page.manufacturingRoute.steps.every((step) => step.title && step.body), `${locale}: route steps`);
    assert.ok(page.catalogue.emptyResultHeading.trim(), `${locale}: empty heading`);
    assert.ok(page.inquiry.checklist.every((item) => item.trim()), `${locale}: inquiry checklist`);
    assert.ok(page.seo.title.trim(), `${locale}: SEO title`);
  }
});

test("旋压页非英文 copy 保持草稿状态，只有英文源内容当前获准", () => {
  assert.equal(flowFormedCopyStatus("en"), "approved");
  for (const locale of ["zh", "es", "th"] as const) {
    assert.equal(flowFormedCopyStatus(locale), "draft");
  }
});

test("本地化只改变文案，不改变产品边界、路径、anchor 和来源媒体", () => {
  const english = flowFormedPageFor("en");
  const chinese = flowFormedPageFor("zh");
  assert.equal(chinese.slug, english.slug);
  assert.equal(chinese.hero.primaryCta.href, english.hero.primaryCta.href);
  assert.equal(chinese.inquiry.anchor, english.inquiry.anchor);
  assert.equal(chinese.manufacturingRoute.equipment.src, english.manufacturingRoute.equipment.src);
  assert.deepEqual(
    chinese.processDefinition.cards.map(({ id, href }) => ({ id, href })),
    english.processDefinition.cards.map(({ id, href }) => ({ id, href })),
  );
});
