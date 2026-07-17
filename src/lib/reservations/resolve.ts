import type { Restaurant } from "@/lib/data/types";
import {
  isKnownBookingProvider,
  isProviderHomepage,
  providerDisplayLabel,
} from "./provider";
import type {
  ReservationAction,
  RestaurantReservation,
} from "./types";

function sameUrl(a: string, b: string): boolean {
  try {
    const left = new URL(a);
    const right = new URL(b);
    return (
      left.hostname.replace(/^www\./, "") ===
        right.hostname.replace(/^www\./, "") &&
      left.pathname.replace(/\/+$/, "") === right.pathname.replace(/\/+$/, "")
    );
  } catch {
    return a.replace(/\/+$/, "") === b.replace(/\/+$/, "");
  }
}

function isPublishableVerified(
  record: RestaurantReservation | null | undefined,
): record is RestaurantReservation & { reservationUrl: string } {
  if (!record) return false;
  if (record.status !== "verified") return false;
  if (record.confidence === "low") return false;
  if (!record.reservationUrl) return false;
  if (!record.verifiedAt) return false;
  if (isProviderHomepage(record.reservationUrl)) return false;
  if (!isKnownBookingProvider(record.provider) && record.provider !== "michelin") {
    return false;
  }
  return true;
}

/**
 * Resolve a truthful outbound reservation action.
 * Never invents provider search URLs or unverified booking destinations.
 */
export function getRestaurantReservationAction(
  restaurant: Restaurant,
  reservationRecord: RestaurantReservation | null | undefined,
): ReservationAction {
  const status = reservationRecord?.status ?? "unknown";

  if (status === "no_online_booking" || status === "phone_only") {
    if (restaurant.website) {
      return {
        href: restaurant.website,
        label: "Visit restaurant website",
        providerLabel:
          status === "phone_only" ? "Phone reservations" : "No online booking",
        isDirectBooking: false,
        source: "official_website_restricted",
      };
    }
    return {
      href: restaurant.michelinGuideUrl,
      label: "View booking options",
      providerLabel: "Michelin Guide",
      isDirectBooking: false,
      source: "michelin_listing",
    };
  }

  if (status === "temporarily_unavailable") {
    if (restaurant.website) {
      return {
        href: restaurant.website,
        label: "Check availability",
        providerLabel: "Restaurant website",
        isDirectBooking: false,
        source: "official_website_temporary",
      };
    }
    return {
      href: restaurant.michelinGuideUrl,
      label: "View booking options",
      providerLabel: "Michelin Guide",
      isDirectBooking: false,
      source: "michelin_listing",
    };
  }

  if (isPublishableVerified(reservationRecord)) {
    const url = reservationRecord.reservationUrl;
    const isMichelin = reservationRecord.provider === "michelin";
    if (isMichelin) {
      return {
        href: url,
        label: "View booking options",
        providerLabel: "Michelin Guide",
        isDirectBooking: false,
        source: "verified_michelin",
      };
    }
    return {
      href: url,
      label: "Reserve now",
      providerLabel: providerDisplayLabel(reservationRecord.provider),
      isDirectBooking: true,
      source: "verified_direct",
    };
  }

  if (restaurant.website) {
    return {
      href: restaurant.website,
      label: "Check availability",
      providerLabel: "Restaurant website",
      isDirectBooking: false,
      source: "official_website",
    };
  }

  return {
    href: restaurant.michelinGuideUrl,
    label: "View booking options",
    providerLabel: "Michelin Guide",
    isDirectBooking: false,
    source: "michelin_listing",
  };
}

/** True when the reservation CTA would duplicate the official website link. */
export function reservationDuplicatesWebsite(
  restaurant: Restaurant,
  action: ReservationAction,
): boolean {
  if (!restaurant.website) return false;
  return sameUrl(restaurant.website, action.href);
}

/** True when the reservation CTA would duplicate the Michelin listing link. */
export function reservationDuplicatesMichelin(
  restaurant: Restaurant,
  action: ReservationAction,
): boolean {
  return sameUrl(restaurant.michelinGuideUrl, action.href);
}
