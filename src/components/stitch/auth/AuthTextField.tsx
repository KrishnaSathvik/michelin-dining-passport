"use client";

import { useId, type InputHTMLAttributes } from "react";

type AuthTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function AuthTextField({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: AuthTextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={inputId} className="dp-label-caps text-dp-ink-muted">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [error ? errorId : null, hint ? hintId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={`h-[var(--dp-control-height)] w-full rounded-[var(--dp-radius-md)] border bg-dp-surface px-4 font-sans text-[16px] text-dp-ink placeholder:text-dp-ink-muted transition-colors focus-visible:border-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
          error ? "border-dp-error" : "border-dp-border"
        } ${className}`}
        {...props}
      />
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
