import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { MessageCircle } from "lucide-react";

export default function Trocas() {
  return (
    <Layout>
      <SEO
        title="Trocas e Devoluções"
        description="Política de trocas e devoluções da Numarstore. Saiba como solicitar trocas em até 30 dias após o recebimento."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Trocas e Devoluções",
        }}
      />
      <div className="container-numar py-12 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl mb-8">Trocas e Devoluções</h1>

        <div className="space-y-8">
          <div className="border border-border p-6">
            <h2 className="font-serif text-xl mb-3">📦 Prazo para troca</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Você tem até <strong className="text-foreground">30 dias</strong> após o recebimento do produto para solicitar a troca ou devolução.</p>
          </div>

          <div className="border border-border p-6">
            <h2 className="font-serif text-xl mb-3">✅ Condições para troca</h2>
            <ul className="text-sm leading-relaxed text-muted-foreground space-y-2">
              <li>• Produto sem uso, sem lavagem</li>
              <li>• Etiqueta original ainda afixada</li>
              <li>• Embalagem original (se possível)</li>
              <li>• Nota fiscal ou comprovante de compra</li>
            </ul>
          </div>

          <div className="border border-border p-6">
            <h2 className="font-serif text-xl mb-3">🔄 Como solicitar</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">Entre em contato pelo WhatsApp informando o número do pedido e o motivo da troca. Nossa equipe irá te orientar sobre o envio.</p>
            <a
              href="https://wa.me/5521979674510?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20uma%20troca%20ou%20devolu%C3%A7%C3%A3o."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest hover:bg-primary/90 transition"
            >
              <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </div>

          <div className="border border-border p-6">
            <h2 className="font-serif text-xl mb-3">❌ Não aceitamos troca quando</h2>
            <ul className="text-sm leading-relaxed text-muted-foreground space-y-2">
              <li>• Produto foi usado ou lavado</li>
              <li>• Etiqueta foi removida</li>
              <li>• Prazo de 30 dias foi ultrapassado</li>
              <li>• Produto apresenta danos causados pelo cliente</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
