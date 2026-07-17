import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CollectionsManager } from "@/components/passport/CollectionsManager";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Collections",
  description:
    "Private curated collections of Michelin-starred restaurants in your dining passport.",
  path: "/collections",
});

export default function CollectionsPage() {
  const restaurants = getRestaurants();
  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-14">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
          Personal
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Collections
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base text-ink-muted">
          Curate private shortlists for trips, cities, and tasting themes.
        </p>
        <div className="mt-8">
          <CollectionsManager restaurants={restaurants} />
        </div>
      </Container>
    </div>
  );
}
