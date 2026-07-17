import { PageContainer } from "@/components/stitch/PageContainer";

/** Route-level skeleton: hero + bento + grid placeholders. */
export function TaxonomyLoadingState() {
  return (
    <div data-taxonomy="loading" aria-busy="true" aria-live="polite">
      <div className="h-[min(480px,60vh)] min-h-[320px] animate-pulse bg-dp-soft" />
      <PageContainer className="py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-[var(--dp-radius-lg)] bg-dp-soft"
            />
          ))}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/3] animate-pulse rounded-[var(--dp-radius-lg)] bg-dp-soft"
            />
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
