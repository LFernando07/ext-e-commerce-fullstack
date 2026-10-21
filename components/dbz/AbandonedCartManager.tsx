'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface CartItemData {
  productId?: number;
  id?: number;
  name: string;
  quantity: number;
  unitPrice?: number;
  priceInZeni?: number;
}

interface AbandonedCart {
  id: string;
  email: string;
  customerName: string;
  items: CartItemData[];
  totalZeni: number;
  recoveryToken: string;
  status: string; // 'active' | 'abandoned' | 'recovered'
  emailSent: boolean;
  emailSentAt: string | null;
  createdAt: string;
}

export default function AbandonedCartManager() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const fetchCarts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/cart/abandoned');
      const data = await res.json();
      if (data.success) {
        setCarts(data.carts || []);
      } else {
        setError(data.error || 'Error al obtener carritos');
      }
    } catch {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/cart/abandoned');
        const data = await res.json();
        if (!ignore) {
          if (data.success) {
            setCarts(data.carts || []);
          } else {
            setError(data.error || 'Error al obtener carritos');
          }
        }
      } catch {
        if (!ignore) setError('Error al conectar con el servidor.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Enviar correo de recordatorio para un carrito existente
  const handleSendReminder = async (cart: AbandonedCart) => {
    const targetEmail = prompt(
      `Confirmar correo para enviar recordatorio de recuperación (Resend):`,
      cart.email
    );
    if (!targetEmail || !targetEmail.includes('@')) return;

    setSendingId(cart.id);
    setFeedback(null);

    try {
      const res = await fetch('/api/cart/abandoned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          customRecipient: targetEmail,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback(`✅ Correo de recuperación enviado a ${targetEmail}`);
        fetchCarts();
      } else {
        setFeedback(`❌ Error: ${data.error || 'Fallo el envío'}`);
      }
    } catch {
      setFeedback('❌ Error de comunicación con la API de Resend.');
    } finally {
      setSendingId(null);
    }
  };

  // Simular un carrito abandonado de prueba con 1 solo clic
  const handleSimulateCart = async () => {
    const testEmail = prompt(
      'Ingresa tu correo para recibir el recordatorio de Carrito Abandonado de Capsule Corp:',
      'tu-correo@resend.dev'
    );
    if (!testEmail || !testEmail.includes('@')) return;

    setSimulating(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/cart/abandoned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          customerName: 'Bulma Brief',
          items: [
            {
              name: 'Cápsula Hoi-Poi Moto Voladora No. 9',
              quantity: 1,
              unitPrice: 1250,
            },
            {
              name: 'Cápsula Hoi-Poi Refugio Portátil Capsule Corp',
              quantity: 2,
              unitPrice: 850,
            },
          ],
          totalZeni: 2950,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback(
          `🚀 ¡Carrito simulado y correo enviado a ${testEmail}! Enlace: ${data.recoveryUrl}`
        );
        fetchCarts();
      } else {
        setFeedback(`❌ Error al simular: ${data.error}`);
      }
    } catch {
      setFeedback('❌ Error al procesar la simulación.');
    } finally {
      setSimulating(false);
    }
  };

  const copyRecoveryLink = (token: string) => {
    const url = `${window.location.origin}/?recover_cart=${token}`;
    navigator.clipboard.writeText(url);
    setFeedback(`📋 Enlace copiado al portapapeles: ${url}`);
  };

  return (
    <div className="bg-[#FAF9FF] rounded-2xl p-5 border border-[#E2DFF5] space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DFF5] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold mb-1">
            <span>🛒⚡</span> Recuperación de Ventas • Resend Transaccional
          </div>
          <h3 className="text-lg font-bold font-display text-[#1A1228]">
            Carritos Abandonados Hoi-Poi
          </h3>
          <p className="text-xs text-[#5E5C78]">
            Identifica clientes que no concluyeron su checkout y envíales un correo con cupón del 10% y enlace directo de restauración.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateCart}
            disabled={simulating}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{simulating ? '⏳' : '🚀'}</span>
            <span>Simular Carrito de Prueba</span>
          </button>

          <button
            type="button"
            onClick={() => fetchCarts()}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E2DFF5] hover:border-[#5B3289] text-[#1A1228] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-white border border-[#E2DFF5] text-xs text-[#1A1228] font-medium shadow-sm flex items-center justify-between gap-2">
          <span className="truncate">{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 text-sm ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Lista de Carritos Abandonados */}
      {loading ? (
        <div className="text-center py-8 text-xs text-[#5E5C78]">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Consultando carritos en Supabase...
        </div>
      ) : error ? (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          ⚠️ {error}
        </div>
      ) : carts.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-[#E2DFF5] bg-white text-xs text-[#5E5C78] space-y-1">
          <p className="font-semibold text-[#1A1228]">No hay carritos abandonados registrados aún</p>
          <p>
            Usa el botón <strong>&quot;Simular Carrito de Prueba&quot;</strong> para crear uno y recibir el correo de recuperación en tu bandeja de Resend.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {carts.map((cart) => {
            const itemsList = Array.isArray(cart.items) ? cart.items : [];
            const isSending = sendingId === cart.id;

            return (
              <div
                key={cart.id}
                className="p-3.5 rounded-xl bg-white border border-[#E2DFF5] hover:border-amber-400/50 transition-all space-y-2.5 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1A1228]">
                        {cart.customerName}
                      </span>
                      <span className="text-[11px] font-mono text-[#5E5C78]">
                        &lt;{cart.email}&gt;
                      </span>
                      {cart.status === 'recovered' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          🎉 Recuperado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                          ⏳ Abandonado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5E5C78] mt-0.5">
                      Registrado: {new Date(cart.createdAt).toLocaleString('es-MX')} • {itemsList.length} producto(s)
                    </p>
                  </div>

                  <div className="text-right flex items-center sm:flex-col sm:items-end justify-between sm:justify-center">
                    <span className="text-[10px] text-[#5E5C78] font-mono">Total Pendiente:</span>
                    <span className="text-sm font-bold font-mono text-amber-600">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cart.totalZeni)}
                    </span>
                  </div>
                </div>

                {/* Desglose de ítems */}
                <div className="p-2 rounded-lg bg-[#FAF9FF] border border-[#E2DFF5]/60 text-xs text-[#1A1228] flex flex-wrap gap-2">
                  {itemsList.map((it, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-[#E2DFF5] text-[11px]"
                    >
                      {it.name} <strong className="text-amber-700">({it.quantity}x)</strong>
                    </span>
                  ))}
                </div>

                {/* Acciones */}
                <div className="pt-2 border-t border-[#E2DFF5]/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendReminder(cart)}
                      disabled={isSending}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <span>✉️</span>
                      <span>{isSending ? 'Enviando...' : 'Enviar Recordatorio (Resend)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyRecoveryLink(cart.recoveryToken)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>🔗</span>
                      <span>Copiar Enlace Directo</span>
                    </button>
                  </div>

                  {cart.emailSent && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Correo enviado {cart.emailSentAt ? `(${new Date(cart.emailSentAt).toLocaleTimeString('es-MX')})` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
