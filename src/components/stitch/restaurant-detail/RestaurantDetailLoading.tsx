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

        <div className="mt-8 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <Skeleton className="aspect-[4/3] w-full rounded-[var(--dp-radius-xl)] md:aspect-[16/11] lg:col-span-7" />
          <div className="flex min-w-0 flex-col justify-center gap-4 lg:col-span-5">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-full max-w-md" />
            <div className="mt-4 flex flex-wrap gap-3">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-32" />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-dp-border pt-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[var(--dp-section)] space-y-4 border-t border-dp-border pt-[var(--dp-section)]">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        </div>

        <div className="mt-[var(--dp-section)] space-y-5 border-t border-dp-border pt-[var(--dp-section)]">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-[304px] w-full rounded-[var(--dp-radius-xl)] sm:h-[368px] lg:h-[432px]" />
        </div>

        <div className="mt-[var(--dp-section)] border-t border-dp-border pt-[var(--dp-section)]">
          <Skeleton className="mb-8 h-8 w-56" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-[var(--dp-radius-lg)]" />
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
