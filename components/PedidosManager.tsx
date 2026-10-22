'use client';

import React from 'react';
import { PedidoEstado } from '@/types/api';
import { ordersService } from '@/services/orders.service';
import { useOrders } from '@/app/hooks/useOrders';

export default function PedidosManager() {
  const {
    pedidos,
    setPedidos,
    loading,
    setLoading,
    filterEstado,
    setFilterEstado,
    actionLoading,
    setActionLoading,
    isFormOpen,
    setIsFormOpen,
    pedidoForm,
    setPedidoForm,
    fetchPedidos,
  } = useOrders();

  // 2. POST: Crear nuevo pedido a plazos utilizando `api.post`
  const handleCreatePedido = async (e: React.FormEvent) => {
    e.preventDefault();
    const { clienteNombre, concepto, monto, plazos } = pedidoForm;
    if (!clienteNombre || !concepto || !monto) return;

    try {
      setActionLoading(true);

      // ordersService.createPedido con validación estricta del body
      const res = await ordersService.createPedido({
        clienteNombre,
        concepto,
        monto: Number(monto),
        plazosQuincenas: Number(plazos),
      });

      // Actualizar estado local inmediatamente
      setPedidos((prev) => [res.data, ...prev]);
      setIsFormOpen(false);
      setPedidoForm({
        clienteNombre: '',
        concepto: '',
        monto: '',
        plazos: '4',
      });
    } catch (err: unknown) {
      alert(`Error al crear pedido: ${ (err as Error).message }`);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. PUT: Actualizar estado del pedido utilizando `ordersService.updatePedido`
  const handleUpdateEstado = async (id: string, nuevoEstado: PedidoEstado) => {
    try {
      setActionLoading(true);

      const res = await ordersService.updatePedido({
        id,
        estado: nuevoEstado,
      });

      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? res.data : p))
      );
    } catch (err: unknown) {
      alert(`Error al actualizar pedido: ${ (err as Error).message }`);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. DELETE: Cancelar o eliminar pedido utilizando `ordersService.deletePedido`
  const handleDeletePedido = async (id: string) => {
    if (!confirm('¿Deseas cancelar y eliminar este pedido a plazos?')) return;

    try {
      setActionLoading(true);

      await ordersService.deletePedido(id);

      setPedidos((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(`Error al eliminar pedido: ${ (err as Error).message }`);
    } finally {
      setActionLoading(false);
    }
  };

  // Badges por estado según Brand Guidelines
  const getEstadoBadge = (estado: PedidoEstado) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-[#51BDC6]/15 text-[#00A4BF] border-[#51BDC6]/30';
      case 'pendiente':
        return 'bg-[#F7A914]/20 text-[#1A1228] border-[#F7A914]/40 font-bold';
      case 'en_entrega':
        return 'bg-[#5B3289]/15 text-[#5B3289] border-[#5B3289]/30';
      case 'completado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelado':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFF5] shadow-sm space-y-6">
      
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DFF5] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1A1228]">
              Gestión de Pedidos a Plazos
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#5E5C78] mt-1">
            Módulo interactivo que demuestra las llamadas <strong>GET, POST, PUT, DELETE</strong> con <code className="bg-[#FAF9FF] px-1 py-0.5 rounded border border-[#E2DFF5] text-[#5B3289] font-mono">api-client.ts</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="self-start sm:self-center px-4 py-2.5 rounded-full bg-[#5B3289] hover:bg-[#302768] text-white font-ui font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {isFormOpen ? '✕ Cancelar' : '+ Nuevo Pedido (POST)'}
        </button>
      </div>

      {/* Formulario Desplegable para POST */}
      {isFormOpen && (
        <form
          onSubmit={handleCreatePedido}
          className="p-5 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5] space-y-4 animate-in fade-in"
        >
          <div className="font-ui font-semibold text-xs text-[#5B3289] uppercase tracking-wider">
            Crear nuevo pedido a plazos (api.post)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-ui font-medium text-[#1A1228] mb-1">
                Nombre de la clienta
              </label>
              <input
                type="text"
                required
                value={pedidoForm.clienteNombre}
                onChange={(e) => setPedidoForm({...pedidoForm, clienteNombre: e.target.value})}
                placeholder="Ej. Carmen Ortiz"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DFF5] bg-white text-xs font-body text-[#1A1228] focus:outline-none focus:border-[#5B3289]"
              />
            </div>

            <div>
              <label className="block text-xs font-ui font-medium text-[#1A1228] mb-1">
                Concepto / Mercancía
              </label>
              <input
                type="text"
                required
                value={pedidoForm.concepto}
                onChange={(e) => setPedidoForm({...pedidoForm, concepto: e.target.value})}
                placeholder="Ej. 10 Bolsos artesanales"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DFF5] bg-white text-xs font-body text-[#1A1228] focus:outline-none focus:border-[#5B3289]"
              />
            </div>

            <div>
              <label className="block text-xs font-ui font-medium text-[#1A1228] mb-1">
                Monto total ($ MXN)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={pedidoForm.monto}
                onChange={(e) => setPedidoForm({...pedidoForm, monto: e.target.value})}
                placeholder="2500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DFF5] bg-white text-xs font-ui font-semibold text-[#1A1228] focus:outline-none focus:border-[#5B3289]"
              />
            </div>

            <div>
              <label className="block text-xs font-ui font-medium text-[#1A1228] mb-1">
                Plazos en quincenas
              </label>
              <select
                value={pedidoForm.plazos}
                onChange={(e) => setPedidoForm({...pedidoForm, plazos: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DFF5] bg-white text-xs font-ui text-[#1A1228] focus:outline-none focus:border-[#5B3289]"
              >
                <option value="2">2 quincenas</option>
                <option value="4">4 quincenas</option>
                <option value="6">6 quincenas</option>
                <option value="8">8 quincenas</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-full border border-[#E2DFF5] text-xs font-ui text-[#5E5C78] hover:text-[#1A1228] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-full bg-[#5B3289] hover:bg-[#302768] text-white text-xs font-ui font-medium cursor-pointer shadow disabled:opacity-50"
            >
              {actionLoading ? 'Guardando...' : 'Crear pedido'}
            </button>
          </div>
        </form>
      )}

      {/* Barra de Filtros (GET con query params) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-ui">
        <div className="flex items-center gap-2">
          <span className="text-[#5E5C78]">Filtrar por estado:</span>
          {(['todos', 'pendiente', 'aprobado', 'en_entrega', 'completado'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setLoading(true);
                setFilterEstado(st);
              }}
              className={`px-3 py-1 rounded-full border transition-all cursor-pointer capitalize ${
                filterEstado === st
                  ? 'bg-[#5B3289] text-white border-[#5B3289]'
                  : 'bg-white text-[#5E5C78] border-[#E2DFF5] hover:border-[#5B3289]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchPedidos();
          }}
          className="text-xs text-[#5B3289] hover:underline flex items-center gap-1 cursor-pointer"
        >
          🔄 Refrescar (GET)
        </button>
      </div>

      {/* Lista de Pedidos */}
      {loading ? (
        <div className="text-center py-10 text-xs font-ui text-[#5E5C78]">
          <div className="w-6 h-6 border-2 border-[#5B3289] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Cargando pedidos con api.get...
        </div>
      ) : pedidos.length === 0 ? (
        <div className="p-8 text-center text-xs font-body text-[#5E5C78] bg-[#FAF9FF] rounded-2xl border border-[#E2DFF5]">
          No hay pedidos registrados con el filtro seleccionado.
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p) => (
            <div
              key={p.id}
              className="p-4 sm:p-5 rounded-2xl border border-[#E2DFF5] hover:border-[#5B3289]/40 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Información del pedido */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-ui font-bold text-sm text-[#1A1228]">
                    {p.clienteNombre}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${getEstadoBadge(
                      p.estado
                    )}`}
                  >
                    {p.estado}
                  </span>
                  <span className="text-[11px] font-mono text-[#9E9CB8]">
                    #{p.id}
                  </span>
                </div>
                <p className="font-body text-xs text-[#5E5C78]">
                  {p.concepto}
                </p>
                <div className="text-[11px] font-ui text-[#9E9CB8] pt-0.5">
                  Fecha: {new Date(p.fechaCreacion).toLocaleDateString('es-MX')} • Plazo: {p.plazosQuincenas} quincenas de ${p.montoQuincenal.toLocaleString('es-MX')} MXN
                </div>
              </div>

              {/* Monto y Controles (PUT / DELETE) */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-base font-bold font-ui text-[#1A1228] block">
                    ${p.monto.toLocaleString('es-MX')}{' '}
                    <span className="text-[10px] font-normal text-[#5E5C78]">MXN</span>
                  </span>
                </div>

                {/* Acciones PUT y DELETE */}
                <div className="flex items-center gap-2">
                  {/* Selector rápido de estado (PUT) */}
                  <select
                    value={p.estado}
                    disabled={actionLoading}
                    onChange={(e) => handleUpdateEstado(p.id, e.target.value as PedidoEstado)}
                    className="text-xs font-ui px-2.5 py-1.5 rounded-lg border border-[#E2DFF5] bg-[#FAF9FF] text-[#1A1228] cursor-pointer focus:outline-none focus:border-[#5B3289]"
                    title="Actualizar estado (PUT)"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="en_entrega">En entrega</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>

                  {/* Botón eliminar (DELETE) */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleDeletePedido(p.id)}
                    className="w-8 h-8 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer text-xs"
                    title="Eliminar pedido (DELETE)"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
