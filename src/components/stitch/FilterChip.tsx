import type { ButtonHTMLAttributes, ReactNode } from "react";

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  selected?: boolean;
};

/** 24–32px soft chip; 4px radius — status/filter language, not large pills. */
export function FilterChip({
  children,
  selected = false,
  className = "",
  type = "button",
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`inline-flex h-8 items-center rounded-[var(--dp-radius-md)] border px-3 font-sans text-[13px] font-medium transition-colors ${
        selected
          ? "border-dp-primary bg-dp-primary text-dp-on-primary"
          : "border-dp-border bg-dp-surface text-dp-ink-secondary hover:border-dp-primary/40 hover:text-dp-primary"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
