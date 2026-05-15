import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Instagram, MessageCircle } from "lucide-react";

export default function QuemSomos() {
  return (
    <Layout>
      <SEO
        title="Quem Somos"
        description="Conheça a história da Numar Store — moda feminina sofisticada, peças exclusivas e atendimento personalizado."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "Quem Somos",
          "description": "Conheça a história da Numar Store — moda feminina sofisticada, peças exclusivas e atendimento personalizado.",
        }}
      />
      <div className="container-numar py-12 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-center">Quem Somos</h1>
        <p className="text-muted-foreground text-center text-sm mb-12">A história por trás da Numar Store</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <div className="border-l-2 border-primary pl-6">
            <h2 className="font-serif text-2xl mb-3">Nossa História</h2>
            <p className="text-muted-foreground">
              A Numar Store nasceu da paixão por moda feminina e do desejo de oferecer peças exclusivas, elegantes e acessíveis para mulheres que valorizam estilo e sofisticação. Começamos pequenos, com muita dedicação, e hoje temos orgulho de vestir mulheres incríveis de todo o Brasil.
            </p>
          </div>

          <div className="border-l-2 border-primary pl-6">
            <h2 className="font-serif text-2xl mb-3">Nossa Missão</h2>
            <p className="text-muted-foreground">
              Oferecer peças de qualidade que valorizem cada mulher em qualquer ocasião — da praia ao evento especial. Acreditamos que moda é expressão e que toda mulher merece se sentir linda e confiante.
            </p>
          </div>

          <div className="border-l-2 border-primary pl-6">
            <h2 className="font-serif text-2xl mb-3">Nossos Valores</h2>
            <ul className="text-muted-foreground space-y-1.5">
              <li>✦ Qualidade em cada peça</li>
              <li>✦ Atendimento personalizado e humano</li>
              <li>✦ Transparência e confiança</li>
              <li>✦ Moda que respeita e valoriza a mulher</li>
            </ul>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <h2 className="font-serif text-2xl mb-4">Fale com a gente</h2>
            <p className="text-muted-foreground text-sm mb-4">Estamos sempre aqui para te ajudar!</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="https://wa.me/5521979674510"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:bg-primary/90 transition"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href="https://instagram.com/use.numar"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 border border-foreground px-5 py-2.5 text-sm hover:bg-foreground hover:text-background transition"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
