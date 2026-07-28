import type { InputHTMLAttributes } from "react";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function SearchInput({
  label = "Search",
  className = "",
  ...props
}: SearchInputProps) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">{label}</span>
      <span
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-dp-ink-muted"
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M20 20l-3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <input
        type="search"
        className={`h-[var(--dp-control-height)] w-full rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface pl-11 pr-4 font-sans text-[16px] text-dp-ink placeholder:text-dp-ink-muted ${className}`}
        {...props}
      />
    </label>
  );
}
