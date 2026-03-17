import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";
import type { Product } from "@/data/products";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: number) => void;
  isWishlisted: (id: number) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);

  const addToWishlist = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.find(i => i.id === product.id)) return prev;
      toast.success(`${product.title} added to wishlist ❤️`);
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.info("Removed from wishlist");
  }, []);

  const isWishlisted = useCallback((id: number) => {
    return items.some(i => i.id === id);
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isWishlisted, totalItems: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};