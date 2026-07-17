import type { AnalyticsEvent } from "@/lib/monitoring/analytics";
import { trackEvent } from "@/lib/monitoring/analytics";
import type {
  ReservationClickedEvent,
  ReservationProvider,
  ReservationSurface,
} from "./types";

type TrackReservationClickInput = {
  restaurantSlug: string;
  provider: ReservationProvider | "fallback_website" | "fallback_michelin";
  surface: ReservationSurface;
  isDirectBooking: boolean;
};

/**
 * Provider-neutral analytics hook used by reservation CTAs.
 * Private notes and secrets are never included.
 */
export function trackReservationClicked(
  input: TrackReservationClickInput,
): ReservationClickedEvent {
  const event = trackEvent("reservation_clicked", {
    restaurantSlug: input.restaurantSlug,
    provider: input.provider,
    surface: input.surface,
    isDirectBooking: input.isDirectBooking,
  }) as AnalyticsEvent;

  return {
    name: "reservation_clicked",
    restaurantSlug: input.restaurantSlug,
    provider: input.provider,
    surface: input.surface,
    isDirectBooking: input.isDirectBooking,
    timestamp: event.timestamp,
  };
}

export function analyticsProviderFromAction(
  source: string,
): ReservationClickedEvent["provider"] {
  if (source === "verified_direct") return "other";
  if (source.startsWith("official_website")) return "fallback_website";
  if (source.includes("michelin")) return "fallback_michelin";
  return "other";
}
