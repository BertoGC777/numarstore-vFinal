import { useEffect, useState } from "react";
import { X } from "lucide-react";

const messages = [
  "🎉 Use o Pix e ganhe 5% de desconto em toda a loja",
  "🚚 Frete grátis em compras acima de R$300",
  "💳 Parcele em até 3x sem juros no cartão",
  "📲 Atendimento pelo WhatsApp: (21) 97967-4510",
];

export default function TopBar() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 4000);
    return () => clearInterval(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-topbar text-topbar-foreground text-xs relative">
      <div className="container-numar h-9 flex items-center justify-center overflow-hidden pr-8">
        <p key={idx} className="fade-in tracking-wide text-center">{messages[idx]}</p>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Fechar aviso"
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
