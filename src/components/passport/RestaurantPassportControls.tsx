"use client";

import { useState } from "react";
import { usePassport } from "@/lib/passport/PassportProvider";

type RestaurantPassportControlsProps = {
  restaurantSlug: string;
};

const toggleClass =
  "min-h-10 border border-border px-3 font-sans text-sm text-ink transition-colors hover:border-forest data-[active=true]:border-forest data-[active=true]:bg-forest data-[active=true]:text-bg-elevated";

export function RestaurantPassportControls({
  restaurantSlug,
}: RestaurantPassportControlsProps) {
  const { ready, getRecord, updateRestaurant, removeRestaurant } = usePassport();
  const record = getRecord(restaurantSlug);
  const [notes, setNotes] = useState(record?.notes ?? "");
  const [dishes, setDishes] = useState(
    (record?.favoriteDishes ?? []).join(", "),
  );

  if (!ready) {
    return (
      <p className="font-sans text-sm text-ink-muted">Loading passport…</p>
    );
  }

  const toggle = (
    key: "saved" | "wantToVisit" | "planned" | "visited" | "favorite",
  ) => {
    updateRestaurant(restaurantSlug, { [key]: !record?.[key] });
  };

  return (
    <section className="space-y-4 border border-border bg-bg-elevated/50 p-5">
      <div>
        <h2 className="font-display text-2xl text-ink">Your passport</h2>
        <p className="mt-1 font-sans text-sm text-ink-muted">
          Saved on this device.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["saved", "Saved"],
            ["wantToVisit", "Want to visit"],
            ["planned", "Planned"],
            ["visited", "Visited"],
            ["favorite", "Favorite"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={toggleClass}
            data-active={Boolean(record?.[key])}
            aria-pressed={Boolean(record?.[key])}
            onClick={() => toggle(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block font-sans text-sm text-ink">
          Visit date
          <input
            type="date"
            className="mt-2 min-h-11 w-full border border-border bg-bg-elevated px-3"
            value={record?.visitDate ?? ""}
            onChange={(event) =>
              updateRestaurant(restaurantSlug, {
                visitDate: event.target.value || null,
                visited: event.target.value ? true : record?.visited,
              })
            }
          />
        </label>
        <label className="block font-sans text-sm text-ink">
          Personal rating
          <select
            className="mt-2 min-h-11 w-full border border-border bg-bg-elevated px-3"
            value={record?.personalRating ?? ""}
            onChange={(event) =>
              updateRestaurant(restaurantSlug, {
                personalRating: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
          >
            <option value="">Unset</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block font-sans text-sm text-ink">
        Private notes
        <textarea
          className="mt-2 min-h-24 w-full border border-border bg-bg-elevated px-3 py-2"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={() => updateRestaurant(restaurantSlug, { notes })}
        />
      </label>

      <label className="block font-sans text-sm text-ink">
        Favorite dishes
        <input
          type="text"
          className="mt-2 min-h-11 w-full border border-border bg-bg-elevated px-3"
          placeholder="Comma-separated"
          value={dishes}
          onChange={(event) => setDishes(event.target.value)}
          onBlur={() =>
            updateRestaurant(restaurantSlug, {
              favoriteDishes: dishes
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      </label>

      <div className="border-t border-border pt-4">
        <h3 className="font-display text-xl text-ink">Reservation notes</h3>
        <p className="mt-1 font-sans text-xs text-ink-muted">
          Optional private planning fields. Clicking an external reserve link
          does not confirm a booking.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block font-sans text-sm text-ink">
            Planned for
            <input
              type="date"
              className="mt-2 min-h-11 w-full border border-border bg-bg-elevated px-3"
              value={record?.reservationPlannedFor ?? ""}
              onChange={(event) =>
                updateRestaurant(restaurantSlug, {
                  reservationPlannedFor: event.target.value || null,
                  planned: event.target.value ? true : record?.planned,
                })
              }
            />
          </label>
          <label className="block font-sans text-sm text-ink">
            Provider
            <input
              type="text"
              className="mt-2 min-h-11 w-full border border-border bg-bg-elevated px-3"
              placeholder="Resy, Tock, phone…"
              value={record?.reservationProvider ?? ""}
              onChange={(event) =>
                updateRestaurant(restaurantSlug, {
                  reservationProvider: event.target.value || null,
                })
              }
            />
          </label>
        </div>
        <label className="mt-4 block font-sans text-sm text-ink">
          Confirmation note
          <input
            type="text"
            maxLength={280}
            className="mt-2 min-h-11 w-full border border-border bg-bg-elevated px-3"
            placeholder="Short private note only"
            value={record?.reservationConfirmationNote ?? ""}
            onChange={(event) =>
              updateRestaurant(restaurantSlug, {
                reservationConfirmationNote: event.target.value || null,
              })
            }
          />
        </label>
      </div>

      {record ? (
        <button
          type="button"
          className="font-sans text-sm text-burgundy underline underline-offset-4"
          onClick={() => removeRestaurant(restaurantSlug)}
        >
          Remove personal data for this restaurant
        </button>
      ) : null}
    </section>
  );
}
