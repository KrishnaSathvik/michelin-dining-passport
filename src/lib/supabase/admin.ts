import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  requirePublicSupabaseEnv,
  requireSupabaseSecretKey,
} from "@/lib/supabase/env";

/**
 * Secret-key client for narrowly scoped server-only admin actions
 * (confirmed account deletion). Never import from Client Components.
 */
export function createAdminClient() {
  const { url } = requirePublicSupabaseEnv();
  const secretKey = requireSupabaseSecretKey();
  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
