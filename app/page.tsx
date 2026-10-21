/**
 * @file app/page.tsx
 * @description Landing Page y E-Commerce principal de Capsule Corp con guerreros de Dragon Ball Z.
 *
 * @concept Next.js Server Component, Partial Prerendering (PPR), Data Cache, searchParams Pagination
 *
 * 🎓 CONCEPTOS CLAVE IMPLEMENTADOS EN ESTA PÁGINA:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Partial Prerendering (PPR) con searchParams:
 *    - La página exporta un cascarón estático instantáneo (Hero, estructura, matriz educativa).
 *    - El catálogo con paginación (`<PaginatedCatalog />`) se envuelve en `<Suspense>`,
 *      permitiendo resolver `searchParams` dinámicamente sin degradar el cascarón estático.
 *
 * 2. Next.js Data Cache con ISR:
 *    - Las llamadas a la API de Dragon Ball están taggeadas con `['dbz-characters', 'dbz-page-[num]']`.
 *
 * 3. Telemetría Dual en Vivo (PPR Streaming):
 *    - `<LiveCapsuleMetrics />` (Server Actions y pedidos).
 *    - `<LandingKPIs />` (Google Analytics 4 Data API).
 */

import React, { Suspense } from "react";
import Link from "next/link";
import PaginatedCatalog, {
  CatalogSkeleton,
} from "@/components/dbz/PaginatedCatalog";
import LiveCapsuleMetrics from "@/components/dbz/LiveCapsuleMetrics";
import LandingKPIs from "@/components/LandingKPIs";
import ScrollTracker from "@/components/ScrollTracker";
import { SearchParamsProps } from "@/types/general";

export default function HomePage({ searchParams }: SearchParamsProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0D14] text-white selection:bg-cyan-500/30 selection:text-white">
      {/* ── 1. HERO SECTION: CAPSULE CORP E-COMMERCE ── */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        {/* Glows ambientales temáticos (Cyan Saiyajin & Purple God Ki) */}
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -z-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-6">
          {/* Badge superior de tecnología */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-mono shadow-sm">
            <span>💊</span>
            <span>
              Tecnología Hoi-Poi de Capsule Corp • 58 Guerreros en la DBZ API
            </span>
          </div>

          {/* Titular Principal */}
          <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Comprime y colecciona guerreros Z en{" "}
            <span className="text-cyan-400">cápsulas Hoi-Poi</span>.
          </h1>

          {/* Subtítulo */}
          <p className="font-body text-gray-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Explora el catálogo oficial potenciado por Next.js 16. Compra en
            <strong className="text-cyan-300"> Pesos Mexicanos (MXN)</strong> con tarjeta vía <strong className="text-indigo-400">Stripe</strong> o efectivo, experimenta mutaciones instantáneas con
            <strong className="text-cyan-300 font-mono">
              {" "}
              Server Actions
            </strong>{" "}
            y <strong className="text-cyan-300 font-mono">useOptimistic</strong>
            , navega con{" "}
            <strong className="text-cyan-300 font-mono">searchParams</strong> y{" "}
            <strong className="text-cyan-300 font-mono">
              generateStaticParams
            </strong>
            .
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#catalogo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all active:scale-[0.98] text-center"
            >
              Explorar Catálogo de Cápsulas (58 guerreros)
            </a>
            <Link
              href="/cache-demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-white/20 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10 text-white font-medium text-sm sm:text-base transition-colors text-center font-mono flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              <span>Laboratorio de Caché</span>
            </Link>
          </div>

          {/* Tarjeta de Especificación Técnica Flotante */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl bg-[#131722]/80 border border-white/10 backdrop-blur-md shadow-2xl text-left grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-500 uppercase text-[10px] block">
                  Paginación
                </span>
                <span className="text-cyan-400 font-bold text-sm">
                  searchParams URL
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-500 uppercase text-[10px] block">
                  Mutaciones
                </span>
                <span className="text-emerald-400 font-bold text-sm">
                  Server Actions
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-500 uppercase text-[10px] block">
                  React 19 State
                </span>
                <span className="text-purple-400 font-bold text-sm">
                  useOptimistic
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-500 uppercase text-[10px] block">
                  Rutas Dinámicas
                </span>
                <span className="text-amber-400 font-bold text-sm">
                  SSG + ISR
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SECCIÓN DINÁMICA PPR: TELEMETRÍA EN VIVO (GA4 + CAPSULE CORP) ── */}
      <section className="py-10 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-8">
        {/* Bloque A: Telemetría de Pedidos y Server Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                Telemetría Capsule Corp en Vivo (PPR Streaming)
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
              Inyectado vía Suspense & await connection()
            </span>
          </div>

          {/* PPR */}
          <Suspense
            fallback={
              <div className="h-32 rounded-2xl bg-[#131722] border border-cyan-500/20 p-6 flex items-center justify-center animate-pulse text-xs font-mono text-gray-400">
                Conectando satélite con Capsule Corp...
              </div>
            }
          >
            <LiveCapsuleMetrics />
          </Suspense>
        </div>

        {/* Bloque B: Métricas en Vivo de Google Analytics 4 (GA4) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">📈</span>
              <span className="text-xs font-mono text-purple-400 font-semibold uppercase tracking-wider">
                Métricas Reales de Google Analytics 4 (GA4 Data API)
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
              PPR Dynamic Slot: GA4 Realtime
            </span>
          </div>

          {/* PPR tambien */}
          <Suspense
            fallback={
              <div className="h-28 rounded-2xl bg-[#131722] border border-white/10 p-6 flex items-center justify-center animate-pulse text-xs font-mono text-gray-400">
                Consultando métricas de Google Analytics 4...
              </div>
            }
          >
            <LandingKPIs />
          </Suspense>
        </div>
      </section>

      {/* ── 3. CATÁLOGO E-COMMERCE DE GUERREROS Z CON PAGINACIÓN EN SUSPENSE ── */}
      <section
        className="py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full flex-1"
        id="catalogo"
      >
        {/* PPR */}
        <Suspense fallback={<CatalogSkeleton />}>
          <PaginatedCatalog searchParams={searchParams} />
        </Suspense>
      </section>

      {/* ── 4. GUÍA EDUCATIVA: MATRIZ DE CONCEPTOS NEXT.JS ── */}
      <section className="py-16 px-4 sm:px-6 bg-[#0E121C] border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Dominio Completo del Stack
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              Conceptos de Next.js Implementados en este Proyecto
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-body">
              Cada pantalla y componente fue diseñado para servir como
              referencia viva de las mejores prácticas de Next.js.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
            {/* Tarjeta 1: Server Actions */}
            <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
              <span className="text-emerald-400 font-bold block text-sm">
                1. Server Actions {`(use server)`}
              </span>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Ubicadas en{" "}
                <code className="text-white">app/actions/cart.ts</code>.
                Procesan pedidos de compra directamente en el servidor sin
                endpoints REST manuales y ejecutan revalidación.
              </p>
            </div>

            {/* Tarjeta 2: useOptimistic & useActionState */}
            <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
              <span className="text-cyan-400 font-bold block text-sm">
                2. useActionState & useOptimistic
              </span>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Ubicados en{" "}
                <code className="text-white">
                  components/dbz/CartDrawer.tsx
                </code>
                . Dan respuesta visual instantánea a la UI y manejan el ciclo de
                vida del formulario.
              </p>
            </div>

            {/* Tarjeta 3: generateStaticParams */}
            <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
              <span className="text-purple-400 font-bold block text-sm">
                3. Dynamic Routes + SSG
              </span>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                En{" "}
                <code className="text-white">app/personajes/[id]/page.tsx</code>
                . Pre-genera los primeros 10 guerreros en build time y resuelve
                los demás dinámicamente.
              </p>
            </div>

            {/* Tarjeta 4: Special Segment Files */}
            <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
              <span className="text-amber-400 font-bold block text-sm">
                4. loading, error & not-found
              </span>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Archivos especiales en{" "}
                <code className="text-white">app/personajes/[id]/</code>.
                Proveen Streaming Skeleton, Error Boundary cliente con reset() y
                404 semántico.
              </p>
            </div>

            {/* Tarjeta 5: next/image */}
            <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
              <span className="text-blue-400 font-bold block text-sm">
                5. next/image & remotePatterns
              </span>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Configurado en{" "}
                <code className="text-white">next.config.ts</code>. Optimiza
                imágenes desde la API de Dragon Ball con prevención de CLS y
                lazy loading.
              </p>
            </div>

            {/* Tarjeta 6: Middleware */}
            <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
              <span className="text-pink-400 font-bold block text-sm">
                6. Edge Middleware
              </span>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                En <code className="text-white">middleware.ts</code>. Intercepta
                todas las peticiones en el Edge, inyecta identificadores de
                sesión y headers de telemetría.
              </p>
            </div>

            {/* Tarjeta 7: Paginación por URL searchParams */}
            <div className="p-5 rounded-2xl bg-[#131722] border border-cyan-500/30 space-y-2 md:col-span-2 lg:col-span-3">
              <span className="text-cyan-300 font-bold block text-sm">
                7. Paginación Server-Side (searchParams & Data Cache Granular)
              </span>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                En{" "}
                <code className="text-white">
                  components/dbz/Pagination.tsx
                </code>
                . Divide los 58 guerreros en páginas mediante URLs estándar (
                <code className="text-cyan-300">/?page=2#catalogo</code>).
                Ofrece URLs compartibles, soporte para indexación SEO por
                Googlebot, navegación sin JavaScript (Progressive Enhancement) y
                tags de caché por página (
                <code className="text-white">dbz-page-[num]</code>).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rastreador de Scroll para Analítica */}
      <ScrollTracker />
    </div>
  );
}
