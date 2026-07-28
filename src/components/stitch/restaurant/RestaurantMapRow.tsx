"use client";

import type { KeyboardEvent } from "react";
import type { RestaurantMapRowModel } from "./models";
import { MichelinDistinction } from "./MichelinDistinction";
import { RestaurantMeta } from "./RestaurantMeta";
import { SaveAction } from "./SaveAction";

type RestaurantMapRowProps = {
  model: RestaurantMapRowModel;
  className?: string;
  onSelect?: (slug: string) => void;
};

/**
 * Compact map results panel row. Independent of MapLibre.
 * Selected state uses structure + color; no Reserve on every row.
 */
export function RestaurantMapRow({
  model,
  className = "",
  onSelect,
}: RestaurantMapRowProps) {
  const handleActivate = () => {
    onSelect?.(model.slug);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      role="option"
      aria-selected={model.selected}
      tabIndex={0}
      data-restaurant-card="map-row"
      data-slug={model.slug}
      data-selected={model.selected ? "true" : "false"}
      className={`group relative flex cursor-pointer items-center justify-between gap-3 rounded-[var(--dp-radius-lg)] border p-4 transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
        model.selected
          ? "border-2 border-dp-primary bg-dp-surface-low shadow-[var(--dp-shadow-hover)]"
          : "border-dp-outline-variant bg-dp-surface hover:shadow-[var(--dp-shadow-hover)]"
      } ${className}`}
      onClick={handleActivate}
      onKeyDown={onKeyDown}
    >
      {model.selected ? (
        <span
          className="absolute bottom-0 left-0 top-0 w-1 bg-dp-primary"
          aria-hidden="true"
        />
      ) : null}
      <div className={`min-w-0 flex-1 ${model.selected ? "pl-2" : ""}`}>
        <MichelinDistinction stars={model.distinction} variant="row" />
        <h3 className="mt-1 font-display text-[1.25rem] leading-tight text-dp-primary">
          {model.name}
        </h3>
        <RestaurantMeta
          cuisine={model.cuisine}
          location={model.location}
          className="mt-1"
          compact
        />
      </div>
      <div
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <SaveAction
          restaurantSlug={model.slug}
          variant="compact"
          className={
            model.selected
              ? "!h-10 !w-10 !min-h-10 !min-w-10 rounded-full border-dp-primary text-dp-primary"
              : "!h-10 !w-10 !min-h-10 !min-w-10 rounded-full"
          }
        />
      </div>
    </div>
  );
}
