type CuisineLabelProps = {
  cuisine: string;
  className?: string;
};

export function CuisineLabel({ cuisine, className = "" }: CuisineLabelProps) {
  return (
    <span
      className={`font-sans text-sm text-ink-muted ${className}`}
    >
      {cuisine}
    </span>
  );
}
