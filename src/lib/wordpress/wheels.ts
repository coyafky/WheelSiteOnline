import "server-only";

import { getWpConfig, wpRead } from "./client";
import {
  WHEEL_PUBLICATION_TAG,
  normalizeWordpressWheelCollection,
  type WordpressWheelCollection,
} from "./wheels-contract";
import type { PublicWheelModel } from "../wheels/types";

/** `null` = 未接管、不可达或契约损坏，调用方应使用最后有效静态集合。 */
export async function getWordpressWheelModels(): Promise<PublicWheelModel[] | null> {
  if (getWpConfig().mode !== "live") return null;
  const response = await wpRead<WordpressWheelCollection>("/fh/v1/wheels", {
    restRoot: true,
    tags: [WHEEL_PUBLICATION_TAG],
  });
  if (response === null) return null;
  return normalizeWordpressWheelCollection(response);
}
