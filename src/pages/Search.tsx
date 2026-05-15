import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import { products as fallbackProducts } from "@/data/products";
import { api } from "@/api/client";

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").toLowerCase();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!q) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await api.products.search(q);
        const mapped = data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category,
          subcategory: p.subcategory,
          pricePix: p.price_pix,
          priceCard: p.price_card,
          oldPrice: p.old_price,
          isNew: !!p.is_new,
          isSale: !!p.is_sale,
          discount: p.discount,
          colors: p.colors || [],
          sizes: p.sizes || [],
          images: p.images?.map((img: any) => img.url) || [],
          description: p.description,
        }));
        setResults(mapped);
      } catch (err: any) {
        console.error("Erro ao buscar produtos:", err);
        setError(err.message || "Erro ao buscar produtos");
        const fallback = fallbackProducts.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q));
        setResults(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [q]);

  return (
    <Layout>
      <SEO
        title={`Resultados para "${q}"`}
        description={`${results.length} produto${results.length !== 1 ? "s" : ""} encontrado${results.length !== 1 ? "s" : ""} para "${q}" na Numarstore.`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          "name": `Resultados para "${q}"`,
        }}
      />
      <div className="container-numar py-12">
        <h1 className="font-serif text-4xl mb-2">Resultados para "{q}"</h1>
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando produtos...</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">Exibindo resultados offline.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-8">{results.length} produto{results.length !== 1 && "s"} encontrado{results.length !== 1 && "s"}</p>
            {results.length === 0 ? (
              <p className="text-center py-20 text-muted-foreground">Nenhum produto encontrado.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {results.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
