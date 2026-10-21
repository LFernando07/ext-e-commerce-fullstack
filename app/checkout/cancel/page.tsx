import Link from 'next/link';
import { Suspense } from 'react';
import CancelOrderTracker from '@/components/dbz/CancelOrderTracker';
import { paths } from '@/config/routes';

interface CancelContentProps {
  searchParams: Promise<{
    order_code?: string;
  }>;
}

async function CancelContent({ searchParams }: CancelContentProps) {
  const { order_code } = await searchParams;

  return (
    <div className="max-w-md w-full bg-[#101623] border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-2xl">
        🛑
      </div>

      <span className="inline-block px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-500/30 rounded-full mb-3">
        Transacción Cancelada
      </span>

      <div className="flex justify-center">
        <CancelOrderTracker orderCode={order_code} />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
        Pago no completado
      </h1>
      <p className="text-gray-400 text-xs mb-6">
        No se realizó ningún cobro a tu tarjeta. Tu carrito sigue guardado para cuando decidas reanudar tu pedido.
      </p>

      {order_code && (
        <p className="text-[11px] font-mono text-gray-500 mb-6">
          Referencia: <span className="text-gray-300">{order_code}</span>
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Link
          href={paths.dashboard}
          className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>🛒</span>
          <span>Regresar a mi Espacio</span>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order_code?: string }>;
}) {
  return (
    <main className="min-h-screen bg-[#080B11] text-white flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-gray-400 text-xs font-mono animate-pulse">Cargando detalles...</div>}>
        <CancelContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
