import { NextResponse } from "next/server";
import { safeInternalPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeInternalPath(requestUrl.searchParams.get("next"), "/passport");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=config", requestUrl.origin),
    );
  }

  if (errorDescription) {
    return NextResponse.redirect(
      new URL("/login?error=callback", requestUrl.origin),
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=callback", requestUrl.origin),
      );
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
