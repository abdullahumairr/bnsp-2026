/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import API from "../services/api";

export interface CartItem {
  id: number;
  book_id?: number;
  title: string;
  author: string;
  price: number | string;
  discount_price?: number | string;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any, quantity: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("bv_token");
    if (!token) {
      setCart([]);
      return;
    }
    try {
      const res = await API.get("/cart");
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Gagal sinkronisasi cart:", e);
      setCart([]);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (item: any, quantity: number) => {
    const token = localStorage.getItem("bv_token");
    if (!token) throw new Error("Anda harus login terlebih dahulu");
    await API.post("/cart", { bookId: item.id, quantity });
    await fetchCart();
  };

  const updateQuantity = async (id: number, quantity: number) => {
    const token = localStorage.getItem("bv_token");
    if (!token) return;
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    await API.put(`/cart/${id}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (id: number) => {
    const token = localStorage.getItem("bv_token");
    if (!token) return;
    await API.delete(`/cart/${id}`);
    await fetchCart();
  };

  const clearCart = async () => {
    const token = localStorage.getItem("bv_token");
    if (!token) {
      setCart([]);
      return;
    }
    try {
      await API.delete("/cart");
    } catch (e) {
      console.error("Gagal membersihkan cart:", e);
    } finally {
      setCart([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
