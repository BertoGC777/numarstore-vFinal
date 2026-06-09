import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Image from "@/components/Image";
import { formatBRL, type Product } from "@/data/products";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/productApi";
import ProductCard from "@/components/ProductCard";
import Price from "@/components/Price";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, MessageCircle, ChevronRight, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import ProductReviews from "@/components/ProductReviews";

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "5521979674510";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [colorIdx, setColorIdx] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug).then((p) => {
      setProduct(p);
      setSize(p?.sizes?.[0] || "");
      setColorIdx(0);
      setLoading(false);
      if (p) fetchRelatedProducts(slug).then(setRelated);
    });
  }, [slug]);

  const numColors = product?.colors?.length || 0;
  const galleryImages = product?.images ?? [];

  // Filter images for the selected color
  const getImagesForColor = (colorIndex: number) => {
    if (numColors === 0) return galleryImages;
    return galleryImages.filter((_, i) => i % numColors === colorIndex);
  };

  const currentColorImages = getImagesForColor(colorIdx);
  const currentMainImg = currentColorImages[imageIndex] ?? currentColorImages[0];

  // Navigation handlers
  const handlePrevImage = () => {
    const totalImages = currentColorImages.length;
    setImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const totalImages = currentColorImages.length;
    setImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const handleImageClick = (idx: number) => {
    setImageIndex(idx);
  };

  // Reset image index when color changes
  const handleColorChange = (i: number) => {
    setColorIdx(i);
    setImageIndex(0);
  };

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePrevImage();
    }
  };
  const wpp = useMemo(() => {
    if (!product) return "";
    const colorName = product.colors?.[colorIdx]?.name || "";
    const url = typeof window !== "undefined" ? window.location.href : "";
    const msg = `Olá! Tenho interesse no produto: *${product.name}*${colorName ? ` - Cor: ${colorName}` : ""}\n${url}`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }, [product, colorIdx]);

  if (loading) {
    return (
      <Layout>
        <div className="container-numar py-20 flex justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <SEO title="Produto não encontrado" description="Produto não encontrado" />
        <div className="container-numar py-20 text-center">
          <h1 className="font-serif text-3xl mb-4">Produto não encontrado</h1>
          <p className="text-muted-foreground mb-6">O produto "{slug}" não foi encontrado em nosso catálogo.</p>
          <Link to="/catalogo" className="text-primary underline">Ver catálogo</Link>
        </div>
      </Layout>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.[0] || "",
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.pricePix,
      availability: product.outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
    brand: { "@type": "Brand", name: "Numar Store" },
    category: product.category?.replace(/-/g, " ") || "",
  };

  return (
    <Layout>
      <SEO title={product.name} description={product.description} image={product.images[0]} type="product" price={product.pricePix} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-numar py-6">
        <nav className="text-xs text-muted-foreground flex items-center gap-1 mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/catalogo/${product.category}`} className="hover:text-primary capitalize">
            {product.category?.replace(/-/g, " ") || ""}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          <div className="flex gap-3">
            <div className="hidden md:flex flex-col gap-2 w-20 shrink-0 max-h-[600px] overflow-y-auto">
              {currentColorImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => handleImageClick(i)}
                  className={`shrink-0 border-2 transition ${
                    currentMainImg === img ? "border-primary" : "border-transparent hover:border-muted-foreground"
                  }`}
                >
                  <Image src={img} alt="" aspectRatio="square" objectFit="cover" className="w-full" />
                </button>
              ))}
            </div>
            <div className="flex-1 relative group">
              <div 
                className="relative bg-muted aspect-[3/4]"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {product.outOfStock && (
                  <span className="absolute top-3 left-3 z-10 bg-muted-foreground text-white text-xs px-2 py-1 rounded">
                    Esgotado
                  </span>
                )}
                <Image src={currentMainImg} alt={product.name} aspectRatio="portrait" objectFit="contain" className="w-full h-full" loading="eager" />
                
                {/* Navigation arrows - desktop only, appear on hover */}
                {currentColorImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                      aria-label="Imagem anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                      aria-label="Próxima imagem"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Dots indicator - mobile only */}
              {currentColorImages.length > 1 && (
                <div className="md:hidden flex justify-center gap-2 mt-3">
                  {currentColorImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleImageClick(i)}
                      className={`w-2 h-2 rounded-full transition ${
                        i === imageIndex ? "bg-primary" : "bg-muted-foreground"
                      }`}
                      aria-label={`Imagem ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="font-serif text-3xl md:text-4xl mb-2">{product.name}</h1>
            <Price value={product.pricePix} className="mb-6" />

            {numColors > 0 && (
              <div className="mb-4">
                <p className="text-sm mb-2">Cor: <strong>{product.colors?.[colorIdx]?.name}</strong></p>
                <div className="flex gap-2 flex-wrap">
                  {(product.colors || []).map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => handleColorChange(i)}
                      title={c.name}
                      className={`w-8 h-8 rounded-full border-2 transition ${colorIdx === i ? "border-primary scale-110" : "border-border"}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm mb-2">Tamanho</p>
              <div className="flex gap-2 flex-wrap">
                {(product.sizes || []).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 border rounded text-sm transition ${size === s ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm">Quantidade</span>
              <div className="flex items-center border border-border rounded">
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2" aria-label="Diminuir">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 min-w-[2rem] text-center">{qty}</span>
                <button type="button" onClick={() => setQty(qty + 1)} className="px-3 py-2" aria-label="Aumentar">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                className="flex-1 h-12 uppercase tracking-widest"
                onClick={() => addItem(product, product.colors?.[colorIdx]?.name || "Único", size, qty)}
              >
                Adicionar à Sacola
              </Button>
              <Button variant="outline" className="flex-1 h-12 gap-2" asChild>
                <a href={wpp} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" /> Comprar pelo WhatsApp
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground mb-8">
              <div className="flex flex-col items-center gap-1"><Shield className="h-5 w-5" /><span>Compra segura</span></div>
              <div className="flex flex-col items-center gap-1"><Truck className="h-5 w-5" /><span>Envio para todo BR</span></div>
              <div className="flex flex-col items-center gap-1"><RotateCcw className="h-5 w-5" /><span>Troca fácil</span></div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="desc">
                <AccordionTrigger>Descrição</AccordionTrigger>
                <AccordionContent><p className="text-sm text-muted-foreground">{product.description}</p></AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger>Composição e cuidados</AccordionTrigger>
                <AccordionContent><p className="text-sm text-muted-foreground">Siga as instruções da etiqueta. Lavar à mão ou ciclo delicado.</p></AccordionContent>
              </AccordionItem>
              <AccordionItem value="ship">
                <AccordionTrigger>Entrega e trocas</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    Envio via Correios ou entrega local (RJ). Consulte nossa{" "}
                    <Link to="/trocas-e-devolucoes" className="text-primary underline">política de trocas</Link>.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <ProductReviews productId={product.id} />

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl mb-6">Você também vai amar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
