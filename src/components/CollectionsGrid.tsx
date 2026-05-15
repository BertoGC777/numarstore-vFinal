import { Link } from "react-router-dom";
import verao from "@/assets/products/biquini-ciano.jpeg";
import lancamentos from "@/assets/products/saia-longa-preta-2.jpeg";
import promocao from "@/assets/products/blusinha1-preta.jpeg";

const cols = [
  { title: "Coleção Verão", img: verao, href: "/catalogo/biquinis" },
  { title: "Lançamentos", img: lancamentos, href: "/catalogo/lancamentos" },
  { title: "Promoção", img: promocao, href: "/catalogo/promocao" },
];

export default function CollectionsGrid() {
  return (
    <section className="container-numar py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {cols.map((c) => (
          <Link key={c.title} to={c.href} className="group relative block aspect-[4/5] overflow-hidden bg-muted">
            <img src={c.img} alt={c.title} width={400} height={533} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white text-center">
              <h3 className="font-serif text-3xl md:text-4xl mb-3">{c.title}</h3>
              <span className="inline-block border border-white/80 px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-foreground transition">Ver Coleção</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
