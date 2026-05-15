import { formatBRL } from "@/data/products";

interface PriceProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export default function Price({ value, className = "text-base font-serif text-primary font-semibold", showLabel = false }: PriceProps) {
  return (
    <span className={className}>
      {showLabel && "de "}
      {formatBRL(value)}
    </span>
  );
}