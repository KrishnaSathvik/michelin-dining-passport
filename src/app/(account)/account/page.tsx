import { redirect } from "next/navigation";
import { AccountPageView } from "@/components/stitch/account/AccountPageView";
import { toAccountFlash } from "@/components/stitch/account/adapters";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getVerifiedUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = buildPageMetadata({
  title: "Account settings",
  description: "Manage your Dining Passport account settings.",
  path: "/account",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AccountPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getVerifiedUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const params = await searchParams;
  const passwordUpdated = params.password === "updated";
  const error =
    typeof params.error === "string" ? params.error : null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, home_city")
    .eq("id", user.id)
    .maybeSingle();

  const hasPasswordProvider =
    user.providers.includes("email") || user.providers.length === 0;

  return (
    <AccountPageView
      profile={{
        email: user.email,
        displayName: profile?.display_name ?? "",
        homeCity: profile?.home_city ?? "",
        providers: user.providers,
        createdAt: user.createdAt,
        hasPasswordProvider,
      }}
      flash={toAccountFlash(passwordUpdated, error)}
    />
  );
}
