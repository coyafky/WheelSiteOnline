"use client";

import { Outline, type OutlineItem } from "@astryxdesign/core/Outline";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@/theme/fenghuai-neutral/neutral";

/**
 * 长文页的薄 Outline 适配器。
 *
 * 父级继续在服务端生成正文、标题和稳定 section ID；这里只接管滚动激活与
 * roving tabindex。offset 保持为 0，因为稳定的目标元素已有 scroll-mt-[110px]，
 * 它同时覆盖固定 Header、原生 hash 跳转和无 JavaScript 场景。目标元素自身
 * 不参与 reveal 位移，避免动画结束后锚点再次钻进 Header 下方。
 */
export function LongformOutline({
  items,
  label,
}: {
  items: OutlineItem[];
  label: string;
}) {
  return (
    <Theme theme={neutralTheme} mode="light">
      <Outline items={items} label={label} density="compact" offset={0} />
    </Theme>
  );
}
