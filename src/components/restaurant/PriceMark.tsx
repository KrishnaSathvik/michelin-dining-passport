type PriceMarkProps = {
  price: string;
  className?: string;
};

export function PriceMark({ price, className = "" }: PriceMarkProps) {
  return (
    <span
      className={`font-sans text-sm tracking-wide text-ink-muted ${className}`}
      aria-label={`Price level ${price}`}
    >
      {price}
    </span>
  );
}
