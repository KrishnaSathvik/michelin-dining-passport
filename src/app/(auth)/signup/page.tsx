import { signUpAction } from "@/app/auth/actions";
import { SignUpForm } from "@/components/stitch/auth/SignUpForm";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { safeInternalPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata = buildPageMetadata({
  title: "Create account",
  description: "Create a Dining Passport account to sync saves across devices.",
  path: "/signup",
  noIndex: true,
});

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeInternalPath(
    typeof params.next === "string" ? params.next : undefined,
  );

  return (
    <SignUpForm
      next={next}
      action={signUpAction}
      configured={isSupabaseConfigured()}
    />
  );
}
