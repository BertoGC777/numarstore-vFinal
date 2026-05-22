import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import { products as fallbackProducts } from "@/data/products";
import { mapApiProduct } from "@/lib/productApi";
import { api } from "@/api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

const categoryLabels: Record<string, string> = {
  vestidos: "Vestidos",
  "vestidos-longos": "Vestidos Longos",
  "vestidos-curtos": "Vestidos Curtos",
  biquinis: "Biquínis",
  "partes-de-cima": "Partes de Cima",
  "partes-de-baixo": "Partes de Baixo",
  conjuntos: "Conjuntos",
  lancamentos: "Lançamentos",
  promocao: "Promoção",
};

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").toLowerCase();
  const [localQuery, setLocalQuery] = useState(q);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalQuery(q);
  }, [q]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!localQuery) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await api.products.search(localQuery);
        setResults(data.map((p: Record<string, unknown>) => mapApiProduct(p)));
      } catch (err: any) {
        console.error("Erro ao buscar produtos:", err);
        setError(err.message || "Erro ao buscar produtos");
        const fallback = fallbackProducts.filter((p) => p.name.toLowerCase().includes(localQuery) || p.category.includes(localQuery));
        setResults(fallback);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (localQuery) fetchResults();
    }, 500);

    return () => clearTimeout(timer);
  }, [localQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setParams({ q: localQuery });
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/catalogo/${category}`);
  };

  return (
    <Layout>
      <SEO
        title={q ? `Resultados para "${q}"` : "Buscar produtos"}
        description={q ? `${results.length} produto${results.length !== 1 ? "s" : ""} encontrado${results.length !== 1 ? "s" : ""} para "${q}" na Numarstore.` : "Busque produtos na Numarstore."}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": q ? "SearchResultsPage" : "WebPage",
          "name": q ? `Resultados para "${q}"` : "Buscar produtos",
        }}
      />
      <div className="container-numar py-12">
        <h1 className="font-serif text-4xl mb-6">{q ? `Resultados para "${q}"` : "Buscar produtos"}</h1>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Digite o nome do produto..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Category Suggestions when no query */}
        {!localQuery && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Sugestões de categorias</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  className="px-4 py-2 border border-border rounded-full text-sm hover:border-primary hover:text-primary transition"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && localQuery && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">Exibindo resultados offline.</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && localQuery && (
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
