import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActiveFilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  onClear?: () => void;
};

export function ActiveFilterChip({
  children,
  onClear,
  className = "",
  type = "button",
  ...props
}: ActiveFilterChipProps) {
  return (
    <button
      type={type}
      onClick={onClear}
      className={`inline-flex h-8 items-center gap-2 rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-soft px-3 font-sans text-[13px] font-medium text-dp-ink ${className}`}
      {...props}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="text-dp-ink-muted">
        ×
      </span>
      <span className="sr-only">Remove filter</span>
    </button>
  );
}
