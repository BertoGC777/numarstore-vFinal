import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Power
} from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";
import FormularioProduto from "./FormularioProduto";
const CATEGORIES = [
  "Biquínis",
  "Partes de Cima",
  "Partes de Baixo",
  "Conjuntos",
  "Vestidos Longos",
  "Vestidos Curtos"
];

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price_pix: number;
  price_card: number;
  is_new: number;
  is_sale: number;
  discount: number;
  is_active: number;
  images?: Array<{ url: string }>;
  stock?: Record<string, number>;
  colors?: Array<{ name: string; hex: string }>;
  sizes?: string[];
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminProdutos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Filters and pagination
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "todas") params.append("category", categoryFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      console.log("Fetching products with params:", params.toString());
      const data: ProductsResponse = await api.get(`/admin/products?${params.toString()}`);
      console.log("Products fetched:", data.products.length, "total:", data.total);
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao carregar produtos";
      toast({ title: "Erro", description: errorMsg });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleOpenDialog = async (product?: Product) => {
    console.log("Opening dialog for product:", product?.id, product?.name);
    
    if (product?.id) {
      // Carregar o produto completo do backend
      try {
        console.log("Fetching complete product data from backend:", product.id);
        const completeProduct = await api.get(`/admin/products/${product.id}`);
        console.log("Complete product data:", completeProduct);
        setEditingProduct(completeProduct);
        setDialogOpen(true);
      } catch (err: any) {
        console.error("Error fetching complete product:", err);
        toast({ title: "Erro", description: "Erro ao carregar dados do produto" });
      }
    } else {
      setEditingProduct(null);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      console.log("Deleting product:", productToDelete.id, productToDelete.name);
      await api.delete(`/admin/products/${productToDelete.id}`);
      console.log("Product deleted successfully");
      toast({ title: "Sucesso", description: "Produto excluído com sucesso" });
      fetchProducts();
    } catch (err: any) {
      console.error("Error deleting product:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao excluir produto";
      toast({ title: "Erro", description: errorMsg });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      console.log("Toggling product active status:", product.id, product.name, !product.is_active);
      const newActive = product.is_active === 0 ? 1 : 0;
      await api.put(`/admin/products/${product.id}`, { is_active: newActive });
      toast({ title: "Sucesso", description: `Produto ${newActive ? "ativado" : "desativado"} com sucesso` });
      fetchProducts();
    } catch (err: any) {
      console.error("Error toggling product active status:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao alterar status do produto";
      toast({ title: "Erro", description: errorMsg });
    }
  };

  const handleProductSaved = () => {
    handleCloseDialog();
    fetchProducts();
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
        <h2 className="text-2xl font-bold">Produtos</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Buscar</Button>
            </form>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={fetchProducts}
              variant="outline"
              size="icon"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground text-center">
              {searchQuery || categoryFilter !== "todas"
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando seu primeiro produto"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {products.length} de {total} produtos
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = "none";
                        const fallback = el.parentElement?.querySelector("[data-img-fallback]");
                        if (fallback) (fallback as HTMLElement).style.display = "flex";
                      }}
                    />
                  ) : null}
                  {product.images && product.images.length > 0 ? (
                    <div
                      data-img-fallback
                      className="absolute inset-0 hidden items-center justify-center bg-muted"
                    >
                      <span className="text-muted-foreground text-sm">Imagem não disponível</span>
                    </div>
                  ) : null}
                  {(!product.images || product.images.length === 0) && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {product.is_new && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Destaque
                      </span>
                    )}
                    {product.is_sale && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  {product.is_active === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <span className="text-white font-medium">Inativo</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm">{formatCurrency(product.price_pix)}</p>
                      <p className="text-xs text-muted-foreground">Pix</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(product.price_card)}</p>
                      <p className="text-xs text-muted-foreground">Cartão</p>
                    </div>
                  </div>
                  {/* Stock Display */}
                  {product.stock && Object.keys(product.stock).length > 0 ? (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Estoque Total:</span>
                        <span className="font-medium">
                          {Object.values(product.stock).reduce((sum, qty) => sum + qty, 0)} unidades
                        </span>
                      </div>
                      {product.colors && product.sizes && (
                        <div className="mt-1 text-muted-foreground">
                          {product.colors.length} cor(es) × {product.sizes.length} tamanho(s)
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-3 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
                      Estoque não configurado
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(product)}
                      title={product.is_active ? "Desativar" : "Ativar"}
                    >
                      <Power className={`h-4 w-4 ${product.is_active ? "text-green-600" : "text-gray-400"}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages} ({total} produtos no total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <FormularioProduto
            product={editingProduct}
            onSave={handleProductSaved}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o produto "{productToDelete?.name}"? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
