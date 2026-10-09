import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeWordpressWheel,
  normalizeWordpressWheelCollection,
  WHEEL_PUBLICATION_TAG,
  wheelRevalidationPaths,
  type WordpressWheelRecord,
} from "../src/lib/wordpress/wheels-contract.ts";

const approved: WordpressWheelRecord = {
  id: 902,
  slug: "fh-002",
  status: "publish",
  wheel: {
    model: "FH-002",
    display_model: "FH-002",
    publication_status: "approved",
    image_rights_status: "approved",
    supply_status: "confirmed",
    specification_status: "verified",
    approved_process: "锻造",
    seo_title: "FH-002 forged wheel",
    seo_description: "FH-002 approved production configurations.",
    images: [
      {
        id: 1202,
        src: "http://localhost:8081/wp-content/uploads/fh-002.webp",
        alt: "FH-002 forged wheel front view",
        caption: "Approved FH-002 product image",
      },
    ],
    variants: [
      {
        production_code: "FH002-1885-5112",
        diameter: 18,
        width: 8.5,
        pcd: "5*112",
        offset: 35,
        center_bore: 66.6,
        finish: "Satin black",
      },
      {
        production_code: "FH002-1990-51143",
        diameter: 19,
        width: 9,
        pcd: "5x114.3",
        offset: 38,
        center_bore: 73.1,
        finish: "Brushed clear",
      },
    ],
  },
};

test("已批准 WordPress 轮毂映射到既有公开视图契约", () => {
  const result = normalizeWordpressWheel(approved);
  assert.ok(result);
  assert.equal(result.slug, "fh-002");
  assert.equal(result.model, "FH-002");
  assert.equal(result.processKey, "forged");
  assert.deepEqual(result.diameters, [18, 19]);
  assert.deepEqual(result.widths, [8.5, 9]);
  assert.deepEqual(result.pcds, ["5x112", "5x114.3"]);
  assert.equal(result.approvedVariantCount, 2);
  assert.equal(result.primaryImage, approved.wheel.images?.[0]?.src);
});

test("草稿、撤回、缺图与不完整规格全部 fail-closed", () => {
  assert.equal(normalizeWordpressWheel({ ...approved, status: "draft" }), null);
  assert.equal(normalizeWordpressWheel({
    ...approved,
    wheel: { ...approved.wheel, publication_status: "withdrawn" },
  }), null);
  assert.equal(normalizeWordpressWheel({
    ...approved,
    wheel: { ...approved.wheel, images: [] },
  }), null);
  assert.equal(normalizeWordpressWheel({
    ...approved,
    wheel: {
      ...approved.wheel,
      variants: [{ ...approved.wheel.variants![0], center_bore: null }],
    },
  }), null);
});

test("重复 productionCode 或不安全 slug 不进入公开集合", () => {
  assert.equal(normalizeWordpressWheel({ ...approved, slug: "../fh-002" }), null);
  assert.equal(normalizeWordpressWheel({
    ...approved,
    wheel: {
      ...approved.wheel,
      variants: [approved.wheel.variants![0], approved.wheel.variants![0]],
    },
  }), null);
});

test("沿用既有目录对复合 PCD 与已核准数值的解释，避免迁移后丢失型号", () => {
  const result = normalizeWordpressWheel({
    ...approved,
    wheel: {
      ...approved.wheel,
      variants: [{
        ...approved.wheel.variants![0],
        pcd: "4/5*100, 5*114.3",
        center_bore: 722.6,
      }],
    },
  });

  assert.ok(result);
  assert.equal(result.variants[0].pcdKey, "4x100");
  assert.deepEqual(result.pcds, ["4x100", "5x100", "5x114.3"]);
});

test("轮毂缓存标签与失效路径覆盖目录、详情、旋压和 sitemap", () => {
  assert.equal(WHEEL_PUBLICATION_TAG, "wheel-publication");
  assert.deepEqual(wheelRevalidationPaths("fh-002"), [
    "/products/wheels",
    "/products/wheels/flow-formed",
    "/products/wheels/fh-002",
    "/sitemap.xml",
  ]);
});

test("未接管或契约损坏时请求静态兜底，权威空集合保持为空", () => {
  assert.equal(normalizeWordpressWheelCollection({ authoritative: false, items: [approved] }), null);
  assert.deepEqual(normalizeWordpressWheelCollection({ authoritative: true, items: [] }), []);
  assert.equal(normalizeWordpressWheelCollection({
    authoritative: true,
    items: [{ ...approved, wheel: { ...approved.wheel, images: [] } }],
  }), null);
});
