import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Numar Store — Página inicial"
    >
      <img
        src={logoImg}
        alt="Numar Store"
        className="h-10 md:h-12 w-auto object-contain"
        loading="eager"
      />
    </Link>
  );
}
