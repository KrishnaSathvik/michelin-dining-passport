/**
 * Accept only internal application paths. Rejects open redirects.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback = "/passport",
): string {
  if (!next || typeof next !== "string") return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  if (trimmed.includes("\n") || trimmed.includes("\r")) return fallback;
  return trimmed;
}
