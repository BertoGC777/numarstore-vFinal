import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import Price from "@/components/Price";
import Image from "@/components/Image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { calculateShipping } from "@/utils/shipping";

export default function CartDrawer() {
  const { isOpen, close, items, updateQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();
  const [cep, setCep] = useState("");
  const [shipping, setShipping] = useState<string | null>(null);

  useEffect(() => {
    const savedCep = localStorage.getItem("numar.cep");
    if (savedCep) {
      setCep(savedCep);
    } else {
      setShipping("Calcule no checkout");
    }
  }, []);

  useEffect(() => {
    const savedCep = localStorage.getItem("numar.cep");
    if (savedCep && items.length > 0) {
      const pesoTotal = items.reduce((acc, item) => acc + (item.quantity * 0.5), 0);
      const result = calculateShipping(savedCep, pesoTotal, subtotal);
      const option = result.options[0];
      if (option) {
        setShipping(option.free ? "Frete grátis ✨" : `${option.name} — ${option.days}`);
      }
    }
  }, [items, subtotal]);

  const calcShipping = () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setShipping("CEP inválido");
      return;
    }
    localStorage.setItem("numar.cep", cleanCep);
    const pesoTotal = items.reduce((acc, item) => acc + (item.quantity * 0.5), 0);
    const result = calculateShipping(cleanCep, pesoTotal, subtotal);
    const option = result.options[0];
    if (option) {
      setShipping(option.free ? "Frete grátis ✨" : `${option.name} — ${option.days}`);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-background p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="font-serif text-2xl">Sua sacola ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Sua sacola está vazia</p>
            <Button onClick={close} variant="default">Continuar comprando</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b">
                  <Link to={`/produto/${item.slug}`} onClick={close} className="shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={112}
                      aspectRatio="portrait"
                      objectFit="contain"
                      loading="lazy"
                      className="w-20 h-28"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/produto/${item.slug}`} onClick={close} className="text-sm font-medium hover:text-primary line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cor: {item.color} · Tam: {item.size}
                    </p>
                    <Price value={item.pricePix} />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border">
                        <button
                          className="p-1.5 hover:bg-muted"
                          onClick={() => updateQty(Number(item.id), item.quantity - 1)}
                          aria-label="Diminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          className="p-1.5 hover:bg-muted"
                          onClick={() => updateQty(Number(item.id), item.quantity + 1)}
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(Number(item.id))}
                        aria-label="Remover"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t px-6 py-4 space-y-3 bg-muted/30">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Calcular frete</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  <Button variant="outline" onClick={calcShipping} disabled={!cep.trim()}>
                    {shipping ? "Calcular" : "OK"}
                  </Button>
                </div>
                {shipping && <p className="text-xs mt-1 text-foreground/80">{shipping}</p>}
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm">Subtotal</span>
                <span className="font-serif text-2xl text-primary">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Pagamento via WhatsApp. Cartão em breve.</p>
              <Button onClick={() => { close(); navigate("/checkout"); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-sm uppercase tracking-wider">
                Finalizar Compra
              </Button>
              <Button variant="ghost" className="w-full" onClick={close}>
                Continuar comprando
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}