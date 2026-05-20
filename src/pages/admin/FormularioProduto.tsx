import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Plus, X, Upload } from "lucide-react";
import Image from "@/components/Image";

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
  id?: string;
  name: string;
  slug?: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription?: string;
  price_pix: number;
  price_card: number;
  originalPrice?: number;
  discount: number;
  colors?: Color[];
  sizes?: string[];
  images?: ProductImage[];
  stock?: Record<string, string>;
  is_new: number;
  is_sale: number;
  is_active: number;
}

interface FormularioProdutoProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function FormularioProduto({ product, onSave, onCancel }: FormularioProdutoProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    subcategory: "",
    description: "",
    shortDescription: "",
    price_pix: "",
    price_card: "",
    originalPrice: "",
    discount: "",
    colors: [] as Color[],
    sizes: [] as string[],
    images: [] as ProductImage[],
    stock: {} as Record<string, string>,
    is_new: false,
    is_sale: false,
    is_active: true
  });

  useEffect(() => {
    if (product) {
      console.log("Loading product data:", product);
      setFormData({
        name: product.name,
        slug: product.slug || "",
        category: product.category,
        subcategory: product.subcategory || "",
        description: product.description,
        shortDescription: product.shortDescription || "",
        price_pix: product.price_pix.toString(),
        price_card: product.price_card.toString(),
        originalPrice: product.originalPrice?.toString() || "",
        discount: product.discount.toString(),
        colors: product.colors || [],
        sizes: product.sizes || [],
        images: product.images || [],
        stock: product.stock || {},
        is_new: product.is_new === 1,
        is_sale: product.is_sale === 1,
        is_active: product.is_active === 1
      });
    }
  }, [product]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !product) {
      const slug = formData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, product]);

  // Calculate discount automatically
  useEffect(() => {
    if (formData.originalPrice && formData.price_pix && !product) {
      const original = parseFloat(formData.originalPrice);
      const current = parseFloat(formData.price_pix);
      if (original > current) {
        const discount = Math.round(((original - current) / original) * 100);
        setFormData(prev => ({ ...prev, discount: discount.toString() }));
      }
    }
  }, [formData.originalPrice, formData.price_pix, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        subcategory: formData.subcategory || null,
        description: formData.description,
        shortDescription: formData.shortDescription || null,
        price_pix: parseFloat(formData.price_pix),
        price_card: parseFloat(formData.price_card),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        discount: formData.is_sale ? parseFloat(formData.discount) : 0,
        colors: formData.colors,
        sizes: formData.sizes,
        images: formData.images,
        stock: formData.stock,
        is_new: formData.is_new ? 1 : 0,
        is_sale: formData.is_sale ? 1 : 0,
        is_active: formData.is_active ? 1 : 0
      };

      console.log("Saving product:", product?.id ? "UPDATE" : "CREATE", payload);

      if (product?.id) {
        await api.put(`/admin/products/${product.id}`, payload);
        console.log("Product updated successfully");
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso" });
      } else {
        await api.post("/admin/products", payload);
        console.log("Product created successfully");
        toast({ title: "Sucesso", description: "Produto criado com sucesso" });
      }

      onSave();
    } catch (err: any) {
      console.error("Error saving product:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao salvar produto";
      toast({ title: "Erro", description: errorMsg });
    } finally {
      setLoading(false);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ex: Vestido Floral Verão"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="vestido-floral-verao"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategoria</Label>
            <Input
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              placeholder="Ex: Alça Fina"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Descrição Curta</Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            placeholder="Breve descrição para listagens"
            maxLength={150}
          />
          <p className="text-xs text-muted-foreground">{formData.shortDescription.length}/150 caracteres</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição Longa *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            required
            placeholder="Descrição detalhada do produto..."
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preços</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price_pix">Preço PIX *</Label>
            <Input
              id="price_pix"
              type="number"
              step="0.01"
              min="0"
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
              min="0"
              value={formData.price_card}
              onChange={(e) => setFormData({ ...formData, price_card: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="originalPrice">Preço Original</Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              placeholder="Para cálculo de desconto"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
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
                className="w-24"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tamanhos Disponíveis</h3>
        <div className="flex flex-wrap gap-3">
          {SIZES.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size}`}
                checked={formData.sizes.includes(size)}
                onCheckedChange={() => handleSizeToggle(size)}
              />
              <Label
                htmlFor={`size-${size}`}
                className="cursor-pointer px-3 py-2 border rounded-md hover:bg-gray-50"
              >
                {size}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cores</h3>
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
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveColor(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddColor}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Adicionar Cor
        </Button>
      </div>

      {/* Stock Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gerenciamento de Estoque</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure o estoque para cada combinação de cor e tamanho. Deixe em branco ou 0 para esgotado.
        </p>
        
        {formData.colors.length > 0 && formData.sizes.length > 0 ? (
          <div className="space-y-4">
            {formData.colors.map((color, colorIdx) => (
              <div key={colorIdx} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="font-medium">{color.name || `Cor ${colorIdx + 1}`}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {formData.sizes.map((size) => {
                    const stockKey = `${colorIdx}-${size}`;
                    return (
                      <div key={stockKey} className="space-y-1">
                        <Label className="text-xs">{size}</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Qtd"
                          value={formData.stock?.[stockKey] || ""}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              stock: {
                                ...formData.stock,
                                [stockKey]: e.target.value
                              }
                            });
                          }}
                          className="text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Adicione cores e tamanhos primeiro para gerenciar o estoque.
          </p>
        )}
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Imagens</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB</p>
          </label>
        </div>
        
        {formData.images.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {formData.images.map((img, index) => (
              <div key={index} className="relative group">
                <Image
                  src={img.url}
                  alt={`Imagem ${index + 1}`}
                  aspectRatio="square"
                  objectFit="contain"
                  loading="lazy"
                  className="w-full h-32 rounded-lg border"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Status</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="is_new"
              checked={formData.is_new}
              onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
            />
            <Label htmlFor="is_new">Em destaque</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Ativo</Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : product ? "Atualizar Produto" : "Criar Produto"}
        </Button>
      </DialogFooter>
    </form>
  );
}
