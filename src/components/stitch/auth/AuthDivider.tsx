export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 py-1" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-dp-border" />
      <span className="dp-meta text-dp-ink-muted">{label}</span>
      <span className="h-px flex-1 bg-dp-border" />
    </div>
  );
}
