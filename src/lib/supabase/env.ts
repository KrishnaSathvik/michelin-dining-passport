export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getPublicSupabaseUrl(): string | undefined {
  return readEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getPublicSupabasePublishableKey(): string | undefined {
  return readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

export function getSiteUrl(): string {
  return (
    readEnv("NEXT_PUBLIC_SITE_URL")?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function isGoogleAuthEnabled(): boolean {
  return readEnv("NEXT_PUBLIC_ENABLE_GOOGLE_AUTH") === "true";
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getPublicSupabaseUrl() && getPublicSupabasePublishableKey());
}

export function requirePublicSupabaseEnv(): {
  url: string;
  publishableKey: string;
} {
  const url = getPublicSupabaseUrl();
  const publishableKey = getPublicSupabasePublishableKey();
  if (!url || !publishableKey) {
    throw new ConfigurationError(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
  }
  return { url, publishableKey };
}

/** Server-only. Do not import this helper from Client Components. */
export function requireSupabaseSecretKey(): string {
  const secret = readEnv("SUPABASE_SECRET_KEY");
  if (!secret) {
    throw new ConfigurationError(
      "SUPABASE_SECRET_KEY is required for this server-only operation.",
    );
  }
  return secret;
}
