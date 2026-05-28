import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Upload } from "lucide-react";
import Image from "@/components/Image";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CATEGORIES_DEFAULT = [
  { label: "Biquínis", value: "biquinis" },
  { label: "Partes de Cima", value: "partes-de-cima" },
  { label: "Partes de Baixo", value: "partes-de-baixo" },
  { label: "Vestidos Longos", value: "vestidos-longos" },
  { label: "Vestidos Curtos", value: "vestidos-curtos" }
];

const SIZES = ["PP", "P", "M", "G", "GG", "Único"];

interface Color {
  name: string;
  hex: string;
}

interface ProductImage {
  url: string; // Isso agora pode ser uma URL ou uma Data URL temporária para preview
  color?: string;
  colorHex?: string;
  file?: File; // Adicionar uma propriedade para o arquivo original
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
  stock?: Record<string, number>;
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>(CATEGORIES_DEFAULT);

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
    stock: {} as Record<string, number>,
    is_new: false,
    is_sale: false,
    is_active: true
  });

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
    } else {
      setSubcategories([]);
    }
  }, [formData.category]);

  const fetchSubcategories = async (categorySlug: string) => {
    try {
      const data = await api.get(`/admin/subcategories/${categorySlug}`);
      setSubcategories(data.subcategories || []);
    } catch (err: any) {
      console.error("Error fetching subcategories:", err);
      setSubcategories([]);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get("/admin/categories");
        if (data.categories && data.categories.length > 0) {
          const dynamicCategories = data.categories.map((cat: Category) => ({
            label: cat.name,
            value: cat.slug
          }));
          setCategories(dynamicCategories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Keep default categories if API fails
      }
    };
    fetchCategories();
  }, []);

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
    
    console.log("=== FormularioProduto: handleSubmit ===");
    console.log("Product ID:", product?.id);
    console.log("Form data:", formData);
    
    // Validação no frontend
    console.log("=== Validation ===");
    console.log("Name:", formData.name, "Valid:", !!formData.name.trim());
    console.log("Category:", formData.category, "Valid:", !!formData.category);
    console.log("Description:", formData.description, "Valid:", !!formData.description.trim());
    console.log("Price PIX:", formData.price_pix, "Valid:", !!(formData.price_pix && parseFloat(formData.price_pix) > 0));
    console.log("Price Card:", formData.price_card, "Valid:", !!(formData.price_card && parseFloat(formData.price_card) > 0));
    console.log("Sizes:", formData.sizes, "Valid:", formData.sizes.length > 0);
    console.log("Colors:", formData.colors, "Valid:", formData.colors.length > 0);
    console.log("Images:", formData.images, "Valid:", formData.images.length > 0);

    if (!formData.name.trim()) {
      console.error("Validation failed: Name is empty");
      toast({ title: "Erro", description: "Nome do produto é obrigatório" });
      return;
    }
    // Categoria opcional - permitir edição de produtos sem categoria
    // if (!formData.category) {
    //   console.error("Validation failed: Category is empty");
    //   toast({ title: "Erro", description: "Categoria do produto é obrigatória" });
    //   return;
    // }
    if (!formData.description.trim()) {
      console.error("Validation failed: Description is empty");
      toast({ title: "Erro", description: "Descrição do produto é obrigatória" });
      return;
    }
    if (!formData.price_pix || parseFloat(formData.price_pix) <= 0) {
      console.error("Validation failed: Price PIX is invalid");
      toast({ title: "Erro", description: "Preço PIX deve ser maior que zero" });
      return;
    }
    if (!formData.price_card || parseFloat(formData.price_card) <= 0) {
      console.error("Validation failed: Price Card is invalid");
      toast({ title: "Erro", description: "Preço cartão deve ser maior que zero" });
      return;
    }
    if (formData.sizes.length === 0) {
      console.error("Validation failed: No sizes selected");
      toast({ title: "Erro", description: "Selecione pelo menos um tamanho" });
      return;
    }
    if (formData.colors.length === 0) {
      console.error("Validation failed: No colors added");
      toast({ title: "Erro", description: "Adicione pelo menos uma cor" });
      return;
    }
    if (formData.images.length === 0) {
      console.error("Validation failed: No images added");
      toast({ title: "Erro", description: "Adicione pelo menos uma imagem" });
      return;
    }
    console.log("=== Validation passed ===");

    // Slug uniqueness validation
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000)
      );
      const existingProducts = await Promise.race([
        api.get(`/admin/products?slug=${formData.slug}`),
        timeoutPromise
      ]) as any;
      if (existingProducts?.products?.length > 0) {
        const existingProduct = existingProducts.products[0];
        if (existingProduct.id !== product?.id) {
          toast({ title: "Erro", description: "Este slug já está em uso. Escolha outro nome." });
          return;
        }
      }
    } catch (err: any) {
      console.warn("Slug check skipped:", err.message);
      // Continua salvando mesmo se a verificação falhar
    }

    setLoading(true);

    try {
      // Reorder images by color before saving
      const reorderedImages = reorderImagesByColor(formData.images, formData.colors);
      
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
        images: reorderedImages,
        stock: formData.stock,
        is_new: formData.is_new ? 1 : 0,
        is_sale: formData.is_sale ? 1 : 0,
        is_active: formData.is_active ? 1 : 0
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));
      console.log("API URL:", import.meta.env.VITE_API_URL || "http://localhost:3001/api");
      console.log("Endpoint:", `/admin/products/${product?.id}`);

      if (product?.id) {
        console.log("Calling PUT /admin/products/" + product.id);
        await api.put(`/admin/products/${product.id}`, payload);
        console.log("Product updated successfully");
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso" });
      } else {
        console.log("Calling POST /admin/products");
        await api.post("/admin/products", payload);
        console.log("Product created successfully");
        toast({ title: "Sucesso", description: "Produto criado com sucesso" });
      }

      onSave();
    } catch (err: any) {
      console.error("Error saving product:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (formData.colors.length === 0) {
      toast({ title: "Aviso", description: "Adicione as cores primeiro, depois faça o upload das imagens e associe cada imagem a uma cor." });
      return;
    }

    setUploadingImage(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Erro ao fazer upload de ${file.name}: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        return {
          url: publicUrlData.publicUrl,
          color: "",
          colorHex: ""
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

      toast({ title: "Sucesso", description: "Imagens enviadas com sucesso" });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({ title: "Erro", description: error.message || "Erro ao enviar imagens" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleImageColorChange = (index: number, colorName: string, colorHex: string) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], color: colorName, colorHex };
    setFormData({ ...formData, images: newImages });
  };

  const reorderImagesByColor = (images: ProductImage[], colors: Color[]): ProductImage[] => {
    if (colors.length === 0) return images;
    
    // Group images by color
    const imagesByColor: Record<string, ProductImage[]> = {};
    colors.forEach(c => imagesByColor[c.name] = []);
    
    images.forEach(img => {
      if (img.color && imagesByColor[img.color]) {
        imagesByColor[img.color].push(img);
      } else {
        // Images without color go to a separate group
        if (!imagesByColor['']) imagesByColor[''] = [];
        imagesByColor[''].push(img);
      }
    });
    
    // Find max number of images per color
    const maxImages = Math.max(...Object.values(imagesByColor).map(arr => arr.length));
    
    // Interleave images: first image of each color, then second image of each color, etc.
    const reordered: ProductImage[] = [];
    for (let i = 0; i < maxImages; i++) {
      colors.forEach(c => {
        if (imagesByColor[c.name][i]) {
          reordered.push(imagesByColor[c.name][i]);
        } else {
          // Add placeholder if color has no image at this position
          reordered.push({ url: '', color: c.name, colorHex: c.hex });
        }
      });
    }
    
    // Add images without color at the end
    if (imagesByColor['']) {
      reordered.push(...imagesByColor['']);
    }
    
    return reordered;
  };

  return (
    <form 
      onSubmit={(e) => {
        console.log("Form onSubmit event triggered");
        console.log("Event target:", e.target);
        console.log("Event type:", e.type);
        handleSubmit(e);
      }} 
      className="space-y-6"
    >
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
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategoria</Label>
            {subcategories.length > 0 ? (
              <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.slug}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="Ex: Alça Fina"
              />
            )}
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
        <h3 className="text-lg font-semibold">Controle de Estoque</h3>
        <p className="text-sm text-muted-foreground">
          Defina a quantidade em estoque para cada combinação de cor e tamanho.
        </p>
        
        {formData.colors.length > 0 && formData.sizes.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Cor</th>
                  {formData.sizes.map((size) => (
                    <th key={size} className="px-4 py-2 text-center text-sm font-medium">{size}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.colors.map((color, colorIdx) => (
                  <tr key={colorIdx} className="border-t">
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name || `Cor ${colorIdx + 1}`}
                      </div>
                    </td>
                    {formData.sizes.map((size) => {
                      const stockKey = `${color.name || colorIdx}-${size}`;
                      return (
                        <td key={size} className="px-4 py-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            value={formData.stock[stockKey] || 0}
                            onChange={(e) => {
                              const newStock = { ...formData.stock };
                              newStock[stockKey] = parseInt(e.target.value) || 0;
                              setFormData({ ...formData, stock: newStock });
                            }}
                            className="w-20 text-center"
                            placeholder="0"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Adicione pelo menos uma cor e um tamanho para gerenciar o estoque.
          </p>
        )}
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Imagens</h3>
        {formData.colors.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Adicione as cores primeiro, depois faça o upload das imagens e associe cada imagem a uma cor.
          </div>
        )}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                {formData.colors.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <select
                      value={img.color || ""}
                      onChange={(e) => {
                        const selectedColor = formData.colors.find(c => c.name === e.target.value);
                        if (selectedColor) {
                          handleImageColorChange(index, selectedColor.name, selectedColor.hex);
                        }
                      }}
                      className="w-full text-xs bg-white/90 dark:bg-black/90 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                    >
                      <option value="">Selecione cor</option>
                      {formData.colors.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
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

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="min-w-[140px]"
          onClick={(e) => {
            console.log("Submit button clicked");
            console.log("Form data before submit:", formData);
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Salvando...
            </span>
          ) : product ? "Atualizar Produto" : "Criar Produto"}
        </Button>
      </div>
    </form>
  );
}
