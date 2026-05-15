import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

export default function Termos() {
  return (
    <Layout>
      <SEO
        title="Termos"
        description="Termos de uso da Numarstore. Leia atentamente antes de utilizar nossos serviços."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Termos de Uso",
        }}
      />
      <div className="container-numar py-12 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl mb-8">Termos de Uso</h1>
        <p className="text-muted-foreground mb-6">Última atualização: janeiro de 2025</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">1. Aceitação dos termos</h2>
        <p className="text-sm leading-relaxed mb-4">Ao acessar e usar o site da Numar Store, você concorda com estes Termos de Uso. Caso não concorde, pedimos que não utilize nossos serviços.</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">2. Produtos e preços</h2>
        <p className="text-sm leading-relaxed mb-4">Todos os preços são em Reais (BRL) e podem ser alterados sem aviso prévio. O preço válido é o exibido no momento da finalização da compra.</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">3. Pagamentos</h2>
        <p className="text-sm leading-relaxed mb-4">Aceitamos Pix (com desconto) e cartão de crédito em até 3x sem juros. O pedido é confirmado após a aprovação do pagamento.</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">4. Entrega</h2>
        <p className="text-sm leading-relaxed mb-4">Enviamos para todo o Brasil. O prazo de entrega varia conforme a região. Frete grátis para compras acima de R$300.</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">5. Trocas e devoluções</h2>
        <p className="text-sm leading-relaxed mb-4">Aceitamos trocas em até 30 dias após o recebimento, desde que o produto esteja sem uso e com etiqueta. Consulte nossa política completa de trocas.</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">6. Contato</h2>
        <p className="text-sm leading-relaxed">WhatsApp: <strong>(21) 97967-4510</strong> | Instagram: <strong>@use.numar</strong></p>
      </div>
    </Layout>
  );
}
