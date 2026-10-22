/**
 * @file components/LandingKPIs.tsx
 * @description Componente dinámico que consume la API de Google Analytics 4 (GA4) en tiempo real.
 *
 * @concept Next.js Partial Prerendering (PPR), Dynamic Server Component (await connection()), GA4 Data API
 */

import { connection } from "next/server";
import { analyticsService } from "@/services/analytics.service";
import { AnalyticsKPIsResponse } from "@/types/api";

async function getKPIs(): Promise<AnalyticsKPIsResponse | null> {
  try {
    const isDev = process.env.NODE_ENV === "development";
    return await analyticsService.getKPIs({ revalidate: isDev ? 0 : 60 });
  } catch {
    return null;
  }
}

export default async function LandingKPIs() {
  await connection();
  const data = await getKPIs();

  if (!data) {
    return (
      <div className="p-4 text-xs font-mono text-gray-400 bg-[#131722] rounded-2xl border border-white/10 text-center">
        Métricas de Google Analytics 4 no disponibles temporalmente.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
      {/* 1. Visitas Totales GA4 */}
      <div className="bg-[#131722] p-4 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-gray-400">
            Visitas Totales
          </span>
          <span className="text-xs">📊</span>
        </div>
        <span className="text-2xl font-bold font-mono text-cyan-400 mt-2">
          {data.totalViews.toLocaleString("es-MX")}
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          Google Analytics 4
        </span>
      </div>

      {/* 2. Formularios / Leads */}
      <div className="bg-[#131722] p-4 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-gray-400">
            Formularios Enviados
          </span>
          <span className="text-xs">✉️</span>
        </div>
        <span className="text-2xl font-bold font-mono text-emerald-400 mt-2">
          {data.leadsCount.toLocaleString("es-MX")}
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          Conversiones GA4
        </span>
      </div>

      {/* 3. Usuarios que llegaron hasta abajo (Scroll 100%) */}
      <div className="bg-[#131722] p-4 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-gray-400">
            Scroll Completo (100%)
          </span>
          <span className="text-xs">📜</span>
        </div>
        <span className="text-2xl font-bold font-mono text-amber-400 mt-2">
          {data.scrollBottomCount.toLocaleString("es-MX")}
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          ScrollTracker Event
        </span>
      </div>

      {/* 4. Tasa de Lectura Completa */}
      <div className="bg-[#131722] p-4 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-gray-400">
            Tasa de Retención
          </span>
          <span className="text-xs">🎯</span>
        </div>
        <span className="text-2xl font-bold font-mono text-purple-400 mt-2">
          {data.retentionRate}
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          Engagement Rate
        </span>
      </div>
    </div>
  );
}
