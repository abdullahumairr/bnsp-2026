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
import axios from "axios";

export interface CartItem {
  id: number; // cart.id — dipakai untuk update/delete
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
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setCart(data);
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

    await axios.post(
      "http://localhost:5000/api/cart",
      { bookId: item.id, quantity },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await fetchCart();
  };

  const updateQuantity = async (id: number, quantity: number) => {
    const token = localStorage.getItem("bv_token");
    if (!token) return;

    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    await axios.put(
      `http://localhost:5000/api/cart/${id}`,
      { quantity },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await fetchCart();
  };

  const removeFromCart = async (id: number) => {
    const token = localStorage.getItem("bv_token");
    if (!token) return;
    await axios.delete(`http://localhost:5000/api/cart/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchCart();
  };

  // ✅ clearCart: 1 request saja ke DELETE /api/cart (hapus semua sekaligus)
  const clearCart = async () => {
    const token = localStorage.getItem("bv_token");
    if (!token) {
      setCart([]);
      return;
    }
    try {
      await axios.delete("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
