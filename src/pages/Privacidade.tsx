import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

export default function Privacidade() {
  return (
    <Layout>
      <SEO
        title="Privacidade"
        description="Política de privacidade da Numarstore. Saiba como coletamos, usamos e protegemos seus dados pessoais."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Política de Privacidade",
        }}
      />
      <div className="container-numar py-12 max-w-3xl mx-auto prose prose-sm">
        <h1 className="font-serif text-4xl mb-8">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-6">Última atualização: janeiro de 2025</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">1. Informações que coletamos</h2>
        <p>Ao utilizar a Numar Store, podemos coletar nome, e-mail, endereço de entrega, telefone e dados de pagamento para processar seus pedidos. Não armazenamos dados de cartão de crédito em nossos servidores.</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">2. Como usamos suas informações</h2>
        <p>Utilizamos seus dados exclusivamente para processar pedidos, entrar em contato sobre sua compra, melhorar nossos serviços e enviar comunicações de marketing (somente com seu consentimento).</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">3. Compartilhamento de dados</h2>
        <p>Seus dados não são vendidos a terceiros. Compartilhamos apenas com parceiros de entrega e processadores de pagamento, estritamente para finalizar sua compra.</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">4. Seus direitos (LGPD)</h2>
        <p>Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a acessar, corrigir ou solicitar a exclusão dos seus dados. Entre em contato pelo WhatsApp ou e-mail para exercer esses direitos.</p>

        <h2 className="font-serif text-2xl mt-8 mb-3">5. Contato</h2>
        <p>Dúvidas sobre privacidade? Fale conosco pelo WhatsApp <strong>(21) 97967-4510</strong> ou pelo Instagram <strong>@use.numar</strong>.</p>
      </div>
    </Layout>
  );
}
