import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { DeviceSaveNotice } from "@/components/passport/DeviceSaveNotice";
import { PassportRestaurantList } from "@/components/passport/PassportRestaurantList";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Saved restaurants",
  description: "Restaurants saved in your dining passport.",
  path: "/saved",
});

export default function SavedPage() {
  const restaurants = getRestaurants();

  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-14">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
          Personal
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Saved
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base text-ink-muted">
          Restaurants you want to return to — with reserve and passport actions
          ready.
        </p>
        <div className="mt-6">
          <DeviceSaveNotice />
        </div>
        <div className="mt-8">
          <PassportRestaurantList
            restaurants={restaurants}
            mode="saved"
            emptyTitle="No saved restaurants yet"
            emptyBody="Open Explore or Map and save a restaurant to start your shortlist."
          />
        </div>
      </Container>
    </div>
  );
}
