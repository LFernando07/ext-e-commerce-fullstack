'use client';

import { useEffect, useRef } from 'react';
import { trackPurchaseFailure } from '@/lib/analytics';

interface CancelOrderTrackerProps {
  orderCode?: string;
}

/**
 * Registra en GA4 cuando una compra fue cancelada o fallida
 */
export default function CancelOrderTracker({ orderCode }: CancelOrderTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    trackPurchaseFailure({
      transaction_id: orderCode || 'cancelled_session',
      error_message: 'El usuario canceló la sesión en la pasarela de Stripe',
      payment_method: 'Stripe Sandbox',
      reason: 'user_cancelled',
    });
  }, [orderCode]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-[11px] text-red-300 font-mono mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      <span>Falla registrada en analítica GA4</span>
    </div>
  );
}
