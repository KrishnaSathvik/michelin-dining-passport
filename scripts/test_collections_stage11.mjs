import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAddRestaurantCandidates,
  buildCollectionDetail,
  buildCollectionsIndex,
  countCollectionsContaining,
  findCollectionBySlug,
  formatCollectionUpdatedLabel,
  toCollectionSummary,
} from "../src/lib/passport/collections.ts";
import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_NAME_MAX_LENGTH,
  addRestaurantToCollection,
  createCollection,
  deleteCollection,
  removeRestaurantFromCollection,
  removeUserRestaurant,
  updateCollection,
  validateCollectionInput,
} from "../src/lib/passport/store.ts";

function restaurant(slug, name, overrides = {}) {
  return {
    slug,
    name,
    stars: 3,
    cuisine: "Contemporary",
    cuisineSlug: "contemporary",
    price: "$$$$",
    city: "San Francisco",
    citySlug: "san-francisco",
    state: "California",
    stateCode: "CA",
    stateSlug: "california",
    address: "1 Example Street",
    michelinGuideUrl: "https://example.test",
    website: null,
    ...overrides,
  };
}

const RESTAURANTS = [
  restaurant("benu-san-francisco-ca", "Benu"),
  restaurant("addison-san-diego-ca", "Addison", {
    city: "San Diego",
    citySlug: "san-diego",
    cuisine: "French",
    cuisineSlug: "french",
  }),
  restaurant("per-se-new-york-ny", "Per Se", {
    city: "New York",
    citySlug: "new-york",
    state: "New York",
    stateCode: "NY",
    stateSlug: "new-york",
  }),
  restaurant("atomix-new-york-ny", "Atomix", {
    city: "New York",
    citySlug: "new-york",
    state: "New York",
    stateCode: "NY",
    stateSlug: "new-york",
    cuisine: "Korean",
    cuisineSlug: "korean",
  }),
  restaurant("alinea-chicago-il", "Alinea", {
    city: "Chicago",
    citySlug: "chicago",
    state: "Illinois",
    stateCode: "IL",
    stateSlug: "illinois",
  }),
];

const STAMP = "2026-07-01T12:00:00.000Z";

function emptyStore() {
  return {
    version: 3,
    bookmarks: {},
    plans: {},
    visits: {},
    userRestaurants: {},
    collections: {},
  };
}

function storeWith(overrides = {}) {
  return { ...emptyStore(), ...overrides };
}

function bookmark(slug) {
  return { restaurantSlug: slug, createdAt: STAMP, updatedAt: STAMP };
}

function withCollection(store, name, slugs = []) {
  const result = createCollection(store, { name, restaurantSlugs: slugs });
  assert.equal(result.error, null, `expected ${name} to be created`);
  return { store: result.store, collection: result.collection };
}

describe("collections membership invariants", () => {
  it("adding a restaurant to a collection also saves it", () => {
    const { store, collection } = withCollection(emptyStore(), "NY weekend");
    assert.equal(store.bookmarks["per-se-new-york-ny"], undefined);

    const next = addRestaurantToCollection(
      store,
      collection.id,
      "per-se-new-york-ny",
    );

    assert.ok(next.bookmarks["per-se-new-york-ny"], "bookmark must exist");
    assert.deepEqual(next.collections[collection.id].restaurantSlugs, [
      "per-se-new-york-ny",
    ]);
    assert.equal(next.userRestaurants["per-se-new-york-ny"].saved, true);
  });

  it("seeding a collection at creation also saves those restaurants", () => {
    const { store } = withCollection(emptyStore(), "Tasting menus", [
      "benu-san-francisco-ca",
      "alinea-chicago-il",
    ]);
    assert.ok(store.bookmarks["benu-san-francisco-ca"]);
    assert.ok(store.bookmarks["alinea-chicago-il"]);
  });

  it("removing from a collection does not unsave the restaurant", () => {
    const { store, collection } = withCollection(emptyStore(), "NY weekend");
    const added = addRestaurantToCollection(
      store,
      collection.id,
      "per-se-new-york-ny",
    );
    const removed = removeRestaurantFromCollection(
      added,
      collection.id,
      "per-se-new-york-ny",
    );

    assert.deepEqual(removed.collections[collection.id].restaurantSlugs, []);
    assert.ok(
      removed.bookmarks["per-se-new-york-ny"],
      "the restaurant must remain saved",
    );
  });

  it("a restaurant may belong to multiple collections", () => {
    const first = withCollection(emptyStore(), "NY weekend");
    const second = withCollection(first.store, "Anniversary restaurants");

    let store = addRestaurantToCollection(
      second.store,
      first.collection.id,
      "per-se-new-york-ny",
    );
    store = addRestaurantToCollection(
      store,
      second.collection.id,
      "per-se-new-york-ny",
    );

    assert.equal(countCollectionsContaining(store, "per-se-new-york-ny"), 2);
  });

  it("adding the same restaurant twice does not duplicate membership", () => {
    const { store, collection } = withCollection(emptyStore(), "NY weekend");
    let next = addRestaurantToCollection(store, collection.id, "atomix-new-york-ny");
    next = addRestaurantToCollection(next, collection.id, "atomix-new-york-ny");
    assert.deepEqual(next.collections[collection.id].restaurantSlugs, [
      "atomix-new-york-ny",
    ]);
  });

  it("removing from Passport removes every collection membership", () => {
    const first = withCollection(emptyStore(), "NY weekend");
    const second = withCollection(first.store, "Anniversary restaurants");
    let store = addRestaurantToCollection(
      second.store,
      first.collection.id,
      "per-se-new-york-ny",
    );
    store = addRestaurantToCollection(
      store,
      second.collection.id,
      "per-se-new-york-ny",
    );

    const cleared = removeUserRestaurant(store, "per-se-new-york-ny");

    assert.equal(countCollectionsContaining(cleared, "per-se-new-york-ny"), 0);
    assert.equal(cleared.bookmarks["per-se-new-york-ny"], undefined);
  });

  it("deleting a collection keeps bookmarks, plans, and visits", () => {
    const { store, collection } = withCollection(emptyStore(), "NY weekend");
    const withMember = addRestaurantToCollection(
      store,
      collection.id,
      "per-se-new-york-ny",
    );
    const seeded = {
      ...withMember,
      plans: {
        "plan:1": {
          id: "plan:1",
          restaurantSlug: "per-se-new-york-ny",
          plannedDate: "2026-09-01",
          plannedTime: null,
          reservationProvider: null,
          confirmationReference: null,
          privateNotes: "",
          createdAt: STAMP,
          updatedAt: STAMP,
        },
      },
      visits: {
        "visit:1": {
          id: "visit:1",
          restaurantSlug: "per-se-new-york-ny",
          visitDate: "2026-01-10",
          datePrecision: "day",
          favoriteDishes: "",
          privateNotes: "",
          wouldReturn: null,
          personalFavorite: false,
          createdAt: STAMP,
          updatedAt: STAMP,
        },
      },
    };

    const deleted = deleteCollection(seeded, collection.id);

    assert.equal(deleted.collections[collection.id], undefined);
    assert.ok(deleted.bookmarks["per-se-new-york-ny"], "stays saved");
    assert.ok(deleted.plans["plan:1"], "plan is preserved");
    assert.ok(deleted.visits["visit:1"], "visit is preserved");
  });

  it("collections are always private in V1", () => {
    const { store, collection } = withCollection(emptyStore(), "Private only");
    assert.equal(collection.private, true);
    const renamed = updateCollection(store, collection.id, { name: "Still private" });
    assert.equal(renamed.collections[collection.id].private, true);
  });
});

describe("collection validation", () => {
  it("requires a name", () => {
    assert.equal(validateCollectionInput(emptyStore(), { name: "   " }), "name-required");
  });

  it("rejects names over the limit and accepts names at it", () => {
    const store = emptyStore();
    assert.equal(
      validateCollectionInput(store, { name: "a".repeat(COLLECTION_NAME_MAX_LENGTH) }),
      null,
    );
    assert.equal(
      validateCollectionInput(store, {
        name: "a".repeat(COLLECTION_NAME_MAX_LENGTH + 1),
      }),
      "name-too-long",
    );
  });

  it("rejects descriptions over the limit", () => {
    const store = emptyStore();
    assert.equal(
      validateCollectionInput(store, {
        name: "Fine",
        description: "d".repeat(COLLECTION_DESCRIPTION_MAX_LENGTH + 1),
      }),
      "description-too-long",
    );
  });

  it("detects duplicate names case-insensitively and ignoring surrounding space", () => {
    const { store } = withCollection(emptyStore(), "New York weekend");
    assert.equal(
      validateCollectionInput(store, { name: "  new york WEEKEND " }),
      "duplicate-name",
    );
  });

  it("lets a collection keep its own name while renaming", () => {
    const { store, collection } = withCollection(emptyStore(), "New York weekend");
    assert.equal(
      validateCollectionInput(
        store,
        { name: "New York weekend", description: "updated" },
        { excludeId: collection.id },
      ),
      null,
    );
  });

  it("createCollection refuses a duplicate and leaves the store untouched", () => {
    const { store } = withCollection(emptyStore(), "New York weekend");
    const result = createCollection(store, { name: "new york weekend" });
    assert.equal(result.error, "duplicate-name");
    assert.equal(result.collection, null);
    assert.equal(Object.keys(result.store.collections).length, 1);
  });

  it("assigns distinct slugs when names slugify identically", () => {
    const first = withCollection(emptyStore(), "NY weekend");
    const second = withCollection(first.store, "NY  weekend!");
    assert.notEqual(first.collection.slug, second.collection.slug);
  });
});

describe("collection presentation models", () => {
  it("summarises count, thumbnails, and missing members", () => {
    const { store, collection } = withCollection(emptyStore(), "Mixed", [
      "benu-san-francisco-ca",
      "addison-san-diego-ca",
      "per-se-new-york-ny",
      "atomix-new-york-ny",
      "alinea-chicago-il",
      "closed-restaurant-xx",
    ]);
    const summary = toCollectionSummary(
      store.collections[collection.id],
      RESTAURANTS,
    );

    assert.equal(summary.restaurantCount, 5);
    assert.equal(summary.missingCount, 1);
    assert.equal(summary.thumbnails.length, 4, "mosaic caps at four images");
  });

  it("does not show an updated label for a future timestamp", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    assert.equal(formatCollectionUpdatedLabel(future), null);
    assert.equal(formatCollectionUpdatedLabel("not-a-date"), null);
    assert.equal(formatCollectionUpdatedLabel(new Date().toISOString()), "Updated today");
  });

  it("orders the index by most recently updated", () => {
    const store = storeWith({
      collections: {
        older: {
          id: "older",
          slug: "older",
          name: "Older",
          description: "",
          private: true,
          coverRestaurantSlug: null,
          restaurantSlugs: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        newer: {
          id: "newer",
          slug: "newer",
          name: "Newer",
          description: "",
          private: true,
          coverRestaurantSlug: null,
          restaurantSlugs: [],
          createdAt: "2026-02-01T00:00:00.000Z",
          updatedAt: "2026-02-01T00:00:00.000Z",
        },
      },
    });

    assert.deepEqual(
      buildCollectionsIndex(store, RESTAURANTS).map((item) => item.id),
      ["newer", "older"],
    );
  });

  it("detail surfaces plan and visit summaries without inventing journey state", () => {
    const { store, collection } = withCollection(emptyStore(), "Trip", [
      "benu-san-francisco-ca",
      "addison-san-diego-ca",
    ]);
    const seeded = {
      ...store,
      plans: {
        "plan:1": {
          id: "plan:1",
          restaurantSlug: "benu-san-francisco-ca",
          plannedDate: "2026-09-01",
          plannedTime: "19:30",
          reservationProvider: "Tock",
          confirmationReference: null,
          privateNotes: "",
          createdAt: STAMP,
          updatedAt: STAMP,
        },
      },
      visits: {
        "visit:1": {
          id: "visit:1",
          restaurantSlug: "benu-san-francisco-ca",
          visitDate: "2026-01-10",
          datePrecision: "day",
          favoriteDishes: "",
          privateNotes: "",
          wouldReturn: null,
          personalFavorite: true,
          createdAt: STAMP,
          updatedAt: STAMP,
        },
      },
    };

    const detail = buildCollectionDetail(
      seeded,
      RESTAURANTS,
      seeded.collections[collection.id],
      "2026-07-01",
    );

    const benu = detail.items.find((item) => item.slug === "benu-san-francisco-ca");
    const addison = detail.items.find(
      (item) => item.slug === "addison-san-diego-ca",
    );

    assert.equal(benu.planStatus, "upcoming");
    assert.equal(benu.visitCount, 1);
    assert.equal(benu.personalFavorite, true);
    assert.equal(addison.plan, null);
    assert.equal(addison.visitCount, 0);
    assert.equal(addison.personalFavorite, false);
  });

  it("finds a collection by slug and returns null when unknown", () => {
    const { store, collection } = withCollection(emptyStore(), "NY weekend");
    assert.equal(findCollectionBySlug(store, collection.slug).id, collection.id);
    assert.equal(findCollectionBySlug(store, "nope"), null);
  });
});

describe("add-restaurant candidates", () => {
  const savedStore = storeWith({
    bookmarks: {
      "benu-san-francisco-ca": bookmark("benu-san-francisco-ca"),
      "per-se-new-york-ny": bookmark("per-se-new-york-ny"),
      "atomix-new-york-ny": bookmark("atomix-new-york-ny"),
    },
  });

  it("only offers saved restaurants, never the whole catalog", () => {
    const { store, collection } = withCollection(savedStore, "NY weekend");
    const candidates = buildAddRestaurantCandidates(
      store,
      RESTAURANTS,
      store.collections[collection.id],
    );

    const slugs = candidates.map((item) => item.slug).sort();
    assert.deepEqual(slugs, [
      "atomix-new-york-ny",
      "benu-san-francisco-ca",
      "per-se-new-york-ny",
    ]);
    assert.ok(
      !slugs.includes("alinea-chicago-il"),
      "unsaved catalog entries must not leak in",
    );
  });

  it("flags restaurants already in the collection instead of hiding them", () => {
    const { store, collection } = withCollection(savedStore, "NY weekend");
    const withMember = addRestaurantToCollection(
      store,
      collection.id,
      "per-se-new-york-ny",
    );
    const candidates = buildAddRestaurantCandidates(
      withMember,
      RESTAURANTS,
      withMember.collections[collection.id],
    );

    const perSe = candidates.find((item) => item.slug === "per-se-new-york-ny");
    assert.equal(perSe.alreadyInCollection, true);
    assert.equal(candidates[candidates.length - 1].slug, "per-se-new-york-ny");
  });

  it("searches by name, city, state, and cuisine", () => {
    const { store, collection } = withCollection(savedStore, "NY weekend");
    const live = store.collections[collection.id];
    const search = (query) =>
      buildAddRestaurantCandidates(store, RESTAURANTS, live, query).map(
        (item) => item.slug,
      );

    assert.deepEqual(search("atomix"), ["atomix-new-york-ny"]);
    assert.deepEqual(search("new york").sort(), [
      "atomix-new-york-ny",
      "per-se-new-york-ny",
    ]);
    assert.deepEqual(search("NY").sort(), [
      "atomix-new-york-ny",
      "per-se-new-york-ny",
    ]);
    assert.deepEqual(search("korean"), ["atomix-new-york-ny"]);
    assert.deepEqual(search("nothing-matches-this"), []);
  });
});
