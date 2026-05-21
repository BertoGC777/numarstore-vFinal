import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  RefreshCw,
  Save,
  Store,
  Mail,
  Phone,
  MapPin,
  Truck,
  DollarSign,
  MessageCircle,
  Instagram,
  Facebook,
  CreditCard
} from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  free_shipping_threshold: number;
  shipping_cost: number;
  social_whatsapp: string;
  social_instagram: string;
  social_facebook: string;
  payment_methods: string[];
  currency: string;
}

export default function AdminConfiguracoes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: "Numar Store",
    store_email: "contato@numarstore.com",
    store_phone: "",
    store_address: "",
    free_shipping_threshold: 0,
    shipping_cost: 0,
    social_whatsapp: "",
    social_instagram: "",
    social_facebook: "",
    payment_methods: ["pix", "card"],
    currency: "BRL"
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/settings");
      setSettings(data);
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao carregar configurações";
      toast({ title: "Erro", description: errorMsg });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", settings);
      toast({ title: "Sucesso", description: "Configurações salvas com sucesso" });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao salvar configurações";
      toast({ title: "Erro", description: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentMethodToggle = (method: string) => {
    setSettings({
      ...settings,
      payment_methods: settings.payment_methods.includes(method)
        ? settings.payment_methods.filter(m => m !== method)
        : [...settings.payment_methods, method]
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configurações da Loja</h2>
        <div className="flex gap-2">
          <Button
            onClick={fetchSettings}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store_name">Nome da Loja *</Label>
                <Input
                  id="store_name"
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  placeholder="Numar Store"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_email">Email de Contato *</Label>
                <Input
                  id="store_email"
                  type="email"
                  value={settings.store_email}
                  onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                  placeholder="contato@numarstore.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_phone">Telefone</Label>
                <Input
                  id="store_phone"
                  value={settings.store_phone}
                  onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_address">Endereço</Label>
                <Input
                  id="store_address"
                  value={settings.store_address}
                  onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                  placeholder="Rua Exemplo, 123 - São Paulo, SP"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Frete */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Configurações de Frete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="free_shipping_threshold">
                  Frete Grátis Acima de (R$)
                </Label>
                <Input
                  id="free_shipping_threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.free_shipping_threshold}
                  onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Deixe 0 para não oferecer frete grátis
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping_cost">
                  Custo do Frete (R$)
                </Label>
                <Input
                  id="shipping_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.shipping_cost}
                  onChange={(e) => setSettings({ ...settings, shipping_cost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Custo padrão de frete para pedidos abaixo do limite
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Redes Sociais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="social_whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="social_whatsapp"
                  value={settings.social_whatsapp}
                  onChange={(e) => setSettings({ ...settings, social_whatsapp: e.target.value })}
                  placeholder="https://wa.me/5511999999999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="social_instagram"
                  value={settings.social_instagram}
                  onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                  placeholder="https://instagram.com/numarstore"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="social_facebook"
                  value={settings.social_facebook}
                  onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                  placeholder="https://facebook.com/numarstore"
                />
              </div>
            </CardContent>
          </Card>

          {/* Formas de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Formas de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">PIX</p>
                  <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                </div>
                <Switch
                  checked={settings.payment_methods.includes("pix")}
                  onCheckedChange={() => handlePaymentMethodToggle("pix")}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-sm text-muted-foreground">Stripe</p>
                </div>
                <Switch
                  checked={settings.payment_methods.includes("card")}
                  onCheckedChange={() => handlePaymentMethodToggle("card")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Moeda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Moeda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda da Loja</Label>
                <select
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="BRL">Real Brasileiro (BRL)</option>
                  <option value="USD">Dólar Americano (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
