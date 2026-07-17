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
 * Provider-neutral analytics hook. No third-party SDK is installed in Phase 5.5.
 * Events are emitted to the console in development and to a custom DOM event
 * so a future analytics provider can subscribe without changing call sites.
 */
export function trackReservationClicked(
  input: TrackReservationClickInput,
): ReservationClickedEvent {
  const event: ReservationClickedEvent = {
    name: "reservation_clicked",
    restaurantSlug: input.restaurantSlug,
    provider: input.provider,
    surface: input.surface,
    isDirectBooking: input.isDirectBooking,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("mdp:reservation_clicked", { detail: event }),
    );
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics]", event);
    }
  }

  return event;
}

export function analyticsProviderFromAction(source: string): ReservationClickedEvent["provider"] {
  if (source === "verified_direct") return "other";
  if (source.startsWith("official_website")) return "fallback_website";
  if (source.includes("michelin")) return "fallback_michelin";
  return "other";
}
