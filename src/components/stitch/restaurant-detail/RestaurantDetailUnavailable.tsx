import Link from "next/link";
import { EmptyState } from "@/components/stitch/EmptyState";
import { PageContainer } from "@/components/stitch/PageContainer";

/**
 * Not-found visual language for restaurant detail when a custom state is shown.
 * Route still uses notFound() for unknown slugs by default.
 */
export function RestaurantDetailUnavailable() {
  return (
    <div data-restaurant-detail-unavailable>
      <PageContainer className="py-16">
        <EmptyState
          title="Restaurant not found"
          description="This listing is not in the current Dining Passport roster."
        >
          <Link
            href="/explore"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--dp-radius-lg)] bg-dp-primary px-6 font-sans text-sm font-semibold text-dp-on-primary no-underline"
          >
            Explore restaurants
          </Link>
        </EmptyState>
      </PageContainer>
    </div>
  );
}
