import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { useCart } from "@/context/CartContext";
import { sanitize } from "@/utils/sanitize";
import { calculateShipping, ShippingOption } from "@/utils/shipping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, QrCode, Banknote, ChevronRight, Lock, MessageCircle, Truck } from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";
import { formatBRL } from "@/data/products";
import { loadStripe } from "@stripe/stripe-js";

type PayMethod = "pix" | "card" | "boleto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Checkout() {
  const { items, subtotal, close } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [method, setMethod] = useState<PayMethod>("pix");
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  const [cep, setCep] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [bairro, setBairro] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [uf, setUf] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  const discount = method === "pix" ? subtotal * 0.05 : 0;
  const shipping = selectedShipping?.price ?? 0;
  const total = subtotal + shipping - discount;

  const setField = (k: string, v: string) => {
    switch (k) {
      case "nome": setNome(v); break;
      case "sobrenome": setSobrenome(v); break;
      case "email": setEmail(v); break;
      case "cpf": setCpf(v); break;
      case "telefone": setTelefone(v); break;
      case "cep": setCep(v); break;
      case "logradouro": setLogradouro(v); break;
      case "bairro": setBairro(v); break;
      case "localidade": setLocalidade(v); break;
      case "uf": setUf(v); break;
      case "numero": setNumero(v); break;
      case "complemento": setComplemento(v); break;
    }
    if (fieldErrors[k]) setFieldErrors((prev) => { const { [k]: _, ...rest } = prev; return rest; });
  };

  const validateField = (k: string, value: string, rules: { required?: boolean; minLength?: number; pattern?: RegExp; patternMsg?: string }): string => {
    if (rules.required && !value.trim()) return "Este campo é obrigatório.";
    if (rules.minLength && value.trim().length < rules.minLength) return `Mínimo de ${rules.minLength} caracteres.`;
    if (rules.pattern && value && !rules.pattern.test(value)) return rules.patternMsg || "Valor inválido.";
    return "";
  };

  const handleCepSearch = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setCepError("Digite um CEP válido com 8 dígitos.");
      return;
    }
    setLoadingCep(true);
    setCepError("");
    try {
      const data = await api.cep(cleanCep);
      setLogradouro(data.logradouro || "");
      setBairro(data.bairro || "");
      setLocalidade(data.localidade || "");
      setUf(data.uf || "");

      // Calcular peso total dos itens
      const pesoTotal = items.reduce((acc, item) => acc + (item.quantity * 0.5), 0); // 0.5kg por item
      const shippingResult = calculateShipping(cleanCep, pesoTotal, subtotal);
      let options = shippingResult.options;

      // Adicionar opção de entrega própria para Campo Grande RJ (CEP começa com 232)
      if (cleanCep.startsWith("232")) {
        options = [
          ...options,
          {
            id: "entrega-propria",
            name: "Entrega própria - Campo Grande RJ",
            price: 0,
            days: "Entre em contato pelo WhatsApp para combinar horário",
            free: true,
          },
        ];
      }

      setShippingOptions(options);
      setSelectedShipping(options[0] || null);
    } catch (e: any) {
      setCepError(e.message || "Erro ao buscar CEP.");
      setLogradouro(""); setBairro(""); setLocalidade(""); setUf("");
      setShippingOptions([]);
      setSelectedShipping(null);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCheckout = async () => {
    setFieldErrors({});
    const newErrors: Record<string, string> = {};
    newErrors.nome = validateField("nome", nome, { required: true });
    newErrors.sobrenome = validateField("sobrenome", sobrenome, { required: true });
    newErrors.email = validateField("email", email, { required: true, pattern: EMAIL_REGEX, patternMsg: "E-mail inválido." });
    newErrors.cpf = validateField("cpf", cpf, { required: true, minLength: 11 });
    newErrors.telefone = validateField("telefone", telefone, { required: true, minLength: 10 });
    newErrors.cep = validateField("cep", cep, { required: true, minLength: 8 });
    newErrors.logradouro = validateField("logradouro", logradouro, { required: true });
    if (!selectedShipping) {
      newErrors.cep = "Calcule o frete antes de finalizar.";
    }
    if (Object.values(newErrors).some(Boolean)) { setFieldErrors(newErrors); return; }

    setLoading(true);
    try {
      const shippingName = selectedShipping?.name || "PAC";
      const sanitizedMsg = sanitize(`Olá! Gostaria de finalizar meu pedido:\n\n${items.map(i => `• ${i.name} | ${i.color} | ${i.size} | Qtd: ${i.quantity}`).join("\n")}\n\nFrete: ${shippingName} (${shipping === 0 ? "Grátis" : formatBRL(shipping)})\nTotal: ${formatBRL(total)}\nPagamento: ${method}`);

      // 1. Criar pedido no backend (opcional - se falhar, usa undefined)
      let orderId: string | undefined = undefined;
      try {
        console.log("📦 Criando pedido no backend...");
        const order = await api.orders.create({
          paymentMethod: method,
          name: nome, email, cpf, phone: telefone,
          cep, logradouro, numero, complemento, bairro, localidade, uf,
          subtotal, shipping, discount, total,
          whatsappMsg: sanitizedMsg,
          items: items.map(i => ({
            product_id: i.id,
            name: i.name,
            image: i.image,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
            price_pix: i.pricePix,
          })),
        });
        console.log("✅ Pedido criado:", order.id);
        orderId = order.id;
      } catch (err) {
        console.log("⚠️ Pedido não criado no backend, usando orderId undefined");
      }

      // 2. Criar sessão Stripe via backend
      const stripeItems = items.map(i => ({
        name: i.name,
        pricePix: i.pricePix,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
      }));

      console.log("💳 Criando sessão Stripe...");
      const sessionRes = await api.post("/stripe/checkout", {
        items: stripeItems,
        shipping,
        discount,
        orderId,
        metadata: {
          userId: localStorage.getItem("numar.user") ? JSON.parse(localStorage.getItem("numar.user") || "{}").id : "",
          email,
        },
      });
      console.log("Resposta Stripe:", sessionRes);

      if (sessionRes?.url) {
        window.location.href = sessionRes.url;
        return;
      }
      if (sessionRes?.sessionId) {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        await stripe?.redirectToCheckout({ sessionId: sessionRes.sessionId });
        return;
      }

      throw new Error("Stripe não retornou URL");
    } catch (e: any) {
      console.error("❌ Erro no checkout:", e);
      toast({ 
        title: "❌ Erro no pagamento", 
        description: e.message || "Erro ao processar pagamento. Verifique o console para detalhes."
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-numar py-20 text-center">
          <h1 className="font-serif text-3xl mb-4">Sua sacola está vazia</h1>
          <Link to="/catalogo"><Button>Ver produtos</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Finalizar Compra" description="Finalize seu pedido com segurança. Pix com 5% de desconto, cartão ou boleto." />
      <div className="container-numar py-8 max-w-5xl">
        <nav className="text-xs text-muted-foreground flex items-center gap-1 mb-8">
          <Link to="/" className="hover:text-primary">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <span>Finalizar Compra</span>
        </nav>

        <h1 className="font-serif text-3xl mb-8">Finalizar Compra</h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <div className="border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl mb-4">Forma de Pagamento</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: "pix" as PayMethod, icon: QrCode, label: "Pix", desc: "5% de desconto" },
                  { id: "card" as PayMethod, icon: CreditCard, label: "Cartão", desc: "3x sem juros" },
                  { id: "boleto" as PayMethod, icon: Banknote, label: "Boleto", desc: "Vence em 3 dias" },
                ].map(({ id, icon: Icon, label, desc }) => (
                  <button key={id} onClick={() => setMethod(id)}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                      method === id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                    }`}>
                    <Icon className={`h-6 w-6 ${method === id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${method === id ? "text-primary" : ""}`}>{label}</span>
                    <span className="text-xs text-muted-foreground text-center">{desc}</span>
                  </button>
                ))}
              </div>
              {method === "pix" && <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">✅ Pix com 5% de desconto!</p>
              </div>}
              {method === "card" && <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-4">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">💳 Cartão em até 3x sem juros</p>
              </div>}
              {method === "boleto" && <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded p-4">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">📄 Boleto Bancário</p>
              </div>}
            </div>

            <div className="border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl mb-4">Seus Dados</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Input placeholder="Nome" value={nome} onChange={(e) => setField("nome", e.target.value)} className={fieldErrors.nome ? "border-destructive" : ""} />
                  {fieldErrors.nome && <p className="text-xs text-destructive mt-1">{fieldErrors.nome}</p>}</div>
                  <div><Input placeholder="Sobrenome" value={sobrenome} onChange={(e) => setField("sobrenome", e.target.value)} className={fieldErrors.sobrenome ? "border-destructive" : ""} />
                  {fieldErrors.sobrenome && <p className="text-xs text-destructive mt-1">{fieldErrors.sobrenome}</p>}</div>
                </div>
                <div><Input placeholder="E-mail" type="email" value={email} onChange={(e) => setField("email", e.target.value)} className={fieldErrors.email ? "border-destructive" : ""} />
                {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}</div>
                <div><Input placeholder="CPF" value={cpf} onChange={(e) => setField("cpf", e.target.value)} className={fieldErrors.cpf ? "border-destructive" : ""} />
                {fieldErrors.cpf && <p className="text-xs text-destructive mt-1">{fieldErrors.cpf}</p>}</div>
                <div><Input placeholder="Telefone / WhatsApp" value={telefone} onChange={(e) => setField("telefone", e.target.value)} className={fieldErrors.telefone ? "border-destructive" : ""} />
                {fieldErrors.telefone && <p className="text-xs text-destructive mt-1">{fieldErrors.telefone}</p>}</div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl mb-4">Endereço de Entrega</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <Input placeholder="CEP" value={cep} onChange={(e) => setField("cep", e.target.value)} maxLength={9} className={fieldErrors.cep ? "border-destructive" : ""} />
                  <Button variant="outline" type="button" onClick={handleCepSearch} disabled={loadingCep}>{loadingCep ? "Buscando..." : "Buscar"}</Button>
                </div>
                {(fieldErrors.cep || cepError) && <p className="text-sm text-destructive">{fieldErrors.cep || cepError}</p>}
                <Input placeholder="Rua / Avenida" value={logradouro} onChange={(e) => setField("logradouro", e.target.value)} className={fieldErrors.logradouro ? "border-destructive" : ""} />
                {fieldErrors.logradouro && <p className="text-xs text-destructive mt-1">{fieldErrors.logradouro}</p>}
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <Input placeholder="Número" value={numero} onChange={e => setNumero(e.target.value)} />
                  <Input placeholder="Complemento" value={complemento} onChange={e => setComplemento(e.target.value)} />
                </div>
                <Input placeholder="Bairro" value={bairro} onChange={(e) => setField("bairro", e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Cidade" value={localidade} onChange={(e) => setField("localidade", e.target.value)} />
                  <Input placeholder="Estado" value={uf} onChange={(e) => setField("uf", e.target.value)} maxLength={2} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="border border-border rounded-lg p-6 sticky top-24 space-y-4">
              <h2 className="font-serif text-xl">Resumo</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-20 object-cover rounded shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.color} · {item.size} · Qtd: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary mt-1">{formatBRL(item.pricePix * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(subtotal)}</span></div>
                {shippingOptions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-muted-foreground font-medium">Opções de Frete:</p>
                    {shippingOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedShipping(option)}
                        className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all ${
                          selectedShipping?.id === option.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <div className="text-left">
                            <p className="font-medium">{option.name}</p>
                            <p className="text-xs text-muted-foreground">{option.days}</p>
                          </div>
                        </div>
                        <span className={option.free ? "text-green-600 font-medium" : ""}>
                          {option.free ? "Grátis ✨" : formatBRL(option.price)}
                        </span>
                      </button>
                    ))}
                    {selectedShipping?.id === "entrega-propria" && (
                      <a
                        href="https://wa.me/5521979674510"
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full text-center mt-2"
                      >
                        <Button variant="outline" className="w-full gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Agendar entrega pelo WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span className="text-muted-foreground">Digite o CEP para calcular</span></div>
                )}
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto Pix (5%)</span><span>-{formatBRL(discount)}</span></div>}
                <div className="flex justify-between font-serif text-xl pt-2 border-t border-border"><span>Total</span><span className="text-primary">{formatBRL(total)}</span></div>
                {method === "card" && <p className="text-xs text-muted-foreground text-right">ou 3x de {formatBRL(total / 3)} sem juros</p>}
              </div>
              <Button onClick={handleCheckout} disabled={loading} className="w-full h-12 uppercase tracking-widest gap-2">
                <MessageCircle className="h-4 w-4" />{loading ? "Processando..." : "Finalizar Compra"}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /><span>Compra 100% segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}