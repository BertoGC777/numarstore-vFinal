import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Package, Plus, Edit, Trash2, X, Upload, Check } from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  "Biquínis",
  "Partes de Cima",
  "Partes de Baixo",
  "Conjuntos",
  "Vestidos Longos",
  "Vestidos Curtos"
];

const SIZES = ["PP", "P", "M", "G", "GG", "Único"];

interface Color {
  name: string;
  hex: string;
}

interface ProductImage {
  url: string;
  color?: string;
  colorHex?: string;
}

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
  colors?: Color[];
  sizes?: string[];
  images?: ProductImage[];
}

export default function AdminProdutos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price_pix: "",
    price_card: "",
    is_new: false,
    is_sale: false,
    discount: "",
    colors: [] as Color[],
    sizes: [] as string[],
    images: [] as ProductImage[]
  });

  useEffect(() => {
    const token = localStorage.getItem("numar.token");
    if (!token) {
      navigate("/conta");
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/products");
      // Fetch details for each product
      const productsWithDetails = await Promise.all(
        data.map(async (product: Product) => {
          const details = await api.get(`/admin/products/${product.id}`);
          return { ...product, ...details };
        })
      );
      setProducts(productsWithDetails);
    } catch (err: any) {
      toast({ title: "Erro", description: err.response?.data?.error || "Erro ao carregar produtos" });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        description: product.description,
        price_pix: product.price_pix.toString(),
        price_card: product.price_card.toString(),
        is_new: product.is_new === 1,
        is_sale: product.is_sale === 1,
        discount: product.discount.toString(),
        colors: product.colors || [],
        sizes: product.sizes || [],
        images: product.images || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "",
        description: "",
        price_pix: "",
        price_card: "",
        is_new: false,
        is_sale: false,
        discount: "",
        colors: [],
        sizes: [],
        images: []
      });
    }
    setDialogOpen(true);
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
      await api.delete(`/admin/products/${productToDelete.id}`);
      toast({ title: "Sucesso", description: "Produto excluído com sucesso" });
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Erro", description: err.response?.data?.error || "Erro ao excluir produto" });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price_pix: parseFloat(formData.price_pix),
        price_card: parseFloat(formData.price_card),
        is_new: formData.is_new,
        is_sale: formData.is_sale,
        discount: formData.is_sale ? parseFloat(formData.discount) : 0,
        colors: formData.colors,
        sizes: formData.sizes,
        images: formData.images
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso" });
      } else {
        await api.post("/admin/products", payload);
        toast({ title: "Sucesso", description: "Produto criado com sucesso" });
      }

      handleCloseDialog();
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Erro", description: err.response?.data?.error || "Erro ao salvar produto" });
    }
  };

  const handleAddColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: "", hex: "#000000" }]
    });
  };

  const handleRemoveColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index)
    });
  };

  const handleColorChange = (index: number, field: keyof Color, value: string) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setFormData({ ...formData, colors: newColors });
  };

  const handleSizeToggle = (size: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.includes(size)
        ? formData.sizes.filter(s => s !== size)
        : [...formData.sizes, size]
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { url: reader.result as string }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  return (
    <Layout>
      <SEO title="Gerenciar Produtos" description="Painel de gerenciamento de produtos" />
      <div className="container-numar py-10 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl">Gerenciar Produtos</h1>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar Produto
          </Button>
        </div>

        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        ) : products.length === 0 ? (
          <div className="border border-border rounded-lg p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-serif text-xl mb-2">Nenhum produto</h2>
            <p className="text-sm text-muted-foreground">Não há produtos cadastrados.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="border border-border rounded-lg p-4 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {product.images && product.images.length > 0 && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Pix: R$ {product.price_pix.toFixed(2)}</span>
                        <span>Cartão: R$ {product.price_card.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {product.is_new && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Destaque</span>}
                        {product.is_sale && <span className="text-xs bg-red-10 text-red-600 px-2 py-1 rounded">Promo {product.discount}%</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenDialog(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_pix">Preço PIX *</Label>
                <Input
                  id="price_pix"
                  type="number"
                  step="0.01"
                  value={formData.price_pix}
                  onChange={(e) => setFormData({ ...formData, price_pix: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_card">Preço Cartão *</Label>
                <Input
                  id="price_card"
                  type="number"
                  step="0.01"
                  value={formData.price_card}
                  onChange={(e) => setFormData({ ...formData, price_card: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <Label>Cores</Label>
              {formData.colors.map((color, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Nome da cor"
                    value={color.name}
                    onChange={(e) => handleColorChange(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="color"
                    value={color.hex}
                    onChange={(e) => handleColorChange(index, "hex", e.target.value)}
                    className="w-16 h-10"
                  />
                  <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveColor(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={handleAddColor} className="gap-2">
                <Plus className="h-4 w-4" /> Adicionar Cor
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Tamanhos</Label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    size="sm"
                    variant={formData.sizes.includes(size) ? "default" : "outline"}
                    onClick={() => handleSizeToggle(size)}
                    className="min-w-[60px]"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Imagens</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para adicionar imagens</p>
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img.url} alt={`Imagem ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_new"
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                />
                <Label htmlFor="is_new">Destaque</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_sale"
                  checked={formData.is_sale}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_sale: checked })}
                />
                <Label htmlFor="is_sale">Em promoção</Label>
              </div>
              {formData.is_sale && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="discount">Desconto (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-20"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProduct ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
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
    </Layout>
  );
}
