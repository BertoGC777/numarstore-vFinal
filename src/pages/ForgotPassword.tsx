import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/components/ui/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Erro", description: "Digite seu e-mail" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO title="Esqueci Minha Senha" description="Recupere sua senha da Numar Store" />
      <div className="container-numar py-20 max-w-md">
        <Link to="/conta" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Conta
        </Link>

        <h1 className="font-serif text-3xl mb-2">Esqueci Minha Senha</h1>
        <p className="text-muted-foreground mb-8">
          Digite seu e-mail. Se existir uma conta cadastrada, enviaremos instruções para redefinir sua senha.
        </p>

        {success ? (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="font-serif text-xl mb-2 text-green-800 dark:text-green-300">E-mail enviado</h2>
            <p className="text-sm text-green-700 dark:text-green-400 mb-4">
              Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link para criar uma nova senha.
              Verifique também a caixa de spam.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              O envio de e-mail depende da configuração do servidor. Se não receber em alguns minutos, entre em contato pelo WhatsApp.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/conta">Voltar para login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}
