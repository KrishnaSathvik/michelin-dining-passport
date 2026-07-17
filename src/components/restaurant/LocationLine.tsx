type LocationLineProps = {
  city: string;
  state: string;
  stateCode?: string;
  className?: string;
};

export function LocationLine({
  city,
  state,
  stateCode,
  className = "",
}: LocationLineProps) {
  const region = stateCode ?? state;
  return (
    <span className={`font-sans text-sm text-ink-muted ${className}`}>
      {city}, {region}
    </span>
  );
}
