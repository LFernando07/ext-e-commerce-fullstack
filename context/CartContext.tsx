"use client";

/**
 * @file context/CartContext.tsx
 * @description Contexto de React para el estado global del carrito de compras de Capsule Corp.
 *
 * @concept React 18/19 useSyncExternalStore, LocalStorage Synchronization, Avoid Cascading Renders
 *
 * 🎓 ¿POR QUÉ USAR useSyncExternalStore EN LUGAR DE useEffect + setState?
 * ─────────────────────────────────────────────────────────────────────────────
 * En React 19 y con el compilador de React, llamar a `setState()` de forma síncrona
 * dentro de un `useEffect` dispara el error:
 * "Calling setState synchronously within an effect can trigger cascading renders".
 *
 * `useSyncExternalStore` es la API oficial y recomendada por el equipo de React para
 * sincronizar el estado de componentes con almacenes externos al árbol de React (como `localStorage`):
 * 1. Cero renders en cascada: Se integra directamente en el ciclo de reconciliación de React.
 * 2. Cero Hydration Mismatch: `getServerSnapshot` provee el valor seguro para el servidor (`[]`),
 *    y `getSnapshot` lee el valor real del navegador en el cliente.
 * 3. Sincronización multi-pestaña: Escucha el evento nativo `storage`, sincronizando el carrito
 *    entre diferentes pestañas del navegador en tiempo real.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { CartItem, ECommerceProduct } from "@/types/dragonball";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: ECommerceProduct, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalZeni: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY =
  process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY || "capsule_corp_cart_v1";

// ── Helpers para useSyncExternalStore con localStorage ──

let cachedRawCart = "[]";
let cachedParsedCart: CartItem[] = [];

function subscribeToCart(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("capsule-cart-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("capsule-cart-updated", callback);
  };
}

function getCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") return cachedParsedCart;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || "[]";
    if (raw !== cachedRawCart) {
      cachedRawCart = raw;
      cachedParsedCart = JSON.parse(raw);
    }
    return cachedParsedCart;
  } catch {
    return cachedParsedCart;
  }
}

const SERVER_EMPTY_CART: CartItem[] = [];
function getServerCartSnapshot(): CartItem[] {
  return SERVER_EMPTY_CART;
}

function persistCart(newItems: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(newItems);
    localStorage.setItem(LOCAL_STORAGE_KEY, raw);
    cachedRawCart = raw;
    cachedParsedCart = newItems;
    window.dispatchEvent(new Event("capsule-cart-updated"));
  } catch (e) {
    console.warn("Error al guardar carrito en localStorage:", e);
  }
}

// ── Componente Provider ──

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Sincronización sin useEffect ni setState síncronos
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addToCart = useCallback((product: ECommerceProduct, quantity = 1) => {
    const current = getCartSnapshot();
    const existingIndex = current.findIndex(
      (item) => item.product.id === product.id
    );

    let nextItems: CartItem[];
    if (existingIndex > -1) {
      nextItems = current.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      nextItems = [
        ...current,
        {
          product,
          quantity,
          addedAt: new Date().toISOString(),
        },
      ];
    }

    persistCart(nextItems);
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    const current = getCartSnapshot();
    const nextItems = current.filter((item) => item.product.id !== productId);
    persistCart(nextItems);
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const current = getCartSnapshot();
    if (quantity <= 0) {
      const nextItems = current.filter((item) => item.product.id !== productId);
      persistCart(nextItems);
      return;
    }
    const nextItems = current.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    persistCart(nextItems);
  }, []);

  const clearCart = useCallback(() => {
    persistCart([]);
  }, []);

  const totalZeni = items.reduce(
    (acc, item) => acc + item.product.priceInZeni * item.quantity,
    0
  );

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalZeni,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook personalizado para consumir el contexto del carrito ──
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser utilizado dentro de un <CartProvider>");
  }
  return context;
}
