import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <Layout>
      <SEO title="Pedido Confirmado" description="Seu pedido foi confirmado com sucesso." />
      <div className="container-numar py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-green-50 dark:bg-green-950/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-4">Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-8">
            Você receberá um e-mail com os detalhes do seu pedido em breve.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar para Home
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
