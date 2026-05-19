import { Link } from "react-router-dom";
import { Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground mt-20">
      <div className="container-numar py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-serif text-lg mb-4 text-primary">Ajuda</h4>
          <ul className="space-y-2 opacity-90" role="list">
            <li><Link to="/trocas-e-devolucoes" className="hover:text-primary">Trocas e Devoluções</Link></li>
            <li><Link to="/rastreio" className="hover:text-primary">Rastreie seu Pedido</Link></li>
            <li><Link to="/faq" className="hover:text-primary">Perguntas Frequentes</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg mb-4 text-primary">Empresa</h4>
          <ul className="space-y-2 opacity-90" role="list">
            <li><Link to="/quem-somos" className="hover:text-primary">Quem Somos</Link></li>
            <li><span className="opacity-90">Atendemos online e por WhatsApp</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg mb-4 text-primary">Políticas</h4>
          <ul className="space-y-2 opacity-90" role="list">
            <li><Link to="/privacidade" className="hover:text-primary">Política de Privacidade</Link></li>
            <li><Link to="/termos" className="hover:text-primary">Termos de Uso</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg mb-4 text-primary">Siga-nos</h4>
          <div className="flex gap-3 opacity-90">
            <a href="https://instagram.com/use.numar" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="hover:text-primary"><Instagram className="h-5 w-5" /></a>
            <a href="https://wa.me/5521979674510" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" className="hover:text-primary"><MessageCircle className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-footer-foreground/10">
        <div className="container-numar py-8 flex flex-col items-center gap-3">
          <div className="text-center">
            <span className="font-serif text-3xl text-primary tracking-[0.18em]">NUMAR</span>
            <span className="block text-[0.65rem] tracking-[0.4em] opacity-70">STORE</span>
          </div>
          <p className="text-xs opacity-70 text-center">© 2026 Numar Store — Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}
