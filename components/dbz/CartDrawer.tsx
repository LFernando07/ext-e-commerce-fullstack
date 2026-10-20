'use client';

/**
 * @file components/dbz/CartDrawer.tsx
 * @description Drawer lateral interactivo de compras de Capsule Corp.
 * 
 * @concept React 19 useActionState, React 19 useOptimistic, Next.js Server Actions Integration
 * 
 * 🎓 CONCEPTOS CLAVE IMPLEMENTADOS EN ESTE ARCHIVO:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. `useActionState`:
 *    - Es el nuevo hook estándar de React 19 (que reemplaza al antiguo `useFormState`).
 *    - Firma: `const [state, formAction, isPending] = useActionState(checkoutAction, initialState)`
 *    - Se conecta directamente a la Server Action `checkoutAction`.
 *    - Maneja automáticamente el estado `isPending` (cargando) mientras el servidor procesa la compra.
 *    - No requiere escribir un `fetch('/api/...')` ni `try/catch` manual.
 * 
 * 2. `useOptimistic`:
 *    - Permite renderizar de forma INSTANTÁNEA en la interfaz un estado proyectado (optimista),
 *      mientras la Server Action real viaja al servidor y responde.
 *    - Si la acción tiene éxito, el estado optimista se reconcilia con la verdad del servidor.
 *    - Si la acción falla, React revierte automáticamente al estado real anterior.
 */

import { useActionState, useOptimistic, startTransition, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { checkoutAction } from '@/app/actions/cart';
import { createStripeCheckoutSession } from '@/app/actions/stripe';
import { CheckoutResult, CartItem } from '@/types/dragonball';

const initialCheckoutState: CheckoutResult = {
  success: false,
  message: '',
};

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
  } = useCart();

  // 1. Integración con Server Action vía useActionState (React 19)
  const [checkoutState, formAction, isSubmitting] = useActionState(
    async (prevState: CheckoutResult, formData: FormData) => {
      const res = await checkoutAction(prevState, formData);
      if (res.success) {
        clearCart();
      }
      return res;
    },
    initialCheckoutState
  );

  // Estado para Stripe Sandbox
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const handleStripeCheckout = async () => {
    setIsStripeLoading(true);
    setStripeError(null);
    try {
      const customerInput = document.getElementById('customerName') as HTMLInputElement | null;
      const name = customerInput?.value || 'Bulma Brief';

      const res = await createStripeCheckoutSession({
        customerName: name,
        address: 'Capital del Oeste, Tierra',
        items: optimisticItems,
      });

      if (res.success && res.url) {
        // Redirección directa a la pasarela alojada de Stripe Checkout
        window.location.href = res.url;
      } else {
        setStripeError(res.message || 'Error al conectar con Stripe Sandbox');
        setIsStripeLoading(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStripeError(error.message || 'Error inesperado al conectar con Stripe.');
      setIsStripeLoading(false);
    }
  };

  // 2. Estado Optimista con useOptimistic (React 19)
  // Permite simular de inmediato el cambio de cantidad de cápsulas antes de que cualquier mutación ocurra
  const [optimisticItems, setOptimisticQuantity] = useOptimistic(
    items,
    (currentItems: CartItem[], update: { productId: number; delta: number }) => {
      return currentItems
        .map((item) => {
          if (item.product.id === update.productId) {
            const nextQty = item.quantity + update.delta;
            // Si la cantidad llega a 0, eliminamos el item del carrito
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        // Filtramos los items eliminados (null) para mantener solo los válidos
        .filter(Boolean) as CartItem[];
    }
  );

  const handleOptimisticUpdate = (productId: number, delta: number) => {
    // startTransition es obligatorio para despachar actualizaciones con useOptimistic
    startTransition(() => {
      setOptimisticQuantity({ productId, delta });
      const current = items.find((i) => i.product.id === productId);
      if (current) {
        updateQuantity(productId, current.quantity + delta);
      }
    });
  };

  const optimisticTotalZeni = optimisticItems.reduce(
    (acc, item) => acc + item.product.priceInZeni * item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop con desenfoque */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-[#0F131D] text-white border-l border-cyan-500/30 shadow-2xl flex flex-col justify-between">
          
          {/* Header del Carrito */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#151B29]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💊</span>
              <div>
                <h2 className="font-display font-bold text-lg text-white">
                  Cápsulas en Preparación
                </h2>
                <p className="text-xs text-cyan-400 font-mono">
                  {optimisticItems.length} modelos seleccionados ({totalItems} unidades)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo: Lista de Productos u Orden Exitosa */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {/* Notificación de Éxito de la Server Action */}
            {checkoutState.success ? (
              <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-center space-y-3 my-auto">
                <span className="text-4xl">🚀</span>
                <h3 className="font-display font-bold text-xl text-emerald-400">
                  ¡Orden Despachada!
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {checkoutState.message}
                </p>
                <div className="p-3 rounded-lg bg-black/40 font-mono text-xs text-emerald-300">
                  Orden ID: {checkoutState.orderId}
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors"
                >
                  Continuar Explorando
                </button>
              </div>
            ) : optimisticItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <span className="text-5xl opacity-40">🛸</span>
                <p className="text-gray-400 text-sm">
                  Tu cápsula transportadora está vacía.
                </p>
                <p className="text-xs text-gray-500">
                  Añade guerreros del catálogo para generar tu pedido.
                </p>
              </div>
            ) : (
              optimisticItems.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 rounded-xl bg-[#171E2D] border border-white/5 flex items-center gap-3 relative group"
                >
                  <div className="relative w-14 h-14 bg-black/40 rounded-lg p-1 shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-amber-400 font-mono">
                      {item.product.formattedPrice}
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {item.product.capsuleType}
                    </span>
                  </div>

                  {/* Controles de Cantidad con useOptimistic */}
                  <div className="flex items-center gap-2 bg-[#0F131D] px-2 py-1 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => handleOptimisticUpdate(item.product.id, -1)}
                      className="text-gray-400 hover:text-white px-1 text-xs"
                      title="Restar cápsula"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-cyan-300 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOptimisticUpdate(item.product.id, 1)}
                      className="text-gray-400 hover:text-white px-1 text-xs"
                      title="Sumar cápsula"
                    >
                      +
                    </button>
                  </div>

                  {/* Eliminar producto */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-500 hover:text-red-400 p-1 text-xs transition-colors"
                    title="Eliminar del carrito"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}

            {/* Error del formulario si la Server Action falló */}
            {!checkoutState.success && checkoutState.error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
                ⚠️ {checkoutState.message}
              </div>
            )}
          </div>

          {/* Footer del Carrito con Formulario de Server Action */}
          {optimisticItems.length > 0 && !checkoutState.success && (
            <div className="p-6 border-t border-white/10 bg-[#151B29] space-y-4">
              
              {/* Resumen de Zeni */}
              <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-gray-400">Total a Pagar:</span>
                <span className="text-xl font-bold text-amber-400">
                  {new Intl.NumberFormat('es-MX').format(optimisticTotalZeni)} Zeni
                </span>
              </div>

              {/* Formulario HTML que despacha la Server Action sin router ni API REST */}
              <form action={formAction} className="space-y-3">
                {/* Campo oculto que transporta los items serializados */}
                <input
                  type="hidden"
                  name="itemsPayload"
                  value={JSON.stringify(optimisticItems)}
                />

                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-[11px] font-mono uppercase text-gray-400 mb-1"
                  >
                    Nombre del Comprador
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    placeholder="Ej. Bulma Brief / Trunks"
                    defaultValue="Bulma Brief"
                    className="w-full px-3 py-2 rounded-xl bg-[#0F131D] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-[11px] font-mono uppercase text-gray-400 mb-1"
                  >
                    Método de Pago
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    className="w-full px-3 py-2 rounded-xl bg-[#0F131D] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Zeni en Efectivo">Zeni en Efectivo (Bolsa)</option>
                    <option value="Crédito Capsule Corp">Línea de Crédito Capsule Corp</option>
                    <option value="Transferencia del Reino Supremo">Transferencia del Reino Supremo</option>
                  </select>
                </div>

                {/* Botón Principal: Stripe Checkout Sandbox */}
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={isStripeLoading || isSubmitting}
                  className="w-full py-3 rounded-xl bg-linear-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isStripeLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Conectando con Stripe Sandbox...</span>
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      <span>Pagar con Stripe (Sandbox)</span>
                    </>
                  )}
                </button>

                {/* Error de Stripe si faltan keys o falla la sesión */}
                {stripeError && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] leading-relaxed">
                    💡 <span className="font-semibold">{stripeError}</span>
                  </div>
                )}

                {/* Separador */}
                <div className="flex items-center gap-2 my-1">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-[10px] uppercase font-mono text-gray-500">o método alternativo</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                {/* Botón de Enviar con Server Action nativa */}
                <button
                  type="submit"
                  disabled={isSubmitting || isStripeLoading}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Comprimiendo Cápsulas...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Confirmar en Efectivo (Server Action)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
