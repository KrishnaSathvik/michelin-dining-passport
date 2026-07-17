import type { ReactNode } from "react";
import { Container } from "./Container";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  dek?: string;
  children: ReactNode;
  className?: string;
  titleAs?: "h2" | "h3";
};

export function Section({
  id,
  eyebrow,
  title,
  dek,
  children,
  className = "",
  titleAs: TitleTag = "h2",
}: SectionProps) {
  return (
    <section id={id} className={`section-space ${className}`}>
      <Container>
        <header className="mb-10 max-w-2xl">
          {eyebrow ? (
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
              {eyebrow}
            </p>
          ) : null}
          <TitleTag className="mt-3 font-display text-3xl leading-tight text-ink sm:text-[2.5rem]">
            {title}
          </TitleTag>
          {dek ? (
            <p className="mt-4 font-sans text-base leading-relaxed text-ink-secondary sm:text-lg">
              {dek}
            </p>
          ) : null}
        </header>
        {children}
      </Container>
    </section>
  );
}
