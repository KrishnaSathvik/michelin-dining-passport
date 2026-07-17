import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type VerifiedUser = {
  id: string;
  email: string | null;
  createdAt: string | null;
  providers: string[];
};

/**
 * Server-confirmed user via getUser(). Do not authorize from unverified session.
 */
export async function getVerifiedUser(): Promise<VerifiedUser | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const providers = Array.isArray(data.user.app_metadata?.providers)
      ? (data.user.app_metadata.providers as string[])
      : data.user.app_metadata?.provider
        ? [String(data.user.app_metadata.provider)]
        : [];
    return {
      id: data.user.id,
      email: data.user.email ?? null,
      createdAt: data.user.created_at ?? null,
      providers,
    };
  } catch {
    return null;
  }
}
