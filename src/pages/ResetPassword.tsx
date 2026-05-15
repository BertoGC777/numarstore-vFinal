import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({ title: "Erro", description: "Preencha todos os campos" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter no mínimo 6 caracteres" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem" });
      return;
    }
    if (!token) {
      toast({ title: "Erro", description: "Token inválido" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      toast({ title: "Sucesso", description: "Senha redefinida com sucesso" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.response?.data?.error || "Erro ao redefinir senha" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO title="Redefinir Senha" description="Redefina sua senha da Numar Store" />
      <div className="container-numar py-20 max-w-md">
        <Link to="/conta" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Conta
        </Link>

        <h1 className="font-serif text-3xl mb-2">Redefinir Senha</h1>
        <p className="text-muted-foreground mb-8">
          Digite sua nova senha abaixo.
        </p>

        {success ? (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="font-serif text-xl mb-2 text-green-800 dark:text-green-300">Senha Redefinida!</h2>
            <p className="text-sm text-green-700 dark:text-green-400 mb-4">
              Sua senha foi redefinida com sucesso.
            </p>
            <Button asChild className="w-full">
              <Link to="/conta">Fazer Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}
