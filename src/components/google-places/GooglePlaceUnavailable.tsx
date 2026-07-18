import { GOOGLE_PLACES_UNAVAILABLE_MESSAGE } from "@/lib/google-places/config";

type GooglePlaceUnavailableProps = {
  reason?:
    | "disabled"
    | "missing_key"
    | "missing_place_id"
    | "error"
    | "timeout"
    | "load_error";
  className?: string;
};

const reasonCopy: Record<
  NonNullable<GooglePlaceUnavailableProps["reason"]>,
  string
> = {
  disabled: GOOGLE_PLACES_UNAVAILABLE_MESSAGE,
  missing_key: GOOGLE_PLACES_UNAVAILABLE_MESSAGE,
  missing_place_id: GOOGLE_PLACES_UNAVAILABLE_MESSAGE,
  error: GOOGLE_PLACES_UNAVAILABLE_MESSAGE,
  timeout: GOOGLE_PLACES_UNAVAILABLE_MESSAGE,
  load_error: GOOGLE_PLACES_UNAVAILABLE_MESSAGE,
};

/**
 * Google provider outer state — does not imply the restaurant itself is unavailable.
 */
export function GooglePlaceUnavailable({
  reason = "error",
  className = "",
}: GooglePlaceUnavailableProps) {
  return (
    <div
      className={`rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-soft px-4 py-5 ${className}`}
      role="status"
      data-google-places-fallback={reason}
    >
      <p className="font-sans text-sm leading-relaxed text-dp-ink-secondary">
        {reasonCopy[reason]}
      </p>
    </div>
  );
}
