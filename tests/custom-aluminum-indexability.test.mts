import assert from "node:assert/strict";
import test from "node:test";
import { customAluminumPage, isCustomAluminumIndexable } from "../src/content/custom-aluminum.ts";

test("自定义铝合金页只有正文发布与业务边界均获批才可索引", () => {
  assert.equal(isCustomAluminumIndexable(customAluminumPage), false);
  assert.equal(
    isCustomAluminumIndexable({
      ...customAluminumPage,
      publicationStatus: "approved",
      boundary: { ...customAluminumPage.boundary, declinedConfirmed: false },
    }),
    false,
  );
  assert.equal(
    isCustomAluminumIndexable({
      ...customAluminumPage,
      publicationStatus: "draft",
      boundary: { ...customAluminumPage.boundary, declinedConfirmed: true },
    }),
    false,
  );
  assert.equal(
    isCustomAluminumIndexable({
      ...customAluminumPage,
      publicationStatus: "approved",
      boundary: { ...customAluminumPage.boundary, declinedConfirmed: true },
    }),
    true,
  );
});
