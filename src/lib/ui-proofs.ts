/**
 * UI proof fixtures render deliberately fabricated states (loading, empty,
 * sync failure, demo gallery images) so visual QA and e2e can reach states that
 * real data cannot produce on demand.
 *
 * Gating is on NEXT_PUBLIC_UI_PROOFS rather than NODE_ENV: e2e runs against a
 * production server (`next start`), so a NODE_ENV check made every proof
 * fixture unreachable under test. A test build opts in explicitly with
 * `npm run build:e2e`; normal production builds leave the flag unset, which
 * makes this constant a literal false and removes the guarded branches.
 */
export const UI_PROOFS_ENABLED = process.env.NEXT_PUBLIC_UI_PROOFS === "1";

/** Narrow an untrusted `?proof=` value to one of the allowed fixtures. */
export function readProof<T extends string>(
  allowed: readonly T[],
  value: string | string[] | undefined,
): T | undefined {
  if (!UI_PROOFS_ENABLED) return undefined;
  const candidate = Array.isArray(value) ? value[0] : value;
  return allowed.find((item) => item === candidate);
}
