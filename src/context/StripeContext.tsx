import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "").catch(() => null);

interface StripeContextType {
  stripe: Stripe | null;
  elements: StripeElements | null;
  loading: boolean;
  createPaymentSession: (items: any[], orderId: string, metadata?: Record<string, string>) => Promise<void>;
}

const StripeContext = createContext<StripeContextType | null>(null);

export function StripeProvider({ children }: { children: ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    stripePromise.then((s) => {
      if (!cancelled) {
        setStripe(s || null);
        if (s) {
          const el = s.elements();
          setElements(el);
        }
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setStripe(null);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

const createPaymentSession = useCallback(async (items: any[], orderId: string, metadata: Record<string, string> = {}) => {
     if (!stripe) throw new Error("Stripe não carregado");
     const res = await fetch("/api/payments/create-checkout-session", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${localStorage.getItem("numar.token")}`,
       },
       body: JSON.stringify({ items, orderId, metadata }),
     });
     const data = await res.json();
     if (!res.ok) throw new Error(data.error || "Erro ao criar sessão");
     if (data.url) {
       window.location.href = data.url;
     } else {
       const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
       if (error) throw error;
     }
   }, [stripe]);

  return (
    <StripeContext.Provider value={{ stripe, elements, loading, createPaymentSession }}>
      {children}
    </StripeContext.Provider>
  );
}

export function useStripeContext() {
  const ctx = useContext(StripeContext);
  return ctx;
}

export { stripePromise };