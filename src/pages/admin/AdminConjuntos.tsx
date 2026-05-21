import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import Image from "@/components/Image";

interface Bundle {
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
}

interface BundlesResponse {
  bundles: Bundle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminConjuntos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<Bundle | null>(null);
  
  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBundles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const data: BundlesResponse = await api.get(`/admin/bundles?${params.toString()}`);
      setBundles(data.bundles);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error("Error fetching bundles:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao carregar conjuntos";
      toast({ title: "Erro", description: errorMsg });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBundles();
  };

  const handleOpenDialog = (bundle?: Bundle) => {
    console.log("Opening dialog for bundle:", bundle?.id, bundle?.name);
    setEditingBundle(bundle || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBundle(null);
  };

  const handleDeleteClick = (bundle: Bundle) => {
    setBundleToDelete(bundle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bundleToDelete) return;
    try {
      console.log("Deleting bundle:", bundleToDelete.id, bundleToDelete.name);
      await api.delete(`/admin/bundles/${bundleToDelete.id}`);
      console.log("Bundle deleted successfully");
      toast({ title: "Sucesso", description: "Conjunto excluído com sucesso" });
      fetchBundles();
    } catch (err: any) {
      console.error("Error deleting bundle:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao excluir conjunto";
      toast({ title: "Erro", description: errorMsg });
    } finally {
      setDeleteDialogOpen(false);
      setBundleToDelete(null);
    }
  };

  const handleToggleActive = async (bundle: Bundle) => {
    try {
      console.log("Toggling bundle active status:", bundle.id, bundle.name, !bundle.is_active);
      await api.put(`/admin/bundles/${bundle.id}`, { is_active: bundle.is_active ? 0 : 1 });
      toast({ title: "Sucesso", description: `Conjunto ${bundle.is_active ? "desativado" : "ativado"} com sucesso` });
      fetchBundles();
    } catch (err: any) {
      console.error("Error toggling bundle active status:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao alterar status do conjunto";
      toast({ title: "Erro", description: errorMsg });
    }
  };

  const handleBundleSaved = () => {
    handleCloseDialog();
    fetchBundles();
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
        <h2 className="text-2xl font-bold">Conjuntos/Combos</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Conjunto
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
            <Button
              onClick={fetchBundles}
              variant="outline"
              size="icon"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bundles Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : bundles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum conjunto encontrado</h3>
            <p className="text-sm text-muted-foreground text-center">
              {searchQuery
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando seu primeiro conjunto"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {bundles.length} de {total} conjuntos
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bundles.map((bundle) => (
              <Card key={bundle.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {bundle.images && bundle.images.length > 0 ? (
                    <Image
                      src={bundle.images[0].url}
                      alt={bundle.name}
                      aspectRatio="square"
                      objectFit="contain"
                      loading="lazy"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {bundle.is_new && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Destaque
                      </span>
                    )}
                    {bundle.is_sale && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        -{bundle.discount}%
                      </span>
                    )}
                  </div>
                  {!bundle.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium">Inativo</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{bundle.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{bundle.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm">{formatCurrency(bundle.price_pix)}</p>
                      <p className="text-xs text-muted-foreground">Pix</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(bundle.price_card)}</p>
                      <p className="text-xs text-muted-foreground">Cartão</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleOpenDialog(bundle)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(bundle)}
                      title={bundle.is_active ? "Desativar" : "Ativar"}
                    >
                      <Power className={`h-4 w-4 ${bundle.is_active ? "text-green-600" : "text-gray-400"}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(bundle)}
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
                Página {page} de {totalPages} ({total} conjuntos no total)
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

      {/* Bundle Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBundle ? "Editar Conjunto" : "Novo Conjunto"}</DialogTitle>
          </DialogHeader>
          <FormularioProduto
            product={editingBundle}
            onSave={handleBundleSaved}
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
            Tem certeza que deseja excluir o conjunto "{bundleToDelete?.name}"? Esta ação não pode ser desfeita.
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
