import {
  clearPassportStore,
  createCollection,
  deleteCollection,
  exportPassportStore,
  importPassportStore,
  loadPassportStore,
  removeUserRestaurant,
  savePassportStore,
  updateCollection,
  upsertUserRestaurant,
} from "@/lib/passport/store";
import type { PassportStore } from "@/lib/passport/types";
import type { PersonalDataRepository } from "./repository";

export function createLocalPersonalDataRepository(): PersonalDataRepository {
  let memory: PassportStore | null = null;

  const current = () => {
    if (!memory) memory = loadPassportStore();
    return memory;
  };

  const persist = (store: PassportStore) => {
    memory = store;
    savePassportStore(store);
    return store;
  };

  return {
    mode: "local",
    async load() {
      return persist(loadPassportStore());
    },
    async upsertRestaurant(slug, patch) {
      return persist(upsertUserRestaurant(current(), slug, patch));
    },
    async removeRestaurant(slug) {
      return persist(removeUserRestaurant(current(), slug));
    },
    async createCollection(input) {
      const result = createCollection(current(), input);
      persist(result.store);
      return result;
    },
    async updateCollection(id, patch) {
      return persist(updateCollection(current(), id, patch));
    },
    async deleteCollection(id) {
      return persist(deleteCollection(current(), id));
    },
    async exportJson() {
      return exportPassportStore(current());
    },
    async importJson(json) {
      return persist(importPassportStore(json));
    },
    async clearAll() {
      return persist(clearPassportStore());
    },
  };
}
