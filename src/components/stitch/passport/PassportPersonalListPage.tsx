"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  JourneyPlanDialog,
  JourneyVisitDialog,
  type PlanFormDraft,
  type VisitFormDraft,
} from "@/components/passport-actions/JourneyDialogs";
import {
  RemoveFromPassportDialog,
  type RemoveFromPassportConsequences,
} from "@/components/passport-actions/RemoveFromPassportDialog";
import { Button } from "@/components/stitch/Button";
import { PageContainer } from "@/components/stitch/PageContainer";
import { MichelinDistinction } from "@/components/stitch/restaurant/MichelinDistinction";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import {
  buildPlannedPersonalList,
  buildSavedPersonalList,
  buildVisitedPersonalList,
  type PlannedPersonalListItem,
  type SavedPersonalListItem,
  type VisitedPersonalListGroup,
} from "@/lib/passport/personal-lists";
import { usePassport } from "@/lib/passport/PassportProvider";
import type {
  RestaurantPlan,
  RestaurantVisit,
} from "@/lib/passport/types";
import { toListPageModel, toSyncState } from "./adapters";
import { PassportListEmptyState } from "./PassportListEmptyState";
import { PassportListHeader } from "./PassportListHeader";
import { PassportLoadingState } from "./PassportLoadingState";
import { PassportSyncNotice } from "./PassportSyncNotice";
import type { PassportListMode } from "./models";

type PassportPersonalListPageProps = {
  mode: PassportListMode;
  proof?: "loading" | "empty" | "sync-pending" | "sync-failed";
};

type PlanEditor = {
  item: PlannedPersonalListItem;
  intent: "edit" | "remove";
};

type VisitEditor = {
  slug: string;
  name: string;
  plan: RestaurantPlan | null;
  visits: RestaurantVisit[];
  visit: RestaurantVisit | null;
  intent: "edit" | "add" | "delete";
};

function today(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string | null): string {
  if (!value) return "Date not recorded";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string | null): string | null {
  if (!value) return null;
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function visitId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `visit:${crypto.randomUUID()}`
    : `visit:${Date.now()}`;
}

function matchesSearch(
  item: {
    name: string;
    city: string;
    state: string;
    stateCode: string;
    cuisine: string | null;
  },
  query: string,
): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;
  return [item.name, item.city, item.state, item.stateCode, item.cuisine ?? ""]
    .join(" ")
    .toLocaleLowerCase()
    .includes(normalized);
}

function visitLabel(count: number): string {
  if (count === 1) return "Visited once";
  if (count === 2) return "Visited twice";
  return `${count} visits`;
}

function PersonalListControls({
  mode,
  count,
  query,
  savedItems,
}: {
  mode: PassportListMode;
  count: number;
  query: string;
  savedItems: SavedPersonalListItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState(query);
  const stars = searchParams.get("stars") ?? "";
  const state = searchParams.get("state") ?? "";
  const cuisine = searchParams.get("cuisine") ?? "";
  const hasPlan = searchParams.get("plan") === "1";
  const visited = searchParams.get("visited") === "1";
  const sort = searchParams.get("sort") ?? "recent";

  const stateOptions = useMemo(
    () =>
      [...new Set(savedItems.map((item) => item.stateCode))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [savedItems],
  );
  const cuisineOptions = useMemo(
    () =>
      [
        ...new Set(
          savedItems
            .map((item) => item.cuisine)
            .filter((value): value is string => Boolean(value)),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [savedItems],
  );

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}${next.size ? `?${next.toString()}` : ""}`, {
      scroll: false,
    });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    update("q", draft.trim());
  };

  return (
    <section
      aria-label={`${mode} list controls`}
      className="mb-8 rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface p-4 sm:p-5"
      data-personal-list-controls={mode}
    >
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form
          role="search"
          className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
          onSubmit={submitSearch}
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search {mode} restaurants</span>
            <input
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Search ${mode} restaurants`}
              className="h-12 w-full min-w-0 rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-bg px-4 font-sans text-sm text-dp-ink"
            />
          </label>
          <Button type="submit" className="shrink-0">
            Search
          </Button>
          {query ? (
            <Button
              variant="ghost"
              className="shrink-0"
              onClick={() => {
                setDraft("");
                update("q", "");
              }}
            >
              Clear search
            </Button>
          ) : null}
        </form>
        <p
          className="shrink-0 font-sans text-sm text-dp-ink-muted"
          aria-live="polite"
        >
          {count} {count === 1 ? "restaurant" : "restaurants"}
        </p>
      </div>

      {mode === "saved" ? (
        <div className="mt-4 flex min-w-0 flex-wrap items-end gap-3 border-t border-dp-border pt-4">
          <FilterSelect
            label="Michelin distinction"
            value={stars}
            onChange={(value) => update("stars", value)}
            options={[
              ["", "All stars"],
              ["1", "One star"],
              ["2", "Two stars"],
              ["3", "Three stars"],
            ]}
          />
          <FilterSelect
            label="State"
            value={state}
            onChange={(value) => update("state", value)}
            options={[
              ["", "All states"],
              ...stateOptions.map((value) => [value, value] as const),
            ]}
          />
          <FilterSelect
            label="Cuisine"
            value={cuisine}
            onChange={(value) => update("cuisine", value)}
            options={[
              ["", "All cuisines"],
              ...cuisineOptions.map((value) => [value, value] as const),
            ]}
          />
          <label className="inline-flex min-h-12 items-center gap-2 rounded-[var(--dp-radius-md)] border border-dp-outline-variant px-3 font-sans text-sm text-dp-ink-secondary">
            <input
              type="checkbox"
              checked={hasPlan}
              onChange={(event) => update("plan", event.target.checked ? "1" : "")}
              className="h-4 w-4 accent-dp-primary"
            />
            Has upcoming plan
          </label>
          <label className="inline-flex min-h-12 items-center gap-2 rounded-[var(--dp-radius-md)] border border-dp-outline-variant px-3 font-sans text-sm text-dp-ink-secondary">
            <input
              type="checkbox"
              checked={visited}
              onChange={(event) =>
                update("visited", event.target.checked ? "1" : "")
              }
              className="h-4 w-4 accent-dp-primary"
            />
            Previously visited
          </label>
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={(value) => update("sort", value)}
            options={[
              ["recent", "Recently saved"],
              ["name", "Restaurant name"],
              ["stars", "Michelin stars: high to low"],
              ["city", "City"],
            ]}
          />
        </div>
      ) : null}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="font-sans text-xs font-semibold text-dp-ink-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 max-w-full rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface px-3 font-sans text-sm text-dp-ink"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={`${label}-${optionValue}`} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function SavedCard({
  item,
  onManage,
}: {
  item: SavedPersonalListItem;
  onManage: (item: SavedPersonalListItem) => void;
}) {
  return (
    <article
      className="group flex h-full min-w-0 flex-col"
      data-personal-card="saved"
    >
      <Link
        href={`/restaurants/${item.slug}`}
        aria-label={`Open ${item.name}`}
        className="block min-w-0 overflow-hidden rounded-[var(--dp-radius-lg)]"
      >
        <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02]">
          <RestaurantMedia
            name={item.name}
            seed={item.slug}
            city={item.location}
            stars={item.distinction}
            imageUrl={item.imageUrl}
            placeId={item.placeId}
            ratioClass="aspect-[4/3]"
          />
        </div>
      </Link>
      <div className="flex flex-1 min-w-0 flex-col pt-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <MichelinDistinction stars={item.distinction} variant="compact" />
          <button
            type="button"
            className="inline-flex min-h-11 shrink-0 items-center rounded-[var(--dp-radius-md)] px-2 font-sans text-sm font-semibold text-dp-primary hover:bg-dp-soft"
            aria-label={`Manage ${item.name} in My Restaurants`}
            onClick={() => onManage(item)}
          >
            Manage
          </button>
        </div>
        <h2 className="mt-2 font-display text-2xl leading-tight text-dp-primary-deep">
          <Link
            href={`/restaurants/${item.slug}`}
            className="no-underline hover:text-dp-primary"
          >
            {item.name}
          </Link>
        </h2>
        <p className="mt-2 font-sans text-sm leading-relaxed text-dp-ink-muted">
          {[item.cuisine, item.location, item.price].filter(Boolean).join(" · ")}
        </p>
        {item.plan || item.visitCount > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.plan ? (
              <span className="rounded-[var(--dp-radius-md)] bg-dp-soft px-2.5 py-1 font-sans text-xs font-semibold text-dp-primary">
                {item.planStatus === "needs-update"
                  ? "Needs update"
                  : item.planStatus === "undated"
                    ? "Plan date needed"
                    : "Planned"}{" "}
                · {formatDate(item.plan.plannedDate)}
              </span>
            ) : null}
            {item.visitCount ? (
              <span className="rounded-[var(--dp-radius-md)] bg-dp-soft px-2.5 py-1 font-sans text-xs font-semibold text-dp-ink-secondary">
                {visitLabel(item.visitCount)}
              </span>
            ) : null}
            {item.personalFavorite ? (
              <span className="rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_14%,white)] px-2.5 py-1 font-sans text-xs font-semibold text-dp-secondary">
                Personal favorite
              </span>
            ) : null}
          </div>
        ) : null}
        <Link
          href={`/restaurants/${item.slug}`}
          className="mt-auto inline-flex min-h-11 items-center pt-4 font-sans text-sm font-semibold text-dp-primary hover:underline"
        >
          Open details
        </Link>
      </div>
    </article>
  );
}

function PlannedCard({
  item,
  onEdit,
  onRemove,
  onRecord,
}: {
  item: PlannedPersonalListItem;
  onEdit: () => void;
  onRemove: () => void;
  onRecord: () => void;
}) {
  const needsUpdate = item.status !== "upcoming";
  return (
    <article
      className="grid min-w-0 overflow-hidden rounded-[var(--dp-radius-xl)] border border-dp-outline-variant bg-dp-surface md:grid-cols-[14rem_minmax(0,1fr)]"
      data-personal-card="planned"
      data-plan-status={item.status}
    >
      <Link
        href={`/restaurants/${item.slug}`}
        aria-label={`Open ${item.name}`}
        className="block min-w-0"
      >
        <RestaurantMedia
          name={item.name}
          seed={item.slug}
          city={item.location}
          stars={item.distinction}
          imageUrl={item.imageUrl}
          placeId={item.placeId}
          ratioClass="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[15rem]"
          className="h-full rounded-none"
          sizes="(max-width: 768px) 100vw, 224px"
        />
      </Link>
      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <MichelinDistinction stars={item.distinction} variant="compact" />
          {needsUpdate ? (
            <span className="rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-secondary-container)_35%,white)] px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-dp-secondary">
              Needs update
            </span>
          ) : null}
        </div>
        <h3 className="mt-4 font-display text-3xl leading-tight text-dp-primary-deep">
          {item.name}
        </h3>
        <p className="mt-2 font-sans text-sm text-dp-ink-muted">
          {[item.cuisine, item.location].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-5 font-display text-xl text-dp-ink">
          {formatDate(item.plan.plannedDate)}
          {formatTime(item.plan.plannedTime) ? (
            <span className="font-sans text-sm text-dp-ink-secondary">
              {" "}
              · {formatTime(item.plan.plannedTime)}
            </span>
          ) : null}
        </p>
        {item.plan.reservationProvider ? (
          <p className="mt-2 font-sans text-sm text-dp-ink-secondary">
            Reservation via {item.plan.reservationProvider}
            {item.plan.confirmationReference ? " · Reference saved privately" : ""}
          </p>
        ) : null}
        {needsUpdate ? (
          <p className="mt-4 font-sans text-sm leading-relaxed text-dp-ink-secondary">
            The planned date has passed. Record the visit, choose a new date, or
            remove this plan. Orellin will not mark it visited for you.
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-x-4 pt-5">
          <button
            type="button"
            className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
            onClick={onRecord}
          >
            Record visit
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
            onClick={onEdit}
          >
            {needsUpdate ? "Reschedule" : "Edit plan"}
          </button>
          {needsUpdate ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-error hover:underline"
              onClick={onRemove}
            >
              Remove plan
            </button>
          ) : null}
          <Link
            href={`/restaurants/${item.slug}`}
            className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
          >
            Open restaurant
          </Link>
        </div>
      </div>
    </article>
  );
}

function VisitedGroup({
  group,
  expanded,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: {
  group: VisitedPersonalListGroup;
  expanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (visit: RestaurantVisit) => void;
  onDelete: (visit: RestaurantVisit) => void;
}) {
  return (
    <article
      className="min-w-0 overflow-hidden rounded-[var(--dp-radius-xl)] border border-dp-outline-variant bg-dp-surface"
      data-personal-card="visited"
    >
      <div className="grid min-w-0 sm:grid-cols-[11rem_minmax(0,1fr)]">
        <Link
          href={`/restaurants/${group.slug}`}
          aria-label={`Open ${group.name}`}
          className="block min-w-0"
        >
          <RestaurantMedia
            name={group.name}
            seed={group.slug}
            city={group.location}
            stars={group.distinction}
            imageUrl={group.imageUrl}
            placeId={group.placeId}
            ratioClass="aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[13rem]"
            className="h-full rounded-none"
            sizes="(max-width: 640px) 100vw, 176px"
          />
        </Link>
        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <MichelinDistinction stars={group.distinction} variant="compact" />
          <h2 className="mt-3 font-display text-3xl leading-tight text-dp-primary-deep">
            {group.name}
          </h2>
          <p className="mt-2 font-sans text-sm text-dp-ink-muted">
            {group.location} · {visitLabel(group.visitCount)}
          </p>
          <p className="mt-4 font-sans text-sm text-dp-ink-secondary">
            Last visited · {formatDate(group.latestVisit?.visitDate ?? null)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.personalFavorite ? (
              <span className="rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_14%,white)] px-2.5 py-1 font-sans text-xs font-semibold text-dp-secondary">
                Personal favorite
              </span>
            ) : null}
            {group.wouldReturn !== null ? (
              <span className="rounded-[var(--dp-radius-md)] bg-dp-soft px-2.5 py-1 font-sans text-xs font-medium text-dp-ink-secondary">
                {group.wouldReturn ? "Would return" : "Would not return"}
              </span>
            ) : null}
          </div>
          <div className="mt-auto flex flex-wrap gap-x-4 pt-5">
            <button
              type="button"
              className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
              aria-expanded={expanded}
              aria-controls={`visit-history-${group.slug}`}
              onClick={onToggle}
            >
              {expanded ? "Hide visit history" : "Expand visit history"}
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
              onClick={onAdd}
            >
              Add another visit
            </button>
            <Link
              href={`/restaurants/${group.slug}`}
              className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
            >
              Open restaurant
            </Link>
          </div>
        </div>
      </div>

      {expanded ? (
        <ol
          id={`visit-history-${group.slug}`}
          className="divide-y divide-dp-border border-t border-dp-border"
        >
          {group.visits.map((visit, index) => (
            <li
              key={visit.id}
              className="grid min-w-0 gap-4 px-5 py-5 sm:grid-cols-[minmax(9rem,0.35fr)_minmax(0,1fr)_auto] sm:px-6"
            >
              <div>
                <p className="font-sans text-sm font-semibold text-dp-ink">
                  {visit.visitDate
                    ? formatDate(visit.visitDate)
                    : "Visited · Date not recorded"}
                </p>
                <p className="mt-1 font-sans text-xs text-dp-ink-muted">
                  Visit {group.visitCount - index}
                </p>
              </div>
              <div className="min-w-0">
                {visit.favoriteDishes ? (
                  <p className="font-sans text-sm text-dp-ink-secondary">
                    <span className="font-semibold text-dp-ink">
                      Favorite dishes:
                    </span>{" "}
                    {visit.favoriteDishes}
                  </p>
                ) : null}
                {visit.privateNotes ? (
                  <p className="mt-2 line-clamp-2 font-sans text-sm text-dp-ink-muted">
                    <span className="font-semibold">Private note preview:</span>{" "}
                    {visit.privateNotes}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {visit.personalFavorite ? (
                    <span className="font-sans text-xs font-semibold text-dp-secondary">
                      Personal favorite
                    </span>
                  ) : null}
                  {visit.wouldReturn !== null ? (
                    <span className="font-sans text-xs text-dp-ink-muted">
                      {visit.wouldReturn ? "Would return" : "Would not return"}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap items-start gap-x-3 sm:justify-end">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
                  onClick={() => onEdit(visit)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-error hover:underline"
                  onClick={() => onDelete(visit)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

export function PassportPersonalListPage({
  mode,
  proof,
}: PassportPersonalListPageProps) {
  const searchParams = useSearchParams();
  const {
    ready,
    restaurants,
    store,
    mode: syncMode,
    migrationMessage,
    migrationStatus,
    storageError,
    syncStatus,
    syncMessage,
    updateRestaurant,
    removeRestaurant,
    savePlan,
    removePlan,
    addVisit,
    editVisit,
    deleteVisit,
  } = usePassport();
  const [planEditor, setPlanEditor] = useState<PlanEditor | null>(null);
  const [visitEditor, setVisitEditor] = useState<VisitEditor | null>(null);
  const [removeItem, setRemoveItem] = useState<SavedPersonalListItem | null>(
    null,
  );
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const savedItems = useMemo(
    () => buildSavedPersonalList(store, restaurants, today()),
    [restaurants, store],
  );
  const planned = useMemo(
    () => buildPlannedPersonalList(store, restaurants, today()),
    [restaurants, store],
  );
  const visitedGroups = useMemo(
    () => buildVisitedPersonalList(store, restaurants),
    [restaurants, store],
  );
  const query = searchParams.get("q") ?? "";
  const visibleSaved = useMemo(() => {
    const stars = searchParams.get("stars");
    const state = searchParams.get("state");
    const cuisine = searchParams.get("cuisine");
    const hasPlan = searchParams.get("plan") === "1";
    const visited = searchParams.get("visited") === "1";
    const sort = searchParams.get("sort") ?? "recent";
    const items = savedItems.filter(
      (item) =>
        matchesSearch(item, query) &&
        (!stars || String(item.distinction) === stars) &&
        (!state || item.stateCode === state) &&
        (!cuisine || item.cuisine === cuisine) &&
        (!hasPlan || item.planStatus === "upcoming") &&
        (!visited || item.visitCount > 0),
    );
    return [...items].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "stars") {
        return b.distinction - a.distinction || a.name.localeCompare(b.name);
      }
      if (sort === "city") {
        return a.city.localeCompare(b.city) || a.name.localeCompare(b.name);
      }
      return (
        b.bookmark.createdAt.localeCompare(a.bookmark.createdAt) ||
        a.name.localeCompare(b.name)
      );
    });
  }, [query, savedItems, searchParams]);
  const visibleUpcoming = useMemo(
    () => planned.upcoming.filter((item) => matchesSearch(item, query)),
    [planned.upcoming, query],
  );
  const visibleNeedsUpdate = useMemo(
    () => planned.needsUpdate.filter((item) => matchesSearch(item, query)),
    [planned.needsUpdate, query],
  );
  const visibleVisited = useMemo(
    () => visitedGroups.filter((item) => matchesSearch(item, query)),
    [query, visitedGroups],
  );

  const sourceCount =
    mode === "saved"
      ? savedItems.length
      : mode === "planned"
        ? planned.upcoming.length + planned.needsUpdate.length
        : visitedGroups.length;
  const visibleCount =
    mode === "saved"
      ? visibleSaved.length
      : mode === "planned"
        ? visibleUpcoming.length + visibleNeedsUpdate.length
        : visibleVisited.length;
  const pageModel = toListPageModel(mode);
  const sync = toSyncState({
    mode: syncMode,
    migrationMessage,
    migrationCompleted: migrationStatus.completed,
    status:
      proof === "sync-pending"
        ? "pending"
        : proof === "sync-failed"
          ? "failed"
          : syncStatus,
    message:
      proof === "sync-failed"
        ? "Your local copy is still available."
        : syncMessage,
    storageError,
  });

  if (!ready || proof === "loading") {
    return (
      <PassportLoadingState variant={mode === "planned" ? "planned" : "list"} />
    );
  }

  const manageSaved = (item: SavedPersonalListItem) => {
    const hasDependencies =
      Boolean(item.plan) || item.visitCount > 0 || item.collectionCount > 0;
    if (hasDependencies) {
      setRemoveItem(item);
      return;
    }
    updateRestaurant(item.slug, { saved: false });
  };

  const openVisit = (
    item: PlannedPersonalListItem | VisitedPersonalListGroup,
    visit: RestaurantVisit | null,
    intent: VisitEditor["intent"],
  ) => {
    const visits = Object.values(store.visits)
      .filter((entry) => entry.restaurantSlug === item.slug)
      .sort((a, b) =>
        (b.visitDate ?? b.createdAt).localeCompare(a.visitDate ?? a.createdAt),
      );
    setVisitEditor({
      slug: item.slug,
      name: item.name,
      plan: item.plan,
      visits,
      visit,
      intent,
    });
  };

  const savePlanDraft = (draft: PlanFormDraft) => {
    if (!planEditor) return;
    savePlan({
      restaurantSlug: planEditor.item.slug,
      plannedDate: draft.plannedDate,
      plannedTime: draft.plannedTime || null,
      reservationProvider: draft.reservationProvider.trim() || null,
      confirmationReference: draft.confirmationReference.trim() || null,
      privateNotes: draft.privateNotes,
    });
  };

  const saveVisitDraft = (
    draft: VisitFormDraft,
    completePlan: boolean,
  ) => {
    if (!visitEditor) return;
    if (visitEditor.visit) {
      editVisit(visitEditor.visit.id, {
        visitDate: draft.visitDate,
        favoriteDishes: draft.favoriteDishes,
        privateNotes: draft.privateNotes,
        wouldReturn: draft.wouldReturn,
        personalFavorite: draft.personalFavorite,
      });
    } else {
      addVisit({
        id: visitId(),
        restaurantSlug: visitEditor.slug,
        visitDate: draft.visitDate,
        favoriteDishes: draft.favoriteDishes,
        privateNotes: draft.privateNotes,
        wouldReturn: draft.wouldReturn,
        personalFavorite: draft.personalFavorite,
      });
    }
    if (completePlan && visitEditor.plan) {
      removePlan(visitEditor.plan.id);
    }
  };

  const empty = proof === "empty" || sourceCount === 0;

  return (
    <div className="min-w-0 bg-dp-bg" data-passport-personal-list={mode}>
      <PageContainer className="min-w-0 pb-[var(--dp-section)] pt-[104px]">
        <PassportListHeader
          model={{ ...pageModel, resultCount: visibleCount }}
        />
        <div className="mb-6">
          <PassportSyncNotice sync={sync} compact />
        </div>

        {empty ? (
          <PassportListEmptyState model={pageModel} />
        ) : (
          <>
            <PersonalListControls
              key={`${mode}-${query}`}
              mode={mode}
              count={visibleCount}
              query={query}
              savedItems={savedItems}
            />

            {mode === "saved" ? (
              <ul className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleSaved.map((item) => (
                  <li key={item.slug} className="min-w-0">
                    <SavedCard item={item} onManage={manageSaved} />
                  </li>
                ))}
              </ul>
            ) : null}

            {mode === "planned" ? (
              <div className="space-y-12">
                {visibleUpcoming.length ? (
                  <section aria-labelledby="upcoming-plans-heading">
                    <h2
                      id="upcoming-plans-heading"
                      className="dp-headline-md mb-6 text-dp-primary-deep"
                    >
                      Upcoming
                    </h2>
                    <ul className="space-y-6">
                      {visibleUpcoming.map((item) => (
                        <li key={item.plan.id}>
                          <PlannedCard
                            item={item}
                            onEdit={() =>
                              setPlanEditor({ item, intent: "edit" })
                            }
                            onRemove={() =>
                              setPlanEditor({ item, intent: "remove" })
                            }
                            onRecord={() => openVisit(item, null, "add")}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                {visibleNeedsUpdate.length ? (
                  <section aria-labelledby="needs-update-heading">
                    <div className="mb-6 max-w-2xl">
                      <h2
                        id="needs-update-heading"
                        className="dp-headline-md text-dp-primary-deep"
                      >
                        Needs update
                      </h2>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-dp-ink-secondary">
                        These dates have passed, but they are preserved until you
                        record the meal, reschedule it, or remove the plan.
                      </p>
                    </div>
                    <ul className="space-y-6">
                      {visibleNeedsUpdate.map((item) => (
                        <li key={item.plan.id}>
                          <PlannedCard
                            item={item}
                            onEdit={() =>
                              setPlanEditor({ item, intent: "edit" })
                            }
                            onRemove={() =>
                              setPlanEditor({ item, intent: "remove" })
                            }
                            onRecord={() => openVisit(item, null, "add")}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            ) : null}

            {mode === "visited" ? (
              <ul className="space-y-6">
                {visibleVisited.map((group) => (
                  <li key={group.slug}>
                    <VisitedGroup
                      group={group}
                      expanded={expanded.has(group.slug)}
                      onToggle={() =>
                        setExpanded((current) => {
                          const next = new Set(current);
                          if (next.has(group.slug)) next.delete(group.slug);
                          else next.add(group.slug);
                          return next;
                        })
                      }
                      onAdd={() => openVisit(group, null, "add")}
                      onEdit={(visit) => openVisit(group, visit, "edit")}
                      onDelete={(visit) => openVisit(group, visit, "delete")}
                    />
                  </li>
                ))}
              </ul>
            ) : null}

            {visibleCount === 0 ? (
              <div className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-6 py-10 text-center">
                <h2 className="dp-headline-sm text-dp-primary-deep">
                  No restaurants match
                </h2>
                <p className="mx-auto mt-3 max-w-lg font-sans text-sm text-dp-ink-secondary">
                  Clear the current search or filters to see the rest of this
                  list.
                </p>
                <Link
                  href={`/${mode}`}
                  className="mt-5 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
                >
                  Clear all
                </Link>
              </div>
            ) : null}
          </>
        )}
      </PageContainer>

      {planEditor ? (
        <JourneyPlanDialog
          key={`${planEditor.item.plan.id}-${planEditor.item.plan.updatedAt}-${planEditor.intent}`}
          open
          restaurantName={planEditor.item.name}
          plan={store.plans[planEditor.item.plan.id] ?? planEditor.item.plan}
          startWithRemove={planEditor.intent === "remove"}
          onClose={() => setPlanEditor(null)}
          onSave={savePlanDraft}
          onRemove={() => removePlan(planEditor.item.plan.id)}
        />
      ) : null}

      {visitEditor ? (
        <JourneyVisitDialog
          key={`${visitEditor.intent}-${visitEditor.visit?.id ?? "new"}-${visitEditor.visit?.updatedAt ?? visitEditor.visits.length}`}
          open
          restaurantName={visitEditor.name}
          visit={
            visitEditor.visit
              ? store.visits[visitEditor.visit.id] ?? visitEditor.visit
              : null
          }
          plan={
            visitEditor.plan
              ? store.plans[visitEditor.plan.id] ?? visitEditor.plan
              : null
          }
          otherVisits={visitEditor.visits}
          startWithDelete={visitEditor.intent === "delete"}
          onClose={() => setVisitEditor(null)}
          onSave={saveVisitDraft}
          onDelete={
            visitEditor.visit
              ? () => deleteVisit(visitEditor.visit!.id)
              : undefined
          }
        />
      ) : null}

      {removeItem ? (
        <RemoveFromPassportDialog
          open
          restaurantName={removeItem.name}
          consequences={
            {
              planCount: Object.values(store.plans).filter(
                (plan) => plan.restaurantSlug === removeItem.slug,
              ).length,
              visitCount: Object.values(store.visits).filter(
                (visit) => visit.restaurantSlug === removeItem.slug,
              ).length,
              collectionCount: Object.values(store.collections).filter(
                (collection) =>
                  collection.restaurantSlugs.includes(removeItem.slug),
              ).length,
              hasPrivateDetails:
                Object.values(store.plans).some(
                  (plan) =>
                    plan.restaurantSlug === removeItem.slug &&
                    Boolean(plan.privateNotes || plan.confirmationReference),
                ) ||
                Object.values(store.visits).some(
                  (visit) =>
                    visit.restaurantSlug === removeItem.slug &&
                    Boolean(visit.privateNotes || visit.favoriteDishes),
                ),
            } satisfies RemoveFromPassportConsequences
          }
          onClose={() => setRemoveItem(null)}
          onConfirm={() => {
            removeRestaurant(removeItem.slug);
            setRemoveItem(null);
          }}
        />
      ) : null}
    </div>
  );
}
