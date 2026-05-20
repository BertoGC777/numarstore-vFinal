import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { useCart } from "@/context/CartContext";
import { useCoupon } from "@/context/CouponContext";
import { sanitize } from "@/utils/sanitize";
import { calculateShipping, ShippingOption } from "@/utils/shipping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, QrCode, Banknote, ChevronRight, Lock, MessageCircle, Truck, ChevronLeft } from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";
import { formatBRL } from "@/data/products";
import { loadStripe } from "@stripe/stripe-js";
import CouponInput from "@/components/CouponInput";

type PayMethod = "pix" | "card" | "boleto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskCPF(v: string) { return v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2') }
function maskPhone(v: string) { return v.replace(/\D/g,'').slice(0,11).replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d{4})$/,'$1-$2') }
function maskCEP(v: string) { return v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2') }

export default function Checkout() {
  const { items, subtotal, close } = useCart();
  const { discount: couponDiscount } = useCoupon();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
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

  const pixDiscount = method === "pix" ? subtotal * 0.05 : 0;
  const shipping = selectedShipping?.price ?? 0;
  const total = subtotal + shipping - pixDiscount - couponDiscount;

  const setField = (k: string, v: string) => {
    switch (k) {
      case "nome": setNome(v); break;
      case "sobrenome": setSobrenome(v); break;
      case "email": setEmail(v); break;
      case "cpf": setCpf(maskCPF(v)); break;
      case "telefone": setTelefone(maskPhone(v)); break;
      case "cep": setCep(maskCEP(v)); break;
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

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    newErrors.nome = validateField("nome", nome, { required: true });
    newErrors.sobrenome = validateField("sobrenome", sobrenome, { required: true });
    newErrors.email = validateField("email", email, { required: true, pattern: EMAIL_REGEX, patternMsg: "E-mail inválido." });
    newErrors.cpf = validateField("cpf", cpf, { required: true, minLength: 11 });
    newErrors.telefone = validateField("telefone", telefone, { required: true, minLength: 10 });
    setFieldErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    newErrors.cep = validateField("cep", cep, { required: true, minLength: 8 });
    newErrors.logradouro = validateField("logradouro", logradouro, { required: true });
    if (!selectedShipping) {
      newErrors.cep = "Calcule o frete antes de continuar.";
    }
    setFieldErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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
    // Validate all fields before final checkout
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
          name, email, cpf, phone: telefone,
          cep, logradouro, numero, complemento, bairro, localidade, uf,
          subtotal, shipping, discount: pixDiscount + couponDiscount, total,
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
        discount: pixDiscount + couponDiscount,
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

        {/* Mobile Progress Bar */}
        <div className="md:hidden flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => s < step && setStep(s)}
              disabled={s > step}
              className={`w-3 h-3 rounded-full transition-all ${
                s === step ? "bg-primary scale-125" : s < step ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              aria-label={`Etapa ${s}`}
            />
          ))}
        </div>

        {/* Mobile: Show current step only */}
        <div className="md:hidden space-y-6">
          {/* Step 1: Payment and Personal Data */}
          {step === 1 && (
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
                  <div><Input placeholder="Nome" value={nome} onChange={(e) => setField("nome", e.target.value)} className={fieldErrors.nome ? "border-destructive" : ""} />
                  {fieldErrors.nome && <p className="text-xs text-destructive mt-1">{fieldErrors.nome}</p>}</div>
                  <div><Input placeholder="Sobrenome" value={sobrenome} onChange={(e) => setField("sobrenome", e.target.value)} className={fieldErrors.sobrenome ? "border-destructive" : ""} />
                  {fieldErrors.sobrenome && <p className="text-xs text-destructive mt-1">{fieldErrors.sobrenome}</p>}</div>
                  <div><Input placeholder="E-mail" type="email" value={email} onChange={(e) => setField("email", e.target.value)} className={fieldErrors.email ? "border-destructive" : ""} />
                  {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}</div>
                  <div><Input placeholder="CPF" value={cpf} onChange={(e) => setField("cpf", e.target.value)} className={fieldErrors.cpf ? "border-destructive" : ""} maxLength={14} />
                  {fieldErrors.cpf && <p className="text-xs text-destructive mt-1">{fieldErrors.cpf}</p>}</div>
                  <div><Input placeholder="Telefone / WhatsApp" value={telefone} onChange={(e) => setField("telefone", e.target.value)} className={fieldErrors.telefone ? "border-destructive" : ""} maxLength={15} />
                  {fieldErrors.telefone && <p className="text-xs text-destructive mt-1">{fieldErrors.telefone}</p>}</div>
                </div>
              </div>

              <CouponInput subtotal={subtotal} />

              <Button onClick={handleNext} className="w-full h-12 uppercase tracking-widest">
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="space-y-6">
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

              {shippingOptions.length > 0 && (
                <div className="border border-border rounded-lg p-6">
                  <h2 className="font-serif text-xl mb-4">Opções de Frete</h2>
                  <div className="space-y-2">
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
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 gap-2">
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </Button>
                <Button onClick={handleNext} className="flex-1 uppercase tracking-widest">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Summary and Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-6">
                <h2 className="font-serif text-xl mb-4">Resumo do Pedido</h2>
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
              </div>

              <div className="border border-border rounded-lg p-6">
                <h2 className="font-serif text-xl mb-4">Resumo de Valores</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{shipping === 0 ? "Grátis" : formatBRL(shipping)}</span></div>
                  {pixDiscount > 0 && <div className="flex justify-between text-green-600"><span>Desconto Pix (5%)</span><span>-{formatBRL(pixDiscount)}</span></div>}
                  {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Desconto Cupom</span><span>-{formatBRL(couponDiscount)}</span></div>}
                  <div className="flex justify-between font-serif text-xl pt-2 border-t border-border"><span>Total</span><span className="text-primary">{formatBRL(total)}</span></div>
                  {method === "card" && <p className="text-xs text-muted-foreground text-right">ou 3x de {formatBRL(total / 3)} sem juros</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 gap-2">
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </Button>
                <Button onClick={handleCheckout} disabled={loading} className="flex-1 h-12 uppercase tracking-widest gap-2">
                  <MessageCircle className="h-4 w-4" />{loading ? "Processando..." : "Finalizar Compra"}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /><span>Compra 100% segura</span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Keep original two-column layout */}
        <div className="hidden md:grid lg:grid-cols-[1fr_380px] gap-8">
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

            <CouponInput subtotal={subtotal} />

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
                <div><Input placeholder="CPF" value={cpf} onChange={(e) => setField("cpf", e.target.value)} className={fieldErrors.cpf ? "border-destructive" : ""} maxLength={14} />
                {fieldErrors.cpf && <p className="text-xs text-destructive mt-1">{fieldErrors.cpf}</p>}</div>
                <div><Input placeholder="Telefone / WhatsApp" value={telefone} onChange={(e) => setField("telefone", e.target.value)} className={fieldErrors.telefone ? "border-destructive" : ""} maxLength={15} />
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
                {pixDiscount > 0 && <div className="flex justify-between text-green-600"><span>Desconto Pix (5%)</span><span>-{formatBRL(pixDiscount)}</span></div>}
                {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Desconto Cupom</span><span>-{formatBRL(couponDiscount)}</span></div>}
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