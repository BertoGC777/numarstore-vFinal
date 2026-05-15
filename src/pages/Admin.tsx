import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, LogOut, CheckCircle, XCircle, Clock, Truck } from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

type Tab = "orders" | "products";

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("numar.token");
    if (!token) {
      navigate("/conta");
      return;
    }

    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === "orders") {
        const data = await api.get("/admin/orders");
        setOrders(data);
      } else {
        const data = await api.get("/admin/products");
        setProducts(data);
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.response?.data?.error || "Erro ao carregar dados" });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("numar.token");
    localStorage.removeItem("numar.refreshToken");
    localStorage.removeItem("numar.user");
    navigate("/conta");
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast({ title: "Sucesso", description: "Status atualizado" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Erro", description: err.response?.data?.error || "Erro ao atualizar status" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "confirmed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "sent": return <Truck className="h-4 w-4 text-blue-600" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pendente";
      case "confirmed": return "Confirmado";
      case "sent": return "Enviado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  return (
    <Layout>
      <SEO title="Painel Admin" description="Painel administrativo da Numar Store" />
      <div className="container-numar py-10 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl">Painel Administrativo</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>

        <div className="flex gap-1 border-b border-border mb-8">
          <button onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <ShoppingBag className="h-4 w-4" /> Pedidos
          </button>
          <button onClick={() => setTab("products")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "products" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <Package className="h-4 w-4" /> Produtos
          </button>
        </div>

        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        ) : tab === "orders" ? (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="border border-border rounded-lg p-8 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="font-serif text-xl mb-2">Nenhum pedido</h2>
                <p className="text-sm text-muted-foreground">Não há pedidos no momento.</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <div key={order.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(order.status)}
                        <span className="font-medium">{getStatusLabel(order.status)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.item_count} {order.item_count === 1 ? "item" : "itens"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cliente:</span>
                      <p className="font-medium">{order.name}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                      <p className="text-xs text-muted-foreground">{order.phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Endereço:</span>
                      <p className="text-xs">{order.logradouro}, {order.bairro}</p>
                      <p className="text-xs">{order.localidade} - {order.uf}</p>
                      <p className="text-xs">CEP: {order.cep}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    {order.status === "pending" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "confirmed")}>
                        Confirmar
                      </Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "sent")}>
                        Marcar como Enviado
                      </Button>
                    )}
                    {(order.status === "pending" || order.status === "confirmed") && (
                      <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, "cancelled")}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="border border-border rounded-lg p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="font-serif text-xl mb-2">Nenhum produto</h2>
                <p className="text-sm text-muted-foreground">Não há produtos no momento.</p>
              </div>
            ) : (
              products.map((product: any) => (
                <div key={product.id} className="border border-border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category} {product.subcategory && `• ${product.subcategory}`}</p>
                    <div className="flex gap-4 mt-1 text-sm">
                      <span>Pix: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price_pix)}</span>
                      <span>Cartão: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price_card)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {product.is_new && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Novo</span>}
                    {product.is_sale && <span className="text-xs bg-red-10 text-red-600 px-2 py-1 rounded">Promo</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
