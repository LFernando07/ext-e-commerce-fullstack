'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, ENDPOINTS } from '@/lib/api-client';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';
import CapsuleOrdersManager from '@/components/dbz/CapsuleOrdersManager';

export default function ModuloInternoPage() {
  const { user, loading: authLoading } = useAuth();
  const [metricas, setMetricas] = useState<any>(null);
  const [auditoria, setAuditoria] = useState<any>(null);
  const [loadingMetricas, setLoadingMetricas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function cargarDatosInternos() {
      try {
        setLoadingMetricas(true);
        setError(null);

        // ✅ Llama al endpoint interno usando la sesión compartida del mismo dominio
        const res = await api.get(ENDPOINTS.INTERNO_METRICAS);
        setMetricas(res.data);
        setAuditoria(res.auditoria);
      } catch (err: any) {
        setError(err.message || 'No fue posible acceder a la información interna.');
      } finally {
        setLoadingMetricas(false);
      }
    }

    cargarDatosInternos();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#5B3289] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-ui text-[#5E5C78]">Verificando sesión compartida...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión activa:
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E2DFF5] shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl mx-auto mb-4">
            🔒
          </div>
          <h1 className="text-2xl font-bold font-display text-[#1A1228] mb-2">
            Módulo Interno Protegido
          </h1>
          <p className="text-sm font-body text-[#5E5C78] mb-6">
            Para acceder a las métricas internas de cartera y administración, debes tener una sesión activa iniciada en la plataforma.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="w-full py-3 rounded-full bg-[#5B3289] hover:bg-[#302768] text-white font-ui font-medium text-sm transition-all shadow-md cursor-pointer"
            >
              Iniciar sesión
            </button>
            <Link
              href="/"
              className="w-full py-3 rounded-full border border-[#E2DFF5] text-[#5E5C78] hover:text-[#1A1228] font-ui text-sm transition-colors text-center"
            >
              Regresar al inicio
            </Link>
          </div>

          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabecera del Módulo Interno */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFF5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B3289]/10 text-[#5B3289] text-xs font-ui font-semibold mb-2">
              <span>🏛️</span> Módulo Interno de Operaciones
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A1228]">
              Panel de Control y Cartera
            </h1>
            <p className="text-sm font-body text-[#5E5C78] mt-1">
              Gestión centralizada de créditos de Nenis Club compartiendo la sesión del mismo dominio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full border border-[#5B3289] text-[#5B3289] hover:bg-[#5B3289]/5 text-xs font-ui font-medium transition-colors"
            >
              ← Ir a Mi Espacio
            </Link>
          </div>
        </div>

        {/* Tarjeta Demostrativa de la Conexión Compartida */}
        <div className="bg-gradient-to-br from-indigo-900 via-[#302768] to-[#1A1228] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
              🔗
            </div>
            <div className="space-y-3">
              <span className="text-xs uppercase font-ui tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sesión Compartida Activa (Mismo Dominio)
              </span>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                Acceso transparente sin pedir credenciales
              </h2>

              <p className="text-xs sm:text-sm text-white/80 font-body leading-relaxed max-w-3xl">
                Al haber iniciado sesión previamente en el sistema principal, el navegador adjuntó automáticamente la cookie <code className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">nenis_session</code> con <code className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">Path=/</code>. El módulo interno validó tu identidad al instante sin requerir SSO ni microservicios.
              </p>

              {auditoria && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs font-ui">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white/60 block text-[11px]">Usuaria conectada:</span>
                    <strong className="text-white">{auditoria.usuario}</strong>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white/60 block text-[11px]">Rol en el sistema:</span>
                    <strong className="text-[#F7A914] uppercase">{auditoria.rol}</strong>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white/60 block text-[11px]">Mecanismo de acceso:</span>
                    <strong className="text-[#51BDC6]">Cookie Path=/</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Métricas Internas Confidenciales */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#1A1228]">
              Información de Cartera en Tiempo Real
            </h3>
            <span className="text-xs font-ui text-[#5E5C78]">
              Consumido vía <code className="bg-white px-1.5 py-0.5 rounded border border-[#E2DFF5] text-[#5B3289] font-mono">/api/interno/metricas</code>
            </span>
          </div>

          {loadingMetricas ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-[#E2DFF5] text-xs font-ui text-[#5E5C78]">
              <div className="w-6 h-6 border-2 border-[#5B3289] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Consultando base de datos interna...
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-body">
              {error}
            </div>
          ) : metricas ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-3xl border border-[#E2DFF5] shadow-sm">
                <span className="text-xs font-ui text-[#5E5C78] block mb-1">
                  Total Cartera Colocada
                </span>
                <div className="text-2xl font-bold font-ui text-[#5B3289]">
                  ${metricas.totalCarteraColocada.toLocaleString('es-MX')}{' '}
                  <span className="text-xs font-normal text-[#5E5C78]">MXN</span>
                </div>
                <span className="text-[11px] font-ui text-emerald-600 mt-2 block">
                  ↑ 14% vs mes anterior
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E2DFF5] shadow-sm">
                <span className="text-xs font-ui text-[#5E5C78] block mb-1">
                  Recuperación Puntual
                </span>
                <div className="text-2xl font-bold font-ui text-emerald-600">
                  {metricas.tasaRecuperacion}%
                </div>
                <span className="text-[11px] font-ui text-[#5E5C78] mt-2 block">
                  Cero morosidad grave
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E2DFF5] shadow-sm">
                <span className="text-xs font-ui text-[#5E5C78] block mb-1">
                  Nenis Activas
                </span>
                <div className="text-2xl font-bold font-ui text-[#1A1228]">
                  {metricas.nenisActivas}
                </div>
                <span className="text-[11px] font-ui text-[#51BDC6] mt-2 block">
                  Comunidad en crecimiento
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E2DFF5] shadow-sm">
                <span className="text-xs font-ui text-[#5E5C78] block mb-1">
                  Solicitudes por Revisar
                </span>
                <div className="text-2xl font-bold font-ui text-[#F7A914]">
                  {metricas.solicitudesPendientes}
                </div>
                <span className="text-[11px] font-ui text-[#F0882A] mt-2 block">
                  Pendientes de aprobación
                </span>
              </div>

            </div>
          ) : null}
        </div>

        {/* Módulo de Ventas y Órdenes de Capsule Corp */}
        <CapsuleOrdersManager />

      </div>
    </div>
  );
}
