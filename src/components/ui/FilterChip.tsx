import Link from "next/link";
import type { ReactNode } from "react";

type FilterChipProps = {
  href?: string;
  selected?: boolean;
  children: ReactNode;
  className?: string;
};

export function FilterChip({
  href,
  selected = false,
  children,
  className = "",
}: FilterChipProps) {
  const base = `inline-flex min-h-10 items-center justify-center rounded-full border px-4 font-sans text-sm transition-colors ${
    selected
      ? "border-forest bg-forest text-white"
      : "border-border bg-bg text-ink-secondary hover:border-ink/25 hover:text-ink"
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${base} no-underline`}>
        {children}
      </Link>
    );
  }

  return <span className={base}>{children}</span>;
}
