import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/account/AccountPanel";
import { getVerifiedUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const user = await getVerifiedUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, home_city")
    .eq("id", user.id)
    .maybeSingle();

  const hasPasswordProvider =
    user.providers.includes("email") || user.providers.length === 0;

  return (
    <AccountPanel
      email={user.email}
      displayName={profile?.display_name ?? ""}
      homeCity={profile?.home_city ?? ""}
      providers={user.providers}
      createdAt={user.createdAt}
      hasPasswordProvider={hasPasswordProvider}
    />
  );
}
