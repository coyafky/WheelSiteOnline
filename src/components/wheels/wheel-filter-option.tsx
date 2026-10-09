import { cn } from "@/lib/utils";

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
  return (
    <label
      htmlFor={id}
      className={cn(
        "group flex min-h-7 cursor-pointer items-center gap-2 text-[0.8rem] leading-snug text-ink",
        disabled && "cursor-not-allowed text-muted-foreground",
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
      <span
        aria-hidden="true"
        className="grid size-4 shrink-0 place-items-center border border-ink/28 text-[0.62rem] font-bold leading-none text-transparent transition-colors group-hover:border-forge peer-checked:border-forge peer-checked:bg-forge peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forge peer-disabled:border-border peer-disabled:bg-soft"
      >
        ✓
      </span>
      <span>{label}</span>
      <span
        className={cn(
          "ml-auto tabular-nums text-[0.7rem] text-muted-foreground/80",
          disabled && "opacity-60",
        )}
      >
        {count}
      </span>
    </label>
  );
}
