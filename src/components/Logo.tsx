import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import Image from "@/components/Image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Numar Store — Página inicial"
    >
      <Image
        src={logoImg}
        alt="Numar Store"
        width={48}
        height={48}
        aspectRatio="square"
        objectFit="contain"
        loading="eager"
        fetchPriority="high"
        className="h-10 md:h-12 w-auto"
      />
    </Link>
  );
}
