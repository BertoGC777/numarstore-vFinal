import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, ShoppingBag, LogOut, CheckCircle, XCircle, Clock, Truck, Plus, Edit, Trash2 } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    description: "",
    price_pix: "",
    price_card: "",
    is_new: false,
    is_sale: false,
    discount: ""
  });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "orders") {
        const data = await api.get("/admin/orders");
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const data = await api.get("/admin/products");
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
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
      toast({ title: "Erro", description: err.message || "Erro ao atualizar status" });
    }
  };

  const handleSaveProduct = async () => {
    try {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        description: productForm.description,
        price_pix: parseFloat(productForm.price_pix),
        price_card: parseFloat(productForm.price_card),
        is_new: productForm.is_new,
        is_sale: productForm.is_sale,
        discount: productForm.is_sale ? parseFloat(productForm.discount) : 0
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        toast({ title: "Sucesso", description: "Produto atualizado" });
      } else {
        await api.post("/admin/products", payload);
        toast({ title: "Sucesso", description: "Produto criado" });
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        category: "",
        description: "",
        price_pix: "",
        price_card: "",
        is_new: false,
        is_sale: false,
        discount: ""
      });
      fetchData();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao salvar produto" });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    try {
      await api.delete(`/admin/products/${productId}`);
      toast({ title: "Sucesso", description: "Produto excluído" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao excluir produto" });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description || "",
      price_pix: product.price_pix.toString(),
      price_card: product.price_card.toString(),
      is_new: product.is_new === 1,
      is_sale: product.is_sale === 1,
      discount: product.discount?.toString() || ""
    });
    setShowProductForm(true);
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

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="mt-2">
              Tentar novamente
            </Button>
          </div>
        )}
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        ) : tab === "orders" ? (
          <div className="space-y-4">
            {!Array.isArray(orders) || orders.length === 0 ? (
              <div className="border border-border rounded-lg p-8 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="font-serif text-xl mb-2">Nenhum pedido ainda</h2>
                <p className="text-sm text-muted-foreground">Os pedidos aparecerão aqui quando forem feitos.</p>
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
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at ?? '').toLocaleString("pt-BR")}</p>
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
            <div className="flex justify-between items-center">
              <Button onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: "", category: "", description: "", price_pix: "", price_card: "", is_new: false, is_sale: false, discount: "" }); }} className="gap-2">
                <Plus className="h-4 w-4" /> Adicionar Produto
              </Button>
            </div>

            {showProductForm && (
              <div className="border border-border rounded-lg p-6 space-y-4">
                <h2 className="font-serif text-lg">{editingProduct ? "Editar Produto" : "Novo Produto"}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
                    <Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                    <Input value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Preço PIX</label>
                    <Input type="number" value={productForm.price_pix} onChange={(e) => setProductForm({...productForm, price_pix: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Preço Cartão</label>
                    <Input type="number" value={productForm.price_card} onChange={(e) => setProductForm({...productForm, price_card: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                  <Input value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={productForm.is_new} onChange={(e) => setProductForm({...productForm, is_new: e.target.checked})} />
                    <span className="text-sm">Destaque</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={productForm.is_sale} onChange={(e) => setProductForm({...productForm, is_sale: e.target.checked})} />
                    <span className="text-sm">Em promoção</span>
                  </label>
                  {productForm.is_sale && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Desconto %:</label>
                      <Input type="number" className="w-20" value={productForm.discount} onChange={(e) => setProductForm({...productForm, discount: e.target.value})} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProduct}>{editingProduct ? "Atualizar" : "Criar"}</Button>
                  <Button variant="outline" onClick={() => { setShowProductForm(false); setEditingProduct(null); }}>Cancelar</Button>
                </div>
              </div>
            )}

            {!Array.isArray(products) || products.length === 0 ? (
              <div className="border border-border rounded-lg p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="font-serif text-xl mb-2">Nenhum produto</h2>
                <p className="text-sm text-muted-foreground">Adicione produtos para começar.</p>
              </div>
            ) : (
              products.map((product: any) => (
                <div key={product.id} className="border border-border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <div className="flex gap-4 mt-1 text-sm">
                      <span>Pix: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price_pix)}</span>
                      <span>Cartão: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price_card)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {product.is_new && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Novo</span>}
                    {product.is_sale && <span className="text-xs bg-red-10 text-red-600 px-2 py-1 rounded">Promo</span>}
                    <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)} className="gap-1">
                      <Edit className="h-3 w-3" /> Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)} className="gap-1">
                      <Trash2 className="h-3 w-3" /> Excluir
                    </Button>
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
