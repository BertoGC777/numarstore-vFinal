import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Folder, 
  Plus, 
  Trash2, 
  RefreshCw,
  X,
  Package
} from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

const FIXED_CATEGORIES = [
  { slug: "biquinis", label: "Biquínis" },
  { slug: "partes-de-cima", label: "Partes de Cima" },
  { slug: "partes-de-baixo", label: "Partes de Baixo" },
  { slug: "conjuntos", label: "Conjuntos" },
  { slug: "vestidos-longos", label: "Vestidos Longos" },
  { slug: "vestidos-curtos", label: "Vestidos Curtos" },
  { slug: "lancamentos", label: "Lançamentos" },
  { slug: "promocao", label: "Promoção" },
];

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
  created_at: number;
}

export default function AdminCategorias() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({});
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
  const [showNewSubcategoryForm, setShowNewSubcategoryForm] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategorySlug, setNewSubcategorySlug] = useState("");
  const [newSubcategoryCategory, setNewSubcategoryCategory] = useState("");

  const fetchCategoryCounts = async () => {
    try {
      const data = await api.get("/admin/products?limit=1000");
      const products = data.products || [];
      const counts: Record<string, number> = {};
      
      FIXED_CATEGORIES.forEach(cat => {
        counts[cat.slug] = products.filter((p: any) => p.category === cat.slug).length;
      });
      
      setCategoryProductCounts(counts);
    } catch (err: any) {
      console.error("Error fetching product counts:", err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const data = await api.get("/admin/subcategories");
      setSubcategories(data.subcategories || []);
    } catch (err: any) {
      console.error("Error fetching subcategories:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao carregar subcategorias";
      toast({ title: "Erro", description: errorMsg });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchCategoryCounts(), fetchSubcategories()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (newSubcategoryName) {
      const slug = newSubcategoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setNewSubcategorySlug(slug);
    } else {
      setNewSubcategorySlug("");
    }
  }, [newSubcategoryName]);

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      toast({ title: "Erro", description: "Nome da subcategoria é obrigatório" });
      return;
    }
    if (!newSubcategoryCategory) {
      toast({ title: "Erro", description: "Categoria pai é obrigatória" });
      return;
    }

    try {
      await api.post("/admin/subcategories", { 
        name: newSubcategoryName.trim(), 
        category_slug: newSubcategoryCategory 
      });
      toast({ title: "Sucesso", description: "Subcategoria adicionada com sucesso" });
      setNewSubcategoryName("");
      setNewSubcategorySlug("");
      setNewSubcategoryCategory("");
      setShowNewSubcategoryForm(false);
      fetchSubcategories();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao adicionar subcategoria";
      toast({ title: "Erro", description: errorMsg });
    }
  };

  const handleDeleteClick = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subcategoryToDelete) return;
    try {
      await api.delete(`/admin/subcategories/${subcategoryToDelete.id}`);
      toast({ title: "Sucesso", description: "Subcategoria excluída com sucesso" });
      setDeleteDialogOpen(false);
      fetchSubcategories();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao excluir subcategoria";
      toast({ title: "Erro", description: errorMsg });
    } finally {
      setSubcategoryToDelete(null);
    }
  };

  const getSubcategoriesByCategory = (categorySlug: string) => {
    return subcategories.filter(sub => sub.category_slug === categorySlug);
  };

  return (
    <div className="space-y-8">
      {/* SEÇÃO CATEGORIAS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Categorias</h2>
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Categorias Fixas (Somente Leitura)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {FIXED_CATEGORIES.map((cat) => (
                  <div
                    key={cat.slug}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Folder className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{categoryProductCounts[cat.slug] || 0} produto{(categoryProductCounts[cat.slug] || 0) !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO SUBCATEGORIAS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Subcategorias</h2>
          <Button onClick={() => setShowNewSubcategoryForm(!showNewSubcategoryForm)} className="gap-2">
            <Plus className="h-4 w-4" /> Nova Subcategoria
          </Button>
        </div>

        {/* Nova Subcategoria Form */}
        {showNewSubcategoryForm && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>Nova Subcategoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subcategory-name">Nome *</Label>
                  <Input
                    id="subcategory-name"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Ex: Vestidos de Festa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory-category">Categoria Pai *</Label>
                  <Select value={newSubcategoryCategory} onValueChange={setNewSubcategoryCategory}>
                    <SelectTrigger id="subcategory-category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIXED_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory-slug">Slug (Gerado Automaticamente)</Label>
                  <Input
                    id="subcategory-slug"
                    value={newSubcategorySlug}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddSubcategory}>Salvar</Button>
                <Button variant="outline" onClick={() => {
                  setShowNewSubcategoryForm(false);
                  setNewSubcategoryName("");
                  setNewSubcategorySlug("");
                  setNewSubcategoryCategory("");
                }}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Subcategorias por Categoria */}
        {FIXED_CATEGORIES.map((cat) => {
          const catSubcategories = getSubcategoriesByCategory(cat.slug);
          if (catSubcategories.length === 0) return null;
          
          return (
            <Card key={cat.slug} className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">{cat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {catSubcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <span className="font-medium">{sub.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({sub.slug})</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(sub)}
                        title="Excluir subcategoria"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {subcategories.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma subcategoria encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir a subcategoria "{subcategoryToDelete?.name}"?
          </p>
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Aviso: Excluir subcategoria não remove os produtos associados.
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
