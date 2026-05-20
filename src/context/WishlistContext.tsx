import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Product } from "@/data/products";

type WishlistContextType = {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const addToWishlist = (product: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      const newItems = [...prev, product];
      localStorage.setItem("numar.wishlist", JSON.stringify(newItems));
      return newItems;
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.id !== id);
      localStorage.setItem("numar.wishlist", JSON.stringify(newItems));
      return newItems;
    });
  };

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id);
  };

  useEffect(() => {
    const saved = localStorage.getItem("numar.wishlist");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
