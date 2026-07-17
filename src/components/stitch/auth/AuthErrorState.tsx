type AuthErrorStateProps = {
  message: string;
  id?: string;
};

/** Form-level error banner — not for field validation. */
export function AuthErrorState({ message, id }: AuthErrorStateProps) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="rounded-[var(--dp-radius-md)] border border-dp-error/30 bg-[color-mix(in_srgb,var(--dp-error)_8%,var(--dp-surface))] px-4 py-3 font-sans text-[14px] text-dp-error"
    >
      {message}
    </p>
  );
}
