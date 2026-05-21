import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Ticket, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Power,
  Calendar,
  Percent,
  DollarSign
} from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  min_purchase: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: number | null;
  valid_until: number | null;
  categories: string | null;
  products: string | null;
  is_active: number;
  created_at: number;
}

interface CouponsResponse {
  coupons: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminCupons() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  
  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    min_purchase: "",
    max_discount: "",
    usage_limit: "",
    valid_from: "",
    valid_until: "",
    is_active: true
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "todos") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const data: CouponsResponse = await api.get(`/admin/coupons?${params.toString()}`);
      setCoupons(data.coupons);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error("Error fetching coupons:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao carregar cupons";
      toast({ title: "Erro", description: errorMsg });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCoupons();
  };

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        min_purchase: coupon.min_purchase.toString(),
        max_discount: coupon.max_discount?.toString() || "",
        usage_limit: coupon.usage_limit?.toString() || "",
        valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().split('T')[0] : "",
        valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : "",
        is_active: coupon.is_active === 1
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        type: "percentage",
        value: "",
        min_purchase: "",
        max_discount: "",
        usage_limit: "",
        valid_from: "",
        valid_until: "",
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        min_purchase: parseFloat(formData.min_purchase) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: formData.valid_from ? new Date(formData.valid_from).getTime() : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).getTime() : null
      };

      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, payload);
        toast({ title: "Sucesso", description: "Cupom atualizado com sucesso" });
      } else {
        await api.post("/admin/coupons", payload);
        toast({ title: "Sucesso", description: "Cupom criado com sucesso" });
      }

      handleCloseDialog();
      fetchCoupons();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao salvar cupom";
      toast({ title: "Erro", description: errorMsg });
    }
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;
    try {
      await api.delete(`/admin/coupons/${couponToDelete.id}`);
      toast({ title: "Sucesso", description: "Cupom excluído com sucesso" });
      setDeleteDialogOpen(false);
      fetchCoupons();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao excluir cupom";
      toast({ title: "Erro", description: errorMsg });
    } finally {
      setCouponToDelete(null);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon.id}`, { is_active: coupon.is_active ? 0 : 1 });
      toast({ title: "Sucesso", description: `Cupom ${coupon.is_active ? "desativado" : "ativado"} com sucesso` });
      fetchCoupons();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao alterar status do cupom";
      toast({ title: "Erro", description: errorMsg });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      percentage: "Percentual",
      fixed: "Valor Fixo"
    };
    return labels[type] || type;
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.valid_until) return false;
    return Date.now() > coupon.valid_until;
  };

  const isNotStarted = (coupon: Coupon) => {
    if (!coupon.valid_from) return false;
    return Date.now() < coupon.valid_from;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cupons de Desconto</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Cupom
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
                  placeholder="Buscar por código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Buscar</Button>
            </form>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={fetchCoupons}
              variant="outline"
              size="icon"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {total} cupom{total !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cupom encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Código</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Mínimo</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Uso</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Válido de</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Válido até</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-bold">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {coupon.type === "percentage" ? (
                          <div className="flex items-center gap-1">
                            <Percent className="h-4 w-4" />
                            {getTypeLabel(coupon.type)}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {getTypeLabel(coupon.type)}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-sm font-medium">
                        {coupon.type === "percentage" 
                          ? `${coupon.value}%` 
                          : formatCurrency(coupon.value)}
                      </td>
                      <td className="p-3 text-sm">{formatCurrency(coupon.min_purchase)}</td>
                      <td className="p-3 text-sm">
                        {coupon.usage_limit 
                          ? `${coupon.used_count}/${coupon.usage_limit}`
                          : `${coupon.used_count} (ilimitado)`}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(coupon.valid_from)}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(coupon.valid_until)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            coupon.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {coupon.is_active ? "Ativo" : "Inativo"}
                          </span>
                          {isExpired(coupon) && (
                            <span className="text-xs text-red-600">Expirado</span>
                          )}
                          {isNotStarted(coupon) && (
                            <span className="text-xs text-yellow-600">A iniciar</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(coupon)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(coupon)}
                            title={coupon.is_active ? "Desativar" : "Ativar"}
                          >
                            <Power className={`h-4 w-4 ${coupon.is_active ? "text-green-600" : "text-gray-400"}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(coupon)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupon Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="PROMO10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === "percentage" ? "10" : "50.00"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_purchase">Compra Mínima</Label>
                <Input
                  id="min_purchase"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.min_purchase}
                  onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_discount">Desconto Máximo</Label>
                <Input
                  id="max_discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.max_discount}
                  onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                  placeholder="Sem limite"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Limite de Uso</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  min="1"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Ilimitado"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Válido a partir de</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Válido até</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Cupom ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingCoupon ? "Atualizar" : "Criar"}
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
            Tem certeza que deseja excluir o cupom "{couponToDelete?.code}"? Esta ação não pode ser desfeita.
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
