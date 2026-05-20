import { Link } from "react-router-dom";
import saleBg from "@/assets/hero/sale-banner.jpg";
import Image from "@/components/Image";

export default function SaleBanner() {
  return (
    <section className="relative my-12 md:my-20">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={saleBg}
          alt="Banner de Promoção"
          width={1920}
          height={400}
          aspectRatio="landscape"
          objectFit="cover"
          loading="lazy"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/65" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-primary mb-3">Oferta Especial</p>
            <h2 className="font-serif text-4xl md:text-6xl mb-5">SALE — Até 50% OFF</h2>
            <Link to="/catalogo/promocao" className="inline-block bg-primary text-primary-foreground px-8 py-3 text-sm uppercase tracking-widest hover:bg-primary/90 transition">
              Ver Promoções
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
