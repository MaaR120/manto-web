"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Item } from "@/types";

export interface CartItem extends Item {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Item) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void; // <--- NUEVA
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Cargar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("manto_cart");
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setTimeout(() => setCart(parsedCart), 0);
        } catch (error) {
          console.error("Error al cargar carrito:", error);
        }
      }
    }
  }, []);

  // 2. Guardar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("manto_cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: Item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // --- NUEVA FUNCIÓN ---
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return; // No permitimos bajar de 1 (para eso está eliminar)
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
}