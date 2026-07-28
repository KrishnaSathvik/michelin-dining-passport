"use client";

import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  hint?: string;
  error?: string;
  labelEnd?: ReactNode;
};

export function PasswordField({
  label,
  hint,
  error,
  labelEnd,
  id,
  className = "",
  ...props
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="dp-label-caps text-dp-ink-muted">
          {label}
        </label>
        {labelEnd}
      </div>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`h-[var(--dp-control-height)] w-full rounded-[var(--dp-radius-md)] border bg-dp-surface px-4 pr-12 font-sans text-[16px] text-dp-ink placeholder:text-dp-ink-muted transition-colors focus-visible:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
            error ? "border-dp-error" : "border-dp-border"
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 items-center justify-center px-3 text-dp-ink-muted hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.9 5.1A10.5 10.5 0 0 1 12 5c5 0 9.3 3.1 11 7.5a12.3 12.3 0 0 1-4.2 5.1M6.7 6.7A12.4 12.4 0 0 0 1 12.5C2.7 16.9 7 20 12 20c1.6 0 3.1-.3 4.5-.9" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M1 12.5C2.7 8.1 7 5 12 5s9.3 3.1 11 7.5C21.3 16.9 17 20 12 20S2.7 16.9 1 12.5Z" />
              <circle cx="12" cy="12.5" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error ? (
        <span id={errorId} className="dp-meta text-dp-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="dp-meta text-dp-ink-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
