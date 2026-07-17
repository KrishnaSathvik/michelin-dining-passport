import { createHash } from "node:crypto";

/** Must match scripts/generate_supabase_seed.mjs */
const NAMESPACE = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

function uuidToBytes(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, "");
  return Buffer.from(hex, "hex");
}

function bytesToUuid(bytes: Buffer): string {
  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function uuidV5(name: string, namespace = NAMESPACE): string {
  const hash = createHash("sha1")
    .update(Buffer.concat([uuidToBytes(namespace), Buffer.from(name, "utf8")]))
    .digest();
  hash[6] = (hash[6]! & 0x0f) | 0x50;
  hash[8] = (hash[8]! & 0x3f) | 0x80;
  return bytesToUuid(hash.subarray(0, 16));
}

/** Deterministic restaurant UUID matching seed generation. Server-only safe. */
export function restaurantIdFromSlug(slug: string): string {
  return uuidV5(`mdp:restaurant:${slug}`);
}
