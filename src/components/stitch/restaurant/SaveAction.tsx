"use client";

import { useState, useTransition } from "react";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { SaveActionVariant } from "./models";

type SaveActionProps = {
  restaurantSlug: string;
  variant?: SaveActionVariant;
  className?: string;
  /** Controlled saved state for gallery demos; otherwise reads passport. */
  saved?: boolean;
  onSavedChange?: (saved: boolean) => void;
};

const variantClass: Record<SaveActionVariant, string> = {
  overlay:
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-dp-ink/55 text-white backdrop-blur-sm transition-colors hover:bg-dp-ink/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
  compact:
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface text-dp-ink transition-colors hover:border-dp-primary hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus",
  editorial:
    "inline-flex min-h-12 items-center gap-2 rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-4 font-sans text-[14px] font-semibold text-dp-ink transition-colors hover:border-dp-primary hover:text-dp-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus",
};

/**
 * Passport save control. Guest local + signed-in cloud via usePassport.
 * Does not navigate. Want/Planned/Visited/Favorite remain journey controls.
 */
export function SaveAction({
  restaurantSlug,
  variant = "compact",
  className = "",
  saved: controlledSaved,
  onSavedChange,
}: SaveActionProps) {
  const { ready, getRecord, updateRestaurant } = usePassport();
  const passportSaved = Boolean(getRecord(restaurantSlug)?.saved);
  const saved =
    controlledSaved !== undefined ? controlledSaved : passportSaved;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const label = saved ? "Remove from saved" : "Save to passport";
  const stateText = saved ? "Saved" : "Not saved";

  const isControlled = controlledSaved !== undefined;

  return (
    <button
      type="button"
      className={`${variantClass[variant]} ${
        saved ? "text-dp-burgundy" : ""
      } ${pending ? "opacity-70" : ""} ${className}`}
      aria-pressed={saved}
      aria-label={label}
      aria-busy={pending || undefined}
      disabled={(!isControlled && !ready) || pending}
      title={error ? "Could not update save — try again" : label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setError(false);
        const next = !saved;
        startTransition(() => {
          try {
            if (!isControlled) {
              updateRestaurant(restaurantSlug, { saved: next });
            }
            onSavedChange?.(next);
          } catch {
            setError(true);
          }
        });
      }}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {saved ? "♥" : "♡"}
      </span>
      {variant === "editorial" ? (
        <span>{saved ? "Saved" : "Save"}</span>
      ) : null}
      <span className="sr-only">{stateText}</span>
    </button>
  );
}
