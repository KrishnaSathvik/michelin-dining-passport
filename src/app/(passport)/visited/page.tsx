import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DeviceSaveNotice } from "@/components/passport/DeviceSaveNotice";
import { PassportRestaurantList } from "@/components/passport/PassportRestaurantList";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Visited restaurants",
  description: "Restaurants marked visited in your dining passport.",
  path: "/visited",
});

export default function VisitedPage() {
  const restaurants = getRestaurants();

  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-14">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
          Personal
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Visited
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base text-ink-muted">
          Meals you have marked visited — with dates and private notes kept in
          your passport.
        </p>
        <div className="mt-6">
          <DeviceSaveNotice />
        </div>
        <div className="mt-8">
          <PassportRestaurantList
            restaurants={restaurants}
            mode="visited"
            emptyTitle="No visits logged yet"
            emptyBody="Mark a restaurant as visited from its detail page to build your journey."
          />
        </div>
      </Container>
    </div>
  );
}
