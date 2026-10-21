import Link from 'next/link';
import { Suspense } from 'react';
import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import SuccessOrderTracker from '@/components/dbz/SuccessOrderTracker';

interface SuccessContentProps {
  searchParams: Promise<{
    session_id?: string;
    order_code?: string;
  }>;
}

async function SuccessContent({ searchParams }: SuccessContentProps) {
  const { session_id, order_code } = await searchParams;

  let order = null;
  let stripeCustomerEmail = '';

  // 1. Obtener detalles de la orden en Supabase
  if (isPrismaConfigured() && order_code) {
    try {
      order = await prisma.capsuleOrder.findUnique({
        where: { orderCode: order_code },
        include: { items: true },
      });
    } catch (e) {
      console.warn('Error leyendo orden en success page:', e);
    }
  }

  // 2. Si hay session_id de Stripe y la pasarela está activa, verificamos el recibo
  if (isStripeConfigured() && session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      stripeCustomerEmail = session.customer_details?.email || '';

      // Si el webhook aún no marcó la orden como pagada, la confirmamos aquí
      if (order && order.paymentStatus !== 'paid') {
        await prisma.capsuleOrder.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            stripePaymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id || null,
          },
        });
        order.paymentStatus = 'paid';
      }
    } catch (e) {
      console.warn('No se pudo verificar la sesión de Stripe:', e);
    }
  }

  return (
    <div className="max-w-lg w-full bg-[#101623] border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10 text-center relative overflow-hidden">
      {/* Glow de fondo */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Ícono de éxito */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-linear-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-400/40 flex items-center justify-center text-3xl shadow-inner">
        ✨
      </div>

      <span className="inline-block px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-full mb-3">
        Stripe Sandbox • Pago Aprobado
      </span>

      {/* Tracker de GA4 y vaciado de carrito */}
      <div className="flex justify-center">
        <SuccessOrderTracker
          orderCode={order?.orderCode || order_code || 'CC-HOIPOI-TEST'}
          totalZeni={order?.totalZeni || 0}
          paymentMethod={order?.paymentMethod || 'Stripe Sandbox'}
          items={order?.items || []}
        />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-white via-cyan-200 to-cyan-400 mb-2">
        ¡Cápsulas Despachadas!
      </h1>
      <p className="text-gray-400 text-sm mb-6">
        La Capsule Corp ha confirmado tu transacción y las cápsulas Hoi-Poi están en ruta a tu destino.
      </p>

      {/* Tarjeta de Resumen */}
      <div className="bg-[#0A0D16] border border-white/5 rounded-2xl p-5 mb-6 text-left space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-gray-400">Código de Rastreo:</span>
          <span className="text-cyan-400 font-bold">{order?.orderCode || order_code || 'CC-HOIPOI-TEST'}</span>
        </div>

        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-gray-400">Cliente:</span>
          <span className="text-white font-medium">{order?.customerName || 'Cliente Capsule Corp'}</span>
        </div>

        {stripeCustomerEmail && (
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-gray-400">Recibo enviado a:</span>
            <span className="text-cyan-300">{stripeCustomerEmail}</span>
          </div>
        )}

        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-gray-400">Estado de Pago:</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {order?.paymentStatus === 'paid' ? 'Completado (Paid)' : 'Aprobado'}
          </span>
        </div>

        <div className="flex justify-between items-center pt-1 text-sm">
          <span className="text-gray-300">Total Transacción:</span>
          <span className="text-amber-400 font-bold">
            {order ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.totalZeni) : '$0.00 MXN'}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>Volver a la Tienda</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>📊</span>
          <span>Ver Métricas</span>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order_code?: string }>;
}) {
  return (
    <main className="min-h-screen bg-[#080B11] text-white flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-gray-400 text-xs font-mono animate-pulse">Cargando recibo de Capsule Corp...</div>}>
        <SuccessContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
