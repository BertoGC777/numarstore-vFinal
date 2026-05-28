import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Product } from "@/data/products";

export type CartItem = {
  id: number;
  productId: string;
  slug: string;
  name: string;
  image: string;
  pricePix: number;
  priceCard: number;
  color: string;
  size: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (product: Product, color: string, size: string, qty?: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQty: (id: number, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  subtotal: number;
  count: number;
  loadCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadCart = async () => {
    const saved = localStorage.getItem("numar.cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  };

  const addItem: CartContextType["addItem"] = async (product, color, size, qty = 1) => {
    const newItem: CartItem = {
      id: Date.now(),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] || "",
      pricePix: product.pricePix,
      priceCard: product.priceCard,
      color,
      size,
      quantity: qty,
    };
    
    // Atualiza estado local e localStorage ANTES de chamar API
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === newItem.productId && i.color === newItem.color && i.size === newItem.size);
      let newItems;
      if (existing) {
        newItems = prev.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + qty } : i));
      } else {
        newItems = [...prev, newItem];
      }
      localStorage.setItem("numar.cart", JSON.stringify(newItems));
      return newItems;
    });
    
    setIsOpen(true);
  };

  const removeItem: CartContextType["removeItem"] = async (id) => {
    const newItems = items.filter((i) => i.id !== id);
    setItems(newItems);
    localStorage.setItem("numar.cart", JSON.stringify(newItems));
  };

  const updateQty: CartContextType["updateQty"] = async (id, qty) => {
    if (qty <= 0) {
      await removeItem(id);
      return;
    }
    const newItems = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
    setItems(newItems);
    localStorage.setItem("numar.cart", JSON.stringify(newItems));
  };

  const clear: CartContextType["clear"] = async () => {
    setItems([]);
    localStorage.setItem("numar.cart", JSON.stringify([]));
  };

  const subtotal = items.reduce((s, i) => s + (i.pricePix || 0) * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  // Carrega carrinho ao montar
  useEffect(() => {
    loadCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
        addItem,
        removeItem,
        updateQty,
        clear,
        subtotal,
        count,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};