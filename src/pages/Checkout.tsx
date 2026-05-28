import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { useCart } from "@/context/CartContext";
import { useCoupon } from "@/context/CouponContext";
import { calculateShipping, ShippingOption } from "@/utils/shipping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Lock, MessageCircle, Truck, ChevronLeft } from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";
import { formatBRL } from "@/data/products";
import CouponInput from "@/components/CouponInput";
import Image from "@/components/Image";

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "5521979674510";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskCPF(v: string) { return v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2') }
function maskPhone(v: string) { return v.replace(/\D/g,'').slice(0,11).replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d{4})$/,'$1-$2') }
function maskCEP(v: string) { return v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2') }

export default function Checkout() {
  const { items, subtotal, close, clear } = useCart();
  const { discount: couponDiscount } = useCoupon();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');

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

  const shipping = selectedShipping?.price ?? 0;
  const total = subtotal + shipping - couponDiscount;

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
      const fullName = `${nome.trim()} ${sobrenome.trim()}`.trim();
      const addressLine = `${logradouro}, ${numero}${complemento ? ` - ${complemento}` : ""} - ${bairro}, ${localidade}/${uf} - CEP ${cep}`;

      const response = await fetch('https://rwyzentzyhijhkjehcknb.supabase.co/functions/v1/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          customer: {
            name: fullName,
            email,
            phone: telefone
          },
          items: items.map((i) => ({
            productId: i.productId || i.id,
            slug: i.slug,
            name: i.name,
            image: i.image,
            pricePix: i.pricePix,
            priceCard: i.priceCard,
            color: i.color,
            size: i.size,
            quantity: i.quantity
          })),
          shipping: shipping,
          paymentMethod: paymentMethod,
          address: {
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            localidade,
            uf
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar preferência de pagamento');
      }

      // Se tiver init_point (Mercado Pago configurado), redireciona para o checkout do MP
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        // Se não tiver init_point (MP ainda sem chaves reais), redireciona para success
        close();
        await clear();
        navigate(`/checkout/success?order_id=${data.order_id}`);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro ao registrar pedido";
      toast({
        title: "Erro ao finalizar",
        description: message,
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
      <SEO title="Finalizar Compra" description="Finalize seu pedido com segurança. Pagamento via WhatsApp, cartão em breve." />
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
              <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg p-6">
                <h2 className="font-serif text-xl mb-2 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-700" /> Finalização pelo WhatsApp
                </h2>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Ao confirmar, seu pedido será salvo e o WhatsApp abrirá com o resumo. Nossa equipe confirma estoque, frete e pagamento (Mercado Pago em breve no site).
                </p>
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
                  {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Desconto Cupom</span><span>-{formatBRL(couponDiscount)}</span></div>}
                  <div className="flex justify-between font-serif text-xl pt-2 border-t border-border"><span>Total</span><span className="text-primary">{formatBRL(total)}</span></div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6">
                <h2 className="font-serif text-xl mb-4">Método de Pagamento</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <p className="font-medium">PIX</p>
                    <p className="text-xs text-muted-foreground">Desconto/Padrão</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">Até 12x</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 gap-2">
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </Button>
                <Button onClick={handleCheckout} disabled={loading} className="flex-1 h-12 uppercase tracking-widest gap-2">
                  <MessageCircle className="h-4 w-4" />{loading ? "Processando..." : "Confirmar e abrir WhatsApp"}
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
            <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg p-6">
              <h2 className="font-serif text-xl mb-2 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-700" /> Finalização pelo WhatsApp
              </h2>
              <p className="text-sm text-green-800 dark:text-green-300">
                Ao confirmar, seu pedido será salvo e o WhatsApp abrirá com o resumo. Nossa equipe confirma estoque, frete e pagamento (Mercado Pago em breve no site).
              </p>
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
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={80}
                      aspectRatio="portrait"
                      objectFit="contain"
                      loading="lazy"
                      className="w-14 h-20 rounded shrink-0"
                    />
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
                {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Desconto Cupom</span><span>-{formatBRL(couponDiscount)}</span></div>}
                <div className="flex justify-between font-serif text-xl pt-2 border-t border-border"><span>Total</span><span className="text-primary">{formatBRL(total)}</span></div>
              </div>

              <div className="border border-border rounded-lg p-6">
                <h2 className="font-serif text-xl mb-4">Método de Pagamento</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <p className="font-medium">PIX</p>
                    <p className="text-xs text-muted-foreground">Desconto/Padrão</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">Até 12x</p>
                  </button>
                </div>
              </div>
              <Button onClick={handleCheckout} disabled={loading} className="w-full h-12 uppercase tracking-widest gap-2">
                <MessageCircle className="h-4 w-4" />{loading ? "Processando..." : "Confirmar e abrir WhatsApp"}
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