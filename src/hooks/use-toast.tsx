import { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (t: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let counter = 0;

// Reference for toast() outside React components
let _addToast: ((t: Omit<Toast, "id">) => void) | null = null;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (t: Omit<Toast, "id">) => {
    const id = `${++counter}`;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  };

  _addToast = addToast;

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return {
    toast: (opts: { title: string; description?: string }) => ctx.addToast(opts),
  };
}

// Standalone toast function usable outside components (e.g., in api handlers)
export function toast(opts: { title: string; description?: string }) {
  if (_addToast) _addToast(opts);
}

export function Toaster() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
      {ctx.toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => ctx.removeToast(t.id)}
          className="pointer-events-auto bg-background border border-border rounded-lg p-4 shadow-lg text-sm animate-fade-in cursor-pointer"
        >
          <p className="font-medium">{t.title}</p>
          {t.description && <p className="text-muted-foreground text-xs mt-1">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}