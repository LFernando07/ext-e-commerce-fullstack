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
  useEffect,
  useSyncExternalStore,
} from "react";
import { CartItem, ECommerceProduct } from "@/types/dragonball";

export interface CartCoupon {
  code: string;
  discountPercent: number;
}

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
  restoreCart: (items: CartItem[]) => void;
  coupon: CartCoupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
  discountedTotalZeni: number;
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
  const [coupon, setCoupon] = useState<CartCoupon | null>(null);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const applyCoupon = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'HOIPOI10' || normalized === 'BULMA10') {
      setCoupon({ code: normalized, discountPercent: 10 });
      return true;
    }
    if (normalized === 'CAPSULE15') {
      setCoupon({ code: normalized, discountPercent: 15 });
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
  }, []);

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
    setCoupon(null);
  }, []);

  const restoreCart = useCallback((newItems: CartItem[]) => {
    persistCart(newItems);
  }, []);

  // Escuchar si el usuario llega con ?recover_cart=TOKEN o ?coupon=... desde el correo de Resend
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const couponParam = params.get("coupon");
    const recoverToken = params.get("recover_cart");

    if (couponParam && !recoverToken) {
      queueMicrotask(() => {
        applyCoupon(couponParam);
      });
    }

    if (recoverToken) {
      fetch(`/api/cart/recover?token=${recoverToken}`)
        .then((res) => res.json())
        .then((data) => {
          // Al retomar el carrito abandonado, aplicar automáticamente el cupón HOIPOI10 (10% de descuento)
          setCoupon({ code: couponParam || 'HOIPOI10', discountPercent: 10 });

          if (data.success && data.cart && Array.isArray(data.cart.items)) {
            const restoredItems: CartItem[] = data.cart.items.map(
              (it: {
                product?: ECommerceProduct;
                productId?: number;
                id?: number;
                name: string;
                priceInZeni?: number;
                unitPrice?: number;
                category?: string;
                image?: string | null;
                description?: string;
                rarity?: string;
                quantity?: number;
              }) => {
                if (it.product) {
                  return {
                    product: it.product,
                    quantity: it.quantity || 1,
                    addedAt: new Date().toISOString(),
                  };
                }
                return {
                  product: {
                    id: it.productId || it.id || 1,
                    name: it.name,
                    priceInZeni: it.priceInZeni || it.unitPrice || 1000,
                    category: (it.category as 'Capsule' | 'Vehicle' | 'Armor' | 'Special') || 'Capsule',
                    image: it.image || '',
                    description: it.description || '',
                    rarity: (it.rarity as 'Common' | 'Rare' | 'Legendary') || 'Common',
                    inStock: true,
                  },
                  quantity: it.quantity || 1,
                  addedAt: new Date().toISOString(),
                };
              }
            );

            persistCart(restoredItems);
            setIsOpen(true); // Abrir el carrito para mostrar las cápsulas recuperadas con cupón

            // Limpiar parámetro de la URL sin recargar
            params.delete("recover_cart");
            params.delete("coupon");
            const newSearch = params.toString();
            const newUrl =
              window.location.pathname + (newSearch ? `?${newSearch}` : "");
            window.history.replaceState({}, "", newUrl);
          }
        })
        .catch((err) => {
          console.warn("No se pudo restaurar el carrito:", err);
        });
    }
  }, [applyCoupon]);

  // Sincronización en segundo plano con Supabase para rastrear carritos activos / abandonados
  useEffect(() => {
    if (items.length === 0) return;

    const timer = setTimeout(() => {
      let userEmail = 'lfbp5000@gmail.com';
      let userName = 'Explorador Hoi-Poi';
      try {
        const sessionCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('nenis_session='));
        if (sessionCookie) {
          const parsed = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]));
          if (parsed?.email) userEmail = parsed.email;
          if (parsed?.name) userName = parsed.name;
        }
      } catch {}

      fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({
            productId: it.product.id,
            name: it.product.name,
            priceInZeni: it.product.priceInZeni,
            quantity: it.quantity,
            image: it.product.image,
          })),
          totalZeni: items.reduce(
            (acc, it) => acc + it.product.priceInZeni * it.quantity,
            0
          ),
          email: userEmail,
          customerName: userName,
        }),
      }).catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [items]);

  const totalZeni = items.reduce(
    (acc, item) => acc + item.product.priceInZeni * item.quantity,
    0
  );

  const discountAmount = coupon
    ? Math.round(totalZeni * (coupon.discountPercent / 100))
    : 0;

  const discountedTotalZeni = Math.max(0, totalZeni - discountAmount);

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
        restoreCart,
        coupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        discountedTotalZeni,
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
