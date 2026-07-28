import type { LocalCollection, PassportStore, UserRestaurantRecord } from "@/lib/passport/types";
import type { CollectionInputError } from "@/lib/passport/store";

export type PersonalDataMode = "local" | "cloud";

export type PersonalDataRepository = {
  mode: PersonalDataMode;
  load(): Promise<PassportStore>;
  upsertRestaurant(
    slug: string,
    patch: Partial<Omit<UserRestaurantRecord, "restaurantSlug" | "createdAt">>,
  ): Promise<PassportStore>;
  removeRestaurant(slug: string): Promise<PassportStore>;
  createCollection(input: {
    name: string;
    description?: string;
    coverRestaurantSlug?: string | null;
    restaurantSlugs?: string[];
  }): Promise<{
    store: PassportStore;
    collection: LocalCollection | null;
    error: CollectionInputError | null;
  }>;
  updateCollection(
    id: string,
    patch: Partial<
      Pick<LocalCollection, "name" | "description" | "coverRestaurantSlug">
    >,
  ): Promise<PassportStore>;
  deleteCollection(id: string): Promise<PassportStore>;
  addRestaurantToCollection(
    collectionId: string,
    restaurantSlug: string,
  ): Promise<PassportStore>;
  removeRestaurantFromCollection(
    collectionId: string,
    restaurantSlug: string,
  ): Promise<PassportStore>;
  exportJson(): Promise<string>;
  importJson(json: string): Promise<PassportStore>;
  clearAll(): Promise<PassportStore>;
};
