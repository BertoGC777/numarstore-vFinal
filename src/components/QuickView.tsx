import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatBRL, Product } from '@/data/products';
import Price from '@/components/Price';
import Image from '@/components/Image';
import { X, Plus, Minus } from 'lucide-react';

interface QuickViewProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export default function QuickView({ product, open, onClose }: QuickViewProps) {
  const { addItem } = useCart();
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState(product?.sizes[0] || '');
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const currentColor = product.colors?.[colorIdx];
  const currentImage = product.images[colorIdx] || product.images[0];

  const handleAddToCart = () => {
    addItem(product, currentColor?.name || '', size, qty);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 hover:bg-background"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-muted">
            <Image
              src={currentImage}
              alt={product.name}
              aspectRatio="portrait"
              objectFit="contain"
              loading="eager"
              fetchPriority="high"
              className="w-full h-full"
            />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            <h2 className="font-serif text-2xl mb-2">{product.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">{product.category}</p>

            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Price value={product.pricePix} className="text-2xl font-serif text-primary" />
                {product.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatBRL(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Cor: {currentColor?.name}</p>
                <div className="flex gap-2">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setColorIdx(idx)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        colorIdx === idx ? 'border-primary ring-2 ring-primary/50' : 'border-border'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-4 py-2 border rounded-md text-sm ${
                        size === s
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Quantidade</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 uppercase tracking-widest mt-auto"
            >
              Adicionar à Sacola
            </Button>

            {/* Trust badges */}
            <div className="flex justify-center gap-6 mt-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-green-600">✓</span>
                <span>Frete grátis acima de R$300</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600">✓</span>
                <span>Trocas em 30 dias</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
