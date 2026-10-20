/**
 * @file components/dbz/LiveCapsuleMetrics.tsx
 * @description Componente dinámico de telemetría de Capsule Corp transmitido por streaming.
 * 
 * @concept Partial Prerendering (PPR), Dynamic Server Component (await connection()), React Suspense
 * 
 * ¿Por qué este componente activa el agujero dinámico de PPR?
 * ─────────────────────────────────────────────────────────────────────────────
 * Al invocar `await connection()` de 'next/server', este componente le indica al compilador
 * de Next.js que no puede ser pre-renderizado en el cascarón estático (Static Shell).
 * Como resultado, el cascarón HTML de la tienda se envía al navegador en 0ms y este
 * bloque se transmite por streaming cuando el servidor resuelve la conexión en vivo.
 */

import { connection } from 'next/server';
import { getRecentCapsuleOrders } from '@/app/actions/cart';
const simulatedActiveUsersOut = 42 + Math.floor(Math.random() * 18);

export default async function LiveCapsuleMetrics() {
  // Opt-in dinámico de PPR: suspende durante el renderizado estático
  await connection();

  const recentOrders = await getRecentCapsuleOrders();
  const simulatedActiveUsers = simulatedActiveUsersOut;
  const totalOrdersCount = 128 + recentOrders.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#131722] border border-cyan-500/20 shadow-xl">
      
      {/* 1. Usuarios en Línea */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-gray-400">
            Guerreros Explorando
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span className="text-2xl font-mono font-bold text-emerald-400 mt-2">
          {simulatedActiveUsers}
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          Telemetría en tiempo real (PPR)
        </span>
      </div>

      {/* 2. Total de Órdenes */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
        <span className="text-[10px] font-mono uppercase text-gray-400">
          Cápsulas Despachadas
        </span>
        <span className="text-2xl font-mono font-bold text-cyan-400 mt-2">
          {totalOrdersCount}
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          {recentOrders.length} por Server Actions
        </span>
      </div>

      {/* 3. Eficiencia Hoi-Poi */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
        <span className="text-[10px] font-mono uppercase text-gray-400">
          Compresión de Ki
        </span>
        <span className="text-2xl font-mono font-bold text-purple-400 mt-2">
          99.98%
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          Tecnología Bulma Briefs
        </span>
      </div>

      {/* 4. Estado de Servidor Edge */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
        <span className="text-[10px] font-mono uppercase text-gray-400">
          Caché de Next.js
        </span>
        <span className="text-2xl font-mono font-bold text-amber-400 mt-2">
          Activo
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          Data Cache + Tagging ISR
        </span>
      </div>

    </div>
  );
}
