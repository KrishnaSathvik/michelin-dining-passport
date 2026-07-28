export type PassportBookmark = {
  restaurantSlug: string;
  createdAt: string;
  updatedAt: string;
  migrationSource?: "legacy-v1" | "legacy-v2";
};

export type RestaurantPlan = {
  id: string;
  restaurantSlug: string;
  /** Calendar date, stored without a timezone. Null is allowed only for migration. */
  plannedDate: string | null;
  /** Restaurant-local wall time in `HH:mm`, stored separately from the date. */
  plannedTime: string | null;
  reservationProvider: string | null;
  confirmationReference: string | null;
  privateNotes: string;
  createdAt: string;
  updatedAt: string;
  migrationSource?: "legacy-v1" | "legacy-v2";
};

export type RestaurantVisit = {
  id: string;
  restaurantSlug: string;
  /** Calendar date, stored without a timezone. */
  visitDate: string | null;
  datePrecision: "day" | "unknown";
  favoriteDishes: string;
  privateNotes: string;
  wouldReturn: boolean | null;
  personalFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  migrationSource?: "legacy-v1" | "legacy-v2";
};

export type LegacyJourneyRecord = {
  restaurantSlug: string;
  saved?: boolean;
  wantToVisit?: boolean;
  planned?: boolean;
  visited?: boolean;
  favorite?: boolean;
  visitDate?: string | null;
  notes?: string;
  favoriteDishes?: string[];
  reservationPlannedFor?: string | null;
  reservationProvider?: string | null;
  reservationConfirmationNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type RestaurantJourneyState = {
  isUnsaved: boolean;
  isSaved: boolean;
  isPlanned: boolean;
  isVisited: boolean;
  isSavedOnly: boolean;
  isPlannedAndPreviouslyVisited: boolean;
  isPersonalFavorite: boolean;
  visitCount: number;
  plan: RestaurantPlan | null;
  visits: RestaurantVisit[];
};

export type PlanStatus = "upcoming" | "needs-update" | "past" | "undated";

function nonEmpty(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asIso(value: unknown, fallback: string): string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
    ? value
    : fallback;
}

function asDateOnly(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function asLocalTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;
}

function recordId(prefix: string, restaurantSlug: string): string {
  return `${prefix}:${restaurantSlug}`;
}

function currentStamp(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}:${crypto.randomUUID()}`;
  }
  return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

export function migrateLegacyJourneyRecords(
  records: Record<string, LegacyJourneyRecord>,
): {
  bookmarks: Record<string, PassportBookmark>;
  plans: Record<string, RestaurantPlan>;
  visits: Record<string, RestaurantVisit>;
} {
  const bookmarks: Record<string, PassportBookmark> = {};
  const plans: Record<string, RestaurantPlan> = {};
  const visits: Record<string, RestaurantVisit> = {};
  const fallback = currentStamp();

  for (const [slug, record] of Object.entries(records)) {
    const createdAt = asIso(record.createdAt, fallback);
    const updatedAt = asIso(record.updatedAt, createdAt);
    const hasAnyJourneyEvidence =
      Boolean(record.saved) ||
      Boolean(record.wantToVisit) ||
      Boolean(record.planned) ||
      Boolean(record.visited) ||
      Boolean(record.favorite) ||
      Boolean(record.visitDate) ||
      Boolean(nonEmpty(record.notes)) ||
      Boolean(record.favoriteDishes?.some((dish) => Boolean(dish.trim()))) ||
      Boolean(record.reservationPlannedFor) ||
      Boolean(nonEmpty(record.reservationProvider)) ||
      Boolean(nonEmpty(record.reservationConfirmationNote));

    if (!hasAnyJourneyEvidence) continue;

    bookmarks[slug] = {
      restaurantSlug: slug,
      createdAt,
      updatedAt,
      migrationSource: "legacy-v2",
    };

    if (record.planned || record.reservationPlannedFor) {
      const id = recordId("legacy-plan", slug);
      plans[id] = {
        id,
        restaurantSlug: slug,
        plannedDate: asDateOnly(record.reservationPlannedFor),
        plannedTime: null,
        reservationProvider: nonEmpty(record.reservationProvider),
        confirmationReference: nonEmpty(record.reservationConfirmationNote),
        privateNotes: "",
        createdAt,
        updatedAt,
        migrationSource: "legacy-v2",
      };
    }

    // Favorite-only legacy rows remain bookmarks. Visit records require
    // explicit visit evidence; this avoids inventing a meal from a preference.
    if (record.visited || record.visitDate) {
      const id = recordId("legacy-visit", slug);
      const dishes = (record.favoriteDishes ?? [])
        .map((dish) => dish.trim())
        .filter(Boolean)
        .join(", ");
      const visitDate = asDateOnly(record.visitDate);
      visits[id] = {
        id,
        restaurantSlug: slug,
        visitDate,
        datePrecision: visitDate ? "day" : "unknown",
        favoriteDishes: dishes,
        privateNotes: nonEmpty(record.notes) ?? "",
        wouldReturn: null,
        personalFavorite: Boolean(record.favorite),
        createdAt,
        updatedAt,
        migrationSource: "legacy-v2",
      };
    }
  }

  return { bookmarks, plans, visits };
}

export function sanitizeJourneyRecords(raw: {
  bookmarks?: unknown;
  plans?: unknown;
  visits?: unknown;
}): {
  bookmarks: Record<string, PassportBookmark>;
  plans: Record<string, RestaurantPlan>;
  visits: Record<string, RestaurantVisit>;
} {
  const bookmarks: Record<string, PassportBookmark> = {};
  const plans: Record<string, RestaurantPlan> = {};
  const visits: Record<string, RestaurantVisit> = {};
  const fallback = currentStamp();

  if (raw.bookmarks && typeof raw.bookmarks === "object") {
    for (const [key, value] of Object.entries(raw.bookmarks)) {
      if (!value || typeof value !== "object") continue;
      const candidate = value as Partial<PassportBookmark>;
      const slug = nonEmpty(candidate.restaurantSlug) ?? key;
      bookmarks[slug] = {
        restaurantSlug: slug,
        createdAt: asIso(candidate.createdAt, fallback),
        updatedAt: asIso(candidate.updatedAt, fallback),
        migrationSource: candidate.migrationSource,
      };
    }
  }

  if (raw.plans && typeof raw.plans === "object") {
    for (const [key, value] of Object.entries(raw.plans)) {
      if (!value || typeof value !== "object") continue;
      const candidate = value as Partial<RestaurantPlan>;
      const slug = nonEmpty(candidate.restaurantSlug);
      if (!slug) continue;
      const id = nonEmpty(candidate.id) ?? key;
      plans[id] = {
        id,
        restaurantSlug: slug,
        plannedDate: asDateOnly(candidate.plannedDate),
        plannedTime: asLocalTime(candidate.plannedTime),
        reservationProvider: nonEmpty(candidate.reservationProvider)?.slice(
          0,
          120,
        ) ?? null,
        confirmationReference: nonEmpty(candidate.confirmationReference)?.slice(
          0,
          255,
        ) ?? null,
        privateNotes: (candidate.privateNotes ?? "").slice(0, 4000),
        createdAt: asIso(candidate.createdAt, fallback),
        updatedAt: asIso(candidate.updatedAt, fallback),
        migrationSource: candidate.migrationSource,
      };
    }
  }

  if (raw.visits && typeof raw.visits === "object") {
    for (const [key, value] of Object.entries(raw.visits)) {
      if (!value || typeof value !== "object") continue;
      const candidate = value as Partial<RestaurantVisit>;
      const slug = nonEmpty(candidate.restaurantSlug);
      if (!slug) continue;
      const id = nonEmpty(candidate.id) ?? key;
      const visitDate = asDateOnly(candidate.visitDate);
      visits[id] = {
        id,
        restaurantSlug: slug,
        visitDate,
        datePrecision:
          candidate.datePrecision === "unknown" || !visitDate
            ? "unknown"
            : "day",
        favoriteDishes: (candidate.favoriteDishes ?? "").slice(0, 1000),
        privateNotes: (candidate.privateNotes ?? "").slice(0, 8000),
        wouldReturn:
          typeof candidate.wouldReturn === "boolean"
            ? candidate.wouldReturn
            : null,
        personalFavorite: Boolean(candidate.personalFavorite),
        createdAt: asIso(candidate.createdAt, fallback),
        updatedAt: asIso(candidate.updatedAt, fallback),
        migrationSource: candidate.migrationSource,
      };
    }
  }

  return { bookmarks, plans, visits };
}

export function deriveRestaurantJourney(
  restaurantSlug: string,
  bookmarks: Record<string, PassportBookmark>,
  plans: Record<string, RestaurantPlan>,
  visits: Record<string, RestaurantVisit>,
): RestaurantJourneyState {
  const plan =
    Object.values(plans)
      .filter((item) => item.restaurantSlug === restaurantSlug)
      .sort((a, b) =>
        (a.plannedDate ?? "9999-12-31").localeCompare(
          b.plannedDate ?? "9999-12-31",
        ),
      )[0] ?? null;
  const restaurantVisits = Object.values(visits)
    .filter((item) => item.restaurantSlug === restaurantSlug)
    .sort((a, b) => {
      const dateOrder = (b.visitDate ?? "").localeCompare(a.visitDate ?? "");
      if (dateOrder !== 0) return dateOrder;
      return b.createdAt.localeCompare(a.createdAt);
    });
  const isSaved = Boolean(bookmarks[restaurantSlug]);
  const isPlanned = Boolean(plan);
  const isVisited = restaurantVisits.length > 0;

  return {
    isUnsaved: !isSaved && !isPlanned && !isVisited,
    isSaved,
    isPlanned,
    isVisited,
    isSavedOnly: isSaved && !isPlanned && !isVisited,
    isPlannedAndPreviouslyVisited: isSaved && isPlanned && isVisited,
    isPersonalFavorite: restaurantVisits.some(
      (visit) => visit.personalFavorite,
    ),
    visitCount: restaurantVisits.length,
    plan,
    visits: restaurantVisits,
  };
}

export function classifyPlan(
  plannedDate: string | null,
  today: string,
): PlanStatus {
  if (!plannedDate) return "undated";
  if (plannedDate >= today) return "upcoming";
  const planned = Date.parse(`${plannedDate}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(planned) || Number.isNaN(current)) return "undated";
  const daysOverdue = Math.floor((current - planned) / 86_400_000);
  return daysOverdue <= 30 ? "needs-update" : "past";
}

export function ensureJourneyBookmark(
  bookmarks: Record<string, PassportBookmark>,
  restaurantSlug: string,
  stamp = currentStamp(),
): Record<string, PassportBookmark> {
  const existing = bookmarks[restaurantSlug];
  return {
    ...bookmarks,
    [restaurantSlug]: existing
      ? { ...existing, updatedAt: stamp }
      : { restaurantSlug, createdAt: stamp, updatedAt: stamp },
  };
}

export function saveJourneyPlan(
  plans: Record<string, RestaurantPlan>,
  input: Omit<RestaurantPlan, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  },
  stamp = currentStamp(),
): { plans: Record<string, RestaurantPlan>; plan: RestaurantPlan } {
  const existing = Object.values(plans).find(
    (plan) => plan.restaurantSlug === input.restaurantSlug,
  );
  const id = input.id ?? existing?.id ?? newId("plan");
  const plan: RestaurantPlan = {
    ...input,
    id,
    createdAt: existing?.createdAt ?? stamp,
    updatedAt: stamp,
  };
  const next = { ...plans };
  if (existing && existing.id !== id) delete next[existing.id];
  next[id] = plan;
  return { plans: next, plan };
}

export function removeJourneyPlan(
  plans: Record<string, RestaurantPlan>,
  planId: string,
): Record<string, RestaurantPlan> {
  if (!(planId in plans)) return plans;
  const next = { ...plans };
  delete next[planId];
  return next;
}

export function createJourneyVisit(
  visits: Record<string, RestaurantVisit>,
  input: Omit<RestaurantVisit, "createdAt" | "updatedAt" | "datePrecision"> & {
    datePrecision?: RestaurantVisit["datePrecision"];
  },
  stamp = currentStamp(),
): Record<string, RestaurantVisit> {
  const id = input.id || newId("visit");
  return {
    ...visits,
    [id]: {
      ...input,
      id,
      datePrecision: input.datePrecision ?? (input.visitDate ? "day" : "unknown"),
      createdAt: stamp,
      updatedAt: stamp,
    },
  };
}

export function updateJourneyVisit(
  visits: Record<string, RestaurantVisit>,
  visitId: string,
  patch: Partial<
    Pick<
      RestaurantVisit,
      | "visitDate"
      | "favoriteDishes"
      | "privateNotes"
      | "wouldReturn"
      | "personalFavorite"
    >
  >,
  stamp = currentStamp(),
): Record<string, RestaurantVisit> {
  const existing = visits[visitId];
  if (!existing) return visits;
  const visitDate =
    patch.visitDate !== undefined ? patch.visitDate : existing.visitDate;
  return {
    ...visits,
    [visitId]: {
      ...existing,
      ...patch,
      visitDate,
      datePrecision: visitDate ? "day" : "unknown",
      updatedAt: stamp,
    },
  };
}

export function deleteJourneyVisit(
  visits: Record<string, RestaurantVisit>,
  visitId: string,
): Record<string, RestaurantVisit> {
  if (!(visitId in visits)) return visits;
  const next = { ...visits };
  delete next[visitId];
  return next;
}
