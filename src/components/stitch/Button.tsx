import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-dp-primary text-dp-on-primary border border-transparent hover:bg-dp-primary-hover",
  secondary:
    "bg-dp-surface text-dp-primary border border-dp-border hover:bg-dp-soft",
  ghost:
    "bg-transparent text-dp-primary border border-transparent hover:bg-dp-soft",
};

/** Stitch 48px control. Flat tonal — not pill-shaped. */
export function Button({
  variant = "primary",
  className = "",
  type = "button",
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-[var(--dp-control-height)] items-center justify-center gap-2 rounded-[var(--dp-radius-lg)] px-5 font-sans text-[14px] font-semibold tracking-wide transition-colors duration-[var(--dp-duration)] ease-[var(--dp-ease)] disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
