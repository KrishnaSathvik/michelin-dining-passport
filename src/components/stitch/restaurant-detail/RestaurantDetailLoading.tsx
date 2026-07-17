import { PageContainer } from "@/components/stitch/PageContainer";
import { Skeleton } from "@/components/stitch/Skeleton";

/**
 * Route loading skeleton matching breadcrumb → hero → details → Google → related.
 */
export function RestaurantDetailLoading() {
  return (
    <div data-restaurant-detail-loading aria-busy="true" aria-label="Loading restaurant">
    <PageContainer className="py-8 md:py-[var(--dp-margin-desktop)]">
      <Skeleton className="h-4 w-64 max-w-full" />

      <div className="mt-8 flex flex-col gap-6 md:flex-row">
        <Skeleton className="aspect-[4/3] w-full rounded-[var(--dp-radius-md)] md:h-[500px] md:w-[58%] md:aspect-auto" />
        <div className="flex w-full flex-col justify-center gap-4 md:w-[42%]">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-full max-w-md" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-28" />
          </div>
          <div className="mt-6 flex gap-4 border-t border-dp-border pt-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-10 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-[var(--dp-section)] flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-80 w-full rounded-[var(--dp-radius-md)] lg:w-[380px]" />
      </div>

      <div className="mt-[var(--dp-section)] border-t border-dp-border pt-[var(--dp-section)]">
        <Skeleton className="mb-8 h-8 w-56" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
    </div>
  );
}
