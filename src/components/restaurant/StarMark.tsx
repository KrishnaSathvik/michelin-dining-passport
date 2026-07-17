type StarMarkProps = {
  stars: 1 | 2 | 3;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "text-sm tracking-[0.18em]",
  md: "text-base tracking-[0.2em]",
  lg: "text-lg tracking-[0.22em]",
} as const;

export function StarMark({ stars, size = "md", className = "" }: StarMarkProps) {
  const label =
    stars === 1
      ? "One Michelin star"
      : stars === 2
        ? "Two Michelin stars"
        : "Three Michelin stars";

  return (
    <span
      className={`inline-flex items-center text-gold ${sizeClass[size]} ${className}`}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{"★".repeat(stars)}</span>
    </span>
  );
}
