"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
  clearPassportStore,
  createCollection,
  deleteCollection,
  exportPassportStore,
  getCollectionBySlug,
  importPassportStore,
  loadPassportStore,
  removeUserRestaurant,
  savePassportStore,
  updateCollection,
  upsertUserRestaurant,
} from "./store";
import type {
  LocalCollection,
  PassportMetrics,
  PassportStore,
  UserRestaurantRecord,
} from "./types";
import type { Restaurant } from "@/lib/data/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

type PassportContextValue = {
  ready: boolean;
  mode: "local" | "cloud";
  userId: string | null;
  migrationStatus: ReturnType<typeof readMigrationState>;
  migrationMessage: string | null;
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
  addCollection: (input: {
    name: string;
    description?: string;
    private?: boolean;
  }) => LocalCollection | null;
  editCollection: (
    id: string,
    patch: Partial<
      Pick<
        LocalCollection,
        | "name"
        | "description"
        | "private"
        | "coverRestaurantSlug"
        | "restaurantSlugs"
      >
    >,
  ) => void;
  removeCollection: (id: string) => void;
  findCollectionBySlug: (slug: string) => LocalCollection | undefined;
  exportJson: () => string;
  importJson: (json: string) => void;
  clearAll: () => void;
};

const PassportContext = createContext<PassportContextValue | null>(null);

type PassportProviderProps = {
  restaurants: Restaurant[];
  children: ReactNode;
};

const emptyStore: PassportStore = {
  version: 2,
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
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const local = loadPassportStore();
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
                  "Cloud sync could not finish. Your local Passport backup is preserved — try again from Account.",
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
              setMigrationMessage("Local Passport synced to your account.");
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
          setStore(cloud ?? local);
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
    if (!ready || mode !== "local") return;
    savePassportStore(store);
  }, [ready, store, mode]);

  const value = useMemo<PassportContextValue>(() => {
    return {
      ready,
      mode,
      userId,
      migrationStatus,
      migrationMessage,
      store,
      metrics: calculatePassportMetrics(store, restaurants),
      getRecord: (slug) => store.userRestaurants[slug],
      updateRestaurant: (slug, patch) => {
        setStore((current) => {
          const next = upsertUserRestaurant(current, slug, patch);
          if (mode === "cloud") {
            void upsertCloudRestaurant(slug, patch);
          }
          return next;
        });
      },
      removeRestaurant: (slug) => {
        setStore((current) => {
          const next = removeUserRestaurant(current, slug);
          if (mode === "cloud") {
            void upsertCloudRestaurant(slug, {
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
            });
          }
          return next;
        });
      },
      addCollection: (input) => {
        let created: LocalCollection | null = null;
        setStore((current) => {
          const result = createCollection(current, input);
          created = result.collection;
          if (mode === "cloud") {
            void upsertCloudCollection(result.collection);
          }
          return result.store;
        });
        return created;
      },
      editCollection: (id, patch) => {
        setStore((current) => {
          const next = updateCollection(current, id, patch);
          const collection = next.collections[id];
          if (mode === "cloud" && collection) {
            void upsertCloudCollection(collection);
          }
          return next;
        });
      },
      removeCollection: (id) => {
        setStore((current) => {
          const next = deleteCollection(current, id);
          if (mode === "cloud") {
            void deleteCloudCollection(id);
          }
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
