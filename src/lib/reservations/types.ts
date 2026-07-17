export type ReservationStatus =
  | "verified"
  | "needs_review"
  | "no_online_booking"
  | "phone_only"
  | "temporarily_unavailable"
  | "unknown";

export type ReservationProvider =
  | "resy"
  | "tock"
  | "opentable"
  | "sevenrooms"
  | "restaurant_direct"
  | "michelin"
  | "other"
  | "none";

export type ReservationSourceType =
  | "official_restaurant_website"
  | "manual_verification"
  | "provider_listing"
  | "michelin_listing"
  | "unknown";

export type ReservationConfidence = "high" | "medium" | "low";

export type RestaurantReservation = {
  restaurantSlug: string;
  reservationUrl: string | null;
  provider: ReservationProvider;
  status: ReservationStatus;
  sourceUrl: string | null;
  sourceType: ReservationSourceType;
  confidence: ReservationConfidence;
  verifiedAt: string | null;
  notes: string | null;
};

export type ReservationOverride = {
  restaurantSlug: string;
  reservationUrl?: string | null;
  provider?: ReservationProvider;
  status?: ReservationStatus;
  sourceUrl?: string | null;
  sourceType?: ReservationSourceType;
  confidence?: ReservationConfidence;
  verifiedAt?: string | null;
  notes?: string | null;
  reason: string;
  decidedAt: string;
};

export type ReservationActionLabel =
  | "Reserve now"
  | "Check availability"
  | "View booking options"
  | "Visit restaurant website";

export type ReservationAction = {
  href: string;
  label: ReservationActionLabel;
  providerLabel: string | null;
  isDirectBooking: boolean;
  source: string;
};

export type ReservationSurface =
  | "homepage"
  | "explore_grid"
  | "explore_list"
  | "restaurant_detail"
  | "related_restaurant"
  | "taxonomy"
  | "map_list"
  | "map_marker"
  | "map_mobile_sheet"
  | "saved"
  | "planned"
  | "visited"
  | "collection";

export type ReservationClickedEvent = {
  name: "reservation_clicked";
  restaurantSlug: string;
  provider: ReservationProvider | "fallback_website" | "fallback_michelin";
  surface: ReservationSurface;
  isDirectBooking: boolean;
  timestamp: string;
};
