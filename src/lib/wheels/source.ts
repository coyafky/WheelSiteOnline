import "server-only";

import { getWordpressWheelModels } from "../wordpress/wheels";
import { getPublicModels } from "./publication";
import type { PublicWheelModel } from "./types";

/**
 * 运行时公开集合的单一入口。
 *
 * WordPress 返回 `null` 才使用仓库中的最后有效集合；权威空数组必须原样保留，表示全部撤回。
 */
export async function getPublishedWheelModels(): Promise<PublicWheelModel[]> {
  const live = await getWordpressWheelModels();
  return live === null ? getPublicModels() : live;
}
