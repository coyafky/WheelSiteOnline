import "server-only";

/**
 * 轮毂询盘的服务端复核绑定（PAGE-SPECS/wheel-detail.md §7）
 *
 * 规格原文：
 *   「服务端必须按公开目录重新查询 `model + productionCode`。
 *     客户端隐藏字段只能作为提示，不能成为订单事实源。」
 *
 * 所以这里**不信任**客户端提交的 model / productionCode / selectedSpec，
 * 一律拿它们当**查询线索**，去公开集合重新解析：
 *
 *   · 解析得到 → 用**服务端**的型号、生产代码和规格覆盖掉客户端那份；
 *   · 解析不到（伪造代码、未公开型号、跨型号借代码）→ **清空规格快照**，
 *     并标记 `variant_pending`，让业务看到「客户想询价但没指定有效配置」。
 *
 * 为什么不清脆地 422 掉：
 *   规格 §7 明写「未选配置：允许提交『只询问型号』，但明确存为 `variant_pending`」。
 *   一个猜错链接的客户仍然是一个真实线索 —— 拒绝它会丢生意，
 *   而记下一条**没有伪造规格**的记录既不丢生意、也不让假数据进事实源。
 */

import { resolvePublishedWheelSelection } from "./public-catalogue";
import type { ResolvedWheelSelection } from "./types";

/** 轮毂询盘相关的上下文字段（`InquiryContext` 的子集）。 */
export type WheelEnquiryHints = {
  productLine?: string;
  model?: string;
  productionCode?: string;
  selectedSpec?: Record<string, string>;
  /** 由本模块设置并落库，客户端提交的值会被覆盖（见 validate 与 route）。 */
  variantPending?: boolean;
};

export type WheelEnquiryBinding = {
  /** 覆盖后的上下文字段：解析成功即服务端事实，解析失败则清空规格。 */
  context: WheelEnquiryHints;
  /** 服务端解析到的真实配置；未解析到为 null。 */
  resolved: ResolvedWheelSelection | null;
  /** 客户提交了配置线索但未能解析 —— 明确存为 `variant_pending`（会落库）。 */
  variantPending: boolean;
  /** 是否走了本模块的复核路径（非轮毂询盘为 false）。 */
  applied: boolean;
};

/** 提交的规格快照键 —— 与 `?size=&pcd=&et=&cb=&finish=` 契约一致。 */
export function specSnapshotOf(variant: ResolvedWheelSelection["variant"]): Record<string, string> {
  const spec: Record<string, string> = { size: variant.size };
  if (variant.pcd) spec.pcd = variant.pcd;
  if (variant.offset !== null) spec.et = String(variant.offset);
  if (variant.centerBore !== null) spec.cb = String(variant.centerBore);
  if (variant.finish) spec.finish = variant.finish;
  return spec;
}

/**
 * 复核一条轮毂询盘。
 *
 * 非轮毂询盘（`productLine !== "wheels"`）原样返回，不做任何改动 ——
 * 本模块只对轮毂产品线生效，避免影响定制铝/三电等其它产品线的既有契约。
 */
export async function bindWheelEnquiry(
  hints: WheelEnquiryHints,
): Promise<WheelEnquiryBinding> {
  if (hints.productLine !== "wheels") {
    return { context: hints, resolved: null, variantPending: false, applied: false };
  }

  const slug = (hints.model ?? "").trim();
  const productionCode = (hints.productionCode ?? "").trim();

  const resolved = slug && productionCode
    ? await resolvePublishedWheelSelection({ slug, productionCode })
    : null;

  if (!resolved) {
    // 客户给了线索但解析不到 —— 不能把他的规格写进事实源。
    const hadHints = Boolean(slug || productionCode);
    return {
      context: {
        productLine: hints.productLine,
        // 型号线索保留原样供业务人工跟进，但**不附任何规格**：
        // 规格只能来自服务端解析，解析不到就没有规格。
        model: slug || undefined,
        productionCode: undefined,
        selectedSpec: undefined,
        variantPending: true,
      },
      resolved: null,
      variantPending: hadHints,
      applied: true,
    };
  }

  return {
    context: {
      productLine: hints.productLine,
      // 用服务端的规范值覆盖客户端那份（大小写、别名都归一到公开真相）
      model: resolved.model,
      productionCode: resolved.variant.productionCode,
      selectedSpec: specSnapshotOf(resolved.variant),
      variantPending: false,
    },
    resolved,
    variantPending: false,
    applied: true,
  };
}
