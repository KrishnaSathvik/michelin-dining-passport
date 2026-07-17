import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

type LegalDocumentProps = {
  title: string;
  path: string;
  eyebrow?: string;
  children: ReactNode;
};

export function LegalDocument({
  title,
  path,
  eyebrow = "Launch draft",
  children,
}: LegalDocumentProps) {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: title, path },
  ];

  return (
    <div className="border-b border-border">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <Container className="py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbs} />
        <p className="mt-6 font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl rounded-sm border border-border bg-bg-deep px-4 py-3 font-sans text-sm leading-relaxed text-ink-muted">
          This document is a launch draft for product clarity. It has not
          received formal legal review. Do not treat it as final counsel.
        </p>
        <div className="prose-legal mt-10 max-w-2xl space-y-8 font-sans text-base leading-relaxed text-ink-muted">
          {children}
        </div>
      </Container>
    </div>
  );
}
