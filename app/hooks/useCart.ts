"use client";

import { CartContext } from "@/context/CartContext";
import { useContext } from "react";

// ── Hook personalizado para consumir el contexto del carrito ──
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser utilizado dentro de un <CartProvider>");
  }
  return context;
}
