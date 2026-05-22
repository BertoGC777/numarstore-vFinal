import { Link } from "react-router-dom";
import biquini from "@/assets/products/biquini-rosa.jpeg";
import blusinha from "@/assets/products/blusinha1-vermelha.jpeg";
import saia from "@/assets/products/saia-longa-preta-1.jpeg";
import conjunto from "@/assets/products/conjunto-cropped-saia-1.jpeg";
import vestidoLongo from "@/assets/products/vestido-sereia-rosa-1.jpg";
import vestidoCurto from "@/assets/products/vestido-brisa-rosa-1.jpg";
import promo from "@/assets/products/cropped2-amarelo.jpeg";
import Image from "@/components/Image";

const cats = [
  { label: "Biquínis", href: "/catalogo/biquinis", img: biquini },
  { label: "Partes de Cima", href: "/catalogo/partes-de-cima", img: blusinha },
  { label: "Partes de Baixo", href: "/catalogo/partes-de-baixo", img: saia },
  { label: "Conjuntos", href: "/catalogo/conjuntos", img: conjunto },
  { label: "Vestidos Longos", href: "/catalogo/vestidos-longos", img: vestidoLongo },
  { label: "Vestidos Curtos", href: "/catalogo/vestidos-curtos", img: vestidoCurto },
  { label: "Lançamentos", href: "/catalogo/lancamentos", img: promo },
  { label: "Promoção", href: "/catalogo/promocao", img: promo },
];

export default function CategoryShortcuts() {
  return (
    <section className="container-numar py-12 md:py-16">
      <h2 className="font-serif text-3xl md:text-4xl text-center mb-8">Categorias</h2>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-5">
        {cats.map((c) => (
          <Link key={c.label} to={c.href} className="group block">
            <div className="aspect-square overflow-hidden bg-muted relative border-2 border-transparent group-hover:border-primary transition-colors">
              <Image
                src={c.img}
                alt={c.label}
                aspectRatio="square"
                objectFit="contain"
                loading="lazy"
                className="w-full h-full group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white text-sm uppercase tracking-wider font-medium text-center px-2">{c.label}</p>
              </div>
            </div>
            <p className="mt-3 text-center text-sm uppercase tracking-wider font-medium">{c.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
