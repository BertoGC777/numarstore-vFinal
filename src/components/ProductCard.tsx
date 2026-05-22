import React, { useState } from "react";
import { memo } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { formatBRL } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import QuickView from "./QuickView";
import Price from "./Price";
import Image from "./Image";

const ProductCard = React.memo(function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [colorIdx, setColorIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const numColors = product.colors.length;
  // Primary image for selected color
  const mainImg = product.images?.[colorIdx] || product.images?.[0] || "/placeholder.jpg";
  // Hover image: second photo of same color (stored at colorIdx + numColors), or same image
  const hoverImg = product.images?.[colorIdx + numColors] || mainImg;

  const handleColorClick = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    setColorIdx(i);
  };

  return (
    <div className="group opacity-0 animate-in fade-in duration-300" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden bg-muted aspect-[3/4] cursor-pointer">
        <Image
          key={`main-${colorIdx}`}
          src={mainImg}
          alt={product.name}
          width={400}
          height={533}
          aspectRatio="portrait"
          objectFit="contain"
          loading="lazy"
          className={hovered ? "opacity-0" : "opacity-100"}
        />
        {hovered && (
          <Image
            key={`hover-${colorIdx}`}
            src={hoverImg}
            alt=""
            width={400}
            height={533}
            aspectRatio="portrait"
            objectFit="contain"
            loading="lazy"
            className="absolute inset-0 opacity-100"
          />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-green-600 text-white text-[10px] uppercase tracking-wider px-2 py-1 font-semibold">NOVO</span>
          )}
          {product.isSale && (
            <span className="bg-red-600 text-white text-[10px] uppercase tracking-wider px-2 py-1 font-semibold">PROMO</span>
          )}
          {product.outOfStock && (
            <span className="bg-muted-foreground text-white text-[10px] uppercase tracking-wider px-2 py-1">Esgotado</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (inWishlist) {
              removeFromWishlist(product.id);
            } else {
              addToWishlist(product);
            }
          }}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition z-10"
          aria-label={inWishlist ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
      </Link>

      <div className="pt-3 space-y-2">
        <Link to={`/produto/${product.slug}`} className="block text-sm font-medium hover:text-primary line-clamp-2">
          {product.name}
        </Link>

        <div>
          <Price value={product.pricePix} /> <span className="text-xs text-muted-foreground">no Pix</span>
          <p className="text-xs text-muted-foreground">ou <Price value={product.priceCard} /> em até 3x</p>
        </div>

        {numColors > 1 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={(e) => handleColorClick(e, i)}
                  aria-label={c.name}
                  title={c.name}
                  className={`h-5 w-5 rounded-full border-2 transition-all ${
                    i === colorIdx
                      ? "ring-2 ring-primary ring-offset-1 border-transparent scale-110"
                      : "border-border hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{product.colors[colorIdx].name}</p>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 uppercase tracking-wider text-xs border-foreground hover:bg-foreground hover:text-background transition md:opacity-0 md:group-hover:opacity-100 md:transition-opacity"
          onClick={() => addItem(product, product.colors[colorIdx].name, product.sizes[0], 1)}
        >
          Adicionar
        </Button>
      </div>

      <QuickView product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </div>
  );
});

export default ProductCard;
