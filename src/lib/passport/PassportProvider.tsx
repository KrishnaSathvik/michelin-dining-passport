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

type PassportContextValue = {
  ready: boolean;
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

export function PassportProvider({
  restaurants,
  children,
}: PassportProviderProps) {
  const [store, setStore] = useState<PassportStore>(() => ({
    version: 1,
    userRestaurants: {},
    collections: {},
  }));
  const [ready, setReady] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const loaded = loadPassportStore();
    startTransition(() => {
      setStore(loaded);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    savePassportStore(store);
  }, [ready, store]);

  const value = useMemo<PassportContextValue>(() => {
    return {
      ready,
      store,
      metrics: calculatePassportMetrics(store, restaurants),
      getRecord: (slug) => store.userRestaurants[slug],
      updateRestaurant: (slug, patch) => {
        setStore((current) => upsertUserRestaurant(current, slug, patch));
      },
      removeRestaurant: (slug) => {
        setStore((current) => removeUserRestaurant(current, slug));
      },
      addCollection: (input) => {
        let created: LocalCollection | null = null;
        setStore((current) => {
          const result = createCollection(current, input);
          created = result.collection;
          return result.store;
        });
        return created;
      },
      editCollection: (id, patch) => {
        setStore((current) => updateCollection(current, id, patch));
      },
      removeCollection: (id) => {
        setStore((current) => deleteCollection(current, id));
      },
      findCollectionBySlug: (slug) => getCollectionBySlug(store, slug),
      exportJson: () => exportPassportStore(store),
      importJson: (json) => {
        setStore(importPassportStore(json));
      },
      clearAll: () => {
        setStore(clearPassportStore());
      },
    };
  }, [ready, restaurants, store]);

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
