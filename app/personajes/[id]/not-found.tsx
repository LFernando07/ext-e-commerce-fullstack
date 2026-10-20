/**
 * @file app/personajes/[id]/not-found.tsx
 * @description Segmento especial de Next.js renderizado cuando se invoca notFound().
 * 
 * @concept Next.js Special File: not-found.tsx, HTTP 404 Handling, notFound() Navigation
 * 
 * ¿Cuándo se activa not-found.tsx?
 * ─────────────────────────────────────────────────────────────────────────────
 * Cuando en `page.tsx` llamamos explícitamente a `notFound()` de `next/navigation`
 * (por ejemplo si el ID no existe en la API de Dragon Ball o fue borrado).
 * Next.js detiene el renderizado normal de la página y sirve este componente con código HTTP 404.
 */

import Link from 'next/link';

export default function CharacterNotFound() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#131722] border border-amber-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative">
        
        {/* Radar Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-3xl border border-amber-500/30">
          📡
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
            Coordenadas Vacías • Next.js not-found.tsx
          </span>
          <h2 className="font-display font-bold text-2xl text-white">
            Guerrero No Detectado
          </h2>
        </div>

        <p className="text-xs text-gray-300 font-body leading-relaxed">
          El Radar del Dragón y los sensores de Capsule Corp no encontraron ninguna señal de Ki en este identificador.
          Es posible que el guerrero se encuentre en otra dimensión o haya sido eliminado.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            <span>🧭</span>
            <span>Explorar Guerreros Disponibles</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
