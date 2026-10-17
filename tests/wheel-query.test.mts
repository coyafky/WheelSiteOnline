import assert from "node:assert/strict";
import test from "node:test";

import { buildFacets, emptyQuery } from "../src/lib/wheels/query.ts";
import type { PublicWheelModel, PublicWheelVariant } from "../src/lib/wheels/types.ts";

function variant(
  productionCode: string,
  diameter: number,
  width: number,
  pcdKey: string,
): PublicWheelVariant {
  return {
    productionCode,
    size: `${diameter}*${width}`,
    diameter,
    width,
    pcd: pcdKey,
    pcdKey,
    offset: 35,
    centerBore: 66.6,
    finish: "approved finish",
  };
}

function model(
  slug: string,
  modelName: string,
  processKey: PublicWheelModel["processKey"],
  variants: PublicWheelVariant[],
): PublicWheelModel {
  return {
    slug,
    model: modelName,
    displayModel: modelName,
    processKey,
    processLabel: processKey === "not-specified" ? undefined : processKey,
    primaryImage: `/images/wheels/${slug}.webp`,
    images: [`/images/wheels/${slug}.webp`],
    variants,
    diameters: [...new Set(variants.map((item) => item.diameter).filter((value): value is number => value !== null))],
    widths: [...new Set(variants.map((item) => item.width).filter((value): value is number => value !== null))],
    pcds: [...new Set(variants.map((item) => item.pcdKey))],
    approvedVariantCount: variants.length,
    approvedFinishCount: 1,
  };
}

const models = [
  model("alpha", "ALPHA", "flow-formed", [
    variant("ALPHA-17-8-112", 17, 8, "5x112"),
    variant("ALPHA-18-8.5-114", 18, 8.5, "5x114.3"),
  ]),
  model("bravo", "BRAVO", "forged", [
    variant("BRAVO-17-8.5-112", 17, 8.5, "5x112"),
  ]),
  model("charlie", "CHARLIE", "low-pressure-cast", [
    variant("CHARLIE-17-9-114", 17, 9, "5x114.3"),
  ]),
];

function optionCount(
  options: Array<{ value: string; count: number; disabled: boolean }>,
  value: string,
) {
  const option = options.find((item) => item.value === value);
  assert.ok(option, `missing facet option ${value}`);
  return option;
}

test("联动 facet 计数按同一批准变体求交集", () => {
  const facets = buildFacets(models, {
    ...emptyQuery(),
    diameters: [17],
  });

  assert.equal(optionCount(facets.widths, "8").count, 1);
  assert.equal(optionCount(facets.widths, "8.5").count, 1);
  assert.equal(optionCount(facets.pcds, "5x112").count, 2);
  assert.equal(optionCount(facets.pcds, "5x114.3").count, 1);
});

test("叠加第二个轴后，不可匹配选项显示 0 并禁用", () => {
  const facets = buildFacets(models, {
    ...emptyQuery(),
    diameters: [17],
    widths: [8.5],
  });

  const pcd112 = optionCount(facets.pcds, "5x112");
  const pcd114 = optionCount(facets.pcds, "5x114.3");
  assert.equal(pcd112.count, 1);
  assert.equal(pcd114.count, 0);
  assert.equal(pcd114.disabled, true);
});
