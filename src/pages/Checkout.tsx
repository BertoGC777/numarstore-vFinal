import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { useCart } from "@/context/CartContext";
import { useCoupon } from "@/context/CouponContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, MessageCircle, AlertCircle } from "lucide-react";
import { formatBRL } from "@/data/products";
import CouponInput from "@/components/CouponInput";
import Image from "@/components/Image";

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "5521979674510";

export default function Checkout() {
  const { items, subtotal, close, clear } = useCart();
  const { discount: couponDiscount } = useCoupon();
  const [loading, setLoading] = useState(false);

  const total = subtotal - couponDiscount;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Montar mensagem do WhatsApp com resumo do pedido
      const itemsList = items.map((i: any) =>
        `• ${i.name} (${i.color}, ${i.size}) x${i.quantity} - ${formatBRL(i.pricePix * i.quantity)}`
      ).join('\n');
      const msg = encodeURIComponent(
        `Olá! Gostaria de fazer um pedido no site.\n\n` +
        `*Itens:*\n${itemsList}\n\n` +
        `*Total: ${formatBRL(total)}*\n\n` +
        `Aguardo instruções para pagamento e entrega.`
      );

      // Limpar carrinho
      close();
      await clear();

      // Abrir WhatsApp
      window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
    } catch (e: unknown) {
      console.error("Erro ao abrir WhatsApp", e);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-numar py-20 text-center">
          <h1 className="font-serif text-3xl mb-4">Sua sacola está vazia</h1>
          <Link to="/catalogo"><Button>Ver produtos</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Finalizar Compra" description="Finalize seu pedido com segurança. Pagamento via WhatsApp, cartão em breve." />
      <div className="container-numar py-8 max-w-3xl">
        <nav className="text-xs text-muted-foreground flex items-center gap-1 mb-8">
          <Link to="/" className="hover:text-primary">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <span>Finalizar Compra</span>
        </nav>

        <h1 className="font-serif text-3xl mb-8">Finalizar Compra</h1>

        {/* Aviso temporário */}
        <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">⚠️ Pagamento via WhatsApp é temporário</h2>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Em breve, você poderá finalizar sua compra diretamente no site com pagamento integrado.
              </p>
            </div>
          </div>
        </div>

        {/* Resumo do carrinho */}
        <div className="border border-border rounded-lg p-6 mb-6">
          <h2 className="font-serif text-xl mb-4">Seus Itens</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={100}
                  aspectRatio="portrait"
                  objectFit="contain"
                  loading="lazy"
                  className="w-20 h-24 rounded shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium line-clamp-2">{item.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.color} · {item.size} · Qtd: {item.quantity}</p>
                  <p className="font-semibold text-primary mt-2">{formatBRL(item.pricePix * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cupom de desconto */}
        <CouponInput subtotal={subtotal} />

        {/* Resumo de valores */}
        <div className="border border-border rounded-lg p-6 mb-6">
          <h2 className="font-serif text-xl mb-4">Resumo de Valores</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto Cupom</span>
                <span>-{formatBRL(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-serif text-xl pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatBRL(total)}</span>
            </div>
          </div>
        </div>

        {/* Botão finalizar */}
        <Button 
          onClick={handleCheckout} 
          disabled={loading} 
          className="w-full h-12 uppercase tracking-widest gap-2 mb-4"
        >
          <MessageCircle className="h-4 w-4" />
          {loading ? "Processando..." : "Finalizar pelo WhatsApp"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Ao clicar, o WhatsApp abrirá com o resumo do seu pedido. Tudo será resolvido por lá.
        </p>
      </div>
    </Layout>
  );
}