'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { trackPurchase } from '@/lib/analytics';

interface SuccessOrderTrackerProps {
  orderCode: string;
  totalZeni: number;
  paymentMethod?: string;
  items?: Array<{
    productId: number;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

/**
 * Componente cliente que se ejecuta una sola vez al llegar a /checkout/success:
 * 1. Vacía el carrito en memoria y en localStorage.
 * 2. Despacha el evento oficial 'purchase' a Google Analytics 4 (GA4) y Meta Pixel.
 */
export default function SuccessOrderTracker({
  orderCode,
  totalZeni,
  paymentMethod = 'Stripe Sandbox',
  items = [],
}: SuccessOrderTrackerProps) {
  const { clearCart } = useCart();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    // 1. Vaciar el carrito completamente (React Context + LocalStorage)
    clearCart();

    // Limpieza explícita del localStorage por seguridad
    try {
      const storageKey =
        process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY || 'capsule_corp_cart_v1';
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Error limpiando localStorage:', e);
    }

    // 2. Disparar evento de conversión E-Commerce en GA4
    trackPurchase({
      transaction_id: orderCode,
      value: totalZeni,
      currency: 'MXN',
      payment_method: paymentMethod,
      items: items.map((i) => ({
        item_id: i.productId,
        item_name: i.name,
        price: i.unitPrice,
        quantity: i.quantity,
      })),
    });
  }, [clearCart, orderCode, totalZeni, paymentMethod, items]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
      <span>Carrito vaciado & Venta registrada en GA4</span>
    </div>
  );
}
