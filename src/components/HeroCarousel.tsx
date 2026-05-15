import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero/hero-1.jpg";
import hero2 from "@/assets/hero/hero-2.jpg";
import hero3 from "@/assets/hero/hero-3.jpg";

const slides = [
  {
    img: hero1,
    label: "Novidade",
    title: "Elegância que\ntransforma",
    subtitle: "Peças exclusivas para valorizar cada momento",
    cta: "Ver Coleção",
    href: "/catalogo/lancamentos",
  },
  {
    img: hero2,
    label: "Lançamentos",
    title: "Conjuntos que\nencantam",
    subtitle: "Looks completos com estilo e sofisticação",
    cta: "Ver Conjuntos",
    href: "/catalogo/conjuntos",
  },
  {
    img: hero3,
    label: "Destaque",
    title: "Vestidos para\ncada ocasião",
    subtitle: "Da praia ao jantar, você sempre linda",
    cta: "Ver Vestidos",
    href: "/catalogo/vestidos",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((x) => (x + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((x) => (x - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <section
      className="relative w-full h-[62vh] md:h-[82vh] overflow-hidden bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Banner principal"
    >
      {slides.map((s, idx) => (
        <div
          key={idx}
          aria-hidden={idx !== current}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
<img
              src={s.img}
              alt={s.title}
              width={1920}
              height={800}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={idx === 0 ? "high" : "low"}
              className="w-full h-full object-cover object-center"
            />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Content */}
          <div
            className={`absolute inset-0 flex items-center transition-all duration-700 delay-200 ${
              idx === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="container-numar pb-8">
              <div className="max-w-2xl text-white">
                <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary-glow mb-4 font-medium">
                  {s.label}
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 leading-[1.1] whitespace-pre-line">
                  {s.title}
                </h1>
                <p className="text-base md:text-lg mb-8 opacity-90 max-w-md leading-relaxed">
                  {s.subtitle}
                </p>
                <Link
                  to={s.href}
                  className="inline-block bg-primary text-primary-foreground px-8 py-3.5 text-sm uppercase tracking-widest hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  {s.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Nav arrows */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/15 backdrop-blur-sm text-white p-2.5 hover:bg-white/30 transition-all duration-200 border border-white/20"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={next}
        aria-label="Próximo slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/15 backdrop-blur-sm text-white p-2.5 hover:bg-white/30 transition-all duration-200 border border-white/20"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Ir para slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === current ? "w-8 h-1.5 bg-primary" : "w-2 h-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 z-20 h-0.5 bg-primary/40 w-full">
          <div
            key={current}
            className="h-full bg-primary"
            style={{ animation: "progress 5.5s linear forwards" }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress { from { width: 0% } to { width: 100% } }
      `}</style>
    </section>
  );
}
