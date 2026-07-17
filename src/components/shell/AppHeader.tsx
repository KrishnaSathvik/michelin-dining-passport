import { getVerifiedUser } from "@/lib/auth/session";
import { AppHeaderClient } from "./AppHeaderClient";

export async function AppHeader() {
  const user = await getVerifiedUser().catch(() => null);
  return <AppHeaderClient user={user} />;
}
