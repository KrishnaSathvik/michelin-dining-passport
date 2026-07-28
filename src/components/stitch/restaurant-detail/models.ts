import type {
  ApprovedRestaurantImage,
  ResolvedReservationAction,
  RestaurantCardModel,
} from "@/components/stitch/restaurant";
import type { ReservationProvider } from "@/lib/reservations/types";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";

/**
 * First-party restaurant detail view model.
 * Google provider content must never be copied into this shape.
 */
export type RestaurantDetailModel = {
  slug: string;
  name: string;
  stars: 1 | 2 | 3;
  cuisine?: string;
  city: string;
  state: string;
  stateCode: string;
  citySlug: string;
  stateSlug: string;
  cuisineSlug: string;
  price?: string;
  address?: string;
  locationLabel: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  gallery: RestaurantGalleryImage[];
  reservation: ResolvedReservationAction;
  /** Provider for reservation analytics when available. */
  reservationProvider?: ReservationProvider;
  officialWebsite?: string;
  michelinGuideUrl?: string;
  showOfficialWebsite: boolean;
  showMichelinGuide: boolean;
  mapHref?: string;
  hasApprovedImage: boolean;
  /** Place ID is for the provider wrapper only — never Google content. */
  googlePlaceId: string | null;
};

export type RestaurantGalleryImage = ApprovedRestaurantImage & {
  id: string;
  kind: "verified" | "representative";
  credit?: string;
};

export type RestaurantDetailViewModel = {
  restaurant: RestaurantDetailModel;
  breadcrumbs: BreadcrumbItem[];
  related: RestaurantCardModel[];
  nearby: RestaurantCardModel[];
  relatedTitle: string;
  nearbyTitle: string;
};
