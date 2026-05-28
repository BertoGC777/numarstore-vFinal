import { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import { fetchAllProducts } from "@/lib/productApi";
import { api } from "@/api/client";
import type { Product } from "@/data/products";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import biquini from "@/assets/products/biquini-rosa.jpeg";
import blusinha from "@/assets/products/blusinha1-vermelha.jpeg";
import saia from "@/assets/products/saia-longa-preta-1.jpeg";
import conjunto from "@/assets/products/conjunto-cropped-saia-1.jpeg";
import vestidoLongo from "@/assets/products/vestido-sereia-rosa-1.jpg";
import vestidoCurto from "@/assets/products/vestido-brisa-rosa-1.jpg";
import promo from "@/assets/products/cropped2-amarelo.jpeg";
import Image from "@/components/Image";

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

const categoryImages: Record<string, string> = {
  biquinis: biquini,
  "partes-de-cima": blusinha,
  "partes-de-baixo": saia,
  conjuntos: conjunto,
  "vestidos-longos": vestidoLongo,
  "vestidos-curtos": vestidoCurto,
  lancamentos: promo,
  promocao: promo,
};

export default function Catalog() {
  const { categoria } = useParams<{ categoria?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const subFromUrl = searchParams.get("sub") ?? "";

  const [sort, setSort] = useState("recent");
  const [price, setPrice] = useState<[number, number]>([0, 500]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [visible, setVisible] = useState(12);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (categoria && categoria !== "todos" && categoria !== "lancamentos" && categoria !== "promocao") {
      fetchSubcategories(categoria);
    } else {
      setSubcategories([]);
    }
  }, [categoria]);

  const fetchSubcategories = async (categorySlug: string) => {
    const token = localStorage.getItem("numar.token");
    if (!token) {
      setSubcategories([]);
      return;
    }
    try {
      const data = await api.get(`/admin/subcategories/${categorySlug}`);
      if (!data) return;
      setSubcategories(data.subcategories || []);
    } catch (err: any) {
      console.error("Error fetching subcategories:", err);
      setSubcategories([]);
    }
  };

  const handleSubcategoryClick = (subSlug: string) => {
    if (subFromUrl === subSlug) {
      // Deselect
      setSearchParams({});
    } else {
      setSearchParams({ sub: subSlug });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (categoria && categoria !== "todos") {
      if (categoria === "lancamentos") params.new = "1";
      else if (categoria === "promocao") params.sale = "1";
      else params.category = categoria;
    }
    if (subFromUrl) params.sub = subFromUrl;
    // Chamar fetchAllProducts sem localProducts
    fetchAllProducts(params)
      .then((list) => {
        setAllProducts(list);
      })
      .catch((err) => {
        console.error("Erro ao buscar produtos da API:", err);
        setAllProducts([]); // Em caso de erro, mostre uma lista vazia
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoria, subFromUrl]);

  // Título: subcategoria tem prioridade, depois categoria, depois padrão
  const title = subFromUrl
    ? subFromUrl
    : categoria
    ? categoryLabels[categoria] ?? "Catálogo"
    : "Todos os Produtos";

  const allColors = useMemo(() => {
    return Array.from(
      new Map(allProducts.flatMap((p) => p.colors || []).map((c: any) => [c.name, c])).values()
    );
  }, [allProducts]);

  const allSizes = useMemo(() => {
    return Array.from(new Set(allProducts.flatMap((p) => p.sizes || [])));
  }, [allProducts]);

  const filtered = useMemo(() => {
    let list = [...allProducts];

    // Filter by category from URL
    if (categoria) {
      const normalizedCategoria = normalizeString(categoria);
      list = list.filter((p) => {
        const normalizedCategory = normalizeString(p.category || "");
        const normalizedSubcategory = normalizeString(p.subcategory || "");
        
        // Special handling for lancamentos and promocao
        if (normalizedCategoria === "lancamentos") {
          return p.isNew === true;
        }
        if (normalizedCategoria === "promocao") {
          return p.isSale === true;
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
  }, [allProducts, colors, sizes, categoria, subFromUrl, price, sort]);

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
      <div className="container-numar pt-6 pb-2">
        <nav className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
          <Link to="/">Início</Link>
          <span>/</span>
          <span>{title}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl md:text-4xl">{title}</h1>
          <span className="text-sm text-muted-foreground">{filtered.length} produtos</span>
        </div>
      </div>

      <div className="container-numar py-8 md:py-12">
        {/* Subcategory chips */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={!subFromUrl ? "default" : "outline"}
              size="sm"
              onClick={() => handleSubcategoryClick("")}
            >
              Todos
            </Button>
            {subcategories.map((sub) => (
              <Button
                key={sub.id}
                variant={subFromUrl === sub.slug ? "default" : "outline"}
                size="sm"
                onClick={() => handleSubcategoryClick(sub.slug)}
              >
                {sub.name}
              </Button>
            ))}
          </div>
        )}

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
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="bg-muted aspect-[3/4] rounded-lg animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="mb-4">Não encontramos produtos com esses filtros. Que tal explorar nossa coleção completa?</p>
                <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
