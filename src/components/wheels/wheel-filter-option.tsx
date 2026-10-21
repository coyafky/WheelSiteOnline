import { cn } from "@/lib/utils";

/**
 * 单个筛选选项（原生 checkbox + 视觉外壳）。
 *
 * ══ 为什么把原生 input 藏起来（`sr-only`）════════════════════════════════
 * 筛选的业务契约是 **`name + value` 经 GET 表单提交**，而 Astryx `CheckboxInput`
 * 不输出业务 value 且强制受控 `onChange`（见 DEC-087 的静态渲染探针结论）。
 * 所以这里保留原生 input 承担机制，**只把外观交给兄弟元素** —— 两者彻底解耦：
 * 视觉可以随便重做，提交行为与无 JS 能力一行不用动。
 *
 * ⚠️ **实现约束（改样式必须遵守）**：
 * 1. 视觉元素的 checkbox 方块**必须紧邻 `<input>`**，否则 `peer-*` 伪类失效
 *    → 勾选态不再变色（`peer-checked:bg-forge` 依赖兄弟关系）
 * 2. **`peer-focus-visible:*` 焦点环绝不能删** —— 键盘用户靠它定位。
 * 3. 宽度只能比原来更小或持平（左栏固定 237px），否则移动端横向溢出。
 *
 * ══ 视觉语言（2026-10-11 现代化）════════════════════════════════════════
 * 借 Astryx 的**形态语言**（更柔和的圆角、分层描边、平滑过渡、hover 位移），
 * 但**配色仍用品牌令牌**（`forge` 橙 / `ink` / `steel`）—— 不搬 Astryx 的
 * neutral accent 蓝（那正是本页此前最不协调的一块，见 Spec §10）。
 */
export function WheelFilterOption({
  id,
  name,
  value,
  label,
  count,
  checked,
  disabled,
}: {
  id: string;
  name: string;
  value: string | number;
  label: string;
  count: number;
  checked: boolean;
  disabled: boolean;
}) {
  const isZero = count === 0;

  return (
    <label
      htmlFor={id}
      className={cn(
        "group flex min-h-8 cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 text-[0.8rem] leading-snug text-ink",
        // 现代感的关键一条：hover 时整行有反馈，而不是只有小方块变色
        "transition-colors duration-150 ease-out hover:bg-soft",
        disabled && "cursor-not-allowed text-muted-foreground hover:bg-transparent",
      )}
    >
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        disabled={disabled}
        className="peer sr-only"
      />

      {/*
       * 视觉方块。
       * - `rounded-[5px]`：比原来的直角更柔和，但不至于变成圆形（B2B 目录要克制）
       * - `ring-1 ring-inset`：内描边比 border 更贴近 Astryx 的分层观感，且不撑大盒子
       * - 选中态用品牌橙实心 + 白色对勾，并加一层柔光（`shadow-sm`）提质感
       * - ⚠️ `peer-focus-visible:*` 必须保留：键盘可达性底线
       */}
      <span
        aria-hidden="true"
        className={cn(
          "grid size-[17px] shrink-0 place-items-center rounded-[5px]",
          "bg-white ring-1 ring-inset ring-ink/25",
          "text-[0.62rem] font-bold leading-none text-transparent",
          "transition-all duration-150 ease-out",
          // hover：描边转品牌橙，轻微放大一点点点（0 位移，只加厚度感）
          "group-hover:ring-forge/70",
          // 选中：实心品牌橙 + 白勾 + 柔光
          "peer-checked:bg-forge peer-checked:ring-forge peer-checked:shadow-sm peer-checked:text-white",
          // 键盘焦点环 —— 不可删
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forge",
          // 禁用：弱化为浅灰底 + 浅描边
          "peer-disabled:bg-soft peer-disabled:ring-border peer-disabled:shadow-none",
        )}
      >
        ✓
      </span>

      <span className="flex-1 truncate">{label}</span>

      {/*
       * 计数：数字右对齐、等宽数字，弱化但不至于看不清。
       * count=0 时进一步弱化（该选项在当前筛选组合下无结果）。
       */}
      <span
        className={cn(
          "ml-auto shrink-0 tabular-nums text-[0.7rem] leading-none",
          isZero ? "text-steel/55" : "text-steel",
          disabled && "text-steel/55",
        )}
      >
        {count}
      </span>
    </label>
  );
}
