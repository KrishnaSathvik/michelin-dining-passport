import { readProof } from "@/lib/ui-proofs";

export const COLLECTIONS_PROOFS = [
  "loading",
  "empty",
  "device-only",
  "sync-pending",
  "sync-failed",
] as const;

export const COLLECTION_DETAIL_PROOFS = [
  "loading",
  "empty",
  "missing",
  "device-only",
  "sync-pending",
  "sync-failed",
] as const;

export type CollectionsProof = (typeof COLLECTIONS_PROOFS)[number];
export type CollectionDetailProof = (typeof COLLECTION_DETAIL_PROOFS)[number];

export function readCollectionsProof(
  value: string | string[] | undefined,
): CollectionsProof | undefined {
  return readProof(COLLECTIONS_PROOFS, value);
}

export function readCollectionDetailProof(
  value: string | string[] | undefined,
): CollectionDetailProof | undefined {
  return readProof(COLLECTION_DETAIL_PROOFS, value);
}

export { UI_PROOFS_ENABLED } from "@/lib/ui-proofs";
