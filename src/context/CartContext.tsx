import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const BASE_URL = "https://cartnest-backend-ukav.onrender.com";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from backend when user logs in
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    fetch(`${BASE_URL}/api/cart/items?username=${user.username}`)
      .then(res => res.json())
      .then(data => {
        const products = data?.cart?.products || [];
        const mapped: CartItem[] = products.map((p: any) => ({
          id: p.product_id,
          title: p.name,
          price: p.price_per_unit,
          image: p.image_url,
          quantity: p.quantity,
        }));
        setItems(mapped);
      })
      .catch(() => setItems([]));
  }, [user]);

  // Add to cart
  const addToCart = useCallback((product: Omit<CartItem, "quantity">) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    fetch(`${BASE_URL}/api/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, productId: product.id, quantity: 1 }),
    }).then(() => {
      setItems(prev => {
        const existing = prev.find(i => i.id === product.id);
        if (existing) {
          toast.success(`Updated quantity for ${product.title}`);
          return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        toast.success(`${product.title} added to cart`);
        return [...prev, { ...product, quantity: 1 }];
      });
    }).catch(() => toast.error("Failed to add to cart"));
  }, [user]);

  // Remove from cart
  const removeFromCart = useCallback((id: number) => {
    if (!user) return;
    fetch(`${BASE_URL}/api/cart/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, productId: id }),
    }).then(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      toast.info("Item removed from cart");
    }).catch(() => toast.error("Failed to remove item"));
  }, [user]);

  // Update quantity
  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (!user) return;
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    fetch(`${BASE_URL}/api/cart/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, productId: id, quantity }),
    }).then(() => {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }).catch(() => toast.error("Failed to update quantity"));
  }, [user, removeFromCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
    toast.info("Cart cleared");
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};