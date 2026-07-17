import matchesDataset from "../../../data/google-place-ids.json";
import overridesDataset from "../../../data/google-place-id-overrides.json";

export type GooglePlaceMatchStatus =
  | "matched"
  | "manually_approved"
  | "needs_review"
  | "rejected"
  | "no_match";

export type GooglePlaceMatchConfidence = "high" | "medium" | "low";

export type GooglePlaceMatch = {
  restaurantSlug: string;
  placeId: string | null;
  status: GooglePlaceMatchStatus;
  confidence: GooglePlaceMatchConfidence;
  method: string;
  reviewedAt: string;
  notes?: string;
};

type MatchesFile = {
  version: number;
  updatedAt?: string;
  matches: GooglePlaceMatch[];
};

type OverridesFile = {
  version: number;
  updatedAt?: string;
  overrides: GooglePlaceMatch[];
};

const APPROVED: ReadonlySet<GooglePlaceMatchStatus> = new Set([
  "matched",
  "manually_approved",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeMatch(value: unknown): GooglePlaceMatch | null {
  if (!isRecord(value)) return null;
  const slug = value.restaurantSlug;
  const status = value.status;
  const confidence = value.confidence;
  if (typeof slug !== "string" || !slug) return null;
  if (
    status !== "matched" &&
    status !== "manually_approved" &&
    status !== "needs_review" &&
    status !== "rejected" &&
    status !== "no_match"
  ) {
    return null;
  }
  if (confidence !== "high" && confidence !== "medium" && confidence !== "low") {
    return null;
  }
  const placeId =
    typeof value.placeId === "string" && value.placeId.trim()
      ? value.placeId.trim()
      : null;
  return {
    restaurantSlug: slug,
    placeId: status === "rejected" || status === "no_match" ? null : placeId,
    status,
    confidence,
    method: typeof value.method === "string" ? value.method : "unknown",
    reviewedAt: typeof value.reviewedAt === "string" ? value.reviewedAt : "",
    notes: typeof value.notes === "string" ? value.notes : "",
  };
}

function buildIndex(): Map<string, GooglePlaceMatch> {
  const file = matchesDataset as MatchesFile;
  const overridesFile = overridesDataset as OverridesFile;
  const map = new Map<string, GooglePlaceMatch>();
  for (const row of file.matches ?? []) {
    const clean = sanitizeMatch(row);
    if (clean) map.set(clean.restaurantSlug, clean);
  }
  for (const row of overridesFile.overrides ?? []) {
    const clean = sanitizeMatch(row);
    if (clean) map.set(clean.restaurantSlug, clean);
  }
  return map;
}

const bySlug = buildIndex();

export function getGooglePlaceMatch(
  restaurantSlug: string,
): GooglePlaceMatch | null {
  return bySlug.get(restaurantSlug) ?? null;
}

/** Approved Place ID for UI Kit enrichment, or null. */
export function getApprovedGooglePlaceId(
  restaurantSlug: string,
): string | null {
  const match = getGooglePlaceMatch(restaurantSlug);
  if (!match) return null;
  if (!APPROVED.has(match.status)) return null;
  return match.placeId;
}
