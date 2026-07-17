import type {
  ReservationAction,
  ReservationActionLabel,
  ReservationSurface,
} from "@/lib/reservations/types";

/**
 * Approved first-party restaurant image only.
 * Never Google Places photos or unrelated stock.
 */
export type ApprovedRestaurantImage = {
  url: string;
  alt?: string;
  objectPosition?: string;
};

/** Resolved outbound reservation action (from existing resolver). */
export type ResolvedReservationAction = ReservationAction;

/**
 * Shared card / row presentation model.
 * Deliberately excludes Google Places fields and unsupported mock content.
 */
export type RestaurantCardModel = {
  /** Stable first-party identifier (slug). */
  id: string;
  slug: string;
  name: string;
  distinction: 1 | 2 | 3;
  cuisine?: string;
  /** Formatted city/state line, e.g. "San Francisco, CA". */
  location: string;
  price?: string;
  image?: ApprovedRestaurantImage;
  reservation: ResolvedReservationAction;
  isSaved: boolean;
  surface: ReservationSurface;
};

export type RestaurantMapRowModel = RestaurantCardModel & {
  selected: boolean;
};

export type RestaurantNearbyRowModel = RestaurantCardModel & {
  /** Only when callers already compute distance — never invented. */
  distanceLabel?: string;
};

export type RestaurantEditorialCardModel = RestaurantCardModel & {
  eyebrow?: string;
};

export type MichelinDistinctionVariant =
  | "compact"
  | "editorial"
  | "row"
  | "detail";

export type ReservationActionVariant =
  | "primary"
  | "compact"
  | "editorial"
  | "text";

export type SaveActionVariant = "overlay" | "compact" | "editorial";

export type RestaurantMediaState = "ready" | "loading" | "error" | "empty";

/** Labels the product actually supports — never hardcode "Reserve". */
export const RESERVATION_ACTION_LABELS: readonly ReservationActionLabel[] = [
  "Reserve now",
  "Check availability",
  "View booking options",
  "Visit restaurant website",
] as const;

/** Fields that must never appear on shared card presentation models. */
export const FORBIDDEN_CARD_MODEL_KEYS = [
  "googlePlaceId",
  "googleRating",
  "googleReviewCount",
  "googlePhotos",
  "openingHours",
  "openNow",
  "reviews",
  "rating",
  "reviewCount",
  "neighborhood",
  "chefName",
  "trending",
  "recommendation",
] as const;
