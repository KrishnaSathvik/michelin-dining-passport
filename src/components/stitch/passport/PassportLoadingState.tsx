import { PageContainer } from "@/components/stitch/PageContainer";
import { Skeleton } from "@/components/stitch/Skeleton";

type PassportLoadingStateProps = {
  variant?: "passport" | "list" | "planned";
};

export function PassportLoadingState({
  variant = "passport",
}: PassportLoadingStateProps) {
  if (variant === "planned") {
    return (
      <PageContainer className="bg-dp-bg pb-[var(--dp-section)] pt-[104px]">
        <div role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">Loading planned visits…</span>
          <Skeleton className="mb-4 h-4 w-40" />
          <Skeleton className="mb-3 h-12 w-72" />
          <Skeleton className="mb-8 h-5 w-96 max-w-full" />
          <div className="space-y-6">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-[var(--dp-radius-lg)]" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (variant === "list") {
    return (
      <PageContainer className="bg-dp-bg pb-[var(--dp-section)] pt-[104px]">
        <div role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">Loading personal list…</span>
          <Skeleton className="mb-4 h-4 w-48" />
          <Skeleton className="mb-3 h-12 w-80 max-w-full" />
          <Skeleton className="mb-8 h-5 w-full max-w-xl" />
          <Skeleton className="mb-10 h-14 w-full rounded-[var(--dp-radius-lg)]" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton
                key={index}
                className="aspect-[4/3] w-full rounded-[var(--dp-radius-lg)]"
              />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="bg-dp-bg pb-[var(--dp-section)] pt-[104px]">
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Loading passport…</span>
        <Skeleton className="mb-3 h-3 w-28" />
        <Skeleton className="mb-4 h-12 w-80 max-w-full" />
        <Skeleton className="mb-10 h-5 w-full max-w-xl" />
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-[var(--dp-radius-lg)]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-[var(--dp-radius-lg)]" />
          <Skeleton className="h-56 w-full rounded-[var(--dp-radius-lg)]" />
        </div>
      </div>
    </PageContainer>
  );
}
