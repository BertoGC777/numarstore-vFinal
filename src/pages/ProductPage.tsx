import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Image from "@/components/Image";
import { products, getRelated, formatBRL, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Price from "@/components/Price";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, MessageCircle, ChevronRight, CreditCard, Banknote, QrCode, Shield, Truck, RotateCcw } from "lucide-react";
import ProductReviews from "@/components/ProductReviews";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);

  // Find product directly from local data
  const product = products.find(p => p.slug === slug);
  const related = product ? getRelated(product.id, 4) : [];
  const [size, setSize] = useState(product?.sizes[0] || "");

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

  const numColors = useMemo(() => product.colors?.length || 0, [product]);
  const currentMainImg = useMemo(
    () => product.images[colorIdx] ?? product.images[0],
    [product, colorIdx]
  );
  const galleryImages = useMemo(() => product.images, [product]);
  const wpp = useMemo(() => {
    const colorName = product.colors?.[colorIdx]?.name || "";
    const msg = `Olá! Tenho interesse no produto: *${product.name}*${colorName ? ` - Cor: ${colorName}` : ""}\n${window.location.href}`;
    return `https://wa.me/5521979674510?text=${encodeURIComponent(msg)}`;
  }, [product, colorIdx]);

  const handleColorChange = (i: number) => {
    setColorIdx(i);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images[0],
    "offers": {
      "@type": "Offer",
      "priceCurrency": "BRL",
      "price": product.pricePix,
      "availability": "https://schema.org/InStock"
    },
    "brand": { "@type": "Brand", "name": "Numar Store" },
    "category": product.category?.replace(/-/g, " ") || ""
  };

  return (
    <Layout>
      <SEO title={product.name} description={product.description} image={product.images[0]} type="product" price={product.pricePix} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-numar py-6">
        {/* Breadcrumb */}
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
          {/* Gallery */}
          <div className="flex gap-3">
            {/* Thumbnails - Desktop */}
            <div className="hidden md:flex flex-col gap-2 w-20 shrink-0 max-h-[600px] overflow-y-auto">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i < numColors) handleColorChange(i);
                  }}
                  className={`shrink-0 border-2 transition ${
                    currentMainImg === img ? "border-primary" : "border-transparent hover:border-muted-foreground"
                  }`}
                  aria-label={`Ver imagem ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt=""
                    width={80}
                    height={107}
                    aspectRatio="portrait"
                    objectFit="cover"
                    loading="lazy"
                    className="w-20"
                  />
                </button>
              ))}
            </div>
            
            {/* Main image */}
            <div className="flex-1">
              <Image
                key={`${product.id}-${colorIdx}`}
                src={currentMainImg}
                alt={product.name}
                width={600}
                height={800}
                aspectRatio="portrait"
                objectFit="contain"
                loading="eager"
                fetchPriority="high"
                className="w-full"
              />
            </div>

            {/* Mobile horizontal thumbnails */}
            <div className="flex md:hidden gap-2 overflow-x-auto mt-2 pb-1">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i < numColors) handleColorChange(i);
                  }}
                  className={`shrink-0 border-2 transition ${
                    currentMainImg === img ? "border-primary" : "border-transparent hover:border-muted-foreground"
                  }`}
                  aria-label={`Ver imagem ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt=""
                    width={64}
                    height={85}
                    aspectRatio="portrait"
                    objectFit="cover"
                    loading="lazy"
                    className="w-16 h-20"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div>
            <h1 className="font-serif text-3xl md:text-4xl mb-3">{product.name}</h1>

            {/* Price block */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <Price value={product.pricePix} className="text-4xl md:text-3xl font-serif text-primary font-semibold" />
                <span className="text-sm text-muted-foreground">no Pix</span>
                {product.oldPrice && (
                  <Price value={product.oldPrice} className="text-sm text-muted-foreground line-through ml-2" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>ou <Price value={product.priceCard} showLabel /> em até 3x sem juros</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Banknote className="h-4 w-4" />
                <span>ou boleto bancário</span>
              </div>
            </div>

            {/* Color selector */}
            {numColors > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest mb-3">
                  Cor: <strong className="text-foreground">{product.colors?.[colorIdx]?.name || ""}</strong>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors?.map((c: any, i: number) => (
                    <button
                      key={c.name}
                      onClick={() => handleColorChange(i)}
                      aria-label={c.name}
                      title={c.name}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${
                        i === colorIdx
                          ? "ring-2 ring-primary ring-offset-2 border-transparent scale-110"
                          : "border-border hover:border-foreground hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest mb-3">Tamanho</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-11 min-w-[48px] px-3 border text-sm transition font-medium ${
                      size === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-muted transition" aria-label="Diminuir">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-6 text-sm font-medium">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:bg-muted transition" aria-label="Aumentar">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Action buttons - Desktop */}
            <div className="space-y-3 hidden md:flex">
              <Button
                onClick={() => addItem(product, product.colors?.[colorIdx]?.name || "", size, qty)}
                className="w-full h-12 uppercase tracking-widest text-sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Adicionar à Sacola
              </Button>
              <a
                href={wpp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 border border-primary bg-primary/5 text-primary uppercase tracking-widest text-sm hover:bg-primary hover:text-background transition"
              >
                <MessageCircle className="h-4 w-4" />
                Comprar pelo WhatsApp
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex md:grid md:grid-cols-3 gap-2 mt-6 pt-4 border-t border-border overflow-x-auto pb-2">
              <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground shrink-0 w-24">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-center">Frete Grátis</span>
                <span className="text-center">acima de R$300</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground shrink-0 w-24">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-center">Pagamento</span>
                <span className="text-center">100% seguro</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground shrink-0 w-24">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span className="text-center">Trocas</span>
                <span className="text-center">em 30 dias</span>
              </div>
            </div>

            {/* Accordion details */}
            <Accordion type="single" collapsible className="mt-6 pb-20 md:pb-0">
              <AccordionItem value="desc">
                <AccordionTrigger className="text-sm">Descrição</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{product.description}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="comp">
                <AccordionTrigger className="text-sm">Composição e cuidados</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Tecido de alta qualidade com acabamentos cuidadosos. Lavar à mão com água fria. Não usar alvejante. Não torcer.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ent">
                <AccordionTrigger className="text-sm">Entrega e trocas</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Enviamos para todo o Brasil. Frete grátis em compras acima de R$300. Prazo de 3 a 8 dias úteis. Trocas aceitas em até 30 dias após o recebimento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Mobile sticky action buttons */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t md:hidden z-30">
              <div className="space-y-3">
                <Button
                  onClick={() => addItem(product, product.colors?.[colorIdx]?.name || "", size, qty)}
                  className="w-full h-12 uppercase tracking-widest text-sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Adicionar à Sacola
                </Button>
                <a
                  href={wpp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-12 border border-primary bg-primary/5 text-primary uppercase tracking-widest text-sm hover:bg-primary hover:text-background transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  Comprar pelo WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-serif text-3xl text-center mb-8">Você também vai amar</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Product Reviews */}
        <section className="mt-20">
          <ProductReviews productId={product.id} />
        </section>
      </div>
    </Layout>
  );
}
