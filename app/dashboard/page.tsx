'use client';

import { useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';
import PedidosManager from '@/components/PedidosManager';
import CapsuleOrdersManager from '@/components/dbz/CapsuleOrdersManager';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'store_orders' | 'nenis_pedidos'>('store_orders');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#5B3289] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-ui text-[#5E5C78]">Cargando tu espacio...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado: Pantalla de protección amigable
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E2DFF5] shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-[#FAF9FF] border border-[#E2DFF5] flex items-center justify-center text-3xl mx-auto mb-4">
            🔒
          </div>
          <h1 className="text-2xl font-bold font-display text-[#1A1228] mb-2">
            Área exclusiva para Nenis
          </h1>
          <p className="text-sm font-body text-[#5E5C78] mb-6">
            Para ver tu crédito disponible, plazos y subir de nivel, por favor ingresa con tu cuenta.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="w-full py-3 rounded-full bg-[#5B3289] hover:bg-[#302768] text-white font-ui font-medium text-sm transition-all shadow-md"
            >
              Iniciar sesión
            </button>
            <Link
              href="/"
              className="w-full py-3 rounded-full border border-[#E2DFF5] text-[#5E5C78] hover:text-[#1A1228] font-ui text-sm transition-colors"
            >
              Volver al inicio
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

  // Nivel de Graduación y estilos asociados
  const levelStyles = {
    Starter: {
      color: '#51BDC6',
      badgeBg: 'bg-[#51BDC6]/15 text-[#00A4BF] border-[#51BDC6]/30',
      nextTier: 'Siguiente meta: Nivel Growth ($15,000 MXN)',
      progress: 33,
    },
    Growth: {
      color: '#F7A914',
      badgeBg: 'bg-[#F7A914]/20 text-[#1A1228] border-[#F7A914]/40 font-bold',
      nextTier: 'Siguiente meta: Nivel Trusted ($30,000 MXN)',
      progress: 66,
    },
    Trusted: {
      color: '#5B3289',
      badgeBg: 'bg-[#5B3289]/15 text-[#5B3289] border-[#5B3289]/30',
      nextTier: '¡Felicidades! Tienes el nivel máximo de confianza',
      progress: 100,
    },
  }[user.graduationLevel];

  const creditUsed = user.creditLimit - user.availableCredit;
  const usagePercentage = Math.round((creditUsed / user.creditLimit) * 100);

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabecera del Perfil */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFF5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-tr from-[#5B3289] to-[#DD4591] flex items-center justify-center text-white text-2xl font-bold font-ui shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold font-display text-[#1A1228]">
                  {user.name}
                </h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${levelStyles.badgeBg}`}>
                  {user.graduationLevel}
                </span>
              </div>
              <p className="text-sm font-body text-[#5E5C78] mt-0.5">
                {user.businessName} • <span className="text-[#5B3289]">{user.businessCategory}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="self-start sm:self-center px-4 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-ui font-medium transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Tarjeta de Línea de Crédito Nenis Plazos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Crédito Disponible (Tarjeta Principal) */}
          <div className="md:col-span-2 bg-linear-to-br from-[#5B3289] to-[#302768] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <span className="text-xs font-ui tracking-wider uppercase text-white/80 block mb-1">
              Línea de Crédito Nenis Plazos
            </span>
            <div className="text-4xl sm:text-5xl font-bold font-ui tracking-tight mb-4">
              ${user.availableCredit.toLocaleString('es-MX')}{' '}
              <span className="text-lg font-normal text-white/70">MXN</span>
            </div>

            {/* Barra de progreso de uso */}
            <div className="space-y-2 mt-6">
              <div className="flex justify-between text-xs text-white/80 font-ui">
                <span>Crédito disponible</span>
                <span>Límite total: ${user.creditLimit.toLocaleString('es-MX')}</span>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#51BDC6] rounded-full transition-all duration-500"
                  style={{ width: `${100 - usagePercentage}%` }}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-full bg-white text-[#5B3289] font-ui font-semibold text-xs sm:text-sm hover:bg-white/90 transition-all shadow"
              >
                Solicitar compra a plazos
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-full border border-white/40 text-white font-ui text-xs sm:text-sm hover:bg-white/10 transition-colors"
              >
                Pagar anticipado
              </button>
            </div>
          </div>

          {/* Estado de Graduación */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2DFF5] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-ui text-[#5E5C78] block mb-1">
                Nivel de Crecimiento
              </span>
              <h3 className="text-xl font-bold font-display text-[#1A1228]">
                {user.graduationLevel}
              </h3>
              <p className="text-xs font-body text-[#5E5C78] mt-2 leading-relaxed">
                {levelStyles.nextTier}
              </p>
            </div>

            <div className="mt-6 p-3 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5] text-xs font-body text-[#5E5C78]">
              ⭐ Entre más pagos puntuales realices, mayor será tu línea de crédito.
            </div>
          </div>

        </div>

        {/* Navegación por Pestañas entre Órdenes de Tienda y Cartera */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E2DFF5] shadow-xs w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('store_orders')}
            className={`px-4 py-2 rounded-xl text-xs font-ui font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'store_orders'
                ? 'bg-[#1A1228] text-white shadow-sm'
                : 'text-[#5E5C78] hover:text-[#1A1228] hover:bg-[#FAF9FF]'
            }`}
          >
            <span>📦</span>
            <span>Órdenes de Tienda (Stripe & E-Commerce)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nenis_pedidos')}
            className={`px-4 py-2 rounded-xl text-xs font-ui font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'nenis_pedidos'
                ? 'bg-[#5B3289] text-white shadow-sm'
                : 'text-[#5E5C78] hover:text-[#1A1228] hover:bg-[#FAF9FF]'
            }`}
          >
            <span>💳</span>
            <span>Pedidos a Plazos Nenis Club</span>
          </button>
        </div>

        {/* Contenido Dinámico de la Pestaña Seleccionada */}
        {activeTab === 'store_orders' ? (
          <CapsuleOrdersManager />
        ) : (
          <PedidosManager />
        )}

        {/* Panel de Transparencia de Analítica y Privacidad */}
        <div className="bg-[#FAF9FF] rounded-2xl p-5 border border-[#E2DFF5] flex items-start gap-3.5">
          <span className="text-xl">📊</span>
          <div className="text-xs font-body text-[#5E5C78] leading-relaxed">
            <strong className="text-[#1A1228] block mb-0.5">
              Sincronización con Google Analytics (User Properties):
            </strong>
            Al iniciar sesión, tu cuenta envió de forma anónima las propiedades{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-[#E2DFF5] text-[#5B3289] font-mono">
              user_id: {user.id}
            </code>
            ,{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-[#E2DFF5] text-[#5B3289] font-mono">
              user_level: {user.graduationLevel}
            </code>{' '}
            y{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-[#E2DFF5] text-[#5B3289] font-mono">
              business_category: {user.businessCategory}
            </code>{' '}
            hacia GA4, garantizando que respetamos tus preferencias de cookies en todo momento.
          </div>
        </div>

      </div>
    </div>
  );
}
