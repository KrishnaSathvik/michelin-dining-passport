import { PageContainer } from "@/components/stitch/PageContainer";
import { Skeleton } from "@/components/stitch/Skeleton";

type CollectionsLoadingStateProps = {
  variant?: "index" | "detail";
};

export function CollectionsLoadingState({
  variant = "index",
}: CollectionsLoadingStateProps) {
  if (variant === "detail") {
    return (
      <div
        className="border-b border-dp-outline-variant bg-dp-bg"
        data-collections-state="loading"
        aria-busy="true"
        aria-live="polite"
      >
        <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
          <p className="sr-only">Loading collection…</p>
          <Skeleton className="mb-8 h-4 w-64" />
          <Skeleton className="mb-4 h-12 w-2/3 max-w-xl" />
          <Skeleton className="mb-10 h-5 w-full max-w-lg" />
          <div className="grid grid-cols-1 gap-[var(--dp-gutter)] lg:grid-cols-12">
            <Skeleton className="h-[280px] w-full lg:col-span-8 lg:h-[400px]" />
            <Skeleton className="h-[280px] w-full lg:col-span-4 lg:h-[400px]" />
          </div>
          <div className="mt-12 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div
      className="border-b border-dp-outline-variant bg-dp-bg"
      data-collections-state="loading"
      aria-busy="true"
      aria-live="polite"
    >
      <PageContainer className="pb-[var(--dp-section)] pt-[104px]">
        <p className="sr-only">Loading collections…</p>
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl flex-1">
            <Skeleton className="mb-4 h-12 w-64" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
          <Skeleton className="h-12 w-44 shrink-0" />
        </div>
        <Skeleton className="mb-[var(--dp-section)] h-[300px] w-full md:h-[400px]" />
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-12 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-[var(--dp-radius-lg)]">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-5">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}

export { CollectionsLoadingState as CollectionDetailLoadingState };
