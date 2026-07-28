"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  deleteCloudCollection,
  loadCloudPassportStore,
  migrateLocalPassportToCloud,
  upsertCloudCollection,
  upsertCloudRestaurant,
} from "@/app/personal-data/actions";
import {
  readMigrationState,
  writeMigrationBackup,
  writeMigrationState,
} from "@/lib/personal-data/migration-state";
import {
  calculatePassportMetrics,
  addRestaurantToCollection,
  addRestaurantVisit,
  clearPassportStore,
  createCollection,
  deleteCollection,
  deleteRestaurantPlan,
  editRestaurantVisit,
  exportPassportStore,
  getCollectionBySlug,
  importPassportStore,
  loadPassportStoreResult,
  removeRestaurantFromCollection,
  removeRestaurantVisit,
  removeUserRestaurant,
  saveRestaurantPlan,
  savePassportStore,
  updateCollection,
  upsertUserRestaurant,
  validateCollectionInput,
  type CollectionInputError,
} from "./store";
import type {
  LocalCollection,
  PassportMetrics,
  PassportStore,
  UserRestaurantRecord,
  RestaurantVisit,
} from "./types";
import type { Restaurant } from "@/lib/data/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

type PassportContextValue = {
  ready: boolean;
  /** Canonical catalog supplied once by the root shell. Personal routes derive only their own records from it. */
  restaurants: readonly Restaurant[];
  mode: "local" | "cloud";
  userId: string | null;
  migrationStatus: ReturnType<typeof readMigrationState>;
  migrationMessage: string | null;
  storageError: boolean;
  syncStatus: "idle" | "pending" | "failed";
  syncMessage: string | null;
  store: PassportStore;
  metrics: PassportMetrics;
  getRecord: (slug: string) => UserRestaurantRecord | undefined;
  updateRestaurant: (
    slug: string,
    patch: Partial<
      Omit<UserRestaurantRecord, "restaurantSlug" | "createdAt">
    >,
  ) => void;
  removeRestaurant: (slug: string) => void;
  savePlan: (input: {
    restaurantSlug: string;
    plannedDate: string;
    plannedTime: string | null;
    reservationProvider: string | null;
    confirmationReference: string | null;
    privateNotes: string;
  }) => void;
  removePlan: (planId: string) => void;
  addVisit: (
    input: Omit<
      RestaurantVisit,
      "createdAt" | "updatedAt" | "datePrecision"
    > & {
      datePrecision?: RestaurantVisit["datePrecision"];
    },
  ) => void;
  editVisit: (
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
  ) => void;
  deleteVisit: (visitId: string) => void;
  retrySync: () => void;
  /** Collection writes sync independently of per-restaurant journey writes. */
  collectionSyncStatus: "idle" | "pending" | "failed";
  collectionSyncMessage: string | null;
  retryCollectionSync: () => void;
  addCollection: (input: { name: string; description?: string }) => {
    collection: LocalCollection | null;
    error: CollectionInputError | null;
  };
  editCollection: (
    id: string,
    patch: Partial<Pick<LocalCollection, "name" | "description">>,
  ) => CollectionInputError | null;
  removeCollection: (id: string) => void;
  /** Membership add — always ensures the restaurant is Saved. */
  addToCollection: (collectionId: string, restaurantSlug: string) => void;
  /** Membership removal only — never unsaves the restaurant. */
  removeFromCollection: (collectionId: string, restaurantSlug: string) => void;
  findCollectionBySlug: (slug: string) => LocalCollection | undefined;
  exportJson: () => string;
  importJson: (json: string) => void;
  clearAll: () => void;
};

type CollectionMutation =
  | { kind: "upsert"; collection: LocalCollection }
  | { kind: "delete"; collectionId: string };

const PassportContext = createContext<PassportContextValue | null>(null);

type PassportProviderProps = {
  restaurants: Restaurant[];
  children: ReactNode;
};

const emptyStore: PassportStore = {
  version: 3,
  bookmarks: {},
  plans: {},
  visits: {},
  userRestaurants: {},
  collections: {},
};

export function PassportProvider({
  restaurants,
  children,
}: PassportProviderProps) {
  const [store, setStore] = useState<PassportStore>(emptyStore);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"local" | "cloud">("local");
  const [userId, setUserId] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState(readMigrationState);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "pending" | "failed"
  >("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const lastCloudMutation = useRef<{
    slug: string;
    patch: Partial<
      Omit<UserRestaurantRecord, "restaurantSlug" | "createdAt">
    >;
  } | null>(null);
  const [collectionSyncStatus, setCollectionSyncStatus] = useState<
    "idle" | "pending" | "failed"
  >("idle");
  const [collectionSyncMessage, setCollectionSyncMessage] = useState<
    string | null
  >(null);
  const lastCollectionMutation = useRef<CollectionMutation | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const localResult = loadPassportStoreResult();
      const local = localResult.store;
      if (!cancelled) setStorageError(localResult.storageError);
      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setStore(local);
          setMode("local");
          setReady(true);
        }
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          if (!cancelled) {
            setStore(local);
            setMode("local");
            setUserId(null);
            setReady(true);
          }
          return;
        }

        const uid = data.user.id;
        const existingMigration = readMigrationState();
        if (!existingMigration.completed || existingMigration.userId !== uid) {
          writeMigrationBackup(local);
          const result = await migrateLocalPassportToCloud(local);
          if (!result.ok) {
            if (!cancelled) {
              setMigrationMessage(
                result.message ??
                  "Cloud sync could not finish. Your local backup is preserved — try again from Account.",
              );
              writeMigrationState({
                completed: false,
                completedAt: null,
                userId: uid,
                conflictCount: result.conflictCount,
                lastError: result.message ?? "migration_failed",
              });
              setMigrationStatus(readMigrationState());
              const cloud = await loadCloudPassportStore();
              setStore(cloud ?? local);
              setMode("cloud");
              setUserId(uid);
              setReady(true);
            }
            return;
          }

          writeMigrationState({
            completed: true,
            completedAt: new Date().toISOString(),
            userId: uid,
            conflictCount: result.conflictCount,
            lastError: null,
          });
          if (!cancelled) {
            setMigrationStatus(readMigrationState());
            if (result.conflictCount > 0 || result.unknownSlugs.length > 0) {
              setMigrationMessage(
                `Synced to your account. ${result.conflictCount} note/rating conflict(s) kept in the local backup` +
                  (result.unknownSlugs.length
                    ? `; ${result.unknownSlugs.length} unknown restaurant slug(s) skipped.`
                    : "."),
              );
            } else if (
              Object.keys(local.userRestaurants).length > 0 ||
              Object.keys(local.collections).length > 0
            ) {
              setMigrationMessage("Local My Restaurants data synced to your account.");
            }
            setStore(result.store ?? (await loadCloudPassportStore()) ?? local);
            setMode("cloud");
            setUserId(uid);
            setReady(true);
          }
          return;
        }

        const cloud = await loadCloudPassportStore();
        if (!cancelled) {
          const cloudHasActivity = Boolean(
            cloud &&
              (Object.keys(cloud.bookmarks).length > 0 ||
                Object.keys(cloud.plans).length > 0 ||
                Object.keys(cloud.visits).length > 0 ||
                Object.keys(cloud.collections).length > 0),
          );
          const localHasActivity =
            Object.keys(local.bookmarks).length > 0 ||
            Object.keys(local.plans).length > 0 ||
            Object.keys(local.visits).length > 0 ||
            Object.keys(local.collections).length > 0;
          setStore(!cloudHasActivity && localHasActivity ? local : cloud ?? local);
          if (!cloudHasActivity && localHasActivity) {
            setSyncStatus("failed");
            setSyncMessage(
              "Your device data is intact, but its cloud merge needs attention.",
            );
          }
          setMode("cloud");
          setUserId(uid);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setStore(local);
          setMode("local");
          setReady(true);
        }
      }
    }

    startTransition(() => {
      void bootstrap();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const saved = savePassportStore(store);
    queueMicrotask(() => setStorageError(!saved));
  }, [ready, store]);

  const syncProjection = useCallback(
    (
      slug: string,
      patch: Partial<
        Omit<UserRestaurantRecord, "restaurantSlug" | "createdAt">
      >,
    ) => {
      if (mode !== "cloud") return;
      lastCloudMutation.current = { slug, patch };
      setSyncStatus("pending");
      setSyncMessage(null);
      void upsertCloudRestaurant(slug, patch)
        .then((result) => {
          if (result.ok) {
            setSyncStatus("idle");
            setSyncMessage(null);
          } else {
            setSyncStatus("failed");
            setSyncMessage("Couldn’t sync your latest change.");
          }
        })
        .catch(() => {
          setSyncStatus("failed");
          setSyncMessage("Couldn’t sync your latest change.");
        });
    },
    [mode],
  );

  const syncCollection = useCallback(
    (mutation: CollectionMutation) => {
      if (mode !== "cloud") return;
      lastCollectionMutation.current = mutation;
      setCollectionSyncStatus("pending");
      setCollectionSyncMessage(null);
      const request =
        mutation.kind === "upsert"
          ? upsertCloudCollection(mutation.collection)
          : deleteCloudCollection(mutation.collectionId);
      void request
        .then((result) => {
          if (result.ok) {
            setCollectionSyncStatus("idle");
            setCollectionSyncMessage(null);
          } else {
            setCollectionSyncStatus("failed");
            setCollectionSyncMessage(
              result.message ?? "Couldn’t sync this collection.",
            );
          }
        })
        .catch(() => {
          setCollectionSyncStatus("failed");
          setCollectionSyncMessage("Couldn’t sync this collection.");
        });
    },
    [mode],
  );

  function projectionPatch(
    next: PassportStore,
    slug: string,
  ): Partial<Omit<UserRestaurantRecord, "restaurantSlug" | "createdAt">> {
    const record = next.userRestaurants[slug];
    if (!record) {
      return {
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
        updatedAt: new Date().toISOString(),
      };
    }
    return record;
  }

  const value = useMemo<PassportContextValue>(() => {
    return {
      ready,
      restaurants,
      mode,
      userId,
      migrationStatus,
      migrationMessage,
      storageError,
      syncStatus,
      syncMessage,
      store,
      metrics: calculatePassportMetrics(store, restaurants),
      getRecord: (slug) => store.userRestaurants[slug],
      updateRestaurant: (slug, patch) => {
        setStore((current) => {
          const next = upsertUserRestaurant(current, slug, patch);
          syncProjection(slug, projectionPatch(next, slug));
          return next;
        });
      },
      removeRestaurant: (slug) => {
        setStore((current) => {
          const next = removeUserRestaurant(current, slug);
          syncProjection(slug, projectionPatch(next, slug));
          return next;
        });
      },
      savePlan: (input) => {
        setStore((current) => {
          const next = saveRestaurantPlan(current, input);
          syncProjection(
            input.restaurantSlug,
            projectionPatch(next, input.restaurantSlug),
          );
          return next;
        });
      },
      removePlan: (planId) => {
        setStore((current) => {
          const plan = current.plans[planId];
          const next = deleteRestaurantPlan(current, planId);
          if (plan) {
            syncProjection(
              plan.restaurantSlug,
              projectionPatch(next, plan.restaurantSlug),
            );
          }
          return next;
        });
      },
      addVisit: (input) => {
        setStore((current) => {
          const next = addRestaurantVisit(current, input);
          syncProjection(
            input.restaurantSlug,
            projectionPatch(next, input.restaurantSlug),
          );
          return next;
        });
      },
      editVisit: (visitId, patch) => {
        setStore((current) => {
          const visit = current.visits[visitId];
          const next = editRestaurantVisit(current, visitId, patch);
          if (visit) {
            syncProjection(
              visit.restaurantSlug,
              projectionPatch(next, visit.restaurantSlug),
            );
          }
          return next;
        });
      },
      deleteVisit: (visitId) => {
        setStore((current) => {
          const visit = current.visits[visitId];
          const next = removeRestaurantVisit(current, visitId);
          if (visit) {
            syncProjection(
              visit.restaurantSlug,
              projectionPatch(next, visit.restaurantSlug),
            );
          }
          return next;
        });
      },
      retrySync: () => {
        const mutation = lastCloudMutation.current;
        if (!mutation) return;
        syncProjection(mutation.slug, mutation.patch);
      },
      collectionSyncStatus,
      collectionSyncMessage,
      retryCollectionSync: () => {
        const mutation = lastCollectionMutation.current;
        if (!mutation) return;
        syncCollection(mutation);
      },
      addCollection: (input) => {
        const error = validateCollectionInput(store, input);
        if (error) return { collection: null, error };
        const result = createCollection(store, input);
        if (!result.collection) {
          return { collection: null, error: result.error };
        }
        setStore(result.store);
        syncCollection({ kind: "upsert", collection: result.collection });
        return { collection: result.collection, error: null };
      },
      editCollection: (id, patch) => {
        const existing = store.collections[id];
        if (!existing) return null;
        const error = validateCollectionInput(
          store,
          {
            name: patch.name ?? existing.name,
            description: patch.description ?? existing.description,
          },
          { excludeId: id },
        );
        if (error) return error;
        const next = updateCollection(store, id, patch);
        setStore(next);
        const collection = next.collections[id];
        if (collection) syncCollection({ kind: "upsert", collection });
        return null;
      },
      removeCollection: (id) => {
        setStore((current) => deleteCollection(current, id));
        syncCollection({ kind: "delete", collectionId: id });
      },
      // Membership edits use the updater form so they compose from the latest
      // state rather than this render's `store`, matching the journey
      // mutations above. Separate clicks each re-render, so this is defensive
      // rather than a fix for an observed drop.
      addToCollection: (collectionId, restaurantSlug) => {
        setStore((current) => {
          const next = addRestaurantToCollection(
            current,
            collectionId,
            restaurantSlug,
          );
          const collection = next.collections[collectionId];
          if (collection) {
            syncCollection({ kind: "upsert", collection });
            // Membership implies Saved, so the journey projection syncs too.
            syncProjection(restaurantSlug, projectionPatch(next, restaurantSlug));
          }
          return next;
        });
      },
      removeFromCollection: (collectionId, restaurantSlug) => {
        setStore((current) => {
          const next = removeRestaurantFromCollection(
            current,
            collectionId,
            restaurantSlug,
          );
          const collection = next.collections[collectionId];
          if (collection) syncCollection({ kind: "upsert", collection });
          return next;
        });
      },
      findCollectionBySlug: (slug) => getCollectionBySlug(store, slug),
      exportJson: () => exportPassportStore(store),
      importJson: (json) => {
        setStore(importPassportStore(json));
      },
      clearAll: () => {
        if (mode === "local") {
          setStore(clearPassportStore());
        }
      },
    };
  }, [
    ready,
    mode,
    userId,
    migrationStatus,
    migrationMessage,
    storageError,
    syncStatus,
    syncMessage,
    syncProjection,
    collectionSyncStatus,
    collectionSyncMessage,
    syncCollection,
    restaurants,
    store,
  ]);

  return (
    <PassportContext.Provider value={value}>
      {children}
    </PassportContext.Provider>
  );
}

export function usePassport(): PassportContextValue {
  const context = useContext(PassportContext);
  if (!context) {
    throw new Error("usePassport must be used within PassportProvider");
  }
  return context;
}
