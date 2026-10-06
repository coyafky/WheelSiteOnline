/**
 * 公开轮毂目录模块 —— 相关型号（PAGE-SPECS/wheel-detail.md §10）
 *
 * 规则：
 *   1. 至少一个相同规范 PCD：+4
 *   2. 至少一个相同直径：+3
 *   3. 相同已记录工艺：+2
 *   4. 至少一个相同公开 finish family：+1  ← **未实现，见下**
 *
 * 按分数降序、型号升序取前三个。0 分不显示；不足三个就少显示。
 *
 * ⚠️ 第 4 条为什么没写：
 * spec §6.2 要求 finish 先经过人工映射（`publicNameEn` / `colorFamily` /
 * `surfaceTreatment` / `approvalStatus`），当前 531 种原始中文 finish 尚未映射。
 * 若要在这里从中文原文猜「黑→Black、银→Silver」，那正是 spec §14
 * 「finish 未完成英文化/归一化前不生成色板」要禁止的**推测**。
 * 所以第 4 条留到映射批准后再加，而不是先写一个会返回猜测值的分支。
 *
 * 纯函数层，不 import `server-only`，可被单测直接跑。
 */

import type { PublicWheelModel, WheelCatalogueCard } from "./types";
import { toCatalogueCard } from "./query";

const WEIGHT_SAME_PCD = 4;
const WEIGHT_SAME_DIAMETER = 3;
const WEIGHT_SAME_PROCESS = 2;

export const RELATED_LIMIT = 3;

function scoreAgainst(candidate: PublicWheelModel, current: PublicWheelModel): number {
  let score = 0;

  const currentPcds = new Set(current.pcds);
  if (candidate.pcds.some((p) => currentPcds.has(p))) score += WEIGHT_SAME_PCD;

  const currentDiameters = new Set(current.diameters);
  if (candidate.diameters.some((d) => currentDiameters.has(d))) score += WEIGHT_SAME_DIAMETER;

  // 工艺只在**双方都记录了**且相同才算分 —— 未记录 ≠ 同类
  if (
    current.processKey !== "not-specified" &&
    candidate.processKey === current.processKey
  ) {
    score += WEIGHT_SAME_PROCESS;
  }

  return score;
}

/**
 * 从公开集合里挑相关型号。只接受已公开的型号（调用方传入的就是公开集合）。
 */
export function pickRelatedModels(
  all: PublicWheelModel[],
  current: PublicWheelModel,
  limit = RELATED_LIMIT,
): WheelCatalogueCard[] {
  const scored = all
    .filter((m) => m.slug !== current.slug)
    .map((m) => ({ model: m, score: scoreAgainst(m, current) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.model.model.localeCompare(b.model.model, "en", { numeric: true }) ||
        a.model.slug.localeCompare(b.model.slug, "en"),
    );

  return scored.slice(0, limit).map((entry) => toCatalogueCard(entry.model));
}
