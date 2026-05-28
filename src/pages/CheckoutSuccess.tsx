import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, MessageCircle } from "lucide-react";
import { useCart } from '@/context/CartContext';

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "5521979674510";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("order");
  const { clear } = useCart();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Erro ao buscar pedido:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      clear();
    }
  }, [orderId, clear]);

  if (loading) {
    return (
      <Layout>
        <SEO title="Carregando Pedido" description="Carregando informações do pedido..." />
        <div className="container-numar py-20 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-muted-foreground">Carregando informações do pedido...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Pedido Recebido" description="Seu pedido foi registrado com sucesso." />
      <div className="container-numar py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-green-50 dark:bg-green-950/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-4">Pedido registrado!</h1>
          <p className="text-muted-foreground mb-4">
            Enviamos o resumo para o WhatsApp da loja. Nossa equipe vai confirmar disponibilidade, frete e forma de pagamento (Mercado Pago em breve).
          </p>
          {orderId && (
            <p className="text-sm font-mono bg-muted px-3 py-2 rounded mb-6 inline-block">
              Pedido: {orderId.slice(0, 8)}…
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  order 
                    ? `Olá! Meu pedido #${orderId.substring(0,8).toUpperCase()} foi confirmado. Nome: ${order.customer_name}. Total: R$ ${order.total}.`
                    : "Olá! Acabei de fazer um pedido no site e gostaria de confirmar."
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Falar no WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar para Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
