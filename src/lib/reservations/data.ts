import reservationsDataset from "../../../data/reservations.json";
import overridesDataset from "../../../data/reservation-overrides.json";
import type {
  ReservationConfidence,
  ReservationOverride,
  ReservationProvider,
  ReservationSourceType,
  ReservationStatus,
  RestaurantReservation,
} from "./types";

type ReservationsFile = {
  version: number;
  updatedAt?: string;
  records: Record<string, RestaurantReservation>;
};

type OverridesFile = {
  version: number;
  updatedAt?: string;
  overrides: ReservationOverride[];
};

const data = reservationsDataset as ReservationsFile;
const overridesFile = overridesDataset as OverridesFile;

const STATUSES = new Set<ReservationStatus>([
  "verified",
  "needs_review",
  "no_online_booking",
  "phone_only",
  "temporarily_unavailable",
  "unknown",
]);

const PROVIDERS = new Set<ReservationProvider>([
  "resy",
  "tock",
  "opentable",
  "sevenrooms",
  "restaurant_direct",
  "michelin",
  "other",
  "none",
]);

const SOURCE_TYPES = new Set<ReservationSourceType>([
  "official_restaurant_website",
  "manual_verification",
  "provider_listing",
  "michelin_listing",
  "unknown",
]);

const CONFIDENCES = new Set<ReservationConfidence>(["high", "medium", "low"]);

function sanitizeRecord(
  slug: string,
  value: Partial<RestaurantReservation> | undefined,
): RestaurantReservation {
  return {
    restaurantSlug: slug,
    reservationUrl:
      typeof value?.reservationUrl === "string" ? value.reservationUrl : null,
    provider:
      value?.provider && PROVIDERS.has(value.provider) ? value.provider : "none",
    status:
      value?.status && STATUSES.has(value.status) ? value.status : "unknown",
    sourceUrl: typeof value?.sourceUrl === "string" ? value.sourceUrl : null,
    sourceType:
      value?.sourceType && SOURCE_TYPES.has(value.sourceType)
        ? value.sourceType
        : "unknown",
    confidence:
      value?.confidence && CONFIDENCES.has(value.confidence)
        ? value.confidence
        : "low",
    verifiedAt:
      typeof value?.verifiedAt === "string" ? value.verifiedAt : null,
    notes: typeof value?.notes === "string" ? value.notes : null,
  };
}

function applyOverride(
  record: RestaurantReservation,
  override: ReservationOverride | undefined,
): RestaurantReservation {
  if (!override) return record;
  return sanitizeRecord(record.restaurantSlug, {
    ...record,
    reservationUrl:
      override.reservationUrl !== undefined
        ? override.reservationUrl
        : record.reservationUrl,
    provider: override.provider ?? record.provider,
    status: override.status ?? record.status,
    sourceUrl:
      override.sourceUrl !== undefined ? override.sourceUrl : record.sourceUrl,
    sourceType: override.sourceType ?? record.sourceType,
    confidence: override.confidence ?? record.confidence,
    verifiedAt:
      override.verifiedAt !== undefined
        ? override.verifiedAt
        : record.verifiedAt,
    notes: override.notes !== undefined ? override.notes : record.notes,
  });
}

export function getReservationOverrides(): ReservationOverride[] {
  return Array.isArray(overridesFile.overrides) ? overridesFile.overrides : [];
}

/** Approved reservation records with overrides applied. Runtime must use this. */
export function getReservationRecords(): Record<string, RestaurantReservation> {
  const overrideBySlug = new Map(
    getReservationOverrides().map((item) => [item.restaurantSlug, item]),
  );
  const records: Record<string, RestaurantReservation> = {};
  for (const [slug, raw] of Object.entries(data.records ?? {})) {
    records[slug] = applyOverride(sanitizeRecord(slug, raw), overrideBySlug.get(slug));
  }
  return records;
}

export function getRestaurantReservation(
  slug: string,
): RestaurantReservation | null {
  return getReservationRecords()[slug] ?? null;
}
