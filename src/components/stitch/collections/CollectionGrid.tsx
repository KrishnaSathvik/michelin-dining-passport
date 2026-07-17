"use client";

import { CollectionGridCard } from "./CollectionGridCard";
import type { CollectionCardModel } from "./models";
import type { LocalCollection } from "@/lib/passport/types";

type CollectionGridProps = {
  cards: CollectionCardModel[];
  collectionsById: Record<string, LocalCollection>;
};

export function CollectionGrid({ cards, collectionsById }: CollectionGridProps) {
  if (cards.length === 0) {
    return (
      <p
        className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant px-5 py-10 text-center font-sans text-[15px] text-dp-ink-muted"
        data-collections-section="grid-empty"
      >
        No collections match your search.
      </p>
    );
  }

  return (
    <ul
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      data-collections-section="grid"
    >
      {cards.map((card) => {
        const collection = collectionsById[card.id];
        if (!collection) return null;
        return (
          <li key={card.id}>
            <CollectionGridCard model={card} collection={collection} />
          </li>
        );
      })}
    </ul>
  );
}
