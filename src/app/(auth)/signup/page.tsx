import { signUpAction } from "@/app/auth/actions";
import { AuthForm, AuthLinks } from "@/components/auth/AuthForm";
import { safeInternalPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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
    <div className="flex flex-col gap-6">
      {!isSupabaseConfigured() ? (
        <p className="border border-border px-4 py-3 font-sans text-sm text-ink-muted">
          Supabase is not configured, so account creation is unavailable.
        </p>
      ) : null}
      <AuthForm
        title="Create account"
        description="Save visits, notes, and collections to your cloud Passport."
        action={signUpAction}
        next={next}
        submitLabel="Create account"
        fields={[
          {
            name: "displayName",
            label: "Display name",
            autoComplete: "name",
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            autoComplete: "email",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            required: true,
            autoComplete: "new-password",
          },
        ]}
        footer={<AuthLinks next={next} />}
      />
    </div>
  );
}
