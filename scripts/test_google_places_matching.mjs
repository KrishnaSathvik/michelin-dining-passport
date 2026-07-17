/**
 * Extra matching + join tests for Google Place IDs.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("google place id matching data", () => {
  it("validates committed match file for all 271 restaurants", () => {
    const result = spawnSync(
      "python3",
      ["scripts/validate_google_place_ids.py"],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /PASS/);
  });

  it("does not persist provider content fields", () => {
    const raw = readFileSync(join(root, "data/google-place-ids.json"), "utf8");
    for (const needle of [
      '"photos"',
      '"reviews"',
      '"formattedAddress"',
      '"websiteUri"',
      '"rating"',
      '"nationalPhoneNumber"',
    ]) {
      assert.equal(raw.includes(needle), false, needle);
    }
  });

  it("keeps rejected and no_match rows without Place IDs", () => {
    const payload = JSON.parse(
      readFileSync(join(root, "data/google-place-ids.json"), "utf8"),
    );
    for (const row of payload.matches) {
      if (row.status === "rejected" || row.status === "no_match") {
        assert.equal(row.placeId, null, row.restaurantSlug);
      }
    }
  });

  it("blocks name-only and shared-sibling auto-approval in scoring helper", () => {
    const result = spawnSync(
      "python3",
      [
        "-c",
        [
          "import sys; sys.path.insert(0,'scripts')",
          "from google_places_common import score_candidate",
          "r={'name':'Alinea','address':'1723 N. Halsted St., Chicago, IL, 60614, USA','city':'Chicago','stateCode':'IL','website':'https://www.alinearestaurant.com/'}",
          "g={'latitude':41.9134,'longitude':-87.6480}",
          "bad={'id':'x','displayName':{'text':'Alinea'},'formattedAddress':'New York, NY','types':['restaurant'],'businessStatus':'OPERATIONAL','location':{'latitude':40.7,'longitude':-74.0}}",
          "s=score_candidate(r,g,bad,['alinea-chicago-il'])",
          "assert s['autoApprove'] is False",
          "good={'id':'ChIJuyI60yLTD4gROwTWENq1He0','displayName':{'text':'Alinea'},'formattedAddress':'1723 N Halsted St, Chicago, IL 60614, USA','types':['restaurant'],'businessStatus':'OPERATIONAL','websiteUri':'https://www.alinearestaurant.com/','location':{'latitude':41.9134,'longitude':-87.6480}}",
          "s2=score_candidate(r,g,good,['alinea-chicago-il'])",
          "assert s2['autoApprove'] is True and s2['confidence']=='high'",
          "s3=score_candidate(r,g,good,['alinea-chicago-il','sibling'])",
          "assert s3['autoApprove'] is False",
          "print('ok')",
        ].join(";"),
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });
});
