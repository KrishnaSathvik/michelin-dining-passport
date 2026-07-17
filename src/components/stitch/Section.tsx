import type { ReactNode } from "react";
import { PageContainer } from "./PageContainer";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Apply 80px vertical section rhythm */
  padded?: boolean;
  soft?: boolean;
  contained?: boolean;
};

export function Section({
  id,
  children,
  className = "",
  padded = true,
  soft = false,
  contained = true,
}: SectionProps) {
  const inner = contained ? (
    <PageContainer soft={false}>{children}</PageContainer>
  ) : (
    children
  );

  return (
    <section
      id={id}
      className={`${padded ? "py-[var(--dp-section)]" : ""} ${
        soft ? "bg-dp-soft" : ""
      } ${className}`}
    >
      {inner}
    </section>
  );
}
