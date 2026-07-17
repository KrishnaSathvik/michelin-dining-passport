import type { ReactNode } from "react";

type ExternalTextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function ExternalTextLink({
  href,
  children,
  className = "",
}: ExternalTextLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-forest underline decoration-border underline-offset-4 transition-colors hover:text-forest-deep hover:decoration-forest ${className}`}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
