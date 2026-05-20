import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { StripeProvider } from "@/context/StripeContext";
import { CouponProvider } from "@/context/CouponContext";
import { ToastProvider } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import ShippingBar from "@/components/ShippingBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { pageview } from "@/hooks/use-analytics";
import Index from "./pages/Index";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    pageview(pathname);
  }, [pathname]);
  return null;
};

const Catalog = lazy(() => import("./pages/Catalog"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const Account = lazy(() => import("./pages/Account"));
const Search = lazy(() => import("./pages/Search"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const CheckoutCancel = lazy(() => import("./pages/CheckoutCancel"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Admin = lazy(() => import("./pages/admin/Admin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminPedidos = lazy(() => import("./pages/admin/AdminPedidos"));
const AdminProdutos = lazy(() => import("./pages/admin/AdminProdutos"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Termos = lazy(() => import("./pages/Termos"));
const Trocas = lazy(() => import("./pages/Trocas"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Rastreio = lazy(() => import("./pages/Rastreio"));
const QuemSomos = lazy(() => import("./pages/QuemSomos"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("numar.token");
  const user = JSON.parse(localStorage.getItem("numar.user") || "{}");
  if (!token || user.role !== "admin") return <Navigate to="/conta" />;
  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 300000, retry: 1 } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StripeProvider>
        <WishlistProvider>
          <CartProvider>
            <CouponProvider>
              <ToastProvider>
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <ShippingBar />
                  <WhatsAppButton />
                  <CookieBanner />
                  <ErrorBoundary>
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-screen">
                          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      }
                    >
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/catalogo" element={<Catalog />} />
                        <Route path="/catalogo/:categoria" element={<Catalog />} />
                        <Route path="/produto/:slug" element={<ProductPage />} />
                        <Route path="/conta" element={<Account />} />
                        <Route path="/busca" element={<Search />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/checkout/success" element={<CheckoutSuccess />} />
                        <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>}>
                          <Route index element={<Dashboard />} />
                          <Route path="pedidos" element={<AdminPedidos />} />
                          <Route path="produtos" element={<AdminProdutos />} />
                          <Route path="analytics" element={<AdminAnalytics />} />
                        </Route>
                        <Route path="/rastreio" element={<Rastreio />} />
                        <Route path="/quem-somos" element={<QuemSomos />} />
                        <Route path="/privacidade" element={<Privacidade />} />
                        <Route path="/termos" element={<Termos />} />
                        <Route path="/trocas-e-devolucoes" element={<Trocas />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </BrowserRouter>
              </ToastProvider>
            </CouponProvider>
          </CartProvider>
        </WishlistProvider>
      </StripeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
