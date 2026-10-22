'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { sentryService } from '@/services/sentry.service';

export default function SentryTestPage() {
  const [clientStatus, setClientStatus] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [loadingServer, setLoadingServer] = useState(false);

  const handleClientError = () => {
    try {
      throw new Error('💥 [Client Error] Prueba desde el navegador de Capsule Corp hacia Sentry');
    } catch (err) {
      const id = Sentry.captureException(err);
      setClientStatus(`✅ Evento de cliente enviado con ID: ${id || 'OK'}`);
    }
  };

  const handleServerError = async () => {
    setLoadingServer(true);
    setServerStatus(null);
    try {
      const data = await sentryService.triggerServerError();
      setServerStatus(
        data.success
          ? `✅ Evento de servidor enviado con ID: ${data.eventId}`
          : `❌ Fallo: ${data.error || 'Desconocido'}`
      );
    } catch (err) {
      setServerStatus(`❌ Error conectando: ${(err as Error).message}`);
    } finally {
      setLoadingServer(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 text-3xl mb-4 border border-purple-500/20">
          🛡️
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight mb-2">
          Sentry Monitor Testing
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Organización: <span className="text-purple-400 font-semibold">zenithenterprice</span>
          <br />
          Proyecto: <span className="text-purple-400 font-semibold">ext-e-commerce-fullstack-public</span>
        </p>

        <div className="space-y-4">
          <button
            onClick={handleClientError}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white font-semibold rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
          >
            <span>⚡ Disparar Error de Cliente (Browser)</span>
          </button>
          {clientStatus && (
            <p className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 p-2 rounded-lg">
              {clientStatus}
            </p>
          )}

          <button
            onClick={handleServerError}
            disabled={loadingServer}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <span>{loadingServer ? 'Enviando...' : '🖥️ Disparar Error de Servidor (Node.js)'}</span>
          </button>
          {serverStatus && (
            <p className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 p-2 rounded-lg">
              {serverStatus}
            </p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-500">
          Revisa tu dashboard en <strong className="text-slate-400">zenithenterprice.sentry.io</strong> para ver la gráfica y el issue en tiempo real.
        </div>
      </div>
    </div>
  );
}
