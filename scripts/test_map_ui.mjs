/**
 * Phase 6 — Map Stitch workspace composition guards.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pageTs = readFileSync(join(root, "src/app/map/page.tsx"), "utf8");
const controllerTs = readFileSync(
  join(root, "src/components/map/RestaurantMap.tsx"),
  "utf8",
);
const queryTs = readFileSync(join(root, "src/lib/map/query.ts"), "utf8");
const canvasTs = readFileSync(
  join(root, "src/components/map/MapCanvas.tsx"),
  "utf8",
);

describe("Map Phase 6 composition", () => {
  it("wires Stitch MapWorkspaceView through the map controller", () => {
    assert.match(pageTs, /RestaurantMap/);
    assert.match(pageTs, /MapWorkspaceShell/);
    assert.match(controllerTs, /MapWorkspaceView/);
    assert.match(controllerTs, /toMapRowModels/);
    assert.doesNotMatch(controllerTs, /ReservationButton|SaveRestaurantButton/);
  });

  it("preserves MapCanvas and does not import Google Maps SDK for basemap", () => {
    assert.equal(existsSync(join(root, "src/components/map/MapCanvas.tsx")), true);
    assert.match(canvasTs, /maplibre|react-map-gl/i);
    assert.doesNotMatch(canvasTs, /google\.maps|@googlemaps/);
  });

  it("keeps the map URL contract surface", () => {
    for (const key of [
      "savedOnly",
      "visitedOnly",
      "selected",
      "bounds",
      "panel",
    ]) {
      assert.match(queryTs, new RegExp(key));
    }
  });
});
