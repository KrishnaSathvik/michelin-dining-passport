"use client";

import { useMemo, useState } from "react";
import {
  GooglePlaceDetails,
  GooglePlaceDetailsCompact,
} from "@/components/google-places/GooglePlaceDetails";
import { GooglePlaceSkeleton } from "@/components/google-places/GooglePlaceSkeleton";
import { GooglePlaceUnavailable } from "@/components/google-places/GooglePlaceUnavailable";
import { GooglePlacesUiKitProvider } from "@/components/google-places/GooglePlacesUiKitProvider";
import { getGooglePlacesUiKitAvailability } from "@/lib/google-places/config";
import { GOOGLE_PLACES_SPIKE_FIXTURES } from "@/lib/google-places/spike-fixtures";
import { readGooglePlacesQueryIntents } from "@/lib/google-places/query-intent";

/**
 * Development-only Places UI Kit spike surface.
 * Not linked from production navigation.
 */
export function GooglePlacesSpikeClient() {
  const [rerenderToken, setRerenderToken] = useState(0);
  const [intents, setIntents] = useState(() =>
    typeof window === "undefined" ? [] : readGooglePlacesQueryIntents(),
  );
  const availability = getGooglePlacesUiKitAvailability();

  const demoPlaceId = useMemo(
    () =>
      GOOGLE_PLACES_SPIKE_FIXTURES.find((f) => f.placeId)?.placeId ??
      "ChIJuyI60yLTD4gROwTWENq1He0",
    [],
  );

  return (
    <GooglePlacesUiKitProvider>
      <div className="space-y-10">
        <section className="rounded-[var(--radius-md)] border border-border bg-surface-soft p-4">
          <h2 className="font-display text-2xl text-ink">Runtime gates</h2>
          <dl className="mt-3 grid gap-2 font-sans text-sm text-ink-secondary sm:grid-cols-2">
            <div>
              <dt className="text-ink-muted">Feature flag</dt>
              <dd data-testid="spike-flag">{availability.status}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">NODE_ENV</dt>
              <dd>{process.env.NODE_ENV}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-[var(--radius-md)] border border-border px-4 font-sans text-sm"
              onClick={() => setRerenderToken((n) => n + 1)}
            >
              Force parent rerender ({rerenderToken})
            </button>
            <button
              type="button"
              className="min-h-11 rounded-[var(--radius-md)] border border-border px-4 font-sans text-sm"
              onClick={() => setIntents(readGooglePlacesQueryIntents())}
            >
              Refresh query-intent log
            </button>
          </div>
          <ul
            className="mt-3 max-h-40 overflow-auto font-mono text-xs text-ink-muted"
            data-testid="spike-intent-log"
          >
            {intents.length === 0 ? (
              <li>No query intents recorded yet (development only).</li>
            ) : (
              intents.map((intent, index) => (
                <li key={`${intent.timestamp}-${index}`}>
                  {intent.timestamp} · {intent.componentType} ·{" "}
                  {intent.restaurantSlug} · …{intent.placeIdSuffix}
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">Static fallbacks</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <GooglePlaceUnavailable reason="disabled" />
            <GooglePlaceUnavailable reason="missing_key" />
            <GooglePlaceUnavailable reason="missing_place_id" />
            <GooglePlaceUnavailable reason="load_error" />
            <GooglePlaceSkeleton variant="full" />
            <GooglePlaceSkeleton variant="compact" />
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">
            Width probes (400px desktop · ~358px mobile)
          </h2>
          <div className="mt-4 flex flex-wrap gap-6">
            <div className="w-[400px] max-w-full border border-dashed border-border p-3">
              <p className="mb-2 font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                400px full
              </p>
              <GooglePlaceDetails
                key={`full-400-${demoPlaceId}`}
                placeId={demoPlaceId}
                restaurantSlug="alinea-chicago-il"
                page="/dev/google-places-spike"
                lazy={false}
              />
            </div>
            <div className="w-[358px] max-w-full border border-dashed border-border p-3">
              <p className="mb-2 font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                358px compact
              </p>
              <GooglePlaceDetailsCompact
                key={`compact-358-${demoPlaceId}`}
                placeId={demoPlaceId}
                restaurantSlug="alinea-chicago-il"
                page="/dev/google-places-spike"
                lazy={false}
              />
            </div>
          </div>
        </section>

        {GOOGLE_PLACES_SPIKE_FIXTURES.map((fixture) => (
          <section
            key={fixture.restaurantSlug}
            className="border-t border-border pt-8"
            data-spike-scenario={fixture.scenario}
          >
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
              {fixture.scenario.replaceAll("_", " ")}
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              {fixture.label}
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-sm text-ink-secondary">
              {fixture.scenarioNote}
            </p>
            <p className="mt-1 font-sans text-xs text-ink-muted">
              Michelin distinction and reservation CTA stay outside the Google
              component (product-owned).
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-sans text-sm font-medium text-ink">
                  Full Place Details
                </h3>
                <div className="mt-3 max-w-[400px]">
                  <GooglePlaceDetails
                    key={`full-${fixture.restaurantSlug}-${fixture.placeId ?? "none"}`}
                    placeId={fixture.placeId}
                    restaurantSlug={fixture.restaurantSlug}
                    page="/dev/google-places-spike"
                    lazy
                  />
                </div>
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium text-ink">
                  Compact Place Details
                </h3>
                <div className="mt-3 max-w-[500px]">
                  <GooglePlaceDetailsCompact
                    key={`compact-${fixture.restaurantSlug}-${fixture.placeId ?? "none"}`}
                    placeId={fixture.placeId}
                    restaurantSlug={fixture.restaurantSlug}
                    page="/dev/google-places-spike"
                    lazy={false}
                  />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </GooglePlacesUiKitProvider>
  );
}
