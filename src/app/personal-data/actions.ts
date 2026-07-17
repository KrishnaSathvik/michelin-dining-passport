"use server";

import { getVerifiedUser } from "@/lib/auth/session";
import {
  mergeCollections,
  mergeUserRestaurantRecords,
  type MergeConflict,
} from "@/lib/personal-data/merge";
import { restaurantIdFromSlug } from "@/lib/personal-data/ids";
import type {
  LocalCollection,
  PassportStore,
  UserRestaurantRecord,
} from "@/lib/passport/types";
import { migratePassportStore } from "@/lib/passport/store";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

type UserRestaurantRow = Tables<"user_restaurants">;

function rowToRecord(
  row: UserRestaurantRow,
  slug: string,
): UserRestaurantRecord {
  return {
    restaurantSlug: slug,
    saved: row.is_saved,
    wantToVisit: row.wants_to_visit,
    planned: row.is_planned,
    visited: row.is_visited,
    favorite: row.is_favorite,
    visitDate: row.visited_on,
    personalRating: row.personal_rating,
    notes: row.private_notes ?? "",
    favoriteDishes: row.favorite_dishes ?? [],
    reservationPlannedFor: row.planned_for,
    reservationProvider: row.reservation_provider,
    reservationConfirmationNote: row.reservation_confirmation_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function recordToRow(
  userId: string,
  restaurantId: string,
  record: UserRestaurantRecord,
) {
  return {
    user_id: userId,
    restaurant_id: restaurantId,
    is_saved: record.saved,
    wants_to_visit: record.wantToVisit,
    is_planned: record.planned,
    planned_for: record.reservationPlannedFor,
    reservation_provider: record.reservationProvider,
    reservation_confirmation_note: record.reservationConfirmationNote,
    is_visited: record.visited,
    visited_on: record.visitDate,
    is_favorite: record.favorite,
    personal_rating: record.personalRating,
    private_notes: record.notes || null,
    favorite_dishes: record.favoriteDishes,
  };
}

async function slugMap(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, slug")
    .eq("is_published", true);
  if (error) throw error;
  const byId = new Map<string, string>();
  const bySlug = new Map<string, string>();
  for (const row of data ?? []) {
    byId.set(row.id, row.slug);
    bySlug.set(row.slug, row.id);
  }
  return { byId, bySlug };
}

export async function loadCloudPassportStore(): Promise<PassportStore | null> {
  const user = await getVerifiedUser();
  if (!user) return null;
  const supabase = await createClient();
  const { byId } = await slugMap(supabase);

  const [{ data: rows, error }, { data: collections, error: colError }] =
    await Promise.all([
      supabase.from("user_restaurants").select("*").eq("user_id", user.id),
      supabase.from("collections").select("*").eq("user_id", user.id),
    ]);
  if (error || colError) return null;

  const userRestaurants: Record<string, UserRestaurantRecord> = {};
  for (const row of rows ?? []) {
    const slug = byId.get(row.restaurant_id);
    if (!slug) continue;
    userRestaurants[slug] = rowToRecord(row, slug);
  }

  const collectionIds = (collections ?? []).map((item) => item.id);
  let items: Tables<"collection_items">[] = [];
  if (collectionIds.length > 0) {
    const { data: itemRows, error: itemError } = await supabase
      .from("collection_items")
      .select("*")
      .in("collection_id", collectionIds);
    if (itemError) return null;
    items = itemRows ?? [];
  }

  const itemsByCollection = new Map<string, string[]>();
  for (const item of items) {
    const slug = byId.get(item.restaurant_id);
    if (!slug) continue;
    const list = itemsByCollection.get(item.collection_id) ?? [];
    list.push(slug);
    itemsByCollection.set(item.collection_id, list);
  }

  const localCollections: Record<string, LocalCollection> = {};
  for (const collection of collections ?? []) {
    localCollections[collection.id] = {
      id: collection.id,
      slug: collection.slug,
      name: collection.name,
      description: collection.description ?? "",
      private: !collection.is_public,
      coverRestaurantSlug: collection.cover_restaurant_id
        ? (byId.get(collection.cover_restaurant_id) ?? null)
        : null,
      restaurantSlugs: itemsByCollection.get(collection.id) ?? [],
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
    };
  }

  return {
    version: 2,
    userRestaurants,
    collections: localCollections,
  };
}

export async function upsertCloudRestaurant(
  slug: string,
  patch: Partial<Omit<UserRestaurantRecord, "restaurantSlug" | "createdAt">>,
): Promise<{ ok: boolean; message?: string }> {
  const user = await getVerifiedUser();
  if (!user) return { ok: false, message: "Sign in required." };
  const supabase = await createClient();
  const restaurantId = restaurantIdFromSlug(slug);

  const { data: existing } = await supabase
    .from("user_restaurants")
    .select("*")
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  const base = existing
    ? rowToRecord(existing, slug)
    : ({
        restaurantSlug: slug,
        saved: false,
        wantToVisit: false,
        planned: false,
        visited: false,
        favorite: false,
        visitDate: null,
        personalRating: null,
        notes: "",
        favoriteDishes: [],
        reservationPlannedFor: null,
        reservationProvider: null,
        reservationConfirmationNote: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies UserRestaurantRecord);

  const next: UserRestaurantRecord = {
    ...base,
    ...patch,
    restaurantSlug: slug,
    createdAt: base.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_restaurants")
    .upsert(recordToRow(user.id, restaurantId, next));
  if (error) return { ok: false, message: "Unable to save personal data." };
  return { ok: true };
}

export async function migrateLocalPassportToCloud(
  localRaw: unknown,
): Promise<{
  ok: boolean;
  conflictCount: number;
  conflicts: MergeConflict[];
  unknownSlugs: string[];
  message?: string;
  store: PassportStore | null;
}> {
  const user = await getVerifiedUser();
  if (!user) {
    return {
      ok: false,
      conflictCount: 0,
      conflicts: [],
      unknownSlugs: [],
      message: "Sign in required.",
      store: null,
    };
  }

  const local = migratePassportStore(localRaw);
  const cloud = (await loadCloudPassportStore()) ?? {
    version: 2 as const,
    userRestaurants: {},
    collections: {},
  };

  const conflicts: MergeConflict[] = [];
  const unknownSlugs: string[] = [];
  const mergedRestaurants: Record<string, UserRestaurantRecord> = {
    ...cloud.userRestaurants,
  };

  const supabase = await createClient();
  const { bySlug } = await slugMap(supabase);

  for (const [slug, localRecord] of Object.entries(local.userRestaurants)) {
    if (!bySlug.has(slug)) {
      unknownSlugs.push(slug);
      continue;
    }
    const { record, conflicts: recordConflicts } = mergeUserRestaurantRecords(
      localRecord,
      cloud.userRestaurants[slug],
    );
    conflicts.push(...recordConflicts);
    if (record) mergedRestaurants[slug] = record;
  }

  const mergedCollections = mergeCollections(
    Object.values(local.collections),
    Object.values(cloud.collections),
  );

  for (const record of Object.values(mergedRestaurants)) {
    const restaurantId = bySlug.get(record.restaurantSlug);
    if (!restaurantId) continue;
    const { error } = await supabase
      .from("user_restaurants")
      .upsert(recordToRow(user.id, restaurantId, record));
    if (error) {
      return {
        ok: false,
        conflictCount: conflicts.length,
        conflicts,
        unknownSlugs,
        message: "Migration partially failed while saving restaurant records.",
        store: null,
      };
    }
  }

  for (const collection of mergedCollections) {
    const coverId = collection.coverRestaurantSlug
      ? bySlug.get(collection.coverRestaurantSlug) ?? null
      : null;
    const payload = {
      id: collection.id,
      user_id: user.id,
      slug: collection.slug,
      name: collection.name,
      description: collection.description || null,
      cover_restaurant_id: coverId,
      is_public: !collection.private,
    };
    const { error } = await supabase.from("collections").upsert(payload);
    if (error) {
      return {
        ok: false,
        conflictCount: conflicts.length,
        conflicts,
        unknownSlugs,
        message: "Migration partially failed while saving collections.",
        store: null,
      };
    }

    await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collection.id);

    const itemRows = collection.restaurantSlugs
      .map((slug, index) => {
        const restaurantId = bySlug.get(slug);
        if (!restaurantId) return null;
        return {
          collection_id: collection.id,
          restaurant_id: restaurantId,
          position: index,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (itemRows.length > 0) {
      const { error: itemError } = await supabase
        .from("collection_items")
        .upsert(itemRows);
      if (itemError) {
        return {
          ok: false,
          conflictCount: conflicts.length,
          conflicts,
          unknownSlugs,
          message: "Migration partially failed while saving collection items.",
          store: null,
        };
      }
    }
  }

  const store = await loadCloudPassportStore();
  return {
    ok: true,
    conflictCount: conflicts.length,
    conflicts,
    unknownSlugs,
    store,
  };
}

export async function upsertCloudCollection(
  collection: LocalCollection,
): Promise<{ ok: boolean; message?: string }> {
  const user = await getVerifiedUser();
  if (!user) return { ok: false, message: "Sign in required." };
  const supabase = await createClient();
  const { bySlug } = await slugMap(supabase);
  const coverId = collection.coverRestaurantSlug
    ? bySlug.get(collection.coverRestaurantSlug) ?? null
    : null;

  const { error } = await supabase.from("collections").upsert({
    id: collection.id,
    user_id: user.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description || null,
    cover_restaurant_id: coverId,
    is_public: !collection.private,
  });
  if (error) return { ok: false, message: "Unable to save collection." };

  await supabase
    .from("collection_items")
    .delete()
    .eq("collection_id", collection.id);

  const itemRows = collection.restaurantSlugs
    .map((slug, index) => {
      const restaurantId = bySlug.get(slug);
      if (!restaurantId) return null;
      return {
        collection_id: collection.id,
        restaurant_id: restaurantId,
        position: index,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (itemRows.length > 0) {
    const { error: itemError } = await supabase
      .from("collection_items")
      .upsert(itemRows);
    if (itemError) return { ok: false, message: "Unable to save collection items." };
  }
  return { ok: true };
}

export async function deleteCloudCollection(
  collectionId: string,
): Promise<{ ok: boolean; message?: string }> {
  const user = await getVerifiedUser();
  if (!user) return { ok: false, message: "Sign in required." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);
  if (error) return { ok: false, message: "Unable to delete collection." };
  return { ok: true };
}

export async function exportCloudAccountData(): Promise<{
  ok: boolean;
  payload?: unknown;
  message?: string;
}> {
  const user = await getVerifiedUser();
  if (!user) return { ok: false, message: "Sign in required." };
  const supabase = await createClient();
  const [{ data: profile }, store] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    loadCloudPassportStore(),
  ]);
  return {
    ok: true,
    payload: {
      exportedAt: new Date().toISOString(),
      profile,
      passport: store,
    },
  };
}

export async function updateProfileAction(input: {
  displayName: string;
  homeCity: string;
}): Promise<{ ok: boolean; message?: string }> {
  const user = await getVerifiedUser();
  if (!user) return { ok: false, message: "Sign in required." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: input.displayName.trim() || null,
      home_city: input.homeCity.trim() || null,
    });
  if (error) return { ok: false, message: "Unable to update profile." };
  return { ok: true };
}

export async function requestAccountDeletionAction(
  confirmation: string,
): Promise<{ ok: boolean; message?: string }> {
  if (confirmation.trim().toUpperCase() !== "DELETE") {
    return {
      ok: false,
      message: 'Type DELETE to confirm account deletion.',
    };
  }
  const user = await getVerifiedUser();
  if (!user) return { ok: false, message: "Sign in required." };

  try {
    const admin = createAdminClient();
    const { data: requestRow, error: requestError } = await admin
      .from("account_deletion_requests")
      .insert({
        user_id: user.id,
        status: "processing",
      })
      .select("id")
      .single();
    if (requestError || !requestRow) {
      return { ok: false, message: "Unable to delete account right now." };
    }

    // Remove personal dining notes before auth user deletion.
    await admin.from("user_restaurants").delete().eq("user_id", user.id);
    await admin.from("collections").delete().eq("user_id", user.id);

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      await admin
        .from("account_deletion_requests")
        .update({ status: "failed" })
        .eq("id", requestRow.id);
      return { ok: false, message: "Unable to delete account right now." };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: "Unable to delete account right now." };
  }
}
