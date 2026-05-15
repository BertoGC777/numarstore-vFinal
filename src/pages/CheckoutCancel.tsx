import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { XCircle, ShoppingBag } from "lucide-react";

export default function CheckoutCancel() {
  return (
    <Layout>
      <SEO title="Pagamento Cancelado" description="Seu pagamento foi cancelado." />
      <div className="container-numar py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-4">Pagamento Cancelado</h1>
          <p className="text-muted-foreground mb-8">
            Seu pagamento foi cancelado. Sua sacola ainda está disponível para você tentar novamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/checkout">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Voltar à Sacola
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/catalogo">Ver Produtos</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
