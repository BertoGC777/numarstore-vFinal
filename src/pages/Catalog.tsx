import { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import { api } from "@/api/client";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";

// Normalize string for comparison: lowercase, remove accents, replace spaces with hyphens
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ""); // Remove special characters except hyphens
};

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

export default function Catalog() {
  const { categoria } = useParams<{ categoria?: string }>();
  const [searchParams] = useSearchParams();
  const subFromUrl = searchParams.get("sub") ?? "";

  const [sort, setSort] = useState("recent");
  const [price, setPrice] = useState<[number, number]>([0, 500]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [visible, setVisible] = useState(12);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let categoryParam = categoria;
        if (categoria === "lancamentos") categoryParam = "lancamentos";
        else if (categoria === "promocao") categoryParam = "promocao";
        
        const data = await api.products.list({ category: categoryParam });
        const mapped = data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description,
          category: p.category,
          subcategory: p.subcategory,
          pricePix: p.price_pix,
          priceCard: p.price_card,
          oldPrice: p.old_price,
          isNew: p.is_new === 1,
          isSale: p.is_sale === 1,
          discount: p.discount,
          images: p.images || [],
          colors: [],
          sizes: []
        }));
        setProducts(mapped);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoria]);

  // Título: subcategoria tem prioridade, depois categoria, depois padrão
  const title = subFromUrl
    ? subFromUrl
    : categoria
    ? categoryLabels[categoria] ?? "Catálogo"
    : "Todos os Produtos";

  const allColors = useMemo(() => {
    return Array.from(
      new Map(products.flatMap((p) => p.colors || []).map((c: any) => [c.name, c])).values()
    );
  }, [products]);

  const allSizes = useMemo(() => {
    return Array.from(new Set(products.flatMap((p) => p.sizes || [])));
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    // Filter by category from URL
    if (categoria) {
      const normalizedCategoria = normalizeString(categoria);
      list = list.filter((p) => {
        const normalizedCategory = normalizeString(p.category || "");
        const normalizedSubcategory = normalizeString(p.subcategory || "");
        
        // Special handling for lancamentos and promocao - already filtered by API
        if (normalizedCategoria === "lancamentos" || normalizedCategoria === "promocao") {
          return true;
        }
        
        // Check if the URL category matches either the main category or subcategory
        return normalizedCategory === normalizedCategoria || normalizedSubcategory === normalizedCategoria;
      });
    }

    // Filter by subcategory from URL query param
    if (subFromUrl) {
      const normalizedSubFromUrl = normalizeString(subFromUrl);
      list = list.filter((p) => {
        const normalizedSubcategory = normalizeString(p.subcategory || "");
        return normalizedSubcategory === normalizedSubFromUrl;
      });
    }

    // Filter by price
    list = list.filter((p) => p.pricePix >= price[0] && p.pricePix <= price[1]);

    // Filter by colors
    if (colors.length) list = list.filter((p) => p.colors?.some((c: any) => colors.includes(c.name)));

    // Filter by sizes
    if (sizes.length) list = list.filter((p) => p.sizes?.some((s: string) => sizes.includes(s)));

    // Sort
    if (sort === "asc") {
      list.sort((a, b) => a.pricePix - b.pricePix);
    } else if (sort === "desc") {
      list.sort((a, b) => b.pricePix - a.pricePix);
    }
    // "recent" keeps original order

    return list;
  }, [products, colors, sizes, categoria, subFromUrl, price, sort]);

  const toggle = (val: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);

  const clearFilters = () => {
    setColors([]);
    setSizes([]);
    setPrice([0, 500]);
    setMobileFilterOpen(false);
  };

  const activeFiltersCount = colors.length + sizes.length + (price[0] !== 0 || price[1] !== 500 ? 1 : 0);

  const Filters = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-8">
      <div>
        <h4 className="text-xs uppercase tracking-widest mb-3 font-semibold">Faixa de preço</h4>
        <Slider
          min={0} max={500} step={10}
          value={price}
          onValueChange={(v) => setPrice(v as [number, number])}
        />
        <div className="flex justify-between text-xs mt-2 text-muted-foreground">
          <span>R${price[0]}</span>
          <span>R${price[1]}</span>
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest mb-3 font-semibold">Cor</h4>
        <div className="flex flex-wrap gap-2">
          {allColors.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                toggle(c.name, colors, setColors);
                onClose?.();
              }}
              aria-label={c.name}
              title={c.name}
              className={`h-7 w-7 rounded-full border-2 transition-all ${
                colors.includes(c.name) ? "ring-2 ring-primary ring-offset-2 border-transparent" : "border-border"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest mb-3 font-semibold">Tamanho</h4>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button
              key={s}
              onClick={() => {
                toggle(s, sizes, setSizes);
                onClose?.();
              }}
              className={`h-9 min-w-[44px] px-3 border text-sm transition ${
                sizes.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Limpar filtros
      </Button>
    </div>
  );

  return (
    <Layout>
      <SEO
        title={title}
        description={`Explore ${filtered.length} produtos${categoria ? ` na categoria ${categoryLabels[categoria] ?? categoria}` : ""} na Numarstore.`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": title,
          "description": `Explore ${filtered.length} produtos na Numarstore.`,
        }}
      />
      <div className="container-numar py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {loading ? "Carregando..." : `${filtered.length} produto${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6 gap-4">
                  <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="md:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" /> Filtros {activeFiltersCount > 0 && <span className="ml-1 bg-primary text-white rounded-full text-xs px-1.5">{activeFiltersCount}</span>}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85%] sm:max-w-sm bg-background">
                      <SheetHeader>
                        <SheetTitle className="font-serif text-2xl">Filtros</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6"><Filters onClose={() => setMobileFilterOpen(false)} /></div>
                    </SheetContent>
                  </Sheet>

                  <div className="ml-auto">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="bg-background border border-border px-3 py-2 text-sm"
                    >
                      <option value="recent">Mais Recentes</option>
                      <option value="asc">Menor Preço</option>
                      <option value="desc">Maior Preço</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                  <aside className="hidden md:block"><Filters /></aside>

                  <div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                      {filtered.slice(0, visible).map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                    {visible < filtered.length && (
                      <div className="text-center mt-10">
                        <Button
                          variant="outline"
                          onClick={() => setVisible((v) => v + 12)}
                          className="text-xs uppercase tracking-wider md:text-sm md:tracking-widest h-10 md:h-12 px-6"
                        >
                          Ver mais ({filtered.length - visible} produtos)
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
