"use client";

import { useGooglePlace } from "@/components/google-places/useGooglePlace";

type RestaurantGoogleInfoProps = {
  placeId: string | null;
};

const tileClass = "min-w-0 border-b border-dp-border py-5 sm:pr-6";
const labelClass = "dp-label-caps text-dp-ink-muted";
const valueClass = "mt-2 font-sans text-base leading-relaxed text-dp-ink";

/**
 * Live Google facts (rating, hours, phone) rendered as detail tiles that sit
 * inline with the first-party facts. Renders nothing until/unless data loads.
 */
export function RestaurantGoogleInfo({ placeId }: RestaurantGoogleInfoProps) {
  const place = useGooglePlace(placeId);
  if (place.status !== "ready") return null;

  const { rating, userRatingCount, weekdayDescriptions, openNow, phone } =
    place.data;

  const hasRating = rating != null;
  const hasHours = weekdayDescriptions.length > 0;
  const hasPhone = Boolean(phone);
  if (!hasRating && !hasHours && !hasPhone) return null;

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayLine = weekdayDescriptions.find((line) =>
    line.toLowerCase().startsWith(todayName.toLowerCase()),
  );
  const todayHours = todayLine
    ? todayLine.replace(/^[^:]+:\s*/, "")
    : null;

  return (
    <>
      {hasRating ? (
        <div className={tileClass} data-google-fact="rating">
          <dt className={labelClass}>Google rating</dt>
          <dd className={valueClass}>
            <span className="inline-flex items-center gap-1.5">
              <span className="font-semibold">{rating!.toFixed(1)}</span>
              <span className="text-[var(--dp-star-gold)]" aria-hidden>
                ★
              </span>
              {userRatingCount != null ? (
                <span className="text-dp-ink-muted">
                  ({userRatingCount.toLocaleString()} reviews)
                </span>
              ) : null}
            </span>
          </dd>
        </div>
      ) : null}

      {hasHours ? (
        <div className={tileClass} data-google-fact="hours">
          <dt className={labelClass}>Hours</dt>
          <dd className={valueClass}>
            <span className="flex flex-wrap items-center gap-2">
              {openNow !== null ? (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-sans text-xs font-semibold ${
                    openNow
                      ? "bg-[color-mix(in_srgb,var(--dp-primary)_12%,white)] text-dp-primary"
                      : "bg-dp-soft text-dp-burgundy"
                  }`}
                >
                  {openNow ? "Open now" : "Closed"}
                </span>
              ) : null}
              {todayHours ? <span>{todayHours}</span> : null}
            </span>
            <details className="mt-2 group">
              <summary className="cursor-pointer list-none font-sans text-sm font-semibold text-dp-primary [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">See all hours</span>
                <span className="hidden group-open:inline">Hide hours</span>
              </summary>
              <ul className="mt-2 space-y-1 font-sans text-sm text-dp-ink-secondary">
                {weekdayDescriptions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
          </dd>
        </div>
      ) : null}

      {hasPhone ? (
        <div className={tileClass} data-google-fact="phone">
          <dt className={labelClass}>Phone</dt>
          <dd className={valueClass}>
            <a
              href={`tel:${phone!.replace(/[^+\d]/g, "")}`}
              className="text-dp-primary no-underline hover:underline"
            >
              {phone}
            </a>
          </dd>
        </div>
      ) : null}

      <div className="col-span-full py-3">
        <p className="font-sans text-xs text-dp-ink-muted">
          Rating, hours, and phone are provided by Google and may change.
        </p>
      </div>
    </>
  );
}
