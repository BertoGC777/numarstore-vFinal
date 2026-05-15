import { Link } from "react-router-dom";
import saleBg from "@/assets/hero/sale-banner.jpg";

export default function SaleBanner() {
  return (
    <section className="relative my-12 md:my-20">
      <div
        className="relative h-64 md:h-80 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(hsl(28 25% 12% / 0.65), hsl(28 25% 12% / 0.65)), url(${saleBg})`,
        }}
      >
        <div className="text-center text-white px-4">
          <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-primary mb-3">Oferta Especial</p>
          <h2 className="font-serif text-4xl md:text-6xl mb-5">SALE — Até 50% OFF</h2>
          <Link to="/catalogo/promocao" className="inline-block bg-primary text-primary-foreground px-8 py-3 text-sm uppercase tracking-widest hover:bg-primary/90 transition">
            Ver Promoções
          </Link>
        </div>
      </div>
    </section>
  );
}
