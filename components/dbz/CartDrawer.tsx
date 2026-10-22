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
import { checkoutAction } from '@/app/actions/cart';
import { createStripeCheckoutSession } from '@/app/actions/stripe';
import { trackPurchase, trackPurchaseFailure } from '@/lib/analytics';
import { CheckoutResult, CartItem } from '@/types/dragonball';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/app/hooks/useAuth';
import { useCart } from '@/app/hooks/useCart';
import { cartService } from '@/services/cart.service';

const initialCheckoutState: CheckoutResult = {
  success: false,
  message: '',
};

export default function CartDrawer() {
  const { user } = useAuth();
  
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  // 1. Estado Optimista con useOptimistic (React 19)
  // Declarado antes de su consumo en Server Actions o pasarelas de pago
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

  // 2. Integración con Server Action vía useActionState (React 19)
  const [checkoutState, formAction, isSubmitting] = useActionState(
    async (prevState: CheckoutResult, formData: FormData) => {
      const res = await checkoutAction(prevState, formData);
      if (res.success) {
        // Enviar evento de compra exitosa en Efectivo a GA4 y Meta Pixel
        trackPurchase({
          transaction_id: res.orderId || `CC-CASH-${Date.now()}`,
          value: res.totalZeni || 0,
          currency: 'MXN',
          payment_method: 'Efectivo al recibir',
          items: optimisticItems.map((it) => ({
            item_id: it.product.id,
            item_name: it.product.name,
            price: it.product.priceInZeni,
            quantity: it.quantity,
          })),
        });
        clearCart();
      } else {
        trackPurchaseFailure({
          transaction_id: 'cash_checkout_failed',
          error_message: res.message || 'Error en pago en efectivo',
          payment_method: 'Efectivo',
          reason: 'system_error',
        });
      }
      return res;
    },
    initialCheckoutState
  );

  // Estado para Stripe Sandbox
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Estados para Modal de Login y Cupones
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Cálculos de totales con cupón de descuento
  const optimisticRawTotalZeni = optimisticItems.reduce(
    (acc, item) => acc + item.product.priceInZeni * item.quantity,
    0
  );
  const discountPercent = coupon?.discountPercent || 0;
  const discountAmount = Math.round(optimisticRawTotalZeni * (discountPercent / 100));
  const effectiveTotalZeni = Math.max(0, optimisticRawTotalZeni - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg(null);
    if (!couponInput.trim()) return;

    const ok = applyCoupon(couponInput);
    if (ok) {
      setCouponMsg({ text: `¡Cupón ${couponInput.trim().toUpperCase()} aplicado con éxito!` });
      setCouponInput('');
    } else {
      setCouponMsg({ text: 'Cupón inválido o expirado.', error: true });
    }
  };

  const handleStripeCheckout = async () => {
    // 3. Regla obligatoria: Si no está autenticado, abrir LoginModal para registrarse o iniciar sesión
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsStripeLoading(true);
    setStripeError(null);
    try {
      const customerInput = document.getElementById('customerName') as HTMLInputElement | null;
      const name = customerInput?.value || user.name || 'Bulma Brief';

      const res = await createStripeCheckoutSession({
        customerName: name,
        customerEmail: user.email,
        couponCode: coupon?.code,
        discountPercent: coupon?.discountPercent,
        address: 'Capital del Oeste, Tierra',
        items: optimisticItems,
      });

      if (res.success && res.url) {
        // Redirección directa a la pasarela alojada de Stripe Checkout
        window.location.href = res.url;
      } else {
        trackPurchaseFailure({
          error_message: res.message || 'Error al iniciar Stripe',
          payment_method: 'Stripe Sandbox',
          reason: 'system_error',
        });
        setStripeError(res.message || 'Error al conectar con Stripe Sandbox');
        setIsStripeLoading(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      trackPurchaseFailure({
        error_message: error.message || 'Error inesperado con Stripe',
        payment_method: 'Stripe Sandbox',
        reason: 'system_error',
      });
      setStripeError(error.message || 'Error inesperado al conectar con Stripe.');
      setIsStripeLoading(false);
    }
  };

  // Estado para envío de recordatorio de Carrito Abandonado (Resend)
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderFeedback, setReminderFeedback] = useState<string | null>(null);

  const handleSaveAndEmailCart = async () => {
    const defaultEmail = user?.email || 'lfbp5000@gmail.com';
    const targetEmail = prompt(
      '¿A qué correo deseas que te enviemos este carrito con el cupón del 10% de descuento (Resend)?',
      defaultEmail
    );
    if (!targetEmail || !targetEmail.includes('@')) return;

    setIsSendingReminder(true);
    setReminderFeedback(null);

    try {
      const data = await cartService.sendAbandonedReminder({
        email: targetEmail,
        customerName: user?.name || 'Explorador Hoi-Poi',
        items: optimisticItems.map((it) => ({
          name: it.product.name,
          quantity: it.quantity,
          unitPrice: it.product.priceInZeni,
          image: it.product.image,
        })),
        totalZeni: effectiveTotalZeni,
      });

      if (data.success) {
        setReminderFeedback(`¡Enviado a ${targetEmail}! Revisa tu bandeja de entrada.`);
      } else {
        setReminderFeedback(`Error: ${data.error || 'No se pudo enviar'}`);
      }
    } catch {
      setReminderFeedback('Error de comunicación con el servicio de correo.');
    } finally {
      setIsSendingReminder(false);
    }
  };

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
            
            {/* Notificación de Éxito de la Server Action (Recibo Detallado) */}
            {checkoutState.success ? (
              <div className="p-6 rounded-3xl bg-linear-to-b from-[#13221C] to-[#0D1612] border border-emerald-500/50 text-center space-y-4 my-auto shadow-2xl shadow-emerald-950/60">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  ✨
                </div>

                <span className="inline-block px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 rounded-full">
                  Pago en Efectivo • Confirmado
                </span>

                <h3 className="font-display font-bold text-xl text-white">
                  ¡Pedido Despachado con Éxito!
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {checkoutState.message}
                </p>

                {/* Resumen de la Orden */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left font-mono text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                    <span className="text-gray-400">Orden ID:</span>
                    <span className="text-emerald-300 font-bold">{checkoutState.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                    <span className="text-gray-400">Comprador:</span>
                    <span className="text-white">{checkoutState.customerName || 'Bulma Brief'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                    <span className="text-gray-400">Total a pagar al recibir:</span>
                    <span className="text-amber-400 font-bold">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(checkoutState.totalZeni || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-gray-400">Estado en Base de Datos:</span>
                    <span className="text-cyan-300">Guardado en Supabase ⚡</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Evento &apos;purchase&apos; registrado en GA4</span>
                </div>

                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-all shadow-lg cursor-pointer"
                >
                  Continuar Explorando la Tienda
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
              
              {/* Sección de Cupón de Descuento */}
              {coupon ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <span>🎟️</span>
                    <span>Cupón: {coupon.code} (-{coupon.discountPercent}% OFF)</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-white text-xs underline cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Cupón (ej. HOIPOI10)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#0F131D] border border-white/10 text-white text-xs uppercase placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              {couponMsg && (
                <p className={`text-[11px] ${couponMsg.error ? 'text-rose-400' : 'text-emerald-400'} font-medium`}>
                  {couponMsg.text}
                </p>
              )}

              {/* Resumen Total en MXN con desglose de cupón */}
              <div className="space-y-1 pt-1 border-t border-white/10 text-sm font-mono">
                {coupon && (
                  <>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Subtotal:</span>
                      <span className="line-through">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(optimisticRawTotalZeni)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-amber-400">
                      <span>Descuento Cupón ({coupon.discountPercent}%):</span>
                      <span>
                        -{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(discountAmount)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-semibold">Total a Pagar:</span>
                  <span className="text-xl font-bold text-amber-400">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(effectiveTotalZeni)}
                  </span>
                </div>
              </div>

              {/* REGLA DE NEGOCIO: Si no está autenticado, bloquear compra y pedir login */}
              {!user ? (
                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto text-lg shadow-inner">
                    🔐
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Inicia sesión para finalizar tu pedido
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Puedes explorar y armar tu carrito libremente. Para procesar tu compra de cápsulas, ingresa a tu cuenta o regístrate en 30 segundos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Iniciar Sesión / Registrarme
                  </button>
                </div>
              ) : (
                /* Formulario HTML que despacha la Server Action cuando está logueado */
                <form action={formAction} className="space-y-3">
                  {/* Campo oculto que transporta los items serializados */}
                  <input
                    type="hidden"
                    name="itemsPayload"
                    value={JSON.stringify(optimisticItems)}
                  />
                  <input
                    type="hidden"
                    name="couponCode"
                    value={coupon?.code || ''}
                  />
                  <input
                    type="hidden"
                    name="discountPercent"
                    value={coupon?.discountPercent || 0}
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
                      defaultValue={user.name}
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

                  {/* Opción de Carrito Abandonado / Guardar para después */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleSaveAndEmailCart}
                      disabled={isSendingReminder}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>✉️</span>
                      <span>
                        {isSendingReminder
                          ? 'Enviando cápsulas por correo...'
                          : '¿No puedes comprar hoy? Guardar y enviarme por correo'}
                      </span>
                    </button>
                    {reminderFeedback && (
                      <p className="text-[10px] text-center text-amber-200 mt-1.5 font-mono">
                        {reminderFeedback}
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Modal de Autenticación / Registro */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
