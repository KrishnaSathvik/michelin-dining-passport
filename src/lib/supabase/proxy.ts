import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeInternalPath } from "@/lib/auth/redirect";
import type { Database } from "@/lib/supabase/database.types";
import {
  getPublicSupabasePublishableKey,
  getPublicSupabaseUrl,
} from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = getPublicSupabaseUrl();
  const publishableKey = getPublicSupabasePublishableKey();
  if (!url || !publishableKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Must run immediately after createServerClient for SSR session refresh.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const userId =
    typeof claims?.sub === "string"
      ? claims.sub
      : typeof claims?.user_id === "string"
        ? claims.user_id
        : null;

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/account") && !userId) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set(
      "next",
      safeInternalPath(`${pathname}${request.nextUrl.search}`, "/account"),
    );
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
