"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Restaurant } from "@/lib/data/types";
import type { ReservationAction } from "@/lib/reservations/types";
import {
  NearbyRestaurantRow,
  RelatedRestaurantCard,
  ReservationAction as ReservationActionControl,
  RestaurantCardSkeleton,
  RestaurantDiscoveryCard,
  RestaurantEditorialCard,
  RestaurantEditorialCardSkeleton,
  RestaurantListRow,
  RestaurantMapRow,
  RestaurantMapRowSkeleton,
  RestaurantMedia,
  RestaurantRowSkeleton,
  SaveAction,
  toNearbyRestaurantRowModel,
  toRelatedRestaurantCardModel,
  toRestaurantDiscoveryCardModel,
  toRestaurantEditorialCardModel,
  toRestaurantListRowModel,
  toRestaurantMapRowModel,
  type RestaurantCardModel,
} from "@/components/stitch/restaurant";
import { PageContainer } from "@/components/stitch/PageContainer";
import { SectionHeader } from "@/components/stitch/SectionHeader";
import { getRestaurantReservation } from "@/lib/reservations/data";

const APPROVED_DEMO_IMAGE = {
  url: "/dev/approved-restaurant-demo.svg",
  alt: "Approved first-party restaurant media demo",
} as const;

const LABEL_DEMOS: {
  title: string;
  action: ReservationAction;
}[] = [
  {
    title: "Reserve now",
    action: {
      href: "https://www.addisondelmar.com/reservations/",
      label: "Reserve now",
      providerLabel: "Restaurant website",
      isDirectBooking: true,
      source: "verified_direct",
    },
  },
  {
    title: "Check availability",
    action: {
      href: "https://www.benusf.com/",
      label: "Check availability",
      providerLabel: "Restaurant website",
      isDirectBooking: false,
      source: "official_website",
    },
  },
  {
    title: "View booking options",
    action: {
      href: "https://guide.michelin.com/",
      label: "View booking options",
      providerLabel: "Michelin Guide",
      isDirectBooking: false,
      source: "michelin_listing",
    },
  },
  {
    title: "Visit restaurant website",
    action: {
      href: "https://www.example.com/",
      label: "Visit restaurant website",
      providerLabel: "No online booking",
      isDirectBooking: false,
      source: "official_website_restricted",
    },
  },
];

type GalleryRestaurantSet = {
  oneStar: Restaurant;
  twoStar: Restaurant;
  threeStar: Restaurant;
  editorial: Restaurant;
  longName: Restaurant;
  list: Restaurant;
  mapA: Restaurant;
  mapB: Restaurant;
  related: Restaurant;
  nearby: Restaurant;
};

type StitchRestaurantGalleryClientProps = {
  restaurants: GalleryRestaurantSet;
};

function withReservation(
  restaurant: Restaurant,
  overrides?: Partial<RestaurantCardModel>,
): RestaurantCardModel {
  const reservation = getRestaurantReservation(restaurant.slug);
  return {
    ...toRestaurantDiscoveryCardModel(restaurant, { reservation }),
    ...overrides,
  };
}

function GallerySection({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-28 border-t border-dp-border pt-12">
      <SectionHeader title={title} description={description} />
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function StitchRestaurantGalleryClient({
  restaurants,
}: StitchRestaurantGalleryClientProps) {
  const [selectedMapSlug, setSelectedMapSlug] = useState(restaurants.mapA.slug);
  const [demoSaved, setDemoSaved] = useState(true);

  const discoveryOne = useMemo(
    () =>
      withReservation(restaurants.oneStar, {
        image: APPROVED_DEMO_IMAGE,
      }),
    [restaurants.oneStar],
  );
  const discoveryTwo = useMemo(
    () => withReservation(restaurants.twoStar),
    [restaurants.twoStar],
  );
  const discoveryThree = useMemo(
    () => withReservation(restaurants.threeStar),
    [restaurants.threeStar],
  );
  const missingCuisine = useMemo(() => {
    const base = withReservation(restaurants.oneStar);
    return { ...base, cuisine: undefined };
  }, [restaurants.oneStar]);
  const missingPrice = useMemo(() => {
    const base = withReservation(restaurants.twoStar);
    return { ...base, price: undefined };
  }, [restaurants.twoStar]);
  const longName = useMemo(
    () => withReservation(restaurants.longName),
    [restaurants.longName],
  );
  const editorial = useMemo(
    () =>
      toRestaurantEditorialCardModel(restaurants.editorial, {
        reservation: getRestaurantReservation(restaurants.editorial.slug),
        eyebrow: "Featured",
      }),
    [restaurants.editorial],
  );
  const listRow = useMemo(
    () =>
      toRestaurantListRowModel(restaurants.list, {
        reservation: getRestaurantReservation(restaurants.list.slug),
      }),
    [restaurants.list],
  );
  const mapA = useMemo(
    () =>
      toRestaurantMapRowModel(restaurants.mapA, {
        reservation: getRestaurantReservation(restaurants.mapA.slug),
        selected: selectedMapSlug === restaurants.mapA.slug,
      }),
    [restaurants.mapA, selectedMapSlug],
  );
  const mapB = useMemo(
    () =>
      toRestaurantMapRowModel(restaurants.mapB, {
        reservation: getRestaurantReservation(restaurants.mapB.slug),
        selected: selectedMapSlug === restaurants.mapB.slug,
      }),
    [restaurants.mapB, selectedMapSlug],
  );
  const related = useMemo(
    () =>
      toRelatedRestaurantCardModel(restaurants.related, {
        reservation: getRestaurantReservation(restaurants.related.slug),
      }),
    [restaurants.related],
  );
  const nearby = useMemo(
    () =>
      toNearbyRestaurantRowModel(restaurants.nearby, {
        reservation: getRestaurantReservation(restaurants.nearby.slug),
      }),
    [restaurants.nearby],
  );

  return (
    <PageContainer className="py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-dp-ink-muted">
          Development only
        </p>
        <h1 className="mt-3 font-display text-4xl text-dp-ink md:text-5xl">
          Stitch restaurant presentation
        </h1>
        <p className="mt-4 font-sans text-base text-dp-ink-secondary">
          Phase 3 component gallery. Uses canonical US restaurants and truthful
          reservation labels. No Google Places UI Kit. Not linked from site
          navigation; unavailable in production.
        </p>
      </header>

      <GallerySection
        id="discovery"
        title="Discovery cards"
        description="1★ approved image · 2★ / 3★ designed fallback"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <RestaurantDiscoveryCard model={discoveryOne} priority />
          <RestaurantDiscoveryCard model={discoveryTwo} />
          <RestaurantDiscoveryCard model={discoveryThree} />
        </div>
      </GallerySection>

      <GallerySection
        id="edge-cases"
        title="Edge cases"
        description="Long name · missing cuisine · missing price"
      >
        <div
          id="long-name-mobile"
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <RestaurantDiscoveryCard model={longName} />
          <RestaurantDiscoveryCard model={missingCuisine} />
          <RestaurantDiscoveryCard model={missingPrice} />
        </div>
      </GallerySection>

      <GallerySection
        id="save-states"
        title="Save states"
        description="Live passport toggle + controlled gallery demo"
      >
        <div className="flex flex-wrap items-center gap-4">
          <SaveAction restaurantSlug={restaurants.oneStar.slug} variant="compact" />
          <SaveAction restaurantSlug={restaurants.oneStar.slug} variant="editorial" />
          <SaveAction
            restaurantSlug="gallery-demo-saved"
            variant="overlay"
            className="!relative bg-dp-primary"
            saved={demoSaved}
            onSavedChange={setDemoSaved}
          />
          <p className="font-sans text-sm text-dp-ink-secondary">
            Controlled overlay: {demoSaved ? "saved" : "unsaved"}
          </p>
        </div>
      </GallerySection>

      <GallerySection
        id="reservation-labels"
        title="Reservation labels"
        description="All truthful resolver labels + unavailable state"
      >
        <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {LABEL_DEMOS.map((demo) => (
            <div key={demo.title} className="rounded-[var(--dp-radius-lg)] border border-dp-border p-4">
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.14em] text-dp-ink-muted">
                {demo.title}
              </p>
              <ReservationActionControl
                restaurantSlug={restaurants.threeStar.slug}
                action={demo.action}
                surface="explore_grid"
                variant="primary"
              />
            </div>
          ))}
          <div className="rounded-[var(--dp-radius-lg)] border border-dp-border p-4">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.14em] text-dp-ink-muted">
              Unavailable
            </p>
            <ReservationActionControl
              restaurantSlug={restaurants.threeStar.slug}
              action={LABEL_DEMOS[0]!.action}
              surface="explore_grid"
              variant="primary"
              disabled
            />
          </div>
        </div>
      </GallerySection>

      <GallerySection id="editorial" title="Editorial card">
        <RestaurantEditorialCard model={editorial} />
      </GallerySection>

      <GallerySection id="list-row" title="List row">
        <div className="rounded-[var(--dp-radius-lg)] border border-dp-border px-4">
          <RestaurantListRow model={listRow} />
        </div>
      </GallerySection>

      <GallerySection
        id="map-rows"
        title="Map rows"
        description="Selected vs unselected inside ~420px panel"
      >
        <div
          role="listbox"
          aria-label="Map restaurant results"
          className="w-full max-w-[420px] space-y-2 rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-soft p-3"
        >
          <RestaurantMapRow model={mapA} onSelect={setSelectedMapSlug} />
          <RestaurantMapRow model={mapB} onSelect={setSelectedMapSlug} />
        </div>
      </GallerySection>

      <GallerySection id="related-nearby" title="Related & nearby">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <RelatedRestaurantCard model={related} />
          <div className="rounded-[var(--dp-radius-lg)] border border-dp-border px-4">
            <NearbyRestaurantRow model={nearby} />
          </div>
        </div>
      </GallerySection>

      <GallerySection
        id="media-states"
        title="Media loading & error"
        description="Loading shimmer and failure fallback"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <RestaurantMedia
            name={restaurants.oneStar.name}
            seed={restaurants.oneStar.slug}
            city={restaurants.oneStar.city}
            stars={restaurants.oneStar.stars}
            imageUrl={APPROVED_DEMO_IMAGE.url}
            forceLoading
          />
          <RestaurantMedia
            name={restaurants.twoStar.name}
            seed={restaurants.twoStar.slug}
            city={restaurants.twoStar.city}
            stars={restaurants.twoStar.stars}
            imageUrl="/dev/does-not-exist.jpg"
            forceError
          />
          <RestaurantMedia
            name={restaurants.threeStar.name}
            seed={restaurants.threeStar.slug}
            city={restaurants.threeStar.city}
            stars={restaurants.threeStar.stars}
            imageUrl={APPROVED_DEMO_IMAGE.url}
            priority
          />
        </div>
      </GallerySection>

      <GallerySection id="skeletons" title="Skeletons" description="Proportional to final components">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <RestaurantCardSkeleton />
          <RestaurantEditorialCardSkeleton />
          <RestaurantRowSkeleton />
          <div className="max-w-[420px]">
            <RestaurantMapRowSkeleton />
          </div>
        </div>
      </GallerySection>

      <GallerySection
        id="narrow"
        title="Narrow mobile column"
        description="390px-class width without horizontal overflow"
      >
        <div className="mx-auto w-full max-w-[390px] space-y-6 border border-dashed border-dp-outline-variant p-3">
          <RestaurantDiscoveryCard model={longName} />
          <RestaurantListRow model={listRow} />
          <RestaurantMapRow model={mapA} onSelect={setSelectedMapSlug} />
        </div>
      </GallerySection>
    </PageContainer>
  );
}
