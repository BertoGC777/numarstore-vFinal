import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Folder, 
  Plus, 
  Trash2, 
  RefreshCw,
  X
} from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

export default function AdminCategorias() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/categories");
      setCategories(data.categories || []);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao carregar categorias";
      toast({ title: "Erro", description: errorMsg });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({ title: "Erro", description: "Nome da categoria é obrigatório" });
      return;
    }

    try {
      await api.post("/admin/categories", { name: newCategory.trim() });
      toast({ title: "Sucesso", description: "Categoria adicionada com sucesso" });
      setNewCategory("");
      setDialogOpen(false);
      fetchCategories();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao adicionar categoria";
      toast({ title: "Erro", description: errorMsg });
    }
  };

  const handleDeleteClick = (category: string) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/admin/categories/${encodeURIComponent(categoryToDelete)}`);
      toast({ title: "Sucesso", description: "Categoria excluída com sucesso" });
      setDeleteDialogOpen(false);
      fetchCategories();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao excluir categoria";
      toast({ title: "Erro", description: errorMsg });
    } finally {
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Categorias</h2>
        <div className="flex gap-2">
          <Button
            onClick={fetchCategories}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Nova Categoria
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {categories.length} categor{categories.length !== 1 ? "ias" : "oria"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{category}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteClick(category)}
                    title="Excluir categoria"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da Categoria *</Label>
              <Input
                id="category-name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex: Acessórios"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir a categoria "{categoryToDelete}"? 
            Esta ação só será permitida se não houver produtos nesta categoria.
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
