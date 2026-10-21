'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import AbandonedCartManager from './AbandonedCartManager';

interface CapsuleOrderItem {
  id: string;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  image: string | null;
}

interface CapsuleOrder {
  id: string;
  orderCode: string;
  customerName: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  totalZeni: number;
  itemsPurchased: number;
  status: string;
  createdAt: string;
  items: CapsuleOrderItem[];
}

interface OrdersStats {
  totalOrders: number;
  totalRevenue: number;
  paidCount: number;
  pendingCount: number;
}

export default function CapsuleOrdersManager() {
  const [orders, setOrders] = useState<CapsuleOrder[]>([]);
  const [stats, setStats] = useState<OrdersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'orders' | 'abandoned'>('orders');

  const handleSendEmail = async (order: CapsuleOrder) => {
    const targetEmail = prompt(
      `Ingresa el correo para enviar el comprobante de la orden ${order.orderCode}:`,
      'cliente@ejemplo.com'
    );
    if (!targetEmail || !targetEmail.includes('@')) return;

    setEmailStatus((prev) => ({ ...prev, [order.id]: 'Enviando...' }));
    try {
      const res = await fetch('/api/capsule-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, email: targetEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus((prev) => ({
          ...prev,
          [order.id]: data.mocked ? 'Simulado en consola' : '¡Enviado con Resend!',
        }));
      } else {
        setEmailStatus((prev) => ({
          ...prev,
          [order.id]: 'Error: ' + (data.error || 'Fallo'),
        }));
      }
    } catch {
      setEmailStatus((prev) => ({ ...prev, [order.id]: 'Error de conexión' }));
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterPayment !== 'all') params.set('paymentStatus', filterPayment);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await fetch(`/api/capsule-orders?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Error al consultar órdenes de compra en Supabase');
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setStats(data.stats || null);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filterPayment, searchTerm]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        if (filterPayment !== 'all') params.set('paymentStatus', filterPayment);
        if (searchTerm.trim()) params.set('search', searchTerm.trim());

        const res = await fetch(`/api/capsule-orders?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Error al consultar órdenes de compra en Supabase');
        }

        const data = await res.json();
        if (!ignore) {
          setOrders(data.orders || []);
          setStats(data.stats || null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const e = err as Error;
          setError(e.message || 'Error de conexión');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [filterPayment, searchTerm]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch('/api/capsule-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error('No se pudo actualizar el estado de envío');

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: data.order.status } : o))
        );
      }
    } catch (err) {
      console.error('Error actualizando orden:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFF5] shadow-sm space-y-6">
      
      {/* Selector de Pestañas Principal */}
      <div className="flex bg-[#FAF9FF] p-1.5 rounded-2xl border border-[#E2DFF5] gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-ui font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#1A1228] text-white shadow-md'
              : 'text-[#5E5C78] hover:text-[#1A1228]'
          }`}
        >
          <span>📦</span>
          <span>Órdenes de Compra (Stripe & Efectivo)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('abandoned')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-ui font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'abandoned'
              ? 'bg-[#1A1228] text-white shadow-md'
              : 'text-[#5E5C78] hover:text-[#1A1228]'
          }`}
        >
          <span>🛒⚡</span>
          <span>Carritos Abandonados (Recuperación Hoi-Poi)</span>
        </button>
      </div>

      {activeTab === 'abandoned' ? (
        <AbandonedCartManager />
      ) : (
        <>
          {/* Encabezado y Acciones */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DFF5] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-ui font-semibold mb-1">
            <span>📦</span> Registro de Ventas Capsule Corp (E-Commerce)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#1A1228]">
            Órdenes de Compra y Pagos en Vivo
          </h2>
          <p className="text-xs sm:text-sm font-body text-[#5E5C78]">
            Sincronización en tiempo real con Supabase PostgreSQL y pasarela de Stripe Sandbox.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders()}
          disabled={loading}
          className="self-start sm:self-center px-4 py-2 rounded-full bg-[#1A1228] hover:bg-[#302768] text-white text-xs font-ui font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span>
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5]">
            <span className="text-[11px] font-ui text-[#5E5C78] block">Total Órdenes</span>
            <div className="text-xl sm:text-2xl font-bold font-ui text-[#1A1228] mt-0.5">
              {stats.totalOrders}
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Registradas en Supabase</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-ui text-emerald-800 block">Ventas Cobradas</span>
            <div className="text-xl sm:text-2xl font-bold font-ui text-emerald-700 mt-0.5">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(stats.totalRevenue)}
            </div>
            <span className="text-[10px] text-emerald-600 font-mono">Pagos confirmados</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
            <span className="text-[11px] font-ui text-indigo-800 block">Pagadas con Stripe</span>
            <div className="text-xl sm:text-2xl font-bold font-ui text-indigo-700 mt-0.5">
              {stats.paidCount}
            </div>
            <span className="text-[10px] text-indigo-600 font-mono">Stripe Checkout / Webhook</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-ui text-amber-800 block">Pendientes / Efectivo</span>
            <div className="text-xl sm:text-2xl font-bold font-ui text-amber-700 mt-0.5">
              {stats.pendingCount}
            </div>
            <span className="text-[10px] text-amber-600 font-mono">Por cobrar al entregar</span>
          </div>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Pestañas de Filtro */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5] self-stretch sm:self-auto overflow-x-auto">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'paid', label: 'Pagadas (Stripe)' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'failed', label: 'Fallidas' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterPayment(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-ui font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterPayment === tab.id
                  ? 'bg-white text-[#1A1228] shadow-sm border border-[#E2DFF5]'
                  : 'text-[#5E5C78] hover:text-[#1A1228]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input de Búsqueda */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por código o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9FF] border border-[#E2DFF5] text-xs font-body text-[#1A1228] placeholder-[#5E5C78] focus:outline-none focus:border-[#5B3289]"
          />
        </div>
      </div>

      {/* Lista de Órdenes */}
      {loading ? (
        <div className="text-center py-12 space-y-2">
          <div className="w-7 h-7 border-3 border-[#5B3289] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-ui text-[#5E5C78]">Consultando órdenes en Supabase PostgreSQL...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-body">
          ⚠️ {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-[#E2DFF5] bg-[#FAF9FF] space-y-2">
          <span className="text-3xl">📦</span>
          <p className="text-sm font-ui font-semibold text-[#1A1228]">No se encontraron órdenes registradas</p>
          <p className="text-xs text-[#5E5C78]">
            Realiza una compra desde el catálogo con Stripe Sandbox o Efectivo para verla reflejada aquí en tiempo real.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-[#E2DFF5] bg-[#FAF9FF] hover:bg-white hover:border-[#5B3289]/30 transition-all p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Información Principal */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#1A1228] bg-white px-2 py-0.5 rounded border border-[#E2DFF5]">
                        {order.orderCode}
                      </span>

                      {/* Badge de Estado de Pago */}
                      {order.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-ui font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Pagado (Paid)
                        </span>
                      ) : order.paymentStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-ui font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-ui font-semibold">
                          Fallido
                        </span>
                      )}

                      {/* Método de Pago */}
                      <span className="text-[11px] font-mono text-[#5E5C78]">
                        {order.paymentMethod}
                      </span>
                    </div>

                    <p className="text-xs font-body text-[#1A1228]">
                      Cliente: <strong className="font-semibold">{order.customerName}</strong> • {order.address}
                    </p>
                    <p className="text-[11px] font-mono text-[#5E5C78]">
                      Fecha: {new Date(order.createdAt).toLocaleString('es-MX')} • {order.itemsPurchased} cápsula(s)
                    </p>
                  </div>

                  {/* Total y Selector de Envío */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-[#5E5C78] block font-mono">Total de Venta:</span>
                      <span className="text-base sm:text-lg font-bold font-mono text-[#5B3289]">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(order.totalZeni)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label htmlFor={`status-${order.id}`} className="text-[10px] text-[#5E5C78] font-ui">
                        Envío:
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs font-ui bg-white border border-[#E2DFF5] rounded-lg px-2 py-1 text-[#1A1228] focus:outline-none focus:border-[#5B3289] cursor-pointer"
                      >
                        <option value="despachado">Despachado</option>
                        <option value="en_camino">En camino</option>
                        <option value="entregado">Entregado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción de la Orden */}
                <div className="pt-2 border-t border-[#E2DFF5]/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="text-[11px] font-ui text-[#5B3289] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <span>{isExpanded ? '▲ Ocultar' : '▼ Ver'} desglose de productos ({order.items.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendEmail(order)}
                      className="text-[11px] font-ui text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
                    >
                      <span>✉️</span>
                      <span>Enviar Comprobante (Resend)</span>
                    </button>

                    {emailStatus[order.id] && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {emailStatus[order.id]}
                      </span>
                    )}
                  </div>

                  {order.stripeSessionId && (
                    <span className="text-[10px] font-mono text-gray-400">
                      Stripe ID: {order.stripeSessionId.slice(0, 14)}...
                    </span>
                  )}
                </div>

                {/* Acordeón de Productos Comprados */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#E2DFF5] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-white border border-[#E2DFF5] flex items-center gap-2.5"
                      >
                        <div className="relative w-10 h-10 bg-gray-100 rounded-lg p-0.5 shrink-0 overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="40px"
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">💊</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#1A1228] truncate">{item.name}</p>
                          <p className="text-[11px] font-mono text-[#5E5C78]">
                            {item.quantity}x {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
        </>
      )}

    </div>
  );
}
