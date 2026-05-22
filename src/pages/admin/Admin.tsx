import { useState, useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  AlertCircle,
  Users,
  Layers,
  Ticket,
  Folder,
  Settings,
  FileText,
  AlertTriangle
} from "lucide-react";

const sidebarItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/pedidos", icon: ShoppingCart, label: "Pedidos" },
  { path: "/admin/produtos", icon: Package, label: "Produtos" },
  { path: "/admin/conjuntos", icon: Layers, label: "Conjuntos" },
  { path: "/admin/clientes", icon: Users, label: "Clientes" },
  { path: "/admin/cupons", icon: Ticket, label: "Cupons" },
  { path: "/admin/categorias", icon: Folder, label: "Categorias" },
  { path: "/admin/configuracoes", icon: Settings, label: "Configurações" },
  { path: "/admin/logs", icon: FileText, label: "Logs" },
  { path: "/admin/estoque-baixo", icon: AlertTriangle, label: "Estoque Baixo" },
  { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      const token = localStorage.getItem("numar.token");
      const userStr = localStorage.getItem("numar.user");
      console.log("Admin check - Token exists:", !!token);
      console.log("Admin check - User in localStorage:", !!userStr);
      
      if (!token) {
        navigate("/conta");
        setCheckingAuth(false);
        return;
      }

      try {
        const user = await api.auth.profile();
        if (user.role === "admin") {
          setIsAdmin(true);
        } else {
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão de administrador."
          });
          navigate("/");
        }
      } catch (err: any) {
        // Log out user if token is invalid or expired and cannot be refreshed
        localStorage.removeItem("numar.token");
        localStorage.removeItem("numar.refreshToken");
        localStorage.removeItem("numar.user");
        toast({
          title: "Sessão Expirada",
          description: "Por favor, faça login novamente."
        });
        navigate("/conta");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminRole();
  }, [navigate, toast]);
              console.log("User profile after refresh:", user);
              if (user.role === "admin") {
                setIsAdmin(true);
                setCheckingAuth(false);
                return;
              } else {
                console.log("After refresh, user role is still not admin:", user.role);
              }
            } else {
              console.log("Refresh failed with status:", refreshRes.status);
              const errorText = await refreshRes.text();
              console.log("Refresh error response:", errorText);
            }
          } catch (refreshErr) {
            console.error("Token refresh failed:", refreshErr);
          }
        }
        // If refresh failed or user still not admin, clear session and redirect
        console.log("Clearing session and redirecting to /conta");
        localStorage.removeItem("numar.token");
        localStorage.removeItem("numar.refreshToken");
        localStorage.removeItem("numar.user");
        toast({
          title: "Erro de Autenticação",
          description: "Sessão expirada. Por favor, faça login novamente."
        });
        navigate("/conta");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminRole();
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem("numar.token");
    localStorage.removeItem("numar.refreshToken");
    localStorage.removeItem("numar.user");
    navigate("/conta");
  };

  if (checkingAuth) {
    return (
      <Layout>
        <SEO title="Painel Admin" description="Painel administrativo da Numar Store" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Verificando permissões...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <SEO title="Acesso Negado" description="Acesso negado ao painel administrativo" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <Button onClick={() => navigate("/")}>Voltar para a loja</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Painel Admin" description="Painel administrativo da Numar Store" />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Numar Store Admin</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out pt-20 lg:pt-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <nav className="p-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </Layout>
  );
}
