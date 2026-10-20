/**
 * @file app/personajes/[id]/loading.tsx
 * @description Segmento especial de Next.js para Streaming y Suspense instantáneo.
 * 
 * @concept Next.js Special File: loading.tsx, Instant Loading States, Streaming SSR
 * 
 * ¿Cómo funciona loading.tsx en Next.js App Router?
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js automáticamente envuelve el contenido de `page.tsx` dentro de un `<Suspense fallback={<Loading />}>`.
 * En cuanto el usuario hace clic en el enlace, Next.js:
 * 1. Envía de inmediato el layout existente y este componente `loading.tsx` desde el servidor (0ms).
 * 2. En segundo plano (streaming), resuelve el fetch de datos asíncrono en `page.tsx`.
 * 3. En cuanto los datos están listos, reemplaza este esqueleto con el contenido real sin recargar la página.
 */

export default function CharacterLoading() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-48 bg-white/10 rounded-md" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Skeleton de Imagen con Aura de Ki */}
          <div className="relative h-96 rounded-3xl bg-[#131722] border border-cyan-500/20 p-8 flex items-center justify-center overflow-hidden">
            <div className="w-48 h-72 bg-white/5 rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent" />
            <span className="absolute bottom-4 font-mono text-xs text-cyan-400">
              Escaneando Ki con Scouter...
            </span>
          </div>

          {/* Skeleton de Atributos y Compra */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-cyan-500/30 rounded-full" />
              <div className="h-10 w-3/4 bg-white/20 rounded-xl" />
              <div className="h-4 w-1/2 bg-white/10 rounded-md" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-[#131722] rounded-xl border border-white/5" />
              <div className="h-20 bg-[#131722] rounded-xl border border-white/5" />
              <div className="h-20 bg-[#131722] rounded-xl border border-white/5" />
              <div className="h-20 bg-[#131722] rounded-xl border border-white/5" />
            </div>

            <div className="h-24 bg-white/5 rounded-2xl" />
            <div className="h-14 bg-cyan-500/30 rounded-2xl" />
          </div>

        </div>

      </div>
    </div>
  );
}
