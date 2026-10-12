import assert from "node:assert/strict";
import test from "node:test";

import {
  backspaceMm,
  computeOffset,
  frontspaceMm,
} from "../src/lib/wheels/offset-calculator.ts";

function assertClose(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} should equal ${expected}`);
}

test("同偏距加宽 1 英寸会让内外边缘各移动 12.7 mm", () => {
  const result = computeOffset(
    { width: 8, offset: 35, diameter: 18 },
    { width: 9, offset: 35, diameter: 18 },
  );

  assert.equal(result.valid, true);
  assertClose(result.innerChange, 12.7);
  assertClose(result.outerChange, 12.7);
});

test("同宽度降低 15 mm 偏距会增加 15 mm 内侧空间并增加 15 mm 外凸", () => {
  const result = computeOffset(
    { width: 9, offset: 45, diameter: 19 },
    { width: 9, offset: 30, diameter: 19 },
  );

  assert.equal(result.innerChange, -15);
  assert.equal(result.outerChange, 15);
});

test("直径增加 1 英寸时把 12.7 mm 计入两侧变化", () => {
  const result = computeOffset(
    { width: 8, offset: 0, diameter: 18 },
    { width: 8, offset: 0, diameter: 19 },
  );

  assertClose(result.innerChange, 12.7);
  assertClose(result.outerChange, 12.7);
  assert.equal(result.diameterChange, 1);
});

test("负偏距参与 backspace/frontspace 计算且零宽度被判为无效", () => {
  assert.equal(backspaceMm({ width: 8, offset: -10, diameter: 18 }), 91.6);
  assert.equal(frontspaceMm({ width: 8, offset: -10, diameter: 18 }), 111.6);

  const result = computeOffset(
    { width: 0, offset: -10, diameter: 18 },
    { width: 8, offset: 0, diameter: 18 },
  );
  assert.equal(result.valid, false);
});
