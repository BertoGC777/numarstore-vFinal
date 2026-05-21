import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  RefreshCw,
  Package,
  ArrowRight
} from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  color: string;
  size: string;
  quantity: number;
}

export default function AdminEstoqueBaixo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/low-stock?threshold=${threshold}`);
      setProducts(data.products || []);
    } catch (err: any) {
      console.error("Error fetching low stock:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao carregar produtos com estoque baixo";
      toast({ title: "Erro", description: errorMsg });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, [threshold]);

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 0) {
      setThreshold(value);
    }
  };

  const goToProduct = (productId: string) => {
    navigate(`/admin/produtos`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estoque Baixo</h2>
        <Button
          onClick={fetchLowStock}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Threshold Control */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Alertar quando estoque for menor ou igual a:</label>
            <Input
              type="number"
              min="0"
              value={threshold}
              onChange={handleThresholdChange}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">unidades</span>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {products.length} produto{products.length !== 1 ? "s" : ""} com estoque baixo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum produto com estoque baixo encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={`${product.id}-${product.color}-${product.size}`}
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-x-2">
                      <span>{product.category}</span>
                      <span>•</span>
                      <span>Cor: {product.color}</span>
                      <span>•</span>
                      <span>Tamanho: {product.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{product.quantity}</p>
                      <p className="text-xs text-muted-foreground">unidades</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => goToProduct(product.id)}
                      className="gap-2"
                    >
                      Gerenciar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
