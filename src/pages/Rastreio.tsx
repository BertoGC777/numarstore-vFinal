import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, ExternalLink } from "lucide-react";

export default function Rastreio() {
  const [code, setCode] = useState("");

  const track = () => {
    if (!code.trim()) return;
    window.open(`https://rastreamento.correios.com.br/app/index.php?objetos=${code.trim()}`, "_blank");
  };

  return (
    <Layout>
      <SEO title="Rastreio" description="Rastreie seu pedido na Numarstore. Consulte o status de envio e entrega." />
      <div className="container-numar py-12 max-w-xl mx-auto text-center">
        <Package className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Rastrear Pedido</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Insira o código de rastreio enviado por WhatsApp após o envio do seu pedido.
        </p>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: BR123456789BR"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && track()}
          />
          <Button onClick={track} className="gap-2">
            <ExternalLink className="h-4 w-4" /> Rastrear
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Você será redirecionado para o site dos Correios com o rastreio completo.
        </p>
        <div className="mt-8 border border-border rounded-lg p-5 text-left space-y-2">
          <p className="text-sm font-medium">Precisa de ajuda?</p>
          <p className="text-sm text-muted-foreground">Se não recebeu seu código de rastreio, entre em contato pelo WhatsApp:</p>
          <a
            href="https://wa.me/5521979674510?text=Olá! Preciso do código de rastreio do meu pedido."
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm text-primary hover:underline"
          >
            (21) 97967-4510
          </a>
        </div>
      </div>
    </Layout>
  );
}
