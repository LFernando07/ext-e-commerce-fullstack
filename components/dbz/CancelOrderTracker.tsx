'use client';

import { useEffect, useRef, useState } from 'react';
import { trackPurchaseFailure } from '@/lib/analytics';
import { cartService } from '@/services/cart.service';
import Link from 'next/link';

interface CancelOrderTrackerProps {
  orderCode?: string;
}

/**
 * Registra en GA4 cuando una compra fue cancelada o fallida,
 * y activa automáticamente el registro de Carrito Abandonado + Correo de Resend
 */
export default function CancelOrderTracker({ orderCode }: CancelOrderTrackerProps) {
  const hasTracked = useRef(false);
  const [recoveryInfo, setRecoveryInfo] = useState<{
    recoveryUrl?: string;
    emailSent?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    // 1. Registrar fallo en GA4
    trackPurchaseFailure({
      transaction_id: orderCode || 'cancelled_session',
      error_message: 'El usuario canceló la sesión en la pasarela de Stripe',
      payment_method: 'Stripe Sandbox',
      reason: 'user_cancelled',
    });

    // 2. Si viene orderCode, activar automáticamente el flujo de Carrito Abandonado
    if (orderCode) {
      cartService
        .abandonOrder(orderCode)
        .then((data) => {
          if (data.success) {
            setRecoveryInfo({
              recoveryUrl: data.recoveryUrl,
              emailSent: data.emailSent,
              message: data.message,
            });
          }
        })
        .catch((err) => {
          console.warn('[cancel-tracker] Error registrando carrito abandonado:', err);
        });
    }
  }, [orderCode]);

  return (
    <div className="space-y-3 mb-4 w-full">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-[11px] text-red-300 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <span>Falla registrada en analítica GA4</span>
      </div>

      {recoveryInfo && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs text-left space-y-2 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <span>🛒⚡</span>
            <span>Cápsulas Hoi-Poi reservadas con 10% OFF</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Detectamos que no completaste tu pago en Stripe. Tus cápsulas quedaron apartadas y te enviamos un recordatorio por correo con el cupón <strong className="text-amber-400 font-mono">HOIPOI10</strong>.
          </p>

          {recoveryInfo.recoveryUrl && (
            <Link
              href={recoveryInfo.recoveryUrl}
              className="inline-block mt-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all shadow"
            >
              🚀 Reanudar mi Carrito Ahora (1-Clic)
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
