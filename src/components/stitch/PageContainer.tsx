import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
  /** Use soft sage section background instead of transparent. */
  soft?: boolean;
};

/**
 * Stitch content container: max 1280px, 20px mobile / 64px desktop margins.
 */
export function PageContainer({
  children,
  className = "",
  as: Tag = "div",
  soft = false,
}: PageContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[var(--dp-content-max)] px-[var(--dp-margin-mobile)] md:px-[var(--dp-margin-desktop)] ${
        soft ? "bg-dp-soft" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
