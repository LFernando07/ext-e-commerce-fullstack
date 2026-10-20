'use client';

/**
 * @file app/personajes/[id]/error.tsx
 * @description Segmento especial de Next.js para captura de errores en tiempo de ejecución (Error Boundary).
 * 
 * @concept Next.js Special File: error.tsx, React Error Boundaries, Client Recovery with reset()
 * 
 * Reglas de Next.js para error.tsx:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. DEBE ser un Client Component ('use client') porque maneja interactividad del usuario para recuperarse.
 * 2. Recibe automáticamente dos props:
 *    - `error`: Instancia de Error (con propiedad opcional `.digest` generada por Next.js para telemetría).
 *    - `reset`: Función que reintenta renderizar el segmento de la ruta en el servidor.
 * 3. Aíslan el fallo: Si este personaje falla, la barra de navegación superior y el resto de la app
 *    siguen funcionando perfectamente sin pantalla blanca.
 */

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CharacterError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[personajes/[id]/error.tsx] Error capturado en ruta dinámica:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#131722] border border-red-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* Glow de alerta roja */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center text-3xl border border-red-500/30">
          💥
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block mb-1">
            Falla de Scouter • Next.js error.tsx
          </span>
          <h2 className="font-display font-bold text-2xl text-white">
            Sobrecarga de Nivel de Ki
          </h2>
        </div>

        <p className="text-xs text-gray-300 font-body leading-relaxed">
          Ocurrió un error inesperado al leer los datos del guerrero desde los satélites de Capsule Corp.
          {error.digest && (
            <span className="block mt-2 font-mono text-[11px] text-gray-500">
              Digest ID: {error.digest}
            </span>
          )}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {/* Botón de reintento usando la función nativa reset() de Next.js */}
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-gray-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/20"
          >
            <span>🔄</span>
            <span>Reintentar Lectura (reset)</span>
          </button>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-xs transition-colors border border-white/10 flex items-center justify-center"
          >
            Volver a la Tienda
          </Link>
        </div>

      </div>
    </div>
  );
}
