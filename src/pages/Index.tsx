import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryShortcuts from "@/components/CategoryShortcuts";
import BenefitsBar from "@/components/BenefitsBar";
import CollectionsGrid from "@/components/CollectionsGrid";
import ProductCard from "@/components/ProductCard";
import SaleBanner from "@/components/SaleBanner";
import InstagramSection from "@/components/InstagramSection";
import { getFeatured as getFeaturedFallback } from "@/data/products";
import { Link } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const featured = getFeaturedFallback(8);
  const [showMore, setShowMore] = useState(false);

  return (
    <Layout>
      <SEO
        title="Moda Feminina"
        description="Descubra as últimas tendências da moda feminina na Numarstore. Vestidos, biquínis, conjuntos e muito mais com qualidade e elegância."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Numar Store",
          "url": "https://numarstore.com.br",
          "logo": "https://numarstore.com.br/logo.png",
          "description": "Moda feminina sofisticada — vestidos, biquínis, conjuntos e muito mais.",
          "sameAs": [
            "https://instagram.com/use.numar",
            "https://wa.me/5521979674510",
          ],
        }}
      />
      <HeroCarousel />
      <CategoryShortcuts />
      <BenefitsBar />
      <CollectionsGrid />

      <section className="container-numar py-8">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-2">Selecionados</p>
          <h2 className="font-serif text-3xl md:text-4xl">Destaques da Semana</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {(showMore ? featured : featured.slice(0, 4)).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-10 flex flex-col md:flex-row gap-4 justify-center items-center">
          {!showMore && (
            <button
              onClick={() => setShowMore(true)}
              className="inline-block border border-foreground px-8 py-3 text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition"
            >
              Ver mais
            </button>
          )}
          <Link to="/catalogo" className="inline-block border border-foreground px-8 py-3 text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition">
            Ver todos os produtos
          </Link>
        </div>
      </section>

      <SaleBanner />
      <InstagramSection />
    </Layout>
  );
};

export default Index;
