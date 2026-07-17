import type { LocalCollection, PassportStore, UserRestaurantRecord } from "@/lib/passport/types";

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
    private?: boolean;
    coverRestaurantSlug?: string | null;
    restaurantSlugs?: string[];
  }): Promise<{ store: PassportStore; collection: LocalCollection }>;
  updateCollection(
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
  ): Promise<PassportStore>;
  deleteCollection(id: string): Promise<PassportStore>;
  exportJson(): Promise<string>;
  importJson(json: string): Promise<PassportStore>;
  clearAll(): Promise<PassportStore>;
};
