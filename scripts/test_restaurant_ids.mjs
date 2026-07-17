import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

const NAMESPACE = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

function restaurantIdFromSlug(slug) {
  const hex = NAMESPACE.replace(/-/g, "");
  const ns = Buffer.from(hex, "hex");
  const hash = createHash("sha1")
    .update(Buffer.concat([ns, Buffer.from(`mdp:restaurant:${slug}`, "utf8")]))
    .digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const out = hash.subarray(0, 16).toString("hex");
  return [
    out.slice(0, 8),
    out.slice(8, 12),
    out.slice(12, 16),
    out.slice(16, 20),
    out.slice(20, 32),
  ].join("-");
}

test("restaurant IDs are stable UUID v5 values", () => {
  const a = restaurantIdFromSlug("addison-san-diego-ca");
  const b = restaurantIdFromSlug("addison-san-diego-ca");
  assert.equal(a, b);
  assert.match(
    a,
    /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
});

test("different slugs produce different IDs", () => {
  assert.notEqual(
    restaurantIdFromSlug("addison-san-diego-ca"),
    restaurantIdFromSlug("benu-san-francisco-ca"),
  );
});
