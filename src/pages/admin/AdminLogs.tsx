import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Activity
} from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: number;
}

interface LogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ACTIONS = ["todos", "create", "update", "delete", "login", "logout", "view"];
const ENTITY_TYPES = ["todos", "product", "order", "customer", "coupon", "category", "settings"];

export default function AdminLogs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and pagination
  const [actionFilter, setActionFilter] = useState("todos");
  const [entityFilter, setEntityFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "todos") params.append("action", actionFilter);
      if (entityFilter !== "todos") params.append("entity_type", entityFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const data: LogsResponse = await api.get(`/admin/activity-logs?${params.toString()}`);
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error("Error fetching logs:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao carregar logs";
      toast({ title: "Erro", description: errorMsg });
      if (err.response?.status === 403) {
        navigate("/conta");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR");
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: "Criou",
      update: "Atualizou",
      delete: "Excluiu",
      login: "Login",
      logout: "Logout",
      view: "Visualizou"
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "bg-green-100 text-green-800",
      update: "bg-blue-100 text-blue-800",
      delete: "bg-red-100 text-red-800",
      login: "bg-purple-100 text-purple-800",
      logout: "bg-gray-100 text-gray-800",
      view: "bg-yellow-100 text-yellow-800"
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Logs de Atividade</h2>
        <Button
          onClick={fetchLogs}
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
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as ações</SelectItem>
                {ACTIONS.filter(a => a !== "todos").map(action => (
                  <SelectItem key={action} value={action}>
                    {getActionLabel(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as entidades</SelectItem>
                {ENTITY_TYPES.filter(e => e !== "todos").map(entity => (
                  <SelectItem key={entity} value={entity}>
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {total} registro{total !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data/Hora</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Usuário</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Ação</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Entidade</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Detalhes</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {log.user_name ? (
                          <div>
                            <p className="font-medium">{log.user_name}</p>
                            <p className="text-xs text-muted-foreground">{log.user_email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sistema</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        {log.entity_type ? (
                          <div>
                            <p className="font-medium">{log.entity_type}</p>
                            {log.entity_id && (
                              <p className="text-xs text-muted-foreground">ID: {log.entity_id.slice(0, 8)}</p>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-sm max-w-xs truncate">
                        {log.details || "-"}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {log.ip_address || "-"}
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
    </div>
  );
}
