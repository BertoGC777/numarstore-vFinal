import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  ShoppingBag,
  DollarSign,
  Calendar
} from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: number;
  order_count: number;
  total_spent: number;
}

interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CustomerDetail extends Customer {
  orders: any[];
}

const ROLES = ["todos", "user", "admin"];

export default function AdminClientes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Filters and pagination
  const [roleFilter, setRoleFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: ""
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "todos") params.append("role", roleFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const data: CustomersResponse = await api.get(`/admin/customers?${params.toString()}`);
      setCustomers(data.customers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao carregar clientes";
      toast({ title: "Erro", description: errorMsg });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleViewClick = async (customer: Customer) => {
    setSelectedCustomer(customer);
    try {
      const data = await api.get(`/admin/customers/${customer.id}`);
      setCustomerDetail(data);
      setViewDialogOpen(true);
    } catch (err: any) {
      toast({ title: "Erro", description: "Erro ao carregar detalhes do cliente" });
    }
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      role: customer.role
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedCustomer) return;
    try {
      await api.put(`/admin/customers/${selectedCustomer.id}`, editForm);
      toast({ title: "Sucesso", description: "Cliente atualizado com sucesso" });
      setEditDialogOpen(false);
      fetchCustomers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao atualizar cliente";
      toast({ title: "Erro", description: errorMsg });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    try {
      await api.delete(`/admin/customers/${customerToDelete.id}`);
      toast({ title: "Sucesso", description: "Cliente excluído com sucesso" });
      setDeleteDialogOpen(false);
      fetchCustomers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Erro ao excluir cliente";
      toast({ title: "Erro", description: errorMsg });
    } finally {
      setCustomerToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrador",
      user: "Cliente"
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      user: "bg-blue-100 text-blue-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <Button
          onClick={fetchCustomers}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
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
                  placeholder="Buscar por nome ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Buscar</Button>
            </form>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os papéis</SelectItem>
                <SelectItem value="user">Clientes</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {total} cliente{total !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Telefone</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Papel</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Pedidos</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Total Gasto</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cadastro</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{customer.name}</div>
                      </td>
                      <td className="p-3 text-sm">{customer.email}</td>
                      <td className="p-3 text-sm">{customer.phone || "-"}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(customer.role)}`}>
                          {getRoleLabel(customer.role)}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="h-4 w-4" />
                          {customer.order_count}
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(customer.total_spent)}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(customer.created_at)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewClick(customer)}
                            title="Ver detalhes"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(customer)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(customer)}
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {customerDetail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Nome</Label>
                  <p className="font-medium">{customerDetail.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{customerDetail.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{customerDetail.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Papel</Label>
                  <p className="font-medium">{getRoleLabel(customerDetail.role)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Data de Cadastro</Label>
                  <p className="font-medium">{formatDate(customerDetail.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Gasto</Label>
                  <p className="font-medium">{formatCurrency(customerDetail.total_spent)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Histórico de Pedidos</h3>
                {customerDetail.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum pedido encontrado</p>
                ) : (
                  <div className="space-y-2">
                    {customerDetail.orders.map((order: any) => (
                      <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">#{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.total)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'sent' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Papel</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Cliente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit}>
              Salvar
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
            Tem certeza que deseja excluir o cliente "{customerToDelete?.name}"? 
            {customerToDelete?.order_count > 0 && " Este cliente possui pedidos e não poderá ser excluído."}
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
