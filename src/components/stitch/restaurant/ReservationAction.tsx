"use client";

import {
  analyticsProviderFromAction,
  trackReservationClicked,
} from "@/lib/reservations/analytics";
import type { ReservationProvider } from "@/lib/reservations/types";
import type {
  ResolvedReservationAction,
  ReservationActionVariant,
} from "./models";
import type { ReservationSurface } from "@/lib/reservations/types";

type ReservationActionProps = {
  restaurantSlug: string;
  action: ResolvedReservationAction;
  surface: ReservationSurface;
  variant?: ReservationActionVariant;
  /** Optional provider from reservation record for analytics. */
  analyticsProvider?: ReservationProvider;
  showProvider?: boolean;
  className?: string;
  disabled?: boolean;
};

const variantClass: Record<ReservationActionVariant, string> = {
  primary:
    "inline-flex min-h-11 w-full flex-col items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-primary bg-dp-primary px-5 py-2.5 text-dp-on-primary transition-colors hover:bg-dp-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus",
  compact:
    "inline-flex min-h-11 min-w-11 flex-col items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-4 py-2 text-dp-ink transition-colors hover:border-dp-primary hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus",
  editorial:
    "inline-flex min-h-12 flex-col items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-primary bg-dp-primary px-6 py-3 text-dp-on-primary transition-colors hover:bg-dp-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus",
  text:
    "inline-flex min-h-11 items-center gap-1 rounded-[var(--dp-radius-md)] px-1 py-2 font-sans text-sm font-medium text-dp-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus",
};

/**
 * Truthful reservation CTA wrapping existing resolver output + analytics.
 * Never hardcodes "Reserve".
 */
export function ReservationAction({
  restaurantSlug,
  action,
  surface,
  variant = "primary",
  analyticsProvider,
  showProvider = false,
  className = "",
  disabled = false,
}: ReservationActionProps) {
  if (disabled) {
    return (
      <span
        className={`inline-flex min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-soft px-4 font-sans text-[14px] font-medium text-dp-ink-muted ${className}`}
        aria-disabled="true"
      >
        Reservation unavailable
      </span>
    );
  }

  const providerTone =
    variant === "primary" || variant === "editorial"
      ? "text-white/85"
      : "text-dp-ink-muted";

  return (
    <a
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${variantClass[variant]} no-underline ${className}`}
      title={`${action.label}${action.providerLabel ? ` — ${action.providerLabel}` : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        trackReservationClicked({
          restaurantSlug,
          provider:
            action.isDirectBooking && analyticsProvider
              ? analyticsProvider
              : analyticsProviderFromAction(action.source),
          surface,
          isDirectBooking: action.isDirectBooking,
        });
      }}
    >
      <span className="font-sans text-[14px] font-semibold leading-tight tracking-wide">
        {action.label}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
      {showProvider && action.providerLabel ? (
        <span className={`font-sans text-xs leading-tight ${providerTone}`}>
          {action.providerLabel}
        </span>
      ) : null}
    </a>
  );
}
