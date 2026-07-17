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

export function GooglePlaceUnavailable({
  reason = "error",
  className = "",
}: GooglePlaceUnavailableProps) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-border bg-surface-soft px-4 py-5 ${className}`}
      role="status"
      data-google-places-fallback={reason}
    >
      <p className="font-sans text-sm leading-relaxed text-ink-muted">
        {reasonCopy[reason]}
      </p>
    </div>
  );
}
