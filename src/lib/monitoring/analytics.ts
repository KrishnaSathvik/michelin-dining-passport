/**
 * Provider-neutral analytics and error-monitoring hooks.
 * Disabled unless environment flags are configured.
 *
 * Never send: private notes, favorite dishes, reservation confirmation notes,
 * passwords, auth tokens, or Supabase secrets.
 */

export type AnalyticsEventName =
  | "reservation_clicked"
  | "restaurant_detail_viewed"
  | "search_performed"
  | "filter_used"
  | "restaurant_saved"
  | "restaurant_visited"
  | "account_created"
  | "local_to_cloud_migration";

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  timestamp: string;
  properties?: Record<string, string | number | boolean | null>;
};

function analyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

function monitoringEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MONITORING_ENABLED === "true";
}

const BLOCKED_PROPERTY_KEYS = new Set([
  "notes",
  "privateNotes",
  "private_notes",
  "favoriteDishes",
  "favorite_dishes",
  "reservationConfirmationNote",
  "reservation_confirmation_note",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "supabaseKey",
  "secret",
]);

function scrubProperties(
  properties?: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> | undefined {
  if (!properties) return undefined;
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (BLOCKED_PROPERTY_KEYS.has(key)) continue;
    clean[key] = value;
  }
  return clean;
}

export function trackEvent(
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean | null>,
): AnalyticsEvent {
  const event: AnalyticsEvent = {
    name,
    timestamp: new Date().toISOString(),
    properties: scrubProperties(properties),
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mdp:analytics", { detail: event }));
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics]", event);
    }
  }

  if (!analyticsEnabled()) {
    return event;
  }

  // Provider adapters subscribe to `mdp:analytics` or replace this no-op sink.
  return event;
}

export function captureException(
  error: unknown,
  context?: Record<string, string | number | boolean | null>,
): void {
  const scrubbed = scrubProperties(context);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("mdp:error", {
        detail: {
          message: error instanceof Error ? error.message : String(error),
          context: scrubbed,
          timestamp: new Date().toISOString(),
        },
      }),
    );
  }
  if (!monitoringEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[monitoring:disabled]", error, scrubbed);
    }
    return;
  }
  // Provider adapters subscribe to `mdp:error`.
}
