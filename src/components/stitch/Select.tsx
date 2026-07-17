import type { SelectHTMLAttributes, ReactNode } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  children: ReactNode;
};

export function Select({
  label,
  children,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="flex w-full flex-col gap-2">
      {label ? (
        <span className="dp-label-caps text-dp-ink-muted">{label}</span>
      ) : null}
      <select
        id={selectId}
        className={`h-[var(--dp-control-height)] w-full appearance-none rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-surface bg-[length:12px] bg-[position:right_14px_center] bg-no-repeat px-4 pr-10 font-sans text-[16px] text-dp-ink ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23717975' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        }}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
