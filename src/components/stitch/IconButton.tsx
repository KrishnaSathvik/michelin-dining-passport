import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
};

export function IconButton({
  children,
  label,
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-[var(--dp-radius-md)] text-dp-ink-secondary transition-colors hover:bg-dp-soft hover:text-dp-primary disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
