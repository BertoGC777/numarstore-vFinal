import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Como faço para rastrear meu pedido?", a: "Após o envio, você receberá o código de rastreio pelo WhatsApp. Acesse o site dos Correios ou da transportadora para acompanhar." },
  { q: "Qual o prazo de entrega?", a: "O prazo varia conforme a região. Em média, de 3 a 10 dias úteis após a confirmação do pagamento." },
  { q: "Vocês têm frete grátis?", a: "Sim! Frete grátis para compras acima de R$300." },
  { q: "Posso pagar parcelado?", a: "Sim, aceitamos cartão de crédito em até 3x sem juros. No Pix, o pagamento é à vista com preço especial." },
  { q: "As roupas têm tamanho único?", a: "A maioria das peças é tamanho único, que veste do P ao G. Verifique a descrição de cada produto para mais detalhes." },
  { q: "Como faço uma troca?", a: "Entre em contato pelo WhatsApp em até 30 dias após o recebimento. O produto deve estar sem uso e com etiqueta." },
  { q: "Vocês enviam para todo o Brasil?", a: "Sim! Entregamos em todo o território nacional." },
  { q: "Como entro em contato com vocês?", a: "Pelo WhatsApp (21) 97967-4510 ou pelo Instagram @use.numar. Atendemos de seg a sex das 9h às 18h e sáb das 9h às 13h." },
];

export default function FAQ() {
  return (
    <Layout>
      <SEO
        title="Perguntas Frequentes"
        description="Encontre respostas para as dúvidas mais comuns sobre produtos, envio, pagamentos e trocas na Numar Store."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((f) => ({
            "@type": "QuestionAnswer",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a },
          })),
        }}
      />
      <div className="container-numar py-12 max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl mb-2 text-center">Perguntas Frequentes</h1>
        <p className="text-muted-foreground text-center mb-10 text-sm">Encontre respostas para as dúvidas mais comuns</p>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border px-4">
              <AccordionTrigger className="text-sm font-medium text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
}
