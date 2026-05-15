import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <SEO
        title="Página não encontrada"
        description="A página que você está procurando não existe ou foi movida."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Página não encontrada",
        }}
      />
      <div className="container-numar py-24 text-center flex flex-col items-center">
        <p className="font-serif text-8xl text-primary/20 mb-4 leading-none">404</p>
        <h1 className="font-serif text-3xl md:text-4xl mb-3">Página não encontrada</h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-sm">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button asChild>
            <Link to="/">Voltar ao início</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/catalogo">
              <Search className="h-4 w-4 mr-2" /> Ver produtos
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
