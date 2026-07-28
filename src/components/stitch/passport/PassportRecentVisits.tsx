"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/stitch/Button";
import { MichelinDistinction } from "@/components/stitch/restaurant/MichelinDistinction";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { PassportVisitModel } from "./models";
import {
  JourneyVisitDialog,
  type VisitFormDraft,
} from "@/components/passport-actions/JourneyDialogs";

type PassportRecentVisitsProps = {
  visits: PassportVisitModel[];
};

export function PassportRecentVisits({ visits }: PassportRecentVisitsProps) {
  const { store, addVisit, editVisit, deleteVisit, removePlan } = usePassport();
  const [visibleCount, setVisibleCount] = useState(4);
  const [editor, setEditor] = useState<{
    model: PassportVisitModel;
    mode: "edit" | "add";
  } | null>(null);
  const visible = visits.slice(0, visibleCount);

  const liveVisit = editor?.mode === "edit"
    ? store.visits[editor.model.visit.id] ?? editor.model.visit
    : null;
  const restaurantVisits = useMemo(
    () =>
      editor
        ? Object.values(store.visits).filter(
            (visit) => visit.restaurantSlug === editor.model.slug,
          )
        : [],
    [editor, store.visits],
  );
  const plan = editor
    ? Object.values(store.plans).find(
        (item) => item.restaurantSlug === editor.model.slug,
      ) ?? null
    : null;

  const saveDraft = (draft: VisitFormDraft, completePlan: boolean) => {
    if (!editor) return;
    if (editor.mode === "edit" && liveVisit) {
      editVisit(liveVisit.id, {
        visitDate: draft.visitDate,
        favoriteDishes: draft.favoriteDishes,
        privateNotes: draft.privateNotes,
        wouldReturn: draft.wouldReturn,
        personalFavorite: draft.personalFavorite,
      });
    } else {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `visit:${crypto.randomUUID()}`
          : `visit:${Date.now()}`;
      addVisit({
        id,
        restaurantSlug: editor.model.slug,
        visitDate: draft.visitDate,
        favoriteDishes: draft.favoriteDishes,
        privateNotes: draft.privateNotes,
        wouldReturn: draft.wouldReturn,
        personalFavorite: draft.personalFavorite,
      });
    }
    if (completePlan && plan) {
      removePlan(plan.id);
    }
  };

  if (visits.length === 0) return null;

  return (
    <section
      aria-labelledby="recent-visits-heading"
      className="mb-[var(--dp-section)]"
      data-passport-section="recent-visits"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dp-label-caps text-dp-ink-muted">Remember</p>
          <h2
            id="recent-visits-heading"
            className="dp-headline-md mt-2 text-dp-primary-deep"
          >
            Recent visits
          </h2>
        </div>
        <Link
          href="/visited"
          className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary underline-offset-4 hover:underline"
        >
          View visit history
        </Link>
      </div>

      <ul className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        {visible.map((model) => (
          <li key={model.visit.id} className="min-w-0">
            <article
              className="grid min-w-0 overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface sm:grid-cols-[9.5rem_minmax(0,1fr)]"
              data-passport-card="visit"
            >
              <Link
                href={`/restaurants/${model.slug}`}
                aria-label={`Open ${model.name}`}
                className="block min-w-0"
              >
                <RestaurantMedia
                  name={model.name}
                  seed={`${model.slug}-${model.visit.id}`}
                  city={model.location}
                  stars={model.distinction}
                  imageUrl={model.imageUrl}
                  placeId={model.placeId}
                  ratioClass="aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[14rem]"
                  className="h-full rounded-none"
                  sizes="(max-width: 640px) 100vw, 152px"
                />
              </Link>
              <div className="flex min-w-0 flex-col p-5">
                <MichelinDistinction
                  stars={model.distinction}
                  variant="compact"
                />
                <h3 className="mt-3 font-display text-2xl leading-tight text-dp-primary-deep">
                  {model.name}
                </h3>
                <p className="mt-1 font-sans text-sm text-dp-ink-muted">
                  {model.location} · {model.dateLabel}
                </p>
                {model.favoriteDishesPreview ? (
                  <p className="mt-4 line-clamp-2 font-sans text-sm text-dp-ink-secondary">
                    <span className="font-semibold text-dp-ink">
                      Favorite dishes:
                    </span>{" "}
                    {model.favoriteDishesPreview}
                  </p>
                ) : null}
                {(model.personalFavorite ||
                  model.wouldReturn !== null) ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {model.personalFavorite ? (
                      <span className="rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_14%,white)] px-2.5 py-1 font-sans text-xs font-semibold text-dp-secondary">
                        Personal favorite
                      </span>
                    ) : null}
                    {model.wouldReturn !== null ? (
                      <span className="rounded-[var(--dp-radius-md)] bg-dp-soft px-2.5 py-1 font-sans text-xs font-medium text-dp-ink-secondary">
                        {model.wouldReturn
                          ? "Would return"
                          : "Would not return"}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-x-4 pt-5">
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
                    onClick={() => setEditor({ model, mode: "edit" })}
                  >
                    Edit visit
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
                    onClick={() => setEditor({ model, mode: "add" })}
                  >
                    Add another visit
                  </button>
                  <Link
                    href={`/restaurants/${model.slug}`}
                    className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
                  >
                    Open restaurant
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {visibleCount < visits.length ? (
        <div className="mt-6 flex justify-center">
          <Button
            variant="secondary"
            onClick={() => setVisibleCount((count) => count + 4)}
          >
            Load older visits
          </Button>
        </div>
      ) : null}

      {editor ? (
        <JourneyVisitDialog
          key={`${editor.mode}-${editor.model.visit.id}-${liveVisit?.updatedAt ?? "new"}`}
          open
          restaurantName={editor.model.name}
          visit={liveVisit}
          plan={plan}
          otherVisits={restaurantVisits}
          onClose={() => setEditor(null)}
          onSave={saveDraft}
          onDelete={
            liveVisit
              ? () => {
                  deleteVisit(liveVisit.id);
                }
              : undefined
          }
        />
      ) : null}
    </section>
  );
}
