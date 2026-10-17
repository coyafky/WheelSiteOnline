import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { selfSealingTirePage } from "../src/content/safety-tires.ts";

test("T03 机制图按三个阶段使用解释性媒体契约", () => {
  const items = selfSealingTirePage.mechanism.items;
  assert.deepEqual(items.map((item) => item.id), ["01", "02", "03"]);
  assert.deepEqual(
    items.map((item) => item.media?.src),
    [
      "/images/safety-tires/mechanism-entry.webp",
      "/images/safety-tires/mechanism-surround.webp",
      "/images/safety-tires/mechanism-close.webp",
    ],
  );

  for (const item of items) {
    assert.ok(item.media);
    assert.equal(item.media.wordpressId, undefined);
    assert.match(item.media.sourceRef, /explanatory illustration/i);
    assert.doesNotMatch(item.media.caption, /Supplier illustration/);
    assert.equal(item.media.hasRender, true);
    assert.equal(item.media.approvalStatus, "approved");
    assert.ok(existsSync(join(process.cwd(), "public", item.media.src)));
  }
});
