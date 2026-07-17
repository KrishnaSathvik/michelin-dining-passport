import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
};

export function Input({
  label,
  hint,
  error,
  trailing,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="flex w-full flex-col gap-2">
      {label ? (
        <span className="dp-label-caps text-dp-ink-muted">{label}</span>
      ) : null}
      <span className="relative block">
        <input
          id={inputId}
          className={`h-[var(--dp-control-height)] w-full rounded-[var(--dp-radius-md)] border bg-dp-surface px-4 font-sans text-[16px] text-dp-ink placeholder:text-dp-ink-muted transition-colors ${
            error ? "border-dp-error" : "border-dp-border"
          } ${trailing ? "pr-11" : ""} ${className}`}
          {...props}
        />
        {trailing ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-dp-ink-muted">
            {trailing}
          </span>
        ) : null}
      </span>
      {error ? (
        <span className="dp-meta text-dp-error">{error}</span>
      ) : hint ? (
        <span className="dp-meta text-dp-ink-muted">{hint}</span>
      ) : null}
    </label>
  );
}
